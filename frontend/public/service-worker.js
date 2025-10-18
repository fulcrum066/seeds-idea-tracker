self.addEventListener('install', event => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
  return self.clients.claim();
});

self.addEventListener('notificationclick', event => {
  const action = event.action;
  console.log('Notification click received:', action);

  if (action === 'open_app') {
    event.waitUntil(
      clients.openWindow('http://localhost:3000') // change this if needed
    );
  } else {
    event.notification.close();
  }
});
