import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function PreciseLocationWarning({ lastAccuracy }) {
  const [dismissed, setDismissed] = useState(false);

  const isImprecise = lastAccuracy != null && lastAccuracy > 150;

  if (!isImprecise || dismissed) return null;

  return (
    <div className="flex items-start gap-2 bg-amber-500 px-4 py-2 text-sm text-white animate-fadeIn">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">Your location may be inaccurate</p>
        <p className="text-xs opacity-90 mt-0.5">
          Open your phone's Settings → Apps → this app → Permissions → Location, and choose "Precise" instead of "Approximate."
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-white/80"><X size={14} /></button>
    </div>
  );
}