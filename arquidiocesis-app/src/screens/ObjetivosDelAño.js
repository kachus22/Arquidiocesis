/* 
Nombre: ObjetivosDelAño.js
Descripción: Pantalla para ver la información de los objetivos de un año
*/
import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';
import { FontAwesome5 } from '@expo/vector-icons';

import { API } from './../lib';

export default (props) => {
  const { year } = props.route.params;
  const [loadingData, setIsLoadingData] = useState(false);
  const [info, setInfo] = useState(false);
  const [error, setError] = useState('');

  props.navigation.setOptions({
    headerTitle: `Objetivos del año ${year}`,
  });

  const getObjectives = async () => {
    try {
      setIsLoadingData(true);
      const objectives = await API.getObjectivesByYear(year);
      const tableData = [];

      Object.keys(objectives).map((zonaName) => {
        tableData.push([zonaName]);

        objectives[zonaName].forEach((decanatoData) => {
          const rowData = [];
          rowData.push(decanatoData.decanato);
          rowData.push(decanatoData.objetivos.p);
          rowData.push(decanatoData.objetivos.cg);
          rowData.push(decanatoData.objetivos.oc1);
          rowData.push(decanatoData.objetivos.oc2);
          rowData.push(decanatoData.objetivos.oc3);
          rowData.push(decanatoData.objetivos.id);
          tableData.push(rowData);
        });
      });

      setError('');
      setInfo({
        tableHead: ['', 'P', 'CG', 'OC1', 'OC2', 'OC3', ''],
        tableData,
      });
      setIsLoadingData(false);
    } catch (error) {
      console.log('error :>> ', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    getObjectives();
  }, []);

  const onEdit = () => {
    getObjectives();
  };

  const goToObjectives = async (objectiveData) => {
    props.navigation.navigate('ObjetivosDecanato', { objectiveData, onEdit });
  };

  if (loadingData || !info) {
    return (
      <View>
        <Text style={styles.section}>Cargando datos...</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error !== '') {
    return (
      <View>
        <Text style={styles.section}>
          Ocurrió un error cargando los datos. Intente más tarde.
        </Text>
        <Text style={styles.section}>{error}</Text>
      </View>
    );
  }

  const element = (data) => (
    <TouchableOpacity onPress={() => goToObjectives(data)}>
      <View style={styles.btn}>
        <Text style={styles.btnText}>
          <FontAwesome5 name="edit" style={{ fontSize: 15 }} />
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1 }}>
      <View>
        <Text style={styles.section}>Objetivos del año {year}</Text>
        <Table borderStyle={{ borderWidth: 1, borderColor: '#002E60' }}>
          <Row
            data={info.tableHead}
            style={styles.head}
            textStyle={styles.headText}
          />
          {info.tableData.map((rowData, index) => (
            <TableWrapper key={index} style={styles.row}>
              {rowData.map((cellData, cellIndex) => {
                if (rowData.length === 1) {
                  return (
                    <Cell
                      key={cellIndex}
                      data={cellData}
                      textStyle={styles.rowText}
                    />
                  );
                }

                return (
                  <Cell
                    key={cellIndex}
                    data={cellIndex === 6 ? element(rowData) : cellData}
                    textStyle={
                      cellIndex === 0
                        ? { fontSize: 10, textAlign: 'center' }
                        : styles.rowText
                    }
                  />
                );
              })}
            </TableWrapper>
          ))}
        </Table>
      </View>
    </ScrollView>
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
  section: {
    fontSize: 16,
    color: 'gray',
    marginTop: 15,
    marginBottom: 15,
    fontWeight: '500',
    paddingLeft: 15,
  },
  head: {
    height: 40,
    backgroundColor: '#002E60',
  },
  headText: {
    margin: 6,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 34,
  },
  rowText: {
    textAlign: 'center',
    fontSize: 18,
  },
  btn: {
    width: 40,
    height: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#78B7BB',
    borderRadius: 2,
  },
  btnText: {
    textAlign: 'center',
    color: '#fff',
  },
});
