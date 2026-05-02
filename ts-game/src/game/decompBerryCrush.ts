import { gBerryCrush_BerryData, FIRST_BERRY_INDEX, LAST_BERRY_INDEX } from './decompBerry';
import {
  createTask,
  createTaskRuntime,
  destroyTask,
  registerTaskCallback,
  runTasks,
  type TaskRuntime
} from './decompTask';

export { FIRST_BERRY_INDEX, LAST_BERRY_INDEX };
export const MAX_RFU_PLAYERS = 5;
export const MAX_TIME = 10 * 60 * 60;
export const CRUSHER_START_Y = -104;
export const RUN_CMD = 0;
export const SCHEDULE_CMD = 1;
export const CMD_NONE = 0;
export const CMD_FADE = 1;
export const CMD_WAIT_FADE = 2;
export const CMD_PRINT_MSG = 3;
export const CMD_SHOW_GAME = 4;
export const CMD_HIDE_GAME = 5;
export const CMD_READY_BEGIN = 6;
export const CMD_ASK_PICK_BERRY = 7;
export const CMD_PICK_BERRY = 8;
export const CMD_WAIT_BERRIES = 9;
export const CMD_DROP_BERRIES = 10;
export const CMD_DROP_LID = 11;
export const CMD_COUNTDOWN = 12;
export const CMD_PLAY_GAME_LEADER = 13;
export const CMD_PLAY_GAME_MEMBER = 14;
export const CMD_FINISH_GAME = 15;
export const CMD_TIMES_UP = 16;
export const CMD_CALC_RESULTS = 17;
export const CMD_SHOW_RESULTS = 18;
export const CMD_SAVE = 19;
export const CMD_ASK_PLAY_AGAIN = 20;
export const CMD_COMM_PLAY_AGAIN = 21;
export const CMD_PLAY_AGAIN_YES = 22;
export const CMD_PLAY_AGAIN_NO = 23;
export const CMD_CLOSE_LINK = 24;
export const CMD_QUIT = 25;
export const STATE_INIT = 1;
export const STATE_RESET = 2;
export const STATE_PICK_BERRY = 3;
export const STATE_DROP_BERRIES = 4;
export const STATE_DROP_LID = 5;
export const STATE_COUNTDOWN = 6;
export const STATE_PLAYING = 7;
export const STATE_FINISHED = 8;
export const STATE_TIMES_UP = 9;
export const STATE_RESULTS_PRESSES = 11;
export const STATE_RESULTS_RANDOM = 12;
export const STATE_RESULTS_CRUSHING = 13;
export const STATE_PLAY_AGAIN = 15;
export const RESULTS_PAGE_PRESSES = 0;
export const RESULTS_PAGE_RANDOM = 1;
export const RESULTS_PAGE_CRUSHING = 2;
export const RESULTS_PAGE_NEATNESS = 0;
export const RESULTS_PAGE_COOPERATIVE = 1;
export const RESULTS_PAGE_POWER = 2;
export const NUM_RANDOM_RESULTS_PAGES = 3;
export const PLAY_AGAIN_YES = 0;
export const PLAY_AGAIN_NO = 1;
export const PLAY_AGAIN_NO_BERRIES = 3;
export const F_INPUT_HIT_A = 1 << 0;
export const F_INPUT_HIT_B = 1 << 1;
export const F_INPUT_HIT_SYNC = 1 << 2;
export const INPUT_FLAGS_PER_PLAYER = 3;
export const INPUT_FLAG_MASK = (1 << INPUT_FLAGS_PER_PLAYER) - 1;
export const INPUT_STATE_NONE = 0;
export const INPUT_STATE_HIT = 1;
export const INPUT_STATE_HIT_SYNC = 2;
export const SEND_GAME_STATE = 2;
export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const RFUCMD_SEND_PACKET = 0x2f00;

export interface BerryCrushPlayer {
  name: string;
  berryId: number;
  inputTime: number;
  neatInputStreak: number;
  timeSincePrevInput: number;
  maxNeatInputStreak: number;
  numAPresses: number;
  numSyncedAPresses: number;
  timePressingA: number;
  inputFlags: number;
  inputState: number;
}

export interface BerryCrushLocalState {
  rfuCmd?: number;
  sendFlag: number;
  endGame: boolean;
  bigSparkle: boolean;
  pushedAButton: boolean;
  playerPressedAFlags: number;
  vibration: number;
  depth: number;
  timer: number;
  inputFlags: number;
  sparkleAmount: number;
}

export interface BerryCrushResults {
  powder: number;
  time: number;
  targetPressesPerSec: number;
  silkiness: number;
  totalAPresses: number;
  stats: number[][];
  playerIdsRanked: number[][];
  randomPageId: number;
}

export interface BerryCrushSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  animPaused: boolean;
  animEnded: boolean;
  inUse: boolean;
  callback: string;
  anim: number;
  affineAnimPaused: boolean;
  priority: number;
}

export interface BerryCrushGfx {
  counter: number;
  vibrationIdx: number;
  numVibrations: number;
  vibrating: boolean;
  minutes: number;
  secondsInt: number;
  secondsFrac: number;
  playerCoords: BerryCrushPlayerCoords[];
  coreSprite: BerryCrushSprite | null;
  impactSprites: BerryCrushSprite[];
  berrySprites: (BerryCrushSprite | null)[];
  sparkleSprites: BerryCrushSprite[];
  timerSprites: BerryCrushSprite[];
  resultsState: number;
  resultsWindowId: number;
  nameWindowIds: number[];
  bgBuffers: number[][];
}

export interface BerryCrushPlayerCoords {
  playerId: number;
  windowGfxX: number;
  windowGfxY: number;
  impactXOffset: number;
  impactYOffset: number;
  berryXOffset: number;
  berryXDest: number;
}

export interface BerryCrushGame {
  savedCallback: string;
  cmdCallback: number;
  localId: number;
  playerCount: number;
  mainTask: number;
  textSpeed: number;
  cmdState: number;
  unused: number;
  nextCmd: number;
  afterPalFadeCmd: number;
  cmdTimer: number;
  gameState: number;
  playAgainState: number;
  pressingSpeed: number;
  targetAPresses: number;
  totalAPresses: number;
  powder: number;
  targetDepth: number;
  newDepth: number;
  noRoomForPowder: boolean;
  newRecord: boolean;
  playedSound: boolean;
  endGame: boolean;
  bigSparkle: boolean;
  sparkleAmount: number;
  leaderTimer: number;
  timer: number;
  depth: number;
  vibration: number;
  bigSparkleCounter: number;
  numBigSparkles: number;
  numBigSparkleChecks: number;
  sparkleCounter: number;
  commandParams: number[];
  sendCmd: number[];
  recvCmd: number[];
  localState: BerryCrushLocalState;
  results: BerryCrushResults;
  players: BerryCrushPlayer[];
  gfx: BerryCrushGfx;
}

export interface BerryCrushRuntime {
  taskRuntime: TaskRuntime;
  game: BerryCrushGame | null;
  mainCallback2: string;
  mainCallback1: string;
  receivedRemoteLinkPlayers: boolean;
  wirelessCommType: number;
  linkPlayerCount: number;
  multiplayerId: number;
  linkPlayers: string[];
  optionsTextSpeed: number;
  specialVarItemId: number;
  bagRemoved: Array<{ itemId: number; count: number }>;
  berryPowder: number;
  berryPowderCapacity: number;
  savePressingSpeeds: number[];
  recvCmds: BerryCrushLocalState[];
  blockRecvBuffer: unknown[];
  blockReceivedStatus: number;
  linkTaskFinished: boolean;
  paletteFadeActive: boolean;
  newKeys: number;
  heldKeys: number;
  menuInput: number;
  hasAtLeastOneBerry: boolean;
  randomValues: number[];
  logs: string[];
  sounds: string[];
  windows: string[];
  gpuRegs: Record<string, number>;
  spriteCoordOffsetY: number;
  fieldControlsLocked: boolean;
  scriptContextEnabled: boolean;
}

const sBitTable = [1, 2, 4, 8, 16, 32, 64, 128] as const;
const sSyncPressBonus = [0, 1, 2, 3, 5] as const;
const sVibrationData = [[3, 2, 1, 0], [3, 3, 1, 0], [3, 3, 2, 0], [3, 4, 2, 0], [3, 5, 3, 0]] as const;
const sIntroOutroVibrationData = [[4, 1, 0, -1, 0, 0, 0], [4, 2, 0, -1, 0, 0, 0], [4, 2, 0, -2, 0, 0, 0], [6, 3, 1, -1, -3, -1, 0], [6, 4, 1, -2, -4, -2, 0]] as const;
const sSparkleThresholds = [[2, 4, 6, 7], [3, 5, 8, 11], [3, 7, 11, 15], [4, 8, 12, 17]] as const;
const sBigSparkleThresholds = [5, 7, 9, 12] as const;
const sReceivedPlayerBitmasks = [0x03, 0x07, 0x0f, 0x1f] as const;
const sPressingSpeedConversionTable = [50000000, 25000000, 12500000, 6250000, 3125000, 1562500, 781250, 390625] as const;
const sPlayerIdToPosId = [[1, 3], [0, 1, 3], [1, 3, 2, 4], [0, 1, 3, 2, 4]] as const;
const sPlayerCoords: BerryCrushPlayerCoords[] = [
  { playerId: 0, windowGfxX: 0, windowGfxY: 0, impactXOffset: 0, impactYOffset: -16, berryXOffset: 0, berryXDest: 0 },
  { playerId: 1, windowGfxX: 0, windowGfxY: 3, impactXOffset: -28, impactYOffset: -4, berryXOffset: -24, berryXDest: 16 },
  { playerId: 2, windowGfxX: 0, windowGfxY: 6, impactXOffset: -16, impactYOffset: 20, berryXOffset: -8, berryXDest: 16 },
  { playerId: 3, windowGfxX: 20, windowGfxY: 3, impactXOffset: 28, impactYOffset: -4, berryXOffset: 32, berryXDest: -8 },
  { playerId: 4, windowGfxX: 20, windowGfxY: 6, impactXOffset: 16, impactYOffset: 20, berryXOffset: 16, berryXDest: -8 }
];
const sImpactCoords = [[0, 0], [-1, 0], [1, 1]] as const;
const sSparkleCoords = [[0, 0], [-16, -4], [16, -4], [-8, -2], [8, -2], [-24, -8], [24, -8], [-32, -12], [32, -12], [-40, -16], [40, -16]] as const;

let activeRuntime: BerryCrushRuntime | null = null;
const q8 = (n: number): number => Math.trunc(n * 256);
const q8Div = (a: number, b: number): number => b === 0 ? 0 : Math.trunc((a * 256) / b);
const q8Mul = (a: number, b: number): number => Math.trunc((a * b) / 256);
const q8ToInt = (n: number): number => n >> 8;
const rand = (runtime: BerryCrushRuntime): number => runtime.randomValues.shift() ?? 0;
const joyNew = (runtime: BerryCrushRuntime, mask: number): boolean => (runtime.newKeys & mask) !== 0;
const joyHeld = (runtime: BerryCrushRuntime, mask: number): boolean => (runtime.heldKeys & mask) !== 0;
const requireRuntime = (runtime?: BerryCrushRuntime): BerryCrushRuntime => {
  const resolved = runtime ?? activeRuntime;
  if (resolved === null) throw new Error('Berry Crush runtime is not active');
  return resolved;
};
const requireGame = (runtime?: BerryCrushRuntime): BerryCrushGame => {
  const game = requireRuntime(runtime).game;
  if (game === null) throw new Error('Berry Crush game is not allocated');
  return game;
};
const createSprite = (x = 0, y = 0): BerryCrushSprite => ({ x, y, x2: 0, y2: 0, data: Array.from({ length: 8 }, () => 0), invisible: false, animPaused: false, animEnded: false, inUse: true, callback: 'SpriteCallbackDummy', anim: 0, affineAnimPaused: false, priority: 0 });
const createLocalState = (): BerryCrushLocalState => ({ sendFlag: 0, endGame: false, bigSparkle: false, pushedAButton: false, playerPressedAFlags: 0, vibration: 0, depth: 0, timer: 0, inputFlags: 0, sparkleAmount: 0 });
const createResults = (): BerryCrushResults => ({ powder: 0, time: 0, targetPressesPerSec: 0, silkiness: 0, totalAPresses: 0, stats: [Array.from({ length: MAX_RFU_PLAYERS }, () => 0), Array.from({ length: MAX_RFU_PLAYERS }, () => 0)], playerIdsRanked: [Array.from({ length: MAX_RFU_PLAYERS + 3 }, () => 0), Array.from({ length: MAX_RFU_PLAYERS + 3 }, () => 0)], randomPageId: 0 });
const createGfx = (): BerryCrushGfx => ({ counter: 0, vibrationIdx: 0, numVibrations: 0, vibrating: false, minutes: 0, secondsInt: 0, secondsFrac: 0, playerCoords: [], coreSprite: null, impactSprites: [], berrySprites: Array.from({ length: MAX_RFU_PLAYERS }, () => null), sparkleSprites: Array.from({ length: 11 }, () => createSprite()), timerSprites: [createSprite(), createSprite()], resultsState: 0, resultsWindowId: 0, nameWindowIds: Array.from({ length: MAX_RFU_PLAYERS }, () => 0), bgBuffers: Array.from({ length: 4 }, () => Array.from({ length: 0x800 }, () => 0)) });
const createPlayer = (name: string): BerryCrushPlayer => ({ name, berryId: -1, inputTime: 0, neatInputStreak: 0, timeSincePrevInput: 1, maxNeatInputStreak: 0, numAPresses: 0, numSyncedAPresses: 0, timePressingA: 0, inputFlags: 0, inputState: INPUT_STATE_NONE });
const createGame = (runtime: BerryCrushRuntime, savedCallback: string): BerryCrushGame => ({ savedCallback, cmdCallback: CMD_NONE, localId: runtime.multiplayerId, playerCount: runtime.linkPlayerCount, mainTask: 0, textSpeed: 1, cmdState: 0, unused: 0, nextCmd: CMD_NONE, afterPalFadeCmd: CMD_NONE, cmdTimer: 0, gameState: STATE_INIT, playAgainState: PLAY_AGAIN_YES, pressingSpeed: 0, targetAPresses: 0, totalAPresses: 0, powder: 0, targetDepth: 0, newDepth: 0, noRoomForPowder: false, newRecord: false, playedSound: false, endGame: false, bigSparkle: false, sparkleAmount: 0, leaderTimer: 0, timer: 0, depth: CRUSHER_START_Y, vibration: 0, bigSparkleCounter: 0, numBigSparkles: 0, numBigSparkleChecks: -1, sparkleCounter: 0, commandParams: Array.from({ length: 12 }, () => 0), sendCmd: Array.from({ length: 6 }, () => 0), recvCmd: Array.from({ length: 7 }, () => 0), localState: createLocalState(), results: createResults(), players: Array.from({ length: MAX_RFU_PLAYERS }, (_, i) => createPlayer(runtime.linkPlayers[i] ?? '')), gfx: createGfx() });

export const createBerryCrushRuntime = (): BerryCrushRuntime => {
  const runtime: BerryCrushRuntime = { taskRuntime: createTaskRuntime(), game: null, mainCallback2: '', mainCallback1: '', receivedRemoteLinkPlayers: true, wirelessCommType: 1, linkPlayerCount: 2, multiplayerId: 0, linkPlayers: ['PLAYER', 'LINK'], optionsTextSpeed: 2, specialVarItemId: FIRST_BERRY_INDEX, bagRemoved: [], berryPowder: 0, berryPowderCapacity: 999999, savePressingSpeeds: [0, 0, 0, 0], recvCmds: Array.from({ length: MAX_RFU_PLAYERS }, () => createLocalState()), blockRecvBuffer: [], blockReceivedStatus: 0, linkTaskFinished: true, paletteFadeActive: false, newKeys: 0, heldKeys: 0, menuInput: -2, hasAtLeastOneBerry: true, randomValues: [], logs: [], sounds: [], windows: [], gpuRegs: {}, spriteCoordOffsetY: 0, fieldControlsLocked: false, scriptContextEnabled: false };
  registerTaskCallback(runtime.taskRuntime, 'MainTask', (taskId) => MainTask(taskId, runtime));
  registerTaskCallback(runtime.taskRuntime, 'Task_ShowBerryCrushRankings', (taskId) => Task_ShowBerryCrushRankings(taskId, runtime));
  activeRuntime = runtime;
  return runtime;
};

export function GetBerryCrushGame(runtime = requireRuntime()): BerryCrushGame | null { return runtime.game; }
export function QuitBerryCrush(callback?: string, runtime = requireRuntime()): number {
  if (runtime.game === null) return 2;
  const cb = callback ?? runtime.game.savedCallback;
  destroyTask(runtime.taskRuntime, runtime.game.mainTask);
  runtime.game = null;
  runtime.mainCallback2 = cb;
  if (cb === 'CB2_ReturnToField') runtime.mainCallback1 = 'CB1_Overworld';
  return 0;
}
export function StartBerryCrush(callback = 'savedCallback', runtime = requireRuntime()): void {
  if (!runtime.receivedRemoteLinkPlayers || runtime.wirelessCommType === 0 || runtime.linkPlayerCount < 2 || runtime.multiplayerId >= runtime.linkPlayerCount) {
    runtime.mainCallback2 = callback;
    runtime.logs.push('ERROR_EXIT');
    return;
  }
  runtime.game = createGame(runtime, callback);
  SetNamesAndTextSpeed(runtime.game, runtime);
  runtime.game.nextCmd = CMD_FADE;
  runtime.game.afterPalFadeCmd = CMD_READY_BEGIN;
  SetPaletteFadeArgs(runtime.game.commandParams, true, 0xffffffff, 0, 16, 0, 0);
  RunOrScheduleCommand(CMD_SHOW_GAME, SCHEDULE_CMD, runtime.game.commandParams, runtime);
  runtime.mainCallback2 = 'MainCB';
  runtime.game.mainTask = createTask(runtime.taskRuntime, 'MainTask', 8);
}
export function GetBerryFromBag(runtime = requireRuntime()): void {
  const game = requireGame(runtime);
  if (runtime.specialVarItemId < FIRST_BERRY_INDEX || runtime.specialVarItemId > LAST_BERRY_INDEX + 1) runtime.specialVarItemId = FIRST_BERRY_INDEX;
  else runtime.bagRemoved.push({ itemId: runtime.specialVarItemId, count: 1 });
  game.players[game.localId].berryId = runtime.specialVarItemId - FIRST_BERRY_INDEX;
  game.nextCmd = CMD_FADE;
  game.afterPalFadeCmd = CMD_WAIT_BERRIES;
  SetPaletteFadeArgs(game.commandParams, false, 0xffffffff, 0, 16, 0, 0);
  RunOrScheduleCommand(CMD_SHOW_GAME, SCHEDULE_CMD, game.commandParams, runtime);
  game.mainTask = createTask(runtime.taskRuntime, 'MainTask', 8);
  runtime.mainCallback2 = 'MainCB';
}
export function ChooseBerry(runtime = requireRuntime()): void { destroyTask(runtime.taskRuntime, requireGame(runtime).mainTask); runtime.mainCallback2 = 'ChooseBerry'; }
export function BerryCrush_SetVBlankCallback(runtime = requireRuntime()): void { runtime.logs.push('SetVBlankCallback:VBlankCB'); }
export function BerryCrush_InitVBlankCB(runtime = requireRuntime()): void { runtime.logs.push('SetVBlankCallback:NULL'); }
export function SaveResults(runtime = requireRuntime()): void {
  const game = requireGame(runtime);
  const time = q8Div(q8(game.results.time), q8(60));
  game.pressingSpeed = q8Div(q8(game.results.totalAPresses), time) & 0xffff;
  const idx = game.playerCount - 2;
  if (idx >= 0 && idx < 4 && game.pressingSpeed > runtime.savePressingSpeeds[idx]) { game.newRecord = true; runtime.savePressingSpeeds[idx] = game.pressingSpeed; }
  game.powder = game.results.powder;
  if (runtime.berryPowder + game.powder <= runtime.berryPowderCapacity) runtime.berryPowder += game.powder;
  else game.noRoomForPowder = true;
}
export function VBlankCB(runtime = requireRuntime()): void { runtime.logs.push('VBlankCB'); }
export function MainCB(runtime = requireRuntime()): void { runTasks(runtime.taskRuntime); }
export function MainTask(_taskId: number, runtime = requireRuntime()): void { const game = requireGame(runtime); if (game.cmdCallback !== CMD_NONE) sBerryCrushCommands[game.cmdCallback](game, game.commandParams, runtime); UpdateGame(game, runtime); }
export function SetNamesAndTextSpeed(game: BerryCrushGame, runtime = requireRuntime()): void {
  for (let i = 0; i < MAX_RFU_PLAYERS; i += 1) game.players[i].name = i < game.playerCount ? (runtime.linkPlayers[i] ?? '') : '\x01'.repeat(7);
  game.textSpeed = runtime.optionsTextSpeed === 0 ? 8 : runtime.optionsTextSpeed === 1 ? 4 : 1;
}
export function RunOrScheduleCommand(command: number, runMode: number, args: number[] | null, runtime = requireRuntime()): void {
  const game = requireGame(runtime);
  if (command >= sBerryCrushCommands.length) command = CMD_NONE;
  if (runMode === RUN_CMD) {
    if (command !== CMD_NONE) sBerryCrushCommands[command](game, args ?? game.commandParams, runtime);
    if (game.nextCmd >= sBerryCrushCommands.length) game.nextCmd = CMD_NONE;
    game.cmdCallback = game.nextCmd;
  } else game.cmdCallback = command;
}
export function Cmd_BeginNormalPaletteFade(game: BerryCrushGame, args: number[], runtime = requireRuntime()): number { args[0] |= args[1] << 8 | args[2] << 16 | args[3] << 24; runtime.paletteFadeActive = true; game.nextCmd = CMD_WAIT_FADE; return 0; }
export function Cmd_WaitPaletteFade(game: BerryCrushGame, args: number[], runtime = requireRuntime()): number {
  if (game.cmdState === 0) { if (runtime.paletteFadeActive) return 0; game.cmdState = args[0] ? 1 : 3; return 0; }
  if (game.cmdState === 1) { game.cmdState += 1; return 0; }
  if (game.cmdState === 2 && !runtime.linkTaskFinished) return 0;
  if (game.cmdState === 3) { RunOrScheduleCommand(game.afterPalFadeCmd, SCHEDULE_CMD, null, runtime); game.cmdState = 0; return 0; }
  game.cmdState += 1; return 0;
}
export function Cmd_PrintMessage(game: BerryCrushGame, args: number[], runtime = requireRuntime()): number {
  const keys = args[2] | (args[3] << 8);
  if (game.cmdState === 0) runtime.windows.push(`msg:${args[0]}:${args[1]}`);
  else if (game.cmdState === 1 && keys === 0) game.cmdState += 1;
  else if (game.cmdState === 2 && !joyNew(runtime, keys)) return 0;
  else if (game.cmdState === 3) { RunOrScheduleCommand(game.nextCmd, SCHEDULE_CMD, null, runtime); game.cmdState = args[4]; return 0; }
  game.cmdState += 1; return 0;
}
export function Cmd_ShowGameDisplay(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (ShowGameDisplay(runtime)) RunOrScheduleCommand(game.nextCmd, RUN_CMD, game.commandParams, runtime); return 0; }
export function Cmd_HideGameDisplay(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (HideGameDisplay(runtime)) RunOrScheduleCommand(game.nextCmd, RUN_CMD, game.commandParams, runtime); return 0; }
export function Cmd_SignalReadyToBegin(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (game.cmdState === 1 && runtime.linkTaskFinished) { runtime.sounds.push('MUS_GAME_CORNER'); RunOrScheduleCommand(CMD_ASK_PICK_BERRY, SCHEDULE_CMD, null, runtime); game.gameState = STATE_PICK_BERRY; game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function Cmd_AskPickBerry(game: BerryCrushGame, args: number[], runtime = requireRuntime()): number { if (game.cmdState === 0) { ResetGame(game, runtime); SetPrintMessageArgs(args, 0, 1, 0, CMD_FADE); game.nextCmd = CMD_ASK_PICK_BERRY; RunOrScheduleCommand(CMD_PRINT_MSG, SCHEDULE_CMD, null, runtime); } else if (game.cmdState === 1) { game.nextCmd = CMD_PICK_BERRY; RunOrScheduleCommand(CMD_HIDE_GAME, SCHEDULE_CMD, null, runtime); game.cmdState = 2; } else game.cmdState += 1; return 0; }
export function Cmd_GoToBerryPouch(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { game.cmdCallback = CMD_NONE; runtime.mainCallback2 = 'ChooseBerry'; return 0; }
export function Cmd_WaitForOthersToPickBerries(game: BerryCrushGame, args: number[], runtime = requireRuntime()): number {
  if (game.cmdState === 0) { SetPrintMessageArgs(args, 1, 0, 0, CMD_FADE); game.nextCmd = CMD_WAIT_BERRIES; RunOrScheduleCommand(CMD_PRINT_MSG, SCHEDULE_CMD, null, runtime); return 0; }
  if (game.cmdState === 4) {
    if (runtime.blockReceivedStatus !== sReceivedPlayerBitmasks[game.playerCount - 2]) return 0;
    for (let i = 0; i < game.playerCount; i += 1) { const berryId = Number(runtime.blockRecvBuffer[i] ?? 0); game.players[i].berryId = berryId > LAST_BERRY_INDEX + 1 ? 0 : berryId; game.targetAPresses += gBerryCrush_BerryData[game.players[i].berryId]?.difficulty ?? 0; game.powder += gBerryCrush_BerryData[game.players[i].berryId]?.powder ?? 0; }
    game.targetDepth = q8Div(q8(game.targetAPresses), q8(32)); runtime.blockReceivedStatus = 0;
  }
  if (game.cmdState === 5) { RunOrScheduleCommand(CMD_DROP_BERRIES, SCHEDULE_CMD, null, runtime); game.gameState = STATE_DROP_BERRIES; game.cmdState = 0; return 0; }
  game.cmdState += 1; return 0;
}
export function Cmd_DropBerriesIntoCrusher(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (game.cmdState === 0) CreateBerrySprites(game, game.gfx); if (game.cmdState === 6) { runtime.sounds.push('SE_FALL'); RunOrScheduleCommand(CMD_DROP_LID, SCHEDULE_CMD, null, runtime); game.gameState = STATE_DROP_LID; game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function Cmd_DropLid(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (game.cmdState === 0) { game.depth += 4; if (game.depth < 0) return 0; game.depth = 0; game.gfx.vibrationIdx = 4; game.gfx.counter = 0; game.gfx.numVibrations = sIntroOutroVibrationData[4][0]; runtime.sounds.push('SE_M_STRENGTH'); } else if (game.cmdState === 3) { RunOrScheduleCommand(CMD_COUNTDOWN, SCHEDULE_CMD, null, runtime); game.gameState = STATE_COUNTDOWN; game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function Cmd_Countdown(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (game.cmdState === 3) { game.gfx.counter = 0; game.gfx.vibrating = false; game.cmdTimer = 0; RunOrScheduleCommand(game.localId === 0 ? CMD_PLAY_GAME_LEADER : CMD_PLAY_GAME_MEMBER, SCHEDULE_CMD, null, runtime); game.gameState = STATE_PLAYING; game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function HandlePartnerInput(game: BerryCrushGame, runtime = requireRuntime()): void {
  let numPlayersPressed = 0;
  for (let i = 0; i < game.playerCount; i += 1) {
    const linkState = runtime.recvCmds[i];
    if ((linkState.rfuCmd ?? RFUCMD_SEND_PACKET) !== RFUCMD_SEND_PACKET || linkState.sendFlag !== SEND_GAME_STATE) continue;
    if (linkState.pushedAButton) {
      game.localState.playerPressedAFlags |= sBitTable[i]; game.players[i].inputState = INPUT_STATE_HIT; game.players[i].numAPresses += 1; numPlayersPressed += 1;
      const timeDiff = game.timer - game.players[i].inputTime;
      if (timeDiff >= game.players[i].timeSincePrevInput - 1 && timeDiff <= game.players[i].timeSincePrevInput + 1) { game.players[i].neatInputStreak += 1; game.players[i].timeSincePrevInput = timeDiff; if (game.players[i].neatInputStreak > game.players[i].maxNeatInputStreak) game.players[i].maxNeatInputStreak = game.players[i].neatInputStreak; } else { game.players[i].neatInputStreak = 0; game.players[i].timeSincePrevInput = timeDiff; }
      game.players[i].inputTime = game.timer; game.players[i].inputFlags += 1; if (game.players[i].inputFlags > F_INPUT_HIT_B) game.players[i].inputFlags = 0;
    } else game.players[i].inputState = INPUT_STATE_NONE;
  }
  if (numPlayersPressed > 1) for (let i = 0; i < game.playerCount; i += 1) if (game.players[i].inputState !== INPUT_STATE_NONE) { game.players[i].inputState |= INPUT_STATE_HIT_SYNC; game.players[i].numSyncedAPresses += 1; }
  if (numPlayersPressed === 0) return;
  game.bigSparkleCounter += numPlayersPressed; numPlayersPressed += sSyncPressBonus[numPlayersPressed - 1]; game.sparkleCounter += numPlayersPressed; game.totalAPresses += numPlayersPressed;
  if (game.targetAPresses - game.totalAPresses > 0) game.newDepth = q8ToInt(q8Div(q8(game.totalAPresses), game.targetDepth));
  else { game.newDepth = 32; game.localState.endGame = true; }
}
export function BerryCrush_BuildLocalState(game: BerryCrushGame): void {
  let numPlayersPressed = 0; let r1 = 0; game.localState.inputFlags = 0;
  for (let i = 0; i < game.playerCount; i += 1) if (game.players[i].inputState !== 0) { numPlayersPressed += 1; r1 = game.players[i].inputFlags + 1; if (game.players[i].inputState & 2) r1 |= 4; game.localState.inputFlags |= r1 << (3 * i); }
  game.localState.depth = game.newDepth;
  if (numPlayersPressed === 0) { if (game.gfx.vibrating) game.gfx.counter += 1; }
  else if (game.gfx.vibrating) { if (numPlayersPressed !== game.gfx.vibrationIdx) { game.gfx.vibrationIdx = numPlayersPressed - 1; game.gfx.numVibrations = sVibrationData[numPlayersPressed - 1][0]; } else game.gfx.counter += 1; }
  else { game.gfx.counter = 0; game.gfx.vibrationIdx = numPlayersPressed - 1; game.gfx.numVibrations = sVibrationData[numPlayersPressed - 1][0]; game.gfx.vibrating = true; }
  if (game.gfx.vibrating) { if (game.gfx.counter >= game.gfx.numVibrations) { game.gfx.counter = 0; game.gfx.vibrationIdx = 0; game.gfx.numVibrations = 0; game.gfx.vibrating = false; r1 = 0; } else r1 = sVibrationData[game.gfx.vibrationIdx][game.gfx.counter + 1]; game.localState.vibration = r1; } else game.localState.vibration = 0;
  game.localState.timer = game.leaderTimer;
}
export function HandlePlayerInput(game: BerryCrushGame, runtime = requireRuntime()): void {
  if (joyNew(runtime, A_BUTTON)) game.localState.pushedAButton = true;
  if (joyHeld(runtime, A_BUTTON) && game.players[game.localId].timePressingA < game.timer) game.players[game.localId].timePressingA += 1;
  if (game.localId !== 0 && !game.localState.pushedAButton) return;
  game.localState.sendFlag = SEND_GAME_STATE;
  if (game.timer % 30 === 0) { game.bigSparkle = game.bigSparkleCounter > sBigSparkleThresholds[game.playerCount - 2]; if (game.bigSparkle) game.numBigSparkles += 1; game.bigSparkleCounter = 0; game.numBigSparkleChecks += 1; }
  if (game.timer % 15 === 0) { if (game.sparkleCounter < sSparkleThresholds[game.playerCount - 2][0]) game.sparkleAmount = 0; else if (game.sparkleCounter < sSparkleThresholds[game.playerCount - 2][1]) game.sparkleAmount = 1; else if (game.sparkleCounter < sSparkleThresholds[game.playerCount - 2][2]) game.sparkleCounter = 2; else if (game.sparkleCounter < sSparkleThresholds[game.playerCount - 2][3]) game.sparkleCounter = 3; else game.sparkleAmount = 4; game.sparkleCounter = 0; } else game.cmdTimer += 1;
  if (game.timer >= MAX_TIME) game.localState.endGame = true;
  game.localState.bigSparkle = game.bigSparkle; game.localState.sparkleAmount = game.sparkleAmount; game.sendCmd = [game.localState.sendFlag, Number(game.localState.endGame), Number(game.localState.bigSparkle), Number(game.localState.pushedAButton), game.localState.depth, game.localState.inputFlags];
}
export function RecvLinkData(game: BerryCrushGame, runtime = requireRuntime()): void { game.players.forEach((p) => { p.inputState = INPUT_STATE_NONE; }); const linkState = runtime.recvCmds[0]; if ((linkState.rfuCmd ?? RFUCMD_SEND_PACKET) !== RFUCMD_SEND_PACKET || linkState.sendFlag !== SEND_GAME_STATE) { game.playedSound = false; return; } game.depth = linkState.depth; game.vibration = linkState.vibration; game.timer = linkState.timer; game.recvCmd = [linkState.sendFlag, Number(linkState.endGame), Number(linkState.bigSparkle), Number(linkState.pushedAButton), linkState.depth, linkState.inputFlags, linkState.sparkleAmount]; UpdateInputEffects(game, game.gfx, runtime); if (linkState.endGame) game.endGame = true; }
export function Cmd_PlayGame_Leader(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { game.localState = createLocalState(); RecvLinkData(game, runtime); if (game.endGame) { RunOrScheduleCommand(game.timer >= MAX_TIME ? CMD_TIMES_UP : CMD_FINISH_GAME, SCHEDULE_CMD, null, runtime); game.cmdTimer = 0; game.cmdState = 0; return 0; } game.leaderTimer += 1; HandlePartnerInput(game, runtime); BerryCrush_BuildLocalState(game); HandlePlayerInput(game, runtime); return 0; }
export function Cmd_PlayGame_Member(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { game.localState = createLocalState(); RecvLinkData(game, runtime); if (game.endGame) { RunOrScheduleCommand(game.timer >= MAX_TIME ? CMD_TIMES_UP : CMD_FINISH_GAME, SCHEDULE_CMD, null, runtime); game.cmdTimer = 0; game.cmdState = 0; return 0; } HandlePlayerInput(game, runtime); return 0; }
export function Cmd_FinishGame(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (game.cmdState === 0) { game.gameState = STATE_FINISHED; runtime.sounds.push('SE_M_STRENGTH'); game.gfx.counter = 2; } if (game.cmdState === 5) { RunOrScheduleCommand(CMD_CALC_RESULTS, SCHEDULE_CMD, null, runtime); game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function Cmd_HandleTimeUp(game: BerryCrushGame, args: number[], runtime = requireRuntime()): number { if (game.cmdState === 0) { game.gameState = STATE_TIMES_UP; runtime.sounds.push('SE_FAILURE'); game.gfx.counter = 4; } if (game.cmdState === 3) { SetPrintMessageArgs(args, 7, 1, 0, CMD_NONE); game.nextCmd = CMD_SAVE; RunOrScheduleCommand(CMD_PRINT_MSG, SCHEDULE_CMD, null, runtime); game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function Cmd_TabulateResults(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number {
  if (game.cmdState === 3) {
    game.results = createResults(); game.results.time = game.timer; game.results.targetPressesPerSec = Math.trunc(game.targetAPresses / Math.max(1, Math.trunc(game.timer / 60)));
    let silk = q8ToInt(q8Div(q8Mul(q8(game.numBigSparkles), q8(50)), q8(Math.max(1, game.numBigSparkleChecks))) + q8(50)); game.results.silkiness = silk & 0x7f;
    game.results.powder = q8ToInt(q8Mul(q8(game.powder * game.playerCount), q8Div(q8(silk), q8(100)))); game.results.randomPageId = rand(runtime) % NUM_RANDOM_RESULTS_PAGES;
    for (let i = 0; i < game.playerCount; i += 1) { game.results.playerIdsRanked[0][i] = i; game.results.playerIdsRanked[1][i] = i; game.results.stats[0][i] = game.players[i].numAPresses; game.results.totalAPresses += game.players[i].numAPresses; const p = game.players[i]; let stat = 0; if (game.results.randomPageId === RESULTS_PAGE_NEATNESS) stat = p.numAPresses ? q8Div(q8Mul(q8(p.maxNeatInputStreak), q8(100)), q8(p.numAPresses)) : 0; else if (game.results.randomPageId === RESULTS_PAGE_COOPERATIVE) stat = p.numAPresses ? q8Div(q8Mul(q8(p.numSyncedAPresses), q8(100)), q8(p.numAPresses)) : 0; else stat = p.numAPresses === 0 ? 0 : p.timePressingA >= game.timer ? q8(100) : q8Div(q8Mul(q8(p.timePressingA), q8(100)), q8(game.timer)); game.results.stats[1][i] = stat >> 4; }
  } else if (game.cmdState === 4) {
    for (let i = 0; i < game.playerCount - 1; i += 1) for (let j = game.playerCount - 1; j > i; j -= 1) { if (game.results.stats[0][j - 1] < game.results.stats[0][j]) { [game.results.stats[0][j], game.results.stats[0][j - 1]] = [game.results.stats[0][j - 1], game.results.stats[0][j]]; [game.results.playerIdsRanked[0][j], game.results.playerIdsRanked[0][j - 1]] = [game.results.playerIdsRanked[0][j - 1], game.results.playerIdsRanked[0][j]]; } if (game.results.stats[1][j - 1] < game.results.stats[1][j]) { [game.results.stats[1][j], game.results.stats[1][j - 1]] = [game.results.stats[1][j - 1], game.results.stats[1][j]]; [game.results.playerIdsRanked[1][j], game.results.playerIdsRanked[1][j - 1]] = [game.results.playerIdsRanked[1][j - 1], game.results.playerIdsRanked[1][j]]; } }
  } else if (game.cmdState === 7) { SaveResults(runtime); RunOrScheduleCommand(CMD_SHOW_RESULTS, SCHEDULE_CMD, null, runtime); game.gameState = STATE_RESULTS_PRESSES; game.cmdState = 0; game.newDepth = 0; return 0; }
  game.cmdState += 1; return 0;
}
export function Cmd_ShowResults(game: BerryCrushGame, args: number[], runtime = requireRuntime()): number { if (game.cmdState === 0 && !OpenResultsWindow(game, game.gfx, runtime)) return 0; if (game.cmdState === 2 && !joyNew(runtime, A_BUTTON)) return 0; if (game.cmdState === 3 && game.gameState <= STATE_RESULTS_RANDOM) { game.gameState += 1; game.cmdState = 0; return 0; } if (game.cmdState === 4) { SetPrintMessageArgs(args, 2, 3, 0, CMD_NONE); game.nextCmd = CMD_SAVE; RunOrScheduleCommand(CMD_PRINT_MSG, SCHEDULE_CMD, null, runtime); game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function Cmd_SaveGame(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (game.cmdState === 4) { RunOrScheduleCommand(CMD_ASK_PLAY_AGAIN, SCHEDULE_CMD, null, runtime); game.gameState = STATE_PLAY_AGAIN; game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function Cmd_AskPlayAgain(game: BerryCrushGame, args: number[], runtime = requireRuntime()): number { if (game.cmdState === 0) { SetPrintMessageArgs(args, 4, 0, 0, CMD_FADE); game.nextCmd = CMD_ASK_PLAY_AGAIN; RunOrScheduleCommand(CMD_PRINT_MSG, SCHEDULE_CMD, null, runtime); game.cmdState = 0; return 0; } if (game.cmdState === 2 && runtime.menuInput !== -2) { game.playAgainState = runtime.menuInput === 0 ? (runtime.hasAtLeastOneBerry ? PLAY_AGAIN_YES : PLAY_AGAIN_NO_BERRIES) : PLAY_AGAIN_NO; game.nextCmd = CMD_COMM_PLAY_AGAIN; RunOrScheduleCommand(CMD_PRINT_MSG, SCHEDULE_CMD, null, runtime); game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function Cmd_CommunicatePlayAgainResponses(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (game.cmdState === 3) { const sum = runtime.blockRecvBuffer.slice(0, game.playerCount).reduce<number>((a, b) => a + Number(b), 0); RunOrScheduleCommand(sum !== PLAY_AGAIN_YES ? CMD_PLAY_AGAIN_NO : CMD_PLAY_AGAIN_YES, SCHEDULE_CMD, null, runtime); game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function Cmd_PlayAgain(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (game.cmdState === 2) ResetCrusherPos(game, runtime); if (game.cmdState === 3) { RunOrScheduleCommand(CMD_ASK_PICK_BERRY, SCHEDULE_CMD, null, runtime); game.gameState = STATE_PICK_BERRY; game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function Cmd_StopGame(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (game.cmdState === 0) runtime.windows.push(game.playAgainState === PLAY_AGAIN_NO_BERRIES ? 'NoBerries' : 'Dropped'); if (game.cmdState === 2) { RunOrScheduleCommand(CMD_CLOSE_LINK, SCHEDULE_CMD, null, runtime); game.cmdState = 0; return 0; } game.cmdState += 1; return 0; }
export function Cmd_CloseLink(game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { if (game.cmdState === 2 && !runtime.receivedRemoteLinkPlayers) { game.nextCmd = CMD_QUIT; RunOrScheduleCommand(CMD_HIDE_GAME, SCHEDULE_CMD, null, runtime); game.cmdState = 2; return 0; } game.cmdState += 1; return 0; }
export function Cmd_Quit(_game: BerryCrushGame, _args: number[], runtime = requireRuntime()): number { QuitBerryCrush(undefined, runtime); return 0; }
export function ResetGame(game: BerryCrushGame, runtime = requireRuntime()): void { runtime.logs.push('GAME_STAT_BERRY_CRUSH_POINTS'); Object.assign(game, { unused: 0, cmdTimer: 0, gameState: STATE_RESET, playAgainState: PLAY_AGAIN_YES, powder: 0, targetAPresses: 0, totalAPresses: 0, targetDepth: 0, newDepth: 0, noRoomForPowder: false, newRecord: false, playedSound: false, endGame: false, bigSparkle: false, sparkleAmount: 0, leaderTimer: 0, timer: 0, bigSparkleCounter: 0, numBigSparkleChecks: -1, numBigSparkles: 0, sparkleCounter: 0 }); game.players.forEach((p) => Object.assign(p, createPlayer(p.name))); }
export function SetPaletteFadeArgs(args: number[], communicateAfter: boolean, selectedPals: number, delay: number, startY: number, targetY: number, palette: number): void { args[0] = selectedPals & 0xff; args[1] = (selectedPals >>> 8) & 0xff; args[2] = (selectedPals >>> 16) & 0xff; args[3] = (selectedPals >>> 24) & 0xff; args[4] = delay & 0xff; args[5] = startY; args[6] = targetY; args[7] = palette & 0xff; args[8] = (palette >>> 8) & 0xff; args[9] = communicateAfter ? 1 : 0; }
export function SetPrintMessageArgs(args: number[], stringId: number, flags: number, waitKeys: number, followupCmd: number): void { args[0] = stringId; args[1] = flags; args[2] = waitKeys & 0xff; args[3] = (waitKeys >>> 8) & 0xff; args[4] = followupCmd; }
export function ShowGameDisplay(runtime = requireRuntime()): number { const game = requireGame(runtime); if (game.cmdState === 8) CreateGameSprites(game, runtime); if (game.cmdState === 9) { BerryCrush_SetVBlankCallback(runtime); game.cmdState = 0; return 1; } game.cmdState += 1; return 0; }
export function HideGameDisplay(runtime = requireRuntime()): number { const game = requireGame(runtime); if (game.cmdState === 6) DestroyGameSprites(game); if (game.cmdState === 7) { game.cmdState = 0; return 1; } game.cmdState += 1; return 0; }
export function UpdateGame(game: BerryCrushGame, runtime = requireRuntime()): number { runtime.spriteCoordOffsetY = game.depth + game.vibration; runtime.gpuRegs.REG_OFFSET_BG1VOFS = -runtime.spriteCoordOffsetY; if (game.gameState === STATE_PLAYING) PrintTimer(game.gfx, game.timer, runtime); return 0; }
export function ResetCrusherPos(game: BerryCrushGame, runtime = requireRuntime()): void { game.depth = CRUSHER_START_Y; game.vibration = 0; runtime.spriteCoordOffsetY = CRUSHER_START_Y; }
export function CreateBerrySprites(game: BerryCrushGame, gfx: BerryCrushGfx): void { for (let i = 0; i < game.playerCount; i += 1) { const coord = gfx.playerCoords[i] ?? sPlayerCoords[i]; const sprite = createSprite(coord.berryXOffset + 120, -16); sprite.priority = 3; sprite.affineAnimPaused = true; sprite.data[1] = q8(2); sprite.data[2] = q8(0.125); sprite.data[7] = 112 | 0x8000; gfx.berrySprites[i] = sprite; } }
export function SpriteCB_DropBerryIntoCrusher(sprite: BerryCrushSprite): void { sprite.data[1] += sprite.data[2]; sprite.y2 += q8ToInt(sprite.data[1]); if (sprite.y + sprite.y2 >= (sprite.data[7] & 0x7fff)) { sprite.callback = 'SpriteCallbackDummy'; sprite.inUse = false; } }
export function BerryCrushFreeBerrySpriteGfx(game: BerryCrushGame, _gfx: BerryCrushGfx, runtime = requireRuntime()): void { runtime.logs.push(`FreeBerrySpriteGfx:${game.playerCount}`); }
export function UpdateInputEffects(game: BerryCrushGame, gfx: BerryCrushGfx, runtime = requireRuntime()): void { let numPlayersPressed = 0; const linkState = runtime.recvCmds[0]; for (let i = 0; i < game.playerCount; i += 1) { const flags = (linkState.inputFlags >> (i * INPUT_FLAGS_PER_PLAYER)) & INPUT_FLAG_MASK; if (flags) { numPlayersPressed += 1; const sprite = gfx.impactSprites[i] ?? createSprite(); gfx.impactSprites[i] = sprite; sprite.anim = flags & F_INPUT_HIT_SYNC ? 1 : 0; sprite.invisible = false; sprite.animPaused = false; const idx = (flags % (sImpactCoords.length + 1)) - 1; sprite.x2 = sImpactCoords[idx]?.[0] ?? 0; sprite.y2 = sImpactCoords[idx]?.[1] ?? 0; } } if (numPlayersPressed === 0) game.playedSound = false; else { runtime.sounds.push(numPlayersPressed === 1 ? 'SE_MUD_BALL' : 'SE_BREAKABLE_DOOR'); game.playedSound = !game.playedSound; } }
export function AreEffectsFinished(game: BerryCrushGame, gfx: BerryCrushGfx): boolean { if (gfx.impactSprites.slice(0, game.playerCount).some((s) => !s.invisible)) return false; if (gfx.sparkleSprites.some((s) => !s.invisible)) return false; if (game.vibration !== 0) game.vibration = 0; return true; }
export function FramesToMinSec(gfx: BerryCrushGfx, frames: number): void { gfx.minutes = Math.trunc(frames / 3600); gfx.secondsInt = Math.trunc((frames % 3600) / 60); const fracSecs = q8Mul(q8(frames % 60), q8(0.016666667)); let fractionalFrames = 0; for (let i = 0; i < 8; i += 1) if ((fracSecs >> (7 - i)) & 1) fractionalFrames += sPressingSpeedConversionTable[i]; gfx.secondsFrac = Math.trunc(fractionalFrames / 1000000); }
export function PrintTextCentered(windowId: number, left: number, colorId: number, string: string, runtime = requireRuntime()): void { runtime.windows.push(`center:${windowId}:${left}:${colorId}:${string}`); }
export function PrintResultsText(game: BerryCrushGame, command: number, _x: number, _y: number, runtime = requireRuntime()): void { runtime.windows.push(`results:${command}:${game.results.playerIdsRanked[Math.min(command, 1)].slice(0, game.playerCount).join(',')}`); }
export function printCrushingResults(game: BerryCrushGame, runtime = requireRuntime()): void { FramesToMinSec(game.gfx, game.results.time); runtime.windows.push(`crushing:${game.gfx.minutes}:${game.gfx.secondsInt}:${game.gfx.secondsFrac}:${game.results.silkiness}`); }
export function OpenResultsWindow(game: BerryCrushGame, spriteManager: BerryCrushGfx, runtime = requireRuntime()): boolean { if (spriteManager.resultsState === 0) { HideTimer(spriteManager, runtime); spriteManager.resultsWindowId = 1; } else if (spriteManager.resultsState === 3) { PrintResultsText(game, game.gameState === STATE_RESULTS_CRUSHING ? RESULTS_PAGE_CRUSHING : game.gameState - STATE_RESULTS_PRESSES, 0, 0, runtime); if (game.gameState !== STATE_RESULTS_CRUSHING) { spriteManager.resultsState = 5; return false; } } else if (spriteManager.resultsState === 4) printCrushingResults(game, runtime); else if (spriteManager.resultsState === 5) { spriteManager.resultsState = 0; return true; } spriteManager.resultsState += 1; return false; }
export function CloseResultsWindow(game: BerryCrushGame, runtime = requireRuntime()): void { runtime.windows.push(`close:${game.gfx.resultsWindowId}`); DrawPlayerNameWindows(game, runtime); }
export function Task_ShowBerryCrushRankings(taskId: number, runtime = requireRuntime()): void { const task = runtime.taskRuntime.tasks[taskId]; if (task.data[0] === 0) runtime.windows.push('BerryCrushRankings'); else if (task.data[0] === 2 && !joyNew(runtime, A_BUTTON | B_BUTTON)) return; else if (task.data[0] === 3) { destroyTask(runtime.taskRuntime, taskId); runtime.scriptContextEnabled = true; runtime.fieldControlsLocked = false; task.data[0] = 0; return; } task.data[0] += 1; }
export function ShowBerryCrushRankings(runtime = requireRuntime()): void { runtime.fieldControlsLocked = true; const taskId = createTask(runtime.taskRuntime, 'Task_ShowBerryCrushRankings', 0); for (let i = 0; i < 4; i += 1) runtime.taskRuntime.tasks[taskId].data[2 + i] = runtime.savePressingSpeeds[i]; }
export function PrintTimer(gfx: BerryCrushGfx, frames: number, runtime = requireRuntime()): void { FramesToMinSec(gfx, frames); runtime.logs.push(`timer:${gfx.minutes}:${gfx.secondsInt}:${gfx.secondsFrac}`); }
export function HideTimer(gfx: BerryCrushGfx, runtime = requireRuntime()): void { gfx.timerSprites.forEach((s) => { s.invisible = true; }); runtime.logs.push('HideTimer'); }
export function CreatePlayerNameWindows(game: BerryCrushGame): void { for (let i = 0; i < game.playerCount; i += 1) { game.gfx.playerCoords[i] = sPlayerCoords[sPlayerIdToPosId[game.playerCount - 2][i]]; game.gfx.nameWindowIds[i] = i + 1; } }
export function DrawPlayerNameWindows(game: BerryCrushGame, runtime = requireRuntime()): void { for (let i = 0; i < game.playerCount; i += 1) runtime.windows.push(`name:${i}:${game.players[i].name}:${i === game.localId ? 'local' : 'remote'}`); }
export function CopyPlayerNameWindowGfxToBg(game: BerryCrushGame, runtime = requireRuntime()): void { runtime.logs.push(`CopyPlayerNameWindowGfxToBg:${game.playerCount}`); }
export function CreateGameSprites(game: BerryCrushGame, runtime = requireRuntime()): void { game.depth = CRUSHER_START_Y; game.vibration = 0; runtime.spriteCoordOffsetY = CRUSHER_START_Y; CreatePlayerNameWindows(game); game.gfx.coreSprite = createSprite(120, 88); for (let i = 0; i < game.playerCount; i += 1) { const c = game.gfx.playerCoords[i]; game.gfx.impactSprites[i] = createSprite(c.impactXOffset + 120, c.impactYOffset + 32); game.gfx.impactSprites[i].invisible = true; } game.gfx.sparkleSprites = sSparkleCoords.map(([x, y]) => { const s = createSprite(x + 120, y + 136); s.invisible = true; return s; }); game.gfx.timerSprites = [createSprite(176, 8), createSprite(200, 8)]; if (game.gameState === STATE_INIT) HideTimer(game.gfx, runtime); }
export function DestroyGameSprites(game: BerryCrushGame): void { game.gfx.coreSprite = null; game.gfx.impactSprites = []; game.gfx.sparkleSprites = []; game.gfx.timerSprites = []; }
export function SpriteCB_Impact(sprite: BerryCrushSprite): void { if (sprite.animEnded) { sprite.invisible = true; sprite.animPaused = true; } }
export function SpriteCB_Sparkle_End(sprite: BerryCrushSprite): void { sprite.data.fill(0); sprite.x2 = 0; sprite.y2 = 0; sprite.invisible = true; sprite.animPaused = true; sprite.callback = 'SpriteCallbackDummy'; }
export function SpriteCB_Sparkle(sprite: BerryCrushSprite): void { sprite.data[1] += sprite.data[2]; sprite.y2 += q8ToInt(sprite.data[1]); if (sprite.data[7] & 0x8000) { sprite.data[0] += sprite.data[3]; sprite.data[4] += sprite.data[5]; if ((sprite.data[4] >> 7) > 126) { sprite.x2 = 0; sprite.data[7] &= 0x7fff; } } sprite.x = sprite.data[0] >> 7; if (sprite.y + sprite.y2 > (sprite.data[7] & 0x7fff)) sprite.callback = 'SpriteCB_Sparkle_End'; }
export function SpriteCB_Sparkle_Init(sprite: BerryCrushSprite): void { sprite.data[1] = q8(2.5); sprite.data[2] = q8(0.125); sprite.data[7] = 168 | 0x8000; sprite.data[0] = sprite.x << 7; sprite.data[3] = sprite.x2; sprite.data[4] = 0; sprite.data[5] = 1; sprite.data[6] = Math.trunc(sprite.x2 / 4); sprite.y2 = 0; sprite.x2 = 0; sprite.callback = 'SpriteCB_Sparkle'; sprite.animPaused = false; sprite.invisible = false; }

const sBerryCrushCommands: Array<(game: BerryCrushGame, args: number[], runtime: BerryCrushRuntime) => number> = [
  () => 0, Cmd_BeginNormalPaletteFade, Cmd_WaitPaletteFade, Cmd_PrintMessage, Cmd_ShowGameDisplay, Cmd_HideGameDisplay, Cmd_SignalReadyToBegin,
  Cmd_AskPickBerry, Cmd_GoToBerryPouch, Cmd_WaitForOthersToPickBerries, Cmd_DropBerriesIntoCrusher, Cmd_DropLid, Cmd_Countdown,
  Cmd_PlayGame_Leader, Cmd_PlayGame_Member, Cmd_FinishGame, Cmd_HandleTimeUp, Cmd_TabulateResults, Cmd_ShowResults, Cmd_SaveGame,
  Cmd_AskPlayAgain, Cmd_CommunicatePlayAgainResponses, Cmd_PlayAgain, Cmd_StopGame, Cmd_CloseLink, Cmd_Quit
];
