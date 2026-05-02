import { cos, gSineTable, sin } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const ST_OAM_HFLIP = 1;
export const ST_OAM_AFFINE_OFF = 0;
export const MAX_SPRITES = 64;

export type FlyingCallback =
  | 'AnimEllipticalGust'
  | 'AnimEllipticalGust_Step'
  | 'AnimGustToTarget'
  | 'AnimGustToTarget_Step'
  | 'AnimAirWaveCrescent'
  | 'AnimFlyBallUp'
  | 'AnimFlyBallUp_Step'
  | 'AnimFlyBallAttack'
  | 'AnimFlyBallAttack_Step'
  | 'DestroyAnimSpriteAfterTimer'
  | 'AnimFallingFeather'
  | 'AnimFallingFeather_Step'
  | 'AnimUnusedBubbleThrow'
  | 'AnimUnusedFeather'
  | 'AnimUnusedFeather_Step'
  | 'AnimWhirlwindLine'
  | 'AnimWhirlwindLine_Step'
  | 'AnimBounceBallShrink'
  | 'AnimBounceBallLand'
  | 'AnimDiveBall'
  | 'AnimDiveBall_Step1'
  | 'AnimDiveBall_Step2'
  | 'AnimDiveWaterSplash'
  | 'AnimSprayWaterDroplet'
  | 'AnimSprayWaterDroplet_Step'
  | 'AnimUnusedFlashingLight'
  | 'AnimUnusedFlashingLight_Step'
  | 'AnimSkyAttackBird'
  | 'AnimSkyAttackBird_Step'
  | 'TranslateAnimSpriteToTargetMonLocation'
  | 'StartAnimLinearTranslation'
  | 'RunStoredCallbackWhenAffineAnimEnds'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix'
  | 'SpriteCallbackDummy';

export type FlyingTaskFunc = 'AnimTask_AnimateGustTornadoPalette_Step' | 'AnimTask_DrillPeckHitSplats' | 'DestroyAnimVisualTask';

export interface FlyingSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: FlyingCallback;
}

export interface FeatherData {
  unk0_0a: number;
  unk0_0b: number;
  unk0_0c: number;
  unk0_0d: number;
  unk0_1: number;
  unk1: number;
  unk2: number;
  unk4: number;
  unk6: number;
  unk8: number;
  unkA: number;
  unkC: [number, number];
  unkE_0: number;
  unkE_1: number;
}

export interface FlyingSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  feather: FeatherData | null;
  callback: FlyingCallback;
  storedCallback: FlyingCallback | null;
  invisible: boolean;
  destroyed: boolean;
  animEnded: boolean;
  affineAnimEnded: boolean;
  animBeginning: boolean;
  animNum: number;
  hFlip: boolean;
  subpriority: number;
  oam: { priority: number; matrixNum: number; affineMode: number };
  matrix: { a: number; b: number; c: number; d: number };
  rotScale: { xScale: number; yScale: number; rotation: number } | null;
}

export interface FlyingTask {
  data: number[];
  func: FlyingTaskFunc;
  destroyed: boolean;
}

export interface FlyingRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  contest: boolean;
  battlerSides: Record<number, number>;
  battlerPositions: Record<number, number>;
  battlerAtPosition: Record<number, number>;
  battlerSpriteIds: Record<number, number>;
  battlerBgPriorities: Record<number, number>;
  battlerCoords: Record<number, { x: number; y: number; x2: number; yPicOffset: number; width: number; height: number }>;
  sprites: FlyingSprite[];
  tasks: Array<FlyingTask | null>;
  plttBufferFaded: number[];
  paletteTagIndexes: Record<string, number>;
  randomValues: number[];
  animVisualTaskCount: number;
  operations: string[];
}

const frame = (tileOffset: number, duration: number, flags: Record<string, boolean> = {}) => ({ tileOffset, duration, ...flags });
const affineFrame = (xScale: number, yScale: number, rotation: number, duration: number) => ({ xScale, yScale, rotation, duration });
const template = (tileTag: string, oam: string, anims: readonly unknown[] | string, affineAnims: readonly unknown[] | string, callback: FlyingCallback): FlyingSpriteTemplate => ({ tileTag, paletteTag: tileTag, oam, anims, images: null, affineAnims, callback });

export const sAffineAnimGustToTarget = [affineFrame(0x10, 0x100, 0, 0), affineFrame(0x0a, 0, 0, 24), { end: true }] as const;
export const sAffineAnimsGustToTarget = [sAffineAnimGustToTarget] as const;
export const sAnimsAirWaveCrescent = [[frame(0, 3), frame(0, 3, { hFlip: true }), frame(0, 3, { vFlip: true }), frame(0, 3, { vFlip: true, hFlip: true }), { jump: 0 }]] as const;
export const sAffineAnimFlyBallUp = [affineFrame(0x10, 0x100, 0, 0), affineFrame(0x28, 0, 0, 6), affineFrame(0, -0x20, 0, 5), affineFrame(-0x10, 0x20, 0, 10), { end: true }] as const;
export const sAffineAnimsFlyBallUp = [sAffineAnimFlyBallUp] as const;
export const sAffineAnimsFlyBallAttack = [[affineFrame(0, 0, 50, 1), { end: true }], [affineFrame(0, 0, -40, 1), { end: true }]] as const;
export const sAnimsFallingFeather = [[frame(0, 0), { end: true }], [frame(16, 0, { hFlip: true }), { end: true }]] as const;
export const sUnusedPal = ['INCBIN_U16(graphics/battle_anims/unused/flying.gbapal)'] as const;
export const sAnimsWhirlwindLines = [[frame(0, 1), frame(8, 1), frame(16, 1), frame(8, 1, { hFlip: true }), frame(0, 1, { hFlip: true }), { end: true }]] as const;
export const sAffineAnimsBounceBallShrink = [[affineFrame(0x10, 0x100, 0, 0), affineFrame(0x28, 0, 0, 6), affineFrame(0, -0x20, 0, 5), affineFrame(-0x14, 0, 0, 7), affineFrame(-0x14, -0x14, 0, 5), { end: true }]] as const;
export const sAffineAnimsBounceBallLand = [[affineFrame(0xa0, 0x100, 0, 0), { end: true }]] as const;
export const sAffineAnimsDiveBall = [sAffineAnimFlyBallUp] as const;
export const sAnimsUnused = [[affineFrame(0x100, 0, 0, 0), affineFrame(0, 0x20, 0, 12), affineFrame(0, -0x20, 0, 11), { end: true }]] as const;

export const gEllipticalGustSpriteTemplate = template('ANIM_TAG_GUST', 'gOamData_AffineOff_ObjNormal_32x64', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimEllipticalGust');
export const gGustToTargetSpriteTemplate = template('ANIM_TAG_GUST', 'gOamData_AffineNormal_ObjNormal_32x64', 'gDummySpriteAnimTable', sAffineAnimsGustToTarget, 'AnimGustToTarget');
export const gAirWaveCrescentSpriteTemplate = template('ANIM_TAG_AIR_WAVE_2', 'gOamData_AffineOff_ObjNormal_32x16', sAnimsAirWaveCrescent, 'gDummySpriteAffineAnimTable', 'AnimAirWaveCrescent');
export const gFlyBallUpSpriteTemplate = template('ANIM_TAG_ROUND_SHADOW', 'gOamData_AffineDouble_ObjNormal_64x64', 'gDummySpriteAnimTable', sAffineAnimsFlyBallUp, 'AnimFlyBallUp');
export const gFlyBallAttackSpriteTemplate = template('ANIM_TAG_ROUND_SHADOW', 'gOamData_AffineNormal_ObjNormal_64x64', 'gDummySpriteAnimTable', sAffineAnimsFlyBallAttack, 'AnimFlyBallAttack');
export const gFallingFeatherSpriteTemplate = template('ANIM_TAG_WHITE_FEATHER', 'gOamData_AffineNormal_ObjNormal_32x32', sAnimsFallingFeather, 'gDummySpriteAffineAnimTable', 'AnimFallingFeather');
export const sUnusedBubbleThrowSpriteTemplate = template('ANIM_TAG_SMALL_BUBBLES', 'gOamData_AffineOff_ObjNormal_16x16', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimUnusedBubbleThrow');
export const sUnusedFeatherSpriteTemplate = template('ANIM_TAG_WHITE_FEATHER', 'gOamData_AffineNormal_ObjNormal_32x32', sAnimsFallingFeather, 'gDummySpriteAffineAnimTable', 'AnimUnusedFeather');
export const gWhirlwindLineSpriteTemplate = template('ANIM_TAG_WHIRLWIND_LINES', 'gOamData_AffineOff_ObjNormal_32x16', sAnimsWhirlwindLines, 'gDummySpriteAffineAnimTable', 'AnimWhirlwindLine');
export const gBounceBallShrinkSpriteTemplate = template('ANIM_TAG_ROUND_SHADOW', 'gOamData_AffineDouble_ObjNormal_64x64', 'gDummySpriteAnimTable', sAffineAnimsBounceBallShrink, 'AnimBounceBallShrink');
export const gBounceBallLandSpriteTemplate = template('ANIM_TAG_ROUND_SHADOW', 'gOamData_AffineDouble_ObjNormal_64x64', 'gDummySpriteAnimTable', sAffineAnimsBounceBallLand, 'AnimBounceBallLand');
export const gDiveBallSpriteTemplate = template('ANIM_TAG_ROUND_SHADOW', 'gOamData_AffineDouble_ObjNormal_64x64', 'gDummySpriteAnimTable', sAffineAnimsDiveBall, 'AnimDiveBall');
export const gDiveWaterSplashSpriteTemplate = template('ANIM_TAG_SPLASH', 'gOamData_AffineDouble_ObjNormal_64x64', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimDiveWaterSplash');
export const gSprayWaterDropletSpriteTemplate = template('ANIM_TAG_SWEAT_BEAD', 'gOamData_AffineOff_ObjNormal_8x8', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimSprayWaterDroplet');
export const sUnusedFlashingLightSpriteTemplate = template('ANIM_TAG_CIRCLE_OF_LIGHT', 'gOamData_AffineOff_ObjBlend_64x64', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimUnusedFlashingLight');
export const gSkyAttackBirdSpriteTemplate = template('ANIM_TAG_BIRD', 'gOamData_AffineDouble_ObjNormal_64x64', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimSkyAttackBird');

export const createFeatherData = (): FeatherData => ({ unk0_0a: 0, unk0_0b: 0, unk0_0c: 0, unk0_0d: 0, unk0_1: 0, unk1: 0, unk2: 0, unk4: 0, unk6: 0, unk8: 0, unkA: 0, unkC: [0, 0], unkE_0: 0, unkE_1: 0 });
export const createFlyingSprite = (): FlyingSprite => ({ x: 0, y: 0, x2: 0, y2: 0, data: Array.from({ length: 16 }, () => 0), feather: null, callback: 'SpriteCallbackDummy', storedCallback: null, invisible: false, destroyed: false, animEnded: false, affineAnimEnded: false, animBeginning: false, animNum: 0, hFlip: false, subpriority: 0, oam: { priority: 0, matrixNum: 0, affineMode: 0 }, matrix: { a: 0, b: 0, c: 0, d: 0 }, rotScale: null });
export const createFlyingRuntime = (overrides: Partial<FlyingRuntime> = {}): FlyingRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  contest: overrides.contest ?? false,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerPositions: overrides.battlerPositions ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerAtPosition: overrides.battlerAtPosition ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerBgPriorities: overrides.battlerBgPriorities ?? { 0: 1, 1: 2, 2: 1, 3: 2 },
  battlerCoords: overrides.battlerCoords ?? {
    0: { x: 48, y: 72, x2: 48, yPicOffset: 64, width: 40, height: 52 },
    1: { x: 176, y: 48, x2: 176, yPicOffset: 48, width: 44, height: 56 },
    2: { x: 80, y: 80, x2: 80, yPicOffset: 72, width: 40, height: 52 },
    3: { x: 144, y: 40, x2: 144, yPicOffset: 40, width: 40, height: 52 }
  },
  sprites: overrides.sprites ?? Array.from({ length: MAX_SPRITES }, () => createFlyingSprite()),
  tasks: overrides.tasks ?? [],
  plttBufferFaded: overrides.plttBufferFaded ?? Array.from({ length: 512 }, (_, i) => i),
  paletteTagIndexes: overrides.paletteTagIndexes ?? { ANIM_TAG_GUST: 3 },
  randomValues: overrides.randomValues ?? [0],
  animVisualTaskCount: overrides.animVisualTaskCount ?? 0,
  operations: overrides.operations ?? []
});
export const createFlyingTask = (runtime: FlyingRuntime, func: FlyingTaskFunc = 'DestroyAnimVisualTask'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), func, destroyed: false });
  return id;
};

export function AnimEllipticalGust(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  initSpritePosToAnimTarget(runtime, sprite);
  sprite.y += 20;
  sprite.data[1] = 191;
  sprite.callback = 'AnimEllipticalGust_Step';
  AnimEllipticalGust_Step(sprite);
}
export function AnimEllipticalGust_Step(sprite: FlyingSprite): void {
  sprite.x2 = sin(sprite.data[1], 32);
  sprite.y2 = cos(sprite.data[1], 8);
  sprite.data[1] = (sprite.data[1] + 5) & 0xff;
  if (++sprite.data[0] === 71) destroyAnimSprite(sprite);
}
export function AnimTask_AnimateGustTornadoPalette(runtime: FlyingRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[1];
  task.data[1] = runtime.battleAnimArgs[0];
  task.data[2] = indexOfSpritePaletteTag(runtime, 'ANIM_TAG_GUST');
  task.func = 'AnimTask_AnimateGustTornadoPalette_Step';
}
export function AnimTask_AnimateGustTornadoPalette_Step(runtime: FlyingRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[10]++ === task.data[1]) {
    task.data[10] = 0;
    const data2 = task.data[2];
    const temp = runtime.plttBufferFaded[objPlttId(data2) + 8];
    let i = 7;
    const base = plttId(data2);
    do runtime.plttBufferFaded[base + 0x100 + 1 + i] = runtime.plttBufferFaded[base + 0x100 + i]; while (--i > 0);
    runtime.plttBufferFaded[base + 0x100 + 1] = temp;
  }
  if (--task.data[0] === 0) destroyAnimVisualTask(runtime, taskId);
}
export function AnimGustToTarget(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[1] = sprite.x;
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + runtime.battleAnimArgs[2];
  sprite.data[3] = sprite.y;
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[3];
  initAnimLinearTranslation(sprite);
  sprite.callback = 'RunStoredCallbackWhenAffineAnimEnds';
  storeSpriteCallbackInData6(sprite, 'AnimGustToTarget_Step');
}
export function AnimGustToTarget_Step(sprite: FlyingSprite): void {
  if (animTranslateLinear(sprite)) destroyAnimSprite(sprite);
}
export function AnimAirWaveCrescent(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    for (let i = 0; i < 4; i++) runtime.battleAnimArgs[i] = -runtime.battleAnimArgs[i];
  }
  if (runtime.contest) {
    runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
    runtime.battleAnimArgs[3] = -runtime.battleAnimArgs[3];
  }
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset') + runtime.battleAnimArgs[1];
  sprite.data[0] = runtime.battleAnimArgs[4];
  if (runtime.battleAnimArgs[6] === 0) {
    sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
    sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  } else {
    setAverageBattlerPositions(runtime, runtime.battleAnimTarget, sprite);
  }
  sprite.data[2] += runtime.battleAnimArgs[2];
  sprite.data[4] += runtime.battleAnimArgs[3];
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  seekSpriteAnim(sprite, runtime.battleAnimArgs[5]);
}
export function AnimFlyBallUp(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[1] = runtime.battleAnimArgs[3];
  sprite.callback = 'AnimFlyBallUp_Step';
  runtime.sprites[getAnimBattlerSpriteId(runtime, ANIM_ATTACKER)].invisible = true;
}
export function AnimFlyBallUp_Step(sprite: FlyingSprite): void {
  if (sprite.data[0] > 0) --sprite.data[0];
  else {
    sprite.data[2] += sprite.data[1];
    sprite.y2 -= sprite.data[2] >> 8;
  }
  if (sprite.y + sprite.y2 < -32) destroyAnimSprite(sprite);
}
export function AnimFlyBallAttack(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.x = DISPLAY_WIDTH + 32;
    sprite.y = -32;
    startSpriteAffineAnim(sprite, 1);
  } else {
    sprite.x = -32;
    sprite.y = -32;
  }
  sprite.data[0] = runtime.battleAnimArgs[0];
  sprite.data[1] = sprite.x;
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  sprite.data[3] = sprite.y;
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  initAnimLinearTranslation(sprite);
  sprite.callback = 'AnimFlyBallAttack_Step';
}
export function AnimFlyBallAttack_Step(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  sprite.data[0] = 1;
  animTranslateLinear(sprite);
  if (((sprite.data[3] & 0xffff) >> 8) > 200) {
    sprite.x += sprite.x2;
    sprite.x2 = 0;
    sprite.data[3] &= 0xff;
  }
  if (sprite.x + sprite.x2 < -32 || sprite.x + sprite.x2 > DISPLAY_WIDTH + 32 || sprite.y + sprite.y2 > DISPLAY_HEIGHT) {
    runtime.sprites[getAnimBattlerSpriteId(runtime, ANIM_ATTACKER)].invisible = false;
    destroyAnimSprite(sprite);
  }
}
export function DestroyAnimSpriteAfterTimer(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  if (sprite.data[0]-- <= 0) {
    if (sprite.oam.affineMode) {
      freeOamMatrix(sprite.oam.matrixNum);
      sprite.oam.affineMode = ST_OAM_AFFINE_OFF;
    }
    destroySprite(sprite);
    --runtime.animVisualTaskCount;
  }
}

export function AnimFallingFeather(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  const data = createFeatherData();
  sprite.feather = data;
  const battler = runtime.battleAnimArgs[7] & 0x100 ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  if (getBattlerSide(runtime, battler) === B_SIDE_PLAYER) runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
  sprite.x = getBattlerSpriteCoord(runtime, battler, 'height') + runtime.battleAnimArgs[0];
  const spriteCoord = getBattlerSpriteCoord(runtime, battler, 'width');
  sprite.y = spriteCoord + runtime.battleAnimArgs[1];
  data.unk8 = sprite.y << 8;
  data.unkE_1 = spriteCoord + runtime.battleAnimArgs[6];
  data.unk0_0c = 1;
  data.unk2 = runtime.battleAnimArgs[2] & 0xff;
  data.unkA = (runtime.battleAnimArgs[2] >> 8) & 0xff;
  data.unk4 = runtime.battleAnimArgs[3];
  data.unk6 = runtime.battleAnimArgs[4];
  data.unkC = [runtime.battleAnimArgs[5] & 0xff, (runtime.battleAnimArgs[5] >> 8) & 0xff];
  if (data.unk2 >= 64 && data.unk2 <= 191) {
    sprite.oam.priority = getBattlerSpriteBgPriority(runtime, battler) + (runtime.contest ? 0 : 1);
    data.unkE_0 = 0;
    if (!(data.unk4 & 0x8000)) flipFeatherAnim(sprite);
  } else {
    sprite.oam.priority = getBattlerSpriteBgPriority(runtime, battler);
    data.unkE_0 = 1;
    if (data.unk4 & 0x8000) flipFeatherAnim(sprite);
  }
  data.unk0_1 = data.unk2 >> 6;
  sprite.x2 = (gSineTable[data.unk2] * data.unkC[0]) >> 8;
  setFeatherMatrix(sprite, data);
  sprite.callback = 'AnimFallingFeather_Step';
}
export function AnimFallingFeather_Step(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  const data = sprite.feather!;
  if (data.unk0_0a) {
    if (data.unk1-- % 256 === 0) {
      data.unk0_0a = 0;
      data.unk1 = 0;
    }
    return;
  }
  const current = Math.trunc(data.unk2 / 64);
  if ((current === 0 && data.unk0_1 === 1) || (current === 1 && data.unk0_1 === 0) || (current === 2 && data.unk0_1 === 3) || (current === 3 && data.unk0_1 === 2)) {
    data.unk0_0d = 1;
    if (current !== 3) {
      data.unk0_0a = 1;
      data.unk1 = 0;
    }
  } else if ((current === 0 && data.unk0_1 === 3) || (current === 3 && data.unk0_1 === 0)) {
    data.unk0_0b ^= 1;
    data.unk0_0a = 1;
    data.unk1 = 0;
  } else if ((current === 1 && data.unk0_1 === 2) || (current === 2 && data.unk0_1 === 1)) {
    data.unk0_0a = 1;
    data.unk1 = 0;
  } else if (data.unk0_0d) {
    flipFeatherAnim(sprite);
    if (data.unk0_0c) toggleFeatherPriority(runtime, sprite, data);
    data.unk0_0d = 0;
  }
  data.unk0_1 = current;
  sprite.x2 = (data.unkC[data.unk0_0b] * gSineTable[data.unk2]) >> 8;
  setFeatherMatrix(sprite, data);
  data.unk8 += data.unk6;
  sprite.y = data.unk8 >> 8;
  data.unk2 = data.unk4 & 0x8000 ? (data.unk2 - (data.unk4 & 0x7fff)) & 0xff : (data.unk2 + (data.unk4 & 0x7fff)) & 0xff;
  if (sprite.y + sprite.y2 >= data.unkE_1) {
    sprite.data[0] = 0;
    sprite.callback = 'DestroyAnimSpriteAfterTimer';
  }
}
export function AnimUnusedBubbleThrow(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  sprite.oam.priority = getBattlerSpriteBgPriority(runtime, runtime.battleAnimTarget);
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  sprite.callback = 'TranslateAnimSpriteToTargetMonLocation';
}
export function AnimUnusedFeather(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  sprite.data[1] = runtime.battleAnimArgs[0];
  sprite.data[2] = runtime.battleAnimArgs[1];
  sprite.data[3] = runtime.battleAnimArgs[2];
  sprite.data[7] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'width') + (runtime.contest || (runtime.battlerPositions[runtime.battleAnimTarget] & 1) ? runtime.battleAnimArgs[3] : 40);
  if (!runtime.contest) sprite.oam.priority = getBattlerSpriteBgPriority(runtime, runtime.battleAnimTarget) + (runtime.battleAnimArgs[4] ? 1 : 0);
  sprite.data[4] = gSineTable[sprite.data[1] & 0xff];
  sprite.data[5] = -gSineTable[(sprite.data[1] & 0xff) + 64];
  sprite.data[6] = 0;
  const rn = random(runtime);
  sprite.data[1] = (sprite.data[1] & 0xffff) >> 8;
  if (rn & 0x8000) sprite.data[1] = 0xff - sprite.data[1];
  setMatrixFromIndex(sprite, sprite.data[1]);
  sprite.animBeginning = true;
  sprite.animEnded = false;
  if (rn & 1) {
    sprite.animNum = 1;
    sprite.hFlip = true;
  }
  sprite.callback = 'AnimUnusedFeather_Step';
}
export function AnimUnusedFeather_Step(sprite: FlyingSprite): void {
  ++sprite.data[0];
  if (sprite.data[0] <= 4) return;
  sprite.x2 = (sprite.data[4] * sprite.data[6]) >> 8;
  sprite.y2 = (sprite.data[5] * sprite.data[6]) >> 8;
  sprite.data[6] += sprite.data[3] & 0xff;
  if (sprite.data[6] < (sprite.data[2] & 0xff)) return;
  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  const old = [...sprite.data];
  sprite.x2 = sprite.y2 = 0;
  sprite.data.fill(0);
  const data = createFeatherData();
  data.unk8 = sprite.y << 8;
  data.unk6 = old[6] >> 8;
  data.unk2 = 0;
  data.unkA = old[2];
  data.unk4 = sprite.animNum !== 0 ? (data.unk6 & 8 ? 0x8001 : 0x8002) : (data.unk6 & 8 ? 1 : 2);
  const item = old[4] >> 8;
  data.unkC = [item, item - 2];
  data.unkE_1 = old[7] << 1;
  sprite.feather = data;
  sprite.callback = 'AnimFallingFeather_Step';
}
export function AnimWhirlwindLine(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  if (runtime.battleAnimArgs[2] === ANIM_ATTACKER) initSpritePosToAnimAttacker(runtime, sprite);
  else initSpritePosToAnimTarget(runtime, sprite);
  if ((runtime.battleAnimArgs[2] === ANIM_ATTACKER && getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER) || (runtime.battleAnimArgs[2] === ANIM_TARGET && getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER)) sprite.x += 8;
  seekSpriteAnim(sprite, runtime.battleAnimArgs[4]);
  sprite.x -= 32;
  sprite.data[1] = 0x0ccc;
  const arg = runtime.battleAnimArgs[4];
  sprite.x2 += 12 * arg;
  sprite.data[0] = arg;
  sprite.data[7] = runtime.battleAnimArgs[3];
  sprite.callback = 'AnimWhirlwindLine_Step';
}
export function AnimWhirlwindLine_Step(sprite: FlyingSprite): void {
  sprite.x2 += sprite.data[1] >> 8;
  if (++sprite.data[0] === 6) {
    sprite.data[0] = 0;
    sprite.x2 = 0;
    startSpriteAnim(sprite, 0);
  }
  if (--sprite.data[7] === -1) destroyAnimSprite(sprite);
}
export function AnimTask_DrillPeckHitSplats(runtime: FlyingRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (!(task.data[0] % 32)) {
    ++runtime.animVisualTaskCount;
    runtime.battleAnimArgs[0] = sin(task.data[0], -13);
    runtime.battleAnimArgs[1] = cos(task.data[0], -13);
    runtime.battleAnimArgs[2] = 1;
    runtime.battleAnimArgs[3] = 3;
    runtime.operations.push(`CreateSpriteAndAnimate:gFlashingHitSplatSpriteTemplate:${getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2')}:${getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset')}:3`);
  }
  task.data[0] += 8;
  if (task.data[0] > 255) destroyAnimVisualTask(runtime, taskId);
}
export function AnimBounceBallShrink(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  switch (sprite.data[0]) {
    case 0:
      initSpritePosToAnimAttacker(runtime, sprite);
      runtime.sprites[getAnimBattlerSpriteId(runtime, ANIM_ATTACKER)].invisible = true;
      ++sprite.data[0];
      break;
    case 1:
      if (sprite.affineAnimEnded) destroyAnimSprite(sprite);
      break;
  }
}
export function AnimBounceBallLand(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'y');
      sprite.y2 = -sprite.y - 32;
      ++sprite.data[0];
      break;
    case 1:
      sprite.y2 += 10;
      if (sprite.y2 >= 0) ++sprite.data[0];
      break;
    case 2:
      sprite.y2 -= 10;
      if (sprite.y + sprite.y2 < -32) {
        runtime.sprites[getAnimBattlerSpriteId(runtime, ANIM_ATTACKER)].invisible = false;
        destroyAnimSprite(sprite);
      }
      break;
  }
}
export function AnimDiveBall(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[1] = runtime.battleAnimArgs[3];
  sprite.callback = 'AnimDiveBall_Step1';
  runtime.sprites[getAnimBattlerSpriteId(runtime, ANIM_ATTACKER)].invisible = true;
}
export function AnimDiveBall_Step1(sprite: FlyingSprite): void {
  if (sprite.data[0] > 0) --sprite.data[0];
  else if (sprite.y + sprite.y2 > -32) {
    sprite.data[2] += sprite.data[1];
    sprite.y2 -= sprite.data[2] >> 8;
  } else {
    sprite.invisible = true;
    if (sprite.data[3]++ > 20) sprite.callback = 'AnimDiveBall_Step2';
  }
}
export function AnimDiveBall_Step2(sprite: FlyingSprite): void {
  sprite.y2 += sprite.data[2] >> 8;
  if (sprite.y + sprite.y2 > -32) sprite.invisible = false;
  if (sprite.y2 > 0) destroyAnimSprite(sprite);
}
export function AnimDiveWaterSplash(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  switch (sprite.data[0]) {
    case 0: {
      const battler = runtime.battleAnimArgs[0] ? runtime.battleAnimTarget : runtime.battleAnimAttacker;
      sprite.x = getBattlerSpriteCoord(runtime, battler, 'x');
      sprite.y = getBattlerSpriteCoord(runtime, battler, 'y');
      sprite.data[1] = 512;
      trySetSpriteRotScale(sprite, 0, 256, sprite.data[1], 0);
      ++sprite.data[0];
      break;
    }
    case 1: {
      if (sprite.data[2] <= 11) sprite.data[1] -= 40;
      else sprite.data[1] += 40;
      ++sprite.data[2];
      trySetSpriteRotScale(sprite, 0, 256, sprite.data[1], 0);
      let t2 = Math.trunc(15616 / (sprite.matrix.d || 1)) + 1;
      if (t2 > 128) t2 = 128;
      sprite.y2 = Math.trunc((64 - t2) / 2);
      if (sprite.data[2] === 24) {
        tryResetSpriteAffineState(sprite);
        destroyAnimSprite(sprite);
      }
      break;
    }
  }
}
export function AnimSprayWaterDroplet(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  const v1 = 0x1ff & random(runtime);
  const v2 = 0x7f & random(runtime);
  sprite.data[0] = v1 % 2 ? 736 + v1 : 736 - v1;
  sprite.data[1] = v2 % 2 ? 896 + v2 : 896 - v2;
  sprite.data[2] = runtime.battleAnimArgs[0];
  if (sprite.data[2]) sprite.oam.matrixNum = ST_OAM_HFLIP;
  const battler = runtime.battleAnimArgs[1] === 0 ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  sprite.x = getBattlerSpriteCoord(runtime, battler, 'x');
  sprite.y = getBattlerSpriteCoord(runtime, battler, 'y') + 32;
  sprite.callback = 'AnimSprayWaterDroplet_Step';
}
export function AnimSprayWaterDroplet_Step(sprite: FlyingSprite): void {
  if (sprite.data[2] === 0) sprite.x2 += sprite.data[0] >> 8;
  else sprite.x2 -= sprite.data[0] >> 8;
  sprite.y2 -= sprite.data[1] >> 8;
  sprite.data[1] -= 32;
  if (sprite.data[0] < 0) sprite.data[0] = 0;
  if (++sprite.data[3] === 31) destroyAnimSprite(sprite);
}
export function AnimUnusedFlashingLight(sprite: FlyingSprite): void {
  sprite.data[6] = 0;
  sprite.data[7] = 64;
  sprite.callback = 'AnimUnusedFlashingLight_Step';
}
export function AnimUnusedFlashingLight_Step(sprite: FlyingSprite): void {
  switch (sprite.data[0]) {
    case 0:
      if (++sprite.data[1] > 8) {
        sprite.data[1] = 0;
        sprite.invisible = !sprite.invisible;
        if (++sprite.data[2] > 5 && sprite.invisible !== false) ++sprite.data[0];
      }
      break;
    case 1:
      destroyAnimSprite(sprite);
      break;
  }
}
export function AnimSkyAttackBird(runtime: FlyingRuntime, sprite: FlyingSprite): void {
  const posx = sprite.x;
  const posy = sprite.y;
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  sprite.data[4] = sprite.x << 4;
  sprite.data[5] = sprite.y << 4;
  sprite.data[6] = Math.trunc(((posx - sprite.x) << 4) / 12);
  sprite.data[7] = Math.trunc(((posy - sprite.y) << 4) / 12);
  const rotation = (arcTan2Neg(posx - sprite.x, posy - sprite.y) + 49152) & 0xffff;
  trySetSpriteRotScale(sprite, 1, 0x100, 0x100, rotation);
  sprite.callback = 'AnimSkyAttackBird_Step';
}
export function AnimSkyAttackBird_Step(sprite: FlyingSprite): void {
  sprite.data[4] += sprite.data[6];
  sprite.data[5] += sprite.data[7];
  sprite.x = sprite.data[4] >> 4;
  sprite.y = sprite.data[5] >> 4;
  if (sprite.x > DISPLAY_WIDTH + 45 || sprite.x < -45 || sprite.y > 157 || sprite.y < -45) destroySpriteAndMatrix(sprite);
}
export function AnimTask_SetAttackerVisibility(runtime: FlyingRuntime, taskId: number): void {
  runtime.sprites[getAnimBattlerSpriteId(runtime, ANIM_ATTACKER)].invisible = runtime.battleAnimArgs[0] === 0;
  destroyAnimVisualTask(runtime, taskId);
}

export const animEllipticalGust = AnimEllipticalGust;
export const animEllipticalGustStep = AnimEllipticalGust_Step;
export const animTaskAnimateGustTornadoPalette = AnimTask_AnimateGustTornadoPalette;
export const animTaskAnimateGustTornadoPaletteStep = AnimTask_AnimateGustTornadoPalette_Step;
export const animGustToTarget = AnimGustToTarget;
export const animGustToTargetStep = AnimGustToTarget_Step;
export const animAirWaveCrescent = AnimAirWaveCrescent;
export const animFlyBallUp = AnimFlyBallUp;
export const animFlyBallUpStep = AnimFlyBallUp_Step;
export const animFlyBallAttack = AnimFlyBallAttack;
export const animFlyBallAttackStep = AnimFlyBallAttack_Step;
export const destroyAnimSpriteAfterTimer = DestroyAnimSpriteAfterTimer;
export const animFallingFeather = AnimFallingFeather;
export const animFallingFeatherStep = AnimFallingFeather_Step;
export const animUnusedBubbleThrow = AnimUnusedBubbleThrow;
export const animUnusedFeather = AnimUnusedFeather;
export const animUnusedFeatherStep = AnimUnusedFeather_Step;
export const animWhirlwindLine = AnimWhirlwindLine;
export const animWhirlwindLineStep = AnimWhirlwindLine_Step;
export const animTaskDrillPeckHitSplats = AnimTask_DrillPeckHitSplats;
export const animBounceBallShrink = AnimBounceBallShrink;
export const animBounceBallLand = AnimBounceBallLand;
export const animDiveBall = AnimDiveBall;
export const animDiveBallStep1 = AnimDiveBall_Step1;
export const animDiveBallStep2 = AnimDiveBall_Step2;
export const animDiveWaterSplash = AnimDiveWaterSplash;
export const animSprayWaterDroplet = AnimSprayWaterDroplet;
export const animSprayWaterDropletStep = AnimSprayWaterDroplet_Step;
export const animUnusedFlashingLight = AnimUnusedFlashingLight;
export const animUnusedFlashingLightStep = AnimUnusedFlashingLight_Step;
export const animSkyAttackBird = AnimSkyAttackBird;
export const animSkyAttackBirdStep = AnimSkyAttackBird_Step;
export const animTaskSetAttackerVisibility = AnimTask_SetAttackerVisibility;

const getBattlerSide = (runtime: FlyingRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const getBattlerSpriteCoord = (runtime: FlyingRuntime, battler: number, coord: keyof FlyingRuntime['battlerCoords'][number]): number => runtime.battlerCoords[battler]?.[coord] ?? 0;
const getBattlerSpriteBgPriority = (runtime: FlyingRuntime, battler: number): number => runtime.battlerBgPriorities[battler] ?? 0;
const getAnimBattlerSpriteId = (runtime: FlyingRuntime, animBattler: number): number => runtime.battlerSpriteIds[animBattler === ANIM_ATTACKER ? runtime.battleAnimAttacker : runtime.battleAnimTarget] ?? 0;
const initSpritePosToAnimTarget = (runtime: FlyingRuntime, sprite: FlyingSprite): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[1];
};
const initSpritePosToAnimAttacker = (runtime: FlyingRuntime, sprite: FlyingSprite): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset') + runtime.battleAnimArgs[1];
};
const setAverageBattlerPositions = (runtime: FlyingRuntime, battler: number, sprite: FlyingSprite): void => {
  sprite.data[2] = getBattlerSpriteCoord(runtime, battler, 'x');
  sprite.data[4] = getBattlerSpriteCoord(runtime, battler, 'y');
};
const storeSpriteCallbackInData6 = (sprite: FlyingSprite, callback: FlyingCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const seekSpriteAnim = (sprite: FlyingSprite, index: number): void => {
  sprite.animNum = index;
};
const startSpriteAnim = seekSpriteAnim;
const startSpriteAffineAnim = (sprite: FlyingSprite, index: number): void => {
  sprite.animNum = index;
};
const initAnimLinearTranslation = (sprite: FlyingSprite): void => {
  const x = sprite.data[2] - sprite.data[1];
  const y = sprite.data[4] - sprite.data[3];
  const movingLeft = x < 0;
  const movingUp = y < 0;
  let xDelta = Math.trunc((Math.abs(x) << 8) / sprite.data[0]) & 0xffff;
  let yDelta = Math.trunc((Math.abs(y) << 8) / sprite.data[0]) & 0xffff;
  xDelta = movingLeft ? xDelta | 1 : xDelta & ~1;
  yDelta = movingUp ? yDelta | 1 : yDelta & ~1;
  sprite.data[1] = xDelta;
  sprite.data[2] = yDelta;
  sprite.data[4] = 0;
  sprite.data[3] = 0;
};
const animTranslateLinear = (sprite: FlyingSprite): boolean => {
  if (!sprite.data[0]) return true;
  const v1 = sprite.data[1] & 0xffff;
  const v2 = sprite.data[2] & 0xffff;
  const x = ((sprite.data[3] & 0xffff) + v1) & 0xffff;
  const y = ((sprite.data[4] & 0xffff) + v2) & 0xffff;
  sprite.x2 = v1 & 1 ? -(x >> 8) : x >> 8;
  sprite.y2 = v2 & 1 ? -(y >> 8) : y >> 8;
  sprite.data[3] = x;
  sprite.data[4] = y;
  --sprite.data[0];
  return false;
};
const destroyAnimSprite = (sprite: FlyingSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const destroySprite = (sprite: FlyingSprite): void => {
  sprite.destroyed = true;
};
const destroySpriteAndMatrix = (sprite: FlyingSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroySpriteAndMatrix';
};
const destroyAnimVisualTask = (runtime: FlyingRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};
const freeOamMatrix = (_matrixNum: number): void => {};
const objPlttId = (index: number): number => (index + 16) * 16;
const plttId = (index: number): number => index * 16;
const indexOfSpritePaletteTag = (runtime: FlyingRuntime, tag: string): number => runtime.paletteTagIndexes[tag] ?? 0;
const random = (runtime: FlyingRuntime): number => runtime.randomValues.length ? runtime.randomValues.shift()! : 0;
const flipFeatherAnim = (sprite: FlyingSprite): void => {
  sprite.hFlip = !sprite.hFlip;
  sprite.animNum = Number(sprite.hFlip);
  sprite.animBeginning = true;
  sprite.animEnded = false;
};
const toggleFeatherPriority = (runtime: FlyingRuntime, sprite: FlyingSprite, data: FeatherData): void => {
  if (!runtime.contest) sprite.oam.priority += data.unkE_0 ? 1 : -1;
  else sprite.subpriority += data.unkE_0 ? 12 : -12;
  data.unkE_0 ^= 1;
};
const setMatrixFromIndex = (sprite: FlyingSprite, index: number): void => {
  const sinVal = gSineTable[index];
  sprite.matrix.a = sprite.matrix.d = gSineTable[index + 64];
  sprite.matrix.b = sinVal;
  sprite.matrix.c = -sinVal;
};
const setFeatherMatrix = (sprite: FlyingSprite, data: FeatherData): void => {
  const sinIndex = ((-sprite.x2 >> 1) + data.unkA) & 0xff;
  setMatrixFromIndex(sprite, sinIndex);
};
const trySetSpriteRotScale = (sprite: FlyingSprite, _matrixMode: number, xScale: number, yScale: number, rotation: number): void => {
  sprite.rotScale = { xScale, yScale, rotation };
  sprite.matrix.d = yScale;
};
const tryResetSpriteAffineState = (sprite: FlyingSprite): void => {
  sprite.rotScale = null;
};
const arcTan2Neg = (x: number, y: number): number => Math.round((Math.atan2(-y, x) / (2 * Math.PI)) * 65536) & 0xffff;
