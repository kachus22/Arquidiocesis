/* global __DEV__ */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ROOT_URL = __DEV__
  ? 'http://localhost:8000/api/'
  : 'https://arquidiocesis-bda.herokuapp.com/api/';

/**
 * @param {Object} data
 * @returns {Promise<string | null>}
 */
async function applyUserToken(data) {
  const user = await AsyncStorage.getItem('login');
  if (user != null) {
    const { token } = JSON.parse(user);
    return {
      ...data,
      token,
    };
  }
  return data;
}

/**
 * @param {string} url
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function get(url, params) {
  params = await applyUserToken(params);
  try {
    const res = await axios.get(url, { params });
    return res.data;
  } catch (err) {
    return {
      error: true,
      message: 'No hubo conexión con el servidor.',
    };
  }
}

/**
 * @param {string} url
 * @param {Object} body
 * @returns {Promise<Object>}
 */
export async function post(url, body) {
  body = await applyUserToken(body);
  try {
    const res = await axios.post(url, body);
    return res.data;
  } catch (err) {
    return {
      error: true,
      message: 'No hubo conexión con el servidor.',
    };
  }
}

/**
 * @param {string} url
 * @param {Object} body
 * @returns {Promise<Object>}
 */
export async function put(url, body) {
  body = await applyUserToken(body);
  console.log(body);
  try {
    const res = await axios.put(url, body);
    return res.data;
  } catch (err) {
    return {
      error: true,
      message: 'No hubo conexión con el servidor.',
    };
  }
}

/**
 * @param {string} url
 * @param {Object} body
 * @returns {Promise<Object>}
 */
export async function patch(url, body) {
  body = await applyUserToken(body);
  try {
    const res = await axios.patch(url, body);
    return res.data;
  } catch (err) {
    return {
      error: true,
      message: 'No hubo conexión con el servidor.',
    };
  }
}

/**
 * @param {string} url
 * @param {Object} body
 * @returns {Promise<Object>}
 */
export async function del(url, params) {
  params = await applyUserToken(params);
  try {
    const res = await axios.delete(url, { params });
    return res.data;
  } catch (err) {
    return {
      error: true,
      message: 'No hubo conexión con el servidor.',
    };
  }
}
