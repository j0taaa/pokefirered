import { describe, expect, test } from 'vitest';
import {
  AddCoins,
  GetCoins,
  HideCoinsWindow,
  PrintCoinsString,
  PrintCoinsString_Parameterized,
  RemoveCoins,
  SetCoins,
  ShowCoinsWindow,
  ShowCoinsWindow_Parameterized,
  addCoins,
  getCoins,
  removeCoins,
  setCoins
} from '../src/game/decompCoins';

describe('decomp coins', () => {
  test('supports encrypted coin reads and writes', () => {
    const state = {
      vars: {
        coins: 250,
        coinsEncryptionKey: 0x55aa
      } as Record<string, number>
    };

    expect(getCoins(state)).toBe(250);

    setCoins(state, 4321);

    expect(getCoins(state)).toBe(4321);
    expect(state.vars.coins).toBe(4321);
    expect(state.vars.coinsEncrypted).toBe((4321 ^ 0x55aa) >>> 0);
  });

  test('matches FireRed add/remove clamp behavior', () => {
    const state = {
      vars: {
        coins: 9998,
        coinsEncryptionKey: 0
      } as Record<string, number>
    };

    expect(addCoins(state, 1)).toBe(true);
    expect(getCoins(state)).toBe(9999);
    expect(addCoins(state, 1)).toBe(false);
    expect(getCoins(state)).toBe(9999);

    expect(removeCoins(state, 10000)).toBe(false);
    expect(removeCoins(state, 99)).toBe(true);
    expect(getCoins(state)).toBe(9900);
  });

  test('exact C-name coin storage helpers mirror encrypted save behavior', () => {
    const state = { vars: { coins: 12, coinsEncryptionKey: 0x1010 } as Record<string, number> };

    expect(GetCoins(state)).toBe(12);
    expect(SetCoins(state, 321)).toBe(321);
    expect(state.vars.coinsEncrypted).toBe((321 ^ 0x1010) >>> 0);
    expect(AddCoins(state, 9999)).toBe(true);
    expect(GetCoins(state)).toBe(9999);
    expect(RemoveCoins(state, 100)).toBe(true);
    expect(GetCoins(state)).toBe(9899);
  });

  test('exact C-name coin window helpers preserve print/window operation order', () => {
    const state = { vars: { nextWindowId: 2 } as Record<string, number>, operations: [] as string[] };

    PrintCoinsString_Parameterized(state, 1, 42, 3, 4, 5);
    expect(state.operations.slice(0, 3)).toEqual([
      'ConvertIntToDecimalStringN:gStringVar1:42:RIGHT_ALIGN:4:  42',
      'StringExpandPlaceholders:gStringVar4:gText_Coins',
      'AddTextPrinterParameterized:1:FONT_SMALL:gStringVar4:3:4:5:NULL'
    ]);

    ShowCoinsWindow_Parameterized(state, 1, 0x21d, 13, 99);
    expect(state.operations).toContain('DrawStdFrameWithCustomTileAndPalette:1:FALSE:541:13');
    expect(state.operations).toContain('AddTextPrinterParameterized:1:FONT_NORMAL:gText_Coins_2:0:0:0xFF:0');

    ShowCoinsWindow(state, 123, 4, 5);
    expect(state.vars.coinsWindowId).toBe(2);
    expect(state.operations).toContain('SetWindowTemplateFields:0:5:6:8:3:15:32');
    expect(state.operations).toContain('AddWindow:2');
    expect(state.operations).toContain('LoadStdWindowGfx:2:0x21D:BG_PLTT_ID(13)');

    PrintCoinsString(state, 123);
    expect(state.operations).toContain('AddTextPrinterParameterized:2:FONT_SMALL:gStringVar4:40:12:0:NULL');

    HideCoinsWindow(state);
    expect(state.operations.slice(-3)).toEqual([
      'ClearWindowTilemap:2',
      'ClearStdWindowAndFrameToTransparent:2:TRUE',
      'RemoveWindow:2'
    ]);
  });
});
