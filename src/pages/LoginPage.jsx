import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../lib/apiClient';
import { Loader } from '../components/Loader';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm animate-scaleIn">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 mb-5">
          <Truck className="text-white" size={26} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Driver Login</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to start your shift</p>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none"
        />

        <div className="mb-4 flex justify-end">
          <Link to="/forgot-password" className="text-sm text-brand-600">Forgot password?</Link>
        </div>

        <button
          type="submit" disabled={submitting}
          className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-base font-medium text-white disabled:opacity-60"
        >
          {submitting && <Loader size="sm" className="border-white/40 border-t-white" />}
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}