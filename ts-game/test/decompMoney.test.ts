import { describe, expect, test } from 'vitest';
import {
  AddMoney,
  ChangeAmountInMoneyBox,
  DecompMoneyState,
  DrawMoneyBox,
  GetMoney,
  HideMoneyBox,
  IsEnoughForCostInVar0x8005,
  IsEnoughMoney,
  PrintMoneyAmount,
  PrintMoneyAmountInMoneyBox,
  PrintMoneyAmountInMoneyBoxWithBorder,
  RemoveMoney,
  SetMoney,
  SubtractMoneyFromVar0x8005,
  addMoney,
  getMoney,
  isEnoughMoney,
  removeMoney,
  setMoney
} from '../src/game/decompMoney';

describe('decompMoney', () => {
  test('supports legacy fallback reads and encrypted writes', () => {
    const state = {
      vars: {
        money: 4321,
        moneyEncryptionKey: 0x1234
      } as Record<string, number>
    };

    expect(getMoney(state)).toBe(4321);

    setMoney(state, 6789);

    expect(getMoney(state)).toBe(6789);
    expect(state.vars.money).toBe(6789);
    expect(state.vars.moneyEncrypted).toBe((6789 ^ 0x1234) >>> 0);
  });

  test('matches FireRed add/remove clamp behavior', () => {
    const state = { vars: { money: 900, moneyEncryptionKey: 0 } as Record<string, number> };

    expect(isEnoughMoney(state, 500)).toBe(true);
    expect(isEnoughMoney(state, 901)).toBe(false);

    addMoney(state, 200);
    expect(getMoney(state)).toBe(1100);

    removeMoney(state, 1500);
    expect(getMoney(state)).toBe(0);
  });

  test('exact C-name money exports preserve encrypted arithmetic and Var 0x8005 helpers', () => {
    const state = { vars: { money: 1000, moneyEncryptionKey: 0x55aa, specialVar0x8005: 400 } as Record<string, number> };

    expect(GetMoney(state)).toBe(1000);
    expect(IsEnoughMoney(state, 999)).toBe(true);
    expect(IsEnoughForCostInVar0x8005(state)).toBe(true);

    AddMoney(state, 999999);
    expect(GetMoney(state)).toBe(999999);

    SetMoney(state, 900);
    SubtractMoneyFromVar0x8005(state);
    expect(GetMoney(state)).toBe(500);

    RemoveMoney(state, 501);
    expect(GetMoney(state)).toBe(0);
  });

  test('exact C-name money-box exports mirror padded text and window side effects', () => {
    const state: DecompMoneyState = { vars: {} };

    PrintMoneyAmountInMoneyBox(state, 2, 1234, 5);
    expect(state.stringVar1).toBe('1234');
    expect(state.stringVar4).toBe('\0\0¥1234');
    expect(state.textPrinterLog?.at(-1)).toEqual({
      windowId: 2,
      fontId: 0,
      text: '\0\0¥1234',
      x: 22,
      y: 0x0c,
      speed: 5
    });

    PrintMoneyAmount(state, 3, 9, 10, 98765, 7);
    expect(state.textPrinterLog?.at(-1)).toEqual({
      windowId: 3,
      fontId: 0,
      text: '\0¥98765',
      x: 9,
      y: 10,
      speed: 7
    });

    PrintMoneyAmountInMoneyBoxWithBorder(state, 4, 0x21d, 13, 77);
    expect(state.frameLog?.at(-1)).toEqual({ windowId: 4, copyToVram: false, tileStart: 0x21d, paletteNum: 13 });
    expect(state.textPrinterLog?.slice(-2)).toEqual([
      { windowId: 4, fontId: 1, text: 'MONEY', x: 0, y: 0, speed: 0xff },
      { windowId: 4, fontId: 0, text: '\0\0\0\0¥77', x: 22, y: 0x0c, speed: 0 }
    ]);

    DrawMoneyBox(state, 42, 5, 6);
    expect(state.moneyBoxWindowId).toBe(0);
    expect(state.windows?.[0]).toMatchObject({
      bg: 0,
      tilemapLeft: 6,
      tilemapTop: 7,
      width: 8,
      height: 3,
      paletteNum: 15,
      baseBlock: 8,
      pixelFill: 0,
      tilemapPut: true,
      gfx: { tileStart: 0x21d, palette: 13 << 4 }
    });

    ChangeAmountInMoneyBox(state, 999);
    expect(state.textPrinterLog?.at(-1)?.text).toBe('\0\0\0¥999');

    HideMoneyBox(state);
    expect(state.windows?.[0].removed).toBe(true);
    expect(state.windowOpsLog?.slice(-2)).toEqual([
      { op: 'CopyWindowToVram', windowId: 0, value: 2 },
      { op: 'RemoveWindow', windowId: 0 }
    ]);
  });
});
