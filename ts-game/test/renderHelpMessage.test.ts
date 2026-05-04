import { describe, expect, test } from 'vitest';
import {
  HELP_MESSAGE_WINDOW_TEMPLATE,
  HELP_MESSAGE_TILE_IDS,
  HELP_MESSAGE_TEXT_COLORS,
  getHelpMessageWindowTileId,
  getHelpMessageWindowRect,
  getHelpMessageTextOrigin
} from '../src/rendering/decompHelpMessage';

describe('help message window rendering parity', () => {
  test('help message window template matches src/help_message.c', () => {
    expect(HELP_MESSAGE_WINDOW_TEMPLATE.bg).toBe(0);
    expect(HELP_MESSAGE_WINDOW_TEMPLATE.tilemapLeft).toBe(0);
    expect(HELP_MESSAGE_WINDOW_TEMPLATE.tilemapTop).toBe(15);
    expect(HELP_MESSAGE_WINDOW_TEMPLATE.width).toBe(30);
    expect(HELP_MESSAGE_WINDOW_TEMPLATE.height).toBe(5);
    expect(HELP_MESSAGE_WINDOW_TEMPLATE.paletteNum).toBe(15);
    expect(HELP_MESSAGE_WINDOW_TEMPLATE.baseBlock).toBe(0x08f);
  });

  test('help message tile IDs match DrawHelpMessageWindowTilesById', () => {
    expect(HELP_MESSAGE_TILE_IDS.top).toBe(0);
    expect(HELP_MESSAGE_TILE_IDS.middle).toBe(5);
    expect(HELP_MESSAGE_TILE_IDS.bottom).toBe(14);
  });

  test('getHelpMessageWindowTileId returns top for row 0, bottom for last row, middle otherwise', () => {
    expect(getHelpMessageWindowTileId(0, 5)).toBe(HELP_MESSAGE_TILE_IDS.top);
    expect(getHelpMessageWindowTileId(4, 5)).toBe(HELP_MESSAGE_TILE_IDS.bottom);
    expect(getHelpMessageWindowTileId(1, 5)).toBe(HELP_MESSAGE_TILE_IDS.middle);
    expect(getHelpMessageWindowTileId(2, 5)).toBe(HELP_MESSAGE_TILE_IDS.middle);
    expect(getHelpMessageWindowTileId(3, 5)).toBe(HELP_MESSAGE_TILE_IDS.middle);
  });

  test('getHelpMessageWindowRect returns pixel coordinates', () => {
    const rect = getHelpMessageWindowRect(8);
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(120);
    expect(rect.width).toBe(240);
    expect(rect.height).toBe(40);
    expect(rect.widthTiles).toBe(30);
    expect(rect.heightTiles).toBe(5);
  });

  test('getHelpMessageTextOrigin returns text start position', () => {
    const origin = getHelpMessageTextOrigin(1);
    expect(origin.x).toBe(2);
    expect(origin.y).toBe(5);
  });

  test('help message text colors match TEXT_COLOR_* constants', () => {
    expect(HELP_MESSAGE_TEXT_COLORS[0]).toBe('TEXT_COLOR_TRANSPARENT');
    expect(HELP_MESSAGE_TEXT_COLORS[1]).toBe('TEXT_DYNAMIC_COLOR_1');
    expect(HELP_MESSAGE_TEXT_COLORS[2]).toBe('TEXT_COLOR_DARK_GRAY');
  });
});