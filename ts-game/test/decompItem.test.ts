import { describe, expect, test } from 'vitest';
import {
  AddBagItem,
  AddPCItem,
  ApplyNewEncryptionKeyToBagItems,
  BAG_BERRIES_COUNT,
  BAG_ITEMS_COUNT,
  BAG_KEYITEMS_COUNT,
  BAG_POKEBALLS_COUNT,
  BAG_TMHM_COUNT,
  BagGetItemIdByPocketPosition,
  BagGetQuantityByItemId,
  BagGetQuantityByPocketPosition,
  BagPocketCompaction,
  CheckBagHasItem,
  CheckBagHasSpace,
  CheckPCHasItem,
  ClearBag,
  ClearPCItemSlots,
  CopyItemName,
  CountItemsInPC,
  FLAG_SYS_GOT_BERRY_POUCH,
  GetBagItemQuantity,
  GetPcItemQuantity,
  HasAtLeastOneBerry,
  ITEM_ACRO_BIKE,
  ITEM_BERRY_POUCH,
  ITEM_CHERI_BERRY,
  ITEM_ENIGMA_BERRY,
  ITEM_HM01,
  ITEM_MACH_BIKE,
  ITEM_MASTER_BALL,
  ITEM_NONE,
  ITEM_OAKS_PARCEL,
  ITEM_ORAN_BERRY,
  ITEM_POKE_BALL,
  ITEM_POTION,
  ITEM_TM_CASE,
  ITEM_TOWN_MAP,
  ItemId_GetBattleFunc,
  ItemId_GetBattleUsage,
  ItemId_GetDescription,
  ItemId_GetFieldFunc,
  ItemId_GetHoldEffect,
  ItemId_GetHoldEffectParam,
  ItemId_GetId,
  ItemId_GetImportance,
  ItemId_GetName,
  ItemId_GetPocket,
  ItemId_GetPrice,
  ItemId_GetRegistrability,
  ItemId_GetSecondaryId,
  ItemId_GetType,
  ItemPcCompaction,
  MAP_PALLET_TOWN_RIVALS_HOUSE,
  PCItemsGetFirstEmptySlot,
  POCKET_BERRY_POUCH,
  POCKET_ITEMS,
  POCKET_KEY_ITEMS,
  POCKET_POKE_BALLS,
  POCKET_TM_CASE,
  QL_EVENT_OBTAINED_STORY_ITEM,
  RegisteredItemHandleBikeSwap,
  RemoveBagItem,
  RemovePCItem,
  SanitizeItemId,
  SetBagItemQuantity,
  SetPcItemQuantity,
  SortAndCompactBagPocket,
  SortPocketAndPlaceHMsFirst,
  TrySetObtainedItemQuestLogEvent,
  createItemRuntime
} from '../src/game/decompItem';

const ITEM_TM01 = 289;
const ITEM_TM02 = 290;

describe('decomp item.c parity', () => {
  test('SetBagPocketsPointers wires save block arrays with C capacities', () => {
    const runtime = createItemRuntime();

    expect(runtime.gBagPockets[POCKET_ITEMS - 1].itemSlots).toBe(runtime.gSaveBlock1Ptr.bagPocket_Items);
    expect(runtime.gBagPockets[POCKET_KEY_ITEMS - 1].itemSlots).toBe(runtime.gSaveBlock1Ptr.bagPocket_KeyItems);
    expect(runtime.gBagPockets[POCKET_POKE_BALLS - 1].itemSlots).toBe(runtime.gSaveBlock1Ptr.bagPocket_PokeBalls);
    expect(runtime.gBagPockets[POCKET_TM_CASE - 1].itemSlots).toBe(runtime.gSaveBlock1Ptr.bagPocket_TMHM);
    expect(runtime.gBagPockets[POCKET_BERRY_POUCH - 1].itemSlots).toBe(runtime.gSaveBlock1Ptr.bagPocket_Berries);
    expect(runtime.gBagPockets.map((pocket) => pocket.capacity)).toEqual([
      BAG_ITEMS_COUNT,
      BAG_KEYITEMS_COUNT,
      BAG_POKEBALLS_COUNT,
      BAG_TMHM_COUNT,
      BAG_BERRIES_COUNT
    ]);
  });

  test('bag quantities are encrypted by save key and can be rekeyed in place', () => {
    const runtime = createItemRuntime({ gSaveBlock2Ptr: { encryptionKey: 0x1234 } });
    const slot = runtime.gSaveBlock1Ptr.bagPocket_Items[0];

    SetBagItemQuantity(runtime, slot, 77);
    expect(slot.quantity).toBe(77 ^ 0x1234);
    expect(GetBagItemQuantity(runtime, slot)).toBe(77);

    ApplyNewEncryptionKeyToBagItems(runtime, 0x4321);
    runtime.gSaveBlock2Ptr.encryptionKey = 0x4321;
    expect(GetBagItemQuantity(runtime, slot)).toBe(77);
  });

  test('PC quantities are not encrypted', () => {
    const runtime = createItemRuntime({ gSaveBlock2Ptr: { encryptionKey: 0xbeef } });
    const slot = runtime.gSaveBlock1Ptr.pcItems[0];

    SetPcItemQuantity(runtime, slot, 44);
    expect(slot.quantity).toBe(44);
    expect(GetPcItemQuantity(runtime, slot)).toBe(44);
  });

  test('bag add/remove follows FRLG one-stack checks and auto-adds case/pouch key items', () => {
    const runtime = createItemRuntime();

    expect(AddBagItem(runtime, ITEM_POTION, 990)).toBe(true);
    expect(CheckBagHasItem(runtime, ITEM_POTION, 990)).toBe(true);
    expect(CheckBagHasSpace(runtime, ITEM_POTION, 10)).toBe(false);
    expect(AddBagItem(runtime, ITEM_POTION, 10)).toBe(false);
    expect(RemoveBagItem(runtime, ITEM_POTION, 989)).toBe(true);
    expect(BagGetQuantityByItemId(runtime, ITEM_POTION)).toBe(1);
    expect(RemoveBagItem(runtime, ITEM_POTION, 1)).toBe(true);
    expect(CheckBagHasItem(runtime, ITEM_POTION, 1)).toBe(false);

    expect(AddBagItem(runtime, ITEM_TM01, 1)).toBe(true);
    expect(CheckBagHasItem(runtime, ITEM_TM_CASE, 1)).toBe(true);
    expect(AddBagItem(runtime, ITEM_CHERI_BERRY, 3)).toBe(true);
    expect(CheckBagHasItem(runtime, ITEM_BERRY_POUCH, 1)).toBe(true);
    expect(runtime.flags.has(FLAG_SYS_GOT_BERRY_POUCH)).toBe(true);
  });

  test('HasAtLeastOneBerry requires both berry pouch and a berry item', () => {
    const runtime = createItemRuntime();

    expect(HasAtLeastOneBerry(runtime)).toBe(false);
    expect(runtime.gSpecialVar_Result).toBe(false);

    expect(AddBagItem(runtime, ITEM_BERRY_POUCH, 1)).toBe(true);
    expect(HasAtLeastOneBerry(runtime)).toBe(false);

    expect(AddBagItem(runtime, ITEM_ORAN_BERRY, 1)).toBe(true);
    expect(HasAtLeastOneBerry(runtime)).toBe(true);
    expect(runtime.gSpecialVar_Result).toBe(true);
  });

  test('PC item helpers add, count, remove, wrap underflow like u16, and compact by swapping empties forward', () => {
    const runtime = createItemRuntime();

    expect(PCItemsGetFirstEmptySlot(runtime)).toBe(0);
    expect(AddPCItem(runtime, ITEM_POTION, 5)).toBe(true);
    expect(AddPCItem(runtime, ITEM_POKE_BALL, 7)).toBe(true);
    expect(AddPCItem(runtime, ITEM_POTION, 995)).toBe(false);
    expect(CheckPCHasItem(runtime, ITEM_POTION, 5)).toBe(true);
    expect(CountItemsInPC(runtime)).toBe(2);

    RemovePCItem(runtime, ITEM_POTION, 7);
    expect(GetPcItemQuantity(runtime, runtime.gSaveBlock1Ptr.pcItems[0])).toBe(0xfffe);

    runtime.gSaveBlock1Ptr.pcItems[0].itemId = ITEM_NONE;
    ItemPcCompaction(runtime);
    expect(runtime.gSaveBlock1Ptr.pcItems[0].itemId).toBe(ITEM_POKE_BALL);

    ClearPCItemSlots(runtime);
    expect(CountItemsInPC(runtime)).toBe(0);
  });

  test('bag compaction and sorting preserve the C nested-swap behavior', () => {
    const runtime = createItemRuntime();
    const pocket = runtime.gBagPockets[POCKET_ITEMS - 1];

    pocket.itemSlots[0].itemId = ITEM_POTION;
    SetBagItemQuantity(runtime, pocket.itemSlots[0], 0);
    pocket.itemSlots[1].itemId = ITEM_POKE_BALL;
    SetBagItemQuantity(runtime, pocket.itemSlots[1], 2);
    pocket.itemSlots[2].itemId = ITEM_MASTER_BALL;
    SetBagItemQuantity(runtime, pocket.itemSlots[2], 1);

    BagPocketCompaction(runtime, pocket.itemSlots, 3);
    expect(pocket.itemSlots.slice(0, 3).map((slot) => slot.itemId)).toEqual([
      ITEM_POKE_BALL,
      ITEM_MASTER_BALL,
      ITEM_POTION
    ]);

    SortAndCompactBagPocket(runtime, pocket);
    expect(pocket.itemSlots.slice(0, 3).map((slot) => slot.itemId)).toEqual([
      ITEM_MASTER_BALL,
      ITEM_POKE_BALL,
      ITEM_NONE
    ]);
  });

  test('SortPocketAndPlaceHMsFirst rotates TM pocket from the first HM to first empty and zero-fills the rest', () => {
    const runtime = createItemRuntime();
    const pocket = runtime.gBagPockets[POCKET_TM_CASE - 1];

    pocket.itemSlots[0].itemId = ITEM_TM02;
    SetBagItemQuantity(runtime, pocket.itemSlots[0], 1);
    pocket.itemSlots[1].itemId = ITEM_HM01;
    SetBagItemQuantity(runtime, pocket.itemSlots[1], 1);
    pocket.itemSlots[2].itemId = ITEM_TM01;
    SetBagItemQuantity(runtime, pocket.itemSlots[2], 1);

    SortPocketAndPlaceHMsFirst(runtime, pocket);
    expect(pocket.itemSlots.slice(0, 3).map((slot) => slot.itemId)).toEqual([
      ITEM_HM01,
      ITEM_TM01,
      ITEM_TM02
    ]);
    expect(GetBagItemQuantity(runtime, pocket.itemSlots[3])).toBe(0);
  });

  test('position getters, clear bag, item names, and bike swap mirror the simple accessors', () => {
    const runtime = createItemRuntime({ berryNames: { 43: 'MYSTERY' } });

    expect(AddBagItem(runtime, ITEM_POTION, 2)).toBe(true);
    expect(BagGetItemIdByPocketPosition(runtime, POCKET_ITEMS, 0)).toBe(ITEM_POTION);
    expect(BagGetQuantityByPocketPosition(runtime, POCKET_ITEMS, 0)).toBe(2);
    expect(CopyItemName(runtime, ITEM_ENIGMA_BERRY)).toBe('MYSTERYBERRY');
    expect(CopyItemName(runtime, ITEM_POTION)).toBe('POTION');

    runtime.gSaveBlock1Ptr.registeredItem = ITEM_MACH_BIKE;
    RegisteredItemHandleBikeSwap(runtime);
    expect(runtime.gSaveBlock1Ptr.registeredItem).toBe(ITEM_ACRO_BIKE);
    RegisteredItemHandleBikeSwap(runtime);
    expect(runtime.gSaveBlock1Ptr.registeredItem).toBe(ITEM_MACH_BIKE);

    ClearBag(runtime);
    expect(BagGetItemIdByPocketPosition(runtime, POCKET_ITEMS, 0)).toBe(ITEM_NONE);
    expect(BagGetQuantityByPocketPosition(runtime, POCKET_ITEMS, 0)).toBe(0);
  });

  test('quest-log story item filter matches the Town Map location special case', () => {
    const runtime = createItemRuntime({ gMapHeader: { regionMapSectionId: 88 } });

    TrySetObtainedItemQuestLogEvent(runtime, ITEM_OAKS_PARCEL);
    expect(runtime.questLogEvents).toEqual([
      { eventId: QL_EVENT_OBTAINED_STORY_ITEM, itemId: ITEM_OAKS_PARCEL, mapSec: 88 }
    ]);

    TrySetObtainedItemQuestLogEvent(runtime, ITEM_TOWN_MAP);
    expect(runtime.questLogEvents).toHaveLength(1);

    runtime.gSaveBlock1Ptr.location = {
      mapGroup: MAP_PALLET_TOWN_RIVALS_HOUSE & 0xff,
      mapNum: MAP_PALLET_TOWN_RIVALS_HOUSE >> 8
    };
    TrySetObtainedItemQuestLogEvent(runtime, ITEM_TOWN_MAP);
    expect(runtime.questLogEvents.at(-1)).toEqual({
      eventId: QL_EVENT_OBTAINED_STORY_ITEM,
      itemId: ITEM_TOWN_MAP,
      mapSec: 88
    });
  });

  test('item table accessors sanitize out-of-range ids and expose gItems fields', () => {
    expect(SanitizeItemId(9999)).toBe(ITEM_NONE);
    expect(ItemId_GetName(ITEM_POTION)).toBe('POTION');
    expect(ItemId_GetId(ITEM_POTION)).toBe(ITEM_POTION);
    expect(ItemId_GetPrice(ITEM_POTION)).toBe(300);
    expect(ItemId_GetHoldEffect(ITEM_POTION)).toBe('HOLD_EFFECT_NONE');
    expect(ItemId_GetHoldEffectParam(ITEM_POTION)).toBe(20);
    expect(ItemId_GetDescription(ITEM_POTION)).toContain('20 points');
    expect(ItemId_GetImportance(ITEM_TM_CASE)).toBe(1);
    expect(ItemId_GetRegistrability(ITEM_TM_CASE)).toBe(1);
    expect(ItemId_GetPocket(ITEM_POTION)).toBe(POCKET_ITEMS);
    expect(ItemId_GetType(ITEM_POTION)).toBe('ITEM_TYPE_PARTY_MENU');
    expect(ItemId_GetFieldFunc(ITEM_POTION)).toBe('FieldUseFunc_Medicine');
    expect(ItemId_GetBattleUsage(ITEM_POTION)).toBe(1);
    expect(ItemId_GetBattleFunc(ITEM_POTION)).toBe('BattleUseFunc_Medicine');
    expect(ItemId_GetSecondaryId(ITEM_TM01)).toBe(0);
  });
});
