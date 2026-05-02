import { gSineTable, sin, cos } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const MAX_SPRITES = 64;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const ST_OAM_AFFINE_OFF = 0;

export type IceCallback =
  | 'AnimUnusedIceCrystalThrow'
  | 'AnimUnusedIceCrystalThrow_Step'
  | 'AnimIcePunchSwirlingParticle'
  | 'AnimIceBeamParticle'
  | 'AnimIceEffectParticle'
  | 'AnimFlickerIceEffectParticle'
  | 'AnimSwirlingSnowball'
  | 'AnimSwirlingSnowball_Step1'
  | 'AnimSwirlingSnowball_Step2'
  | 'AnimSwirlingSnowball_End'
  | 'AnimMoveParticleBeyondTarget'
  | 'AnimWiggleParticleTowardsTarget'
  | 'AnimWaveFromCenterOfTarget'
  | 'InitSwirlingFogAnim'
  | 'AnimSwirlingFogAnim'
  | 'AnimThrowMistBall'
  | 'InitPoisonGasCloudAnim'
  | 'MovePoisonGasCloud'
  | 'AnimHailBegin'
  | 'AnimHailContinue'
  | 'InitIceBallAnim'
  | 'AnimThrowIceBall'
  | 'InitIceBallParticle'
  | 'AnimIceBallParticle'
  | 'AnimWeatherBallDown'
  | 'TranslateSpriteInGrowingCircle'
  | 'StartAnimLinearTranslation'
  | 'InitAnimFastLinearTranslationWithSpeedAndPos'
  | 'TranslateAnimSpriteToTargetMonLocation'
  | 'RunStoredCallbackWhenAffineAnimEnds'
  | 'RunStoredCallbackWhenAnimEnds'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix';

export type IceTaskFunc =
  | 'AnimTask_HazeScrollingFog_Step'
  | 'AnimTask_MistBallFog_Step'
  | 'AnimTask_Hail2'
  | 'DestroyAnimVisualTask';

export interface IceSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: IceCallback;
}

export interface HailCoordData {
  x: number;
  y: number;
  bPosition: number;
  unk3: number;
}

export interface IceSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: IceCallback;
  storedCallback: IceCallback | null;
  invisible: boolean;
  destroyed: boolean;
  animEnded: boolean;
  animNum: number;
  affineAnimNum: number;
  subpriority: number;
  oam: { priority: number; matrixNum: number; affineMode: number; tileNum: number };
}

export interface IceTask {
  data: number[];
  func: IceTaskFunc;
  destroyed: boolean;
}

export interface IceRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  contest: boolean;
  doubleBattle: boolean;
  animVisualTaskCount: number;
  rolloutTimerStartValue: number;
  rolloutTimer: number;
  battlerSides: Record<number, number>;
  battlerPositions: Record<number, number>;
  battlerAtPosition: Record<number, number>;
  battlerVisible: Record<number, boolean>;
  battlerBgPriority: Record<number, number>;
  battlerSpriteIds: Record<number, number>;
  battlerCoords: Record<number, { x: number; y: number; x2: number; yPicOffset: number; width: number; height: number }>;
  sprites: IceSprite[];
  tasks: Array<IceTask | null>;
  registers: Record<string, number>;
  battleBg1X: number;
  battleBg1Y: number;
  randomValues: number[];
  operations: string[];
}

const frame = (tileOffset: number, duration: number, flags: Record<string, boolean> = {}) => ({ tileOffset, duration, ...flags });
const affineFrame = (xScale: number, yScale: number, rotation: number, duration: number) => ({ xScale, yScale, rotation, duration });
const template = (tileTag: string, oam: string, anims: readonly unknown[] | string, affineAnims: readonly unknown[] | string, callback: IceCallback): IceSpriteTemplate => ({
  tileTag,
  paletteTag: tileTag,
  oam,
  anims,
  images: null,
  affineAnims,
  callback
});

export const sAnimUnused = [frame(0, 5, { hFlip: true }), frame(1, 5, { hFlip: true }), { jump: 0 }] as const;
export const sAnimsUnused = [sAnimUnused] as const;
export const sUnusedIceCrystalThrowSpriteTemplate = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineOff_ObjNormal_8x8', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimUnusedIceCrystalThrow');
export const sAnimIceCrystalLargeChunk = [frame(0, 1), { end: true }] as const;
export const sAnimIceCrystalLarge = [frame(4, 1), { end: true }] as const;
export const sAnimIceCrystalSmall = [frame(6, 1), { end: true }] as const;
export const sAnimSnowball = [frame(7, 1), { end: true }] as const;
export const sAnimBlizzardIceCrystal = [frame(8, 1), { end: true }] as const;
export const sAnimSmallBubblePair = [frame(12, 6), frame(13, 6), { jump: 0 }] as const;
export const sAnimsIceCrystalLargeChunk = [sAnimIceCrystalLargeChunk] as const;
export const sAnimsIceCrystalLarge = [sAnimIceCrystalLarge] as const;
export const sAnimsIceCrystalSmall = [sAnimIceCrystalSmall] as const;
export const sAnimsSnowball = [sAnimSnowball] as const;
export const sAnimsBlizzardIceCrystal = [sAnimBlizzardIceCrystal] as const;
export const gAnimsSmallBubblePair = [sAnimSmallBubblePair] as const;
export const sAffineAnimIceCrystalSpiralInwardLarge = [affineFrame(0, 0, 40, 1), { jump: 0 }] as const;
export const sAffineAnimsIceCrystalSpiralInwardLarge = [sAffineAnimIceCrystalSpiralInwardLarge] as const;
export const gIceCrystalSpiralInwardLarge = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineDouble_ObjBlend_8x16', sAnimsIceCrystalLarge, sAffineAnimsIceCrystalSpiralInwardLarge, 'AnimIcePunchSwirlingParticle');
export const gIceCrystalSpiralInwardSmall = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineOff_ObjBlend_8x8', sAnimsIceCrystalSmall, 'gDummySpriteAffineAnimTable', 'AnimIcePunchSwirlingParticle');
export const sAffineAnimIceBeamInnerCrystal = [affineFrame(0, 0, 10, 1), { jump: 0 }] as const;
export const sAffineAnimsIceBeamInnerCrystal = [sAffineAnimIceBeamInnerCrystal] as const;
export const gIceBeamInnerCrystalSpriteTemplate = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineNormal_ObjBlend_8x16', sAnimsIceCrystalLarge, sAffineAnimsIceBeamInnerCrystal, 'AnimIceBeamParticle');
export const gIceBeamOuterCrystalSpriteTemplate = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineOff_ObjBlend_8x8', sAnimsIceCrystalSmall, 'gDummySpriteAffineAnimTable', 'AnimIceBeamParticle');
export const sAffineAnimIceCrystalHit = [affineFrame(0xce, 0xce, 0, 0), affineFrame(5, 5, 0, 10), affineFrame(0, 0, 0, 6), { end: true }] as const;
export const sAffineAnimsIceCrystalHit = [sAffineAnimIceCrystalHit] as const;
export const gIceCrystalHitLargeSpriteTemplate = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineNormal_ObjBlend_8x16', sAnimsIceCrystalLarge, sAffineAnimsIceCrystalHit, 'AnimIceEffectParticle');
export const gIceCrystalHitSmallSpriteTemplate = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineNormal_ObjBlend_8x8', sAnimsIceCrystalSmall, sAffineAnimsIceCrystalHit, 'AnimIceEffectParticle');
export const gSwirlingSnowballSpriteTemplate = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineOff_ObjNormal_8x8', sAnimsSnowball, 'gDummySpriteAffineAnimTable', 'AnimSwirlingSnowball');
export const gBlizzardIceCrystalSpriteTemplate = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineOff_ObjNormal_16x16', sAnimsBlizzardIceCrystal, 'gDummySpriteAffineAnimTable', 'AnimMoveParticleBeyondTarget');
export const gPowderSnowSnowballSpriteTemplate = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineOff_ObjNormal_8x8', sAnimsSnowball, 'gDummySpriteAffineAnimTable', 'AnimMoveParticleBeyondTarget');
export const sAnimIceGroundSpike = [frame(0, 5), frame(2, 5), frame(4, 5), frame(6, 5), frame(4, 5), frame(2, 5), frame(0, 5), { end: true }] as const;
export const sAnimsIceGroundSpike = [sAnimIceGroundSpike] as const;
export const gIceGroundSpikeSpriteTemplate = template('ANIM_TAG_ICE_SPIKES', 'gOamData_AffineOff_ObjBlend_8x16', sAnimsIceGroundSpike, 'gDummySpriteAffineAnimTable', 'AnimWaveFromCenterOfTarget');
export const sAnimCloud = [frame(0, 8), frame(8, 8), { jump: 0 }] as const;
export const sAnimsCloud = [sAnimCloud] as const;
export const gMistCloudSpriteTemplate = template('ANIM_TAG_MIST_CLOUD', 'gOamData_AffineOff_ObjBlend_32x16', sAnimsCloud, 'gDummySpriteAffineAnimTable', 'InitSwirlingFogAnim');
export const gSmogCloudSpriteTemplate = template('ANIM_TAG_PURPLE_GAS_CLOUD', 'gOamData_AffineOff_ObjBlend_32x16', sAnimsCloud, 'gDummySpriteAffineAnimTable', 'InitSwirlingFogAnim');
export const sHazeBlendAmounts = [0, 1, 2, 2, 2, 2, 3, 4, 4, 4, 5, 6, 6, 6, 6, 7, 8, 8, 8, 9] as const;
export const gMistBallSpriteTemplate = template('ANIM_TAG_SMALL_BUBBLES', 'gOamData_AffineOff_ObjNormal_16x16', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimThrowMistBall');
export const sMistBlendAmounts = [0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5] as const;
export const gPoisonGasCloudSpriteTemplate = template('ANIM_TAG_PURPLE_GAS_CLOUD', 'gOamData_AffineOff_ObjBlend_32x16', sAnimsCloud, 'gDummySpriteAffineAnimTable', 'InitPoisonGasCloudAnim');
export const sHailCoordData: HailCoordData[] = [
  { x: 100, y: 120, bPosition: 0, unk3: 2 },
  { x: 85, y: 120, bPosition: 0, unk3: 0 },
  { x: 242, y: 120, bPosition: 1, unk3: 1 },
  { x: 66, y: 120, bPosition: 2, unk3: 1 },
  { x: 182, y: 120, bPosition: 3, unk3: 0 },
  { x: 60, y: 120, bPosition: 0, unk3: 2 },
  { x: 214, y: 120, bPosition: 1, unk3: 0 },
  { x: 113, y: 120, bPosition: 0, unk3: 1 },
  { x: 210, y: 120, bPosition: 3, unk3: 1 },
  { x: 38, y: 120, bPosition: 2, unk3: 0 }
];
export const sAffineAnimsHailParticle = [
  [affineFrame(0x100, 0x100, 0, 0), { end: true }],
  [affineFrame(0xf0, 0xf0, 0, 0), { end: true }],
  [affineFrame(0xe0, 0xe0, 0, 0), { end: true }]
] as const;
export const sAffineAnimsWeatherBallIceDown = [[affineFrame(0x150, 0x150, 0, 0), { end: true }]] as const;
export const sHailParticleSpriteTemplate = template('ANIM_TAG_HAIL', 'gOamData_AffineNormal_ObjNormal_16x16', 'gDummySpriteAnimTable', sAffineAnimsHailParticle, 'AnimHailBegin');
export const gWeatherBallIceDownSpriteTemplate = template('ANIM_TAG_HAIL', 'gOamData_AffineNormal_ObjNormal_16x16', 'gDummySpriteAnimTable', sAffineAnimsWeatherBallIceDown, 'AnimWeatherBallDown');
export const sAnimsIceBallChunk = [[frame(0, 1), { end: true }], [frame(16, 4), frame(32, 4), frame(48, 4), frame(64, 4), { end: true }]] as const;
export const sAffineAnimsIceBallChunk = [
  [affineFrame(0xe0, 0xe0, 0, 0), { end: true }],
  [affineFrame(0x118, 0x118, 0, 0), { end: true }],
  [affineFrame(0x150, 0x150, 0, 0), { end: true }],
  [affineFrame(0x180, 0x180, 0, 0), { end: true }],
  [affineFrame(0x1c0, 0x1c0, 0, 0), { end: true }]
] as const;
export const gIceBallChunkSpriteTemplate = template('ANIM_TAG_ICE_CHUNK', 'gOamData_AffineDouble_ObjNormal_32x32', sAnimsIceBallChunk, sAffineAnimsIceBallChunk, 'InitIceBallAnim');
export const gIceBallImpactShardSpriteTemplate = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineOff_ObjNormal_8x8', sAnimsIceCrystalSmall, 'gDummySpriteAffineAnimTable', 'InitIceBallParticle');

export const createIceSprite = (): IceSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 16 }, () => 0),
  callback: 'DestroyAnimSprite',
  storedCallback: null,
  invisible: false,
  destroyed: false,
  animEnded: false,
  animNum: 0,
  affineAnimNum: 0,
  subpriority: 0,
  oam: { priority: 0, matrixNum: 0, affineMode: 0, tileNum: 0 }
});

export const createIceRuntime = (overrides: Partial<IceRuntime> = {}): IceRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  contest: overrides.contest ?? false,
  doubleBattle: overrides.doubleBattle ?? false,
  animVisualTaskCount: overrides.animVisualTaskCount ?? 0,
  rolloutTimerStartValue: overrides.rolloutTimerStartValue ?? 1,
  rolloutTimer: overrides.rolloutTimer ?? 0,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerPositions: overrides.battlerPositions ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerAtPosition: overrides.battlerAtPosition ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerVisible: overrides.battlerVisible ?? { 0: true, 1: true, 2: true, 3: true },
  battlerBgPriority: overrides.battlerBgPriority ?? { 0: 1, 1: 2, 2: 1, 3: 2 },
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerCoords: overrides.battlerCoords ?? {
    0: { x: 48, y: 72, x2: 48, yPicOffset: 64, width: 40, height: 52 },
    1: { x: 176, y: 48, x2: 176, yPicOffset: 48, width: 44, height: 56 },
    2: { x: 80, y: 80, x2: 80, yPicOffset: 72, width: 40, height: 52 },
    3: { x: 144, y: 40, x2: 144, yPicOffset: 40, width: 40, height: 52 }
  },
  sprites: overrides.sprites ?? Array.from({ length: MAX_SPRITES }, () => createIceSprite()),
  tasks: overrides.tasks ?? [],
  registers: overrides.registers ?? {},
  battleBg1X: overrides.battleBg1X ?? 0,
  battleBg1Y: overrides.battleBg1Y ?? 0,
  randomValues: overrides.randomValues ?? [0],
  operations: overrides.operations ?? []
});

export const createIceTask = (runtime: IceRuntime, func: IceTaskFunc = 'DestroyAnimVisualTask'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), func, destroyed: false });
  return id;
};

export function AnimUnusedIceCrystalThrow(runtime: IceRuntime, sprite: IceSprite): void {
  sprite.oam.tileNum += 7;
  let targetX = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  let targetY = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  let attackerX = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  let attackerY = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[1] = runtime.battleAnimArgs[0] + attackerX;
  sprite.data[2] = runtime.battleAnimArgs[2] + targetX;
  sprite.data[3] = runtime.battleAnimArgs[1] + attackerY;
  sprite.data[4] = runtime.battleAnimArgs[3] + targetY;
  convertPosDataToTranslateLinearData(sprite);
  for (; targetX >= -32 && targetX <= DISPLAY_WIDTH + 32 && targetY >= -32 && targetY <= DISPLAY_HEIGHT + 32; targetX += sprite.data[1], targetY += sprite.data[2]);
  sprite.data[1] = -sprite.data[1];
  sprite.data[2] = -sprite.data[2];
  for (; attackerX >= -32 && attackerX <= DISPLAY_WIDTH + 32 && attackerY >= -32 && attackerY <= DISPLAY_HEIGHT + 32; attackerX += sprite.data[1], attackerY += sprite.data[2]);
  sprite.x = attackerX;
  sprite.y = attackerY;
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[1] = attackerX;
  sprite.data[2] = targetX;
  sprite.data[3] = attackerY;
  sprite.data[4] = targetY;
  convertPosDataToTranslateLinearData(sprite);
  sprite.data[3] = runtime.battleAnimArgs[5];
  sprite.data[4] = runtime.battleAnimArgs[6];
  sprite.callback = 'AnimUnusedIceCrystalThrow_Step';
}

export function AnimUnusedIceCrystalThrow_Step(sprite: IceSprite): void {
  if (sprite.data[0] !== 0) {
    sprite.data[5] += sprite.data[1];
    sprite.data[6] += sprite.data[2];
    sprite.x2 = sprite.data[5];
    sprite.y2 = sprite.data[6];
    sprite.x2 += sin(sprite.data[7], sprite.data[3]);
    sprite.y2 += sin(sprite.data[7], sprite.data[3]);
    sprite.data[7] = (sprite.data[7] + sprite.data[4]) & 0xff;
    --sprite.data[0];
  } else {
    destroyAnimSprite(sprite);
  }
}

export function AnimIcePunchSwirlingParticle(sprite: IceSprite, args: number[]): void {
  sprite.data[0] = args[0];
  sprite.data[1] = 60;
  sprite.data[2] = 9;
  sprite.data[3] = 30;
  sprite.data[4] = -512;
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  sprite.callback = 'TranslateSpriteInGrowingCircle';
  translateSpriteInGrowingCircle(sprite);
}

export function AnimIceBeamParticle(runtime: IceRuntime, sprite: IceSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) sprite.data[2] -= runtime.battleAnimArgs[2];
  else sprite.data[2] += runtime.battleAnimArgs[2];
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[3];
  sprite.data[0] = runtime.battleAnimArgs[4];
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  sprite.callback = 'StartAnimLinearTranslation';
}

export function AnimIceEffectParticle(runtime: IceRuntime, sprite: IceSprite): void {
  if (runtime.battleAnimArgs[2] === 0) {
    initSpritePosToAnimTarget(runtime, sprite);
  } else {
    setAverageBattlerPositions(runtime, runtime.battleAnimTarget, sprite, false);
    if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
    sprite.x += runtime.battleAnimArgs[0];
    sprite.y += runtime.battleAnimArgs[1];
  }
  storeSpriteCallbackInData6(sprite, 'AnimFlickerIceEffectParticle');
  sprite.callback = 'RunStoredCallbackWhenAffineAnimEnds';
}

export function AnimFlickerIceEffectParticle(sprite: IceSprite): void {
  sprite.invisible = !sprite.invisible;
  if (++sprite.data[0] === 20) destroySpriteAndMatrix(sprite);
}

export function AnimSwirlingSnowball(runtime: IceRuntime, sprite: IceSprite): void {
  const temp: number[] = [];
  initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  if (!runtime.battleAnimArgs[5]) {
    sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
    sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[3];
  } else {
    setAverageBattlerPositions(runtime, runtime.battleAnimTarget, sprite, true);
  }
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) sprite.data[2] -= runtime.battleAnimArgs[2];
  else sprite.data[2] += runtime.battleAnimArgs[2];
  for (let i = 0; i < 8; ++i) temp[i] = sprite.data[i];
  initAnimFastLinearTranslationWithSpeed(sprite);
  sprite.data[1] ^= 1;
  sprite.data[2] ^= 1;
  while (true) {
    sprite.data[0] = 1;
    animFastTranslateLinear(sprite);
    if (offscreen16(sprite)) break;
  }
  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.x2 = 0;
  sprite.y2 = 0;
  for (let i = 0; i < 8; ++i) sprite.data[i] = temp[i];
  sprite.callback = 'InitAnimFastLinearTranslationWithSpeedAndPos';
  storeSpriteCallbackInData6(sprite, 'AnimSwirlingSnowball_Step1');
}

export function AnimSwirlingSnowball_Step1(runtime: IceRuntime, sprite: IceSprite): void {
  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.y2 = 0;
  sprite.x2 = 0;
  sprite.data[0] = 128;
  const tempVar = getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER ? 20 : -20;
  sprite.data[3] = sin(sprite.data[0], tempVar);
  sprite.data[4] = cos(sprite.data[0], 15);
  sprite.data[5] = 0;
  sprite.callback = 'AnimSwirlingSnowball_Step2';
  AnimSwirlingSnowball_Step2(runtime, sprite);
}

export function AnimSwirlingSnowball_Step2(runtime: IceRuntime, sprite: IceSprite): void {
  const tempVar = getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER ? 20 : -20;
  if (sprite.data[5] <= 31) {
    sprite.x2 = sin(sprite.data[0], tempVar) - sprite.data[3];
    sprite.y2 = cos(sprite.data[0], 15) - sprite.data[4];
    sprite.data[0] = (sprite.data[0] + 16) & 0xff;
    ++sprite.data[5];
  } else {
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.x2 = 0;
    sprite.y2 = 0;
    sprite.data[3] = 0;
    sprite.data[4] = 0;
    sprite.callback = 'AnimSwirlingSnowball_End';
  }
}

export function AnimSwirlingSnowball_End(sprite: IceSprite): void {
  sprite.data[0] = 1;
  animFastTranslateLinear(sprite);
  if (u32(sprite.x + sprite.x2 + 16) > 272 || sprite.y + sprite.y2 > 256 || sprite.y + sprite.y2 < -16) destroyAnimSprite(sprite);
}

export function AnimMoveParticleBeyondTarget(runtime: IceRuntime, sprite: IceSprite): void {
  const temp: number[] = [];
  initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  if (!runtime.battleAnimArgs[7]) {
    sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
    sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  } else {
    setAverageBattlerPositions(runtime, runtime.battleAnimTarget, sprite, true);
  }
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) sprite.data[2] -= runtime.battleAnimArgs[2];
  else sprite.data[2] += runtime.battleAnimArgs[2];
  sprite.data[4] += runtime.battleAnimArgs[3];
  initAnimFastLinearTranslationWithSpeed(sprite);
  for (let i = 0; i < 8; ++i) temp[i] = sprite.data[i];
  sprite.data[1] ^= 1;
  sprite.data[2] ^= 1;
  while (true) {
    sprite.data[0] = 1;
    animFastTranslateLinear(sprite);
    if (offscreen16(sprite)) break;
  }
  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.y2 = 0;
  sprite.x2 = 0;
  for (let i = 0; i < 8; ++i) sprite.data[i] = temp[i];
  sprite.data[5] = runtime.battleAnimArgs[5];
  sprite.data[6] = runtime.battleAnimArgs[6];
  sprite.callback = 'AnimWiggleParticleTowardsTarget';
}

export function AnimWiggleParticleTowardsTarget(sprite: IceSprite): void {
  animFastTranslateLinear(sprite);
  if (sprite.data[0] === 0) sprite.data[0] = 1;
  sprite.y2 += sin(sprite.data[7], sprite.data[5]);
  sprite.data[7] = (sprite.data[7] + sprite.data[6]) & 0xff;
  if (sprite.data[0] === 1 && offscreen16(sprite)) destroyAnimSprite(sprite);
}

export function AnimWaveFromCenterOfTarget(runtime: IceRuntime, sprite: IceSprite): void {
  if (sprite.data[0] === 0) {
    if (runtime.battleAnimArgs[2] === 0) {
      initSpritePosToAnimTarget(runtime, sprite);
    } else {
      setAverageBattlerPositions(runtime, runtime.battleAnimTarget, sprite, false);
      if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
      sprite.x += runtime.battleAnimArgs[0];
      sprite.y += runtime.battleAnimArgs[1];
    }
    ++sprite.data[0];
  } else if (sprite.animEnded) {
    destroyAnimSprite(sprite);
  }
}

export function InitSwirlingFogAnim(runtime: IceRuntime, sprite: IceSprite): void {
  let battler: number;
  if (runtime.battleAnimArgs[4] === 0) {
    if (runtime.battleAnimArgs[5] === 0) initSpritePosToAnimAttacker(runtime, sprite, false);
    else {
      setAverageBattlerPositions(runtime, runtime.battleAnimAttacker, sprite, false);
      if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) sprite.x -= runtime.battleAnimArgs[0];
      else sprite.x += runtime.battleAnimArgs[0];
      sprite.y += runtime.battleAnimArgs[1];
    }
    battler = runtime.battleAnimAttacker;
  } else {
    if (runtime.battleAnimArgs[5] === 0) initSpritePosToAnimTarget(runtime, sprite, false);
    else {
      setAverageBattlerPositions(runtime, runtime.battleAnimTarget, sprite, false);
      if (getBattlerSide(runtime, runtime.battleAnimTarget) !== B_SIDE_PLAYER) sprite.x -= runtime.battleAnimArgs[0];
      else sprite.x += runtime.battleAnimArgs[0];
      sprite.y += runtime.battleAnimArgs[1];
    }
    battler = runtime.battleAnimTarget;
  }
  sprite.data[7] = battler;
  sprite.data[6] = runtime.battleAnimArgs[5] === 0 || !runtime.doubleBattle ? 0x20 : 0x40;
  if (getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER) sprite.y += 8;
  sprite.data[0] = runtime.battleAnimArgs[3];
  sprite.data[1] = sprite.x;
  sprite.data[2] = sprite.x;
  sprite.data[3] = sprite.y;
  sprite.data[4] = sprite.y + runtime.battleAnimArgs[2];
  initAnimLinearTranslation(sprite);
  sprite.data[5] = 64;
  sprite.callback = 'AnimSwirlingFogAnim';
  AnimSwirlingFogAnim(runtime, sprite);
}

export function AnimSwirlingFogAnim(runtime: IceRuntime, sprite: IceSprite): void {
  if (!animTranslateLinear(sprite)) {
    sprite.x2 += sin(sprite.data[5], sprite.data[6]);
    sprite.y2 += cos(sprite.data[5], -6);
    sprite.oam.priority = u16(sprite.data[5] - 64) <= 0x7f ? getBattlerSpriteBgPriority(runtime, sprite.data[7]) : getBattlerSpriteBgPriority(runtime, sprite.data[7]) + 1;
    sprite.data[5] = (sprite.data[5] + 3) & 0xff;
  } else {
    destroyAnimSprite(sprite);
  }
}

export function AnimTask_HazeScrollingFog(runtime: IceRuntime, taskId: number): void {
  setupFogBackground(runtime, false);
  runtime.tasks[taskId]!.func = 'AnimTask_HazeScrollingFog_Step';
}

export function AnimTask_HazeScrollingFog_Step(runtime: IceRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  runtime.battleBg1X += -1;
  switch (task.data[12]) {
    case 0:
      if (++task.data[10] === 4) {
        task.data[10] = 0;
        ++task.data[9];
        task.data[11] = sHazeBlendAmounts[task.data[9]];
        setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[11], 16 - task.data[11]));
        if (task.data[11] === 9) {
          ++task.data[12];
          task.data[11] = 0;
        }
      }
      break;
    case 1:
      if (++task.data[11] === 0x51) {
        task.data[11] = 9;
        ++task.data[12];
      }
      break;
    case 2:
      if (++task.data[10] === 4) {
        task.data[10] = 0;
        --task.data[11];
        setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[11], 16 - task.data[11]));
        if (task.data[11] === 0) {
          ++task.data[12];
          task.data[11] = 0;
        }
      }
      break;
    case 3:
      initBattleAnimBg(runtime, 1);
      initBattleAnimBg(runtime, 2);
      ++task.data[12];
    // fall through
    case 4:
      if (!runtime.contest) setAnimBgAttribute(runtime, 1, 'BG_ANIM_CHAR_BASE_BLOCK', 0);
      runtime.battleBg1X = 0;
      runtime.battleBg1Y = 0;
      setGpuReg(runtime, 'BLDCNT', 0);
      setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 0));
      setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 1);
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimThrowMistBall(runtime: IceRuntime, sprite: IceSprite): void {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  sprite.callback = 'TranslateAnimSpriteToTargetMonLocation';
}

export function AnimTask_MistBallFog(runtime: IceRuntime, taskId: number): void {
  setupFogBackground(runtime, true);
  const task = runtime.tasks[taskId]!;
  task.data[15] = -1;
  task.func = 'AnimTask_MistBallFog_Step';
}

export function AnimTask_MistBallFog_Step(runtime: IceRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  runtime.battleBg1X += task.data[15];
  switch (task.data[12]) {
    case 0:
      ++task.data[9];
      task.data[11] = sMistBlendAmounts[task.data[9]];
      setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[11], 17 - task.data[11]));
      if (task.data[11] === 5) {
        ++task.data[12];
        task.data[11] = 0;
      }
      break;
    case 1:
      if (++task.data[11] === 0x51) {
        task.data[11] = 5;
        ++task.data[12];
      }
      break;
    case 2:
      if (++task.data[10] === 4) {
        task.data[10] = 0;
        --task.data[11];
        setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[11], 16 - task.data[11]));
        if (task.data[11] === 0) {
          ++task.data[12];
          task.data[11] = 0;
        }
      }
      break;
    case 3:
      initBattleAnimBg(runtime, 1);
      initBattleAnimBg(runtime, 2);
      ++task.data[12];
    // fall through
    case 4:
      if (!runtime.contest) setAnimBgAttribute(runtime, 1, 'BG_ANIM_CHAR_BASE_BLOCK', 0);
      runtime.battleBg1X = 0;
      runtime.battleBg1Y = 0;
      setGpuReg(runtime, 'BLDCNT', 0);
      setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 0));
      setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 1);
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function InitPoisonGasCloudAnim(runtime: IceRuntime, sprite: IceSprite): void {
  sprite.data[0] = runtime.battleAnimArgs[0];
  if (getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') < getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2')) sprite.data[7] = 0x8000;
  if ((runtime.battlerPositions[runtime.battleAnimTarget] & 1) === B_SIDE_PLAYER) {
    runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
    runtime.battleAnimArgs[3] = -runtime.battleAnimArgs[3];
    if ((sprite.data[7] & 0x8000) && (runtime.battlerPositions[runtime.battleAnimAttacker] & 1) === B_SIDE_PLAYER) sprite.subpriority = runtime.sprites[getAnimBattlerSpriteId(runtime, ANIM_TARGET)].subpriority + 1;
    sprite.data[6] = 1;
  }
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  sprite.data[1] = sprite.x + runtime.battleAnimArgs[1];
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, runtime.battleAnimArgs[7] ? 'x2' : 'x') + runtime.battleAnimArgs[3];
  sprite.data[3] = sprite.y + runtime.battleAnimArgs[2];
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, runtime.battleAnimArgs[7] ? 'yPicOffset' : 'y') + runtime.battleAnimArgs[4];
  sprite.data[7] |= getBattlerSpriteBgPriority(runtime, runtime.battleAnimTarget) << 8;
  if (runtime.contest) {
    sprite.data[6] = 1;
    sprite.subpriority = 0x80;
  }
  initAnimLinearTranslation(sprite);
  sprite.callback = 'MovePoisonGasCloud';
}

export function MovePoisonGasCloud(runtime: IceRuntime, sprite: IceSprite): void {
  let value: number;
  switch (sprite.data[7] & 0xff) {
    case 0:
      animTranslateLinear(sprite);
      value = gSineTable[sprite.data[5]];
      sprite.x2 += value >> 4;
      sprite.data[5] = sprite.data[6] ? (sprite.data[5] - 8) & 0xff : (sprite.data[5] + 8) & 0xff;
      if (sprite.data[0] <= 0) {
        sprite.data[0] = 80;
        sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x');
        sprite.data[1] = sprite.x;
        sprite.data[2] = sprite.x;
        sprite.y += sprite.y2;
        sprite.data[3] = sprite.y;
        sprite.data[4] = sprite.y + 29;
        ++sprite.data[7];
        if (runtime.contest) sprite.data[5] = 80;
        else if (getBattlerSide(runtime, runtime.battleAnimTarget) !== B_SIDE_PLAYER) sprite.data[5] = 204;
        else sprite.data[5] = 80;
        sprite.y2 = 0;
        value = gSineTable[sprite.data[5]];
        sprite.x2 = value >> 3;
        sprite.data[5] = (sprite.data[5] + 2) & 0xff;
        initAnimLinearTranslation(sprite);
      }
      break;
    case 1:
      animTranslateLinear(sprite);
      value = gSineTable[sprite.data[5]];
      sprite.x2 += value >> 3;
      sprite.y2 += (gSineTable[(sprite.data[5] + 0x40) & 0xff] * -3) >> 8;
      if (!runtime.contest) {
        sprite.oam.priority = u16(sprite.data[5] - 0x40) <= 0x7f ? sprite.data[7] >> 8 : (sprite.data[7] >> 8) + 1;
        sprite.data[5] = (sprite.data[5] + 4) & 0xff;
      } else {
        sprite.subpriority = u16(sprite.data[5] - 0x40) <= 0x7f ? 128 : 140;
        sprite.data[5] = (sprite.data[5] - 4) & 0xff;
      }
      if (sprite.data[0] <= 0) {
        sprite.data[0] = 0x300;
        sprite.data[1] = sprite.x += sprite.x2;
        sprite.data[3] = sprite.y += sprite.y2;
        sprite.data[4] = sprite.y + 4;
        if (runtime.contest) sprite.data[2] = -0x10;
        else if (getBattlerSide(runtime, runtime.battleAnimTarget) !== B_SIDE_PLAYER) sprite.data[2] = 0x100;
        else sprite.data[2] = -0x10;
        ++sprite.data[7];
        sprite.x2 = 0;
        sprite.y2 = 0;
        initAnimLinearTranslationWithSpeed(sprite);
      }
      break;
    case 2:
      if (animTranslateLinear(sprite)) {
        if (sprite.oam.affineMode & 1) sprite.oam.affineMode = ST_OAM_AFFINE_OFF;
        destroySprite(sprite);
        --runtime.animVisualTaskCount;
      }
      break;
  }
}

export function AnimTask_Hail(runtime: IceRuntime, taskId: number): void {
  runtime.tasks[taskId]!.func = 'AnimTask_Hail2';
}

export function AnimTask_Hail2(runtime: IceRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      if (++task.data[4] > 2) {
        task.data[4] = 0;
        task.data[5] = 0;
        task.data[2] = 0;
        ++task.data[0];
      }
      break;
    case 1:
      if (task.data[5] === 0) {
        if (GenerateHailParticle(runtime, task.data[3], task.data[2], taskId, 1)) ++task.data[1];
        if (++task.data[2] === 3) {
          if (++task.data[3] === 10) ++task.data[0];
          else --task.data[0];
        } else task.data[5] = 1;
      } else --task.data[5];
      break;
    case 2:
      if (task.data[1] === 0) destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function GenerateHailParticle(runtime: IceRuntime, hailStructId: number, affineAnimNum: number, taskId: number, c: number): boolean {
  const data = sHailCoordData[hailStructId];
  let battlerX: number;
  let battlerY: number;
  let possibleBool = false;
  if (data.unk3 !== 2) {
    const id = runtime.battlerAtPosition[data.bPosition];
    if (isBattlerSpriteVisible(runtime, id)) {
      possibleBool = true;
      battlerX = getBattlerSpriteCoord(runtime, id, 'x2');
      battlerY = getBattlerSpriteCoord(runtime, id, 'yPicOffset');
      if (data.unk3 === 0) {
        battlerX -= div(getBattlerSpriteCoord(runtime, id, 'width'), 6);
        battlerY -= div(getBattlerSpriteCoord(runtime, id, 'height'), 6);
      } else if (data.unk3 === 1) {
        battlerX += div(getBattlerSpriteCoord(runtime, id, 'width'), 6);
        battlerY += div(getBattlerSpriteCoord(runtime, id, 'height'), 6);
      }
    } else {
      battlerX = data.x;
      battlerY = data.y;
    }
  } else {
    battlerX = data.x;
    battlerY = data.y;
  }
  const spriteX = battlerX - div(battlerY + 8, 2);
  const id = createSprite(runtime, sHailParticleSpriteTemplate, spriteX, -8, 18);
  if (id === MAX_SPRITES) return false;
  startSpriteAffineAnim(runtime.sprites[id], affineAnimNum);
  runtime.sprites[id].data[0] = possibleBool ? 1 : 0;
  runtime.sprites[id].data[3] = battlerX;
  runtime.sprites[id].data[4] = battlerY;
  runtime.sprites[id].data[5] = affineAnimNum;
  runtime.sprites[id].data[6] = taskId;
  runtime.sprites[id].data[7] = c;
  return true;
}

export function AnimHailBegin(runtime: IceRuntime, sprite: IceSprite): void {
  sprite.x += 4;
  sprite.y += 8;
  if (sprite.x < sprite.data[3] && sprite.y < sprite.data[4]) return;
  if (sprite.data[0] === 1 && sprite.data[5] === 0) {
    const spriteId = createSprite(runtime, gIceCrystalHitLargeSpriteTemplate, sprite.data[3], sprite.data[4], sprite.subpriority);
    sprite.data[0] = spriteId;
    if (spriteId !== MAX_SPRITES) {
      runtime.sprites[sprite.data[0]].callback = 'AnimHailContinue';
      runtime.sprites[sprite.data[0]].data[6] = sprite.data[6];
      runtime.sprites[sprite.data[0]].data[7] = sprite.data[7];
    }
    destroySprite(sprite);
  } else {
    --runtime.tasks[sprite.data[6]]!.data[sprite.data[7]];
    destroySprite(sprite);
  }
}

export function AnimHailContinue(runtime: IceRuntime, sprite: IceSprite): void {
  if (++sprite.data[0] === 20) {
    --runtime.tasks[sprite.data[6]]!.data[sprite.data[7]];
    destroySprite(sprite);
  }
}

export function InitIceBallAnim(runtime: IceRuntime, sprite: IceSprite): void {
  let animNum = runtime.rolloutTimerStartValue - runtime.rolloutTimer - 1;
  if (animNum > 4) animNum = 4;
  startSpriteAffineAnim(sprite, animNum);
  initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[0] = runtime.battleAnimArgs[4];
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + runtime.battleAnimArgs[2];
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[3];
  sprite.data[5] = runtime.battleAnimArgs[5];
  initAnimArcTranslation(sprite);
  sprite.callback = 'AnimThrowIceBall';
}

export function AnimThrowIceBall(sprite: IceSprite): void {
  if (translateAnimHorizontalArc(sprite)) {
    startSpriteAnim(sprite, 1);
    sprite.callback = 'RunStoredCallbackWhenAnimEnds';
    storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  }
}

export function InitIceBallParticle(runtime: IceRuntime, sprite: IceSprite): void {
  sprite.oam.tileNum += 8;
  initSpritePosToAnimTarget(runtime, sprite);
  const randA = (random(runtime) & 0xff) + 256;
  let randB = random(runtime) & 0x1ff;
  if (randB > 0xff) randB = 256 - randB;
  sprite.data[1] = randA;
  sprite.data[2] = randB;
  sprite.callback = 'AnimIceBallParticle';
}

export function AnimIceBallParticle(sprite: IceSprite): void {
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  sprite.x2 = sprite.data[1] & 1 ? -(sprite.data[3] >> 8) : sprite.data[3] >> 8;
  sprite.y2 = sprite.data[4] >> 8;
  if (++sprite.data[0] === 21) destroyAnimSprite(sprite);
}

export function AnimTask_GetRolloutCounter(runtime: IceRuntime, taskId: number): void {
  const arg = runtime.battleAnimArgs[0];
  runtime.battleAnimArgs[arg] = runtime.rolloutTimerStartValue - runtime.rolloutTimer - 1;
  destroyAnimVisualTask(runtime, taskId);
}

export const animUnusedIceCrystalThrow = AnimUnusedIceCrystalThrow;
export const animUnusedIceCrystalThrowStep = AnimUnusedIceCrystalThrow_Step;
export const animIcePunchSwirlingParticle = AnimIcePunchSwirlingParticle;
export const animIceBeamParticle = AnimIceBeamParticle;
export const animIceEffectParticle = AnimIceEffectParticle;
export const animFlickerIceEffectParticle = AnimFlickerIceEffectParticle;
export const animSwirlingSnowball = AnimSwirlingSnowball;
export const animSwirlingSnowballStep1 = AnimSwirlingSnowball_Step1;
export const animSwirlingSnowballStep2 = AnimSwirlingSnowball_Step2;
export const animSwirlingSnowballEnd = AnimSwirlingSnowball_End;
export const animMoveParticleBeyondTarget = AnimMoveParticleBeyondTarget;
export const animWiggleParticleTowardsTarget = AnimWiggleParticleTowardsTarget;
export const animWaveFromCenterOfTarget = AnimWaveFromCenterOfTarget;
export const initSwirlingFogAnim = InitSwirlingFogAnim;
export const animSwirlingFogAnim = AnimSwirlingFogAnim;
export const animTaskHazeScrollingFog = AnimTask_HazeScrollingFog;
export const animTaskHazeScrollingFogStep = AnimTask_HazeScrollingFog_Step;
export const animThrowMistBall = AnimThrowMistBall;
export const animTaskMistBallFog = AnimTask_MistBallFog;
export const animTaskMistBallFogStep = AnimTask_MistBallFog_Step;
export const initPoisonGasCloudAnim = InitPoisonGasCloudAnim;
export const movePoisonGasCloud = MovePoisonGasCloud;
export const animTaskHail = AnimTask_Hail;
export const animTaskHail2 = AnimTask_Hail2;
export const generateHailParticle = GenerateHailParticle;
export const animHailBegin = AnimHailBegin;
export const animHailContinue = AnimHailContinue;
export const initIceBallAnim = InitIceBallAnim;
export const animThrowIceBall = AnimThrowIceBall;
export const initIceBallParticle = InitIceBallParticle;
export const animIceBallParticle = AnimIceBallParticle;
export const animTaskGetRolloutCounter = AnimTask_GetRolloutCounter;

const div = (a: number, b: number): number => Math.trunc(a / b);
const u16 = (value: number): number => value & 0xffff;
const u32 = (value: number): number => value >>> 0;
const bldalpha = (a: number, b: number): number => (a & 0x1f) | ((b & 0x1f) << 8);
const random = (runtime: IceRuntime): number => runtime.randomValues.length ? runtime.randomValues.shift()! : 0;
const getBattlerSide = (runtime: IceRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const getBattlerSpriteCoord = (runtime: IceRuntime, battler: number, key: keyof IceRuntime['battlerCoords'][number]): number => runtime.battlerCoords[battler][key];
const getBattlerSpriteBgPriority = (runtime: IceRuntime, battler: number): number => runtime.battlerBgPriority[battler] ?? 0;
const getAnimBattlerSpriteId = (runtime: IceRuntime, battlerKind: number): number => runtime.battlerSpriteIds[battlerKind === ANIM_ATTACKER ? runtime.battleAnimAttacker : runtime.battleAnimTarget] ?? 0;
const isBattlerSpriteVisible = (runtime: IceRuntime, battler: number): boolean => runtime.battlerVisible[battler] ?? false;
const initSpritePosToAnimAttacker = (runtime: IceRuntime, sprite: IceSprite, useArgs = true): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') + (useArgs ? runtime.battleAnimArgs[0] : 0);
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset') + (useArgs ? runtime.battleAnimArgs[1] : 0);
};
const initSpritePosToAnimTarget = (runtime: IceRuntime, sprite: IceSprite, useArgs = true): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + (useArgs ? runtime.battleAnimArgs[0] : 0);
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + (useArgs ? runtime.battleAnimArgs[1] : 0);
};
const setAverageBattlerPositions = (runtime: IceRuntime, battler: number, sprite: IceSprite, dataDestination: boolean): void => {
  const x = getBattlerSpriteCoord(runtime, battler, 'x');
  const y = getBattlerSpriteCoord(runtime, battler, 'y');
  if (dataDestination) {
    sprite.data[2] = x;
    sprite.data[4] = y;
  } else {
    sprite.x = x;
    sprite.y = y;
  }
};
const storeSpriteCallbackInData6 = (sprite: IceSprite, callback: IceCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const destroyAnimSprite = (sprite: IceSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const destroySprite = (sprite: IceSprite): void => {
  sprite.destroyed = true;
};
const destroySpriteAndMatrix = (sprite: IceSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroySpriteAndMatrix';
  sprite.oam.affineMode = ST_OAM_AFFINE_OFF;
};
const destroyAnimVisualTask = (runtime: IceRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};
const startSpriteAffineAnim = (sprite: IceSprite, animNum: number): void => {
  sprite.affineAnimNum = animNum;
};
const startSpriteAnim = (sprite: IceSprite, animNum: number): void => {
  sprite.animNum = animNum;
};
const createSprite = (runtime: IceRuntime, spriteTemplate: IceSpriteTemplate, x: number, y: number, subpriority: number): number => {
  const id = runtime.sprites.findIndex((sprite, index) => index >= 4 && (sprite.destroyed || sprite.callback === 'DestroyAnimSprite'));
  const spriteId = id === -1 ? runtime.sprites.length : id;
  if (spriteId >= MAX_SPRITES) return MAX_SPRITES;
  const sprite = createIceSprite();
  sprite.x = x;
  sprite.y = y;
  sprite.subpriority = subpriority;
  sprite.callback = spriteTemplate.callback;
  runtime.sprites[spriteId] = sprite;
  runtime.operations.push(`CreateSprite:${spriteTemplate.callback}:${x}:${y}:${subpriority}`);
  return spriteId;
};
const setGpuReg = (runtime: IceRuntime, reg: string, value: number): void => {
  runtime.registers[reg] = value;
  runtime.operations.push(`SetGpuReg:${reg}:${value}`);
};
const setAnimBgAttribute = (runtime: IceRuntime, bg: number, attr: string, value: number): void => {
  runtime.operations.push(`SetAnimBgAttribute:${bg}:${attr}:${value}`);
};
const initBattleAnimBg = (runtime: IceRuntime, bg: number): void => {
  runtime.operations.push(`InitBattleAnimBg:${bg}`);
};
const setupFogBackground = (runtime: IceRuntime, mist: boolean): void => {
  setGpuReg(runtime, 'BLDCNT', 0x0002 | 0x40 | 0x3f00);
  setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 16));
  setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 1);
  setAnimBgAttribute(runtime, 1, 'BG_ANIM_SCREEN_SIZE', 0);
  if (!runtime.contest) setAnimBgAttribute(runtime, 1, 'BG_ANIM_CHAR_BASE_BLOCK', 1);
  runtime.battleBg1X = 0;
  runtime.battleBg1Y = 0;
  setGpuReg(runtime, 'BG1HOFS', 0);
  setGpuReg(runtime, 'BG1VOFS', 0);
  runtime.operations.push(mist ? 'LoadMistBallFogBg' : 'LoadHazeScrollingFogBg');
};
const convertPosDataToTranslateLinearData = (sprite: IceSprite): void => {
  const x = sprite.data[2] - sprite.data[1];
  const y = sprite.data[4] - sprite.data[3];
  sprite.data[1] = div(x, sprite.data[0]);
  sprite.data[2] = div(y, sprite.data[0]);
  sprite.data[5] = 0;
  sprite.data[6] = 0;
};
const initAnimLinearTranslation = (sprite: IceSprite): void => {
  const x = sprite.data[2] - sprite.data[1];
  const y = sprite.data[4] - sprite.data[3];
  const movingLeft = x < 0;
  const movingUp = y < 0;
  let xDelta = div(Math.abs(x) << 8, sprite.data[0]) & 0xffff;
  let yDelta = div(Math.abs(y) << 8, sprite.data[0]) & 0xffff;
  xDelta = movingLeft ? xDelta | 1 : xDelta & ~1;
  yDelta = movingUp ? yDelta | 1 : yDelta & ~1;
  sprite.data[1] = xDelta;
  sprite.data[2] = yDelta;
  sprite.data[4] = 0;
  sprite.data[3] = 0;
};
const initAnimLinearTranslationWithSpeed = initAnimLinearTranslation;
const animTranslateLinear = (sprite: IceSprite): boolean => {
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
const initAnimFastLinearTranslationWithSpeed = initAnimLinearTranslation;
const animFastTranslateLinear = animTranslateLinear;
const translateSpriteInGrowingCircle = (sprite: IceSprite): void => {
  sprite.x2 = sin(sprite.data[0], sprite.data[1]);
  sprite.y2 = cos(sprite.data[0], sprite.data[1]);
  sprite.data[0] = (sprite.data[0] + sprite.data[2]) & 0xff;
  sprite.data[1] += sprite.data[4] >> 8;
};
const initAnimArcTranslation = (sprite: IceSprite): void => {
  initAnimLinearTranslation(sprite);
  sprite.data[6] = 0;
  sprite.data[7] = 0;
};
const translateAnimHorizontalArc = (sprite: IceSprite): boolean => {
  const done = animTranslateLinear(sprite);
  sprite.y2 += sin(sprite.data[7], sprite.data[5]);
  sprite.data[7] = (sprite.data[7] + 8) & 0xff;
  return done;
};
const offscreen16 = (sprite: IceSprite): boolean => sprite.x + sprite.x2 > DISPLAY_WIDTH + 16 || sprite.x + sprite.x2 < -16 || sprite.y + sprite.y2 > DISPLAY_HEIGHT || sprite.y + sprite.y2 < -16;
