import { useMemo } from 'react';
import type { StoryPixelFill } from '../../constants/labNotePortraits';

const UNFILLED_CELL_BG = '#121820';
const UNFILLED_GHOST_MIX_PCT = 34;

export type LabNotePixelGridProps = {
  size: number;
  templateColors: readonly string[];
  fills?: readonly (StoryPixelFill | null)[];
  ghostTemplate?: boolean;
  className?: string;
  'aria-label'?: string;
};

export function LabNotePixelGrid({
  size,
  templateColors,
  fills,
  ghostTemplate = true,
  className = '',
  'aria-label': ariaLabel,
}: LabNotePixelGridProps) {
  const cells = useMemo(() => {
    const n = size * size;
    return Array.from({ length: n }, (_, i) => {
      const fill = fills?.[i] ?? null;
      const template = templateColors[i] ?? '#1e293b';
      return { fill, template };
    });
  }, [size, templateColors, fills]);

  return (
    <div
      className={`w-full ${className}`}
      style={{ aspectRatio: '1 / 1' }}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      <div
        className="grid h-full w-full gap-[2px] rounded-lg p-[2px]"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          backgroundColor: '#080b10',
        }}
      >
        {cells.map((cell, i) => {
          const filled = Boolean(cell.fill);
          const bg = filled
            ? cell.fill!.color
            : ghostTemplate
              ? `color-mix(in srgb, ${cell.template} ${UNFILLED_GHOST_MIX_PCT}%, ${UNFILLED_CELL_BG})`
              : UNFILLED_CELL_BG;
          return (
            <div
              key={i}
              title={filled && cell.fill!.date ? cell.fill!.date : undefined}
              className={`aspect-square min-h-0 min-w-0 w-full rounded-[1px] transition-colors duration-300 ${
                filled ? 'ring-1 ring-white/20 ring-inset' : ''
              }`}
              style={{ backgroundColor: bg }}
            />
          );
        })}
      </div>
    </div>
  );
}
