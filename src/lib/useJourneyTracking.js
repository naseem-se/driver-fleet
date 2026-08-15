import { useEffect, useRef } from 'react';
import { apiClient } from './apiClient';
import { enqueueAction } from './offlineQueue';

const PING_INTERVAL_MS = 20 * 1000; // 20 seconds — was 5 minutes, far too sparse for real-time map tracking

export function useJourneyTracking(journey) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!journey) return;

    async function sendPing() {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const fields = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed_kmh: pos.coords.speed ? Math.max(0, pos.coords.speed * 3.6) : undefined,
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
              // Journey itself hasn't synced yet — queue the ping tied to
              // the local ID, resolved automatically once START_JOURNEY lands.
              await enqueueAction({
                type: 'PING',
                endpointTemplate: '/journeys/{journeyId}/ping',
                journeyRef: journey.id,
                fields,
              });
            } else {
              // Real journey ID already known, just currently offline.
              await enqueueAction({ type: 'PING', endpoint: `/journeys/${journey.id}/ping`, fields });
            }
          } catch {
            // Silent — a missed ping isn't critical, the next one (or a
            // queue flush) picks tracking back up.
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
      );
    }

    sendPing();
    intervalRef.current = setInterval(sendPing, PING_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [journey?.id, journey?.isLocal]);
}