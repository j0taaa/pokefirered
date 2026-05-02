import { cos, sin } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const ANIM_DEF_PARTNER = 3;
export const BIT_FLANK = 2;
export const MAX_SPRITES = 64;
export const DISPLAY_WIDTH = 240;
export const ST_OAM_OBJ_NORMAL = 0;
export const SE_M_FLAME_WHEEL = 'SE_M_FLAME_WHEEL';

export type FireCallback =
  | 'AnimFireSpiralInward'
  | 'AnimFireSpread'
  | 'AnimLargeFlame'
  | 'AnimLargeFlame_Step'
  | 'AnimFirePlume'
  | 'AnimUnusedSmallEmber'
  | 'AnimUnusedSmallEmber_Step'
  | 'AnimSunlight'
  | 'TranslateAnimSpriteToTargetMonLocation'
  | 'AnimEmberFlare'
  | 'AnimBurnFlame'
  | 'AnimFireRing'
  | 'AnimFireRing_Step1'
  | 'AnimFireRing_Step2'
  | 'AnimFireRing_Step3'
  | 'AnimFireCross'
  | 'AnimFireSpiralOutward'
  | 'AnimFireSpiralOutward_Step1'
  | 'AnimFireSpiralOutward_Step2'
  | 'AnimWeatherBallDown'
  | 'AnimEruptionLaunchRock'
  | 'AnimEruptionFallingRock'
  | 'AnimEruptionFallingRock_Step'
  | 'AnimWillOWispOrb'
  | 'AnimWillOWispOrb_Step'
  | 'AnimWillOWispFire'
  | 'TranslateSpriteInGrowingCircle'
  | 'TranslateSpriteLinearFixedPoint'
  | 'TranslateSpriteLinear'
  | 'StartAnimLinearTranslation'
  | 'AnimTravelDiagonally'
  | 'WaitAnimForDuration'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix'
  | 'SpriteCallbackDummy';

export type FireTaskFunc =
  | 'AnimTask_EruptionLaunchRocks_Step'
  | 'AnimTask_MoveHeatWaveTargets_Step'
  | 'DestroyAnimVisualTask';

export interface FireSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: FireCallback;
}

export interface FireSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  centerToCornerVecY: number;
  subpriority: number;
  invisible: boolean;
  destroyed: boolean;
  callback: FireCallback;
  storedCallback: FireCallback | null;
  animIndex: number;
  oam: { priority: number; tileNum: number };
  data: number[];
  squash: { framesLeft: number } | null;
}

export interface FireTask {
  data: number[];
  func: FireTaskFunc;
  destroyed: boolean;
  squash: { framesLeft: number } | null;
}

export interface FireRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  contest: boolean;
  battlerSides: Record<number, number>;
  battlerAtPosition: Record<number, number>;
  battlerVisible: Record<number, boolean>;
  battlerSpriteIds: Record<number, number>;
  battlerBgPriorities: Record<number, number>;
  battlerCoords: Record<number, { x: number; y: number; x2: number; yPicOffset: number }>;
  sprites: FireSprite[];
  tasks: Array<FireTask | null>;
  blends: Array<{ offset: number; size: number; coeff: number; color: number }>;
  sounds: Array<{ song: string; pan: number }>;
  operations: string[];
  animCustomPanning: number;
}

const frame = (tileOffset: number, duration: number, flags: Record<string, boolean> = {}) => ({ tileOffset, duration, ...flags });
const affineFrame = (xScale: number, yScale: number, rotation: number, duration: number) => ({ xScale, yScale, rotation, duration });

export const sAnimFireSpiralSpread0 = [frame(16, 4), frame(32, 4), frame(48, 4), { jump: 0 }] as const;
export const sAnimFireSpiralSpread1 = [frame(16, 4, { vFlip: true, hFlip: true }), frame(32, 4, { vFlip: true, hFlip: true }), frame(48, 4, { vFlip: true, hFlip: true }), { jump: 0 }] as const;
export const sAnimsFireSpiralSpread = [sAnimFireSpiralSpread0, sAnimFireSpiralSpread1] as const;
export const sAnimLargeFlame = [...[0, 16, 32, 48, 64, 80, 96, 112].map((tile) => frame(tile, 3)), { jump: 0 }] as const;
export const sAnimsLargeFlame = [sAnimLargeFlame] as const;
export const sAnimFirePlume = [...[0, 16, 32, 48, 64].map((tile) => frame(tile, 5)), { jump: 0 }] as const;
export const sAnimsFirePlume = [sAnimFirePlume] as const;
export const sAffineAnimLargeFlame = [affineFrame(0x32, 0x100, 0, 0), affineFrame(0x20, 0, 0, 7), { end: true }] as const;
export const sAffineAnimsLargeFlame = [sAffineAnimLargeFlame] as const;
export const sAnimUnusedSmallEmber = [frame(16, 6), frame(32, 6), frame(48, 6), { jump: 0 }] as const;
export const sAnimsUnusedSmallEmber = [sAnimUnusedSmallEmber] as const;
export const sAffineAnimSunlightRay = [affineFrame(0x50, 0x50, 0, 0), affineFrame(0x2, 0x2, 10, 1), { jump: 1 }] as const;
export const sAffineAnimsSunlightRay = [sAffineAnimSunlightRay] as const;
export const sAnimBasicFire = [...[0, 16, 32, 48, 64].map((tile) => frame(tile, 4)), { jump: 0 }] as const;
export const gAnimsBasicFire = [sAnimBasicFire] as const;
export const sAnimFireBlastCross = [frame(32, 6), frame(48, 6), { jump: 0 }] as const;
export const sAnimsFireBlastCross = [sAnimFireBlastCross] as const;
export const sAffineAnimsUnused = [[affineFrame(0, 0, 0, 1), { end: true }], [affineFrame(0xa0, 0xa0, 0, 0), { end: true }]] as const;
export const sEruptionLaunchRockSpeeds = [[-2, -5], [-1, -1], [3, -6], [4, -2], [2, -8], [-5, -5], [4, -7]] as const;
export const sAnimsWillOWispOrb = [
  [frame(0, 5), frame(4, 5), frame(8, 5), frame(12, 5), { jump: 0 }],
  [frame(16, 5), { end: true }],
  [frame(20, 5), { end: true }],
  [frame(20, 5), { end: true }]
] as const;
export const sAnimsWillOWispFire = [[frame(0, 5), frame(16, 5), frame(32, 5), frame(48, 5), { jump: 0 }]] as const;
export const sShakeDirsPattern0 = [-1, -1, 0, 1, 1, 0, 0, -1, -1, 1, 1, 0, 0, -1, 0, 1] as const;
export const sShakeDirsPattern1 = [-1, 0, 1, 0, -1, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, 1] as const;

const template = (tileTag: string, oam: string, anims: readonly unknown[] | string, affineAnims: readonly unknown[] | string, callback: FireCallback): FireSpriteTemplate => ({
  tileTag,
  paletteTag: tileTag,
  oam,
  anims,
  images: null,
  affineAnims,
  callback
});

export const gFireSpiralInwardSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsFireSpiralSpread, 'gDummySpriteAffineAnimTable', 'AnimFireSpiralInward');
export const gFireSpreadSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsFireSpiralSpread, 'gDummySpriteAffineAnimTable', 'AnimFireSpread');
export const gLargeFlameSpriteTemplate = template('ANIM_TAG_FIRE', 'gOamData_AffineNormal_ObjNormal_32x32', sAnimsLargeFlame, sAffineAnimsLargeFlame, 'AnimLargeFlame');
export const gLargeFlameScatterSpriteTemplate = template('ANIM_TAG_FIRE', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsLargeFlame, 'gDummySpriteAffineAnimTable', 'AnimLargeFlame');
export const gFirePlumeSpriteTemplate = template('ANIM_TAG_FIRE_PLUME', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsFirePlume, 'gDummySpriteAffineAnimTable', 'AnimFirePlume');
export const sUnusedEmberFirePlumeSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsFirePlume, 'gDummySpriteAffineAnimTable', 'AnimFirePlume');
export const sUnusedSmallEmberSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsUnusedSmallEmber, 'gDummySpriteAffineAnimTable', 'AnimUnusedSmallEmber');
export const gSunlightRaySpriteTemplate = template('ANIM_TAG_SUNLIGHT', 'gOamData_AffineNormal_ObjBlend_32x32', 'gDummySpriteAnimTable', sAffineAnimsSunlightRay, 'AnimSunlight');
export const gEmberSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'TranslateAnimSpriteToTargetMonLocation');
export const gEmberFlareSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', gAnimsBasicFire, 'gDummySpriteAffineAnimTable', 'AnimEmberFlare');
export const gBurnFlameSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', gAnimsBasicFire, 'gDummySpriteAffineAnimTable', 'AnimBurnFlame');
export const gFireBlastRingSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', gAnimsBasicFire, 'gDummySpriteAffineAnimTable', 'AnimFireRing');
export const gFireBlastCrossSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsFireBlastCross, 'gDummySpriteAffineAnimTable', 'AnimFireCross');
export const gFireSpiralOutwardSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', gAnimsBasicFire, 'gDummySpriteAffineAnimTable', 'AnimFireSpiralOutward');
export const gWeatherBallFireDownSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', gAnimsBasicFire, 'gDummySpriteAffineAnimTable', 'AnimWeatherBallDown');
export const gEruptionLaunchRockSpriteTemplate = template('ANIM_TAG_WARM_ROCK', 'gOamData_AffineOff_ObjNormal_16x16', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimEruptionLaunchRock');
export const gEruptionFallingRockSpriteTemplate = template('ANIM_TAG_WARM_ROCK', 'gOamData_AffineOff_ObjNormal_32x32', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimEruptionFallingRock');
export const gWillOWispOrbSpriteTemplate = template('ANIM_TAG_WISP_ORB', 'gOamData_AffineOff_ObjNormal_16x16', sAnimsWillOWispOrb, 'gDummySpriteAffineAnimTable', 'AnimWillOWispOrb');
export const gWillOWispFireSpriteTemplate = template('ANIM_TAG_WISP_FIRE', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsWillOWispFire, 'gDummySpriteAffineAnimTable', 'AnimWillOWispFire');

export const createFireSprite = (): FireSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  centerToCornerVecY: 0,
  subpriority: 0,
  invisible: false,
  destroyed: false,
  callback: 'SpriteCallbackDummy',
  storedCallback: null,
  animIndex: 0,
  oam: { priority: 0, tileNum: 0 },
  data: Array.from({ length: 16 }, () => 0),
  squash: null
});

export const createFireRuntime = (overrides: Partial<FireRuntime> = {}): FireRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  contest: overrides.contest ?? false,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerAtPosition: overrides.battlerAtPosition ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerVisible: overrides.battlerVisible ?? { 0: true, 1: true, 2: true, 3: true },
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerBgPriorities: overrides.battlerBgPriorities ?? { 0: 1, 1: 2, 2: 1, 3: 2 },
  battlerCoords: overrides.battlerCoords ?? {
    0: { x: 48, y: 72, x2: 48, yPicOffset: 64 },
    1: { x: 176, y: 48, x2: 176, yPicOffset: 48 },
    2: { x: 80, y: 80, x2: 80, yPicOffset: 72 },
    3: { x: 144, y: 40, x2: 144, yPicOffset: 40 }
  },
  sprites: overrides.sprites ?? Array.from({ length: MAX_SPRITES }, () => createFireSprite()),
  tasks: overrides.tasks ?? [],
  blends: overrides.blends ?? [],
  sounds: overrides.sounds ?? [],
  operations: overrides.operations ?? [],
  animCustomPanning: overrides.animCustomPanning ?? 0
});

export const createFireTask = (runtime: FireRuntime, func: FireTaskFunc = 'DestroyAnimVisualTask'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), func, destroyed: false, squash: null });
  return id;
};

export function AnimFireSpiralInward(_runtime: FireRuntime, sprite: FireSprite): void {
  sprite.data[0] = _runtime.battleAnimArgs[0];
  sprite.data[1] = 0x3c;
  sprite.data[2] = 0x9;
  sprite.data[3] = 0x1e;
  sprite.data[4] = -0x200;
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  sprite.callback = 'TranslateSpriteInGrowingCircle';
}

export function AnimFireSpread(runtime: FireRuntime, sprite: FireSprite): void {
  setAnimSpriteInitialXOffset(runtime, sprite, runtime.battleAnimArgs[0]);
  sprite.y += runtime.battleAnimArgs[1];
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[1] = runtime.battleAnimArgs[2];
  sprite.data[2] = runtime.battleAnimArgs[3];
  sprite.callback = 'TranslateSpriteLinearFixedPoint';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimFirePlume(runtime: FireRuntime, sprite: FireSprite): void {
  setSpriteCoordsToAnimAttackerCoords(runtime, sprite);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.x -= runtime.battleAnimArgs[0];
    sprite.y += runtime.battleAnimArgs[1];
    sprite.data[2] = -runtime.battleAnimArgs[4];
  } else {
    sprite.x += runtime.battleAnimArgs[0];
    sprite.y += runtime.battleAnimArgs[1];
    sprite.data[2] = runtime.battleAnimArgs[4];
  }
  sprite.data[1] = runtime.battleAnimArgs[2];
  sprite.data[4] = runtime.battleAnimArgs[3];
  sprite.data[3] = runtime.battleAnimArgs[5];
  sprite.callback = 'AnimLargeFlame_Step';
}

export function AnimLargeFlame(runtime: FireRuntime, sprite: FireSprite): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.x -= runtime.battleAnimArgs[0];
    sprite.y += runtime.battleAnimArgs[1];
    sprite.data[2] = runtime.battleAnimArgs[4];
  } else {
    sprite.x += runtime.battleAnimArgs[0];
    sprite.y += runtime.battleAnimArgs[1];
    sprite.data[2] = -runtime.battleAnimArgs[4];
  }
  sprite.data[1] = runtime.battleAnimArgs[2];
  sprite.data[4] = runtime.battleAnimArgs[3];
  sprite.data[3] = runtime.battleAnimArgs[5];
  sprite.callback = 'AnimLargeFlame_Step';
}

export function AnimLargeFlame_Step(sprite: FireSprite): void {
  if (++sprite.data[0] < sprite.data[4]) {
    sprite.x2 += sprite.data[2];
    sprite.y2 += sprite.data[3];
  }
  if (sprite.data[0] === sprite.data[1]) destroySpriteAndMatrix(sprite);
}

export function AnimUnusedSmallEmber(runtime: FireRuntime, sprite: FireSprite): void {
  setSpriteCoordsToAnimAttackerCoords(runtime, sprite);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) sprite.x -= runtime.battleAnimArgs[0];
  else {
    sprite.x += runtime.battleAnimArgs[0];
    sprite.subpriority = 8;
  }
  sprite.y += runtime.battleAnimArgs[1];
  for (let i = 0; i <= 4; i++) sprite.data[i] = runtime.battleAnimArgs[i + 2];
  sprite.data[5] = 0;
  sprite.callback = 'AnimUnusedSmallEmber_Step';
}

export function AnimUnusedSmallEmber_Step(sprite: FireSprite): void {
  if (sprite.data[3]) {
    if (sprite.data[5] > 10000) sprite.subpriority = 1;
    sprite.x2 = sin(sprite.data[0], sprite.data[1] + (sprite.data[5] >> 8));
    sprite.y2 = cos(sprite.data[0], sprite.data[1] + (sprite.data[5] >> 8));
    sprite.data[0] += sprite.data[2];
    sprite.data[5] += sprite.data[4];
    if (sprite.data[0] > 255) sprite.data[0] -= 256;
    else if (sprite.data[0] < 0) sprite.data[0] += 256;
    --sprite.data[3];
  } else destroySpriteAndMatrix(sprite);
}

export function AnimSunlight(sprite: FireSprite): void {
  sprite.x = 0;
  sprite.y = 0;
  sprite.data[0] = 60;
  sprite.data[2] = 140;
  sprite.data[4] = 80;
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimEmberFlare(runtime: FireRuntime, sprite: FireSprite): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) === getBattlerSide(runtime, runtime.battleAnimTarget)
    && (runtime.battleAnimAttacker === getBattlerAtPosition(runtime, 2) || runtime.battleAnimAttacker === getBattlerAtPosition(runtime, 3))) {
    runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  }
  sprite.callback = 'AnimTravelDiagonally';
}

export function AnimBurnFlame(runtime: FireRuntime, sprite: FireSprite): void {
  runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
  runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  sprite.callback = 'AnimTravelDiagonally';
}

export function AnimFireRing(runtime: FireRuntime, sprite: FireSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[7] = runtime.battleAnimArgs[2];
  sprite.data[0] = 0;
  sprite.callback = 'AnimFireRing_Step1';
}

export function AnimFireRing_Step1(runtime: FireRuntime, sprite: FireSprite): void {
  UpdateFireRingCircleOffset(sprite);
  if (++sprite.data[0] === 0x12) {
    sprite.data[0] = 0x19;
    sprite.data[1] = sprite.x;
    sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
    sprite.data[3] = sprite.y;
    sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
    initAnimLinearTranslation(sprite);
    sprite.callback = 'AnimFireRing_Step2';
  }
}

export function AnimFireRing_Step2(runtime: FireRuntime, sprite: FireSprite): void {
  if (animTranslateLinear(sprite)) {
    sprite.data[0] = 0;
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
    sprite.x2 = sprite.y2 = 0;
    sprite.callback = 'AnimFireRing_Step3';
    AnimFireRing_Step3(sprite);
  } else {
    sprite.x2 += sin(sprite.data[7], 28);
    sprite.y2 += cos(sprite.data[7], 28);
    sprite.data[7] = (sprite.data[7] + 20) & 0xff;
  }
}

export function AnimFireRing_Step3(sprite: FireSprite): void {
  UpdateFireRingCircleOffset(sprite);
  if (++sprite.data[0] === 0x1f) destroyAnimSprite(sprite);
}

export function UpdateFireRingCircleOffset(sprite: FireSprite): void {
  sprite.x2 = sin(sprite.data[7], 28);
  sprite.y2 = cos(sprite.data[7], 28);
  sprite.data[7] = (sprite.data[7] + 20) & 0xff;
}

export function AnimFireCross(runtime: FireRuntime, sprite: FireSprite): void {
  sprite.x += runtime.battleAnimArgs[0];
  sprite.y += runtime.battleAnimArgs[1];
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[1] = runtime.battleAnimArgs[3];
  sprite.data[2] = runtime.battleAnimArgs[4];
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  sprite.callback = 'TranslateSpriteLinear';
}

export function AnimFireSpiralOutward(runtime: FireRuntime, sprite: FireSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[1] = runtime.battleAnimArgs[2];
  sprite.data[0] = runtime.battleAnimArgs[3];
  sprite.invisible = true;
  sprite.callback = 'WaitAnimForDuration';
  storeSpriteCallbackInData6(sprite, 'AnimFireSpiralOutward_Step1');
}

export function AnimFireSpiralOutward_Step1(sprite: FireSprite): void {
  sprite.invisible = false;
  sprite.data[0] = sprite.data[1];
  sprite.data[1] = 0;
  sprite.callback = 'AnimFireSpiralOutward_Step2';
  AnimFireSpiralOutward_Step2(sprite);
}

export function AnimFireSpiralOutward_Step2(sprite: FireSprite): void {
  sprite.x2 = sin(sprite.data[1], sprite.data[2] >> 8);
  sprite.y2 = cos(sprite.data[1], sprite.data[2] >> 8);
  sprite.data[1] = (sprite.data[1] + 10) & 0xff;
  sprite.data[2] += 0xd0;
  if (--sprite.data[0] === -1) destroyAnimSprite(sprite);
}

export function AnimTask_EruptionLaunchRocks(runtime: FireRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[15] = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
  task.data[0] = task.data[1] = task.data[2] = task.data[3] = 0;
  task.data[4] = runtime.sprites[task.data[15]].y;
  task.data[5] = getBattlerSide(runtime, runtime.battleAnimAttacker);
  task.data[6] = 0;
  prepareBattlerSpriteForRotScale(runtime, task.data[15], ST_OAM_OBJ_NORMAL);
  task.func = 'AnimTask_EruptionLaunchRocks_Step';
}

export function AnimTask_EruptionLaunchRocks_Step(runtime: FireRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const attacker = runtime.sprites[task.data[15]];
  switch (task.data[0]) {
    case 0:
      battleAnimHelperSetSpriteSquashParams(task, task.data[15], 0x100, 0x100, 0xe0, 0x200, 32);
      task.data[0]++;
    // fallthrough
    case 1:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        attacker.x2 = ++task.data[2] & 1 ? 3 : -3;
      }
      if (task.data[5] !== B_SIDE_PLAYER && ++task.data[3] > 4) {
        task.data[3] = 0;
        attacker.y++;
      }
      if (!battleAnimHelperRunSpriteSquash(task)) {
        setBattlerSpriteYOffsetFromYScale(runtime, task.data[15]);
        attacker.x2 = 0;
        task.data[1] = task.data[2] = task.data[3] = 0;
        task.data[0]++;
      }
      break;
    case 2:
      if (++task.data[1] > 4) {
        battleAnimHelperSetSpriteSquashParams(task, task.data[15], 0xe0, 0x200, 0x180, task.data[5] !== B_SIDE_PLAYER ? 0xf0 : 0xc0, 6);
        task.data[1] = 0;
        task.data[0]++;
      }
      break;
    case 3:
      if (!battleAnimHelperRunSpriteSquash(task)) {
        CreateEruptionLaunchRocks(runtime, task.data[15], taskId, 6);
        task.data[0]++;
      }
      break;
    case 4:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        if (++task.data[2] & 1) attacker.y2 += 3;
        else attacker.y2 -= 3;
      }
      if (++task.data[3] > 24) {
        battleAnimHelperSetSpriteSquashParams(task, task.data[15], 0x180, task.data[5] !== B_SIDE_PLAYER ? 0xf0 : 0xc0, 0x100, 0x100, 8);
        if (task.data[2] & 1) attacker.y2 -= 3;
        task.data[1] = task.data[2] = task.data[3] = 0;
        task.data[0]++;
      }
      break;
    case 5:
      if (task.data[5] !== B_SIDE_PLAYER) attacker.y--;
      if (!battleAnimHelperRunSpriteSquash(task)) {
        attacker.y = task.data[4];
        resetSpriteRotScale(runtime, task.data[15]);
        task.data[2] = 0;
        task.data[0]++;
      }
      break;
    case 6:
      if (task.data[6] === 0) destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function CreateEruptionLaunchRocks(runtime: FireRuntime, spriteId: number, taskId: number, activeSpritesIdx: number): void {
  let j = 0;
  let y = GetEruptionLaunchRockInitialYPos(runtime, spriteId);
  let x = runtime.sprites[spriteId].x;
  let sign: number;
  if (!getBattlerSide(runtime, runtime.battleAnimAttacker)) {
    x -= 12;
    sign = 1;
  } else {
    x += 16;
    sign = -1;
  }
  for (let i = 0; i <= 6; i++) {
    const newSpriteId = createSprite(runtime, gEruptionLaunchRockSpriteTemplate, x, y, 2);
    if (newSpriteId !== MAX_SPRITES) {
      const sprite = runtime.sprites[newSpriteId];
      sprite.oam.tileNum += j * 4 + 0x40;
      if (++j >= 5) j = 0;
      InitEruptionLaunchRockCoordData(sprite, sEruptionLaunchRockSpeeds[i][0] * sign, sEruptionLaunchRockSpeeds[i][1]);
      sprite.data[6] = taskId;
      sprite.data[7] = activeSpritesIdx;
      runtime.tasks[taskId]!.data[activeSpritesIdx]++;
    }
  }
  void y;
}

export function AnimEruptionLaunchRock(runtime: FireRuntime, sprite: FireSprite): void {
  UpdateEruptionLaunchRockPos(sprite);
  if (sprite.invisible) {
    runtime.tasks[sprite.data[6]]!.data[sprite.data[7]]--;
    destroySprite(sprite);
  }
}

export function GetEruptionLaunchRockInitialYPos(runtime: FireRuntime, spriteId: number): number {
  let y = runtime.sprites[spriteId].y + runtime.sprites[spriteId].y2 + runtime.sprites[spriteId].centerToCornerVecY;
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER) y += 74;
  else y += 44;
  return y;
}

export function InitEruptionLaunchRockCoordData(sprite: FireSprite, speedX: number, speedY: number): void {
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.data[2] = u16(sprite.x) * 8;
  sprite.data[3] = u16(sprite.y) * 8;
  sprite.data[4] = speedX * 8;
  sprite.data[5] = speedY * 8;
}

export function UpdateEruptionLaunchRockPos(sprite: FireSprite): void {
  if (++sprite.data[0] > 2) {
    sprite.data[0] = 0;
    ++sprite.data[1];
    const extraLaunchSpeed = u16(sprite.data[1]) * u16(sprite.data[1]);
    sprite.data[3] += extraLaunchSpeed;
  }
  sprite.data[2] += sprite.data[4];
  sprite.x = sprite.data[2] >> 3;
  sprite.data[3] += sprite.data[5];
  sprite.y = sprite.data[3] >> 3;
  if (sprite.x < -8 || sprite.x > DISPLAY_WIDTH + 8 || sprite.y < -8 || sprite.y > 120) sprite.invisible = true;
}

export function AnimEruptionFallingRock(runtime: FireRuntime, sprite: FireSprite): void {
  sprite.x = runtime.battleAnimArgs[0];
  sprite.y = runtime.battleAnimArgs[1];
  sprite.data[0] = 0;
  sprite.data[1] = 0;
  sprite.data[2] = 0;
  sprite.data[6] = runtime.battleAnimArgs[2];
  sprite.data[7] = runtime.battleAnimArgs[3];
  sprite.oam.tileNum += runtime.battleAnimArgs[4] * 16;
  sprite.callback = 'AnimEruptionFallingRock_Step';
}

export function AnimEruptionFallingRock_Step(sprite: FireSprite): void {
  switch (sprite.data[0]) {
    case 0:
      if (sprite.data[6] !== 0) {
        sprite.data[6]--;
        return;
      }
      sprite.data[0]++;
    // fallthrough
    case 1:
      sprite.y += 8;
      if (sprite.y >= sprite.data[7]) {
        sprite.y = sprite.data[7];
        sprite.data[0]++;
      }
      break;
    case 2:
      if (++sprite.data[1] > 1) {
        sprite.data[1] = 0;
        sprite.y2 = ++sprite.data[2] & 1 ? -3 : 3;
      }
      if (++sprite.data[3] > 16) destroyAnimSprite(sprite);
      break;
  }
}

export function AnimWillOWispOrb(runtime: FireRuntime, sprite: FireSprite): void {
  switch (sprite.data[0]) {
    case 0:
      initSpritePosToAnimAttacker(runtime, sprite);
      startSpriteAnim(sprite, runtime.battleAnimArgs[2]);
      sprite.data[7] = runtime.battleAnimArgs[2];
      sprite.data[4] = getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER ? 4 : -4;
      sprite.oam.priority = getBattlerSpriteBgPriority(runtime, runtime.battleAnimTarget);
      ++sprite.data[0];
      break;
    case 1:
      sprite.data[1] += 192;
      sprite.y2 = getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER ? -(sprite.data[1] >> 8) : sprite.data[1] >> 8;
      sprite.x2 = sin(sprite.data[2], sprite.data[4]);
      sprite.data[2] = (sprite.data[2] + 4) & 0xff;
      if (++sprite.data[3] === 1) {
        sprite.data[3] = 0;
        ++sprite.data[0];
      }
      break;
    case 2:
      sprite.x2 = sin(sprite.data[2], sprite.data[4]);
      sprite.data[2] = (sprite.data[2] + 4) & 0xff;
      if (++sprite.data[3] === 31) {
        sprite.x += sprite.x2;
        sprite.y += sprite.y2;
        sprite.x2 = sprite.y2 = 0;
        sprite.data[0] = 256;
        sprite.data[1] = sprite.x;
        sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
        sprite.data[3] = sprite.y;
        sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
        initAnimLinearTranslationWithSpeed(sprite);
        sprite.callback = 'AnimWillOWispOrb_Step';
      }
      break;
  }
}

export function AnimWillOWispOrb_Step(runtime: FireRuntime, sprite: FireSprite): void {
  if (!animTranslateLinear(sprite)) {
    sprite.x2 += sin(sprite.data[5], 16);
    const initialData5 = sprite.data[5];
    sprite.data[5] = (sprite.data[5] + 4) & 0xff;
    const newData5 = sprite.data[5];
    if ((initialData5 === 0 || initialData5 > 196) && newData5 > 0 && sprite.data[7] === 0) {
      playSe12WithPanning(runtime, SE_M_FLAME_WHEEL, runtime.animCustomPanning);
    }
  } else destroyAnimSprite(sprite);
}

export function AnimWillOWispFire(runtime: FireRuntime, sprite: FireSprite): void {
  if (!sprite.data[0]) {
    sprite.data[1] = runtime.battleAnimArgs[0];
    ++sprite.data[0];
  }
  sprite.data[3] += 0xc0 * 2;
  sprite.data[4] += 0xa0;
  sprite.x2 = sin(sprite.data[1], sprite.data[3] >> 8);
  sprite.y2 = cos(sprite.data[1], sprite.data[4] >> 8);
  sprite.data[1] = (sprite.data[1] + 7) & 0xff;
  if (!runtime.contest) {
    sprite.oam.priority = sprite.data[1] < 64 || sprite.data[1] > 195 ? getBattlerSpriteBgPriority(runtime, runtime.battleAnimTarget) : getBattlerSpriteBgPriority(runtime, runtime.battleAnimTarget) + 1;
  } else {
    sprite.subpriority = sprite.data[1] < 64 || sprite.data[1] > 195 ? 0x1d : 0x1f;
  }
  if (++sprite.data[2] > 0x14) sprite.invisible = !sprite.invisible;
  if (sprite.data[2] === 0x1e) destroyAnimSprite(sprite);
}

export function AnimTask_MoveHeatWaveTargets(runtime: FireRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[12] = getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER ? 1 : -1;
  task.data[13] = Number(isBattlerSpriteVisible(runtime, runtime.battleAnimTarget ^ BIT_FLANK)) + 1;
  task.data[14] = getAnimBattlerSpriteId(runtime, ANIM_TARGET);
  task.data[15] = getAnimBattlerSpriteId(runtime, ANIM_DEF_PARTNER);
  task.func = 'AnimTask_MoveHeatWaveTargets_Step';
}

export function AnimTask_MoveHeatWaveTargets_Step(runtime: FireRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      task.data[10] += task.data[12] * 2;
      heatWaveJitter(task, 2);
      applyHeatWaveOffsets(runtime, task);
      if (++task.data[9] === 16) {
        task.data[9] = 0;
        ++task.data[0];
      }
      break;
    case 1:
      heatWaveJitter(task, 5);
      applyHeatWaveOffsets(runtime, task);
      if (++task.data[9] === 96) {
        task.data[9] = 0;
        ++task.data[0];
      }
      break;
    case 2:
      task.data[10] -= task.data[12] * 2;
      heatWaveJitter(task, 2);
      applyHeatWaveOffsets(runtime, task);
      if (++task.data[9] === 16) ++task.data[0];
      break;
    case 3:
      for (task.data[3] = 0; task.data[3] < task.data[13]; task.data[3]++) runtime.sprites[task.data[task.data[3] + 14]].x2 = 0;
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimTask_BlendBackground(runtime: FireRuntime, taskId: number): void {
  runtime.blends.push({ offset: 16, size: 16, coeff: runtime.battleAnimArgs[0], color: runtime.battleAnimArgs[1] });
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_ShakeTargetInPattern(runtime: FireRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[0] === 0) {
    task.data[1] = runtime.battleAnimArgs[0];
    task.data[2] = runtime.battleAnimArgs[1];
    task.data[3] = runtime.battleAnimArgs[2];
    task.data[4] = runtime.battleAnimArgs[3];
  }
  task.data[0]++;
  const spriteId = runtime.battlerSpriteIds[runtime.battleAnimTarget];
  const dirs = task.data[4] === 0 ? sShakeDirsPattern0 : sShakeDirsPattern1;
  const dir = dirs[task.data[0] % 10];
  if (task.data[3] === 1) runtime.sprites[spriteId].y2 = Math.abs(runtime.battleAnimArgs[1] * dir);
  else runtime.sprites[spriteId].x2 = runtime.battleAnimArgs[1] * dir;
  if (task.data[0] === task.data[1]) {
    runtime.sprites[spriteId].x2 = 0;
    runtime.sprites[spriteId].y2 = 0;
    destroyAnimVisualTask(runtime, taskId);
  }
}

export const animFireSpiralInward = AnimFireSpiralInward;
export const animFireSpread = AnimFireSpread;
export const animFirePlume = AnimFirePlume;
export const animLargeFlame = AnimLargeFlame;
export const animLargeFlameStep = AnimLargeFlame_Step;
export const animUnusedSmallEmber = AnimUnusedSmallEmber;
export const animUnusedSmallEmberStep = AnimUnusedSmallEmber_Step;
export const animSunlight = AnimSunlight;
export const animEmberFlare = AnimEmberFlare;
export const animBurnFlame = AnimBurnFlame;
export const animFireRing = AnimFireRing;
export const animFireRingStep1 = AnimFireRing_Step1;
export const animFireRingStep2 = AnimFireRing_Step2;
export const animFireRingStep3 = AnimFireRing_Step3;
export const updateFireRingCircleOffset = UpdateFireRingCircleOffset;
export const animFireCross = AnimFireCross;
export const animFireSpiralOutward = AnimFireSpiralOutward;
export const animFireSpiralOutwardStep1 = AnimFireSpiralOutward_Step1;
export const animFireSpiralOutwardStep2 = AnimFireSpiralOutward_Step2;
export const animTaskEruptionLaunchRocks = AnimTask_EruptionLaunchRocks;
export const animTaskEruptionLaunchRocksStep = AnimTask_EruptionLaunchRocks_Step;
export const createEruptionLaunchRocks = CreateEruptionLaunchRocks;
export const animEruptionLaunchRock = AnimEruptionLaunchRock;
export const getEruptionLaunchRockInitialYPos = GetEruptionLaunchRockInitialYPos;
export const initEruptionLaunchRockCoordData = InitEruptionLaunchRockCoordData;
export const updateEruptionLaunchRockPos = UpdateEruptionLaunchRockPos;
export const animEruptionFallingRock = AnimEruptionFallingRock;
export const animEruptionFallingRockStep = AnimEruptionFallingRock_Step;
export const animWillOWispOrb = AnimWillOWispOrb;
export const animWillOWispOrbStep = AnimWillOWispOrb_Step;
export const animWillOWispFire = AnimWillOWispFire;
export const animTaskMoveHeatWaveTargets = AnimTask_MoveHeatWaveTargets;
export const animTaskMoveHeatWaveTargetsStep = AnimTask_MoveHeatWaveTargets_Step;
export const animTaskBlendBackground = AnimTask_BlendBackground;
export const animTaskShakeTargetInPattern = AnimTask_ShakeTargetInPattern;

const heatWaveJitter = (task: FireTask, threshold: number): void => {
  if (++task.data[1] >= threshold) {
    task.data[1] = 0;
    ++task.data[2];
    task.data[11] = task.data[2] & 1 ? 2 : -2;
  }
};
const applyHeatWaveOffsets = (runtime: FireRuntime, task: FireTask): void => {
  for (task.data[3] = 0; task.data[3] < task.data[13]; task.data[3]++) runtime.sprites[task.data[task.data[3] + 14]].x2 = task.data[10] + task.data[11];
};
const getBattlerSide = (runtime: FireRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const getBattlerAtPosition = (runtime: FireRuntime, position: number): number => runtime.battlerAtPosition[position] ?? 0;
const isBattlerSpriteVisible = (runtime: FireRuntime, battler: number): boolean => runtime.battlerVisible[battler] === true;
const getBattlerSpriteCoord = (runtime: FireRuntime, battler: number, coord: 'x' | 'y' | 'x2' | 'yPicOffset'): number => runtime.battlerCoords[battler]?.[coord] ?? 0;
const getAnimBattlerSpriteId = (runtime: FireRuntime, animBattler: number): number => {
  const battler = animBattler === ANIM_ATTACKER ? runtime.battleAnimAttacker : animBattler === ANIM_TARGET ? runtime.battleAnimTarget : animBattler === ANIM_DEF_PARTNER ? runtime.battleAnimTarget ^ BIT_FLANK : animBattler;
  return runtime.battlerSpriteIds[battler] ?? MAX_SPRITES;
};
const getBattlerSpriteBgPriority = (runtime: FireRuntime, battler: number): number => runtime.battlerBgPriorities[battler] ?? 0;
const setSpriteCoordsToAnimAttackerCoords = (runtime: FireRuntime, sprite: FireSprite): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
};
const initSpritePosToAnimAttacker = setSpriteCoordsToAnimAttackerCoords;
const setAnimSpriteInitialXOffset = (runtime: FireRuntime, sprite: FireSprite, offset: number): void => {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) sprite.x -= offset;
  else sprite.x += offset;
};
const storeSpriteCallbackInData6 = (sprite: FireSprite, callback: FireCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const startSpriteAnim = (sprite: FireSprite, animIndex: number): void => {
  sprite.animIndex = animIndex & 0xff;
};
const initAnimLinearTranslation = (sprite: FireSprite): void => {
  sprite.data[8] = sprite.data[0];
  sprite.data[9] = 0;
};
const initAnimLinearTranslationWithSpeed = initAnimLinearTranslation;
const animTranslateLinear = (sprite: FireSprite): boolean => {
  const duration = sprite.data[8] || sprite.data[0];
  if (duration <= 0) return true;
  sprite.data[9]++;
  if (sprite.data[9] >= duration) {
    sprite.x2 = sprite.data[2] - sprite.data[1];
    sprite.y2 = sprite.data[4] - sprite.data[3];
    return true;
  }
  sprite.x2 = Math.trunc(((sprite.data[2] - sprite.data[1]) * sprite.data[9]) / duration);
  sprite.y2 = Math.trunc(((sprite.data[4] - sprite.data[3]) * sprite.data[9]) / duration);
  return false;
};
const createSprite = (runtime: FireRuntime, templateArg: FireSpriteTemplate, x: number, y: number, subpriority: number): number => {
  const id = runtime.sprites.findIndex((sprite, index) => index >= 4 && sprite.callback === 'SpriteCallbackDummy' && !sprite.destroyed && sprite.data.every((value) => value === 0) && sprite.x === 0 && sprite.y === 0);
  if (id < 0) return MAX_SPRITES;
  const sprite = createFireSprite();
  sprite.x = x;
  sprite.y = y;
  sprite.subpriority = subpriority;
  sprite.callback = templateArg.callback;
  runtime.sprites[id] = sprite;
  runtime.operations.push(`CreateSprite:${templateArg.tileTag}:${id}:${x}:${y}:${subpriority}`);
  return id;
};
const prepareBattlerSpriteForRotScale = (runtime: FireRuntime, spriteId: number, mode: number): void => {
  runtime.operations.push(`PrepareBattlerSpriteForRotScale:${spriteId}:${mode}`);
};
const battleAnimHelperSetSpriteSquashParams = (task: FireTask, _spriteId: number, _x1: number, _y1: number, _x2: number, _y2: number, frames: number): void => {
  task.squash = { framesLeft: frames };
};
const battleAnimHelperRunSpriteSquash = (task: FireTask): boolean => {
  if (!task.squash || task.squash.framesLeft <= 0) return false;
  task.squash.framesLeft--;
  return task.squash.framesLeft > 0;
};
const setBattlerSpriteYOffsetFromYScale = (runtime: FireRuntime, spriteId: number): void => {
  runtime.operations.push(`SetBattlerSpriteYOffsetFromYScale:${spriteId}`);
};
const resetSpriteRotScale = (runtime: FireRuntime, spriteId: number): void => {
  runtime.operations.push(`ResetSpriteRotScale:${spriteId}`);
};
const destroyAnimSprite = (sprite: FireSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const destroySpriteAndMatrix = (sprite: FireSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroySpriteAndMatrix';
};
const destroySprite = (sprite: FireSprite): void => {
  sprite.destroyed = true;
};
const destroyAnimVisualTask = (runtime: FireRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};
const playSe12WithPanning = (runtime: FireRuntime, song: string, pan: number): void => {
  runtime.sounds.push({ song, pan });
};
const u16 = (value: number): number => value & 0xffff;
