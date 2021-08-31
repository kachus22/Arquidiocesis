/* 
Nombre: Parroquia.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver la información de un parroquia
*/
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { RefreshControl } from 'react-native-web-refresh-control';
import {
  AlphabetList,
  ErrorView,
  Input,
  Item,
  Alert,
  List,
} from '../../components';
import { FontAwesome5 } from '@expo/vector-icons';
import { API } from '../../lib';

export default (props) => {
  var [parroquia, setParroquia] = useState(props.route.params);
  var [capillas, setCapillas] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);
  var [deleting, setDeleting] = useState(false);
  var [user, setUser] = useState(false);
  var [grupos, setGrupos] = useState(false);

  var readonly = props.route.params.readonly;
  var onDelete = props.route.params.onDelete;
  var onEdit = props.route.params.onEdit;

  props.navigation.setOptions({
    headerStyle: {
      backgroundColor: '#002E60',
      shadowOpacity: 0,
    },
    headerTitle: '',
    headerRight: () => {
      if (
        readonly ||
        !(user && (user.type == 'admin' || user.type == 'superadmin'))
      )
        return null;
      else
        return (
          <TouchableOpacity onPress={addCapilla}>
            <FontAwesome5
              name={'plus'}
              size={24}
              style={{ paddingRight: 15 }}
              color={'white'}
            />
          </TouchableOpacity>
        );
    },
  });

  useEffect(() => {
    API.getUser().then(setUser);
    setError(false);
    var id = parroquia.id;

    API.getGrupos(false).then((grupos) => {
      setGrupos(grupos.filter((a) => a.parroquia && a.parroquia.id == id));
    });
    API.getParroquia(id, true)
      .then((d) => {
        d.id = id;
        setParroquia(d);
        setCapillas(d.capillas.filter((a) => a.nombre) || []);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  }, []);

  var getParroquia = () => {
    setRefreshing(true);
    setError(false);
    var id = parroquia.id;
    API.getParroquia(parroquia.id, true)
      .then((d) => {
        d.id = id;
        setParroquia(d);
        setCapillas(d.capillas.filter((a) => a.nombre) || []);
        setRefreshing(false);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  };

  // esta funcion agrega capillas a la parroquia
  var addCapilla = () => {
    props.navigation.navigate('RegistroCapilla', {
      parroquia,
      onAdded: (capilla) => {
        if (!capillas) return;
        setCapillas([...capillas, capilla]);
      },
    });
  };

  var onPress = (item) => {
    item.parroquia = parroquia;
    item.onDelete = (id) => {
      setCapillas((a) => a.filter((a) => a.id != id));
    };
    item.onEdit = (data) => {
      setCapillas([...capillas.filter((a) => a.id != data.id), data]);
    };
    props.navigation.navigate('DetalleCapilla', item);
  };

  var deleteParroquia = () => {
    Alert.alert(
      '¿Eliminar parroquia?',
      'Esto eliminará las capillas y los grupos que se tengan de ella.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setDeleting(true);
            API.deleteParroquia(parroquia.id)
              .then((done) => {
                setDeleting(false);
                alert('Se ha eliminado la parroquia.');
                props.navigation.goBack();
                if (onDelete) onDelete(parroquia.id);
              })
              .catch((err) => {
                setDeleting(false);
                console.error(err);
                alert('Hubo un error eliminando la parroquia.');
              });
          },
        },
      ]
    );
  };

  var editParroquia = () => {
    props.navigation.navigate('EditParroquia', {
      parroquia,
      onEdit: (new_parroquia) => {
        var p = { ...parroquia };
        for (var i in new_parroquia) {
          p[i] = new_parroquia[i];
        }
        setParroquia(p);
        if (onEdit) onEdit(p);
      },
    });
  };

  var gotoGroup = (i) => {
    props.navigation.navigate('Grupo', {
      grupo: i,
      showOwner: false,
    });
  };

  var gotoDecanato = () => {
    if (!(parroquia && parroquia.decanato && parroquia.decanato.id)) return;
    props.navigation.navigate('Decanato', parroquia.decanato);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{parroquia.nombre}</Text>
        {readonly ||
        !(
          user &&
          (user.type == 'admin' || user.type == 'superadmin')
        ) ? null : (
            <TouchableOpacity onPress={editParroquia}>
              <FontAwesome5 name="edit" style={styles.editIcon} />
            </TouchableOpacity>
          )}
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getParroquia} />
        }
        contentContainerStyle={{ paddingBottom: 50 }}>
        {error ? (
          <ErrorView
            message={'Hubo un error cargando la parroquia...'}
            refreshing={refreshing}
            retry={getParroquia}
          />
        ) : capillas !== false ? (
          <View>
            <View>
              <Text style={styles.sectionText}>CAPILLAS</Text>
              {capillas.length > 0 ? (
                <AlphabetList
                  data={capillas}
                  onSelect={onPress}
                  scroll={false}
                  sort={'nombre'}
                />
              ) : (
                <View>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 16,
                      color: 'gray',
                      backgroundColor: 'white',
                      padding: 15,
                    }}>
                    Esta parroquia no tiene capillas agregadas.
                  </Text>
                </View>
              )}
            </View>
            <View style={{ padding: 15, marginTop: 10 }}>
              {parroquia.identificador && (
                <Input
                  name="Identificador"
                  value={parroquia.identificador}
                  readonly
                />
              )}
              <Input name="Nombre" value={parroquia.nombre} readonly />
              <Input
                name="Decanato"
                value={parroquia.decanato ? parroquia.decanato.nombre : null}
                readonly
              />
              <Input name="Dirección" value={parroquia.direccion} readonly />
              <Input name="Colonia" value={parroquia.colonia} readonly />
              <Input name="Municipio" value={parroquia.municipio} readonly />
              <Input name="Telefono 1" value={parroquia.telefono1} readonly />
              <Input name="Telefono 2" value={parroquia.telefono2} readonly />
            </View>

            {grupos && grupos.length > 0 && (
              <View>
                <Text style={styles.sectionText}>GRUPOS</Text>
                <List data={grupos} sort={'nombre'} onSelect={gotoGroup} />
              </View>
            )}

            {parroquia && parroquia.decanato && parroquia.decanato.id && (
              <Item text="Ver decanato" onPress={gotoDecanato} />
            )}
            {!readonly &&
              user &&
              (user.type == 'admin' || user.type == 'superadmin') && (
              <Item
                text="Eliminar parroquia"
                onPress={deleteParroquia}
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
      </ScrollView>
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
    marginVertical: 10,
    marginTop: 30,
    paddingLeft: 15,
  },
});
