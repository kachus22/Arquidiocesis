/* 
Nombre: Objetivos.js
Descripción: Pantalla para ver la lista de años disponibles para ver objetivos
*/
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { API } from './../lib';
import { Item } from './../components';

export default (props) => {
  const goToYearObjectives = async (year) => {
    props.navigation.navigate('ObjetivosDelAño', { year });
  };

  const renderYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= 2020; year--) {
      years.push(
        <Item
          text={`${year}`}
          onPress={() => goToYearObjectives(year)}
          key={year}
        />
      );
    }

    return years;
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View>
        <Text style={styles.section}>Selecciona un año</Text>
        {renderYears()}
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
});
