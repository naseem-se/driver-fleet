import { useEffect, useState, useCallback } from 'react';

const DISMISSED_KEY = 'fleet_driver_install_dismissed_at';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // don't re-nag for a week after dismissal

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );

  useEffect(() => {
    function handleBeforeInstallPrompt(e) {
      e.preventDefault(); // stop the browser's own mini-infobar so we control timing
      setDeferredPrompt(e);

      const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) ?? 0);
      const cooledDown = Date.now() - dismissedAt > DISMISS_COOLDOWN_MS;
      setIsInstallable(cooledDown);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return null;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
    return outcome; // 'accepted' | 'dismissed'
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setIsInstallable(false);
  }, []);

  return { isInstallable, isInstalled, promptInstall, dismiss };
}