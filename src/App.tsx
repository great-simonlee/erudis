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
import { BriefPage } from './pages/discover/BriefPage';
import { LabsPage } from './pages/lab/LabsPage';
import { LabExplorePage } from './pages/lab/LabExplorePage';
import { LabCreatePage } from './pages/lab/LabCreatePage';
import { LabProfilePage } from './pages/lab/LabProfilePage';
import { LabSettingsPage } from './pages/lab/LabSettingsPage';
import { InstitutionProfilePage } from './pages/institution/InstitutionProfilePage';
import { InstitutionAdminPage } from './pages/institution/InstitutionAdminPage';
import { PapersPage } from './pages/papers/PapersPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { JobDetailPage } from './pages/jobs/JobDetailPage';
import { JobPostPage } from './pages/jobs/JobPostPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { PricingPage } from './pages/pricing/PricingPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ProfileLogsPage } from './pages/profile/ProfileLogsPage';
import { marketingPublicRoutes } from './pages/marketing/marketingRoutes';
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
              {marketingPublicRoutes}
              <Route element={<MainLayout />}>
                <Route path={ROUTES.feed} element={<FeedPage />} />
                <Route path={ROUTES.discover} element={<DiscoverPage />} />
                <Route path={ROUTES.brief} element={<BriefPage />} />
                <Route path={ROUTES.labExplore} element={<LabExplorePage />} />
                <Route path={ROUTES.labs} element={<LabsPage />} />
                <Route path={ROUTES.labCreate} element={<LabCreatePage />} />
                <Route path="/lab/:labId/settings" element={<LabSettingsPage />} />
                <Route path="/lab/:labId" element={<LabProfilePage />} />
                <Route path="/institution/:institutionId/manage" element={<InstitutionAdminPage />} />
                <Route path="/institution/:institutionId" element={<InstitutionProfilePage />} />
                <Route path={ROUTES.papers} element={<PapersPage />} />
                <Route path={ROUTES.jobsPost} element={<JobPostPage />} />
                <Route path="/jobs/:jobId" element={<JobDetailPage />} />
                <Route path={ROUTES.jobs} element={<JobsPage />} />
                <Route path={ROUTES.pricing} element={<PricingPage />} />
                <Route path={ROUTES.messages} element={<MessagesPage />} />
                <Route path={ROUTES.settings} element={<SettingsPage />} />
                <Route path="/profile/:uid" element={<ProfilePage />} />
                <Route path="/profile/:uid/logs" element={<ProfileLogsPage />} />
              </Route>
              <Route path="*" element={<Navigate to={ROUTES.feed} replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<HomeRedirect />} />
              <Route path={ROUTES.login} element={<LoginPage />} />
              <Route path={ROUTES.register} element={<RegisterPage />} />
              <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
              {marketingPublicRoutes}

              <Route element={<AuthGuard />}>
                <Route path={ROUTES.verifyEmail} element={<VerifyEmailPage />} />
                <Route element={<EmailVerifiedGuard />}>
                  <Route path={ROUTES.onboarding} element={<OnboardingPage />} />
                  <Route element={<OnboardedGuard />}>
                    <Route element={<MainLayout />}>
                      <Route path={ROUTES.feed} element={<FeedPage />} />
                      <Route path={ROUTES.discover} element={<DiscoverPage />} />
                      <Route path={ROUTES.brief} element={<BriefPage />} />
                      <Route path={ROUTES.labExplore} element={<LabExplorePage />} />
                      <Route path={ROUTES.labs} element={<LabsPage />} />
                      <Route path={ROUTES.labCreate} element={<LabCreatePage />} />
                      <Route path="/lab/:labId/settings" element={<LabSettingsPage />} />
                      <Route path="/lab/:labId" element={<LabProfilePage />} />
                <Route path="/institution/:institutionId/manage" element={<InstitutionAdminPage />} />
                <Route path="/institution/:institutionId" element={<InstitutionProfilePage />} />
                      <Route path={ROUTES.papers} element={<PapersPage />} />
                      <Route path={ROUTES.jobsPost} element={<JobPostPage />} />
                      <Route path="/jobs/:jobId" element={<JobDetailPage />} />
                      <Route path={ROUTES.jobs} element={<JobsPage />} />
                      <Route path={ROUTES.pricing} element={<PricingPage />} />
                      <Route path={ROUTES.messages} element={<MessagesPage />} />
                      <Route path={ROUTES.settings} element={<SettingsPage />} />
                      <Route path="/profile/:uid" element={<ProfilePage />} />
                      <Route path="/profile/:uid/logs" element={<ProfileLogsPage />} />
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
