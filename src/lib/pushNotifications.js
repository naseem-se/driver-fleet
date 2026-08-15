import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { apiClient } from './apiClient';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export async function registerPushNotifications() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });

  if (token) {
    await apiClient.post('/device-tokens', { token, platform: 'web' });
  }

  onMessage(messaging, (payload) => {
    import('react-hot-toast').then(({ default: toast }) => {
      toast(payload.notification?.body ?? 'New notification', { icon: '🔔' });
    });
  });
}