/* 
Nombre: Evento.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver la información de un evento
*/

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { API } from '../../lib';
import { FontAwesome5 } from '@expo/vector-icons';
import { RefreshControl } from 'react-native-web-refresh-control';
import { Input, Alert, Item, List, LoadingView } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  var { evento, onEdit, onDelete } = props.route.params;

  var [event, setEvent] = useState(evento);
  var [deleting, setDeleting] = useState(false);
  var [user, setUser] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);

  props.navigation.setOptions({
    headerStyle: {
      backgroundColor: '#002E60',
      shadowOpacity: 0,
    },
    headerTitle: 'Evento',
    headerRight: () =>
      user &&
      (user.type == 'admin' || user.type == 'superadmin') && (
        <TouchableOpacity onPress={editEvent}>
          <FontAwesome5
            name={'edit'}
            size={24}
            style={{ paddingRight: 15 }}
            color={'white'}
          />
        </TouchableOpacity>
      ),
  });

  useEffect(() => {
    API.getUser().then(setUser);
  }, []);

  var deleteEvent = () => {
    Alert.alert('¿Eliminar evento?', 'Esto eliminará los datos del evento.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          setDeleting(true);
          API.deleteEvent(event.id)
            .then((done) => {
              setDeleting(false);
              alert('Se ha eliminado el evento.');
              props.navigation.goBack();
              if (onDelete) onDelete(event.id);
            })
            .catch((err) => {
              setDeleting(false);
              alert('Hubo un error eliminando el evento.');
            });
        },
      },
    ]);
  };

  const editEvent = () => {
    props.navigation.navigate('EditEvento', {
      event,
      onEdit: (data) => {
        var event = { ...evento };
        for (var i in data) {
          event[i] = data[i];
        }
        setEvent(event);

        if (onEdit) {
          onEdit(event.id, event);
        }
      },
    });
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={{ padding: 15 }}>
        <Input name="Nombre del evento" value={event.nombre} readonly />
        <Input
          name="Responsable del evento"
          value={event.responsable}
          readonly
        />
        <Input name="Fechas del evento" value={event.fechas} readonly />
      </View>

      {user && (user.type == 'admin' || user.type == 'integrante_chm') && (
        <Item text="Eliminar evento" onPress={deleteEvent} loading={deleting} />
      )}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: 'grey',
    marginBottom: 10,
    marginTop: 20,
  },
  sectionText: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 10,
    paddingLeft: 15,
  },
});
