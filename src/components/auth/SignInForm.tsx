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
};

export function SignInForm({ showFirebaseNotice = true }: SignInFormProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <form className="space-y-4" onSubmit={onSubmit} id="sign-in">
        <div>
          <Label htmlFor="landing-email">Email</Label>
          <Input
            id="landing-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="landing-password" className="mb-0">
              Password
            </Label>
            <Link to={ROUTES.resetPassword} className="text-xs font-medium text-brand hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="landing-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
          />
        </div>
        {error ? (
          <p className="text-sm text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full !rounded-full py-3" disabled={submitting || !firebaseReady}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </>
  );
}
