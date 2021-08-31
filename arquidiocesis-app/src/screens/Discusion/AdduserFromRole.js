import React, { useEffect, useState } from 'react';
import { AlphabetList, Button } from '../../components';
import { Text, ActivityIndicator, ScrollView } from 'react-native';
import { Modal, List } from 'react-native-paper';
import { factory } from 'node-factory';
import RolesConvAPI from './../../lib/apiV2/RolesConvAPI';

/**
 * role = {id: string, name: string}
 * user = {id: string, name: string}
 */
export default (props) => {
  const [roles, setRoles] = useState(false);
  const [visible, setVisible] = useState(false);
  const [users, setUsers] = useState(false);

  const { onAdd } = props.route.params;

  props.navigation.setOptions({ title: 'Agregar desde rol' });

  useEffect(() => {
    (async () => {
      const roles = await RolesConvAPI.allRoles();
      setRoles(roles);
    })();
    /* const fak = factory((fake) => ({
      id: fake.random.uuid(),
      name: fake.name.jobType(),
    }));
    setRoles(fak.make(15)); */
  }, []);

  const getPpl = async (idRole) => {
    // Hacer llamada para obtener usuarios
    (async () => {
      const data = await RolesConvAPI.allUsersPerRole(idRole);
      if (data.error) {
        console.log(data.message);
        return;
      }
      const ppl = data.users
        .filter((v) => v.nombre !== undefined)
        .map((v) => ({
          id: v.id,
          name: v.nombre ?? '',
        }));
      setUsers(ppl);
    })();
    /* const fak = factory((fake) => ({
      id: fake.random.uuid(),
      name: fake.name.firstName(),
    }));
    setUsers(fak.make(15)); */
    return;
  };

  const onListPress = (v) => {
    console.log(v.id);
    getPpl(v.id);
    setVisible(true);
  };

  return (
    <>
      <ScrollView>
        {roles === false ? (
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
        ) : roles.length === 0 ? (
          <Text
            style={{
              marginTop: 10,
              textAlign: 'center',
              fontWeight: '600',
              fontSize: 16,
            }}>
            No hay roles
          </Text>
        ) : (
          <AlphabetList
            data={roles}
            onSelect={(v) => onListPress(v)}
            scroll
            sort={'name'}
          />
        )}
      </ScrollView>
      <Modal
        transparent={true}
        visible={visible}
        onDismiss={() => {
          setVisible(!visible);
        }}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          maxHeight: '80%',
        }}>
        <Text>
          {`Le gustaria agregar a ${users?.length ?? 0} persona${
            users && users.length > 1 ? 's' : ''
          }?`}
        </Text>
        <ScrollView>
          {users !== false ? (
            users.map((v, i) => {
              return (
                <List.Item
                  key={i.toString()}
                  title={v.name}
                  left={(props) => <List.Icon {...props} icon="account" />}
                />
              );
            })
          ) : (
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
          )}
        </ScrollView>
        <Button
          text={`Agregar usuario${users && users.length > 1 ? 's' : ''}`}
          onPress={() => {
            if (users === false) return;

            props.navigation.goBack();
            onAdd(users.map((v) => v.id));
          }}
        />
      </Modal>
    </>
  );
};
