import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gauge } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { Loader } from '../components/Loader';
import { useGeolocation } from '../lib/useGeolocation';
import { apiClient, extractErrorMessage } from '../lib/apiClient';
import { enqueueAction } from '../lib/offlineQueue';
import { clearLocalJourney } from '../lib/localJourney';

export function EndJourneyPage() {
  const { state } = useLocation();
  const journey = state?.journey;
  const navigate = useNavigate();
  const { getPosition } = useGeolocation();

  const [endKm, setEndKm] = useState('');
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!journey) { navigate('/'); return null; }

  async function handleSubmit() {
    if (!endKm || !photo) { setError('Please enter the odometer reading and take a photo.'); return; }
    if (Number(endKm) < Number(journey.start.km)) {
      setError('End odometer cannot be less than the starting reading.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const position = await getPosition().catch(() => null);
      if (!position) throw new Error('Could not get your location. Please enable GPS and try again.');

      const fields = { end_km: endKm, lat: position.lat, lng: position.lng, photo };
      let queued = false;

      if (navigator.onLine && !journey.isLocal) {
        const form = new FormData();
        Object.entries(fields).forEach(([k, v]) => form.append(k, v));
        await apiClient.post(`/journeys/${journey.id}/end`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else if (journey.isLocal) {
        await enqueueAction({
          type: 'END_JOURNEY',
          endpointTemplate: '/journeys/{journeyId}/end',
          journeyRef: journey.id,
          fields,
        });
        queued = true;
      } else {
        await enqueueAction({ type: 'END_JOURNEY', endpoint: `/journeys/${journey.id}/end`, fields });
        queued = true;
      }

      clearLocalJourney();

      const distance = (Number(endKm) - Number(journey.start.km)).toFixed(1);
      const minutes = Math.round((Date.now() - new Date(journey.start.time).getTime()) / 60000);
      const duration = minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

      navigate('/journey-complete', {
        replace: true,
        state: { summary: { vehicleReg: journey.vehicle?.registration_number, distance, duration, queued } },
      });
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

      <div className="mb-6 rounded-2xl bg-red-50 p-4">
        <p className="text-xs text-red-700 font-medium mb-0.5">Ending journey for</p>
        <p className="text-lg font-semibold text-red-900">{journey.vehicle?.registration_number}</p>
        <p className="text-sm text-red-700">Started at {journey.start.km} km</p>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 animate-fadeIn">{error}</div>}

      <label className="block text-sm font-medium text-gray-700 mb-2">
        <span className="flex items-center gap-1"><Gauge size={14} /> Ending Odometer (km)</span>
      </label>
      <input
        type="number" inputMode="decimal" value={endKm} onChange={(e) => setEndKm(e.target.value)}
        placeholder="e.g. 45365"
        className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none"
      />

      <label className="block text-sm font-medium text-gray-700 mb-2">Odometer Photo</label>
      <CameraCapture label="Take odometer photo" onCapture={setPhoto} />

      <button
        onClick={handleSubmit}
        disabled={submitting || !photo}
        className="btn-press mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-base font-medium text-white disabled:opacity-50"
      >
        {submitting && <Loader size="sm" className="border-white/40 border-t-white" />}
        {submitting ? 'Ending Journey...' : 'End Journey'}
      </button>
    </div>
  );
}