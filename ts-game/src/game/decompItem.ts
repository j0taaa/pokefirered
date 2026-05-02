import { gItems, type DecompItemJsonEntry } from './decompItems';

export const ITEM_NONE = 0;
export const ITEM_MASTER_BALL = 1;
export const ITEM_POKE_BALL = 4;
export const ITEM_POTION = 13;
export const ITEM_CHERI_BERRY = 133;
export const ITEM_ORAN_BERRY = 139;
export const ITEM_ENIGMA_BERRY = 175;
export const FIRST_BERRY_INDEX = ITEM_CHERI_BERRY;
export const LAST_BERRY_INDEX = ITEM_ENIGMA_BERRY;
export const ITEM_MACH_BIKE = 259;
export const ITEM_ACRO_BIKE = 272;
export const ITEM_HM01 = 339;
export const ITEM_OAKS_PARCEL = 349;
export const ITEM_POKE_FLUTE = 350;
export const ITEM_SECRET_KEY = 351;
export const ITEM_BIKE_VOUCHER = 352;
export const ITEM_GOLD_TEETH = 353;
export const ITEM_OLD_AMBER = 354;
export const ITEM_CARD_KEY = 355;
export const ITEM_LIFT_KEY = 356;
export const ITEM_HELIX_FOSSIL = 357;
export const ITEM_DOME_FOSSIL = 358;
export const ITEM_SILPH_SCOPE = 359;
export const ITEM_BICYCLE = 360;
export const ITEM_TOWN_MAP = 361;
export const ITEM_VS_SEEKER = 362;
export const ITEM_TM_CASE = 364;
export const ITEM_BERRY_POUCH = 365;
export const ITEM_TEACHY_TV = 366;
export const ITEM_RAINBOW_PASS = 368;
export const ITEM_TEA = 369;
export const ITEM_POWDER_JAR = 372;
export const ITEM_RUBY = 373;
export const ITEM_SAPPHIRE = 374;
export const ITEMS_COUNT = 375;

export const PC_ITEMS_COUNT = 30;
export const BAG_ITEMS_COUNT = 42;
export const BAG_KEYITEMS_COUNT = 30;
export const BAG_POKEBALLS_COUNT = 13;
export const BAG_TMHM_COUNT = 58;
export const BAG_BERRIES_COUNT = 43;
export const POCKET_ITEMS = 1;
export const POCKET_KEY_ITEMS = 2;
export const POCKET_POKE_BALLS = 3;
export const POCKET_TM_CASE = 4;
export const POCKET_BERRY_POUCH = 5;
export const NUM_BAG_POCKETS = 5;

export const FLAG_SYS_GOT_BERRY_POUCH = 0x47;
export const MAP_PALLET_TOWN_RIVALS_HOUSE = 2 | (4 << 8);
export const QL_EVENT_OBTAINED_STORY_ITEM = 40;

export interface ItemSlot {
  itemId: number;
  quantity: number;
}

export interface BagPocket {
  itemSlots: ItemSlot[];
  capacity: number;
}

export interface ItemSaveBlock1 {
  pcItems: ItemSlot[];
  bagPocket_Items: ItemSlot[];
  bagPocket_KeyItems: ItemSlot[];
  bagPocket_PokeBalls: ItemSlot[];
  bagPocket_TMHM: ItemSlot[];
  bagPocket_Berries: ItemSlot[];
  registeredItem: number;
  location: {
    mapGroup: number;
    mapNum: number;
  };
}

export interface ItemRuntime {
  gBagPockets: BagPocket[];
  gSaveBlock1Ptr: ItemSaveBlock1;
  gSaveBlock2Ptr: {
    encryptionKey: number;
  };
  gSpecialVar_Result: boolean;
  flags: Set<number>;
  questLogEvents: Array<{ eventId: number; itemId: number; mapSec: number }>;
  gMapHeader: {
    regionMapSectionId: number;
  };
  berryNames: Record<number, string>;
}

const makeSlots = (capacity: number): ItemSlot[] =>
  Array.from({ length: capacity }, () => ({ itemId: ITEM_NONE, quantity: 0 }));

export const createItemRuntime = (overrides: Partial<ItemRuntime> = {}): ItemRuntime => {
  const saveBlock1: ItemSaveBlock1 = {
    pcItems: makeSlots(PC_ITEMS_COUNT),
    bagPocket_Items: makeSlots(BAG_ITEMS_COUNT),
    bagPocket_KeyItems: makeSlots(BAG_KEYITEMS_COUNT),
    bagPocket_PokeBalls: makeSlots(BAG_POKEBALLS_COUNT),
    bagPocket_TMHM: makeSlots(BAG_TMHM_COUNT),
    bagPocket_Berries: makeSlots(BAG_BERRIES_COUNT),
    registeredItem: ITEM_NONE,
    location: { mapGroup: 0, mapNum: 0 },
    ...overrides.gSaveBlock1Ptr
  };
  const runtime: ItemRuntime = {
    gBagPockets: [],
    gSaveBlock1Ptr: saveBlock1,
    gSaveBlock2Ptr: { encryptionKey: 0, ...overrides.gSaveBlock2Ptr },
    gSpecialVar_Result: false,
    flags: new Set<number>(),
    questLogEvents: [],
    gMapHeader: { regionMapSectionId: 0, ...overrides.gMapHeader },
    berryNames: { 43: 'ENIGMA', ...overrides.berryNames }
  };
  SetBagPocketsPointers(runtime);
  return runtime;
};

const toU16 = (value: number): number => value & 0xffff;

const stringToPocket = (pocket: string | number): number => {
  if (typeof pocket === 'number') {
    return pocket;
  }
  switch (pocket) {
    case 'POCKET_ITEMS':
      return POCKET_ITEMS;
    case 'POCKET_KEY_ITEMS':
      return POCKET_KEY_ITEMS;
    case 'POCKET_POKE_BALLS':
      return POCKET_POKE_BALLS;
    case 'POCKET_TM_CASE':
      return POCKET_TM_CASE;
    case 'POCKET_BERRY_POUCH':
      return POCKET_BERRY_POUCH;
    default:
      return 0;
  }
};

const sanitizeItem = (itemId: number): DecompItemJsonEntry => gItems[SanitizeItemId(itemId)] ?? gItems[ITEM_NONE];

const flagSet = (runtime: ItemRuntime, flag: number): void => {
  runtime.flags.add(flag);
};

const itemToBerry = (itemId: number): number => itemId - FIRST_BERRY_INDEX + 1;

const mapGroup = (map: number): number => map & 0xff;

const mapNum = (map: number): number => (map >> 8) & 0xff;

export const GetBagItemQuantity = (runtime: ItemRuntime, slot: Pick<ItemSlot, 'quantity'>): number =>
  toU16(runtime.gSaveBlock2Ptr.encryptionKey ^ slot.quantity);

export const SetBagItemQuantity = (
  runtime: ItemRuntime,
  slot: Pick<ItemSlot, 'quantity'>,
  value: number
): void => {
  slot.quantity = toU16(value ^ runtime.gSaveBlock2Ptr.encryptionKey);
};

export const GetPcItemQuantity = (_runtime: ItemRuntime, slot: Pick<ItemSlot, 'quantity'>): number =>
  toU16(0 ^ slot.quantity);

export const SetPcItemQuantity = (
  _runtime: ItemRuntime,
  slot: Pick<ItemSlot, 'quantity'>,
  value: number
): void => {
  slot.quantity = toU16(value ^ 0);
};

export const ApplyNewEncryptionKeyToBagItems = (runtime: ItemRuntime, key: number): void => {
  for (let i = 0; i < NUM_BAG_POCKETS; i += 1) {
    for (let j = 0; j < runtime.gBagPockets[i].capacity; j += 1) {
      runtime.gBagPockets[i].itemSlots[j].quantity = toU16(
        runtime.gBagPockets[i].itemSlots[j].quantity ^ runtime.gSaveBlock2Ptr.encryptionKey ^ key
      );
    }
  }
};

export const ApplyNewEncryptionKeyToBagItems_ = ApplyNewEncryptionKeyToBagItems;

export const SetBagPocketsPointers = (runtime: ItemRuntime): void => {
  runtime.gBagPockets[POCKET_ITEMS - 1] = {
    itemSlots: runtime.gSaveBlock1Ptr.bagPocket_Items,
    capacity: BAG_ITEMS_COUNT
  };
  runtime.gBagPockets[POCKET_KEY_ITEMS - 1] = {
    itemSlots: runtime.gSaveBlock1Ptr.bagPocket_KeyItems,
    capacity: BAG_KEYITEMS_COUNT
  };
  runtime.gBagPockets[POCKET_POKE_BALLS - 1] = {
    itemSlots: runtime.gSaveBlock1Ptr.bagPocket_PokeBalls,
    capacity: BAG_POKEBALLS_COUNT
  };
  runtime.gBagPockets[POCKET_TM_CASE - 1] = {
    itemSlots: runtime.gSaveBlock1Ptr.bagPocket_TMHM,
    capacity: BAG_TMHM_COUNT
  };
  runtime.gBagPockets[POCKET_BERRY_POUCH - 1] = {
    itemSlots: runtime.gSaveBlock1Ptr.bagPocket_Berries,
    capacity: BAG_BERRIES_COUNT
  };
};

export const CopyItemName = (runtime: ItemRuntime, itemId: number): string => {
  if (itemId === ITEM_ENIGMA_BERRY) {
    return `${runtime.berryNames[itemToBerry(ITEM_ENIGMA_BERRY)] ?? ''}BERRY`;
  }
  return ItemId_GetName(itemId);
};

export const BagPocketGetFirstEmptySlot = (runtime: ItemRuntime, pocketId: number): number => {
  for (let i = 0; i < runtime.gBagPockets[pocketId].capacity; i += 1) {
    if (runtime.gBagPockets[pocketId].itemSlots[i].itemId === ITEM_NONE) {
      return i;
    }
  }
  return -1;
};

export const IsPocketNotEmpty = (runtime: ItemRuntime, pocketId: number): boolean => {
  for (let i = 0; i < runtime.gBagPockets[pocketId - 1].capacity; i += 1) {
    if (runtime.gBagPockets[pocketId - 1].itemSlots[i].itemId !== ITEM_NONE) {
      return true;
    }
  }
  return false;
};

export const CheckBagHasItem = (runtime: ItemRuntime, itemId: number, count: number): boolean => {
  if (ItemId_GetPocket(itemId) === 0) {
    return false;
  }
  const pocket = ItemId_GetPocket(itemId) - 1;
  for (let i = 0; i < runtime.gBagPockets[pocket].capacity; i += 1) {
    if (runtime.gBagPockets[pocket].itemSlots[i].itemId === itemId) {
      return GetBagItemQuantity(runtime, runtime.gBagPockets[pocket].itemSlots[i]) >= count;
    }
  }
  return false;
};

export const HasAtLeastOneBerry = (runtime: ItemRuntime): boolean => {
  let exists = CheckBagHasItem(runtime, ITEM_BERRY_POUCH, 1);
  if (!exists) {
    runtime.gSpecialVar_Result = false;
    return false;
  }
  for (let itemId = FIRST_BERRY_INDEX; itemId <= LAST_BERRY_INDEX; itemId += 1) {
    exists = CheckBagHasItem(runtime, itemId, 1);
    if (exists) {
      runtime.gSpecialVar_Result = true;
      return true;
    }
  }
  runtime.gSpecialVar_Result = false;
  return false;
};

export const CheckBagHasSpace = (runtime: ItemRuntime, itemId: number, count: number): boolean => {
  if (ItemId_GetPocket(itemId) === 0) {
    return false;
  }
  const pocket = ItemId_GetPocket(itemId) - 1;
  for (let i = 0; i < runtime.gBagPockets[pocket].capacity; i += 1) {
    if (runtime.gBagPockets[pocket].itemSlots[i].itemId === itemId) {
      return GetBagItemQuantity(runtime, runtime.gBagPockets[pocket].itemSlots[i]) + count <= 999;
    }
  }
  return BagPocketGetFirstEmptySlot(runtime, pocket) !== -1;
};

export const AddBagItem = (runtime: ItemRuntime, itemId: number, count: number): boolean => {
  if (ItemId_GetPocket(itemId) === 0) {
    return false;
  }
  const pocket = ItemId_GetPocket(itemId) - 1;
  for (let i = 0; i < runtime.gBagPockets[pocket].capacity; i += 1) {
    if (runtime.gBagPockets[pocket].itemSlots[i].itemId === itemId) {
      let quantity = GetBagItemQuantity(runtime, runtime.gBagPockets[pocket].itemSlots[i]);
      if (quantity + count <= 999) {
        quantity += count;
        SetBagItemQuantity(runtime, runtime.gBagPockets[pocket].itemSlots[i], quantity);
        return true;
      }
      return false;
    }
  }
  if (pocket === POCKET_TM_CASE - 1 && !CheckBagHasItem(runtime, ITEM_TM_CASE, 1)) {
    const idx = BagPocketGetFirstEmptySlot(runtime, POCKET_KEY_ITEMS - 1);
    if (idx === -1) {
      return false;
    }
    runtime.gBagPockets[POCKET_KEY_ITEMS - 1].itemSlots[idx].itemId = ITEM_TM_CASE;
    SetBagItemQuantity(runtime, runtime.gBagPockets[POCKET_KEY_ITEMS - 1].itemSlots[idx], 1);
  }
  if (pocket === POCKET_BERRY_POUCH - 1 && !CheckBagHasItem(runtime, ITEM_BERRY_POUCH, 1)) {
    const idx = BagPocketGetFirstEmptySlot(runtime, POCKET_KEY_ITEMS - 1);
    if (idx === -1) {
      return false;
    }
    runtime.gBagPockets[POCKET_KEY_ITEMS - 1].itemSlots[idx].itemId = ITEM_BERRY_POUCH;
    SetBagItemQuantity(runtime, runtime.gBagPockets[POCKET_KEY_ITEMS - 1].itemSlots[idx], 1);
    flagSet(runtime, FLAG_SYS_GOT_BERRY_POUCH);
  }
  if (itemId === ITEM_BERRY_POUCH) {
    flagSet(runtime, FLAG_SYS_GOT_BERRY_POUCH);
  }
  const idx = BagPocketGetFirstEmptySlot(runtime, pocket);
  if (idx === -1) {
    return false;
  }
  runtime.gBagPockets[pocket].itemSlots[idx].itemId = itemId;
  SetBagItemQuantity(runtime, runtime.gBagPockets[pocket].itemSlots[idx], count);
  return true;
};

export const RemoveBagItem = (runtime: ItemRuntime, itemId: number, count: number): boolean => {
  if (ItemId_GetPocket(itemId) === 0) {
    return false;
  }
  if (itemId === ITEM_NONE) {
    return false;
  }
  const pocket = ItemId_GetPocket(itemId) - 1;
  for (let i = 0; i < runtime.gBagPockets[pocket].capacity; i += 1) {
    if (runtime.gBagPockets[pocket].itemSlots[i].itemId === itemId) {
      let quantity = GetBagItemQuantity(runtime, runtime.gBagPockets[pocket].itemSlots[i]);
      if (quantity >= count) {
        quantity -= count;
        SetBagItemQuantity(runtime, runtime.gBagPockets[pocket].itemSlots[i], quantity);
        if (quantity === 0) {
          runtime.gBagPockets[pocket].itemSlots[i].itemId = ITEM_NONE;
        }
        return true;
      }
      return false;
    }
  }
  return false;
};

export const GetPocketByItemId = (itemId: number): number => ItemId_GetPocket(itemId);

export const ClearItemSlots = (runtime: ItemRuntime, slots: ItemSlot[], capacity: number): void => {
  for (let i = 0; i < capacity; i += 1) {
    slots[i].itemId = ITEM_NONE;
    SetBagItemQuantity(runtime, slots[i], 0);
  }
};

export const ClearPCItemSlots = (runtime: ItemRuntime): void => {
  for (let i = 0; i < PC_ITEMS_COUNT; i += 1) {
    runtime.gSaveBlock1Ptr.pcItems[i].itemId = ITEM_NONE;
    SetPcItemQuantity(runtime, runtime.gSaveBlock1Ptr.pcItems[i], 0);
  }
};

export const ClearBag = (runtime: ItemRuntime): void => {
  for (let i = 0; i < NUM_BAG_POCKETS; i += 1) {
    ClearItemSlots(runtime, runtime.gBagPockets[i].itemSlots, runtime.gBagPockets[i].capacity);
  }
};

export const PCItemsGetFirstEmptySlot = (runtime: ItemRuntime): number => {
  for (let i = 0; i < PC_ITEMS_COUNT; i += 1) {
    if (runtime.gSaveBlock1Ptr.pcItems[i].itemId === ITEM_NONE) {
      return i;
    }
  }
  return -1;
};

export const CountItemsInPC = (runtime: ItemRuntime): number => {
  let count = 0;
  for (let i = 0; i < PC_ITEMS_COUNT; i += 1) {
    if (runtime.gSaveBlock1Ptr.pcItems[i].itemId !== ITEM_NONE) {
      count += 1;
    }
  }
  return count;
};

export const CheckPCHasItem = (runtime: ItemRuntime, itemId: number, count: number): boolean => {
  for (let i = 0; i < PC_ITEMS_COUNT; i += 1) {
    if (
      runtime.gSaveBlock1Ptr.pcItems[i].itemId === itemId
      && GetPcItemQuantity(runtime, runtime.gSaveBlock1Ptr.pcItems[i]) >= count
    ) {
      return true;
    }
  }
  return false;
};

export const AddPCItem = (runtime: ItemRuntime, itemId: number, count: number): boolean => {
  for (let i = 0; i < PC_ITEMS_COUNT; i += 1) {
    if (runtime.gSaveBlock1Ptr.pcItems[i].itemId === itemId) {
      let quantity = GetPcItemQuantity(runtime, runtime.gSaveBlock1Ptr.pcItems[i]);
      if (quantity + count <= 999) {
        quantity += count;
        SetPcItemQuantity(runtime, runtime.gSaveBlock1Ptr.pcItems[i], quantity);
        return true;
      }
      return false;
    }
  }
  const idx = PCItemsGetFirstEmptySlot(runtime);
  if (idx === -1) {
    return false;
  }
  runtime.gSaveBlock1Ptr.pcItems[idx].itemId = itemId;
  SetPcItemQuantity(runtime, runtime.gSaveBlock1Ptr.pcItems[idx], count);
  return true;
};

export const RemovePCItem = (runtime: ItemRuntime, itemId: number, count: number): void => {
  if (itemId === ITEM_NONE) {
    return;
  }
  let i = 0;
  for (; i < PC_ITEMS_COUNT; i += 1) {
    if (runtime.gSaveBlock1Ptr.pcItems[i].itemId === itemId) {
      break;
    }
  }
  if (i !== PC_ITEMS_COUNT) {
    const quantity = toU16(GetPcItemQuantity(runtime, runtime.gSaveBlock1Ptr.pcItems[i]) - count);
    SetPcItemQuantity(runtime, runtime.gSaveBlock1Ptr.pcItems[i], quantity);
    if (quantity === 0) {
      runtime.gSaveBlock1Ptr.pcItems[i].itemId = ITEM_NONE;
    }
  }
};

export const ItemPcCompaction = (runtime: ItemRuntime): void => {
  for (let i = 0; i < PC_ITEMS_COUNT - 1; i += 1) {
    for (let j = i + 1; j < PC_ITEMS_COUNT; j += 1) {
      if (runtime.gSaveBlock1Ptr.pcItems[i].itemId === ITEM_NONE) {
        SwapItemSlots(runtime.gSaveBlock1Ptr.pcItems[i], runtime.gSaveBlock1Ptr.pcItems[j]);
      }
    }
  }
};

export const RegisteredItemHandleBikeSwap = (runtime: ItemRuntime): void => {
  switch (runtime.gSaveBlock1Ptr.registeredItem) {
    case ITEM_MACH_BIKE:
      runtime.gSaveBlock1Ptr.registeredItem = ITEM_ACRO_BIKE;
      break;
    case ITEM_ACRO_BIKE:
      runtime.gSaveBlock1Ptr.registeredItem = ITEM_MACH_BIKE;
      break;
  }
};

export const SwapItemSlots = (a: ItemSlot, b: ItemSlot): void => {
  const c = { ...a };
  a.itemId = b.itemId;
  a.quantity = b.quantity;
  b.itemId = c.itemId;
  b.quantity = c.quantity;
};

export const BagPocketCompaction = (runtime: ItemRuntime, slots: ItemSlot[], capacity: number): void => {
  for (let i = 0; i < capacity - 1; i += 1) {
    for (let j = i + 1; j < capacity; j += 1) {
      if (GetBagItemQuantity(runtime, slots[i]) === 0) {
        SwapItemSlots(slots[i], slots[j]);
      }
    }
  }
};

export const SortAndCompactBagPocket = (runtime: ItemRuntime, pocket: BagPocket): void => {
  for (let i = 0; i < pocket.capacity; i += 1) {
    for (let j = i + 1; j < pocket.capacity; j += 1) {
      if (
        GetBagItemQuantity(runtime, pocket.itemSlots[i]) === 0
        || (GetBagItemQuantity(runtime, pocket.itemSlots[j]) !== 0 && pocket.itemSlots[i].itemId > pocket.itemSlots[j].itemId)
      ) {
        SwapItemSlots(pocket.itemSlots[i], pocket.itemSlots[j]);
      }
    }
  }
};

export const SortPocketAndPlaceHMsFirst = (runtime: ItemRuntime, pocket: BagPocket): void => {
  SortAndCompactBagPocket(runtime, pocket);
  let i = 0;
  let j = 0;
  for (; i < pocket.capacity; i += 1) {
    if (pocket.itemSlots[i].itemId === ITEM_NONE && GetBagItemQuantity(runtime, pocket.itemSlots[i]) === 0) {
      return;
    }
    if (pocket.itemSlots[i].itemId >= ITEM_HM01 && GetBagItemQuantity(runtime, pocket.itemSlots[i]) !== 0) {
      for (j = i + 1; j < pocket.capacity; j += 1) {
        if (pocket.itemSlots[j].itemId === ITEM_NONE && GetBagItemQuantity(runtime, pocket.itemSlots[j]) === 0) {
          break;
        }
      }
      break;
    }
  }
  const decoded = pocket.itemSlots.map((slot) => ({
    itemId: slot.itemId,
    quantity: GetBagItemQuantity(runtime, slot)
  }));
  const buff = decoded.slice(i, j).concat(decoded.slice(0, i));
  for (let k = buff.length; k < pocket.capacity; k += 1) {
    buff[k] = { itemId: ITEM_NONE, quantity: 0 };
  }
  for (let k = 0; k < pocket.capacity; k += 1) {
    pocket.itemSlots[k].itemId = buff[k].itemId;
    SetBagItemQuantity(runtime, pocket.itemSlots[k], buff[k].quantity);
  }
};

export const BagGetItemIdByPocketPosition = (runtime: ItemRuntime, pocketId: number, slotId: number): number =>
  runtime.gBagPockets[pocketId - 1].itemSlots[slotId].itemId;

export const BagGetQuantityByPocketPosition = (runtime: ItemRuntime, pocketId: number, slotId: number): number =>
  GetBagItemQuantity(runtime, runtime.gBagPockets[pocketId - 1].itemSlots[slotId]);

export const BagGetQuantityByItemId = (runtime: ItemRuntime, itemId: number): number => {
  const pocket = runtime.gBagPockets[ItemId_GetPocket(itemId) - 1];
  for (let i = 0; i < pocket.capacity; i += 1) {
    if (pocket.itemSlots[i].itemId === itemId) {
      return GetBagItemQuantity(runtime, pocket.itemSlots[i]);
    }
  }
  return 0;
};

const storyItems = new Set([
  ITEM_OAKS_PARCEL,
  ITEM_POKE_FLUTE,
  ITEM_SECRET_KEY,
  ITEM_BIKE_VOUCHER,
  ITEM_GOLD_TEETH,
  ITEM_OLD_AMBER,
  ITEM_CARD_KEY,
  ITEM_LIFT_KEY,
  ITEM_HELIX_FOSSIL,
  ITEM_DOME_FOSSIL,
  ITEM_SILPH_SCOPE,
  ITEM_BICYCLE,
  ITEM_TOWN_MAP,
  ITEM_VS_SEEKER,
  ITEM_TEACHY_TV,
  ITEM_RAINBOW_PASS,
  ITEM_TEA,
  ITEM_POWDER_JAR,
  ITEM_RUBY,
  ITEM_SAPPHIRE
]);

export const TrySetObtainedItemQuestLogEvent = (runtime: ItemRuntime, itemId: number): void => {
  if (storyItems.has(itemId)) {
    if (
      itemId !== ITEM_TOWN_MAP
      || (
        runtime.gSaveBlock1Ptr.location.mapGroup === mapGroup(MAP_PALLET_TOWN_RIVALS_HOUSE)
        && runtime.gSaveBlock1Ptr.location.mapNum === mapNum(MAP_PALLET_TOWN_RIVALS_HOUSE)
      )
    ) {
      runtime.questLogEvents.push({
        eventId: QL_EVENT_OBTAINED_STORY_ITEM,
        itemId,
        mapSec: runtime.gMapHeader.regionMapSectionId
      });
    }
  }
};

export const SanitizeItemId = (itemId: number): number => (itemId >= ITEMS_COUNT ? ITEM_NONE : itemId);

export const ItemId_GetName = (itemId: number): string => sanitizeItem(itemId).english;

export const ItemId_GetId = (itemId: number): number => SanitizeItemId(itemId);

export const ItemId_GetPrice = (itemId: number): number => sanitizeItem(itemId).price;

export const ItemId_GetHoldEffect = (itemId: number): string => sanitizeItem(itemId).holdEffect;

export const ItemId_GetHoldEffectParam = (itemId: number): number => sanitizeItem(itemId).holdEffectParam;

export const ItemId_GetDescription = (itemId: number): string => sanitizeItem(itemId).description_english;

export const ItemId_GetImportance = (itemId: number): number => sanitizeItem(itemId).importance;

export const ItemId_GetRegistrability = (itemId: number): number => sanitizeItem(itemId).registrability;

export const ItemId_GetPocket = (itemId: number): number => stringToPocket(sanitizeItem(itemId).pocket);

export const ItemId_GetType = (itemId: number): string | number => sanitizeItem(itemId).type;

export const ItemId_GetFieldFunc = (itemId: number): string => sanitizeItem(itemId).fieldUseFunc;

export const ItemId_GetBattleUsage = (itemId: number): number => sanitizeItem(itemId).battleUsage;

export const ItemId_GetBattleFunc = (itemId: number): string => sanitizeItem(itemId).battleUseFunc;

export const ItemId_GetSecondaryId = (itemId: number): number => sanitizeItem(itemId).secondaryId;
