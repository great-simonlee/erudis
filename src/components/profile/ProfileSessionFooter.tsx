import { useState } from 'react';
import { ChevronRight, LogOut } from 'lucide-react';
import { useLogOut } from '../../hooks/useLogOut';
import { SignOutConfirmSheet } from './SignOutConfirmSheet';
import { AppIcon, ICON_STROKE } from '../ui/AppIcon';

type ProfileSessionFooterProps = {
  email?: string | null;
};

export function ProfileSessionFooter({ email }: ProfileSessionFooterProps) {
  const { logOut, signingOut } = useLogOut();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
    <section
      className="overflow-hidden rounded-card border border-red-200/70 bg-surface-card shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:border-red-900/50 dark:shadow-[0_8px_28px_-14px_rgba(0,0,0,0.5)]"
      aria-label="Account session"
    >
      <div className="border-b border-border/80 bg-surface-raised/40 px-5 py-4 sm:px-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-brand">Session</p>
        <p className="mt-1.5 truncate text-sm text-fg-muted">
          {email ? (
            <>
              Signed in as <span className="font-medium text-fg-soft">{email}</span>
            </>
          ) : (
            'Signed in to your account'
          )}
        </p>
      </div>

      <button
        type="button"
        disabled={signingOut}
        onClick={() => setConfirmOpen(true)}
        className="group flex w-full items-center gap-3 border-t border-red-100/80 bg-red-50/30 px-5 py-4 text-left transition-colors hover:bg-red-50/80 disabled:opacity-60 dark:border-red-950/60 dark:bg-red-950/20 dark:hover:bg-red-950/35 sm:px-7"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100/80 text-red-600 ring-1 ring-red-200/80 transition-colors group-hover:bg-red-100 group-hover:text-red-700 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-900/80 dark:group-hover:bg-red-950/70">
          <AppIcon icon={LogOut} size={18} strokeWidth={ICON_STROKE} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-red-800 dark:text-red-300">
            {signingOut ? 'Signing out…' : 'Sign out'}
          </span>
          <span className="mt-0.5 block text-xs text-red-700/70 dark:text-red-400/70">
            Return to the public home page
          </span>
        </span>
        <AppIcon
          icon={ChevronRight}
          size={18}
          strokeWidth={ICON_STROKE}
          className="shrink-0 text-red-400/80 transition-transform group-hover:translate-x-0.5 group-hover:text-red-600 dark:text-red-500/80"
        />
      </button>
    </section>

      <SignOutConfirmSheet
        open={confirmOpen}
        signingOut={signingOut}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void logOut()}
      />
    </>
  );
}
