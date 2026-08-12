import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gauge, ArrowRight } from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { Loader } from '../components/Loader';
import { useGeolocation } from '../lib/useGeolocation';
import { useWakeLock } from '../lib/useWakeLock';
import { apiClient, extractErrorMessage, extractValidationField } from '../lib/apiClient';
import { enqueueAction, createLocalJourneyId } from '../lib/offlineQueue';
import { saveLocalJourney } from '../lib/localJourney';

export function StartJourneyPage() {
  const { state } = useLocation();
  const vehicle = state?.vehicle;
  const navigate = useNavigate();
  const { getPosition } = useGeolocation();
  useWakeLock(true);

  const [startKm, setStartKm] = useState('');
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(null); // 'own_journey' | 'vehicle_taken' | null

  if (!vehicle) {
    navigate('/');
    return null;
  }

  async function handleSubmit() {
    if (!startKm || !photo) {
      setError('Please enter the odometer reading and take a photo.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setConflict(null);

    try {
      const position = await getPosition().catch(() => null);
      if (!position) throw new Error('Could not get your location. Please enable GPS and try again.');

      const fields = { vehicle_id: vehicle.id, start_km: startKm, lat: position.lat, lng: position.lng, photo };

      if (navigator.onLine) {
        const form = new FormData();
        Object.entries(fields).forEach(([k, v]) => form.append(k, v));
        await apiClient.post('/journeys/start', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        // Offline: we genuinely can't know if a conflict exists server-side
        // until this syncs — see the note below the form for why this is
        // an accepted limitation rather than something silently glossed over.
        const localId = createLocalJourneyId();
        await enqueueAction({
          type: 'START_JOURNEY',
          endpoint: '/journeys/start',
          fields,
          producesJourneyRef: localId,
        });
        saveLocalJourney({
          localId,
          vehicle,
          start: { km: startKm, lat: position.lat, lng: position.lng, time: new Date().toISOString() },
        });
      }

      navigate('/active-journey', { replace: true });
    } catch (err) {
      const driverConflict = extractValidationField(err, 'driver');
      const vehicleConflict = extractValidationField(err, 'vehicle_id');

      if (driverConflict) {
        setConflict('own_journey');
      } else if (vehicleConflict) {
        setConflict('vehicle_taken');
      } else {
        setError(err.message ?? extractErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-500">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-6 rounded-2xl bg-brand-50 p-4">
        <p className="text-xs text-brand-700 font-medium mb-0.5">Vehicle</p>
        <p className="text-lg font-semibold text-brand-900">{vehicle.registration_number}</p>
        <p className="text-sm text-brand-700">{[vehicle.make, vehicle.model].filter(Boolean).join(' ')}</p>
      </div>

      {conflict === 'own_journey' && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 animate-fadeIn">
          <p className="text-sm font-medium text-amber-800 mb-1">You already have a journey in progress</p>
          <p className="text-sm text-amber-700 mb-3">End your current journey before starting a new one.</p>
          <button
            onClick={() => navigate('/active-journey', { replace: true })}
            className="btn-press flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white"
          >
            Go to Active Journey <ArrowRight size={14} />
          </button>
        </div>
      )}

      {conflict === 'vehicle_taken' && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 animate-fadeIn">
          <p className="text-sm font-medium text-red-800 mb-1">This vehicle is already on a journey</p>
          <p className="text-sm text-red-700 mb-3">
            Another driver currently has {vehicle.registration_number} checked out. Please confirm with your dispatcher or scan a different vehicle.
          </p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="btn-press rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700"
          >
            Back to Home
          </button>
        </div>
      )}

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 animate-fadeIn">{error}</div>}

      {!conflict && (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-1"><Gauge size={14} /> Starting Odometer (km)</span>
          </label>
          <input
            type="number" inputMode="decimal" value={startKm} onChange={(e) => setStartKm(e.target.value)}
            placeholder="e.g. 45280"
            className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none"
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">Odometer Photo</label>
          <CameraCapture label="Take odometer photo" onCapture={setPhoto} />

          <button
            onClick={handleSubmit}
            disabled={submitting || !photo}
            className="btn-press mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-4 text-base font-medium text-white disabled:opacity-50"
          >
            {submitting && <Loader size="sm" className="border-white/40 border-t-white" />}
            {submitting ? 'Starting Journey...' : 'Start Journey'}
          </button>

          {!navigator.onLine && (
            <p className="mt-3 text-center text-xs text-gray-400">
              You're offline — conflicts (e.g. this vehicle already in use) can only be detected once this syncs.
            </p>
          )}
        </>
      )}
    </div>
  );
}