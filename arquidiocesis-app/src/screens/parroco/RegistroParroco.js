/* 
Nombre: RegistroPárroco.js
Usuario con acceso: 
Descripción: Pantalla para registrar un nuevo párroco en el sistema
*/
import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Input, Button, Alert, DatePicker } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [apPaterno, setApPaterno] = useState('');
  const [apMaterno, setApMaterno] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState(moment().format('YYYY-MM-DD'));
  const [orderDate, setOrderDate] = useState(moment().format('YYYY-MM-DD'));
  const [phoneMobile, setPhoneMobile] = useState('');
  const [password, setPassword] = useState('');
  const onAdd = props.route.params.onAdd;

  props.navigation.setOptions({
    headerTitle: 'Registro Parroco',
  });

  const doRegister = () => {
    if (loading) return;

    const data = {
      nombre: name,
      apellido_paterno: apPaterno,
      apellido_materno: apMaterno,
      fecha_nacimiento: birthday,
      fecha_ordenamiento: orderDate,
      telefono_movil: phoneMobile,
      email: email,
      password: password,
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
      fecha_ordenamiento: {
        type: 'empty',
        prompt: 'Favor de introducir la fecha de ordenamiento.',
      },
      email: {
        type: 'empty',
        prompt: 'Favor de introducir el email',
      },

      password: {
        type: 'minLength',
        value: 5,
        prompt: 'Favor de introducir la contraseña, minimo 5 caracteres',
      },
    });

    if (!valid) {
      return Alert.alert('Error', prompt);
    }

    setLoading(true);
    API.registerParroco(data)
      .then((new_member) => {
        setLoading(false);
        if (!new_member)
          return Alert.alert('Error', 'Hubo un error registrando el párroco');
        if (onAdd) onAdd(new_member);
        Alert.alert('Exito', 'Se ha agregado el párroco.');
        props.navigation.goBack();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);

        if (
          err.message ===
          'Ya existe un párroco con el identificador proporcionado.'
        ) {
          Alert.alert('Error', err.message);
        } else {
          Alert.alert('Error', 'Hubo un error agregando al párroco.');
        }
      });
  };

  return (
    <KeyboardAwareScrollView style={styles.loginContainer} bounces={true}>
      <Text style={styles.header}>Registrar Párroco</Text>
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

      <DatePicker
        onDateChange={(d) => setOrderDate(d)}
        date={orderDate}
        name="Fecha de ordenamiento"
      />

      <Input
        name="Teléfono Móvil"
        value={phoneMobile}
        onChangeText={setPhoneMobile}
        keyboard={'phone-pad'}
      />

      <Text style={styles.section}>Credenciales</Text>
      <Input
        name="Correo electrónico"
        required
        value={email}
        onChangeText={setEmail}
        textContentType={'emailAddress'}
        keyboard={'email-address'}
      />
      <Input
        name="Contraseña"
        required
        style={{ marginTop: 10 }}
        value={password}
        onChangeText={setPassword}
        textContentType={'password'}
        password
      />
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
