/* 
Nombre: EditEvento.js
Usuario con acceso: Admin
Descripción: Pantalla para editar un evento
*/
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Input, Button, Picker, PickerScreen } from '../../components';
import { API } from '../../lib';

export default (props) => {
  const { event, onEdit } = props.route.params;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(event.nombre);
  const [eventResponsible, setEventResponsible] = useState(event.responsable);
  const [eventDates, setEventDates] = useState(event.fechas);

  props.navigation.setOptions({
    headerStyle: {
      backgroundColor: '#002E60',
      shadowOpacity: 0,
    },
    headerTitle: 'Editar un evento',
  });

  const editEvent = async () => {
    if (loading) return;
    if (name.trim().length < 1) return alert('Por favor introduzca un nombre.');
    if (eventResponsible.trim().length < 1)
      return alert('Por favor introduzca el responsable del evento.');
    if (eventDates.trim().length < 1)
      return alert('Por favor introduzca las fechas.');

    setLoading(true);

    try {
      const data = {
        nombre: name,
        responsable: eventResponsible,
        fechas: eventDates,
      };
      const editedEvent = await API.editEvent(event.id, data);

      if (onEdit) {
        onEdit(data);
      }

      alert('Se ha editado el evento');
      props.navigation.goBack();
    } catch (error) {
      console.log('error :>> ', error);

      if (error.message === 'Ya existe un evento con ese nombre.') {
        alert(error.message);
      } else {
        alert('Hubo un error editando el evento');
      }
    }

    setLoading(false);
  };

  return (
    <KeyboardAwareScrollView style={styles.container} bounces={false}>
      <Text style={styles.header}>Editar Evento</Text>
      <Input name="Nombre del evento" value={name} onChangeText={setName} />
      <Input
        name="Responsable del evento"
        value={eventResponsible}
        onChangeText={setEventResponsible}
      />
      <Input
        name="Fechas del evento"
        value={eventDates}
        onChangeText={setEventDates}
      />
      <Button text="Guardar" loading={loading} onPress={editEvent} />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'grey',
    fontWeight: '500',
  },
  container: {
    height: '70%',
    width: '100%',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
});
