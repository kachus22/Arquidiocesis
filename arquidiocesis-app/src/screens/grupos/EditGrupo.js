/* 
Nombre: EditGrupo.js
Usuario con acceso: Admin
Descripción: Pantalla para editar la información de los grupos HEMA
*/
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import {
  AlphabetList,
  ErrorView,
  Input,
  Button,
  Picker,
} from '../../components';
import { API, Util } from '../../lib';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default (props) => {
  var parroquia_id = props.route.params.grupo.capilla
    ? props.route.params.grupo.capilla.parroquia.id
    : props.route.params.grupo.parroquia.id;

  var [loading, setLoading] = useState(false);
  var [nombre, setNombre] = useState(props.route.params.grupo.nombre);
  // var [coordinador, setCoordinador]= useState(false);
  var [parroquia, setParroquia] = useState(false);
  var [capilla, setCapilla] = useState(false);
  var [isEnabled, setIsEnabled] = useState(false);

  // var [coordinadorList, setCoordinadorList] = useState(false);
  var [parroquiasList, setParroquiasList] = useState(false);
  var [capillasList, setCapillasList] = useState(false);

  var onEdit = props.route.params.onEdit;

  props.navigation.setOptions({
    headerTitle: 'Editar grupo',
  });

  useEffect(() => {
    if (props.route.params.grupo.capilla) {
      setIsEnabled(true);
      var p = props.route.params.grupo.capilla.parroquia;
      parroquiaSelected({
        value: p.id,
        label: p.nombre,
      });
    }

    API.getParroquias().then((d) => {
      setParroquiasList(d);
    });

    // API.getCoordinadores().then(c=>{
    // 	setCoordinadorList(c);
    // })
  }, []);

  var getParroquiaIndex = () => {
    if (!parroquiasList) return;
    return parroquiasList.findIndex((a) => a.id == parroquia_id);
  };

  // var getCoordinadorIndex = ()=>{
  // 	if(!coordinadorList) return;
  // 	return coordinadorList.findIndex(a=>a.id==props.route.params.grupo.coordinador.id);
  // }

  var getCapillaIndex = () => {
    if (!capillasList || !props.route.params.grupo.capilla) return;
    return capillasList.findIndex(
      (a) => a.id == props.route.params.grupo.capilla.id
    );
  };

  var parroquiaSelected = (p, state = false) => {
    setParroquia(p);
    setCapilla(null);
    setCapillasList(false);
    if (!isEnabled && !state) return;
    API.getParroquia(p.value).then((c) => {
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

  var save = () => {
    var data = {
      nombre,
      // coordinador: coordinador ? coordinador.value : null,
      parroquia: parroquia ? parroquia.value : null,
      capilla: isEnabled ? capilla.value : null,
    };
    var { valid, prompt } = Util.validateForm(data, {
      nombre: {
        type: 'minLength',
        value: 3,
        prompt: 'Favor de introducir el nombre del grupo. Mínimo 3 caracteres.',
      },
      // coordinador: { type: 'empty', prompt: 'Favor de seleccionar el coordinador.' },
      parroquia: {
        type: 'empty',
        prompt: 'Favor de seleccionar la parroquia.',
      },
    });
    if (!valid) return alert(prompt);
    if (isEnabled && !capilla) {
      return alert(
        'Favor de seleccionar una capilla, o quitar la opción de pertenece a capilla.'
      );
    }

    setLoading(true);
    API.editGrupo(props.route.params.grupo.id, data)
      .then((done) => {
        setLoading(false);
        if (!done) return alert('Hubo un error editando el grupo.');

        var new_grupo = { ...props.route.params.grupo };
        new_grupo.nombre = nombre;
        new_grupo.cached = false;
        // new_grupo.coordinador = {
        // 	id: coordinador.value,
        // 	nombre: coordinador.label
        // };
        if (isEnabled) {
          delete new_grupo.parroquia;
          new_grupo.capilla = {
            id: capilla.value,
            nombre: capilla.label,
            parroquia: {
              id: parroquia.value,
              nombre: parroquia.label,
            },
          };
        } else {
          delete new_grupo.capilla;
          new_grupo.parroquia = {
            id: parroquia.value,
            nombre: parroquia.label,
          };
        }

        alert('Se ha editado el grupo.');
        if (onEdit) onEdit(new_grupo);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        alert('Hubo un error editando el grupo.');
      });
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ padding: 15 }}>
      <Input name="Nombre" value={nombre} onChangeText={setNombre} />
      {parroquiasList ? (
        <Picker
          name={'Seleccionar Parroquia'}
          items={parroquiasList.map((a) => ({ label: a.nombre, value: a.id }))}
          onValueChange={parroquiaSelected}
          select={getParroquiaIndex()}
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
            <Picker
              name={'Seleccionar Capilla'}
              style={{ marginTop: 15 }}
              items={capillasList.map((a) => ({
                label: a.nombre,
                value: a.id,
              }))}
              onValueChange={setCapilla}
              select={getCapillaIndex()}
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
      <Button text="Guardar" loading={loading} onPress={save} />
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
});
