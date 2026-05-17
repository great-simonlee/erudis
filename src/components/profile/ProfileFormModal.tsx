import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { AppIcon, ICON_STROKE } from '../ui/AppIcon';
import { Button } from '../ui/Button';

type ProfileFormModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel: string;
  saving?: boolean;
  deleteAction?: ReactNode;
};

export function ProfileFormModal({
  open,
  title,
  subtitle,
  onClose,
  children,
  onSubmit,
  submitLabel,
  saving = false,
  deleteAction,
}: ProfileFormModalProps) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-form-modal-title"
        className="relative z-10 flex max-h-[min(92dvh,44rem)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-surface-card shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] sm:max-h-[min(88dvh,40rem)] sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border/80 px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-brand">
              Profile
            </p>
            <h2 id="profile-form-modal-title" className="mt-1 font-display text-xl text-fg">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised/80 text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg"
            aria-label="Close"
          >
            <AppIcon icon={X} size={18} strokeWidth={ICON_STROKE} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-border/80 bg-surface-card/95 px-5 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-h-[2.5rem] flex items-center">{deleteAction}</div>
          <div className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 sm:min-w-[7.5rem] sm:flex-none"
              disabled={saving}
              onClick={onSubmit}
            >
              {saving ? 'Saving…' : submitLabel}
            </Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
