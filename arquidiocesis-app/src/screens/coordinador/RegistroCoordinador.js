/* 
Nombre: RegistroCoordinador.js
Usuario con acceso: Admin
Descripción: Pantalla para registrar un nuevo coordinador en el sistema
*/
import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Input, Button, Picker, Alert, DatePicker } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  const [identificador, setIdentificador] = useState('');
  var [loading, setLoading] = useState(false);
  var [name, setName] = useState('');
  var [apPaterno, setApPaterno] = useState('');
  var [apMaterno, setApMaterno] = useState('');
  var [email, setEmail] = useState('');
  var [birthday, setBirthday] = useState(moment().format('YYYY-MM-DD'));
  var [gender, setGender] = useState(false);
  var [estadoCivil, setEstadoCivil] = useState(false);
  var [domicilio, setDomicilio] = useState('');
  var [colonia, setColonia] = useState('');
  var [municipio, setMunicipio] = useState('');
  var [phoneHome, setPhoneHome] = useState('');
  var [phoneMobile, setPhoneMobile] = useState('');
  var [phoneMobile, setPhoneMobile] = useState('');
  var [escolaridad, setEscolaridad] = useState(false);
  var [oficio, setOficio] = useState(false);
  var [password, setPassword] = useState('');

  var onAdd = props.route.params.onAdd;

  props.navigation.setOptions({
    headerTitle: 'Registro Coordinador',
  });

  var doRegister = () => {
    if (loading) return;

    var data = {
      identificador,
      nombre: name,
      apellido_paterno: apPaterno,
      apellido_materno: apMaterno,
      fecha_nacimiento: birthday,
      estado_civil: estadoCivil ? estadoCivil.value : null,
      sexo: gender ? gender.value : null,
      email: email,
      password: password,
      escolaridad: escolaridad ? escolaridad.value : null,
      oficio: oficio ? oficio.value : null,
      domicilio: {
        domicilio: domicilio,
        colonia: colonia,
        municipio: municipio,
        telefono_casa: phoneHome,
        telefono_movil: phoneMobile,
      },
    };

    var { valid, prompt } = Util.validateForm(data, {
      identificador: {
        type: 'empty',
        prompt: 'Favor de introducir el identificador de la parroquia.',
      },
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
      sexo: { type: 'empty', prompt: 'Favor de introducir el sexo.' },
      estado_civil: {
        type: 'empty',
        prompt: 'Favor de introducir el estado civil.',
      },
      escolaridad: {
        type: 'empty',
        prompt: 'Favor de introducir la escolaridad.',
      },
      oficio: { type: 'empty', prompt: 'Favor de introducir el oficio.' },
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
    API.registerCoordinador(data)
      .then((new_member) => {
        setLoading(false);
        if (!new_member)
          return Alert.alert(
            'Error',
            'Hubo un error registrando el coordinador'
          );
        if (onAdd) onAdd(new_member);
        Alert.alert('Exito', 'Se ha agregado el coordinador.');
        props.navigation.goBack();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);

        if (
          err.message ===
          'Ya existe un coordinador con el identificador proporcionado.'
        ) {
          Alert.alert('Error', err.message);
        } else {
          Alert.alert('Error', 'Hubo un error agregando la parroquia.');
        }
      });
  };

  return (
    <KeyboardAwareScrollView style={styles.loginContainer} bounces={true}>
      <Text style={styles.header}>Registrar Coordinador</Text>
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
      <Picker
        name="Estado Civil"
        required
        items={[
          { label: 'Soltero', value: 'Soltero' },
          { label: 'Casado', value: 'Casado' },
          { label: 'Viudo', value: 'Viudo' },
          { label: 'Unión Libre', value: 'Unión Libre' },
          { label: 'Divorciado', value: 'Divorciado' },
        ]}
        onValueChange={setEstadoCivil}
      />
      <Picker
        name="Sexo"
        required
        items={[
          { label: 'Masculino', value: 'Masculino' },
          { label: 'Femenino', value: 'Femenino' },
          { label: 'Sin especificar', value: 'Sin especificar' },
        ]}
        onValueChange={setGender}
      />
      <Picker
        name="Grado escolaridad"
        required
        items={[
          { label: 'Ninguno', value: 'Ninguno' },
          { label: 'Primaria', value: 'Primaria' },
          { label: 'Secundaria', value: 'Secundaria' },
          { label: 'Técnica carrera', value: 'Técnica carrera' },
          { label: 'Maestría', value: 'Maestría' },
          { label: 'Doctorado', value: 'Doctorado' },
        ]}
        onValueChange={setEscolaridad}
      />
      <Picker
        name="Oficio"
        required
        items={[
          { label: 'Ninguno', value: 'Ninguno' },
          { label: 'Plomero', value: 'Plomero' },
          { label: 'Electricista', value: 'Electricista' },
          { label: 'Carpintero', value: 'Carpintero' },
          { label: 'Albañil', value: 'Albañil' },
          { label: 'Pintor', value: 'Pintor' },
          { label: 'Mecánico', value: 'Mecánico' },
          { label: 'Músico', value: 'Músico' },
          { label: 'Chofer', value: 'Chofer' },
        ]}
        onValueChange={setOficio}
      />

      <Text style={styles.section}>Domicilio</Text>
      <Input name="Domicilio" value={domicilio} onChangeText={setDomicilio} />
      <Input name="Colonia" value={colonia} onChangeText={setColonia} />
      <Input name="Municipio" value={municipio} onChangeText={setMunicipio} />
      <Input
        name="Teléfono Casa"
        value={phoneHome}
        onChangeText={setPhoneHome}
        keyboard={'phone-pad'}
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
