import type { Post, PostType } from '../types';

export const DISCOVER_POST_TYPES: { value: PostType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'update', label: 'Update' },
  { value: 'result', label: 'Result' },
  { value: 'paper', label: 'Paper' },
  { value: 'paper_review', label: 'Paper review' },
  { value: 'idea', label: 'Idea' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'question', label: 'Question' },
];

export type DiscoverFilters = {
  query: string;
  field: string;
  postType: string;
};

export const DEFAULT_DISCOVER_FILTERS: DiscoverFilters = {
  query: '',
  field: '',
  postType: '',
};

export function filterDiscoverPosts(posts: Post[], filters: DiscoverFilters): Post[] {
  let rows = posts;
  const q = filters.query.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    );
  }
  if (filters.postType) {
    rows = rows.filter((p) => p.type === filters.postType);
  }
  return rows;
}

export type DiscoverFilterChip = { id: keyof DiscoverFilters; label: string };

export function discoverFilterChips(filters: DiscoverFilters): DiscoverFilterChip[] {
  const chips: DiscoverFilterChip[] = [];
  if (filters.query.trim()) {
    chips.push({ id: 'query', label: `“${filters.query.trim()}”` });
  }
  if (filters.field) chips.push({ id: 'field', label: filters.field });
  if (filters.postType) {
    const label = DISCOVER_POST_TYPES.find((t) => t.value === filters.postType)?.label ?? filters.postType;
    chips.push({ id: 'postType', label });
  }
  return chips;
}

export function countDiscoverModalFilters(filters: DiscoverFilters): number {
  return discoverFilterChips(filters).length;
}

export function hasActiveDiscoverFilters(filters: DiscoverFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.field !== '' ||
    filters.postType !== ''
  );
}

export function clearDiscoverFilterChip(
  filters: DiscoverFilters,
  id: DiscoverFilterChip['id']
): DiscoverFilters {
  if (id === 'field') return { ...filters, field: '' };
  if (id === 'postType') return { ...filters, postType: '' };
  if (id === 'query') return { ...filters, query: '' };
  return filters;
}
