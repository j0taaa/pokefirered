import { cos, gSineTable, sin } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const MAX_SPRITES = 64;
export const ST_OAM_HFLIP = 1;
export const ST_OAM_OBJ_NORMAL = 0;
export const ST_OAM_OBJ_BLEND = 1;
export const DISPLAY_WIDTH = 240;

export type GhostCallback =
  | 'AnimConfuseRayBallBounce'
  | 'AnimConfuseRayBallBounce_Step1'
  | 'AnimConfuseRayBallBounce_Step2'
  | 'DestroyAnimSpriteAndDisableBlend'
  | 'AnimConfuseRayBallSpiral'
  | 'AnimConfuseRayBallSpiral_Step'
  | 'AnimShadowBall'
  | 'AnimShadowBall_Step'
  | 'AnimLick'
  | 'AnimLick_Step'
  | 'AnimDestinyBondWhiteShadow'
  | 'AnimDestinyBondWhiteShadow_Step'
  | 'AnimCurseNail'
  | 'AnimCurseNail_Step1'
  | 'AnimCurseNail_Step2'
  | 'AnimCurseNail_End'
  | 'AnimGhostStatusSprite'
  | 'AnimGhostStatusSprite_End'
  | 'AnimGrudgeFlame'
  | 'AnimMonMoveCircular'
  | 'AnimMonMoveCircular_Step'
  | 'TranslateSpriteLinearFixedPoint'
  | 'WaitAnimForDuration'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix'
  | 'SpriteCallbackDummy';

export type GhostTaskFunc =
  | 'AnimTask_NightShadeClone_Step1'
  | 'AnimTask_NightShadeClone_Step2'
  | 'AnimTask_NightmareClone_Step'
  | 'AnimTask_SpiteTargetShadow_Step1'
  | 'AnimTask_SpiteTargetShadow_Step2'
  | 'AnimTask_SpiteTargetShadow_Step3'
  | 'AnimTask_DestinyBondWhiteShadow_Step'
  | 'AnimTask_CurseStretchingBlackBg_Step1'
  | 'AnimTask_CurseStretchingBlackBg_Step2'
  | 'AnimTask_GrudgeFlames_Step'
  | 'AnimTask_GhostGetOut_Step1'
  | 'AnimTask_GhostGetOut_Step2'
  | 'AnimTask_GhostGetOut_Step3'
  | 'DestroyAnimVisualTask';

export interface GhostTemplate {
  tileTag: string | number;
  paletteTag: string | number;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: GhostCallback;
}

export interface GhostSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: GhostCallback;
  storedCallback: GhostCallback | null;
  invisible: boolean;
  destroyed: boolean;
  animEnded: boolean;
  animNum: number;
  subpriority: number;
  oam: { priority: number; matrixNum: number; affineMode: number; tileNum: number; paletteNum: number; objMode: number };
  rotScale: { xScale: number; yScale: number; rotation: number } | null;
}

export interface GhostTask {
  data: number[];
  func: GhostTaskFunc;
  destroyed: boolean;
}

export interface GhostRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  contest: boolean;
  animCustomPanning: number;
  battlerSides: Record<number, number>;
  battlerSpriteIds: Record<number, number>;
  battlerVisible: Record<number, boolean>;
  battlerBgPriority: Record<number, number>;
  battlerBgPriorityRank: Record<number, number>;
  battlerSubpriority: Record<number, number>;
  battlerInvisible: Record<number, boolean>;
  battlerCoords: Record<number, { x: number; y: number; x2: number; yPicOffset: number; bottom: number; width: number }>;
  sprites: GhostSprite[];
  tasks: Array<GhostTask | null>;
  registers: Record<string, number>;
  battleWin0H: number;
  battleWin0V: number;
  paletteFadeActive: boolean;
  scanlineEffectState: number;
  nextPalette: number;
  operations: string[];
}

const frame = (tileOffset: number, duration: number) => ({ tileOffset, duration });
const affineFrame = (xScale: number, yScale: number, rotation: number, duration: number) => ({ xScale, yScale, rotation, duration });
const template = (tileTag: string | number, oam: string, anims: readonly unknown[] | string, affineAnims: readonly unknown[] | string, callback: GhostCallback): GhostTemplate => ({
  tileTag,
  paletteTag: tileTag,
  oam,
  anims,
  images: null,
  affineAnims,
  callback
});

export const sAffineAnimConfuseRayBallBounce = [affineFrame(0x1e, 0x1e, 10, 5), affineFrame(-0x1e, -0x1e, 10, 5), { jump: 0 }] as const;
export const sAffineAnimsConfuseRayBallBounce = [sAffineAnimConfuseRayBallBounce] as const;
export const gConfuseRayBallBounceSpriteTemplate = template('ANIM_TAG_YELLOW_BALL', 'gOamData_AffineDouble_ObjNormal_16x16', 'gDummySpriteAnimTable', sAffineAnimsConfuseRayBallBounce, 'AnimConfuseRayBallBounce');
export const gConfuseRayBallSpiralSpriteTemplate = template('ANIM_TAG_YELLOW_BALL', 'gOamData_AffineOff_ObjBlend_16x16', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimConfuseRayBallSpiral');
export const sAffineAnimShadowBall = [affineFrame(0, 0, 10, 1), { jump: 0 }] as const;
export const sAffineAnimsShadowBall = [sAffineAnimShadowBall] as const;
export const gShadowBallSpriteTemplate = template('ANIM_TAG_SHADOW_BALL', 'gOamData_AffineNormal_ObjNormal_32x32', 'gDummySpriteAnimTable', sAffineAnimsShadowBall, 'AnimShadowBall');
export const sAnimLick = [frame(0, 2), frame(8, 2), frame(16, 2), frame(24, 2), frame(32, 2), { end: true }] as const;
export const sAnimsLick = [sAnimLick] as const;
export const gLickSpriteTemplate = template('ANIM_TAG_LICK', 'gOamData_AffineOff_ObjNormal_16x32', sAnimsLick, 'gDummySpriteAffineAnimTable', 'AnimLick');
export const sAffineAnimUnused = [affineFrame(0x200, 0x200, 0, 0), { end: true }] as const;
export const sAffineAnimsUnused = [sAffineAnimUnused] as const;
export const gDestinyBondWhiteShadowSpriteTemplate = template('ANIM_TAG_WHITE_SHADOW', 'gOamData_AffineOff_ObjBlend_64x32', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimDestinyBondWhiteShadow');
export const gCurseNailSpriteTemplate = template('ANIM_TAG_NAIL', 'gOamData_AffineOff_ObjBlend_32x16', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimCurseNail');
export const gCurseGhostSpriteTemplate = template('ANIM_TAG_GHOSTLY_SPIRIT', 'gOamData_AffineOff_ObjBlend_32x32', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimGhostStatusSprite');
export const gNightmareDevilSpriteTemplate = template('ANIM_TAG_DEVIL', 'gOamData_AffineOff_ObjBlend_32x32', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimGhostStatusSprite');
export const sAnimGrudgeFlame = [frame(0, 4), frame(8, 4), frame(16, 4), frame(24, 4), { jump: 0 }] as const;
export const sAnimsGrudgeFlame = [sAnimGrudgeFlame] as const;
export const gGrudgeFlameSpriteTemplate = template('ANIM_TAG_PURPLE_FLAME', 'gOamData_AffineOff_ObjBlend_16x32', sAnimsGrudgeFlame, 'gDummySpriteAffineAnimTable', 'AnimGrudgeFlame');
export const sMonMoveCircularSpriteTemplate = template(0, 'gDummyOamData', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimMonMoveCircular');

export const createGhostSprite = (): GhostSprite => ({
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
  animNum: 0,
  subpriority: 0,
  oam: { priority: 0, matrixNum: 0, affineMode: 0, tileNum: 0, paletteNum: 0, objMode: ST_OAM_OBJ_NORMAL },
  rotScale: null
});

export const createGhostRuntime = (overrides: Partial<GhostRuntime> = {}): GhostRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  contest: overrides.contest ?? false,
  animCustomPanning: overrides.animCustomPanning ?? 0,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerVisible: overrides.battlerVisible ?? { 0: true, 1: true, 2: true, 3: true },
  battlerBgPriority: overrides.battlerBgPriority ?? { 0: 1, 1: 2, 2: 1, 3: 2 },
  battlerBgPriorityRank: overrides.battlerBgPriorityRank ?? { 0: 1, 1: 2, 2: 1, 3: 2 },
  battlerSubpriority: overrides.battlerSubpriority ?? { 0: 4, 1: 5, 2: 4, 3: 5 },
  battlerInvisible: overrides.battlerInvisible ?? { 0: false, 1: false, 2: false, 3: false },
  battlerCoords: overrides.battlerCoords ?? {
    0: { x: 48, y: 72, x2: 48, yPicOffset: 64, bottom: 98, width: 40 },
    1: { x: 176, y: 48, x2: 176, yPicOffset: 48, bottom: 76, width: 44 },
    2: { x: 80, y: 80, x2: 80, yPicOffset: 72, bottom: 106, width: 40 },
    3: { x: 144, y: 40, x2: 144, yPicOffset: 40, bottom: 68, width: 40 }
  },
  sprites: overrides.sprites ?? Array.from({ length: MAX_SPRITES }, () => createGhostSprite()),
  tasks: overrides.tasks ?? [],
  registers: overrides.registers ?? {},
  battleWin0H: overrides.battleWin0H ?? 0,
  battleWin0V: overrides.battleWin0V ?? 0,
  paletteFadeActive: overrides.paletteFadeActive ?? false,
  scanlineEffectState: overrides.scanlineEffectState ?? 0,
  nextPalette: overrides.nextPalette ?? 1,
  operations: overrides.operations ?? []
});

export const createGhostTask = (runtime: GhostRuntime, func: GhostTaskFunc = 'DestroyAnimVisualTask'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), func, destroyed: false });
  return id;
};

export function AnimConfuseRayBallBounce(runtime: GhostRuntime, sprite: GhostSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[1] = sprite.x;
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  sprite.data[3] = sprite.y;
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  initAnimLinearTranslationWithSpeed(sprite);
  sprite.callback = 'AnimConfuseRayBallBounce_Step1';
  sprite.data[6] = 16;
  setGpuReg(runtime, 'BLDCNT', 0x40 | 0x3f00);
  setGpuReg(runtime, 'BLDALPHA', sprite.data[6]);
}

export function AnimConfuseRayBallBounce_Step1(runtime: GhostRuntime, sprite: GhostSprite): void {
  UpdateConfuseRayBallBlend(runtime, sprite);
  if (animTranslateLinear(sprite)) {
    sprite.callback = 'AnimConfuseRayBallBounce_Step2';
    return;
  }
  sprite.x2 += sin(sprite.data[5], 10);
  sprite.y2 += cos(sprite.data[5], 15);
  const r2 = sprite.data[5];
  sprite.data[5] = (sprite.data[5] + 5) & 0xff;
  const r0 = sprite.data[5];
  if ((r2 === 0 || r2 > 196) && r0 > 0) playSe12WithPanning(runtime, 'SE_M_CONFUSE_RAY', runtime.animCustomPanning);
}

export function AnimConfuseRayBallBounce_Step2(runtime: GhostRuntime, sprite: GhostSprite): void {
  sprite.data[0] = 1;
  animTranslateLinear(sprite);
  sprite.x2 += sin(sprite.data[5], 10);
  sprite.y2 += cos(sprite.data[5], 15);
  const r2 = sprite.data[5];
  sprite.data[5] = (sprite.data[5] + 5) & 0xff;
  const r0 = sprite.data[5];
  if ((r2 === 0 || r2 > 196) && r0 > 0) playSe(runtime, 'SE_M_CONFUSE_RAY');
  if (sprite.data[6] === 0) {
    sprite.invisible = true;
    sprite.callback = 'DestroyAnimSpriteAndDisableBlend';
  } else {
    UpdateConfuseRayBallBlend(runtime, sprite);
  }
}

export function UpdateConfuseRayBallBlend(runtime: GhostRuntime, sprite: GhostSprite): void {
  if (sprite.data[6] > 0xff) {
    if (++sprite.data[6] === 0x10d) sprite.data[6] = 0;
    return;
  }
  const r0 = sprite.data[7];
  ++sprite.data[7];
  if ((r0 & 0xff) === 0) {
    sprite.data[7] &= 0xff00;
    if (sprite.data[7] & 0x100) ++sprite.data[6];
    else --sprite.data[6];
    setGpuReg(runtime, 'BLDALPHA', bldalpha(sprite.data[6], 16 - sprite.data[6]));
    if (sprite.data[6] === 0 || sprite.data[6] === 16) sprite.data[7] ^= 0x100;
    if (sprite.data[6] === 0) sprite.data[6] = 0x100;
  }
}

export function AnimConfuseRayBallSpiral(runtime: GhostRuntime, sprite: GhostSprite): void {
  initSpritePosToAnimTarget(runtime, sprite);
  sprite.callback = 'AnimConfuseRayBallSpiral_Step';
  AnimConfuseRayBallSpiral_Step(sprite);
}

export function AnimConfuseRayBallSpiral_Step(sprite: GhostSprite): void {
  sprite.x2 = sin(sprite.data[0], 32);
  sprite.y2 = cos(sprite.data[0], 8);
  const temp1 = u16(sprite.data[0] - 65);
  sprite.oam.priority = temp1 <= 130 ? 2 : 1;
  sprite.data[0] = (sprite.data[0] + 19) & 0xff;
  sprite.data[2] += 80;
  sprite.y2 += sprite.data[2] >> 8;
  ++sprite.data[7];
  if (sprite.data[7] === 61) destroyAnimSprite(sprite);
}

export function AnimTask_NightShadeClone(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  setGpuReg(runtime, 'BLDCNT', 0x40 | 0x3f00);
  setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 0x10));
  const spriteId = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
  prepareBattlerSpriteForRotScale(runtime, spriteId, ST_OAM_OBJ_BLEND);
  setSpriteRotScale(runtime.sprites[spriteId], 128, 128, 0);
  runtime.sprites[spriteId].invisible = false;
  task.data[0] = 128;
  task.data[1] = runtime.battleAnimArgs[0];
  task.data[2] = 0;
  task.data[3] = 16;
  task.func = 'AnimTask_NightShadeClone_Step1';
}

export function AnimTask_NightShadeClone_Step1(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (++task.data[10] === 3) {
    task.data[10] = 0;
    ++task.data[2];
    --task.data[3];
    setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[2], task.data[3]));
    if (task.data[2] === 9) task.func = 'AnimTask_NightShadeClone_Step2';
  }
}

export function AnimTask_NightShadeClone_Step2(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[1] > 0) {
    --task.data[1];
    return;
  }
  const spriteId = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
  task.data[0] += 8;
  if (task.data[0] <= 0xff) {
    setSpriteRotScale(runtime.sprites[spriteId], task.data[0], task.data[0], 0);
  } else {
    resetSpriteRotScale(runtime.sprites[spriteId]);
    destroyAnimVisualTask(runtime, taskId);
    setGpuReg(runtime, 'BLDCNT', 0);
    setGpuReg(runtime, 'BLDALPHA', 0);
  }
}

export function AnimShadowBall(runtime: GhostRuntime, sprite: GhostSprite): void {
  const oldPosX = sprite.x;
  const oldPosY = sprite.y;
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  sprite.data[0] = 0;
  sprite.data[1] = runtime.battleAnimArgs[0];
  sprite.data[2] = runtime.battleAnimArgs[1];
  sprite.data[3] = runtime.battleAnimArgs[2];
  sprite.data[4] = sprite.x << 4;
  sprite.data[5] = sprite.y << 4;
  sprite.data[6] = div(((oldPosX - sprite.x) << 4), runtime.battleAnimArgs[0] << 1);
  sprite.data[7] = div(((oldPosY - sprite.y) << 4), runtime.battleAnimArgs[0] << 1);
  sprite.callback = 'AnimShadowBall_Step';
}

export function AnimShadowBall_Step(runtime: GhostRuntime, sprite: GhostSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[4] += sprite.data[6];
      sprite.data[5] += sprite.data[7];
      sprite.x = sprite.data[4] >> 4;
      sprite.y = sprite.data[5] >> 4;
      --sprite.data[1];
      if (sprite.data[1] <= 0) ++sprite.data[0];
      break;
    case 1:
      --sprite.data[2];
      if (sprite.data[2] > 0) break;
      sprite.data[1] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
      sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
      sprite.data[4] = sprite.x << 4;
      sprite.data[5] = sprite.y << 4;
      sprite.data[6] = div((sprite.data[1] - sprite.x) << 4, sprite.data[3]);
      sprite.data[7] = div((sprite.data[2] - sprite.y) << 4, sprite.data[3]);
      ++sprite.data[0];
      break;
    case 2:
      sprite.data[4] += sprite.data[6];
      sprite.data[5] += sprite.data[7];
      sprite.x = sprite.data[4] >> 4;
      sprite.y = sprite.data[5] >> 4;
      --sprite.data[3];
      if (sprite.data[3] > 0) break;
      sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
      sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
      ++sprite.data[0];
      break;
    case 3:
      destroySpriteAndMatrix(sprite);
      break;
  }
}

export function AnimLick(runtime: GhostRuntime, sprite: GhostSprite): void {
  initSpritePosToAnimTarget(runtime, sprite);
  sprite.callback = 'AnimLick_Step';
}

export function AnimLick_Step(sprite: GhostSprite): void {
  let r5 = false;
  let r6 = false;
  if (sprite.animEnded) {
    if (!sprite.invisible) sprite.invisible = true;
    switch (sprite.data[0]) {
      default:
        r6 = true;
        break;
      case 0:
        if (sprite.data[1] === 2) r5 = true;
        break;
      case 1:
        if (sprite.data[1] === 4) r5 = true;
        break;
    }
    if (r5) {
      sprite.invisible = !sprite.invisible;
      ++sprite.data[2];
      sprite.data[1] = 0;
      if (sprite.data[2] === 5) {
        sprite.data[2] = 0;
        ++sprite.data[0];
      }
    } else if (r6) {
      destroyAnimSprite(sprite);
    } else {
      ++sprite.data[1];
    }
  }
}

export function AnimTask_NightmareClone(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = cloneBattlerSpriteWithBlend(runtime, ANIM_TARGET);
  if (task.data[0] < 0) {
    destroyAnimVisualTask(runtime, taskId);
    return;
  }
  task.data[1] = 0;
  task.data[2] = 15;
  task.data[3] = 2;
  task.data[4] = 0;
  setGpuReg(runtime, 'BLDCNT', 0x40 | 0x3f00);
  setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[2], task.data[3]));
  runtime.sprites[task.data[0]].data[0] = 80;
  if (getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER) {
    runtime.sprites[task.data[0]].data[1] = -144;
    runtime.sprites[task.data[0]].data[2] = 112;
  } else {
    runtime.sprites[task.data[0]].data[1] = 144;
    runtime.sprites[task.data[0]].data[2] = -112;
  }
  runtime.sprites[task.data[0]].data[3] = 0;
  runtime.sprites[task.data[0]].data[4] = 0;
  storeSpriteCallbackInData6(runtime.sprites[task.data[0]], 'SpriteCallbackDummy');
  runtime.sprites[task.data[0]].callback = 'TranslateSpriteLinearFixedPoint';
  task.func = 'AnimTask_NightmareClone_Step';
}

export function AnimTask_NightmareClone_Step(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[4]) {
    case 0:
      ++task.data[1];
      task.data[5] = task.data[1] & 3;
      if (task.data[5] === 1 && task.data[2] > 0) --task.data[2];
      if (task.data[5] === 3 && task.data[3] <= 15) ++task.data[3];
      setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[2], task.data[3]));
      if (task.data[3] !== 16 || task.data[2] !== 0) break;
      if (task.data[1] <= 80) break;
      destroySpriteWithActiveSheet(runtime, task.data[0]);
      task.data[4] = 1;
      break;
    case 1:
      if (++task.data[6] <= 1) break;
      setGpuReg(runtime, 'BLDCNT', 0);
      setGpuReg(runtime, 'BLDALPHA', 0);
      ++task.data[4];
      break;
    case 2:
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimTask_SpiteTargetShadow(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[15] = 0;
  task.func = 'AnimTask_SpiteTargetShadow_Step1';
  AnimTask_SpiteTargetShadow_Step1(runtime, taskId);
}

export function AnimTask_SpiteTargetShadow_Step1(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const position = getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimTarget);
  switch (task.data[15]) {
    case 0:
      task.data[14] = allocSpritePalette(runtime, 'ANIM_TAG_BENT_SPOON');
      if (task.data[14] === 0xff || task.data[14] === 0xf) destroyAnimVisualTask(runtime, taskId);
      else {
        task.data[0] = cloneBattlerSpriteWithBlend(runtime, 1);
        if (task.data[0] < 0) {
          freeSpritePaletteByTag(runtime, 'ANIM_TAG_BENT_SPOON');
          destroyAnimVisualTask(runtime, taskId);
        } else {
          const clone = runtime.sprites[task.data[0]];
          clone.oam.paletteNum = task.data[14];
          clone.oam.objMode = ST_OAM_OBJ_NORMAL;
          clone.oam.priority = 3;
          clone.invisible = runtime.battlerInvisible[runtime.battleAnimTarget] ?? false;
          task.data[1] = 0;
          task.data[2] = 0;
          task.data[3] = 16;
          task.data[13] = getAnimBattlerSpriteId(runtime, ANIM_TARGET);
          task.data[4] = objPlttId2(runtime.sprites[task.data[13]].oam.paletteNum);
          clearGpuRegBits(runtime, 'DISPCNT', position === 1 ? 0x0200 : 0x0400);
          ++task.data[15];
        }
      }
      break;
    case 1:
      task.data[14] = objPlttId2(task.data[14]);
      runtime.operations.push(`CpuCopy32:${task.data[4]}:${task.data[14]}:PLTT_SIZE_4BPP`);
      blendPalette(runtime, task.data[4], 16, 10, rgb(13, 0, 15));
      ++task.data[15];
      break;
    case 2: {
      let startLine = runtime.sprites[task.data[13]].y + runtime.sprites[task.data[13]].y2 - 32;
      if (startLine < 0) startLine = 0;
      task.data[10] = scanlineEffectInitWave(runtime, startLine, startLine + 64, 2, 6, 0, position === 1 ? 4 : 8, 1);
      ++task.data[15];
      break;
    }
    case 3:
      setGpuReg(runtime, 'BLDCNT', 0x40 | 0x3f00 | (position === 1 ? 0x0002 : 0x0004));
      setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 0x10));
      ++task.data[15];
      break;
    case 4:
      setGpuRegBits(runtime, 'DISPCNT', position === 1 ? 0x0200 : 0x0400);
      task.func = 'AnimTask_SpiteTargetShadow_Step2';
      ++task.data[15];
      break;
    default:
      ++task.data[15];
      break;
  }
}

export function AnimTask_SpiteTargetShadow_Step2(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  ++task.data[1];
  task.data[5] = task.data[1] & 1;
  if (task.data[5] === 0) task.data[2] = div(gSineTable[task.data[1]], 18);
  if (task.data[5] === 1) task.data[3] = 16 - div(gSineTable[task.data[1]], 18);
  setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[2], task.data[3]));
  if (task.data[1] === 128) {
    task.data[15] = 0;
    task.func = 'AnimTask_SpiteTargetShadow_Step3';
    AnimTask_SpiteTargetShadow_Step3(runtime, taskId);
  }
}

export function AnimTask_SpiteTargetShadow_Step3(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const rank = getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimTarget);
  switch (task.data[15]) {
    case 0:
      runtime.scanlineEffectState = 3;
      task.data[14] = getAnimBattlerSpriteId(runtime, ANIM_TARGET);
      clearGpuRegBits(runtime, 'DISPCNT', rank === 1 ? 0x0200 : 0x0400);
      break;
    case 1:
      blendPalette(runtime, task.data[4], 16, 0, rgb(13, 0, 15));
      break;
    case 2:
      runtime.sprites[task.data[14]].invisible = true;
      destroySpriteWithActiveSheet(runtime, task.data[0]);
      freeSpritePaletteByTag(runtime, 'ANIM_TAG_BENT_SPOON');
      setGpuReg(runtime, 'BLDCNT', 0);
      setGpuReg(runtime, 'BLDALPHA', 0);
      setGpuRegBits(runtime, 'DISPCNT', rank === 1 ? 0x0200 : 0x0400);
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
  ++task.data[15];
}

export function AnimDestinyBondWhiteShadow(runtime: GhostRuntime, sprite: GhostSprite): void {
  const attacker = runtime.battleAnimAttacker;
  const target = runtime.battleAnimTarget;
  const from = runtime.battleAnimArgs[0] === 0 ? attacker : target;
  const to = runtime.battleAnimArgs[0] === 0 ? target : attacker;
  const battler1X = getBattlerSpriteCoord(runtime, from, 'x');
  const battler1Y = getBattlerSpriteCoord(runtime, from, 'y') + 28;
  const battler2X = getBattlerSpriteCoord(runtime, to, 'x');
  const battler2Y = getBattlerSpriteCoord(runtime, to, 'y') + 28;
  const yDiff = battler2Y - battler1Y;
  sprite.data[0] = battler1X * 16;
  sprite.data[1] = battler1Y * 16;
  sprite.data[2] = div((battler2X - battler1X) * 16, runtime.battleAnimArgs[1]);
  sprite.data[3] = div(yDiff * 16, runtime.battleAnimArgs[1]);
  sprite.data[4] = runtime.battleAnimArgs[1];
  sprite.data[5] = battler2X;
  sprite.data[6] = battler2Y;
  sprite.data[7] = div(sprite.data[4], 2);
  sprite.oam.priority = 2;
  sprite.x = battler1X;
  sprite.y = battler1Y;
  sprite.callback = 'AnimDestinyBondWhiteShadow_Step';
  sprite.invisible = true;
}

export function AnimDestinyBondWhiteShadow_Step(sprite: GhostSprite): void {
  if (sprite.data[4]) {
    sprite.data[0] += sprite.data[2];
    sprite.data[1] += sprite.data[3];
    sprite.x = sprite.data[0] >> 4;
    sprite.y = sprite.data[1] >> 4;
    if (--sprite.data[4] === 0) sprite.data[0] = 0;
  }
}

export function AnimTask_DestinyBondWhiteShadow(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  setGpuReg(runtime, 'BLDCNT', 0x40 | 0x3f00);
  setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 0x10));
  task.data[5] = 0;
  task.data[6] = 0;
  task.data[7] = 0;
  task.data[8] = 0;
  task.data[9] = 16;
  task.data[10] = runtime.battleAnimArgs[0];
  const baseX = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  const baseY = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'bottom');
  if (!runtime.contest) {
    for (let battler = 0; battler < 4; battler++) {
      if (battler !== runtime.battleAnimAttacker && battler !== (runtime.battleAnimAttacker ^ 2) && isBattlerSpriteVisible(runtime, battler)) {
        const spriteId = createSprite(runtime, gDestinyBondWhiteShadowSpriteTemplate, baseX, baseY, 55);
        if (spriteId !== MAX_SPRITES) {
          const x = getBattlerSpriteCoord(runtime, battler, 'x2');
          const y = getBattlerSpriteCoord(runtime, battler, 'bottom');
          const sprite = runtime.sprites[spriteId];
          sprite.data[0] = baseX << 4;
          sprite.data[1] = baseY << 4;
          sprite.data[2] = div((x - baseX) << 4, runtime.battleAnimArgs[1]);
          sprite.data[3] = div((y - baseY) << 4, runtime.battleAnimArgs[1]);
          sprite.data[4] = runtime.battleAnimArgs[1];
          sprite.data[5] = x;
          sprite.data[6] = y;
          sprite.callback = 'AnimDestinyBondWhiteShadow_Step';
          task.data[task.data[12] + 13] = spriteId;
          ++task.data[12];
        }
      }
    }
  } else {
    const spriteId = createSprite(runtime, gDestinyBondWhiteShadowSpriteTemplate, baseX, baseY, 55);
    if (spriteId !== MAX_SPRITES) {
      const sprite = runtime.sprites[spriteId];
      const x = 48;
      const y = 40;
      sprite.data[0] = baseX << 4;
      sprite.data[1] = baseY << 4;
      sprite.data[2] = div((x - baseX) << 4, runtime.battleAnimArgs[1]);
      sprite.data[3] = div((y - baseY) << 4, runtime.battleAnimArgs[1]);
      sprite.data[4] = runtime.battleAnimArgs[1];
      sprite.data[5] = x;
      sprite.data[6] = y;
      sprite.callback = 'AnimDestinyBondWhiteShadow_Step';
      task.data[13] = spriteId;
      task.data[12] = 1;
    }
  }
  task.func = 'AnimTask_DestinyBondWhiteShadow_Step';
}

export function AnimTask_DestinyBondWhiteShadow_Step(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      if (task.data[6] === 0 && ++task.data[5] > 1) {
        task.data[5] = 0;
        ++task.data[7];
        if (task.data[7] & 1) {
          if (task.data[8] < 16) ++task.data[8];
        } else if (task.data[9]) --task.data[9];
        setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[8], task.data[9]));
        if (task.data[7] >= 24) {
          task.data[7] = 0;
          task.data[6] = 1;
        }
      }
      if (task.data[10]) --task.data[10];
      else if (task.data[6]) ++task.data[0];
      break;
    case 1:
      if (++task.data[5] > 1) {
        task.data[5] = 0;
        ++task.data[7];
        if (task.data[7] & 1) {
          if (task.data[8]) --task.data[8];
        } else if (task.data[9] < 16) ++task.data[9];
        setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[8], task.data[9]));
        if (task.data[8] === 0 && task.data[9] === 16) {
          for (let i = 0; i < task.data[12]; i++) destroySprite(runtime.sprites[task.data[i + 13]]);
          ++task.data[0];
        }
      }
      break;
    case 2:
      if (++task.data[5] > 0) ++task.data[0];
      break;
    case 3:
      setGpuReg(runtime, 'BLDCNT', 0);
      setGpuReg(runtime, 'BLDALPHA', 0);
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimTask_CurseStretchingBlackBg(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  runtime.battleWin0H = 0;
  runtime.battleWin0V = 0;
  setGpuReg(runtime, 'WININ', 0x3f3f);
  setGpuReg(runtime, 'WINOUT', 0x3f3f);
  setGpuReg(runtime, 'BLDCNT', 0x0c00 | 0x80);
  setGpuReg(runtime, 'BLDY', 16);
  const startX = getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER || runtime.contest ? 40 : 200;
  runtime.battleWin0H = winRange(startX, startX);
  const startY = 40;
  runtime.battleWin0V = winRange(startY, startY);
  task.data[1] = startX;
  task.data[2] = DISPLAY_WIDTH - startX;
  task.data[3] = startY;
  task.data[4] = 72;
  task.data[5] = startX;
  task.data[6] = startY;
  task.func = 'AnimTask_CurseStretchingBlackBg_Step1';
}

export function AnimTask_CurseStretchingBlackBg_Step1(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const step = task.data[0]++;
  let left: number;
  let right: number;
  let top: number;
  let bottom: number;
  if (step < 16) {
    left = task.data[5] - task.data[1] * 0.0625 * step;
    right = task.data[5] + task.data[2] * 0.0625 * step;
    top = task.data[6] - task.data[3] * 0.0625 * step;
    bottom = task.data[6] + task.data[4] * 0.0625 * step;
  } else {
    left = 0;
    right = 240;
    top = 0;
    bottom = 112;
    beginNormalPaletteFade(runtime, 'battle-palettes-mask', 0, 16, 16, rgb(0, 0, 0));
    task.func = 'AnimTask_CurseStretchingBlackBg_Step2';
  }
  runtime.battleWin0H = winRange(left, right);
  runtime.battleWin0V = winRange(top, bottom);
}

export function AnimTask_CurseStretchingBlackBg_Step2(runtime: GhostRuntime, taskId: number): void {
  if (!runtime.paletteFadeActive) {
    runtime.battleWin0H = 0;
    runtime.battleWin0V = 0;
    setGpuReg(runtime, 'WININ', 0x3f3f);
    setGpuReg(runtime, 'WINOUT', 0x3f3f);
    setGpuReg(runtime, 'BLDCNT', 0);
    setGpuReg(runtime, 'BLDY', 0);
    destroyAnimVisualTask(runtime, taskId);
  }
}

export function AnimCurseNail(runtime: GhostRuntime, sprite: GhostSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite);
  let xDelta: number;
  let xDelta2: number;
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER) {
    xDelta = 24;
    xDelta2 = -2;
    sprite.oam.matrixNum = ST_OAM_HFLIP;
  } else {
    xDelta = -24;
    xDelta2 = 2;
  }
  sprite.x += xDelta;
  sprite.data[1] = xDelta2;
  sprite.data[0] = 60;
  sprite.callback = 'AnimCurseNail_Step1';
}

export function AnimCurseNail_Step1(sprite: GhostSprite): void {
  if (sprite.data[0] > 0) --sprite.data[0];
  else {
    sprite.x2 += sprite.data[1];
    const var0 = u16(sprite.x2 + 7);
    if (var0 > 14) {
      sprite.x += sprite.x2;
      sprite.x2 = 0;
      sprite.oam.tileNum += 8;
      if (++sprite.data[2] === 3) {
        sprite.data[0] = 30;
        sprite.callback = 'WaitAnimForDuration';
        storeSpriteCallbackInData6(sprite, 'AnimCurseNail_Step2');
      } else {
        sprite.data[0] = 40;
      }
    }
  }
}

export function AnimCurseNail_Step2(runtime: GhostRuntime, sprite: GhostSprite): void {
  if (sprite.data[0] === 0) {
    setGpuReg(runtime, 'BLDCNT', 0x40 | 0x3f00);
    setGpuReg(runtime, 'BLDALPHA', bldalpha(16, 0));
    ++sprite.data[0];
    sprite.data[1] = 0;
    sprite.data[2] = 0;
  } else if (sprite.data[1] < 2) {
    ++sprite.data[1];
  } else {
    sprite.data[1] = 0;
    ++sprite.data[2];
    setGpuReg(runtime, 'BLDALPHA', bldalpha(16 - sprite.data[2], sprite.data[2]));
    if (sprite.data[2] === 16) {
      sprite.invisible = true;
      sprite.callback = 'AnimCurseNail_End';
    }
  }
}

export function AnimCurseNail_End(runtime: GhostRuntime, sprite: GhostSprite): void {
  setGpuReg(runtime, 'BLDCNT', 0);
  setGpuReg(runtime, 'BLDALPHA', 0);
  runtime.battleWin0H = 0;
  runtime.battleWin0V = 0;
  destroyAnimSprite(sprite);
}

export function AnimGhostStatusSprite(runtime: GhostRuntime, sprite: GhostSprite): void {
  let coeffB: number;
  let coeffA: number;
  sprite.x2 = sin(sprite.data[0], 12);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) sprite.x2 = -sprite.x2;
  sprite.data[0] = (sprite.data[0] + 6) & 0xff;
  sprite.data[1] += 0x100;
  sprite.y2 = -(sprite.data[1] >> 8);
  ++sprite.data[7];
  if (sprite.data[7] === 1) {
    sprite.data[6] = 0x050b;
    setGpuReg(runtime, 'BLDCNT', 0x40 | 0x3f00);
    setGpuReg(runtime, 'BLDALPHA', sprite.data[6]);
  } else if (sprite.data[7] > 30) {
    ++sprite.data[2];
    coeffB = sprite.data[6] >> 8;
    coeffA = sprite.data[6] & 0xff;
    if (++coeffB > 16) coeffB = 16;
    --coeffA;
    if (coeffA < 0) coeffA = 0;
    setGpuReg(runtime, 'BLDALPHA', bldalpha(coeffA, coeffB));
    sprite.data[6] = bldalpha(coeffA, coeffB);
    if (coeffB === 16 && coeffA === 0) {
      sprite.invisible = true;
      sprite.callback = 'AnimGhostStatusSprite_End';
    }
  }
}

export function AnimGhostStatusSprite_End(runtime: GhostRuntime, sprite: GhostSprite): void {
  setGpuReg(runtime, 'BLDCNT', 0);
  setGpuReg(runtime, 'BLDALPHA', 0);
  destroyAnimSprite(sprite);
}

export function AnimTask_GrudgeFlames(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = 0;
  task.data[1] = 16;
  task.data[9] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  task.data[10] = getBattlerYCoordWithElevation(runtime, runtime.battleAnimAttacker);
  task.data[11] = div(getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'width'), 2) + 8;
  task.data[7] = 0;
  task.data[5] = getBattlerSpriteBgPriority(runtime, runtime.battleAnimAttacker);
  task.data[6] = getBattlerSpriteSubpriority(runtime, runtime.battleAnimAttacker) - 2;
  task.data[3] = 0;
  task.data[4] = 16;
  setGpuReg(runtime, 'BLDCNT', 0x40 | 0x3f00);
  setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 0x10));
  task.data[8] = 0;
  task.func = 'AnimTask_GrudgeFlames_Step';
}

export function AnimTask_GrudgeFlames_Step(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      for (let i = 0; i < 6; ++i) {
        const spriteId = createSprite(runtime, gGrudgeFlameSpriteTemplate, task.data[9], task.data[10], task.data[6]);
        if (spriteId !== MAX_SPRITES) {
          const sprite = runtime.sprites[spriteId];
          sprite.data[0] = taskId;
          sprite.data[1] = getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER ? 1 : 0;
          sprite.data[2] = (i * 42) & 0xff;
          sprite.data[3] = task.data[11];
          sprite.data[5] = i * 6;
          ++task.data[7];
        }
      }
      ++task.data[0];
      break;
    case 1:
      if (++task.data[1] & 1) {
        if (task.data[3] < 14) ++task.data[3];
      } else if (task.data[4] > 4) --task.data[4];
      if (task.data[3] === 14 && task.data[4] === 4) {
        task.data[1] = 0;
        ++task.data[0];
      }
      setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[3], task.data[4]));
      break;
    case 2:
      if (++task.data[1] > 30) {
        task.data[1] = 0;
        ++task.data[0];
      }
      break;
    case 3:
      if (++task.data[1] & 1) {
        if (task.data[3] > 0) --task.data[3];
      } else if (task.data[4] < 16) ++task.data[4];
      if (task.data[3] === 0 && task.data[4] === 16) {
        task.data[8] = 1;
        ++task.data[0];
      }
      setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[3], task.data[4]));
      break;
    case 4:
      if (task.data[7] === 0) ++task.data[0];
      break;
    case 5:
      setGpuReg(runtime, 'BLDCNT', 0);
      setGpuReg(runtime, 'BLDALPHA', 0);
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimGrudgeFlame(runtime: GhostRuntime, sprite: GhostSprite): void {
  if (sprite.data[1] === 0) sprite.data[2] += 2;
  else sprite.data[2] -= 2;
  sprite.data[2] &= 0xff;
  sprite.x2 = sin(sprite.data[2], sprite.data[3]);
  const index = u16(sprite.data[2] - 65);
  const task = runtime.tasks[sprite.data[0]]!;
  sprite.oam.priority = index < 127 ? task.data[5] + 1 : task.data[5];
  ++sprite.data[5];
  sprite.data[6] = (sprite.data[5] * 8) & 0xff;
  sprite.y2 = sin(sprite.data[6], 7);
  if (task.data[8]) {
    --task.data[7];
    destroySprite(sprite);
  }
}

export function AnimTask_GhostGetOut(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[15] = 0;
  task.func = 'AnimTask_GhostGetOut_Step1';
  AnimTask_GhostGetOut_Step1(runtime, taskId);
}

export function AnimTask_GhostGetOut_Step1(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const rank = getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimAttacker);
  switch (task.data[15]) {
    case 0:
      setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 2);
      setAnimBgAttribute(runtime, 2, 'BG_ANIM_PRIORITY', 1);
      task.data[1] = 0;
      task.data[2] = 0;
      task.data[3] = 16;
      task.data[4] = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
      task.data[5] = runtime.sprites[task.data[4]].oam.priority;
      task.data[6] = objPlttId2(runtime.sprites[task.data[4]].oam.paletteNum);
      runtime.sprites[task.data[4]].oam.objMode = ST_OAM_OBJ_BLEND;
      runtime.sprites[task.data[4]].oam.priority = 3;
      task.data[7] = bgPlttId(8);
      break;
    case 1:
      ++task.data[1];
      if (task.data[1] & 1) return;
      blendPalette(runtime, task.data[6], 0x10, task.data[2], rgb(0, 23, 25));
      blendPalette(runtime, task.data[7], 0x10, task.data[2], rgb(0, 23, 25));
      if (task.data[2] <= 11) {
        ++task.data[2];
        return;
      }
      task.data[1] = 0;
      task.data[2] = 0;
      setGpuReg(runtime, 'BLDCNT', 0x0004 | 0x40 | 0x3f00);
      setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 0x10));
      break;
    case 2:
      setAnimBgAttribute(runtime, 2, 'BG_ANIM_CHAR_BASE_BLOCK', 1);
      setAnimBgAttribute(runtime, 2, 'BG_ANIM_SCREEN_SIZE', 0);
      setGpuReg(runtime, 'BG2HOFS', 0);
      setGpuReg(runtime, 'BG2VOFS', 0);
      runtime.operations.push('LoadScaryFaceGfx');
      break;
    case 3:
      runtime.operations.push('LoadScaryFaceTilemapPlayer');
      break;
    case 4:
      ++task.data[1];
      if (task.data[1] & 1) return;
      ++task.data[2];
      --task.data[3];
      setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[2], task.data[3]));
      if (task.data[3]) return;
      task.data[1] = 0;
      task.data[2] = 0;
      task.data[3] = 16;
      setGpuReg(runtime, 'BLDCNT', 0x0002 | 0x40 | 0x3f00);
      setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 0x10));
      setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 1);
      setAnimBgAttribute(runtime, 2, 'BG_ANIM_PRIORITY', 2);
      break;
    case 5:
      clearGpuRegBits(runtime, 'DISPCNT', rank === 1 ? 0x0200 : 0x0400);
      break;
    case 6: {
      let y = runtime.sprites[task.data[4]].y + runtime.sprites[task.data[4]].y2 - 0x20;
      if (y < 0) y = 0;
      task.data[10] = scanlineEffectInitWave(runtime, y, y + 0x40, 4, 8, 0, rank === 1 ? 4 : 8, 1);
      break;
    }
    case 7:
      blendPalette(runtime, task.data[7], 0x10, 0x0c, rgb(31, 31, 29));
      setGpuRegBits(runtime, 'DISPCNT', rank === 1 ? 0x0200 : 0x0400);
      task.func = 'AnimTask_GhostGetOut_Step2';
      task.data[15] = 0;
      break;
  }
  ++task.data[15];
}

export function AnimTask_GhostGetOut_Step2(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  ++task.data[1];
  task.data[8] = task.data[1] & 1;
  if (!task.data[8]) task.data[2] = div(gSineTable[task.data[1]], 18);
  if (task.data[8] === 1) task.data[3] = 16 - div(gSineTable[task.data[1]], 18);
  setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[2], task.data[3]));
  if (task.data[1] === 128) {
    task.data[15] = 0;
    task.func = 'AnimTask_GhostGetOut_Step3';
    AnimTask_GhostGetOut_Step3(runtime, taskId);
  }
}

export function AnimTask_GhostGetOut_Step3(runtime: GhostRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[15]) {
    case 0:
      runtime.scanlineEffectState = 3;
      blendPalette(runtime, task.data[7], 0x10, 0x0c, rgb(0, 23, 25));
      break;
    case 1:
      setGpuReg(runtime, 'BLDCNT', 0x0004 | 0x40 | 0x3f00);
      setGpuReg(runtime, 'BLDALPHA', bldalpha(0x10, 0));
      task.data[2] = 16;
      task.data[3] = 0;
      break;
    case 2:
      --task.data[2];
      ++task.data[3];
      setGpuReg(runtime, 'BLDALPHA', bldalpha(task.data[2], task.data[3]));
      if (task.data[3] <= 15) return;
      setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 2);
      setAnimBgAttribute(runtime, 2, 'BG_ANIM_PRIORITY', 2);
      break;
    case 3:
      initBattleAnimBg(runtime, 2);
      fillPalette(runtime, rgb(0, 0, 0), bgPlttId(9), 'PLTT_SIZE_4BPP');
      setAnimBgAttribute(runtime, 2, 'BG_ANIM_CHAR_BASE_BLOCK', 0);
      task.data[1] = 12;
      break;
    case 4:
      blendPalette(runtime, task.data[6], 0x10, task.data[1], rgb(0, 23, 25));
      blendPalette(runtime, task.data[7], 0x10, task.data[1], rgb(0, 23, 25));
      if (task.data[1]) {
        --task.data[1];
        return;
      }
      task.data[1] = 0;
      setGpuReg(runtime, 'BLDCNT', 0x0004 | 0x40 | 0x3f00);
      setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 0x10));
      break;
    case 5:
      runtime.sprites[task.data[4]].oam.priority = task.data[5];
      runtime.sprites[task.data[4]].oam.objMode = ST_OAM_OBJ_NORMAL;
      setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 1);
      setAnimBgAttribute(runtime, 2, 'BG_ANIM_PRIORITY', 1);
      setGpuReg(runtime, 'BLDCNT', 0);
      setGpuReg(runtime, 'BLDALPHA', 0);
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
  ++task.data[15];
}

export function AnimMonMoveCircular(runtime: GhostRuntime, sprite: GhostSprite): void {
  sprite.invisible = true;
  sprite.data[5] = runtime.battlerSpriteIds[runtime.battleAnimAttacker];
  sprite.data[0] = 128;
  sprite.data[1] = 10;
  sprite.data[2] = runtime.battleAnimArgs[0];
  sprite.data[3] = runtime.battleAnimArgs[1];
  sprite.callback = 'AnimMonMoveCircular_Step';
  runtime.sprites[sprite.data[5]].y += 8;
}

export function AnimMonMoveCircular_Step(runtime: GhostRuntime, sprite: GhostSprite): void {
  const target = runtime.sprites[sprite.data[5]];
  if (sprite.data[3]) {
    --sprite.data[3];
    target.x2 = sin(sprite.data[0], sprite.data[1]);
    target.y2 = cos(sprite.data[0], sprite.data[1]);
    sprite.data[0] += sprite.data[2];
    if (sprite.data[0] > 255) sprite.data[0] -= 256;
  } else {
    target.x2 = 0;
    target.y2 = 0;
    target.y -= 8;
    sprite.callback = 'DestroySpriteAndMatrix';
  }
}

export const animConfuseRayBallBounce = AnimConfuseRayBallBounce;
export const animConfuseRayBallBounceStep1 = AnimConfuseRayBallBounce_Step1;
export const animConfuseRayBallBounceStep2 = AnimConfuseRayBallBounce_Step2;
export const updateConfuseRayBallBlend = UpdateConfuseRayBallBlend;
export const animConfuseRayBallSpiral = AnimConfuseRayBallSpiral;
export const animConfuseRayBallSpiralStep = AnimConfuseRayBallSpiral_Step;
export const animTaskNightShadeClone = AnimTask_NightShadeClone;
export const animTaskNightShadeCloneStep1 = AnimTask_NightShadeClone_Step1;
export const animTaskNightShadeCloneStep2 = AnimTask_NightShadeClone_Step2;
export const animShadowBall = AnimShadowBall;
export const animShadowBallStep = AnimShadowBall_Step;
export const animLick = AnimLick;
export const animLickStep = AnimLick_Step;
export const animTaskNightmareClone = AnimTask_NightmareClone;
export const animTaskNightmareCloneStep = AnimTask_NightmareClone_Step;
export const animTaskSpiteTargetShadow = AnimTask_SpiteTargetShadow;
export const animTaskSpiteTargetShadowStep1 = AnimTask_SpiteTargetShadow_Step1;
export const animTaskSpiteTargetShadowStep2 = AnimTask_SpiteTargetShadow_Step2;
export const animTaskSpiteTargetShadowStep3 = AnimTask_SpiteTargetShadow_Step3;
export const animDestinyBondWhiteShadow = AnimDestinyBondWhiteShadow;
export const animDestinyBondWhiteShadowStep = AnimDestinyBondWhiteShadow_Step;
export const animTaskDestinyBondWhiteShadow = AnimTask_DestinyBondWhiteShadow;
export const animTaskDestinyBondWhiteShadowStep = AnimTask_DestinyBondWhiteShadow_Step;
export const animTaskCurseStretchingBlackBg = AnimTask_CurseStretchingBlackBg;
export const animTaskCurseStretchingBlackBgStep1 = AnimTask_CurseStretchingBlackBg_Step1;
export const animTaskCurseStretchingBlackBgStep2 = AnimTask_CurseStretchingBlackBg_Step2;
export const animCurseNail = AnimCurseNail;
export const animCurseNailStep1 = AnimCurseNail_Step1;
export const animCurseNailStep2 = AnimCurseNail_Step2;
export const animCurseNailEnd = AnimCurseNail_End;
export const animGhostStatusSprite = AnimGhostStatusSprite;
export const animGhostStatusSpriteEnd = AnimGhostStatusSprite_End;
export const animTaskGrudgeFlames = AnimTask_GrudgeFlames;
export const animTaskGrudgeFlamesStep = AnimTask_GrudgeFlames_Step;
export const animGrudgeFlame = AnimGrudgeFlame;
export const animTaskGhostGetOut = AnimTask_GhostGetOut;
export const animTaskGhostGetOutStep1 = AnimTask_GhostGetOut_Step1;
export const animTaskGhostGetOutStep2 = AnimTask_GhostGetOut_Step2;
export const animTaskGhostGetOutStep3 = AnimTask_GhostGetOut_Step3;
export const animMonMoveCircular = AnimMonMoveCircular;
export const animMonMoveCircularStep = AnimMonMoveCircular_Step;

const div = (a: number, b: number): number => Math.trunc(a / b);
const u16 = (value: number): number => value & 0xffff;
const rgb = (r: number, g: number, b: number): number => r | (g << 5) | (b << 10);
const bldalpha = (a: number, b: number): number => (a & 0x1f) | ((b & 0x1f) << 8);
const winRange = (a: number, b: number): number => (Math.trunc(a) << 8) | Math.trunc(b);
const objPlttId2 = (paletteNum: number): number => 0x100 + paletteNum * 16;
const bgPlttId = (paletteNum: number): number => paletteNum * 16;

const getBattlerSide = (runtime: GhostRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const getBattlerSpriteCoord = (runtime: GhostRuntime, battler: number, key: keyof GhostRuntime['battlerCoords'][number]): number => runtime.battlerCoords[battler][key];
const getAnimBattlerSpriteId = (runtime: GhostRuntime, battlerKind: number): number => runtime.battlerSpriteIds[battlerKind === ANIM_ATTACKER ? runtime.battleAnimAttacker : runtime.battleAnimTarget] ?? 0;
const getBattlerSpriteBgPriority = (runtime: GhostRuntime, battler: number): number => runtime.battlerBgPriority[battler] ?? 0;
const getBattlerSpriteBgPriorityRank = (runtime: GhostRuntime, battler: number): number => runtime.battlerBgPriorityRank[battler] ?? 1;
const getBattlerSpriteSubpriority = (runtime: GhostRuntime, battler: number): number => runtime.battlerSubpriority[battler] ?? 0;
const getBattlerYCoordWithElevation = (runtime: GhostRuntime, battler: number): number => getBattlerSpriteCoord(runtime, battler, 'yPicOffset');
const isBattlerSpriteVisible = (runtime: GhostRuntime, battler: number): boolean => runtime.battlerVisible[battler] ?? false;

const initSpritePosToAnimAttacker = (runtime: GhostRuntime, sprite: GhostSprite): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset') + runtime.battleAnimArgs[1];
};
const initSpritePosToAnimTarget = (runtime: GhostRuntime, sprite: GhostSprite): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[1];
};
const initAnimLinearTranslationWithSpeed = (sprite: GhostSprite): void => {
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
const animTranslateLinear = (sprite: GhostSprite): boolean => {
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
const storeSpriteCallbackInData6 = (sprite: GhostSprite, callback: GhostCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const destroyAnimSprite = (sprite: GhostSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const destroySprite = (sprite: GhostSprite): void => {
  sprite.destroyed = true;
};
const destroySpriteAndMatrix = (sprite: GhostSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroySpriteAndMatrix';
  sprite.rotScale = null;
};
const destroyAnimVisualTask = (runtime: GhostRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};
const setGpuReg = (runtime: GhostRuntime, reg: string, value: number): void => {
  runtime.registers[reg] = value;
  runtime.operations.push(`SetGpuReg:${reg}:${value}`);
};
const setGpuRegBits = (runtime: GhostRuntime, reg: string, mask: number): void => {
  runtime.registers[reg] = (runtime.registers[reg] ?? 0) | mask;
  runtime.operations.push(`SetGpuRegBits:${reg}:${mask}`);
};
const clearGpuRegBits = (runtime: GhostRuntime, reg: string, mask: number): void => {
  runtime.registers[reg] = (runtime.registers[reg] ?? 0) & ~mask;
  runtime.operations.push(`ClearGpuRegBits:${reg}:${mask}`);
};
const setSpriteRotScale = (sprite: GhostSprite, xScale: number, yScale: number, rotation: number): void => {
  sprite.rotScale = { xScale, yScale, rotation };
};
const resetSpriteRotScale = (sprite: GhostSprite): void => {
  sprite.rotScale = null;
};
const prepareBattlerSpriteForRotScale = (runtime: GhostRuntime, spriteId: number, objMode: number): void => {
  runtime.sprites[spriteId].oam.objMode = objMode;
  runtime.operations.push(`PrepareBattlerSpriteForRotScale:${spriteId}:${objMode}`);
};
const createSprite = (runtime: GhostRuntime, spriteTemplate: GhostTemplate, x: number, y: number, subpriority: number): number => {
  const id = runtime.sprites.findIndex((sprite, index) => index >= 4 && (sprite.destroyed || (sprite.callback === 'SpriteCallbackDummy' && sprite.x === 0 && sprite.y === 0)));
  const spriteId = id === -1 ? runtime.sprites.length : id;
  if (spriteId >= MAX_SPRITES) return MAX_SPRITES;
  const sprite = createGhostSprite();
  sprite.x = x;
  sprite.y = y;
  sprite.subpriority = subpriority;
  sprite.callback = spriteTemplate.callback;
  runtime.sprites[spriteId] = sprite;
  runtime.operations.push(`CreateSprite:${spriteTemplate.callback}:${x}:${y}:${subpriority}`);
  return spriteId;
};
const cloneBattlerSpriteWithBlend = (runtime: GhostRuntime, battlerKind: number): number => {
  const source = getAnimBattlerSpriteId(runtime, battlerKind);
  const spriteId = createSprite(runtime, { ...gDestinyBondWhiteShadowSpriteTemplate, callback: 'SpriteCallbackDummy' }, runtime.sprites[source].x, runtime.sprites[source].y, runtime.sprites[source].subpriority);
  runtime.operations.push(`CloneBattlerSpriteWithBlend:${battlerKind}:${spriteId}`);
  return spriteId === MAX_SPRITES ? -1 : spriteId;
};
const destroySpriteWithActiveSheet = (runtime: GhostRuntime, spriteId: number): void => {
  destroySprite(runtime.sprites[spriteId]);
  runtime.operations.push(`DestroySpriteWithActiveSheet:${spriteId}`);
};
const allocSpritePalette = (runtime: GhostRuntime, tag: string): number => {
  runtime.operations.push(`AllocSpritePalette:${tag}`);
  return runtime.nextPalette++;
};
const freeSpritePaletteByTag = (runtime: GhostRuntime, tag: string): void => {
  runtime.operations.push(`FreeSpritePaletteByTag:${tag}`);
};
const blendPalette = (runtime: GhostRuntime, offset: number, size: number, coeff: number, color: number): void => {
  runtime.operations.push(`BlendPalette:${offset}:${size}:${coeff}:${color}`);
};
const scanlineEffectInitWave = (runtime: GhostRuntime, start: number, end: number, a: number, b: number, c: number, d: number, e: number): number => {
  runtime.operations.push(`ScanlineEffect_InitWave:${start}:${end}:${a}:${b}:${c}:${d}:${e}`);
  return runtime.operations.length;
};
const beginNormalPaletteFade = (runtime: GhostRuntime, selectedPalettes: string, delay: number, start: number, end: number, color: number): void => {
  runtime.paletteFadeActive = true;
  runtime.operations.push(`BeginNormalPaletteFade:${selectedPalettes}:${delay}:${start}:${end}:${color}`);
};
const setAnimBgAttribute = (runtime: GhostRuntime, bg: number, attr: string, value: number): void => {
  runtime.operations.push(`SetAnimBgAttribute:${bg}:${attr}:${value}`);
};
const initBattleAnimBg = (runtime: GhostRuntime, bg: number): void => {
  runtime.operations.push(`InitBattleAnimBg:${bg}`);
};
const fillPalette = (runtime: GhostRuntime, color: number, offset: number, size: string): void => {
  runtime.operations.push(`FillPalette:${color}:${offset}:${size}`);
};
const playSe = (runtime: GhostRuntime, song: string): void => {
  runtime.operations.push(`PlaySE:${song}`);
};
const playSe12WithPanning = (runtime: GhostRuntime, song: string, panning: number): void => {
  runtime.operations.push(`PlaySE12WithPanning:${song}:${panning}`);
};
