import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROOT_URL } from './apiV2/APIv2';
import { Platform } from 'react-native';
import Alert from '../components/Alert';
import { v4 as uuid } from 'uuid';
import { getThumbnails } from 'video-metadata-thumbnails';

/**
 * @returns {Promise<{uri: string, file: File} | null>}
 */
export async function requestDocument() {
  const doc = await DocumentPicker.getDocumentAsync({ type: '*/*' });
  if (doc.type === 'cancel' || doc.file == null) {
    return null;
  }

  if (doc.file.type.includes('image') || doc.file.type.includes('video')) {
    return null;
  }

  return {
    uri: doc.uri,
    file: doc.file,
  };
}

/**
 * @returns {Promise<{file: File, fileName: string, base64: string, type: string, thumbnail: string, thumbnailBlob: File} | null>}
 */
export async function requestMedia() {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Error',
        'Se necesita permiso a la galería para seleccionar un archivo.'
      );
      return null;
    }
  }

  const img = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.85,
    base64: true,
  });

  if (img.cancelled) {
    return null;
  }

  const base64 = img.uri ?? img.base64;
  const blob = await (await fetch(base64)).blob();
  let thumbnail = null;
  let thumbnailBlob = null;

  if (blob.type.includes('video')) {
    const thumbnails = await getThumbnails(blob);
    thumbnail = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(thumbnails[0].blob);
      reader.onloadend = () => resolve(reader.result);
    });
    thumbnailBlob = new File([thumbnails[0].blob], `${uuid()}.jpg`);
  }

  const fileName = `${uuid()}.${blob.type.split('/')[1]}`;
  return {
    file: new File([blob], fileName),
    base64,
    fileName,
    type: blob.type.split('/')[0],
    thumbnail,
    thumbnailBlob,
  };
}

/**
 * @param {File[]} files
 * @returns {Promise<{error: boolean, files: {url: string, fileName: string}[]}>}
 */
export async function uploadFiles(files) {
  const fd = new FormData();
  const { token } = JSON.parse(await AsyncStorage.getItem('login'));

  for (const file of files) {
    fd.append('files', file);
  }

  const res = await fetch(`${ROOT_URL}upload?token=${token}`, {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    return null;
  }

  return await res.json();
}

/**
 * Downloads a file from an URL, assuming it has the following shape:
 * https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${filename}?alt=media
 *
 * @param {string} url
 * @returns {Promise<void>}
 */
export async function downloadFile(url) {
  const res = await fetch(url);
  if (Platform.OS === 'web') {
    const objectURL = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    const splittedURL = url.split('/');
    a.href = objectURL;
    a.download = splittedURL[splittedURL.length - 1].split('?')[0];

    const handler = () =>
      setTimeout(() => {
        URL.revokeObjectURL(objectURL);
        a.removeEventListener('click', handler);
      });

    a.addEventListener('click', handler);
    a.click();
  } else {
    // missing implementation for iOS/Android
  }
}
