import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, firebaseReady } from '../../lib/firebase';
import { FirebaseNotice } from '../../components/shared/FirebaseNotice';
import { ROUTES } from '../../constants';
import { useCentralVerificationInbox } from '../../config/flags';
import { mapAuthError } from '../../utils/authErrors';
import {
  CENTRAL_VERIFICATION_INBOX,
  institutionalToAuthEmail,
} from '../../utils/verificationInbox';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      const institutional = email.trim().toLowerCase();
      const authEmail = await institutionalToAuthEmail(institutional);
      await sendPasswordResetEmail(authSvc, authEmail);
      setSent(true);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-card rounded-card border border-border bg-surface-card p-8">
        <FirebaseNotice />
        <h1 className="font-display text-2xl text-fg">Reset password</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Enter your account email and we will send a reset link.
        </p>

        {sent ? (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-fg-muted">
              If an account exists for{' '}
              <span className="text-fg">{email.trim().toLowerCase()}</span>, we
              sent password reset instructions.
            </p>
            {useCentralVerificationInbox ? (
              <p className="text-sm text-fg-muted">
                In this test build, check{' '}
                <span className="text-fg-soft">{CENTRAL_VERIFICATION_INBOX}</span>{' '}
                for the message (plus-addressed for your account).
              </p>
            ) : (
              <p className="text-sm text-fg-muted">
                Check that inbox for a link to choose a new password.
              </p>
            )}
            <Link
              to={ROUTES.login}
              className="inline-block text-sm text-brand hover:underline"
            >
              Back to log in
            </Link>
          </div>
        ) : (
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
            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={submitting || !firebaseReady}>
              {submitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-fg-subtle">
          <Link className="text-brand hover:underline" to={ROUTES.login}>
            Return to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
