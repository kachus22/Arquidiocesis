/* 
Nombre: Login.js
Usuario con acceso: Admin, acompañante, coordinador
Descripción: Pantalla para que un usuario registrado pueda iniciar sesión
*/
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Input, Button } from '../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API, Util } from '../lib';
import { Image } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

export default (props) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { openReg } = props;

  useEffect(() => {
    setLoading(false);
  }, []);
  console.log('asd');

  const doLogin = () => {
    const { valid, prompt } = Util.validateForm(
      { email, password },
      {
        email: {
          type: 'email',
          prompt: 'Favor de introducir un correo electrónico válido.',
        },
        password: {
          type: 'empty',
          prompt: 'Favor de introducir la contraseña.',
        },
      }
    );
    if (!valid) return alert(prompt);

    setLoading(true);
    API.login(email, password)
      .then((user) => {
        setLoading(false);
        if (!user) return alert('Correo o contraseña invalida.');
        if (props.onLogin) props.onLogin(user);
      })
      .catch(() => {
        setLoading(false);
        alert('Hubo un error realizando el login.');
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <KeyboardAwareScrollView>
        <View
          style={{
            backgroundColor: 'white',
            height: '30%',
            width: '100%',
            paddingTop: 20,
            paddingBottom: 60,
          }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Image source={require('../../assets/logo.jpeg')} />
          </View>
        </View>
        {props.user === false ? (
          <View
            style={[
              styles.loginContainer,
              { alignItems: 'center', justifyContent: 'center' },
            ]}>
            <ActivityIndicator size="large" color="black" />
          </View>
        ) : (
          <View style={styles.loginContainer} bounces={false}>
            <Text style={styles.header}>Iniciar Sesión</Text>
            <Input
              name="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboard={'email-address'}
            />
            <Input
              name="Contraseña"
              style={{ marginTop: 10 }}
              value={password}
              onChangeText={setPassword}
              textContentType={'password'}
              password
            />

            <PaperButton onPress={() => openReg()}>
              {'¿No tienes cuenta? Registrate'}
            </PaperButton>

            <Button text="Iniciar Sesión" loading={loading} onPress={doLogin} />
          </View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  testText: {
    fontSize: 20,
  },
  container: {
    width: '100%',
    flex: 1,
  },
  loginContainer: {
    width: '100%',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
});
