import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Fuel, QrCode, Plus } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { useCurrentJourney } from '../lib/useCurrentJourney';
import { QrScanner } from '../components/QrScanner';
import { FullPageLoader } from '../components/Loader';

export function FuelPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const { data: journey } = useCurrentJourney();

  const { data: fuelEntries, isLoading } = useQuery({
    queryKey: ['fuel-entries', 'mine'],
    queryFn: async () => (await apiClient.get('/fuel-entries/mine')).data,
  });

  async function handleScan(qrToken) {
    setScanning(false);
    try {
      const res = await apiClient.get(`/vehicles/qr/${qrToken}`);
      navigate('/fuel-entry', { state: { vehicle: res.data.data } });
    } catch {
      toast.error('Vehicle not found. Please try scanning again.');
    }
  }

  function handleAddFuel() {
    if (journey) {
      navigate('/fuel-entry', { state: { vehicle: journey.vehicle, journey } });
    } else {
      setScanning(true);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Fuel</h1>
        <button onClick={handleAddFuel} className="btn-press flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
          <Plus size={16} /> Add
        </button>
      </div>

      {!journey && (
        <button
          onClick={() => setScanning(true)}
          className="btn-press w-full flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 p-4 mb-6 text-gray-500"
        >
          <QrCode size={20} /> Scan a vehicle to log fuel outside a journey
        </button>
      )}

      {isLoading ? (
        <FullPageLoader />
      ) : !fuelEntries || fuelEntries.data.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
          <Fuel className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="text-gray-500">No fuel entries yet.</p>
        </div>
      ) : (
        <div className="space-y-3 animate-fadeIn">
          {fuelEntries.data.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{entry.quantity_litres} L</span>
                <span className="text-sm text-gray-500">{new Date(entry.entry_time).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-500">{entry.vehicle?.registration_number ?? '-'} · Total: {entry.total_cost}</p>
            </div>
          ))}
        </div>
      )}

      {scanning && <QrScanner onScan={handleScan} onClose={() => setScanning(false)} />}
    </div>
  );
}