import type { InputSnapshot } from '../input/inputState';
import rawItemData from '../../../src/data/items.json';
import { adjustQuantityAccordingToDPadInput } from './decompMenuHelpers';
import type { FieldPokemon } from './pokemonStorage';

export type BagPocketId = 'items' | 'keyItems' | 'pokeBalls' | 'tmCase' | 'berryPouch';
export type BagContextActionId =
  | 'USE'
  | 'GIVE'
  | 'TOSS'
  | 'REGISTER'
  | 'DESELECT'
  | 'OPEN'
  | 'CANCEL';

export interface BagSlot {
  itemId: string;
  quantity: number;
}

export interface BagState {
  pockets: Record<BagPocketId, BagSlot[]>;
  selectedPocket: BagPocketId;
  selectedIndexByPocket: Record<BagPocketId, number>;
  scrollOffsetByPocket: Record<BagPocketId, number>;
  registeredItemId: string | null;
  bicycleActive: boolean;
}

export interface ItemDefinition {
  itemId: string;
  name: string;
  description: string;
  holdEffect: string;
  holdEffectParam: number;
  pocket: string;
  importance: number;
  registrability: number;
  battleUsage: number;
  fieldUseFunc: string;
  price: number;
  iconKey: string;
  moveId?: string;
}

export interface BagContextMenuState {
  actions: BagContextActionId[];
  itemId: string;
  selectedIndex: number;
}

export interface BagQuantityPromptState {
  itemId: string;
  maxQuantity: number;
  quantity: number;
}

export interface BagConfirmationPromptState {
  itemId: string;
  quantity: number;
  selectedIndex: 0 | 1;
}

export interface BagMessageState {
  text: string;
}

export interface BagPanelState {
  kind: 'bag';
  id: 'BAG';
  title: string;
  description: string;
  contextMenu: BagContextMenuState | null;
  quantityPrompt: BagQuantityPromptState | null;
  confirmationPrompt: BagConfirmationPromptState | null;
  message: BagMessageState | null;
  returnToMenuOnClose: boolean;
}

export interface BagStepResult {
  close: boolean;
  scriptId?: string;
}

export interface BagOperationResult {
  ok: boolean;
  message: string;
}

export interface ShopOperationResult extends BagOperationResult {
  money: number;
}

export interface PcItemStorageState {
  slots: BagSlot[];
}

export type BagUseLocation = 'field' | 'battle';

export interface BagUseContext {
  location: BagUseLocation;
  mapType?: 'route' | 'town' | 'city' | 'indoor' | 'cave' | 'other';
  bikingAllowed?: boolean;
  bikingDisallowedByPlayer?: boolean;
  onCyclingRoad?: boolean;
  repelStepsRemaining?: number;
  hasParty?: boolean;
}

interface RawItemDefinition {
  english: string;
  itemId: string;
  price: number;
  holdEffect: string;
  holdEffectParam: number;
  description_english: string;
  importance: number;
  registrability: number;
  pocket: string;
  battleUsage: number;
  fieldUseFunc: string;
  moveId?: string;
}

const BAG_POCKET_ORDER: BagPocketId[] = ['items', 'keyItems', 'pokeBalls', 'tmCase', 'berryPouch'];
const BAG_POCKET_CAPACITY: Record<BagPocketId, number> = {
  items: 42,
  keyItems: 30,
  pokeBalls: 13,
  tmCase: 58,
  berryPouch: 43
};

const PC_ITEM_CAPACITY = 30;

const BAG_VISIBLE_ROWS = 6;
const rawItems = (rawItemData as { items: RawItemDefinition[] }).items;

const normalizeDescription = (value: string): string =>
  value.replace(/\\n/gu, '\n');

const pocketFromDecompPocket = (value: string): BagPocketId | null => {
  switch (value) {
    case 'POCKET_ITEMS':
      return 'items';
    case 'POCKET_KEY_ITEMS':
      return 'keyItems';
    case 'POCKET_POKE_BALLS':
      return 'pokeBalls';
    case 'POCKET_TM_CASE':
      return 'tmCase';
    case 'POCKET_BERRY_POUCH':
      return 'berryPouch';
    default:
      return null;
  }
};

const iconKeyFromItemId = (itemId: string): string =>
  itemId.replace(/^ITEM_/u, '').toLowerCase();

const itemDefinitions = new Map<string, ItemDefinition>(
  rawItems.map((item) => [
    item.itemId,
    {
      itemId: item.itemId,
      name: item.english,
      description: normalizeDescription(item.description_english),
      holdEffect: item.holdEffect,
      holdEffectParam: item.holdEffectParam,
      pocket: item.pocket,
      importance: item.importance,
      registrability: item.registrability,
      battleUsage: item.battleUsage,
      fieldUseFunc: item.fieldUseFunc,
      price: item.price,
      iconKey: iconKeyFromItemId(item.itemId),
      moveId: item.moveId
    }
  ])
);

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const compactPocket = (slots: BagSlot[]): BagSlot[] =>
  slots
    .filter((slot) => slot.itemId !== 'ITEM_NONE' && slot.quantity > 0)
    .map((slot) => ({ itemId: slot.itemId, quantity: slot.quantity }));

const getPocketCapacity = (pocket: BagPocketId): number => BAG_POCKET_CAPACITY[pocket];

const getEntryCount = (bag: BagState, pocket: BagPocketId): number => compactPocket(bag.pockets[pocket]).length;

const getSelectedAbsoluteIndex = (bag: BagState, pocket: BagPocketId): number =>
  bag.selectedIndexByPocket[pocket];

const setSelectedAbsoluteIndex = (bag: BagState, pocket: BagPocketId, nextIndex: number): void => {
  const maxIndex = getEntryCount(bag, pocket);
  const clampedIndex = clamp(nextIndex, 0, maxIndex);
  bag.selectedIndexByPocket[pocket] = clampedIndex;

  if (clampedIndex < bag.scrollOffsetByPocket[pocket]) {
    bag.scrollOffsetByPocket[pocket] = clampedIndex;
  }

  if (clampedIndex >= bag.scrollOffsetByPocket[pocket] + BAG_VISIBLE_ROWS) {
    bag.scrollOffsetByPocket[pocket] = clampedIndex - (BAG_VISIBLE_ROWS - 1);
  }

  const maxScroll = Math.max(0, maxIndex - (BAG_VISIBLE_ROWS - 1));
  bag.scrollOffsetByPocket[pocket] = clamp(bag.scrollOffsetByPocket[pocket], 0, maxScroll);
};

export const getItemDefinition = (itemId: string): ItemDefinition => itemDefinitions.get(itemId) ?? {
  itemId,
  name: itemId.replace(/^ITEM_/u, '').replace(/_/gu, ' '),
  description: 'No description available.',
  holdEffect: 'HOLD_EFFECT_NONE',
  holdEffectParam: 0,
  pocket: 'POCKET_ITEMS',
  importance: 0,
  registrability: 0,
  battleUsage: 0,
  fieldUseFunc: 'NULL',
  price: 0,
  iconKey: iconKeyFromItemId(itemId),
  moveId: undefined
};

export const getBagPocketByItemId = (itemId: string): BagPocketId | null =>
  pocketFromDecompPocket(getItemDefinition(itemId).pocket);

/** `sPocketNames` in `src/item_menu.c` (`gText_Items2`, `gText_KeyItems2`, `gText_PokeBalls2`). */
export const getBagPocketLabel = (pocket: BagPocketId): string => {
  switch (pocket) {
    case 'items':
      return 'ITEMS';
    case 'keyItems':
      return 'KEY ITEMS';
    case 'pokeBalls':
      return 'POKé BALLS';
    case 'tmCase':
      return 'TM CASE';
    case 'berryPouch':
      return 'BERRIES';
  }
};

export const getBagFullMessage = (pocket: BagPocketId): string => {
  switch (pocket) {
    case 'items':
      return 'The BAG is full...';
    case 'keyItems':
      return 'The KEY ITEMS pocket is full...';
    case 'pokeBalls':
      return 'The POKé BALLS pocket is full...';
    case 'tmCase':
      return 'The TM CASE is full...';
    case 'berryPouch':
      return 'The BERRY POUCH is full...';
  }
};

export const createBagState = (): BagState => ({
  pockets: {
    items: [],
    keyItems: [],
    pokeBalls: [
      { itemId: 'ITEM_POKE_BALL', quantity: 5 },
      { itemId: 'ITEM_GREAT_BALL', quantity: 1 }
    ],
    tmCase: [],
    berryPouch: []
  },
  selectedPocket: 'items',
  selectedIndexByPocket: {
    items: 0,
    keyItems: 0,
    pokeBalls: 0,
    tmCase: 0,
    berryPouch: 0
  },
  scrollOffsetByPocket: {
    items: 0,
    keyItems: 0,
    pokeBalls: 0,
    tmCase: 0,
    berryPouch: 0
  },
  registeredItemId: null,
  bicycleActive: false
});

export const isValidBagState = (value: unknown): value is BagState => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (
    !candidate.pockets
    || typeof candidate.pockets !== 'object'
    || !candidate.selectedIndexByPocket
    || typeof candidate.selectedIndexByPocket !== 'object'
    || !candidate.scrollOffsetByPocket
    || typeof candidate.scrollOffsetByPocket !== 'object'
  ) {
    return false;
  }

  if (!BAG_POCKET_ORDER.includes(candidate.selectedPocket as BagPocketId)) {
    return false;
  }

  const pockets = candidate.pockets as Record<string, unknown>;
  const selectedIndexByPocket = candidate.selectedIndexByPocket as Record<string, unknown>;
  const scrollOffsetByPocket = candidate.scrollOffsetByPocket as Record<string, unknown>;
  for (const pocket of BAG_POCKET_ORDER) {
    const slots = pockets[pocket];
    if (
      !Array.isArray(slots)
      || slots.some((slot) =>
        !slot
        || typeof slot !== 'object'
        || typeof (slot as BagSlot).itemId !== 'string'
        || !Number.isInteger((slot as BagSlot).quantity)
        || (slot as BagSlot).quantity < 1
      )
      || !Number.isInteger(selectedIndexByPocket[pocket])
      || !Number.isInteger(scrollOffsetByPocket[pocket])
    ) {
      return false;
    }
  }

  return (candidate.registeredItemId === null || typeof candidate.registeredItemId === 'string')
    && (candidate.bicycleActive === undefined || typeof candidate.bicycleActive === 'boolean');
};

export const sanitizeBagState = (bag: BagState): BagState => {
  for (const pocket of BAG_POCKET_ORDER) {
    bag.pockets[pocket] = compactPocket(bag.pockets[pocket]).slice(0, getPocketCapacity(pocket));
    setSelectedAbsoluteIndex(bag, pocket, getSelectedAbsoluteIndex(bag, pocket));
  }

  if (!BAG_POCKET_ORDER.includes(bag.selectedPocket)) {
    bag.selectedPocket = 'items';
  }

  if (bag.registeredItemId && getBagPocketByItemId(bag.registeredItemId) !== 'keyItems') {
    bag.registeredItemId = null;
  }

  if (typeof bag.bicycleActive !== 'boolean') {
    bag.bicycleActive = false;
  }

  return bag;
};

export const getBagQuantity = (bag: BagState, itemId: string): number => {
  const pocket = getBagPocketByItemId(itemId);
  if (!pocket) {
    return 0;
  }

  const slot = bag.pockets[pocket].find((entry) => entry.itemId === itemId);
  return slot?.quantity ?? 0;
};

export const checkBagHasItem = (bag: BagState, itemId: string, count: number): boolean =>
  getBagQuantity(bag, itemId) >= count;

export const checkBagHasSpace = (bag: BagState, itemId: string, count: number): boolean => {
  const pocket = getBagPocketByItemId(itemId);
  if (!pocket) {
    return false;
  }

  if (
    pocket === 'tmCase'
    && !checkBagHasItem(bag, 'ITEM_TM_CASE', 1)
    && bag.pockets.keyItems.length >= getPocketCapacity('keyItems')
  ) {
    return false;
  }

  if (
    pocket === 'berryPouch'
    && !checkBagHasItem(bag, 'ITEM_BERRY_POUCH', 1)
    && bag.pockets.keyItems.length >= getPocketCapacity('keyItems')
  ) {
    return false;
  }

  const slot = bag.pockets[pocket].find((entry) => entry.itemId === itemId);
  if (slot) {
    return slot.quantity + count <= 999;
  }

  return bag.pockets[pocket].length < getPocketCapacity(pocket);
};

export const getBagAddFailureMessage = (bag: BagState, itemId: string, count: number): string | null => {
  if (checkBagHasSpace(bag, itemId, count)) {
    return null;
  }

  const pocket = getBagPocketByItemId(itemId) ?? 'items';
  if (
    (pocket === 'tmCase' && !checkBagHasItem(bag, 'ITEM_TM_CASE', 1))
    || (pocket === 'berryPouch' && !checkBagHasItem(bag, 'ITEM_BERRY_POUCH', 1))
  ) {
    return getBagFullMessage('keyItems');
  }

  return getBagFullMessage(pocket);
};

export const addBagItem = (bag: BagState, itemId: string, count: number): boolean => {
  const pocket = getBagPocketByItemId(itemId);
  if (!pocket || count < 1) {
    return false;
  }

  if (pocket === 'tmCase' && !checkBagHasItem(bag, 'ITEM_TM_CASE', 1)) {
    if (!addBagItem(bag, 'ITEM_TM_CASE', 1)) {
      return false;
    }
  }

  if (pocket === 'berryPouch' && !checkBagHasItem(bag, 'ITEM_BERRY_POUCH', 1)) {
    if (!addBagItem(bag, 'ITEM_BERRY_POUCH', 1)) {
      return false;
    }
  }

  const slot = bag.pockets[pocket].find((entry) => entry.itemId === itemId);
  if (slot) {
    if (slot.quantity + count > 999) {
      return false;
    }

    slot.quantity += count;
    sanitizeBagState(bag);
    return true;
  }

  if (bag.pockets[pocket].length >= getPocketCapacity(pocket)) {
    return false;
  }

  bag.pockets[pocket] = [...bag.pockets[pocket], { itemId, quantity: count }];
  sanitizeBagState(bag);
  return true;
};

export const removeBagItem = (bag: BagState, itemId: string, count: number): boolean => {
  const pocket = getBagPocketByItemId(itemId);
  if (!pocket || count < 1) {
    return false;
  }

  const index = bag.pockets[pocket].findIndex((entry) => entry.itemId === itemId);
  if (index < 0) {
    return false;
  }

  const slot = bag.pockets[pocket][index];
  if (slot.quantity < count) {
    return false;
  }

  slot.quantity -= count;
  if (slot.quantity === 0) {
    bag.pockets[pocket].splice(index, 1);
  }

  if (bag.registeredItemId === itemId && slot.quantity === 0) {
    bag.registeredItemId = null;
  }

  sanitizeBagState(bag);
  return true;
};

export const createBagPanelState = (returnToMenuOnClose = false): BagPanelState => ({
  kind: 'bag',
  id: 'BAG',
  title: 'BAG',
  description: 'Organize items by pocket.',
  contextMenu: null,
  quantityPrompt: null,
  confirmationPrompt: null,
  message: null,
  returnToMenuOnClose
});

export interface BagListEntry {
  itemId: string | null;
  label: string;
  quantity: number | null;
  iconKey: string | null;
  isExit: boolean;
  isRegistered: boolean;
}

export const getBagListEntries = (bag: BagState, pocket: BagPocketId): BagListEntry[] => {
  const slots = compactPocket(bag.pockets[pocket]);
  const rows: BagListEntry[] = slots.map((slot) => {
    const definition = getItemDefinition(slot.itemId);
    return {
      itemId: slot.itemId,
      label: definition.name,
      quantity: pocket === 'keyItems' || definition.importance !== 0 ? null : slot.quantity,
      iconKey: definition.iconKey,
      isExit: false,
      isRegistered: bag.registeredItemId === slot.itemId
    };
  });

  rows.push({
    itemId: null,
    label: 'CLOSE BAG',
    quantity: null,
    iconKey: null,
    isExit: true,
    isRegistered: false
  });

  return rows;
};

export const getBagVisibleRows = (
  bag: BagState
): Array<BagListEntry & { absoluteIndex: number; isSelected: boolean }> => {
  const pocket = bag.selectedPocket;
  const rows = getBagListEntries(bag, pocket);
  const selectedIndex = getSelectedAbsoluteIndex(bag, pocket);
  const scrollOffset = bag.scrollOffsetByPocket[pocket];
  const visibleCount = Math.min(rows.length, BAG_VISIBLE_ROWS);

  return rows.slice(scrollOffset, scrollOffset + visibleCount).map((row, index) => {
    const absoluteIndex = scrollOffset + index;
    return {
      ...row,
      absoluteIndex,
      isSelected: absoluteIndex === selectedIndex
    };
  });
};

export const getSelectedBagEntry = (bag: BagState): BagListEntry => {
  const rows = getBagListEntries(bag, bag.selectedPocket);
  return rows[getSelectedAbsoluteIndex(bag, bag.selectedPocket)] ?? rows.at(-1) ?? {
    itemId: null,
    label: 'CLOSE BAG',
    quantity: null,
    iconKey: null,
    isExit: true,
    isRegistered: false
  };
};

export const getBagDescription = (bag: BagState): string => {
  const entry = getSelectedBagEntry(bag);
  if (entry.isExit || !entry.itemId) {
    return 'CLOSE BAG';
  }

  return getItemDefinition(entry.itemId).description;
};

export const moveBagSelection = (bag: BagState, direction: -1 | 1): void => {
  const pocket = bag.selectedPocket;
  setSelectedAbsoluteIndex(bag, pocket, getSelectedAbsoluteIndex(bag, pocket) + direction);
};

export const switchBagPocket = (bag: BagState, direction: -1 | 1): void => {
  const pocketIndex = BAG_POCKET_ORDER.indexOf(bag.selectedPocket);
  const nextIndex = clamp(pocketIndex + direction, 0, BAG_POCKET_ORDER.length - 1);
  bag.selectedPocket = BAG_POCKET_ORDER[nextIndex];
  setSelectedAbsoluteIndex(bag, bag.selectedPocket, getSelectedAbsoluteIndex(bag, bag.selectedPocket));
};

const createBagContextActions = (bag: BagState, itemId: string): BagContextActionId[] => {
  const pocket = getBagPocketByItemId(itemId);
  if (!pocket) {
    return ['CANCEL'];
  }

  if (pocket === 'items') {
    return ['USE', 'GIVE', 'TOSS', 'CANCEL'];
  }

  if (pocket === 'keyItems') {
    const canRegister = getItemDefinition(itemId).registrability !== 0;
    if (itemId === 'ITEM_TM_CASE' || itemId === 'ITEM_BERRY_POUCH') {
      return canRegister
        ? ['OPEN', bag.registeredItemId === itemId ? 'DESELECT' : 'REGISTER', 'CANCEL']
        : ['OPEN', 'CANCEL'];
    }

    return canRegister
      ? ['USE', bag.registeredItemId === itemId ? 'DESELECT' : 'REGISTER', 'CANCEL']
      : ['USE', 'CANCEL'];
  }

  return ['GIVE', 'TOSS', 'CANCEL'];
};

const itemLabel = (itemId: string): string => getItemDefinition(itemId).name;

const selectPocketItem = (bag: BagState, pocket: BagPocketId, itemId: string): void => {
  const index = compactPocket(bag.pockets[pocket]).findIndex((slot) => slot.itemId === itemId);
  setSelectedAbsoluteIndex(bag, pocket, Math.max(0, index));
};

const openPocketForKeyItem = (panel: BagPanelState, bag: BagState, itemId: string): BagStepResult => {
  if (itemId === 'ITEM_TM_CASE') {
    bag.selectedPocket = 'tmCase';
    setSelectedAbsoluteIndex(bag, 'tmCase', getSelectedAbsoluteIndex(bag, 'tmCase'));
    closeSubmenu(panel);
    return { close: false, scriptId: 'menu.bag.open.tmCase' };
  }

  if (itemId === 'ITEM_BERRY_POUCH') {
    bag.selectedPocket = 'berryPouch';
    setSelectedAbsoluteIndex(bag, 'berryPouch', getSelectedAbsoluteIndex(bag, 'berryPouch'));
    closeSubmenu(panel);
    return { close: false, scriptId: 'menu.bag.open.berryPouch' };
  }

  return { close: false };
};

const useFieldItem = (panel: BagPanelState, bag: BagState, itemId: string, fromRegistered = false): BagStepResult => {
  const definition = getItemDefinition(itemId);
  const label = itemLabel(itemId);

  if (itemId === 'ITEM_TM_CASE' || itemId === 'ITEM_BERRY_POUCH') {
    return openPocketForKeyItem(panel, bag, itemId);
  }

  switch (definition.fieldUseFunc) {
    case 'FieldUseFunc_Bike':
      bag.bicycleActive = !bag.bicycleActive;
      openMessage(panel, bag.bicycleActive ? 'You got on the BICYCLE.' : 'You got off the BICYCLE.');
      return { close: false, scriptId: fromRegistered ? 'menu.bag.registered.bicycle' : 'menu.bag.use.bicycle' };
    case 'FieldUseFunc_TownMap':
      openMessage(panel, 'The TOWN MAP was opened.');
      return { close: false, scriptId: 'menu.bag.use.townMap' };
    case 'FieldUseFunc_FameChecker':
      openMessage(panel, 'The FAME CHECKER was opened.');
      return { close: false, scriptId: 'menu.bag.use.fameChecker' };
    case 'FieldUseFunc_TeachyTv':
      openMessage(panel, 'The TEACHY TV was turned on.');
      return { close: false, scriptId: 'menu.bag.use.teachyTv' };
    case 'FieldUseFunc_PokeFlute':
      openMessage(panel, 'Played the POKé FLUTE.');
      return { close: false, scriptId: 'menu.bag.use.pokeFlute' };
    case 'FieldUseFunc_CoinCase':
      openMessage(panel, 'Coins: 0');
      return { close: false, scriptId: 'menu.bag.use.coinCase' };
    case 'FieldUseFunc_PowderJar':
      openMessage(panel, 'Berry powder: 0');
      return { close: false, scriptId: 'menu.bag.use.powderJar' };
    case 'FieldUseFunc_Repel':
      removeBagItem(bag, itemId, 1);
      openMessage(panel, `${label} was used.`);
      return { close: false, scriptId: 'menu.bag.use.repel' };
    case 'FieldUseFunc_Mail':
      openMessage(panel, `${label} was read.`);
      return { close: false, scriptId: 'menu.bag.use.mail' };
    case 'FieldUseFunc_Medicine':
    case 'FieldUseFunc_Ether':
    case 'FieldUseFunc_PpUp':
    case 'FieldUseFunc_RareCandy':
    case 'FieldUseFunc_EvoItem':
    case 'FieldUseFunc_SacredAsh':
      openMessage(panel, 'There is no POKeMON.');
      return { close: false, scriptId: 'menu.bag.use.party.none' };
    default:
      openMessage(panel, `${label} can't be used now.`);
      return { close: false, scriptId: 'menu.bag.use.blocked' };
  }
};

export const useBagItemWithContext = (
  bag: BagState,
  itemId: string,
  context: BagUseContext
): BagOperationResult & { scriptId?: string } => {
  const definition = getItemDefinition(itemId);
  const label = itemLabel(itemId);

  if (!checkBagHasItem(bag, itemId, 1)) {
    return { ok: false, message: `${label} isn't in the BAG.`, scriptId: 'menu.bag.use.missing' };
  }

  if (context.location === 'battle') {
    return definition.battleUsage !== 0
      ? { ok: true, message: `${label} was selected.`, scriptId: 'battle.bag.item.handoff' }
      : { ok: false, message: `${label} can't be used now.`, scriptId: 'battle.bag.item.blocked' };
  }

  switch (definition.fieldUseFunc) {
    case 'FieldUseFunc_Bike':
      if (context.onCyclingRoad) {
        return { ok: false, message: "You can't dismount your BIKE here.", scriptId: 'menu.bag.use.bicycle.blocked' };
      }
      if (context.bikingAllowed === false || context.bikingDisallowedByPlayer === true) {
        return { ok: false, message: "OAK: There's a time and place for everything! But not now.", scriptId: 'menu.bag.use.blocked' };
      }
      bag.bicycleActive = !bag.bicycleActive;
      return {
        ok: true,
        message: bag.bicycleActive ? 'You got on the BICYCLE.' : 'You got off the BICYCLE.',
        scriptId: 'menu.bag.use.bicycle'
      };
    case 'FieldUseFunc_VsSeeker': {
      const allowed = context.mapType === 'route' || context.mapType === 'town' || context.mapType === 'city';
      return allowed
        ? { ok: true, message: 'The VS SEEKER was used.', scriptId: 'menu.bag.use.vsSeeker' }
        : { ok: false, message: "OAK: There's a time and place for everything! But not now.", scriptId: 'menu.bag.use.blocked' };
    }
    case 'FieldUseFunc_Repel':
      if ((context.repelStepsRemaining ?? 0) > 0) {
        return { ok: false, message: "But the effects of REPEL lingered from earlier.", scriptId: 'menu.bag.use.repel.lingered' };
      }
      removeBagItem(bag, itemId, 1);
      return { ok: true, message: `${label} was used.`, scriptId: 'menu.bag.use.repel' };
    case 'FieldUseFunc_Medicine':
    case 'FieldUseFunc_Ether':
    case 'FieldUseFunc_PpUp':
    case 'FieldUseFunc_RareCandy':
    case 'FieldUseFunc_EvoItem':
    case 'FieldUseFunc_SacredAsh':
      return context.hasParty === false
        ? { ok: false, message: 'There is no POKeMON.', scriptId: 'menu.bag.use.party.none' }
        : { ok: true, message: 'Choose a POKéMON.', scriptId: 'menu.bag.use.party' };
    case 'FieldUseFunc_TownMap':
      return { ok: true, message: 'The TOWN MAP was opened.', scriptId: 'menu.bag.use.townMap' };
    case 'FieldUseFunc_TeachyTv':
      return { ok: true, message: 'The TEACHY TV was turned on.', scriptId: 'menu.bag.use.teachyTv' };
    case 'FieldUseFunc_PokeFlute':
      return { ok: true, message: 'Played the POKé FLUTE.', scriptId: 'menu.bag.use.pokeFlute' };
    case 'FieldUseFunc_CoinCase':
      return { ok: true, message: 'Coins: 0', scriptId: 'menu.bag.use.coinCase' };
    case 'FieldUseFunc_PowderJar':
      return { ok: true, message: 'Berry powder: 0', scriptId: 'menu.bag.use.powderJar' };
    default:
      return { ok: false, message: `${label} can't be used now.`, scriptId: 'menu.bag.use.blocked' };
  }
};

export const createPcItemStorage = (slots: BagSlot[] = []): PcItemStorageState => ({
  slots: compactPocket(slots).slice(0, PC_ITEM_CAPACITY)
});

const compactPcStorage = (pc: PcItemStorageState): void => {
  pc.slots = compactPocket(pc.slots).slice(0, PC_ITEM_CAPACITY);
};

export const getPcItemQuantity = (pc: PcItemStorageState, itemId: string): number =>
  compactPocket(pc.slots).find((slot) => slot.itemId === itemId)?.quantity ?? 0;

const addPcItem = (pc: PcItemStorageState, itemId: string, count: number): boolean => {
  if (count < 1) return false;
  compactPcStorage(pc);
  const slot = pc.slots.find((entry) => entry.itemId === itemId);
  if (slot) {
    if (slot.quantity + count > 999) return false;
    slot.quantity += count;
    return true;
  }
  if (pc.slots.length >= PC_ITEM_CAPACITY) return false;
  pc.slots.push({ itemId, quantity: count });
  return true;
};

const removePcItem = (pc: PcItemStorageState, itemId: string, count: number): boolean => {
  compactPcStorage(pc);
  const slot = pc.slots.find((entry) => entry.itemId === itemId);
  if (!slot || count < 1 || slot.quantity < count) return false;
  slot.quantity -= count;
  compactPcStorage(pc);
  return true;
};

export const depositPcItem = (
  pc: PcItemStorageState,
  bag: BagState,
  itemId: string,
  count: number
): BagOperationResult => {
  if (!checkBagHasItem(bag, itemId, count)) {
    return { ok: false, message: `You don't have enough ${itemLabel(itemId)}.` };
  }
  if (!addPcItem(pc, itemId, count)) {
    return { ok: false, message: "The PC's item storage is full." };
  }
  removeBagItem(bag, itemId, count);
  return { ok: true, message: `${itemLabel(itemId)} was stored in the PC.` };
};

export const withdrawPcItem = (
  pc: PcItemStorageState,
  bag: BagState,
  itemId: string,
  count: number
): BagOperationResult => {
  if (getPcItemQuantity(pc, itemId) < count) {
    return { ok: false, message: `There aren't enough ${itemLabel(itemId)} in the PC.` };
  }
  const failure = getBagAddFailureMessage(bag, itemId, count);
  if (failure) {
    return { ok: false, message: failure };
  }
  removePcItem(pc, itemId, count);
  addBagItem(bag, itemId, count);
  return { ok: true, message: `${itemLabel(itemId)} was withdrawn.` };
};

export const tossPcItem = (pc: PcItemStorageState, itemId: string, count: number): BagOperationResult => {
  if (!removePcItem(pc, itemId, count)) {
    return { ok: false, message: `There aren't enough ${itemLabel(itemId)} in the PC.` };
  }
  return { ok: true, message: `${itemLabel(itemId)} was tossed away.` };
};

export const movePcItemSlot = (pc: PcItemStorageState, fromIndex: number, toIndex: number): boolean => {
  compactPcStorage(pc);
  if (fromIndex < 0 || fromIndex >= pc.slots.length || toIndex < 0 || toIndex >= pc.slots.length) return false;
  const [slot] = pc.slots.splice(fromIndex, 1);
  if (!slot) return false;
  pc.slots.splice(toIndex, 0, slot);
  return true;
};

export const buyShopItem = (
  state: { bag: BagState; money: number },
  itemId: string,
  quantity: number
): ShopOperationResult => {
  const price = getItemDefinition(itemId).price * quantity;
  if (state.money < price) {
    return { ok: false, money: state.money, message: "You don't have enough money." };
  }
  const failure = getBagAddFailureMessage(state.bag, itemId, quantity);
  if (failure) {
    return { ok: false, money: state.money, message: 'No more room for this item.' };
  }
  addBagItem(state.bag, itemId, quantity);
  return { ok: true, money: state.money - price, message: 'Here you go! Thank you!' };
};

export const sellShopItem = (
  state: { bag: BagState; money: number },
  itemId: string,
  quantity: number
): ShopOperationResult => {
  const definition = getItemDefinition(itemId);
  if (definition.price <= 0 || definition.importance !== 0) {
    return { ok: false, money: state.money, message: `${definition.name}? Oh, no.\nI can't buy that.` };
  }
  if (!checkBagHasItem(state.bag, itemId, quantity)) {
    return { ok: false, money: state.money, message: `You don't have enough ${definition.name}.` };
  }
  const total = Math.floor(definition.price / 2) * quantity;
  removeBagItem(state.bag, itemId, quantity);
  return { ok: true, money: state.money + total, message: `Turned over the ${definition.name}\nworth ¥${total}.` };
};

export const giveBagItemToPokemon = (
  bag: BagState,
  party: FieldPokemon[],
  partyIndex: number,
  itemId: string
): BagOperationResult => {
  const pokemon = party[partyIndex];
  const definition = getItemDefinition(itemId);
  if (!pokemon) return { ok: false, message: 'There is no POKeMON.' };
  if (definition.importance !== 0) return { ok: false, message: `${definition.name} can't be held.` };
  if (!removeBagItem(bag, itemId, 1)) return { ok: false, message: `${definition.name} isn't in the BAG.` };
  pokemon.heldItemId = itemId;
  return { ok: true, message: `${pokemon.nickname ?? pokemon.species} was given the\n${definition.name} to hold.` };
};

export const getBattleUsableBagEntries = (bag: BagState): BagSlot[] =>
  BAG_POCKET_ORDER.flatMap((pocket) => compactPocket(bag.pockets[pocket]))
    .filter((slot) => getItemDefinition(slot.itemId).battleUsage !== 0);

export const useRegisteredBagItem = (panel: BagPanelState, bag: BagState): BagStepResult => {
  sanitizeBagState(bag);
  const itemId = bag.registeredItemId;
  if (!itemId) {
    openMessage(panel, 'An item in the KEY ITEMS pocket may be registered for use with SELECT.');
    return { close: false, scriptId: 'menu.bag.registered.none' };
  }

  if (!checkBagHasItem(bag, itemId, 1)) {
    bag.registeredItemId = null;
    openMessage(panel, 'The registered item is gone.');
    return { close: false, scriptId: 'menu.bag.registered.missing' };
  }

  bag.selectedPocket = 'keyItems';
  selectPocketItem(bag, 'keyItems', itemId);
  return useFieldItem(panel, bag, itemId, true);
};

const openContextMenu = (panel: BagPanelState, bag: BagState): void => {
  const selectedEntry = getSelectedBagEntry(bag);
  if (!selectedEntry.itemId || selectedEntry.isExit) {
    return;
  }

  panel.contextMenu = {
    actions: createBagContextActions(bag, selectedEntry.itemId),
    itemId: selectedEntry.itemId,
    selectedIndex: 0
  };
};

const closeSubmenu = (panel: BagPanelState): void => {
  panel.contextMenu = null;
  panel.quantityPrompt = null;
  panel.confirmationPrompt = null;
  panel.message = null;
};

const openMessage = (panel: BagPanelState, text: string): void => {
  panel.contextMenu = null;
  panel.quantityPrompt = null;
  panel.confirmationPrompt = null;
  panel.message = { text };
};

const stepContextMenu = (
  panel: BagPanelState,
  bag: BagState,
  input: InputSnapshot
): BagStepResult => {
  const menu = panel.contextMenu;
  if (!menu) {
    return { close: false };
  }

  if (input.cancelPressed || input.startPressed) {
    panel.contextMenu = null;
    return { close: false, scriptId: 'menu.bag.context.close' };
  }

  if (input.upPressed) {
    menu.selectedIndex = clamp(menu.selectedIndex - 1, 0, menu.actions.length - 1);
    return { close: false, scriptId: 'menu.bag.context.move' };
  }

  if (input.downPressed) {
    menu.selectedIndex = clamp(menu.selectedIndex + 1, 0, menu.actions.length - 1);
    return { close: false, scriptId: 'menu.bag.context.move' };
  }

  if (!input.interactPressed) {
    return { close: false };
  }

  const selectedAction = menu.actions[menu.selectedIndex];
  if (selectedAction === 'CANCEL') {
    panel.contextMenu = null;
    return { close: false, scriptId: 'menu.bag.context.cancel' };
  }

  if (selectedAction === 'GIVE') {
    openMessage(panel, 'There is no POKeMON.');
    return { close: false, scriptId: 'menu.bag.give.none' };
  }

  if (selectedAction === 'REGISTER') {
    bag.registeredItemId = menu.itemId;
    openMessage(panel, `${itemLabel(menu.itemId)} was registered.`);
    return { close: false, scriptId: 'menu.bag.register' };
  }

  if (selectedAction === 'DESELECT') {
    bag.registeredItemId = null;
    openMessage(panel, `${itemLabel(menu.itemId)} was deselected.`);
    return { close: false, scriptId: 'menu.bag.deselect' };
  }

  if (selectedAction === 'OPEN') {
    return openPocketForKeyItem(panel, bag, menu.itemId);
  }

  if (selectedAction === 'USE') {
    return useFieldItem(panel, bag, menu.itemId);
  }

  const quantity = getBagQuantity(bag, menu.itemId);
  panel.contextMenu = null;
  if (quantity <= 1) {
    panel.quantityPrompt = null;
    panel.confirmationPrompt = {
      itemId: menu.itemId,
      quantity: 1,
      selectedIndex: 1
    };
  } else {
    panel.quantityPrompt = {
      itemId: menu.itemId,
      maxQuantity: quantity,
      quantity: 1
    };
  }

  return { close: false, scriptId: 'menu.bag.toss.prompt' };
};

const stepQuantityPrompt = (panel: BagPanelState, input: InputSnapshot): BagStepResult => {
  const prompt = panel.quantityPrompt;
  if (!prompt) {
    return { close: false };
  }

  if (input.cancelPressed || input.startPressed) {
    panel.quantityPrompt = null;
    return { close: false, scriptId: 'menu.bag.toss.cancel' };
  }

  const adjusted = adjustQuantityAccordingToDPadInput(prompt.quantity, prompt.maxQuantity, input);
  if (adjusted.changed) {
    prompt.quantity = adjusted.quantity;
    return { close: false, scriptId: 'menu.bag.toss.quantity' };
  }

  if (!input.interactPressed) {
    return { close: false };
  }

  panel.confirmationPrompt = {
    itemId: prompt.itemId,
    quantity: prompt.quantity,
    selectedIndex: 1
  };
  panel.quantityPrompt = null;
  return { close: false, scriptId: 'menu.bag.toss.confirm' };
};

const stepConfirmationPrompt = (
  panel: BagPanelState,
  bag: BagState,
  input: InputSnapshot
): BagStepResult => {
  const prompt = panel.confirmationPrompt;
  if (!prompt) {
    return { close: false };
  }

  if (input.cancelPressed || input.startPressed) {
    panel.confirmationPrompt = null;
    return { close: false, scriptId: 'menu.bag.toss.cancel' };
  }

  if (input.upPressed || input.downPressed) {
    prompt.selectedIndex = prompt.selectedIndex === 0 ? 1 : 0;
    return { close: false, scriptId: 'menu.bag.confirm.move' };
  }

  if (!input.interactPressed) {
    return { close: false };
  }

  if (prompt.selectedIndex === 1) {
    panel.confirmationPrompt = null;
    return { close: false, scriptId: 'menu.bag.toss.cancel' };
  }

  removeBagItem(bag, prompt.itemId, prompt.quantity);
  openMessage(panel, `${itemLabel(prompt.itemId)} was tossed away.`);
  return { close: false, scriptId: 'menu.bag.toss.ok' };
};

const stepMessage = (panel: BagPanelState, input: InputSnapshot): BagStepResult => {
  if (!panel.message) {
    return { close: false };
  }

  if (input.interactPressed || input.cancelPressed || input.startPressed) {
    panel.message = null;
    return { close: false, scriptId: 'menu.bag.message.close' };
  }

  return { close: false };
};

export const stepBagPanel = (
  panel: BagPanelState,
  bag: BagState,
  input: InputSnapshot
): BagStepResult => {
  sanitizeBagState(bag);

  if (panel.message) {
    return stepMessage(panel, input);
  }

  if (panel.confirmationPrompt) {
    return stepConfirmationPrompt(panel, bag, input);
  }

  if (panel.quantityPrompt) {
    return stepQuantityPrompt(panel, input);
  }

  if (panel.contextMenu) {
    return stepContextMenu(panel, bag, input);
  }

  if (input.cancelPressed || input.startPressed) {
    closeSubmenu(panel);
    return { close: true, scriptId: 'menu.panel.close.bag' };
  }

  if (input.leftPressed) {
    switchBagPocket(bag, -1);
    return { close: false, scriptId: 'menu.bag.pocket.left' };
  }

  if (input.rightPressed) {
    switchBagPocket(bag, 1);
    return { close: false, scriptId: 'menu.bag.pocket.right' };
  }

  if (input.upPressed) {
    moveBagSelection(bag, -1);
    return { close: false, scriptId: 'menu.bag.move' };
  }

  if (input.downPressed) {
    moveBagSelection(bag, 1);
    return { close: false, scriptId: 'menu.bag.move' };
  }

  if (input.selectPressed) {
    return useRegisteredBagItem(panel, bag);
  }

  if (!input.interactPressed) {
    return { close: false };
  }

  const selectedEntry = getSelectedBagEntry(bag);
  if (selectedEntry.isExit) {
    closeSubmenu(panel);
    return { close: true, scriptId: 'menu.panel.close.bag' };
  }

  openContextMenu(panel, bag);
  return { close: false, scriptId: 'menu.bag.context.open' };
};
