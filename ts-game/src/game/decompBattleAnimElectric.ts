import { cos, gSineTable, sin } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const ANIM_ATK_PARTNER = 2;
export const ANIM_DEF_PARTNER = 3;
export const MAX_SPRITES = 64;
export const DISPLAY_WIDTH = 240;
export const ST_OAM_HFLIP = 1;
export const ST_OAM_VFLIP = 2;
export const SOUND_PAN_ATTACKER = -64;
export const SOUND_PAN_TARGET = 63;
export const SE_M_THUNDERBOLT = 'SE_M_THUNDERBOLT';

export type ElectricCallback =
  | 'AnimLightning'
  | 'AnimLightning_Step'
  | 'AnimUnusedSpinningFist'
  | 'AnimUnusedSpinningFist_Step'
  | 'AnimUnusedCirclingShock'
  | 'AnimSparkElectricity'
  | 'AnimZapCannonSpark'
  | 'AnimZapCannonSpark_Step'
  | 'TranslateAnimSpriteToTargetMonLocation'
  | 'AnimThunderboltOrb'
  | 'AnimThunderboltOrb_Step'
  | 'AnimSparkElectricityFlashing'
  | 'AnimSparkElectricityFlashing_Step'
  | 'AnimElectricity'
  | 'AnimElectricBoltSegment'
  | 'AnimThunderWave'
  | 'AnimThunderWave_Step'
  | 'AnimElectricChargingParticles'
  | 'AnimElectricChargingParticles_Step'
  | 'AnimGrowingChargeOrb'
  | 'AnimElectricPuff'
  | 'AnimVoltTackleOrbSlide'
  | 'AnimVoltTackleOrbSlide_Step'
  | 'AnimVoltTackleBolt'
  | 'AnimGrowingShockWaveOrb'
  | 'AnimShockWaveProgressingBolt'
  | 'AnimShockWaveLightning'
  | 'TranslateSpriteInCircle'
  | 'DestroyAnimSpriteAfterTimer'
  | 'WaitAnimForDuration'
  | 'RunStoredCallbackWhenAnimEnds'
  | 'RunStoredCallbackWhenAffineAnimEnds'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix'
  | 'SpriteCallbackDummy';

export type ElectricTaskFunc =
  | 'AnimTask_ElectricBolt_Step'
  | 'AnimTask_ElectricChargingParticles_Step'
  | 'AnimTask_VoltTackleAttackerReappear'
  | 'AnimTask_VoltTackleBolt'
  | 'AnimTask_ShockWaveProgressingBolt'
  | 'AnimTask_ShockWaveLightning'
  | 'DestroyAnimVisualTask';

export interface ElectricSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: ElectricCallback;
}

export interface ElectricSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: ElectricCallback;
  storedCallback: ElectricCallback | null;
  invisible: boolean;
  destroyed: boolean;
  animEnded: boolean;
  affineAnimEnded: boolean;
  animIndex: number;
  affineAnimIndex: number;
  subpriority: number;
  oam: {
    priority: number;
    matrixNum: number;
    tileNum: number;
    shape: string;
    size: string;
  };
  matrix: {
    a: number;
    b: number;
    c: number;
    d: number;
  };
}

export interface ElectricTask {
  data: number[];
  func: ElectricTaskFunc;
  destroyed: boolean;
}

export interface ElectricRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  contest: boolean;
  battlerSides: Record<number, number>;
  battlerVisible: Record<number, boolean>;
  battlerSpriteIds: Record<number, number>;
  battlerBgPriorities: Record<number, number>;
  battlerSubpriorities: Record<number, number>;
  battlerCoords: Record<number, { x: number; y: number; x2: number; yPicOffset: number }>;
  sprites: ElectricSprite[];
  tasks: Array<ElectricTask | null>;
  animVisualTaskCount: number;
  operations: string[];
  sounds: Array<{ song: string; pan: number }>;
}

const frame = (tileOffset: number, duration: number, flags: Record<string, boolean> = {}) => ({ tileOffset, duration, ...flags });
const affineFrame = (xScale: number, yScale: number, rotation: number, duration: number) => ({ xScale, yScale, rotation, duration });

export const sAnimLightning = [frame(0, 5), frame(16, 5), frame(32, 8), frame(48, 5), frame(64, 5), { end: true }] as const;
export const sAnimsLightning = [sAnimLightning] as const;
export const sAffineAnimUnusedSpinningFist = [affineFrame(0x100, 0x100, 0, 0), affineFrame(0, 0, 0, 20), affineFrame(0, 0, -16, 60), { end: true }] as const;
export const sAffineAnimsUnusedSpinningFist = [sAffineAnimUnusedSpinningFist] as const;
export const sAnimUnusedCirclingShock = [frame(0, 5), frame(16, 5), frame(32, 5), frame(48, 5), frame(64, 5), frame(80, 5), { jump: 0 }] as const;
export const sAnimsUnusedCirclingShock = [sAnimUnusedCirclingShock] as const;
export const sAffineAnimFlashingSpark = [affineFrame(0, 0, 20, 1), { jump: 0 }] as const;
export const sAffineAnimsFlashingSpark = [sAffineAnimFlashingSpark] as const;
export const sAnimThunderboltOrb = [frame(0, 6), frame(16, 6), frame(32, 6), { jump: 0 }] as const;
export const sAnimsThunderboltOrb = [sAnimThunderboltOrb] as const;
export const sAffineAnimThunderboltOrb = [affineFrame(0xe8, 0xe8, 0, 0), affineFrame(-0x8, -0x8, 0, 10), affineFrame(0x8, 0x8, 0, 10), { jump: 1 }] as const;
export const sAffineAnimsThunderboltOrb = [sAffineAnimThunderboltOrb] as const;
export const sElectricChargingParticleCoordOffsets = [
  [58, -60], [-56, -36], [8, -56], [-16, 56], [58, -10], [-58, 10], [48, -18], [-8, 56],
  [16, -56], [-58, -42], [58, 30], [-48, 40], [12, -48], [48, -12], [-56, 18], [48, 48]
] as const;
export const sAnimElectricChargingParticles0 = [frame(3, 1), frame(2, 1), frame(1, 1), frame(0, 1), { end: true }] as const;
export const sAnimElectricChargingParticles1 = [frame(0, 5), frame(1, 5), frame(2, 5), frame(3, 5), { end: true }] as const;
export const sAnimsElectricChargingParticles = [sAnimElectricChargingParticles0, sAnimElectricChargingParticles1] as const;
export const sAffineAnimGrowingElectricOrb0 = [affineFrame(0x10, 0x10, 0, 0), affineFrame(0x4, 0x4, 0, 60), affineFrame(0x100, 0x100, 0, 0), { loop: 0 }, affineFrame(-0x4, -0x4, 0, 5), affineFrame(0x4, 0x4, 0, 5), { loop: 10 }, { end: true }] as const;
export const sAffineAnimGrowingElectricOrb1 = [affineFrame(0x10, 0x10, 0, 0), affineFrame(0x8, 0x8, 0, 30), affineFrame(0x100, 0x100, 0, 0), affineFrame(-0x4, -0x4, 0, 5), affineFrame(0x4, 0x4, 0, 5), { jump: 3 }] as const;
export const sAffineAnimGrowingElectricOrb2 = [affineFrame(0x10, 0x10, 0, 0), affineFrame(0x8, 0x8, 0, 30), affineFrame(-0x8, -0x8, 0, 30), { end: true }] as const;
export const sAffineAnimsGrowingElectricOrb = [sAffineAnimGrowingElectricOrb0, sAffineAnimGrowingElectricOrb1, sAffineAnimGrowingElectricOrb2] as const;
export const sAnimElectricPuff = [frame(0, 3), frame(16, 3), frame(32, 3), frame(48, 3), { end: true }] as const;
export const sAnimsElectricPuff = [sAnimElectricPuff] as const;
export const sAnimVoltTackleBolt0 = [frame(0, 3), { end: true }] as const;
export const sAnimVoltTackleBolt1 = [frame(2, 3), { end: true }] as const;
export const sAnimVoltTackleBolt2 = [frame(4, 3), { end: true }] as const;
export const sAnimVoltTackleBolt3 = [frame(6, 3), { end: true }] as const;
export const sAnimsVoltTackleBolt = [sAnimVoltTackleBolt0, sAnimVoltTackleBolt1, sAnimVoltTackleBolt2, sAnimVoltTackleBolt3] as const;
export const sAffineAnimVoltTackleBolt = [affineFrame(0x100, 0x100, 64, 0), { end: true }] as const;
export const sAffineAnimsVoltTackleBolt = [sAffineAnimVoltTackleBolt] as const;

const template = (tileTag: string, oam: string, anims: readonly unknown[] | string, affineAnims: readonly unknown[] | string, callback: ElectricCallback): ElectricSpriteTemplate => ({
  tileTag,
  paletteTag: tileTag,
  oam,
  anims,
  images: null,
  affineAnims,
  callback
});

export const gLightningSpriteTemplate = template('ANIM_TAG_LIGHTNING', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsLightning, 'gDummySpriteAffineAnimTable', 'AnimLightning');
export const sUnusedSpinningFistSpriteTemplate = template('ANIM_TAG_HANDS_AND_FEET', 'gOamData_AffineNormal_ObjNormal_32x32', 'gDummySpriteAnimTable', sAffineAnimsUnusedSpinningFist, 'AnimUnusedSpinningFist');
export const sUnusedCirclingShockSpriteTemplate = template('ANIM_TAG_SHOCK', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsUnusedCirclingShock, 'gDummySpriteAffineAnimTable', 'AnimUnusedCirclingShock');
export const gSparkElectricitySpriteTemplate = template('ANIM_TAG_SPARK_2', 'gOamData_AffineNormal_ObjNormal_16x16', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimSparkElectricity');
export const gZapCannonBallSpriteTemplate = template('ANIM_TAG_BLACK_BALL_2', 'gOamData_AffineOff_ObjNormal_16x16', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'TranslateAnimSpriteToTargetMonLocation');
export const gZapCannonSparkSpriteTemplate = template('ANIM_TAG_SPARK_2', 'gOamData_AffineNormal_ObjNormal_16x16', 'gDummySpriteAnimTable', sAffineAnimsFlashingSpark, 'AnimZapCannonSpark');
export const gThunderboltOrbSpriteTemplate = template('ANIM_TAG_SHOCK_3', 'gOamData_AffineNormal_ObjNormal_32x32', sAnimsThunderboltOrb, sAffineAnimsThunderboltOrb, 'AnimThunderboltOrb');
export const gSparkElectricityFlashingSpriteTemplate = template('ANIM_TAG_SPARK_2', 'gOamData_AffineNormal_ObjNormal_16x16', 'gDummySpriteAnimTable', sAffineAnimsFlashingSpark, 'AnimSparkElectricityFlashing');
export const gElectricitySpriteTemplate = template('ANIM_TAG_SPARK_2', 'gOamData_AffineOff_ObjNormal_16x16', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimElectricity');
export const sElectricBoltSegmentSpriteTemplate = template('ANIM_TAG_SPARK', 'gOamData_AffineOff_ObjNormal_8x8', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimElectricBoltSegment');
export const gThunderWaveSpriteTemplate = template('ANIM_TAG_SPARK_H', 'gOamData_AffineOff_ObjNormal_32x16', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimThunderWave');
export const gElectricChargingParticlesSpriteTemplate = template('ANIM_TAG_ELECTRIC_ORBS', 'gOamData_AffineOff_ObjNormal_8x8', sAnimsElectricChargingParticles, 'gDummySpriteAffineAnimTable', 'SpriteCallbackDummy');
export const gGrowingChargeOrbSpriteTemplate = template('ANIM_TAG_CIRCLE_OF_LIGHT', 'gOamData_AffineNormal_ObjBlend_64x64', 'gDummySpriteAnimTable', sAffineAnimsGrowingElectricOrb, 'AnimGrowingChargeOrb');
export const gElectricPuffSpriteTemplate = template('ANIM_TAG_ELECTRICITY', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsElectricPuff, 'gDummySpriteAffineAnimTable', 'AnimElectricPuff');
export const gVoltTackleOrbSlideSpriteTemplate = template('ANIM_TAG_CIRCLE_OF_LIGHT', 'gOamData_AffineNormal_ObjBlend_64x64', 'gDummySpriteAnimTable', sAffineAnimsGrowingElectricOrb, 'AnimVoltTackleOrbSlide');
export const gVoltTackleBoltSpriteTemplate = template('ANIM_TAG_SPARK', 'gOamData_AffineDouble_ObjNormal_8x16', sAnimsVoltTackleBolt, sAffineAnimsVoltTackleBolt, 'AnimVoltTackleBolt');
export const gGrowingShockWaveOrbSpriteTemplate = template('ANIM_TAG_CIRCLE_OF_LIGHT', 'gOamData_AffineNormal_ObjBlend_64x64', 'gDummySpriteAnimTable', sAffineAnimsGrowingElectricOrb, 'AnimGrowingShockWaveOrb');
export const sShockWaveProgressingBoltSpriteTemplate = template('ANIM_TAG_SPARK', 'gOamData_AffineOff_ObjNormal_8x8', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimShockWaveProgressingBolt');

export const createElectricSprite = (): ElectricSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 16 }, () => 0),
  callback: 'SpriteCallbackDummy',
  storedCallback: null,
  invisible: false,
  destroyed: false,
  animEnded: false,
  affineAnimEnded: false,
  animIndex: 0,
  affineAnimIndex: 0,
  subpriority: 0,
  oam: { priority: 0, matrixNum: 0, tileNum: 0, shape: '', size: '' },
  matrix: { a: 0, b: 0, c: 0, d: 0 }
});

export const createElectricRuntime = (overrides: Partial<ElectricRuntime> = {}): ElectricRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  contest: overrides.contest ?? false,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerVisible: overrides.battlerVisible ?? { 0: true, 1: true, 2: true, 3: true },
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerBgPriorities: overrides.battlerBgPriorities ?? { 0: 1, 1: 2, 2: 1, 3: 2 },
  battlerSubpriorities: overrides.battlerSubpriorities ?? { 0: 30, 1: 28, 2: 30, 3: 28 },
  battlerCoords: overrides.battlerCoords ?? {
    0: { x: 48, y: 72, x2: 48, yPicOffset: 64 },
    1: { x: 176, y: 48, x2: 176, yPicOffset: 48 },
    2: { x: 80, y: 80, x2: 80, yPicOffset: 72 },
    3: { x: 144, y: 40, x2: 144, yPicOffset: 40 }
  },
  sprites: overrides.sprites ?? Array.from({ length: MAX_SPRITES }, () => createElectricSprite()),
  tasks: overrides.tasks ?? [],
  animVisualTaskCount: overrides.animVisualTaskCount ?? 0,
  operations: overrides.operations ?? [],
  sounds: overrides.sounds ?? []
});

export const createElectricTask = (runtime: ElectricRuntime, func: ElectricTaskFunc = 'DestroyAnimVisualTask'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), func, destroyed: false });
  return id;
};

export function AnimLightning(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) sprite.x -= runtime.battleAnimArgs[0];
  else sprite.x += runtime.battleAnimArgs[0];
  sprite.y += runtime.battleAnimArgs[1];
  sprite.callback = 'AnimLightning_Step';
}

export function AnimLightning_Step(sprite: ElectricSprite): void {
  if (sprite.animEnded) destroyAnimSprite(sprite);
}

export function AnimUnusedSpinningFist(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) sprite.x -= runtime.battleAnimArgs[0];
  else sprite.x += runtime.battleAnimArgs[0];
  sprite.callback = 'AnimUnusedSpinningFist_Step';
}

export function AnimUnusedSpinningFist_Step(sprite: ElectricSprite): void {
  if (sprite.affineAnimEnded) destroySpriteAndMatrix(sprite);
}

export function AnimUnusedCirclingShock(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.x -= runtime.battleAnimArgs[0];
    sprite.y -= runtime.battleAnimArgs[1];
  } else {
    sprite.x += runtime.battleAnimArgs[0];
    sprite.y += runtime.battleAnimArgs[1];
  }
  sprite.data[0] = 0;
  sprite.data[1] = runtime.battleAnimArgs[2];
  sprite.data[2] = runtime.battleAnimArgs[3];
  sprite.data[3] = runtime.battleAnimArgs[4];
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
  sprite.callback = 'TranslateSpriteInCircle';
}

export function AnimSparkElectricity(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  let battler: number;
  switch (runtime.battleAnimArgs[4]) {
    case ANIM_ATTACKER:
      battler = runtime.battleAnimAttacker;
      break;
    case ANIM_ATK_PARTNER:
      battler = !isBattlerSpriteVisible(runtime, battlePartner(runtime.battleAnimAttacker)) ? runtime.battleAnimAttacker : battlePartner(runtime.battleAnimAttacker);
      break;
    case ANIM_DEF_PARTNER:
      battler = isBattlerSpriteVisible(runtime, battlePartner(runtime.battleAnimAttacker)) ? battlePartner(runtime.battleAnimTarget) : runtime.battleAnimTarget;
      break;
    case ANIM_TARGET:
    default:
      battler = runtime.battleAnimTarget;
      break;
  }
  if (runtime.battleAnimArgs[5] === 0) {
    sprite.x = getBattlerSpriteCoord(runtime, battler, 'x');
    sprite.y = getBattlerSpriteCoord(runtime, battler, 'y');
  } else {
    sprite.x = getBattlerSpriteCoord(runtime, battler, 'x2');
    sprite.y = getBattlerSpriteCoord(runtime, battler, 'yPicOffset');
  }
  sprite.x2 = (gSineTable[runtime.battleAnimArgs[0]] * runtime.battleAnimArgs[1]) >> 8;
  sprite.y2 = (gSineTable[runtime.battleAnimArgs[0] + 64] * runtime.battleAnimArgs[1]) >> 8;
  if (runtime.battleAnimArgs[6] & 1) sprite.oam.priority = getBattlerSpriteBgPriority(runtime, battler) + 1;
  const sineVal = gSineTable[runtime.battleAnimArgs[2]];
  sprite.matrix.a = sprite.matrix.d = gSineTable[runtime.battleAnimArgs[2] + 64];
  sprite.matrix.b = sineVal;
  sprite.matrix.c = -sineVal;
  sprite.data[0] = runtime.battleAnimArgs[3];
  sprite.callback = 'DestroyAnimSpriteAfterTimer';
}

export function AnimZapCannonSpark(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite, true);
  sprite.data[0] = runtime.battleAnimArgs[3];
  sprite.data[1] = sprite.x;
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  sprite.data[3] = sprite.y;
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  initAnimLinearTranslation(sprite);
  sprite.data[5] = runtime.battleAnimArgs[2];
  sprite.data[6] = runtime.battleAnimArgs[5];
  sprite.data[7] = runtime.battleAnimArgs[4];
  sprite.oam.tileNum += runtime.battleAnimArgs[6] * 4;
  sprite.callback = 'AnimZapCannonSpark_Step';
  AnimZapCannonSpark_Step(sprite);
}

export function AnimZapCannonSpark_Step(sprite: ElectricSprite): void {
  if (!animTranslateLinear(sprite)) {
    sprite.x2 += sin(sprite.data[7], sprite.data[5]);
    sprite.y2 += cos(sprite.data[7], sprite.data[5]);
    sprite.data[7] = (sprite.data[7] + sprite.data[6]) & 0xff;
    if (!(sprite.data[7] % 3)) sprite.invisible = !sprite.invisible;
  } else {
    destroyAnimSprite(sprite);
  }
}

export function AnimThunderboltOrb(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  if (runtime.contest || getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER) runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + runtime.battleAnimArgs[1];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[2];
  sprite.data[3] = runtime.battleAnimArgs[0];
  sprite.data[4] = runtime.battleAnimArgs[3];
  sprite.data[5] = runtime.battleAnimArgs[3];
  sprite.callback = 'AnimThunderboltOrb_Step';
}

export function AnimThunderboltOrb_Step(sprite: ElectricSprite): void {
  if (--sprite.data[5] === -1) {
    sprite.invisible = !sprite.invisible;
    sprite.data[5] = sprite.data[4];
  }
  if (sprite.data[3]-- <= 0) destroyAnimSprite(sprite);
}

export function AnimSparkElectricityFlashing(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  sprite.data[0] = runtime.battleAnimArgs[3];
  const battler = runtime.battleAnimArgs[7] & 0x8000 ? runtime.battleAnimTarget : runtime.battleAnimAttacker;
  if (runtime.contest || getBattlerSide(runtime, battler) === B_SIDE_PLAYER) runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
  sprite.x = getBattlerSpriteCoord(runtime, battler, 'x2') + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, battler, 'yPicOffset') + runtime.battleAnimArgs[1];
  sprite.data[4] = runtime.battleAnimArgs[7] & 0x7fff;
  sprite.data[5] = runtime.battleAnimArgs[2];
  sprite.data[6] = runtime.battleAnimArgs[5];
  sprite.data[7] = runtime.battleAnimArgs[4];
  sprite.oam.tileNum += runtime.battleAnimArgs[6] * 4;
  sprite.callback = 'AnimSparkElectricityFlashing_Step';
  AnimSparkElectricityFlashing_Step(sprite);
}

export function AnimSparkElectricityFlashing_Step(sprite: ElectricSprite): void {
  sprite.x2 = sin(sprite.data[7], sprite.data[5]);
  sprite.y2 = cos(sprite.data[7], sprite.data[5]);
  sprite.data[7] = (sprite.data[7] + sprite.data[6]) & 0xff;
  if (sprite.data[7] % sprite.data[4] === 0) sprite.invisible = !sprite.invisible;
  if (sprite.data[0]-- <= 0) destroyAnimSprite(sprite);
}

export function AnimElectricity(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  initSpritePosToAnimTarget(runtime, sprite, false);
  sprite.oam.tileNum += runtime.battleAnimArgs[3] * 4;
  if (runtime.battleAnimArgs[3] === 1) sprite.oam.matrixNum = ST_OAM_HFLIP;
  else if (runtime.battleAnimArgs[3] === 2) sprite.oam.matrixNum = ST_OAM_VFLIP;
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.callback = 'WaitAnimForDuration';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimTask_ElectricBolt(runtime: ElectricRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x') + runtime.battleAnimArgs[0];
  task.data[1] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'y') + runtime.battleAnimArgs[1];
  task.data[2] = runtime.battleAnimArgs[2];
  task.func = 'AnimTask_ElectricBolt_Step';
}

export function AnimTask_ElectricBolt_Step(runtime: ElectricRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  let r8: number;
  let r2: number;
  let r12 = 16;
  let spriteId = 0;
  let r7 = 0;
  const sp = task.data[2];
  const x = task.data[0];
  const y = task.data[1];
  if (!task.data[2]) {
    r8 = 0;
    r2 = 1;
  } else {
    r8 = 8;
    r2 = 4;
  }
  switch (task.data[10]) {
    case 0:
      r12 *= 1;
      spriteId = createSprite(runtime, sElectricBoltSegmentSpriteTemplate, x, y + r12, 2);
      ++r7;
      break;
    case 2:
      r12 *= 2;
      r8 += r2;
      spriteId = createSprite(runtime, sElectricBoltSegmentSpriteTemplate, x, y + r12, 2);
      ++r7;
      break;
    case 4:
      r12 *= 3;
      r8 += r2 * 2;
      spriteId = createSprite(runtime, sElectricBoltSegmentSpriteTemplate, x, y + r12, 2);
      ++r7;
      break;
    case 6:
      r12 *= 4;
      r8 += r2 * 3;
      spriteId = createSprite(runtime, sElectricBoltSegmentSpriteTemplate, x, y + r12, 2);
      ++r7;
      break;
    case 8:
      r12 *= 5;
      spriteId = createSprite(runtime, sElectricBoltSegmentSpriteTemplate, x, y + r12, 2);
      ++r7;
      break;
    case 10:
      destroyAnimVisualTask(runtime, taskId);
      return;
  }
  if (r7 && spriteId !== MAX_SPRITES) {
    runtime.sprites[spriteId].oam.tileNum += r8;
    runtime.sprites[spriteId].data[0] = sp;
    AnimElectricBoltSegment(runtime.sprites[spriteId]);
  }
  ++task.data[10];
}

export function AnimElectricBoltSegment(sprite: ElectricSprite): void {
  if (!sprite.data[0]) {
    sprite.oam.shape = 'SPRITE_SHAPE(8x16)';
    sprite.oam.size = 'SPRITE_SIZE(8x16)';
  } else {
    sprite.oam.shape = 'SPRITE_SHAPE(16x16)';
    sprite.oam.size = 'SPRITE_SIZE(16x16)';
  }
  if (++sprite.data[1] === 15) destroySprite(sprite);
}

export function AnimThunderWave(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  sprite.x += runtime.battleAnimArgs[0];
  sprite.y += runtime.battleAnimArgs[1];
  const spriteId = createSprite(runtime, gThunderWaveSpriteTemplate, sprite.x + 32, sprite.y, sprite.subpriority);
  if (spriteId !== MAX_SPRITES) {
    runtime.sprites[spriteId].oam.tileNum += 8;
    ++runtime.animVisualTaskCount;
    runtime.sprites[spriteId].callback = 'AnimThunderWave_Step';
  }
  sprite.callback = 'AnimThunderWave_Step';
}

export function AnimThunderWave_Step(sprite: ElectricSprite): void {
  if (++sprite.data[0] === 3) {
    sprite.data[0] = 0;
    sprite.invisible = !sprite.invisible;
  }
  if (++sprite.data[1] === 51) destroyAnimSprite(sprite);
}

export function AnimTask_ElectricChargingParticles(runtime: ElectricRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (!runtime.battleAnimArgs[0]) {
    task.data[14] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
    task.data[15] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  } else {
    task.data[14] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
    task.data[15] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  }
  task.data[6] = runtime.battleAnimArgs[1];
  task.data[7] = 0;
  task.data[8] = 0;
  task.data[9] = 0;
  task.data[10] = 0;
  task.data[11] = runtime.battleAnimArgs[3];
  task.data[12] = 0;
  task.data[13] = runtime.battleAnimArgs[2];
  task.func = 'AnimTask_ElectricChargingParticles_Step';
}

export function AnimTask_ElectricChargingParticles_Step(runtime: ElectricRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[6]) {
    if (++task.data[12] > task.data[13]) {
      task.data[12] = 0;
      const spriteId = createSprite(runtime, gElectricChargingParticlesSpriteTemplate, task.data[14], task.data[15], 2);
      if (spriteId !== MAX_SPRITES) {
        const sprite = runtime.sprites[spriteId];
        sprite.x += sElectricChargingParticleCoordOffsets[task.data[9]][0];
        sprite.y += sElectricChargingParticleCoordOffsets[task.data[9]][1];
        sprite.data[0] = 40 - task.data[8] * 5;
        sprite.data[1] = sprite.x;
        sprite.data[2] = task.data[14];
        sprite.data[3] = sprite.y;
        sprite.data[4] = task.data[15];
        sprite.data[5] = taskId;
        initAnimLinearTranslation(sprite);
        storeSpriteCallbackInData6(sprite, 'AnimElectricChargingParticles');
        sprite.callback = 'RunStoredCallbackWhenAnimEnds';
        if (++task.data[9] > 15) task.data[9] = 0;
        if (++task.data[10] >= task.data[11]) {
          task.data[10] = 0;
          if (task.data[8] <= 5) ++task.data[8];
        }
        ++task.data[7];
        --task.data[6];
      }
    }
  } else if (task.data[7] === 0) {
    destroyAnimVisualTask(runtime, taskId);
  }
}

export function AnimElectricChargingParticles_Step(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  if (animTranslateLinear(sprite)) {
    --runtime.tasks[sprite.data[5]]!.data[7];
    destroySprite(sprite);
  }
}

export function AnimElectricChargingParticles(sprite: ElectricSprite): void {
  startSpriteAnim(sprite, 1);
  sprite.callback = 'AnimElectricChargingParticles_Step';
}

export function AnimGrowingChargeOrb(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  const battler = runtime.battleAnimArgs[0] === ANIM_ATTACKER ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  sprite.x = getBattlerSpriteCoord(runtime, battler, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, battler, 'yPicOffset');
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
  sprite.callback = 'RunStoredCallbackWhenAffineAnimEnds';
}

export function AnimElectricPuff(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  const battler = runtime.battleAnimArgs[0] === ANIM_ATTACKER ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  sprite.x = getBattlerSpriteCoord(runtime, battler, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, battler, 'yPicOffset');
  sprite.x2 = runtime.battleAnimArgs[1];
  sprite.y2 = runtime.battleAnimArgs[2];
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  sprite.callback = 'RunStoredCallbackWhenAnimEnds';
}

export function AnimVoltTackleOrbSlide(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  startSpriteAffineAnim(sprite, 1);
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  sprite.data[6] = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
  sprite.data[7] = 16;
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_OPPONENT) sprite.data[7] *= -1;
  sprite.callback = 'AnimVoltTackleOrbSlide_Step';
}

export function AnimVoltTackleOrbSlide_Step(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  switch (sprite.data[0]) {
    case 0:
      if (++sprite.data[1] > 40) ++sprite.data[0];
      break;
    case 1:
      sprite.x += sprite.data[7];
      runtime.sprites[sprite.data[6]].x2 += sprite.data[7];
      if (u16(sprite.x + 80) > 400) destroySpriteAndMatrix(sprite);
      break;
  }
}

export function AnimTask_VoltTackleAttackerReappear(runtime: ElectricRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      task.data[15] = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
      task.data[14] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
      if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER) {
        task.data[14] = -32;
        task.data[13] = 2;
      } else {
        task.data[14] = 32;
        task.data[13] = -2;
      }
      runtime.sprites[task.data[15]].x2 = task.data[14];
      ++task.data[0];
      break;
    case 1:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        runtime.sprites[task.data[15]].invisible = !runtime.sprites[task.data[15]].invisible;
        if (task.data[14]) {
          task.data[14] += task.data[13];
          runtime.sprites[task.data[15]].x2 = task.data[14];
        } else {
          ++task.data[0];
        }
      }
      break;
    case 2:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        runtime.sprites[task.data[15]].invisible = !runtime.sprites[task.data[15]].invisible;
        if (++task.data[2] === 8) ++task.data[0];
      }
      break;
    case 3:
      runtime.sprites[task.data[15]].invisible = false;
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimTask_VoltTackleBolt(runtime: ElectricRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      task.data[1] = getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER ? 1 : -1;
      switch (runtime.battleAnimArgs[0]) {
        case 0:
          task.data[3] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
          task.data[5] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
          task.data[4] = task.data[1] * 128 + 120;
          break;
        case 4:
          task.data[3] = 120 - task.data[1] * 128;
          task.data[5] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
          task.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') - task.data[1] * 32;
          break;
        default:
          if ((runtime.battleAnimArgs[0] & 1) !== 0) {
            task.data[3] = 256;
            task.data[4] = -16;
          } else {
            task.data[3] = -16;
            task.data[4] = 256;
          }
          if (task.data[1] === 1) {
            task.data[5] = 80 - runtime.battleAnimArgs[0] * 10;
          } else {
            task.data[5] = runtime.battleAnimArgs[0] * 10 + 40;
            const temp = task.data[3];
            task.data[3] = task.data[4];
            task.data[4] = temp;
          }
      }
      if (task.data[3] < task.data[4]) {
        task.data[1] = 1;
        task.data[6] = 0;
      } else {
        task.data[1] = -1;
        task.data[6] = 3;
      }
      ++task.data[0];
      break;
    case 1:
      if (++task.data[2] > 0) {
        task.data[2] = 0;
        if (CreateVoltTackleBolt(runtime, task, taskId) || CreateVoltTackleBolt(runtime, task, taskId)) ++task.data[0];
      }
      break;
    case 2:
      if (task.data[7] === 0) destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimVoltTackleBolt(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  if (++sprite.data[0] > 12) {
    --runtime.tasks[sprite.data[6]]!.data[sprite.data[7]];
    freeOamMatrix(sprite.oam.matrixNum);
    destroySprite(sprite);
  }
}

export function AnimGrowingShockWaveOrb(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
      sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
      startSpriteAffineAnim(sprite, 2);
      ++sprite.data[0];
      break;
    case 1:
      if (sprite.affineAnimEnded) destroySpriteAndMatrix(sprite);
      break;
  }
}

export function AnimTask_ShockWaveProgressingBolt(runtime: ElectricRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      task.data[6] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
      task.data[7] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
      task.data[8] = 4;
      task.data[10] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
      task.data[9] = trunc((task.data[10] - task.data[6]) / 5);
      task.data[4] = 7;
      task.data[5] = -1;
      task.data[11] = 12;
      task.data[12] = battleAnimAdjustPanning(SOUND_PAN_ATTACKER);
      task.data[13] = battleAnimAdjustPanning(SOUND_PAN_TARGET);
      task.data[14] = task.data[12];
      task.data[15] = trunc((task.data[13] - task.data[12]) / 3);
      ++task.data[0];
      break;
    case 1:
      if (++task.data[1] > 0) {
        task.data[1] = 0;
        if (CreateShockWaveBoltSprite(runtime, task, taskId)) {
          if (task.data[2] === 5) task.data[0] = 3;
          else ++task.data[0];
        }
      }
      if (task.data[11]) --task.data[11];
      break;
    case 2:
      if (task.data[11]) --task.data[11];
      if (++task.data[1] > 4) {
        task.data[1] = 0;
        if (task.data[2] & 1) {
          task.data[7] = 4;
          task.data[8] = 68;
          task.data[4] = 0;
          task.data[5] = 1;
        } else {
          task.data[7] = 68;
          task.data[8] = 4;
          task.data[4] = 7;
          task.data[5] = -1;
        }
        if (task.data[11]) task.data[0] = 4;
        else task.data[0] = 1;
      }
      break;
    case 3:
      if (task.data[3] === 0) destroyAnimVisualTask(runtime, taskId);
      break;
    case 4:
      if (task.data[11]) --task.data[11];
      else task.data[0] = 1;
      break;
  }
}

export function AnimShockWaveProgressingBolt(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  if (++sprite.data[0] > 12) {
    --runtime.tasks[sprite.data[6]]!.data[sprite.data[7]];
    destroySprite(sprite);
  }
}

export function AnimTask_ShockWaveLightning(runtime: ElectricRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      task.data[15] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'y') + 32;
      task.data[14] = task.data[15];
      while (task.data[14] > 16) task.data[14] -= 32;
      task.data[13] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
      task.data[12] = getBattlerSpriteSubpriority(runtime, runtime.battleAnimTarget) - 2;
      ++task.data[0];
      break;
    case 1:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        if (CreateShockWaveLightningSprite(runtime, task, taskId)) ++task.data[0];
      }
      break;
    case 2:
      if (task.data[10] === 0) destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimShockWaveLightning(runtime: ElectricRuntime, sprite: ElectricSprite): void {
  if (sprite.animEnded) {
    --runtime.tasks[sprite.data[6]]!.data[sprite.data[7]];
    destroySprite(sprite);
  }
}

export function CreateVoltTackleBolt(runtime: ElectricRuntime, task: ElectricTask, taskId: number): boolean {
  const spriteId = createSprite(runtime, gVoltTackleBoltSpriteTemplate, task.data[3], task.data[5], 35);
  if (spriteId !== MAX_SPRITES) {
    runtime.sprites[spriteId].data[6] = taskId;
    runtime.sprites[spriteId].data[7] = 7;
    ++task.data[7];
  }
  task.data[6] += task.data[1];
  if (task.data[6] < 0) task.data[6] = 3;
  if (task.data[6] > 3) task.data[6] = 0;
  task.data[3] += task.data[1] * 16;
  return (task.data[1] === 1 && task.data[3] >= task.data[4]) || (task.data[1] === -1 && task.data[3] <= task.data[4]);
}

export function CreateShockWaveBoltSprite(runtime: ElectricRuntime, task: ElectricTask, taskId: number): boolean {
  const spriteId = createSprite(runtime, sShockWaveProgressingBoltSpriteTemplate, task.data[6], task.data[7], 35);
  if (spriteId !== MAX_SPRITES) {
    runtime.sprites[spriteId].oam.tileNum += task.data[4];
    task.data[4] += task.data[5];
    if (task.data[4] < 0) task.data[4] = 7;
    if (task.data[4] > 7) task.data[4] = 0;
    runtime.sprites[spriteId].data[6] = taskId;
    runtime.sprites[spriteId].data[7] = 3;
    ++task.data[3];
  }
  if (task.data[4] === 0 && task.data[5] > 0) {
    task.data[14] += task.data[15];
    playSe12WithPanning(runtime, SE_M_THUNDERBOLT, task.data[14]);
  }
  if ((task.data[5] < 0 && task.data[7] <= task.data[8]) || (task.data[5] > 0 && task.data[7] >= task.data[8])) {
    ++task.data[2];
    task.data[6] += task.data[9];
    return true;
  }
  task.data[7] += task.data[5] * 8;
  return false;
}

export function CreateShockWaveLightningSprite(runtime: ElectricRuntime, task: ElectricTask, taskId: number): boolean {
  const spriteId = createSprite(runtime, gLightningSpriteTemplate, task.data[13], task.data[14], task.data[12]);
  if (spriteId !== MAX_SPRITES) {
    runtime.sprites[spriteId].callback = 'AnimShockWaveLightning';
    runtime.sprites[spriteId].data[6] = taskId;
    runtime.sprites[spriteId].data[7] = 10;
    ++task.data[10];
  }
  if (task.data[14] >= task.data[15]) return true;
  task.data[14] += 32;
  return false;
}

export const animLightning = AnimLightning;
export const animLightningStep = AnimLightning_Step;
export const animUnusedSpinningFist = AnimUnusedSpinningFist;
export const animUnusedSpinningFistStep = AnimUnusedSpinningFist_Step;
export const animUnusedCirclingShock = AnimUnusedCirclingShock;
export const animSparkElectricity = AnimSparkElectricity;
export const animZapCannonSpark = AnimZapCannonSpark;
export const animZapCannonSparkStep = AnimZapCannonSpark_Step;
export const animThunderboltOrbStep = AnimThunderboltOrb_Step;
export const animThunderboltOrb = AnimThunderboltOrb;
export const animSparkElectricityFlashing = AnimSparkElectricityFlashing;
export const animSparkElectricityFlashingStep = AnimSparkElectricityFlashing_Step;
export const animElectricity = AnimElectricity;
export const animTaskElectricBolt = AnimTask_ElectricBolt;
export const animTaskElectricBoltStep = AnimTask_ElectricBolt_Step;
export const animElectricBoltSegment = AnimElectricBoltSegment;
export const animThunderWave = AnimThunderWave;
export const animThunderWaveStep = AnimThunderWave_Step;
export const animTaskElectricChargingParticles = AnimTask_ElectricChargingParticles;
export const animTaskElectricChargingParticlesStep = AnimTask_ElectricChargingParticles_Step;
export const animElectricChargingParticlesStep = AnimElectricChargingParticles_Step;
export const animElectricChargingParticles = AnimElectricChargingParticles;
export const animGrowingChargeOrb = AnimGrowingChargeOrb;
export const animElectricPuff = AnimElectricPuff;
export const animVoltTackleOrbSlide = AnimVoltTackleOrbSlide;
export const animVoltTackleOrbSlideStep = AnimVoltTackleOrbSlide_Step;
export const animTaskVoltTackleAttackerReappear = AnimTask_VoltTackleAttackerReappear;
export const animTaskVoltTackleBolt = AnimTask_VoltTackleBolt;
export const createVoltTackleBolt = CreateVoltTackleBolt;
export const animVoltTackleBolt = AnimVoltTackleBolt;
export const animGrowingShockWaveOrb = AnimGrowingShockWaveOrb;
export const animTaskShockWaveProgressingBolt = AnimTask_ShockWaveProgressingBolt;
export const createShockWaveBoltSprite = CreateShockWaveBoltSprite;
export const animShockWaveProgressingBolt = AnimShockWaveProgressingBolt;
export const animTaskShockWaveLightning = AnimTask_ShockWaveLightning;
export const createShockWaveLightningSprite = CreateShockWaveLightningSprite;
export const animShockWaveLightning = AnimShockWaveLightning;

const trunc = (value: number): number => Math.trunc(value);
const u16 = (value: number): number => value & 0xffff;
const getBattlerSide = (runtime: ElectricRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const battlePartner = (battler: number): number => battler ^ 2;
const isBattlerSpriteVisible = (runtime: ElectricRuntime, battler: number): boolean => runtime.battlerVisible[battler] === true;
const getBattlerSpriteCoord = (runtime: ElectricRuntime, battler: number, coord: 'x' | 'y' | 'x2' | 'yPicOffset'): number => runtime.battlerCoords[battler]?.[coord] ?? 0;
const getBattlerSpriteBgPriority = (runtime: ElectricRuntime, battler: number): number => runtime.battlerBgPriorities[battler] ?? 0;
const getBattlerSpriteSubpriority = (runtime: ElectricRuntime, battler: number): number => runtime.battlerSubpriorities[battler] ?? 0;
const getAnimBattlerSpriteId = (runtime: ElectricRuntime, animBattler: number): number => {
  const battler = animBattler === ANIM_ATTACKER ? runtime.battleAnimAttacker : animBattler === ANIM_TARGET ? runtime.battleAnimTarget : animBattler;
  return runtime.battlerSpriteIds[battler] ?? MAX_SPRITES;
};
const createSprite = (runtime: ElectricRuntime, templateArg: ElectricSpriteTemplate, x: number, y: number, subpriority: number): number => {
  const id = runtime.sprites.findIndex((sprite, index) => index >= 4 && sprite.callback === 'SpriteCallbackDummy' && !sprite.destroyed && sprite.data.every((value) => value === 0) && sprite.x === 0 && sprite.y === 0);
  if (id < 0 || id >= MAX_SPRITES) return MAX_SPRITES;
  const sprite = createElectricSprite();
  sprite.x = x;
  sprite.y = y;
  sprite.subpriority = subpriority;
  sprite.callback = templateArg.callback;
  runtime.sprites[id] = sprite;
  runtime.operations.push(`CreateSprite:${templateArg.tileTag}:${id}:${x}:${y}:${subpriority}`);
  return id;
};
const initSpritePosToAnimAttacker = (runtime: ElectricRuntime, sprite: ElectricSprite, _respectMonPicOffsets: boolean): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset') + runtime.battleAnimArgs[1];
};
const initSpritePosToAnimTarget = (runtime: ElectricRuntime, sprite: ElectricSprite, _respectMonPicOffsets: boolean): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[1];
};
const initAnimLinearTranslation = (sprite: ElectricSprite): void => {
  sprite.data[8] = sprite.data[0];
  sprite.data[9] = 0;
};
const animTranslateLinear = (sprite: ElectricSprite): boolean => {
  const duration = sprite.data[8] || sprite.data[0];
  if (duration <= 0) return true;
  sprite.data[9]++;
  if (sprite.data[9] >= duration) {
    sprite.x2 = sprite.data[2] - sprite.data[1];
    sprite.y2 = sprite.data[4] - sprite.data[3];
    return true;
  }
  sprite.x2 = trunc(((sprite.data[2] - sprite.data[1]) * sprite.data[9]) / duration);
  sprite.y2 = trunc(((sprite.data[4] - sprite.data[3]) * sprite.data[9]) / duration);
  return false;
};
const storeSpriteCallbackInData6 = (sprite: ElectricSprite, callback: ElectricCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const startSpriteAnim = (sprite: ElectricSprite, animIndex: number): void => {
  sprite.animIndex = animIndex & 0xff;
};
const startSpriteAffineAnim = (sprite: ElectricSprite, animIndex: number): void => {
  sprite.affineAnimIndex = animIndex & 0xff;
};
const destroyAnimSprite = (sprite: ElectricSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const destroySprite = (sprite: ElectricSprite): void => {
  sprite.destroyed = true;
};
const destroySpriteAndMatrix = (sprite: ElectricSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroySpriteAndMatrix';
};
const destroyAnimVisualTask = (runtime: ElectricRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};
const freeOamMatrix = (_matrixNum: number): void => {};
const battleAnimAdjustPanning = (pan: number): number => pan;
const playSe12WithPanning = (runtime: ElectricRuntime, song: string, pan: number): void => {
  runtime.sounds.push({ song, pan });
};
