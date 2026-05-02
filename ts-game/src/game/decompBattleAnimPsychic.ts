import { gSineTable } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_OPPONENT_LEFT = 1;
export const BATTLER_COORD_X = 'BATTLER_COORD_X';
export const BATTLER_COORD_Y = 'BATTLER_COORD_Y';
export const BATTLER_COORD_X_2 = 'BATTLER_COORD_X_2';
export const BATTLER_COORD_Y_PIC_OFFSET = 'BATTLER_COORD_Y_PIC_OFFSET';
export const BATTLER_COORD_ATTR_WIDTH = 'BATTLER_COORD_ATTR_WIDTH';
export const BATTLER_COORD_ATTR_HEIGHT = 'BATTLER_COORD_ATTR_HEIGHT';
export const BATTLER_COORD_ATTR_LEFT = 'BATTLER_COORD_ATTR_LEFT';
export const BATTLER_COORD_ATTR_RIGHT = 'BATTLER_COORD_ATTR_RIGHT';
export const BATTLER_COORD_ATTR_TOP = 'BATTLER_COORD_ATTR_TOP';
export const BATTLER_COORD_ATTR_BOTTOM = 'BATTLER_COORD_ATTR_BOTTOM';
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const MAX_SPRITES = 64;
export const DISPLAY_WIDTH = 240;
export const ST_OAM_AFFINE_OFF = 0;
export const ST_OAM_AFFINE_NORMAL = 1;
export const ST_OAM_AFFINE_DOUBLE = 2;
export const REG_OFFSET_BLDALPHA = 'REG_OFFSET_BLDALPHA';
export const REG_OFFSET_BLDCNT = 'REG_OFFSET_BLDCNT';
export const BLDCNT_TGT2_ALL = 0x3f00;
export const BLDCNT_EFFECT_BLEND = 0x0040;
export const SE_M_TELEPORT = 'SE_M_TELEPORT';

export type PsychicCallback =
  | 'AnimSpriteOnMonPos'
  | 'AnimDefensiveWall'
  | 'AnimDefensiveWall_Step2'
  | 'AnimDefensiveWall_Step3'
  | 'AnimDefensiveWall_Step4'
  | 'AnimDefensiveWall_Step5'
  | 'AnimWallSparkle'
  | 'TranslateAnimSpriteToTargetMonLocation'
  | 'AnimBentSpoon'
  | 'AnimQuestionMark'
  | 'AnimQuestionMark_Step1'
  | 'AnimQuestionMark_Step2'
  | 'AnimRedX'
  | 'AnimRedX_Step'
  | 'AnimSkillSwapOrb'
  | 'AnimPsychoBoost'
  | 'RunStoredCallbackWhenAnimEnds'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix'
  | 'SpriteCallbackDummy';

export type PsychicTaskFunc =
  | 'AnimTask_MeditateStretchAttacker_Step'
  | 'AnimTask_Teleport_Step'
  | 'AnimTask_ImprisonOrbs_Step'
  | 'AnimTask_SkillSwap_Step'
  | 'AnimTask_ExtrasensoryDistortion_Step'
  | 'AnimTask_TransparentCloneGrowAndShrink_Step'
  | 'DestroyAnimVisualTask';

export interface PsychicSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: PsychicCallback;
}

export interface PsychicSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: PsychicCallback;
  storedCallback: PsychicCallback | null;
  invisible: boolean;
  destroyed: boolean;
  animEnded: boolean;
  affineAnimEnded: boolean;
  affineAnimPaused: boolean;
  affineAnims: readonly unknown[] | string;
  affineAnimIndex: number;
  animIndex: number;
  subpriority: number;
  oam: {
    priority: number;
    affineMode: number;
    matrixNum: number;
    shape: number;
    size: number;
  };
  rotScale: { xScale: number; yScale: number; rotation: number } | null;
  yOffsetFromOtherScale: number | null;
}

export interface PsychicTask {
  data: number[];
  func: PsychicTaskFunc;
  destroyed: boolean;
  affineFramesRemaining: number;
}

export interface PsychicRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  contest: boolean;
  doubleBattle: boolean;
  battlerSides: Record<number, number>;
  battlerAtPosition: Record<number, number>;
  battlerVisible: Record<number, boolean>;
  battlerSpriteIds: Record<number, number>;
  battlerBgPriorityRanks: Record<number, number>;
  battlerCoords: Record<number, {
    x: number;
    y: number;
    x2: number;
    yPicOffset: number;
    width: number;
    height: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
    yWithElevation: number;
  }>;
  sprites: PsychicSprite[];
  tasks: Array<PsychicTask | null>;
  gpuRegs: Record<string, number>;
  fadedPalettes: number[];
  paletteTagIndexes: Record<string | number, number>;
  battleBg1X: number;
  battleBg2X: number;
  scanlineEffectRegBuffers: [number[], number[]];
  scanlineEffect: { state: number; params: unknown | null };
  nextMatrixNum: number;
  allocMatrixFails: boolean;
  cloneFails: boolean;
  operations: string[];
  sounds: Array<{ song: string; pan: number }>;
}

const frame = (tileOffset: number, duration: number, hFlip = false) => ({ tileOffset, duration, hFlip });
const affineFrame = (xScale: number, yScale: number, rotation: number, duration: number) => ({ xScale, yScale, rotation, duration });

export const sAffineAnimPsychUpSpiral = [
  affineFrame(0x100, 0x100, 0, 0),
  affineFrame(-0x2, -0x2, -10, 120),
  { end: true }
] as const;
export const sAffineAnimsPsychUpSpiral = [sAffineAnimPsychUpSpiral] as const;

export const sAnimReflectSparkle = [frame(0, 3), frame(16, 3), frame(32, 3), frame(48, 3), frame(64, 3), { end: true }] as const;
export const sAnimsReflectSparkle = [sAnimReflectSparkle] as const;
export const sAnimSpecialScreenSparkle = [frame(0, 5), frame(4, 5), frame(8, 5), frame(12, 5), { end: true }] as const;
export const sAnimsSpecialScreenSparkle = [sAnimSpecialScreenSparkle] as const;
export const sAnimBentSpoon0 = [
  frame(8, 60, true), frame(16, 5, true), frame(8, 5, true), frame(0, 5, true), frame(8, 22, true),
  { loop: 0 }, frame(16, 5, true), frame(8, 5, true), frame(0, 5, true), frame(8, 5, true), { loop: 1 },
  frame(8, 22, true), frame(24, 3, true), frame(32, 3, true), frame(40, 22, true), { end: true }
] as const;
export const sAnimBentSpoon1 = [
  frame(8, 60), frame(16, 5), frame(8, 5), frame(0, 5), frame(8, 22), { loop: 0 },
  frame(16, 5), frame(8, 5), frame(0, 5), frame(8, 5), { loop: 1 }, frame(8, 22),
  frame(24, 3), frame(32, 3), frame(40, 22), { end: true }
] as const;
export const sAnimsBentSpoon = [sAnimBentSpoon0, sAnimBentSpoon1] as const;
export const sAnimQuestionMark = [frame(0, 6), frame(16, 6), frame(32, 6), frame(48, 6), frame(64, 6), frame(80, 6), frame(96, 18), { end: true }] as const;
export const sAnimsQuestionMark = [sAnimQuestionMark] as const;
export const sAffineAnimQuestionMark = [
  affineFrame(0, 0, 4, 4),
  affineFrame(0, 0, -4, 8),
  affineFrame(0, 0, 4, 4),
  { loop: 2 },
  { end: true }
] as const;
export const sAffineAnimsQuestionMark = [sAffineAnimQuestionMark] as const;
export const sAffineAnimMeditateStretchAttacker = [
  affineFrame(-8, 10, 0, 16),
  affineFrame(18, -18, 0, 16),
  affineFrame(-20, 16, 0, 8),
  { end: true }
] as const;
export const sAffineAnimTeleport = [
  affineFrame(64, -4, 0, 20),
  affineFrame(0, 0, 0, -56),
  { end: true }
] as const;
export const sAffineAnimSkillSwapOrb0 = [affineFrame(-0x8, -0x8, 0, 8), affineFrame(0x8, 0x8, 0, 8), { jump: 0 }] as const;
export const sAffineAnimSkillSwapOrb1 = [affineFrame(0xf0, 0xf0, 0, 0), affineFrame(-0x8, -0x8, 0, 6), affineFrame(0x8, 0x8, 0, 8), affineFrame(-0x8, -0x8, 0, 2), { jump: 1 }] as const;
export const sAffineAnimSkillSwapOrb2 = [affineFrame(0xd0, 0xd0, 0, 0), affineFrame(-0x8, -0x8, 0, 4), affineFrame(0x8, 0x8, 0, 8), affineFrame(-0x8, -0x8, 0, 4), { jump: 1 }] as const;
export const sAffineAnimSkillSwapOrb3 = [affineFrame(0xb0, 0xb0, 0, 0), affineFrame(-0x8, -0x8, 0, 2), affineFrame(0x8, 0x8, 0, 8), affineFrame(-0x8, -0x8, 0, 6), { jump: 1 }] as const;
export const sAffineAnimsSkillSwapOrb = [sAffineAnimSkillSwapOrb0, sAffineAnimSkillSwapOrb1, sAffineAnimSkillSwapOrb2, sAffineAnimSkillSwapOrb3] as const;
export const sAffineAnimLusterPurgeCircle = [affineFrame(0x20, 0x20, 0, 0), affineFrame(0x4, 0x4, 0, 120), { endAlt: 1 }] as const;
export const gAffineAnimsLusterPurgeCircle = [sAffineAnimLusterPurgeCircle] as const;
export const sAffineAnimPsychoBoostOrb0 = [
  affineFrame(0x20, 0x20, 0, 0), affineFrame(0x10, 0x10, 0, 17), { loop: 0 },
  affineFrame(-0x8, -0x8, 0, 10), affineFrame(0x8, 0x8, 0, 10), { loop: 4 }, { loop: 0 },
  affineFrame(-0x10, -0x10, 0, 5), affineFrame(0x10, 0x10, 0, 5), { loop: 7 }, { end: true }
] as const;
export const sAffineAnimPsychoBoostOrb1 = [affineFrame(-0x14, 0x18, 0, 15), { end: true }] as const;
export const sAffineAnimsPsychoBoostOrb = [sAffineAnimPsychoBoostOrb0, sAffineAnimPsychoBoostOrb1] as const;

const template = (tileTag: string, oam: string, anims: readonly unknown[] | string, affineAnims: readonly unknown[] | string, callback: PsychicCallback): PsychicSpriteTemplate => ({
  tileTag,
  paletteTag: tileTag,
  oam,
  anims,
  images: null,
  affineAnims,
  callback
});

export const gPsychUpSpiralSpriteTemplate = template('ANIM_TAG_SPIRAL', 'gOamData_AffineNormal_ObjBlend_64x64', 'gDummySpriteAnimTable', sAffineAnimsPsychUpSpiral, 'AnimSpriteOnMonPos');
export const gLightScreenWallSpriteTemplate = template('ANIM_TAG_GREEN_LIGHT_WALL', 'gOamData_AffineOff_ObjBlend_64x64', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimDefensiveWall');
export const gReflectWallSpriteTemplate = template('ANIM_TAG_BLUE_LIGHT_WALL', 'gOamData_AffineOff_ObjBlend_64x64', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimDefensiveWall');
export const gMirrorCoatWallSpriteTemplate = template('ANIM_TAG_RED_LIGHT_WALL', 'gOamData_AffineOff_ObjBlend_64x64', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimDefensiveWall');
export const gBarrierWallSpriteTemplate = template('ANIM_TAG_GRAY_LIGHT_WALL', 'gOamData_AffineOff_ObjBlend_64x64', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimDefensiveWall');
export const gMagicCoatWallSpriteTemplate = template('ANIM_TAG_ORANGE_LIGHT_WALL', 'gOamData_AffineOff_ObjBlend_64x64', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimDefensiveWall');
export const gReflectSparkleSpriteTemplate = template('ANIM_TAG_SPARKLE_4', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsReflectSparkle, 'gDummySpriteAffineAnimTable', 'AnimWallSparkle');
export const gSpecialScreenSparkleSpriteTemplate = template('ANIM_TAG_SPARKLE_3', 'gOamData_AffineOff_ObjNormal_16x16', sAnimsSpecialScreenSparkle, 'gDummySpriteAffineAnimTable', 'AnimWallSparkle');
export const gGoldRingSpriteTemplate = template('ANIM_TAG_GOLD_RING', 'gOamData_AffineOff_ObjNormal_16x32', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'TranslateAnimSpriteToTargetMonLocation');
export const gBentSpoonSpriteTemplate = template('ANIM_TAG_BENT_SPOON', 'gOamData_AffineOff_ObjNormal_16x32', sAnimsBentSpoon, 'gDummySpriteAffineAnimTable', 'AnimBentSpoon');
export const gQuestionMarkSpriteTemplate = template('ANIM_TAG_AMNESIA', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsQuestionMark, 'gDummySpriteAffineAnimTable', 'AnimQuestionMark');
export const sImprisonOrbSpriteTemplate = template('ANIM_TAG_HOLLOW_ORB', 'gOamData_AffineOff_ObjBlend_16x16', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'SpriteCallbackDummy');
export const gRedXSpriteTemplate = template('ANIM_TAG_X_SIGN', 'gOamData_AffineOff_ObjNormal_64x64', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimRedX');
export const sSkillSwapOrbSpriteTemplate = template('ANIM_TAG_BLUEGREEN_ORB', 'gOamData_AffineNormal_ObjNormal_16x16', 'gDummySpriteAnimTable', sAffineAnimsSkillSwapOrb, 'AnimSkillSwapOrb');
export const gLusterPurgeCircleSpriteTemplate = template('ANIM_TAG_WHITE_CIRCLE_OF_LIGHT', 'gOamData_AffineDouble_ObjBlend_64x64', 'gDummySpriteAnimTable', gAffineAnimsLusterPurgeCircle, 'AnimSpriteOnMonPos');
export const gPsychoBoostOrbSpriteTemplate = template('ANIM_TAG_CIRCLE_OF_LIGHT', 'gOamData_AffineDouble_ObjBlend_64x64', 'gDummySpriteAnimTable', sAffineAnimsPsychoBoostOrb, 'AnimPsychoBoost');

export const createPsychicSprite = (): PsychicSprite => ({
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
  affineAnimPaused: false,
  affineAnims: 'gDummySpriteAffineAnimTable',
  affineAnimIndex: 0,
  animIndex: 0,
  subpriority: 0,
  oam: { priority: 0, affineMode: ST_OAM_AFFINE_OFF, matrixNum: 0, shape: 0, size: 0 },
  rotScale: null,
  yOffsetFromOtherScale: null
});

export const createPsychicRuntime = (overrides: Partial<PsychicRuntime> = {}): PsychicRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  contest: overrides.contest ?? false,
  doubleBattle: overrides.doubleBattle ?? false,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerAtPosition: overrides.battlerAtPosition ?? { [B_POSITION_OPPONENT_LEFT]: 1 },
  battlerVisible: overrides.battlerVisible ?? { 0: true, 1: true, 2: true, 3: true },
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerBgPriorityRanks: overrides.battlerBgPriorityRanks ?? { 0: 0, 1: 1, 2: 0, 3: 0 },
  battlerCoords: overrides.battlerCoords ?? {
    0: { x: 48, y: 72, x2: 48, yPicOffset: 64, width: 40, height: 48, left: 28, right: 68, top: 40, bottom: 88, yWithElevation: 64 },
    1: { x: 176, y: 48, x2: 176, yPicOffset: 48, width: 44, height: 52, left: 154, right: 198, top: 20, bottom: 72, yWithElevation: 48 },
    2: { x: 80, y: 80, x2: 80, yPicOffset: 72, width: 40, height: 48, left: 60, right: 100, top: 48, bottom: 96, yWithElevation: 72 },
    3: { x: 144, y: 40, x2: 144, yPicOffset: 40, width: 40, height: 48, left: 124, right: 164, top: 16, bottom: 64, yWithElevation: 40 }
  },
  sprites: overrides.sprites ?? Array.from({ length: MAX_SPRITES }, () => createPsychicSprite()),
  tasks: overrides.tasks ?? [],
  gpuRegs: overrides.gpuRegs ?? {},
  fadedPalettes: overrides.fadedPalettes ?? Array.from({ length: 512 }, (_, i) => i),
  paletteTagIndexes: overrides.paletteTagIndexes ?? {},
  battleBg1X: overrides.battleBg1X ?? 0,
  battleBg2X: overrides.battleBg2X ?? 0,
  scanlineEffectRegBuffers: overrides.scanlineEffectRegBuffers ?? [Array.from({ length: 240 }, () => 0), Array.from({ length: 240 }, () => 0)],
  scanlineEffect: overrides.scanlineEffect ?? { state: 0, params: null },
  nextMatrixNum: overrides.nextMatrixNum ?? 1,
  allocMatrixFails: overrides.allocMatrixFails ?? false,
  cloneFails: overrides.cloneFails ?? false,
  operations: overrides.operations ?? [],
  sounds: overrides.sounds ?? []
});

export const createPsychicTask = (runtime: PsychicRuntime, func: PsychicTaskFunc = 'DestroyAnimVisualTask'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), func, destroyed: false, affineFramesRemaining: 0 });
  return id;
};

export function AnimDefensiveWall(runtime: PsychicRuntime, sprite: PsychicSprite): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER || runtime.contest) {
    sprite.oam.priority = 2;
    sprite.subpriority = 200;
  }
  if (!runtime.contest) {
    const battlerCopy = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT);
    let battler = battlerCopy;
    const rank = getBattlerSpriteBgPriorityRank(runtime, battler);
    const var0 = 1;
    const toBg2 = (rank ^ var0) !== 0;
    if (isBattlerSpriteVisible(runtime, battler)) moveBattlerSpriteToBg(runtime, battler, toBg2);
    battler = battlePartner(battlerCopy);
    if (isBattlerSpriteVisible(runtime, battler)) moveBattlerSpriteToBg(runtime, battler, (toBg2 ? 1 : 0) ^ var0);
  }
  if (!runtime.contest && runtime.doubleBattle) {
    if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER) {
      sprite.x = 72;
      sprite.y = 80;
    } else {
      sprite.x = 176;
      sprite.y = 40;
    }
  } else {
    if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X) + runtime.battleAnimArgs[0];
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y) + runtime.battleAnimArgs[1];
  }
  if (runtime.contest) sprite.y += 9;
  sprite.data[0] = objPlttId(indexOfSpritePaletteTag(runtime, runtime.battleAnimArgs[2]));
  sprite.callback = 'AnimDefensiveWall_Step2';
  AnimDefensiveWall_Step2(runtime, sprite);
}

export function AnimDefensiveWall_Step2(runtime: PsychicRuntime, sprite: PsychicSprite): void {
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(sprite.data[3], 16 - sprite.data[3]));
  if (sprite.data[3] === 13) sprite.callback = 'AnimDefensiveWall_Step3';
  else ++sprite.data[3];
}

export function AnimDefensiveWall_Step3(runtime: PsychicRuntime, sprite: PsychicSprite): void {
  if (++sprite.data[1] === 2) {
    sprite.data[1] = 0;
    const startOffset = sprite.data[0];
    const color = runtime.fadedPalettes[startOffset + 8];
    for (let i = 8; i > 0; --i) runtime.fadedPalettes[startOffset + i] = runtime.fadedPalettes[startOffset + i - 1];
    runtime.fadedPalettes[startOffset + 1] = color;
    if (++sprite.data[2] === 16) sprite.callback = 'AnimDefensiveWall_Step4';
  }
}

export function AnimDefensiveWall_Step4(runtime: PsychicRuntime, sprite: PsychicSprite): void {
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(sprite.data[3], 16 - sprite.data[3]));
  if (--sprite.data[3] === -1) {
    if (!runtime.contest) {
      const battlerCopy = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT);
      let battler = battlerCopy;
      if (isBattlerSpriteVisible(runtime, battler)) runtime.sprites[runtime.battlerSpriteIds[battler]].invisible = false;
      battler = battlePartner(battlerCopy);
      if (isBattlerSpriteVisible(runtime, battler)) runtime.sprites[runtime.battlerSpriteIds[battler]].invisible = false;
    }
    sprite.invisible = true;
    sprite.callback = 'AnimDefensiveWall_Step5';
  }
}

export function AnimDefensiveWall_Step5(runtime: PsychicRuntime, sprite: PsychicSprite): void {
  if (!runtime.contest) {
    const battlerCopy = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT);
    let battler = battlerCopy;
    const rank = getBattlerSpriteBgPriorityRank(runtime, battler);
    const var0 = 1;
    const toBg2 = (rank ^ var0) !== 0;
    if (isBattlerSpriteVisible(runtime, battler)) resetBattleAnimBg(runtime, toBg2);
    battler = battlerCopy ^ 2;
    if (isBattlerSpriteVisible(runtime, battler)) resetBattleAnimBg(runtime, (toBg2 ? 1 : 0) ^ var0);
  }
  sprite.callback = 'DestroyAnimSprite';
}

export function AnimWallSparkle(runtime: PsychicRuntime, sprite: PsychicSprite): void {
  if (sprite.data[0] === 0) {
    const ignoreOffsets = runtime.battleAnimArgs[3];
    let respectMonPicOffsets = false;
    if (!ignoreOffsets) respectMonPicOffsets = true;
    if (!runtime.contest && runtime.doubleBattle) {
      if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER) {
        sprite.x = 72 - runtime.battleAnimArgs[0];
        sprite.y = runtime.battleAnimArgs[1] + 80;
      } else {
        sprite.x = runtime.battleAnimArgs[0] + 176;
        sprite.y = runtime.battleAnimArgs[1] + 40;
      }
    } else if (runtime.battleAnimArgs[2] === 0) {
      initSpritePosToAnimAttacker(runtime, sprite, respectMonPicOffsets);
    } else {
      initSpritePosToAnimTarget(runtime, sprite, respectMonPicOffsets);
    }
    ++sprite.data[0];
  } else if (sprite.animEnded || sprite.affineAnimEnded) {
    destroySpriteAndMatrix(sprite);
  }
}

export function AnimBentSpoon(runtime: PsychicRuntime, sprite: PsychicSprite): void {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2);
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    startSpriteAnim(sprite, 1);
    sprite.x -= 40;
    sprite.y += 10;
    sprite.data[1] = -1;
  } else {
    sprite.x += 40;
    sprite.y -= 10;
    sprite.data[1] = 1;
  }
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  sprite.callback = 'RunStoredCallbackWhenAnimEnds';
}

export function AnimQuestionMark(runtime: PsychicRuntime, sprite: PsychicSprite): void {
  let x = Math.trunc(getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_WIDTH) / 2);
  const y = Math.trunc(getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_HEIGHT) / -2);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_OPPONENT) x = -x;
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2) + x;
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET) + y;
  if (sprite.y < 16) sprite.y = 16;
  storeSpriteCallbackInData6(sprite, 'AnimQuestionMark_Step1');
  sprite.callback = 'RunStoredCallbackWhenAnimEnds';
}

export function AnimQuestionMark_Step1(sprite: PsychicSprite): void {
  sprite.oam.affineMode = ST_OAM_AFFINE_NORMAL;
  sprite.affineAnims = sAffineAnimsQuestionMark;
  sprite.data[0] = 0;
  initSpriteAffineAnim(sprite);
  sprite.callback = 'AnimQuestionMark_Step2';
}

export function AnimQuestionMark_Step2(sprite: PsychicSprite): void {
  switch (sprite.data[0]) {
    case 0:
      if (sprite.affineAnimEnded) {
        freeOamMatrix(sprite.oam.matrixNum);
        sprite.oam.affineMode = ST_OAM_AFFINE_OFF;
        sprite.data[1] = 18;
        ++sprite.data[0];
      }
      break;
    case 1:
      if (--sprite.data[1] === -1) destroyAnimSprite(sprite);
      break;
  }
}

export function AnimTask_MeditateStretchAttacker(runtime: PsychicRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const spriteId = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
  task.data[0] = spriteId;
  prepareAffineAnimInTaskData(task, spriteId, sAffineAnimMeditateStretchAttacker);
  task.func = 'AnimTask_MeditateStretchAttacker_Step';
}

export function AnimTask_MeditateStretchAttacker_Step(runtime: PsychicRuntime, taskId: number): void {
  if (!runAffineAnimFromTaskData(runtime.tasks[taskId]!)) destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_Teleport(runtime: PsychicRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const spriteId = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
  task.data[0] = spriteId;
  task.data[1] = 0;
  task.data[2] = 0;
  task.data[3] = getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER ? 4 : 8;
  prepareAffineAnimInTaskData(task, task.data[0], sAffineAnimTeleport);
  task.func = 'AnimTask_Teleport_Step';
}

export function AnimTask_Teleport_Step(runtime: PsychicRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[1]) {
    case 0:
      runAffineAnimFromTaskData(task);
      if (++task.data[2] > 19) ++task.data[1];
      break;
    case 1:
      if (task.data[3] !== 0) {
        runtime.sprites[task.data[0]].y2 -= 8;
        --task.data[3];
      } else {
        runtime.sprites[task.data[0]].invisible = true;
        runtime.sprites[task.data[0]].x = DISPLAY_WIDTH + 32;
        resetSpriteRotScale(runtime, task.data[0]);
        destroyAnimVisualTask(runtime, taskId);
      }
      break;
  }
}

export function AnimTask_ImprisonOrbs(runtime: PsychicRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[3] = 16;
  task.data[4] = 0;
  task.data[13] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2);
  task.data[14] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET);
  const var0 = Math.trunc(getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_WIDTH) / 3);
  const var1 = Math.trunc(getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_HEIGHT) / 3);
  task.data[12] = var0 > var1 ? var0 : var1;
  setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND);
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(16, 0));
  task.func = 'AnimTask_ImprisonOrbs_Step';
}

export function AnimTask_ImprisonOrbs_Step(runtime: PsychicRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] > 8) {
        task.data[1] = 0;
        const spriteId = createSprite(runtime, sImprisonOrbSpriteTemplate, task.data[13], task.data[14], 0);
        task.data[task.data[2] + 8] = spriteId;
        if (spriteId !== MAX_SPRITES) {
          switch (task.data[2]) {
            case 0:
              runtime.sprites[spriteId].x2 = task.data[12];
              runtime.sprites[spriteId].y2 = -task.data[12];
              break;
            case 1:
              runtime.sprites[spriteId].x2 = -task.data[12];
              runtime.sprites[spriteId].y2 = task.data[12];
              break;
            case 2:
              runtime.sprites[spriteId].x2 = task.data[12];
              runtime.sprites[spriteId].y2 = task.data[12];
              break;
            case 3:
              runtime.sprites[spriteId].x2 = -task.data[12];
              runtime.sprites[spriteId].y2 = -task.data[12];
              break;
          }
        }
        if (++task.data[2] === 5) ++task.data[0];
      }
      break;
    case 1:
      if (task.data[1] & 1) --task.data[3];
      else ++task.data[4];
      setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(task.data[3], task.data[4]));
      if (++task.data[1] === 32) {
        for (let i = 8; i < 13; ++i) if (task.data[i] !== MAX_SPRITES) destroySprite(runtime.sprites[task.data[i]]);
        ++task.data[0];
      }
      break;
    case 2:
      ++task.data[0];
      break;
    case 3:
      setGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
      setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimRedX_Step(sprite: PsychicSprite): void {
  if (sprite.data[1] > sprite.data[0] - 10) sprite.invisible = (sprite.data[1] & 1) !== 0;
  if (sprite.data[1] === sprite.data[0]) destroyAnimSprite(sprite);
  ++sprite.data[1];
}

export function AnimRedX(runtime: PsychicRuntime, sprite: PsychicSprite): void {
  if (runtime.battleAnimArgs[0] === 0) {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2);
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET);
  }
  sprite.data[0] = runtime.battleAnimArgs[1];
  sprite.callback = 'AnimRedX_Step';
}

export function AnimTask_SkillSwap(runtime: PsychicRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (runtime.contest) {
    if (runtime.battleAnimArgs[0] === ANIM_TARGET) {
      task.data[10] = -10;
      task.data[11] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimTarget, BATTLER_COORD_ATTR_RIGHT) - 8;
      task.data[12] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimTarget, BATTLER_COORD_ATTR_TOP) + 8;
      task.data[13] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_RIGHT) - 8;
      task.data[14] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_TOP) + 8;
    } else {
      task.data[10] = 10;
      task.data[11] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_LEFT) + 8;
      task.data[12] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_BOTTOM) - 8;
      task.data[13] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimTarget, BATTLER_COORD_ATTR_LEFT) + 8;
      task.data[14] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimTarget, BATTLER_COORD_ATTR_BOTTOM) - 8;
    }
  } else if (runtime.battleAnimArgs[0] === 1) {
    task.data[10] = -10;
    task.data[11] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimTarget, BATTLER_COORD_ATTR_LEFT) + 8;
    task.data[12] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimTarget, BATTLER_COORD_ATTR_TOP) + 8;
    task.data[13] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_LEFT) + 8;
    task.data[14] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_TOP) + 8;
  } else {
    task.data[10] = 10;
    task.data[11] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_RIGHT) - 8;
    task.data[12] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, BATTLER_COORD_ATTR_BOTTOM) - 8;
    task.data[13] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimTarget, BATTLER_COORD_ATTR_RIGHT) - 8;
    task.data[14] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimTarget, BATTLER_COORD_ATTR_BOTTOM) - 8;
  }
  task.data[1] = 6;
  task.func = 'AnimTask_SkillSwap_Step';
}

export function AnimTask_SkillSwap_Step(runtime: PsychicRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] > 6) {
        task.data[1] = 0;
        const spriteId = createSprite(runtime, sSkillSwapOrbSpriteTemplate, task.data[11], task.data[12], 0);
        if (spriteId !== 64) {
          runtime.sprites[spriteId].data[0] = 16;
          runtime.sprites[spriteId].data[2] = task.data[13];
          runtime.sprites[spriteId].data[4] = task.data[14];
          runtime.sprites[spriteId].data[5] = task.data[10];
          initAnimArcTranslation(runtime.sprites[spriteId]);
          startSpriteAffineAnim(runtime.sprites[spriteId], task.data[2] & 3);
        }
        if (++task.data[2] === 12) ++task.data[0];
      }
      break;
    case 1:
      if (++task.data[1] > 17) destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimSkillSwapOrb(sprite: PsychicSprite): void {
  if (translateAnimHorizontalArc(sprite)) {
    freeOamMatrix(sprite.oam.matrixNum);
    destroySprite(sprite);
  }
}

export function AnimTask_ExtrasensoryDistortion(runtime: PsychicRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const yOffset = getBattlerYCoordWithElevation(runtime, runtime.battleAnimTarget);
  task.data[14] = yOffset - 32;
  switch (runtime.battleAnimArgs[0]) {
    case 0:
      task.data[11] = 2;
      task.data[12] = 5;
      task.data[13] = 64;
      task.data[15] = yOffset + 32;
      break;
    case 1:
      task.data[11] = 2;
      task.data[12] = 5;
      task.data[13] = 192;
      task.data[15] = yOffset + 32;
      break;
    case 2:
      task.data[11] = 4;
      task.data[12] = 4;
      task.data[13] = 0;
      task.data[15] = yOffset + 32;
      break;
  }
  if (task.data[14] < 0) task.data[14] = 0;
  const scanlineParams: { dmaDest?: string; dmaControl?: string; initState?: number; unused9?: number } = {};
  if (getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimTarget) === 1) {
    task.data[10] = runtime.battleBg1X;
    scanlineParams.dmaDest = 'REG_BG1HOFS';
  } else {
    task.data[10] = runtime.battleBg2X;
    scanlineParams.dmaDest = 'REG_BG2HOFS';
  }
  for (let i = task.data[14]; i <= task.data[14] + 64; ++i) {
    runtime.scanlineEffectRegBuffers[0][i] = task.data[10];
    runtime.scanlineEffectRegBuffers[1][i] = task.data[10];
  }
  scanlineParams.dmaControl = 'SCANLINE_EFFECT_DMACNT_16BIT';
  scanlineParams.initState = 1;
  scanlineParams.unused9 = 0;
  scanlineEffectSetParams(runtime, scanlineParams);
  task.func = 'AnimTask_ExtrasensoryDistortion_Step';
}

export function AnimTask_ExtrasensoryDistortion_Step(runtime: PsychicRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0: {
      let sineIndex = task.data[13];
      for (let i = task.data[14]; i <= task.data[15]; ++i) {
        let var2 = gSineTable[sineIndex] >> task.data[12];
        if (var2 > 0) var2 += task.data[1] & 3;
        else if (var2 < 0) var2 -= task.data[1] & 3;
        runtime.scanlineEffectRegBuffers[0][i] = task.data[10] + var2;
        runtime.scanlineEffectRegBuffers[1][i] = task.data[10] + var2;
        sineIndex += task.data[11];
      }
      if (++task.data[1] > 23) ++task.data[0];
      break;
    }
    case 1:
      runtime.scanlineEffect.state = 3;
      ++task.data[0];
      break;
    case 2:
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimTask_TransparentCloneGrowAndShrink(runtime: PsychicRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const matrixNum = allocOamMatrix(runtime);
  if (matrixNum === 0xff) {
    destroyAnimVisualTask(runtime, taskId);
    return;
  }
  const spriteId = cloneBattlerSpriteWithBlend(runtime, runtime.battleAnimArgs[0]);
  if (spriteId < 0) {
    freeOamMatrix(matrixNum);
    destroyAnimVisualTask(runtime, taskId);
    return;
  }
  runtime.sprites[spriteId].callback = 'SpriteCallbackDummy';
  runtime.sprites[spriteId].oam.affineMode = ST_OAM_AFFINE_DOUBLE;
  runtime.sprites[spriteId].oam.matrixNum = matrixNum;
  runtime.sprites[spriteId].affineAnimPaused = true;
  ++runtime.sprites[spriteId].subpriority;
  setSpriteRotScale(runtime, spriteId, 256, 256, 0);
  calcCenterToCornerVec(runtime, runtime.sprites[spriteId], runtime.sprites[spriteId].oam.shape, runtime.sprites[spriteId].oam.size, runtime.sprites[spriteId].oam.affineMode);
  task.data[13] = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[0]);
  task.data[14] = matrixNum;
  task.data[15] = spriteId;
  task.func = 'AnimTask_TransparentCloneGrowAndShrink_Step';
}

export function AnimTask_TransparentCloneGrowAndShrink_Step(runtime: PsychicRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      task.data[1] += 4;
      task.data[2] = 256 - (gSineTable[task.data[1]] >> 1);
      setSpriteRotScale(runtime, task.data[15], task.data[2], task.data[2], 0);
      setBattlerSpriteYOffsetFromOtherYScale(runtime, task.data[15], task.data[13]);
      if (task.data[1] === 48) ++task.data[0];
      break;
    case 1:
      task.data[1] -= 4;
      task.data[2] = 256 - (gSineTable[task.data[1]] >> 1);
      setSpriteRotScale(runtime, task.data[15], task.data[2], task.data[2], 0);
      setBattlerSpriteYOffsetFromOtherYScale(runtime, task.data[15], task.data[13]);
      if (task.data[1] === 0) ++task.data[0];
      break;
    case 2:
      destroySpriteWithActiveSheet(runtime, runtime.sprites[task.data[15]]);
      ++task.data[0];
      break;
    case 3:
      freeOamMatrix(task.data[14]);
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimPsychoBoost(runtime: PsychicRuntime, sprite: PsychicSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X);
      sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y);
      if (runtime.contest) sprite.y += 12;
      sprite.data[1] = 8;
      setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND);
      setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(sprite.data[1], 16 - sprite.data[1]));
      ++sprite.data[0];
      break;
    case 1:
      if (sprite.affineAnimEnded) {
        playSe12WithPanning(runtime, SE_M_TELEPORT, battleAnimAdjustPanning(-64));
        changeSpriteAffineAnim(sprite, 1);
        ++sprite.data[0];
      }
      break;
    case 2:
      if (sprite.data[2]++ > 1) {
        sprite.data[2] = 0;
        --sprite.data[1];
        setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(sprite.data[1], 16 - sprite.data[1]));
        if (sprite.data[1] === 0) {
          ++sprite.data[0];
          sprite.invisible = true;
        }
      }
      sprite.data[3] += 0x380;
      sprite.y2 -= sprite.data[3] >> 8;
      sprite.data[3] &= 0xff;
      break;
    case 3:
      setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
      setGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
      destroyAnimSprite(sprite);
      break;
  }
}

export const animDefensiveWall = AnimDefensiveWall;
export const animDefensiveWallStep2 = AnimDefensiveWall_Step2;
export const animDefensiveWallStep3 = AnimDefensiveWall_Step3;
export const animDefensiveWallStep4 = AnimDefensiveWall_Step4;
export const animDefensiveWallStep5 = AnimDefensiveWall_Step5;
export const animWallSparkle = AnimWallSparkle;
export const animBentSpoon = AnimBentSpoon;
export const animQuestionMark = AnimQuestionMark;
export const animQuestionMarkStep1 = AnimQuestionMark_Step1;
export const animQuestionMarkStep2 = AnimQuestionMark_Step2;
export const animTaskMeditateStretchAttacker = AnimTask_MeditateStretchAttacker;
export const animTaskMeditateStretchAttackerStep = AnimTask_MeditateStretchAttacker_Step;
export const animTaskTeleport = AnimTask_Teleport;
export const animTaskTeleportStep = AnimTask_Teleport_Step;
export const animTaskImprisonOrbs = AnimTask_ImprisonOrbs;
export const animTaskImprisonOrbsStep = AnimTask_ImprisonOrbs_Step;
export const animRedXStep = AnimRedX_Step;
export const animRedX = AnimRedX;
export const animTaskSkillSwap = AnimTask_SkillSwap;
export const animTaskSkillSwapStep = AnimTask_SkillSwap_Step;
export const animSkillSwapOrb = AnimSkillSwapOrb;
export const animTaskExtrasensoryDistortion = AnimTask_ExtrasensoryDistortion;
export const animTaskExtrasensoryDistortionStep = AnimTask_ExtrasensoryDistortion_Step;
export const animTaskTransparentCloneGrowAndShrink = AnimTask_TransparentCloneGrowAndShrink;
export const animTaskTransparentCloneGrowAndShrinkStep = AnimTask_TransparentCloneGrowAndShrink_Step;
export const animPsychoBoost = AnimPsychoBoost;

const bldAlphaBlend = (eva: number, evb: number): number => (eva & 0x1f) | ((evb & 0x1f) << 8);
const objPlttId = (index: number): number => index * 16;
const getBattlerSide = (runtime: PsychicRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const getBattlerAtPosition = (runtime: PsychicRuntime, position: number): number => runtime.battlerAtPosition[position] ?? 0;
const battlePartner = (battler: number): number => battler ^ 2;
const isBattlerSpriteVisible = (runtime: PsychicRuntime, battler: number): boolean => runtime.battlerVisible[battler] === true;
const getBattlerSpriteBgPriorityRank = (runtime: PsychicRuntime, battler: number): number => runtime.battlerBgPriorityRanks[battler] ?? 0;
const indexOfSpritePaletteTag = (runtime: PsychicRuntime, tag: string | number): number => runtime.paletteTagIndexes[tag] ?? (typeof tag === 'number' ? tag : 0);
const setGpuReg = (runtime: PsychicRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value;
  runtime.operations.push(`SetGpuReg:${reg}:${value}`);
};
const moveBattlerSpriteToBg = (runtime: PsychicRuntime, battler: number, toBg2: boolean | number): void => {
  runtime.operations.push(`MoveBattlerSpriteToBG:${battler}:${Number(toBg2)}`);
};
const resetBattleAnimBg = (runtime: PsychicRuntime, toBg2: boolean | number): void => {
  runtime.operations.push(`ResetBattleAnimBg:${Number(toBg2)}`);
};
const getAnimBattlerSpriteId = (runtime: PsychicRuntime, animBattler: number): number => {
  const battler = animBattler === ANIM_ATTACKER ? runtime.battleAnimAttacker : animBattler === ANIM_TARGET ? runtime.battleAnimTarget : animBattler;
  return runtime.battlerSpriteIds[battler] ?? MAX_SPRITES;
};
const coords = (runtime: PsychicRuntime, battler: number) => runtime.battlerCoords[battler] ?? runtime.battlerCoords[0];
const getBattlerSpriteCoord = (runtime: PsychicRuntime, battler: number, coord: string): number => {
  const c = coords(runtime, battler);
  switch (coord) {
    case BATTLER_COORD_X:
      return c.x;
    case BATTLER_COORD_Y:
      return c.y;
    case BATTLER_COORD_X_2:
      return c.x2;
    case BATTLER_COORD_Y_PIC_OFFSET:
      return c.yPicOffset;
    default:
      return 0;
  }
};
const getBattlerSpriteCoordAttr = (runtime: PsychicRuntime, battler: number, attr: string): number => {
  const c = coords(runtime, battler);
  switch (attr) {
    case BATTLER_COORD_ATTR_WIDTH:
      return c.width;
    case BATTLER_COORD_ATTR_HEIGHT:
      return c.height;
    case BATTLER_COORD_ATTR_LEFT:
      return c.left;
    case BATTLER_COORD_ATTR_RIGHT:
      return c.right;
    case BATTLER_COORD_ATTR_TOP:
      return c.top;
    case BATTLER_COORD_ATTR_BOTTOM:
      return c.bottom;
    default:
      return 0;
  }
};
const getBattlerYCoordWithElevation = (runtime: PsychicRuntime, battler: number): number => coords(runtime, battler).yWithElevation;
const initSpritePosToAnimAttacker = (runtime: PsychicRuntime, sprite: PsychicSprite, _respectMonPicOffsets: boolean): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2) + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET) + runtime.battleAnimArgs[1];
};
const initSpritePosToAnimTarget = (runtime: PsychicRuntime, sprite: PsychicSprite, _respectMonPicOffsets: boolean): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_X_2) + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_Y_PIC_OFFSET) + runtime.battleAnimArgs[1];
};
const startSpriteAnim = (sprite: PsychicSprite, animIndex: number): void => {
  sprite.animIndex = animIndex;
};
const storeSpriteCallbackInData6 = (sprite: PsychicSprite, callback: PsychicCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const destroyAnimSprite = (sprite: PsychicSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const destroySprite = (sprite: PsychicSprite): void => {
  sprite.destroyed = true;
};
const destroySpriteAndMatrix = (sprite: PsychicSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroySpriteAndMatrix';
};
const freeOamMatrix = (_matrixNum: number): void => {};
const initSpriteAffineAnim = (sprite: PsychicSprite): void => {
  sprite.affineAnimEnded = false;
};
const prepareAffineAnimInTaskData = (task: PsychicTask, _spriteId: number, affineAnim: readonly unknown[]): void => {
  task.affineFramesRemaining = affineAnim.reduce<number>((total, cmd) => {
    if (typeof cmd === 'object' && cmd !== null && 'duration' in cmd) {
      return total + Number((cmd as { duration: number }).duration);
    }
    return total;
  }, 0);
};
const runAffineAnimFromTaskData = (task: PsychicTask): boolean => {
  if (task.affineFramesRemaining > 0) {
    --task.affineFramesRemaining;
    return true;
  }
  return false;
};
const destroyAnimVisualTask = (runtime: PsychicRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};
const resetSpriteRotScale = (runtime: PsychicRuntime, spriteId: number): void => {
  runtime.sprites[spriteId].rotScale = null;
  runtime.operations.push(`ResetSpriteRotScale:${spriteId}`);
};
const createSprite = (runtime: PsychicRuntime, templateArg: PsychicSpriteTemplate, x: number, y: number, subpriority: number): number => {
  const spriteId = runtime.sprites.findIndex((sprite) => sprite.destroyed);
  const id = spriteId >= 0 ? spriteId : runtime.sprites.findIndex((sprite, index) => index >= 4 && sprite.callback === 'SpriteCallbackDummy' && !sprite.destroyed && sprite.x === 0 && sprite.y === 0 && sprite.data.every((value) => value === 0));
  if (id < 0 || id >= MAX_SPRITES) return MAX_SPRITES;
  const sprite = createPsychicSprite();
  sprite.x = x;
  sprite.y = y;
  sprite.subpriority = subpriority;
  sprite.callback = templateArg.callback;
  sprite.affineAnims = templateArg.affineAnims;
  runtime.sprites[id] = sprite;
  runtime.operations.push(`CreateSprite:${templateArg.tileTag}:${id}:${x}:${y}:${subpriority}`);
  return id;
};
const initAnimArcTranslation = (sprite: PsychicSprite): void => {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  sprite.data[6] = 0;
};
const startSpriteAffineAnim = (sprite: PsychicSprite, animIndex: number): void => {
  sprite.affineAnimIndex = animIndex;
};
const translateAnimHorizontalArc = (sprite: PsychicSprite): boolean => {
  if (sprite.data[0] <= 0) return true;
  const duration = sprite.data[0];
  const elapsed = ++sprite.data[6];
  sprite.x2 = Math.trunc(((sprite.data[2] - sprite.data[1]) * elapsed) / duration);
  sprite.y2 = Math.trunc(((sprite.data[4] - sprite.data[3]) * elapsed) / duration) + ((gSineTable[(elapsed * 256 / duration) & 0xff] * sprite.data[5]) >> 8);
  return elapsed >= duration;
};
const scanlineEffectSetParams = (runtime: PsychicRuntime, params: unknown): void => {
  runtime.scanlineEffect.params = params;
  runtime.operations.push('ScanlineEffect_SetParams');
};
const allocOamMatrix = (runtime: PsychicRuntime): number => {
  if (runtime.allocMatrixFails) return 0xff;
  return runtime.nextMatrixNum++;
};
const cloneBattlerSpriteWithBlend = (runtime: PsychicRuntime, animBattler: number): number => {
  if (runtime.cloneFails) return -1;
  const sourceId = getAnimBattlerSpriteId(runtime, animBattler);
  const id = createSprite(runtime, template('CLONE', 'clone', 'clone', 'clone', 'SpriteCallbackDummy'), runtime.sprites[sourceId].x, runtime.sprites[sourceId].y, runtime.sprites[sourceId].subpriority);
  runtime.operations.push(`CloneBattlerSpriteWithBlend:${animBattler}:${id}`);
  return id;
};
const setSpriteRotScale = (runtime: PsychicRuntime, spriteId: number, xScale: number, yScale: number, rotation: number): void => {
  runtime.sprites[spriteId].rotScale = { xScale, yScale, rotation };
  runtime.operations.push(`SetSpriteRotScale:${spriteId}:${xScale}:${yScale}:${rotation}`);
};
const calcCenterToCornerVec = (runtime: PsychicRuntime, _sprite: PsychicSprite, shape: number, size: number, affineMode: number): void => {
  runtime.operations.push(`CalcCenterToCornerVec:${shape}:${size}:${affineMode}`);
};
const setBattlerSpriteYOffsetFromOtherYScale = (runtime: PsychicRuntime, spriteId: number, otherSpriteId: number): void => {
  runtime.sprites[spriteId].yOffsetFromOtherScale = otherSpriteId;
  runtime.operations.push(`SetBattlerSpriteYOffsetFromOtherYScale:${spriteId}:${otherSpriteId}`);
};
const destroySpriteWithActiveSheet = (runtime: PsychicRuntime, sprite: PsychicSprite): void => {
  sprite.destroyed = true;
  runtime.operations.push('DestroySpriteWithActiveSheet');
};
const playSe12WithPanning = (runtime: PsychicRuntime, song: string, pan: number): void => {
  runtime.sounds.push({ song, pan });
};
const battleAnimAdjustPanning = (pan: number): number => pan;
const changeSpriteAffineAnim = (sprite: PsychicSprite, animIndex: number): void => {
  sprite.affineAnimIndex = animIndex;
  sprite.affineAnimEnded = false;
};
