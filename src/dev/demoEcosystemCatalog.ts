import {
  DEMO_ECOSYSTEM_LAB_IDS,
  DEMO_ECOSYSTEM_USER_IDS,
} from './demoEcosystemIds';

/** Canonical demo personas (must match `npm run seed:firestore`). */
export const DEMO_FEATURED_PEOPLE = [
  {
    uid: DEMO_ECOSYSTEM_USER_IDS[0],
    name: 'Dr. Elena Rivera',
    role: 'professor' as const,
    institution: 'MIT',
  },
  {
    uid: DEMO_ECOSYSTEM_USER_IDS[1],
    name: 'Dr. James Chen',
    role: 'professor' as const,
    institution: 'Stanford',
  },
  {
    uid: DEMO_ECOSYSTEM_USER_IDS[3],
    name: 'Jordan Kim',
    role: 'phd' as const,
    institution: 'MIT',
  },
  {
    uid: DEMO_ECOSYSTEM_USER_IDS[4],
    name: 'Maya Santos',
    role: 'phd' as const,
    institution: 'Stanford',
  },
  {
    uid: DEMO_ECOSYSTEM_USER_IDS[5],
    name: 'Dr. Priya Lee',
    role: 'postdoc' as const,
    institution: 'Cambridge',
  },
] as const;

export const DEMO_FEATURED_LAB_IDS = [...DEMO_ECOSYSTEM_LAB_IDS];

export const DEMO_BOOTSTRAP_STORAGE_KEY = 'erudis_demo_ecosystem_linked_v2';
