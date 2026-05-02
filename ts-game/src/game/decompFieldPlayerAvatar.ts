import { DIR_EAST, DIR_NONE, DIR_NORTH, DIR_SOUTH, DIR_WEST } from './decompFieldmap';

export { DIR_EAST, DIR_NONE, DIR_NORTH, DIR_SOUTH, DIR_WEST };

export const MALE = 0;
export const FEMALE = 1;
export const GENDER_COUNT = 2;

export const PLAYER_AVATAR_STATE_NORMAL = 0;
export const PLAYER_AVATAR_STATE_MACH_BIKE = 1;
export const PLAYER_AVATAR_STATE_ACRO_BIKE = 2;
export const PLAYER_AVATAR_STATE_SURFING = 3;
export const PLAYER_AVATAR_STATE_UNDERWATER = 4;
export const PLAYER_AVATAR_STATE_CONTROLLABLE = 5;
export const PLAYER_AVATAR_STATE_FORCED = 6;
export const PLAYER_AVATAR_STATE_DASH = 7;

export const PLAYER_AVATAR_FLAG_ON_FOOT = 1 << PLAYER_AVATAR_STATE_NORMAL;
export const PLAYER_AVATAR_FLAG_MACH_BIKE = 1 << PLAYER_AVATAR_STATE_MACH_BIKE;
export const PLAYER_AVATAR_FLAG_ACRO_BIKE = 1 << PLAYER_AVATAR_STATE_ACRO_BIKE;
export const PLAYER_AVATAR_FLAG_SURFING = 1 << PLAYER_AVATAR_STATE_SURFING;
export const PLAYER_AVATAR_FLAG_UNDERWATER = 1 << PLAYER_AVATAR_STATE_UNDERWATER;
export const PLAYER_AVATAR_FLAG_CONTROLLABLE = 1 << PLAYER_AVATAR_STATE_CONTROLLABLE;
export const PLAYER_AVATAR_FLAG_FORCED = 1 << PLAYER_AVATAR_STATE_FORCED;
export const PLAYER_AVATAR_FLAG_DASH = 1 << PLAYER_AVATAR_STATE_DASH;

export const PLAYER_AVATAR_GFX_NORMAL = 0;
export const PLAYER_AVATAR_GFX_BIKE = 1;
export const PLAYER_AVATAR_GFX_RIDE = 2;
export const PLAYER_AVATAR_GFX_FIELD_MOVE = 3;
export const PLAYER_AVATAR_GFX_FISH = 4;
export const PLAYER_AVATAR_GFX_VSSEEKER = 5;

export const NOT_MOVING = 0;
export const TURN_DIRECTION = 1;
export const MOVING = 2;
export const T_NOT_MOVING = 0;
export const T_TILE_CENTER = 1;
export const T_TILE_TRANSITION = 2;

export const OBJ_EVENT_GFX_RED_NORMAL = 0;
export const OBJ_EVENT_GFX_RED_BIKE = 1;
export const OBJ_EVENT_GFX_RED_SURF = 2;
export const OBJ_EVENT_GFX_RED_FIELD_MOVE = 3;
export const OBJ_EVENT_GFX_RED_FISH = 4;
export const OBJ_EVENT_GFX_RED_VS_SEEKER = 5;
export const OBJ_EVENT_GFX_RED_VS_SEEKER_BIKE = 6;
export const OBJ_EVENT_GFX_GREEN_NORMAL = 7;
export const OBJ_EVENT_GFX_GREEN_BIKE = 8;
export const OBJ_EVENT_GFX_GREEN_SURF = 9;
export const OBJ_EVENT_GFX_GREEN_FIELD_MOVE = 10;
export const OBJ_EVENT_GFX_GREEN_FISH = 11;
export const OBJ_EVENT_GFX_GREEN_VS_SEEKER = 12;
export const OBJ_EVENT_GFX_GREEN_VS_SEEKER_BIKE = 13;
export const OBJ_EVENT_GFX_RS_BRENDAN = 14;
export const OBJ_EVENT_GFX_RS_MAY = 15;

export const MOVEMENT_ACTION_WALK_NORMAL_DOWN = 0x10;
export const MOVEMENT_ACTION_WALK_NORMAL_UP = 0x11;
export const MOVEMENT_ACTION_WALK_NORMAL_LEFT = 0x12;
export const MOVEMENT_ACTION_WALK_NORMAL_RIGHT = 0x13;
export const MOVEMENT_ACTION_WALK_SLOWER_DOWN = 0x08;
export const MOVEMENT_ACTION_WALK_SLOWER_UP = 0x09;
export const MOVEMENT_ACTION_WALK_SLOWER_LEFT = 0x0a;
export const MOVEMENT_ACTION_WALK_SLOWER_RIGHT = 0x0b;
export const MOVEMENT_ACTION_WALK_SLOW_DOWN = 0x0c;
export const MOVEMENT_ACTION_WALK_SLOW_UP = 0x0d;
export const MOVEMENT_ACTION_WALK_SLOW_LEFT = 0x0e;
export const MOVEMENT_ACTION_WALK_SLOW_RIGHT = 0x0f;
export const MOVEMENT_ACTION_JUMP_2_DOWN = 0x14;
export const MOVEMENT_ACTION_JUMP_2_UP = 0x15;
export const MOVEMENT_ACTION_JUMP_2_LEFT = 0x16;
export const MOVEMENT_ACTION_JUMP_2_RIGHT = 0x17;
export const MOVEMENT_ACTION_DELAY_1 = 0x18;
export const MOVEMENT_ACTION_DELAY_2 = 0x19;
export const MOVEMENT_ACTION_DELAY_4 = 0x1a;
export const MOVEMENT_ACTION_DELAY_8 = 0x1b;
export const MOVEMENT_ACTION_WALK_FAST_DOWN = 0x1d;
export const MOVEMENT_ACTION_WALK_FAST_UP = 0x1e;
export const MOVEMENT_ACTION_WALK_FAST_LEFT = 0x1f;
export const MOVEMENT_ACTION_WALK_FAST_RIGHT = 0x20;
export const MOVEMENT_ACTION_FACE_RIGHT_FAST = 0x07;
export const MOVEMENT_ACTION_DELAY_16 = 0x1c;
export const MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN = 0x21;
export const MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_UP = 0x22;
export const MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_LEFT = 0x23;
export const MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_RIGHT = 0x24;
export const MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN = 0x25;
export const MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_UP = 0x26;
export const MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_LEFT = 0x27;
export const MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_RIGHT = 0x28;
export const MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN = 0x29;
export const MOVEMENT_ACTION_WALK_IN_PLACE_FAST_UP = 0x2a;
export const MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT = 0x2b;
export const MOVEMENT_ACTION_WALK_IN_PLACE_FAST_RIGHT = 0x2c;
export const MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_RIGHT = 0x30;
export const MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN = 0x31;
export const MOVEMENT_ACTION_RIDE_WATER_CURRENT_UP = 0x32;
export const MOVEMENT_ACTION_RIDE_WATER_CURRENT_LEFT = 0x33;
export const MOVEMENT_ACTION_RIDE_WATER_CURRENT_RIGHT = 0x34;
export const MOVEMENT_ACTION_WALK_FASTER_DOWN = 0x35;
export const MOVEMENT_ACTION_WALK_FASTER_UP = 0x36;
export const MOVEMENT_ACTION_WALK_FASTER_LEFT = 0x37;
export const MOVEMENT_ACTION_WALK_FASTER_RIGHT = 0x38;
export const MOVEMENT_ACTION_PLAYER_RUN_DOWN = 0x3d;
export const MOVEMENT_ACTION_PLAYER_RUN_UP = 0x3e;
export const MOVEMENT_ACTION_PLAYER_RUN_LEFT = 0x3f;
export const MOVEMENT_ACTION_PLAYER_RUN_RIGHT = 0x40;
export const MOVEMENT_ACTION_PLAYER_RUN_DOWN_SLOW = 0x41;
export const MOVEMENT_ACTION_PLAYER_RUN_UP_SLOW = 0x42;
export const MOVEMENT_ACTION_PLAYER_RUN_LEFT_SLOW = 0x43;
export const MOVEMENT_ACTION_PLAYER_RUN_RIGHT_SLOW = 0x44;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN = 0x52;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_UP = 0x53;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT = 0x54;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT = 0x55;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN_UP = 0x56;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN = 0x57;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT_RIGHT = 0x58;
export const MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT = 0x59;
export const MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN = 0x70;
export const MOVEMENT_ACTION_ACRO_WHEELIE_FACE_UP = 0x71;
export const MOVEMENT_ACTION_ACRO_WHEELIE_FACE_LEFT = 0x72;
export const MOVEMENT_ACTION_ACRO_WHEELIE_FACE_RIGHT = 0x73;
export const MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN = 0x74;
export const MOVEMENT_ACTION_ACRO_POP_WHEELIE_UP = 0x75;
export const MOVEMENT_ACTION_ACRO_POP_WHEELIE_LEFT = 0x76;
export const MOVEMENT_ACTION_ACRO_POP_WHEELIE_RIGHT = 0x77;
export const MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN = 0x78;
export const MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_UP = 0x79;
export const MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_LEFT = 0x7a;
export const MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_RIGHT = 0x7b;
export const MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN = 0x7c;
export const MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_UP = 0x7d;
export const MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_LEFT = 0x7e;
export const MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_RIGHT = 0x7f;
export const MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN = 0x80;
export const MOVEMENT_ACTION_ACRO_WHEELIE_HOP_UP = 0x81;
export const MOVEMENT_ACTION_ACRO_WHEELIE_HOP_LEFT = 0x82;
export const MOVEMENT_ACTION_ACRO_WHEELIE_HOP_RIGHT = 0x83;
export const MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN = 0x84;
export const MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_UP = 0x85;
export const MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_LEFT = 0x86;
export const MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_RIGHT = 0x87;
export const MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN = 0x88;
export const MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_UP = 0x89;
export const MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_LEFT = 0x8a;
export const MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_RIGHT = 0x8b;
export const MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN = 0x8c;
export const MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_UP = 0x8d;
export const MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_LEFT = 0x8e;
export const MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_RIGHT = 0x8f;
export const MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN = 0x90;
export const MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_UP = 0x91;
export const MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_LEFT = 0x92;
export const MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_RIGHT = 0x93;
export const MOVEMENT_ACTION_SPIN_DOWN = 0x94;
export const MOVEMENT_ACTION_SPIN_UP = 0x95;
export const MOVEMENT_ACTION_SPIN_LEFT = 0x96;
export const MOVEMENT_ACTION_SPIN_RIGHT = 0x97;
export const MOVEMENT_ACTION_SHAKE_HEAD_OR_WALK_IN_PLACE = 0x9f;
export const MOVEMENT_ACTION_GLIDE_DOWN = 0xa0;
export const MOVEMENT_ACTION_GLIDE_UP = 0xa1;
export const MOVEMENT_ACTION_GLIDE_LEFT = 0xa2;
export const MOVEMENT_ACTION_GLIDE_RIGHT = 0xa3;
export const MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_DOWN = 0xa6;
export const MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_UP = 0xa7;
export const MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_LEFT = 0xa8;
export const MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_RIGHT = 0xa9;

export const PARTY_SIZE = 6;
export const SPECIES_NONE = 0;
export const MOVE_SURF = 57;
export const SE_WALL_HIT = 7;
export const SE_LEDGE = 10;
export const SE_BIKE_HOP = 28;
export const SE_WARP_IN = 39;
export const SE_M_RAZOR_WIND2 = 144;
export const SE_M_STRENGTH = 207;
export const MOVEMENT_ACTION_NONE = 0xff;
export const LOCALID_PLAYER = 0xff;
export const MOVEMENT_TYPE_PLAYER = 0;
export const TRAINER_TYPE_NONE = 0;
export const ANIM_FIELD_MOVE = 0;
export const ANIM_VS_SEEKER = 1;
export const ANIM_PUT_AWAY_ROD_SOUTH = 4;
export const ANIM_PUT_AWAY_ROD_NORTH = 5;
export const ANIM_PUT_AWAY_ROD_WEST = 6;
export const ANIM_PUT_AWAY_ROD_EAST = 7;
export const ANIM_HOOKED_POKEMON_SOUTH = 8;
export const ANIM_HOOKED_POKEMON_NORTH = 9;
export const ANIM_HOOKED_POKEMON_WEST = 10;
export const ANIM_HOOKED_POKEMON_EAST = 11;
export const QL_PLAYER_GFX_NORMAL = 0;
export const QL_PLAYER_GFX_BIKE = 1;
export const QL_PLAYER_GFX_SURF = 2;
export const QL_PLAYER_GFX_FISH = 3;
export const BOB_MON_ONLY = 0;
export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const FISHING_START_ROUND = 3;
export const FISHING_GOT_BITE = 6;
export const FISHING_ON_HOOK = 9;
export const FISHING_NO_BITE = 11;
export const FISHING_GOT_AWAY = 12;
export const FISHING_SHOW_RESULT = 13;
export const QL_PLAYBACK_STATE_RUNNING = 1;
export const QL_PLAYBACK_STATE_ACTION_END = 3;

export const COLLISION_NONE = 0;
export const COLLISION_OBJECT_EVENT = 1;
export const COLLISION_WARP = 2;
export const COLLISION_LEDGE_JUMP = 3;
export const COLLISION_PUSHED_BOULDER = 4;
export const COLLISION_DIRECTIONAL_STAIR_WARP = 5;
export const COLLISION_STOP_SURFING = 6;
export const COLLISION_ELEVATION_MISMATCH = 7;
export const COLLISION_WHEELIE_HOP = 8;
export const COLLISION_ISOLATED_VERTICAL_RAIL = 9;
export const COLLISION_ISOLATED_HORIZONTAL_RAIL = 10;
export const COLLISION_VERTICAL_RAIL = 11;
export const COLLISION_HORIZONTAL_RAIL = 12;
export const OBJECT_EVENTS_COUNT = 16;
export const OBJ_EVENT_GFX_PUSHABLE_BOULDER = 0x66;
export const MB_FALL_WARP = 0xea;

export interface FieldPlayerAvatar {
  flags: number;
  spriteId: number;
  objectEventId: number;
  gender: number;
  transitionFlags: number;
  runningState: number;
  tileTransitionState: number;
  preventStep: boolean;
  lastSpinTile?: number;
}

export interface FieldCoords {
  x: number;
  y: number;
}

export interface FieldObjectEvent {
  currentCoords: FieldCoords;
  facingDirection: number;
  movementDirection: number;
  previousElevation: number;
  currentMetatileBehavior: number;
  graphicsId: number;
  isPlayer: boolean;
  invisible: boolean;
  inanimate: boolean;
  disableAnim: boolean;
  enableAnim: boolean;
  facingDirectionLocked: boolean;
  warpArrowSpriteId: number;
  fieldEffectSpriteId: number;
  playerCopyableMovement: number;
  movementOverridden: boolean;
  heldMovementActive: boolean;
  heldMovementFinished: boolean;
  movementActionId: number;
  spriteId: number;
  fixedPriority: boolean;
}

export interface FieldSprite {
  data: number[];
  animNum: number;
  invisible: boolean;
  x2: number;
  y2: number;
  x?: number;
  y?: number;
  oamPriority?: number;
  subpriority?: number;
  subspriteMode?: number;
  animEnded?: boolean;
  destroyed?: boolean;
}

export interface FieldTask {
  id: number;
  data: number[];
  func: string;
  destroyed: boolean;
}

export interface FieldPartyMon {
  species: number;
  moves: number[];
}

export interface FieldMetatileBehaviorHooks {
  isSouthArrowWarp: (behavior: number) => boolean;
  isNorthArrowWarp: (behavior: number) => boolean;
  isWestArrowWarp: (behavior: number) => boolean;
  isEastArrowWarp: (behavior: number) => boolean;
  isDirectionalUpLeftStairWarp: (behavior: number) => boolean;
  isDirectionalDownLeftStairWarp: (behavior: number) => boolean;
  isDirectionalUpRightStairWarp: (behavior: number) => boolean;
  isDirectionalDownRightStairWarp: (behavior: number) => boolean;
  isWarpDoor: (behavior: number) => boolean;
  isBumpySlope: (behavior: number) => boolean;
  isDirectionalStairWarp: (behavior: number, direction: number) => boolean;
  isRockStairs: (behavior: number) => boolean;
  isTrickHouseSlipperyFloor: (behavior: number) => boolean;
  isIce2: (behavior: number) => boolean;
  isWalkSouth: (behavior: number) => boolean;
  isWalkNorth: (behavior: number) => boolean;
  isWalkWest: (behavior: number) => boolean;
  isWalkEast: (behavior: number) => boolean;
  isSouthwardCurrent: (behavior: number) => boolean;
  isNorthwardCurrent: (behavior: number) => boolean;
  isWestwardCurrent: (behavior: number) => boolean;
  isEastwardCurrent: (behavior: number) => boolean;
  isSpinRight: (behavior: number) => boolean;
  isSpinLeft: (behavior: number) => boolean;
  isSpinUp: (behavior: number) => boolean;
  isSpinDown: (behavior: number) => boolean;
  isSlideSouth: (behavior: number) => boolean;
  isSlideNorth: (behavior: number) => boolean;
  isSlideWest: (behavior: number) => boolean;
  isSlideEast: (behavior: number) => boolean;
  isWaterfall: (behavior: number) => boolean;
  isSecretBaseJumpMat: (behavior: number) => boolean;
  isSecretBaseSpinMat: (behavior: number) => boolean;
  isSpinTile: (behavior: number) => boolean;
  isStopSpinning: (behavior: number) => boolean;
  isIsolatedVerticalRail: (behavior: number) => boolean;
  isIsolatedHorizontalRail: (behavior: number) => boolean;
  isVerticalRail: (behavior: number) => boolean;
  isHorizontalRail: (behavior: number) => boolean;
  isNonAnimDoor: (behavior: number) => boolean;
}

export interface FieldPlayerAvatarRuntime {
  gPlayerAvatar: FieldPlayerAvatar;
  gObjectEvents: FieldObjectEvent[];
  gSprites: FieldSprite[];
  gTasks: FieldTask[];
  gPlayerParty: FieldPartyMon[];
  operations: string[];
  gFieldEffectArguments: number[];
  random: () => number;
  questLogPlaybackState: number;
  questLogFishActionSuccessful: boolean;
  doesCurrentMapHaveFishingMons: boolean;
  newKeys: number;
  textPrinterActive: boolean;
  fishingWildEncounterRod: number | null;
  teleportSavedFacingDirection: number;
  totalCameraPixelOffsetY: number;
  flagBDash: boolean;
  flagUseStrength: boolean;
  runningDisallowed: (behavior: number) => boolean;
  playerIsMovingOnRockStairs: (direction: number) => boolean;
  getCollisionAtCoords: (objectEvent: FieldObjectEvent, x: number, y: number, direction: number) => number;
  mapGridGetElevationAt: (x: number, y: number) => number;
  getObjectEventIdByPosition: (x: number, y: number, elevation: number) => number;
  getObjectEventIdByXY: (x: number, y: number) => number;
  getLedgeJumpDirection: (x: number, y: number, direction: number) => number;
  mapGridGetMetatileBehaviorAt: (x: number, y: number) => number;
  metatileAtCoordsIsWaterTile: (x: number, y: number) => boolean;
  metatileBehavior: FieldMetatileBehaviorHooks;
}

const sPlayerAvatarGfxIds = [
  [OBJ_EVENT_GFX_RED_NORMAL, OBJ_EVENT_GFX_GREEN_NORMAL],
  [OBJ_EVENT_GFX_RED_BIKE, OBJ_EVENT_GFX_GREEN_BIKE],
  [OBJ_EVENT_GFX_RED_SURF, OBJ_EVENT_GFX_GREEN_SURF],
  [OBJ_EVENT_GFX_RED_FIELD_MOVE, OBJ_EVENT_GFX_GREEN_FIELD_MOVE],
  [OBJ_EVENT_GFX_RED_FISH, OBJ_EVENT_GFX_GREEN_FISH],
  [OBJ_EVENT_GFX_RED_VS_SEEKER, OBJ_EVENT_GFX_GREEN_VS_SEEKER]
] as const;

const sHoennLinkPartnerGfxIds = [
  OBJ_EVENT_GFX_RS_BRENDAN,
  OBJ_EVENT_GFX_RS_MAY
] as const;

const sPlayerAvatarVsSeekerBikeGfxIds = [
  OBJ_EVENT_GFX_RED_VS_SEEKER_BIKE,
  OBJ_EVENT_GFX_GREEN_VS_SEEKER_BIKE
] as const;

const sPlayerAvatarGfxToStateFlag = [
  [
    [OBJ_EVENT_GFX_RED_NORMAL, PLAYER_AVATAR_FLAG_ON_FOOT],
    [OBJ_EVENT_GFX_RED_BIKE, PLAYER_AVATAR_FLAG_MACH_BIKE],
    [OBJ_EVENT_GFX_RED_SURF, PLAYER_AVATAR_FLAG_SURFING]
  ],
  [
    [OBJ_EVENT_GFX_GREEN_NORMAL, PLAYER_AVATAR_FLAG_ON_FOOT],
    [OBJ_EVENT_GFX_GREEN_BIKE, PLAYER_AVATAR_FLAG_MACH_BIKE],
    [OBJ_EVENT_GFX_GREEN_SURF, PLAYER_AVATAR_FLAG_SURFING]
  ]
] as const;

const defaultMetatileBehaviorHooks: FieldMetatileBehaviorHooks = {
  isSouthArrowWarp: () => false,
  isNorthArrowWarp: () => false,
  isWestArrowWarp: () => false,
  isEastArrowWarp: () => false,
  isDirectionalUpLeftStairWarp: () => false,
  isDirectionalDownLeftStairWarp: () => false,
  isDirectionalUpRightStairWarp: () => false,
  isDirectionalDownRightStairWarp: () => false,
  isWarpDoor: () => false,
  isBumpySlope: () => false,
  isDirectionalStairWarp: () => false,
  isRockStairs: () => false,
  isTrickHouseSlipperyFloor: () => false,
  isIce2: () => false,
  isWalkSouth: () => false,
  isWalkNorth: () => false,
  isWalkWest: () => false,
  isWalkEast: () => false,
  isSouthwardCurrent: () => false,
  isNorthwardCurrent: () => false,
  isWestwardCurrent: () => false,
  isEastwardCurrent: () => false,
  isSpinRight: () => false,
  isSpinLeft: () => false,
  isSpinUp: () => false,
  isSpinDown: () => false,
  isSlideSouth: () => false,
  isSlideNorth: () => false,
  isSlideWest: () => false,
  isSlideEast: () => false,
  isWaterfall: () => false,
  isSecretBaseJumpMat: () => false,
  isSecretBaseSpinMat: () => false,
  isSpinTile: () => false,
  isStopSpinning: () => false,
  isIsolatedVerticalRail: () => false,
  isIsolatedHorizontalRail: () => false,
  isVerticalRail: () => false,
  isHorizontalRail: () => false,
  isNonAnimDoor: () => false
};

export const createFieldPlayerAvatar = (overrides: Partial<FieldPlayerAvatar> = {}): FieldPlayerAvatar => ({
  flags: 0,
  spriteId: 0,
  objectEventId: 0,
  gender: MALE,
  transitionFlags: 0,
  runningState: NOT_MOVING,
  tileTransitionState: T_NOT_MOVING,
  preventStep: false,
  lastSpinTile: 0,
  ...overrides
});

export const createFieldObjectEvent = (overrides: Partial<FieldObjectEvent> = {}): FieldObjectEvent => ({
  currentCoords: { x: 0, y: 0 },
  facingDirection: DIR_SOUTH,
  movementDirection: DIR_SOUTH,
  previousElevation: 0,
  currentMetatileBehavior: 0,
  graphicsId: OBJ_EVENT_GFX_RED_NORMAL,
  isPlayer: false,
  invisible: false,
  inanimate: false,
  disableAnim: false,
  enableAnim: true,
  facingDirectionLocked: false,
  warpArrowSpriteId: 0,
  fieldEffectSpriteId: 0,
  playerCopyableMovement: 0,
  movementOverridden: false,
  heldMovementActive: false,
  heldMovementFinished: false,
  movementActionId: MOVEMENT_ACTION_WALK_NORMAL_DOWN,
  spriteId: 0,
  fixedPriority: false,
  ...overrides
});

export const createFieldPlayerAvatarRuntime = (
  overrides: Partial<Omit<FieldPlayerAvatarRuntime, 'metatileBehavior'>> & {
    metatileBehavior?: Partial<FieldMetatileBehaviorHooks>;
  } = {}
): FieldPlayerAvatarRuntime => ({
  gPlayerAvatar: createFieldPlayerAvatar(overrides.gPlayerAvatar),
  gObjectEvents: overrides.gObjectEvents ?? [createFieldObjectEvent()],
  gSprites: overrides.gSprites ?? [{ data: [0, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 }],
  gTasks: overrides.gTasks ?? [],
  gPlayerParty: overrides.gPlayerParty ?? [],
  operations: overrides.operations ?? [],
  gFieldEffectArguments: overrides.gFieldEffectArguments ?? [0, 0, 0, 0],
  random: overrides.random ?? (() => 0),
  questLogPlaybackState: overrides.questLogPlaybackState ?? 0,
  questLogFishActionSuccessful: overrides.questLogFishActionSuccessful ?? false,
  doesCurrentMapHaveFishingMons: overrides.doesCurrentMapHaveFishingMons ?? true,
  newKeys: overrides.newKeys ?? 0,
  textPrinterActive: overrides.textPrinterActive ?? false,
  fishingWildEncounterRod: overrides.fishingWildEncounterRod ?? null,
  teleportSavedFacingDirection: overrides.teleportSavedFacingDirection ?? DIR_NONE,
  totalCameraPixelOffsetY: overrides.totalCameraPixelOffsetY ?? 0,
  flagBDash: overrides.flagBDash ?? false,
  flagUseStrength: overrides.flagUseStrength ?? false,
  runningDisallowed: overrides.runningDisallowed ?? (() => false),
  playerIsMovingOnRockStairs: overrides.playerIsMovingOnRockStairs ?? (() => false),
  getCollisionAtCoords: overrides.getCollisionAtCoords ?? (() => COLLISION_NONE),
  mapGridGetElevationAt: overrides.mapGridGetElevationAt ?? (() => 0),
  getObjectEventIdByPosition: overrides.getObjectEventIdByPosition ?? (() => OBJECT_EVENTS_COUNT),
  getObjectEventIdByXY: overrides.getObjectEventIdByXY ?? (() => OBJECT_EVENTS_COUNT),
  getLedgeJumpDirection: overrides.getLedgeJumpDirection ?? (() => DIR_NONE),
  mapGridGetMetatileBehaviorAt: overrides.mapGridGetMetatileBehaviorAt ?? (() => 0),
  metatileAtCoordsIsWaterTile: overrides.metatileAtCoordsIsWaterTile ?? (() => false),
  metatileBehavior: { ...defaultMetatileBehaviorHooks, ...overrides.metatileBehavior }
});

const op = (runtime: FieldPlayerAvatarRuntime, value: string): void => {
  runtime.operations.push(value);
};

export const createFieldTask = (runtime: FieldPlayerAvatarRuntime, func: string, id = runtime.gTasks.length): FieldTask => {
  const task = {
    id,
    data: Array.from({ length: 16 }, () => 0),
    func,
    destroyed: false
  };
  runtime.gTasks[id] = task;
  return task;
};

const destroyFieldTask = (task: FieldTask): void => {
  task.destroyed = true;
};

export const MoveCoords = (direction: number, coords: FieldCoords): void => {
  switch (direction) {
    case DIR_SOUTH:
      coords.y += 1;
      break;
    case DIR_NORTH:
      coords.y -= 1;
      break;
    case DIR_WEST:
      coords.x -= 1;
      break;
    case DIR_EAST:
      coords.x += 1;
      break;
  }
};

export const GetXYCoordsOneStepInFrontOfPlayer = (runtime: FieldPlayerAvatarRuntime): FieldCoords => {
  const object = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  const coords = { x: object.currentCoords.x, y: object.currentCoords.y };
  MoveCoords(GetPlayerFacingDirection(runtime), coords);
  return coords;
};

export const PlayerGetDestCoords = (runtime: FieldPlayerAvatarRuntime): FieldCoords => {
  const object = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  return { x: object.currentCoords.x, y: object.currentCoords.y };
};

export const player_get_pos_including_state_based_drift = (
  runtime: FieldPlayerAvatarRuntime
): { result: number; x: number; y: number } => {
  const object = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  const sprite = runtime.gSprites[object.spriteId];

  if (object.heldMovementActive && !object.heldMovementFinished && !sprite.data[2]) {
    const coords = { x: object.currentCoords.x, y: object.currentCoords.y };

    switch (object.movementActionId) {
      case MOVEMENT_ACTION_WALK_NORMAL_DOWN:
      case MOVEMENT_ACTION_PLAYER_RUN_DOWN:
        coords.y += 1;
        return { result: 1, x: coords.x, y: coords.y };
      case MOVEMENT_ACTION_WALK_NORMAL_UP:
      case MOVEMENT_ACTION_PLAYER_RUN_UP:
        coords.y -= 1;
        return { result: 1, x: coords.x, y: coords.y };
      case MOVEMENT_ACTION_WALK_NORMAL_LEFT:
      case MOVEMENT_ACTION_PLAYER_RUN_LEFT:
        coords.x -= 1;
        return { result: 1, x: coords.x, y: coords.y };
      case MOVEMENT_ACTION_WALK_NORMAL_RIGHT:
      case MOVEMENT_ACTION_PLAYER_RUN_RIGHT:
        coords.x += 1;
        return { result: 1, x: coords.x, y: coords.y };
    }
  }

  return { result: 0, x: -1, y: -1 };
};

export const GetPlayerFacingDirection = (runtime: FieldPlayerAvatarRuntime): number =>
  runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].facingDirection;

export const GetPlayerMovementDirection = (runtime: FieldPlayerAvatarRuntime): number =>
  runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].movementDirection;

export const PlayerGetElevation = (runtime: FieldPlayerAvatarRuntime): number =>
  runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].previousElevation;

export const MovePlayerToMapCoords = (runtime: FieldPlayerAvatarRuntime, x: number, y: number): void => {
  runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].currentCoords = { x, y };
};

export const TestPlayerAvatarFlags = (runtime: FieldPlayerAvatarRuntime, bm: number): number =>
  runtime.gPlayerAvatar.flags & bm;

export const GetPlayerAvatarFlags = (runtime: FieldPlayerAvatarRuntime): number => runtime.gPlayerAvatar.flags;

export const GetPlayerAvatarObjectId = (runtime: FieldPlayerAvatarRuntime): number => runtime.gPlayerAvatar.spriteId;

const SetObjectEventDirection = (runtime: FieldPlayerAvatarRuntime, object: FieldObjectEvent, direction: number): void => {
  object.facingDirection = direction;
  op(runtime, `SetObjectEventDirection:${direction}`);
};

const directionIndex = (direction: number): number => direction > DIR_EAST ? DIR_NONE : direction;

const dirnToAnim = (table: readonly number[], direction: number): number => table[directionIndex(direction)];

export const GetFaceDirectionMovementAction = (direction: number): number =>
  dirnToAnim([0x00, 0x00, 0x01, 0x02, 0x03], direction);

export const GetFaceDirectionFastMovementAction = (direction: number): number =>
  dirnToAnim([0x04, 0x04, 0x05, 0x06, 0x07], direction);

export const GetWalkSlowerMovementAction = (direction: number): number =>
  dirnToAnim([0x08, 0x08, 0x09, 0x0a, 0x0b], direction);

export const GetWalkSlowMovementAction = (direction: number): number =>
  dirnToAnim([0x0c, 0x0c, 0x0d, 0x0e, 0x0f], direction);

export const GetWalkNormalMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_WALK_NORMAL_DOWN, MOVEMENT_ACTION_WALK_NORMAL_DOWN, MOVEMENT_ACTION_WALK_NORMAL_UP, MOVEMENT_ACTION_WALK_NORMAL_LEFT, MOVEMENT_ACTION_WALK_NORMAL_RIGHT], direction);

export const GetWalkFastMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_WALK_FAST_DOWN, MOVEMENT_ACTION_WALK_FAST_DOWN, MOVEMENT_ACTION_WALK_FAST_UP, MOVEMENT_ACTION_WALK_FAST_LEFT, MOVEMENT_ACTION_WALK_FAST_RIGHT], direction);

export const GetGlideMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_GLIDE_DOWN, MOVEMENT_ACTION_GLIDE_DOWN, MOVEMENT_ACTION_GLIDE_UP, MOVEMENT_ACTION_GLIDE_LEFT, MOVEMENT_ACTION_GLIDE_RIGHT], direction);

export const GetRideWaterCurrentMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN, MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN, MOVEMENT_ACTION_RIDE_WATER_CURRENT_UP, MOVEMENT_ACTION_RIDE_WATER_CURRENT_LEFT, MOVEMENT_ACTION_RIDE_WATER_CURRENT_RIGHT], direction);

export const GetWalkFasterMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_WALK_FASTER_DOWN, MOVEMENT_ACTION_WALK_FASTER_DOWN, MOVEMENT_ACTION_WALK_FASTER_UP, MOVEMENT_ACTION_WALK_FASTER_LEFT, MOVEMENT_ACTION_WALK_FASTER_RIGHT], direction);

export const GetPlayerRunMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_PLAYER_RUN_DOWN, MOVEMENT_ACTION_PLAYER_RUN_DOWN, MOVEMENT_ACTION_PLAYER_RUN_UP, MOVEMENT_ACTION_PLAYER_RUN_LEFT, MOVEMENT_ACTION_PLAYER_RUN_RIGHT], direction);

export const GetPlayerRunSlowMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_PLAYER_RUN_DOWN_SLOW, MOVEMENT_ACTION_PLAYER_RUN_DOWN_SLOW, MOVEMENT_ACTION_PLAYER_RUN_UP_SLOW, MOVEMENT_ACTION_PLAYER_RUN_LEFT_SLOW, MOVEMENT_ACTION_PLAYER_RUN_RIGHT_SLOW], direction);

export const GetSpinMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_SPIN_DOWN, MOVEMENT_ACTION_SPIN_DOWN, MOVEMENT_ACTION_SPIN_UP, MOVEMENT_ACTION_SPIN_LEFT, MOVEMENT_ACTION_SPIN_RIGHT], direction);

export const GetJump2MovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_JUMP_2_DOWN, MOVEMENT_ACTION_JUMP_2_DOWN, MOVEMENT_ACTION_JUMP_2_UP, MOVEMENT_ACTION_JUMP_2_LEFT, MOVEMENT_ACTION_JUMP_2_RIGHT], direction);

export const GetWalkInPlaceSlowMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_UP, MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_LEFT, MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_RIGHT], direction);

export const GetWalkInPlaceNormalMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_UP, MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_LEFT, MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_RIGHT], direction);

export const GetWalkInPlaceFastMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_FAST_UP, MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT, MOVEMENT_ACTION_WALK_IN_PLACE_FAST_RIGHT], direction);

export const GetJumpInPlaceMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN, MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN, MOVEMENT_ACTION_JUMP_IN_PLACE_UP, MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT, MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT], direction);

export const GetJumpInPlaceTurnAroundMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN, MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN, MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN_UP, MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT, MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT_RIGHT], direction);

export const GetJumpSpecialWithEffectMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_DOWN, MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_DOWN, MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_UP, MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_LEFT, MOVEMENT_ACTION_JUMP_SPECIAL_WITH_EFFECT_RIGHT], direction);

export const GetAcroWheelieFaceDirectionMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_FACE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_FACE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_FACE_RIGHT], direction);

export const GetAcroPopWheelieFaceDirectionMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN, MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN, MOVEMENT_ACTION_ACRO_POP_WHEELIE_UP, MOVEMENT_ACTION_ACRO_POP_WHEELIE_LEFT, MOVEMENT_ACTION_ACRO_POP_WHEELIE_RIGHT], direction);

export const GetAcroEndWheelieFaceDirectionMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_UP, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_LEFT, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_RIGHT], direction);

export const GetAcroWheelieHopFaceDirectionMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_RIGHT], direction);

export const GetAcroWheelieHopMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_UP, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_RIGHT], direction);

export const GetAcroWheelieJumpMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_UP, MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_RIGHT], direction);

export const GetAcroWheelieInPlaceMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_RIGHT], direction);

export const GetAcroPopWheelieMoveMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_UP, MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_LEFT, MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_RIGHT], direction);

export const GetAcroWheelieMoveMovementAction = (direction: number): number =>
  dirnToAnim([MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_RIGHT], direction);

export const GetOppositeDirection = (direction: number): number => {
  switch (direction) {
    case DIR_SOUTH:
      return DIR_NORTH;
    case DIR_NORTH:
      return DIR_SOUTH;
    case DIR_WEST:
      return DIR_EAST;
    case DIR_EAST:
      return DIR_WEST;
    default:
      return DIR_NONE;
  }
};

const ObjectEventSetHeldMovement = (
  runtime: FieldPlayerAvatarRuntime,
  objectEvent: FieldObjectEvent,
  movementActionId: number
): boolean => {
  if (objectEvent.movementOverridden)
    return true;

  objectEvent.movementActionId = movementActionId;
  objectEvent.heldMovementActive = true;
  objectEvent.heldMovementFinished = false;
  runtime.gSprites[objectEvent.spriteId].data[2] = 0;
  op(runtime, `ObjectEventSetHeldMovement:${movementActionId}`);
  return false;
};

const ObjectEventClearHeldMovement = (runtime: FieldPlayerAvatarRuntime, objectEvent: FieldObjectEvent): void => {
  objectEvent.movementActionId = MOVEMENT_ACTION_NONE;
  objectEvent.heldMovementActive = false;
  objectEvent.heldMovementFinished = false;
  runtime.gSprites[objectEvent.spriteId].data[1] = 0;
  runtime.gSprites[objectEvent.spriteId].data[2] = 0;
};

const ObjectEventClearHeldMovementIfActive = (runtime: FieldPlayerAvatarRuntime, objectEvent: FieldObjectEvent): void => {
  if (objectEvent.heldMovementActive)
    ObjectEventClearHeldMovement(runtime, objectEvent);
};

export const MovementType_Player = (runtime: FieldPlayerAvatarRuntime, sprite: FieldSprite): void => {
  op(runtime, `UpdateObjectEventCurrentMovement:${sprite.data[0]}`);
};

export const ObjectEventCB2_NoMovement2 = (): number => 0;

export const ObjectEventCheckHeldMovementStatus = (objectEvent: FieldObjectEvent): number => {
  if (objectEvent.heldMovementActive)
    return objectEvent.heldMovementFinished ? 1 : 0;

  return 16;
};

export const ObjectEventClearHeldMovementIfFinished = (
  runtime: FieldPlayerAvatarRuntime,
  objectEvent: FieldObjectEvent
): number => {
  const heldMovementStatus = ObjectEventCheckHeldMovementStatus(objectEvent);
  if (heldMovementStatus !== 0 && heldMovementStatus !== 16)
    ObjectEventClearHeldMovementIfActive(runtime, objectEvent);

  return heldMovementStatus;
};

export const TryInterruptObjectEventSpecialAnim = (
  runtime: FieldPlayerAvatarRuntime,
  playerObjEvent: FieldObjectEvent,
  direction: number
): boolean => {
  if (playerObjEvent.movementOverridden && !ObjectEventClearHeldMovementIfFinished(runtime, playerObjEvent)) {
    const heldMovementActionId = playerObjEvent.movementActionId;
    if (heldMovementActionId > MOVEMENT_ACTION_WALK_FAST_RIGHT && heldMovementActionId < MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN) {
      if (direction !== DIR_NONE && playerObjEvent.movementDirection !== direction) {
        ObjectEventClearHeldMovement(runtime, playerObjEvent);
        return false;
      }
    }

    return true;
  }

  return false;
};

export const npc_clear_strange_bits = (runtime: FieldPlayerAvatarRuntime, objEvent: FieldObjectEvent): void => {
  objEvent.inanimate = false;
  objEvent.disableAnim = false;
  objEvent.facingDirectionLocked = false;
  runtime.gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_DASH;
};

export const QL_TryRecordPlayerStepWithDuration0 = (
  runtime: FieldPlayerAvatarRuntime,
  _objectEvent: FieldObjectEvent,
  movementAction: number
): void => {
  if (!ObjectEventSetHeldMovement(runtime, runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId], movementAction))
    op(runtime, `QuestLogRecordPlayerStepWithDuration:${movementAction}:0`);
};

export const QL_TryRecordNPCStepWithDuration32 = (
  runtime: FieldPlayerAvatarRuntime,
  objectEvent: FieldObjectEvent,
  movementAction: number
): void => {
  if (!ObjectEventSetHeldMovement(runtime, objectEvent, movementAction))
    op(runtime, `QuestLogRecordNPCStepWithDuration:${movementAction}:32`);
};

export const PlayerSetCopyableMovement = (runtime: FieldPlayerAvatarRuntime, movement: number): void => {
  runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].playerCopyableMovement = movement;
};

export const PlayerGetCopyableMovement = (runtime: FieldPlayerAvatarRuntime): number =>
  runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].playerCopyableMovement;

export const PlayerForceSetHeldMovement = (runtime: FieldPlayerAvatarRuntime, movementActionId: number): void => {
  const objectEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  objectEvent.heldMovementActive = false;
  ObjectEventSetHeldMovement(runtime, objectEvent, movementActionId);
};

export const PlayerIsAnimActive = (runtime: FieldPlayerAvatarRuntime): boolean =>
  runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].movementOverridden;

export const PlayerCheckIfAnimFinishedOrInactive = (runtime: FieldPlayerAvatarRuntime): number =>
  ObjectEventCheckHeldMovementStatus(runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId]);

export const PlayerAnimIsMultiFrameStationary = (runtime: FieldPlayerAvatarRuntime): boolean => {
  const movementActionId = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].movementActionId;

  return (
    movementActionId <= MOVEMENT_ACTION_FACE_RIGHT_FAST
    || (movementActionId >= MOVEMENT_ACTION_DELAY_1 && movementActionId <= MOVEMENT_ACTION_DELAY_16)
    || (movementActionId >= MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN && movementActionId <= MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_RIGHT)
    || (movementActionId >= MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN && movementActionId <= MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_RIGHT)
    || (movementActionId >= MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN && movementActionId <= MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_RIGHT)
  );
};

export const PlayerAnimIsMultiFrameStationaryAndStateNotTurning = (runtime: FieldPlayerAvatarRuntime): boolean =>
  PlayerAnimIsMultiFrameStationary(runtime) && runtime.gPlayerAvatar.runningState !== TURN_DIRECTION;

export const PlayerSetAnimId = (
  runtime: FieldPlayerAvatarRuntime,
  movementActionId: number,
  copyableMovement: number
): void => {
  if (!PlayerIsAnimActive(runtime)) {
    PlayerSetCopyableMovement(runtime, copyableMovement);
    if (!ObjectEventSetHeldMovement(runtime, runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId], movementActionId))
      op(runtime, `QuestLogRecordPlayerStep:${movementActionId}`);
  }
};

export const PlayerWalkSlower = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetWalkSlowerMovementAction(direction), 2);

export const PlayerWalkSlow = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetWalkSlowMovementAction(direction), 2);

export const PlayerWalkNormal = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetWalkNormalMovementAction(direction), 2);

export const PlayerWalkFast = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetWalkFastMovementAction(direction), 2);

export const PlayerGlide = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetGlideMovementAction(direction), 2);

export const PlayerRideWaterCurrent = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetRideWaterCurrentMovementAction(direction), 2);

export const PlayerWalkFaster = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetWalkFasterMovementAction(direction), 2);

export const PlayerRun = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetPlayerRunMovementAction(direction), 2);

export const PlayerRunSlow = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetPlayerRunSlowMovementAction(direction), 2);

export const CanStopSurfing = (
  runtime: FieldPlayerAvatarRuntime,
  x: number,
  y: number,
  direction: number
): boolean => {
  if (
    (runtime.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING)
    && runtime.mapGridGetElevationAt(x, y) === 3
    && runtime.getObjectEventIdByPosition(x, y, 3) === OBJECT_EVENTS_COUNT
  ) {
    op(runtime, `QuestLogRecordPlayerAvatarGfxTransitionWithDuration:STOP_SURF:${direction}:16`);
    CreateStopSurfingTask(runtime, direction);
    return true;
  }

  return false;
};

export const ShouldJumpLedge = (
  runtime: FieldPlayerAvatarRuntime,
  x: number,
  y: number,
  direction: number
): boolean => runtime.getLedgeJumpDirection(x, y, direction) !== DIR_NONE;

export const StartStrengthAnim = (
  runtime: FieldPlayerAvatarRuntime,
  objectEventId: number,
  direction: number
): void => {
  const task = createFieldTask(runtime, 'Task_BumpBoulder');

  op(runtime, `StartStrengthAnim:${objectEventId}:${direction}`);
  task.data[1] = objectEventId;
  task.data[2] = direction;
  Task_BumpBoulder(runtime, task);
};

export const DoBoulderInit = (
  runtime: FieldPlayerAvatarRuntime,
  task: FieldTask,
  _playerObject: FieldObjectEvent,
  _strengthObject: FieldObjectEvent
): boolean => {
  op(runtime, 'LockPlayerFieldControls');
  runtime.gPlayerAvatar.preventStep = true;
  task.data[0]++;
  return false;
};

export const DoBoulderDust = (
  runtime: FieldPlayerAvatarRuntime,
  task: FieldTask,
  playerObject: FieldObjectEvent,
  strengthObject: FieldObjectEvent
): boolean => {
  if (!playerObject.movementOverridden && !strengthObject.movementOverridden) {
    ObjectEventClearHeldMovementIfFinished(runtime, playerObject);
    ObjectEventClearHeldMovementIfFinished(runtime, strengthObject);
    QL_TryRecordPlayerStepWithDuration0(runtime, playerObject, GetWalkInPlaceNormalMovementAction(task.data[2]));
    QL_TryRecordNPCStepWithDuration32(runtime, strengthObject, GetWalkSlowerMovementAction(task.data[2]));
    runtime.gFieldEffectArguments[0] = strengthObject.currentCoords.x;
    runtime.gFieldEffectArguments[1] = strengthObject.currentCoords.y;
    runtime.gFieldEffectArguments[2] = strengthObject.previousElevation;
    runtime.gFieldEffectArguments[3] = runtime.gSprites[strengthObject.spriteId].oamPriority ?? 0;
    op(runtime, 'FieldEffectStart:FLDEFF_DUST');
    op(runtime, `PlaySE:${SE_M_STRENGTH}`);
    task.data[0]++;
  }
  return false;
};

export const DoBoulderFinish = (
  runtime: FieldPlayerAvatarRuntime,
  task: FieldTask,
  playerObject: FieldObjectEvent,
  strengthObject: FieldObjectEvent
): boolean => {
  if (ObjectEventCheckHeldMovementStatus(playerObject) && ObjectEventCheckHeldMovementStatus(strengthObject)) {
    ObjectEventClearHeldMovementIfFinished(runtime, playerObject);
    ObjectEventClearHeldMovementIfFinished(runtime, strengthObject);
    op(runtime, `HandleBoulderFallThroughHole:${task.data[1]}`);
    op(runtime, `HandleBoulderActivateVictoryRoadSwitch:${strengthObject.currentCoords.x}:${strengthObject.currentCoords.y}`);
    runtime.gPlayerAvatar.preventStep = false;
    op(runtime, 'UnlockPlayerFieldControls');
    destroyFieldTask(task);
  }
  return false;
};

const sBoulderTaskSteps = [
  DoBoulderInit,
  DoBoulderDust,
  DoBoulderFinish
] as const;

export const Task_BumpBoulder = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): void => {
  const step = sBoulderTaskSteps[task.data[0]];
  while (step?.(
    runtime,
    task,
    runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId],
    runtime.gObjectEvents[task.data[1]]
  ))
    continue;
};

export const TryPushBoulder = (
  runtime: FieldPlayerAvatarRuntime,
  x: number,
  y: number,
  direction: number
): boolean => {
  if (!runtime.flagUseStrength)
    return false;

  const objectEventId = runtime.getObjectEventIdByXY(x, y);
  if (objectEventId === OBJECT_EVENTS_COUNT)
    return false;

  const boulder = runtime.gObjectEvents[objectEventId];
  if (boulder.graphicsId !== OBJ_EVENT_GFX_PUSHABLE_BOULDER)
    return false;

  const dest = { x: boulder.currentCoords.x, y: boulder.currentCoords.y };
  MoveCoords(direction, dest);
  const behavior = runtime.mapGridGetMetatileBehaviorAt(dest.x, dest.y);
  if (
    behavior === MB_FALL_WARP
    || (
      runtime.getCollisionAtCoords(boulder, dest.x, dest.y, direction) === COLLISION_NONE
      && !runtime.metatileBehavior.isNonAnimDoor(behavior)
    )
  ) {
    StartStrengthAnim(runtime, objectEventId, direction);
    return true;
  }

  return false;
};

export const CheckAcroBikeCollision = (
  runtime: FieldPlayerAvatarRuntime,
  metatileBehavior: number
): number => {
  const checks: Array<(behavior: number) => boolean> = [
    runtime.metatileBehavior.isBumpySlope,
    runtime.metatileBehavior.isIsolatedVerticalRail,
    runtime.metatileBehavior.isIsolatedHorizontalRail,
    runtime.metatileBehavior.isVerticalRail,
    runtime.metatileBehavior.isHorizontalRail
  ];
  const collisions = [
    COLLISION_WHEELIE_HOP,
    COLLISION_ISOLATED_VERTICAL_RAIL,
    COLLISION_ISOLATED_HORIZONTAL_RAIL,
    COLLISION_VERTICAL_RAIL,
    COLLISION_HORIZONTAL_RAIL
  ];

  for (let i = 0; i < checks.length; i += 1) {
    if (checks[i](metatileBehavior))
      return collisions[i];
  }

  return COLLISION_NONE;
};

export const CheckForObjectEventCollision = (
  runtime: FieldPlayerAvatarRuntime,
  objectEvent: FieldObjectEvent,
  x: number,
  y: number,
  direction: number,
  metatileBehavior: number
): number => {
  let collision = runtime.getCollisionAtCoords(objectEvent, x, y, direction);
  if (collision === COLLISION_ELEVATION_MISMATCH && CanStopSurfing(runtime, x, y, direction))
    return COLLISION_STOP_SURFING;

  if (ShouldJumpLedge(runtime, x, y, direction)) {
    op(runtime, 'IncrementGameStat:GAME_STAT_JUMPED_DOWN_LEDGES');
    return COLLISION_LEDGE_JUMP;
  }
  if (collision === COLLISION_OBJECT_EVENT && TryPushBoulder(runtime, x, y, direction))
    return COLLISION_PUSHED_BOULDER;

  if (collision === COLLISION_NONE)
    collision = CheckAcroBikeCollision(runtime, metatileBehavior);

  return collision;
};

export const CheckForPlayerAvatarCollision = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number
): number => {
  const playerObjEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  const coords = { x: playerObjEvent.currentCoords.x, y: playerObjEvent.currentCoords.y };
  if (runtime.metatileBehavior.isDirectionalStairWarp(runtime.mapGridGetMetatileBehaviorAt(coords.x, coords.y), direction))
    return COLLISION_DIRECTIONAL_STAIR_WARP;
  MoveCoords(direction, coords);
  return CheckForObjectEventCollision(
    runtime,
    playerObjEvent,
    coords.x,
    coords.y,
    direction,
    runtime.mapGridGetMetatileBehaviorAt(coords.x, coords.y)
  );
};

export const CheckMovementInputNotOnBike = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number
): number => {
  if (direction === DIR_NONE) {
    runtime.gPlayerAvatar.runningState = NOT_MOVING;
    return 0;
  }
  if (direction !== GetPlayerMovementDirection(runtime) && runtime.gPlayerAvatar.runningState !== MOVING) {
    runtime.gPlayerAvatar.runningState = TURN_DIRECTION;
    return 1;
  }

  runtime.gPlayerAvatar.runningState = MOVING;
  return 2;
};

export const PlayerNotOnBikeNotMoving = (
  runtime: FieldPlayerAvatarRuntime,
  _direction: number,
  _heldKeys: number
): void => {
  PlayerFaceDirection(runtime, GetPlayerFacingDirection(runtime));
};

export const PlayerNotOnBikeTurningInPlace = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number,
  _heldKeys: number
): void => {
  PlayerTurnInPlace(runtime, direction);
};

export const PlayerIsMovingOnRockStairs = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number
): boolean => runtime.playerIsMovingOnRockStairs(direction);

export const PlayerNotOnBikeMoving = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number,
  heldKeys: number
): void => {
  const collision = CheckForPlayerAvatarCollision(runtime, direction);

  if (collision !== COLLISION_NONE) {
    if (collision === COLLISION_LEDGE_JUMP)
      PlayerJumpLedge(runtime, direction);
    else if (collision === COLLISION_DIRECTIONAL_STAIR_WARP)
      PlayerFaceDirection(runtime, direction);
    else if (
      collision !== COLLISION_STOP_SURFING
      && collision !== COLLISION_LEDGE_JUMP
      && collision !== COLLISION_PUSHED_BOULDER
      && collision !== COLLISION_DIRECTIONAL_STAIR_WARP
    )
      PlayerNotOnBikeCollide(runtime, direction);
    return;
  }

  if (runtime.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING) {
    PlayerWalkFast(runtime, direction);
    return;
  }

  if (
    (heldKeys & B_BUTTON)
    && runtime.flagBDash
    && !runtime.runningDisallowed(runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].currentMetatileBehavior)
  ) {
    if (PlayerIsMovingOnRockStairs(runtime, direction))
      PlayerRunSlow(runtime, direction);
    else
      PlayerRun(runtime, direction);
    runtime.gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_DASH;
    return;
  }

  if (PlayerIsMovingOnRockStairs(runtime, direction))
    PlayerWalkSlow(runtime, direction);
  else
    PlayerWalkNormal(runtime, direction);
};

const sPlayerNotOnBikeFuncs = [
  PlayerNotOnBikeNotMoving,
  PlayerNotOnBikeTurningInPlace,
  PlayerNotOnBikeMoving
] as const;

export const MovePlayerNotOnBike = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number,
  heldKeys: number
): void => {
  sPlayerNotOnBikeFuncs[CheckMovementInputNotOnBike(runtime, direction)](runtime, direction, heldKeys);
};

export const MovePlayerAvatarUsingKeypadInput = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number,
  newKeys: number,
  heldKeys: number
): void => {
  if (runtime.gPlayerAvatar.flags & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE))
    op(runtime, `MovePlayerOnBike:${direction}:${newKeys}:${heldKeys}`);
  else
    MovePlayerNotOnBike(runtime, direction, heldKeys);
};

export const PlayerAllowForcedMovementIfMovingSameDirection = (runtime: FieldPlayerAvatarRuntime): void => {
  if (runtime.gPlayerAvatar.runningState === MOVING)
    runtime.gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_CONTROLLABLE;
};

export const PlayerApplyTileForcedMovement = (
  runtime: FieldPlayerAvatarRuntime,
  metatileBehavior: number
): void => {
  const entry = sForcedMovementFuncs.find((forcedMovement) =>
    forcedMovement.check !== null && forcedMovement.check(runtime, metatileBehavior)
  );
  if (entry)
    entry.apply(runtime);
};

export const HandleWarpArrowSpriteHideShow = (
  runtime: FieldPlayerAvatarRuntime,
  playerObjEvent: FieldObjectEvent
): void => {
  if (playerObjEvent.warpArrowSpriteId !== 0)
    op(runtime, `HandleWarpArrowSpriteHideShow:${playerObjEvent.warpArrowSpriteId}`);
};

export const TryUpdatePlayerSpinDirection = (runtime: FieldPlayerAvatarRuntime): boolean => {
  const lastSpinTile = runtime.gPlayerAvatar.lastSpinTile ?? 0;
  if ((runtime.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_FORCED) && runtime.metatileBehavior.isSpinTile(lastSpinTile)) {
    const playerObject = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
    if (playerObject.heldMovementFinished) {
      if (runtime.metatileBehavior.isStopSpinning(playerObject.currentMetatileBehavior))
        return false;
      if (runtime.metatileBehavior.isSpinTile(playerObject.currentMetatileBehavior))
        runtime.gPlayerAvatar.lastSpinTile = playerObject.currentMetatileBehavior;
      ObjectEventClearHeldMovement(runtime, playerObject);
      PlayerApplyTileForcedMovement(runtime, runtime.gPlayerAvatar.lastSpinTile ?? 0);
    }
    return true;
  }

  return false;
};

export const player_step = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number,
  newKeys: number,
  heldKeys: number
): void => {
  const playerObjEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];

  HandleWarpArrowSpriteHideShow(runtime, playerObjEvent);
  if (!runtime.gPlayerAvatar.preventStep && !TryUpdatePlayerSpinDirection(runtime)) {
    if (!TryInterruptObjectEventSpecialAnim(runtime, playerObjEvent, direction)) {
      npc_clear_strange_bits(runtime, playerObjEvent);
      DoPlayerAvatarTransition(runtime);
      if (!TryDoMetatileBehaviorForcedMovement(runtime)) {
        MovePlayerAvatarUsingKeypadInput(runtime, direction, newKeys, heldKeys);
        PlayerAllowForcedMovementIfMovingSameDirection(runtime);
      }
    }
  }
};

const sArrowWarpMetatileBehaviorChecks = [
  (runtime: FieldPlayerAvatarRuntime, behavior: number): boolean => runtime.metatileBehavior.isSouthArrowWarp(behavior),
  (runtime: FieldPlayerAvatarRuntime, behavior: number): boolean => runtime.metatileBehavior.isNorthArrowWarp(behavior),
  (runtime: FieldPlayerAvatarRuntime, behavior: number): boolean => runtime.metatileBehavior.isWestArrowWarp(behavior),
  (runtime: FieldPlayerAvatarRuntime, behavior: number): boolean => runtime.metatileBehavior.isEastArrowWarp(behavior)
] as const;

export const PlayCollisionSoundIfNotFacingWarp = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  let metatileBehavior = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].currentMetatileBehavior;

  if (!sArrowWarpMetatileBehaviorChecks[direction - 1](runtime, metatileBehavior)) {
    if (direction === DIR_WEST) {
      if (
        runtime.metatileBehavior.isDirectionalUpLeftStairWarp(metatileBehavior)
        || runtime.metatileBehavior.isDirectionalDownLeftStairWarp(metatileBehavior)
      )
        return;
    }
    if (direction === DIR_EAST) {
      if (
        runtime.metatileBehavior.isDirectionalUpRightStairWarp(metatileBehavior)
        || runtime.metatileBehavior.isDirectionalDownRightStairWarp(metatileBehavior)
      )
        return;
    }
    if (direction === DIR_NORTH) {
      const coords = PlayerGetDestCoords(runtime);
      MoveCoords(DIR_NORTH, coords);
      metatileBehavior = runtime.mapGridGetMetatileBehaviorAt(coords.x, coords.y);
      if (runtime.metatileBehavior.isWarpDoor(metatileBehavior))
        return;
    }
    op(runtime, `PlaySE:${SE_WALL_HIT}`);
  }
};

export const PlayerOnBikeCollide = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  PlayCollisionSoundIfNotFacingWarp(runtime, direction);
  PlayerSetAnimId(runtime, GetWalkInPlaceNormalMovementAction(direction), 2);
};

export const PlayerNotOnBikeCollide = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  PlayCollisionSoundIfNotFacingWarp(runtime, direction);
  PlayerSetAnimId(runtime, GetWalkInPlaceSlowMovementAction(direction), 2);
};

export const PlayerFaceDirection = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetFaceDirectionMovementAction(direction), 1);

export const PlayerFaceDirectionFast = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetFaceDirectionFastMovementAction(direction), 1);

export const PlayerTurnInPlace = (runtime: FieldPlayerAvatarRuntime, direction: number): void =>
  PlayerSetAnimId(runtime, GetWalkInPlaceFastMovementAction(direction), 1);

export const PlayerJumpLedge = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  op(runtime, `PlaySE:${SE_LEDGE}`);
  PlayerSetAnimId(runtime, GetJump2MovementAction(direction), 8);
};

export const PlayerShakeHeadOrWalkInPlace = (runtime: FieldPlayerAvatarRuntime): void => {
  PlayerSetAnimId(runtime, MOVEMENT_ACTION_SHAKE_HEAD_OR_WALK_IN_PLACE, 0);
};

export const IsPlayerNotUsingAcroBikeOnBumpySlope = (runtime: FieldPlayerAvatarRuntime): boolean => {
  if (TestPlayerAvatarFlags(runtime, PLAYER_AVATAR_FLAG_ACRO_BIKE)) {
    if (runtime.metatileBehavior.isBumpySlope(runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].currentMetatileBehavior))
      return false;
  }
  return true;
};

export const HandleEnforcedLookDirectionOnPlayerStopMoving = (runtime: FieldPlayerAvatarRuntime): void => {
  if (
    runtime.gPlayerAvatar.tileTransitionState === T_TILE_CENTER
    || runtime.gPlayerAvatar.tileTransitionState === T_NOT_MOVING
  ) {
    if (IsPlayerNotUsingAcroBikeOnBumpySlope(runtime))
      PlayerForceSetHeldMovement(
        runtime,
        GetFaceDirectionMovementAction(runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].facingDirection)
      );
  }
};

export const PlayerGoSpin = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  PlayerSetAnimId(runtime, GetSpinMovementAction(direction), 3);
};

export const PlayerIdleWheelie = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  PlayerSetAnimId(runtime, GetAcroWheelieFaceDirectionMovementAction(direction), 1);
};

export const PlayerStartWheelie = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  PlayerSetAnimId(runtime, GetAcroPopWheelieFaceDirectionMovementAction(direction), 1);
};

export const PlayerEndWheelie = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  PlayerSetAnimId(runtime, GetAcroEndWheelieFaceDirectionMovementAction(direction), 1);
};

export const PlayerStandingHoppingWheelie = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  op(runtime, `PlaySE:${SE_BIKE_HOP}`);
  PlayerSetAnimId(runtime, GetAcroWheelieHopFaceDirectionMovementAction(direction), 1);
};

export const PlayerMovingHoppingWheelie = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  op(runtime, `PlaySE:${SE_BIKE_HOP}`);
  PlayerSetAnimId(runtime, GetAcroWheelieHopMovementAction(direction), 2);
};

export const PlayerLedgeHoppingWheelie = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  op(runtime, `PlaySE:${SE_BIKE_HOP}`);
  PlayerSetAnimId(runtime, GetAcroWheelieJumpMovementAction(direction), 8);
};

export const PlayerAcroTurnJump = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  op(runtime, `PlaySE:${SE_BIKE_HOP}`);
  PlayerSetAnimId(runtime, GetJumpInPlaceTurnAroundMovementAction(direction), 1);
};

export const PlayerAcroWheelieCollide = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  op(runtime, `PlaySE:${SE_WALL_HIT}`);
  PlayerSetAnimId(runtime, GetAcroWheelieInPlaceMovementAction(direction), 2);
};

export const PlayerAcroPopWheelie = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  PlayerSetAnimId(runtime, GetAcroPopWheelieMoveMovementAction(direction), 2);
};

export const PlayerAcroWheelieMove = (runtime: FieldPlayerAvatarRuntime, direction: number): void => {
  PlayerSetAnimId(runtime, GetAcroWheelieMoveMovementAction(direction), 2);
};

export const PlayerAvatar_DoSecretBaseMatJump = (
  runtime: FieldPlayerAvatarRuntime,
  task: FieldTask,
  objectEvent: FieldObjectEvent
): boolean => {
  runtime.gPlayerAvatar.preventStep = true;
  if (ObjectEventClearHeldMovementIfFinished(runtime, objectEvent)) {
    op(runtime, `PlaySE:${SE_LEDGE}`);
    QL_TryRecordPlayerStepWithDuration0(runtime, objectEvent, GetJumpInPlaceMovementAction(objectEvent.facingDirection));
    task.data[1]++;
    if (task.data[1] > 1) {
      runtime.gPlayerAvatar.preventStep = false;
      runtime.gPlayerAvatar.transitionFlags |= PLAYER_AVATAR_FLAG_CONTROLLABLE;
      destroyFieldTask(task);
    }
  }
  return false;
};

export const DoPlayerAvatarSecretBaseMatJump = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): void => {
  while (PlayerAvatar_DoSecretBaseMatJump(runtime, task, runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId]))
    continue;
};

export const DoPlayerMatJump = (runtime: FieldPlayerAvatarRuntime): FieldTask => {
  const task = createFieldTask(runtime, 'DoPlayerAvatarSecretBaseMatJump');
  DoPlayerAvatarSecretBaseMatJump(runtime, task);
  return task;
};

export const PlayerAvatar_SecretBaseMatSpinStep0 = (
  runtime: FieldPlayerAvatarRuntime,
  task: FieldTask,
  objectEvent: FieldObjectEvent
): boolean => {
  task.data[0]++;
  task.data[1] = objectEvent.movementDirection;
  runtime.gPlayerAvatar.preventStep = true;
  op(runtime, 'LockPlayerFieldControls');
  op(runtime, `PlaySE:${SE_WARP_IN}`);
  return true;
};

export const PlayerAvatar_SecretBaseMatSpinStep1 = (
  runtime: FieldPlayerAvatarRuntime,
  task: FieldTask,
  objectEvent: FieldObjectEvent
): boolean => {
  const directions = [DIR_WEST, DIR_EAST, DIR_NORTH, DIR_SOUTH];

  if (ObjectEventClearHeldMovementIfFinished(runtime, objectEvent)) {
    const direction = directions[objectEvent.movementDirection - 1];

    QL_TryRecordPlayerStepWithDuration0(runtime, objectEvent, GetFaceDirectionMovementAction(direction));
    if (direction === task.data[1])
      task.data[2]++;
    task.data[0]++;
    if (task.data[2] > 3 && direction === GetOppositeDirection(task.data[1]))
      task.data[0]++;
  }
  return false;
};

export const PlayerAvatar_SecretBaseMatSpinStep2 = (
  runtime: FieldPlayerAvatarRuntime,
  task: FieldTask,
  objectEvent: FieldObjectEvent
): boolean => {
  const actions = [
    MOVEMENT_ACTION_DELAY_1,
    MOVEMENT_ACTION_DELAY_1,
    MOVEMENT_ACTION_DELAY_2,
    MOVEMENT_ACTION_DELAY_4,
    MOVEMENT_ACTION_DELAY_8
  ];

  if (ObjectEventClearHeldMovementIfFinished(runtime, objectEvent)) {
    QL_TryRecordPlayerStepWithDuration0(runtime, objectEvent, actions[task.data[2]]);
    task.data[0] = 1;
  }
  return false;
};

export const PlayerAvatar_SecretBaseMatSpinStep3 = (
  runtime: FieldPlayerAvatarRuntime,
  task: FieldTask,
  objectEvent: FieldObjectEvent
): boolean => {
  if (ObjectEventClearHeldMovementIfFinished(runtime, objectEvent)) {
    QL_TryRecordPlayerStepWithDuration0(runtime, objectEvent, GetWalkSlowerMovementAction(GetOppositeDirection(task.data[1])));
    op(runtime, 'UnlockPlayerFieldControls');
    runtime.gPlayerAvatar.preventStep = false;
    destroyFieldTask(task);
  }
  return false;
};

const sPlayerAvatarSecretBaseMatSpin = [
  PlayerAvatar_SecretBaseMatSpinStep0,
  PlayerAvatar_SecretBaseMatSpinStep1,
  PlayerAvatar_SecretBaseMatSpinStep2,
  PlayerAvatar_SecretBaseMatSpinStep3
] as const;

export const PlayerAvatar_DoSecretBaseMatSpin = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): void => {
  while (sPlayerAvatarSecretBaseMatSpin[task.data[0]](runtime, task, runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId]))
    continue;
};

export const DoPlayerMatSpin = (runtime: FieldPlayerAvatarRuntime): FieldTask => {
  const task = createFieldTask(runtime, 'PlayerAvatar_DoSecretBaseMatSpin');
  PlayerAvatar_DoSecretBaseMatSpin(runtime, task);
  return task;
};

const CreateStopSurfingTaskInternal = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number,
  changeMusic: boolean
): FieldTask => {
  op(runtime, 'LockPlayerFieldControls');
  op(runtime, 'FreezeObjectEvents');
  if (changeMusic) {
    op(runtime, 'Overworld_ClearSavedMusic');
    op(runtime, 'Overworld_ChangeMusicToDefault');
  }
  runtime.gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_SURFING;
  runtime.gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_ON_FOOT;
  runtime.gPlayerAvatar.preventStep = true;
  const task = createFieldTask(runtime, 'Task_StopSurfingInit');
  task.data[0] = direction;
  Task_StopSurfingInit(runtime, task);
  return task;
};

export const CreateStopSurfingTask = (runtime: FieldPlayerAvatarRuntime, direction: number): FieldTask =>
  CreateStopSurfingTaskInternal(runtime, direction, true);

export const CreateStopSurfingTask_NoMusicChange = (runtime: FieldPlayerAvatarRuntime, direction: number): FieldTask =>
  CreateStopSurfingTaskInternal(runtime, direction, false);

export const Task_StopSurfingInit = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): void => {
  const playerObjEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];

  if (playerObjEvent.movementOverridden) {
    if (!ObjectEventClearHeldMovementIfFinished(runtime, playerObjEvent))
      return;
  }
  op(runtime, `SetSurfBlob_BobState:${playerObjEvent.fieldEffectSpriteId}:${BOB_MON_ONLY}`);
  QL_TryRecordPlayerStepWithDuration0(runtime, playerObjEvent, GetJumpSpecialWithEffectMovementAction(task.data[0]));
  task.func = 'Task_WaitStopSurfing';
};

export const Task_WaitStopSurfing = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): void => {
  const playerObjEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];

  if (ObjectEventClearHeldMovementIfFinished(runtime, playerObjEvent)) {
    playerObjEvent.graphicsId = GetPlayerAvatarGraphicsIdByStateId(runtime, PLAYER_AVATAR_GFX_NORMAL);
    op(runtime, `ObjectEventSetGraphicsId:${playerObjEvent.graphicsId}`);
    QL_TryRecordPlayerStepWithDuration0(runtime, playerObjEvent, GetFaceDirectionMovementAction(playerObjEvent.facingDirection));
    runtime.gPlayerAvatar.preventStep = false;
    op(runtime, 'UnlockPlayerFieldControls');
    op(runtime, 'UnfreezeObjectEvents');
    runtime.gSprites[playerObjEvent.fieldEffectSpriteId].destroyed = true;
    op(runtime, `DestroySprite:${playerObjEvent.fieldEffectSpriteId}`);
    destroyFieldTask(task);
    op(runtime, 'SetHelpContextForMap');
  }
};

export const AlignFishingAnimationFrames = (runtime: FieldPlayerAvatarRuntime, sprite: FieldSprite): void => {
  op(runtime, 'AlignFishingAnimationFrames');
  sprite.x2 = 0;
  sprite.y2 = 0;
};

export const Fishing1 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  op(runtime, 'LockPlayerFieldControls');
  runtime.gPlayerAvatar.preventStep = true;
  task.data[0]++;
  return false;
};

export const Fishing2 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  const arr1 = [1, 1, 1];
  const arr2 = [1, 3, 6];
  const playerObjEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];

  task.data[12] = 0;
  task.data[13] = arr1[task.data[15]] + (runtime.random() % arr2[task.data[15]]);
  task.data[14] = playerObjEvent.graphicsId;
  ObjectEventClearHeldMovementIfActive(runtime, playerObjEvent);
  playerObjEvent.enableAnim = true;
  StartPlayerAvatarFishAnim(runtime);
  task.data[0]++;
  return false;
};

export const Fishing3 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  AlignFishingAnimationFrames(runtime, runtime.gSprites[runtime.gPlayerAvatar.spriteId]);

  task.data[1]++;
  if (task.data[1] >= 60)
    task.data[0]++;
  return false;
};

export const Fishing4 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  op(runtime, 'LoadMessageBoxAndFrameGfx:0:true');
  task.data[0]++;
  task.data[1] = 0;
  task.data[2] = 0;
  const randVal = runtime.random() % 10;
  task.data[3] = randVal + 1;
  if (task.data[12] === 0)
    task.data[3] = randVal + 4;
  if (task.data[3] >= 10)
    task.data[3] = 10;
  return true;
};

export const Fishing5 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  AlignFishingAnimationFrames(runtime, runtime.gSprites[runtime.gPlayerAvatar.spriteId]);
  task.data[1]++;
  if (task.data[1] >= 20) {
    task.data[1] = 0;
    if (task.data[2] >= task.data[3]) {
      task.data[0]++;
      if (task.data[12] !== 0)
        task.data[0]++;
      task.data[12]++;
    } else {
      op(runtime, `AddTextPrinterParameterized:0:FONT_NORMAL:dot:${task.data[2] * 12}:1:0`);
      task.data[2]++;
    }
  }
  return false;
};

const sFishingNoCatchDirectionAnimNums = [
  ANIM_PUT_AWAY_ROD_SOUTH,
  ANIM_PUT_AWAY_ROD_SOUTH,
  ANIM_PUT_AWAY_ROD_NORTH,
  ANIM_PUT_AWAY_ROD_WEST,
  ANIM_PUT_AWAY_ROD_EAST
] as const;

const sFishingBiteDirectionAnimNums = [
  ANIM_HOOKED_POKEMON_SOUTH,
  ANIM_HOOKED_POKEMON_SOUTH,
  ANIM_HOOKED_POKEMON_NORTH,
  ANIM_HOOKED_POKEMON_WEST,
  ANIM_HOOKED_POKEMON_EAST
] as const;

export const GetFishingNoCatchDirectionAnimNum = (direction: number): number =>
  dirnToAnim(sFishingNoCatchDirectionAnimNums, direction);

export const GetFishingBiteDirectionAnimNum = (direction: number): number =>
  dirnToAnim(sFishingBiteDirectionAnimNums, direction);

const StartSpriteAnim = (runtime: FieldPlayerAvatarRuntime, sprite: FieldSprite, animNum: number): void => {
  sprite.animNum = animNum;
  sprite.animEnded = false;
  op(runtime, `StartSpriteAnim:${animNum}`);
};

const ObjectEventSetGraphicsId = (runtime: FieldPlayerAvatarRuntime, object: FieldObjectEvent, graphicsId: number): void => {
  object.graphicsId = graphicsId;
  op(runtime, `ObjectEventSetGraphicsId:${graphicsId}`);
};

const ObjectEventTurn = (runtime: FieldPlayerAvatarRuntime, object: FieldObjectEvent, direction: number): void => {
  object.facingDirection = direction;
  op(runtime, `ObjectEventTurn:${direction}`);
};

const SetSurfBlob_PlayerOffset = (runtime: FieldPlayerAvatarRuntime, spriteId: number, x: number, y: number): void => {
  runtime.gSprites[spriteId].x2 = x;
  runtime.gSprites[spriteId].y2 = y;
  op(runtime, `SetSurfBlob_PlayerOffset:${spriteId}:${x}:${y}`);
};

const RunTextPrinters = (runtime: FieldPlayerAvatarRuntime): void => {
  op(runtime, 'RunTextPrinters');
};

const IsTextPrinterActive = (runtime: FieldPlayerAvatarRuntime, windowId: number): boolean => {
  op(runtime, `IsTextPrinterActive:${windowId}`);
  return runtime.textPrinterActive;
};

const restoreFishingPlayerGraphics = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): void => {
  const playerObjEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  ObjectEventSetGraphicsId(runtime, playerObjEvent, task.data[14]);
  ObjectEventTurn(runtime, playerObjEvent, playerObjEvent.movementDirection);
  if (runtime.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_SURFING)
    SetSurfBlob_PlayerOffset(runtime, playerObjEvent.fieldEffectSpriteId, 0, 0);
  runtime.gSprites[runtime.gPlayerAvatar.spriteId].x2 = 0;
  runtime.gSprites[runtime.gPlayerAvatar.spriteId].y2 = 0;
};

export const Fishing6 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  AlignFishingAnimationFrames(runtime, runtime.gSprites[runtime.gPlayerAvatar.spriteId]);
  task.data[0]++;

  if (!runtime.doesCurrentMapHaveFishingMons || (runtime.random() & 1)) {
    task.data[0] = FISHING_NO_BITE;
  } else {
    StartSpriteAnim(
      runtime,
      runtime.gSprites[runtime.gPlayerAvatar.spriteId],
      GetFishingBiteDirectionAnimNum(GetPlayerFacingDirection(runtime))
    );
  }
  return true;
};

export const Fishing7 = (_runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  task.data[0] += 3;
  return false;
};

export const Fishing8 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  const reelTimeouts = [36, 33, 30];

  AlignFishingAnimationFrames(runtime, runtime.gSprites[runtime.gPlayerAvatar.spriteId]);
  task.data[1]++;
  if (task.data[1] >= reelTimeouts[task.data[15]])
    task.data[0] = FISHING_GOT_AWAY;
  else if (runtime.newKeys & A_BUTTON)
    task.data[0]++;
  return false;
};

export const Fishing9 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  const arr = [
    [0, 0],
    [40, 10],
    [70, 30]
  ];

  AlignFishingAnimationFrames(runtime, runtime.gSprites[runtime.gPlayerAvatar.spriteId]);
  task.data[0]++;
  if (task.data[12] < task.data[13]) {
    task.data[0] = FISHING_START_ROUND;
  } else if (task.data[12] < 2) {
    const probability = runtime.random() % 100;
    if (arr[task.data[15]][task.data[12]] > probability)
      task.data[0] = FISHING_START_ROUND;
  }
  return false;
};

export const Fishing10 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  AlignFishingAnimationFrames(runtime, runtime.gSprites[runtime.gPlayerAvatar.spriteId]);
  op(runtime, 'FillWindowPixelBuffer:0:1');
  op(runtime, 'AddTextPrinterParameterized2:0:FONT_NORMAL:gText_PokemonOnHook:1:0:DARK_GRAY:WHITE:LIGHT_GRAY');
  task.data[0]++;
  task.data[1] = 0;
  return false;
};

export const Fishing11 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  if (task.data[1] === 0)
    AlignFishingAnimationFrames(runtime, runtime.gSprites[runtime.gPlayerAvatar.spriteId]);

  RunTextPrinters(runtime);

  if (task.data[1] === 0) {
    if (!IsTextPrinterActive(runtime, 0)) {
      restoreFishingPlayerGraphics(runtime, task);
      op(runtime, 'ClearDialogWindowAndFrame:0:true');
      task.data[1]++;
      return false;
    }
  }

  if (task.data[1] !== 0) {
    runtime.gPlayerAvatar.preventStep = false;
    op(runtime, 'UnlockPlayerFieldControls');
    runtime.fishingWildEncounterRod = task.data[15];
    op(runtime, `FishingWildEncounter:${task.data[15]}`);
    destroyFieldTask(task);
  }
  return false;
};

export const Fishing12 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  AlignFishingAnimationFrames(runtime, runtime.gSprites[runtime.gPlayerAvatar.spriteId]);
  StartSpriteAnim(
    runtime,
    runtime.gSprites[runtime.gPlayerAvatar.spriteId],
    GetFishingNoCatchDirectionAnimNum(GetPlayerFacingDirection(runtime))
  );
  op(runtime, 'FillWindowPixelBuffer:0:1');
  op(runtime, 'AddTextPrinterParameterized2:0:FONT_NORMAL:gText_NotEvenANibble:1:null:DARK_GRAY:WHITE:LIGHT_GRAY');
  task.data[0] = FISHING_SHOW_RESULT;
  return true;
};

export const Fishing13 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  AlignFishingAnimationFrames(runtime, runtime.gSprites[runtime.gPlayerAvatar.spriteId]);
  StartSpriteAnim(
    runtime,
    runtime.gSprites[runtime.gPlayerAvatar.spriteId],
    GetFishingNoCatchDirectionAnimNum(GetPlayerFacingDirection(runtime))
  );
  op(runtime, 'AddTextPrinterParameterized2:0:FONT_NORMAL:gText_ItGotAway:1:null:DARK_GRAY:WHITE:LIGHT_GRAY');
  task.data[0]++;
  return true;
};

export const Fishing14 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  AlignFishingAnimationFrames(runtime, runtime.gSprites[runtime.gPlayerAvatar.spriteId]);
  task.data[0]++;
  return false;
};

export const Fishing15 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  const playerSprite = runtime.gSprites[runtime.gPlayerAvatar.spriteId];
  AlignFishingAnimationFrames(runtime, playerSprite);
  if (playerSprite.animEnded) {
    restoreFishingPlayerGraphics(runtime, task);
    task.data[0]++;
  }
  return false;
};

export const Fishing16 = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): boolean => {
  RunTextPrinters(runtime);
  if (!IsTextPrinterActive(runtime, 0)) {
    runtime.gPlayerAvatar.preventStep = false;
    op(runtime, 'UnlockPlayerFieldControls');
    op(runtime, 'UnfreezeObjectEvents');
    op(runtime, 'ClearDialogWindowAndFrame:0:true');
    destroyFieldTask(task);
  }
  return false;
};

const sFishingStateFuncs = [
  Fishing1,
  Fishing2,
  Fishing3,
  Fishing4,
  Fishing5,
  Fishing6,
  Fishing7,
  Fishing8,
  Fishing9,
  Fishing10,
  Fishing11,
  Fishing12,
  Fishing13,
  Fishing14,
  Fishing15,
  Fishing16
] as const;

export const Task_Fishing = (runtime: FieldPlayerAvatarRuntime, task: FieldTask): void => {
  while (task.data[0] < sFishingStateFuncs.length && sFishingStateFuncs[task.data[0]](runtime, task))
    continue;
};

export const StartFishing = (runtime: FieldPlayerAvatarRuntime, rod: number): FieldTask => {
  const task = createFieldTask(runtime, 'Task_Fishing');

  task.data[15] = rod;
  Task_Fishing(runtime, task);
  op(runtime, `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_FISH}`);
  if (runtime.questLogFishActionSuccessful)
    op(runtime, 'QL_AfterRecordFishActionSuccessful');
  return task;
};

export const ForcedMovement_None = (runtime: FieldPlayerAvatarRuntime): boolean => {
  if (runtime.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_FORCED) {
    const playerObjEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];

    playerObjEvent.facingDirectionLocked = false;
    playerObjEvent.enableAnim = true;
    SetObjectEventDirection(runtime, playerObjEvent, playerObjEvent.facingDirection);
    runtime.gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_FORCED;
  }
  return false;
};

export const DoForcedMovement = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number,
  movementAction: (runtime: FieldPlayerAvatarRuntime, direction: number) => void
): number => {
  const collision = CheckForPlayerAvatarCollision(runtime, direction);
  runtime.gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_FORCED;
  if (collision) {
    ForcedMovement_None(runtime);
    if (collision < COLLISION_STOP_SURFING) {
      return 0;
    }

    if (collision === COLLISION_LEDGE_JUMP)
      PlayerJumpLedge(runtime, direction);
    runtime.gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_FORCED;
    runtime.gPlayerAvatar.runningState = MOVING;
    return 1;
  }

  runtime.gPlayerAvatar.runningState = MOVING;
  movementAction(runtime, direction);
  return 1;
};

export const DoForcedMovementInCurrentDirection = (
  runtime: FieldPlayerAvatarRuntime,
  movementAction: (runtime: FieldPlayerAvatarRuntime, direction: number) => void
): number => {
  const playerObjEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  playerObjEvent.disableAnim = true;
  return DoForcedMovement(runtime, playerObjEvent.movementDirection, movementAction);
};

export const ForcedMovement_Slip = (runtime: FieldPlayerAvatarRuntime): boolean =>
  DoForcedMovementInCurrentDirection(runtime, PlayerWalkFast) !== 0;

export const ForcedMovement_WalkSouth = (runtime: FieldPlayerAvatarRuntime): boolean =>
  DoForcedMovement(runtime, DIR_SOUTH, PlayerWalkNormal) !== 0;

export const ForcedMovement_WalkNorth = (runtime: FieldPlayerAvatarRuntime): boolean =>
  DoForcedMovement(runtime, DIR_NORTH, PlayerWalkNormal) !== 0;

export const ForcedMovement_WalkWest = (runtime: FieldPlayerAvatarRuntime): boolean =>
  DoForcedMovement(runtime, DIR_WEST, PlayerWalkNormal) !== 0;

export const ForcedMovement_WalkEast = (runtime: FieldPlayerAvatarRuntime): boolean =>
  DoForcedMovement(runtime, DIR_EAST, PlayerWalkNormal) !== 0;

export const PlaySpinSound = (runtime: FieldPlayerAvatarRuntime): void => {
  op(runtime, `PlaySE:${SE_M_RAZOR_WIND2}`);
};

export const ForcedMovement_SpinRight = (runtime: FieldPlayerAvatarRuntime): boolean => {
  PlaySpinSound(runtime);
  return DoForcedMovement(runtime, DIR_EAST, PlayerGoSpin) !== 0;
};

export const ForcedMovement_SpinLeft = (runtime: FieldPlayerAvatarRuntime): boolean => {
  PlaySpinSound(runtime);
  return DoForcedMovement(runtime, DIR_WEST, PlayerGoSpin) !== 0;
};

export const ForcedMovement_SpinUp = (runtime: FieldPlayerAvatarRuntime): boolean => {
  PlaySpinSound(runtime);
  return DoForcedMovement(runtime, DIR_NORTH, PlayerGoSpin) !== 0;
};

export const ForcedMovement_SpinDown = (runtime: FieldPlayerAvatarRuntime): boolean => {
  PlaySpinSound(runtime);
  return DoForcedMovement(runtime, DIR_SOUTH, PlayerGoSpin) !== 0;
};

export const ForcedMovement_PushedSouthByCurrent = (runtime: FieldPlayerAvatarRuntime): boolean =>
  DoForcedMovement(runtime, DIR_SOUTH, PlayerRideWaterCurrent) !== 0;

export const ForcedMovement_PushedNorthByCurrent = (runtime: FieldPlayerAvatarRuntime): boolean =>
  DoForcedMovement(runtime, DIR_NORTH, PlayerRideWaterCurrent) !== 0;

export const ForcedMovement_PushedWestByCurrent = (runtime: FieldPlayerAvatarRuntime): boolean =>
  DoForcedMovement(runtime, DIR_WEST, PlayerRideWaterCurrent) !== 0;

export const ForcedMovement_PushedEastByCurrent = (runtime: FieldPlayerAvatarRuntime): boolean =>
  DoForcedMovement(runtime, DIR_EAST, PlayerRideWaterCurrent) !== 0;

export const ForcedMovement_Slide = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number,
  movementAction: (runtime: FieldPlayerAvatarRuntime, direction: number) => void
): number => {
  const playerObjEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  playerObjEvent.disableAnim = true;
  playerObjEvent.facingDirectionLocked = true;
  return DoForcedMovement(runtime, direction, movementAction);
};

export const ForcedMovement_SlideSouth = (runtime: FieldPlayerAvatarRuntime): boolean =>
  ForcedMovement_Slide(runtime, DIR_SOUTH, PlayerWalkFast) !== 0;

export const ForcedMovement_SlideNorth = (runtime: FieldPlayerAvatarRuntime): boolean =>
  ForcedMovement_Slide(runtime, DIR_NORTH, PlayerWalkFast) !== 0;

export const ForcedMovement_SlideWest = (runtime: FieldPlayerAvatarRuntime): boolean =>
  ForcedMovement_Slide(runtime, DIR_WEST, PlayerWalkFast) !== 0;

export const ForcedMovement_SlideEast = (runtime: FieldPlayerAvatarRuntime): boolean =>
  ForcedMovement_Slide(runtime, DIR_EAST, PlayerWalkFast) !== 0;

export const ForcedMovement_MatJump = (runtime: FieldPlayerAvatarRuntime): boolean => {
  DoPlayerMatJump(runtime);
  return true;
};

export const ForcedMovement_MatSpin = (runtime: FieldPlayerAvatarRuntime): boolean => {
  DoPlayerMatSpin(runtime);
  return true;
};

const sForcedMovementFuncs: Array<{
  check: ((runtime: FieldPlayerAvatarRuntime, behavior: number) => boolean) | null;
  apply: (runtime: FieldPlayerAvatarRuntime) => boolean;
}> = [
  { check: (runtime, behavior) => runtime.metatileBehavior.isTrickHouseSlipperyFloor(behavior), apply: ForcedMovement_Slip },
  { check: (runtime, behavior) => runtime.metatileBehavior.isIce2(behavior), apply: ForcedMovement_Slip },
  { check: (runtime, behavior) => runtime.metatileBehavior.isWalkSouth(behavior), apply: ForcedMovement_WalkSouth },
  { check: (runtime, behavior) => runtime.metatileBehavior.isWalkNorth(behavior), apply: ForcedMovement_WalkNorth },
  { check: (runtime, behavior) => runtime.metatileBehavior.isWalkWest(behavior), apply: ForcedMovement_WalkWest },
  { check: (runtime, behavior) => runtime.metatileBehavior.isWalkEast(behavior), apply: ForcedMovement_WalkEast },
  { check: (runtime, behavior) => runtime.metatileBehavior.isSouthwardCurrent(behavior), apply: ForcedMovement_PushedSouthByCurrent },
  { check: (runtime, behavior) => runtime.metatileBehavior.isNorthwardCurrent(behavior), apply: ForcedMovement_PushedNorthByCurrent },
  { check: (runtime, behavior) => runtime.metatileBehavior.isWestwardCurrent(behavior), apply: ForcedMovement_PushedWestByCurrent },
  { check: (runtime, behavior) => runtime.metatileBehavior.isEastwardCurrent(behavior), apply: ForcedMovement_PushedEastByCurrent },
  { check: (runtime, behavior) => runtime.metatileBehavior.isSpinRight(behavior), apply: ForcedMovement_SpinRight },
  { check: (runtime, behavior) => runtime.metatileBehavior.isSpinLeft(behavior), apply: ForcedMovement_SpinLeft },
  { check: (runtime, behavior) => runtime.metatileBehavior.isSpinUp(behavior), apply: ForcedMovement_SpinUp },
  { check: (runtime, behavior) => runtime.metatileBehavior.isSpinDown(behavior), apply: ForcedMovement_SpinDown },
  { check: (runtime, behavior) => runtime.metatileBehavior.isSlideSouth(behavior), apply: ForcedMovement_SlideSouth },
  { check: (runtime, behavior) => runtime.metatileBehavior.isSlideNorth(behavior), apply: ForcedMovement_SlideNorth },
  { check: (runtime, behavior) => runtime.metatileBehavior.isSlideWest(behavior), apply: ForcedMovement_SlideWest },
  { check: (runtime, behavior) => runtime.metatileBehavior.isSlideEast(behavior), apply: ForcedMovement_SlideEast },
  { check: (runtime, behavior) => runtime.metatileBehavior.isWaterfall(behavior), apply: ForcedMovement_PushedSouthByCurrent },
  { check: (runtime, behavior) => runtime.metatileBehavior.isSecretBaseJumpMat(behavior), apply: ForcedMovement_MatJump },
  { check: (runtime, behavior) => runtime.metatileBehavior.isSecretBaseSpinMat(behavior), apply: ForcedMovement_MatSpin },
  { check: null, apply: ForcedMovement_None }
];

export const TryDoMetatileBehaviorForcedMovement = (runtime: FieldPlayerAvatarRuntime): boolean => {
  if (!(runtime.gPlayerAvatar.flags & PLAYER_AVATAR_FLAG_CONTROLLABLE)) {
    const behavior = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].currentMetatileBehavior;
    for (let i = 0; sForcedMovementFuncs[i].check !== null; i += 1) {
      if (sForcedMovementFuncs[i].check!(runtime, behavior)) {
        runtime.gPlayerAvatar.lastSpinTile = behavior;
        return sForcedMovementFuncs[i].apply(runtime);
      }
    }
  }

  return sForcedMovementFuncs[sForcedMovementFuncs.length - 1].apply(runtime);
};

export const CancelPlayerForcedMovement = (runtime: FieldPlayerAvatarRuntime): void => {
  ForcedMovement_None(runtime);
};

export const StopPlayerAvatar = (runtime: FieldPlayerAvatarRuntime): void => {
  const playerObjEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];

  playerObjEvent.inanimate = false;
  playerObjEvent.disableAnim = false;
  playerObjEvent.facingDirectionLocked = false;
  runtime.gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_DASH;
  SetObjectEventDirection(runtime, playerObjEvent, playerObjEvent.facingDirection);
  if (TestPlayerAvatarFlags(runtime, PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)) {
    op(runtime, 'Bike_HandleBumpySlopeJump');
    op(runtime, 'Bike_UpdateBikeCounterSpeed:0');
  }
};

export const ClearPlayerAvatarInfo = (runtime: FieldPlayerAvatarRuntime): void => {
  runtime.gPlayerAvatar = createFieldPlayerAvatar();
};

export const SetPlayerAvatarStateMask = (runtime: FieldPlayerAvatarRuntime, flags: number): void => {
  runtime.gPlayerAvatar.flags &=
    PLAYER_AVATAR_FLAG_DASH | PLAYER_AVATAR_FLAG_FORCED | PLAYER_AVATAR_FLAG_CONTROLLABLE;
  runtime.gPlayerAvatar.flags |= flags;
};

export const GetRivalAvatarGraphicsIdByStateIdAndGender = (state: number, gender: number): number =>
  GetPlayerAvatarGraphicsIdByStateIdAndGender(state, gender);

export const GetPlayerAvatarGraphicsIdByStateIdAndGender = (state: number, gender: number): number =>
  sPlayerAvatarGfxIds[state]?.[gender] ?? 0;

export const GetRSAvatarGraphicsIdByGender = (gender: number): number => sHoennLinkPartnerGfxIds[gender] ?? 0;

export const GetPlayerAvatarGraphicsIdByStateId = (
  runtime: FieldPlayerAvatarRuntime,
  state: number
): number => GetPlayerAvatarGraphicsIdByStateIdAndGender(state, runtime.gPlayerAvatar.gender);

export const GetPlayerAvatarGenderByGraphicsId = (gfxId: number): number => {
  switch (gfxId) {
    case OBJ_EVENT_GFX_GREEN_NORMAL:
    case OBJ_EVENT_GFX_GREEN_BIKE:
    case OBJ_EVENT_GFX_GREEN_SURF:
    case OBJ_EVENT_GFX_GREEN_FIELD_MOVE:
    case OBJ_EVENT_GFX_GREEN_FISH:
      return FEMALE;
    default:
      return MALE;
  }
};

export const GetPlayerAvatarStateTransitionByGraphicsId = (graphicsId: number, gender: number): number => {
  for (let i = 0; i < sPlayerAvatarGfxToStateFlag[gender].length; i += 1) {
    if (sPlayerAvatarGfxToStateFlag[gender][i][0] === graphicsId) {
      return sPlayerAvatarGfxToStateFlag[gender][i][1];
    }
  }
  return 1;
};

export const GetPlayerAvatarGraphicsIdByCurrentState = (runtime: FieldPlayerAvatarRuntime): number => {
  const flags = runtime.gPlayerAvatar.flags;
  const table = sPlayerAvatarGfxToStateFlag[runtime.gPlayerAvatar.gender];

  for (let i = 0; i < table.length; i += 1) {
    if (table[i][1] & flags) {
      return table[i][0];
    }
  }
  return 0;
};

export const SetPlayerAvatarExtraStateTransition = (
  runtime: FieldPlayerAvatarRuntime,
  graphicsId: number,
  extras: number
): void => {
  const unk = GetPlayerAvatarStateTransitionByGraphicsId(graphicsId, runtime.gPlayerAvatar.gender);
  runtime.gPlayerAvatar.transitionFlags |= unk | extras;
  DoPlayerAvatarTransition(runtime);
};

export const PartyHasMonWithSurf = (runtime: FieldPlayerAvatarRuntime): boolean => {
  if (!TestPlayerAvatarFlags(runtime, PLAYER_AVATAR_FLAG_SURFING)) {
    for (let i = 0; i < PARTY_SIZE; i += 1) {
      const mon = runtime.gPlayerParty[i];
      if (!mon || mon.species === SPECIES_NONE) {
        break;
      }
      if (mon.moves.includes(MOVE_SURF)) {
        return true;
      }
    }
  }
  return false;
};

export const IsPlayerSurfingNorth = (runtime: FieldPlayerAvatarRuntime): boolean => {
  if (GetPlayerMovementDirection(runtime) === DIR_NORTH && TestPlayerAvatarFlags(runtime, PLAYER_AVATAR_FLAG_SURFING)) {
    return true;
  }
  return false;
};

export const MetatileAtCoordsIsWaterTile = (
  runtime: FieldPlayerAvatarRuntime,
  x: number,
  y: number
): boolean => runtime.metatileAtCoordsIsWaterTile(x, y);

export const IsPlayerFacingSurfableFishableWater = (runtime: FieldPlayerAvatarRuntime): boolean => {
  const playerObjEvent = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  const coords = { x: playerObjEvent.currentCoords.x, y: playerObjEvent.currentCoords.y };

  MoveCoords(playerObjEvent.facingDirection, coords);
  if (
    runtime.getCollisionAtCoords(playerObjEvent, coords.x, coords.y, playerObjEvent.facingDirection) === COLLISION_ELEVATION_MISMATCH
    && PlayerGetElevation(runtime) === 3
    && MetatileAtCoordsIsWaterTile(runtime, coords.x, coords.y)
  ) {
    return true;
  }
  return false;
};

export const SetPlayerAvatarTransitionFlags = (runtime: FieldPlayerAvatarRuntime, flags: number): void => {
  runtime.gPlayerAvatar.transitionFlags |= flags;
  DoPlayerAvatarTransition(runtime);
};

export const DoPlayerAvatarTransition = (runtime: FieldPlayerAvatarRuntime): void => {
  let flags = runtime.gPlayerAvatar.transitionFlags;
  if (flags !== 0) {
    for (let i = 0; i < 8; i += 1, flags >>= 1) {
      if (flags & 1) {
        switch (i) {
          case PLAYER_AVATAR_STATE_NORMAL:
            PlayerAvatarTransition_Normal(runtime);
            break;
          case PLAYER_AVATAR_STATE_MACH_BIKE:
          case PLAYER_AVATAR_STATE_ACRO_BIKE:
            PlayerAvatarTransition_Bike(runtime);
            break;
          case PLAYER_AVATAR_STATE_SURFING:
            PlayerAvatarTransition_Surfing(runtime);
            break;
          case PLAYER_AVATAR_STATE_UNDERWATER:
            PlayerAvatarTransition_Underwater(runtime);
            break;
          case PLAYER_AVATAR_STATE_FORCED:
          case PLAYER_AVATAR_STATE_DASH:
            PlayerAvatarTransition_Dummy(runtime);
            break;
          case PLAYER_AVATAR_STATE_CONTROLLABLE:
            PlayerAvatarTransition_ReturnToField(runtime);
            break;
        }
      }
    }
    runtime.gPlayerAvatar.transitionFlags = 0;
  }
};

export const UpdatePlayerAvatarTransitionState = (runtime: FieldPlayerAvatarRuntime): void => {
  runtime.gPlayerAvatar.tileTransitionState = T_NOT_MOVING;
  if (PlayerIsAnimActive(runtime)) {
    if (!PlayerCheckIfAnimFinishedOrInactive(runtime)) {
      if (!PlayerAnimIsMultiFrameStationary(runtime))
        runtime.gPlayerAvatar.tileTransitionState = T_TILE_TRANSITION;
    } else {
      if (!PlayerAnimIsMultiFrameStationaryAndStateNotTurning(runtime))
        runtime.gPlayerAvatar.tileTransitionState = T_TILE_CENTER;
    }
  }
};

export const PlayerAvatarTransition_Dummy = (_runtime: FieldPlayerAvatarRuntime): void => {
};

export const PlayerAvatarTransition_Normal = (runtime: FieldPlayerAvatarRuntime): void => {
  op(runtime, `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_NORMAL}`);
  op(runtime, `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_NORMAL}`);
};

export const PlayerAvatarTransition_Bike = (runtime: FieldPlayerAvatarRuntime): void => {
  op(runtime, `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_BIKE}`);
  op(runtime, `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_BIKE}`);
  op(runtime, 'BikeClearState:0:0');
};

export const PlayerAvatarTransition_Surfing = (runtime: FieldPlayerAvatarRuntime): void => {
  op(runtime, `QuestLogTryRecordPlayerAvatarGfxTransition:${QL_PLAYER_GFX_SURF}`);
  op(runtime, `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_SURF}`);
};

export const PlayerAvatarTransition_Underwater = (_runtime: FieldPlayerAvatarRuntime): void => {
};

export const PlayerAvatarTransition_ReturnToField = (runtime: FieldPlayerAvatarRuntime): void => {
  runtime.gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_CONTROLLABLE;
};

export const InitPlayerAvatar = (
  runtime: FieldPlayerAvatarRuntime,
  x: number,
  y: number,
  direction: number,
  gender: number
): void => {
  const objectEventId = runtime.gObjectEvents.length;
  const spriteId = runtime.gSprites.length;
  runtime.gSprites.push({ data: [objectEventId, 0, 0], animNum: 0, invisible: false, x2: 0, y2: 0 });
  runtime.gObjectEvents.push(createFieldObjectEvent({
    currentCoords: { x: x - 7, y: y - 7 },
    facingDirection: direction,
    movementDirection: direction,
    graphicsId: GetPlayerAvatarGraphicsIdByStateIdAndGender(PLAYER_AVATAR_GFX_NORMAL, gender),
    isPlayer: true,
    warpArrowSpriteId: 1,
    spriteId
  }));
  ClearPlayerAvatarInfo(runtime);
  runtime.gPlayerAvatar.runningState = NOT_MOVING;
  runtime.gPlayerAvatar.tileTransitionState = T_NOT_MOVING;
  runtime.gPlayerAvatar.objectEventId = objectEventId;
  runtime.gPlayerAvatar.spriteId = spriteId;
  runtime.gPlayerAvatar.gender = gender;
  SetPlayerAvatarStateMask(runtime, PLAYER_AVATAR_FLAG_CONTROLLABLE | PLAYER_AVATAR_FLAG_ON_FOOT);
};

export const SetPlayerInvisibility = (runtime: FieldPlayerAvatarRuntime, invisible: boolean): void => {
  const object = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  object.invisible = invisible;
  if (TestPlayerAvatarFlags(runtime, PLAYER_AVATAR_FLAG_SURFING)) {
    runtime.gSprites[object.fieldEffectSpriteId].invisible = invisible;
  }
};

export const StartPlayerAvatarSummonMonForFieldMoveAnim = (runtime: FieldPlayerAvatarRuntime): void => {
  const object = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  object.graphicsId = GetPlayerAvatarGraphicsIdByStateId(runtime, PLAYER_AVATAR_GFX_FIELD_MOVE);
  runtime.gSprites[runtime.gPlayerAvatar.spriteId].animNum = ANIM_FIELD_MOVE;
};

export const GetPlayerAvatarVsSeekerGfxId = (runtime: FieldPlayerAvatarRuntime): number => {
  if (runtime.gPlayerAvatar.flags & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)) {
    return sPlayerAvatarVsSeekerBikeGfxIds[runtime.gPlayerAvatar.gender];
  }
  return GetPlayerAvatarGraphicsIdByStateId(runtime, PLAYER_AVATAR_GFX_VSSEEKER);
};

export const StartPlayerAvatarVsSeekerAnim = (runtime: FieldPlayerAvatarRuntime): void => {
  const object = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  object.graphicsId = GetPlayerAvatarVsSeekerGfxId(runtime);
  runtime.gSprites[runtime.gPlayerAvatar.spriteId].animNum = ANIM_VS_SEEKER;
};

export const StartPlayerAvatarFishAnim = (runtime: FieldPlayerAvatarRuntime): void => {
  op(runtime, `QuestLogCallUpdatePlayerSprite:${QL_PLAYER_GFX_FISH}`);
};

export const PlayerUseAcroBikeOnBumpySlope = (_runtime: FieldPlayerAvatarRuntime, _direction: number): void => {
};

export const SetPlayerAvatarWatering = (_runtime: FieldPlayerAvatarRuntime): void => {
};

export const SeafoamIslandsB4F_CurrentDumpsPlayerOnLand = (runtime: FieldPlayerAvatarRuntime): void => {
  if (
    runtime.questLogPlaybackState === QL_PLAYBACK_STATE_RUNNING
    || runtime.questLogPlaybackState === QL_PLAYBACK_STATE_ACTION_END
  ) {
    return;
  }

  op(runtime, `QuestLogRecordPlayerAvatarGfxTransitionWithDuration:SURF_DISMOUNT_NORTH:16`);
  CreateStopSurfingTask(runtime, DIR_NORTH);
};

const sTeleportFacingDirectionSequence = [
  DIR_SOUTH,
  DIR_WEST,
  DIR_EAST,
  DIR_NORTH,
  DIR_SOUTH
] as const;

const spriteY = (sprite: FieldSprite): number => sprite.y ?? 0;

export const SavePlayerFacingDirectionForTeleport = (
  runtime: FieldPlayerAvatarRuntime,
  direction: number
): void => {
  runtime.teleportSavedFacingDirection = direction;
};

export const GetTeleportSavedFacingDirection = (runtime: FieldPlayerAvatarRuntime): number =>
  runtime.teleportSavedFacingDirection === DIR_NONE ? DIR_SOUTH : runtime.teleportSavedFacingDirection;

export const ObjectEventForceSetHeldMovement = (
  runtime: FieldPlayerAvatarRuntime,
  objectEvent: FieldObjectEvent,
  movementActionId: number
): void => {
  objectEvent.heldMovementActive = false;
  ObjectEventSetHeldMovement(runtime, objectEvent, movementActionId);
};

export const TeleportAnim_RotatePlayer = (
  runtime: FieldPlayerAvatarRuntime,
  object: FieldObjectEvent,
  task: FieldTask
): number => {
  if (task.data[1] < 8 && ++task.data[1] < 8)
    return object.facingDirection;

  if (!ObjectEventCheckHeldMovementStatus(object))
    return object.facingDirection;

  const direction = sTeleportFacingDirectionSequence[object.facingDirection] ?? DIR_SOUTH;
  ObjectEventForceSetHeldMovement(runtime, object, GetFaceDirectionMovementAction(direction));
  task.data[1] = 0;
  object.facingDirection = direction;
  object.movementDirection = direction;
  return direction;
};

export const Task_TeleportWarpOutPlayerAnim = (
  runtime: FieldPlayerAvatarRuntime,
  task: FieldTask
): void => {
  const object = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  const sprite = runtime.gSprites[object.spriteId];

  switch (task.data[0]) {
    case 0:
      if (!ObjectEventClearHeldMovementIfFinished(runtime, object))
        return;

      SavePlayerFacingDirectionForTeleport(runtime, object.facingDirection);
      task.data[1] = 0;
      task.data[2] = 1;
      task.data[3] = (spriteY(sprite) + sprite.y2) * 16;
      sprite.y2 = 0;
      op(runtime, 'CameraObjectReset2');
      object.fixedPriority = true;
      sprite.oamPriority = 0;
      sprite.subpriority = 0;
      sprite.subspriteMode = 0;
      task.data[0]++;
      // fall through
    case 1:
      TeleportAnim_RotatePlayer(runtime, object, task);
      task.data[3] -= task.data[2];
      task.data[2] += 3;
      sprite.y = task.data[3] >> 4;
      if ((sprite.y ?? 0) + runtime.totalCameraPixelOffsetY < -32)
        task.data[0]++;
      break;
    case 2:
      destroyFieldTask(task);
      break;
  }
};

export const StartTeleportWarpOutPlayerAnim = (runtime: FieldPlayerAvatarRuntime): FieldTask => {
  const task = createFieldTask(runtime, 'Task_TeleportWarpOutPlayerAnim');
  Task_TeleportWarpOutPlayerAnim(runtime, task);
  return task;
};

export const WaitTeleportWarpOutPlayerAnim = (runtime: FieldPlayerAvatarRuntime): boolean =>
  runtime.gTasks.some((task) => task.func === 'Task_TeleportWarpOutPlayerAnim' && !task.destroyed);

export const Task_TeleportWarpInPlayerAnim = (
  runtime: FieldPlayerAvatarRuntime,
  task: FieldTask
): void => {
  const object = runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId];
  const sprite = runtime.gSprites[object.spriteId];

  switch (task.data[0]) {
    case 0:
      task.data[5] = GetTeleportSavedFacingDirection(runtime);
      ObjectEventForceSetHeldMovement(
        runtime,
        object,
        GetFaceDirectionMovementAction(sTeleportFacingDirectionSequence[task.data[5]] ?? DIR_SOUTH)
      );
      task.data[1] = 0;
      task.data[2] = 116;
      task.data[4] = spriteY(sprite);
      task.data[6] = sprite.oamPriority ?? 0;
      task.data[7] = sprite.subpriority ?? 0;
      task.data[3] = -((sprite.y2 + 32) * 16);
      sprite.y2 = 0;
      op(runtime, 'CameraObjectReset2');
      object.fixedPriority = true;
      sprite.oamPriority = 1;
      sprite.subpriority = 0;
      sprite.subspriteMode = 0;
      task.data[0]++;
      // fall through
    case 1:
      TeleportAnim_RotatePlayer(runtime, object, task);
      task.data[3] += task.data[2];
      task.data[2] -= 3;
      if (task.data[2] < 4)
        task.data[2] = 4;
      sprite.y = task.data[3] >> 4;
      if ((sprite.y ?? 0) >= task.data[4]) {
        sprite.y = task.data[4];
        task.data[8] = 0;
        task.data[0]++;
      }
      break;
    case 2:
      TeleportAnim_RotatePlayer(runtime, object, task);
      task.data[8]++;
      if (task.data[8] > 8)
        task.data[0]++;
      break;
    case 3:
      if (task.data[5] === TeleportAnim_RotatePlayer(runtime, object, task)) {
        object.fixedPriority = false;
        sprite.oamPriority = task.data[6];
        sprite.subpriority = task.data[7];
        op(runtime, 'CameraObjectReset1');
        destroyFieldTask(task);
      }
      break;
  }
};

export const StartTeleportInPlayerAnim = (runtime: FieldPlayerAvatarRuntime): FieldTask => {
  const task = createFieldTask(runtime, 'Task_TeleportWarpInPlayerAnim');
  Task_TeleportWarpInPlayerAnim(runtime, task);
  return task;
};

export const WaitTeleportInPlayerAnim = (runtime: FieldPlayerAvatarRuntime): boolean =>
  runtime.gTasks.some((task) => task.func === 'Task_TeleportWarpInPlayerAnim' && !task.destroyed);
