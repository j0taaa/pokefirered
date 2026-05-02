import type { InputSnapshot } from '../input/inputState';
import rawItemData from '../../../src/data/items.json';
import { adjustQuantityAccordingToDPadInput } from './decompMenuHelpers';

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
  registeredItemId: null
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

  return candidate.registeredItemId === null || typeof candidate.registeredItemId === 'string';
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
    if (itemId === 'ITEM_TM_CASE' || itemId === 'ITEM_BERRY_POUCH') {
      return ['OPEN', bag.registeredItemId === itemId ? 'DESELECT' : 'REGISTER', 'CANCEL'];
    }

    return ['USE', bag.registeredItemId === itemId ? 'DESELECT' : 'REGISTER', 'CANCEL'];
  }

  return ['GIVE', 'TOSS', 'CANCEL'];
};

const itemLabel = (itemId: string): string => getItemDefinition(itemId).name;

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
    openMessage(panel, `${itemLabel(menu.itemId)} is not available in this port yet.`);
    return { close: false, scriptId: 'menu.bag.open.unsupported' };
  }

  if (selectedAction === 'USE') {
    openMessage(panel, `${itemLabel(menu.itemId)} can't be used now.`);
    return { close: false, scriptId: 'menu.bag.use.unsupported' };
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
