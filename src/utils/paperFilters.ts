import type { Paper } from '../types';

export type PaperSort = 'newest' | 'year' | 'title';

export type PaperFilters = {
  query: string;
  yearFrom: string;
  yearTo: string;
  venue: string;
  hasArxivOnly: boolean;
  sort: PaperSort;
};

export const DEFAULT_PAPER_FILTERS: PaperFilters = {
  query: '',
  yearFrom: '',
  yearTo: '',
  venue: '',
  hasArxivOnly: false,
  sort: 'newest',
};

function parseYear(value: string): number | null {
  const t = value.trim();
  if (!t) return null;
  const y = parseInt(t, 10);
  if (Number.isNaN(y) || y < 1900 || y > 2100) return null;
  return y;
}

export function filterPapers(papers: Paper[], filters: PaperFilters): Paper[] {
  let rows = papers;
  const q = filters.query.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.authors.some((a) => a.toLowerCase().includes(q)) ||
        (p.venue ?? '').toLowerCase().includes(q) ||
        (p.abstract ?? '').toLowerCase().includes(q) ||
        (p.arxivId ?? '').toLowerCase().includes(q)
    );
  }
  const from = parseYear(filters.yearFrom);
  const to = parseYear(filters.yearTo);
  if (from != null) {
    rows = rows.filter((p) => (p.publicationYear ?? 0) >= from);
  }
  if (to != null) {
    rows = rows.filter((p) => (p.publicationYear ?? 9999) <= to);
  }
  if (filters.venue.trim()) {
    const v = filters.venue.trim().toLowerCase();
    rows = rows.filter((p) => (p.venue ?? '').toLowerCase().includes(v));
  }
  if (filters.hasArxivOnly) {
    rows = rows.filter((p) => Boolean(p.arxivId?.trim()));
  }

  const copy = [...rows];
  if (filters.sort === 'year') {
    copy.sort((a, b) => (b.publicationYear ?? 0) - (a.publicationYear ?? 0));
  } else if (filters.sort === 'title') {
    copy.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    copy.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  }
  return copy;
}

export type PaperFilterChip = { id: keyof PaperFilters; label: string };

export function paperFilterChips(filters: PaperFilters): PaperFilterChip[] {
  const chips: PaperFilterChip[] = [];
  if (filters.query.trim()) {
    chips.push({ id: 'query', label: `“${filters.query.trim()}”` });
  }
  if (filters.yearFrom || filters.yearTo) {
    chips.push({
      id: 'yearFrom',
      label:
        filters.yearFrom && filters.yearTo
          ? `${filters.yearFrom}–${filters.yearTo}`
          : filters.yearFrom
            ? `From ${filters.yearFrom}`
            : `Until ${filters.yearTo}`,
    });
  }
  if (filters.venue.trim()) chips.push({ id: 'venue', label: filters.venue.trim() });
  if (filters.hasArxivOnly) chips.push({ id: 'hasArxivOnly', label: 'Has arXiv' });
  if (filters.sort !== 'newest') {
    chips.push({
      id: 'sort',
      label: filters.sort === 'year' ? 'By year' : 'By title',
    });
  }
  return chips;
}

export function countPaperModalFilters(filters: PaperFilters): number {
  return paperFilterChips(filters).length;
}

export function hasActivePaperFilters(filters: PaperFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.yearFrom !== '' ||
    filters.yearTo !== '' ||
    filters.venue.trim() !== '' ||
    filters.hasArxivOnly ||
    filters.sort !== 'newest'
  );
}

export function clearPaperFilterChip(
  filters: PaperFilters,
  id: PaperFilterChip['id']
): PaperFilters {
  switch (id) {
    case 'yearFrom':
      return { ...filters, yearFrom: '', yearTo: '' };
    case 'yearTo':
      return { ...filters, yearTo: '' };
    case 'venue':
      return { ...filters, venue: '' };
    case 'hasArxivOnly':
      return { ...filters, hasArxivOnly: false };
    case 'sort':
      return { ...filters, sort: 'newest' };
    case 'query':
      return { ...filters, query: '' };
    default:
      return filters;
  }
}
