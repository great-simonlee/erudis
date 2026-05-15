import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import type { Post, PostVisibility } from '../types';

const BATCH_LIMIT = 400;

export type NewPostInput = {
  authorId: string;
  title: string;
  content: string;
  type: Post['type'];
  tags: string[];
  researchArea: string;
  visibility: PostVisibility;
  labId: string | null;
  institutionId: string | null;
};

function buildFeedPayload(
  uid: string,
  postId: string,
  authorId: string,
  now: ReturnType<typeof serverTimestamp>,
  input: NewPostInput,
  authorFollowersFromUserDoc: string[]
): { postId: string; authorId: string; createdAt: ReturnType<typeof serverTimestamp>; sourceLabId?: string } {
  const base = { postId, authorId, createdAt: now };
  if (!input.labId) return base;
  if (uid === authorId) return base;
  const followsAuthor = authorFollowersFromUserDoc.includes(uid);
  if (input.visibility === 'public' && followsAuthor) return base;
  if (input.visibility === 'members_only' && followsAuthor) return base;
  return { ...base, sourceLabId: input.labId };
}

export async function createPostAndFanOut(
  db: Firestore,
  input: NewPostInput
): Promise<string> {
  const postRef = doc(collection(db, 'posts'));
  const postId = postRef.id;
  const now = serverTimestamp();

  const post: Omit<Post, 'id'> = {
    authorId: input.authorId,
    labId: input.labId,
    institutionId: input.institutionId,
    type: input.type,
    title: input.title.trim(),
    content: input.content.trim(),
    attachments: [],
    tags: input.tags,
    researchArea: input.researchArea,
    resonateCount: 0,
    viewCount: 0,
    commentCount: 0,
    visibility: input.visibility,
    isPendingApproval: false,
    createdAt: null,
    updatedAt: null,
  };

  const authorSnap = await getDoc(doc(db, 'users', input.authorId));
  const followers: string[] = authorSnap.exists()
    ? ((authorSnap.data() as { followers?: string[] }).followers ?? [])
    : [];

  let labMemberIds: string[] = [];
  let labFollowerIds: string[] = [];
  if (input.labId) {
    const labSnap = await getDoc(doc(db, 'labs', input.labId));
    if (labSnap.exists()) {
      labMemberIds = (labSnap.data() as { memberIds?: string[] }).memberIds ?? [];
    }
    const followerSnap = await getDocs(collection(db, 'labs', input.labId, 'followers'));
    labFollowerIds = followerSnap.docs.map((d) => d.id);
  }

  const feedTargets = new Set<string>();
  feedTargets.add(input.authorId);

  if (input.visibility === 'public') {
    followers.forEach((id) => feedTargets.add(id));
    if (input.labId) {
      labFollowerIds.forEach((id) => feedTargets.add(id));
    }
  } else if (input.visibility === 'members_only') {
    if (input.labId) {
      labMemberIds.forEach((id) => feedTargets.add(id));
    }
  }

  let batch = writeBatch(db);
  let ops = 0;
  const commitIfNeeded = async () => {
    if (ops >= BATCH_LIMIT) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  };

  batch.set(postRef, { ...post, createdAt: now, updatedAt: now });
  ops++;
  await commitIfNeeded();

  for (const uid of Array.from(feedTargets)) {
    const itemRef = doc(db, 'feed', uid, 'items', postId);
    const payload = buildFeedPayload(uid, postId, input.authorId, now, input, followers);
    batch.set(itemRef, payload);
    ops++;
    if (ops >= BATCH_LIMIT) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  }

  if (ops > 0) {
    await batch.commit();
  }

  return postId;
}
