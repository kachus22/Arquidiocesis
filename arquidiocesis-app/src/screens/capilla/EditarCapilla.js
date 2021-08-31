/* 
Nombre: EditarCapilla.js
Usuario con acceso: Admin, Acompañante
Descripción: Pantalla para editar la información de las capillas
*/
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, Alert } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';

export default (props) => {
  var { onEdit, capilla } = props.route.params;
  var [loading, setLoading] = useState(false);
  var [nombre, setNombre] = useState(capilla.nombre || '');
  var [direccion, setDireccion] = useState(capilla.direccion || '');
  var [colonia, setColonia] = useState(capilla.colonia || '');
  var [municipio, setMunicipio] = useState(capilla.municipio || '');
  var [telefono1, setTelefono1] = useState(capilla.telefono1 || '');
  var [telefono2, setTelefono2] = useState(capilla.telefono2 || '');

  var save = () => {
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
    API.editCapilla(capilla.id, data, capilla.parroquia)
      .then((done) => {
        setLoading(false);
        onEdit(data);
        Alert.alert('Exito', 'Se ha editado la capilla.');
      })
      .catch((err) => {
        console.log(err);
        Alert.alert('Error', 'Hubo un error editado la capilla.');
        setLoading(false);
      });

    // API.addCapilla(name, address, parroquia.id).then(new_capilla=>{
    // 	if(!onAdded) return;
    // 	onAdded(new_capilla);
    // 	alert('Se ha agregado la capilla')
    // 	setLoading(false);
    // 	props.navigation.goBack();
    // }).catch(err=>{
    // 	setLoading(false);
    // 	alert('Hubo un error agregando la capilla.')
    // })
  };

  props.navigation.setOptions({
    headerTitle: 'Editar Capilla',
  });

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      {/* <Text style={styles.header}>Editar Capilla</Text>  */}
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
        <Button text="Guardar" onPress={save} loading={loading} />
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
