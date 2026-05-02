import type { AvatarMode } from './fieldCollision';
import type { PlayerState } from './player';
import {
  MetatileBehavior_IsDirectionalDownLeftStairWarp,
  MetatileBehavior_IsDirectionalDownRightStairWarp,
  MetatileBehavior_IsDirectionalUpLeftStairWarp,
  MetatileBehavior_IsDirectionalUpRightStairWarp,
  MetatileBehavior_IsEastArrowWarp,
  MetatileBehavior_IsLadder,
  MetatileBehavior_IsNonAnimDoor,
  MetatileBehavior_IsNorthArrowWarp,
  MetatileBehavior_IsSouthArrowWarp,
  MetatileBehavior_IsSurfable,
  MetatileBehavior_IsWarpDoor_2,
  MetatileBehavior_IsWestArrowWarp
} from './decompMetatileBehavior';

export const PLAYER_AVATAR_FLAG_ON_FOOT = 1 << 0;
export const PLAYER_AVATAR_FLAG_MACH_BIKE = 1 << 1;
export const PLAYER_AVATAR_FLAG_ACRO_BIKE = 1 << 2;
export const PLAYER_AVATAR_FLAG_SURFING = 1 << 3;
export const PLAYER_AVATAR_FLAG_UNDERWATER = 1 << 4;
export const PLAYER_AVATAR_FLAG_CONTROLLABLE = 1 << 5;
export const PLAYER_AVATAR_FLAG_FORCED = 1 << 6;
export const PLAYER_AVATAR_FLAG_DASH = 1 << 7;

export const QL_PLAYER_GFX_NORMAL = 0;
export const QL_PLAYER_GFX_BIKE = 1;
export const QL_PLAYER_GFX_FISH = 2;
export const QL_PLAYER_GFX_SURF = 3;
export const QL_PLAYER_GFX_VSSEEKER = 8;

export interface InitialPlayerAvatarState {
  direction: PlayerState['facing'];
  transitionFlags: number;
  hasDirectionSet: boolean;
}

export interface InitialPlayerAvatarAdjustmentOptions {
  cruiseMode?: boolean;
  bikingAllowed?: boolean;
  seafoamSurfable?: boolean;
}

export const getPlayerAvatarModeFlag = (avatarMode: AvatarMode | undefined): number => {
  switch (avatarMode) {
    case 'machBike':
      return PLAYER_AVATAR_FLAG_MACH_BIKE;
    case 'acroBike':
      return PLAYER_AVATAR_FLAG_ACRO_BIKE;
    case 'surfing':
      return PLAYER_AVATAR_FLAG_SURFING;
    case 'underwater':
      return PLAYER_AVATAR_FLAG_UNDERWATER;
    case 'normal':
    default:
      return PLAYER_AVATAR_FLAG_ON_FOOT;
  }
};

const modeFromAvatarFlags = (flags: number): AvatarMode => {
  if (flags & PLAYER_AVATAR_FLAG_MACH_BIKE) {
    return 'machBike';
  }
  if (flags & PLAYER_AVATAR_FLAG_ACRO_BIKE) {
    return 'acroBike';
  }
  if (flags & PLAYER_AVATAR_FLAG_SURFING) {
    return 'surfing';
  }
  if (flags & PLAYER_AVATAR_FLAG_UNDERWATER) {
    return 'underwater';
  }
  return 'normal';
};

const graphicsModeFromAvatarFlags = (flags: number): PlayerState['avatarGraphicsMode'] => {
  if (flags & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)) {
    return 'bike';
  }
  if (flags & PLAYER_AVATAR_FLAG_SURFING) {
    return 'surf';
  }
  if (flags & PLAYER_AVATAR_FLAG_UNDERWATER) {
    return 'underwater';
  }
  return 'normal';
};

const syncAvatarModeFromFlags = (player: PlayerState): void => {
  const flags = getPlayerAvatarFlags(player);
  player.avatarMode = modeFromAvatarFlags(flags);
  player.avatarGraphicsMode = graphicsModeFromAvatarFlags(flags);
  player.controllable = (flags & PLAYER_AVATAR_FLAG_CONTROLLABLE) !== 0;
};

export const getPlayerAvatarFlags = (player: PlayerState): number => {
  if (Number.isInteger(player.avatarFlags)) {
    return player.avatarFlags as number;
  }

  let flags = getPlayerAvatarModeFlag(player.avatarMode);
  if (player.controllable !== false) {
    flags |= PLAYER_AVATAR_FLAG_CONTROLLABLE;
  }
  if (player.stepForcedMovement) {
    flags |= PLAYER_AVATAR_FLAG_FORCED;
  }
  if (player.runningState === 'moving' && player.stepSpeed && player.stepSpeed > 60) {
    flags |= PLAYER_AVATAR_FLAG_DASH;
  }
  return flags;
};

const clearBikeState = (player: PlayerState): void => {
  player.bikeState = 'normal';
  player.bikeNewDirectionBackup = null;
  player.bikeFrameCounter = 0;
  player.bikeSpeed = 0;
  player.bikeDirectionHistory = 0;
  player.bikeAbStartSelectHistory = 0;
  player.bikeLastSpinTile = 0;
  player.bikeDirTimerHistory = [0, 0, 0, 0];
};

const recordQuestLogTransition = (player: PlayerState, transition: number): void => {
  player.avatarQuestLogTransitions ??= [];
  player.avatarQuestLogTransitions.push(transition);
};

export const getPlayerAvatarGraphicsIdByStateIdAndGender = (
  stateId: 'normal' | 'bike' | 'surf' | 'fieldMove' | 'fish' | 'vsSeeker',
  gender: 'male' | 'female' = 'male'
): string => {
  const prefix = gender === 'female' ? 'OBJ_EVENT_GFX_GREEN' : 'OBJ_EVENT_GFX_RED';
  switch (stateId) {
    case 'bike':
      return `${prefix}_BIKE`;
    case 'surf':
      return `${prefix}_SURF`;
    case 'fieldMove':
      return `${prefix}_FIELD_MOVE`;
    case 'fish':
      return `${prefix}_FISH`;
    case 'vsSeeker':
      return `${prefix}_VS_SEEKER`;
    case 'normal':
    default:
      return `${prefix}_NORMAL`;
  }
};

export const getPlayerAvatarStateTransitionByGraphicsId = (
  graphicsId: string,
  gender: 'male' | 'female' = 'male'
): number => {
  if (graphicsId === getPlayerAvatarGraphicsIdByStateIdAndGender('bike', gender)) {
    return PLAYER_AVATAR_FLAG_MACH_BIKE;
  }
  if (graphicsId === getPlayerAvatarGraphicsIdByStateIdAndGender('surf', gender)) {
    return PLAYER_AVATAR_FLAG_SURFING;
  }
  if (graphicsId === getPlayerAvatarGraphicsIdByStateIdAndGender('normal', gender)) {
    return PLAYER_AVATAR_FLAG_ON_FOOT;
  }
  return PLAYER_AVATAR_FLAG_ON_FOOT;
};

export const getPlayerAvatarGraphicsIdByCurrentState = (player: PlayerState): string | null => {
  const flags = getPlayerAvatarFlags(player);
  const gender = player.avatarGender ?? 'male';
  if (flags & PLAYER_AVATAR_FLAG_ON_FOOT) {
    return getPlayerAvatarGraphicsIdByStateIdAndGender('normal', gender);
  }
  if (flags & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)) {
    return getPlayerAvatarGraphicsIdByStateIdAndGender('bike', gender);
  }
  if (flags & PLAYER_AVATAR_FLAG_SURFING) {
    return getPlayerAvatarGraphicsIdByStateIdAndGender('surf', gender);
  }
  return null;
};

export const clearPlayerAvatarInfo = (player: PlayerState): void => {
  player.avatarFlags = 0;
  player.avatarTransitionFlags = 0;
  player.avatarMode = 'normal';
  player.avatarGraphicsMode = 'normal';
  player.avatarObjectGraphicsId = undefined;
  player.avatarPreventStep = false;
  player.avatarTileTransitionState = 'notMoving';
  player.controllable = false;
};

export const setPlayerAvatarStateMask = (player: PlayerState, flags: number): void => {
  const preservedFlags = getPlayerAvatarFlags(player)
    & (PLAYER_AVATAR_FLAG_DASH | PLAYER_AVATAR_FLAG_FORCED | PLAYER_AVATAR_FLAG_CONTROLLABLE);
  player.avatarFlags = preservedFlags | flags;
  syncAvatarModeFromFlags(player);
};

export const resetPlayerAvatarState = (player: PlayerState): void => {
  setPlayerAvatarStateMask(player, PLAYER_AVATAR_FLAG_CONTROLLABLE | PLAYER_AVATAR_FLAG_ON_FOOT);
  player.runningState = 'notMoving';
  player.avatarTransitionFlags = 0;
  clearBikeState(player);
};

const transitionToNormal = (player: PlayerState): void => {
  recordQuestLogTransition(player, QL_PLAYER_GFX_NORMAL);
  setPlayerAvatarStateMask(player, PLAYER_AVATAR_FLAG_ON_FOOT);
  player.avatarObjectGraphicsId = getPlayerAvatarGraphicsIdByStateIdAndGender('normal', player.avatarGender ?? 'male');
};

const transitionToBike = (player: PlayerState): void => {
  recordQuestLogTransition(player, QL_PLAYER_GFX_BIKE);
  setPlayerAvatarStateMask(player, PLAYER_AVATAR_FLAG_MACH_BIKE);
  player.avatarObjectGraphicsId = getPlayerAvatarGraphicsIdByStateIdAndGender('bike', player.avatarGender ?? 'male');
  clearBikeState(player);
};

const transitionToSurfing = (player: PlayerState): void => {
  recordQuestLogTransition(player, QL_PLAYER_GFX_SURF);
  if ((getPlayerAvatarFlags(player) & PLAYER_AVATAR_FLAG_SURFING) === 0) {
    setPlayerAvatarStateMask(player, PLAYER_AVATAR_FLAG_SURFING);
    player.avatarObjectGraphicsId = getPlayerAvatarGraphicsIdByStateIdAndGender('surf', player.avatarGender ?? 'male');
  }
};

const transitionReturnToField = (player: PlayerState): void => {
  player.avatarFlags = getPlayerAvatarFlags(player) | PLAYER_AVATAR_FLAG_CONTROLLABLE;
  syncAvatarModeFromFlags(player);
};

export const doPlayerAvatarTransition = (player: PlayerState): void => {
  let flags = player.avatarTransitionFlags ?? 0;
  if (flags === 0) {
    return;
  }

  for (let state = 0; state < 8; state += 1, flags >>= 1) {
    if ((flags & 1) === 0) {
      continue;
    }

    switch (state) {
      case 0:
        transitionToNormal(player);
        break;
      case 1:
      case 2:
        transitionToBike(player);
        break;
      case 3:
        transitionToSurfing(player);
        break;
      case 5:
        transitionReturnToField(player);
        break;
      case 4:
      case 6:
      case 7:
      default:
        break;
    }
  }

  player.avatarTransitionFlags = 0;
};

export const setPlayerAvatarTransitionFlags = (player: PlayerState, flags: number): void => {
  player.avatarTransitionFlags = (player.avatarTransitionFlags ?? 0) | flags;
  doPlayerAvatarTransition(player);
};

export const setPlayerAvatarExtraStateTransition = (
  player: PlayerState,
  graphicsId: string,
  extras: number
): void => {
  const graphicsTransition = getPlayerAvatarStateTransitionByGraphicsId(graphicsId, player.avatarGender ?? 'male');
  setPlayerAvatarTransitionFlags(player, graphicsTransition | extras);
};

export const initPlayerAvatar = (
  player: PlayerState,
  x: number,
  y: number,
  direction: PlayerState['facing'],
  gender: 'male' | 'female'
): void => {
  clearPlayerAvatarInfo(player);
  player.position = { x: (x - 7) * 16, y: (y - 7) * 16 };
  player.currentTile = { x: x - 7, y: y - 7 };
  player.previousTile = { x: x - 7, y: y - 7 };
  player.facing = direction;
  player.avatarGender = gender;
  player.avatarObjectGraphicsId = getPlayerAvatarGraphicsIdByStateIdAndGender('normal', gender);
  player.runningState = 'notMoving';
  player.avatarTileTransitionState = 'notMoving';
  setPlayerAvatarStateMask(player, PLAYER_AVATAR_FLAG_CONTROLLABLE | PLAYER_AVATAR_FLAG_ON_FOOT);
};

export const updatePlayerAvatarTransitionState = (player: PlayerState): void => {
  player.avatarTileTransitionState = 'notMoving';
  if (player.moving || player.stepTarget) {
    player.avatarTileTransitionState = player.moving ? 'tileTransition' : 'tileCenter';
  }
};

export const startPlayerAvatarSummonMonForFieldMoveAnim = (player: PlayerState): void => {
  player.avatarGraphicsMode = 'fieldMove';
  player.avatarObjectGraphicsId = getPlayerAvatarGraphicsIdByStateIdAndGender('fieldMove', player.avatarGender ?? 'male');
};

export const startPlayerAvatarVsSeekerAnim = (player: PlayerState): void => {
  player.avatarGraphicsMode = 'vsSeeker';
  player.avatarObjectGraphicsId = (getPlayerAvatarFlags(player) & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE))
    ? `${player.avatarGender === 'female' ? 'OBJ_EVENT_GFX_GREEN' : 'OBJ_EVENT_GFX_RED'}_VS_SEEKER_BIKE`
    : getPlayerAvatarGraphicsIdByStateIdAndGender('vsSeeker', player.avatarGender ?? 'male');
};

export const resetInitialPlayerAvatarState = (): InitialPlayerAvatarState => ({
  direction: 'down',
  transitionFlags: PLAYER_AVATAR_FLAG_ON_FOOT,
  hasDirectionSet: false
});

export const setInitialPlayerAvatarStateWithDirection = (
  direction: PlayerState['facing']
): InitialPlayerAvatarState => ({
  direction,
  transitionFlags: PLAYER_AVATAR_FLAG_ON_FOOT,
  hasDirectionSet: true
});

export const storeInitialPlayerAvatarState = (player: PlayerState): InitialPlayerAvatarState => {
  const flags = getPlayerAvatarFlags(player);
  let transitionFlags = PLAYER_AVATAR_FLAG_ON_FOOT;
  if (flags & PLAYER_AVATAR_FLAG_MACH_BIKE) {
    transitionFlags = PLAYER_AVATAR_FLAG_MACH_BIKE;
  } else if (flags & PLAYER_AVATAR_FLAG_ACRO_BIKE) {
    transitionFlags = PLAYER_AVATAR_FLAG_ACRO_BIKE;
  } else if (flags & PLAYER_AVATAR_FLAG_SURFING) {
    transitionFlags = PLAYER_AVATAR_FLAG_SURFING;
  } else if (flags & PLAYER_AVATAR_FLAG_UNDERWATER) {
    transitionFlags = PLAYER_AVATAR_FLAG_UNDERWATER;
  }

  return {
    direction: player.facing,
    transitionFlags,
    hasDirectionSet: false
  };
};

export const getAdjustedInitialTransitionFlags = (
  playerStruct: InitialPlayerAvatarState,
  metatileBehavior: number,
  mapType: string | undefined,
  {
    cruiseMode = false,
    bikingAllowed = true,
    seafoamSurfable = false
  }: InitialPlayerAvatarAdjustmentOptions = {}
): number => {
  if (mapType !== 'MAP_TYPE_INDOOR' && cruiseMode) {
    return PLAYER_AVATAR_FLAG_ON_FOOT;
  }
  if (mapType === 'MAP_TYPE_UNDERWATER') {
    return PLAYER_AVATAR_FLAG_UNDERWATER;
  }
  if (seafoamSurfable && MetatileBehavior_IsSurfable(metatileBehavior)) {
    return PLAYER_AVATAR_FLAG_ON_FOOT;
  }
  if (MetatileBehavior_IsSurfable(metatileBehavior)) {
    return PLAYER_AVATAR_FLAG_SURFING;
  }
  if (!bikingAllowed) {
    return PLAYER_AVATAR_FLAG_ON_FOOT;
  }
  if (playerStruct.transitionFlags === PLAYER_AVATAR_FLAG_MACH_BIKE) {
    return PLAYER_AVATAR_FLAG_MACH_BIKE;
  }
  if (playerStruct.transitionFlags !== PLAYER_AVATAR_FLAG_ACRO_BIKE) {
    return PLAYER_AVATAR_FLAG_ON_FOOT;
  }
  return PLAYER_AVATAR_FLAG_ACRO_BIKE;
};

export const getAdjustedInitialDirection = (
  playerStruct: InitialPlayerAvatarState,
  transitionFlags: number,
  metatileBehavior: number,
  mapType: string | undefined,
  { cruiseMode = false }: InitialPlayerAvatarAdjustmentOptions = {}
): PlayerState['facing'] => {
  if (cruiseMode && mapType === 'MAP_TYPE_OCEAN_ROUTE') {
    return 'right';
  }
  if (MetatileBehavior_IsNonAnimDoor(metatileBehavior) || MetatileBehavior_IsWarpDoor_2(metatileBehavior)) {
    return 'down';
  }
  if (MetatileBehavior_IsSouthArrowWarp(metatileBehavior)) {
    return 'up';
  }
  if (MetatileBehavior_IsNorthArrowWarp(metatileBehavior)) {
    return 'down';
  }
  if (MetatileBehavior_IsWestArrowWarp(metatileBehavior)) {
    return 'right';
  }
  if (MetatileBehavior_IsEastArrowWarp(metatileBehavior)) {
    return 'left';
  }
  if (
    MetatileBehavior_IsDirectionalUpRightStairWarp(metatileBehavior)
    || MetatileBehavior_IsDirectionalDownRightStairWarp(metatileBehavior)
  ) {
    return 'left';
  }
  if (
    MetatileBehavior_IsDirectionalUpLeftStairWarp(metatileBehavior)
    || MetatileBehavior_IsDirectionalDownLeftStairWarp(metatileBehavior)
  ) {
    return 'right';
  }
  if (
    (playerStruct.transitionFlags === PLAYER_AVATAR_FLAG_UNDERWATER && transitionFlags === PLAYER_AVATAR_FLAG_SURFING)
    || (playerStruct.transitionFlags === PLAYER_AVATAR_FLAG_SURFING && transitionFlags === PLAYER_AVATAR_FLAG_UNDERWATER)
  ) {
    return playerStruct.direction;
  }
  if (MetatileBehavior_IsLadder(metatileBehavior)) {
    return playerStruct.direction;
  }
  if (playerStruct.hasDirectionSet) {
    return playerStruct.direction;
  }
  return 'down';
};

export const getInitialPlayerAvatarState = (
  playerStruct: InitialPlayerAvatarState,
  metatileBehavior: number,
  mapType: string | undefined,
  options: InitialPlayerAvatarAdjustmentOptions = {}
): InitialPlayerAvatarState => {
  const transitionFlags = getAdjustedInitialTransitionFlags(playerStruct, metatileBehavior, mapType, options);
  return {
    transitionFlags,
    direction: getAdjustedInitialDirection(playerStruct, transitionFlags, metatileBehavior, mapType, options),
    hasDirectionSet: false
  };
};

export const lockPlayerFieldControls = (player: PlayerState): void => {
  player.controllable = false;
  player.avatarFlags = getPlayerAvatarFlags(player) & ~PLAYER_AVATAR_FLAG_CONTROLLABLE;
};

export const unlockPlayerFieldControls = (player: PlayerState): void => {
  player.controllable = true;
  player.avatarFlags = getPlayerAvatarFlags(player) | PLAYER_AVATAR_FLAG_CONTROLLABLE;
};

export const forcePlayerOntoMachBike = (player: PlayerState): void => {
  if (getPlayerAvatarFlags(player) & PLAYER_AVATAR_FLAG_ON_FOOT) {
    setPlayerAvatarTransitionFlags(player, PLAYER_AVATAR_FLAG_MACH_BIKE);
  }
};

export const forcePlayerToStartSurfing = (player: PlayerState): void => {
  setPlayerAvatarTransitionFlags(player, PLAYER_AVATAR_FLAG_SURFING);
};
