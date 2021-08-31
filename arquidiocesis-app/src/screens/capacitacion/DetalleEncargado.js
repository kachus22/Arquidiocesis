/* 
Nombre: DetalleEncargado.js
Usuario con acceso: Admin, Acompañante
Descripción: Pantalla para ver la info de un encargado de capacitación
*/
import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { API } from '../../lib';
import { Input } from '../../components';

export default (props) => {
  var { encargado } = props.route.params;

  var [capacitador, setCapacitador] = useState(null);

  props.navigation.setOptions({
    headerTitle: 'Ver encargado',
  });

  useEffect(() => {
    API.getCapacitadores().then((c) => {
      if (c.length == 0) {
        API.getCapacitadores(true).then((cap) => {
          setCapacitador(cap.find((a) => a.id == encargado));
        });
      } else {
        setCapacitador(c.find((a) => a.id == encargado));
      }
    });
  }, []);

  return (
    <ScrollView>
      {capacitador && (
        <View style={{ padding: 15 }}>
          <Input name="Correo electrónico" value={capacitador.email} readonly />
          <Input name="Nombre" value={capacitador.nombre} readonly />
          <Input
            name="Apellido Paterno"
            value={capacitador.apellido_paterno}
            readonly
          />
          <Input
            name="Apellido Materno"
            value={capacitador.apellido_materno}
            readonly
          />
        </View>
      )}
    </ScrollView>
  );
};
