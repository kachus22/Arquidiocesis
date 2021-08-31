import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

export default (props) => {
  return (
    <TouchableOpacity
      onPress={() => {
        if (props.loading) return;
        if (props.onPress) props.onPress();
      }}>
      <View
        style={[
          styles.container,
          props.style,
          { backgroundColor: props.color || '#002E60' },
        ]}>
        {props.loading ? (
          <ActivityIndicator size={'small'} color="white" />
        ) : (
          <Text style={styles.label}>{props.text}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    backgroundColor: 'red',
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  label: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});
