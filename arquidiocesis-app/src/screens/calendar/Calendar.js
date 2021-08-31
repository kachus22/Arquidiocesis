/* 
Nombre: Calendar.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver los eventos del calendario
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

import { AlphabetList, ErrorView, Button } from '../../components';
import { API } from '../../lib';

export default (props) => {
  var [user, setUser] = useState(null);
  var [data, setData] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);

  useEffect(() => {
    API.getUser().then(setUser);
    getEvents();
  }, []);

  const getEvents = async () => {
    setRefreshing(true);
    setError(false);

    try {
      const data = await API.getEvents();
      setData(data);
      setError(false);
      setRefreshing(false);
    } catch (error) {
      console.log('error :>> ', error);
      setRefreshing(false);
      setError(true);
    }
  };

  if (error) {
    return (
      <ErrorView
        message={'Hubo un error cargando los grupos...'}
        refreshing={refreshing}
        retry={getEvents}
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

  var onPress = (item) => {
    props.navigation.navigate('Evento', {
      evento: item,
      onDelete: (id) => {
        setData((d) => d.filter((a) => a.id != id));
      },
      onEdit: (id, new_event) => {
        const filteredData = data.filter((a) => a.id != id);
        setData([...filteredData, new_event]);
      },
    });
  };

  var addEvent = () => {
    props.navigation.navigate('RegistroEvento', {
      onAdd: (p) => {
        if (!data) return;
        setData([...data, p]);
      },
    });
  };

  var renderItem = (data) => {
    return (
      <View>
        <Text style={{ fontSize: 18 }} numberOfLines={1}>
          {data.nombre}
        </Text>
        <Text style={{ color: 'gray', fontStyle: 'italic' }} numberOfLines={1}>
          {data.responsable}
        </Text>
        <Text style={{ color: 'gray' }} numberOfLines={1}>
          {data.fechas}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getEvents} />
      }>
      <View>
        {user && (user.type == 'admin' || user.type == 'superadmin') ? (
          <Button
            text="Agregar evento"
            style={{ width: 250, alignSelf: 'center' }}
            onPress={addEvent}
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
              No existe ningún evento en el calendario.
            </Text>
          </View>
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
