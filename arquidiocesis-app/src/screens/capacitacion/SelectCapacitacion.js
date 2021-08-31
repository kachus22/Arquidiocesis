/* 
Nombre: SelectCapacitación.js
Usuario con acceso: Admin, Acompañante
Descripción: Pantalla para seleccionar un grupo de capacitación para un asistente
*/
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RefreshControl } from 'react-native-web-refresh-control';
import { List, ErrorView } from '../../components';
import { FontAwesome5 } from '@expo/vector-icons';
import { API } from '../../lib';
import moment from 'moment/min/moment-with-locales';
moment.locale('es');

export default (props) => {
  var [data, setData] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [error, setError] = useState(false);
  var { onSelect } = props.route.params;

  useEffect(() => {
    API.getCapacitaciones(false)
      .then((c) => {
        setData(c);
        setError(false);
      })
      .catch((err) => {
        setError(true);
        setRefreshing(false);
      });
  }, []);

  var getCapacitacion = () => {
    setRefreshing(true);
    API.getCapacitaciones(true)
      .then((c) => {
        setRefreshing(false);
        setData(c);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  };

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

  props.navigation.setOptions({
    headerTitle: 'Seleccionar grupo',
  });

  var selectCapacitacion = (item) => {
    if (onSelect) {
      onSelect(item);
      props.navigation.goBack();
    }
  };

  var formatUnix = (a) => {
    var f = !a
      ? moment().format('MMMM DD, YYYY')
      : moment.unix(a).format('MMMM DD, YYYY');
    return f.charAt(0).toUpperCase() + f.substr(1);
  };

  var orderCapacitaciones = () => {
    var today = moment().unix();
    var active = data.filter(
      (a) =>
        a.fin &&
        a.fin._seconds &&
        moment.unix(a.fin._seconds).endOf('day').unix() > today
    );
    var active_id = active.map((a) => a.id);
    var old = data.filter((a) => active_id.indexOf(a.id) == -1);
    return { active, old };
  };

  var caps = orderCapacitaciones();

  var renderCapacitacion = (a) => {
    return (
      <View>
        <Text style={{ fontSize: 18 }}>{a.nombre}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.date}>
            {formatUnix(a.inicio ? a.inicio._seconds : null)}
          </Text>
          <FontAwesome5
            size={12}
            color={'gray'}
            name="chevron-right"
            style={{ marginTop: 2, marginHorizontal: 8 }}
          />
          <Text style={styles.date}>
            {formatUnix(a.fin ? a.fin._seconds : null)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getCapacitacion} />
      }>
      {error ? (
        <ErrorView
          message={'Hubo un error cargando las capacitaciones...'}
          refreshing={refreshing}
          retry={getCapacitacion}
        />
      ) : data === false ? (
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
      ) : (
        <View>
          {data.length > 0 ? (
            <>
              {caps.active.length > 0 ? (
                <View>
                  <Text style={styles.header}>Capacitaciones activas</Text>
                  <List
                    data={caps.active}
                    onSelect={selectCapacitacion}
                    scroll
                    headers={false}
                    renderItem={renderCapacitacion}
                    scroll={false}
                  />
                </View>
              ) : null}
              {caps.old.length > 0 ? (
                <View>
                  <Text style={styles.header}>Capacitaciones pasadas</Text>
                  <List
                    data={caps.old}
                    onSelect={selectCapacitacion}
                    scroll
                    headers={false}
                    renderItem={renderCapacitacion}
                    scroll={false}
                  />
                </View>
              ) : null}
            </>
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
                No perteneces a una capacitación.
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  date: {
    color: 'gray',
    fontSize: 13,
  },
  header: {
    backgroundColor: '#F7F7F7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCC',
    width: '100%',
    padding: 5,
    paddingHorizontal: 15,
    fontWeight: '600',
  },
});
