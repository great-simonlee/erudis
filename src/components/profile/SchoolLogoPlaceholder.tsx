type SchoolLogoPlaceholderProps = {
  school: string;
  /** Optional institution logo URL (future). Falls back to profile-style initial. */
  logoUrl?: string | null;
  className?: string;
};

export function SchoolLogoPlaceholder({
  school,
  logoUrl,
  className = '',
}: SchoolLogoPlaceholderProps) {
  const initial = school.trim().slice(0, 1).toUpperCase() || '?';

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-zinc-200 dark:bg-zinc-800 ${className}`}
      aria-hidden
    >
      {logoUrl ? (
        <img src={logoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-semibold text-fg-muted">{initial}</span>
      )}
    </div>
  );
}
