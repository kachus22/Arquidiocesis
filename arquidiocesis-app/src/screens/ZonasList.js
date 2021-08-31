/* 
Nombre: ZonasList.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver la lista de zonas en el sistema
*/
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AlphabetList, ErrorView } from '../components';
import { API } from '../lib';

export default (props) => {
  var [data, setData] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);

  useEffect(() => {
    API.getZonas()
      .then((zonas) => {
        setData(zonas);
        setRefreshing(false);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  }, []);

  var getZonas = () => {
    setRefreshing(true);
    API.getZonas(true)
      .then((zonas) => {
        setData(zonas);
        setError(false);
        setRefreshing(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  };

  var onPress = (item) => {
    props.navigation.navigate('Zona', item);
  };

  if (error) {
    return (
      <ErrorView
        refreshing={refreshing}
        retry={getZonas}
        message="Hubo un error cargando las zonas..."
      />
    );
  }

  if (data === false) {
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
          Cargando datos...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AlphabetList
        data={data}
        onSelect={onPress}
        refreshing={refreshing}
        onRefresh={getZonas}
        sort={'nombre'}
      />
    </View>
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
