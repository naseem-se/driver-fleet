import { useCallback } from 'react';

const ACCEPTABLE_ACCURACY_METERS = 30; // stop early once we get a fix this good
const MAX_WAIT_MS = 12000;             // otherwise, settle for the best fix within this window

export function useGeolocation() {
  const getPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported on this device.'));
        return;
      }

      let best = null;
      let watchId = null;
      let settled = false;

      const finish = (result, error) => {
        if (settled) return;
        settled = true;
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        clearTimeout(timeoutId);
        if (error) reject(error);
        else resolve(result);
      };

      const timeoutId = setTimeout(() => {
        if (best) {
          finish({ lat: best.coords.latitude, lng: best.coords.longitude, accuracy: best.coords.accuracy });
        } else {
          finish(null, new Error('Could not get an accurate location. Please make sure GPS/location is enabled and try again outdoors or near a window.'));
        }
      }, MAX_WAIT_MS);

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (!best || pos.coords.accuracy < best.coords.accuracy) {
            best = pos;
          }
          if (pos.coords.accuracy <= ACCEPTABLE_ACCURACY_METERS) {
            finish({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
          }
        },
        (err) => {
          // A transient error mid-watch shouldn't kill the whole attempt if
          // we already have some fix — only reject outright if we have nothing.
          if (!best) finish(null, err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: MAX_WAIT_MS }
      );
    });
  }, []);

  return { getPosition };
}