import { useEffect, useRef, useState } from 'react';

/**
 * Requests a screen wake lock while `active` is true, so the phone doesn't
 * sleep during a journey — keeping the app foregrounded, which is what
 * keeps GPS pings and timers running reliably (see the background-tracking
 * limitation discussed earlier: foregrounded + screen-on isn't throttled).
 *
 * Not supported on every browser (notably older iOS Safari) — isSupported
 * lets the UI show a fallback hint rather than fail silently.
 */
export function useWakeLock(active) {
  const wakeLockRef = useRef(null);
  const [isLocked, setIsLocked] = useState(false);
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  useEffect(() => {
    if (!active || !isSupported) return;

    let cancelled = false;

    async function requestLock() {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          lock.release();
          return;
        }
        wakeLockRef.current = lock;
        setIsLocked(true);

        lock.addEventListener('release', () => setIsLocked(false));
      } catch {
        // Permission denied, battery saver on, or unsupported in this
        // context — fail quietly, the journey still works without it.
        setIsLocked(false);
      }
    }

    requestLock();

    // The lock is auto-released by the OS whenever the tab is backgrounded
    // (screen off, app switched away, etc.) and NOT automatically
    // reacquired — re-request it the moment the tab becomes visible again,
    // e.g. the driver glances away and comes back.
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && active) {
        requestLock();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
      setIsLocked(false);
    };
  }, [active, isSupported]);

  return { isLocked, isSupported };
}