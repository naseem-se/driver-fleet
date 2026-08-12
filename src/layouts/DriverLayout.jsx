import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Fuel, History, User } from 'lucide-react';
import { OfflineBanner } from '../components/OfflineBanner';
import { UpdateBanner } from '../components/UpdateBanner';
import clsx from 'clsx';
import { ErrorBoundary } from '../components/ErrorBoundary';

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/fuel', label: 'Fuel', icon: Fuel },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: User },
];

export function DriverLayout() {
  const location = useLocation();

  // Don't nudge a reload while the driver is mid-flow on odometer/fuel
  // capture screens — a forced context switch there is actively disruptive,
  // not just mildly annoying like it would be on Home or History.
  const suppressUpdateBanner = ['/start-journey', '/end-journey', '/fuel-entry'].includes(location.pathname);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <OfflineBanner />
      {!suppressUpdateBanner && <UpdateBanner />}

      <main key={location.pathname} className="flex-1 overflow-y-auto animate-fadeIn">
        <div className="max-w-md mx-auto px-4 py-5 pb-4">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      <nav className="border-t border-gray-200 bg-white">
        <div className="max-w-md mx-auto grid grid-cols-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                  isActive ? 'text-brand-600' : 'text-gray-400'
                )
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}