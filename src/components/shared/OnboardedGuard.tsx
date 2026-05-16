import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { emailVerificationBlocksAccess } from '../../utils/authFlow';
import { isOnboardingComplete } from '../../utils/onboardingGate';

/** Main app routes: verified email and finished onboarding. */
export function OnboardedGuard() {
  const { user, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-fg-muted">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  if (emailVerificationBlocksAccess(user.emailVerified)) {
    return <Navigate to={ROUTES.verifyEmail} replace />;
  }

  if (!isOnboardingComplete(profile)) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  return <Outlet />;
}
