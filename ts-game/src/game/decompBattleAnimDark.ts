import { sin } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_OPPONENT_RIGHT = 3;
export const BIT_FLANK = 2;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const ANIM_ATK_PARTNER = 2;
export const ANIM_DEF_PARTNER = 3;
export const MAX_BATTLERS_COUNT = 4;
export const SPRITE_NONE = 0xff;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const ARG_RET_ID = 15;
export const DISPCNT_OBJWIN_ON = 0x1000;

export type DarkCallback =
  | 'AnimUnusedBagSteal'
  | 'AnimUnusedBagSteal_Step'
  | 'AnimBite'
  | 'AnimBite_Step1'
  | 'AnimBite_Step2'
  | 'AnimTearDrop'
  | 'AnimTearDrop_Step'
  | 'AnimClawSlash'
  | 'RunStoredCallbackWhenAnimEnds'
  | 'TranslateAnimHorizontalArc'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix';

export type DarkTaskFunc =
  | 'AnimTask_AttackerFadeToInvisible_Step'
  | 'AnimTask_AttackerFadeFromInvisible_Step'
  | 'AnimTask_MoveAttackerMementoShadow_Step'
  | 'AnimTask_MoveTargetMementoShadow'
  | 'AnimTask_MoveTargetMementoShadow_Step'
  | 'AnimTask_MetallicShine_Step'
  | 'DestroyAnimVisualTask';

export interface DarkSpriteTemplate {
  tileTag: string | number;
  paletteTag: string | number;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: DarkCallback;
}

export interface DarkSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: DarkCallback;
  storedCallback: DarkCallback | null;
  destroyed: boolean;
  invisible: boolean;
  animIndex: number;
  affineAnimIndex: number;
  oam: { tileNum: number; matrixNum: number; priority: number; paletteNum: number };
  templateName: string | null;
}

export interface DarkTask {
  data: number[];
  func: DarkTaskFunc;
  destroyed: boolean;
}

export interface DarkRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  animMoveTurn: number;
  contest: boolean;
  doubleBattle: boolean;
  battlersCount: number;
  battlerPartyIndexes: Record<number, number>;
  battlerSpriteIds: Record<number, number>;
  battlerSides: Record<number, number>;
  battlerPositions: Record<number, number>;
  battlerAtPosition: Record<number, number>;
  battlerVisible: Record<number, boolean>;
  battlerBgPriorityRanks: Record<number, number>;
  battlerCoords: Record<number, { x: number; x2: number; y: number; yPicOffset: number; top: number; right: number; left: number }>;
  playerPartySpecies: Record<number, number>;
  enemyPartySpecies: Record<number, number>;
  sprites: DarkSprite[];
  tasks: Array<DarkTask | null>;
  paletteFadeActive: boolean;
  gpuRegs: Record<string, number>;
  bgAttrs: Record<string, number>;
  scanlineEffect: { state: number; srcBuffer: 0 | 1; params: unknown };
  scanlineEffectRegBuffers: [number[], number[]];
  battleBg1X: number;
  battleBg1Y: number;
  battleBg2X: number;
  battleBg2Y: number;
  battleWin0H: number;
  battleWin0V: number;
  animBg1Data: { bgId: number; tilesOffset: number; paletteId: number };
  spritePaletteTagIndexes: Record<number, number>;
  operations: string[];
  paletteFades: Array<{ palettes: number; delay: number; start: number; end: number; color: number }>;
  paletteBlends: Array<{ palettes: number; amount: number; color: number }>;
}

export const gAffineAnimsBite = [0, 32, 64, 96, -128, -96, -64, -32].map((rotation) => [
  { xScale: 0, yScale: 0, rotation, duration: 1 },
  { end: true }
]);
export const sAffineAnimsTearDrop = [
  [{ xScale: 0xc0, yScale: 0xc0, rotation: 80, duration: 0 }, { xScale: 0, yScale: 0, rotation: -2, duration: 8 }, { end: true }],
  [{ xScale: 0xc0, yScale: 0xc0, rotation: -80, duration: 0 }, { xScale: 0, yScale: 0, rotation: 2, duration: 8 }, { end: true }]
] as const;
export const sAnimsClawSlash = [
  [0, 16, 32, 48, 64].map((frame) => ({ frame, duration: 4 })),
  [0, 16, 32, 48, 64].map((frame) => ({ frame, duration: 4, hFlip: true }))
] as const;

export const sUnusedBagStealSpriteTemplate: DarkSpriteTemplate = {
  tileTag: 'ANIM_TAG_TIED_BAG',
  paletteTag: 'ANIM_TAG_TIED_BAG',
  oam: 'gOamData_AffineOff_ObjNormal_16x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimUnusedBagSteal'
};
export const gSharpTeethSpriteTemplate: DarkSpriteTemplate = {
  tileTag: 'ANIM_TAG_SHARP_TEETH',
  paletteTag: 'ANIM_TAG_SHARP_TEETH',
  oam: 'gOamData_AffineNormal_ObjBlend_64x64',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: gAffineAnimsBite,
  callback: 'AnimBite'
};
export const gClampJawSpriteTemplate: DarkSpriteTemplate = {
  ...gSharpTeethSpriteTemplate,
  tileTag: 'ANIM_TAG_CLAMP',
  paletteTag: 'ANIM_TAG_CLAMP'
};
export const gTearDropSpriteTemplate: DarkSpriteTemplate = {
  tileTag: 'ANIM_TAG_SMALL_BUBBLES',
  paletteTag: 'ANIM_TAG_SMALL_BUBBLES',
  oam: 'gOamData_AffineNormal_ObjNormal_16x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: sAffineAnimsTearDrop,
  callback: 'AnimTearDrop'
};
export const gClawSlashSpriteTemplate: DarkSpriteTemplate = {
  tileTag: 'ANIM_TAG_CLAW_SLASH',
  paletteTag: 'ANIM_TAG_CLAW_SLASH',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: sAnimsClawSlash,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimClawSlash'
};

export const createDarkSprite = (): DarkSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 16 }, () => 0),
  callback: 'AnimBite',
  storedCallback: null,
  destroyed: false,
  invisible: false,
  animIndex: 0,
  affineAnimIndex: 0,
  oam: { tileNum: 0, matrixNum: 0, priority: 0, paletteNum: 0 },
  templateName: null
});

export const createDarkRuntime = (overrides: Partial<DarkRuntime> = {}): DarkRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  animMoveTurn: overrides.animMoveTurn ?? 0,
  contest: overrides.contest ?? false,
  doubleBattle: overrides.doubleBattle ?? false,
  battlersCount: overrides.battlersCount ?? 4,
  battlerPartyIndexes: overrides.battlerPartyIndexes ?? { 0: 0, 1: 0, 2: 1, 3: 1 },
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerPositions: overrides.battlerPositions ?? {
    0: B_POSITION_PLAYER_LEFT,
    1: B_POSITION_OPPONENT_LEFT,
    2: B_POSITION_PLAYER_RIGHT,
    3: B_POSITION_OPPONENT_RIGHT
  },
  battlerAtPosition: overrides.battlerAtPosition ?? {
    [B_POSITION_PLAYER_LEFT]: 0,
    [B_POSITION_OPPONENT_LEFT]: 1,
    [B_POSITION_PLAYER_RIGHT]: 2,
    [B_POSITION_OPPONENT_RIGHT]: 3
  },
  battlerVisible: overrides.battlerVisible ?? { 0: true, 1: true, 2: true, 3: true },
  battlerBgPriorityRanks: overrides.battlerBgPriorityRanks ?? { 0: 1, 1: 2, 2: 1, 3: 2 },
  battlerCoords: overrides.battlerCoords ?? {
    0: { x: 32, x2: 48, y: 72, yPicOffset: 64, top: 40, right: 64, left: 0 },
    1: { x: 160, x2: 176, y: 80, yPicOffset: 72, top: 48, right: 196, left: 124 },
    2: { x: 72, x2: 88, y: 92, yPicOffset: 88, top: 58, right: 104, left: 40 },
    3: { x: 200, x2: 216, y: 88, yPicOffset: 86, top: 54, right: 232, left: 168 }
  },
  playerPartySpecies: overrides.playerPartySpecies ?? { 0: 1, 1: 2 },
  enemyPartySpecies: overrides.enemyPartySpecies ?? { 0: 10, 1: 11 },
  sprites: overrides.sprites ?? Array.from({ length: 64 }, () => createDarkSprite()),
  tasks: overrides.tasks ?? [],
  paletteFadeActive: overrides.paletteFadeActive ?? false,
  gpuRegs: overrides.gpuRegs ?? {},
  bgAttrs: overrides.bgAttrs ?? {},
  scanlineEffect: overrides.scanlineEffect ?? { state: 0, srcBuffer: 0, params: null },
  scanlineEffectRegBuffers: overrides.scanlineEffectRegBuffers ?? [Array.from({ length: 160 }, () => 0), Array.from({ length: 160 }, () => 0)],
  battleBg1X: overrides.battleBg1X ?? 0,
  battleBg1Y: overrides.battleBg1Y ?? 0,
  battleBg2X: overrides.battleBg2X ?? 0,
  battleBg2Y: overrides.battleBg2Y ?? 0,
  battleWin0H: overrides.battleWin0H ?? 0,
  battleWin0V: overrides.battleWin0V ?? 0,
  animBg1Data: overrides.animBg1Data ?? { bgId: 1, tilesOffset: 128, paletteId: 3 },
  spritePaletteTagIndexes: overrides.spritePaletteTagIndexes ?? {},
  operations: overrides.operations ?? [],
  paletteFades: overrides.paletteFades ?? [],
  paletteBlends: overrides.paletteBlends ?? []
});

export const createDarkTask = (runtime: DarkRuntime, func: DarkTaskFunc = 'DestroyAnimVisualTask'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), func, destroyed: false });
  return id;
};

export function AnimTask_AttackerFadeToInvisible(runtime: DarkRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[0];
  task.data[1] = 16;
  setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', blendAlpha(16, 0));
  if (getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimAttacker) === 1)
    setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0x3f42);
  else
    setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0x3f44);
  task.func = 'AnimTask_AttackerFadeToInvisible_Step';
}

export function AnimTask_AttackerFadeToInvisible_Step(runtime: DarkRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  let blendA = task.data[1] >> 8;
  let blendB = task.data[1] & 0xff;
  if (task.data[2] === (task.data[0] & 0xff)) {
    ++blendA;
    --blendB;
    task.data[1] = blendAlpha(blendB, blendA);
    setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', task.data[1]);
    task.data[2] = 0;
    if (blendA === 16) {
      runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimAttacker]].invisible = true;
      destroyAnimVisualTask(runtime, taskId);
    }
  } else {
    ++task.data[2];
  }
}

export function AnimTask_AttackerFadeFromInvisible(runtime: DarkRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[0];
  task.data[1] = blendAlpha(0, 16);
  task.func = 'AnimTask_AttackerFadeFromInvisible_Step';
  setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', task.data[1]);
}

export function AnimTask_AttackerFadeFromInvisible_Step(runtime: DarkRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  let blendA = task.data[1] >> 8;
  let blendB = task.data[1] & 0xff;
  if (task.data[2] === (task.data[0] & 0xff)) {
    --blendA;
    ++blendB;
    task.data[1] = (blendA << 8) | blendB;
    setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', task.data[1]);
    task.data[2] = 0;
    if (blendA === 0) {
      setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0);
      setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', 0);
      destroyAnimVisualTask(runtime, taskId);
    }
  } else {
    ++task.data[2];
  }
}

export function AnimTask_InitAttackerFadeFromInvisible(runtime: DarkRuntime, taskId: number): void {
  setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', blendAlpha(0, 16));
  if (getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimAttacker) === 1)
    setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0x3f42);
  else
    setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0x3f44);
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimUnusedBagSteal(runtime: DarkRuntime, sprite: DarkSprite): void {
  sprite.data[1] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  sprite.data[3] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  sprite.data[0] = 0x7e;
  initSpriteDataForLinearTranslation(sprite);
  sprite.data[3] = -sprite.data[1];
  sprite.data[4] = -sprite.data[2];
  sprite.data[6] = -40;
  sprite.callback = 'AnimUnusedBagSteal_Step';
  AnimUnusedBagSteal_Step(sprite);
}

export function AnimUnusedBagSteal_Step(sprite: DarkSprite): void {
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  sprite.x2 = sprite.data[3] >> 8;
  sprite.y2 = sprite.data[4] >> 8;
  if (sprite.data[7] === 0) {
    sprite.data[3] += sprite.data[1];
    sprite.data[4] += sprite.data[2];
    sprite.x2 = sprite.data[3] >> 8;
    sprite.y2 = sprite.data[4] >> 8;
    --sprite.data[0];
  }
  sprite.y2 += sin(sprite.data[5], sprite.data[6]);
  sprite.data[5] = (sprite.data[5] + 3) & 0xff;
  if (sprite.data[5] > 0x7f) {
    sprite.data[5] = 0;
    sprite.data[6] += 20;
    ++sprite.data[7];
  }
  if (--sprite.data[0] === 0) destroyAnimSprite(sprite);
}

export function AnimBite(runtime: DarkRuntime, sprite: DarkSprite): void {
  sprite.x += runtime.battleAnimArgs[0];
  sprite.y += runtime.battleAnimArgs[1];
  startSpriteAffineAnim(sprite, runtime.battleAnimArgs[2]);
  sprite.data[0] = runtime.battleAnimArgs[3];
  sprite.data[1] = runtime.battleAnimArgs[4];
  sprite.data[2] = runtime.battleAnimArgs[5];
  sprite.callback = 'AnimBite_Step1';
}

export function AnimBite_Step1(sprite: DarkSprite): void {
  sprite.data[4] += sprite.data[0];
  sprite.data[5] += sprite.data[1];
  sprite.x2 = sprite.data[4] >> 8;
  sprite.y2 = sprite.data[5] >> 8;
  if (++sprite.data[3] === sprite.data[2]) sprite.callback = 'AnimBite_Step2';
}

export function AnimBite_Step2(sprite: DarkSprite): void {
  sprite.data[4] -= sprite.data[0];
  sprite.data[5] -= sprite.data[1];
  sprite.x2 = sprite.data[4] >> 8;
  sprite.y2 = sprite.data[5] >> 8;
  if (--sprite.data[3] === 0) destroySpriteAndMatrix(sprite);
}

export function AnimTearDrop(runtime: DarkRuntime, sprite: DarkSprite): void {
  const battler = runtime.battleAnimArgs[0] === ANIM_ATTACKER ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  let xOffset = 20;
  sprite.oam.tileNum += 4;
  switch (runtime.battleAnimArgs[1]) {
    case 0:
      sprite.x = getBattlerSpriteCoordAttr(runtime, battler, 'right') - 8;
      sprite.y = getBattlerSpriteCoordAttr(runtime, battler, 'top') + 8;
      break;
    case 1:
      sprite.x = getBattlerSpriteCoordAttr(runtime, battler, 'right') - 14;
      sprite.y = getBattlerSpriteCoordAttr(runtime, battler, 'top') + 16;
      break;
    case 2:
      sprite.x = getBattlerSpriteCoordAttr(runtime, battler, 'left') + 8;
      sprite.y = getBattlerSpriteCoordAttr(runtime, battler, 'top') + 8;
      startSpriteAffineAnim(sprite, 1);
      xOffset = -20;
      break;
    case 3:
      sprite.x = getBattlerSpriteCoordAttr(runtime, battler, 'left') + 14;
      sprite.y = getBattlerSpriteCoordAttr(runtime, battler, 'top') + 16;
      startSpriteAffineAnim(sprite, 1);
      xOffset = -20;
      break;
  }
  sprite.data[0] = 32;
  sprite.data[2] = sprite.x + xOffset;
  sprite.data[4] = sprite.y + 12;
  sprite.data[5] = -12;
  initAnimArcTranslation(sprite);
  sprite.callback = 'AnimTearDrop_Step';
}

export function AnimTearDrop_Step(sprite: DarkSprite): void {
  if (translateAnimHorizontalArc(sprite)) destroySpriteAndMatrix(sprite);
}

export function AnimTask_MoveAttackerMementoShadow(runtime: DarkRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[7] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'y') + 31;
  task.data[6] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimAttacker, 'top') - 7;
  task.data[5] = task.data[7];
  task.data[4] = task.data[6];
  task.data[13] = (task.data[7] - task.data[6]) << 8;
  const pos = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x');
  task.data[14] = pos - 32;
  task.data[15] = pos + 32;
  task.data[8] = getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER ? -12 : -64;
  task.data[3] = getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimAttacker);
  if (task.data[3] === 1) {
    task.data[10] = runtime.battleBg1Y;
    setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0x3f42);
    fillPalette(runtime, 0, runtime.animBg1Data.paletteId);
    if (!runtime.contest) runtime.battleBg2X += DISPLAY_WIDTH;
  } else {
    task.data[10] = runtime.battleBg2Y;
    setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0x3f44);
    fillPalette(runtime, 0, 9);
    if (!runtime.contest) runtime.battleBg1X += DISPLAY_WIDTH;
  }
  task.data[11] = 0;
  task.data[12] = 16;
  task.data[0] = 0;
  task.data[1] = 0;
  task.data[2] = 0;
  SetAllBattlersSpritePriority(runtime, 3);
  for (let i = 0; i < 112; i++) {
    runtime.scanlineEffectRegBuffers[0][i] = task.data[10];
    runtime.scanlineEffectRegBuffers[1][i] = task.data[10];
  }
  scanlineEffectSetParams(runtime, { dmaDest: task.data[3] === 1 ? 'REG_BG1VOFS' : 'REG_BG2VOFS' });
  setGpuReg(runtime, 'REG_OFFSET_WINOUT', task.data[3] === 1 ? 0x1f3e : 0x1f3d);
  setGpuReg(runtime, 'REG_OFFSET_WININ', 0x3f3f);
  runtime.battleWin0H = (task.data[14] << 8) | task.data[15];
  runtime.battleWin0V = DISPLAY_HEIGHT;
  task.func = 'AnimTask_MoveAttackerMementoShadow_Step';
}

export function AnimTask_MoveAttackerMementoShadow_Step(runtime: DarkRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        if (++task.data[2] & 1) {
          if (task.data[11] !== 12) ++task.data[11];
        } else if (task.data[12] !== 8) --task.data[12];
        setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', blendAlpha(task.data[11], task.data[12]));
        if (task.data[11] === 12 && task.data[12] === 8) ++task.data[0];
      }
      break;
    case 1:
      task.data[4] -= 8;
      DoMementoShadowEffect(runtime, task);
      if (task.data[4] < task.data[8]) ++task.data[0];
      break;
    case 2:
      task.data[4] -= 8;
      DoMementoShadowEffect(runtime, task);
      task.data[14] += 4;
      task.data[15] -= 4;
      if (task.data[14] >= task.data[15]) task.data[14] = task.data[15];
      runtime.battleWin0H = (task.data[14] << 8) | task.data[15];
      if (task.data[14] === task.data[15]) ++task.data[0];
      break;
    case 3:
      runtime.scanlineEffect.state = 3;
      ++task.data[0];
      break;
    case 4:
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function AnimTask_MoveTargetMementoShadow(runtime: DarkRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      if (runtime.contest) {
        runtime.battleWin0H = 0;
        runtime.battleWin0V = 0;
        setGpuReg(runtime, 'REG_OFFSET_WININ', 0x3f3f);
        setGpuReg(runtime, 'REG_OFFSET_WINOUT', 0x3f3f);
        destroyAnimVisualTask(runtime, taskId);
      } else {
        task.data[3] = getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimTarget);
        if (task.data[3] === 1) {
          setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0x3f42);
          runtime.battleBg2X += DISPLAY_WIDTH;
        } else {
          setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0x3f44);
          runtime.battleBg1X += DISPLAY_WIDTH;
        }
        ++task.data[0];
      }
      break;
    case 1:
      if (task.data[3] === 1) {
        task.data[10] = runtime.battleBg1Y;
        fillPalette(runtime, 0, runtime.animBg1Data.paletteId);
      } else {
        task.data[10] = runtime.battleBg2Y;
        fillPalette(runtime, 0, 9);
      }
      SetAllBattlersSpritePriority(runtime, 3);
      ++task.data[0];
      break;
    case 2: {
      task.data[7] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'y') + 31;
      task.data[6] = getBattlerSpriteCoordAttr(runtime, runtime.battleAnimTarget, 'top') - 7;
      task.data[13] = (task.data[7] - task.data[6]) << 8;
      const x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x');
      task.data[14] = x - 4;
      task.data[15] = x + 4;
      task.data[8] = getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER ? -12 : -64;
      task.data[4] = task.data[8];
      task.data[5] = task.data[8];
      task.data[11] = 12;
      task.data[12] = 8;
      ++task.data[0];
      break;
    }
    case 3:
      for (let i = 0; i < 112; i++) {
        runtime.scanlineEffectRegBuffers[0][i] = task.data[10] + (159 - i);
        runtime.scanlineEffectRegBuffers[1][i] = task.data[10] + (159 - i);
      }
      scanlineEffectSetParams(runtime, { dmaDest: task.data[3] === 1 ? 'REG_BG1VOFS' : 'REG_BG2VOFS' });
      ++task.data[0];
      break;
    case 4:
      setGpuReg(runtime, 'REG_OFFSET_WINOUT', task.data[3] === 1 ? 0x3d3f : 0x3b3f);
      setGpuReg(runtime, 'REG_OFFSET_WININ', 0x3f3f);
      runtime.battleWin0H = (task.data[14] << 8) | task.data[15];
      runtime.battleWin0V = DISPLAY_HEIGHT;
      task.data[0] = 0;
      task.data[1] = 0;
      task.data[2] = 0;
      setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', blendAlpha(12, 8));
      task.func = 'AnimTask_MoveTargetMementoShadow_Step';
      break;
  }
}

export function AnimTask_MoveTargetMementoShadow_Step(runtime: DarkRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      task.data[5] += 8;
      if (task.data[5] >= task.data[7]) task.data[5] = task.data[7];
      DoMementoShadowEffect(runtime, task);
      DoMementoShadowEffect(runtime, task);
      if (task.data[5] === task.data[7]) ++task.data[0];
      break;
    case 1:
      if (task.data[15] - task.data[14] < 0x40) {
        task.data[14] -= 4;
        task.data[15] += 4;
      } else {
        task.data[1] = 1;
      }
      runtime.battleWin0H = (task.data[14] << 8) | task.data[15];
      task.data[4] += 8;
      if (task.data[4] >= task.data[6]) task.data[4] = task.data[6];
      DoMementoShadowEffect(runtime, task);
      if (task.data[4] === task.data[6] && task.data[1]) {
        task.data[1] = 0;
        ++task.data[0];
      }
      break;
    case 2:
      if (++task.data[1] > 1) {
        task.data[1] = 0;
        ++task.data[2];
        if (task.data[2] & 1) {
          if (task.data[11]) --task.data[11];
        } else if (task.data[12] < 16) ++task.data[12];
        setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', blendAlpha(task.data[11], task.data[12]));
        if (task.data[11] === 0 && task.data[12] === 16) ++task.data[0];
      }
      break;
    case 3:
      runtime.scanlineEffect.state = 3;
      ++task.data[0];
      break;
    case 4:
      runtime.battleWin0H = 0;
      runtime.battleWin0V = 0;
      setGpuReg(runtime, 'REG_OFFSET_WININ', 0x3f3f);
      setGpuReg(runtime, 'REG_OFFSET_WINOUT', 0x3f3f);
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function DoMementoShadowEffect(runtime: DarkRuntime, task: DarkTask): void {
  let i: number;
  const var2 = task.data[5] - task.data[4];
  if (var2 !== 0) {
    const var0 = Math.trunc(task.data[13] / var2);
    let var1 = task.data[6] << 8;
    for (i = 0; i < task.data[4]; ++i) runtime.scanlineEffectRegBuffers[runtime.scanlineEffect.srcBuffer][i] = task.data[10] - (i - 159);
    for (i = task.data[4]; i <= task.data[5]; ++i) {
      if (i >= 0) {
        const var3 = (var1 >> 8) - i;
        runtime.scanlineEffectRegBuffers[runtime.scanlineEffect.srcBuffer][i] = var3 + task.data[10];
      }
      var1 += var0;
    }
    let var4 = task.data[10] - (i - 159);
    for (; i < task.data[7]; ++i) if (i >= 0) runtime.scanlineEffectRegBuffers[runtime.scanlineEffect.srcBuffer][i] = var4--;
  } else {
    let var4 = task.data[10] + 159;
    for (i = 0; i < 112; ++i) {
      runtime.scanlineEffectRegBuffers[0][i] = var4;
      runtime.scanlineEffectRegBuffers[1][i] = var4;
      --var4;
    }
  }
}

export function SetAllBattlersSpritePriority(runtime: DarkRuntime, priority: number): void {
  for (let i = 0; i < MAX_BATTLERS_COUNT; ++i) {
    const spriteId = getAnimBattlerSpriteId(runtime, i);
    if (spriteId !== SPRITE_NONE) runtime.sprites[spriteId].oam.priority = priority;
  }
}

export function AnimTask_InitMementoShadow(runtime: DarkRuntime, taskId: number): void {
  const toBG2 = getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimAttacker) ^ 1 ? true : false;
  moveBattlerSpriteToBG(runtime, runtime.battleAnimAttacker, toBG2);
  runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimAttacker]].invisible = false;
  if (isBattlerSpriteVisible(runtime, battlePartner(runtime.battleAnimAttacker))) {
    moveBattlerSpriteToBG(runtime, runtime.battleAnimAttacker ^ 2, !toBG2);
    runtime.sprites[runtime.battlerSpriteIds[runtime.battleAnimAttacker ^ 2]].invisible = false;
  }
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimTask_MementoHandleBg(runtime: DarkRuntime, taskId: number): void {
  const toBG2 = getBattlerSpriteBgPriorityRank(runtime, runtime.battleAnimAttacker) ^ 1 ? true : false;
  resetBattleAnimBg(runtime, toBG2);
  if (isBattlerSpriteVisible(runtime, battlePartner(runtime.battleAnimAttacker))) resetBattleAnimBg(runtime, !toBG2);
  destroyAnimVisualTask(runtime, taskId);
}

export function AnimClawSlash(runtime: DarkRuntime, sprite: DarkSprite): void {
  sprite.x += runtime.battleAnimArgs[0];
  sprite.y += runtime.battleAnimArgs[1];
  startSpriteAnim(sprite, runtime.battleAnimArgs[2]);
  sprite.callback = 'RunStoredCallbackWhenAnimEnds';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimTask_MetallicShine(runtime: DarkRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  let priorityChanged = false;
  runtime.battleWin0H = 0;
  runtime.battleWin0V = 0;
  setGpuReg(runtime, 'REG_OFFSET_WININ', 0x3f3f);
  setGpuReg(runtime, 'REG_OFFSET_WINOUT', 0x3d3f);
  setGpuRegBits(runtime, 'REG_OFFSET_DISPCNT', DISPCNT_OBJWIN_ON);
  setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0x3f42);
  setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', blendAlpha(8, 12));
  setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 0);
  setAnimBgAttribute(runtime, 1, 'BG_ANIM_SCREEN_SIZE', 0);
  if (!runtime.contest) setAnimBgAttribute(runtime, 1, 'BG_ANIM_CHAR_BASE_BLOCK', 1);
  if (runtime.doubleBattle && !runtime.contest) {
    const pos = getBattlerPosition(runtime, runtime.battleAnimAttacker);
    if ((pos === B_POSITION_OPPONENT_RIGHT || pos === B_POSITION_PLAYER_LEFT) && isBattlerSpriteVisible(runtime, battlePartner(runtime.battleAnimAttacker))) {
      runtime.sprites[runtime.battlerSpriteIds[battlePartner(runtime.battleAnimAttacker)]].oam.priority--;
      setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 1);
      priorityChanged = true;
    }
  }
  const partyIndex = runtime.battlerPartyIndexes[runtime.battleAnimAttacker];
  const species = getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER
    ? runtime.enemyPartySpecies[partyIndex]
    : runtime.playerPartySpecies[partyIndex];
  const spriteId = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
  const newSpriteId = createInvisibleSpriteCopy(runtime, runtime.battleAnimAttacker, spriteId, species);
  animLoadCompressedBgTilemap(runtime, runtime.animBg1Data.bgId, 'gMetalShineTilemap');
  animLoadCompressedBgGfx(runtime, runtime.animBg1Data.bgId, 'gMetalShineGfx', runtime.animBg1Data.tilesOffset);
  loadCompressedPalette(runtime, 'gMetalShinePalette', runtime.animBg1Data.paletteId);
  runtime.battleBg1X = -runtime.sprites[spriteId].x + 96;
  runtime.battleBg1Y = -runtime.sprites[spriteId].y + 32;
  const paletteNum = 16 + runtime.sprites[spriteId].oam.paletteNum;
  if (runtime.battleAnimArgs[1] === 0) setGreyscaleOrOriginalPalette(runtime, paletteNum, false);
  else blendPalette(runtime, paletteNum, 16, 11, runtime.battleAnimArgs[2]);
  task.data[0] = newSpriteId;
  task.data[1] = runtime.battleAnimArgs[0];
  task.data[2] = runtime.battleAnimArgs[1];
  task.data[3] = runtime.battleAnimArgs[2];
  task.data[6] = Number(priorityChanged);
  task.func = 'AnimTask_MetallicShine_Step';
}

export function AnimTask_MetallicShine_Step(runtime: DarkRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[10] += 4;
  runtime.battleBg1X -= 4;
  if (task.data[10] === 128) {
    task.data[10] = 0;
    runtime.battleBg1X += 128;
    task.data[11]++;
    if (task.data[11] === 2) {
      const spriteId = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
      const paletteNum = 16 + runtime.sprites[spriteId].oam.paletteNum;
      if (task.data[1] === 0) setGreyscaleOrOriginalPalette(runtime, paletteNum, true);
      destroySprite(runtime.sprites[task.data[0]]);
      initBattleAnimBg(runtime, runtime.animBg1Data.bgId);
      if (task.data[6] === 1) runtime.sprites[runtime.battlerSpriteIds[battlePartner(runtime.battleAnimAttacker)]].oam.priority++;
    } else if (task.data[11] === 3) {
      runtime.battleWin0H = 0;
      runtime.battleWin0V = 0;
      setGpuReg(runtime, 'REG_OFFSET_WININ', 0x3f3f);
      setGpuReg(runtime, 'REG_OFFSET_WINOUT', 0x3f3f);
      if (!runtime.contest) setAnimBgAttribute(runtime, 1, 'BG_ANIM_CHAR_BASE_BLOCK', 0);
      setGpuReg(runtime, 'REG_OFFSET_DISPCNT', getGpuReg(runtime, 'REG_OFFSET_DISPCNT') ^ DISPCNT_OBJWIN_ON);
      setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0);
      setGpuReg(runtime, 'REG_OFFSET_BLDALPHA', 0);
      destroyAnimVisualTask(runtime, taskId);
    }
  }
}

export function AnimTask_SetGrayscaleOrOriginalPal(runtime: DarkRuntime, taskId: number): void {
  let spriteId = SPRITE_NONE;
  let calcSpriteId = false;
  let position = B_POSITION_PLAYER_LEFT;
  switch (runtime.battleAnimArgs[0]) {
    case ANIM_ATTACKER:
    case ANIM_TARGET:
    case ANIM_ATK_PARTNER:
    case ANIM_DEF_PARTNER:
      spriteId = getAnimBattlerSpriteId(runtime, runtime.battleAnimArgs[0]);
      break;
    case 4:
      position = B_POSITION_PLAYER_LEFT;
      calcSpriteId = true;
      break;
    case 5:
      position = B_POSITION_PLAYER_RIGHT;
      calcSpriteId = true;
      break;
    case 6:
      position = B_POSITION_OPPONENT_LEFT;
      calcSpriteId = true;
      break;
    case 7:
      position = B_POSITION_OPPONENT_RIGHT;
      calcSpriteId = true;
      break;
  }
  if (calcSpriteId) {
    const battler = getBattlerAtPosition(runtime, position);
    spriteId = isBattlerSpriteVisible(runtime, battler) ? runtime.battlerSpriteIds[battler] : SPRITE_NONE;
  }
  if (spriteId !== SPRITE_NONE) setGreyscaleOrOriginalPalette(runtime, runtime.sprites[spriteId].oam.paletteNum + 16, runtime.battleAnimArgs[1]);
  destroyAnimVisualTask(runtime, taskId);
}

export function GetIsDoomDesireHitTurn(runtime: DarkRuntime, taskId: number): void {
  if (runtime.animMoveTurn < 2) runtime.battleAnimArgs[ARG_RET_ID] = 0;
  if (runtime.animMoveTurn === 2) runtime.battleAnimArgs[ARG_RET_ID] = 1;
  destroyAnimVisualTask(runtime, taskId);
}

export const animTaskAttackerFadeToInvisible = AnimTask_AttackerFadeToInvisible;
export const animTaskAttackerFadeToInvisibleStep = AnimTask_AttackerFadeToInvisible_Step;
export const animTaskAttackerFadeFromInvisible = AnimTask_AttackerFadeFromInvisible;
export const animTaskAttackerFadeFromInvisibleStep = AnimTask_AttackerFadeFromInvisible_Step;
export const animTaskInitAttackerFadeFromInvisible = AnimTask_InitAttackerFadeFromInvisible;
export const animUnusedBagSteal = AnimUnusedBagSteal;
export const animUnusedBagStealStep = AnimUnusedBagSteal_Step;
export const animBite = AnimBite;
export const animBiteStep1 = AnimBite_Step1;
export const animBiteStep2 = AnimBite_Step2;
export const animTearDrop = AnimTearDrop;
export const animTearDropStep = AnimTearDrop_Step;
export const animTaskMoveAttackerMementoShadow = AnimTask_MoveAttackerMementoShadow;
export const animTaskMoveAttackerMementoShadowStep = AnimTask_MoveAttackerMementoShadow_Step;
export const animTaskMoveTargetMementoShadow = AnimTask_MoveTargetMementoShadow;
export const animTaskMoveTargetMementoShadowStep = AnimTask_MoveTargetMementoShadow_Step;
export const doMementoShadowEffect = DoMementoShadowEffect;
export const setAllBattlersSpritePriority = SetAllBattlersSpritePriority;
export const animTaskInitMementoShadow = AnimTask_InitMementoShadow;
export const animTaskMementoHandleBg = AnimTask_MementoHandleBg;
export const animClawSlash = AnimClawSlash;
export const animTaskMetallicShine = AnimTask_MetallicShine;
export const animTaskMetallicShineStep = AnimTask_MetallicShine_Step;
export const animTaskSetGrayscaleOrOriginalPal = AnimTask_SetGrayscaleOrOriginalPal;
export const getIsDoomDesireHitTurn = GetIsDoomDesireHitTurn;

const getBattlerSide = (runtime: DarkRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const getBattlerPosition = (runtime: DarkRuntime, battler: number): number => runtime.battlerPositions[battler] ?? 0;
const getBattlerAtPosition = (runtime: DarkRuntime, position: number): number => runtime.battlerAtPosition[position] ?? 0;
const getBattlerSpriteCoord = (runtime: DarkRuntime, battler: number, coord: 'x' | 'x2' | 'y' | 'yPicOffset'): number =>
  runtime.battlerCoords[battler]?.[coord] ?? 0;
const getBattlerSpriteCoordAttr = (runtime: DarkRuntime, battler: number, attr: 'top' | 'right' | 'left'): number =>
  runtime.battlerCoords[battler]?.[attr] ?? 0;
const getBattlerSpriteBgPriorityRank = (runtime: DarkRuntime, battler: number): number => runtime.battlerBgPriorityRanks[battler] ?? 1;
const getAnimBattlerSpriteId = (runtime: DarkRuntime, animBattler: number): number => {
  const battler =
    animBattler === ANIM_ATTACKER ? runtime.battleAnimAttacker :
      animBattler === ANIM_TARGET ? runtime.battleAnimTarget :
        animBattler === ANIM_ATK_PARTNER ? battlePartner(runtime.battleAnimAttacker) :
          animBattler === ANIM_DEF_PARTNER ? battlePartner(runtime.battleAnimTarget) :
            animBattler;
  return runtime.battlerSpriteIds[battler] ?? SPRITE_NONE;
};
const battlePartner = (battler: number): number => battler ^ BIT_FLANK;
const isBattlerSpriteVisible = (runtime: DarkRuntime, battler: number): boolean => runtime.battlerVisible[battler] === true;
const startSpriteAnim = (sprite: DarkSprite, animIndex: number): void => {
  sprite.animIndex = animIndex;
};
const startSpriteAffineAnim = (sprite: DarkSprite, animIndex: number): void => {
  sprite.affineAnimIndex = animIndex;
};
const storeSpriteCallbackInData6 = (sprite: DarkSprite, callback: DarkCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const destroyAnimSprite = (sprite: DarkSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const destroySprite = destroyAnimSprite;
const destroySpriteAndMatrix = (sprite: DarkSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroySpriteAndMatrix';
};
const initSpriteDataForLinearTranslation = (_sprite: DarkSprite): void => {};
const initAnimArcTranslation = (_sprite: DarkSprite): void => {};
const translateAnimHorizontalArc = (sprite: DarkSprite): boolean => {
  if (sprite.data[0] > 0) --sprite.data[0];
  return sprite.data[0] === 0;
};
const blendAlpha = (eva: number, evb: number): number => (eva & 0x1f) | ((evb & 0x1f) << 8);
const setGpuReg = (runtime: DarkRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value & 0xffff;
};
const getGpuReg = (runtime: DarkRuntime, reg: string): number => runtime.gpuRegs[reg] ?? 0;
const setGpuRegBits = (runtime: DarkRuntime, reg: string, bits: number): void => {
  runtime.gpuRegs[reg] = getGpuReg(runtime, reg) | bits;
};
const setAnimBgAttribute = (runtime: DarkRuntime, bg: number, attr: string, value: number): void => {
  runtime.bgAttrs[`${bg}:${attr}`] = value;
};
const destroyAnimVisualTask = (runtime: DarkRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};
const scanlineEffectSetParams = (runtime: DarkRuntime, params: unknown): void => {
  runtime.scanlineEffect.params = params;
  runtime.operations.push('ScanlineEffect_SetParams');
};
const fillPalette = (runtime: DarkRuntime, color: number, paletteId: number): void => {
  runtime.operations.push(`FillPalette:${color}:${paletteId}`);
};
const moveBattlerSpriteToBG = (runtime: DarkRuntime, battler: number, toBG2: boolean): void => {
  runtime.operations.push(`MoveBattlerSpriteToBG:${battler}:${Number(toBG2)}`);
};
const resetBattleAnimBg = (runtime: DarkRuntime, toBG2: boolean): void => {
  runtime.operations.push(`ResetBattleAnimBg:${Number(toBG2)}`);
};
const createInvisibleSpriteCopy = (runtime: DarkRuntime, battler: number, sourceSpriteId: number, species: number): number => {
  const id = runtime.sprites.findIndex((sprite, index) => index >= 4 && sprite.templateName === null && !sprite.destroyed);
  runtime.sprites[id] = createDarkSprite();
  runtime.sprites[id].templateName = 'InvisibleSpriteCopy';
  runtime.sprites[id].invisible = true;
  runtime.operations.push(`CreateInvisibleSpriteCopy:${battler}:${sourceSpriteId}:${species}:${id}`);
  return id;
};
const animLoadCompressedBgTilemap = (runtime: DarkRuntime, bgId: number, tilemap: string): void => {
  runtime.operations.push(`AnimLoadCompressedBgTilemap:${bgId}:${tilemap}`);
};
const animLoadCompressedBgGfx = (runtime: DarkRuntime, bgId: number, gfx: string, offset: number): void => {
  runtime.operations.push(`AnimLoadCompressedBgGfx:${bgId}:${gfx}:${offset}`);
};
const loadCompressedPalette = (runtime: DarkRuntime, palette: string, paletteId: number): void => {
  runtime.operations.push(`LoadCompressedPalette:${palette}:${paletteId}`);
};
const initBattleAnimBg = (runtime: DarkRuntime, bgId: number): void => {
  runtime.operations.push(`InitBattleAnimBg:${bgId}`);
};
const setGreyscaleOrOriginalPalette = (runtime: DarkRuntime, paletteNum: number, original: boolean | number): void => {
  runtime.operations.push(`SetGreyscaleOrOriginalPalette:${paletteNum}:${Number(original)}`);
};
const blendPalette = (runtime: DarkRuntime, paletteNum: number, numColors: number, coeff: number, color: number): void => {
  runtime.operations.push(`BlendPalette:${paletteNum}:${numColors}:${coeff}:${color}`);
};
