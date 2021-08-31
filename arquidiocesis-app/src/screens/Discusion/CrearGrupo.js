/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Button, Input, Item } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ChannelConvAPI from '../../lib/apiV2/ChannelConvAPI';
import { List, Modal } from 'react-native-paper';
import { View, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import Icons from '../../lib/Icons.json';

/**
 * props: {editGroup: {id: string, title: string, channels: {name: string}}}
 */
export default (props) => {
  const { editGroup, onSubmit, onDelete, onRefresh } = props.route.params;
  const [name, setName] = useState(editGroup ? editGroup.title : '');
  const [desc, setDesc] = useState(editGroup ? editGroup.description : '');
  const [channels, setChannels] = useState(editGroup ? editGroup.channels : []);
  const [roles, setRoles] = useState(editGroup ? editGroup.roles : []);
  const [iconSelectVisible, setIconSelectVisible] = useState(false);
  const [icon, setIcon] = useState(
    editGroup ? editGroup.icon : '' ?? 'account-cancel'
  );
  const [removeVisible, setRemoveVisible] = useState(false);
  const isEdit = editGroup !== undefined;

  props.navigation.setOptions({
    title: isEdit ? 'Editar grupo' : 'Crear grupo',
  });

  const onIconItemPress = (newIcon) => {
    setIcon(newIcon);
    setIconSelectVisible(false);
  };

  return (
    <>
      <KeyboardAwareScrollView style={styles.loginContainer} bounces={false}>
        <Text style={styles.header}>
          {isEdit ? 'Editar grupo' : 'Crear grupo'}
        </Text>
        <Input
          noTextOver
          placeholder="Nombre del grupo"
          required
          value={name}
          onChangeText={(v) => {
            setName(v);
          }}
        />
        {isEdit ? (
          <Input
            noTextOver
            placeholder="Descripcion del grupo"
            required
            value={desc}
            onChangeText={(v) => {
              setDesc(v);
            }}
            extraProps={{
              multiline: true,
              numberOfLines: 3,
            }}
            height={90}
          />
        ) : null}
        {!isEdit ? (
          <Item
            text="Cambiar icono"
            leftIcon={icon}
            onPress={() => {
              setIconSelectVisible(true);
            }}
          />
        ) : null}
        {isEdit ? (
          <>
            <Item
              text="Ver canales"
              onPress={() => {
                props.navigation.navigate('CanalesGrupo', {
                  idGroup: editGroup.id,
                  initialChannels: channels,
                  onChannelsChanged: (newChannels) => {
                    setChannels(newChannels);
                    onRefresh();
                  },
                });
              }}
            />
            <Item
              text="Ver usuarios"
              onPress={() => {
                props.navigation.navigate('UserOnGroup', {
                  roles,
                  idGroup: editGroup.id,
                  onSubmit: (newRoles) => {
                    setRoles(newRoles);
                  },
                });
              }}
            />
          </>
        ) : null}
        {isEdit ? (
          <Button
            text="Eliminar"
            onPress={() => {
              setRemoveVisible(true);
            }}
          />
        ) : null}
        <Button
          text={isEdit ? 'Aceptar' : 'Registrar'}
          onPress={() => {
            onSubmit({
              title: name,
              description: desc,
              icon: icon,
            });

            props.navigation.goBack();
          }}
        />
      </KeyboardAwareScrollView>

      <Modal
        transparent={true}
        visible={removeVisible}
        onDismiss={() => {
          setRemoveVisible(!removeVisible);
        }}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          maxHeight: '80%',
        }}>
        <Text>{`Desea eliminar el grupo ${editGroup?.title ?? ''}?`}</Text>
        <Button
          text={'Eliminar grupo'}
          onPress={async () => {
            if (editGroup === false) return;

            const success = await onDelete(editGroup.id);
            if (success) props.navigation.goBack();
          }}
        />
      </Modal>

      <Modal
        transparent={true}
        visible={iconSelectVisible}
        onDismiss={() => {
          setIconSelectVisible(!iconSelectVisible);
        }}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          maxHeight: '80%',
        }}>
        <Text>{'Seleccione un icono'}</Text>
        <ScrollView>
          {Icons.map((v, i) => (
            <Item
              key={i.toString()}
              leftIcon={v}
              onPress={() => onIconItemPress(v)}
            />
          ))}
        </ScrollView>
        <Button
          text={'Cancelar'}
          onPress={() => {
            setIconSelectVisible(false);
          }}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    height: '70%',
    width: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  commentHeight: {
    height: 80,
  },
});
