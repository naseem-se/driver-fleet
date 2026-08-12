import { useRegisterSW } from 'virtual:pwa-register/react';

export function useServiceWorkerUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check for an update every 60 minutes while the app is open — covers
      // long-running sessions (e.g. a driver's whole shift) where the app
      // was never closed and so never re-fetched the SW naturally.
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
  });

  function reload() {
    updateServiceWorker(true); // true = activate the new SW and reload immediately
  }

  function dismissOfflineReady() {
    setOfflineReady(false);
  }

  return { needRefresh, offlineReady, reload, dismissOfflineReady };
}