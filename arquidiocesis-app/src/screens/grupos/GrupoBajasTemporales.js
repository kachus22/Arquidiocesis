/* 
Nombre: GrupoBajasTemporales.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver la información de las bajas temporales registradas en un grupo HEMA
*/
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RefreshControl } from 'react-native-web-refresh-control';
import { AlphabetList, ErrorView, LoadingView } from '../../components';
import { API } from '../../lib';

export default (props) => {
  var { onEdit, onStatusChange, id } = props.route.params;

  var [data, setData] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);

  props.navigation.setOptions({
    headerTitle: 'Bajas temporales',
  });

  useEffect(() => {
    API.getGrupoBajasTemporales(id)
      .then((d) => {
        setData(d);
        setRefreshing(false);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  }, []);

  var getMiembros = () => {
    setRefreshing(true);
    API.getGrupoBajasTemporales(id, true)
      .then((d) => {
        setData(d);
        setError(false);
        setRefreshing(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  };

  var viewMiembro = (item) => {
    props.navigation.navigate('DetalleMiembro', {
      persona: item,
      onEdit: (id, miembro) => {
        setData([...data.filter((a) => a.id != id), miembro]);
      },
      onStatusChange: (id, status, miembro) => {
        if (status != 1) setData(data.filter((a) => a.id != id));
        else {
          setData([...data.filter((a) => a.id != id), miembro]);
        }
        onStatusChange(id, status, miembro);
      },
    });
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getMiembros} />
      }>
      {error ? (
        <ErrorView
          message={'Hubo un error cargando las parroquias...'}
          refreshing={refreshing}
          retry={getMiembros}
        />
      ) : data === false ? (
        <LoadingView />
      ) : (
        <View>
          {data.length == 0 ? (
            <Text style={styles.empty}>No hay bajas temporales.</Text>
          ) : (
            <AlphabetList
              data={data}
              onSelect={viewMiembro}
              scroll
              sort={'nombre'}
            />
          )}
        </View>
      )}
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
  empty: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    backgroundColor: 'white',
    padding: 15,
  },
});
