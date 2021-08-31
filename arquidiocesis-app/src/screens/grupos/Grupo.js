/* 
Nombre: Grupo.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver la información de un grupo HEMA
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
  Button,
  List,
  Item,
  Alert,
} from '../../components';
import { FontAwesome5 } from '@expo/vector-icons';
import { API } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  var [grupo, setGrupo] = useState(props.route.params.grupo);
  var [miembros, setMiembros] = useState(false);
  var [asistencias, setAsistencias] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);
  var [sending, setSending] = useState(false);
  var [user, setUser] = useState(false);
  var [coordinador, setCoordinador] = useState(false);

  var { showOwner, onDelete, onEdit } = props.route.params;

  props.navigation.setOptions({
    headerStyle: {
      backgroundColor: '#002E60',
      shadowOpacity: 0,
    },
    headerTitle: 'Grupo',
    headerRight: () =>
      miembros !== false &&
      user &&
      (user.type == 'admin' ||
        user.type == 'superadmin' ||
        user.id == grupo.coordinador.id) ? (
          <TouchableOpacity onPress={addMember}>
            <FontAwesome5
              name={'plus'}
              size={24}
              style={{ paddingRight: 15 }}
              color={'white'}
            />
          </TouchableOpacity>
        ) : null,
  });

  useEffect(() => {
    API.getUser().then(setUser);

    setError(false);
    var id = grupo.id;
    API.getGrupo(id)
      .then((d) => {
        d.id = id;
        setGrupo(d);
        setMiembros(d.miembros || []);
        setAsistencias(d.asistencias || []);
        setError(false);
        getCoordinador();
      })
      .catch((err) => {
        if (err.code == 999) {
          Alert.alert('Error', 'No tienes acceso a este grupo');
        }
        setRefreshing(false);
        setError(true);
      });
  }, []);

  var getCoordinador = () => {
    if (grupo && grupo.coordinador) {
      API.getCoordinadores(false)
        .then((c) => {
          setCoordinador(c.find((a) => a.id == grupo.coordinador));
        })
        .catch((err) => {});
    }
  };

  var getGrupo = () => {
    setRefreshing(true);
    setError(false);
    var id = grupo.id;
    API.getGrupo(grupo.id, true)
      .then((d) => {
        d.id = id;
        setGrupo(d);
        setMiembros(d.miembros || []);
        setAsistencias(d.asistencias || []);
        setRefreshing(false);
        setError(false);
        getCoordinador();
      })
      .catch((err) => {
        if (err.code == 999) {
          Alert.alert('Error', 'No tienes acceso a este grupo');
        }
        setRefreshing(false);
        setError(true);
      });
  };

  var goParroquia = () => {
    var p = grupo.parroquia;
    p.readonly = true;
    props.navigation.navigate('Parroquia', p);
  };

  var goCapilla = () => {
    var p = grupo.capilla;
    p.readonly = true;
    p.showParroquia = true;
    props.navigation.navigate('DetalleCapilla', p);
  };

  var assistance = () => {
    props.navigation.navigate('AsistenciaGrupo', {
      grupo,
      new: true,
      onAssistance: (date) => {
        setAsistencias((a) => Array.from(new Set([...a, date])));
      },
    });
  };

  var formatDate = (a) => {
    var f = moment(a, 'YYYY-MM-DD').format('MMMM DD, YYYY');
    return f.charAt(0).toUpperCase() + f.substr(1);
  };

  var formatAsistencias = () => {
    if (!asistencias) return [];
    return asistencias
      .sort(
        (a, b) =>
          moment(b, 'YYYY-MM-DD').unix() - moment(a, 'YYYY-MM-DD').unix()
      )
      .map((a) => ({
        name: formatDate(a),
        id: a,
      }));
  };

  var showAsistencia = (a) => {
    if (
      user.type != 'acompañante_decanato' &&
      user.type != 'acompañante_zona'
    ) {
      props.navigation.navigate('AsistenciaGrupo', {
        grupo,
        date: a.id,
        new: false,
        onDelete: (d) => {
          setAsistencias((a) => a.filter((a) => a != d));
        },
      });
    }
  };

  var addMember = () => {
    props.navigation.navigate('RegistroMiembro', {
      grupo,
      onAdd: (m) => {
        if (!m) return;
        setMiembros([...miembros, m]);
      },
    });
  };

  var viewMember = (item) => {
    if (
      user.type != 'acompañante_decanato' &&
      user.type != 'acompañante_zona'
    ) {
      props.navigation.navigate('DetalleMiembro', {
        grupo,
        persona: item,
        onEdit: (id, miembro) => {
          setMiembros([...miembros.filter((a) => a.id != id), miembro]);
        },
        onStatusChange: (id, status, miembro) => {
          if (status > 0) setMiembros(miembros.filter((a) => a.id != id));
          else {
            setMiembros([...miembros.filter((a) => a.id != id), miembro]);
          }
        },
      });
    }
  };

  var editGroup = () => {
    props.navigation.navigate('EditGrupo', {
      grupo,
      onEdit: (new_grupo) => {
        setGrupo(new_grupo);
        if (onEdit) onEdit(new_grupo.id, new_grupo);
      },
    });
  };

  var changeCoordinador = () => {
    props.navigation.navigate('ChangeCoordinador', {
      grupo,
      onEdit: (new_coordinador) => {
        setGrupo((g) => {
          g.coordinador = new_coordinador;
          return g;
        });
      },
    });
  };

  var bajasTemporales = () => {
    props.navigation.navigate('GrupoBajasTemporales', {
      id: grupo.id,
      onEdit: (id, miembro) => {
        setMiembros([...miembros.filter((a) => a.id != id), miembro]);
      },
      onStatusChange: (id, status, miembro) => {
        if (status > 0) setMiembros(miembros.filter((a) => a.id != id));
        else {
          setMiembros([...miembros.filter((a) => a.id != id), miembro]);
        }
      },
    });
  };

  var deleteGroup = () => {
    if (sending) return false;
    Alert.alert(
      '¿Eliminar grupo?',
      'Esto eliminará todos las asistencias, miembros y datos del grupo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setSending(true);
            API.deleteGrupo(grupo.id)
              .then((done) => {
                setSending(false);
                if (!done) return alert('Hubo un error eliminando el grupo.');
                alert('Se ha eliminado el grupo.');
                if (onDelete) onDelete(grupo.id);
                props.navigation.goBack();
              })
              .catch((err) => {
                setSending(false);
                console.log(err);
                alert('Hubo un error eliminando el grupo.');
              });
          },
        },
      ]
    );
  };

  var gotoCoordinador = (i) => {
    if (!coordinador) {
      Alert.alert('Error', 'El grupo no tiene coordinador.');
    }
    props.navigation.navigate('DetalleCoordinador', {
      persona: coordinador,
    });
  };

  var isAcompanante = () => {
    return (
      user.type == 'acompañante_decanato' || user.type == 'acompañante_zona'
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText} numberOfLines={1}>
          {grupo.nombre}
        </Text>
        {user && (user.type == 'admin' || user.type == 'superadmin') ? (
          <TouchableOpacity onPress={editGroup}>
            <FontAwesome5 name="edit" style={styles.editIcon} />
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getGrupo} />
        }
        contentContainerStyle={{ paddingBottom: 50 }}>
        {error ? (
          <ErrorView
            message={'Hubo un error cargando el grupo...'}
            refreshing={refreshing}
            retry={getGrupo}
          />
        ) : miembros !== false ? (
          <View>
            {miembros.length > 0 &&
              user &&
              (user.type == 'admin' ||
                user.type == 'superadmin' ||
                user.id == grupo.coordinador.id) && (
              <Button
                text={'Tomar asistencia'}
                style={{ width: 200, alignSelf: 'center', marginBottom: 0 }}
                onPress={assistance}
              />
            )}
            {grupo.parroquia && showOwner !== false ? (
              <View>
                <Text style={styles.sectionText}>VER PARROQUIA</Text>
                <TouchableOpacity onPress={goParroquia}>
                  <View style={{ backgroundColor: 'white' }}>
                    <View style={styles.item}>
                      <Text style={{ fontSize: 16 }}>
                        {grupo.parroquia.nombre}
                      </Text>
                      <FontAwesome5
                        name="chevron-right"
                        style={{ marginRight: 30, color: 'gray', fontSize: 15 }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ) : grupo.capilla && showOwner !== false ? (
              <View>
                <Text style={styles.sectionText}>VER CAPILLA</Text>
                <TouchableOpacity onPress={goCapilla}>
                  <View style={{ backgroundColor: 'white' }}>
                    <View style={styles.item}>
                      <Text style={{ fontSize: 16 }}>
                        {grupo.capilla.nombre}
                      </Text>
                      <FontAwesome5
                        name="chevron-right"
                        style={{ marginRight: 30, color: 'gray', fontSize: 15 }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionText}>VER PARROQUIA</Text>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    color: 'gray',
                    backgroundColor: 'white',
                    padding: 15,
                  }}>
                  Este grupo no tiene parroquia.
                </Text>
              </View>
            )}

            <Text style={styles.sectionText}>MIEMBROS</Text>
            {miembros.length > 0 ? (
              <AlphabetList
                data={miembros.map((a) => ({
                  ...a,
                  nombre_completo: `${a.nombre} ${a.apellido_paterno}`,
                }))}
                onSelect={viewMember}
                scroll={false}
                sort={'nombre_completo'}
                clickable={!isAcompanante()}
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
                  Este grupo no tiene miembros agregados.
                </Text>
              </View>
            )}
            <Text style={[styles.sectionText, { marginTop: 30 }]}>
              ASISTENCIAS
            </Text>
            {asistencias && asistencias.length > 0 ? (
              <List
                data={formatAsistencias()}
                onSelect={showAsistencia}
                scroll={false}
                clickable={!isAcompanante()}
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
                  No se han marcado asistencias.
                </Text>
              </View>
            )}
            <View style={{ marginTop: 40 }} />
            {coordinador && (
              <Item text="Ver coordinador" onPress={gotoCoordinador} />
            )}
            {user && (user.type == 'admin' || user.type == 'superadmin') && (
              <Item text="Cambiar coordinador" onPress={changeCoordinador} />
            )}
            <Item text="Ver bajas temporales" onPress={bajasTemporales} />
            {user && (user.type == 'admin' || user.type == 'superadmin') && (
              <Item
                text="Eliminar grupo"
                onPress={deleteGroup}
                loading={sending}
              />
            )}

            {grupo.fecha_creada && grupo.fecha_creada._seconds && (
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 18,
                  color: '#5e5e5e',
                  marginVertical: 20,
                  backgroundColor: '#ececec',
                  padding: 10,
                }}>
                Fecha creación:{' '}
                {moment
                  .unix(grupo.fecha_creada._seconds)
                  .format('DD/MMMM/YYYY')}
              </Text>
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
  testText: {
    fontSize: 20,
  },
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
  item: {
    paddingLeft: 15,
    paddingVertical: 15,
    width: '100%',
    borderBottomColor: '#CCC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionText: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 10,
    marginTop: 30,
    paddingLeft: 15,
  },
});
