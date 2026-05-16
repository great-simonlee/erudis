import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getPostIfAllowed } from '../lib/firestoreAccess';
import {
  DEMO_ECOSYSTEM_POST_IDS,
  DEMO_ECOSYSTEM_USER_IDS,
} from './demoEcosystemIds';
import { followUser } from '../utils/follow';

async function userExists(db: Firestore, uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists();
}

/**
 * If Admin seed personas exist, follow them and mirror their public posts into the home feed.
 */
export async function linkCurrentUserToDemoEcosystem(
  db: Firestore,
  uid: string
): Promise<{ followed: number; feedItems: number }> {
  let followed = 0;
  for (const demoUid of DEMO_ECOSYSTEM_USER_IDS) {
    if (demoUid === uid) continue;
    if (!(await userExists(db, demoUid))) continue;
    try {
      await followUser(uid, demoUid);
      followed++;
    } catch {
      /* already following or rules */
    }
  }

  let batch = writeBatch(db);
  let ops = 0;
  let feedItems = 0;

  const commitIfNeeded = async () => {
    if (ops >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  };

  for (const postId of DEMO_ECOSYSTEM_POST_IDS) {
    const post = await getPostIfAllowed(db, postId);
    if (!post || post.visibility !== 'public') continue;

    const itemRef = doc(db, 'feed', uid, 'items', postId);
    batch.set(itemRef, {
      postId,
      authorId: post.authorId,
      createdAt: post.createdAt ?? serverTimestamp(),
    });
    ops++;
    feedItems++;
    await commitIfNeeded();
  }

  if (ops > 0) await batch.commit();

  return { followed, feedItems };
}
