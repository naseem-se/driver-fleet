import { AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SubscriptionIssueScreen({ issue }) {
  const { logout } = useAuth();
  const isSuspended = issue?.code === 'account_suspended';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 mb-5">
        <AlertCircle className="text-amber-600" size={30} />
      </div>

      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        {isSuspended ? 'Account Suspended' : 'Subscription Expired'}
      </h1>

      <p className="text-sm text-gray-500 mb-1">{issue?.message}</p>
      <p className="text-sm text-gray-500 mb-6">
        {issue?.detail ?? 'Please contact your fleet manager for assistance.'}
      </p>

      <button
        onClick={() => logout()}
        className="btn-press flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}