/* 
Nombre: EditParroquia.js
Usuario con acceso: Admin
Descripción: Pantalla para editar la información de una parroquia
*/
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Input, Button, Picker, Alert } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';

export default (props) => {
  var { parroquia, onEdit } = props.route.params;
  var [loading, setLoading] = useState(false);
  var [listDecanatos, setListDecanatos] = useState(false);

  var [identificador, setIdentificador] = useState(
    parroquia.identificador || undefined
  );
  var [name, setName] = useState(parroquia.nombre || '');
  var [address, setAddress] = useState(parroquia.direccion || '');
  var [decanato, setDecanato] = useState(false);
  var [colonia, setColonia] = useState(parroquia.colonia || '');
  var [municipio, setMunicipio] = useState(parroquia.municipio || '');
  var [telefono1, setTelefono1] = useState(parroquia.telefono1 || '');
  var [telefono2, setTelefono2] = useState(parroquia.telefono2 || '');

  var doRegister = () => {
    var data = {
      identificador,
      nombre: name,
      decanato: decanato ? decanato.value : null,
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
    API.editParroquia(parroquia.id, data)
      .then((done) => {
        setLoading(false);
        if (!done)
          return Alert.alert('Error', 'Hubo un error editando la parroquia.');
        done.decanato = {
          id: decanato.id,
          nombre: decanato.label,
        };
        onEdit(done);
        return Alert.alert('Exito', 'Se ha editado la parroquia.');
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
          Alert.alert('Error', 'Hubo un error editando la parroquia.');
        }
      });
  };
  useEffect(() => {
    API.getDecanatos(true).then((decanatos) => {
      var d = decanatos.map((a) => {
        return { label: a.nombre, value: a.id };
      });
      setListDecanatos(d);
    });
  }, []);

  var getDecanato = () => {
    if (!listDecanatos) return;
    return listDecanatos.findIndex((a) => a.value == parroquia.decanato.id);
  };

  props.navigation.setOptions({
    headerTitle: 'Editar Parroquia',
  });

  return (
    <KeyboardAwareScrollView
      bounces={false}
      contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.header}>Editar Parroquia</Text>
      <View style={{ padding: 15 }}>
        {identificador !== undefined && (
          <Input
            name="Identificador"
            value={identificador}
            onChangeText={(newIdentificador) =>
              setIdentificador(newIdentificador.trim())
            }
            required
          />
        )}
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
          <Picker
            onValueChange={setDecanato}
            name="Seleccionar decanato"
            items={listDecanatos}
            select={getDecanato()}
            required
          />
        ) : (
          <ActivityIndicator style={{ height: 80 }} />
        )}
        <Button text="Guardar" loading={loading} onPress={doRegister} />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
  },
});
