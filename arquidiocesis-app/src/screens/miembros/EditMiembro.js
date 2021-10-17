/* 
Nombre: EditMiembro.js
Usuario con acceso: Admin
Descripción: Pantalla para editar la información personal de un miembro de un grupo HEMA
*/
import React, { useState } from 'react';
import { Text, StyleSheet, CheckBox, View } from 'react-native';
import { Input, Button, Picker, Alert, DatePicker } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  const { persona } = props.route.params;

  let bd = moment.unix(persona.fecha_nacimiento._seconds);
  if (!bd.isValid()) bd = moment();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(persona.nombre);
  const [apPaterno, setApPaterno] = useState(persona.apellido_paterno);
  const [apMaterno, setApMaterno] = useState(persona.apellido_materno);
  const [email, setEmail] = useState(persona.email);
  const [birthday, setBirthday] = useState(bd.format('YYYY-MM-DD'));
  const [gender, setGender] = useState(persona.sexo);
  const [estadoCivil, setEstadoCivil] = useState(persona.estado_civil);
  const [domicilio, setDomicilio] = useState(persona.domicilio.domicilio);
  const [colonia, setColonia] = useState(persona.domicilio.colonia);
  const [municipio, setMunicipio] = useState(persona.domicilio.municipio);
  const [phoneHome, setPhoneHome] = useState(persona.domicilio.telefono_casa);
  const [phoneMobile, setPhoneMobile] = useState(
    persona.domicilio.telefono_movil
  );
  const [escolaridad, setEscolaridad] = useState(persona.escolaridad);
  const [oficio, setOficio] = useState(persona.oficio);
  const [hasLaptop, setHasLaptop] = useState(persona.laptop);
  const [hasTablet, setHasTablet] = useState(persona.tablet);
  const [hasSmartphone, setHasSmartphone] = useState(persona.smartphone);
  const [hasFacebook, setHasFacebook] = useState(persona.facebook);
  const [hasTwitter, setHasTwitter] = useState(persona.twitter);
  const [hasInstagram, setHasInstagram] = useState(persona.instagram);
  // const pickerRef = useRef(null);

  const { onEdit } = props.route.params;

  props.navigation.setOptions({
    headerTitle: 'Editar Miembro',
  });
  const [lista_oficios, setListaOficios] = useState([]);

  const save = () => {
    if (loading) return;
    const data = {
      nombre: name,
      apellido_paterno: apPaterno,
      apellido_materno: apMaterno,
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
      laptop: hasLaptop,
      smartphone: hasSmartphone,
      tablet: hasTablet,
      facebook: hasFacebook,
      twitter: hasTwitter,
      instagram: hasInstagram,
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
    API.editMiembro(persona.id, data)
      .then((done) => {
        setLoading(false);
        if (!done)
          return Alert.alert('Error', 'Hubo un error editando el miembro.');
        data.fecha_nacimiento = {
          _seconds: moment(birthday, 'YYYY-MM-DD').unix(),
        };
        onEdit(data);
        Alert.alert('Exito', 'Se ha editado el miembro.');
        props.navigation.goBack();
      })
      .catch((err) => {
        if (err.code && err.code === 999) {
          Alert.alert('Error', 'No tienes acceso a este grupo.');
        } else {
          Alert.alert('Error', 'Hubo un error editando el miembro.');
        }
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
      'Preparatoria',
      'Carrera Técnica',
      'Profesional',
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
      <Text style={styles.header}>Editar Miembro</Text>
      <Input name="Nombre" value={name} onChangeText={setName} />
      <Input
        name="Apellido Paterno"
        value={apPaterno}
        onChangeText={setApPaterno}
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
        items={['Soltero', 'Casado', 'Viudo', 'Unión Libre', 'Divorciado']}
        onValueChange={setEstadoCivil}
        select={getEstadoCivil()}
      />
      <Picker
        name="Sexo"
        items={['Masculino', 'Femenino', 'Sin especificar']}
        onValueChange={setGender}
        select={getGenero()}
      />
      <Input
        name="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder={'Opcional...'}
        keyboard={'email-address'}
      />
      <Picker
        name="Grado escolaridad"
        items={[
          'Ninguno',
          'Primaria',
          'Secundaria',
          'Preparatoria',
          'Carrera Técnica',
          'Profesional',
        ]}
        onValueChange={setEscolaridad}
        select={getEscolaridad()}
      />
      <Picker
        name="Oficio"
        items={lista_oficios}
        onValueChange={(oficio = 'Ninguno') => setOficio(oficio.label)}
        select={getOficio}
      />
      <Text style={styles.dispositivosHeader}>
        Indica los dispositivos que tenga
      </Text>
      <View style={styles.view}>
        <CheckBox
          style={styles.checkbox}
          value={hasLaptop}
          onValueChange={setHasLaptop}
        />
        <Text style={styles.dispositivos}>Laptop</Text>
      </View>
      <View style={styles.view}>
        <CheckBox
          style={styles.checkbox}
          value={hasTablet}
          onValueChange={setHasTablet}
        />
        <Text style={styles.dispositivos}>Tablet</Text>
      </View>
      <View style={styles.view}>
        <CheckBox
          style={styles.checkbox}
          value={hasSmartphone}
          onValueChange={setHasSmartphone}
        />
        <Text style={styles.dispositivos}>Smartphone</Text>
      </View>
      <Text style={styles.dispositivosHeader}>
        Indica las redes sociales que tenga
      </Text>
      <View style={styles.view}>
        <CheckBox
          style={styles.checkbox}
          value={hasFacebook}
          onValueChange={setHasFacebook}
        />
        <Text style={styles.dispositivos}>Facebook</Text>
      </View>
      <View style={styles.view}>
        <CheckBox
          style={styles.checkbox}
          value={hasTwitter}
          onValueChange={setHasTwitter}
        />
        <Text style={styles.dispositivos}>Twitter</Text>
      </View>
      <View style={styles.view}>
        <CheckBox
          style={styles.checkbox}
          value={hasInstagram}
          onValueChange={setHasInstagram}
        />
        <Text style={styles.dispositivos}>Instagram</Text>
      </View>
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
  checkbox: {
    height: 25,
    width: 25,
  },
  dispositivosHeader: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
    fontWeight: '500',
  },
  dispositivos: {
    fontSize: 20,
    marginLeft: 10,
    textAlignVertical: 'center',
  },
  view: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
    marginTop: 10,
  },
});
