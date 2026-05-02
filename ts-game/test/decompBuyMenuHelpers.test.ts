import { describe, expect, test } from 'vitest';
import {
  BuyMenuConfirmPurchase,
  BuyMenuDisplayMessage,
  BuyMenuDrawMoneyBox,
  BuyMenuInitWindows,
  BuyMenuPrint,
  BuyMenuQuantityBoxNormalBorder,
  BuyMenuQuantityBoxThinBorder,
  buyMenuConfirmPurchase,
  buyMenuDisplayMessage,
  buyMenuDrawMoneyBox,
  buyMenuInitWindows,
  buyMenuPrint,
  buyMenuQuantityBoxNormalBorder,
  buyMenuQuantityBoxThinBorder,
  itemListIsSellingTm,
  SHOP_BUY_MENU_TEXT_COLORS,
  SHOP_BUY_MENU_WINDOW_TEMPLATES_NORMAL,
  SHOP_BUY_MENU_WINDOW_TEMPLATES_TM,
  SHOP_BUY_MENU_YES_NO_WINDOW_TEMPLATE
} from '../src/game/decompBuyMenuHelpers';

describe('decomp buy_menu_helpers parity', () => {
  test('initializes normal and TM window layouts with the original tilemap windows', () => {
    expect(buyMenuInitWindows(false)).toEqual({
      isSellingTM: false,
      windows: SHOP_BUY_MENU_WINDOW_TEMPLATES_NORMAL,
      loadedWindowGfx: [
        { kind: 'user', windowId: 0, tileStart: 0x1, paletteId: 13 * 16 },
        { kind: 'menuMessage', windowId: 0, tileStart: 0x13, paletteId: 14 * 16 },
        { kind: 'std', windowId: 0, tileStart: 0xa, paletteId: 15 * 16 }
      ],
      tilemapWindows: [0, 4, 5]
    });

    expect(buyMenuInitWindows(true).windows).toEqual(SHOP_BUY_MENU_WINDOW_TEMPLATES_TM);
    expect(buyMenuInitWindows(true).tilemapWindows).toEqual([0, 4, 5, 6]);
    expect(SHOP_BUY_MENU_WINDOW_TEMPLATES_TM[6]).toEqual({
      bg: 0,
      tilemapLeft: 1,
      tilemapTop: 14,
      width: 10,
      height: 4,
      paletteNum: 14,
      baseBlock: 0x22b
    });
  });

  test('preserves money box, yes-no, frame, and text-color constants', () => {
    expect(buyMenuDrawMoneyBox(12345)).toEqual({
      windowId: 0,
      tileStart: 0xa,
      palette: 0xf,
      money: 12345
    });
    expect(buyMenuConfirmPurchase(7)).toEqual({
      taskId: 7,
      window: SHOP_BUY_MENU_YES_NO_WINDOW_TEMPLATE,
      font: 1,
      x: 0,
      y: 2,
      baseTile: 1,
      palette: 13,
      yesNo: null
    });
    expect(buyMenuQuantityBoxNormalBorder(3, false)).toEqual({
      windowId: 3,
      copyToVram: false,
      tileStart: 0x1,
      palette: 13
    });
    expect(buyMenuQuantityBoxThinBorder(1, true)).toEqual({
      windowId: 1,
      copyToVram: true,
      tileStart: 0xa,
      palette: 15
    });
    expect(SHOP_BUY_MENU_TEXT_COLORS).toEqual([[0, 1, 2], [0, 2, 3], [0, 3, 2]]);
  });

  test('builds print and message descriptors from the same parameters as the C helpers', () => {
    expect(buyMenuPrint(5, 1, 'POTION', 2, 3, 1, 0, 0, 1)).toEqual({
      windowId: 5,
      font: 1,
      text: 'POTION',
      x: 2,
      y: 3,
      letterSpacing: 1,
      lineSpacing: 0,
      speed: 0,
      colors: [0, 2, 3]
    });
    expect(buyMenuDisplayMessage(4, 'Here you are!', 1, 2)).toEqual({
      taskId: 4,
      text: 'Here you are!',
      windowId: 2,
      tileStart: 0x13,
      paletteId: 0xe,
      font: 1,
      textSpeed: 2,
      callback: null,
      scheduledBg: 0
    });
  });

  test('exposes exact C-name helper entry points with the same call constants', () => {
    expect(BuyMenuInitWindows(1)).toEqual(buyMenuInitWindows(true));
    expect(BuyMenuInitWindows(0)).toEqual(buyMenuInitWindows(false));
    expect(BuyMenuDrawMoneyBox(999)).toEqual(buyMenuDrawMoneyBox(999));
    expect(BuyMenuPrint(1, 2, 'TM05', 3, 4, 5, 6, 7, 2)).toEqual({
      windowId: 1,
      font: 2,
      text: 'TM05',
      x: 3,
      y: 4,
      letterSpacing: 5,
      lineSpacing: 6,
      speed: 7,
      colors: [0, 3, 2]
    });
    expect(BuyMenuDisplayMessage(8, 'Take this?', 'Task_BuyMenu')).toEqual({
      taskId: 8,
      text: 'Take this?',
      windowId: 2,
      tileStart: 0x13,
      paletteId: 0xe,
      font: 1,
      textSpeed: 0,
      callback: 'Task_BuyMenu',
      scheduledBg: 0
    });
    expect(BuyMenuQuantityBoxNormalBorder(4, 0)).toEqual(buyMenuQuantityBoxNormalBorder(4, false));
    expect(BuyMenuQuantityBoxThinBorder(5, 1)).toEqual(buyMenuQuantityBoxThinBorder(5, true));
    expect(BuyMenuConfirmPurchase(9, 'sYesNo')).toEqual({
      taskId: 9,
      window: SHOP_BUY_MENU_YES_NO_WINDOW_TEMPLATE,
      font: 1,
      x: 0,
      y: 2,
      baseTile: 1,
      palette: 13,
      yesNo: 'sYesNo'
    });
  });

  test('detects TM shop stock using the item pocket callback', () => {
    expect(itemListIsSellingTm(['ITEM_POTION', 'ITEM_TM05'], (itemId) =>
      itemId.startsWith('ITEM_TM') ? 'POCKET_TM_CASE' : 'POCKET_ITEMS'
    )).toBe(true);
    expect(itemListIsSellingTm(['ITEM_POTION'], () => 'POCKET_ITEMS')).toBe(false);
  });
});
