import { addDaysIso, utcIsoDate } from './timeAgo';

export type StreakStats = {
  currentStreak: number;
  longestStreak: number;
  totalLogDays: number;
  last30DayCount: number;
};

function normalizeDates(loggedDates: readonly string[]): string[] {
  return Array.from(new Set(loggedDates.filter(Boolean))).sort();
}

function longestConsecutiveRun(sortedAsc: string[]): number {
  if (sortedAsc.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = sortedAsc[i - 1]!;
    const cur = sortedAsc[i]!;
    if (addDaysIso(prev, 1) === cur) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

function currentStreakFromToday(logged: Set<string>): number {
  const today = utcIsoDate();
  const yesterday = addDaysIso(today, -1);
  let cursor: string;
  if (logged.has(today)) {
    cursor = today;
  } else if (logged.has(yesterday)) {
    cursor = yesterday;
  } else {
    return 0;
  }
  let streak = 0;
  while (logged.has(cursor)) {
    streak++;
    cursor = addDaysIso(cursor, -1);
  }
  return streak;
}

export function calculateStreak(loggedDates: readonly string[]): StreakStats {
  const sorted = normalizeDates(loggedDates);
  const set = new Set(sorted);
  const today = utcIsoDate();
  const cutoff = addDaysIso(today, -29);
  let last30 = 0;
  for (const d of sorted) {
    if (d >= cutoff && d <= today) last30++;
  }
  return {
    currentStreak: currentStreakFromToday(set),
    longestStreak: longestConsecutiveRun(sorted),
    totalLogDays: set.size,
    last30DayCount: last30,
  };
}
