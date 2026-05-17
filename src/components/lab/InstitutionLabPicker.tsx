import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import {
  INSTITUTION_CATALOG,
  filterInstitutions,
  type InstitutionRecord,
} from '../../constants/institutions';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

type InstitutionLabPickerProps = {
  institutionsWithLabs: readonly InstitutionRecord[];
  value: InstitutionRecord | null;
  onChange: (institution: InstitutionRecord | null) => void;
  loading?: boolean;
};

const SHORT_LABELS: Record<string, string> = {
  'Massachusetts Institute of Technology': 'MIT',
  'Stanford University': 'Stanford',
  'University of California, Berkeley': 'UC Berkeley',
  'University of Cambridge': 'Cambridge',
  'Harvard University': 'Harvard',
  'California Institute of Technology': 'Caltech',
  'Carnegie Mellon University': 'CMU',
  'Georgia Institute of Technology': 'Georgia Tech',
  'ETH Zurich': 'ETH Zurich',
  'Imperial College London': 'Imperial',
  'University of Oxford': 'Oxford',
  'Princeton University': 'Princeton',
  'Yale University': 'Yale',
  'Columbia University': 'Columbia',
  'University of Chicago': 'UChicago',
  'Duke University': 'Duke',
  'Northwestern University': 'Northwestern',
  'Johns Hopkins University': 'Johns Hopkins',
  'University of Pennsylvania': 'Penn',
  'Cornell University': 'Cornell',
  'University of Michigan': 'Michigan',
  'University of Washington': 'UW',
  'University of Toronto': 'Toronto',
  'National University of Singapore': 'NUS',
  'Seoul National University': 'SNU',
  'Korea Advanced Institute of Science and Technology': 'KAIST',
  'Tsinghua University': 'Tsinghua',
  'Peking University': 'Peking U',
  'University of Tokyo': 'UTokyo',
  'Kyoto University': 'Kyoto',
};

function institutionButtonLabel(name: string): string {
  return SHORT_LABELS[name] ?? (name.length > 32 ? `${name.slice(0, 30)}…` : name);
}

export function InstitutionLabPicker({
  institutionsWithLabs,
  value,
  onChange,
  loading = false,
}: InstitutionLabPickerProps) {
  const [search, setSearch] = useState(value?.name ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSearch(value?.name ?? '');
  }, [value?.id, value?.name]);

  const schoolButtons = useMemo(
    () =>
      [...institutionsWithLabs].sort((a, b) => a.name.localeCompare(b.name)),
    [institutionsWithLabs]
  );

  const options = useMemo(() => {
    const withLabs = new Map(institutionsWithLabs.map((r) => [r.id, r]));
    const fromCatalog = filterInstitutions(search, INSTITUTION_CATALOG);
    const merged: InstitutionRecord[] = [];
    const seen = new Set<string>();

    for (const row of institutionsWithLabs) {
      if (seen.has(row.id)) continue;
      if (
        !search.trim() ||
        row.name.toLowerCase().includes(search.trim().toLowerCase())
      ) {
        merged.push(row);
        seen.add(row.id);
      }
    }

    for (const row of fromCatalog) {
      if (seen.has(row.id)) continue;
      merged.push(row);
      seen.add(row.id);
    }

    merged.sort((a, b) => {
      const aHas = withLabs.has(a.id) ? 0 : 1;
      const bHas = withLabs.has(b.id) ? 0 : 1;
      if (aHas !== bHas) return aHas - bHas;
      return a.name.localeCompare(b.name);
    });

    return merged.slice(0, 14);
  }, [institutionsWithLabs, search]);

  const pick = (row: InstitutionRecord) => {
    onChange(row);
    setSearch(row.name);
    setOpen(false);
  };

  const clear = () => {
    onChange(null);
    setSearch('');
    setOpen(false);
  };

  return (
    <div>
      <Label>School / Institution</Label>
      <p className="mt-1 text-xs text-fg-subtle">
        Choose a school to browse its labs, or search for another institution below.
      </p>

      {value ? (
        <p className="mt-2 text-xs text-fg-muted">
          <Link to={ROUTES.institution(value.id)} className="text-brand hover:underline">
            View {value.name} profile
          </Link>
        </p>
      ) : null}

      <div className="mt-3" role="group" aria-label="Schools with labs">
        {loading ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-9 w-24 animate-pulse rounded-full border border-border bg-surface-raised/60"
              />
            ))}
          </div>
        ) : schoolButtons.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clear}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                !value
                  ? 'border-brand bg-brand/15 text-brand'
                  : 'border-border text-fg-muted hover:border-fg-subtle hover:bg-surface-raised'
              }`}
            >
              All schools
            </button>
            {schoolButtons.map((row) => {
              const selected = value?.id === row.id;
              return (
                <button
                  key={row.id}
                  type="button"
                  title={row.name}
                  onClick={() => pick(row)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                    selected
                      ? 'border-brand bg-brand text-white shadow-sm'
                      : 'border-border bg-surface-card text-fg-muted hover:border-brand/40 hover:text-fg'
                  }`}
                >
                  {row.logoUrl ? (
                    <img
                      src={row.logoUrl}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : null}
                  {institutionButtonLabel(row.name)}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-fg-subtle">
            No schools with labs yet — search below or run{' '}
            <code className="text-fg-soft">npm run seed:firestore</code> for demo data.
          </p>
        )}
      </div>

      <div className="relative mt-4">
        <Label htmlFor="lab-institution-search" className="text-xs text-fg-subtle">
          Search other institutions
        </Label>
        <Input
          id="lab-institution-search"
          type="search"
          autoComplete="off"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (value && e.target.value !== value.name) {
              onChange(null);
            }
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Full name if not listed above…"
          className="mt-1.5 w-full pr-20"
        />
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="absolute bottom-2 right-2 rounded px-2 py-1 text-xs font-medium text-brand hover:bg-surface-raised"
          >
            Clear
          </button>
        ) : null}
        {open && search.trim().length > 0 && options.length > 0 && (
          <ul
            role="listbox"
            aria-label="Institution suggestions"
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-lg border border-border bg-surface-raised py-1 shadow-lg"
          >
            {options.map((row) => {
              const hasLabs = institutionsWithLabs.some((i) => i.id === row.id);
              return (
                <li key={row.id} role="option" aria-selected={value?.id === row.id}>
                  <button
                    type="button"
                    onClick={() => pick(row)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-card ${
                      value?.id === row.id ? 'bg-brand/15 text-fg' : 'text-fg-muted'
                    }`}
                  >
                    <span>{row.name}</span>
                    {hasLabs ? (
                      <span className="shrink-0 text-[10px] uppercase tracking-wide text-brand">
                        Has labs
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
