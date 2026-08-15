import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { apiClient, extractValidationErrors, extractErrorMessage } from '../lib/apiClient';
import { Loader } from '../components/Loader';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post('/auth/reset-password', { token, email, password, password_confirmation: passwordConfirmation });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const fieldErrors = extractValidationErrors(err);
      setError(Object.values(fieldErrors)[0] ?? extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <p className="text-sm text-gray-500 mb-4">This link is invalid.</p>
        <Link to="/forgot-password" className="text-sm font-medium text-brand-600">Request a new link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 mb-5">
          <CheckCircle2 className="text-green-600" size={24} />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Password reset</h1>
        <p className="text-sm text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Set a new password</h1>
        <p className="text-sm text-gray-500 mb-6">For {email}</p>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none" />

        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input type="password" required value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none" />

        <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-base font-medium text-white disabled:opacity-60">
          {submitting && <Loader size="sm" className="border-white/40 border-t-white" />}
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}