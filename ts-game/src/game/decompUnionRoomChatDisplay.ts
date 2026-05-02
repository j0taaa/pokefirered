import {
  UNION_ROOM_KB_PAGE_COUNT,
  createPageSwitchUISprites,
  createUnionRoomChatObjectsRuntime,
  unionRoomChatAnimateSelectorCursorReopen,
  unionRoomChatCreateSelectorCursorObj,
  unionRoomChatFreeSpriteWork,
  unionRoomChatMoveSelectorCursorObj,
  unionRoomChatSetSelectorCursorClosedImage,
  unionRoomChatSpawnTextEntryPointerSprites,
  unionRoomChatToggleSelectorCursorObjVisibility,
  unionRoomChatTryAllocSpriteWork,
  unionRoomChatUpdateObjPalCycle,
  updateVisibleUnionRoomChatIcon,
  type UnionRoomChatObjectsRuntime
} from './decompUnionRoomChatObjects';
import {
  gText_UnionRoomChatKeyboard_01234Lower,
  gText_UnionRoomChatKeyboard_01234Upper,
  gText_UnionRoomChatKeyboard_56789Lower,
  gText_UnionRoomChatKeyboard_56789Upper,
  gText_UnionRoomChatKeyboard_ABCDE,
  gText_UnionRoomChatKeyboard_Emoji1,
  gText_UnionRoomChatKeyboard_Emoji10,
  gText_UnionRoomChatKeyboard_Emoji2,
  gText_UnionRoomChatKeyboard_Emoji3,
  gText_UnionRoomChatKeyboard_Emoji4,
  gText_UnionRoomChatKeyboard_Emoji5,
  gText_UnionRoomChatKeyboard_Emoji6,
  gText_UnionRoomChatKeyboard_Emoji7,
  gText_UnionRoomChatKeyboard_Emoji8,
  gText_UnionRoomChatKeyboard_Emoji9,
  gText_UnionRoomChatKeyboard_FGHIJ,
  gText_UnionRoomChatKeyboard_KLMNO,
  gText_UnionRoomChatKeyboard_PQRST,
  gText_UnionRoomChatKeyboard_PunctuationLower,
  gText_UnionRoomChatKeyboard_PunctuationUpper,
  gText_UnionRoomChatKeyboard_SymbolsLower,
  gText_UnionRoomChatKeyboard_SymbolsUpper,
  gText_UnionRoomChatKeyboard_UVWXY,
  gText_UnionRoomChatKeyboard_Z,
  gText_UnionRoomChatKeyboard_abcde,
  gText_UnionRoomChatKeyboard_fghij,
  gText_UnionRoomChatKeyboard_klmno,
  gText_UnionRoomChatKeyboard_pqrst,
  gText_UnionRoomChatKeyboard_uvwxy,
  gText_UnionRoomChatKeyboard_z
} from './decompKeyboardText';

export const CHATDISPLAYROUTINE_LOADGFX = 0;
export { UNION_ROOM_KB_PAGE_COUNT } from './decompUnionRoomChatObjects';
export const CHATDISPLAYROUTINE_MOVEKBCURSOR = 1;
export const CHATDISPLAYROUTINE_CURSORBLINK = 2;
export const CHATDISPLAYROUTINE_SHOWKBSWAPMENU = 3;
export const CHATDISPLAYROUTINE_HIDEKBSWAPMENU = 4;
export const CHATDISPLAYROUTINE_SWITCHPAGES = 5;
export const CHATDISPLAYROUTINE_SHOWQUITCHATTINGDIALOG = 6;
export const CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO = 7;
export const CHATDISPLAYROUTINE_PRINTMSG = 8;
export const CHATDISPLAYROUTINE_PRINTREGISTERWHERE = 9;
export const CHATDISPLAYROUTINE_CANCELREGISTER = 10;
export const CHATDISPLAYROUTINE_RETURNTOKB = 11;
export const CHATDISPLAYROUTINE_SCROLLCHAT = 12;
export const CHATDISPLAYROUTINE_PRINTINPUTTEXT = 13;
export const CHATDISPLAYROUTINE_ASKSAVE = 14;
export const CHATDISPLAYROUTINE_ASKOVERWRITESAVE = 15;
export const CHATDISPLAYROUTINE_PRINTSAVING = 16;
export const CHATDISPLAYROUTINE_PRINTSAVEDTHEGAME = 17;
export const CHATDISPLAYROUTINE_PRINTEXITINGCHAT = 18;
export const CHATDISPLAYROUTINE_PRINTLEADERLEFT = 19;
export const CHATDISPLAYROUTINE_SHOWCONFIRMLEADERLEAVEDIALOG = 20;

export const STDMESSAGE_QUIT_CHATTING = 0;
export const STDMESSAGE_REGISTER_WHERE = 1;
export const STDMESSAGE_REGISTER_HERE = 2;
export const STDMESSAGE_INPUT_TEXT = 3;
export const STDMESSAGE_EXITING_CHAT = 4;
export const STDMESSAGE_LEADER_LEFT = 5;
export const STDMESSAGE_ASK_SAVE = 6;
export const STDMESSAGE_ASK_OVERWRITE = 7;
export const STDMESSAGE_SAVING_NO_OFF = 8;
export const STDMESSAGE_SAVED_THE_GAME = 9;
export const STDMESSAGE_WARN_LEADER_LEAVE = 10;

export const COPYWIN_GFX = 1;
export const COPYWIN_FULL = 3;
export const TEXT_COLOR_TRANSPARENT = 0xff;
export const TEXT_COLOR_LIGHT_GRAY = 0;
export const TEXT_COLOR_WHITE = 1;
export const TEXT_COLOR_DARK_GRAY = 2;
export const TEXT_COLOR_RED = 3;
export const TEXT_COLOR_LIGHT_RED = 4;
export const PIXEL_FILL = (value: number): number => (value & 0xf) * 0x11;
export const UNION_ROOM_KB_ROW_COUNT = 10;
export const UNION_ROOM_KB_PAGE_UPPER = 0;
export const UNION_ROOM_KB_PAGE_LOWER = 1;
export const UNION_ROOM_KB_PAGE_EMOJI = 2;

type DisplaySubtaskName =
  | 'DisplaySubtask_LoadGfx'
  | 'DisplaySubtask_PrintWin3'
  | 'DisplaySubtask_HideWin3'
  | 'DisplaySubtask_SwitchPages'
  | 'DisplaySubtask_MoveSelectorCursorObj'
  | 'DisplaySubtask_ShowQuitChattingDialog'
  | 'DisplaySubtask_HideQuitChattingDialog'
  | 'DisplaySubtask_UpdateMessageBuffer'
  | 'DisplaySubtask_PrintRegisterWhere'
  | 'DisplaySubtask_CancelRegister'
  | 'DisplaySubtask_ReturnToKeyboard'
  | 'DisplaySubtask_ScrollChat'
  | 'DisplaySubtask_AnimateSelectorCursorBlink'
  | 'DisplaySubtask_PrintInputText'
  | 'DisplaySubtask_PrintExitingChat'
  | 'DisplaySubtask_PrintLeaderLeft'
  | 'DisplaySubtask_AskSave'
  | 'DisplaySubtask_AskOverwriteSave'
  | 'DisplaySubtask_PrintSavingDontTurnOffPower'
  | 'DisplaySubtask_PrintSavedTheGame'
  | 'DisplaySubtask_ShowConfirmLeaderLeaveDialog'
  | 'DisplaySubtaskDummy';

export interface UnionRoomChat2Subtask {
  callback: DisplaySubtaskName;
  active: boolean;
  state: number;
}

export interface UnionRoomChat2 {
  subtasks: UnionRoomChat2Subtask[];
  yesNoMenuWinId: number;
  curLine: number;
  scrollCount: number;
  messageWindowId: number;
  bg1hofs: number;
  expandedPlaceholdersBuffer: string;
  bg0Buffer: number[];
  bg1Buffer: number[];
  bg3Buffer: number[];
  bg2Buffer: number[];
  unk2128: number[];
  unk2148: number[];
}

export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface MessageWindowInfo {
  text: string;
  boxType: number;
  x: number;
  y: number;
  letterSpacing: number;
  lineSpacing: number;
  expandPlaceholders: boolean;
  widerBox: boolean;
}

export interface UnionRoomChatDisplayRuntime {
  sWork: UnionRoomChat2 | null;
  objects: UnionRoomChatObjectsRuntime;
  allocationFails: boolean;
  freeTempTileDataBuffersResults: boolean[];
  dmaBusyResults: boolean[];
  menuInputResults: number[];
  currentKeyboardPage: number;
  cursorCol: number;
  cursorRow: number;
  messageEntryBuffer: string;
  messageEntryCursorPosition: number;
  bufferSelectionRegion: { start: number; length: number };
  lastReceivedMessage: string;
  receivedPlayerIndex: number;
  disbandedPlayerName: string;
  playerName: string;
  registeredTexts: string[];
  windowIdSeed: number;
  removedWindows: number[];
  bgY: Record<number, number>;
  bgX: Record<number, number>;
  gpuRegs: Record<string, number>;
  scanlineEffect: { state: number; srcBuffer: number };
  scanlineBuffers: number[][];
  operations: string[];
  windows: Array<{ id: number; template: WindowTemplate; hidden: boolean; text: string[]; fill?: number }>;
}

export const gUnionRoomKeyboardText: Array<Array<string | null>> = [
  [
    gText_UnionRoomChatKeyboard_ABCDE,
    gText_UnionRoomChatKeyboard_FGHIJ,
    gText_UnionRoomChatKeyboard_KLMNO,
    gText_UnionRoomChatKeyboard_PQRST,
    gText_UnionRoomChatKeyboard_UVWXY,
    gText_UnionRoomChatKeyboard_Z,
    gText_UnionRoomChatKeyboard_01234Upper,
    gText_UnionRoomChatKeyboard_56789Upper,
    gText_UnionRoomChatKeyboard_PunctuationUpper,
    gText_UnionRoomChatKeyboard_SymbolsUpper
  ],
  [
    gText_UnionRoomChatKeyboard_abcde,
    gText_UnionRoomChatKeyboard_fghij,
    gText_UnionRoomChatKeyboard_klmno,
    gText_UnionRoomChatKeyboard_pqrst,
    gText_UnionRoomChatKeyboard_uvwxy,
    gText_UnionRoomChatKeyboard_z,
    gText_UnionRoomChatKeyboard_01234Lower,
    gText_UnionRoomChatKeyboard_56789Lower,
    gText_UnionRoomChatKeyboard_PunctuationLower,
    gText_UnionRoomChatKeyboard_SymbolsLower
  ],
  [
    gText_UnionRoomChatKeyboard_Emoji1,
    gText_UnionRoomChatKeyboard_Emoji2,
    gText_UnionRoomChatKeyboard_Emoji3,
    gText_UnionRoomChatKeyboard_Emoji4,
    gText_UnionRoomChatKeyboard_Emoji5,
    gText_UnionRoomChatKeyboard_Emoji6,
    gText_UnionRoomChatKeyboard_Emoji7,
    gText_UnionRoomChatKeyboard_Emoji8,
    gText_UnionRoomChatKeyboard_Emoji9,
    gText_UnionRoomChatKeyboard_Emoji10
  ]
];

export const sKeyboardSwapTexts = ['gText_Upper', 'gText_Lower', 'gText_Symbols', 'gText_Register2', 'gText_Exit'];

export const sMessageWindowInfo: MessageWindowInfo[] = [
  { text: 'gText_QuitChatting', boxType: 1, x: 0, y: 0, letterSpacing: 1, lineSpacing: 2, expandPlaceholders: false, widerBox: false },
  { text: 'gText_RegisterTextWhere', boxType: 1, x: 0, y: 0, letterSpacing: 1, lineSpacing: 2, expandPlaceholders: false, widerBox: false },
  { text: 'gText_RegisterTextHere', boxType: 1, x: 0, y: 0, letterSpacing: 1, lineSpacing: 2, expandPlaceholders: false, widerBox: false },
  { text: 'gText_InputText', boxType: 1, x: 0, y: 0, letterSpacing: 1, lineSpacing: 2, expandPlaceholders: false, widerBox: false },
  { text: 'gText_ExitingTheChat', boxType: 2, x: 0, y: 0, letterSpacing: 1, lineSpacing: 2, expandPlaceholders: false, widerBox: false },
  { text: 'gText_LeaderHasLeftEndingChat', boxType: 2, x: 0, y: 0, letterSpacing: 0, lineSpacing: 2, expandPlaceholders: true, widerBox: false },
  {
    text: 'gText_RegisteredTextChanged_OKtoSave',
    boxType: 2,
    x: 0,
    y: 0,
    letterSpacing: 1,
    lineSpacing: 2,
    expandPlaceholders: false,
    widerBox: true
  },
  {
    text: 'gText_RegisteredTextChanged_AlreadySavedFile',
    boxType: 2,
    x: 0,
    y: 0,
    letterSpacing: 1,
    lineSpacing: 2,
    expandPlaceholders: false,
    widerBox: true
  },
  {
    text: 'gText_RegisteredTextChanged_SavingDontTurnOff',
    boxType: 2,
    x: 0,
    y: 0,
    letterSpacing: 1,
    lineSpacing: 2,
    expandPlaceholders: false,
    widerBox: true
  },
  {
    text: 'gText_RegisteredTextChanged_SavedTheGame',
    boxType: 2,
    x: 0,
    y: 0,
    letterSpacing: 1,
    lineSpacing: 2,
    expandPlaceholders: true,
    widerBox: true
  },
  { text: 'gText_IfLeaderLeavesChatWillEnd', boxType: 2, x: 0, y: 0, letterSpacing: 1, lineSpacing: 2, expandPlaceholders: false, widerBox: true }
];

const sSubtaskInfo: Array<{ idx: number; callback: DisplaySubtaskName }> = [
  { idx: CHATDISPLAYROUTINE_LOADGFX, callback: 'DisplaySubtask_LoadGfx' },
  { idx: CHATDISPLAYROUTINE_SHOWKBSWAPMENU, callback: 'DisplaySubtask_PrintWin3' },
  { idx: CHATDISPLAYROUTINE_HIDEKBSWAPMENU, callback: 'DisplaySubtask_HideWin3' },
  { idx: CHATDISPLAYROUTINE_SWITCHPAGES, callback: 'DisplaySubtask_SwitchPages' },
  { idx: CHATDISPLAYROUTINE_MOVEKBCURSOR, callback: 'DisplaySubtask_MoveSelectorCursorObj' },
  { idx: CHATDISPLAYROUTINE_SHOWQUITCHATTINGDIALOG, callback: 'DisplaySubtask_ShowQuitChattingDialog' },
  { idx: CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO, callback: 'DisplaySubtask_HideQuitChattingDialog' },
  { idx: CHATDISPLAYROUTINE_PRINTMSG, callback: 'DisplaySubtask_UpdateMessageBuffer' },
  { idx: CHATDISPLAYROUTINE_PRINTREGISTERWHERE, callback: 'DisplaySubtask_PrintRegisterWhere' },
  { idx: CHATDISPLAYROUTINE_CANCELREGISTER, callback: 'DisplaySubtask_CancelRegister' },
  { idx: CHATDISPLAYROUTINE_RETURNTOKB, callback: 'DisplaySubtask_ReturnToKeyboard' },
  { idx: CHATDISPLAYROUTINE_SCROLLCHAT, callback: 'DisplaySubtask_ScrollChat' },
  { idx: CHATDISPLAYROUTINE_CURSORBLINK, callback: 'DisplaySubtask_AnimateSelectorCursorBlink' },
  { idx: CHATDISPLAYROUTINE_PRINTINPUTTEXT, callback: 'DisplaySubtask_PrintInputText' },
  { idx: CHATDISPLAYROUTINE_PRINTEXITINGCHAT, callback: 'DisplaySubtask_PrintExitingChat' },
  { idx: CHATDISPLAYROUTINE_PRINTLEADERLEFT, callback: 'DisplaySubtask_PrintLeaderLeft' },
  { idx: CHATDISPLAYROUTINE_ASKSAVE, callback: 'DisplaySubtask_AskSave' },
  { idx: CHATDISPLAYROUTINE_ASKOVERWRITESAVE, callback: 'DisplaySubtask_AskOverwriteSave' },
  { idx: CHATDISPLAYROUTINE_PRINTSAVING, callback: 'DisplaySubtask_PrintSavingDontTurnOffPower' },
  { idx: CHATDISPLAYROUTINE_PRINTSAVEDTHEGAME, callback: 'DisplaySubtask_PrintSavedTheGame' },
  { idx: CHATDISPLAYROUTINE_SHOWCONFIRMLEADERLEAVEDIALOG, callback: 'DisplaySubtask_ShowConfirmLeaderLeaveDialog' }
];

export const createUnionRoomChatDisplayRuntime = (
  overrides: Partial<UnionRoomChatDisplayRuntime> = {}
): UnionRoomChatDisplayRuntime => {
  const objects = overrides.objects ?? createUnionRoomChatObjectsRuntime();
  const restOverrides = { ...overrides };
  delete restOverrides.objects;
  return {
    sWork: null,
    objects,
    allocationFails: false,
    freeTempTileDataBuffersResults: [],
    dmaBusyResults: [],
    menuInputResults: [],
    currentKeyboardPage: 0,
    cursorCol: 0,
    cursorRow: 0,
    messageEntryBuffer: '',
    messageEntryCursorPosition: 0,
    bufferSelectionRegion: { start: 0, length: 0 },
    lastReceivedMessage: '',
    receivedPlayerIndex: 0,
    disbandedPlayerName: '',
    playerName: 'PLAYER',
    registeredTexts: Array.from({ length: 10 }, (_, i) => `REGISTERED_${i}`),
    windowIdSeed: 4,
    removedWindows: [],
    bgY: {},
    bgX: {},
    gpuRegs: {},
    scanlineEffect: { state: 0, srcBuffer: 0 },
    scanlineBuffers: [Array.from({ length: 0x280 }, () => 0), Array.from({ length: 0x280 }, () => 0)],
    operations: [],
    windows: [],
    ...restOverrides
  };
};

const work = (runtime: UnionRoomChatDisplayRuntime): UnionRoomChat2 => {
  if (runtime.sWork === null) throw new Error('sWork is NULL');
  return runtime.sWork;
};

const callSubtask = (runtime: UnionRoomChatDisplayRuntime, callback: DisplaySubtaskName, state: { value: number }): boolean => {
  switch (callback) {
    case 'DisplaySubtask_LoadGfx':
      return DisplaySubtask_LoadGfx(runtime, state);
    case 'DisplaySubtask_PrintWin3':
      return DisplaySubtask_PrintWin3(runtime, state);
    case 'DisplaySubtask_HideWin3':
      return DisplaySubtask_HideWin3(runtime, state);
    case 'DisplaySubtask_SwitchPages':
      return DisplaySubtask_SwitchPages(runtime, state);
    case 'DisplaySubtask_MoveSelectorCursorObj':
      return DisplaySubtask_MoveSelectorCursorObj(runtime);
    case 'DisplaySubtask_ShowQuitChattingDialog':
      return DisplaySubtask_ShowQuitChattingDialog(runtime, state);
    case 'DisplaySubtask_HideQuitChattingDialog':
      return DisplaySubtask_HideQuitChattingDialog(runtime, state);
    case 'DisplaySubtask_UpdateMessageBuffer':
      return DisplaySubtask_UpdateMessageBuffer(runtime, state);
    case 'DisplaySubtask_PrintRegisterWhere':
      return DisplaySubtask_PrintRegisterWhere(runtime, state);
    case 'DisplaySubtask_CancelRegister':
      return DisplaySubtask_CancelRegister(runtime, state);
    case 'DisplaySubtask_ReturnToKeyboard':
      return DisplaySubtask_ReturnToKeyboard(runtime, state);
    case 'DisplaySubtask_ScrollChat':
      return DisplaySubtask_ScrollChat(runtime, state);
    case 'DisplaySubtask_AnimateSelectorCursorBlink':
      return DisplaySubtask_AnimateSelectorCursorBlink(runtime, state);
    case 'DisplaySubtask_PrintInputText':
      return DisplaySubtask_PrintInputText(runtime, state);
    case 'DisplaySubtask_PrintExitingChat':
      return DisplaySubtask_PrintExitingChat(runtime, state);
    case 'DisplaySubtask_PrintLeaderLeft':
      return DisplaySubtask_PrintLeaderLeft(runtime, state);
    case 'DisplaySubtask_AskSave':
      return DisplaySubtask_AskSave(runtime, state);
    case 'DisplaySubtask_AskOverwriteSave':
      return DisplaySubtask_AskOverwriteSave(runtime, state);
    case 'DisplaySubtask_PrintSavingDontTurnOffPower':
      return DisplaySubtask_PrintSavingDontTurnOffPower(runtime, state);
    case 'DisplaySubtask_PrintSavedTheGame':
      return DisplaySubtask_PrintSavedTheGame(runtime, state);
    case 'DisplaySubtask_ShowConfirmLeaderLeaveDialog':
      return DisplaySubtask_ShowConfirmLeaderLeaveDialog(runtime, state);
    case 'DisplaySubtaskDummy':
      return DisplaySubtaskDummy();
  }
};

export const UnionRoomChat_TryAllocGraphicsWork = (runtime: UnionRoomChatDisplayRuntime): boolean => {
  if (runtime.allocationFails) return false;
  runtime.sWork = createWork();
  if (runtime.sWork && unionRoomChatTryAllocSpriteWork(runtime.objects)) {
    ResetBgsAndClearDma3BusyFlags(runtime, 0);
    InitBgsFromTemplates(runtime);
    InitWindows(runtime);
    ResetTempTileDataBuffers(runtime);
    InitScanlineEffect(runtime);
    InitWork(runtime.sWork);
    UnionRoomChat_ResetDisplaySubtasks(runtime);
    UnionRoomChat_StartDisplaySubtask(runtime, 0, 0);
    return true;
  }
  return false;
};

const createWork = (): UnionRoomChat2 => ({
  subtasks: Array.from({ length: 3 }, () => ({ callback: 'DisplaySubtaskDummy' as const, active: false, state: 0 })),
  yesNoMenuWinId: 0xff,
  curLine: 0,
  scrollCount: 0,
  messageWindowId: 0xff,
  bg1hofs: 0,
  expandedPlaceholdersBuffer: '',
  bg0Buffer: Array.from({ length: 0x800 }, () => 0),
  bg1Buffer: Array.from({ length: 0x800 }, () => 0),
  bg3Buffer: Array.from({ length: 0x800 }, () => 0),
  bg2Buffer: Array.from({ length: 0x800 }, () => 0),
  unk2128: Array.from({ length: 0x20 }, () => 0),
  unk2148: Array.from({ length: 0x20 }, () => 0)
});

export const UnionRoomChat_RunDisplaySubtask0 = (runtime: UnionRoomChatDisplayRuntime): boolean => RunDisplaySubtask(runtime, 0);

export const UnionRoomChat_FreeGraphicsWork = (runtime: UnionRoomChatDisplayRuntime): void => {
  unionRoomChatFreeSpriteWork(runtime.objects);
  if (runtime.sWork !== null) runtime.sWork = null;
  FreeAllWindowBuffers(runtime);
  runtime.scanlineEffect.state = 3;
};

export const InitWork = (ptr: UnionRoomChat2): void => {
  ptr.yesNoMenuWinId = 0xff;
  ptr.messageWindowId = 0xff;
  ptr.curLine = 0;
};

export const UnionRoomChat_ResetDisplaySubtasks = (runtime: UnionRoomChatDisplayRuntime): void => {
  if (runtime.sWork === null) return;
  for (let i = 0; i < 3; i++) {
    runtime.sWork.subtasks[i].callback = 'DisplaySubtaskDummy';
    runtime.sWork.subtasks[i].active = false;
    runtime.sWork.subtasks[i].state = 0;
  }
};

export const UnionRoomChat_RunDisplaySubtasks = (runtime: UnionRoomChatDisplayRuntime): void => {
  if (runtime.sWork === null) return;
  for (let i = 0; i < 3; i++) {
    const subtask = runtime.sWork.subtasks[i];
    if (subtask.active) {
      const state = { value: subtask.state };
      subtask.active = callSubtask(runtime, subtask.callback, state);
      subtask.state = state.value;
    }
  }
};

export const UnionRoomChat_StartDisplaySubtask = (runtime: UnionRoomChatDisplayRuntime, idx: number, slot: number): void => {
  const subtask = work(runtime).subtasks[slot];
  subtask.callback = 'DisplaySubtaskDummy';
  for (const info of sSubtaskInfo) {
    if (info.idx === idx) {
      subtask.callback = info.callback;
      subtask.active = true;
      subtask.state = 0;
      break;
    }
  }
};

export const RunDisplaySubtask = (runtime: UnionRoomChatDisplayRuntime, slot: number): boolean => work(runtime).subtasks[slot].active;

export const DisplaySubtask_LoadGfx = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  if (FreeTempTileDataBuffersIfPossible(runtime)) return true;
  switch (state.value) {
    case 0:
      ResetGpuBgState(runtime);
      SetBgTilemapWorkBuffers(runtime);
      break;
    case 1:
      ClearBg0(runtime);
      break;
    case 2:
      LoadUnionRoomChatPanelGfx(runtime);
      break;
    case 3:
      LoadLinkMiscMenuGfx(runtime);
      break;
    case 4:
      LoadBg1Pal8(runtime);
      break;
    case 5:
      LoadWin0(runtime);
      LoadWin2(runtime);
      LoadWin3(runtime);
      LoadWin1(runtime);
      break;
    case 6:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        unionRoomChatCreateSelectorCursorObj(runtime.objects);
        unionRoomChatSpawnTextEntryPointerSprites(runtime.objects);
        createPageSwitchUISprites(runtime.objects);
      }
      break;
    default:
      return false;
  }
  state.value++;
  return true;
};

export const DisplaySubtask_PrintWin3 = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0:
      PrintKeyboardSwapTextsOnWin3(runtime);
      CopyWindowToVram(runtime, 3, COPYWIN_FULL);
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy(runtime);
  }
  state.value++;
  return true;
};

export const DisplaySubtask_HideWin3 = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0:
      ClearWin3(runtime);
      CopyWindowToVram(runtime, 3, COPYWIN_FULL);
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy(runtime);
  }
  state.value++;
  return true;
};

export const DisplaySubtask_SwitchPages = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0:
      unionRoomChatToggleSelectorCursorObjVisibility(runtime.objects, true);
      if (AnimateMoveBg1Right(runtime)) return true;
      PrintCurrentKeyboardPage(runtime);
      CopyWindowToVram(runtime, 2, COPYWIN_GFX);
      break;
    case 1:
      if (IsDma3ManagerBusyWithBgCopy(runtime)) return true;
      break;
    case 2:
      if (AnimateMoveBg1Left(runtime)) return true;
      syncObjects(runtime);
      unionRoomChatMoveSelectorCursorObj(runtime.objects);
      unionRoomChatToggleSelectorCursorObjVisibility(runtime.objects, false);
      updateVisibleUnionRoomChatIcon(runtime.objects);
      return false;
  }
  state.value++;
  return true;
};

export const DisplaySubtask_MoveSelectorCursorObj = (runtime: UnionRoomChatDisplayRuntime): boolean => {
  syncObjects(runtime);
  unionRoomChatMoveSelectorCursorObj(runtime.objects);
  return false;
};

export const DisplaySubtask_ShowQuitChattingDialog = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0:
      PlaceStdMessageWindow(runtime, STDMESSAGE_QUIT_CHATTING, 0);
      PlaceYesNoMenuAt(runtime, 23, 11, 1);
      CopyWindowToVram(runtime, work(runtime).messageWindowId, COPYWIN_FULL);
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy(runtime);
  }
  state.value++;
  return true;
};

export const DisplaySubtask_HideQuitChattingDialog = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0:
      HideStdMessageWindow(runtime);
      HideYesNoMenuWindow(runtime);
      CopyBgTilemapBufferToVram(runtime, 0);
      break;
    case 1:
      if (IsDma3ManagerBusyWithBgCopy(runtime)) return true;
      DestroyStdMessageWindow(runtime);
      DestroyYesNoMenuWindow(runtime);
      return false;
  }
  state.value++;
  return true;
};

export const DisplaySubtask_UpdateMessageBuffer = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0: {
      const { start, length } = UnionRoomChat_GetBufferSelectionRegion(runtime);
      FillWin1Rect(runtime, start, length, PIXEL_FILL(0));
      PrintOnWin1Parameterized(runtime, 0, UnionRoomChat_GetMessageEntryBuffer(runtime), TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY);
      CopyWindowToVram(runtime, 1, COPYWIN_GFX);
      break;
    }
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        updateVisibleUnionRoomChatIcon(runtime.objects);
        return false;
      }
      return true;
  }
  state.value++;
  return true;
};

export const DisplaySubtask_PrintRegisterWhere = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0: {
      const x = UnionRoomChat_GetNumCharsInMessageEntryBuffer(runtime);
      const str = UnionRoomChat_GetEndOfMessageEntryBuffer(runtime);
      const length = StringLength_Multibyte(str);
      FillWin1Rect(runtime, x, length, PIXEL_FILL(6));
      PrintOnWin1Parameterized(runtime, x, str, TEXT_COLOR_TRANSPARENT, TEXT_COLOR_RED, TEXT_COLOR_LIGHT_RED);
      CopyWindowToVram(runtime, 1, COPYWIN_GFX);
      break;
    }
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        PlaceStdMessageWindow(runtime, STDMESSAGE_REGISTER_WHERE, 16);
        CopyWindowToVram(runtime, work(runtime).messageWindowId, COPYWIN_FULL);
      } else return true;
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) unionRoomChatUpdateObjPalCycle(runtime.objects, 1);
      else return true;
      break;
    case 3:
      return false;
  }
  state.value++;
  return true;
};

export const DisplaySubtask_CancelRegister = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0: {
      const x = UnionRoomChat_GetNumCharsInMessageEntryBuffer(runtime);
      const str = UnionRoomChat_GetEndOfMessageEntryBuffer(runtime);
      const length = StringLength_Multibyte(str);
      FillWin1Rect(runtime, x, length, PIXEL_FILL(0));
      PrintOnWin1Parameterized(runtime, x, str, TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY);
      CopyWindowToVram(runtime, 1, COPYWIN_GFX);
      break;
    }
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        HideStdMessageWindow(runtime);
        CopyWindowToVram(runtime, work(runtime).messageWindowId, COPYWIN_FULL);
      } else return true;
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        unionRoomChatUpdateObjPalCycle(runtime.objects, 0);
        DestroyStdMessageWindow(runtime);
      } else return true;
      break;
    case 3:
      return false;
  }
  state.value++;
  return true;
};

export const DisplaySubtask_ReturnToKeyboard = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0:
      PrintCurrentKeyboardPage(runtime);
      CopyWindowToVram(runtime, 2, COPYWIN_GFX);
      state.value++;
      break;
    case 1:
      if (IsDma3ManagerBusyWithBgCopy(runtime)) return true;
      return false;
  }
  return true;
};

export const DisplaySubtask_ScrollChat = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  const w = work(runtime);
  switch (state.value) {
    case 0:
      PrintTextOnWin0Colorized(runtime, w.curLine, UnionRoomChat_GetLastReceivedMessage(runtime), UnionRoomChat_GetReceivedPlayerIndex(runtime));
      CopyWindowToVram(runtime, 0, COPYWIN_GFX);
      break;
    case 1:
      if (IsDma3ManagerBusyWithBgCopy(runtime)) return true;
      if (w.curLine < 9) {
        w.curLine++;
        state.value = 4;
        return false;
      }
      w.scrollCount = 0;
      state.value++;
    // fall through
    case 2:
      ScrollWindow(runtime, 0, 0, 5, PIXEL_FILL(1));
      CopyWindowToVram(runtime, 0, COPYWIN_GFX);
      w.scrollCount++;
      state.value++;
    // fall through
    case 3:
      if (IsDma3ManagerBusyWithBgCopy(runtime)) return true;
      if (w.scrollCount < 3) {
        state.value--;
        return true;
      }
      break;
    case 4:
      return false;
    default:
      return true;
  }
  state.value++;
  return true;
};

export const DisplaySubtask_AnimateSelectorCursorBlink = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0:
      unionRoomChatSetSelectorCursorClosedImage(runtime.objects);
      state.value++;
      break;
    case 1:
      return unionRoomChatAnimateSelectorCursorReopen(runtime.objects);
  }
  return true;
};

export const DisplaySubtask_PrintInputText = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean =>
  printStdMessageSubtask(runtime, state, STDMESSAGE_INPUT_TEXT, 16, false);
export const DisplaySubtask_PrintExitingChat = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean =>
  printStdMessageSubtask(runtime, state, STDMESSAGE_EXITING_CHAT, 0, false);
export const DisplaySubtask_AskSave = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean =>
  printStdMessageSubtask(runtime, state, STDMESSAGE_ASK_SAVE, 0, true);
export const DisplaySubtask_AskOverwriteSave = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean =>
  printStdMessageSubtask(runtime, state, STDMESSAGE_ASK_OVERWRITE, 0, true);
export const DisplaySubtask_PrintSavingDontTurnOffPower = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean =>
  printStdMessageSubtask(runtime, state, STDMESSAGE_SAVING_NO_OFF, 0, false);
export const DisplaySubtask_ShowConfirmLeaderLeaveDialog = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean =>
  printStdMessageSubtask(runtime, state, STDMESSAGE_WARN_LEADER_LEAVE, 0, true);

export const DisplaySubtask_PrintLeaderLeft = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0:
      DynamicPlaceholderTextUtil_Reset(runtime);
      DynamicPlaceholderTextUtil_SetPlaceholderPtr(runtime, 0, UnionRoomChat_GetNameOfPlayerWhoDisbandedChat(runtime));
      PlaceStdMessageWindow(runtime, STDMESSAGE_LEADER_LEFT, 0);
      CopyWindowToVram(runtime, work(runtime).messageWindowId, COPYWIN_FULL);
      state.value++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy(runtime);
  }
  return true;
};

export const DisplaySubtask_PrintSavedTheGame = (runtime: UnionRoomChatDisplayRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0:
      DynamicPlaceholderTextUtil_Reset(runtime);
      DynamicPlaceholderTextUtil_SetPlaceholderPtr(runtime, 0, runtime.playerName);
      PlaceStdMessageWindow(runtime, STDMESSAGE_SAVED_THE_GAME, 0);
      CopyWindowToVram(runtime, work(runtime).messageWindowId, COPYWIN_FULL);
      state.value++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy(runtime);
  }
  return true;
};

const printStdMessageSubtask = (
  runtime: UnionRoomChatDisplayRuntime,
  state: { value: number },
  id: number,
  bg0vofs: number,
  yesNo: boolean
): boolean => {
  switch (state.value) {
    case 0:
      PlaceStdMessageWindow(runtime, id, bg0vofs);
      if (yesNo) PlaceYesNoMenuAt(runtime, 23, 10, 1);
      CopyWindowToVram(runtime, work(runtime).messageWindowId, COPYWIN_FULL);
      state.value++;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy(runtime);
  }
  return true;
};

export const DisplaySubtaskDummy = (): boolean => false;

export const PlaceYesNoMenuAt = (runtime: UnionRoomChatDisplayRuntime, left: number, top: number, initialCursorPos: number): void => {
  const template: WindowTemplate = { bg: 0, tilemapLeft: left, tilemapTop: top, width: 6, height: 4, paletteNum: 14, baseBlock: 0x052 };
  const winId = AddWindow(runtime, template);
  work(runtime).yesNoMenuWinId = winId;
  if (winId !== 0xff) {
    FillWindowPixelBuffer(runtime, winId, PIXEL_FILL(1));
    PutWindowTilemap(runtime, winId);
    AddTextPrinterParameterized(runtime, winId, 'gText_Yes', 8, 2);
    AddTextPrinterParameterized(runtime, winId, 'gText_No', 8, 16);
    DrawTextBorderOuter(runtime, winId, 1, 13);
    Menu_InitCursor(runtime, winId, 0, 2, 14, 2, initialCursorPos);
  }
};

export const HideYesNoMenuWindow = (runtime: UnionRoomChatDisplayRuntime): void => {
  const id = work(runtime).yesNoMenuWinId;
  if (id !== 0xff) {
    ClearStdWindowAndFrameToTransparent(runtime, id);
    ClearWindowTilemap(runtime, id);
  }
};

export const DestroyYesNoMenuWindow = (runtime: UnionRoomChatDisplayRuntime): void => {
  const w = work(runtime);
  if (w.yesNoMenuWinId !== 0xff) {
    RemoveWindow(runtime, w.yesNoMenuWinId);
    w.yesNoMenuWinId = 0xff;
  }
};

export const UnionRoomChat_ProcessInput = (runtime: UnionRoomChatDisplayRuntime): number =>
  runtime.menuInputResults.length > 0 ? runtime.menuInputResults.shift()! : 0;

export const PlaceStdMessageWindow = (runtime: UnionRoomChatDisplayRuntime, id: number, bg0vofs: number): void => {
  const w = work(runtime);
  const info = sMessageWindowInfo[id];
  const template: WindowTemplate = { bg: 0, tilemapLeft: 8, tilemapTop: 16, width: 21, height: 4, paletteNum: 14, baseBlock: 0x06a };
  if (info.widerBox) {
    template.tilemapLeft -= 7;
    template.width += 7;
  }
  w.messageWindowId = AddWindow(runtime, template);
  const windowId = w.messageWindowId;
  if (windowId === 0xff) return;
  const str = info.expandPlaceholders ? DynamicPlaceholderTextUtil_ExpandPlaceholders(runtime, info.text) : info.text;
  ChangeBgY(runtime, 0, bg0vofs * 256, 0);
  FillWindowPixelBuffer(runtime, windowId, PIXEL_FILL(1));
  PutWindowTilemap(runtime, windowId);
  if (info.boxType === 1) {
    DrawTextBorderInner(runtime, windowId, 0x0a, 2);
    AddTextPrinterParameterized5(runtime, windowId, str, info.x + 8, info.y + 8, info.letterSpacing, info.lineSpacing);
  } else {
    DrawTextBorderOuter(runtime, windowId, 0x0a, 2);
    AddTextPrinterParameterized5(runtime, windowId, str, info.x, info.y, info.letterSpacing, info.lineSpacing);
  }
  w.messageWindowId = windowId;
};

export const HideStdMessageWindow = (runtime: UnionRoomChatDisplayRuntime): void => {
  const id = work(runtime).messageWindowId;
  if (id !== 0xff) {
    ClearStdWindowAndFrameToTransparent(runtime, id);
    ClearWindowTilemap(runtime, id);
  }
  ChangeBgY(runtime, 0, 0, 0);
};

export const DestroyStdMessageWindow = (runtime: UnionRoomChatDisplayRuntime): void => {
  const w = work(runtime);
  if (w.messageWindowId !== 0xff) {
    RemoveWindow(runtime, w.messageWindowId);
    w.messageWindowId = 0xff;
  }
};

export const FillWin1Rect = (runtime: UnionRoomChatDisplayRuntime, x: number, width: number, fillValue: number): void => {
  FillWindowPixelRect(runtime, 1, fillValue, x * 8, 1, width * 8, 14);
};

export const PrintOnWin1Parameterized = (
  runtime: UnionRoomChatDisplayRuntime,
  x: number,
  str: string,
  bgColor: number,
  fgColor: number,
  shadowColor: number
): void => {
  if (bgColor !== TEXT_COLOR_TRANSPARENT) FillWin1Rect(runtime, x, UnionRoomChat_GetMessageEntryCursorPosition(runtime) - x, bgColor);
  const strbuf = `{EXT_CTRL_CODE_BEGIN}{EXT_CTRL_CODE_MIN_LETTER_SPACING}${8}${str}`;
  AddTextPrinterParameterized3(runtime, 1, x * 8, 1, [bgColor, fgColor, shadowColor], strbuf);
};

export const PrintCurrentKeyboardPage = (runtime: UnionRoomChatDisplayRuntime): void => {
  FillWindowPixelBuffer(runtime, 2, PIXEL_FILL(15));
  const page = GetCurrentKeyboardPage(runtime);
  const color = [TEXT_COLOR_TRANSPARENT, 5, 4];
  if (page !== UNION_ROOM_KB_PAGE_COUNT) {
    const left = page === UNION_ROOM_KB_PAGE_EMOJI ? 6 : 8;
    for (let i = 0, top = 0; i < UNION_ROOM_KB_ROW_COUNT; i++, top += 12) {
      const row = gUnionRoomKeyboardText[page]?.[i];
      if (!row) return;
      AddTextPrinterParameterized3(runtime, 2, left, top, color, `{EXT_CTRL_CODE_BEGIN}{EXT_CTRL_CODE_MIN_LETTER_SPACING}${8}${row}`);
    }
  } else {
    const left = 4;
    for (let i = 0, top = 0; i < 10; i++, top += 12) {
      const str = UnionRoomChat_GetWorkRegisteredText(runtime, i);
      if (GetStringWidth(str) <= 40) AddTextPrinterParameterized3(runtime, 2, left, top, color, str);
      else {
        let length = StringLength_Multibyte(str);
        let shortened = str;
        do {
          length--;
          shortened = StringCopyN_Multibyte(str, length);
        } while (GetStringWidth(shortened) > 35);
        AddTextPrinterParameterized3(runtime, 2, left, top, color, shortened);
        AddTextPrinterParameterized3(runtime, 2, left + 35, top, color, '...');
      }
    }
  }
};

export const AnimateMoveBg1Right = (runtime: UnionRoomChatDisplayRuntime): boolean => {
  const w = work(runtime);
  if (w.bg1hofs < 56) {
    w.bg1hofs += 12;
    if (w.bg1hofs >= 56) w.bg1hofs = 56;
    if (w.bg1hofs < 56) {
      FillScanlineEffectWithValue1col(runtime, w.bg1hofs);
      return true;
    }
  }
  FillScanlineEffectWithValue2col(runtime, w.bg1hofs);
  return false;
};

export const AnimateMoveBg1Left = (runtime: UnionRoomChatDisplayRuntime): boolean => {
  const w = work(runtime);
  if (w.bg1hofs > 0) {
    w.bg1hofs -= 12;
    if (w.bg1hofs <= 0) w.bg1hofs = 0;
    if (w.bg1hofs > 0) {
      FillScanlineEffectWithValue1col(runtime, w.bg1hofs);
      return true;
    }
  }
  FillScanlineEffectWithValue2col(runtime, w.bg1hofs);
  return false;
};

export const PrintKeyboardSwapTextsOnWin3 = (runtime: UnionRoomChatDisplayRuntime): void => {
  FillWindowPixelBuffer(runtime, 3, PIXEL_FILL(1));
  DrawTextBorderOuter(runtime, 3, 1, 13);
  PrintMenuTable(runtime, 3, sKeyboardSwapTexts);
  Menu_InitCursor(runtime, 3, 0, 0, 14, 5, GetCurrentKeyboardPage(runtime));
  PutWindowTilemap(runtime, 3);
};

export const ClearWin3 = (runtime: UnionRoomChatDisplayRuntime): void => {
  ClearStdWindowAndFrameToTransparent(runtime, 3);
  ClearWindowTilemap(runtime, 3);
};

export const PrintTextOnWin0Colorized = (runtime: UnionRoomChatDisplayRuntime, row: number, str: string, colorIdx: number): void => {
  const color = [TEXT_COLOR_WHITE, colorIdx * 2 + 2, colorIdx * 2 + 3];
  FillWindowPixelRect(runtime, 0, PIXEL_FILL(1), 0, row * 15, 168, 15);
  AddTextPrinterParameterized3(runtime, 0, 0, row * 15, color, str);
};

export const ResetGpuBgState = (runtime: UnionRoomChatDisplayRuntime): void => {
  for (let bg = 0; bg < 4; bg++) {
    ChangeBgX(runtime, bg, 0, 0);
    ChangeBgY(runtime, bg, 0, 0);
    ShowBg(runtime, bg);
  }
  SetGpuRegBits(runtime, 'REG_OFFSET_DISPCNT', 0x1000 | 0x40);
  SetGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0);
  ClearGpuRegBits(runtime, 'REG_OFFSET_DISPCNT', 0x2000 | 0x4000 | 0x8000);
  SetGpuRegBits(runtime, 'REG_OFFSET_DISPCNT', 0x2000);
  SetGpuReg(runtime, 'REG_OFFSET_WIN0H', (64 << 8) | 240);
  SetGpuReg(runtime, 'REG_OFFSET_WIN0V', (0 << 8) | 144);
  SetGpuReg(runtime, 'REG_OFFSET_WININ', 0x15f);
  SetGpuReg(runtime, 'REG_OFFSET_WINOUT', 0x3f3f);
};

export const SetBgTilemapWorkBuffers = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.operations.push('SetBgTilemapBuffer:0:bg0Buffer', 'SetBgTilemapBuffer:1:bg1Buffer', 'SetBgTilemapBuffer:3:bg3Buffer', 'SetBgTilemapBuffer:2:bg2Buffer');
};

export const ClearBg0 = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.operations.push('RequestDma3Fill:BG0', 'FillBgTilemapBufferRect_Palette0:0');
  CopyBgTilemapBufferToVram(runtime, 0);
};

export const LoadUnionRoomChatPanelGfx = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.operations.push('LoadPalette:gUnionRoomChat_Panel_Pal:7', 'LoadPalette:sUnionRoomChat_TextEntry_Pal:12', 'DecompressAndCopyTileDataToVram:1:Panel');
  CopyBgTilemapBufferToVram(runtime, 1);
};

export const LoadLinkMiscMenuGfx = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.operations.push('LoadPalette:gUnionRoomChat_Bg_Pal:0', 'DecompressAndCopyTileDataToVram:2:Bg');
  CopyBgTilemapBufferToVram(runtime, 2);
};

export const LoadBg1Pal8 = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.operations.push('LoadPalette:gUnionRoomChat_Unused_Pal:8', 'RequestDma3Fill:BG1');
};

export const LoadWin0 = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.operations.push('LoadPalette:sUnionRoomChat_Messages_Pal:15');
  PutWindowTilemap(runtime, 0);
  FillWindowPixelBuffer(runtime, 0, PIXEL_FILL(1));
  CopyWindowToVram(runtime, 0, COPYWIN_FULL);
};

export const LoadWin2 = (runtime: UnionRoomChatDisplayRuntime): void => {
  PutWindowTilemap(runtime, 2);
  PrintCurrentKeyboardPage(runtime);
  CopyWindowToVram(runtime, 2, COPYWIN_FULL);
};

export const LoadWin1 = (runtime: UnionRoomChatDisplayRuntime): void => {
  FillWindowPixelBuffer(runtime, 1, PIXEL_FILL(0));
  PutWindowTilemap(runtime, 1);
  CopyWindowToVram(runtime, 1, COPYWIN_FULL);
};

export const LoadWin3 = (runtime: UnionRoomChatDisplayRuntime): void => {
  FillWindowPixelBuffer(runtime, 3, PIXEL_FILL(1));
  runtime.operations.push('LoadUserWindowGfx:3:1:13', 'LoadStdWindowGfx:3:10:2', 'LoadPalette:gStandardMenuPalette:14');
};

export const InitScanlineEffect = (runtime: UnionRoomChatDisplayRuntime): void => {
  work(runtime).bg1hofs = 0;
  runtime.scanlineBuffers = [runtime.scanlineBuffers[0].map(() => 0), runtime.scanlineBuffers[1].map(() => 0)];
  runtime.scanlineEffect.state = 1;
  runtime.operations.push('ScanlineEffect_SetParams');
};

export const FillScanlineEffectWithValue1col = (runtime: UnionRoomChatDisplayRuntime, value: number): void => {
  const buffer = runtime.scanlineBuffers[runtime.scanlineEffect.srcBuffer];
  buffer.fill(value, 0, 0x90);
  buffer.fill(0, 0x90, 0xa0);
};

export const FillScanlineEffectWithValue2col = (runtime: UnionRoomChatDisplayRuntime, value: number): void => {
  const buffer = runtime.scanlineBuffers[0];
  buffer.fill(value, 0, 0x90);
  buffer.fill(0, 0x90, 0xa0);
  buffer.fill(value, 0x1e0, 0x270);
  buffer.fill(0, 0x228, 0x238);
};

const syncObjects = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.objects.currentKeyboardPage = runtime.currentKeyboardPage;
  runtime.objects.cursorCol = runtime.cursorCol;
  runtime.objects.cursorRow = runtime.cursorRow;
  runtime.objects.messageEntryCursorPosition = runtime.messageEntryCursorPosition;
  runtime.objects.messageEntryBufferLength = runtime.messageEntryBuffer.length;
};

const AddWindow = (runtime: UnionRoomChatDisplayRuntime, template: WindowTemplate): number => {
  const id = runtime.windowIdSeed++;
  runtime.windows.push({ id, template: { ...template }, hidden: false, text: [] });
  runtime.operations.push(`AddWindow:${id}:${template.tilemapLeft},${template.tilemapTop},${template.width},${template.height}`);
  return id;
};
const RemoveWindow = (runtime: UnionRoomChatDisplayRuntime, id: number): void => {
  runtime.removedWindows.push(id);
  runtime.operations.push(`RemoveWindow:${id}`);
};
const findWindow = (runtime: UnionRoomChatDisplayRuntime, id: number) => runtime.windows.find((win) => win.id === id);
const FillWindowPixelBuffer = (runtime: UnionRoomChatDisplayRuntime, id: number, fill: number): void => {
  const win = findWindow(runtime, id);
  if (win) win.fill = fill;
  runtime.operations.push(`FillWindowPixelBuffer:${id}:${fill}`);
};
const FillWindowPixelRect = (runtime: UnionRoomChatDisplayRuntime, id: number, fill: number, x: number, y: number, width: number, height: number): void => {
  runtime.operations.push(`FillWindowPixelRect:${id}:${fill}:${x},${y},${width},${height}`);
};
const PutWindowTilemap = (runtime: UnionRoomChatDisplayRuntime, id: number): void => {
  runtime.operations.push(`PutWindowTilemap:${id}`);
};
const ClearWindowTilemap = (runtime: UnionRoomChatDisplayRuntime, id: number): void => {
  runtime.operations.push(`ClearWindowTilemap:${id}`);
};
const ClearStdWindowAndFrameToTransparent = (runtime: UnionRoomChatDisplayRuntime, id: number): void => {
  const win = findWindow(runtime, id);
  if (win) win.hidden = true;
  runtime.operations.push(`ClearStdWindowAndFrameToTransparent:${id}`);
};
const CopyWindowToVram = (runtime: UnionRoomChatDisplayRuntime, id: number, mode: number): void => {
  runtime.operations.push(`CopyWindowToVram:${id}:${mode}`);
};
const CopyBgTilemapBufferToVram = (runtime: UnionRoomChatDisplayRuntime, bg: number): void => {
  runtime.operations.push(`CopyBgTilemapBufferToVram:${bg}`);
};
const AddTextPrinterParameterized = (runtime: UnionRoomChatDisplayRuntime, id: number, text: string, x: number, y: number): void => {
  findWindow(runtime, id)?.text.push(`${text}@${x},${y}`);
  runtime.operations.push(`AddTextPrinterParameterized:${id}:${text}:${x},${y}`);
};
const AddTextPrinterParameterized3 = (runtime: UnionRoomChatDisplayRuntime, id: number, x: number, y: number, color: number[], text: string): void => {
  findWindow(runtime, id)?.text.push(`${text}@${x},${y}:${color.join('/')}`);
  runtime.operations.push(`AddTextPrinterParameterized3:${id}:${text}:${x},${y}:${color.join('/')}`);
};
const AddTextPrinterParameterized5 = (
  runtime: UnionRoomChatDisplayRuntime,
  id: number,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
  lineSpacing: number
): void => {
  findWindow(runtime, id)?.text.push(`${text}@${x},${y}:${letterSpacing}/${lineSpacing}`);
  runtime.operations.push(`AddTextPrinterParameterized5:${id}:${text}:${x},${y}:${letterSpacing}/${lineSpacing}`);
};
const DrawTextBorderOuter = (runtime: UnionRoomChatDisplayRuntime, id: number, tile: number, pal: number): void => {
  runtime.operations.push(`DrawTextBorderOuter:${id}:${tile}:${pal}`);
};
const DrawTextBorderInner = (runtime: UnionRoomChatDisplayRuntime, id: number, tile: number, pal: number): void => {
  runtime.operations.push(`DrawTextBorderInner:${id}:${tile}:${pal}`);
};
const Menu_InitCursor = (runtime: UnionRoomChatDisplayRuntime, id: number, x: number, y: number, stride: number, count: number, initial: number): void => {
  runtime.operations.push(`Menu_InitCursor:${id}:${x},${y}:${stride}:${count}:${initial}`);
};
const PrintMenuTable = (runtime: UnionRoomChatDisplayRuntime, id: number, rows: string[]): void => {
  for (const row of rows) AddTextPrinterParameterized(runtime, id, row, 14, 5);
};
const ScrollWindow = (runtime: UnionRoomChatDisplayRuntime, id: number, direction: number, distance: number, fill: number): void => {
  runtime.operations.push(`ScrollWindow:${id}:${direction}:${distance}:${fill}`);
};
const ChangeBgX = (runtime: UnionRoomChatDisplayRuntime, bg: number, value: number, op: number): void => {
  runtime.bgX[bg] = value;
  runtime.operations.push(`ChangeBgX:${bg}:${value}:${op}`);
};
const ChangeBgY = (runtime: UnionRoomChatDisplayRuntime, bg: number, value: number, op: number): void => {
  runtime.bgY[bg] = value;
  runtime.operations.push(`ChangeBgY:${bg}:${value}:${op}`);
};
const ShowBg = (runtime: UnionRoomChatDisplayRuntime, bg: number): void => {
  runtime.operations.push(`ShowBg:${bg}`);
};
const SetGpuReg = (runtime: UnionRoomChatDisplayRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value;
  runtime.operations.push(`SetGpuReg:${reg}:${value}`);
};
const SetGpuRegBits = (runtime: UnionRoomChatDisplayRuntime, reg: string, bits: number): void => {
  runtime.gpuRegs[reg] = (runtime.gpuRegs[reg] ?? 0) | bits;
  runtime.operations.push(`SetGpuRegBits:${reg}:${bits}`);
};
const ClearGpuRegBits = (runtime: UnionRoomChatDisplayRuntime, reg: string, bits: number): void => {
  runtime.gpuRegs[reg] = (runtime.gpuRegs[reg] ?? 0) & ~bits;
  runtime.operations.push(`ClearGpuRegBits:${reg}:${bits}`);
};
const FreeAllWindowBuffers = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.operations.push('FreeAllWindowBuffers');
};
const ResetBgsAndClearDma3BusyFlags = (runtime: UnionRoomChatDisplayRuntime, mode: number): void => {
  runtime.operations.push(`ResetBgsAndClearDma3BusyFlags:${mode}`);
};
const InitBgsFromTemplates = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.operations.push('InitBgsFromTemplates:4');
};
const InitWindows = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.operations.push('InitWindows:4');
};
const ResetTempTileDataBuffers = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.operations.push('ResetTempTileDataBuffers');
};
const FreeTempTileDataBuffersIfPossible = (runtime: UnionRoomChatDisplayRuntime): boolean =>
  runtime.freeTempTileDataBuffersResults.length > 0 ? runtime.freeTempTileDataBuffersResults.shift()! : false;
const IsDma3ManagerBusyWithBgCopy = (runtime: UnionRoomChatDisplayRuntime): boolean =>
  runtime.dmaBusyResults.length > 0 ? runtime.dmaBusyResults.shift()! : false;
const DynamicPlaceholderTextUtil_Reset = (runtime: UnionRoomChatDisplayRuntime): void => {
  runtime.operations.push('DynamicPlaceholderTextUtil_Reset');
};
const DynamicPlaceholderTextUtil_SetPlaceholderPtr = (runtime: UnionRoomChatDisplayRuntime, idx: number, str: string): void => {
  runtime.operations.push(`DynamicPlaceholderTextUtil_SetPlaceholderPtr:${idx}:${str}`);
};
const DynamicPlaceholderTextUtil_ExpandPlaceholders = (runtime: UnionRoomChatDisplayRuntime, text: string): string => {
  const expanded = `${text}:{expanded}`;
  work(runtime).expandedPlaceholdersBuffer = expanded;
  runtime.operations.push(`DynamicPlaceholderTextUtil_ExpandPlaceholders:${text}`);
  return expanded;
};

export const UnionRoomChat_GetBufferSelectionRegion = (runtime: UnionRoomChatDisplayRuntime): { start: number; length: number } =>
  runtime.bufferSelectionRegion;
export const UnionRoomChat_GetMessageEntryBuffer = (runtime: UnionRoomChatDisplayRuntime): string => runtime.messageEntryBuffer;
export const UnionRoomChat_GetEndOfMessageEntryBuffer = (runtime: UnionRoomChatDisplayRuntime): string =>
  runtime.messageEntryBuffer.slice(runtime.messageEntryCursorPosition);
export const UnionRoomChat_GetNumCharsInMessageEntryBuffer = (runtime: UnionRoomChatDisplayRuntime): number => runtime.messageEntryCursorPosition;
export const UnionRoomChat_GetLastReceivedMessage = (runtime: UnionRoomChatDisplayRuntime): string => runtime.lastReceivedMessage;
export const UnionRoomChat_GetReceivedPlayerIndex = (runtime: UnionRoomChatDisplayRuntime): number => runtime.receivedPlayerIndex;
export const UnionRoomChat_GetMessageEntryCursorPosition = (runtime: UnionRoomChatDisplayRuntime): number => runtime.messageEntryCursorPosition;
export const UnionRoomChat_GetNameOfPlayerWhoDisbandedChat = (runtime: UnionRoomChatDisplayRuntime): string => runtime.disbandedPlayerName;
export const UnionRoomChat_GetWorkRegisteredText = (runtime: UnionRoomChatDisplayRuntime, idx: number): string => runtime.registeredTexts[idx] ?? '';
export const GetCurrentKeyboardPage = (runtime: UnionRoomChatDisplayRuntime): number => runtime.currentKeyboardPage;
export const StringLength_Multibyte = (str: string): number => [...str].length;
export const StringCopyN_Multibyte = (str: string, length: number): string => [...str].slice(0, length).join('');
export const GetStringWidth = (str: string): number => StringLength_Multibyte(str) * 8;
