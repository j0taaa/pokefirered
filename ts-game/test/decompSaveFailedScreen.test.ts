import { describe, expect, test } from 'vitest';
import {
  BlankPalettes,
  ClearMapBuffer,
  DoSaveFailedScreen,
  FillBgMapBufferRect,
  PrintTextOnSaveFailedScreen,
  RequestDmaCopyFromCharBuffer,
  RequestDmaCopyFromScreenBuffer,
  RunSaveFailedScreen,
  SAVE_NORMAL,
  SAVE_STATUS_ERROR,
  SAVE_STATUS_OK,
  SetNotInSaveFailedScreen,
  TryWipeDamagedSectors,
  UpdateMapBufferWithText,
  VerifySectorWipe,
  WipeDamagedSectors,
  WipeSector,
  clearMapBuffer,
  createSaveFailedScreenRuntime,
  doSaveFailedScreen,
  fillBgMapBufferRect,
  gText_BackupMemoryDamaged,
  gText_SaveCompletePressA,
  gText_SaveFailedCheckingBackup,
  printTextOnSaveFailedScreen,
  runSaveFailedScreen,
  setNotInSaveFailedScreen,
  tryWipeDamagedSectors,
  updateMapBufferWithText,
  verifySectorWipe,
  wipeDamagedSectors
} from '../src/game/decompSaveFailedScreen';

describe('decomp save_failed_screen', () => {
  test('entry flags and state 0 match the C screen gate', () => {
    const runtime = createSaveFailedScreenRuntime();
    expect(runSaveFailedScreen(runtime)).toBe(false);

    doSaveFailedScreen(runtime, SAVE_NORMAL);
    expect(runtime.isInSaveFailedScreen).toBe(true);
    expect(runSaveFailedScreen(runtime)).toBe(true);
    expect(runtime.bgmVolume).toBe(128);
    expect(runtime.callbacksSaved).toBe(1);
    expect(runtime.state).toBe(1);

    setNotInSaveFailedScreen(runtime);
    expect(runtime.isInSaveFailedScreen).toBe(false);
  });

  test('map buffer helpers write halfwords and request DMA like the decomp code', () => {
    const runtime = createSaveFailedScreenRuntime();

    fillBgMapBufferRect(runtime, 1, 1, 5, 3, 2, 1);
    const offset = 0x3800 + 64 * 5 + 2;
    expect(runtime.decompressionBuffer[offset]).toBe(1);
    expect(runtime.decompressionBuffer[offset + 2]).toBe(2);
    expect(runtime.decompressionBuffer[offset + 4]).toBe(3);
    expect(runtime.dmaRequests.at(-1)).toMatchObject({ kind: 'copy', dest: 'BG_SCREEN_ADDR(31)', size: 0x500 });

    clearMapBuffer(runtime);
    updateMapBufferWithText(runtime);
    printTextOnSaveFailedScreen(runtime, gText_SaveFailedCheckingBackup);
    expect(runtime.printedTexts.at(-1)).toBe(gText_SaveFailedCheckingBackup);
    expect(runtime.decompressionBuffer[0x20]).toBe(0x11);
    expect(runtime.dmaRequests.at(-1)).toMatchObject({ kind: 'copy', dest: 'BG_CHAR_ADDR(3)+0x20', size: 0x2300 });
  });

  test('sector wipe verification and damaged-sector retry loop follow the original return polarity', () => {
    const runtime = createSaveFailedScreenRuntime();
    runtime.flashSectors[2][100] = 7;
    expect(verifySectorWipe(runtime, 2)).toBe(true);
    expect(wipeDamagedSectors(runtime, 1 << 2)).toBe(false);
    expect(verifySectorWipe(runtime, 2)).toBe(false);

    runtime.damagedSaveSectors = 1 << 1;
    runtime.flashSectors[1][0] = 9;
    runtime.handleSavingData = (rt) => {
      rt.damagedSaveSectors = 0;
    };
    expect(tryWipeDamagedSectors(runtime)).toBe(true);
    expect(runtime.handleSavingDataCalls).toEqual([SAVE_NORMAL]);
  });

  test('full state machine prints success and restores map/audio state after A', () => {
    const runtime = createSaveFailedScreenRuntime();
    doSaveFailedScreen(runtime, SAVE_NORMAL);
    runtime.damagedSaveSectors = 1;
    runtime.flashSectors[0][0] = 1;
    runtime.handleSavingData = (rt) => {
      rt.damagedSaveSectors = 0;
    };

    for (let i = 0; i < 6; i += 1) {
      runSaveFailedScreen(runtime);
    }
    expect(runtime.saveAttemptStatus).toBe(SAVE_STATUS_OK);
    expect(runtime.printedTexts).toContain(gText_SaveCompletePressA);
    expect(runtime.state).toBe(6);

    runSaveFailedScreen(runtime);
    expect(runtime.state).toBe(6);
    runtime.aButtonNew = true;
    runSaveFailedScreen(runtime);
    runSaveFailedScreen(runtime);
    runSaveFailedScreen(runtime);
    expect(runtime.isInSaveFailedScreen).toBe(false);
    expect(runtime.state).toBe(0);
    expect(runtime.bgmVolume).toBe(256);
  });

  test('state 5 prints permanent damage text when sectors remain damaged', () => {
    const runtime = createSaveFailedScreenRuntime();
    doSaveFailedScreen(runtime, SAVE_NORMAL);
    runtime.damagedSaveSectors = 1;
    runtime.flashSectors[0].fill(1);
    runtime.handleSavingData = () => {};

    for (let i = 0; i < 6; i += 1) {
      runSaveFailedScreen(runtime);
    }

    expect(runtime.saveAttemptStatus).toBe(SAVE_STATUS_ERROR);
    expect(runtime.printedTexts).toContain(gText_BackupMemoryDamaged);
  });

  test('exact C-name save failed screen exports preserve palette, DMA, wipe, text, and state machine behavior', () => {
    const runtime = createSaveFailedScreenRuntime();

    DoSaveFailedScreen(runtime, SAVE_NORMAL);
    expect(runtime.isInSaveFailedScreen).toBe(true);
    expect(RunSaveFailedScreen(runtime)).toBe(true);
    expect(runtime.bgmVolume).toBe(128);
    SetNotInSaveFailedScreen(runtime);
    expect(runtime.isInSaveFailedScreen).toBe(false);

    runtime.bgPalette[0] = 7;
    runtime.objPalette[0] = 9;
    BlankPalettes(runtime);
    expect(runtime.bgPalette[0]).toBe(0);
    expect(runtime.objPalette[0]).toBe(0);

    RequestDmaCopyFromScreenBuffer(runtime);
    expect(runtime.dmaRequests.at(-1)).toMatchObject({ kind: 'copy', dest: 'BG_SCREEN_ADDR(31)', size: 0x500 });
    RequestDmaCopyFromCharBuffer(runtime);
    expect(runtime.dmaRequests.at(-1)).toMatchObject({ kind: 'copy', dest: 'BG_CHAR_ADDR(3)+0x20', size: 0x2300 });

    FillBgMapBufferRect(runtime, 1, 1, 5, 3, 2, 1);
    const offset = 0x3800 + 64 * 5 + 2;
    expect(runtime.decompressionBuffer[offset]).toBe(1);
    expect(runtime.decompressionBuffer[offset + 2]).toBe(2);
    ClearMapBuffer(runtime);
    UpdateMapBufferWithText(runtime);
    PrintTextOnSaveFailedScreen(runtime, gText_SaveFailedCheckingBackup);
    expect(runtime.printedTexts.at(-1)).toBe(gText_SaveFailedCheckingBackup);

    runtime.flashSectors[2][0] = 1;
    expect(VerifySectorWipe(runtime, 2)).toBe(true);
    expect(WipeSector(runtime, 2)).toBe(false);
    runtime.flashSectors[1][0] = 1;
    expect(WipeDamagedSectors(runtime, 1 << 1)).toBe(false);

    runtime.damagedSaveSectors = 1 << 3;
    runtime.flashSectors[3][0] = 1;
    runtime.handleSavingData = (rt) => {
      rt.damagedSaveSectors = 0;
    };
    expect(TryWipeDamagedSectors(runtime)).toBe(true);
  });
});
