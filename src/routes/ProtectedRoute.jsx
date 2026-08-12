import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader } from '../components/Loader';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center"><FullPageLoader /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}