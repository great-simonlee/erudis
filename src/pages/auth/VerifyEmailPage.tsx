import { useCallback, useEffect, useState, type SVGProps } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { requireEmailVerification, useCentralVerificationInbox } from '../../config/flags';
import { emailVerificationBlocksAccess } from '../../utils/authFlow';
import { isOnboardingComplete } from '../../utils/onboardingGate';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { auth } from '../../lib/firebase';
import { CENTRAL_VERIFICATION_INBOX } from '../../utils/verificationInbox';

type VerifyLocationState = { institutionalEmail?: string };

function IconMail(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8.25V17a1 1 0 001 1h16a1 1 0 001-1V8.25M3 8.25 10.52 6.466a1 1 0 011.002-.216L12 10.5l7.998-2.45a1 1 0 011.002.216L21 8.25M3 8.25l8.25 5.5a1 1 0 001.5 0L21 8.25"
      />
    </svg>
  );
}

function IconLink(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07L9 6M14 11a5 5 0 00-7.07 0L5.52 12.41a5 5 0 007.07 7.07L15 18"
      />
    </svg>
  );
}

function IconSpark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
      />
    </svg>
  );
}

export function VerifyEmailPage() {
  const { user, profile, profileLoading, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cooldown, setCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [copyHint, setCopyHint] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    if (!requireEmailVerification) {
      navigate(
        isOnboardingComplete(profile) ? ROUTES.feed : ROUTES.onboarding,
        { replace: true }
      );
      return;
    }
    if (!emailVerificationBlocksAccess(user.emailVerified)) {
      navigate(
        isOnboardingComplete(profile) ? ROUTES.feed : ROUTES.onboarding,
        { replace: true }
      );
    }
  }, [loading, user, profile, navigate]);

  useEffect(() => {
    if (!user || user.emailVerified) return;
    const id = window.setInterval(async () => {
      try {
        await user.reload();
        if (user.emailVerified) {
          navigate(ROUTES.feed, { replace: true });
        }
      } catch {
        /* ignore */
      }
    }, 3000);
    return () => window.clearInterval(id);
  }, [user, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const resend = useCallback(async () => {
    if (!user || cooldown > 0) return;
    setResendMsg(null);
    try {
      await sendEmailVerification(user);
      setCooldown(60);
      setResendMsg('Verification email sent.');
    } catch {
      setResendMsg('Could not resend. Try again shortly.');
    }
  }, [user, cooldown]);

  const copyDeliveryAddress = useCallback(async () => {
    const target = user?.email;
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target);
      setCopyHint('Copied delivery address.');
      window.setTimeout(() => setCopyHint(null), 2500);
    } catch {
      setCopyHint('Could not copy — select the address and copy manually.');
      window.setTimeout(() => setCopyHint(null), 4000);
    }
  }, [user?.email]);

  const steps = useCentralVerificationInbox
    ? ([
        {
          n: 1,
          title: `Check ${CENTRAL_VERIFICATION_INBOX}`,
          body: `Firebase does not send to your institutional address in this test mode. Open the mailbox for ${CENTRAL_VERIFICATION_INBOX}, search for "firebase" or "noreply", and check spam. The To field shows the technical address below.`,
          icon: IconMail,
        },
        {
          n: 2,
          title: 'Tap the secure link',
          body: 'There is no code to type — confirmation happens in one click in the browser.',
          icon: IconLink,
        },
        {
          n: 3,
          title: 'Return here',
          body: 'Keep this tab open. When the link succeeds, we move you forward automatically.',
          icon: IconSpark,
        },
      ] as const)
    : ([
        {
          n: 1,
          title: 'Open the message',
          body: 'Look for an email from Firebase or THE ERUDIS in your inbox and spam folder.',
          icon: IconMail,
        },
        {
          n: 2,
          title: 'Tap the secure link',
          body: 'There is no code to type — confirmation happens in one click in the browser.',
          icon: IconLink,
        },
        {
          n: 3,
          title: 'Return here',
          body: 'Keep this tab open. When the link succeeds, we move you forward automatically.',
          icon: IconSpark,
        },
      ] as const);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="w-full max-w-card rounded-2xl border border-border bg-surface-card px-8 py-12 text-center shadow-lg shadow-black/20">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent"
            aria-hidden
          />
          <p className="mt-6 text-sm text-fg-muted">Preparing your verification…</p>
        </div>
      </div>
    );
  }

  const state = location.state as VerifyLocationState | null;
  const displayEmail =
    state?.institutionalEmail ??
    profile?.email ??
    (!profileLoading ? user.email : null);

  const addr =
    displayEmail ??
    (profileLoading ? null : user.email) ??
    '';

  const deliveryEmail = user.email ?? '';

  async function handleDifferentEmail() {
    if (auth) await signOut(auth);
    navigate(ROUTES.register, { replace: true });
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(29,158,117,0.12),transparent)]"
        aria-hidden
      />

      <div className="relative w-full max-w-card">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-card shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.65)]">
          <div className="h-1 bg-gradient-to-r from-brand/40 via-brand to-brand-muted" aria-hidden />

          <div className="px-6 pb-8 pt-7 sm:px-10 sm:pb-10 sm:pt-9">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-brand">
              <IconMail className="h-7 w-7" strokeWidth={1.5} />
            </div>

            <h1 className="mt-6 text-center font-display text-2xl tracking-tight text-fg sm:text-[1.65rem]">
              Verify your email
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-fg-muted">
              Almost there — use the secure link we sent to finish setting up your account.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
                  Your profile email
                </p>
                <div className="flex justify-center">
                  <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-border bg-surface-raised px-4 py-2.5 shadow-inner">
                    <span className="shrink-0 rounded-md bg-brand/15 p-1 text-brand" aria-hidden>
                      <IconMail className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 truncate font-mono text-[13px] text-fg-soft">
                      {addr || 'your institutional email'}
                    </span>
                  </div>
                </div>
              </div>

              {useCentralVerificationInbox && deliveryEmail && (
                <div>
                  <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
                    Where Firebase sends the link (check this inbox)
                  </p>
                  <div className="flex flex-col gap-2 rounded-xl border border-brand/30 bg-brand/5 px-3 py-3 sm:flex-row sm:items-center sm:gap-3">
                    <code className="min-w-0 flex-1 break-all text-left font-mono text-[12px] leading-snug text-fg-soft">
                      {deliveryEmail}
                    </code>
                    <button
                      type="button"
                      onClick={() => void copyDeliveryAddress()}
                      className="shrink-0 rounded-lg border border-brand/40 bg-brand/15 px-3 py-2 text-xs font-medium text-brand transition-colors hover:bg-brand/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Copy address
                    </button>
                  </div>
                  {copyHint && (
                    <p className="mt-2 text-center text-xs text-fg-muted" role="status">
                      {copyHint}
                    </p>
                  )}
                </div>
              )}
            </div>

            <ol className="mt-8 space-y-0" aria-label="Steps to verify">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.n}
                    className={`relative flex gap-4 ${
                      i < steps.length - 1 ? 'pb-6' : ''
                    }`}
                  >
                    {i < steps.length - 1 && (
                      <span
                        className="absolute left-[13px] top-8 bottom-0 w-px bg-gradient-to-b from-border to-transparent"
                        aria-hidden
                      />
                    )}
                    <span
                      className="relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand/35 bg-brand/15 text-xs font-semibold tabular-nums text-brand"
                      aria-hidden
                    >
                      {step.n}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-fg-subtle" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-fg">{step.title}</p>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-fg-muted">{step.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {useCentralVerificationInbox && (
              <div className="mt-8 rounded-xl border border-border bg-surface-raised/80 px-4 py-3.5 sm:px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                  Why not misaeng.com?
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                  This app registers you with your institutional address, but Firebase delivers
                  verification to the <span className="text-fg-soft">info+…@theerudis.com</span>{' '}
                  alias so you can use one mailbox while testing. Your host must deliver plus-tags
                  to <span className="font-mono text-[13px] text-fg-soft">{CENTRAL_VERIFICATION_INBOX}</span>
                  . For local-only testing, set{' '}
                  <code className="rounded bg-surface-card px-1 py-0.5 font-mono text-[11px] text-fg-soft">
                    useCentralVerificationInbox
                  </code>{' '}
                  to <code className="rounded bg-surface-card px-1 py-0.5 font-mono text-[11px]">false</code>{' '}
                  in <code className="rounded bg-surface-card px-1 py-0.5 font-mono text-[11px]">src/config/flags.ts</code>{' '}
                  so mail goes straight to the address you typed.
                </p>
              </div>
            )}

            <div
              className="mt-8 flex items-center justify-center gap-2.5 text-xs text-fg-subtle"
              aria-live="polite"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              <span>Listening for verification — no refresh needed.</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <Button
                type="button"
                variant="primary"
                className="w-full sm:flex-1"
                onClick={resend}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend link (${cooldown}s)` : 'Resend verification link'}
              </Button>
            </div>

            {resendMsg && (
              <p
                className="mt-3 text-center text-sm text-fg-muted"
                role="status"
                aria-live="polite"
              >
                {resendMsg}
              </p>
            )}

            <div className="mt-8 border-t border-border pt-6 text-center">
              <button
                type="button"
                className="text-sm text-brand/90 underline-offset-4 transition-colors hover:text-brand hover:underline"
                onClick={() => void handleDifferentEmail()}
              >
                Use a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
