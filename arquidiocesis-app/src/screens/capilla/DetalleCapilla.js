/* 
Nombre: DetalleCapilla.js
Usuario con acceso: Admin, Acompañante, Coordinador 
Descripción: Pantalla para seleccionar un grupo de capacitación para un asistente
*/
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { API } from '../../lib';
import { FontAwesome5 } from '@expo/vector-icons';
import { Input, ErrorView, Item, Alert, List } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default (props) => {
  var [capilla, setCapilla] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);
  var [deleting, setDeleting] = useState(false);
  var [user, setUser] = useState(false);
  var [grupos, setGroups] = useState(false);

  var onDelete = props.route.params.onDelete;
  var onEdit = props.route.params.onEdit;

  props.navigation.setOptions({
    headerTitle: '',
    headerStyle: {
      backgroundColor: '#002E60',
      shadowOpacity: 0,
    },
  });
  useEffect(() => {
    API.getUser().then(setUser);
    getCapilla();
  }, []);

  var getCapilla = () => {
    setRefreshing(true);
    var id = capilla ? capilla.id : props.route.params.id;
    API.getCapilla(id)
      .then((d) => {
        // d.parroquia = (capilla.parroquia || props.route.params.parroquia);
        d.id = id;
        setCapilla(d);
        setError(false);
        getGrupos(id);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  };

  var getGrupos = (capilla_id) => {
    API.getGrupos(false).then((grupos) => {
      setGroups(grupos.filter((a) => a.capilla.id == capilla_id));
    });
  };

  var deleteCapilla = () => {
    Alert.alert(
      '¿Eliminar capilla?',
      'Esto eliminará los grupos de la capilla y todos los datos de la capilla.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setDeleting(true);
            API.deleteCapilla(capilla.parroquia.id, capilla.id)
              .then((done) => {
                setDeleting(false);
                Alert.alert('Exito', 'Se ha eliminado la capilla.');
                props.navigation.goBack();
                if (onDelete) onDelete(capilla.id);
              })
              .catch((err) => {
                setDeleting(false);
                Alert.alert('Exito', 'Hubo un error eliminando la capilla.');
              });
          },
        },
      ]
    );
  };

  var editCapilla = () => {
    props.navigation.navigate('EditarCapilla', {
      capilla,
      onEdit: (data) => {
        var c = { ...capilla };
        for (var i in data) {
          c[i] = data[i];
        }
        setCapilla(c);
        onEdit(c);
      },
    });
  };

  var gotoGroup = (i) => {
    props.navigation.navigate('Grupo', {
      grupo: i,
      showOwner: false,
    });
  };

  var gotoParroquia = () => {
    props.navigation.navigate('Parroquia', {
      showCapillas: false,
      id: capilla.parroquia,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          {props.route.params.nombre || capilla.nombre}
        </Text>
        {user &&
        (user.type == 'admin' || user.type == 'superadmin') &&
        !props.route.params.readonly ? (
            <TouchableOpacity onPress={editCapilla}>
              <FontAwesome5 name="edit" style={styles.editIcon} />
            </TouchableOpacity>
          ) : null}
      </View>
      <KeyboardAwareScrollView>
        {error ? (
          <ErrorView
            message={'Hubo un error cargando la parroquia...'}
            refreshing={refreshing}
            retry={getCapilla}
          />
        ) : capilla ? (
          <View>
            <View style={{ padding: 15 }}>
              <Input name={'Nombre'} value={capilla.nombre} readonly />
              <Input name={'Dirección'} value={capilla.direccion} readonly />
              <Input name={'Colonia'} value={capilla.colonia} readonly />
              <Input name={'Municipio'} value={capilla.municipio} readonly />
              <Input name={'Telefono 1'} value={capilla.telefono1} readonly />
              <Input name={'Telefono 2'} value={capilla.telefono2} readonly />
            </View>

            {grupos && grupos.length > 0 && (
              <View>
                <Text style={styles.sectionText}>GRUPOS</Text>
                <List
                  data={grupos}
                  sort={'nombre'}
                  onSelect={gotoGroup}
                  contentStyle={{ paddingBottom: 20 }}
                />
              </View>
            )}
            {props.route.params.showParroquia && (
              <Item text="Ver parroquia" onPress={gotoParroquia} />
            )}

            {user && (user.type == 'admin' || user.type == 'superadmin') && (
              <Item
                text="Eliminar capilla"
                onPress={deleteCapilla}
                loading={deleting}
              />
            )}
          </View>
        ) : (
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
        )}
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    backgroundColor: '#002E60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editIcon: {
    paddingRight: 15,
    color: 'white',
    fontSize: 25,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
    padding: 15,
  },
  sectionText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
    paddingLeft: 15,
  },
});
