import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { loadRecentPapers } from '../../lib/demoEcosystem';
import { useFilterModalDraft } from '../../hooks/useFilterModalDraft';
import { FilterModal } from '../../components/shared/FilterModal';
import { ListPageFilterBar } from '../../components/shared/ListPageFilterBar';
import { PapersFilterFields } from '../../components/papers/PapersFilterFields';
import {
  DEFAULT_PAPER_FILTERS,
  clearPaperFilterChip,
  countPaperModalFilters,
  filterPapers,
  hasActivePaperFilters,
  paperFilterChips,
  type PaperFilterChip,
} from '../../utils/paperFilters';
import type { Paper } from '../../types';

export function PapersPage() {
  const [papers, setPapers] = useState<(Paper & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_PAPER_FILTERS);
  const filterModal = useFilterModalDraft(filters);

  useEffect(() => {
    if (!firebaseReady || !db) {
      setPapers([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const fs = db;
        if (!fs) return;
        const rows = await loadRecentPapers(fs);
        if (!cancelled) setPapers(rows);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => filterPapers(papers, filters), [papers, filters]);
  const chips = useMemo(
    () => paperFilterChips(filters).map((c) => ({ id: c.id, label: c.label })),
    [filters]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-fg">Papers</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Recent publications shared on THE ERUDIS — search and filter by year, venue, and more.
        </p>
      </div>

      <ListPageFilterBar
        searchId="papers-search"
        search={filters.query}
        onSearchChange={(query) => setFilters((f) => ({ ...f, query }))}
        searchPlaceholder="Title, author, venue, abstract…"
        onOpenFilters={() => filterModal.setOpen(true)}
        activeFilterCount={countPaperModalFilters(filters)}
        chips={chips}
        onRemoveChip={(id) =>
          setFilters((f) => clearPaperFilterChip(f, id as PaperFilterChip['id']))
        }
        onClearAll={
          hasActivePaperFilters(filters) ? () => setFilters(DEFAULT_PAPER_FILTERS) : undefined
        }
        resultSummary={
          !loading
            ? `${filtered.length} of ${papers.length} ${papers.length === 1 ? 'paper' : 'papers'}`
            : undefined
        }
      />

      <FilterModal
        open={filterModal.open}
        title="Filter papers"
        subtitle="Refine by publication year, venue, arXiv, and sort order."
        onClose={filterModal.close}
        onApply={() => filterModal.apply(setFilters)}
        onReset={() => filterModal.setDraft(DEFAULT_PAPER_FILTERS)}
      >
        <PapersFilterFields filters={filterModal.draft} onChange={filterModal.setDraft} />
      </FilterModal>

      {loading && (
        <div className="space-y-3" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-card border border-border bg-surface-raised/40"
            />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="rounded-card border border-border bg-surface-card px-4 py-6 text-center text-sm text-fg-muted">
          No papers match these filters.
        </p>
      )}

      <ul className="space-y-3">
        {!loading &&
          filtered.map((p) => (
            <li
              key={p.id}
              className="rounded-card border border-border bg-surface-card p-4"
            >
              <p className="font-medium text-fg">{p.title}</p>
              <p className="mt-1 text-sm text-fg-muted">{p.authors.join(', ')}</p>
              <p className="mt-2 text-xs text-fg-subtle">
                {p.venue ?? 'Venue TBD'}
                {p.publicationYear ? ` · ${p.publicationYear}` : ''}
                {(p.resonateCount ?? 0) > 0 && (
                  <span className="text-brand"> · {p.resonateCount} resonates</span>
                )}
              </p>
              {p.abstract && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-fg-muted">
                  {p.abstract}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline"
                  >
                    Open link
                  </a>
                )}
                {p.arxivId && (
                  <a
                    href={`https://arxiv.org/abs/${p.arxivId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline"
                  >
                    arXiv
                  </a>
                )}
                <Link to={ROUTES.discover} className="text-fg-subtle hover:text-fg">
                  Discover posts
                </Link>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
