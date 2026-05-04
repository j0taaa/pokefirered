import { describe, expect, test } from 'vitest';
import {
  BAG_GBA_WIDTH,
  BAG_GBA_HEIGHT,
  BAG_LIST_WINDOW,
  BAG_MESSAGE_WINDOW,
  BAG_POCKET_NAME_WINDOW,
  BAG_LIST_ITEM_X,
  BAG_LIST_CURSOR_X,
  BAG_LIST_UP_TEXT_Y,
  BAG_LIST_ROW_PITCH,
  BAG_LIST_QTY_X,
  BAG_LIST_SELECT_BLIT_X,
  BAG_SPRITE_X,
  BAG_SPRITE_Y,
  BAG_SPRITE_Y2_INITIAL,
  BAG_SPRITE_SRC_W,
  BAG_SPRITE_SRC_H,
  BAG_ITEM_ICON_X,
  BAG_ITEM_ICON_Y,
  BAG_ITEM_ICON_DRAW_SIZE,
  BAG_MESSAGE_TEXT_X,
  BAG_MESSAGE_TEXT_Y,
  BAG_MESSAGE_LETTER_SPACING,
  BAG_POCKET_NAME_CENTER_WIDTH,
  BAG_POCKET_NAME_TEXT_Y,
  BAG_POCKET_ARROW_LEFT,
  BAG_POCKET_ARROW_RIGHT,
  BAG_CONTEXT_TITLE_RECT,
  BAG_TOSS_PROMPT_RECT,
  BAG_TOSS_QTY_RECT,
  BAG_YESNO_BOTTOM_RIGHT_RECT,
  BAG_CONTEXT_MENU_CURSOR_X,
  BAG_CONTEXT_MENU_TEXT_X,
  BAG_CONTEXT_MENU_FIRST_ROW_Y,
  BAG_CONTEXT_MENU_ROW_PITCH,
  bagContextActionsRect
} from '../src/rendering/bagScreenLayout';

describe('bag screen layout parity', () => {
  test('GBA viewport dimensions match FireRed hardware', () => {
    expect(BAG_GBA_WIDTH).toBe(240);
    expect(BAG_GBA_HEIGHT).toBe(160);
  });

  test('bag window rects are within viewport bounds', () => {
    const inBounds = (rect: { x: number; y: number; w: number; h: number }) =>
      rect.x >= 0 && rect.y >= 0 &&
      rect.x + rect.w <= BAG_GBA_WIDTH &&
      rect.y + rect.h <= BAG_GBA_HEIGHT;

    expect(inBounds(BAG_LIST_WINDOW)).toBe(true);
    expect(inBounds(BAG_MESSAGE_WINDOW)).toBe(true);
    expect(inBounds(BAG_POCKET_NAME_WINDOW)).toBe(true);
    expect(inBounds(BAG_CONTEXT_TITLE_RECT)).toBe(true);
    expect(inBounds(BAG_TOSS_PROMPT_RECT)).toBe(true);
    expect(inBounds(BAG_TOSS_QTY_RECT)).toBe(true);
    expect(inBounds(BAG_YESNO_BOTTOM_RIGHT_RECT)).toBe(true);
  });

  test('bag list layout constants match decomp values', () => {
    expect(BAG_LIST_ITEM_X).toBe(9);
    expect(BAG_LIST_CURSOR_X).toBe(1);
    expect(BAG_LIST_UP_TEXT_Y).toBe(2);
    expect(BAG_LIST_ROW_PITCH).toBe(16);
    expect(BAG_LIST_QTY_X).toBe(0x6e);
    expect(BAG_LIST_SELECT_BLIT_X).toBe(0x70);
  });

  test('bag sprite position matches CreateBagSprite', () => {
    expect(BAG_SPRITE_X).toBe(40);
    expect(BAG_SPRITE_Y).toBe(68);
    expect(BAG_SPRITE_Y2_INITIAL).toBe(-5);
    expect(BAG_SPRITE_SRC_W).toBe(64);
    expect(BAG_SPRITE_SRC_H).toBe(64);
  });

  test('bag item icon position matches CreateItemMenuIcon', () => {
    expect(BAG_ITEM_ICON_X).toBe(24);
    expect(BAG_ITEM_ICON_Y).toBe(140);
    expect(BAG_ITEM_ICON_DRAW_SIZE).toBe(32);
  });

  test('bag message text position matches PrintItemDescriptionOnMessageWindow', () => {
    expect(BAG_MESSAGE_TEXT_X).toBe(0);
    expect(BAG_MESSAGE_TEXT_Y).toBe(3);
    expect(BAG_MESSAGE_LETTER_SPACING).toBe(2);
  });

  test('pocket name centering width matches decomp', () => {
    expect(BAG_POCKET_NAME_CENTER_WIDTH).toBe(0x48);
    expect(BAG_POCKET_NAME_TEXT_Y).toBe(1);
  });

  test('pocket arrow positions match sPocketSwitchArrowPairTemplate', () => {
    expect(BAG_POCKET_ARROW_LEFT).toEqual({ x: 8, y: 72 });
    expect(BAG_POCKET_ARROW_RIGHT).toEqual({ x: 72, y: 72 });
  });

test('context actions rect scales with action count', () => {
    const rect1 = bagContextActionsRect(1);
    expect(rect1.w).toBe(7 * 8);
    expect(rect1.h).toBe(2 * 8);

    const rect4 = bagContextActionsRect(4);
    expect(rect4.h).toBe(8 * 8);

    const rect5 = bagContextActionsRect(5);
    expect(rect5.h).toBe(8 * 8);
  });

  test('context menu text layout constants match decomp', () => {
    expect(BAG_CONTEXT_MENU_CURSOR_X).toBe(8);
    expect(BAG_CONTEXT_MENU_TEXT_X).toBe(8);
    expect(BAG_CONTEXT_MENU_FIRST_ROW_Y).toBe(2);
    expect(BAG_CONTEXT_MENU_ROW_PITCH).toBe(16);
  });
});