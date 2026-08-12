import { RefreshCw } from 'lucide-react';

export function PullToRefreshIndicator({ pullDistance, refreshing }) {
  if (pullDistance === 0 && !refreshing) return null;

  const rotation = refreshing ? undefined : Math.min(pullDistance * 3, 180);

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-[height]"
      style={{ height: refreshing ? 40 : Math.min(pullDistance, 60) }}
    >
      <RefreshCw
        size={20}
        className={`text-brand-600 ${refreshing ? 'animate-spin' : ''}`}
        style={!refreshing ? { transform: `rotate(${rotation}deg)` } : undefined}
      />
    </div>
  );
}