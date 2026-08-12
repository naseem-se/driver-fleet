import { useQuery } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import { getLocalJourney, clearLocalJourney } from './localJourney';
import { getJourneyMapping } from './offlineQueue';
import { useOnlineStatus } from './useOnlineStatus';

export function useCurrentJourney() {
  const isOnline = useOnlineStatus();

  return useQuery({
    queryKey: ['current-journey', isOnline],
    queryFn: async () => {
      const local = getLocalJourney();

      if (local) {
        const realId = await getJourneyMapping(local.localId);

        if (realId && isOnline) {
          try {
            const res = await apiClient.get(`/journeys/${realId}`);
            clearLocalJourney(); // server copy is now the source of truth
            return { ...res.data.data, isLocal: false };
          } catch {
            // Real ID exists but we couldn't fetch it (network blip) —
            // fall through and keep showing the local shadow copy.
          }
        }

        return { id: local.localId, isLocal: true, vehicle: local.vehicle, start: local.start };
      }

      if (!isOnline) return null;

      const res = await apiClient.get('/journeys/current');
      return res.data.data ? { ...res.data.data, isLocal: false } : null;
    },
    refetchInterval: 15000,
  });
}