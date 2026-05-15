import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Timestamp } from 'firebase/firestore';
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { PostCard } from '../../components/feed/PostCard';
import { ResearchActivityGraph } from '../../components/profile/ResearchActivityGraph';
import { CoffeeChatModal } from '../../components/profile/CoffeeChatModal';
import { notifyFollow } from '../../lib/notify';
import { followUser, isFollowingUser, unfollowUser } from '../../utils/follow';
import { roleLabel } from '../../utils/roleLabels';
import { formatTimeAgo } from '../../utils/timeAgo';
import type { FeedRow } from '../../hooks/useFeedItems';
import type { Lab, Paper, Post, ProfileVisitorRow, ResearchGraph, ResearchLog, User } from '../../types';

function logTypeClass(t: string): string {
  switch (t) {
    case 'experiment':
      return 'bg-sky-600/20 text-sky-100 border-sky-500/40';
    case 'paper_review':
      return 'bg-brand/20 text-brand border-brand/40';
    case 'idea':
      return 'bg-amber-500/15 text-amber-100 border-amber-500/35';
    case 'result':
      return 'bg-violet-600/20 text-violet-100 border-violet-500/40';
    case 'writing':
      return 'bg-zinc-600/25 text-zinc-200 border-zinc-500/40';
    default:
      return 'bg-zinc-600/25 text-zinc-200';
  }
}

export function ProfilePage() {
  const { uid } = useParams();
  const { user, profile: viewerProfile } = useAuth();
  const { showToast } = useToast();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [graph, setGraph] = useState<ResearchGraph | null>(null);
  const [logs, setLogs] = useState<ResearchLog[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [resonatesReceived, setResonatesReceived] = useState(0);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [visitorRows, setVisitorRows] = useState<ProfileVisitorRow[]>([]);
  const [coffeeOpen, setCoffeeOpen] = useState(false);

  useEffect(() => {
    setProfileUser(null);
  }, [uid]);

  const isSelf = uid === user?.uid;

  const loadAll = useCallback(async () => {
    if (!uid || !db || !firebaseReady) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const uSnap = await getDoc(doc(db, 'users', uid));
      if (!uSnap.exists()) {
        setProfileUser(null);
        setLoading(false);
        return;
      }
      const u = { uid: uSnap.id, ...(uSnap.data() as Omit<User, 'uid'>) } as User;
      setProfileUser(u);

      const gSnap = await getDoc(doc(db, 'research_graph', uid));
      setGraph(
        gSnap.exists()
          ? ({ ...(gSnap.data() as Omit<ResearchGraph, never>) } as ResearchGraph)
          : {
              loggedDates: [],
              currentStreak: 0,
              longestStreak: 0,
              totalLogDays: 0,
              last30DayCount: 0,
              updatedAt: null,
            }
      );

      const logQ = query(
        collection(db, 'research_logs'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const logSnap = await getDocs(logQ);
      setLogs(
        logSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ResearchLog, 'id'>),
        }))
      );

      const postQ = query(
        collection(db, 'posts'),
        where('authorId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(6)
      );
      const postSnap = await getDocs(postQ);
      setPosts(postSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) })));

      let sum = 0;
      postSnap.docs.forEach((d) => {
        const p = d.data() as Post;
        sum += p.resonateCount ?? 0;
      });
      setResonatesReceived(sum);

      const paperQ = query(
        collection(db, 'papers'),
        where('addedBy', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(12)
      );
      try {
        const paperSnap = await getDocs(paperQ);
        setPapers(paperSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Paper, 'id'>) })));
      } catch {
        setPapers([]);
      }

      const labList: Lab[] = [];
      for (const lid of u.labIds ?? []) {
        const ls = await getDoc(doc(db, 'labs', lid));
        if (ls.exists()) {
          labList.push({ id: ls.id, ...(ls.data() as Omit<Lab, 'id'>) });
        }
      }
      setLabs(labList);

      const fc = await getCountFromServer(collection(db, 'users', uid, 'followers'));
      const fg = await getCountFromServer(collection(db, 'users', uid, 'following'));
      setFollowerCount(fc.data().count);
      setFollowingCount(fg.data().count);

      if (user?.uid && user.uid !== uid) {
        setFollowing(await isFollowingUser(user.uid, uid));
      } else {
        setFollowing(false);
      }

      if (user?.uid && uid && user.uid === uid) {
        const vc = await getCountFromServer(collection(db, 'profile_visits', uid, 'visitors'));
        setVisitorCount(vc.data().count);
        try {
          const vq = query(
            collection(db, 'profile_visits', uid, 'visitors'),
            orderBy('lastVisitAt', 'desc'),
            limit(24)
          );
          const vs = await getDocs(vq);
          setVisitorRows(
            vs.docs.map((d) => {
              const x = d.data() as {
                visitorName?: string;
                visitorAvatarUrl?: string;
                visitorInstitution?: string;
                visitorRole?: User['role'];
                visitCount?: number;
                lastVisitAt?: Timestamp | null;
              };
              return {
                visitorUid: d.id,
                visitorName: x.visitorName ?? 'Member',
                visitorAvatarUrl: x.visitorAvatarUrl ?? '',
                visitorInstitution: x.visitorInstitution ?? '',
                visitorRole: (x.visitorRole ?? 'phd') as User['role'],
                visitCount: typeof x.visitCount === 'number' ? x.visitCount : 1,
                lastVisitAt: x.lastVisitAt ?? null,
              };
            })
          );
        } catch {
          setVisitorRows([]);
        }
      } else {
        setVisitorCount(null);
        setVisitorRows([]);
      }
    } finally {
      setLoading(false);
    }
  }, [uid, user?.uid]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!uid || !user?.uid || user.uid === uid || !db || !firebaseReady) return;
    void (async () => {
      try {
        await setDoc(
          doc(db, 'profile_visits', uid, 'visitors', user.uid),
          {
            visitorName: viewerProfile?.name ?? user.displayName ?? 'Member',
            visitorAvatarUrl: viewerProfile?.avatarUrl ?? '',
            visitorInstitution: viewerProfile?.institutionName ?? '',
            visitorRole: viewerProfile?.role ?? 'phd',
            visitCount: increment(1),
            lastVisitAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch {
        /* ignore */
      }
    })();
  }, [uid, user?.uid, user, viewerProfile]);

  const toggleFollow = async () => {
    if (!user?.uid || !uid || isSelf) return;
    setFollowBusy(true);
    try {
      if (following) {
        await unfollowUser(user.uid, uid);
        setFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
        showToast('Unfollowed.', 'info');
      } else {
        await followUser(user.uid, uid);
        if (db && firebaseReady) {
          try {
            await notifyFollow(db, {
              followerId: user.uid,
              followeeId: uid,
              followerName:
                viewerProfile?.name ?? user.displayName ?? 'Someone',
            });
          } catch {
            /* best-effort */
          }
        }
        setFollowing(true);
        setFollowerCount((c) => c + 1);
        showToast('Following.', 'success');
      }
    } catch {
      showToast('Could not update follow state.', 'error');
    } finally {
      setFollowBusy(false);
    }
  };

  const graphStats = useMemo(() => {
    const g = graph;
    if (!g) {
      return {
        loggedDates: [] as string[],
        currentStreak: 0,
        longestStreak: 0,
        totalLogDays: 0,
        last30DayCount: 0,
      };
    }
    return {
      loggedDates: g.loggedDates ?? [],
      currentStreak: g.currentStreak ?? 0,
      longestStreak: g.longestStreak ?? 0,
      totalLogDays: g.totalLogDays ?? 0,
      last30DayCount: g.last30DayCount ?? 0,
    };
  }, [graph]);

  const viewedIsPro =
    profileUser?.subscription === 'pro' ||
    profileUser?.subscription === 'pro_write' ||
    profileUser?.subscription === 'lab_pro';

  const hrAlert = useMemo(
    () => visitorRows.some((v) => v.visitorRole === 'institution_admin' && v.visitCount >= 3),
    [visitorRows]
  );

  const visibleVisitors = viewedIsPro ? visitorRows : visitorRows.slice(0, 3);
  const blurredCount =
    !viewedIsPro && visitorRows.length > 3 ? visitorRows.length - 3 : 0;

  if (!uid) {
    return <p className="text-sm text-fg-muted">Missing profile id.</p>;
  }

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-40 animate-pulse rounded-card border border-border bg-surface-raised/50" />
        <div className="h-64 animate-pulse rounded-card border border-border bg-surface-raised/50" />
      </div>
    );
  }

  if (!profileUser) {
    return <p className="text-sm text-fg-muted">User not found.</p>;
  }

  const postRows: FeedRow[] = posts.map((post) => ({
    post,
    author: profileUser,
    lab: post.labId ? labs.find((l) => l.id === post.labId) ?? null : null,
  }));

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-card border border-border bg-surface-card">
        <div className="h-28 bg-gradient-to-br from-brand/25 via-surface-raised to-surface-card" />
        <div className="relative px-4 pb-6 pt-0 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {profileUser.avatarUrl ? (
                <img
                  src={profileUser.avatarUrl}
                  alt=""
                  className="h-20 w-20 rounded-full border-[3px] border-brand object-cover sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-brand bg-surface-raised text-2xl font-medium text-fg-muted sm:h-24 sm:w-24">
                  {profileUser.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl text-fg sm:text-3xl">{profileUser.name}</h1>
                <p className="mt-1 text-sm text-fg-muted">
                  {roleLabel(profileUser.role)}
                  {profileUser.institutionName && (
                    <>
                      {' '}
                      · {profileUser.institutionName}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {profileUser.openToCollaborate && (
                <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-medium text-brand">
                  Open to collaborate
                </span>
              )}
              {isSelf ? (
                <Link
                  to={ROUTES.settings}
                  className="inline-flex items-center justify-center rounded-card border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-fg hover:bg-surface-raised"
                >
                  Edit profile
                </Link>
              ) : (
                <>
                  <Button
                    type="button"
                    variant={following ? 'outline' : 'primary'}
                    disabled={followBusy || !user}
                    onClick={() => void toggleFollow()}
                  >
                    {following ? 'Unfollow' : 'Follow'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!user}
                    onClick={() => setCoffeeOpen(true)}
                  >
                    Coffee chat
                  </Button>
                  <Button type="button" variant="outline" disabled title="Coming soon">
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>

          {profileUser.bio && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-muted">{profileUser.bio}</p>
          )}
          {profileUser.researchAreas?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profileUser.researchAreas.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-subtle"
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4 text-sm">
            <span>
              <strong className="text-fg">{papers.length}</strong>{' '}
              <span className="text-fg-muted">papers</span>
            </span>
            <span>
              <strong className="text-fg">{resonatesReceived}</strong>{' '}
              <span className="text-fg-muted">resonates on posts</span>
            </span>
            <span>
              <strong className="text-fg">{followerCount}</strong>{' '}
              <span className="text-fg-muted">followers</span>
            </span>
            <span>
              <strong className="text-fg">{followingCount}</strong>{' '}
              <span className="text-fg-muted">following</span>
            </span>
          </div>

          {isSelf && visitorCount !== null && (
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              <p className="text-xs text-fg-subtle">
                <strong className="text-fg">{visitorCount}</strong> profile visit
                {visitorCount === 1 ? '' : 's'} recorded.
                {!viewedIsPro && visitorRows.length > 0 && (
                  <>
                    {' '}
                    <Link className="text-brand hover:underline" to={ROUTES.pricing}>
                      Upgrade to Pro
                    </Link>{' '}
                    for full visitor analytics.
                  </>
                )}
              </p>
              {hrAlert && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  An institution HR account has visited your profile multiple times this period —
                  great visibility for opportunities.
                </div>
              )}
              {visitorRows.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase text-fg-subtle">Recent visitors</p>
                  <ul className="mt-2 space-y-2">
                    {visibleVisitors.map((v) => (
                      <li
                        key={v.visitorUid}
                        className="flex items-center gap-3 rounded-lg border border-border bg-surface/50 px-2 py-2"
                      >
                        {v.visitorAvatarUrl ? (
                          <img src={v.visitorAvatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-xs text-fg-muted">
                            {v.visitorName.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <Link
                            to={ROUTES.profile(v.visitorUid)}
                            className="truncate text-sm font-medium text-fg hover:text-brand"
                          >
                            {v.visitorName}
                          </Link>
                          <p className="truncate text-xs text-fg-subtle">
                            {v.visitorInstitution || '—'} · {roleLabel(v.visitorRole)} ·{' '}
                            {formatTimeAgo(v.lastVisitAt)}
                            {v.visitCount > 1 ? ` · ${v.visitCount} visits` : ''}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {blurredCount > 0 && (
                    <div className="relative mt-2 overflow-hidden rounded-lg border border-border">
                      <div className="pointer-events-none blur-sm">
                        <div className="h-16 bg-surface-raised/80" />
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 px-3 text-center">
                        <span className="text-xs text-fg">+{blurredCount} more visitors</span>
                        <Link
                          to={ROUTES.pricing}
                          className="text-xs font-medium text-brand hover:underline"
                        >
                          Upgrade to Pro to see all
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <ResearchActivityGraph
        loggedDates={graphStats.loggedDates}
        currentStreak={graphStats.currentStreak}
        longestStreak={graphStats.longestStreak}
        totalLogDays={graphStats.totalLogDays}
        last30DayCount={graphStats.last30DayCount}
      />
      <p className="text-right text-xs">
        <Link className="text-brand hover:underline" to={ROUTES.profileLogs(uid)}>
          View all logs
        </Link>
      </p>

      <section>
        <h2 className="font-display text-lg text-fg">Recent research logs</h2>
        <ul className="mt-3 space-y-3">
          {logs.map((log) => (
            <li
              key={log.id}
              className="rounded-card border border-border bg-surface-card px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase ${logTypeClass(log.type)}`}
                >
                  {log.type.replace('_', ' ')}
                </span>
                <span className="text-fg-subtle">{log.date}</span>
                {!log.isPublic && isSelf && <span title="Private">🔒</span>}
              </div>
              <p className="mt-1 font-medium text-fg">{log.title}</p>
              <p className="mt-1 line-clamp-2 text-fg-muted">{log.content}</p>
            </li>
          ))}
          {logs.length === 0 && (
            <li className="text-sm text-fg-muted">No public logs yet.</li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg text-fg">Papers</h2>
        <ul className="mt-3 space-y-3">
          {papers.map((p) => (
            <li key={p.id} className="rounded-card border border-border bg-surface-card px-4 py-3 text-sm">
              <p className="font-medium text-fg">{p.title}</p>
              <p className="mt-1 text-xs text-fg-muted">
                {p.venue ?? 'Venue TBD'} · {p.publicationYear ?? '—'} · Resonates {p.resonateCount ?? 0}
              </p>
              {p.arxivId && (
                <a
                  className="mt-2 inline-block text-xs text-brand hover:underline"
                  href={`https://arxiv.org/abs/${p.arxivId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on arXiv
                </a>
              )}
            </li>
          ))}
          {papers.length === 0 && <li className="text-sm text-fg-muted">No papers added yet.</li>}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg text-fg">Recent posts</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {postRows.map((row) => (
            <PostCard key={row.post.id} row={row} viewerUid={user?.uid} compact onChanged={loadAll} />
          ))}
        </div>
        {posts.length === 0 && <p className="text-sm text-fg-muted">No posts yet.</p>}
      </section>

      <section>
        <h2 className="font-display text-lg text-fg">Lab memberships</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {labs.map((lab) => (
            <Link
              key={lab.id}
              to={ROUTES.lab(lab.id)}
              className="rounded-card border border-border bg-surface-card p-4 text-sm transition-colors hover:border-brand/40"
            >
              <p className="font-medium text-fg">{lab.name}</p>
              <p className="mt-1 text-xs text-fg-muted">{lab.description?.slice(0, 120) ?? 'Research lab'}</p>
            </Link>
          ))}
        </div>
        {labs.length === 0 && <p className="text-sm text-fg-muted">No labs linked.</p>}
      </section>

      {!isSelf && user && uid && profileUser && (
        <CoffeeChatModal
          open={coffeeOpen}
          onClose={() => setCoffeeOpen(false)}
          fromUserId={user.uid}
          toUserId={uid}
          targetName={profileUser.name}
          targetInstitution={profileUser.institutionName ?? ''}
        />
      )}
    </div>
  );
}
