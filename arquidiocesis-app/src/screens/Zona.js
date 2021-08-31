/* 
Nombre: Zona.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver la lista de parroquias de una zona,
			 el acompañante de la zona y los decanatos de la zona
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
  var [zona, setZona] = useState(props.route.params);
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
    setError(false);
    API.getZona(zona.id)
      .then((d) => {
        setZona(d);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  }, []);

  var getZona = () => {
    setRefreshing(true);
    setError(false);
    API.getZona(zona.id, true)
      .then((d) => {
        setZona(d);
        setRefreshing(false);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  };

  var onPress = (item) => {
    props.navigation.navigate('Decanato', item);
  };

  var onPressParroquia = (item) => {
    item.readonly = true;
    props.navigation.navigate('Parroquia', item);
  };

  var addAcompanante = () => {
    props.navigation.navigate('RegistroAcompanante', {
      zona,
      onAdd: (id) => {
        var z = { ...zona };
        z.acompanante = id;
        setZona(z);
      },
    });
  };

  var viewAcompanante = () => {
    props.navigation.navigate('DetalleAcompanante', {
      zona,
      onDelete: function () {
        var z = { ...zona };
        z.acompanante = null;
        setZona(z);
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{zona.nombre}</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getZona} />
        }>
        {error ? (
          <ErrorView
            message={'Hubo un error cargando la zona...'}
            refreshing={refreshing}
            retry={getZona}
          />
        ) : zona.decanatos ? (
          <View>
            {zona.acompanante ? (
              <Item text="Ver acompañante" onPress={viewAcompanante} />
            ) : (user && user.type == 'admin') || user.type == 'superadmin' ? (
              <Item text="Agregar acompañante" onPress={addAcompanante} />
            ) : null}

            <Text style={styles.sectionText}>DECANATOS</Text>
            <AlphabetList
              data={zona.decanatos}
              onSelect={onPress}
              scroll={false}
              sort={'nombre'}
            />
            {zona.parroquias && zona.parroquias.length > 0 && (
              <View>
                <Text style={styles.sectionText}>PARROQUIAS</Text>
                <AlphabetList
                  data={zona.parroquias}
                  onSelect={onPressParroquia}
                  scroll={false}
                  sort={'nombre'}
                />
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
  testText: {
    fontSize: 20,
  },
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
