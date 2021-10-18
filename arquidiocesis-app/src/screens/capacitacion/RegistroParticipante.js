/* 
Nombre: RegistroParticipante.js
Usuario con acceso: Admin, Acompañante
Descripción: Pantalla para registrar un participante de un grupo de Capacitación 
*/
import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Input, Button, Picker, Alert, DatePicker } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  const { capacitacion, onAdd } = props.route.params;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [apPaterno, setApPaterno] = useState('');
  const [apMaterno, setApMaterno] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState(moment().format('YYYY-MM-DD'));
  const [gender, setGender] = useState(false);
  const [estadoCivil, setEstadoCivil] = useState(false);
  const [domicilio, setDomicilio] = useState('');
  const [colonia, setColonia] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [phoneHome, setPhoneHome] = useState('');
  const [phoneMobile, setPhoneMobile] = useState('');
  const [escolaridad, setEscolaridad] = useState(false);
  const [oficio, setOficio] = useState(false);
  const [lista_oficios, setListaOficios] = useState([]);
  // const pickerRef = useRef(null);

  React.useEffect(() => {
    API.getOficios().then(setListaOficios);
  }, []);

  const doRegister = () => {
    const data = {
      nombre: name,
      apellido_paterno: apPaterno,
      apellido_materno: apMaterno,
      nombre_corto: shortName,
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
    API.addCapacitacionParticipante(capacitacion.id, data)
      .then((done) => {
        setLoading(false);
        if (!done)
          return Alert.alert(
            'Error',
            'Hubo un error agregando el participante a la capacitación.'
          );
        Alert.alert(
          'Exito',
          'Se ha agregando el participante a la capacitación.'
        );
        data.id = done;
        onAdd(data);
        props.navigation.goBack();
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        Alert.alert(
          'Error',
          'Hubo un error agregando el participante a la capacitación.'
        );
      });
  };

  props.navigation.setOptions({
    headerTitle: 'Agregar Participante',
  });

  return (
    <KeyboardAwareScrollView style={styles.container}>
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
        value={shortName}
        onChangeText={setShortName}
      />
      <Picker
        name="Sexo"
        items={['Masculino', 'Femenino', 'Sin especificar']}
        onValueChange={setGender}
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
      />
      <Picker
        name="Grado escolaridad"
        items={[
          'Ninguno',
          'Primaria',
          'Secundaria',
          'Técnica carrera',
          'Maestría',
          'Doctorado',
        ]}
        onValueChange={setEscolaridad}
        required
      />
      <Picker
        name="Oficio"
        items={lista_oficios}
        onValueChange={(oficio = 'Ninguno') => setOficio(oficio.label)}
        required
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

      <Button text="Registrar" loading={loading} onPress={doRegister} />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
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
