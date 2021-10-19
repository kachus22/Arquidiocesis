/* 
Nombre: Grupos.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para ver los grupos HEMA
*/
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { List } from '../../components';

export default () => {
  // var [user, setUser] = useState(null);
  // var [data, setData] = useState(false);
  // var [refreshing, setRefreshing] = useState(false);
  // var [error, setError] = useState(false);
  const alert = {
    name: '',
    description: '',
    date: '',
  };
  const alert1 = Object.create(alert);
  const alert2 = Object.create(alert);

  alert1.name = 'alerta 1';
  alert1.description = 'descripción corta';
  alert1.date = '18/10/21';
  alert2.name = 'alerta 2';
  alert2.description = 'descripción corta';
  alert2.date = '17/10/21';

  const alerts = [alert1, alert2];

  const renderItem = (alerts) => {
    return (
      <View>
        <Text style={{ fontSize: 18 }} numberOfLines={1}>
          {alerts.name}
        </Text>
        <Text
          style={{
            color: 'gray',
            fontStyle: 'normal',
          }}
          numberOfLines={1}>
          {alerts.description}
        </Text>
        <Text
          style={{
            color: 'gray',
            fontStyle: 'normal',
          }}
          numberOfLines={1}>
          {alerts.date}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View>
        <List data={alerts} scroll renderItem={renderItem} />
      </View>
    </ScrollView>
  );
};

// const styles = StyleSheet.create({
//   testText: {
//     fontSize: 20,
//   },
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
