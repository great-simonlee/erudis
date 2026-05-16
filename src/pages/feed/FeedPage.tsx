import { useEffect, useRef, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { skipFirebase } from '../../config/flags';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_FEED_REFRESH_EVENT } from '../../hooks/useDemoEcosystemBootstrap';
import { useFeedItems } from '../../hooks/useFeedItems';
import { db, firebaseReady } from '../../lib/firebase';
import { FirebaseNotice } from '../../components/shared/FirebaseNotice';
import { FeedComposerBar } from '../../components/feed/FeedComposerBar';
import { PostComposerModal } from '../../components/feed/PostComposerModal';
import { PostCard } from '../../components/feed/PostCard';
import type { Lab } from '../../types';

export function FeedPage() {
  const { user, profile } = useAuth();
  const [composerOpen, setComposerOpen] = useState(false);
  const [memberLabs, setMemberLabs] = useState<{ id: string; name: string }[]>([]);
  const { rows, loading, loadingMore, error, hasMore, loadMore, refresh } = useFeedItems(
    user?.uid
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!firebaseReady || !db || !profile?.labIds?.length) {
      setMemberLabs([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const rows: { id: string; name: string }[] = [];
      for (const id of profile.labIds) {
        const s = await getDoc(doc(db, 'labs', id));
        if (s.exists()) {
          const data = s.data() as Omit<Lab, 'id'>;
          rows.push({ id, name: data.name ?? 'Lab' });
        }
      }
      if (!cancelled) setMemberLabs(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.labIds]);

  useEffect(() => {
    const onBootstrap = () => refresh();
    window.addEventListener(DEMO_FEED_REFRESH_EVENT, onBootstrap);
    return () => window.removeEventListener(DEMO_FEED_REFRESH_EVENT, onBootstrap);
  }, [refresh]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '120px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  if (skipFirebase) {
    return (
      <div>
        <p className="mb-6 rounded-card border border-border bg-surface-card px-4 py-3 text-xs text-fg-subtle">
          Preview mode (no Firebase). Turn on auth later by setting{' '}
          <code className="text-fg-muted">skipFirebase</code> to <code className="text-fg-muted">false</code> in{' '}
          <code className="text-fg-muted">src/config/flags.ts</code>.
        </p>
        <h1 className="font-display text-2xl text-fg">Home</h1>
        <p className="mt-2 text-sm text-fg-muted">Feed requires Firebase.</p>
      </div>
    );
  }

  return (
    <div>
      <FirebaseNotice />
      <h1 className="font-display text-2xl text-fg">Home</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Updates from people you follow and your own posts.
      </p>

      {user && profile && (
        <>
          <FeedComposerBar onOpenComposer={() => setComposerOpen(true)} />
          <PostComposerModal
            open={composerOpen}
            onClose={() => setComposerOpen(false)}
            authorId={user.uid}
            institutionId={profile.institutionId}
            primaryLabId={profile.primaryLabId}
            memberLabs={memberLabs}
            onPosted={refresh}
          />
        </>
      )}

      {loading && (
        <div className="mt-6 space-y-4" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-card border border-border bg-surface-raised/50"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="mt-6 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="mt-8 rounded-card border border-border bg-surface-card px-4 py-6 text-center text-sm text-fg-muted">
          You&apos;re all caught up — or your feed is empty. Follow researchers or publish
          your first post.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <PostCard
            key={row.feedDoc?.id ?? row.post.id}
            row={row}
            viewerUid={user?.uid}
            onChanged={refresh}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-4 w-full" aria-hidden />

      {loadingMore && (
        <p className="mt-4 text-center text-xs text-fg-subtle">Loading more…</p>
      )}

      {!hasMore && rows.length > 0 && (
        <p className="mt-6 text-center text-sm text-fg-subtle">You&apos;re all caught up!</p>
      )}
    </div>
  );
}
