import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Button } from '../../components';
import { List, Modal } from 'react-native-paper';
import ChannelConvAPI from '../../lib/apiV2/ChannelConvAPI';

export default (props) => {
  const { idGroup, initialChannels, onChannelsChanged } = props.route.params;

  const [actualChannels, setActualChannels] = useState(initialChannels);
  const [channelToDelete, setChannelToDelete] = useState(null);

  return (
    <>
      <Text style={styles.header}>Canales</Text>
      <Button
        style={{ width: 250, alignSelf: 'center' }}
        text="Crear canal"
        onPress={() => {
          props.navigation.navigate('CrearCanales', {
            onAdd: async (newChannel) => {
              const result = await ChannelConvAPI.add({
                idGroup,
                name: newChannel.name,
                description: '',
              });
              if (!result || result.error) return;

              const newChannels = [...actualChannels];
              newChannels.push({
                ...newChannel,
                id: result.data,
              });
              setActualChannels(newChannels);
              onChannelsChanged(newChannels);
            },
          });
        }}
      />
      <List.Section>
        {actualChannels.map((v, i) => (
          <List.Item
            onPress={() => {
              setChannelToDelete(v);
            }}
            title={`${v.name}`}
            key={i.toString()}
            style={{
              backgroundColor: i % 2 ? 'white' : '#f8f8f8',
            }}
            theme={{
              colors: {
                text: '#567998',
              },
            }}
          />
        ))}
      </List.Section>

      <Modal
        transparent={true}
        visible={channelToDelete !== null}
        onDismiss={() => {
          setChannelToDelete(null);
        }}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          maxHeight: '80%',
        }}>
        <Text>{`Desea eliminar el canal ${channelToDelete?.name ?? ''}?`}</Text>
        <Button
          text={'Eliminar canal'}
          onPress={async () => {
            if (channelToDelete === null) return;

            if (await ChannelConvAPI.deleteChannels([channelToDelete.id])) {
              const newChannels = [...actualChannels];
              const idx = newChannels.findIndex(
                (v) => v.id === channelToDelete.id
              );
              newChannels.splice(idx, 1);
              setActualChannels(newChannels);
              onChannelsChanged(newChannels);
              setChannelToDelete(null);
            }
          }}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
});
