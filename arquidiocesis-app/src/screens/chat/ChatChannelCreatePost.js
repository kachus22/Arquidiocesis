import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Button } from '../../components';
import ChatChannelCreatePostOptionRow from '../../components/chat/ChatChannelCreatePostOptionRow';
import { NavigationProps } from '../../navigation/NavigationPropTypes';
import useCurrentUser from '../../lib/apiV2/useCurrentUser';
import PostsAPI from '../../lib/apiV2/PostsAPI';
import { useChannelPostsStore } from '../../context/ChannelPostsStore';
import Alert from '../../components/Alert';
import { requestMedia, requestDocument, uploadFiles } from '../../lib/Files';
import ChatChannelAttachment from '../../components/chat/ChatChannelAttachment';

function ChatChannelCreatePost({ navigation, route }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [screenWidth, setScreenWidth] = useState(500);
  const { channelID, post } = route.params;
  const [, setPosts, editingPostIndex] = useChannelPostsStore();
  const user = useCurrentUser();

  useEffect(() => {
    if (post != null) {
      setText(post.textContent);
      setAttachments(post.attachments);
    }
  }, [post]);

  navigation.setOptions({
    headerTitle: 'Crear Publicación',
  });

  const measureView = (e) => {
    setScreenWidth(e.nativeEvent.layout.width);
  };

  const onAttachmentDelete = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const onCameraPress = async () => {
    const file = await requestMedia();
    if (
      file == null ||
      attachments.find((attachment) => attachment.uri === file.base64)
    ) {
      return;
    }

    setAttachments((prev) =>
      prev.concat({
        uri: file.base64,
        fileName: file.fileName,
        type: file.type,
        file: file.file,
        thumbnail: file.thumbnail,
        thumbnailBlob: file.thumbnailBlob,
      })
    );
  };

  const onFilePress = async () => {
    const doc = await requestDocument();
    if (
      doc == null ||
      attachments.find((attachment) => attachment.uri === doc.uri)
    ) {
      return;
    }

    setAttachments((prev) =>
      prev.concat({
        uri: doc.uri,
        fileName: doc.file.name,
        type: 'document',
        file: doc.file,
        thumbnail: null,
      })
    );
  };

  const onMessageCreatePress = useCallback(async () => {
    if (text === '') {
      Alert.alert(
        'Llenar publicación',
        'Una publicación no puede estar vacía.'
      );
      return;
    }

    setLoading(true);
    if (post == null) {
      // upload files
      const filesRes = await uploadFiles(attachments.map(({ file }) => file));

      if (!filesRes) {
        Alert.alert('Error', 'Hubo un error subiendo los archivos.');
        setLoading(false);
        return;
      }

      // upload thumbnails if present
      const filesWithThumbnails = await Promise.all(
        attachments.map(async (attachment) => {
          if (attachment.thumbnailBlob != null) {
            const thumbnailRes = await uploadFiles([attachment.thumbnailBlob]);
            attachment.thumbnail = thumbnailRes.files[0].url;
          }

          return attachment;
        })
      );

      // post is null, so we're creating a new one
      const files = filesWithThumbnails.map(
        ({ type, fileName, thumbnail }) => ({
          uri: `https://firebasestorage.googleapis.com/v0/b/arquidiocesis-38f49.appspot.com/o/${fileName}?alt=media`,
          type,
          fileName,
          thumbnail,
        })
      );
      const res = await PostsAPI.add({
        text,
        authorID: user.id,
        channelOwnerID: channelID,
        files,
      });

      if (res) {
        setPosts((prev) => [
          {
            id: res.data,
            authorName:
              `${user.nombre} ${user.apellido_paterno} ` +
              (user.apellido_materno ?? ''),
            date: new Date(),
            textContent: text,
            attachments: files,
            commentCount: 0,
          },
          ...prev,
        ]);
        setLoading(false);
      }
    } else {
      // upload new files if they were added
      const newFiles = attachments.filter((attachment) => attachment.file);
      const filesRes = await uploadFiles(newFiles.map(({ file }) => file));

      if (!filesRes) {
        Alert.alert('Error', 'Hubo un error subiendo los archivos.');
        setLoading(false);
        return;
      }

      // upload thumbnails if present
      const filesWithThumbnails = await Promise.all(
        newFiles.map(async (attachment) => {
          if (attachment.thumbnailBlob != null) {
            const thumbnailRes = await uploadFiles([attachment.thumbnailBlob]);
            attachment.thumbnail = thumbnailRes.files[0].url;
          }

          return attachment;
        })
      );

      // post is not null so we're editing an existing one
      const files = [
        ...attachments.filter((attachment) => !attachment.file),
        ...filesWithThumbnails.map(({ type, fileName, thumbnail }) => ({
          uri: `https://firebasestorage.googleapis.com/v0/b/arquidiocesis-38f49.appspot.com/o/${fileName}?alt=media`,
          type,
          fileName,
          thumbnail,
        })),
      ];
      const res = await PostsAPI.edit({
        id: post.id,
        files,
        text,
      });

      if (res) {
        const modifiedIndex = editingPostIndex.current;
        editingPostIndex.current = -1;
        setPosts((prev) =>
          prev.map((curr, idx) =>
            idx === modifiedIndex
              ? {
                  ...curr,
                  ...{
                    textContent: text,
                    attachments: files,
                  },
                }
              : curr
          )
        );
        setLoading(false);
      }
    }

    navigation.goBack();
  }, [text, user, attachments]);

  return (
    <View style={styles.root}>
      <TextInput
        style={styles.input}
        placeholder="Escribir mensaje..."
        value={text}
        onChangeText={(text) => setText(text)}
        multiline={true}
      />

      <View style={styles.separator} />

      <View style={styles.attachmentContainer} onLayout={measureView}>
        {attachments.map((attachment, idx) => (
          <ChatChannelAttachment
            key={idx}
            attachment={attachment}
            size={screenWidth / 3 - 16}
            onDelete={() => onAttachmentDelete(idx)}
            isFileDownloadable={false}
          />
        ))}
      </View>

      {attachments.length > 0 && <View style={styles.separator} />}

      <ChatChannelCreatePostOptionRow
        iconName="camera"
        title="Agregar foto/video"
        onPress={onCameraPress}
      />
      <ChatChannelCreatePostOptionRow
        iconName="paperclip"
        title="Agregar archivo"
        onPress={onFilePress}
        hasTopBorder={false}
      />

      <Button
        style={styles.createButton}
        text={post == null ? 'Nuevo Mensaje' : 'Editar Mensaje'}
        onPress={onMessageCreatePress}
        loading={loading}
      />
    </View>
  );
}

ChatChannelCreatePost.propTypes = {
  ...NavigationProps,
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#EDEDED',
    paddingTop: 10,
    flex: 1,
  },
  input: {
    backgroundColor: 'white',
    height: 160,
    padding: 12,
    outlineWidth: 0,
  },
  separator: {
    height: 12,
    backgroundColor: '#EDEDED',
  },
  createButton: {
    width: 250,
    alignSelf: 'center',
    backgroundColor: '#EDEDED',
  },
  attachmentContainer: {
    width: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
});

export default React.memo(ChatChannelCreatePost);
