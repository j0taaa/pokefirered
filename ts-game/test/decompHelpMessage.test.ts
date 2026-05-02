import { describe, expect, test } from 'vitest';
import {
  getHelpMessageTextOrigin,
  getHelpMessageWindowRect,
  getHelpMessageWindowTileId,
  HELP_MESSAGE_TEXT_COLORS,
  HELP_MESSAGE_WINDOW_TEMPLATE
} from '../src/rendering/decompHelpMessage';

describe('decomp help message parity', () => {
  test('matches the decomp window template and text origin', () => {
    expect(HELP_MESSAGE_WINDOW_TEMPLATE).toEqual({
      bg: 0,
      tilemapLeft: 0,
      tilemapTop: 15,
      width: 30,
      height: 5,
      paletteNum: 15,
      baseBlock: 0x08f
    });
    expect(getHelpMessageTextOrigin()).toEqual({ x: 2, y: 5 });
    expect(HELP_MESSAGE_TEXT_COLORS).toEqual([
      'TEXT_COLOR_TRANSPARENT',
      'TEXT_DYNAMIC_COLOR_1',
      'TEXT_COLOR_DARK_GRAY'
    ]);
  });

  test('computes the decomp help window rectangle in GBA pixels', () => {
    expect(getHelpMessageWindowRect()).toEqual({
      x: 0,
      y: 120,
      width: 240,
      height: 40,
      widthTiles: 30,
      heightTiles: 5
    });
  });

  test('selects top, middle, and bottom tiles like DrawHelpMessageWindowTilesById', () => {
    expect(getHelpMessageWindowTileId(0, 5)).toBe(0);
    expect(getHelpMessageWindowTileId(1, 5)).toBe(5);
    expect(getHelpMessageWindowTileId(3, 5)).toBe(5);
    expect(getHelpMessageWindowTileId(4, 5)).toBe(14);
  });
});
