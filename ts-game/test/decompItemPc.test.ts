import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { A_BUTTON, B_BUTTON, DPAD_UP } from '../src/game/decompMenu';
import {
  AddPCItem,
  GetBagItemQuantity,
  GetPcItemQuantity,
  ITEM_POKE_BALL,
  ITEM_POTION,
  SetPcItemQuantity,
  createItemRuntime
} from '../src/game/decompItem';
import {
  ItemPc_BuildListMenuTemplate,
  ItemPc_CountPcItems,
  ItemPc_DoGfxSetup,
  ItemPc_DoWithdraw,
  ItemPc_Init,
  ItemPc_MainCB,
  ItemPc_VBlankCB,
  ItemPc_InsertItemIntoNewSlot,
  ItemPc_MoveItemModeInit,
  ItemPc_SetCursorPosition,
  ItemPc_SetScrollPosition,
  MoveItemSlotInList,
  Task_ItemPcGive,
  createItemPcRuntime,
  sBgTemplates,
  sItemPcSubmenuOptions,
  sSubwindowTemplates,
  sTextColors,
  sWindowTemplates,
  tickItemPcTask,
  unused_ItemPc_AddTextPrinterParameterized
} from '../src/game/decompItemPc';

const repoRoot = resolve(__dirname, '../..');
const itemPcC = readFileSync(resolve(repoRoot, 'src/item_pc.c'), 'utf8');

describe('decomp item_pc', () => {
  test('parses static templates and submenu actions from item_pc.c shape', () => {
    expect(sBgTemplates).toEqual([
      { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, priority: 0 },
      { bg: 1, charBaseIndex: 3, mapBaseIndex: 30, priority: 1 }
    ]);
    expect(sWindowTemplates).toHaveLength(6);
    expect(sWindowTemplates[0]).toEqual({ bg: 0, tilemapLeft: 7, tilemapTop: 1, width: 19, height: 12, paletteNum: 15, baseBlock: 0x02bf });
    expect(sSubwindowTemplates).toEqual([
      { bg: 0, tilemapLeft: 6, tilemapTop: 15, width: 14, height: 4, paletteNum: 12, baseBlock: 0x0137 },
      { bg: 0, tilemapLeft: 6, tilemapTop: 15, width: 16, height: 4, paletteNum: 12, baseBlock: 0x0137 },
      { bg: 0, tilemapLeft: 6, tilemapTop: 15, width: 23, height: 4, paletteNum: 12, baseBlock: 0x009b }
    ]);
    expect(sItemPcSubmenuOptions.map((option) => option.text)).toEqual(['gText_Withdraw', 'gOtherText_Give', 'gFameCheckerText_Cancel']);
    expect(sTextColors).toHaveLength((itemPcC.match(/\{TEXT_COLOR_TRANSPARENT/g) ?? []).length);
  });

  test('initializes and runs the setup state machine in the same order as C', () => {
    const itemRuntime = createItemRuntime();
    AddPCItem(itemRuntime, ITEM_POTION, 3);
    const runtime = createItemPcRuntime(itemRuntime);

    ItemPc_Init(runtime, 0, 'CB2_ReturnToField');
    expect(runtime.mainCallback2).toBe('ItemPc_RunSetup');
    runtime.pcScreenEffectTurnOnRunning = false;
    ItemPc_Init(runtime, 2, 'OtherCallback');
    expect(runtime.mainCallback2).toBe('OtherCallback');

    ItemPc_Init(runtime, 0, 'CB2_ReturnToField');
    runtime.pcScreenEffectTurnOnRunning = false;
    for (let guard = 0; guard < 40 && runtime.mainCallback2 !== 'ItemPc_MainCB'; guard += 1) {
      runtime.pcScreenEffectTurnOnRunning = false;
      const done = runtime.gMainState > 20;
      if (!done) {
        runtime.operations.push(`setup-state:${runtime.gMainState}`);
      }
      tickSetup(runtime);
    }

    expect(runtime.sStateDataPtr?.nItems).toBe(1);
    expect(runtime.sStateDataPtr?.maxShowed).toBe(2);
    expect(runtime.gMultiuseListMenuTemplate.totalItems).toBe(2);
    expect(runtime.tasks[0].func).toBe('Task_ItemPcMain');
    expect(runtime.vblankCallback).toBe('ItemPc_VBlankCB');
    expect(runtime.mainCallback2).toBe('ItemPc_MainCB');
    expect(runtime.operations).toContain('SetHelpContext:HELPCONTEXT_PLAYERS_PC_ITEMS');

    runtime.operations = [];
    ItemPc_MainCB(runtime);
    expect(runtime.operations).toEqual(['RunTasks', 'AnimateSprites', 'BuildOamBuffer', 'DoScheduledBgTilemapCopiesToVram', 'UpdatePaletteFade']);
    runtime.operations = [];
    ItemPc_VBlankCB(runtime);
    expect(runtime.operations).toEqual(['LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer']);
    unused_ItemPc_AddTextPrinterParameterized(runtime, 3, 'abc', 4, 5, 1, 2, 7);
    expect(runtime.operations.at(-1)).toBe('AddTextPrinter:3:FONT_NORMAL_COPY_2:4:5:4:5:2:0:3:1:base:2:base:7:abc');
  });

  test('counts, clamps cursor, scrolls rows, and builds the list menu template like item_pc.c', () => {
    const itemRuntime = createItemRuntime();
    AddPCItem(itemRuntime, ITEM_POTION, 2);
    AddPCItem(itemRuntime, ITEM_POKE_BALL, 5);
    itemRuntime.gSaveBlock1Ptr.pcItems[5].itemId = ITEM_POTION;
    SetPcItemQuantity(itemRuntime, itemRuntime.gSaveBlock1Ptr.pcItems[5], 1);
    const runtime = createItemPcRuntime(itemRuntime);
    ItemPc_Init(runtime, 0, 'CB2');

    ItemPc_CountPcItems(runtime);
    expect(runtime.itemRuntime.gSaveBlock1Ptr.pcItems.slice(0, 3).map((slot) => slot.itemId)).toEqual([ITEM_POTION, ITEM_POKE_BALL, ITEM_POTION]);
    expect(runtime.sStateDataPtr?.nItems).toBe(3);
    expect(runtime.sStateDataPtr?.maxShowed).toBe(4);

    runtime.sListMenuState.scroll = 3;
    runtime.sListMenuState.row = 9;
    ItemPc_SetCursorPosition(runtime);
    expect(runtime.sListMenuState.row).toBe(3);

    runtime.sListMenuState.row = 5;
    ItemPc_SetScrollPosition(runtime);
    expect(runtime.sListMenuState.row).toBe(5);

    ItemPc_BuildListMenuTemplate(runtime);
    expect(runtime.gMultiuseListMenuTemplate).toMatchObject({
      totalItems: 4,
      windowId: 0,
      item_X: 9,
      cursor_X: 1,
      maxShowed: 4,
      cursorKind: 0
    });
    expect(runtime.gMultiuseListMenuTemplate.items.at(-1)).toEqual({ label: 'gFameCheckerText_Cancel', index: -2 });
  });

  test('moves item slots with the exact insert-before semantics from MoveItemSlotInList', () => {
    const slots = [
      { itemId: 1, quantity: 1 },
      { itemId: 2, quantity: 2 },
      { itemId: 3, quantity: 3 },
      { itemId: 4, quantity: 4 }
    ];
    MoveItemSlotInList(slots, 0, 3);
    expect(slots.map((slot) => slot.itemId)).toEqual([2, 3, 1, 4]);
    MoveItemSlotInList(slots, 3, 1);
    expect(slots.map((slot) => slot.itemId)).toEqual([2, 4, 3, 1]);

    const itemRuntime = createItemRuntime();
    AddPCItem(itemRuntime, ITEM_POTION, 1);
    AddPCItem(itemRuntime, ITEM_POKE_BALL, 1);
    const runtime = createItemPcRuntime(itemRuntime);
    ItemPc_Init(runtime, 0, 'CB2');
    ItemPc_CountPcItems(runtime);
    ItemPc_BuildListMenuTemplate(runtime);
    runtime.tasks.push({ id: 0, func: 'Task_ItemPcMain', data: [7, 0, 0], destroyed: false });
    ItemPc_MoveItemModeInit(runtime, 0, 0);
    expect(runtime.sStateDataPtr?.moveModeOrigPos).toBe(0);
    ItemPc_InsertItemIntoNewSlot(runtime, 0, 2);
    expect(runtime.itemRuntime.gSaveBlock1Ptr.pcItems.slice(0, 2).map((slot) => slot.itemId)).toEqual([ITEM_POKE_BALL, ITEM_POTION]);
    expect(runtime.tasks[0].func).toBe('Task_ItemPcMain');
    expect(runtime.sStateDataPtr?.moveModeOrigPos).toBe(0);
  });

  test('withdraws multiple items through submenu, quantity, success message, and cleanup states', () => {
    const itemRuntime = createItemRuntime();
    AddPCItem(itemRuntime, ITEM_POTION, 3);
    const runtime = createReadyRuntime(itemRuntime);

    runtime.nextListInput = 0;
    tickItemPcTask(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_ItemPcSubmenuInit');
    tickItemPcTask(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_ItemPcSubmenuRun');

    runtime.newKeys = A_BUTTON;
    tickItemPcTask(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_ItemPcHandleWithdrawMultiple');
    expect(runtime.tasks[0].data[8]).toBe(1);

    runtime.newKeys = DPAD_UP;
    tickItemPcTask(runtime, 0);
    expect(runtime.tasks[0].data[8]).toBe(2);

    runtime.newKeys = A_BUTTON;
    tickItemPcTask(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_ItemPcWaitButtonAndFinishWithdrawMultiple');
    expect(GetBagItemQuantity(itemRuntime, itemRuntime.gSaveBlock1Ptr.bagPocket_Items[0])).toBe(2);
    expect(GetPcItemQuantity(itemRuntime, itemRuntime.gSaveBlock1Ptr.pcItems[0])).toBe(3);

    tickItemPcTask(runtime, 0);
    expect(GetPcItemQuantity(itemRuntime, itemRuntime.gSaveBlock1Ptr.pcItems[0])).toBe(1);
    expect(runtime.tasks[0].func).toBe('Task_ItemPcMain');
  });

  test('handles cancel/no-party give/no-room withdraw branches without removing PC items', () => {
    const itemRuntime = createItemRuntime();
    AddPCItem(itemRuntime, ITEM_POTION, 1);
    const runtime = createReadyRuntime(itemRuntime);
    runtime.tasks[0].data[1] = 0;

    Task_ItemPcGive(runtime, 0);
    expect(runtime.tasks[0].func).toBe('gTask_ItemPcWaitButtonAndExitSubmenu');
    expect(runtime.operations).toContain('DisplayMessageAndContinueTask:0:5:0x3AC:0x0B:2:GetTextSpeedSetting:gText_ThereIsNoPokemon:gTask_ItemPcWaitButtonAndExitSubmenu');
    runtime.newKeys = A_BUTTON;
    tickItemPcTask(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_ItemPcMain');

    const fullBagRuntime = createItemRuntime();
    AddPCItem(fullBagRuntime, ITEM_POTION, 1);
    for (let i = 0; i < fullBagRuntime.gSaveBlock1Ptr.bagPocket_Items.length; i += 1) {
      fullBagRuntime.gSaveBlock1Ptr.bagPocket_Items[i].itemId = ITEM_POKE_BALL;
      SetPcItemQuantity(fullBagRuntime, fullBagRuntime.gSaveBlock1Ptr.bagPocket_Items[i], 1);
    }
    const full = createReadyRuntime(fullBagRuntime);
    full.tasks[0].data[1] = 0;
    full.tasks[0].data[8] = 1;
    full.operations.length = 0;
    tickDirectWithdraw(full);
    expect(full.tasks[0].func).toBe('Task_ItemPcWaitButtonWithdrawMultipleFailed');
    expect(GetPcItemQuantity(fullBagRuntime, fullBagRuntime.gSaveBlock1Ptr.pcItems[0])).toBe(1);
    expect(full.operations.some((op) => op.includes('gText_NoMoreRoomInBag'))).toBe(true);

    full.newKeys = B_BUTTON;
    tickItemPcTask(full, 0);
    expect(full.tasks[0].func).toBe('Task_ItemPcMain');
    expect(GetPcItemQuantity(fullBagRuntime, fullBagRuntime.gSaveBlock1Ptr.pcItems[0])).toBe(1);
  });
});

function tickSetup(runtime: ReturnType<typeof createItemPcRuntime>): void {
  const before = runtime.gMainState;
  ItemPc_DoGfxSetup(runtime);
  if (runtime.gMainState === before && runtime.gMainState === 20) {
    runtime.overworldLinkBusy = false;
  }
}

function createReadyRuntime(itemRuntime: ReturnType<typeof createItemRuntime>): ReturnType<typeof createItemPcRuntime> {
  const runtime = createItemPcRuntime(itemRuntime);
  ItemPc_Init(runtime, 0, 'CB2');
  ItemPc_CountPcItems(runtime);
  ItemPc_BuildListMenuTemplate(runtime);
  runtime.tasks.push({ id: 0, func: 'Task_ItemPcMain', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], destroyed: false });
  return runtime;
}

function tickDirectWithdraw(runtime: ReturnType<typeof createItemPcRuntime>): void {
  ItemPc_DoWithdraw(runtime, 0);
}
