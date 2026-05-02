import {
  QL_ACTION_GFX_CHANGE,
  QL_ACTION_INPUT,
  QL_ACTION_MOVEMENT,
  QL_ACTION_SCENE_END,
  QL_ACTION_WAIT,
  type QuestLogAction,
  createQuestLogAction
} from './decompQuestLog';

export const CMD_HEADER_SIZE = 4;
export const MAX_CMD_REPEAT = 4;

export const QL_CMD_EVENT_MASK = 0x0fff;
export const QL_CMD_COUNT_SHIFT = 12;
export const QL_CMD_COUNT_MASK = 0xf << QL_CMD_COUNT_SHIFT;

export const QL_EVENT_INPUT = 0;
export const QL_EVENT_GFX_CHANGE = 1;
export const QL_EVENT_MOVEMENT = 2;
export const QL_EVENT_SWITCHED_PARTY_ORDER = 3;
export const QL_EVENT_USED_ITEM = 4;
export const QL_EVENT_GAVE_HELD_ITEM = 5;
export const QL_EVENT_GAVE_HELD_ITEM_BAG = 6;
export const QL_EVENT_GAVE_HELD_ITEM_PC = 7;
export const QL_EVENT_TOOK_HELD_ITEM = 8;
export const QL_EVENT_SWAPPED_HELD_ITEM = 9;
export const QL_EVENT_SWAPPED_HELD_ITEM_PC = 10;
export const QL_EVENT_USED_PKMN_CENTER = 11;
export const QL_EVENT_LINK_TRADED = 12;
export const QL_EVENT_LINK_BATTLED_SINGLE = 13;
export const QL_EVENT_LINK_BATTLED_DOUBLE = 14;
export const QL_EVENT_LINK_BATTLED_MULTI = 15;
export const QL_EVENT_USED_UNION_ROOM = 16;
export const QL_EVENT_USED_UNION_ROOM_CHAT = 17;
export const QL_EVENT_LINK_TRADED_UNION = 18;
export const QL_EVENT_LINK_BATTLED_UNION = 19;
export const QL_EVENT_SWITCHED_MONS_BETWEEN_BOXES = 20;
export const QL_EVENT_SWITCHED_MONS_WITHIN_BOX = 21;
export const QL_EVENT_SWITCHED_PARTY_MON_FOR_PC_MON = 22;
export const QL_EVENT_MOVED_MON_BETWEEN_BOXES = 23;
export const QL_EVENT_MOVED_MON_WITHIN_BOX = 24;
export const QL_EVENT_WITHDREW_MON_PC = 25;
export const QL_EVENT_DEPOSITED_MON_PC = 26;
export const QL_EVENT_SWITCHED_MULTIPLE_MONS = 27;
export const QL_EVENT_DEPOSITED_ITEM_PC = 28;
export const QL_EVENT_WITHDREW_ITEM_PC = 29;
export const QL_EVENT_DEFEATED_GYM_LEADER = 30;
export const QL_EVENT_DEFEATED_WILD_MON = 31;
export const QL_EVENT_DEFEATED_E4_MEMBER = 32;
export const QL_EVENT_DEFEATED_CHAMPION = 33;
export const QL_EVENT_DEFEATED_TRAINER = 34;
export const QL_EVENT_DEPARTED = 35;
export const QL_EVENT_USED_FIELD_MOVE = 36;
export const QL_EVENT_BOUGHT_ITEM = 37;
export const QL_EVENT_SOLD_ITEM = 38;
export const QL_EVENT_SCENE_END = 39;
export const QL_EVENT_OBTAINED_STORY_ITEM = 40;
export const QL_EVENT_WAIT = 41;
export const QL_EVENT_ARRIVED = 42;

export const QL_STATE_RECORDING = 1;
export const QL_STATE_PLAYBACK = 2;
export const QL_STATE_PLAYBACK_LAST = 3;
export const QL_PLAYBACK_STATE_STOPPED = 0;

export interface QuestLogRepeatEventTracker {
  id: number;
  numRepeats: number;
  counter: number;
}

export interface DeferredQuestLogEvent {
  id: number;
  data: QuestLogEventPayload | null;
}

export interface QuestLogEventsRuntime {
  gQuestLogCurActionIdx: number;
  gQuestLogRepeatEventTracker: QuestLogRepeatEventTracker;
  sNewlyEnteredMap: boolean;
  sLastDepartedLocation: number;
  sPlayedTheSlots: boolean;
  sStepRecordingMode: number;
  sDeferredEvent: DeferredQuestLogEvent;
  gQuestLogRecordingPointer: number | null;
  gQuestLogDefeatedWildMonRecord: number | null;
  recordedActions: number[];
  finishedRecordingScenes: number;
  cutRecordingScenes: number;
  loadedEventText: string;
  stringVars: string[];
  playerName: string;
  rivalName: string;
}

export const createQuestLogEventsRuntime = (overrides: Partial<QuestLogEventsRuntime> = {}): QuestLogEventsRuntime => ({
  gQuestLogCurActionIdx: 0,
  gQuestLogRepeatEventTracker: { id: 0, numRepeats: 0, counter: 0 },
  sNewlyEnteredMap: false,
  sLastDepartedLocation: 0,
  sPlayedTheSlots: false,
  sStepRecordingMode: STEP_RECORDING_MODE_ENABLED,
  sDeferredEvent: { id: 0, data: null },
  gQuestLogRecordingPointer: 0,
  gQuestLogDefeatedWildMonRecord: null,
  recordedActions: [],
  finishedRecordingScenes: 0,
  cutRecordingScenes: 0,
  loadedEventText: '',
  stringVars: ['', '', '', ''],
  playerName: 'PLAYER',
  rivalName: 'RIVAL',
  ...overrides
});

export const STEP_RECORDING_MODE_ENABLED = 0;
export const STEP_RECORDING_MODE_DISABLED = 1;
export const STEP_RECORDING_MODE_DISABLED_UNTIL_DEPART = 2;

export const PLAYER_NAME_LENGTH = 7;
export const TOTAL_BOXES_COUNT = 14;
export const SPECIES_NONE = 0;
export const SPECIES_EGG = 412;
export const ITEM_ESCAPE_ROPE = 85;
export const ITEM_HM01 = 339;
export const POCKET_ITEMS = 1;
export const POCKET_KEY_ITEMS = 2;
export const POCKET_POKE_BALLS = 3;
export const POCKET_TM_CASE = 4;
export const POCKET_BERRY_POUCH = 5;
export const EXT_CTRL_CODE_BEGIN = 0xfc;
export const EXT_CTRL_CODE_JPN = 0x15;
export const EXT_CTRL_CODE_ENG = 0x16;
export const EOS = 0xff;
export const FIELD_MOVE_TELEPORT = 7;
export const FIELD_MOVE_DIG = 8;
export const MAPSEC_PALLET_TOWN = 0x58;
export const QL_LOCATION_GAME_CORNER = 32;
export const QL_LOCATION_SAFARI_ZONE = 36;
export const TRAINER_CLASS_RIVAL_EARLY = 81;
export const TRAINER_CLASS_BOSS = 83;
export const TRAINER_CLASS_RIVAL_LATE = 89;
export const TRAINER_CLASS_CHAMPION = 90;
export const SPECIES_SNORLAX = 143;
export const SPECIES_ARTICUNO = 144;
export const SPECIES_ZAPDOS = 145;
export const SPECIES_MOLTRES = 146;
export const SPECIES_MEWTWO = 150;
export const SPECIES_LUGIA = 249;
export const SPECIES_HO_OH = 250;
export const SPECIES_DEOXYS = 410;

export interface QuestLogMapLocation {
  mapGroup: number;
  mapNum: number;
}

export const MAP_GROUP_TRAINER_TOWER = 2;
export const MAP_GROUP_SEVEN_ISLAND_HOUSE = 31;
export const MAP_GROUP_SAFFRON_CITY = 14;
export const MAP_GROUP_ROCKET_HIDEOUT = 1;
export const MAP_GROUP_SILPH_CO = 1;
export const MAP_GROUP_CELADON_CITY_DEPT_STORE = 10;
export const MAP_NUM_TRAINER_TOWER_1F = 1;
export const MAP_NUM_TRAINER_TOWER_ELEVATOR = 11;
export const MAP_NUM_SAFFRON_CITY_POKEMON_TRAINER_FAN_CLUB = 9;
export const MAP_NUM_SEVEN_ISLAND_HOUSE_ROOM1 = 0;
export const MAP_NUM_SEVEN_ISLAND_HOUSE_ROOM2 = 1;
export const MAP_NUM_ROCKET_HIDEOUT_ELEVATOR = 46;
export const MAP_NUM_SILPH_CO_ELEVATOR = 58;
export const MAP_NUM_CELADON_CITY_DEPARTMENT_STORE_ELEVATOR = 6;

export const QL_DEPARTED_TOWN_BUILDING = 0;
export const QL_DEPARTED_MUSEUM = 1;
export const QL_DEPARTED_GAME_CORNER = 2;
export const QL_DEPARTED_HOME = 3;
export const QL_DEPARTED_OAKS_LAB = 4;
export const QL_DEPARTED_GYM = 5;
export const QL_DEPARTED_SAFARI_ZONE = 6;
export const QL_DEPARTED_CAVE = 7;
export const QL_DEPARTED_MISC_BUILDING_1 = 8;
export const QL_DEPARTED_MISC_BUILDING_2 = 9;

export const sLocationToDepartedTextId = [
  QL_DEPARTED_HOME,
  QL_DEPARTED_OAKS_LAB,
  QL_DEPARTED_GYM,
  QL_DEPARTED_MISC_BUILDING_1,
  QL_DEPARTED_MISC_BUILDING_1,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_MUSEUM,
  QL_DEPARTED_GYM,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_GYM,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_MISC_BUILDING_1,
  QL_DEPARTED_MISC_BUILDING_1,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_GYM,
  QL_DEPARTED_MISC_BUILDING_1,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_MISC_BUILDING_1,
  QL_DEPARTED_MISC_BUILDING_1,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_MISC_BUILDING_1,
  QL_DEPARTED_MISC_BUILDING_1,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_GAME_CORNER,
  QL_DEPARTED_GYM,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_MISC_BUILDING_1,
  QL_DEPARTED_SAFARI_ZONE,
  QL_DEPARTED_GYM,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_GYM,
  QL_DEPARTED_MISC_BUILDING_2,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_MISC_BUILDING_2,
  QL_DEPARTED_GYM,
  QL_DEPARTED_TOWN_BUILDING,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_CAVE,
  QL_DEPARTED_MISC_BUILDING_1,
  QL_DEPARTED_CAVE
] as const;

export const sDepartedLocationTextLabels = [
  'DepartedPlaceInTownForNextDestination',
  'LeftTownsLocationForNextDestination',
  'PlayedGamesAtGameCorner',
  'RestedAtHome',
  'LeftOaksLab',
  'GymWasFullOfToughTrainers',
  'HadGreatTimeInSafariZone',
  'ManagedToGetOutOfLocation',
  'DepartedTheLocationForNextDestination',
  'DepartedFromLocationToNextDestination'
] as const;

export const sUsedFieldMoveTextLabels = [
  'UsedFlash',
  'UsedCut',
  'UsedFly',
  'UsedStrength',
  'UsedSurf',
  'UsedRockSmash',
  'UsedWaterfall',
  'UsedTeleportToLocation',
  'UsedDigInLocation',
  'UsedMilkDrink',
  'UsedSoftboiled',
  'UsedSweetScent'
] as const;

export const sGymCityMapSecs = [3, 4, 5, 6, 7, 8, 9, 10] as const;

export const sQuestLogEventCmdSizes = [
  8,
  8,
  8,
  CMD_HEADER_SIZE + 4,
  CMD_HEADER_SIZE + 6,
  CMD_HEADER_SIZE + 4,
  CMD_HEADER_SIZE + 4,
  CMD_HEADER_SIZE + 4,
  CMD_HEADER_SIZE + 4,
  CMD_HEADER_SIZE + 6,
  CMD_HEADER_SIZE + 6,
  CMD_HEADER_SIZE + 0,
  CMD_HEADER_SIZE + 12,
  CMD_HEADER_SIZE + 8,
  CMD_HEADER_SIZE + 8,
  CMD_HEADER_SIZE + 22,
  CMD_HEADER_SIZE + 0,
  CMD_HEADER_SIZE + 0,
  CMD_HEADER_SIZE + 12,
  CMD_HEADER_SIZE + 8,
  CMD_HEADER_SIZE + 6,
  CMD_HEADER_SIZE + 6,
  CMD_HEADER_SIZE + 6,
  CMD_HEADER_SIZE + 4,
  CMD_HEADER_SIZE + 4,
  CMD_HEADER_SIZE + 4,
  CMD_HEADER_SIZE + 4,
  CMD_HEADER_SIZE + 2,
  CMD_HEADER_SIZE + 2,
  CMD_HEADER_SIZE + 2,
  CMD_HEADER_SIZE + 8,
  CMD_HEADER_SIZE + 8,
  CMD_HEADER_SIZE + 8,
  CMD_HEADER_SIZE + 6,
  CMD_HEADER_SIZE + 8,
  CMD_HEADER_SIZE + 2,
  CMD_HEADER_SIZE + 4,
  CMD_HEADER_SIZE + 10,
  CMD_HEADER_SIZE + 10,
  2,
  CMD_HEADER_SIZE + 4,
  4,
  CMD_HEADER_SIZE + 2
] as const;

const isValidQlEvent = (eventId: number): boolean => eventId >= QL_EVENT_SWITCHED_PARTY_ORDER && eventId <= QL_EVENT_ARRIVED;

export const readU16 = (script: readonly number[], offset: number): number =>
  (script[offset] ?? 0) | (((script[offset + 1] ?? 0) << 8) & 0xff00);

export const writeU16 = (script: number[], offset: number, value: number): void => {
  script[offset] = value & 0xff;
  script[offset + 1] = (value >> 8) & 0xff;
};

const writeRaw4 = (script: number[], offset: number, raw: readonly number[]): void => {
  script[offset] = raw[0] & 0xff;
  script[offset + 1] = raw[1] & 0xff;
  script[offset + 2] = raw[2] & 0xff;
  script[offset + 3] = raw[3] & 0xff;
};

const readRaw4 = (script: readonly number[], offset: number): number[] => [
  script[offset] ?? 0,
  script[offset + 1] ?? 0,
  script[offset + 2] ?? 0,
  script[offset + 3] ?? 0
];

export const getByte = (script: readonly number[], byteOffset: number): number => {
  return (script[byteOffset] ?? 0) & 0xff;
};

export const setByte = (script: number[], byteOffset: number, value: number): void => {
  script[byteOffset] = value & 0xff;
};

const writeBytes = (script: number[], byteOffset: number, values: readonly number[]): void => {
  for (let i = 0; i < values.length; i += 1)
    setByte(script, byteOffset + i, values[i]);
};

const readBytes = (script: readonly number[], byteOffset: number, count: number): number[] =>
  Array.from({ length: count }, (_, i) => getByte(script, byteOffset + i));

const textBytes = (value: string): number[] =>
  Array.from({ length: PLAYER_NAME_LENGTH }, (_, i) => value.charCodeAt(i) || 0xff);

const textFromBytes = (bytes: readonly number[]): string =>
  bytes.filter((byte) => byte !== 0xff && byte !== 0).map((byte) => String.fromCharCode(byte)).join('');

export const TranslateLinkPartnersName = (dest: number[]): void => {
  let pos = 0;
  if (dest[pos++] === EXT_CTRL_CODE_BEGIN && dest[pos++] === EXT_CTRL_CODE_JPN) {
    for (let i = 0; i < 5; i += 1) {
      if (dest[pos] === EXT_CTRL_CODE_BEGIN)
        break;
      pos += 1;
    }
    dest[pos++] = EXT_CTRL_CODE_BEGIN;
    dest[pos++] = EXT_CTRL_CODE_ENG;
    dest[pos++] = EOS;
  }
};

const setLoadedText = (runtime: QuestLogEventsRuntime, text: string, vars: string[] = []): void => {
  runtime.loadedEventText = text;
  runtime.stringVars = Array.from({ length: Math.max(4, vars.length) }, (_, i) => vars[i] ?? '');
};

const getQuestLogSpeciesText = (species: number): string =>
  species === SPECIES_EGG ? 'EGG' : `SPECIES_${species}`;

export const QuestLog_GetSpeciesName = (
  runtime: QuestLogEventsRuntime,
  species: number,
  destStringVarId: number | null,
  stringVarId: number
): string => {
  const speciesName = getQuestLogSpeciesText(species);
  runtime.stringVars[destStringVarId ?? stringVarId] = speciesName;
  return speciesName;
};

export const QL_IsRoomToSaveEvent = (cursor: number, size: number, start: number, end: number): boolean => {
  const adjustedEnd = end - size;
  if (cursor < start || cursor > adjustedEnd)
    return false;
  return true;
};

export const QL_IsRoomToSaveAction = QL_IsRoomToSaveEvent;

export const QL_ResetRepeatEventTracker = (runtime: QuestLogEventsRuntime): void => {
  runtime.gQuestLogRepeatEventTracker = { id: 0, numRepeats: 0, counter: 0 };
};

export const UpdateRepeatEventCounter = (runtime: QuestLogEventsRuntime, eventId: number): void => {
  const tracker = runtime.gQuestLogRepeatEventTracker;
  if (tracker.id !== (eventId & 0xff) || tracker.counter !== runtime.gQuestLogCurActionIdx) {
    tracker.id = eventId;
    tracker.numRepeats = 0;
    tracker.counter = runtime.gQuestLogCurActionIdx;
  } else if (tracker.numRepeats < MAX_CMD_REPEAT + 1) {
    tracker.numRepeats++;
  }
};

export const QL_ResetEventStates = (runtime: QuestLogEventsRuntime): void => {
  runtime.sNewlyEnteredMap = false;
  runtime.sLastDepartedLocation = 0;
  runtime.sPlayedTheSlots = false;
};

export const QL_RecordAction_SceneEnd = (
  script: number[],
  offset: number,
  start: number,
  end: number
): number | null => {
  if (!QL_IsRoomToSaveAction(offset, sQuestLogEventCmdSizes[QL_EVENT_SCENE_END], start, end))
    return null;
  writeU16(script, offset, QL_EVENT_SCENE_END);
  return offset + 2;
};

export const QL_LoadAction_SceneEnd = (
  _script: readonly number[],
  offset: number,
  action: QuestLogAction,
  start: number,
  end: number
): number | null => {
  if (!QL_IsRoomToSaveAction(offset, sQuestLogEventCmdSizes[QL_EVENT_SCENE_END], start, end))
    return null;
  action.type = QL_ACTION_SCENE_END;
  action.duration = 0;
  action.data.raw = [0, 0, 0, 0];
  return offset + 2;
};

export const QL_RecordAction_Wait = (
  script: number[],
  offset: number,
  duration: number,
  start: number,
  end: number
): number | null => {
  if (!QL_IsRoomToSaveAction(offset, sQuestLogEventCmdSizes[QL_EVENT_WAIT], start, end))
    return null;
  writeU16(script, offset, QL_EVENT_WAIT);
  writeU16(script, offset + 2, duration);
  return offset + 4;
};

export const QL_LoadAction_Wait = (
  script: readonly number[],
  offset: number,
  action: QuestLogAction,
  start: number,
  end: number
): number | null => {
  if (!QL_IsRoomToSaveAction(offset, sQuestLogEventCmdSizes[QL_EVENT_WAIT], start, end))
    return null;
  action.type = QL_ACTION_WAIT;
  action.duration = readU16(script, offset + 2);
  action.data.raw = [0, 0, 0, 0];
  return offset + 4;
};

export const QL_RecordAction_Input = (
  script: number[],
  offset: number,
  action: QuestLogAction,
  start: number,
  end: number
): number | null => {
  const r6 = offset + 4;

  if (!QL_IsRoomToSaveAction(offset, sQuestLogEventCmdSizes[QL_EVENT_INPUT], start, end))
    return null;
  writeU16(script, offset, QL_EVENT_INPUT);
  writeU16(script, offset + 2, action.duration);
  writeRaw4(script, r6, action.data.raw);
  return r6 + 4;
};

export const QL_LoadAction_Input = (
  script: readonly number[],
  offset: number,
  action: QuestLogAction,
  start: number,
  end: number
): number | null => {
  const r6 = offset + 4;

  if (!QL_IsRoomToSaveAction(offset, sQuestLogEventCmdSizes[QL_EVENT_INPUT], start, end))
    return null;
  action.type = QL_ACTION_INPUT;
  action.duration = readU16(script, offset + 2);
  action.data.raw = readRaw4(script, r6);
  return r6 + 4;
};

export const QL_RecordAction_MovementOrGfxChange = (
  script: number[],
  offset: number,
  action: QuestLogAction,
  start: number,
  end: number
): number | null => {
  const r6 = offset + 4;

  if (!QL_IsRoomToSaveAction(offset, sQuestLogEventCmdSizes[QL_EVENT_MOVEMENT], start, end))
    return null;
  if (action.type === QL_ACTION_MOVEMENT)
    writeU16(script, offset, QL_EVENT_MOVEMENT);
  else
    writeU16(script, offset, QL_EVENT_GFX_CHANGE);
  writeU16(script, offset + 2, action.duration);
  writeRaw4(script, r6, action.data.raw);
  return r6 + 4;
};

export const QL_LoadAction_MovementOrGfxChange = (
  script: readonly number[],
  offset: number,
  action: QuestLogAction,
  start: number,
  end: number
): number | null => {
  const r6 = offset + 4;
  const eventId = readU16(script, offset);

  if (!QL_IsRoomToSaveAction(offset, sQuestLogEventCmdSizes[QL_EVENT_MOVEMENT], start, end))
    return null;
  if (eventId === QL_EVENT_MOVEMENT)
    action.type = QL_ACTION_MOVEMENT;
  else
    action.type = QL_ACTION_GFX_CHANGE;
  action.duration = readU16(script, offset + 2);
  action.data.raw = readRaw4(script, r6);
  return r6 + 4;
};

export const RecordEventHeader = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  dest: number,
  start: number,
  end: number
): number | null => {
  let cmdSize: number;
  let record: number;
  let count: number;
  const tracker = runtime.gQuestLogRepeatEventTracker;

  if (tracker.numRepeats === 0)
    cmdSize = sQuestLogEventCmdSizes[eventId];
  else
    cmdSize = sQuestLogEventCmdSizes[eventId] - CMD_HEADER_SIZE;

  if (!QL_IsRoomToSaveEvent(dest, cmdSize, start, end))
    return null;

  record = dest;

  if (tracker.numRepeats !== 0)
    record = record - (tracker.numRepeats * cmdSize + CMD_HEADER_SIZE);

  if (tracker.numRepeats === MAX_CMD_REPEAT + 1) {
    for (let i = 0; i < MAX_CMD_REPEAT; i++) {
      for (let j = 0; j < cmdSize; j++)
        script[record + i * cmdSize + CMD_HEADER_SIZE + j] = script[record + (i + 1) * cmdSize + CMD_HEADER_SIZE + j] ?? 0;
    }
    count = MAX_CMD_REPEAT;
  } else {
    count = tracker.numRepeats;
  }

  writeU16(script, record, eventId + (count << QL_CMD_COUNT_SHIFT));
  writeU16(script, record + 2, runtime.gQuestLogCurActionIdx);

  record = record + count * cmdSize + CMD_HEADER_SIZE;
  return record;
};

export const LoadEventPayloadOffset = (
  runtime: QuestLogEventsRuntime,
  eventId: number,
  eventData: number
): number => eventData + runtime.gQuestLogRepeatEventTracker.counter * (sQuestLogEventCmdSizes[eventId] - CMD_HEADER_SIZE) + CMD_HEADER_SIZE;

export interface QuestLogEventItem {
  itemId: number;
  species: number;
  itemParam?: number;
}

export interface QuestLogEventSwappedHeldItem {
  takenItemId: number;
  givenItemId: number;
  species: number;
}

export interface QuestLogEventTraded {
  speciesSent: number;
  speciesReceived: number;
  partnerName: string | readonly number[];
}

export interface QuestLogEventLinkBattle {
  outcome: number;
  playerNames: Array<string | readonly number[]>;
}

export interface QuestLogEventMovedBoxMon {
  species1: number;
  species2: number;
  box1: number;
  box2: number;
}

export interface QuestLogEventTrainerBattle {
  speciesOpponent: number;
  speciesPlayer: number;
  trainerId: number;
  mapSec: number;
  hpFractionId: number;
}

export interface QuestLogEventWildBattle {
  defeatedSpecies: number;
  caughtSpecies: number;
  mapSec: number;
}

export interface QuestLogEventDeparted {
  mapSec: number;
  locationId: number;
}

export interface QuestLogEventFieldMove {
  species: number;
  fieldMove: number;
  mapSec: number;
}

export interface QuestLogEventShop {
  lastItemId: number;
  itemQuantity: number;
  totalMoney: number;
  mapSec: number;
  hasMultipleTransactions: number | boolean;
}

export interface QuestLogEventStoryItem {
  itemId: number;
  mapSec: number;
}

export interface QuestLogUsedItemLoadContext {
  itemPocketById: (itemId: number) => number;
  itemToMoveId: (itemId: number) => number;
}

export interface QuestLogTrainerLoadContext {
  trainerClassById: (trainerId: number) => number;
}

export interface QuestLogDepartedLoadContext {
  flagGet: (flagId: number) => boolean;
}

export type QuestLogEventPayload =
  | { species1: number; species2: number }
  | QuestLogEventItem
  | QuestLogEventSwappedHeldItem
  | QuestLogEventTraded
  | QuestLogEventLinkBattle
  | QuestLogEventMovedBoxMon
  | readonly number[]
  | QuestLogEventTrainerBattle
  | QuestLogEventWildBattle
  | QuestLogEventDeparted
  | QuestLogEventFieldMove
  | QuestLogEventShop
  | QuestLogEventStoryItem
  | number
  | null;

const partnerNameBytes = (name: string | readonly number[]): number[] =>
  typeof name === 'string' ? textBytes(name) : Array.from({ length: PLAYER_NAME_LENGTH }, (_, i) => name[i] ?? 0xff);

const recordPayloadHeader = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  dest: number,
  start: number,
  end: number
): number | null => RecordEventHeader(runtime, script, eventId, dest, start, end);

export const RecordEvent_SwitchedPartyOrder = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: { species1: number; species2: number },
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, QL_EVENT_SWITCHED_PARTY_ORDER, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, data.species1);
  writeU16(script, record + 2, data.species2);
  return record + 4;
};

export const LoadEvent_SwitchedPartyOrder = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number
): number => {
  const record = LoadEventPayloadOffset(runtime, QL_EVENT_SWITCHED_PARTY_ORDER, eventData);
  setLoadedText(runtime, 'SwitchMon1WithMon2', [
    QuestLog_GetSpeciesName(runtime, readU16(script, record), 0, 0),
    QuestLog_GetSpeciesName(runtime, readU16(script, record + 2), 1, 0)
  ]);
  return record + 4;
};

export const RecordEvent_UsedItem = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: QuestLogEventItem,
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, QL_EVENT_USED_ITEM, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, data.itemId);
  writeU16(script, record + 2, data.species);
  writeU16(script, record + 4, data.itemParam ?? 0xffff);
  if (data.itemId === ITEM_ESCAPE_ROPE)
    runtime.sStepRecordingMode = STEP_RECORDING_MODE_DISABLED_UNTIL_DEPART;
  return record + 6;
};

export const LoadEvent_UsedItem = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number,
  context: QuestLogUsedItemLoadContext = {
    itemPocketById: () => POCKET_ITEMS,
    itemToMoveId: (itemId) => itemId
  }
): number => {
  const record = LoadEventPayloadOffset(runtime, QL_EVENT_USED_ITEM, eventData);
  const itemId = readU16(script, record);
  const species = readU16(script, record + 2);
  const itemParam = readU16(script, record + 4);
  switch (context.itemPocketById(itemId)) {
    case POCKET_ITEMS:
    case POCKET_POKE_BALLS:
    case POCKET_BERRY_POUCH:
      if (itemId === ITEM_ESCAPE_ROPE) {
        setLoadedText(runtime, 'UsedEscapeRope', [`ITEM_${itemId}`, `MAPSEC_${itemParam & 0xff}`]);
      } else if (species !== 0xffff) {
        setLoadedText(runtime, 'UsedItemOnMonAtThisLocation', [`ITEM_${itemId}`, QuestLog_GetSpeciesName(runtime, species, 1, 0)]);
      } else {
        setLoadedText(runtime, 'UsedTheItem', [`ITEM_${itemId}`]);
      }
      break;
    case POCKET_KEY_ITEMS:
      setLoadedText(runtime, 'UsedTheKeyItem', [`ITEM_${itemId}`]);
      break;
    case POCKET_TM_CASE:
      if (itemParam !== 0xffff) {
        setLoadedText(runtime, itemId >= ITEM_HM01 ? 'MonReplacedMoveWithHM' : 'MonReplacedMoveWithTM', [
          QuestLog_GetSpeciesName(runtime, species, 0, 0),
          `MOVE_${context.itemToMoveId(itemId)}`,
          `MOVE_${itemParam}`
        ]);
      } else {
        setLoadedText(runtime, itemId >= ITEM_HM01 ? 'MonLearnedMoveFromHM' : 'MonLearnedMoveFromTM', [
          QuestLog_GetSpeciesName(runtime, species, 0, 0),
          `MOVE_${context.itemToMoveId(itemId)}`
        ]);
      }
      break;
    default:
      setLoadedText(runtime, 'UsedItem', [`ITEM_${itemId}`, QuestLog_GetSpeciesName(runtime, species, 1, 0), `${itemParam}`]);
      break;
  }
  return record + 6;
};

const RecordEvent_GiveTakeHeldItem = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  dest: number,
  data: QuestLogEventItem,
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, eventId, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, data.itemId);
  writeU16(script, record + 2, data.species);
  return record + 4;
};

export const RecordEvent_GaveHeldItemFromPartyMenu = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventItem, start: number, end: number): number | null =>
  RecordEvent_GiveTakeHeldItem(runtime, script, QL_EVENT_GAVE_HELD_ITEM, dest, data, start, end);
export const RecordEvent_GaveHeldItemFromBagMenu = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventItem, start: number, end: number): number | null =>
  RecordEvent_GiveTakeHeldItem(runtime, script, QL_EVENT_GAVE_HELD_ITEM_BAG, dest, data, start, end);
export const RecordEvent_GaveHeldItemFromPC = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventItem, start: number, end: number): number | null =>
  RecordEvent_GiveTakeHeldItem(runtime, script, QL_EVENT_GAVE_HELD_ITEM_PC, dest, data, start, end);
export const RecordEvent_TookHeldItem = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventItem, start: number, end: number): number | null =>
  RecordEvent_GiveTakeHeldItem(runtime, script, QL_EVENT_TOOK_HELD_ITEM, dest, data, start, end);

export const LoadEvent_GiveTakeHeldItem = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number,
  eventId: number,
  label: string
): number => {
  const record = LoadEventPayloadOffset(runtime, eventId, eventData);
  const itemId = readU16(script, record);
  const species = readU16(script, record + 2);
  const vars = eventId === QL_EVENT_GAVE_HELD_ITEM_PC
    ? [`ITEM_${itemId}`, QuestLog_GetSpeciesName(runtime, species, 1, 0)]
    : [QuestLog_GetSpeciesName(runtime, species, 0, 0), `ITEM_${itemId}`];
  setLoadedText(runtime, label, vars);
  return record + 4;
};

const RecordEvent_SwappedHeldItem = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  dest: number,
  data: QuestLogEventSwappedHeldItem,
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, eventId, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, data.takenItemId);
  writeU16(script, record + 2, data.givenItemId);
  writeU16(script, record + 4, data.species);
  return record + 6;
};

export const RecordEvent_SwappedHeldItemFromBag = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventSwappedHeldItem, start: number, end: number): number | null =>
  RecordEvent_SwappedHeldItem(runtime, script, QL_EVENT_SWAPPED_HELD_ITEM, dest, data, start, end);
export const RecordEvent_SwappedHeldItemFromPC = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventSwappedHeldItem, start: number, end: number): number | null =>
  RecordEvent_SwappedHeldItem(runtime, script, QL_EVENT_SWAPPED_HELD_ITEM_PC, dest, data, start, end);

export const LoadEvent_SwappedHeldItem = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number,
  eventId = QL_EVENT_SWAPPED_HELD_ITEM
): number => {
  const record = LoadEventPayloadOffset(runtime, eventId, eventData);
  const takenItemId = readU16(script, record);
  const givenItemId = readU16(script, record + 2);
  const species = readU16(script, record + 4);
  if (eventId === QL_EVENT_SWAPPED_HELD_ITEM) {
    setLoadedText(runtime, 'SwappedHeldItemsOnMon', [
      QuestLog_GetSpeciesName(runtime, species, 0, 0),
      `ITEM_${takenItemId}`,
      `ITEM_${givenItemId}`
    ]);
  } else {
    setLoadedText(runtime, 'SwappedHeldItemFromPC', [
      `ITEM_${givenItemId}`,
      QuestLog_GetSpeciesName(runtime, species, 1, 0),
      `ITEM_${takenItemId}`
    ]);
  }
  return record + 6;
};

export const RecordEvent_UsedPkmnCenter = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  start: number,
  end: number
): number | null => {
  if (runtime.gQuestLogRepeatEventTracker.id === QL_EVENT_USED_PKMN_CENTER && runtime.gQuestLogRepeatEventTracker.numRepeats !== 0)
    return dest;
  if (!QL_IsRoomToSaveEvent(dest, sQuestLogEventCmdSizes[QL_EVENT_USED_PKMN_CENTER], start, end))
    return null;
  writeU16(script, dest, QL_EVENT_USED_PKMN_CENTER);
  writeU16(script, dest + 2, runtime.gQuestLogCurActionIdx);
  return dest + 4;
};

export const LoadEvent_UsedPkmnCenter = (runtime: QuestLogEventsRuntime, _script: readonly number[], eventData: number): number => {
  setLoadedText(runtime, 'MonsWereFullyRestoredAtCenter');
  return eventData + 4;
};

export const RecordEvent_LinkTraded = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: QuestLogEventTraded
): number => {
  writeU16(script, dest, QL_EVENT_LINK_TRADED);
  writeU16(script, dest + 2, runtime.gQuestLogCurActionIdx);
  writeU16(script, dest + 4, data.speciesSent);
  writeU16(script, dest + 6, data.speciesReceived);
  writeBytes(script, dest + 8, partnerNameBytes(data.partnerName));
  return dest + 16;
};

export const LoadEvent_LinkTraded = (runtime: QuestLogEventsRuntime, script: readonly number[], eventData: number): number => {
  const nameBytes = readBytes(script, eventData + 8, PLAYER_NAME_LENGTH);
  TranslateLinkPartnersName(nameBytes);
  const name = textFromBytes(nameBytes);
  setLoadedText(runtime, 'TradedMon1ForPersonsMon2', [
    name,
    QuestLog_GetSpeciesName(runtime, readU16(script, eventData + 6), 1, 0),
    QuestLog_GetSpeciesName(runtime, readU16(script, eventData + 4), 2, 0)
  ]);
  return eventData + 16;
};

const RecordEvent_LinkBattled = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  dest: number,
  data: QuestLogEventLinkBattle,
  playerNameCount: number
): number => {
  writeU16(script, dest, eventId);
  writeU16(script, dest + 2, runtime.gQuestLogCurActionIdx);
  setByte(script, dest + 4, data.outcome);
  for (let i = 0; i < playerNameCount; i += 1)
    writeBytes(script, dest + 5 + i * PLAYER_NAME_LENGTH, partnerNameBytes(data.playerNames[i] ?? ''));
  return dest + 5 + playerNameCount * PLAYER_NAME_LENGTH;
};

export const RecordEvent_LinkBattledSingle = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventLinkBattle): number =>
  RecordEvent_LinkBattled(runtime, script, QL_EVENT_LINK_BATTLED_SINGLE, dest, data, 1);
export const RecordEvent_LinkBattledDouble = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventLinkBattle): number =>
  RecordEvent_LinkBattled(runtime, script, QL_EVENT_LINK_BATTLED_DOUBLE, dest, data, 1);
export const RecordEvent_LinkBattledMulti = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventLinkBattle): number =>
  RecordEvent_LinkBattled(runtime, script, QL_EVENT_LINK_BATTLED_MULTI, dest, data, 3);

export const LoadEvent_LinkBattled = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number,
  eventId: number,
  playerNameCount: number
): number => {
  const outcome = getByte(script, eventData + 4);
  const names = Array.from({ length: playerNameCount }, (_, i) => {
    const nameBytes = readBytes(script, eventData + 5 + i * PLAYER_NAME_LENGTH, PLAYER_NAME_LENGTH);
    TranslateLinkPartnersName(nameBytes);
    return textFromBytes(nameBytes);
  });
  const label = eventId === QL_EVENT_LINK_BATTLED_SINGLE
    ? 'SingleBattleWithPersonResultedInOutcome'
    : eventId === QL_EVENT_LINK_BATTLED_DOUBLE
      ? 'DoubleBattleWithPersonResultedInOutcome'
      : eventId === QL_EVENT_LINK_BATTLED_MULTI
        ? 'MultiBattleWithPeopleResultedInOutcome'
        : 'BattledTrainerEndedInOutcome';
  const vars = eventId === QL_EVENT_LINK_BATTLED_MULTI
    ? [runtime.playerName, ...names, `OUTCOME_${outcome}`]
    : [...names, `OUTCOME_${outcome}`];
  setLoadedText(runtime, label, vars);
  return eventData + 5 + playerNameCount * PLAYER_NAME_LENGTH;
};

export const RecordEvent_UsedUnionRoom = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number
): number => {
  writeU16(script, dest, QL_EVENT_USED_UNION_ROOM);
  writeU16(script, dest + 2, runtime.gQuestLogCurActionIdx);
  return dest + 4;
};

export const RecordEvent_UsedUnionRoomChat = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number
): number => {
  writeU16(script, dest, QL_EVENT_USED_UNION_ROOM_CHAT);
  writeU16(script, dest + 2, runtime.gQuestLogCurActionIdx);
  return dest + 4;
};

export const RecordEvent_LinkTradedUnionRoom = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: QuestLogEventTraded
): number => {
  writeU16(script, dest, QL_EVENT_LINK_TRADED_UNION);
  writeU16(script, dest + 2, runtime.gQuestLogCurActionIdx);
  writeU16(script, dest + 4, data.speciesSent);
  writeU16(script, dest + 6, data.speciesReceived);
  writeBytes(script, dest + 8, partnerNameBytes(data.partnerName));
  return dest + 16;
};

export const RecordEvent_LinkBattledUnionRoom = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: QuestLogEventLinkBattle
): number => RecordEvent_LinkBattled(runtime, script, QL_EVENT_LINK_BATTLED_UNION, dest, data, 1);

export const LoadEvent_LinkTradedUnionRoom = (runtime: QuestLogEventsRuntime, script: readonly number[], eventData: number): number => {
  const nameBytes = readBytes(script, eventData + 8, PLAYER_NAME_LENGTH);
  TranslateLinkPartnersName(nameBytes);
  const name = textFromBytes(nameBytes);
  setLoadedText(runtime, 'TradedMon1ForTrainersMon2', [
    name,
    QuestLog_GetSpeciesName(runtime, readU16(script, eventData + 6), 1, 0),
    QuestLog_GetSpeciesName(runtime, readU16(script, eventData + 4), 2, 0)
  ]);
  return eventData + 16;
};

export const LoadEvent_UsedUnionRoom = (runtime: QuestLogEventsRuntime, _script: readonly number[], eventData: number): number => {
  setLoadedText(runtime, 'MingledInUnionRoom');
  return eventData + 4;
};

export const LoadEvent_UsedUnionRoomChat = (runtime: QuestLogEventsRuntime, _script: readonly number[], eventData: number): number => {
  setLoadedText(runtime, 'ChattedWithManyTrainers');
  return eventData + 4;
};

export const RecordEvent_SwitchedMonsBetweenBoxes = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: QuestLogEventMovedBoxMon,
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, QL_EVENT_SWITCHED_MONS_BETWEEN_BOXES, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, data.species1);
  writeU16(script, record + 2, data.species2);
  setByte(script, record + 4, data.box1);
  setByte(script, record + 5, data.box2);
  return record + 6;
};

export const RecordEvent_SwitchedMonsWithinBox = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  eventData: readonly number[],
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, QL_EVENT_SWITCHED_MONS_WITHIN_BOX, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, readU16(eventData, 0));
  writeU16(script, record + 2, readU16(eventData, 2));
  setByte(script, record + 4, getByte(eventData, 4));
  return record + 6;
};

export const RecordEvent_SwitchedPartyMonForPCMon = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  eventData: readonly number[],
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, QL_EVENT_SWITCHED_PARTY_MON_FOR_PC_MON, dest, start, end);
  if (record === null)
    return null;
  if (getByte(eventData, 4) === TOTAL_BOXES_COUNT) {
    writeU16(script, record, readU16(eventData, 2));
    writeU16(script, record + 2, readU16(eventData, 0));
    setByte(script, record + 4, getByte(eventData, 5));
  } else {
    writeU16(script, record, readU16(eventData, 0));
    writeU16(script, record + 2, readU16(eventData, 2));
    setByte(script, record + 4, getByte(eventData, 4));
  }
  return record + 6;
};

export const RecordEvent_MovedMonBetweenBoxes = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  eventData: readonly number[],
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, QL_EVENT_MOVED_MON_BETWEEN_BOXES, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, readU16(eventData, 0));
  setByte(script, record + 2, getByte(eventData, 4));
  setByte(script, record + 3, getByte(eventData, 5));
  return record + 4;
};

const RecordEvent_MonAndBoxByte = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  dest: number,
  eventData: readonly number[],
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, eventId, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, readU16(eventData, 0));
  setByte(script, record + 2, getByte(eventData, 4));
  return record + 4;
};

export const RecordEvent_MovedMonWithinBox = (runtime: QuestLogEventsRuntime, script: number[], dest: number, eventData: readonly number[], start: number, end: number): number | null =>
  RecordEvent_MonAndBoxByte(runtime, script, QL_EVENT_MOVED_MON_WITHIN_BOX, dest, eventData, start, end);
export const RecordEvent_WithdrewMonFromPC = (runtime: QuestLogEventsRuntime, script: number[], dest: number, eventData: readonly number[], start: number, end: number): number | null =>
  RecordEvent_MonAndBoxByte(runtime, script, QL_EVENT_WITHDREW_MON_PC, dest, eventData, start, end);
export const RecordEvent_DepositedMonInPC = (runtime: QuestLogEventsRuntime, script: number[], dest: number, eventData: readonly number[], start: number, end: number): number | null =>
  RecordEvent_MonAndBoxByte(runtime, script, QL_EVENT_DEPOSITED_MON_PC, dest, eventData, start, end);

export const RecordEvent_SwitchedMultipleMons = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  eventData: readonly number[],
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, QL_EVENT_SWITCHED_MULTIPLE_MONS, dest, start, end);
  if (record === null)
    return null;
  setByte(script, record, getByte(eventData, 4));
  setByte(script, record + 1, getByte(eventData, 5));
  return record + 2;
};

export const LoadEvent_BoxPayload = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number,
  eventId: number,
  payloadSize: number
): number => {
  const record = LoadEventPayloadOffset(runtime, eventId, eventData);
  const boxName = (box: number): string => `BOX_${box}`;
  switch (eventId) {
    case QL_EVENT_SWITCHED_MONS_BETWEEN_BOXES:
      setLoadedText(runtime, 'SwitchedMonsBetweenBoxes', [
        boxName(getByte(script, record + 4)),
        QuestLog_GetSpeciesName(runtime, readU16(script, record), 1, 0),
        boxName(getByte(script, record + 5)),
        QuestLog_GetSpeciesName(runtime, readU16(script, record + 2), 3, 0)
      ]);
      break;
    case QL_EVENT_SWITCHED_MONS_WITHIN_BOX:
      setLoadedText(runtime, 'SwitchedMonsWithinBox', [
        boxName(getByte(script, record + 4)),
        QuestLog_GetSpeciesName(runtime, readU16(script, record), 1, 0),
        QuestLog_GetSpeciesName(runtime, readU16(script, record + 2), 2, 0)
      ]);
      break;
    case QL_EVENT_SWITCHED_PARTY_MON_FOR_PC_MON:
      setLoadedText(runtime, 'SwitchedPartyMonForPCMon', [
        boxName(getByte(script, record + 4)),
        QuestLog_GetSpeciesName(runtime, readU16(script, record), 1, 0),
        QuestLog_GetSpeciesName(runtime, readU16(script, record + 2), 2, 0)
      ]);
      break;
    case QL_EVENT_MOVED_MON_BETWEEN_BOXES:
      setLoadedText(runtime, 'MovedMonToNewBox', [
        boxName(getByte(script, record + 2)),
        QuestLog_GetSpeciesName(runtime, readU16(script, record), 1, 0),
        boxName(getByte(script, record + 3))
      ]);
      break;
    case QL_EVENT_MOVED_MON_WITHIN_BOX:
      setLoadedText(runtime, 'MovedMonWithinBox', [
        boxName(getByte(script, record + 2)),
        QuestLog_GetSpeciesName(runtime, readU16(script, record), 1, 0)
      ]);
      break;
    case QL_EVENT_WITHDREW_MON_PC:
      setLoadedText(runtime, 'WithdrewMonFromPC', [
        boxName(getByte(script, record + 2)),
        QuestLog_GetSpeciesName(runtime, readU16(script, record), 1, 0)
      ]);
      break;
    case QL_EVENT_DEPOSITED_MON_PC:
      setLoadedText(runtime, 'DepositedMonInPC', [
        QuestLog_GetSpeciesName(runtime, readU16(script, record), 0, 0),
        boxName(getByte(script, record + 2))
      ]);
      break;
    case QL_EVENT_SWITCHED_MULTIPLE_MONS: {
      const box1 = getByte(script, record);
      const box2 = getByte(script, record + 1);
      setLoadedText(runtime, 'SwitchedMultipleMons', [
        boxName(box1),
        box1 === box2 ? 'ADifferentSpot' : boxName(box2)
      ]);
      break;
    }
    default:
      setLoadedText(runtime, `BoxEvent_${eventId}`, readBytes(script, record, payloadSize).map((byte) => `${byte}`));
      break;
  }
  return record + payloadSize;
};

const RecordEvent_ItemIdOnly = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  dest: number,
  data: QuestLogEventItem,
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, eventId, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, data.itemId);
  return record + 2;
};

export const RecordEvent_DepositedItemInPC = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventItem, start: number, end: number): number | null =>
  RecordEvent_ItemIdOnly(runtime, script, QL_EVENT_DEPOSITED_ITEM_PC, dest, data, start, end);
export const RecordEvent_WithdrewItemFromPC = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventItem, start: number, end: number): number | null =>
  RecordEvent_ItemIdOnly(runtime, script, QL_EVENT_WITHDREW_ITEM_PC, dest, data, start, end);

export const LoadEvent_ItemIdOnly = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number,
  eventId: number,
  label: string
): number => {
  const record = LoadEventPayloadOffset(runtime, eventId, eventData);
  setLoadedText(runtime, label, [`ITEM_${readU16(script, record)}`]);
  return record + 2;
};

const RecordEvent_DefeatedTrainer = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  dest: number,
  data: QuestLogEventTrainerBattle,
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, eventId, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, data.speciesOpponent);
  writeU16(script, record + 2, data.speciesPlayer);
  writeU16(script, record + 4, data.trainerId);
  setByte(script, record + 6, data.mapSec);
  setByte(script, record + 7, data.hpFractionId);
  return record + 8;
};

export const RecordEvent_DefeatedGymLeader = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventTrainerBattle, start: number, end: number): number | null => {
  runtime.sStepRecordingMode = STEP_RECORDING_MODE_DISABLED;
  return RecordEvent_DefeatedTrainer(runtime, script, QL_EVENT_DEFEATED_GYM_LEADER, dest, data, start, end);
};
export const RecordEvent_DefeatedEliteFourMember = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventTrainerBattle, start: number, end: number): number | null => {
  runtime.sStepRecordingMode = STEP_RECORDING_MODE_DISABLED;
  return RecordEvent_DefeatedTrainer(runtime, script, QL_EVENT_DEFEATED_E4_MEMBER, dest, data, start, end);
};
export const RecordEvent_DefeatedChampion = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: QuestLogEventTrainerBattle,
  start: number,
  end: number
): number | null => {
  if (!QL_IsRoomToSaveEvent(dest, sQuestLogEventCmdSizes[QL_EVENT_DEFEATED_CHAMPION], start, end))
    return null;
  writeU16(script, dest, QL_EVENT_DEFEATED_CHAMPION | (2 << QL_CMD_COUNT_SHIFT));
  writeU16(script, dest + 2, runtime.gQuestLogCurActionIdx);
  writeU16(script, dest + 4, data.speciesOpponent);
  writeU16(script, dest + 6, data.speciesPlayer);
  setByte(script, dest + 8, data.hpFractionId);
  runtime.sStepRecordingMode = STEP_RECORDING_MODE_DISABLED;
  return dest + 10;
};
export const RecordEvent_DefeatedNormalTrainer = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventTrainerBattle, start: number, end: number): number | null => {
  runtime.sStepRecordingMode = STEP_RECORDING_MODE_DISABLED;
  return RecordEvent_DefeatedTrainer(runtime, script, QL_EVENT_DEFEATED_TRAINER, dest, data, start, end);
};

export const LoadEvent_DefeatedTrainer = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number,
  eventId: number,
  label: string,
  context: QuestLogTrainerLoadContext = { trainerClassById: () => 0 }
): number => {
  const record = LoadEventPayloadOffset(runtime, eventId, eventData);
  const trainerId = readU16(script, record + 4);
  const trainerClass = context.trainerClassById(trainerId);
  const trainerName = (
    trainerClass === TRAINER_CLASS_RIVAL_EARLY
    || trainerClass === TRAINER_CLASS_RIVAL_LATE
    || trainerClass === TRAINER_CLASS_CHAMPION
  ) ? 'RIVAL' : `TRAINER_${trainerId}`;
  const finalLabel = eventId === QL_EVENT_DEFEATED_GYM_LEADER
    ? 'TookOnGymLeadersMonWithMonAndWon'
    : eventId === QL_EVENT_DEFEATED_E4_MEMBER
      ? 'TookOnEliteFoursMonWithMonAndWon'
      : 'TookOnTrainersMonWithMonAndWon';
  if (eventId === QL_EVENT_DEFEATED_E4_MEMBER) {
    setLoadedText(runtime, label, [
      trainerName,
      QuestLog_GetSpeciesName(runtime, readU16(script, record), 1, 0),
      QuestLog_GetSpeciesName(runtime, readU16(script, record + 2), 2, 0),
      `FLAVOR_${getByte(script, record + 7)}`
    ]);
  } else {
    setLoadedText(runtime, label, [
      `MAPSEC_${getByte(script, record + 6)}`,
      trainerName,
      QuestLog_GetSpeciesName(runtime, readU16(script, record), 2, 0),
      QuestLog_GetSpeciesName(runtime, readU16(script, record + 2), 3, 0),
      `FLAVOR_${getByte(script, record + 7)}`
    ]);
  }
  runtime.loadedEventText = finalLabel;
  return record + 8;
};

export const RecordEvent_DefeatedWildMon = (
  _runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: QuestLogEventWildBattle,
  start: number,
  end: number
): number | null => {
  if (!QL_IsRoomToSaveEvent(dest, sQuestLogEventCmdSizes[QL_EVENT_DEFEATED_WILD_MON], start, end))
    return null;
  const footer = dest + 8;
  if (getByte(script, footer) === 0 && getByte(script, footer + 1) === 0) {
    writeU16(script, dest, QL_EVENT_DEFEATED_WILD_MON);
    writeU16(script, dest + 2, _runtime.gQuestLogCurActionIdx);
  }
  if (data.defeatedSpecies !== SPECIES_NONE)
    writeU16(script, dest + 4, data.defeatedSpecies);
  if (data.caughtSpecies !== SPECIES_NONE)
    writeU16(script, dest + 6, data.caughtSpecies);
  if (data.defeatedSpecies !== SPECIES_NONE && getByte(script, footer) !== 0xff)
    setByte(script, footer, getByte(script, footer) + 1);
  if (data.caughtSpecies !== SPECIES_NONE && getByte(script, footer + 1) !== 0xff)
    setByte(script, footer + 1, getByte(script, footer + 1) + 1);
  setByte(script, footer + 2, data.mapSec);
  return footer + 4;
};

export const LoadEvent_DefeatedWildMon = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number
): number | null => {
  if (!QL_IsRoomToSaveEvent(eventData, sQuestLogEventCmdSizes[QL_EVENT_DEFEATED_WILD_MON], 0, script.length * 2))
    return null;
  const footer = eventData + 8;
  const defeatedCount = getByte(script, footer);
  const caughtCount = getByte(script, footer + 1);
  let label: string;
  if (defeatedCount === 0)
    label = caughtCount === 1 ? 'CaughtWildMon' : 'CaughtWildMons';
  else if (caughtCount === 0)
    label = defeatedCount === 1 ? 'DefeatedWildMon' : 'DefeatedWildMons';
  else if (defeatedCount === 1)
    label = caughtCount === 1 ? 'DefeatedWildMonAndCaughtWildMon' : 'DefeatedWildMonAndCaughtWildMons';
  else
    label = caughtCount === 1 ? 'DefeatedWildMonsAndCaughtWildMon' : 'DefeatedWildMonsAndCaughtWildMons';
  setLoadedText(runtime, label, [
    `MAPSEC_${getByte(script, footer + 2)}`,
    QuestLog_GetSpeciesName(runtime, readU16(script, eventData + 4), 1, 0),
    `${defeatedCount}`,
    QuestLog_GetSpeciesName(runtime, readU16(script, eventData + 6), 3, 0),
    `${caughtCount}`,
    runtime.playerName
  ]);
  return footer + 4;
};

export const LoadEvent_DefeatedChampion = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number
): number | null => {
  if (!QL_IsRoomToSaveEvent(eventData, sQuestLogEventCmdSizes[QL_EVENT_DEFEATED_CHAMPION], 0, script.length * 2))
    return null;
  switch (runtime.gQuestLogRepeatEventTracker.counter) {
    case 0:
      setLoadedText(runtime, 'PlayerBattledChampionRival', [runtime.playerName, runtime.rivalName]);
      break;
    case 1:
      setLoadedText(runtime, 'PlayerSentOutMon1RivalSentOutMon2', [
        runtime.rivalName,
        QuestLog_GetSpeciesName(runtime, readU16(script, eventData + 4), 1, 0),
        runtime.playerName,
        QuestLog_GetSpeciesName(runtime, readU16(script, eventData + 6), 3, 0)
      ]);
      break;
    case 2:
      setLoadedText(runtime, 'WonTheMatchAsAResult', [`CHAMPION_FLAVOR_${getByte(script, eventData + 8)}`]);
      break;
  }
  return eventData + 10;
};

export const RecordEvent_DepartedLocation = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: QuestLogEventDeparted,
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, QL_EVENT_DEPARTED, dest, start, end);
  if (record === null)
    return null;
  setByte(script, record, data.mapSec);
  setByte(script, record + 1, data.locationId);
  if (data.locationId === QL_LOCATION_SAFARI_ZONE)
    runtime.sStepRecordingMode = STEP_RECORDING_MODE_DISABLED;
  return record + 2;
};

export const LoadEvent_DepartedLocation = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number,
  context: QuestLogDepartedLoadContext = { flagGet: () => false }
): number => {
  const record = LoadEventPayloadOffset(runtime, QL_EVENT_DEPARTED, eventData);
  const mapSec = getByte(script, record);
  const locationId = getByte(script, record + 1);
  const departedTextId = sLocationToDepartedTextId[locationId] ?? QL_DEPARTED_MISC_BUILDING_1;
  let label: string = sDepartedLocationTextLabels[departedTextId] ?? 'DepartedTheLocationForNextDestination';
  if (departedTextId === QL_DEPARTED_GYM) {
    let foundGym = false;
    for (let i = 0; i < sGymCityMapSecs.length; i += 1) {
      if (mapSec !== sGymCityMapSecs[i])
        continue;
      foundGym = true;
      label = context.flagGet(i) ? 'DepartedGym' : 'GymWasFullOfToughTrainers';
      break;
    }
    if (!foundGym)
      label = sDepartedLocationTextLabels[departedTextId];
  }
  setLoadedText(runtime, label, [`MAPSEC_${mapSec}`, `QL_LOCATION_${locationId}`]);
  return record + 2;
};

export const SetQLPlayedTheSlots = (runtime: QuestLogEventsRuntime): void => {
  runtime.sPlayedTheSlots = true;
};

export const ShouldRegisterEvent_HandleDeparted = (
  runtime: QuestLogEventsRuntime,
  eventId: number,
  data: QuestLogEventDeparted
): boolean => {
  if (eventId !== QL_EVENT_DEPARTED) {
    runtime.sLastDepartedLocation = 0;
    return true;
  }
  if (runtime.sLastDepartedLocation === data.locationId + 1)
    return false;
  runtime.sLastDepartedLocation = data.locationId + 1;
  return true;
};

export const ShouldRegisterEvent_DepartedGameCorner = (
  runtime: QuestLogEventsRuntime,
  eventId: number,
  data: QuestLogEventDeparted
): boolean => {
  if (eventId !== QL_EVENT_DEPARTED)
    return true;
  if (data.locationId === QL_LOCATION_GAME_CORNER && !runtime.sPlayedTheSlots)
    return false;
  runtime.sPlayedTheSlots = false;
  return true;
};

export const RecordEvent_UsedFieldMove = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: QuestLogEventFieldMove,
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, QL_EVENT_USED_FIELD_MOVE, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, data.species);
  setByte(script, record + 2, data.fieldMove);
  setByte(script, record + 3, data.mapSec);
  runtime.sStepRecordingMode = data.fieldMove === FIELD_MOVE_TELEPORT || data.fieldMove === FIELD_MOVE_DIG
    ? STEP_RECORDING_MODE_DISABLED_UNTIL_DEPART
    : STEP_RECORDING_MODE_DISABLED;
  return record + 4;
};

export const LoadEvent_UsedFieldMove = (runtime: QuestLogEventsRuntime, script: readonly number[], eventData: number): number => {
  const record = LoadEventPayloadOffset(runtime, QL_EVENT_USED_FIELD_MOVE, eventData);
  const fieldMove = getByte(script, record + 2);
  const mapSec = getByte(script, record + 3);
  setLoadedText(runtime, sUsedFieldMoveTextLabels[fieldMove] ?? 'UsedFieldMove', [
    QuestLog_GetSpeciesName(runtime, readU16(script, record), 0, 0),
    mapSec === 0xff ? '' : `MAPSEC_${mapSec}`,
    fieldMove === FIELD_MOVE_TELEPORT ? (mapSec === MAPSEC_PALLET_TOWN ? 'Home' : 'PokemonCenter') : ''
  ]);
  return record + 4;
};

const RecordEvent_Shop = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  dest: number,
  data: QuestLogEventShop,
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, eventId, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, data.lastItemId);
  writeU16(script, record + 2, data.itemQuantity);
  writeU16(script, record + 4, (data.totalMoney >>> 16) & 0xffff);
  writeU16(script, record + 6, data.totalMoney & 0xffff);
  setByte(script, record + 8, data.mapSec);
  setByte(script, record + 9, eventId === QL_EVENT_BOUGHT_ITEM ? 1 : Number(data.hasMultipleTransactions));
  return record + 10;
};

export const RecordEvent_BoughtItem = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventShop, start: number, end: number): number | null =>
  RecordEvent_Shop(runtime, script, QL_EVENT_BOUGHT_ITEM, dest, data, start, end);

export const RecordEvent_SoldItem = (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventShop, start: number, end: number): number | null =>
  RecordEvent_Shop(runtime, script, QL_EVENT_SOLD_ITEM, dest, data, start, end);

export const LoadEvent_Shop = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number,
  eventId: number,
  label: string
): number => {
  const record = LoadEventPayloadOffset(runtime, eventId, eventData);
  const quantity = readU16(script, record + 2);
  const totalMoney = ((readU16(script, record + 4) << 16) | readU16(script, record + 6)) >>> 0;
  const multi = getByte(script, record + 9);
  const finalLabel = eventId === QL_EVENT_BOUGHT_ITEM
    ? quantity < 2 ? 'BoughtItem' : 'BoughtItemsIncludingItem'
    : multi === 0 ? 'SoldNumOfItem' : 'SoldItemsIncludingItem';
  const mapName = `MAPSEC_${getByte(script, record + 8)}`;
  const itemName = `ITEM_${readU16(script, record)}`;
  if (eventId === QL_EVENT_BOUGHT_ITEM) {
    setLoadedText(runtime, label, quantity < 2 ? [mapName, itemName] : [mapName, itemName, `${totalMoney}`]);
  } else if (multi === 0) {
    setLoadedText(runtime, label, [
      runtime.playerName,
      mapName,
      itemName,
      quantity === 1 ? 'JustOne' : `Num_${quantity}`
    ]);
  } else {
    setLoadedText(runtime, label, [mapName, itemName, `${totalMoney}`]);
  }
  runtime.loadedEventText = finalLabel;
  return record + 10;
};

export const RecordEvent_ObtainedStoryItem = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: QuestLogEventStoryItem,
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, QL_EVENT_OBTAINED_STORY_ITEM, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, data.itemId);
  setByte(script, record + 2, data.mapSec);
  return record + 4;
};

export const LoadEvent_ObtainedStoryItem = (runtime: QuestLogEventsRuntime, script: readonly number[], eventData: number): number => {
  const record = LoadEventPayloadOffset(runtime, QL_EVENT_OBTAINED_STORY_ITEM, eventData);
  setLoadedText(runtime, 'ObtainedStoryItem', [`MAPSEC_${getByte(script, record + 2)}`, `ITEM_${readU16(script, record)}`]);
  return record + 4;
};

export const QuestLog_RecordEnteredMap = (
  runtime: QuestLogEventsRuntime,
  worldMapFlag: number,
  getFlag: (flag: number) => boolean,
  worldMapFlags: readonly number[],
  questLogState = 0
): void => {
  if (questLogState === QL_STATE_PLAYBACK || questLogState === QL_STATE_PLAYBACK_LAST)
    return;
  for (let i = 0; i < worldMapFlags.length; i += 1) {
    if (worldMapFlag === worldMapFlags[i]) {
      runtime.sNewlyEnteredMap = !getFlag(worldMapFlag);
      break;
    }
  }
};

export const RecordEvent_ArrivedInLocation = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  mapSec: number,
  start: number,
  end: number
): number | null => {
  const record = recordPayloadHeader(runtime, script, QL_EVENT_ARRIVED, dest, start, end);
  if (record === null)
    return null;
  writeU16(script, record, mapSec);
  return record + 2;
};

export const LoadEvent_ArrivedInLocation = (runtime: QuestLogEventsRuntime, script: readonly number[], eventData: number): number => {
  const record = LoadEventPayloadOffset(runtime, QL_EVENT_ARRIVED, eventData);
  setLoadedText(runtime, 'ArrivedInLocation', [`MAPSEC_${readU16(script, record)}`]);
  return record + 2;
};

export const SetQuestLogEvent_Arrived = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  mapSec: number,
  context: SetQuestLogEventContext
): number | null => {
  if (context.questLogState !== QL_STATE_PLAYBACK && context.questLogState !== QL_STATE_PLAYBACK_LAST) {
    if (runtime.sNewlyEnteredMap) {
      const result = SetQuestLogEvent(runtime, script, QL_EVENT_ARRIVED, mapSec, context);
      runtime.sNewlyEnteredMap = false;
      return result;
    }
  }
  return runtime.gQuestLogRecordingPointer;
};

export const IsLinkQuestLogEvent = (eventId: number): boolean =>
  eventId >= QL_EVENT_LINK_TRADED && eventId <= QL_EVENT_LINK_BATTLED_UNION;

const cloneDeferredData = (data: QuestLogEventPayload): QuestLogEventPayload => {
  if (Array.isArray(data))
    return data.slice();
  if (data && typeof data === 'object') {
    if ('playerNames' in data)
      return { ...data, playerNames: data.playerNames.map((name) => Array.isArray(name) ? name.slice() : name) };
    if ('partnerName' in data)
      return { ...data, partnerName: Array.isArray(data.partnerName) ? data.partnerName.slice() : data.partnerName };
    return { ...data };
  }
  return data;
};

export const ResetDeferredLinkEvent = (runtime: QuestLogEventsRuntime): void => {
  runtime.sDeferredEvent = { id: 0, data: null };
};

export const QL_EnableRecordingSteps = (runtime: QuestLogEventsRuntime): void => {
  runtime.sStepRecordingMode = STEP_RECORDING_MODE_ENABLED;
};

export const QL_StartRecordingAction = (runtime: QuestLogEventsRuntime, eventId: number): void => {
  runtime.recordedActions.push(eventId);
};

export const QL_FinishRecordingScene = (runtime: QuestLogEventsRuntime): void => {
  runtime.finishedRecordingScenes += 1;
};

export const QuestLog_CutRecording = (runtime: QuestLogEventsRuntime): void => {
  runtime.cutRecordingScenes += 1;
};

export const InQuestLogDisabledLocation = (location: QuestLogMapLocation): boolean => {
  if (
    location.mapGroup === MAP_GROUP_TRAINER_TOWER
    && location.mapNum >= MAP_NUM_TRAINER_TOWER_1F
    && location.mapNum <= MAP_NUM_TRAINER_TOWER_ELEVATOR
  )
    return true;

  if (
    location.mapGroup === MAP_GROUP_SAFFRON_CITY
    && location.mapNum === MAP_NUM_SAFFRON_CITY_POKEMON_TRAINER_FAN_CLUB
  )
    return true;

  if (
    location.mapGroup === MAP_GROUP_SEVEN_ISLAND_HOUSE
    && (
      location.mapNum === MAP_NUM_SEVEN_ISLAND_HOUSE_ROOM1
      || location.mapNum === MAP_NUM_SEVEN_ISLAND_HOUSE_ROOM2
    )
  )
    return true;

  if (
    (location.mapGroup === MAP_GROUP_ROCKET_HIDEOUT && location.mapNum === MAP_NUM_ROCKET_HIDEOUT_ELEVATOR)
    || (location.mapGroup === MAP_GROUP_SILPH_CO && location.mapNum === MAP_NUM_SILPH_CO_ELEVATOR)
    || (location.mapGroup === MAP_GROUP_TRAINER_TOWER && location.mapNum === MAP_NUM_TRAINER_TOWER_ELEVATOR)
    || (location.mapGroup === MAP_GROUP_CELADON_CITY_DEPT_STORE && location.mapNum === MAP_NUM_CELADON_CITY_DEPARTMENT_STORE_ELEVATOR)
  )
    return true;

  return false;
};

export const QuestLog_ShouldEndSceneOnMapChange = (
  runtime: QuestLogEventsRuntime,
  location: QuestLogMapLocation,
  questLogState: number
): boolean => {
  if (!InQuestLogDisabledLocation(location))
    return false;
  if (questLogState === QL_STATE_PLAYBACK)
    return true;
  if (questLogState === QL_STATE_RECORDING)
    QuestLog_CutRecording(runtime);
  return false;
};

export const IsSpeciesFromSpecialEncounter = (species: number): boolean => {
  switch (species) {
    case SPECIES_SNORLAX:
    case SPECIES_ARTICUNO:
    case SPECIES_ZAPDOS:
    case SPECIES_MOLTRES:
    case SPECIES_MEWTWO:
    case SPECIES_LUGIA:
    case SPECIES_HO_OH:
    case SPECIES_DEOXYS:
      return true;
  }
  return false;
};

export const IsEventWithSpecialEncounterSpecies = (eventId: number, data: QuestLogEventWildBattle): boolean => {
  if (eventId !== QL_EVENT_DEFEATED_WILD_MON)
    return false;
  if (IsSpeciesFromSpecialEncounter(data.defeatedSpecies))
    return true;
  if (IsSpeciesFromSpecialEncounter(data.caughtSpecies))
    return true;
  return false;
};

export const ShouldRegisterEvent_HandleBeatStoryTrainer = (
  eventId: number,
  data: QuestLogEventTrainerBattle,
  trainerClassById: (trainerId: number) => number
): boolean => {
  if (eventId === QL_EVENT_DEFEATED_TRAINER) {
    const trainerClass = trainerClassById(data.trainerId);
    if (
      trainerClass === TRAINER_CLASS_RIVAL_EARLY
      || trainerClass === TRAINER_CLASS_RIVAL_LATE
      || trainerClass === TRAINER_CLASS_CHAMPION
      || trainerClass === TRAINER_CLASS_BOSS
    )
      return false;
    return true;
  }
  return false;
};

export const ShouldRegisterEvent_HandlePartyActions = (
  eventId: number,
  data: QuestLogEventTrainerBattle | null,
  flags: { gameClear: boolean; canLinkWithRs: boolean },
  trainerClassById: (trainerId: number) => number = () => 0
): boolean => {
  if (eventId === QL_EVENT_USED_FIELD_MOVE || eventId === QL_EVENT_USED_PKMN_CENTER)
    return true;

  if (!flags.gameClear) {
    if (
      eventId === QL_EVENT_SWITCHED_PARTY_ORDER
      || eventId === QL_EVENT_DEFEATED_WILD_MON
      || (data !== null && ShouldRegisterEvent_HandleBeatStoryTrainer(eventId, data, trainerClassById))
    )
      return true;
  }

  if (!flags.canLinkWithRs) {
    if (
      eventId === QL_EVENT_USED_ITEM
      || eventId === QL_EVENT_GAVE_HELD_ITEM
      || eventId === QL_EVENT_GAVE_HELD_ITEM_BAG
      || eventId === QL_EVENT_GAVE_HELD_ITEM_PC
      || eventId === QL_EVENT_TOOK_HELD_ITEM
      || eventId === QL_EVENT_SWAPPED_HELD_ITEM
      || eventId === QL_EVENT_SWAPPED_HELD_ITEM_PC
      || eventId === QL_EVENT_SWITCHED_PARTY_MON_FOR_PC_MON
      || eventId === QL_EVENT_WITHDREW_MON_PC
      || eventId === QL_EVENT_DEPOSITED_MON_PC
    )
      return true;
  }

  return false;
};

export const TryDeferLinkEvent = (
  runtime: QuestLogEventsRuntime,
  eventId: number,
  data: QuestLogEventPayload
): boolean => {
  if (!IsLinkQuestLogEvent(eventId))
    return false;

  ResetDeferredLinkEvent(runtime);
  runtime.sDeferredEvent.id = eventId;

  if (eventId !== QL_EVENT_USED_UNION_ROOM && eventId !== QL_EVENT_USED_UNION_ROOM_CHAT)
    runtime.sDeferredEvent.data = cloneDeferredData(data);
  return true;
};

export const TryDeferTrainerBattleEvent = (
  runtime: QuestLogEventsRuntime,
  eventId: number,
  data: QuestLogEventTrainerBattle,
  playbackState: number,
  gameClear: boolean,
  trainerClassById: (trainerId: number) => number
): boolean => {
  if (
    eventId !== QL_EVENT_DEFEATED_TRAINER
    && eventId !== QL_EVENT_DEFEATED_GYM_LEADER
    && eventId !== QL_EVENT_DEFEATED_E4_MEMBER
    && eventId !== QL_EVENT_DEFEATED_CHAMPION
  )
    return false;

  ResetDeferredLinkEvent(runtime);
  if (playbackState !== QL_PLAYBACK_STATE_STOPPED || gameClear || !ShouldRegisterEvent_HandleBeatStoryTrainer(eventId, data, trainerClassById)) {
    runtime.sDeferredEvent.id = eventId;
    runtime.sDeferredEvent.data = cloneDeferredData(data);
  }
  return true;
};

export type QuestLogRecordEventFunc = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  dest: number,
  data: QuestLogEventPayload,
  start: number,
  end: number
) => number | null;

export const sRecordEventFuncs: Array<QuestLogRecordEventFunc | null> = Object.assign<
  Array<QuestLogRecordEventFunc | null>,
  Record<number, QuestLogRecordEventFunc | null>
>(Array(QL_EVENT_ARRIVED + 1).fill(null), {
  [QL_EVENT_INPUT]: null,
  [QL_EVENT_GFX_CHANGE]: null,
  [QL_EVENT_MOVEMENT]: null,
  [QL_EVENT_SWITCHED_PARTY_ORDER]: (runtime: QuestLogEventsRuntime, script: number[], dest: number, data: QuestLogEventPayload, start: number, end: number) => RecordEvent_SwitchedPartyOrder(runtime, script, dest, data as { species1: number; species2: number }, start, end),
  [QL_EVENT_USED_ITEM]: (runtime, script, dest, data, start, end) => RecordEvent_UsedItem(runtime, script, dest, data as QuestLogEventItem, start, end),
  [QL_EVENT_GAVE_HELD_ITEM]: (runtime, script, dest, data, start, end) => RecordEvent_GaveHeldItemFromPartyMenu(runtime, script, dest, data as QuestLogEventItem, start, end),
  [QL_EVENT_GAVE_HELD_ITEM_BAG]: (runtime, script, dest, data, start, end) => RecordEvent_GaveHeldItemFromBagMenu(runtime, script, dest, data as QuestLogEventItem, start, end),
  [QL_EVENT_GAVE_HELD_ITEM_PC]: (runtime, script, dest, data, start, end) => RecordEvent_GaveHeldItemFromPC(runtime, script, dest, data as QuestLogEventItem, start, end),
  [QL_EVENT_TOOK_HELD_ITEM]: (runtime, script, dest, data, start, end) => RecordEvent_TookHeldItem(runtime, script, dest, data as QuestLogEventItem, start, end),
  [QL_EVENT_SWAPPED_HELD_ITEM]: (runtime, script, dest, data, start, end) => RecordEvent_SwappedHeldItemFromBag(runtime, script, dest, data as QuestLogEventSwappedHeldItem, start, end),
  [QL_EVENT_SWAPPED_HELD_ITEM_PC]: (runtime, script, dest, data, start, end) => RecordEvent_SwappedHeldItemFromPC(runtime, script, dest, data as QuestLogEventSwappedHeldItem, start, end),
  [QL_EVENT_USED_PKMN_CENTER]: (runtime, script, dest, _data, start, end) => RecordEvent_UsedPkmnCenter(runtime, script, dest, start, end),
  [QL_EVENT_LINK_TRADED]: (runtime, script, dest, data) => RecordEvent_LinkTraded(runtime, script, dest, data as QuestLogEventTraded),
  [QL_EVENT_LINK_BATTLED_SINGLE]: (runtime, script, dest, data) => RecordEvent_LinkBattledSingle(runtime, script, dest, data as QuestLogEventLinkBattle),
  [QL_EVENT_LINK_BATTLED_DOUBLE]: (runtime, script, dest, data) => RecordEvent_LinkBattledDouble(runtime, script, dest, data as QuestLogEventLinkBattle),
  [QL_EVENT_LINK_BATTLED_MULTI]: (runtime, script, dest, data) => RecordEvent_LinkBattledMulti(runtime, script, dest, data as QuestLogEventLinkBattle),
  [QL_EVENT_USED_UNION_ROOM]: (runtime, script, dest) => RecordEvent_UsedUnionRoom(runtime, script, dest),
  [QL_EVENT_USED_UNION_ROOM_CHAT]: (runtime, script, dest) => RecordEvent_UsedUnionRoomChat(runtime, script, dest),
  [QL_EVENT_LINK_TRADED_UNION]: (runtime, script, dest, data) => RecordEvent_LinkTradedUnionRoom(runtime, script, dest, data as QuestLogEventTraded),
  [QL_EVENT_LINK_BATTLED_UNION]: (runtime, script, dest, data) => RecordEvent_LinkBattledUnionRoom(runtime, script, dest, data as QuestLogEventLinkBattle),
  [QL_EVENT_SWITCHED_MONS_BETWEEN_BOXES]: (runtime, script, dest, data, start, end) => RecordEvent_SwitchedMonsBetweenBoxes(runtime, script, dest, data as QuestLogEventMovedBoxMon, start, end),
  [QL_EVENT_SWITCHED_MONS_WITHIN_BOX]: (runtime, script, dest, data, start, end) => RecordEvent_SwitchedMonsWithinBox(runtime, script, dest, data as readonly number[], start, end),
  [QL_EVENT_SWITCHED_PARTY_MON_FOR_PC_MON]: (runtime, script, dest, data, start, end) => RecordEvent_SwitchedPartyMonForPCMon(runtime, script, dest, data as readonly number[], start, end),
  [QL_EVENT_MOVED_MON_BETWEEN_BOXES]: (runtime, script, dest, data, start, end) => RecordEvent_MovedMonBetweenBoxes(runtime, script, dest, data as readonly number[], start, end),
  [QL_EVENT_MOVED_MON_WITHIN_BOX]: (runtime, script, dest, data, start, end) => RecordEvent_MovedMonWithinBox(runtime, script, dest, data as readonly number[], start, end),
  [QL_EVENT_WITHDREW_MON_PC]: (runtime, script, dest, data, start, end) => RecordEvent_WithdrewMonFromPC(runtime, script, dest, data as readonly number[], start, end),
  [QL_EVENT_DEPOSITED_MON_PC]: (runtime, script, dest, data, start, end) => RecordEvent_DepositedMonInPC(runtime, script, dest, data as readonly number[], start, end),
  [QL_EVENT_SWITCHED_MULTIPLE_MONS]: (runtime, script, dest, data, start, end) => RecordEvent_SwitchedMultipleMons(runtime, script, dest, data as readonly number[], start, end),
  [QL_EVENT_DEPOSITED_ITEM_PC]: (runtime, script, dest, data, start, end) => RecordEvent_DepositedItemInPC(runtime, script, dest, data as QuestLogEventItem, start, end),
  [QL_EVENT_WITHDREW_ITEM_PC]: (runtime, script, dest, data, start, end) => RecordEvent_WithdrewItemFromPC(runtime, script, dest, data as QuestLogEventItem, start, end),
  [QL_EVENT_DEFEATED_GYM_LEADER]: (runtime, script, dest, data, start, end) => RecordEvent_DefeatedGymLeader(runtime, script, dest, data as QuestLogEventTrainerBattle, start, end),
  [QL_EVENT_DEFEATED_WILD_MON]: (runtime, script, dest, data, start, end) => RecordEvent_DefeatedWildMon(runtime, script, dest, data as QuestLogEventWildBattle, start, end),
  [QL_EVENT_DEFEATED_E4_MEMBER]: (runtime, script, dest, data, start, end) => RecordEvent_DefeatedEliteFourMember(runtime, script, dest, data as QuestLogEventTrainerBattle, start, end),
  [QL_EVENT_DEFEATED_CHAMPION]: (runtime, script, dest, data, start, end) => RecordEvent_DefeatedChampion(runtime, script, dest, data as QuestLogEventTrainerBattle, start, end),
  [QL_EVENT_DEFEATED_TRAINER]: (runtime, script, dest, data, start, end) => RecordEvent_DefeatedNormalTrainer(runtime, script, dest, data as QuestLogEventTrainerBattle, start, end),
  [QL_EVENT_DEPARTED]: (runtime, script, dest, data, start, end) => RecordEvent_DepartedLocation(runtime, script, dest, data as QuestLogEventDeparted, start, end),
  [QL_EVENT_USED_FIELD_MOVE]: (runtime, script, dest, data, start, end) => RecordEvent_UsedFieldMove(runtime, script, dest, data as QuestLogEventFieldMove, start, end),
  [QL_EVENT_BOUGHT_ITEM]: (runtime, script, dest, data, start, end) => RecordEvent_BoughtItem(runtime, script, dest, data as QuestLogEventShop, start, end),
  [QL_EVENT_SOLD_ITEM]: (runtime, script, dest, data, start, end) => RecordEvent_SoldItem(runtime, script, dest, data as QuestLogEventShop, start, end),
  [QL_EVENT_SCENE_END]: null,
  [QL_EVENT_OBTAINED_STORY_ITEM]: (runtime, script, dest, data, start, end) => RecordEvent_ObtainedStoryItem(runtime, script, dest, data as QuestLogEventStoryItem, start, end),
  [QL_EVENT_WAIT]: null,
  [QL_EVENT_ARRIVED]: (runtime, script, dest, data, start, end) => RecordEvent_ArrivedInLocation(runtime, script, dest, data as number, start, end)
});

export type QuestLogLoadEventFunc = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number
) => number | null;

export const sLoadEventFuncs: Array<QuestLogLoadEventFunc | null> = Object.assign<
  Array<QuestLogLoadEventFunc | null>,
  Record<number, QuestLogLoadEventFunc | null>
>(Array(QL_EVENT_ARRIVED + 1).fill(null), {
  [QL_EVENT_INPUT]: null,
  [QL_EVENT_GFX_CHANGE]: null,
  [QL_EVENT_MOVEMENT]: null,
  [QL_EVENT_SWITCHED_PARTY_ORDER]: LoadEvent_SwitchedPartyOrder,
  [QL_EVENT_USED_ITEM]: LoadEvent_UsedItem,
  [QL_EVENT_GAVE_HELD_ITEM]: (runtime, script, eventData) => LoadEvent_GiveTakeHeldItem(runtime, script, eventData, QL_EVENT_GAVE_HELD_ITEM, 'GaveMonHeldItem'),
  [QL_EVENT_GAVE_HELD_ITEM_BAG]: (runtime, script, eventData) => LoadEvent_GiveTakeHeldItem(runtime, script, eventData, QL_EVENT_GAVE_HELD_ITEM_BAG, 'GaveMonHeldItem2'),
  [QL_EVENT_GAVE_HELD_ITEM_PC]: (runtime, script, eventData) => LoadEvent_GiveTakeHeldItem(runtime, script, eventData, QL_EVENT_GAVE_HELD_ITEM_PC, 'GaveMonHeldItemFromPC'),
  [QL_EVENT_TOOK_HELD_ITEM]: (runtime, script, eventData) => LoadEvent_GiveTakeHeldItem(runtime, script, eventData, QL_EVENT_TOOK_HELD_ITEM, 'TookHeldItemFromMon'),
  [QL_EVENT_SWAPPED_HELD_ITEM]: LoadEvent_SwappedHeldItem,
  [QL_EVENT_SWAPPED_HELD_ITEM_PC]: (runtime, script, eventData) => LoadEvent_SwappedHeldItem(runtime, script, eventData, QL_EVENT_SWAPPED_HELD_ITEM_PC),
  [QL_EVENT_USED_PKMN_CENTER]: LoadEvent_UsedPkmnCenter,
  [QL_EVENT_LINK_TRADED]: LoadEvent_LinkTraded,
  [QL_EVENT_LINK_BATTLED_SINGLE]: (runtime, script, eventData) => LoadEvent_LinkBattled(runtime, script, eventData, QL_EVENT_LINK_BATTLED_SINGLE, 1),
  [QL_EVENT_LINK_BATTLED_DOUBLE]: (runtime, script, eventData) => LoadEvent_LinkBattled(runtime, script, eventData, QL_EVENT_LINK_BATTLED_DOUBLE, 1),
  [QL_EVENT_LINK_BATTLED_MULTI]: (runtime, script, eventData) => LoadEvent_LinkBattled(runtime, script, eventData, QL_EVENT_LINK_BATTLED_MULTI, 3),
  [QL_EVENT_USED_UNION_ROOM]: LoadEvent_UsedUnionRoom,
  [QL_EVENT_USED_UNION_ROOM_CHAT]: LoadEvent_UsedUnionRoomChat,
  [QL_EVENT_LINK_TRADED_UNION]: LoadEvent_LinkTradedUnionRoom,
  [QL_EVENT_LINK_BATTLED_UNION]: (runtime, script, eventData) => LoadEvent_LinkBattled(runtime, script, eventData, QL_EVENT_LINK_BATTLED_UNION, 1),
  [QL_EVENT_SWITCHED_MONS_BETWEEN_BOXES]: (runtime, script, eventData) => LoadEvent_BoxPayload(runtime, script, eventData, QL_EVENT_SWITCHED_MONS_BETWEEN_BOXES, 6),
  [QL_EVENT_SWITCHED_MONS_WITHIN_BOX]: (runtime, script, eventData) => LoadEvent_BoxPayload(runtime, script, eventData, QL_EVENT_SWITCHED_MONS_WITHIN_BOX, 6),
  [QL_EVENT_SWITCHED_PARTY_MON_FOR_PC_MON]: (runtime, script, eventData) => LoadEvent_BoxPayload(runtime, script, eventData, QL_EVENT_SWITCHED_PARTY_MON_FOR_PC_MON, 6),
  [QL_EVENT_MOVED_MON_BETWEEN_BOXES]: (runtime, script, eventData) => LoadEvent_BoxPayload(runtime, script, eventData, QL_EVENT_MOVED_MON_BETWEEN_BOXES, 4),
  [QL_EVENT_MOVED_MON_WITHIN_BOX]: (runtime, script, eventData) => LoadEvent_BoxPayload(runtime, script, eventData, QL_EVENT_MOVED_MON_WITHIN_BOX, 4),
  [QL_EVENT_WITHDREW_MON_PC]: (runtime, script, eventData) => LoadEvent_BoxPayload(runtime, script, eventData, QL_EVENT_WITHDREW_MON_PC, 4),
  [QL_EVENT_DEPOSITED_MON_PC]: (runtime, script, eventData) => LoadEvent_BoxPayload(runtime, script, eventData, QL_EVENT_DEPOSITED_MON_PC, 4),
  [QL_EVENT_SWITCHED_MULTIPLE_MONS]: (runtime, script, eventData) => LoadEvent_BoxPayload(runtime, script, eventData, QL_EVENT_SWITCHED_MULTIPLE_MONS, 2),
  [QL_EVENT_DEPOSITED_ITEM_PC]: (runtime, script, eventData) => LoadEvent_ItemIdOnly(runtime, script, eventData, QL_EVENT_DEPOSITED_ITEM_PC, 'StoredItemInPC'),
  [QL_EVENT_WITHDREW_ITEM_PC]: (runtime, script, eventData) => LoadEvent_ItemIdOnly(runtime, script, eventData, QL_EVENT_WITHDREW_ITEM_PC, 'WithdrewItemFromPC'),
  [QL_EVENT_DEFEATED_GYM_LEADER]: (runtime, script, eventData) => LoadEvent_DefeatedTrainer(runtime, script, eventData, QL_EVENT_DEFEATED_GYM_LEADER, 'GymLeader'),
  [QL_EVENT_DEFEATED_WILD_MON]: LoadEvent_DefeatedWildMon,
  [QL_EVENT_DEFEATED_E4_MEMBER]: (runtime, script, eventData) => LoadEvent_DefeatedTrainer(runtime, script, eventData, QL_EVENT_DEFEATED_E4_MEMBER, 'EliteFourMember'),
  [QL_EVENT_DEFEATED_CHAMPION]: LoadEvent_DefeatedChampion,
  [QL_EVENT_DEFEATED_TRAINER]: (runtime, script, eventData) => LoadEvent_DefeatedTrainer(runtime, script, eventData, QL_EVENT_DEFEATED_TRAINER, 'Trainer'),
  [QL_EVENT_DEPARTED]: LoadEvent_DepartedLocation,
  [QL_EVENT_USED_FIELD_MOVE]: LoadEvent_UsedFieldMove,
  [QL_EVENT_BOUGHT_ITEM]: (runtime, script, eventData) => LoadEvent_Shop(runtime, script, eventData, QL_EVENT_BOUGHT_ITEM, 'BoughtItem'),
  [QL_EVENT_SOLD_ITEM]: (runtime, script, eventData) => LoadEvent_Shop(runtime, script, eventData, QL_EVENT_SOLD_ITEM, 'SoldItem'),
  [QL_EVENT_SCENE_END]: null,
  [QL_EVENT_OBTAINED_STORY_ITEM]: LoadEvent_ObtainedStoryItem,
  [QL_EVENT_WAIT]: null,
  [QL_EVENT_ARRIVED]: LoadEvent_ArrivedInLocation
});

export const RecordQuestLogEventPayload = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  dest: number,
  data: QuestLogEventPayload,
  start: number,
  end: number
): number | null => {
  const recordFunc = sRecordEventFuncs[eventId] ?? null;
  return recordFunc === null ? null : recordFunc(runtime, script, dest, data, start, end);
};

export const QuestLog_StartRecordingInputsAfterDeferredEvent = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  start: number,
  end: number
): number | null => {
  if (runtime.sDeferredEvent.id !== 0) {
    runtime.sLastDepartedLocation = 0;
    QL_StartRecordingAction(runtime, runtime.sDeferredEvent.id);
    const resp = runtime.gQuestLogRecordingPointer === null
      ? null
      : RecordQuestLogEventPayload(runtime, script, runtime.sDeferredEvent.id, runtime.gQuestLogRecordingPointer, runtime.sDeferredEvent.data, start, end);
    runtime.gQuestLogRecordingPointer = resp;
    ResetDeferredLinkEvent(runtime);
    return resp;
  }
  return runtime.gQuestLogRecordingPointer;
};

export const QL_RecordWait = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  duration: number,
  start: number,
  end: number
): number | null => {
  const resp = runtime.gQuestLogRecordingPointer === null
    ? null
    : QL_RecordAction_Wait(script, runtime.gQuestLogRecordingPointer, duration, start, end);
  runtime.gQuestLogRecordingPointer = resp;
  runtime.gQuestLogCurActionIdx += 1;
  return resp;
};

export const QuestLogEvents_HandleEndTrainerBattle = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  playbackState: number,
  start: number,
  end: number
): number | null => {
  if (runtime.sDeferredEvent.id !== 0) {
    if (playbackState === QL_PLAYBACK_STATE_STOPPED) {
      runtime.sLastDepartedLocation = 0;
      QL_StartRecordingAction(runtime, runtime.sDeferredEvent.id);
    }
    UpdateRepeatEventCounter(runtime, runtime.sDeferredEvent.id);
    const resp = runtime.gQuestLogRecordingPointer === null
      ? null
      : RecordQuestLogEventPayload(runtime, script, runtime.sDeferredEvent.id, runtime.gQuestLogRecordingPointer, runtime.sDeferredEvent.data, start, end);
    runtime.gQuestLogRecordingPointer = resp;
    QL_RecordWait(runtime, script, 1, start, end);
    ResetDeferredLinkEvent(runtime);
    QL_FinishRecordingScene(runtime);
    return runtime.gQuestLogRecordingPointer;
  }
  return runtime.gQuestLogRecordingPointer;
};

export interface SetQuestLogEventContext {
  questLogState: number;
  playbackState: number;
  location: QuestLogMapLocation;
  linkActive: boolean;
  inUnionRoom: boolean;
  flags: { gameClear: boolean; canLinkWithRs: boolean };
  trainerClassById: (trainerId: number) => number;
  start: number;
  end: number;
}

export const ShouldRegisterEvent = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  data: QuestLogEventPayload,
  context: SetQuestLogEventContext
): number | null => {
  const trainerData = data && typeof data === 'object' && 'trainerId' in data ? data : null;
  if (ShouldRegisterEvent_HandlePartyActions(eventId, trainerData as QuestLogEventTrainerBattle | null, context.flags, context.trainerClassById))
    return null;
  if (eventId === QL_EVENT_DEPARTED && !ShouldRegisterEvent_HandleDeparted(runtime, eventId, data as QuestLogEventDeparted))
    return null;

  QL_StartRecordingAction(runtime, eventId);
  UpdateRepeatEventCounter(runtime, eventId);
  runtime.gQuestLogDefeatedWildMonRecord = eventId === QL_EVENT_DEFEATED_WILD_MON ? runtime.gQuestLogRecordingPointer : null;
  if (runtime.gQuestLogRecordingPointer === null)
    return null;
  return RecordQuestLogEventPayload(runtime, script, eventId, runtime.gQuestLogRecordingPointer, data, context.start, context.end);
};

export const SetQuestLogEvent = (
  runtime: QuestLogEventsRuntime,
  script: number[],
  eventId: number,
  data: QuestLogEventPayload,
  context: SetQuestLogEventContext
): number | null => {
  if (eventId === QL_EVENT_DEPARTED && runtime.sStepRecordingMode === STEP_RECORDING_MODE_DISABLED_UNTIL_DEPART) {
    QL_EnableRecordingSteps(runtime);
    return runtime.gQuestLogRecordingPointer;
  }
  QL_EnableRecordingSteps(runtime);

  if (context.questLogState === QL_STATE_PLAYBACK)
    return runtime.gQuestLogRecordingPointer;
  if (!isValidQlEvent(eventId))
    return runtime.gQuestLogRecordingPointer;
  if (InQuestLogDisabledLocation(context.location))
    return runtime.gQuestLogRecordingPointer;
  if (TryDeferLinkEvent(runtime, eventId, data))
    return runtime.gQuestLogRecordingPointer;
  if (context.linkActive || context.inUnionRoom)
    return runtime.gQuestLogRecordingPointer;
  if (data && typeof data === 'object' && 'trainerId' in data && TryDeferTrainerBattleEvent(runtime, eventId, data, context.playbackState, context.flags.gameClear, context.trainerClassById))
    return runtime.gQuestLogRecordingPointer;
  if (data && typeof data === 'object' && 'defeatedSpecies' in data && IsEventWithSpecialEncounterSpecies(eventId, data))
    return runtime.gQuestLogRecordingPointer;
  if (eventId === QL_EVENT_DEPARTED && !ShouldRegisterEvent_DepartedGameCorner(runtime, eventId, data as QuestLogEventDeparted))
    return runtime.gQuestLogRecordingPointer;

  if (context.playbackState === QL_PLAYBACK_STATE_STOPPED) {
    const trainerData = data && typeof data === 'object' && 'trainerId' in data ? data : null;
    if (ShouldRegisterEvent_HandlePartyActions(eventId, trainerData as QuestLogEventTrainerBattle | null, context.flags, context.trainerClassById))
      return runtime.gQuestLogRecordingPointer;

    if (eventId !== QL_EVENT_DEFEATED_WILD_MON || runtime.gQuestLogDefeatedWildMonRecord === null) {
      if (eventId === QL_EVENT_DEPARTED && !ShouldRegisterEvent_HandleDeparted(runtime, eventId, data as QuestLogEventDeparted))
        return runtime.gQuestLogRecordingPointer;
      QL_StartRecordingAction(runtime, eventId);
    }
  } else if (eventId === QL_EVENT_OBTAINED_STORY_ITEM) {
    return runtime.gQuestLogRecordingPointer;
  }

  UpdateRepeatEventCounter(runtime, eventId);
  let nextPtr: number | null;
  if (eventId === QL_EVENT_DEFEATED_WILD_MON) {
    if (runtime.gQuestLogDefeatedWildMonRecord === null) {
      runtime.gQuestLogDefeatedWildMonRecord = runtime.gQuestLogRecordingPointer;
      nextPtr = runtime.gQuestLogDefeatedWildMonRecord === null
        ? null
        : RecordQuestLogEventPayload(runtime, script, eventId, runtime.gQuestLogDefeatedWildMonRecord, data, context.start, context.end);
    } else {
      RecordQuestLogEventPayload(runtime, script, eventId, runtime.gQuestLogDefeatedWildMonRecord, data, context.start, context.end);
      return runtime.gQuestLogRecordingPointer;
    }
  } else {
    runtime.gQuestLogDefeatedWildMonRecord = null;
    nextPtr = runtime.gQuestLogRecordingPointer === null
      ? null
      : RecordQuestLogEventPayload(runtime, script, eventId, runtime.gQuestLogRecordingPointer, data, context.start, context.end);
  }

  if (nextPtr === null) {
    QL_FinishRecordingScene(runtime);
    nextPtr = ShouldRegisterEvent(runtime, script, eventId, data, context);
    if (nextPtr === null)
      return runtime.gQuestLogRecordingPointer;
  }

  runtime.gQuestLogRecordingPointer = nextPtr;
  if (runtime.sStepRecordingMode !== STEP_RECORDING_MODE_ENABLED)
    QL_FinishRecordingScene(runtime);
  return runtime.gQuestLogRecordingPointer;
};

export const QL_SkipCommand = (
  script: readonly number[],
  curPtr: number,
  prevPtr: { value: number | null }
): number | null => {
  const header = readU16(script, curPtr);
  const eventId = header & QL_CMD_EVENT_MASK;
  let count = header >> QL_CMD_COUNT_SHIFT;

  if (eventId === QL_EVENT_DEFEATED_CHAMPION)
    count = 0;

  if (!isValidQlEvent(eventId))
    return null;

  prevPtr.value = curPtr;
  return curPtr + sQuestLogEventCmdSizes[eventId] + (sQuestLogEventCmdSizes[eventId] - CMD_HEADER_SIZE) * count;
};

export const QL_UpdateLastDepartedLocation = (runtime: QuestLogEventsRuntime, script: readonly number[], offset: number): void => {
  const eventId = readU16(script, offset) & QL_CMD_EVENT_MASK;
  if (eventId !== QL_EVENT_DEPARTED)
    runtime.sLastDepartedLocation = 0;
  else
    runtime.sLastDepartedLocation = (script[offset + 5] ?? 0) + 1;
};

export const QL_LoadEventHeader = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number | null
): boolean => {
  if (eventData === null)
    return false;
  if (readU16(script, eventData + 2) > runtime.gQuestLogCurActionIdx)
    return false;

  const header = readU16(script, eventData);
  runtime.gQuestLogRepeatEventTracker.id = header & 0xff;
  runtime.gQuestLogRepeatEventTracker.numRepeats = (header & QL_CMD_COUNT_MASK) >> QL_CMD_COUNT_SHIFT;
  if (runtime.gQuestLogRepeatEventTracker.numRepeats !== 0)
    runtime.gQuestLogRepeatEventTracker.counter = 1;
  return true;
};

export const QL_LoadEvent = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number | null
): boolean => {
  if (eventData === null)
    return false;
  if (readU16(script, eventData + 2) > runtime.gQuestLogCurActionIdx)
    return false;

  const header = readU16(script, eventData);
  const eventId = header & QL_CMD_EVENT_MASK;
  const loadFunc = sLoadEventFuncs[eventId] ?? null;
  if (loadFunc === null)
    return false;
  loadFunc(runtime, script, eventData);
  runtime.gQuestLogRepeatEventTracker.id = header & 0xff;
  runtime.gQuestLogRepeatEventTracker.numRepeats = (header & QL_CMD_COUNT_MASK) >> QL_CMD_COUNT_SHIFT;
  if (runtime.gQuestLogRepeatEventTracker.numRepeats !== 0)
    runtime.gQuestLogRepeatEventTracker.counter = 1;
  return true;
};

export const QL_TryRepeatEventHeader = (runtime: QuestLogEventsRuntime): boolean => {
  if (runtime.gQuestLogRepeatEventTracker.counter === 0)
    return false;

  if (++runtime.gQuestLogRepeatEventTracker.counter > runtime.gQuestLogRepeatEventTracker.numRepeats)
    QL_ResetRepeatEventTracker(runtime);
  return true;
};

export const QL_TryRepeatEvent = (
  runtime: QuestLogEventsRuntime,
  script: readonly number[],
  eventData: number
): boolean => {
  if (runtime.gQuestLogRepeatEventTracker.counter === 0)
    return false;

  const loadFunc = sLoadEventFuncs[runtime.gQuestLogRepeatEventTracker.id] ?? null;
  if (loadFunc === null)
    return false;
  loadFunc(runtime, script, eventData);
  if (++runtime.gQuestLogRepeatEventTracker.counter > runtime.gQuestLogRepeatEventTracker.numRepeats)
    QL_ResetRepeatEventTracker(runtime);
  return true;
};

export const createEmptyQuestLogAction = createQuestLogAction;
