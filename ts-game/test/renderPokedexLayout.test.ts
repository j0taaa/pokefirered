import { describe, expect, test } from 'vitest';
import {
  DEX_GBA_WIDTH,
  DEX_GBA_HEIGHT,
  DEX_STRING_TABLE_OF_CONTENTS,
  DEX_STRING_POKEMON_LIST,
  DEX_STRING_SEARCH,
  DEX_STRING_PICK_OK,
  DEX_STRING_PICK_OK_EXIT,
  DEX_RECT_MODE_SELECT,
  DEX_RECT_SELECTION_ICON,
  DEX_RECT_DEX_COUNTS,
  DEX_RECT_HEADER,
  DEX_RECT_FOOTER,
  DEX_RECT_ORDERED_LIST,
  DEX_MODE_LIST_MAX_SHOWED,
  DEX_MODE_LIST_ROW_STRIDE,
  DEX_MODE_LIST_ITEM_X,
  DEX_MODE_LIST_HEADER_X,
  DEX_MODE_LIST_CURSOR_X,
  DEX_MODE_LIST_UP_TEXT_Y,
  DEX_MODE_LIST_LETTER_SPACING,
  DEX_ORDERED_LIST_MAX_SHOWED,
  DEX_ORDERED_LIST_ITEM_X,
  DEX_ORDERED_LIST_CURSOR_X,
  DEX_ORDERED_LIST_UP_TEXT_Y,
  DEX_ORDERED_LIST_ROW_STRIDE,
  DEX_AREA_MAP_KANTO_RECT,
  DEX_WINDOW_INNER_PIXEL0,
  DEX_WINDOW_INNER_PIXEL15,
  DEX_CATEGORY_ICON_TILE_BG,
  DEX_COUNTS_KANTO,
  DEX_COUNTS_NATIONAL,
  DEX_ENTRY_MON_PIC,
  DEX_ENTRY_SPECIES_STATS,
  DEX_ENTRY_FLAVOR,
  DEX_FOOTER_CONTROL_TEXT,
  DEX_MODE_LIST_ITEM_ENABLED,
  DEX_MODE_LIST_ITEM_DISABLED,
  getPokedexCategorySlots
} from '../src/rendering/pokedexScreenLayout';

describe('pokedex screen layout parity', () => {
  test('GBA viewport dimensions match FireRed hardware', () => {
    expect(DEX_GBA_WIDTH).toBe(240);
    expect(DEX_GBA_HEIGHT).toBe(160);
  });

  test('pokedex string constants match decomp gText_* values', () => {
    expect(DEX_STRING_TABLE_OF_CONTENTS).toBe('POKéDEX   TABLE OF CONTENTS');
    expect(DEX_STRING_POKEMON_LIST).toBe('POKeMON LIST');
    expect(DEX_STRING_SEARCH).toBe('SEARCH');
    expect(DEX_STRING_PICK_OK).toBe('PICK    A: OK');
    expect(DEX_STRING_PICK_OK_EXIT).toBe('PICK    A: OK    B: BACK');
  });

  test('pokedex window rects are within viewport bounds', () => {
    const inBounds = (rect: { x: number; y: number; w: number; h: number }) =>
      rect.x >= 0 && rect.y >= 0 &&
      rect.x + rect.w <= DEX_GBA_WIDTH &&
      rect.y + rect.h <= DEX_GBA_HEIGHT;

    expect(inBounds(DEX_RECT_MODE_SELECT)).toBe(true);
    expect(inBounds(DEX_RECT_SELECTION_ICON)).toBe(true);
    expect(inBounds(DEX_RECT_DEX_COUNTS)).toBe(true);
    expect(inBounds(DEX_RECT_HEADER)).toBe(true);
    expect(inBounds(DEX_RECT_FOOTER)).toBe(true);
    expect(inBounds(DEX_RECT_ORDERED_LIST)).toBe(true);
    expect(inBounds(DEX_AREA_MAP_KANTO_RECT)).toBe(true);
  });

  test('pokedex mode select list layout matches sListMenuTemplate_KantoDexModeSelect', () => {
    expect(DEX_MODE_LIST_MAX_SHOWED).toBe(9);
    expect(DEX_MODE_LIST_ROW_STRIDE).toBe(14);
    expect(DEX_MODE_LIST_ITEM_X).toBe(12);
    expect(DEX_MODE_LIST_HEADER_X).toBe(0);
    expect(DEX_MODE_LIST_CURSOR_X).toBe(4);
    expect(DEX_MODE_LIST_UP_TEXT_Y).toBe(2);
    expect(DEX_MODE_LIST_LETTER_SPACING).toBe(1);
  });

  test('pokedex ordered list layout matches sListMenuTemplate_OrderedListMenu', () => {
    expect(DEX_ORDERED_LIST_MAX_SHOWED).toBe(9);
    expect(DEX_ORDERED_LIST_ITEM_X).toBe(56);
    expect(DEX_ORDERED_LIST_CURSOR_X).toBe(4);
    expect(DEX_ORDERED_LIST_UP_TEXT_Y).toBe(2);
    expect(DEX_ORDERED_LIST_ROW_STRIDE).toBe(14);
  });

  test('pokedex entry rects are within viewport bounds', () => {
    const inBounds = (rect: { x: number; y: number; w: number; h: number }) =>
      rect.x >= 0 && rect.y >= 0 &&
      rect.x + rect.w <= DEX_GBA_WIDTH &&
      rect.y + rect.h <= DEX_GBA_HEIGHT;

    expect(inBounds(DEX_ENTRY_MON_PIC)).toBe(true);
    expect(inBounds(DEX_ENTRY_SPECIES_STATS)).toBe(true);
    expect(inBounds(DEX_ENTRY_FLAVOR)).toBe(true);
  });

  test('pokedex category slots scale 1-4', () => {
    const slots1 = getPokedexCategorySlots(1);
    expect(slots1).toHaveLength(1);

    const slots2 = getPokedexCategorySlots(2);
    expect(slots2).toHaveLength(2);

    const slots3 = getPokedexCategorySlots(3);
    expect(slots3).toHaveLength(3);

    const slots4 = getPokedexCategorySlots(4);
    expect(slots4).toHaveLength(4);

    const slotsClamped = getPokedexCategorySlots(5);
    expect(slotsClamped).toHaveLength(4);
  });

  test('pokedex color constants match decomp palette values', () => {
    expect(DEX_FOOTER_CONTROL_TEXT).toBe('#284868');
    expect(DEX_MODE_LIST_ITEM_ENABLED).toBe('#203048');
    expect(DEX_MODE_LIST_ITEM_DISABLED).toBe('#7088a8');
    expect(DEX_WINDOW_INNER_PIXEL0).toBe('#f8f8f8');
    expect(DEX_WINDOW_INNER_PIXEL15).toBe('#ffffff');
    expect(DEX_CATEGORY_ICON_TILE_BG).toBe('#e8eef4');
  });

  test('pokedex counts layout offsets are positive numbers', () => {
    expect(DEX_COUNTS_KANTO.seenLabel.x).toBeGreaterThanOrEqual(0);
    expect(DEX_COUNTS_KANTO.seenLabel.y).toBeGreaterThanOrEqual(0);
    expect(DEX_COUNTS_NATIONAL.seen.x).toBeGreaterThanOrEqual(0);
  });
});