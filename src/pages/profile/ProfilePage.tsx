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
import { resolveFruitShapeId } from '../../constants/labNotePortraits';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { PostCard } from '../../components/feed/PostCard';
import { EditableProfileBanner } from '../../components/profile/EditableProfileBanner';
import { ResearchActivityGraph } from '../../components/profile/ResearchActivityGraph';
import {
  ProfileSectionEmpty,
  ProfileSectionPanel,
} from '../../components/profile/ProfileSectionPanel';
import { CoffeeChatModal } from '../../components/profile/CoffeeChatModal';
import { EducationFormModal } from '../../components/profile/EducationFormModal';
import { PaperFormModal } from '../../components/profile/PaperFormModal';
import { ProfileSectionEditButton } from '../../components/profile/ProfileSectionEditButton';
import { SchoolLogoPlaceholder } from '../../components/profile/SchoolLogoPlaceholder';
import { WorkExperienceFormModal } from '../../components/profile/WorkExperienceFormModal';
import { Button } from '../../components/ui/Button';
import { notifyFollow } from '../../lib/notify';
import { followUser, isFollowingUser, unfollowUser } from '../../utils/follow';
import { roleLabel } from '../../utils/roleLabels';
import { formatTimeAgo } from '../../utils/timeAgo';
import type { FeedRow } from '../../hooks/useFeedItems';
import { enableDummyFeedSeed } from '../../config/flags';
import {
  getDemoProfileEducations,
  getDemoProfileResearchLogs,
  getDemoProfileWorkExperiences,
  isDemoProfileCareerUid,
} from '../../dev/demoProfileCareerData';
import { educationSubtitle, sortProfileCareer, workExperienceSubtitle } from '../../utils/profileCareer';
import type {
  Lab,
  Paper,
  Post,
  ProfileEducation,
  ProfileVisitorRow,
  ProfileWorkExperience,
  ResearchGraph,
  ResearchLog,
  User,
} from '../../types';

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
  const [likesReceived, setLikesReceived] = useState(0);
  const [resonatesReceived, setResonatesReceived] = useState(0);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [visitorRows, setVisitorRows] = useState<ProfileVisitorRow[]>([]);
  const [coffeeOpen, setCoffeeOpen] = useState(false);
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [educationEditEntry, setEducationEditEntry] = useState<ProfileEducation | null>(null);
  const [workModalOpen, setWorkModalOpen] = useState(false);
  const [workEditEntry, setWorkEditEntry] = useState<ProfileWorkExperience | null>(null);
  const [paperModalOpen, setPaperModalOpen] = useState(false);
  const [paperEditEntry, setPaperEditEntry] = useState<Paper | null>(null);

  useEffect(() => {
    setProfileUser(null);
  }, [uid]);

  const isSelf = uid === user?.uid;

  const loadAll = useCallback(async () => {
    if (!uid || !db || !firebaseReady) {
      setLoading(false);
      return;
    }
    const viewerIsProfileOwner = user?.uid === uid;
    setLoading(true);
    try {
      const uSnap = await getDoc(doc(db, 'users', uid));
      if (!uSnap.exists()) {
        setProfileUser(null);
        return;
      }
      const u = { uid: uSnap.id, ...(uSnap.data() as Omit<User, 'uid'>) } as User;
      setProfileUser(u);

      try {
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
      } catch {
        setGraph({
          loggedDates: [],
          currentStreak: 0,
          longestStreak: 0,
          totalLogDays: 0,
          last30DayCount: 0,
          updatedAt: null,
        });
      }

      try {
        const logQ = viewerIsProfileOwner
          ? query(
              collection(db, 'research_logs'),
              where('userId', '==', uid),
              orderBy('createdAt', 'desc'),
              limit(5)
            )
          : query(
              collection(db, 'research_logs'),
              where('userId', '==', uid),
              where('isPublic', '==', true),
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
      } catch {
        setLogs([]);
      }

      try {
        const postQ = query(
          collection(db, 'posts'),
          where('authorId', '==', uid),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const postSnap = await getDocs(postQ);
        setPosts(postSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) })));
        let likeSum = 0;
        let resonateSum = 0;
        postSnap.docs.forEach((d) => {
          const p = d.data() as Post;
          likeSum += p.likeCount ?? 0;
          resonateSum += p.resonateCount ?? 0;
        });
        setLikesReceived(likeSum);
        setResonatesReceived(resonateSum);
      } catch {
        setPosts([]);
        setLikesReceived(0);
        setResonatesReceived(0);
      }

      try {
        const paperQ = query(
          collection(db, 'papers'),
          where('addedBy', '==', uid),
          orderBy('createdAt', 'desc'),
          limit(12)
        );
        const paperSnap = await getDocs(paperQ);
        setPapers(paperSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Paper, 'id'>) })));
      } catch {
        setPapers([]);
      }

      const labList: Lab[] = [];
      for (const lid of u.labIds ?? []) {
        try {
          const ls = await getDoc(doc(db, 'labs', lid));
          if (ls.exists()) {
            labList.push({ id: ls.id, ...(ls.data() as Omit<Lab, 'id'>) });
          }
        } catch {
          /* skip missing lab */
        }
      }
      setLabs(labList);

      try {
        const fc = await getCountFromServer(collection(db, 'users', uid, 'followers'));
        const fg = await getCountFromServer(collection(db, 'users', uid, 'following'));
        setFollowerCount(fc.data().count);
        setFollowingCount(fg.data().count);
      } catch {
        setFollowerCount(0);
        setFollowingCount(0);
      }

      if (user?.uid && user.uid !== uid) {
        try {
          setFollowing(await isFollowingUser(user.uid, uid));
        } catch {
          setFollowing(false);
        }
      } else {
        setFollowing(false);
      }

      if (viewerIsProfileOwner) {
        try {
          const vc = await getCountFromServer(
            collection(db, 'profile_visits', uid, 'visitors')
          );
          setVisitorCount(vc.data().count);
        } catch {
          setVisitorCount(0);
        }
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

  const reloadPapers = useCallback(async () => {
    if (!uid || !db || !firebaseReady) return;
    try {
      const paperQ = query(
        collection(db, 'papers'),
        where('addedBy', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(12)
      );
      const paperSnap = await getDocs(paperQ);
      setPapers(paperSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Paper, 'id'>) })));
    } catch {
      setPapers([]);
    }
  }, [uid]);

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

  const useDemoCareerPreview =
    enableDummyFeedSeed && Boolean(uid && isDemoProfileCareerUid(uid));

  const educations = useMemo(() => {
    const fromFirestore = sortProfileCareer(profileUser?.educations ?? []);
    if (fromFirestore.length > 0 || !useDemoCareerPreview || !uid) return fromFirestore;
    return sortProfileCareer(getDemoProfileEducations(uid));
  }, [profileUser?.educations, uid, useDemoCareerPreview]);

  const workExperiences = useMemo(() => {
    const fromFirestore = sortProfileCareer(profileUser?.workExperiences ?? []);
    if (fromFirestore.length > 0 || !useDemoCareerPreview || !uid) return fromFirestore;
    return sortProfileCareer(getDemoProfileWorkExperiences(uid));
  }, [profileUser?.workExperiences, uid, useDemoCareerPreview]);

  const displayLogs = useMemo(() => {
    if (logs.length > 0) return logs;
    if (!useDemoCareerPreview || !uid) return [];
    return getDemoProfileResearchLogs(uid, isSelf);
  }, [logs, uid, useDemoCareerPreview, isSelf]);

  const storyFruitShapeId = resolveFruitShapeId(profileUser?.labNoteStoryPortrait);

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

  const sectionAddButton = (label: string, onClick: () => void) => (
    <Button type="button" variant="outline" className="px-3 py-1.5 text-xs" onClick={onClick}>
      {label}
    </Button>
  );

  return (
    <div className="space-y-6">
      <EditableProfileBanner
        profileUser={profileUser}
        isSelf={isSelf}
        following={following}
        followBusy={followBusy}
        followDisabled={!user}
        onToggleFollow={() => void toggleFollow()}
        onCoffeeChat={() => setCoffeeOpen(true)}
        onMediaUpdated={(patch) =>
          setProfileUser((u) => (u ? { ...u, ...patch } : u))
        }
        stats={{
          papers: papers.length,
          likesReceived,
          resonatesReceived,
          followers: followerCount,
          following: followingCount,
        }}
      >
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
      </EditableProfileBanner>

      <ResearchActivityGraph
        loggedDates={graphStats.loggedDates}
        fruitShapeId={storyFruitShapeId}
        showFruitSettingsLink={Boolean(isSelf)}
        currentStreak={graphStats.currentStreak}
        longestStreak={graphStats.longestStreak}
        totalLogDays={graphStats.totalLogDays}
        last30DayCount={graphStats.last30DayCount}
      />
      <ProfileSectionPanel
        eyebrow="Research ritual"
        title="Recent research logs"
        description={
          isSelf
            ? 'Your latest lab notes. Private entries appear here for you; others see public logs only.'
            : 'Public lab notes from this researcher.'
        }
        headerAction={
          <Link className="text-xs font-medium text-brand hover:underline" to={ROUTES.profileLogs(uid)}>
            View all
          </Link>
        }
      >
        {displayLogs.length > 0 ? (
          <ul className="space-y-3">
          {displayLogs.map((log) => (
            <li
              key={log.id}
              className="rounded-lg border border-border bg-surface-raised/50 px-4 py-3 text-sm"
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
          </ul>
        ) : (
          <ProfileSectionEmpty>No public logs yet.</ProfileSectionEmpty>
        )}
      </ProfileSectionPanel>

      <ProfileSectionPanel
        eyebrow="Background"
        title="Educations"
        description="Degrees and programs from this researcher’s academic path."
        headerAction={
          isSelf
            ? sectionAddButton('Add', () => {
                setEducationEditEntry(null);
                setEducationModalOpen(true);
              })
            : undefined
        }
      >
        {educations.length > 0 ? (
          <ul className="space-y-3">
            {educations.map((entry) => {
              const subtitle = educationSubtitle(entry);
              return (
                <li
                  key={entry.id}
                  className="relative rounded-lg border border-border bg-surface-raised/50 p-3 pr-11 text-sm"
                >
                  {isSelf ? (
                    <ProfileSectionEditButton
                      label="Edit education"
                      onEdit={() => {
                        setEducationEditEntry(entry);
                        setEducationModalOpen(true);
                      }}
                    />
                  ) : null}
                  <div className="flex gap-3">
                    <SchoolLogoPlaceholder school={entry.school} logoUrl={entry.logoUrl} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-fg">{entry.school}</p>
                      {subtitle ? <p className="mt-1 text-xs text-fg-muted">{subtitle}</p> : null}
                      {entry.description ? (
                        <p className="mt-2 line-clamp-3 text-fg-muted">{entry.description}</p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <ProfileSectionEmpty>
            {isSelf ? 'No education added yet. Use Add to create one.' : 'No education listed.'}
          </ProfileSectionEmpty>
        )}
      </ProfileSectionPanel>

      <ProfileSectionPanel
        eyebrow="Career"
        title="Work experiences"
        description="Roles and organizations across academia and industry."
        headerAction={
          isSelf
            ? sectionAddButton('Add', () => {
                setWorkEditEntry(null);
                setWorkModalOpen(true);
              })
            : undefined
        }
      >
        {workExperiences.length > 0 ? (
          <ul className="space-y-3">
            {workExperiences.map((entry) => {
              const subtitle = workExperienceSubtitle(entry);
              return (
                <li
                  key={entry.id}
                  className="relative rounded-lg border border-border bg-surface-raised/50 px-4 py-3 pr-11 text-sm"
                >
                  {isSelf ? (
                    <ProfileSectionEditButton
                      label="Edit work experience"
                      onEdit={() => {
                        setWorkEditEntry(entry);
                        setWorkModalOpen(true);
                      }}
                    />
                  ) : null}
                  <p className="font-medium text-fg">{entry.title}</p>
                  {subtitle ? <p className="mt-1 text-xs text-fg-muted">{subtitle}</p> : null}
                  {entry.description ? (
                    <p className="mt-2 line-clamp-3 text-fg-muted">{entry.description}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <ProfileSectionEmpty>
            {isSelf
              ? 'No work experience added yet. Use Add to create one.'
              : 'No work experience listed.'}
          </ProfileSectionEmpty>
        )}
      </ProfileSectionPanel>

      <ProfileSectionPanel
        eyebrow="Publications"
        title="Papers"
        description="Preprints and publications shared on the network."
        headerAction={
          isSelf
            ? sectionAddButton('Add', () => {
                setPaperEditEntry(null);
                setPaperModalOpen(true);
              })
            : undefined
        }
      >
        {papers.length > 0 ? (
          <ul className="space-y-3">
            {papers.map((p) => (
              <li
                key={p.id}
                className="relative rounded-lg border border-border bg-surface-raised/50 px-4 py-3 pr-11 text-sm"
              >
                {isSelf ? (
                  <ProfileSectionEditButton
                    label="Edit paper"
                    onEdit={() => {
                      setPaperEditEntry(p);
                      setPaperModalOpen(true);
                    }}
                  />
                ) : null}
                <p className="font-medium text-fg">{p.title}</p>
                <p className="mt-1 text-xs text-fg-muted">
                  {p.authors.join(', ')}
                </p>
                <p className="mt-1 text-xs text-fg-muted">
                  {p.venue ?? 'Venue TBD'} · {p.publicationYear ?? '—'} · Resonates{' '}
                  {p.resonateCount ?? 0}
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
          </ul>
        ) : (
          <ProfileSectionEmpty>
            {isSelf ? 'No papers added yet. Use Add to publish one.' : 'No papers added yet.'}
          </ProfileSectionEmpty>
        )}
      </ProfileSectionPanel>

      <ProfileSectionPanel
        eyebrow="Network"
        title="Recent posts"
        description="Updates, papers, and ideas published to followers."
      >
        {posts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {postRows.map((row) => (
              <PostCard key={row.post.id} row={row} viewerUid={user?.uid} compact onChanged={loadAll} />
            ))}
          </div>
        ) : (
          <ProfileSectionEmpty>No posts yet.</ProfileSectionEmpty>
        )}
      </ProfileSectionPanel>

      <ProfileSectionPanel
        eyebrow="Labs"
        title="Lab memberships"
        description="Research groups this scholar belongs to."
      >
        {labs.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {labs.map((lab) => (
              <Link
                key={lab.id}
                to={ROUTES.lab(lab.id)}
                className="rounded-lg border border-border bg-surface-raised/50 p-4 text-sm transition-colors hover:border-brand/40 hover:bg-surface-card"
              >
                <p className="font-medium text-fg">{lab.name}</p>
                <p className="mt-1 text-xs text-fg-muted">
                  {lab.description?.slice(0, 120) ?? 'Research lab'}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <ProfileSectionEmpty>No labs linked.</ProfileSectionEmpty>
        )}
      </ProfileSectionPanel>

      {isSelf && uid && (
        <>
          <EducationFormModal
            open={educationModalOpen}
            entry={educationEditEntry}
            educations={educations}
            userId={uid}
            onClose={() => setEducationModalOpen(false)}
            onSaved={(next) => setProfileUser((u) => (u ? { ...u, educations: next } : u))}
          />
          <WorkExperienceFormModal
            open={workModalOpen}
            entry={workEditEntry}
            workExperiences={workExperiences}
            userId={uid}
            onClose={() => setWorkModalOpen(false)}
            onSaved={(next) =>
              setProfileUser((u) => (u ? { ...u, workExperiences: next } : u))
            }
          />
          <PaperFormModal
            open={paperModalOpen}
            paper={paperEditEntry}
            userId={uid}
            labId={profileUser.primaryLabId}
            onClose={() => setPaperModalOpen(false)}
            onSaved={() => void reloadPapers()}
          />
        </>
      )}

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
