import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { RefreshControl } from 'react-native-web-refresh-control';
import { FontAwesome5 } from '@expo/vector-icons';

export default (props) => {
  var renderChild = () => {
    var clickable = true;
    if (props.clickable == false) {
      clickable = props.clickable;
    }
    return props.data.map((a, ix) => (
      <View key={'item-' + ix}>
        {props.renderItem ? (
          <TouchableOpacity
            onPress={() => {
              if (props.onSelect) props.onSelect(a);
            }}>
            <View style={[styles.item, { backgroundColor: 'white' }]}>
              {props.renderItem(a)}
            </View>
          </TouchableOpacity>
        ) : (
          <ListItem data={a} onPress={props.onSelect} clickable={clickable} />
        )}
      </View>
    ));
  };

  if (props.scroll !== false) {
    return (
      <ScrollView
        style={props.style}
        contentContainerStyle={[{ paddingBottom: 50 }, props.contentStyle]}
        refreshControl={
          props.refreshing !== undefined ? (
            <RefreshControl
              refreshing={props.refreshing || false}
              onRefresh={props.onRefresh}
            />
          ) : null
        }>
        {renderChild()}
      </ScrollView>
    );
  } else {
    return <View>{renderChild()}</View>;
  }
};

var ListItem = (props) => {
  return (
    <TouchableOpacity
      onPress={() => {
        if (props.onPress) props.onPress(props.data);
      }}>
      <View style={{ backgroundColor: 'white' }}>
        <View style={styles.item}>
          <Text>{props.data.nombre || props.data.name}</Text>
          {props.clickable && (
            <FontAwesome5
              name="chevron-right"
              style={{ marginRight: 30, color: 'gray', fontSize: 15 }}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    paddingLeft: 15,
    paddingVertical: 15,
    width: '100%',
    borderBottomColor: '#CCC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
