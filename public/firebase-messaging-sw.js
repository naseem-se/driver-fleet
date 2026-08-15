importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAH2vSeJrxKfwoTkSco16Fw2QqDeUf--VM',
  authDomain: 'fleet-management-559f4.firebaseapp.com',
  projectId: 'fleet-management-559f4',
  messagingSenderId: '675813930902',
  appId: '1:675813930902:web:155d5a2d3c89c167d60fb7',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icons/icon-192.png',
  });
});