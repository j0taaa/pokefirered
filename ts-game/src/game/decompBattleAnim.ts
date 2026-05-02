export const ANIM_ARGS_COUNT = 8;
export const ANIM_SPRITE_INDEX_COUNT = 8;
export const MAX_BATTLERS_COUNT = 4;
export const TASK_NONE = 0xff;
export const SPRITE_NONE = 0xff;
export const SOUND_PAN_ATTACKER = -64;
export const SOUND_PAN_TARGET = 63;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const ANIM_ATK_PARTNER = 2;
export const ANIM_DEF_PARTNER = 3;
export const ANIMSPRITE_IS_TARGET = 0x80;
export const BIT_FLANK = 2;
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_OPPONENT_RIGHT = 3;
export const SPECIES_UNOWN = 201;

export const CMD_LOADSPRITEGFX = 0x00;
export const CMD_UNLOADSPRITEGFX = 0x01;
export const CMD_CREATESPRITE = 0x02;
export const CMD_CREATEVISUALTASK = 0x03;
export const CMD_DELAY = 0x04;
export const CMD_WAITFORVISUALFINISH = 0x05;
export const CMD_NOP = 0x06;
export const CMD_NOP2 = 0x07;
export const CMD_END = 0x08;
export const CMD_PLAYSE = 0x09;
export const CMD_MONBG = 0x0a;
export const CMD_CLEARMONBG = 0x0b;
export const CMD_SETALPHA = 0x0c;
export const CMD_BLENDOFF = 0x0d;
export const CMD_CALL = 0x0e;
export const CMD_RETURN = 0x0f;
export const CMD_SETARG = 0x10;
export const CMD_CHOOSETWOTURNANIM = 0x11;
export const CMD_JUMPIFMOVETURN = 0x12;
export const CMD_GOTO = 0x13;
export const CMD_FADETOBG = 0x14;
export const CMD_RESTOREBG = 0x15;
export const CMD_WAITBGFADEOUT = 0x16;
export const CMD_WAITBGFADEIN = 0x17;
export const CMD_CHANGEBG = 0x18;
export const CMD_PLAYSEWITHPAN = 0x19;
export const CMD_SETPAN = 0x1a;
export const CMD_PANSE = 0x1b;
export const CMD_LOOPSEWITHPAN = 0x1c;
export const CMD_WAITPLAYSEWITHPAN = 0x1d;
export const CMD_SETBLDCNT = 0x1e;
export const CMD_CREATESOUNDTASK = 0x1f;
export const CMD_WAITSOUND = 0x20;
export const CMD_JUMPARGEQ = 0x21;
export const CMD_MONBG_STATIC = 0x22;
export const CMD_CLEARMONBG_STATIC = 0x23;
export const CMD_JUMPIFCONTEST = 0x24;
export const CMD_FADETOBGFROMSET = 0x25;
export const CMD_PANSE_ADJUSTNONE = 0x26;
export const CMD_PANSE_ADJUSTALL = 0x27;
export const CMD_SPLITBGPRIO = 0x28;
export const CMD_SPLITBGPRIO_ALL = 0x29;
export const CMD_SPLITBGPRIO_FOES = 0x2a;
export const CMD_INVISIBLE = 0x2b;
export const CMD_VISIBLE = 0x2c;
export const CMD_TEAMATTACK_MOVEBACK = 0x2d;
export const CMD_TEAMATTACK_MOVEFWD = 0x2e;
export const CMD_STOPSOUND = 0x2f;

export interface BattleAnimTask {
  id: number;
  func: string;
  data: number[];
  isActive: boolean;
}

export interface BattleAnimSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  invisible: boolean;
  oam: { priority: number };
}

export interface BattleAnimRuntime {
  script: number[];
  scriptPtr: number;
  scriptRetAddr: number;
  gAnimScriptCallback: 'RunAnimScriptCommand' | 'WaitAnimFrameCount' | null;
  sAnimFramesToWait: number;
  gAnimScriptActive: boolean;
  gAnimVisualTaskCount: number;
  gAnimSoundTaskCount: number;
  gAnimDisableStructPtr: unknown | null;
  gAnimMoveDmg: number;
  gAnimMovePower: number;
  sAnimSpriteIndexArray: number[];
  gAnimFriendship: number;
  gWeatherMoveAnim: number;
  gBattleAnimArgs: number[];
  sSoundAnimFramesToWait: number;
  sMonAnimTaskIdArray: number[];
  gAnimMoveTurn: number;
  sAnimBackgroundFadeState: number;
  sAnimMoveIndex: number;
  gBattleAnimAttacker: number;
  gBattleAnimTarget: number;
  gAnimBattlerSpecies: number[];
  gAnimCustomPanning: number;
  gBattlerAttacker: number;
  gBattlerTarget: number;
  gBattlerPartyIndexes: number[];
  battlerSides: number[];
  battlerPositions: number[];
  battlerSpriteIds: number[];
  battlerSpecies: number[];
  battlerSpritePresent: boolean[];
  battlerDataInvisible: boolean[];
  statusAnimActive: boolean[];
  battlerSubpriorities: number[];
  battlerBgPriorityRanks: number[];
  isDoubleBattle: boolean;
  sePlaying: boolean;
  paletteFadeActive: boolean;
  gBattle_BG1_X: number;
  gBattle_BG1_Y: number;
  gBattle_BG2_X: number;
  gBattle_BG2_Y: number;
  gBattle_WIN0H: number;
  gBattle_WIN0V: number;
  gBattle_WIN1H: number;
  gBattle_WIN1V: number;
  tasks: BattleAnimTask[];
  sprites: BattleAnimSprite[];
  nextTaskId: number;
  nextSpriteId: number;
  createdSprites: { template: number; x: number; y: number; subpriority: number }[];
  operations: string[];
}

export const createBattleAnimRuntime = (overrides: Partial<BattleAnimRuntime> = {}): BattleAnimRuntime => {
  const runtime: BattleAnimRuntime = {
    script: [],
    scriptPtr: 0,
    scriptRetAddr: 0,
    gAnimScriptCallback: null,
    sAnimFramesToWait: 0,
    gAnimScriptActive: false,
    gAnimVisualTaskCount: 0,
    gAnimSoundTaskCount: 0,
    gAnimDisableStructPtr: null,
    gAnimMoveDmg: 0,
    gAnimMovePower: 0,
    sAnimSpriteIndexArray: Array(ANIM_SPRITE_INDEX_COUNT).fill(0xffff),
    gAnimFriendship: 0,
    gWeatherMoveAnim: 0,
    gBattleAnimArgs: Array(ANIM_ARGS_COUNT).fill(0),
    sSoundAnimFramesToWait: 0,
    sMonAnimTaskIdArray: [TASK_NONE, TASK_NONE],
    gAnimMoveTurn: 0,
    sAnimBackgroundFadeState: 0,
    sAnimMoveIndex: 0,
    gBattleAnimAttacker: 0,
    gBattleAnimTarget: 1,
    gAnimBattlerSpecies: Array(MAX_BATTLERS_COUNT).fill(0),
    gAnimCustomPanning: 0,
    gBattlerAttacker: 0,
    gBattlerTarget: 1,
    gBattlerPartyIndexes: [0, 0, 0, 0],
    battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT, B_SIDE_PLAYER, B_SIDE_OPPONENT],
    battlerPositions: [B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT],
    battlerSpriteIds: [0, 1, 2, 3],
    battlerSpecies: [1, 2, 3, 4],
    battlerSpritePresent: [true, true, true, true],
    battlerDataInvisible: [false, false, false, false],
    statusAnimActive: [false, false, false, false],
    battlerSubpriorities: [10, 20, 30, 40],
    battlerBgPriorityRanks: [1, 2, 1, 2],
    isDoubleBattle: true,
    sePlaying: false,
    paletteFadeActive: false,
    gBattle_BG1_X: 0,
    gBattle_BG1_Y: 0,
    gBattle_BG2_X: 0,
    gBattle_BG2_Y: 0,
    gBattle_WIN0H: 0,
    gBattle_WIN0V: 0,
    gBattle_WIN1H: 0,
    gBattle_WIN1V: 0,
    tasks: [],
    sprites: [
      { id: 0, x: 40, y: 50, x2: 0, y2: 0, invisible: false, oam: { priority: 2 } },
      { id: 1, x: 120, y: 50, x2: 0, y2: 0, invisible: false, oam: { priority: 2 } },
      { id: 2, x: 70, y: 70, x2: 0, y2: 0, invisible: false, oam: { priority: 2 } },
      { id: 3, x: 150, y: 70, x2: 0, y2: 0, invisible: false, oam: { priority: 2 } }
    ],
    nextTaskId: 0,
    nextSpriteId: 4,
    createdSprites: [],
    operations: []
  };
  return { ...runtime, ...overrides };
};

const op = (runtime: BattleAnimRuntime, value: string): void => {
  runtime.operations.push(value);
};

const task = (runtime: BattleAnimRuntime, taskId: number): BattleAnimTask => {
  const found = runtime.tasks.find((entry) => entry.id === taskId);
  if (found === undefined) throw new Error(`Task ${taskId} not found`);
  return found;
};

const sprite = (runtime: BattleAnimRuntime, spriteId: number): BattleAnimSprite => {
  const found = runtime.sprites.find((entry) => entry.id === spriteId);
  if (found === undefined) throw new Error(`Sprite ${spriteId} not found`);
  return found;
};

const u16 = (runtime: BattleAnimRuntime, ptr: number): number => runtime.script[ptr]! | (runtime.script[ptr + 1]! << 8);
const s8 = (value: number): number => (value & 0x80) !== 0 ? value - 0x100 : value;
const ptr32 = (runtime: BattleAnimRuntime, ptr: number): number => runtime.script[ptr]! | (runtime.script[ptr + 1]! << 8) | (runtime.script[ptr + 2]! << 16) | (runtime.script[ptr + 3]! << 24);
export const ptrBytes = (ptr: number): number[] => [ptr & 0xff, (ptr >> 8) & 0xff, (ptr >> 16) & 0xff, (ptr >> 24) & 0xff];
export const wordBytes = (word: number): number[] => [word & 0xff, (word >> 8) & 0xff];
const trueSpriteIndex = (index: number): number => index & 0x3fff;

export const CreateTask = (runtime: BattleAnimRuntime, func: string): number => {
  const id = runtime.nextTaskId++;
  runtime.tasks.push({ id, func, data: Array(16).fill(0), isActive: true });
  return id;
};

export const DestroyTask = (runtime: BattleAnimRuntime, taskId: number): void => {
  const current = task(runtime, taskId);
  current.isActive = false;
  op(runtime, `DestroyTask(${current.func})`);
};

export const FindTaskIdByFunc = (runtime: BattleAnimRuntime, func: string): number => runtime.tasks.find((entry) => entry.func === func && entry.isActive)?.id ?? TASK_NONE;

export const ClearBattleAnimationVars = (runtime: BattleAnimRuntime): void => {
  runtime.sAnimFramesToWait = 0;
  runtime.gAnimScriptActive = false;
  runtime.gAnimVisualTaskCount = 0;
  runtime.gAnimSoundTaskCount = 0;
  runtime.gAnimDisableStructPtr = null;
  runtime.gAnimMoveDmg = 0;
  runtime.gAnimMovePower = 0;
  runtime.gAnimFriendship = 0;
  for (let i = 0; i < ANIM_SPRITE_INDEX_COUNT; i++) runtime.sAnimSpriteIndexArray[i] = 0xffff;
  for (let i = 0; i < ANIM_ARGS_COUNT; i++) runtime.gBattleAnimArgs[i] = 0;
  runtime.sMonAnimTaskIdArray[0] = TASK_NONE;
  runtime.sMonAnimTaskIdArray[1] = TASK_NONE;
  runtime.gAnimMoveTurn = 0;
  runtime.sAnimBackgroundFadeState = 0;
  runtime.sAnimMoveIndex = 0;
  runtime.gBattleAnimAttacker = 0;
  runtime.gBattleAnimTarget = 0;
  runtime.gAnimCustomPanning = 0;
};

export const DoMoveAnim = (runtime: BattleAnimRuntime, animsTable: number[][], move: number): void => {
  runtime.gBattleAnimAttacker = runtime.gBattlerAttacker;
  runtime.gBattleAnimTarget = runtime.gBattlerTarget;
  LaunchBattleAnimation(runtime, animsTable, move, true);
};

export const LaunchBattleAnimation = (runtime: BattleAnimRuntime, animsTable: number[][], tableId: number, isMoveAnim: boolean): void => {
  op(runtime, 'InitPrioritiesForVisibleBattlers');
  op(runtime, 'UpdateOamPriorityInAllHealthboxes(0)');
  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) runtime.gAnimBattlerSpecies[i] = runtime.battlerSpecies[i]!;
  runtime.sAnimMoveIndex = isMoveAnim ? tableId : 0;
  for (let i = 0; i < ANIM_ARGS_COUNT; i++) runtime.gBattleAnimArgs[i] = 0;
  runtime.sMonAnimTaskIdArray[0] = TASK_NONE;
  runtime.sMonAnimTaskIdArray[1] = TASK_NONE;
  runtime.script = animsTable[tableId] ?? [];
  runtime.scriptPtr = 0;
  runtime.gAnimScriptActive = true;
  runtime.sAnimFramesToWait = 0;
  runtime.gAnimScriptCallback = 'RunAnimScriptCommand';
  for (let i = 0; i < ANIM_SPRITE_INDEX_COUNT; i++) runtime.sAnimSpriteIndexArray[i] = 0xffff;
  runtime.gBattle_WIN0H = 0;
  runtime.gBattle_WIN0V = 0;
  runtime.gBattle_WIN1H = 0;
  runtime.gBattle_WIN1V = 0;
};

export const DestroyAnimSprite = (runtime: BattleAnimRuntime, spriteId: number): void => {
  sprite(runtime, spriteId).invisible = true;
  runtime.gAnimVisualTaskCount--;
};

export const DestroyAnimVisualTask = (runtime: BattleAnimRuntime, taskId: number): void => {
  DestroyTask(runtime, taskId);
  runtime.gAnimVisualTaskCount--;
};

export const DestroyAnimSoundTask = (runtime: BattleAnimRuntime, taskId: number): void => {
  DestroyTask(runtime, taskId);
  runtime.gAnimSoundTaskCount--;
};

export const AddSpriteIndex = (runtime: BattleAnimRuntime, index: number): void => {
  for (let i = 0; i < ANIM_SPRITE_INDEX_COUNT; i++) {
    if (runtime.sAnimSpriteIndexArray[i] === 0xffff) {
      runtime.sAnimSpriteIndexArray[i] = index;
      return;
    }
  }
};

export const ClearSpriteIndex = (runtime: BattleAnimRuntime, index: number): void => {
  for (let i = 0; i < ANIM_SPRITE_INDEX_COUNT; i++) {
    if (runtime.sAnimSpriteIndexArray[i] === index) {
      runtime.sAnimSpriteIndexArray[i] = 0xffff;
      return;
    }
  }
};

export const WaitAnimFrameCount = (runtime: BattleAnimRuntime): void => {
  if (runtime.sAnimFramesToWait <= 0) {
    runtime.gAnimScriptCallback = 'RunAnimScriptCommand';
    runtime.sAnimFramesToWait = 0;
  } else {
    runtime.sAnimFramesToWait--;
  }
};

export const RunAnimScriptCommand = (runtime: BattleAnimRuntime): void => {
  do {
    RunBattleAnimCommand(runtime);
  } while (runtime.sAnimFramesToWait === 0 && runtime.gAnimScriptActive);
};

export const RunBattleAnimCommand = (runtime: BattleAnimRuntime): void => {
  const command = runtime.script[runtime.scriptPtr];
  if (command === undefined) throw new Error(`No battle anim command at ${runtime.scriptPtr}`);
  scriptCmdTable[command]?.(runtime);
};

export const Cmd_loadspritegfx = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const index = u16(runtime, runtime.scriptPtr);
  op(runtime, `LoadCompressedSprite(${trueSpriteIndex(index)})`);
  runtime.scriptPtr += 2;
  AddSpriteIndex(runtime, trueSpriteIndex(index));
  runtime.sAnimFramesToWait = 1;
  runtime.gAnimScriptCallback = 'WaitAnimFrameCount';
};

export const Cmd_unloadspritegfx = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const index = u16(runtime, runtime.scriptPtr);
  op(runtime, `FreeSprite(${trueSpriteIndex(index)})`);
  runtime.scriptPtr += 2;
  ClearSpriteIndex(runtime, trueSpriteIndex(index));
};

export const Cmd_createsprite = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const template = ptr32(runtime, runtime.scriptPtr);
  runtime.scriptPtr += 4;
  let argVar = runtime.script[runtime.scriptPtr++]!;
  const argsCount = runtime.script[runtime.scriptPtr++]!;
  for (let i = 0; i < argsCount; i++) {
    runtime.gBattleAnimArgs[i] = u16(runtime, runtime.scriptPtr);
    runtime.scriptPtr += 2;
  }
  const battler = (argVar & ANIMSPRITE_IS_TARGET) !== 0 ? runtime.gBattleAnimTarget : runtime.gBattleAnimAttacker;
  if ((argVar & ANIMSPRITE_IS_TARGET) !== 0) argVar ^= ANIMSPRITE_IS_TARGET;
  const signed = argVar >= 64 ? argVar - 64 : -argVar;
  let subpriority = runtime.battlerSubpriorities[battler]! + s8(signed & 0xff);
  if (subpriority < 3) subpriority = 3;
  runtime.createdSprites.push({ template, x: getBattlerSpriteCoord(runtime, runtime.gBattleAnimTarget, 0), y: getBattlerSpriteCoord(runtime, runtime.gBattleAnimTarget, 1), subpriority });
  runtime.gAnimVisualTaskCount++;
};

export const Cmd_createvisualtask = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const func = `TaskFunc_${ptr32(runtime, runtime.scriptPtr)}`;
  runtime.scriptPtr += 4;
  const priority = runtime.script[runtime.scriptPtr++]!;
  void priority;
  const numArgs = runtime.script[runtime.scriptPtr++]!;
  for (let i = 0; i < numArgs; i++) {
    runtime.gBattleAnimArgs[i] = u16(runtime, runtime.scriptPtr);
    runtime.scriptPtr += 2;
  }
  const taskId = CreateTask(runtime, func);
  op(runtime, `${func}(${taskId})`);
  runtime.gAnimVisualTaskCount++;
};

export const Cmd_delay = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  runtime.sAnimFramesToWait = runtime.script[runtime.scriptPtr++]!;
  if (runtime.sAnimFramesToWait === 0) runtime.sAnimFramesToWait = -1;
  runtime.gAnimScriptCallback = 'WaitAnimFrameCount';
};

export const Cmd_waitforvisualfinish = (runtime: BattleAnimRuntime): void => {
  if (runtime.gAnimVisualTaskCount === 0) {
    runtime.scriptPtr++;
    runtime.sAnimFramesToWait = 0;
  } else {
    runtime.sAnimFramesToWait = 1;
  }
};

export const Cmd_nop = (_runtime: BattleAnimRuntime): void => {};
export const Cmd_nop2 = (_runtime: BattleAnimRuntime): void => {};

export const Cmd_end = (runtime: BattleAnimRuntime): void => {
  if (runtime.gAnimVisualTaskCount !== 0 || runtime.gAnimSoundTaskCount !== 0 || runtime.sMonAnimTaskIdArray[0] !== TASK_NONE || runtime.sMonAnimTaskIdArray[1] !== TASK_NONE) {
    runtime.sSoundAnimFramesToWait = 0;
    runtime.sAnimFramesToWait = 1;
    return;
  }
  if (runtime.sePlaying) {
    if (++runtime.sSoundAnimFramesToWait <= 90) {
      runtime.sAnimFramesToWait = 1;
      return;
    }
    op(runtime, 'm4aMPlayStop(SE1)');
    op(runtime, 'm4aMPlayStop(SE2)');
  }
  runtime.sSoundAnimFramesToWait = 0;
  for (let i = 0; i < ANIM_SPRITE_INDEX_COUNT; i++) {
    if (runtime.sAnimSpriteIndexArray[i] !== 0xffff) {
      op(runtime, `FreeSprite(${runtime.sAnimSpriteIndexArray[i]})`);
      runtime.sAnimSpriteIndexArray[i] = 0xffff;
    }
  }
  op(runtime, 'm4aMPlayVolumeControl(BGM,256)');
  op(runtime, 'InitPrioritiesForVisibleBattlers');
  op(runtime, 'UpdateOamPriorityInAllHealthboxes(1)');
  runtime.gAnimScriptActive = false;
};

export const Cmd_playse = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  op(runtime, `PlaySE(${u16(runtime, runtime.scriptPtr)})`);
  runtime.scriptPtr += 2;
};

const animBattlerToBattler = (runtime: BattleAnimRuntime, animBattlerRaw: number): { animBattler: number; battler: number } => {
  let animBattler = animBattlerRaw;
  if (animBattler === ANIM_ATTACKER) animBattler = ANIM_ATK_PARTNER;
  else if (animBattler === ANIM_TARGET) animBattler = ANIM_DEF_PARTNER;
  const battler = animBattler === ANIM_ATTACKER || animBattler === ANIM_ATK_PARTNER ? runtime.gBattleAnimAttacker : runtime.gBattleAnimTarget;
  return { animBattler, battler };
};

const shouldUseBg2 = (runtime: BattleAnimRuntime, battler: number): boolean => {
  const position = runtime.battlerPositions[battler]!;
  return !(position === B_POSITION_OPPONENT_LEFT || position === B_POSITION_PLAYER_RIGHT);
};

export const Cmd_monbg = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const { animBattler, battler } = animBattlerToBattler(runtime, runtime.script[runtime.scriptPtr]!);
  moveMonBgBattler(runtime, battler, 0);
  if (animBattler > ANIM_TARGET) moveMonBgBattler(runtime, battler ^ BIT_FLANK, 1);
  runtime.scriptPtr++;
};

const moveMonBgBattler = (runtime: BattleAnimRuntime, battler: number, slot: number): void => {
  if (!IsBattlerSpriteVisible(runtime, battler)) return;
  const toBG2 = shouldUseBg2(runtime, battler);
  MoveBattlerSpriteToBG(runtime, battler, toBG2);
  const spriteId = runtime.battlerSpriteIds[battler]!;
  const taskId = CreateTask(runtime, 'Task_InitUpdateMonBg');
  const data = task(runtime, taskId).data;
  data[0] = spriteId;
  data[1] = sprite(runtime, spriteId).x + sprite(runtime, spriteId).x2;
  data[2] = sprite(runtime, spriteId).y + sprite(runtime, spriteId).y2;
  data[3] = toBG2 ? runtime.gBattle_BG2_X : runtime.gBattle_BG1_X;
  data[4] = toBG2 ? runtime.gBattle_BG2_Y : runtime.gBattle_BG1_Y;
  data[5] = toBG2 ? 1 : 0;
  data[6] = battler;
  runtime.sMonAnimTaskIdArray[slot] = taskId;
};

export const IsBattlerSpriteVisible = (runtime: BattleAnimRuntime, battlerId: number): boolean => {
  if (!runtime.battlerSpritePresent[battlerId]) return false;
  return !runtime.battlerDataInvisible[battlerId] || !sprite(runtime, runtime.battlerSpriteIds[battlerId]!).invisible;
};

export const MoveBattlerSpriteToBG = (runtime: BattleAnimRuntime, battlerId: number, toBG2: boolean): void => {
  const spriteId = runtime.battlerSpriteIds[battlerId]!;
  if (!toBG2) {
    runtime.gBattle_BG1_X = -(sprite(runtime, spriteId).x + sprite(runtime, spriteId).x2) + 0x20;
    runtime.gBattle_BG1_Y = -(sprite(runtime, spriteId).y + sprite(runtime, spriteId).y2) + 0x20;
  } else {
    runtime.gBattle_BG2_X = -(sprite(runtime, spriteId).x + sprite(runtime, spriteId).x2) + 0x20;
    runtime.gBattle_BG2_Y = -(sprite(runtime, spriteId).y + sprite(runtime, spriteId).y2) + 0x20;
  }
  sprite(runtime, spriteId).invisible = true;
  op(runtime, `MoveBattlerSpriteToBG(${battlerId},${toBG2 ? 1 : 0})`);
};

export const RelocateBattleBgPal = (paletteNum: number, dest: number[], offset: number, largeScreen: boolean): void => {
  const size = !largeScreen ? 32 : 64;
  const pal = paletteNum << 12;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < 32; j++) dest[j + i * 32] = ((dest[j + i * 32]! & 0xfff) | pal) + offset;
  }
};

export const ResetBattleAnimBg = (runtime: BattleAnimRuntime, toBG2: boolean): void => {
  if (!toBG2) {
    runtime.gBattle_BG1_X = 0;
    runtime.gBattle_BG1_Y = 0;
  } else {
    runtime.gBattle_BG2_X = 0;
    runtime.gBattle_BG2_Y = 0;
  }
  op(runtime, `ResetBattleAnimBg(${toBG2 ? 1 : 0})`);
};

export const Task_InitUpdateMonBg = (runtime: BattleAnimRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  const spriteId = data[0]!;
  const x = data[1]! - (sprite(runtime, spriteId).x + sprite(runtime, spriteId).x2);
  const y = data[2]! - (sprite(runtime, spriteId).y + sprite(runtime, spriteId).y2);
  if (data[5] === 0) {
    runtime.gBattle_BG1_X = x + data[3]!;
    runtime.gBattle_BG1_Y = y + data[4]!;
  } else {
    runtime.gBattle_BG2_X = x + data[3]!;
    runtime.gBattle_BG2_Y = y + data[4]!;
  }
};

export const Cmd_clearmonbg = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const { animBattler, battler } = animBattlerToBattler(runtime, runtime.script[runtime.scriptPtr]!);
  if (runtime.sMonAnimTaskIdArray[0] !== TASK_NONE) sprite(runtime, runtime.battlerSpriteIds[battler]!).invisible = false;
  let adjustedAnimBattler = animBattler;
  if (animBattler > ANIM_TARGET && runtime.sMonAnimTaskIdArray[1] !== TASK_NONE) sprite(runtime, runtime.battlerSpriteIds[battler ^ BIT_FLANK]!).invisible = false;
  else adjustedAnimBattler = ANIM_ATTACKER;
  const taskId = CreateTask(runtime, 'Task_ClearMonBg');
  task(runtime, taskId).data[0] = adjustedAnimBattler;
  task(runtime, taskId).data[2] = battler;
  runtime.scriptPtr++;
};

export const Task_ClearMonBg = (runtime: BattleAnimRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  data[1]++;
  if (data[1] !== 1) {
    const toBG2 = shouldUseBg2(runtime, data[2]!);
    if (runtime.sMonAnimTaskIdArray[0] !== TASK_NONE) {
      ResetBattleAnimBg(runtime, toBG2);
      DestroyTask(runtime, runtime.sMonAnimTaskIdArray[0]!);
      runtime.sMonAnimTaskIdArray[0] = TASK_NONE;
    }
    if (data[0]! > 1) {
      ResetBattleAnimBg(runtime, !toBG2);
      DestroyTask(runtime, runtime.sMonAnimTaskIdArray[1]!);
      runtime.sMonAnimTaskIdArray[1] = TASK_NONE;
    }
    DestroyTask(runtime, taskId);
  }
};

export const Cmd_monbg_static = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const { animBattler, battler } = animBattlerToBattler(runtime, runtime.script[runtime.scriptPtr]!);
  moveMonBgStaticBattler(runtime, battler);
  if (animBattler > ANIM_TARGET) moveMonBgStaticBattler(runtime, battler ^ BIT_FLANK);
  runtime.scriptPtr++;
};

const moveMonBgStaticBattler = (runtime: BattleAnimRuntime, battler: number): void => {
  if (!IsBattlerSpriteVisible(runtime, battler)) return;
  MoveBattlerSpriteToBG(runtime, battler, shouldUseBg2(runtime, battler));
  sprite(runtime, runtime.battlerSpriteIds[battler]!).invisible = false;
};

export const Cmd_clearmonbg_static = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const { animBattler, battler } = animBattlerToBattler(runtime, runtime.script[runtime.scriptPtr]!);
  if (IsBattlerSpriteVisible(runtime, battler)) sprite(runtime, runtime.battlerSpriteIds[battler]!).invisible = false;
  let adjustedAnimBattler = animBattler;
  if (animBattler > ANIM_TARGET && IsBattlerSpriteVisible(runtime, battler ^ BIT_FLANK)) sprite(runtime, runtime.battlerSpriteIds[battler ^ BIT_FLANK]!).invisible = false;
  else adjustedAnimBattler = ANIM_ATTACKER;
  const taskId = CreateTask(runtime, 'Task_ClearMonBgStatic');
  task(runtime, taskId).data[0] = adjustedAnimBattler;
  task(runtime, taskId).data[2] = battler;
  runtime.scriptPtr++;
};

export const Task_ClearMonBgStatic = (runtime: BattleAnimRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  data[1]++;
  if (data[1] !== 1) {
    const battler = data[2]!;
    const toBG2 = shouldUseBg2(runtime, battler);
    if (IsBattlerSpriteVisible(runtime, battler)) ResetBattleAnimBg(runtime, toBG2);
    if (data[0]! > 1 && IsBattlerSpriteVisible(runtime, battler ^ BIT_FLANK)) ResetBattleAnimBg(runtime, !toBG2);
    DestroyTask(runtime, taskId);
  }
};

export const Cmd_setalpha = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const value = runtime.script[runtime.scriptPtr++]! | (runtime.script[runtime.scriptPtr++]! << 8);
  op(runtime, `SetGpuReg(BLDALPHA,${value})`);
};

export const Cmd_setbldcnt = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const value = runtime.script[runtime.scriptPtr++]! | (runtime.script[runtime.scriptPtr++]! << 8);
  op(runtime, `SetGpuReg(BLDCNT,${value})`);
};

export const Cmd_blendoff = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  op(runtime, 'SetGpuReg(BLDCNT,0)');
  op(runtime, 'SetGpuReg(BLDALPHA,0)');
};

export const Cmd_call = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  runtime.scriptRetAddr = runtime.scriptPtr + 4;
  runtime.scriptPtr = ptr32(runtime, runtime.scriptPtr);
};

export const Cmd_return = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr = runtime.scriptRetAddr;
};

export const Cmd_setarg = (runtime: BattleAnimRuntime): void => {
  const addr = runtime.scriptPtr;
  runtime.scriptPtr++;
  const argId = runtime.script[runtime.scriptPtr++]!;
  runtime.gBattleAnimArgs[argId] = u16(runtime, runtime.scriptPtr);
  runtime.scriptPtr = addr + 4;
};

export const Cmd_choosetwoturnanim = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  if ((runtime.gAnimMoveTurn & 1) !== 0) runtime.scriptPtr += 4;
  runtime.scriptPtr = ptr32(runtime, runtime.scriptPtr);
};

export const Cmd_jumpifmoveturn = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const toCheck = runtime.script[runtime.scriptPtr++]!;
  if (toCheck === runtime.gAnimMoveTurn) runtime.scriptPtr = ptr32(runtime, runtime.scriptPtr);
  else runtime.scriptPtr += 4;
};

export const Cmd_goto = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  runtime.scriptPtr = ptr32(runtime, runtime.scriptPtr);
};

export const IsContest = (): boolean => false;

export const IsSpeciesNotUnown = (species: number): boolean => species !== SPECIES_UNOWN;

export const Cmd_fadetobg = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const taskId = CreateTask(runtime, 'Task_FadeToBg');
  task(runtime, taskId).data[0] = runtime.script[runtime.scriptPtr++]!;
  runtime.sAnimBackgroundFadeState = 1;
};

export const Cmd_fadetobgfromset = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const bg1 = runtime.script[runtime.scriptPtr]!;
  const bg2 = runtime.script[runtime.scriptPtr + 1]!;
  runtime.scriptPtr += 3;
  const taskId = CreateTask(runtime, 'Task_FadeToBg');
  task(runtime, taskId).data[0] = runtime.battlerSides[runtime.gBattleAnimTarget] === B_SIDE_PLAYER ? bg2 : bg1;
  runtime.sAnimBackgroundFadeState = 1;
};

export const Task_FadeToBg = (runtime: BattleAnimRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  if (data[10] === 0) {
    op(runtime, 'BeginHardwarePaletteFade(out)');
    data[10]++;
    return;
  }
  if (runtime.paletteFadeActive) return;
  if (data[10] === 1) {
    data[10]++;
    runtime.sAnimBackgroundFadeState = 2;
  } else if (data[10] === 2) {
    if (data[0] === -1) LoadDefaultBg(runtime);
    else LoadMoveBg(runtime, data[0]!);
    op(runtime, 'BeginHardwarePaletteFade(in)');
    data[10]++;
    return;
  }
  if (runtime.paletteFadeActive) return;
  if (data[10] === 3) {
    DestroyTask(runtime, taskId);
    runtime.sAnimBackgroundFadeState = 0;
  }
};

export const LoadMoveBg = (runtime: BattleAnimRuntime, bgId: number): void => op(runtime, `LoadMoveBg(${bgId})`);
export const LoadDefaultBg = (runtime: BattleAnimRuntime): void => op(runtime, 'LoadDefaultBg');

export const Cmd_restorebg = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const taskId = CreateTask(runtime, 'Task_FadeToBg');
  task(runtime, taskId).data[0] = -1;
  runtime.sAnimBackgroundFadeState = 1;
};

export const Cmd_waitbgfadeout = (runtime: BattleAnimRuntime): void => {
  if (runtime.sAnimBackgroundFadeState === 2) {
    runtime.scriptPtr++;
    runtime.sAnimFramesToWait = 0;
  } else runtime.sAnimFramesToWait = 1;
};

export const Cmd_waitbgfadein = (runtime: BattleAnimRuntime): void => {
  if (runtime.sAnimBackgroundFadeState === 0) {
    runtime.scriptPtr++;
    runtime.sAnimFramesToWait = 0;
  } else runtime.sAnimFramesToWait = 1;
};

export const Cmd_changebg = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  LoadMoveBg(runtime, runtime.script[runtime.scriptPtr++]!);
};

export const BattleAnimAdjustPanning = (runtime: BattleAnimRuntime, panArg: number): number => {
  let pan = s8(panArg & 0xff);
  if (runtime.statusAnimActive[runtime.gBattleAnimAttacker]) {
    pan = runtime.battlerSides[runtime.gBattleAnimAttacker] !== B_SIDE_PLAYER ? SOUND_PAN_TARGET : SOUND_PAN_ATTACKER;
  } else if (runtime.battlerSides[runtime.gBattleAnimAttacker] === B_SIDE_PLAYER) {
    if (runtime.battlerSides[runtime.gBattleAnimTarget] === B_SIDE_PLAYER) {
      if (pan === SOUND_PAN_TARGET) pan = SOUND_PAN_ATTACKER;
      else if (pan !== SOUND_PAN_ATTACKER) pan *= -1;
    }
  } else if (runtime.battlerSides[runtime.gBattleAnimTarget] === B_SIDE_OPPONENT) {
    if (pan === SOUND_PAN_ATTACKER) pan = SOUND_PAN_TARGET;
  } else {
    pan *= -1;
  }
  return KeepPanInRange(pan, pan);
};

export const BattleAnimAdjustPanning2 = (runtime: BattleAnimRuntime, panArg: number): number => {
  let pan = s8(panArg & 0xff);
  if (runtime.statusAnimActive[runtime.gBattleAnimAttacker]) {
    pan = runtime.battlerSides[runtime.gBattleAnimAttacker] !== B_SIDE_PLAYER ? SOUND_PAN_TARGET : SOUND_PAN_ATTACKER;
  } else if (runtime.battlerSides[runtime.gBattleAnimAttacker] !== B_SIDE_PLAYER) pan = -pan;
  return pan;
};

export const KeepPanInRange = (panArg: number, oldPan: number): number => {
  void oldPan;
  let pan = panArg;
  if (pan > SOUND_PAN_TARGET) pan = SOUND_PAN_TARGET;
  else if (pan < SOUND_PAN_ATTACKER) pan = SOUND_PAN_ATTACKER;
  return pan;
};

export const CalculatePanIncrement = (sourcePan: number, targetPan: number, incrementPan: number): number => {
  if (sourcePan < targetPan) return incrementPan < 0 ? -incrementPan : incrementPan;
  if (sourcePan > targetPan) return -(incrementPan < 0 ? -incrementPan : incrementPan);
  return 0;
};

export const Cmd_playsewithpan = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const songId = u16(runtime, runtime.scriptPtr);
  const pan = runtime.script[runtime.scriptPtr + 2]!;
  op(runtime, `PlaySE12WithPanning(${songId},${BattleAnimAdjustPanning(runtime, pan)})`);
  runtime.scriptPtr += 3;
};

export const Cmd_setpan = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  op(runtime, `SE12PanpotControl(${BattleAnimAdjustPanning(runtime, runtime.script[runtime.scriptPtr]!)})`);
  runtime.scriptPtr++;
};

const makePanTask = (runtime: BattleAnimRuntime, currentPan: number, targetPan: number, incrementPan: number, framesToWait: number): number => {
  const taskId = CreateTask(runtime, 'Task_PanFromInitialToTarget');
  const data = task(runtime, taskId).data;
  data[0] = currentPan;
  data[1] = targetPan;
  data[2] = incrementPan;
  data[3] = framesToWait;
  data[4] = currentPan;
  return taskId;
};

export const Cmd_panse = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const songNum = u16(runtime, runtime.scriptPtr);
  const currentPan = BattleAnimAdjustPanning(runtime, runtime.script[runtime.scriptPtr + 2]!);
  const targetPan = BattleAnimAdjustPanning(runtime, runtime.script[runtime.scriptPtr + 3]!);
  const incrementPan = CalculatePanIncrement(currentPan, targetPan, s8(runtime.script[runtime.scriptPtr + 4]!));
  makePanTask(runtime, currentPan, targetPan, incrementPan, runtime.script[runtime.scriptPtr + 5]!);
  op(runtime, `PlaySE12WithPanning(${songNum},${currentPan})`);
  runtime.gAnimSoundTaskCount++;
  runtime.scriptPtr += 6;
};

export const Task_PanFromInitialToTarget = (runtime: BattleAnimRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  let destroyTask = false;
  if (data[8]++ >= data[3]!) {
    data[8] = 0;
    let pan = data[4]! + data[2]!;
    data[4] = pan;
    if (data[2] === 0) destroyTask = true;
    else if (data[0]! < data[1]!) {
      if (pan >= data[1]!) destroyTask = true;
    } else if (pan <= data[1]!) destroyTask = true;
    if (destroyTask) {
      pan = data[1]!;
      DestroyTask(runtime, taskId);
      runtime.gAnimSoundTaskCount--;
    }
    op(runtime, `SE12PanpotControl(${pan})`);
  }
};

export const Cmd_panse_adjustnone = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const songId = u16(runtime, runtime.scriptPtr);
  const currentPan = s8(runtime.script[runtime.scriptPtr + 2]!);
  const targetPan = s8(runtime.script[runtime.scriptPtr + 3]!);
  const incrementPan = s8(runtime.script[runtime.scriptPtr + 4]!);
  makePanTask(runtime, currentPan, targetPan, incrementPan, runtime.script[runtime.scriptPtr + 5]!);
  op(runtime, `PlaySE12WithPanning(${songId},${currentPan})`);
  runtime.gAnimSoundTaskCount++;
  runtime.scriptPtr += 6;
};

export const Cmd_panse_adjustall = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const songId = u16(runtime, runtime.scriptPtr);
  const currentPan = BattleAnimAdjustPanning2(runtime, runtime.script[runtime.scriptPtr + 2]!);
  const targetPan = BattleAnimAdjustPanning2(runtime, runtime.script[runtime.scriptPtr + 3]!);
  const incrementPan = BattleAnimAdjustPanning2(runtime, runtime.script[runtime.scriptPtr + 4]!);
  makePanTask(runtime, currentPan, targetPan, incrementPan, runtime.script[runtime.scriptPtr + 5]!);
  op(runtime, `PlaySE12WithPanning(${songId},${currentPan})`);
  runtime.gAnimSoundTaskCount++;
  runtime.scriptPtr += 6;
};

export const Cmd_loopsewithpan = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const taskId = CreateTask(runtime, 'Task_LoopAndPlaySE');
  task(runtime, taskId).data[0] = u16(runtime, runtime.scriptPtr);
  task(runtime, taskId).data[1] = BattleAnimAdjustPanning(runtime, runtime.script[runtime.scriptPtr + 2]!);
  task(runtime, taskId).data[2] = runtime.script[runtime.scriptPtr + 3]!;
  task(runtime, taskId).data[3] = runtime.script[runtime.scriptPtr + 4]!;
  task(runtime, taskId).data[8] = task(runtime, taskId).data[2]!;
  Task_LoopAndPlaySE(runtime, taskId);
  runtime.gAnimSoundTaskCount++;
  runtime.scriptPtr += 5;
};

export const Task_LoopAndPlaySE = (runtime: BattleAnimRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  if (data[8]++ >= data[2]!) {
    data[8] = 0;
    const numberOfPlays = --data[3];
    op(runtime, `PlaySE12WithPanning(${data[0]},${data[1]})`);
    if (numberOfPlays === 0) {
      DestroyTask(runtime, taskId);
      runtime.gAnimSoundTaskCount--;
    }
  }
};

export const Cmd_waitplaysewithpan = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const taskId = CreateTask(runtime, 'Task_WaitAndPlaySE');
  task(runtime, taskId).data[0] = u16(runtime, runtime.scriptPtr);
  task(runtime, taskId).data[1] = BattleAnimAdjustPanning(runtime, runtime.script[runtime.scriptPtr + 2]!);
  task(runtime, taskId).data[2] = runtime.script[runtime.scriptPtr + 3]!;
  runtime.gAnimSoundTaskCount++;
  runtime.scriptPtr += 4;
};

export const Task_WaitAndPlaySE = (runtime: BattleAnimRuntime, taskId: number): void => {
  const data = task(runtime, taskId).data;
  if (data[2]-- <= 0) {
    op(runtime, `PlaySE12WithPanning(${data[0]},${data[1]})`);
    DestroyTask(runtime, taskId);
    runtime.gAnimSoundTaskCount--;
  }
};

export const Cmd_createsoundtask = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const func = `TaskFunc_${ptr32(runtime, runtime.scriptPtr)}`;
  runtime.scriptPtr += 4;
  const numArgs = runtime.script[runtime.scriptPtr++]!;
  for (let i = 0; i < numArgs; i++) {
    runtime.gBattleAnimArgs[i] = u16(runtime, runtime.scriptPtr);
    runtime.scriptPtr += 2;
  }
  const taskId = CreateTask(runtime, func);
  op(runtime, `${func}(${taskId})`);
  runtime.gAnimSoundTaskCount++;
};

export const Cmd_waitsound = (runtime: BattleAnimRuntime): void => {
  if (runtime.gAnimSoundTaskCount !== 0) {
    runtime.sSoundAnimFramesToWait = 0;
    runtime.sAnimFramesToWait = 1;
  } else if (runtime.sePlaying) {
    if (++runtime.sSoundAnimFramesToWait > 90) {
      op(runtime, 'm4aMPlayStop(SE1)');
      op(runtime, 'm4aMPlayStop(SE2)');
      runtime.sSoundAnimFramesToWait = 0;
    } else runtime.sAnimFramesToWait = 1;
  } else {
    runtime.sSoundAnimFramesToWait = 0;
    runtime.scriptPtr++;
    runtime.sAnimFramesToWait = 0;
  }
};

export const Cmd_jumpargeq = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  const argId = runtime.script[runtime.scriptPtr]!;
  const valueToCheck = u16(runtime, runtime.scriptPtr + 1);
  if (valueToCheck === runtime.gBattleAnimArgs[argId]) runtime.scriptPtr = ptr32(runtime, runtime.scriptPtr + 3);
  else runtime.scriptPtr += 7;
};

export const Cmd_jumpifcontest = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr += 5;
};

export const Cmd_splitbgprio = (runtime: BattleAnimRuntime): void => {
  const wantedBattler = runtime.script[runtime.scriptPtr + 1]!;
  runtime.scriptPtr += 2;
  const battlerId = wantedBattler !== ANIM_ATTACKER ? runtime.gBattleAnimTarget : runtime.gBattleAnimAttacker;
  const position = runtime.battlerPositions[battlerId]!;
  if (position === B_POSITION_PLAYER_LEFT || position === B_POSITION_OPPONENT_RIGHT) {
    op(runtime, 'SetAnimBgAttribute(1,PRIORITY,1)');
    op(runtime, 'SetAnimBgAttribute(2,PRIORITY,2)');
  }
};

export const Cmd_splitbgprio_all = (runtime: BattleAnimRuntime): void => {
  runtime.scriptPtr++;
  op(runtime, 'SetAnimBgAttribute(1,PRIORITY,1)');
  op(runtime, 'SetAnimBgAttribute(2,PRIORITY,2)');
};

export const Cmd_splitbgprio_foes = (runtime: BattleAnimRuntime): void => {
  const wantedBattler = runtime.script[runtime.scriptPtr + 1]!;
  runtime.scriptPtr += 2;
  if (runtime.battlerSides[runtime.gBattleAnimAttacker] !== runtime.battlerSides[runtime.gBattleAnimTarget]) {
    const battlerId = wantedBattler !== ANIM_ATTACKER ? runtime.gBattleAnimTarget : runtime.gBattleAnimAttacker;
    const position = runtime.battlerPositions[battlerId]!;
    if (position === B_POSITION_PLAYER_LEFT || position === B_POSITION_OPPONENT_RIGHT) {
      op(runtime, 'SetAnimBgAttribute(1,PRIORITY,1)');
      op(runtime, 'SetAnimBgAttribute(2,PRIORITY,2)');
    }
  }
};

export const Cmd_invisible = (runtime: BattleAnimRuntime): void => {
  const spriteId = GetAnimBattlerSpriteId(runtime, runtime.script[runtime.scriptPtr + 1]!);
  if (spriteId !== SPRITE_NONE) sprite(runtime, spriteId).invisible = true;
  runtime.scriptPtr += 2;
};

export const Cmd_visible = (runtime: BattleAnimRuntime): void => {
  const spriteId = GetAnimBattlerSpriteId(runtime, runtime.script[runtime.scriptPtr + 1]!);
  if (spriteId !== SPRITE_NONE) sprite(runtime, spriteId).invisible = false;
  runtime.scriptPtr += 2;
};

export const Cmd_teamattack_moveback = (runtime: BattleAnimRuntime): void => {
  const wantedBattler = runtime.script[runtime.scriptPtr + 1]!;
  runtime.scriptPtr += 2;
  if (runtime.isDoubleBattle && runtime.battlerSides[runtime.gBattleAnimAttacker] === runtime.battlerSides[runtime.gBattleAnimTarget]) {
    const battler = wantedBattler === ANIM_ATTACKER ? runtime.gBattleAnimAttacker : runtime.gBattleAnimTarget;
    const priority = runtime.battlerBgPriorityRanks[battler]!;
    const spriteId = GetAnimBattlerSpriteId(runtime, wantedBattler);
    if (spriteId !== SPRITE_NONE) {
      sprite(runtime, spriteId).invisible = false;
      if (priority === 2) sprite(runtime, spriteId).oam.priority = 3;
      ResetBattleAnimBg(runtime, priority !== 1);
    }
  }
};

export const Cmd_teamattack_movefwd = (runtime: BattleAnimRuntime): void => {
  const wantedBattler = runtime.script[runtime.scriptPtr + 1]!;
  runtime.scriptPtr += 2;
  if (runtime.isDoubleBattle && runtime.battlerSides[runtime.gBattleAnimAttacker] === runtime.battlerSides[runtime.gBattleAnimTarget]) {
    const battler = wantedBattler === ANIM_ATTACKER ? runtime.gBattleAnimAttacker : runtime.gBattleAnimTarget;
    const priority = runtime.battlerBgPriorityRanks[battler]!;
    const spriteId = GetAnimBattlerSpriteId(runtime, wantedBattler);
    if (spriteId !== SPRITE_NONE && priority === 2) sprite(runtime, spriteId).oam.priority = 2;
  }
};

export const Cmd_stopsound = (runtime: BattleAnimRuntime): void => {
  op(runtime, 'm4aMPlayStop(SE1)');
  op(runtime, 'm4aMPlayStop(SE2)');
  runtime.scriptPtr++;
};

export const GetAnimBattlerSpriteId = (runtime: BattleAnimRuntime, animBattler: number): number => {
  const battler = animBattler === ANIM_ATTACKER || animBattler === ANIM_ATK_PARTNER ? runtime.gBattleAnimAttacker : runtime.gBattleAnimTarget;
  const resolved = animBattler === ANIM_ATK_PARTNER || animBattler === ANIM_DEF_PARTNER ? battler ^ BIT_FLANK : battler;
  return runtime.battlerSpritePresent[resolved] ? runtime.battlerSpriteIds[resolved]! : SPRITE_NONE;
};

const getBattlerSpriteCoord = (runtime: BattleAnimRuntime, battler: number, coord: number): number => {
  const current = sprite(runtime, runtime.battlerSpriteIds[battler]!);
  return coord === 0 ? current.x + current.x2 : current.y + current.y2;
};

const scriptCmdTable: Array<(runtime: BattleAnimRuntime) => void> = [];
scriptCmdTable[CMD_LOADSPRITEGFX] = Cmd_loadspritegfx;
scriptCmdTable[CMD_UNLOADSPRITEGFX] = Cmd_unloadspritegfx;
scriptCmdTable[CMD_CREATESPRITE] = Cmd_createsprite;
scriptCmdTable[CMD_CREATEVISUALTASK] = Cmd_createvisualtask;
scriptCmdTable[CMD_DELAY] = Cmd_delay;
scriptCmdTable[CMD_WAITFORVISUALFINISH] = Cmd_waitforvisualfinish;
scriptCmdTable[CMD_NOP] = Cmd_nop;
scriptCmdTable[CMD_NOP2] = Cmd_nop2;
scriptCmdTable[CMD_END] = Cmd_end;
scriptCmdTable[CMD_PLAYSE] = Cmd_playse;
scriptCmdTable[CMD_MONBG] = Cmd_monbg;
scriptCmdTable[CMD_CLEARMONBG] = Cmd_clearmonbg;
scriptCmdTable[CMD_SETALPHA] = Cmd_setalpha;
scriptCmdTable[CMD_BLENDOFF] = Cmd_blendoff;
scriptCmdTable[CMD_CALL] = Cmd_call;
scriptCmdTable[CMD_RETURN] = Cmd_return;
scriptCmdTable[CMD_SETARG] = Cmd_setarg;
scriptCmdTable[CMD_CHOOSETWOTURNANIM] = Cmd_choosetwoturnanim;
scriptCmdTable[CMD_JUMPIFMOVETURN] = Cmd_jumpifmoveturn;
scriptCmdTable[CMD_GOTO] = Cmd_goto;
scriptCmdTable[CMD_FADETOBG] = Cmd_fadetobg;
scriptCmdTable[CMD_RESTOREBG] = Cmd_restorebg;
scriptCmdTable[CMD_WAITBGFADEOUT] = Cmd_waitbgfadeout;
scriptCmdTable[CMD_WAITBGFADEIN] = Cmd_waitbgfadein;
scriptCmdTable[CMD_CHANGEBG] = Cmd_changebg;
scriptCmdTable[CMD_PLAYSEWITHPAN] = Cmd_playsewithpan;
scriptCmdTable[CMD_SETPAN] = Cmd_setpan;
scriptCmdTable[CMD_PANSE] = Cmd_panse;
scriptCmdTable[CMD_LOOPSEWITHPAN] = Cmd_loopsewithpan;
scriptCmdTable[CMD_WAITPLAYSEWITHPAN] = Cmd_waitplaysewithpan;
scriptCmdTable[CMD_SETBLDCNT] = Cmd_setbldcnt;
scriptCmdTable[CMD_CREATESOUNDTASK] = Cmd_createsoundtask;
scriptCmdTable[CMD_WAITSOUND] = Cmd_waitsound;
scriptCmdTable[CMD_JUMPARGEQ] = Cmd_jumpargeq;
scriptCmdTable[CMD_MONBG_STATIC] = Cmd_monbg_static;
scriptCmdTable[CMD_CLEARMONBG_STATIC] = Cmd_clearmonbg_static;
scriptCmdTable[CMD_JUMPIFCONTEST] = Cmd_jumpifcontest;
scriptCmdTable[CMD_FADETOBGFROMSET] = Cmd_fadetobgfromset;
scriptCmdTable[CMD_PANSE_ADJUSTNONE] = Cmd_panse_adjustnone;
scriptCmdTable[CMD_PANSE_ADJUSTALL] = Cmd_panse_adjustall;
scriptCmdTable[CMD_SPLITBGPRIO] = Cmd_splitbgprio;
scriptCmdTable[CMD_SPLITBGPRIO_ALL] = Cmd_splitbgprio_all;
scriptCmdTable[CMD_SPLITBGPRIO_FOES] = Cmd_splitbgprio_foes;
scriptCmdTable[CMD_INVISIBLE] = Cmd_invisible;
scriptCmdTable[CMD_VISIBLE] = Cmd_visible;
scriptCmdTable[CMD_TEAMATTACK_MOVEBACK] = Cmd_teamattack_moveback;
scriptCmdTable[CMD_TEAMATTACK_MOVEFWD] = Cmd_teamattack_movefwd;
scriptCmdTable[CMD_STOPSOUND] = Cmd_stopsound;
