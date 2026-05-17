import type { ProfileEducation, ProfileWorkExperience } from '../types';

export function formatProfileYearRange(
  startYear?: number | null,
  endYear?: number | null,
  isOngoing = false
): string | null {
  if (startYear == null && endYear == null) return null;
  if (startYear != null && endYear == null && isOngoing) return `${startYear} – Present`;
  if (startYear != null && endYear == null) return String(startYear);
  if (startYear == null && endYear != null) return String(endYear);
  if (startYear === endYear) return String(startYear);
  return `${startYear} – ${endYear}`;
}

export function sortProfileCareer<T extends { startYear?: number | null; endYear?: number | null }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const aEnd = a.endYear ?? 9999;
    const bEnd = b.endYear ?? 9999;
    if (bEnd !== aEnd) return bEnd - aEnd;
    return (b.startYear ?? 0) - (a.startYear ?? 0);
  });
}

export function educationSubtitle(entry: ProfileEducation): string {
  return [
    entry.degree,
    entry.field,
    formatProfileYearRange(entry.startYear, entry.endYear, entry.ongoing),
  ]
    .filter(Boolean)
    .join(' · ');
}

export function workExperienceSubtitle(entry: ProfileWorkExperience): string {
  return [
    entry.organization,
    entry.location,
    formatProfileYearRange(entry.startYear, entry.endYear, entry.ongoing),
  ]
    .filter(Boolean)
    .join(' · ');
}
