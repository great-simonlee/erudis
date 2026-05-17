type SectionLabelProps = {
  title: string;
  hint?: string;
};

export function SectionLabel({ title, hint }: SectionLabelProps) {
  return (
    <div className="erudis-section-label mb-4 flex items-center justify-between gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-fg">{title}</h2>
      {hint ? <span className="text-[11px] text-fg-subtle tabular-nums">{hint}</span> : null}
    </div>
  );
}
