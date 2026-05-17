import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rss } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { skipFirebase } from '../../config/flags';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_FEED_REFRESH_EVENT } from '../../hooks/useDemoEcosystemBootstrap';
import { useFeedItems } from '../../hooks/useFeedItems';
import { db, firebaseReady } from '../../lib/firebase';
import { FirebaseNotice } from '../../components/shared/FirebaseNotice';
import { FeedComposerBar } from '../../components/feed/FeedComposerBar';
import { PostComposerModal } from '../../components/feed/PostComposerModal';
import { PostCard } from '../../components/feed/PostCard';
import { PageMasthead } from '../../components/layout/PageMasthead';
import { SectionLabel } from '../../components/layout/SectionLabel';
import { PullToRefresh } from '../../components/shared/PullToRefresh';
import type { Lab, PostType } from '../../types';

export function FeedPage() {
  const { user, profile } = useAuth();
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialType, setComposerInitialType] = useState<PostType | undefined>();
  const [memberLabs, setMemberLabs] = useState<{ id: string; name: string }[]>([]);
  const { rows, loading, loadingMore, error, hasMore, loadMore, refresh } = useFeedItems(
    user?.uid
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isPullRefreshing = loading && !loadingMore;

  useEffect(() => {
    if (!firebaseReady || !db || !profile?.labIds?.length) {
      setMemberLabs([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const labRows: { id: string; name: string }[] = [];
      for (const id of profile.labIds) {
        const s = await getDoc(doc(db, 'labs', id));
        if (s.exists()) {
          const data = s.data() as Omit<Lab, 'id'>;
          labRows.push({ id, name: data.name ?? 'Lab' });
        }
      }
      if (!cancelled) setMemberLabs(labRows);
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
      <div className="erudis-page-stack">
        <p className="erudis-panel px-4 py-3 text-xs text-fg-subtle">
          Preview mode (no Firebase). Turn on auth in{' '}
          <code className="text-fg-muted">src/config/flags.ts</code>.
        </p>
        <PageMasthead label="Feed" title="Home" description="Feed requires Firebase." />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={refresh} isRefreshing={isPullRefreshing}>
    <div className="erudis-page-stack">
      <FirebaseNotice />
      <div className="hidden md:block">
        <PageMasthead
          label="Your desk"
          title="Home"
          description="Updates from people you follow and your own posts."
        />
      </div>

      {user && profile && (
        <>
          <FeedComposerBar
            onOpenComposer={(type) => {
              setComposerInitialType(type);
              setComposerOpen(true);
            }}
          />
          <PostComposerModal
            open={composerOpen}
            onClose={() => {
              setComposerOpen(false);
              setComposerInitialType(undefined);
            }}
            authorId={user.uid}
            institutionId={profile.institutionId}
            primaryLabId={profile.primaryLabId}
            memberLabs={memberLabs}
            onPosted={refresh}
            initialType={composerInitialType}
          />
        </>
      )}

      <section aria-label="Feed posts">
        <div className="hidden md:block">
          <SectionLabel
            title="From your network"
            hint={!loading && rows.length > 0 ? `${rows.length} posts` : undefined}
          />
        </div>

        {loading && (
          <div className="erudis-feed-list" aria-busy="true" id="feed-network-heading">
            {[1, 2].map((i) => (
              <div key={i} className="erudis-skeleton h-44" />
            ))}
            <p className="text-center text-xs text-fg-subtle">Loading your feed…</p>
          </div>
        )}

        {error && (
          <p
            className="rounded-lg border-2 border-red-500/40 bg-red-500/15 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="erudis-empty-state" id="feed-network-heading">
            <Rss className="mx-auto h-10 w-10 text-fg-subtle" strokeWidth={1.5} aria-hidden />
            <p className="mt-2 text-sm font-medium text-fg">Your feed is quiet</p>
            <p className="mt-1 text-xs leading-relaxed text-fg-muted">
              Follow researchers or share your first update to see posts here.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link
                to={ROUTES.discover}
                className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
              >
                Discover researchers
              </Link>
              {user && profile && (
                <button
                  type="button"
                  onClick={() => {
                    setComposerInitialType(undefined);
                    setComposerOpen(true);
                  }}
                  className="rounded-full border-2 border-brand/40 px-4 py-2 text-xs font-semibold text-brand"
                >
                  Write a post
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="erudis-feed-list" id="feed-network-heading">
            {rows.map((row) => (
              <PostCard
                key={row.feedDoc?.id ?? row.post.id}
                row={row}
                viewerUid={user?.uid}
                onChanged={refresh}
              />
            ))}
          </div>
        )}
      </section>

      <div ref={sentinelRef} className="h-2 w-full" aria-hidden />

      {loadingMore && (
        <p className="text-center text-xs font-medium text-brand">Loading more…</p>
      )}

      {!hasMore && rows.length > 0 && (
        <p className="rounded-lg border border-border bg-surface-raised/80 py-3 text-center text-xs text-fg-subtle">
          You&apos;re all caught up
        </p>
      )}
    </div>
    </PullToRefresh>
  );
}
