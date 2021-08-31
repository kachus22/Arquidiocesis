/* 
Nombre: RegistrarCapilla.js
Usuario con acceso: Admin
Descripción: Pantalla para registrar la información de las capillas
*/
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input, Button, Alert } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';

export default (props) => {
  var [loading, setLoading] = useState(false);
  var [nombre, setNombre] = useState('');
  var [direccion, setDireccion] = useState('');
  var [colonia, setColonia] = useState('');
  var [municipio, setMunicipio] = useState('');
  var [telefono1, setTelefono1] = useState('');
  var [telefono2, setTelefono2] = useState('');
  var { parroquia, onAdded } = props.route.params;

  var doRegister = () => {
    var data = {
      nombre,
      direccion,
      colonia,
      municipio,
      telefono1,
      telefono2,
    };

    var { valid, prompt } = Util.validateForm(data, {
      nombre: {
        type: 'empty',
        prompt: 'Favor de introducir el nombre de la capilla.',
      },
      direccion: {
        type: 'empty',
        prompt: 'Favor de introducir la dirección de la capilla.',
      },
      colonia: {
        type: 'empty',
        prompt: 'Favor de introducir la colonia la capilla.',
      },
      municipio: {
        type: 'empty',
        prompt: 'Favor de introducir el municipio de la capilla.',
      },
    });
    if (!valid) {
      Alert.alert('Error', prompt);
      return;
    }

    setLoading(true);
    API.addCapilla(parroquia.id, data)
      .then((done) => {
        setLoading(false);
        Alert.alert('Exito', 'Se ha agregado la capilla');
        data.id = done;
        if (onAdded) onAdded(data);
        props.navigation.goBack();
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        Alert.alert('Error', 'Hubo un error agregando la capilla.');
      });
  };

  props.navigation.setOptions({
    headerTitle: 'Registrar Capilla',
  });

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.header}>Registrar Capilla</Text>
      <Text style={styles.subHeader}>{parroquia.nombre}</Text>
      <View style={{ padding: 15 }}>
        <Input
          name={'Nombre'}
          value={nombre}
          onChangeText={setNombre}
          required
        />
        <Input
          name={'Dirección'}
          value={direccion}
          onChangeText={setDireccion}
          required
        />
        <Input
          name={'Colonia'}
          value={colonia}
          onChangeText={setColonia}
          required
        />
        <Input
          name={'Municipio'}
          value={municipio}
          onChangeText={setMunicipio}
          required
        />
        <Input
          name={'Telefono 1'}
          value={telefono1}
          onChangeText={setTelefono1}
          keyboard={'phone-pad'}
        />
        <Input
          name={'Telefono 2'}
          value={telefono2}
          onChangeText={setTelefono2}
          keyboard={'phone-pad'}
        />
        <Button text="Registrar" onPress={doRegister} loading={loading} />
      </View>
    </KeyboardAwareScrollView>
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
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
  },
  subHeader: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
  },
});
