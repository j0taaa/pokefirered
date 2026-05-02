import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  CHATENTRYROUTINE_ASKQUITCHATTING,
  CHATENTRYROUTINE_JOIN,
  CHATENTRYROUTINE_REGISTER,
  CHATENTRYROUTINE_SAVEANDEXIT,
  CHATENTRYROUTINE_SEND,
  CHATEXIT_LEADER_LAST,
  CHAT_MESSAGE_CHAT,
  CHAT_MESSAGE_DISBAND,
  CHAT_MESSAGE_DROP,
  CHAT_MESSAGE_JOIN,
  CHAT_MESSAGE_LEAVE,
  CHATNETRYROUTINE_HANDLE_INPUT,
  DPAD_DOWN,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_UP,
  MESSAGE_BUFFER_NCHAR,
  R_BUTTON,
  SELECT_BUTTON,
  START_BUTTON,
  UNION_ROOM_KB_PAGE_COUNT,
  UNION_ROOM_KB_PAGE_LOWER,
  AppendCharacterToChatMessageBuffer,
  ChatEntryRoutine_AskQuitChatting,
  ChatEntryRoutine_HandleInput,
  ChatEntryRoutine_Join,
  ChatEntryRoutine_Register,
  ChatEntryRoutine_SaveAndExit,
  ChatEntryRoutine_SendMessage,
  DeleteLastCharacterOfChatMessageBuffer,
  EnterUnionRoomChat,
  GetEndOfUnk1A,
  GetPtrToLastCharOfUnk1A,
  GoToRoutine,
  InitChatWork,
  PrepareSendBuffer_Chat,
  PrepareSendBuffer_Disband,
  PrepareSendBuffer_Drop,
  PrepareSendBuffer_Join,
  PrepareSendBuffer_Leave,
  ProcessReceivedChatMessage,
  RegisterTextAtRow,
  ResetMessageEntryBuffer,
  SaveRegisteredTextsToSB1,
  Task_HandlePlayerInput,
  Task_ReceiveChatMessage,
  ToggleCaseOfLastCharacterInChatMessageBuffer,
  TypeChatMessage_HandleDPad,
  CB2_LoadInterface,
  CB2_UnionRoomChatMain,
  VBlankCB_UnionRoomChatMain,
  UnionRoomChat_GetBufferSelectionRegion,
  UnionRoomChat_GetCursorColAndRow,
  UnionRoomChat_GetEndOfMessageEntryBuffer,
  UnionRoomChat_GetLastReceivedMessage,
  UnionRoomChat_GetMessageEntryBuffer,
  UnionRoomChat_GetMessageEntryCursorPosition,
  UnionRoomChat_GetNameOfPlayerWhoDisbandedChat,
  UnionRoomChat_GetNumCharsInMessageEntryBuffer,
  UnionRoomChat_GetReceivedPlayerIndex,
  UnionRoomChat_GetWhetherShouldShowCaseToggleIcon,
  UnionRoomChat_GetWorkRegisteredText,
  UnionRoomChat_InitializeRegisteredTexts,
  UnionRoomChat_LenMessageEntryBuffer,
  createUnionRoomChatRuntime
} from '../src/game/decompUnionRoomChat';

describe('decomp union_room_chat', () => {
  test('C-name work buffer accessors return the current sWork string slots', () => {
    const runtime = createUnionRoomChatRuntime();
    EnterUnionRoomChat(runtime);
    const work = runtime.sWork!;
    work.registeredTexts[3] = 'TRADE';
    work.messageEntryBuffer = 'AB{PK}';
    work.receivedMessage = 'HELLO';
    work.hostName = 'HOST';

    expect(UnionRoomChat_GetWorkRegisteredText(3, runtime)).toBe('TRADE');
    expect(GetEndOfUnk1A(runtime)).toBe('');
    expect(GetPtrToLastCharOfUnk1A(runtime)).toBe('{PK}');
    expect(UnionRoomChat_GetMessageEntryBuffer(runtime)).toBe('AB{PK}');
    expect(UnionRoomChat_GetLastReceivedMessage(runtime)).toBe('HELLO');
    expect(UnionRoomChat_GetNameOfPlayerWhoDisbandedChat(runtime)).toBe('HOST');
  });

  test('enter/init, join routine, input routine, keyboard movement, and buffer editing mirror C state', () => {
    const runtime = createUnionRoomChatRuntime({ playerName: 'RED', linkPlayerCount: 3, multiplayerId: 1 });
    EnterUnionRoomChat(runtime);
    const work = runtime.sWork!;
    expect(work.routineNo).toBe(CHATENTRYROUTINE_JOIN);
    expect(work.linkPlayerCount).toBe(3);
    expect(work.sendMessageBuffer.cmd).toBe(0);
    expect(runtime.operations).toContain('SetMainCallback2:CB2_LoadInterface');

    ChatEntryRoutine_Join(runtime);
    expect(work.sendMessageBuffer).toEqual({ cmd: CHAT_MESSAGE_JOIN, name: 'RED', payload: 1 });
    expect(work.routineState).toBe(2);
    ChatEntryRoutine_Join(runtime);
    expect(work.routineNo).toBe(CHATNETRYROUTINE_HANDLE_INPUT);

    work.routineState = 0;
    work.currentPage = 0;
    work.currentRow = 0;
    work.currentCol = 0;
    runtime.keyNew = A_BUTTON;
    ChatEntryRoutine_HandleInput(runtime);
    expect(work.messageEntryBuffer).toBe('A');
    expect(work.bufferCursorPos).toBe(1);
    expect(work.routineState).toBe(1);
    ChatEntryRoutine_HandleInput(runtime);
    expect(work.routineState).toBe(0);

    runtime.keyNew = R_BUTTON;
    ChatEntryRoutine_HandleInput(runtime);
    expect(work.messageEntryBuffer).toBe('a');
    runtime.keyNew = 0;
    work.routineState = 0;
    runtime.keyRepeat = DPAD_LEFT;
    expect(TypeChatMessage_HandleDPad(runtime)).toBe(true);
    expect(work.currentCol).toBe(4);
    runtime.keyRepeat = DPAD_UP;
    TypeChatMessage_HandleDPad(runtime);
    expect(work.currentRow).toBe(9);
    runtime.keyRepeat = DPAD_DOWN;
    TypeChatMessage_HandleDPad(runtime);
    expect(work.currentRow).toBe(0);
    runtime.keyRepeat = DPAD_RIGHT;
    TypeChatMessage_HandleDPad(runtime);
    expect(work.currentCol).toBe(0);

    runtime.keyRepeat = B_BUTTON;
    ChatEntryRoutine_HandleInput(runtime);
    expect(work.messageEntryBuffer).toBe('');
    expect(UnionRoomChat_GetBufferSelectionRegion(runtime)).toEqual([0, 1]);

    work.currentPage = UNION_ROOM_KB_PAGE_COUNT;
    work.currentRow = 0;
    work.registeredTexts[0] = 'Hello';
    AppendCharacterToChatMessageBuffer(runtime);
    expect(work.messageEntryBuffer).toBe('Hello ');
    expect(work.bufferCursorPos).toBe(6);
    DeleteLastCharacterOfChatMessageBuffer(runtime);
    expect(work.messageEntryBuffer).toBe('Hello');
    expect(UnionRoomChat_GetCursorColAndRow(runtime)).toEqual([0, 0]);
  });

  test('send buffers, send routine, register routine, and save-and-exit flow preserve side effects', () => {
    const runtime = createUnionRoomChatRuntime({ playerName: 'LEAF', multiplayerId: 0 });
    runtime.sWork = InitChatWork(runtime);
    const work = runtime.sWork;
    work.messageEntryBuffer = 'ABCDEFGHIJKL';
    work.bufferCursorPos = 12;
    expect(UnionRoomChat_GetNumCharsInMessageEntryBuffer(runtime)).toBe(2);
    expect(UnionRoomChat_GetEndOfMessageEntryBuffer(runtime)).toBe('CDEFGHIJKL');

    expect(PrepareSendBuffer_Join(runtime)).toEqual({ cmd: CHAT_MESSAGE_JOIN, name: 'LEAF', payload: 0 });
    expect(PrepareSendBuffer_Chat(runtime)).toEqual({ cmd: CHAT_MESSAGE_CHAT, name: 'LEAF', payload: 'ABCDEFGHIJKL' });
    expect(PrepareSendBuffer_Leave(runtime)).toEqual({ cmd: CHAT_MESSAGE_LEAVE, name: 'LEAF', payload: 0 });
    expect(PrepareSendBuffer_Drop(runtime).cmd).toBe(CHAT_MESSAGE_DROP);
    expect(PrepareSendBuffer_Disband(runtime).cmd).toBe(CHAT_MESSAGE_DISBAND);

    GoToRoutine(runtime, CHATENTRYROUTINE_SEND);
    ChatEntryRoutine_SendMessage(runtime);
    expect(work.routineState).toBe(2);
    ChatEntryRoutine_SendMessage(runtime);
    expect(work.messageEntryBuffer).toBe('');
    expect(work.lastBufferCursorPos).toBe(MESSAGE_BUFFER_NCHAR);
    ChatEntryRoutine_SendMessage(runtime);
    ChatEntryRoutine_SendMessage(runtime);
    expect(work.routineNo).toBe(CHATNETRYROUTINE_HANDLE_INPUT);

    work.messageEntryBuffer = 'REGISTERED';
    work.bufferCursorPos = 10;
    work.currentRow = 2;
    RegisterTextAtRow(runtime);
    expect(work.registeredTexts[2]).toBe('REGISTERED');
    expect(work.changedRegisteredTexts).toBe(true);
    SaveRegisteredTextsToSB1(runtime);
    expect(runtime.saveBlock1RegisteredTexts[2]).toBe('REGISTERED');
    ResetMessageEntryBuffer(runtime);
    expect(work.bufferCursorPos).toBe(0);

    GoToRoutine(runtime, CHATENTRYROUTINE_REGISTER);
    ChatEntryRoutine_Register(runtime);
    expect(work.routineState).toBe(5);
    runtime.keyNew = A_BUTTON;
    ChatEntryRoutine_Register(runtime);

    work.changedRegisteredTexts = true;
    GoToRoutine(runtime, CHATENTRYROUTINE_SAVEANDEXIT);
    ChatEntryRoutine_SaveAndExit(runtime);
    expect(work.routineState).toBe(1);
    ChatEntryRoutine_SaveAndExit(runtime);
    runtime.chatInputs = Array.from({ length: 12 }, () => 0);
    for (let i = 0; i < 12 && !runtime.operations.includes('TrySavingData:SAVE_NORMAL'); i++) {
      ChatEntryRoutine_SaveAndExit(runtime);
    }
    expect(runtime.operations).toContain('TrySavingData:SAVE_NORMAL');
  });

  test('ask-quit and receive-message task follow leave/drop/disband state branches', () => {
    const runtime = createUnionRoomChatRuntime({ playerName: 'HOST', multiplayerId: 0, linkPlayerCount: 2 });
    runtime.sWork = InitChatWork(runtime);
    const work = runtime.sWork;

    GoToRoutine(runtime, CHATENTRYROUTINE_ASKQUITCHATTING);
    ChatEntryRoutine_AskQuitChatting(runtime);
    ChatEntryRoutine_AskQuitChatting(runtime);
    runtime.chatInputs = Array.from({ length: 8 }, () => 0);
    for (let i = 0; i < 8 && !runtime.operations.some((op) => op.startsWith('SendBlock:5')); i++) {
      ChatEntryRoutine_AskQuitChatting(runtime);
    }
    expect(work.sendMessageBuffer.cmd).toBe(CHAT_MESSAGE_DISBAND);
    expect(runtime.operations.some((op) => op.startsWith('SendBlock:5'))).toBe(true);

    runtime.blockRecvBuffer[1] = { cmd: CHAT_MESSAGE_JOIN, name: 'BLUE', payload: 1 };
    runtime.blockReceivedStatus = 1 << 1;
    Task_ReceiveChatMessage(runtime, 0);
    expect(work.receivedMessage).toBe('BLUE joined chat');
    expect(UnionRoomChat_GetReceivedPlayerIndex(runtime)).toBe(1);
    expect(runtime.operations).toContain('UnionRoomChat_StartDisplaySubtask:12:2');
    Task_ReceiveChatMessage(runtime, 0);
    expect(runtime.tasks[0].data[0]).toBe(3);

    runtime.blockRecvBuffer[1] = { cmd: CHAT_MESSAGE_LEAVE, name: 'BLUE', payload: 1 };
    runtime.blockReceivedStatus = 1 << 1;
    runtime.tasks[0].data[0] = 1;
    Task_ReceiveChatMessage(runtime, 0);
    Task_ReceiveChatMessage(runtime, 0);
    Task_ReceiveChatMessage(runtime, 0);
    expect(work.exitType).toBe(CHATEXIT_LEADER_LAST);
    expect(runtime.tasks[0].destroyed).toBe(true);

    runtime.tasks[2] = { id: 2, data: [0, 0, 0, 0, 0, 0], destroyed: false };
    runtime.sWork = InitChatWork(createUnionRoomChatRuntime({ multiplayerId: 1 }));
    runtime.sWork.multiplayerId = 1;
    runtime.blockRecvBuffer[0] = { cmd: CHAT_MESSAGE_DROP, name: 'HOST', payload: 0 };
    runtime.blockReceivedStatus = 1;
    Task_ReceiveChatMessage(runtime, 2);
    Task_ReceiveChatMessage(runtime, 2);
    expect(runtime.sWork.exitType).toBe(2);

    runtime.sWork = InitChatWork(runtime);
    runtime.blockRecvBuffer[0] = { cmd: CHAT_MESSAGE_DISBAND, name: 'HOST', payload: 0 };
    expect(ProcessReceivedChatMessage(runtime, runtime.blockRecvBuffer[0])).toBeUndefined();
    expect(runtime.sWork.hostName).toBe('HOST');
  });

  test('public initialization and task dispatch helpers expose C-visible state', () => {
    const runtime = createUnionRoomChatRuntime();
    UnionRoomChat_InitializeRegisteredTexts(runtime);
    expect(runtime.saveBlock1RegisteredTexts[0]).toBe('Hello');
    EnterUnionRoomChat(runtime);
    runtime.sWork!.exitType = CHATEXIT_LEADER_LAST;
    Task_HandlePlayerInput(runtime, 0);
    expect(runtime.sWork!.routineNo).toBe(6);
    runtime.sWork!.routineNo = CHATNETRYROUTINE_HANDLE_INPUT;
    runtime.sWork!.routineState = 0;
    runtime.sWork!.bufferCursorPos = 1;
    runtime.keyNew = START_BUTTON;
    Task_HandlePlayerInput(runtime, 0);
    expect(runtime.sWork!.routineNo).toBe(CHATENTRYROUTINE_SEND);
    runtime.sWork!.currentPage = UNION_ROOM_KB_PAGE_LOWER;
    ToggleCaseOfLastCharacterInChatMessageBuffer(runtime);
    expect(GetCurrentKeyboardPageShim(runtime)).toBe(UNION_ROOM_KB_PAGE_LOWER);
    expect(SELECT_BUTTON).toBeGreaterThan(0);
  });

  test('exact C-name callbacks and message-buffer accessors mirror union_room_chat.c', () => {
    const runtime = createUnionRoomChatRuntime({ playerName: 'RED' });
    EnterUnionRoomChat(runtime);
    const work = runtime.sWork!;

    CB2_LoadInterface(runtime);
    expect(runtime.mainState).toBe(1);
    expect(runtime.operations).toEqual(expect.arrayContaining([
      'ResetTasks',
      'ResetSpriteData',
      'FreeAllSpritePalettes',
      'UnionRoomChat_TryAllocGraphicsWork'
    ]));

    CB2_LoadInterface(runtime);
    expect(runtime.mainState).toBe(2);
    expect(runtime.operations).toEqual(expect.arrayContaining([
      'UnionRoomChat_RunDisplaySubtasks',
      'BlendPalettes:PALETTES_ALL:16:RGB_BLACK',
      'BeginNormalPaletteFade:PALETTES_ALL:-1:16:0:RGB_BLACK',
      'SetVBlankCallback:VBlankCB_UnionRoomChatMain'
    ]));

    CB2_LoadInterface(runtime);
    expect(work.handleInputTask).toBe(0);
    expect(work.receiveMessagesTask).toBe(1);
    expect(runtime.operations).toEqual(expect.arrayContaining([
      'SetMainCallback2:CB2_UnionRoomChatMain',
      'SetQuestLogEvent:QL_EVENT_USED_UNION_ROOM_CHAT',
      'CreateTask:Task_HandlePlayerInput:8:0',
      'CreateTask:Task_ReceiveChatMessage:7:1',
      'CreateWirelessStatusIndicatorSprite:232:150'
    ]));

    VBlankCB_UnionRoomChatMain(runtime);
    expect(runtime.operations.slice(-4)).toEqual([
      'TransferPlttBuffer',
      'LoadOam',
      'ProcessSpriteCopyRequests',
      'ScanlineEffect_InitHBlankDmaTransfer'
    ]);

    work.routineNo = CHATENTRYROUTINE_SEND;
    work.routineState = 0;
    work.messageEntryBuffer = 'HELLO';
    work.bufferCursorPos = 5;
    CB2_UnionRoomChatMain(runtime);
    expect(runtime.operations).toContain('RunTasks');
    expect(runtime.operations).toContain('UnionRoomChat_RunDisplaySubtasks');
    expect(runtime.operations).toContain('AnimateSprites');
    expect(work.routineState).toBe(2);

    work.messageEntryBuffer = 'ABCDEFGHIJKL';
    work.bufferCursorPos = 12;
    expect(UnionRoomChat_LenMessageEntryBuffer(runtime)).toBe(12);
    expect(UnionRoomChat_GetNumCharsInMessageEntryBuffer(runtime)).toBe(2);
    expect(UnionRoomChat_GetMessageEntryCursorPosition(runtime)).toBe(12);
    expect(UnionRoomChat_GetWhetherShouldShowCaseToggleIcon(runtime)).toBe(0);
    work.messageEntryBuffer = 'ABC!';
    expect(UnionRoomChat_GetWhetherShouldShowCaseToggleIcon(runtime)).toBe(3);
  });
});

const GetCurrentKeyboardPageShim = (runtime: ReturnType<typeof createUnionRoomChatRuntime>): number => runtime.sWork!.currentPage;
