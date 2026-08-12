import { RefreshCw, CheckCircle2, X } from 'lucide-react';
import { useServiceWorkerUpdate } from '../lib/useServiceWorkerUpdate';

export function UpdateBanner() {
  const { needRefresh, offlineReady, reload, dismissOfflineReady } = useServiceWorkerUpdate();

  if (needRefresh) {
    return (
      <div className="flex items-center justify-between gap-2 bg-brand-600 px-4 py-2 text-sm font-medium text-white animate-fadeIn">
        <span>A new version is available.</span>
        <button
          onClick={reload}
          className="btn-press flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs"
        >
          <RefreshCw size={12} /> Reload Now
        </button>
      </div>
    );
  }

  if (offlineReady) {
    return (
      <div className="flex items-center justify-between gap-2 bg-green-600 px-4 py-2 text-sm font-medium text-white animate-fadeIn">
        <span className="flex items-center gap-2"><CheckCircle2 size={16} /> App ready to work offline</span>
        <button onClick={dismissOfflineReady} className="text-white/80">
          <X size={14} />
        </button>
      </div>
    );
  }

  return null;
}