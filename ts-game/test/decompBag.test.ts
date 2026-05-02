import { describe, expect, test } from 'vitest';
import {
  BagCreateYesNoMenuBottomRight,
  BagCreateYesNoMenuTopRight,
  BagDrawDepositItemTextBox,
  BagDrawTextBoxOnWindow,
  BagPrintMoneyAmount,
  BagPrintTextOnWin1CenteredColor0,
  BagPrintTextOnWindow,
  CloseBagWindow,
  GetBagWindow,
  HideBagWindow,
  InitBagWindows,
  OpenBagWindow,
  ShowBagWindow,
  bagCreateYesNoMenuBottomRight,
  bagCreateYesNoMenuTopRight,
  bagDrawDepositItemTextBox,
  bagDrawTextBoxOnWindow,
  bagPrintMoneyAmount,
  bagPrintTextOnWin1CenteredColor0,
  bagPrintTextOnWindow,
  closeBagWindow,
  createBagRuntime,
  getBagWindow,
  hideBagWindow,
  initBagWindows,
  openBagWindow,
  sDefaultBagWindowsDeposit,
  sDefaultBagWindowsStd,
  showBagWindow
} from '../src/game/decompBag';

describe('decomp bag', () => {
  test('InitBagWindows chooses standard or deposit templates and resets open windows', () => {
    const runtime = createBagRuntime();
    runtime.openWindows[0] = 7;
    initBagWindows(runtime);

    expect(runtime.initializedTemplates).toEqual(sDefaultBagWindowsStd);
    expect(runtime.textPrintersDeactivated).toBe(1);
    expect(runtime.loadedWindowGfx.map((gfx) => gfx.kind)).toEqual(['user', 'menuMessage', 'std']);
    expect(runtime.fills).toEqual([
      { windowId: 0, fill: 0 },
      { windowId: 1, fill: 0 },
      { windowId: 2, fill: 0 }
    ]);
    expect(runtime.tilemapPuts).toEqual([0, 1, 2]);
    expect(runtime.openWindows.every((windowId) => windowId === 0xff)).toBe(true);

    runtime.bagMenuLocation = 3;
    initBagWindows(runtime);
    expect(runtime.initializedTemplates).toEqual(sDefaultBagWindowsDeposit);
  });

  test('text helpers write printer records with exact colors and centered x math', () => {
    const runtime = createBagRuntime();
    bagPrintTextOnWindow(runtime, 4, 2, 'ABC', 1, 2, 3, 4, 5, 1);
    bagPrintTextOnWin1CenteredColor0(runtime, 'ABCD', 0);
    bagDrawDepositItemTextBox(runtime);

    expect(runtime.textPrinters[0]).toMatchObject({
      windowId: 4,
      fontId: 2,
      x: 1,
      y: 2,
      letterSpacing: 3,
      lineSpacing: 4,
      speed: 5,
      colors: [0, 2, 3],
      text: 'ABC'
    });
    expect(runtime.textPrinters[1]).toMatchObject({ windowId: 2, x: 20, text: 'ABCD' });
    expect(runtime.frames[0]).toEqual({ windowId: 2, tile: 0x081, palette: 12 });
    expect(runtime.textPrinters[2]).toMatchObject({ windowId: 2, x: -16, text: 'Deposit Item' });
  });

  test('ShowBagWindow caches AddWindow results and HideBagWindow clears/removes them', () => {
    const runtime = createBagRuntime();
    const first = showBagWindow(runtime, 1, 2);
    const second = showBagWindow(runtime, 1, 2);

    expect(first).toBe(3);
    expect(second).toBe(first);
    expect(runtime.frames[0]).toEqual({ windowId: first, tile: 0x064, palette: 14 });
    expect(runtime.bgCopies).toEqual([0]);

    const special = showBagWindow(runtime, 6, 0);
    expect(runtime.frames.at(-1)).toEqual({ windowId: special, tile: 0x081, palette: 12 });

    hideBagWindow(runtime, 1);
    expect(runtime.clearedStdWindows).toContain(first);
    expect(runtime.clearedTilemaps).toContain(first);
    expect(runtime.removedWindows).toContain(first);
    expect(getBagWindow(runtime, 1)).toBe(0xff);
  });

  test('OpenBagWindow and CloseBagWindow only close open windows', () => {
    const runtime = createBagRuntime();
    const first = openBagWindow(runtime, 4);
    expect(openBagWindow(runtime, 4)).toBe(first);
    closeBagWindow(runtime, 4);

    expect(runtime.clearedDialogWindows).toEqual([first]);
    expect(runtime.tilemapPuts).toEqual([1]);
    expect(runtime.openWindows[4]).toBe(0xff);

    closeBagWindow(runtime, 4);
    expect(runtime.clearedDialogWindows).toEqual([first]);
  });

  test('yes/no, money, and text-box helpers use the same templates and tiles', () => {
    const runtime = createBagRuntime();
    runtime.money = 12345;

    bagCreateYesNoMenuBottomRight(runtime, 9, 'bottom');
    bagCreateYesNoMenuTopRight(runtime, 10, 'top');
    bagPrintMoneyAmount(runtime);
    bagDrawTextBoxOnWindow(runtime, 8);

    expect(runtime.yesNoMenus[0]).toMatchObject({ taskId: 9, callbacks: 'bottom', tile: 0x064, palette: 14 });
    expect(runtime.yesNoMenus[0].template.tilemapLeft).toBe(23);
    expect(runtime.yesNoMenus[1].template.tilemapLeft).toBe(21);
    expect(runtime.moneyPrints[0]).toEqual({ windowId: 3, tile: 0x081, palette: 0x0c, amount: 12345 });
    expect(runtime.frames.at(-1)).toEqual({ windowId: 8, tile: 0x064, palette: 14 });
  });

  test('exact C-name exports dispatch the same bag window and text logic', () => {
    const runtime = createBagRuntime();
    runtime.bagMenuLocation = 3;
    InitBagWindows(runtime);
    expect(runtime.initializedTemplates).toEqual(sDefaultBagWindowsDeposit);
    expect(runtime.openWindows.every((windowId) => windowId === 0xff)).toBe(true);

    BagPrintTextOnWindow(runtime, 4, 2, 'ABC', 1, 2, 3, 4, 5, 1);
    expect(runtime.textPrinters.at(-1)).toMatchObject({
      windowId: 4,
      fontId: 2,
      x: 1,
      y: 2,
      colors: [0, 2, 3],
      text: 'ABC'
    });

    BagPrintTextOnWin1CenteredColor0(runtime, 'ABCD', 0);
    expect(runtime.textPrinters.at(-1)).toMatchObject({ windowId: 2, x: 20, text: 'ABCD' });

    BagDrawDepositItemTextBox(runtime);
    expect(runtime.frames.at(-1)).toEqual({ windowId: 2, tile: 0x081, palette: 12 });
    expect(runtime.textPrinters.at(-1)).toMatchObject({ windowId: 2, x: -16, text: 'Deposit Item' });

    const shown = ShowBagWindow(runtime, 6, 0);
    expect(GetBagWindow(runtime, 6)).toBe(shown);
    expect(runtime.frames.at(-1)).toEqual({ windowId: shown, tile: 0x081, palette: 12 });
    HideBagWindow(runtime, 6);
    expect(GetBagWindow(runtime, 6)).toBe(0xff);

    const opened = OpenBagWindow(runtime, 4);
    expect(OpenBagWindow(runtime, 4)).toBe(opened);
    CloseBagWindow(runtime, 4);
    expect(runtime.clearedDialogWindows).toContain(opened);

    BagCreateYesNoMenuBottomRight(runtime, 9, 'bottom');
    BagCreateYesNoMenuTopRight(runtime, 10, 'top');
    expect(runtime.yesNoMenus.at(-2)).toMatchObject({ taskId: 9, callbacks: 'bottom', tile: 0x064, palette: 14 });
    expect(runtime.yesNoMenus.at(-1)).toMatchObject({ taskId: 10, callbacks: 'top', tile: 0x064, palette: 14 });

    runtime.money = 777;
    BagPrintMoneyAmount(runtime);
    expect(runtime.moneyPrints.at(-1)).toEqual({ windowId: 5, tile: 0x081, palette: 0x0c, amount: 777 });

    BagDrawTextBoxOnWindow(runtime, 8);
    expect(runtime.frames.at(-1)).toEqual({ windowId: 8, tile: 0x064, palette: 14 });
  });
});
