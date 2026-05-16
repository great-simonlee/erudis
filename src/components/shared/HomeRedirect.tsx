import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { emailVerificationBlocksAccess } from '../../utils/authFlow';
import { isOnboardingComplete } from '../../utils/onboardingGate';

/** Sends signed-in users to the right step (verify → onboarding → feed). */
export function HomeRedirect() {
  const { user, profile, loading, profileLoading } = useAuth();

  if (loading || (user && profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-fg-muted">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (emailVerificationBlocksAccess(user.emailVerified)) {
    return <Navigate to={ROUTES.verifyEmail} replace />;
  }

  if (!isOnboardingComplete(profile)) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  return <Navigate to={ROUTES.feed} replace />;
}
