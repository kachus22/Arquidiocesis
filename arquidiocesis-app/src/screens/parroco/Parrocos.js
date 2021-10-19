/* 
Nombre: Parrocos.js
Usuario con acceso: 
Descripción: Pantalla para ver la información de todos los párrocos en el sistema
*/
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { RefreshControl } from 'react-native-web-refresh-control';
import { AlphabetList, Button, ErrorView } from '../../components';
import { API } from '../../lib';

export default (props) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(false);

  useEffect(() => {
    API.getUser().then(setUser);

    API.getParrocos(true)
      .then((d) => {
        setRefreshing(false);
        setData(d);
        setError(false);
      })
      .catch(() => {
        setRefreshing(false);
        setError(true);
      });
  }, []);

  const getParrocos = () => {
    setRefreshing(true);
    setError(false);

    API.getParrocos(true)
      .then((d) => {
        setRefreshing(false);
        setData(d);
        setError(false);
      })
      .catch(() => {
        setRefreshing(false);
        setError(true);
      });
  };

  const formatData = () => {
    return data.map((a) => ({
      ...a,
      nombre_completo: `${a.nombre} ${a.apellido_paterno}`,
    }));
  };

  const addParroco = () => {
    props.navigation.navigate('RegistroParroco', {
      onAdd: (c) => {
        setData([...data, c]);
      },
    });
  };

  var detalleParroco = (item) => {
    props.navigation.navigate('DetalleParroco', {
      persona: item,
      onEdit: (id, coord) => {
        setData([...data.filter((a) => a.id !== id), coord]);
      },
      onDelete: (id) => {
        setData(data.filter((a) => a.id !== id));
      },
    });
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getParrocos} />
      }>
      <View>
        {user &&
          (user.type === 'admin' ||
            user.type === 'superadmin' ||
            user.type === 'coordinador' ||
            user.type === 'acompañante_zona' ||
            user.type === 'acompañante_decanato') && (
            <Button
              text="Registro párroco"
              style={{ width: 250, alignSelf: 'center' }}
              onPress={addParroco}
            />
          )}

        {error ? (
          <ErrorView
            message={'Hubo un error cargando los párrocos...'}
            refreshing={refreshing}
            retry={getParrocos}
          />
        ) : data.length === 0 ? (
          <View>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                color: 'gray',
                backgroundColor: 'white',
                padding: 15,
              }}>
              No hay párrocos en el sistema.
            </Text>
          </View>
        ) : (
          <AlphabetList
            data={formatData()}
            onSelect={detalleParroco}
            scroll
            sort={'nombre_completo'}
          />
        )}
      </View>
    </ScrollView>
  );
};
