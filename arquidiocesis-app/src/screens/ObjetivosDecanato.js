/* 
Nombre: ObjetivosDecanato.js
Descripción: Pantalla para editar la información de los objetivos de un decanato
*/
import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Input, Button } from '../components';
import { API } from './../lib';

export default (props) => {
  const { objectiveData, onEdit } = props.route.params;
  console.log('objectiveData :>> ', objectiveData);

  const [loading, setLoading] = useState(false);
  const [p, setP] = useState(String(objectiveData[1]));
  const [cg, setCg] = useState(String(objectiveData[2]));
  const [oc1, setOc1] = useState(String(objectiveData[3]));
  const [oc2, setOc2] = useState(String(objectiveData[4]));
  const [oc3, setOc3] = useState(String(objectiveData[5]));

  props.navigation.setOptions({
    headerStyle: {
      backgroundColor: '#002E60',
      shadowOpacity: 0,
    },
    headerTitle: 'Editar un objetivo',
  });

  const editObjective = async () => {
    if (loading) return;

    if (Number.isNaN(parseInt(p)))
      return alert('Por favor introduzca un número para P.');
    if (Number.isNaN(parseInt(cg)))
      return alert('Por favor introduzca un número para CG.');
    if (Number.isNaN(parseInt(oc1)))
      return alert('Por favor introduzca un número para OC1.');
    if (Number.isNaN(parseInt(oc2)))
      return alert('Por favor introduzca un número para OC2.');
    if (Number.isNaN(parseInt(oc3)))
      return alert('Por favor introduzca un número para OC3.');
    if (!objectiveData[6])
      return alert('No se tiene el ID del objetivo actual, contacte a soporte.');

    setLoading(true);

    try {
      const data = {
        id: objectiveData[6],
        p: parseInt(p),
        cg: parseInt(cg),
        oc1: parseInt(oc1),
        oc2: parseInt(oc2),
        oc3: parseInt(oc3),
      };
      const editedObjective = await API.editObjective(data);

      onEdit(data);
      alert('Se ha editado el objetivo');
      props.navigation.goBack();
    } catch (error) {
      console.log('error :>> ', error);

      if (error.message === 'Ya existe un evento con ese nombre.') {
        alert(error.message);
      } else {
        alert('Hubo un error editando el objetivo');
      }
    }

    setLoading(false);
  };

  return (
    <KeyboardAwareScrollView style={styles.container} bounces={false}>
      <Text style={styles.header}>Objetivos de "{objectiveData[0]}"</Text>
      <Input name="Parroquias (P)" value={p} onChangeText={setP} />
      <Input name="Con grupo (CG)" value={cg} onChangeText={setCg} />
      <Input
        name="Objetivo de Capacitación 1 (OC1)"
        value={oc1}
        onChangeText={setOc1}
      />
      <Input
        name="Objetivo de Capacitación 2 (OC2)"
        value={oc2}
        onChangeText={setOc2}
      />
      <Input
        name="Objetivo de Capacitación 3 (OC3)"
        value={oc3}
        onChangeText={setOc3}
      />
      <Button text="Guardar" loading={loading} onPress={editObjective} />
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
