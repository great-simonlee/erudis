import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Post } from '../types';

function isMissingIndexError(err: unknown): boolean {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : '';
  const msg = err instanceof Error ? err.message : String(err);
  return code === 'failed-precondition' || msg.includes('requires an index');
}

/** Posts attached to a lab, newest first. */
export async function loadPostsForLab(db: Firestore, labId: string): Promise<Post[]> {
  const base = collection(db, 'posts');
  try {
    const snap = await getDocs(
      query(base, where('labId', '==', labId), orderBy('createdAt', 'desc'), limit(40))
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }));
  } catch (err) {
    if (!isMissingIndexError(err)) throw err;
    const snap = await getDocs(query(base, where('labId', '==', labId), limit(40)));
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }));
    rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
    return rows;
  }
}
