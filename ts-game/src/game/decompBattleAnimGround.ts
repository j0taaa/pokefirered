import { gSineTable } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const MAX_BATTLERS_COUNT = 4;
export const SPRITE_NONE = 0xff;
export const DISPLAY_HEIGHT = 160;
export const BIT_FLANK = 2;

export const BATTLER_COORD_X = 'x';
export const BATTLER_COORD_X_2 = 'x2';
export const BATTLER_COORD_Y_PIC_OFFSET = 'yPicOffset';

export type GroundCallback =
  | 'AnimBonemerangProjectile'
  | 'AnimBonemerangProjectile_Step'
  | 'AnimBonemerangProjectile_End'
  | 'AnimBoneHitProjectile'
  | 'AnimDirtScatter'
  | 'AnimMudSportDirt'
  | 'AnimMudSportDirtRising'
  | 'AnimMudSportDirtFalling'
  | 'AnimDirtPlumeParticle'
  | 'AnimDirtPlumeParticle_Step'
  | 'AnimDigDirtMound'
  | 'StartAnimLinearTranslation'
  | 'WaitAnimForDuration'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix';

export type GroundTaskFunc =
  | 'AnimTask_DigBounceMovement'
  | 'AnimTask_DigDisappear'
  | 'AnimTask_DigSetVisibleUnderground'
  | 'AnimTask_DigRiseUpFromHole'
  | 'AnimTask_ShakeTerrain'
  | 'AnimTask_ShakeBattlers'
  | 'WaitForFissureCompletion'
  | 'DestroyAnimVisualTask';

export interface GroundSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: GroundCallback;
}

export interface GroundSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: GroundCallback;
  storedCallback: GroundCallback | null;
  destroyed: boolean;
  invisible: boolean;
  oam: { tileNum: number };
}

export interface GroundTask {
  func: GroundTaskFunc;
  data: number[];
  priority: number;
  destroyed: boolean;
}

export interface GroundRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  animMovePower: number;
  battlerSides: Record<number, number>;
  battlerSpriteIds: Record<number, number>;
  battlerVisible: Record<number, boolean>;
  battlerBgPriorityRanks: Record<number, number>;
  battlerCoords: Record<number, { x: number; x2: number; yPicOffset: number; yWithElevation: number }>;
  sprites: GroundSprite[];
  tasks: Array<GroundTask | null>;
  battleBg1X: number;
  battleBg1Y: number;
  battleBg2X: number;
  battleBg2Y: number;
  battleBg3X: number;
  battleBg3Y: number;
  scanlineEffect: { state: number; params: { dmaDest: string; dmaControl: string; initState: number; unused9: number } | null };
  scanlineEffectRegBuffers: [number[], number[]];
  randomValues: number[];
  operations: string[];
}

export const sAffineAnimBonemerang = [
  { xScale: 0x0, yScale: 0x0, rotation: 15, duration: 1 },
  { jump: 0 }
] as const;

export const sAffineAnimSpinningBone = [
  { xScale: 0x0, yScale: 0x0, rotation: 20, duration: 1 },
  { jump: 0 }
] as const;

export const gBonemerangSpriteTemplate: GroundSpriteTemplate = {
  tileTag: 'ANIM_TAG_BONE',
  paletteTag: 'ANIM_TAG_BONE',
  oam: 'gOamData_AffineNormal_ObjNormal_32x32',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: [sAffineAnimBonemerang],
  callback: 'AnimBonemerangProjectile'
};

export const gSpinningBoneSpriteTemplate: GroundSpriteTemplate = {
  tileTag: 'ANIM_TAG_BONE',
  paletteTag: 'ANIM_TAG_BONE',
  oam: 'gOamData_AffineNormal_ObjNormal_32x32',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: [sAffineAnimSpinningBone],
  callback: 'AnimBoneHitProjectile'
};

export const gSandAttackDirtSpriteTemplate: GroundSpriteTemplate = {
  tileTag: 'ANIM_TAG_MUD_SAND',
  paletteTag: 'ANIM_TAG_MUD_SAND',
  oam: 'gOamData_AffineOff_ObjNormal_8x8',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimDirtScatter'
};

export const sAnimMudSlapMud = [{ frame: 1, duration: 1 }] as const;

export const gMudSlapMudSpriteTemplate: GroundSpriteTemplate = {
  tileTag: 'ANIM_TAG_MUD_SAND',
  paletteTag: 'ANIM_TAG_MUD_SAND',
  oam: 'gOamData_AffineOff_ObjNormal_16x16',
  anims: [sAnimMudSlapMud],
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimDirtScatter'
};

export const gMudsportMudSpriteTemplate: GroundSpriteTemplate = {
  tileTag: 'ANIM_TAG_MUD_SAND',
  paletteTag: 'ANIM_TAG_MUD_SAND',
  oam: 'gOamData_AffineOff_ObjNormal_16x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimMudSportDirt'
};

export const gDirtPlumeSpriteTemplate: GroundSpriteTemplate = {
  tileTag: 'ANIM_TAG_MUD_SAND',
  paletteTag: 'ANIM_TAG_MUD_SAND',
  oam: 'gOamData_AffineOff_ObjNormal_8x8',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimDirtPlumeParticle'
};

export const gDirtMoundSpriteTemplate: GroundSpriteTemplate = {
  tileTag: 'ANIM_TAG_DIRT_MOUND',
  paletteTag: 'ANIM_TAG_DIRT_MOUND',
  oam: 'gOamData_AffineOff_ObjNormal_32x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimDigDirtMound'
};

export const createGroundSprite = (): GroundSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 16 }, () => 0),
  callback: 'AnimBonemerangProjectile',
  storedCallback: null,
  destroyed: false,
  invisible: false,
  oam: { tileNum: 0 }
});

export const createGroundRuntime = (): GroundRuntime => ({
  battleAnimArgs: Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: 0,
  battleAnimTarget: 1,
  animMovePower: 80,
  battlerSides: { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerSpriteIds: { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerVisible: { 0: true, 1: true, 2: true, 3: true },
  battlerBgPriorityRanks: { 0: 1, 1: 2, 2: 1, 3: 2 },
  battlerCoords: {
    0: { x: 32, x2: 48, yPicOffset: 72, yWithElevation: 80 },
    1: { x: 160, x2: 176, yPicOffset: 64, yWithElevation: 72 },
    2: { x: 72, x2: 88, yPicOffset: 88, yWithElevation: 96 },
    3: { x: 200, x2: 216, yPicOffset: 84, yWithElevation: 92 }
  },
  sprites: Array.from({ length: 64 }, () => createGroundSprite()),
  tasks: [],
  battleBg1X: 10,
  battleBg1Y: 20,
  battleBg2X: 30,
  battleBg2Y: 40,
  battleBg3X: 50,
  battleBg3Y: 60,
  scanlineEffect: { state: 0, params: null },
  scanlineEffectRegBuffers: [Array.from({ length: 160 }, () => 0), Array.from({ length: 160 }, () => 0)],
  randomValues: [],
  operations: []
});

export function AnimBonemerangProjectile(runtime: GroundRuntime, sprite: GroundSprite): void {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2);
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.data[0] = 20;
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_X_2);
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_Y_PIC_OFFSET);
  sprite.data[5] = -40;
  initAnimArcTranslation(sprite);
  sprite.callback = 'AnimBonemerangProjectile_Step';
}

export function AnimBonemerangProjectile_Step(runtime: GroundRuntime, sprite: GroundSprite): void {
  if (translateAnimHorizontalArc(sprite)) {
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.y2 = 0;
    sprite.x2 = 0;
    sprite.data[0] = 20;
    sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2);
    sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET);
    sprite.data[5] = 40;
    initAnimArcTranslation(sprite);
    sprite.callback = 'AnimBonemerangProjectile_End';
  }
}

export function AnimBonemerangProjectile_End(sprite: GroundSprite): void {
  if (translateAnimHorizontalArc(sprite)) {
    destroyAnimSprite(sprite);
  }
}

export function AnimBoneHitProjectile(runtime: GroundRuntime, sprite: GroundSprite): void {
  initSpritePosToAnimTarget(runtime, sprite, true);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  }
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_X_2) + runtime.battleAnimArgs[2];
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_Y_PIC_OFFSET) + runtime.battleAnimArgs[3];
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimDirtScatter(runtime: GroundRuntime, sprite: GroundSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite, true);
  const targetXPos = getBattlerSpriteCoord2(runtime, runtime.battleAnimTarget, BATTLER_COORD_X_2);
  const targetYPos = getBattlerSpriteCoord2(runtime, runtime.battleAnimTarget, BATTLER_COORD_Y_PIC_OFFSET);
  let xOffset = random(runtime) & 0x1f;
  let yOffset = random(runtime) & 0x1f;
  if (xOffset > 16) {
    xOffset = 16 - xOffset;
  }
  if (yOffset > 16) {
    yOffset = 16 - yOffset;
  }
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[2] = targetXPos + xOffset;
  sprite.data[4] = targetYPos + yOffset;
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
}

export function AnimMudSportDirt(runtime: GroundRuntime, sprite: GroundSprite): void {
  sprite.oam.tileNum++;
  if (runtime.battleAnimArgs[0] === 0) {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2) + runtime.battleAnimArgs[1];
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET) + runtime.battleAnimArgs[2];
    sprite.data[0] = runtime.battleAnimArgs[1] > 0 ? 1 : -1;
    sprite.callback = 'AnimMudSportDirtRising';
  } else {
    sprite.x = runtime.battleAnimArgs[1];
    sprite.y = runtime.battleAnimArgs[2];
    sprite.y2 = -runtime.battleAnimArgs[2];
    sprite.callback = 'AnimMudSportDirtFalling';
  }
}

export function AnimMudSportDirtRising(sprite: GroundSprite): void {
  if (++sprite.data[1] > 1) {
    sprite.data[1] = 0;
    sprite.x += sprite.data[0];
  }
  sprite.y -= 4;
  if (sprite.y < -4) {
    destroyAnimSprite(sprite);
  }
}

export function AnimMudSportDirtFalling(sprite: GroundSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.y2 += 4;
      if (sprite.y2 >= 0) {
        sprite.y2 = 0;
        ++sprite.data[0];
      }
      break;
    case 1:
      if (++sprite.data[1] > 0) {
        sprite.data[1] = 0;
        sprite.invisible = !sprite.invisible;
        if (++sprite.data[2] === 10) {
          destroyAnimSprite(sprite);
        }
      }
      break;
  }
}

export function AnimTask_DigDownMovement(runtime: GroundRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (runtime.battleAnimArgs[0] === 0) {
    task.func = 'AnimTask_DigBounceMovement';
  } else {
    task.func = 'AnimTask_DigDisappear';
  }
  runGroundTask(runtime, taskId);
}

export function AnimTask_DigBounceMovement(runtime: GroundRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0: {
      task.data[10] = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
      task.data[11] = getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimAttacker);
      if (task.data[11] === 1) {
        task.data[12] = runtime.battleBg1X;
        task.data[13] = runtime.battleBg1Y;
      } else {
        task.data[12] = runtime.battleBg2X;
        task.data[13] = runtime.battleBg2Y;
      }
      const var0 = getBattlerYCoordWithElevation(runtime, runtime.battleAnimAttacker);
      task.data[14] = var0 - 32;
      task.data[15] = var0 + 32;
      if (task.data[14] < 0) {
        task.data[14] = 0;
      }
      runtime.sprites[task.data[10]].invisible = true;
      ++task.data[0];
      break;
    }
    case 1:
      SetDigScanlineEffect(runtime, task.data[11], task.data[14], task.data[15]);
      ++task.data[0];
      break;
    case 2:
      task.data[2] = (task.data[2] + 6) & 0x7f;
      if (++task.data[4] > 2) {
        task.data[4] = 0;
        ++task.data[3];
      }
      task.data[5] = task.data[3] + (gSineTable[task.data[2]] >> 4);
      if (task.data[11] === 1) {
        runtime.battleBg1Y = task.data[13] - task.data[5];
      } else {
        runtime.battleBg2Y = task.data[13] - task.data[5];
      }

      if (task.data[5] > 63) {
        task.data[5] = 120 - task.data[14];
        if (task.data[11] === 1) {
          runtime.battleBg1Y = task.data[13] - task.data[5];
        } else {
          runtime.battleBg2Y = task.data[13] - task.data[5];
        }
        runtime.sprites[task.data[10]].x2 = 272 - runtime.sprites[task.data[10]].x;
        ++task.data[0];
      }
      break;
    case 3:
      runtime.scanlineEffect.state = 3;
      ++task.data[0];
      break;
    case 4:
      destroyAnimVisualTask(runtime, taskId);
      runtime.sprites[task.data[10]].invisible = true;
      break;
  }
}

export function AnimTask_DigDisappear(runtime: GroundRuntime, taskId: number): void {
  const spriteId = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
  runtime.sprites[spriteId].invisible = true;
  runtime.sprites[spriteId].x2 = 0;
  runtime.sprites[spriteId].y2 = 0;
  if (getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimAttacker) === 1) {
    runtime.battleBg1Y = 0;
  } else {
    runtime.battleBg2Y = 0;
  }
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_DigUpMovement(runtime: GroundRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (runtime.battleAnimArgs[0] === 0) {
    task.func = 'AnimTask_DigSetVisibleUnderground';
  } else {
    task.func = 'AnimTask_DigRiseUpFromHole';
  }
  runGroundTask(runtime, taskId);
}

export function AnimTask_DigSetVisibleUnderground(runtime: GroundRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      task.data[10] = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
      runtime.sprites[task.data[10]].invisible = false;
      runtime.sprites[task.data[10]].x2 = 0;
      runtime.sprites[task.data[10]].y2 = DISPLAY_HEIGHT - runtime.sprites[task.data[10]].y;
      ++task.data[0];
      break;
    case 1:
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimTask_DigRiseUpFromHole(runtime: GroundRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0: {
      task.data[10] = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
      task.data[11] = getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimAttacker);
      if (task.data[11] === 1) {
        task.data[12] = runtime.battleBg1X;
      } else {
        task.data[12] = runtime.battleBg2X;
      }
      const var0 = getBattlerYCoordWithElevation(runtime, runtime.battleAnimAttacker);
      task.data[14] = var0 - 32;
      task.data[15] = var0 + 32;
      ++task.data[0];
      break;
    }
    case 1:
      SetDigScanlineEffect(runtime, task.data[11], 0, task.data[15]);
      ++task.data[0];
      break;
    case 2:
      runtime.sprites[task.data[10]].y2 = 96;
      ++task.data[0];
      break;
    case 3:
      runtime.sprites[task.data[10]].y2 -= 8;
      if (runtime.sprites[task.data[10]].y2 === 0) {
        runtime.scanlineEffect.state = 3;
        ++task.data[0];
      }
      break;
    case 4:
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function SetDigScanlineEffect(runtime: GroundRuntime, useBg1: number, y: number, endY: number): void {
  const bgX = useBg1 === 1 ? runtime.battleBg1X : runtime.battleBg2X;
  const dmaDest = useBg1 === 1 ? 'REG_BG1HOFS' : 'REG_BG2HOFS';
  let scanY = y;
  if (scanY < 0) {
    scanY = 0;
  }
  while (scanY < endY) {
    runtime.scanlineEffectRegBuffers[0][scanY] = bgX;
    runtime.scanlineEffectRegBuffers[1][scanY] = bgX;
    ++scanY;
  }
  while (scanY < 160) {
    runtime.scanlineEffectRegBuffers[0][scanY] = bgX + 240;
    runtime.scanlineEffectRegBuffers[1][scanY] = bgX + 240;
    ++scanY;
  }
  runtime.scanlineEffect.params = {
    dmaDest,
    dmaControl: 'SCANLINE_EFFECT_DMACNT_16BIT',
    initState: 1,
    unused9: 0
  };
}

export function AnimDirtPlumeParticle(runtime: GroundRuntime, sprite: GroundSprite): void {
  const battler = runtime.battleAnimArgs[0] === 0 ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  let xOffset = 24;
  if (runtime.battleAnimArgs[1] === 1) {
    xOffset *= -1;
    runtime.battleAnimArgs[2] *= -1;
  }
  sprite.x = getBattlerSpriteCoord(runtime, battler, BATTLER_COORD_X_2) + xOffset;
  sprite.y = getBattlerYCoordWithElevation(runtime, battler) + 30;
  sprite.data[0] = runtime.battleAnimArgs[5];
  sprite.data[2] = sprite.x + runtime.battleAnimArgs[2];
  sprite.data[4] = sprite.y + runtime.battleAnimArgs[3];
  sprite.data[5] = runtime.battleAnimArgs[4];
  initAnimArcTranslation(sprite);
  sprite.callback = 'AnimDirtPlumeParticle_Step';
}

export function AnimDirtPlumeParticle_Step(sprite: GroundSprite): void {
  if (translateAnimHorizontalArc(sprite)) {
    destroyAnimSprite(sprite);
  }
}

export function AnimDigDirtMound(runtime: GroundRuntime, sprite: GroundSprite): void {
  const battler = runtime.battleAnimArgs[0] === 0 ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  sprite.x = getBattlerSpriteCoord(runtime, battler, BATTLER_COORD_X) - 16 + runtime.battleAnimArgs[1] * 32;
  sprite.y = getBattlerYCoordWithElevation(runtime, battler) + 32;
  sprite.oam.tileNum += runtime.battleAnimArgs[1] * 8;
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.callback = 'WaitAnimForDuration';
}

export function AnimTask_HorizontalShake(runtime: GroundRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (runtime.battleAnimArgs[1] !== 0) {
    task.data[14] = task.data[15] = runtime.battleAnimArgs[1] + 3;
  } else {
    task.data[14] = task.data[15] = Math.trunc(runtime.animMovePower / 10) + 3;
  }

  task.data[3] = runtime.battleAnimArgs[2];
  switch (runtime.battleAnimArgs[0]) {
    case MAX_BATTLERS_COUNT + 1:
      task.data[13] = runtime.battleBg3X;
      task.func = 'AnimTask_ShakeTerrain';
      break;
    case MAX_BATTLERS_COUNT:
      task.data[13] = 0;
      for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
        if (isBattlerSpriteVisible(runtime, i)) {
          task.data[9 + task.data[13]] = runtime.battlerSpriteIds[i];
          task.data[13]++;
        }
      }
      task.func = 'AnimTask_ShakeBattlers';
      break;
    default:
      task.data[9] = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[0]);
      if (task.data[9] === SPRITE_NONE) {
        destroyAnimVisualTask(runtime, taskId);
      } else {
        task.data[13] = 1;
        task.func = 'AnimTask_ShakeBattlers';
      }
      break;
  }
}

export function AnimTask_ShakeTerrain(runtime: GroundRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        runtime.battleBg3X = (task.data[2] & 1) === 0 ? task.data[13] + task.data[15] : task.data[13] - task.data[15];
        if (++task.data[2] === task.data[3]) {
          task.data[2] = 0;
          task.data[14]--;
          task.data[0]++;
        }
      }
      break;
    case 1:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        runtime.battleBg3X = (task.data[2] & 1) === 0 ? task.data[13] + task.data[14] : task.data[13] - task.data[14];
        if (++task.data[2] === 4) {
          task.data[2] = 0;
          if (--task.data[14] === 0) {
            task.data[0]++;
          }
        }
      }
      break;
    case 2:
      runtime.battleBg3X = task.data[13];
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimTask_ShakeBattlers(runtime: GroundRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        SetBattlersXOffsetForShake(runtime, task);
        if (++task.data[2] === task.data[3]) {
          task.data[2] = 0;
          task.data[14]--;
          task.data[0]++;
        }
      }
      break;
    case 1:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        SetBattlersXOffsetForShake(runtime, task);
        if (++task.data[2] === 4) {
          task.data[2] = 0;
          if (--task.data[14] === 0) {
            task.data[0]++;
          }
        }
      }
      break;
    case 2:
      for (let i = 0; i < task.data[13]; i++) {
        runtime.sprites[task.data[9 + i]].x2 = 0;
      }
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function SetBattlersXOffsetForShake(runtime: GroundRuntime, task: GroundTask): void {
  const xOffset = (task.data[2] & 1) === 0 ? Math.trunc(task.data[14] / 2) + (task.data[14] & 1) : -Math.trunc(task.data[14] / 2);
  for (let i = 0; i < task.data[13]; i++) {
    runtime.sprites[task.data[9 + i]].x2 = xOffset;
  }
}

export function AnimTask_IsPowerOver99(runtime: GroundRuntime, taskId: number): void {
  runtime.battleAnimArgs[15] = runtime.animMovePower > 99 ? 1 : 0;
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_PositionFissureBgOnBattler(runtime: GroundRuntime, taskId: number): number {
  let battler = (runtime.battleAnimArgs[0] & 1) !== 0 ? runtime.battleAnimTarget : runtime.battleAnimAttacker;
  if (runtime.battleAnimArgs[0] > 1) {
    battler ^= BIT_FLANK;
  }
  const newTaskId = createGroundTask(runtime, 'WaitForFissureCompletion', runtime.battleAnimArgs[1]);
  const newTask = runtime.tasks[newTaskId]!;
  newTask.data[1] = (32 - getBattlerSpriteCoord(runtime, battler, BATTLER_COORD_X_2)) & 0x1ff;
  newTask.data[2] = (64 - getBattlerSpriteCoord(runtime, battler, BATTLER_COORD_Y_PIC_OFFSET)) & 0xff;
  runtime.battleBg3X = newTask.data[1];
  runtime.battleBg3Y = newTask.data[2];
  newTask.data[3] = runtime.battleAnimArgs[2];
  destroyAnimVisualTask(runtime, taskId);
  return newTaskId;
}

export function WaitForFissureCompletion(runtime: GroundRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (runtime.battleAnimArgs[7] === task.data[3]) {
    runtime.battleBg3X = 0;
    runtime.battleBg3Y = 0;
    destroyTask(runtime, taskId);
  } else {
    runtime.battleBg3X = task.data[1];
    runtime.battleBg3Y = task.data[2];
  }
}

export function createGroundTask(runtime: GroundRuntime, func: GroundTaskFunc, priority = 0): number {
  const task = { func, data: Array.from({ length: 16 }, () => 0), priority, destroyed: false };
  const slot = runtime.tasks.findIndex((candidate) => candidate === null);
  if (slot >= 0) {
    runtime.tasks[slot] = task;
    return slot;
  }
  runtime.tasks.push(task);
  return runtime.tasks.length - 1;
}

export function runGroundTask(runtime: GroundRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  switch (task.func) {
    case 'AnimTask_DigBounceMovement':
      AnimTask_DigBounceMovement(runtime, taskId);
      break;
    case 'AnimTask_DigDisappear':
      AnimTask_DigDisappear(runtime, taskId);
      break;
    case 'AnimTask_DigSetVisibleUnderground':
      AnimTask_DigSetVisibleUnderground(runtime, taskId);
      break;
    case 'AnimTask_DigRiseUpFromHole':
      AnimTask_DigRiseUpFromHole(runtime, taskId);
      break;
    case 'AnimTask_ShakeTerrain':
      AnimTask_ShakeTerrain(runtime, taskId);
      break;
    case 'AnimTask_ShakeBattlers':
      AnimTask_ShakeBattlers(runtime, taskId);
      break;
    case 'WaitForFissureCompletion':
      WaitForFissureCompletion(runtime, taskId);
      break;
  }
}

export const animBonemerangProjectile = AnimBonemerangProjectile;
export const animBonemerangProjectileStep = AnimBonemerangProjectile_Step;
export const animBonemerangProjectileEnd = AnimBonemerangProjectile_End;
export const animBoneHitProjectile = AnimBoneHitProjectile;
export const animDirtScatter = AnimDirtScatter;
export const animMudSportDirt = AnimMudSportDirt;
export const animMudSportDirtRising = AnimMudSportDirtRising;
export const animMudSportDirtFalling = AnimMudSportDirtFalling;
export const animTaskDigDownMovement = AnimTask_DigDownMovement;
export const animTaskDigBounceMovement = AnimTask_DigBounceMovement;
export const animTaskDigDisappear = AnimTask_DigDisappear;
export const animTaskDigUpMovement = AnimTask_DigUpMovement;
export const animTaskDigSetVisibleUnderground = AnimTask_DigSetVisibleUnderground;
export const animTaskDigRiseUpFromHole = AnimTask_DigRiseUpFromHole;
export const setDigScanlineEffect = SetDigScanlineEffect;
export const animDirtPlumeParticle = AnimDirtPlumeParticle;
export const animDirtPlumeParticleStep = AnimDirtPlumeParticle_Step;
export const animDigDirtMound = AnimDigDirtMound;
export const animTaskHorizontalShake = AnimTask_HorizontalShake;
export const animTaskShakeTerrain = AnimTask_ShakeTerrain;
export const animTaskShakeBattlers = AnimTask_ShakeBattlers;
export const setBattlersXOffsetForShake = SetBattlersXOffsetForShake;
export const animTaskIsPowerOver99 = AnimTask_IsPowerOver99;
export const animTaskPositionFissureBgOnBattler = AnimTask_PositionFissureBgOnBattler;
export const waitForFissureCompletion = WaitForFissureCompletion;

const getBattlerSide = (runtime: GroundRuntime, battler: number): number =>
  runtime.battlerSides[battler] ?? B_SIDE_PLAYER;

const getBattlerSpriteCoord = (
  runtime: GroundRuntime,
  battler: number,
  coord: typeof BATTLER_COORD_X | typeof BATTLER_COORD_X_2 | typeof BATTLER_COORD_Y_PIC_OFFSET
): number => runtime.battlerCoords[battler]?.[coord] ?? 0;

const getBattlerSpriteCoord2 = getBattlerSpriteCoord;

const getBattlerYCoordWithElevation = (runtime: GroundRuntime, battler: number): number =>
  runtime.battlerCoords[battler]?.yWithElevation ?? 0;

const initSpritePosToAnimTarget = (runtime: GroundRuntime, sprite: GroundSprite, respectSide: boolean): void => {
  const xOffset = respectSide && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER
    ? -runtime.battleAnimArgs[0]
    : runtime.battleAnimArgs[0];
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_X_2) + xOffset;
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_Y_PIC_OFFSET) + runtime.battleAnimArgs[1];
};

const initSpritePosToAnimAttacker = (runtime: GroundRuntime, sprite: GroundSprite, respectSide: boolean): void => {
  const xOffset = respectSide && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER
    ? -runtime.battleAnimArgs[0]
    : runtime.battleAnimArgs[0];
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2) + xOffset;
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET) + runtime.battleAnimArgs[1];
};

const initAnimArcTranslation = (_sprite: GroundSprite): void => {
};

const translateAnimHorizontalArc = (sprite: GroundSprite): boolean => {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
  }
  return sprite.data[0] === 0;
};

const storeSpriteCallbackInData6 = (sprite: GroundSprite, callback: GroundCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};

const destroyAnimSprite = (sprite: GroundSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};

const random = (runtime: GroundRuntime): number => runtime.randomValues.shift() ?? 0;

const getAnimBattlerSpriteId = (runtime: GroundRuntime, animBattler: number): number => {
  const battler = animBattler === ANIM_ATTACKER ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  return runtime.battlerSpriteIds[battler] ?? SPRITE_NONE;
};

const getBattlerSpriteBgPriorityRank = (runtime: GroundRuntime, battler: number): number =>
  runtime.battlerBgPriorityRanks[battler] ?? 1;

const isBattlerSpriteVisible = (runtime: GroundRuntime, battler: number): boolean =>
  runtime.battlerVisible[battler] === true;

const destroyAnimVisualTask = (runtime: GroundRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};

const destroyTask = (runtime: GroundRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
  }
  runtime.tasks[taskId] = null;
};
