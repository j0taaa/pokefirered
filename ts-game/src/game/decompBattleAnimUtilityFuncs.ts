export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const ARG_RET_ID = 7;
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const MAX_BATTLERS_COUNT = 4;
export const RGB_WHITE = 0x7fff;
export const SE_M_STAT_INCREASE = 'SE_M_STAT_INCREASE';
export const SE_M_STAT_DECREASE = 'SE_M_STAT_DECREASE';
export const SOUND_PAN_ATTACKER = -64;
export const REG_OFFSET_BG0CNT = 0x08;
export const REG_OFFSET_BG1CNT = 0x0a;
export const REG_OFFSET_BG2CNT = 0x0c;
export const REG_OFFSET_BG3CNT = 0x0e;
export const REG_OFFSET_WININ = 'REG_OFFSET_WININ';
export const REG_OFFSET_WINOUT = 'REG_OFFSET_WINOUT';
export const REG_OFFSET_DISPCNT = 'REG_OFFSET_DISPCNT';
export const REG_OFFSET_BLDCNT = 'REG_OFFSET_BLDCNT';
export const REG_OFFSET_BLDALPHA = 'REG_OFFSET_BLDALPHA';
export const DISPCNT_OBJWIN_ON = 0x1000;

export const gBattleAnimRegOffsBgCnt = [REG_OFFSET_BG0CNT, REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT, REG_OFFSET_BG3CNT] as const;
export const gBattleIntroRegOffsBgCnt = [REG_OFFSET_BG0CNT, REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT, REG_OFFSET_BG3CNT] as const;

export type UtilityTaskFunc =
  | 'AnimTask_BlendSpriteColor_Step2'
  | 'AnimTask_HardwarePaletteFade_Step'
  | 'AnimTask_TraceMonBlended_Step'
  | 'AnimTask_DrawFallingWhiteLinesOnAttacker_Step'
  | 'StatsChangeAnimation_Step1'
  | 'StatsChangeAnimation_Step2'
  | 'StatsChangeAnimation_Step3'
  | 'AnimTask_Flash_Step'
  | 'AnimTask_UpdateSlidingBg'
  | 'UpdateMonScrollingBgMask'
  | 'AnimTask_WaitAndRestoreVisibility'
  | 'DestroyAnimVisualTask';

export type UtilitySpriteCallback = 'AnimMonTrace' | 'DestroySpriteWithActiveSheet' | 'SpriteCallbackDummy';

export interface UtilityTask {
  data: number[];
  func: UtilityTaskFunc;
  destroyed: boolean;
}

export interface UtilitySprite {
  invisible: boolean;
  destroyed: boolean;
  callback: UtilitySpriteCallback;
  data: number[];
  oam: { priority: number };
}

export interface AnimStatsChangeData {
  battler1: number;
  battler2: number;
  higherPriority: number;
  data: number[];
  species: number;
}

export interface UtilityRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  battlerTarget: number;
  battlerAttacker: number;
  effectBattler: number;
  battleTerrain: number;
  contest: boolean;
  doubleBattle: boolean;
  battlerSides: Record<number, number>;
  battlerPositions: Record<number, number>;
  battlerVisible: Record<number, boolean>;
  battlerSpriteIds: Record<number, number>;
  battlerPartyIndexes: Record<number, number>;
  battlerSpecies: Record<number, number>;
  battlerDataInvisible: Record<number, number>;
  sprites: UtilitySprite[];
  tasks: Array<UtilityTask | null>;
  paletteFadeActive: boolean;
  gpuRegs: Record<string, number>;
  plttBufferFaded: number[];
  plttBufferUnfaded: number[];
  backupPalBuffer: number[] | null;
  battleBg1X: number;
  battleBg1Y: number;
  battleBg3X: number;
  battleBg3Y: number;
  battleWin0H: number;
  battleWin0V: number;
  animVisualTaskCount: number;
  statsChangeData: AnimStatsChangeData | null;
  operations: string[];
  blends: Array<{ offset: number; size: number; coeff: number; color: number }>;
  sounds: Array<{ song: string; pan: number }>;
}

export const createUtilitySprite = (): UtilitySprite => ({
  invisible: false,
  destroyed: false,
  callback: 'SpriteCallbackDummy',
  data: Array.from({ length: 16 }, () => 0),
  oam: { priority: 2 }
});

export const createUtilityRuntime = (overrides: Partial<UtilityRuntime> = {}): UtilityRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  battlerTarget: overrides.battlerTarget ?? 1,
  battlerAttacker: overrides.battlerAttacker ?? 0,
  effectBattler: overrides.effectBattler ?? 1,
  battleTerrain: overrides.battleTerrain ?? 0,
  contest: overrides.contest ?? false,
  doubleBattle: overrides.doubleBattle ?? false,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerPositions: overrides.battlerPositions ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerVisible: overrides.battlerVisible ?? { 0: true, 1: true, 2: true, 3: true },
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerPartyIndexes: overrides.battlerPartyIndexes ?? { 0: 0, 1: 0, 2: 1, 3: 1 },
  battlerSpecies: overrides.battlerSpecies ?? { 0: 1, 1: 4, 2: 7, 3: 25 },
  battlerDataInvisible: overrides.battlerDataInvisible ?? { 0: 0, 1: 0, 2: 0, 3: 0 },
  sprites: overrides.sprites ?? Array.from({ length: 64 }, () => createUtilitySprite()),
  tasks: overrides.tasks ?? [],
  paletteFadeActive: overrides.paletteFadeActive ?? false,
  gpuRegs: overrides.gpuRegs ?? {},
  plttBufferFaded: overrides.plttBufferFaded ?? Array.from({ length: 512 }, (_, i) => i),
  plttBufferUnfaded: overrides.plttBufferUnfaded ?? Array.from({ length: 512 }, (_, i) => i + 1000),
  backupPalBuffer: overrides.backupPalBuffer ?? null,
  battleBg1X: overrides.battleBg1X ?? 0,
  battleBg1Y: overrides.battleBg1Y ?? 0,
  battleBg3X: overrides.battleBg3X ?? 0,
  battleBg3Y: overrides.battleBg3Y ?? 0,
  battleWin0H: overrides.battleWin0H ?? 0,
  battleWin0V: overrides.battleWin0V ?? 0,
  animVisualTaskCount: overrides.animVisualTaskCount ?? 0,
  statsChangeData: overrides.statsChangeData ?? null,
  operations: overrides.operations ?? [],
  blends: overrides.blends ?? [],
  sounds: overrides.sounds ?? []
});

export const createUtilityTask = (runtime: UtilityRuntime, func: UtilityTaskFunc = 'DestroyAnimVisualTask'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), func, destroyed: false });
  return id;
};

export function AnimTask_BlendBattleAnimPal(runtime: UtilityRuntime, taskId: number): void {
  let selectedPalettes = unpackSelectedBattlePalettes(runtime.battleAnimArgs[0]);
  selectedPalettes |= getBattleMonSpritePalettesMask(
    (runtime.battleAnimArgs[0] >> 7) & 1,
    (runtime.battleAnimArgs[0] >> 8) & 1,
    (runtime.battleAnimArgs[0] >> 9) & 1,
    (runtime.battleAnimArgs[0] >> 10) & 1
  );
  StartBlendAnimSpriteColor(runtime, taskId, selectedPalettes);
}

export function AnimTask_BlendBattleAnimPalExclude(runtime: UtilityRuntime, taskId: number): void {
  const animBattlers = [0, 0xff];
  let selectedPalettes = unpackSelectedBattlePalettes(1);
  switch (runtime.battleAnimArgs[0]) {
    case 2:
      selectedPalettes = 0;
    // fallthrough
    case ANIM_ATTACKER:
      animBattlers[0] = runtime.battleAnimAttacker;
      break;
    case 3:
      selectedPalettes = 0;
    // fallthrough
    case ANIM_TARGET:
      animBattlers[0] = runtime.battleAnimTarget;
      break;
    case 4:
      animBattlers[0] = runtime.battleAnimAttacker;
      animBattlers[1] = runtime.battleAnimTarget;
      break;
    case 5:
      animBattlers[0] = 0xff;
      break;
    case 6:
      selectedPalettes = 0;
      animBattlers[0] = battlePartner(runtime.battleAnimAttacker);
      break;
    case 7:
      selectedPalettes = 0;
      animBattlers[0] = battlePartner(runtime.battleAnimTarget);
      break;
  }
  for (let battler = 0; battler < MAX_BATTLERS_COUNT; ++battler) {
    if (battler !== animBattlers[0] && battler !== animBattlers[1] && isBattlerSpriteVisible(runtime, battler)) {
      selectedPalettes |= 0x10000 << getSpritePalIdxByBattler(battler);
    }
  }
  StartBlendAnimSpriteColor(runtime, taskId, selectedPalettes);
}

export function AnimTask_SetCamouflageBlend(runtime: UtilityRuntime, taskId: number): void {
  const selectedPalettes = unpackSelectedBattlePalettes(runtime.battleAnimArgs[0]);
  switch (runtime.battleTerrain) {
    case 0:
      runtime.battleAnimArgs[4] = rgb(12, 24, 2);
      break;
    case 1:
      runtime.battleAnimArgs[4] = rgb(0, 15, 2);
      break;
    case 2:
      runtime.battleAnimArgs[4] = rgb(30, 24, 11);
      break;
    case 3:
      runtime.battleAnimArgs[4] = rgb(0, 0, 18);
      break;
    case 4:
    case 5:
      runtime.battleAnimArgs[4] = rgb(11, 22, 31);
      break;
    case 6:
      runtime.battleAnimArgs[4] = rgb(22, 16, 10);
      break;
    case 7:
      runtime.battleAnimArgs[4] = rgb(14, 9, 3);
      break;
    case 8:
    case 9:
      runtime.battleAnimArgs[4] = rgb(31, 31, 31);
      break;
  }
  StartBlendAnimSpriteColor(runtime, taskId, selectedPalettes);
}

export function AnimTask_BlendParticle(runtime: UtilityRuntime, taskId: number): void {
  const paletteIndex = indexOfSpritePaletteTag(runtime.battleAnimArgs[0]);
  StartBlendAnimSpriteColor(runtime, taskId, 1 << (paletteIndex + 16));
}

export function StartBlendAnimSpriteColor(runtime: UtilityRuntime, taskId: number, selectedPalettes: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = selectedPalettes & 0xffff;
  task.data[1] = selectedPalettes >>> 16;
  task.data[2] = runtime.battleAnimArgs[1];
  task.data[3] = runtime.battleAnimArgs[2];
  task.data[4] = runtime.battleAnimArgs[3];
  task.data[5] = runtime.battleAnimArgs[4];
  task.data[10] = runtime.battleAnimArgs[2];
  task.func = 'AnimTask_BlendSpriteColor_Step2';
  AnimTask_BlendSpriteColor_Step2(runtime, taskId);
}

export function AnimTask_BlendSpriteColor_Step2(runtime: UtilityRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  let singlePaletteMask = 0;
  if (task.data[9] === task.data[2]) {
    task.data[9] = 0;
    let selectedPalettes = task.data[0] | (task.data[1] << 16);
    while (selectedPalettes) {
      if (selectedPalettes & 1) blendPalette(runtime, singlePaletteMask, 16, task.data[10], task.data[5]);
      singlePaletteMask += 0x10;
      selectedPalettes >>>= 1;
    }
    if (task.data[10] < task.data[4]) ++task.data[10];
    else if (task.data[10] > task.data[4]) --task.data[10];
    else destroyAnimVisualTask(runtime, taskId);
  } else {
    ++task.data[9];
  }
}

export function AnimTask_HardwarePaletteFade(runtime: UtilityRuntime, taskId: number): void {
  runtime.operations.push(`BeginHardwarePaletteFade:${runtime.battleAnimArgs.slice(0, 5).join(':')}`);
  runtime.tasks[taskId]!.func = 'AnimTask_HardwarePaletteFade_Step';
}

export function AnimTask_HardwarePaletteFade_Step(runtime: UtilityRuntime, taskId: number): void {
  if (!runtime.paletteFadeActive) destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_TraceMonBlended(runtime: UtilityRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[0];
  task.data[1] = 0;
  task.data[2] = runtime.battleAnimArgs[1];
  task.data[3] = runtime.battleAnimArgs[2];
  task.data[4] = runtime.battleAnimArgs[3];
  task.data[5] = 0;
  task.func = 'AnimTask_TraceMonBlended_Step';
}

export function AnimTask_TraceMonBlended_Step(runtime: UtilityRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[4]) {
    if (task.data[1]) --task.data[1];
    else {
      task.data[6] = cloneBattlerSpriteWithBlend(runtime, task.data[0]);
      if (task.data[6] >= 0) {
        runtime.sprites[task.data[6]].oam.priority = task.data[0] ? 1 : 2;
        runtime.sprites[task.data[6]].data[0] = task.data[3];
        runtime.sprites[task.data[6]].data[1] = taskId;
        runtime.sprites[task.data[6]].data[2] = 5;
        runtime.sprites[task.data[6]].callback = 'AnimMonTrace';
        ++task.data[5];
      }
      --task.data[4];
      task.data[1] = task.data[2];
    }
  } else if (task.data[5] === 0) destroyAnimVisualTask(runtime, taskId);
}

export function AnimMonTrace(runtime: UtilityRuntime, sprite: UtilitySprite): void {
  if (sprite.data[0]) --sprite.data[0];
  else {
    --runtime.tasks[sprite.data[1]]!.data[sprite.data[2]];
    destroySpriteWithActiveSheet(runtime, sprite);
  }
}

export function AnimTask_DrawFallingWhiteLinesOnAttacker(runtime: UtilityRuntime, taskId: number): void {
  let var0 = 0;
  runtime.battleWin0H = 0;
  runtime.battleWin0V = 0;
  setGpuReg(runtime, REG_OFFSET_DISPCNT, (getGpuReg(runtime, REG_OFFSET_DISPCNT) | DISPCNT_OBJWIN_ON));
  setGpuReg(runtime, REG_OFFSET_BLDCNT, 1);
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(8, 12));
  if (runtime.doubleBattle && !runtime.contest) {
    const position = runtime.battlerPositions[runtime.battleAnimAttacker];
    if ((position === 3 || position === 0) && isBattlerSpriteVisible(runtime, battlePartner(runtime.battleAnimAttacker))) {
      runtime.sprites[runtime.battlerSpriteIds[battlePartner(runtime.battleAnimAttacker)]].oam.priority -= 1;
      var0 = 1;
    }
  }
  const spriteId = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
  const newSpriteId = createInvisibleSpriteCopy(runtime, runtime.battleAnimAttacker, spriteId, runtime.battlerSpecies[runtime.battleAnimAttacker]);
  runtime.operations.push('AnimLoadCompressedBgTilemap:curse');
  runtime.operations.push('AnimLoadCompressedBgGfx:curse');
  runtime.plttBufferFaded[17] = RGB_WHITE;
  runtime.battleBg1X = -spriteId + 32;
  runtime.battleBg1Y = -spriteId + 32;
  runtime.tasks[taskId]!.data[0] = newSpriteId;
  runtime.tasks[taskId]!.data[6] = var0;
  runtime.tasks[taskId]!.func = 'AnimTask_DrawFallingWhiteLinesOnAttacker_Step';
}

export function AnimTask_DrawFallingWhiteLinesOnAttacker_Step(runtime: UtilityRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[10] += 4;
  runtime.battleBg1Y -= 4;
  if (task.data[10] === 64) {
    task.data[10] = 0;
    runtime.battleBg1Y += 64;
    if (++task.data[11] === 4) {
      resetBattleAnimBg(runtime, 0);
      runtime.battleWin0H = 0;
      runtime.battleWin0V = 0;
      setGpuReg(runtime, REG_OFFSET_DISPCNT, getGpuReg(runtime, REG_OFFSET_DISPCNT) ^ DISPCNT_OBJWIN_ON);
      setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
      setGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
      destroySprite(runtime.sprites[task.data[0]]);
      if (task.data[6] === 1) ++runtime.sprites[runtime.battlerSpriteIds[battlePartner(runtime.battleAnimAttacker)]].oam.priority;
      runtime.battleBg1Y = 0;
      destroyAnimVisualTask(runtime, taskId);
    }
  }
}

export function InitStatsChangeAnimation(runtime: UtilityRuntime, taskId: number): void {
  runtime.statsChangeData = { battler1: 0, battler2: 0, higherPriority: 0, data: runtime.battleAnimArgs.slice(0, 8), species: 0 };
  runtime.tasks[taskId]!.func = 'StatsChangeAnimation_Step1';
}

export function StatsChangeAnimation_Step1(runtime: UtilityRuntime, taskId: number): void {
  const data = runtime.statsChangeData!;
  data.battler1 = data.data[2] === 0 ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  data.battler2 = battlePartner(data.battler1);
  if (runtime.contest || (data.data[3] && !isBattlerSpriteVisible(runtime, data.battler2))) data.data[3] = 0;
  runtime.battleWin0H = 0;
  runtime.battleWin0V = 0;
  setGpuReg(runtime, REG_OFFSET_DISPCNT, getGpuReg(runtime, REG_OFFSET_DISPCNT) | DISPCNT_OBJWIN_ON);
  setGpuReg(runtime, REG_OFFSET_BLDCNT, 1);
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(0, 16));
  if (runtime.doubleBattle && data.data[3] === 0) {
    const position = runtime.battlerPositions[data.battler1];
    if ((position === 3 || position === 0) && isBattlerSpriteVisible(runtime, data.battler2)) {
      runtime.sprites[runtime.battlerSpriteIds[data.battler2]].oam.priority -= 1;
      data.higherPriority = 1;
    }
  }
  data.species = runtime.battlerSpecies[data.battler1];
  runtime.tasks[taskId]!.func = 'StatsChangeAnimation_Step2';
}

export function StatsChangeAnimation_Step2(runtime: UtilityRuntime, taskId: number): void {
  const data = runtime.statsChangeData!;
  const task = runtime.tasks[taskId]!;
  const spriteId = createInvisibleSpriteCopy(runtime, data.battler1, runtime.battlerSpriteIds[data.battler1], data.species);
  let newSpriteId = 0;
  if (data.data[3]) newSpriteId = createInvisibleSpriteCopy(runtime, data.battler2, runtime.battlerSpriteIds[data.battler2], data.species);
  runtime.operations.push(`AnimLoadCompressedBgTilemap:stat:${data.data[0]}`);
  runtime.operations.push(`LoadCompressedPalette:stat:${data.data[1]}`);
  runtime.battleBg1X = 0;
  runtime.battleBg1Y = 0;
  if (data.data[0] === 1) {
    runtime.battleBg1X = 64;
    task.data[1] = -3;
  } else task.data[1] = 3;
  if (data.data[4] === 0) {
    task.data[4] = 10;
    task.data[5] = 20;
  } else {
    task.data[4] = 13;
    task.data[5] = 30;
  }
  task.data[0] = spriteId;
  task.data[2] = data.data[3];
  task.data[3] = newSpriteId;
  task.data[6] = data.higherPriority;
  task.data[7] = runtime.battlerSpriteIds[data.battler2];
  task.func = 'StatsChangeAnimation_Step3';
  playSe12WithPanning(runtime, data.data[0] === 0 ? SE_M_STAT_INCREASE : SE_M_STAT_DECREASE, battleAnimAdjustPanning2(SOUND_PAN_ATTACKER));
}

export function StatsChangeAnimation_Step3(runtime: UtilityRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  runtime.battleBg1Y += task.data[1];
  switch (task.data[15]) {
    case 0:
      if (task.data[11]++ > 0) {
        task.data[11] = 0;
        ++task.data[12];
        setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(task.data[12], 16 - task.data[12]));
        if (task.data[12] === task.data[4]) ++task.data[15];
      }
      break;
    case 1:
      if (++task.data[10] === task.data[5]) ++task.data[15];
      break;
    case 2:
      if (task.data[11]++ > 0) {
        task.data[11] = 0;
        --task.data[12];
        setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(task.data[12], 16 - task.data[12]));
        if (task.data[12] === 0) {
          resetBattleAnimBg(runtime, 0);
          ++task.data[15];
        }
      }
      break;
    case 3:
      runtime.battleWin0H = 0;
      runtime.battleWin0V = 0;
      setGpuReg(runtime, REG_OFFSET_DISPCNT, getGpuReg(runtime, REG_OFFSET_DISPCNT) ^ DISPCNT_OBJWIN_ON);
      setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
      setGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
      destroySprite(runtime.sprites[task.data[0]]);
      if (task.data[2]) destroySprite(runtime.sprites[task.data[3]]);
      if (task.data[6] === 1) ++runtime.sprites[task.data[7]].oam.priority;
      runtime.statsChangeData = null;
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimTask_Flash(runtime: UtilityRuntime, taskId: number): void {
  let selectedPalettes = getBattleMonSpritePalettesMask(1, 1, 1, 1);
  SetPalettesToColor(runtime, selectedPalettes, 0);
  const task = runtime.tasks[taskId]!;
  task.data[14] = selectedPalettes >> 16;
  selectedPalettes = getBattlePalettesMask(1, 0, 0, 0, 0, 0, 0) & 0xffff;
  SetPalettesToColor(runtime, selectedPalettes, 0xffff);
  task.data[15] = selectedPalettes;
  task.data[0] = 0;
  task.data[1] = 0;
  task.func = 'AnimTask_Flash_Step';
}

export function AnimTask_Flash_Step(runtime: UtilityRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] > 6) {
        task.data[1] = 0;
        task.data[2] = 16;
        ++task.data[0];
      }
      break;
    case 1:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        --task.data[2];
        for (let i = 0; i < 16; ++i) {
          if ((task.data[15] >> i) & 1) blendPalette(runtime, bgPlttId(i), 16, task.data[2], 0xffff);
          if ((task.data[14] >> i) & 1) blendPalette(runtime, objPlttId(i), 16, task.data[2], 0);
        }
        if (task.data[2] === 0) ++task.data[0];
      }
      break;
    case 2:
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function SetPalettesToColor(runtime: UtilityRuntime, selectedPalettes: number, color: number): void {
  for (let i = 0; i < 32; selectedPalettes >>>= 1, ++i) {
    if (selectedPalettes & 1) {
      const paletteOffset = plttId(i);
      for (let curOffset = paletteOffset; curOffset < paletteOffset + 16; ++curOffset) runtime.plttBufferFaded[curOffset] = color;
    }
  }
}

export function AnimTask_BlendNonAttackerPalettes(runtime: UtilityRuntime, taskId: number): void {
  let selectedPalettes = 0;
  for (let battler = 0; battler < MAX_BATTLERS_COUNT; ++battler) if (runtime.battleAnimAttacker !== battler) selectedPalettes |= 1 << (battler + 16);
  for (let j = 5; j !== 0; --j) runtime.battleAnimArgs[j] = runtime.battleAnimArgs[j - 1];
  StartBlendAnimSpriteColor(runtime, taskId, selectedPalettes);
}

export function AnimTask_StartSlidingBg(runtime: UtilityRuntime, taskId: number): number {
  toggleBg3Mode(runtime, 0);
  const newTaskId = createUtilityTask(runtime, 'AnimTask_UpdateSlidingBg');
  if (runtime.battleAnimArgs[2] && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
    runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
  }
  runtime.tasks[newTaskId]!.data[1] = runtime.battleAnimArgs[0];
  runtime.tasks[newTaskId]!.data[2] = runtime.battleAnimArgs[1];
  runtime.tasks[newTaskId]!.data[3] = runtime.battleAnimArgs[3];
  ++runtime.tasks[newTaskId]!.data[0];
  destroyAnimVisualTask(runtime, taskId);
  return newTaskId;
}

export function AnimTask_UpdateSlidingBg(runtime: UtilityRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[10] += task.data[1];
  task.data[11] += task.data[2];
  runtime.battleBg3X += task.data[10] >> 8;
  runtime.battleBg3Y += task.data[11] >> 8;
  task.data[10] &= 0xff;
  task.data[11] &= 0xff;
  if (runtime.battleAnimArgs[7] === task.data[3]) {
    runtime.battleBg3X = 0;
    runtime.battleBg3Y = 0;
    toggleBg3Mode(runtime, 1);
    destroyTask(runtime, taskId);
  }
}

export function AnimTask_GetAttackerSide(runtime: UtilityRuntime, taskId: number): void {
  runtime.battleAnimArgs[7] = getBattlerSide(runtime, runtime.battleAnimAttacker);
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_GetTargetSide(runtime: UtilityRuntime, taskId: number): void {
  runtime.battleAnimArgs[7] = getBattlerSide(runtime, runtime.battleAnimTarget);
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_GetTargetIsAttackerPartner(runtime: UtilityRuntime, taskId: number): void {
  runtime.battleAnimArgs[7] = Number(battlePartner(runtime.battleAnimAttacker) === runtime.battleAnimTarget);
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_SetAllNonAttackersInvisiblity(runtime: UtilityRuntime, taskId: number): void {
  for (let battler = 0; battler < MAX_BATTLERS_COUNT; ++battler) {
    if (battler !== runtime.battleAnimAttacker && isBattlerSpriteVisible(runtime, battler)) {
      runtime.sprites[runtime.battlerSpriteIds[battler]].invisible = Boolean(runtime.battleAnimArgs[0]);
    }
  }
  destroyAnimVisualTask(runtime, taskId);
}

export function StartMonScrollingBgMask(runtime: UtilityRuntime, taskId: number, _unused: number, scrollSpeed: number, battler1: number, includePartner: boolean, numFadeSteps: number, fadeStepDelay: number, duration: number, gfx: string, tilemap: string, palette: string): void {
  const battler2 = battlePartner(battler1);
  if (runtime.contest || (includePartner && !isBattlerSpriteVisible(runtime, battler2))) includePartner = false;
  runtime.battleWin0H = 0;
  runtime.battleWin0V = 0;
  setGpuReg(runtime, REG_OFFSET_DISPCNT, getGpuReg(runtime, REG_OFFSET_DISPCNT) | DISPCNT_OBJWIN_ON);
  setGpuReg(runtime, REG_OFFSET_BLDCNT, 1);
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(0, 16));
  const spriteId = createInvisibleSpriteCopy(runtime, battler1, runtime.battlerSpriteIds[battler1], runtime.battlerSpecies[battler1]);
  const newSpriteId = includePartner ? createInvisibleSpriteCopy(runtime, battler2, runtime.battlerSpriteIds[battler2], runtime.battlerSpecies[battler1]) : 0;
  runtime.operations.push(`AnimLoadCompressedBgTilemap:${tilemap}`);
  runtime.operations.push(`AnimLoadCompressedBgGfx:${gfx}`);
  runtime.operations.push(`LoadCompressedPalette:${palette}`);
  runtime.battleBg1X = 0;
  runtime.battleBg1Y = 0;
  const task = runtime.tasks[taskId]!;
  task.data[1] = scrollSpeed;
  task.data[4] = numFadeSteps;
  task.data[5] = duration;
  task.data[6] = fadeStepDelay;
  task.data[0] = spriteId;
  task.data[2] = Number(includePartner);
  task.data[3] = newSpriteId;
  task.func = 'UpdateMonScrollingBgMask';
}

export function UpdateMonScrollingBgMask(runtime: UtilityRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[13] += task.data[1] < 0 ? -task.data[1] : task.data[1];
  if (task.data[1] < 0) runtime.battleBg1Y -= task.data[13] >> 8;
  else runtime.battleBg1Y += task.data[13] >> 8;
  task.data[13] &= 0xff;
  switch (task.data[15]) {
    case 0:
      if (task.data[11]++ >= task.data[6]) {
        task.data[11] = 0;
        ++task.data[12];
        setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(task.data[12], 16 - task.data[12]));
        if (task.data[12] === task.data[4]) ++task.data[15];
      }
      break;
    case 1:
      if (++task.data[10] === task.data[5]) ++task.data[15];
      break;
    case 2:
      if (task.data[11]++ >= task.data[6]) {
        task.data[11] = 0;
        --task.data[12];
        setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(task.data[12], 16 - task.data[12]));
        if (task.data[12] === 0) {
          resetBattleAnimBg(runtime, 0);
          runtime.battleWin0H = 0;
          runtime.battleWin0V = 0;
          setGpuReg(runtime, REG_OFFSET_DISPCNT, getGpuReg(runtime, REG_OFFSET_DISPCNT) ^ DISPCNT_OBJWIN_ON);
          setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
          setGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
          destroySprite(runtime.sprites[task.data[0]]);
          if (task.data[2]) destroySprite(runtime.sprites[task.data[3]]);
          destroyAnimVisualTask(runtime, taskId);
        }
      }
      break;
  }
}

export function AnimTask_GetBattleTerrain(runtime: UtilityRuntime, taskId: number): void {
  runtime.battleAnimArgs[0] = runtime.battleTerrain;
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_AllocBackupPalBuffer(runtime: UtilityRuntime, taskId: number): void {
  runtime.backupPalBuffer = Array.from({ length: 0x1000 }, () => 0);
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_FreeBackupPalBuffer(runtime: UtilityRuntime, taskId: number): void {
  runtime.backupPalBuffer = null;
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_CopyPalUnfadedToBackup(runtime: UtilityRuntime, taskId: number): void {
  const paletteIndex = resolvePaletteIndex(runtime);
  copy(runtime.plttBufferUnfaded, plttId(paletteIndex), runtime.backupPalBuffer!, runtime.battleAnimArgs[1] * 16, 16);
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_CopyPalUnfadedFromBackup(runtime: UtilityRuntime, taskId: number): void {
  const paletteIndex = resolvePaletteIndex(runtime);
  copy(runtime.backupPalBuffer!, runtime.battleAnimArgs[1] * 16, runtime.plttBufferUnfaded, plttId(paletteIndex), 16);
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_CopyPalFadedToUnfaded(runtime: UtilityRuntime, taskId: number): void {
  const paletteIndex = resolvePaletteIndex(runtime);
  copy(runtime.plttBufferFaded, plttId(paletteIndex), runtime.plttBufferUnfaded, plttId(paletteIndex), 16);
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_IsContest(runtime: UtilityRuntime, taskId: number): void {
  runtime.battleAnimArgs[ARG_RET_ID] = Number(runtime.contest);
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_SetAnimAttackerAndTargetForEffectTgt(runtime: UtilityRuntime, taskId: number): void {
  runtime.battleAnimAttacker = runtime.battlerTarget;
  runtime.battleAnimTarget = runtime.effectBattler;
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_IsTargetSameSide(runtime: UtilityRuntime, taskId: number): void {
  runtime.battleAnimArgs[ARG_RET_ID] = Number(getBattlerSide(runtime, runtime.battleAnimAttacker) === getBattlerSide(runtime, runtime.battleAnimTarget));
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_SetAnimTargetToBattlerTarget(runtime: UtilityRuntime, taskId: number): void {
  runtime.battleAnimTarget = runtime.battlerTarget;
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_SetAnimAttackerAndTargetForEffectAtk(runtime: UtilityRuntime, taskId: number): void {
  runtime.battleAnimAttacker = runtime.battlerAttacker;
  runtime.battleAnimTarget = runtime.effectBattler;
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_SetAttackerInvisibleWaitForSignal(runtime: UtilityRuntime, taskId: number): void {
  if (runtime.contest) destroyAnimVisualTask(runtime, taskId);
  else {
    runtime.tasks[taskId]!.data[0] = runtime.battlerDataInvisible[runtime.battleAnimAttacker];
    runtime.battlerDataInvisible[runtime.battleAnimAttacker] = 1;
    runtime.tasks[taskId]!.func = 'AnimTask_WaitAndRestoreVisibility';
    --runtime.animVisualTaskCount;
  }
}

export function AnimTask_WaitAndRestoreVisibility(runtime: UtilityRuntime, taskId: number): void {
  if (runtime.battleAnimArgs[7] === 0x1000) {
    runtime.battlerDataInvisible[runtime.battleAnimAttacker] = runtime.tasks[taskId]!.data[0] & 1;
    destroyTask(runtime, taskId);
  }
}

export const animTaskBlendBattleAnimPal = AnimTask_BlendBattleAnimPal;
export const animTaskBlendBattleAnimPalExclude = AnimTask_BlendBattleAnimPalExclude;
export const animTaskSetCamouflageBlend = AnimTask_SetCamouflageBlend;
export const animTaskBlendParticle = AnimTask_BlendParticle;
export const startBlendAnimSpriteColor = StartBlendAnimSpriteColor;
export const animTaskBlendSpriteColorStep2 = AnimTask_BlendSpriteColor_Step2;
export const animTaskHardwarePaletteFade = AnimTask_HardwarePaletteFade;
export const animTaskHardwarePaletteFadeStep = AnimTask_HardwarePaletteFade_Step;
export const animTaskTraceMonBlended = AnimTask_TraceMonBlended;
export const animTaskTraceMonBlendedStep = AnimTask_TraceMonBlended_Step;
export const animMonTrace = AnimMonTrace;
export const animTaskDrawFallingWhiteLinesOnAttacker = AnimTask_DrawFallingWhiteLinesOnAttacker;
export const animTaskDrawFallingWhiteLinesOnAttackerStep = AnimTask_DrawFallingWhiteLinesOnAttacker_Step;
export const initStatsChangeAnimation = InitStatsChangeAnimation;
export const statsChangeAnimationStep1 = StatsChangeAnimation_Step1;
export const statsChangeAnimationStep2 = StatsChangeAnimation_Step2;
export const statsChangeAnimationStep3 = StatsChangeAnimation_Step3;
export const animTaskFlash = AnimTask_Flash;
export const animTaskFlashStep = AnimTask_Flash_Step;
export const setPalettesToColor = SetPalettesToColor;
export const animTaskBlendNonAttackerPalettes = AnimTask_BlendNonAttackerPalettes;
export const animTaskStartSlidingBg = AnimTask_StartSlidingBg;
export const animTaskUpdateSlidingBg = AnimTask_UpdateSlidingBg;
export const animTaskGetAttackerSide = AnimTask_GetAttackerSide;
export const animTaskGetTargetSide = AnimTask_GetTargetSide;
export const animTaskGetTargetIsAttackerPartner = AnimTask_GetTargetIsAttackerPartner;
export const animTaskSetAllNonAttackersInvisiblity = AnimTask_SetAllNonAttackersInvisiblity;
export const startMonScrollingBgMask = StartMonScrollingBgMask;
export const updateMonScrollingBgMask = UpdateMonScrollingBgMask;
export const animTaskGetBattleTerrain = AnimTask_GetBattleTerrain;
export const animTaskAllocBackupPalBuffer = AnimTask_AllocBackupPalBuffer;
export const animTaskFreeBackupPalBuffer = AnimTask_FreeBackupPalBuffer;
export const animTaskCopyPalUnfadedToBackup = AnimTask_CopyPalUnfadedToBackup;
export const animTaskCopyPalUnfadedFromBackup = AnimTask_CopyPalUnfadedFromBackup;
export const animTaskCopyPalFadedToUnfaded = AnimTask_CopyPalFadedToUnfaded;
export const animTaskIsContest = AnimTask_IsContest;
export const animTaskSetAnimAttackerAndTargetForEffectTgt = AnimTask_SetAnimAttackerAndTargetForEffectTgt;
export const animTaskIsTargetSameSide = AnimTask_IsTargetSameSide;
export const animTaskSetAnimTargetToBattlerTarget = AnimTask_SetAnimTargetToBattlerTarget;
export const animTaskSetAnimAttackerAndTargetForEffectAtk = AnimTask_SetAnimAttackerAndTargetForEffectAtk;
export const animTaskSetAttackerInvisibleWaitForSignal = AnimTask_SetAttackerInvisibleWaitForSignal;
export const animTaskWaitAndRestoreVisibility = AnimTask_WaitAndRestoreVisibility;

const rgb = (r: number, g: number, b: number): number => r | (g << 5) | (b << 10);
const bldAlphaBlend = (eva: number, evb: number): number => (eva & 0x1f) | ((evb & 0x1f) << 8);
const plttId = (index: number): number => index * 16;
const bgPlttId = plttId;
const objPlttId = (index: number): number => (index + 16) * 16;
const battlePartner = (battler: number): number => battler ^ 2;
const getBattlerSide = (runtime: UtilityRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const isBattlerSpriteVisible = (runtime: UtilityRuntime, battler: number): boolean => runtime.battlerVisible[battler] === true;
const getSpritePalIdxByBattler = (battler: number): number => battler;
const indexOfSpritePaletteTag = (tag: number): number => tag;
export const unpackSelectedBattlePalettes = (selected: number): number => {
  let mask = 0;
  if (selected & 1) mask |= 0x000e;
  if (selected & 2) mask |= 1 << 16;
  if (selected & 4) mask |= 1 << 17;
  if (selected & 8) mask |= 1 << 18;
  if (selected & 16) mask |= 1 << 19;
  if (selected & 32) mask |= 1 << 4;
  if (selected & 64) mask |= 1 << 5;
  return mask;
};
const getBattleMonSpritePalettesMask = (pLeft: number, pRight: number, eLeft: number, eRight: number): number =>
  (pLeft ? 1 << 16 : 0) | (pRight ? 1 << 18 : 0) | (eLeft ? 1 << 17 : 0) | (eRight ? 1 << 19 : 0);
const getBattlePalettesMask = (bg: number, _a: number, _b: number, _c: number, _d: number, _e: number, _f: number): number => bg ? 0x000e : 0;
const blendPalette = (runtime: UtilityRuntime, offset: number, size: number, coeff: number, color: number): void => {
  runtime.blends.push({ offset, size, coeff, color });
};
const setGpuReg = (runtime: UtilityRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value;
  runtime.operations.push(`SetGpuReg:${reg}:${value}`);
};
const getGpuReg = (runtime: UtilityRuntime, reg: string): number => runtime.gpuRegs[reg] ?? 0;
const resetBattleAnimBg = (runtime: UtilityRuntime, bg: number): void => {
  runtime.operations.push(`ResetBattleAnimBg:${bg}`);
};
const createInvisibleSpriteCopy = (runtime: UtilityRuntime, battler: number, _spriteId: number, species: number): number => {
  const id = runtime.sprites.findIndex((sprite, index) => index >= 4 && sprite.callback === 'SpriteCallbackDummy' && !sprite.invisible && !sprite.destroyed && sprite.data.every((value) => value === 0));
  if (id < 0) return -1;
  runtime.sprites[id] = createUtilitySprite();
  runtime.sprites[id].invisible = true;
  runtime.operations.push(`CreateInvisibleSpriteCopy:${battler}:${id}:${species}`);
  return id;
};
const cloneBattlerSpriteWithBlend = (runtime: UtilityRuntime, animBattler: number): number => {
  const battler = animBattler === ANIM_ATTACKER ? runtime.battleAnimAttacker : animBattler === ANIM_TARGET ? runtime.battleAnimTarget : animBattler;
  return createInvisibleSpriteCopy(runtime, battler, runtime.battlerSpriteIds[battler], runtime.battlerSpecies[battler]);
};
const getAnimBattlerSpriteId = (runtime: UtilityRuntime, animBattler: number): number => {
  const battler = animBattler === ANIM_ATTACKER ? runtime.battleAnimAttacker : animBattler === ANIM_TARGET ? runtime.battleAnimTarget : animBattler;
  return runtime.battlerSpriteIds[battler] ?? 0;
};
const destroySprite = (sprite: UtilitySprite): void => {
  sprite.destroyed = true;
};
const destroySpriteWithActiveSheet = (runtime: UtilityRuntime, sprite: UtilitySprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroySpriteWithActiveSheet';
  runtime.operations.push('DestroySpriteWithActiveSheet');
};
const destroyAnimVisualTask = (runtime: UtilityRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};
const destroyTask = (runtime: UtilityRuntime, taskId: number): void => {
  if (runtime.tasks[taskId]) runtime.tasks[taskId]!.destroyed = true;
};
const toggleBg3Mode = (runtime: UtilityRuntime, mode: number): void => {
  runtime.operations.push(`ToggleBg3Mode:${mode}`);
};
const playSe12WithPanning = (runtime: UtilityRuntime, song: string, pan: number): void => {
  runtime.sounds.push({ song, pan });
};
const battleAnimAdjustPanning2 = (pan: number): number => pan;
const resolvePaletteIndex = (runtime: UtilityRuntime): number => {
  if (runtime.battleAnimArgs[0] === 0) {
    let selectedPalettes = getBattlePalettesMask(1, 0, 0, 0, 0, 0, 0);
    let paletteIndex = 0;
    while ((selectedPalettes & 1) === 0) {
      ++paletteIndex;
      selectedPalettes >>>= 1;
    }
    return paletteIndex;
  }
  if (runtime.battleAnimArgs[0] === 1) return runtime.battleAnimAttacker + 16;
  if (runtime.battleAnimArgs[0] === 2) return runtime.battleAnimTarget + 16;
  return 0;
};
const copy = (src: number[], srcOffset: number, dst: number[], dstOffset: number, length: number): void => {
  for (let i = 0; i < length; i++) dst[dstOffset + i] = src[srcOffset + i];
};
