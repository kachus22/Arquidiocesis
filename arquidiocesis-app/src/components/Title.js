import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default (props) => {
  return <Text style={styles.header}>{props.text}</Text>;
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
});
