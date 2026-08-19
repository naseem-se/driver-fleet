import { LogOut, User, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import { apiClient, extractErrorMessage } from '../lib/apiClient';
import { Loader } from '../components/Loader';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file || !user?.driver?.id) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('photo', file);
      await apiClient.post(`/drivers/${user.driver.id}/photo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photo updated');
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      refreshUser?.(); // if AuthContext exposes this from an earlier round
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <div className="flex flex-col items-center py-6">
        <div className="relative">
          <Avatar name={user?.name} photoUrl={user?.driver?.profile_photo_url} size="lg" />
          <button
            onClick={() => inputRef.current?.click()}
            className="btn-press absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow"
          >
            {uploading ? <Loader size="sm" className="border-white/40 border-t-white" /> : <Camera size={14} />}
          </button>
          <input ref={inputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </div>
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