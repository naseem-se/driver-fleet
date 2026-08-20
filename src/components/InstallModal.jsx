import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../lib/useInstallPrompt';
import { isIosSafari } from '../lib/isIos';

export function InstallModal({ onClose }) {
  const { isInstallable, promptInstall } = useInstallPrompt();

  async function handleInstall() {
    const outcome = await promptInstall();
    if (outcome === 'accepted') onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0 animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg animate-scaleIn">
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600">
            <Download className="text-white" size={20} />
          </div>
          <button onClick={onClose} className="text-gray-400"><X size={18} /></button>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-1">Install the Driver App</h2>
        <p className="text-sm text-gray-500 mb-5">
          Install this app on your phone for faster access, offline trip logging, and push notifications.
        </p>

        {isInstallable ? (
          <button onClick={handleInstall} className="btn-press w-full rounded-xl bg-brand-600 py-3 text-sm font-medium text-white">
            Install Now
          </button>
        ) : isIosSafari() ? (
          <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
            Tap the <strong>Share</strong> button in Safari, then choose <strong>"Add to Home Screen."</strong>
          </div>
        ) : (
          <button onClick={onClose} className="btn-press w-full rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600">
            Got it
          </button>
        )}
      </div>
    </div>
  );
}