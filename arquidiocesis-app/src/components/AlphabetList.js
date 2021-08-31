import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Util } from '../lib';
import { FontAwesome5 } from '@expo/vector-icons';
import { RefreshControl } from 'react-native-web-refresh-control';

export default (props) => {
  var components = [];
  var headers = [];
  var organizedData =
    props.headers !== false
      ? props.organize !== false
        ? Util.organizeListData(props.data, props.sort || 'name')
        : props.data
      : { A: props.data };
  var clickable = true;
  if (props.clickable == false) {
    clickable = props.clickable;
  }

  for (var i in organizedData) {
    if (props.headers !== false) {
      headers.push(components.length);
      components.push(
        <View key={'header-' + i} style={styles.header}>
          <Text style={styles.headerText}>{i.toUpperCase()}</Text>
        </View>
      );
    }
    components.push(
      ...organizedData[i].map((a, ix) =>
        props.renderItem ? (
          <View
            style={{ backgroundColor: 'white' }}
            key={'item' + i + '-' + ix}>
            {props.onSelect ? (
              <TouchableOpacity onPress={() => props.onSelect(a)}>
                <View style={[styles.item]}>
                  {props.renderItem(a, ix)}
                  {clickable && (
                    <FontAwesome5
                      name="chevron-right"
                      style={{ marginRight: 30, color: 'gray', fontSize: 15 }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ) : (
              <View style={[styles.item]}>
                {props.renderItem(a, ix)}
                {clickable && (
                  <FontAwesome5
                    name="chevron-right"
                    style={{ marginRight: 30, color: 'gray', fontSize: 15 }}
                  />
                )}
              </View>
            )}
          </View>
        ) : (
          <ListItem
            data={a}
            onPress={props.onSelect}
            key={'item' + i + '-' + ix}
            sort={props.sort}
            clickable={clickable}
          />
        )
      )
    );
  }

  if (props.scroll !== false) {
    return (
      <ScrollView
        style={props.style}
        contentContainerStyle={{ paddingBottom: 50 }}
        stickyHeaderIndices={headers}
        refreshControl={
          props.refreshing !== undefined ? (
            <RefreshControl
              refreshing={props.refreshing || false}
              onRefresh={props.onRefresh}
            />
          ) : null
        }>
        {components}
      </ScrollView>
    );
  } else {
    return <View>{components}</View>;
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
          <Text>
            {props.sort
              ? props.data[props.sort]
              : props.data.nombre || props.data.name}
          </Text>
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
  header: {
    backgroundColor: '#F7F7F7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCC',
    width: '100%',
    padding: 5,
    paddingHorizontal: 15,
    // borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor: '#CCC'
  },
  headerText: {
    fontWeight: '600',
  },
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
