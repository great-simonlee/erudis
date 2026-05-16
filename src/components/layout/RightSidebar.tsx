import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { DEMO_FEATURED_PEOPLE } from '../../dev/demoEcosystemCatalog';
import {
  isDemoEcosystemAvailable,
  loadOpenDemoJobs,
  loadTrendingDemoPosts,
} from '../../lib/demoEcosystem';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { followUser, unfollowUser } from '../../utils/follow';
import { roleLabel } from '../../utils/roleLabels';
import type { JobPost, Post } from '../../types';

export function RightSidebar() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [trending, setTrending] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [demoLive, setDemoLive] = useState(false);
  const [followBusy, setFollowBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady || !db) return;
    const fs = db;
    void (async () => {
      try {
        const live = await isDemoEcosystemAvailable(fs);
        setDemoLive(live);
        if (!live) return;
        const [posts, openJobs] = await Promise.all([
          loadTrendingDemoPosts(fs),
          loadOpenDemoJobs(fs),
        ]);
        setTrending(posts);
        setJobs(openJobs);
      } catch {
        /* permission or offline */
      }
    })();
  }, []);

  const toggleFollow = useCallback(
    async (theirUid: string) => {
      if (!user?.uid || theirUid === user.uid) return;
      const followingSet = new Set(profile?.following ?? []);
      setFollowBusy(theirUid);
      try {
        if (followingSet.has(theirUid)) {
          await unfollowUser(user.uid, theirUid);
          showToast('Unfollowed.', 'success');
        } else {
          await followUser(user.uid, theirUid);
          showToast('Following.', 'success');
        }
      } catch {
        showToast('Could not update follow.', 'error');
      } finally {
        setFollowBusy(null);
      }
    },
    [user?.uid, profile?.following, showToast]
  );

  const followingSet = new Set(profile?.following ?? []);
  const people = demoLive ? DEMO_FEATURED_PEOPLE : [];

  return (
    <aside className="hidden h-full min-h-0 w-[300px] shrink-0 overflow-y-auto border-l border-border bg-surface px-4 py-6 xl:flex xl:flex-col">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          Trending this week
        </h2>
        {trending.length === 0 ? (
          <p className="mt-4 text-xs text-fg-subtle">
            {demoLive ? 'No public posts yet.' : 'Run seed:firestore for sample posts.'}
          </p>
        ) : (
          <ol className="mt-4 space-y-4">
            {trending.map((p, i) => (
              <li key={p.id}>
                <p className="text-[11px] text-fg-subtle">{i + 1}</p>
                <Link
                  to={ROUTES.discover}
                  className="mt-1 block text-sm leading-snug text-fg-soft hover:text-brand"
                >
                  {p.title}
                </Link>
                <p className="mt-1 text-xs text-brand">{p.resonateCount ?? 0} resonates</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          Who to follow
        </h2>
        {people.length === 0 ? (
          <p className="mt-4 text-xs text-fg-subtle">Researchers will appear here.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {people.map((u) => {
              const isFollowing = followingSet.has(u.uid);
              return (
                <li
                  key={u.uid}
                  className="flex items-center justify-between gap-2 border-b border-border pb-3 last:border-0"
                >
                  <div className="min-w-0">
                    <Link
                      to={ROUTES.profile(u.uid)}
                      className="block truncate text-sm text-fg hover:text-brand"
                    >
                      {u.name}
                    </Link>
                    <p className="text-xs text-fg-subtle">
                      {roleLabel(u.role)} · {u.institution}
                    </p>
                  </div>
                  {user && user.uid !== u.uid && (
                    <button
                      type="button"
                      disabled={followBusy === u.uid}
                      onClick={() => void toggleFollow(u.uid)}
                      className="shrink-0 rounded border border-border px-2 py-1 text-xs text-fg-soft hover:border-brand hover:text-fg disabled:opacity-50"
                    >
                      {followBusy === u.uid ? '…' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          Open positions
        </h2>
        {jobs.length === 0 ? (
          <p className="mt-4 text-xs text-fg-subtle">
            <Link to={ROUTES.jobs} className="text-brand hover:underline">
              Browse jobs
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {jobs.map((j) => (
              <li key={j.id}>
                <Link
                  to={ROUTES.job(j.id)}
                  className="block text-sm text-fg-soft hover:text-brand"
                >
                  {j.title}
                </Link>
                <p className="mt-1 text-xs text-fg-subtle">
                  {j.institutionName ?? j.department ?? 'Research position'}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link
          to={ROUTES.jobs}
          className="mt-3 inline-block text-xs font-medium text-brand hover:underline"
        >
          View all positions
        </Link>
      </section>
    </aside>
  );
}
