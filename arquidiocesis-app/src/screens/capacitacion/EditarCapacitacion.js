/* 
Nombre: EditarCapacitación.js
Usuario con acceso: Admin, Acompañante
Descripción: Pantalla para editar la información a detalle de un grupo de capacitación 
*/
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Input, Button, Alert, DatePicker } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  var { capacitacion, onEdit } = props.route.params;

  var fi = moment.unix(capacitacion.inicio._seconds).format('YYYY-MM-DD');
  var ff = moment.unix(capacitacion.fin._seconds).format('YYYY-MM-DD');

  var [loading, setLoading] = useState(false);
  var [name, setName] = useState(capacitacion.nombre);
  var [dateStart, setDateStart] = useState(fi);
  var [dateEnd, setDateEnd] = useState(ff);

  props.navigation.setOptions({
    headerTitle: 'Editar capacitación',
  });

  var save = () => {
    var data = {
      nombre: name,
      inicio: dateStart,
      fin: dateEnd,
    };
    var { valid, prompt } = Util.validateForm(data, {
      nombre: {
        type: 'empty',
        prompt: 'Favor de introducir el nombre de la capacitación.',
      },
      inicio: {
        type: 'empty',
        prompt: 'Favor de introducir la fecha de inicio de la capacitación.',
      },
      fin: {
        type: 'empty',
        prompt: 'Favor de introducir la fecha fin de la capacitación.',
      },
    });

    if (!valid) {
      return Alert.alert('Error', prompt);
    }

    var inMom = moment(data.inicio, 'YYYY-MM-DD');
    if (!inMom.isValid()) {
      return Alert.alert(
        'Error',
        'Favor de introducir la fecha de inicio de la capacitación.'
      );
    }
    var finMom = moment(data.fin, 'YYYY-MM-DD');
    if (!finMom.isValid()) {
      return Alert.alert(
        'Error',
        'Favor de introducir la fecha fin de la capacitación.'
      );
    }
    if (inMom.isAfter(finMom)) {
      return Alert.alert(
        'Error',
        'La fecha de inicio debe de ser antes de la fecha final.'
      );
    }

    API.editCapacitacion(capacitacion.id, data)
      .then((done) => {
        data.inicio = {
          _seconds: inMom.unix(),
        };
        data.fin = {
          _seconds: finMom.unix(),
        };
        onEdit(data);
        setLoading(false);
        Alert.alert('Exito', 'Se ha editado la capacitación.');
      })
      .catch((err) => {
        console.log(err);
        Alert.alert('Error', 'Hubo un error editado la capacitación.');
        setLoading(false);
      });
  };

  return (
    <KeyboardAwareScrollView style={styles.loginContainer} bounces={false}>
      <Input name="Nombre" required value={name} onChangeText={setName} />
      <DatePicker
        onDateChange={(d) => setDateStart(d)}
        date={dateStart}
        name="Fecha inicio"
      />
      <DatePicker
        onDateChange={(d) => setDateEnd(d)}
        date={dateEnd}
        name="Fecha fin"
      />
      <Button text="Guardar" onPress={save} loading={loading} />
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
    marginBottom: 20,
  },
});
