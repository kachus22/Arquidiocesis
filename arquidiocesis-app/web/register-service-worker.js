/* eslint-env browser */

if (navigator.serviceWorker != null) {
  window.addEventListener('load', async () => {
    // register expo service worker
    await navigator.serviceWorker.register(
      'SW_PUBLIC_URL/expo-service-worker.js',
      { scope: 'SW_PUBLIC_SCOPE' }
    );
  });
} else {
  console.info('Service workers are not supported in this browser.');
}
