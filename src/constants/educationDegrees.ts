/** Preset degree labels for education entries. */
export const EDUCATION_DEGREE_OPTIONS = [
  'Ph.D.',
  'D.Sc.',
  'M.S.',
  'M.Sc.',
  'M.A.',
  'M.Eng.',
  'MBA',
  'M.Phil.',
  'B.S.',
  'B.Sc.',
  'B.A.',
  'B.Eng.',
  'B.B.A.',
  'Associate',
  'Certificate',
  'Postdoctoral',
] as const;

export type EducationDegreeOption = (typeof EDUCATION_DEGREE_OPTIONS)[number];

export const EDUCATION_DEGREE_OTHER = '__other__';

export function isPresetEducationDegree(
  value: string | undefined | null
): value is EducationDegreeOption {
  if (!value) return false;
  return (EDUCATION_DEGREE_OPTIONS as readonly string[]).includes(value);
}

export function resolveEducationDegreeForForm(degree: string | undefined): {
  select: string;
  other: string;
} {
  if (!degree) return { select: '', other: '' };
  if (isPresetEducationDegree(degree)) return { select: degree, other: '' };
  return { select: EDUCATION_DEGREE_OTHER, other: degree };
}

export function educationDegreeFromForm(select: string, other: string): string | undefined {
  if (!select) return undefined;
  if (select === EDUCATION_DEGREE_OTHER) {
    const trimmed = other.trim();
    return trimmed || undefined;
  }
  return select;
}
