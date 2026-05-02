import { describe, expect, test } from 'vitest';
import {
  gObjectEventSubspriteArrays,
  gObjectEventSubspriteTables,
  getDecompObjectEventSubspriteArray,
  getDecompObjectEventSubspriteTable
} from '../src/game/decompObjectEventSubsprites';

describe('decomp object event subsprites', () => {
  test('parses every subsprite array and subsprite table', () => {
    const totalSubsprites = gObjectEventSubspriteArrays.reduce(
      (sum, array) => sum + array.subsprites.length,
      0
    );
    const totalTableEntries = gObjectEventSubspriteTables.reduce(
      (sum, table) => sum + table.entries.length,
      0
    );

    expect(gObjectEventSubspriteArrays).toHaveLength(35);
    expect(totalSubsprites).toBe(182);
    expect(gObjectEventSubspriteTables).toHaveLength(9);
    expect(totalTableEntries).toBe(54);
  });

  test('preserves subsprite fields exactly from the C tables', () => {
    expect(getDecompObjectEventSubspriteArray('gObjectEventSpriteOamTable_16x32_2')?.subsprites).toEqual([
      { x: -8, y: -16, shape: '16x16', size: '16x16', tileOffset: 0, priority: 2 },
      { x: -8, y: 0, shape: '16x8', size: '16x8', tileOffset: 4, priority: 2 },
      { x: -8, y: 8, shape: '16x8', size: '16x8', tileOffset: 6, priority: 3 }
    ]);
    expect(getDecompObjectEventSubspriteArray('gObjectEventSpriteOamTable_88x32_3')?.subsprites).toHaveLength(16);
    expect(getDecompObjectEventSubspriteArray('gObjectEventSpriteOamTable_88x32_3')?.subsprites.at(-1)).toEqual({
      x: 32,
      y: 4,
      shape: '8x8',
      size: '8x8',
      tileOffset: 43,
      priority: 2
    });
  });

  test('preserves table entries including NULL and repeated array references', () => {
    expect(getDecompObjectEventSubspriteTable('gObjectEventSpriteOamTables_16x16')?.entries[0]).toEqual({
      count: 0,
      symbol: null
    });
    expect(getDecompObjectEventSubspriteTable('gObjectEventSpriteOamTables_88x32')?.entries).toEqual([
      { count: 16, symbol: 'gObjectEventSpriteOamTable_88x32_0' },
      { count: 16, symbol: 'gObjectEventSpriteOamTable_88x32_0' },
      { count: 16, symbol: 'gObjectEventSpriteOamTable_88x32_1' },
      { count: 16, symbol: 'gObjectEventSpriteOamTable_88x32_2' },
      { count: 16, symbol: 'gObjectEventSpriteOamTable_88x32_3' },
      { count: 16, symbol: 'gObjectEventSpriteOamTable_88x32_3' }
    ]);
  });
});
