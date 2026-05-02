import objectEventSubspritesSource from '../../../src/data/object_events/object_event_subsprites.h?raw';

export interface DecompObjectEventSubsprite {
  x: number;
  y: number;
  shape: string;
  size: string;
  tileOffset: number;
  priority: number;
}

export interface DecompObjectEventSubspriteArray {
  symbol: string;
  subsprites: DecompObjectEventSubsprite[];
}

export interface DecompObjectEventSubspriteTableEntry {
  count: number;
  symbol: string | null;
}

export interface DecompObjectEventSubspriteTable {
  symbol: string;
  entries: DecompObjectEventSubspriteTableEntry[];
}

export const OBJECT_EVENT_SUBSPRITES_SOURCE = objectEventSubspritesSource;

const getField = (source: string, field: string): string => {
  const match = source.match(new RegExp(`\\.${field}\\s*=\\s*([^,\\n]+)`, 'u'));
  return match?.[1]?.trim() ?? '';
};

const getNumberField = (source: string, field: string): number =>
  Number.parseInt(getField(source, field), 10);

const getSpriteMacroField = (source: string, field: string): string =>
  getField(source, field).replace(/^SPRITE_(?:SHAPE|SIZE)\(([^)]+)\)$/u, '$1');

export const parseObjectEventSubspriteArrays = (
  source = objectEventSubspritesSource
): DecompObjectEventSubspriteArray[] =>
  [...source.matchAll(/const struct Subsprite (gObjectEventSpriteOamTable_\w+)\[\]\s*=\s*\{([\s\S]*?)\n\};/gu)]
    .map((match) => ({
      symbol: match[1]!,
      subsprites: [...(match[2] ?? '').matchAll(/\{([\s\S]*?)\}/gu)]
        .map((subspriteMatch) => subspriteMatch[1] ?? '')
        .filter((body) => body.includes('.x'))
        .map((body) => ({
          x: getNumberField(body, 'x'),
          y: getNumberField(body, 'y'),
          shape: getSpriteMacroField(body, 'shape'),
          size: getSpriteMacroField(body, 'size'),
          tileOffset: getNumberField(body, 'tileOffset'),
          priority: getNumberField(body, 'priority')
        }))
    }));

export const parseObjectEventSubspriteTables = (
  source = objectEventSubspritesSource
): DecompObjectEventSubspriteTable[] =>
  [...source.matchAll(/const struct SubspriteTable (gObjectEventSpriteOamTables_\w+)\[\]\s*=\s*\{([\s\S]*?)\n\};/gu)]
    .map((match) => ({
      symbol: match[1]!,
      entries: [...(match[2] ?? '').matchAll(/\{\s*(\d+)\s*,\s*([A-Za-z0-9_]+|NULL)\s*\}/gu)]
        .map((entryMatch) => ({
          count: Number.parseInt(entryMatch[1]!, 10),
          symbol: entryMatch[2] === 'NULL' ? null : entryMatch[2]!
        }))
    }));

export const gObjectEventSubspriteArrays = parseObjectEventSubspriteArrays();
export const gObjectEventSubspriteTables = parseObjectEventSubspriteTables();

const subspriteArraysBySymbol = new Map(
  gObjectEventSubspriteArrays.map((array) => [array.symbol, array])
);
const subspriteTablesBySymbol = new Map(
  gObjectEventSubspriteTables.map((table) => [table.symbol, table])
);

export const getDecompObjectEventSubspriteArray = (
  symbol: string
): DecompObjectEventSubspriteArray | null =>
  subspriteArraysBySymbol.get(symbol) ?? null;

export const getDecompObjectEventSubspriteTable = (
  symbol: string
): DecompObjectEventSubspriteTable | null =>
  subspriteTablesBySymbol.get(symbol) ?? null;
