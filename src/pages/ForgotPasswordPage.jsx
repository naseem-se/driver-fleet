import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { apiClient, extractErrorMessage } from '../lib/apiClient';
import { Loader } from '../components/Loader';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 mb-5">
          <Mail className="text-green-600" size={24} />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h1>
        <p className="text-sm text-gray-500 mb-6">A reset link has been sent if an account exists for {email}.</p>
        <Link to="/login" className="text-sm font-medium text-brand-600">Back to login</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 mb-4">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Forgot password?</h1>
        <p className="text-sm text-gray-500 mb-6">We'll send you a reset link.</p>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none" />

        <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-base font-medium text-white disabled:opacity-60">
          {submitting && <Loader size="sm" className="border-white/40 border-t-white" />}
          {submitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}