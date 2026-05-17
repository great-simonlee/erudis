import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { AppIcon, ICON_STROKE } from '../ui/AppIcon';
import { Button } from '../ui/Button';

type FilterModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  children: ReactNode;
  applyLabel?: string;
};

export function FilterModal({
  open,
  title,
  subtitle,
  onClose,
  onApply,
  onReset,
  children,
  applyLabel = 'Apply filters',
}: FilterModalProps) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        className="relative z-10 flex max-h-[min(92dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-surface-card shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border/80 px-5 py-4">
          <div className="min-w-0">
            <h2 id="filter-modal-title" className="font-display text-xl text-fg">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        <footer className="flex shrink-0 gap-2 border-t border-border/80 bg-surface-card/95 px-5 py-4 backdrop-blur-sm">
          <Button type="button" variant="ghost" className="text-fg-muted" onClick={onReset}>
            Reset
          </Button>
          <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="flex-1 sm:min-w-[8rem]" onClick={onApply}>
            {applyLabel}
          </Button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
