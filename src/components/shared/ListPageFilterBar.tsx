import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AppIcon, ICON_STROKE } from '../ui/AppIcon';

export type FilterChip = {
  id: string;
  label: string;
};

type ListPageFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchId: string;
  onOpenFilters: () => void;
  activeFilterCount: number;
  chips: FilterChip[];
  onRemoveChip: (id: string) => void;
  onClearAll?: () => void;
  resultSummary?: string;
};

export function ListPageFilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  searchId,
  onOpenFilters,
  activeFilterCount,
  chips,
  onRemoveChip,
  onClearAll,
  resultSummary,
}: ListPageFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search
          </label>
          <AppIcon
            icon={Search}
            size={18}
            strokeWidth={ICON_STROKE}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-card border border-border bg-surface-card py-2.5 pl-10 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <button
          type="button"
          onClick={onOpenFilters}
          className="relative flex shrink-0 items-center gap-2 rounded-card border border-border bg-surface-card px-3.5 py-2.5 text-sm font-medium text-fg transition-colors hover:border-brand/40 hover:bg-surface-raised/50"
        >
          <AppIcon icon={SlidersHorizontal} size={18} strokeWidth={ICON_STROKE} className="text-brand" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 ? (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      {(resultSummary || chips.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {resultSummary ? (
            <p className="text-xs text-fg-muted">{resultSummary}</p>
          ) : null}
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onRemoveChip(chip.id)}
              className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/15"
            >
              {chip.label}
              <AppIcon icon={X} size={12} strokeWidth={2.5} aria-hidden />
              <span className="sr-only">Remove filter</span>
            </button>
          ))}
          {chips.length > 0 && onClearAll ? (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline"
            >
              Clear all
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
