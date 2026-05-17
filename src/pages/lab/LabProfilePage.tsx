import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { loadPostsForLab } from '../../lib/labPosts';
import { ROUTES } from '../../constants';
import { EditableEntityBanner } from '../../components/entity/EditableEntityBanner';
import {
  saveLabCoverUrl,
  saveLabLogoUrl,
  uploadLabCover,
  uploadLabLogo,
} from '../../lib/entityMedia';
import { canManageLab } from '../../lib/institutionAccess';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { PostCard } from '../../components/feed/PostCard';
import { roleLabel } from '../../utils/roleLabels';
import type { FeedRow } from '../../hooks/useFeedItems';
import type { JobPost, Lab, Post, User } from '../../types';

function canSeePost(p: Post, viewerUid: string | undefined, memberIds: string[]): boolean {
  if (p.visibility === 'public') return true;
  if (p.visibility === 'private') return !!viewerUid && p.authorId === viewerUid;
  if (p.visibility === 'members_only') {
    return !!viewerUid && memberIds.includes(viewerUid);
  }
  return false;
}

type MemberRow = { uid: string; user: User };

export function LabProfilePage() {
  const { labId } = useParams<{ labId: string }>();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [piUser, setPiUser] = useState<User | null>(null);
  const [followingLab, setFollowingLab] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!labId || !firebaseReady || !db) {
      setLab(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const fs = db;

    try {
      const labSnap = await getDoc(doc(fs, 'labs', labId));
      if (!labSnap.exists()) {
        setLab(null);
        setRows([]);
        setJobs([]);
        setMembers([]);
        setPiUser(null);
        setLoading(false);
        return;
      }
      const L: Lab = { id: labSnap.id, ...(labSnap.data() as Omit<Lab, 'id'>) };
      setLab(L);

      const piSnap = await getDoc(doc(fs, 'users', L.piId));
      setPiUser(
        piSnap.exists()
          ? ({ uid: piSnap.id, ...(piSnap.data() as Omit<User, 'uid'>) } as User)
          : null
      );

      const memberRows: MemberRow[] = [];
      for (const mid of L.memberIds) {
        const u = await getDoc(doc(fs, 'users', mid));
        if (u.exists()) {
          memberRows.push({
            uid: u.id,
            user: { uid: u.id, ...(u.data() as Omit<User, 'uid'>) } as User,
          });
        }
      }
      memberRows.sort((a, b) => {
        if (a.uid === L.piId) return -1;
        if (b.uid === L.piId) return 1;
        return a.user.name.localeCompare(b.user.name);
      });
      setMembers(memberRows);

      try {
        const posts = (await loadPostsForLab(fs, labId)).filter((p) =>
          canSeePost(p, user?.uid, L.memberIds)
        );
        const authorCache = new Map<string, User | null>();
        const resolved: FeedRow[] = [];
        for (const post of posts) {
          let author = authorCache.get(post.authorId);
          if (author === undefined) {
            const u = await getDoc(doc(fs, 'users', post.authorId));
            author = u.exists()
              ? ({ uid: u.id, ...(u.data() as Omit<User, 'uid'>) } as User)
              : null;
            authorCache.set(post.authorId, author);
          }
          resolved.push({ post, author, lab: L });
        }
        setRows(resolved);
      } catch {
        setRows([]);
      }

      try {
        const js = await getDocs(
          query(collection(fs, 'jobs'), where('labId', '==', labId), limit(20))
        );
        setJobs(
          js.docs
            .map((d) => ({
              id: d.id,
              ...(d.data() as Omit<JobPost, 'id'>),
            }))
            .filter((j) => j.active !== false)
        );
      } catch {
        setJobs([]);
      }

      try {
        const fc = await getCountFromServer(collection(fs, 'labs', labId, 'followers'));
        setFollowerCount(fc.data().count);
      } catch {
        setFollowerCount(0);
      }

      if (user?.uid) {
        try {
          const f = await getDoc(doc(fs, 'labs', labId, 'followers', user.uid));
          setFollowingLab(f.exists());
        } catch {
          setFollowingLab(false);
        }
      } else {
        setFollowingLab(false);
      }
    } catch {
      setLab(null);
      setLoadError('Could not load this lab. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [labId, user?.uid]);

  useEffect(() => {
    void load();
  }, [load]);

  const isMember = useMemo(
    () => !!(user?.uid && lab && lab.memberIds.includes(user.uid)),
    [user?.uid, lab]
  );
  const canManage = useMemo(
    () => !!(lab && canManageLab(profile, lab)),
    [profile, lab]
  );

  const toggleFollowLab = async () => {
    if (!user?.uid || !db || !labId) {
      showToast('Sign in to follow this lab.', 'error');
      return;
    }
    setBusy(true);
    try {
      const ref = doc(db, 'labs', labId, 'followers', user.uid);
      if (followingLab) {
        await deleteDoc(ref);
        setFollowingLab(false);
        setFollowerCount((c) => Math.max(0, c - 1));
        showToast('Unfollowed lab.', 'info');
      } else {
        await setDoc(ref, { createdAt: serverTimestamp() });
        setFollowingLab(true);
        setFollowerCount((c) => c + 1);
        showToast('Following lab.', 'success');
      }
    } catch {
      showToast('Could not update lab follow.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const addLabToProfile = async () => {
    if (!user?.uid || !db || !lab?.id || !profile) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { labIds: arrayUnion(lab.id) });
      showToast('Lab added to your profile.', 'success');
    } catch {
      showToast('Could not update profile.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-40 animate-pulse rounded-card border border-border bg-surface-raised/50" />
        <div className="h-32 animate-pulse rounded-card border border-border bg-surface-raised/50" />
        <div className="h-48 animate-pulse rounded-card border border-border bg-surface-raised/50" />
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="rounded-card border border-border bg-surface-card p-6">
        <p className="text-sm text-fg-muted">{loadError ?? 'Lab not found.'}</p>
        <Link to={ROUTES.labExplore} className="mt-3 inline-block text-sm text-brand hover:underline">
          Find labs
        </Link>
      </div>
    );
  }

  const onProfile = !!(labId && profile?.labIds?.includes(labId));

  const institutionSubtitle = lab.department
    ? `${lab.institutionName ?? 'Institution'} · ${lab.department}`
    : (lab.institutionName ?? 'Institution');

  const mediaHandlers = {
    uploadLogo: (file: File) => uploadLabLogo(lab.id, file),
    uploadCover: (file: File) => uploadLabCover(lab.id, file),
    saveLogo: (url: string) => saveLabLogoUrl(lab.id, url),
    saveCover: (url: string) => saveLabCoverUrl(lab.id, url),
  };

  return (
    <div className="space-y-8">
      <EditableEntityBanner
        entityLabel="Research lab"
        name={lab.name}
        subtitle={
          lab.institutionId ? (
            <Link to={ROUTES.institution(lab.institutionId)} className="hover:underline">
              {institutionSubtitle}
            </Link>
          ) : (
            institutionSubtitle
          )
        }
        logoUrl={lab.logoUrl}
        coverUrl={lab.coverUrl}
        canEdit={canManage}
        onMediaUpdated={(patch) => setLab((L) => (L ? { ...L, ...patch } : L))}
        mediaHandlers={mediaHandlers}
        actions={
          <>
            {canManage && (
              <Link
                to={ROUTES.labSettings(lab.id)}
                className="inline-flex items-center justify-center rounded-card border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-fg hover:bg-surface-raised"
              >
                Lab settings
              </Link>
            )}
            <Button
              type="button"
              variant={followingLab ? 'outline' : 'primary'}
              disabled={busy || !user}
              onClick={() => void toggleFollowLab()}
            >
              {followingLab ? 'Following' : 'Follow lab'}
            </Button>
          </>
        }
      >
        {lab.websiteUrl && (
          <a
            href={lab.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-brand hover:underline"
          >
            Lab website
          </a>
        )}
        {lab.description && (
          <div className="mt-4 text-sm leading-relaxed text-fg-muted prose-invert max-w-none">
            <Markdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="text-fg">{children}</strong>,
              }}
            >
              {lab.description}
            </Markdown>
          </div>
        )}
      </EditableEntityBanner>

      <section className="rounded-card border border-border bg-surface-card p-5 sm:p-6">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-fg-subtle">Members</dt>
            <dd className="mt-0.5 text-lg font-medium tabular-nums text-fg">{lab.memberIds.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-subtle">Followers</dt>
            <dd className="mt-0.5 text-lg font-medium tabular-nums text-fg">{followerCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-subtle">Open roles</dt>
            <dd className="mt-0.5 text-lg font-medium tabular-nums text-fg">{jobs.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-subtle">Posts</dt>
            <dd className="mt-0.5 text-lg font-medium tabular-nums text-fg">{rows.length}</dd>
          </div>
        </dl>

        {isMember && !onProfile && (
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 px-3 py-2 text-sm text-fg-muted">
            You are a member of this lab.{' '}
            <button
              type="button"
              className="font-medium text-brand hover:underline"
              disabled={busy}
              onClick={() => void addLabToProfile()}
            >
              Add it to my profile
            </button>
          </div>
        )}
      </section>

      {piUser && (
        <section className="rounded-card border border-border bg-surface-card p-5">
          <h2 className="font-display text-lg text-fg">Principal investigator</h2>
          <Link
            to={ROUTES.profile(piUser.uid)}
            className="mt-3 flex items-center gap-3 rounded-lg border border-border/80 bg-surface/40 p-3 transition hover:border-brand/40"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-surface-raised text-sm font-medium text-fg">
              {piUser.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-fg">{piUser.name}</p>
              <p className="text-xs text-fg-subtle">
                {roleLabel(piUser.role)} · {piUser.institutionName ?? 'Institution'}
              </p>
            </div>
          </Link>
        </section>
      )}

      {members.length > 0 && (
        <section>
          <h2 className="font-display text-lg text-fg">Team</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {members.map(({ uid, user: m }) => (
              <li key={uid}>
                <Link
                  to={ROUTES.profile(uid)}
                  className="flex items-center gap-3 rounded-card border border-border bg-surface-card px-3 py-2.5 transition hover:border-brand/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-raised text-xs font-medium text-fg-muted">
                    {m.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">
                      {m.name}
                      {uid === lab.piId && (
                        <span className="ml-1.5 text-[10px] font-normal uppercase text-brand">PI</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-fg-subtle">{roleLabel(m.role)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {lab.researchAreas?.length > 0 && (
        <section>
          <h2 className="font-display text-lg text-fg">Research areas</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {lab.researchAreas.map((a) => (
              <span
                key={a}
                className="rounded-full border border-border bg-surface-card px-2.5 py-0.5 text-xs text-fg-subtle"
              >
                {a}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg text-fg">Open roles</h2>
          <Link to={ROUTES.jobs} className="text-xs text-brand hover:underline">
            All jobs
          </Link>
        </div>
        {jobs.length === 0 ? (
          <p className="mt-2 text-sm text-fg-muted">No active listings for this lab.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {jobs.map((j) => (
              <li key={j.id}>
                <Link
                  to={ROUTES.job(j.id)}
                  className="block rounded-card border border-border bg-surface-card px-4 py-3 transition hover:border-brand/40"
                >
                  <p className="text-sm font-medium text-fg">{j.title}</p>
                  {j.positionType && (
                    <p className="mt-1 text-xs text-fg-subtle">{j.positionType}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg text-fg">Lab feed</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Posts published on behalf of this lab. Members-only posts are visible to lab members.
        </p>
        <div className="mt-4 space-y-4">
          {rows.map((row) => (
            <PostCard key={row.post.id} row={row} viewerUid={user?.uid} onChanged={() => void load()} />
          ))}
          {rows.length === 0 && (
            <p className="rounded-card border border-dashed border-border px-4 py-6 text-center text-sm text-fg-muted">
              No posts linked to this lab yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
