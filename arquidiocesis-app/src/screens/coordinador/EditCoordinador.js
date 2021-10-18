/* 
Nombre: EditCoordinador.js
Usuario con acceso: Admin
Descripción: Pantalla para editar la información personal de los coordinadores en el sistema
*/
import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Input, Button, Picker, Alert, DatePicker } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  const { onEdit, persona } = props.route.params;

  let bd = moment.unix(persona.fecha_nacimiento._seconds);
  if (!bd.isValid()) bd = moment();

  const [identificador, setIdentificador] = useState(
    persona.identificador || undefined
  );
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(persona.nombre);
  const [apPaterno, setApPaterno] = useState(persona.apellido_paterno);
  const [apMaterno, setApMaterno] = useState(persona.apellido_materno);
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

  props.navigation.setOptions({
    headerTitle: 'Editar Coordinador',
  });

  const doRegister = () => {
    if (loading) return;

    const data = {
      identificador,
      nombre: name,
      apellido_paterno: apPaterno,
      apellido_materno: apMaterno,
      fecha_nacimiento: birthday,
      estado_civil: estadoCivil,
      sexo: gender,
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
      identificador: {
        type: 'empty',
        prompt: 'Favor de introducir el identificador del coordinador.',
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
    });

    if (!valid) {
      return Alert.alert('Error', prompt);
    }
    setLoading(true);

    API.editCoordinador(persona.id, data)
      .then((done) => {
        setLoading(false);
        if (!done)
          return Alert.alert('Error', 'Hubo un error editando el coordinador.');
        data.fecha_nacimiento = {
          _seconds: moment(birthday, 'YYYY-MM-DD').unix(),
        };
        onEdit(data);
        Alert.alert('Exito', 'Se ha editado el coordinador.');
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
          'Ya existe un coordinador con el identificador proporcionado.'
        ) {
          return Alert.alert('Error', err.message);
        }

        return Alert.alert('Error', 'Hubo un error editando el coordinador.');
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

  React.useEffect(() => {
    if (persona) {
      API.getOficios().then(setListaOficios);
    }
  }, [persona]);

  return (
    <KeyboardAwareScrollView style={styles.loginContainer} bounces={true}>
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
        items={['Soltero', 'Casado', 'Viudo', 'Unión Libre', 'Divorciado']}
        onValueChange={setEstadoCivil}
        select={getEstadoCivil()}
      />
      <Picker
        name="Sexo"
        required
        items={['Masculino', 'Femenino', 'Sin especificar']}
        onValueChange={setGender}
        select={getGenero()}
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
