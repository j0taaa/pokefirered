import { cos, gSineTable, sin } from './decompTrig';

export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const ANIM_ATTACKER = 0;
export const ANIM_TARGET = 1;
export const ANIM_DEF_PARTNER = 2;
export const MAX_SPRITES = 64;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const NUM_TASKS = 16;

export type WaterCallback =
  | 'AnimRainDrop'
  | 'AnimRainDrop_Step'
  | 'AnimWaterBubbleProjectile'
  | 'AnimWaterBubbleProjectile_Step1'
  | 'AnimWaterBubbleProjectile_Step2'
  | 'AnimWaterBubbleProjectile_Step3'
  | 'AnimAuroraBeamRings'
  | 'AnimAuroraBeamRings_Step'
  | 'AnimToTargetInSinWave'
  | 'AnimToTargetInSinWave_Step'
  | 'AnimHydroCannonCharge'
  | 'AnimHydroCannonCharge_Step'
  | 'AnimHydroCannonBeam'
  | 'AnimWaterGunDroplet'
  | 'AnimSmallBubblePair'
  | 'AnimSmallBubblePair_Step'
  | 'AnimSmallDriftingBubbles'
  | 'AnimSmallDriftingBubbles_Step'
  | 'AnimSmallWaterOrb'
  | 'AnimWaterSpoutRain'
  | 'AnimWaterSpoutRainHit'
  | 'AnimWaterSportDroplet'
  | 'AnimWaterSportDroplet_Step'
  | 'AnimWaterPulseBubble'
  | 'AnimWaterPulseBubble_Step'
  | 'AnimWaterPulseRingBubble'
  | 'AnimWaterPulseRing'
  | 'AnimWaterPulseRing_Step'
  | 'AnimWeatherBallDown'
  | 'AnimThrowProjectile'
  | 'TranslateAnimSpriteToTargetMonLocation'
  | 'StartAnimLinearTranslation'
  | 'RunStoredCallbackWhenAnimEnds'
  | 'WaitAnimForDuration'
  | 'DestroyAnimSprite'
  | 'DestroySpriteAndMatrix'
  | 'SpriteCallbackDummy';

export type WaterTaskFunc =
  | 'AnimTask_RotateAuroraRingColors_Step'
  | 'AnimTask_RunSinAnimTimer'
  | 'AnimTask_CreateSurfWave_Step1'
  | 'AnimTask_CreateSurfWave_Step2'
  | 'AnimTask_SurfWaveScanlineEffect'
  | 'AnimTask_WaterSpoutLaunch_Step'
  | 'AnimTask_WaterSpoutRain_Step'
  | 'AnimTask_WaterSport_Step'
  | 'AnimTask_HorizontalShake'
  | 'DestroyAnimVisualTask';

export interface WaterSpriteTemplate {
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: readonly unknown[] | string;
  images: null;
  affineAnims: readonly unknown[] | string;
  callback: WaterCallback;
}

export interface WaterSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  callback: WaterCallback;
  storedCallback: WaterCallback | null;
  invisible: boolean;
  destroyed: boolean;
  animEnded: boolean;
  affineAnimEnded: boolean;
  animPaused: boolean;
  affineAnimPaused: boolean;
  animNum: number;
  affineAnimNum: number;
  subpriority: number;
  oam: { priority: number; matrixNum: number; affineMode: number; tileNum: number };
}

export interface WaterTask {
  data: number[];
  func: WaterTaskFunc;
  destroyed: boolean;
  priority: number;
}

export interface WaterRuntime {
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  contest: boolean;
  animVisualTaskCount: number;
  battlerSides: Record<number, number>;
  battlerPositions: Record<number, number>;
  battlerSpriteIds: Record<number, number>;
  battlerSubpriority: Record<number, number>;
  battlerPartyIndexes: Record<number, number>;
  playerParty: Array<{ hp: number; maxHp: number }>;
  enemyParty: Array<{ hp: number; maxHp: number }>;
  battlerCoords: Record<number, { x: number; y: number; x2: number; yPicOffset: number }>;
  sprites: WaterSprite[];
  tasks: Array<WaterTask | null>;
  registers: Record<string, number>;
  plttBufferFaded: number[];
  paletteTagIndexes: Record<string, number>;
  randomValues: number[];
  battleBg1X: number;
  battleBg1Y: number;
  scanlineBuffers: number[][];
  scanlineSrcBuffer: number;
  operations: string[];
}

const frame = (tileOffset: number, duration: number) => ({ tileOffset, duration });
const affineFrame = (xScale: number, yScale: number, rotation: number, duration: number) => ({ xScale, yScale, rotation, duration });
const template = (tileTag: string, oam: string, anims: readonly unknown[] | string, affineAnims: readonly unknown[] | string, callback: WaterCallback): WaterSpriteTemplate => ({ tileTag, paletteTag: tileTag, oam, anims, images: null, affineAnims, callback });

export const sAnimRainDrop = [frame(0, 2), frame(8, 2), frame(16, 2), frame(24, 6), frame(32, 2), frame(40, 2), frame(48, 2), { end: true }] as const;
export const sAnimsRainDrop = [sAnimRainDrop] as const;
export const gRainDropSpriteTemplate = template('ANIM_TAG_RAIN_DROPS', 'gOamData_AffineOff_ObjNormal_16x32', sAnimsRainDrop, 'gDummySpriteAffineAnimTable', 'AnimRainDrop');
export const sAffineAnimsWaterBubbleProjectile = [[affineFrame(-5, -5, 0, 10), affineFrame(5, 5, 0, 10), { jump: 0 }]] as const;
export const sAnimsWaterBubbleProjectile = [[frame(0, 1), frame(4, 5), frame(8, 5), { end: true }]] as const;
export const gWaterBubbleProjectileSpriteTemplate = template('ANIM_TAG_BUBBLE', 'gOamData_AffineNormal_ObjBlend_16x16', sAnimsWaterBubbleProjectile, sAffineAnimsWaterBubbleProjectile, 'AnimWaterBubbleProjectile');
export const sAnimsAuroraBeamRing = [[frame(0, 1), { end: true }], [frame(4, 1), { end: true }]] as const;
export const sAffineAnimsAuroraBeamRing = [[affineFrame(0, 0, 0, 1), affineFrame(0x60, 0x60, 0, 1), { end: true }]] as const;
export const gAuroraBeamRingSpriteTemplate = template('ANIM_TAG_RAINBOW_RINGS', 'gOamData_AffineDouble_ObjNormal_8x16', sAnimsAuroraBeamRing, sAffineAnimsAuroraBeamRing, 'AnimAuroraBeamRings');
export const gAnimsWaterMudOrb = [[frame(0, 1), frame(4, 1), frame(8, 1), frame(12, 1), { jump: 0 }]] as const;
export const gHydroPumpOrbSpriteTemplate = template('ANIM_TAG_WATER_ORB', 'gOamData_AffineOff_ObjBlend_16x16', gAnimsWaterMudOrb, 'gDummySpriteAffineAnimTable', 'AnimToTargetInSinWave');
export const gMudShotOrbSpriteTemplate = template('ANIM_TAG_BROWN_ORB', 'gOamData_AffineOff_ObjBlend_16x16', gAnimsWaterMudOrb, 'gDummySpriteAffineAnimTable', 'AnimToTargetInSinWave');
export const gSignalBeamRedOrbSpriteTemplate = template('ANIM_TAG_GLOWY_RED_ORB', 'gOamData_AffineOff_ObjNormal_8x8', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimToTargetInSinWave');
export const gSignalBeamGreenOrbSpriteTemplate = template('ANIM_TAG_GLOWY_GREEN_ORB', 'gOamData_AffineOff_ObjNormal_8x8', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimToTargetInSinWave');
export const sAnimsFlamethrowerFlame = [[frame(16, 2), frame(32, 2), frame(48, 2), { jump: 0 }]] as const;
export const gFlamethrowerFlameSpriteTemplate = template('ANIM_TAG_SMALL_EMBER', 'gOamData_AffineOff_ObjNormal_32x32', sAnimsFlamethrowerFlame, 'gDummySpriteAffineAnimTable', 'AnimToTargetInSinWave');
export const gPsywaveRingSpriteTemplate = template('ANIM_TAG_BLUE_RING', 'gOamData_AffineDouble_ObjNormal_16x32', 'gDummySpriteAnimTable', 'gGrowingRingAffineAnimTable', 'AnimToTargetInSinWave');
export const sAffineAnimsHydroCannonCharge = [[affineFrame(3, 3, 10, 50), affineFrame(0, 0, 0, 10), affineFrame(-0x14, -0x14, -10, 20), { end: true }]] as const;
export const sAffineAnimsHydroCannonBeam = [[affineFrame(0x150, 0x150, 0, 0), { end: true }]] as const;
export const gHydroCannonChargeSpriteTemplate = template('ANIM_TAG_WATER_ORB', 'gOamData_AffineDouble_ObjBlend_16x16', gAnimsWaterMudOrb, sAffineAnimsHydroCannonCharge, 'AnimHydroCannonCharge');
export const gHydroCannonBeamSpriteTemplate = template('ANIM_TAG_WATER_ORB', 'gOamData_AffineDouble_ObjBlend_16x16', gAnimsWaterMudOrb, sAffineAnimsHydroCannonBeam, 'AnimHydroCannonBeam');
export const gAnimsWaterBubble = [[frame(0, 1), { end: true }]] as const;
export const sAnimsWaterGunDroplet = [[frame(4, 1), { end: true }]] as const;
export const gWaterGunProjectileSpriteTemplate = template('ANIM_TAG_SMALL_BUBBLES', 'gOamData_AffineOff_ObjBlend_16x16', gAnimsWaterBubble, 'gDummySpriteAffineAnimTable', 'AnimThrowProjectile');
export const gWaterGunDropletSpriteTemplate = template('ANIM_TAG_SMALL_BUBBLES', 'gOamData_AffineDouble_ObjBlend_16x16', sAnimsWaterGunDroplet, 'gAffineAnims_Droplet', 'AnimWaterGunDroplet');
export const gSmallBubblePairSpriteTemplate = template('ANIM_TAG_ICE_CRYSTALS', 'gOamData_AffineOff_ObjNormal_8x8', 'gAnims_SmallBubblePair', 'gDummySpriteAffineAnimTable', 'AnimSmallBubblePair');
export const gSmallDriftingBubblesSpriteTemplate = template('ANIM_TAG_SMALL_BUBBLES', 'gOamData_AffineOff_ObjNormal_8x8', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimSmallDriftingBubbles');
export const gSmallWaterOrbSpriteTemplate = template('ANIM_TAG_GLOWY_BLUE_ORB', 'gOamData_AffineOff_ObjNormal_8x8', 'gDummySpriteAnimTable', 'gDummySpriteAffineAnimTable', 'AnimSmallWaterOrb');
export const sAnimsWaterPulseBubble = [[frame(8, 1), { end: true }], [frame(9, 1), { end: true }]] as const;
export const sAnimsWeatherBallWaterDown = [[frame(4, 1), { end: true }]] as const;
export const sAffineAnimsWaterPulseRingBubble = [[affineFrame(0x100, 0x100, 0, 0), affineFrame(-0x0a, -0x0a, 0, 15), { end: true }], [affineFrame(0xe0, 0xe0, 0, 0), affineFrame(-8, -8, 0, 15), { end: true }]] as const;
export const sAffineAnimsWeatherBallWaterDown = [[affineFrame(0x150, 0x150, 0, 0), affineFrame(0, 0, 0, 15), { end: true }]] as const;
export const gWaterPulseBubbleSpriteTemplate = template('ANIM_TAG_SMALL_BUBBLES', 'gOamData_AffineOff_ObjNormal_8x8', sAnimsWaterPulseBubble, 'gDummySpriteAffineAnimTable', 'AnimWaterPulseBubble');
export const gWaterPulseRingBubbleSpriteTemplate = template('ANIM_TAG_SMALL_BUBBLES', 'gOamData_AffineNormal_ObjNormal_8x8', sAnimsWaterPulseBubble, sAffineAnimsWaterPulseRingBubble, 'AnimWaterPulseRingBubble');
export const gWeatherBallWaterDownSpriteTemplate = template('ANIM_TAG_SMALL_BUBBLES', 'gOamData_AffineNormal_ObjNormal_16x16', sAnimsWeatherBallWaterDown, sAffineAnimsWeatherBallWaterDown, 'AnimWeatherBallDown');

export const createWaterSprite = (): WaterSprite => ({
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
  animPaused: false,
  affineAnimPaused: false,
  animNum: 0,
  affineAnimNum: 0,
  subpriority: 0,
  oam: { priority: 0, matrixNum: 0, affineMode: 0, tileNum: 0 }
});

export const createWaterRuntime = (overrides: Partial<WaterRuntime> = {}): WaterRuntime => ({
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 16 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  contest: overrides.contest ?? false,
  animVisualTaskCount: overrides.animVisualTaskCount ?? 0,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerPositions: overrides.battlerPositions ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerSpriteIds: overrides.battlerSpriteIds ?? { 0: 0, 1: 1, 2: 2, 3: 3 },
  battlerSubpriority: overrides.battlerSubpriority ?? { 0: 4, 1: 5, 2: 4, 3: 5 },
  battlerPartyIndexes: overrides.battlerPartyIndexes ?? { 0: 0, 1: 0, 2: 1, 3: 1 },
  playerParty: overrides.playerParty ?? [{ hp: 100, maxHp: 100 }],
  enemyParty: overrides.enemyParty ?? [{ hp: 100, maxHp: 100 }],
  battlerCoords: overrides.battlerCoords ?? {
    0: { x: 48, y: 72, x2: 48, yPicOffset: 64 },
    1: { x: 176, y: 48, x2: 176, yPicOffset: 48 },
    2: { x: 80, y: 80, x2: 80, yPicOffset: 72 },
    3: { x: 144, y: 40, x2: 144, yPicOffset: 40 }
  },
  sprites: overrides.sprites ?? Array.from({ length: MAX_SPRITES }, () => createWaterSprite()),
  tasks: overrides.tasks ?? [],
  registers: overrides.registers ?? {},
  plttBufferFaded: overrides.plttBufferFaded ?? Array.from({ length: 512 }, (_, i) => i),
  paletteTagIndexes: overrides.paletteTagIndexes ?? { ANIM_TAG_RAINBOW_RINGS: 3 },
  randomValues: overrides.randomValues ?? [0],
  battleBg1X: overrides.battleBg1X ?? 0,
  battleBg1Y: overrides.battleBg1Y ?? 0,
  scanlineBuffers: overrides.scanlineBuffers ?? [Array.from({ length: 161 }, () => 0), Array.from({ length: 161 }, () => 0)],
  scanlineSrcBuffer: overrides.scanlineSrcBuffer ?? 0,
  operations: overrides.operations ?? []
});

export const createWaterTask = (runtime: WaterRuntime, func: WaterTaskFunc = 'DestroyAnimVisualTask'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array.from({ length: 16 }, () => 0), func, destroyed: false, priority: 0 });
  return id;
};

export function AnimTask_CreateRaindrops(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[0] === 0) {
    task.data[1] = runtime.battleAnimArgs[0];
    task.data[2] = runtime.battleAnimArgs[1];
    task.data[3] = runtime.battleAnimArgs[2];
  }
  task.data[0]++;
  if (task.data[0] % task.data[2] === 1) createSprite(runtime, gRainDropSpriteTemplate, random(runtime) % DISPLAY_WIDTH, random(runtime) % (DISPLAY_HEIGHT / 2), 4);
  if (task.data[0] === task.data[3]) destroyAnimVisualTask(runtime, taskId);
}

export function AnimRainDrop(sprite: WaterSprite): void {
  sprite.callback = 'AnimRainDrop_Step';
}

export function AnimRainDrop_Step(sprite: WaterSprite): void {
  if (++sprite.data[0] < 14) {
    sprite.x2 += 1;
    sprite.y2 += 4;
  }
  if (sprite.animEnded) destroySprite(sprite);
}

export function AnimWaterBubbleProjectile(runtime: WaterRuntime, sprite: WaterSprite): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') - runtime.battleAnimArgs[0];
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset') + runtime.battleAnimArgs[1];
    sprite.animPaused = true;
  } else {
    sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') + runtime.battleAnimArgs[0];
    sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset') + runtime.battleAnimArgs[1];
    sprite.animPaused = true;
  }
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  sprite.data[0] = runtime.battleAnimArgs[6];
  sprite.data[1] = sprite.x;
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  sprite.data[3] = sprite.y;
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  initAnimLinearTranslation(sprite);
  const spriteId = createInvisibleSpriteWithCallback(runtime, 'SpriteCallbackDummy');
  sprite.data[5] = spriteId;
  sprite.x -= sin(runtime.battleAnimArgs[4] & 0xff, runtime.battleAnimArgs[2]);
  sprite.y -= cos(runtime.battleAnimArgs[4] & 0xff, runtime.battleAnimArgs[3]);
  runtime.sprites[spriteId].data[0] = runtime.battleAnimArgs[2];
  runtime.sprites[spriteId].data[1] = runtime.battleAnimArgs[3];
  runtime.sprites[spriteId].data[2] = runtime.battleAnimArgs[5];
  runtime.sprites[spriteId].data[3] = (runtime.battleAnimArgs[4] & 0xff) * 256;
  runtime.sprites[spriteId].data[4] = runtime.battleAnimArgs[6];
  sprite.callback = 'AnimWaterBubbleProjectile_Step1';
  animWaterBubbleProjectileStep1(runtime, sprite);
}

export function AnimWaterBubbleProjectile_Step1(runtime: WaterRuntime, sprite: WaterSprite): void {
  const other = runtime.sprites[sprite.data[5]];
  let timer = other.data[4];
  const trigIndex = other.data[3];
  sprite.data[0] = 1;
  animTranslateLinear(sprite);
  sprite.x2 += sin(trigIndex >> 8, other.data[0]);
  sprite.y2 += cos(trigIndex >> 8, other.data[1]);
  other.data[3] = trigIndex + other.data[2];
  if (--timer !== 0) other.data[4] = timer;
  else {
    sprite.callback = 'AnimWaterBubbleProjectile_Step2';
    destroySprite(other);
  }
}

export function AnimWaterBubbleProjectile_Step2(sprite: WaterSprite): void {
  sprite.animPaused = false;
  sprite.callback = 'RunStoredCallbackWhenAnimEnds';
  storeSpriteCallbackInData6(sprite, 'AnimWaterBubbleProjectile_Step3');
}

export function AnimWaterBubbleProjectile_Step3(sprite: WaterSprite): void {
  sprite.data[0] = 10;
  sprite.callback = 'WaitAnimForDuration';
  storeSpriteCallbackInData6(sprite, 'DestroySpriteAndMatrix');
}

export function AnimAuroraBeamRings(runtime: WaterRuntime, sprite: WaterSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite);
  const unkArg = getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER ? -runtime.battleAnimArgs[2] : runtime.battleAnimArgs[2];
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[1] = sprite.x;
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + unkArg;
  sprite.data[3] = sprite.y;
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[3];
  initAnimLinearTranslation(sprite);
  sprite.callback = 'AnimAuroraBeamRings_Step';
  sprite.affineAnimPaused = true;
  animAuroraBeamRingsStep(runtime, sprite);
}

export function AnimAuroraBeamRings_Step(runtime: WaterRuntime, sprite: WaterSprite): void {
  if ((runtime.battleAnimArgs[7] & 0xffff) === 0xffff) {
    startSpriteAnim(sprite, 1);
    sprite.affineAnimPaused = false;
  }
  if (animTranslateLinear(sprite)) destroyAnimSprite(sprite);
}

export function AnimTask_RotateAuroraRingColors(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[0];
  task.data[2] = objPlttId(indexOfSpritePaletteTag(runtime, 'ANIM_TAG_RAINBOW_RINGS'));
  task.func = 'AnimTask_RotateAuroraRingColors_Step';
}

export function AnimTask_RotateAuroraRingColors_Step(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (++task.data[10] === 3) {
    task.data[10] = 0;
    const palIndex = task.data[2] + 1;
    const temp = runtime.plttBufferFaded[palIndex];
    for (let i = 1; i < 8; i++) runtime.plttBufferFaded[palIndex + i - 1] = runtime.plttBufferFaded[palIndex + i];
    runtime.plttBufferFaded[palIndex + 7] = temp;
  }
  if (++task.data[11] === task.data[0]) destroyAnimVisualTask(runtime, taskId);
}

export function AnimToTargetInSinWave(runtime: WaterRuntime, sprite: WaterSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[0] = 30;
  sprite.data[1] = sprite.x;
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  sprite.data[3] = sprite.y;
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  initAnimLinearTranslation(sprite);
  sprite.data[5] = div(0xd200, sprite.data[0]);
  sprite.data[7] = runtime.battleAnimArgs[3];
  const retArg = runtime.battleAnimArgs[7];
  if (runtime.battleAnimArgs[7] > 127) {
    sprite.data[6] = (retArg - 127) * 256;
    sprite.data[7] = -sprite.data[7];
  } else {
    sprite.data[6] = retArg * 256;
  }
  sprite.callback = 'AnimToTargetInSinWave_Step';
  animToTargetInSinWaveStep(sprite);
}

export function AnimToTargetInSinWave_Step(sprite: WaterSprite): void {
  if (animTranslateLinear(sprite)) destroyAnimSprite(sprite);
  sprite.y2 += sin(sprite.data[6] >> 8, sprite.data[7]);
  if ((sprite.data[6] + sprite.data[5]) >> 8 > 127) {
    sprite.data[6] = 0;
    sprite.data[7] = -sprite.data[7];
  } else {
    sprite.data[6] += sprite.data[5];
  }
}

export function AnimTask_StartSinAnimTimer(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[0] = runtime.battleAnimArgs[0];
  runtime.battleAnimArgs[7] = 0;
  task.func = 'AnimTask_RunSinAnimTimer';
}

export function AnimTask_RunSinAnimTimer(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  runtime.battleAnimArgs[7] = (runtime.battleAnimArgs[7] + 3) & 0xff;
  if (--task.data[0] === 0) destroyAnimVisualTask(runtime, taskId);
}

export function AnimHydroCannonCharge(runtime: WaterRuntime, sprite: WaterSprite): void {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'y');
  sprite.y2 = -10;
  const priority = getBattlerSpriteSubpriority(runtime, runtime.battleAnimAttacker);
  if (!runtime.contest) {
    if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER) {
      sprite.x2 = 10;
      sprite.subpriority = priority + 2;
    } else {
      sprite.x2 = -10;
      sprite.subpriority = priority - 2;
    }
  } else {
    sprite.x2 = -10;
    sprite.subpriority = priority + 2;
  }
  sprite.callback = 'AnimHydroCannonCharge_Step';
}

export function AnimHydroCannonCharge_Step(sprite: WaterSprite): void {
  if (sprite.affineAnimEnded) destroyAnimSprite(sprite);
}

export function AnimHydroCannonBeam(runtime: WaterRuntime, sprite: WaterSprite): void {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) === getBattlerSide(runtime, runtime.battleAnimTarget)) {
    runtime.battleAnimArgs[0] *= -1;
    const pos = getBattlerPosition(runtime, runtime.battleAnimAttacker);
    if (pos === 0 || pos === 1) runtime.battleAnimArgs[0] *= -1;
  }
  const animType = (runtime.battleAnimArgs[5] & 0xff00) === 0;
  const coordType: keyof WaterRuntime['battlerCoords'][number] = (runtime.battleAnimArgs[5] & 0xff) === 0 ? 'yPicOffset' : 'y';
  initSpritePosToAnimAttacker(runtime, sprite, animType);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER) runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + runtime.battleAnimArgs[2];
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, coordType) + runtime.battleAnimArgs[3];
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimWaterGunDroplet(runtime: WaterRuntime, sprite: WaterSprite): void {
  initSpritePosToAnimTarget(runtime, sprite);
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[2] = sprite.x + runtime.battleAnimArgs[2];
  sprite.data[4] = sprite.y + runtime.battleAnimArgs[4];
  sprite.callback = 'StartAnimLinearTranslation';
  storeSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
}

export function AnimSmallBubblePair(runtime: WaterRuntime, sprite: WaterSprite): void {
  if (runtime.battleAnimArgs[3] !== ANIM_ATTACKER) initSpritePosToAnimTarget(runtime, sprite);
  else initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[7] = runtime.battleAnimArgs[2];
  sprite.callback = 'AnimSmallBubblePair_Step';
}

export function AnimSmallBubblePair_Step(sprite: WaterSprite): void {
  sprite.data[0] = (sprite.data[0] + 11) & 0xff;
  sprite.x2 = sin(sprite.data[0], 4);
  sprite.data[1] += 48;
  sprite.y2 = -(sprite.data[1] >> 8);
  if (sprite.data[7]-- === 0) destroyAnimSprite(sprite);
}

export function animThrowMistBall(runtime: WaterRuntime, sprite: WaterSprite): void {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  sprite.callback = 'TranslateAnimSpriteToTargetMonLocation';
}

export function AnimTask_CreateSurfWave(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  setGpuReg(runtime, 'BLDCNT', 0x0002 | 0x40 | 0x3f00);
  setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 16));
  setAnimBgAttribute(runtime, 1, 'BG_ANIM_PRIORITY', 1);
  setAnimBgAttribute(runtime, 1, 'BG_ANIM_SCREEN_SIZE', 1);
  runtime.operations.push(runtime.battleAnimArgs[0] === 0 ? 'LoadSurfPalette' : 'LoadMuddyWaterPalette');
  const taskId2 = createWaterTask(runtime, 'AnimTask_SurfWaveScanlineEffect');
  runtime.tasks[taskId2]!.priority = task.priority + 1;
  task.data[15] = taskId2;
  runtime.tasks[taskId2]!.data[1] = 0x1000;
  runtime.tasks[taskId2]!.data[2] = 0x1000;
  if (runtime.contest) {
    runtime.battleBg1X = -80;
    runtime.battleBg1Y = -48;
    task.data[0] = 2;
    task.data[1] = 1;
    runtime.tasks[taskId2]!.data[3] = 0;
  } else if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_OPPONENT) {
    runtime.battleBg1X = -224;
    runtime.battleBg1Y = 256;
    task.data[0] = 2;
    task.data[1] = -1;
    runtime.tasks[taskId2]!.data[3] = 1;
  } else {
    runtime.battleBg1X = 0;
    runtime.battleBg1Y = -48;
    task.data[0] = -2;
    task.data[1] = 1;
    runtime.tasks[taskId2]!.data[3] = 0;
  }
  setGpuReg(runtime, 'BG1HOFS', runtime.battleBg1X);
  setGpuReg(runtime, 'BG1VOFS', runtime.battleBg1Y);
  if (runtime.tasks[taskId2]!.data[3] === 0) {
    runtime.tasks[taskId2]!.data[4] = 48;
    runtime.tasks[taskId2]!.data[5] = 112;
  } else {
    runtime.tasks[taskId2]!.data[4] = 0;
    runtime.tasks[taskId2]!.data[5] = 0;
  }
  task.data[6] = 1;
  task.func = 'AnimTask_CreateSurfWave_Step1';
}

export function AnimTask_CreateSurfWave_Step1(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  runtime.battleBg1X += task.data[0];
  runtime.battleBg1Y += task.data[1];
  task.data[2] += task.data[1];
  if (++task.data[5] === 4) {
    const base = 16;
    const rgb = runtime.plttBufferFaded[base + 7];
    for (let i = 6; i !== 0; i--) runtime.plttBufferFaded[base + 1 + i] = runtime.plttBufferFaded[base + 1 + i - 1];
    runtime.plttBufferFaded[base + 1] = rgb;
    task.data[5] = 0;
  }
  if (++task.data[6] > 1) {
    task.data[6] = 0;
    if (++task.data[3] < 14) {
      runtime.tasks[task.data[15]]!.data[1] = task.data[3] | ((16 - task.data[3]) << 8);
      task.data[4]++;
    }
    if (task.data[3] > 54) {
      task.data[4]--;
      runtime.tasks[task.data[15]]!.data[1] = task.data[4] | ((16 - task.data[4]) << 8);
    }
  }
  if (!(runtime.tasks[task.data[15]]!.data[1] & 0x1f)) {
    task.data[0] = runtime.tasks[task.data[15]]!.data[1] & 0x1f;
    task.func = 'AnimTask_CreateSurfWave_Step2';
  }
}

export function AnimTask_CreateSurfWave_Step2(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (task.data[0] === 0) {
    initBattleAnimBg(runtime, 1);
    initBattleAnimBg(runtime, 2);
    task.data[0]++;
  } else {
    if (!runtime.contest) setAnimBgAttribute(runtime, 1, 'BG_ANIM_CHAR_BASE_BLOCK', 0);
    runtime.battleBg1X = 0;
    runtime.battleBg1Y = 0;
    setGpuReg(runtime, 'BLDCNT', 0);
    setGpuReg(runtime, 'BLDALPHA', bldalpha(0, 0));
    runtime.tasks[task.data[15]]!.data[15] = -1;
    destroyAnimVisualTask(runtime, taskId);
  }
}

export function AnimTask_SurfWaveScanlineEffect(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      fillScanline(runtime, task.data[4], task.data[5], task.data[1], task.data[2], 0);
      fillScanline(runtime, task.data[4], task.data[5], task.data[1], task.data[2], 1);
      runtime.operations.push('ScanlineEffect_SetParams:BLDALPHA');
      task.data[0]++;
      break;
    case 1:
      if (task.data[3] === 0) {
        if (--task.data[4] <= 0) {
          task.data[4] = 0;
          task.data[0]++;
        }
      } else if (++task.data[5] > 111) task.data[0]++;
      fillScanline(runtime, task.data[4], task.data[5], task.data[1], task.data[2], runtime.scanlineSrcBuffer);
      break;
    case 2:
      fillScanline(runtime, task.data[4], task.data[5], task.data[1], task.data[2], runtime.scanlineSrcBuffer);
      if (task.data[15] === -1) {
        runtime.operations.push('ScanlineEffect_Stop');
        destroyTask(runtime, taskId);
      }
      break;
  }
}

export function AnimSmallDriftingBubbles(runtime: WaterRuntime, sprite: WaterSprite): void {
  sprite.oam.tileNum += 8;
  initSpritePosToAnimTarget(runtime, sprite);
  const randData = (random(runtime) & 0xff) | 256;
  let randData2 = random(runtime) & 0x1ff;
  if (randData2 > 255) randData2 = 256 - randData2;
  sprite.data[1] = randData;
  sprite.data[2] = randData2;
  sprite.callback = 'AnimSmallDriftingBubbles_Step';
}

export function AnimSmallDriftingBubbles_Step(sprite: WaterSprite): void {
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  sprite.x2 = sprite.data[1] & 1 ? -(sprite.data[3] >> 8) : sprite.data[3] >> 8;
  sprite.y2 = sprite.data[4] >> 8;
  if (++sprite.data[0] === 21) destroyAnimSprite(sprite);
}

export function AnimTask_WaterSpoutLaunch(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[15] = getAnimBattlerSpriteId(runtime, ANIM_ATTACKER);
  task.data[5] = runtime.sprites[task.data[15]].y;
  task.data[1] = getWaterSpoutPowerForAnim(runtime);
  prepareBattlerSpriteForRotScale(runtime, task.data[15], 'ST_OAM_OBJ_NORMAL');
  task.func = 'AnimTask_WaterSpoutLaunch_Step';
}

export function AnimTask_WaterSpoutLaunch_Step(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  const mon = runtime.sprites[task.data[15]];
  switch (task.data[0]) {
    case 0:
      battleAnimHelperSetSpriteSquashParams(task, task.data[15], 0x100, 0x100, 224, 0x200, 32);
      task.data[0]++;
    // fall through
    case 1:
      if (++task.data[3] > 1) {
        task.data[3] = 0;
        if (++task.data[4] & 1) {
          mon.x2 = 3;
          mon.y++;
        } else mon.x2 = -3;
      }
      if (battleAnimHelperRunSpriteSquash(task) === 0) {
        mon.x2 = 0;
        task.data[3] = 0;
        task.data[4] = 0;
        task.data[0]++;
      }
      break;
    case 2:
      if (++task.data[3] > 4) {
        battleAnimHelperSetSpriteSquashParams(task, task.data[15], 224, 0x200, 384, 224, 8);
        task.data[3] = 0;
        task.data[0]++;
      }
      break;
    case 3:
      if (battleAnimHelperRunSpriteSquash(task) === 0) {
        task.data[3] = 0;
        task.data[4] = 0;
        task.data[0]++;
      }
      break;
    case 4:
      createWaterSpoutLaunchDroplets(runtime, task, taskId);
      task.data[0]++;
    // fall through
    case 5:
      if (++task.data[3] > 1) {
        task.data[3] = 0;
        if (++task.data[4] & 1) mon.y2 += 2;
        else mon.y2 -= 2;
        if (task.data[4] === 10) {
          battleAnimHelperSetSpriteSquashParams(task, task.data[15], 384, 224, 0x100, 0x100, 8);
          task.data[3] = 0;
          task.data[4] = 0;
          task.data[0]++;
        }
      }
      break;
    case 6:
      mon.y--;
      if (battleAnimHelperRunSpriteSquash(task) === 0) {
        resetSpriteRotScale(runtime, task.data[15]);
        mon.y = task.data[5];
        task.data[4] = 0;
        task.data[0]++;
      }
      break;
    case 7:
      if (task.data[2] === 0) destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function GetWaterSpoutPowerForAnim(runtime: WaterRuntime): number {
  const partyIndex = runtime.battlerPartyIndexes[runtime.battleAnimAttacker];
  const party = getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER ? runtime.playerParty : runtime.enemyParty;
  const mon = party[partyIndex];
  const quarter = div(mon.maxHp, 4);
  for (let i = 0; i < 3; i++) if (mon.hp < quarter * (i + 1)) return i;
  return 3;
}

export function CreateWaterSpoutLaunchDroplets(runtime: WaterRuntime, task: WaterTask, taskId: number): void {
  const attackerX = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  const attackerY = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  let trigIndex = 172;
  const subpriority = getBattlerSpriteSubpriority(runtime, runtime.battleAnimAttacker) - 1;
  let increment = 4 - task.data[1];
  if (increment <= 0) increment = 1;
  for (let i = 0; i < 20; i += increment) {
    const spriteId = createSprite(runtime, gSmallWaterOrbSpriteTemplate, attackerX, attackerY, subpriority);
    if (spriteId !== MAX_SPRITES) {
      const sprite = runtime.sprites[spriteId];
      sprite.data[1] = i;
      sprite.data[2] = attackerX * 16;
      sprite.data[3] = attackerY * 16;
      sprite.data[4] = cos(trigIndex, 64);
      sprite.data[5] = sin(trigIndex, 64);
      sprite.data[6] = taskId;
      sprite.data[7] = 2;
      if (task.data[2] & 1) animSmallWaterOrb(runtime, sprite);
      task.data[2]++;
    }
    trigIndex = (trigIndex + increment * 2) & 0xff;
  }
}

export function AnimSmallWaterOrb(runtime: WaterRuntime, sprite: WaterSprite): void {
  switch (sprite.data[0]) {
    case 0:
      sprite.data[4] += (sprite.data[1] % 6) * 3;
      sprite.data[5] += (sprite.data[1] % 3) * 3;
      sprite.data[0]++;
    // fall through
    case 1:
      sprite.data[2] += sprite.data[4];
      sprite.data[3] += sprite.data[5];
      sprite.x = sprite.data[2] >> 4;
      sprite.y = sprite.data[3] >> 4;
      if (sprite.x < -8 || sprite.x > 248 || sprite.y < -8 || sprite.y > 120) {
        runtime.tasks[sprite.data[6]]!.data[sprite.data[7]]--;
        destroySprite(sprite);
      }
      break;
  }
}

export function AnimTask_WaterSpoutRain(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[1] = getWaterSpoutPowerForAnim(runtime);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER) {
    task.data[4] = 136;
    task.data[6] = 40;
  } else {
    task.data[4] = 16;
    task.data[6] = 80;
  }
  task.data[5] = 98;
  task.data[7] = task.data[4] + 49;
  task.data[12] = task.data[1] * 5 + 5;
  task.func = 'AnimTask_WaterSpoutRain_Step';
}

export function AnimTask_WaterSpoutRain_Step(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      if (++task.data[2] > 2) {
        task.data[2] = 0;
        createWaterSpoutRainDroplet(runtime, task, taskId);
      }
      if (task.data[10] !== 0 && task.data[13] === 0) {
        runtime.operations.push('CreateTask:AnimTask_HorizontalShake:target');
        runtime.animVisualTaskCount += 2;
        task.data[13] = 1;
      }
      if (task.data[11] >= task.data[12]) task.data[0]++;
      break;
    case 1:
      if (task.data[9] === 0) destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function CreateWaterSpoutRainDroplet(runtime: WaterRuntime, task: WaterTask, taskId: number): void {
  const yPosArg = ((gSineTable[task.data[8]] + 3) >> 4) + task.data[6];
  const spriteId = createSprite(runtime, gSmallWaterOrbSpriteTemplate, task.data[7], 0, 0);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.sprites[spriteId];
    sprite.callback = 'AnimWaterSpoutRain';
    sprite.data[5] = yPosArg;
    sprite.data[6] = taskId;
    sprite.data[7] = 9;
    task.data[9]++;
  }
  task.data[11]++;
  task.data[8] = (task.data[8] + 39) & 0xff;
  task.data[7] = (isoRandomize2(task.data[7]) % task.data[5]) + task.data[4];
}

export function AnimWaterSpoutRain(runtime: WaterRuntime, sprite: WaterSprite): void {
  if (sprite.data[0] === 0) {
    sprite.y += 8;
    if (sprite.y >= sprite.data[5]) {
      runtime.tasks[sprite.data[6]]!.data[10] = 1;
      sprite.data[1] = createSprite(runtime, gWaterGunProjectileSpriteTemplate, sprite.x, sprite.y, 1);
      if (sprite.data[1] !== MAX_SPRITES) {
        startSpriteAffineAnim(runtime.sprites[sprite.data[1]], 3);
        runtime.sprites[sprite.data[1]].data[6] = sprite.data[6];
        runtime.sprites[sprite.data[1]].data[7] = sprite.data[7];
        runtime.sprites[sprite.data[1]].callback = 'AnimWaterSpoutRainHit';
      }
      destroySprite(sprite);
    }
  }
}

export function AnimWaterSpoutRainHit(runtime: WaterRuntime, sprite: WaterSprite): void {
  if (++sprite.data[1] > 1) {
    sprite.data[1] = 0;
    sprite.invisible = !sprite.invisible;
    if (++sprite.data[2] === 12) {
      runtime.tasks[sprite.data[6]]!.data[sprite.data[7]]--;
      destroySprite(sprite);
    }
  }
}

export function AnimTask_WaterSport(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  task.data[3] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2');
  task.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset');
  task.data[7] = getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER ? 1 : -1;
  if (runtime.contest) task.data[7] *= -1;
  task.data[5] = task.data[3] + task.data[7] * 8;
  task.data[6] = task.data[4] - task.data[7] * 8;
  task.data[9] = -32;
  task.data[1] = 0;
  task.data[0] = 0;
  task.func = 'AnimTask_WaterSport_Step';
}

export function AnimTask_WaterSport_Step(runtime: WaterRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  switch (task.data[0]) {
    case 0:
      createWaterSportDroplet(runtime, task, taskId);
      if (task.data[10] !== 0) task.data[0]++;
      break;
    case 1:
      createWaterSportDroplet(runtime, task, taskId);
      if (++task.data[1] > 16) {
        task.data[1] = 0;
        task.data[0]++;
      }
      break;
    case 2:
      createWaterSportDroplet(runtime, task, taskId);
      task.data[5] += task.data[7] * 6;
      if (!(task.data[5] >= -16 && task.data[5] <= 256)) {
        if (++task.data[12] > 2) {
          task.data[13] = 1;
          task.data[0] = 6;
          task.data[1] = 0;
        } else {
          task.data[1] = 0;
          task.data[0]++;
        }
      }
      break;
    case 3:
      createWaterSportDroplet(runtime, task, taskId);
      task.data[6] -= task.data[7] * 2;
      if (++task.data[1] > 7) task.data[0]++;
      break;
    case 4:
      createWaterSportDroplet(runtime, task, taskId);
      task.data[5] -= task.data[7] * 6;
      if (!(task.data[5] >= -16 && task.data[5] <= 256)) {
        task.data[12]++;
        task.data[1] = 0;
        task.data[0]++;
      }
      break;
    case 5:
      createWaterSportDroplet(runtime, task, taskId);
      task.data[6] -= task.data[7] * 2;
      if (++task.data[1] > 7) task.data[0] = 2;
      break;
    case 6:
      if (task.data[8] === 0) task.data[0]++;
      break;
    default:
      destroyAnimVisualTask(runtime, taskId);
      break;
  }
}

export function CreateWaterSportDroplet(runtime: WaterRuntime, task: WaterTask, taskId: number): void {
  if (++task.data[2] > 1) {
    task.data[2] = 0;
    const spriteId = createSprite(runtime, gSmallWaterOrbSpriteTemplate, task.data[3], task.data[4], 10);
    if (spriteId !== MAX_SPRITES) {
      const sprite = runtime.sprites[spriteId];
      sprite.data[0] = 16;
      sprite.data[2] = task.data[5];
      sprite.data[4] = task.data[6];
      sprite.data[5] = task.data[9];
      sprite.data[6] = taskId;
      initAnimArcTranslation(sprite);
      sprite.callback = 'AnimWaterSportDroplet';
      task.data[8]++;
    }
  }
}

export function AnimWaterSportDroplet(runtime: WaterRuntime, sprite: WaterSprite): void {
  if (translateAnimHorizontalArc(sprite)) {
    sprite.x += sprite.x2;
    sprite.y += sprite.y2;
    sprite.data[0] = 6;
    sprite.data[2] = (random(runtime) & 0x1f) - 16 + sprite.x;
    sprite.data[4] = (random(runtime) & 0x1f) - 16 + sprite.y;
    sprite.data[5] = ~(random(runtime) & 7);
    initAnimArcTranslation(sprite);
    sprite.callback = 'AnimWaterSportDroplet_Step';
  }
}

export function AnimWaterSportDroplet_Step(runtime: WaterRuntime, sprite: WaterSprite): void {
  if (translateAnimHorizontalArc(sprite)) {
    for (let i = 0; i < NUM_TASKS; i++) {
      if (runtime.tasks[i]?.func === 'AnimTask_WaterSport_Step') {
        runtime.tasks[i]!.data[10] = 1;
        runtime.tasks[i]!.data[8]--;
        destroySprite(sprite);
      }
    }
  }
}

export function AnimWaterPulseBubble(runtime: WaterRuntime, sprite: WaterSprite): void {
  sprite.x = runtime.battleAnimArgs[0];
  sprite.y = runtime.battleAnimArgs[1];
  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[1] = runtime.battleAnimArgs[3];
  sprite.data[2] = runtime.battleAnimArgs[4];
  sprite.data[3] = runtime.battleAnimArgs[5];
  sprite.callback = 'AnimWaterPulseBubble_Step';
}

export function AnimWaterPulseBubble_Step(sprite: WaterSprite): void {
  sprite.data[4] -= sprite.data[0];
  sprite.y2 = div(sprite.data[4], 10);
  sprite.data[5] = (sprite.data[5] + sprite.data[1]) & 0xff;
  sprite.x2 = sin(sprite.data[5], sprite.data[2]);
  if (--sprite.data[3] === 0) destroyAnimSprite(sprite);
}

export function AnimWaterPulseRingBubble(sprite: WaterSprite): void {
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  sprite.x2 = sprite.data[3] >> 7;
  sprite.y2 = sprite.data[4] >> 7;
  if (--sprite.data[0] === 0) destroySprite(sprite);
}

export function AnimWaterPulseRing(runtime: WaterRuntime, sprite: WaterSprite): void {
  initSpritePosToAnimAttacker(runtime, sprite);
  sprite.data[1] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2');
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset');
  sprite.data[3] = runtime.battleAnimArgs[2];
  sprite.data[4] = runtime.battleAnimArgs[3];
  sprite.callback = 'AnimWaterPulseRing_Step';
}

export function AnimWaterPulseRing_Step(runtime: WaterRuntime, sprite: WaterSprite): void {
  const xDiff = sprite.data[1] - sprite.x;
  const yDiff = sprite.data[2] - sprite.y;
  sprite.x2 = div(sprite.data[0] * xDiff, sprite.data[3]);
  sprite.y2 = div(sprite.data[0] * yDiff, sprite.data[3]);
  if (++sprite.data[5] === sprite.data[4]) {
    sprite.data[5] = 0;
    createWaterPulseRingBubbles(runtime, sprite, xDiff, yDiff);
  }
  if (sprite.data[3] === sprite.data[0]) destroyAnimSprite(sprite);
  sprite.data[0]++;
}

export function CreateWaterPulseRingBubbles(runtime: WaterRuntime, sprite: WaterSprite, xDiff: number, yDiff: number): void {
  const something = div(sprite.data[0], 2);
  const combinedX = sprite.x + sprite.x2;
  const combinedY = sprite.y + sprite.y2;
  const somethingRandomY = yDiff + (random(runtime) % 10) - 5;
  const somethingRandomX = -xDiff + (random(runtime) % 10) - 5;
  let spriteId = createSprite(runtime, gWaterPulseRingBubbleSpriteTemplate, combinedX, combinedY + something, 130);
  runtime.sprites[spriteId].data[0] = 20;
  runtime.sprites[spriteId].data[1] = somethingRandomY;
  runtime.sprites[spriteId].subpriority = getBattlerSpriteSubpriority(runtime, runtime.battleAnimAttacker) - 1;
  runtime.sprites[spriteId].data[2] = somethingRandomX < 0 ? -somethingRandomX : somethingRandomX;
  spriteId = createSprite(runtime, gWaterPulseRingBubbleSpriteTemplate, combinedX, combinedY - something, 130);
  runtime.sprites[spriteId].data[0] = 20;
  runtime.sprites[spriteId].data[1] = somethingRandomY;
  runtime.sprites[spriteId].subpriority = getBattlerSpriteSubpriority(runtime, runtime.battleAnimAttacker) - 1;
  runtime.sprites[spriteId].data[2] = somethingRandomX > 0 ? -somethingRandomX : somethingRandomX;
}

export const animTaskCreateRaindrops = AnimTask_CreateRaindrops;
export const animRainDrop = AnimRainDrop;
export const animRainDropStep = AnimRainDrop_Step;
export const animWaterBubbleProjectile = AnimWaterBubbleProjectile;
export const animWaterBubbleProjectileStep1 = AnimWaterBubbleProjectile_Step1;
export const animWaterBubbleProjectileStep2 = AnimWaterBubbleProjectile_Step2;
export const animWaterBubbleProjectileStep3 = AnimWaterBubbleProjectile_Step3;
export const animAuroraBeamRings = AnimAuroraBeamRings;
export const animAuroraBeamRingsStep = AnimAuroraBeamRings_Step;
export const animTaskRotateAuroraRingColors = AnimTask_RotateAuroraRingColors;
export const animTaskRotateAuroraRingColorsStep = AnimTask_RotateAuroraRingColors_Step;
export const animToTargetInSinWave = AnimToTargetInSinWave;
export const animToTargetInSinWaveStep = AnimToTargetInSinWave_Step;
export const animTaskStartSinAnimTimer = AnimTask_StartSinAnimTimer;
export const animTaskRunSinAnimTimer = AnimTask_RunSinAnimTimer;
export const animHydroCannonCharge = AnimHydroCannonCharge;
export const animHydroCannonChargeStep = AnimHydroCannonCharge_Step;
export const animHydroCannonBeam = AnimHydroCannonBeam;
export const animWaterGunDroplet = AnimWaterGunDroplet;
export const animSmallBubblePair = AnimSmallBubblePair;
export const animSmallBubblePairStep = AnimSmallBubblePair_Step;
export const animTaskCreateSurfWave = AnimTask_CreateSurfWave;
export const animTaskCreateSurfWaveStep1 = AnimTask_CreateSurfWave_Step1;
export const animTaskCreateSurfWaveStep2 = AnimTask_CreateSurfWave_Step2;
export const animTaskSurfWaveScanlineEffect = AnimTask_SurfWaveScanlineEffect;
export const animSmallDriftingBubbles = AnimSmallDriftingBubbles;
export const animSmallDriftingBubblesStep = AnimSmallDriftingBubbles_Step;
export const animTaskWaterSpoutLaunch = AnimTask_WaterSpoutLaunch;
export const animTaskWaterSpoutLaunchStep = AnimTask_WaterSpoutLaunch_Step;
export const getWaterSpoutPowerForAnim = GetWaterSpoutPowerForAnim;
export const createWaterSpoutLaunchDroplets = CreateWaterSpoutLaunchDroplets;
export const animSmallWaterOrb = AnimSmallWaterOrb;
export const animTaskWaterSpoutRain = AnimTask_WaterSpoutRain;
export const animTaskWaterSpoutRainStep = AnimTask_WaterSpoutRain_Step;
export const createWaterSpoutRainDroplet = CreateWaterSpoutRainDroplet;
export const animWaterSpoutRain = AnimWaterSpoutRain;
export const animWaterSpoutRainHit = AnimWaterSpoutRainHit;
export const animTaskWaterSport = AnimTask_WaterSport;
export const animTaskWaterSportStep = AnimTask_WaterSport_Step;
export const createWaterSportDroplet = CreateWaterSportDroplet;
export const animWaterSportDroplet = AnimWaterSportDroplet;
export const animWaterSportDropletStep = AnimWaterSportDroplet_Step;
export const animWaterPulseBubble = AnimWaterPulseBubble;
export const animWaterPulseBubbleStep = AnimWaterPulseBubble_Step;
export const animWaterPulseRingBubble = AnimWaterPulseRingBubble;
export const animWaterPulseRing = AnimWaterPulseRing;
export const animWaterPulseRingStep = AnimWaterPulseRing_Step;
export const createWaterPulseRingBubbles = CreateWaterPulseRingBubbles;

const div = (a: number, b: number): number => Math.trunc(a / b);
const bldalpha = (a: number, b: number): number => (a & 0x1f) | ((b & 0x1f) << 8);
const random = (runtime: WaterRuntime): number => runtime.randomValues.length ? runtime.randomValues.shift()! : 0;
const isoRandomize2 = (value: number): number => (value * 1103515245 + 24691) >>> 16;
const getBattlerSide = (runtime: WaterRuntime, battler: number): number => runtime.battlerSides[battler] ?? B_SIDE_PLAYER;
const getBattlerPosition = (runtime: WaterRuntime, battler: number): number => runtime.battlerPositions[battler] ?? 0;
const getBattlerSpriteCoord = (runtime: WaterRuntime, battler: number, key: keyof WaterRuntime['battlerCoords'][number]): number => runtime.battlerCoords[battler][key];
const getBattlerSpriteSubpriority = (runtime: WaterRuntime, battler: number): number => runtime.battlerSubpriority[battler] ?? 0;
const getAnimBattlerSpriteId = (runtime: WaterRuntime, battlerKind: number): number => runtime.battlerSpriteIds[battlerKind === ANIM_ATTACKER ? runtime.battleAnimAttacker : runtime.battleAnimTarget] ?? 0;
const initSpritePosToAnimAttacker = (runtime: WaterRuntime, sprite: WaterSprite, useArgs = true): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'x2') + (useArgs ? runtime.battleAnimArgs[0] : 0);
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, 'yPicOffset') + (useArgs ? runtime.battleAnimArgs[1] : 0);
};
const initSpritePosToAnimTarget = (runtime: WaterRuntime, sprite: WaterSprite): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'x2') + runtime.battleAnimArgs[0];
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, 'yPicOffset') + runtime.battleAnimArgs[1];
};
const storeSpriteCallbackInData6 = (sprite: WaterSprite, callback: WaterCallback): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 1;
};
const initAnimLinearTranslation = (sprite: WaterSprite): void => {
  const x = sprite.data[2] - sprite.data[1];
  const y = sprite.data[4] - sprite.data[3];
  let xDelta = div(Math.abs(x) << 8, sprite.data[0]) & 0xffff;
  let yDelta = div(Math.abs(y) << 8, sprite.data[0]) & 0xffff;
  xDelta = x < 0 ? xDelta | 1 : xDelta & ~1;
  yDelta = y < 0 ? yDelta | 1 : yDelta & ~1;
  sprite.data[1] = xDelta;
  sprite.data[2] = yDelta;
  sprite.data[4] = 0;
  sprite.data[3] = 0;
};
const animTranslateLinear = (sprite: WaterSprite): boolean => {
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
const initAnimArcTranslation = (sprite: WaterSprite): void => {
  initAnimLinearTranslation(sprite);
  sprite.data[7] = 0;
};
const translateAnimHorizontalArc = (sprite: WaterSprite): boolean => {
  const done = animTranslateLinear(sprite);
  sprite.y2 += sin(sprite.data[7], sprite.data[5]);
  sprite.data[7] = (sprite.data[7] + 8) & 0xff;
  return done;
};
const destroyAnimSprite = (sprite: WaterSprite): void => {
  sprite.destroyed = true;
  sprite.callback = 'DestroyAnimSprite';
};
const destroySprite = (sprite: WaterSprite): void => {
  sprite.destroyed = true;
};
const startSpriteAnim = (sprite: WaterSprite, anim: number): void => {
  sprite.animNum = anim;
};
const startSpriteAffineAnim = (sprite: WaterSprite, anim: number): void => {
  sprite.affineAnimNum = anim;
};
const createSprite = (runtime: WaterRuntime, spriteTemplate: WaterSpriteTemplate, x: number, y: number, subpriority: number): number => {
  const id = runtime.sprites.findIndex((sprite, index) => index >= 4 && (sprite.destroyed || sprite.callback === 'SpriteCallbackDummy'));
  const spriteId = id === -1 ? runtime.sprites.length : id;
  if (spriteId >= MAX_SPRITES) return MAX_SPRITES;
  const sprite = createWaterSprite();
  sprite.x = x;
  sprite.y = y;
  sprite.subpriority = subpriority;
  sprite.callback = spriteTemplate.callback;
  runtime.sprites[spriteId] = sprite;
  runtime.operations.push(`CreateSprite:${spriteTemplate.callback}:${x}:${y}:${subpriority}`);
  return spriteId;
};
const createInvisibleSpriteWithCallback = (runtime: WaterRuntime, callback: WaterCallback): number => {
  const id = createSprite(runtime, { ...gRainDropSpriteTemplate, callback }, 0, 0, 0);
  runtime.sprites[id].invisible = true;
  return id;
};
const destroyAnimVisualTask = (runtime: WaterRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyAnimVisualTask';
  }
};
const destroyTask = (runtime: WaterRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) task.destroyed = true;
};
const setGpuReg = (runtime: WaterRuntime, reg: string, value: number): void => {
  runtime.registers[reg] = value;
  runtime.operations.push(`SetGpuReg:${reg}:${value}`);
};
const setAnimBgAttribute = (runtime: WaterRuntime, bg: number, attr: string, value: number): void => {
  runtime.operations.push(`SetAnimBgAttribute:${bg}:${attr}:${value}`);
};
const initBattleAnimBg = (runtime: WaterRuntime, bg: number): void => {
  runtime.operations.push(`InitBattleAnimBg:${bg}`);
};
const fillScanline = (runtime: WaterRuntime, start: number, end: number, inner: number, outer: number, buffer: number): void => {
  for (let i = 0; i < start; i++) runtime.scanlineBuffers[buffer][i] = outer;
  for (let i = start; i < end; i++) runtime.scanlineBuffers[buffer][i] = inner;
  for (let i = end; i < 160; i++) runtime.scanlineBuffers[buffer][i] = outer;
  runtime.scanlineBuffers[buffer][160] = start === 0 ? inner : outer;
};
const objPlttId = (index: number): number => 0x100 + index * 16;
const indexOfSpritePaletteTag = (runtime: WaterRuntime, tag: string): number => runtime.paletteTagIndexes[tag] ?? 0;
const prepareBattlerSpriteForRotScale = (runtime: WaterRuntime, spriteId: number, mode: string): void => {
  runtime.operations.push(`PrepareBattlerSpriteForRotScale:${spriteId}:${mode}`);
};
const resetSpriteRotScale = (runtime: WaterRuntime, spriteId: number): void => {
  runtime.operations.push(`ResetSpriteRotScale:${spriteId}`);
};
const battleAnimHelperSetSpriteSquashParams = (task: WaterTask, spriteId: number, a: number, b: number, c: number, d: number, duration: number): void => {
  task.data[8] = spriteId;
  task.data[9] = a;
  task.data[10] = b;
  task.data[11] = c;
  task.data[12] = d;
  task.data[13] = duration;
};
const battleAnimHelperRunSpriteSquash = (task: WaterTask): number => {
  if (task.data[13] > 0) --task.data[13];
  return task.data[13];
};
