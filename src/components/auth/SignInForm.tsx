import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firebaseReady } from '../../lib/firebase';
import { FirebaseNotice } from '../shared/FirebaseNotice';
import { ROUTES } from '../../constants';
import { mapAuthError } from '../../utils/authErrors';
import { institutionalToAuthEmail } from '../../utils/verificationInbox';
import { emailVerificationBlocksAccess } from '../../utils/authFlow';
import { isOnboardingComplete } from '../../utils/onboardingGate';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

function nextPath(
  emailVerified: boolean,
  profile: import('../../types').User | null | undefined
): string {
  if (emailVerificationBlocksAccess(emailVerified)) return ROUTES.verifyEmail;
  if (!isOnboardingComplete(profile ?? null)) return ROUTES.onboarding;
  return ROUTES.feed;
}

type SignInFormProps = {
  showFirebaseNotice?: boolean;
  /** LinkedIn-style flat form for the public landing hero. */
  variant?: 'default' | 'landing';
};

export function SignInForm({
  showFirebaseNotice = true,
  variant = 'default',
}: SignInFormProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLanding = variant === 'landing';
  const inputClass = isLanding
    ? 'mt-1 rounded-md border-zinc-400/80 py-3 text-base dark:border-zinc-500'
    : 'mt-1.5';

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
      const cred = await signInWithEmailAndPassword(authSvc, authEmail, password);
      await cred.user.reload();
      navigate(nextPath(cred.user.emailVerified, profile ?? null), { replace: true });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {showFirebaseNotice ? <FirebaseNotice /> : null}
      <form className={isLanding ? 'space-y-5' : 'space-y-4'} onSubmit={onSubmit}>
        <div>
          <Label htmlFor="landing-email" className={isLanding ? 'text-sm font-semibold text-fg' : undefined}>
            {isLanding ? 'Email or institutional address' : 'Email'}
          </Label>
          <Input
            id="landing-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <Label htmlFor="landing-password" className={isLanding ? 'text-sm font-semibold text-fg' : undefined}>
            Password
          </Label>
          <div className="relative">
            <Input
              id="landing-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              className={`${inputClass} pr-14`}
            />
            {isLanding ? (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-brand"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            ) : null}
          </div>
          {!isLanding ? (
            <div className="mt-1.5 flex justify-end">
              <Link to={ROUTES.resetPassword} className="text-xs font-medium text-brand hover:underline">
                Forgot password?
              </Link>
            </div>
          ) : (
            <Link
              to={ROUTES.resetPassword}
              className="mt-2 inline-block text-sm font-semibold text-brand hover:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>
        {error ? (
          <p className="text-sm text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          className={`w-full py-3 ${isLanding ? '!rounded-full text-base font-semibold' : '!rounded-full'}`}
          disabled={submitting || !firebaseReady}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </>
  );
}
