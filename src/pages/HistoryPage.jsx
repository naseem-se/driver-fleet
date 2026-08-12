import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Route as RouteIcon, Gauge, Fuel } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { FullPageLoader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export function HistoryPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('journeys');

  const { data: performance, isLoading: perfLoading } = useQuery({
    queryKey: ['drivers', 'me', 'performance'],
    queryFn: async () => (await apiClient.get(`/drivers/${user.driver?.id ?? ''}/performance`)).data,
    enabled: !!user?.driver?.id && tab === 'journeys',
  });

  const { data: fuelEntries, isLoading: fuelLoading } = useQuery({
    queryKey: ['fuel-entries', 'mine'],
    queryFn: async () => (await apiClient.get('/fuel-entries/mine')).data,
    enabled: tab === 'fuel',
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4">History</h1>

      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-6">
        {[{ key: 'journeys', label: 'Journeys', icon: RouteIcon }, { key: 'fuel', label: 'Fuel', icon: Fuel }].map(
          ({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={clsx(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors',
                tab === key ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'
              )}
            >
              <Icon size={14} /> {label}
            </button>
          )
        )}
      </div>

      {tab === 'journeys' ? (
        perfLoading ? (
          <FullPageLoader />
        ) : !performance || performance.total_journeys === 0 ? (
          <EmptyTab icon={RouteIcon} message="No journeys in the last 30 days." />
        ) : (
          <div className="grid grid-cols-2 gap-3 animate-fadeIn">
            <StatBlock label="Total Journeys" value={performance.total_journeys} />
            <StatBlock label="Total Distance" value={`${performance.total_distance} km`} icon={Gauge} />
          </div>
        )
      ) : fuelLoading ? (
        <FullPageLoader />
      ) : !fuelEntries || fuelEntries.data.length === 0 ? (
        <EmptyTab icon={Fuel} message="No fuel entries yet." />
      ) : (
        <div className="space-y-3 animate-fadeIn">
          {fuelEntries.data.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{entry.quantity_litres} L</span>
                <span className="text-sm text-gray-500">{new Date(entry.entry_time).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-500">Total cost: {entry.total_cost}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 flex items-center gap-1">
        {Icon && <Icon size={18} className="text-brand-600" />} {value}
      </p>
    </div>
  );
}

function EmptyTab({ icon: Icon, message }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center animate-fadeIn">
      <Icon className="mx-auto text-gray-300 mb-3" size={32} />
      <p className="text-gray-500">{message}</p>
    </div>
  );
}