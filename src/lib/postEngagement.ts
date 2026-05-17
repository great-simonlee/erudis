import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import type { Post } from '../types';

const BATCH_LIMIT = 400;

/** Fan-out a public post to all of the resonator's followers (amplification). */
export async function fanOutResonateToFollowers(
  db: Firestore,
  args: {
    postId: string;
    postAuthorId: string;
    resonatorId: string;
  }
): Promise<void> {
  const postSnap = await getDoc(doc(db, 'posts', args.postId));
  if (!postSnap.exists()) return;
  const post = postSnap.data() as Omit<Post, 'id'>;
  if (post.visibility !== 'public') return;

  const resonatorSnap = await getDoc(doc(db, 'users', args.resonatorId));
  if (!resonatorSnap.exists()) return;
  const followers: string[] =
    (resonatorSnap.data() as { followers?: string[] }).followers ?? [];

  const now = serverTimestamp();
  let batch = writeBatch(db);
  let ops = 0;

  for (const followerId of followers) {
    if (followerId === args.resonatorId) continue;
    const itemRef = doc(db, 'feed', followerId, 'items', args.postId);
    batch.set(
      itemRef,
      {
        postId: args.postId,
        authorId: args.postAuthorId,
        createdAt: now,
        sourceResonatorId: args.resonatorId,
      },
      { merge: true }
    );
    ops++;
    if (ops >= BATCH_LIMIT) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  }

  if (ops > 0) await batch.commit();
}

export async function togglePostLike(
  db: Firestore,
  args: {
    postId: string;
    postAuthorId: string;
    viewerUid: string;
    currentlyLiked: boolean;
  }
): Promise<boolean> {
  const likeRef = doc(db, 'posts', args.postId, 'likes', args.viewerUid);
  const postRef = doc(db, 'posts', args.postId);
  const next = !args.currentlyLiked;

  if (next) {
    await setDoc(likeRef, { userId: args.viewerUid, createdAt: serverTimestamp() });
    await updateDoc(postRef, { likeCount: increment(1) });
  } else {
    await deleteDoc(likeRef);
    await updateDoc(postRef, { likeCount: increment(-1) });
  }
  return next;
}

export async function togglePostResonate(
  db: Firestore,
  args: {
    postId: string;
    postAuthorId: string;
    viewerUid: string;
    currentlyResonated: boolean;
  }
): Promise<boolean> {
  const resonateRef = doc(db, 'posts', args.postId, 'resonates', args.viewerUid);
  const postRef = doc(db, 'posts', args.postId);
  const next = !args.currentlyResonated;

  if (next) {
    await setDoc(resonateRef, { userId: args.viewerUid, createdAt: serverTimestamp() });
    await updateDoc(postRef, { resonateCount: increment(1) });
    await fanOutResonateToFollowers(db, {
      postId: args.postId,
      postAuthorId: args.postAuthorId,
      resonatorId: args.viewerUid,
    });
  } else {
    await deleteDoc(resonateRef);
    await updateDoc(postRef, { resonateCount: increment(-1) });
  }
  return next;
}
