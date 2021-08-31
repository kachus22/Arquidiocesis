import * as React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { downloadFile } from '../../lib/Files';

function ChatChannelAttachment({
  size,
  attachment,
  onDelete,
  isFileDownloadable = true,
  style,
}) {
  const sizeStyle = { width: size, height: size };
  const { type, uri, fileName, thumbnail } = attachment;
  const splittedFilename = (fileName ?? '').split('.');
  const docType = splittedFilename[splittedFilename.length - 1];
  const { navigate } = useNavigation();

  const onPress = async () => {
    if (type === 'document') {
      if (isFileDownloadable) {
        await downloadFile(uri);
      }
    } else if (type === 'image') {
      navigate('ImageViewer', { image: uri });
    } else {
      navigate('VideoViewer', { uri });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.root,
        sizeStyle,
        style,
        { backgroundColor: type === 'document' ? '#C2C2C2' : 'transparent' },
      ]}
      activeOpacity={!isFileDownloadable && type === 'document' ? 1.0 : 0.2}
      onPress={onPress}>
      {type === 'document' ? (
        <View style={styles.documentContainer}>
          <View style={styles.documentIcon}>
            <FontAwesome5 name="file" size={48} color="#5F5F5F" solid />
            <Text style={styles.docTypeLabel}>{docType.toUpperCase()}</Text>
          </View>
          <Text style={styles.documentLabel} numberOfLines={1}>
            {fileName}
          </Text>
        </View>
      ) : (
        <>
          <Image
            style={[styles.image, sizeStyle]}
            source={{ uri: thumbnail ?? uri }}
          />
          <View style={styles.overlay}>
            {type === 'video' && (
              <FontAwesome5 name="play-circle" size={24} color="white" solid />
            )}
          </View>
        </>
      )}
      {onDelete && (
        <TouchableOpacity style={styles.cross} onPress={onDelete}>
          <FontAwesome5 name="times" size={12} color="red" solid />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

ChatChannelAttachment.propTypes = {
  size: PropTypes.number.isRequired,
  attachment: PropTypes.shape({
    type: PropTypes.oneOf(['image', 'video', 'document']).isRequired,
    uri: PropTypes.string.isRequired,
    fileName: PropTypes.string,
    thumbnail: PropTypes.string,
    isFileDownloadable: PropTypes.bool,
  }).isRequired,
  onDelete: PropTypes.func,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  root: {
    borderRadius: 8,
    margin: 8,
  },
  image: {
    borderRadius: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cross: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      {
        translateX: 6,
      },
      { translateY: -6 },
    ],
  },
  documentContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentLabel: {
    fontWeight: 'bold',
    color: '#5F5F5F',
    marginBottom: 6,
    width: '90%',
    textAlign: 'center',
  },
  docTypeLabel: {
    fontSize: 10,
    color: 'white',
    transform: [
      {
        translateY: -20,
      },
    ],
  },
});

export default React.memo(ChatChannelAttachment);
