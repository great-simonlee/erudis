import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import type { Lab } from '../../types';

export function LabsPage() {
  const { profile, user } = useAuth();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady || !db || !profile?.labIds?.length) {
      setLabs([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const rows: Lab[] = [];
      try {
        for (const id of profile.labIds) {
          const s = await getDoc(doc(db, 'labs', id));
          if (s.exists()) {
            rows.push({ id: s.id, ...(s.data() as Omit<Lab, 'id'>) });
          }
        }
        if (!cancelled) setLabs(rows);
      } catch {
        if (!cancelled) setLabs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.labIds]);

  const canCreate = profile?.role === 'professor';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-fg">My Labs</h1>
          <p className="mt-2 text-sm text-fg-muted">
            Labs linked to your profile. Open a lab page to follow updates or manage settings as PI.
          </p>
        </div>
        {canCreate && (
          <Link
            to={ROUTES.labCreate}
            className="inline-flex items-center justify-center rounded-card bg-brand px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-brand-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Create lab
          </Link>
        )}
      </div>

      {loading && (
        <div className="space-y-3" aria-busy="true">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-card border border-border bg-surface-raised/40" />
          ))}
        </div>
      )}

      {!loading && labs.length === 0 && (
        <div className="rounded-card border border-border bg-surface-card p-6 text-sm text-fg-muted">
          <p>You have not linked any labs yet.</p>
          {canCreate ? (
            <p className="mt-2">
              <Link className="font-medium text-brand hover:underline" to={ROUTES.labCreate}>
                Create a lab
              </Link>{' '}
              or join one during onboarding.
            </p>
          ) : (
            <p className="mt-2">Join a lab from onboarding or ask your PI to add your account id.</p>
          )}
        </div>
      )}

      <ul className="space-y-3">
        {!loading &&
          labs.map((lab) => (
            <li key={lab.id}>
              <Link
                to={ROUTES.lab(lab.id)}
                className="block rounded-card border border-border bg-surface-card p-4 transition hover:border-brand/40"
              >
                <p className="font-medium text-fg">{lab.name}</p>
                <p className="mt-1 text-xs text-fg-muted">
                  {lab.institutionName ?? 'Institution'} · {lab.memberIds.length} members
                </p>
                {user?.uid === lab.piId && (
                  <p className="mt-2 text-xs text-brand">You are the PI — settings available.</p>
                )}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
