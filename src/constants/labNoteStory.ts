import type { ResearchLogType } from '../types';

export type LabNoteGlyph = {
  id: string;
  char: string;
  label: string;
  color: string;
};

export const LAB_NOTE_GLYPH_CATALOG: readonly LabNoteGlyph[] = [
  { id: 'strawberry', char: '🍓', label: 'Strawberry', color: '#E83B5A' },
  { id: 'orange', char: '🍊', label: 'Orange', color: '#F97316' },
  { id: 'lemon', char: '🍋', label: 'Lemon', color: '#FACC15' },
  { id: 'grape', char: '🍇', label: 'Grape', color: '#7C3AED' },
  { id: 'apple', char: '🍎', label: 'Apple', color: '#EF4444' },
  { id: 'banana', char: '🍌', label: 'Banana', color: '#EAB308' },
  { id: 'cherry', char: '🍒', label: 'Cherry', color: '#DC2626' },
  { id: 'peach', char: '🍑', label: 'Peach', color: '#FB923C' },
  { id: 'watermelon', char: '🍉', label: 'Watermelon', color: '#22C55E' },
  { id: 'blueberry', char: '🫐', label: 'Blueberry', color: '#3B82F6' },
  { id: 'kiwi', char: '🥝', label: 'Kiwi', color: '#84CC16' },
  { id: 'pineapple', char: '🍍', label: 'Pineapple', color: '#F59E0B' },
] as const;

export const DEFAULT_LAB_NOTE_STORY_GLYPHS: readonly string[] = [
  'strawberry',
  'orange',
  'lemon',
  'grape',
  'apple',
  'banana',
];

/** Maps pre-fruit glyph ids stored in Firestore to current fruit ids. */
const LEGACY_GLYPH_ALIASES: Readonly<Record<string, string>> = {
  spark: 'strawberry',
  flask: 'kiwi',
  idea: 'lemon',
  wave: 'blueberry',
  star: 'cherry',
  node: 'peach',
  delta: 'grape',
  sigma: 'blueberry',
  pulse: 'watermelon',
  orbit: 'apple',
};

export const MAX_LAB_NOTE_STORY_GLYPHS = 6;

export const LAB_NOTE_STORY_WEEKS = 8;
export const LAB_NOTE_STORY_DAYS = LAB_NOTE_STORY_WEEKS * 7;

const glyphById = new Map(LAB_NOTE_GLYPH_CATALOG.map((g) => [g.id, g]));

export function normalizeGlyphId(id: string | undefined): string | undefined {
  if (!id) return undefined;
  if (glyphById.has(id)) return id;
  return LEGACY_GLYPH_ALIASES[id];
}

export function getLabNoteGlyph(id: string | undefined): LabNoteGlyph {
  const normalized = normalizeGlyphId(id);
  if (normalized && glyphById.has(normalized)) return glyphById.get(normalized)!;
  return glyphById.get(DEFAULT_LAB_NOTE_STORY_GLYPHS[0])!;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function colorDistanceSq(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}

/** Pick the catalog fruit whose color best matches a portrait pixel. */
export function fruitIdForColor(hex: string): string {
  let best = LAB_NOTE_GLYPH_CATALOG[0].id;
  let bestD = Infinity;
  for (const fruit of LAB_NOTE_GLYPH_CATALOG) {
    const d = colorDistanceSq(hex, fruit.color);
    if (d < bestD) {
      bestD = d;
      best = fruit.id;
    }
  }
  return best;
}

export function fruitFillFromTemplateColor(hex: string): {
  id: string;
  color: string;
  char: string;
} {
  const id = fruitIdForColor(hex);
  const g = getLabNoteGlyph(id);
  return { id, color: g.color, char: g.char };
}

export function resolveStoryGlyphIds(ids: readonly string[] | undefined): string[] {
  const valid = new Set(LAB_NOTE_GLYPH_CATALOG.map((g) => g.id));
  const picked = (ids ?? [])
    .map((id) => normalizeGlyphId(id) ?? id)
    .filter((id) => valid.has(id))
    .slice(0, MAX_LAB_NOTE_STORY_GLYPHS);
  if (picked.length > 0) return picked;
  return [...DEFAULT_LAB_NOTE_STORY_GLYPHS];
}

export function glyphIdForLogType(type: ResearchLogType): string {
  const map: Record<ResearchLogType, string> = {
    experiment: 'kiwi',
    paper_review: 'grape',
    idea: 'lemon',
    result: 'cherry',
    writing: 'blueberry',
    other: 'peach',
  };
  return map[type] ?? 'peach';
}

export function toggleStoryGlyphId(
  current: readonly string[],
  id: string
): string[] {
  const valid = new Set(LAB_NOTE_GLYPH_CATALOG.map((g) => g.id));
  if (!valid.has(id)) return [...current];
  if (current.includes(id)) return current.filter((x) => x !== id);
  if (current.length >= MAX_LAB_NOTE_STORY_GLYPHS) return [...current];
  return [...current, id];
}
