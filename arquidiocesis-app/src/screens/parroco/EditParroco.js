/* 
Nombre: EditParroco.js
Usuario con acceso: Admin
Descripción: Pantalla para editar la información personal de los párrocos en el sistema
*/
import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import {
  Input,
  Button,
  Alert,
  DatePicker,
  PickerScreen,
} from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  const { onEdit, persona, parr } = props.route.params;

  let bd = moment.unix(persona.fecha_nacimiento._seconds);
  if (!bd.isValid()) bd = moment();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(persona.nombre);
  const [apPaterno, setApPaterno] = useState(persona.apellido_paterno);
  const [apMaterno, setApMaterno] = useState(persona.apellido_materno);
  const [birthday, setBirthday] = useState(bd.format('YYYY-MM-DD'));

  const [phoneMobile, setPhoneMobile] = useState(persona.telefono_movil);

  const [listParroquias, setListParroquias] = useState(false);
  const [parroquia, setParroquia] = useState(parr);

  props.navigation.setOptions({
    headerTitle: 'Editar Párroco',
  });

  const doRegister = () => {
    if (loading) return;

    const data = {
      nombre: name,
      apellido_paterno: apPaterno,
      apellido_materno: apMaterno,
      fecha_nacimiento: birthday,
      telefono_movil: phoneMobile,
      parroquia: parroquia ? parroquia.id : null,
    };

    const { valid, prompt } = Util.validateForm(data, {
      nombre: {
        type: 'minLength',
        value: 3,
        prompt: 'Favor de introducir el nombre.',
      },
      apellido_paterno: {
        type: 'empty',
        prompt: 'Favor de introducir el apelldio paterno.',
      },
      fecha_nacimiento: {
        type: 'empty',
        prompt: 'Favor de introducir la fecha de nacimiento.',
      },
    });

    if (!valid) {
      return Alert.alert('Error', prompt);
    }
    setLoading(true);

    API.editParroco(persona.id, data)
      .then((done) => {
        setLoading(false);
        if (!done)
          return Alert.alert('Error', 'Hubo un error editando el párroco.');
        data.fecha_nacimiento = {
          _seconds: moment(birthday, 'YYYY-MM-DD').unix(),
        };
        onEdit(data);
        Alert.alert('Exito', 'Se ha editado el párroco.');
        return;
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);

        if (err.code === 999) {
          props.navigation.goBack();
          return Alert.alert('Error', 'No tienes acceso a esta acción.');
        }

        if (
          err.message ===
          'Ya existe un párroco con el identificador proporcionado.'
        ) {
          return Alert.alert('Error', err.message);
        }

        return Alert.alert('Error', 'Hubo un error editando el párroco.');
      });
  };

  React.useEffect(() => {
    API.getParroquias()
      .then((data) => {
        const parroquias = { Parroquias: data };
        setListParroquias(parroquias);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [persona]);

  return (
    <KeyboardAwareScrollView style={styles.loginContainer} bounces={true}>
      <Input name="Nombre" value={name} onChangeText={setName} required />
      <Input
        name="Apellido Paterno"
        value={apPaterno}
        onChangeText={setApPaterno}
        required
      />
      <Input
        name="Apellido Materno"
        value={apMaterno}
        onChangeText={setApMaterno}
      />
      <DatePicker
        onDateChange={(d) => setBirthday(d)}
        date={birthday}
        name="Fecha de nacimiento"
      />

      <Input
        name="Teléfono Móvil"
        value={phoneMobile}
        onChangeText={setPhoneMobile}
        keyboard={'phone-pad'}
      />
      {listParroquias ? (
        <PickerScreen
          value={parroquia ? parroquia.nombre : 'Elegir Parroquia'}
          name="Parroquia"
          navigation={props.navigation}
          data={listParroquias}
          organize={false}
          onSelect={setParroquia}
        />
      ) : (
        <ActivityIndicator style={{ height: 80 }} />
      )}

      <Button text="Guardar" loading={loading} onPress={doRegister} />
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
    width: '100%',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
    marginTop: 20,
  },
  subHeader: {
    fontSize: 20,
    textAlign: 'center',
    color: 'grey',
    marginBottom: 20,
  },
  section: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: 'grey',
    marginBottom: 10,
    marginTop: 20,
  },
});
