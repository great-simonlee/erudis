import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { ROUTES } from '../../constants';
import { db, firebaseReady } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useFilterModalDraft } from '../../hooks/useFilterModalDraft';
import { DiscoverFilterFields } from '../../components/discover/DiscoverFilterFields';
import { FilterModal } from '../../components/shared/FilterModal';
import { ListPageFilterBar } from '../../components/shared/ListPageFilterBar';
import { formatTimeAgo } from '../../utils/timeAgo';
import { postTypeBadge } from '../../utils/postTypeStyle';
import { sortPostsByTrending } from '../../lib/discoverScore';
import {
  DEFAULT_DISCOVER_FILTERS,
  clearDiscoverFilterChip,
  countDiscoverModalFilters,
  discoverFilterChips,
  filterDiscoverPosts,
  hasActiveDiscoverFilters,
  type DiscoverFilterChip,
} from '../../utils/discoverFilters';
import type { Post } from '../../types';

type DiscoverTab = 'trending' | 'resonated' | 'viewed' | 'papers' | 'following';

const TABS: { id: DiscoverTab; label: string }[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'resonated', label: 'Most resonated' },
  { id: 'viewed', label: 'Most viewed' },
  { id: 'papers', label: 'New papers' },
  { id: 'following', label: 'Following' },
];

function rankBadge(i: number): string | null {
  if (i === 0) return '#1';
  if (i === 1) return '#2';
  if (i === 2) return '#3';
  return null;
}

export function DiscoverPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<DiscoverTab>('trending');
  const [filters, setFilters] = useState(DEFAULT_DISCOVER_FILTERS);
  const filterModal = useFilterModalDraft(filters);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPublic = useCallback(async () => {
    if (!firebaseReady || !db) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const base = collection(db, 'posts');
      let snap;
      if (tab === 'following') {
        if (!profile?.following?.length) {
          setPosts([]);
          setLoading(false);
          return;
        }
        const ids = profile.following.slice(0, 25);
        const qy = query(
          base,
          where('authorId', 'in', ids),
          orderBy('createdAt', 'desc'),
          limit(40)
        );
        snap = await getDocs(qy);
      } else {
        const qy = query(
          base,
          where('visibility', '==', 'public'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        snap = await getDocs(qy);
      }
      let rows: Post[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Post, 'id'>),
      }));
      if (tab === 'papers') {
        rows = rows.filter((p) => p.type === 'paper');
      }
      if (filters.field) {
        rows = rows.filter((p) => p.researchArea === filters.field);
      }
      if (tab === 'resonated') {
        rows = [...rows].sort((a, b) => b.resonateCount - a.resonateCount);
      } else if (tab === 'viewed') {
        rows = [...rows].sort((a, b) => b.viewCount - a.viewCount);
      } else if (tab === 'trending') {
        rows = sortPostsByTrending(rows);
      }
      setPosts(rows.slice(0, 40));
    } catch {
      setError('Could not load discover feed.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [tab, filters.field, profile?.following]);

  useEffect(() => {
    void loadPublic();
  }, [loadPublic]);

  const displayedPosts = useMemo(() => filterDiscoverPosts(posts, filters), [posts, filters]);
  const chips = useMemo(
    () => discoverFilterChips(filters).map((c) => ({ id: c.id, label: c.label })),
    [filters]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-fg">Discover</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Public research updates — search posts and filter by field or type.
        </p>
      </div>

      <Link
        to={ROUTES.brief}
        className="flex items-center justify-between rounded-card border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-fg transition hover:bg-brand/15"
      >
        <span>
          <span className="font-medium text-brand">Weekly brief</span>
          <span className="text-fg-muted"> — curated snapshot (beta)</span>
        </span>
        <span className="text-brand" aria-hidden>
          →
        </span>
      </Link>

      <ListPageFilterBar
        searchId="disc-search"
        search={filters.query}
        onSearchChange={(query) => setFilters((f) => ({ ...f, query }))}
        searchPlaceholder="Search titles and content…"
        onOpenFilters={() => filterModal.setOpen(true)}
        activeFilterCount={countDiscoverModalFilters(filters)}
        chips={chips}
        onRemoveChip={(id) =>
          setFilters((f) => clearDiscoverFilterChip(f, id as DiscoverFilterChip['id']))
        }
        onClearAll={
          hasActiveDiscoverFilters(filters) ? () => setFilters(DEFAULT_DISCOVER_FILTERS) : undefined
        }
        resultSummary={
          !loading ? `${displayedPosts.length} posts` : undefined
        }
      />

      <FilterModal
        open={filterModal.open}
        title="Filter discover"
        subtitle="Research field reloads the feed; post type filters the current list."
        onClose={filterModal.close}
        onApply={() => filterModal.apply(setFilters)}
        onReset={() => filterModal.setDraft(DEFAULT_DISCOVER_FILTERS)}
      >
        <DiscoverFilterFields filters={filterModal.draft} onChange={filterModal.setDraft} />
      </FilterModal>

      <div className="flex flex-wrap gap-1 border-b border-border pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === t.id
                ? 'bg-surface-raised text-fg'
                : 'text-fg-muted hover:bg-surface-raised/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'following' && (!profile?.following || profile.following.length === 0) && (
        <p className="text-sm text-fg-muted">
          Follow researchers from their profiles to see their public posts here.
        </p>
      )}

      {error && (
        <p className="rounded-card border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {loading && (
        <div className="space-y-3" aria-busy="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-card border border-border bg-surface-raised/40"
            />
          ))}
        </div>
      )}

      {!loading && displayedPosts.length === 0 && !error && (
        <p className="text-sm text-fg-muted">No posts match these filters yet.</p>
      )}

      <ul className="space-y-3">
        {!loading &&
          displayedPosts.map((post, i) => {
            const badge = postTypeBadge(post.type);
            const rk = rankBadge(i);
            return (
              <li key={post.id}>
                <Link
                  to={`${ROUTES.feed}#post-${post.id}`}
                  className="block rounded-card border border-border bg-surface-card p-4 transition hover:border-brand/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {rk && (
                          <span className="rounded border border-brand/50 bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                            {rk}
                          </span>
                        )}
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        {post.researchArea && (
                          <span className="text-[11px] text-fg-subtle">{post.researchArea}</span>
                        )}
                      </div>
                      <h2 className="mt-1 line-clamp-2 font-medium text-fg">{post.title}</h2>
                      <p className="mt-1 line-clamp-2 text-xs text-fg-muted">{post.content}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-fg-subtle">
                        <span>{post.resonateCount} resonates</span>
                        <span>· {post.likeCount ?? 0} likes</span>
                        <span>{post.viewCount} views</span>
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
