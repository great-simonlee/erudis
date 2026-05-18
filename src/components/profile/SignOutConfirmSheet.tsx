import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';

type SignOutConfirmSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  signingOut?: boolean;
};

export function SignOutConfirmSheet({
  open,
  onClose,
  onConfirm,
  signingOut = false,
}: SignOutConfirmSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !signingOut) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, signingOut]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
        aria-label="Cancel sign out"
        disabled={signingOut}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-out-sheet-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl border border-red-200/60 bg-surface-card shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] dark:border-red-900/50 sm:rounded-2xl"
      >
        <div className="flex justify-center pt-3" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="px-5 pb-2 pt-4 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-red-600 dark:text-red-400">
            Sign out
          </p>
          <h2 id="sign-out-sheet-title" className="mt-2 font-display text-xl text-fg">
            Leave THE ERUDIS?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            You will return to the public home page. Your session on this device will end until you
            sign in again.
          </p>
        </div>

        <footer className="flex flex-col gap-2 border-t border-border/80 px-5 py-4 sm:flex-row-reverse sm:px-6">
          <Button
            type="button"
            className="w-full border-red-500/50 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 sm:min-w-[9rem]"
            disabled={signingOut}
            onClick={onConfirm}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:min-w-[9rem]"
            disabled={signingOut}
            onClick={onClose}
          >
            Cancel
          </Button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
