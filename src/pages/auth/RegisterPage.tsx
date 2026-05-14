import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, firebaseReady } from '../../lib/firebase';
import { FirebaseNotice } from '../../components/shared/FirebaseNotice';
import { ROUTES } from '../../constants';
import { useCentralVerificationInbox } from '../../config/flags';
import { isAcademicEmail } from '../../utils/academicEmail';
import { mapAuthError } from '../../utils/authErrors';
import {
  CENTRAL_VERIFICATION_INBOX,
  institutionalToAuthEmail,
} from '../../utils/verificationInbox';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Label } from '../../components/ui/Label';

/** Non-alphanumeric counts as a special character for this rule. */
const PASSWORD_SPECIAL = /[^A-Za-z0-9]/;

function passwordRequirements(pw: string) {
  return {
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    digit: /\d/.test(pw),
    special: PASSWORD_SPECIAL.test(pw),
    lengthOver10: pw.length > 10,
  };
}

function passwordValid(pw: string): boolean {
  const r = passwordRequirements(pw);
  return r.lower && r.upper && r.digit && r.special && r.lengthOver10;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const academic = email.trim() ? isAcademicEmail(email.trim()) : null;
  const pwReq = passwordRequirements(password);
  const pwOk = password ? passwordValid(password) : null;
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const canSubmit =
    name.trim() &&
    email.trim() &&
    academic === true &&
    password &&
    pwOk === true &&
    passwordsMatch &&
    firebaseReady &&
    !submitting;

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [loading, user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const authSvc = auth;
    const dbSvc = db;
    if (!authSvc || !dbSvc) {
      setSubmitting(false);
      return;
    }
    try {
      const institutional = email.trim().toLowerCase();
      const authEmail = await institutionalToAuthEmail(institutional);
      const cred = await createUserWithEmailAndPassword(
        authSvc,
        authEmail,
        password
      );
      await updateProfile(cred.user, { displayName: name.trim() });
      await sendEmailVerification(cred.user);
      await setDoc(doc(dbSvc, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name: name.trim(),
        email: institutional,
        role: 'pending',
        institutionId: null,
        labIds: [],
        primaryLabId: null,
        researchAreas: [],
        following: [],
        followers: [],
        isVerified: false,
        openToCollaborate: false,
        collaborationTypes: [],
        openToWork: [],
        labOnboardingIntent: null,
        subscription: 'free',
        bio: '',
        avatarUrl: '',
        websiteUrl: '',
        institutionName: null,
        profileViews: 0,
        createdAt: serverTimestamp(),
      });
      navigate(ROUTES.verifyEmail, {
        replace: true,
        state: { institutionalEmail: institutional },
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console -- surfaced for local debugging when mapAuthError is generic
        console.error('[Register]', err);
      }
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-card rounded-card border border-border bg-surface-card p-8">
        <FirebaseNotice />
        <h1 className="font-display text-2xl text-fg">Join THE ERUDIS</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Verified academic network for professors, PhDs, postdocs, and
          researchers.
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Institutional email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
            />
            {email.trim() && academic === true && (
              <>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-brand">
                  <span aria-hidden>✓</span> Institutional email recognized
                </p>
                {useCentralVerificationInbox && (
                  <p className="mt-1.5 text-xs text-fg-subtle">
                    For this test build, verification links are sent to{' '}
                    <span className="text-fg-soft">
                      {CENTRAL_VERIFICATION_INBOX}
                    </span>{' '}
                    (plus-addressed for your account).
                  </p>
                )}
              </>
            )}
            {email.trim() && academic === false && (
              <p className="mt-1.5 text-xs text-red-400" role="alert">
                Please use your institutional email (.edu, .ac.kr, .ac.uk, .ac.jp,
                .edu.au, etc.)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              aria-describedby="password-requirements"
            />
            <ul
              id="password-requirements"
              className="mt-2 list-none space-y-1 text-xs text-fg-subtle"
            >
              <li
                className={
                  password && pwReq.lower ? 'text-brand' : 'text-fg-subtle'
                }
              >
                {password && pwReq.lower ? '✓ ' : '· '}
                One lowercase letter
              </li>
              <li
                className={
                  password && pwReq.upper ? 'text-brand' : 'text-fg-subtle'
                }
              >
                {password && pwReq.upper ? '✓ ' : '· '}
                One uppercase letter
              </li>
              <li
                className={
                  password && pwReq.digit ? 'text-brand' : 'text-fg-subtle'
                }
              >
                {password && pwReq.digit ? '✓ ' : '· '}
                One number
              </li>
              <li
                className={
                  password && pwReq.special ? 'text-brand' : 'text-fg-subtle'
                }
              >
                {password && pwReq.special ? '✓ ' : '· '}
                One special character
              </li>
              <li
                className={
                  password && pwReq.lengthOver10
                    ? 'text-brand'
                    : 'text-fg-subtle'
                }
              >
                {password && pwReq.lengthOver10 ? '✓ ' : '· '}
                More than 10 characters
              </li>
            </ul>
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm password</Label>
            <PasswordInput
              id="confirm-password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              required
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1.5 text-xs text-red-400" role="alert">
                Passwords do not match.
              </p>
            )}
            {confirmPassword.length > 0 && passwordsMatch && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-brand">
                <span aria-hidden>✓</span> Passwords match
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit}
            variant="primary"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-fg-subtle">
          Already have an account?{' '}
          <Link className="text-brand hover:underline" to={ROUTES.login}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
