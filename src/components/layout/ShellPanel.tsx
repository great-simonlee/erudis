import type { ReactNode } from 'react';

export type ShellPanelAccent = 'brand' | 'amber' | 'sky' | 'violet' | 'neutral';

const accentBar: Record<ShellPanelAccent, string> = {
  brand: 'bg-brand',
  amber: 'bg-amber-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  neutral: 'bg-border',
};

type ShellPanelProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: ShellPanelAccent;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
};

function panelHeadingId(title: string): string {
  return `panel-${title.replace(/\s+/g, '-').toLowerCase()}`;
}

export function ShellPanel({
  title,
  subtitle,
  icon,
  accent = 'neutral',
  children,
  className = '',
  footer,
}: ShellPanelProps) {
  const headingId = panelHeadingId(title);

  return (
    <section className={`erudis-panel overflow-hidden ${className}`} aria-labelledby={headingId}>
      <div className={`h-1 w-full ${accentBar[accent]}`} aria-hidden />
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-2.5">
          {icon ? (
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised text-fg-muted">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 id={headingId} className="font-display text-sm tracking-tight text-fg">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-[11px] leading-snug text-fg-subtle">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="mt-3">{children}</div>
        {footer ? <div className="mt-3 border-t border-border pt-3">{footer}</div> : null}
      </div>
    </section>
  );
}
