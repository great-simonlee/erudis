import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import {
  DEMO_ECOSYSTEM_POST_IDS,
  DEMO_ECOSYSTEM_USER_IDS,
} from '../dev/demoEcosystemIds';
import { DEMO_FEATURED_LAB_IDS } from '../dev/demoEcosystemCatalog';
import { getPostIfAllowed } from './firestoreAccess';
import type { JobPost, Lab, Post, User } from '../types';

const DEMO_PROBE_UID = DEMO_ECOSYSTEM_USER_IDS[0];

export async function isDemoEcosystemAvailable(db: Firestore): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', DEMO_PROBE_UID));
  return snap.exists();
}

export async function loadFeaturedLabs(db: Firestore): Promise<Lab[]> {
  const labs: Lab[] = [];
  for (const id of DEMO_FEATURED_LAB_IDS) {
    const snap = await getDoc(doc(db, 'labs', id));
    if (snap.exists()) {
      labs.push({ id: snap.id, ...(snap.data() as Omit<Lab, 'id'>) });
    }
  }
  return labs;
}

export async function loadFeaturedLabSearchResults(db: Firestore) {
  const labs = await loadFeaturedLabs(db);
  if (labs.length === 0) return [];

  const piCache = new Map<string, { name: string; role: User['role'] | null }>();
  const results = [];
  for (const lab of labs) {
    let pi = piCache.get(lab.piId);
    if (!pi) {
      const piSnap = await getDoc(doc(db, 'users', lab.piId));
      if (piSnap.exists()) {
        const u = piSnap.data() as Omit<User, 'uid'>;
        pi = { name: u.name ?? 'PI', role: u.role ?? null };
      } else {
        pi = { name: 'PI', role: null };
      }
      piCache.set(lab.piId, pi);
    }
    results.push({
      lab,
      piName: pi.name,
      piUid: lab.piId,
      piRole: pi.role,
    });
  }
  return results;
}

export async function loadTrendingDemoPosts(db: Firestore): Promise<Post[]> {
  const rows: Post[] = [];
  for (const id of DEMO_ECOSYSTEM_POST_IDS) {
    const post = await getPostIfAllowed(db, id);
    if (post?.visibility === 'public') rows.push(post);
  }
  rows.sort((a, b) => (b.resonateCount ?? 0) - (a.resonateCount ?? 0));
  return rows.slice(0, 5);
}

export async function loadOpenDemoJobs(db: Firestore): Promise<JobPost[]> {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'jobs'),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(6)
      )
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobPost, 'id'>) }));
  } catch {
    return [];
  }
}

export async function loadRecentPapers(db: Firestore, max = 40): Promise<
  (import('../types').Paper & { id: string })[]
> {
  try {
    const snap = await getDocs(
      query(collection(db, 'papers'), orderBy('createdAt', 'desc'), limit(max))
    );
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<import('../types').Paper, 'id'>),
    }));
  } catch {
    return [];
  }
}
