/* 
Nombre: Acompañantes.js
Usuario con acceso: Admin
Descripción: Pantalla para ver la información de todos los acompañantes en el sistema
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
import { AlphabetList, Button, ErrorView } from '../../components';
import { API } from '../../lib';

export default (props) => {
  var [data, setData] = useState(false);
  var [error, setError] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [user, setUser] = useState(false);

  useEffect(() => {
    API.getUser().then(setUser);

    setRefreshing(true);
    API.getAcompanantes(false)
      .then((d) => {
        setRefreshing(false);
        setData(d);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  }, []);

  var getAcompanantes = () => {
    setRefreshing(true);
    setError(false);
    API.getAcompanantes(true)
      .then((d) => {
        setRefreshing(false);
        setData(d);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  };

  if (error) {
    return (
      <ErrorView
        message={'Hubo un error cargando los acompañantes...'}
        refreshing={refreshing}
        retry={getAcompanantes}
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

  var detalleAcompanante = (item) => {
    console.log('item :>> ', item);
    props.navigation.navigate('DetalleAcompanante', {
      acompanante: item,
      onEdit: (id, coord) => {
        setData([...data.filter((a) => a.id != id), coord]);
      },
      onDelete: (id) => {
        setData(data.filter((a) => a.id != id));
      },
    });
  };

  const addAcompanante = () => {
    console.log('addAcompanante start');
    props.navigation.navigate('RegistroAcompanante', {
      onAdd: (c) => {
        if (c.id === undefined) {
          getAcompanantes();
          return;
        }

        if (!data) {
          return;
        }

        setData([...data, c]);
      },
    });
  };

  var formatData = () => {
    return data.map((a) => ({
      ...a,
      nombre_completo: `${a.nombre} ${a.apellido_paterno}`,
    }));
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getAcompanantes} />
      }>
      <View>
        {user && (user.type == 'admin' || user.type == 'superadmin') && (
          <Button
            text="Agregar acompañante"
            style={{ width: 250, alignSelf: 'center' }}
            onPress={addAcompanante}
          />
        )}
        {data.length == 0 ? (
          <View>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                color: 'gray',
                backgroundColor: 'white',
                padding: 15,
              }}>
              No hay acompañantes en el sistema.
            </Text>
          </View>
        ) : (
          <AlphabetList
            data={formatData()}
            onSelect={detalleAcompanante}
            scroll
            sort={'nombre_completo'}
          />
        )}
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
