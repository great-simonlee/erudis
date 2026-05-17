import { RESEARCH_FIELD_CATALOG } from '../../constants';
import type { LabExploreFilters } from '../../utils/labExploreFilters';
import { FormSelect } from '../ui/FormSelect';
import { Input } from '../ui/Input';

type LabExploreFilterFieldsProps = {
  filters: LabExploreFilters;
  onChange: (next: LabExploreFilters) => void;
};

export function LabExploreFilterFields({ filters, onChange }: LabExploreFilterFieldsProps) {
  const patch = (partial: Partial<LabExploreFilters>) => onChange({ ...filters, ...partial });

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="lab-area" className="mb-1.5 block text-sm font-medium text-fg">
          Research area
        </label>
        <FormSelect
          id="lab-area"
          value={filters.researchArea}
          onChange={(e) => patch({ researchArea: e.target.value })}
        >
          <option value="">All areas</option>
          {RESEARCH_FIELD_CATALOG.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </FormSelect>
      </div>

      <div>
        <label htmlFor="lab-sort" className="mb-1.5 block text-sm font-medium text-fg">
          Sort by
        </label>
        <FormSelect
          id="lab-sort"
          value={filters.sort}
          onChange={(e) => patch({ sort: e.target.value as LabExploreFilters['sort'] })}
        >
          <option value="featured">Featured order</option>
          <option value="name">Lab name A–Z</option>
          <option value="members">Team size</option>
        </FormSelect>
      </div>

      <div>
        <label htmlFor="lab-min-members" className="mb-1.5 block text-sm font-medium text-fg">
          Minimum team size
        </label>
        <Input
          id="lab-min-members"
          inputMode="numeric"
          value={filters.minMembers}
          onChange={(e) => patch({ minMembers: e.target.value })}
          placeholder="e.g. 5"
        />
      </div>
    </div>
  );
}
