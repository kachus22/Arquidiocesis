/* 
Nombre: Parrocos.js
Usuario con acceso: 
Descripción: Pantalla para ver la información de todos los párrocos en el sistema
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
import { AlphabetList, Button, ErrorView, Alert } from '../../components';
import { API } from '../../lib';

export default (props) => {
  var [data, setData] = useState(false);
  var [error, setError] = useState(false);
  var [refreshing, setRefreshing] = useState(false);
  var [user, setUser] = useState(false);



  useEffect(() => {
    API.getUser().then(setUser);
    
    API.getParrocos(true)
      .then((d) => {
        setRefreshing(false);
        setData(d);
        setError(false);
        console.log(d)
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });

  }, []);

  var getParrocos = () => {
    setRefreshing(true);
    setError(false);
    
    API.getParrocos(true)
      .then((d) => {
        setRefreshing(false);
        setData(d);
        setError(false);
      })
      .catch((err) => {
        setRefreshing(false);
        setError(true);
      });

  };

  var formatData = () => {
    console.log(data)
   /* return data.map((a) => ({
      ...a,
      nombre_completo: `${a.nombre} ${a.apellido_paterno}`,
    }));*/
    return []
  };

  return (
    <ScrollView style={{ flex: 1 }}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={getParrocos} />   
    }
    > 
      <View>
      {user && (user.type == 'admin' ||  user.type == 'superadmin' || user.type == 'coordinador') && (
        <Button
          text="Registro párroco"
          style={{ width: 250, alignSelf: 'center' }}
          //onPress={addParroco}
        /> ) }

      {data.length == 0 ? (
          <View>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                color: 'gray',
                backgroundColor: 'white',
                padding: 15,
              }}>
              No hay párrocos en el sistema.
            </Text>
          </View>
        ) : (
          <AlphabetList
            data={formatData()}
           // onSelect={detalleCoord}
            scroll
            sort={'nombre_completo'}
          />
        )}
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
});
