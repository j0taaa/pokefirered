import {
  gFameCheckerText_Cancel,
  gText_AlreadyHadCard,
  gText_AlreadyHadNews,
  gText_AlreadyHadStamp,
  gText_CantAcceptCardFromTrainer,
  gText_CantAcceptNewsFromTrainer,
  gText_CantSendGiftToTrainer,
  gText_CommunicationCanceled,
  gText_CommunicationCompleted,
  gText_CommunicationError,
  gText_DataWillBeSaved,
  gText_DontHaveCardNewOneInput,
  gText_DontHaveNewsNewOneInput,
  gText_Exit3,
  gText_Friend2,
  gText_GiftSentTo,
  gText_HaventReceivedCardsGift,
  gText_HaventReceivedGiftOkayToDiscard,
  gText_IfThrowAwayCardEventWontHappen,
  gText_MysteryGift2,
  gText_NewStampReceived,
  gText_NewTrainerReceived,
  gText_NoMoreRoomForStamps,
  gText_NothingSentOver,
  gText_OkayToDiscardNews,
  gText_OtherTrainerCanceled,
  gText_OtherTrainerHasCard,
  gText_OtherTrainerHasNews,
  gText_OtherTrainerHasStamp,
  gText_PickOKCancel,
  gText_PickOKExit,
  gText_Receive,
  gText_RecordUploadedViaWireless,
  gText_SaveCompletedPressA,
  gText_Send,
  gText_SendingWonderCard,
  gText_SendingWonderNews,
  gText_StampSentTo,
  gText_ThrowAwayWonderCard,
  gText_Toss,
  gText_WhatToDoWithCards,
  gText_WhatToDoWithNews,
  gText_WhereShouldCardBeAccessed,
  gText_WhereShouldNewsBeAccessed,
  gText_WirelessCommunication,
  gText_WonderCardReceived,
  gText_WonderCardReceivedFrom,
  gText_WonderCardSentTo,
  gText_WonderCardThrownAway,
  gText_WonderCards,
  gText_WonderNews,
  gText_WonderNewsReceived,
  gText_WonderNewsReceivedFrom,
  gText_WonderNewsSentTo,
  gText_WonderNewsThrownAway,
  gJPText_DecideStop,
  gJPText_MysteryGift
} from './decompStrings';

export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const LIST_NOTHING_CHOSEN = -1;
export const LIST_CANCEL = -2;
export const MENU_NOTHING_CHOSEN = -2;
export const MENU_B_PRESSED = -1;
export const LINKUP_FAILED = 2;
export const CLIENT_MAX_MSG_SIZE = 64;
export const SAVE_NORMAL = 0;
export const ACTIVITY_WONDER_CARD = 0x45;
export const ACTIVITY_WONDER_NEWS = 0x46;
export const WONDER_NEWS_RECV_FRIEND = 1;
export const WONDER_NEWS_RECV_WIRELESS = 2;
export const WONDER_NEWS_SENT = 3;

export const CLI_RET_INIT = 0;
export const CLI_RET_ACTIVE = 1;
export const CLI_RET_YES_NO = 2;
export const CLI_RET_PRINT_MSG = 3;
export const CLI_RET_ASK_TOSS = 4;
export const CLI_RET_COPY_MSG = 5;
export const CLI_RET_END = 6;

export const CLI_MSG_NOTHING_SENT = 0;
export const CLI_MSG_RECORD_UPLOADED = 1;
export const CLI_MSG_CARD_RECEIVED = 2;
export const CLI_MSG_NEWS_RECEIVED = 3;
export const CLI_MSG_STAMP_RECEIVED = 4;
export const CLI_MSG_HAD_CARD = 5;
export const CLI_MSG_HAD_STAMP = 6;
export const CLI_MSG_HAD_NEWS = 7;
export const CLI_MSG_NO_ROOM_STAMPS = 8;
export const CLI_MSG_COMM_CANCELED = 9;
export const CLI_MSG_CANT_ACCEPT = 10;
export const CLI_MSG_COMM_ERROR = 11;
export const CLI_MSG_TRAINER_RECEIVED = 12;
export const CLI_MSG_BUFFER_SUCCESS = 13;
export const CLI_MSG_BUFFER_FAILURE = 14;

export const SVR_RET_INIT = 0;
export const SVR_RET_ACTIVE = 1;
export const SVR_RET_UNUSED = 2;
export const SVR_RET_END = 3;

export const SVR_MSG_NOTHING_SENT = 0;
export const SVR_MSG_RECORD_UPLOADED = 1;
export const SVR_MSG_CARD_SENT = 2;
export const SVR_MSG_NEWS_SENT = 3;
export const SVR_MSG_STAMP_SENT = 4;
export const SVR_MSG_HAS_CARD = 5;
export const SVR_MSG_HAS_STAMP = 6;
export const SVR_MSG_HAS_NEWS = 7;
export const SVR_MSG_NO_ROOM_STAMPS = 8;
export const SVR_MSG_CLIENT_CANCELED = 9;
export const SVR_MSG_CANT_SEND_GIFT_1 = 10;
export const SVR_MSG_COMM_ERROR = 11;
export const SVR_MSG_GIFT_SENT_1 = 12;
export const SVR_MSG_GIFT_SENT_2 = 13;
export const SVR_MSG_CANT_SEND_GIFT_2 = 14;

export const MG_STATE_TO_MAIN_MENU = 0;
export const MG_STATE_MAIN_MENU = 1;
export const MG_STATE_DONT_HAVE_ANY = 2;
export const MG_STATE_SOURCE_PROMPT = 3;
export const MG_STATE_SOURCE_PROMPT_INPUT = 4;
export const MG_STATE_CLIENT_LINK_START = 5;
export const MG_STATE_CLIENT_LINK_WAIT = 6;
export const MG_STATE_CLIENT_COMMUNICATING = 7;
export const MG_STATE_CLIENT_LINK = 8;
export const MG_STATE_CLIENT_YES_NO = 9;
export const MG_STATE_CLIENT_MESSAGE = 10;
export const MG_STATE_CLIENT_ASK_TOSS = 11;
export const MG_STATE_CLIENT_ASK_TOSS_UNRECEIVED = 12;
export const MG_STATE_CLIENT_LINK_END = 13;
export const MG_STATE_CLIENT_COMM_COMPLETED = 14;
export const MG_STATE_CLIENT_RESULT_MSG = 15;
export const MG_STATE_CLIENT_ERROR = 16;
export const MG_STATE_SAVE_LOAD_GIFT = 17;
export const MG_STATE_LOAD_GIFT = 18;
export const MG_STATE_UNUSED = 19;
export const MG_STATE_HANDLE_GIFT_INPUT = 20;
export const MG_STATE_HANDLE_GIFT_SELECT = 21;
export const MG_STATE_ASK_TOSS = 22;
export const MG_STATE_ASK_TOSS_UNRECEIVED = 23;
export const MG_STATE_TOSS = 24;
export const MG_STATE_TOSS_SAVE = 25;
export const MG_STATE_TOSSED = 26;
export const MG_STATE_GIFT_INPUT_EXIT = 27;
export const MG_STATE_RECEIVE = 28;
export const MG_STATE_SEND = 29;
export const MG_STATE_SERVER_LINK_WAIT = 30;
export const MG_STATE_SERVER_LINK_START = 31;
export const MG_STATE_SERVER_LINK = 32;
export const MG_STATE_SERVER_LINK_END = 33;
export const MG_STATE_SERVER_LINK_END_WAIT = 34;
export const MG_STATE_SERVER_RESULT_MSG = 35;
export const MG_STATE_SERVER_ERROR = 36;
export const MG_STATE_EXIT = 37;

export interface MysteryGiftBgTemplate {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  screenSize: number;
  paletteMode: number;
  priority: number;
  baseTile: number;
}

export interface MysteryGiftWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface MysteryGiftListMenuItem {
  label: string;
  index: number;
}

export interface MysteryGiftListMenuTemplate {
  items: readonly MysteryGiftListMenuItem[] | null;
  totalItems: number;
  maxShowed: number;
  windowId: number;
  header_X: number;
  item_X: number;
  cursor_X: number;
  upText_Y: number;
  cursorPal: number;
  fillValue: number;
  cursorShadowPal: number;
  lettersSpacing: number;
  itemVerticalPadding: number;
  scrollMultiple: number;
  fontId: number;
  cursorKind: number;
}

export interface MysteryGiftTaskData {
  var: number;
  unused1: number;
  unused2: number;
  unused3: number;
  state: number;
  textState: number;
  unused4: number;
  unused5: number;
  isWonderNews: boolean;
  sourceIsFriend: boolean;
  msgId: number;
  clientMsg: string;
}

export interface MysteryGiftTask {
  id: number;
  func: 'Task_MysteryGift';
  data: MysteryGiftTaskData;
  destroyed: boolean;
}

export interface MysteryGiftRuntime {
  sDownArrowCounterAndYCoordIdx: number[];
  gGiftIsFromEReader: boolean;
  gMainState: number;
  mainCallback: string | null;
  vblankCallback: string | null;
  gReceivedRemoteLinkPlayers: boolean;
  gSpecialVar_Result: number;
  gMainNewKeys: number;
  pressedButtons: number;
  nextWindowId: number;
  nextTaskId: number;
  tasks: MysteryGiftTask[];
  bgTilemapBuffers: number[][];
  topMenuPrints: Array<{ isEReader: boolean; useCancel: boolean; left: string; right: string }>;
  textWindowMessages: string[];
  operations: string[];
  listMenuInputs: number[];
  yesNoInputs: number[];
  clientRunReturns: Array<{ ret: number; endVal?: number }>;
  serverRunReturns: Array<{ ret: number; endVal?: number }>;
  clientMsg: string;
  linkPlayerNames: [string, string];
  validateWonderCard: boolean;
  validateWonderNews: boolean;
  savedWonderCardGiftNotReceived: boolean;
  sendingWonderCardAllowed: boolean;
  sendingWonderNewsAllowed: boolean;
  wonderCardEnterReady: boolean;
  wonderNewsEnterReady: boolean;
  wonderCardExitReady: boolean;
  wonderNewsExitReady: boolean;
  linkRfuTaskFinished: boolean;
  fanfareInactive: boolean;
  wonderNewsInput: number;
  wonderNewsRewards: number[];
  clientParams: number[];
  clientAdvanceCount: number;
  savedDataCount: number;
  clearedCard: boolean;
  clearedNews: boolean;
}

export const sBGTemplates: readonly MysteryGiftBgTemplate[] = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 14, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 13, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 12, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 }
];

export const sMainWindows: readonly MysteryGiftWindowTemplate[] = [
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 30, height: 2, paletteNum: 15, baseBlock: 0x0013 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4, paletteNum: 15, baseBlock: 0x004f },
  { bg: 0, tilemapLeft: 0, tilemapTop: 15, width: 30, height: 5, paletteNum: 13, baseBlock: 0x004f }
];

export const sWindowTemplate_YesNoMsg_Wide: MysteryGiftWindowTemplate = { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4, paletteNum: 15, baseBlock: 0x00e5 };
export const sWindowTemplate_YesNoMsg: MysteryGiftWindowTemplate = { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 20, height: 4, paletteNum: 15, baseBlock: 0x00e5 };
export const sWindowTemplate_GiftSelect: MysteryGiftWindowTemplate = { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 19, height: 4, paletteNum: 15, baseBlock: 0x00e5 };
export const sWindowTemplate_ThreeOptions: MysteryGiftWindowTemplate = { bg: 0, tilemapLeft: 8, tilemapTop: 5, width: 14, height: 5, paletteNum: 14, baseBlock: 0x0155 };
export const sWindowTemplate_YesNoBox: MysteryGiftWindowTemplate = { bg: 0, tilemapLeft: 23, tilemapTop: 15, width: 6, height: 4, paletteNum: 14, baseBlock: 0x0155 };
export const sWindowTemplate_GiftSelect_3Options: MysteryGiftWindowTemplate = { bg: 0, tilemapLeft: 22, tilemapTop: 12, width: 7, height: 7, paletteNum: 14, baseBlock: 0x0155 };
export const sWindowTemplate_GiftSelect_2Options: MysteryGiftWindowTemplate = { bg: 0, tilemapLeft: 22, tilemapTop: 14, width: 7, height: 5, paletteNum: 14, baseBlock: 0x0155 };
export const sWindowTemplate_GiftSelect_1Option: MysteryGiftWindowTemplate = { bg: 0, tilemapLeft: 22, tilemapTop: 15, width: 7, height: 4, paletteNum: 14, baseBlock: 0x0155 };

export const sListMenuItems_CardsOrNews: readonly MysteryGiftListMenuItem[] = [
  { label: gText_WonderCards, index: 0 },
  { label: gText_WonderNews, index: 1 },
  { label: gText_Exit3, index: LIST_CANCEL }
];
export const sListMenuItems_WirelessOrFriend: readonly MysteryGiftListMenuItem[] = [
  { label: gText_WirelessCommunication, index: 0 },
  { label: gText_Friend2, index: 1 },
  { label: gFameCheckerText_Cancel, index: LIST_CANCEL }
];
export const sListMenuItems_ReceiveSendToss: readonly MysteryGiftListMenuItem[] = [
  { label: gText_Receive, index: 0 },
  { label: gText_Send, index: 1 },
  { label: gText_Toss, index: 2 },
  { label: gFameCheckerText_Cancel, index: LIST_CANCEL }
];
export const sListMenuItems_ReceiveToss: readonly MysteryGiftListMenuItem[] = [
  { label: gText_Receive, index: 0 },
  { label: gText_Toss, index: 2 },
  { label: gFameCheckerText_Cancel, index: LIST_CANCEL }
];
export const sListMenuItems_ReceiveSend: readonly MysteryGiftListMenuItem[] = [
  { label: gText_Receive, index: 0 },
  { label: gText_Send, index: 1 },
  { label: gFameCheckerText_Cancel, index: LIST_CANCEL }
];
export const sListMenuItems_Receive: readonly MysteryGiftListMenuItem[] = [
  { label: gText_Receive, index: 0 },
  { label: gFameCheckerText_Cancel, index: LIST_CANCEL }
];

export const sListMenuTemplate_ThreeOptions: MysteryGiftListMenuTemplate = {
  items: null, totalItems: 3, maxShowed: 3, windowId: 0, header_X: 0, item_X: 8, cursor_X: 0, upText_Y: 0,
  cursorPal: 2, fillValue: 1, cursorShadowPal: 3, lettersSpacing: 0, itemVerticalPadding: 0, scrollMultiple: 0, fontId: 1, cursorKind: 0
};

export const sListMenu_ReceiveSendToss: MysteryGiftListMenuTemplate = { ...sListMenuTemplate_ThreeOptions, items: sListMenuItems_ReceiveSendToss, totalItems: 4, maxShowed: 4, upText_Y: 2 };
export const sListMenu_ReceiveToss: MysteryGiftListMenuTemplate = { ...sListMenuTemplate_ThreeOptions, items: sListMenuItems_ReceiveToss, totalItems: 3, maxShowed: 3 };
export const sListMenu_ReceiveSend: MysteryGiftListMenuTemplate = { ...sListMenuTemplate_ThreeOptions, items: sListMenuItems_ReceiveSend, totalItems: 3, maxShowed: 3 };
export const sListMenu_Receive: MysteryGiftListMenuTemplate = { ...sListMenuTemplate_ThreeOptions, items: sListMenuItems_Receive, totalItems: 2, maxShowed: 2, itemVerticalPadding: 2 };

export const createMysteryGiftRuntime = (overrides: Partial<MysteryGiftRuntime> = {}): MysteryGiftRuntime => {
  const runtime: MysteryGiftRuntime = {
    sDownArrowCounterAndYCoordIdx: Array.from({ length: 8 }, () => 0),
    gGiftIsFromEReader: false,
    gMainState: 0,
    mainCallback: null,
    vblankCallback: null,
    gReceivedRemoteLinkPlayers: false,
    gSpecialVar_Result: 0,
    gMainNewKeys: 0,
    pressedButtons: 0,
    nextWindowId: 3,
    nextTaskId: 0,
    tasks: [],
    bgTilemapBuffers: Array.from({ length: 4 }, () => Array.from({ length: 32 * 32 }, () => 0)),
    topMenuPrints: [],
    textWindowMessages: [],
    operations: [],
    listMenuInputs: [],
    yesNoInputs: [],
    clientRunReturns: [],
    serverRunReturns: [],
    clientMsg: '',
    linkPlayerNames: ['PLAYER1', 'PLAYER2'],
    validateWonderCard: false,
    validateWonderNews: false,
    savedWonderCardGiftNotReceived: false,
    sendingWonderCardAllowed: true,
    sendingWonderNewsAllowed: true,
    wonderCardEnterReady: true,
    wonderNewsEnterReady: true,
    wonderCardExitReady: true,
    wonderNewsExitReady: true,
    linkRfuTaskFinished: false,
    fanfareInactive: true,
    wonderNewsInput: 0,
    wonderNewsRewards: [],
    clientParams: [],
    clientAdvanceCount: 0,
    savedDataCount: 0,
    clearedCard: false,
    clearedNews: false
  };
  return Object.assign(runtime, overrides);
};

const consumeButton = (runtime: MysteryGiftRuntime, mask: number): boolean => {
  if ((runtime.pressedButtons & mask) === 0) return false;
  runtime.pressedButtons &= ~mask;
  return true;
};

const task = (runtime: MysteryGiftRuntime, taskId: number): MysteryGiftTask => {
  const found = runtime.tasks.find((entry) => entry.id === taskId && !entry.destroyed);
  if (!found) throw new Error(`Task ${taskId} does not exist`);
  return found;
};

const fillBgTilemapBufferRect = (
  runtime: MysteryGiftRuntime,
  bg: number,
  value: number,
  left: number,
  top: number,
  width: number,
  height: number
): void => {
  const buffer = runtime.bgTilemapBuffers[bg]!;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) buffer[(top + y) * 32 + left + x] = value;
  }
  runtime.operations.push(`FillBgTilemapBufferRect(${bg},${value},${left},${top},${width},${height},17)`);
};

export const VBlankCB_MysteryGiftEReader = (runtime: MysteryGiftRuntime): void => {
  runtime.operations.push('ProcessSpriteCopyRequests', 'LoadOam', 'TransferPlttBuffer');
};

export const CB2_MysteryGiftEReader = (runtime: MysteryGiftRuntime): void => {
  runtime.operations.push('RunTasks', 'RunTextPrinters', 'AnimateSprites', 'BuildOamBuffer');
};

export const HandleMysteryGiftOrEReaderSetup = (runtime: MysteryGiftRuntime, isEReader: boolean): boolean => {
  switch (runtime.gMainState) {
    case 0:
      runtime.operations.push('SetVBlankCallback(NULL)', 'ResetPaletteFade', 'ResetSpriteData', 'FreeAllSpritePalettes', 'ResetTasks', 'ScanlineEffect_Stop', 'ResetBgsAndClearDma3BusyFlags(1)', `InitBgsFromTemplates(0,sBGTemplates,${sBGTemplates.length})`, 'ChangeBgX/Y all BGs to 0', 'SetBgTilemapBuffer(0..3)', 'LoadUserWindowGfx2(0,10,BG_PLTT_ID(14))', 'LoadStdWindowGfxOnBg(0,1,BG_PLTT_ID(15))', 'DecompressAndLoadBgGfxUsingHeap(3,sTextboxBorder_Gfx,0x100,0,0)', 'InitWindows(sMainWindows)', 'DeactivateAllTextPrinters', 'ClearGpuRegBits(DISPCNT_WIN0_ON|DISPCNT_WIN1_ON)', 'SetGpuReg(REG_OFFSET_BLDCNT,0)', 'SetGpuReg(REG_OFFSET_BLDALPHA,0)', 'SetGpuReg(REG_OFFSET_BLDY,0)');
      runtime.gMainState++;
      break;
    case 1:
      runtime.operations.push('LoadPalette(sTextboxBorder_Pal,BG_PLTT_ID(0))', 'LoadPalette(GetTextWindowPalette(2),BG_PLTT_ID(13))');
      fillBgTilemapBufferRect(runtime, 0, 0, 0, 0, 32, 32);
      fillBgTilemapBufferRect(runtime, 1, 0, 0, 0, 32, 32);
      fillBgTilemapBufferRect(runtime, 2, 0, 0, 0, 32, 32);
      MG_DrawCheckerboardPattern(runtime);
      PrintMysteryGiftOrEReaderTopMenu(runtime, isEReader, false);
      runtime.gMainState++;
      break;
    case 2:
      runtime.operations.push('CopyBgTilemapBufferToVram(3)', 'CopyBgTilemapBufferToVram(2)', 'CopyBgTilemapBufferToVram(1)', 'CopyBgTilemapBufferToVram(0)');
      runtime.gMainState++;
      break;
    case 3:
      runtime.operations.push('ShowBg(0)', 'ShowBg(3)', 'PlayBGM(MUS_MYSTERY_GIFT)', 'EnableInterrupts(VBLANK|VCOUNT|TIMER3|SERIAL)');
      runtime.vblankCallback = 'VBlankCB_MysteryGiftEReader';
      return true;
  }
  return false;
};

export const CB2_InitMysteryGift = (runtime: MysteryGiftRuntime): void => {
  if (HandleMysteryGiftOrEReaderSetup(runtime, false)) {
    runtime.mainCallback = 'CB2_MysteryGiftEReader';
    runtime.gGiftIsFromEReader = false;
    CreateMysteryGiftTask(runtime);
  }
};

export const CB2_InitEReader = (runtime: MysteryGiftRuntime): void => {
  if (HandleMysteryGiftOrEReaderSetup(runtime, true)) {
    runtime.mainCallback = 'CB2_MysteryGiftEReader';
    runtime.gGiftIsFromEReader = true;
    runtime.operations.push('CreateEReaderTask');
  }
};

export const MainCB_FreeAllBuffersAndReturnToInitTitleScreen = (runtime: MysteryGiftRuntime): void => {
  runtime.gGiftIsFromEReader = false;
  runtime.operations.push('FreeAllWindowBuffers', 'Free(GetBgTilemapBuffer(0))', 'Free(GetBgTilemapBuffer(1))', 'Free(GetBgTilemapBuffer(2))', 'Free(GetBgTilemapBuffer(3))');
  runtime.mainCallback = 'CB2_InitTitleScreen';
};

export const PrintMysteryGiftOrEReaderTopMenu = (runtime: MysteryGiftRuntime, isEReader: boolean, useCancel: boolean): void => {
  runtime.topMenuPrints.push({
    isEReader,
    useCancel,
    left: isEReader ? gJPText_MysteryGift : gText_MysteryGift2,
    right: isEReader ? gJPText_DecideStop : (useCancel ? gText_PickOKExit : gText_PickOKCancel)
  });
  runtime.operations.push('FillWindowPixelBuffer(0,0)', 'CopyWindowToVram(0,COPYWIN_GFX)', 'PutWindowTilemap(0)');
};

export const MG_DrawTextBorder = (runtime: MysteryGiftRuntime, windowId: number): void => {
  runtime.operations.push(`DrawTextBorderOuter(${windowId},0x01,15)`);
};

export const MG_DrawCheckerboardPattern = (runtime: MysteryGiftRuntime): void => {
  fillBgTilemapBufferRect(runtime, 3, 0x003, 0, 0, 32, 2);
  for (let i = 0; i < 18; i++) {
    for (let j = 0; j < 32; j++) fillBgTilemapBufferRect(runtime, 3, (i & 1) !== (j & 1) ? 1 : 2, j, i + 2, 1, 1);
  }
};

export const ClearScreenInBg0 = (runtime: MysteryGiftRuntime, ignoreTopTwoRows: boolean): void => {
  if (!ignoreTopTwoRows) fillBgTilemapBufferRect(runtime, 0, 0, 0, 0, 32, 32);
  else fillBgTilemapBufferRect(runtime, 0, 0, 0, 2, 32, 30);
  runtime.operations.push('CopyBgTilemapBufferToVram(0)');
};

export const AddTextPrinterToWindow1 = (runtime: MysteryGiftRuntime, str: string): void => {
  runtime.textWindowMessages.push(str);
  runtime.operations.push('FillWindowPixelBuffer(1,0x11)', 'AddTextPrinterParameterized4(1,FONT_NORMAL,0,2,0,2,sMG_Ereader_TextColor_2,0,gStringVar4)', 'DrawTextBorderOuter(1,0x001,15)', 'PutWindowTilemap(1)', 'CopyWindowToVram(1,COPYWIN_FULL)');
};

export const ClearTextWindow = (runtime: MysteryGiftRuntime): void => {
  runtime.operations.push('rbox_fill_rectangle(1)', 'ClearWindowTilemap(1)', 'CopyWindowToVram(1,COPYWIN_MAP)');
};

export const PrintMysteryGiftMenuMessage = (runtime: MysteryGiftRuntime, data: { textState: number }, str: string): boolean => {
  switch (data.textState) {
    case 0:
      AddTextPrinterToWindow1(runtime, str);
      data.textState++;
      break;
    case 1:
      runtime.operations.push('DrawDownArrow(show)');
      if (consumeButton(runtime, A_BUTTON | B_BUTTON)) data.textState++;
      break;
    case 2:
      runtime.operations.push('DrawDownArrow(hide)');
      data.textState = 0;
      ClearTextWindow(runtime);
      return true;
    case 0xff:
      data.textState = 2;
      break;
  }
  return false;
};

export const HideDownArrow = (runtime: MysteryGiftRuntime): void => {
  runtime.operations.push('DrawDownArrow(false)');
};

export const ShowDownArrow = (runtime: MysteryGiftRuntime): void => {
  runtime.operations.push('DrawDownArrow(true)');
};

export const HideDownArrowAndWaitButton = (runtime: MysteryGiftRuntime, data: { textState: number }): boolean => {
  switch (data.textState) {
    case 0:
      HideDownArrow(runtime);
      if (consumeButton(runtime, A_BUTTON | B_BUTTON)) data.textState++;
      break;
    case 1:
      ShowDownArrow(runtime);
      data.textState = 0;
      return true;
  }
  return false;
};

export const PrintStringAndWait2Seconds = (runtime: MysteryGiftRuntime, data: { textState: number }, str: string): boolean => {
  if (data.textState === 0) AddTextPrinterToWindow1(runtime, str);
  if (++data.textState > 120) {
    data.textState = 0;
    ClearTextWindow(runtime);
    return true;
  }
  return false;
};

const stringWidth = (text: string): number => text.length * 8;

export const MysteryGift_HandleThreeOptionMenu = (runtime: MysteryGiftRuntime, whichMenu: number): number => {
  const items = whichMenu === 0 ? sListMenuItems_CardsOrNews : sListMenuItems_WirelessOrFriend;
  let width = 0;
  for (const item of items) width = Math.max(width, stringWidth(item.label));
  const finalWidth = (((width + 9) / 8) + 2) & ~1;
  runtime.operations.push(`DoMysteryGiftListMenu(width=${finalWidth},left=${(30 - finalWidth) / 2},whichMenu=${whichMenu})`);
  const response = runtime.listMenuInputs.shift() ?? LIST_NOTHING_CHOSEN;
  if (response !== LIST_NOTHING_CHOSEN) runtime.operations.push('ClearWindowTilemap(2)', 'CopyWindowToVram(2,COPYWIN_MAP)');
  return response;
};

export const DoMysteryGiftYesNo = (
  runtime: MysteryGiftRuntime,
  data: { textState: number; var: number },
  yesNoBoxPlacement: boolean,
  str: string
): number => {
  switch (data.textState) {
    case 0:
      data.var = runtime.nextWindowId++;
      runtime.operations.push(`AddWindow(${yesNoBoxPlacement ? 'sWindowTemplate_YesNoMsg' : 'sWindowTemplate_YesNoMsg_Wide'})`);
      AddTextPrinterToWindow1(runtime, str);
      data.textState++;
      break;
    case 1:
      runtime.operations.push(`CreateYesNoMenu(tilemapTop=${yesNoBoxPlacement ? 15 : 9})`);
      data.textState++;
      break;
    case 2: {
      const input = runtime.yesNoInputs.shift() ?? MENU_NOTHING_CHOSEN;
      if (input === MENU_B_PRESSED || input === 0 || input === 1) {
        data.textState = 0;
        runtime.operations.push(`rbox_fill_rectangle(${data.var})`, `ClearWindowTilemap(${data.var})`, `CopyWindowToVram(${data.var},COPYWIN_MAP)`, `RemoveWindow(${data.var})`);
        return input;
      }
      break;
    }
    case 0xff:
      data.textState = 0;
      runtime.operations.push(`rbox_fill_rectangle(${data.var})`, `ClearWindowTilemap(${data.var})`, `CopyWindowToVram(${data.var},COPYWIN_MAP)`, `RemoveWindow(${data.var})`);
      return MENU_B_PRESSED;
  }
  return MENU_NOTHING_CHOSEN;
};

export const HandleMysteryGiftListMenu = (
  runtime: MysteryGiftRuntime,
  data: { textState: number; var: number },
  cannotToss: boolean,
  cannotSend: boolean
): number => {
  switch (data.textState) {
    case 0:
      data.var = runtime.nextWindowId++;
      AddTextPrinterToWindow1(runtime, !cannotToss ? gText_WhatToDoWithCards : gText_WhatToDoWithNews);
      data.textState++;
      break;
    case 1: {
      let template: MysteryGiftListMenuTemplate;
      if (cannotSend) template = !cannotToss ? sListMenu_ReceiveToss : sListMenu_Receive;
      else template = !cannotToss ? sListMenu_ReceiveSendToss : sListMenu_ReceiveSend;
      runtime.operations.push(`DoMysteryGiftListMenu(${template.totalItems} items)`);
      const input = runtime.listMenuInputs.shift() ?? LIST_NOTHING_CHOSEN;
      if (input !== LIST_NOTHING_CHOSEN) {
        data.textState = 0;
        runtime.operations.push(`rbox_fill_rectangle(${data.var})`, `ClearWindowTilemap(${data.var})`, `CopyWindowToVram(${data.var},COPYWIN_MAP)`, `RemoveWindow(${data.var})`);
        return input;
      }
      break;
    }
    case 0xff:
      data.textState = 0;
      runtime.operations.push(`rbox_fill_rectangle(${data.var})`, `ClearWindowTilemap(${data.var})`, `CopyWindowToVram(${data.var},COPYWIN_MAP)`, `RemoveWindow(${data.var})`);
      return LIST_CANCEL;
  }
  return LIST_NOTHING_CHOSEN;
};

export const ValidateCardOrNews = (runtime: MysteryGiftRuntime, isWonderNews: boolean): boolean => !isWonderNews ? runtime.validateWonderCard : runtime.validateWonderNews;

export const HandleLoadWonderCardOrNews = (runtime: MysteryGiftRuntime, data: { textState: number }, isWonderNews: boolean): boolean => {
  switch (data.textState) {
    case 0:
      runtime.operations.push(!isWonderNews ? 'WonderCard_Init(GetSavedWonderCard(),GetSavedWonderCardMetadata())' : 'WonderNews_Init(GetSavedWonderNews())');
      data.textState++;
      break;
    case 1:
      if (!isWonderNews) {
        if (!runtime.wonderCardEnterReady) return false;
      } else if (!runtime.wonderNewsEnterReady) return false;
      data.textState = 0;
      return true;
  }
  return false;
};

export const ClearSavedNewsOrCard = (runtime: MysteryGiftRuntime, isWonderNews: boolean): boolean => {
  if (!isWonderNews) runtime.clearedCard = true;
  else runtime.clearedNews = true;
  runtime.operations.push(!isWonderNews ? 'ClearSavedWonderCardAndRelated' : 'ClearSavedWonderNewsAndRelated');
  return true;
};

export const ExitWonderCardOrNews = (runtime: MysteryGiftRuntime, isWonderNews: boolean, useCancel: boolean): boolean => {
  if (!isWonderNews) {
    if (runtime.wonderCardExitReady) {
      runtime.operations.push(`WonderCard_Exit(${useCancel})`, 'WonderCard_Destroy');
      return true;
    }
  } else if (runtime.wonderNewsExitReady) {
    runtime.operations.push(`WonderNews_Exit(${useCancel})`, 'WonderNews_Destroy');
    return true;
  }
  return false;
};

export const AskDiscardGift = (runtime: MysteryGiftRuntime, data: { textState: number; var: number }, isWonderNews: boolean): number =>
  DoMysteryGiftYesNo(runtime, data, true, !isWonderNews ? gText_IfThrowAwayCardEventWontHappen : gText_OkayToDiscardNews);

export const PrintThrownAway = (runtime: MysteryGiftRuntime, data: { textState: number }, isWonderNews: boolean): boolean =>
  PrintMysteryGiftMenuMessage(runtime, data, !isWonderNews ? gText_WonderCardThrownAway : gText_WonderNewsThrownAway);

export const SaveOnMysteryGiftMenu = (runtime: MysteryGiftRuntime, data: { textState: number }): boolean => {
  switch (data.textState) {
    case 0:
      AddTextPrinterToWindow1(runtime, gText_DataWillBeSaved);
      data.textState++;
      break;
    case 1:
      runtime.savedDataCount++;
      runtime.operations.push(`TrySavingData(${SAVE_NORMAL})`);
      data.textState++;
      break;
    case 2:
      AddTextPrinterToWindow1(runtime, gText_SaveCompletedPressA);
      data.textState++;
      break;
    case 3:
      if (consumeButton(runtime, A_BUTTON | B_BUTTON)) data.textState++;
      break;
    case 4:
      data.textState = 0;
      ClearTextWindow(runtime);
      return true;
  }
  return false;
};

export const GetClientResultMessage = (
  isWonderNews: boolean,
  sourceIsFriend: boolean,
  msgId: number
): { successMsg: boolean; msg: string | null } => {
  switch (msgId) {
    case CLI_MSG_NOTHING_SENT: return { successMsg: false, msg: gText_NothingSentOver };
    case CLI_MSG_RECORD_UPLOADED: return { successMsg: false, msg: gText_RecordUploadedViaWireless };
    case CLI_MSG_CARD_RECEIVED: return { successMsg: true, msg: !sourceIsFriend ? gText_WonderCardReceived : gText_WonderCardReceivedFrom };
    case CLI_MSG_NEWS_RECEIVED: return { successMsg: true, msg: !sourceIsFriend ? gText_WonderNewsReceived : gText_WonderNewsReceivedFrom };
    case CLI_MSG_STAMP_RECEIVED: return { successMsg: true, msg: gText_NewStampReceived };
    case CLI_MSG_HAD_CARD: return { successMsg: false, msg: gText_AlreadyHadCard };
    case CLI_MSG_HAD_STAMP: return { successMsg: false, msg: gText_AlreadyHadStamp };
    case CLI_MSG_HAD_NEWS: return { successMsg: false, msg: gText_AlreadyHadNews };
    case CLI_MSG_NO_ROOM_STAMPS: return { successMsg: false, msg: gText_NoMoreRoomForStamps };
    case CLI_MSG_COMM_CANCELED: return { successMsg: false, msg: gText_CommunicationCanceled };
    case CLI_MSG_CANT_ACCEPT: return { successMsg: false, msg: !isWonderNews ? gText_CantAcceptCardFromTrainer : gText_CantAcceptNewsFromTrainer };
    case CLI_MSG_COMM_ERROR: return { successMsg: false, msg: gText_CommunicationError };
    case CLI_MSG_TRAINER_RECEIVED: return { successMsg: true, msg: gText_NewTrainerReceived };
    case CLI_MSG_BUFFER_SUCCESS: return { successMsg: true, msg: null };
    case CLI_MSG_BUFFER_FAILURE: return { successMsg: false, msg: null };
    default: return { successMsg: false, msg: null };
  }
};

export const PrintSuccessMessage = (runtime: MysteryGiftRuntime, data: { textState: number; var: number }, msg: string | null): boolean => {
  switch (data.textState) {
    case 0:
      if (msg !== null) AddTextPrinterToWindow1(runtime, msg);
      runtime.operations.push('PlayFanfare(MUS_OBTAIN_ITEM)');
      data.var = 0;
      data.textState++;
      break;
    case 1:
      if (++data.var > 240) data.textState++;
      break;
    case 2:
      if (runtime.fanfareInactive) {
        data.textState = 0;
        ClearTextWindow(runtime);
        return true;
      }
      break;
  }
  return false;
};

export const GetServerResultMessage = (msgId: number): { wonderSuccess: boolean; msg: string } => {
  switch (msgId) {
    case SVR_MSG_NOTHING_SENT: return { wonderSuccess: false, msg: gText_NothingSentOver };
    case SVR_MSG_RECORD_UPLOADED: return { wonderSuccess: false, msg: gText_RecordUploadedViaWireless };
    case SVR_MSG_CARD_SENT: return { wonderSuccess: true, msg: gText_WonderCardSentTo };
    case SVR_MSG_NEWS_SENT: return { wonderSuccess: true, msg: gText_WonderNewsSentTo };
    case SVR_MSG_STAMP_SENT: return { wonderSuccess: false, msg: gText_StampSentTo };
    case SVR_MSG_HAS_CARD: return { wonderSuccess: false, msg: gText_OtherTrainerHasCard };
    case SVR_MSG_HAS_STAMP: return { wonderSuccess: false, msg: gText_OtherTrainerHasStamp };
    case SVR_MSG_HAS_NEWS: return { wonderSuccess: false, msg: gText_OtherTrainerHasNews };
    case SVR_MSG_NO_ROOM_STAMPS: return { wonderSuccess: false, msg: gText_NoMoreRoomForStamps };
    case SVR_MSG_CLIENT_CANCELED: return { wonderSuccess: false, msg: gText_OtherTrainerCanceled };
    case SVR_MSG_CANT_SEND_GIFT_1: return { wonderSuccess: false, msg: gText_CantSendGiftToTrainer };
    case SVR_MSG_COMM_ERROR: return { wonderSuccess: false, msg: gText_CommunicationError };
    case SVR_MSG_GIFT_SENT_1: return { wonderSuccess: false, msg: gText_GiftSentTo };
    case SVR_MSG_GIFT_SENT_2: return { wonderSuccess: false, msg: gText_GiftSentTo };
    case SVR_MSG_CANT_SEND_GIFT_2: return { wonderSuccess: false, msg: gText_CantSendGiftToTrainer };
    default: return { wonderSuccess: false, msg: gText_CommunicationError };
  }
};

export const PrintServerResultMessage = (runtime: MysteryGiftRuntime, data: { textState: number; var: number }, sourceIsFriend: boolean, msgId: number): boolean => {
  void sourceIsFriend;
  const { wonderSuccess, msg } = GetServerResultMessage(msgId);
  return wonderSuccess ? PrintSuccessMessage(runtime, data, msg) : PrintMysteryGiftMenuMessage(runtime, data, msg);
};

export const CreateMysteryGiftTask = (runtime: MysteryGiftRuntime): number => {
  const id = runtime.nextTaskId++;
  runtime.tasks.push({
    id,
    func: 'Task_MysteryGift',
    destroyed: false,
    data: {
      state: MG_STATE_TO_MAIN_MENU,
      textState: 0,
      unused4: 0,
      unused5: 0,
      isWonderNews: false,
      sourceIsFriend: false,
      var: 0,
      unused1: 0,
      unused2: 0,
      unused3: 0,
      msgId: 0,
      clientMsg: ''
    }
  });
  runtime.operations.push('CreateTask(Task_MysteryGift)', `AllocZeroed(${CLIENT_MAX_MSG_SIZE})`);
  return id;
};

const clientCreateLinkTask = (runtime: MysteryGiftRuntime, friend: boolean, wonderNews: boolean): void => {
  runtime.operations.push(friend
    ? `CreateTask_LinkMysteryGiftWithFriend(${wonderNews ? ACTIVITY_WONDER_NEWS : ACTIVITY_WONDER_CARD})`
    : `CreateTask_LinkMysteryGiftOverWireless(${wonderNews ? ACTIVITY_WONDER_NEWS : ACTIVITY_WONDER_CARD})`);
};

export const Task_MysteryGift = (runtime: MysteryGiftRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  switch (data.state) {
    case MG_STATE_TO_MAIN_MENU:
      data.state = MG_STATE_MAIN_MENU;
      break;
    case MG_STATE_MAIN_MENU:
      switch (MysteryGift_HandleThreeOptionMenu(runtime, 0)) {
        case 0:
          data.isWonderNews = false;
          data.state = runtime.validateWonderCard ? MG_STATE_LOAD_GIFT : MG_STATE_DONT_HAVE_ANY;
          break;
        case 1:
          data.isWonderNews = true;
          data.state = runtime.validateWonderNews ? MG_STATE_LOAD_GIFT : MG_STATE_DONT_HAVE_ANY;
          break;
        case LIST_CANCEL:
          data.state = MG_STATE_EXIT;
          break;
      }
      break;
    case MG_STATE_DONT_HAVE_ANY:
      if (PrintMysteryGiftMenuMessage(runtime, data, !data.isWonderNews ? gText_DontHaveCardNewOneInput : gText_DontHaveNewsNewOneInput)) {
        data.state = MG_STATE_SOURCE_PROMPT;
        PrintMysteryGiftOrEReaderTopMenu(runtime, false, true);
      }
      break;
    case MG_STATE_SOURCE_PROMPT:
      AddTextPrinterToWindow1(runtime, !data.isWonderNews ? gText_WhereShouldCardBeAccessed : gText_WhereShouldNewsBeAccessed);
      data.state = MG_STATE_SOURCE_PROMPT_INPUT;
      break;
    case MG_STATE_SOURCE_PROMPT_INPUT:
      switch (MysteryGift_HandleThreeOptionMenu(runtime, 1)) {
        case 0:
          ClearTextWindow(runtime);
          data.state = MG_STATE_CLIENT_LINK_START;
          data.sourceIsFriend = false;
          break;
        case 1:
          ClearTextWindow(runtime);
          data.state = MG_STATE_CLIENT_LINK_START;
          data.sourceIsFriend = true;
          break;
        case LIST_CANCEL:
          ClearTextWindow(runtime);
          if (ValidateCardOrNews(runtime, data.isWonderNews)) data.state = MG_STATE_LOAD_GIFT;
          else {
            data.state = MG_STATE_TO_MAIN_MENU;
            PrintMysteryGiftOrEReaderTopMenu(runtime, false, false);
          }
          break;
      }
      break;
    case MG_STATE_CLIENT_LINK_START:
      runtime.operations.push('Clear gStringVar1/2/3');
      clientCreateLinkTask(runtime, data.sourceIsFriend, data.isWonderNews);
      data.state = MG_STATE_CLIENT_LINK_WAIT;
      break;
    case MG_STATE_CLIENT_LINK_WAIT:
      if (runtime.gReceivedRemoteLinkPlayers) {
        ClearScreenInBg0(runtime, true);
        data.state = MG_STATE_CLIENT_COMMUNICATING;
        runtime.operations.push('MysteryGiftClient_Create');
      } else if (runtime.gSpecialVar_Result === LINKUP_FAILED) {
        ClearScreenInBg0(runtime, true);
        data.state = MG_STATE_SOURCE_PROMPT;
      }
      break;
    case MG_STATE_CLIENT_COMMUNICATING:
      AddTextPrinterToWindow1(runtime, 'Communicating…');
      data.state = MG_STATE_CLIENT_LINK;
      break;
    case MG_STATE_CLIENT_LINK: {
      const ret = runtime.clientRunReturns.shift() ?? { ret: CLI_RET_ACTIVE };
      if (ret.endVal !== undefined) data.var = ret.endVal;
      switch (ret.ret) {
        case CLI_RET_END:
          runtime.operations.push('Rfu_SetCloseLinkCallback');
          data.msgId = data.var;
          data.state = MG_STATE_CLIENT_LINK_END;
          break;
        case CLI_RET_COPY_MSG:
          data.clientMsg = runtime.clientMsg.slice(0, CLIENT_MAX_MSG_SIZE);
          runtime.clientAdvanceCount++;
          break;
        case CLI_RET_PRINT_MSG:
          data.state = MG_STATE_CLIENT_MESSAGE;
          break;
        case CLI_RET_YES_NO:
          data.state = MG_STATE_CLIENT_YES_NO;
          break;
        case CLI_RET_ASK_TOSS:
          data.state = MG_STATE_CLIENT_ASK_TOSS;
          runtime.operations.push(`StringCopy(gStringVar1,${runtime.linkPlayerNames[0]})`);
          break;
      }
      break;
    }
    case MG_STATE_CLIENT_YES_NO: {
      const input = DoMysteryGiftYesNo(runtime, data, false, runtime.clientMsg);
      if (input === 0) {
        runtime.clientParams.push(0);
        runtime.clientAdvanceCount++;
        data.state = MG_STATE_CLIENT_COMMUNICATING;
      } else if (input === 1 || input === MENU_B_PRESSED) {
        runtime.clientParams.push(1);
        runtime.clientAdvanceCount++;
        data.state = MG_STATE_CLIENT_COMMUNICATING;
      }
      break;
    }
    case MG_STATE_CLIENT_MESSAGE:
      if (PrintMysteryGiftMenuMessage(runtime, data, runtime.clientMsg)) {
        runtime.clientAdvanceCount++;
        data.state = MG_STATE_CLIENT_COMMUNICATING;
      }
      break;
    case MG_STATE_CLIENT_ASK_TOSS: {
      const input = DoMysteryGiftYesNo(runtime, data, false, gText_ThrowAwayWonderCard);
      if (input === 0) {
        if (runtime.savedWonderCardGiftNotReceived) data.state = MG_STATE_CLIENT_ASK_TOSS_UNRECEIVED;
        else {
          runtime.clientParams.push(0);
          runtime.clientAdvanceCount++;
          data.state = MG_STATE_CLIENT_COMMUNICATING;
        }
      } else if (input === 1 || input === MENU_B_PRESSED) {
        runtime.clientParams.push(1);
        runtime.clientAdvanceCount++;
        data.state = MG_STATE_CLIENT_COMMUNICATING;
      }
      break;
    }
    case MG_STATE_CLIENT_ASK_TOSS_UNRECEIVED: {
      const input = DoMysteryGiftYesNo(runtime, data, false, gText_HaventReceivedCardsGift);
      if (input === 0) {
        runtime.clientParams.push(0);
        runtime.clientAdvanceCount++;
        data.state = MG_STATE_CLIENT_COMMUNICATING;
      } else if (input === 1 || input === MENU_B_PRESSED) {
        runtime.clientParams.push(1);
        runtime.clientAdvanceCount++;
        data.state = MG_STATE_CLIENT_COMMUNICATING;
      }
      break;
    }
    case MG_STATE_CLIENT_LINK_END:
      if (runtime.linkRfuTaskFinished) {
        runtime.operations.push('DestroyWirelessStatusIndicatorSprite');
        data.state = MG_STATE_CLIENT_COMM_COMPLETED;
      }
      break;
    case MG_STATE_CLIENT_COMM_COMPLETED:
      if (PrintStringAndWait2Seconds(runtime, data, gText_CommunicationCompleted)) {
        if (data.sourceIsFriend) runtime.operations.push(`StringCopy(gStringVar1,${runtime.linkPlayerNames[0]})`);
        data.state = MG_STATE_CLIENT_RESULT_MSG;
      }
      break;
    case MG_STATE_CLIENT_RESULT_MSG: {
      const { successMsg, msg } = GetClientResultMessage(data.isWonderNews, data.sourceIsFriend, data.msgId);
      const input = successMsg ? PrintSuccessMessage(runtime, data, msg ?? data.clientMsg) : PrintMysteryGiftMenuMessage(runtime, data, msg ?? data.clientMsg);
      if (input) {
        if (data.msgId === CLI_MSG_NEWS_RECEIVED) runtime.wonderNewsRewards.push(data.sourceIsFriend ? WONDER_NEWS_RECV_FRIEND : WONDER_NEWS_RECV_WIRELESS);
        if (!successMsg) {
          data.state = MG_STATE_TO_MAIN_MENU;
          PrintMysteryGiftOrEReaderTopMenu(runtime, false, false);
        } else data.state = MG_STATE_SAVE_LOAD_GIFT;
      }
      break;
    }
    case MG_STATE_SAVE_LOAD_GIFT:
      if (SaveOnMysteryGiftMenu(runtime, data)) {
        data.state = MG_STATE_TO_MAIN_MENU;
        PrintMysteryGiftOrEReaderTopMenu(runtime, false, false);
      }
      break;
    case MG_STATE_LOAD_GIFT:
      if (HandleLoadWonderCardOrNews(runtime, data, data.isWonderNews)) data.state = MG_STATE_HANDLE_GIFT_INPUT;
      break;
    case MG_STATE_HANDLE_GIFT_INPUT:
      if (!data.isWonderNews) {
        if (consumeButton(runtime, A_BUTTON)) data.state = MG_STATE_HANDLE_GIFT_SELECT;
        if (consumeButton(runtime, B_BUTTON)) data.state = MG_STATE_GIFT_INPUT_EXIT;
      } else {
        if (runtime.wonderNewsInput === 1) {
          runtime.operations.push('WonderNews_RemoveScrollIndicatorArrowPair');
          data.state = MG_STATE_HANDLE_GIFT_SELECT;
        } else if (runtime.wonderNewsInput === 2) data.state = MG_STATE_GIFT_INPUT_EXIT;
      }
      break;
    case MG_STATE_HANDLE_GIFT_SELECT: {
      const cannotSend = !data.isWonderNews ? !runtime.sendingWonderCardAllowed : !runtime.sendingWonderNewsAllowed;
      const result = HandleMysteryGiftListMenu(runtime, data, data.isWonderNews, cannotSend);
      if (result === 0) data.state = MG_STATE_RECEIVE;
      else if (result === 1) data.state = MG_STATE_SEND;
      else if (result === 2) data.state = MG_STATE_ASK_TOSS;
      else if (result === LIST_CANCEL) {
        if (data.isWonderNews) runtime.operations.push('WonderNews_AddScrollIndicatorArrowPair');
        data.state = MG_STATE_HANDLE_GIFT_INPUT;
      }
      break;
    }
    case MG_STATE_ASK_TOSS: {
      const input = AskDiscardGift(runtime, data, data.isWonderNews);
      if (input === 0) data.state = !data.isWonderNews && runtime.savedWonderCardGiftNotReceived ? MG_STATE_ASK_TOSS_UNRECEIVED : MG_STATE_TOSS;
      else if (input === 1 || input === MENU_B_PRESSED) data.state = MG_STATE_HANDLE_GIFT_SELECT;
      break;
    }
    case MG_STATE_ASK_TOSS_UNRECEIVED: {
      const input = DoMysteryGiftYesNo(runtime, data, true, gText_HaventReceivedGiftOkayToDiscard);
      if (input === 0) data.state = MG_STATE_TOSS;
      else if (input === 1 || input === MENU_B_PRESSED) data.state = MG_STATE_HANDLE_GIFT_SELECT;
      break;
    }
    case MG_STATE_TOSS:
      if (ExitWonderCardOrNews(runtime, data.isWonderNews, true)) {
        ClearSavedNewsOrCard(runtime, data.isWonderNews);
        data.state = MG_STATE_TOSS_SAVE;
      }
      break;
    case MG_STATE_TOSS_SAVE:
      if (SaveOnMysteryGiftMenu(runtime, data)) data.state = MG_STATE_TOSSED;
      break;
    case MG_STATE_TOSSED:
      if (PrintThrownAway(runtime, data, data.isWonderNews)) {
        data.state = MG_STATE_TO_MAIN_MENU;
        PrintMysteryGiftOrEReaderTopMenu(runtime, false, false);
      }
      break;
    case MG_STATE_GIFT_INPUT_EXIT:
      if (ExitWonderCardOrNews(runtime, data.isWonderNews, false)) data.state = MG_STATE_TO_MAIN_MENU;
      break;
    case MG_STATE_RECEIVE:
      if (ExitWonderCardOrNews(runtime, data.isWonderNews, true)) data.state = MG_STATE_SOURCE_PROMPT;
      break;
    case MG_STATE_SEND:
      if (ExitWonderCardOrNews(runtime, data.isWonderNews, true)) {
        runtime.operations.push(`CreateTask_SendMysteryGift(${data.isWonderNews ? ACTIVITY_WONDER_NEWS : ACTIVITY_WONDER_CARD})`);
        data.sourceIsFriend = true;
        data.state = MG_STATE_SERVER_LINK_WAIT;
      }
      break;
    case MG_STATE_SERVER_LINK_WAIT:
      if (runtime.gReceivedRemoteLinkPlayers) {
        ClearScreenInBg0(runtime, true);
        data.state = MG_STATE_SERVER_LINK_START;
      } else if (runtime.gSpecialVar_Result === LINKUP_FAILED) {
        ClearScreenInBg0(runtime, true);
        data.state = MG_STATE_LOAD_GIFT;
      }
      break;
    case MG_STATE_SERVER_LINK_START:
      runtime.operations.push('Clear gStringVar1/2/3');
      if (!data.isWonderNews) {
        AddTextPrinterToWindow1(runtime, gText_SendingWonderCard);
        runtime.operations.push('MysterGiftServer_CreateForCard');
      } else {
        AddTextPrinterToWindow1(runtime, gText_SendingWonderNews);
        runtime.operations.push('MysterGiftServer_CreateForNews');
      }
      data.state = MG_STATE_SERVER_LINK;
      break;
    case MG_STATE_SERVER_LINK: {
      const ret = runtime.serverRunReturns.shift() ?? { ret: SVR_RET_ACTIVE };
      if (ret.endVal !== undefined) data.var = ret.endVal;
      if (ret.ret === SVR_RET_END) {
        data.msgId = data.var;
        data.state = MG_STATE_SERVER_LINK_END;
      }
      break;
    }
    case MG_STATE_SERVER_LINK_END:
      runtime.operations.push('Rfu_SetCloseLinkCallback', `StringCopy(gStringVar1,${runtime.linkPlayerNames[1]})`);
      data.state = MG_STATE_SERVER_LINK_END_WAIT;
      break;
    case MG_STATE_SERVER_LINK_END_WAIT:
      if (runtime.linkRfuTaskFinished) {
        runtime.operations.push('DestroyWirelessStatusIndicatorSprite');
        data.state = MG_STATE_SERVER_RESULT_MSG;
      }
      break;
    case MG_STATE_SERVER_RESULT_MSG:
      if (PrintServerResultMessage(runtime, data, data.sourceIsFriend, data.msgId)) {
        if (data.sourceIsFriend && data.msgId === SVR_MSG_NEWS_SENT) {
          runtime.wonderNewsRewards.push(WONDER_NEWS_SENT);
          data.state = MG_STATE_SAVE_LOAD_GIFT;
        } else {
          data.state = MG_STATE_TO_MAIN_MENU;
          PrintMysteryGiftOrEReaderTopMenu(runtime, false, false);
        }
      }
      break;
    case MG_STATE_CLIENT_ERROR:
    case MG_STATE_SERVER_ERROR:
      if (PrintMysteryGiftMenuMessage(runtime, data, gText_CommunicationError)) {
        data.state = MG_STATE_TO_MAIN_MENU;
        PrintMysteryGiftOrEReaderTopMenu(runtime, false, false);
      }
      break;
    case MG_STATE_EXIT:
      runtime.operations.push('CloseLink', 'HelpSystem_Enable', 'Free(clientMsg)');
      task(runtime, taskId).destroyed = true;
      runtime.mainCallback = 'MainCB_FreeAllBuffersAndReturnToInitTitleScreen';
      break;
  }
};

export const GetMysteryGiftBaseBlock = (): number => 0x19b;
