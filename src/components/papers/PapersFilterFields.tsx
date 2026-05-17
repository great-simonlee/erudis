import type { PaperFilters } from '../../utils/paperFilters';
import { FormSelect } from '../ui/FormSelect';
import { Input } from '../ui/Input';

type PapersFilterFieldsProps = {
  filters: PaperFilters;
  onChange: (next: PaperFilters) => void;
};

export function PapersFilterFields({ filters, onChange }: PapersFilterFieldsProps) {
  const patch = (partial: Partial<PaperFilters>) => onChange({ ...filters, ...partial });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="paper-year-from" className="mb-1.5 block text-sm font-medium text-fg">
            Year from
          </label>
          <Input
            id="paper-year-from"
            inputMode="numeric"
            value={filters.yearFrom}
            onChange={(e) => patch({ yearFrom: e.target.value })}
            placeholder="2018"
          />
        </div>
        <div>
          <label htmlFor="paper-year-to" className="mb-1.5 block text-sm font-medium text-fg">
            Year to
          </label>
          <Input
            id="paper-year-to"
            inputMode="numeric"
            value={filters.yearTo}
            onChange={(e) => patch({ yearTo: e.target.value })}
            placeholder="2024"
          />
        </div>
      </div>

      <div>
        <label htmlFor="paper-venue" className="mb-1.5 block text-sm font-medium text-fg">
          Venue contains
        </label>
        <Input
          id="paper-venue"
          value={filters.venue}
          onChange={(e) => patch({ venue: e.target.value })}
          placeholder="NeurIPS, Nature, …"
        />
      </div>

      <div>
        <label htmlFor="paper-sort" className="mb-1.5 block text-sm font-medium text-fg">
          Sort by
        </label>
        <FormSelect
          id="paper-sort"
          value={filters.sort}
          onChange={(e) => patch({ sort: e.target.value as PaperFilters['sort'] })}
        >
          <option value="newest">Newest first</option>
          <option value="year">Publication year</option>
          <option value="title">Title A–Z</option>
        </FormSelect>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-raised/30 px-3.5 py-3">
        <input
          type="checkbox"
          checked={filters.hasArxivOnly}
          onChange={(e) => patch({ hasArxivOnly: e.target.checked })}
          className="rounded border-border text-brand focus:ring-brand"
        />
        <span className="text-sm font-medium text-fg">Has arXiv link only</span>
      </label>
    </div>
  );
}
