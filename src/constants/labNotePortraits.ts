import { filterWeekdayDates } from '../utils/timeAgo';

/** Side length of the square pixel grid (16×16 = 256). */
export const LAB_NOTE_PORTRAIT_SIZE = 16;

export const LAB_NOTE_PORTRAIT_CELL_COUNT =
  LAB_NOTE_PORTRAIT_SIZE * LAB_NOTE_PORTRAIT_SIZE;

/** Pixel-art fruit the grid reveals when filled with colors. */
export type LabNoteFruitShapeId = 'apple' | 'orange' | 'watermelon';

/** @deprecated Use {@link LabNoteFruitShapeId} */
export type LabNotePortraitId = LabNoteFruitShapeId;

export type LabNoteFruitShapeMeta = {
  id: LabNoteFruitShapeId;
  name: string;
  emoji: string;
  tagline: string;
  /** UI accent for progress and selection. */
  accent: string;
};

export const LAB_NOTE_FRUIT_SHAPES: readonly LabNoteFruitShapeMeta[] = [
  {
    id: 'apple',
    name: 'Apple',
    emoji: '🍎',
    tagline: 'Classic red',
    accent: '#ef4444',
  },
  {
    id: 'orange',
    name: 'Orange',
    emoji: '🍊',
    tagline: 'Bright citrus',
    accent: '#f97316',
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    emoji: '🍉',
    tagline: 'Summer slice',
    accent: '#22c55e',
  },
] as const;

/** @deprecated Use {@link LAB_NOTE_FRUIT_SHAPES} */
export const LAB_NOTE_PORTRAITS = LAB_NOTE_FRUIT_SHAPES;

export const FRUIT_SHAPE_BG = '#0a0e14';

export const DEFAULT_LAB_NOTE_FRUIT_SHAPE: LabNoteFruitShapeId = 'apple';

/** @deprecated Use {@link DEFAULT_LAB_NOTE_FRUIT_SHAPE} */
export const DEFAULT_LAB_NOTE_PORTRAIT = DEFAULT_LAB_NOTE_FRUIT_SHAPE;

const shapeIds = new Set(LAB_NOTE_FRUIT_SHAPES.map((f) => f.id));

const LEGACY_SHAPE_ALIASES: Readonly<Record<string, LabNoteFruitShapeId>> = {
  mona_lisa: 'apple',
  doraemon: 'orange',
  pikachu: 'apple',
  strawberry: 'apple',
  grape: 'watermelon',
  banana: 'orange',
};

export function resolveFruitShapeId(id: string | undefined): LabNoteFruitShapeId {
  if (id && shapeIds.has(id as LabNoteFruitShapeId)) return id as LabNoteFruitShapeId;
  if (id && LEGACY_SHAPE_ALIASES[id]) return LEGACY_SHAPE_ALIASES[id];
  return DEFAULT_LAB_NOTE_FRUIT_SHAPE;
}

/** @deprecated Use {@link resolveFruitShapeId} */
export const resolvePortraitId = resolveFruitShapeId;

function dist(x: number, y: number, cx: number, cy: number): number {
  return Math.hypot(x - cx, y - cy);
}

function inEllipse(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): boolean {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

/** Procedural fruit pixel colors (row-major). Non-fruit cells use {@link FRUIT_SHAPE_BG}. */
function fruitShapeColor(id: LabNoteFruitShapeId, x: number, y: number, n: number): string {
  const cx = (n - 1) / 2;
  const cy = (n - 1) / 2;
  const u = n - 1;
  const BG = FRUIT_SHAPE_BG;

  if (id === 'apple') {
    const RED = '#ef4444';
    const REDD = '#dc2626';
    const STEM = '#6b4423';
    const LEAF = '#4ade80';
    const r = u * 0.44;

    if (y < cy - 0.38 * u && Math.abs(x - cx) < 0.06 * u) return STEM;
    if (y < cy - 0.32 * u && dist(x, y, cx + 0.14 * u, cy - 0.34 * u) < 0.12 * u) return LEAF;

    if (!inEllipse(x, y, cx, cy + 0.04 * u, r, r * 1.04)) return BG;
    return dist(x, y, cx - 0.14 * u, cy - 0.12 * u) < 0.18 * u ? RED : REDD;
  }

  if (id === 'orange') {
    const ORANGE = '#f97316';
    const ORANGED = '#ea580c';
    const PEEL = '#fdba74';
    const LEAF = '#22c55e';
    const STEM = '#65a30d';
    const r = u * 0.44;

    if (y < cy - 0.38 * u && Math.abs(x - cx) < 0.05 * u) return STEM;
    if (y < cy - 0.32 * u && dist(x, y, cx + 0.15 * u, cy - 0.33 * u) < 0.11 * u) return LEAF;

    if (!inEllipse(x, y, cx, cy + 0.02 * u, r, r)) return BG;
    const ring = Math.abs(dist(x, y, cx, cy) - r * 0.88) < 0.08 * u;
    if (ring) return PEEL;
    return (x + y) % 4 === 0 ? ORANGED : ORANGE;
  }

  if (id === 'watermelon') {
    const RIND = '#22c55e';
    const RINDD = '#16a34a';
    const RED = '#f43f5e';
    const REDD = '#e11d48';
    const SEED = '#1e293b';

    if (!inEllipse(x, y, cx, cy + 0.04 * u, u * 0.48, u * 0.45)) return BG;
    if (!inEllipse(x, y, cx, cy + 0.04 * u, u * 0.4, u * 0.37)) return y < cy ? RIND : RINDD;
    if ((x * 3 + y * 5) % 11 === 0 && inEllipse(x, y, cx, cy + 0.08 * u, u * 0.3, u * 0.28)) {
      return SEED;
    }
    return y < cy + 0.06 * u ? RED : REDD;
  }

  return BG;
}

const pixelCache = new Map<string, readonly string[]>();

export function getFruitShapePixels(
  id: LabNoteFruitShapeId,
  size: number = LAB_NOTE_PORTRAIT_SIZE
): readonly string[] {
  const key = `${id}:${size}`;
  const hit = pixelCache.get(key);
  if (hit) return hit;
  const pixels = Array.from({ length: size * size }, (_, i) => {
    const x = i % size;
    const y = Math.floor(i / size);
    return fruitShapeColor(id, x, y, size);
  });
  pixelCache.set(key, pixels);
  return pixels;
}

/** @deprecated Use {@link getFruitShapePixels} */
export const getPortraitPixels = getFruitShapePixels;

export type StoryPixelFill = {
  color: string;
  date: string;
};

export function getFruitCellIndices(
  template: readonly string[],
  bgColor: string = FRUIT_SHAPE_BG
): number[] {
  const indices: number[] = [];
  template.forEach((color, i) => {
    if (color !== bgColor) indices.push(i);
  });
  return indices;
}

export function fruitCellCount(
  shapeId: LabNoteFruitShapeId,
  size: number = LAB_NOTE_PORTRAIT_SIZE
): number {
  return getFruitCellIndices(getFruitShapePixels(shapeId, size)).length;
}

export function cellIndexForLogDate(
  loggedDates: readonly string[],
  logDate: string
): number {
  const dates = Array.from(new Set([...loggedDates, logDate])).sort();
  return dates.indexOf(logDate);
}

function fillFromTemplatePixel(templateColor: string, date: string): StoryPixelFill {
  return { color: templateColor, date };
}

export function buildStoryPixelState(
  shapeId: LabNoteFruitShapeId,
  loggedDates: readonly string[],
  size: number = LAB_NOTE_PORTRAIT_SIZE
): {
  template: readonly string[];
  fills: readonly (StoryPixelFill | null)[];
  fruitCellIndices: readonly number[];
} {
  const template = getFruitShapePixels(shapeId, size);
  const fruitCellIndices = getFruitCellIndices(template);
  const fills: (StoryPixelFill | null)[] = Array(size * size).fill(null);
  const sorted = filterWeekdayDates(loggedDates);
  for (let j = 0; j < Math.min(sorted.length, fruitCellIndices.length); j++) {
    const i = fruitCellIndices[j];
    fills[i] = fillFromTemplatePixel(template[i], sorted[j]);
  }
  return { template, fills, fruitCellIndices };
}

