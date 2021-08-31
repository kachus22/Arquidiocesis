/* 
Nombre: RegistroGrupo.js
Usuario con acceso: Admin
Descripción: Pantalla para registrar un grupo HEMA
*/
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { Input, Button, Picker, PickerScreen } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API } from '../../lib';

export default (props) => {
  var [loading, setLoading] = useState(false);
  var [name, setName] = useState('');
  var [coordinador, setCoordinador] = useState(false);
  var [parroquia, setParroquia] = useState(false);
  var [capilla, setCapilla] = useState(false);
  var [isEnabled, setIsEnabled] = useState(false);

  var [coordinadorList, setCoordinadorList] = useState(false);
  var [parroquiasList, setParroquiasList] = useState(false);
  var [capillasList, setCapillasList] = useState(false);

  props.navigation.setOptions({
    headerStyle: {
      backgroundColor: '#002E60',
      shadowOpacity: 0,
    },
    headerTitle: 'Registro Grupo',
  });

  var onAdd = props.route.params.onAdd;

  useEffect(() => {
    API.getParroquias().then((d) => {
      setParroquiasList(d);
    });

    API.getCoordinadores().then((c) => {
      setCoordinadorList(c);
    });
  }, []);

  var doRegister = () => {
    if (loading) return;
    if (name.length < 1) return alert('Por favor introduzca un nombre.');
    if (!coordinador) return alert('Favor de seleccionar un coordinador.');
    if (!parroquia) return alert('Favor de seleccionar una parroquia');

    setLoading(true);
    API.addGrupo(
      name,
      coordinador.id,
      capilla && isEnabled ? null : parroquia.id,
      capilla ? capilla.id : null
    )
      .then((new_grupo) => {
        setLoading(false);
        if (!new_grupo) return alert('Hubo un error registrando el coordinador');
        new_grupo.new = true;
        if (onAdd) onAdd(new_grupo);
        alert('Se ha agregado el grupo');
        props.navigation.goBack();
      })
      .catch((err) => {
        console.error(err);
        alert('Hubo un error registrando el grupo');
        setLoading(false);
      });
  };

  var parroquiaSelected = (p, state = false) => {
    setParroquia(p);
    setCapilla(null);
    setCapillasList(false);
    if (!isEnabled && !state) return;
    API.getParroquia(p.id).then((c) => {
      setCapillasList(c.capillas || []);
    });
  };

  var toggleSwitch = () => {
    var ps = isEnabled;
    setIsEnabled(!ps);
    if (!ps && parroquia) {
      parroquiaSelected(parroquia, !ps);
    }
  };

  return (
    <KeyboardAwareScrollView style={styles.container} bounces={false}>
      <Text style={styles.header}>Registrar Grupo</Text>
      <Input name="Nombre" value={name} onChangeText={setName} />
      {coordinadorList ? (
        <PickerScreen
          name={'Seleccionar coordinador'}
          data={coordinadorList}
          value={
            coordinador
              ? `${coordinador.nombre} ${coordinador.apellido_paterno} ${coordinador.apellido_materno}`
              : ''
          }
          onSelect={setCoordinador}
          navigation={props.navigation}
          renderItem={(i) => {
            return (
              <View>
                <Text style={{ fontSize: 18 }}>
                  {i.nombre} {i.apellido_paterno} {i.apellido_materno}
                </Text>
                <Text style={{ color: 'gray' }}>{i.email}</Text>
              </View>
            );
          }}
        />
      ) : (
        <ActivityIndicator style={{ height: 80 }} />
      )}
      {parroquiasList ? (
        <PickerScreen
          value={parroquia ? parroquia.nombre : ''}
          name={'Seleccionar Parroquia'}
          data={parroquiasList}
          sort={'nombre'}
          onSelect={parroquiaSelected}
          navigation={props.navigation}
        />
      ) : (
        <ActivityIndicator style={{ height: 80 }} />
      )}
      {parroquia ? (
        <View>
          <Text style={styles.label}>¿Pertenece a Capilla?</Text>
          <View style={styles.checkboxContainer}>
            <Switch
              trackColor={{ false: '#767577', true: '#32CD32' }}
              thumbColor={isEnabled ? '#FFFFFF' : '#f4f3f4'}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
        </View>
      ) : null}
      {isEnabled ? (
        capillasList ? (
          capillasList.length > 0 ? (
            <PickerScreen
              value={capilla ? capilla.nombre : ''}
              name={'Seleccionar Capilla'}
              data={capillasList}
              sort={'nombre'}
              onSelect={setCapilla}
              navigation={props.navigation}
            />
          ) : (
            <Text
              style={{
                fontSize: 16,
                textAlign: 'center',
                color: 'gray',
                padding: 10,
                backgroundColor: 'white',
              }}>
              Esta parroquia no tiene capillas.
            </Text>
          )
        ) : (
          <ActivityIndicator style={{ height: 80 }} />
        )
      ) : null}
      <Button text="Registrar" loading={loading} onPress={doRegister} />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'grey',
    fontWeight: '500',
  },
  container: {
    height: '70%',
    width: '100%',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
});
