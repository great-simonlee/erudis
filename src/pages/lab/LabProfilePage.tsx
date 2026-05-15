import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { PostCard } from '../../components/feed/PostCard';
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

export function LabProfilePage() {
  const { labId } = useParams<{ labId: string }>();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
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
    try {
      const labSnap = await getDoc(doc(db, 'labs', labId));
      if (!labSnap.exists()) {
        setLab(null);
        setRows([]);
        setJobs([]);
        setLoading(false);
        return;
      }
      const L: Lab = { id: labSnap.id, ...(labSnap.data() as Omit<Lab, 'id'>) };
      setLab(L);

      const postsQy = query(
        collection(db, 'posts'),
        where('labId', '==', labId),
        orderBy('createdAt', 'desc'),
        limit(40)
      );
      const postsSnap = await getDocs(postsQy);
      const posts: Post[] = postsSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }))
        .filter((p) => canSeePost(p, user?.uid, L.memberIds));

      const authorCache = new Map<string, User | null>();
      const resolved: FeedRow[] = [];
      for (const post of posts) {
        let author = authorCache.get(post.authorId);
        if (author === undefined) {
          const u = await getDoc(doc(db, 'users', post.authorId));
          author = u.exists()
            ? ({ uid: u.id, ...(u.data() as Omit<User, 'uid'>) } as User)
            : null;
          authorCache.set(post.authorId, author);
        }
        resolved.push({ post, author, lab: L });
      }
      setRows(resolved);

      const js = await getDocs(
        query(collection(db, 'jobs'), where('labId', '==', labId), limit(20))
      );
      setJobs(
        js.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<JobPost, 'id'>),
          }))
          .filter((j) => j.active !== false)
      );

      const fc = await getCountFromServer(collection(db, 'labs', labId, 'followers'));
      setFollowerCount(fc.data().count);

      if (user?.uid) {
        const f = await getDoc(doc(db, 'labs', labId, 'followers', user.uid));
        setFollowingLab(f.exists());
      } else {
        setFollowingLab(false);
      }
    } catch {
      setLab(null);
      setRows([]);
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
  const isPi = useMemo(
    () => !!(user?.uid && lab && lab.piId === user.uid),
    [user?.uid, lab]
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
        <div className="h-32 animate-pulse rounded-card border border-border bg-surface-raised/50" />
        <div className="h-48 animate-pulse rounded-card border border-border bg-surface-raised/50" />
      </div>
    );
  }

  if (!lab) {
    return <p className="text-sm text-fg-muted">Lab not found.</p>;
  }

  const onProfile = !!(labId && profile?.labIds?.includes(labId));

  return (
    <div className="space-y-8">
      <section className="rounded-card border border-border bg-surface-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl text-fg">{lab.name}</h1>
            <p className="mt-1 text-sm text-fg-muted">
              {lab.institutionName ?? 'Institution'}{' '}
              {lab.department ? `· ${lab.department}` : ''}
            </p>
            {lab.websiteUrl && (
              <a
                href={lab.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-brand hover:underline"
              >
                Website
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isPi && (
              <Link
                to={ROUTES.labSettings(lab.id)}
                className="rounded-card border border-border px-3 py-2 text-sm font-medium text-fg hover:bg-surface-raised"
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
          </div>
        </div>
        {lab.description && (
          <p className="mt-4 text-sm leading-relaxed text-fg-muted">{lab.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-fg-muted">
          <span>
            <strong className="text-fg">{lab.memberIds.length}</strong> members
          </span>
          <span>
            <strong className="text-fg">{followerCount}</strong> followers
          </span>
        </div>
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

      {lab.researchAreas?.length > 0 && (
        <section>
          <h2 className="font-display text-lg text-fg">Research areas</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {lab.researchAreas.map((a) => (
              <span key={a} className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-subtle">
                {a}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-lg text-fg">Open roles</h2>
        {jobs.length === 0 ? (
          <p className="mt-2 text-sm text-fg-muted">No active listings.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {jobs.map((j) => (
              <li key={j.id} className="rounded-card border border-border bg-surface-card px-3 py-2">
                <p className="text-sm font-medium text-fg">{j.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-fg-muted">{j.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg text-fg">Lab feed</h2>
        <p className="mt-1 text-sm text-fg-muted">Posts linked to this lab (visibility rules apply).</p>
        <div className="mt-4 space-y-4">
          {rows.map((row) => (
            <PostCard key={row.post.id} row={row} viewerUid={user?.uid} onChanged={() => void load()} />
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-fg-muted">No posts yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
