import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default (props) => {
  return (
    <View style={{ marginTop: 50 }}>
      <ActivityIndicator size="large" />
      <Text
        style={{
          marginTop: 10,
          textAlign: 'center',
          fontWeight: '600',
          fontSize: 16,
        }}>
        {props.text || 'Cargando datos...'}
      </Text>
    </View>
  );
};
