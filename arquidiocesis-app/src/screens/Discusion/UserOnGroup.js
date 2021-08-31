import React, { useEffect, useState } from 'react';
import { AlphabetList, Button } from '../../components';
import { Text, ActivityIndicator, ScrollView } from 'react-native';
import { Modal } from 'react-native-paper';
import GroupsConvAPI from '../../lib/apiV2/GroupsConvAPI';

/**
 * user = {id: string, name: string}
 */

export default (props) => {
  const { idGroup } = props.route.params;
  console.log(idGroup);
  const [users, setUsers] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState(false);
  const [regather, setRegather] = useState(true);

  props.navigation.setOptions({ title: 'Usuarios' });

  useEffect(() => {
    if (!regather) return;
    (async () => {
      const data = await GroupsConvAPI.getAllUsers({ id: idGroup });
      if (data.error) {
        console.log(data.message);
        return;
      }

      const newUsers = data.users
        .filter((v) => v.nombre !== undefined)
        .map((v) => ({
          id: v.id,
          name: v.nombre,
        }));

      setUsers(newUsers);
      setRegather(false);
    })();
    // Hacer llamada para obtener los usuarios de un grupo
    /* const fak = factory((fake) => ({
      id: fake.random.uuid(),
      name: fake.name.findName(),
    }));
    setUsers(fak.make(25)); */
  }, [regather]);

  const onListPress = (item) => {
    setUser(item);
    setModalVisible(true);
  };

  const addFromRole = () => {
    props.navigation.navigate('AdduserFromRole', {
      onAdd: async (newUsers) => {
        const result = await GroupsConvAPI.addUser(idGroup, newUsers);
        if (!result.error) console.log(result.message);
        setRegather(true);
        return result.error !== true;
        /* let arr = [...users];
        arr = arr.concat(newUsers);
        setUsers(arr); */
      },
    });
  };

  const addIndiv = () => {
    props.navigation.navigate('AddUserIndividual', {
      onAdd: async (newUsers) => {
        const result = await GroupsConvAPI.addUser(idGroup, newUsers);
        if (!result.error) console.log(result.message);
        setRegather(true);
        return result.error !== true;
        /*         let arr = [...users];
        arr = arr.concat(newUsers);
        setUsers(arr); */
      },
    });
  };

  return (
    <>
      <ScrollView>
        <Button
          text="Agregar usuario individual"
          style={{ width: 250, alignSelf: 'center' }}
          onPress={addIndiv}
        />
        <Button
          text="Agregar usuarios desde rol"
          style={{ width: 250, alignSelf: 'center' }}
          onPress={addFromRole}
        />
        {!users ? (
          <>
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
          </>
        ) : (
          <AlphabetList
            data={users}
            onSelect={onListPress}
            scroll
            sort={'name'}
          />
        )}
      </ScrollView>
      <Modal
        transparent={true}
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(!modalVisible);
        }}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          maxHeight: '80%',
        }}>
        <Text
          style={{
            marginBottom: '25px',
          }}>
          {`Esta seguro que quiere remover a ${user.name} del grupo?`}
        </Text>
        <Button
          text={'Aceptar'}
          onPress={() => {
            // Hacer llamada de eliminar usuario en grupo
            (async () => {
              const data = await GroupsConvAPI.removeUsers(idGroup, [user.id]);
              if (data.error) {
                console.log(data.message);
                return;
              }
              setRegather(true);
              setModalVisible(false);
            })();
          }}
        />
        <Button
          text={'Cancelar'}
          onPress={() => {
            setModalVisible(false);
          }}
        />
      </Modal>
    </>
  );
};
