import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Button from './Button';
import { RefreshControl } from 'react-native-web-refresh-control';

export default (props) => {
  if (props.scroll !== undefined) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={props.refreshing}
            onRefresh={props.retry}
          />
        }
        contentContainerStyle={{ marginTop: 50 }}>
        <FontAwesome5
          name={'exclamation-circle'}
          size={50}
          style={{ textAlign: 'center' }}
        />
        <Text
          style={{
            marginTop: 10,
            textAlign: 'center',
            fontWeight: '600',
            fontSize: 16,
          }}>
          {props.message || 'Hubo un error...'}
        </Text>
        <Button
          style={{ width: 200, alignSelf: 'center' }}
          text={'Reintentar'}
          onPress={props.retry || null}
          loading={props.refreshing}
        />
      </ScrollView>
    );
  }

  return (
    <View style={{ marginTop: 50, marginHorizontal: 20 }}>
      <FontAwesome5
        name={'exclamation-circle'}
        size={50}
        style={{ textAlign: 'center' }}
      />
      <Text
        style={{
          marginTop: 10,
          textAlign: 'center',
          fontWeight: '600',
          fontSize: 16,
        }}>
        {props.message || 'Hubo un error...'}
      </Text>
      <Button
        style={{ width: 200, alignSelf: 'center' }}
        text={'Reintentar'}
        onPress={props.retry || null}
        loading={props.refreshing}
      />
    </View>
  );
};
