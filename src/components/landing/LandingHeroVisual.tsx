type LandingHeroVisualProps = {
  compact?: boolean;
};

/** Decorative hero illustration — research network motif. */
export function LandingHeroVisual({ compact = false }: LandingHeroVisualProps) {
  return (
    <div
      className={`relative mx-auto aspect-square w-full ${compact ? 'max-w-[17rem] sm:max-w-sm lg:max-w-lg' : 'max-w-lg'}`}
      aria-hidden
    >
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-brand/20 via-brand/5 to-transparent" />
      <div className="absolute inset-0 rounded-[2rem] border border-brand/15 bg-surface-card shadow-xl shadow-brand/5">
        <svg viewBox="0 0 400 400" className="h-full w-full p-8" fill="none">
          <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1" className="text-brand/25" />
          <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="1" className="text-brand/35" />
          <circle cx="120" cy="140" r="28" fill="currentColor" className="text-brand/30" />
          <circle cx="280" cy="130" r="22" fill="currentColor" className="text-brand/40" />
          <circle cx="300" cy="250" r="32" fill="currentColor" className="text-brand/25" />
          <circle cx="110" cy="260" r="24" fill="currentColor" className="text-brand/35" />
          <circle cx="200" cy="200" r="18" fill="currentColor" className="text-brand" />
          <path
            d="M148 140 L200 200 M252 130 L200 200 M268 250 L200 200 M134 260 L200 200"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-brand/50"
          />
          <rect x="60" y="60" width="48" height="64" rx="6" className="fill-surface-raised stroke-brand/30" strokeWidth="1.5" />
          <rect x="290" y="70" width="56" height="40" rx="6" className="fill-surface-raised stroke-brand/30" strokeWidth="1.5" />
          <path
            d="M72 100 h32 M72 108 h24 M72 116 h28"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-brand/40"
          />
        </svg>
      </div>
      {!compact ? (
        <>
          <div className="absolute -bottom-2 left-8 rounded-xl border border-border bg-surface-card px-4 py-3 shadow-lg">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">Research ritual</p>
            <p className="mt-0.5 text-sm font-medium text-fg">12-day streak</p>
          </div>
          <div className="absolute -right-2 top-12 rounded-xl border border-border bg-surface-card px-4 py-3 shadow-lg">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">Lab verified</p>
            <p className="mt-0.5 text-sm font-medium text-fg">Rivera Lab · MIT</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
