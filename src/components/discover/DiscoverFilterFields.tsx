import { RESEARCH_FIELD_CATALOG } from '../../constants';
import { DISCOVER_POST_TYPES, type DiscoverFilters } from '../../utils/discoverFilters';
import { FormSelect } from '../ui/FormSelect';

type DiscoverFilterFieldsProps = {
  filters: DiscoverFilters;
  onChange: (next: DiscoverFilters) => void;
};

export function DiscoverFilterFields({ filters, onChange }: DiscoverFilterFieldsProps) {
  const patch = (partial: Partial<DiscoverFilters>) => onChange({ ...filters, ...partial });

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="disc-field" className="mb-1.5 block text-sm font-medium text-fg">
          Research field
        </label>
        <FormSelect
          id="disc-field"
          value={filters.field}
          onChange={(e) => patch({ field: e.target.value })}
        >
          <option value="">All fields</option>
          {RESEARCH_FIELD_CATALOG.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </FormSelect>
        <p className="mt-1.5 text-xs text-fg-muted">Reloads public posts for the selected field.</p>
      </div>

      <div>
        <label htmlFor="disc-type" className="mb-1.5 block text-sm font-medium text-fg">
          Post type
        </label>
        <FormSelect
          id="disc-type"
          value={filters.postType}
          onChange={(e) => patch({ postType: e.target.value })}
        >
          {DISCOVER_POST_TYPES.map((t) => (
            <option key={t.value || 'all'} value={t.value}>
              {t.label}
            </option>
          ))}
        </FormSelect>
      </div>
    </div>
  );
}
