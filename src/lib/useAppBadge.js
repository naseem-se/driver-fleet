import { useEffect } from 'react';

/**
 * Sets the PWA's home-screen icon badge to the pending sync count — visible
 * without opening the app, so a driver who queued actions offline and moved
 * on to something else still gets a visual reminder. Silently no-ops where
 * unsupported (most desktop browsers, older mobile Safari).
 */
export function useAppBadge(count) {
  useEffect(() => {
    if (!('setAppBadge' in navigator)) return;

    if (count > 0) {
      navigator.setAppBadge(count).catch(() => {});
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }, [count]);
}