/* 
Nombre: FichaMedica.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver la ficha medica de un miembro de un grupo HEMA
*/
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, CheckBox } from 'react-native';
import { API } from '../../lib';
import { Input, Button, Picker, Alert } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default (props) => {
  var { persona, canEdit } = props.route.params;
  if (!persona.ficha_medica) {
    persona.ficha_medica = {
      tipo_sangre: false,
      servicio_medico: false,
      alergico: false,
      alergico_desc: '',
      p_cardiovascular: false,
      p_azucar: false,
      p_hipertension: false,
      p_sobrepeso: false,
      seguridad_social: false,
      discapacidad: false,
      discapacidad_desc: '',
      ambulancia: false,
    };
  }

  var [bloodType, setBloodType] = useState(persona.ficha_medica.tipo_sangre);
  var [medicalService, setMedicalService] = useState(
    persona.ficha_medica.servicio_medico
  );
  var [alergic, setAlergic] = useState(persona.ficha_medica.alergico);
  var [alergicDesc, setAlergicDesc] = useState(
    persona.ficha_medica.alergico_desc
  );
  var [cardiovascular, setCardiovascular] = useState(
    persona.ficha_medica.p_cardiovascular
  );
  var [azucar, setAzucar] = useState(persona.ficha_medica.p_azucar);
  var [hipertension, setHipertension] = useState(
    persona.ficha_medica.p_hipertension
  );
  var [sobrepeso, setSobrepeso] = useState(persona.ficha_medica.p_sobrepeso);
  var [socialSecurity, setSocialSecurity] = useState(
    persona.ficha_medica.seguridad_social
  );
  var [disability, setDisability] = useState(persona.ficha_medica.discapacidad);
  var [disabilityDesc, setDisabilityDesc] = useState(
    persona.ficha_medica.discapacidad_desc
  );
  var [ambulance, setAmbulance] = useState(persona.ficha_medica.ambulancia);
  var [loading, setLoading] = useState(false);

  props.navigation.setOptions({
    headerTitle: 'Ficha Medica',
  });

  var saveFicha = () => {
    var data = {
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
    };
    if (bloodType === undefined) {
      Alert.alert('Error', 'Error: Tipo de sangre no escogido');
      return;
    }
    setLoading(true);
    API.setFichaMedica(persona.id, data)
      .then((done) => {
        setLoading(false);
        Alert.alert('Exito', 'Se ha guardado la ficha medica.');
        props.navigation.goBack();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        Alert.alert('Error', 'Hubo un error guardando la ficha medica');
      });
  };

  var getServicioMedico = () => {
    if (!persona.ficha_medica.servicio_medico) return '';
    return ['Ninguno', 'Público', 'Privado'].indexOf(
      persona.ficha_medica.servicio_medico
    );
  };

  var getSocialSecurity = () => {
    if (!persona.ficha_medica.seguridad_social) return '';
    return ['Ninguno', 'Pensionado', 'Jubilado', 'Apoyo Federal'].indexOf(
      persona.ficha_medica.seguridad_social
    );
  };

  var getBloodType = () => {
    if (!persona.ficha_medica.tipo_sangre) return -1;
    return ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].indexOf(
      persona.ficha_medica.tipo_sangre
    );
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ padding: 15, marginTop: 10 }}>
      {canEdit ? (
        <Picker
          readonly={!canEdit}
          name={'Tipo de Sangre'}
          items={['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']}
          select={getBloodType()}
          onValueChange={setBloodType}
        />
      ) : (
        <Input
          value={persona.ficha_medica.tipo_sangre}
          name="Tipo de Sangre"
          readonly={true}
        />
      )}
      {canEdit ? (
        <Picker
          name={'Servicio Médico'}
          items={['Ninguno', 'Público', 'Privado']}
          select={getServicioMedico()}
          onValueChange={setMedicalService}
        />
      ) : (
        <Input
          value={persona.ficha_medica.servicio_medico}
          name="Servicio Médico"
          readonly={true}
        />
      )}

      <Text style={styles.label}>¿Alergias?</Text>
      <View style={styles.checkboxContainer}>
        <Switch
          disabled={!canEdit}
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

      <Text style={styles.label}>Padecimientos</Text>
      <View style={styles.checkboxContainer}>
        <CheckBox
          style={styles.checkbox}
          value={cardiovascular}
          onValueChange={setCardiovascular}
        />
        <Text style={styles.padecimientos}>Problema Cardiovascular</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox
          style={styles.checkbox}
          value={azucar}
          onValueChange={setAzucar}
        />
        <Text style={styles.padecimientos}>Problema de Azúcar</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox
          style={styles.checkbox}
          value={hipertension}
          onValueChange={setHipertension}
        />
        <Text style={styles.padecimientos}>Hipertensión</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox
          style={styles.checkbox}
          value={sobrepeso}
          onValueChange={setSobrepeso}
        />
        <Text style={styles.padecimientos}>Sobrepeso</Text>
      </View>

      <Text style={styles.label}>Servicio de Ambulancia</Text>
      <View style={styles.checkboxContainer}>
        <Switch
          disabled={!canEdit}
          trackColor={{ false: '#767577', true: '#32CD32' }}
          thumbColor={ambulance ? '#FFFFFF' : '#f4f3f4'}
          onValueChange={setAmbulance}
          value={ambulance}
        />
      </View>

      {canEdit ? (
        <Picker
          name={'Seguridad Social'}
          items={['Ninguno', 'Pensionado', 'Jubilado', 'Apoyo Federal']}
          select={getSocialSecurity()}
          onValueChange={setSocialSecurity}
        />
      ) : (
        <Input
          value={persona.ficha_medica.socialSecurity}
          name="Seguridad Social"
          readonly={true}
        />
      )}

      <Text style={styles.label}>¿Discapacidad?</Text>
      <View style={styles.checkboxContainer}>
        <Switch
          disabled={!canEdit}
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
      {canEdit && (
        <Button text={'Guardar'} onPress={saveFicha} loading={loading} />
      )}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start', // if you want to fill rows left to right
  },
  item: {
    width: '10%', // is 50% of container width
  },
  fields: {
    width: '100%',
    height: 55,
    margin: 0,
    padding: 8,
    color: 'black',
    borderRadius: 14,
    fontSize: 18,
    fontWeight: '500',
  },
  boton: {
    paddingTop: '50%',
    backgroundColor: '#42A5F5',
    color: 'black',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'grey',
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  checkbox: {
    height: 25,
    width: 25,
  },
  padecimientos: {
    fontSize: 15,
    marginLeft: 10,
    textAlignVertical: 'center',
  },
});
