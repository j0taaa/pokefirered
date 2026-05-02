export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;

export type DragonCallback =
  | 'AnimOutrageFlame'
  | 'AnimDragonFireToTarget'
  | 'AnimDragonRageFirePlume'
  | 'AnimDragonDanceOrb'
  | 'AnimDragonDanceOrb_Step'
  | 'AnimOverheatFlame'
  | 'AnimOverheatFlame_Step'
  | 'TranslateSpriteLinearAndFlicker'
  | 'StartAnimLinearTranslation'
  | 'RunStoredCallbackWhenAnimEnds'
  | 'DestroySpriteAndMatrix'
  | 'DestroyAnimSprite';

export interface DragonSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: DragonCallback;
}

export interface DragonSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  callback: DragonCallback;
  storedCallback: DragonCallback | null;
  animIndex: number;
  affineAnimIndex: number;
  destroyed: boolean;
}

export interface DragonRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  battlerAttacker: number;
  battlerSides: Record<number, number>;
  battlerCoords: Record<number, { x: number; y: number; x2: number; yPicOffset: number; width: number; height: number; elevationY: number }>;
}

export interface DragonDanceTask {
  data: number[];
  func: 'AnimTask_DragonDanceWaver_Step' | 'DestroyAnimVisualTask';
  destroyed: boolean;
}

export interface DragonDanceScanlineRuntime extends DragonRuntime {
  battleBg1X: number;
  battleBg2X: number;
  attackerBgPriorityRank: number;
  scanlineEffect: {
    state: number;
    srcBuffer: 0 | 1;
    dmaDest: 'REG_BG1HOFS' | 'REG_BG2HOFS' | null;
    dmaControl: string | null;
    initState: number;
    unused9: number;
  };
  scanlineBuffers: [number[], number[]];
  tasks: DragonDanceTask[];
}

export const sAnimOutrageOverheatFire0 = [
  'ANIMCMD_FRAME(0, 4)',
  'ANIMCMD_FRAME(16, 4)',
  'ANIMCMD_FRAME(32, 4)',
  'ANIMCMD_FRAME(48, 4)',
  'ANIMCMD_FRAME(64, 4)',
  'ANIMCMD_JUMP(0)'
] as const;

export const sAnimDragonBreathFire0 = ['ANIMCMD_FRAME(16, 3)', 'ANIMCMD_FRAME(32, 3)', 'ANIMCMD_FRAME(48, 3)', 'ANIMCMD_JUMP(0)'] as const;
export const sAnimDragonBreathFire1 = [
  'ANIMCMD_FRAME(16, 3, .vFlip = TRUE, .hFlip = TRUE)',
  'ANIMCMD_FRAME(32, 3, .vFlip = TRUE, .hFlip = TRUE)',
  'ANIMCMD_FRAME(48, 3, .vFlip = TRUE, .hFlip = TRUE)',
  'ANIMCMD_JUMP(0)'
] as const;
export const sAnimDragonRageFirePlume = [
  'ANIMCMD_FRAME(0, 5)',
  'ANIMCMD_FRAME(16, 5)',
  'ANIMCMD_FRAME(32, 5)',
  'ANIMCMD_FRAME(48, 5)',
  'ANIMCMD_FRAME(64, 5)',
  'ANIMCMD_END'
] as const;
export const sAnimDragonRageFire = ['ANIMCMD_FRAME(16, 3)', 'ANIMCMD_FRAME(32, 3)', 'ANIMCMD_FRAME(48, 3)', 'ANIMCMD_JUMP(0)'] as const;

export const gOutrageFlameSpriteTemplate: DragonSpriteTemplate = {
  tileTag: 'ANIM_TAG_SMALL_EMBER',
  paletteTag: 'ANIM_TAG_SMALL_EMBER',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: [sAnimOutrageOverheatFire0],
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimOutrageFlame'
};

export const gDragonBreathFireSpriteTemplate: DragonSpriteTemplate = {
  tileTag: 'ANIM_TAG_SMALL_EMBER',
  paletteTag: 'ANIM_TAG_SMALL_EMBER',
  oam: 'gOamData_AffineDouble_ObjNormal_32x32',
  anims: [sAnimDragonBreathFire0, sAnimDragonBreathFire1],
  images: null,
  affineAnims: ['sAffineAnim_DragonBreathFire_0', 'sAffineAnim_DragonBreathFire_1'],
  callback: 'AnimDragonFireToTarget'
};

export const gDragonRageFirePlumeSpriteTemplate: DragonSpriteTemplate = {
  tileTag: 'ANIM_TAG_FIRE_PLUME',
  paletteTag: 'ANIM_TAG_FIRE_PLUME',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: [sAnimDragonRageFirePlume],
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimDragonRageFirePlume'
};

export const gDragonRageFireSpitSpriteTemplate: DragonSpriteTemplate = {
  tileTag: 'ANIM_TAG_SMALL_EMBER',
  paletteTag: 'ANIM_TAG_SMALL_EMBER',
  oam: 'gOamData_AffineDouble_ObjNormal_32x32',
  anims: [sAnimDragonRageFire, sAnimDragonRageFire],
  images: null,
  affineAnims: ['sAffineAnim_DragonRageFire_0', 'sAffineAnim_DragonRageFire_1'],
  callback: 'AnimDragonFireToTarget'
};

export const gDragonDanceOrbSpriteTemplate: DragonSpriteTemplate = {
  tileTag: 'ANIM_TAG_HOLLOW_ORB',
  paletteTag: 'ANIM_TAG_HOLLOW_ORB',
  oam: 'gOamData_AffineOff_ObjNormal_16x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimDragonDanceOrb'
};

export const gOverheatFlameSpriteTemplate: DragonSpriteTemplate = {
  tileTag: 'ANIM_TAG_SMALL_EMBER',
  paletteTag: 'ANIM_TAG_SMALL_EMBER',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: [sAnimOutrageOverheatFire0],
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimOverheatFlame'
};

export const sUnusedOverheatData = Array.from({ length: 7 }, () => 0);

export const createDragonRuntime = (): DragonRuntime => ({
  battleAnimArgs: Array.from({ length: 8 }, () => 0),
  battleAnimAttacker: 0,
  battleAnimTarget: 1,
  battlerAttacker: 0,
  battlerSides: { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT },
  battlerCoords: {
    0: { x: 40, y: 80, x2: 48, yPicOffset: 64, width: 48, height: 64, elevationY: 64 },
    1: { x: 168, y: 72, x2: 160, yPicOffset: 56, width: 64, height: 48, elevationY: 56 }
  }
});

export const createDragonSprite = (): DragonSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  invisible: false,
  callback: 'AnimDragonDanceOrb',
  storedCallback: null,
  animIndex: 0,
  affineAnimIndex: 0,
  destroyed: false
});

export const sin = (angle: number, amplitude: number): number =>
  Math.round(Math.sin(((angle & 0xff) * Math.PI * 2) / 256) * amplitude);

export const cos = (angle: number, amplitude: number): number =>
  Math.round(Math.cos(((angle & 0xff) * Math.PI * 2) / 256) * amplitude);

const trunc = (value: number): number => Math.trunc(value);

const battler = (runtime: DragonRuntime, id: number): DragonRuntime['battlerCoords'][number] =>
  runtime.battlerCoords[id] ?? runtime.battlerCoords[0];

const getBattlerSide = (runtime: DragonRuntime, battlerId: number): number =>
  runtime.battlerSides[battlerId] ?? B_SIDE_PLAYER;

const storeSpriteCallbackInData6 = (sprite: DragonSprite, callback: DragonCallback): void => {
  sprite.storedCallback = callback;
};

const startSpriteAnim = (sprite: DragonSprite, animIndex: number): void => {
  sprite.animIndex = animIndex & 0xff;
};

const startSpriteAffineAnim = (sprite: DragonSprite, animIndex: number): void => {
  sprite.affineAnimIndex = animIndex & 0xff;
};

const destroyAnimSprite = (sprite: DragonSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};

const setSpriteCoordsToAnimAttackerCoords = (runtime: DragonRuntime, sprite: DragonSprite): void => {
  const coords = battler(runtime, runtime.battleAnimAttacker);
  sprite.x = coords.x2;
  sprite.y = coords.yPicOffset;
};

const setAnimSpriteInitialXOffset = (runtime: DragonRuntime, sprite: DragonSprite, xOffset: number): void => {
  const attackerX = battler(runtime, runtime.battleAnimAttacker).x;
  const targetX = battler(runtime, runtime.battleAnimTarget).x;

  if (attackerX > targetX) {
    sprite.x -= xOffset;
  } else if (attackerX < targetX) {
    sprite.x += xOffset;
  } else if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.x -= xOffset;
  } else {
    sprite.x += xOffset;
  }
};

export const animOutrageFlame = (runtime: DragonRuntime, sprite: DragonSprite): void => {
  const attacker = battler(runtime, runtime.battleAnimAttacker);
  sprite.x = attacker.x2;
  sprite.y = attacker.yPicOffset;
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.x -= runtime.battleAnimArgs[0];
    runtime.battleAnimArgs[3] = -runtime.battleAnimArgs[3];
    runtime.battleAnimArgs[4] = -runtime.battleAnimArgs[4];
  } else {
    sprite.x += runtime.battleAnimArgs[0];
  }
  sprite.y += runtime.battleAnimArgs[1];
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[1] = runtime.battleAnimArgs[3];
  sprite.data[3] = runtime.battleAnimArgs[4];
  sprite.data[5] = runtime.battleAnimArgs[5];
  sprite.invisible = true;
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
  sprite.callback = 'TranslateSpriteLinearAndFlicker';
};

export const startDragonFireTranslation = (runtime: DragonRuntime, sprite: DragonSprite): void => {
  setSpriteCoordsToAnimAttackerCoords(runtime, sprite);
  const target = battler(runtime, runtime.battleAnimTarget);
  sprite.data[2] = target.x2;
  sprite.data[4] = target.yPicOffset;
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.x -= runtime.battleAnimArgs[1];
    sprite.y += runtime.battleAnimArgs[1];
    sprite.data[2] -= runtime.battleAnimArgs[2];
    sprite.data[4] += runtime.battleAnimArgs[3];
  } else {
    sprite.x += runtime.battleAnimArgs[0];
    sprite.y += runtime.battleAnimArgs[1];
    sprite.data[2] += runtime.battleAnimArgs[2];
    sprite.data[4] += runtime.battleAnimArgs[3];
    startSpriteAnim(sprite, 1);
  }
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
};

export const animDragonFireToTarget = (runtime: DragonRuntime, sprite: DragonSprite): void => {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    startSpriteAffineAnim(sprite, 1);
  }
  startDragonFireTranslation(runtime, sprite);
};

export const animDragonRageFirePlume = (runtime: DragonRuntime, sprite: DragonSprite): void => {
  const coords = runtime.battleAnimArgs[0] === 0
    ? battler(runtime, runtime.battleAnimAttacker)
    : battler(runtime, runtime.battleAnimTarget);
  sprite.x = coords.x;
  sprite.y = coords.y;
  setAnimSpriteInitialXOffset(runtime, sprite, runtime.battleAnimArgs[1]);
  sprite.y += runtime.battleAnimArgs[2];
  sprite.callback = 'RunStoredCallbackWhenAnimEnds';
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
};

export const animDragonDanceOrb = (runtime: DragonRuntime, sprite: DragonSprite): void => {
  const attacker = battler(runtime, runtime.battleAnimAttacker);
  const attackerAttr = battler(runtime, runtime.battlerAttacker);
  sprite.x = attacker.x2;
  sprite.y = attacker.yPicOffset;
  sprite.data[4] = 0;
  sprite.data[5] = 1;
  sprite.data[6] = runtime.battleAnimArgs[0];
  sprite.data[7] = (attackerAttr.height > attackerAttr.width ? attackerAttr.height : attackerAttr.width) / 2;
  sprite.x2 = cos(sprite.data[6], sprite.data[7]);
  sprite.y2 = sin(sprite.data[6], sprite.data[7]);
  sprite.callback = 'AnimDragonDanceOrb_Step';
};

export const animDragonDanceOrbStep = (sprite: DragonSprite): void => {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[6] = (sprite.data[6] - sprite.data[5]) & 0xff;
      sprite.x2 = cos(sprite.data[6], sprite.data[7]);
      sprite.y2 = sin(sprite.data[6], sprite.data[7]);
      if (++sprite.data[4] > 5) {
        sprite.data[4] = 0;
        if (sprite.data[5] <= 15 && ++sprite.data[5] > 15) {
          sprite.data[5] = 16;
        }
      }
      if (++sprite.data[3] > 0x3c) {
        sprite.data[3] = 0;
        ++sprite.data[0];
      }
      break;
    case 1:
      sprite.data[6] = (sprite.data[6] - sprite.data[5]) & 0xff;
      if (sprite.data[7] <= 0x95 && (sprite.data[7] += 8) > 0x95) {
        sprite.data[7] = 0x96;
      }
      sprite.x2 = cos(sprite.data[6], sprite.data[7]);
      sprite.y2 = sin(sprite.data[6], sprite.data[7]);
      if (++sprite.data[4] > 5) {
        sprite.data[4] = 0;
        if (sprite.data[5] <= 15 && ++sprite.data[5] > 15) {
          sprite.data[5] = 16;
        }
      }
      if (++sprite.data[3] > 20) {
        destroyAnimSprite(sprite);
      }
      break;
  }
};

export const createDragonDanceScanlineRuntime = (): DragonDanceScanlineRuntime => ({
  ...createDragonRuntime(),
  battleBg1X: 12,
  battleBg2X: 24,
  attackerBgPriorityRank: 1,
  scanlineEffect: { state: 0, srcBuffer: 0, dmaDest: null, dmaControl: null, initState: 0, unused9: 0 },
  scanlineBuffers: [Array.from({ length: 160 }, () => 0), Array.from({ length: 160 }, () => 0)],
  tasks: [{ data: Array.from({ length: 8 }, () => 0), func: 'AnimTask_DragonDanceWaver_Step', destroyed: false }]
});

export const animTaskDragonDanceWaver = (runtime: DragonDanceScanlineRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (runtime.attackerBgPriorityRank === 1) {
    runtime.scanlineEffect.dmaDest = 'REG_BG1HOFS';
    task.data[2] = runtime.battleBg1X;
  } else {
    runtime.scanlineEffect.dmaDest = 'REG_BG2HOFS';
    task.data[2] = runtime.battleBg2X;
  }
  runtime.scanlineEffect.dmaControl = 'SCANLINE_EFFECT_DMACNT_16BIT';
  runtime.scanlineEffect.initState = 1;
  runtime.scanlineEffect.unused9 = 0;
  const y = battler(runtime, runtime.battleAnimAttacker).elevationY;
  task.data[3] = y - 32;
  task.data[4] = y + 32;
  if (task.data[3] < 0) {
    task.data[3] = 0;
  }
  for (let i = task.data[3]; i <= task.data[4]; i += 1) {
    runtime.scanlineBuffers[0][i] = task.data[2];
    runtime.scanlineBuffers[1][i] = task.data[2];
  }
  runtime.scanlineEffect.state = 1;
  task.func = 'AnimTask_DragonDanceWaver_Step';
};

export const updateDragonDanceScanlineEffect = (runtime: DragonDanceScanlineRuntime, task: DragonDanceTask): void => {
  let angle = task.data[5];
  for (let i = task.data[3]; i <= task.data[4]; i += 1) {
    runtime.scanlineBuffers[runtime.scanlineEffect.srcBuffer][i] = trunc((sin(angle, 256) * task.data[6]) / 128) + task.data[2];
    angle = (angle + 8) & 0xff;
  }
  task.data[5] = (task.data[5] + 9) & 0xff;
};

export const animTaskDragonDanceWaverStep = (runtime: DragonDanceScanlineRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      if (++task.data[7] > 1) {
        task.data[7] = 0;
        if (++task.data[6] === 3) {
          ++task.data[0];
        }
      }
      updateDragonDanceScanlineEffect(runtime, task);
      break;
    case 1:
      if (++task.data[1] > 0x3c) {
        ++task.data[0];
      }
      updateDragonDanceScanlineEffect(runtime, task);
      break;
    case 2:
      if (++task.data[7] > 1) {
        task.data[7] = 0;
        if (--task.data[6] === 0) {
          ++task.data[0];
        }
      }
      updateDragonDanceScanlineEffect(runtime, task);
      break;
    case 3:
      runtime.scanlineEffect.state = 3;
      ++task.data[0];
      break;
    case 4:
      task.destroyed = true;
      task.func = 'DestroyAnimVisualTask';
      break;
  }
};

export const animOverheatFlame = (runtime: DragonRuntime, sprite: DragonSprite): void => {
  const attacker = battler(runtime, runtime.battleAnimAttacker);
  const yAmplitude = trunc((runtime.battleAnimArgs[2] * 3) / 5);
  sprite.x = attacker.x2;
  sprite.y = attacker.yPicOffset + runtime.battleAnimArgs[4];
  sprite.data[1] = cos(runtime.battleAnimArgs[1], runtime.battleAnimArgs[2]);
  sprite.data[2] = sin(runtime.battleAnimArgs[1], yAmplitude);
  sprite.x += sprite.data[1] * runtime.battleAnimArgs[0];
  sprite.y += sprite.data[2] * runtime.battleAnimArgs[0];
  sprite.data[3] = runtime.battleAnimArgs[3];
  sprite.callback = 'AnimOverheatFlame_Step';
  for (let i = 0; i < 7; i += 1) {
    sUnusedOverheatData[i] = sprite.data[i];
  }
};

export const animOverheatFlameStep = (sprite: DragonSprite): void => {
  sprite.data[4] += sprite.data[1];
  sprite.data[5] += sprite.data[2];
  sprite.x2 = trunc(sprite.data[4] / 10);
  sprite.y2 = trunc(sprite.data[5] / 10);
  if (++sprite.data[0] > sprite.data[3]) {
    destroyAnimSprite(sprite);
  }
};

export function AnimOutrageFlame(runtime: DragonRuntime, sprite: DragonSprite): void {
  animOutrageFlame(runtime, sprite);
}

export function StartDragonFireTranslation(runtime: DragonRuntime, sprite: DragonSprite): void {
  startDragonFireTranslation(runtime, sprite);
}

export function AnimDragonRageFirePlume(runtime: DragonRuntime, sprite: DragonSprite): void {
  animDragonRageFirePlume(runtime, sprite);
}

export function AnimDragonFireToTarget(runtime: DragonRuntime, sprite: DragonSprite): void {
  animDragonFireToTarget(runtime, sprite);
}

export function AnimDragonDanceOrb(runtime: DragonRuntime, sprite: DragonSprite): void {
  animDragonDanceOrb(runtime, sprite);
}

export function AnimDragonDanceOrb_Step(sprite: DragonSprite): void {
  animDragonDanceOrbStep(sprite);
}

export function AnimTask_DragonDanceWaver(
  runtime: DragonDanceScanlineRuntime,
  taskId: number
): void {
  animTaskDragonDanceWaver(runtime, taskId);
}

export function AnimTask_DragonDanceWaver_Step(
  runtime: DragonDanceScanlineRuntime,
  taskId: number
): void {
  animTaskDragonDanceWaverStep(runtime, taskId);
}

export function UpdateDragonDanceScanlineEffect(
  runtime: DragonDanceScanlineRuntime,
  task: DragonDanceTask
): void {
  updateDragonDanceScanlineEffect(runtime, task);
}

export function AnimOverheatFlame(runtime: DragonRuntime, sprite: DragonSprite): void {
  animOverheatFlame(runtime, sprite);
}

export function AnimOverheatFlame_Step(sprite: DragonSprite): void {
  animOverheatFlameStep(sprite);
}
