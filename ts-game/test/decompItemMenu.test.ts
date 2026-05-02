import { describe, expect, test } from 'vitest';
import {
  BackUpPlayerBag,
  Bag_BuildListMenuTemplate,
  BagIsTutorial,
  CreateArrowPair_QuantitySelect,
  GetSelectedItemIndex,
  GoToBagMenu,
  ITEMMENULOCATION_FIELD,
  ITEMMENULOCATION_ITEMPC,
  ITEMMENULOCATION_OLD_MAN,
  ITEMMENULOCATION_SHOP,
  ITEMMENUACTION_CANCEL,
  ITEMMENUACTION_DESELECT,
  ITEMMENUACTION_OPEN,
  ITEMMENUACTION_REGISTER,
  ITEMMENUACTION_WALK,
  ITEM_BERRY_POUCH,
  ITEM_BICYCLE,
  ITEM_NONE,
  ITEM_POKE_BALL,
  ITEM_POTION,
  ITEM_TEACHY_TV,
  ITEM_TM_CASE,
  MoveItemSlotInList,
  OpenContextMenu,
  OPEN_BAG_ITEMS,
  OPEN_BAG_KEYITEMS,
  PLAYER_AVATAR_FLAG_MACH_BIKE,
  PocketCalculateInitialCursorPosAndItemsAbove,
  Pocket_CalculateNItemsAndMaxShowed,
  RestorePlayerBag,
  Task_FinalizeSaleToShop,
  Task_ItemContext_Sell,
  Task_ItemMenuAction_ToggleSelect,
  Task_SelectQuantityToSell,
  Task_TryDoItemDeposit,
  UseRegisteredKeyItemOnField,
  createItemMenuRuntime,
  defineItem
} from '../src/game/decompItemMenu';

const setupBag = () => {
  const runtime = createItemMenuRuntime();
  defineItem(runtime, ITEM_POTION, { name: 'POTION', description: 'Heals 20 HP', price: 300 });
  defineItem(runtime, ITEM_POKE_BALL, { name: 'POKE BALL', battleUsage: true, price: 200 });
  defineItem(runtime, ITEM_TM_CASE, { name: 'TM CASE', importance: 1 });
  defineItem(runtime, ITEM_BERRY_POUCH, { name: 'BERRY POUCH', importance: 1 });
  defineItem(runtime, ITEM_BICYCLE, { name: 'BICYCLE', importance: 1 });
  defineItem(runtime, ITEM_TEACHY_TV, { name: 'TEACHY TV', importance: 1 });
  GoToBagMenu(ITEMMENULOCATION_FIELD, OPEN_BAG_ITEMS, 'ExitCB', runtime);
  return runtime;
};

describe('decompItemMenu', () => {
  test('MoveItemSlotInList preserves the C insertion semantics', () => {
    const slots = [
      { itemId: 1, quantity: 1 },
      { itemId: 2, quantity: 1 },
      { itemId: 3, quantity: 1 },
      { itemId: 4, quantity: 1 }
    ];

    MoveItemSlotInList(slots, 0, 3);
    expect(slots.map((s) => s.itemId)).toEqual([2, 3, 1, 4]);

    MoveItemSlotInList(slots, 2, 0);
    expect(slots.map((s) => s.itemId)).toEqual([1, 2, 3, 4]);
  });

  test('pocket counts, max showed, and cursor correction match the bag list rules', () => {
    const runtime = setupBag();
    runtime.gSaveBlock1Ptr.bagPocket_Items[0] = { itemId: ITEM_POTION, quantity: 2 };
    runtime.gSaveBlock1Ptr.bagPocket_Items[1] = { itemId: ITEM_NONE, quantity: 0 };
    runtime.gSaveBlock1Ptr.bagPocket_Items[2] = { itemId: ITEM_TEACHY_TV, quantity: 1 };

    Pocket_CalculateNItemsAndMaxShowed(OPEN_BAG_ITEMS, runtime);
    expect(runtime.sBagMenuDisplay?.nItems[OPEN_BAG_ITEMS]).toBe(2);
    expect(runtime.sBagMenuDisplay?.maxShowed[OPEN_BAG_ITEMS]).toBe(3);
    expect(runtime.gSaveBlock1Ptr.bagPocket_Items.slice(0, 2).map((s) => s.itemId)).toEqual([ITEM_POTION, ITEM_TEACHY_TV]);

    runtime.gBagMenuState.cursorPos[OPEN_BAG_ITEMS] = 5;
    PocketCalculateInitialCursorPosAndItemsAbove(OPEN_BAG_ITEMS, runtime);
    expect(GetSelectedItemIndex(OPEN_BAG_ITEMS, runtime)).toBe(0);

    Bag_BuildListMenuTemplate(OPEN_BAG_ITEMS, runtime);
    expect(runtime.gMultiuseListMenuTemplate.totalItems).toBe(3);
    expect(runtime.sListMenuItems?.map((i) => i.label)).toEqual(['regular:POTION', 'regular:TEACHY TV', 'regular:CANCEL']);
  });

  test('GoToBagMenu initializes location-specific display state like C', () => {
    const runtime = createItemMenuRuntime();
    GoToBagMenu(ITEMMENULOCATION_ITEMPC, OPEN_BAG_KEYITEMS, 'PcExit', runtime);
    expect(runtime.gBagMenuState.location).toBe(ITEMMENULOCATION_ITEMPC);
    expect(runtime.gBagMenuState.pocket).toBe(OPEN_BAG_KEYITEMS);
    expect(runtime.sBagMenuDisplay?.pocketSwitchMode).toBe(1);
    expect(runtime.gSpecialVar_ItemId).toBe(ITEM_NONE);

    GoToBagMenu(ITEMMENULOCATION_OLD_MAN, OPEN_BAG_ITEMS, 'OldManExit', runtime);
    expect(runtime.sBagMenuDisplay?.pocketSwitchMode).toBe(2);
    expect(BagIsTutorial(runtime)).toBe(true);
  });

  test('key-item context menu chooses open/use/register/deselect entries exactly', () => {
    const runtime = setupBag();
    runtime.gBagMenuState.pocket = OPEN_BAG_KEYITEMS;
    runtime.gSpecialVar_ItemId = ITEM_TM_CASE;
    const taskId = 0;
    runtime.gTasks[taskId] = { func: null, followupFunc: null, data: Array.from({ length: 16 }, () => 0), destroyed: false };

    OpenContextMenu(taskId, runtime);
    expect(runtime.sContextMenuItemsPtr.slice(0, runtime.sContextMenuNumItems)).toEqual([ITEMMENUACTION_OPEN, ITEMMENUACTION_REGISTER, ITEMMENUACTION_CANCEL]);

    runtime.gSpecialVar_ItemId = ITEM_BICYCLE;
    runtime.gSaveBlock1Ptr.registeredItem = ITEM_BICYCLE;
    runtime.playerAvatarFlags = PLAYER_AVATAR_FLAG_MACH_BIKE;
    OpenContextMenu(taskId, runtime);
    expect(runtime.sContextMenuItemsPtr.slice(0, runtime.sContextMenuNumItems)).toEqual([ITEMMENUACTION_WALK, ITEMMENUACTION_DESELECT, ITEMMENUACTION_CANCEL]);
  });

  test('toggle select mirrors registered item assignment and clearing', () => {
    const runtime = setupBag();
    runtime.gBagMenuState.pocket = OPEN_BAG_KEYITEMS;
    runtime.gSaveBlock1Ptr.bagPocket_KeyItems[0] = { itemId: ITEM_TEACHY_TV, quantity: 1 };
    runtime.gTasks[0] = { func: null, followupFunc: null, data: Array.from({ length: 16 }, () => 0), destroyed: false };
    runtime.gTasks[0].data[1] = 0;

    Task_ItemMenuAction_ToggleSelect(0, runtime);
    expect(runtime.gSaveBlock1Ptr.registeredItem).toBe(ITEM_TEACHY_TV);

    Task_ItemMenuAction_ToggleSelect(0, runtime);
    expect(runtime.gSaveBlock1Ptr.registeredItem).toBe(ITEM_NONE);
  });

  test('sell quantity and finalize apply half-price money and item removal', () => {
    const runtime = setupBag();
    runtime.gBagMenuState.location = ITEMMENULOCATION_SHOP;
    runtime.gSaveBlock1Ptr.bagPocket_Items[0] = { itemId: ITEM_POTION, quantity: 5 };
    runtime.gSpecialVar_ItemId = ITEM_POTION;
    runtime.gTasks[0] = { func: null, followupFunc: null, data: Array.from({ length: 16 }, () => 0), destroyed: false };
    runtime.gTasks[0].data[1] = 0;
    runtime.gTasks[0].data[2] = 5;

    Task_ItemContext_Sell(0, runtime);
    expect(runtime.gTasks[0].func).toBe('Task_InitSaleQuantitySelectInterface');

    runtime.gTasks[0].data[8] = 1;
    runtime.input.quantityDelta = 2;
    Task_SelectQuantityToSell(0, runtime);
    expect(runtime.gTasks[0].data[8]).toBe(3);
    expect(runtime.operations).toContain('UpdateSalePriceDisplay:450');

    Task_FinalizeSaleToShop(0, runtime);
    expect(runtime.gSaveBlock1Ptr.money).toBe(450);
    expect(runtime.gSaveBlock1Ptr.bagPocket_Items[0]).toEqual({ itemId: ITEM_POTION, quantity: 2 });
  });

  test('deposit handles PC capacity and registered key item use follows field rules', () => {
    const runtime = setupBag();
    runtime.gSpecialVar_ItemId = ITEM_POTION;
    runtime.gTasks[0] = { func: null, followupFunc: null, data: Array.from({ length: 16 }, () => 0), destroyed: false };
    runtime.gTasks[0].data[8] = 2;

    runtime.pcCanStoreItems = false;
    Task_TryDoItemDeposit(0, runtime);
    expect(runtime.gTasks[0].func).toBe('Task_WaitAButtonAndCloseContextMenu');

    runtime.gSaveBlock1Ptr.bagPocket_KeyItems[0] = { itemId: ITEM_TEACHY_TV, quantity: 1 };
    runtime.gSaveBlock1Ptr.registeredItem = ITEM_TEACHY_TV;
    expect(UseRegisteredKeyItemOnField(runtime)).toBe(true);
    expect(runtime.gSpecialVar_ItemId).toBe(ITEM_TEACHY_TV);

    runtime.inUnionRoom = true;
    expect(UseRegisteredKeyItemOnField(runtime)).toBe(false);
  });

  test('tutorial bag backup and restore round-trips all bag state', () => {
    const runtime = setupBag();
    runtime.gSaveBlock1Ptr.bagPocket_Items[0] = { itemId: ITEM_POTION, quantity: 3 };
    runtime.gSaveBlock1Ptr.registeredItem = ITEM_TEACHY_TV;
    runtime.gBagMenuState.cursorPos = [1, 2, 3];
    runtime.gBagMenuState.itemsAbove = [4, 5, 6];
    runtime.gBagMenuState.pocket = OPEN_BAG_KEYITEMS;

    BackUpPlayerBag(runtime);
    expect(runtime.gSaveBlock1Ptr.bagPocket_Items[0].itemId).toBe(ITEM_NONE);
    expect(runtime.gSaveBlock1Ptr.registeredItem).toBe(ITEM_NONE);

    RestorePlayerBag(runtime);
    expect(runtime.gSaveBlock1Ptr.bagPocket_Items[0]).toEqual({ itemId: ITEM_POTION, quantity: 3 });
    expect(runtime.gSaveBlock1Ptr.registeredItem).toBe(ITEM_TEACHY_TV);
    expect(runtime.gBagMenuState.cursorPos).toEqual([1, 2, 3]);
    expect(runtime.gBagMenuState.itemsAbove).toEqual([4, 5, 6]);
    expect(runtime.gBagMenuState.pocket).toBe(OPEN_BAG_KEYITEMS);

    CreateArrowPair_QuantitySelect(runtime);
    expect(runtime.sBagMenuDisplay?.contextMenuSelectedItem).toBe(1);
  });
});
