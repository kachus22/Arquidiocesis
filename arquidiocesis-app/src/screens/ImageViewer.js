import * as React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { NavigationProps } from '../navigation/NavigationPropTypes';

function ImageViewer({ navigation, route }) {
  const { image } = route.params;

  navigation.setOptions({
    title: 'Imagen',
  });

  return (
    <View style={styles.root}>
      <Image style={styles.image} source={{ uri: image }} />
    </View>
  );
}

ImageViewer.propTypes = {
  ...NavigationProps,
};

const styles = new StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black',
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
    aspectRatio: 1,
  },
});

export default React.memo(ImageViewer);
