import { RESEARCH_FIELD_CATALOG } from '../../constants';
import {
  JOB_LOCATION_REGIONS,
  JOB_POSITION_TYPES,
  type JobFilters,
} from '../../utils/jobFilters';
import { FormSelect } from '../ui/FormSelect';

type JobsFilterFieldsProps = {
  filters: JobFilters;
  onChange: (next: JobFilters) => void;
};

export function JobsFilterFields({ filters, onChange }: JobsFilterFieldsProps) {
  const patch = (partial: Partial<JobFilters>) => onChange({ ...filters, ...partial });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="jobs-position" className="mb-1.5 block text-sm font-medium text-fg">
          Position type
        </label>
        <FormSelect
          id="jobs-position"
          value={filters.positionType}
          onChange={(e) => patch({ positionType: e.target.value })}
        >
          <option value="">All types</option>
          {JOB_POSITION_TYPES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </FormSelect>
      </div>

      <div>
        <label htmlFor="jobs-location" className="mb-1.5 block text-sm font-medium text-fg">
          Location
        </label>
        <FormSelect
          id="jobs-location"
          value={filters.location}
          onChange={(e) => patch({ location: e.target.value })}
        >
          <option value="">All locations</option>
          {JOB_LOCATION_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </FormSelect>
      </div>

      <div>
        <label htmlFor="jobs-field" className="mb-1.5 block text-sm font-medium text-fg">
          Research field
        </label>
        <FormSelect
          id="jobs-field"
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
      </div>

      <div>
        <label htmlFor="jobs-remote" className="mb-1.5 block text-sm font-medium text-fg">
          Work mode
        </label>
        <FormSelect
          id="jobs-remote"
          value={filters.remote}
          onChange={(e) => patch({ remote: e.target.value as JobFilters['remote'] })}
        >
          <option value="any">Any</option>
          <option value="remote">Remote only</option>
          <option value="onsite">On-site</option>
        </FormSelect>
      </div>

      <div>
        <label htmlFor="jobs-sort" className="mb-1.5 block text-sm font-medium text-fg">
          Sort by
        </label>
        <FormSelect
          id="jobs-sort"
          value={filters.sort}
          onChange={(e) => patch({ sort: e.target.value as JobFilters['sort'] })}
        >
          <option value="newest">Newest first</option>
          <option value="deadline">Deadline soonest</option>
        </FormSelect>
      </div>
    </div>
  );
}
