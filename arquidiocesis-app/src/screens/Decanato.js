/* 
Nombre: Decanato.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver la lista de parroquias de un decanato y el acompañante del mismo
*/
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RefreshControl } from 'react-native-web-refresh-control';
import { AlphabetList, ErrorView, Item } from '../components';
import { API } from '../lib';

export default (props) => {
  var [decanato, setDecanato] = useState(props.route.params);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);
  var [user, setUser] = useState(false);

  props.navigation.setOptions({
    headerStyle: {
      backgroundColor: '#002E60',
      shadowOpacity: 0,
    },
    headerTitle: '',
  });

  useEffect(() => {
    API.getUser().then(setUser);
    setRefreshing(true);
    setError(false);
    API.getDecanato(decanato.id)
      .then((d) => {
        d.id = decanato.id;
        setDecanato(d);
        setRefreshing(false);
        setError(false);
      })
      .catch((err) => {
        console.log(err);
        setError(true);
        setRefreshing(false);
      });
  }, []);

  var getDecanato = () => {
    setRefreshing(true);
    setError(false);
    API.getDecanato(decanato.id, true)
      .then((d) => {
        d.id = decanato.id;
        setDecanato(d);
        setRefreshing(false);
        setError(false);
      })
      .catch((err) => {
        setError(true);
        setRefreshing(false);
      });
  };

  var addAcompanante = () => {
    props.navigation.navigate('RegistroAcompanante', {
      decanato,
      onAdd: (id) => {
        var z = { ...decanato };
        z.acompanante = id;
        setDecanato(z);
      },
    });
  };

  var viewAcompanante = () => {
    props.navigation.navigate('DetalleAcompanante', {
      decanato,
      onDelete: function () {
        var z = { ...decanato };
        z.acompanante = null;
        setDecanato(z);
      },
    });
  };

  var onPress = (item) => {
    props.navigation.push('Parroquia', item);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{decanato.nombre}</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getDecanato} />
        }>
        {error ? (
          <ErrorView
            message={'Hubo un error cargando el decanato...'}
            refreshing={refreshing}
            retry={getDecanato}
          />
        ) : decanato.parroquias ? (
          <View>
            {decanato.acompanante ? (
              <Item text="Ver acompañante" onPress={viewAcompanante} />
            ) : (user && user.type == 'admin') || user.type == 'superadmin' ? (
              <Item text="Agregar acompañante" onPress={addAcompanante} />
            ) : null}
            <Text style={styles.sectionText}>PARROQUIAS</Text>
            {decanato.parroquias && decanato.parroquias.length > 0 ? (
              <AlphabetList
                data={decanato.parroquias}
                onSelect={onPress}
                sort={'nombre'}
              />
            ) : (
              <View>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    color: 'gray',
                    backgroundColor: 'white',
                    padding: 15,
                  }}>
                  Este decanato no tiene parroquias agregadas.
                </Text>
              </View>
            )}
          </View>
        ) : (
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
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    backgroundColor: '#002E60',
  },
  headerText: {
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
    padding: 15,
  },
  sectionText: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 10,
    marginTop: 30,
    paddingLeft: 15,
  },
});
