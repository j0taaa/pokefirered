export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const ANIM_ATTACKER = 0;

export type BugCallback =
  | 'AnimMegahornHorn'
  | 'AnimLeechLifeNeedle'
  | 'AnimTranslateWebThread'
  | 'AnimTranslateWebThread_Step'
  | 'AnimStringWrap'
  | 'AnimStringWrap_Step'
  | 'AnimSpiderWeb'
  | 'AnimSpiderWeb_Step'
  | 'AnimSpiderWeb_End'
  | 'AnimTranslateStinger'
  | 'AnimMissileArc'
  | 'AnimMissileArc_Step'
  | 'AnimTailGlowOrb'
  | 'StartAnimLinearTranslation'
  | 'RunStoredCallbackWhenAffineAnimEnds'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix';

export interface BugSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: string;
  images: null;
  affineAnims: string | readonly string[];
  callback: BugCallback;
}

export interface BugSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  callback: BugCallback;
  storedCallback: BugCallback | null;
  affineAnimIndex: number;
  rotScale: { xScale: number; yScale: number; rotation: number } | null;
  destroyed: boolean;
}

export interface BugRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  contest: boolean;
  battlerSides: Record<number, number>;
  battlerPositions: Record<number, number>;
  battlerCoords: Record<number, { x: number; y: number; x2: number; yPicOffset: number; averageX: number; averageY: number }>;
  gpuRegs: Record<string, number>;
}

export const gMegahornHornSpriteTemplate: BugSpriteTemplate = {
  tileTag: 'ANIM_TAG_HORN_HIT_2',
  paletteTag: 'ANIM_TAG_HORN_HIT_2',
  oam: 'gOamData_AffineDouble_ObjNormal_32x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: ['sAffineAnim_MegahornHorn_0', 'sAffineAnim_MegahornHorn_1', 'sAffineAnim_MegahornHorn_2'],
  callback: 'AnimMegahornHorn'
};

export const gLeechLifeNeedleSpriteTemplate: BugSpriteTemplate = {
  tileTag: 'ANIM_TAG_NEEDLE',
  paletteTag: 'ANIM_TAG_NEEDLE',
  oam: 'gOamData_AffineNormal_ObjNormal_16x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: ['sAffineAnim_LeechLifeNeedle_0', 'sAffineAnim_LeechLifeNeedle_1', 'sAffineAnim_LeechLifeNeedle_2'],
  callback: 'AnimLeechLifeNeedle'
};

export const gWebThreadSpriteTemplate: BugSpriteTemplate = {
  tileTag: 'ANIM_TAG_WEB_THREAD',
  paletteTag: 'ANIM_TAG_WEB_THREAD',
  oam: 'gOamData_AffineOff_ObjNormal_8x8',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimTranslateWebThread'
};

export const gStringWrapSpriteTemplate: BugSpriteTemplate = {
  tileTag: 'ANIM_TAG_STRING',
  paletteTag: 'ANIM_TAG_STRING',
  oam: 'gOamData_AffineOff_ObjNormal_64x32',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimStringWrap'
};

export const gSpiderWebSpriteTemplate: BugSpriteTemplate = {
  tileTag: 'ANIM_TAG_SPIDER_WEB',
  paletteTag: 'ANIM_TAG_SPIDER_WEB',
  oam: 'gOamData_AffineDouble_ObjBlend_64x64',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: ['sAffineAnim_SpiderWeb'],
  callback: 'AnimSpiderWeb'
};

export const gLinearStingerSpriteTemplate: BugSpriteTemplate = {
  tileTag: 'ANIM_TAG_NEEDLE',
  paletteTag: 'ANIM_TAG_NEEDLE',
  oam: 'gOamData_AffineNormal_ObjNormal_16x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimTranslateStinger'
};

export const gPinMissileSpriteTemplate: BugSpriteTemplate = {
  tileTag: 'ANIM_TAG_NEEDLE',
  paletteTag: 'ANIM_TAG_NEEDLE',
  oam: 'gOamData_AffineNormal_ObjNormal_16x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimMissileArc'
};

export const gIcicleSpearSpriteTemplate: BugSpriteTemplate = {
  tileTag: 'ANIM_TAG_ICICLE_SPEAR',
  paletteTag: 'ANIM_TAG_ICICLE_SPEAR',
  oam: 'gOamData_AffineNormal_ObjNormal_32x32',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimMissileArc'
};

export const gTailGlowOrbSpriteTemplate: BugSpriteTemplate = {
  tileTag: 'ANIM_TAG_CIRCLE_OF_LIGHT',
  paletteTag: 'ANIM_TAG_CIRCLE_OF_LIGHT',
  oam: 'gOamData_AffineNormal_ObjBlend_64x64',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: ['sAffineAnim_TailGlowOrb'],
  callback: 'AnimTailGlowOrb'
};

export const createBugRuntime = (): BugRuntime => ({
  battleAnimArgs: Array.from({ length: 8 }, () => 0),
  battleAnimAttacker: 0,
  battleAnimTarget: 1,
  contest: false,
  battlerSides: { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT },
  battlerPositions: { 0: B_POSITION_PLAYER_LEFT, 1: B_POSITION_OPPONENT_LEFT },
  battlerCoords: {
    0: { x: 40, y: 80, x2: 48, yPicOffset: 64, averageX: 48, averageY: 64 },
    1: { x: 168, y: 72, x2: 160, yPicOffset: 56, averageX: 160, averageY: 56 }
  },
  gpuRegs: {}
});

export const createBugSprite = (): BugSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  invisible: false,
  callback: 'AnimMegahornHorn',
  storedCallback: null,
  affineAnimIndex: 0,
  rotScale: null,
  destroyed: false
});

export const sin = (angle: number, amplitude: number): number =>
  Math.round(Math.sin(((angle & 0xff) * Math.PI * 2) / 256) * amplitude);

const coords = (runtime: BugRuntime, battlerId: number): BugRuntime['battlerCoords'][number] =>
  runtime.battlerCoords[battlerId] ?? runtime.battlerCoords[0];

const getBattlerSide = (runtime: BugRuntime, battlerId: number): number =>
  runtime.battlerSides[battlerId] ?? B_SIDE_PLAYER;

const startSpriteAffineAnim = (sprite: BugSprite, anim: number): void => {
  sprite.affineAnimIndex = anim & 0xff;
};

const storeSpriteCallbackInData6 = (sprite: BugSprite, callback: BugCallback): void => {
  sprite.storedCallback = callback;
};

const destroyAnimSprite = (sprite: BugSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};

const initSpritePosToAnimAttacker = (runtime: BugRuntime, sprite: BugSprite, respectSide: boolean): void => {
  const attacker = coords(runtime, runtime.battleAnimAttacker);
  const xOffset = respectSide && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER
    ? -runtime.battleAnimArgs[0]
    : runtime.battleAnimArgs[0];
  sprite.x = attacker.x2 + xOffset;
  sprite.y = attacker.yPicOffset + runtime.battleAnimArgs[1];
};

const setAverageBattlerPositions = (runtime: BugRuntime, battlerId: number): { x: number; y: number } => {
  const battlerCoords = coords(runtime, battlerId);
  return { x: battlerCoords.averageX, y: battlerCoords.averageY };
};

const trySetSpriteRotScale = (sprite: BugSprite, xScale: number, yScale: number, rotation: number): void => {
  sprite.rotScale = { xScale, yScale, rotation: rotation & 0xffff };
};

const arcTan2Neg = (x: number, y: number): number => (Math.round(Math.atan2(-y, x) * 0x8000 / Math.PI) & 0xffff);

const setGpuReg = (runtime: BugRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value & 0xffff;
};

export function AnimMegahornHorn(runtime: BugRuntime, sprite: BugSprite): void {
  if (runtime.contest) {
    startSpriteAffineAnim(sprite, 2);
    runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
    runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
  } else if (getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER) {
    startSpriteAffineAnim(sprite, 1);
    runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
    runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
    runtime.battleAnimArgs[3] = -runtime.battleAnimArgs[3];
    runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
  }
  const target = coords(runtime, runtime.battleAnimTarget);
  sprite.x = target.x2 + runtime.battleAnimArgs[0];
  sprite.y = target.yPicOffset + runtime.battleAnimArgs[1];
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[2] = target.x2 + runtime.battleAnimArgs[2];
  sprite.data[4] = target.yPicOffset + runtime.battleAnimArgs[3];
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export const animMegahornHorn = AnimMegahornHorn;

export function AnimLeechLifeNeedle(runtime: BugRuntime, sprite: BugSprite): void {
  if (runtime.contest) {
    runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
    startSpriteAffineAnim(sprite, 2);
  } else if (getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER) {
    runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
    runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
  }
  const target = coords(runtime, runtime.battleAnimTarget);
  sprite.x = target.x2 + runtime.battleAnimArgs[0];
  sprite.y = target.yPicOffset + runtime.battleAnimArgs[1];
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[2] = target.x2;
  sprite.data[4] = target.yPicOffset;
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export const animLeechLifeNeedle = AnimLeechLifeNeedle;

export function AnimTranslateWebThread(runtime: BugRuntime, sprite: BugSprite): void {
  if (runtime.contest) {
    runtime.battleAnimArgs[2] = Math.trunc(runtime.battleAnimArgs[2] / 2);
  }
  initSpritePosToAnimAttacker(runtime, sprite, true);
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  if (!runtime.battleAnimArgs[4]) {
    const target = coords(runtime, runtime.battleAnimTarget);
    sprite.data[2] = target.x2;
    sprite.data[4] = target.yPicOffset;
  } else {
    const average = setAverageBattlerPositions(runtime, runtime.battleAnimTarget);
    sprite.data[2] = average.x;
    sprite.data[4] = average.y;
  }
  sprite.data[5] = runtime.battleAnimArgs[3];
  sprite.callback = 'AnimTranslateWebThread_Step';
}

export const animTranslateWebThread = AnimTranslateWebThread;

export function AnimTranslateWebThread_Step(sprite: BugSprite): void {
  if (sprite.data[0]-- <= 0) {
    destroyAnimSprite(sprite);
    return;
  }
  sprite.x2 += sin(sprite.data[6], sprite.data[5]);
  sprite.data[6] = (sprite.data[6] + 13) & 0xff;
}

export const animTranslateWebThreadStep = AnimTranslateWebThread_Step;

export function AnimStringWrap(runtime: BugRuntime, sprite: BugSprite): void {
  const average = setAverageBattlerPositions(runtime, runtime.battleAnimTarget);
  sprite.x = average.x;
  sprite.y = average.y;
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.x -= runtime.battleAnimArgs[0];
  } else {
    sprite.x += runtime.battleAnimArgs[0];
  }
  sprite.y += runtime.battleAnimArgs[1];
  if (getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER) {
    sprite.y += 8;
  }
  sprite.callback = 'AnimStringWrap_Step';
}

export const animStringWrap = AnimStringWrap;

export function AnimStringWrap_Step(sprite: BugSprite): void {
  if (++sprite.data[0] === 3) {
    sprite.data[0] = 0;
    sprite.invisible = !sprite.invisible;
  }
  if (++sprite.data[1] === 51) {
    destroyAnimSprite(sprite);
  }
}

export const animStringWrapStep = AnimStringWrap_Step;

export function AnimSpiderWeb(runtime: BugRuntime, sprite: BugSprite): void {
  setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0x3f40);
  setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', (16 << 8));
  sprite.data[0] = 16;
  sprite.callback = 'AnimSpiderWeb_Step';
}

export const animSpiderWeb = AnimSpiderWeb;

export function AnimSpiderWeb_Step(runtime: BugRuntime, sprite: BugSprite): void {
  if (sprite.data[2] < 20) {
    ++sprite.data[2];
  } else if (sprite.data[1]++ & 1) {
    --sprite.data[0];
    setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', (sprite.data[0] << 8) | (16 - sprite.data[0]));
    if (sprite.data[0] === 0) {
      sprite.invisible = true;
      sprite.callback = 'AnimSpiderWeb_End';
    }
  }
}

export const animSpiderWebStep = AnimSpiderWeb_Step;

export function AnimSpiderWeb_End(runtime: BugRuntime, sprite: BugSprite): void {
  setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0);
  setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', 0);
  destroyAnimSprite(sprite);
}

export const animSpiderWebEnd = AnimSpiderWeb_End;

export function AnimTranslateStinger(runtime: BugRuntime, sprite: BugSprite): void {
  if (runtime.contest) {
    runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  } else if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
    runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
    runtime.battleAnimArgs[3] = -runtime.battleAnimArgs[3];
  }
  if (!runtime.contest && getBattlerSide(runtime, runtime.battleAnimAttacker) === getBattlerSide(runtime, runtime.battleAnimTarget)) {
    const position = runtime.battlerPositions[runtime.battleAnimTarget];
    if (position === B_POSITION_PLAYER_LEFT || position === B_POSITION_OPPONENT_LEFT) {
      runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
      runtime.battleAnimArgs[0] = -runtime.battleAnimArgs[0];
    }
  }
  initSpritePosToAnimAttacker(runtime, sprite, true);
  const target = coords(runtime, runtime.battleAnimTarget);
  const targetX = target.x2 + runtime.battleAnimArgs[2];
  const targetY = target.yPicOffset + runtime.battleAnimArgs[3];
  trySetSpriteRotScale(sprite, 0x100, 0x100, arcTan2Neg(targetX - sprite.x, targetY - sprite.y) + 0xc000);
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[2] = targetX;
  sprite.data[4] = targetY;
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export const animTranslateStinger = AnimTranslateStinger;

export function AnimMissileArc(runtime: BugRuntime, sprite: BugSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite, true);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  }
  const target = coords(runtime, runtime.battleAnimTarget);
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[2] = target.x2 + runtime.battleAnimArgs[2];
  sprite.data[4] = target.yPicOffset + runtime.battleAnimArgs[3];
  sprite.data[5] = runtime.battleAnimArgs[5];
  sprite.callback = 'AnimMissileArc_Step';
  sprite.invisible = true;
}

export const animMissileArc = AnimMissileArc;

export function AnimMissileArc_Step(sprite: BugSprite): void {
  sprite.invisible = false;
  if (sprite.data[0]-- <= 0) {
    destroyAnimSprite(sprite);
  }
}

export const animMissileArcStep = AnimMissileArc_Step;

export function AnimTailGlowOrb(runtime: BugRuntime, sprite: BugSprite): void {
  const selected = runtime.battleAnimArgs[0] === ANIM_ATTACKER
    ? coords(runtime, runtime.battleAnimAttacker)
    : coords(runtime, runtime.battleAnimTarget);
  sprite.x = selected.x2;
  sprite.y = selected.yPicOffset + 18;
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
  sprite.callback = 'RunStoredCallbackWhenAffineAnimEnds';
}

export const animTailGlowOrb = AnimTailGlowOrb;
