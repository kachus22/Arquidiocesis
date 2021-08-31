/* 
Nombre: Arquidiócesis.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Archivo que gestiona el tab navigation bar y el stack de pantallas de la aplicación
*/
import { FontAwesome5 } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState, useRef } from 'react';
import { MenuProvider as PopupMenuProvider } from 'react-native-popup-menu';
import {
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { API } from './lib';
import {
  getTabBarIconName,
  getTabScreens,
  PARROQUIAS_TAB_NAME,
} from './navigation/MainTabNavigator';
import {
  AdminUsers,
  AsistenciaCapacitacion,
  AsistenciaGrupo,
  ChangeCoordinador,
  ChangeEncargado,
  ChangePassword,
  Decanato,
  DetalleAcompanante,
  DetalleAdmin,
  DetalleCapacitacion,
  DetalleCapilla,
  DetalleCoordinador,
  DetalleEncargado,
  DetalleMiembro,
  DetalleParticipante,
  EditAcompanante,
  EditAdmin,
  EditarCapacitacion,
  EditarCapilla,
  EditarParticipante,
  EditCoordinador,
  EditEvento,
  EditGrupo,
  EditMiembro,
  EditParroquia,
  EstatusMiembro,
  Evento,
  FichaMedica,
  Grupo,
  GrupoBajasTemporales,
  Login,
  Objetivos,
  ObjetivosDecanato,
  ObjetivosDelAño,
  Parroquia,
  RegistroAcompanante,
  RegistroAdmin,
  RegistroCapacitacion,
  RegistroCapilla,
  RegistroCoordinador,
  RegistroEvento,
  RegistroGrupo,
  RegistroMiembro,
  RegistroParroquia,
  RegistroParticipante,
  Reports,
  Select,
  SelectCapacitacion,
  SelectGroup,
  Statistics,
  User,
  Zona,
  ChatChannelPosts,
} from './screens';
import { useDeepLinking } from './navigation/DeepLinking';

import Groups from './screens/Discusion/Groups';
import CrearGrupo from './screens/Discusion/CrearGrupo';
import CanalesGrupo from './screens/Discusion/CanalesGrupo';
import CrearCanales from './screens/Discusion/CrearCanales';
import UserOnGroup from './screens/Discusion/UserOnGroup';
import AdduserFromRole from './screens/Discusion/AdduserFromRole';
import AddUserIndividual from './screens/Discusion/AddUserIndividual';
import ChatChannelCreatePost from './screens/chat/ChatChannelCreatePost';
import ChatChannelPostDetails from './screens/chat/ChatChannelPostDetails';
import { ChannelPostsStoreProvider } from './context/ChannelPostsStore';
import WebPushNotifications from './lib/WebPushNotifications';
import ImageViewer from './screens/ImageViewer';
import VideoViewer from './screens/VideoViewer';
import ChatMoreAttachments from './screens/chat/ChatMoreAttachments';
import UserRegister from './screens/UserReg/UserRegister';

const Tab = createBottomTabNavigator();
function Home({ navigation, route }) {
  const [user, setUser] = useState(false);

  const gotoUser = () => {
    navigation.navigate('User', {
      logout: route.params.logout,
    });
  };

  navigation.setOptions({
    headerLeft: () => (
      <TouchableOpacity onPress={gotoUser}>
        <View
          style={{
            marginLeft: 16,
          }}>
          <FontAwesome5 name="user-circle" solid size={25} color={'white'} />
        </View>
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity onPress={() => navigation.navigate('Grupos')}>
        <View
          style={{
            marginRight: 16,
          }}>
          <FontAwesome5 name="comment-dots" solid size={26} color="white" />
        </View>
      </TouchableOpacity>
    ),
    headerTitle: 'Arquidiocesis',
  });

  useEffect(() => {
    API.getUser().then(setUser);
  }, []);

  const tabScreens = getTabScreens(user.type);
  return (
    <Tab.Navigator
      initialRouteName={PARROQUIAS_TAB_NAME}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          return (
            <FontAwesome5
              name={getTabBarIconName(route.name)}
              size={size}
              color={color}
              style={{ paddingTop: 5 }}
              solid
            />
          );
        },
      })}
      tabBarOptions={{
        activeTintColor: '#002E60',
        inactiveTintColor: 'gray',
        labelPosition: 'below-icon',
      }}>
      {Object.keys(tabScreens).length > 0 ? (
        Object.keys(tabScreens).map((screenName) => (
          <Tab.Screen
            key={screenName}
            name={screenName}
            component={tabScreens[screenName]}
          />
        ))
      ) : (
        <Tab.Screen name="Error" component={User} />
      )}
    </Tab.Navigator>
  );
}

// The app's main stack.
const Stack = createStackNavigator();
function App({ user, logout }) {
  const navigationRef = useRef(null);
  useDeepLinking(navigationRef);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        user={user}
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#002E60' },
          headerTintColor: 'white',
          gestureEnabled: Platform.select({
            web: false,
            android: true,
            ios: true,
          }),
        }}>
        <Stack.Screen
          name="Home"
          component={Home}
          initialParams={{ logout: logout }}
        />
        <Stack.Screen name="RegistroAdmin" component={RegistroAdmin} />
        <Stack.Screen
          name="RegistroCoordinador"
          component={RegistroCoordinador}
        />
        <Stack.Screen name="AsistenciaGrupo" component={AsistenciaGrupo} />
        <Stack.Screen name="Decanato" component={Decanato} />
        <Stack.Screen name="Zona" component={Zona} />
        <Stack.Screen name="RegistroParroquia" component={RegistroParroquia} />
        <Stack.Screen name="RegistroMiembro" component={RegistroMiembro} />
        <Stack.Screen name="RegistroCapilla" component={RegistroCapilla} />
        <Stack.Screen name="RegistroGrupo" component={RegistroGrupo} />
        <Stack.Screen name="Parroquia" component={Parroquia} />
        <Stack.Screen name="EditMiembro" component={EditMiembro} />
        <Stack.Screen name="Grupo" component={Grupo} />
        <Stack.Screen name="FichaMedica" component={FichaMedica} />
        <Stack.Screen name="DetalleCapilla" component={DetalleCapilla} />
        <Stack.Screen name="DetalleMiembro" component={DetalleMiembro} />
        <Stack.Screen name="User" component={User} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="AdminUsers" component={AdminUsers} />
        <Stack.Screen name="DetalleAdmin" component={DetalleAdmin} />
        <Stack.Screen name="EditAdmin" component={EditAdmin} />
        <Stack.Screen name="EditGrupo" component={EditGrupo} />
        <Stack.Screen name="ChangeCoordinador" component={ChangeCoordinador} />
        <Stack.Screen
          name="DetalleCoordinador"
          component={DetalleCoordinador}
        />
        <Stack.Screen name="DetalleEncargado" component={DetalleEncargado} />
        <Stack.Screen
          name="RegistroCapacitacion"
          component={RegistroCapacitacion}
        />
        <Stack.Screen name="EstatusMiembro" component={EstatusMiembro} />
        <Stack.Screen
          name="GrupoBajasTemporales"
          component={GrupoBajasTemporales}
        />
        <Stack.Screen
          name="RegistroParticipante"
          component={RegistroParticipante}
        />
        <Stack.Screen
          name="DetalleCapacitacion"
          component={DetalleCapacitacion}
        />
        <Stack.Screen name="EditParroquia" component={EditParroquia} />
        <Stack.Screen
          name="RegistroAcompanante"
          component={RegistroAcompanante}
        />
        <Stack.Screen
          name="DetalleAcompanante"
          component={DetalleAcompanante}
        />
        <Stack.Screen name="EditAcompanante" component={EditAcompanante} />
        <Stack.Screen name="EditCoordinador" component={EditCoordinador} />
        <Stack.Screen
          name="EditarCapacitacion"
          component={EditarCapacitacion}
        />
        <Stack.Screen
          name="DetalleParticipante"
          component={DetalleParticipante}
        />
        <Stack.Screen
          name="EditarParticipante"
          component={EditarParticipante}
        />
        <Stack.Screen name="ChangeEncargado" component={ChangeEncargado} />
        <Stack.Screen
          name="AsistenciaCapacitacion"
          component={AsistenciaCapacitacion}
        />
        <Stack.Screen name="EditarCapilla" component={EditarCapilla} />
        <Stack.Screen name="Reports" component={Reports} />
        <Stack.Screen name="SelectGroup" component={SelectGroup} />
        <Stack.Screen
          name="SelectCapacitacion"
          component={SelectCapacitacion}
        />
        <Stack.Screen name="Select" component={Select} />
        <Stack.Screen name="Statistics" component={Statistics} />
        <Stack.Screen name="RegistroEvento" component={RegistroEvento} />
        <Stack.Screen name="Evento" component={Evento} />
        <Stack.Screen name="EditEvento" component={EditEvento} />
        <Stack.Screen name="Objetivos" component={Objetivos} />
        <Stack.Screen name="ObjetivosDelAño" component={ObjetivosDelAño} />
        <Stack.Screen name="ObjetivosDecanato" component={ObjetivosDecanato} />

        <Stack.Screen name="CrearGrupo" component={CrearGrupo} />
        <Stack.Screen name="CanalesGrupo" component={CanalesGrupo} />
        <Stack.Screen name="CrearCanales" component={CrearCanales} />
        <Stack.Screen name="Grupos" component={Groups} />
        <Stack.Screen name="UserOnGroup" component={UserOnGroup} />
        <Stack.Screen name="AdduserFromRole" component={AdduserFromRole} />
        <Stack.Screen name="AddUserIndividual" component={AddUserIndividual} />
        <Stack.Screen name="ChatChannelPosts" component={ChatChannelPosts} />
        <Stack.Screen
          name="ChatChannelCreatePost"
          component={ChatChannelCreatePost}
        />
        <Stack.Screen
          name="ChatChannelPostDetails"
          component={ChatChannelPostDetails}
        />
        <Stack.Screen name="ImageViewer" component={ImageViewer} />
        <Stack.Screen name="VideoViewer" component={VideoViewer} />
        <Stack.Screen
          name="ChatMoreAttachments"
          component={ChatMoreAttachments}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function Main() {
  const [login, setLogin] = useState(false);
  const [isRegOpened, setisRegOpened] = useState(false);

  // This function runs when the screen is shown.
  useEffect(() => {
    // Set the logout function that will be run when
    // the user logs out.
    API.setOnLogout(() => {
      setLogin(null);
    });
    checkLogin();
  }, []);

  // Check to see if the user is logged in.
  const checkLogin = () => {
    API.getLogin().then((user) => {
      if (!user) return setLogin(null);
      setLogin(user);
    });
  };

  const onLogin = async (user) => {
    setLogin(user);
    await WebPushNotifications.subscribe();
  };

  const logout = () => {
    API.logout().then(() => {
      setLogin(null);
    });
  };

  return (
    <PopupMenuProvider>
      <ChannelPostsStoreProvider>
        <View style={StyleSheet.absoluteFillObject}>
          <StatusBar barStyle={'light-content'} />
          {isRegOpened ? (
            <UserRegister onClose={() => setisRegOpened(false)} />
          ) : !login ? (
            <Login
              user={login}
              onLogin={onLogin}
              openReg={() => setisRegOpened(true)}
            />
          ) : (
            // User is logged in
            <App user={login} logout={logout} />
          )}
        </View>
      </ChannelPostsStoreProvider>
    </PopupMenuProvider>
  );
}

export default React.memo(Main);
