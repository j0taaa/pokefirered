import {
  AddBagItem,
  AddPCItem,
  ClearPCItemSlots,
  CountItemsInPC,
  ITEM_NONE,
  ITEM_POTION,
  type ItemRuntime,
  type ItemSlot
} from './decompItem';

export const PARTY_SIZE = 6;
export const MAIL_COUNT = PARTY_SIZE + 10;
export const PC_MAIL_NUM = (i: number): number => PARTY_SIZE + i;

export const PC_ITEM_ID = 0;
export const PC_QUANTITY = 1;

export const MENU_NOTHING_CHOSEN = -2;
export const MENU_B_PRESSED = -1;
export const LIST_NOTHING_CHOSEN = -1;
export const LIST_CANCEL = -2;

export const A_BUTTON = 1;
export const B_BUTTON = 2;
export const DPAD_UP = 0x40;
export const DPAD_DOWN = 0x80;

export const HELPCONTEXT_PLAYERS_PC_ITEMS = 29;
export const HELPCONTEXT_PLAYERS_PC_MAILBOX = 30;
export const HELPCONTEXT_BEDROOM_PC_ITEMS = 33;
export const HELPCONTEXT_BEDROOM_PC_MAILBOX = 34;
export const ITEMMENULOCATION_ITEMPC = 3;
export const OPEN_BAG_ITEMS = 0;

export interface PlayerPcMail {
  itemId: number;
  playerName: string;
  words: number[];
}

export interface PlayerPCItemPageStruct {
  itemsAbove: number;
  cursorPos: number;
  pageItems: number;
  count: number;
  notInRoom: boolean;
  scrollIndicatorId: number;
}

export type PlayerPcTaskFunc =
  | 'TaskDummy'
  | 'Task_DrawPlayerPcTopMenu'
  | 'Task_TopMenuHandleInput'
  | 'Task_PlayerPcItemStorage'
  | 'Task_PlayerPcMailbox'
  | 'Task_PlayerPcTurnOff'
  | 'Task_TopMenu_ItemStorageSubmenu_HandleInput'
  | 'Task_PlayerPcDepositItem'
  | 'Task_DepositItem_WaitFadeAndGoToBag'
  | 'Task_ReturnToItemStorageSubmenu'
  | 'Task_PlayerPcWithdrawItem'
  | 'Task_WithdrawItemBeginFade'
  | 'Task_WithdrawItem_WaitFadeAndGoToItemStorage'
  | 'Task_PlayerPcCancel'
  | 'Task_ReturnToTopMenu'
  | 'Task_DrawMailboxPcMenu'
  | 'Task_MailboxPcHandleInput'
  | 'Task_PrintWhatToDoWithSelectedMail'
  | 'Task_DestroyMailboxPcViewAndCancel'
  | 'Task_DrawMailSubmenu'
  | 'Task_MailSubmenuHandleInput'
  | 'Task_PlayerPcReadMail'
  | 'Task_WaitFadeAndReadSelectedMail'
  | 'Task_WaitFadeAndReturnToMailboxPcInputHandler'
  | 'Task_PlayerPcMoveMailToBag'
  | 'Task_DrawYesNoMenuToConfirmMoveToBag'
  | 'Task_MoveToBagYesNoMenuHandleInput'
  | 'Task_TryPutMailInBag_DestroyMsgIfSuccessful'
  | 'Task_DeclinedMoveMailToBag'
  | 'Task_PlayerPcGiveMailToMon'
  | 'Task_WaitFadeAndGoToPartyMenu'
  | 'Task_Error_NoPokemon'
  | 'Task_RedrawPlayerPcMailboxAndSetUpInputHandler'
  | 'Task_PlayerPcExitMailSubmenu';

export interface PlayerPcTask {
  func: PlayerPcTaskFunc;
  data: number[];
  destroyed: boolean;
}

export interface PlayerPcRuntime extends Omit<ItemRuntime, 'gSaveBlock1Ptr'> {
  gSaveBlock1Ptr: ItemRuntime['gSaveBlock1Ptr'] & {
    mail: PlayerPcMail[];
  };
  sItemOrder: number[] | null;
  sTopMenuItemCount: number;
  gPlayerPcMenuManager: PlayerPCItemPageStruct;
  tasks: Array<PlayerPcTask | null>;
  operations: string[];
  helpContext: number | null;
  backedUpHelpContext: boolean;
  gPaletteFade: { active: boolean };
  gFieldCallback: string | null;
  mainCallback2: string | null;
  scriptContextEnabled: boolean;
  setupScript: string | null;
  menuInputQueue: number[];
  menuCursorPos: number;
  joyNew: number;
  joyRepeat: number;
  listMenuInputQueue: number[];
  listMenuScrollRows: Array<{ cursorPos: number; itemsAbove: number }>;
  yesNoInputQueue: number[];
  mailboxInitBuffersSucceeds: boolean;
  weatherNotFadingIn: boolean;
  partyCount: number;
}

export const createPlayerPcRuntime = (base: ItemRuntime, overrides: Partial<PlayerPcRuntime> = {}): PlayerPcRuntime =>
  Object.assign(base, {
    sItemOrder: null,
    sTopMenuItemCount: 0,
    gPlayerPcMenuManager: {
      itemsAbove: 0,
      cursorPos: 0,
      pageItems: 0,
      count: 0,
      notInRoom: false,
      scrollIndicatorId: 0
    },
    tasks: [],
    operations: [],
    helpContext: null,
    backedUpHelpContext: false,
    gPaletteFade: { active: false },
    gFieldCallback: null,
    mainCallback2: null,
    scriptContextEnabled: false,
    setupScript: null,
    menuInputQueue: [],
    menuCursorPos: 0,
    joyNew: 0,
    joyRepeat: 0,
    listMenuInputQueue: [],
    listMenuScrollRows: [],
    yesNoInputQueue: [],
    mailboxInitBuffersSucceeds: true,
    weatherNotFadingIn: true,
    partyCount: 0,
    ...overrides,
    gSaveBlock1Ptr: {
      ...base.gSaveBlock1Ptr,
      mail: Array.from({ length: MAIL_COUNT }, () => ({ itemId: ITEM_NONE, playerName: '', words: [] })),
      ...overrides.gSaveBlock1Ptr
    }
  }) as PlayerPcRuntime;

export const NEW_GAME_PC_ITEMS: ItemSlot[] = [
  { itemId: ITEM_POTION, quantity: 1 },
  { itemId: ITEM_NONE, quantity: 0 }
];

const TOP_ACTIONS: PlayerPcTaskFunc[] = [
  'Task_PlayerPcItemStorage',
  'Task_PlayerPcMailbox',
  'Task_PlayerPcTurnOff'
];
const ITEM_PC_ACTIONS: PlayerPcTaskFunc[] = [
  'Task_PlayerPcWithdrawItem',
  'Task_PlayerPcDepositItem',
  'Task_PlayerPcCancel'
];
const MAIL_ACTIONS: PlayerPcTaskFunc[] = [
  'Task_PlayerPcReadMail',
  'Task_PlayerPcMoveMailToBag',
  'Task_PlayerPcGiveMailToMon',
  'Task_PlayerPcExitMailSubmenu'
];

const selectedMail = (runtime: PlayerPcRuntime): PlayerPcMail =>
  runtime.gSaveBlock1Ptr.mail[PC_MAIL_NUM(runtime.gPlayerPcMenuManager.cursorPos) + runtime.gPlayerPcMenuManager.itemsAbove] as PlayerPcMail;

export const CreateTask = (runtime: PlayerPcRuntime, func: PlayerPcTaskFunc): number => {
  const reused = runtime.tasks.findIndex((task) => task === null);
  const id = reused === -1 ? runtime.tasks.length : reused;
  runtime.tasks[id] = { func, data: Array.from({ length: 16 }, () => 0), destroyed: false };
  runtime.operations.push(`CreateTask:${func}:${id}`);
  return id;
};

export const DestroyTask = (runtime: PlayerPcRuntime, taskId: number): void => {
  if (runtime.tasks[taskId]) {
    runtime.tasks[taskId]!.destroyed = true;
    runtime.tasks[taskId] = null;
  }
  runtime.operations.push(`DestroyTask:${taskId}`);
};

const setTaskFunc = (runtime: PlayerPcRuntime, taskId: number, func: PlayerPcTaskFunc): void => {
  if (runtime.tasks[taskId]) {
    runtime.tasks[taskId]!.func = func;
  }
};

const displayItemMessageOnField = (runtime: PlayerPcRuntime, taskId: number, text: string, next: PlayerPcTaskFunc): void => {
  runtime.operations.push(`DisplayItemMessageOnField:${taskId}:${text}:${next}`);
  setTaskFunc(runtime, taskId, next);
};

const addWindow = (runtime: PlayerPcRuntime, template: string): number => {
  const id = runtime.operations.filter((op) => op.startsWith('AddWindow')).length;
  runtime.operations.push(`AddWindow:${template}:${id}`);
  return id;
};

const cleanupWindow = (runtime: PlayerPcRuntime, windowId: number): void => {
  runtime.operations.push(`ClearStdWindowAndFrameToTransparent:${windowId}`, `ClearWindowTilemap:${windowId}`, `RemoveWindow:${windowId}`, 'ScheduleBgCopyTilemapToVram:0');
};

const menuProcessInputNoWrapAround = (runtime: PlayerPcRuntime): number =>
  runtime.menuInputQueue.length ? runtime.menuInputQueue.shift()! : MENU_NOTHING_CHOSEN;

const menuProcessInputOther = menuProcessInputNoWrapAround;
const menuProcessInputNoWrapClearOnChoose = (runtime: PlayerPcRuntime): number =>
  runtime.yesNoInputQueue.length ? runtime.yesNoInputQueue.shift()! : MENU_NOTHING_CHOSEN;

const playSelect = (runtime: PlayerPcRuntime): void => {
  runtime.operations.push('PlaySE:SE_SELECT');
};

export const NewGameInitPCItems = (runtime: PlayerPcRuntime): void => {
  ClearPCItemSlots(runtime);
  for (let i = 0; NEW_GAME_PC_ITEMS[i].itemId && NEW_GAME_PC_ITEMS[i].quantity && AddPCItem(runtime, NEW_GAME_PC_ITEMS[i].itemId, NEW_GAME_PC_ITEMS[i].quantity) === true; i += 1) {
    // Empty loop body, matching the C for-loop.
  }
};

export const BedroomPC = (runtime: PlayerPcRuntime): number => {
  runtime.gPlayerPcMenuManager.notInRoom = false;
  runtime.backedUpHelpContext = true;
  runtime.sItemOrder = [0, 1, 2];
  runtime.sTopMenuItemCount = 3;
  const taskId = CreateTask(runtime, 'TaskDummy');
  displayItemMessageOnField(runtime, taskId, 'What would you like to do?', 'Task_DrawPlayerPcTopMenu');
  return taskId;
};

export const PlayerPC = (runtime: PlayerPcRuntime): number => {
  runtime.gPlayerPcMenuManager.notInRoom = true;
  runtime.backedUpHelpContext = true;
  runtime.sItemOrder = [0, 1, 2];
  runtime.sTopMenuItemCount = 3;
  const taskId = CreateTask(runtime, 'TaskDummy');
  displayItemMessageOnField(runtime, taskId, 'What would you like to do?', 'Task_DrawPlayerPcTopMenu');
  return taskId;
};

export const Task_DrawPlayerPcTopMenu = (runtime: PlayerPcRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId]!;
  task.data[10] = addWindow(runtime, runtime.sTopMenuItemCount === 3 ? 'TopMenu3' : 'TopMenu4');
  runtime.operations.push('SetStdWindowBorderStyle', `AddItemMenuActionTextPrinters:${runtime.sTopMenuItemCount}`, 'Menu_InitCursor:0', 'ScheduleBgCopyTilemapToVram:0');
  task.func = 'Task_TopMenuHandleInput';
};

export const Task_TopMenuHandleInput = (runtime: PlayerPcRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId]!;
  const input = menuProcessInputNoWrapAround(runtime);
  switch (input) {
    case MENU_NOTHING_CHOSEN:
      break;
    case MENU_B_PRESSED:
      playSelect(runtime);
      cleanupWindow(runtime, task.data[10]);
      task.func = 'Task_PlayerPcTurnOff';
      break;
    default:
      cleanupWindow(runtime, task.data[10]);
      task.func = TOP_ACTIONS[runtime.sItemOrder![input]];
      break;
  }
};

export const Task_ReturnToTopMenu = (runtime: PlayerPcRuntime, taskId: number): void => {
  runtime.operations.push('RestoreHelpContext');
  displayItemMessageOnField(runtime, taskId, 'What would you like to do?', 'Task_DrawPlayerPcTopMenu');
};

export const Task_PlayerPcItemStorage = (runtime: PlayerPcRuntime, taskId: number): void => {
  Task_CreateItemStorageSubmenu(runtime, taskId, 0);
  setTaskFunc(runtime, taskId, 'Task_TopMenu_ItemStorageSubmenu_HandleInput');
};

export const Task_CreateItemStorageSubmenu = (runtime: PlayerPcRuntime, taskId: number, cursorPos: number): void => {
  const task = runtime.tasks[taskId]!;
  runtime.helpContext = runtime.gPlayerPcMenuManager.notInRoom === false ? HELPCONTEXT_BEDROOM_PC_ITEMS : HELPCONTEXT_PLAYERS_PC_ITEMS;
  task.data[10] = addWindow(runtime, 'ItemStorageSubmenu');
  runtime.menuCursorPos = cursorPos;
  runtime.operations.push('SetStdWindowBorderStyle', 'PrintTextArray:ItemPc:3', `Menu_InitCursor:${cursorPos}`, 'ScheduleBgCopyTilemapToVram:0');
  PrintStringOnWindow0WithDialogueFrame(runtime, ['Take out items from the PC', 'Store items in the PC', 'Go back to the previous menu'][cursorPos]);
};

export const PrintStringOnWindow0WithDialogueFrame = (runtime: PlayerPcRuntime, text: string): void => {
  runtime.operations.push(`DrawDialogueFrame:0`, `AddTextPrinterParameterized:0:${text}`);
};

export const Task_TopMenu_ItemStorageSubmenu_HandleInput = (runtime: PlayerPcRuntime, taskId: number): void => {
  if ((runtime.joyRepeat & DPAD_UP) !== 0) {
    if (runtime.menuCursorPos !== 0) {
      playSelect(runtime);
      runtime.menuCursorPos -= 1;
      PrintStringOnWindow0WithDialogueFrame(runtime, ['Take out items from the PC', 'Store items in the PC', 'Go back to the previous menu'][runtime.menuCursorPos]);
    }
  } else if ((runtime.joyRepeat & DPAD_DOWN) !== 0) {
    if (runtime.menuCursorPos !== 2) {
      playSelect(runtime);
      runtime.menuCursorPos += 1;
      PrintStringOnWindow0WithDialogueFrame(runtime, ['Take out items from the PC', 'Store items in the PC', 'Go back to the previous menu'][runtime.menuCursorPos]);
    }
  } else if ((runtime.joyNew & A_BUTTON) !== 0) {
    playSelect(runtime);
    RunPlayerPcTask(runtime, taskId, ITEM_PC_ACTIONS[runtime.menuCursorPos]);
  } else if ((runtime.joyNew & B_BUTTON) !== 0) {
    playSelect(runtime);
    RunPlayerPcTask(runtime, taskId, ITEM_PC_ACTIONS[2]);
  }
};

export const Task_PlayerPcDepositItem = (runtime: PlayerPcRuntime, taskId: number): void => {
  setTaskFunc(runtime, taskId, 'Task_DepositItem_WaitFadeAndGoToBag');
  runtime.gPaletteFade.active = true;
  runtime.operations.push('FadeScreen:FADE_TO_BLACK');
};

export const Task_DepositItem_WaitFadeAndGoToBag = (runtime: PlayerPcRuntime, taskId: number): void => {
  if (!runtime.gPaletteFade.active) {
    runtime.operations.push('CleanupOverworldWindowsAndTilemaps', `GoToBagMenu:${ITEMMENULOCATION_ITEMPC}:${OPEN_BAG_ITEMS}:CB2_ReturnToField`);
    runtime.gFieldCallback = 'CB2_ReturnFromDepositMenu';
    DestroyTask(runtime, taskId);
  }
};

export const CB2_ReturnFromDepositMenu = (runtime: PlayerPcRuntime): number => {
  runtime.operations.push('LoadStdWindowFrameGfx', 'DrawDialogueFrame:0');
  const taskId = CreateTask(runtime, 'Task_ReturnToItemStorageSubmenu');
  Task_CreateItemStorageSubmenu(runtime, taskId, 1);
  runtime.operations.push('FadeInFromBlack');
  return taskId;
};

export const Task_ReturnToItemStorageSubmenu = (runtime: PlayerPcRuntime, taskId: number): void => {
  if (runtime.weatherNotFadingIn) {
    setTaskFunc(runtime, taskId, 'Task_TopMenu_ItemStorageSubmenu_HandleInput');
  }
};

export const Task_PlayerPcWithdrawItem = (runtime: PlayerPcRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId]!;
  task.data[2] = CountItemsInPC(runtime);
  if (task.data[2] !== 0) {
    task.data[6] = 0;
    task.func = 'Task_WithdrawItemBeginFade';
    runtime.gFieldCallback = 'CB2_ReturnFromWithdrawMenu';
  } else {
    cleanupWindow(runtime, task.data[10]);
    displayItemMessageOnField(runtime, taskId, 'There are no items.', 'Task_PlayerPcItemStorage');
  }
};

export const Task_WithdrawItemBeginFade = (runtime: PlayerPcRuntime, taskId: number): void => {
  setTaskFunc(runtime, taskId, 'Task_WithdrawItem_WaitFadeAndGoToItemStorage');
  runtime.operations.push('ItemPc_SetInitializedFlag:false', 'FadeScreen:FADE_TO_BLACK');
  runtime.gPaletteFade.active = true;
};

export const Task_WithdrawItem_WaitFadeAndGoToItemStorage = (runtime: PlayerPcRuntime, taskId: number): void => {
  if (!runtime.gPaletteFade.active) {
    runtime.operations.push('CleanupOverworldWindowsAndTilemaps', `ItemPc_Init:${runtime.tasks[taskId]!.data[6]}:CB2_ReturnToField`);
    DestroyTask(runtime, taskId);
  }
};

export const CB2_ReturnFromWithdrawMenu = (runtime: PlayerPcRuntime): number => {
  runtime.operations.push('LoadStdWindowFrameGfx', 'DrawDialogueFrame:0');
  const taskId = CreateTask(runtime, 'Task_ReturnToItemStorageSubmenu');
  Task_CreateItemStorageSubmenu(runtime, taskId, 0);
  runtime.operations.push('FadeInFromBlack');
  return taskId;
};

export const Task_PlayerPcCancel = (runtime: PlayerPcRuntime, taskId: number): void => {
  cleanupWindow(runtime, runtime.tasks[taskId]!.data[10]);
  runtime.operations.push('CopyWindowToVram:COPYWIN_MAP');
  Task_ReturnToTopMenu(runtime, taskId);
};

export const Task_SetPageItemVars = (runtime: PlayerPcRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId]!;
  task.data[4] = task.data[2] >= 8 ? 8 : task.data[2] + 1;
  runtime.gPlayerPcMenuManager.pageItems = runtime.gPlayerPcMenuManager.count >= 8 ? 8 : runtime.gPlayerPcMenuManager.count + 1;
};

export const CountPCMail = (runtime: PlayerPcRuntime): number => {
  let count = 0;
  for (let i = PC_MAIL_NUM(0); i < MAIL_COUNT; i += 1) {
    if ((runtime.gSaveBlock1Ptr.mail[i] as PlayerPcMail).itemId !== ITEM_NONE) {
      count += 1;
    }
  }
  return count;
};

export const PCMailCompaction = (runtime: PlayerPcRuntime): void => {
  for (let i = PC_MAIL_NUM(0); i < MAIL_COUNT - 1; i += 1) {
    for (let j = i + 1; j < MAIL_COUNT; j += 1) {
      if ((runtime.gSaveBlock1Ptr.mail[i] as PlayerPcMail).itemId === ITEM_NONE) {
        const mail = runtime.gSaveBlock1Ptr.mail[i];
        runtime.gSaveBlock1Ptr.mail[i] = runtime.gSaveBlock1Ptr.mail[j];
        runtime.gSaveBlock1Ptr.mail[j] = mail;
      }
    }
  }
};

export const Task_PlayerPcMailbox = (runtime: PlayerPcRuntime, taskId: number): void => {
  runtime.gPlayerPcMenuManager.count = CountPCMail(runtime);
  if (runtime.gPlayerPcMenuManager.count === 0) {
    displayItemMessageOnField(runtime, taskId, "There's no mail here.", 'Task_ReturnToTopMenu');
    return;
  }
  runtime.gPlayerPcMenuManager.itemsAbove = 0;
  runtime.gPlayerPcMenuManager.cursorPos = 0;
  PCMailCompaction(runtime);
  Task_SetPageItemVars(runtime, taskId);
  runtime.helpContext = runtime.gPlayerPcMenuManager.notInRoom === false ? HELPCONTEXT_BEDROOM_PC_MAILBOX : HELPCONTEXT_PLAYERS_PC_MAILBOX;
  if (runtime.mailboxInitBuffersSucceeds) {
    runtime.operations.push(`MailboxPC_InitBuffers:${runtime.gPlayerPcMenuManager.count}`, 'ClearDialogWindowAndFrame:0');
    Task_DrawMailboxPcMenu(runtime, taskId);
    setTaskFunc(runtime, taskId, 'Task_MailboxPcHandleInput');
  } else {
    displayItemMessageOnField(runtime, taskId, "There's no mail here.", 'Task_ReturnToTopMenu');
  }
};

export const Task_PlayerPcTurnOff = (runtime: PlayerPcRuntime, taskId: number): void => {
  if (runtime.gPlayerPcMenuManager.notInRoom === false) {
    runtime.setupScript = 'EventScript_PalletTown_PlayersHouse_2F_ShutDownPC';
  } else {
    runtime.scriptContextEnabled = true;
  }
  DestroyTask(runtime, taskId);
};

export const Task_DrawMailboxPcMenu = (runtime: PlayerPcRuntime, taskId: number): void => {
  runtime.operations.push('MailboxPC_GetAddWindow:0', 'MailboxPC_GetAddWindow:1', 'AddTextPrinterParameterized:Mailbox', 'ScheduleBgCopyTilemapToVram:0');
  runtime.tasks[taskId]!.data[11] = 1;
  runtime.operations.push('MailboxPC_InitListMenu', 'MailboxPC_AddScrollIndicatorArrows');
};

export const Task_MailboxPcHandleInput = (runtime: PlayerPcRuntime, taskId: number): void => {
  if (runtime.gPaletteFade.active) {
    return;
  }
  const input = runtime.listMenuInputQueue.length ? runtime.listMenuInputQueue.shift()! : LIST_NOTHING_CHOSEN;
  const scroll = runtime.listMenuScrollRows.shift();
  if (scroll) {
    runtime.gPlayerPcMenuManager.cursorPos = scroll.cursorPos;
    runtime.gPlayerPcMenuManager.itemsAbove = scroll.itemsAbove;
  }
  switch (input) {
    case LIST_NOTHING_CHOSEN:
      break;
    case LIST_CANCEL:
      playSelect(runtime);
      runtime.operations.push(`RemoveScrollIndicatorArrowPair:${runtime.gPlayerPcMenuManager.scrollIndicatorId}`);
      Task_DestroyMailboxPcViewAndCancel(runtime, taskId);
      break;
    default:
      playSelect(runtime);
      runtime.operations.push('MailboxPC_RemoveWindow:0', 'MailboxPC_RemoveWindow:1', 'DestroyListMenuTask', 'ScheduleBgCopyTilemapToVram:0', `RemoveScrollIndicatorArrowPair:${runtime.gPlayerPcMenuManager.scrollIndicatorId}`);
      setTaskFunc(runtime, taskId, 'Task_PrintWhatToDoWithSelectedMail');
      break;
  }
};

export const Task_PrintWhatToDoWithSelectedMail = (runtime: PlayerPcRuntime, taskId: number): void => {
  let name = selectedMail(runtime).playerName;
  if (name.length > 5) {
    name = name.replace(/\0+$/u, '');
  } else {
    name = `${name}<JP>`;
  }
  displayItemMessageOnField(runtime, taskId, `What would you like to do with ${name}'s mail?`, 'Task_DrawMailSubmenu');
};

export const Task_DestroyMailboxPcViewAndCancel = (runtime: PlayerPcRuntime, taskId: number): void => {
  runtime.operations.push('MailboxPC_RemoveWindow:0', 'MailboxPC_RemoveWindow:1', 'DestroyListMenuTask', 'ScheduleBgCopyTilemapToVram:0', 'MailboxPC_DestroyListMenuBuffer');
  Task_ReturnToTopMenu(runtime, taskId);
};

export const Task_DrawMailSubmenu = (runtime: PlayerPcRuntime, taskId: number): void => {
  runtime.operations.push('MailboxPC_GetAddWindow:2', 'PrintTextArray:MailSubmenu:4', 'Menu_InitCursor:0', 'ScheduleBgCopyTilemapToVram:0');
  runtime.menuCursorPos = 0;
  setTaskFunc(runtime, taskId, 'Task_MailSubmenuHandleInput');
};

export const Task_MailSubmenuHandleInput = (runtime: PlayerPcRuntime, taskId: number): void => {
  const input = menuProcessInputOther(runtime);
  switch (input) {
    case MENU_B_PRESSED:
      playSelect(runtime);
      Task_PlayerPcExitMailSubmenu(runtime, taskId);
      break;
    case MENU_NOTHING_CHOSEN:
      break;
    default:
      playSelect(runtime);
      RunPlayerPcTask(runtime, taskId, MAIL_ACTIONS[input]);
      break;
  }
};

export const Task_PlayerPcReadMail = (runtime: PlayerPcRuntime, taskId: number): void => {
  runtime.operations.push('FadeScreen:FADE_TO_BLACK');
  runtime.gPaletteFade.active = true;
  setTaskFunc(runtime, taskId, 'Task_WaitFadeAndReadSelectedMail');
};

export const Task_WaitFadeAndReadSelectedMail = (runtime: PlayerPcRuntime, taskId: number): void => {
  if (!runtime.gPaletteFade.active) {
    runtime.operations.push('MailboxPC_DestroyListMenuBuffer', 'CleanupOverworldWindowsAndTilemaps', `ReadMail:${selectedMail(runtime).itemId}:CB2_SetCbToReturnToMailbox:1`);
    DestroyTask(runtime, taskId);
  }
};

export const CB2_SetCbToReturnToMailbox = (runtime: PlayerPcRuntime): void => {
  runtime.gFieldCallback = 'CB2_ReturnToMailbox';
  runtime.mainCallback2 = 'CB2_ReturnToField';
};

export const CB2_ReturnToMailbox = (runtime: PlayerPcRuntime): number => {
  runtime.helpContext = runtime.gPlayerPcMenuManager.notInRoom === false ? HELPCONTEXT_BEDROOM_PC_MAILBOX : HELPCONTEXT_PLAYERS_PC_MAILBOX;
  runtime.operations.push('LoadStdWindowFrameGfx');
  const taskId = CreateTask(runtime, 'Task_WaitFadeAndReturnToMailboxPcInputHandler');
  if (runtime.mailboxInitBuffersSucceeds) {
    runtime.operations.push(`MailboxPC_InitBuffers:${runtime.gPlayerPcMenuManager.count}`);
    Task_DrawMailboxPcMenu(runtime, taskId);
  } else {
    DestroyTask(runtime, taskId);
  }
  runtime.operations.push('FadeInFromBlack');
  return taskId;
};

export const Task_WaitFadeAndReturnToMailboxPcInputHandler = (runtime: PlayerPcRuntime, taskId: number): void => {
  if (runtime.weatherNotFadingIn) {
    setTaskFunc(runtime, taskId, 'Task_MailboxPcHandleInput');
  }
};

export const Task_PlayerPcMoveMailToBag = (runtime: PlayerPcRuntime, taskId: number): void => {
  displayItemMessageOnField(runtime, taskId, 'The message will be lost.', 'Task_DrawYesNoMenuToConfirmMoveToBag');
};

export const Task_DrawYesNoMenuToConfirmMoveToBag = (runtime: PlayerPcRuntime, taskId: number): void => {
  runtime.operations.push('DisplayYesNoMenuDefaultYes');
  setTaskFunc(runtime, taskId, 'Task_MoveToBagYesNoMenuHandleInput');
};

export const Task_MoveToBagYesNoMenuHandleInput = (runtime: PlayerPcRuntime, taskId: number): void => {
  switch (menuProcessInputNoWrapClearOnChoose(runtime)) {
    case MENU_NOTHING_CHOSEN:
      break;
    case 0:
      Task_TryPutMailInBag_DestroyMsgIfSuccessful(runtime, taskId);
      break;
    case MENU_B_PRESSED:
      playSelect(runtime);
      Task_DeclinedMoveMailToBag(runtime, taskId);
      break;
    case 1:
      Task_DeclinedMoveMailToBag(runtime, taskId);
      break;
  }
};

const clearMailStruct = (mail: PlayerPcMail): void => {
  mail.itemId = ITEM_NONE;
  mail.playerName = '';
  mail.words = mail.words.map(() => 0xffff);
};

export const Task_TryPutMailInBag_DestroyMsgIfSuccessful = (runtime: PlayerPcRuntime, taskId: number): void => {
  const mail = selectedMail(runtime);
  if (!AddBagItem(runtime, mail.itemId, 1)) {
    displayItemMessageOnField(runtime, taskId, 'Bag is full.', 'Task_PlayerPcExitMailSubmenu');
  } else {
    displayItemMessageOnField(runtime, taskId, 'Mail returned to bag. Message erased.', 'Task_PlayerPcExitMailSubmenu');
    clearMailStruct(mail);
    PCMailCompaction(runtime);
    runtime.gPlayerPcMenuManager.count -= 1;
    if (runtime.gPlayerPcMenuManager.count < runtime.gPlayerPcMenuManager.pageItems + runtime.gPlayerPcMenuManager.cursorPos) {
      if (runtime.gPlayerPcMenuManager.cursorPos !== 0) {
        runtime.gPlayerPcMenuManager.cursorPos -= 1;
      }
    }
    Task_SetPageItemVars(runtime, taskId);
  }
};

export const Task_DeclinedMoveMailToBag = (runtime: PlayerPcRuntime, taskId: number): void => {
  Task_PlayerPcExitMailSubmenu(runtime, taskId);
};

export const Task_PlayerPcGiveMailToMon = (runtime: PlayerPcRuntime, taskId: number): void => {
  if (runtime.partyCount === 0) {
    Task_Error_NoPokemon(runtime, taskId);
  } else {
    runtime.operations.push('FadeScreen:FADE_TO_BLACK');
    runtime.gPaletteFade.active = true;
    setTaskFunc(runtime, taskId, 'Task_WaitFadeAndGoToPartyMenu');
  }
};

export const Task_WaitFadeAndGoToPartyMenu = (runtime: PlayerPcRuntime, taskId: number): void => {
  if (!runtime.gPaletteFade.active) {
    runtime.operations.push('MailboxPC_DestroyListMenuBuffer', 'CleanupOverworldWindowsAndTilemaps', 'ChooseMonToGiveMailFromMailbox');
    DestroyTask(runtime, taskId);
  }
};

export const CB2_ReturnToMailboxPc_UpdateScrollVariables = (runtime: PlayerPcRuntime): number => {
  runtime.helpContext = runtime.gPlayerPcMenuManager.notInRoom === false ? HELPCONTEXT_BEDROOM_PC_MAILBOX : HELPCONTEXT_PLAYERS_PC_MAILBOX;
  const taskId = CreateTask(runtime, 'Task_WaitFadeAndReturnToMailboxPcInputHandler');
  const count = runtime.gPlayerPcMenuManager.count;
  runtime.gPlayerPcMenuManager.count = CountPCMail(runtime);
  PCMailCompaction(runtime);
  if (count !== runtime.gPlayerPcMenuManager.count) {
    if (runtime.gPlayerPcMenuManager.count < runtime.gPlayerPcMenuManager.pageItems + runtime.gPlayerPcMenuManager.cursorPos) {
      if (runtime.gPlayerPcMenuManager.cursorPos !== 0) {
        runtime.gPlayerPcMenuManager.cursorPos -= 1;
      }
    }
  }
  Task_SetPageItemVars(runtime, taskId);
  runtime.operations.push('LoadStdWindowFrameGfx');
  if (runtime.mailboxInitBuffersSucceeds) {
    runtime.operations.push(`MailboxPC_InitBuffers:${runtime.gPlayerPcMenuManager.count}`);
    Task_DrawMailboxPcMenu(runtime, taskId);
  } else {
    DestroyTask(runtime, taskId);
  }
  runtime.operations.push('FadeInFromBlack');
  return taskId;
};

export const Mailbox_ReturnToMailListAfterDeposit = (runtime: PlayerPcRuntime): void => {
  runtime.gFieldCallback = 'CB2_ReturnToMailboxPc_UpdateScrollVariables';
  runtime.mainCallback2 = 'CB2_ReturnToField';
};

export const Task_Error_NoPokemon = (runtime: PlayerPcRuntime, taskId: number): void => {
  displayItemMessageOnField(runtime, taskId, 'There is no Pokemon.', 'Task_PlayerPcExitMailSubmenu');
};

export const Task_RedrawPlayerPcMailboxAndSetUpInputHandler = (runtime: PlayerPcRuntime, taskId: number): void => {
  runtime.operations.push('ClearDialogWindowAndFrame:0');
  Task_DrawMailboxPcMenu(runtime, taskId);
  runtime.operations.push('ScheduleBgCopyTilemapToVram:0');
  setTaskFunc(runtime, taskId, 'Task_MailboxPcHandleInput');
};

export const Task_PlayerPcExitMailSubmenu = (runtime: PlayerPcRuntime, taskId: number): void => {
  runtime.operations.push('MailboxPC_RemoveWindow:2', 'ScheduleBgCopyTilemapToVram:0');
  setTaskFunc(runtime, taskId, 'Task_RedrawPlayerPcMailboxAndSetUpInputHandler');
};

export const RunPlayerPcTask = (runtime: PlayerPcRuntime, taskId: number, forced?: PlayerPcTaskFunc): void => {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  switch (forced ?? task.func) {
    case 'Task_DrawPlayerPcTopMenu': Task_DrawPlayerPcTopMenu(runtime, taskId); break;
    case 'Task_TopMenuHandleInput': Task_TopMenuHandleInput(runtime, taskId); break;
    case 'Task_PlayerPcItemStorage': Task_PlayerPcItemStorage(runtime, taskId); break;
    case 'Task_PlayerPcMailbox': Task_PlayerPcMailbox(runtime, taskId); break;
    case 'Task_PlayerPcTurnOff': Task_PlayerPcTurnOff(runtime, taskId); break;
    case 'Task_TopMenu_ItemStorageSubmenu_HandleInput': Task_TopMenu_ItemStorageSubmenu_HandleInput(runtime, taskId); break;
    case 'Task_PlayerPcDepositItem': Task_PlayerPcDepositItem(runtime, taskId); break;
    case 'Task_DepositItem_WaitFadeAndGoToBag': Task_DepositItem_WaitFadeAndGoToBag(runtime, taskId); break;
    case 'Task_ReturnToItemStorageSubmenu': Task_ReturnToItemStorageSubmenu(runtime, taskId); break;
    case 'Task_PlayerPcWithdrawItem': Task_PlayerPcWithdrawItem(runtime, taskId); break;
    case 'Task_WithdrawItemBeginFade': Task_WithdrawItemBeginFade(runtime, taskId); break;
    case 'Task_WithdrawItem_WaitFadeAndGoToItemStorage': Task_WithdrawItem_WaitFadeAndGoToItemStorage(runtime, taskId); break;
    case 'Task_PlayerPcCancel': Task_PlayerPcCancel(runtime, taskId); break;
    case 'Task_ReturnToTopMenu': Task_ReturnToTopMenu(runtime, taskId); break;
    case 'Task_DrawMailboxPcMenu': Task_DrawMailboxPcMenu(runtime, taskId); break;
    case 'Task_MailboxPcHandleInput': Task_MailboxPcHandleInput(runtime, taskId); break;
    case 'Task_PrintWhatToDoWithSelectedMail': Task_PrintWhatToDoWithSelectedMail(runtime, taskId); break;
    case 'Task_DestroyMailboxPcViewAndCancel': Task_DestroyMailboxPcViewAndCancel(runtime, taskId); break;
    case 'Task_DrawMailSubmenu': Task_DrawMailSubmenu(runtime, taskId); break;
    case 'Task_MailSubmenuHandleInput': Task_MailSubmenuHandleInput(runtime, taskId); break;
    case 'Task_PlayerPcReadMail': Task_PlayerPcReadMail(runtime, taskId); break;
    case 'Task_WaitFadeAndReadSelectedMail': Task_WaitFadeAndReadSelectedMail(runtime, taskId); break;
    case 'Task_WaitFadeAndReturnToMailboxPcInputHandler': Task_WaitFadeAndReturnToMailboxPcInputHandler(runtime, taskId); break;
    case 'Task_PlayerPcMoveMailToBag': Task_PlayerPcMoveMailToBag(runtime, taskId); break;
    case 'Task_DrawYesNoMenuToConfirmMoveToBag': Task_DrawYesNoMenuToConfirmMoveToBag(runtime, taskId); break;
    case 'Task_MoveToBagYesNoMenuHandleInput': Task_MoveToBagYesNoMenuHandleInput(runtime, taskId); break;
    case 'Task_TryPutMailInBag_DestroyMsgIfSuccessful': Task_TryPutMailInBag_DestroyMsgIfSuccessful(runtime, taskId); break;
    case 'Task_DeclinedMoveMailToBag': Task_DeclinedMoveMailToBag(runtime, taskId); break;
    case 'Task_PlayerPcGiveMailToMon': Task_PlayerPcGiveMailToMon(runtime, taskId); break;
    case 'Task_WaitFadeAndGoToPartyMenu': Task_WaitFadeAndGoToPartyMenu(runtime, taskId); break;
    case 'Task_Error_NoPokemon': Task_Error_NoPokemon(runtime, taskId); break;
    case 'Task_RedrawPlayerPcMailboxAndSetUpInputHandler': Task_RedrawPlayerPcMailboxAndSetUpInputHandler(runtime, taskId); break;
    case 'Task_PlayerPcExitMailSubmenu': Task_PlayerPcExitMailSubmenu(runtime, taskId); break;
  }
};
