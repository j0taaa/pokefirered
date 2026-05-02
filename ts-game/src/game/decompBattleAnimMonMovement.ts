import { cos, sin } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const ANIM_ATK_PARTNER = 2;
export const ANIM_DEF_PARTNER = 3;
export const BIT_FLANK = 2;
export const MAX_BATTLERS_COUNT = 4;
export const SPRITE_NONE = 0xff;
export const DISPLAY_WIDTH = 240;

export type MonMovementCallback =
  | 'DoHorizontalLunge'
  | 'ReverseHorizontalLungeDirection'
  | 'DoVerticalDip'
  | 'ReverseVerticalDipDirection'
  | 'SlideMonToOriginalPos'
  | 'SlideMonToOriginalPos_Step'
  | 'SlideMonToOffset'
  | 'SlideMonToOffsetAndBack'
  | 'SlideMonToOffsetAndBack_End'
  | 'TranslateSpriteLinearById'
  | 'TranslateSpriteLinearByIdFixedPoint'
  | 'DestroyAnimSprite';

export type MonMovementTaskFunc =
  | 'AnimTask_ShakeMon_Step'
  | 'AnimTask_ShakeMon2Step'
  | 'AnimTask_ShakeMonInPlace_Step'
  | 'AnimTask_ShakeAndSinkMon_Step'
  | 'AnimTask_TranslateMonElliptical_Step'
  | 'AnimTask_WindUpLunge_Step1'
  | 'AnimTask_WindUpLunge_Step2'
  | 'AnimTask_SlideOffScreen_Step'
  | 'AnimTask_SwayMon_Step'
  | 'AnimTask_ScaleMonAndRestore_Step'
  | 'AnimTask_RotateMonSpriteToSide_Step'
  | 'AnimTask_ShakeTargetBasedOnMovePowerOrDmg_Step'
  | 'DestroyAnimVisualTask';

export interface MonMovementSpriteTemplate {
  tileTag: number;
  paletteTag: number;
  oam: string;
  anims: string;
  images: null;
  affineAnims: string;
  callback: MonMovementCallback;
}

export interface MonMovementSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: MonMovementCallback;
  storedCallback: MonMovementCallback | null;
  destroyed: boolean;
  invisible: boolean;
  rotScalePrepared: number | null;
  rotScale: { xScale: number; yScale: number; rotation: number } | null;
  yOffsetFromRotation: boolean;
}

export interface MonMovementTask {
  data: number[];
  func: MonMovementTaskFunc;
  destroyed: boolean;
}

export interface MonMovementRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  animMovePower: number;
  animMoveDmg: number;
  contest: boolean;
  battlerSides: Record<number, number>;
  battlerAtPosition: Record<number, number>;
  battlerVisible: Record<number, boolean>;
  battlerSpriteIds: Record<number, number>;
  sprites: MonMovementSprite[];
  tasks: Array<MonMovementTask | null>;
  operations: string[];
}

const dummyTemplate = (callback: MonMovementCallback): MonMovementSpriteTemplate => ({
  tileTag: 0,
  paletteTag: 0,
  oam: 'gDummyOamData',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback
});

export const gHorizontalLungeSpriteTemplate = dummyTemplate('DoHorizontalLunge');
export const gVerticalDipSpriteTemplate = dummyTemplate('DoVerticalDip');
export const gSlideMonToOriginalPosSpriteTemplate = dummyTemplate('SlideMonToOriginalPos');
export const gSlideMonToOffsetSpriteTemplate = dummyTemplate('SlideMonToOffset');
export const gSlideMonToOffsetAndBackSpriteTemplate = dummyTemplate('SlideMonToOffsetAndBack');

export const createMonMovementSprite = (): MonMovementSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 16 }, () => 0),
  callback: 'DoHorizontalLunge',
  storedCallback: null,
  destroyed: false,
  invisible: false,
  rotScalePrepared: null,
  rotScale: null,
  yOffsetFromRotation: false
});

export const createMonMovementRuntime = (overrides: Partial<MonMovementRuntime> = {}): MonMovementRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  animMovePower: overrides.animMovePower ?? 80,
  animMoveDmg: overrides.animMoveDmg ?? 120,
  contest: overrides.contest ?? false,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerAtPosition: overrides.battlerAtPosition ?? {
    [B_POSITION_PLAYER_LEFT]: 0,
    [B_POSITION_OPPONENT_LEFT]: 1,
    [B_POSITION_PLAYER_RIGHT]: 2,
    [B_POSITION_OPPONENT_RIGHT]: 3
  },
  battlerVisible: overrides.battlerVisible ?? { 0: true, 1: true, 2: true, 3: true },
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  sprites: overrides.sprites ?? Array.from({ length: 64 }, () => createMonMovementSprite()),
  tasks: overrides.tasks ?? [],
  operations: overrides.operations ?? []
});

export const createMonMovementTask = (runtime: MonMovementRuntime, func: MonMovementTaskFunc = 'DestroyAnimVisualTask'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), func, destroyed: false });
  return id;
};

export function AnimTask_ShakeMon(runtime: MonMovementRuntime, taskId: number): void {
  const spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[0]);
  if (spriteId === SPRITE_NONE) {
    destroyAnimVisualTask(runtime, taskId);
    return;
  }
  runtime.sprites[spriteId].x2 = runtime.battleAnimArgs[1];
  runtime.sprites[spriteId].y2 = runtime.battleAnimArgs[2];
  const task = runtime.tasks[taskId]!;
  task.data[0] = spriteId;
  task.data[1] = runtime.battleAnimArgs[3];
  task.data[2] = runtime.battleAnimArgs[4];
  task.data[3] = runtime.battleAnimArgs[4];
  task.data[4] = runtime.battleAnimArgs[1];
  task.data[5] = runtime.battleAnimArgs[2];
  task.func = 'AnimTask_ShakeMon_Step';
  AnimTask_ShakeMon_Step(runtime, taskId);
}

export function AnimTask_ShakeMon_Step(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const sprite = runtime.sprites[task.data[0]];
  if (task.data[3] === 0) {
    sprite.x2 = sprite.x2 === 0 ? task.data[4] : 0;
    sprite.y2 = sprite.y2 === 0 ? task.data[5] : 0;
    task.data[3] = task.data[2];
    if (--task.data[1] === 0) {
      sprite.x2 = 0;
      sprite.y2 = 0;
      destroyAnimVisualTask(runtime, taskId);
    }
  } else {
    task.data[3]--;
  }
}

export function AnimTask_ShakeMon2(runtime: MonMovementRuntime, taskId: number): void {
  let abort = false;
  let spriteId: number;
  if (runtime.battleAnimArgs[0] < MAX_BATTLERS_COUNT) {
    spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[0]);
    if (spriteId === SPRITE_NONE) abort = true;
  } else if (runtime.battleAnimArgs[0] !== 8) {
    let battlerId: number;
    switch (runtime.battleAnimArgs[0]) {
      case 4:
        battlerId = getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT);
        break;
      case 5:
        battlerId = getBattlerAtPosition(runtime, B_POSITION_PLAYER_RIGHT);
        break;
      case 6:
        battlerId = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT);
        break;
      default:
        battlerId = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_RIGHT);
        break;
    }
    if (!isBattlerSpriteVisible(runtime, battlerId)) abort = true;
    spriteId = runtime.battlerSpriteIds[battlerId];
  } else {
    spriteId = runtime.battlerSpriteIds[runtime.battleAnimAttacker];
  }
  if (abort) {
    destroyAnimVisualTask(runtime, taskId);
    return;
  }
  runtime.sprites[spriteId].x2 = runtime.battleAnimArgs[1];
  runtime.sprites[spriteId].y2 = runtime.battleAnimArgs[2];
  const task = runtime.tasks[taskId]!;
  task.data[0] = spriteId;
  task.data[1] = runtime.battleAnimArgs[3];
  task.data[2] = runtime.battleAnimArgs[4];
  task.data[3] = runtime.battleAnimArgs[4];
  task.data[4] = runtime.battleAnimArgs[1];
  task.data[5] = runtime.battleAnimArgs[2];
  task.func = 'AnimTask_ShakeMon2Step';
  AnimTask_ShakeMon2Step(runtime, taskId);
}

export function AnimTask_ShakeMon2Step(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const sprite = runtime.sprites[task.data[0]];
  if (task.data[3] === 0) {
    sprite.x2 = sprite.x2 === task.data[4] ? -task.data[4] : task.data[4];
    sprite.y2 = sprite.y2 === task.data[5] ? -task.data[5] : task.data[5];
    task.data[3] = task.data[2];
    if (--task.data[1] === 0) {
      sprite.x2 = 0;
      sprite.y2 = 0;
      destroyAnimVisualTask(runtime, taskId);
    }
  } else {
    task.data[3]--;
  }
}

export function AnimTask_ShakeMonInPlace(runtime: MonMovementRuntime, taskId: number): void {
  const spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[0]);
  if (spriteId === SPRITE_NONE) {
    destroyAnimVisualTask(runtime, taskId);
    return;
  }
  runtime.sprites[spriteId].x2 += runtime.battleAnimArgs[1];
  runtime.sprites[spriteId].y2 += runtime.battleAnimArgs[2];
  const task = runtime.tasks[taskId]!;
  task.data[0] = spriteId;
  task.data[1] = 0;
  task.data[2] = runtime.battleAnimArgs[3];
  task.data[3] = 0;
  task.data[4] = runtime.battleAnimArgs[4];
  task.data[5] = runtime.battleAnimArgs[1] * 2;
  task.data[6] = runtime.battleAnimArgs[2] * 2;
  task.func = 'AnimTask_ShakeMonInPlace_Step';
  AnimTask_ShakeMonInPlace_Step(runtime, taskId);
}

export function AnimTask_ShakeMonInPlace_Step(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const sprite = runtime.sprites[task.data[0]];
  if (task.data[3] === 0) {
    if (task.data[1] & 1) {
      sprite.x2 += task.data[5];
      sprite.x2 += task.data[5];
      sprite.y2 += task.data[6];
    } else {
      sprite.x2 -= task.data[5];
      sprite.y2 -= task.data[6];
    }
    task.data[3] = task.data[4];
    if (++task.data[1] >= task.data[2]) {
      if (task.data[1] & 1) {
        sprite.x2 += Math.trunc(task.data[5] / 2);
        sprite.y2 += Math.trunc(task.data[6] / 2);
      } else {
        sprite.x2 -= Math.trunc(task.data[5] / 2);
        sprite.y2 -= Math.trunc(task.data[6] / 2);
      }
      destroyAnimVisualTask(runtime, taskId);
    }
  } else {
    task.data[3]--;
  }
}

export function AnimTask_ShakeAndSinkMon(runtime: MonMovementRuntime, taskId: number): void {
  const spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[0]);
  runtime.sprites[spriteId].x2 = runtime.battleAnimArgs[1];
  const task = runtime.tasks[taskId]!;
  task.data[0] = spriteId;
  task.data[1] = runtime.battleAnimArgs[1];
  task.data[2] = runtime.battleAnimArgs[2];
  task.data[3] = runtime.battleAnimArgs[3];
  task.data[4] = runtime.battleAnimArgs[4];
  task.func = 'AnimTask_ShakeAndSinkMon_Step';
  AnimTask_ShakeAndSinkMon_Step(runtime, taskId);
}

export function AnimTask_ShakeAndSinkMon_Step(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const sprite = runtime.sprites[task.data[0]];
  let x = task.data[1];
  if (task.data[2] === task.data[8]++) {
    task.data[8] = 0;
    if (sprite.x2 === x) x = -x;
    sprite.x2 += x;
  }
  task.data[1] = x;
  task.data[9] += task.data[3];
  sprite.y2 = task.data[9] >> 8;
  if (--task.data[4] === 0) destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_TranslateMonElliptical(runtime: MonMovementRuntime, taskId: number): void {
  let wavePeriod = 1;
  const spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[0]);
  if (runtime.battleAnimArgs[4] > 5) runtime.battleAnimArgs[4] = 5;
  for (let i = 0; i < runtime.battleAnimArgs[4]; i++) wavePeriod *= 2;
  const task = runtime.tasks[taskId]!;
  task.data[0] = spriteId;
  task.data[1] = runtime.battleAnimArgs[1];
  task.data[2] = runtime.battleAnimArgs[2];
  task.data[3] = runtime.battleAnimArgs[3];
  task.data[4] = wavePeriod;
  task.func = 'AnimTask_TranslateMonElliptical_Step';
  AnimTask_TranslateMonElliptical_Step(runtime, taskId);
}

export function AnimTask_TranslateMonElliptical_Step(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const sprite = runtime.sprites[task.data[0]];
  sprite.x2 = sin(task.data[5], task.data[1]);
  sprite.y2 = -cos(task.data[5], task.data[2]);
  sprite.y2 += task.data[2];
  task.data[5] = (task.data[5] + task.data[4]) & 0xff;
  if (task.data[5] === 0) task.data[3]--;
  if (task.data[3] === 0) {
    sprite.x2 = 0;
    sprite.y2 = 0;
    destroyAnimVisualTask(runtime, taskId);
  }
}

export function AnimTask_TranslateMonEllipticalRespectSide(runtime: MonMovementRuntime, taskId: number): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
  AnimTask_TranslateMonElliptical(runtime, taskId);
}

export function DoHorizontalLunge(runtime: MonMovementRuntime, sprite: MonMovementSprite): void {
  sprite.invisible = true;
  sprite.data[1] = getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER ? -runtime.battleAnimArgs[1] : runtime.battleAnimArgs[1];
  sprite.data[0] = runtime.battleAnimArgs[0];
  sprite.data[2] = 0;
  sprite.data[3] = runtime.battlerSpriteIds[runtime.battleAnimAttacker];
  sprite.data[4] = runtime.battleAnimArgs[0];
  storeSpriteCallbackInData6(sprite, 'ReverseHorizontalLungeDirection');
  sprite.callback = 'TranslateSpriteLinearById';
}

export function ReverseHorizontalLungeDirection(sprite: MonMovementSprite): void {
  sprite.data[0] = sprite.data[4];
  sprite.data[1] = -sprite.data[1];
  sprite.callback = 'TranslateSpriteLinearById';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function DoVerticalDip(runtime: MonMovementRuntime, sprite: MonMovementSprite): void {
  const spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[2]);
  sprite.invisible = true;
  sprite.data[0] = runtime.battleAnimArgs[0];
  sprite.data[1] = 0;
  sprite.data[2] = runtime.battleAnimArgs[1];
  sprite.data[3] = spriteId;
  sprite.data[4] = runtime.battleAnimArgs[0];
  storeSpriteCallbackInData6(sprite, 'ReverseVerticalDipDirection');
  sprite.callback = 'TranslateSpriteLinearById';
}

export function ReverseVerticalDipDirection(sprite: MonMovementSprite): void {
  sprite.data[0] = sprite.data[4];
  sprite.data[2] = -sprite.data[2];
  sprite.callback = 'TranslateSpriteLinearById';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function SlideMonToOriginalPos(runtime: MonMovementRuntime, sprite: MonMovementSprite): void {
  const spriteId = runtime.battleAnimArgs[0] === 0 ? runtime.battlerSpriteIds[runtime.battleAnimAttacker] : runtime.battlerSpriteIds[runtime.battleAnimTarget];
  const mon = runtime.sprites[spriteId];
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[1] = mon.x + mon.x2;
  sprite.data[2] = mon.x;
  sprite.data[3] = mon.y + mon.y2;
  sprite.data[4] = mon.y;
  initSpriteDataForLinearTranslation(sprite);
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = mon.x2;
  sprite.data[6] = mon.y2;
  sprite.invisible = true;
  if (runtime.battleAnimArgs[1] === 1) sprite.data[2] = 0;
  else if (runtime.battleAnimArgs[1] === 2) sprite.data[1] = 0;
  sprite.data[7] = runtime.battleAnimArgs[1] | (spriteId << 8);
  sprite.callback = 'SlideMonToOriginalPos_Step';
}

export function SlideMonToOriginalPos_Step(runtime: MonMovementRuntime, sprite: MonMovementSprite): void {
  const data7 = sprite.data[7] & 0xff;
  const monSprite = runtime.sprites[sprite.data[7] >> 8];
  if (sprite.data[0] === 0) {
    if (data7 === 1 || data7 === 0) monSprite.x2 = 0;
    if (data7 === 2 || data7 === 0) monSprite.y2 = 0;
    destroyAnimSprite(sprite);
  } else {
    sprite.data[0]--;
    sprite.data[3] += sprite.data[1];
    sprite.data[4] += sprite.data[2];
    monSprite.x2 = (sprite.data[3] >> 8) + sprite.data[5];
    monSprite.y2 = (sprite.data[4] >> 8) + sprite.data[6];
  }
}

export function SlideMonToOffset(runtime: MonMovementRuntime, sprite: MonMovementSprite): void {
  const battlerId = runtime.battleAnimArgs[0] === 0 ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  const monSpriteId = runtime.battlerSpriteIds[battlerId];
  if (getBattlerSide(runtime, battlerId) !== B_SIDE_PLAYER) {
    runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
    if (runtime.battleAnimArgs[3] === 1) runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  }
  const mon = runtime.sprites[monSpriteId];
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[1] = mon.x;
  sprite.data[2] = mon.x + runtime.battleAnimArgs[1];
  sprite.data[3] = mon.y;
  sprite.data[4] = mon.y + runtime.battleAnimArgs[2];
  initSpriteDataForLinearTranslation(sprite);
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = monSpriteId;
  sprite.invisible = true;
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  sprite.callback = 'TranslateSpriteLinearByIdFixedPoint';
}

export function SlideMonToOffsetAndBack(runtime: MonMovementRuntime, sprite: MonMovementSprite): void {
  sprite.invisible = true;
  const battlerId = runtime.battleAnimArgs[0] === ANIM_ATTACKER ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  const spriteId = runtime.battlerSpriteIds[battlerId];
  if (getBattlerSide(runtime, battlerId) !== B_SIDE_PLAYER) {
    runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
    if (runtime.battleAnimArgs[3] === 1) runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  }
  const mon = runtime.sprites[spriteId];
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[1] = mon.x + mon.x2;
  sprite.data[2] = sprite.data[1] + runtime.battleAnimArgs[1];
  sprite.data[3] = mon.y + mon.y2;
  sprite.data[4] = sprite.data[3] + runtime.battleAnimArgs[2];
  initSpriteDataForLinearTranslation(sprite);
  sprite.data[3] = mon.x2 << 8;
  sprite.data[4] = mon.y2 << 8;
  sprite.data[5] = spriteId;
  sprite.data[6] = runtime.battleAnimArgs[5];
  storeSpriteCallbackInData6(sprite, runtime.battleAnimArgs[5] === 0 ? 'DestroyAnimSprite' : 'SlideMonToOffsetAndBack_End');
  sprite.callback = 'TranslateSpriteLinearByIdFixedPoint';
}

export function SlideMonToOffsetAndBack_End(runtime: MonMovementRuntime, sprite: MonMovementSprite): void {
  runtime.sprites[sprite.data[5]].x2 = 0;
  runtime.sprites[sprite.data[5]].y2 = 0;
  destroyAnimSprite(sprite);
}

export function AnimTask_WindUpLunge(runtime: MonMovementRuntime, taskId: number): void {
  const wavePeriod = Math.trunc(0x8000 / runtime.battleAnimArgs[3]);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
    runtime.battleAnimArgs[5] = -runtime.battleAnimArgs[5];
  }
  const task = runtime.tasks[taskId]!;
  task.data[0] = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[0]);
  task.data[1] = Math.trunc(runtime.battleAnimArgs[1] * 256 / runtime.battleAnimArgs[3]);
  task.data[2] = runtime.battleAnimArgs[2];
  task.data[3] = runtime.battleAnimArgs[3];
  task.data[4] = runtime.battleAnimArgs[4];
  task.data[5] = Math.trunc(runtime.battleAnimArgs[5] * 256 / runtime.battleAnimArgs[6]);
  task.data[6] = runtime.battleAnimArgs[6];
  task.data[7] = wavePeriod;
  task.func = 'AnimTask_WindUpLunge_Step1';
}

export function AnimTask_WindUpLunge_Step1(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const sprite = runtime.sprites[task.data[0]];
  task.data[11] += task.data[1];
  sprite.x2 = task.data[11] >> 8;
  sprite.y2 = sin((task.data[10] >> 8) & 0xff, task.data[2]);
  task.data[10] += task.data[7];
  if (--task.data[3] === 0) task.func = 'AnimTask_WindUpLunge_Step2';
}

export function AnimTask_WindUpLunge_Step2(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[4] > 0) task.data[4]--;
  else {
    const sprite = runtime.sprites[task.data[0]];
    task.data[12] += task.data[5];
    sprite.x2 = (task.data[12] >> 8) + (task.data[11] >> 8);
    if (--task.data[6] === 0) destroyAnimVisualTask(runtime, taskId);
  }
}

export function AnimTask_SlideOffScreen(runtime: MonMovementRuntime, taskId: number): void {
  let spriteId: number;
  switch (runtime.battleAnimArgs[0]) {
    case ANIM_ATTACKER:
    case ANIM_TARGET:
      spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[0]);
      break;
    case ANIM_ATK_PARTNER:
      if (!isBattlerSpriteVisible(runtime, runtime.battleAnimAttacker ^ BIT_FLANK)) {
        destroyAnimVisualTask(runtime, taskId);
        return;
      }
      spriteId = runtime.battlerSpriteIds[runtime.battleAnimAttacker ^ BIT_FLANK];
      break;
    case ANIM_DEF_PARTNER:
      if (!isBattlerSpriteVisible(runtime, runtime.battleAnimTarget ^ BIT_FLANK)) {
        destroyAnimVisualTask(runtime, taskId);
        return;
      }
      spriteId = runtime.battlerSpriteIds[runtime.battleAnimTarget ^ BIT_FLANK];
      break;
    default:
      destroyAnimVisualTask(runtime, taskId);
      return;
  }
  const task = runtime.tasks[taskId]!;
  task.data[0] = spriteId;
  task.data[1] = getBattlerSide(runtime, runtime.battleAnimTarget) !== B_SIDE_PLAYER ? runtime.battleAnimArgs[1] : -runtime.battleAnimArgs[1];
  task.func = 'AnimTask_SlideOffScreen_Step';
}

export function AnimTask_SlideOffScreen_Step(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const sprite = runtime.sprites[task.data[0]];
  sprite.x2 += task.data[1];
  if (sprite.x2 + sprite.x < -32 || sprite.x2 + sprite.x > DISPLAY_WIDTH + 32) destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_SwayMon(runtime: MonMovementRuntime, taskId: number): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
  const spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[4]);
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[0];
  task.data[1] = runtime.battleAnimArgs[1];
  task.data[2] = runtime.battleAnimArgs[2];
  task.data[3] = runtime.battleAnimArgs[3];
  task.data[4] = spriteId;
  task.data[5] = runtime.battleAnimArgs[4] === 0 ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  task.data[12] = 1;
  task.func = 'AnimTask_SwayMon_Step';
}

export function AnimTask_SwayMon_Step(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const sprite = runtime.sprites[task.data[4]];
  const sineIndex = (task.data[10] + task.data[2]) & 0xffff;
  task.data[10] = sineIndex;
  const waveIndex = sineIndex >> 8;
  const sineValue = sin(waveIndex, task.data[1]);
  if (task.data[0] === 0) sprite.x2 = sineValue;
  else if (getBattlerSide(runtime, task.data[5]) === B_SIDE_PLAYER) sprite.y2 = Math.abs(sineValue);
  else sprite.y2 = -Math.abs(sineValue);
  if ((waveIndex > 0x7f && task.data[11] === 0 && task.data[12] === 1) || (waveIndex < 0x7f && task.data[11] === 1 && task.data[12] === 0)) {
    task.data[11] ^= 1;
    task.data[12] ^= 1;
    if (--task.data[3] === 0) {
      sprite.x2 = 0;
      sprite.y2 = 0;
      destroyAnimVisualTask(runtime, taskId);
    }
  }
}

export function AnimTask_ScaleMonAndRestore(runtime: MonMovementRuntime, taskId: number): void {
  const spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[3]);
  prepareBattlerSpriteForRotScale(runtime, spriteId, runtime.battleAnimArgs[4]);
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[0];
  task.data[1] = runtime.battleAnimArgs[1];
  task.data[2] = runtime.battleAnimArgs[2];
  task.data[3] = runtime.battleAnimArgs[2];
  task.data[4] = spriteId;
  task.data[10] = 0x100;
  task.data[11] = 0x100;
  task.func = 'AnimTask_ScaleMonAndRestore_Step';
}

export function AnimTask_ScaleMonAndRestore_Step(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[10] += task.data[0];
  task.data[11] += task.data[1];
  const spriteId = task.data[4];
  setSpriteRotScale(runtime, spriteId, task.data[10], task.data[11], 0);
  if (--task.data[2] === 0) {
    if (task.data[3] > 0) {
      task.data[0] = -task.data[0];
      task.data[1] = -task.data[1];
      task.data[2] = task.data[3];
      task.data[3] = 0;
    } else {
      resetSpriteRotScale(runtime, spriteId);
      destroyAnimVisualTask(runtime, taskId);
    }
  }
}

export function AnimTask_RotateMonSpriteToSide(runtime: MonMovementRuntime, taskId: number): void {
  const spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[2]);
  prepareBattlerSpriteForRotScale(runtime, spriteId, 0);
  const task = runtime.tasks[taskId]!;
  task.data[1] = 0;
  task.data[2] = runtime.battleAnimArgs[0];
  task.data[3] = runtime.battleAnimArgs[3] !== 1 ? 0 : runtime.battleAnimArgs[0] * runtime.battleAnimArgs[1];
  task.data[4] = runtime.battleAnimArgs[1];
  task.data[5] = spriteId;
  task.data[6] = runtime.battleAnimArgs[3];
  if (runtime.contest) task.data[7] = 1;
  else if (runtime.battleAnimArgs[2] === ANIM_ATTACKER) task.data[7] = getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER ? 1 : 0;
  else task.data[7] = getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER ? 1 : 0;
  if (task.data[7] && !runtime.contest) {
    task.data[3] = -task.data[3];
    task.data[4] = -task.data[4];
  }
  task.func = 'AnimTask_RotateMonSpriteToSide_Step';
}

export function AnimTask_RotateMonToSideAndRestore(runtime: MonMovementRuntime, taskId: number): void {
  const spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[2]);
  prepareBattlerSpriteForRotScale(runtime, spriteId, 0);
  if (runtime.battleAnimArgs[2] === ANIM_ATTACKER) {
    if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
  } else if (getBattlerSide(runtime, runtime.battleAnimTarget) !== B_SIDE_PLAYER) runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
  const task = runtime.tasks[taskId]!;
  task.data[1] = 0;
  task.data[2] = runtime.battleAnimArgs[0];
  task.data[3] = runtime.battleAnimArgs[3] !== 1 ? 0 : runtime.battleAnimArgs[0] * runtime.battleAnimArgs[1];
  task.data[4] = runtime.battleAnimArgs[1];
  task.data[5] = spriteId;
  task.data[6] = runtime.battleAnimArgs[3];
  task.data[7] = 1;
  task.data[3] = -task.data[3];
  task.data[4] = -task.data[4];
  task.func = 'AnimTask_RotateMonSpriteToSide_Step';
}

export function AnimTask_RotateMonSpriteToSide_Step(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[3] += task.data[4];
  setSpriteRotScale(runtime, task.data[5], 0x100, 0x100, task.data[3]);
  if (task.data[7]) setBattlerSpriteYOffsetFromRotation(runtime, task.data[5]);
  if (++task.data[1] >= task.data[2]) {
    switch (task.data[6]) {
      case 1:
        resetSpriteRotScale(runtime, task.data[5]);
      // fallthrough
      case 0:
      default:
        destroyAnimVisualTask(runtime, taskId);
        break;
      case 2:
        task.data[1] = 0;
        task.data[4] *= -1;
        task.data[6] = 1;
        break;
    }
  }
}

export function AnimTask_ShakeTargetBasedOnMovePowerOrDmg(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[15] = Math.trunc((runtime.battleAnimArgs[0] === 0 ? runtime.animMovePower : runtime.animMoveDmg) / 12);
  if (task.data[15] < 1) task.data[15] = 1;
  if (task.data[15] > 16) task.data[15] = 16;
  task.data[14] = Math.trunc(task.data[15] / 2);
  task.data[13] = task.data[14] + (task.data[15] & 1);
  task.data[12] = 0;
  task.data[10] = runtime.battleAnimArgs[3];
  task.data[11] = runtime.battleAnimArgs[4];
  task.data[7] = getAnimBattlerSpriteId(runtime, ANIM_TARGET);
  task.data[8] = runtime.sprites[task.data[7]].x2;
  task.data[9] = runtime.sprites[task.data[7]].y2;
  task.data[0] = 0;
  task.data[1] = runtime.battleAnimArgs[1];
  task.data[2] = runtime.battleAnimArgs[2];
  task.func = 'AnimTask_ShakeTargetBasedOnMovePowerOrDmg_Step';
}

export function AnimTask_ShakeTargetBasedOnMovePowerOrDmg_Step(runtime: MonMovementRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const sprite = runtime.sprites[task.data[7]];
  if (++task.data[0] > task.data[1]) {
    task.data[0] = 0;
    task.data[12] = (task.data[12] + 1) & 1;
    if (task.data[10]) sprite.x2 = task.data[12] ? task.data[8] + task.data[13] : task.data[8] - task.data[14];
    if (task.data[11]) sprite.y2 = task.data[12] ? task.data[15] : 0;
    if (!--task.data[2]) {
      sprite.x2 = 0;
      sprite.y2 = 0;
      destroyAnimVisualTask(runtime, taskId);
    }
  }
}

export const animTaskShakeMon = AnimTask_ShakeMon;
export const animTaskShakeMonStep = AnimTask_ShakeMon_Step;
export const animTaskShakeMon2 = AnimTask_ShakeMon2;
export const animTaskShakeMon2Step = AnimTask_ShakeMon2Step;
export const animTaskShakeMonInPlace = AnimTask_ShakeMonInPlace;
export const animTaskShakeMonInPlaceStep = AnimTask_ShakeMonInPlace_Step;
export const animTaskShakeAndSinkMon = AnimTask_ShakeAndSinkMon;
export const animTaskShakeAndSinkMonStep = AnimTask_ShakeAndSinkMon_Step;
export const animTaskTranslateMonElliptical = AnimTask_TranslateMonElliptical;
export const animTaskTranslateMonEllipticalStep = AnimTask_TranslateMonElliptical_Step;
export const animTaskTranslateMonEllipticalRespectSide = AnimTask_TranslateMonEllipticalRespectSide;
export const doHorizontalLunge = DoHorizontalLunge;
export const reverseHorizontalLungeDirection = ReverseHorizontalLungeDirection;
export const doVerticalDip = DoVerticalDip;
export const reverseVerticalDipDirection = ReverseVerticalDipDirection;
export const slideMonToOriginalPos = SlideMonToOriginalPos;
export const slideMonToOriginalPosStep = SlideMonToOriginalPos_Step;
export const slideMonToOffset = SlideMonToOffset;
export const slideMonToOffsetAndBack = SlideMonToOffsetAndBack;
export const slideMonToOffsetAndBackEnd = SlideMonToOffsetAndBack_End;
export const animTaskWindUpLunge = AnimTask_WindUpLunge;
export const animTaskWindUpLungeStep1 = AnimTask_WindUpLunge_Step1;
export const animTaskWindUpLungeStep2 = AnimTask_WindUpLunge_Step2;
export const animTaskSlideOffScreen = AnimTask_SlideOffScreen;
export const animTaskSlideOffScreenStep = AnimTask_SlideOffScreen_Step;
export const animTaskSwayMon = AnimTask_SwayMon;
export const animTaskSwayMonStep = AnimTask_SwayMon_Step;
export const animTaskScaleMonAndRestore = AnimTask_ScaleMonAndRestore;
export const animTaskScaleMonAndRestoreStep = AnimTask_ScaleMonAndRestore_Step;
export const animTaskRotateMonSpriteToSide = AnimTask_RotateMonSpriteToSide;
export const animTaskRotateMonToSideAndRestore = AnimTask_RotateMonToSideAndRestore;
export const animTaskRotateMonSpriteToSideStep = AnimTask_RotateMonSpriteToSide_Step;
export const animTaskShakeTargetBasedOnMovePowerOrDmg = AnimTask_ShakeTargetBasedOnMovePowerOrDmg;
export const animTaskShakeTargetBasedOnMovePowerOrDmgStep = AnimTask_ShakeTargetBasedOnMovePowerOrDmg_Step;

const getAnimBattlerSpriteId = (runtime: MonMovementRuntime, animBattler: number): number => {
  const battler = animBattler === ANIM_ATTACKER ? runtime.battleAnimAttacker :
    animBattler === ANIM_TARGET ? runtime.battleAnimTarget :
      animBattler === ANIM_ATK_PARTNER ? runtime.battleAnimAttacker ^ BIT_FLANK :
        animBattler === ANIM_DEF_PARTNER ? runtime.battleAnimTarget ^ BIT_FLANK :
          animBattler;
  return runtime.battlerSpriteIds[battler] ?? SPRITE_NONE;
};
const getBattlerSide = (runtime: MonMovementRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const getBattlerAtPosition = (runtime: MonMovementRuntime, position: number): number => runtime.battlerAtPosition[position] ?? 0;
const isBattlerSpriteVisible = (runtime: MonMovementRuntime, battler: number): boolean => runtime.battlerVisible[battler] === true;
const storeSpriteCallbackInData6 = (sprite: MonMovementSprite, callback: MonMovementCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const destroyAnimSprite = (sprite: MonMovementSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const destroyAnimVisualTask = (runtime: MonMovementRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};
const initSpriteDataForLinearTranslation = (_sprite: MonMovementSprite): void => {};
const prepareBattlerSpriteForRotScale = (runtime: MonMovementRuntime, spriteId: number, objMode: number): void => {
  runtime.sprites[spriteId].rotScalePrepared = objMode;
  runtime.operations.push(`PrepareBattlerSpriteForRotScale:${spriteId}:${objMode}`);
};
const setSpriteRotScale = (runtime: MonMovementRuntime, spriteId: number, xScale: number, yScale: number, rotation: number): void => {
  runtime.sprites[spriteId].rotScale = { xScale, yScale, rotation };
  runtime.operations.push(`SetSpriteRotScale:${spriteId}:${xScale}:${yScale}:${rotation}`);
};
const resetSpriteRotScale = (runtime: MonMovementRuntime, spriteId: number): void => {
  runtime.sprites[spriteId].rotScale = null;
  runtime.operations.push(`ResetSpriteRotScale:${spriteId}`);
};
const setBattlerSpriteYOffsetFromRotation = (runtime: MonMovementRuntime, spriteId: number): void => {
  runtime.sprites[spriteId].yOffsetFromRotation = true;
  runtime.operations.push(`SetBattlerSpriteYOffsetFromRotation:${spriteId}`);
};
