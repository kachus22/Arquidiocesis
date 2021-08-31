import * as React from 'react';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationProps } from '../navigation/NavigationPropTypes';
import { Video } from 'expo-av';

function VideoViewer({ navigation, route }) {
  const video = useRef(null);
  const { uri } = route.params;

  navigation.setOptions({
    title: 'Video',
  });

  return (
    <View style={styles.root}>
      <Video
        ref={video}
        style={styles.video}
        source={{ uri }}
        useNativeControls
        resizeMode="contain"
      />
    </View>
  );
}

VideoViewer.propTypes = {
  ...NavigationProps,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  videoContainer: {
    flex: 1,
    resizeMode: 'contain',
    aspectRatio: 1,
    alignSelf: 'center',
  },
  video: {
    width: '100%',
  },
});

export default React.memo(VideoViewer);
