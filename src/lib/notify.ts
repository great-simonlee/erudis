import { addDoc, collection, serverTimestamp, type Firestore } from 'firebase/firestore';

export async function notifyResonate(
  db: Firestore,
  args: {
    fromUserId: string;
    postAuthorId: string;
    postId: string;
    postTitle: string;
  }
): Promise<void> {
  if (args.fromUserId === args.postAuthorId) return;
  await addDoc(collection(db, 'notifications', args.postAuthorId, 'items'), {
    type: 'resonate',
    fromUserId: args.fromUserId,
    targetUserId: args.postAuthorId,
    postId: args.postId,
    postTitle: args.postTitle.slice(0, 200),
    labId: null,
    labName: null,
    message: 'Liked your post.',
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

export async function notifyFollow(
  db: Firestore,
  args: { followerId: string; followeeId: string; followerName: string }
): Promise<void> {
  await addDoc(collection(db, 'notifications', args.followeeId, 'items'), {
    type: 'follow',
    fromUserId: args.followerId,
    targetUserId: args.followeeId,
    postId: null,
    postTitle: null,
    labId: null,
    labName: null,
    message: `${args.followerName} started following you.`,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}
