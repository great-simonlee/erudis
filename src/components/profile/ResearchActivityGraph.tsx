import { useMemo } from 'react';
import { addDaysIso, utcIsoDate } from '../../utils/timeAgo';

const ROW_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

function mondayUtcOfWeek(iso: string): string {
  const t = Date.parse(`${iso}T12:00:00.000Z`);
  const d = new Date(t);
  const dow = d.getUTCDay();
  const delta = dow === 0 ? -6 : 1 - dow;
  return addDaysIso(iso, delta);
}

export type ResearchActivityGraphProps = {
  loggedDates: readonly string[];
  currentStreak: number;
  longestStreak: number;
  totalLogDays: number;
  last30DayCount: number;
};

export function ResearchActivityGraph({
  loggedDates,
  currentStreak,
  longestStreak,
  totalLogDays,
  last30DayCount,
}: ResearchActivityGraphProps) {
  const set = useMemo(() => new Set(loggedDates), [loggedDates]);
  const today = utcIsoDate();
  const thisMonday = mondayUtcOfWeek(today);
  const gridStart = addDaysIso(thisMonday, -51 * 7);
  const weeks = 52;
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = '';
  for (let c = 0; c < weeks; c++) {
    const mon = addDaysIso(gridStart, c * 7);
    const m = new Date(`${mon}T12:00:00.000Z`).toLocaleString('en-US', {
      month: 'short',
      timeZone: 'UTC',
    });
    if (m !== lastMonth) {
      monthLabels.push({ col: c, label: m });
      lastMonth = m;
    }
  }

  return (
    <section className="rounded-card border border-border bg-surface-card p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-lg text-fg">Research activity</h2>
        {currentStreak > 0 && (
          <span className="text-sm font-medium text-brand">
            🔥 {currentStreak} day streak
          </span>
        )}
      </div>

      <div className="mt-4 overflow-x-auto pb-2">
        <div className="inline-flex min-w-max flex-col gap-1">
          <div
            className="mb-1 grid gap-1 text-[10px] text-fg-subtle"
            style={{ gridTemplateColumns: `14px repeat(${weeks}, 13px)` }}
          >
            <span />
            {Array.from({ length: weeks }, (_, c) => {
              const ml = monthLabels.find((m) => m.col === c);
              return (
                <span key={c} className="text-center">
                  {ml ? ml.label : ''}
                </span>
              );
            })}
          </div>
          <div className="flex gap-1">
            <div className="flex w-[14px] flex-col justify-between py-0.5 text-[9px] leading-none text-fg-subtle">
              {ROW_LABELS.map((lab, i) => (
                <div key={i} style={{ height: 13 }} className="flex items-center">
                  {lab}
                </div>
              ))}
            </div>
            <div
              className="grid gap-[3px]"
              style={{
                gridTemplateColumns: `repeat(${weeks}, 13px)`,
                gridTemplateRows: 'repeat(7, 13px)',
              }}
            >
              {Array.from({ length: weeks * 7 }, (_, i) => {
                const col = i % weeks;
                const row = Math.floor(i / weeks);
                const iso = addDaysIso(gridStart, col * 7 + row);
                const on = set.has(iso);
                const title = `${iso} · ${on ? 'Logged' : 'No entry'}`;
                return (
                  <div
                    key={iso}
                    title={title}
                    className={`rounded-[2px] ${on ? 'bg-brand' : 'bg-[#1e1e1e]'}`}
                    style={{ width: 13, height: 13 }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-fg-subtle">Total log days</dt>
          <dd className="font-medium text-fg">{totalLogDays}</dd>
        </div>
        <div>
          <dt className="text-fg-subtle">Current streak</dt>
          <dd className="font-medium text-fg">{currentStreak}</dd>
        </div>
        <div>
          <dt className="text-fg-subtle">Longest streak</dt>
          <dd className="font-medium text-fg">{longestStreak}</dd>
        </div>
        <div>
          <dt className="text-fg-subtle">Last 30 days</dt>
          <dd className="font-medium text-fg">{last30DayCount}</dd>
        </div>
      </dl>
    </section>
  );
}
