import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RefreshControl } from 'react-native-web-refresh-control';
import { List, AlphabetList } from '../components';

export default (props) => {
  props.navigation.setOptions({
    headerTitle: props.route.params.name,
  });

  var onSelect = (i) => {
    if (props.route.params.onSelect) props.route.params.onSelect(i);
    props.navigation.goBack();
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        props.route.params.onRefresh ? (
          <RefreshControl
            refreshing={props.route.params.refreshing}
            onRefresh={props.route.params.onRefresh}
          />
        ) : null
      }>
      {/* <List data={props.route.params.data} sort={props.route.params.sort || 'nombre'} renderItem={(props.route.params.renderItem || null)} /> */}
      <AlphabetList
        data={props.route.params.data}
        organize={props.route.params.organize}
        sort={props.route.params.sort}
        renderItem={props.route.params.renderItem || null}
        onSelect={onSelect}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  date: {
    color: 'gray',
    fontSize: 13,
  },
  header: {
    backgroundColor: '#F7F7F7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCC',
    width: '100%',
    padding: 5,
    paddingHorizontal: 15,
    fontWeight: '600',
  },
});
