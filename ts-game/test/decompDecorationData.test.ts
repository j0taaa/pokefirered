import { describe, expect, test } from 'vitest';
import {
  DECORATION_DESCRIPTIONS_SOURCE,
  DECORATION_HEADER_SOURCE,
  DECORATION_TILES_SOURCE,
  gDecorationDescriptions,
  gDecorationTiles,
  gDecorations,
  getDecoration,
  getDecorationDescription,
  getDecorationTiles
} from '../src/game/decompDecorationData';

describe('decomp decoration data', () => {
  test('parses every decoration description in source order', () => {
    expect(DECORATION_DESCRIPTIONS_SOURCE).toContain('const u8 DecorDesc_SMALL_DESK[]');
    expect(gDecorationDescriptions).toHaveLength(120);
    expect(gDecorationDescriptions.slice(0, 5)).toEqual([
      { symbol: 'DecorDesc_SMALL_DESK', text: 'A small desk built\\nfor one.' },
      { symbol: 'DecorDesc_POKEMON_DESK', text: 'A small desk built in\\nthe shape of a POKé\\nBALL.' },
      { symbol: 'DecorDesc_HEAVY_DESK', text: 'A large desk made\\nof steel. Put some\\ndecorations on it.' },
      { symbol: 'DecorDesc_RAGGED_DESK', text: 'A large desk made\\nof wood. Put some\\ndecorations on it.' },
      { symbol: 'DecorDesc_COMFORT_DESK', text: 'A large desk made\\nof leaves. Put some\\ndecorations on it.' }
    ]);
    expect(getDecorationDescription('DecorDesc_REGISTEEL_DOLL')).toBe('A large doll.\\nPlace it on a mat\\nor a desk.');
  });

  test('parses every decoration header row in source order', () => {
    expect(DECORATION_HEADER_SOURCE).toContain('const struct Decoration gDecorations[]');
    expect(gDecorations).toHaveLength(121);
    expect(gDecorations.slice(0, 3)).toEqual([
      {
        id: 'DECOR_NONE',
        name: 'SMALL DESK',
        permission: 'DECORPERM_SOLID_FLOOR',
        shape: 'DECORSHAPE_1x1',
        category: 'DECORCAT_DESK',
        price: 0,
        descriptionSymbol: 'DecorDesc_SMALL_DESK',
        gfxSymbol: 'DecorGfx_SMALL_DESK'
      },
      {
        id: 'DECOR_SMALL_DESK',
        name: 'SMALL DESK',
        permission: 'DECORPERM_SOLID_FLOOR',
        shape: 'DECORSHAPE_1x1',
        category: 'DECORCAT_DESK',
        price: 3000,
        descriptionSymbol: 'DecorDesc_SMALL_DESK',
        gfxSymbol: 'DecorGfx_SMALL_DESK'
      },
      {
        id: 'DECOR_POKEMON_DESK',
        name: 'POKéMON DESK',
        permission: 'DECORPERM_SOLID_FLOOR',
        shape: 'DECORSHAPE_1x1',
        category: 'DECORCAT_DESK',
        price: 3000,
        descriptionSymbol: 'DecorDesc_POKEMON_DESK',
        gfxSymbol: 'DecorGfx_POKEMON_DESK'
      }
    ]);
  });

  test('preserves high-value tail decoration rows', () => {
    expect(getDecoration('DECOR_REGISTEEL_DOLL')).toEqual({
      id: 'DECOR_REGISTEEL_DOLL',
      name: 'REGISTEEL DOLL',
      permission: 'DECORPERM_SPRITE',
      shape: 'DECORSHAPE_1x2',
      category: 'DECORCAT_DOLL',
      price: 10000,
      descriptionSymbol: 'DecorDesc_REGISTEEL_DOLL',
      gfxSymbol: 'DecorGfx_REGISTEEL_DOLL'
    });
    expect(gDecorations.at(-1)?.id).toBe('DECOR_REGISTEEL_DOLL');
  });

  test('parses every decoration tile array in source order', () => {
    expect(DECORATION_TILES_SOURCE).toContain('#include "constants/event_objects.h"');
    expect(gDecorationTiles).toHaveLength(120);
    expect(gDecorationTiles.slice(0, 3)).toEqual([
      { symbol: 'DecorGfx_SMALL_DESK', tiles: [0x87] },
      { symbol: 'DecorGfx_POKEMON_DESK', tiles: [0x8f] },
      { symbol: 'DecorGfx_HEAVY_DESK', tiles: [0x90, 0x91, 0x92, 0x98, 0x99, 0x9a] }
    ]);
    expect(getDecorationTiles('DecorGfx_RED_BRICK')).toEqual({
      symbol: 'DecorGfx_RED_BRICK',
      tiles: [0x25, 0x2d]
    });
    expect(getDecorationTiles('DecorGfx_REGISTEEL_DOLL')).toEqual({
      symbol: 'DecorGfx_REGISTEEL_DOLL',
      tiles: []
    });
  });
});
