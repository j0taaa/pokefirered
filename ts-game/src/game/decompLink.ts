export const MAX_LINK_PLAYERS = 4;
export const MAX_RFU_PLAYERS = 5;
export const CMD_LENGTH = 8;
export const QUEUE_CAPACITY = 50;
export const OVERWORLD_RECV_QUEUE_MAX = 3;
export const BLOCK_BUFFER_SIZE = 0x100;
export const BLOCK_REQ_SIZE_NONE = 0;
export const BLOCK_REQ_SIZE_200 = 1;
export const BLOCK_REQ_SIZE_100 = 2;
export const BLOCK_REQ_SIZE_220 = 3;
export const BLOCK_REQ_SIZE_40 = 4;
export const TRAINER_ID_LENGTH = 4;
export const PLAYER_NAME_LENGTH = 7;
export const LINK_PLAYER_SIZE = 0x1c;
export const LINK_PLAYER_BLOCK_SIZE = 0x3c;

export const LINK_STAT_PLAYER_COUNT = 0x0000001c;
export const LINK_STAT_PLAYER_COUNT_SHIFT = 2;
export const LINK_STAT_MASTER = 0x00000020;
export const LINK_STAT_MASTER_SHIFT = 5;
export const LINK_STAT_CONN_ESTABLISHED = 0x00000040;
export const LINK_STAT_CONN_ESTABLISHED_SHIFT = 6;
export const LINK_STAT_RECEIVED_NOTHING = 0x00000100;
export const LINK_STAT_RECEIVED_NOTHING_SHIFT = 8;
export const LINK_STAT_UNK_FLAG_9 = 0x00000200;
export const LINK_STAT_UNK_FLAG_9_SHIFT = 9;
export const LINK_STAT_ERRORS = 0x0007f000;
export const LINK_STAT_ERRORS_SHIFT = 12;
export const LINK_STAT_ERROR_HARDWARE = 0x00001000;
export const LINK_STAT_ERROR_HARDWARE_SHIFT = 12;
export const LINK_STAT_ERROR_CHECKSUM = 0x00002000;
export const LINK_STAT_ERROR_CHECKSUM_SHIFT = 13;
export const LINK_STAT_ERROR_QUEUE_FULL = 0x00004000;
export const LINK_STAT_ERROR_QUEUE_FULL_SHIFT = 14;
export const LINK_STAT_ERROR_LAG_MASTER = 0x00010000;
export const LINK_STAT_ERROR_LAG_MASTER_SHIFT = 16;
export const LINK_STAT_ERROR_INVALID_ID = 0x00020000;
export const LINK_STAT_ERROR_INVALID_ID_SHIFT = 17;
export const LINK_STAT_ERROR_LAG_SLAVE = 0x00040000;
export const LINK_STAT_ERROR_LAG_SLAVE_SHIFT = 18;
export const BATTLE_TYPE_LINK_IN_BATTLE = 0x00000001;
export const LINK_SLAVE = 0;
export const LINK_MASTER = 8;
export const SIO_MULTI_SI = 0x0004;
export const SIO_MULTI_SD = 0x0008;
export const SIO_MULTI_MODE = 0x2000;
export const SIO_115200_BPS = 0x0003;
export const SIO_INTR_ENABLE = 0x4000;
export const SIO_START = 0x0080;
export const TIMER_64CLK = 0x01;
export const TIMER_INTR_ENABLE = 0x40;
export const TIMER_ENABLE = 0x80;
export const INTR_FLAG_TIMER3 = 1 << 6;
export const INTR_FLAG_SERIAL = 1 << 7;
export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const SELECT_BUTTON = 0x0004;
export const START_BUTTON = 0x0008;
export const R_BUTTON = 0x0100;
export const L_BUTTON = 0x0200;
export const PALETTES_ALL = 0xffffffff;
export const SAVE_LINK = 1;
export const LANGUAGE_JAPANESE = 1;
export const LANGUAGE_ENGLISH = 2;
const EXT_CTRL_CODE_BEGIN = 0xfc;
const EXT_CTRL_CODE_JPN = 0x15;
const EXT_CTRL_CODE_ENG = 0x16;
const EOS = 0xff;
export const SE_PIN = 21;
export const SE_BOO = 22;
export const RFU_ID = 0x00008001;
export const LINK_MAGIC_GAME_FREAK_INC = 'GameFreak inc.';
export const LINK_TEST_PRINT = 'TEST PRINT\nP0\nP1\nP2\nP3';
export const MASTER_HANDSHAKE = 0x8fff;
export const SLAVE_HANDSHAKE = 0xb9a0;
export const LINK_STATE_START0 = 0;
export const LINK_STATE_START1 = 1;
export const LINK_STATE_HANDSHAKE = 2;
export const LINK_STATE_INIT_TIMER = 3;
export const LINK_STATE_CONN_ESTABLISHED = 4;
export const QUEUE_FULL_NONE = 0;
export const QUEUE_FULL_SEND = 1;
export const QUEUE_FULL_RECV = 2;
export const LAG_NONE = 0;
export const LAG_MASTER = 1;
export const LAG_SLAVE = 2;

export const EXCHANGE_NOT_STARTED = 0;
export const EXCHANGE_COMPLETE = 1;
export const EXCHANGE_TIMED_OUT = 2;
export const EXCHANGE_DIFF_SELECTIONS = 3;
export const EXCHANGE_PLAYER_NOT_READY = 4;
export const EXCHANGE_PARTNER_NOT_READY = 5;
export const EXCHANGE_WRONG_NUM_PLAYERS = 6;

export const TRADE_BOTH_PLAYERS_READY = 0;
export const TRADE_PLAYER_NOT_READY = 1;
export const TRADE_PARTNER_NOT_READY = 2;

export const LINKTYPE_TRADE_SETUP = 0x1133;
export const LINKTYPE_TRADE = 0x1111;

export const REG_OFFSET_BG0CNT = 'REG_OFFSET_BG0CNT';
export const REG_OFFSET_BG1CNT = 'REG_OFFSET_BG1CNT';
export const REG_OFFSET_BG2CNT = 'REG_OFFSET_BG2CNT';
export const REG_OFFSET_BG3CNT = 'REG_OFFSET_BG3CNT';
export const REG_OFFSET_BG0HOFS = 'REG_OFFSET_BG0HOFS';
export const REG_OFFSET_BG0VOFS = 'REG_OFFSET_BG0VOFS';
export const REG_OFFSET_BG1HOFS = 'REG_OFFSET_BG1HOFS';
export const REG_OFFSET_BG1VOFS = 'REG_OFFSET_BG1VOFS';
export const REG_OFFSET_DISPCNT = 'REG_OFFSET_DISPCNT';
export const REG_OFFSET_BLDALPHA = 'REG_OFFSET_BLDALPHA';

export const DISPCNT_MODE_0 = 0x0000;
export const DISPCNT_OBJ_1D_MAP = 0x0040;
export const DISPCNT_BG0_ON = 0x0100;
export const DISPCNT_BG2_ON = 0x0400;
export const DISPCNT_OBJ_ON = 0x1000;
export const DISPCNT_WIN0_ON = 0x2000;
export const DISPCNT_WIN1_ON = 0x4000;
export const DISPCNT_OBJWIN_ON = 0x8000;
export const HEAP_SIZE = 0x1c000;
export const BG_SCREEN_SIZE = 0x800;

export const BGCNT_PRIORITY = (n: number): number => n;
export const BGCNT_CHARBASE = (n: number): number => n << 2;
export const BGCNT_SCREENBASE = (n: number): number => n << 8;

export const LINKCMD_SEND_LINK_TYPE = 0x2222;
export const LINKCMD_READY_EXIT_STANDBY = 0x2ffe;
export const LINKCMD_SEND_PACKET = 0x2fff;
export const LINKCMD_BLENDER_SEND_KEYS = 0x4444;
export const LINKCMD_DUMMY_1 = 0x5555;
export const LINKCMD_DUMMY_2 = 0x5566;
export const LINKCMD_READY_CLOSE_LINK = 0x5fff;
export const LINKCMD_SEND_EMPTY = 0x6666;
export const LINKCMD_SEND_0xEE = 0x7777;
export const LINKCMD_CONT_BLOCK = 0x8888;
export const LINKCMD_BLENDER_NO_PBLOCK_SPACE = 0xaaaa;
export const LINKCMD_SEND_ITEM = 0xaaab;
export const LINKCMD_INIT_BLOCK = 0xbbbb;
export const LINKCMD_SEND_HELD_KEYS = 0xcafe;
export const LINKCMD_SEND_BLOCK_REQ = 0xcccc;
export const LINKCMD_NONE = 0xefff;

export interface LinkPlayer {
  version?: number;
  lp_field_2?: number;
  trainerId: number;
  name: string;
  linkType?: number;
  id?: number;
  language?: number;
  gender?: number;
  progressFlagsCopy?: number;
  neverRead?: number;
  progressFlags?: number;
}

export interface LinkPlayerBlock {
  magic1: string;
  linkPlayer: LinkPlayer;
  magic2: string;
}

export interface LinkTestBGInfo {
  screenBaseBlock: number;
  paletteNum: number;
  baseChar: number;
  unused: number;
}

export interface BlockSendState {
  active: boolean;
  pos: number;
  size: number;
  multiplayerId: number;
  src: number[];
}

export interface BlockRecvState {
  pos: number;
  size: number;
  multiplayerId: number;
}

export interface SendQueueState {
  data: number[][];
  pos: number;
  count: number;
}

export interface RecvQueueState {
  data: number[][][];
  pos: number;
  count: number;
}

export interface LinkState {
  isMaster: number;
  state: number;
  localId: number;
  playerCount: number;
  tempRecvBuffer: number[];
  receivedNothing: boolean;
  serialIntrCounter: number;
  handshakeAsMaster: boolean;
  link_field_F: number;
  hardwareError: boolean;
  badChecksum: boolean;
  queueFull: number;
  lag: number;
  checksum: number;
  sendCmdIndex: number;
  recvCmdIndex: number;
  sendQueue: SendQueueState;
  recvQueue: RecvQueueState;
}

export interface DecompLinkRuntime {
  gSendCmd: number[];
  gRecvCmds: number[][];
  gLinkStatus: number;
  gLinkType: number;
  gMainHeldKeys: number;
  gSpecialVarItemId: number;
  gBlockRequestType: number;
  gReadyCloseLinkType: number;
  gHeldKeyCodeToSend: number;
  gLinkTransferringData: boolean;
  multiplayerId: number;
  gBlockSendBuffer: number[];
  sBlockSend: BlockSendState;
  sBlockSendDelayCounter: number;
  gLinkCallback:
    | 'LinkCB_BlockSendBegin'
    | 'LinkCB_BlockSend'
    | 'LinkCB_BlockSendEnd'
    | 'LinkCB_SendHeldKeys'
    | 'LinkCB_BerryBlenderSendHeldKeys'
    | 'LinkCB_ReadyCloseLink'
    | 'LinkCB_WaitCloseLink'
    | 'LinkCB_Standby'
    | 'LinkCB_StandbyForAll'
    | 'LinkCB_RequestPlayerDataExchange'
    | null;
  gWirelessCommType: number;
  gReceivedRemoteLinkPlayers: boolean;
  gLinkErrorOccurred: boolean;
  gLinkDebugSeed: number;
  gLinkDebugFlags: number;
  gSuppressLinkErrorMessage: boolean;
  sDummy1: boolean;
  gLinkDummy1: boolean;
  gLinkDummy2: boolean;
  gLinkVSyncDisabled: boolean;
  sLinkOpen: boolean;
  gLastRecvQueueCount: number;
  gLastSendQueueCount: number;
  gBattleTypeFlags: number;
  gReadyToCloseLink: boolean[];
  gReadyToExitStandby: boolean[];
  sReadyCloseLinkAttempts: number;
  rfuCloseLinkCallbacks: number;
  rfuStandbyCallbacks: number;
  closedLinkCount: number;
  mainCallback2: string | null;
  mainCallback1: string | null;
  mainState: number;
  mainNewKeys: number;
  mainHeldKeysInput: number;
  vblankCounter2: number;
  paletteFades: Array<{ selectedPalettes: number; delay: number; startY: number; targetY: number; color: number }>;
  saveAttempts: number[];
  rngValue: number;
  resetSpriteDataCount: number;
  freeAllSpritePalettesCount: number;
  resetTasksCount: number;
  createdTasks: Array<{ func: string; priority: number }>;
  vblankCallback: string | null;
  vblankOperations: string[];
  loadOamCount: number;
  processSpriteCopyRequestsCount: number;
  transferPlttBufferCount: number;
  runTasksCount: number;
  animateSpritesCount: number;
  buildOamBufferCount: number;
  updatePaletteFadeCount: number;
  playedSoundEffects: number[];
  linkErrorScreens: string[];
  linkErrorSetupCount: number;
  linkErrorBgTilemapBufferSize: number;
  decompressedBgGfxCalls: Array<{ bg: number; gfx: string; useHeap: boolean; size: number; offset: number }>;
  copyToBgTilemapBufferCalls: Array<{ bg: number; tilemap: string; mode: number; destOffset: number }>;
  copyBgTilemapBufferToVramCalls: number[];
  fillWindowPixelBufferCalls: Array<{ windowId: number; fillValue: number }>;
  textPrinterCalls: Array<{ windowId: number; font: string; x: number; y: number; color: number[]; speed: number; text: string }>;
  putWindowTilemapCalls: number[];
  copyWindowToVramCalls: Array<{ windowId: number; mode: string }>;
  showBgCalls: number[];
  musicPlayersStopped: string[];
  initHeapCalls: Array<{ heap: string; size: number }>;
  resetPaletteFadeControlCount: number;
  backdropColor: number | null;
  scanlineEffectStopCount: number;
  resetBgsAndClearDma3BusyFlagsArgs: boolean[];
  initBgsFromTemplatesCalls: Array<{ bgMode: number; templateCount: number }>;
  setBgTilemapBufferCalls: Array<{ bg: number; size: number }>;
  deactivateAllTextPrintersCount: number;
  resetTempTileDataBuffersCount: number;
  clearGpuRegBitsCalls: Array<{ reg: string; bits: number }>;
  loadedPalettes: Array<{ palette: string; offset: number; size: number }>;
  stopMapMusicCount: number;
  initWindowsResult: boolean;
  helpSystemEnabled: boolean;
  reloadSaveCount: number;
  softResetCount: number;
  rfuStopModeCount: number;
  rfuWaitReqCompleteCount: number;
  resetLinkRfuGFLayerCount: number;
  softResetDisabled: boolean;
  qlPlaybackState: boolean;
  rfuIgnoreError: boolean;
  rfuOperations: string[];
  rfuSoftResetCheckId: number;
  restoreSerialTimer3IntrHandlersCount: number;
  destroyedTasks: number[];
  linkTestBGInfo: LinkTestBGInfo;
  linkGpuRegs: Record<string, number>;
  linkTestTilemap: number[];
  linkTestPrintHexCalls: Array<{ num: number; x: number; y: number; length: number }>;
  sLinkTestLastBlockSendPos: number;
  sLinkTestLastBlockRecvPos: number[];
  gLinkTestBlockChecksums: number[];
  sLinkTestDebugValuesEnabled: boolean;
  sDummyFlag: boolean;
  sDummy3: number;
  sLinkErrorBuffer: {
    status: number;
    lastRecvQueueCount: number;
    lastSendQueueCount: number;
    disconnected: number;
  };
  gBerryBlenderKeySendAttempts: number;
  sDummy2: number;
  rfuKeysStarted: number;
  rfuKeysSending: boolean;
  rfuCallbackCleared: number;
  rfuMultiplayerId: number;
  rfuLinkPlayerCount: number;
  rfuIsMaster: boolean;
  rfuBlockReceivedStatus: boolean[];
  rfuTaskFinished: boolean;
  rfuInitBlockSends: Array<{ src: readonly number[]; size: number }>;
  rfuSendBlockRequests: number[];
  rfuMain1Result: boolean;
  rfuMain2Result: boolean;
  rfuRecvQueueEmpty: boolean;
  rfuMain1Count: number;
  rfuMain2Count: number;
  sendingKeysOverCableOverride: boolean | null;
  gBlockReceivedStatus: boolean[];
  gLinkHeldKeys: number;
  gLinkPartnersHeldKeys: number[];
  gRemoteLinkPlayersNotReceived: boolean[];
  gHeap: number[];
  gLocalLinkPlayer: LinkPlayer;
  gLocalLinkPlayerBlock: LinkPlayerBlock;
  gBlockRecvBlocks: LinkPlayerBlock[];
  sBlockRecv: BlockRecvState[];
  gBlockRecvBuffer: number[][];
  gDecompressionBuffer: number[];
  gLinkPlayers: LinkPlayer[];
  gSavedLinkPlayers: LinkPlayer[];
  gSavedLinkPlayerCount: number;
  gSavedMultiplayerId: number;
  sPlayerDataExchangeStatus: number;
  sTimeOutCounter: number;
  tradeProgressForLinkTrade: number;
  gShouldAdvanceLinkState: number;
  gLink: LinkState;
  sSendNonzeroCheck: number;
  sRecvNonzeroCheck: number;
  sChecksumAvailable: number;
  sHandshakePlayerCount: number;
  sNumVBlanksWithoutSerialIntr: number;
  sSendBufferEmpty: boolean;
  rfuRecvQueueLength: number;
  regSiomltRecv: number[];
  regSiomltSend: number;
  regRcnt: number;
  regSiocnt: number;
  regSiocntId: number;
  regSiocntError: boolean;
  regSiocntTerminals: number;
  regTm3cntL: number;
  regTm3cntH: number;
  regIf: number;
  regIme: number;
  gLinkSavedIme: number;
  imeTransitions: Array<{ op: string; value: number }>;
  disabledInterrupts: number[];
  enabledInterrupts: number[];
  serialStartedCount: number;
  timerEnabled: boolean;
  timerReload: number;
  playerTrainerId: number[];
  playerName: string;
  playerGender: number;
  gameLanguage: number;
  gameVersion: number;
  convertedInternationalStrings: Array<{ before: string; after: string; language: number }>;
  nationalPokedexEnabled: boolean;
  canLinkWithRs: boolean;
  triggerHandshakeTasksCreated: number;
  rfuApiInitialized: number;
  rfuShutdowns: number;
}

export const createDecompLinkRuntime = (overrides: Partial<DecompLinkRuntime> = {}): DecompLinkRuntime => ({
  gSendCmd: Array.from({ length: CMD_LENGTH }, () => 0),
  gRecvCmds: Array.from({ length: MAX_RFU_PLAYERS }, () => Array.from({ length: CMD_LENGTH }, () => 0)),
  gLinkStatus: 0,
  gLinkType: 0,
  gMainHeldKeys: 0,
  gSpecialVarItemId: 0,
  gBlockRequestType: 0,
  gReadyCloseLinkType: 0,
  gHeldKeyCodeToSend: 0,
  gLinkTransferringData: false,
  multiplayerId: 0,
  gBlockSendBuffer: Array.from({ length: BLOCK_BUFFER_SIZE }, () => 0),
  sBlockSend: {
    active: false,
    pos: 0,
    size: 0,
    multiplayerId: 0,
    src: []
  },
  sBlockSendDelayCounter: 0,
  gLinkCallback: null,
  gWirelessCommType: 0,
  gReceivedRemoteLinkPlayers: false,
  gLinkErrorOccurred: false,
  gLinkDebugSeed: 0,
  gLinkDebugFlags: 0,
  gSuppressLinkErrorMessage: false,
  sDummy1: false,
  gLinkDummy1: false,
  gLinkDummy2: false,
  gLinkVSyncDisabled: false,
  sLinkOpen: false,
  gLastRecvQueueCount: 0,
  gLastSendQueueCount: 0,
  gBattleTypeFlags: 0,
  gReadyToCloseLink: Array.from({ length: MAX_LINK_PLAYERS }, () => false),
  gReadyToExitStandby: Array.from({ length: MAX_LINK_PLAYERS }, () => false),
  sReadyCloseLinkAttempts: 0,
  rfuCloseLinkCallbacks: 0,
  rfuStandbyCallbacks: 0,
  closedLinkCount: 0,
  mainCallback2: null,
  mainCallback1: null,
  mainState: 0,
  mainNewKeys: 0,
  mainHeldKeysInput: 0,
  vblankCounter2: 0,
  paletteFades: [],
  saveAttempts: [],
  rngValue: 0,
  resetSpriteDataCount: 0,
  freeAllSpritePalettesCount: 0,
  resetTasksCount: 0,
  createdTasks: [],
  vblankCallback: null,
  vblankOperations: [],
  loadOamCount: 0,
  processSpriteCopyRequestsCount: 0,
  transferPlttBufferCount: 0,
  runTasksCount: 0,
  animateSpritesCount: 0,
  buildOamBufferCount: 0,
  updatePaletteFadeCount: 0,
  playedSoundEffects: [],
  linkErrorScreens: [],
  linkErrorSetupCount: 0,
  linkErrorBgTilemapBufferSize: 0,
  decompressedBgGfxCalls: [],
  copyToBgTilemapBufferCalls: [],
  copyBgTilemapBufferToVramCalls: [],
  fillWindowPixelBufferCalls: [],
  textPrinterCalls: [],
  putWindowTilemapCalls: [],
  copyWindowToVramCalls: [],
  showBgCalls: [],
  musicPlayersStopped: [],
  initHeapCalls: [],
  resetPaletteFadeControlCount: 0,
  backdropColor: null,
  scanlineEffectStopCount: 0,
  resetBgsAndClearDma3BusyFlagsArgs: [],
  initBgsFromTemplatesCalls: [],
  setBgTilemapBufferCalls: [],
  deactivateAllTextPrintersCount: 0,
  resetTempTileDataBuffersCount: 0,
  clearGpuRegBitsCalls: [],
  loadedPalettes: [],
  stopMapMusicCount: 0,
  initWindowsResult: true,
  helpSystemEnabled: false,
  reloadSaveCount: 0,
  softResetCount: 0,
  rfuStopModeCount: 0,
  rfuWaitReqCompleteCount: 0,
  resetLinkRfuGFLayerCount: 0,
  softResetDisabled: true,
  qlPlaybackState: false,
  rfuIgnoreError: false,
  rfuOperations: [],
  rfuSoftResetCheckId: 0,
  restoreSerialTimer3IntrHandlersCount: 0,
  destroyedTasks: [],
  linkTestBGInfo: { screenBaseBlock: 0, paletteNum: 0, baseChar: 0, unused: 0 },
  linkGpuRegs: {},
  linkTestTilemap: Array.from({ length: 32 * 32 }, () => 0),
  linkTestPrintHexCalls: [],
  sLinkTestLastBlockSendPos: 0,
  sLinkTestLastBlockRecvPos: Array.from({ length: MAX_LINK_PLAYERS }, () => 0),
  gLinkTestBlockChecksums: Array.from({ length: MAX_LINK_PLAYERS }, () => 0),
  sLinkTestDebugValuesEnabled: false,
  sDummyFlag: false,
  sDummy3: 0,
  sLinkErrorBuffer: { status: 0, lastRecvQueueCount: 0, lastSendQueueCount: 0, disconnected: 0 },
  gBerryBlenderKeySendAttempts: 0,
  sDummy2: 0,
  rfuKeysStarted: 0,
  rfuKeysSending: false,
  rfuCallbackCleared: 0,
  rfuMultiplayerId: 0,
  rfuLinkPlayerCount: 0,
  rfuIsMaster: false,
  rfuBlockReceivedStatus: Array.from({ length: MAX_RFU_PLAYERS }, () => false),
  rfuTaskFinished: true,
  rfuInitBlockSends: [],
  rfuSendBlockRequests: [],
  rfuMain1Result: false,
  rfuMain2Result: false,
  rfuRecvQueueEmpty: false,
  rfuMain1Count: 0,
  rfuMain2Count: 0,
  sendingKeysOverCableOverride: null,
  gBlockReceivedStatus: Array.from({ length: MAX_LINK_PLAYERS }, () => false),
  gLinkHeldKeys: 0,
  gLinkPartnersHeldKeys: Array.from({ length: 6 }, () => 0),
  gRemoteLinkPlayersNotReceived: Array.from({ length: MAX_LINK_PLAYERS }, () => false),
  gHeap: Array.from({ length: 0x7000 }, () => 0),
  gLocalLinkPlayer: { trainerId: 0, name: '' },
  gLocalLinkPlayerBlock: { magic1: '', linkPlayer: { trainerId: 0, name: '' }, magic2: '' },
  gBlockRecvBlocks: Array.from({ length: MAX_RFU_PLAYERS }, () => ({
    magic1: '',
    linkPlayer: { trainerId: 0, name: '' },
      magic2: ''
  })),
  sBlockRecv: Array.from({ length: MAX_LINK_PLAYERS }, () => ({ pos: 0, size: 0, multiplayerId: 0 })),
  gBlockRecvBuffer: Array.from({ length: MAX_RFU_PLAYERS }, () => Array.from({ length: BLOCK_BUFFER_SIZE / 2 }, () => 0)),
  gDecompressionBuffer: Array.from({ length: 0x2000 }, () => 0),
  gLinkPlayers: Array.from({ length: MAX_RFU_PLAYERS }, () => ({ trainerId: 0, name: '' })),
  gSavedLinkPlayers: Array.from({ length: MAX_RFU_PLAYERS }, () => ({ trainerId: 0, name: '' })),
  gSavedLinkPlayerCount: 0,
  gSavedMultiplayerId: 0,
  sPlayerDataExchangeStatus: EXCHANGE_NOT_STARTED,
  sTimeOutCounter: 0,
  tradeProgressForLinkTrade: TRADE_BOTH_PLAYERS_READY,
  gShouldAdvanceLinkState: 0,
  gLink: {
    isMaster: LINK_SLAVE,
    state: LINK_STATE_START0,
    localId: 0,
    playerCount: 0,
    tempRecvBuffer: Array.from({ length: MAX_LINK_PLAYERS }, () => 0),
    receivedNothing: false,
    serialIntrCounter: 0,
    handshakeAsMaster: false,
    link_field_F: 0,
    hardwareError: false,
    badChecksum: false,
    queueFull: QUEUE_FULL_NONE,
    lag: LAG_NONE,
    checksum: 0,
    sendCmdIndex: 0,
    recvCmdIndex: 0,
    sendQueue: {
      data: Array.from({ length: CMD_LENGTH }, () => Array.from({ length: QUEUE_CAPACITY }, () => 0)),
      pos: 0,
      count: 0
    },
    recvQueue: {
      data: Array.from({ length: MAX_LINK_PLAYERS }, () =>
        Array.from({ length: CMD_LENGTH }, () => Array.from({ length: QUEUE_CAPACITY }, () => 0))
      ),
      pos: 0,
      count: 0
    }
  },
  sSendNonzeroCheck: 0,
  sRecvNonzeroCheck: 0,
  sChecksumAvailable: 0,
  sHandshakePlayerCount: 0,
  sNumVBlanksWithoutSerialIntr: 0,
  sSendBufferEmpty: false,
  rfuRecvQueueLength: 0,
  regSiomltRecv: Array.from({ length: MAX_LINK_PLAYERS }, () => 0),
  regSiomltSend: 0,
  regRcnt: 0,
  regSiocnt: 0,
  regSiocntId: 0,
  regSiocntError: false,
  regSiocntTerminals: 0,
  regTm3cntL: 0,
  regTm3cntH: 0,
  regIf: 0,
  regIme: 0,
  gLinkSavedIme: 0,
  imeTransitions: [],
  disabledInterrupts: [],
  enabledInterrupts: [],
  serialStartedCount: 0,
  timerEnabled: false,
  timerReload: 0,
  playerTrainerId: [0, 0, 0, 0],
  playerName: '',
  playerGender: 0,
  gameLanguage: 1,
  gameVersion: 1,
  convertedInternationalStrings: [],
  nationalPokedexEnabled: false,
  canLinkWithRs: false,
  triggerHandshakeTasksCreated: 0,
  rfuApiInitialized: 0,
  rfuShutdowns: 0,
  ...overrides
});

const u16 = (value: number): number => value & 0xffff;

const Random = (runtime: DecompLinkRuntime): number => {
  runtime.rngValue = (Math.imul(1103515245, runtime.rngValue >>> 0) + 24691) >>> 0;
  return runtime.rngValue >>> 16;
};

const SeedRng = (runtime: DecompLinkRuntime, seed: number): void => {
  runtime.rngValue = seed & 0xffff;
};

const writeU16LE = (buffer: number[], offset: number, value: number): void => {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >> 8) & 0xff;
};

const writeU32LE = (buffer: number[], offset: number, value: number): void => {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >> 8) & 0xff;
  buffer[offset + 2] = (value >> 16) & 0xff;
  buffer[offset + 3] = (value >> 24) & 0xff;
};

const writePaddedString = (buffer: number[], offset: number, text: string, length: number): void => {
  for (let i = 0; i < length; i += 1)
    buffer[offset + i] = i < text.length ? text.charCodeAt(i) & 0xff : 0;
};

const readRecvBufferByte = (runtime: DecompLinkRuntime, who: number, offset: number): number => {
  const word = runtime.gBlockRecvBuffer[who][Math.trunc(offset / 2)] ?? 0;
  return offset % 2 === 0 ? word & 0xff : (word >> 8) & 0xff;
};

const readRecvBufferU16LE = (runtime: DecompLinkRuntime, who: number, offset: number): number =>
  readRecvBufferByte(runtime, who, offset) | (readRecvBufferByte(runtime, who, offset + 1) << 8);

const readRecvBufferU32LE = (runtime: DecompLinkRuntime, who: number, offset: number): number =>
  (readRecvBufferU16LE(runtime, who, offset) | (readRecvBufferU16LE(runtime, who, offset + 2) << 16)) >>> 0;

const readRecvBufferString = (runtime: DecompLinkRuntime, who: number, offset: number, length: number): string => {
  const chars: number[] = [];
  for (let i = 0; i < length; i += 1) {
    const char = readRecvBufferByte(runtime, who, offset + i);
    if (char === 0)
      break;
    chars.push(char);
  }
  return String.fromCharCode(...chars);
};

const s8 = (value: number): number => {
  const truncated = value & 0xff;
  return truncated >= 0x80 ? truncated - 0x100 : truncated;
};

const bgCntReg = (bgNum: number): string =>
  [REG_OFFSET_BG0CNT, REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT, REG_OFFSET_BG3CNT][bgNum] ?? `REG_OFFSET_BG${bgNum}CNT`;

const bgHofsReg = (bgNum: number): string =>
  bgNum === 0 ? REG_OFFSET_BG0HOFS : `REG_OFFSET_BG${bgNum}HOFS`;

const bgVofsReg = (bgNum: number): string =>
  bgNum === 0 ? REG_OFFSET_BG0VOFS : `REG_OFFSET_BG${bgNum}VOFS`;

const blockRequestSizes = [200, 200, 100, 220, 40];

export const EXTRACT_PLAYER_COUNT = (status: number): number =>
  (status & LINK_STAT_PLAYER_COUNT) >> LINK_STAT_PLAYER_COUNT_SHIFT;

export const EXTRACT_MASTER = (status: number): number =>
  (status >> LINK_STAT_MASTER_SHIFT) & 1;

export const EXTRACT_CONN_ESTABLISHED = (status: number): number =>
  (status >> LINK_STAT_CONN_ESTABLISHED_SHIFT) & 1;

export const EXTRACT_RECEIVED_NOTHING = (status: number): number =>
  (status >> LINK_STAT_RECEIVED_NOTHING_SHIFT) & 1;

export const EXTRACT_LINK_ERRORS = (status: number): number =>
  (status & LINK_STAT_ERRORS) >> LINK_STAT_ERRORS_SHIFT;

export const GetMultiplayerId = (runtime: DecompLinkRuntime): number =>
  runtime.gWirelessCommType === 1
    ? runtime.rfuMultiplayerId & 0xff
    : runtime.multiplayerId & 0xff;

export const ResetBlockSend = (runtime: DecompLinkRuntime): void => {
  runtime.sBlockSend.active = false;
  runtime.sBlockSend.pos = 0;
  runtime.sBlockSend.size = 0;
  runtime.sBlockSend.src = [];
};

export const IsWirelessAdapterConnected = (runtime: DecompLinkRuntime): boolean => {
  if (runtime.qlPlaybackState)
    return false;

  SetWirelessCommType1(runtime);
  runtime.rfuOperations.push('SetWirelessCommType1');
  runtime.rfuApiInitialized += 1;
  runtime.rfuOperations.push('InitRFUAPI');
  runtime.rfuIgnoreError = true;
  runtime.rfuOperations.push('RfuSetIgnoreError:true');
  runtime.rfuOperations.push('rfu_LMAN_REQBN_softReset_and_checkID');
  if (runtime.rfuSoftResetCheckId === RFU_ID) {
    runtime.rfuStopModeCount += 1;
    runtime.rfuOperations.push('rfu_REQ_stopMode');
    runtime.rfuWaitReqCompleteCount += 1;
    runtime.rfuOperations.push('rfu_waitREQComplete');
    return true;
  }

  SetWirelessCommType0(runtime);
  runtime.rfuOperations.push('SetWirelessCommType0_Internal');
  CloseLink(runtime);
  runtime.rfuOperations.push('CloseLink');
  runtime.restoreSerialTimer3IntrHandlersCount += 1;
  runtime.rfuOperations.push('RestoreSerialTimer3IntrHandlers');
  return false;
};

export const Task_DestroySelf = (runtime: DecompLinkRuntime, taskId: number): void => {
  runtime.destroyedTasks.push(taskId & 0xff);
};

const ResetSpriteData = (runtime: DecompLinkRuntime): void => {
  runtime.resetSpriteDataCount += 1;
};

const FreeAllSpritePalettes = (runtime: DecompLinkRuntime): void => {
  runtime.freeAllSpritePalettesCount += 1;
};

const ResetTasks = (runtime: DecompLinkRuntime): void => {
  runtime.resetTasksCount += 1;
  runtime.createdTasks = [];
};

const SetVBlankCallback = (runtime: DecompLinkRuntime, callback: string | null): void => {
  runtime.vblankCallback = callback;
};

const CreateTask = (runtime: DecompLinkRuntime, func: string, priority: number): void => {
  runtime.createdTasks.push({ func, priority });
};

const SetGpuReg = (runtime: DecompLinkRuntime, reg: string, value: number): void => {
  runtime.linkGpuRegs[reg] = value >>> 0;
};

const ClearGpuRegBits = (runtime: DecompLinkRuntime, reg: string, bits: number): void => {
  runtime.linkGpuRegs[reg] = (runtime.linkGpuRegs[reg] ?? 0) & ~bits;
  runtime.clearGpuRegBitsCalls.push({ reg, bits });
};

const LoadOam = (runtime: DecompLinkRuntime): void => {
  runtime.loadOamCount += 1;
  runtime.vblankOperations.push('LoadOam');
};

const ProcessSpriteCopyRequests = (runtime: DecompLinkRuntime): void => {
  runtime.processSpriteCopyRequestsCount += 1;
  runtime.vblankOperations.push('ProcessSpriteCopyRequests');
};

const TransferPlttBuffer = (runtime: DecompLinkRuntime): void => {
  runtime.transferPlttBufferCount += 1;
  runtime.vblankOperations.push('TransferPlttBuffer');
};

export const VBlankCB_LinkError = (runtime: DecompLinkRuntime): void => {
  LoadOam(runtime);
  ProcessSpriteCopyRequests(runtime);
  TransferPlttBuffer(runtime);
};

export const InitLinkTestBG = (
  runtime: DecompLinkRuntime,
  paletteNum: number,
  bgNum: number,
  screenBaseBlock: number,
  charBaseBlock: number,
  baseChar: number
): void => {
  runtime.linkTestBGInfo.screenBaseBlock = screenBaseBlock;
  runtime.linkTestBGInfo.paletteNum = paletteNum;
  runtime.linkTestBGInfo.baseChar = baseChar;
  switch (bgNum) {
    case 1:
      runtime.linkGpuRegs[REG_OFFSET_BG1CNT] = BGCNT_SCREENBASE(screenBaseBlock) | BGCNT_PRIORITY(1) | BGCNT_CHARBASE(charBaseBlock);
      break;
    case 2:
      runtime.linkGpuRegs[REG_OFFSET_BG2CNT] = BGCNT_SCREENBASE(screenBaseBlock) | BGCNT_PRIORITY(1) | BGCNT_CHARBASE(charBaseBlock);
      break;
    case 3:
      runtime.linkGpuRegs[REG_OFFSET_BG3CNT] = BGCNT_SCREENBASE(screenBaseBlock) | BGCNT_PRIORITY(1) | BGCNT_CHARBASE(charBaseBlock);
      break;
  }
  runtime.linkGpuRegs[bgHofsReg(bgNum)] = 0;
  runtime.linkGpuRegs[bgVofsReg(bgNum)] = 0;
};

export const LoadLinkTestBgGfx = (
  runtime: DecompLinkRuntime,
  paletteNum: number,
  bgNum: number,
  screenBaseBlock: number,
  charBaseBlock: number
): void => {
  runtime.linkTestBGInfo.screenBaseBlock = screenBaseBlock;
  runtime.linkTestBGInfo.paletteNum = paletteNum;
  runtime.linkTestBGInfo.baseChar = 0;
  runtime.linkGpuRegs[bgCntReg(bgNum)] = BGCNT_SCREENBASE(screenBaseBlock) | BGCNT_CHARBASE(charBaseBlock);
};

export const LinkTestScreen = (runtime: DecompLinkRuntime): void => {
  ResetSpriteData(runtime);
  FreeAllSpritePalettes(runtime);
  ResetTasks(runtime);
  SetVBlankCallback(runtime, 'VBlankCB_LinkError');
  ResetBlockSend(runtime);
  runtime.gLinkType = LINKTYPE_TRADE;
  OpenLink(runtime);
  SeedRng(runtime, runtime.vblankCounter2);
  for (let i = 0; i < TRAINER_ID_LENGTH; i += 1)
    runtime.playerTrainerId[i] = Random(runtime) % 256;

  InitLinkTestBG(runtime, 0, 2, 4, 0, 0);
  SetGpuReg(runtime, REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON | DISPCNT_BG2_ON | DISPCNT_OBJ_ON);
  CreateTask(runtime, 'Task_DestroySelf', 0);
  RunTasks(runtime);
  AnimateSprites(runtime);
  BuildOamBuffer(runtime);
  UpdatePaletteFade(runtime);
  runtime.sDummy3 = 0;
  initLocalLinkPlayer(runtime);
  CreateTask(runtime, 'Task_PrintTestData', 0);
  runtime.mainCallback2 = 'CB2_LinkTest';
};

const resetLinkStruct = (runtime: DecompLinkRuntime): void => {
  runtime.gLink.isMaster = LINK_SLAVE;
  runtime.gLink.state = LINK_STATE_START0;
  runtime.gLink.localId = 0;
  runtime.gLink.playerCount = 0;
  runtime.gLink.tempRecvBuffer.fill(0);
  runtime.gLink.receivedNothing = false;
  runtime.gLink.serialIntrCounter = 0;
  runtime.gLink.handshakeAsMaster = false;
  runtime.gLink.link_field_F = 0;
  runtime.gLink.hardwareError = false;
  runtime.gLink.badChecksum = false;
  runtime.gLink.queueFull = QUEUE_FULL_NONE;
  runtime.gLink.lag = LAG_NONE;
  runtime.gLink.checksum = 0;
  runtime.gLink.sendCmdIndex = 0;
  runtime.gLink.recvCmdIndex = 0;
  runtime.gLink.sendQueue.pos = 0;
  runtime.gLink.sendQueue.count = 0;
  runtime.gLink.recvQueue.pos = 0;
  runtime.gLink.recvQueue.count = 0;
  for (let i = 0; i < CMD_LENGTH; i += 1)
    runtime.gLink.sendQueue.data[i].fill(0);
  for (let i = 0; i < MAX_LINK_PLAYERS; i += 1) {
    for (let j = 0; j < CMD_LENGTH; j += 1)
      runtime.gLink.recvQueue.data[i][j].fill(0);
  }
};

const disableSerial = (runtime: DecompLinkRuntime): void => {
  const flags = INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL;
  runtime.disabledInterrupts.push(flags);
  runtime.regSiocnt = SIO_MULTI_MODE;
  runtime.regTm3cntH = 0;
  runtime.regIf = flags;
  runtime.regSiomltSend = 0;
  runtime.regSiomltRecv.fill(0);
  resetLinkStruct(runtime);
};

const enableSerial = (runtime: DecompLinkRuntime): void => {
  const flags = INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL;
  runtime.disabledInterrupts.push(flags);
  runtime.regRcnt = 0;
  runtime.regSiocnt = SIO_MULTI_MODE;
  runtime.regSiocnt |= SIO_115200_BPS | SIO_INTR_ENABLE;
  runtime.enabledInterrupts.push(INTR_FLAG_SERIAL);
  runtime.regSiomltSend = 0;
  resetLinkStruct(runtime);
  runtime.sNumVBlanksWithoutSerialIntr = 0;
  runtime.sSendNonzeroCheck = 0;
  runtime.sRecvNonzeroCheck = 0;
  runtime.sChecksumAvailable = 0;
  runtime.sHandshakePlayerCount = 0;
  runtime.gLastSendQueueCount = 0;
  runtime.gLastRecvQueueCount = 0;
};

export const ResetSerial = (runtime: DecompLinkRuntime): void => {
  enableSerial(runtime);
  disableSerial(runtime);
};

const checkMasterOrSlave = (runtime: DecompLinkRuntime): void => {
  const terminals = runtime.regSiocntTerminals & (SIO_MULTI_SD | SIO_MULTI_SI);
  if (terminals === SIO_MULTI_SD && runtime.gLink.localId === 0)
    runtime.gLink.isMaster = LINK_MASTER;
  else
    runtime.gLink.isMaster = LINK_SLAVE;
};

const initTimer = (runtime: DecompLinkRuntime): void => {
  if (runtime.gLink.isMaster) {
    runtime.regTm3cntL = -197;
    runtime.regTm3cntH = TIMER_64CLK | TIMER_INTR_ENABLE;
    runtime.enabledInterrupts.push(INTR_FLAG_TIMER3);
    runtime.timerReload = -197;
    runtime.timerEnabled = false;
  }
};

const cloneLinkPlayer = (player: LinkPlayer): LinkPlayer => ({ ...player });

const initLocalLinkPlayer = (runtime: DecompLinkRuntime): void => {
  runtime.gLocalLinkPlayer.trainerId = u16(runtime.playerTrainerId[0] ?? 0)
    | ((runtime.playerTrainerId[1] ?? 0) << 8)
    | ((runtime.playerTrainerId[2] ?? 0) << 16)
    | ((runtime.playerTrainerId[3] ?? 0) << 24);
  runtime.gLocalLinkPlayer.name = runtime.playerName;
  runtime.gLocalLinkPlayer.gender = runtime.playerGender;
  runtime.gLocalLinkPlayer.linkType = runtime.gLinkType;
  runtime.gLocalLinkPlayer.language = runtime.gameLanguage;
  runtime.gLocalLinkPlayer.version = runtime.gameVersion + 0x4000;
  runtime.gLocalLinkPlayer.lp_field_2 = 0x8000;
  runtime.gLocalLinkPlayer.progressFlags = runtime.nationalPokedexEnabled ? 1 : 0;
  if (runtime.canLinkWithRs)
    runtime.gLocalLinkPlayer.progressFlags |= 0x10;
};

export const InitLocalLinkPlayer = initLocalLinkPlayer;

export const BuildSendCmd = (runtime: DecompLinkRuntime, command: number): void => {
  switch (command) {
    case LINKCMD_SEND_LINK_TYPE:
      runtime.gSendCmd[0] = LINKCMD_SEND_LINK_TYPE;
      runtime.gSendCmd[1] = runtime.gLinkType;
      break;
    case LINKCMD_READY_EXIT_STANDBY:
      runtime.gSendCmd[0] = LINKCMD_READY_EXIT_STANDBY;
      break;
    case LINKCMD_BLENDER_SEND_KEYS:
      runtime.gSendCmd[0] = LINKCMD_BLENDER_SEND_KEYS;
      runtime.gSendCmd[1] = runtime.gMainHeldKeys;
      break;
    case LINKCMD_DUMMY_1:
      runtime.gSendCmd[0] = LINKCMD_DUMMY_1;
      break;
    case LINKCMD_SEND_EMPTY:
      runtime.gSendCmd[0] = LINKCMD_SEND_EMPTY;
      runtime.gSendCmd[1] = 0;
      break;
    case LINKCMD_SEND_0xEE:
      runtime.gSendCmd[0] = LINKCMD_SEND_0xEE;
      for (let i = 0; i < 5; i += 1) runtime.gSendCmd[i + 1] = 0xee;
      break;
    case LINKCMD_INIT_BLOCK:
      runtime.gSendCmd[0] = LINKCMD_INIT_BLOCK;
      runtime.gSendCmd[1] = runtime.sBlockSend.size;
      runtime.gSendCmd[2] = runtime.sBlockSend.multiplayerId + 0x80;
      break;
    case LINKCMD_BLENDER_NO_PBLOCK_SPACE:
      runtime.gSendCmd[0] = LINKCMD_BLENDER_NO_PBLOCK_SPACE;
      break;
    case LINKCMD_SEND_ITEM:
      runtime.gSendCmd[0] = LINKCMD_SEND_ITEM;
      runtime.gSendCmd[1] = runtime.gSpecialVarItemId;
      break;
    case LINKCMD_SEND_BLOCK_REQ:
      runtime.gSendCmd[0] = LINKCMD_SEND_BLOCK_REQ;
      runtime.gSendCmd[1] = runtime.gBlockRequestType;
      break;
    case LINKCMD_READY_CLOSE_LINK:
      runtime.gSendCmd[0] = LINKCMD_READY_CLOSE_LINK;
      runtime.gSendCmd[1] = runtime.gReadyCloseLinkType;
      break;
    case LINKCMD_DUMMY_2:
      runtime.gSendCmd[0] = LINKCMD_DUMMY_2;
      break;
    case LINKCMD_SEND_HELD_KEYS:
      if (runtime.gHeldKeyCodeToSend === 0 || runtime.gLinkTransferringData) break;
      runtime.gSendCmd[0] = LINKCMD_SEND_HELD_KEYS;
      runtime.gSendCmd[1] = runtime.gHeldKeyCodeToSend;
      break;
  }
};

export const StartSendingKeysToLink = (runtime: DecompLinkRuntime): void => {
  if (runtime.gWirelessCommType)
    runtime.rfuKeysStarted += 1;

  runtime.gLinkCallback = 'LinkCB_SendHeldKeys';
};

export const IsSendingKeysToLink = (runtime: DecompLinkRuntime): boolean => {
  if (runtime.gWirelessCommType)
    return runtime.rfuKeysSending;

  if (runtime.gLinkCallback === 'LinkCB_SendHeldKeys')
    return true;

  return false;
};

export const LinkCB_SendHeldKeys = (runtime: DecompLinkRuntime): void => {
  if (runtime.gReceivedRemoteLinkPlayers === true)
    BuildSendCmd(runtime, LINKCMD_SEND_HELD_KEYS);
};

export const ClearLinkCallback = (runtime: DecompLinkRuntime): void => {
  runtime.gLinkCallback = null;
};

export const ClearLinkCallback_2 = (runtime: DecompLinkRuntime): void => {
  if (runtime.gWirelessCommType)
    runtime.rfuCallbackCleared += 1;
  else
    runtime.gLinkCallback = null;
};

export const CloseLink = (runtime: DecompLinkRuntime): void => {
  runtime.gReceivedRemoteLinkPlayers = false;
  if (runtime.gWirelessCommType)
    runtime.rfuShutdowns += 1;
  runtime.sLinkOpen = false;
  disableSerial(runtime);
  runtime.closedLinkCount += 1;
};

export const InitBlockSend = (runtime: DecompLinkRuntime, src: readonly number[], size: number): boolean => {
  if (runtime.sBlockSend.active) return false;

  runtime.sBlockSend.multiplayerId = GetMultiplayerId(runtime);
  runtime.sBlockSend.active = true;
  runtime.sBlockSend.size = size;
  runtime.sBlockSend.pos = 0;

  if (size > BLOCK_BUFFER_SIZE) {
    runtime.sBlockSend.src = src.slice();
  } else {
    if (src !== runtime.gBlockSendBuffer) {
      runtime.gBlockSendBuffer.fill(0);
      for (let i = 0; i < size; i += 1) runtime.gBlockSendBuffer[i] = src[i] ?? 0;
    }
    runtime.sBlockSend.src = runtime.gBlockSendBuffer;
  }

  BuildSendCmd(runtime, LINKCMD_INIT_BLOCK);
  runtime.gLinkCallback = 'LinkCB_BlockSendBegin';
  runtime.sBlockSendDelayCounter = 0;
  return true;
};

export const LinkCB_BlockSendBegin = (runtime: DecompLinkRuntime): void => {
  runtime.sBlockSendDelayCounter += 1;
  if (runtime.sBlockSendDelayCounter > 2) runtime.gLinkCallback = 'LinkCB_BlockSend';
};

export const LinkCB_BlockSend = (runtime: DecompLinkRuntime): void => {
  const src = runtime.sBlockSend.src;
  runtime.gSendCmd[0] = LINKCMD_CONT_BLOCK;
  for (let i = 0; i < CMD_LENGTH - 1; i += 1) {
    runtime.gSendCmd[i + 1] = u16(((src[runtime.sBlockSend.pos + i * 2 + 1] ?? 0) << 8) | (src[runtime.sBlockSend.pos + i * 2] ?? 0));
  }
  runtime.sBlockSend.pos += 14;
  if (runtime.sBlockSend.size <= runtime.sBlockSend.pos) {
    runtime.sBlockSend.active = false;
    runtime.gLinkCallback = 'LinkCB_BlockSendEnd';
  }
};

export const LinkCB_BlockSendEnd = (runtime: DecompLinkRuntime): void => {
  runtime.gLinkCallback = null;
};

export const LinkCB_BerryBlenderSendHeldKeys = (runtime: DecompLinkRuntime): void => {
  GetMultiplayerId(runtime);
  BuildSendCmd(runtime, LINKCMD_BLENDER_SEND_KEYS);
  runtime.gBerryBlenderKeySendAttempts += 1;
};

export const SetBerryBlenderLinkCallback = (runtime: DecompLinkRuntime): void => {
  runtime.gBerryBlenderKeySendAttempts = 0;
  runtime.gLinkCallback = 'LinkCB_BerryBlenderSendHeldKeys';
};

export const GetBerryBlenderKeySendAttempts = (runtime: DecompLinkRuntime): number =>
  runtime.gBerryBlenderKeySendAttempts;

export const SendBerryBlenderNoSpaceForPokeblocks = (runtime: DecompLinkRuntime): void => {
  BuildSendCmd(runtime, LINKCMD_BLENDER_NO_PBLOCK_SPACE);
};

export const SendBlock = (runtime: DecompLinkRuntime, src: readonly number[], size: number): boolean => {
  if (runtime.gWirelessCommType === 1) {
    runtime.rfuInitBlockSends.push({ src, size });
    return true;
  }

  return InitBlockSend(runtime, src, size);
};

export const SendBlockRequest = (runtime: DecompLinkRuntime, blockRequestType: number): boolean => {
  if (runtime.gWirelessCommType === 1) {
    runtime.rfuSendBlockRequests.push(blockRequestType);
    return true;
  }

  if (runtime.gLinkCallback === null) {
    runtime.gBlockRequestType = blockRequestType;
    BuildSendCmd(runtime, LINKCMD_SEND_BLOCK_REQ);
    return true;
  }
  return false;
};

export const IsLinkTaskFinished = (runtime: DecompLinkRuntime): boolean =>
  runtime.gWirelessCommType === 1
    ? runtime.rfuTaskFinished
    : runtime.gLinkCallback === null;

export const GetBlockReceivedStatus = (runtime: DecompLinkRuntime): number => {
  if (runtime.gWirelessCommType === 1) {
    let status = 0;
    for (let i = 0; i < MAX_RFU_PLAYERS; i += 1)
      status |= Number(runtime.rfuBlockReceivedStatus[i]) << i;
    return status;
  }

  return (Number(runtime.gBlockReceivedStatus[3]) << 3)
    | (Number(runtime.gBlockReceivedStatus[2]) << 2)
    | (Number(runtime.gBlockReceivedStatus[1]) << 1)
    | Number(runtime.gBlockReceivedStatus[0]);
};

export const SetBlockReceivedFlag = (runtime: DecompLinkRuntime, who: number): void => {
  if (runtime.gWirelessCommType === 1)
    runtime.rfuBlockReceivedStatus[who] = true;
  else
    runtime.gBlockReceivedStatus[who] = true;
};

export const ResetBlockReceivedFlags = (runtime: DecompLinkRuntime): void => {
  if (runtime.gWirelessCommType === 1) {
    for (let i = 0; i < MAX_RFU_PLAYERS; i += 1)
      runtime.rfuBlockReceivedStatus[i] = false;
  } else {
    for (let i = 0; i < MAX_LINK_PLAYERS; i += 1)
      runtime.gBlockReceivedStatus[i] = false;
  }
};

export const ResetBlockReceivedFlag = (runtime: DecompLinkRuntime, who: number): void => {
  if (runtime.gWirelessCommType === 1)
    runtime.rfuBlockReceivedStatus[who] = false;
  else if (runtime.gBlockReceivedStatus[who])
    runtime.gBlockReceivedStatus[who] = false;
};

export const CheckShouldAdvanceLinkState = (runtime: DecompLinkRuntime): void => {
  if ((runtime.gLinkStatus & LINK_STAT_MASTER) !== 0 && EXTRACT_PLAYER_COUNT(runtime.gLinkStatus) > 1) {
    runtime.gShouldAdvanceLinkState = 1;
  }
};

export const LinkTestCalcBlockChecksum = (src: readonly number[], size: number): number => {
  let checksum = 0;
  for (let i = 0; i < Math.trunc(size / 2); i += 1) checksum = u16(checksum + (src[i] ?? 0));
  return checksum;
};

export const LinkTest_PrintNumChar = (runtime: DecompLinkRuntime, val: number, x: number, y: number): void => {
  runtime.linkTestTilemap[y * 32 + x] = (runtime.linkTestBGInfo.paletteNum << 12) | ((val & 0xff) + 1 + runtime.linkTestBGInfo.baseChar);
};

export const LinkTest_PrintChar = (runtime: DecompLinkRuntime, val: number, x: number, y: number): void => {
  runtime.linkTestTilemap[y * 32 + x] = (runtime.linkTestBGInfo.paletteNum << 12) | ((val & 0xff) + runtime.linkTestBGInfo.baseChar);
};

export const LinkTest_PrintHex = (
  runtime: DecompLinkRuntime,
  num: number,
  x: number,
  y: number,
  length: number
): void => {
  const buff = Array.from({ length: 16 }, () => 0);
  let mutableNum = num >>> 0;

  runtime.linkTestPrintHexCalls.push({ num, x, y, length });
  for (let i = 0; i < length; i += 1) {
    buff[i] = mutableNum & 0xf;
    mutableNum >>>= 4;
  }
  for (let i = length - 1; i >= 0; i -= 1) {
    LinkTest_PrintNumChar(runtime, buff[i], x, y);
    x += 1;
  }
};

export const LinkTest_PrintString = (runtime: DecompLinkRuntime, str: string, x: number, y: number): void => {
  let yOffset = 0;
  let xOffset = 0;

  for (let ptr = 0; ptr < str.length && str.charCodeAt(ptr) !== 0; ptr += 1) {
    if (str[ptr] === '\n') {
      yOffset += 1;
      xOffset = 0;
    } else {
      LinkTest_PrintChar(runtime, str.charCodeAt(ptr), x + xOffset, y + yOffset);
      xOffset += 1;
    }
  }
};

export const TestBlockTransfer = (
  runtime: DecompLinkRuntime,
  _unused0: number,
  _unused1: number,
  _unused2: number
): void => {
  let i: number;
  let status: number;

  if (runtime.sLinkTestLastBlockSendPos !== runtime.sBlockSend.pos) {
    LinkTest_PrintHex(runtime, runtime.sBlockSend.pos, 2, 3, 2);
    runtime.sLinkTestLastBlockSendPos = runtime.sBlockSend.pos;
  }
  for (i = 0; i < MAX_LINK_PLAYERS; i += 1) {
    if (runtime.sLinkTestLastBlockRecvPos[i] !== runtime.sBlockRecv[i].pos) {
      LinkTest_PrintHex(runtime, runtime.sBlockRecv[i].pos, 2, i + 4, 2);
      runtime.sLinkTestLastBlockRecvPos[i] = runtime.sBlockRecv[i].pos;
    }
  }
  status = GetBlockReceivedStatus(runtime);
  if (status === 0xf) {
    for (i = 0; i < MAX_LINK_PLAYERS; i += 1) {
      if ((status >> i) & 1) {
        runtime.gLinkTestBlockChecksums[i] = LinkTestCalcBlockChecksum(runtime.gBlockRecvBuffer[i], runtime.sBlockRecv[i].size);
        ResetBlockReceivedFlag(runtime, i);
        if (runtime.gLinkTestBlockChecksums[i] !== 0x0342) {
          runtime.sLinkTestDebugValuesEnabled = false;
          runtime.sDummyFlag = false;
        }
      }
    }
  }
};

export const BitmaskAllOtherLinkPlayers = (runtime: DecompLinkRuntime): number => {
  const mpId = GetMultiplayerId(runtime);
  return ((1 << MAX_LINK_PLAYERS) - 1) ^ (1 << mpId);
};

export const GetLinkPlayerTrainerId = (runtime: DecompLinkRuntime, who: number): number =>
  runtime.gLinkPlayers[who]?.trainerId ?? 0;

export const ResetLinkPlayers = (runtime: DecompLinkRuntime): void => {
  for (let i = 0; i <= MAX_LINK_PLAYERS; i += 1) {
    runtime.gLinkPlayers[i] = { trainerId: 0, name: '' };
  }
};

export const GetSavedLinkPlayerCountAsBitFlags = (runtime: DecompLinkRuntime): number => {
  let flags = 0;
  for (let i = 0; i < runtime.gSavedLinkPlayerCount; i += 1) flags |= 1 << i;
  return flags;
};

export const GetLinkPlayerCount = (runtime: DecompLinkRuntime): number =>
  runtime.gWirelessCommType
    ? runtime.rfuLinkPlayerCount
    : EXTRACT_PLAYER_COUNT(runtime.gLinkStatus);

export const GetLinkPlayerCountAsBitFlags = (runtime: DecompLinkRuntime): number => {
  let flags = 0;
  for (let i = 0; i < GetLinkPlayerCount(runtime); i += 1) flags |= 1 << i;
  return flags;
};

export const SaveLinkPlayers = (runtime: DecompLinkRuntime, numPlayers: number): void => {
  runtime.gSavedLinkPlayerCount = numPlayers;
  runtime.gSavedMultiplayerId = GetMultiplayerId(runtime);
  for (let i = 0; i < MAX_RFU_PLAYERS; i += 1) runtime.gSavedLinkPlayers[i] = { ...runtime.gLinkPlayers[i] };
};

export const GetSavedPlayerCount = (runtime: DecompLinkRuntime): number =>
  runtime.gSavedLinkPlayerCount;

export const GetSavedMultiplayerId = (runtime: DecompLinkRuntime): number =>
  runtime.gSavedMultiplayerId;

export const DoesLinkPlayerCountMatchSaved = (runtime: DecompLinkRuntime): boolean => {
  let count = 0;
  for (let i = 0; i < runtime.gSavedLinkPlayerCount; i += 1) {
    if (runtime.gLinkPlayers[i]?.trainerId === runtime.gSavedLinkPlayers[i]?.trainerId) count += 1;
  }
  return count === runtime.gSavedLinkPlayerCount;
};

export const CheckLinkPlayersMatchSaved = (runtime: DecompLinkRuntime): boolean => {
  let matched = true;
  for (let i = 0; i < runtime.gSavedLinkPlayerCount; i += 1) {
    if (
      runtime.gSavedLinkPlayers[i]?.trainerId !== runtime.gLinkPlayers[i]?.trainerId
      || runtime.gSavedLinkPlayers[i]?.name !== runtime.gLinkPlayers[i]?.name
    ) {
      runtime.gLinkErrorOccurred = true;
      CloseLink(runtime);
      runtime.mainCallback2 = 'CB2_LinkError';
      matched = false;
    }
  }
  return matched;
};

export const OpenLinkTimed = (runtime: DecompLinkRuntime): void => {
  runtime.sPlayerDataExchangeStatus = EXCHANGE_NOT_STARTED;
  runtime.sTimeOutCounter = 0;
  OpenLink(runtime);
};

export const GetLinkPlayerDataExchangeStatusTimed = (
  runtime: DecompLinkRuntime,
  minPlayers: number,
  maxPlayers: number
): number => {
  let count = 0;

  if (runtime.gReceivedRemoteLinkPlayers === true) {
    const numPlayers = GetLinkPlayerCount_2(runtime);
    if (minPlayers > numPlayers || numPlayers > maxPlayers) {
      runtime.sPlayerDataExchangeStatus = EXCHANGE_WRONG_NUM_PLAYERS;
      return runtime.sPlayerDataExchangeStatus;
    }

    if (GetLinkPlayerCount(runtime) === 0) {
      runtime.gLinkErrorOccurred = true;
      CloseLink(runtime);
    }
    for (let i = 0, index = 0; i < GetLinkPlayerCount(runtime); index += 1, i += 1) {
      if (runtime.gLinkPlayers[index].linkType === runtime.gLinkPlayers[0].linkType)
        count += 1;
    }
    if (count === GetLinkPlayerCount(runtime)) {
      if (runtime.gLinkPlayers[0].linkType === LINKTYPE_TRADE_SETUP) {
        switch (runtime.tradeProgressForLinkTrade) {
          case TRADE_BOTH_PLAYERS_READY:
            runtime.sPlayerDataExchangeStatus = EXCHANGE_COMPLETE;
            break;
          case TRADE_PLAYER_NOT_READY:
            runtime.sPlayerDataExchangeStatus = EXCHANGE_PLAYER_NOT_READY;
            break;
          case TRADE_PARTNER_NOT_READY:
            runtime.sPlayerDataExchangeStatus = EXCHANGE_PARTNER_NOT_READY;
            break;
        }
      } else {
        runtime.sPlayerDataExchangeStatus = EXCHANGE_COMPLETE;
      }
    } else {
      runtime.sPlayerDataExchangeStatus = EXCHANGE_DIFF_SELECTIONS;
    }
  } else {
    runtime.sTimeOutCounter += 1;
    if (runtime.sTimeOutCounter > 600)
      runtime.sPlayerDataExchangeStatus = EXCHANGE_TIMED_OUT;
  }

  return runtime.sPlayerDataExchangeStatus;
};

export const IsLinkPlayerDataExchangeComplete = (runtime: DecompLinkRuntime): boolean => {
  let count = 0;
  let retval: boolean;

  for (let i = 0; i < GetLinkPlayerCount(runtime); i += 1) {
    if (runtime.gLinkPlayers[i].linkType === runtime.gLinkPlayers[0].linkType)
      count += 1;
  }
  if (count === GetLinkPlayerCount(runtime)) {
    retval = true;
    runtime.sPlayerDataExchangeStatus = EXCHANGE_COMPLETE;
  } else {
    retval = false;
    runtime.sPlayerDataExchangeStatus = EXCHANGE_DIFF_SELECTIONS;
  }
  return retval;
};

export const ResetLinkPlayerCount = (runtime: DecompLinkRuntime): void => {
  runtime.gSavedLinkPlayerCount = 0;
  runtime.gSavedMultiplayerId = 0;
};

export const GetLinkPlayerCount_2 = (runtime: DecompLinkRuntime): number =>
  EXTRACT_PLAYER_COUNT(runtime.gLinkStatus);

export const IsLinkMaster = (runtime: DecompLinkRuntime): boolean =>
  runtime.gWirelessCommType
    ? runtime.rfuIsMaster
    : EXTRACT_MASTER(runtime.gLinkStatus) !== 0;

export const GetDummy2 = (runtime: DecompLinkRuntime): number =>
  runtime.sDummy2;

export const SetLinkDebugValues = (runtime: DecompLinkRuntime, seed: number, flags: number): void => {
  runtime.gLinkDebugSeed = seed >>> 0;
  runtime.gLinkDebugFlags = flags >>> 0;
};

const RGB = (r: number, g: number, b: number): number =>
  (r & 0x1f) | ((g & 0x1f) << 5) | ((b & 0x1f) << 10);

const BeginNormalPaletteFade = (
  runtime: DecompLinkRuntime,
  selectedPalettes: number,
  delay: number,
  startY: number,
  targetY: number,
  color: number
): void => {
  runtime.paletteFades.push({ selectedPalettes: selectedPalettes >>> 0, delay, startY, targetY, color });
};

const TrySavingData = (runtime: DecompLinkRuntime, saveType: number): void => {
  runtime.saveAttempts.push(saveType);
};

const RunTasks = (runtime: DecompLinkRuntime): void => {
  runtime.runTasksCount += 1;
};

const AnimateSprites = (runtime: DecompLinkRuntime): void => {
  runtime.animateSpritesCount += 1;
};

const BuildOamBuffer = (runtime: DecompLinkRuntime): void => {
  runtime.buildOamBufferCount += 1;
};

const UpdatePaletteFade = (runtime: DecompLinkRuntime): void => {
  runtime.updatePaletteFadeCount += 1;
};

export const LinkTestProcessKeyInput = (runtime: DecompLinkRuntime): void => {
  if (runtime.mainNewKeys & A_BUTTON)
    runtime.gShouldAdvanceLinkState = 1;
  if (runtime.mainHeldKeysInput & B_BUTTON)
    InitBlockSend(runtime, runtime.gHeap.slice(0x4000), 0x2004);
  if (runtime.mainNewKeys & L_BUTTON)
    BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 16, 0, RGB(2, 0, 0));
  if (runtime.mainNewKeys & START_BUTTON)
    SetSuppressLinkErrorMessage(runtime, true);
  if (runtime.mainNewKeys & R_BUTTON)
    TrySavingData(runtime, SAVE_LINK);
  if (runtime.mainNewKeys & SELECT_BUTTON)
    SetCloseLinkCallback(runtime);
  if (runtime.sLinkTestDebugValuesEnabled)
    SetLinkDebugValues(runtime, runtime.vblankCounter2, runtime.gLinkCallback ? Number(runtime.gLinkVSyncDisabled) : Number(runtime.gLinkVSyncDisabled) | 0x10);
};

export const CB2_LinkTest = (runtime: DecompLinkRuntime): void => {
  LinkTestProcessKeyInput(runtime);
  TestBlockTransfer(runtime, 1, 1, 0);
  RunTasks(runtime);
  AnimateSprites(runtime);
  BuildOamBuffer(runtime);
  UpdatePaletteFade(runtime);
};

export const Task_PrintTestData = (runtime: DecompLinkRuntime, _taskId: number): void => {
  const testTitle = LINK_TEST_PRINT;
  LinkTest_PrintString(runtime, testTitle, 5, 2);
  LinkTest_PrintHex(runtime, runtime.gShouldAdvanceLinkState, 2, 1, 2);
  LinkTest_PrintHex(runtime, runtime.gLinkStatus, 15, 1, 8);
  LinkTest_PrintHex(runtime, runtime.gLink.state, 2, 10, 2);
  LinkTest_PrintHex(runtime, EXTRACT_PLAYER_COUNT(runtime.gLinkStatus), 15, 10, 2);
  LinkTest_PrintHex(runtime, GetMultiplayerId(runtime), 15, 12, 2);
  LinkTest_PrintHex(runtime, runtime.gLastSendQueueCount, 25, 1, 2);
  LinkTest_PrintHex(runtime, runtime.gLastRecvQueueCount, 25, 2, 2);
  LinkTest_PrintHex(runtime, GetBlockReceivedStatus(runtime), 15, 5, 2);
  LinkTest_PrintHex(runtime, runtime.gLinkDebugSeed, 2, 12, 8);
  LinkTest_PrintHex(runtime, runtime.gLinkDebugFlags, 2, 13, 8);
  LinkTest_PrintHex(runtime, Number(GetSioMultiSI(runtime)), 25, 5, 1);
  LinkTest_PrintHex(runtime, Number(IsSioMultiMaster(runtime)), 25, 6, 1);
  LinkTest_PrintHex(runtime, Number(IsLinkConnectionEstablished(runtime)), 25, 7, 1);
  LinkTest_PrintHex(runtime, Number(HasLinkErrorOccurred(runtime)), 25, 8, 1);

  for (let i = 0; i < MAX_LINK_PLAYERS; i += 1)
    LinkTest_PrintHex(runtime, runtime.gLinkTestBlockChecksums[i], 10, 4 + i, 4);
};

export const SetCloseLinkCallbackAndType = (runtime: DecompLinkRuntime, type: number): void => {
  if (runtime.gWirelessCommType === 1) {
    runtime.rfuCloseLinkCallbacks += 1;
  } else if (runtime.gLinkCallback === null) {
    runtime.gLinkCallback = 'LinkCB_ReadyCloseLink';
    runtime.gLinkDummy1 = false;
    runtime.gReadyCloseLinkType = type;
  }
};

export const SetCloseLinkCallback = (runtime: DecompLinkRuntime): void => {
  if (runtime.gWirelessCommType === 1) {
    runtime.rfuCloseLinkCallbacks += 1;
  } else if (runtime.gLinkCallback !== null) {
    runtime.sReadyCloseLinkAttempts += 1;
  } else {
    runtime.gLinkCallback = 'LinkCB_ReadyCloseLink';
    runtime.gLinkDummy1 = false;
    runtime.gReadyCloseLinkType = 0;
  }
};

export const LinkCB_ReadyCloseLink = (runtime: DecompLinkRuntime): void => {
  if (runtime.gLastRecvQueueCount === 0) {
    BuildSendCmd(runtime, LINKCMD_READY_CLOSE_LINK);
    runtime.gLinkCallback = 'LinkCB_WaitCloseLink';
  }
};

export const LinkCB_WaitCloseLink = (runtime: DecompLinkRuntime): void => {
  let count = 0;
  const linkPlayerCount = GetLinkPlayerCount(runtime);
  for (let i = 0; i < linkPlayerCount; i += 1) {
    if (runtime.gReadyToCloseLink[i])
      count += 1;
  }

  if (count === linkPlayerCount) {
    runtime.gBattleTypeFlags &= ~(BATTLE_TYPE_LINK_IN_BATTLE | 0xffff0000);
    runtime.gLinkVSyncDisabled = true;
    CloseLink(runtime);
    runtime.gLinkCallback = null;
    runtime.gLinkDummy1 = true;
  }
};

export const SetLinkStandbyCallback = (runtime: DecompLinkRuntime): void => {
  if (runtime.gWirelessCommType === 1) {
    runtime.rfuStandbyCallbacks += 1;
  } else {
    if (runtime.gLinkCallback === null)
      runtime.gLinkCallback = 'LinkCB_Standby';

    runtime.gLinkDummy1 = false;
  }
};

export const LinkCB_Standby = (runtime: DecompLinkRuntime): void => {
  if (runtime.gLastRecvQueueCount === 0) {
    BuildSendCmd(runtime, LINKCMD_READY_EXIT_STANDBY);
    runtime.gLinkCallback = 'LinkCB_StandbyForAll';
  }
};

export const LinkCB_StandbyForAll = (runtime: DecompLinkRuntime): void => {
  let i: number;
  const linkPlayerCount = GetLinkPlayerCount(runtime);
  for (i = 0; i < linkPlayerCount; i += 1) {
    if (!runtime.gReadyToExitStandby[i])
      break;
  }

  if (i === linkPlayerCount) {
    for (i = 0; i < MAX_LINK_PLAYERS; i += 1)
      runtime.gReadyToExitStandby[i] = false;

    runtime.gLinkCallback = null;
  }
};

export const CheckErrorStatus = (runtime: DecompLinkRuntime): void => {
  if (runtime.sLinkOpen && EXTRACT_LINK_ERRORS(runtime.gLinkStatus)) {
    if (!runtime.gSuppressLinkErrorMessage) {
      runtime.sLinkErrorBuffer.status = runtime.gLinkStatus;
      runtime.sLinkErrorBuffer.lastRecvQueueCount = runtime.gLastRecvQueueCount;
      runtime.sLinkErrorBuffer.lastSendQueueCount = runtime.gLastSendQueueCount;
      runtime.mainCallback2 = 'CB2_LinkError';
    }
    runtime.gLinkErrorOccurred = true;
    CloseLink(runtime);
  }
};

export const InitLink = (runtime: DecompLinkRuntime): void => {
  for (let i = 0; i < CMD_LENGTH; i += 1)
    runtime.gSendCmd[i] = LINKCMD_NONE;

  runtime.sLinkOpen = true;
  enableSerial(runtime);
};

export const Task_TriggerHandshake = (runtime: DecompLinkRuntime, taskData: number[]): boolean => {
  taskData[0] = (taskData[0] ?? 0) + 1;
  if (taskData[0] === 5) {
    runtime.gShouldAdvanceLinkState = 1;
    return true;
  }
  return false;
};

export const OpenLink = (runtime: DecompLinkRuntime): void => {
  if (!runtime.gWirelessCommType) {
    ResetSerial(runtime);
    InitLink(runtime);
    runtime.gLinkCallback = 'LinkCB_RequestPlayerDataExchange';
    runtime.gLinkVSyncDisabled = false;
    runtime.gLinkErrorOccurred = false;
    runtime.gSuppressLinkErrorMessage = false;
    ResetBlockReceivedFlags(runtime);
    ResetBlockSend(runtime);
    runtime.sDummy1 = false;
    runtime.gLinkDummy2 = false;
    runtime.gLinkDummy1 = false;
    runtime.gReadyCloseLinkType = 0;
    runtime.triggerHandshakeTasksCreated += 1;
    CreateTask(runtime, 'Task_TriggerHandshake', 2);
  } else {
    runtime.rfuApiInitialized += 1;
  }
  runtime.gReceivedRemoteLinkPlayers = false;
  for (let i = 0; i < MAX_LINK_PLAYERS; i += 1) {
    runtime.gRemoteLinkPlayersNotReceived[i] = true;
    runtime.gReadyToCloseLink[i] = false;
    runtime.gReadyToExitStandby[i] = false;
  }
};

export const SetLinkErrorFromRfu = (
  runtime: DecompLinkRuntime,
  status: number,
  lastSendQueueCount: number,
  lastRecvQueueCount: number,
  isConnectionError: number
): void => {
  runtime.sLinkErrorBuffer.status = status;
  runtime.sLinkErrorBuffer.lastSendQueueCount = lastSendQueueCount;
  runtime.sLinkErrorBuffer.lastRecvQueueCount = lastRecvQueueCount;
  runtime.sLinkErrorBuffer.disconnected = isConnectionError;
};

export const ErrorMsg_MoveCloserToPartner = (runtime: DecompLinkRuntime): void => {
  runtime.linkErrorScreens.push('MoveCloserToPartner');
  runtime.decompressedBgGfxCalls.push({ bg: 1, gfx: 'sWirelessLinkDisplayGfx', useHeap: false, size: 0, offset: 0 });
  runtime.copyToBgTilemapBufferCalls.push({ bg: 1, tilemap: 'sWirelessLinkDisplayTilemap', mode: 0, destOffset: 0 });
  runtime.copyBgTilemapBufferToVramCalls.push(1);
  runtime.loadedPalettes.push({ palette: 'sWirelessLinkDisplayPal', offset: 0, size: 32 });
  runtime.fillWindowPixelBufferCalls.push({ windowId: 0, fillValue: 0 }, { windowId: 2, fillValue: 0 });
  runtime.textPrinterCalls.push(
    { windowId: 0, font: 'FONT_NORMAL_COPY_2', x: 2, y: 5, color: [0, 1, 2], speed: 0, text: 'gText_CommErrorEllipsis' },
    { windowId: 2, font: 'FONT_NORMAL_COPY_2', x: 2, y: 2, color: [0, 1, 2], speed: 0, text: 'gText_MoveCloserToLinkPartner' }
  );
  runtime.putWindowTilemapCalls.push(0, 2);
  runtime.copyWindowToVramCalls.push({ windowId: 0, mode: 'COPYWIN_NONE' }, { windowId: 2, mode: 'COPYWIN_FULL' });
  runtime.showBgCalls.push(0, 1);
};

export const ErrorMsg_CheckConnections = (runtime: DecompLinkRuntime): void => {
  runtime.linkErrorScreens.push('CheckConnections');
  runtime.fillWindowPixelBufferCalls.push({ windowId: 1, fillValue: 0 }, { windowId: 2, fillValue: 0 });
  runtime.textPrinterCalls.push({
    windowId: 1,
    font: 'FONT_NORMAL_COPY_2',
    x: 2,
    y: 0,
    color: [0, 1, 2],
    speed: 0,
    text: 'gText_CommErrorCheckConnections'
  });
  runtime.putWindowTilemapCalls.push(1, 2);
  runtime.copyWindowToVramCalls.push({ windowId: 1, mode: 'COPYWIN_NONE' }, { windowId: 2, mode: 'COPYWIN_FULL' });
  runtime.showBgCalls.push(0);
};

export const CB2_LinkError = (runtime: DecompLinkRuntime): void => {
  runtime.linkErrorSetupCount += 1;
  SetGpuReg(runtime, REG_OFFSET_DISPCNT, 0);
  runtime.musicPlayersStopped.push('gMPlayInfo_SE1', 'gMPlayInfo_SE2', 'gMPlayInfo_SE3');
  runtime.initHeapCalls.push({ heap: 'gHeap', size: HEAP_SIZE });
  ResetSpriteData(runtime);
  FreeAllSpritePalettes(runtime);
  runtime.resetPaletteFadeControlCount += 1;
  runtime.backdropColor = 0;
  ResetTasks(runtime);
  runtime.scanlineEffectStopCount += 1;
  if (runtime.gWirelessCommType) {
    if (!runtime.sLinkErrorBuffer.disconnected)
      runtime.gWirelessCommType = 3;

    runtime.resetLinkRfuGFLayerCount += 1;
  }
  SetVBlankCallback(runtime, 'VBlankCB_LinkError');
  runtime.resetBgsAndClearDma3BusyFlagsArgs.push(false);
  runtime.initBgsFromTemplatesCalls.push({ bgMode: 0, templateCount: 2 });
  runtime.linkErrorBgTilemapBufferSize = BG_SCREEN_SIZE;
  runtime.setBgTilemapBufferCalls.push({ bg: 1, size: BG_SCREEN_SIZE });

  if (runtime.initWindowsResult) {
    runtime.deactivateAllTextPrintersCount += 1;
    runtime.resetTempTileDataBuffersCount += 1;
    SetGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
    SetGpuReg(runtime, REG_OFFSET_BG0HOFS, 0);
    SetGpuReg(runtime, REG_OFFSET_BG0VOFS, 0);
    SetGpuReg(runtime, REG_OFFSET_BG1HOFS, 0);
    SetGpuReg(runtime, REG_OFFSET_BG1VOFS, 0);
    ClearGpuRegBits(runtime, REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON | DISPCNT_WIN1_ON | DISPCNT_OBJWIN_ON);
    runtime.loadedPalettes.push({ palette: 'gStandardMenuPalette', offset: 15 * 16, size: 32 });
    runtime.softResetDisabled = false;
    CreateTask(runtime, 'Task_DestroySelf', 0);
    runtime.stopMapMusicCount += 1;
    runtime.mainCallback1 = null;
    RunTasks(runtime);
    AnimateSprites(runtime);
    BuildOamBuffer(runtime);
    UpdatePaletteFade(runtime);
    runtime.mainCallback2 = 'CB2_PrintErrorMessage';
  }
};

export const CB2_PrintErrorMessage = (runtime: DecompLinkRuntime): void => {
  switch (runtime.mainState) {
    case 0:
      if (runtime.sLinkErrorBuffer.disconnected)
        ErrorMsg_MoveCloserToPartner(runtime);
      else
        ErrorMsg_CheckConnections(runtime);
      break;
    case 30:
      runtime.playedSoundEffects.push(SE_BOO);
      break;
    case 60:
      runtime.playedSoundEffects.push(SE_BOO);
      break;
    case 90:
      runtime.playedSoundEffects.push(SE_BOO);
      break;
    case 130:
      if (runtime.gWirelessCommType === 2) {
        runtime.linkErrorScreens.push('ABtnTitleScreen');
        runtime.textPrinterCalls.push({
          windowId: 0,
          font: 'FONT_NORMAL_COPY_2',
          x: 2,
          y: 20,
          color: [0, 1, 2],
          speed: 0,
          text: 'gText_ABtnTitleScreen'
        });
      } else if (runtime.gWirelessCommType === 1) {
        runtime.linkErrorScreens.push('ABtnRegistrationCounter');
        runtime.textPrinterCalls.push({
          windowId: 0,
          font: 'FONT_NORMAL_COPY_2',
          x: 2,
          y: 20,
          color: [0, 1, 2],
          speed: 0,
          text: 'gText_ABtnRegistrationCounter'
        });
      }
      break;
  }

  if (runtime.mainState === 160) {
    if (runtime.gWirelessCommType === 1) {
      if (runtime.mainNewKeys & A_BUTTON) {
        runtime.helpSystemEnabled = true;
        runtime.playedSoundEffects.push(SE_PIN);
        runtime.gWirelessCommType = 0;
        runtime.sLinkErrorBuffer.disconnected = 0;
        runtime.reloadSaveCount += 1;
      }
    } else if (runtime.gWirelessCommType === 2) {
      if (runtime.mainNewKeys & A_BUTTON) {
        runtime.helpSystemEnabled = true;
        runtime.rfuStopModeCount += 1;
        runtime.rfuWaitReqCompleteCount += 1;
        runtime.softResetCount += 1;
      }
    }
  }

  if (runtime.mainState !== 160)
    runtime.mainState += 1;
};

export const IsLinkConnectionEstablished = (runtime: DecompLinkRuntime): boolean =>
  EXTRACT_CONN_ESTABLISHED(runtime.gLinkStatus) !== 0;

export const SetSuppressLinkErrorMessage = (runtime: DecompLinkRuntime, flag: boolean): void => {
  runtime.gSuppressLinkErrorMessage = flag;
};

export const HasLinkErrorOccurred = (runtime: DecompLinkRuntime): boolean =>
  runtime.gLinkErrorOccurred;

export const SetLocalLinkPlayerId = (runtime: DecompLinkRuntime, playerId: number): void => {
  runtime.gLocalLinkPlayer.id = playerId & 0xff;
};

const extCtrlCodeLengths = [
  1, 2, 2, 2, 4, 2, 2, 1, 2, 1, 1, 3, 2, 2, 2, 1, 3, 2, 2, 2, 2, 1, 1, 1, 1
];

const getExtCtrlCodeLength = (code: number): number =>
  code < extCtrlCodeLengths.length ? extCtrlCodeLengths[code]! : 0;

const stripExtCtrlCodes = (str: string): string => {
  let out = '';
  for (let i = 0; i < str.length; i += 1) {
    if (str.charCodeAt(i) === EOS)
      break;
    if (str.charCodeAt(i) === EXT_CTRL_CODE_BEGIN) {
      i += getExtCtrlCodeLength(str.charCodeAt(i + 1) & 0xff);
      continue;
    }
    out += str[i];
  }
  return out;
};

const ConvertInternationalString = (runtime: DecompLinkRuntime, str: string, language: number): string => {
  let converted = str;
  if (language === LANGUAGE_JAPANESE) {
    const stripped = stripExtCtrlCodes(str);
    converted = `${String.fromCharCode(EXT_CTRL_CODE_BEGIN)}${String.fromCharCode(EXT_CTRL_CODE_JPN)}${stripped}${String.fromCharCode(EXT_CTRL_CODE_BEGIN)}${String.fromCharCode(EXT_CTRL_CODE_ENG)}${String.fromCharCode(EOS)}`;
  }
  runtime.convertedInternationalStrings.push({ before: str, after: converted, language });
  return converted;
};

export const ConvertLinkPlayerName = (runtime: DecompLinkRuntime, player: LinkPlayer): void => {
  player.progressFlagsCopy = player.progressFlags ?? 0;
  player.name = ConvertInternationalString(runtime, player.name, player.language ?? 0);
};

const writeLinkPlayerToBuffer = (buffer: number[], offset: number, player: LinkPlayer): void => {
  writeU16LE(buffer, offset + 0x00, player.version ?? 0);
  writeU16LE(buffer, offset + 0x02, player.lp_field_2 ?? 0);
  writeU32LE(buffer, offset + 0x04, player.trainerId);
  writePaddedString(buffer, offset + 0x08, player.name, PLAYER_NAME_LENGTH + 1);
  buffer[offset + 0x10] = player.progressFlags ?? 0;
  buffer[offset + 0x11] = player.neverRead ?? 0;
  buffer[offset + 0x12] = player.progressFlagsCopy ?? 0;
  buffer[offset + 0x13] = player.gender ?? 0;
  writeU32LE(buffer, offset + 0x14, player.linkType ?? 0);
  writeU16LE(buffer, offset + 0x18, player.id ?? 0);
  writeU16LE(buffer, offset + 0x1a, player.language ?? 0);
};

const writeLinkPlayerBlockToSendBuffer = (runtime: DecompLinkRuntime): void => {
  runtime.gBlockSendBuffer.fill(0);
  writePaddedString(runtime.gBlockSendBuffer, 0x00, runtime.gLocalLinkPlayerBlock.magic1, 16);
  writeLinkPlayerToBuffer(runtime.gBlockSendBuffer, 0x10, runtime.gLocalLinkPlayerBlock.linkPlayer);
  writePaddedString(runtime.gBlockSendBuffer, 0x2c, runtime.gLocalLinkPlayerBlock.magic2, 16);
};

const readLinkPlayerBlockFromRecvBuffer = (runtime: DecompLinkRuntime, who: number): LinkPlayerBlock => {
  const linkPlayer: LinkPlayer = {
    version: readRecvBufferU16LE(runtime, who, 0x10),
    lp_field_2: readRecvBufferU16LE(runtime, who, 0x12),
    trainerId: readRecvBufferU32LE(runtime, who, 0x14),
    name: readRecvBufferString(runtime, who, 0x18, PLAYER_NAME_LENGTH + 1),
    progressFlags: readRecvBufferByte(runtime, who, 0x20),
    neverRead: readRecvBufferByte(runtime, who, 0x21),
    progressFlagsCopy: readRecvBufferByte(runtime, who, 0x22),
    gender: readRecvBufferByte(runtime, who, 0x23),
    linkType: readRecvBufferU32LE(runtime, who, 0x24),
    id: readRecvBufferU16LE(runtime, who, 0x28),
    language: readRecvBufferU16LE(runtime, who, 0x2a)
  };

  return {
    magic1: readRecvBufferString(runtime, who, 0x00, 16),
    linkPlayer,
    magic2: readRecvBufferString(runtime, who, 0x2c, 16)
  };
};

export const LocalLinkPlayerToBlock = (runtime: DecompLinkRuntime): void => {
  initLocalLinkPlayer(runtime);
  runtime.gLocalLinkPlayerBlock.linkPlayer = cloneLinkPlayer(runtime.gLocalLinkPlayer);
  runtime.gLocalLinkPlayerBlock.magic1 = LINK_MAGIC_GAME_FREAK_INC;
  runtime.gLocalLinkPlayerBlock.magic2 = LINK_MAGIC_GAME_FREAK_INC;
  writeLinkPlayerBlockToSendBuffer(runtime);
};

export const LinkPlayerFromBlock = (runtime: DecompLinkRuntime, who: number): void => {
  const who_ = who & 0xff;
  const block = readLinkPlayerBlockFromRecvBuffer(runtime, who_);
  runtime.gBlockRecvBlocks[who_] = block;
  const player = cloneLinkPlayer(block.linkPlayer);
  runtime.gLinkPlayers[who_] = player;
  ConvertLinkPlayerName(runtime, player);

  if (block.magic1 !== LINK_MAGIC_GAME_FREAK_INC || block.magic2 !== LINK_MAGIC_GAME_FREAK_INC)
    runtime.mainCallback2 = 'CB2_LinkError';
};

const handleReceiveRemoteLinkPlayer = (runtime: DecompLinkRuntime, who: number): void => {
  let count = 0;
  runtime.gRemoteLinkPlayersNotReceived[who] = false;
  for (let i = 0; i < GetLinkPlayerCount_2(runtime); i += 1)
    count += runtime.gRemoteLinkPlayersNotReceived[i] ? 1 : 0;

  if (count === 0 && !runtime.gReceivedRemoteLinkPlayers)
    runtime.gReceivedRemoteLinkPlayers = true;
};

export const HandleReceiveRemoteLinkPlayer = handleReceiveRemoteLinkPlayer;

export const ProcessRecvCmds = (runtime: DecompLinkRuntime, _unused: number): void => {
  for (let i = 0; i < MAX_LINK_PLAYERS; i += 1) {
    runtime.gLinkPartnersHeldKeys[i] = 0;
    if (runtime.gRecvCmds[i][0] === 0)
      continue;

    switch (runtime.gRecvCmds[i][0]) {
      case LINKCMD_SEND_LINK_TYPE:
        LocalLinkPlayerToBlock(runtime);
        InitBlockSend(runtime, runtime.gBlockSendBuffer, LINK_PLAYER_BLOCK_SIZE);
        runtime.sBlockSend.src = runtime.gBlockSendBuffer;
        break;
      case LINKCMD_BLENDER_SEND_KEYS:
        runtime.gLinkPartnersHeldKeys[i] = runtime.gRecvCmds[i][1];
        break;
      case LINKCMD_DUMMY_1:
      case LINKCMD_DUMMY_2:
        runtime.gLinkDummy2 = true;
        break;
      case LINKCMD_INIT_BLOCK:
        runtime.sBlockRecv[i].pos = 0;
        runtime.sBlockRecv[i].size = runtime.gRecvCmds[i][1];
        runtime.sBlockRecv[i].multiplayerId = runtime.gRecvCmds[i][2];
        break;
      case LINKCMD_CONT_BLOCK:
        if (runtime.sBlockRecv[i].size > BLOCK_BUFFER_SIZE) {
          for (let j = 0; j < CMD_LENGTH - 1; j += 1)
            runtime.gDecompressionBuffer[Math.trunc(runtime.sBlockRecv[i].pos / 2) + j] = runtime.gRecvCmds[i][j + 1];
        } else {
          for (let j = 0; j < CMD_LENGTH - 1; j += 1)
            runtime.gBlockRecvBuffer[i][Math.trunc(runtime.sBlockRecv[i].pos / 2) + j] = runtime.gRecvCmds[i][j + 1];
        }
        runtime.sBlockRecv[i].pos += (CMD_LENGTH - 1) * 2;

        if (runtime.sBlockRecv[i].pos >= runtime.sBlockRecv[i].size) {
          if (runtime.gRemoteLinkPlayersNotReceived[i] === true) {
            const block = readLinkPlayerBlockFromRecvBuffer(runtime, i);
            runtime.gBlockRecvBlocks[i] = block;
            const linkPlayer = cloneLinkPlayer(block.linkPlayer);
            runtime.gLinkPlayers[i] = linkPlayer;
            if (((linkPlayer.version ?? 0) & 0xff) === 1 || ((linkPlayer.version ?? 0) & 0xff) === 2) {
              linkPlayer.progressFlagsCopy = 0;
              linkPlayer.neverRead = 0;
              linkPlayer.progressFlags = 0;
            }
            ConvertLinkPlayerName(runtime, linkPlayer);
            if (block.magic1 !== LINK_MAGIC_GAME_FREAK_INC || block.magic2 !== LINK_MAGIC_GAME_FREAK_INC)
              runtime.mainCallback2 = 'CB2_LinkError';
            else
              handleReceiveRemoteLinkPlayer(runtime, i);
          } else {
            SetBlockReceivedFlag(runtime, i);
          }
        }
        break;
      case LINKCMD_READY_CLOSE_LINK:
        runtime.gReadyToCloseLink[i] = true;
        break;
      case LINKCMD_READY_EXIT_STANDBY:
        runtime.gReadyToExitStandby[i] = true;
        break;
      case LINKCMD_BLENDER_NO_PBLOCK_SPACE:
        SetBerryBlenderLinkCallback(runtime);
        break;
      case LINKCMD_SEND_BLOCK_REQ:
        SendBlock(runtime, runtime.gBlockSendBuffer, blockRequestSizes[runtime.gRecvCmds[i][1]]!);
        break;
      case LINKCMD_SEND_HELD_KEYS:
        runtime.gLinkPartnersHeldKeys[i] = runtime.gRecvCmds[i][1];
        break;
    }
  }
};

export const LinkCB_RequestPlayerDataExchange = (runtime: DecompLinkRuntime): void => {
  if (runtime.gLinkStatus & LINK_STAT_MASTER)
    BuildSendCmd(runtime, LINKCMD_SEND_LINK_TYPE);

  runtime.gLinkCallback = null;
};

const runLinkCallback = (runtime: DecompLinkRuntime): void => {
  switch (runtime.gLinkCallback) {
    case 'LinkCB_BlockSendBegin':
      LinkCB_BlockSendBegin(runtime);
      break;
    case 'LinkCB_BlockSend':
      LinkCB_BlockSend(runtime);
      break;
    case 'LinkCB_BlockSendEnd':
      LinkCB_BlockSendEnd(runtime);
      break;
    case 'LinkCB_SendHeldKeys':
      LinkCB_SendHeldKeys(runtime);
      break;
    case 'LinkCB_BerryBlenderSendHeldKeys':
      LinkCB_BerryBlenderSendHeldKeys(runtime);
      break;
    case 'LinkCB_ReadyCloseLink':
      LinkCB_ReadyCloseLink(runtime);
      break;
    case 'LinkCB_WaitCloseLink':
      LinkCB_WaitCloseLink(runtime);
      break;
    case 'LinkCB_Standby':
      LinkCB_Standby(runtime);
      break;
    case 'LinkCB_StandbyForAll':
      LinkCB_StandbyForAll(runtime);
      break;
    case 'LinkCB_RequestPlayerDataExchange':
      LinkCB_RequestPlayerDataExchange(runtime);
      break;
  }
};

export const LinkMain2 = (runtime: DecompLinkRuntime, heldKeys: number): number => {
  if (!runtime.sLinkOpen)
    return 0;

  for (let i = 0; i < CMD_LENGTH; i += 1)
    runtime.gSendCmd[i] = 0;

  runtime.gLinkHeldKeys = heldKeys;
  if (runtime.gLinkStatus & LINK_STAT_CONN_ESTABLISHED) {
    ProcessRecvCmds(runtime, runtime.regSiocntId);
    if (runtime.gLinkCallback !== null)
      runLinkCallback(runtime);
    CheckErrorStatus(runtime);
  }
  return runtime.gLinkStatus;
};

const IsSendingKeysOverCable = (runtime: DecompLinkRuntime): boolean => {
  if (runtime.sendingKeysOverCableOverride !== null)
    return runtime.sendingKeysOverCableOverride;
  if (runtime.gWirelessCommType !== 0)
    return false;
  if (!IsSendingKeysToLink(runtime))
    return false;
  return true;
};

const RfuMain1 = (runtime: DecompLinkRuntime): boolean => {
  runtime.rfuMain1Count += 1;
  return runtime.rfuMain1Result;
};

const RfuMain2 = (runtime: DecompLinkRuntime): boolean => {
  runtime.rfuMain2Count += 1;
  return runtime.rfuMain2Result;
};

const IsRfuRecvQueueEmpty = (runtime: DecompLinkRuntime): boolean =>
  runtime.rfuRecvQueueEmpty;

export const HandleLinkConnection = (runtime: DecompLinkRuntime): boolean => {
  let main1Failed: boolean;
  let main2Failed: boolean;

  if (runtime.gWirelessCommType === 0) {
    const shouldAdvanceLinkState = { value: runtime.gShouldAdvanceLinkState };
    runtime.gLinkStatus = LinkMain1(runtime, shouldAdvanceLinkState, runtime.gSendCmd, runtime.gRecvCmds);
    runtime.gShouldAdvanceLinkState = shouldAdvanceLinkState.value;
    LinkMain2(runtime, runtime.gMainHeldKeys);
    if ((runtime.gLinkStatus & LINK_STAT_RECEIVED_NOTHING) && IsSendingKeysOverCable(runtime) === true)
      return true;
  } else {
    main1Failed = RfuMain1(runtime);
    main2Failed = RfuMain2(runtime);
    if (IsSendingKeysOverCable(runtime) === true) {
      if (main1Failed === true || IsRfuRecvQueueEmpty(runtime) || main2Failed)
        return true;
    }
  }
  return false;
};

export const SetWirelessCommType1 = (runtime: DecompLinkRuntime): void => {
  if (!runtime.gReceivedRemoteLinkPlayers)
    runtime.gWirelessCommType = 1;
};

export const SetWirelessCommType0 = (runtime: DecompLinkRuntime): void => {
  if (!runtime.gReceivedRemoteLinkPlayers)
    runtime.gWirelessCommType = 0;
};

export const SetWirelessCommType0_Internal = SetWirelessCommType0;

export const GetSioMultiSI = (runtime: DecompLinkRuntime): boolean =>
  (runtime.regSiocntTerminals & SIO_MULTI_SI) !== 0;

export const IsSioMultiMaster = (runtime: DecompLinkRuntime): boolean =>
  (runtime.regSiocntTerminals & SIO_MULTI_SD) !== 0 && (runtime.regSiocntTerminals & SIO_MULTI_SI) === 0;

export const GetLinkRecvQueueLength = (runtime: DecompLinkRuntime): number => {
  if (runtime.gWirelessCommType !== 0)
    return runtime.rfuRecvQueueLength;

  return runtime.gLink.recvQueue.count;
};

export const IsLinkRecvQueueAtOverworldMax = (runtime: DecompLinkRuntime): boolean => {
  if (GetLinkRecvQueueLength(runtime) >= OVERWORLD_RECV_QUEUE_MAX)
    return true;

  return false;
};

export const EnqueueSendCmd = (runtime: DecompLinkRuntime, sendCmd: number[]): void => {
  let offset: number;

  runtime.gLinkSavedIme = runtime.regIme;
  runtime.imeTransitions.push({ op: 'save', value: runtime.gLinkSavedIme });
  runtime.regIme = 0;
  runtime.imeTransitions.push({ op: 'disable', value: runtime.regIme });
  if (runtime.gLink.sendQueue.count < QUEUE_CAPACITY) {
    offset = runtime.gLink.sendQueue.pos + runtime.gLink.sendQueue.count;
    if (offset >= QUEUE_CAPACITY)
      offset -= QUEUE_CAPACITY;

    for (let i = 0; i < CMD_LENGTH; i += 1) {
      runtime.sSendNonzeroCheck |= sendCmd[i] ?? 0;
      runtime.gLink.sendQueue.data[i][offset] = sendCmd[i] ?? 0;
      sendCmd[i] = 0;
    }
  } else {
    runtime.gLink.queueFull = QUEUE_FULL_SEND;
  }

  if (runtime.sSendNonzeroCheck) {
    runtime.gLink.sendQueue.count += 1;
    runtime.sSendNonzeroCheck = 0;
  }
  runtime.regIme = runtime.gLinkSavedIme;
  runtime.imeTransitions.push({ op: 'restore', value: runtime.regIme });
  runtime.gLastSendQueueCount = runtime.gLink.sendQueue.count;
};

export const DequeueRecvCmds = (runtime: DecompLinkRuntime, recvCmds: number[][]): void => {
  runtime.gLinkSavedIme = runtime.regIme;
  runtime.imeTransitions.push({ op: 'save', value: runtime.gLinkSavedIme });
  runtime.regIme = 0;
  runtime.imeTransitions.push({ op: 'disable', value: runtime.regIme });
  if (runtime.gLink.recvQueue.count === 0) {
    for (let i = 0; i < runtime.gLink.playerCount; i += 1) {
      for (let j = 0; j < CMD_LENGTH; j += 1)
        recvCmds[i][j] = 0;
    }
    runtime.gLink.receivedNothing = true;
  } else {
    for (let i = 0; i < runtime.gLink.playerCount; i += 1) {
      for (let j = 0; j < CMD_LENGTH; j += 1)
        recvCmds[i][j] = runtime.gLink.recvQueue.data[i][j][runtime.gLink.recvQueue.pos];
    }
    runtime.gLink.recvQueue.count -= 1;
    runtime.gLink.recvQueue.pos += 1;
    if (runtime.gLink.recvQueue.pos >= QUEUE_CAPACITY)
      runtime.gLink.recvQueue.pos = 0;
    runtime.gLink.receivedNothing = false;
  }
  runtime.regIme = runtime.gLinkSavedIme;
  runtime.imeTransitions.push({ op: 'restore', value: runtime.regIme });
};

export const ResetSendBuffer = (runtime: DecompLinkRuntime): void => {
  runtime.gLink.sendQueue.count = 0;
  runtime.gLink.sendQueue.pos = 0;
  for (let i = 0; i < CMD_LENGTH; i += 1) {
    for (let j = 0; j < QUEUE_CAPACITY; j += 1)
      runtime.gLink.sendQueue.data[i][j] = LINKCMD_NONE;
  }
};

export const ResetRecvBuffer = (runtime: DecompLinkRuntime): void => {
  runtime.gLink.recvQueue.count = 0;
  runtime.gLink.recvQueue.pos = 0;
  for (let i = 0; i < MAX_LINK_PLAYERS; i += 1) {
    for (let j = 0; j < CMD_LENGTH; j += 1) {
      for (let k = 0; k < QUEUE_CAPACITY; k += 1)
        runtime.gLink.recvQueue.data[i][j][k] = LINKCMD_NONE;
    }
  }
};

const startTransfer = (runtime: DecompLinkRuntime): void => {
  runtime.serialStartedCount += 1;
  runtime.regSiocnt |= SIO_START;
};

const doHandshake = (runtime: DecompLinkRuntime): boolean => {
  let playerCount = 0;
  let minRecv = 0xffff;

  if (runtime.gLink.handshakeAsMaster === true)
    runtime.regSiomltSend = MASTER_HANDSHAKE;
  else
    runtime.regSiomltSend = SLAVE_HANDSHAKE;

  for (let i = 0; i < MAX_LINK_PLAYERS; i += 1)
    runtime.gLink.tempRecvBuffer[i] = u16(runtime.regSiomltRecv[i] ?? 0);
  runtime.regSiomltRecv.fill(0);
  runtime.gLink.handshakeAsMaster = false;

  for (let i = 0; i < MAX_LINK_PLAYERS; i += 1) {
    const recv = runtime.gLink.tempRecvBuffer[i];
    if ((recv & ~0x3) === SLAVE_HANDSHAKE || recv === MASTER_HANDSHAKE) {
      playerCount += 1;
      if (minRecv > recv && recv !== 0)
        minRecv = recv;
    } else {
      if (recv !== 0xffff)
        playerCount = 0;
      break;
    }
  }

  runtime.gLink.playerCount = playerCount;
  if (
    runtime.gLink.playerCount > 1
    && runtime.gLink.playerCount === runtime.sHandshakePlayerCount
    && runtime.gLink.tempRecvBuffer[0] === MASTER_HANDSHAKE
  ) {
    return true;
  }

  if (runtime.gLink.playerCount > 1)
    runtime.gLink.link_field_F = (minRecv & 3) + 1;
  else
    runtime.gLink.link_field_F = 0;
  runtime.sHandshakePlayerCount = runtime.gLink.playerCount;
  return false;
};

const doRecv = (runtime: DecompLinkRuntime): void => {
  const recv = Array.from({ length: MAX_LINK_PLAYERS }, (_, i) => u16(runtime.regSiomltRecv[i] ?? 0));

  if (runtime.gLink.sendCmdIndex === 0) {
    for (let i = 0; i < runtime.gLink.playerCount; i += 1) {
      if (runtime.gLink.checksum !== recv[i] && runtime.sChecksumAvailable)
        runtime.gLink.badChecksum = true;
    }
    runtime.gLink.checksum = 0;
    runtime.sChecksumAvailable = 1;
  } else {
    let index = runtime.gLink.recvQueue.pos + runtime.gLink.recvQueue.count;
    if (index >= QUEUE_CAPACITY)
      index -= QUEUE_CAPACITY;

    if (runtime.gLink.recvQueue.count < QUEUE_CAPACITY) {
      for (let i = 0; i < runtime.gLink.playerCount; i += 1) {
        runtime.gLink.checksum = u16(runtime.gLink.checksum + recv[i]);
        runtime.sRecvNonzeroCheck |= recv[i];
        runtime.gLink.recvQueue.data[i][runtime.gLink.recvCmdIndex][index] = recv[i];
      }
    } else {
      runtime.gLink.queueFull = QUEUE_FULL_RECV;
    }
    runtime.gLink.recvCmdIndex += 1;
    if (runtime.gLink.recvCmdIndex === CMD_LENGTH && runtime.sRecvNonzeroCheck) {
      runtime.gLink.recvQueue.count += 1;
      runtime.sRecvNonzeroCheck = 0;
    }
  }
};

const doSend = (runtime: DecompLinkRuntime): void => {
  if (runtime.gLink.sendCmdIndex === CMD_LENGTH) {
    runtime.regSiomltSend = runtime.gLink.checksum;
    if (!runtime.sSendBufferEmpty) {
      runtime.gLink.sendQueue.count -= 1;
      runtime.gLink.sendQueue.pos += 1;
      if (runtime.gLink.sendQueue.pos >= QUEUE_CAPACITY)
        runtime.gLink.sendQueue.pos = 0;
    } else {
      runtime.sSendBufferEmpty = false;
    }
  } else {
    if (!runtime.sSendBufferEmpty && runtime.gLink.sendQueue.count === 0)
      runtime.sSendBufferEmpty = true;

    if (runtime.sSendBufferEmpty)
      runtime.regSiomltSend = 0;
    else
      runtime.regSiomltSend = runtime.gLink.sendQueue.data[runtime.gLink.sendCmdIndex][runtime.gLink.sendQueue.pos];
    runtime.gLink.sendCmdIndex += 1;
  }
};

const stopTimer = (runtime: DecompLinkRuntime): void => {
  if (runtime.gLink.isMaster) {
    runtime.regTm3cntH &= ~TIMER_ENABLE;
    runtime.regTm3cntL = -197;
    runtime.timerEnabled = false;
    runtime.timerReload = -197;
  }
};

const sendRecvDone = (runtime: DecompLinkRuntime): void => {
  if (runtime.gLink.recvCmdIndex === CMD_LENGTH) {
    runtime.gLink.sendCmdIndex = 0;
    runtime.gLink.recvCmdIndex = 0;
  } else if (runtime.gLink.isMaster) {
    runtime.regTm3cntH |= TIMER_ENABLE;
    runtime.timerEnabled = true;
  }
};

export const DisableSerial = disableSerial;
export const EnableSerial = enableSerial;
export const CheckMasterOrSlave = checkMasterOrSlave;
export const InitTimer = initTimer;
export const StartTransfer = startTransfer;
export const DoHandshake = doHandshake;
export const DoRecv = doRecv;
export const DoSend = doSend;
export const StopTimer = stopTimer;
export const SendRecvDone = sendRecvDone;

export const LinkVSync = (runtime: DecompLinkRuntime): void => {
  if (runtime.gLink.isMaster) {
    switch (runtime.gLink.state) {
      case LINK_STATE_CONN_ESTABLISHED:
        if (runtime.gLink.serialIntrCounter < 9) {
          if (runtime.gLink.hardwareError !== true)
            runtime.gLink.lag = LAG_MASTER;
          else
            startTransfer(runtime);
        } else if (runtime.gLink.lag !== LAG_MASTER) {
          runtime.gLink.serialIntrCounter = 0;
          startTransfer(runtime);
        }
        break;
      case LINK_STATE_HANDSHAKE:
        startTransfer(runtime);
        break;
    }
  } else if (runtime.gLink.state === LINK_STATE_CONN_ESTABLISHED || runtime.gLink.state === LINK_STATE_HANDSHAKE) {
    runtime.sNumVBlanksWithoutSerialIntr = u16(runtime.sNumVBlanksWithoutSerialIntr + 1);
    if (runtime.sNumVBlanksWithoutSerialIntr > 10) {
      if (runtime.gLink.state === LINK_STATE_CONN_ESTABLISHED)
        runtime.gLink.lag = LAG_SLAVE;

      if (runtime.gLink.state === LINK_STATE_HANDSHAKE) {
        runtime.gLink.playerCount = 0;
        runtime.gLink.link_field_F = 0;
      }
    }
  }
};

export const Timer3Intr = (runtime: DecompLinkRuntime): void => {
  stopTimer(runtime);
  startTransfer(runtime);
};

export const SerialCB = (runtime: DecompLinkRuntime): void => {
  runtime.gLink.localId = runtime.regSiocntId;
  switch (runtime.gLink.state) {
    case LINK_STATE_CONN_ESTABLISHED:
      runtime.gLink.hardwareError = runtime.regSiocntError;
      doRecv(runtime);
      doSend(runtime);
      sendRecvDone(runtime);
      break;
    case LINK_STATE_HANDSHAKE:
      if (doHandshake(runtime)) {
        if (runtime.gLink.isMaster) {
          runtime.gLink.state = LINK_STATE_INIT_TIMER;
          runtime.gLink.serialIntrCounter = 8;
        } else {
          runtime.gLink.state = LINK_STATE_CONN_ESTABLISHED;
        }
      }
      break;
  }
  runtime.gLink.serialIntrCounter = s8(runtime.gLink.serialIntrCounter + 1);
  runtime.sNumVBlanksWithoutSerialIntr = 0;
  if (runtime.gLink.serialIntrCounter === 8)
    runtime.gLastRecvQueueCount = runtime.gLink.recvQueue.count;
};

export const LinkMain1 = (runtime: DecompLinkRuntime, shouldAdvanceLinkState: { value: number }, sendCmd: number[], recvCmds: number[][]): number => {
  let retVal: number;
  let retVal2: number;

  switch (runtime.gLink.state) {
    case LINK_STATE_START0:
      disableSerial(runtime);
      runtime.gLink.state = LINK_STATE_START1;
      break;
    case LINK_STATE_START1:
      if (shouldAdvanceLinkState.value === 1) {
        enableSerial(runtime);
        runtime.gLink.state = LINK_STATE_HANDSHAKE;
      }
      break;
    case LINK_STATE_HANDSHAKE:
      switch (shouldAdvanceLinkState.value) {
        default:
          checkMasterOrSlave(runtime);
          break;
        case 1:
          if (runtime.gLink.isMaster === LINK_MASTER && runtime.gLink.playerCount > 1)
            runtime.gLink.handshakeAsMaster = true;
          break;
        case 2:
          runtime.gLink.state = LINK_STATE_START0;
          runtime.regSiomltSend = 0;
          break;
      }
      break;
    case LINK_STATE_INIT_TIMER:
      initTimer(runtime);
      runtime.gLink.state = LINK_STATE_CONN_ESTABLISHED;
    // fallthrough
    case LINK_STATE_CONN_ESTABLISHED:
      EnqueueSendCmd(runtime, sendCmd);
      DequeueRecvCmds(runtime, recvCmds);
      break;
  }

  shouldAdvanceLinkState.value = 0;
  retVal = runtime.gLink.localId;
  retVal |= runtime.gLink.playerCount << LINK_STAT_PLAYER_COUNT_SHIFT;
  if (runtime.gLink.isMaster === LINK_MASTER)
    retVal |= LINK_STAT_MASTER;

  {
    const receivedNothing = Number(runtime.gLink.receivedNothing) << LINK_STAT_RECEIVED_NOTHING_SHIFT;
    const linkFieldF = runtime.gLink.link_field_F << LINK_STAT_UNK_FLAG_9_SHIFT;
    const hardwareError = Number(runtime.gLink.hardwareError) << LINK_STAT_ERROR_HARDWARE_SHIFT;
    const badChecksum = Number(runtime.gLink.badChecksum) << LINK_STAT_ERROR_CHECKSUM_SHIFT;
    const queueFull = runtime.gLink.queueFull << LINK_STAT_ERROR_QUEUE_FULL_SHIFT;
    let val: number;

    if (runtime.gLink.state === LINK_STATE_CONN_ESTABLISHED) {
      val = LINK_STAT_CONN_ESTABLISHED;
      val |= receivedNothing;
      val |= retVal;
      val |= linkFieldF;
      val |= hardwareError;
      val |= badChecksum;
      val |= queueFull;
    } else {
      val = retVal;
      val |= receivedNothing;
      val |= linkFieldF;
      val |= hardwareError;
      val |= badChecksum;
      val |= queueFull;
    }

    retVal = val;
  }

  if (runtime.gLink.lag === LAG_MASTER)
    retVal |= LINK_STAT_ERROR_LAG_MASTER;

  if (runtime.gLink.localId >= MAX_LINK_PLAYERS)
    retVal |= LINK_STAT_ERROR_INVALID_ID;

  retVal2 = retVal;
  if (runtime.gLink.lag === LAG_SLAVE)
    retVal2 |= LINK_STAT_ERROR_LAG_SLAVE;

  return retVal2 >>> 0;
};
