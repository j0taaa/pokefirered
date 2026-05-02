import dataCSource from '../../../src/data.c?raw';

export type DataTableKind =
  | 'spriteFrameImage'
  | 'animCmd'
  | 'affineAnimCmd'
  | 'animPointerTable'
  | 'affineAnimPointerTable';

export interface DataTableBlock {
  symbol: string;
  kind: DataTableKind;
  isStatic: boolean;
  tokens: string[];
}

export const DATA_C_SOURCE = dataCSource;

export const DATA_C_INCLUDES = [...dataCSource.matchAll(/^#include "([^"]+)"/gmu)].map((match) => match[1]);
export const DATA_C_DEFINES = [...dataCSource.matchAll(/^#define\s+([^\n]+)/gmu)].map((match) => match[1]);

const blockKind = (type: string): DataTableKind => {
  if (type === 'struct SpriteFrameImage') return 'spriteFrameImage';
  if (type === 'union AnimCmd') return 'animCmd';
  if (type === 'union AffineAnimCmd') return 'affineAnimCmd';
  if (type === 'union AnimCmd *const') return 'animPointerTable';
  return 'affineAnimPointerTable';
};

const parseBlockTokens = (body: string): string[] =>
  body
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/u, '').trim())
    .filter(Boolean)
    .map((line) => line.replace(/,$/u, '').trim());

export const parseDataTableBlocks = (source: string): DataTableBlock[] =>
  [
    ...source.matchAll(
      /^(static\s+)?const\s+(struct SpriteFrameImage|union AnimCmd|union AffineAnimCmd|union AnimCmd \*const|union AffineAnimCmd \*const)\s+(\w+)\[\]\s*=\s*\{([\s\S]*?)^\};/gmu
    )
  ].map((match) => ({
    symbol: match[3],
    kind: blockKind(match[2]),
    isStatic: Boolean(match[1]),
    tokens: parseBlockTokens(match[4])
  }));

export const DATA_C_TABLE_BLOCKS = parseDataTableBlocks(dataCSource);

export const getDataTableBlock = (symbol: string): DataTableBlock | undefined =>
  DATA_C_TABLE_BLOCKS.find((block) => block.symbol === symbol);
