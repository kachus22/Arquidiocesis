/* 
Nombre: RegistroAcompañante.js
Usuario con acceso: Admin
Descripción: Pantalla que muestra los campos para el registro de los acompañantes de zona y decanato
*/
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { Input, Button, Picker, Alert, DatePicker } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
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
  var [escolaridad, setEscolaridad] = useState(false);
  var [oficio, setOficio] = useState(false);
  var [password, setPassword] = useState('');
  var [password2, setPassword2] = useState('');
  const [assignedToZona, setAssignedToZona] = useState(true);
  const [zonas, setZonas] = useState(undefined);
  const [zonaSelected, setZonaSelected] = useState(undefined);
  const [decanatos, setDecanatos] = useState(undefined);
  const [decanatoSelected, setDecanatoSelected] = useState(undefined);

  var { onAdd, zona, decanato } = props.route.params;

  props.navigation.setOptions({
    headerTitle: 'Registro Acompañante',
  });

  useEffect(() => {
    const populatePlaces = async () => {
      try {
        const zonas = await API.getZonas(true);
        const parsedZonas = zonas.map((zona) => ({
          label: zona.nombre,
          value: zona.id,
        }));
        setZonas(parsedZonas);

        const decanatos = await API.getDecanatos(true);
        const parsedDecanatos = decanatos.map((decanato) => ({
          label: decanato.nombre,
          value: decanato.id,
        }));
        setDecanatos(parsedDecanatos);
      } catch (error) {
        console.log('RegistroAcompanante', error.message);
      }
    };

    if (!zona && !decanato) {
      populatePlaces();
    }
  }, []);

  var doRegister = () => {
    if (loading) {
      return;
    }

    var data = {
      nombre: name,
      apellido_paterno: apPaterno,
      apellido_materno: apMaterno,
      fecha_nacimiento: birthday,
      estado_civil: estadoCivil ? estadoCivil.value : null,
      sexo: gender ? gender.value : null,
      email: email,
      escolaridad: escolaridad ? escolaridad.value : null,
      oficio: oficio ? oficio.value : null,
      password: password,
      domicilio: {
        domicilio: domicilio,
        colonia: colonia,
        municipio: municipio,
        telefono_casa: phoneHome,
        telefono_movil: phoneMobile,
      },
    };

    var { valid, prompt } = Util.validateForm(data, {
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
      email: {
        type: 'email',
        prompt: 'Favor de introducir el correo electrónico.',
      },
      password: [
        {
          type: 'minLength',
          value: 5,
          prompt: 'Favor de introducir la contraseña, minimo 5 caracteres',
        },
        {
          type: 'equals',
          value: password2,
          prompt: 'Las contraseña no concuerdan.',
        },
      ],
    });

    if (!valid) {
      return Alert.alert('Error', prompt);
    }

    let prom;

    if (!zona && !decanato) {
      if (assignedToZona && zonaSelected === undefined) {
        return Alert.alert('Error', 'Favor de escoger una zona');
      } else if (!assignedToZona && decanatoSelected === undefined) {
        return Alert.alert('Error', 'Favor de escoger un decanato');
      }

      prom = assignedToZona
        ? API.registerAcompananteZona(zonaSelected.value, data)
        : API.registerAcompananteDecanato(decanatoSelected.value, data);
    } else {
      prom = zona
        ? API.registerAcompananteZona(zona.id, data)
        : API.registerAcompananteDecanato(decanato.id, data);
    }

    setLoading(true);

    prom
      .then((done) => {
        setLoading(false);

        if (!done) {
          return Alert.alert('Error', 'Hubo un error agregando el acompañante.');
        }

        onAdd(done);
        Alert.alert('Exito', 'Se ha agregado el acompañante.');
        return props.navigation.goBack();
      })
      .catch((err) => {
        setLoading(false);

        if (err.code == 999) {
          Alert.alert('Error', 'No tienes acceso a esta acción.');
        } else if (err.code == 1283) {
          if (zona || decanato) {
            Alert.alert(
              'Error',
              (zona ? 'La zona' : 'El decanato') + ' ya tiene un acompañante.'
            );
          } else {
            Alert.alert(
              'Error',
              (assignedToZona ? 'La zona' : 'El decanato') +
                ' ya tiene un acompañante.'
            );
          }
        } else if (err.code == 623) {
          Alert.alert(
            'Error',
            'Ya existe un usuario con ese correo electrónico.'
          );
        } else {
          Alert.alert('Error', 'Hubo un error agregando el acompañante.');
        }
      });
  };

  const renderSubheader = () => {
    if (!zona && !decanato) {
      return null;
    }

    return (
      <Text style={styles.subHeader}>
        {zona ? zona.nombre : decanato.nombre}
      </Text>
    );
  };

  return (
    <KeyboardAwareScrollView style={styles.loginContainer} bounces={true}>
      <Text style={styles.header}>Registrar Acompañante</Text>
      {renderSubheader()}

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

      {zonas || decanatos ? (
        <>
          <Text style={styles.section}>Asignar a zona o decanato</Text>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '50%',
              marginHorizontal: 'auto',
              justifyContent: 'space-around',
            }}>
            <Text style={styles.text}>Decanato</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={assignedToZona ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => {
                setAssignedToZona((previousState) => !previousState);
              }}
              value={assignedToZona}
            />
            <Text style={styles.text}>Zona</Text>
          </View>
          {zonas ? (
            <Picker
              name="Zonas"
              required
              items={zonas}
              onValueChange={setZonaSelected}
              style={!assignedToZona && { display: 'none' }}
            />
          ) : (
            <ActivityIndicator style={{ height: 80 }} />
          )}

          {decanatos ? (
            <Picker
              name="Decanatos"
              required
              items={decanatos}
              onValueChange={setDecanatoSelected}
              style={assignedToZona && { display: 'none' }}
            />
          ) : (
            <ActivityIndicator style={{ height: 80 }} />
          )}
        </>
      ) : null}

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
        value={password}
        onChangeText={setPassword}
        textContentType={'password'}
        password
      />
      <Input
        name="Repetir Contraseña"
        required
        value={password2}
        onChangeText={setPassword2}
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
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: 'grey',
    marginBottom: 10,
    marginTop: 20,
  },
});
