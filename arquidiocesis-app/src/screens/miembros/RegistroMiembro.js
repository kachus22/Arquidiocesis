/* 
Nombre: RegistroMiembro.js
Usuario con acceso: Admin
Descripción: Pantalla para registrar un miembro de un grupo HEMA
*/
import * as DocumentPicker from 'expo-document-picker';
import readXlsxFile from 'read-excel-file';
import React, { useState } from 'react';
import { Text, StyleSheet, CheckBox, View, Switch } from 'react-native';
import { Input, Button, Picker, Alert, DatePicker } from '../../components';
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
  const [gender, setGender] = useState(false);
  const [estadoCivil, setEstadoCivil] = useState(false);
  const [domicilio, setDomicilio] = useState('');
  const [colonia, setColonia] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [phoneHome, setPhoneHome] = useState('');
  const [phoneMobile, setPhoneMobile] = useState('');
  const [escolaridad, setEscolaridad] = useState(false);
  const [oficio, setOficio] = useState('Ninguno');
  const [hasLaptop, setHasLaptop] = useState(false);
  const [hasTablet, setHasTablet] = useState(false);
  const [hasSmartphone, setHasSmartphone] = useState(false);
  const [hasFacebook, setHasFacebook] = useState(false);
  const [hasTwitter, setHasTwitter] = useState(false);
  const [hasInstagram, setHasInstagram] = useState(false);

  const [bloodType, setBloodType] = useState(false);
  const [medicalService, setMedicalService] = useState(false);
  const [alergic, setAlergic] = useState(false);
  const [alergicDesc, setAlergicDesc] = useState('');
  const [cardiovascular, setCardiovascular] = useState(false);
  const [azucar, setAzucar] = useState(false);
  const [hipertension, setHipertension] = useState(false);
  const [sobrepeso, setSobrepeso] = useState(false);
  const [socialSecurity, setSocialSecurity] = useState(false);
  const [disability, setDisability] = useState(false);
  const [disabilityDesc, setDisabilityDesc] = useState('');
  const [ambulance, setAmbulance] = useState(false);
  const [lista_oficios, setListaOficios] = useState([]);

  // const pickerRef = useRef(null);

  const onAdd = props.route.params.onAdd;
  const group = props.route.params.grupo;

  props.navigation.setOptions({
    headerTitle: 'Registro Miembro',
  });

  React.useEffect(() => {
    API.getOficios().then(setListaOficios);
  }, []);

  const downloadFormat = async () => {
    const win = window.open('https://docs.google.com/spreadsheets/d/134EqGgTxpGc36GB6UCbcOqfBtgbo6pS-gnHOqTQxdBQ/edit?usp=sharing', '_blank');
    if (win != null) {
      win.focus();
    }
  };

  const selectOneFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
 
    console.log(result);
 
    if (!result.cancelled) {
      readXlsxFile(result.output[0]).then((rows) => {
        // `rows` is an array of rows
        // each row being an array of cells.
        rows.shift();
        rows.forEach((row, index) => {
          const data = {
            nombre: row[0],
            apellido_paterno: row[1],
            apellido_materno: row[2],
            fecha_nacimiento: row[3], //FIXME
            estado_civil: row[4],
            sexo: row[5],
            email: row[6],
            escolaridad: row[7],
            oficio: row[8],
            domicilio: {
              domicilio: row[9],
              colonia: row[10],
              municipio: row[11],
              telefono_casa: row[12],
              telefono_movil: row[13],
            },
            laptop: row[14] === 'si' ? true : false,
            smartphone: row[15] === 'si' ? true : false,
            tablet: row[16] === 'si' ? true : false,
            facebook: row[17] === 'si' ? true : false,
            twitter: row[18] === 'si' ? true : false,
            instagram: row[19] === 'si' ? true : false,
            ficha_medica: {
              tipo_sangre: row[20],
              servicio_medico: row[21],
              alergico: row[22] === 'si' ? true : false,
              alergico_desc: row[22] === 'si' ? row[23] : '',
              p_cardiovascular: row[23] === 'si' ? true : false,
              p_azucar: row[24] === 'si' ? true : false,
              p_hipertension: row[25] === 'si' ? true : false,
              p_sobrepeso: row[26] === 'si' ? true : false,
              seguridad_social: row[27],
              discapacidad: row[28] === 'si' ? true : false,
              discapacidad_desc: row[28] === 'si' ? row[29] : '',
              ambulancia: row[28] === 'si' ? true : false,
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
            return Alert.alert(`Error linea ${index}`, prompt);
          }

        setLoading(true);
        console.log('registrando.');
        API.registerMember(group.id, data)
          .then((new_member) => {
            setLoading(false);
            if (!new_member)
              return Alert.alert(`Error linea ${index}`, 'Hubo un error registrando el miembro');
            if (onAdd) onAdd(new_member);
          })
          .catch((err) => {
            if (err.code && err.code === 999) {
              Alert.alert('Error', 'No tienes acceso a este grupo.');
            } else {
              Alert.alert('Error', 'Hubo un error registrando el miembro');
            }
            setLoading(false);
          });
        });

        Alert.alert('Exito', 'Se han agregado miembros al grupo.');
        props.navigation.goBack();
      });
    }
  };

  const doRegister = () => {
    if (loading) return;

    const data = {
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
        if (err.code && err.code === 999) {
          Alert.alert('Error', 'No tienes acceso a este grupo.');
        } else {
          Alert.alert('Error', 'Hubo un error registrando el miembro');
        }
        setLoading(false);
      });
  };

  // const formatDate = (a) => {
  //   const f = moment(a, 'YYYY-MM-DD').format('MMMM DD, YYYY');
  //   return f.charAt(0).toUpperCase() + f.substr(1);
  // };

  return (
    <KeyboardAwareScrollView style={styles.loginContainer} bounces={true}>
      <Text style={styles.header}>Registrar Miembro</Text>
      <Text style={styles.subHeader}>{group.nombre}</Text>

      <Text style={styles.subHeader2}>Registrar varios</Text>

      <Button text="Descargar formato" loading={loading} onPress={downloadFormat} />
      <Button text="Registrar por archivo" loading={loading} onPress={selectOneFile} />


      <Text style={styles.subHeader2}>Registrar Individual</Text>
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
      <Picker
        name="Oficio"
        items={lista_oficios}
        onValueChange={(oficio = 'Ninguno') => setOficio(oficio.label)}
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
  subHeader2: {
    fontSize: 20,
    textAlign: 'center',
    color: 'grey',
    marginTop: 25,
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
