import { describe, expect, test } from 'vitest';
import {
  getPartyMenuActionList,
  getPartyMenuBgTemplates,
  getPartyMenuBoxInfoRects,
  getPartyMenuCursorOptions,
  getPartyMenuFieldMoves,
  getPartyMenuRawDeclarations,
  getPartyMenuRawEnums,
  getPartyMenuSingleWindowTemplates,
  getPartyMenuSpriteCoords,
  getPartyMenuUnparsedRemainder
} from '../src/game/decompPartyMenuData';
import {
  PARTY_CANCEL_BUTTON_WINDOW,
  PARTY_SINGLE_SPRITES,
  PARTY_SINGLE_WINDOWS,
  PARTY_TEXT_LEFT,
  PARTY_TEXT_RIGHT
} from '../src/rendering/partyScreenLayout';

describe('decomp party menu data', () => {
  test('covers every top-level declaration from src/data/party_menu.h', () => {
    expect(getPartyMenuRawDeclarations()).toHaveLength(114);
    expect(getPartyMenuRawEnums()).toHaveLength(3);
    expect(getPartyMenuUnparsedRemainder()).toBe('');
  });

  test('ports party menu backgrounds and windows from the C tables', () => {
    expect(getPartyMenuBgTemplates()).toEqual([
      { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
      { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
      { bg: 2, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 1, paletteMode: 0, priority: 0, baseTile: 0 }
    ]);

    expect(getPartyMenuSingleWindowTemplates()).toEqual([
      { bg: 0, tilemapLeft: 1, tilemapTop: 3, width: 10, height: 7, paletteNum: 3, baseBlock: 0x63 },
      { bg: 0, tilemapLeft: 12, tilemapTop: 1, width: 18, height: 3, paletteNum: 4, baseBlock: 0xa9 },
      { bg: 0, tilemapLeft: 12, tilemapTop: 4, width: 18, height: 3, paletteNum: 5, baseBlock: 0xdf },
      { bg: 0, tilemapLeft: 12, tilemapTop: 7, width: 18, height: 3, paletteNum: 6, baseBlock: 0x115 },
      { bg: 0, tilemapLeft: 12, tilemapTop: 10, width: 18, height: 3, paletteNum: 7, baseBlock: 0x14b },
      { bg: 0, tilemapLeft: 12, tilemapTop: 13, width: 18, height: 3, paletteNum: 8, baseBlock: 0x181 },
      { bg: 2, tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4, paletteNum: 14, baseBlock: 0x1df },
      'DUMMY_WIN_TEMPLATE'
    ]);
  });

  test('feeds the renderer layout from the parsed party menu tables', () => {
    expect(PARTY_SINGLE_WINDOWS[0]).toEqual({ slot: 0, tileLeft: 1, tileTop: 3, tileW: 10, tileH: 7, column: 'left' });
    expect(PARTY_SINGLE_WINDOWS[6]).toEqual({ slot: 'message', tileLeft: 1, tileTop: 15, tileW: 28, tileH: 4, column: 'message' });
    expect(PARTY_CANCEL_BUTTON_WINDOW).toEqual({ tileLeft: 24, tileTop: 17, tileW: 6, tileH: 2 });

    expect(PARTY_SINGLE_SPRITES[0]).toEqual({
      mon: { x: 16, y: 40 },
      item: { x: 20, y: 50 },
      status: { x: 56, y: 52 },
      pokeball: { x: 16, y: 34 }
    });

    expect(PARTY_TEXT_LEFT.nickname).toEqual({ x: 24, y: 11, w: 40, h: 13 });
    expect(PARTY_TEXT_RIGHT.hpBar).toEqual({ x: 88, y: 10, w: 48, h: 3 });
  });

  test('ports cursor options, action lists, sprite coords, and field moves exactly', () => {
    const cursorOptions = getPartyMenuCursorOptions();
    expect(cursorOptions).toHaveLength(30);
    expect(cursorOptions[0]).toEqual({
      index: 'CURSOR_OPTION_SUMMARY',
      text: 'gText_Summary5',
      func: 'CursorCB_Summary'
    });
    expect(cursorOptions.at(-1)).toEqual({
      index: 'CURSOR_OPTION_FIELD_MOVES + FIELD_MOVE_SWEET_SCENT',
      text: 'gMoveNames[MOVE_SWEET_SCENT]',
      func: 'CursorCB_FieldMove'
    });

    expect(getPartyMenuActionList('sPartyMenuAction_GiveTakeItemCancel')).toEqual([
      'CURSOR_OPTION_GIVE',
      'CURSOR_OPTION_TAKE_ITEM',
      'CURSOR_OPTION_CANCEL2'
    ]);
    expect(getPartyMenuFieldMoves()).toEqual([
      'MOVE_FLASH',
      'MOVE_CUT',
      'MOVE_FLY',
      'MOVE_STRENGTH',
      'MOVE_SURF',
      'MOVE_ROCK_SMASH',
      'MOVE_WATERFALL',
      'MOVE_TELEPORT',
      'MOVE_DIG',
      'MOVE_MILK_DRINK',
      'MOVE_SOFT_BOILED',
      'MOVE_SWEET_SCENT',
      'FIELD_MOVE_END'
    ]);

    expect(getPartyMenuSpriteCoords().PARTY_LAYOUT_MULTI_SHOWCASE).toHaveLength(6);
    expect(getPartyMenuBoxInfoRects().PARTY_BOX_RIGHT_COLUMN.description).toEqual({ x: 77, y: 4, w: 64, h: 16 });
  });
});
