import { cos, sin } from './decompTrig';

export const REG_OFFSET_BLDCNT = 'REG_OFFSET_BLDCNT';
export const REG_OFFSET_BLDALPHA = 'REG_OFFSET_BLDALPHA';
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const BATTLER_COORD_X = 0;
export const BATTLER_COORD_X_2 = 1;
export const BATTLER_COORD_Y = 2;
export const BATTLER_COORD_Y_PIC_OFFSET = 3;

export type BattleAnimMonsSpriteCallback =
  | 'TranslateSpriteInCircle'
  | 'TranslateSpriteInGrowingCircle'
  | 'TranslateSpriteInEllipse'
  | 'TranslateSpriteLinear'
  | 'TranslateSpriteLinearFixedPoint'
  | 'TranslateSpriteLinearById'
  | 'TranslateSpriteLinearByIdFixedPoint'
  | 'TranslateSpriteLinearAndFlicker'
  | 'StartAnimLinearTranslation'
  | 'AnimTranslateLinear_WithFollowup'
  | 'AnimFastTranslateLinearWaitEnd'
  | 'AnimWeatherBallUp_Step'
  | 'RunStoredCallbackWhenAffineAnimEnds'
  | 'RunStoredCallbackWhenAnimEnds'
  | 'DestroyAnimSpriteAndDisableBlend'
  | 'SpriteCallbackDummy'
  | string;

export interface BattleAnimMonsSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  callback: BattleAnimMonsSpriteCallback;
  storedCallback: BattleAnimMonsSpriteCallback;
  affineAnimEnded: boolean;
  animEnded: boolean;
  destroyed: boolean;
  matrixFreed: boolean;
  priority: number;
  subpriority: number;
  bgPriority: number;
  paletteIndex: number;
  hFlip: boolean;
  vFlip: boolean;
  animNum: number;
  affineAnimNum: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export interface BattleAnimMonsRuntime {
  sprites: BattleAnimMonsSprite[];
  battleAnimArgs: number[];
  battleAnimAttacker: number;
  battleAnimTarget: number;
  battlerSides: Record<number, number>;
  battlerCoords: Record<number, Record<number, number>>;
  gpuRegs: Record<string, number>;
  destroyedVisualTasks: number[];
  calls: Array<{ fn: string; args: unknown[] }>;
}

export const createBattleAnimMonsSprite = (overrides: Partial<BattleAnimMonsSprite> = {}): BattleAnimMonsSprite => ({
  id: 0,
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  invisible: false,
  callback: 'SpriteCallbackDummy',
  storedCallback: 'SpriteCallbackDummy',
  affineAnimEnded: false,
  animEnded: false,
  destroyed: false,
  matrixFreed: false,
  priority: 0,
  subpriority: 0,
  bgPriority: 0,
  paletteIndex: 0,
  hFlip: false,
  vFlip: false,
  animNum: 0,
  affineAnimNum: 0,
  scaleX: 0x100,
  scaleY: 0x100,
  rotation: 0,
  ...overrides
});

export const createBattleAnimMonsRuntime = (overrides: Partial<BattleAnimMonsRuntime> = {}): BattleAnimMonsRuntime => ({
  sprites: overrides.sprites ?? [],
  battleAnimArgs: overrides.battleAnimArgs ?? Array.from({ length: 8 }, () => 0),
  battleAnimAttacker: overrides.battleAnimAttacker ?? 0,
  battleAnimTarget: overrides.battleAnimTarget ?? 1,
  battlerSides: overrides.battlerSides ?? { 0: B_SIDE_PLAYER, 1: B_SIDE_OPPONENT, 2: B_SIDE_PLAYER, 3: B_SIDE_OPPONENT },
  battlerCoords: overrides.battlerCoords ?? {
    0: { [BATTLER_COORD_X]: 40, [BATTLER_COORD_X_2]: 40, [BATTLER_COORD_Y]: 80, [BATTLER_COORD_Y_PIC_OFFSET]: 72 },
    1: { [BATTLER_COORD_X]: 160, [BATTLER_COORD_X_2]: 160, [BATTLER_COORD_Y]: 48, [BATTLER_COORD_Y_PIC_OFFSET]: 40 },
    2: { [BATTLER_COORD_X]: 72, [BATTLER_COORD_X_2]: 72, [BATTLER_COORD_Y]: 80, [BATTLER_COORD_Y_PIC_OFFSET]: 72 },
    3: { [BATTLER_COORD_X]: 192, [BATTLER_COORD_X_2]: 192, [BATTLER_COORD_Y]: 48, [BATTLER_COORD_Y_PIC_OFFSET]: 40 }
  },
  gpuRegs: overrides.gpuRegs ?? {},
  destroyedVisualTasks: overrides.destroyedVisualTasks ?? [],
  calls: overrides.calls ?? []
});

const div = (left: number, right: number): number => Math.trunc(left / right);
const toU16 = (value: number): number => value & 0xffff;
const toU8 = (value: number): number => value & 0xff;
const maybeNegate = (value: number, negative: boolean): number =>
  negative && value !== 0 ? -value : value;

const getBattlerSide = (runtime: BattleAnimMonsRuntime, battlerId: number): number =>
  runtime.battlerSides[battlerId] ?? B_SIDE_PLAYER;

const getBattlerSpriteCoord = (
  runtime: BattleAnimMonsRuntime,
  battlerId: number,
  coordType: number
): number => runtime.battlerCoords[battlerId]?.[coordType] ?? 0;

const setCallbackToStoredInData6 = (sprite: BattleAnimMonsSprite): void => {
  sprite.callback = sprite.storedCallback;
};

export const StoreSpriteCallbackInData6 = (
  sprite: BattleAnimMonsSprite,
  callback: BattleAnimMonsSpriteCallback
): void => {
  sprite.storedCallback = callback;
  sprite.data[6] = 0;
  sprite.data[7] = 0;
};

const wrapCirclePos = (value: number): number => {
  if (value >= 0x100)
    return value - 0x100;
  if (value < 0)
    return value + 0x100;
  return value;
};

export const TranslateSpriteInCircle = (sprite: BattleAnimMonsSprite): void => {
  if (sprite.data[3]) {
    sprite.x2 = sin(sprite.data[0], sprite.data[1]);
    sprite.y2 = cos(sprite.data[0], sprite.data[1]);
    sprite.data[0] = wrapCirclePos(sprite.data[0] + sprite.data[2]);
    sprite.data[3]--;
  } else {
    setCallbackToStoredInData6(sprite);
  }
};

export const TranslateSpriteInGrowingCircle = (sprite: BattleAnimMonsSprite): void => {
  if (sprite.data[3]) {
    sprite.x2 = sin(sprite.data[0], (sprite.data[5] >> 8) + sprite.data[1]);
    sprite.y2 = cos(sprite.data[0], (sprite.data[5] >> 8) + sprite.data[1]);
    sprite.data[0] = wrapCirclePos(sprite.data[0] + sprite.data[2]);
    sprite.data[5] += sprite.data[4];
    sprite.data[3]--;
  } else {
    setCallbackToStoredInData6(sprite);
  }
};

export const TranslateSpriteInEllipse = (sprite: BattleAnimMonsSprite): void => {
  if (sprite.data[3]) {
    sprite.x2 = sin(sprite.data[0], sprite.data[1]);
    sprite.y2 = cos(sprite.data[0], sprite.data[4]);
    sprite.data[0] = wrapCirclePos(sprite.data[0] + sprite.data[2]);
    sprite.data[3]--;
  } else {
    setCallbackToStoredInData6(sprite);
  }
};

export const WaitAnimForDuration = (sprite: BattleAnimMonsSprite): void => {
  if (sprite.data[0] > 0)
    --sprite.data[0];
  else
    setCallbackToStoredInData6(sprite);
};

export const ConvertPosDataToTranslateLinearData = (sprite: BattleAnimMonsSprite): void => {
  let old: number;
  let xDiff: number;

  if (sprite.data[1] > sprite.data[2])
    sprite.data[0] = -sprite.data[0];
  xDiff = sprite.data[2] - sprite.data[1];
  old = sprite.data[0];
  sprite.data[0] = Math.abs(div(xDiff, sprite.data[0]));
  sprite.data[2] = div(sprite.data[4] - sprite.data[3], sprite.data[0]);
  sprite.data[1] = old;
};

export const TranslateSpriteLinear = (sprite: BattleAnimMonsSprite): void => {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
    sprite.x2 += sprite.data[1];
    sprite.y2 += sprite.data[2];
  } else {
    setCallbackToStoredInData6(sprite);
  }
};

export const TranslateSpriteLinearFixedPoint = (sprite: BattleAnimMonsSprite): void => {
  if (sprite.data[0] > 0) {
    --sprite.data[0];
    sprite.data[3] += sprite.data[1];
    sprite.data[4] += sprite.data[2];
    sprite.x2 = sprite.data[3] >> 8;
    sprite.y2 = sprite.data[4] >> 8;
  } else {
    setCallbackToStoredInData6(sprite);
  }
};

export const InitSpriteDataForLinearTranslation = (sprite: BattleAnimMonsSprite): void => {
  const x = (sprite.data[2] - sprite.data[1]) << 8;
  const y = (sprite.data[4] - sprite.data[3]) << 8;

  sprite.data[1] = div(x, sprite.data[0]);
  sprite.data[2] = div(y, sprite.data[0]);
  sprite.data[4] = 0;
  sprite.data[3] = 0;
};

export const InitAnimLinearTranslation = (sprite: BattleAnimMonsSprite): void => {
  const x = sprite.data[2] - sprite.data[1];
  const y = sprite.data[4] - sprite.data[3];
  const movingLeft = x < 0;
  const movingUp = y < 0;
  let xDelta = Math.abs(x) << 8;
  let yDelta = Math.abs(y) << 8;

  xDelta = div(xDelta, sprite.data[0]);
  yDelta = div(yDelta, sprite.data[0]);

  if (movingLeft)
    xDelta |= 1;
  else
    xDelta &= ~1;

  if (movingUp)
    yDelta |= 1;
  else
    yDelta &= ~1;

  sprite.data[1] = xDelta;
  sprite.data[2] = yDelta;
  sprite.data[4] = 0;
  sprite.data[3] = 0;
};

export const StartAnimLinearTranslation = (sprite: BattleAnimMonsSprite): void => {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  InitAnimLinearTranslation(sprite);
  sprite.callback = 'AnimTranslateLinear_WithFollowup';
  AnimTranslateLinear_WithFollowup(sprite);
};

export const AnimTranslateLinear = (sprite: BattleAnimMonsSprite): boolean => {
  let v1: number;
  let v2: number;
  let x: number;
  let y: number;

  if (!sprite.data[0])
    return true;
  v1 = toU16(sprite.data[1]);
  v2 = toU16(sprite.data[2]);
  x = toU16(sprite.data[3]);
  y = toU16(sprite.data[4]);
  x = toU16(x + v1);
  y = toU16(y + v2);
  sprite.x2 = maybeNegate(x >> 8, (v1 & 1) !== 0);
  sprite.y2 = maybeNegate(y >> 8, (v2 & 1) !== 0);
  sprite.data[3] = x;
  sprite.data[4] = y;
  --sprite.data[0];
  return false;
};

export const AnimTranslateLinear_WithFollowup = (sprite: BattleAnimMonsSprite): void => {
  if (AnimTranslateLinear(sprite))
    setCallbackToStoredInData6(sprite);
};

export const InitAnimArcTranslation = (sprite: BattleAnimMonsSprite): void => {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  InitAnimLinearTranslation(sprite);
  sprite.data[6] = div(0x8000, sprite.data[0]);
  sprite.data[7] = 0;
};

export const TranslateAnimHorizontalArc = (sprite: BattleAnimMonsSprite): boolean => {
  if (AnimTranslateLinear(sprite))
    return true;
  sprite.data[7] += sprite.data[6];
  sprite.y2 += sin(toU8(sprite.data[7] >> 8), sprite.data[5]);
  return false;
};

export const TranslateAnimVerticalArc = (sprite: BattleAnimMonsSprite): boolean => {
  if (AnimTranslateLinear(sprite))
    return true;
  sprite.data[7] += sprite.data[6];
  sprite.x2 += sin(toU8(sprite.data[7] >> 8), sprite.data[5]);
  return false;
};

export const SetSpritePrimaryCoordsFromSecondaryCoords = (sprite: BattleAnimMonsSprite): void => {
  sprite.x += sprite.x2;
  sprite.y += sprite.y2;
  sprite.x2 = 0;
  sprite.y2 = 0;
};

export const InitAnimFastLinearTranslation = (sprite: BattleAnimMonsSprite): void => {
  const xDiff = sprite.data[2] - sprite.data[1];
  const yDiff = sprite.data[4] - sprite.data[3];
  const xSign = xDiff < 0;
  const ySign = yDiff < 0;
  let x2 = Math.abs(xDiff) << 4;
  let y2 = Math.abs(yDiff) << 4;

  x2 = div(x2, sprite.data[0]);
  y2 = div(y2, sprite.data[0]);
  if (xSign)
    x2 |= 1;
  else
    x2 &= ~1;
  if (ySign)
    y2 |= 1;
  else
    y2 &= ~1;
  sprite.data[1] = x2;
  sprite.data[2] = y2;
  sprite.data[4] = 0;
  sprite.data[3] = 0;
};

export const InitAndRunAnimFastLinearTranslation = (sprite: BattleAnimMonsSprite): void => {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  InitAnimFastLinearTranslation(sprite);
  sprite.callback = 'AnimFastTranslateLinearWaitEnd';
  AnimFastTranslateLinearWaitEnd(sprite);
};

export const AnimFastTranslateLinear = (sprite: BattleAnimMonsSprite): boolean => {
  let v1: number;
  let v2: number;
  let x: number;
  let y: number;

  if (!sprite.data[0])
    return true;
  v1 = toU16(sprite.data[1]);
  v2 = toU16(sprite.data[2]);
  x = toU16(sprite.data[3]);
  y = toU16(sprite.data[4]);
  x = toU16(x + v1);
  y = toU16(y + v2);
  sprite.x2 = maybeNegate(x >> 4, (v1 & 1) !== 0);
  sprite.y2 = maybeNegate(y >> 4, (v2 & 1) !== 0);
  sprite.data[3] = x;
  sprite.data[4] = y;
  --sprite.data[0];
  return false;
};

export const AnimFastTranslateLinearWaitEnd = (sprite: BattleAnimMonsSprite): void => {
  if (AnimFastTranslateLinear(sprite))
    setCallbackToStoredInData6(sprite);
};

export const InitAnimFastLinearTranslationWithSpeed = (sprite: BattleAnimMonsSprite): void => {
  const xDiff = Math.abs(sprite.data[2] - sprite.data[1]) << 4;

  sprite.data[0] = div(xDiff, sprite.data[0]);
  InitAnimFastLinearTranslation(sprite);
};

export const InitAnimFastLinearTranslationWithSpeedAndPos = (sprite: BattleAnimMonsSprite): void => {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  InitAnimFastLinearTranslationWithSpeed(sprite);
  sprite.callback = 'AnimFastTranslateLinearWaitEnd';
  AnimFastTranslateLinearWaitEnd(sprite);
};

export const TranslateSpriteLinearById = (
  runtime: BattleAnimMonsRuntime,
  sprite: BattleAnimMonsSprite
): void => {
  if (sprite.data[0] > 0) {
    --sprite.data[0];
    runtime.sprites[sprite.data[3]].x2 += sprite.data[1];
    runtime.sprites[sprite.data[3]].y2 += sprite.data[2];
  } else {
    setCallbackToStoredInData6(sprite);
  }
};

export const TranslateSpriteLinearByIdFixedPoint = (
  runtime: BattleAnimMonsRuntime,
  sprite: BattleAnimMonsSprite
): void => {
  if (sprite.data[0] > 0) {
    --sprite.data[0];
    sprite.data[3] += sprite.data[1];
    sprite.data[4] += sprite.data[2];
    runtime.sprites[sprite.data[5]].x2 = sprite.data[3] >> 8;
    runtime.sprites[sprite.data[5]].y2 = sprite.data[4] >> 8;
  } else {
    setCallbackToStoredInData6(sprite);
  }
};

export const TranslateSpriteLinearAndFlicker = (sprite: BattleAnimMonsSprite): void => {
  if (sprite.data[0] > 0) {
    --sprite.data[0];
    sprite.x2 = sprite.data[2] >> 8;
    sprite.data[2] += sprite.data[1];
    sprite.y2 = sprite.data[4] >> 8;
    sprite.data[4] += sprite.data[3];
    if (sprite.data[0] % sprite.data[5] === 0) {
      if (sprite.data[5])
        sprite.invisible = !sprite.invisible;
    }
  } else {
    setCallbackToStoredInData6(sprite);
  }
};

export const DestroySpriteAndMatrix = (
  runtime: BattleAnimMonsRuntime,
  sprite: BattleAnimMonsSprite
): void => {
  sprite.matrixFreed = true;
  sprite.destroyed = true;
  runtime.calls.push({ fn: 'FreeSpriteOamMatrix', args: [sprite.id] });
  runtime.calls.push({ fn: 'DestroyAnimSprite', args: [sprite.id] });
};

export const RunStoredCallbackWhenAffineAnimEnds = (sprite: BattleAnimMonsSprite): void => {
  if (sprite.affineAnimEnded)
    setCallbackToStoredInData6(sprite);
};

export const RunStoredCallbackWhenAnimEnds = (sprite: BattleAnimMonsSprite): void => {
  if (sprite.animEnded)
    setCallbackToStoredInData6(sprite);
};

export const DestroyAnimSpriteAndDisableBlend = (
  runtime: BattleAnimMonsRuntime,
  sprite: BattleAnimMonsSprite
): void => {
  runtime.gpuRegs[REG_OFFSET_BLDCNT] = 0;
  runtime.gpuRegs[REG_OFFSET_BLDALPHA] = 0;
  sprite.destroyed = true;
  runtime.calls.push({ fn: 'DestroyAnimSprite', args: [sprite.id] });
};

export const DestroyAnimVisualTaskAndDisableBlend = (
  runtime: BattleAnimMonsRuntime,
  taskId: number
): void => {
  runtime.gpuRegs[REG_OFFSET_BLDCNT] = 0;
  runtime.gpuRegs[REG_OFFSET_BLDALPHA] = 0;
  runtime.destroyedVisualTasks.push(taskId);
};

export const AnimThrowProjectile = (
  runtime: BattleAnimMonsRuntime,
  sprite: BattleAnimMonsSprite
): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2);
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER)
    runtime.battleAnimArgs[2] = -runtime.battleAnimArgs[2];
  sprite.data[0] = runtime.battleAnimArgs[4];
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_X_2) + runtime.battleAnimArgs[2];
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_Y_PIC_OFFSET) + runtime.battleAnimArgs[3];
  sprite.data[5] = runtime.battleAnimArgs[5];
  InitAnimArcTranslation(sprite);
  sprite.callback = 'AnimThrowProjectile_Step';
};

export const AnimThrowProjectile_Step = (
  runtime: BattleAnimMonsRuntime,
  sprite: BattleAnimMonsSprite
): void => {
  if (TranslateAnimHorizontalArc(sprite)) {
    sprite.destroyed = true;
    runtime.calls.push({ fn: 'DestroyAnimSprite', args: [sprite.id] });
  }
};

export const AnimWeatherBallUp = (
  runtime: BattleAnimMonsRuntime,
  sprite: BattleAnimMonsSprite
): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2);
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET);
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) === B_SIDE_PLAYER)
    sprite.data[0] = 5;
  else
    sprite.data[0] = -10;
  sprite.data[1] = -40;
  sprite.callback = 'AnimWeatherBallUp_Step';
};

export const AnimWeatherBallUp_Step = (
  runtime: BattleAnimMonsRuntime,
  sprite: BattleAnimMonsSprite
): void => {
  sprite.data[2] += sprite.data[0];
  sprite.data[3] += sprite.data[1];
  sprite.x2 = div(sprite.data[2], 10);
  sprite.y2 = div(sprite.data[3], 10);
  if (sprite.data[1] < -20)
    ++sprite.data[1];
  if (sprite.y + sprite.y2 < -32) {
    sprite.destroyed = true;
    runtime.calls.push({ fn: 'DestroyAnimSprite', args: [sprite.id] });
  }
};

export const AnimWeatherBallDown = (
  runtime: BattleAnimMonsRuntime,
  sprite: BattleAnimMonsSprite
): void => {
  let x: number;

  sprite.data[0] = runtime.battleAnimArgs[2];
  sprite.data[2] = sprite.x + runtime.battleAnimArgs[4];
  sprite.data[4] = sprite.y + runtime.battleAnimArgs[5];
  if (getBattlerSide(runtime, runtime.battleAnimTarget) === B_SIDE_PLAYER) {
    x = toU16(runtime.battleAnimArgs[4]) + 30;
    sprite.x += x;
    sprite.y = runtime.battleAnimArgs[5] - 20;
  } else {
    x = toU16(runtime.battleAnimArgs[4]) - 30;
    sprite.x += x;
    sprite.y = runtime.battleAnimArgs[5] - 80;
  }
  sprite.callback = 'StartAnimLinearTranslation';
  StoreSpriteCallbackInData6(sprite, 'DestroyAnimSprite');
};

export const GetBattlerSpriteCoord = (runtime: BattleAnimMonsRuntime, battlerId: number, coordType: number): number =>
  getBattlerSpriteCoord(runtime, battlerId, coordType);

export const GetBattlerYDelta = (runtime: BattleAnimMonsRuntime, battlerId: number, _species: number): number =>
  getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER ? 8 : -8;

export const GetBattlerElevation = (runtime: BattleAnimMonsRuntime, battlerId: number): number =>
  getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER ? 0 : 8;

export const GetBattlerSpriteFinal_Y = (runtime: BattleAnimMonsRuntime, battlerId: number, species = 0, _a = false): number =>
  GetBattlerSpriteDefault_Y(runtime, battlerId) + GetBattlerYDelta(runtime, battlerId, species);

export const GetBattlerSpriteCoord2 = (runtime: BattleAnimMonsRuntime, battlerId: number, coordType: number): number =>
  GetBattlerSpriteCoord(runtime, battlerId, coordType);

export const GetBattlerSpriteDefault_Y = (runtime: BattleAnimMonsRuntime, battlerId: number): number =>
  getBattlerSpriteCoord(runtime, battlerId, BATTLER_COORD_Y);

export const GetSubstituteSpriteDefault_Y = (runtime: BattleAnimMonsRuntime, battlerId: number): number =>
  GetBattlerSpriteDefault_Y(runtime, battlerId) + (getBattlerSide(runtime, battlerId) === B_SIDE_PLAYER ? 16 : -16);

export const GetGhostSpriteDefault_Y = (runtime: BattleAnimMonsRuntime, battlerId: number): number =>
  GetBattlerSpriteDefault_Y(runtime, battlerId) - 8;

export const GetBattlerYCoordWithElevation = (runtime: BattleAnimMonsRuntime, battlerId: number): number =>
  GetBattlerSpriteDefault_Y(runtime, battlerId) + GetBattlerElevation(runtime, battlerId);

export const GetAnimBattlerSpriteId = (_runtime: BattleAnimMonsRuntime, battlerId: number): number => battlerId;

export const SetCallbackToStoredInData6 = (sprite: BattleAnimMonsSprite): void => setCallbackToStoredInData6(sprite);

export const TranslateSpriteInLissajousCurve = (sprite: BattleAnimMonsSprite): void => {
  if (sprite.data[3] !== 0) {
    sprite.x2 = sin(sprite.data[0], sprite.data[1]);
    sprite.y2 = sin(sprite.data[0] * 2, sprite.data[4]);
    sprite.data[0] = wrapCirclePos(sprite.data[0] + sprite.data[2]);
    sprite.data[3]--;
  } else {
    setCallbackToStoredInData6(sprite);
  }
};

export const AnimPosToTranslateLinear = (sprite: BattleAnimMonsSprite): void => ConvertPosDataToTranslateLinearData(sprite);

export const TranslateSpriteLinearFixedPointIconFrame = (sprite: BattleAnimMonsSprite): void => {
  TranslateSpriteLinearFixedPoint(sprite);
  if (sprite.data[0] > 0)
    sprite.animNum = sprite.data[0] & 1;
};

export const TranslateSpriteToBattleTargetPos = (runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite): void => {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_X_2);
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_Y_PIC_OFFSET);
  StartAnimLinearTranslation(sprite);
};

export const SetupAndStartSpriteLinearTranslationToAttacker = (runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite): void => {
  sprite.data[1] = sprite.x;
  sprite.data[3] = sprite.y;
  sprite.data[2] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2);
  sprite.data[4] = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET);
  StartAnimLinearTranslation(sprite);
};

export const EndUnkPaletteAnim = (runtime: BattleAnimMonsRuntime, taskId: number): void => {
  runtime.destroyedVisualTasks.push(taskId);
  runtime.calls.push({ fn: 'EndUnkPaletteAnim', args: [taskId] });
};

export const SetSpriteCoordsToAnimAttackerCoords = (runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_X_2);
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimAttacker, BATTLER_COORD_Y_PIC_OFFSET);
};

export const SetAnimSpriteInitialXOffset = (runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite, xOffset = runtime.battleAnimArgs[0] ?? 0): void => {
  if (getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER)
    xOffset = -xOffset;
  sprite.x += xOffset;
};

export const InitSpritePosToAnimTarget = (runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite, respectSide = true): void => {
  sprite.x = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_X_2);
  sprite.y = getBattlerSpriteCoord(runtime, runtime.battleAnimTarget, BATTLER_COORD_Y_PIC_OFFSET);
  if (respectSide && getBattlerSide(runtime, runtime.battleAnimTarget) !== B_SIDE_PLAYER)
    sprite.x2 = -sprite.x2;
};

export const InitSpritePosToAnimAttacker = (runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite, respectSide = true): void => {
  SetSpriteCoordsToAnimAttackerCoords(runtime, sprite);
  if (respectSide && getBattlerSide(runtime, runtime.battleAnimAttacker) !== B_SIDE_PLAYER)
    sprite.x2 = -sprite.x2;
};

export const GetBattlerSide = (runtime: BattleAnimMonsRuntime, battlerId: number): number => getBattlerSide(runtime, battlerId);
export const GetBattlerPosition = (runtime: BattleAnimMonsRuntime, battlerId: number): number => runtime.battlerSides[battlerId] ?? battlerId;
export const GetBattlerAtPosition = (runtime: BattleAnimMonsRuntime, position: number): number => Number(Object.entries(runtime.battlerSides).find(([, sideValue]) => sideValue === position)?.[0] ?? 0);
export const IsBattlerSpritePresent = (runtime: BattleAnimMonsRuntime, battlerId: number): boolean => !runtime.sprites[battlerId]?.invisible;
export const IsDoubleBattle = (runtime: BattleAnimMonsRuntime): boolean => Object.keys(runtime.battlerSides).length > 2;

export const GetBattleAnimBg1Data = (runtime: BattleAnimMonsRuntime): Record<string, number> => ({ ...runtime.gpuRegs });
export const GetBattleAnimBgData = (runtime: BattleAnimMonsRuntime, bg: number): Record<string, number> => ({ bg, ...runtime.gpuRegs });
export const GetBattleAnimBgDataByPriorityRank = (runtime: BattleAnimMonsRuntime, rank: number): Record<string, number> => ({ rank, ...runtime.gpuRegs });
export const InitBattleAnimBg = (runtime: BattleAnimMonsRuntime, bg: number): void => { runtime.calls.push({ fn: 'InitBattleAnimBg', args: [bg] }); };
export const AnimLoadCompressedBgGfx = (runtime: BattleAnimMonsRuntime, bg: number, src: unknown, tilesOffset: number): void => { runtime.calls.push({ fn: 'AnimLoadCompressedBgGfx', args: [bg, src, tilesOffset] }); };
export const InitAnimBgTilemapBuffer = (runtime: BattleAnimMonsRuntime, bg: number): void => { runtime.calls.push({ fn: 'InitAnimBgTilemapBuffer', args: [bg] }); };
export const AnimLoadCompressedBgTilemap = (runtime: BattleAnimMonsRuntime, bg: number, src: unknown): void => { runtime.calls.push({ fn: 'AnimLoadCompressedBgTilemap', args: [bg, src] }); };
export const GetBattleBgPaletteNum = (_runtime: BattleAnimMonsRuntime, bg: number): number => bg & 0xf;
export const ToggleBg3Mode = (runtime: BattleAnimMonsRuntime): void => { runtime.gpuRegs.BG3_MODE = runtime.gpuRegs.BG3_MODE ? 0 : 1; };

export const Trade_MoveSelectedMonToTarget = (sprite: BattleAnimMonsSprite): void => TranslateSpriteLinear(sprite);
export const PlayerThrowBall_StartAnimLinearTranslation = (sprite: BattleAnimMonsSprite): void => StartAnimLinearTranslation(sprite);
export const PlayerThrowBall_AnimTranslateLinear_WithFollowup = (sprite: BattleAnimMonsSprite): void => AnimTranslateLinear_WithFollowup(sprite);
export const InitAnimLinearTranslationWithSpeed = (sprite: BattleAnimMonsSprite): void => InitAnimFastLinearTranslationWithSpeed(sprite);
export const InitAnimLinearTranslationWithSpeedAndPos = (sprite: BattleAnimMonsSprite): void => InitAnimFastLinearTranslationWithSpeedAndPos(sprite);

export const SetSpriteRotScale = (sprite: BattleAnimMonsSprite, scaleX: number, scaleY: number, rotation: number): void => {
  sprite.scaleX = scaleX;
  sprite.scaleY = scaleY;
  sprite.rotation = rotation;
};

export const ShouldRotScaleSpeciesBeFlipped = (species: number): boolean => species === 201;
export const PrepareBattlerSpriteForRotScale = (_runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite, scaleX = 0x100, scaleY = 0x100, rotation = 0): void => SetSpriteRotScale(sprite, scaleX, scaleY, rotation);
export const ResetSpriteRotScale = (sprite: BattleAnimMonsSprite): void => SetSpriteRotScale(sprite, 0x100, 0x100, 0);
export const SetBattlerSpriteYOffsetFromRotation = (_runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite): void => { sprite.y2 = div(sprite.rotation, 16); };
export const TrySetSpriteRotScale = (_runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite, scaleX: number, scaleY: number, rotation: number): boolean => { SetSpriteRotScale(sprite, scaleX, scaleY, rotation); return true; };
export const TryResetSpriteAffineState = (_runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite): boolean => { ResetSpriteRotScale(sprite); return true; };
export const ArcTan2_ = (x: number, y: number): number => Math.atan2(y, x);
export const ArcTan2Neg = (x: number, y: number): number => Math.atan2(-y, -x);

export const SetGreyscaleOrOriginalPalette = (runtime: BattleAnimMonsRuntime, palNum: number, greyscale: boolean): void => { runtime.calls.push({ fn: 'SetGreyscaleOrOriginalPalette', args: [palNum, greyscale] }); };
export const GetBattlePalettesMask = (_runtime: BattleAnimMonsRuntime, battleTypeFlags = 0): number => battleTypeFlags ? 0xf : 0x3;
export const GetBattleMonSpritePalettesMask = (_runtime: BattleAnimMonsRuntime): number => 0xf;
export const GetSpritePalIdxByBattler = (_runtime: BattleAnimMonsRuntime, battlerId: number): number => battlerId;
export const GetSpritePalIdxByPosition = (_runtime: BattleAnimMonsRuntime, position: number): number => position;

export const AnimSpriteOnMonPos = (runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite): void => InitSpritePosToAnimTarget(runtime, sprite, false);
export const TranslateAnimSpriteToTargetMonLocation = (runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite): void => TranslateSpriteToBattleTargetPos(runtime, sprite);
export const AnimTravelDiagonally = (sprite: BattleAnimMonsSprite): void => TranslateSpriteLinearFixedPoint(sprite);

export const CloneBattlerSpriteWithBlend = (runtime: BattleAnimMonsRuntime, battlerId: number): number => {
  const src = runtime.sprites[battlerId] ?? createBattleAnimMonsSprite({ id: battlerId });
  const clone = createBattleAnimMonsSprite({ ...src, id: runtime.sprites.length });
  runtime.sprites.push(clone);
  runtime.calls.push({ fn: 'CloneBattlerSpriteWithBlend', args: [battlerId, clone.id] });
  return clone.id;
};

export const DestroySpriteWithActiveSheet = (runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite): void => DestroySpriteAndMatrix(runtime, sprite);
export const AnimTask_AlphaFadeIn = (runtime: BattleAnimMonsRuntime, taskId: number): void => { runtime.calls.push({ fn: 'AnimTask_AlphaFadeIn', args: [taskId] }); };
export const AnimTask_AlphaFadeIn_Step = (runtime: BattleAnimMonsRuntime, taskId: number): void => { runtime.calls.push({ fn: 'AnimTask_AlphaFadeIn_Step', args: [taskId] }); };
export const AnimTask_BlendMonInAndOut = (runtime: BattleAnimMonsRuntime, taskId: number): void => { runtime.calls.push({ fn: 'AnimTask_BlendMonInAndOut', args: [taskId] }); };
export const AnimTask_BlendMonInAndOutSetup = (runtime: BattleAnimMonsRuntime, taskId: number): void => { runtime.calls.push({ fn: 'AnimTask_BlendMonInAndOutSetup', args: [taskId] }); };
export const AnimTask_BlendMonInAndOut_Step = (runtime: BattleAnimMonsRuntime, taskId: number): void => { runtime.calls.push({ fn: 'AnimTask_BlendMonInAndOut_Step', args: [taskId] }); };
export const AnimTask_BlendPalInAndOutByTag = (runtime: BattleAnimMonsRuntime, taskId: number): void => { runtime.calls.push({ fn: 'AnimTask_BlendPalInAndOutByTag', args: [taskId] }); };

export const PrepareAffineAnimInTaskData = (runtime: BattleAnimMonsRuntime, taskId: number, spriteId: number): void => { runtime.calls.push({ fn: 'PrepareAffineAnimInTaskData', args: [taskId, spriteId] }); };
export const RunAffineAnimFromTaskData = (runtime: BattleAnimMonsRuntime, taskId: number): void => { runtime.calls.push({ fn: 'RunAffineAnimFromTaskData', args: [taskId] }); };
export const SetBattlerSpriteYOffsetFromYScale = (_runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite): void => { sprite.y2 = div(sprite.scaleY - 0x100, 16); };
export const SetBattlerSpriteYOffsetFromOtherYScale = (_runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite, other: BattleAnimMonsSprite): void => { sprite.y2 = div(other.scaleY - 0x100, 16); };
export const GetBattlerYDeltaFromSpriteId = (runtime: BattleAnimMonsRuntime, spriteId: number): number => GetBattlerYDelta(runtime, spriteId, 0);
export const StorePointerInVars = (runtime: BattleAnimMonsRuntime, ptr: unknown): void => { runtime.calls.push({ fn: 'StorePointerInVars', args: [ptr] }); };
export const LoadPointerFromVars = (lo: number, hi: number): number => ((lo & 0xffff) | ((hi & 0xffff) << 16)) >>> 0;

export const BattleAnimHelper_SetSpriteSquashParams = (sprite: BattleAnimMonsSprite, scaleX: number, scaleY: number, duration: number): void => {
  sprite.data[0] = duration;
  sprite.data[1] = scaleX;
  sprite.data[2] = scaleY;
};

export const BattleAnimHelper_RunSpriteSquash = (sprite: BattleAnimMonsSprite): boolean => {
  if (sprite.data[0] > 0) {
    sprite.data[0]--;
    sprite.scaleX = sprite.data[1];
    sprite.scaleY = sprite.data[2];
    return false;
  }
  ResetSpriteRotScale(sprite);
  return true;
};

export const AnimTask_GetFrustrationPowerLevel = (_runtime: BattleAnimMonsRuntime, friendship: number): number => Math.min(3, Math.trunc((255 - friendship) / 64));
export const SetPriorityForVisibleBattlers = (runtime: BattleAnimMonsRuntime, priority: number): void => { for (const sprite of runtime.sprites) if (!sprite.invisible) sprite.priority = priority; };
export const InitPrioritiesForVisibleBattlers = (runtime: BattleAnimMonsRuntime): void => SetPriorityForVisibleBattlers(runtime, 2);
export const GetBattlerSpriteSubpriority = (runtime: BattleAnimMonsRuntime, battlerId: number): number => runtime.sprites[battlerId]?.subpriority ?? battlerId;
export const GetBattlerSpriteBGPriority = (runtime: BattleAnimMonsRuntime, battlerId: number): number => runtime.sprites[battlerId]?.bgPriority ?? 2;
export const GetBattlerSpriteBGPriorityRank = (runtime: BattleAnimMonsRuntime, battlerId: number): number => GetBattlerSpriteBGPriority(runtime, battlerId);

export const CreateAdditionalMonSpriteForMoveAnim = (runtime: BattleAnimMonsRuntime, battlerId: number): number => CloneBattlerSpriteWithBlend(runtime, battlerId);
export const DestroySpriteAndFreeResources_ = (runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite): void => DestroySpriteAndMatrix(runtime, sprite);
export const GetBattlerSpriteCoordAttr = (runtime: BattleAnimMonsRuntime, battlerId: number, attr: number): number => GetBattlerSpriteCoord(runtime, battlerId, attr);

export const SetAverageBattlerPositions = (runtime: BattleAnimMonsRuntime, sprite: BattleAnimMonsSprite, left: number, right: number): void => {
  sprite.x = div(GetBattlerSpriteCoord(runtime, left, BATTLER_COORD_X_2) + GetBattlerSpriteCoord(runtime, right, BATTLER_COORD_X_2), 2);
  sprite.y = div(GetBattlerSpriteCoord(runtime, left, BATTLER_COORD_Y_PIC_OFFSET) + GetBattlerSpriteCoord(runtime, right, BATTLER_COORD_Y_PIC_OFFSET), 2);
};

export const CreateInvisibleSpriteCopy = (runtime: BattleAnimMonsRuntime, spriteId: number): number => {
  const src = runtime.sprites[spriteId] ?? createBattleAnimMonsSprite({ id: spriteId });
  const copy = createBattleAnimMonsSprite({ ...src, id: runtime.sprites.length, invisible: true });
  runtime.sprites.push(copy);
  return copy.id;
};

export const AnimTranslateLinearAndFlicker_Flipped = (sprite: BattleAnimMonsSprite): void => {
  sprite.x2 = -sprite.x2;
  TranslateSpriteLinearAndFlicker(sprite);
};

export const AnimTranslateLinearAndFlicker = (sprite: BattleAnimMonsSprite): void => TranslateSpriteLinearAndFlicker(sprite);

export const AnimSpinningSparkle = (sprite: BattleAnimMonsSprite): void => {
  sprite.x2 = sin(sprite.data[0], sprite.data[1]);
  sprite.y2 = cos(sprite.data[0], sprite.data[1]);
  sprite.data[0] = wrapCirclePos(sprite.data[0] + sprite.data[2]);
};

export const AnimTask_AttackerPunchWithTrace = (runtime: BattleAnimMonsRuntime, taskId: number): void => { runtime.calls.push({ fn: 'AnimTask_AttackerPunchWithTrace', args: [taskId] }); };
export const AnimTask_AttackerPunchWithTrace_Step = (runtime: BattleAnimMonsRuntime, taskId: number): void => { runtime.calls.push({ fn: 'AnimTask_AttackerPunchWithTrace_Step', args: [taskId] }); };
export const CreateBattlerTrace = (runtime: BattleAnimMonsRuntime, battlerId: number): number => CreateInvisibleSpriteCopy(runtime, battlerId);
export const AnimBattlerTrace = (sprite: BattleAnimMonsSprite): void => {
  if (sprite.data[0] > 0)
    sprite.data[0]--;
  else
    sprite.destroyed = true;
};
