import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Institution, Lab, User, UserRole } from '../types';

const MANAGEABLE_ROLES: UserRole[] = [
  'professor',
  'phd',
  'postdoc',
  'researcher',
  'research_scientist',
  'industry_researcher',
];

export function defaultInstitution(
  id: string,
  name: string,
  adminUserIds: string[] = []
): Omit<Institution, 'id'> & { id: string } {
  return {
    id,
    name,
    logoUrl: '',
    coverUrl: '',
    description: '',
    websiteUrl: '',
    adminUserIds,
    createdAt: null,
  };
}

export async function getInstitution(
  db: Firestore,
  institutionId: string
): Promise<Institution | null> {
  const snap = await getDoc(doc(db, 'institutions', institutionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Institution, 'id'>) };
}

/** Create institution doc if missing (e.g. when first lab is created). */
export async function ensureInstitutionDoc(
  db: Firestore,
  institutionId: string,
  name: string,
  adminUserIds: string[] = []
): Promise<Institution> {
  const ref = doc(db, 'institutions', institutionId);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    return { id: existing.id, ...(existing.data() as Omit<Institution, 'id'>) };
  }
  const row = defaultInstitution(institutionId, name, adminUserIds);
  await setDoc(ref, {
    name: row.name,
    logoUrl: '',
    coverUrl: '',
    description: '',
    websiteUrl: '',
    adminUserIds,
    createdAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return { id: snap.id, ...(snap.data() as Omit<Institution, 'id'>) };
}

export async function listLabsAtInstitution(
  db: Firestore,
  institutionId: string,
  institutionName?: string
): Promise<Lab[]> {
  const byId = await getDocs(
    query(collection(db, 'labs'), where('institutionId', '==', institutionId), limit(80))
  );
  const labs = byId.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lab, 'id'>) }));
  if (labs.length > 0 || !institutionName) return labs;

  const snap = await getDocs(query(collection(db, 'labs'), limit(120)));
  const nameNorm = institutionName.trim().toLowerCase();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Lab, 'id'>) }))
    .filter((l) => l.institutionName?.trim().toLowerCase() === nameNorm);
}

export async function listUsersAtInstitution(
  db: Firestore,
  institutionId: string
): Promise<User[]> {
  const snap = await getDocs(
    query(collection(db, 'users'), where('institutionId', '==', institutionId), limit(200))
  );
  return snap.docs
    .map((d) => ({ uid: d.id, ...(d.data() as Omit<User, 'uid'>) }))
    .filter((u) => MANAGEABLE_ROLES.includes(u.role) || u.role === 'institution_admin');
}

export async function updateInstitutionProfile(
  db: Firestore,
  institutionId: string,
  patch: Partial<Pick<Institution, 'name' | 'description' | 'websiteUrl'>>
): Promise<void> {
  const ref = doc(db, 'institutions', institutionId);
  const data: Record<string, string> = {};
  if (patch.name !== undefined) data.name = patch.name.trim();
  if (patch.description !== undefined) data.description = patch.description.trim();
  if (patch.websiteUrl !== undefined) data.websiteUrl = patch.websiteUrl.trim();
  if (Object.keys(data).length === 0) return;
  await setDoc(ref, data, { merge: true });
}

export async function updateInstitutionMemberRole(
  db: Firestore,
  uid: string,
  role: UserRole
): Promise<void> {
  await setDoc(doc(db, 'users', uid), { role }, { merge: true });
}

export async function mergeInstitutionLogos(
  db: Firestore,
  rows: { id: string; name: string }[]
): Promise<{ id: string; name: string; logoUrl?: string }[]> {
  const out: { id: string; name: string; logoUrl?: string }[] = [];
  for (const row of rows) {
    const inst = await getInstitution(db, row.id);
    out.push({ ...row, logoUrl: inst?.logoUrl || undefined });
  }
  return out;
}
