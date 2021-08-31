/* 
Nombre: AdminUsers.js
Usuario con acceso: Admin
Descripción: Pantalla que muestra la información de los usuarios que tienen acceso al sistema, así como sus permisos
*/
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { RefreshControl } from 'react-native-web-refresh-control';
import { API } from '../../lib';
import { AlphabetList } from '../../components';
import { FontAwesome5 } from '@expo/vector-icons';

export default (props) => {
  var [users, setUsers] = useState(false);
  var [refreshing, setRefreshing] = useState(false);

  props.navigation.setOptions({
    headerTitle: 'Usuarios',
    headerRight: () => (
      <TouchableOpacity onPress={addUser}>
        <View
          style={{
            width: 50,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <FontAwesome5 name="plus" size={25} color={'white'} />
        </View>
      </TouchableOpacity>
    ),
  });

  useEffect(() => getUsers(), []);

  var addUser = () => {
    props.navigation.navigate('RegistroAdmin', {
      onAdd: (new_login) => {
        setUsers([...users, new_login]);
      },
    });
  };

  var getUsers = () => {
    setRefreshing(true);
    API.getUser()
      .then((me) => {
        API.adminGetUsers()
          .then((u) => {
            setRefreshing(false);
            if (u) {
              setUsers(u.filter((a) => a.email != me.email));
            }
          })
          .catch((err) => {
            setRefreshing(false);
            alert('Hubo un error cargando los usuarios.');
            props.navigation.goBack();
          });
      })
      .catch((err) => {
        setRefreshing(false);
        alert('Hubo un error cargando los usuarios.');
        props.navigation.goBack();
      });
  };

  if (users === false) {
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

  var admins = users.filter((a) => a.tipo == 'admin');
  var integrantes = users.filter((a) => a.tipo == 'integrante_chm');
  var coordinadores = users.filter((a) => a.tipo == 'coordinador');
  var acompZona = users.filter((a) => a.tipo == 'acompañante_zona');
  var acompDecan = users.filter((a) => a.tipo == 'acompañante_decanato');
  var capacitacion = users.filter((a) => a.tipo == 'capacitacion');

  var formatList = (a) =>
    a.map((a) => ({ email: a.email, id: a.member_id, tipo: a.tipo }));

  var showUser = (v) => {
    props.navigation.navigate('DetalleAdmin', {
      ...v,
      onEdit: (email, tipo) => {
        var u = [...users];
        var ix = u.findIndex((a) => a.email == email);
        u[ix].tipo = tipo;
        setUsers(u);
      },
      onDelete: (email) => {
        setUsers(users.filter((a) => a.email != email));
      },
    });
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getUsers} />
      }>
      <Text style={styles.section}>Administrador General</Text>
      <Text style={styles.description}>Puede ver y editar todo</Text>
      {admins.length == 0 ? (
        <Text style={styles.empty}>No hay administradores.</Text>
      ) : (
        <AlphabetList
          data={formatList(admins)}
          sort="email"
          headers={false}
          scroll={false}
          onSelect={showUser}
        />
      )}

      <Text style={styles.section}>Integrantes de la CHM</Text>
      <Text style={styles.description}>Puede ver y editar todo</Text>
      {integrantes.length == 0 ? (
        <Text style={styles.empty}>No hay integrantes de la CHM.</Text>
      ) : (
        <AlphabetList
          data={formatList(integrantes)}
          sort="email"
          headers={false}
          scroll={false}
          onSelect={showUser}
        />
      )}

      <Text style={styles.section}>Acompañantes de Zona</Text>
      <Text style={styles.description}>
        Puede ver y editar lo correspondiente a su Zona
      </Text>
      {acompZona.length == 0 ? (
        <Text style={styles.empty}>No hay acompañanates de zona.</Text>
      ) : (
        <AlphabetList
          data={formatList(acompZona)}
          sort="email"
          headers={false}
          scroll={false}
          onSelect={showUser}
        />
      )}

      <Text style={styles.section}>Acompañantes de Decanato</Text>
      <Text style={styles.description}>
        Puede ver y editar lo correspondiente a su Decanato
      </Text>
      {acompDecan.length == 0 ? (
        <Text style={styles.empty}>No hay acompañanates operativos.</Text>
      ) : (
        <AlphabetList
          data={formatList(acompDecan)}
          sort="email"
          headers={false}
          scroll={false}
          onSelect={showUser}
        />
      )}

      <Text style={styles.section}>Coordinadores de Grupo</Text>
      <Text style={styles.description}>
        Puede ver y editar lo correspondiente a sus grupos e integrantes
      </Text>
      {coordinadores.length == 0 ? (
        <Text style={styles.empty}>No hay coordinadores de grupos.</Text>
      ) : (
        <AlphabetList
          data={formatList(coordinadores)}
          sort="email"
          headers={false}
          scroll={false}
          onSelect={showUser}
        />
      )}

      <Text style={styles.section}>Capacitación</Text>
      <Text style={styles.description}>
        Puede ver y editar lo correspondiente a las capacitaciones e integrantes
      </Text>
      {capacitacion.length == 0 ? (
        <Text style={styles.empty}>No hay encargados de capacitación.</Text>
      ) : (
        <AlphabetList
          data={formatList(capacitacion)}
          sort="email"
          headers={false}
          scroll={false}
          onSelect={showUser}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  testText: {
    fontSize: 20,
  },
  container: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
  },
  item: {
    paddingLeft: 15,
    paddingVertical: 15,
    width: '100%',
    borderBottomColor: '#CCC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  section: {
    fontSize: 16,
    color: 'gray',
    marginTop: 30,
    fontWeight: '500',
    paddingLeft: 15,
  },
  description: {
    fontSize: 14,
    color: 'gray',
    paddingHorizontal: 15,
    marginTop: 0,
    marginBottom: 5,
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    backgroundColor: 'white',
    padding: 15,
  },
});
