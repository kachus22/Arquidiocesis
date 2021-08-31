/* 
Nombre: DetalleAdmin.js
Usuario con acceso: Admin
Descripción: Pantalla que muestra la información de un usuario registrado en el sistema
*/
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { API } from '../../lib';
import { FontAwesome5 } from '@expo/vector-icons';
import { Input, LoadingView, Alert, Item } from '../../components';

export default (props) => {
  var [user, setUser] = useState(false);
  var [tipo, setTipo] = useState(props.route.params.tipo);
  var [refreshing, setRefreshing] = useState(false);

  var onDelete = props.route.params.onDelete;
  var onEdit = props.route.params.onEdit;

  props.navigation.setOptions({
    headerTitle: 'Ver usuario',
    headerRight: () => (
      <TouchableOpacity onPress={editUser}>
        <FontAwesome5
          name={'edit'}
          size={24}
          style={{ paddingRight: 15 }}
          color={'white'}
        />
      </TouchableOpacity>
    ),
  });

  useEffect(() => getUser(), []);

  var getUser = () => {
    setRefreshing(true);
    const p = props.route.params;
    API.getUserDetail(p.id, p.email, tipo)
      .then((u) => {
        if (!u) {
          setRefreshing(false);
          alert('Hubo un error cargando el usuario.');
          props.navigation.goBack();
          return;
        }
        setRefreshing(false);
        setUser(u);
      })
      .catch((err) => {
        setRefreshing(false);
        alert('Hubo un error cargando el usuario.');
        props.navigation.goBack();
      });
  };

  if (user === false) {
    return <LoadingView text="Cargando" />;
  }

  var changePassword = () => {
    props.navigation.navigate('ChangePassword', {
      admin_email: props.route.params.email,
    });
  };

  var deleteAdmin = () => {
    Alert.alert(
      '¿Eliminar usuario?',
      'Esto eliminará el usuario y no podrá entrar al sistema.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            API.deleteAdmin(props.route.params.email)
              .then((done) => {
                alert('Se ha eliminado el usuario.');
                props.navigation.goBack();
                if (onDelete) onDelete(props.route.params.email);
              })
              .catch((err) => {
                alert('Hubo un error eliminando el usuario.');
              });
          },
        },
      ]
    );
  };

  var editUser = () => {
    props.navigation.navigate('EditAdmin', {
      user: { id: props.route.params.id, ...user },
      onEdit: (new_user) => {
        onEdit(user.email, new_user.tipo);
        setUser(new_user);
      },
    });
  };

  return (
    <ScrollView>
      <View style={{ padding: 15 }}>
        <Input name="Correo electrónico" value={user.email} readonly />
        <Input name="Nombre" value={user.nombre} readonly />
        <Input name="Apellido Paterno" value={user.apellido_paterno} readonly />
        <Input name="Apellido Materno" value={user.apellido_materno} readonly />
      </View>

      <Item text="Cambiar contraseña" onPress={changePassword} />
      {['admin', 'integrante_chm', 'capacitacion'].includes(tipo) && (
        <Item text="Eliminar usuario" onPress={deleteAdmin} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  testText: {
    fontSize: 20,
  },
  section: {
    fontSize: 16,
    color: 'gray',
    marginTop: 30,
    fontWeight: '500',
    paddingLeft: 15,
  },
});
