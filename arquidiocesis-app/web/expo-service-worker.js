/* eslint-env serviceworker */

self.addEventListener('push', (event) => {
  const { title, body, data } = event.data.json();
  console.log(event.data.json());
  event.waitUntil(
    self.registration.showNotification(title, { body, icon: 'icon.png', data })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      if (
        event.notification.data != null &&
        event.notification.data.path != null
      ) {
        await self.clients.openWindow(event.notification.data.path);
      }
    })()
  );
});
