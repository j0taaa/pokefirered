export const STAT_ATK = 1;
export const STAT_DEF = 2;
export const STAT_SPEED = 3;
export const STAT_SPATK = 4;
export const STAT_SPDEF = 5;
export const STAT_ACC = 6;
export const STAT_EVASION = 7;

export const STAT_ANIM_PLUS1 = 15;
export const STAT_ANIM_PLUS2 = 39;
export const STAT_ANIM_MINUS1 = 22;
export const STAT_ANIM_MINUS2 = 46;
export const STAT_ANIM_MULTIPLE_PLUS1 = 55;
export const STAT_ANIM_MULTIPLE_PLUS2 = 56;
export const STAT_ANIM_MULTIPLE_MINUS1 = 57;
export const STAT_ANIM_MULTIPLE_MINUS2 = 58;

export const RGB_RED = 0x001f;
export const RGB_BLUE = 0x7c00;
export const ANIM_TAG_CIRCLE_IMPACT = 'ANIM_TAG_CIRCLE_IMPACT';
export const ANIM_TAG_ICE_CUBE = 'ANIM_TAG_ICE_CUBE';
export const REG_OFFSET_BLDCNT = 'REG_OFFSET_BLDCNT';
export const REG_OFFSET_BLDALPHA = 'REG_OFFSET_BLDALPHA';
export const BLDCNT_EFFECT_BLEND = 0x0040;
export const BLDCNT_TGT2_ALL = 0x3f00;

export type StatusCallback =
  | 'AnimTranslateLinearAndFlicker'
  | 'AnimTranslateLinearAndFlicker_Flipped'
  | 'AnimWeatherBallUp'
  | 'AnimWeatherBallDown'
  | 'AnimSpinningSparkle'
  | 'SpriteCallbackDummy'
  | 'AnimFlashingCircleImpact'
  | 'AnimFlashingCircleImpact_Step'
  | 'DestroySprite'
  | 'DestroySpriteAndFreeResources';

export type StatusTaskFunc =
  | 'Task_UpdateFlashingCircleImpacts'
  | 'AnimTask_FrozenIceCube_Step1'
  | 'AnimTask_FrozenIceCube_Step2'
  | 'AnimTask_FrozenIceCube_Step3'
  | 'AnimTask_FrozenIceCube_Step4'
  | 'Task_DoStatusAnimation'
  | 'InitStatsChangeAnimation'
  | 'DestroyAnimVisualTask';

export interface StatusSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: StatusCallback;
}

export interface StatusSubsprite {
  x: number;
  y: number;
  shape: string;
  size: string;
  tileOffset: number;
  priority: number;
}

export interface StatusSubspriteTable {
  count: number;
  subsprites: readonly StatusSubsprite[];
}

export interface StatusSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  subpriority: number;
  callback: StatusCallback;
  subspriteTable: readonly StatusSubspriteTable[] | null;
  oamMatrixFreed: boolean;
  destroyed: boolean;
  resourcesFreed: boolean;
}

export interface StatusTask {
  id: number;
  data: number[];
  func: StatusTaskFunc;
  priority: number;
  destroyed: boolean;
}

export interface StatusRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  battlerSpriteIds: Record<number, number>;
  battlerCoords: Record<number, { x2: number; yPicOffset: number }>;
  contest: boolean;
  sprites: StatusSprite[];
  tasks: StatusTask[];
  gpuRegs: Record<string, number>;
  plttBufferFaded: number[];
  spriteTileStartsByTag: Record<string, number>;
  spritePaletteIndexesByTag: Record<string, number>;
  loadedSheets: string[];
  loadedPalettes: string[];
  blendPaletteCalls: Array<{ start: number; count: number; coeff: number; color: number }>;
  battleSpritesData: {
    animationData: { animArg: number };
    healthBoxesData: Record<number, { statusAnimActive: boolean }>;
  };
  animScriptActive: boolean;
  animScriptCallbackCalls: number;
  launchedAnimations: Array<{ table: string; statusAnimId: number; arg: number }>;
}

export const sAnimFlickeringOrb = [
  'ANIMCMD_FRAME(0, 3)',
  'ANIMCMD_FRAME(4, 3)',
  'ANIMCMD_FRAME(8, 3)',
  'ANIMCMD_FRAME(12, 3)',
  'ANIMCMD_JUMP(0)'
] as const;
export const sAnimsFlickeringOrb = [sAnimFlickeringOrb] as const;

export const sFlickeringOrbSpriteTemplate: StatusSpriteTemplate = {
  tileTag: 'ANIM_TAG_ORB',
  paletteTag: 'ANIM_TAG_ORB',
  oam: 'gOamData_AffineOff_ObjNormal_16x16',
  anims: sAnimsFlickeringOrb,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimTranslateLinearAndFlicker'
};

export const sFlickeringOrbFlippedSpriteTemplate: StatusSpriteTemplate = {
  tileTag: 'ANIM_TAG_ORB',
  paletteTag: 'ANIM_TAG_ORB',
  oam: 'gOamData_AffineOff_ObjNormal_16x16',
  anims: sAnimsFlickeringOrb,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimTranslateLinearAndFlicker_Flipped'
};

export const sAnimWeatherBallNormal = ['ANIMCMD_FRAME(0, 3)', 'ANIMCMD_JUMP(0)'] as const;
export const sAnimsWeatherBallNormal = [sAnimWeatherBallNormal] as const;

export const gWeatherBallUpSpriteTemplate: StatusSpriteTemplate = {
  tileTag: 'ANIM_TAG_WEATHER_BALL',
  paletteTag: 'ANIM_TAG_WEATHER_BALL',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: sAnimsWeatherBallNormal,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimWeatherBallUp'
};

export const gWeatherBallNormalDownSpriteTemplate: StatusSpriteTemplate = {
  tileTag: 'ANIM_TAG_WEATHER_BALL',
  paletteTag: 'ANIM_TAG_WEATHER_BALL',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: sAnimsWeatherBallNormal,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimWeatherBallDown'
};

export const sAnimSpinningSparkle = [
  'ANIMCMD_FRAME(0, 3)',
  'ANIMCMD_FRAME(16, 3)',
  'ANIMCMD_FRAME(32, 3)',
  'ANIMCMD_FRAME(48, 3)',
  'ANIMCMD_FRAME(64, 3)',
  'ANIMCMD_END'
] as const;
export const sAnimsSpinningSparkle = [sAnimSpinningSparkle] as const;

export const gSpinningSparkleSpriteTemplate: StatusSpriteTemplate = {
  tileTag: 'ANIM_TAG_SPARKLE_4',
  paletteTag: 'ANIM_TAG_SPARKLE_4',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: sAnimsSpinningSparkle,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimSpinningSparkle'
};

export const sFlickeringFootSpriteTemplate: StatusSpriteTemplate = {
  tileTag: 'ANIM_TAG_MONSTER_FOOT',
  paletteTag: 'ANIM_TAG_MONSTER_FOOT',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimTranslateLinearAndFlicker'
};

export const sAnimFlickeringImpact0 = ['ANIMCMD_FRAME(0, 5)', 'ANIMCMD_JUMP(0)'] as const;
export const sAnimFlickeringImpact1 = ['ANIMCMD_FRAME(0, 5)', 'ANIMCMD_JUMP(0)'] as const;
export const sAnimFlickeringImpact2 = ['ANIMCMD_FRAME(0, 5)', 'ANIMCMD_JUMP(0)'] as const;
export const sAnimsFlickeringImpact = [sAnimFlickeringImpact0, sAnimFlickeringImpact1, sAnimFlickeringImpact2] as const;

export const sFlickeringImpactSpriteTemplate: StatusSpriteTemplate = {
  tileTag: 'ANIM_TAG_IMPACT',
  paletteTag: 'ANIM_TAG_IMPACT',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: sAnimsFlickeringImpact,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimTranslateLinearAndFlicker'
};

export const sAnimFlickeringShrinkOrb = ['ANIMCMD_FRAME(0, 15)', 'ANIMCMD_JUMP(0)'] as const;
export const sAnimsFlickeringShrinkOrb = [sAnimFlickeringShrinkOrb] as const;
export const sAffineAnimFlickeringShrinkOrb = [
  'AFFINEANIMCMD_FRAME(96, 96, 0, 0)',
  'AFFINEANIMCMD_FRAME(2, 2, 0, 1)',
  'AFFINEANIMCMD_JUMP(1)'
] as const;
export const sAffineAnimsFlickeringShrinkOrb = [sAffineAnimFlickeringShrinkOrb] as const;

export const sFlickeringShrinkOrbSpriteTemplate: StatusSpriteTemplate = {
  tileTag: 'ANIM_TAG_ORB',
  paletteTag: 'ANIM_TAG_ORB',
  oam: 'gOamData_AffineDouble_ObjNormal_16x16',
  anims: sAnimsFlickeringShrinkOrb,
  images: null,
  affineAnims: sAffineAnimsFlickeringShrinkOrb,
  callback: 'AnimTranslateLinearAndFlicker_Flipped'
};

export const sTextTaskOver = 'TASK OVER\nタスクがオ-バ-しました';

export const sFrozenIceCubeSubsprites = [
  { x: -16, y: -16, shape: 'SPRITE_SHAPE(64x64)', size: 'SPRITE_SIZE(64x64)', tileOffset: 0, priority: 2 },
  { x: -16, y: 48, shape: 'SPRITE_SHAPE(64x32)', size: 'SPRITE_SIZE(64x32)', tileOffset: 64, priority: 2 },
  { x: 48, y: -16, shape: 'SPRITE_SHAPE(32x64)', size: 'SPRITE_SIZE(32x64)', tileOffset: 96, priority: 2 },
  { x: 48, y: 48, shape: 'SPRITE_SHAPE(32x32)', size: 'SPRITE_SIZE(32x32)', tileOffset: 128, priority: 2 }
] as const;

export const sFrozenIceCubeSubspriteTable = [{ count: sFrozenIceCubeSubsprites.length, subsprites: sFrozenIceCubeSubsprites }] as const;

export const sFrozenIceCubeSpriteTemplate: StatusSpriteTemplate = {
  tileTag: ANIM_TAG_ICE_CUBE,
  paletteTag: ANIM_TAG_ICE_CUBE,
  oam: 'gOamData_AffineOff_ObjBlend_64x64',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'SpriteCallbackDummy'
};

export const sFlashingCircleImpactSpriteTemplate: StatusSpriteTemplate = {
  tileTag: ANIM_TAG_CIRCLE_IMPACT,
  paletteTag: ANIM_TAG_CIRCLE_IMPACT,
  oam: 'gOamData_AffineOff_ObjNormal_8x8',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimFlashingCircleImpact'
};

export const createStatusSprite = (id = 0, x = 0, y = 0, subpriority = 0, callback: StatusCallback = 'SpriteCallbackDummy'): StatusSprite => ({
  id,
  x,
  y,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  invisible: false,
  subpriority,
  callback,
  subspriteTable: null,
  oamMatrixFreed: false,
  destroyed: false,
  resourcesFreed: false
});

export const createStatusRuntime = (): StatusRuntime => ({
  battleAnimArgs: Array.from({ length: 8 }, () => 0),
  battleAnimAttacker: 0,
  battleAnimTarget: 1,
  battlerSpriteIds: { 0: 0, 1: 1 },
  battlerCoords: {
    0: { x2: 48, yPicOffset: 64 },
    1: { x2: 160, yPicOffset: 56 }
  },
  contest: false,
  sprites: [
    createStatusSprite(0, 48, 64),
    createStatusSprite(1, 160, 56)
  ],
  tasks: [],
  gpuRegs: {},
  plttBufferFaded: Array.from({ length: 256 }, (_, index) => index),
  spriteTileStartsByTag: { [ANIM_TAG_ICE_CUBE]: 0 },
  spritePaletteIndexesByTag: { [ANIM_TAG_ICE_CUBE]: 2 },
  loadedSheets: [],
  loadedPalettes: [],
  blendPaletteCalls: [],
  battleSpritesData: {
    animationData: { animArg: 0 },
    healthBoxesData: { 0: { statusAnimActive: true }, 1: { statusAnimActive: true } }
  },
  animScriptActive: true,
  animScriptCallbackCalls: 0,
  launchedAnimations: []
});

export const cos = (angle: number, amplitude: number): number =>
  Math.round(Math.cos(((angle & 0xff) * Math.PI * 2) / 256) * amplitude);

export const sin = (angle: number, amplitude: number): number =>
  Math.round(Math.sin(((angle & 0xff) * Math.PI * 2) / 256) * amplitude);

export const bldAlphaBlend = (eva: number, evb: number): number => (eva & 0x1f) | ((evb & 0x1f) << 8);

export const objPlttId = (paletteIndex: number): number => paletteIndex * 16;

const createTask = (runtime: StatusRuntime, func: StatusTaskFunc, priority: number): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({
    id,
    data: Array.from({ length: 16 }, () => 0),
    func,
    priority,
    destroyed: false
  });
  return id;
};

const createSprite = (runtime: StatusRuntime, template: StatusSpriteTemplate, x: number, y: number, subpriority: number): number => {
  const id = runtime.sprites.length;
  runtime.sprites.push(createStatusSprite(id, x, y, subpriority, template.callback));
  return id;
};

const getBattlerSpriteCoord = (runtime: StatusRuntime, battlerId: number, coordType: 'BATTLER_COORD_X_2' | 'BATTLER_COORD_Y_PIC_OFFSET'): number => {
  const coords = runtime.battlerCoords[battlerId] ?? runtime.battlerCoords[0];
  return coordType === 'BATTLER_COORD_X_2' ? coords.x2 : coords.yPicOffset;
};

const setGpuReg = (runtime: StatusRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value & 0xffff;
};

const blendPalette = (runtime: StatusRuntime, start: number, count: number, coeff: number, color: number): void => {
  runtime.blendPaletteCalls.push({ start, count, coeff, color });
};

const destroyTask = (runtime: StatusRuntime, taskId: number): void => {
  runtime.tasks[taskId].destroyed = true;
};

const destroyAnimVisualTask = (runtime: StatusRuntime, taskId: number): void => {
  runtime.tasks[taskId].func = 'DestroyAnimVisualTask';
  destroyTask(runtime, taskId);
};

const destroySprite = (sprite: StatusSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroySprite';
};

const destroySpriteAndFreeResources = (sprite: StatusSprite): void => {
  sprite.destroyed = true;
  sprite.resourcesFreed = true;
  sprite.callback = 'DestroySpriteAndFreeResources';
};

const freeSpriteOamMatrix = (sprite: StatusSprite): void => {
  sprite.oamMatrixFreed = true;
};

const setSubspriteTables = (sprite: StatusSprite, table: readonly StatusSubspriteTable[]): void => {
  sprite.subspriteTable = table;
};

const initStatsChangeAnimation = (runtime: StatusRuntime, taskId: number): void => {
  runtime.tasks[taskId].func = 'InitStatsChangeAnimation';
};

export const taskFlashingCircleImpacts = (runtime: StatusRuntime, battlerId: number, b: boolean): number => {
  const battlerSpriteId = runtime.battlerSpriteIds[battlerId];
  const taskId = createTask(runtime, 'Task_UpdateFlashingCircleImpacts', 10);
  let spriteId2 = 0;

  runtime.loadedSheets.push(ANIM_TAG_CIRCLE_IMPACT);
  runtime.loadedPalettes.push(ANIM_TAG_CIRCLE_IMPACT);
  runtime.tasks[taskId].data[0] = battlerId;
  if (b) {
    runtime.tasks[taskId].data[1] = RGB_RED;
    for (let i = 0; i < 10; i += 1) {
      spriteId2 = createSprite(runtime, sFlashingCircleImpactSpriteTemplate, runtime.sprites[battlerSpriteId].x, runtime.sprites[battlerSpriteId].y + 32, 0);
      runtime.sprites[spriteId2].data[0] = i * 51;
      runtime.sprites[spriteId2].data[1] = -256;
      runtime.sprites[spriteId2].invisible = true;
      if (i > 4) {
        runtime.sprites[spriteId2].data[6] = 21;
      }
    }
  } else {
    runtime.tasks[taskId].data[1] = RGB_BLUE;
    for (let i = 0; i < 10; i += 1) {
      spriteId2 = createSprite(runtime, sFlashingCircleImpactSpriteTemplate, runtime.sprites[battlerSpriteId].x, runtime.sprites[battlerSpriteId].y - 32, 0);
      runtime.sprites[spriteId2].data[0] = i * 51;
      runtime.sprites[spriteId2].data[1] = 256;
      runtime.sprites[spriteId2].invisible = true;
      if (i > 4) {
        runtime.sprites[spriteId2].data[6] = 21;
      }
    }
  }
  runtime.sprites[spriteId2].data[7] = 1;
  return taskId;
};

export const taskUpdateFlashingCircleImpacts = (runtime: StatusRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task.data[2] === 2) {
    task.data[2] = 0;
    blendPalette(runtime, objPlttId(task.data[0]), 16, task.data[4], task.data[1]);
    if (task.data[5] === 0) {
      task.data[4] += 1;
      if (task.data[4] > 8) {
        task.data[5] ^= 1;
      }
    } else {
      const var_ = task.data[4] & 0xffff;

      task.data[4] -= 1;
      if (task.data[4] < 0) {
        task.data[4] = var_;
        task.data[5] ^= 1;
        task.data[3] += 1;
        if (task.data[3] === 2) {
          destroyTask(runtime, taskId);
        }
      }
    }
  } else {
    task.data[2] += 1;
  }
};

export const animFlashingCircleImpact = (sprite: StatusSprite): void => {
  if (sprite.data[6] === 0) {
    sprite.invisible = false;
    sprite.callback = 'AnimFlashingCircleImpact_Step';
    animFlashingCircleImpactStep(sprite);
  } else {
    sprite.data[6] -= 1;
  }
};

export const animFlashingCircleImpactStep = (sprite: StatusSprite): void => {
  sprite.x2 = cos(sprite.data[0], 32);
  sprite.y2 = sin(sprite.data[0], 8);
  if (sprite.data[0] < 128) {
    sprite.subpriority = 29;
  } else {
    sprite.subpriority = 31;
  }
  sprite.data[0] = (sprite.data[0] + 8) & 0xff;
  sprite.data[5] += sprite.data[1];
  sprite.y2 += sprite.data[5] >> 8;
  sprite.data[2] += 1;
  if (sprite.data[2] === 52) {
    if (sprite.data[7]) {
      destroySpriteAndFreeResources(sprite);
    } else {
      destroySprite(sprite);
    }
  }
};

export const animTaskFrozenIceCube = (runtime: StatusRuntime, taskId: number): void => {
  let x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'BATTLER_COORD_X_2') - 32;
  const y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'BATTLER_COORD_Y_PIC_OFFSET') - 36;

  if (runtime.contest) {
    x -= 6;
  }

  setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(0, 16));
  const spriteId = createSprite(runtime, sFrozenIceCubeSpriteTemplate, x, y, 4);
  if ((runtime.spriteTileStartsByTag[ANIM_TAG_ICE_CUBE] ?? 0xffff) === 0xffff) {
    runtime.sprites[spriteId].invisible = true;
  }

  setSubspriteTables(runtime.sprites[spriteId], sFrozenIceCubeSubspriteTable);
  runtime.tasks[taskId].data[15] = spriteId;
  runtime.tasks[taskId].func = 'AnimTask_FrozenIceCube_Step1';
};

export const animTaskFrozenIceCubeStep1 = (runtime: StatusRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  task.data[1] += 1;
  if (task.data[1] === 10) {
    task.func = 'AnimTask_FrozenIceCube_Step2';
    task.data[1] = 0;
  } else {
    const var_ = task.data[1] & 0xff;

    setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(var_, 16 - var_));
  }
};

export const animTaskFrozenIceCubeStep2 = (runtime: StatusRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  const palIndex = runtime.spritePaletteIndexesByTag[ANIM_TAG_ICE_CUBE] ?? 0;

  const oldData1 = task.data[1];
  task.data[1] += 1;
  if (oldData1 > 13) {
    task.data[2] += 1;
    if (task.data[2] === 3) {
      const temp = runtime.plttBufferFaded[objPlttId(palIndex) + 13];

      runtime.plttBufferFaded[objPlttId(palIndex) + 13] = runtime.plttBufferFaded[objPlttId(palIndex) + 14];
      runtime.plttBufferFaded[objPlttId(palIndex) + 14] = runtime.plttBufferFaded[objPlttId(palIndex) + 15];
      runtime.plttBufferFaded[objPlttId(palIndex) + 15] = temp;

      task.data[2] = 0;
      task.data[3] += 1;
      if (task.data[3] === 3) {
        task.data[3] = 0;
        task.data[1] = 0;
        task.data[4] += 1;
        if (task.data[4] === 2) {
          task.data[1] = 9;
          task.func = 'AnimTask_FrozenIceCube_Step3';
        }
      }
    }
  }
};

export const animTaskFrozenIceCubeStep3 = (runtime: StatusRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  task.data[1] -= 1;
  if (task.data[1] === -1) {
    task.func = 'AnimTask_FrozenIceCube_Step4';
    task.data[1] = 0;
  } else {
    const var_ = task.data[1] & 0xff;

    setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(var_, 16 - var_));
  }
};

export const animTaskFrozenIceCubeStep4 = (runtime: StatusRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  task.data[1] += 1;
  if (task.data[1] === 37) {
    const spriteId = task.data[15];

    freeSpriteOamMatrix(runtime.sprites[spriteId]);
    destroySprite(runtime.sprites[spriteId]);
  } else if (task.data[1] === 39) {
    setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
    setGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
    destroyAnimVisualTask(runtime, taskId);
  }
};

const statAnimCase = (by: number, stat: number): number => by + stat - 1;

export const animTaskStatsChange = (runtime: StatusRuntime, taskId: number): void => {
  let goesDown = false;
  let animStatId = 0;
  let sharply = false;

  switch (runtime.battleSpritesData.animationData.animArg) {
    case statAnimCase(STAT_ANIM_PLUS1, STAT_ATK): goesDown = false; animStatId = 0; break;
    case statAnimCase(STAT_ANIM_PLUS1, STAT_DEF): goesDown = false; animStatId = 1; break;
    case statAnimCase(STAT_ANIM_PLUS1, STAT_SPEED): goesDown = false; animStatId = 3; break;
    case statAnimCase(STAT_ANIM_PLUS1, STAT_SPATK): goesDown = false; animStatId = 5; break;
    case statAnimCase(STAT_ANIM_PLUS1, STAT_SPDEF): goesDown = false; animStatId = 6; break;
    case statAnimCase(STAT_ANIM_PLUS1, STAT_ACC): goesDown = false; animStatId = 2; break;
    case statAnimCase(STAT_ANIM_PLUS1, STAT_EVASION): goesDown = false; animStatId = 4; break;

    case statAnimCase(STAT_ANIM_MINUS1, STAT_ATK): goesDown = true; animStatId = 0; break;
    case statAnimCase(STAT_ANIM_MINUS1, STAT_DEF): goesDown = true; animStatId = 1; break;
    case statAnimCase(STAT_ANIM_MINUS1, STAT_SPEED): goesDown = true; animStatId = 3; break;
    case statAnimCase(STAT_ANIM_MINUS1, STAT_SPATK): goesDown = true; animStatId = 5; break;
    case statAnimCase(STAT_ANIM_MINUS1, STAT_SPDEF): goesDown = true; animStatId = 6; break;
    case statAnimCase(STAT_ANIM_MINUS1, STAT_ACC): goesDown = true; animStatId = 2; break;
    case statAnimCase(STAT_ANIM_MINUS1, STAT_EVASION): goesDown = true; animStatId = 4; break;

    case statAnimCase(STAT_ANIM_PLUS2, STAT_ATK): goesDown = false; animStatId = 0; sharply = true; break;
    case statAnimCase(STAT_ANIM_PLUS2, STAT_DEF): goesDown = false; animStatId = 1; sharply = true; break;
    case statAnimCase(STAT_ANIM_PLUS2, STAT_SPEED): goesDown = false; animStatId = 3; sharply = true; break;
    case statAnimCase(STAT_ANIM_PLUS2, STAT_SPATK): goesDown = false; animStatId = 5; sharply = true; break;
    case statAnimCase(STAT_ANIM_PLUS2, STAT_SPDEF): goesDown = false; animStatId = 6; sharply = true; break;
    case statAnimCase(STAT_ANIM_PLUS2, STAT_ACC): goesDown = false; animStatId = 2; sharply = true; break;
    case statAnimCase(STAT_ANIM_PLUS2, STAT_EVASION): goesDown = false; animStatId = 4; sharply = true; break;

    case statAnimCase(STAT_ANIM_MINUS2, STAT_ATK): goesDown = true; animStatId = 0; sharply = true; break;
    case statAnimCase(STAT_ANIM_MINUS2, STAT_DEF): goesDown = true; animStatId = 1; sharply = true; break;
    case statAnimCase(STAT_ANIM_MINUS2, STAT_SPEED): goesDown = true; animStatId = 3; sharply = true; break;
    case statAnimCase(STAT_ANIM_MINUS2, STAT_SPATK): goesDown = true; animStatId = 5; sharply = true; break;
    case statAnimCase(STAT_ANIM_MINUS2, STAT_SPDEF): goesDown = true; animStatId = 6; sharply = true; break;
    case statAnimCase(STAT_ANIM_MINUS2, STAT_ACC): goesDown = true; animStatId = 2; sharply = true; break;
    case statAnimCase(STAT_ANIM_MINUS2, STAT_EVASION): goesDown = true; animStatId = 4; sharply = true; break;

    case STAT_ANIM_MULTIPLE_PLUS1: goesDown = false; animStatId = 0xff; sharply = false; break;
    case STAT_ANIM_MULTIPLE_PLUS2: goesDown = false; animStatId = 0xff; sharply = true; break;
    case STAT_ANIM_MULTIPLE_MINUS1: goesDown = true; animStatId = 0xff; sharply = false; break;
    case STAT_ANIM_MULTIPLE_MINUS2: goesDown = true; animStatId = 0xff; sharply = true; break;

    default:
      destroyAnimVisualTask(runtime, taskId);
      return;
  }

  runtime.battleAnimArgs[0] = goesDown ? 1 : 0;
  runtime.battleAnimArgs[1] = animStatId;
  runtime.battleAnimArgs[2] = 0;
  runtime.battleAnimArgs[3] = 0;
  runtime.battleAnimArgs[4] = sharply ? 1 : 0;
  runtime.tasks[taskId].func = 'InitStatsChangeAnimation';
  initStatsChangeAnimation(runtime, taskId);
};

export const launchStatusAnimation = (runtime: StatusRuntime, battlerId: number, statusAnimId: number): number => {
  runtime.battleAnimAttacker = battlerId;
  runtime.battleAnimTarget = battlerId;
  runtime.launchedAnimations.push({ table: 'gBattleAnims_StatusConditions', statusAnimId, arg: 0 });
  const taskId = createTask(runtime, 'Task_DoStatusAnimation', 10);
  runtime.tasks[taskId].data[0] = battlerId;
  return taskId;
};

export const taskDoStatusAnimation = (runtime: StatusRuntime, taskId: number): void => {
  runtime.animScriptCallbackCalls += 1;
  if (!runtime.animScriptActive) {
    runtime.battleSpritesData.healthBoxesData[runtime.tasks[taskId].data[0]].statusAnimActive = false;
    destroyTask(runtime, taskId);
  }
};

export function Task_FlashingCircleImpacts(runtime: StatusRuntime, battlerId: number, b: boolean): number {
  return taskFlashingCircleImpacts(runtime, battlerId, b);
}

export function Task_UpdateFlashingCircleImpacts(runtime: StatusRuntime, taskId: number): void {
  taskUpdateFlashingCircleImpacts(runtime, taskId);
}

export function AnimFlashingCircleImpact(sprite: StatusSprite): void {
  animFlashingCircleImpact(sprite);
}

export function AnimFlashingCircleImpact_Step(sprite: StatusSprite): void {
  animFlashingCircleImpactStep(sprite);
}

export function AnimTask_FrozenIceCube(runtime: StatusRuntime, taskId: number): void {
  animTaskFrozenIceCube(runtime, taskId);
}

export function AnimTask_FrozenIceCube_Step1(runtime: StatusRuntime, taskId: number): void {
  animTaskFrozenIceCubeStep1(runtime, taskId);
}

export function AnimTask_FrozenIceCube_Step2(runtime: StatusRuntime, taskId: number): void {
  animTaskFrozenIceCubeStep2(runtime, taskId);
}

export function AnimTask_FrozenIceCube_Step3(runtime: StatusRuntime, taskId: number): void {
  animTaskFrozenIceCubeStep3(runtime, taskId);
}

export function AnimTask_FrozenIceCube_Step4(runtime: StatusRuntime, taskId: number): void {
  animTaskFrozenIceCubeStep4(runtime, taskId);
}

export function AnimTask_StatsChange(runtime: StatusRuntime, taskId: number): void {
  animTaskStatsChange(runtime, taskId);
}

export function LaunchStatusAnimation(runtime: StatusRuntime, battlerId: number, statusAnimId: number): number {
  return launchStatusAnimation(runtime, battlerId, statusAnimId);
}

export function Task_DoStatusAnimation(runtime: StatusRuntime, taskId: number): void {
  taskDoStatusAnimation(runtime, taskId);
}
