import { useRef, useState } from 'react';
import { Camera, RotateCcw, Check } from 'lucide-react';
import { compressImage } from '../lib/imageCompress';
import { Loader } from './Loader';

export function CameraCapture({ label, onCapture }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  async function handleChange(e) {
    const raw = e.target.files?.[0];
    if (!raw) return;

    setProcessing(true);
    try {
      const compressed = await compressImage(raw);
      setFile(compressed);
      setPreview(URL.createObjectURL(compressed));
    } finally {
      setProcessing(false);
    }
  }

  function retake() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function confirm() {
    onCapture(file);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processing}
          className="btn-press flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-10 text-gray-500 hover:border-brand-400 hover:text-brand-600"
        >
          {processing ? <Loader /> : <Camera size={32} />}
          <span className="text-sm font-medium">{processing ? 'Processing...' : label}</span>
        </button>
      ) : (
        <div className="animate-scaleIn">
          <img src={preview} alt="Captured" className="w-full rounded-2xl object-cover max-h-72" />
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={retake} className="btn-press flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700">
              <RotateCcw size={16} /> Retake
            </button>
            <button type="button" onClick={confirm} className="btn-press flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-medium text-white">
              <Check size={16} /> Use Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}