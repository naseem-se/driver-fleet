import { useEffect, useRef, useState, useCallback } from 'react';
import { flushQueue, listPendingActions } from './offlineQueue';
import { useOnlineStatus } from './useOnlineStatus';
import { useAppBadge } from './useAppBadge';

export function useQueueSync() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const syncingRef = useRef(false);

  useAppBadge(pendingCount);

  const refreshCount = useCallback(async () => {
    const items = await listPendingActions();
    setPendingCount(items.length);
  }, []);

  const sync = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setIsSyncing(true);
    try {
      const result = await flushQueue();
      setLastResult(result);
      if (result.poisoned > 0) {
        // Best-effort visibility — a dropped action means a journey/fuel
        // entry never made it to the server. Surfacing this beats silent
        // data loss, even though there's no retry possible for these.
        console.warn(`${result.poisoned} action(s) failed permanently and were dropped.`);
      }
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
      refreshCount();
    }
  }, [refreshCount]);

  useEffect(() => { refreshCount(); }, [refreshCount]);

  useEffect(() => {
    if (isOnline) sync();
  }, [isOnline, sync]);

  useEffect(() => {
    const interval = setInterval(() => { if (navigator.onLine) sync(); }, 15_000);
    return () => clearInterval(interval);
  }, [sync]);

  return { isOnline, pendingCount, isSyncing, sync, refreshCount, lastResult };
}