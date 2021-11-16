/* 
Nombre: Grupos.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver los grupos HEMA
*/
import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Input, Button } from '../../components';
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from 'accordion-collapse-react-native';

export default () => {
  // var [user, setUser] = useState(null);
  // var [data, setData] = useState(false);
  // var [refreshing, setRefreshing] = useState(false);
  // var [error, setError] = useState(false);
  const [servPrivado, setPrivado] = useState('');
  const [servPublico, setPublico] = useState('');
  const [alergia, setAlergia] = useState('');
  const [cardio, setCardio] = useState('');
  const [azucar, setAzucar] = useState('');
  const [hipertension, setHipertension] = useState('');
  const [sobrepeso, setSobrepeso] = useState('');
  const [jubilado, setJubilado] = useState('');
  const [pensionado, setPensionado] = useState('');
  const [primaria, setPrimaria] = useState('');
  const [secundaria, setSecundaria] = useState('');
  const [preparatoria, setPreparatoria] = useState('');
  const [profesion, setProfesion] = useState('');
  const [estudios, setEstudios] = useState('');

  return (
    <KeyboardAwareScrollView style={styles.loginContainer} bounces={true}>
      <Text style={styles.header}>Agregar Porcentajes</Text>

      <Collapse>
        <CollapseHeader>
          <Text style={styles.collapsible}> Servicio Médico</Text>
        </CollapseHeader>
        <CollapseBody>
          <Input
            name="Servicio Médico Privado"
            value={servPrivado}
            onChangeText={setPrivado}
          />

          <Input
            name="Servicio Médico Público"
            value={servPublico}
            onChangeText={setPublico}
          />
        </CollapseBody>
      </Collapse>
      <Collapse>
        <CollapseHeader>
          <Text style={styles.collapsible}> Salud</Text>
        </CollapseHeader>
        <CollapseBody>
          <Input name="Alergias" value={alergia} onChangeText={setAlergia} />

          <Input
            name="Problema Cardiovascular"
            value={cardio}
            onChangeText={setCardio}
          />

          <Input name="Diabetes" value={azucar} onChangeText={setAzucar} />

          <Input
            name="Hipertensión"
            value={hipertension}
            onChangeText={setHipertension}
          />

          <Input
            name="Sobrepeso"
            value={sobrepeso}
            onChangeText={setSobrepeso}
          />
        </CollapseBody>
      </Collapse>
      <Collapse>
        <CollapseHeader>
          <Text style={styles.collapsible}> Seguridad Social</Text>
        </CollapseHeader>
        <CollapseBody>
          <Input
            name="Personas Jubiladas"
            value={jubilado}
            onChangeText={setJubilado}
          />

          <Input
            name="Personas Pensionadas"
            value={pensionado}
            onChangeText={setPensionado}
          />
        </CollapseBody>
      </Collapse>
      <Collapse>
        <CollapseHeader>
          <Text style={styles.collapsible}>Educación</Text>
        </CollapseHeader>
        <CollapseBody>
          <Input name="Primaria" value={primaria} onChangeText={setPrimaria} />

          <Input
            name="Secundaria"
            value={secundaria}
            onChangeText={setSecundaria}
          />

          <Input
            name="Preparatoria"
            value={preparatoria}
            onChangeText={setPreparatoria}
          />

          <Input
            name="Profesion"
            value={profesion}
            onChangeText={setProfesion}
          />

          <Input name="Estudios" value={estudios} onChangeText={setEstudios} />
        </CollapseBody>
      </Collapse>

      <Button text="Realizar Reporte" />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginContainer: {
    height: '70%',
    width: '100%',
    padding: 10,
  },

  collapsible: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CCC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCC',
    width: '100%',
    padding: 5,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
});
