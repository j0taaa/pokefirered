import { describe, expect, test } from 'vitest';
import {
  ApplyNewEncryptionKeyToBerryPowder,
  DecryptBerryPowder,
  DisplayBerryPowderVendorMenu,
  DrawPlayerPowderAmount,
  GetBerryPowder,
  GiveBerryPowder,
  HasEnoughBerryPowder,
  MAX_BERRY_POWDER,
  PrintBerryPowderAmount,
  PrintPlayerBerryPowderAmount,
  RemoveBerryPowderVendorMenu,
  Script_HasEnoughBerryPowder,
  Script_TakeBerryPowder,
  SetBerryPowder,
  TakeBerryPowder,
  applyNewEncryptionKeyToBerryPowder,
  createBerryPowderVendorWindow,
  decryptBerryPowder,
  formatBerryPowderAmount,
  getBerryPowder,
  giveBerryPowder,
  hasEnoughBerryPowder,
  printPlayerBerryPowderAmount,
  removeBerryPowderVendorMenu,
  scriptHasEnoughBerryPowder,
  scriptTakeBerryPowder,
  setBerryPowder,
  takeBerryPowder
} from '../src/game/decompBerryPowder';
import { createScriptRuntimeState } from '../src/game/scripts';

describe('decompBerryPowder', () => {
  test('encrypts, decrypts, and reapplies new encryption keys exactly', () => {
    const runtime = createScriptRuntimeState();
    runtime.vars.encryptionKey = 0x12345678;

    setBerryPowder(runtime, 12345);

    expect(runtime.newGame.berryPowderAmount).toBe((12345 ^ 0x12345678) >>> 0);
    expect(decryptBerryPowder(runtime)).toBe(12345);

    applyNewEncryptionKeyToBerryPowder(runtime, 0x87654321);
    runtime.vars.encryptionKey = 0x87654321;

    expect(getBerryPowder(runtime)).toBe(12345);
    expect(runtime.newGame.berryPowderAmount).toBe((12345 ^ 0x87654321) >>> 0);
  });

  test('GiveBerryPowder caps at MAX_BERRY_POWDER and returns the C success flag', () => {
    const runtime = createScriptRuntimeState();

    setBerryPowder(runtime, 99990);

    expect(giveBerryPowder(runtime, 9)).toBe(true);
    expect(getBerryPowder(runtime)).toBe(99999);
    expect(giveBerryPowder(runtime, 1)).toBe(false);
    expect(getBerryPowder(runtime)).toBe(MAX_BERRY_POWDER);
  });

  test('TakeBerryPowder and script wrappers use gSpecialVar_0x8004 costs', () => {
    const runtime = createScriptRuntimeState();

    setBerryPowder(runtime, 500);
    expect(hasEnoughBerryPowder(runtime, 400)).toBe(true);
    expect(takeBerryPowder(runtime, 400)).toBe(true);
    expect(getBerryPowder(runtime)).toBe(100);
    expect(takeBerryPowder(runtime, 101)).toBe(false);
    expect(getBerryPowder(runtime)).toBe(100);

    runtime.vars.gSpecialVar_0x8004 = 75;
    expect(scriptHasEnoughBerryPowder(runtime)).toBe(true);
    expect(scriptTakeBerryPowder(runtime)).toBe(true);
    expect(getBerryPowder(runtime)).toBe(25);

    runtime.vars.gSpecialVar_0x8004 = 26;
    expect(scriptHasEnoughBerryPowder(runtime)).toBe(false);
    expect(scriptTakeBerryPowder(runtime)).toBe(false);
    expect(getBerryPowder(runtime)).toBe(25);
  });

  test('vendor window descriptor matches DisplayBerryPowderVendorMenu layout and print positions', () => {
    const runtime = createScriptRuntimeState();

    setBerryPowder(runtime, 42);
    const window = createBerryPowderVendorWindow(runtime, 7);

    expect(window).toMatchObject({
      windowId: 7,
      template: {
        bg: 0,
        tilemapLeft: 1,
        tilemapTop: 1,
        width: 8,
        height: 3,
        paletteNum: 15,
        baseBlock: 32
      },
      baseBlock: 0x21d,
      palette: 13,
      label: 'Powder',
      amount: 42,
      amountText: '   42',
      amountX: 39,
      amountY: 12,
      visible: true
    });

    expect(formatBerryPowderAmount(99999)).toBe('99999');
    setBerryPowder(runtime, 5000);
    printPlayerBerryPowderAmount(runtime, window);
    expect(window.amountText).toBe(' 5000');
    removeBerryPowderVendorMenu(window);
    expect(window.visible).toBe(false);
  });

  test('exact C-name berry_powder exports preserve encryption, script checks, caps, printing, and vendor menu state', () => {
    const runtime = createScriptRuntimeState();
    runtime.vars.encryptionKey = 0x11112222;

    SetBerryPowder(runtime, 500);
    expect(runtime.newGame.berryPowderAmount).toBe((500 ^ 0x11112222) >>> 0);
    expect(DecryptBerryPowder(runtime)).toBe(500);
    expect(GetBerryPowder(runtime)).toBe(500);
    expect(HasEnoughBerryPowder(runtime, 499)).toBe(true);

    runtime.vars.gSpecialVar_0x8004 = 250;
    expect(Script_HasEnoughBerryPowder(runtime)).toBe(true);
    expect(Script_TakeBerryPowder(runtime)).toBe(true);
    expect(GetBerryPowder(runtime)).toBe(250);
    expect(TakeBerryPowder(runtime, 251)).toBe(false);
    expect(GiveBerryPowder(runtime, MAX_BERRY_POWDER)).toBe(false);
    expect(GetBerryPowder(runtime)).toBe(MAX_BERRY_POWDER);

    ApplyNewEncryptionKeyToBerryPowder(runtime, 0x33334444);
    runtime.vars.encryptionKey = 0x33334444;
    expect(GetBerryPowder(runtime)).toBe(MAX_BERRY_POWDER);

    expect(PrintBerryPowderAmount(runtime, 3, 42, 39, 12, 0)).toEqual({
      amountText: '   42',
      x: 39,
      y: 12,
      speed: 0
    });
    const drawn = DrawPlayerPowderAmount(runtime, 5, 0x21d, 13, 1234);
    expect(drawn).toMatchObject({ windowId: 5, baseBlock: 0x21d, palette: 13, label: 'Powder', amountText: ' 1234' });

    SetBerryPowder(runtime, 77);
    const window = DisplayBerryPowderVendorMenu(runtime, 9);
    expect(window).toMatchObject({ windowId: 9, amount: 77, amountText: '   77', visible: true });
    SetBerryPowder(runtime, 88);
    PrintPlayerBerryPowderAmount(runtime, window);
    expect(window.amountText).toBe('   88');
    RemoveBerryPowderVendorMenu(window);
    expect(window.visible).toBe(false);
  });
});
