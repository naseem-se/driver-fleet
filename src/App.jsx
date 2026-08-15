import { Routes, Route } from 'react-router-dom';
import { DriverLayout } from './layouts/DriverLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { StartJourneyPage } from './pages/StartJourneyPage';
import { ActiveJourneyPage } from './pages/ActiveJourneyPage';
import { EndJourneyPage } from './pages/EndJourneyPage';
import { FuelEntryPage } from './pages/FuelEntryPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { JourneyCompletePage } from './pages/JourneyCompletePage';
import { FuelPage } from './pages/FuelPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { EmailVerifiedPage } from './pages/EmailVerifiedPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/email-verified" element={<EmailVerifiedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DriverLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/fuel" element={<FuelPage />} />
          <Route path="/start-journey" element={<StartJourneyPage />} />
          <Route path="/active-journey" element={<ActiveJourneyPage />} />
          <Route path="/end-journey" element={<EndJourneyPage />} />
          <Route path="/fuel-entry" element={<FuelEntryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/journey-complete" element={<JourneyCompletePage />} />
        </Route>
      </Route>
    </Routes>
  );
}