import { gSineTable } from './decompTrig';

export const MAX_RFU_PLAYERS = 5;
export const MAX_JUMP_SCORE = 99990;
export const MAX_JUMPS = 9999;
export const JUMP_PEAK = -30;

export const JUMP_TYPE_NORMAL = 0;
export const JUMP_TYPE_FAST = 1;
export const JUMP_TYPE_SLOW = 2;

export const MONSTATE_NORMAL = 0;
export const MONSTATE_JUMP = 1;
export const MONSTATE_HIT = 2;

export const JUMPSTATE_NONE = 0;
export const JUMPSTATE_SUCCESS = 1;
export const JUMPSTATE_FAILURE = 2;

export const PLAY_AGAIN_NO = 1;
export const PLAY_AGAIN_YES = 2;

export const VINE_HIGHEST = 0;
export const VINE_DOWNSWING_HIGHER = 1;
export const VINE_DOWNSWING_HIGH = 2;
export const VINE_DOWNSWING_LOW = 3;
export const VINE_DOWNSWING_LOWER = 4;
export const VINE_LOWEST = 5;
export const VINE_UPSWING_LOWER = 6;
export const VINE_UPSWING_LOW = 7;
export const VINE_UPSWING_HIGH = 8;
export const VINE_UPSWING_HIGHER = 9;
export const NUM_VINESTATES = 10;

export const SE_BIKE_HOP = 28;

export const ITEM_LEPPA_BERRY = 138;
export const ITEM_LUM_BERRY = 141;
export const ITEM_SITRUS_BERRY = 142;
export const ITEM_FIGY_BERRY = 143;
export const ITEM_WIKI_BERRY = 144;
export const ITEM_MAGO_BERRY = 145;
export const ITEM_AGUAV_BERRY = 146;
export const ITEM_IAPAPA_BERRY = 147;

export interface PokemonJumpMon {
  species: number;
  jumpType: number;
}

export interface PokemonJumpPlayer {
  name?: string;
  jumpTimeStart: number;
  monState: number;
  prevMonState: number;
  jumpOffset: number;
  jumpOffsetIdx: number;
  jumpState: number;
}

export interface PokemonJumpCommData {
  jumpScore: number;
  receivedBonusFlags: number;
  jumpsInRow: number;
}

export interface PokemonJumpRecords {
  jumpsInRow: number;
  bestJumpScore: number;
  excellentsInRow: number;
  gamesWithMaxPlayers: number;
  unused1: number;
  unused2: number;
}

export interface PokemonJumpMonInfo {
  species: number;
  otId: number;
  personality: number;
}

export type PokemonJumpSpriteCallback =
  | 'SpriteCallbackDummy'
  | 'SpriteCB_Star'
  | 'SpriteCB_MonHitShake'
  | 'SpriteCB_MonHitFlash'
  | 'SpriteCB_MonIntroBounce';

export interface PokemonJumpSprite {
  spriteId: number;
  data: number[];
  y: number;
  y2: number;
  invisible: boolean;
  callback: PokemonJumpSpriteCallback;
  animEnded: boolean;
  animNum: number;
  subpriority: number;
}

export interface PokemonJumpGfx {
  monSprites: Array<PokemonJumpSprite | null>;
  starSprites: Array<PokemonJumpSprite | null>;
  monSpriteSubpriorities: number[];
}

export interface PokemonJumpRuntime {
  numPlayers: number;
  playAgainState: number;
  playAgainStates: number[];
  atJumpPeak: boolean[];
  showBonus: boolean;
  updateScore: boolean;
  vineTimer: number;
  vineState: number;
  prevVineState: number;
  vineStateTimer: number;
  vineSpeed: number;
  vineSpeedAccel: number;
  rngSeed: number;
  nextVineSpeed: number;
  ignoreJumpInput: number;
  gameOver: boolean;
  vineSpeedDelay: number;
  vineBaseSpeedIdx: number;
  vineSpeedStage: number;
  allowVineUpdates: boolean;
  atMaxSpeedStage: boolean;
  excellentsInRowRecord: number;
  comm: PokemonJumpCommData;
  players: PokemonJumpPlayer[];
  records: PokemonJumpRecords;
  gfx: PokemonJumpGfx;
  playedSoundEffects: number[];
  shownBonuses: number[];
}

export const sPokeJumpMons: PokemonJumpMon[] = [
  { species: 1, jumpType: JUMP_TYPE_SLOW },
  { species: 4, jumpType: JUMP_TYPE_FAST },
  { species: 7, jumpType: JUMP_TYPE_NORMAL },
  { species: 10, jumpType: JUMP_TYPE_FAST },
  { species: 11, jumpType: JUMP_TYPE_FAST },
  { species: 13, jumpType: JUMP_TYPE_FAST },
  { species: 14, jumpType: JUMP_TYPE_FAST },
  { species: 19, jumpType: JUMP_TYPE_FAST },
  { species: 20, jumpType: JUMP_TYPE_FAST },
  { species: 25, jumpType: JUMP_TYPE_NORMAL },
  { species: 27, jumpType: JUMP_TYPE_NORMAL },
  { species: 29, jumpType: JUMP_TYPE_NORMAL },
  { species: 32, jumpType: JUMP_TYPE_NORMAL },
  { species: 35, jumpType: JUMP_TYPE_NORMAL },
  { species: 37, jumpType: JUMP_TYPE_NORMAL },
  { species: 39, jumpType: JUMP_TYPE_SLOW },
  { species: 43, jumpType: JUMP_TYPE_SLOW },
  { species: 46, jumpType: JUMP_TYPE_FAST },
  { species: 52, jumpType: JUMP_TYPE_NORMAL },
  { species: 54, jumpType: JUMP_TYPE_SLOW },
  { species: 56, jumpType: JUMP_TYPE_FAST },
  { species: 58, jumpType: JUMP_TYPE_FAST },
  { species: 60, jumpType: JUMP_TYPE_SLOW },
  { species: 69, jumpType: JUMP_TYPE_SLOW },
  { species: 90, jumpType: JUMP_TYPE_FAST },
  { species: 98, jumpType: JUMP_TYPE_FAST },
  { species: 102, jumpType: JUMP_TYPE_SLOW },
  { species: 104, jumpType: JUMP_TYPE_NORMAL },
  { species: 132, jumpType: JUMP_TYPE_SLOW },
  { species: 133, jumpType: JUMP_TYPE_NORMAL },
  { species: 138, jumpType: JUMP_TYPE_FAST },
  { species: 140, jumpType: JUMP_TYPE_FAST },
  { species: 152, jumpType: JUMP_TYPE_SLOW },
  { species: 155, jumpType: JUMP_TYPE_FAST },
  { species: 158, jumpType: JUMP_TYPE_NORMAL },
  { species: 167, jumpType: JUMP_TYPE_FAST },
  { species: 172, jumpType: JUMP_TYPE_NORMAL },
  { species: 173, jumpType: JUMP_TYPE_NORMAL },
  { species: 174, jumpType: JUMP_TYPE_SLOW },
  { species: 175, jumpType: JUMP_TYPE_SLOW },
  { species: 179, jumpType: JUMP_TYPE_NORMAL },
  { species: 182, jumpType: JUMP_TYPE_SLOW },
  { species: 183, jumpType: JUMP_TYPE_SLOW },
  { species: 191, jumpType: JUMP_TYPE_SLOW },
  { species: 194, jumpType: JUMP_TYPE_SLOW },
  { species: 204, jumpType: JUMP_TYPE_SLOW },
  { species: 209, jumpType: JUMP_TYPE_NORMAL },
  { species: 213, jumpType: JUMP_TYPE_SLOW },
  { species: 216, jumpType: JUMP_TYPE_NORMAL },
  { species: 218, jumpType: JUMP_TYPE_SLOW },
  { species: 220, jumpType: JUMP_TYPE_NORMAL },
  { species: 228, jumpType: JUMP_TYPE_FAST },
  { species: 231, jumpType: JUMP_TYPE_NORMAL },
  { species: 233, jumpType: JUMP_TYPE_NORMAL },
  { species: 236, jumpType: JUMP_TYPE_FAST },
  { species: 238, jumpType: JUMP_TYPE_SLOW },
  { species: 239, jumpType: JUMP_TYPE_FAST },
  { species: 240, jumpType: JUMP_TYPE_FAST },
  { species: 246, jumpType: JUMP_TYPE_FAST },
  { species: 277, jumpType: JUMP_TYPE_FAST },
  { species: 280, jumpType: JUMP_TYPE_SLOW },
  { species: 283, jumpType: JUMP_TYPE_NORMAL },
  { species: 284, jumpType: JUMP_TYPE_NORMAL },
  { species: 286, jumpType: JUMP_TYPE_FAST },
  { species: 288, jumpType: JUMP_TYPE_NORMAL },
  { species: 289, jumpType: JUMP_TYPE_NORMAL },
  { species: 290, jumpType: JUMP_TYPE_FAST },
  { species: 291, jumpType: JUMP_TYPE_SLOW },
  { species: 293, jumpType: JUMP_TYPE_SLOW },
  { species: 295, jumpType: JUMP_TYPE_SLOW },
  { species: 298, jumpType: JUMP_TYPE_FAST },
  { species: 392, jumpType: JUMP_TYPE_NORMAL },
  { species: 393, jumpType: JUMP_TYPE_NORMAL },
  { species: 311, jumpType: JUMP_TYPE_SLOW },
  { species: 306, jumpType: JUMP_TYPE_SLOW },
  { species: 301, jumpType: JUMP_TYPE_FAST },
  { species: 370, jumpType: JUMP_TYPE_NORMAL },
  { species: 350, jumpType: JUMP_TYPE_SLOW },
  { species: 315, jumpType: JUMP_TYPE_NORMAL },
  { species: 322, jumpType: JUMP_TYPE_NORMAL },
  { species: 355, jumpType: JUMP_TYPE_NORMAL },
  { species: 382, jumpType: JUMP_TYPE_FAST },
  { species: 356, jumpType: JUMP_TYPE_SLOW },
  { species: 337, jumpType: JUMP_TYPE_FAST },
  { species: 353, jumpType: JUMP_TYPE_FAST },
  { species: 354, jumpType: JUMP_TYPE_FAST },
  { species: 386, jumpType: JUMP_TYPE_NORMAL },
  { species: 387, jumpType: JUMP_TYPE_NORMAL },
  { species: 363, jumpType: JUMP_TYPE_SLOW },
  { species: 367, jumpType: JUMP_TYPE_SLOW },
  { species: 339, jumpType: JUMP_TYPE_SLOW },
  { species: 321, jumpType: JUMP_TYPE_SLOW },
  { species: 351, jumpType: JUMP_TYPE_NORMAL },
  { species: 332, jumpType: JUMP_TYPE_SLOW },
  { species: 344, jumpType: JUMP_TYPE_SLOW },
  { species: 390, jumpType: JUMP_TYPE_FAST },
  { species: 360, jumpType: JUMP_TYPE_NORMAL },
  { species: 346, jumpType: JUMP_TYPE_NORMAL },
  { species: 373, jumpType: JUMP_TYPE_FAST },
  { species: 395, jumpType: JUMP_TYPE_FAST }
];

const sScoreBonuses = [0, 0, 50, 100, 200, 500] as const;
const sPrizeItems = [
  ITEM_LEPPA_BERRY,
  ITEM_LUM_BERRY,
  ITEM_SITRUS_BERRY,
  ITEM_FIGY_BERRY,
  ITEM_WIKI_BERRY,
  ITEM_MAGO_BERRY,
  ITEM_AGUAV_BERRY,
  ITEM_IAPAPA_BERRY
] as const;

const sPrizeQuantityData = [
  { score: 5000, quantity: 1 },
  { score: 8000, quantity: 2 },
  { score: 12000, quantity: 3 },
  { score: 16000, quantity: 4 },
  { score: 20000, quantity: 5 }
] as const;

export const createPokemonJumpPlayer = (overrides: Partial<PokemonJumpPlayer> = {}): PokemonJumpPlayer => ({
  jumpTimeStart: 0,
  monState: MONSTATE_NORMAL,
  prevMonState: MONSTATE_NORMAL,
  jumpOffset: 0,
  jumpOffsetIdx: Number.MAX_SAFE_INTEGER,
  jumpState: JUMPSTATE_NONE,
  ...overrides
});

export const createPokemonJumpRecords = (overrides: Partial<PokemonJumpRecords> = {}): PokemonJumpRecords => ({
  jumpsInRow: 0,
  bestJumpScore: 0,
  excellentsInRow: 0,
  gamesWithMaxPlayers: 0,
  unused1: 0,
  unused2: 0,
  ...overrides
});

export const createPokemonJumpSprite = (overrides: Partial<PokemonJumpSprite> = {}): PokemonJumpSprite => ({
  spriteId: 0,
  data: Array.from({ length: 8 }, () => 0),
  y: 0,
  y2: 0,
  invisible: false,
  callback: 'SpriteCallbackDummy',
  animEnded: false,
  animNum: 0,
  subpriority: 0,
  ...overrides
});

export const createPokemonJumpGfx = (overrides: Partial<PokemonJumpGfx> = {}): PokemonJumpGfx => ({
  monSprites: Array.from({ length: MAX_RFU_PLAYERS }, (_unused, i) => createPokemonJumpSprite({ spriteId: i, subpriority: i + 4 })),
  starSprites: Array.from({ length: MAX_RFU_PLAYERS }, (_unused, i) => createPokemonJumpSprite({ spriteId: i + MAX_RFU_PLAYERS, invisible: true })),
  monSpriteSubpriorities: Array.from({ length: MAX_RFU_PLAYERS }, (_unused, i) => i + 4),
  ...overrides
});

export const createPokemonJumpRuntime = (overrides: Partial<PokemonJumpRuntime> = {}): PokemonJumpRuntime => ({
  numPlayers: MAX_RFU_PLAYERS,
  playAgainState: PLAY_AGAIN_YES,
  playAgainStates: Array.from({ length: MAX_RFU_PLAYERS }, () => PLAY_AGAIN_YES),
  atJumpPeak: Array.from({ length: MAX_RFU_PLAYERS }, () => false),
  showBonus: false,
  updateScore: false,
  vineTimer: 0,
  vineState: VINE_UPSWING_LOWER,
  prevVineState: VINE_UPSWING_LOWER,
  vineStateTimer: 0,
  vineSpeed: 0,
  vineSpeedAccel: 0,
  rngSeed: 0,
  nextVineSpeed: 0,
  ignoreJumpInput: 0,
  gameOver: false,
  vineSpeedDelay: 0,
  vineBaseSpeedIdx: 0,
  vineSpeedStage: 0,
  allowVineUpdates: false,
  atMaxSpeedStage: false,
  excellentsInRowRecord: 0,
  comm: {
    jumpScore: 0,
    receivedBonusFlags: 0,
    jumpsInRow: 0
  },
  players: Array.from({ length: MAX_RFU_PLAYERS }, () => createPokemonJumpPlayer()),
  records: createPokemonJumpRecords(),
  gfx: createPokemonJumpGfx(),
  playedSoundEffects: [],
  shownBonuses: [],
  ...overrides
});

export const ResetPokeJumpSpriteData = (sprite: PokemonJumpSprite): void => {
  for (let i = 0; i < sprite.data.length; i += 1)
    sprite.data[i] = 0;
};

const startSpriteAnim = (sprite: PokemonJumpSprite, animNum: number): void => {
  sprite.animNum = animNum;
  sprite.animEnded = false;
};

const playSE = (runtime: PokemonJumpRuntime, soundEffect: number): void => {
  runtime.playedSoundEffects.push(soundEffect);
};

const VINE_STATE_TIMER = (vineState: number): number => (vineState << 8) | 0xff;
const sVineBaseSpeeds = [26, 31, 36, 41, 46, 51, 56, 61] as const;
const sVineSpeedDelays = [0, 1, 1, 2] as const;

export const PokeJumpRandom = (runtime: PokemonJumpRuntime): number => {
  runtime.rngSeed = (Math.imul(1103515245, runtime.rngSeed >>> 0) + 24691) >>> 0;
  return runtime.rngSeed >>> 16;
};

export const InitVineState = (runtime: PokemonJumpRuntime): void => {
  runtime.vineTimer = 0;
  runtime.vineState = VINE_UPSWING_LOWER;
  runtime.vineStateTimer = 0;
  runtime.vineSpeed = 0;
  runtime.ignoreJumpInput = 0;
  runtime.gameOver = false;
};

export const GetVineSpeed = (runtime: PokemonJumpRuntime): number => {
  let speed: number;

  if (runtime.gameOver)
    return 0;

  speed = runtime.vineSpeed;
  if (runtime.vineStateTimer <= VINE_STATE_TIMER(VINE_LOWEST)) {
    runtime.vineSpeedAccel += 80;
    speed += Math.trunc(runtime.vineSpeedAccel / 256);
  }

  return speed;
};

export const UpdateVineSpeed = (runtime: PokemonJumpRuntime): void => {
  let baseSpeed: number;

  runtime.vineSpeedAccel = 0;
  if (runtime.vineSpeedDelay) {
    runtime.vineSpeedDelay -= 1;
    if (runtime.atMaxSpeedStage) {
      if (PokeJumpRandom(runtime) % 4) {
        runtime.vineSpeed = runtime.nextVineSpeed;
      } else if (runtime.nextVineSpeed > 54) {
        runtime.vineSpeed = 30;
      } else {
        runtime.vineSpeed = 82;
      }
    }
  } else if (!(runtime.vineBaseSpeedIdx & sVineBaseSpeeds.length)) {
    runtime.nextVineSpeed = sVineBaseSpeeds[runtime.vineBaseSpeedIdx]! + runtime.vineSpeedStage * 7;
    runtime.vineSpeedDelay = sVineSpeedDelays[PokeJumpRandom(runtime) % sVineSpeedDelays.length]! + 2;
    runtime.vineBaseSpeedIdx += 1;
    runtime.vineSpeed = runtime.nextVineSpeed;
  } else {
    if (runtime.vineBaseSpeedIdx === sVineBaseSpeeds.length) {
      if (runtime.vineSpeedStage < 3)
        runtime.vineSpeedStage += 1;
      else
        runtime.atMaxSpeedStage = true;
    }

    baseSpeed = sVineBaseSpeeds[15 - runtime.vineBaseSpeedIdx]!;
    runtime.nextVineSpeed = baseSpeed + runtime.vineSpeedStage * 7;
    runtime.vineBaseSpeedIdx += 1;
    if (runtime.vineBaseSpeedIdx > 15) {
      if (PokeJumpRandom(runtime) % 4 === 0)
        runtime.nextVineSpeed -= 5;

      runtime.vineBaseSpeedIdx = 0;
    }

    runtime.vineSpeed = runtime.nextVineSpeed;
  }
};

export const ResetVineState = (runtime: PokemonJumpRuntime): void => {
  runtime.vineTimer = 0;
  runtime.vineStateTimer = VINE_STATE_TIMER(VINE_UPSWING_LOWER);
  runtime.vineState = VINE_UPSWING_LOW;
  runtime.ignoreJumpInput = 0;
  runtime.gameOver = false;
  runtime.vineSpeedStage = 0;
  runtime.vineBaseSpeedIdx = 0;
  runtime.vineSpeedAccel = 0;
  runtime.vineSpeedDelay = 0;
  runtime.atMaxSpeedStage = false;
  UpdateVineSpeed(runtime);
};

export const UpdateVineState = (runtime: PokemonJumpRuntime): void => {
  if (runtime.allowVineUpdates) {
    runtime.vineTimer += 1;
    runtime.vineStateTimer += GetVineSpeed(runtime);
    if (runtime.vineStateTimer >= VINE_STATE_TIMER(NUM_VINESTATES - 1))
      runtime.vineStateTimer -= VINE_STATE_TIMER(NUM_VINESTATES - 1);

    runtime.prevVineState = runtime.vineState;
    runtime.vineState = runtime.vineStateTimer >> 8;

    if (runtime.vineState > VINE_UPSWING_LOWER && runtime.prevVineState < VINE_UPSWING_LOW) {
      runtime.ignoreJumpInput += 1;
      UpdateVineSpeed(runtime);
    }
  }
};

export const ResetVineAfterHit = (runtime: PokemonJumpRuntime): void => {
  runtime.gameOver = true;
  runtime.vineState = VINE_UPSWING_LOWER;
  runtime.vineStateTimer = VINE_STATE_TIMER(VINE_LOWEST);
  runtime.allowVineUpdates = true;
};

export const DisallowVineUpdates = (runtime: PokemonJumpRuntime): void => {
  runtime.allowVineUpdates = false;
};

export const AllowVineUpdates = (runtime: PokemonJumpRuntime): void => {
  runtime.allowVineUpdates = true;
};

export const DoStarAnim = (runtime: PokemonJumpRuntime, multiplayerId: number): void => {
  const starSprite = runtime.gfx.starSprites[multiplayerId];
  const monSprite = runtime.gfx.monSprites[multiplayerId];
  if (!starSprite)
    return;

  ResetPokeJumpSpriteData(starSprite);
  starSprite.data[7] = monSprite?.spriteId ?? 0;
  starSprite.invisible = false;
  starSprite.y = 96;
  starSprite.callback = 'SpriteCB_Star';
  startSpriteAnim(starSprite, 1);
};

export const SpriteCB_Star = (sprite: PokemonJumpSprite): void => {
  switch (sprite.data[0]) {
    case 0:
      if (sprite.animEnded) {
        sprite.invisible = true;
        sprite.callback = 'SpriteCallbackDummy';
      }
      break;
    case 1:
      sprite.y--;
      sprite.data[1]++;
      if (sprite.y <= 72) {
        sprite.y = 72;
        sprite.data[0]++;
      }
      break;
    case 2:
      if (++sprite.data[1] >= 48) {
        sprite.invisible = true;
        sprite.callback = 'SpriteCallbackDummy';
      }
      break;
  }
};

export const Gfx_StartMonHitShake = (runtime: PokemonJumpRuntime, multiplayerId: number): void => {
  const sprite = runtime.gfx.monSprites[multiplayerId];
  if (!sprite)
    return;
  sprite.callback = 'SpriteCB_MonHitShake';
  sprite.y2 = 0;
  ResetPokeJumpSpriteData(sprite);
};

export const Gfx_IsMonHitShakeActive = (runtime: PokemonJumpRuntime, multiplayerId: number): boolean =>
  runtime.gfx.monSprites[multiplayerId]?.callback === 'SpriteCB_MonHitShake';

export const IsGameOver = (runtime = req()): number => runtime.gameOver ? 1 : 0;
export const IsMonHitShakeActive = (multiplayerId: number, runtime = req()): number =>
  Gfx_IsMonHitShakeActive(runtime, multiplayerId) ? 1 : 0;

export const SpriteCB_MonHitShake = (sprite: PokemonJumpSprite): void => {
  if (++sprite.data[1] > 1) {
    if (++sprite.data[2] & 1)
      sprite.y2 = 2;
    else
      sprite.y2 = -2;

    sprite.data[1] = 0;
  }

  if (sprite.data[2] > 12) {
    sprite.y2 = 0;
    sprite.callback = 'SpriteCallbackDummy';
  }
};

export const Gfx_StartMonHitFlash = (runtime: PokemonJumpRuntime, multiplayerId: number): void => {
  const sprite = runtime.gfx.monSprites[multiplayerId];
  if (!sprite)
    return;
  ResetPokeJumpSpriteData(sprite);
  sprite.callback = 'SpriteCB_MonHitFlash';
};

export const Gfx_StopMonHitFlash = (runtime: PokemonJumpRuntime): void => {
  for (let i = 0; i < runtime.numPlayers; i += 1) {
    const sprite = runtime.gfx.monSprites[i];
    if (sprite?.callback === 'SpriteCB_MonHitFlash') {
      sprite.invisible = false;
      sprite.callback = 'SpriteCallbackDummy';
      sprite.subpriority = 10;
    }
  }
};

export const SpriteCB_MonHitFlash = (sprite: PokemonJumpSprite): void => {
  if (++sprite.data[0] > 3) {
    sprite.data[0] = 0;
    sprite.invisible = !sprite.invisible;
  }
};

export const Gfx_ResetMonSpriteSubpriorities = (runtime: PokemonJumpRuntime): void => {
  for (let i = 0; i < runtime.numPlayers; i += 1) {
    const sprite = runtime.gfx.monSprites[i];
    if (sprite)
      sprite.subpriority = runtime.gfx.monSpriteSubpriorities[i];
  }
};

export const Gfx_StartMonIntroBounce = (runtime: PokemonJumpRuntime, multiplayerId: number): void => {
  const sprite = runtime.gfx.monSprites[multiplayerId];
  if (!sprite)
    return;
  ResetPokeJumpSpriteData(sprite);
  sprite.callback = 'SpriteCB_MonIntroBounce';
};

export const Gfx_IsMonIntroBounceActive = (runtime: PokemonJumpRuntime): boolean => {
  for (let i = 0; i < runtime.numPlayers; i += 1) {
    if (runtime.gfx.monSprites[i]?.callback === 'SpriteCB_MonIntroBounce')
      return true;
  }

  return false;
};

export const IsMonIntroBounceActive = (runtime = req()): number =>
  Gfx_IsMonIntroBounceActive(runtime) ? 1 : 0;

export const SpriteCB_MonIntroBounce = (runtime: PokemonJumpRuntime, sprite: PokemonJumpSprite): void => {
  switch (sprite.data[0]) {
    case 0:
      playSE(runtime, SE_BIKE_HOP);
      sprite.data[1] = 0;
      sprite.data[0]++;
      // fall through
    case 1:
      sprite.data[1] += 4;
      if (sprite.data[1] > 127)
        sprite.data[1] = 0;

      sprite.y2 = -(gSineTable[sprite.data[1]] >> 3);
      if (sprite.data[1] === 0) {
        if (++sprite.data[2] < 2)
          sprite.data[0] = 0;
        else
          sprite.callback = 'SpriteCallbackDummy';
      }
      break;
  }
};

export const DoSameJumpTimeBonus = (runtime: PokemonJumpRuntime, flags: number): number => {
  let numPlayers = 0;

  for (let i = 0; i < MAX_RFU_PLAYERS; i += 1) {
    if (flags & 1) {
      DoStarAnim(runtime, i);
      numPlayers++;
    }
    flags >>= 1;
  }

  runtime.shownBonuses.push(numPlayers - 2);
  return numPlayers;
};

export const GetPokemonJumpSpeciesIdx = (species: number): number => {
  for (let i = 0; i < sPokeJumpMons.length; i += 1) {
    if (sPokeJumpMons[i].species === species) {
      return i;
    }
  }

  return -1;
};

export const IsSpeciesAllowedInPokemonJump = (species: number): boolean => GetPokemonJumpSpeciesIdx(species) > -1;

export const AllPlayersJumpedOrHit = (runtime: PokemonJumpRuntime): boolean => {
  let numJumpedOrHit = 0;
  for (let i = 0; i < runtime.numPlayers; i += 1) {
    if (runtime.players[i].jumpState !== JUMPSTATE_NONE) {
      numJumpedOrHit += 1;
    }
  }

  return numJumpedOrHit === runtime.numPlayers;
};

export const DidAllPlayersClearVine = (runtime: PokemonJumpRuntime): boolean => {
  for (let i = 0; i < runtime.numPlayers; i += 1) {
    if (runtime.players[i].jumpState !== JUMPSTATE_SUCCESS) {
      return false;
    }
  }

  return true;
};

export const ShouldPlayAgain = (runtime: PokemonJumpRuntime): boolean => {
  if (runtime.playAgainState === PLAY_AGAIN_NO) {
    return false;
  }

  for (let i = 1; i < runtime.numPlayers; i += 1) {
    if (runtime.playAgainStates[i] === PLAY_AGAIN_NO) {
      return false;
    }
  }

  return true;
};

export const AddJumpScore = (runtime: PokemonJumpRuntime, score: number): void => {
  runtime.comm.jumpScore += score;
  runtime.updateScore = true;
  if (runtime.comm.jumpScore >= MAX_JUMP_SCORE) {
    runtime.comm.jumpScore = MAX_JUMP_SCORE;
  }
};

export const GetPlayersAtJumpPeak = (runtime: PokemonJumpRuntime): number => {
  let numAtPeak = 0;

  for (let i = 0; i < runtime.numPlayers; i += 1) {
    if (runtime.players[i].jumpOffset === JUMP_PEAK) {
      runtime.atJumpPeak[i] = true;
      numAtPeak += 1;
    } else {
      runtime.atJumpPeak[i] = false;
    }
  }

  return numAtPeak;
};

export const GetNumPlayersForBonus = (runtime: PokemonJumpRuntime, arg0: ArrayLike<number | boolean>): number => {
  let flags = 0;
  let count = 0;

  for (let i = 0; i < MAX_RFU_PLAYERS; i += 1) {
    if (arg0[i]) {
      flags |= 1 << i;
      count += 1;
    }
  }

  runtime.comm.receivedBonusFlags = flags;
  if (flags) {
    runtime.showBonus = true;
  }

  return count;
};

export const GetScoreBonus = (numPlayers: number): number => sScoreBonuses[numPlayers] ?? 0;

export const TryUpdateExcellentsRecord = (runtime: PokemonJumpRuntime, excellentsInRow: number): void => {
  if (excellentsInRow > runtime.excellentsInRowRecord) {
    runtime.excellentsInRowRecord = excellentsInRow;
  }
};

export const HasEnoughScoreForPrize = (runtime: PokemonJumpRuntime): boolean => {
  if (runtime.comm.jumpScore >= sPrizeQuantityData[0].score) {
    return true;
  }
  return false;
};

export const GetPrizeItemId = (randomValue: number): number => {
  const index = randomValue % sPrizeItems.length;
  return sPrizeItems[index];
};

export const GetPrizeQuantity = (runtime: PokemonJumpRuntime): number => {
  let quantity = 0;

  for (let i = 0; i < sPrizeQuantityData.length; i += 1) {
    if (runtime.comm.jumpScore >= sPrizeQuantityData[i].score) {
      quantity = sPrizeQuantityData[i].quantity;
    } else {
      break;
    }
  }

  return quantity;
};

export const GetPrizeData = (runtime: PokemonJumpRuntime, randomValue: number): number => {
  const itemId = GetPrizeItemId(randomValue);
  const quantity = GetPrizeQuantity(runtime);
  return (quantity << 12) | (itemId & 0xfff);
};

export const UnpackPrizeData = (data: number): { itemId: number; quantity: number } => ({
  quantity: data >> 12,
  itemId: data & 0xfff
});

export const GetQuantityLimitedByBag = (
  item: number,
  quantity: number,
  checkBagHasSpace: (item: number, quantity: number) => boolean
): number => {
  while (quantity && !checkBagHasSpace(item, quantity)) {
    quantity -= 1;
  }

  return quantity;
};

export const ResetPokemonJumpRecords = (records: PokemonJumpRecords): void => {
  records.jumpsInRow = 0;
  records.bestJumpScore = 0;
  records.excellentsInRow = 0;
  records.gamesWithMaxPlayers = 0;
  records.unused2 = 0;
  records.unused1 = 0;
};

export const TryUpdateRecords = (
  records: PokemonJumpRecords,
  jumpScore: number,
  jumpsInRow: number,
  excellentsInRow: number
): boolean => {
  let newRecord = false;

  if (records.bestJumpScore < jumpScore && jumpScore <= MAX_JUMP_SCORE) {
    records.bestJumpScore = jumpScore;
    newRecord = true;
  }
  if (records.jumpsInRow < jumpsInRow && jumpsInRow <= MAX_JUMPS) {
    records.jumpsInRow = jumpsInRow;
    newRecord = true;
  }
  if (records.excellentsInRow < excellentsInRow && excellentsInRow <= MAX_JUMPS) {
    records.excellentsInRow = excellentsInRow;
    newRecord = true;
  }

  return newRecord;
};

export const IncrementGamesWithMaxPlayers = (records: PokemonJumpRecords): void => {
  if (records.gamesWithMaxPlayers < 9999) {
    records.gamesWithMaxPlayers += 1;
  }
};

type PokemonJumpCompatRuntime = PokemonJumpRuntime & {
  operations?: string[];
  tasks?: Array<{ func: string; data: number[]; destroyed: boolean }>;
  packets?: Array<{ type: string; payload: unknown }>;
  gfxFunc?: string | null;
  gfxFuncFinished?: boolean;
  countdownRunning?: boolean;
  staticCountdownRunning?: boolean;
  mainFunc?: string;
  isLeader?: boolean;
  multiplayerId?: number;
  linkTimer?: number;
  linkTimerLimit?: number;
  linkQueuesEmpty?: boolean;
  unreadField?: boolean;
  message?: string;
  messageWindowId?: number | null;
  prizeItemId?: number;
  prizeItemQuantity?: number;
  windowsFreed?: boolean;
  saved?: boolean;
  closedLink?: boolean;
  monInfo?: PokemonJumpMonInfo[];
  playerNames?: string[];
  recordsWindowId?: number;
};

const compat = (runtime: PokemonJumpRuntime): PokemonJumpCompatRuntime => runtime as PokemonJumpCompatRuntime;
const op = (runtime: PokemonJumpRuntime, name: string, ...args: Array<string | number | boolean>): void => {
  const r = compat(runtime);
  r.operations ??= [];
  r.operations.push([name, ...args].join(':'));
};
const makeTask = (func: string) => ({ func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
const ensureTasks = (runtime: PokemonJumpRuntime) => {
  const r = compat(runtime);
  r.tasks ??= [];
  return r.tasks;
};
const ensurePackets = (runtime: PokemonJumpRuntime) => {
  const r = compat(runtime);
  r.packets ??= [];
  return r.packets;
};
const taskAt = (runtime: PokemonJumpRuntime, taskId: number) => {
  const tasks = ensureTasks(runtime);
  tasks[taskId] ??= makeTask('Task');
  return tasks[taskId];
};
const createTask = (runtime: PokemonJumpRuntime, func: string): number => {
  const tasks = ensureTasks(runtime);
  const id = tasks.length;
  tasks.push(makeTask(func));
  return id;
};
let activePokemonJumpRuntime: PokemonJumpRuntime | null = null;
const req = (runtime?: PokemonJumpRuntime): PokemonJumpRuntime => {
  const r = runtime ?? activePokemonJumpRuntime;
  if (!r) throw new Error('pokemon jump runtime is not active');
  return r;
};

export function CreateStaticCountdownTask(funcSetId = 0, taskPriority = 0, runtime = req()): number { const id = createTask(runtime, 'Task_StaticCountdown'); const task = taskAt(runtime, id); task.data[0] = 1; task.data[1] = funcSetId; task.data[6] = taskPriority; Task_StaticCountdown_Init(id, runtime); return id; }
export function StartStaticCountdown(runtime = req()): boolean { compat(runtime).staticCountdownRunning = true; const task = ensureTasks(runtime).find(t => t.func === 'Task_StaticCountdown' && !t.destroyed); if (!task) return false; task.data[0] = 2; return true; }
export function IsStaticCountdownRunning(runtime = req()): boolean { return !!compat(runtime).staticCountdownRunning; }
export function Task_StaticCountdown(taskId: number, runtime = req()): void { const task = taskAt(runtime, taskId); if (task.data[0] === 2) { Task_StaticCountdown_Start(taskId, runtime); task.data[0] = 3; } else if (task.data[0] === 3) Task_StaticCountdown_Run(taskId, runtime); else if (task.data[0] === 4) { Task_StaticCountdown_Free(taskId, runtime); task.destroyed = true; compat(runtime).staticCountdownRunning = false; } }
export function StaticCountdown_CreateSprites(taskId: number, data: number[] = taskAt(req(), taskId).data, runtime = req()): void { for (let i = 0; i < (data[8] || 3); i++) data[13 + i] = i; op(runtime, 'StaticCountdown_CreateSprites', taskId); }
export function Task_StaticCountdown_Init(taskId: number, runtime = req()): void { const data = taskAt(runtime, taskId).data; data[2] = 0; data[3] = 0; data[4] = 0; data[5] = 60; data[6] = 0; data[7] = 0; data[8] = 3; data[9] = 120; data[10] = 88; StaticCountdown_CreateSprites(taskId, data, runtime); }
export function Task_StaticCountdown_Free(taskId: number, runtime = req()): void { taskAt(runtime, taskId).destroyed = true; compat(runtime).staticCountdownRunning = false; }
export function SpriteCB_StaticCountdown(sprite: PokemonJumpSprite, runtime = req()): void { sprite.invisible = false; sprite.animNum++; if (sprite.animNum > 4) { sprite.invisible = true; sprite.callback = 'SpriteCallbackDummy'; compat(runtime).staticCountdownRunning = false; } }
export function Task_StaticCountdown_Start(taskId: number, runtime = req()): void { taskAt(runtime, taskId).data[0] = 3; compat(runtime).staticCountdownRunning = true; playSE(runtime, SE_BIKE_HOP); }
export function Task_StaticCountdown_Run(taskId: number, runtime = req()): void { const task = taskAt(runtime, taskId); task.data[11]++; if (task.data[11] > task.data[5] * 4) task.data[0] = 4; }
export function StartPokemonJump(runtime = createPokemonJumpRuntime()): void { activePokemonJumpRuntime = runtime; InitGame(runtime); compat(runtime).mainFunc = 'Task_StartPokemonJump'; }
export function FreePokemonJump(runtime = req()): void { compat(runtime).tasks = []; compat(runtime).gfxFunc = null; op(runtime, 'FreePokemonJump'); }
export function InitGame(runtime = req()): void { ResetForNewGame(runtime); InitPlayerAndJumpTypes(runtime); InitVineState(runtime); StartPokeJumpGfx(runtime.gfx, runtime); }
export function ResetForNewGame(runtime = req()): void { runtime.comm.jumpScore = 0; runtime.comm.jumpsInRow = 0; runtime.gameOver = false; runtime.playAgainState = PLAY_AGAIN_YES; ResetPlayersForNewGame(runtime); }
export function InitPlayerAndJumpTypes(runtime = req()): void { runtime.players.forEach((player, i) => { player.jumpTimeStart = 0; player.monState = MONSTATE_NORMAL; player.prevMonState = MONSTATE_NORMAL; player.jumpState = JUMPSTATE_NONE; player.jumpOffsetIdx = Number.MAX_SAFE_INTEGER; player.jumpOffset = 0; if (i < sPokeJumpMons.length) player.jumpTimeStart = sPokeJumpMons[i].jumpType; }); }
export function ResetPlayersForNewGame(runtime = req()): void { runtime.players.forEach(player => { player.jumpState = JUMPSTATE_NONE; player.monState = MONSTATE_NORMAL; player.prevMonState = MONSTATE_NORMAL; player.jumpOffset = 0; player.jumpOffsetIdx = Number.MAX_SAFE_INTEGER; }); }
export function InitJumpMonInfo(monInfo: { species?: number; otId?: number; personality?: number }, mon: { species: number; otId?: number; personality?: number }): void { monInfo.species = mon.species; monInfo.otId = mon.otId ?? 0; monInfo.personality = mon.personality ?? 0; }
export function VBlankCB_PokemonJump(runtime = req()): void { op(runtime, 'VBlankCB_PokemonJump'); }
export function CB2_PokemonJump(runtime = req()): void { op(runtime, 'CB2_PokemonJump'); }
export function SetPokeJumpTask(func: string, runtime = req()): void { compat(runtime).mainFunc = func; }
export function Task_StartPokemonJump(taskId: number, runtime = req()): void { op(runtime, 'Task_StartPokemonJump', taskId); SetPokeJumpTask(compat(runtime).isLeader ? 'Task_PokemonJump_Leader' : 'Task_PokemonJump_Member', runtime); }
export function SetLinkTimeInterval(interval: number, runtime = req()): void { compat(runtime).linkTimerLimit = interval === 0 ? 0x1111 : (1 << interval) - 1; }
export function SetFunc_Leader(func: string, runtime = req()): void { compat(runtime).isLeader = true; compat(runtime).mainFunc = func; }
export function RecvLinkData_Leader(runtime = req()): void { op(runtime, 'RecvLinkData_Leader'); }
export function Task_PokemonJump_Leader(taskId: number, runtime = req()): void { RecvLinkData_Leader(runtime); UpdateGame(runtime); SendLinkData_Leader(runtime); op(runtime, 'Task_PokemonJump_Leader', taskId); }
export function SendLinkData_Leader(runtime = req()): void { SendPacket_LeaderState(runtime.players[0], runtime.comm, runtime); }
export function SetFunc_Member(func: string, runtime = req()): void { compat(runtime).isLeader = false; compat(runtime).mainFunc = func; }
export function RecvLinkData_Member(runtime = req()): void { op(runtime, 'RecvLinkData_Member'); }
export function Task_PokemonJump_Member(taskId: number, runtime = req()): void { RecvLinkData_Member(runtime); UpdateGame(runtime); SendLinkData_Member(runtime); op(runtime, 'Task_PokemonJump_Member', taskId); }
export function SendLinkData_Member(runtime = req()): void { SendPacket_MemberState(runtime.players[0], runtime.playAgainState, runtime.comm.jumpsInRow, runtime); }
export function GameIntro_Leader(runtime = req()): boolean { return DoGameIntro(runtime); }
export function GameIntro_Member(runtime = req()): boolean { return DoGameIntro(runtime); }
export function WaitRound_Leader(runtime = req()): boolean { return AreLinkQueuesEmpty(runtime); }
export function WaitRound_Member(runtime = req()): boolean { return AreLinkQueuesEmpty(runtime); }
export function GameRound_Leader(runtime = req()): boolean { return HandleSwingRound(runtime); }
export function GameRound_Member(runtime = req()): boolean { return HandleSwingRound(runtime); }
export function GameOver_Leader(runtime = req()): boolean { runtime.gameOver = true; return true; }
export function GameOver_Member(runtime = req()): boolean { runtime.gameOver = true; return true; }
export function AskPlayAgain_Leader(runtime = req()): boolean { return DoPlayAgainPrompt(runtime); }
export function AskPlayAgain_Member(runtime = req()): boolean { return DoPlayAgainPrompt(runtime); }
export function ResetGame_Leader(runtime = req()): boolean { ResetForNewGame(runtime); return true; }
export function ResetGame_Member(runtime = req()): boolean { ResetForNewGame(runtime); return true; }
export function ExitGame(runtime = req()): boolean { compat(runtime).closedLink = true; return true; }
export function GivePrize_Leader(runtime = req()): boolean { return TryGivePrize(runtime); }
export function GivePrize_Member(runtime = req()): boolean { return TryGivePrize(runtime); }
export function SavePokeJump(runtime = req()): boolean { compat(runtime).saved = true; return TryUpdateRecords(runtime.records, runtime.comm.jumpScore, runtime.comm.jumpsInRow, runtime.excellentsInRowRecord); }
export function DoGameIntro(runtime = req()): boolean { StartMonIntroBounce(0, runtime); DoPokeJumpCountdown(runtime); return true; }
export function HandleSwingRound(runtime = req()): boolean { UpdateGame(runtime); return AllPlayersJumpedOrHit(runtime); }
export function DoVineHitEffect(runtime = req()): boolean { for (let i = 0; i < runtime.numPlayers; i++) if (runtime.players[i].jumpState === JUMPSTATE_FAILURE) StartMonHitShake(i, runtime); return true; }
export function TryGivePrize(runtime = req()): boolean { if (!HasEnoughScoreForPrize(runtime)) return false; const data = GetPrizeData(runtime, PokeJumpRandom(runtime)); const unpacked = UnpackPrizeData(data); compat(runtime).prizeItemId = unpacked.itemId; compat(runtime).prizeItemQuantity = unpacked.quantity; return true; }
export function DoPlayAgainPrompt(runtime = req()): boolean { Msg_WantToPlayAgain(runtime); return ShouldPlayAgain(runtime); }
export function ClosePokeJumpLink(runtime = req()): boolean { compat(runtime).closedLink = true; return true; }
export function CloseMessageAndResetScore(runtime = req()): boolean { ClearMessageWindow(runtime); runtime.comm.jumpScore = 0; return true; }
export function Task_CommunicateMonInfo(taskId: number, runtime = req()): void { SendPacket_MonInfo({ species: sPokeJumpMons[0].species, otId: 0, personality: 0 }, runtime); taskAt(runtime, taskId).destroyed = true; }
export function SetTaskWithPokeJumpStruct(func: string, taskPriority = 0, runtime = req()): void { const id = createTask(runtime, func); taskAt(runtime, id).data[0] = taskPriority; }
export function ResetPlayersJumpStates(runtime = req()): void { runtime.players.forEach(player => { player.jumpState = JUMPSTATE_NONE; }); }
export function ResetPlayersMonState(runtime = req()): void { runtime.players.forEach(player => { player.prevMonState = player.monState; player.monState = MONSTATE_NORMAL; }); }
export function IsPlayersMonState(state: number, runtime = req()): boolean { return runtime.players.slice(0, runtime.numPlayers).every(player => player.monState === state); }
export function SetMonStateJump(runtime = req()): void { runtime.players.forEach(player => { player.prevMonState = player.monState; player.monState = MONSTATE_JUMP; }); }
export function SetMonStateHit(runtime = req()): void { runtime.players.forEach(player => { player.prevMonState = player.monState; player.monState = MONSTATE_HIT; }); }
export function SetMonStateNormal(runtime = req()): void { runtime.players.forEach(player => { player.prevMonState = player.monState; player.monState = MONSTATE_NORMAL; }); }
export function UpdateGame(runtime = req()): void { TryUpdateVineSwing(runtime); HandleMonState(runtime); TryUpdateScore(runtime); }
export function TryUpdateVineSwing(runtime = req()): void { UpdateVineState(runtime); UpdateVineSwing(runtime.gfx, runtime.vineState, runtime); }
export function HandleMonState(runtime = req()): void { for (let i = 0; i < runtime.numPlayers; i++) UpdateJump(i, runtime); }
export function UpdateJump(playerId: number, runtime = req()): void { const player = runtime.players[playerId]; if (player.monState === MONSTATE_JUMP) { player.jumpOffsetIdx = Math.min(player.jumpOffsetIdx + 1, 31); player.jumpOffset = -Math.trunc(gSineTable[(player.jumpOffsetIdx * 4) & 0xff] / 4); if (player.jumpOffset <= JUMP_PEAK) player.jumpState = JUMPSTATE_SUCCESS; } else if (player.monState === MONSTATE_HIT) player.jumpState = JUMPSTATE_FAILURE; }
export function TryUpdateScore(runtime = req()): void { if (DidAllPlayersClearVine(runtime)) { AddJumpScore(runtime, 10 + GetScoreBonus(GetPlayersAtJumpPeak(runtime))); runtime.comm.jumpsInRow = Math.min(MAX_JUMPS, runtime.comm.jumpsInRow + 1); } }
export function UpdateVineHitStates(runtime = req()): boolean { if (runtime.vineState === VINE_LOWEST) { runtime.players.forEach(player => { if (player.monState !== MONSTATE_JUMP) player.jumpState = JUMPSTATE_FAILURE; }); } return AllPlayersJumpedOrHit(runtime); }
export function AreLinkQueuesEmpty(runtime = req()): boolean { return compat(runtime).linkQueuesEmpty !== false; }
export function ClearUnreadField(runtime = req()): void { compat(runtime).unreadField = false; }
export function GetNumPokeJumpPlayers(runtime = req()): number { return runtime.numPlayers; }
export function GetPokeJumpMultiplayerId(runtime = req()): number { return compat(runtime).multiplayerId ?? 0; }
export function GetMonInfoByMultiplayerId(multiplayerId: number, runtime = req()): PokemonJumpMonInfo {
  const r = compat(runtime);
  r.monInfo ??= Array.from({ length: MAX_RFU_PLAYERS }, () => ({ species: 0, otId: 0, personality: 0 }));
  return r.monInfo[multiplayerId] ?? (r.monInfo[multiplayerId] = { species: 0, otId: 0, personality: 0 });
}
export function GetPokeJumpPlayerName(multiplayerId: number, runtime = req()): string {
  return compat(runtime).playerNames?.[multiplayerId] ?? runtime.players[multiplayerId]?.name ?? '';
}
export function GetPokeJumpRecords(runtime = req()): PokemonJumpRecords { return runtime.records; }
export function IsPokemonJumpSpeciesInParty(species: number): boolean { return IsSpeciesAllowedInPokemonJump(species); }
export function SendPacket_MonInfo(monInfo: unknown, runtime = req()): void { ensurePackets(runtime).push({ type: 'PACKET_MON_INFO', payload: monInfo }); }
export function RecvPacket_MonInfo(multiplayerId: number, monInfo: { species?: number }, runtime = req()): boolean { const packet = ensurePackets(runtime).find(p => p.type === 'PACKET_MON_INFO'); if (!packet) return false; Object.assign(monInfo, packet.payload); compat(runtime).multiplayerId = multiplayerId; return true; }
export function SendPacket_Unused(runtime = req()): void { ensurePackets(runtime).push({ type: 'PACKET_UNUSED', payload: 0 }); }
export function SendPacket_LeaderState(player: PokemonJumpPlayer, comm: PokemonJumpCommData, runtime = req()): void { ensurePackets(runtime).push({ type: 'PACKET_LEADER_STATE', payload: { player: { ...player }, comm: { ...comm } } }); }
export function RecvPacket_LeaderState(player: PokemonJumpPlayer, comm: PokemonJumpCommData, runtime = req()): boolean { const packet = ensurePackets(runtime).find(p => p.type === 'PACKET_LEADER_STATE') as { payload?: { player: PokemonJumpPlayer; comm: PokemonJumpCommData } } | undefined; if (!packet?.payload) return false; Object.assign(player, packet.payload.player); Object.assign(comm, packet.payload.comm); return true; }
export function SendPacket_MemberState(player: PokemonJumpPlayer, playAgainState: number, jumpsInRow: number, runtime = req()): void { ensurePackets(runtime).push({ type: 'PACKET_MEMBER_STATE', payload: { player: { ...player }, playAgainState, jumpsInRow } }); }
export function RecvPacket_MemberStateToLeader(player: PokemonJumpPlayer, multiplayerId: number, playAgainStateOut: number[] = [], jumpsInRowOut: number[] = [], runtime = req()): boolean { const packet = ensurePackets(runtime).find(p => p.type === 'PACKET_MEMBER_STATE') as { payload?: { player: PokemonJumpPlayer; playAgainState: number; jumpsInRow: number } } | undefined; if (!packet?.payload) return false; Object.assign(player, packet.payload.player); playAgainStateOut[0] = packet.payload.playAgainState; jumpsInRowOut[0] = packet.payload.jumpsInRow; compat(runtime).multiplayerId = multiplayerId; return true; }
export function RecvPacket_MemberStateToMember(player: PokemonJumpPlayer, multiplayerId: number, runtime = req()): boolean { return RecvPacket_MemberStateToLeader(player, multiplayerId, [], [], runtime); }
export function StartPokeJumpGfx(gfx: PokemonJumpGfx = req().gfx, runtime = req()): void { runtime.gfx = gfx; compat(runtime).gfxFuncFinished = false; InitPokeJumpGfx(gfx, runtime); }
export function FreeWindowsAndDigitObj(runtime = req()): void { compat(runtime).windowsFreed = true; }
export function InitPokeJumpGfx(gfx: PokemonJumpGfx = req().gfx, runtime = req()): void { runtime.gfx = gfx; ResetPokeJumpSpriteData(gfx.monSprites[0] ?? createPokemonJumpSprite()); }
export function SetUpPokeJumpGfxFuncById(id: number, runtime = req()): void { const names = ['LoadPokeJumpGfx', 'PrintPlayerNamesNoHighlight', 'PrintPlayerNamesWithHighlight', 'ErasePlayerNames', 'Msg_WantToPlayAgain', 'Msg_SavingDontTurnOff', 'EraseMessage', 'Msg_SomeoneDroppedOut', 'Msg_CommunicationStandby', 'DoPokeJumpCountdown']; compat(runtime).gfxFunc = names[id] ?? null; compat(runtime).gfxFuncFinished = false; }
export function IsPokeJumpGfxFuncFinished(runtime = req()): boolean { return compat(runtime).gfxFuncFinished === true; }
export function SetUpPokeJumpGfxFunc(func: string, runtime = req()): void { compat(runtime).gfxFunc = func; compat(runtime).gfxFuncFinished = false; }
export function Task_RunPokeJumpGfxFunc(taskId: number, runtime = req()): void { const r = compat(runtime); if (r.gfxFunc) op(runtime, r.gfxFunc); r.gfxFuncFinished = true; taskAt(runtime, taskId).destroyed = true; }
export function LoadPokeJumpGfx(runtime = req()): void { op(runtime, 'LoadPokeJumpGfx'); compat(runtime).gfxFuncFinished = true; }
export function PrintPlayerNamesNoHighlight(runtime = req()): void { op(runtime, 'PrintPlayerNamesNoHighlight'); }
export function PrintPlayerNamesWithHighlight(runtime = req()): void { op(runtime, 'PrintPlayerNamesWithHighlight'); }
export function ErasePlayerNames(runtime = req()): void { op(runtime, 'ErasePlayerNames'); }
export function Msg_WantToPlayAgain(runtime = req()): void { compat(runtime).message = 'WantToPlayAgain'; }
export function Msg_SavingDontTurnOff(runtime = req()): void { compat(runtime).message = 'SavingDontTurnOff'; }
export function EraseMessage(runtime = req()): void { compat(runtime).message = ''; }
export function Msg_SomeoneDroppedOut(runtime = req()): void { compat(runtime).message = 'SomeoneDroppedOut'; }
export function Msg_CommunicationStandby(runtime = req()): void { compat(runtime).message = 'CommunicationStandby'; }
export function DoPokeJumpCountdown(runtime = req()): void { compat(runtime).countdownRunning = true; }
export function SetUpResetVineGfx(runtime = req()): void { SetUpPokeJumpGfxFunc('ResetVineGfx', runtime); }
export function ResetVineGfx(runtime = req()): boolean { runtime.vineState = VINE_UPSWING_LOWER; return true; }
export function PrintPrizeMessage(item: number, quantity: number, runtime = req()): void { compat(runtime).message = `Prize:${item}:${quantity}`; }
export function PrintPrizeFilledBagMessage(item: number, runtime = req()): void { compat(runtime).message = `PrizeFilledBag:${item}`; }
export function PrintNoRoomForPrizeMessage(item: number, runtime = req()): void { compat(runtime).message = `NoRoomForPrize:${item}`; }
export function DoPrizeMessageAndFanfare(runtime = req()): boolean { DoPrizeMessageAndFanfare; op(runtime, 'PlayFanfare'); return true; }
export function ClearMessageWindow(runtime = req()): void { compat(runtime).message = ''; }
export function RemoveMessageWindow(runtime = req()): boolean { compat(runtime).messageWindowId = null; return true; }
export function HandlePlayAgainInput(input = PLAY_AGAIN_YES, runtime = req()): number { runtime.playAgainState = input; return input; }
export function AddMessageWindow(_left = 0, _top = 0, _width = 0, _height = 0, runtime = req()): number { compat(runtime).messageWindowId = 1; return 1; }
export function CreatePokeJumpYesNoMenu(left = 0, top = 0, cursorPos = 0, runtime = req()): void { op(runtime, 'CreatePokeJumpYesNoMenu', left, top, cursorPos); }
export function PrintScoreSuffixes(runtime = req()): void { op(runtime, 'PrintScoreSuffixes'); }
export function CreateJumpMonSprites(runtime = req()): void { runtime.gfx.monSprites = Array.from({ length: MAX_RFU_PLAYERS }, (_v, i) => createPokemonJumpSprite({ spriteId: i, subpriority: i + 4 })); }
export function SetMonSpriteY(multiplayerId: number, y: number, runtime = req()): void { const sprite = runtime.gfx.monSprites[multiplayerId]; if (sprite) sprite.y = y; }
export function UpdateVineSwing(gfx: PokemonJumpGfx = req().gfx, vineState = req().vineState, runtime = req()): void { op(runtime, 'UpdateVineSwing', vineState); gfx.monSprites.forEach(sprite => { if (sprite) sprite.y2 = vineState - VINE_LOWEST; }); }
export function InitDigitPrinters(runtime = req()): void { op(runtime, 'InitDigitPrinters'); }
export function PrintScore(score: number, runtime = req()): void { runtime.comm.jumpScore = Math.min(MAX_JUMP_SCORE, score); }
export function PrintJumpsInRow(jumps: number, runtime = req()): void { runtime.comm.jumpsInRow = Math.min(MAX_JUMPS, jumps); }
export function StartMonHitShake(multiplayerId: number, runtime = req()): void { Gfx_StartMonHitShake(runtime, multiplayerId); }
export function StartMonHitFlash(multiplayerId: number, runtime = req()): void { Gfx_StartMonHitFlash(runtime, multiplayerId); }
export function StopMonHitFlash(runtime = req()): void { Gfx_StopMonHitFlash(runtime); }
export function ResetMonSpriteSubpriorities(runtime = req()): void { Gfx_ResetMonSpriteSubpriorities(runtime); }
export function StartMonIntroBounce(multiplayerId: number, runtime = req()): void { Gfx_StartMonIntroBounce(runtime, multiplayerId); }
export function AddPlayerNameWindows(runtime = req()): void { op(runtime, 'AddPlayerNameWindows'); }
export function PrintPokeJumpPlayerName(id: number, highlight = false, runtime = req()): void { op(runtime, 'PrintPokeJumpPlayerName', id, highlight); }
export function PrintPokeJumpPlayerNames(highlight = false, runtime = req()): void { for (let i = 0; i < runtime.numPlayers; i++) PrintPokeJumpPlayerName(i, highlight, runtime); }
export function DrawPlayerNameWindows(runtime = req()): void { op(runtime, 'DrawPlayerNameWindows'); }
export function ShowBonus(bonus: number, runtime = req()): void { runtime.shownBonuses.push(bonus); runtime.showBonus = true; }
export function UpdateBonus(runtime = req()): void { if (runtime.showBonus) runtime.showBonus = false; }
export function Task_UpdateBonus(taskId: number, runtime = req()): void { UpdateBonus(runtime); taskAt(runtime, taskId).destroyed = true; }
export function LoadSpriteSheetsAndPalettes(_gfx: PokemonJumpGfx = req().gfx, runtime = req()): void { op(runtime, 'LoadSpriteSheetsAndPalettes'); }
export function CreateJumpMonSprite(gfx: PokemonJumpGfx = req().gfx, _monInfo: unknown = null, x = 0, y = 0, id = 0): void { gfx.monSprites[id] = createPokemonJumpSprite({ spriteId: id, y, data: [x, 0, 0, 0, 0, 0, 0, 0] }); }
export function CreateStarSprite(gfx: PokemonJumpGfx = req().gfx, x = 0, y = 0, id = 0): void { gfx.starSprites[id] = createPokemonJumpSprite({ spriteId: id + MAX_RFU_PLAYERS, y, invisible: true, data: [x, 0, 0, 0, 0, 0, 0, 0] }); }
export function CreateVineSprites(_gfx: PokemonJumpGfx = req().gfx, runtime = req()): void { op(runtime, 'CreateVineSprites'); }
export function UpdateVineAnim(gfx: PokemonJumpGfx = req().gfx, vineState = req().vineState, runtime = req()): void { UpdateVineSwing(gfx, vineState, runtime); }
export function StartPokeJumpCountdown(gfx: PokemonJumpGfx = req().gfx, runtime = req()): void { compat(runtime).countdownRunning = true; gfx.monSprites.forEach(sprite => { if (sprite) sprite.invisible = false; }); }
export function IsPokeJumpCountdownRunning(runtime = req()): boolean { return compat(runtime).countdownRunning === true; }
export function ShowPokemonJumpRecords(runtime = req()): void { compat(runtime).recordsWindowId = AddMessageWindow(0, 0, 10, 8, runtime); PrintRecordsText(compat(runtime).recordsWindowId, runtime); }
export function Task_ShowPokemonJumpRecords(taskId: number, runtime = req()): void { ShowPokemonJumpRecords(runtime); taskAt(runtime, taskId).destroyed = true; }
export function PrintRecordsText(windowId = 0, runtime = req()): void { op(runtime, 'PrintRecordsText', windowId, runtime.records.bestJumpScore); }
export function TruncateToFirstWordOnly(str: string): string { return str.split(/\s/u)[0] ?? ''; }
