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
import { ShellPanel } from './ShellPanel';
import type { JobPost, Post } from '../../types';
import { AppIcon, ICON_STROKE } from '../ui/AppIcon';
import { Briefcase, TrendingUp, Users } from 'lucide-react';

function rankStyle(i: number): string {
  if (i === 0) return 'bg-amber-500/20 text-amber-200 ring-amber-500/40';
  if (i === 1) return 'bg-zinc-500/20 text-zinc-200 ring-zinc-500/35';
  if (i === 2) return 'bg-orange-600/15 text-orange-200 ring-orange-500/35';
  return 'bg-surface-raised text-fg-subtle ring-border';
}

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
    <aside className="erudis-zone-signals hidden h-full min-h-0 w-[300px] shrink-0 overflow-y-auto xl:block">
      <div className="space-y-4 p-4">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
          Field signals
        </p>

        <ShellPanel
          title="Trending this week"
          subtitle="Most engaged public posts"
          accent="brand"
          icon={<AppIcon icon={TrendingUp} size={16} strokeWidth={ICON_STROKE} />}
        >
          {trending.length === 0 ? (
            <p className="text-xs text-fg-subtle">
              {demoLive ? 'No public posts yet.' : 'Run seed:firestore for sample posts.'}
            </p>
          ) : (
            <ol className="space-y-3">
              {trending.map((p, i) => (
                <li key={p.id} className="flex gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ${rankStyle(i)}`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      to={ROUTES.discover}
                      className="block text-sm leading-snug text-fg-soft hover:text-brand"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-1 text-xs text-brand tabular-nums">
                      {p.resonateCount ?? 0} resonates
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </ShellPanel>

        <ShellPanel
          title="Researchers to follow"
          subtitle="Active voices in your field"
          accent="violet"
          icon={<AppIcon icon={Users} size={16} strokeWidth={ICON_STROKE} />}
        >
          {people.length === 0 ? (
            <p className="text-xs text-fg-subtle">Suggestions appear as the network grows.</p>
          ) : (
            <ul className="space-y-3">
              {people.map((u) => {
                const isFollowing = followingSet.has(u.uid);
                return (
                  <li
                    key={u.uid}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-surface-raised/50 px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <Link
                        to={ROUTES.profile(u.uid)}
                        className="block truncate text-sm font-medium text-fg hover:text-brand"
                      >
                        {u.name}
                      </Link>
                      <p className="truncate text-[11px] text-fg-subtle">
                        {roleLabel(u.role)} · {u.institution}
                      </p>
                    </div>
                    {user && user.uid !== u.uid && (
                      <button
                        type="button"
                        disabled={followBusy === u.uid}
                        onClick={() => void toggleFollow(u.uid)}
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          isFollowing
                            ? 'border border-border text-fg-muted'
                            : 'bg-brand text-white hover:bg-brand-muted'
                        } disabled:opacity-50`}
                      >
                        {followBusy === u.uid ? '…' : isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ShellPanel>

        <ShellPanel
          title="Open positions"
          subtitle="Roles at labs on the platform"
          accent="amber"
          icon={<AppIcon icon={Briefcase} size={16} strokeWidth={ICON_STROKE} />}
          footer={
            <Link to={ROUTES.jobs} className="text-xs font-medium text-brand hover:underline">
              View all positions →
            </Link>
          }
        >
          {jobs.length === 0 ? (
            <p className="text-xs text-fg-subtle">
              <Link to={ROUTES.jobs} className="text-brand hover:underline">
                Browse jobs
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {jobs.map((j) => (
                <li
                  key={j.id}
                  className="border-l-2 border-amber-500/60 pl-2.5"
                >
                  <Link
                    to={ROUTES.job(j.id)}
                    className="block text-sm font-medium text-fg-soft hover:text-brand"
                  >
                    {j.title}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-fg-subtle">
                    {j.institutionName ?? j.department ?? 'Research position'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </ShellPanel>
      </div>
    </aside>
  );
}
