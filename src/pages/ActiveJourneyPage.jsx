import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, Flag, Gauge, Clock, CloudOff } from 'lucide-react';
import { useCurrentJourney } from '../lib/useCurrentJourney';
import { useJourneyTracking } from '../lib/useJourneyTracking';
import { useWakeLock } from '../lib/useWakeLock';
import { WakeLockIndicator } from '../components/WakeLockIndicator';
import { FullPageLoader } from '../components/Loader';

function useElapsed(startTime) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    function tick() {
      const mins = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
      setElapsed(mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`);
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [startTime]);
  return elapsed;
}

export function ActiveJourneyPage() {
  const navigate = useNavigate();
  const { data: journey, isLoading } = useCurrentJourney();

  useJourneyTracking(journey);
  const { isLocked, isSupported } = useWakeLock(!!journey);
  const elapsed = useElapsed(journey?.start?.time ?? Date.now());

  useEffect(() => {
    if (!isLoading && !journey) navigate('/', { replace: true });
  }, [isLoading, journey, navigate]);

  if (isLoading || !journey) return <FullPageLoader />;

  return (
    <div>
      <div className="rounded-2xl bg-green-600 p-5 text-white mb-6 animate-scaleIn">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-sm font-medium opacity-90">
            <span className="h-2 w-2 rounded-full bg-white animate-pulseGlow" /> Journey Active
          </div>
          <WakeLockIndicator isLocked={isLocked} isSupported={isSupported} />
        </div>

        {journey.isLocal && (
          <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-medium animate-fadeIn">
            <CloudOff size={13} /> Not yet synced — will upload when back online
          </div>
        )}

        <p className="text-xl font-semibold mb-4">{journey.vehicle?.registration_number}</p>
        <div className="flex gap-6 text-sm">
          <span className="flex items-center gap-1.5"><Gauge size={15} /> {journey.start?.km} km start</span>
          <span className="flex items-center gap-1.5"><Clock size={15} /> {elapsed}</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-3">Location is being tracked automatically every few minutes.</p>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => navigate('/fuel-entry', { state: { vehicle: journey.vehicle, journey } })}
          className="btn-press flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <Fuel className="text-blue-600" size={22} />
          </div>
          <div>
            <p className="font-medium text-gray-900">Add Fuel Entry</p>
            <p className="text-sm text-gray-500">Log fuel purchased during this trip</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/end-journey', { state: { journey } })}
          className="btn-press flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
            <Flag className="text-red-600" size={22} />
          </div>
          <div>
            <p className="font-medium text-gray-900">End Journey</p>
            <p className="text-sm text-gray-500">Finish and record the ending odometer</p>
          </div>
        </button>
      </div>
    </div>
  );
}