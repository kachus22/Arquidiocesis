/* 
Nombre: Parroquias.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver la lista de parroquias en el sistema
*/
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { AlphabetList, ErrorView, Button } from '../../components';
import { RefreshControl } from 'react-native-web-refresh-control';
import { API } from '../../lib';

export default (props) => {
  var [data, setData] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);
  var [user, setUser] = useState(false);

  useEffect(() => {
    API.getUser().then(setUser);
    API.getParroquias()
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

  var getParroquias = () => {
    setRefreshing(true);
    API.getParroquias(true)
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

  var onPress = (item) => {
    props.navigation.navigate('Parroquia', {
      ...item,
      onDelete: function (id) {
        setData((d) => d.filter((a) => a.id != id));
      },
      onEdit: function (p) {
        setData([...data.filter((a) => a.id != p.id), p]);
      },
    });
  };

  var addParroquia = () => {
    props.navigation.navigate('RegistroParroquia', {
      onAdd: (p) => {
        if (!data) return;
        setData([...data, p]);
      },
    });
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getParroquias} />
      }>
      {error ? (
        <ErrorView
          message={'Hubo un error cargando las parroquias...'}
          refreshing={refreshing}
          retry={getParroquias}
        />
      ) : data === false ? (
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
      ) : (
        <View>
          {user && (user.type == 'admin' || user.type == 'superadmin') && (
            <Button
              text="Agregar parroquia"
              style={{ width: 250, alignSelf: 'center' }}
              onPress={addParroquia}
            />
          )}
          <AlphabetList data={data} onSelect={onPress} scroll sort={'nombre'} />
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
});
