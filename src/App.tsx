import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { PhoneLoginPage } from './pages/auth/PhoneLoginPage';
import { OTPVerificationPage } from './pages/auth/OTPVerificationPage';
import { CompleteProfilePage } from './pages/auth/CompleteProfilePage';
import { BlockedPage } from './pages/auth/BlockedPage';
import { WaitingApprovalPage } from './pages/auth/WaitingApprovalPage';
import { HomePage } from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { WaitingRoomPage } from './pages/quiz/WaitingRoomPage';
import { QuizLivePage } from './pages/quiz/QuizLivePage';
import { PageSpinner } from './components/ui/Spinner';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } });

function AppRoutes() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0F1117] flex items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  if (status === 'blocked') return <BlockedPage />;
  if (status === 'pendingApproval') return <WaitingApprovalPage />;
  if (status === 'profileIncomplete') return <CompleteProfilePage />;

  if (status === 'unauthenticated') {
    return (
      <Routes>
        <Route path="/auth/phone" element={<PhoneLoginPage />} />
        <Route path="/auth/otp" element={<OTPVerificationPage />} />
        <Route path="*" element={<Navigate to="/auth/phone" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Quiz live screens (no nav) */}
      <Route path="/quiz/:id/waiting" element={<WaitingRoomPage />} />
      <Route path="/quiz/:id/live" element={<QuizLivePage />} />

      {/* Main app with bottom nav */}
      <Route element={<AppShell />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
