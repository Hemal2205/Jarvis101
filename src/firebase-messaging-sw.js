// [START initialize_firebase_in_sw]
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '<YOUR_FIREBASE_API_KEY>',
  authDomain: '<YOUR_FIREBASE_AUTH_DOMAIN>',
  projectId: '<YOUR_FIREBASE_PROJECT_ID>',
  messagingSenderId: '<YOUR_FIREBASE_MESSAGING_SENDER_ID>',
  appId: '<YOUR_FIREBASE_APP_ID>',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || 'JARVIS Notification';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
// [END initialize_firebase_in_sw] 