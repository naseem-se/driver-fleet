import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { Loader } from '../components/Loader';
import { apiClient, extractErrorMessage } from '../lib/apiClient';
import { enqueueAction } from '../lib/offlineQueue';

export function FuelEntryPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const vehicle = state?.vehicle;
  const journey = state?.journey; // may be undefined (fuel entry unlinked to a journey), local, or real

  const [litres, setLitres] = useState('');
  const [rate, setRate] = useState('');
  const [odometer, setOdometer] = useState('');
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const total = litres && rate ? (Number(litres) * Number(rate)).toFixed(2) : null;

  if (!vehicle) { navigate('/'); return null; }

  async function handleSubmit() {
    if (!litres || !rate || !odometer || !photo) {
      setError('Please fill in all fields and take a receipt photo.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const fields = {
        vehicle_id: vehicle.id,
        journey_id: journey?.id, // real id, local id, or undefined
        quantity_litres: litres,
        rate_per_litre: rate,
        odometer_reading: odometer,
        receipt_photo: photo,
      };

      if (navigator.onLine && !journey?.isLocal) {
        const form = new FormData();
        Object.entries(fields).forEach(([k, v]) => v !== undefined && form.append(k, v));
        await apiClient.post('/fuel-entries', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else if (journey?.isLocal) {
        await enqueueAction({
          type: 'FUEL_ENTRY',
          endpoint: '/fuel-entries', // no {journeyId} in the URL itself — only the journey_id field needs resolving
          endpointTemplate: '/fuel-entries',
          journeyRef: journey.id,
          fields,
        });
      } else {
        await enqueueAction({ type: 'FUEL_ENTRY', endpoint: '/fuel-entries', fields });
      }

      navigate(-1);
    } catch (err) {
      setError(err.message ?? extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-500">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-xl font-semibold text-gray-900 mb-1">Add Fuel Entry</h1>
      <p className="text-sm text-gray-500 mb-6">{vehicle.registration_number}</p>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 animate-fadeIn">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Litres</label>
          <input type="number" inputMode="decimal" value={litres} onChange={(e) => setLitres(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rate/Litre</label>
          <input type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none" />
        </div>
      </div>

      {total && (
        <div className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 animate-fadeIn">
          Total cost: {total}
        </div>
      )}

      <label className="block text-sm font-medium text-gray-700 mb-2">Current Odometer</label>
      <input type="number" inputMode="decimal" value={odometer} onChange={(e) => setOdometer(e.target.value)}
        className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none" />

      <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Photo</label>
      <CameraCapture label="Take receipt photo" onCapture={setPhoto} />

      <button
        onClick={handleSubmit}
        disabled={submitting || !photo}
        className="btn-press mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-4 text-base font-medium text-white disabled:opacity-50"
      >
        {submitting && <Loader size="sm" className="border-white/40 border-t-white" />}
        {submitting ? 'Saving...' : 'Save Fuel Entry'}
      </button>
    </div>
  );
}