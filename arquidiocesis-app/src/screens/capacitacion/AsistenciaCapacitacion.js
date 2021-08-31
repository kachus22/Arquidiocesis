/* 
Nombre: AsistenciaCapacitacion.js
Usuario con acceso: Admin, Acompañante, Coordinador
Descripción: Pantalla que permite tomar asistencia en los grupos de capacitación
*/
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import { Alert, DatePicker } from '../../components';
import { Util, API } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

var Screen = (props) => {
  var { isNew, capacitacion, onAssistance, date } = props.route.params;

  var [data, setData] = useState(false);
  var [date, setDate] = useState(
    isNew ? moment().format('YYYY-MM-DD') : props.route.params.date
  );
  var [sending, setSending] = useState(false);
  var [assistance, setAssistance] = useState([]);

  props.navigation.setOptions({
    headerTitle: isNew ? 'Tomar asistencia' : 'Editar asistencia',
  });

  // When the screen is shown get data for this group.
  useEffect(() => {
    if (isNew) {
      API.getParticipantes(capacitacion)
        .then((p) => {
          setData(p);
        })
        .catch((err) => {
          Alert.alert('Error', 'Error cargando los participantes.');
          props.navigation.goBack();
        });
    } else {
      API.getCapacitacionAsistencia(capacitacion, date)
        .then((d) => {
          setData(d.miembros);
          setAssistance(d.miembros.filter((a) => a.assist).map((a) => a.id));
        })
        .catch((err) => {
          console.log(err);
          if (err.code == 34) {
            props.route.params.onDelete(date);
          }
          Alert.alert(
            'Error cargando asistencia',
            'La asistencia solicitada no existe.'
          );
          props.navigation.goBack();
        });
    }
  }, []);

  // Cargando datos
  if (data === false) {
    return (
      <View style={{ marginTop: 50 }}>
        <ActivityIndicator size="large" />
        <Text
          style={{
            marginTop: 10,
            textAlign: 'center',
            fontWeight: '600',
            fontSize: 16,
          }}>
          Cargando datos...
        </Text>
      </View>
    );
  }

  var onCheck = (id, checked) => {
    setAssistance((p) =>
      checked ? Array.from(new Set([...p, id])) : p.filter((a) => a != id)
    );
  };

  // Ordenar datos
  var orderedData = Util.organizeListData(data, 'nombre');
  var components = [];
  var headers = [];
  for (var i in orderedData) {
    headers.push(components.length);
    components.push(
      <View key={'header-' + i} style={styles.header}>
        <Text style={styles.headerText}>{i}</Text>
      </View>
    );
    components.push(
      ...orderedData[i].map((a, ix) => (
        <CheckboxItem
          {...a}
          onCheck={onCheck}
          key={'item' + i + '-' + ix}
          checked={assistance.findIndex((b) => b == a.id) != -1}
        />
      ))
    );
  }

  var formatDate = (a) => {
    var f = moment(a, 'YYYY-MM-DD').format('MMMM DD, YYYY');
    return f.charAt(0).toUpperCase() + f.substr(1);
  };

  var showOverwrite = () => {
    Alert.alert(
      'Asistencia ya existe',
      'Ya se ha tomado asistencia en esta fecha de este capacitación, ¿Deseas reemplazarla por esta?',
      [
        { style: 'cancel', text: 'Cancelar' },
        {
          text: 'Reemplazar',
          onPress: () => {
            saveAsistencia(true);
          },
        },
      ]
    );
  };

  var saveAsistencia = (force = false) => {
    setSending(true);
    if (isNew) {
      API.registerCapacitacionAsistencia(capacitacion, date, assistance, force)
        .then((done) => {
          setSending(false);
          onAssistance(done);
          Alert.alert('Exito', 'Se ha guardado la asistencia.');
          props.navigation.goBack();
        })
        .catch((err) => {
          if (err.code == 52 && !force) {
            showOverwrite();
          } else {
            setSending(false);
            Alert.alert('Error', 'Hubo un error marcando la asistencia.');
          }
        });
    } else {
      API.saveCapacitacionAsistencia(capacitacion, date, assistance)
        .then((done) => {
          if (done.deleted) {
            props.route.params.onDelete(done.date);
          }
          setSending(false);
          Alert.alert('Exito', 'Se ha guardado la asistencia.');
          props.navigation.goBack();
        })
        .catch((err) => {
          setSending(false);
          Alert.alert('Error', 'Hubo un error marcando la asistencia.');
        });
    }
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <DatePicker onDateChange={(d) => setDate(d)} date={date} name="Fecha" />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 50 }}
        stickyHeaderIndices={headers}>
        {components}
      </ScrollView>
      <View
        style={{
          backgroundColor: '#012E60',
          position: 'absolute',
          bottom: 50,
          width: 200,
          borderRadius: 100,
          alignSelf: 'center',
        }}>
        <TouchableOpacity onPress={() => saveAsistencia(false)}>
          {sending ? (
            <ActivityIndicator size={'small'} style={{ padding: 12 }} />
          ) : (
            <Text
              style={{
                color: 'white',
                fontSize: 20,
                textAlign: 'center',
                padding: 10,
              }}>
              Guardar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Screen;

var CheckboxItem = (props) => {
  var [checked, setChecked] = useState(props.checked);
  var onPress = () => {
    props.onCheck(props.id, !checked);
    setChecked(!checked);
  };

  useEffect(() => {
    setChecked(props.checked);
  }, [props.checked]);

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'white',
        }}>
        <CheckBox
          checked={checked}
          onPress={onPress}
          containerStyle={{ marginRight: 0 }}
        />
        <Text style={{ fontSize: 16 }} numberOfLines={1}>
          {props.nombre} {props.apellido_paterno} {props.apellido_materno}
        </Text>
      </View>
    </TouchableOpacity>
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
  header: {
    backgroundColor: '#F7F7F7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCC',
    width: '100%',
    padding: 5,
    paddingHorizontal: 15,
  },
  headerText: {
    fontWeight: '600',
  },
});
