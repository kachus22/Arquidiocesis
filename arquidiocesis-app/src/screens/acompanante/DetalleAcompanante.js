/* 
Nombre: DetalleAcompañante.js
Usuario con acceso: Admin
Descripción: Pantalla que muestra la información de los acompañantes de zona y decanato
*/
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { API } from '../../lib';
import { FontAwesome5 } from '@expo/vector-icons';
import { Input, Item, LoadingView, Alert } from '../../components';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  var { acompanante, zona, decanato, onDelete } = props.route.params;

  var acompananteDatos;

  if (acompanante) {
    acompananteDatos = acompanante;
  } else {
    acompananteDatos = zona ? zona.acompanante : decanato.acompanante;
  }

  var [persona, setPersona] = useState(false);
  var [user, setUser] = useState(false);
  var [deleting, setDeleting] = useState(false);
  var [place, setPlace] = useState(false);

  props.navigation.setOptions({
    headerTitle: 'Detalle Acompañante',
    headerRight: () =>
      user &&
      (user.type == 'admin' || user.type == 'superadmin') && (
        <TouchableOpacity onPress={editPersona}>
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
    API.getUser().then(setUser);

    if (acompanante) {
      setPersona(acompanante);
      getZonaOrDecanatoForAcompanante();
      return;
    }

    if (!acompananteDatos) {
      onDelete();
      props.navigation.goBack();
      Alert.alert('Error', 'Esta zona no tiene acompañante.');
      return;
    }
    API.getAcompanante(acompananteDatos)
      .then((a) => {
        setPersona(a);
        getZonaOrDecanatoForAcompanante(acompananteDatos);
      })
      .catch((err) => {
        if (err.code == 910) {
          onDelete();
          props.navigation.goBack();
          Alert.alert(
            'Error',
            (zona ? 'Esta zona' : 'Este decanato') + ' no tiene acompañante.'
          );
          return;
        }
        Alert.alert('Error', 'Hubo un error cargando el acompañante');
        props.navigation.goBack();
      });
  }, []);

  var editPersona = () => {
    props.navigation.navigate('EditAcompanante', {
      persona,
      onEdit: (data) => {
        var p = { ...persona };
        for (var i in data) {
          p[i] = data[i];
        }
        setPersona(p);
      },
    });
  };

  const getZonaOrDecanatoForAcompanante = async (id = acompananteDatos.id) => {
    try {
      const data = await API.getAcompananteZonaOrDecanato(id);

      if (data.zona) {
        setPlace({ id: data.zona.id, kind: 'Zona', name: data.zona.nombre });
      } else if (data.decanato) {
        setPlace({
          id: data.decanato.id,
          kind: 'Decanato',
          name: data.decanato.nombre,
        });
      }
    } catch (error) {
      console.log('error :>> ', error);
      Alert.alert(
        'Error',
        'Hubo un error al recuperar la zona o decanato del acompañante.'
      );
    }
  };

  const showPlace = () => {
    if (place.kind == 'Zona') {
      props.navigation.navigate('Zona', { id: place.id, nombre: place.name });
    } else {
      props.navigation.navigate('Decanato', {
        id: place.id,
        nombre: place.name,
      });
    }
  };

  var changePassword = () => {
    props.navigation.navigate('ChangePassword', {
      admin_email: persona.email,
    });
  };

  var deleteAcompanante = () => {
    Alert.alert(
      '¿Eliminar acompañante?',
      'Esto eliminará la cuenta y ' +
        (zona ? 'la zona' : 'el decanato') +
        ' se quedará sin acompañante. Se podrá agregar uno después.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setDeleting(true);

            if (acompanante) {
              var prom =
                place.kind === 'Zona'
                  ? API.deleteAcompananteZona(place.id)
                  : API.deleteAcompananteDecanato(place.id);
            } else {
              var prom = zona
                ? API.deleteAcompananteZona(zona.id)
                : API.deleteAcompananteDecanato(decanato.id);
            }

            prom
              .then((done) => {
                setDeleting(false);
                Alert.alert('Exito', 'Se ha eliminado el acompañante.');
                props.navigation.goBack();
                onDelete(persona.id);
              })
              .catch((err) => {
                console.log(err);
                setDeleting(false);
                Alert.alert('Error', 'Hubo un error eliminando el acompañante.');
              });
          },
        },
      ]
    );
  };

  var getFechaNacimiento = () => {
    const f = moment(persona.fecha_nacimiento).format('MMMM DD, YYYY');
    return f.charAt(0).toUpperCase() + f.substr(1);
  };

  return (
    <View style={{ flex: 1 }}>
      {persona === false ? (
        <LoadingView />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
          {place && (
            <View>
              <Text style={[styles.section, { marginTop: 10 }]}>
                {place.kind}
              </Text>
              <Item text={place.name} onPress={showPlace} />
            </View>
          )}
          {user && (user.type == 'admin' || user.type == 'superadmin') ? (
            <View>
              <Text style={[styles.section, { marginTop: 10 }]}>Opciones</Text>
              <Item text="Cambiar contraseña" onPress={changePassword} />
              <Item
                text="Eliminar acompañante"
                onPress={deleteAcompanante}
                loading={deleting}
              />
            </View>
          ) : null}
          <View style={{ padding: 15 }}>
            <Input name="Correo Electrónico" value={persona.email} readonly />
            <Input name="Nombre" value={persona.nombre} readonly />
            <Input
              name="Apellido Paterno"
              value={persona.apellido_paterno}
              readonly
            />
            <Input
              name="Apellido Materno"
              value={persona.apellido_materno}
              readonly
            />
            <Input
              name="Fecha de nacimiento"
              value={getFechaNacimiento()}
              readonly
            />
            <Input name="Estado Civil" value={persona.estado_civil} readonly />
            <Input name="Sexo" value={persona.sexo} readonly />
            <Input
              name="Grado escolaridad"
              value={persona.escolaridad}
              readonly
            />
            <Input name="Oficio" value={persona.oficio} readonly />

            <Text style={styles.infoSection}>Domicilio</Text>
            <Input
              name="Domicilio"
              value={persona.domicilio.domicilio}
              readonly
            />
            <Input name="Colonia" value={persona.domicilio.colonia} readonly />
            <Input
              name="Municipio"
              value={persona.domicilio.municipio}
              readonly
            />
            <Input
              name="Teléfono Casa"
              value={persona.domicilio.telefono_casa}
              readonly
            />
            <Input
              name="Teléfono Móvil"
              value={persona.domicilio.telefono_movil}
              readonly
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#002E60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editIcon: {
    paddingRight: 15,
    color: 'white',
    fontSize: 35,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    padding: 15,
  },
  infoSection: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: 'grey',
    marginBottom: 10,
    marginTop: 20,
  },
  section: {
    fontSize: 16,
    color: 'gray',
    marginVertical: 10,
    marginTop: 30,
    fontWeight: '500',
    paddingLeft: 15,
  },
});
