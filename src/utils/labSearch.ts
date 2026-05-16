import {
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
  where,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Lab, User, UserRole } from '../types';

export type LabSearchResult = {
  lab: Lab;
  piName: string;
  piUid: string;
  piRole: UserRole | null;
};

const PI_ROLES: UserRole[] = ['professor', 'research_scientist', 'postdoc'];

function matchesTerm(haystack: string | null | undefined, term: string): boolean {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(term);
}

async function fetchPi(
  db: Firestore,
  uid: string,
  cache: Map<string, { name: string; role: UserRole | null }>
): Promise<{ name: string; role: UserRole | null }> {
  const hit = cache.get(uid);
  if (hit) return hit;
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) {
    const fallback = { name: 'Unknown PI', role: null };
    cache.set(uid, fallback);
    return fallback;
  }
  const u = snap.data() as Omit<User, 'uid'>;
  const row = { name: u.name ?? 'Unknown PI', role: u.role ?? null };
  cache.set(uid, row);
  return row;
}

function labFromDoc(id: string, data: Omit<Lab, 'id'>): Lab {
  return { id, ...data };
}

function namePrefixVariants(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  const variants = new Set<string>([t]);
  const capped = t.charAt(0).toUpperCase() + t.slice(1);
  variants.add(capped);
  variants.add(t.toLowerCase());
  variants.add(t.toUpperCase());
  return Array.from(variants);
}

async function labsByNamePrefix(
  db: Firestore,
  prefix: string
): Promise<Lab[]> {
  const snap = await getDocs(
    query(
      collection(db, 'labs'),
      orderBy('name'),
      startAt(prefix),
      endAt(`${prefix}\uf8ff`),
      limit(20)
    )
  );
  return snap.docs.map((d) => labFromDoc(d.id, d.data() as Omit<Lab, 'id'>));
}

async function professorsByNamePrefix(
  db: Firestore,
  prefix: string
): Promise<{ uid: string; user: Omit<User, 'uid'> }[]> {
  const snap = await getDocs(
    query(
      collection(db, 'users'),
      orderBy('name'),
      startAt(prefix),
      endAt(`${prefix}\uf8ff`),
      limit(15)
    )
  );
  return snap.docs
    .map((d) => ({ uid: d.id, user: d.data() as Omit<User, 'uid'> }))
    .filter((row) => PI_ROLES.includes(row.user.role));
}

/** Search labs by name, institution, research area, or PI (professor) name. */
export async function searchLabsAndProfessors(
  db: Firestore,
  rawQuery: string,
  maxResults = 24
): Promise<LabSearchResult[]> {
  const term = rawQuery.trim().toLowerCase();
  if (term.length < 2) return [];

  const piCache = new Map<string, { name: string; role: UserRole | null }>();
  const byLabId = new Map<string, LabSearchResult>();

  const addLab = async (lab: Lab) => {
    if (byLabId.has(lab.id)) return;
    const pi = await fetchPi(db, lab.piId, piCache);
    byLabId.set(lab.id, {
      lab,
      piName: pi.name,
      piUid: lab.piId,
      piRole: pi.role,
    });
  };

  const prefixes = namePrefixVariants(rawQuery);
  const labCandidates: Lab[] = [];

  for (const prefix of prefixes) {
    try {
      const rows = await labsByNamePrefix(db, prefix);
      labCandidates.push(...rows);
    } catch {
      /* index may be building */
    }
  }

  const seenLab = new Set<string>();
  for (const lab of labCandidates) {
    if (seenLab.has(lab.id)) continue;
    seenLab.add(lab.id);
    const pi = await fetchPi(db, lab.piId, piCache);
    const nameMatch = matchesTerm(lab.name, term);
    const instMatch = matchesTerm(lab.institutionName, term);
    const piMatch = matchesTerm(pi.name, term);
    const areaMatch = lab.researchAreas?.some((a) => matchesTerm(a, term));
    if (nameMatch || instMatch || piMatch || areaMatch) {
      await addLab(lab);
    }
  }

  const seenProf = new Set<string>();
  for (const prefix of prefixes) {
    let profs: { uid: string; user: Omit<User, 'uid'> }[] = [];
    try {
      profs = await professorsByNamePrefix(db, prefix);
    } catch {
      continue;
    }
    for (const { uid, user } of profs) {
      if (seenProf.has(uid)) continue;
      seenProf.add(uid);
      if (
        !matchesTerm(user.name, term) &&
        !matchesTerm(user.institutionName, term)
      ) {
        continue;
      }
      piCache.set(uid, { name: user.name ?? 'Unknown PI', role: user.role ?? null });

      try {
        const labsSnap = await getDocs(
          query(collection(db, 'labs'), where('piId', '==', uid), limit(8))
        );
        for (const ld of labsSnap.docs) {
          await addLab(labFromDoc(ld.id, ld.data() as Omit<Lab, 'id'>));
        }
      } catch {
        /* ignore */
      }
    }
  }

  const results = Array.from(byLabId.values());
  results.sort((a, b) => {
    const aPi = matchesTerm(a.piName, term) ? 0 : 1;
    const bPi = matchesTerm(b.piName, term) ? 0 : 1;
    if (aPi !== bPi) return aPi - bPi;
    return a.lab.name.localeCompare(b.lab.name);
  });

  return results.slice(0, maxResults);
}
