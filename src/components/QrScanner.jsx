import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { X } from 'lucide-react';

const SCANNER_ID = 'qr-scanner-region';

export function QrScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const stoppedRef = useRef(false);
  const scanLockRef = useRef(false); // set synchronously — prevents onScan firing more than once
  const [error, setError] = useState(null);

  async function safeStop() {
    const scanner = scannerRef.current;
    if (!scanner || stoppedRef.current) return;
    stoppedRef.current = true;
    try {
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop();
      }
    } catch {
      // Already stopped / never started — safe to ignore.
    }
  }

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;
    stoppedRef.current = false;
    scanLockRef.current = false;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          // stop() is async and doesn't halt frame processing instantly —
          // without this synchronous lock, a steady QR code in frame fires
          // this callback multiple times per second before the first stop()
          // call actually takes effect, each one re-triggering onScan.
          if (scanLockRef.current) return;
          scanLockRef.current = true;

          safeStop().finally(() => onScan(decodedText));
        },
        () => {} // per-frame decode misses — expected while aiming, ignore
      )
      .catch(() => setError('Could not access the camera. Check permissions and try again.'));

    return () => {
      safeStop();
    };
  }, [onScan]);

  function handleClose() {
    safeStop().finally(onClose);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-fadeIn">
      <div className="flex items-center justify-between p-4 text-white">
        <h2 className="font-medium">Scan Vehicle QR Code</h2>
        <button onClick={handleClose} className="rounded-full bg-white/10 p-2"><X size={20} /></button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div id={SCANNER_ID} className="w-full max-w-sm" />
      </div>

      {error && <p className="p-4 text-center text-sm text-red-400">{error}</p>}
      <p className="p-4 text-center text-sm text-white/60">Point your camera at the QR code on the vehicle</p>
    </div>
  );
}