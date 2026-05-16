import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import {
  LAB_NOTE_FRUIT_SHAPES,
  LAB_NOTE_PORTRAIT_SIZE,
  buildStoryPixelState,
  resolveFruitShapeId,
} from '../../constants/labNotePortraits';
import { filterWeekdayDates, weekdaysInYear } from '../../utils/timeAgo';
import { LabNotePixelGrid } from './LabNotePixelGrid';

export type ResearchActivityGraphProps = {
  loggedDates: readonly string[];
  fruitShapeId: string | undefined;
  /** Show a link to Settings to change fruit (own profile only). */
  showFruitSettingsLink?: boolean;
  currentStreak: number;
  longestStreak: number;
  totalLogDays: number;
  last30DayCount: number;
};

export function ResearchActivityGraph({
  loggedDates,
  fruitShapeId,
  showFruitSettingsLink = false,
  currentStreak,
  longestStreak,
  totalLogDays,
  last30DayCount,
}: ResearchActivityGraphProps) {
  const shapeId = resolveFruitShapeId(fruitShapeId);

  const pixelState = useMemo(
    () => buildStoryPixelState(shapeId, loggedDates),
    [shapeId, loggedDates]
  );

  const totalFruitCells = pixelState.fruitCellIndices.length;
  const filledCount = useMemo(
    () => pixelState.fills.filter(Boolean).length,
    [pixelState.fills]
  );

  const progressPct =
    totalFruitCells > 0 ? Math.round((filledCount / totalFruitCells) * 100) : 0;

  const weekdayLogCount = useMemo(
    () => filterWeekdayDates(loggedDates).length,
    [loggedDates]
  );
  const weekdaysThisYear = weekdaysInYear(new Date().getFullYear());
  const remaining = Math.max(0, totalFruitCells - filledCount);

  const activeMeta = LAB_NOTE_FRUIT_SHAPES.find((f) => f.id === shapeId);
  const accent = activeMeta?.accent ?? '#22c55e';

  return (
    <section className="overflow-hidden rounded-card border border-border bg-surface-card">
      <div className="border-b border-border/80 bg-gradient-to-b from-surface-raised/40 to-transparent px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-brand">
              Research ritual
            </p>
            <h2 className="mt-1 font-display text-xl text-fg sm:text-2xl">Lab-note story</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Paint a pixel fruit with weekday lab notes. Each note adds one colored square —
              weekends are rest days and do not fill the canvas.
            </p>
            {showFruitSettingsLink && activeMeta && (
              <p className="mt-2 text-xs text-fg-subtle">
                Growing {activeMeta.emoji} {activeMeta.name} ·{' '}
                <Link to={ROUTES.settings} className="text-brand hover:underline">
                  Change fruit in settings
                </Link>
              </p>
            )}
          </div>
          {currentStreak > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              <span className="text-sm font-medium tabular-nums text-brand">
                {currentStreak} day streak
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7 sm:py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10 xl:gap-14">
          <div className="w-full min-w-0 flex-1 lg:max-w-sm">
            <p className="text-xs font-medium text-fg-muted">
              {activeMeta ? (
                <>
                  {activeMeta.emoji} {activeMeta.name}
                </>
              ) : (
                'Your canvas'
              )}
            </p>
            <p className="mt-1 text-2xl font-medium tabular-nums tracking-tight text-fg">
              {progressPct}
              <span className="text-lg text-fg-subtle">%</span>
              <span className="ml-2 text-sm font-normal text-fg-subtle">complete</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-fg-subtle tabular-nums">
              <span className="text-fg">
                {filledCount} / {totalFruitCells} pixels
              </span>
              <span className="mx-1.5 text-fg-subtle/50">·</span>
              <span>
                {weekdayLogCount} weekday notes · ~{weekdaysThisYear}/yr
              </span>
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: accent,
                  boxShadow: progressPct > 0 ? `0 0 12px ${accent}88` : undefined,
                }}
              />
            </div>

            {remaining > 0 && progressPct < 100 && (
              <p className="mt-2 text-xs text-fg-subtle">
                {remaining} more weekday {remaining === 1 ? 'note' : 'notes'} to finish this fruit
              </p>
            )}
          </div>

          <div className="w-full shrink-0 self-center lg:w-auto lg:self-auto">
            <div className="relative mx-auto max-w-[min(100%,18.5rem)] lg:mx-0">
              <div
                className="pointer-events-none absolute -inset-6 rounded-[2rem] opacity-60 blur-2xl transition-opacity duration-700"
                style={{
                  background: `radial-gradient(circle at 50% 45%, ${accent}33 0%, transparent 70%)`,
                  opacity: progressPct > 0 ? 0.5 + progressPct / 200 : 0.25,
                }}
                aria-hidden
              />
              <div className="relative rounded-2xl border border-white/[0.06] bg-[#080b10] p-3 shadow-[inset_0_2px_12px_rgba(0,0,0,0.45)] sm:p-4">
                <LabNotePixelGrid
                  size={LAB_NOTE_PORTRAIT_SIZE}
                  templateColors={pixelState.template}
                  fills={pixelState.fills}
                  ghostTemplate
                  aria-label={`Lab-note story ${progressPct} percent complete`}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[11px] text-fg-subtle lg:justify-start">
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block size-3 rounded-[2px] border border-white/5"
              style={{ backgroundColor: '#121820' }}
            />
            Unfilled
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block size-3 rounded-[2px] opacity-50"
              style={{
                backgroundColor: `color-mix(in srgb, ${accent} 34%, #121820)`,
              }}
            />
            Preview
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block size-3 rounded-[2px] ring-1 ring-white/20"
              style={{ backgroundColor: accent }}
            />
            Your note
          </span>
            </div>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
        {[
          { label: 'Notes logged', value: totalLogDays },
          { label: 'Current streak', value: currentStreak },
          { label: 'Longest streak', value: longestStreak },
          { label: 'Last 30 days', value: last30DayCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-card px-4 py-3.5 text-center sm:px-5 sm:py-4 sm:text-left"
          >
            <dt className="text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
              {stat.label}
            </dt>
            <dd className="mt-1 font-display text-xl tabular-nums text-fg sm:text-2xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
