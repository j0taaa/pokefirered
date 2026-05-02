export const MB_NORMAL = 0x00;
export const MB_UNUSED_01 = 0x01;
export const MB_TALL_GRASS = 0x02;
export const MB_CAVE = 0x08;
export const MB_RUNNING_DISALLOWED = 0x0a;
export const MB_INDOOR_ENCOUNTER = 0x0b;
export const MB_MOUNTAIN_TOP = 0x0c;
export const MB_POND_WATER = 0x10;
export const MB_FAST_WATER = 0x11;
export const MB_DEEP_WATER = 0x12;
export const MB_WATERFALL = 0x13;
export const MB_OCEAN_WATER = 0x15;
export const MB_PUDDLE = 0x16;
export const MB_SHALLOW_WATER = 0x17;
export const MB_UNDERWATER_BLOCKED_ABOVE = 0x19;
export const MB_UNUSED_WATER = 0x1a;
export const MB_CYCLING_ROAD_WATER = 0x1b;
export const MB_STRENGTH_BUTTON = 0x20;
export const MB_SAND = 0x21;
export const MB_SEAWEED = 0x22;
export const MB_ICE = 0x23;
export const MB_THIN_ICE = 0x26;
export const MB_CRACKED_ICE = 0x27;
export const MB_HOT_SPRINGS = 0x28;
export const MB_ROCK_STAIRS = 0x2a;
export const MB_SAND_CAVE = 0x2b;
export const MB_IMPASSABLE_EAST = 0x30;
export const MB_IMPASSABLE_WEST = 0x31;
export const MB_IMPASSABLE_NORTH = 0x32;
export const MB_IMPASSABLE_SOUTH = 0x33;
export const MB_IMPASSABLE_NORTHEAST = 0x34;
export const MB_IMPASSABLE_NORTHWEST = 0x35;
export const MB_IMPASSABLE_SOUTHEAST = 0x36;
export const MB_IMPASSABLE_SOUTHWEST = 0x37;
export const MB_JUMP_EAST = 0x38;
export const MB_JUMP_WEST = 0x39;
export const MB_JUMP_NORTH = 0x3a;
export const MB_JUMP_SOUTH = 0x3b;
export const MB_WALK_EAST = 0x40;
export const MB_WALK_WEST = 0x41;
export const MB_WALK_NORTH = 0x42;
export const MB_WALK_SOUTH = 0x43;
export const MB_SLIDE_EAST = 0x44;
export const MB_SLIDE_WEST = 0x45;
export const MB_SLIDE_NORTH = 0x46;
export const MB_SLIDE_SOUTH = 0x47;
export const MB_TRICK_HOUSE_PUZZLE_8_FLOOR = 0x48;
export const MB_EASTWARD_CURRENT = 0x50;
export const MB_WESTWARD_CURRENT = 0x51;
export const MB_NORTHWARD_CURRENT = 0x52;
export const MB_SOUTHWARD_CURRENT = 0x53;
export const MB_SPIN_RIGHT = 0x54;
export const MB_SPIN_LEFT = 0x55;
export const MB_SPIN_UP = 0x56;
export const MB_SPIN_DOWN = 0x57;
export const MB_STOP_SPINNING = 0x58;
export const MB_CAVE_DOOR = 0x60;
export const MB_LADDER = 0x61;
export const MB_EAST_ARROW_WARP = 0x62;
export const MB_WEST_ARROW_WARP = 0x63;
export const MB_NORTH_ARROW_WARP = 0x64;
export const MB_SOUTH_ARROW_WARP = 0x65;
export const MB_FALL_WARP = 0x66;
export const MB_REGULAR_WARP = 0x67;
export const MB_LAVARIDGE_1F_WARP = 0x68;
export const MB_WARP_DOOR = 0x69;
export const MB_UP_ESCALATOR = 0x6a;
export const MB_DOWN_ESCALATOR = 0x6b;
export const MB_UP_RIGHT_STAIR_WARP = 0x6c;
export const MB_UP_LEFT_STAIR_WARP = 0x6d;
export const MB_DOWN_RIGHT_STAIR_WARP = 0x6e;
export const MB_DOWN_LEFT_STAIR_WARP = 0x6f;
export const MB_UNION_ROOM_WARP = 0x71;
export const MB_COUNTER = 0x80;
export const MB_BOOKSHELF = 0x81;
export const MB_POKEMART_SHELF = 0x82;
export const MB_PC = 0x83;
export const MB_SIGNPOST = 0x84;
export const MB_REGION_MAP = 0x85;
export const MB_TELEVISION = 0x86;
export const MB_POKEMON_CENTER_SIGN = 0x87;
export const MB_POKEMART_SIGN = 0x88;
export const MB_CABINET = 0x89;
export const MB_KITCHEN = 0x8a;
export const MB_DRESSER = 0x8b;
export const MB_SNACKS = 0x8c;
export const MB_CABLE_CLUB_WIRELESS_MONITOR = 0x8d;
export const MB_BATTLE_RECORDS = 0x8e;
export const MB_QUESTIONNAIRE = 0x8f;
export const MB_FOOD = 0x90;
export const MB_INDIGO_PLATEAU_SIGN_1 = 0x91;
export const MB_INDIGO_PLATEAU_SIGN_2 = 0x92;
export const MB_BLUEPRINTS = 0x93;
export const MB_PAINTING = 0x94;
export const MB_POWER_PLANT_MACHINE = 0x95;
export const MB_TELEPHONE = 0x96;
export const MB_COMPUTER = 0x97;
export const MB_ADVERTISING_POSTER = 0x98;
export const MB_FOOD_SMELLS_TASTY = 0x99;
export const MB_TRASH_BIN = 0x9a;
export const MB_CUP = 0x9b;
export const MB_PORTHOLE = 0x9c;
export const MB_WINDOW = 0x9d;
export const MB_BLINKING_LIGHTS = 0x9e;
export const MB_NEATLY_LINED_UP_TOOLS = 0x9f;
export const MB_IMPRESSIVE_MACHINE = 0xa0;
export const MB_VIDEO_GAME = 0xa1;
export const MB_BURGLARY = 0xa2;
export const MB_TRAINER_TOWER_MONITOR = 0xa3;
export const MB_CYCLING_ROAD_PULL_DOWN = 0xd0;
export const MB_CYCLING_ROAD_PULL_DOWN_GRASS = 0xd1;
export const NUM_METATILE_BEHAVIORS = 0xf0;

export const DIR_NORTH = 2;

const isOneOf = (behavior: number, values: readonly number[]): boolean => values.includes(behavior & 0xff);
const inRange = (behavior: number, low: number, high: number): boolean =>
  (behavior & 0xff) >= low && (behavior & 0xff) <= high;

const sBehaviorSurfable = new Uint8Array(NUM_METATILE_BEHAVIORS);
[
  MB_POND_WATER,
  MB_FAST_WATER,
  MB_DEEP_WATER,
  MB_WATERFALL,
  MB_OCEAN_WATER,
  MB_UNUSED_WATER,
  MB_CYCLING_ROAD_WATER,
  MB_EASTWARD_CURRENT,
  MB_WESTWARD_CURRENT,
  MB_NORTHWARD_CURRENT,
  MB_SOUTHWARD_CURRENT
].forEach((behavior) => {
  sBehaviorSurfable[behavior] = 1;
});

const sTileBitAttributes = new Uint8Array(32);
sTileBitAttributes[1] = 1 << 0;
sTileBitAttributes[2] = 1 << 1;
sTileBitAttributes[3] = 1 << 2;
sTileBitAttributes[4] = 1 << 3;

export const MetatileBehavior_IsATile = (_metatileBehavior: number): boolean => true;
export const MetatileBehavior_IsJumpEast = (b: number): boolean => (b & 0xff) === MB_JUMP_EAST;
export const MetatileBehavior_IsJumpWest = (b: number): boolean => (b & 0xff) === MB_JUMP_WEST;
export const MetatileBehavior_IsJumpNorth = (b: number): boolean => (b & 0xff) === MB_JUMP_NORTH;
export const MetatileBehavior_IsJumpSouth = (b: number): boolean => (b & 0xff) === MB_JUMP_SOUTH;
export const MetatileBehavior_IsPokeGrass = (b: number): boolean => isOneOf(b, [MB_TALL_GRASS, MB_CYCLING_ROAD_PULL_DOWN_GRASS]);
export const MetatileBehavior_IsSand = (b: number): boolean => isOneOf(b, [MB_SAND, MB_SAND_CAVE]);
export const MetatileBehavior_IsSandOrShallowFlowingWater = (b: number): boolean => isOneOf(b, [MB_SAND, MB_SHALLOW_WATER]);
export const MetatileBehavior_IsDeepSand = (_b: number): boolean => false;
export const MetatileBehavior_IsReflective = (b: number): boolean => isOneOf(b, [MB_POND_WATER, MB_PUDDLE, MB_UNUSED_WATER, MB_CYCLING_ROAD_WATER, MB_ICE]);
export const MetatileBehavior_IsIce = (b: number): boolean => (b & 0xff) === MB_ICE;
export const MetatileBehavior_IsWarpDoor = (b: number): boolean => (b & 0xff) === MB_WARP_DOOR;
export const MetatileBehavior_IsWarpDoor_2 = MetatileBehavior_IsWarpDoor;
export const MetatileBehavior_IsEscalator = (b: number): boolean => inRange(b, MB_UP_ESCALATOR, MB_DOWN_ESCALATOR);
export const MetatileBehavior_IsDirectionalUpRightStairWarp = (b: number): boolean => (b & 0xff) === MB_UP_RIGHT_STAIR_WARP;
export const MetatileBehavior_IsDirectionalUpLeftStairWarp = (b: number): boolean => (b & 0xff) === MB_UP_LEFT_STAIR_WARP;
export const MetatileBehavior_IsDirectionalDownRightStairWarp = (b: number): boolean => (b & 0xff) === MB_DOWN_RIGHT_STAIR_WARP;
export const MetatileBehavior_IsDirectionalDownLeftStairWarp = (b: number): boolean => (b & 0xff) === MB_DOWN_LEFT_STAIR_WARP;
export const MetatileBehavior_IsDirectionalStairWarp = (b: number): boolean => inRange(b, MB_UP_RIGHT_STAIR_WARP, MB_DOWN_LEFT_STAIR_WARP);
export const MetatileBehavior_IsLadder = (b: number): boolean => (b & 0xff) === MB_LADDER;
export const MetatileBehavior_IsNonAnimDoor = (b: number): boolean => (b & 0xff) === MB_CAVE_DOOR;
export const MetatileBehavior_IsDeepSouthWarp = (_b: number): boolean => false;
export const MetatileBehavior_IsSurfable = (b: number): boolean => (sBehaviorSurfable[b & 0xff] & 1) !== 0;
export const MetatileBehavior_IsFastWater = (b: number): boolean => (b & 0xff) === MB_FAST_WATER;
export const MetatileBehavior_IsEastArrowWarp = (b: number): boolean => (b & 0xff) === MB_EAST_ARROW_WARP;
export const MetatileBehavior_IsWestArrowWarp = (b: number): boolean => (b & 0xff) === MB_WEST_ARROW_WARP;
export const MetatileBehavior_IsNorthArrowWarp = (b: number): boolean => (b & 0xff) === MB_NORTH_ARROW_WARP;
export const MetatileBehavior_IsSouthArrowWarp = (b: number): boolean => (b & 0xff) === MB_SOUTH_ARROW_WARP;
export const MetatileBehavior_IsArrowWarp = (b: number): boolean =>
  MetatileBehavior_IsEastArrowWarp(b)
  || MetatileBehavior_IsWestArrowWarp(b)
  || MetatileBehavior_IsNorthArrowWarp(b)
  || MetatileBehavior_IsSouthArrowWarp(b);
export const MetatileBehavior_IsForcedMovementTile = (b: number): boolean =>
  inRange(b, MB_WALK_EAST, MB_TRICK_HOUSE_PUZZLE_8_FLOOR)
  || inRange(b, MB_EASTWARD_CURRENT, MB_SOUTHWARD_CURRENT)
  || (b & 0xff) === MB_WATERFALL
  || (b & 0xff) === MB_ICE
  || inRange(b, MB_SPIN_RIGHT, MB_SPIN_DOWN);
export const MetatileBehavior_IsIce_2 = MetatileBehavior_IsIce;
export const MetatileBehavior_IsTrickHouseSlipperyFloor = (b: number): boolean => (b & 0xff) === MB_TRICK_HOUSE_PUZZLE_8_FLOOR;
export const MetatileBehavior_IsWalkNorth = (b: number): boolean => (b & 0xff) === MB_WALK_NORTH;
export const MetatileBehavior_IsWalkSouth = (b: number): boolean => (b & 0xff) === MB_WALK_SOUTH;
export const MetatileBehavior_IsWalkWest = (b: number): boolean => (b & 0xff) === MB_WALK_WEST;
export const MetatileBehavior_IsWalkEast = (b: number): boolean => (b & 0xff) === MB_WALK_EAST;
export const MetatileBehavior_IsNorthwardCurrent = (b: number): boolean => (b & 0xff) === MB_NORTHWARD_CURRENT;
export const MetatileBehavior_IsSouthwardCurrent = (b: number): boolean => (b & 0xff) === MB_SOUTHWARD_CURRENT;
export const MetatileBehavior_IsWestwardCurrent = (b: number): boolean => (b & 0xff) === MB_WESTWARD_CURRENT;
export const MetatileBehavior_IsEastwardCurrent = (b: number): boolean => (b & 0xff) === MB_EASTWARD_CURRENT;
export const MetatileBehavior_IsSlideNorth = (b: number): boolean => (b & 0xff) === MB_SLIDE_NORTH;
export const MetatileBehavior_IsSlideSouth = (b: number): boolean => (b & 0xff) === MB_SLIDE_SOUTH;
export const MetatileBehavior_IsSlideWest = (b: number): boolean => (b & 0xff) === MB_SLIDE_WEST;
export const MetatileBehavior_IsSlideEast = (b: number): boolean => (b & 0xff) === MB_SLIDE_EAST;
export const MetatileBehavior_IsCounter = (b: number): boolean => (b & 0xff) === MB_COUNTER;
export const MetatileBehavior_IsPlayerFacingTVScreen = (b: number, playerDirection: number): boolean =>
  playerDirection === DIR_NORTH && (b & 0xff) === MB_TELEVISION;
export const MetatileBehavior_IsPC = (b: number): boolean => (b & 0xff) === MB_PC;
export const MetatileBehavior_HasRipples = (b: number): boolean => isOneOf(b, [MB_POND_WATER, MB_PUDDLE]);
export const MetatileBehavior_IsPuddle = (b: number): boolean => (b & 0xff) === MB_PUDDLE;
export const MetatileBehavior_IsTallGrass = MetatileBehavior_IsPokeGrass;
export const MetatileBehavior_IsLongGrass = (_b: number): boolean => false;
export const MetatileBehavior_IsAshGrass = (_b: number): boolean => false;
export const MetatileBehavior_IsFootprints = (_b: number): boolean => false;
export const MetatileBehavior_IsBridge = (_b: number): boolean => false;
export const MetatileBehavior_GetBridgeType = (_b: number): boolean => false;
export const MetatileBehavior_IsUnused01 = (b: number): boolean => (b & 0xff) === MB_UNUSED_01;
export const MetatileBehavior_UnusedIsTallGrass = (b: number): boolean => (b & 0xff) === MB_TALL_GRASS;
export const MetatileBehavior_IsIndoorEncounter = (b: number): boolean => (b & 0xff) === MB_INDOOR_ENCOUNTER;
export const MetatileBehavior_IsMountain = (b: number): boolean => (b & 0xff) === MB_MOUNTAIN_TOP;
export const MetatileBehavior_IsDiveable = (b: number): boolean => inRange(b, MB_FAST_WATER, MB_DEEP_WATER);
export const MetatileBehavior_IsUnableToEmerge = (b: number): boolean => (b & 0xff) === MB_UNDERWATER_BLOCKED_ABOVE;
export const MetatileBehavior_IsShallowFlowingWater = (b: number): boolean => (b & 0xff) === MB_SHALLOW_WATER;
export const MetatileBehavior_IsThinIce = (b: number): boolean => (b & 0xff) === MB_THIN_ICE;
export const MetatileBehavior_IsCrackedIce = (b: number): boolean => (b & 0xff) === MB_CRACKED_ICE;
export const MetatileBehavior_IsDeepWaterTerrain = (b: number): boolean => inRange(b, MB_FAST_WATER, MB_DEEP_WATER) || (b & 0xff) === MB_OCEAN_WATER;
export const MetatileBehavior_IsUnusedWater = (b: number): boolean => (b & 0xff) === MB_UNUSED_WATER;
export const MetatileBehavior_IsSurfableAndNotWaterfall = (b: number): boolean =>
  MetatileBehavior_IsSurfable(b) && !MetatileBehavior_IsWaterfall(b);
export const MetatileBehavior_IsEastBlocked = (b: number): boolean => isOneOf(b, [MB_IMPASSABLE_EAST, MB_IMPASSABLE_NORTHEAST, MB_IMPASSABLE_SOUTHEAST]);
export const MetatileBehavior_IsWestBlocked = (b: number): boolean => isOneOf(b, [MB_IMPASSABLE_WEST, MB_IMPASSABLE_NORTHWEST, MB_IMPASSABLE_SOUTHWEST]);
export const MetatileBehavior_IsNorthBlocked = (b: number): boolean => isOneOf(b, [MB_IMPASSABLE_NORTH, MB_IMPASSABLE_NORTHEAST, MB_IMPASSABLE_NORTHWEST]);
export const MetatileBehavior_IsSouthBlocked = (b: number): boolean => isOneOf(b, [MB_IMPASSABLE_SOUTH, MB_IMPASSABLE_SOUTHEAST, MB_IMPASSABLE_SOUTHWEST]);
export const MetatileBehavior_IsShortGrass = (_b: number): boolean => false;
export const MetatileBehavior_IsHotSprings = (b: number): boolean => (b & 0xff) === MB_HOT_SPRINGS;
export const MetatileBehavior_IsWaterfall = (b: number): boolean => (b & 0xff) === MB_WATERFALL;
export const MetatileBehavior_IsFortreeBridge = (_b: number): boolean => false;
export const MetatileBehavior_IsPacifidlogVerticalLogTop = (_b: number): boolean => false;
export const MetatileBehavior_IsPacifidlogVerticalLogBottom = (_b: number): boolean => false;
export const MetatileBehavior_IsPacifidlogHorizontalLogLeft = (_b: number): boolean => false;
export const MetatileBehavior_IsPacifidlogHorizontalLogRight = (_b: number): boolean => false;
export const MetatileBehavior_IsPacifidlogLog = (_b: number): boolean => false;
export const MetatileBehavior_IsTrickHousePuzzleDoor = (_b: number): boolean => false;
export const MetatileBehavior_IsRegionMap = (b: number): boolean => (b & 0xff) === MB_REGION_MAP;
export const MetatileBehavior_IsRoulette = (_b: number): boolean => false;
export const MetatileBehavior_IsPokeblockFeeder = (_b: number): boolean => false;
export const MetatileBehavior_IsSecretBaseJumpMat = (_b: number): boolean => false;
export const MetatileBehavior_IsSecretBaseSpinMat = (_b: number): boolean => false;
export const MetatileBehavior_IsLavaridgeB1FWarp = (_b: number): boolean => false;
export const MetatileBehavior_IsLavaridge1FWarp = (b: number): boolean => (b & 0xff) === MB_LAVARIDGE_1F_WARP;
export const MetatileBehavior_IsWarpPad = (b: number): boolean => (b & 0xff) === MB_REGULAR_WARP;
export const MetatileBehavior_IsUnionRoomWarp = (b: number): boolean => (b & 0xff) === MB_UNION_ROOM_WARP;
export const MetatileBehavior_IsWater = (b: number): boolean =>
  inRange(b, MB_POND_WATER, MB_DEEP_WATER)
  || (b & 0xff) === MB_OCEAN_WATER
  || inRange(b, MB_EASTWARD_CURRENT, MB_SOUTHWARD_CURRENT);
export const MetatileBehavior_IsFallWarp = (b: number): boolean => (b & 0xff) === MB_FALL_WARP;
export const MetatileBehavior_IsCrackedFloor = (_b: number): boolean => false;
export const MetatileBehavior_IsCyclingRoadPullDownTile = (b: number): boolean =>
  inRange(b, MB_CYCLING_ROAD_PULL_DOWN, MB_CYCLING_ROAD_PULL_DOWN_GRASS);
export const MetatileBehavior_IsCyclingRoadPullDownTileGrass = (b: number): boolean =>
  (b & 0xff) === MB_CYCLING_ROAD_PULL_DOWN_GRASS;
export const MetatileBehavior_IsBumpySlope = (_b: number): boolean => false;
export const MetatileBehavior_IsIsolatedVerticalRail = (_b: number): boolean => false;
export const MetatileBehavior_IsIsolatedHorizontalRail = (_b: number): boolean => false;
export const MetatileBehavior_IsVerticalRail = (_b: number): boolean => false;
export const MetatileBehavior_IsHorizontalRail = (_b: number): boolean => false;
export const MetatileBehavior_IsSeaweed = (b: number): boolean => (b & 0xff) === MB_SEAWEED;
export const MetatileBehavior_IsRunningDisallowed = (b: number): boolean => (b & 0xff) === MB_RUNNING_DISALLOWED;
export const MetatileBehavior_IsPictureBookShelf = (_b: number): boolean => false;
export const MetatileBehavior_IsBookshelf = (b: number): boolean => (b & 0xff) === MB_BOOKSHELF;
export const MetatileBehavior_IsPokeMartShelf = (b: number): boolean => (b & 0xff) === MB_POKEMART_SHELF;
export const MetatileBehavior_IsPlayerFacingPokemonCenterSign = (b: number, playerDirection: number): boolean =>
  playerDirection === DIR_NORTH && (b & 0xff) === MB_POKEMON_CENTER_SIGN;
export const MetatileBehavior_IsPlayerFacingPokeMartSign = (b: number, playerDirection: number): boolean =>
  playerDirection === DIR_NORTH && (b & 0xff) === MB_POKEMART_SIGN;
export const MetatileBehavior_UnknownDummy1 = (_b: number): boolean => false;
export const MetatileBehavior_UnknownDummy2 = (_b: number): boolean => false;
export const MetatileBehavior_UnknownDummy3 = (_b: number): boolean => false;
export const MetatileBehavior_UnknownDummy4 = (_b: number): boolean => false;
export const TestMetatileAttributeBit = (arg1: number, arg2: number): boolean =>
  (sTileBitAttributes[arg1 & 0xff] & (arg2 & 0xff)) !== 0;
export const MetatileBehavior_IsSpinRight = (b: number): boolean => (b & 0xff) === MB_SPIN_RIGHT;
export const MetatileBehavior_IsSpinLeft = (b: number): boolean => (b & 0xff) === MB_SPIN_LEFT;
export const MetatileBehavior_IsSpinUp = (b: number): boolean => (b & 0xff) === MB_SPIN_UP;
export const MetatileBehavior_IsSpinDown = (b: number): boolean => (b & 0xff) === MB_SPIN_DOWN;
export const MetatileBehavior_IsStopSpinning = (b: number): boolean => (b & 0xff) === MB_STOP_SPINNING;
export const MetatileBehavior_IsSpinTile = (b: number): boolean => inRange(b, MB_SPIN_RIGHT, MB_SPIN_DOWN);
export const MetatileBehavior_IsSignpost = (b: number): boolean => (b & 0xff) === MB_SIGNPOST;
export const MetatileBehavior_IsCabinet = (b: number): boolean => (b & 0xff) === MB_CABINET;
export const MetatileBehavior_IsKitchen = (b: number): boolean => (b & 0xff) === MB_KITCHEN;
export const MetatileBehavior_IsDresser = (b: number): boolean => (b & 0xff) === MB_DRESSER;
export const MetatileBehavior_IsSnacks = (b: number): boolean => (b & 0xff) === MB_SNACKS;
export const MetatileBehavior_IsStrengthButton = (b: number): boolean => (b & 0xff) === MB_STRENGTH_BUTTON;
export const MetatileBehavior_IsPlayerFacingCableClubWirelessMonitor = (b: number, playerDirection: number): boolean =>
  playerDirection === DIR_NORTH && (b & 0xff) === MB_CABLE_CLUB_WIRELESS_MONITOR;
export const MetatileBehavior_IsPlayerFacingBattleRecords = (b: number, playerDirection: number): boolean =>
  playerDirection === DIR_NORTH && (b & 0xff) === MB_BATTLE_RECORDS;
export const MetatileBehavior_IsQuestionnaire = (b: number): boolean => (b & 0xff) === MB_QUESTIONNAIRE;
export const MetatileBehavior_IsIndigoPlateauSign1 = (b: number): boolean => (b & 0xff) === MB_INDIGO_PLATEAU_SIGN_1;
export const MetatileBehavior_IsIndigoPlateauSign2 = (b: number): boolean => (b & 0xff) === MB_INDIGO_PLATEAU_SIGN_2;
export const MetatileBehavior_IsFood = (b: number): boolean => (b & 0xff) === MB_FOOD;
export const MetatileBehavior_IsRockStairs = (b: number): boolean => (b & 0xff) === MB_ROCK_STAIRS;
export const MetatileBehavior_IsBlueprints = (b: number): boolean => (b & 0xff) === MB_BLUEPRINTS;
export const MetatileBehavior_IsPainting = (b: number): boolean => (b & 0xff) === MB_PAINTING;
export const MetatileBehavior_IsPowerPlantMachine = (b: number): boolean => (b & 0xff) === MB_POWER_PLANT_MACHINE;
export const MetatileBehavior_IsTelephone = (b: number): boolean => (b & 0xff) === MB_TELEPHONE;
export const MetatileBehavior_IsComputer = (b: number): boolean => (b & 0xff) === MB_COMPUTER;
export const MetatileBehavior_IsAdvertisingPoster = (b: number): boolean => (b & 0xff) === MB_ADVERTISING_POSTER;
export const MetatileBehavior_IsTastyFood = (b: number): boolean => (b & 0xff) === MB_FOOD_SMELLS_TASTY;
export const MetatileBehavior_IsTrashBin = (b: number): boolean => (b & 0xff) === MB_TRASH_BIN;
export const MetatileBehavior_IsCup = (b: number): boolean => (b & 0xff) === MB_CUP;
export const MetatileBehavior_IsPolishedWindow = (_b: number): boolean => false;
export const MetatileBehavior_IsBeautifulSkyWindow = (_b: number): boolean => false;
export const MetatileBehavior_IsBlinkingLights = (b: number): boolean => (b & 0xff) === MB_BLINKING_LIGHTS;
export const MetatileBehavior_IsNeatlyLinedUpTools = (b: number): boolean => (b & 0xff) === MB_NEATLY_LINED_UP_TOOLS;
export const MetatileBehavior_IsImpressiveMachine = (b: number): boolean => (b & 0xff) === MB_IMPRESSIVE_MACHINE;
export const MetatileBehavior_IsVideoGame = (b: number): boolean => (b & 0xff) === MB_VIDEO_GAME;
export const MetatileBehavior_IsBurglary = (b: number): boolean => (b & 0xff) === MB_BURGLARY;
export const MetatileBehavior_IsTrainerTowerMonitor = (b: number): boolean => (b & 0xff) === MB_TRAINER_TOWER_MONITOR;
