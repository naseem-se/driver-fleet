import { LogOut, User, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <div className="flex flex-col items-center py-6">
        <Avatar name={user?.name} size="lg" />
        <h1 className="mt-3 text-xl font-semibold text-gray-900">{user?.name}</h1>
        <p className="text-sm text-gray-500">{user?.company?.name}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100 mb-6">
        <div className="flex items-center gap-3 p-4">
          <Mail size={18} className="text-gray-400" />
          <span className="text-sm text-gray-700">{user?.email}</span>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Phone size={18} className="text-gray-400" />
          <span className="text-sm text-gray-700">{user?.phone ?? user?.driver?.phone ?? '-'}</span>
        </div>
      </div>

      <button
        onClick={() => logout()}
        className="btn-press flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3.5 text-sm font-medium text-red-600"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}