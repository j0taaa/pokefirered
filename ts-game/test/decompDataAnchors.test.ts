import { describe, expect, test } from 'vitest';
import {
  DECORATION_C_INCLUDES,
  getDecorationCompilationIncludes
} from '../src/game/decompDecorationData';
import {
  TILESETS_C_INCLUDES,
  getTilesetsCompilationIncludes
} from '../src/world/decompTilesetsData';

describe('decomp data anchor files', () => {
  test('decoration.c is represented as its exact compilation-unit include list', () => {
    expect(getDecorationCompilationIncludes()).toBe(DECORATION_C_INCLUDES);
    expect(DECORATION_C_INCLUDES).toEqual([
      'global.h',
      'decoration.h',
      'constants/decorations.h',
      'data/decoration/tiles.h',
      'data/decoration/description.h',
      'data/decoration/header.h'
    ]);
  });

  test('tilesets.c is represented as its exact compilation-unit include list', () => {
    expect(getTilesetsCompilationIncludes()).toBe(TILESETS_C_INCLUDES);
    expect(TILESETS_C_INCLUDES).toEqual([
      'global.h',
      'tilesets.h',
      'tileset_anims.h',
      'data/tilesets/graphics.h',
      'data/tilesets/metatiles.h',
      'data/tilesets/headers.h'
    ]);
  });
});
