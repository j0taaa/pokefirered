export const ANIM_TAG_TOXIC_BUBBLE = 'ANIM_TAG_TOXIC_BUBBLE';
export const ANIM_TAG_POISON_BUBBLE = 'ANIM_TAG_POISON_BUBBLE';
export const ANIM_TAG_SMALL_BUBBLES = 'ANIM_TAG_SMALL_BUBBLES';
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;

export type PoisonCallback =
  | 'AnimSludgeProjectile'
  | 'AnimAcidPoisonBubble'
  | 'AnimSludgeBombHitParticle'
  | 'AnimAcidPoisonDroplet'
  | 'AnimBubbleEffect'
  | 'AnimSludgeProjectile_Step'
  | 'AnimAcidPoisonBubble_Step'
  | 'AnimSludgeBombHitParticle_Step'
  | 'AnimBubbleEffect_Step'
  | 'StartAnimLinearTranslation'
  | 'DestroyAnimSprite'
  | 'AnimSpriteOnMonPos';

export interface PoisonSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[];
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: PoisonCallback;
}

export interface PoisonAnimSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: PoisonCallback;
  storedCallback: PoisonCallback | null;
  animIndex: number;
  affineAnimEnded: boolean;
  destroyed: boolean;
}

export interface PoisonAnimRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  battlerSides: Record<number, number>;
  battlerCoords: Record<number, { x2: number; yPicOffset: number; averageX: number; averageY: number }>;
}

export const sAnimToxicBubble = [
  { frame: 0, duration: 5 },
  { frame: 8, duration: 5 },
  { frame: 16, duration: 5 },
  { frame: 24, duration: 5 }
] as const;

export const sAnimPoisonProjectile = [{ frame: 0, duration: 1 }] as const;
export const sAnimAcidPoisonDroplet = [{ frame: 4, duration: 1 }] as const;
export const sAnimSludgeBombHit = [{ frame: 8, duration: 1 }] as const;

export const sAffineAnimPoisonProjectile = [
  { xScale: 0x160, yScale: 0x160, rotation: 0, duration: 0 },
  { xScale: -0x0a, yScale: -0x0a, rotation: 0, duration: 10 },
  { xScale: 0x0a, yScale: 0x0a, rotation: 0, duration: 10 },
  { jump: 0 }
] as const;

export const sAffineAnimSludgeBombHit = [
  { xScale: 0xec, yScale: 0xec, rotation: 0, duration: 0 }
] as const;

export const sAffineAnimAcidPoisonDroplet = [
  { xScale: -0x10, yScale: 0x10, rotation: 0, duration: 6 },
  { xScale: 0x10, yScale: -0x10, rotation: 0, duration: 6 },
  { jump: 0 }
] as const;

export const sAffineAnimBubble = [
  { xScale: 0x9c, yScale: 0x9c, rotation: 0, duration: 0 },
  { xScale: 0x05, yScale: 0x05, rotation: 0, duration: 20 }
] as const;

export const gToxicBubbleSpriteTemplate: PoisonSpriteTemplate = {
  tileTag: ANIM_TAG_TOXIC_BUBBLE,
  paletteTag: ANIM_TAG_TOXIC_BUBBLE,
  oam: 'gOamData_AffineOff_ObjNormal_16x32',
  anims: [sAnimToxicBubble],
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimSpriteOnMonPos'
};

export const gSludgeProjectileSpriteTemplate: PoisonSpriteTemplate = {
  tileTag: ANIM_TAG_POISON_BUBBLE,
  paletteTag: ANIM_TAG_POISON_BUBBLE,
  oam: 'gOamData_AffineDouble_ObjNormal_16x16',
  anims: [sAnimPoisonProjectile],
  images: null,
  affineAnims: [sAffineAnimPoisonProjectile],
  callback: 'AnimSludgeProjectile'
};

export const gAcidPoisonBubbleSpriteTemplate: PoisonSpriteTemplate = {
  tileTag: ANIM_TAG_POISON_BUBBLE,
  paletteTag: ANIM_TAG_POISON_BUBBLE,
  oam: 'gOamData_AffineDouble_ObjNormal_16x16',
  anims: [sAnimPoisonProjectile],
  images: null,
  affineAnims: [sAffineAnimPoisonProjectile],
  callback: 'AnimAcidPoisonBubble'
};

export const gSludgeBombHitParticleSpriteTemplate: PoisonSpriteTemplate = {
  tileTag: ANIM_TAG_POISON_BUBBLE,
  paletteTag: ANIM_TAG_POISON_BUBBLE,
  oam: 'gOamData_AffineNormal_ObjNormal_16x16',
  anims: [sAnimSludgeBombHit],
  images: null,
  affineAnims: [sAffineAnimSludgeBombHit],
  callback: 'AnimSludgeBombHitParticle'
};

export const gAcidPoisonDropletSpriteTemplate: PoisonSpriteTemplate = {
  tileTag: ANIM_TAG_POISON_BUBBLE,
  paletteTag: ANIM_TAG_POISON_BUBBLE,
  oam: 'gOamData_AffineDouble_ObjNormal_16x16',
  anims: [sAnimAcidPoisonDroplet],
  images: null,
  affineAnims: [sAffineAnimAcidPoisonDroplet],
  callback: 'AnimAcidPoisonDroplet'
};

export const gPoisonBubbleSpriteTemplate: PoisonSpriteTemplate = {
  tileTag: ANIM_TAG_POISON_BUBBLE,
  paletteTag: ANIM_TAG_POISON_BUBBLE,
  oam: 'gOamData_AffineNormal_ObjNormal_16x16',
  anims: [sAnimPoisonProjectile],
  images: null,
  affineAnims: [sAffineAnimBubble],
  callback: 'AnimBubbleEffect'
};

export const gWaterBubbleSpriteTemplate: PoisonSpriteTemplate = {
  tileTag: ANIM_TAG_SMALL_BUBBLES,
  paletteTag: ANIM_TAG_SMALL_BUBBLES,
  oam: 'gOamData_AffineNormal_ObjBlend_16x16',
  anims: ['gAnims_WaterBubble'],
  images: null,
  affineAnims: [sAffineAnimBubble],
  callback: 'AnimBubbleEffect'
};

export const createPoisonAnimRuntime = (): PoisonAnimRuntime => ({
  battleAnimArgs: Array.from({ length: 8 }, () => 0),
  battleAnimAttacker: 0,
  battleAnimTarget: 1,
  battlerSides: {
    0: B_SIDE_PLAYER,
    1: B_SIDE_OPPONENT
  },
  battlerCoords: {
    0: { x2: 40, yPicOffset: 72, averageX: 40, averageY: 72 },
    1: { x2: 168, yPicOffset: 64, averageX: 168, averageY: 64 }
  }
});

export const createPoisonAnimSprite = (x = 0, y = 0): PoisonAnimSprite => ({
  x,
  y,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  callback: 'AnimSpriteOnMonPos',
  storedCallback: null,
  animIndex: 0,
  affineAnimEnded: false,
  destroyed: false
});

export const sin = (angle: number, amplitude: number): number =>
  Math.round(Math.sin(((angle & 0xff) * Math.PI * 2) / 256) * amplitude);

const getBattlerSide = (runtime: PoisonAnimRuntime, battler: number): number =>
  runtime.battlerSides[battler] ?? B_SIDE_PLAYER;

const getTargetCoords = (runtime: PoisonAnimRuntime): { x: number; y: number } => {
  const coords = runtime.battlerCoords[runtime.battleAnimTarget] ?? runtime.battlerCoords[1];
  return { x: coords.x2, y: coords.yPicOffset };
};

const getAverageBattlerPositions = (runtime: PoisonAnimRuntime): { x: number; y: number } => {
  const coords = runtime.battlerCoords[runtime.battleAnimTarget] ?? runtime.battlerCoords[1];
  return { x: coords.averageX, y: coords.averageY };
};

const startSpriteAnim = (sprite: PoisonAnimSprite, animIndex: number): void => {
  sprite.animIndex = animIndex & 0xff;
};

const destroyAnimSprite = (sprite: PoisonAnimSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};

const initSpritePosToAnimAttacker = (runtime: PoisonAnimRuntime, sprite: PoisonAnimSprite): void => {
  const coords = runtime.battlerCoords[runtime.battleAnimAttacker] ?? runtime.battlerCoords[0];
  sprite.x = coords.x2 + runtime.battleAnimArgs[0];
  sprite.y = coords.yPicOffset + runtime.battleAnimArgs[1];
};

const initSpritePosToAnimTarget = (runtime: PoisonAnimRuntime, sprite: PoisonAnimSprite): void => {
  const coords = getTargetCoords(runtime);
  sprite.x = coords.x + runtime.battleAnimArgs[0];
  sprite.y = coords.y + runtime.battleAnimArgs[1];
};

const initAnimArcTranslation = (_sprite: PoisonAnimSprite): void => {
};

const initSpriteDataForLinearTranslation = (_sprite: PoisonAnimSprite): void => {
};

const translateAnimHorizontalArc = (sprite: PoisonAnimSprite): boolean => {
  if (sprite.data[0] > 0) {
    sprite.data[0] -= 1;
  }
  return sprite.data[0] === 0;
};

const translateSpriteLinearFixedPoint = (sprite: PoisonAnimSprite): void => {
  if (sprite.data[0] > 0) {
    sprite.data[0] -= 1;
  }
};

const storeSpriteCallbackInData6 = (sprite: PoisonAnimSprite, callback: PoisonCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};

export const animSludgeProjectile = (
  runtime: PoisonAnimRuntime,
  sprite: PoisonAnimSprite
): void => {
  if (!runtime.battleAnimArgs[3]) {
    startSpriteAnim(sprite, 2);
  }
  initSpritePosToAnimAttacker(runtime, sprite);
  const target = getTargetCoords(runtime);
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[2] = target.x;
  sprite.data[4] = target.y;
  sprite.data[5] = -30;
  initAnimArcTranslation(sprite);
  sprite.callback = 'AnimSludgeProjectile_Step';
};

export const animSludgeProjectileStep = (sprite: PoisonAnimSprite): void => {
  if (translateAnimHorizontalArc(sprite)) {
    destroyAnimSprite(sprite);
  }
};

export const animAcidPoisonBubble = (
  runtime: PoisonAnimRuntime,
  sprite: PoisonAnimSprite
): void => {
  if (!runtime.battleAnimArgs[3]) {
    startSpriteAnim(sprite, 2);
  }
  initSpritePosToAnimAttacker(runtime, sprite);
  const average = getAverageBattlerPositions(runtime);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker)) {
    runtime.battleAnimArgs[4] = -runtime.battleAnimArgs[4];
  }
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[2] = average.x + runtime.battleAnimArgs[4];
  sprite.data[4] = average.y + runtime.battleAnimArgs[5];
  sprite.data[5] = -30;
  initAnimArcTranslation(sprite);
  sprite.callback = 'AnimAcidPoisonBubble_Step';
};

export const animAcidPoisonBubbleStep = (sprite: PoisonAnimSprite): void => {
  if (translateAnimHorizontalArc(sprite)) {
    destroyAnimSprite(sprite);
  }
};

export const animSludgeBombHitParticle = (
  runtime: PoisonAnimRuntime,
  sprite: PoisonAnimSprite
): void => {
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[1] = sprite.x;
  sprite.data[2] = sprite.x + runtime.battleAnimArgs[0];
  sprite.data[3] = sprite.y;
  sprite.data[4] = sprite.y + runtime.battleAnimArgs[1];
  initSpriteDataForLinearTranslation(sprite);
  sprite.data[5] = Math.trunc(sprite.data[1] / runtime.battleAnimArgs[2]);
  sprite.data[6] = Math.trunc(sprite.data[2] / runtime.battleAnimArgs[2]);
  sprite.callback = 'AnimSludgeBombHitParticle_Step';
};

export const animSludgeBombHitParticleStep = (sprite: PoisonAnimSprite): void => {
  translateSpriteLinearFixedPoint(sprite);
  sprite.data[1] -= sprite.data[5];
  sprite.data[2] -= sprite.data[6];
  if (!sprite.data[0]) {
    destroyAnimSprite(sprite);
  }
};

export const animAcidPoisonDroplet = (
  runtime: PoisonAnimRuntime,
  sprite: PoisonAnimSprite
): void => {
  const average = getAverageBattlerPositions(runtime);
  sprite.x = average.x;
  sprite.y = average.y;
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
  }
  sprite.x += runtime.battleAnimArgs[0];
  sprite.y += runtime.battleAnimArgs[1];
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[2] = sprite.x + runtime.battleAnimArgs[2];
  sprite.data[4] = sprite.y + sprite.data[0];
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
};

export const animBubbleEffect = (
  runtime: PoisonAnimRuntime,
  sprite: PoisonAnimSprite
): void => {
  if (!runtime.battleAnimArgs[2]) {
    initSpritePosToAnimTarget(runtime, sprite);
  } else {
    const average = getAverageBattlerPositions(runtime);
    sprite.x = average.x;
    sprite.y = average.y;
    if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
      runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
    }
    sprite.x += runtime.battleAnimArgs[0];
    sprite.y += runtime.battleAnimArgs[1];
  }
  sprite.callback = 'AnimBubbleEffect_Step';
};

export const animBubbleEffectStep = (sprite: PoisonAnimSprite): void => {
  sprite.data[0] = (sprite.data[0] + 0x0b) & 0xff;
  sprite.x2 = sin(sprite.data[0], 4);
  sprite.data[1] += 0x30;
  const yOffset = sprite.data[1] >> 8;
  sprite.y2 = yOffset === 0 ? 0 : -yOffset;
  if (sprite.affineAnimEnded) {
    destroyAnimSprite(sprite);
  }
};

export function AnimSludgeProjectile(
  runtime: PoisonAnimRuntime,
  sprite: PoisonAnimSprite
): void {
  animSludgeProjectile(runtime, sprite);
}

export function AnimSludgeProjectile_Step(sprite: PoisonAnimSprite): void {
  animSludgeProjectileStep(sprite);
}

export function AnimAcidPoisonBubble(
  runtime: PoisonAnimRuntime,
  sprite: PoisonAnimSprite
): void {
  animAcidPoisonBubble(runtime, sprite);
}

export function AnimAcidPoisonBubble_Step(sprite: PoisonAnimSprite): void {
  animAcidPoisonBubbleStep(sprite);
}

export function AnimSludgeBombHitParticle(
  runtime: PoisonAnimRuntime,
  sprite: PoisonAnimSprite
): void {
  animSludgeBombHitParticle(runtime, sprite);
}

export function AnimSludgeBombHitParticle_Step(sprite: PoisonAnimSprite): void {
  animSludgeBombHitParticleStep(sprite);
}

export function AnimAcidPoisonDroplet(
  runtime: PoisonAnimRuntime,
  sprite: PoisonAnimSprite
): void {
  animAcidPoisonDroplet(runtime, sprite);
}

export function AnimBubbleEffect(
  runtime: PoisonAnimRuntime,
  sprite: PoisonAnimSprite
): void {
  animBubbleEffect(runtime, sprite);
}

export function AnimBubbleEffect_Step(sprite: PoisonAnimSprite): void {
  animBubbleEffectStep(sprite);
}
