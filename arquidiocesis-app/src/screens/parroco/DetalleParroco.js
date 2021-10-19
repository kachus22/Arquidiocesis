/* 
Nombre: DetalleParroco.js
Usuario con acceso: Admin, 
Descripción: Pantalla para ver la información personal de los párrocos en el sistema
*/

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { API } from '../../lib';
import { FontAwesome5 } from '@expo/vector-icons';
import { RefreshControl } from 'react-native-web-refresh-control';
import { Input, Alert, Item, List, LoadingView } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  var { onEdit, onDelete } = props.route.params;

  var [persona, setPersona] = useState(false);
  var [deleting, setDeleting] = useState(false);
  var [user, setUser] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);

  props.navigation.setOptions({
    headerStyle: {
      backgroundColor: '#002E60',
      shadowOpacity: 0,
    },
    headerTitle: 'Párroco',
    headerRight: () =>
      user &&
      (user.type === 'admin' || user.type === 'superadmin') && (
        <TouchableOpacity onPress={editParroco}>
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
    getParroco();
  }, []);

  let getParroco = (ref) => {
    if (ref) setRefreshing(true);
    setError(false);
    API.getParroco(props.route.params.persona.id, ref)
      .then((data) => {
        setPersona(data);
        setError(false);
        setRefreshing(false);
      })
      .catch((err) => {
        console.log(error);
        setError(true);
        setRefreshing(false);
      });
  };

  if (!persona) {
    return <LoadingView />;
  }

  var deleteParroco = () => {
    Alert.alert('¿Eliminar párroco?', 'Esto eliminará los datos del párroco.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          setDeleting(true);
          API.deleteParroco(persona.id)
            .then((done) => {
              setDeleting(false);
              alert('Se ha eliminado el párroco.');
              props.navigation.goBack();
              if (onDelete) onDelete(persona.id);
            })
            .catch((err) => {
              setDeleting(false);
              alert('Hubo un error eliminando el párrocoS.');
            });
        },
      },
    ]);
  };

  var changePassword = () => {
    props.navigation.navigate('ChangePassword', {
      admin_email: persona.email,
    });
  };

  var editParroco = () => {
    props.navigation.navigate('EditParroco', {
      persona,
      onEdit: (data) => {
        var p = { ...persona };
        for (var i in data) {
          p[i] = data[i];
        }
        setPersona(p);
        if (onEdit) onEdit(p.id, p);
      },
    });
  };

  var getFechaNacimiento = () => {
    if (!persona.fecha_nacimiento || !persona.fecha_nacimiento._seconds) {
      return moment().format('MMMM DD, YYYY');
    }
    var f = moment
      .unix(persona.fecha_nacimiento._seconds)
      .format('MMMM DD, YYYY');
    return f.charAt(0).toUpperCase() + f.substr(1);
  };

  var gotoParroquia = (i) => {
    props.navigation.navigate('Parroquia', i);
  };

  var gotoGroup = (i) => {
    props.navigation.navigate('Grupo', {
      grupo: i,
    });
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ paddingBottom: 50 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => getParroco(true)}
        />
      }>
      {persona.grupos && persona.grupos.length > 0 && (
        <View>
          <Text style={styles.sectionText}>GRUPOS</Text>
          <List
            data={persona.grupos}
            sort={'nombre'}
            onSelect={gotoGroup}
            contentStyle={{ paddingBottom: 0 }}
          />
        </View>
      )}

      {persona.parroquias && persona.parroquias.length > 0 && (
        <View>
          <Text style={styles.sectionText}>PARROQUIAS</Text>
          <List
            data={persona.parroquias}
            sort={'nombre'}
            onSelect={gotoParroquia}
            contentStyle={{ paddingBottom: 0 }}
          />
        </View>
      )}
      <View style={{ padding: 15 }}>
        {persona.identificador && (
          <Input name="Identificador" value={persona.identificador} readonly />
        )}
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
          value={getFechaNacimiento()}
          name={'Fecha de nacimiento'}
          readonly
        />

        <Input name="Teléfono Móvil" value={persona.telefono_movil} readonly />
      </View>

      {user && (user.type === 'admin' || user.type === 'superadmin') && (
        <Item text="Cambiar contraseña" onPress={changePassword} />
      )}
      {user && (user.type === 'admin' || user.type === 'superadmin') && (
        <Item
          text="Eliminar párroco"
          onPress={deleteParroco}
          loading={deleting}
        />
      )}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: 'grey',
    marginBottom: 10,
    marginTop: 20,
  },
  sectionText: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 10,
    paddingLeft: 15,
  },
});
