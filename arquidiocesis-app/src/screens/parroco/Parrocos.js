/* 
Nombre: Parrocos.js
Usuario con acceso: 
Descripción: Pantalla para ver la información de todos los párrocos en el sistema
*/
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RefreshControl } from 'react-native-web-refresh-control';
import { AlphabetList, Button, ErrorView, Alert } from '../../components';
import { API } from '../../lib';

export default (props) => {
  var [data, setData] = useState(false);
  var [error, setError] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [user, setUser] = useState(false);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View>
        <Button
          text="Registro párroco"
          style={{ width: 250, alignSelf: 'center' }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  testText: {
    fontSize: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
