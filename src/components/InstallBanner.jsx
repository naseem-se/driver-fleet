import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { useInstallPrompt } from '../lib/useInstallPrompt';
import { isIosSafari } from '../lib/isIos';

const IOS_DISMISSED_KEY = 'fleet_driver_ios_install_dismissed_at';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function InstallBanner() {
  const { isInstallable, isInstalled, promptInstall, dismiss } = useInstallPrompt();
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (!isIosSafari() || isInstalled) return;
    const dismissedAt = Number(localStorage.getItem(IOS_DISMISSED_KEY) ?? 0);
    if (Date.now() - dismissedAt > COOLDOWN_MS) setShowIosHint(true);
  }, [isInstalled]);

  function dismissIosHint() {
    localStorage.setItem(IOS_DISMISSED_KEY, String(Date.now()));
    setShowIosHint(false);
  }

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 animate-fadeIn">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600">
          <Download className="text-white" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-900">Install this app</p>
          <p className="text-xs text-brand-700">Faster access, works like a native app</p>
        </div>
        <button
          onClick={promptInstall}
          className="btn-press shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white"
        >
          Install
        </button>
        <button onClick={dismiss} className="shrink-0 text-brand-400">
          <X size={16} />
        </button>
      </div>
    );
  }

  if (showIosHint) {
    return (
      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 animate-fadeIn">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600">
          <Share className="text-white" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-900">Add to Home Screen</p>
          <p className="text-xs text-brand-700">Tap Share, then "Add to Home Screen"</p>
        </div>
        <button onClick={dismissIosHint} className="shrink-0 text-brand-400">
          <X size={16} />
        </button>
      </div>
    );
  }

  return null;
}