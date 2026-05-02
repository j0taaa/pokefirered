export interface MailboxPcWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface MailboxPcListMenuItem {
  label: string;
  index: number;
}

export interface MailboxPcListMenuTemplate {
  items: MailboxPcListMenuItem[];
  totalItems: number;
  windowId: number;
  header_X: number;
  item_X: number;
  cursor_X: number;
  lettersSpacing: number;
  itemVerticalPadding: number;
  maxShowed: number;
  fontId: number;
  upText_Y: number;
  cursorPal: number;
  fillValue: number;
  cursorShadowPal: number;
  moveCursorFunc: 'MoveCursorFunc';
  itemPrintFunc: 'ItemPrintFunc';
  cursorKind: number;
  scrollMultiple: number;
  cursorPos: number;
  itemsAbove: number;
}

export interface MailboxPcItemPageStruct {
  count: number;
  cursorPos: number;
  itemsAbove: number;
  pageItems: number;
  scrollIndicatorId?: number;
}

export interface MailboxPcState {
  windowIds: number[];
  listMenuItems: MailboxPcListMenuItem[] | null;
  nextWindowId: number;
  lastListMenuTemplate: MailboxPcListMenuTemplate | null;
  playedSelectSeCount: number;
  mailPlayerNames: string[];
  printedText: Array<{ windowId: number; x: number; y: number; text: string }>;
}

export const MAILBOX_PC_WINDOW_TEMPLATES: readonly MailboxPcWindowTemplate[] = [
  {
    bg: 0,
    tilemapLeft: 1,
    tilemapTop: 1,
    width: 10,
    height: 2,
    paletteNum: 15,
    baseBlock: 0x008
  },
  {
    bg: 0,
    tilemapLeft: 19,
    tilemapTop: 1,
    width: 10,
    height: 18,
    paletteNum: 15,
    baseBlock: 0x01c
  },
  {
    bg: 0,
    tilemapLeft: 1,
    tilemapTop: 1,
    width: 15,
    height: 8,
    paletteNum: 15,
    baseBlock: 0x01c
  }
] as const;

export const MAILBOX_PC_TEXT_COLOR = [1, 2, 3] as const;
export const MAILBOX_PC_DUMMY_STRING = '';
export const MAILBOX_PC_CANCEL_LABEL = 'CANCEL';
export const MAILBOX_PC_CANCEL_INDEX = -2;

export const createMailboxPcState = (): MailboxPcState => ({
  windowIds: [0xff, 0xff, 0xff],
  listMenuItems: null,
  nextWindowId: 0,
  lastListMenuTemplate: null,
  playedSelectSeCount: 0,
  mailPlayerNames: [],
  printedText: []
});

export const mailboxPcInitBuffers = (
  state: MailboxPcState,
  num: number
): boolean => {
  if (num < 0 || !Number.isFinite(num)) {
    state.listMenuItems = null;
    return false;
  }

  state.listMenuItems = Array.from({ length: Math.trunc(num) + 1 }, () => ({
    label: MAILBOX_PC_DUMMY_STRING,
    index: 0
  }));
  for (let i = 0; i < state.windowIds.length; i += 1) {
    state.windowIds[i] = 0xff;
  }
  return true;
};

export const mailboxPcGetAddWindow = (
  state: MailboxPcState,
  winIdx: number
): number => {
  const index = Math.trunc(winIdx);
  if (state.windowIds[index] === 0xff) {
    state.windowIds[index] = state.nextWindowId & 0xff;
    state.nextWindowId = (state.nextWindowId + 1) & 0xff;
  }
  return state.windowIds[index] ?? 0xff;
};

export const mailboxPcRemoveWindow = (
  state: MailboxPcState,
  winIdx: number
): void => {
  state.windowIds[Math.trunc(winIdx)] = 0xff;
};

export const mailboxPcGetWindowId = (
  state: MailboxPcState,
  winIdx: number
): number => state.windowIds[Math.trunc(winIdx)] ?? 0xff;

export const mailboxPcInitListMenu = (
  state: MailboxPcState,
  playerPcStruct: MailboxPcItemPageStruct
): number => {
  if (!state.listMenuItems) {
    state.listMenuItems = Array.from({ length: playerPcStruct.count + 1 }, () => ({
      label: MAILBOX_PC_DUMMY_STRING,
      index: 0
    }));
  }

  let i = 0;
  for (; i < playerPcStruct.count; i += 1) {
    state.listMenuItems[i] = {
      label: MAILBOX_PC_DUMMY_STRING,
      index: i
    };
  }
  state.listMenuItems[i] = {
    label: MAILBOX_PC_CANCEL_LABEL,
    index: MAILBOX_PC_CANCEL_INDEX
  };

  state.lastListMenuTemplate = {
    items: state.listMenuItems.slice(0, playerPcStruct.count + 1),
    totalItems: playerPcStruct.count + 1,
    windowId: state.windowIds[1],
    header_X: 0,
    item_X: 8,
    cursor_X: 0,
    lettersSpacing: 0,
    itemVerticalPadding: 2,
    maxShowed: 8,
    fontId: 1,
    upText_Y: 10,
    cursorPal: 2,
    fillValue: 1,
    cursorShadowPal: 3,
    moveCursorFunc: 'MoveCursorFunc',
    itemPrintFunc: 'ItemPrintFunc',
    cursorKind: 0,
    scrollMultiple: 0,
    cursorPos: playerPcStruct.cursorPos,
    itemsAbove: playerPcStruct.itemsAbove
  };

  return playerPcStruct.cursorPos;
};

export const mailboxPcMoveCursorFunc = (
  state: MailboxPcState,
  onInit: boolean
): void => {
  if (onInit !== true) {
    state.playedSelectSeCount += 1;
  }
};

export const mailboxPcAddScrollIndicatorArrows = (
  playerPcStruct: MailboxPcItemPageStruct
): number => {
  const max = playerPcStruct.count - playerPcStruct.pageItems + 1;
  playerPcStruct.scrollIndicatorId = 110;
  return max;
};

export const mailboxPcDestroyListMenuBuffer = (state: MailboxPcState): void => {
  state.listMenuItems = null;
};

export function MailboxPC_InitBuffers(state: MailboxPcState, num: number): boolean {
  return mailboxPcInitBuffers(state, num);
}

export function MailboxPC_GetAddWindow(state: MailboxPcState, winIdx: number): number {
  return mailboxPcGetAddWindow(state, winIdx);
}

export function MailboxPC_RemoveWindow(state: MailboxPcState, winIdx: number): void {
  mailboxPcRemoveWindow(state, winIdx);
}

export function MailboxPC_GetWindowId(state: MailboxPcState, winIdx: number): number {
  return mailboxPcGetWindowId(state, winIdx);
}

export function ItemPrintFunc(
  state: MailboxPcState,
  windowId: number,
  itemId: number,
  y: number
): void {
  if (itemId !== MAILBOX_PC_CANCEL_INDEX) {
    const text = state.mailPlayerNames[Math.trunc(itemId)] ?? '';
    state.printedText.push({ windowId, x: 8, y, text });
  }
}

export function MailboxPC_InitListMenu(
  state: MailboxPcState,
  playerPcStruct: MailboxPcItemPageStruct
): number {
  return mailboxPcInitListMenu(state, playerPcStruct);
}

export function MoveCursorFunc(
  state: MailboxPcState,
  _itemIndex: number,
  onInit: boolean
): void {
  mailboxPcMoveCursorFunc(state, onInit);
}

export function MailboxPC_AddScrollIndicatorArrows(
  playerPcStruct: MailboxPcItemPageStruct
): number {
  return mailboxPcAddScrollIndicatorArrows(playerPcStruct);
}

export function MailboxPC_DestroyListMenuBuffer(state: MailboxPcState): void {
  mailboxPcDestroyListMenuBuffer(state);
}
