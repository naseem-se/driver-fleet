import { useCallback } from 'react';

/**
 * Wraps the browser geolocation API in promises. getPosition() is used for
 * one-shot reads (journey start/end, fuel entry); watchPosition-based
 * continuous tracking lives in useJourneyTracking instead, since that one
 * needs to coordinate with the offline queue too.
 */
export function useGeolocation() {
  const getPosition = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported on this device.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0, ...options }
      );
    });
  }, []);

  return { getPosition };
}