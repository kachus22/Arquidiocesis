/* 
Nombre: RegistroParroquia.js
Usuario con acceso: Admin
Descripción: Pantalla para registrar parroquias en el sistema
*/
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Input, Button, Picker, Alert, PickerScreen } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';

export default (props) => {
  var [loading, setLoading] = useState(false);
  var [listDecanatos, setListDecanatos] = useState(false);

  var [identificador, setIdentificador] = useState('');
  var [name, setName] = useState('');
  var [address, setAddress] = useState('');
  var [decanato, setDecanato] = useState(false);
  var [colonia, setColonia] = useState('');
  var [municipio, setMunicipio] = useState('');
  var [telefono1, setTelefono1] = useState('');
  var [telefono2, setTelefono2] = useState('');

  var onAdd = props.route.params.onAdd;

  var doRegister = () => {
    var data = {
      identificador,
      nombre: name,
      decanato: decanato ? decanato.id : null,
      direccion: address,
      colonia,
      municipio,
      telefono1,
      telefono2,
    };

    var { valid, prompt } = Util.validateForm(data, {
      identificador: {
        type: 'empty',
        prompt: 'Favor de introducir el identificador de la parroquia.',
      },
      nombre: {
        type: 'empty',
        prompt: 'Favor de introducir el nombre de la parroquia.',
      },
      decanato: { type: 'empty', prompt: 'Favor de seleccionar el decanato.' },
      direccion: { type: 'empty', prompt: 'Favor de introducir la dirección.' },
      colonia: { type: 'empty', prompt: 'Favor de introducir la colonia.' },
      municipio: { type: 'empty', prompt: 'Favor de introducir el municipio.' },
    });

    if (!valid) {
      return Alert.alert('Error', prompt);
    }

    setLoading(true);
    API.addParroquia(data)
      .then((new_parroquia) => {
        setLoading(false);
        if (!new_parroquia)
          return Alert.alert('Error', 'Hubo un error agregando la parroquia.');
        if (onAdd) onAdd(new_parroquia);
        props.navigation.goBack();
        Alert.alert('Exito', 'Se ha agregado la parroquia.');
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);

        if (
          err.message ===
          'Ya existe una parroquia con el identificador proporcionado.'
        ) {
          Alert.alert('Error', err.message);
        } else {
          Alert.alert('Error', 'Hubo un error agregando la parroquia.');
        }
      });
  };

  useEffect(() => {
    API.getZonas(true).then((zonas) => {
      API.getDecanatos(true).then((decanatos) => {
        var dec = {};
        for (var i of zonas) {
          dec[i.nombre] = decanatos.filter((a) => a.zona == i.id);
        }
        setListDecanatos(dec);
      });
    });
  }, []);

  props.navigation.setOptions({
    headerTitle: 'Registrar Parroquia',
  });

  return (
    <KeyboardAwareScrollView
      style={styles.loginContainer}
      bounces={false}
      contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.header}>Registrar Parroquia</Text>
      <Input
        name="Identificador"
        value={identificador}
        onChangeText={(newIdentificador) =>
          setIdentificador(newIdentificador.trim())
        }
        required
      />
      <Input name="Nombre" value={name} onChangeText={setName} required />
      <Input
        name="Dirección"
        value={address}
        onChangeText={setAddress}
        required
      />
      <Input
        name="Colonia"
        value={colonia}
        onChangeText={setColonia}
        required
      />
      <Input
        name="Municipio"
        value={municipio}
        onChangeText={setMunicipio}
        required
      />
      <Input
        name="Telefono 1"
        value={telefono1}
        onChangeText={setTelefono1}
        keyboard={'phone-pad'}
      />
      <Input
        name="Telefono 2"
        value={telefono2}
        onChangeText={setTelefono2}
        keyboard={'phone-pad'}
      />
      {listDecanatos ? (
        <PickerScreen
          value={decanato ? decanato.nombre : ''}
          name="Decanato"
          navigation={props.navigation}
          data={listDecanatos}
          organize={false}
          onSelect={setDecanato}
        />
      ) : (
        <ActivityIndicator style={{ height: 80 }} />
      )}
      <Button text="Registrar" loading={loading} onPress={doRegister} />
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
  loginContainer: {
    height: '70%',
    width: '100%',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
});
