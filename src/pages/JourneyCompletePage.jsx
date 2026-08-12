import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Gauge, Clock, CloudOff } from 'lucide-react';

export function JourneyCompletePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const summary = state?.summary;

  if (!summary) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="flex flex-col items-center pt-10 animate-scaleIn">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-5">
        <CheckCircle2 className="text-green-600" size={40} />
      </div>

      <h1 className="text-xl font-semibold text-gray-900 mb-1">Journey Completed</h1>
      <p className="text-sm text-gray-500 mb-8">{summary.vehicleReg}</p>

      <div className="w-full grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
          <Gauge className="mx-auto text-brand-600 mb-2" size={20} />
          <p className="text-2xl font-semibold text-gray-900">{summary.distance}</p>
          <p className="text-xs text-gray-500">km travelled</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
          <Clock className="mx-auto text-brand-600 mb-2" size={20} />
          <p className="text-2xl font-semibold text-gray-900">{summary.duration}</p>
          <p className="text-xs text-gray-500">duration</p>
        </div>
      </div>

      {summary.queued && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 w-full">
          <CloudOff size={16} className="shrink-0" />
          Saved offline — will upload automatically once you're back online.
        </div>
      )}

      <button
        onClick={() => navigate('/', { replace: true })}
        className="btn-press w-full rounded-xl bg-brand-600 py-3.5 text-base font-medium text-white"
      >
        Done
      </button>
    </div>
  );
}