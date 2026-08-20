import { Download } from 'lucide-react';
import { useInstallPrompt } from '../lib/useInstallPrompt';
import { isIosSafari } from '../lib/isIos';

export function InstallButton() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={promptInstall}
        className="btn-press mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 py-3 text-sm font-medium text-brand-700"
      >
        <Download size={16} /> Install App
      </button>
    );
  }

  if (isIosSafari()) {
    return (
      <p className="mt-4 text-center text-xs text-gray-400">
        To install: tap Share, then "Add to Home Screen"
      </p>
    );
  }

  return null;
}