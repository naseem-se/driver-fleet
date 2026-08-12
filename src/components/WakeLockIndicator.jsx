import { Sun, SunDim } from 'lucide-react';

export function WakeLockIndicator({ isLocked, isSupported }) {
  if (!isSupported) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
        <SunDim size={12} />
        Screen may sleep — keep app open
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isLocked ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      <Sun size={12} />
      {isLocked ? 'Screen staying awake' : 'Reconnecting...'}
    </div>
  );
}