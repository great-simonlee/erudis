import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, firebaseReady } from '../lib/firebase';

/**
 * Keeps both edge subcollections and denormalized `following` / `followers` arrays
 * on user docs (feed rules and Discover "Following" use the arrays).
 */
export async function followUser(myUid: string, theirUid: string): Promise<void> {
  if (!db || !firebaseReady) return;
  const batch = writeBatch(db);
  batch.set(doc(db, 'users', myUid, 'following', theirUid), {
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, 'users', theirUid, 'followers', myUid), {
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, 'users', myUid), { following: arrayUnion(theirUid) });
  batch.update(doc(db, 'users', theirUid), { followers: arrayUnion(myUid) });
  await batch.commit();
}

export async function unfollowUser(myUid: string, theirUid: string): Promise<void> {
  if (!db || !firebaseReady) return;
  const batch = writeBatch(db);
  batch.delete(doc(db, 'users', myUid, 'following', theirUid));
  batch.delete(doc(db, 'users', theirUid, 'followers', myUid));
  batch.update(doc(db, 'users', myUid), { following: arrayRemove(theirUid) });
  batch.update(doc(db, 'users', theirUid), { followers: arrayRemove(myUid) });
  await batch.commit();
}

export async function isFollowingUser(myUid: string, theirUid: string): Promise<boolean> {
  if (!db || !firebaseReady) return false;
  const s = await getDoc(doc(db, 'users', myUid, 'following', theirUid));
  return s.exists();
}
