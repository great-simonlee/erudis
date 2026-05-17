import type { LabSearchResult } from './labSearch';

export type LabExploreSort = 'featured' | 'name' | 'members';

export type LabExploreFilters = {
  query: string;
  researchArea: string;
  sort: LabExploreSort;
  minMembers: string;
};

export const DEFAULT_LAB_EXPLORE_FILTERS: LabExploreFilters = {
  query: '',
  researchArea: '',
  sort: 'featured',
  minMembers: '',
};

export function filterLabExploreResults(
  rows: LabSearchResult[],
  filters: LabExploreFilters,
  preserveOrder: boolean
): LabSearchResult[] {
  let list = rows;
  const q = filters.query.trim().toLowerCase();
  if (q) {
    list = list.filter(({ lab, piName }) => {
      const hay = [
        lab.name,
        lab.institutionName,
        lab.department,
        lab.description,
        piName,
        ...(lab.researchAreas ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }
  if (filters.researchArea) {
    const area = filters.researchArea.toLowerCase();
    list = list.filter(({ lab }) =>
      lab.researchAreas?.some((a) => a.toLowerCase().includes(area))
    );
  }
  const min = parseInt(filters.minMembers.trim(), 10);
  if (!Number.isNaN(min) && min > 0) {
    list = list.filter(({ lab }) => lab.memberIds.length >= min);
  }

  if (preserveOrder && filters.sort === 'featured') return list;

  const copy = [...list];
  if (filters.sort === 'name') {
    copy.sort((a, b) => a.lab.name.localeCompare(b.lab.name));
  } else if (filters.sort === 'members') {
    copy.sort((a, b) => b.lab.memberIds.length - a.lab.memberIds.length);
  }
  return copy;
}

export type LabExploreFilterChip = { id: keyof LabExploreFilters; label: string };

export function labExploreFilterChips(filters: LabExploreFilters): LabExploreFilterChip[] {
  const chips: LabExploreFilterChip[] = [];
  if (filters.query.trim()) {
    chips.push({ id: 'query', label: `“${filters.query.trim()}”` });
  }
  if (filters.researchArea) chips.push({ id: 'researchArea', label: filters.researchArea });
  if (filters.minMembers.trim()) {
    chips.push({ id: 'minMembers', label: `${filters.minMembers}+ members` });
  }
  if (filters.sort !== 'featured') {
    chips.push({
      id: 'sort',
      label: filters.sort === 'name' ? 'Sort: name' : 'Sort: team size',
    });
  }
  return chips;
}

export function countLabExploreModalFilters(filters: LabExploreFilters): number {
  return labExploreFilterChips(filters).length;
}

export function hasActiveLabExploreFilters(filters: LabExploreFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.researchArea !== '' ||
    filters.sort !== 'featured' ||
    filters.minMembers.trim() !== ''
  );
}

export function clearLabExploreFilterChip(
  filters: LabExploreFilters,
  id: LabExploreFilterChip['id']
): LabExploreFilters {
  switch (id) {
    case 'researchArea':
      return { ...filters, researchArea: '' };
    case 'minMembers':
      return { ...filters, minMembers: '' };
    case 'sort':
      return { ...filters, sort: 'featured' };
    case 'query':
      return { ...filters, query: '' };
    default:
      return filters;
  }
}
