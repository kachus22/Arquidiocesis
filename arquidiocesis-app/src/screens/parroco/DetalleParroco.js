/* 
Nombre: DetalleParroco.js
Usuario con acceso: Admin, 
Descripción: Pantalla para ver la información personal de los párrocos en el sistema
*/

import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { API } from '../../lib';
import { FontAwesome5 } from '@expo/vector-icons';
import { RefreshControl } from 'react-native-web-refresh-control';
import { Input, Alert, Item, LoadingView } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  const { onEdit, onDelete } = props.route.params;

  const [persona, setPersona] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [parroquia, setParroquia] = useState({ nombre: 'parroquia' });

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

  const getParroco = (ref) => {
    console.log(error);
    if (ref) setRefreshing(true);
    setError(false);
    API.getParroco(props.route.params.persona.id, ref)
      .then((data) => {
        setPersona(data);
        console.log(data);

        API.getParroquias()
          .then((data2) => {
            setParroquia(data2.find((x) => x.id === data.parroquia));
            console.log(data.parroquia);
            setRefreshing(false);
            setError(false);
          })
          .catch((err) => {
            console.log(err);
            setRefreshing(false);
            setError(false);
          });
      })
      .catch((err) => {
        console.log(err);
        setError(true);
        setRefreshing(false);
      });
  };

  const gotoParroquia = () => {
    props.navigation.navigate('Parroquia', {
      showCapillas: false,
      id: parroquia.id,
    });
  };

  if (!persona) {
    return <LoadingView />;
  }

  const deleteParroco = () => {
    Alert.alert('¿Eliminar párroco?', 'Esto eliminará los datos del párroco.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          setDeleting(true);
          API.deleteParroco(persona.id)
            .then((done) => {
              console.log(done);
              setDeleting(false);
              alert('Se ha eliminado el párroco.');
              props.navigation.goBack();
              if (onDelete) onDelete(persona.id);
            })
            .catch((err) => {
              console.log(err);
              setDeleting(false);
              alert('Hubo un error eliminando el párrocos.');
            });
        },
      },
    ]);
  };

  const changePassword = () => {
    props.navigation.navigate('ChangePassword', {
      admin_email: persona.email,
    });
  };

  const editParroco = () => {
    props.navigation.navigate('EditParroco', {
      persona,
      parr: parroquia,
      onEdit: (data) => {
        const p = { ...persona };
        for (const i in data) {
          p[i] = data[i];
        }
        setPersona(p);
        if (onEdit) onEdit(p.id, p);
      },
    });
  };

  const getFechaNacimiento = () => {
    if (!persona.fecha_nacimiento || !persona.fecha_nacimiento._seconds) {
      return moment().format('MMMM DD, YYYY');
    }
    const f = moment
      .unix(persona.fecha_nacimiento._seconds)
      .format('MMMM DD, YYYY');
    return f.charAt(0).toUpperCase() + f.substr(1);
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
          value={getFechaNacimiento()}
          name={'Fecha de nacimiento'}
          readonly
        />

        <Input name="Teléfono Móvil" value={persona.telefono_movil} readonly />

        {parroquia && (
          <Input value={parroquia.nombre} name={'Parroquia'} readonly />
        )}
      </View>

      {parroquia && <Item text="Ver parroquia" onPress={gotoParroquia} />}

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
