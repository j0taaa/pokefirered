import trainerTowerSource from '../../../src/trainer_tower.c?raw';
import layoutsSource from '../../../include/constants/layouts.h?raw';
import varsSource from '../../../include/constants/vars.h?raw';
import itemsSource from '../../../include/constants/items.h?raw';
import songsSource from '../../../include/constants/songs.h?raw';
import trainersSource from '../../../include/constants/trainers.h?raw';
import eventObjectsSource from '../../../include/constants/event_objects.h?raw';
import trainerTowerConstantsSource from '../../../include/constants/trainer_tower.h?raw';
import {
  CHALLENGE_TYPE_DOUBLE,
  CHALLENGE_TYPE_KNOCKOUT,
  CHALLENGE_TYPE_SINGLE,
  MAX_TRAINERS_PER_FLOOR,
  NUM_TOWER_CHALLENGE_TYPES,
  gTrainerTowerLocalHeader,
  getTrainerTowerChallengeFloors,
  type ParsedTrainerTowerFloor
} from './decompTrainerTowerSets';
import { AddBagItem, type ItemRuntime } from './decompItem';

export {
  CHALLENGE_TYPE_DOUBLE,
  CHALLENGE_TYPE_KNOCKOUT,
  CHALLENGE_TYPE_SINGLE,
  NUM_TOWER_CHALLENGE_TYPES
};

export const TRAINER_TOWER_MAX_TIME = 215999;
export const CHALLENGE_STATUS_LOST = 0;
export const CHALLENGE_STATUS_UNK = 1;
export const CHALLENGE_STATUS_NORMAL = 2;
export const MALE = 0;
export const FEMALE = 1;
export const PARTY_SIZE = 6;
export const SPECIES_EGG = 412;
export const BATTLE_TYPE_DOUBLE = 1 << 0;
export const BATTLE_TYPE_TRAINER = 1 << 3;
export const BATTLE_TYPE_TRAINER_TOWER = 1 << 19;

export const layoutConstants = parseDefineConstants(layoutsSource);
export const varConstants = parseDefineConstants(varsSource);
export const itemConstants = parseDefineConstants(itemsSource);
export const songConstants = parseDefineConstants(songsSource);
export const trainerConstants = parseDefineConstants(trainersSource);
export const eventObjectConstants = parseDefineConstants(eventObjectsSource);
export const trainerTowerConstants = parseDefineConstants(trainerTowerConstantsSource);

export const LAYOUT_TRAINER_TOWER_LOBBY = layoutConstants.LAYOUT_TRAINER_TOWER_LOBBY;
export const LAYOUT_TRAINER_TOWER_1F = layoutConstants.LAYOUT_TRAINER_TOWER_1F;
export const LAYOUT_TRAINER_TOWER_ROOF = layoutConstants.LAYOUT_TRAINER_TOWER_ROOF;

export interface TrainerTowerTrainer {
  name: string;
  facilityClass: string;
  facilityClassId: number;
  textColor: number;
  speechBefore: readonly string[];
  speechWin: readonly string[];
  speechLose: readonly string[];
  speechAfter: readonly string[];
  mons: TrainerTowerMon[];
}

export interface TrainerTowerMon {
  species: string;
  heldItem: string;
  moves: readonly string[];
  nickname: string;
  level?: number;
}

export interface TrainerTowerRuntimeFloor extends ParsedTrainerTowerFloor {
  trainers: TrainerTowerTrainer[];
  prizeIndex: number;
}

export interface TrainerTowerRecord {
  bestTime: number;
  floorsCleared: number;
  validated: boolean;
  spokeToOwner: boolean;
  receivedPrize: boolean;
  checkedFinalTime: boolean;
  timer: number;
  hasLost: boolean;
  unkA_4: boolean;
  unk9: number;
}

export interface TrainerTowerOpponent {
  name: string;
  speechWin: readonly string[];
  speechLose: readonly string[];
  speechWin2: readonly string[];
  speechLose2: readonly string[];
  battleType: number;
  facilityClass: string;
  facilityClassId: number;
  textColor: number;
}

export interface TrainerTowerRuntime {
  itemRuntime: ItemRuntime;
  towerChallengeId: number;
  trainerTower: TrainerTowerRecord[];
  encryptionKey: number;
  gSpecialVar_0x8004: number;
  gSpecialVar_0x8005: number;
  gSpecialVar_0x8006: number;
  gSpecialVar_Result: number;
  gSpecialVar_TextColor: number;
  gSpecialVar_PrevTextColor: number;
  gStringVar1: string;
  gStringVar2: string;
  gStringVar3: string;
  gStringVar4: string;
  vars: Record<string, number>;
  mapLayoutId: number;
  currentMapLayout: number;
  readTrainerTowerAndValidateResult: boolean;
  eReaderData: TrainerTowerRuntimeFloor[] | null;
  state: { floorIdx: number; data: { numFloors: number; id: number; floors: TrainerTowerRuntimeFloor[]; checksum: number } } | null;
  opponent: TrainerTowerOpponent | null;
  playerParty: Array<{ species: number; speciesOrEgg: number; level: number }>;
  enemyParty: TrainerTowerMon[];
  gBattleTypeFlags: number;
  gTrainerBattleOpponent_A: number;
  doubleEligibility: number;
  windows: Set<number>;
  nextWindowId: number;
  mainCallback2: string | null;
  savedCallback: string | null;
  battleTransitionDone: boolean;
  tasks: Array<{ func: string; destroyed: boolean }>;
  operations: string[];
}

export const sSingleBattleTrainerInfo = parseSingleBattleTrainerInfo(trainerTowerSource);
export const sDoubleBattleTrainerInfo = parseDoubleBattleTrainerInfo(trainerTowerSource);
export const sTrainerEncounterMusicLUT = parseMusicPairs(trainerTowerSource);
export const sFloorLayouts = parseNumericMatrix(trainerTowerSource, 'sFloorLayouts', layoutConstants);
export const sPrizeList = parseTokenList(trainerTowerSource, 'sPrizeList').map((token) => itemConstants[token]);
export const sTrainerTowerEncounterMusic = parseIndexedTokenArray(trainerTowerSource, 'sTrainerTowerEncounterMusic', songConstants);
export const sSingleBattleChallengeMonIdxs = parseNumericMatrix(trainerTowerSource, 'sSingleBattleChallengeMonIdxs');
export const sDoubleBattleChallengeMonIdxs = parseNumericMatrix(trainerTowerSource, 'sDoubleBattleChallengeMonIdxs');
export const sKnockoutChallengeMonIdxs = parseNumericMatrix(trainerTowerSource, 'sKnockoutChallengeMonIdxs');
export const sTimeBoardWindowTemplate = parseTimeBoardWindowTemplate(trainerTowerSource);
export const sTrainerTowerFunctions = parseTrainerTowerFunctionTable(trainerTowerSource);

export function createTrainerTowerRuntime(itemRuntime: ItemRuntime): TrainerTowerRuntime {
  return {
    itemRuntime,
    towerChallengeId: CHALLENGE_TYPE_SINGLE,
    trainerTower: Array.from({ length: NUM_TOWER_CHALLENGE_TYPES }, () => createTrainerTowerRecord()),
    encryptionKey: 0,
    gSpecialVar_0x8004: 0,
    gSpecialVar_0x8005: 0,
    gSpecialVar_0x8006: 0,
    gSpecialVar_Result: 0,
    gSpecialVar_TextColor: 0,
    gSpecialVar_PrevTextColor: 0,
    gStringVar1: '',
    gStringVar2: '',
    gStringVar3: '',
    gStringVar4: '',
    vars: {},
    mapLayoutId: LAYOUT_TRAINER_TOWER_1F,
    currentMapLayout: LAYOUT_TRAINER_TOWER_1F,
    readTrainerTowerAndValidateResult: false,
    eReaderData: null,
    state: null,
    opponent: null,
    playerParty: [],
    enemyParty: [],
    gBattleTypeFlags: 0,
    gTrainerBattleOpponent_A: 0,
    doubleEligibility: 0,
    windows: new Set(),
    nextWindowId: 0,
    mainCallback2: null,
    savedCallback: null,
    battleTransitionDone: false,
    tasks: [],
    operations: []
  };
}

export function CallTrainerTowerFunc(runtime: TrainerTowerRuntime): void {
  SetUpTrainerTowerDataStruct(runtime);
  const fn = sTrainerTowerFunctions[runtime.gSpecialVar_0x8004];
  if (!fn) throw new Error(`Unknown trainer tower func ${runtime.gSpecialVar_0x8004}`);
  trainerTowerFunctionHandlers[fn](runtime);
  FreeTrainerTowerDataStruct(runtime);
}

export function GetTrainerTowerOpponentClass(runtime: TrainerTowerRuntime): number {
  return runtime.opponent?.facilityClassId ?? 0;
}

export function GetTrainerTowerOpponentName(runtime: TrainerTowerRuntime): string {
  return (runtime.opponent?.name ?? '').slice(0, 11);
}

export function GetTrainerTowerTrainerFrontSpriteId(runtime: TrainerTowerRuntime): number {
  return runtime.opponent?.facilityClassId ?? 0;
}

export function InitTrainerTowerBattleStruct(runtime: TrainerTowerRuntime): void {
  SetUpTrainerTowerDataStruct(runtime);
  const floor = currentFloor(runtime);
  const trainerId = VarGet(runtime, 'VAR_TEMP_1');
  const trainer = floor.trainers[trainerId];
  const nextTrainer = floor.trainers[trainerId + 1] ?? floor.trainers[trainerId];
  runtime.opponent = {
    name: trainer.name.slice(0, 11),
    speechWin: trainer.speechWin,
    speechLose: trainer.speechLose,
    speechWin2: floor.challengeType === CHALLENGE_TYPE_DOUBLE ? nextTrainer.speechWin : [],
    speechLose2: floor.challengeType === CHALLENGE_TYPE_DOUBLE ? nextTrainer.speechLose : [],
    battleType: floor.challengeType,
    facilityClass: trainer.facilityClass,
    facilityClassId: trainer.facilityClassId,
    textColor: trainer.textColor
  };
  runtime.operations.push('SetVBlankCounter1Ptr:TRAINER_TOWER.timer');
  FreeTrainerTowerDataStruct(runtime);
}

export function FreeTrainerTowerBattleStruct(runtime: TrainerTowerRuntime): void {
  runtime.opponent = null;
}

export function GetTrainerTowerOpponentWinText(runtime: TrainerTowerRuntime, opponentIdx: number): string {
  VarSet(runtime, 'VAR_TEMP_3', opponentIdx);
  const opponent = mustOpponent(runtime);
  TrainerTowerGetOpponentTextColor(runtime, opponent.battleType, opponent.facilityClassId);
  return TT_ConvertEasyChatMessageToString(opponentIdx === 0 ? opponent.speechWin : opponent.speechWin2);
}

export function GetTrainerTowerOpponentLoseText(runtime: TrainerTowerRuntime, opponentIdx: number): string {
  VarSet(runtime, 'VAR_TEMP_3', opponentIdx);
  const opponent = mustOpponent(runtime);
  TrainerTowerGetOpponentTextColor(runtime, opponent.battleType, opponent.facilityClassId);
  return TT_ConvertEasyChatMessageToString(opponentIdx === 0 ? opponent.speechLose : opponent.speechLose2);
}

export function SetUpTrainerTowerDataStruct(runtime: TrainerTowerRuntime): void {
  const challengeType = runtime.towerChallengeId;
  const floors = runtime.readTrainerTowerAndValidateResult && runtime.eReaderData
    ? runtime.eReaderData
    : getTrainerTowerChallengeFloors(challengeType).map(toRuntimeFloor);
  runtime.state = {
    floorIdx: runtime.mapLayoutId - LAYOUT_TRAINER_TOWER_1F,
    data: {
      numFloors: gTrainerTowerLocalHeader.numFloors,
      id: gTrainerTowerLocalHeader.id,
      floors,
      checksum: calcFloorChecksum(floors)
    }
  };
  if (!runtime.readTrainerTowerAndValidateResult) ValidateOrResetCurTrainerTowerRecord(runtime);
}

export function FreeTrainerTowerDataStruct(runtime: TrainerTowerRuntime): void {
  runtime.state = null;
}

export function InitTrainerTowerFloor(runtime: TrainerTowerRuntime): void {
  const state = mustState(runtime);
  if (runtime.mapLayoutId - LAYOUT_TRAINER_TOWER_LOBBY > state.data.numFloors) {
    runtime.gSpecialVar_Result = 3;
    SetCurrentMapLayout(runtime, LAYOUT_TRAINER_TOWER_ROOF);
  } else {
    const floor = currentFloor(runtime);
    runtime.gSpecialVar_Result = floor.challengeType;
    SetCurrentMapLayout(runtime, sFloorLayouts[state.floorIdx][runtime.gSpecialVar_Result]);
    SetTrainerTowerNPCGraphics(runtime);
  }
}

export function SetTrainerTowerNPCGraphics(runtime: TrainerTowerRuntime): void {
  const floor = currentFloor(runtime);
  if (floor.challengeType === CHALLENGE_TYPE_SINGLE) {
    VarSet(runtime, 'VAR_OBJ_GFX_ID_1', getSingleTrainerGfx(floor.trainers[0].facilityClassId));
  } else if (floor.challengeType === CHALLENGE_TYPE_DOUBLE) {
    const info = sDoubleBattleTrainerInfo.find((entry) => entry.facilityClassId === floor.trainers[0].facilityClassId);
    VarSet(runtime, 'VAR_OBJ_GFX_ID_0', info?.objGfx1Id ?? eventObjectConstants.OBJ_EVENT_GFX_YOUNGSTER);
    VarSet(runtime, 'VAR_OBJ_GFX_ID_3', info?.objGfx2Id ?? eventObjectConstants.OBJ_EVENT_GFX_YOUNGSTER);
  } else if (floor.challengeType === CHALLENGE_TYPE_KNOCKOUT) {
    for (let j = 0; j < MAX_TRAINERS_PER_FLOOR; j += 1) {
      const gfx = getSingleTrainerGfx(floor.trainers[j].facilityClassId);
      if (j === 0) VarSet(runtime, 'VAR_OBJ_GFX_ID_2', gfx);
      if (j === 1) VarSet(runtime, 'VAR_OBJ_GFX_ID_0', gfx);
      if (j === 2) VarSet(runtime, 'VAR_OBJ_GFX_ID_1', gfx);
    }
  }
}

export function TT_ConvertEasyChatMessageToString(ecWords: readonly string[]): string {
  const text = convertEasyChatWordsToString(ecWords, 3, 2);
  if (text.length * 8 > 196) {
    const wrapped = convertEasyChatWordsToString(ecWords, 2, 3);
    const first = wrapped.indexOf('\n');
    const second = wrapped.indexOf('\n', first + 1);
    return second === -1 ? wrapped : `${wrapped.slice(0, second)}\l${wrapped.slice(second + 1)}`;
  }
  return text;
}

export function BufferTowerOpponentSpeech(runtime: TrainerTowerRuntime): void {
  const trainerId = runtime.gSpecialVar_0x8006;
  const floor = currentFloor(runtime);
  const challengeType = floor.challengeType;
  const facilityClass = challengeType !== CHALLENGE_TYPE_DOUBLE ? floor.trainers[trainerId].facilityClassId : floor.trainers[0].facilityClassId;
  const trainer = floor.trainers[trainerId];
  if (runtime.gSpecialVar_0x8005 === trainerTowerConstants.TRAINER_TOWER_TEXT_INTRO) {
    TrainerTowerGetOpponentTextColor(runtime, challengeType, facilityClass);
    runtime.gStringVar4 = TT_ConvertEasyChatMessageToString(trainer.speechBefore);
  } else if (runtime.gSpecialVar_0x8005 === trainerTowerConstants.TRAINER_TOWER_TEXT_PLAYER_LOST) {
    TrainerTowerGetOpponentTextColor(runtime, challengeType, facilityClass);
    runtime.gStringVar4 = TT_ConvertEasyChatMessageToString(trainer.speechWin);
  } else if (runtime.gSpecialVar_0x8005 === trainerTowerConstants.TRAINER_TOWER_TEXT_PLAYER_WON) {
    TrainerTowerGetOpponentTextColor(runtime, challengeType, facilityClass);
    runtime.gStringVar4 = TT_ConvertEasyChatMessageToString(trainer.speechLose);
  } else if (runtime.gSpecialVar_0x8005 === trainerTowerConstants.TRAINER_TOWER_TEXT_AFTER) {
    runtime.gStringVar4 = TT_ConvertEasyChatMessageToString(trainer.speechAfter);
  }
}

export function TrainerTowerGetOpponentTextColor(runtime: TrainerTowerRuntime, challengeType: number, facilityClass: number): void {
  let gender = MALE;
  if (challengeType === CHALLENGE_TYPE_SINGLE || challengeType === CHALLENGE_TYPE_KNOCKOUT) {
    gender = sSingleBattleTrainerInfo.find((entry) => entry.facilityClassId === facilityClass)?.gender ?? MALE;
  } else if (challengeType === CHALLENGE_TYPE_DOUBLE) {
    const info = sDoubleBattleTrainerInfo.find((entry) => entry.facilityClassId === facilityClass);
    if (info) gender = VarGet(runtime, 'VAR_TEMP_3') ? info.gender2 : info.gender1;
  }
  runtime.gSpecialVar_PrevTextColor = runtime.gSpecialVar_TextColor;
  runtime.gSpecialVar_TextColor = gender;
}

export function DoTrainerTowerBattle(runtime: TrainerTowerRuntime): void {
  runtime.gBattleTypeFlags = BATTLE_TYPE_TRAINER | BATTLE_TYPE_TRAINER_TOWER;
  if (currentFloor(runtime).challengeType === CHALLENGE_TYPE_DOUBLE) runtime.gBattleTypeFlags |= BATTLE_TYPE_DOUBLE;
  runtime.gTrainerBattleOpponent_A = 0;
  BuildEnemyParty(runtime);
  runtime.tasks.push({ func: 'Task_DoTrainerTowerBattle', destroyed: false });
  runtime.operations.push('CreateTask:Task_DoTrainerTowerBattle:1');
  runtime.operations.push('PlayMapChosenOrBattleBGM:0');
  runtime.operations.push('BattleTransition_StartOnField:BattleSetup_GetBattleTowerBattleTransition');
}

export function CB2_EndTrainerTowerBattle(runtime: TrainerTowerRuntime): void {
  runtime.mainCallback2 = 'CB2_ReturnToFieldContinueScriptPlayMapMusic';
  runtime.operations.push('SetMainCallback2:CB2_ReturnToFieldContinueScriptPlayMapMusic');
}

export function Task_DoTrainerTowerBattle(runtime: TrainerTowerRuntime, taskId: number): void {
  if (runtime.battleTransitionDone) {
    runtime.savedCallback = 'CB2_EndTrainerTowerBattle';
    runtime.operations.push('gMain.savedCallback:CB2_EndTrainerTowerBattle');
    runtime.operations.push('CleanupOverworldWindowsAndTilemaps');
    runtime.mainCallback2 = 'CB2_InitBattle';
    runtime.operations.push('SetMainCallback2:CB2_InitBattle');
    if (runtime.tasks[taskId]) runtime.tasks[taskId].destroyed = true;
    runtime.operations.push(`DestroyTask:${taskId}`);
  }
}

export function TrainerTowerGetChallengeType(runtime: TrainerTowerRuntime): void {
  if (!runtime.gSpecialVar_0x8005) runtime.gSpecialVar_Result = currentFloor(runtime).challengeType;
}

export function TrainerTowerAddFloorCleared(runtime: TrainerTowerRuntime): void {
  currentRecord(runtime).floorsCleared += 1;
}

export function GetFloorAlreadyCleared(runtime: TrainerTowerRuntime): void {
  const record = currentRecord(runtime);
  const floor = currentFloor(runtime);
  if (runtime.mapLayoutId - LAYOUT_TRAINER_TOWER_1F === record.floorsCleared && runtime.mapLayoutId - LAYOUT_TRAINER_TOWER_LOBBY <= floor.floorIdx) runtime.gSpecialVar_Result = 0;
  else runtime.gSpecialVar_Result = 1;
}

export function StartTrainerTowerChallenge(runtime: TrainerTowerRuntime): void {
  runtime.towerChallengeId = runtime.gSpecialVar_0x8005;
  if (runtime.towerChallengeId >= NUM_TOWER_CHALLENGE_TYPES) runtime.towerChallengeId = 0;
  ValidateOrResetCurTrainerTowerRecord(runtime);
  currentRecord(runtime).validated = !runtime.readTrainerTowerAndValidateResult;
  currentRecord(runtime).floorsCleared = 0;
  runtime.operations.push('SetVBlankCounter1Ptr:TRAINER_TOWER.timer');
  currentRecord(runtime).timer = 0;
  currentRecord(runtime).spokeToOwner = false;
  currentRecord(runtime).checkedFinalTime = false;
}

export function GetOwnerState(runtime: TrainerTowerRuntime): void {
  runtime.operations.push('DisableVBlankCounter1');
  const record = currentRecord(runtime);
  runtime.gSpecialVar_Result = 0;
  if (record.spokeToOwner) runtime.gSpecialVar_Result += 1;
  if (record.receivedPrize && record.checkedFinalTime) runtime.gSpecialVar_Result += 1;
  record.spokeToOwner = true;
}

export function GiveChallengePrize(runtime: TrainerTowerRuntime): void {
  const itemId = sPrizeList[currentFloor(runtime).prizeIndex];
  const record = currentRecord(runtime);
  if (record.receivedPrize) runtime.gSpecialVar_Result = 2;
  else if (AddBagItem(runtime.itemRuntime, itemId, 1) === true) {
    runtime.gStringVar2 = String(itemId);
    record.receivedPrize = true;
    runtime.gSpecialVar_Result = 0;
  } else {
    runtime.gSpecialVar_Result = 1;
  }
}

export function CheckFinalTime(runtime: TrainerTowerRuntime): void {
  const record = currentRecord(runtime);
  if (record.checkedFinalTime) runtime.gSpecialVar_Result = 2;
  else if (GetTrainerTowerRecordTime(runtime, record.bestTime) > record.timer) {
    record.bestTime = SetTrainerTowerRecordTime(runtime, record.timer);
    runtime.gSpecialVar_Result = 0;
  } else runtime.gSpecialVar_Result = 1;
  record.checkedFinalTime = true;
}

export function TrainerTowerResumeTimer(runtime: TrainerTowerRuntime): void {
  const record = currentRecord(runtime);
  if (!record.spokeToOwner) {
    if (record.timer >= TRAINER_TOWER_MAX_TIME) record.timer = TRAINER_TOWER_MAX_TIME;
    else runtime.operations.push('SetVBlankCounter1Ptr:TRAINER_TOWER.timer');
  }
}

export function TrainerTowerSetPlayerLost(runtime: TrainerTowerRuntime): void {
  currentRecord(runtime).hasLost = true;
}

export function GetTrainerTowerChallengeStatus(runtime: TrainerTowerRuntime): void {
  const record = currentRecord(runtime);
  if (record.hasLost) {
    record.hasLost = false;
    runtime.gSpecialVar_Result = CHALLENGE_STATUS_LOST;
  } else if (record.unkA_4) {
    record.unkA_4 = false;
    runtime.gSpecialVar_Result = CHALLENGE_STATUS_UNK;
  } else runtime.gSpecialVar_Result = CHALLENGE_STATUS_NORMAL;
}

export function GetCurrentTime(runtime: TrainerTowerRuntime): void {
  const record = currentRecord(runtime);
  if (record.timer >= TRAINER_TOWER_MAX_TIME) {
    runtime.operations.push('DisableVBlankCounter1');
    record.timer = TRAINER_TOWER_MAX_TIME;
  }
  const time = printTowerTime(record.timer);
  runtime.gStringVar1 = time.minutes;
  runtime.gStringVar2 = time.seconds;
  runtime.gStringVar3 = time.centiseconds;
}

export function ShowResultsBoard(runtime: TrainerTowerRuntime): void {
  ValidateOrResetCurTrainerTowerRecord(runtime);
  const windowId = runtime.nextWindowId++;
  runtime.windows.add(windowId);
  runtime.operations.push(`AddWindow:sTimeBoardWindowTemplate:${windowId}`);
  for (let i = 0; i < NUM_TOWER_CHALLENGE_TYPES; i += 1) {
    const time = printTowerTime(GetTrainerTowerRecordTime(runtime, currentRecord(runtime).bestTime));
    runtime.operations.push(`AddTextPrinterParameterized:${i}:${time.minutes}:${time.seconds}:${time.centiseconds}`);
  }
  VarSet(runtime, 'VAR_TEMP_1', windowId);
}

export function CloseResultsBoard(runtime: TrainerTowerRuntime): void {
  const windowId = VarGet(runtime, 'VAR_TEMP_1');
  runtime.windows.delete(windowId);
  runtime.operations.push(`ClearStdWindowAndFrameToTransparent:${windowId}:true`);
  runtime.operations.push(`RemoveWindow:${windowId}`);
}

export function TrainerTowerGetDoublesEligiblity(runtime: TrainerTowerRuntime): void {
  runtime.gSpecialVar_Result = runtime.doubleEligibility;
}

export function TrainerTowerGetNumFloors(runtime: TrainerTowerRuntime): void {
  const state = mustState(runtime);
  if (state.data.numFloors !== state.data.floors[0].floorIdx) {
    runtime.gStringVar1 = String(state.data.numFloors);
    runtime.gSpecialVar_Result = 1;
  } else runtime.gSpecialVar_Result = 0;
}

export function ShouldWarpToCounter(runtime: TrainerTowerRuntime): void {
  runtime.gSpecialVar_Result = 0;
}

export function PlayTrainerTowerEncounterMusic(runtime: TrainerTowerRuntime): void {
  const idx = VarGet(runtime, 'VAR_TEMP_1');
  const facilityClass = currentFloor(runtime).trainers[idx].facilityClassId;
  const musicPair = sTrainerEncounterMusicLUT.find((entry) => entry.facilityClassId === facilityClass);
  const musicIdx = musicPair?.musicId ?? 0;
  runtime.operations.push(`PlayNewMapMusic:${sTrainerTowerEncounterMusic[musicIdx]}`);
}

export function HasSpokenToOwner(runtime: TrainerTowerRuntime): void {
  runtime.gSpecialVar_Result = currentRecord(runtime).spokeToOwner ? 1 : 0;
}

export function BuildEnemyParty(runtime: TrainerTowerRuntime): void {
  const trainerIdx = VarGet(runtime, 'VAR_TEMP_1');
  const level = GetPartyMaxLevel(runtime);
  const floorIdx = currentRecord(runtime).floorsCleared;
  const floor = currentFloor(runtime);
  runtime.enemyParty = [];
  if (floor.challengeType === CHALLENGE_TYPE_DOUBLE) {
    const monIdx0 = sDoubleBattleChallengeMonIdxs[floorIdx][0];
    const monIdx1 = sDoubleBattleChallengeMonIdxs[floorIdx][1];
    runtime.enemyParty.push({ ...floor.trainers[0].mons[monIdx0], level });
    runtime.enemyParty.push({ ...floor.trainers[1].mons[monIdx1], level });
  } else if (floor.challengeType === CHALLENGE_TYPE_KNOCKOUT) {
    const monIdx = sKnockoutChallengeMonIdxs[floorIdx][trainerIdx];
    runtime.enemyParty.push({ ...floor.trainers[trainerIdx].mons[monIdx], level });
  } else {
    for (let i = 0; i < 2; i += 1) {
      const monIdx = sSingleBattleChallengeMonIdxs[floorIdx][i];
      runtime.enemyParty.push({ ...floor.trainers[trainerIdx].mons[monIdx], level });
    }
  }
}

export function GetPartyMaxLevel(runtime: TrainerTowerRuntime): number {
  let topLevel = 0;
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const mon = runtime.playerParty[i];
    if (mon && mon.species !== 0 && mon.speciesOrEgg !== SPECIES_EGG && mon.level > topLevel) topLevel = mon.level;
  }
  return topLevel;
}

export function ValidateOrResetCurTrainerTowerRecord(runtime: TrainerTowerRuntime): void {
  const record = currentRecord(runtime);
  const state = runtime.state;
  const id = state?.data.id ?? gTrainerTowerLocalHeader.id;
  if (record.unk9 !== id) {
    record.unk9 = id;
    record.bestTime = SetTrainerTowerRecordTime(runtime, TRAINER_TOWER_MAX_TIME);
    record.receivedPrize = false;
  }
}

export function PrintTrainerTowerRecords(runtime: TrainerTowerRuntime): void {
  SetUpTrainerTowerDataStruct(runtime);
  runtime.operations.push('FillWindowPixelRect:0:PIXEL_FILL(0):0:0:216:144');
  ValidateOrResetCurTrainerTowerRecord(runtime);
  for (let i = 0; i < NUM_TOWER_CHALLENGE_TYPES; i += 1) {
    const time = printTowerTime(GetTrainerTowerRecordTime(runtime, runtime.trainerTower[i].bestTime));
    runtime.operations.push(`AddTextPrinterParameterized3:${i}:${time.minutes}:${time.seconds}:${time.centiseconds}`);
  }
  FreeTrainerTowerDataStruct(runtime);
}

export function GetTrainerTowerRecordTime(runtime: TrainerTowerRuntime, counter: number): number {
  return (counter ^ runtime.encryptionKey) >>> 0;
}

export function SetTrainerTowerRecordTime(runtime: TrainerTowerRuntime, value: number): number {
  return (value ^ runtime.encryptionKey) >>> 0;
}

export function ResetTrainerTowerResults(runtime: TrainerTowerRuntime): void {
  for (let i = 0; i < NUM_TOWER_CHALLENGE_TYPES; i += 1) runtime.trainerTower[i].bestTime = SetTrainerTowerRecordTime(runtime, TRAINER_TOWER_MAX_TIME);
}

const trainerTowerFunctionHandlers: Record<string, (runtime: TrainerTowerRuntime) => void> = {
  InitTrainerTowerFloor,
  BufferTowerOpponentSpeech,
  DoTrainerTowerBattle,
  TrainerTowerGetChallengeType,
  TrainerTowerAddFloorCleared,
  GetFloorAlreadyCleared,
  StartTrainerTowerChallenge,
  GetOwnerState,
  GiveChallengePrize,
  CheckFinalTime,
  TrainerTowerResumeTimer,
  TrainerTowerSetPlayerLost,
  GetTrainerTowerChallengeStatus,
  GetCurrentTime,
  ShowResultsBoard,
  CloseResultsBoard,
  TrainerTowerGetDoublesEligiblity,
  TrainerTowerGetNumFloors,
  ShouldWarpToCounter,
  PlayTrainerTowerEncounterMusic,
  HasSpokenToOwner
};

function createTrainerTowerRecord(): TrainerTowerRecord {
  return {
    bestTime: TRAINER_TOWER_MAX_TIME,
    floorsCleared: 0,
    validated: false,
    spokeToOwner: false,
    receivedPrize: false,
    checkedFinalTime: false,
    timer: 0,
    hasLost: false,
    unkA_4: false,
    unk9: 0
  };
}

function currentRecord(runtime: TrainerTowerRuntime): TrainerTowerRecord {
  return runtime.trainerTower[runtime.towerChallengeId];
}

function currentFloor(runtime: TrainerTowerRuntime): TrainerTowerRuntimeFloor {
  const state = mustState(runtime);
  return state.data.floors[Math.max(0, Math.min(state.floorIdx, state.data.floors.length - 1))];
}

function mustState(runtime: TrainerTowerRuntime): NonNullable<TrainerTowerRuntime['state']> {
  if (!runtime.state) throw new Error('Trainer Tower state is not initialized');
  return runtime.state;
}

function mustOpponent(runtime: TrainerTowerRuntime): TrainerTowerOpponent {
  if (!runtime.opponent) throw new Error('Trainer Tower opponent is not initialized');
  return runtime.opponent;
}

function VarGet(runtime: TrainerTowerRuntime, name: string): number {
  return runtime.vars[name] ?? 0;
}

function VarSet(runtime: TrainerTowerRuntime, name: string, value: number): void {
  runtime.vars[name] = value;
}

function SetCurrentMapLayout(runtime: TrainerTowerRuntime, layout: number): void {
  runtime.currentMapLayout = layout;
}

function getSingleTrainerGfx(facilityClassId: number): number {
  return sSingleBattleTrainerInfo.find((entry) => entry.facilityClassId === facilityClassId)?.objGfxId ?? eventObjectConstants.OBJ_EVENT_GFX_YOUNGSTER;
}

function printTowerTime(src: number): { minutes: string; seconds: string; centiseconds: string } {
  let frames = src;
  const minutes = Math.trunc(frames / (60 * 60));
  frames %= 60 * 60;
  const seconds = Math.trunc(frames / 60);
  frames %= 60;
  const centiseconds = Math.trunc(frames * 168 / 100);
  return {
    minutes: String(minutes).padStart(2, ' '),
    seconds: String(seconds).padStart(2, ' '),
    centiseconds: String(centiseconds).padStart(2, '0')
  };
}

function convertEasyChatWordsToString(words: readonly string[], cols: number, rows: number): string {
  const lines: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    lines.push(words.slice(row * cols, row * cols + cols).join(' '));
  }
  return lines.join('\n');
}

function toRuntimeFloor(floor: ParsedTrainerTowerFloor): TrainerTowerRuntimeFloor {
  return {
    ...floor,
    prizeIndex: trainerTowerConstants[floor.prize] ?? (Number.parseInt(floor.prize, 10) || 0),
    trainers: parseRuntimeTrainers(floor.rawInitializer)
  };
}

function parseRuntimeTrainers(raw: string): TrainerTowerTrainer[] {
  const trainerBodies = topLevelTrainerBodies(raw);
  return trainerBodies.map((body) => {
    const facilityClass = body.match(/\.facilityClass = ([A-Z0-9_]+)/u)?.[1] ?? 'FACILITY_CLASS_YOUNGSTER';
    return {
      name: body.match(/\.name = _\("([^"]*)"\)/u)?.[1] ?? '',
      facilityClass,
      facilityClassId: trainerConstants[facilityClass] ?? 0,
      textColor: Number.parseInt(body.match(/\.textColor = (\d+)/u)?.[1] ?? '0', 10),
      speechBefore: readSpeech(body, 'speechBefore'),
      speechWin: readSpeech(body, 'speechWin'),
      speechLose: readSpeech(body, 'speechLose'),
      speechAfter: readSpeech(body, 'speechAfter'),
      mons: [...body.matchAll(/\.species = ([A-Z0-9_]+),([\s\S]*?)\.friendship = \d+/gu)].map(([, species, monBody]) => ({
        species,
        heldItem: monBody.match(/\.heldItem = ([A-Z0-9_]+)/u)?.[1] ?? '',
        moves: monBody.match(/\.moves = \{([^}]+)\}/u)?.[1].split(',').map((move) => move.trim()) ?? [],
        nickname: monBody.match(/\.nickname = _\("([^"]*)"\)/u)?.[1] ?? species
      }))
    };
  });
}

function topLevelTrainerBodies(raw: string): string[] {
  const trainersStart = raw.indexOf('.trainers = {');
  if (trainersStart === -1) return [];
  const open = raw.indexOf('{', trainersStart);
  const close = findMatchingBrace(raw, open);
  const body = raw.slice(open + 1, close);
  const result: string[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < body.length; i += 1) {
    if (body[i] === '{') {
      if (depth === 0) start = i;
      depth += 1;
    } else if (body[i] === '}') {
      depth -= 1;
      if (depth === 0 && start !== -1) result.push(body.slice(start, i + 1));
    }
  }
  return result.filter((entry) => entry.includes('.facilityClass'));
}

function readSpeech(body: string, field: string): string[] {
  return body.match(new RegExp(`\\.${field} = \\{([^}]+)\\}`, 'u'))?.[1].split(',').map((word) => word.trim()) ?? [];
}

function calcFloorChecksum(floors: readonly TrainerTowerRuntimeFloor[]): number {
  return floors.reduce((sum, floor) => sum + floor.checksum, 0) >>> 0;
}

export function parseDefineConstants(source: string): Record<string, number> {
  const constants: Record<string, number> = { MALE, FEMALE };
  for (const [, name, value] of source.matchAll(/^#define\s+([A-Z0-9_]+)\s+(.+)$/gmu)) {
    const token = value.trim().split(/\s+/u)[0].replace(/[()]/gu, '');
    if (/^0x[0-9A-Fa-f]+$/u.test(token)) constants[name] = Number.parseInt(token, 16);
    else if (/^\d+$/u.test(token)) constants[name] = Number.parseInt(token, 10);
  }
  return constants;
}

function parseSingleBattleTrainerInfo(source: string) {
  const body = source.match(/static const struct SinglesTrainerInfo sSingleBattleTrainerInfo\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\{(OBJ_EVENT_GFX_[A-Z0-9_]+),\s*(FACILITY_CLASS_[A-Z0-9_]+),\s*(MALE|FEMALE)\}/gu)]
    .map(([, objGfx, facilityClass, gender]) => ({
      objGfx,
      objGfxId: eventObjectConstants[objGfx],
      facilityClass,
      facilityClassId: trainerConstants[facilityClass],
      gender: gender === 'FEMALE' ? FEMALE : MALE
    }));
}

function parseDoubleBattleTrainerInfo(source: string) {
  const body = source.match(/static const struct DoublesTrainerInfo sDoubleBattleTrainerInfo\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\{(OBJ_EVENT_GFX_[A-Z0-9_]+),\s*(OBJ_EVENT_GFX_[A-Z0-9_]+),\s*(FACILITY_CLASS_[A-Z0-9_]+),\s*(MALE|FEMALE),\s*(MALE|FEMALE)\}/gu)]
    .map(([, objGfx1, objGfx2, facilityClass, gender1, gender2]) => ({
      objGfx1,
      objGfx1Id: eventObjectConstants[objGfx1],
      objGfx2,
      objGfx2Id: eventObjectConstants[objGfx2],
      facilityClass,
      facilityClassId: trainerConstants[facilityClass],
      gender1: gender1 === 'FEMALE' ? FEMALE : MALE,
      gender2: gender2 === 'FEMALE' ? FEMALE : MALE
    }));
}

function parseMusicPairs(source: string) {
  const body = source.match(/static const struct TrainerEncounterMusicPairs sTrainerEncounterMusicLUT\[105\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\{(FACILITY_CLASS_[A-Z0-9_]+),\s*(TRAINER_ENCOUNTER_MUSIC_[A-Z0-9_]+)\}/gu)]
    .map(([, facilityClass, music]) => ({
      facilityClass,
      facilityClassId: trainerConstants[facilityClass],
      music,
      musicId: trainerEncounterMusicIndex(music)
    }));
}

function trainerEncounterMusicIndex(token: string): number {
  const order = [
    'TRAINER_ENCOUNTER_MUSIC_MALE',
    'TRAINER_ENCOUNTER_MUSIC_FEMALE',
    'TRAINER_ENCOUNTER_MUSIC_GIRL',
    'TRAINER_ENCOUNTER_MUSIC_SUSPICIOUS',
    'TRAINER_ENCOUNTER_MUSIC_INTENSE',
    'TRAINER_ENCOUNTER_MUSIC_COOL',
    'TRAINER_ENCOUNTER_MUSIC_AQUA',
    'TRAINER_ENCOUNTER_MUSIC_MAGMA',
    'TRAINER_ENCOUNTER_MUSIC_SWIMMER',
    'TRAINER_ENCOUNTER_MUSIC_TWINS',
    'TRAINER_ENCOUNTER_MUSIC_ELITE_FOUR',
    'TRAINER_ENCOUNTER_MUSIC_HIKER',
    'TRAINER_ENCOUNTER_MUSIC_INTERVIEWER',
    'TRAINER_ENCOUNTER_MUSIC_RICH'
  ];
  return order.indexOf(token);
}

function parseTokenList(source: string, symbol: string): string[] {
  const body = source.match(new RegExp(`static const u16 ${symbol}\\[\\] = \\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';
  return [...body.matchAll(/([A-Z0-9_]+)/gu)].map(([, token]) => token).filter((token) => token !== 'static' && token !== 'const' && token !== 'u16');
}

function parseNumericMatrix(source: string, symbol: string, constants: Record<string, number> = {}): number[][] {
  const body = source.match(new RegExp(`static const u(?:8|16) ${symbol}\\[[^=]+?= \\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';
  return [...body.matchAll(/\{([^{}]+)\}/gu)].map(([, row]) => row.split(',').map((token) => token.trim()).filter(Boolean).map((token) => constants[token] ?? Number.parseInt(token, 10)));
}

function parseIndexedTokenArray(source: string, symbol: string, constants: Record<string, number>): number[] {
  const body = source.match(new RegExp(`static const u16 ${symbol}\\[\\] = \\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';
  const result: number[] = [];
  let next = 0;
  for (const [, indexToken, valueToken] of body.matchAll(/(?:\[([A-Z0-9_]+)\]\s*=\s*)?([A-Z0-9_]+)/gu)) {
    const index = indexToken ? trainerEncounterMusicIndex(indexToken) : next;
    result[index] = constants[valueToken] ?? 0;
    next = index + 1;
  }
  return result;
}

function parseTimeBoardWindowTemplate(source: string) {
  const body = source.match(/static const struct WindowTemplate sTimeBoardWindowTemplate\[\] = \{([\s\S]*?)DUMMY_WIN_TEMPLATE/u)?.[1] ?? '';
  return {
    bg: Number.parseInt(body.match(/\.bg = (\d+)/u)?.[1] ?? '0', 10),
    tilemapLeft: Number.parseInt(body.match(/\.tilemapLeft = (\d+)/u)?.[1] ?? '0', 10),
    tilemapTop: Number.parseInt(body.match(/\.tilemapTop = (\d+)/u)?.[1] ?? '0', 10),
    width: Number.parseInt(body.match(/\.width = (\d+)/u)?.[1] ?? '0', 10),
    height: Number.parseInt(body.match(/\.height = (\d+)/u)?.[1] ?? '0', 10),
    paletteNum: Number.parseInt(body.match(/\.paletteNum = (\d+)/u)?.[1] ?? '0', 10),
    baseBlock: Number.parseInt(body.match(/\.baseBlock = (0x[0-9A-Fa-f]+|\d+)/u)?.[1] ?? '0', 0)
  };
}

function parseTrainerTowerFunctionTable(source: string): string[] {
  const body = source.match(/static void \(\*const sTrainerTowerFunctions\[\]\)\(void\) = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  const result: string[] = [];
  for (const [, constant, fn] of body.matchAll(/\[(TRAINER_TOWER_FUNC_[A-Z0-9_]+)\]\s*=\s*([A-Za-z0-9_]+)/gu)) {
    result[trainerTowerConstants[constant]] = fn;
  }
  return result;
}

function findMatchingBrace(source: string, openBraceIndex: number): number {
  let depth = 0;
  for (let i = openBraceIndex; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error('No matching brace');
}
