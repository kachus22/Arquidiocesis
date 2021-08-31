/* 
Nombre: DetalleParticipante.js
Usuario con acceso: Admin, Acompañante, Coordinador
Descripción: Pantalla para ver la información a detalle de un participante de una capacitación 
			Tambien presenta opción para eliminar el participante
*/
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input, Item, LoadingView, ErrorView, Alert } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API } from '../../lib';
import { FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  var { onEdit, onDelete, id, capacitacion_id, canEdit } = props.route.params;

  var [loading, setLoading] = useState(false);
  var [error, setError] = useState(false);
  var [deleting, setDeleting] = useState(false);
  var [participante, setParticipante] = useState(false);
  var pickerRef = useRef(null);

  props.navigation.setOptions({
    headerTitle: 'Participante',
    headerRight: () =>
      canEdit && (
        <TouchableOpacity onPress={editParticipante}>
          <FontAwesome5
            name={'edit'}
            size={24}
            style={{ paddingRight: 15 }}
            color={'white'}
          />
        </TouchableOpacity>
      ),
  });

  useEffect(() => {
    getParticipante();
  }, []);

  var getParticipante = () => {
    setError(false);
    API.getParticipante(id)
      .then((p) => {
        setParticipante(p);
      })
      .catch((err) => {
        setError(true);
      });
  };

  if (error) {
    return (
      <ErrorView
        message="Hubo un error cargando el participante"
        retry={getParticipante}
      />
    );
  }

  if (!participante) {
    return <LoadingView />;
  }

  var formatUnix = (a) => {
    var f = !a
      ? moment().format('MMMM DD, YYYY')
      : moment.unix(a).format('MMMM DD, YYYY');
    return f.charAt(0).toUpperCase() + f.substr(1);
  };

  var deleteParticipante = () => {
    Alert.alert(
      '¿Eliminar participante?',
      'Esto eliminará sus datos de la capacitación.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setDeleting(true);
            API.removeCapacitacionParticipante(capacitacion_id, id)
              .then((done) => {
                setDeleting(false);
                if (!done)
                  return Alert.alert(
                    'Error',
                    'Hubo un error eliminando el participante.'
                  );
                Alert.alert('Exito', 'Se ha eliminado el participante.');
                onDelete(id);
                props.navigation.goBack();
              })
              .catch((err) => {
                setDeleting(false);
                Alert.alert('Error', 'Hubo un error eliminado el participante.');
              });
          },
        },
      ]
    );
  };

  var editParticipante = () => {
    props.navigation.navigate('EditarParticipante', {
      persona: participante,
      capacitacion_id,
      onEdit: (data) => {
        var p = { ...participante };
        for (var i in data) {
          p[i] = data[i];
        }
        setParticipante(p);
        onEdit(p);
      },
    });
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={styles.container}>
        <Input name="Nombre" value={participante.nombre} readonly />
        <Input
          name="Apellido Paterno"
          value={participante.apellido_paterno}
          readonly
        />
        <Input
          name="Apellido Materno"
          value={participante.apellido_materno}
          readonly
        />
        <Input name="Nombre Corto" value={participante.nombre_corto} readonly />
        <Input name="Sexo" value={participante.sexo} readonly />
        <Input
          name="Fecha de nacimiento"
          value={formatUnix(participante.fecha_nacimiento._seconds)}
          readonly
        />
        <Input name="Correo electrónico" value={participante.email} readonly />
        <Input name="Estado Civil" value={participante.estado_civil} readonly />
        <Input
          name="Grado escolaridad"
          value={participante.escolaridad}
          readonly
        />
        <Input name="Oficio" value={participante.oficio} readonly />

        <Text style={styles.section}>Domicilio</Text>
        <Input
          name="Domicilio"
          value={participante.domicilio.domicilio}
          readonly
        />
        <Input name="Colonia" value={participante.domicilio.colonia} readonly />
        <Input
          name="Municipio"
          value={participante.domicilio.municipio}
          readonly
        />
        <Input
          name="Teléfono Casa"
          value={participante.domicilio.telefono_casa}
          readonly
        />
        <Input
          name="Teléfono Móvil"
          value={participante.domicilio.telefono_movil}
          readonly
        />
      </View>
      <Item
        text="Eliminar participante"
        onPress={deleteParticipante}
        loading={deleting}
      />
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
