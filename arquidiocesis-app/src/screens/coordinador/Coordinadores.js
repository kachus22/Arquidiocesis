/* 
Nombre: Coordinadores.js
Usuario con acceso: Admin
Descripción: Pantalla para ver la información de todos los coordinadores en el sistema
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

  useEffect(() => {
    API.getUser().then((u) => {
      setUser(u);
      if (u.type == 'acompañante_decanato' || u.type == 'acompañante_zona') {
        setRefreshing(true);
        API.getCoordinadoresForAcompanante(u.id)
          .then((d) => {
            setRefreshing(false);
            setData(d);
            setError(false);
          })
          .catch((err) => {
            setRefreshing(false);
            setError(true);
            Alert.alert('Error', err.message);
            console.log(err);
          });
      } else {
        setRefreshing(true);
        API.getCoordinadores(false)
          .then((d) => {
            setRefreshing(false);
            setData(d);
            setError(false);
          })
          .catch((err) => {
            setRefreshing(false);
            setError(true);
          });
      }
    });
  }, []);

  var getCoordinadores = () => {
    setRefreshing(true);
    setError(false);
    if (
      user.type == 'acompañante_decanato' ||
      user.type == 'acompañante_zona'
    ) {
      API.getCoordinadoresForAcompanante(user.id)
        .then((d) => {
          setRefreshing(false);
          setData(d);
          setError(false);
        })
        .catch((err) => {
          setRefreshing(false);
          setError(true);
          console.log(err);
        });
    } else {
      API.getCoordinadores(true)
        .then((d) => {
          setRefreshing(false);
          setData(d);
          setError(false);
        })
        .catch((err) => {
          setRefreshing(false);
          setError(true);
        });
    }
  };

  if (error) {
    return (
      <ErrorView
        message={'Hubo un error cargando los coordinadores...'}
        refreshing={refreshing}
        retry={getCoordinadores}
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

  var detalleCoord = (item) => {
    props.navigation.navigate('DetalleCoordinador', {
      persona: item,
      onEdit: (id, coord) => {
        setData([...data.filter((a) => a.id != id), coord]);
      },
      onDelete: (id) => {
        setData(data.filter((a) => a.id != id));
      },
    });
  };

  var addCoordinador = () => {
    props.navigation.navigate('RegistroCoordinador', {
      onAdd: (c) => {
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
        <RefreshControl refreshing={refreshing} onRefresh={getCoordinadores} />
      }>
      <View>
        {user && (user.type == 'admin' || user.type == 'superadmin') && (
          <Button
            text="Registro coordinador"
            style={{ width: 250, alignSelf: 'center' }}
            onPress={addCoordinador}
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
              No hay coordinadores en el sistema.
            </Text>
          </View>
        ) : (
          <AlphabetList
            data={formatData()}
            onSelect={detalleCoord}
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
