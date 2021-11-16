/* 
Nombre: Grupos.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver los grupos HEMA
*/
import React, { useState } from 'react';
import { Text, StyleSheet, Platform, Linking } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Input, Button } from '../../components';
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from 'accordion-collapse-react-native';
import { API } from '../../lib';

export default () => {
  const [servPrivado, setPrivado] = useState('20');
  const [servPublico, setPublico] = useState('20');
  const [alergia, setAlergia] = useState('20');
  const [cardio, setCardio] = useState('20');
  const [azucar, setAzucar] = useState('20');
  const [hipertension, setHipertension] = useState('20');
  const [sobrepeso, setSobrepeso] = useState('20');
  const [jubilado, setJubilado] = useState('20');
  const [pensionado, setPensionado] = useState('20');
  const [primaria, setPrimaria] = useState('20');
  const [secundaria, setSecundaria] = useState('20');
  const [preparatoria, setPreparatoria] = useState('20');
  const [profesion, setProfesion] = useState('20');
  const [estudios, setEstudios] = useState('20');

  const statsReport = async (setLoading) => {
    const values = `${servPrivado},${servPublico},${alergia},${cardio},${azucar},${hipertension},${sobrepeso},${jubilado},${pensionado},${primaria},${secundaria},${preparatoria},${profesion},${estudios}`;
    const reportUrl = API.getStatsReportUrl(values, null, null).then((url) => {
      getFile(url, 'Reporte-Alertas.xlsx', setLoading);
    });
  };

  const getFile = (url, name, setLoading) => {
    return Platform.select({
      ios: emailFile,
      android: emailFile,
      web: () => {
        Linking.openURL(url);
      },
    })(url, name, setLoading);
  };

  const emailFile = (url, name, setLoading) => {
    setLoading(true);
    FileSystem.downloadAsync(url, FileSystem.documentDirectory + name)
      .then((d) => {
        setDownloading(false);
        setLoading(false);
        if (d.stats == 404)
          return Alert.alert('Hubo un error cargando el reporte.');
        MailComposer.composeAsync({
          attachments: [d.uri],
        });
      })
      .catch((err) => {
        setDownloading(false);
        setLoading(false);
        return Alert.alert('Hubo un error cargando el reporte.');
      });
  };

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

      <Button text="Realizar Reporte" onPress={statsReport} />
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
