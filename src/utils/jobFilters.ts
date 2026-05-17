import type { JobPost } from '../types';

export const JOB_POSITION_TYPES = [
  'Tenure-track',
  'Postdoc',
  'PhD Position',
  'Research Scientist',
  'Industry',
] as const;

export const JOB_LOCATION_REGIONS = ['USA', 'Europe', 'Asia', 'Remote'] as const;

export type JobRemoteFilter = 'any' | 'remote' | 'onsite';
export type JobSort = 'newest' | 'deadline';

export type JobFilters = {
  query: string;
  positionType: string;
  location: string;
  field: string;
  remote: JobRemoteFilter;
  sort: JobSort;
};

export const DEFAULT_JOB_FILTERS: JobFilters = {
  query: '',
  positionType: '',
  location: '',
  field: '',
  remote: 'any',
  sort: 'newest',
};

export function jobSearchHaystack(job: JobPost): string {
  return [
    job.title,
    job.description,
    job.institutionName,
    job.department,
    job.location,
    job.positionType,
    job.remote ? 'remote hybrid work from home' : 'on-site onsite',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchesLocation(job: JobPost, region: string): boolean {
  const loc = (job.location ?? '').toLowerCase();
  const hay = jobSearchHaystack(job);
  if (region === 'Remote') {
    return job.remote === true || loc.includes('remote') || hay.includes('remote');
  }
  const key = region.toLowerCase();
  return loc.includes(key) || hay.includes(key);
}

function matchesPositionType(job: JobPost, type: string): boolean {
  const hay = (job.positionType ?? '').toLowerCase();
  const key = type.toLowerCase();
  return hay.includes(key) || job.title.toLowerCase().includes(key);
}

function matchesField(job: JobPost, field: string): boolean {
  const hay = `${job.title} ${job.description}`.toLowerCase();
  return hay.includes(field.toLowerCase());
}

function matchesRemote(job: JobPost, remote: JobRemoteFilter): boolean {
  if (remote === 'any') return true;
  if (remote === 'remote') {
    return job.remote === true || (job.location ?? '').toLowerCase().includes('remote');
  }
  return job.remote !== true;
}

function sortJobs(rows: JobPost[], sort: JobSort): JobPost[] {
  const copy = [...rows];
  if (sort === 'deadline') {
    copy.sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
      const db = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
      if (Number.isNaN(da)) return 1;
      if (Number.isNaN(db)) return -1;
      return da - db;
    });
    return copy;
  }
  copy.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  return copy;
}

export function filterJobs(jobs: JobPost[], filters: JobFilters): JobPost[] {
  let rows = jobs;
  const q = filters.query.trim().toLowerCase();

  if (q) {
    rows = rows.filter((job) => jobSearchHaystack(job).includes(q));
  }
  if (filters.positionType) {
    rows = rows.filter((job) => matchesPositionType(job, filters.positionType));
  }
  if (filters.location) {
    rows = rows.filter((job) => matchesLocation(job, filters.location));
  }
  if (filters.field) {
    rows = rows.filter((job) => matchesField(job, filters.field));
  }
  rows = rows.filter((job) => matchesRemote(job, filters.remote));

  return sortJobs(rows, filters.sort);
}

export function hasActiveJobFilters(filters: JobFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.positionType !== '' ||
    filters.location !== '' ||
    filters.field !== '' ||
    filters.remote !== 'any' ||
    filters.sort !== 'newest'
  );
}

export type JobFilterChip = {
  id: keyof JobFilters | 'sort';
  label: string;
};

export function countJobModalFilters(filters: JobFilters): number {
  return jobFilterChips(filters).filter((c) => c.id !== 'query').length;
}

export function jobFilterChips(filters: JobFilters): JobFilterChip[] {
  const chips: JobFilterChip[] = [];
  if (filters.query.trim()) {
    chips.push({ id: 'query', label: `Search: “${filters.query.trim()}”` });
  }
  if (filters.positionType) {
    chips.push({ id: 'positionType', label: filters.positionType });
  }
  if (filters.location) {
    chips.push({ id: 'location', label: filters.location });
  }
  if (filters.field) {
    chips.push({ id: 'field', label: filters.field });
  }
  if (filters.remote === 'remote') {
    chips.push({ id: 'remote', label: 'Remote only' });
  }
  if (filters.remote === 'onsite') {
    chips.push({ id: 'remote', label: 'On-site' });
  }
  if (filters.sort === 'deadline') {
    chips.push({ id: 'sort', label: 'Deadline soonest' });
  }
  return chips;
}

export function clearJobFilterChip(filters: JobFilters, chipId: JobFilterChip['id']): JobFilters {
  switch (chipId) {
    case 'query':
      return { ...filters, query: '' };
    case 'positionType':
      return { ...filters, positionType: '' };
    case 'location':
      return { ...filters, location: '' };
    case 'field':
      return { ...filters, field: '' };
    case 'remote':
      return { ...filters, remote: 'any' };
    case 'sort':
      return { ...filters, sort: 'newest' };
    default:
      return filters;
  }
}
