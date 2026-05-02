import { describe, expect, test } from 'vitest';
import {
  hasUnionRoomDummyRfuPlayerData,
  parseUnionRoomAcceptedActivityIdArrays,
  parseUnionRoomListMenuItems,
  parseUnionRoomListMenuTemplates,
  parseUnionRoomWindowTemplates,
  sAcceptedActivityIds,
  sDotSeparatedValues,
  sLinkGroupActivityNameTexts,
  sLinkGroupToActivityAndCapacity,
  sLinkGroupToURoomActivity,
  UNION_ROOM_ACCEPTED_ACTIVITY_ID_ARRAYS,
  UNION_ROOM_DATA_SOURCE,
  UNION_ROOM_LIST_MENU_ITEMS,
  UNION_ROOM_LIST_MENU_TEMPLATES,
  UNION_ROOM_WINDOW_TEMPLATES
} from '../src/game/decompUnionRoomData';

describe('decomp union room data tables', () => {
  test('parses all major union room table categories from the source', () => {
    expect(UNION_ROOM_DATA_SOURCE).toContain('LINK_GROUP_CAPACITY(min, max)');
    expect(parseUnionRoomWindowTemplates(UNION_ROOM_DATA_SOURCE)).toEqual(UNION_ROOM_WINDOW_TEMPLATES);
    expect(parseUnionRoomListMenuItems(UNION_ROOM_DATA_SOURCE)).toEqual(UNION_ROOM_LIST_MENU_ITEMS);
    expect(parseUnionRoomListMenuTemplates(UNION_ROOM_DATA_SOURCE)).toEqual(UNION_ROOM_LIST_MENU_TEMPLATES);
    expect(parseUnionRoomAcceptedActivityIdArrays(UNION_ROOM_DATA_SOURCE)).toEqual(
      UNION_ROOM_ACCEPTED_ACTIVITY_ID_ARRAYS
    );
    expect(UNION_ROOM_WINDOW_TEMPLATES).toHaveLength(11);
    expect(UNION_ROOM_LIST_MENU_ITEMS).toHaveLength(7);
    expect(UNION_ROOM_LIST_MENU_TEMPLATES).toHaveLength(7);
    expect(UNION_ROOM_ACCEPTED_ACTIVITY_ID_ARRAYS).toHaveLength(13);
  });

  test('preserves link group activity names and capacity expressions', () => {
    expect(sLinkGroupActivityNameTexts.slice(0, 4)).toEqual([
      { index: 'ACTIVITY_NONE', value: 'gText_UR_EmptyString' },
      { index: 'ACTIVITY_BATTLE_SINGLE', value: 'gText_UR_SingleBattle' },
      { index: 'ACTIVITY_BATTLE_DOUBLE', value: 'gText_UR_DoubleBattle' },
      { index: 'ACTIVITY_BATTLE_MULTI', value: 'gText_UR_MultiBattle' }
    ]);
    expect(sLinkGroupToActivityAndCapacity).toContainEqual({
      index: 'LINK_GROUP_POKEMON_JUMP',
      value: 'ACTIVITY_POKEMON_JUMP      | LINK_GROUP_CAPACITY(2, 5)'
    });
    expect(sLinkGroupToActivityAndCapacity).toHaveLength(9);
  });

  test('preserves windows, menu items, and menu template fields', () => {
    expect(UNION_ROOM_WINDOW_TEMPLATES.find((entry) => entry.symbol === 'sWindowTemplate_BButtonCancel')).toEqual({
      symbol: 'sWindowTemplate_BButtonCancel',
      fields: {
        bg: '0',
        tilemapLeft: '0',
        tilemapTop: '0',
        width: '30',
        height: '2',
        paletteNum: '15',
        baseBlock: '0x008'
      }
    });
    expect(UNION_ROOM_LIST_MENU_ITEMS.find((entry) => entry.symbol === 'sListMenuItems_RegisterForTrade')?.items).toEqual([
      { text: 'gText_Register', value: '1' },
      { text: 'gText_UR_Info', value: '2' },
      { text: 'gText_UR_Exit', value: '3' }
    ]);
    expect(
      UNION_ROOM_LIST_MENU_TEMPLATES.find((entry) => entry.symbol === 'sListMenuTemplate_TradeBoard')?.fields
    ).toMatchObject({
      items: 'sListMenuItems_TradeBoard',
      itemPrintFunc: 'TradeBoardListMenuItemPrintFunc',
      maxShowed: '5',
      cursorPal: '14',
      fillValue: '15'
    });
  });

  test('keeps accepted activity id arrays and pointer tables in source order', () => {
    expect(UNION_ROOM_ACCEPTED_ACTIVITY_ID_ARRAYS[0]).toEqual({
      symbol: 'sAcceptedActivityIds_SingleBattle',
      ids: ['ACTIVITY_BATTLE_SINGLE', '0xFF']
    });
    expect(UNION_ROOM_ACCEPTED_ACTIVITY_ID_ARRAYS.find((entry) => entry.symbol === 'sAcceptedActivityIds_Resume')?.ids).toEqual([
      'IN_UNION_ROOM | ACTIVITY_NONE',
      'IN_UNION_ROOM | ACTIVITY_BATTLE_SINGLE',
      'IN_UNION_ROOM | ACTIVITY_TRADE',
      'IN_UNION_ROOM | ACTIVITY_CHAT',
      'IN_UNION_ROOM | ACTIVITY_CARD',
      'IN_UNION_ROOM | ACTIVITY_ACCEPT',
      'IN_UNION_ROOM | ACTIVITY_DECLINE',
      'IN_UNION_ROOM | ACTIVITY_NPCTALK',
      'IN_UNION_ROOM | ACTIVITY_PLYRTALK',
      '0xFF'
    ]);
    expect(sAcceptedActivityIds.at(-1)).toEqual({
      index: 'LINK_GROUP_UNK_12',
      value: 'sAcceptedActivityIds_Unk12'
    });
    expect(sLinkGroupToURoomActivity).toHaveLength(9);
  });

  test('preserves dummy RFU data marker and unused dynamic separator string', () => {
    expect(hasUnionRoomDummyRfuPlayerData).toBe(true);
    expect(sDotSeparatedValues).toContain('{DYNAMIC 00}');
    expect(sDotSeparatedValues).toContain('{DYNAMIC 01}');
  });
});
