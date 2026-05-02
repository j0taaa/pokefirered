import { cos, sin } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const MAX_SPRITES = 64;
export const TASK_NONE = 0xff;
export const DISPLAY_WIDTH = 240;
export const MAX_BATTLERS_COUNT = 4;
export const BIT_FLANK = 2;
export const ARG_RET_ID = 15;
export const SOUND_PAN_ATTACKER = -64;
export const SOUND_PAN_TARGET = 63;
export const SE_M_HEADBUTT = 'SE_M_HEADBUTT';
export const SE_M_DIG = 'SE_M_DIG';

export type RockCallback =
  | 'AnimFallingRock'
  | 'AnimFallingRock_Step'
  | 'AnimRockFragment'
  | 'AnimParticleInVortex'
  | 'AnimParticleInVortex_Step'
  | 'AnimFlyingSandCrescent'
  | 'AnimRaiseSprite'
  | 'AnimRolloutParticle'
  | 'AnimRockTomb'
  | 'AnimRockTomb_Step'
  | 'AnimRockBlastRock'
  | 'AnimRockScatter'
  | 'AnimRockScatter_Step'
  | 'TranslateSpriteInEllipse'
  | 'TranslateSpriteLinearFixedPoint'
  | 'StartAnimLinearTranslation'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix'
  | 'AnimMoveTwisterParticle'
  | 'AnimWeatherBallDown';

export type RockTaskFunc =
  | 'AnimTask_LoadSandstormBackground_Step'
  | 'AnimTask_Rollout_Step'
  | 'DestroyAnimVisualTask';

export interface RockSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: RockCallback;
}

export interface RockSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: RockCallback;
  storedCallback: RockCallback | null;
  destroyed: boolean;
  invisible: boolean;
  animIndex: number;
  affineAnimIndex: number;
  oam: { tileNum: number; matrixNum: number };
  subspriteTableSet: boolean;
  templateName: string | null;
  subpriority: number;
}

export interface RockTask {
  func: RockTaskFunc;
  data: number[];
  priority: number;
  destroyed: boolean;
}

export interface RockRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  animMoveDmg: number;
  contest: boolean;
  battlerSides: Record<number, number>;
  battlerSpriteIds: Record<number, number>;
  battlerCoords: Record<number, { x: number; y: number; x2: number; y2: number; yPicOffset: number; averageX: number; averageY: number }>;
  sprites: RockSprite[];
  tasks: Array<RockTask | null>;
  createdSprites: number[];
  rolloutTimerStartValue: number;
  rolloutTimer: number;
  battleBg1X: number;
  battleBg1Y: number;
  battleBg3Y: number;
  gpuRegs: Record<string, number>;
  bgAttrs: Record<string, number>;
  bg1Data: { bgId: number; tilesOffset: number; paletteId: number; bgTilemap: string };
  bg3Mode: number | null;
  operations: string[];
  panningLog: Array<{ song: string; pan: number }>;
}

export const sAnimsFlyingRock = [
  [{ frame: 32, duration: 1 }],
  [{ frame: 48, duration: 1 }],
  [{ frame: 64, duration: 1 }]
] as const;

export const sAnimsBasicRock = [
  [{ frame: 0, duration: 1 }],
  [{ frame: 16, duration: 1 }],
  [{ frame: 32, duration: 1 }],
  [{ frame: 48, duration: 1 }],
  [{ frame: 64, duration: 1 }],
  [{ frame: 80, duration: 1 }]
] as const;

export const sAffineAnimsBasicRock = [
  [{ xScale: 0, yScale: 0, rotation: -5, duration: 5 }, { jump: 0 }],
  [{ xScale: 0, yScale: 0, rotation: 5, duration: 5 }, { jump: 0 }]
] as const;

export const gFallingRockSpriteTemplate: RockSpriteTemplate = {
  tileTag: 'ANIM_TAG_ROCKS',
  paletteTag: 'ANIM_TAG_ROCKS',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: sAnimsFlyingRock,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimFallingRock'
};

export const gRockFragmentSpriteTemplate: RockSpriteTemplate = { ...gFallingRockSpriteTemplate, callback: 'AnimRockFragment' };
export const gSwirlingDirtSpriteTemplate: RockSpriteTemplate = {
  tileTag: 'ANIM_TAG_MUD_SAND',
  paletteTag: 'ANIM_TAG_MUD_SAND',
  oam: 'gOamData_AffineOff_ObjNormal_8x8',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimParticleInVortex'
};
export const gWhirlpoolSpriteTemplate: RockSpriteTemplate = {
  tileTag: 'ANIM_TAG_WATER_ORB',
  paletteTag: 'ANIM_TAG_WATER_ORB',
  oam: 'gOamData_AffineNormal_ObjBlend_16x16',
  anims: 'gAnims_WaterMudOrb',
  images: null,
  affineAnims: ['sAffineAnim_Whirlpool'],
  callback: 'AnimParticleInVortex'
};
export const gFireSpinSpriteTemplate: RockSpriteTemplate = {
  tileTag: 'ANIM_TAG_SMALL_EMBER',
  paletteTag: 'ANIM_TAG_SMALL_EMBER',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: 'gAnims_BasicFire',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimParticleInVortex'
};
export const gFlyingSandCrescentSpriteTemplate: RockSpriteTemplate = {
  tileTag: 'ANIM_TAG_FLYING_DIRT',
  paletteTag: 'ANIM_TAG_FLYING_DIRT',
  oam: 'gOamData_AffineOff_ObjNormal_32x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimFlyingSandCrescent'
};
export const gAncientPowerRockSpriteTemplate: RockSpriteTemplate = {
  tileTag: 'ANIM_TAG_ROCKS',
  paletteTag: 'ANIM_TAG_ROCKS',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: sAnimsBasicRock,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimRaiseSprite'
};
export const gRolloutMudSpriteTemplate: RockSpriteTemplate = {
  tileTag: 'ANIM_TAG_MUD_SAND',
  paletteTag: 'ANIM_TAG_MUD_SAND',
  oam: 'gOamData_AffineOff_ObjNormal_8x8',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimRolloutParticle'
};
export const gRolloutRockSpriteTemplate: RockSpriteTemplate = { ...gAncientPowerRockSpriteTemplate, callback: 'AnimRolloutParticle' };
export const gRockTombRockSpriteTemplate: RockSpriteTemplate = { ...gAncientPowerRockSpriteTemplate, callback: 'AnimRockTomb' };
export const gRockBlastRockSpriteTemplate: RockSpriteTemplate = {
  ...gAncientPowerRockSpriteTemplate,
  oam: 'gOamData_AffineNormal_ObjNormal_32x32',
  affineAnims: sAffineAnimsBasicRock,
  callback: 'AnimRockBlastRock'
};
export const gRockScatterSpriteTemplate: RockSpriteTemplate = { ...gRockBlastRockSpriteTemplate, callback: 'AnimRockScatter' };
export const gTwisterRockSpriteTemplate: RockSpriteTemplate = {
  ...gAncientPowerRockSpriteTemplate,
  anims: sAnimsBasicRock.slice(4),
  affineAnims: sAffineAnimsBasicRock,
  callback: 'AnimMoveTwisterParticle'
};
export const gWeatherBallRockDownSpriteTemplate: RockSpriteTemplate = {
  ...gRockBlastRockSpriteTemplate,
  anims: sAnimsBasicRock.slice(2),
  callback: 'AnimWeatherBallDown'
};

export const createRockSprite = (): RockSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 16 }, () => 0),
  callback: 'AnimFallingRock',
  storedCallback: null,
  destroyed: false,
  invisible: false,
  animIndex: 0,
  affineAnimIndex: 0,
  oam: { tileNum: 0, matrixNum: 0 },
  subspriteTableSet: false,
  templateName: null,
  subpriority: 0
});

export const createRockRuntime = (): RockRuntime => ({
  battleAnimArgs: Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: 0,
  battleAnimTarget: 1,
  animMoveDmg: 0,
  contest: false,
  battlerSides: { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerSpriteIds: { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerCoords: {
    0: { x: 32, y: 72, x2: 48, y2: 76, yPicOffset: 64, averageX: 50, averageY: 66 },
    1: { x: 160, y: 80, x2: 176, y2: 84, yPicOffset: 72, averageX: 174, averageY: 74 },
    2: { x: 72, y: 92, x2: 88, y2: 96, yPicOffset: 88, averageX: 90, averageY: 90 },
    3: { x: 200, y: 88, x2: 216, y2: 92, yPicOffset: 86, averageX: 214, averageY: 90 }
  },
  sprites: Array.from({ length: MAX_SPRITES }, () => createRockSprite()),
  tasks: [],
  createdSprites: [],
  rolloutTimerStartValue: 1,
  rolloutTimer: 0,
  battleBg1X: 0,
  battleBg1Y: 0,
  battleBg3Y: 0,
  gpuRegs: {},
  bgAttrs: {},
  bg1Data: { bgId: 1, tilesOffset: 128, paletteId: 3, bgTilemap: 'bg1' },
  bg3Mode: null,
  operations: [],
  panningLog: []
});

export function AnimFallingRock(runtime: RockRuntime, sprite: RockSprite): void {
  if (runtime.battleAnimArgs[3] !== 0) {
    setAverageBattlerPositions(runtime, runtime.battleAnimTarget, sprite);
  }
  sprite.x += runtime.battleAnimArgs[0];
  sprite.y += 14;
  startSpriteAnim(sprite, runtime.battleAnimArgs[1]);
  animateSprite(sprite);
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.data[2] = 4;
  sprite.data[3] = 16;
  sprite.data[4] = -70;
  sprite.data[5] = runtime.battleAnimArgs[2];
  storeSpriteCallbackInData6(sprite, 'AnimFallingRock_Step');
  sprite.callback = 'TranslateSpriteInEllipse';
  translateSpriteInEllipse(sprite);
}

export function AnimFallingRock_Step(sprite: RockSprite): void {
  sprite.x += sprite.data[5];
  sprite.data[0] = 192;
  sprite.data[1] = sprite.data[5];
  sprite.data[2] = 4;
  sprite.data[3] = 32;
  sprite.data[4] = -24;
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
  sprite.callback = 'TranslateSpriteInEllipse';
  translateSpriteInEllipse(sprite);
}

export function AnimRockFragment(runtime: RockRuntime, sprite: RockSprite): void {
  startSpriteAnim(sprite, runtime.battleAnimArgs[5]);
  animateSprite(sprite);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.x -= runtime.battleAnimArgs[0];
  } else {
    sprite.x += runtime.battleAnimArgs[0];
  }
  sprite.y += runtime.battleAnimArgs[1];
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[1] = sprite.x;
  sprite.data[2] = sprite.x + runtime.battleAnimArgs[2];
  sprite.data[3] = sprite.y;
  sprite.data[4] = sprite.y + runtime.battleAnimArgs[3];
  initSpriteDataForLinearTranslation(sprite);
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.callback = 'TranslateSpriteLinearFixedPoint';
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
}

export function AnimParticleInVortex(runtime: RockRuntime, sprite: RockSprite): void {
  if (runtime.battleAnimArgs[6] === 0) {
    initSpritePosToAnimAttacker(runtime, sprite, false);
  } else {
    initSpritePosToAnimTarget(runtime, sprite, false);
  }
  sprite.data[0] = runtime.battleAnimArgs[3];
  sprite.data[1] = runtime.battleAnimArgs[2];
  sprite.data[2] = runtime.battleAnimArgs[4];
  sprite.data[3] = runtime.battleAnimArgs[5];
  sprite.callback = 'AnimParticleInVortex_Step';
}

export function AnimParticleInVortex_Step(sprite: RockSprite): void {
  sprite.data[4] += sprite.data[1];
  sprite.y2 = -(sprite.data[4] >> 8);
  sprite.x2 = sin(sprite.data[5], sprite.data[3]);
  sprite.data[5] = (sprite.data[5] + sprite.data[2]) & 0xff;
  if (--sprite.data[0] === -1) {
    destroyAnimSprite(sprite);
  }
}

export function AnimTask_LoadSandstormBackground(runtime: RockRuntime, taskId: number): void {
  let var0 = 0;
  setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0x3f42);
  setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', blendAlpha(0, 16));
  setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 1);
  setAnimBgAttribute(runtime, 1, 'BG_ANIM_SCREEN_SIZE', 0);
  if (!runtime.contest) {
    setAnimBgAttribute(runtime, 1, 'BG_ANIM_CHAR_BASE_BLOCK', 1);
  }
  runtime.battleBg1X = 0;
  runtime.battleBg1Y = 0;
  setGpuReg(runtime, 'REG_OFFSET_BG1HOFS', runtime.battleBg1X);
  setGpuReg(runtime, 'REG_OFFSET_BG1VOFS', runtime.battleBg1Y);
  runtime.operations.push(`AnimLoadCompressedBgTilemap:${runtime.bg1Data.bgId}`);
  runtime.operations.push(`AnimLoadCompressedBgGfx:${runtime.bg1Data.bgId}:${runtime.bg1Data.tilesOffset}`);
  runtime.operations.push(`LoadCompressedPalette:${runtime.bg1Data.paletteId}`);
  if (runtime.contest) {
    runtime.operations.push(`RelocateBattleBgPal:${runtime.bg1Data.paletteId}`);
  }
  if (runtime.battleAnimArgs[0] && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    var0 = 1;
  }
  runtime.tasks[taskId]!.data[0] = var0;
  runtime.tasks[taskId]!.func = 'AnimTask_LoadSandstormBackground_Step';
}

export function AnimTask_LoadSandstormBackground_Step(runtime: RockRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  runtime.battleBg1X += task.data[0] === 0 ? -6 : 6;
  runtime.battleBg1Y += -1;
  switch (task.data[12]) {
    case 0:
      if (++task.data[10] === 4) {
        task.data[10] = 0;
        ++task.data[11];
        setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', blendAlpha(task.data[11], 16 - task.data[11]));
        if (task.data[11] === 7) {
          ++task.data[12];
          task.data[11] = 0;
        }
      }
      break;
    case 1:
      if (++task.data[11] === 101) {
        task.data[11] = 7;
        ++task.data[12];
      }
      break;
    case 2:
      if (++task.data[10] === 4) {
        task.data[10] = 0;
        --task.data[11];
        setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', blendAlpha(task.data[11], 16 - task.data[11]));
        if (task.data[11] === 0) {
          ++task.data[12];
          task.data[11] = 0;
        }
      }
      break;
    case 3:
      runtime.operations.push(`InitBattleAnimBg:${runtime.bg1Data.bgId}`);
      ++task.data[12];
      break;
    case 4:
      if (!runtime.contest) {
        setAnimBgAttribute(runtime, 1, 'BG_ANIM_CHAR_BASE_BLOCK', 0);
      }
      runtime.battleBg1X = 0;
      runtime.battleBg1Y = 0;
      setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0);
      setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', 0);
      setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 1);
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimFlyingSandCrescent(runtime: RockRuntime, sprite: RockSprite): void {
  if (sprite.data[0] === 0) {
    if (runtime.battleAnimArgs[3] !== 0 && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
      sprite.x = 304;
      runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
      sprite.data[5] = 1;
      sprite.oam.matrixNum = 1;
    } else {
      sprite.x = -64;
    }
    sprite.y = runtime.battleAnimArgs[0];
    sprite.subspriteTableSet = true;
    sprite.data[1] = runtime.battleAnimArgs[1];
    sprite.data[2] = runtime.battleAnimArgs[2];
    ++sprite.data[0];
  } else {
    sprite.data[3] += sprite.data[1];
    sprite.data[4] += sprite.data[2];
    sprite.x2 += sprite.data[3] >> 8;
    sprite.y2 += sprite.data[4] >> 8;
    sprite.data[3] &= 0xff;
    sprite.data[4] &= 0xff;
    if (sprite.data[5] === 0) {
      if (sprite.x + sprite.x2 > DISPLAY_WIDTH + 32) {
        sprite.callback = 'DestroyAnimSprite';
      }
    } else if (sprite.x + sprite.x2 < -32) {
      sprite.callback = 'DestroyAnimSprite';
    }
  }
}

export function AnimRaiseSprite(runtime: RockRuntime, sprite: RockSprite): void {
  startSpriteAnim(sprite, runtime.battleAnimArgs[4]);
  initSpritePosToAnimAttacker(runtime, sprite, false);
  sprite.data[0] = runtime.battleAnimArgs[3];
  sprite.data[2] = sprite.x;
  sprite.data[4] = sprite.y + runtime.battleAnimArgs[2];
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimTask_Rollout(runtime: RockRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const var0 = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  const var1 = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'y') + 24;
  const var2 = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  let var3 = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'y') + 24;
  if (battlePartner(runtime.battleAnimAttacker) === runtime.battleAnimTarget) {
    var3 = var1;
  }
  const rolloutCounter = GetRolloutCounter(runtime);
  task.data[8] = rolloutCounter === 1 ? 32 : 48 - rolloutCounter * 8;
  task.data[0] = 0;
  task.data[11] = 0;
  task.data[9] = 0;
  task.data[12] = 1;
  let var5 = task.data[8];
  if (var5 < 0) {
    var5 += 7;
  }
  task.data[10] = (var5 >> 3) - 1;
  task.data[2] = var0 * 8;
  task.data[3] = var1 * 8;
  task.data[4] = Math.trunc(((var2 - var0) * 8) / task.data[8]);
  task.data[5] = Math.trunc(((var3 - var1) * 8) / task.data[8]);
  task.data[6] = 0;
  task.data[7] = 0;
  const pan1 = battleAnimAdjustPanning(SOUND_PAN_ATTACKER);
  const pan2 = battleAnimAdjustPanning(SOUND_PAN_TARGET);
  task.data[13] = pan1;
  task.data[14] = Math.trunc((pan2 - pan1) / task.data[8]);
  task.data[1] = rolloutCounter;
  task.data[15] = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
  task.func = 'AnimTask_Rollout_Step';
}

export function AnimTask_Rollout_Step(runtime: RockRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      task.data[6] -= task.data[4];
      task.data[7] -= task.data[5];
      runtime.sprites[task.data[15]].x2 = task.data[6] >> 3;
      runtime.sprites[task.data[15]].y2 = task.data[7] >> 3;
      if (++task.data[9] === 10) {
        task.data[11] = 20;
        ++task.data[0];
      }
      playSe12WithPanning(runtime, SE_M_HEADBUTT, task.data[13]);
      break;
    case 1:
      if (--task.data[11] === 0) {
        ++task.data[0];
      }
      break;
    case 2:
      if (--task.data[9] !== 0) {
        task.data[6] += task.data[4];
        task.data[7] += task.data[5];
      } else {
        task.data[6] = 0;
        task.data[7] = 0;
        ++task.data[0];
      }
      runtime.sprites[task.data[15]].x2 = task.data[6] >> 3;
      runtime.sprites[task.data[15]].y2 = task.data[7] >> 3;
      break;
    case 3:
      task.data[2] += task.data[4];
      task.data[3] += task.data[5];
      if (++task.data[9] >= task.data[10]) {
        task.data[9] = 0;
        CreateRolloutDirtSprite(runtime, task);
        task.data[13] += task.data[14];
        playSe12WithPanning(runtime, SE_M_DIG, task.data[13]);
      }
      if (--task.data[8] === 0) {
        ++task.data[0];
      }
      break;
    case 4:
      if (task.data[11] === 0) {
        destroyAnimVisualTask(runtime, taskId);
      }
      break;
  }
}

export function CreateRolloutDirtSprite(runtime: RockRuntime, task: RockTask): number {
  let templateName: string;
  let tileOffset: number;
  switch (task.data[1]) {
    case 1:
      templateName = 'gRolloutMudSpriteTemplate';
      tileOffset = 0;
      break;
    case 2:
    case 3:
      templateName = 'gRolloutRockSpriteTemplate';
      tileOffset = 80;
      break;
    case 4:
      templateName = 'gRolloutRockSpriteTemplate';
      tileOffset = 64;
      break;
    case 5:
      templateName = 'gRolloutRockSpriteTemplate';
      tileOffset = 48;
      break;
    default:
      return MAX_SPRITES;
  }
  let x = task.data[2] >> 3;
  const y = task.data[3] >> 3;
  x += task.data[12] * 4;
  const spriteId = createSprite(runtime, templateName, x, y, 35);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.sprites[spriteId];
    sprite.data[0] = 18;
    sprite.data[2] = task.data[12] * 20 + x + task.data[1] * 3;
    sprite.data[4] = y;
    sprite.data[5] = -16 - task.data[1] * 2;
    sprite.oam.tileNum += tileOffset;
    initAnimArcTranslation(sprite);
    ++task.data[11];
  }
  task.data[12] *= -1;
  return spriteId;
}

export function AnimRolloutParticle(runtime: RockRuntime, sprite: RockSprite): void {
  if (translateAnimHorizontalArc(sprite)) {
    const taskId = findTaskIdByFunc(runtime, 'AnimTask_Rollout_Step');
    if (taskId !== TASK_NONE) {
      --runtime.tasks[taskId]!.data[11];
    }
    destroySprite(sprite);
  }
}

export function GetRolloutCounter(runtime: RockRuntime): number {
  let retVal = runtime.rolloutTimerStartValue - runtime.rolloutTimer;
  const var0 = retVal - 1;
  if (var0 > 4) {
    retVal = 1;
  }
  return retVal;
}

export function AnimRockTomb(runtime: RockRuntime, sprite: RockSprite): void {
  startSpriteAnim(sprite, runtime.battleAnimArgs[4]);
  sprite.x2 = runtime.battleAnimArgs[0];
  sprite.data[2] = runtime.battleAnimArgs[1];
  sprite.data[3] -= runtime.battleAnimArgs[2];
  sprite.data[0] = 3;
  sprite.data[1] = runtime.battleAnimArgs[3];
  sprite.callback = 'AnimRockTomb_Step';
  sprite.invisible = true;
}

export function AnimRockTomb_Step(sprite: RockSprite): void {
  sprite.invisible = false;
  if (sprite.data[3] !== 0) {
    sprite.y2 = sprite.data[2] + sprite.data[3];
    sprite.data[3] += sprite.data[0];
    ++sprite.data[0];
    if (sprite.data[3] > 0) {
      sprite.data[3] = 0;
    }
  } else if (--sprite.data[1] === 0) {
    destroyAnimSprite(sprite);
  }
}

export function AnimRockBlastRock(runtime: RockRuntime, sprite: RockSprite): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_OPPONENT) {
    startSpriteAffineAnim(sprite, 1);
  }
  translateAnimSpriteToTargetMonLocation(runtime, sprite);
}

export function AnimRockScatter(runtime: RockRuntime, sprite: RockSprite): void {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'y');
  sprite.x += runtime.battleAnimArgs[0];
  sprite.y += runtime.battleAnimArgs[1];
  sprite.data[1] = runtime.battleAnimArgs[0];
  sprite.data[2] = runtime.battleAnimArgs[1];
  sprite.data[5] = runtime.battleAnimArgs[2];
  startSpriteAnim(sprite, runtime.battleAnimArgs[3]);
  sprite.callback = 'AnimRockScatter_Step';
}

export function AnimRockScatter_Step(sprite: RockSprite): void {
  sprite.data[0] += 8;
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  sprite.x2 += Math.trunc(sprite.data[3] / 40);
  sprite.y2 -= sin(sprite.data[0], sprite.data[5]);
  if (sprite.data[0] > 140) {
    destroyAnimSprite(sprite);
  }
}

export function AnimTask_GetSeismicTossDamageLevel(runtime: RockRuntime, taskId: number): void {
  if (runtime.animMoveDmg < 33) {
    runtime.battleAnimArgs[ARG_RET_ID] = 0;
  }
  if ((runtime.animMoveDmg >>> 0) - 33 < 33) {
    runtime.battleAnimArgs[ARG_RET_ID] = 1;
  }
  if (runtime.animMoveDmg > 65) {
    runtime.battleAnimArgs[ARG_RET_ID] = 2;
  }
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_MoveSeismicTossBg(runtime: RockRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[0] === 0) {
    toggleBg3Mode(runtime, 0);
    task.data[1] = 200;
  }
  runtime.battleBg3Y += Math.trunc(task.data[1] / 10);
  task.data[1] -= 3;
  if (task.data[0] === 120) {
    toggleBg3Mode(runtime, 1);
    destroyAnimVisualTask(runtime, taskId);
  }
  ++task.data[0];
}

export function AnimTask_SeismicTossBgAccelerateDownAtEnd(runtime: RockRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[0] === 0) {
    toggleBg3Mode(runtime, 0);
    ++task.data[0];
    task.data[2] = runtime.battleBg3Y;
  }
  task.data[1] += 80;
  task.data[1] &= 0xff;
  runtime.battleBg3Y = task.data[2] + cos(4, task.data[1]);
  if (runtime.battleAnimArgs[7] === 0xfff) {
    runtime.battleBg3Y = 0;
    toggleBg3Mode(runtime, 1);
    destroyAnimVisualTask(runtime, taskId);
  }
}

export function createRockTask(runtime: RockRuntime, func: RockTaskFunc, priority = 0): number {
  const task = { func, data: Array.from({ length: 16 }, () => 0), priority, destroyed: false };
  const slot = runtime.tasks.findIndex((candidate) => candidate === null);
  if (slot >= 0) {
    runtime.tasks[slot] = task;
    return slot;
  }
  runtime.tasks.push(task);
  return runtime.tasks.length - 1;
}

const setAverageBattlerPositions = (runtime: RockRuntime, battler: number, sprite: RockSprite): void => {
  sprite.x = runtime.battlerCoords[battler]?.averageX ?? 0;
  sprite.y = runtime.battlerCoords[battler]?.averageY ?? 0;
};

const getBattlerSide = (runtime: RockRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const getBattlerSpriteCoord = (runtime: RockRuntime, battler: number, coord: keyof RockRuntime['battlerCoords'][number]): number =>
  runtime.battlerCoords[battler]?.[coord] ?? 0;

const startSpriteAnim = (sprite: RockSprite, animIndex: number): void => {
  sprite.animIndex = animIndex;
};
const startSpriteAffineAnim = (sprite: RockSprite, animIndex: number): void => {
  sprite.affineAnimIndex = animIndex;
};
const animateSprite = (_sprite: RockSprite): void => {};
const initAnimArcTranslation = (_sprite: RockSprite): void => {};
const initSpriteDataForLinearTranslation = (_sprite: RockSprite): void => {};
const translateSpriteInEllipse = (_sprite: RockSprite): void => {};

const initSpritePosToAnimAttacker = (runtime: RockRuntime, sprite: RockSprite, _respectSide: boolean): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset') + runtime.battleAnimArgs[1];
};
const initSpritePosToAnimTarget = (runtime: RockRuntime, sprite: RockSprite, _respectSide: boolean): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[1];
};

const storeSpriteCallbackInData6 = (sprite: RockSprite, callback: RockCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const destroyAnimSprite = (sprite: RockSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const destroySprite = destroyAnimSprite;
const translateAnimHorizontalArc = (sprite: RockSprite): boolean => {
  if (sprite.data[0] > 0) sprite.data[0]--;
  return sprite.data[0] === 0;
};
const setGpuReg = (runtime: RockRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value & 0xffff;
};
const blendAlpha = (eva: number, evb: number): number => (eva & 0x1f) | ((evb & 0x1f) << 8);
const setAnimBgAttribute = (runtime: RockRuntime, bg: number, attr: string, value: number): void => {
  runtime.bgAttrs[`${bg}:${attr}`] = value;
};
const battlePartner = (battler: number): number => battler ^ BIT_FLANK;
const battleAnimAdjustPanning = (pan: number): number => pan;
const getAnimBattlerSpriteId = (runtime: RockRuntime, animBattler: number): number =>
  runtime.battlerSpriteIds[animBattler === ANIM_ATTACKER ? runtime.battleAnimAttacker : runtime.battleAnimTarget] ?? MAX_SPRITES;
const playSe12WithPanning = (runtime: RockRuntime, song: string, pan: number): void => {
  runtime.panningLog.push({ song, pan });
};
const createSprite = (runtime: RockRuntime, templateName: string, x: number, y: number, subpriority: number): number => {
  const spriteId = runtime.sprites.findIndex((sprite, index) => index >= 4 && sprite.templateName === null && !sprite.destroyed);
  if (spriteId < 0) return MAX_SPRITES;
  runtime.sprites[spriteId] = createRockSprite();
  runtime.sprites[spriteId].x = x;
  runtime.sprites[spriteId].y = y;
  runtime.sprites[spriteId].subpriority = subpriority;
  runtime.sprites[spriteId].templateName = templateName;
  runtime.createdSprites.push(spriteId);
  return spriteId;
};
const findTaskIdByFunc = (runtime: RockRuntime, func: RockTaskFunc): number => {
  const taskId = runtime.tasks.findIndex((task) => task !== null && task.func === func);
  return taskId < 0 ? TASK_NONE : taskId;
};
const translateAnimSpriteToTargetMonLocation = (runtime: RockRuntime, sprite: RockSprite): void => {
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
};
const toggleBg3Mode = (runtime: RockRuntime, mode: number): void => {
  runtime.bg3Mode = mode;
};
const destroyAnimVisualTask = (runtime: RockRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};

export const animFallingRock = AnimFallingRock;
export const animFallingRockStep = AnimFallingRock_Step;
export const animRockFragment = AnimRockFragment;
export const animParticleInVortex = AnimParticleInVortex;
export const animParticleInVortexStep = AnimParticleInVortex_Step;
export const animTaskLoadSandstormBackground = AnimTask_LoadSandstormBackground;
export const animTaskLoadSandstormBackgroundStep =
  AnimTask_LoadSandstormBackground_Step;
export const animFlyingSandCrescent = AnimFlyingSandCrescent;
export const animRaiseSprite = AnimRaiseSprite;
export const animTaskRollout = AnimTask_Rollout;
export const animTaskRolloutStep = AnimTask_Rollout_Step;
export const createRolloutDirtSprite = CreateRolloutDirtSprite;
export const animRolloutParticle = AnimRolloutParticle;
export const getRolloutCounter = GetRolloutCounter;
export const animRockTomb = AnimRockTomb;
export const animRockTombStep = AnimRockTomb_Step;
export const animRockBlastRock = AnimRockBlastRock;
export const animRockScatter = AnimRockScatter;
export const animRockScatterStep = AnimRockScatter_Step;
export const animTaskGetSeismicTossDamageLevel =
  AnimTask_GetSeismicTossDamageLevel;
export const animTaskMoveSeismicTossBg = AnimTask_MoveSeismicTossBg;
export const animTaskSeismicTossBgAccelerateDownAtEnd =
  AnimTask_SeismicTossBgAccelerateDownAtEnd;
