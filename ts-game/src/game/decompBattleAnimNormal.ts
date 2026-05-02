import { cos, sin } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const ANIM_ATK_PARTNER = 2;
export const ANIM_DEF_PARTNER = 3;
export const SPRITE_NONE = 0xff;

export type NormalCallback =
  | 'AnimConfusionDuck'
  | 'AnimConfusionDuck_Step'
  | 'AnimSimplePaletteBlend'
  | 'AnimSimplePaletteBlend_Step'
  | 'AnimComplexPaletteBlend'
  | 'AnimComplexPaletteBlend_Step1'
  | 'AnimComplexPaletteBlend_Step2'
  | 'AnimCirclingSparkle'
  | 'TranslateSpriteInGrowingCircle'
  | 'AnimShakeMonOrBattleTerrain'
  | 'AnimShakeMonOrBattleTerrain_Step'
  | 'AnimHitSplatBasic'
  | 'AnimHitSplatHandleInvert'
  | 'AnimHitSplatRandom'
  | 'AnimHitSplatOnMonEdge'
  | 'AnimCrossImpact'
  | 'AnimFlashingHitSplat'
  | 'AnimFlashingHitSplat_Step'
  | 'AnimHitSplatPersistent'
  | 'RunStoredCallbackWhenAffineAnimEnds'
  | 'WaitAnimForDuration'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix'
  | 'DestroyAnimSpriteAfterTimer';

export type NormalTaskFunc =
  | 'AnimTask_BlendColorCycleLoop'
  | 'AnimTask_BlendColorCycleExcludeLoop'
  | 'AnimTask_BlendColorCycleByTagLoop'
  | 'AnimTask_FlashAnimTagWithColor_Step1'
  | 'AnimTask_FlashAnimTagWithColor_Step2'
  | 'AnimTask_ShakeBattleTerrain_Step'
  | 'DestroyAnimVisualTask';

export interface NormalSpriteTemplate {
  tileTag: string | number;
  paletteTag: string | number;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: NormalCallback;
}

export interface NormalSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: NormalCallback;
  storedCallback: NormalCallback | null;
  destroyed: boolean;
  invisible: boolean;
  animIndex: number;
  affineAnimIndex: number;
  coordOffsetEnabled: boolean;
  oam: { priority: number; paletteNum: number };
  templatePaletteTag: number;
}

export interface NormalTask {
  data: number[];
  func: NormalTaskFunc;
  destroyed: boolean;
}

export interface NormalRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  battlersCount: number;
  battlerSides: Record<number, number>;
  battlerSpriteIds: Record<number, number>;
  healthboxSpriteIds: Record<number, number>;
  battlerCoords: Record<number, { x2: number; yPicOffset: number }>;
  sprites: NormalSprite[];
  tasks: Array<NormalTask | null>;
  randomValues: number[];
  contest: boolean;
  paletteFadeActive: boolean;
  paletteTagIndexes: Record<number, number>;
  battleBg3X: number;
  battleBg3Y: number;
  spriteCoordOffsetX: number;
  spriteCoordOffsetY: number;
  shakeRefs: Record<number, 'battleBg3X' | 'battleBg3Y' | 'spriteCoordOffsetX' | 'spriteCoordOffsetY'>;
  operations: string[];
  paletteFades: Array<{ palettes: number; delay: number; start: number; end: number; color: number }>;
  paletteBlends: Array<{ palettes: number; amount: number; color: number }>;
  invertedPalettes: number[];
  tintedPalettes: Array<{ palettes: number; r: number; g: number; b: number }>;
  unfadedPalettes: number[];
}

export const sAnimsConfusionDuck = [
  [{ frame: 0, duration: 8 }, { frame: 4, duration: 8 }, { frame: 0, duration: 8, hFlip: true }, { frame: 8, duration: 8 }, { jump: 0 }],
  [{ frame: 0, duration: 8, hFlip: true }, { frame: 4, duration: 8 }, { frame: 0, duration: 8 }, { frame: 8, duration: 8 }, { jump: 0 }]
] as const;
export const sAffineAnimsHitSplat = [
  [{ xScale: 0, yScale: 0, rotation: 0, duration: 8 }, { end: true }],
  [{ xScale: 0xd8, yScale: 0xd8, rotation: 0, duration: 0 }, { xScale: 0, yScale: 0, rotation: 0, duration: 8 }, { end: true }],
  [{ xScale: 0xb0, yScale: 0xb0, rotation: 0, duration: 0 }, { xScale: 0, yScale: 0, rotation: 0, duration: 8 }, { end: true }],
  [{ xScale: 0x80, yScale: 0x80, rotation: 0, duration: 0 }, { xScale: 0, yScale: 0, rotation: 0, duration: 8 }, { end: true }]
] as const;
export const sAnimCirclingSparkle = [{ frame: 0, duration: 3 }, { frame: 16, duration: 3 }, { frame: 32, duration: 3 }, { frame: 48, duration: 3 }, { frame: 64, duration: 3 }, { jump: 0 }] as const;

export const gConfusionDuckSpriteTemplate: NormalSpriteTemplate = {
  tileTag: 'ANIM_TAG_DUCK',
  paletteTag: 'ANIM_TAG_DUCK',
  oam: 'gOamData_AffineOff_ObjNormal_16x16',
  anims: sAnimsConfusionDuck,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimConfusionDuck'
};
export const gSimplePaletteBlendSpriteTemplate: NormalSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: 'gDummyOamData', anims: 'gDummySpriteAnimTable', images: null, affineAnims: 'gDummySpriteAffineAnimTable', callback: 'AnimSimplePaletteBlend' };
export const gComplexPaletteBlendSpriteTemplate: NormalSpriteTemplate = { ...gSimplePaletteBlendSpriteTemplate, callback: 'AnimComplexPaletteBlend' };
export const sCirclingSparkleSpriteTemplate: NormalSpriteTemplate = { tileTag: 'ANIM_TAG_SPARKLE_4', paletteTag: 'ANIM_TAG_SPARKLE_4', oam: 'gOamData_AffineOff_ObjNormal_32x32', anims: [sAnimCirclingSparkle], images: null, affineAnims: 'gDummySpriteAffineAnimTable', callback: 'AnimCirclingSparkle' };
export const gShakeMonOrTerrainSpriteTemplate: NormalSpriteTemplate = { ...gSimplePaletteBlendSpriteTemplate, callback: 'AnimShakeMonOrBattleTerrain' };
export const gBasicHitSplatSpriteTemplate: NormalSpriteTemplate = { tileTag: 'ANIM_TAG_IMPACT', paletteTag: 'ANIM_TAG_IMPACT', oam: 'gOamData_AffineNormal_ObjBlend_32x32', anims: 'gDummySpriteAnimTable', images: null, affineAnims: sAffineAnimsHitSplat, callback: 'AnimHitSplatBasic' };
export const gHandleInvertHitSplatSpriteTemplate: NormalSpriteTemplate = { ...gBasicHitSplatSpriteTemplate, callback: 'AnimHitSplatHandleInvert' };
export const gWaterHitSplatSpriteTemplate: NormalSpriteTemplate = { ...gBasicHitSplatSpriteTemplate, tileTag: 'ANIM_TAG_WATER_IMPACT', paletteTag: 'ANIM_TAG_WATER_IMPACT' };
export const gRandomPosHitSplatSpriteTemplate: NormalSpriteTemplate = { ...gBasicHitSplatSpriteTemplate, callback: 'AnimHitSplatRandom' };
export const gMonEdgeHitSplatSpriteTemplate: NormalSpriteTemplate = { ...gBasicHitSplatSpriteTemplate, callback: 'AnimHitSplatOnMonEdge' };
export const gCrossImpactSpriteTemplate: NormalSpriteTemplate = { tileTag: 'ANIM_TAG_CROSS_IMPACT', paletteTag: 'ANIM_TAG_CROSS_IMPACT', oam: 'gOamData_AffineOff_ObjBlend_32x32', anims: 'gDummySpriteAnimTable', images: null, affineAnims: 'gDummySpriteAffineAnimTable', callback: 'AnimCrossImpact' };
export const gFlashingHitSplatSpriteTemplate: NormalSpriteTemplate = { ...gBasicHitSplatSpriteTemplate, oam: 'gOamData_AffineNormal_ObjNormal_32x32', callback: 'AnimFlashingHitSplat' };
export const gPersistHitSplatSpriteTemplate: NormalSpriteTemplate = { ...gBasicHitSplatSpriteTemplate, callback: 'AnimHitSplatPersistent' };

export const createNormalSprite = (): NormalSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 16 }, () => 0),
  callback: 'AnimConfusionDuck',
  storedCallback: null,
  destroyed: false,
  invisible: false,
  animIndex: 0,
  affineAnimIndex: 0,
  coordOffsetEnabled: false,
  oam: { priority: 0, paletteNum: 0 },
  templatePaletteTag: 0
});

export const createNormalRuntime = (overrides: Partial<NormalRuntime> = {}): NormalRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  battlersCount: overrides.battlersCount ?? 4,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  healthboxSpriteIds: overrides.healthboxSpriteIds ?? { 0: 4, 1: 5, 2: 6, 3: 7 },
  battlerCoords: overrides.battlerCoords ?? {
    0: { x2: 48, yPicOffset: 64 },
    1: { x2: 176, yPicOffset: 72 },
    2: { x2: 88, yPicOffset: 88 },
    3: { x2: 216, yPicOffset: 86 }
  },
  sprites: overrides.sprites ?? Array.from({ length: 64 }, () => createNormalSprite()),
  tasks: overrides.tasks ?? [],
  randomValues: overrides.randomValues ?? [],
  contest: overrides.contest ?? false,
  paletteFadeActive: overrides.paletteFadeActive ?? false,
  paletteTagIndexes: overrides.paletteTagIndexes ?? {},
  battleBg3X: overrides.battleBg3X ?? 0,
  battleBg3Y: overrides.battleBg3Y ?? 0,
  spriteCoordOffsetX: overrides.spriteCoordOffsetX ?? 0,
  spriteCoordOffsetY: overrides.spriteCoordOffsetY ?? 0,
  shakeRefs: overrides.shakeRefs ?? {},
  operations: overrides.operations ?? [],
  paletteFades: overrides.paletteFades ?? [],
  paletteBlends: overrides.paletteBlends ?? [],
  invertedPalettes: overrides.invertedPalettes ?? [],
  tintedPalettes: overrides.tintedPalettes ?? [],
  unfadedPalettes: overrides.unfadedPalettes ?? []
});

export const createNormalTask = (runtime: NormalRuntime, func: NormalTaskFunc = 'DestroyAnimVisualTask'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), func, destroyed: false });
  return id;
};

export function AnimConfusionDuck(runtime: NormalRuntime, sprite: NormalSprite): void {
  sprite.x += runtime.battleAnimArgs[0];
  sprite.y += runtime.battleAnimArgs[1];
  sprite.data[0] = runtime.battleAnimArgs[2];
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.data[1] = -runtime.battleAnimArgs[3];
    sprite.data[4] = 1;
  } else {
    sprite.data[1] = runtime.battleAnimArgs[3];
    sprite.data[4] = 0;
    startSpriteAnim(sprite, 1);
  }
  sprite.data[3] = runtime.battleAnimArgs[4];
  sprite.callback = 'AnimConfusionDuck_Step';
  AnimConfusionDuck_Step(sprite);
}

export function AnimConfusionDuck_Step(sprite: NormalSprite): void {
  sprite.x2 = cos(sprite.data[0], 30);
  sprite.y2 = sin(sprite.data[0], 10);
  sprite.oam.priority = (sprite.data[0] & 0xffff) < 128 ? 1 : 3;
  sprite.data[0] = (sprite.data[0] + sprite.data[1]) & 0xff;
  if (++sprite.data[2] === sprite.data[3]) destroyAnimSprite(sprite);
}

export function AnimSimplePaletteBlend(runtime: NormalRuntime, sprite: NormalSprite): void {
  const selectedPalettes = UnpackSelectedBattlePalettes(runtime, runtime.battleAnimArgs[0]);
  beginNormalPaletteFade(runtime, selectedPalettes, runtime.battleAnimArgs[1], runtime.battleAnimArgs[2], runtime.battleAnimArgs[3], runtime.battleAnimArgs[4]);
  sprite.invisible = true;
  sprite.callback = 'AnimSimplePaletteBlend_Step';
}

export function UnpackSelectedBattlePalettes(runtime: NormalRuntime, selector: number): number {
  const battleBackground = selector & 1;
  const attacker = (selector >> 1) & 1;
  const target = (selector >> 2) & 1;
  const attackerPartner = (selector >> 3) & 1;
  const targetPartner = (selector >> 4) & 1;
  const anim1 = (selector >> 5) & 1;
  const anim2 = (selector >> 6) & 1;
  return getBattlePalettesMask(runtime, battleBackground, attacker, target, attackerPartner, targetPartner, anim1, anim2);
}

export function AnimSimplePaletteBlend_Step(runtime: NormalRuntime, sprite: NormalSprite): void {
  if (!runtime.paletteFadeActive) destroyAnimSprite(sprite);
}

export function AnimComplexPaletteBlend(runtime: NormalRuntime, sprite: NormalSprite): void {
  sprite.data[0] = runtime.battleAnimArgs[1];
  sprite.data[1] = runtime.battleAnimArgs[1];
  sprite.data[2] = runtime.battleAnimArgs[2];
  sprite.data[3] = runtime.battleAnimArgs[3];
  sprite.data[4] = runtime.battleAnimArgs[4];
  sprite.data[5] = runtime.battleAnimArgs[5];
  sprite.data[6] = runtime.battleAnimArgs[6];
  sprite.data[7] = runtime.battleAnimArgs[0];
  blendPalettes(runtime, UnpackSelectedBattlePalettes(runtime, sprite.data[7]), runtime.battleAnimArgs[4], runtime.battleAnimArgs[3]);
  sprite.invisible = true;
  sprite.callback = 'AnimComplexPaletteBlend_Step1';
}

export function AnimComplexPaletteBlend_Step1(runtime: NormalRuntime, sprite: NormalSprite): void {
  if (sprite.data[0] > 0) {
    --sprite.data[0];
    return;
  }
  if (runtime.paletteFadeActive) return;
  if (sprite.data[2] === 0) {
    sprite.callback = 'AnimComplexPaletteBlend_Step2';
    return;
  }
  const selectedPalettes = UnpackSelectedBattlePalettes(runtime, sprite.data[7]);
  if (sprite.data[1] & 0x100) blendPalettes(runtime, selectedPalettes, sprite.data[4], sprite.data[3]);
  else blendPalettes(runtime, selectedPalettes, sprite.data[6], sprite.data[5]);
  sprite.data[1] ^= 0x100;
  sprite.data[0] = sprite.data[1] & 0xff;
  --sprite.data[2];
}

export function AnimComplexPaletteBlend_Step2(runtime: NormalRuntime, sprite: NormalSprite): void {
  if (!runtime.paletteFadeActive) {
    blendPalettes(runtime, UnpackSelectedBattlePalettes(runtime, sprite.data[7]), 0, 0);
    destroyAnimSprite(sprite);
  }
}

export function AnimCirclingSparkle(runtime: NormalRuntime, sprite: NormalSprite): void {
  sprite.x += runtime.battleAnimArgs[0];
  sprite.y += runtime.battleAnimArgs[1];
  sprite.data[0] = 0;
  sprite.data[1] = 10;
  sprite.data[2] = 8;
  sprite.data[3] = 40;
  sprite.data[4] = 112;
  sprite.data[5] = 0;
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
  sprite.callback = 'TranslateSpriteInGrowingCircle';
}

export function AnimTask_BlendColorCycle(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[0];
  task.data[1] = runtime.battleAnimArgs[1];
  task.data[2] = runtime.battleAnimArgs[2];
  task.data[3] = runtime.battleAnimArgs[3];
  task.data[4] = runtime.battleAnimArgs[4];
  task.data[5] = runtime.battleAnimArgs[5];
  task.data[8] = 0;
  BlendColorCycle(runtime, taskId, 0, task.data[4]);
  task.func = 'AnimTask_BlendColorCycleLoop';
}

export function BlendColorCycle(runtime: NormalRuntime, taskId: number, startBlendAmount: number, targetBlendAmount: number): void {
  const task = runtime.tasks[taskId]!;
  beginNormalPaletteFade(runtime, UnpackSelectedBattlePalettes(runtime, task.data[0]), task.data[1], startBlendAmount, targetBlendAmount, task.data[5]);
  task.data[2]--;
  task.data[8] ^= 1;
}

export function AnimTask_BlendColorCycleLoop(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (!runtime.paletteFadeActive) {
    if (task.data[2] > 0) {
      let startBlendAmount: number;
      let targetBlendAmount: number;
      if (!task.data[8]) {
        startBlendAmount = task.data[3];
        targetBlendAmount = task.data[4];
      } else {
        startBlendAmount = task.data[4];
        targetBlendAmount = task.data[3];
      }
      if (task.data[2] === 1) targetBlendAmount = 0;
      BlendColorCycle(runtime, taskId, startBlendAmount, targetBlendAmount);
    } else {
      destroyAnimVisualTask(runtime, taskId);
    }
  }
}

export function AnimTask_BlendColorCycleExclude(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  let selectedPalettes = 0;
  task.data[0] = runtime.battleAnimArgs[0];
  task.data[1] = runtime.battleAnimArgs[1];
  task.data[2] = runtime.battleAnimArgs[2];
  task.data[3] = runtime.battleAnimArgs[3];
  task.data[4] = runtime.battleAnimArgs[4];
  task.data[5] = runtime.battleAnimArgs[5];
  task.data[8] = 0;
  for (let battler = 0; battler < runtime.battlersCount; battler++) {
    if (battler !== runtime.battleAnimAttacker && battler !== runtime.battleAnimTarget) selectedPalettes |= 1 << (battler + 16);
  }
  if (runtime.battleAnimArgs[0] === 1) selectedPalettes |= 0x0e;
  task.data[9] = selectedPalettes >> 16;
  task.data[10] = selectedPalettes & 0xff;
  BlendColorCycleExclude(runtime, taskId, 0, task.data[4]);
  task.func = 'AnimTask_BlendColorCycleExcludeLoop';
}

export function BlendColorCycleExclude(runtime: NormalRuntime, taskId: number, startBlendAmount: number, targetBlendAmount: number): void {
  const task = runtime.tasks[taskId]!;
  const selectedPalettes = ((task.data[9] & 0xffff) << 16) | (task.data[10] & 0xffff);
  beginNormalPaletteFade(runtime, selectedPalettes, task.data[1], startBlendAmount, targetBlendAmount, task.data[5]);
  task.data[2]--;
  task.data[8] ^= 1;
}

export function AnimTask_BlendColorCycleExcludeLoop(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (!runtime.paletteFadeActive) {
    if (task.data[2] > 0) {
      let startBlendAmount = task.data[8] ? task.data[4] : task.data[3];
      let targetBlendAmount = task.data[8] ? task.data[3] : task.data[4];
      if (task.data[2] === 1) targetBlendAmount = 0;
      BlendColorCycleExclude(runtime, taskId, startBlendAmount, targetBlendAmount);
    } else destroyAnimVisualTask(runtime, taskId);
  }
}

export function AnimTask_BlendColorCycleByTag(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[0];
  task.data[1] = runtime.battleAnimArgs[1];
  task.data[2] = runtime.battleAnimArgs[2];
  task.data[3] = runtime.battleAnimArgs[3];
  task.data[4] = runtime.battleAnimArgs[4];
  task.data[5] = runtime.battleAnimArgs[5];
  task.data[8] = 0;
  BlendColorCycleByTag(runtime, taskId, 0, task.data[4]);
  task.func = 'AnimTask_BlendColorCycleByTagLoop';
}

export function BlendColorCycleByTag(runtime: NormalRuntime, taskId: number, startBlendAmount: number, targetBlendAmount: number): void {
  const task = runtime.tasks[taskId]!;
  const paletteIndex = indexOfSpritePaletteTag(runtime, task.data[0]);
  beginNormalPaletteFade(runtime, 1 << (paletteIndex + 16), task.data[1], startBlendAmount, targetBlendAmount, task.data[5]);
  task.data[2]--;
  task.data[8] ^= 1;
}

export function AnimTask_BlendColorCycleByTagLoop(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (!runtime.paletteFadeActive) {
    if (task.data[2] > 0) {
      let startBlendAmount = task.data[8] ? task.data[4] : task.data[3];
      let targetBlendAmount = task.data[8] ? task.data[3] : task.data[4];
      if (task.data[2] === 1) targetBlendAmount = 0;
      BlendColorCycleByTag(runtime, taskId, startBlendAmount, targetBlendAmount);
    } else destroyAnimVisualTask(runtime, taskId);
  }
}

export function AnimTask_FlashAnimTagWithColor(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[1];
  task.data[1] = runtime.battleAnimArgs[1];
  task.data[2] = runtime.battleAnimArgs[2];
  task.data[3] = runtime.battleAnimArgs[3];
  task.data[4] = runtime.battleAnimArgs[4];
  task.data[5] = runtime.battleAnimArgs[5];
  task.data[6] = runtime.battleAnimArgs[6];
  task.data[7] = runtime.battleAnimArgs[0];
  const paletteIndex = indexOfSpritePaletteTag(runtime, runtime.battleAnimArgs[0]);
  beginNormalPaletteFade(runtime, 1 << (paletteIndex + 16), 0, runtime.battleAnimArgs[4], runtime.battleAnimArgs[4], runtime.battleAnimArgs[3]);
  task.func = 'AnimTask_FlashAnimTagWithColor_Step1';
}

export function AnimTask_FlashAnimTagWithColor_Step1(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[0] > 0) {
    --task.data[0];
    return;
  }
  if (runtime.paletteFadeActive) return;
  if (task.data[2] === 0) {
    task.func = 'AnimTask_FlashAnimTagWithColor_Step2';
    return;
  }
  const selectedPalettes = 1 << (indexOfSpritePaletteTag(runtime, task.data[7]) + 16);
  if (task.data[1] & 0x100) beginNormalPaletteFade(runtime, selectedPalettes, 0, task.data[4], task.data[4], task.data[3]);
  else beginNormalPaletteFade(runtime, selectedPalettes, 0, task.data[6], task.data[6], task.data[5]);
  task.data[1] ^= 0x100;
  task.data[0] = task.data[1] & 0xff;
  --task.data[2];
}

export function AnimTask_FlashAnimTagWithColor_Step2(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (!runtime.paletteFadeActive) {
    beginNormalPaletteFade(runtime, 1 << (indexOfSpritePaletteTag(runtime, task.data[7]) + 16), 0, 0, 0, 0);
    destroyAnimVisualTask(runtime, taskId);
  }
}

export function AnimTask_InvertScreenColor(runtime: NormalRuntime, taskId: number): void {
  let selectedPalettes = 0;
  if (runtime.battleAnimArgs[0] & 0x100) selectedPalettes = getBattlePalettesMask(runtime, 1, 0, 0, 0, 0, 0, 0);
  if (runtime.battleAnimArgs[1] & 0x100) selectedPalettes |= 0x10000 << runtime.battleAnimAttacker;
  if (runtime.battleAnimArgs[2] & 0x100) selectedPalettes |= 0x10000 << runtime.battleAnimTarget;
  runtime.invertedPalettes.push(selectedPalettes);
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_TintPalettes(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[0] === 0) {
    task.data[2] = runtime.battleAnimArgs[0];
    task.data[3] = runtime.battleAnimArgs[1];
    task.data[4] = runtime.battleAnimArgs[2];
    task.data[1] = runtime.battleAnimArgs[3];
    task.data[5] = runtime.battleAnimArgs[4];
    task.data[6] = runtime.battleAnimArgs[5];
    task.data[7] = runtime.battleAnimArgs[6];
  }
  ++task.data[0];
  let selectedPalettes = 0;
  if (task.data[2] & 0x100) selectedPalettes = 0x0000ffff;
  if (task.data[2] & 0x1) {
    const paletteIndex = indexOfSpritePaletteTag(runtime, runtime.sprites[runtime.healthboxSpriteIds[runtime.battleAnimAttacker]].templatePaletteTag);
    selectedPalettes |= (1 << paletteIndex) << 16;
  }
  if (task.data[3] & 0x100) selectedPalettes |= (1 << runtime.battleAnimAttacker) << 16;
  if (task.data[4] & 0x100) selectedPalettes |= (1 << runtime.battleAnimTarget) << 16;
  runtime.tintedPalettes.push({ palettes: selectedPalettes, r: task.data[5], g: task.data[6], b: task.data[7] });
  if (task.data[0] === task.data[1]) {
    runtime.unfadedPalettes.push(selectedPalettes);
    destroyAnimVisualTask(runtime, taskId);
  }
}

export function AnimShakeMonOrBattleTerrain(runtime: NormalRuntime, sprite: NormalSprite): void {
  sprite.invisible = true;
  sprite.data[0] = -runtime.battleAnimArgs[0];
  sprite.data[1] = runtime.battleAnimArgs[1];
  sprite.data[2] = runtime.battleAnimArgs[1];
  sprite.data[3] = runtime.battleAnimArgs[2];
  const ref = (['battleBg3X', 'battleBg3Y', 'spriteCoordOffsetX', 'spriteCoordOffsetY'] as const)[runtime.battleAnimArgs[3]] ?? 'spriteCoordOffsetY';
  runtime.shakeRefs[sprite.data[6] = sprite.data[7] = 0] = ref;
  sprite.data[4] = runtime[ref];
  sprite.data[5] = runtime.battleAnimArgs[3];
  const var0 = sprite.data[5] - 2;
  if (var0 < 2) AnimShakeMonOrBattleTerrain_UpdateCoordOffsetEnabled(runtime);
  sprite.callback = 'AnimShakeMonOrBattleTerrain_Step';
}

export function AnimShakeMonOrBattleTerrain_Step(runtime: NormalRuntime, sprite: NormalSprite): void {
  const ref = runtime.shakeRefs[0];
  if (sprite.data[3] > 0) {
    --sprite.data[3];
    if (sprite.data[1] > 0) --sprite.data[1];
    else {
      sprite.data[1] = sprite.data[2];
      runtime[ref] += sprite.data[0];
      sprite.data[0] = -sprite.data[0];
    }
  } else {
    runtime[ref] = sprite.data[4];
    const var0 = sprite.data[5] - 2;
    if (var0 < 2) for (let i = 0; i < runtime.battlersCount; ++i) runtime.sprites[runtime.battlerSpriteIds[i]].coordOffsetEnabled = false;
    destroyAnimSprite(sprite);
  }
}

export function AnimShakeMonOrBattleTerrain_UpdateCoordOffsetEnabled(runtime: NormalRuntime): void {
  runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimAttacker]].coordOffsetEnabled = false;
  runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimTarget]].coordOffsetEnabled = false;
  if (runtime.battleAnimArgs[4] === 2) {
    runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimAttacker]].coordOffsetEnabled = true;
    runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimTarget]].coordOffsetEnabled = true;
  } else if (runtime.battleAnimArgs[4] === 0) {
    runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimAttacker]].coordOffsetEnabled = true;
  } else {
    runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimTarget]].coordOffsetEnabled = true;
  }
}

export function AnimTask_ShakeBattleTerrain(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[0];
  task.data[1] = runtime.battleAnimArgs[1];
  task.data[2] = runtime.battleAnimArgs[2];
  task.data[3] = runtime.battleAnimArgs[3];
  task.data[8] = runtime.battleAnimArgs[3];
  runtime.battleBg3X = runtime.battleAnimArgs[0];
  runtime.battleBg3Y = runtime.battleAnimArgs[1];
  task.func = 'AnimTask_ShakeBattleTerrain_Step';
  AnimTask_ShakeBattleTerrain_Step(runtime, taskId);
}

export function AnimTask_ShakeBattleTerrain_Step(runtime: NormalRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[3] === 0) {
    runtime.battleBg3X = runtime.battleBg3X === task.data[0] ? -task.data[0] : task.data[0];
    runtime.battleBg3Y = runtime.battleBg3Y === -task.data[1] ? 0 : -task.data[1];
    task.data[3] = task.data[8];
    if (--task.data[2] === 0) {
      runtime.battleBg3X = 0;
      runtime.battleBg3Y = 0;
      destroyAnimVisualTask(runtime, taskId);
    }
  } else {
    task.data[3]--;
  }
}

export function AnimHitSplatBasic(runtime: NormalRuntime, sprite: NormalSprite): void {
  startSpriteAffineAnim(sprite, runtime.battleAnimArgs[3]);
  if (runtime.battleAnimArgs[2] === 0) initSpritePosToAnimAttacker(runtime, sprite, true);
  else initSpritePosToAnimTarget(runtime, sprite, true);
  sprite.callback = 'RunStoredCallbackWhenAffineAnimEnds';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimHitSplatPersistent(runtime: NormalRuntime, sprite: NormalSprite): void {
  startSpriteAffineAnim(sprite, runtime.battleAnimArgs[3]);
  if (runtime.battleAnimArgs[2] === 0) initSpritePosToAnimAttacker(runtime, sprite, true);
  else initSpritePosToAnimTarget(runtime, sprite, true);
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.callback = 'RunStoredCallbackWhenAffineAnimEnds';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSpriteAfterTimer');
}

export function AnimHitSplatHandleInvert(runtime: NormalRuntime, sprite: NormalSprite): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER && !runtime.contest) runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
  AnimHitSplatBasic(runtime, sprite);
}

export function AnimHitSplatRandom(runtime: NormalRuntime, sprite: NormalSprite): void {
  if (runtime.battleAnimArgs[1] === -1) runtime.battleAnimArgs[1] = random(runtime) & 3;
  startSpriteAffineAnim(sprite, runtime.battleAnimArgs[1]);
  if (runtime.battleAnimArgs[0] === ANIM_ATTACKER) initSpritePosToAnimAttacker(runtime, sprite, false);
  else initSpritePosToAnimTarget(runtime, sprite, false);
  sprite.x2 += (random(runtime) % 48) - 24;
  sprite.y2 += (random(runtime) % 24) - 12;
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
  sprite.callback = 'RunStoredCallbackWhenAffineAnimEnds';
}

export function AnimHitSplatOnMonEdge(runtime: NormalRuntime, sprite: NormalSprite): void {
  sprite.data[0] = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[0]);
  sprite.x = runtime.sprites[sprite.data[0]].x + runtime.sprites[sprite.data[0]].x2;
  sprite.y = runtime.sprites[sprite.data[0]].y + runtime.sprites[sprite.data[0]].y2;
  sprite.x2 = runtime.battleAnimArgs[1];
  sprite.y2 = runtime.battleAnimArgs[2];
  startSpriteAffineAnim(sprite, runtime.battleAnimArgs[3]);
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
  sprite.callback = 'RunStoredCallbackWhenAffineAnimEnds';
}

export function AnimCrossImpact(runtime: NormalRuntime, sprite: NormalSprite): void {
  if (runtime.battleAnimArgs[2] === ANIM_ATTACKER) initSpritePosToAnimAttacker(runtime, sprite, true);
  else initSpritePosToAnimTarget(runtime, sprite, true);
  sprite.data[0] = runtime.battleAnimArgs[3];
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  sprite.callback = 'WaitAnimForDuration';
}

export function AnimFlashingHitSplat(runtime: NormalRuntime, sprite: NormalSprite): void {
  startSpriteAffineAnim(sprite, runtime.battleAnimArgs[3]);
  if (runtime.battleAnimArgs[2] === ANIM_ATTACKER) initSpritePosToAnimAttacker(runtime, sprite, true);
  else initSpritePosToAnimTarget(runtime, sprite, true);
  sprite.callback = 'AnimFlashingHitSplat_Step';
}

export function AnimFlashingHitSplat_Step(sprite: NormalSprite): void {
  sprite.invisible = !sprite.invisible;
  if (sprite.data[0]++ > 12) destroyAnimSprite(sprite);
}

export const animConfusionDuck = AnimConfusionDuck;
export const animConfusionDuckStep = AnimConfusionDuck_Step;
export const animSimplePaletteBlend = AnimSimplePaletteBlend;
export const unpackSelectedBattlePalettes = UnpackSelectedBattlePalettes;
export const animSimplePaletteBlendStep = AnimSimplePaletteBlend_Step;
export const animComplexPaletteBlend = AnimComplexPaletteBlend;
export const animComplexPaletteBlendStep1 = AnimComplexPaletteBlend_Step1;
export const animComplexPaletteBlendStep2 = AnimComplexPaletteBlend_Step2;
export const animCirclingSparkle = AnimCirclingSparkle;
export const animTaskBlendColorCycle = AnimTask_BlendColorCycle;
export const blendColorCycle = BlendColorCycle;
export const animTaskBlendColorCycleLoop = AnimTask_BlendColorCycleLoop;
export const animTaskBlendColorCycleExclude = AnimTask_BlendColorCycleExclude;
export const blendColorCycleExclude = BlendColorCycleExclude;
export const animTaskBlendColorCycleExcludeLoop = AnimTask_BlendColorCycleExcludeLoop;
export const animTaskBlendColorCycleByTag = AnimTask_BlendColorCycleByTag;
export const blendColorCycleByTag = BlendColorCycleByTag;
export const animTaskBlendColorCycleByTagLoop = AnimTask_BlendColorCycleByTagLoop;
export const animTaskFlashAnimTagWithColor = AnimTask_FlashAnimTagWithColor;
export const animTaskFlashAnimTagWithColorStep1 = AnimTask_FlashAnimTagWithColor_Step1;
export const animTaskFlashAnimTagWithColorStep2 = AnimTask_FlashAnimTagWithColor_Step2;
export const animTaskInvertScreenColor = AnimTask_InvertScreenColor;
export const animTaskTintPalettes = AnimTask_TintPalettes;
export const animShakeMonOrBattleTerrain = AnimShakeMonOrBattleTerrain;
export const animShakeMonOrBattleTerrainStep = AnimShakeMonOrBattleTerrain_Step;
export const animShakeMonOrBattleTerrainUpdateCoordOffsetEnabled = AnimShakeMonOrBattleTerrain_UpdateCoordOffsetEnabled;
export const animTaskShakeBattleTerrain = AnimTask_ShakeBattleTerrain;
export const animTaskShakeBattleTerrainStep = AnimTask_ShakeBattleTerrain_Step;
export const animHitSplatBasic = AnimHitSplatBasic;
export const animHitSplatPersistent = AnimHitSplatPersistent;
export const animHitSplatHandleInvert = AnimHitSplatHandleInvert;
export const animHitSplatRandom = AnimHitSplatRandom;
export const animHitSplatOnMonEdge = AnimHitSplatOnMonEdge;
export const animCrossImpact = AnimCrossImpact;
export const animFlashingHitSplat = AnimFlashingHitSplat;
export const animFlashingHitSplatStep = AnimFlashingHitSplat_Step;

const getBattlerSide = (runtime: NormalRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const getBattlerSpriteCoord = (runtime: NormalRuntime, battler: number, coord: 'x2' | 'yPicOffset'): number =>
  runtime.battlerCoords[battler]?.[coord] ?? 0;
const getAnimBattlerSpriteId = (runtime: NormalRuntime, animBattler: number): number => {
  const battler = animBattler === ANIM_ATTACKER ? runtime.battleAnimAttacker :
    animBattler === ANIM_TARGET ? runtime.battleAnimTarget :
      animBattler === ANIM_ATK_PARTNER ? runtime.battleAnimAttacker ^ 2 :
        animBattler === ANIM_DEF_PARTNER ? runtime.battleAnimTarget ^ 2 : animBattler;
  return runtime.battlerSpriteIds[battler] ?? SPRITE_NONE;
};
const startSpriteAnim = (sprite: NormalSprite, animIndex: number): void => {
  sprite.animIndex = animIndex;
};
const startSpriteAffineAnim = (sprite: NormalSprite, animIndex: number): void => {
  sprite.affineAnimIndex = animIndex;
};
const storeSpriteCallbackInData6 = (sprite: NormalSprite, callback: NormalCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const destroyAnimSprite = (sprite: NormalSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const random = (runtime: NormalRuntime): number => runtime.randomValues.shift() ?? 0;
const indexOfSpritePaletteTag = (runtime: NormalRuntime, tag: number): number => runtime.paletteTagIndexes[tag] ?? (tag & 0xf);
const getBattlePalettesMask = (
  _runtime: NormalRuntime,
  battleBackground: number,
  attacker: number,
  target: number,
  attackerPartner: number,
  targetPartner: number,
  anim1: number,
  anim2: number
): number =>
  (battleBackground ? 0x0000_000e : 0) |
  (attacker ? 1 << 16 : 0) |
  (target ? 1 << 17 : 0) |
  (attackerPartner ? 1 << 18 : 0) |
  (targetPartner ? 1 << 19 : 0) |
  (anim1 ? 1 << 8 : 0) |
  (anim2 ? 1 << 9 : 0);
const beginNormalPaletteFade = (runtime: NormalRuntime, palettes: number, delay: number, start: number, end: number, color: number): void => {
  runtime.paletteFades.push({ palettes, delay, start, end, color });
};
const blendPalettes = (runtime: NormalRuntime, palettes: number, amount: number, color: number): void => {
  runtime.paletteBlends.push({ palettes, amount, color });
};
const destroyAnimVisualTask = (runtime: NormalRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};
const initSpritePosToAnimAttacker = (runtime: NormalRuntime, sprite: NormalSprite, respectSide: boolean): void => {
  const xOffset = respectSide && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER ? -runtime.battleAnimArgs[0] : runtime.battleAnimArgs[0];
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') + xOffset;
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset') + runtime.battleAnimArgs[1];
};
const initSpritePosToAnimTarget = (runtime: NormalRuntime, sprite: NormalSprite, respectSide: boolean): void => {
  const xOffset = respectSide && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER ? -runtime.battleAnimArgs[0] : runtime.battleAnimArgs[0];
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + xOffset;
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[1];
};
