/* 
Nombre: SelectGroup.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para seleccionar un grupo HEMA de una parroquia o capilla
*/
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { RefreshControl } from 'react-native-web-refresh-control';
import { AlphabetList, ErrorView } from '../../components';
import { API } from '../../lib';

export default (props) => {
  var [user, setUser] = useState(null);
  var [data, setData] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);

  var { onSelect } = props.route.params;

  props.navigation.setOptions({
    headerTitle: 'Seleccionar grupo',
  });

  useEffect(() => {
    API.getUser().then((u) => {
      setUser(u);
      if (u.type == 'acompañante_decanato' || u.type == 'acompañante_zona') {
        API.getGruposForAcompanante(u.id)
          .then((g) => {
            setData(g);
            setRefreshing(false);
            setError(false);
          })
          .catch((err) => {
            setRefreshing(false);
            setError(true);
          });
      } else {
        API.getGrupos()
          .then((grupos) => {
            setData(grupos);
            setRefreshing(false);
            setError(false);
          })
          .catch((err) => {
            setRefreshing(false);
            setError(true);
          });
      }
    });
  }, []);

  var getGrupos = () => {
    setRefreshing(true);
    API.getGrupos(true)
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

  var onPress = (item) => {
    if (onSelect) onSelect(item);
    props.navigation.goBack();
  };

  var renderItem = (data) => {
    return (
      <View>
        <Text style={{ fontSize: 18 }} numberOfLines={1}>
          {data.nombre}
        </Text>
        {data.new ? (
          <Text
            style={{ color: 'green', fontStyle: 'italic' }}
            numberOfLines={1}>
            ¡Nuevo!
          </Text>
        ) : data.parroquia || data.capilla ? (
          <Text
            style={{
              color: 'gray',
              fontStyle: !data.parroquia && !data.capilla ? 'italic' : 'normal',
            }}
            numberOfLines={1}>
            {data.parroquia
              ? 'Parroquia: ' + data.parroquia.nombre
              : 'Capilla: ' + data.capilla.nombre}
          </Text>
        ) : (
          <Text
            style={{ color: 'gray', fontStyle: 'italic' }}
            numberOfLines={1}>
            Sin parroquia
          </Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getGrupos} />
      }>
      {error ? (
        <ErrorView
          message={'Hubo un error cargando las parroquias...'}
          refreshing={refreshing}
          retry={getGrupos}
        />
      ) : (
        <View>
          {data.length > 0 ? (
            <AlphabetList
              data={data}
              onSelect={onPress}
              scroll
              renderItem={renderItem}
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
                No perteneces a un grupo.
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};
