import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { skipFirebase } from './config/flags';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/shared/AuthGuard';
import { EmailVerifiedGuard } from './components/shared/EmailVerifiedGuard';
import { OnboardedGuard } from './components/shared/OnboardedGuard';
import { HomeRedirect } from './components/shared/HomeRedirect';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';
import { FeedPage } from './pages/feed/FeedPage';
import { DiscoverPage } from './pages/discover/DiscoverPage';
import { LabsPage } from './pages/lab/LabsPage';
import { PapersPage } from './pages/papers/PapersPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ROUTES } from './constants';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
          {skipFirebase ? (
            <>
              <Route path="/" element={<Navigate to={ROUTES.feed} replace />} />
              <Route path={ROUTES.login} element={<LoginPage />} />
              <Route path={ROUTES.register} element={<RegisterPage />} />
              <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
              <Route element={<MainLayout />}>
                <Route path={ROUTES.feed} element={<FeedPage />} />
                <Route path={ROUTES.discover} element={<DiscoverPage />} />
                <Route path={ROUTES.labs} element={<LabsPage />} />
                <Route path={ROUTES.papers} element={<PapersPage />} />
                <Route path={ROUTES.jobs} element={<JobsPage />} />
                <Route path={ROUTES.messages} element={<MessagesPage />} />
                <Route path={ROUTES.settings} element={<SettingsPage />} />
                <Route path="/profile/:uid" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<Navigate to={ROUTES.feed} replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<HomeRedirect />} />
              <Route path={ROUTES.login} element={<LoginPage />} />
              <Route path={ROUTES.register} element={<RegisterPage />} />
              <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />

              <Route element={<AuthGuard />}>
                <Route path={ROUTES.verifyEmail} element={<VerifyEmailPage />} />
                <Route element={<EmailVerifiedGuard />}>
                  <Route path={ROUTES.onboarding} element={<OnboardingPage />} />
                  <Route element={<OnboardedGuard />}>
                    <Route element={<MainLayout />}>
                      <Route path={ROUTES.feed} element={<FeedPage />} />
                      <Route path={ROUTES.discover} element={<DiscoverPage />} />
                      <Route path={ROUTES.labs} element={<LabsPage />} />
                      <Route path={ROUTES.papers} element={<PapersPage />} />
                      <Route path={ROUTES.jobs} element={<JobsPage />} />
                      <Route path={ROUTES.messages} element={<MessagesPage />} />
                      <Route path={ROUTES.settings} element={<SettingsPage />} />
                      <Route path="/profile/:uid" element={<ProfilePage />} />
                    </Route>
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
