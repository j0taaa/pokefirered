import {
  createTask,
  createTaskRuntime,
  destroyTask,
  findTaskIdByFunc,
  funcIsActiveTask,
  registerTaskCallback,
  resetTasks,
  runTasks,
  type TaskRuntime
} from './decompTask';

export const NUM_REELS = 3;
export const REEL_LENGTH = 21;
export const REEL_LOAD_LENGTH = 5;
export const NUM_MATCH_LINES = 5;
export const NUM_BUTTON_TILES = 4;
export const NUM_DIGIT_SPRITES = 4;

export const PALSLOT_LINE_NORMAL = 4;
export const PALSLOT_LINE_BET = 5;
export const PALSLOT_LINE_MATCH = 6;

export const ICON_7 = 0;
export const ICON_ROCKET = 1;
export const ICON_PIKACHU = 2;
export const ICON_PSYDUCK = 3;
export const ICON_CHERRIES = 4;
export const ICON_MAGNEMITE = 5;
export const ICON_SHELLDER = 6;

export const PAYOUT_NONE = 0;
export const PAYOUT_CHERRIES2 = 1;
export const PAYOUT_CHERRIES3 = 2;
export const PAYOUT_MAGSHELL = 3;
export const PAYOUT_PIKAPSY = 4;
export const PAYOUT_ROCKET = 5;
export const PAYOUT_7 = 6;
export const NUM_PAYOUT_TYPES = 7;

export const SLOTTASK_GFX_INIT = 0;
export const SLOTTASK_FADEOUT_EXIT = 1;
export const SLOTTASK_UPDATE_LINE_LIGHTS = 2;
export const SLOTTASK_CLEFAIRY_BOUNCE = 3;
export const SLOTTASK_ANIM_WIN = 4;
export const SLOTTASK_END_ANIM_WIN = 5;
export const SLOTTASK_ANIM_LOSE = 6;
export const SLOTTASK_ANIM_BETTING = 7;
export const SLOTTASK_SHOW_AMOUNTS = 8;
export const SLOTTASK_MSG_NO_COINS = 9;
export const SLOTTASK_ASK_QUIT = 10;
export const SLOTTASK_DESTROY_YESNO = 11;
export const SLOTTASK_PRESS_BUTTON = 12;
export const SLOTTASK_RELEASE_BUTTONS = 13;
export const SLOTTASK_SHOWHELP = 14;
export const SLOTTASK_HIDEHELP = 15;

export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const DPAD_DOWN = 1 << 2;
export const DPAD_RIGHT = 1 << 3;
export const DPAD_LEFT = 1 << 4;
export const R_BUTTON = 1 << 5;
export const START_BUTTON = 1 << 6;
export const DPAD_ANY = DPAD_DOWN | DPAD_RIGHT | DPAD_LEFT | (1 << 7);

export interface SlotMachineState {
  savedCallback: string;
  machineIdx: number;
  currentReel: number;
  machineBias: number;
  slotRewardClass: number;
  biasCooldown: number;
  bet: number;
  taskId: number;
  spinReelsTaskId: number;
  reelIsSpinning: boolean[];
  reelPositions: number[];
  reelSubpixel: number[];
  destReelPos: number[];
  reelStopOrder: number[];
  reel2BiasInPlay: number;
  winFlags: boolean[];
  payout: number;
}

export interface SlotSprite {
  x: number;
  y: number;
  y2: number;
  animId: number;
  paletteNum: number;
  data: number[];
  hFlip: boolean;
  matrixNum: number;
}

export interface SlotMachineGfxManager {
  field_00: number[];
  reelIconSprites: (SlotSprite | null)[][];
  creditDigitSprites: (SlotSprite | null)[];
  payoutDigitSprites: (SlotSprite | null)[];
  clefairySprites: (SlotSprite | null)[];
  reelIconAffineParam: number;
}

export interface SlotMachineSetupTask {
  funcno: number;
  state: number;
  active: boolean;
}

export interface SlotMachineSetupTaskData {
  tasks: SlotMachineSetupTask[];
  reelButtonToPress: number;
  bg1X: number;
  yesNoMenuActive: boolean;
  buttonPressedTiles: number[][];
  buttonReleasedTiles: number[][];
  bg0TilemapBuffer: number[];
  bg1TilemapBuffer: number[];
  bg2TilemapBuffer: number[];
  bg3TilemapBuffer: number[];
}

export interface SlotMachineRuntime {
  taskRuntime: TaskRuntime;
  state: SlotMachineState | null;
  gfxManager: SlotMachineGfxManager | null;
  setupData: SlotMachineSetupTaskData | null;
  mainState: number;
  mainCallback2: string;
  coins: number;
  newKeys: number;
  heldKeys: number;
  randomValues: number[];
  menuInput: number;
  paletteFadeActive: boolean;
  dmaBusy: boolean;
  fanfareActive: boolean;
  regVCount: number;
  regBldy: number;
  backdropColor: number;
  linePalettes: number[];
  bgTilemapBuffer2: number[];
  messages: string[];
  soundEffects: string[];
  fanfares: string[];
  gameStats: Record<string, number>;
  qlPlayedTheSlots: boolean;
  flashWinningLineTaskId: number | null;
  shownBgs: Set<number>;
  gpuRegs: Record<string, number>;
  paletteLoads: Array<{ target: number; value: number }>;
}

const sSecondReelBiasCheckIndices = [
  [0, 3], [0, 6], [3, 6],
  [1, 4], [1, 7], [4, 7],
  [2, 5], [2, 8], [5, 8],
  [0, 4], [0, 8], [4, 8],
  [2, 4], [2, 6], [4, 6]
] as const;

const sThirdReelBiasCheckIndices = [
  [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
] as const;

const sRowAttributes = [
  [0, 4, 8, 3],
  [0, 3, 6, 2],
  [1, 4, 7, 1],
  [2, 5, 8, 2],
  [2, 4, 6, 3]
] as const;

export const sReelBiasChances = [
  [0x1fa1, 0x2eab, 0x3630, 0x39f3, 0x3bd4, 0x3bfc, 0x0049],
  [0x1f97, 0x2ea2, 0x3627, 0x39e9, 0x3bca, 0x3bf8, 0x0049],
  [0x1f91, 0x2e9b, 0x3620, 0x39e3, 0x3bc4, 0x3bf4, 0x0049],
  [0x1f87, 0x2e92, 0x3617, 0x39d9, 0x3bba, 0x3bef, 0x0050],
  [0x1f7f, 0x2e89, 0x360e, 0x39d1, 0x3bb2, 0x3bea, 0x0050],
  [0x1fc9, 0x2efc, 0x3696, 0x3a63, 0x3c49, 0x3c8b, 0x0073]
] as const;

export const sReelIconAnimByReelAndPos = [
  [ICON_7, ICON_PSYDUCK, ICON_CHERRIES, ICON_ROCKET, ICON_PIKACHU, ICON_SHELLDER, ICON_PIKACHU, ICON_MAGNEMITE, ICON_7, ICON_SHELLDER, ICON_PSYDUCK, ICON_ROCKET, ICON_CHERRIES, ICON_PIKACHU, ICON_SHELLDER, ICON_7, ICON_MAGNEMITE, ICON_PIKACHU, ICON_ROCKET, ICON_SHELLDER, ICON_PIKACHU],
  [ICON_7, ICON_MAGNEMITE, ICON_CHERRIES, ICON_PSYDUCK, ICON_ROCKET, ICON_MAGNEMITE, ICON_CHERRIES, ICON_PSYDUCK, ICON_PIKACHU, ICON_MAGNEMITE, ICON_CHERRIES, ICON_PSYDUCK, ICON_7, ICON_MAGNEMITE, ICON_CHERRIES, ICON_ROCKET, ICON_PSYDUCK, ICON_SHELLDER, ICON_MAGNEMITE, ICON_PSYDUCK, ICON_CHERRIES],
  [ICON_7, ICON_PSYDUCK, ICON_SHELLDER, ICON_MAGNEMITE, ICON_PIKACHU, ICON_PSYDUCK, ICON_SHELLDER, ICON_MAGNEMITE, ICON_PIKACHU, ICON_PSYDUCK, ICON_MAGNEMITE, ICON_SHELLDER, ICON_PIKACHU, ICON_PSYDUCK, ICON_MAGNEMITE, ICON_SHELLDER, ICON_PIKACHU, ICON_PSYDUCK, ICON_MAGNEMITE, ICON_SHELLDER, ICON_ROCKET]
] as const;

export const sPayoutTable = [0, 2, 6, 8, 15, 100, 300] as const;

const sReelIconPaletteTags = [2, 2, 0, 0, 2, 4, 3] as const;
const sReelIconAffineParams = Array.from({ length: 0x54 }, (_, i) => i < 0x20 ? 0x120 - i : i < 0x40 ? 0x100 : 0x101 + (i - 0x40));
const sReelIconBldY = Array.from({ length: 0x54 }, (_, i) => (i < 24 ? 0x10 - Math.floor(i / 4) : i > 68 ? Math.floor((i - 68) / 4) : 0));
const sWinningLineFlashPalIdxs = [2, 4] as const;
const sReelButtonMapTileIdxs = [
  [0x0229, 0x022a, 0x0249, 0x024a],
  [0x022e, 0x022f, 0x024e, 0x024f],
  [0x0233, 0x0234, 0x0253, 0x0254]
] as const;
const sLineStateTileIdxs = [
  [0x00a4, 0x00a5, 0x00a6, 0x00c4, 0x00c5, 0x00c6, 0x00c7, 0x00e7, 0x012c, 0x014c, 0x0191, 0x01b1, 0x01f6, 0x0216, 0x0217, 0x0218, 0x0219, 0x0237, 0x0238, 0x0239],
  [0x00e4, 0x00e5, 0x00e6, 0x00f7, 0x00f8, 0x00f9, 0x0104, 0x0105, 0x0106, 0x0107, 0x010c, 0x0111, 0x0116, 0x0117, 0x0118, 0x0119, 0x0124, 0x0125, 0x0126, 0x0137, 0x0138, 0x0139],
  [0x0144, 0x0145, 0x0146, 0x0157, 0x0158, 0x0159, 0x0164, 0x0165, 0x0166, 0x0167, 0x016c, 0x0171, 0x0176, 0x0177, 0x0178, 0x0179, 0x0184, 0x0185, 0x0186, 0x0197, 0x0198, 0x0199],
  [0x01a4, 0x01a5, 0x01a6, 0x01b7, 0x01b8, 0x01b9, 0x01c4, 0x01c5, 0x01c6, 0x01c7, 0x01cc, 0x01d1, 0x01d6, 0x01d7, 0x01d8, 0x01d9, 0x01e4, 0x01e5, 0x01e6, 0x01f7, 0x01f8, 0x01f9],
  [0x0204, 0x0205, 0x0206, 0x0224, 0x0225, 0x0226, 0x01e7, 0x0207, 0x018c, 0x01ac, 0x0131, 0x0151, 0x00d6, 0x00f6, 0x00b7, 0x00b8, 0x00b9, 0x00d7, 0x00d8, 0x00d9]
] as const;

let activeRuntime: SlotMachineRuntime | null = null;

const requireRuntime = (runtime?: SlotMachineRuntime): SlotMachineRuntime => {
  const resolved = runtime ?? activeRuntime;
  if (resolved === null) {
    throw new Error('Slot machine runtime has not been created');
  }
  return resolved;
};

const requireState = (runtime?: SlotMachineRuntime): SlotMachineState => {
  const resolved = requireRuntime(runtime).state;
  if (resolved === null) {
    throw new Error('Slot machine state is not allocated');
  }
  return resolved;
};

const requireSetup = (runtime?: SlotMachineRuntime): SlotMachineSetupTaskData => {
  const resolved = requireRuntime(runtime).setupData;
  if (resolved === null) {
    throw new Error('Slot machine setup data is not allocated');
  }
  return resolved;
};

const random = (runtime: SlotMachineRuntime): number => (runtime.randomValues.shift() ?? 0) & 0xffff;
const joyNew = (runtime: SlotMachineRuntime, mask: number): boolean => (runtime.newKeys & mask) !== 0;
const joyHeld = (runtime: SlotMachineRuntime, mask: number): boolean => (runtime.heldKeys & mask) !== 0;
const playSE = (runtime: SlotMachineRuntime, se: string): void => { runtime.soundEffects.push(se); };
const playFanfare = (runtime: SlotMachineRuntime, fanfare: string): void => { runtime.fanfares.push(fanfare); runtime.fanfareActive = true; };
const isFanfareTaskInactive = (runtime: SlotMachineRuntime): boolean => !runtime.fanfareActive;
const addCoins = (runtime: SlotMachineRuntime, amount: number): void => { runtime.coins += amount; };
const removeCoins = (runtime: SlotMachineRuntime, amount: number): void => { runtime.coins = Math.max(0, runtime.coins - amount); };
const setCoins = (runtime: SlotMachineRuntime, amount: number): void => { runtime.coins = amount; };

const createSprite = (x: number, y: number, priority = 0): SlotSprite => ({
  x,
  y,
  y2: 0,
  animId: 0,
  paletteNum: 0,
  data: [0, 0, 0, 0],
  hFlip: false,
  matrixNum: priority
});

const startSpriteAnim = (sprite: SlotSprite | null, animId: number): void => {
  if (sprite !== null) {
    sprite.animId = animId;
  }
};

const createState = (machineIdx: number, savedCallback: string): SlotMachineState => ({
  savedCallback,
  machineIdx,
  currentReel: 0,
  machineBias: 0,
  slotRewardClass: 0,
  biasCooldown: 0,
  bet: 0,
  taskId: 0,
  spinReelsTaskId: 0,
  reelIsSpinning: Array.from({ length: NUM_REELS }, () => false),
  reelPositions: Array.from({ length: NUM_REELS }, () => 0),
  reelSubpixel: Array.from({ length: NUM_REELS }, () => 0),
  destReelPos: Array.from({ length: NUM_REELS }, () => REEL_LENGTH),
  reelStopOrder: Array.from({ length: NUM_REELS }, () => 0),
  reel2BiasInPlay: 0,
  winFlags: Array.from({ length: NUM_MATCH_LINES }, () => false),
  payout: 0
});

const registerSlotMachineTasks = (runtime: SlotMachineRuntime): void => {
  const cb = (name: string, fn: (taskId: number, runtime?: SlotMachineRuntime) => void): void => {
    registerTaskCallback(runtime.taskRuntime, name, (taskId) => fn(taskId, runtime));
  };
  cb('MainTask_SlotsGameLoop', MainTask_SlotsGameLoop);
  cb('MainTask_NoCoinsGameOver', MainTask_NoCoinsGameOver);
  cb('MainTask_ShowHelp', MainTask_ShowHelp);
  cb('MainTask_ConfirmExitGame', MainTask_ConfirmExitGame);
  cb('MainTask_DarnNoPayout', MainTask_DarnNoPayout);
  cb('MainTask_WinHandlePayout', MainTask_WinHandlePayout);
  cb('MainTask_ExitSlots', MainTask_ExitSlots);
  cb('Task_SpinReels', Task_SpinReels);
  cb('Task_SlotMachine', Task_SlotMachine);
  cb('Task_FlashWinningLine', Task_FlashWinningLine);
};

export const createSlotMachineRuntime = (): SlotMachineRuntime => {
  const runtime: SlotMachineRuntime = {
    taskRuntime: createTaskRuntime(),
    state: null,
    gfxManager: null,
    setupData: null,
    mainState: 0,
    mainCallback2: '',
    coins: 0,
    newKeys: 0,
    heldKeys: 0,
    randomValues: [],
    menuInput: -2,
    paletteFadeActive: false,
    dmaBusy: false,
    fanfareActive: false,
    regVCount: 0,
    regBldy: 0,
    backdropColor: 0,
    linePalettes: Array.from({ length: NUM_MATCH_LINES }, () => PALSLOT_LINE_NORMAL),
    bgTilemapBuffer2: Array.from({ length: 0x400 }, () => 0),
    messages: [],
    soundEffects: [],
    fanfares: [],
    gameStats: {},
    qlPlayedTheSlots: false,
    flashWinningLineTaskId: null,
    shownBgs: new Set(),
    gpuRegs: {},
    paletteLoads: []
  };
  registerSlotMachineTasks(runtime);
  activeRuntime = runtime;
  return runtime;
};

export function PlaySlotMachine(machineIdx: number, savedCallback = 'savedCallback', runtime = requireRuntime()): void {
  resetTasks(runtime.taskRuntime);
  if (machineIdx >= sReelBiasChances.length) {
    machineIdx = 0;
  }
  runtime.state = createState(machineIdx, savedCallback);
  InitSlotMachineState(runtime.state, runtime);
  runtime.mainCallback2 = 'CB2_InitSlotMachine';
}

export function InitSlotMachineState(ptr: SlotMachineState, runtime = requireRuntime()): void {
  const state = runtime.state ?? ptr;
  ptr.currentReel = 0;
  ptr.bet = 0;
  ptr.payout = 0;
  for (let i = 0; i < NUM_REELS; i += 1) {
    state.reelIsSpinning[i] = false;
    state.reelPositions[i] = 0;
    state.reelSubpixel[i] = 0;
    state.destReelPos[i] = REEL_LENGTH;
  }
}

export function CB2_InitSlotMachine(runtime = requireRuntime()): void {
  runTasks(runtime.taskRuntime);
  switch (runtime.mainState) {
    case 0:
      if (CreateSlotMachine(runtime)) {
        runtime.mainCallback2 = requireState(runtime).savedCallback;
        CleanSupSlotMachineState(runtime);
      } else {
        SetSlotMachineSetupTask(SLOTTASK_GFX_INIT, 0, runtime);
        runtime.mainState += 1;
      }
      break;
    case 1:
      if (!IsSlotMachineSetupTaskActive(0, runtime)) {
        const state = requireState(runtime);
        state.taskId = createTask(runtime.taskRuntime, 'MainTask_SlotsGameLoop', 0);
        state.spinReelsTaskId = createTask(runtime.taskRuntime, 'Task_SpinReels', 1);
        runtime.mainCallback2 = 'CB2_RunSlotMachine';
      }
      break;
  }
}

export function CleanSupSlotMachineState(runtime = requireRuntime()): void {
  DestroySlotMachine(runtime);
  runtime.state = null;
}

export function CB2_RunSlotMachine(runtime = requireRuntime()): void {
  runTasks(runtime.taskRuntime);
  runtime.paletteFadeActive = false;
}

export function MainTask_SlotsGameLoop(taskId: number, runtime = requireRuntime()): void {
  const state = requireState(runtime);
  const data = runtime.taskRuntime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      if (runtime.coins === 0) {
        SetMainTask('MainTask_NoCoinsGameOver', runtime);
      } else if (joyNew(runtime, DPAD_DOWN)) {
        state.bet += 1;
        removeCoins(runtime, 1);
        playSE(runtime, 'SE_RS_SHOP');
        SetSlotMachineSetupTask(SLOTTASK_SHOW_AMOUNTS, 0, runtime);
        SetSlotMachineSetupTask(SLOTTASK_UPDATE_LINE_LIGHTS, 1, runtime);
        data[0] = 1;
      } else if (joyNew(runtime, R_BUTTON)) {
        const toAdd = 3 - state.bet;
        if (runtime.coins >= toAdd) {
          state.bet = 3;
          removeCoins(runtime, toAdd);
        } else {
          state.bet += runtime.coins;
          setCoins(runtime, 0);
        }
        playSE(runtime, 'SE_RS_SHOP');
        SetSlotMachineSetupTask(SLOTTASK_SHOW_AMOUNTS, 0, runtime);
        SetSlotMachineSetupTask(SLOTTASK_UPDATE_LINE_LIGHTS, 1, runtime);
        data[0] = 1;
      } else if (joyNew(runtime, A_BUTTON) && state.bet !== 0) {
        data[0] = 2;
      } else if (joyNew(runtime, B_BUTTON)) {
        SetMainTask('MainTask_ConfirmExitGame', runtime);
      } else if (joyNew(runtime, DPAD_RIGHT)) {
        SetMainTask('MainTask_ShowHelp', runtime);
      }
      break;
    case 1:
      if (!IsSlotMachineSetupTaskActive(0, runtime) && !IsSlotMachineSetupTaskActive(1, runtime)) {
        data[0] = state.bet === 3 || runtime.coins === 0 ? 2 : 0;
      }
      break;
    case 2:
      runtime.qlPlayedTheSlots = true;
      CalcSlotBias(runtime);
      StartReels(runtime);
      state.currentReel = 0;
      SetSlotMachineSetupTask(SLOTTASK_CLEFAIRY_BOUNCE, 0, runtime);
      data[0] = 3;
      break;
    case 3:
      if (!IsSlotMachineSetupTaskActive(0, runtime) && joyNew(runtime, A_BUTTON)) {
        playSE(runtime, 'SE_CONTEST_PLACE');
        StopCurrentReel(state.currentReel, state.currentReel, runtime);
        PressReelButton(state.currentReel, 0, runtime);
        data[0] = 4;
      }
      break;
    case 4:
      if (!IsReelSpinning(state.currentReel, runtime) && !IsSlotMachineSetupTaskActive(0, runtime)) {
        state.currentReel += 1;
        if (state.currentReel >= NUM_REELS) {
          state.slotRewardClass = CalcPayout(runtime);
          state.bet = 0;
          state.currentReel = 0;
          if (state.slotRewardClass === PAYOUT_NONE) {
            SetMainTask('MainTask_DarnNoPayout', runtime);
          } else {
            if (state.slotRewardClass === PAYOUT_7) {
              runtime.gameStats.GAME_STAT_SLOT_JACKPOTS = (runtime.gameStats.GAME_STAT_SLOT_JACKPOTS ?? 0) + 1;
            }
            ResetMachineBias(runtime);
            SetMainTask('MainTask_WinHandlePayout', runtime);
          }
        } else {
          data[0] = 3;
        }
      }
      break;
  }
}

export function MainTask_NoCoinsGameOver(taskId: number, runtime = requireRuntime()): void {
  const data = runtime.taskRuntime.tasks[taskId].data;
  switch (data[0]) {
    case 0: SetSlotMachineSetupTask(SLOTTASK_MSG_NO_COINS, 0, runtime); data[0] += 1; break;
    case 1: if (!IsSlotMachineSetupTaskActive(0, runtime)) data[0] += 1; break;
    case 2: if (joyNew(runtime, A_BUTTON | B_BUTTON | DPAD_ANY)) SetMainTask('MainTask_ExitSlots', runtime); break;
  }
}

export function MainTask_ShowHelp(taskId: number, runtime = requireRuntime()): void {
  const data = runtime.taskRuntime.tasks[taskId].data;
  switch (data[0]) {
    case 0: SetSlotMachineSetupTask(SLOTTASK_SHOWHELP, 0, runtime); data[0] += 1; break;
    case 1: if (!IsSlotMachineSetupTaskActive(0, runtime)) data[0] += 1; break;
    case 2: if (joyNew(runtime, DPAD_LEFT)) { SetSlotMachineSetupTask(SLOTTASK_HIDEHELP, 0, runtime); data[0] += 1; } break;
    case 3: if (!IsSlotMachineSetupTaskActive(0, runtime)) SetMainTask('MainTask_SlotsGameLoop', runtime); break;
  }
}

export function MainTask_ConfirmExitGame(taskId: number, runtime = requireRuntime()): void {
  const data = runtime.taskRuntime.tasks[taskId].data;
  switch (data[0]) {
    case 0: SetSlotMachineSetupTask(SLOTTASK_ASK_QUIT, 0, runtime); data[0] += 1; break;
    case 1: if (!IsSlotMachineSetupTaskActive(0, runtime)) data[0] += 1; break;
    case 2:
      if (runtime.menuInput === 0) {
        addCoins(runtime, requireState(runtime).bet);
        SetSlotMachineSetupTask(SLOTTASK_SHOW_AMOUNTS, 0, runtime);
        data[0] = 3;
      } else if (runtime.menuInput === 1 || runtime.menuInput === -1) {
        SetSlotMachineSetupTask(SLOTTASK_DESTROY_YESNO, 0, runtime);
        data[0] = 4;
      }
      break;
    case 3: if (!IsSlotMachineSetupTaskActive(0, runtime)) SetMainTask('MainTask_ExitSlots', runtime); break;
    case 4: if (!IsSlotMachineSetupTaskActive(0, runtime)) SetMainTask('MainTask_SlotsGameLoop', runtime); break;
  }
}

export function MainTask_DarnNoPayout(taskId: number, runtime = requireRuntime()): void {
  const data = runtime.taskRuntime.tasks[taskId].data;
  switch (data[0]) {
    case 0: SetSlotMachineSetupTask(SLOTTASK_ANIM_LOSE, 0, runtime); data[1] = 0; data[0] += 1; break;
    case 1:
      data[1] += 1;
      if (data[1] > 60) {
        SetSlotMachineSetupTask(SLOTTASK_ANIM_BETTING, 0, runtime);
        SetSlotMachineSetupTask(SLOTTASK_UPDATE_LINE_LIGHTS, 1, runtime);
        SetSlotMachineSetupTask(SLOTTASK_RELEASE_BUTTONS, 2, runtime);
        data[0] += 1;
      }
      break;
    case 2:
      if (!IsSlotMachineSetupTaskActive(0, runtime) && !IsSlotMachineSetupTaskActive(1, runtime) && !IsSlotMachineSetupTaskActive(2, runtime)) {
        SetMainTask('MainTask_SlotsGameLoop', runtime);
      }
      break;
  }
}

export function MainTask_WinHandlePayout(taskId: number, runtime = requireRuntime()): void {
  const state = requireState(runtime);
  const data = runtime.taskRuntime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      playFanfare(runtime, state.slotRewardClass === PAYOUT_ROCKET || state.slotRewardClass === PAYOUT_7 ? 'MUS_SLOTS_JACKPOT' : 'MUS_SLOTS_WIN');
      SetSlotMachineSetupTask(SLOTTASK_SHOW_AMOUNTS, 0, runtime);
      SetSlotMachineSetupTask(SLOTTASK_ANIM_WIN, 1, runtime);
      data[1] = 8;
      data[0] += 1;
      break;
    case 1:
      data[1] += 1;
      if (data[1] > 120) {
        data[1] = joyHeld(runtime, A_BUTTON) ? 2 : 8;
        data[0] += 1;
      }
      break;
    case 2:
      if (!IsSlotMachineSetupTaskActive(0, runtime)) {
        if (isFanfareTaskInactive(runtime) && joyNew(runtime, START_BUTTON)) {
          addCoins(runtime, state.payout);
          state.payout = 0;
        } else {
          data[1] -= 1;
          if (data[1] === 0) {
            if (isFanfareTaskInactive(runtime)) playSE(runtime, 'SE_PIN');
            if (state.payout !== 0) {
              addCoins(runtime, 1);
              state.payout -= 1;
            }
            data[1] = joyHeld(runtime, A_BUTTON) ? 2 : 8;
          }
        }
        SetSlotMachineSetupTask(SLOTTASK_SHOW_AMOUNTS, 0, runtime);
        if (state.payout === 0) data[0] += 1;
      }
      break;
    case 3:
      if (isFanfareTaskInactive(runtime) && !IsSlotMachineSetupTaskActive(0, runtime)) {
        SetSlotMachineSetupTask(SLOTTASK_END_ANIM_WIN, 0, runtime);
        data[0] += 1;
      }
      break;
    case 4:
      if (!IsSlotMachineSetupTaskActive(0, runtime)) {
        SetSlotMachineSetupTask(SLOTTASK_UPDATE_LINE_LIGHTS, 0, runtime);
        SetSlotMachineSetupTask(SLOTTASK_RELEASE_BUTTONS, 1, runtime);
        data[0] += 1;
      }
      break;
    case 5:
      if (!IsSlotMachineSetupTaskActive(0, runtime) && !IsSlotMachineSetupTaskActive(1, runtime)) SetMainTask('MainTask_SlotsGameLoop', runtime);
      break;
  }
}

export function MainTask_ExitSlots(taskId: number, runtime = requireRuntime()): void {
  const data = runtime.taskRuntime.tasks[taskId].data;
  switch (data[0]) {
    case 0: SetSlotMachineSetupTask(SLOTTASK_FADEOUT_EXIT, 0, runtime); data[0] += 1; break;
    case 1:
      if (!IsSlotMachineSetupTaskActive(0, runtime)) {
        runtime.mainCallback2 = requireState(runtime).savedCallback;
        CleanSupSlotMachineState(runtime);
      }
      break;
  }
}

export function SetMainTask(taskFunc: string, runtime = requireRuntime()): void {
  const state = requireState(runtime);
  runtime.taskRuntime.tasks[state.taskId].func = taskFunc;
  runtime.taskRuntime.tasks[state.taskId].data[0] = 0;
}

export function Task_SpinReels(_taskId: number, runtime = requireRuntime()): void {
  const state = requireState(runtime);
  for (let i = 0; i < NUM_REELS; i += 1) {
    if (state.reelIsSpinning[i] || state.reelSubpixel[i] !== 0) {
      if (state.reelSubpixel[i] !== 0 || state.reelPositions[i] !== state.destReelPos[i]) {
        state.reelSubpixel[i] += 1;
        if (state.reelSubpixel[i] > 2) {
          state.reelSubpixel[i] = 0;
          state.reelPositions[i] -= 1;
          if (state.reelPositions[i] < 0) state.reelPositions[i] = REEL_LENGTH - 1;
        }
        if (state.reelPositions[i] !== state.destReelPos[i]) continue;
      }
      state.destReelPos[i] = REEL_LENGTH;
      state.reelIsSpinning[i] = false;
    }
  }
  UpdateReelIconSprites(state.reelPositions, state.reelSubpixel, runtime);
}

export function StartReels(runtime = requireRuntime()): void {
  requireState(runtime).reelIsSpinning.fill(true);
}

export function StopCurrentReel(whichReel: number, whichReel2: number, runtime = requireRuntime()): void {
  if (whichReel2 === 0) StopReel1(whichReel, runtime);
  if (whichReel2 === 1) StopReel2(whichReel, runtime);
  if (whichReel2 === 2) StopReel3(whichReel, runtime);
}

export function IsReelSpinning(whichReel: number, runtime = requireRuntime()): boolean {
  return requireState(runtime).reelIsSpinning[whichReel];
}

export function GetNextReelPosition(whichReel: number, runtime = requireRuntime()): number {
  const state = requireState(runtime);
  let position = state.reelPositions[whichReel];
  if (state.reelSubpixel[whichReel] !== 0) {
    position -= 1;
    if (position < 0) position = REEL_LENGTH - 1;
  }
  return position;
}

export function StopReel1(whichReel: number, runtime = requireRuntime()): void {
  const state = requireState(runtime);
  let destPos = 0;
  const posToSample: number[] = [];
  const nextPos = GetNextReelPosition(whichReel, runtime);
  if (state.machineBias === 0 && whichReel === 0) {
    for (let i = 0; i < 5; i += 1) {
      let j = 0;
      for (destPos = nextPos - i + 1; j < 3; j += 1, destPos += 1) {
        if (destPos >= REEL_LENGTH) destPos = 0;
        if (TestReelIconAttribute(1, sReelIconAnimByReelAndPos[whichReel][destPos])) break;
      }
      if (j === 3) posToSample.push(i);
    }
  } else if (state.machineBias !== 1 || whichReel === 0) {
    for (let i = 0, pos = nextPos + 1; i < 3; i += 1, pos += 1) {
      if (pos >= REEL_LENGTH) pos = 0;
      if (TestReelIconAttribute(state.machineBias, sReelIconAnimByReelAndPos[whichReel][pos])) {
        posToSample[0] = 0;
        break;
      }
    }
    for (let i = 0, pos = nextPos; i < 4; i += 1, pos -= 1) {
      if (pos < 0) pos = REEL_LENGTH - 1;
      if (TestReelIconAttribute(state.machineBias, sReelIconAnimByReelAndPos[whichReel][pos])) posToSample.push(i + 1);
    }
  }
  destPos = posToSample.length === 0 ? random(runtime) % 5 : posToSample[random(runtime) % posToSample.length];
  destPos = nextPos - destPos;
  if (destPos < 0) destPos += REEL_LENGTH;
  state.reelStopOrder[0] = whichReel;
  state.destReelPos[whichReel] = destPos;
}

export function StopReel2(whichReel: number, runtime = requireRuntime()): void {
  const state = requireState(runtime);
  const firstStoppedReelId = state.reelStopOrder[0];
  let firstStoppedReelPos = state.reelPositions[firstStoppedReelId] + 1;
  if (firstStoppedReelPos >= REEL_LENGTH) firstStoppedReelPos = 0;
  const nextPos = GetNextReelPosition(whichReel, runtime);
  let pos = nextPos + 1;
  if (pos >= REEL_LENGTH) pos = 0;
  const possiblePositions: number[] = [];
  for (let i = 0; i < 5; i += 1) {
    if (TwoReelBiasCheck(firstStoppedReelId, firstStoppedReelPos, whichReel, pos, state.machineBias)) possiblePositions.push(i);
    pos -= 1;
    if (pos < 0) pos = REEL_LENGTH - 1;
  }
  if (possiblePositions.length === 0) {
    state.reel2BiasInPlay = 0;
    pos = state.machineBias === PAYOUT_ROCKET || state.machineBias === PAYOUT_7 ? 4 : 0;
  } else {
    state.reel2BiasInPlay = 1;
    pos = possiblePositions[0];
  }
  pos = nextPos - pos;
  if (pos < 0) pos += REEL_LENGTH;
  state.reelStopOrder[1] = whichReel;
  state.destReelPos[whichReel] = pos;
}

export function StopReel3(whichReel: number, runtime = requireRuntime()): void {
  const state = requireState(runtime);
  const nextPos = GetNextReelPosition(whichReel, runtime);
  let testPos = nextPos;
  const possiblePositions: number[] = [];
  for (let i = 0; i < 5; i += 1) {
    if (OneReelBiasCheck(whichReel, testPos, state.machineBias, runtime)) possiblePositions.push(i);
    testPos -= 1;
    if (testPos < 0) testPos = 20;
  }
  let pos = possiblePositions.length === 0
    ? (state.machineBias === PAYOUT_ROCKET || state.machineBias === PAYOUT_7 ? 4 : 0)
    : possiblePositions[0];
  pos = nextPos - pos;
  if (pos < 0) pos += REEL_LENGTH;
  state.destReelPos[whichReel] = pos;
}

export function TwoReelBiasCheck(reel0id: number, reel0pos: number, reel1id: number, reel1pos: number, icon: number): boolean {
  const icons = Array.from({ length: 9 }, () => 7);
  for (let i = 0; i < 3; i += 1) {
    icons[3 * reel0id + i] = sReelIconAnimByReelAndPos[reel0id][reel0pos];
    icons[3 * reel1id + i] = sReelIconAnimByReelAndPos[reel1id][reel1pos];
    reel0pos = (reel0pos + 1) % REEL_LENGTH;
    reel1pos = (reel1pos + 1) % REEL_LENGTH;
  }
  switch (icon) {
    case PAYOUT_NONE:
      for (let i = 0; i < 3; i += 1) if (TestReelIconAttribute(1, icons[i])) return false;
      return sSecondReelBiasCheckIndices.some(([a, b]) => icons[a] === icons[b]);
    case PAYOUT_CHERRIES2:
      if (reel0id === 0 || reel1id === 0) {
        if (reel0id === 1 || reel1id === 1) {
          for (let i = 0; i < 15; i += 3) if (icons[sSecondReelBiasCheckIndices[i][0]] === icons[sSecondReelBiasCheckIndices[i][1]]) return false;
        }
        for (let i = 0; i < 3; i += 1) if (TestReelIconAttribute(icon, icons[i])) return true;
        return false;
      }
      return true;
    case PAYOUT_CHERRIES3:
      if (reel0id === 2 || reel1id === 2) {
        for (let i = 0; i < 9; i += 1) if (TestReelIconAttribute(icon, icons[i])) return true;
        return false;
      }
      break;
  }
  return sSecondReelBiasCheckIndices.some(([a, b]) => icons[a] === icons[b] && TestReelIconAttribute(icon, icons[a]));
}

export function OneReelBiasCheck(reelId: number, reelPos: number, biasIcon: number, runtime = requireRuntime()): boolean {
  const state = requireState(runtime);
  const icons = Array.from({ length: 9 }, () => 0);
  let firstStoppedPos = state.reelPositions[state.reelStopOrder[0]] + 1;
  let secondStoppedPos = state.reelPositions[state.reelStopOrder[1]] + 1;
  reelPos += 1;
  if (firstStoppedPos >= REEL_LENGTH) firstStoppedPos = 0;
  if (secondStoppedPos >= REEL_LENGTH) secondStoppedPos = 0;
  if (reelPos >= REEL_LENGTH) reelPos = 0;
  for (let i = 0; i < 3; i += 1) {
    icons[state.reelStopOrder[0] * 3 + i] = sReelIconAnimByReelAndPos[state.reelStopOrder[0]][firstStoppedPos];
    icons[state.reelStopOrder[1] * 3 + i] = sReelIconAnimByReelAndPos[state.reelStopOrder[1]][secondStoppedPos];
    icons[reelId * 3 + i] = sReelIconAnimByReelAndPos[reelId][reelPos];
    firstStoppedPos = (firstStoppedPos + 1) % REEL_LENGTH;
    secondStoppedPos = (secondStoppedPos + 1) % REEL_LENGTH;
    reelPos = (reelPos + 1) % REEL_LENGTH;
  }
  switch (biasIcon) {
    case PAYOUT_NONE:
      for (let i = 0; i < 3; i += 1) if (TestReelIconAttribute(1, icons[i])) return false;
      for (const [a, b, c] of sThirdReelBiasCheckIndices) if (icons[a] === icons[b] && icons[a] === icons[c]) return false;
      return true;
    case PAYOUT_CHERRIES2:
      for (const [a, b] of sThirdReelBiasCheckIndices) if (icons[a] === icons[b] && TestReelIconAttribute(biasIcon, icons[a])) return false;
      for (let i = 0; i < 3; i += 1) if (TestReelIconAttribute(biasIcon, icons[i])) return true;
      return false;
    case PAYOUT_CHERRIES3:
      return sThirdReelBiasCheckIndices.some(([a, b]) => icons[a] === icons[b] && TestReelIconAttribute(biasIcon, icons[a]));
  }
  return sThirdReelBiasCheckIndices.some(([a, b, c]) => icons[a] === icons[b] && icons[a] === icons[c] && TestReelIconAttribute(biasIcon, icons[a]));
}

export function TestReelIconAttribute(attr: number, icon: number): boolean {
  switch (attr) {
    case PAYOUT_NONE: return (icon ^ 4) ? true : false;
    case PAYOUT_CHERRIES2:
    case PAYOUT_CHERRIES3: return icon === ICON_CHERRIES;
    case PAYOUT_MAGSHELL: return icon === ICON_MAGNEMITE || icon === ICON_SHELLDER;
    case PAYOUT_PIKAPSY: return icon === ICON_PIKACHU || icon === ICON_PSYDUCK;
    case PAYOUT_ROCKET: return icon === ICON_ROCKET;
    case PAYOUT_7: return icon === ICON_7;
    default: return false;
  }
}

export function ReelIconToPayoutRank(iconId: number): number {
  switch (iconId) {
    default:
    case ICON_CHERRIES: return PAYOUT_CHERRIES2;
    case ICON_MAGNEMITE:
    case ICON_SHELLDER: return PAYOUT_MAGSHELL;
    case ICON_PIKACHU:
    case ICON_PSYDUCK: return PAYOUT_PIKAPSY;
    case ICON_ROCKET: return PAYOUT_ROCKET;
    case ICON_7: return PAYOUT_7;
  }
}

export function CalcSlotBias(runtime = requireRuntime()): void {
  const state = requireState(runtime);
  const rval = Math.trunc(random(runtime) / 4);
  const biasChances = sReelBiasChances[state.machineIdx];
  let i = 0;
  for (; i < NUM_PAYOUT_TYPES - 1; i += 1) if (rval < biasChances[i]) break;
  if (state.machineBias < PAYOUT_ROCKET) {
    if (state.biasCooldown === 0 && ((random(runtime) & 0x3fff) < biasChances[PAYOUT_7])) state.biasCooldown = (random(runtime) & 1) ? 5 : 60;
    if (state.biasCooldown !== 0) {
      if (i === 0 && (random(runtime) & 0x3fff) < Math.trunc(0.7 * 0x3fff)) state.biasCooldown = (random(runtime) & 1) ? 5 : 60;
      state.biasCooldown -= 1;
    }
    state.machineBias = i;
  }
}

export function ResetMachineBias(runtime = requireRuntime()): void {
  requireState(runtime).machineBias = 0;
}

export function CalcPayout(runtime = requireRuntime()): number {
  const state = requireState(runtime);
  const visibleIcons = Array.from({ length: 9 }, () => 0);
  state.winFlags.fill(false);
  let bestMatch = 0;
  let reel1pos = state.reelPositions[0];
  let reel2pos = state.reelPositions[1];
  let reel3pos = state.reelPositions[2];
  for (let i = 0; i < 3; i += 1) {
    reel1pos = (reel1pos + 1) % REEL_LENGTH;
    reel2pos = (reel2pos + 1) % REEL_LENGTH;
    reel3pos = (reel3pos + 1) % REEL_LENGTH;
    visibleIcons[i] = sReelIconAnimByReelAndPos[0][reel1pos];
    visibleIcons[3 + i] = sReelIconAnimByReelAndPos[1][reel2pos];
    visibleIcons[6 + i] = sReelIconAnimByReelAndPos[2][reel3pos];
  }
  state.payout = 0;
  for (let i = 0; i < NUM_MATCH_LINES; i += 1) {
    if (state.bet >= sRowAttributes[i][3]) {
      const [col1, col2, col3] = sRowAttributes[i];
      let curMatch = 0;
      if (TestReelIconAttribute(1, visibleIcons[col1])) curMatch = TestReelIconAttribute(2, visibleIcons[col2]) ? 2 : 1;
      else if (visibleIcons[col1] === visibleIcons[col2] && visibleIcons[col1] === visibleIcons[col3]) curMatch = ReelIconToPayoutRank(visibleIcons[col1]);
      if (curMatch !== 0) {
        state.winFlags[i] = true;
        state.payout += sPayoutTable[curMatch];
      }
      if (curMatch > bestMatch) bestMatch = curMatch;
    }
  }
  return bestMatch;
}

export function GetPayout(runtime = requireRuntime()): number { return requireState(runtime).payout; }
export function GetPlayerBet(runtime = requireRuntime()): number { return requireState(runtime).bet; }
export function GetWinFlagByLine(lineId: number, runtime = requireRuntime()): boolean { return requireState(runtime).winFlags[lineId]; }

export function LoadSpriteGraphicsAndAllocateManager(runtime = requireRuntime()): boolean {
  runtime.gfxManager = {
    field_00: Array.from({ length: NUM_REELS }, () => 0),
    reelIconSprites: Array.from({ length: NUM_REELS }, () => Array.from({ length: REEL_LOAD_LENGTH }, () => null)),
    creditDigitSprites: Array.from({ length: NUM_DIGIT_SPRITES }, () => null),
    payoutDigitSprites: Array.from({ length: NUM_DIGIT_SPRITES }, () => null),
    clefairySprites: Array.from({ length: 2 }, () => null),
    reelIconAffineParam: 0x100
  };
  InitGfxManager(runtime.gfxManager);
  return true;
}

export function DestroyGfxManager(runtime = requireRuntime()): void { runtime.gfxManager = null; }

export function InitGfxManager(manager: SlotMachineGfxManager): void {
  for (let i = 0; i < NUM_REELS; i += 1) {
    manager.field_00[i] = 0;
    for (let j = 0; j < REEL_LOAD_LENGTH; j += 1) manager.reelIconSprites[i][j] = null;
  }
}

export function CreateReelIconSprites(runtime = requireRuntime()): void {
  const manager = runtime.gfxManager;
  if (manager === null) return;
  for (let i = 0; i < NUM_REELS; i += 1) {
    for (let j = 0; j < REEL_LOAD_LENGTH; j += 1) {
      const sprite = createSprite(80 + 40 * i, 44 + 24 * j, 2);
      const animId = sReelIconAnimByReelAndPos[i][j];
      startSpriteAnim(sprite, animId);
      sprite.paletteNum = sReelIconPaletteTags[animId];
      sprite.data[0] = i;
      sprite.data[1] = j;
      sprite.data[2] = j;
      sprite.matrixNum = 0;
      manager.reelIconSprites[i][j] = sprite;
      manager.reelIconAffineParam = 0x100;
    }
  }
}

export function UpdateReelIconSprites(reelPosPtr: readonly number[], yposPtr: readonly number[], runtime = requireRuntime()): void {
  const manager = runtime.gfxManager;
  if (manager === null) return;
  for (let i = 0; i < NUM_REELS; i += 1) {
    let reelPos = reelPosPtr[i];
    const ypos = yposPtr[i] * 8;
    for (let j = 0; j < REEL_LOAD_LENGTH; j += 1) {
      const sprite = manager.reelIconSprites[i][j];
      if (sprite !== null) {
        sprite.y2 = ypos;
        const animId = sReelIconAnimByReelAndPos[i][reelPos];
        startSpriteAnim(sprite, animId);
        startSpriteAnim(sprite, animId);
        sprite.paletteNum = sReelIconPaletteTags[animId];
      }
      reelPos = (reelPos + 1) % REEL_LENGTH;
    }
  }
}

export function HBlankCB_SlotMachine(runtime = requireRuntime()): void {
  const manager = runtime.gfxManager;
  if (manager === null) return;
  const vcount = runtime.regVCount - 0x2b;
  if (vcount >= 0 && vcount < 0x54) {
    manager.reelIconAffineParam = sReelIconAffineParams[vcount];
    runtime.regBldy = sReelIconBldY[vcount];
  } else {
    manager.reelIconAffineParam = 0x100;
    runtime.regBldy = 0;
  }
}

export function CreateScoreDigitSprites(runtime = requireRuntime()): void {
  const manager = runtime.gfxManager;
  if (manager === null) return;
  for (let i = 0; i < NUM_DIGIT_SPRITES; i += 1) {
    manager.creditDigitSprites[i] = createSprite(85 + 7 * i, 30, 0);
    manager.payoutDigitSprites[i] = createSprite(133 + 7 * i, 30, 0);
  }
}

export function UpdateCoinsDisplay(runtime = requireRuntime()): void {
  const manager = runtime.gfxManager;
  if (manager === null) return;
  let coins = runtime.coins;
  let payout = GetPayout(runtime);
  let divisor = 1000;
  for (let i = 0; i < NUM_DIGIT_SPRITES; i += 1) {
    let quotient = Math.trunc(coins / divisor);
    startSpriteAnim(manager.creditDigitSprites[i], quotient);
    coins -= quotient * divisor;
    quotient = Math.trunc(payout / divisor);
    startSpriteAnim(manager.payoutDigitSprites[i], quotient);
    payout -= quotient * divisor;
    divisor = Math.trunc(divisor / 10);
  }
}

export function CreateClefairySprites(runtime = requireRuntime()): void {
  const manager = runtime.gfxManager;
  if (manager === null) return;
  manager.clefairySprites[0] = createSprite(16, 136, 1);
  manager.clefairySprites[1] = createSprite(224, 136, 1);
  manager.clefairySprites[1]!.hFlip = true;
}

export function SetClefairySpriteAnim(animId: number, runtime = requireRuntime()): void {
  const manager = runtime.gfxManager;
  if (manager !== null) manager.clefairySprites.forEach((sprite) => startSpriteAnim(sprite, animId));
}

export function CreateSlotMachine(runtime = requireRuntime()): boolean {
  runtime.setupData = {
    tasks: Array.from({ length: 8 }, () => ({ funcno: 0, state: 0, active: false })),
    reelButtonToPress: 0,
    bg1X: 0,
    yesNoMenuActive: false,
    buttonPressedTiles: Array.from({ length: NUM_REELS }, () => Array.from({ length: NUM_BUTTON_TILES }, () => 0)),
    buttonReleasedTiles: Array.from({ length: NUM_REELS }, () => Array.from({ length: NUM_BUTTON_TILES }, () => 0)),
    bg0TilemapBuffer: Array.from({ length: 0x400 }, () => 0),
    bg1TilemapBuffer: Array.from({ length: 0x400 }, () => 0),
    bg2TilemapBuffer: runtime.bgTilemapBuffer2,
    bg3TilemapBuffer: Array.from({ length: 0x400 }, () => 0)
  };
  createTask(runtime.taskRuntime, 'Task_SlotMachine', 2);
  return false;
}

export function DestroySlotMachine(runtime = requireRuntime()): void {
  if (funcIsActiveTask(runtime.taskRuntime, 'Task_SlotMachine')) destroyTask(runtime.taskRuntime, findTaskIdByFunc(runtime.taskRuntime, 'Task_SlotMachine'));
  runtime.setupData = null;
  DestroyGfxManager(runtime);
}

export function Task_SlotMachine(_taskId: number, runtime = requireRuntime()): void {
  const ptr = requireSetup(runtime);
  for (let i = 0; i < ptr.tasks.length; i += 1) {
    if (ptr.tasks[i].active) ptr.tasks[i].active = sSlotMachineSetupTasks[ptr.tasks[i].funcno](ptr.tasks[i], ptr, runtime);
  }
}

export function VBlankCB_SlotMachine(runtime = requireRuntime()): void {
  runtime.gpuRegs.vblankTransfers = (runtime.gpuRegs.vblankTransfers ?? 0) + 1;
}

export function GetSlotMachineSetupTaskDataPtr(runtime = requireRuntime()): SlotMachineSetupTaskData {
  return requireSetup(runtime);
}

export function SetSlotMachineSetupTask(funcno: number, taskId: number, runtime = requireRuntime()): void {
  const ptr = requireSetup(runtime);
  ptr.tasks[taskId].funcno = funcno;
  ptr.tasks[taskId].state = 0;
  ptr.tasks[taskId].active = sSlotMachineSetupTasks[funcno](ptr.tasks[taskId], ptr, runtime);
}

export function IsSlotMachineSetupTaskActive(taskId: number, runtime = requireRuntime()): boolean {
  return requireSetup(runtime).tasks[taskId].active;
}

export function SetBackdropColor(color: number, pal: number[], runtime = requireRuntime()): void {
  pal[0] = color;
  runtime.backdropColor = pal[0];
}

type SetupTaskFunc = (task: SlotMachineSetupTask, ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime) => boolean;

export function SlotsTask_GraphicsInit(task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean {
  switch (task.state) {
    case 0: task.state += 1; break;
    case 1:
      LoadSpriteGraphicsAndAllocateManager(runtime);
      CreateReelIconSprites(runtime);
      CreateScoreDigitSprites(runtime);
      CreateClefairySprites(runtime);
      UpdateCoinsDisplay(runtime);
      task.state += 1;
      break;
    case 2:
      InitReelButtonTileMem(runtime);
      runtime.paletteFadeActive = true;
      task.state += 1;
      break;
    case 3:
      if (!runtime.paletteFadeActive) return false;
      break;
  }
  return true;
}

export function SlotsTask_FadeOut(task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean {
  if (task.state === 0) { runtime.paletteFadeActive = true; task.state += 1; }
  else if (!runtime.paletteFadeActive) return false;
  return true;
}

export function SlotsTask_UpdateLineStates(task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean {
  if (task.state === 0) { SetLineStatesByBet(runtime.bgTilemapBuffer2, runtime); task.state += 1; }
  else if (!runtime.dmaBusy) return false;
  return true;
}

export function SlotsTask_ClefairyUpdateOnReelsStart(_task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean { SetClefairySpriteAnim(1, runtime); return false; }
export function SlotsTask_StartClefairyDanceAndWinningLineFlash(_task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean { SetClefairySpriteAnim(2, runtime); runtime.flashWinningLineTaskId = createTask(runtime.taskRuntime, 'Task_FlashWinningLine', 3); return false; }
export function SlotsTask_StopWinningLineFlashTask(task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean {
  if (task.state === 0) { SignalStopWinningLineFlashTask(runtime); task.state += 1; }
  else if (!funcIsActiveTask(runtime.taskRuntime, 'Task_FlashWinningLine')) { SetClefairySpriteAnim(0, runtime); return false; }
  return true;
}
export function SlotsTask_ClefairyFainted(_task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean { SetClefairySpriteAnim(3, runtime); return false; }
export function SlotsTask_ClefairyNeutral(_task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean { SetClefairySpriteAnim(0, runtime); return false; }
export function SlotsTask_UpdateCoinsDisplay(_task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean { UpdateCoinsDisplay(runtime); return false; }
export function SlotsTask_MessageOutOfCoins(task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean {
  if (task.state === 0) { Slot_PrintOnWindow0('OutOfCoins', runtime); task.state += 1; }
  else if (!runtime.dmaBusy) return false;
  return true;
}
export function SlotsTask_AskQuitPlaying(task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean {
  if (task.state === 0) { Slot_PrintOnWindow0('QuitPlaying', runtime); Slot_CreateYesNoMenu(0, runtime); task.state += 1; }
  else if (!runtime.dmaBusy) return false;
  return true;
}
export function SlotsTask_DestroyYesNoMenu(task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean {
  if (task.state === 0) { Slot_ClearWindow0(runtime); Slot_DestroyYesNoMenu(runtime); task.state += 1; }
  else if (!runtime.dmaBusy) return false;
  return true;
}
export function SlotsTask_PressReelButton(task: SlotMachineSetupTask, ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean {
  if (task.state === 0) { SetReelButtonPressed(ptr.reelButtonToPress, runtime); task.state += 1; }
  else if (!runtime.dmaBusy) return false;
  return true;
}
export function SlotsTask_ReleaseReelButtons(task: SlotMachineSetupTask, _ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean {
  if (task.state === 0) { ReleaseReelButtons(runtime); task.state += 1; }
  else if (!runtime.dmaBusy) return false;
  return true;
}
export function SlotsTask_ShowHelp(task: SlotMachineSetupTask, ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean {
  switch (task.state) {
    case 0: runtime.shownBgs.add(1); playSE(runtime, 'SE_WIN_OPEN'); ptr.bg1X = 0; task.state += 1; break;
    case 1:
      ptr.bg1X += 16;
      if (ptr.bg1X >= 256) { ptr.bg1X = 256; task.state += 1; }
      runtime.gpuRegs.bg1X = 256 * (256 - ptr.bg1X);
      runtime.gpuRegs.win0H = ptr.bg1X;
      break;
    case 2: return false;
  }
  return true;
}
export function SlotsTask_HideHelp(task: SlotMachineSetupTask, ptr: SlotMachineSetupTaskData, runtime: SlotMachineRuntime): boolean {
  switch (task.state) {
    case 0: playSE(runtime, 'SE_WIN_OPEN'); task.state += 1;
    case 1:
      ptr.bg1X -= 16;
      if (ptr.bg1X <= 0) { ptr.bg1X = 0; task.state += 1; }
      runtime.gpuRegs.bg1X = 256 * (256 - ptr.bg1X);
      runtime.gpuRegs.win0H = ptr.bg1X;
      break;
    case 2: runtime.shownBgs.delete(1); task.state += 1; break;
    case 3: return false;
  }
  return true;
}

const sSlotMachineSetupTasks: SetupTaskFunc[] = [
  SlotsTask_GraphicsInit, SlotsTask_FadeOut, SlotsTask_UpdateLineStates, SlotsTask_ClefairyUpdateOnReelsStart,
  SlotsTask_StartClefairyDanceAndWinningLineFlash, SlotsTask_StopWinningLineFlashTask, SlotsTask_ClefairyFainted,
  SlotsTask_ClefairyNeutral, SlotsTask_UpdateCoinsDisplay, SlotsTask_MessageOutOfCoins, SlotsTask_AskQuitPlaying,
  SlotsTask_DestroyYesNoMenu, SlotsTask_PressReelButton, SlotsTask_ReleaseReelButtons, SlotsTask_ShowHelp, SlotsTask_HideHelp
];

export function Slot_PrintOnWindow0(str: string, runtime = requireRuntime()): void { runtime.messages.push(str); }
export function Slot_ClearWindow0(runtime = requireRuntime()): void { runtime.messages.push(''); }

export function SetLineStatesByBet(bgTilemapBuffer: number[], runtime = requireRuntime()): void {
  switch (GetPlayerBet(runtime)) {
    case 0:
      for (let i = 0; i < NUM_MATCH_LINES; i += 1) SetLineState(bgTilemapBuffer, i, PALSLOT_LINE_NORMAL, runtime);
      break;
    case 3:
      SetLineState(bgTilemapBuffer, 0, PALSLOT_LINE_BET, runtime);
      SetLineState(bgTilemapBuffer, 4, PALSLOT_LINE_BET, runtime);
    case 2:
      SetLineState(bgTilemapBuffer, 1, PALSLOT_LINE_BET, runtime);
      SetLineState(bgTilemapBuffer, 3, PALSLOT_LINE_BET, runtime);
    case 1:
      SetLineState(bgTilemapBuffer, 2, PALSLOT_LINE_BET, runtime);
      break;
  }
}

export function SetLineState(bgTilemapBuffer: number[], whichLine: number, paletteNum: number, runtime = requireRuntime()): void {
  const palMask = (paletteNum & 0xf) << 12;
  for (const tileIdx of sLineStateTileIdxs[whichLine]) {
    bgTilemapBuffer[tileIdx] &= 0x0fff;
    bgTilemapBuffer[tileIdx] |= palMask;
  }
  runtime.linePalettes[whichLine] = paletteNum;
}

export function Task_FlashWinningLine(taskId: number, runtime = requireRuntime()): void {
  const data = runtime.taskRuntime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      for (let i = 0; i < NUM_MATCH_LINES; i += 1) if (GetWinFlagByLine(i, runtime)) SetLineState(runtime.bgTilemapBuffer2, i, PALSLOT_LINE_MATCH, runtime);
      data[0] += 1;
      break;
    case 1:
      if (data[1] === 0) { runtime.paletteLoads.push({ target: 1, value: data[2] >> 7 }); data[2] = (data[2] + 32) & 0x7f; data[1] = 8; } else data[1] -= 1;
      if (data[3] === 0) { data[4] = (data[4] + 8) & 0x7f; data[5] = Math.trunc(Math.sin(data[4] / 128 * Math.PI * 2) * 256) >> 5; }
      else { data[4] += 1; if (data[4] > 1) { data[4] = 0; data[5] = (data[5] + 1) & 1; } }
      sWinningLineFlashPalIdxs.forEach((idx) => runtime.paletteLoads.push({ target: PALSLOT_LINE_MATCH, value: idx }));
      break;
    case 2:
      for (let i = 0; i < NUM_MATCH_LINES; i += 1) if (GetWinFlagByLine(i, runtime)) SetLineState(runtime.bgTilemapBuffer2, i, PALSLOT_LINE_NORMAL, runtime);
      data[0] += 1;
      break;
    case 3:
      if (!runtime.dmaBusy) { destroyTask(runtime.taskRuntime, taskId); runtime.flashWinningLineTaskId = null; }
      break;
  }
}

export function SignalStopWinningLineFlashTask(runtime = requireRuntime()): void {
  const taskId = findTaskIdByFunc(runtime.taskRuntime, 'Task_FlashWinningLine');
  if (taskId !== 0xff) runtime.taskRuntime.tasks[taskId].data[0] = 2;
}

export function Slot_CreateYesNoMenu(cursorPos: number, runtime = requireRuntime()): void {
  const data = GetSlotMachineSetupTaskDataPtr(runtime);
  data.yesNoMenuActive = true;
  runtime.menuInput = cursorPos;
}

export function Slot_DestroyYesNoMenu(runtime = requireRuntime()): void {
  const data = GetSlotMachineSetupTaskDataPtr(runtime);
  if (data.yesNoMenuActive) data.yesNoMenuActive = false;
}

export function InitReelButtonTileMem(runtime = requireRuntime()): void {
  const data = GetSlotMachineSetupTaskDataPtr(runtime);
  const buffer = runtime.bgTilemapBuffer2;
  for (let i = 0; i < NUM_REELS; i += 1) {
    for (let j = 0; j < NUM_BUTTON_TILES; j += 1) {
      const idx = sReelButtonMapTileIdxs[i][j];
      data.buttonReleasedTiles[i][j] = buffer[idx];
      data.buttonPressedTiles[i][j] = j + 0xc0;
    }
  }
}

export function SetReelButtonPressed(reel: number, runtime = requireRuntime()): void {
  if (reel < NUM_REELS) {
    const data = GetSlotMachineSetupTaskDataPtr(runtime);
    for (let i = 0; i < NUM_BUTTON_TILES; i += 1) runtime.bgTilemapBuffer2[sReelButtonMapTileIdxs[reel][i]] = data.buttonPressedTiles[reel][i];
  }
}

export function ReleaseReelButtons(runtime = requireRuntime()): void {
  const data = GetSlotMachineSetupTaskDataPtr(runtime);
  for (let i = 0; i < NUM_REELS; i += 1) {
    for (let j = 0; j < NUM_BUTTON_TILES; j += 1) runtime.bgTilemapBuffer2[sReelButtonMapTileIdxs[i][j]] = data.buttonReleasedTiles[i][j];
  }
}

export function PressReelButton(reel: number, taskId: number, runtime = requireRuntime()): void {
  GetSlotMachineSetupTaskDataPtr(runtime).reelButtonToPress = reel;
  SetSlotMachineSetupTask(SLOTTASK_PRESS_BUTTON, taskId, runtime);
}
