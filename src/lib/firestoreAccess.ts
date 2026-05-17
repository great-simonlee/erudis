import { doc, getDoc, type DocumentReference } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Post } from '../types';

/** Single-doc read that never throws (permission denied, offline, etc.). */
export async function safeGetDoc(ref: DocumentReference) {
  try {
    return await getDoc(ref);
  } catch {
    return null;
  }
}

/** Reads a post when rules allow; returns null on missing doc or permission denied. */
export async function getPostIfAllowed(
  db: Firestore,
  postId: string
): Promise<Post | null> {
  const snap = await safeGetDoc(doc(db, 'posts', postId));
  if (!snap?.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Post, 'id'>) };
}
