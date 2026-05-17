import type { ReactNode } from 'react';

type ProfileSectionPanelProps = {
  /** Small uppercase label above the title (e.g. "Research ritual"). */
  eyebrow?: string;
  title: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function ProfileSectionPanel({
  eyebrow,
  title,
  description,
  headerAction,
  children,
  footer,
  className = '',
}: ProfileSectionPanelProps) {
  const headingId = `profile-section-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <section
      className={`overflow-hidden rounded-card border border-border bg-surface-card shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_28px_-14px_rgba(0,0,0,0.5)] ${className}`}
      aria-labelledby={headingId}
    >
      <div className="px-5 py-6 sm:px-7 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {eyebrow ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-brand">
                {eyebrow}
              </p>
            ) : null}
            <h2
              id={headingId}
              className={`font-display text-xl text-fg sm:text-2xl ${eyebrow ? 'mt-2' : ''}`}
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted">{description}</p>
            ) : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>

        <div className={description || eyebrow ? 'mt-5' : 'mt-4'}>{children}</div>

        {footer ? <div className="mt-5 border-t border-border/80 pt-4">{footer}</div> : null}
      </div>
    </section>
  );
}

export function ProfileSectionEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border bg-surface-raised/40 px-4 py-8 text-center text-sm text-fg-muted">
      {children}
    </p>
  );
}
