import {
  LAB_NOTE_FRUIT_SHAPES,
  type LabNoteFruitShapeId,
} from '../../constants/labNotePortraits';

type LabNoteFruitShapePickerProps = {
  value: LabNoteFruitShapeId;
  onChange: (id: LabNoteFruitShapeId) => void;
  disabled?: boolean;
};

export function LabNoteFruitShapePicker({
  value,
  onChange,
  disabled = false,
}: LabNoteFruitShapePickerProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="radiogroup"
      aria-label="Lab-note story fruit"
    >
      {LAB_NOTE_FRUIT_SHAPES.map((f) => {
        const selected = value === f.id;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(f.id)}
            className={`group relative flex flex-col items-center rounded-xl border px-2 py-3 text-center transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
              selected
                ? 'border-transparent bg-surface-raised shadow-md'
                : 'border-border/80 bg-surface/30 hover:border-fg-subtle/30 hover:bg-surface-raised/60'
            }`}
            style={
              selected
                ? {
                    boxShadow: `0 0 0 2px ${f.accent}, 0 8px 24px -8px ${f.accent}55`,
                  }
                : undefined
            }
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-transform duration-200 group-hover:scale-105 group-disabled:group-hover:scale-100"
              style={{ backgroundColor: `${f.accent}18` }}
            >
              {f.emoji}
            </span>
            <span className="mt-2 text-sm font-medium text-fg">{f.name}</span>
            <span className="mt-0.5 text-[10px] text-fg-subtle">{f.tagline}</span>
          </button>
        );
      })}
    </div>
  );
}
