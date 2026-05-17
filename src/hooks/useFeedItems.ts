import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, firebaseReady } from '../lib/firebase';
import { getPostIfAllowed, safeGetDoc } from '../lib/firestoreAccess';
import type { FeedItem, Lab, Post, User } from '../types';

export type FeedRow = {
  feedDoc?: QueryDocumentSnapshot;
  post: Post;
  author: User | null;
  lab: Lab | null;
};

const PAGE = 15;

async function resolveFeedDocs(
  fs: NonNullable<typeof db>,
  feedDocs: QueryDocumentSnapshot[]
): Promise<FeedRow[]> {
  const resolved: FeedRow[] = [];
  for (const fd of feedDocs) {
    const data = fd.data() as FeedItem;
    const postId = data.postId;
    if (!postId) continue;
    const post = await getPostIfAllowed(fs, postId);
    if (!post) continue;
    const authorSnap = await safeGetDoc(doc(fs, 'users', post.authorId));
    const author = authorSnap?.exists()
      ? ({ uid: authorSnap.id, ...(authorSnap.data() as Omit<User, 'uid'>) } as User)
      : null;
    let lab: Lab | null = null;
    if (post.labId) {
      const labSnap = await safeGetDoc(doc(fs, 'labs', post.labId));
      if (labSnap?.exists()) {
        lab = { id: labSnap.id, ...(labSnap.data() as Omit<Lab, 'id'>) };
      }
    }
    resolved.push({ feedDoc: fd, post, author, lab });
  }
  return resolved;
}

export function useFeedItems(uid: string | undefined) {
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [version, setVersion] = useState(0);

  const canLoad = useMemo(() => Boolean(uid && firebaseReady && db), [uid]);

  useEffect(() => {
    if (!canLoad || !uid || !db) {
      setRows([]);
      setLoading(false);
      setHasMore(false);
      setCursor(null);
      return;
    }
    let cancelled = false;
    const fs = db;
    setLoading(true);
    setError(null);
    setCursor(null);
    setHasMore(true);
    void (async () => {
      try {
        const base = collection(fs, 'feed', uid, 'items');
        const qy = query(base, orderBy('createdAt', 'desc'), limit(PAGE));
        const snap = await getDocs(qy);
        if (cancelled) return;
        const feedDocs = snap.docs;
        setHasMore(feedDocs.length >= PAGE);
        setCursor(feedDocs[feedDocs.length - 1] ?? null);
        const resolved = await resolveFeedDocs(fs, feedDocs);
        if (!cancelled) setRows(resolved);
      } catch {
        if (!cancelled) {
          setError('Could not load your feed.');
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canLoad, uid, version]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading || !cursor || !uid || !db) return;
    void (async () => {
      setLoadingMore(true);
      setError(null);
      try {
        const fs = db;
        const base = collection(fs, 'feed', uid, 'items');
        const qy = query(base, orderBy('createdAt', 'desc'), startAfter(cursor), limit(PAGE));
        const snap = await getDocs(qy);
        const feedDocs = snap.docs;
        if (feedDocs.length < PAGE) setHasMore(false);
        setCursor(feedDocs[feedDocs.length - 1] ?? cursor);
        const resolved = await resolveFeedDocs(fs, feedDocs);
        setRows((prev) => [...prev, ...resolved]);
      } catch {
        setError('Could not load more posts.');
      } finally {
        setLoadingMore(false);
      }
    })();
  }, [cursor, hasMore, loading, loadingMore, uid]);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  return { rows, loading, loadingMore, error, hasMore, loadMore, refresh };
}
