export const VERSION_FIRE_RED = 4;
export const LANGUAGE_ENGLISH = 2;
export const gGameVersion = VERSION_FIRE_RED;
export const gGameLanguage = LANGUAGE_ENGLISH;
export const BuildDateTime = '2004 04 26 11:20';

export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const SELECT_BUTTON = 0x0004;
export const START_BUTTON = 0x0008;
export const L_BUTTON = 0x0200;
export const KEYS_MASK = 0x03ff;
export const B_START_SELECT = B_BUTTON | START_BUTTON | SELECT_BUTTON;

export const INTR_FLAG_VBLANK = 1 << 0;
export const INTR_FLAG_HBLANK = 1 << 1;
export const INTR_FLAG_VCOUNT = 1 << 2;
export const INTR_FLAG_TIMER3 = 1 << 6;
export const INTR_FLAG_SERIAL = 1 << 7;

export const OPTIONS_BUTTON_MODE_L_EQUALS_A = 2;
export const QL_PLAYBACK_STATE_STOPPED = 0;
export const REG_OFFSET_DISPSTAT = 0x0004;
export const DISPSTAT_VCOUNT_INTR = 1 << 5;

export const INTR_COUNT = 14;
export const MAX_POKEMON_CRIES = 2;
export const RESET_ALL = 0xff;
export const RESET_SIO_REGS = 1 << 5;

export type MainCallback = (runtime: MainRuntime) => void;
export type IntrCallback = (runtime: MainRuntime) => void;
export type IntrFunc = (runtime: MainRuntime) => void;

export type MainState = {
  callback1: MainCallback | null;
  callback2: MainCallback | null;
  savedCallback: MainCallback | null;
  vblankCallback: IntrCallback | null;
  hblankCallback: IntrCallback | null;
  vcountCallback: IntrCallback | null;
  serialCallback: IntrCallback | null;
  intrCheck: number;
  vblankCounter1: { value: number } | null;
  vblankCounter2: number;
  heldKeysRaw: number;
  newKeysRaw: number;
  heldKeys: number;
  newKeys: number;
  newAndRepeatedKeys: number;
  keyRepeatCounter: number;
  watchedKeysPressed: boolean;
  watchedKeysMask: number;
  state: number;
  oamLoadDisabled: boolean;
  inBattle: boolean;
  field_439_x4: boolean;
};

export type MainRuntime = {
  gKeyRepeatStartDelay: number;
  gKeyRepeatContinueDelay: number;
  gLinkTransferringData: boolean;
  gMain: MainState;
  gSoftResetDisabled: boolean;
  gIntrTable: IntrFunc[];
  gLinkVSyncDisabled: boolean;
  IntrMain_Buffer: number[];
  sVcountAfterSound: number;
  sVcountAtIntr: number;
  sVcountBeforeSound: number;
  gPcmDmaCounter: number;
  gDecompressionBuffer: Uint8Array;
  gTrainerId: number;
  REG_KEYINPUT: number;
  REG_TM1CNT_H: number;
  REG_TM1CNT_L: number;
  REG_IME: number;
  REG_WAITCNT: number;
  REG_VCOUNT: number;
  INTR_CHECK: number;
  INTR_VECTOR: number[] | null;
  gpuRegs: Map<number, number>;
  enabledInterrupts: number;
  gSaveBlock1: Record<string, never>;
  gSaveBlock2: { encryptionKey: number; optionsButtonMode: number };
  gSaveBlock1Ptr: Record<string, never> | null;
  gSaveBlock2Ptr: { encryptionKey: number; optionsButtonMode: number } | null;
  gQuestLogPlaybackState: number;
  gFlashMemoryPresent: boolean;
  gHelpSystemEnabled: boolean;
  gWirelessCommType: number;
  gSoundInfo: { pcmDmaCounter: number };
  gPokemonCrySongs: Array<{ value: number }>;
  log: string[];
  handleLinkConnectionResult: boolean;
  runSaveFailedScreenResult: boolean;
  runHelpSystemCallbackResult: boolean;
  overworldSendKeysToLinkRunning: boolean;
  overworldRecvKeysFromLinkRunning: number;
  waitForVBlankPollLimit: number;
  onWaitForVBlankPoll: ((runtime: MainRuntime, polls: number) => void) | null;
};

const u16 = (value: number): number => value & 0xffff;
const joyNew = (runtime: MainRuntime, button: number): number => runtime.gMain.newKeys & button;
const joyHeld = (runtime: MainRuntime, button: number): number => runtime.gMain.heldKeys & button;

export const IntrDummy: IntrFunc = () => {};
export const Timer3Intr: IntrFunc = (runtime) => {
  runtime.log.push('Timer3Intr');
};

export const createMainState = (): MainState => ({
  callback1: null,
  callback2: null,
  savedCallback: null,
  vblankCallback: null,
  hblankCallback: null,
  vcountCallback: null,
  serialCallback: null,
  intrCheck: 0,
  vblankCounter1: null,
  vblankCounter2: 0,
  heldKeysRaw: 0,
  newKeysRaw: 0,
  heldKeys: 0,
  newKeys: 0,
  newAndRepeatedKeys: 0,
  keyRepeatCounter: 0,
  watchedKeysPressed: false,
  watchedKeysMask: 0,
  state: 0,
  oamLoadDisabled: false,
  inBattle: false,
  field_439_x4: false
});

export const gIntrTableTemplate: IntrFunc[] = [
  (runtime) => VCountIntr(runtime),
  (runtime) => SerialIntr(runtime),
  Timer3Intr,
  (runtime) => HBlankIntr(runtime),
  (runtime) => VBlankIntr(runtime),
  IntrDummy,
  IntrDummy,
  IntrDummy,
  IntrDummy,
  IntrDummy,
  IntrDummy,
  IntrDummy,
  IntrDummy,
  IntrDummy
];

export const createMainRuntime = (): MainRuntime => ({
  gKeyRepeatStartDelay: 0,
  gKeyRepeatContinueDelay: 0,
  gLinkTransferringData: false,
  gMain: createMainState(),
  gSoftResetDisabled: false,
  gIntrTable: Array<IntrFunc>(INTR_COUNT).fill(IntrDummy),
  gLinkVSyncDisabled: false,
  IntrMain_Buffer: Array(0x200).fill(0),
  sVcountAfterSound: 0,
  sVcountAtIntr: 0,
  sVcountBeforeSound: 0,
  gPcmDmaCounter: 0,
  gDecompressionBuffer: new Uint8Array(0x4000),
  gTrainerId: 0,
  REG_KEYINPUT: KEYS_MASK,
  REG_TM1CNT_H: 0,
  REG_TM1CNT_L: 0,
  REG_IME: 0,
  REG_WAITCNT: 0,
  REG_VCOUNT: 0,
  INTR_CHECK: 0,
  INTR_VECTOR: null,
  gpuRegs: new Map(),
  enabledInterrupts: 0,
  gSaveBlock1: {},
  gSaveBlock2: { encryptionKey: 0, optionsButtonMode: 0 },
  gSaveBlock1Ptr: null,
  gSaveBlock2Ptr: null,
  gQuestLogPlaybackState: QL_PLAYBACK_STATE_STOPPED,
  gFlashMemoryPresent: true,
  gHelpSystemEnabled: false,
  gWirelessCommType: 0,
  gSoundInfo: { pcmDmaCounter: 0 },
  gPokemonCrySongs: Array.from({ length: MAX_POKEMON_CRIES }, () => ({ value: 0xffff })),
  log: [],
  handleLinkConnectionResult: false,
  runSaveFailedScreenResult: false,
  runHelpSystemCallbackResult: false,
  overworldSendKeysToLinkRunning: false,
  overworldRecvKeysFromLinkRunning: 0,
  waitForVBlankPollLimit: 1024,
  onWaitForVBlankPoll: null
});

export const SetMainCallback2 = (runtime: MainRuntime, callback: MainCallback | null): void => {
  runtime.gMain.callback2 = callback;
  runtime.gMain.state = 0;
};

export const StartTimer1 = (runtime: MainRuntime): void => {
  runtime.REG_TM1CNT_H = 0x80;
};

export const SeedRng = (runtime: MainRuntime, seed: number): void => {
  runtime.log.push(`SeedRng:${u16(seed)}`);
};

export const SeedRngAndSetTrainerId = (runtime: MainRuntime): void => {
  const val = u16(runtime.REG_TM1CNT_L);
  SeedRng(runtime, val);
  runtime.REG_TM1CNT_H = 0;
  runtime.gTrainerId = val;
};

export const GetGeneratedTrainerIdLower = (runtime: MainRuntime): number => runtime.gTrainerId;

export const GetGpuReg = (runtime: MainRuntime, reg: number): number => runtime.gpuRegs.get(reg) ?? 0;
export const SetGpuReg = (runtime: MainRuntime, reg: number, value: number): void => {
  runtime.gpuRegs.set(reg, u16(value));
};

export const EnableInterrupts = (runtime: MainRuntime, flags: number): void => {
  runtime.enabledInterrupts |= flags;
};

export const EnableVCountIntrAtLine150 = (runtime: MainRuntime): void => {
  const gpuReg = (GetGpuReg(runtime, REG_OFFSET_DISPSTAT) & 0xff) | (150 << 8);
  SetGpuReg(runtime, REG_OFFSET_DISPSTAT, gpuReg | DISPSTAT_VCOUNT_INTR);
  EnableInterrupts(runtime, INTR_FLAG_VCOUNT);
};

export const InitKeys = (runtime: MainRuntime): void => {
  runtime.gKeyRepeatContinueDelay = 5;
  runtime.gKeyRepeatStartDelay = 40;

  runtime.gMain.heldKeys = 0;
  runtime.gMain.newKeys = 0;
  runtime.gMain.newAndRepeatedKeys = 0;
  runtime.gMain.heldKeysRaw = 0;
  runtime.gMain.newKeysRaw = 0;
};

export const ReadKeys = (runtime: MainRuntime): void => {
  const keyInput = u16(runtime.REG_KEYINPUT ^ KEYS_MASK);
  runtime.gMain.newKeysRaw = keyInput & ~runtime.gMain.heldKeysRaw;
  runtime.gMain.newKeys = runtime.gMain.newKeysRaw;
  runtime.gMain.newAndRepeatedKeys = runtime.gMain.newKeysRaw;

  if (keyInput !== 0 && runtime.gMain.heldKeys === keyInput) {
    runtime.gMain.keyRepeatCounter = u16(runtime.gMain.keyRepeatCounter - 1);

    if (runtime.gMain.keyRepeatCounter === 0) {
      runtime.gMain.newAndRepeatedKeys = keyInput;
      runtime.gMain.keyRepeatCounter = runtime.gKeyRepeatContinueDelay;
    }
  } else {
    runtime.gMain.keyRepeatCounter = runtime.gKeyRepeatStartDelay;
  }

  runtime.gMain.heldKeysRaw = keyInput;
  runtime.gMain.heldKeys = runtime.gMain.heldKeysRaw;

  if (runtime.gSaveBlock2Ptr?.optionsButtonMode === OPTIONS_BUTTON_MODE_L_EQUALS_A) {
    if (joyNew(runtime, L_BUTTON)) {
      runtime.gMain.newKeys |= A_BUTTON;
    }

    if (joyHeld(runtime, L_BUTTON)) {
      runtime.gMain.heldKeys |= A_BUTTON;
    }
  }

  if (joyNew(runtime, runtime.gMain.watchedKeysMask)) {
    runtime.gMain.watchedKeysPressed = true;
  }
};

export const SetVBlankCallback = (runtime: MainRuntime, callback: IntrCallback | null): void => {
  runtime.gMain.vblankCallback = callback;
};

export const SetHBlankCallback = (runtime: MainRuntime, callback: IntrCallback | null): void => {
  runtime.gMain.hblankCallback = callback;
};

export const SetVCountCallback = (runtime: MainRuntime, callback: IntrCallback | null): void => {
  runtime.gMain.vcountCallback = callback;
};

export const SetSerialCallback = (runtime: MainRuntime, callback: IntrCallback | null): void => {
  runtime.gMain.serialCallback = callback;
};

export const InitIntrHandlers = (runtime: MainRuntime): void => {
  for (let i = 0; i < INTR_COUNT; i += 1) {
    runtime.gIntrTable[i] = gIntrTableTemplate[i];
  }

  runtime.IntrMain_Buffer.fill(0);
  runtime.INTR_VECTOR = runtime.IntrMain_Buffer;

  SetVBlankCallback(runtime, null);
  SetHBlankCallback(runtime, null);
  SetSerialCallback(runtime, null);

  runtime.REG_IME = 1;

  EnableInterrupts(runtime, INTR_FLAG_VBLANK);
};

export const RfuVSync = (runtime: MainRuntime): void => {
  runtime.log.push('RfuVSync');
};

export const LinkVSync = (runtime: MainRuntime): void => {
  runtime.log.push('LinkVSync');
};

export const CopyBufferedValuesToGpuRegs = (runtime: MainRuntime): void => {
  runtime.log.push('CopyBufferedValuesToGpuRegs');
};

export const ProcessDma3Requests = (runtime: MainRuntime): void => {
  runtime.log.push('ProcessDma3Requests');
};

export const m4aSoundMain = (runtime: MainRuntime): void => {
  runtime.log.push('m4aSoundMain');
};

export const TryReceiveLinkBattleData = (runtime: MainRuntime): void => {
  runtime.log.push('TryReceiveLinkBattleData');
};

export const Random = (runtime: MainRuntime): void => {
  runtime.log.push('Random');
};

export const UpdateWirelessStatusIndicatorSprite = (runtime: MainRuntime): void => {
  runtime.log.push('UpdateWirelessStatusIndicatorSprite');
};

export const VBlankIntr = (runtime: MainRuntime): void => {
  if (runtime.gWirelessCommType) {
    RfuVSync(runtime);
  } else if (!runtime.gLinkVSyncDisabled) {
    LinkVSync(runtime);
  }

  if (runtime.gMain.vblankCounter1) {
    runtime.gMain.vblankCounter1.value = u16(runtime.gMain.vblankCounter1.value + 1);
  }

  if (runtime.gMain.vblankCallback) {
    runtime.gMain.vblankCallback(runtime);
  }

  runtime.gMain.vblankCounter2 = (runtime.gMain.vblankCounter2 + 1) >>> 0;

  CopyBufferedValuesToGpuRegs(runtime);
  ProcessDma3Requests(runtime);

  runtime.gPcmDmaCounter = runtime.gSoundInfo.pcmDmaCounter;

  runtime.sVcountBeforeSound = runtime.REG_VCOUNT;
  m4aSoundMain(runtime);
  runtime.sVcountAfterSound = runtime.REG_VCOUNT;

  TryReceiveLinkBattleData(runtime);
  Random(runtime);
  UpdateWirelessStatusIndicatorSprite(runtime);

  runtime.INTR_CHECK |= INTR_FLAG_VBLANK;
  runtime.gMain.intrCheck |= INTR_FLAG_VBLANK;
};

export const InitFlashTimer = (runtime: MainRuntime): void => {
  runtime.log.push(`SetFlashTimerIntr:2:${runtime.gIntrTable[7] === IntrDummy ? 'IntrDummy' : 'IntrFunc'}`);
};

export const HBlankIntr = (runtime: MainRuntime): void => {
  if (runtime.gMain.hblankCallback) {
    runtime.gMain.hblankCallback(runtime);
  }

  runtime.INTR_CHECK |= INTR_FLAG_HBLANK;
  runtime.gMain.intrCheck |= INTR_FLAG_HBLANK;
};

export const m4aSoundVSync = (runtime: MainRuntime): void => {
  runtime.log.push('m4aSoundVSync');
};

export const VCountIntr = (runtime: MainRuntime): void => {
  runtime.sVcountAtIntr = runtime.REG_VCOUNT;
  m4aSoundVSync(runtime);
  runtime.INTR_CHECK |= INTR_FLAG_VCOUNT;
  runtime.gMain.intrCheck |= INTR_FLAG_VCOUNT;
};

export const SerialIntr = (runtime: MainRuntime): void => {
  if (runtime.gMain.serialCallback) {
    runtime.gMain.serialCallback(runtime);
  }

  runtime.INTR_CHECK |= INTR_FLAG_SERIAL;
  runtime.gMain.intrCheck |= INTR_FLAG_SERIAL;
};

export const RestoreSerialTimer3IntrHandlers = (runtime: MainRuntime): void => {
  runtime.gIntrTable[1] = (rt) => SerialIntr(rt);
  runtime.gIntrTable[2] = Timer3Intr;
};

export const WaitForVBlank = (runtime: MainRuntime): void => {
  runtime.gMain.intrCheck &= ~INTR_FLAG_VBLANK;

  let polls = 0;
  while (!(runtime.gMain.intrCheck & INTR_FLAG_VBLANK)) {
    polls += 1;
    if (runtime.onWaitForVBlankPoll) {
      runtime.onWaitForVBlankPoll(runtime, polls);
    }
    if (polls > runtime.waitForVBlankPollLimit) {
      throw new Error('WaitForVBlank poll limit reached');
    }
  }
};

export const SetVBlankCounter1Ptr = (runtime: MainRuntime, ptr: { value: number }): void => {
  runtime.gMain.vblankCounter1 = ptr;
};

export const DisableVBlankCounter1 = (runtime: MainRuntime): void => {
  runtime.gMain.vblankCounter1 = null;
};

export const m4aSoundVSyncOff = (runtime: MainRuntime): void => {
  runtime.log.push('m4aSoundVSyncOff');
};

export const ScanlineEffect_Stop = (runtime: MainRuntime): void => {
  runtime.log.push('ScanlineEffect_Stop');
};

export const DmaStop = (runtime: MainRuntime, channel: number): void => {
  runtime.log.push(`DmaStop:${channel}`);
};

export const SoftReset = (runtime: MainRuntime, flags: number): void => {
  runtime.log.push(`SoftReset:${flags}`);
};

export const DoSoftReset = (runtime: MainRuntime): void => {
  runtime.REG_IME = 0;
  m4aSoundVSyncOff(runtime);
  ScanlineEffect_Stop(runtime);
  DmaStop(runtime, 1);
  DmaStop(runtime, 2);
  DmaStop(runtime, 3);
  SoftReset(runtime, RESET_ALL & ~RESET_SIO_REGS);
};

export const ClearPokemonCrySongs = (runtime: MainRuntime): void => {
  for (let i = 0; i < MAX_POKEMON_CRIES; i += 1) {
    runtime.gPokemonCrySongs[i].value = 0;
  }
};

export const RunSaveFailedScreen = (runtime: MainRuntime): boolean => runtime.runSaveFailedScreenResult;
export const RunHelpSystemCallback = (runtime: MainRuntime): boolean => runtime.runHelpSystemCallbackResult;
export const HandleLinkConnection = (runtime: MainRuntime): boolean => runtime.handleLinkConnectionResult;

export const CallCallbacks = (runtime: MainRuntime): void => {
  if (!RunSaveFailedScreen(runtime) && !RunHelpSystemCallback(runtime)) {
    if (runtime.gMain.callback1) {
      runtime.gMain.callback1(runtime);
    }

    if (runtime.gMain.callback2) {
      runtime.gMain.callback2(runtime);
    }
  }
};

export const UpdateLinkAndCallCallbacks = (runtime: MainRuntime): void => {
  if (!HandleLinkConnection(runtime)) {
    CallCallbacks(runtime);
  }
};

export const CB2_InitCopyrightScreenAfterBootup: MainCallback = (runtime) => {
  runtime.log.push('CB2_InitCopyrightScreenAfterBootup');
};

export const InitMainCallbacks = (runtime: MainRuntime): void => {
  runtime.gMain.vblankCounter1 = null;
  runtime.gMain.vblankCounter2 = 0;
  runtime.gMain.callback1 = null;
  SetMainCallback2(runtime, CB2_InitCopyrightScreenAfterBootup);
  runtime.gSaveBlock2Ptr = runtime.gSaveBlock2;
  runtime.gSaveBlock1Ptr = runtime.gSaveBlock1;
  runtime.gSaveBlock2.encryptionKey = 0;
  runtime.gQuestLogPlaybackState = QL_PLAYBACK_STATE_STOPPED;
};

export const rfu_REQ_stopMode = (runtime: MainRuntime): void => {
  runtime.log.push('rfu_REQ_stopMode');
};

export const rfu_waitREQComplete = (runtime: MainRuntime): void => {
  runtime.log.push('rfu_waitREQComplete');
};

export const Overworld_SendKeysToLinkIsRunning = (runtime: MainRuntime): boolean =>
  runtime.overworldSendKeysToLinkRunning;

export const Overworld_RecvKeysFromLinkIsRunning = (runtime: MainRuntime): number =>
  runtime.overworldRecvKeysFromLinkRunning;

export const ClearSpriteCopyRequests = (runtime: MainRuntime): void => {
  runtime.log.push('ClearSpriteCopyRequests');
};

export const PlayTimeCounter_Update = (runtime: MainRuntime): void => {
  runtime.log.push('PlayTimeCounter_Update');
};

export const BattleTraceHarness_TryBoot = (runtime: MainRuntime): void => {
  runtime.log.push('BattleTraceHarness_TryBoot');
};

export const BattleTraceHarness_Update = (runtime: MainRuntime): void => {
  runtime.log.push('BattleTraceHarness_Update');
};

export const MapMusicMain = (runtime: MainRuntime): void => {
  runtime.log.push('MapMusicMain');
};

export const AgbMainLoopIteration = (runtime: MainRuntime): void => {
  ReadKeys(runtime);

  if (
    runtime.gSoftResetDisabled === false
    && (runtime.gMain.heldKeysRaw & A_BUTTON) !== 0
    && (runtime.gMain.heldKeysRaw & B_START_SELECT) === B_START_SELECT
  ) {
    rfu_REQ_stopMode(runtime);
    rfu_waitREQComplete(runtime);
    DoSoftReset(runtime);
  }

  if (Overworld_SendKeysToLinkIsRunning(runtime) === true) {
    runtime.gLinkTransferringData = true;
    UpdateLinkAndCallCallbacks(runtime);
    runtime.gLinkTransferringData = false;
  } else {
    runtime.gLinkTransferringData = false;
    UpdateLinkAndCallCallbacks(runtime);

    if (Overworld_RecvKeysFromLinkIsRunning(runtime) === 1) {
      runtime.gMain.newKeys = 0;
      ClearSpriteCopyRequests(runtime);
      runtime.gLinkTransferringData = true;
      UpdateLinkAndCallCallbacks(runtime);
      runtime.gLinkTransferringData = false;
    }
  }

  PlayTimeCounter_Update(runtime);
  BattleTraceHarness_TryBoot(runtime);
  BattleTraceHarness_Update(runtime);
  MapMusicMain(runtime);
  WaitForVBlank(runtime);
};

export const AgbMain = (runtime: MainRuntime, iterations: number): void => {
  InitKeys(runtime);
  InitIntrHandlers(runtime);
  EnableVCountIntrAtLine150(runtime);
  InitMainCallbacks(runtime);
  runtime.gSoftResetDisabled = false;
  runtime.gHelpSystemEnabled = false;
  runtime.gLinkTransferringData = false;
  BattleTraceHarness_TryBoot(runtime);

  for (let i = 0; i < iterations; i += 1) {
    AgbMainLoopIteration(runtime);
  }
};
