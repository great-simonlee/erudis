import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { Input } from '../../components/ui/Input';
import { roleLabel } from '../../utils/roleLabels';
import {
  isDemoEcosystemAvailable,
  loadFeaturedLabSearchResults,
} from '../../lib/demoEcosystem';
import { searchLabsAndProfessors, type LabSearchResult } from '../../utils/labSearch';

export function LabExplorePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LabSearchResult[]>([]);
  const [featured, setFeatured] = useState<LabSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady || !db) {
      setFeatured([]);
      setFeaturedLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setFeaturedLoading(true);
      try {
        const fs = db;
        if (!fs) return;
        if (await isDemoEcosystemAvailable(fs)) {
          const rows = await loadFeaturedLabSearchResults(fs);
          if (!cancelled) setFeatured(rows);
        } else if (!cancelled) {
          setFeatured([]);
        }
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2 || !firebaseReady || !db) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const firestore = db;
          if (!firestore) return;
          setResults(await searchLabsAndProfessors(firestore, term));
        } catch {
          setResults([]);
          setError('Search is temporarily unavailable. Try again in a moment.');
        } finally {
          setLoading(false);
        }
      })();
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query]);

  const showFeatured = query.trim().length < 2;
  const list = showFeatured ? featured : results;
  const listLoading = showFeatured ? featuredLoading : loading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-fg">Find labs</h1>
        <p className="mt-2 max-w-xl text-sm text-fg-muted">
          Search labs run by professors — by lab name, PI name, institution, or research area.
        </p>
      </div>

      <div>
        <label htmlFor="lab-explore-search" className="sr-only">
          Search labs and professors
        </label>
        <Input
          id="lab-explore-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Rivera Lab, MIT, neuroscience…"
          autoComplete="off"
          className="w-full"
        />
        <p className="mt-2 text-xs text-fg-subtle">
          {showFeatured
            ? 'Featured labs below — or type 2+ characters to search the network.'
            : 'Results include labs whose PI matches your search.'}
        </p>
      </div>

      {listLoading && (
        <div className="space-y-3" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-card border border-border bg-surface-raised/40"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {!listLoading && !error && !showFeatured && query.trim().length >= 2 && list.length === 0 && (
        <div className="rounded-card border border-border bg-surface-card p-6 text-sm text-fg-muted">
          No labs matched &quot;{query.trim()}&quot;. Try a different spelling or search by the
          professor&apos;s name.
        </div>
      )}

      {!listLoading && showFeatured && featured.length > 0 && (
        <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Featured labs
        </p>
      )}

      {!listLoading && showFeatured && featured.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-surface/40 p-6 text-sm text-fg-muted">
          Start typing to discover labs — or run <code className="text-fg-soft">npm run seed:firestore</code>{' '}
          for sample labs at MIT, Stanford, and Berkeley.
        </div>
      )}

      <ul className="space-y-3">
        {!listLoading &&
          list.map(({ lab, piName, piUid, piRole }) => (
            <li key={lab.id}>
              <Link
                to={ROUTES.lab(lab.id)}
                className="block rounded-card border border-border bg-surface-card p-4 transition hover:border-brand/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium text-fg">{lab.name}</p>
                  {lab.researchAreas?.[0] && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-fg-subtle">
                      {lab.researchAreas[0]}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-fg-muted">
                  <Link
                    to={ROUTES.profile(piUid)}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-fg-soft hover:text-brand"
                  >
                    {piName}
                  </Link>
                  {piRole && (
                    <span className="text-fg-subtle"> · {roleLabel(piRole)}</span>
                  )}
                </p>
                <p className="mt-1 text-xs text-fg-subtle">
                  {lab.institutionName ?? 'Institution'}
                  {lab.department ? ` · ${lab.department}` : ''}
                  {' · '}
                  {lab.memberIds.length} member{lab.memberIds.length === 1 ? '' : 's'}
                </p>
                {lab.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-fg-muted">
                    {lab.description.replace(/\*\*/g, '')}
                  </p>
                )}
              </Link>
            </li>
          ))}
      </ul>

      <p className="text-center text-sm text-fg-subtle">
        <Link to={ROUTES.labs} className="text-brand hover:underline">
          My Labs
        </Link>
        {' · labs you belong to'}
      </p>
    </div>
  );
}
