import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firebaseReady } from '../../lib/firebase';
import { FirebaseNotice } from '../../components/shared/FirebaseNotice';
import { ROUTES } from '../../constants';
import { mapAuthError } from '../../utils/authErrors';
import { institutionalToAuthEmail } from '../../utils/verificationInbox';
import { emailVerificationBlocksAccess } from '../../utils/authFlow';
import { isOnboardingComplete } from '../../utils/onboardingGate';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || profileLoading || !user) return;
    navigate(nextPath(user.emailVerified, profile), {
      replace: true,
    });
  }, [loading, profileLoading, user, profile, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const authSvc = auth;
      if (!firebaseReady || !authSvc) {
        setError('Firebase is not configured. Add keys to .env.local and restart.');
        return;
      }
      const authEmail = await institutionalToAuthEmail(email.trim());
      const cred = await signInWithEmailAndPassword(
        authSvc,
        authEmail,
        password
      );
      await cred.user.reload();
      navigate(nextPath(cred.user.emailVerified, profile ?? null), { replace: true });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

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
        <p className="mt-2 text-sm text-fg-muted">
          Log in with your institutional account.
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="password" className="mb-0">
                Password
              </Label>
              <Link
                to={ROUTES.resetPassword}
                className="text-xs text-brand hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={submitting || !firebaseReady}>
            {submitting ? 'Signing in…' : 'Log in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-fg-subtle">
          New to THE ERUDIS?{' '}
          <Link className="text-brand hover:underline" to={ROUTES.register}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
