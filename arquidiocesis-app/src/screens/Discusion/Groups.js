import React, { useEffect, useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { View, TextInput, Text, ActivityIndicator } from 'react-native';
import { Button } from '../../components';
import { List } from 'react-native-paper';
import GroupsConvAPI from '../../lib/apiV2/GroupsConvAPI';
import useCurrentUser from '../../lib/apiV2/useCurrentUser';
import ChannelConvAPI from '../../lib/apiV2/ChannelConvAPI';

// Channels
/* const channelFac = factory((fake) => ({
  id: fake.random.uuid(),
  name: fake.random.word(),
}));

const groupFac = factory((fake) => ({
  id: fake.random.uuid(),
  title: fake.random.word(),
  channels: channelFac.make(fake.random.number(10)),
})); */

export default (props) => {
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState(false);
  const [regather, setRegather] = useState(true);
  const user = useCurrentUser();

  props.navigation.setOptions({ title: 'Grupos' });

  useEffect(() => {
    if (user == null || !regather) {
      return;
    }

    async function query() {
      const res = await GroupsConvAPI.allByUser(user.id);
      if (res.groups)
        setGroups(
          await Promise.all(
            res.groups
              .filter((group) => group.group_name !== undefined)
              .map(async (group) => {
                const res2 = await ChannelConvAPI.allByGroup(
                  group.group_channels
                );
                return {
                  id: group.id,
                  title: group.group_name,
                  channels: (res2?.channels ?? []).map((channel) => ({
                    id: channel.id,
                    name: channel.canal_name,
                  })),
                  description: group.group_description,
                  icon: group.group_icon,
                };
              })
          )
        );

      setRegather(false);
    }
    query();
  }, [user, regather]);

  return (
    <View
      style={{
        height: '100%',
        overflowY: 'auto',
      }}>
      <View
        style={{
          height: '72px',
          backgroundColor: '#002e60',
          paddingTop: '16px',
          paddingBottom: '16px',
          paddingLeft: '18px',
          paddingRight: '18px',
        }}>
        <View
          style={{
            backgroundColor: '#124a7a',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'row',
            height: '40px',
          }}>
          <FontAwesome5
            name={'search'}
            size={16}
            color={'white'}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: '16px',
              marginRight: '16px',
            }}
            solid
          />
          <TextInput
            style={{
              flex: 1,
              fontSize: '16px',
              color: 'white',
            }}
            placeholder="Buscar"
            placeholderTextColor="#cbcbcb"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </View>
      </View>

      <View>
        <Button
          style={{ width: 250, alignSelf: 'center' }}
          text="Nuevo grupo"
          onPress={() =>
            props.navigation.navigate('CrearGrupo', {
              // newGroup : {title: string, channels: [{name: string}]}
              onSubmit: (newGroup) => {
                console.log(newGroup);
                GroupsConvAPI.add({
                  name: newGroup.title,
                  channels: [],
                  roles: [],
                  icon: newGroup.icon,
                })
                  .then((v) => {
                    if (v.error) throw v.message;
                    else return v.data;
                  })
                  .then((idGroup) => {
                    return GroupsConvAPI.setAdmin(idGroup, [user.id]);
                  })
                  .then(() => {
                    //setGroups([...groups, { ...newGroup, id: v }]);
                    setRegather(true);
                  })
                  .catch((v) => console.error(v));
              },
            })
          }
        />
      </View>

      <View
        style={{
          backgroundColor: 'white',
        }}>
        <List.Section title={props.title}>
          {groups === false ? (
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
            groups
              .filter((v) => v.title.includes(search))
              .map((v, i) => (
                <List.Accordion
                  title={v.title}
                  key={i.toString()}
                  theme={{
                    colors: {
                      primary: 'black',
                    },
                  }}
                  style={{
                    borderBottomColor: '#ddd',
                    borderBottomWidth: '1px',
                  }}
                  left={(iP) => (
                    <List.Icon
                      {...iP}
                      icon={
                        v.icon && v.icon !== ''
                          ? v.icon
                          : 'account-supervisor-circle'
                      }
                    />
                  )}
                  onLongPress={() =>
                    props.navigation.navigate('CrearGrupo', {
                      editGroup: v,
                      onSubmit: async (renewed) => {
                        await GroupsConvAPI.edit({
                          id: v.id,
                          name: renewed.title,
                          description: renewed.description,
                        });
                        setRegather(true);
                        /* const newGroups = [...groups];
                      newGroups.splice(i, 1, renewed);
                      setGroups(newGroups); */
                      },
                      onDelete: async (id) => {
                        const success = !(await GroupsConvAPI.deleteGroup([id]))
                          .error;
                        if (success) setRegather(true);
                        return success;
                      },
                      onRefresh: () => {
                        setRegather(true);
                      },
                    })
                  }>
                  {v.channels.map((chV, chI) => (
                    <List.Item
                      title={`#${chV.name.toLowerCase()}`}
                      key={chI.toString()}
                      style={{
                        backgroundColor: chI % 2 ? 'white' : '#f8f8f8',
                      }}
                      onPress={() => {
                        props.navigation.navigate('ChatChannelPosts', {
                          channelName: `#${chV.name.toLowerCase()}`,
                          channelID: chV.id,
                        });
                      }}
                      theme={{
                        colors: {
                          text: '#567998',
                        },
                      }}
                    />
                  ))}
                </List.Accordion>
              ))
          )}
        </List.Section>
      </View>
    </View>
  );
};
