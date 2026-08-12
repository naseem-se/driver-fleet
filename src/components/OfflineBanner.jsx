import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useQueueSync } from '../lib/useQueueSync';

export function OfflineBanner() {
  const { isOnline, pendingCount, isSyncing, sync, lastResult } = useQueueSync();

  const justPoisoned = lastResult?.poisoned > 0;

  if (isOnline && pendingCount === 0 && !justPoisoned) return null;

  if (justPoisoned) {
    return (
      <div className="flex items-center gap-2 bg-red-600 px-4 py-2 text-sm font-medium text-white animate-fadeIn">
        <AlertTriangle size={16} />
        {lastResult.poisoned} action{lastResult.poisoned === 1 ? '' : 's'} could not be saved and were discarded.
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium text-white animate-fadeIn ${
        isOnline ? 'bg-amber-500' : 'bg-gray-800'
      }`}
    >
      <span className="flex items-center gap-2">
        {!isOnline && <WifiOff size={16} />}
        {!isOnline
          ? 'Offline — actions will sync when you reconnect'
          : `${pendingCount} action${pendingCount === 1 ? '' : 's'} pending — some may be waiting to retry`}
      </span>
      {isOnline && pendingCount > 0 && (
        <button onClick={sync} disabled={isSyncing} className="flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-xs">
          <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} /> Retry
        </button>
      )}
    </div>
  );
}