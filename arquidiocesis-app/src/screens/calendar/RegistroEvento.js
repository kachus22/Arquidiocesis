/* 
Nombre: RegistroEvent.js
Usuario con acceso: Admin
Descripción: Pantalla para registrar un evento al calendario
*/
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Input, Button, Picker, PickerScreen } from '../../components';
import { API } from '../../lib';

export default (props) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [eventResponsible, setEventResponsible] = useState('');
  const [eventDates, setEventDates] = useState('');
  const onAdd = props.route.params.onAdd;

  props.navigation.setOptions({
    headerStyle: {
      backgroundColor: '#002E60',
      shadowOpacity: 0,
    },
    headerTitle: 'Registro de evento',
  });

  const addEvent = async () => {
    if (loading) return;
    if (name.trim().length < 1) return alert('Por favor introduzca un nombre.');
    if (eventResponsible.trim().length < 1)
      return alert('Por favor introduzca el responsable del evento.');
    if (eventDates.trim().length < 1)
      return alert('Por favor introduzca las fechas.');

    setLoading(true);

    try {
      const newEvent = await API.addEvent(name, eventResponsible, eventDates);

      if (onAdd) {
        onAdd(newEvent);
      }

      alert('Se ha agregado el evento');
      props.navigation.goBack();
    } catch (error) {
      console.log('error :>> ', error);

      if (error.message === 'Ya existe un evento con ese nombre.') {
        alert(error.message);
      } else {
        alert('Hubo un error registrando el evento');
      }
    }

    setLoading(false);
  };

  return (
    <KeyboardAwareScrollView style={styles.container} bounces={false}>
      <Text style={styles.header}>Registrar Evento</Text>
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
      <Button text="Añadir" loading={loading} onPress={addEvent} />
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
