import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { A_BUTTON, B_BUTTON, DPAD_UP, MENU_B_PRESSED } from '../src/game/decompMenu';
import {
  AddBagItem,
  GetBagItemQuantity,
  ITEM_POKE_BALL,
  ITEM_POTION,
  SetBagItemQuantity,
  createItemRuntime
} from '../src/game/decompItem';
import { getMoney, setMoney, type DecompMoneyState } from '../src/game/decompMoney';
import {
  BuyMenuBuildListMenuTemplate,
  BuyMenuCollectObjectEventData,
  BuyMenuCopyTilemapData,
  BuyMenuDrawMapMetatile,
  BuyMenuPrintItemDescriptionAndShowItemIcon,
  BuyMenuPrintPriceInList,
  CB2_BuyMenu,
  CB2_InitBuyMenu,
  CreateDecorationShop1Menu,
  CreatePokemartMenu,
  CreateShopMenu,
  GetMartTypeFromItemList,
  LIST_CANCEL,
  MART_TYPE_DECOR,
  MART_TYPE_REGULAR,
  MART_TYPE_TMHM,
  QL_EVENT_BOUGHT_ITEM,
  QL_EVENT_SOLD_ITEM,
  DebugFunc_PrintPurchaseDetails,
  DebugFunc_PrintShopMenuHistoryBeforeClearMaybe,
  RecordItemTransaction,
  RecordTransactionForQuestLog,
  SetShopItemsForSale,
  Task_HandleShopMenuQuit,
  Task_ShopMenu,
  VBlankCB_BuyMenu,
  createShopRuntime,
  sShopBuyMenuBgTemplates,
  sShopMenuActions_BuySellQuit,
  sShopMenuWindowTemplate,
  tickShopTask
} from '../src/game/decompShop';

const repoRoot = resolve(__dirname, '../..');
const shopC = readFileSync(resolve(repoRoot, 'src/shop.c'), 'utf8');
const ITEM_TM05 = 293;

describe('decomp shop', () => {
  test('parses static shop menu and buy-menu templates from shop.c', () => {
    expect(sShopMenuActions_BuySellQuit.map((action) => action.text)).toEqual(['gText_ShopBuy', 'gText_ShopSell', 'gText_ShopQuit']);
    expect(sShopMenuWindowTemplate).toEqual({ bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 12, height: 6, paletteNum: 15, baseBlock: 8 });
    expect(sShopBuyMenuBgTemplates).toHaveLength((shopC.match(/\.baseTile = 0/g) ?? []).length);
    expect(sShopBuyMenuBgTemplates[3]).toMatchObject({ bg: 3, charBaseIndex: 0, mapBaseIndex: 28, priority: 3 });
  });

  test('sets shop items, detects TM marts, creates menu, and dispatches buy/sell/quit like C', () => {
    const runtime = makeRuntime();
    SetShopItemsForSale(runtime, [ITEM_POTION, ITEM_POKE_BALL, 0, ITEM_TM05]);
    expect(runtime.sShopData.itemCount).toBe(2);
    expect(GetMartTypeFromItemList(runtime, MART_TYPE_REGULAR)).toBe(MART_TYPE_REGULAR);

    SetShopItemsForSale(runtime, [ITEM_TM05, ITEM_POTION, 0]);
    expect(GetMartTypeFromItemList(runtime, MART_TYPE_REGULAR)).toBe(MART_TYPE_TMHM);
    const taskId = CreateShopMenu(runtime, MART_TYPE_REGULAR);
    expect(taskId).toBe(0);
    expect(runtime.sShopData.martType).toBe(MART_TYPE_TMHM);
    expect(runtime.tasks[0].func).toBe('Task_ShopMenu');
    expect(runtime.operations).toContain('PrintTextArray:0:FONT_NORMAL:8:2:16:3:sShopMenuActions_BuySellQuit');

    runtime.menuCursorPos = 0;
    runtime.nextMenuInput = 0;
    Task_ShopMenu(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_GoToBuyOrSellMenu');
    expect(runtime.tasks[0].wordArgs[0xe]).toBe('CB2_InitBuyMenu');

    runtime.gPaletteFadeActive = false;
    tickShopTask(runtime, 0);
    expect(runtime.mainCallback2).toBe('CB2_InitBuyMenu');
    expect(runtime.tasks[0].destroyed).toBe(true);

    const quit = makeRuntime();
    SetShopItemsForSale(quit, [ITEM_POTION, 0]);
    CreateShopMenu(quit, MART_TYPE_REGULAR);
    quit.nextMenuInput = MENU_B_PRESSED;
    Task_ShopMenu(quit, 0);
    expect(quit.tasks[0].destroyed).toBe(true);
    expect(quit.operations).toContain('ClearStdWindowAndFrameToTransparent:0:2');
  });

  test('builds buy list menu template and prints description/icon/price branches', () => {
    const runtime = makeRuntime();
    SetShopItemsForSale(runtime, [ITEM_POTION, ITEM_POKE_BALL, 0]);
    runtime.sShopData.martType = MART_TYPE_REGULAR;
    expect(BuyMenuBuildListMenuTemplate(runtime)).toBe(true);
    expect(runtime.gMultiuseListMenuTemplate).toMatchObject({
      totalItems: 3,
      windowId: 4,
      item_X: 9,
      cursor_X: 1,
      maxShowed: 3
    });
    expect(runtime.gMultiuseListMenuTemplate.items.at(-1)).toEqual({ label: 'gFameCheckerText_Cancel', index: LIST_CANCEL });

    BuyMenuPrintItemDescriptionAndShowItemIcon(runtime, ITEM_POTION, false);
    expect(runtime.operations).toContain('PlaySE:SE_SELECT');
    expect(runtime.operations).toContain('DestroyItemMenuIcon:1');
    expect(runtime.sShopData.itemSlot).toBe(1);
    BuyMenuPrintPriceInList(runtime, 4, ITEM_POTION, 18);
    expect(runtime.operations.some((op) => op.startsWith('BuyMenuPrint:4:0:Pokedollar:'))).toBe(true);

    const tmRuntime = makeRuntime();
    tmRuntime.sShopData.martType = MART_TYPE_TMHM;
    BuyMenuPrintItemDescriptionAndShowItemIcon(tmRuntime, LIST_CANCEL, true);
    expect(tmRuntime.operations).toContain('FillWindowPixelBuffer:6:PIXEL_FILL(0)');
    expect(tmRuntime.operations).toContain('BuyMenuPrint:6:0:gText_ThreeHyphens:0:0:0:0:255:1');
    expect(tmRuntime.operations).toContain('BuyMenuPrint:6:2:gText_SevenHyphens:0:16:0:0:0:1');
  });

  test('runs buy menu init, quantity selection, purchase, money subtraction, and return to list', () => {
    const runtime = makeRuntime();
    SetShopItemsForSale(runtime, [ITEM_POKE_BALL, 0]);
    runtime.sShopData.martType = MART_TYPE_REGULAR;
    setMoney(runtime.moneyState, 1000);

    CB2_InitBuyMenu(runtime);
    expect(runtime.gMainState).toBe(1);
    expect(runtime.gShopTilemapBuffer1).toHaveLength(0x400);
    CB2_InitBuyMenu(runtime);
    CB2_InitBuyMenu(runtime);
    expect(runtime.mainCallback2).toBe('CB2_BuyMenu');
    const taskId = 0;
    expect(runtime.tasks[taskId].func).toBe('Task_BuyMenu');

    runtime.nextListInput = ITEM_POKE_BALL;
    tickShopTask(runtime, taskId);
    expect(runtime.sShopData.itemPrice).toBe(200);
    expect(runtime.tasks[taskId].func).toBe('Task_BuyHowManyDialogueInit');

    tickShopTask(runtime, taskId);
    expect(runtime.tasks[taskId].data[1]).toBe(1);
    expect(runtime.sShopData.maxQuantity).toBe(5);
    expect(runtime.tasks[taskId].func).toBe('Task_BuyHowManyDialogueHandleInput');

    runtime.newKeys = DPAD_UP;
    tickShopTask(runtime, taskId);
    expect(runtime.tasks[taskId].data[1]).toBe(2);
    expect(runtime.sShopData.itemPrice).toBe(400);

    runtime.newKeys = A_BUTTON;
    tickShopTask(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('CreateBuyMenuConfirmPurchaseWindow');

    tickShopTask(runtime, taskId);
    runtime.tasks[taskId].func = 'BuyMenuTryMakePurchase';
    tickShopTask(runtime, taskId);
    expect(GetBagItemQuantity(runtime.itemRuntime, runtime.itemRuntime.gSaveBlock1Ptr.bagPocket_PokeBalls[0])).toBe(2);
    expect(runtime.sHistory[0]).toMatchObject({ logEventId: 1, lastItemId: ITEM_POKE_BALL, itemQuantity: 2, totalMoney: 400 });
    expect(runtime.tasks[taskId].func).toBe('BuyMenuSubtractMoney');

    tickShopTask(runtime, taskId);
    expect(getMoney(runtime.moneyState)).toBe(600);
    expect(runtime.tasks[taskId].func).toBe('Task_ReturnToItemListAfterItemPurchase');

    runtime.newKeys = B_BUTTON;
    tickShopTask(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_BuyMenu');
  });

  test('handles not-enough-money, no-room, and exit branches without side effects', () => {
    const runtime = makeRuntime();
    SetShopItemsForSale(runtime, [ITEM_POKE_BALL, 0]);
    runtime.sShopData.martType = MART_TYPE_REGULAR;
    BuyMenuBuildListMenuTemplate(runtime);
    const taskId = runtime.tasks.push({ id: 0, func: 'Task_BuyMenu', data: [0, 0, 0, 0, 0, 0, 0, 7], wordArgs: {}, destroyed: false }) - 1;
    setMoney(runtime.moneyState, 100);
    runtime.nextListInput = ITEM_POKE_BALL;
    tickShopTask(runtime, taskId);
    expect(runtime.operations).toContain('BuyMenuDisplayMessage:0:gText_YouDontHaveMoney:BuyMenuReturnToItemList');

    const noRoom = makeRuntime();
    SetShopItemsForSale(noRoom, [ITEM_POTION, 0]);
    for (const slot of noRoom.itemRuntime.gSaveBlock1Ptr.bagPocket_Items) {
      slot.itemId = ITEM_POKE_BALL;
      SetBagItemQuantity(noRoom.itemRuntime, slot, 1);
    }
    noRoom.tasks.push({ id: 0, func: 'BuyMenuTryMakePurchase', data: [0, 1, 0, 0, 0, ITEM_POTION, 0, 0], wordArgs: {}, destroyed: false });
    tickShopTask(noRoom, 0);
    expect(noRoom.operations).toContain('BuyMenuDisplayMessage:0:gText_NoMoreRoomForThis:BuyMenuReturnToItemList');
    expect(noRoom.sHistory[0].logEventId).toBe(0);

    const exiting = makeRuntime();
    exiting.tasks.push({ id: 0, func: 'Task_BuyMenu', data: [0, 0, 0, 0, 0, 0, 0, 9], wordArgs: {}, destroyed: false });
    exiting.nextListInput = LIST_CANCEL;
    tickShopTask(exiting, 0);
    expect(exiting.tasks[0].func).toBe('Task_ExitBuyMenu');
    exiting.gPaletteFadeActive = false;
    tickShopTask(exiting, 0);
    expect(exiting.mainCallback2).toBe('CB2_ReturnToField');
    expect(exiting.tasks[0].destroyed).toBe(true);
  });

  test('copies map tile layers, collects visible object events, and records quest-log transaction caps', () => {
    const runtime = makeRuntime();
    runtime.gShopTilemapBuffer1 = Array.from({ length: 0x400 }, (_, i) => (i % 300 === 0 ? i : 0));
    runtime.gShopTilemapBuffer2 = Array.from({ length: 0x400 }, () => 0);
    runtime.gShopTilemapBuffer3 = Array.from({ length: 0x400 }, () => 0);
    runtime.gShopTilemapBuffer4 = Array.from({ length: 0x400 }, () => 0);
    BuyMenuCopyTilemapData(runtime);
    expect(runtime.gShopTilemapBuffer2[300]).toBe(300 + 0xb3dc);

    BuyMenuDrawMapMetatile(runtime, 1, 2, [1, 2, 3, 4, 5, 6, 7, 8], 2);
    const offset = 1 * 2 + (2 * 64 + 64);
    expect(runtime.gShopTilemapBuffer3[offset]).toBe(1);
    expect(runtime.gShopTilemapBuffer2[offset]).toBe(5);

    runtime.playerFacing = { x: 10, y: 20 };
    runtime.playerElevation = 3;
    runtime.objectEvents.push({ id: 4, x: 8, y: 18, elevation: 3, facingDirection: 'west', graphicsId: 99 });
    BuyMenuCollectObjectEventData(runtime);
    expect(runtime.viewportObjectEvents[0]).toEqual([4, 1, 0, 2]);

    RecordItemTransaction(runtime, ITEM_POKE_BALL, 800, QL_EVENT_BOUGHT_ITEM - 36);
    RecordItemTransaction(runtime, ITEM_POKE_BALL, 800, QL_EVENT_BOUGHT_ITEM - 36);
    RecordItemTransaction(runtime, ITEM_POTION, 2, QL_EVENT_SOLD_ITEM - 36);
    expect(runtime.sHistory[0]).toMatchObject({ logEventId: 1, itemQuantity: 999, hasMultipleTransactions: true });
    expect(runtime.sHistory[1]).toMatchObject({ logEventId: 2, lastItemId: ITEM_POTION });
    RecordTransactionForQuestLog(runtime);
    expect(runtime.questLogEvents.map((event) => event.eventId)).toEqual([QL_EVENT_BOUGHT_ITEM, QL_EVENT_SOLD_ITEM]);
  });

  test('public mart constructors reset history and keep decoration mart types', () => {
    const runtime = makeRuntime();
    RecordItemTransaction(runtime, ITEM_POTION, 1, 1);
    CreatePokemartMenu(runtime, [ITEM_POTION, 0]);
    expect(runtime.sShopData.callback).toBe('ScriptContext_Enable');
    expect(runtime.sShopData.martType).toBe(MART_TYPE_REGULAR);
    expect(runtime.sHistory[0].logEventId).toBe(0);
    Task_HandleShopMenuQuit(runtime, 0);
    expect(runtime.scriptContextEnabled).toBe(true);

    const decor = makeRuntime();
    CreateDecorationShop1Menu(decor, [ITEM_POTION, 0]);
    expect(decor.sShopData.martType).toBe(MART_TYPE_DECOR);
  });

  test('CB2_BuyMenu, VBlankCB_BuyMenu, and debug hooks preserve C callback behavior', () => {
    const runtime = makeRuntime();
    SetShopItemsForSale(runtime, [ITEM_POTION, 0]);
    runtime.tasks.push({ id: 0, func: 'Task_BuyMenu', data: Array.from({ length: 16 }, () => 0), wordArgs: {}, destroyed: false });
    runtime.nextListInput = LIST_CANCEL;

    CB2_BuyMenu(runtime);
    expect(runtime.tasks[0].func).toBe('Task_ExitBuyMenu');
    expect(runtime.operations.slice(-4)).toEqual(['AnimateSprites', 'BuildOamBuffer', 'UpdatePaletteFade', 'DoScheduledBgTilemapCopiesToVram']);

    VBlankCB_BuyMenu(runtime);
    expect(runtime.operations.slice(-3)).toEqual(['LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer']);

    const opCount = runtime.operations.length;
    DebugFunc_PrintPurchaseDetails(runtime, 0);
    DebugFunc_PrintShopMenuHistoryBeforeClearMaybe(runtime);
    expect(runtime.operations).toHaveLength(opCount);
  });
});

function makeRuntime() {
  const itemRuntime = createItemRuntime();
  const moneyState: DecompMoneyState = { vars: {} };
  AddBagItem(itemRuntime, ITEM_POTION, 0);
  setMoney(moneyState, 3000);
  return createShopRuntime(itemRuntime, moneyState);
}
