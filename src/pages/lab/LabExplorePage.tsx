import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import type { InstitutionRecord } from '../../constants/institutions';
import { Input } from '../../components/ui/Input';
import { InstitutionLabPicker } from '../../components/lab/InstitutionLabPicker';
import { roleLabel } from '../../utils/roleLabels';
import {
  isDemoEcosystemAvailable,
  loadFeaturedLabSearchResults,
} from '../../lib/demoEcosystem';
import { mergeInstitutionLogos } from '../../lib/institutions';
import {
  fetchInstitutionsWithLabs,
  filterLabSearchResults,
  listLabsByInstitution,
  searchLabsAndProfessors,
  type LabSearchResult,
} from '../../utils/labSearch';

function LabResultList({ list }: { list: LabSearchResult[] }) {
  return (
    <ul className="space-y-3">
      {list.map(({ lab, piName, piUid, piRole }) => (
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
              {piRole ? <span className="text-fg-subtle"> · {roleLabel(piRole)}</span> : null}
            </p>
            <p className="mt-1 text-xs text-fg-subtle">
              {lab.institutionName ?? 'Institution'}
              {lab.department ? ` · ${lab.department}` : ''}
              {' · '}
              {lab.memberIds.length} member{lab.memberIds.length === 1 ? '' : 's'}
            </p>
            {lab.description ? (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-fg-muted">
                {lab.description.replace(/\*\*/g, '')}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function LabExplorePage() {
  const [query, setQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionRecord | null>(
    null
  );
  const [institutionsWithLabs, setInstitutionsWithLabs] = useState<InstitutionRecord[]>([]);
  const [institutionLabs, setInstitutionLabs] = useState<LabSearchResult[]>([]);
  const [results, setResults] = useState<LabSearchResult[]>([]);
  const [featured, setFeatured] = useState<LabSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [institutionLoading, setInstitutionLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady || !db) {
      setFeatured([]);
      setInstitutionsWithLabs([]);
      setFeaturedLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setFeaturedLoading(true);
      try {
        const fs = db;
        if (!fs) return;
        const [instRows, demoOk] = await Promise.all([
          mergeInstitutionLogos(fs, await fetchInstitutionsWithLabs(fs)),
          isDemoEcosystemAvailable(fs),
        ]);
        if (!cancelled) setInstitutionsWithLabs(instRows);
        if (demoOk) {
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
    if (!selectedInstitution || !firebaseReady || !db) {
      setInstitutionLabs([]);
      setInstitutionLoading(false);
      return;
    }
    let cancelled = false;
    setInstitutionLoading(true);
    setError(null);
    void (async () => {
      try {
        const fs = db;
        if (!fs) return;
        const rows = await listLabsByInstitution(fs, selectedInstitution);
        if (!cancelled) setInstitutionLabs(rows);
      } catch {
        if (!cancelled) {
          setInstitutionLabs([]);
          setError('Could not load labs for this institution.');
        }
      } finally {
        if (!cancelled) setInstitutionLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedInstitution]);

  useEffect(() => {
    const term = query.trim();
    if (selectedInstitution || term.length < 2 || !firebaseReady || !db) {
      setResults([]);
      if (!selectedInstitution) setError(null);
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
  }, [query, selectedInstitution]);

  const institutionList = useMemo(() => {
    if (!selectedInstitution) return [];
    return filterLabSearchResults(institutionLabs, query);
  }, [selectedInstitution, institutionLabs, query]);

  const showFeatured = !selectedInstitution && query.trim().length < 2;
  const list = selectedInstitution ? institutionList : showFeatured ? featured : results;
  const listLoading = selectedInstitution
    ? institutionLoading
    : showFeatured
      ? featuredLoading
      : loading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-fg">Find labs</h1>
        <p className="mt-2 max-w-xl text-sm text-fg-muted">
          Browse by school or institution, or search by lab name, PI, and research area.
        </p>
      </div>

      <InstitutionLabPicker
        institutionsWithLabs={institutionsWithLabs}
        value={selectedInstitution}
        onChange={setSelectedInstitution}
        loading={featuredLoading}
      />

      <div>
        <label htmlFor="lab-explore-search" className="sr-only">
          Search labs and professors
        </label>
        <Input
          id="lab-explore-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            selectedInstitution
              ? `Filter labs at ${selectedInstitution.name}…`
              : 'e.g. Rivera Lab, neuroscience…'
          }
          autoComplete="off"
          className="w-full"
        />
        <p className="mt-2 text-xs text-fg-subtle">
          {selectedInstitution
            ? institutionLoading
              ? `Loading labs at ${selectedInstitution.name}…`
              : query.trim().length >= 2
                ? `Showing matches within ${selectedInstitution.name}.`
                : `${institutionList.length} lab${institutionList.length === 1 ? '' : 's'} at ${selectedInstitution.name}.`
            : showFeatured
              ? 'Featured labs below — pick an institution above or type 2+ characters to search.'
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

      {!listLoading &&
        !error &&
        selectedInstitution &&
        institutionList.length === 0 && (
          <div className="rounded-card border border-border bg-surface-card p-6 text-sm text-fg-muted">
            {query.trim().length >= 2 ? (
              <>
                No labs at {selectedInstitution.name} matched &quot;{query.trim()}&quot;. Try a
                different filter or clear the search box.
              </>
            ) : (
              <>
                No labs listed for {selectedInstitution.name} yet. Professors can create a lab
                from <Link to={ROUTES.labCreate} className="text-brand hover:underline">Create lab</Link>.
              </>
            )}
          </div>
        )}

      {!listLoading &&
        !error &&
        !selectedInstitution &&
        query.trim().length >= 2 &&
        list.length === 0 && (
          <div className="rounded-card border border-border bg-surface-card p-6 text-sm text-fg-muted">
            No labs matched &quot;{query.trim()}&quot;. Try a different spelling, pick an
            institution above, or search by the professor&apos;s name.
          </div>
        )}

      {!listLoading && showFeatured && featured.length > 0 && (
        <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Featured labs
        </p>
      )}

      {!listLoading && showFeatured && featured.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-surface/40 p-6 text-sm text-fg-muted">
          Pick a school above or start typing to discover labs — or run{' '}
          <code className="text-fg-soft">npm run seed:firestore</code> for sample labs at MIT,
          Stanford, and Berkeley.
        </div>
      )}

      {!listLoading && selectedInstitution && institutionList.length > 0 && (
        <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Labs at {selectedInstitution.name}
        </p>
      )}

      {!listLoading && list.length > 0 && <LabResultList list={list} />}

      <p className="text-center text-sm text-fg-subtle">
        <Link to={ROUTES.labs} className="text-brand hover:underline">
          My Labs
        </Link>
        {' · labs you belong to'}
      </p>
    </div>
  );
}
