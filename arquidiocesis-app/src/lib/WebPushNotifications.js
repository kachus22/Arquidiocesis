/* eslint-env browser */

import { ROOT_URL } from './apiV2/APIv2';
import AsyncStorage from '@react-native-async-storage/async-storage';
const VAPID_PUBLIC_KEY =
  'BA1OGYWa3Ke4ghc8ude3KEpCyaVrVGQ1wWCsUpz7OyNCYdWc7B22UgD33axkFehCHj-AFoGYBndrhwI-QjM10O8';

/**
 * @param {string} base64String
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const res = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    res[i] = rawData.charCodeAt(i);
  }
  return res;
}

/**
 * @returns {Promise<void>}
 */
async function subscribe() {
  if (navigator.serviceWorker == null) {
    console.info(
      'Service workers unsupported: unable to subscribe to web push notifications.'
    );
    return;
  }

  if (Notification.permission !== 'granted') {
    const res = await Notification.requestPermission();
    if (res !== 'granted') {
      console.info('User did not allow web push notifications.');
      return;
    }
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  const [login, userInfo] = await Promise.all([
    AsyncStorage.getItem('login'),
    AsyncStorage.getItem('user_info'),
  ]);
  const { token } = JSON.parse(login);
  const { id } = JSON.parse(userInfo);

  await fetch(`${ROOT_URL}web-notifications`, {
    method: 'POST',
    body: JSON.stringify({
      token,
      userID: id,
      subscription,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * @returns {Promise<void>}
 */
async function unsubscribe() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription == null) {
    return;
  }

  const [login, userInfo] = await Promise.all([
    AsyncStorage.getItem('login'),
    AsyncStorage.getItem('user_info'),
  ]);
  const { token } = JSON.parse(login);
  const { id } = JSON.parse(userInfo);

  const res = await fetch(
    `${ROOT_URL}/web-notifications?token=${token}&userID=${id}&endpoint=${subscription.endpoint}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (res.ok) {
    await subscription.unsubscribe();
  }
}

export default {
  subscribe,
  unsubscribe,
};
