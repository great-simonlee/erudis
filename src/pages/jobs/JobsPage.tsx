import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import Markdown from 'react-markdown';
import { db, firebaseReady } from '../../lib/firebase';
import { RESEARCH_FIELD_CATALOG, ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { formatTimeAgo } from '../../utils/timeAgo';
import type { JobPost } from '../../types';

const POSITION_TYPES = [
  'Any',
  'Tenure-track',
  'Postdoc',
  'PhD Position',
  'Research Scientist',
  'Industry',
] as const;

const LOCATIONS = ['Any', 'USA', 'Europe', 'Asia', 'Remote'] as const;

function positionBadgeClass(t: string | undefined): string {
  const x = (t ?? '').toLowerCase();
  if (x.includes('tenure')) return 'bg-amber-500/15 text-amber-100 border-amber-500/35';
  if (x.includes('postdoc')) return 'bg-sky-600/20 text-sky-100 border-sky-500/40';
  if (x.includes('phd')) return 'bg-brand/15 text-brand border-brand/40';
  if (x.includes('scientist')) return 'bg-violet-600/20 text-violet-100 border-violet-500/40';
  if (x.includes('industry')) return 'bg-zinc-600/25 text-zinc-200 border-zinc-500/40';
  return 'bg-surface-raised text-fg-muted border-border';
}

export function JobsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [positionType, setPositionType] = useState<string>('Any');
  const [location, setLocation] = useState<string>('Any');
  const [field, setField] = useState<string>('Any');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!firebaseReady || !db) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const qy = query(
        collection(db, 'jobs'),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(80)
      );
      const snap = await getDocs(qy);
      const rows: JobPost[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<JobPost, 'id'>),
      }));
      setJobs(rows);
      if (user?.uid) {
        const savedSnap = await getDocs(collection(db, 'users', user.uid, 'saved_jobs'));
        setSavedIds(new Set(savedSnap.docs.map((d) => d.id)));
      } else {
        setSavedIds(new Set());
      }
    } catch {
      setJobs([]);
      showToast('Could not load positions.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps -- showToast stable

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let rows = jobs;
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          (j.institutionName ?? '').toLowerCase().includes(q)
      );
    }
    if (positionType !== 'Any') {
      rows = rows.filter((j) => (j.positionType ?? '').includes(positionType));
    }
    if (location !== 'Any') {
      rows = rows.filter((j) => {
        const loc = (j.location ?? '').toLowerCase();
        const rem = j.remote ? 'remote' : '';
        if (location === 'Remote') return j.remote === true || loc.includes('remote');
        return loc.includes(location.toLowerCase()) || rem.includes('remote');
      });
    }
    if (field !== 'Any') {
      rows = rows.filter((j) => (j.description + j.title).includes(field));
    }
    return rows;
  }, [jobs, search, positionType, location, field]);

  const toggleSave = async (jobId: string) => {
    if (!user?.uid || !db) {
      showToast('Sign in to save positions.', 'error');
      return;
    }
    const ref = doc(db, 'users', user.uid, 'saved_jobs', jobId);
    try {
      if (savedIds.has(jobId)) {
        await deleteDoc(ref);
        setSavedIds((prev) => {
          const n = new Set(prev);
          n.delete(jobId);
          return n;
        });
        showToast('Removed from saved.', 'info');
      } else {
        await setDoc(ref, { jobId, savedAt: new Date() });
        setSavedIds((prev) => new Set(prev).add(jobId));
        showToast('Saved position.', 'success');
      }
    } catch {
      showToast('Could not update saved list.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-fg">Positions</h1>
          <p className="mt-2 text-sm text-fg-muted">
            Research openings from labs and institutions. UI uses “Position”; data path stays{' '}
            <code className="text-fg-soft">/jobs</code>.
          </p>
        </div>
        <Link
          to={ROUTES.jobsPost}
          className="rounded-card border border-border bg-surface-card px-3 py-2 text-sm font-medium text-fg hover:border-brand/40"
        >
          Post a position
        </Link>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search titles, institutions, descriptions…"
        className="w-full rounded-card border border-border bg-surface-card px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle"
      />

      <div className="flex flex-wrap gap-2">
        <span className="w-full text-xs font-medium text-fg-subtle">Position type</span>
        {POSITION_TYPES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPositionType(p)}
            className={`rounded-full border px-3 py-1 text-xs ${
              positionType === p
                ? 'border-brand bg-brand/15 text-brand'
                : 'border-border text-fg-muted hover:border-fg-subtle'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="w-full text-xs font-medium text-fg-subtle">Location</span>
        {LOCATIONS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setLocation(p)}
            className={`rounded-full border px-3 py-1 text-xs ${
              location === p
                ? 'border-brand bg-brand/15 text-brand'
                : 'border-border text-fg-muted hover:border-fg-subtle'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="w-full text-xs font-medium text-fg-subtle">Field keyword</span>
        {['Any', ...RESEARCH_FIELD_CATALOG.slice(0, 12)].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setField(p)}
            className={`rounded-full border px-3 py-1 text-xs ${
              field === p
                ? 'border-brand bg-brand/15 text-brand'
                : 'border-border text-fg-muted hover:border-fg-subtle'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-card border border-border bg-surface-raised/40" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-sm text-fg-muted">No positions match these filters.</p>
      )}

      <ul className="space-y-4">
        {!loading &&
          filtered.map((j) => {
            const postedMs = j.createdAt?.toMillis?.() ?? 0;
            const fresh = Date.now() - postedMs < 24 * 60 * 60 * 1000;
            const deadlineStr = j.deadline ?? '';
            let deadlineSoon = false;
            if (deadlineStr) {
              const d = new Date(deadlineStr).getTime();
              if (!Number.isNaN(d)) deadlineSoon = d - Date.now() < 7 * 24 * 60 * 60 * 1000 && d > Date.now();
            }
            return (
              <li
                key={j.id}
                className="rounded-card border border-border bg-surface-card p-4 transition hover:border-brand/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {j.sponsored && (
                        <span className="rounded border border-amber-500/50 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
                          Sponsored
                        </span>
                      )}
                      {fresh && (
                        <span className="rounded border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
                          New — be among the first to apply
                        </span>
                      )}
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase ${positionBadgeClass(j.positionType)}`}
                      >
                        {j.positionType ?? 'Position'}
                      </span>
                    </div>
                    <Link to={ROUTES.job(j.id)} className="mt-1 block font-display text-lg text-fg hover:text-brand">
                      {j.title}
                    </Link>
                    <p className="mt-1 text-sm text-fg-muted">
                      {j.institutionName ?? 'Institution'}
                      {j.department ? ` · ${j.department}` : ''}
                      {j.location ? ` · ${j.location}` : ''}
                      {j.remote ? ' · Remote OK' : ''}
                    </p>
                    <div className="mt-2 line-clamp-2 text-xs text-fg-subtle">
                      <Markdown
                        components={{
                          p: ({ children }) => <span className="inline">{children} </span>,
                        }}
                      >
                        {j.description.slice(0, 220)}
                      </Markdown>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-fg-subtle">
                      <span>Posted {formatTimeAgo(j.createdAt)}</span>
                      {deadlineStr && (
                        <span className={deadlineSoon ? 'font-medium text-red-300' : ''}>
                          Apply by {deadlineStr}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleSave(j.id)}
                      className={`rounded-card border px-3 py-1.5 text-xs font-medium ${
                        savedIds.has(j.id) ? 'border-brand text-brand' : 'border-border text-fg-muted'
                      }`}
                    >
                      {savedIds.has(j.id) ? 'Saved' : 'Save'}
                    </button>
                    <Link
                      to={ROUTES.job(j.id)}
                      className="rounded-card bg-brand px-3 py-1.5 text-center text-xs font-medium text-fg hover:bg-brand-muted"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
