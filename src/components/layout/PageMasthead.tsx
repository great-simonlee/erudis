import type { ReactNode } from 'react';

type PageMastheadProps = {
  label: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageMasthead({ label, title, description, actions }: PageMastheadProps) {
  return (
    <header className="erudis-masthead mb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">{label}</p>
          <h1 className="mt-1 font-display text-2xl text-fg md:text-[1.75rem]">{title}</h1>
          {description ? (
            <p className="mt-2 hidden max-w-2xl text-sm leading-relaxed text-fg-muted sm:block">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
