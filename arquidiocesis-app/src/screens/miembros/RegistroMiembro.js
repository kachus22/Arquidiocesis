/* 
Nombre: RegistroMiembro.js
Usuario con acceso: Admin
Descripción: Pantalla para registrar un miembro de un grupo HEMA
*/
import React, { useState, useRef } from 'react';
import { Text, StyleSheet, CheckBox, View, Switch } from 'react-native';
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
  var [phoneMobile, setPhoneMobile] = useState('');
  var [escolaridad, setEscolaridad] = useState(false);
  var [oficio, setOficio] = useState(false);
  let [hasLaptop, setHasLaptop] = useState(false);
  let [hasTablet, setHasTablet] = useState(false);
  let [hasSmartphone, setHasSmartphone] = useState(false);
  let [hasFacebook, setHasFacebook] = useState(false);
  let [hasTwitter, setHasTwitter] = useState(false);
  let [hasInstagram, setHasInstagram] = useState(false);

  var [bloodType, setBloodType] = useState(false);
  var [medicalService, setMedicalService] = useState(false);
  var [alergic, setAlergic] = useState(false);
  var [alergicDesc, setAlergicDesc] = useState('');
  var [cardiovascular, setCardiovascular] = useState(false);
  var [azucar, setAzucar] = useState(false);
  var [hipertension, setHipertension] = useState(false);
  var [sobrepeso, setSobrepeso] = useState(false);
  var [socialSecurity, setSocialSecurity] = useState(false);
  var [disability, setDisability] = useState(false);
  var [disabilityDesc, setDisabilityDesc] = useState('');
  var [ambulance, setAmbulance] = useState(false);

  var pickerRef = useRef(null);

  var onAdd = props.route.params.onAdd;
  var group = props.route.params.grupo;

  props.navigation.setOptions({
    headerTitle: 'Registro Miembro',
  });

  const lista_oficios = [
    { label: 'Ninguno', value: 'Ninguno' },
    { label: 'Plomero', value: 'Plomero' },
    { label: 'Electricista', value: 'Electricista' },
    { label: 'Carpintero', value: 'Carpintero' },
    { label: 'Albañil', value: 'Albañil' },
    { label: 'Pintor', value: 'Pintor' },
    { label: 'Mecánico', value: 'Mecánico' },
    { label: 'Músico', value: 'Músico' },
    { label: 'Chofer', value: 'Chofer' },
    { label: 'Maestra', value: 'Maestra' },
    { label: 'Ama de Casa', value: 'Ama de Casa' },
    { label: 'Enfermera', value: 'Enfermera' },
    { label: 'Obrera general', value: 'Obrera general' },
    { label: 'Trabajadora Social', value: 'Trabajadora Social' },
    { label: 'Educadora', value: 'Educadora' },
    { label: 'Doctora', value: 'Doctora' },
    { label: 'Contadora', value: 'Contadora' },
    { label: 'Cocinera', value: 'Cocinera' },
    { label: 'Psicologa', value: 'Psicologa' },
    { label: 'Costurera', value: 'Costurera' },
    { label: 'Secretaria', value: 'Secretaria' },
    { label: 'Asistente', value: 'Asistente' },
    { label: 'Vendedora', value: 'Vendedora' },
    { label: 'Demostradora', value: 'Demostradora' },
    { label: 'Dentista', value: 'Dentista' },
    { label: 'Estilista', value: 'Estilista' },
    { label: 'Policia', value: 'Policia' },
  ];

  var doRegister = () => {
    if (loading) return;

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
      ficha_medica: {
        tipo_sangre: bloodType,
        servicio_medico: medicalService,
        alergico: alergic,
        alergico_desc: alergic ? alergicDesc : '',
        p_cardiovascular: cardiovascular,
        p_azucar: azucar,
        p_hipertension: hipertension,
        p_sobrepeso: sobrepeso,
        seguridad_social: socialSecurity,
        discapacidad: disability,
        discapacidad_desc: disability ? disabilityDesc : '',
        ambulancia: ambulance,
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
    });

    if (!valid) {
      return Alert.alert('Error', prompt);
    }

    if (!bloodType || !medicalService || !socialSecurity) {
      return Alert.alert(
        'Error',
        'Favor de llenar información de ficha médica.'
      );
    }

    setLoading(true);
    API.registerMember(group.id, data)
      .then((new_member) => {
        setLoading(false);
        if (!new_member)
          return Alert.alert('Error', 'Hubo un error registrando el miembro');
        if (onAdd) onAdd(new_member);
        Alert.alert('Exito', 'Se ha agregado el miembro al grupo.');
        props.navigation.goBack();
      })
      .catch((err) => {
        if (err.code && err.code == 999) {
          Alert.alert('Error', 'No tienes acceso a este grupo.');
        } else {
          Alert.alert('Error', 'Hubo un error registrando el miembro');
        }
        setLoading(false);
      });
  };

  var formatDate = (a) => {
    var f = moment(a, 'YYYY-MM-DD').format('MMMM DD, YYYY');
    return f.charAt(0).toUpperCase() + f.substr(1);
  };

  return (
    <KeyboardAwareScrollView style={styles.loginContainer} bounces={true}>
      <Text style={styles.header}>Registrar Miembro</Text>
      <Text style={styles.subHeader}>{group.nombre}</Text>
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
        name="Fecha"
      />
      <Picker
        name="Estado Civil"
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
        items={[
          { label: 'Masculino', value: 'Masculino' },
          { label: 'Femenino', value: 'Femenino' },
          { label: 'Sin especificar', value: 'Sin especificar' },
        ]}
        onValueChange={setGender}
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
          { label: 'Ninguno', value: 'Ninguno' },
          { label: 'Primaria', value: 'Primaria' },
          { label: 'Secundaria', value: 'Secundaria' },
          { label: 'Preparatoria', value: 'Preparatoria' },
          { label: 'Carrera Técnica', value: 'Carrera Técnica' },
          { label: 'Profesional', value: 'Profesional' },
        ]}
        onValueChange={setEscolaridad}
      />
      <Picker name="Oficio" items={lista_oficios} onValueChange={setOficio} />
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
      <Text style={styles.section}>Ficha Médica</Text>
      <Picker
        name={'Tipo de Sangre'}
        items={['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']}
        onValueChange={setBloodType}
      />
      <Picker
        name={'Servicio Médico'}
        items={['Ninguno', 'Público', 'Privado']}
        onValueChange={setMedicalService}
      />
      <Text style={styles.dispositivosHeader}>¿Alergias?</Text>
      <View style={styles.view}>
        <Switch
          trackColor={{ false: '#767577', true: '#32CD32' }}
          thumbColor={alergic ? '#FFFFFF' : '#f4f3f4'}
          onValueChange={setAlergic}
          value={alergic}
        />
      </View>
      {alergic && (
        <Input
          name="Descripción de alergia"
          value={alergicDesc}
          onChangeText={setAlergicDesc}
        />
      )}
      <Text style={styles.dispositivosHeader}>Padecimientos</Text>
      <View style={styles.view}>
        <CheckBox
          style={styles.checkbox}
          value={cardiovascular}
          onValueChange={setCardiovascular}
        />
        <Text style={styles.dispositivos}>Problema Cardiovascular</Text>
      </View>
      <View style={styles.view}>
        <CheckBox
          style={styles.checkbox}
          value={azucar}
          onValueChange={setAzucar}
        />
        <Text style={styles.dispositivos}>Problema de Azúcar</Text>
      </View>
      <View style={styles.view}>
        <CheckBox
          style={styles.checkbox}
          value={hipertension}
          onValueChange={setHipertension}
        />
        <Text style={styles.dispositivos}>Hipertensión</Text>
      </View>
      <View style={styles.view}>
        <CheckBox
          style={styles.checkbox}
          value={sobrepeso}
          onValueChange={setSobrepeso}
        />
        <Text style={styles.dispositivos}>Sobrepeso</Text>
      </View>

      <Text style={styles.dispositivosHeader}>Servicio de Ambulancia</Text>
      <View style={styles.view}>
        <Switch
          trackColor={{ false: '#767577', true: '#32CD32' }}
          thumbColor={ambulance ? '#FFFFFF' : '#f4f3f4'}
          onValueChange={setAmbulance}
          value={ambulance}
        />
      </View>
      <Picker
        name={'Seguridad Social'}
        items={['Ninguno', 'Pensionado', 'Jubilado', 'Apoyo Federal']}
        onValueChange={setSocialSecurity}
      />
      <Text style={styles.dispositivosHeader}>¿Discapacidad?</Text>
      <View style={styles.view}>
        <Switch
          trackColor={{ false: '#767577', true: '#32CD32' }}
          thumbColor={disability ? '#FFFFFF' : '#f4f3f4'}
          onValueChange={setDisability}
          value={disability}
        />
      </View>
      {disability && (
        <Input
          name="Descripción de discapacidad"
          value={disabilityDesc}
          onChangeText={setDisabilityDesc}
        />
      )}

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
