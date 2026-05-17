export function parseOptionalYear(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const year = parseInt(trimmed, 10);
  if (Number.isNaN(year) || year < 1900 || year > 2100) return null;
  return year;
}

export function parseAuthorsList(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatAuthorsList(authors: string[]): string {
  return authors.join(', ');
}

export function newProfileEntryId(): string {
  return crypto.randomUUID();
}
