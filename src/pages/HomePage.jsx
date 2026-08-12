import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QrCode, Gauge, Clock, CloudOff, RefreshCw } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { useCurrentJourney } from '../lib/useCurrentJourney';
import { usePullToRefresh } from '../lib/usePullToRefresh';
import { QrScanner } from '../components/QrScanner';
import { PullToRefreshIndicator } from '../components/PullToRefreshIndicator';
import { InstallBanner } from '../components/InstallBanner';
import { FullPageLoader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const handledRef = useRef(false);

  const { data: currentJourney, isLoading, refetch, isFetching } = useCurrentJourney();
  const { pullDistance, refreshing } = usePullToRefresh(refetch);

  async function handleScan(qrToken) {
    if (handledRef.current) return; // page-level guard, on top of QrScanner's own lock
    handledRef.current = true;
    setScanning(false);

    try {
      const res = await apiClient.get(`/vehicles/qr/${qrToken}`);
      navigate('/start-journey', { state: { vehicle: res.data.data } });
    } catch {
      toast.error('Vehicle not found. Please try scanning again.');
    } finally {
      handledRef.current = false;
    }
  }

  if (isLoading) return <FullPageLoader />;

  return (
    <div>
      <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />

      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Welcome back,</p>
          <h1 className="text-2xl font-semibold text-gray-900">{user?.name}</h1>
        </div>
        <button onClick={() => refetch()} className="btn-press flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400">
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      <InstallBanner />

      {currentJourney ? (
        <button
          onClick={() => navigate('/active-journey')}
          className="btn-press w-full rounded-2xl bg-green-600 p-5 text-left text-white animate-scaleIn"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-90">Journey in progress</span>
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs animate-pulseGlow">
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> Active
            </span>
          </div>

          {currentJourney.isLocal && (
            <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-medium">
              <CloudOff size={13} /> Not yet synced
            </div>
          )}

          <p className="text-xl font-semibold mb-3">{currentJourney.vehicle?.registration_number}</p>
          <div className="flex gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1"><Gauge size={14} /> {currentJourney.start?.km} km</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(currentJourney.start?.time).toLocaleTimeString()}</span>
          </div>
          <p className="mt-3 text-sm font-medium underline underline-offset-2">Tap to continue →</p>
        </button>
      ) : (
        <button
          onClick={() => setScanning(true)}
          className="btn-press flex w-full flex-col items-center justify-center gap-3 rounded-2xl bg-brand-600 py-16 text-white animate-scaleIn"
        >
          <QrCode size={48} />
          <span className="text-lg font-medium">Scan Vehicle QR Code</span>
          <span className="text-sm opacity-80">Start a new journey</span>
        </button>
      )}

      {scanning && <QrScanner onScan={handleScan} onClose={() => setScanning(false)} />}
    </div>
  );
}