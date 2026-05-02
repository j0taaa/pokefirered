import { describe, expect, test } from 'vitest';
import {
  AdjustQuantityAccordingToDPadInput,
  CreateYesNoMenuWithCallbacks,
  DisplayMessageAndContinueTask,
  FONT_FEMALE,
  FONT_MALE,
  GetDialogBoxFontId,
  GetLRKeysPressed,
  GetLRKeysPressedAndHeld,
  ITEM_ENIGMA_BERRY,
  IsActiveOverworldLinkBusy,
  IsHoldingItemAllowed,
  IsWritingMailAllowed,
  MAP_TRADE_CENTER,
  MENU_B_PRESSED,
  MENU_L_PRESSED,
  MENU_R_PRESSED,
  MenuHelpers_IsLinkActive,
  MenuHelpers_ShouldWaitForLinkRecv,
  NPC_TEXT_COLOR_MALE,
  ResetAllBgsCoordinatesAndBgCntRegs,
  ResetVramOamAndBgCntRegs,
  RunTextPrinters_CheckActive,
  SE_SELECT,
  SetVBlankHBlankCallbacksToNull,
  Task_CallYesOrNoCallback,
  Task_ContinueTaskAfterMessagePrints,
  adjustQuantityAccordingToDPadInput,
  createMenuHelpersRuntime,
  getLrKeysPressed
} from '../src/game/decompMenuHelpers';
import { createScriptRuntimeState } from '../src/game/scripts';

describe('decompMenuHelpers', () => {
  test('adjusts toss quantities with FireRed-style D-pad rules', () => {
    expect(adjustQuantityAccordingToDPadInput(1, 25, { upPressed: true, downPressed: false, leftPressed: false, rightPressed: false }))
      .toEqual({ quantity: 2, changed: true });
    expect(adjustQuantityAccordingToDPadInput(25, 25, { upPressed: true, downPressed: false, leftPressed: false, rightPressed: false }))
      .toEqual({ quantity: 1, changed: true });
    expect(adjustQuantityAccordingToDPadInput(1, 25, { downPressed: true, upPressed: false, leftPressed: false, rightPressed: false }))
      .toEqual({ quantity: 25, changed: true });
    expect(adjustQuantityAccordingToDPadInput(1, 25, { rightPressed: true, upPressed: false, downPressed: false, leftPressed: false }))
      .toEqual({ quantity: 11, changed: true });
    expect(adjustQuantityAccordingToDPadInput(5, 25, { leftPressed: true, upPressed: false, downPressed: false, rightPressed: false }))
      .toEqual({ quantity: 1, changed: true });
  });

  test('respects LR button mode when checking shoulder-button menu input', () => {
    const runtime = createScriptRuntimeState();
    expect(getLrKeysPressed(runtime, { lPressed: true })).toBeNull();

    runtime.options.buttonMode = 'lr';
    expect(getLrKeysPressed(runtime, { lPressed: true })).toBe('MENU_L_PRESSED');
    expect(getLrKeysPressed(runtime, { rPressed: true })).toBe('MENU_R_PRESSED');
  });

  test('exact C-name message and yes/no helpers preserve task dispatch side effects', () => {
    const runtime = createMenuHelpersRuntime();
    const called: number[] = [];

    DisplayMessageAndContinueTask(runtime, 2, 4, 0x64, 14, 1, 3, 'HELLO', (taskId) => {
      called.push(taskId);
      runtime.tasks[taskId].func = 'NextTask';
    });

    expect(runtime.messageWindowId).toBe(4);
    expect(runtime.logs.dialogFrames).toEqual([{ windowId: 4, copy: true, tileNum: 0x64, paletteNum: 14 }]);
    expect(runtime.logs.textPrinters).toEqual([{ windowId: 4, fontId: 1, text: 'HELLO', textSpeed: 3 }]);
    expect(runtime.textFlags.canABSpeedUpPrint).toBe(1);
    expect(runtime.tasks[2].func).toBe('Task_ContinueTaskAfterMessagePrints');

    runtime.textPrinterActive[4] = true;
    expect(RunTextPrinters_CheckActive(runtime, 4)).toBe(true);
    Task_ContinueTaskAfterMessagePrints(runtime, 2);
    expect(called).toEqual([]);
    runtime.textPrinterActive[4] = false;
    Task_ContinueTaskAfterMessagePrints(runtime, 2);
    expect(called).toEqual([2]);
    expect(runtime.tasks[2].func).toBe('NextTask');

    CreateYesNoMenuWithCallbacks(runtime, 3, { width: 6 }, 0, 0, 2, 0x64, 14, {
      yesFunc: 'YesTask',
      noFunc: 'NoTask'
    });
    expect(runtime.tasks[3].func).toBe('Task_CallYesOrNoCallback');
    runtime.menuInput = 0;
    Task_CallYesOrNoCallback(runtime, 3);
    expect(runtime.tasks[3].func).toBe('YesTask');
    runtime.menuInput = MENU_B_PRESSED;
    Task_CallYesOrNoCallback(runtime, 3);
    expect(runtime.tasks[3].func).toBe('NoTask');
    expect(runtime.logs.se).toEqual([SE_SELECT, SE_SELECT]);
  });

  test('exact C-name input, link, item, reset, quantity, and font helpers match C branches', () => {
    const runtime = createMenuHelpersRuntime();

    runtime.optionsButtonMode = 'lr';
    runtime.inputNew.l = true;
    expect(GetLRKeysPressed(runtime)).toBe(MENU_L_PRESSED);
    runtime.inputNew = { r: true };
    expect(GetLRKeysPressed(runtime)).toBe(MENU_R_PRESSED);
    runtime.inputRepeat = { l: true };
    expect(GetLRKeysPressedAndHeld(runtime)).toBe(MENU_L_PRESSED);
    runtime.optionsButtonMode = 'normal';
    expect(GetLRKeysPressed(runtime)).toBe(0);

    runtime.location = { mapGroup: MAP_TRADE_CENTER, mapNum: MAP_TRADE_CENTER };
    expect(IsHoldingItemAllowed(runtime, ITEM_ENIGMA_BERRY)).toBe(false);
    runtime.location = { mapGroup: 0, mapNum: 0 };
    runtime.unionRoom = true;
    expect(IsHoldingItemAllowed(runtime, ITEM_ENIGMA_BERRY)).toBe(false);
    expect(IsHoldingItemAllowed(runtime, 1)).toBe(true);

    runtime.mailItems.add(99);
    runtime.updateLinkStateActive = true;
    expect(IsWritingMailAllowed(runtime, 99)).toBe(false);
    expect(MenuHelpers_IsLinkActive(runtime)).toBe(true);
    runtime.overworldQueueMoreThan2 = true;
    expect(IsActiveOverworldLinkBusy(runtime)).toBe(true);
    expect(MenuHelpers_ShouldWaitForLinkRecv(runtime)).toBe(true);
    runtime.overworldQueueMoreThan2 = false;
    runtime.linkRecvQueueAtOverworldMax = true;
    expect(MenuHelpers_ShouldWaitForLinkRecv(runtime)).toBe(true);

    SetVBlankHBlankCallbacksToNull(runtime);
    expect(runtime.logs.vblank).toEqual([null]);
    expect(runtime.logs.hblank).toEqual([null]);
    ResetAllBgsCoordinatesAndBgCntRegs(runtime);
    expect(runtime.logs.gpuRegs.map((entry) => entry.reg)).toEqual([
      'REG_OFFSET_DISPCNT',
      'REG_OFFSET_BG3CNT',
      'REG_OFFSET_BG2CNT',
      'REG_OFFSET_BG1CNT',
      'REG_OFFSET_BG0CNT'
    ]);
    expect(runtime.logs.bgChanges).toHaveLength(8);
    ResetVramOamAndBgCntRegs(runtime);
    expect(runtime.logs.memoryClears).toEqual(['VRAM:u16', 'OAM:u32', 'PLTT:u16']);

    const quantity = { value: 25 };
    runtime.inputRepeat = { up: true };
    expect(AdjustQuantityAccordingToDPadInput(runtime, quantity, 25)).toBe(true);
    expect(quantity.value).toBe(1);
    runtime.inputRepeat = { right: true };
    expect(AdjustQuantityAccordingToDPadInput(runtime, quantity, 25)).toBe(true);
    expect(quantity.value).toBe(11);
    runtime.inputRepeat = { right: true };
    quantity.value = 25;
    expect(AdjustQuantityAccordingToDPadInput(runtime, quantity, 25)).toBe(false);

    runtime.contextNpcTextColor = NPC_TEXT_COLOR_MALE;
    expect(GetDialogBoxFontId(runtime)).toBe(FONT_MALE);
    runtime.contextNpcTextColor = 'female';
    expect(GetDialogBoxFontId(runtime)).toBe(FONT_FEMALE);
  });
});
