/* 
Nombre: EditarParticipante.js
Usuario con acceso: Admin, Acompañante
Descripción: Pantalla para editar la información a detalle de un participante en un grupo de capacitación 
*/
import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Input, Button, Picker, Alert, DatePicker } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  const { persona, capacitacion_id, onEdit } = props.route.params;

  let bd = moment.unix(persona.fecha_nacimiento._seconds);
  if (!bd.isValid()) bd = moment();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(persona.nombre);
  const [apPaterno, setApPaterno] = useState(persona.apellido_paterno);
  const [apMaterno, setApMaterno] = useState(persona.apellido_materno);
  const [nombreCorto, setNombreCorto] = useState(persona.nombre_corto);
  const [email, setEmail] = useState(persona.email);
  const [birthday, setBirthday] = useState(bd.format('YYYY-MM-DD'));
  const [gender, setGender] = useState(false);
  const [estadoCivil, setEstadoCivil] = useState(false);
  const [domicilio, setDomicilio] = useState(persona.domicilio.domicilio);
  const [colonia, setColonia] = useState(persona.domicilio.colonia);
  const [municipio, setMunicipio] = useState(persona.domicilio.municipio);
  const [phoneHome, setPhoneHome] = useState(persona.domicilio.telefono_casa);
  const [phoneMobile, setPhoneMobile] = useState(
    persona.domicilio.telefono_movil
  );
  const [escolaridad, setEscolaridad] = useState(false);
  const [oficio, setOficio] = useState(false);
  const [lista_oficios, setListaOficios] = useState([]);

  React.useEffect(() => {
    if (persona) {
      API.getOficios().then(setListaOficios);
    }
  }, [persona]);

  props.navigation.setOptions({
    headerTitle: 'Editar Participante',
  });

  const save = () => {
    if (loading) return;
    const data = {
      nombre: name,
      apellido_paterno: apPaterno,
      apellido_materno: apMaterno,
      nombre_corto: nombreCorto,
      fecha_nacimiento: birthday,
      estado_civil: estadoCivil,
      sexo: gender,
      email: email,
      escolaridad: escolaridad,
      oficio: oficio,
      domicilio: {
        domicilio: domicilio,
        colonia: colonia,
        municipio: municipio,
        telefono_casa: phoneHome,
        telefono_movil: phoneMobile,
      },
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
    });

    if (!valid) {
      return Alert.alert('Error', prompt);
    }

    setLoading(true);
    API.editParticipante(capacitacion_id, persona.id, data)
      .then((done) => {
        setLoading(false);
        if (!done)
          return Alert.alert(
            'Error',
            'Hubo un error editando el participante.'
          );
        data.fecha_nacimiento = {
          _seconds: moment(birthday, 'YYYY-MM-DD').unix(),
        };
        onEdit(data);
        Alert.alert('Exito', 'Se ha editado el participante.');
      })
      .catch((err) => {
        console.log(err);
        Alert.alert('Error', 'Hubo un error editando el miembro.');
        setLoading(false);
      });
  };

  // const formatDate = (a) => {
  //   const f = moment(a, 'YYYY-MM-DD').format('MMMM DD, YYYY');
  //   return f.charAt(0).toUpperCase() + f.substr(1);
  // };

  const getEstadoCivil = () => {
    return ['Soltero', 'Casado', 'Viudo', 'Unión Libre', 'Divorciado'].indexOf(
      persona.estado_civil
    );
  };

  const getGenero = () => {
    return ['Masculino', 'Femenino', 'Sin especificar'].indexOf(persona.sexo);
  };

  const getEscolaridad = () => {
    return [
      'Ninguno',
      'Primaria',
      'Secundaria',
      'Técnica carrera',
      'Maestría',
      'Doctorado',
    ].indexOf(persona.escolaridad);
  };

  const getOficio = () => {
    return lista_oficios.length > 0
      ? lista_oficios?.findIndex((val) => {
          return val.label === persona.oficio;
        })
      : 0;
  };

  return (
    <KeyboardAwareScrollView style={styles.loginContainer} bounces={true}>
      <Text style={styles.header}>Editar Participante</Text>
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
      <Input
        name="Nombre Corto"
        value={nombreCorto}
        onChangeText={setNombreCorto}
      />
      <Picker
        name="Sexo"
        items={['Masculino', 'Femenino', 'Sin especificar']}
        onValueChange={setGender}
        select={getGenero()}
        required
      />
      <DatePicker
        onDateChange={(d) => setBirthday(d)}
        date={birthday}
        name="Fecha de nacimiento"
      />

      <Input
        name="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder={'Opcional...'}
        keyboard={'email-address'}
      />
      <Picker
        name="Estado Civil"
        items={['Soltero', 'Casado', 'Viudo', 'Unión Libre', 'Divorciado']}
        onValueChange={setEstadoCivil}
        required
        select={getEstadoCivil()}
      />
      <Picker
        name="Grado escolaridad"
        required
        items={[
          'Ninguno',
          'Primaria',
          'Secundaria',
          'Técnica carrera',
          'Maestría',
          'Doctorado',
        ]}
        onValueChange={setEscolaridad}
        select={getEscolaridad()}
      />
      <Picker
        name="Oficio"
        required
        items={lista_oficios}
        onValueChange={(oficio = 'Ninguno') => setOficio(oficio.label)}
        select={getOficio()}
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

      <Button text="Guardar" loading={loading} onPress={save} />
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
