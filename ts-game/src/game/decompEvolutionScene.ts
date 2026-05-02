import evolutionSceneSource from '../../../src/evolution_scene.c?raw';

export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const DPAD_UP = 1 << 6;
export const DPAD_DOWN = 1 << 7;

export const PARTY_SIZE = 6;
export const MAX_MON_MOVES = 4;
export const MOVE_NONE = 0;
export const MON_HAS_MAX_MOVES = 0xfffe;
export const MON_ALREADY_KNOWS_MOVE = 0xffff;
export const TASK_NONE = 0xff;
export const TASK_BIT_CAN_STOP = 1 << 0;
export const TASK_BIT_LEARN_MOVE = 1 << 7;
export const EVO_LEVEL_NINJASK = 15;
export const SPECIES_MEW = 151;
export const SPECIES_NINJASK = 291;
export const SPECIES_SHEDINJA = 292;
export const LANGUAGE_JAPANESE = 1;
export const MAIL_NONE = 0xff;

export const EVOSTATE_FADE_IN = 0;
export const EVOSTATE_INTRO_MSG = 1;
export const EVOSTATE_INTRO_MON_ANIM = 2;
export const EVOSTATE_INTRO_SOUND = 3;
export const EVOSTATE_START_MUSIC = 4;
export const EVOSTATE_START_BG_AND_SPARKLE_SPIRAL = 5;
export const EVOSTATE_SPARKLE_ARC = 6;
export const EVOSTATE_CYCLE_MON_SPRITE = 7;
export const EVOSTATE_WAIT_CYCLE_MON_SPRITE = 8;
export const EVOSTATE_SPARKLE_CIRCLE = 9;
export const EVOSTATE_SPARKLE_SPRAY = 10;
export const EVOSTATE_EVO_SOUND = 11;
export const EVOSTATE_RESTORE_SCREEN = 12;
export const EVOSTATE_EVO_MON_ANIM = 13;
export const EVOSTATE_SET_MON_EVOLVED = 14;
export const EVOSTATE_TRY_LEARN_MOVE = 15;
export const EVOSTATE_END = 16;
export const EVOSTATE_CANCEL = 17;
export const EVOSTATE_CANCEL_MON_ANIM = 18;
export const EVOSTATE_CANCEL_MSG = 19;
export const EVOSTATE_LEARNED_MOVE = 20;
export const EVOSTATE_TRY_LEARN_ANOTHER_MOVE = 21;
export const EVOSTATE_REPLACE_MOVE = 22;

export const MVSTATE_INTRO_MSG_1 = 0;
export const MVSTATE_INTRO_MSG_2 = 1;
export const MVSTATE_INTRO_MSG_3 = 2;
export const MVSTATE_PRINT_YES_NO = 3;
export const MVSTATE_HANDLE_YES_NO = 4;
export const MVSTATE_SHOW_MOVE_SELECT = 5;
export const MVSTATE_HANDLE_MOVE_SELECT = 6;
export const MVSTATE_FORGET_MSG_1 = 7;
export const MVSTATE_FORGET_MSG_2 = 8;
export const MVSTATE_LEARNED_MOVE = 9;
export const MVSTATE_ASK_CANCEL = 10;
export const MVSTATE_CANCEL = 11;
export const MVSTATE_RETRY_AFTER_HM = 12;

export const T_EVOSTATE_INTRO_MSG = 0;
export const T_EVOSTATE_INTRO_CRY = 1;
export const T_EVOSTATE_INTRO_SOUND = 2;
export const T_EVOSTATE_START_MUSIC = 3;
export const T_EVOSTATE_START_BG_AND_SPARKLE_SPIRAL = 4;
export const T_EVOSTATE_SPARKLE_ARC = 5;
export const T_EVOSTATE_CYCLE_MON_SPRITE = 6;
export const T_EVOSTATE_WAIT_CYCLE_MON_SPRITE = 7;
export const T_EVOSTATE_SPARKLE_CIRCLE = 8;
export const T_EVOSTATE_SPARKLE_SPRAY = 9;
export const T_EVOSTATE_EVO_SOUND = 10;
export const T_EVOSTATE_EVO_MON_ANIM = 11;
export const T_EVOSTATE_SET_MON_EVOLVED = 12;
export const T_EVOSTATE_TRY_LEARN_MOVE = 13;
export const T_EVOSTATE_END = 14;
export const T_EVOSTATE_CANCEL = 15;
export const T_EVOSTATE_CANCEL_MON_ANIM = 16;
export const T_EVOSTATE_CANCEL_MSG = 17;
export const T_EVOSTATE_LEARNED_MOVE = 18;
export const T_EVOSTATE_TRY_LEARN_ANOTHER_MOVE = 19;
export const T_EVOSTATE_REPLACE_MOVE = 20;

export const T_MVSTATE_INTRO_MSG_1 = 0;
export const T_MVSTATE_INTRO_MSG_2 = 1;
export const T_MVSTATE_INTRO_MSG_3 = 2;
export const T_MVSTATE_PRINT_YES_NO = 3;
export const T_MVSTATE_HANDLE_YES_NO = 4;
export const T_MVSTATE_SHOW_MOVE_SELECT = 5;
export const T_MVSTATE_HANDLE_MOVE_SELECT = 6;
export const T_MVSTATE_FORGET_MSG = 7;
export const T_MVSTATE_LEARNED_MOVE = 8;
export const T_MVSTATE_ASK_CANCEL = 9;
export const T_MVSTATE_CANCEL = 10;
export const T_MVSTATE_RETRY_AFTER_HM = 11;

export interface Pokemon {
  species: number;
  nickname: string;
  otId: number;
  personality: number;
  language: number;
  heldItem: number;
  markings: number;
  encryptSeparator: number;
  ribbons: number[];
  status: number;
  mail: number;
  moves: number[];
}

export interface EvolutionEntry {
  method: number;
  targetSpecies: number;
}

export interface EvoInfo {
  preEvoSpriteId: number;
  postEvoSpriteId: number;
  evoTaskId: number;
  delayTimer: number;
  savedPalette: number[];
}

export interface EvoTask {
  id: number;
  func: string;
  priority: number;
  data: number[];
  isActive: boolean;
}

export interface EvoSprite {
  id: number;
  invisible: boolean;
  callback: string;
  oam: { paletteNum: number };
}

export interface EvolutionRuntime {
  tasks: EvoTask[];
  sprites: EvoSprite[];
  nextTaskId: number;
  nextSpriteId: number;
  sEvoStructPtr: EvoInfo | null;
  sBgAnimPal: number[] | null;
  gCB2_AfterEvolution: string | null;
  gBattleCommunication: number[];
  gMainState: number;
  mainCallback: string | null;
  vblankCallback: string | null;
  hblankCallback: string | null;
  gPaletteFadeActive: boolean;
  textPrinterActive: boolean;
  cryFinished: boolean;
  sePlaying: boolean;
  fanfareInactive: boolean;
  heldKeys: number;
  newKeys: number;
  menuInputs: number[];
  nationalDexEnabled: boolean;
  wirelessCommType: number;
  affineAnimsDisabled: boolean;
  textFlagsUseAlternateDownArrow: boolean;
  gBattle_BG0_X: number;
  gBattle_BG0_Y: number;
  gBattle_BG1_X: number;
  gBattle_BG1_Y: number;
  gBattle_BG2_X: number;
  gBattle_BG2_Y: number;
  gBattle_BG3_X: number;
  gBattle_BG3_Y: number;
  gBattleTerrain: number;
  gReservedSpritePaletteCount: number;
  playerParty: Pokemon[];
  playerPartyCount: number;
  evolutionTable: EvolutionEntry[][];
  moveToLearn: number;
  moveLearnResults: number[];
  moveSlotToReplace: number;
  hmMoves: Set<number>;
  palette: number[];
  loadedPalettes: { offset: number; values: number[] }[];
  pokedexFlags: { species: number; flag: string }[];
  gameStats: string[];
  operations: string[];
}

const parse2dNumberArray = (name: string, rowSize: number): number[][] => {
  const match = evolutionSceneSource.match(new RegExp(`static const u8 ${name}\\[\\][^{]*=\\s*\\{([\\s\\S]*?)\\};`));
  if (match === null) throw new Error(`Could not find ${name}`);
  const values = [...match[1]!.matchAll(/\b\d+\b/g)].map((entry) => Number(entry[0]));
  const rows: number[][] = [];
  for (let i = 0; i < values.length; i += rowSize) rows.push(values.slice(i, i + rowSize));
  return rows;
};

export const sBgAnim_PaletteControl = parse2dNumberArray('sBgAnim_PaletteControl', 4);
export const sBgAnim_PalIndexes = parse2dNumberArray('sBgAnim_PalIndexes', 16);
export const sBgAnim_Pal = Array.from({ length: 14 }, (_, index) => index);

export const createPokemon = (overrides: Partial<Pokemon> = {}): Pokemon => ({
  species: 1,
  nickname: 'MON',
  otId: 0,
  personality: 0,
  language: 0,
  heldItem: 0,
  markings: 0,
  encryptSeparator: 0,
  ribbons: [0, 0, 0, 0, 0, 0, 0],
  status: 0,
  mail: MAIL_NONE,
  moves: [1, 2, 3, 4],
  ...overrides
});

export const createEvolutionRuntime = (overrides: Partial<EvolutionRuntime> = {}): EvolutionRuntime => {
  const firstMon = createPokemon();
  const runtime: EvolutionRuntime = {
    tasks: [],
    sprites: [],
    nextTaskId: 0,
    nextSpriteId: 0,
    sEvoStructPtr: null,
    sBgAnimPal: null,
    gCB2_AfterEvolution: 'AfterEvolution',
    gBattleCommunication: [0, 0, 0, 0],
    gMainState: 0,
    mainCallback: null,
    vblankCallback: null,
    hblankCallback: null,
    gPaletteFadeActive: false,
    textPrinterActive: false,
    cryFinished: true,
    sePlaying: false,
    fanfareInactive: true,
    heldKeys: 0,
    newKeys: 0,
    menuInputs: [],
    nationalDexEnabled: true,
    wirelessCommType: 0,
    affineAnimsDisabled: false,
    textFlagsUseAlternateDownArrow: false,
    gBattle_BG0_X: 0,
    gBattle_BG0_Y: 0,
    gBattle_BG1_X: 0,
    gBattle_BG1_Y: 0,
    gBattle_BG2_X: 0,
    gBattle_BG2_Y: 0,
    gBattle_BG3_X: 256,
    gBattle_BG3_Y: 0,
    gBattleTerrain: 0,
    gReservedSpritePaletteCount: 0,
    playerParty: [firstMon],
    playerPartyCount: 1,
    evolutionTable: [],
    moveToLearn: 0,
    moveLearnResults: [],
    moveSlotToReplace: MAX_MON_MOVES,
    hmMoves: new Set(),
    palette: Array.from({ length: 256 }, (_, index) => index),
    loadedPalettes: [],
    pokedexFlags: [],
    gameStats: [],
    operations: []
  };
  return { ...runtime, ...overrides };
};

const tState = 0;
const tPreEvoSpecies = 1;
const tPostEvoSpecies = 2;
const tBits = 3;
const tLearnsFirstMove = 4;
const tLearnMoveState = 6;
const tLearnMoveYesState = 7;
const tLearnMoveNoState = 8;
const tEvoWasStopped = 9;
const tPartyId = 10;
const tEvoStopped = 8;

const task = (runtime: EvolutionRuntime, taskId: number): EvoTask => {
  const found = runtime.tasks.find((entry) => entry.id === taskId);
  if (found === undefined) throw new Error(`Task ${taskId} not found`);
  return found;
};

const sprite = (runtime: EvolutionRuntime, spriteId: number): EvoSprite => {
  const found = runtime.sprites.find((entry) => entry.id === spriteId);
  if (found === undefined) throw new Error(`Sprite ${spriteId} not found`);
  return found;
};

export const CreateTask = (runtime: EvolutionRuntime, func: string, priority: number): number => {
  const id = runtime.nextTaskId++;
  runtime.tasks.push({ id, func, priority, data: Array(16).fill(0), isActive: true });
  return id;
};

export const DestroyTask = (runtime: EvolutionRuntime, taskId: number): void => {
  const found = task(runtime, taskId);
  found.isActive = false;
  runtime.operations.push(`DestroyTask(${found.func})`);
};

export const FindTaskIdByFunc = (runtime: EvolutionRuntime, func: string): number => {
  return runtime.tasks.find((entry) => entry.func === func && entry.isActive)?.id ?? TASK_NONE;
};

export const FuncIsActiveTask = (runtime: EvolutionRuntime, func: string): boolean => FindTaskIdByFunc(runtime, func) !== TASK_NONE;

const CreateSprite = (runtime: EvolutionRuntime, paletteNum: number, invisible: boolean): number => {
  const id = runtime.nextSpriteId++;
  runtime.sprites.push({ id, invisible, callback: 'SpriteCallbackDummy_2', oam: { paletteNum } });
  return id;
};

const op = (runtime: EvolutionRuntime, name: string): void => {
  runtime.operations.push(name);
};

const AnimateSprites = (runtime: EvolutionRuntime): void => op(runtime, 'AnimateSprites');
const BuildOamBuffer = (runtime: EvolutionRuntime): void => op(runtime, 'BuildOamBuffer');
const RunTextPrinters = (runtime: EvolutionRuntime): void => op(runtime, 'RunTextPrinters');
const UpdatePaletteFade = (runtime: EvolutionRuntime): void => op(runtime, 'UpdatePaletteFade');
const LoadOam = (runtime: EvolutionRuntime): void => op(runtime, 'LoadOam');
const ProcessSpriteCopyRequests = (runtime: EvolutionRuntime): void => op(runtime, 'ProcessSpriteCopyRequests');
const TransferPlttBuffer = (runtime: EvolutionRuntime): void => op(runtime, 'TransferPlttBuffer');
const ScanlineEffect_InitHBlankDmaTransfer = (runtime: EvolutionRuntime): void => op(runtime, 'ScanlineEffect_InitHBlankDmaTransfer');

const RunTasks = (runtime: EvolutionRuntime): void => {
  op(runtime, 'RunTasks');
  for (const currentTask of [...runtime.tasks]) {
    if (!currentTask.isActive) continue;
    if (currentTask.func === 'Task_BeginEvolutionScene') Task_BeginEvolutionScene(runtime, currentTask.id);
    else if (currentTask.func === 'Task_EvolutionScene') Task_EvolutionScene(runtime, currentTask.id);
    else if (currentTask.func === 'Task_TradeEvolutionScene') Task_TradeEvolutionScene(runtime, currentTask.id);
    else if (currentTask.func === 'Task_UpdateBgPalette') Task_UpdateBgPalette(runtime, currentTask.id);
    else if (currentTask.func === 'Task_AnimateBg') Task_AnimateBg(runtime, currentTask.id);
  }
};

const SetEvolutionBgScrollGpuRegs = (runtime: EvolutionRuntime): void => {
  op(runtime, `SetGpuReg(REG_OFFSET_BG0HOFS,${runtime.gBattle_BG0_X})`);
  op(runtime, `SetGpuReg(REG_OFFSET_BG0VOFS,${runtime.gBattle_BG0_Y})`);
  op(runtime, `SetGpuReg(REG_OFFSET_BG1HOFS,${runtime.gBattle_BG1_X})`);
  op(runtime, `SetGpuReg(REG_OFFSET_BG1VOFS,${runtime.gBattle_BG1_Y})`);
  op(runtime, `SetGpuReg(REG_OFFSET_BG2HOFS,${runtime.gBattle_BG2_X})`);
  op(runtime, `SetGpuReg(REG_OFFSET_BG2VOFS,${runtime.gBattle_BG2_Y})`);
  op(runtime, `SetGpuReg(REG_OFFSET_BG3HOFS,${runtime.gBattle_BG3_X})`);
  op(runtime, `SetGpuReg(REG_OFFSET_BG3VOFS,${runtime.gBattle_BG3_Y})`);
};

const BeginNormalPaletteFade = (runtime: EvolutionRuntime, mask: number, delay: number, start: number, end: number, color: string): void => {
  op(runtime, `BeginNormalPaletteFade(${mask},${delay},${start},${end},${color})`);
};

const ShowBg = (runtime: EvolutionRuntime, bg: number): void => op(runtime, `ShowBg(${bg})`);
const BattlePutTextOnWindow = (runtime: EvolutionRuntime, text: string): void => op(runtime, `BattlePutTextOnWindow(${text})`);
const DrawTextOnTradeWindow = (runtime: EvolutionRuntime, text: string): void => op(runtime, `DrawTextOnTradeWindow(${text})`);
const PlayCry_Normal = (runtime: EvolutionRuntime, species: number): void => op(runtime, `PlayCry_Normal(${species})`);
const PlaySE = (runtime: EvolutionRuntime, song: string): void => op(runtime, `PlaySE(${song})`);
const PlayBGM = (runtime: EvolutionRuntime, song: string): void => op(runtime, `PlayBGM(${song})`);
const PlayNewMapMusic = (runtime: EvolutionRuntime, song: string): void => op(runtime, `PlayNewMapMusic(${song})`);
const PlayFanfare = (runtime: EvolutionRuntime, song: string): void => op(runtime, `PlayFanfare(${song})`);
const StopMapMusic = (runtime: EvolutionRuntime): void => op(runtime, 'StopMapMusic');
const Overworld_PlaySpecialMapMusic = (runtime: EvolutionRuntime): void => op(runtime, 'Overworld_PlaySpecialMapMusic');
const m4aMPlayAllStop = (runtime: EvolutionRuntime): void => op(runtime, 'm4aMPlayAllStop');
const m4aSongNumStop = (runtime: EvolutionRuntime, song: string): void => op(runtime, `m4aSongNumStop(${song})`);
const FreeAllWindowBuffers = (runtime: EvolutionRuntime): void => op(runtime, 'FreeAllWindowBuffers');
const FreeMonSpritesGfx = (runtime: EvolutionRuntime): void => op(runtime, 'FreeMonSpritesGfx');
const HelpSystem_Disable = (runtime: EvolutionRuntime): void => op(runtime, 'HelpSystem_Disable');
const HelpSystem_Enable = (runtime: EvolutionRuntime): void => op(runtime, 'HelpSystem_Enable');

const createGraphicsTask = (runtime: EvolutionRuntime, func: string): number => {
  const id = CreateTask(runtime, func, 0);
  task(runtime, id).isActive = false;
  return id;
};

const EvolutionSparkles_SpiralUpward = (runtime: EvolutionRuntime, palette: number): number => {
  op(runtime, `EvolutionSparkles_SpiralUpward(${palette})`);
  return createGraphicsTask(runtime, 'EvolutionSparkles_SpiralUpward');
};

const EvolutionSparkles_ArcDown = (runtime: EvolutionRuntime): number => {
  op(runtime, 'EvolutionSparkles_ArcDown');
  return createGraphicsTask(runtime, 'EvolutionSparkles_ArcDown');
};

const EvolutionSparkles_CircleInward = (runtime: EvolutionRuntime): number => {
  op(runtime, 'EvolutionSparkles_CircleInward');
  return createGraphicsTask(runtime, 'EvolutionSparkles_CircleInward');
};

const EvolutionSparkles_SprayAndFlash = (runtime: EvolutionRuntime, species: number): number => {
  op(runtime, `EvolutionSparkles_SprayAndFlash(${species})`);
  return createGraphicsTask(runtime, 'EvolutionSparkles_SprayAndFlash');
};

const EvolutionSparkles_SprayAndFlash_Trade = (runtime: EvolutionRuntime, species: number): number => {
  op(runtime, `EvolutionSparkles_SprayAndFlash_Trade(${species})`);
  return createGraphicsTask(runtime, 'EvolutionSparkles_SprayAndFlash_Trade');
};

const CycleEvolutionMonSprite = (runtime: EvolutionRuntime, preSpriteId: number, postSpriteId: number): number => {
  op(runtime, `CycleEvolutionMonSprite(${preSpriteId},${postSpriteId})`);
  return createGraphicsTask(runtime, 'CycleEvolutionMonSprite');
};

const MonTryLearningNewMove = (runtime: EvolutionRuntime): number => runtime.moveLearnResults.shift() ?? MOVE_NONE;
const GetMoveSlotToReplace = (runtime: EvolutionRuntime): number => runtime.moveSlotToReplace;
const IsHMMove2 = (runtime: EvolutionRuntime, move: number): boolean => runtime.hmMoves.has(move);

const RemoveMonPPBonus = (runtime: EvolutionRuntime, slot: number): void => op(runtime, `RemoveMonPPBonus(${slot})`);

const SetMonMoveSlot = (runtime: EvolutionRuntime, mon: Pokemon, move: number, slot: number): void => {
  mon.moves[slot] = move;
  op(runtime, `SetMonMoveSlot(${move},${slot})`);
};

const EvolutionRenameMon = (runtime: EvolutionRuntime, mon: Pokemon, preSpecies: number, postSpecies: number): void => {
  op(runtime, `EvolutionRenameMon(${preSpecies},${postSpecies})`);
  if (mon.nickname === `SPECIES_${preSpecies}`) mon.nickname = `SPECIES_${postSpecies}`;
};

const GetSetPokedexFlag = (runtime: EvolutionRuntime, species: number, flag: string): void => {
  runtime.pokedexFlags.push({ species, flag });
};

const CalculateMonStats = (runtime: EvolutionRuntime, mon: Pokemon): void => {
  op(runtime, `CalculateMonStats(${mon.species})`);
};

const CalculatePlayerPartyCount = (runtime: EvolutionRuntime): void => {
  runtime.playerPartyCount = runtime.playerParty.length;
  op(runtime, 'CalculatePlayerPartyCount');
};

const Menu_ProcessInputNoWrapClearOnChoose = (runtime: EvolutionRuntime): number => runtime.menuInputs.shift() ?? -2;

const loadPalette = (runtime: EvolutionRuntime, values: number[], offset: number): void => {
  runtime.loadedPalettes.push({ offset, values: [...values] });
};

export const BeginEvolutionScene = (runtime: EvolutionRuntime, mon: Pokemon, postEvoSpecies: number, canStopEvo: boolean, partyId: number): void => {
  void mon;
  const taskId = CreateTask(runtime, 'Task_BeginEvolutionScene', 0);
  const data = task(runtime, taskId).data;
  data[tState] = 0;
  data[tPostEvoSpecies] = postEvoSpecies;
  data[tBits] = canStopEvo ? 1 : 0;
  data[tPartyId] = partyId;
  runtime.mainCallback = 'CB2_BeginEvolutionScene';
};

export function CB2_BeginEvolutionScene(runtime: EvolutionRuntime): void {
  UpdatePaletteFade(runtime);
  RunTasks(runtime);
}

export function CB2_EvolutionSceneUpdate(runtime: EvolutionRuntime): void {
  AnimateSprites(runtime);
  BuildOamBuffer(runtime);
  RunTextPrinters(runtime);
  UpdatePaletteFade(runtime);
  RunTasks(runtime);
}

export function CB2_TradeEvolutionSceneUpdate(runtime: EvolutionRuntime): void {
  AnimateSprites(runtime);
  BuildOamBuffer(runtime);
  RunTextPrinters(runtime);
  UpdatePaletteFade(runtime);
  RunTasks(runtime);
}

export function EvoDummyFunc(_runtime: EvolutionRuntime): void {}

export function VBlankCB_EvolutionScene(runtime: EvolutionRuntime): void {
  SetEvolutionBgScrollGpuRegs(runtime);
  LoadOam(runtime);
  ProcessSpriteCopyRequests(runtime);
  TransferPlttBuffer(runtime);
  ScanlineEffect_InitHBlankDmaTransfer(runtime);
}

export function VBlankCB_TradeEvolutionScene(runtime: EvolutionRuntime): void {
  SetEvolutionBgScrollGpuRegs(runtime);
  LoadOam(runtime);
  ProcessSpriteCopyRequests(runtime);
  TransferPlttBuffer(runtime);
  ScanlineEffect_InitHBlankDmaTransfer(runtime);
}

export const Task_BeginEvolutionScene = (runtime: EvolutionRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  switch (data[tState]) {
    case 0:
      BeginNormalPaletteFade(runtime, 0xffffffff, 0, 0, 0x10, 'RGB_BLACK');
      data[tState]++;
      break;
    case 1:
      if (!runtime.gPaletteFadeActive) {
        const mon = runtime.playerParty[data[tPartyId]]!;
        const postEvoSpecies = data[tPostEvoSpecies];
        const canStopEvo = data[tBits] !== 0;
        const partyId = data[tPartyId];
        DestroyTask(runtime, taskId);
        EvolutionScene(runtime, mon, postEvoSpecies, canStopEvo, partyId);
      }
      break;
  }
};

export const EvolutionScene = (runtime: EvolutionRuntime, mon: Pokemon, postEvoSpecies: number, canStopEvo: boolean, partyId: number): void => {
  runtime.hblankCallback = null;
  runtime.vblankCallback = null;
  runtime.gBattle_BG0_X = 0;
  runtime.gBattle_BG0_Y = 0;
  runtime.gBattle_BG1_X = 0;
  runtime.gBattle_BG1_Y = 0;
  runtime.gBattle_BG2_X = 0;
  runtime.gBattle_BG2_Y = 0;
  runtime.gBattle_BG3_X = 256;
  runtime.gBattle_BG3_Y = 0;
  runtime.gBattleTerrain = 0;
  runtime.tasks = [];
  runtime.gReservedSpritePaletteCount = 4;
  runtime.sEvoStructPtr = { preEvoSpriteId: 0, postEvoSpriteId: 0, evoTaskId: 0, delayTimer: 0, savedPalette: [] };
  runtime.sEvoStructPtr.preEvoSpriteId = CreateSprite(runtime, 1, true);
  runtime.sEvoStructPtr.postEvoSpriteId = CreateSprite(runtime, 2, true);
  op(runtime, 'LoadEvoSparkleSpriteAndPal');
  const taskId = CreateTask(runtime, 'Task_EvolutionScene', 0);
  runtime.sEvoStructPtr.evoTaskId = taskId;
  const data = task(runtime, taskId).data;
  data[tState] = 0;
  data[tPreEvoSpecies] = mon.species;
  data[tPostEvoSpecies] = postEvoSpecies;
  data[tBits] = canStopEvo ? TASK_BIT_CAN_STOP : 0;
  data[tLearnsFirstMove] = 1;
  data[tEvoWasStopped] = 0;
  data[tPartyId] = partyId;
  runtime.sEvoStructPtr.savedPalette = runtime.palette.slice(32, 80);
  runtime.hblankCallback = 'EvoDummyFunc';
  runtime.vblankCallback = 'VBlankCB_EvolutionScene';
  m4aMPlayAllStop(runtime);
  HelpSystem_Disable(runtime);
  runtime.mainCallback = 'CB2_EvolutionSceneUpdate';
};

export const CB2_EvolutionSceneLoadGraphics = (runtime: EvolutionRuntime): void => {
  if (runtime.sEvoStructPtr === null) return;
  const postEvoSpecies = task(runtime, runtime.sEvoStructPtr.evoTaskId).data[tPostEvoSpecies];
  void postEvoSpecies;
  runtime.hblankCallback = 'EvoDummyFunc';
  runtime.vblankCallback = 'VBlankCB_EvolutionScene';
  runtime.sEvoStructPtr.postEvoSpriteId = CreateSprite(runtime, 2, false);
  runtime.mainCallback = 'CB2_EvolutionSceneUpdate';
  BeginNormalPaletteFade(runtime, 0xffffffff, 0, 0x10, 0, 'RGB_BLACK');
  [0, 1, 2, 3].forEach((bg) => ShowBg(runtime, bg));
};

export const TradeEvolutionScene = (runtime: EvolutionRuntime, mon: Pokemon, postEvoSpecies: number, preEvoSpriteId: number, partyId: number): void => {
  runtime.affineAnimsDisabled = true;
  runtime.sEvoStructPtr = { preEvoSpriteId, postEvoSpriteId: 0, evoTaskId: 0, delayTimer: 0, savedPalette: runtime.palette.slice(32, 80) };
  runtime.sEvoStructPtr.postEvoSpriteId = CreateSprite(runtime, 2, true);
  op(runtime, 'LoadEvoSparkleSpriteAndPal');
  const taskId = CreateTask(runtime, 'Task_TradeEvolutionScene', 0);
  runtime.sEvoStructPtr.evoTaskId = taskId;
  const data = task(runtime, taskId).data;
  data[tState] = 0;
  data[tPreEvoSpecies] = mon.species;
  data[tPostEvoSpecies] = postEvoSpecies;
  data[tLearnsFirstMove] = 1;
  data[tEvoWasStopped] = 0;
  data[tPartyId] = partyId;
  runtime.gBattle_BG0_X = 0;
  runtime.gBattle_BG0_Y = 0;
  runtime.gBattle_BG1_X = 0;
  runtime.gBattle_BG1_Y = 0;
  runtime.gBattle_BG2_X = 0;
  runtime.gBattle_BG2_Y = 0;
  runtime.gBattle_BG3_X = 256;
  runtime.gBattle_BG3_Y = 0;
  runtime.textFlagsUseAlternateDownArrow = true;
  runtime.vblankCallback = 'VBlankCB_TradeEvolutionScene';
  runtime.mainCallback = 'CB2_TradeEvolutionSceneUpdate';
};

export const CB2_TradeEvolutionSceneLoadGraphics = (runtime: EvolutionRuntime): void => {
  if (runtime.sEvoStructPtr === null) return;
  switch (runtime.gMainState) {
    case 0:
      runtime.gReservedSpritePaletteCount = 4;
      runtime.gBattle_BG3_X = 256;
      runtime.gMainState++;
      break;
    case 1:
      runtime.hblankCallback = 'EvoDummyFunc';
      runtime.vblankCallback = 'VBlankCB_TradeEvolutionScene';
      runtime.gMainState++;
      break;
    case 2:
      op(runtime, 'LoadTradeAnimGfx');
      runtime.gMainState++;
      break;
    case 3:
      op(runtime, 'FillBgTilemapBufferRect');
      runtime.gMainState++;
      break;
    case 4:
      op(runtime, 'LoadPostTradeEvolutionSpritePalette');
      runtime.gMainState++;
      break;
    case 5:
      runtime.sEvoStructPtr.postEvoSpriteId = CreateSprite(runtime, 2, false);
      op(runtime, 'LinkTradeDrawWindow');
      runtime.gMainState++;
      break;
    case 6:
      if (runtime.wirelessCommType !== 0) op(runtime, 'CreateWirelessStatusIndicatorSprite');
      op(runtime, 'BlendPalettes');
      runtime.gMainState++;
      break;
    case 7:
      BeginNormalPaletteFade(runtime, 0xffffffff, 0, 0x10, 0, 'RGB_BLACK');
      op(runtime, 'InitTradeSequenceBgGpuRegs');
      ShowBg(runtime, 0);
      ShowBg(runtime, 1);
      runtime.mainCallback = 'CB2_TradeEvolutionSceneUpdate';
      break;
  }
};

export const CreateShedinja = (runtime: EvolutionRuntime, preEvoSpecies: number, mon: Pokemon): void => {
  const entries = runtime.evolutionTable[preEvoSpecies];
  if (entries?.[0]?.method === EVO_LEVEL_NINJASK && runtime.playerPartyCount < PARTY_SIZE) {
    const targetSpecies = entries[1]!.targetSpecies;
    const shedinja = structuredClone(mon) as Pokemon;
    shedinja.species = targetSpecies;
    shedinja.nickname = `SPECIES_${targetSpecies}`;
    shedinja.heldItem = 0;
    shedinja.markings = 0;
    shedinja.encryptSeparator = 0;
    shedinja.ribbons = shedinja.ribbons.map(() => 0);
    shedinja.status = 0;
    shedinja.mail = MAIL_NONE;
    runtime.playerParty[runtime.playerPartyCount] = shedinja;
    CalculateMonStats(runtime, shedinja);
    CalculatePlayerPartyCount(runtime);
    GetSetPokedexFlag(runtime, targetSpecies, 'SEEN');
    GetSetPokedexFlag(runtime, targetSpecies, 'CAUGHT');
    if (shedinja.species === SPECIES_SHEDINJA && shedinja.language === LANGUAGE_JAPANESE && mon.species === SPECIES_NINJASK) {
      shedinja.nickname = 'ヌケニン';
    }
  }
};

export const Task_EvolutionScene = (runtime: EvolutionRuntime, taskId: number): void => {
  const currentTask = task(runtime, taskId);
  const data = currentTask.data;
  const mon = runtime.playerParty[data[tPartyId]]!;

  if (!runtime.nationalDexEnabled && data[tState] === EVOSTATE_WAIT_CYCLE_MON_SPRITE && data[tPostEvoSpecies] > SPECIES_MEW) {
    data[tState] = EVOSTATE_CANCEL;
    data[tEvoWasStopped] = 1;
    task(runtime, runtime.gBattleCommunication[2]).data[tEvoStopped] = 1;
    StopBgAnimation(runtime);
    return;
  }

  if (runtime.heldKeys === B_BUTTON && data[tState] === EVOSTATE_WAIT_CYCLE_MON_SPRITE && task(runtime, runtime.gBattleCommunication[2]).isActive && (data[tBits] & TASK_BIT_CAN_STOP) !== 0) {
    data[tState] = EVOSTATE_CANCEL;
    task(runtime, runtime.gBattleCommunication[2]).data[tEvoStopped] = 1;
    StopBgAnimation(runtime);
    return;
  }

  switch (data[tState]) {
    case EVOSTATE_FADE_IN:
      BeginNormalPaletteFade(runtime, 0xffffffff, 0, 0x10, 0, 'RGB_BLACK');
      sprite(runtime, runtime.sEvoStructPtr!.preEvoSpriteId).invisible = false;
      data[tState]++;
      [0, 1, 2, 3].forEach((bg) => ShowBg(runtime, bg));
      break;
    case EVOSTATE_INTRO_MSG:
      if (!runtime.gPaletteFadeActive) {
        BattlePutTextOnWindow(runtime, 'gText_PkmnIsEvolving');
        data[tState]++;
      }
      break;
    case EVOSTATE_INTRO_MON_ANIM:
      if (!runtime.textPrinterActive) {
        PlayCry_Normal(runtime, data[tPreEvoSpecies]);
        data[tState]++;
      }
      break;
    case EVOSTATE_INTRO_SOUND:
      if (runtime.cryFinished) {
        PlaySE(runtime, 'MUS_EVOLUTION_INTRO');
        data[tState]++;
      }
      break;
    case EVOSTATE_START_MUSIC:
      if (!runtime.sePlaying) {
        PlayNewMapMusic(runtime, 'MUS_EVOLUTION');
        data[tState]++;
        BeginNormalPaletteFade(runtime, 0x1c, 4, 0, 0x10, 'RGB_BLACK');
      }
      break;
    case EVOSTATE_START_BG_AND_SPARKLE_SPIRAL:
      if (!runtime.gPaletteFadeActive) {
        StartBgAnimation(runtime, false);
        runtime.gBattleCommunication[2] = EvolutionSparkles_SpiralUpward(runtime, 17);
        data[tState]++;
      }
      break;
    case EVOSTATE_SPARKLE_ARC:
      if (!task(runtime, runtime.gBattleCommunication[2]).isActive) {
        data[tState]++;
        runtime.sEvoStructPtr!.delayTimer = 1;
        runtime.gBattleCommunication[2] = EvolutionSparkles_ArcDown(runtime);
      }
      break;
    case EVOSTATE_CYCLE_MON_SPRITE:
      if (!task(runtime, runtime.gBattleCommunication[2]).isActive) {
        runtime.gBattleCommunication[2] = CycleEvolutionMonSprite(runtime, runtime.sEvoStructPtr!.preEvoSpriteId, runtime.sEvoStructPtr!.postEvoSpriteId);
        data[tState]++;
      }
      break;
    case EVOSTATE_WAIT_CYCLE_MON_SPRITE:
      runtime.sEvoStructPtr!.delayTimer--;
      if (runtime.sEvoStructPtr!.delayTimer === 0) {
        runtime.sEvoStructPtr!.delayTimer = 3;
        if (!task(runtime, runtime.gBattleCommunication[2]).isActive) data[tState]++;
      }
      break;
    case EVOSTATE_SPARKLE_CIRCLE:
      runtime.gBattleCommunication[2] = EvolutionSparkles_CircleInward(runtime);
      data[tState]++;
      break;
    case EVOSTATE_SPARKLE_SPRAY:
      if (!task(runtime, runtime.gBattleCommunication[2]).isActive) {
        runtime.gBattleCommunication[2] = EvolutionSparkles_SprayAndFlash(runtime, data[tPostEvoSpecies]);
        data[tState]++;
      }
      break;
    case EVOSTATE_EVO_SOUND:
      if (!task(runtime, runtime.gBattleCommunication[2]).isActive) {
        PlaySE(runtime, 'SE_EXP');
        data[tState]++;
      }
      break;
    case EVOSTATE_RESTORE_SCREEN:
      if (runtime.sePlaying) {
        m4aMPlayAllStop(runtime);
        runtime.palette.splice(32, runtime.sEvoStructPtr!.savedPalette.length, ...runtime.sEvoStructPtr!.savedPalette);
        RestoreBgAfterAnim(runtime);
        BeginNormalPaletteFade(runtime, 0x1c, 0, 0x10, 0, 'RGB_BLACK');
        data[tState]++;
      }
      break;
    case EVOSTATE_EVO_MON_ANIM:
      if (!runtime.gPaletteFadeActive) {
        PlayCry_Normal(runtime, data[tPostEvoSpecies]);
        data[tState]++;
      }
      break;
    case EVOSTATE_SET_MON_EVOLVED:
      if (runtime.cryFinished) {
        BattlePutTextOnWindow(runtime, 'gText_CongratsPkmnEvolved');
        PlayBGM(runtime, 'MUS_EVOLVED');
        data[tState]++;
        mon.species = data[tPostEvoSpecies];
        CalculateMonStats(runtime, mon);
        EvolutionRenameMon(runtime, mon, data[tPreEvoSpecies], data[tPostEvoSpecies]);
        GetSetPokedexFlag(runtime, data[tPostEvoSpecies], 'SEEN');
        GetSetPokedexFlag(runtime, data[tPostEvoSpecies], 'CAUGHT');
        runtime.gameStats.push('GAME_STAT_EVOLVED_POKEMON');
      }
      break;
    case EVOSTATE_TRY_LEARN_MOVE:
      if (!runtime.textPrinterActive) {
        HelpSystem_Enable(runtime);
        const moveResult = MonTryLearningNewMove(runtime);
        if (moveResult !== MOVE_NONE && data[tEvoWasStopped] === 0) {
          StopMapMusic(runtime);
          Overworld_PlaySpecialMapMusic(runtime);
          data[tBits] |= TASK_BIT_LEARN_MOVE;
          data[tLearnsFirstMove] = 0;
          data[tLearnMoveState] = MVSTATE_INTRO_MSG_1;
          op(runtime, `StringCopy_Nickname(${mon.nickname})`);
          if (moveResult === MON_HAS_MAX_MOVES) data[tState] = EVOSTATE_REPLACE_MOVE;
          else if (moveResult !== MON_ALREADY_KNOWS_MOVE) data[tState] = EVOSTATE_LEARNED_MOVE;
        } else {
          BeginNormalPaletteFade(runtime, 0xffffffff, 0, 0, 0x10, 'RGB_BLACK');
          data[tState]++;
        }
      }
      break;
    case EVOSTATE_END:
      if (!runtime.gPaletteFadeActive) {
        if ((data[tBits] & TASK_BIT_LEARN_MOVE) === 0) {
          StopMapMusic(runtime);
          Overworld_PlaySpecialMapMusic(runtime);
        }
        if (data[tEvoWasStopped] === 0) CreateShedinja(runtime, data[tPreEvoSpecies], mon);
        DestroyTask(runtime, taskId);
        FreeMonSpritesGfx(runtime);
        runtime.sEvoStructPtr = null;
        FreeAllWindowBuffers(runtime);
        runtime.mainCallback = runtime.gCB2_AfterEvolution;
      }
      break;
    case EVOSTATE_CANCEL:
      if (!task(runtime, runtime.gBattleCommunication[2]).isActive) {
        m4aMPlayAllStop(runtime);
        BeginNormalPaletteFade(runtime, 0x6001c, 0, 0x10, 0, 'RGB_WHITE');
        data[tState]++;
      }
      break;
    case EVOSTATE_CANCEL_MON_ANIM:
      if (!runtime.gPaletteFadeActive) {
        PlayCry_Normal(runtime, data[tPreEvoSpecies]);
        data[tState]++;
      }
      break;
    case EVOSTATE_CANCEL_MSG:
      if (runtime.cryFinished) {
        BattlePutTextOnWindow(runtime, data[tEvoWasStopped] !== 0 ? 'gText_EllipsisQuestionMark' : 'gText_PkmnStoppedEvolving');
        data[tEvoWasStopped] = 1;
        data[tState] = EVOSTATE_TRY_LEARN_MOVE;
      }
      break;
    case EVOSTATE_LEARNED_MOVE:
      if (!runtime.textPrinterActive && !runtime.sePlaying) {
        op(runtime, 'BufferMoveToLearnIntoBattleTextBuff2');
        PlayFanfare(runtime, 'MUS_LEVEL_UP');
        BattlePutTextOnWindow(runtime, 'STRINGID_PKMNLEARNEDMOVE');
        data[tLearnsFirstMove] = 0x40;
        data[tState]++;
      }
      break;
    case EVOSTATE_TRY_LEARN_ANOTHER_MOVE:
      if (!runtime.textPrinterActive && !runtime.sePlaying && --data[tLearnsFirstMove] === 0) data[tState] = EVOSTATE_TRY_LEARN_MOVE;
      break;
    case EVOSTATE_REPLACE_MOVE:
      runReplaceMove(runtime, data, mon, false);
      break;
  }
};

const runReplaceMove = (runtime: EvolutionRuntime, data: number[], mon: Pokemon, isTrade: boolean): void => {
  const text = isTrade ? DrawTextOnTradeWindow : BattlePutTextOnWindow;
  switch (data[tLearnMoveState]) {
    case MVSTATE_INTRO_MSG_1:
      if (!runtime.textPrinterActive && !runtime.sePlaying) {
        op(runtime, 'BufferMoveToLearnIntoBattleTextBuff2');
        text(runtime, 'STRINGID_TRYTOLEARNMOVE1');
        data[tLearnMoveState]++;
      }
      break;
    case MVSTATE_INTRO_MSG_2:
      if (!runtime.textPrinterActive && !runtime.sePlaying) {
        text(runtime, 'STRINGID_TRYTOLEARNMOVE2');
        data[tLearnMoveState]++;
      }
      break;
    case MVSTATE_INTRO_MSG_3:
      if (!runtime.textPrinterActive && !runtime.sePlaying) {
        text(runtime, 'STRINGID_TRYTOLEARNMOVE3');
        data[tLearnMoveYesState] = isTrade ? T_MVSTATE_SHOW_MOVE_SELECT : MVSTATE_SHOW_MOVE_SELECT;
        data[tLearnMoveNoState] = isTrade ? T_MVSTATE_ASK_CANCEL : MVSTATE_ASK_CANCEL;
        data[tLearnMoveState]++;
      }
    case MVSTATE_PRINT_YES_NO:
      if (!runtime.textPrinterActive && !runtime.sePlaying) {
        op(runtime, isTrade ? 'CreateYesNoMenu' : 'BattleCreateYesNoCursorAt');
        data[tLearnMoveState]++;
        runtime.gBattleCommunication[1] = 0;
      }
      break;
    case MVSTATE_HANDLE_YES_NO:
      if (isTrade) {
        const input = Menu_ProcessInputNoWrapClearOnChoose(runtime);
        if (input === 0 || input === 1 || input === -1) {
          runtime.gBattleCommunication[1] = input === 0 ? 0 : 1;
          text(runtime, 'STRINGID_EMPTYSTRING3');
          data[tLearnMoveState] = input === 0 ? data[tLearnMoveYesState] : data[tLearnMoveNoState];
          if (data[tLearnMoveState] === T_MVSTATE_SHOW_MOVE_SELECT) BeginNormalPaletteFade(runtime, 0xffffffff, 0, 0, 0x10, 'RGB_BLACK');
        }
      } else {
        if ((runtime.newKeys & DPAD_UP) !== 0 && runtime.gBattleCommunication[1] !== 0) {
          PlaySE(runtime, 'SE_SELECT');
          runtime.gBattleCommunication[1] = 0;
          op(runtime, 'BattleCreateYesNoCursorAt');
        }
        if ((runtime.newKeys & DPAD_DOWN) !== 0 && runtime.gBattleCommunication[1] === 0) {
          PlaySE(runtime, 'SE_SELECT');
          runtime.gBattleCommunication[1] = 1;
          op(runtime, 'BattleCreateYesNoCursorAt');
        }
        if ((runtime.newKeys & A_BUTTON) !== 0) {
          PlaySE(runtime, 'SE_SELECT');
          data[tLearnMoveState] = runtime.gBattleCommunication[1] !== 0 ? data[tLearnMoveNoState] : data[tLearnMoveYesState];
          if (data[tLearnMoveState] === MVSTATE_SHOW_MOVE_SELECT) BeginNormalPaletteFade(runtime, 0xffffffff, 0, 0, 0x10, 'RGB_BLACK');
        }
        if ((runtime.newKeys & B_BUTTON) !== 0) {
          PlaySE(runtime, 'SE_SELECT');
          data[tLearnMoveState] = data[tLearnMoveNoState];
        }
      }
      break;
    case MVSTATE_SHOW_MOVE_SELECT:
      if (!runtime.gPaletteFadeActive) {
        if (isTrade && runtime.wirelessCommType !== 0) op(runtime, 'DestroyWirelessStatusIndicatorSprite');
        FreeAllWindowBuffers(runtime);
        op(runtime, isTrade ? 'ShowSelectMovePokemonSummaryScreen(CB2_TradeEvolutionSceneLoadGraphics)' : 'ShowSelectMovePokemonSummaryScreen(CB2_EvolutionSceneLoadGraphics)');
        data[tLearnMoveState]++;
      }
      break;
    case MVSTATE_HANDLE_MOVE_SELECT:
      if (!runtime.gPaletteFadeActive && runtime.mainCallback === (isTrade ? 'CB2_TradeEvolutionSceneUpdate' : 'CB2_EvolutionSceneUpdate')) {
        const slot = GetMoveSlotToReplace(runtime);
        if (slot === MAX_MON_MOVES) {
          data[tLearnMoveState] = isTrade ? T_MVSTATE_ASK_CANCEL : MVSTATE_ASK_CANCEL;
        } else {
          const move = mon.moves[slot] ?? 0;
          if (IsHMMove2(runtime, move)) {
            text(runtime, 'STRINGID_HMMOVESCANTBEFORGOTTEN');
            data[tLearnMoveState] = isTrade ? T_MVSTATE_RETRY_AFTER_HM : MVSTATE_RETRY_AFTER_HM;
          } else {
            op(runtime, `PREPARE_MOVE_BUFFER(${move})`);
            RemoveMonPPBonus(runtime, slot);
            SetMonMoveSlot(runtime, mon, runtime.moveToLearn, slot);
            if (isTrade) text(runtime, 'STRINGID_123POOF');
            data[tLearnMoveState]++;
          }
        }
      }
      break;
    case MVSTATE_FORGET_MSG_1:
      text(runtime, 'STRINGID_123POOF');
      data[tLearnMoveState]++;
      break;
    case MVSTATE_FORGET_MSG_2:
      if (!runtime.textPrinterActive && !runtime.sePlaying) {
        text(runtime, 'STRINGID_PKMNFORGOTMOVE');
        data[tLearnMoveState]++;
      }
      break;
    case MVSTATE_LEARNED_MOVE:
      if (!runtime.textPrinterActive && !runtime.sePlaying) {
        text(runtime, 'STRINGID_ANDELLIPSIS');
        data[tState] = isTrade ? T_EVOSTATE_LEARNED_MOVE : EVOSTATE_LEARNED_MOVE;
      }
      break;
    case MVSTATE_ASK_CANCEL:
      text(runtime, 'STRINGID_STOPLEARNINGMOVE');
      data[tLearnMoveYesState] = isTrade ? T_MVSTATE_CANCEL : MVSTATE_CANCEL;
      data[tLearnMoveNoState] = isTrade ? T_MVSTATE_INTRO_MSG_1 : MVSTATE_INTRO_MSG_1;
      data[tLearnMoveState] = isTrade ? T_MVSTATE_PRINT_YES_NO : MVSTATE_PRINT_YES_NO;
      break;
    case MVSTATE_CANCEL:
      text(runtime, 'STRINGID_DIDNOTLEARNMOVE');
      data[tState] = isTrade ? T_EVOSTATE_TRY_LEARN_MOVE : EVOSTATE_TRY_LEARN_MOVE;
      break;
    case MVSTATE_RETRY_AFTER_HM:
      if (!runtime.textPrinterActive && !runtime.sePlaying) data[tLearnMoveState] = isTrade ? T_MVSTATE_SHOW_MOVE_SELECT : MVSTATE_SHOW_MOVE_SELECT;
      break;
  }
};

export const Task_TradeEvolutionScene = (runtime: EvolutionRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  const mon = runtime.playerParty[data[tPartyId]]!;
  if (!runtime.nationalDexEnabled && data[tState] === T_EVOSTATE_WAIT_CYCLE_MON_SPRITE && data[tPostEvoSpecies] > SPECIES_MEW) {
    data[tState] = EVOSTATE_TRY_LEARN_MOVE;
    data[tEvoWasStopped] = 1;
    if (task(runtime, runtime.gBattleCommunication[2]).isActive) {
      task(runtime, runtime.gBattleCommunication[2]).data[tEvoStopped] = 1;
      StopBgAnimation(runtime);
    }
  }

  switch (data[tState]) {
    case T_EVOSTATE_INTRO_MSG:
      DrawTextOnTradeWindow(runtime, 'gText_PkmnIsEvolving');
      data[tState]++;
      break;
    case T_EVOSTATE_INTRO_CRY:
      if (!runtime.textPrinterActive) {
        PlayCry_Normal(runtime, data[tPreEvoSpecies]);
        data[tState]++;
      }
      break;
    case T_EVOSTATE_INTRO_SOUND:
      if (runtime.cryFinished) {
        m4aSongNumStop(runtime, 'MUS_EVOLUTION');
        PlaySE(runtime, 'MUS_EVOLUTION_INTRO');
        data[tState]++;
      }
      break;
    case T_EVOSTATE_START_MUSIC:
      if (!runtime.sePlaying) {
        PlayBGM(runtime, 'MUS_EVOLUTION');
        data[tState]++;
        BeginNormalPaletteFade(runtime, 0x1c, 4, 0, 0x10, 'RGB_BLACK');
      }
      break;
    case T_EVOSTATE_START_BG_AND_SPARKLE_SPIRAL:
      if (!runtime.gPaletteFadeActive) {
        StartBgAnimation(runtime, true);
        runtime.gBattleCommunication[2] = EvolutionSparkles_SpiralUpward(runtime, sprite(runtime, runtime.sEvoStructPtr!.preEvoSpriteId).oam.paletteNum + 16);
        data[tState]++;
        op(runtime, 'SetGpuReg(REG_OFFSET_BG3CNT)');
      }
      break;
    case T_EVOSTATE_SPARKLE_ARC:
      if (!task(runtime, runtime.gBattleCommunication[2]).isActive) {
        data[tState]++;
        runtime.sEvoStructPtr!.delayTimer = 1;
        runtime.gBattleCommunication[2] = EvolutionSparkles_ArcDown(runtime);
      }
      break;
    case T_EVOSTATE_CYCLE_MON_SPRITE:
      if (!task(runtime, runtime.gBattleCommunication[2]).isActive) {
        runtime.gBattleCommunication[2] = CycleEvolutionMonSprite(runtime, runtime.sEvoStructPtr!.preEvoSpriteId, runtime.sEvoStructPtr!.postEvoSpriteId);
        data[tState]++;
      }
      break;
    case T_EVOSTATE_WAIT_CYCLE_MON_SPRITE:
      runtime.sEvoStructPtr!.delayTimer--;
      if (runtime.sEvoStructPtr!.delayTimer === 0) {
        runtime.sEvoStructPtr!.delayTimer = 3;
        if (!task(runtime, runtime.gBattleCommunication[2]).isActive) data[tState]++;
      }
      break;
    case T_EVOSTATE_SPARKLE_CIRCLE:
      runtime.gBattleCommunication[2] = EvolutionSparkles_CircleInward(runtime);
      data[tState]++;
      break;
    case T_EVOSTATE_SPARKLE_SPRAY:
      if (!task(runtime, runtime.gBattleCommunication[2]).isActive) {
        runtime.gBattleCommunication[2] = EvolutionSparkles_SprayAndFlash_Trade(runtime, data[tPostEvoSpecies]);
        data[tState]++;
      }
      break;
    case T_EVOSTATE_EVO_SOUND:
      if (!task(runtime, runtime.gBattleCommunication[2]).isActive) {
        PlaySE(runtime, 'SE_EXP');
        data[tState]++;
      }
      break;
    case T_EVOSTATE_EVO_MON_ANIM:
      if (runtime.sePlaying) {
        PlayCry_Normal(runtime, data[tPostEvoSpecies]);
        runtime.palette.splice(32, runtime.sEvoStructPtr!.savedPalette.length, ...runtime.sEvoStructPtr!.savedPalette);
        data[tState]++;
      }
      break;
    case T_EVOSTATE_SET_MON_EVOLVED:
      if (runtime.cryFinished) {
        DrawTextOnTradeWindow(runtime, 'gText_CongratsPkmnEvolved');
        PlayFanfare(runtime, 'MUS_EVOLVED');
        data[tState]++;
        mon.species = data[tPostEvoSpecies];
        CalculateMonStats(runtime, mon);
        EvolutionRenameMon(runtime, mon, data[tPreEvoSpecies], data[tPostEvoSpecies]);
        GetSetPokedexFlag(runtime, data[tPostEvoSpecies], 'SEEN');
        GetSetPokedexFlag(runtime, data[tPostEvoSpecies], 'CAUGHT');
        runtime.gameStats.push('GAME_STAT_EVOLVED_POKEMON');
      }
      break;
    case T_EVOSTATE_TRY_LEARN_MOVE:
      if (!runtime.textPrinterActive && runtime.fanfareInactive) {
        const moveResult = MonTryLearningNewMove(runtime);
        if (moveResult !== MOVE_NONE && data[tEvoWasStopped] === 0) {
          data[tBits] |= TASK_BIT_LEARN_MOVE;
          data[tLearnsFirstMove] = 0;
          data[tLearnMoveState] = 0;
          op(runtime, `StringCopy_Nickname(${mon.nickname})`);
          if (moveResult === MON_HAS_MAX_MOVES) data[tState] = T_EVOSTATE_REPLACE_MOVE;
          else if (moveResult !== MON_ALREADY_KNOWS_MOVE) data[tState] = T_EVOSTATE_LEARNED_MOVE;
        } else {
          PlayBGM(runtime, 'MUS_EVOLUTION');
          DrawTextOnTradeWindow(runtime, 'gText_CommunicationStandby5');
          data[tState]++;
        }
      }
      break;
    case T_EVOSTATE_END:
      if (!runtime.textPrinterActive) {
        DestroyTask(runtime, taskId);
        runtime.sEvoStructPtr = null;
        runtime.textFlagsUseAlternateDownArrow = false;
        runtime.mainCallback = runtime.gCB2_AfterEvolution;
      }
      break;
    case T_EVOSTATE_CANCEL:
      if (!task(runtime, runtime.gBattleCommunication[2]).isActive) {
        m4aMPlayAllStop(runtime);
        BeginNormalPaletteFade(runtime, 0x4001c, 0, 0x10, 0, 'RGB_WHITE');
        data[tState]++;
      }
      break;
    case T_EVOSTATE_CANCEL_MON_ANIM:
      if (!runtime.gPaletteFadeActive) {
        PlayCry_Normal(runtime, data[tPreEvoSpecies]);
        data[tState]++;
      }
      break;
    case T_EVOSTATE_CANCEL_MSG:
      if (runtime.cryFinished) {
        DrawTextOnTradeWindow(runtime, 'gText_EllipsisQuestionMark');
        data[tEvoWasStopped] = 1;
        data[tState] = T_EVOSTATE_TRY_LEARN_MOVE;
      }
      break;
    case T_EVOSTATE_LEARNED_MOVE:
      if (!runtime.textPrinterActive && !runtime.sePlaying) {
        op(runtime, 'BufferMoveToLearnIntoBattleTextBuff2');
        PlayFanfare(runtime, 'MUS_LEVEL_UP');
        DrawTextOnTradeWindow(runtime, 'STRINGID_PKMNLEARNEDMOVE');
        data[tLearnsFirstMove] = 0x40;
        data[tState]++;
      }
      break;
    case T_EVOSTATE_TRY_LEARN_ANOTHER_MOVE:
      if (!runtime.textPrinterActive && runtime.fanfareInactive && --data[tLearnsFirstMove] === 0) data[tState] = T_EVOSTATE_TRY_LEARN_MOVE;
      break;
    case T_EVOSTATE_REPLACE_MOVE:
      runReplaceMove(runtime, data, mon, true);
      break;
  }
};

export const Task_UpdateBgPalette = (runtime: EvolutionRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  if (data[6] !== 0) return;
  if (data[5]++ < 20) return;
  const control = sBgAnim_PaletteControl[data[2]]!;
  if (data[0]++ > control[3]!) {
    if (control[1] === data[1]) {
      data[3]++;
      if (data[3] === control[2]) {
        data[3] = 0;
        data[2]++;
      }
      data[1] = sBgAnim_PaletteControl[data[2]]?.[0] ?? data[1];
    } else {
      loadPalette(runtime, runtime.sBgAnimPal!.slice(data[1] * 16, data[1] * 16 + 16), 10 * 16);
      data[0] = 0;
      data[1]++;
    }
  }
  if (data[2] === sBgAnim_PaletteControl[0]!.length) DestroyTask(runtime, taskId);
};

export const CreateBgAnimTask = (runtime: EvolutionRuntime, isLink: boolean): void => {
  const taskId = CreateTask(runtime, 'Task_AnimateBg', 7);
  task(runtime, taskId).data[2] = isLink ? 1 : 0;
};

const cos = (angle: number, amplitude: number): number => Math.trunc(Math.cos((angle / 128) * Math.PI) * amplitude);
const sin = (angle: number, amplitude: number): number => Math.trunc(Math.sin((angle / 128) * Math.PI) * amplitude);

export const Task_AnimateBg = (runtime: EvolutionRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  data[0] = (data[0] + 5) & 0xff;
  data[1] = (data[0] + 0x80) & 0xff;
  runtime.gBattle_BG1_X = cos(data[0], 4) + 8;
  runtime.gBattle_BG1_Y = sin(data[0], 4) + 16;
  if (data[2] === 0) {
    runtime.gBattle_BG2_X = cos(data[1], 4) + 8;
    runtime.gBattle_BG2_Y = sin(data[1], 4) + 16;
  } else {
    runtime.gBattle_BG3_X = cos(data[1], 4) + 8;
    runtime.gBattle_BG3_Y = sin(data[1], 4) + 16;
  }
  if (!FuncIsActiveTask(runtime, 'Task_UpdateBgPalette')) {
    DestroyTask(runtime, taskId);
    runtime.gBattle_BG1_X = 0;
    runtime.gBattle_BG1_Y = 0;
    if (data[2] === 0) {
      runtime.gBattle_BG2_X = 256;
      runtime.gBattle_BG2_Y = 0;
    } else {
      runtime.gBattle_BG3_X = 256;
      runtime.gBattle_BG3_Y = 0;
    }
  }
};

export const InitMovingBgPalette = (palette: number[]): void => {
  for (let i = 0; i < sBgAnim_PalIndexes.length; i++) {
    for (let j = 0; j < 16; j++) palette[i * 16 + j] = sBgAnim_Pal[sBgAnim_PalIndexes[i]![j]!]!;
  }
};

export const StartBgAnimation = (runtime: EvolutionRuntime, isLink: boolean): void => {
  runtime.sBgAnimPal = Array(0x640 / 2).fill(0);
  InitMovingBgPalette(runtime.sBgAnimPal);
  loadPalette(runtime, Array(16).fill(0), 10 * 16);
  op(runtime, 'DecompressAndLoadBgGfxUsingHeap');
  if (!isLink) {
    op(runtime, 'SetGpuReg(BLDCNT_BG1_BG2)');
    ShowBg(runtime, 1);
    ShowBg(runtime, 2);
  } else {
    op(runtime, 'SetGpuReg(BLDCNT_BG1_BG3)');
  }
  CreateTask(runtime, 'Task_UpdateBgPalette', 5);
  CreateBgAnimTask(runtime, isLink);
};

export const IsMovingBackgroundTaskRunning = (runtime: EvolutionRuntime): void => {
  const taskId = FindTaskIdByFunc(runtime, 'Task_UpdateBgPalette');
  if (taskId !== TASK_NONE) task(runtime, taskId).data[6] = 1;
  loadPalette(runtime, Array(16).fill(0), 10 * 16);
};

export const StopBgAnimation = (runtime: EvolutionRuntime): void => {
  let taskId = FindTaskIdByFunc(runtime, 'Task_UpdateBgPalette');
  if (taskId !== TASK_NONE) DestroyTask(runtime, taskId);
  taskId = FindTaskIdByFunc(runtime, 'Task_AnimateBg');
  if (taskId !== TASK_NONE) DestroyTask(runtime, taskId);
  loadPalette(runtime, Array(16).fill(0), 10 * 16);
  RestoreBgAfterAnim(runtime);
};

export const RestoreBgAfterAnim = (runtime: EvolutionRuntime): void => {
  op(runtime, 'SetGpuReg(REG_OFFSET_BLDCNT,0)');
  runtime.gBattle_BG1_X = 0;
  runtime.gBattle_BG1_Y = 0;
  runtime.gBattle_BG2_X = 0;
  op(runtime, 'SetBattleBgPriorities');
  runtime.sBgAnimPal = null;
};
