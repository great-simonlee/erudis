import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import type { ResearchLog, ResearchLogType } from '../../types';

const TABS: { id: ResearchLogType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'experiment', label: 'Experiment' },
  { id: 'paper_review', label: 'Paper review' },
  { id: 'idea', label: 'Idea' },
  { id: 'result', label: 'Result' },
  { id: 'writing', label: 'Writing' },
  { id: 'other', label: 'Other' },
];

export function ProfileLogsPage() {
  const { uid } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState<ResearchLogType | 'all'>('all');
  const [allLogs, setAllLogs] = useState<ResearchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const displayed = useMemo(() => {
    let base = tab === 'all' ? allLogs : allLogs.filter((l) => l.type === tab);
    if (uid && user?.uid !== uid) {
      base = base.filter((l) => l.isPublic);
    }
    return base;
  }, [allLogs, tab, uid, user?.uid]);

  useEffect(() => {
    if (!uid || !db || !firebaseReady) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const qy = query(
          collection(db, 'research_logs'),
          where('userId', '==', uid),
          orderBy('createdAt', 'desc'),
          limit(200)
        );
        const snap = await getDocs(qy);
        if (cancelled) return;
        setAllLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ResearchLog, 'id'>) })));
      } catch {
        if (!cancelled) setAllLogs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  if (!uid) return <p className="text-sm text-fg-muted">Missing user id.</p>;

  return (
    <div>
      <Link to={ROUTES.profile(uid)} className="text-xs text-brand hover:underline">
        ← Back to profile
      </Link>
      <h1 className="mt-4 font-display text-2xl text-fg">Research logs</h1>
      <div className="mt-4 flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === t.id
                ? 'bg-brand text-white'
                : 'border border-border text-fg-muted hover:bg-surface-raised'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-fg-muted">Loading…</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {displayed.map((log) => (
            <li key={log.id} className="rounded-card border border-border bg-surface-card">
              <button
                type="button"
                onClick={() => setOpenId((id) => (id === log.id ? null : log.id))}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
              >
                <div>
                  <p className="text-xs text-fg-subtle">
                    {log.date} · {log.type}
                    {!log.isPublic && <span className="ml-2">🔒</span>}
                  </p>
                  <p className="mt-1 font-medium text-fg">{log.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{log.content}</p>
                </div>
                <span className="text-fg-subtle">{openId === log.id ? '▲' : '▼'}</span>
              </button>
              {openId === log.id && (
                <div className="border-t border-border px-4 py-3 text-sm text-fg-muted">
                  <Markdown>{log.content}</Markdown>
                </div>
              )}
            </li>
          ))}
          {displayed.length === 0 && (
            <li className="text-sm text-fg-muted">No logs in this filter.</li>
          )}
        </ul>
      )}
    </div>
  );
}
