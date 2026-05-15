const MS_DAY = 86_400_000;

export function formatTimeAgo(isoOrTimestamp: { toDate?: () => Date } | Date | null): string {
  if (!isoOrTimestamp) return '';
  const d =
    typeof (isoOrTimestamp as { toDate?: () => Date }).toDate === 'function'
      ? (isoOrTimestamp as { toDate: () => Date }).toDate()
      : (isoOrTimestamp as Date);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 14) return `${day}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function utcIsoDate(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, delta: number): string {
  const t = Date.parse(`${iso}T12:00:00.000Z`) + delta * MS_DAY;
  return new Date(t).toISOString().slice(0, 10);
}
