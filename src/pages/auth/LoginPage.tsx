import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignInForm } from '../../components/auth/SignInForm';
import { FirebaseNotice } from '../../components/shared/FirebaseNotice';
import { ROUTES } from '../../constants';
import { emailVerificationBlocksAccess } from '../../utils/authFlow';
import { isOnboardingComplete } from '../../utils/onboardingGate';
import { useAuth } from '../../hooks/useAuth';

function nextPath(
  emailVerified: boolean,
  profile: import('../../types').User | null | undefined
): string {
  if (emailVerificationBlocksAccess(emailVerified)) return ROUTES.verifyEmail;
  if (!isOnboardingComplete(profile ?? null)) return ROUTES.onboarding;
  return ROUTES.feed;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { user, profile, loading, profileLoading } = useAuth();

  useEffect(() => {
    if (loading || profileLoading || !user) return;
    navigate(nextPath(user.emailVerified, profile), { replace: true });
  }, [loading, profileLoading, user, profile, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-fg-muted">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-fg-muted">
        <p className="text-sm">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-card rounded-card border border-border bg-surface-card p-8">
        <FirebaseNotice />
        <h1 className="font-display text-2xl text-fg">Welcome back</h1>
        <p className="mt-2 text-sm text-fg-muted">Log in with your institutional account.</p>
        <div className="mt-8">
          <SignInForm showFirebaseNotice={false} />
        </div>
        <p className="mt-6 text-center text-sm text-fg-subtle">
          New to THE ERUDIS?{' '}
          <Link className="text-brand hover:underline" to={ROUTES.register}>
            Create an account
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-fg-subtle">
          <Link className="text-brand hover:underline" to="/">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
