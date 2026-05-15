import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import Markdown from 'react-markdown';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { formatTimeAgo } from '../../utils/timeAgo';
import type { JobPost, Lab } from '../../types';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [job, setJob] = useState<JobPost | null>(null);
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!jobId || !firebaseReady || !db) {
      setJob(null);
      setLoading(false);
      return;
    }
    void (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'jobs', jobId));
        if (!snap.exists()) {
          setJob(null);
          return;
        }
        const j: JobPost = { id: snap.id, ...(snap.data() as Omit<JobPost, 'id'>) };
        setJob(j);
        if (j.labId) {
          const ls = await getDoc(doc(db, 'labs', j.labId));
          setLab(ls.exists() ? { id: ls.id, ...(ls.data() as Omit<Lab, 'id'>) } : null);
        } else {
          setLab(null);
        }
        if (user?.uid) {
          const s = await getDoc(doc(db, 'users', user.uid, 'saved_jobs', jobId));
          setSaved(s.exists());
        }
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId, user?.uid]);

  const toggleSave = async () => {
    if (!user?.uid || !db || !jobId) return;
    const ref = doc(db, 'users', user.uid, 'saved_jobs', jobId);
    try {
      if (saved) {
        await deleteDoc(ref);
        setSaved(false);
        showToast('Removed from saved.', 'info');
      } else {
        await setDoc(ref, { jobId, savedAt: new Date() });
        setSaved(true);
        showToast('Saved.', 'success');
      }
    } catch {
      showToast('Could not update saved list.', 'error');
    }
  };

  const share = async () => {
    const url = `${window.location.origin}${ROUTES.job(jobId ?? '')}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied.', 'success');
    } catch {
      showToast('Could not copy.', 'error');
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-card border border-border bg-surface-raised/50" />;
  }

  if (!job || !job.active) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-fg-muted">This position is not available.</p>
        <Link to={ROUTES.jobs} className="text-sm text-brand hover:underline">
          All positions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 text-sm">
        <Link to={ROUTES.jobs} className="text-brand hover:underline">
          ← Positions
        </Link>
      </div>

      <header className="rounded-card border border-border bg-surface-card p-5">
        <h1 className="font-display text-2xl text-fg">{job.title}</h1>
        <p className="mt-2 text-sm text-fg-muted">
          {job.institutionName ?? 'Institution'}
          {job.department ? ` · ${job.department}` : ''}
          {job.location ? ` · ${job.location}` : ''}
          {job.remote ? ' · Remote OK' : ''}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-subtle">
            {job.positionType ?? 'Role'}
          </span>
          {job.deadline && (
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-subtle">
              Apply by {job.deadline}
            </span>
          )}
          <span className="text-xs text-fg-subtle">Posted {formatTimeAgo(job.createdAt)}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {job.applicationUrl && (
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-card bg-brand px-4 py-2 text-sm font-medium text-fg hover:bg-brand-muted"
            >
              Apply
            </a>
          )}
          <button
            type="button"
            onClick={() => void toggleSave()}
            className={`rounded-card border px-4 py-2 text-sm font-medium ${
              saved ? 'border-brand text-brand' : 'border-border text-fg'
            }`}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => void share()}
            className="rounded-card border border-border px-4 py-2 text-sm text-fg hover:bg-surface-raised"
          >
            Share
          </button>
        </div>
      </header>

      {lab && (
        <section className="rounded-card border border-border bg-surface-card p-5">
          <h2 className="text-sm font-semibold text-fg">About the lab</h2>
          <Link to={ROUTES.lab(lab.id)} className="mt-2 inline-block text-sm text-brand hover:underline">
            {lab.name}
          </Link>
          <p className="mt-2 text-sm text-fg-muted line-clamp-4">{lab.description}</p>
        </section>
      )}

      <section className="rounded-card border border-border bg-surface-card p-5">
        <h2 className="text-sm font-semibold text-fg">Description</h2>
        <div className="mt-3 max-w-none text-sm text-fg-muted [&_p]:mb-2 [&_p:last-child]:mb-0">
          <Markdown>{job.description}</Markdown>
        </div>
      </section>
    </div>
  );
}
