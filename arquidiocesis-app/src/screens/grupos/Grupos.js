/* 
Nombre: Grupos.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver los grupos HEMA
*/
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { RefreshControl } from 'react-native-web-refresh-control';
import { AlphabetList, ErrorView, Button } from '../../components';
import { API } from '../../lib';

export default (props) => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  console.log('Gruposs');
  useEffect(() => {
    API.getUser().then(setUser);
    API.getGrupos()
      .then((grupos) => {
        setData(grupos);
        setRefreshing(false);
        setError(false);
      })
      .catch((err) => {
        console.log(err);
        setRefreshing(false);
        setError(true);
      });
  }, []);

  const getGrupos = () => {
    setRefreshing(true);
    setError(false);
    API.getGrupos(true)
      .then((d) => {
        setData(d);
        setError(false);
        setRefreshing(false);
      })
      .catch((err) => {
        console.log(err);
        setRefreshing(false);
        setError(true);
      });
  };

  if (error) {
    return (
      <ErrorView
        message={'Hubo un error cargando los grupos...'}
        refreshing={refreshing}
        retry={getGrupos}
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

  const onPress = (item) => {
    props.navigation.navigate('Grupo', {
      grupo: item,
      onDelete: (id) => {
        setData((d) => d.filter((a) => a.id !== id));
      },
      onEdit: (id, new_grupo) => {
        setData([...data.filter((a) => a.id !== id), new_grupo]);
      },
    });
  };

  const addGrupo = () => {
    props.navigation.navigate('RegistroGrupo', {
      onAdd: (p) => {
        if (!data) return;
        setData([...data, p]);
      },
    });
  };

  const renderItem = (data) => {
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
      <View>
        {user && (user.type === 'admin' || user.type === 'superadmin') ? (
          <Button
            text="Agregar grupo"
            style={{ width: 250, alignSelf: 'center' }}
            onPress={addGrupo}
          />
        ) : null}
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
    </ScrollView>
  );
};
