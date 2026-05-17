export const COLORS = {
  brand: '#1D9E75',
  background: '#0a0a0a',
  card: '#141414',
  border: '#222222',
} as const;

export const ROUTES = {
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  resetPassword: '/reset-password',
  onboarding: '/onboarding',
  feed: '/feed',
  discover: '/discover',
  labs: '/labs',
  labExplore: '/labs/explore',
  papers: '/papers',
  jobs: '/jobs',
  messages: '/messages',
  settings: '/settings',
  profile: (uid: string) => `/profile/${uid}`,
  profileLogs: (uid: string) => `/profile/${uid}/logs`,
  lab: (id: string) => `/lab/${id}`,
  labCreate: '/lab/create',
  labSettings: (id: string) => `/lab/${id}/settings`,
  institution: (id: string) => `/institution/${id}`,
  institutionManage: (id: string) => `/institution/${id}/manage`,
  brief: '/brief',
  pricing: '/pricing',
  job: (id: string) => `/jobs/${id}`,
  jobsPost: '/jobs/post',
} as const;

export { RESEARCH_FIELD_CATALOG } from './researchFields';
/** @deprecated Prefer RESEARCH_FIELD_CATALOG — same list, kept for older imports. */
export { RESEARCH_FIELD_CATALOG as FIELD_CATEGORIES } from './researchFields';

export type FieldCategory = string;
