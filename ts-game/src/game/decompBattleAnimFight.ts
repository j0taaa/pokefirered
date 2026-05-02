import { sin } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_RIGHT = 2;
export const BIT_SIDE = 1;
export const BIT_FLANK = 2;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const MAX_SPRITES = 64;
export const ST_OAM_HFLIP = 0x400;
export const ST_OAM_VFLIP = 0x800;

export type FightCallback =
  | 'AnimUnusedHumanoidFoot'
  | 'AnimSlideHandOrFootToTarget'
  | 'AnimJumpKick'
  | 'AnimBasicFistOrFoot'
  | 'AnimFistOrFootRandomPos'
  | 'AnimFistOrFootRandomPos_Step'
  | 'AnimCrossChopHand'
  | 'AnimCrossChopHand_Step'
  | 'AnimSlidingKick'
  | 'AnimSlidingKick_Step'
  | 'AnimSpinningKickOrPunch'
  | 'AnimSpinningKickOrPunchFinish'
  | 'AnimStompFoot'
  | 'AnimStompFootStep'
  | 'AnimStompFootEnd'
  | 'AnimDizzyPunchDuck'
  | 'AnimBrickBreakWall'
  | 'AnimBrickBreakWall_Step'
  | 'AnimBrickBreakWallShard'
  | 'AnimBrickBreakWallShard_Step'
  | 'AnimSuperpowerOrb'
  | 'AnimSuperpowerOrb_Step'
  | 'AnimSuperpowerRock'
  | 'AnimSuperpowerRock_Step1'
  | 'AnimSuperpowerRock_Step2'
  | 'AnimSuperpowerFireball'
  | 'AnimArmThrustHit'
  | 'AnimArmThrustHit_Step'
  | 'AnimRevengeScratch'
  | 'AnimFocusPunchFist'
  | 'StartAnimLinearTranslation'
  | 'AnimTranslateLinear_WithFollowup'
  | 'WaitAnimForDuration'
  | 'RunStoredCallbackWhenAnimEnds'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix'
  | 'SpriteCallbackDummy';

export interface FightSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: FightCallback;
}

export interface FightSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: FightCallback;
  storedCallback: FightCallback | null;
  destroyed: boolean;
  invisible: boolean;
  hFlip: number;
  animIndex: number;
  affineAnimIndex: number;
  affineAnimPaused: number;
  affineAnimEnded: boolean;
  subpriority: number;
  oam: { tileNum: number; matrixNum: number; priority: number };
  templateName: string | null;
}

export interface FightTask {
  data: number[];
  destroyed: boolean;
}

export interface FightRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  battlerAttacker: number;
  battlerTarget: number;
  animMoveTurn: number;
  contest: boolean;
  battlerSides: Record<number, number>;
  battlerPositions: Record<number, number>;
  battlerBgPriorities: Record<number, number>;
  battlerCoords: Record<number, { x: number; y: number; x2: number; yPicOffset: number; width: number; height: number }>;
  sprites: FightSprite[];
  tasks: Array<FightTask | null>;
  randomValues: number[];
  battleBg3X: number;
  battleBg3Y: number;
  bg3Mode: number | null;
  gpuRegs: Record<string, number>;
  operations: string[];
}

export const sAnimsHandsAndFeet = [
  [{ frame: 0, duration: 1 }],
  [{ frame: 16, duration: 1 }],
  [{ frame: 32, duration: 1 }],
  [{ frame: 48, duration: 1 }],
  [{ frame: 48, duration: 1, hFlip: true }]
] as const;

export const sAffineAnimsSpinningHandOrFoot = [[
  { xScale: 0x100, yScale: 0x100, rotation: 0, duration: 0 },
  { xScale: -0x8, yScale: -0x8, rotation: 20, duration: 1 },
  { jump: 1 }
]] as const;

export const sAffineAnimsMegaPunchKick = [[
  { xScale: 0x100, yScale: 0x100, rotation: 0, duration: 0 },
  { xScale: -0x4, yScale: -0x4, rotation: 20, duration: 1 },
  { jump: 1 }
]] as const;

export const sAffineAnimsSuperpowerOrb = [[
  { xScale: 0x20, yScale: 0x20, rotation: 0, duration: 0 },
  { xScale: 0x4, yScale: 0x4, rotation: 0, duration: 64 },
  { xScale: -0x6, yScale: -0x6, rotation: 0, duration: 8 },
  { xScale: 0x6, yScale: 0x6, rotation: 0, duration: 8 },
  { jump: 2 }
]] as const;

export const sAffineAnimsFocusPunchFist = [[
  { xScale: 0x200, yScale: 0x200, rotation: 0, duration: 0 },
  { xScale: -0x20, yScale: -0x20, rotation: 0, duration: 8 },
  { end: true }
]] as const;

export const gKarateChopSpriteTemplate: FightSpriteTemplate = {
  tileTag: 'ANIM_TAG_HANDS_AND_FEET',
  paletteTag: 'ANIM_TAG_HANDS_AND_FEET',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: sAnimsHandsAndFeet,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimSlideHandOrFootToTarget'
};
export const gJumpKickSpriteTemplate: FightSpriteTemplate = { ...gKarateChopSpriteTemplate, callback: 'AnimJumpKick' };
export const gFistFootSpriteTemplate: FightSpriteTemplate = { ...gKarateChopSpriteTemplate, callback: 'AnimBasicFistOrFoot' };
export const gFistFootRandomPosSpriteTemplate: FightSpriteTemplate = { ...gKarateChopSpriteTemplate, callback: 'AnimFistOrFootRandomPos' };
export const gCrossChopHandSpriteTemplate: FightSpriteTemplate = {
  ...gKarateChopSpriteTemplate,
  anims: sAnimsHandsAndFeet.slice(3),
  callback: 'AnimCrossChopHand'
};
export const gSlidingKickSpriteTemplate: FightSpriteTemplate = {
  ...gKarateChopSpriteTemplate,
  anims: sAnimsHandsAndFeet.slice(1),
  callback: 'AnimSlidingKick'
};
export const gSpinningHandOrFootSpriteTemplate: FightSpriteTemplate = {
  ...gKarateChopSpriteTemplate,
  oam: 'gOamData_AffineDouble_ObjNormal_32x32',
  affineAnims: sAffineAnimsSpinningHandOrFoot,
  callback: 'AnimSpinningKickOrPunch'
};
export const gMegaPunchKickSpriteTemplate: FightSpriteTemplate = {
  ...gSpinningHandOrFootSpriteTemplate,
  affineAnims: sAffineAnimsMegaPunchKick
};
export const gStompFootSpriteTemplate: FightSpriteTemplate = {
  ...gKarateChopSpriteTemplate,
  anims: sAnimsHandsAndFeet.slice(1),
  callback: 'AnimStompFoot'
};
export const gDizzyPunchDuckSpriteTemplate: FightSpriteTemplate = {
  tileTag: 'ANIM_TAG_DUCK',
  paletteTag: 'ANIM_TAG_DUCK',
  oam: 'gOamData_AffineOff_ObjNormal_16x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimDizzyPunchDuck'
};
export const gBrickBreakWallSpriteTemplate: FightSpriteTemplate = {
  tileTag: 'ANIM_TAG_BLUE_LIGHT_WALL',
  paletteTag: 'ANIM_TAG_BLUE_LIGHT_WALL',
  oam: 'gOamData_AffineOff_ObjBlend_64x64',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimBrickBreakWall'
};
export const gBrickBreakWallShardSpriteTemplate: FightSpriteTemplate = {
  tileTag: 'ANIM_TAG_TORN_METAL',
  paletteTag: 'ANIM_TAG_TORN_METAL',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimBrickBreakWallShard'
};
export const gSuperpowerOrbSpriteTemplate: FightSpriteTemplate = {
  tileTag: 'ANIM_TAG_CIRCLE_OF_LIGHT',
  paletteTag: 'ANIM_TAG_CIRCLE_OF_LIGHT',
  oam: 'gOamData_AffineDouble_ObjBlend_64x64',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: sAffineAnimsSuperpowerOrb,
  callback: 'AnimSuperpowerOrb'
};
export const gSuperpowerRockSpriteTemplate: FightSpriteTemplate = {
  tileTag: 'ANIM_TAG_FLAT_ROCK',
  paletteTag: 'ANIM_TAG_FLAT_ROCK',
  oam: 'gOamData_AffineOff_ObjNormal_16x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimSuperpowerRock'
};
export const gSuperpowerFireballSpriteTemplate: FightSpriteTemplate = {
  tileTag: 'ANIM_TAG_METEOR',
  paletteTag: 'ANIM_TAG_METEOR',
  oam: 'gOamData_AffineOff_ObjNormal_64x64',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimSuperpowerFireball'
};
export const gArmThrustHandSpriteTemplate: FightSpriteTemplate = { ...gKarateChopSpriteTemplate, callback: 'AnimArmThrustHit' };
export const sAnimsRevengeSmallScratch = [
  [{ frame: 0, duration: 4 }, { frame: 16, duration: 4 }, { frame: 32, duration: 4 }],
  [{ frame: 0, duration: 4, vFlip: true }, { frame: 16, duration: 4, vFlip: true }, { frame: 32, duration: 4, vFlip: true }],
  [{ frame: 0, duration: 4, hFlip: true }, { frame: 16, duration: 4, hFlip: true }, { frame: 32, duration: 4, hFlip: true }]
] as const;
export const sAnimsRevengeBigScratch = [
  [{ frame: 0, duration: 6 }, { frame: 64, duration: 6 }],
  [{ frame: 0, duration: 6, vFlip: true, hFlip: true }, { frame: 64, duration: 6, vFlip: true, hFlip: true }],
  [{ frame: 0, duration: 6, hFlip: true }, { frame: 64, duration: 6, hFlip: true }]
] as const;
export const gRevengeSmallScratchSpriteTemplate: FightSpriteTemplate = {
  tileTag: 'ANIM_TAG_PURPLE_SCRATCH',
  paletteTag: 'ANIM_TAG_PURPLE_SCRATCH',
  oam: 'gOamData_AffineOff_ObjNormal_32x32',
  anims: sAnimsRevengeSmallScratch,
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'AnimRevengeScratch'
};
export const gRevengeBigScratchSpriteTemplate: FightSpriteTemplate = {
  ...gRevengeSmallScratchSpriteTemplate,
  tileTag: 'ANIM_TAG_PURPLE_SWIPE',
  paletteTag: 'ANIM_TAG_PURPLE_SWIPE',
  oam: 'gOamData_AffineOff_ObjNormal_64x64',
  anims: sAnimsRevengeBigScratch
};
export const gFocusPunchFistSpriteTemplate: FightSpriteTemplate = {
  ...gKarateChopSpriteTemplate,
  oam: 'gOamData_AffineDouble_ObjNormal_32x32',
  affineAnims: sAffineAnimsFocusPunchFist,
  callback: 'AnimFocusPunchFist'
};

export const createFightSprite = (): FightSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 16 }, () => 0),
  callback: 'AnimBasicFistOrFoot',
  storedCallback: null,
  destroyed: false,
  invisible: false,
  hFlip: 0,
  animIndex: 0,
  affineAnimIndex: 0,
  affineAnimPaused: 0,
  affineAnimEnded: false,
  subpriority: 0,
  oam: { tileNum: 0, matrixNum: 0, priority: 0 },
  templateName: null
});

export const createFightRuntime = (overrides: Partial<FightRuntime> = {}): FightRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  battlerAttacker: overrides.battlerAttacker ?? 0,
  battlerTarget: overrides.battlerTarget ?? 1,
  animMoveTurn: overrides.animMoveTurn ?? 0,
  contest: overrides.contest ?? false,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerPositions: overrides.battlerPositions ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerBgPriorities: overrides.battlerBgPriorities ?? { 0: 1, 1: 2, 2: 1, 3: 2 },
  battlerCoords: overrides.battlerCoords ?? {
    0: { x: 32, y: 72, x2: 48, yPicOffset: 64, width: 64, height: 64 },
    1: { x: 160, y: 80, x2: 176, yPicOffset: 72, width: 72, height: 64 },
    2: { x: 72, y: 92, x2: 88, yPicOffset: 88, width: 64, height: 64 },
    3: { x: 200, y: 88, x2: 216, yPicOffset: 86, width: 64, height: 64 }
  },
  sprites: overrides.sprites ?? Array.from({ length: MAX_SPRITES }, () => createFightSprite()),
  tasks: overrides.tasks ?? [],
  randomValues: overrides.randomValues ?? [],
  battleBg3X: overrides.battleBg3X ?? 0,
  battleBg3Y: overrides.battleBg3Y ?? 0,
  bg3Mode: overrides.bg3Mode ?? null,
  gpuRegs: overrides.gpuRegs ?? {},
  operations: overrides.operations ?? []
});

export const createFightTask = (runtime: FightRuntime): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), destroyed: false });
  return id;
};

export function AnimUnusedHumanoidFoot(runtime: FightRuntime, sprite: FightSprite): void {
  setAnimSpriteInitialXOffset(runtime, sprite, runtime.battleAnimArgs[0]);
  sprite.y += runtime.battleAnimArgs[1];
  sprite.data[0] = 15;
  sprite.callback = 'WaitAnimForDuration';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimSlideHandOrFootToTarget(runtime: FightRuntime, sprite: FightSprite): void {
  if (runtime.battleAnimArgs[7] === 1 && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
    runtime.battleAnimArgs[3] = -runtime.battleAnimArgs[3];
  }
  startSpriteAnim(sprite, runtime.battleAnimArgs[6]);
  runtime.battleAnimArgs[6] = 0;
  animTravelDiagonally(sprite);
}

export function AnimJumpKick(runtime: FightRuntime, sprite: FightSprite): void {
  if (isContest(runtime)) {
    runtime.battleAnimArgs[1] = -runtime.battleAnimArgs[1];
    runtime.battleAnimArgs[3] = -runtime.battleAnimArgs[3];
  }
  AnimSlideHandOrFootToTarget(runtime, sprite);
}

export function AnimBasicFistOrFoot(runtime: FightRuntime, sprite: FightSprite): void {
  startSpriteAnim(sprite, runtime.battleAnimArgs[4]);
  if (runtime.battleAnimArgs[3] === 0) initSpritePosToAnimAttacker(runtime, sprite, true);
  else initSpritePosToAnimTarget(runtime, sprite, true);
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.callback = 'WaitAnimForDuration';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimFistOrFootRandomPos(runtime: FightRuntime, sprite: FightSprite): void {
  const battler = runtime.battleAnimArgs[0] === 0 ? runtime.battleAnimAttacker : runtime.battleAnimTarget;
  if (runtime.battleAnimArgs[2] < 0) runtime.battleAnimArgs[2] = random(runtime) % 5;
  startSpriteAnim(sprite, runtime.battleAnimArgs[2]);
  sprite.x = getBattlerSpriteCoord(runtime, battler, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, battler, 'yPicOffset');
  const xMod = Math.trunc(getBattlerSpriteCoordAttr(runtime, battler, 'width') / 2);
  const yMod = Math.trunc(getBattlerSpriteCoordAttr(runtime, battler, 'height') / 4);
  let x = random(runtime) % xMod;
  let y = random(runtime) % yMod;
  if (random(runtime) & 1) x *= -1;
  if (random(runtime) & 1) y *= -1;
  if ((getBattlerPosition(runtime, battler) & BIT_SIDE) === B_SIDE_PLAYER) y += 0xfff0;
  sprite.x += x;
  sprite.y += y;
  sprite.data[0] = runtime.battleAnimArgs[1];
  sprite.data[7] = createSprite(runtime, 'gBasicHitSplatSpriteTemplate', sprite.x, sprite.y, sprite.subpriority + 1);
  if (sprite.data[7] !== MAX_SPRITES) {
    startSpriteAffineAnim(runtime.sprites[sprite.data[7]], 0);
    runtime.sprites[sprite.data[7]].callback = 'SpriteCallbackDummy';
  }
  sprite.callback = 'AnimFistOrFootRandomPos_Step';
}

export function AnimFistOrFootRandomPos_Step(runtime: FightRuntime, sprite: FightSprite): void {
  if (sprite.data[0] === 0) {
    if (sprite.data[7] !== MAX_SPRITES) {
      freeOamMatrix(runtime, runtime.sprites[sprite.data[7]].oam.matrixNum);
      destroySprite(runtime.sprites[sprite.data[7]]);
    }
    destroyAnimSprite(sprite);
  } else {
    --sprite.data[0];
  }
}

export function AnimCrossChopHand(runtime: FightRuntime, sprite: FightSprite): void {
  initSpritePosToAnimTarget(runtime, sprite, true);
  sprite.data[0] = 30;
  if (runtime.battleAnimArgs[2] === 0) sprite.data[2] = sprite.x - 20;
  else {
    sprite.data[2] = sprite.x + 20;
    sprite.hFlip = 1;
  }
  sprite.data[4] = sprite.y - 20;
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'AnimCrossChopHand_Step');
}

export function AnimCrossChopHand_Step(sprite: FightSprite): void {
  if (++sprite.data[5] === 11) {
    sprite.data[2] = sprite.x - sprite.x2;
    sprite.data[4] = sprite.y - sprite.y2;
    sprite.data[0] = 8;
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.y2 = 0;
    sprite.x2 = 0;
    sprite.callback = 'StartAnimLinearTranslation';
    storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  }
}

export function AnimSlidingKick(runtime: FightRuntime, sprite: FightSprite): void {
  if (battlePartner(runtime.battleAnimAttacker) === runtime.battleAnimTarget && getBattlerPosition(runtime, runtime.battleAnimTarget) < B_POSITION_PLAYER_RIGHT)
    runtime.battleAnimArgs[0] *= -1;
  initSpritePosToAnimTarget(runtime, sprite, true);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  sprite.data[0] = runtime.battleAnimArgs[3];
  sprite.data[1] = sprite.x;
  sprite.data[2] = sprite.x + runtime.battleAnimArgs[2];
  sprite.data[3] = sprite.y;
  sprite.data[4] = sprite.y;
  initAnimLinearTranslation(sprite);
  sprite.data[5] = runtime.battleAnimArgs[5];
  sprite.data[6] = runtime.battleAnimArgs[4];
  sprite.data[7] = 0;
  sprite.callback = 'AnimSlidingKick_Step';
}

export function AnimSlidingKick_Step(sprite: FightSprite): void {
  if (!animTranslateLinear(sprite)) {
    sprite.y2 += sin(sprite.data[7] >> 8, sprite.data[5]);
    sprite.data[7] += sprite.data[6];
  } else {
    destroyAnimSprite(sprite);
  }
}

export function AnimSpinningKickOrPunch(runtime: FightRuntime, sprite: FightSprite): void {
  initSpritePosToAnimTarget(runtime, sprite, true);
  startSpriteAnim(sprite, runtime.battleAnimArgs[2]);
  sprite.data[0] = runtime.battleAnimArgs[3];
  sprite.callback = 'WaitAnimForDuration';
  storeSpriteCallbackInData6(sprite, 'AnimSpinningKickOrPunchFinish');
}

export function AnimSpinningKickOrPunchFinish(sprite: FightSprite): void {
  startSpriteAffineAnim(sprite, 0);
  sprite.affineAnimPaused = 1;
  sprite.data[0] = 20;
  sprite.callback = 'WaitAnimForDuration';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimStompFoot(runtime: FightRuntime, sprite: FightSprite): void {
  initSpritePosToAnimTarget(runtime, sprite, true);
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.callback = 'AnimStompFootStep';
}

export function AnimStompFootStep(runtime: FightRuntime, sprite: FightSprite): void {
  if (--sprite.data[0] === -1) {
    sprite.data[0] = 6;
    sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
    sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
    sprite.callback = 'StartAnimLinearTranslation';
    storeSpriteCallbackInData6(sprite, 'AnimStompFootEnd');
  }
}

export function AnimStompFootEnd(sprite: FightSprite): void {
  sprite.data[0] = 15;
  sprite.callback = 'WaitAnimForDuration';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimDizzyPunchDuck(runtime: FightRuntime, sprite: FightSprite): void {
  if (sprite.data[0] === 0) {
    initSpritePosToAnimTarget(runtime, sprite, true);
    sprite.data[1] = runtime.battleAnimArgs[2];
    sprite.data[2] = runtime.battleAnimArgs[3];
    ++sprite.data[0];
  } else {
    sprite.data[4] += sprite.data[1];
    sprite.x2 = sprite.data[4] >> 8;
    sprite.y2 = sin(sprite.data[3], sprite.data[2]);
    sprite.data[3] = (sprite.data[3] + 3) & 0xff;
    if (sprite.data[3] > 100) sprite.invisible = sprite.data[3] % 2 !== 0;
    if (sprite.data[3] > 120) destroyAnimSprite(sprite);
  }
}

export function AnimBrickBreakWall(runtime: FightRuntime, sprite: FightSprite): void {
  if (runtime.battleAnimArgs[0] === 0) {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x');
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'y');
  } else {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x');
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'y');
  }
  sprite.x += runtime.battleAnimArgs[1];
  sprite.y += runtime.battleAnimArgs[2];
  sprite.data[0] = 0;
  sprite.data[1] = runtime.battleAnimArgs[3];
  sprite.data[2] = runtime.battleAnimArgs[4];
  sprite.data[3] = 0;
  sprite.callback = 'AnimBrickBreakWall_Step';
}

export function AnimBrickBreakWall_Step(sprite: FightSprite): void {
  switch (sprite.data[0]) {
    case 0:
      if (--sprite.data[1] === 0) {
        if (sprite.data[2] === 0) destroyAnimSprite(sprite);
        else ++sprite.data[0];
      }
      break;
    case 1:
      if (++sprite.data[1] > 1) {
        sprite.data[1] = 0;
        ++sprite.data[3];
        if (sprite.data[3] & 1) sprite.x2 = 2;
        else sprite.x2 = -2;
      }
      if (--sprite.data[2] === 0) destroyAnimSprite(sprite);
      break;
  }
}

export function AnimBrickBreakWallShard(runtime: FightRuntime, sprite: FightSprite): void {
  if (runtime.battleAnimArgs[0] === ANIM_ATTACKER) {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x') + runtime.battleAnimArgs[2];
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'y') + runtime.battleAnimArgs[3];
  } else {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x') + runtime.battleAnimArgs[2];
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'y') + runtime.battleAnimArgs[3];
  }
  sprite.oam.tileNum += runtime.battleAnimArgs[1] * 16;
  sprite.data[0] = 0;
  switch (runtime.battleAnimArgs[1]) {
    case 0:
      sprite.data[6] = -3;
      sprite.data[7] = -3;
      break;
    case 1:
      sprite.data[6] = 3;
      sprite.data[7] = -3;
      break;
    case 2:
      sprite.data[6] = -3;
      sprite.data[7] = 3;
      break;
    case 3:
      sprite.data[6] = 3;
      sprite.data[7] = 3;
      break;
    default:
      destroyAnimSprite(sprite);
      return;
  }
  sprite.callback = 'AnimBrickBreakWallShard_Step';
}

export function AnimBrickBreakWallShard_Step(sprite: FightSprite): void {
  sprite.x += sprite.data[6];
  sprite.y += sprite.data[7];
  if (++sprite.data[0] > 40) destroyAnimSprite(sprite);
}

export function AnimSuperpowerOrb(runtime: FightRuntime, sprite: FightSprite): void {
  if (runtime.battleAnimArgs[0] === 0) {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battlerAttacker, 'x2');
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battlerAttacker, 'yPicOffset');
    sprite.oam.priority = getBattlerSpriteBgPriority(runtime, runtime.battleAnimAttacker);
    sprite.data[7] = runtime.battleAnimTarget;
  } else {
    sprite.oam.priority = getBattlerSpriteBgPriority(runtime, runtime.battleAnimTarget);
    sprite.data[7] = runtime.battleAnimAttacker;
  }
  sprite.data[0] = 0;
  sprite.data[1] = 12;
  sprite.data[2] = 8;
  sprite.callback = 'AnimSuperpowerOrb_Step';
}

export function AnimSuperpowerOrb_Step(runtime: FightRuntime, sprite: FightSprite): void {
  if (++sprite.data[0] === 180) {
    setGpuReg(runtime, 'REG_OFFSET_BLDCNT', 0);
    sprite.data[0] = 16;
    sprite.data[1] = sprite.x;
    sprite.data[2] = getBattlerSpriteCoord(runtime, sprite.data[7], 'x2');
    sprite.data[3] = sprite.y;
    sprite.data[4] = getBattlerSpriteCoord(runtime, sprite.data[7], 'yPicOffset');
    initAnimLinearTranslation(sprite);
    storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
    sprite.callback = 'AnimTranslateLinear_WithFollowup';
  }
}

export function AnimSuperpowerRock(runtime: FightRuntime, sprite: FightSprite): void {
  sprite.x = runtime.battleAnimArgs[0];
  sprite.y = 120;
  sprite.data[0] = runtime.battleAnimArgs[3];
  storeFixedPointInData45(sprite, sprite.y << 8);
  sprite.data[6] = runtime.battleAnimArgs[1];
  sprite.oam.tileNum += runtime.battleAnimArgs[2] * 4;
  sprite.callback = 'AnimSuperpowerRock_Step1';
}

export function AnimSuperpowerRock_Step1(runtime: FightRuntime, sprite: FightSprite): void {
  if (sprite.data[0] !== 0) {
    let var0 = loadFixedPointFromData45(sprite);
    var0 -= sprite.data[6];
    storeFixedPointInData45(sprite, var0);
    sprite.y = var0 >> 8;
    if (sprite.y < -8) destroyAnimSprite(sprite);
    else --sprite.data[0];
  } else {
    const pos0 = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
    const pos1 = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
    const pos2 = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
    const pos3 = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
    sprite.data[0] = pos2 - pos0;
    sprite.data[1] = pos3 - pos1;
    sprite.data[2] = sprite.x << 4;
    sprite.data[3] = sprite.y << 4;
    sprite.callback = 'AnimSuperpowerRock_Step2';
  }
}

export function AnimSuperpowerRock_Step2(sprite: FightSprite): void {
  sprite.data[2] += sprite.data[0];
  sprite.data[3] += sprite.data[1];
  sprite.x = sprite.data[2] >> 4;
  sprite.y = sprite.data[3] >> 4;
  const edgeX = sprite.x + 8;
  if (edgeX > 256 || sprite.y < -8 || sprite.y > 120) destroyAnimSprite(sprite);
}

export function AnimSuperpowerFireball(runtime: FightRuntime, sprite: FightSprite): void {
  let battler: number;
  if (runtime.battleAnimArgs[0] === ANIM_ATTACKER) {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battlerAttacker, 'x2');
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battlerAttacker, 'yPicOffset');
    battler = runtime.battleAnimTarget;
    sprite.oam.priority = getBattlerSpriteBgPriority(runtime, runtime.battleAnimAttacker);
  } else {
    battler = runtime.battleAnimAttacker;
    sprite.oam.priority = getBattlerSpriteBgPriority(runtime, runtime.battleAnimTarget);
  }
  if (isContest(runtime)) sprite.oam.matrixNum |= ST_OAM_HFLIP;
  else if (getBattlerSide(runtime, battler) === B_SIDE_PLAYER) sprite.oam.matrixNum |= ST_OAM_HFLIP | ST_OAM_VFLIP;
  sprite.data[0] = 16;
  sprite.data[1] = sprite.x;
  sprite.data[2] = getBattlerSpriteCoord(runtime, battler, 'x2');
  sprite.data[3] = sprite.y;
  sprite.data[4] = getBattlerSpriteCoord(runtime, battler, 'yPicOffset');
  initAnimLinearTranslation(sprite);
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
  sprite.callback = 'AnimTranslateLinear_WithFollowup';
}

export function AnimArmThrustHit_Step(sprite: FightSprite): void {
  if (sprite.data[0] === sprite.data[4]) destroyAnimSprite(sprite);
  ++sprite.data[0];
}

export function AnimArmThrustHit(runtime: FightRuntime, sprite: FightSprite): void {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  sprite.data[1] = runtime.battleAnimArgs[3];
  sprite.data[2] = runtime.battleAnimArgs[0];
  sprite.data[3] = runtime.battleAnimArgs[1];
  sprite.data[4] = runtime.battleAnimArgs[2];
  let turn = runtime.animMoveTurn;
  if (getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER) ++turn;
  if (turn & 1) {
    sprite.data[2] = -sprite.data[2];
    ++sprite.data[1];
  }
  startSpriteAnim(sprite, sprite.data[1]);
  sprite.x2 = sprite.data[2];
  sprite.y2 = sprite.data[3];
  sprite.callback = 'AnimArmThrustHit_Step';
}

export function AnimRevengeScratch(runtime: FightRuntime, sprite: FightSprite): void {
  if (runtime.battleAnimArgs[2] === ANIM_ATTACKER) initSpritePosToAnimAttacker(runtime, sprite, false);
  else initSpritePosToAnimTarget(runtime, sprite, false);
  if (isContest(runtime)) startSpriteAnim(sprite, 2);
  else if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) startSpriteAnim(sprite, 1);
  sprite.callback = 'RunStoredCallbackWhenAnimEnds';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimFocusPunchFist(sprite: FightSprite): void {
  if (sprite.affineAnimEnded) {
    sprite.data[1] = (sprite.data[1] + 40) & 0xff;
    sprite.x2 = sin(sprite.data[1], 2);
    if (++sprite.data[0] > 40) destroyAnimSprite(sprite);
  }
}

export function AnimTask_MoveSkyUppercutBg(runtime: FightRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (!task) return;
  switch (task.data[0]) {
    case 0:
      toggleBg3Mode(runtime, 0);
      task.data[8] = runtime.battleAnimArgs[0];
      ++task.data[0];
      break;
    case 1:
      if (--task.data[8] === -1) ++task.data[0];
      break;
    case 2:
    default:
      task.data[9] += 1280;
      break;
  }
  task.data[10] += 2816;
  if (getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER) runtime.battleBg3X += task.data[9] >> 8;
  else runtime.battleBg3X -= task.data[9] >> 8;
  runtime.battleBg3Y += task.data[10] >> 8;
  task.data[9] &= 0xff;
  task.data[10] &= 0xff;
  if (runtime.battleAnimArgs[7] === -1) {
    runtime.battleBg3X = 0;
    runtime.battleBg3Y = 0;
    toggleBg3Mode(runtime, 1);
    destroyAnimVisualTask(runtime, taskId);
  }
}

export const animUnusedHumanoidFoot = AnimUnusedHumanoidFoot;
export const animSlideHandOrFootToTarget = AnimSlideHandOrFootToTarget;
export const animJumpKick = AnimJumpKick;
export const animBasicFistOrFoot = AnimBasicFistOrFoot;
export const animFistOrFootRandomPos = AnimFistOrFootRandomPos;
export const animFistOrFootRandomPosStep = AnimFistOrFootRandomPos_Step;
export const animCrossChopHand = AnimCrossChopHand;
export const animCrossChopHandStep = AnimCrossChopHand_Step;
export const animSlidingKick = AnimSlidingKick;
export const animSlidingKickStep = AnimSlidingKick_Step;
export const animSpinningKickOrPunch = AnimSpinningKickOrPunch;
export const animSpinningKickOrPunchFinish = AnimSpinningKickOrPunchFinish;
export const animStompFoot = AnimStompFoot;
export const animStompFootStep = AnimStompFootStep;
export const animStompFootEnd = AnimStompFootEnd;
export const animDizzyPunchDuck = AnimDizzyPunchDuck;
export const animBrickBreakWall = AnimBrickBreakWall;
export const animBrickBreakWallStep = AnimBrickBreakWall_Step;
export const animBrickBreakWallShard = AnimBrickBreakWallShard;
export const animBrickBreakWallShardStep = AnimBrickBreakWallShard_Step;
export const animSuperpowerOrb = AnimSuperpowerOrb;
export const animSuperpowerOrbStep = AnimSuperpowerOrb_Step;
export const animSuperpowerRock = AnimSuperpowerRock;
export const animSuperpowerRockStep1 = AnimSuperpowerRock_Step1;
export const animSuperpowerRockStep2 = AnimSuperpowerRock_Step2;
export const animSuperpowerFireball = AnimSuperpowerFireball;
export const animArmThrustHitStep = AnimArmThrustHit_Step;
export const animArmThrustHit = AnimArmThrustHit;
export const animRevengeScratch = AnimRevengeScratch;
export const animFocusPunchFist = AnimFocusPunchFist;
export const animTaskMoveSkyUppercutBg = AnimTask_MoveSkyUppercutBg;

const getBattlerSide = (runtime: FightRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const getBattlerPosition = (runtime: FightRuntime, battler: number): number => runtime.battlerPositions[battler] ?? 0;
const getBattlerSpriteCoord = (runtime: FightRuntime, battler: number, coord: 'x' | 'y' | 'x2' | 'yPicOffset'): number =>
  runtime.battlerCoords[battler]?.[coord] ?? 0;
const getBattlerSpriteCoordAttr = (runtime: FightRuntime, battler: number, attr: 'width' | 'height'): number =>
  runtime.battlerCoords[battler]?.[attr] ?? 1;
const getBattlerSpriteBgPriority = (runtime: FightRuntime, battler: number): number => runtime.battlerBgPriorities[battler] ?? 0;
const battlePartner = (battler: number): number => battler ^ BIT_FLANK;
const isContest = (runtime: FightRuntime): boolean => runtime.contest;
const random = (runtime: FightRuntime): number => runtime.randomValues.shift() ?? 0;
const startSpriteAnim = (sprite: FightSprite, animIndex: number): void => {
  sprite.animIndex = animIndex;
};
const startSpriteAffineAnim = (sprite: FightSprite, animIndex: number): void => {
  sprite.affineAnimIndex = animIndex;
};
const setAnimSpriteInitialXOffset = (runtime: FightRuntime, sprite: FightSprite, xOffset: number): void => {
  const signedOffset = getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER ? -xOffset : xOffset;
  sprite.x += signedOffset;
};
const initSpritePosToAnimAttacker = (runtime: FightRuntime, sprite: FightSprite, respectSide: boolean): void => {
  const xOffset = respectSide && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER
    ? -runtime.battleAnimArgs[0]
    : runtime.battleAnimArgs[0];
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') + xOffset;
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset') + runtime.battleAnimArgs[1];
};
const initSpritePosToAnimTarget = (runtime: FightRuntime, sprite: FightSprite, respectSide: boolean): void => {
  const xOffset = respectSide && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER
    ? -runtime.battleAnimArgs[0]
    : runtime.battleAnimArgs[0];
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + xOffset;
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[1];
};
const animTravelDiagonally = (sprite: FightSprite): void => {
  sprite.callback = 'StartAnimLinearTranslation';
};
const initAnimLinearTranslation = (_sprite: FightSprite): void => {};
const animTranslateLinear = (sprite: FightSprite): boolean => {
  if (sprite.data[0] > 0) --sprite.data[0];
  return sprite.data[0] === 0;
};
const storeSpriteCallbackInData6 = (sprite: FightSprite, callback: FightCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const createSprite = (runtime: FightRuntime, templateName: string, x: number, y: number, subpriority: number): number => {
  const id = runtime.sprites.findIndex((sprite, index) => index >= 4 && sprite.templateName === null && !sprite.destroyed);
  if (id < 0) return MAX_SPRITES;
  runtime.sprites[id] = createFightSprite();
  runtime.sprites[id].x = x;
  runtime.sprites[id].y = y;
  runtime.sprites[id].subpriority = subpriority;
  runtime.sprites[id].templateName = templateName;
  runtime.operations.push(`CreateSprite:${templateName}:${x}:${y}:${subpriority}:${id}`);
  return id;
};
const destroyAnimSprite = (sprite: FightSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const destroySprite = destroyAnimSprite;
const freeOamMatrix = (runtime: FightRuntime, matrixNum: number): void => {
  runtime.operations.push(`FreeOamMatrix:${matrixNum}`);
};
const setGpuReg = (runtime: FightRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value & 0xffff;
};
const storeFixedPointInData45 = (sprite: FightSprite, value: number): void => {
  sprite.data[4] = value;
  sprite.data[5] = 0;
};
const loadFixedPointFromData45 = (sprite: FightSprite): number => sprite.data[4];
const toggleBg3Mode = (runtime: FightRuntime, mode: number): void => {
  runtime.bg3Mode = mode;
  runtime.operations.push(`ToggleBg3Mode:${mode}`);
};
const destroyAnimVisualTask = (runtime: FightRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    runtime.operations.push(`DestroyAnimVisualTask:${taskId}`);
  }
};
