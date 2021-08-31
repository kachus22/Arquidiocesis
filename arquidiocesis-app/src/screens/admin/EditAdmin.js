/* 
Nombre: EditAdmin.js
Usuario con acceso: Admin
Descripción: Pantalla para editar la información de un usuario registrado en el sistema
*/
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';
import { Input, LoadingView, Button, Picker } from '../../components';

export default (props) => {
  var old_email = props.route.params.user.email;
  var [nombre, setNombre] = useState(props.route.params.user.nombre);
  var [apPat, setApPat] = useState(props.route.params.user.apellido_paterno);
  var [apMat, setApMat] = useState(props.route.params.user.apellido_materno);
  var [sexo, setSexo] = useState(props.route.params.user.sexo);
  var [tipo, setTipo] = useState(props.route.params.user.tipo);

  var [loading, setLoading] = useState(false);
  var onEdit = props.route.params.onEdit;

  props.navigation.setOptions({
    headerTitle: 'Editar usuario',
  });

  var save = () => {
    var data = {
      nombre,
      apellido_paterno: apPat,
      apellido_materno: apMat,
      sexo,
      tipo,
    };
    var { valid, prompt } = Util.validateForm(data, {
      nombre: {
        type: 'minLength',
        value: 2,
        prompt: 'Favor de introducir el nombre del usuario.',
      },
      apellido_paterno: {
        type: 'minLength',
        value: 2,
        prompt: 'Favor de introducir el apellido paterno del usuario.',
      },
      sexo: {
        type: 'empty',
        prompt: 'Favor de seleccionar el sexo del usuario.',
      },
      tipo: {
        type: 'empty',
        prompt: 'Favor de seleccionar el acceso del usuario',
      },
    });
    if (!valid) {
      return alert(prompt);
    }
    setLoading(true);
    API.editUserDetail(old_email, props.route.params.user.id, data)
      .then((done) => {
        setLoading(false);
        if (!done) {
          return alert('Hubo un error editando el usuario.');
        }
        if (onEdit) onEdit(done);
        alert('Se ha editado el usuario.');
      })
      .catch((err) => {
        setLoading(false);
        return alert('Hubo un error editando el usuario.');
      });
  };

  var getAccess = () => {
    switch (tipo) {
    case 'admin':
      return 0;
    case 'integrante_chm':
      return 1;
    case 'capacitacion':
      return 2;
    }
    return -1;
  };

  var getAccessName = () => {
    switch (tipo) {
    case 'admin':
      return 'Administrador General';
    case 'integrante_chm':
      return 'Integrante de la CHM';
    case 'coordinador':
      return 'Coordinador de grupo';
    case 'acompañante_zona':
      return 'Acompañante de Zona';
    case 'acompañante_decanato':
      return 'Acompañante de Decanato';
    case 'capacitacion':
      return 'Capacitación';
    }
    return '';
  };

  var getGenero = () => {
    switch (sexo) {
    case 'Masculino':
      return 0;
    case 'Femenino':
      return 1;
    case 'Sin especificar':
      return 2;
    }
    return 0;
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ padding: 15 }}>
      <Input name="Nombre" value={nombre} onChangeText={setNombre} />
      <Input name="Apellido Paterno" value={apPat} onChangeText={setApPat} />
      <Input name="Apellido Materno" value={apMat} onChangeText={setApMat} />
      <Picker
        name="Sexo"
        items={['Masculino', 'Femenino', 'Sin especificar']}
        onValueChange={setSexo}
        select={getGenero()}
      />

      {!['admin', 'integrante_chm', 'capacitacion'].includes(tipo) ? (
        <Input name="Acceso" value={getAccessName()} readonly />
      ) : (
        <Picker
          name="Acceso"
          items={[
            { label: 'Administrador General', value: 'admin' },
            { label: 'Integrante de la CHM', value: 'integrante_chm' },
            { label: 'Capacitación', value: 'capacitacion' },
          ]}
          onValueChange={(v) => setTipo(v ? v.value : null)}
          select={getAccess()}
        />
      )}

      <Button text="Guardar" onPress={save} loading={loading} />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  testText: {
    fontSize: 20,
  },
  section: {
    fontSize: 16,
    color: 'gray',
    marginTop: 30,
    fontWeight: '500',
    paddingLeft: 15,
  },
});
