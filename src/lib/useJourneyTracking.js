import { useEffect, useRef } from 'react';
import { apiClient } from './apiClient';
import { enqueueAction } from './offlineQueue';

const PING_INTERVAL_MS = 20 * 1000;   // how often we attempt a ping
const ACCEPTABLE_ACCURACY_METERS = 30; // stop waiting early once a fix this good arrives
const MAX_WAIT_PER_PING_MS = 8000;     // don't let one ping cycle block the next indefinitely

function getBestPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    let best = null;
    let watchId = null;
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      clearTimeout(timeoutId);
      resolve(result);
    };

    const timeoutId = setTimeout(() => {
      finish(best ? { lat: best.coords.latitude, lng: best.coords.longitude, accuracy: best.coords.accuracy, speedKmh: best.coords.speed ? Math.max(0, best.coords.speed * 3.6) : null } : null);
    }, MAX_WAIT_PER_PING_MS);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!best || pos.coords.accuracy < best.coords.accuracy) {
          best = pos;
        }
        if (pos.coords.accuracy <= ACCEPTABLE_ACCURACY_METERS) {
          finish({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speedKmh: pos.coords.speed ? Math.max(0, pos.coords.speed * 3.6) : null,
          });
        }
      },
      () => { if (!best) finish(null); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: MAX_WAIT_PER_PING_MS } // maximumAge: 0 — NEVER reuse a cached/stale fix
    );
  });
}

export function useJourneyTracking(journey) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!journey) return;

    async function sendPing() {
      const position = await getBestPosition();
      if (!position) return; // couldn't get any fix this cycle — skip, try again next interval rather than send a guess

      const fields = {
        lat: position.lat,
        lng: position.lng,
        accuracy: position.accuracy,
        speed_kmh: position.speedKmh ?? undefined,
        recorded_at: new Date().toISOString(),
      };

      try {
        if (navigator.onLine && !journey.isLocal) {
          const form = new FormData();
          Object.entries(fields).forEach(([k, v]) => v !== undefined && form.append(k, v));
          await apiClient.post(`/journeys/${journey.id}/ping`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else if (journey.isLocal) {
          await enqueueAction({
            type: 'PING',
            endpointTemplate: '/journeys/{journeyId}/ping',
            journeyRef: journey.id,
            fields,
          });
        } else {
          await enqueueAction({ type: 'PING', endpoint: `/journeys/${journey.id}/ping`, fields });
        }
      } catch {
        // Silent — a missed ping isn't critical, the next one picks tracking back up.
      }
    }

    sendPing();
    intervalRef.current = setInterval(sendPing, PING_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [journey?.id, journey?.isLocal]);
}