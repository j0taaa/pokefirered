import {
  CHATDISPLAYROUTINE_ASKOVERWRITESAVE,
  CHATDISPLAYROUTINE_ASKSAVE,
  CHATDISPLAYROUTINE_CANCELREGISTER,
  CHATDISPLAYROUTINE_CURSORBLINK,
  CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO,
  CHATDISPLAYROUTINE_HIDEKBSWAPMENU,
  CHATDISPLAYROUTINE_MOVEKBCURSOR,
  CHATDISPLAYROUTINE_PRINTEXITINGCHAT,
  CHATDISPLAYROUTINE_PRINTINPUTTEXT,
  CHATDISPLAYROUTINE_PRINTLEADERLEFT,
  CHATDISPLAYROUTINE_PRINTMSG,
  CHATDISPLAYROUTINE_PRINTREGISTERWHERE,
  CHATDISPLAYROUTINE_PRINTSAVEDTHEGAME,
  CHATDISPLAYROUTINE_PRINTSAVING,
  CHATDISPLAYROUTINE_RETURNTOKB,
  CHATDISPLAYROUTINE_SCROLLCHAT,
  CHATDISPLAYROUTINE_SHOWCONFIRMLEADERLEAVEDIALOG,
  CHATDISPLAYROUTINE_SHOWKBSWAPMENU,
  CHATDISPLAYROUTINE_SHOWQUITCHATTINGDIALOG,
  CHATDISPLAYROUTINE_SWITCHPAGES,
  UNION_ROOM_KB_PAGE_COUNT,
  UNION_ROOM_KB_PAGE_UPPER
} from './decompUnionRoomChatDisplay';
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

export {
  UNION_ROOM_KB_PAGE_COUNT,
  UNION_ROOM_KB_PAGE_EMOJI,
  UNION_ROOM_KB_PAGE_LOWER,
  UNION_ROOM_KB_PAGE_UPPER,
  UNION_ROOM_KB_ROW_COUNT
} from './decompUnionRoomChatDisplay';

export const MESSAGE_BUFFER_NCHAR = 15;
export const PLAYER_NAME_LENGTH = 7;
export const CHAT_MESSAGE_0 = 0;
export const CHAT_MESSAGE_CHAT = 1;
export const CHAT_MESSAGE_JOIN = 2;
export const CHAT_MESSAGE_LEAVE = 3;
export const CHAT_MESSAGE_DROP = 4;
export const CHAT_MESSAGE_DISBAND = 5;
export const CHATENTRYROUTINE_JOIN = 0;
export const CHATNETRYROUTINE_HANDLE_INPUT = 1;
export const CHATENTRYROUTINE_SWITCH = 2;
export const CHATENTRYROUTINE_ASKQUITCHATTING = 3;
export const CHATENTRYROUTINE_SEND = 4;
export const CHATENTRYROUTINE_REGISTER = 5;
export const CHATENTRYROUTINE_EXITCHAT = 6;
export const CHATENTRYROUTINE_DROP = 7;
export const CHATENTRYROUTINE_DISBANDED = 8;
export const CHATENTRYROUTINE_SAVEANDEXIT = 9;
export const CHATEXIT_NONE = 0;
export const CHATEXIT_LEADER_LAST = 1;
export const CHATEXIT_DROPPED = 2;
export const CHATEXIT_DISBANDED = 3;

export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const SELECT_BUTTON = 1 << 2;
export const START_BUTTON = 1 << 3;
export const DPAD_RIGHT = 1 << 4;
export const DPAD_LEFT = 1 << 5;
export const DPAD_UP = 1 << 6;
export const DPAD_DOWN = 1 << 7;
export const R_BUTTON = 1 << 8;

export const MENU_NOTHING_CHOSEN = -2;
export const MENU_B_PRESSED = -1;
export const SE_SELECT = 5;
export const SE_SAVE = 6;

export interface UnionRoomChatWork {
  routineNo: number;
  routineState: number;
  exitDelayTimer: number;
  linkPlayerCount: number;
  handleInputTask: number;
  receiveMessagesTask: number;
  currentPage: number;
  currentCol: number;
  currentRow: number;
  multiplayerId: number;
  lastBufferCursorPos: number;
  bufferCursorPos: number;
  receivedPlayerIndex: number;
  exitType: number;
  changedRegisteredTexts: boolean;
  afterSaveTimer: number;
  messageEntryBuffer: string;
  receivedMessage: string;
  hostName: string;
  registeredTexts: string[];
  sendMessageBuffer: ChatSendBuffer;
}

export interface ChatSendBuffer {
  cmd: number;
  name: string;
  payload: string | number;
}

export interface ChatTask {
  id: number;
  data: number[];
  destroyed: boolean;
}

export interface UnionRoomChatRuntime {
  sWork: UnionRoomChatWork | null;
  saveBlock1RegisteredTexts: string[];
  playerName: string;
  linkPlayerCount: number;
  multiplayerId: number;
  keyNew: number;
  keyRepeat: number;
  linkTaskFinished: boolean;
  playerExchangeActive: boolean;
  sendBlockResults: boolean[];
  receivedRemoteLinkPlayers: boolean;
  blockReceivedStatus: number;
  blockRecvBuffer: ChatSendBuffer[];
  menuInputs: number[];
  chatInputs: number[];
  displaySubtaskBusy: Record<number, boolean[]>;
  tasks: ChatTask[];
  operations: string[];
  paletteFadeActive: boolean;
  mainState: number;
}

export const gUnionRoomKeyboardText = [
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
] as const;

const sKeyboardPageMaxRow = [9, 9, 9, 9] as const;

export const createUnionRoomChatRuntime = (overrides: Partial<UnionRoomChatRuntime> = {}): UnionRoomChatRuntime => ({
  sWork: null,
  saveBlock1RegisteredTexts: ['Hello', 'Pokemon', 'Trade', 'Battle', 'Lets', 'Ok', 'Sorry', 'Yay', 'Thank you', 'Bye-bye'],
  playerName: 'PLAYER',
  linkPlayerCount: 2,
  multiplayerId: 0,
  keyNew: 0,
  keyRepeat: 0,
  linkTaskFinished: true,
  playerExchangeActive: false,
  sendBlockResults: [],
  receivedRemoteLinkPlayers: true,
  blockReceivedStatus: 0,
  blockRecvBuffer: [],
  menuInputs: [],
  chatInputs: [],
  displaySubtaskBusy: {},
  tasks: [],
  operations: [],
  paletteFadeActive: false,
  mainState: 0,
  ...overrides
});

export const EnterUnionRoomChat = (runtime: UnionRoomChatRuntime): void => {
  runtime.sWork = InitChatWork(runtime);
  op(runtime, 'gKeyRepeatStartDelay:20');
  op(runtime, 'HelpSystem_DisableToggleWithRButton');
  op(runtime, 'SetVBlankCallback:NULL');
  op(runtime, 'SetMainCallback2:CB2_LoadInterface');
};

export function CB2_LoadInterface(runtime: UnionRoomChatRuntime): void {
  const work = mustWork(runtime);
  switch (runtime.mainState) {
    case 0:
      op(runtime, 'ResetTasks');
      op(runtime, 'ResetSpriteData');
      op(runtime, 'FreeAllSpritePalettes');
      op(runtime, 'UnionRoomChat_TryAllocGraphicsWork');
      runtime.mainState++;
      break;
    case 1:
      op(runtime, 'UnionRoomChat_RunDisplaySubtasks');
      if (!RunDisplaySubtask(runtime, 0)) {
        op(runtime, 'BlendPalettes:PALETTES_ALL:16:RGB_BLACK');
        op(runtime, 'BeginNormalPaletteFade:PALETTES_ALL:-1:16:0:RGB_BLACK');
        op(runtime, 'SetVBlankCallback:VBlankCB_UnionRoomChatMain');
        runtime.mainState++;
      }
      break;
    case 2:
      op(runtime, 'UpdatePaletteFade');
      if (!runtime.paletteFadeActive) {
        op(runtime, 'SetMainCallback2:CB2_UnionRoomChatMain');
        op(runtime, 'SetQuestLogEvent:QL_EVENT_USED_UNION_ROOM_CHAT');
        work.handleInputTask = CreateTask(runtime, 'Task_HandlePlayerInput', 8);
        work.receiveMessagesTask = CreateTask(runtime, 'Task_ReceiveChatMessage', 7);
        op(runtime, 'LoadWirelessStatusIndicatorSpriteGfx');
        op(runtime, 'CreateWirelessStatusIndicatorSprite:232:150');
      }
      break;
  }
}

export function VBlankCB_UnionRoomChatMain(runtime: UnionRoomChatRuntime): void {
  op(runtime, 'TransferPlttBuffer');
  op(runtime, 'LoadOam');
  op(runtime, 'ProcessSpriteCopyRequests');
  op(runtime, 'ScanlineEffect_InitHBlankDmaTransfer');
}

export function CB2_UnionRoomChatMain(runtime: UnionRoomChatRuntime): void {
  op(runtime, 'RunTasks');
  for (const task of [...runtime.tasks]) {
    if (task.destroyed) continue;
    if (task.data[15] === 8) Task_HandlePlayerInput(runtime, task.id);
    else if (task.data[15] === 7) Task_ReceiveChatMessage(runtime, task.id);
  }
  op(runtime, 'UnionRoomChat_RunDisplaySubtasks');
  op(runtime, 'AnimateSprites');
  op(runtime, 'BuildOamBuffer');
  op(runtime, 'UpdatePaletteFade');
}

export const InitChatWork = (runtime: UnionRoomChatRuntime): UnionRoomChatWork => ({
  routineNo: CHATENTRYROUTINE_JOIN,
  routineState: 0,
  exitDelayTimer: 0,
  linkPlayerCount: runtime.linkPlayerCount,
  handleInputTask: 0,
  receiveMessagesTask: 0,
  currentPage: UNION_ROOM_KB_PAGE_UPPER,
  currentCol: 0,
  currentRow: 0,
  multiplayerId: runtime.multiplayerId,
  lastBufferCursorPos: 0,
  bufferCursorPos: 0,
  receivedPlayerIndex: 0,
  exitType: CHATEXIT_NONE,
  changedRegisteredTexts: false,
  afterSaveTimer: 0,
  messageEntryBuffer: '',
  receivedMessage: '',
  hostName: '',
  registeredTexts: [...runtime.saveBlock1RegisteredTexts],
  sendMessageBuffer: PrepareSendBuffer_Null()
});

export const FreeChatWork = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  DestroyTask(runtime, work.handleInputTask);
  DestroyTask(runtime, work.receiveMessagesTask);
  runtime.sWork = null;
};

export const Task_HandlePlayerInput = (runtime: UnionRoomChatRuntime, _taskId: number): void => {
  const work = mustWork(runtime);
  switch (work.exitType) {
    case CHATEXIT_LEADER_LAST: GoToRoutine(runtime, CHATENTRYROUTINE_EXITCHAT); work.exitType = CHATEXIT_NONE; break;
    case CHATEXIT_DROPPED: GoToRoutine(runtime, CHATENTRYROUTINE_DROP); work.exitType = CHATEXIT_NONE; break;
    case CHATEXIT_DISBANDED: GoToRoutine(runtime, CHATENTRYROUTINE_DISBANDED); work.exitType = CHATEXIT_NONE; break;
  }
  runCurrentChatEntryRoutine(runtime);
};

export const ChatEntryRoutine_Join = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  switch (work.routineState) {
    case 0:
      work.sendMessageBuffer = PrepareSendBuffer_Join(runtime, work);
      work.routineState++;
    case 1:
      if (runtime.linkTaskFinished && !runtime.playerExchangeActive && SendBlock(runtime, work.sendMessageBuffer)) work.routineState++;
      break;
    case 2:
      if (runtime.linkTaskFinished) GoToRoutine(runtime, CHATNETRYROUTINE_HANDLE_INPUT);
      break;
  }
};

export const ChatEntryRoutine_HandleInput = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  switch (work.routineState) {
    case 0:
      if (JOY_NEW(runtime, START_BUTTON)) {
        if (work.bufferCursorPos) GoToRoutine(runtime, CHATENTRYROUTINE_SEND);
      } else if (JOY_NEW(runtime, SELECT_BUTTON)) {
        GoToRoutine(runtime, CHATENTRYROUTINE_SWITCH);
      } else if (JOY_REPT(runtime, B_BUTTON)) {
        if (work.bufferCursorPos) {
          DeleteLastCharacterOfChatMessageBuffer(runtime);
          StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTMSG, 0);
          work.routineState = 1;
        } else GoToRoutine(runtime, CHATENTRYROUTINE_ASKQUITCHATTING);
      } else if (JOY_NEW(runtime, A_BUTTON)) {
        AppendCharacterToChatMessageBuffer(runtime);
        StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTMSG, 0);
        StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_CURSORBLINK, 1);
        work.routineState = 1;
      } else if (JOY_NEW(runtime, R_BUTTON)) {
        if (work.currentPage !== UNION_ROOM_KB_PAGE_COUNT) {
          ToggleCaseOfLastCharacterInChatMessageBuffer(runtime);
          StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTMSG, 0);
          work.routineState = 1;
        } else GoToRoutine(runtime, CHATENTRYROUTINE_REGISTER);
      } else if (TypeChatMessage_HandleDPad(runtime)) {
        StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_MOVEKBCURSOR, 0);
        work.routineState = 1;
      }
      break;
    case 1:
      if (!RunDisplaySubtask(runtime, 0) && !RunDisplaySubtask(runtime, 1)) work.routineState = 0;
      break;
  }
};

export const ChatEntryRoutine_Switch = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  switch (work.routineState) {
    case 0:
      StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_SHOWKBSWAPMENU, 0);
      work.routineState++;
      break;
    case 1:
      if (!RunDisplaySubtask(runtime, 0)) work.routineState++;
      break;
    case 2: {
      const input = Menu_ProcessInput(runtime);
      let shouldSwitchPages = true;
      if (input === MENU_NOTHING_CHOSEN) {
        if (JOY_NEW(runtime, SELECT_BUTTON)) {
          op(runtime, `PlaySE:${SE_SELECT}`);
          op(runtime, 'Menu_MoveCursor:1');
        }
        return;
      }
      if (input === MENU_B_PRESSED) {
        StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_HIDEKBSWAPMENU, 0);
        work.routineState = 3;
        return;
      }
      StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_HIDEKBSWAPMENU, 0);
      if (work.currentPage === input || input > UNION_ROOM_KB_PAGE_COUNT) shouldSwitchPages = false;
      if (!shouldSwitchPages) {
        work.routineState = 3;
        return;
      }
      work.currentCol = 0;
      work.currentRow = 0;
      StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_SWITCHPAGES, 1);
      work.currentPage = input;
      work.routineState = 4;
      break;
    }
    case 3:
      if (!RunDisplaySubtask(runtime, 0)) GoToRoutine(runtime, CHATNETRYROUTINE_HANDLE_INPUT);
      break;
    case 4:
      if (!RunDisplaySubtask(runtime, 0) && !RunDisplaySubtask(runtime, 1)) GoToRoutine(runtime, CHATNETRYROUTINE_HANDLE_INPUT);
      break;
  }
};

export const ChatEntryRoutine_AskQuitChatting = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  const input = UnionRoomChat_ProcessInput(runtime);
  switch (work.routineState) {
    case 0: StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_SHOWQUITCHATTINGDIALOG, 0); work.routineState = 1; break;
    case 1: if (!RunDisplaySubtask(runtime, 0)) work.routineState = 2; break;
    case 2:
      if (input === -1 || input === 1) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO, 0); work.routineState = 3; }
      else if (input === 0) {
        if (work.multiplayerId === 0) { work.sendMessageBuffer = PrepareSendBuffer_Disband(runtime); StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO, 0); work.routineState = 9; }
        else { work.sendMessageBuffer = PrepareSendBuffer_Leave(runtime, work); work.routineState = 4; }
      }
      break;
    case 3: if (!RunDisplaySubtask(runtime, 0)) GoToRoutine(runtime, CHATNETRYROUTINE_HANDLE_INPUT); break;
    case 9: if (!RunDisplaySubtask(runtime, 0)) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_SHOWCONFIRMLEADERLEAVEDIALOG, 0); work.routineState = 10; } break;
    case 10: if (!RunDisplaySubtask(runtime, 0)) work.routineState = 8; break;
    case 8:
      if (input === -1 || input === 1) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO, 0); work.routineState = 3; }
      else if (input === 0) { op(runtime, 'Rfu_StopPartnerSearch'); work.sendMessageBuffer = PrepareSendBuffer_Disband(runtime); work.routineState = 4; }
      break;
    case 4:
      if (runtime.linkTaskFinished && !runtime.playerExchangeActive && SendBlock(runtime, work.sendMessageBuffer)) work.routineState = work.multiplayerId === 0 ? 6 : 5;
      break;
    case 5:
      if (!runtime.receivedRemoteLinkPlayers) GoToRoutine(runtime, CHATENTRYROUTINE_SAVEANDEXIT);
      break;
  }
};

export const ChatEntryRoutine_ExitChat = (runtime: UnionRoomChatRuntime): void => runExitLikeRoutine(runtime, 'exit');
export const ChatEntryRoutine_Drop = (runtime: UnionRoomChatRuntime): void => runExitLikeRoutine(runtime, 'drop');
export const ChatEntryRoutine_Disbanded = (runtime: UnionRoomChatRuntime): void => runExitLikeRoutine(runtime, 'disbanded');

export const ChatEntryRoutine_SendMessage = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  switch (work.routineState) {
    case 0:
      if (!runtime.receivedRemoteLinkPlayers) { GoToRoutine(runtime, CHATNETRYROUTINE_HANDLE_INPUT); break; }
      work.sendMessageBuffer = PrepareSendBuffer_Chat(runtime, work);
      work.routineState++;
    case 1:
      if (runtime.linkTaskFinished && !runtime.playerExchangeActive && SendBlock(runtime, work.sendMessageBuffer)) work.routineState++;
      break;
    case 2:
      ResetMessageEntryBuffer(runtime);
      StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTMSG, 0);
      work.routineState++;
      break;
    case 3:
      if (!RunDisplaySubtask(runtime, 0)) work.routineState++;
      break;
    case 4:
      if (runtime.linkTaskFinished) GoToRoutine(runtime, CHATNETRYROUTINE_HANDLE_INPUT);
      break;
  }
};

export const ChatEntryRoutine_Register = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  switch (work.routineState) {
    case 0:
      if (ChatMsgHasAtLeastOneCharcter(runtime)) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTREGISTERWHERE, 0); work.routineState = 2; }
      else { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTINPUTTEXT, 0); work.routineState = 5; }
      break;
    case 1:
      if (JOY_NEW(runtime, A_BUTTON)) { RegisterTextAtRow(runtime); StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_RETURNTOKB, 0); work.routineState = 3; }
      else if (JOY_NEW(runtime, B_BUTTON)) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_CANCELREGISTER, 0); work.routineState = 4; }
      else if (TypeChatMessage_HandleDPad(runtime)) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_MOVEKBCURSOR, 0); work.routineState = 2; }
      break;
    case 2: if (!RunDisplaySubtask(runtime, 0)) work.routineState = 1; break;
    case 3: if (!RunDisplaySubtask(runtime, 0)) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_CANCELREGISTER, 0); work.routineState = 4; } break;
    case 4: if (!RunDisplaySubtask(runtime, 0)) GoToRoutine(runtime, CHATNETRYROUTINE_HANDLE_INPUT); break;
    case 5: if (!RunDisplaySubtask(runtime, 0)) work.routineState = 6; break;
    case 6: if (JOY_NEW(runtime, A_BUTTON | B_BUTTON)) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO, 0); work.routineState = 4; } break;
  }
};

export const ChatEntryRoutine_SaveAndExit = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  const input = UnionRoomChat_ProcessInput(runtime);
  switch (work.routineState) {
    case 0: work.routineState = work.changedRegisteredTexts ? 1 : 12; if (work.changedRegisteredTexts) StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO, 0); break;
    case 1: if (!RunDisplaySubtask(runtime, 0)) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_ASKSAVE, 0); work.routineState = 2; } break;
    case 2: if (input === -1 || input === 1) work.routineState = 12; else if (input === 0) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO, 0); work.routineState = 3; } break;
    case 3: if (!RunDisplaySubtask(runtime, 0)) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_ASKOVERWRITESAVE, 0); work.routineState = 4; } break;
    case 4: if (!RunDisplaySubtask(runtime, 0)) work.routineState = 5; break;
    case 5: if (input === -1 || input === 1) work.routineState = 12; else if (input === 0) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO, 0); work.routineState = 6; } break;
    case 6: if (!RunDisplaySubtask(runtime, 0)) { StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTSAVING, 0); SaveRegisteredTextsToSB1(runtime); work.routineState = 7; } break;
    case 7: if (!RunDisplaySubtask(runtime, 0)) { op(runtime, 'SetContinueGameWarpStatusToDynamicWarp'); op(runtime, 'TrySavingData:SAVE_NORMAL'); work.routineState = 8; } break;
    case 8: StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTSAVEDTHEGAME, 0); work.routineState = 9; break;
    case 9: if (!RunDisplaySubtask(runtime, 0)) { op(runtime, `PlaySE:${SE_SAVE}`); op(runtime, 'ClearContinueGameWarpStatus2'); work.routineState = 10; } break;
    case 10: work.afterSaveTimer = 0; work.routineState = 11; break;
    case 11: if (++work.afterSaveTimer > 120) work.routineState = 12; break;
    case 12: op(runtime, 'BeginNormalPaletteFade:black'); runtime.paletteFadeActive = true; work.routineState = 13; break;
    case 13: if (!runtime.paletteFadeActive) { op(runtime, 'HelpSystem_EnableToggleWithRButton'); op(runtime, 'UnionRoomChat_FreeGraphicsWork'); FreeChatWork(runtime); op(runtime, 'SetMainCallback2:CB2_ReturnToField'); } break;
  }
};

export const GoToRoutine = (runtime: UnionRoomChatRuntime, routineNo: number): void => {
  const work = mustWork(runtime);
  work.routineNo = routineNo;
  work.routineState = 0;
};

export const TypeChatMessage_HandleDPad = (runtime: UnionRoomChatRuntime): boolean => {
  const work = mustWork(runtime);
  if (JOY_REPT(runtime, DPAD_UP)) work.currentRow = work.currentRow > 0 ? work.currentRow - 1 : sKeyboardPageMaxRow[work.currentPage];
  else if (JOY_REPT(runtime, DPAD_DOWN)) work.currentRow = work.currentRow < sKeyboardPageMaxRow[work.currentPage] ? work.currentRow + 1 : 0;
  else if (work.currentPage !== UNION_ROOM_KB_PAGE_COUNT && JOY_REPT(runtime, DPAD_LEFT)) work.currentCol = work.currentCol > 0 ? work.currentCol - 1 : 4;
  else if (work.currentPage !== UNION_ROOM_KB_PAGE_COUNT && JOY_REPT(runtime, DPAD_RIGHT)) work.currentCol = work.currentCol < 4 ? work.currentCol + 1 : 0;
  else return false;
  return true;
};

export const AppendCharacterToChatMessageBuffer = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  const charsStr = work.currentPage !== UNION_ROOM_KB_PAGE_COUNT ? gUnionRoomKeyboardText[work.currentPage][work.currentRow] : `${work.registeredTexts[work.currentRow]} `;
  const chars = tokenizeKeyboardRow(charsStr);
  const append = work.currentPage !== UNION_ROOM_KB_PAGE_COUNT ? [chars[work.currentCol] ?? ''] : chars;
  work.lastBufferCursorPos = work.bufferCursorPos;
  for (const ch of append) {
    if (work.bufferCursorPos >= MESSAGE_BUFFER_NCHAR) break;
    work.messageEntryBuffer += ch;
    work.bufferCursorPos++;
  }
};

export const DeleteLastCharacterOfChatMessageBuffer = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  work.lastBufferCursorPos = work.bufferCursorPos;
  if (work.bufferCursorPos) {
    const chars = tokenizeKeyboardRow(work.messageEntryBuffer);
    chars.pop();
    work.messageEntryBuffer = chars.join('');
    work.bufferCursorPos--;
  }
};

export const ToggleCaseOfLastCharacterInChatMessageBuffer = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  work.lastBufferCursorPos = work.bufferCursorPos - 1;
  const chars = tokenizeKeyboardRow(work.messageEntryBuffer);
  const last = chars.at(-1);
  if (last && last.length === 1 && /[a-zA-Z]/.test(last)) {
    chars[chars.length - 1] = last === last.toUpperCase() ? last.toLowerCase() : last.toUpperCase();
    work.messageEntryBuffer = chars.join('');
  }
};

export const ChatMsgHasAtLeastOneCharcter = (runtime: UnionRoomChatRuntime): boolean => mustWork(runtime).bufferCursorPos !== 0;
export const RegisterTextAtRow = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  work.registeredTexts[work.currentRow] = UnionRoomChat_GetEndOfMessageEntryBuffer(runtime);
  work.changedRegisteredTexts = true;
};
export const ResetMessageEntryBuffer = (runtime: UnionRoomChatRuntime): void => {
  const work = mustWork(runtime);
  work.messageEntryBuffer = '';
  work.lastBufferCursorPos = MESSAGE_BUFFER_NCHAR;
  work.bufferCursorPos = 0;
};
export const SaveRegisteredTextsToSB1 = (runtime: UnionRoomChatRuntime): void => {
  runtime.saveBlock1RegisteredTexts = [...mustWork(runtime).registeredTexts];
};

export const PrepareSendBuffer_Null = (): ChatSendBuffer => ({ cmd: CHAT_MESSAGE_0, name: '', payload: '' });
export const PrepareSendBuffer_Join = (runtime: UnionRoomChatRuntime, work = mustWork(runtime)): ChatSendBuffer => ({ cmd: CHAT_MESSAGE_JOIN, name: runtime.playerName, payload: work.multiplayerId });
export const PrepareSendBuffer_Chat = (runtime: UnionRoomChatRuntime, work = mustWork(runtime)): ChatSendBuffer => ({ cmd: CHAT_MESSAGE_CHAT, name: runtime.playerName, payload: work.messageEntryBuffer });
export const PrepareSendBuffer_Leave = (runtime: UnionRoomChatRuntime, work = mustWork(runtime)): ChatSendBuffer => { op(runtime, 'RfuSetNormalDisconnectMode'); return { cmd: CHAT_MESSAGE_LEAVE, name: runtime.playerName, payload: work.multiplayerId }; };
export const PrepareSendBuffer_Drop = (runtime: UnionRoomChatRuntime, work = mustWork(runtime)): ChatSendBuffer => ({ cmd: CHAT_MESSAGE_DROP, name: runtime.playerName, payload: work.multiplayerId });
export const PrepareSendBuffer_Disband = (runtime: UnionRoomChatRuntime, work = mustWork(runtime)): ChatSendBuffer => ({ cmd: CHAT_MESSAGE_DISBAND, name: runtime.playerName, payload: work.multiplayerId });

export const ProcessReceivedChatMessage = (runtime: UnionRoomChatRuntime, recvMessage: ChatSendBuffer): string | undefined => {
  const work = mustWork(runtime);
  switch (recvMessage.cmd) {
    case CHAT_MESSAGE_JOIN:
      if (work.multiplayerId !== recvMessage.payload) return `${recvMessage.name} joined chat`;
      break;
    case CHAT_MESSAGE_CHAT:
      return `${recvMessage.name}: ${recvMessage.payload}`;
    case CHAT_MESSAGE_DISBAND:
      work.hostName = recvMessage.name;
    case CHAT_MESSAGE_LEAVE:
      if (work.multiplayerId !== recvMessage.payload) return `${recvMessage.name} left chat`;
      break;
  }
  return undefined;
};

export const Task_ReceiveChatMessage = (runtime: UnionRoomChatRuntime, taskId: number): void => {
  const work = mustWork(runtime);
  const task = runtime.tasks[taskId] ?? (runtime.tasks[taskId] = { id: taskId, data: Array.from({ length: 6 }, () => 0), destroyed: false });
  const data = task.data;
  switch (data[0]) {
    case 0:
      if (!runtime.receivedRemoteLinkPlayers) return DestroyTask(runtime, taskId);
      data[0] = 1;
    case 1:
      data[4] = runtime.linkPlayerCount;
      if (work.linkPlayerCount !== data[4]) { data[0] = 2; work.linkPlayerCount = data[4]; return; }
      data[3] = runtime.blockReceivedStatus;
      if (!data[3] && runtime.playerExchangeActive) return;
      data[1] = 0;
      data[0] = 3;
    case 3:
      for (; data[1] < 5 && ((data[3] >> data[1]) & 1) === 0; data[1]++);
      if (data[1] === 5) { data[0] = 1; return; }
      data[2] = data[1];
      ResetBlockReceivedFlag(runtime, data[2]);
      {
        const buffer = runtime.blockRecvBuffer[data[1]] ?? PrepareSendBuffer_Null();
        data[5] = buffer.cmd === CHAT_MESSAGE_LEAVE ? 4 : buffer.cmd === CHAT_MESSAGE_DROP ? 5 : buffer.cmd === CHAT_MESSAGE_DISBAND ? 6 : 3;
        const processed = ProcessReceivedChatMessage(runtime, buffer);
        if (processed) {
          work.receivedMessage = processed;
          work.receivedPlayerIndex = data[1];
          StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_SCROLLCHAT, 2);
          data[0] = 7;
        } else data[0] = data[5];
      }
      data[1]++;
      break;
    case 7:
      if (!RunDisplaySubtask(runtime, 2)) data[0] = data[5];
      break;
    case 4:
      if (work.multiplayerId === 0 && data[2] !== 0) {
        if (runtime.linkPlayerCount === 2) {
          op(runtime, 'Rfu_StopPartnerSearch');
          work.exitType = CHATEXIT_LEADER_LAST;
          DestroyTask(runtime, taskId);
          return;
        }
        op(runtime, `Rfu_DisconnectPlayerById:${data[2]}`);
      }
      data[0] = 3;
      break;
    case 5:
      if (work.multiplayerId !== 0) work.exitType = CHATEXIT_DROPPED;
      DestroyTask(runtime, taskId);
      break;
    case 6:
      work.exitType = CHATEXIT_DISBANDED;
      DestroyTask(runtime, taskId);
      break;
    case 2:
      if (!runtime.playerExchangeActive) {
        if (work.multiplayerId === 0) op(runtime, `SetUnionRoomChatPlayerData:${work.linkPlayerCount}`);
        data[0] = 1;
      }
      break;
  }
};

export const GetCurrentKeyboardPage = (runtime: UnionRoomChatRuntime): number => mustWork(runtime).currentPage;
export const UnionRoomChat_GetWorkRegisteredText = (arg0: number, runtime: UnionRoomChatRuntime): string =>
  mustWork(runtime).registeredTexts[arg0] ?? '';
export const GetEndOfUnk1A = (runtime: UnionRoomChatRuntime): string => {
  const work = mustWork(runtime);
  return work.messageEntryBuffer.slice(work.messageEntryBuffer.length);
};
export const GetPtrToLastCharOfUnk1A = (runtime: UnionRoomChatRuntime): string =>
  tokenizeKeyboardRow(mustWork(runtime).messageEntryBuffer).at(-1) ?? '';
export const UnionRoomChat_GetMessageEntryBuffer = (runtime: UnionRoomChatRuntime): string =>
  mustWork(runtime).messageEntryBuffer;
export const UnionRoomChat_GetCursorColAndRow = (runtime: UnionRoomChatRuntime): [number, number] => [mustWork(runtime).currentCol, mustWork(runtime).currentRow];
export const UnionRoomChat_GetBufferSelectionRegion = (runtime: UnionRoomChatRuntime): [number, number] => {
  const work = mustWork(runtime);
  let diff = work.bufferCursorPos - work.lastBufferCursorPos;
  let start = work.lastBufferCursorPos;
  if (diff < 0) { diff *= -1; start = work.bufferCursorPos; }
  return [start, diff];
};
export const UnionRoomChat_GetEndOfMessageEntryBuffer = (runtime: UnionRoomChatRuntime): string => tokenizeKeyboardRow(mustWork(runtime).messageEntryBuffer).slice(GetNumCharsInMessageEntryBuffer(runtime)).join('');
export const UnionRoomChat_GetNumCharsInMessageEntryBuffer = (runtime: UnionRoomChatRuntime): number => GetNumCharsInMessageEntryBuffer(runtime);
export const UnionRoomChat_GetReceivedPlayerIndex = (runtime: UnionRoomChatRuntime): number => mustWork(runtime).receivedPlayerIndex;
export const UnionRoomChat_GetLastReceivedMessage = (runtime: UnionRoomChatRuntime): string => mustWork(runtime).receivedMessage;
export const UnionRoomChat_LenMessageEntryBuffer = (runtime: UnionRoomChatRuntime): number => tokenizeKeyboardRow(mustWork(runtime).messageEntryBuffer).length;
export const UnionRoomChat_GetMessageEntryCursorPosition = (runtime: UnionRoomChatRuntime): number => mustWork(runtime).bufferCursorPos;
export const UnionRoomChat_GetWhetherShouldShowCaseToggleIcon = (runtime: UnionRoomChatRuntime): number => {
  const last = tokenizeKeyboardRow(mustWork(runtime).messageEntryBuffer).at(-1) ?? '';
  return last.length === 1 && /[a-zA-Z]/.test(last) ? 0 : 3;
};
export const UnionRoomChat_InitializeRegisteredTexts = (runtime: UnionRoomChatRuntime): void => {
  runtime.saveBlock1RegisteredTexts = ['Hello', 'Pokemon', 'Trade', 'Battle', 'Lets', 'Ok', 'Sorry', 'Yay', 'Thank you', 'Bye-bye'];
};
export const UnionRoomChat_GetNameOfPlayerWhoDisbandedChat = (runtime: UnionRoomChatRuntime): string => mustWork(runtime).hostName;

const runCurrentChatEntryRoutine = (runtime: UnionRoomChatRuntime): void => {
  switch (mustWork(runtime).routineNo) {
    case CHATENTRYROUTINE_JOIN: return ChatEntryRoutine_Join(runtime);
    case CHATNETRYROUTINE_HANDLE_INPUT: return ChatEntryRoutine_HandleInput(runtime);
    case CHATENTRYROUTINE_SWITCH: return ChatEntryRoutine_Switch(runtime);
    case CHATENTRYROUTINE_ASKQUITCHATTING: return ChatEntryRoutine_AskQuitChatting(runtime);
    case CHATENTRYROUTINE_SEND: return ChatEntryRoutine_SendMessage(runtime);
    case CHATENTRYROUTINE_REGISTER: return ChatEntryRoutine_Register(runtime);
    case CHATENTRYROUTINE_EXITCHAT: return ChatEntryRoutine_ExitChat(runtime);
    case CHATENTRYROUTINE_DROP: return ChatEntryRoutine_Drop(runtime);
    case CHATENTRYROUTINE_DISBANDED: return ChatEntryRoutine_Disbanded(runtime);
    case CHATENTRYROUTINE_SAVEANDEXIT: return ChatEntryRoutine_SaveAndExit(runtime);
  }
};

const runExitLikeRoutine = (runtime: UnionRoomChatRuntime, mode: 'exit' | 'drop' | 'disbanded'): void => {
  const work = mustWork(runtime);
  switch (work.routineState) {
    case 0:
      if (mode === 'exit') StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO, 0);
      if (mode === 'disbanded' && work.multiplayerId) StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO, 0);
      work.routineState++;
      break;
    case 1:
      if (!RunDisplaySubtask(runtime, 0)) {
        if (mode === 'exit') StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTEXITINGCHAT, 0);
        if (mode === 'disbanded' && work.multiplayerId) StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTLEADERLEFT, 0);
        work.routineState++;
      }
      break;
    case 2:
      if (mode === 'exit' && !RunDisplaySubtask(runtime, 0)) { work.sendMessageBuffer = PrepareSendBuffer_Drop(runtime, work); work.routineState = 3; }
      else if (mode !== 'exit' && !RunDisplaySubtask(runtime, 0) && runtime.linkTaskFinished && !runtime.playerExchangeActive) { op(runtime, 'SetCloseLinkCallback'); work.exitDelayTimer = 0; work.routineState = 3; }
      break;
    case 3:
      if (mode === 'exit') { if (runtime.linkTaskFinished && !runtime.playerExchangeActive && SendBlock(runtime, work.sendMessageBuffer)) work.routineState++; }
      else { if (work.exitDelayTimer < 150) work.exitDelayTimer++; if (!runtime.receivedRemoteLinkPlayers) work.routineState++; }
      break;
    case 4:
      if (mode === 'exit') { if ((runtime.blockReceivedStatus & 1) && !runtime.playerExchangeActive) work.routineState++; }
      else if (work.exitDelayTimer >= 150) GoToRoutine(runtime, CHATENTRYROUTINE_SAVEANDEXIT); else work.exitDelayTimer++;
      break;
    case 5:
      if (runtime.linkTaskFinished && !runtime.playerExchangeActive) { op(runtime, 'SetCloseLinkCallback'); work.exitDelayTimer = 0; work.routineState++; }
      break;
    case 6:
      if (work.exitDelayTimer < 150) work.exitDelayTimer++;
      if (!runtime.receivedRemoteLinkPlayers) work.routineState++;
      break;
    case 7:
      if (work.exitDelayTimer >= 150) GoToRoutine(runtime, CHATENTRYROUTINE_SAVEANDEXIT); else work.exitDelayTimer++;
      break;
  }
};

export const GetNumCharsInMessageEntryBuffer = (runtime: UnionRoomChatRuntime): number => Math.max(0, tokenizeKeyboardRow(mustWork(runtime).messageEntryBuffer).length - 10);
const tokenizeKeyboardRow = (text: string): string[] => text.match(/\{[^}]+\}|./g) ?? [];
const JOY_NEW = (runtime: UnionRoomChatRuntime, mask: number): boolean => (runtime.keyNew & mask) !== 0;
const JOY_REPT = (runtime: UnionRoomChatRuntime, mask: number): boolean => (runtime.keyRepeat & mask) !== 0;
const Menu_ProcessInput = (runtime: UnionRoomChatRuntime): number => runtime.menuInputs.length ? runtime.menuInputs.shift()! : MENU_NOTHING_CHOSEN;
const UnionRoomChat_ProcessInput = (runtime: UnionRoomChatRuntime): number => runtime.chatInputs.length ? runtime.chatInputs.shift()! : -2;
const SendBlock = (runtime: UnionRoomChatRuntime, buffer: ChatSendBuffer): boolean => {
  const result = runtime.sendBlockResults.length ? runtime.sendBlockResults.shift()! : true;
  if (result) op(runtime, `SendBlock:${buffer.cmd}:${buffer.name}:${buffer.payload}`);
  return result;
};
const StartDisplaySubtask = (runtime: UnionRoomChatRuntime, routine: number, subtask: number): void => op(runtime, `UnionRoomChat_StartDisplaySubtask:${routine}:${subtask}`);
const RunDisplaySubtask = (runtime: UnionRoomChatRuntime, subtask: number): boolean => {
  const queue = runtime.displaySubtaskBusy[subtask];
  return queue?.length ? queue.shift()! : false;
};
const ResetBlockReceivedFlag = (runtime: UnionRoomChatRuntime, player: number): void => { runtime.blockReceivedStatus &= ~(1 << player); };
const CreateTask = (runtime: UnionRoomChatRuntime, func: 'Task_HandlePlayerInput' | 'Task_ReceiveChatMessage', priority: number): number => {
  const id = runtime.tasks.length;
  const data = Array.from({ length: 16 }, () => 0);
  data[15] = priority;
  runtime.tasks[id] = { id, data, destroyed: false };
  op(runtime, `CreateTask:${func}:${priority}:${id}`);
  return id;
};
const DestroyTask = (runtime: UnionRoomChatRuntime, taskId: number): void => {
  if (runtime.tasks[taskId]) runtime.tasks[taskId].destroyed = true;
  op(runtime, `DestroyTask:${taskId}`);
};
const mustWork = (runtime: UnionRoomChatRuntime): UnionRoomChatWork => {
  if (!runtime.sWork) throw new Error('sWork is NULL');
  return runtime.sWork;
};
const op = (runtime: UnionRoomChatRuntime, operation: string): void => { runtime.operations.push(operation); };
