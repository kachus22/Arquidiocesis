/* 
Nombre: ChangeEncargado.js
Usuario con acceso: Admin, Acompañante
Descripción: Pantalla para cambiar un encargado de capacitación
*/
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, PickerScreen, Alert } from '../../components';
import { API } from '../../lib';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default (props) => {
  var { id, encargado, onEdit } = props.route.params;

  var [loading, setLoading] = useState(false);
  var [capacitador, setCapacitador] = useState(null);
  var [capacitadoresList, setCapacitadoresList] = useState(false);

  props.navigation.setOptions({
    headerTitle: 'Cambiar encargado',
  });

  useEffect(() => {
    API.getCapacitadores().then((c) => {
      if (c.length == 0) {
        API.getCapacitadores(true).then((cap) => {
          setCapacitadoresList(cap);
          setCapacitador(cap.find((a) => a.id == encargado));
        });
      } else {
        setCapacitadoresList(c);
        setCapacitador(c.find((a) => a.id == encargado));
      }
    });
  }, []);

  var save = () => {
    if (!encargado) return alert('Favor de seleccionar un capacitador');
    if (capacitador.id == encargado) {
      // Fake change.
      Alert.alert('Exito', 'Se ha cambiado el capacitador.');
      props.navigation.goBack();
      return;
    }
    setLoading(true);
    API.changeCapacitacionEncargado(id, capacitador.id)
      .then((done) => {
        setLoading(false);
        if (!done)
          return Alert.alert('Error', 'Hubo un error cambiando el capacitador');
        Alert.alert('Exito', 'Se ha cambiado el capacitador.');
        props.navigation.goBack();
        onEdit(capacitador.id);
      })
      .catch((err) => {
        setLoading(false);
        return Alert.alert('Error', err.message);
      });
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ padding: 15 }}>
      {capacitadoresList ? (
        <PickerScreen
          name="Encargado"
          data={capacitadoresList}
          value={
            capacitador
              ? `${capacitador.nombre} ${capacitador.apellido_paterno} ${capacitador.apellido_materno}`
              : ''
          }
          sort={'nombre'}
          required
          onSelect={setCapacitador}
          navigation={props.navigation}
          renderItem={(i) => {
            return (
              <View>
                <Text style={{ fontSize: 18 }}>
                  {i.nombre} {i.apellido_paterno} {i.apellido_materno}
                </Text>
                <Text style={{ color: 'gray' }}>{i.email}</Text>
              </View>
            );
          }}
        />
      ) : (
        <ActivityIndicator style={{ height: 80 }} />
      )}
      {capacitador ? (
        <View style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ marginRight: 5, fontSize: 16 }}>Nombre:</Text>
            <Text style={{ fontSize: 16 }}>
              {capacitador.nombre} {capacitador.apellido_paterno}{' '}
              {capacitador.apellido_materno}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ marginRight: 5, fontSize: 16 }}>Correo:</Text>
            <Text style={{ fontSize: 16 }}>{capacitador.email}</Text>
          </View>
        </View>
      ) : null}
      <Button text="Guardar" loading={loading} onPress={save} />
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
});
