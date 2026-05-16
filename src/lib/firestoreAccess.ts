import { doc, getDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Post } from '../types';

/** Reads a post when rules allow; returns null on missing doc or permission denied. */
export async function getPostIfAllowed(
  db: Firestore,
  postId: string
): Promise<Post | null> {
  try {
    const snap = await getDoc(doc(db, 'posts', postId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Post, 'id'>) };
  } catch {
    return null;
  }
}
