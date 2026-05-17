import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Comment, User } from '../types';

/** Maximum nesting levels for replies (top-level = depth 0). */
export const MAX_COMMENT_DEPTH = 5;

export type CommentWithAuthor = Comment & {
  authorName: string;
};

export type CommentNode = CommentWithAuthor & {
  children: CommentNode[];
};

/** 0-based depth of a comment in the thread (top-level = 0). */
export function getCommentDepth(
  comments: readonly { id: string; parentCommentId: string | null }[],
  commentId: string
): number {
  const byId = new Map(comments.map((c) => [c.id, c]));
  let depth = 0;
  let current = byId.get(commentId);
  while (current?.parentCommentId) {
    const parent = byId.get(current.parentCommentId);
    if (!parent) break;
    depth += 1;
    current = parent;
  }
  return depth;
}

export function canReplyToComment(
  comments: readonly { id: string; parentCommentId: string | null }[],
  parentCommentId: string
): boolean {
  return getCommentDepth(comments, parentCommentId) < MAX_COMMENT_DEPTH - 1;
}

export function buildCommentTree(comments: CommentWithAuthor[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  for (const c of comments) {
    nodes.set(c.id, { ...c, children: [] });
  }
  const roots: CommentNode[] = [];
  for (const c of comments) {
    const node = nodes.get(c.id)!;
    const parentId = c.parentCommentId;
    if (parentId && nodes.has(parentId)) {
      nodes.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function loadPostComments(postId: string): Promise<CommentWithAuthor[]> {
  const firestore = db;
  if (!firestore) return [];
  const qy = query(
    collection(firestore, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc'),
    limit(120)
  );
  const snap = await getDocs(qy);
  const list: Comment[] = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Comment, 'id'>),
  }));

  const authorIds = Array.from(new Set(list.map((c) => c.authorId)));
  const names = new Map<string, string>();
  await Promise.all(
    authorIds.map(async (uid) => {
      try {
        const uSnap = await getDoc(doc(firestore, 'users', uid));
        if (uSnap.exists()) {
          const data = uSnap.data() as Omit<User, 'uid'>;
          names.set(uid, data.name?.trim() || 'Member');
        } else {
          names.set(uid, 'Member');
        }
      } catch {
        names.set(uid, 'Member');
      }
    })
  );

  return list.map((c) => ({
    ...c,
    authorName: names.get(c.authorId) ?? 'Member',
  }));
}
