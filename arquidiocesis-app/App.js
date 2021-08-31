import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Arquidiocesis from './src/Arquidiocesis';

console.disableYellowBox = true;

var style = Platform.select({
  web: {
    maxWidth: 500,
    margin: 'auto',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});

export default function App() {
  return (
    <View style={[StyleSheet.absoluteFillObject, style]}>
      <Arquidiocesis />
    </View>
  );
}
