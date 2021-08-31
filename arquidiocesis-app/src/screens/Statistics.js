import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  FlatList,
  View,
  Text,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { API } from '../lib';
import { ErrorView } from '../components';
import { RefreshControl } from 'react-native-web-refresh-control';
import CanvasJSReact from '../lib/canvasjs.react';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default (props) => {
  var [stats, setStats] = useState(false);
  var [error, setError] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [verAlergias, setVerAlergias] = useState(false);
  var [verDiscapacidad, setVerDiscapacidad] = useState(false);
  var [servicioMedico, setServicioMedico] = useState({});
  var [alergias, setAlergias] = useState({});
  var [descAlergias, setDescAlergias] = useState([]);
  var [problemasSalud, setProblemasSalud] = useState({});
  var [seguridadSocial, setSeguridadsocial] = useState({});
  var [educacion, setEducacion] = useState({});
  var [discapacidad, setDiscapacidad] = useState({});
  var [descDiscapacidad, setDescDiscapacidad] = useState([]);

  props.navigation.setOptions({
    headerTitle: 'Estadísticas de miembros',
  });

  useEffect(() => {
    API.getStats()
      .then((d) => {
        setStats(d);
        defineGraphData(d);
        setRefreshing(false);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  }, []);

  var getStats = () => {
    setRefreshing(true);
    API.getStats()
      .then((d) => {
        setStats(d);
        defineGraphData(d);
        setRefreshing(false);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });
  };

  CanvasJS.addColorSet('customColorSet1', [
    '#4661EE',
    '#EC5657',
    '#1BCDD1',
    '#8FAABB',
    '#B08BEB',
    '#3EA0DD',
    '#F5A52A',
    '#23BFAA',
    '#FAA586',
    '#EB8CC6',
  ]);

  CanvasJS.addColorSet('customColorSet2', ['#EC5657', '#E6E6E6']);

  function defineGraphData(stats) {
    const total_servicio_medico = Math.round(
      stats.servicio_medico.privado + stats.servicio_medico.publico
    );

    setServicioMedico({
      interactivityEnabled: false,
      animationEnabled: true,
      title: {
        text: 'Índice de Servicio Médico',
        horizontalAlign: 'left',
        fontWeight: 'normal',
        fontColor: 'gray',
        padding: 15,
      },
      subtitles: [
        {
          text: `${total_servicio_medico}% Total`,
          verticalAlign: 'center',
          fontSize: 18,
          dockInsidePlotArea: true,
        },
      ],
      backgroundColor: '#F2F2F2',
      colorSet: 'customColorSet1',
      data: [
        {
          type: 'doughnut',
          showInLegend: false,
          indexLabel: '{name}: {y}',
          indexLabelFontSize: 12,
          indexLabelPlacement: 'outside',
          innerRadius: '70%',
          yValueFormatString: '#0\'%\'',
          dataPoints: [
            { name: 'Privado', y: stats.servicio_medico.privado },
            { name: 'Público', y: stats.servicio_medico.publico },
            { name: 'Ninguno', y: stats.servicio_medico.ninguno },
          ],
        },
      ],
    });

    const alergico = Math.round(stats.alergico);

    setAlergias({
      interactivityEnabled: false,
      animationEnabled: true,
      title: {
        text: 'Índice de Alergias',
        horizontalAlign: 'left',
        fontWeight: 'normal',
        fontColor: 'gray',
        padding: 15,
      },
      subtitles: [
        {
          text: `${alergico}% Con alergia`,
          verticalAlign: 'center',
          fontSize: 18,
          dockInsidePlotArea: true,
        },
      ],
      backgroundColor: '#F2F2F2',
      colorSet: 'customColorSet2',
      data: [
        {
          type: 'doughnut',
          showInLegend: false,
          yValueFormatString: '#0\'%\'',
          startAngle: 90,
          innerRadius: '85%',
          dataPoints: [
            { name: 'Con alergia', y: alergico },
            { name: 'Sin alergia', y: 100 - alergico },
          ],
        },
      ],
    });

    setDescAlergias(stats.alergico_desc);

    setProblemasSalud({
      interactivityEnabled: true,
      animationEnabled: true,
      title: {
        text: 'Problemas de salud',
        horizontalAlign: 'left',
        fontWeight: 'normal',
        fontColor: 'gray',
        padding: 15,
      },
      subtitles: [
        {
          text: `Total de personas: ${stats.total}`,
          horizontalAlign: 'left',
          fontWeight: 'normal',
          fontColor: 'gray',
          fontSize: 14,
          padding: 20,
        },
      ],
      backgroundColor: '#F2F2F2',
      colorSet: 'customColorSet1',
      toolTip: {
        enabled: true,
        animationEnabled: true,
        content: function (e) {
          const dp = e.entries[0].dataPoint;
          const pct = Math.round((dp.y / stats.total) * 100);
          return pct + '%';
        },
      },
      data: [
        {
          type: 'column',
          yValueFormatString: '#0',
          indexLabel: '{y}',
          dataPoints: [
            { label: 'Hipertensión', y: stats.p_hipertension },
            { label: 'Sobrepeso', y: stats.p_sobrepeso },
            { label: 'Problema Cardiovascular', y: stats.p_cardiovascular },
            { label: 'Azúcar', y: stats.p_azucar },
            { label: 'Ninguno', y: stats.p_ninguno },
          ],
        },
      ],
    });

    const total_seguridad_social = Math.round(
      stats.seguridad_social.pensionado +
        stats.seguridad_social.jubilado +
        stats.seguridad_social.apoyo_federal
    );

    setSeguridadsocial({
      interactivityEnabled: false,
      animationEnabled: true,
      title: {
        text: 'Índice de Seguridad Social',
        horizontalAlign: 'left',
        fontWeight: 'normal',
        fontColor: 'gray',
        padding: 15,
      },
      subtitles: [
        {
          text: `${total_seguridad_social}% Total`,
          verticalAlign: 'center',
          fontSize: 18,
          dockInsidePlotArea: true,
        },
      ],
      backgroundColor: '#F2F2F2',
      colorSet: 'customColorSet1',
      data: [
        {
          type: 'doughnut',
          showInLegend: false,
          indexLabel: ' {name}: {y} ',
          indexLabelFontSize: 12,
          indexLabelPlacement: 'outside',
          innerRadius: '70%',
          yValueFormatString: '#0\'%\'',
          dataPoints: [
            { name: 'Pensionado', y: stats.seguridad_social.pensionado },
            { name: 'Jubilado', y: stats.seguridad_social.jubilado },
            { name: 'Apoyo Federal', y: stats.seguridad_social.apoyo_federal },
            { name: 'Ninguno', y: stats.seguridad_social.ninguno },
          ],
        },
      ],
    });

    setEducacion({
      interactivityEnabled: true,
      animationEnabled: true,
      title: {
        text: 'Índice de Educación',
        horizontalAlign: 'left',
        fontWeight: 'normal',
        fontColor: 'gray',
        padding: 15,
      },
      backgroundColor: '#F2F2F2',
      colorSet: 'customColorSet1',
      legend: {
        horizontalAlign: 'right',
        verticalAlign: 'center',
        fontSize: 14,
        fontWeight: 'normal',
      },
      data: [
        {
          type: 'pie',
          showInLegend: true,
          yValueFormatString: '#0\'%\'',
          startAngle: 90,
          legendText: '{name}: {y}',
          dataPoints: [
            { name: 'Primaria', y: stats.escolaridad.primaria },
            { name: 'Secundaria', y: stats.escolaridad.secundaria },
            { name: 'Preparatoria', y: stats.escolaridad.preparatoria },
            { name: 'Profesional', y: stats.escolaridad.profesional },
            { name: 'Carrera Técnica', y: stats.escolaridad.carrera_tecnica },
            { name: 'Sin educación', y: stats.escolaridad.ninguno },
          ],
        },
      ],
    });

    const discapacidad = Math.round(stats.discapacidad);

    setDiscapacidad({
      interactivityEnabled: false,
      animationEnabled: true,
      title: {
        text: 'Índice de Discapacidad',
        horizontalAlign: 'left',
        fontWeight: 'normal',
        fontColor: 'gray',
        padding: 15,
      },
      subtitles: [
        {
          text: `${discapacidad}% Con discapacidad`,
          verticalAlign: 'center',
          fontSize: 16,
          dockInsidePlotArea: true,
        },
      ],
      backgroundColor: '#F2F2F2',
      colorSet: 'customColorSet2',
      data: [
        {
          type: 'doughnut',
          showInLegend: false,
          yValueFormatString: '#0\'%\'',
          startAngle: 90,
          innerRadius: '85%',
          dataPoints: [
            { name: 'Con discapacidad', y: discapacidad },
            { name: 'Sin discapacidad', y: 100 - discapacidad },
          ],
        },
      ],
    });

    setDescDiscapacidad(stats.discapacidad_desc);
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getStats} />
      }>
      {error ? (
        <ErrorView
          message={'Hubo un error cargando las estadísticas...'}
          refreshing={refreshing}
          retry={getStats}
        />
      ) : stats === false ? (
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
          <CanvasJSChart id="graph" options={servicioMedico} />
          <CanvasJSChart options={alergias} />
          <View style={styles.switchContainer}>
            <Text style={styles.label}>¿Ver lista de alergias?</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#32CD32' }}
              thumbColor={verAlergias ? '#FFFFFF' : '#f4f3f4'}
              onValueChange={setVerAlergias}
              value={verAlergias}
            />
          </View>
          {verAlergias && (
            <ScrollView style={styles.list}>
              <FlatList
                data={descAlergias}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      backgroundColor: index % 2 == 0 ? '#FFFFFF' : '#F2F2F2',
                    }}>
                    <Text style={styles.listItem}>{item}</Text>
                  </View>
                )}
              />
            </ScrollView>
          )}
          <CanvasJSChart options={problemasSalud} />
          <CanvasJSChart options={seguridadSocial} />
          <CanvasJSChart options={educacion} />
          <CanvasJSChart options={discapacidad} />
          <View style={styles.switchContainer}>
            <Text style={styles.label}>¿Ver lista de discapacidades?</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#32CD32' }}
              thumbColor={verDiscapacidad ? '#FFFFFF' : '#f4f3f4'}
              onValueChange={setVerDiscapacidad}
              value={verDiscapacidad}
            />
          </View>
          {verDiscapacidad && (
            <ScrollView style={styles.list}>
              <FlatList
                data={descDiscapacidad}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      backgroundColor: index % 2 == 0 ? '#FFFFFF' : '#F2F2F2',
                    }}>
                    <Text style={styles.listItem}>{item}</Text>
                  </View>
                )}
              />
            </ScrollView>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionText: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 10,
    marginTop: 30,
    paddingLeft: 15,
  },
  listItem: {
    padding: 10,
  },
  label: {
    fontSize: 16,
    marginRight: 15,
    color: 'grey',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    margin: 15,
  },
  list: {
    maxHeight: '225px',
    margin: 20,
    marginTop: 5,
  },
});
