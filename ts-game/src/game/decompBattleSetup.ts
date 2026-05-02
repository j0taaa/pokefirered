import battleConstantsSource from '../../../include/constants/battle.h?raw';
import battleSetupConstantsSource from '../../../include/constants/battle_setup.h?raw';
import eventObjectsSource from '../../../include/constants/event_objects.h?raw';
import itemsSource from '../../../include/constants/items.h?raw';
import mapTypesSource from '../../../include/constants/map_types.h?raw';
import opponentsSource from '../../../include/constants/opponents.h?raw';
import songsSource from '../../../include/constants/songs.h?raw';
import speciesSource from '../../../include/constants/species.h?raw';
import trainerConstantsSource from '../../../include/constants/trainers.h?raw';

export const TRANSITION_TYPE_NORMAL = 0;
export const TRANSITION_TYPE_CAVE = 1;
export const TRANSITION_TYPE_FLASH = 2;
export const TRANSITION_TYPE_WATER = 3;
export const TRAINER_PARAM_LOAD_VAL_8BIT = 0;
export const TRAINER_PARAM_LOAD_VAL_16BIT = 1;
export const TRAINER_PARAM_LOAD_VAL_32BIT = 2;
export const TRAINER_PARAM_CLEAR_VAL_8BIT = 3;
export const TRAINER_PARAM_CLEAR_VAL_16BIT = 4;
export const TRAINER_PARAM_CLEAR_VAL_32BIT = 5;
export const TRAINER_PARAM_LOAD_SCRIPT_RET_ADDR = 6;
export const PARTY_SIZE = 6;
export const TRAINER_FLAGS_START = 0x500;
export const LOCALID_NONE = defineNumber(eventObjectsSource, 'LOCALID_NONE');
export const ITEM_SILPH_SCOPE = defineNumber(itemsSource, 'ITEM_SILPH_SCOPE');
export const MAP_TYPE_TOWN = defineNumber(mapTypesSource, 'MAP_TYPE_TOWN');
export const MAP_TYPE_CITY = defineNumber(mapTypesSource, 'MAP_TYPE_CITY');
export const MAP_TYPE_ROUTE = defineNumber(mapTypesSource, 'MAP_TYPE_ROUTE');
export const MAP_TYPE_UNDERGROUND = defineNumber(mapTypesSource, 'MAP_TYPE_UNDERGROUND');
export const MAP_TYPE_UNDERWATER = defineNumber(mapTypesSource, 'MAP_TYPE_UNDERWATER');
export const MAP_TYPE_OCEAN_ROUTE = defineNumber(mapTypesSource, 'MAP_TYPE_OCEAN_ROUTE');
export const MAP_TYPE_INDOOR = defineNumber(mapTypesSource, 'MAP_TYPE_INDOOR');
export const MAP_TYPE_SECRET_BASE = defineNumber(mapTypesSource, 'MAP_TYPE_SECRET_BASE');
export const BATTLE_TYPE_TRAINER = defineExpr(battleConstantsSource, 'BATTLE_TYPE_TRAINER');
export const BATTLE_TYPE_FIRST_BATTLE = defineExpr(battleConstantsSource, 'BATTLE_TYPE_FIRST_BATTLE');
export const BATTLE_TYPE_SAFARI = defineExpr(battleConstantsSource, 'BATTLE_TYPE_SAFARI');
export const BATTLE_TYPE_OLD_MAN_TUTORIAL = defineExpr(battleConstantsSource, 'BATTLE_TYPE_OLD_MAN_TUTORIAL');
export const BATTLE_TYPE_ROAMER = defineExpr(battleConstantsSource, 'BATTLE_TYPE_ROAMER');
export const BATTLE_TYPE_KYOGRE_GROUDON = defineExpr(battleConstantsSource, 'BATTLE_TYPE_KYOGRE_GROUDON');
export const BATTLE_TYPE_LEGENDARY = defineExpr(battleConstantsSource, 'BATTLE_TYPE_LEGENDARY');
export const BATTLE_TYPE_GHOST_UNVEILED = defineExpr(battleConstantsSource, 'BATTLE_TYPE_GHOST_UNVEILED');
export const BATTLE_TYPE_REGI = defineExpr(battleConstantsSource, 'BATTLE_TYPE_REGI');
export const BATTLE_TYPE_GHOST = defineExpr(battleConstantsSource, 'BATTLE_TYPE_GHOST');
export const BATTLE_TYPE_WILD_SCRIPTED = defineExpr(battleConstantsSource, 'BATTLE_TYPE_WILD_SCRIPTED');
export const BATTLE_TYPE_LEGENDARY_FRLG = defineExpr(battleConstantsSource, 'BATTLE_TYPE_LEGENDARY_FRLG');
export const RIVAL_BATTLE_HEAL_AFTER = defineNumber(battleConstantsSource, 'RIVAL_BATTLE_HEAL_AFTER');
export const RIVAL_BATTLE_TUTORIAL = defineNumber(battleConstantsSource, 'RIVAL_BATTLE_TUTORIAL');
export const B_OUTCOME_WON = defineNumber(battleConstantsSource, 'B_OUTCOME_WON');
export const B_OUTCOME_LOST = defineNumber(battleConstantsSource, 'B_OUTCOME_LOST');
export const B_OUTCOME_DREW = defineNumber(battleConstantsSource, 'B_OUTCOME_DREW');
export const B_OUTCOME_RAN = defineNumber(battleConstantsSource, 'B_OUTCOME_RAN');
export const B_OUTCOME_PLAYER_TELEPORTED = defineNumber(battleConstantsSource, 'B_OUTCOME_PLAYER_TELEPORTED');
export const B_OUTCOME_MON_FLED = defineNumber(battleConstantsSource, 'B_OUTCOME_MON_FLED');
export const B_OUTCOME_CAUGHT = defineNumber(battleConstantsSource, 'B_OUTCOME_CAUGHT');
export const BATTLE_TERRAIN_GRASS = defineNumber(battleConstantsSource, 'BATTLE_TERRAIN_GRASS');
export const BATTLE_TERRAIN_LONG_GRASS = defineNumber(battleConstantsSource, 'BATTLE_TERRAIN_LONG_GRASS');
export const BATTLE_TERRAIN_SAND = defineNumber(battleConstantsSource, 'BATTLE_TERRAIN_SAND');
export const BATTLE_TERRAIN_UNDERWATER = defineNumber(battleConstantsSource, 'BATTLE_TERRAIN_UNDERWATER');
export const BATTLE_TERRAIN_WATER = defineNumber(battleConstantsSource, 'BATTLE_TERRAIN_WATER');
export const BATTLE_TERRAIN_POND = defineNumber(battleConstantsSource, 'BATTLE_TERRAIN_POND');
export const BATTLE_TERRAIN_MOUNTAIN = defineNumber(battleConstantsSource, 'BATTLE_TERRAIN_MOUNTAIN');
export const BATTLE_TERRAIN_CAVE = defineNumber(battleConstantsSource, 'BATTLE_TERRAIN_CAVE');
export const BATTLE_TERRAIN_BUILDING = defineNumber(battleConstantsSource, 'BATTLE_TERRAIN_BUILDING');
export const BATTLE_TERRAIN_PLAIN = defineNumber(battleConstantsSource, 'BATTLE_TERRAIN_PLAIN');
export const TRAINER_BATTLE_SINGLE = defineNumber(battleSetupConstantsSource, 'TRAINER_BATTLE_SINGLE');
export const TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC = defineNumber(battleSetupConstantsSource, 'TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC');
export const TRAINER_BATTLE_CONTINUE_SCRIPT = defineNumber(battleSetupConstantsSource, 'TRAINER_BATTLE_CONTINUE_SCRIPT');
export const TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT = defineNumber(battleSetupConstantsSource, 'TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT');
export const TRAINER_BATTLE_DOUBLE = defineNumber(battleSetupConstantsSource, 'TRAINER_BATTLE_DOUBLE');
export const TRAINER_BATTLE_REMATCH = defineNumber(battleSetupConstantsSource, 'TRAINER_BATTLE_REMATCH');
export const TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE = defineNumber(battleSetupConstantsSource, 'TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE');
export const TRAINER_BATTLE_REMATCH_DOUBLE = defineNumber(battleSetupConstantsSource, 'TRAINER_BATTLE_REMATCH_DOUBLE');
export const TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE_NO_MUSIC = defineNumber(battleSetupConstantsSource, 'TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE_NO_MUSIC');
export const TRAINER_BATTLE_EARLY_RIVAL = defineNumber(battleSetupConstantsSource, 'TRAINER_BATTLE_EARLY_RIVAL');
export const SPECIES_NONE = defineNumber(speciesSource, 'SPECIES_NONE');
export const SPECIES_EGG = defineNumber(speciesSource, 'SPECIES_EGG');
export const SPECIES_WEEDLE = defineNumber(speciesSource, 'SPECIES_WEEDLE');
export const SPECIES_MAROWAK = defineNumber(speciesSource, 'SPECIES_MAROWAK');
export const SPECIES_MEWTWO = defineNumber(speciesSource, 'SPECIES_MEWTWO');
export const SPECIES_DEOXYS = defineNumber(speciesSource, 'SPECIES_DEOXYS');
export const SPECIES_MOLTRES = defineNumber(speciesSource, 'SPECIES_MOLTRES');
export const SPECIES_ARTICUNO = defineNumber(speciesSource, 'SPECIES_ARTICUNO');
export const SPECIES_ZAPDOS = defineNumber(speciesSource, 'SPECIES_ZAPDOS');
export const SPECIES_HO_OH = defineNumber(speciesSource, 'SPECIES_HO_OH');
export const SPECIES_LUGIA = defineNumber(speciesSource, 'SPECIES_LUGIA');
export const TRAINER_SECRET_BASE = defineNumber(trainerConstantsSource, 'TRAINER_SECRET_BASE');
export const TRAINER_CLASS_ELITE_FOUR = defineNumber(trainerConstantsSource, 'TRAINER_CLASS_ELITE_FOUR');
export const TRAINER_CLASS_CHAMPION = defineNumber(trainerConstantsSource, 'TRAINER_CLASS_CHAMPION');
export const TRAINER_ENCOUNTER_MUSIC_FEMALE = defineNumber(trainerConstantsSource, 'TRAINER_ENCOUNTER_MUSIC_FEMALE');
export const TRAINER_ENCOUNTER_MUSIC_GIRL = defineNumber(trainerConstantsSource, 'TRAINER_ENCOUNTER_MUSIC_GIRL');
export const TRAINER_ENCOUNTER_MUSIC_TWINS = defineNumber(trainerConstantsSource, 'TRAINER_ENCOUNTER_MUSIC_TWINS');
export const TRAINER_ENCOUNTER_MUSIC_MALE = defineNumber(trainerConstantsSource, 'TRAINER_ENCOUNTER_MUSIC_MALE');
export const TRAINER_ENCOUNTER_MUSIC_INTENSE = defineNumber(trainerConstantsSource, 'TRAINER_ENCOUNTER_MUSIC_INTENSE');
export const TRAINER_ENCOUNTER_MUSIC_COOL = defineNumber(trainerConstantsSource, 'TRAINER_ENCOUNTER_MUSIC_COOL');
export const TRAINER_ENCOUNTER_MUSIC_SWIMMER = defineNumber(trainerConstantsSource, 'TRAINER_ENCOUNTER_MUSIC_SWIMMER');
export const TRAINER_ENCOUNTER_MUSIC_ELITE_FOUR = defineNumber(trainerConstantsSource, 'TRAINER_ENCOUNTER_MUSIC_ELITE_FOUR');
export const TRAINER_ENCOUNTER_MUSIC_HIKER = defineNumber(trainerConstantsSource, 'TRAINER_ENCOUNTER_MUSIC_HIKER');
export const TRAINER_ENCOUNTER_MUSIC_INTERVIEWER = defineNumber(trainerConstantsSource, 'TRAINER_ENCOUNTER_MUSIC_INTERVIEWER');
export const TRAINER_ENCOUNTER_MUSIC_RICH = defineNumber(trainerConstantsSource, 'TRAINER_ENCOUNTER_MUSIC_RICH');
export const TRAINER_ELITE_FOUR_LORELEI = defineNumber(opponentsSource, 'TRAINER_ELITE_FOUR_LORELEI');
export const TRAINER_ELITE_FOUR_BRUNO = defineNumber(opponentsSource, 'TRAINER_ELITE_FOUR_BRUNO');
export const TRAINER_ELITE_FOUR_AGATHA = defineNumber(opponentsSource, 'TRAINER_ELITE_FOUR_AGATHA');
export const TRAINER_ELITE_FOUR_LANCE = defineNumber(opponentsSource, 'TRAINER_ELITE_FOUR_LANCE');
export const TRAINER_ELITE_FOUR_LORELEI_2 = defineNumber(opponentsSource, 'TRAINER_ELITE_FOUR_LORELEI_2');
export const TRAINER_ELITE_FOUR_BRUNO_2 = defineNumber(opponentsSource, 'TRAINER_ELITE_FOUR_BRUNO_2');
export const TRAINER_ELITE_FOUR_AGATHA_2 = defineNumber(opponentsSource, 'TRAINER_ELITE_FOUR_AGATHA_2');
export const TRAINER_ELITE_FOUR_LANCE_2 = defineNumber(opponentsSource, 'TRAINER_ELITE_FOUR_LANCE_2');
export const MUS_RS_VS_TRAINER = defineNumber(songsSource, 'MUS_RS_VS_TRAINER');
export const MUS_ENCOUNTER_ROCKET = defineNumber(songsSource, 'MUS_ENCOUNTER_ROCKET');
export const MUS_ENCOUNTER_GIRL = defineNumber(songsSource, 'MUS_ENCOUNTER_GIRL');
export const MUS_ENCOUNTER_BOY = defineNumber(songsSource, 'MUS_ENCOUNTER_BOY');
export const MUS_VS_DEOXYS = defineNumber(songsSource, 'MUS_VS_DEOXYS');
export const MUS_VS_MEWTWO = defineNumber(songsSource, 'MUS_VS_MEWTWO');
export const MUS_VS_LEGEND = defineNumber(songsSource, 'MUS_VS_LEGEND');

export const B_TRANSITION_BLUR = 0;
export const B_TRANSITION_SWIRL = 1;
export const B_TRANSITION_SHUFFLE = 2;
export const B_TRANSITION_BIG_POKEBALL = 3;
export const B_TRANSITION_POKEBALLS_TRAIL = 4;
export const B_TRANSITION_CLOCKWISE_WIPE = 5;
export const B_TRANSITION_RIPPLE = 6;
export const B_TRANSITION_WAVE = 7;
export const B_TRANSITION_SLICE = 8;
export const B_TRANSITION_WHITE_BARS_FADE = 9;
export const B_TRANSITION_GRID_SQUARES = 10;
export const B_TRANSITION_ANGLED_WIPES = 11;
export const B_TRANSITION_LORELEI = 12;
export const B_TRANSITION_BRUNO = 13;
export const B_TRANSITION_AGATHA = 14;
export const B_TRANSITION_LANCE = 15;
export const B_TRANSITION_BLUE = 16;

export const sBattleTransitionTable_Wild = [
  [B_TRANSITION_SLICE, B_TRANSITION_WHITE_BARS_FADE],
  [B_TRANSITION_CLOCKWISE_WIPE, B_TRANSITION_GRID_SQUARES],
  [B_TRANSITION_BLUR, B_TRANSITION_GRID_SQUARES],
  [B_TRANSITION_WAVE, B_TRANSITION_RIPPLE]
];
export const sBattleTransitionTable_Trainer = [
  [B_TRANSITION_POKEBALLS_TRAIL, B_TRANSITION_ANGLED_WIPES],
  [B_TRANSITION_SHUFFLE, B_TRANSITION_BIG_POKEBALL],
  [B_TRANSITION_BLUR, B_TRANSITION_GRID_SQUARES],
  [B_TRANSITION_SWIRL, B_TRANSITION_RIPPLE]
];

export interface BattleSetupTask { id: number; func: 'Task_BattleStart'; data: number[]; destroyed: boolean }
export interface BattleMon { species: number; hp: number; level: number; nickname?: string }
export interface TrainerData { partySize: number; partyFlags: number; partyLevels: number[]; trainerClass: number; doubleBattle: boolean; encounterMusic: number }
export interface BattleSetupRuntime {
  sTrainerBattleMode: number;
  gTrainerBattleOpponent_A: number;
  sTrainerObjectEventLocalId: number;
  sTrainerAIntroSpeech: number | null;
  sTrainerADefeatSpeech: number | null;
  sTrainerVictorySpeech: number | null;
  sTrainerCannotBattleSpeech: number | null;
  sTrainerBattleEndScript: number | null;
  sTrainerABattleScriptRetAddr: number | null;
  sRivalBattleFlags: number;
  tasks: BattleSetupTask[];
  bagItems: Set<number>;
  flags: Set<number>;
  safariZoneFlag: boolean;
  location: { mapGroup: number; mapNum: number };
  mapType: number;
  tileBehavior: string;
  flashLevel: number;
  playerAvatarFlags: number;
  playerParty: BattleMon[];
  enemyParty: BattleMon[];
  trainers: Record<number, TrainerData>;
  battleTransitionDone: boolean;
  poisonFieldEffectActive: boolean;
  gBattleTypeFlags: number;
  gBattleOutcome: number;
  gSpecialVar_Result: boolean | null;
  gSpecialVar_LastTalked: number;
  gSelectedObjectEvent: number;
  objectEvents: Array<{ localId: number; facingDirection: number; movementType?: number }>;
  mainCallback2: string | null;
  savedCallback: string | null;
  fieldCallback: string | null;
  currentScript: string | null;
  shownFieldMessage: number | string | null;
  lastBattleTransition: number | null;
  lastBattleSong: number | null;
  rematchTrainerId: number | null;
  qlPlaybackState: boolean;
  gameVersion: 'VERSION_FIRE_RED' | 'VERSION_LEAF_GREEN';
  operations: string[];
  gameStats: Record<string, number>;
}

export interface PointerBox<T = number> {
  value: T;
}

export const createBattleSetupRuntime = (): BattleSetupRuntime => ({
  sTrainerBattleMode: 0,
  gTrainerBattleOpponent_A: 0,
  sTrainerObjectEventLocalId: LOCALID_NONE,
  sTrainerAIntroSpeech: null,
  sTrainerADefeatSpeech: null,
  sTrainerVictorySpeech: null,
  sTrainerCannotBattleSpeech: null,
  sTrainerBattleEndScript: null,
  sTrainerABattleScriptRetAddr: null,
  sRivalBattleFlags: 0,
  tasks: [],
  bagItems: new Set(),
  flags: new Set(),
  safariZoneFlag: false,
  location: { mapGroup: 0, mapNum: 0 },
  mapType: MAP_TYPE_ROUTE,
  tileBehavior: 'plain',
  flashLevel: 0,
  playerAvatarFlags: 0,
  playerParty: [{ species: 1, hp: 1, level: 5 }],
  enemyParty: [{ species: 1, hp: 1, level: 3 }],
  trainers: {},
  battleTransitionDone: false,
  poisonFieldEffectActive: false,
  gBattleTypeFlags: 0,
  gBattleOutcome: B_OUTCOME_WON,
  gSpecialVar_Result: null,
  gSpecialVar_LastTalked: 0,
  gSelectedObjectEvent: 0,
  objectEvents: [],
  mainCallback2: null,
  savedCallback: null,
  fieldCallback: null,
  currentScript: null,
  shownFieldMessage: null,
  lastBattleTransition: null,
  lastBattleSong: null,
  rematchTrainerId: null,
  qlPlaybackState: false,
  gameVersion: 'VERSION_FIRE_RED',
  operations: [],
  gameStats: {}
});

export function Task_BattleStart(runtime: BattleSetupRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      if (!runtime.poisonFieldEffectActive) {
        runtime.operations.push('HelpSystem_Disable');
        runtime.lastBattleTransition = data[1];
        runtime.operations.push(`BattleTransition_StartOnField:${data[1]}`);
        data[0] += 1;
      }
      break;
    case 1:
      if (runtime.battleTransitionDone === true) {
        runtime.operations.push('HelpSystem_Enable');
        runtime.operations.push('CleanupOverworldWindowsAndTilemaps');
        SetMainCallback2(runtime, 'CB2_InitBattle');
        runtime.operations.push('RestartWildEncounterImmunitySteps');
        runtime.operations.push('ClearPoisonStepCounter');
        DestroyTask(runtime, taskId);
      }
      break;
  }
}

export function CreateBattleStartTask(runtime: BattleSetupRuntime, transition: number, song: number): number {
  const taskId = CreateTask(runtime, 'Task_BattleStart', 1);
  runtime.tasks[taskId].data[1] = transition;
  runtime.lastBattleSong = song;
  runtime.operations.push(`PlayMapChosenOrBattleBGM:${song}`);
  return taskId;
}

export function CheckSilphScopeInPokemonTower(runtime: BattleSetupRuntime, mapGroup: number, mapNum: number): boolean {
  if (mapGroup === 1 && (mapNum >= 1 && mapNum <= 7) && !runtime.bagItems.has(ITEM_SILPH_SCOPE)) return true;
  return false;
}

export function StartWildBattle(runtime: BattleSetupRuntime): void {
  if (runtime.safariZoneFlag) DoSafariBattle(runtime);
  else if (CheckSilphScopeInPokemonTower(runtime, runtime.location.mapGroup, runtime.location.mapNum)) DoGhostBattle(runtime);
  else DoStandardWildBattle(runtime);
}

export function DoStandardWildBattle(runtime: BattleSetupRuntime): void {
  lockFreezeStop(runtime, true);
  runtime.savedCallback = 'CB2_EndWildBattle';
  runtime.gBattleTypeFlags = 0;
  CreateBattleStartTask(runtime, GetWildBattleTransition(runtime), 0);
  IncrementGameStat(runtime, 'GAME_STAT_TOTAL_BATTLES');
  IncrementGameStat(runtime, 'GAME_STAT_WILD_BATTLES');
}

export function StartRoamerBattle(runtime: BattleSetupRuntime): void {
  lockFreezeStop(runtime, true);
  runtime.savedCallback = 'CB2_EndWildBattle';
  runtime.gBattleTypeFlags = BATTLE_TYPE_ROAMER;
  CreateBattleStartTask(runtime, GetWildBattleTransition(runtime), MUS_VS_LEGEND);
  IncrementGameStat(runtime, 'GAME_STAT_TOTAL_BATTLES');
  IncrementGameStat(runtime, 'GAME_STAT_WILD_BATTLES');
}

export function DoSafariBattle(runtime: BattleSetupRuntime): void {
  lockFreezeStop(runtime, true);
  runtime.savedCallback = 'CB2_EndSafariBattle';
  runtime.gBattleTypeFlags = BATTLE_TYPE_SAFARI;
  CreateBattleStartTask(runtime, GetWildBattleTransition(runtime), 0);
}

export function DoGhostBattle(runtime: BattleSetupRuntime): void {
  lockFreezeStop(runtime, true);
  runtime.savedCallback = 'CB2_EndWildBattle';
  runtime.gBattleTypeFlags = BATTLE_TYPE_GHOST;
  CreateBattleStartTask(runtime, GetWildBattleTransition(runtime), 0);
  runtime.enemyParty[0].nickname = 'gText_Ghost';
  IncrementGameStat(runtime, 'GAME_STAT_TOTAL_BATTLES');
  IncrementGameStat(runtime, 'GAME_STAT_WILD_BATTLES');
}

export function DoTrainerBattle(runtime: BattleSetupRuntime): void {
  CreateBattleStartTask(runtime, GetTrainerBattleTransition(runtime), 0);
  IncrementGameStat(runtime, 'GAME_STAT_TOTAL_BATTLES');
  IncrementGameStat(runtime, 'GAME_STAT_TRAINER_BATTLES');
}

export function StartOldManTutorialBattle(runtime: BattleSetupRuntime): void {
  runtime.enemyParty[0] = { species: SPECIES_WEEDLE, hp: 1, level: 5 };
  runtime.operations.push('CreateMaleMon:SPECIES_WEEDLE:5');
  runtime.operations.push('LockPlayerFieldControls');
  runtime.savedCallback = 'CB2_ReturnToFieldContinueScriptPlayMapMusic';
  runtime.gBattleTypeFlags = BATTLE_TYPE_OLD_MAN_TUTORIAL;
  CreateBattleStartTask(runtime, B_TRANSITION_SLICE, 0);
}

export function StartScriptedWildBattle(runtime: BattleSetupRuntime): void {
  runtime.operations.push('LockPlayerFieldControls');
  runtime.savedCallback = 'CB2_EndScriptedWildBattle';
  runtime.gBattleTypeFlags = BATTLE_TYPE_WILD_SCRIPTED;
  CreateBattleStartTask(runtime, GetWildBattleTransition(runtime), 0);
  IncrementGameStat(runtime, 'GAME_STAT_TOTAL_BATTLES');
  IncrementGameStat(runtime, 'GAME_STAT_WILD_BATTLES');
}

export function StartMarowakBattle(runtime: BattleSetupRuntime): void {
  runtime.operations.push('LockPlayerFieldControls');
  runtime.savedCallback = 'CB2_EndMarowakBattle';
  if (runtime.bagItems.has(ITEM_SILPH_SCOPE)) {
    runtime.gBattleTypeFlags = BATTLE_TYPE_GHOST | BATTLE_TYPE_GHOST_UNVEILED;
    runtime.enemyParty[0] = { species: SPECIES_MAROWAK, hp: 1, level: 30, nickname: 'gText_Ghost' };
    runtime.operations.push('CreateMonWithGenderNatureLetter:SPECIES_MAROWAK:30:31:MON_FEMALE:NATURE_SERIOUS:0');
  } else {
    runtime.gBattleTypeFlags = BATTLE_TYPE_GHOST;
    runtime.enemyParty[0].nickname = 'gText_Ghost';
  }
  CreateBattleStartTask(runtime, GetWildBattleTransition(runtime), 0);
  IncrementGameStat(runtime, 'GAME_STAT_TOTAL_BATTLES');
  IncrementGameStat(runtime, 'GAME_STAT_WILD_BATTLES');
}

export function StartSouthernIslandBattle(runtime: BattleSetupRuntime): void {
  runtime.operations.push('LockPlayerFieldControls');
  runtime.savedCallback = 'CB2_EndScriptedWildBattle';
  runtime.gBattleTypeFlags = BATTLE_TYPE_LEGENDARY;
  CreateBattleStartTask(runtime, GetWildBattleTransition(runtime), 0);
  IncrementGameStat(runtime, 'GAME_STAT_TOTAL_BATTLES');
  IncrementGameStat(runtime, 'GAME_STAT_WILD_BATTLES');
}

export function StartLegendaryBattle(runtime: BattleSetupRuntime): void {
  runtime.operations.push('LockPlayerFieldControls');
  runtime.savedCallback = 'CB2_EndScriptedWildBattle';
  runtime.gBattleTypeFlags = BATTLE_TYPE_LEGENDARY | BATTLE_TYPE_LEGENDARY_FRLG;
  const species = runtime.enemyParty[0].species;
  if (species === SPECIES_MEWTWO) CreateBattleStartTask(runtime, B_TRANSITION_BLUR, MUS_VS_MEWTWO);
  else if (species === SPECIES_DEOXYS) CreateBattleStartTask(runtime, B_TRANSITION_BLUR, MUS_VS_DEOXYS);
  else if ([SPECIES_MOLTRES, SPECIES_ARTICUNO, SPECIES_ZAPDOS, SPECIES_HO_OH, SPECIES_LUGIA].includes(species)) CreateBattleStartTask(runtime, B_TRANSITION_BLUR, MUS_VS_LEGEND);
  else CreateBattleStartTask(runtime, B_TRANSITION_BLUR, MUS_RS_VS_TRAINER);
  IncrementGameStat(runtime, 'GAME_STAT_TOTAL_BATTLES');
  IncrementGameStat(runtime, 'GAME_STAT_WILD_BATTLES');
}

export function StartGroudonKyogreBattle(runtime: BattleSetupRuntime): void {
  runtime.operations.push('LockPlayerFieldControls');
  runtime.savedCallback = 'CB2_EndScriptedWildBattle';
  runtime.gBattleTypeFlags = BATTLE_TYPE_LEGENDARY | BATTLE_TYPE_KYOGRE_GROUDON;
  CreateBattleStartTask(runtime, B_TRANSITION_ANGLED_WIPES, MUS_RS_VS_TRAINER);
  IncrementGameStat(runtime, 'GAME_STAT_TOTAL_BATTLES');
  IncrementGameStat(runtime, 'GAME_STAT_WILD_BATTLES');
}

export function StartRegiBattle(runtime: BattleSetupRuntime): void {
  runtime.operations.push('LockPlayerFieldControls');
  runtime.savedCallback = 'CB2_EndScriptedWildBattle';
  runtime.gBattleTypeFlags = BATTLE_TYPE_LEGENDARY | BATTLE_TYPE_REGI;
  CreateBattleStartTask(runtime, B_TRANSITION_BLUR, MUS_RS_VS_TRAINER);
  IncrementGameStat(runtime, 'GAME_STAT_TOTAL_BATTLES');
  IncrementGameStat(runtime, 'GAME_STAT_WILD_BATTLES');
}

export function CB2_EndWildBattle(runtime: BattleSetupRuntime): void {
  clearBattleGraphics(runtime);
  if (IsPlayerDefeated(runtime.gBattleOutcome)) SetMainCallback2(runtime, 'CB2_WhiteOut');
  else {
    SetMainCallback2(runtime, 'CB2_ReturnToField');
    runtime.fieldCallback = 'FieldCB_SafariZoneRanOutOfBalls';
  }
}

export function CB2_EndScriptedWildBattle(runtime: BattleSetupRuntime): void {
  clearBattleGraphics(runtime);
  if (IsPlayerDefeated(runtime.gBattleOutcome)) SetMainCallback2(runtime, 'CB2_WhiteOut');
  else SetMainCallback2(runtime, 'CB2_ReturnToFieldContinueScriptPlayMapMusic');
}

export function CB2_EndMarowakBattle(runtime: BattleSetupRuntime): void {
  clearBattleGraphics(runtime);
  if (IsPlayerDefeated(runtime.gBattleOutcome)) SetMainCallback2(runtime, 'CB2_WhiteOut');
  else {
    runtime.gSpecialVar_Result = runtime.gBattleOutcome !== B_OUTCOME_WON;
    SetMainCallback2(runtime, 'CB2_ReturnToFieldContinueScriptPlayMapMusic');
  }
}

export function BattleSetup_GetTerrainId(runtime: BattleSetupRuntime): number {
  const tileBehavior = runtime.tileBehavior;
  if (tileBehavior === 'tall_grass') return BATTLE_TERRAIN_GRASS;
  if (tileBehavior === 'long_grass') return BATTLE_TERRAIN_LONG_GRASS;
  if (tileBehavior === 'sand_or_shallow_flowing_water') return BATTLE_TERRAIN_SAND;
  switch (runtime.mapType) {
    case MAP_TYPE_TOWN:
    case MAP_TYPE_CITY:
    case MAP_TYPE_ROUTE:
      break;
    case MAP_TYPE_UNDERGROUND:
      if (tileBehavior === 'indoor_encounter') return BATTLE_TERRAIN_BUILDING;
      if (tileBehavior === 'surfable') return BATTLE_TERRAIN_POND;
      return BATTLE_TERRAIN_CAVE;
    case MAP_TYPE_INDOOR:
    case MAP_TYPE_SECRET_BASE:
      return BATTLE_TERRAIN_BUILDING;
    case MAP_TYPE_UNDERWATER:
      return BATTLE_TERRAIN_UNDERWATER;
    case MAP_TYPE_OCEAN_ROUTE:
      if (tileBehavior === 'surfable') return BATTLE_TERRAIN_WATER;
      return BATTLE_TERRAIN_PLAIN;
  }
  if (tileBehavior === 'deep_water') return BATTLE_TERRAIN_WATER;
  if (tileBehavior === 'surfable') return BATTLE_TERRAIN_POND;
  if (tileBehavior === 'mountain') return BATTLE_TERRAIN_MOUNTAIN;
  if (runtime.playerAvatarFlags & (1 << 3)) {
    if (tileBehavior === 'bridge_type') return BATTLE_TERRAIN_POND;
    if (tileBehavior === 'bridge') return BATTLE_TERRAIN_WATER;
  }
  return BATTLE_TERRAIN_PLAIN;
}

export function GetBattleTransitionTypeByMap(runtime: BattleSetupRuntime): number {
  if (runtime.flashLevel) return TRANSITION_TYPE_FLASH;
  if (runtime.tileBehavior === 'surfable') return TRANSITION_TYPE_WATER;
  switch (runtime.mapType) {
    case MAP_TYPE_UNDERGROUND:
      return TRANSITION_TYPE_CAVE;
    case MAP_TYPE_UNDERWATER:
      return TRANSITION_TYPE_WATER;
    default:
      return TRANSITION_TYPE_NORMAL;
  }
}

export function GetSumOfPlayerPartyLevel(runtime: BattleSetupRuntime, numMons: number): number {
  let sum = 0;
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const mon = runtime.playerParty[i];
    const species = mon?.species ?? SPECIES_NONE;
    if (species !== SPECIES_EGG && species !== SPECIES_NONE && (mon?.hp ?? 0) !== 0) {
      sum = (sum + (mon?.level ?? 0)) & 0xff;
      numMons -= 1;
      if (numMons === 0) break;
    }
  }
  return sum;
}

export function GetSumOfEnemyPartyLevel(runtime: BattleSetupRuntime, opponentId: number, numMons: number): number {
  const trainer = runtime.trainers[opponentId];
  let count = numMons;
  if ((trainer?.partySize ?? 0) < count) count = trainer?.partySize ?? 0;
  let sum = 0;
  for (let i = 0; i < count; i += 1) sum = (sum + (trainer?.partyLevels[i] ?? 0)) & 0xff;
  return sum;
}

export function GetWildBattleTransition(runtime: BattleSetupRuntime): number {
  const transitionType = GetBattleTransitionTypeByMap(runtime);
  const enemyLevel = runtime.enemyParty[0]?.level ?? 0;
  const playerLevel = GetSumOfPlayerPartyLevel(runtime, 1);
  return enemyLevel < playerLevel ? sBattleTransitionTable_Wild[transitionType][0] : sBattleTransitionTable_Wild[transitionType][1];
}

export function GetTrainerBattleTransition(runtime: BattleSetupRuntime): number {
  const opponent = runtime.gTrainerBattleOpponent_A;
  const trainer = runtime.trainers[opponent];
  if (opponent === TRAINER_SECRET_BASE) return B_TRANSITION_BLUE;
  if (trainer?.trainerClass === TRAINER_CLASS_ELITE_FOUR) {
    if (opponent === TRAINER_ELITE_FOUR_LORELEI || opponent === TRAINER_ELITE_FOUR_LORELEI_2) return B_TRANSITION_LORELEI;
    if (opponent === TRAINER_ELITE_FOUR_BRUNO || opponent === TRAINER_ELITE_FOUR_BRUNO_2) return B_TRANSITION_BRUNO;
    if (opponent === TRAINER_ELITE_FOUR_AGATHA || opponent === TRAINER_ELITE_FOUR_AGATHA_2) return B_TRANSITION_AGATHA;
    if (opponent === TRAINER_ELITE_FOUR_LANCE || opponent === TRAINER_ELITE_FOUR_LANCE_2) return B_TRANSITION_LANCE;
    return B_TRANSITION_BLUE;
  }
  if (trainer?.trainerClass === TRAINER_CLASS_CHAMPION) return B_TRANSITION_BLUE;
  const minPartyCount = trainer?.doubleBattle === true ? 2 : 1;
  const transitionType = GetBattleTransitionTypeByMap(runtime);
  const enemyLevel = GetSumOfEnemyPartyLevel(runtime, opponent, minPartyCount);
  const playerLevel = GetSumOfPlayerPartyLevel(runtime, minPartyCount);
  return enemyLevel < playerLevel ? sBattleTransitionTable_Trainer[transitionType][0] : sBattleTransitionTable_Trainer[transitionType][1];
}

export function BattleSetup_GetBattleTowerBattleTransition(runtime: BattleSetupRuntime): number {
  return (runtime.enemyParty[0]?.level ?? 0) < GetSumOfPlayerPartyLevel(runtime, 1) ? B_TRANSITION_POKEBALLS_TRAIL : B_TRANSITION_BIG_POKEBALL;
}

export function TrainerBattleLoadArg32(ptr: number[], offset = 0): number {
  return ((ptr[offset] ?? 0) | ((ptr[offset + 1] ?? 0) << 8) | ((ptr[offset + 2] ?? 0) << 16) | ((ptr[offset + 3] ?? 0) << 24)) >>> 0;
}

export function TrainerBattleLoadArg16(ptr: number[], offset = 0): number {
  return (ptr[offset] ?? 0) | ((ptr[offset + 1] ?? 0) << 8);
}

export function TrainerBattleLoadArg8(ptr: number[], offset = 0): number {
  return ptr[offset] ?? 0;
}

export function GetTrainerAFlag(runtime: BattleSetupRuntime): number {
  return TRAINER_FLAGS_START + runtime.gTrainerBattleOpponent_A;
}

export function IsPlayerDefeated(battleOutcome: number): boolean {
  switch (battleOutcome) {
    case B_OUTCOME_LOST:
    case B_OUTCOME_DREW:
      return true;
    case B_OUTCOME_WON:
    case B_OUTCOME_RAN:
    case B_OUTCOME_PLAYER_TELEPORTED:
    case B_OUTCOME_MON_FLED:
    case B_OUTCOME_CAUGHT:
    default:
      return false;
  }
}

export function InitTrainerBattleVariables(runtime: BattleSetupRuntime): void {
  runtime.sTrainerBattleMode = 0;
  runtime.gTrainerBattleOpponent_A = 0;
  runtime.sTrainerObjectEventLocalId = LOCALID_NONE;
  runtime.sTrainerAIntroSpeech = null;
  runtime.sTrainerADefeatSpeech = null;
  runtime.sTrainerVictorySpeech = null;
  runtime.sTrainerCannotBattleSpeech = null;
  runtime.sTrainerBattleEndScript = null;
  runtime.sTrainerABattleScriptRetAddr = null;
  runtime.sRivalBattleFlags = 0;
}

export function BattleSetup_ConfigureTrainerBattle(runtime: BattleSetupRuntime, data: number[]): string {
  InitTrainerBattleVariables(runtime);
  runtime.sTrainerBattleMode = TrainerBattleLoadArg8(data);
  switch (runtime.sTrainerBattleMode) {
    case TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT:
      TrainerBattleLoadArgs(runtime, 'ordinaryNoIntro', data);
      return 'EventScript_DoNoIntroTrainerBattle';
    case TRAINER_BATTLE_DOUBLE:
      TrainerBattleLoadArgs(runtime, 'double', data);
      SetMapVarsToTrainer(runtime);
      return 'EventScript_TryDoDoubleTrainerBattle';
    case TRAINER_BATTLE_CONTINUE_SCRIPT:
    case TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC:
      TrainerBattleLoadArgs(runtime, 'continueScript', data);
      SetMapVarsToTrainer(runtime);
      return 'EventScript_TryDoNormalTrainerBattle';
    case TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE:
    case TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE_NO_MUSIC:
      TrainerBattleLoadArgs(runtime, 'continueScriptDouble', data);
      SetMapVarsToTrainer(runtime);
      return 'EventScript_TryDoDoubleTrainerBattle';
    case TRAINER_BATTLE_REMATCH_DOUBLE:
      runtime.operations.push('QL_FinishRecordingScene');
      TrainerBattleLoadArgs(runtime, 'double', data);
      SetMapVarsToTrainer(runtime);
      runtime.gTrainerBattleOpponent_A = GetRematchTrainerId(runtime, runtime.gTrainerBattleOpponent_A);
      return 'EventScript_TryDoDoubleRematchBattle';
    case TRAINER_BATTLE_REMATCH:
      runtime.operations.push('QL_FinishRecordingScene');
      TrainerBattleLoadArgs(runtime, 'ordinary', data);
      SetMapVarsToTrainer(runtime);
      runtime.gTrainerBattleOpponent_A = GetRematchTrainerId(runtime, runtime.gTrainerBattleOpponent_A);
      return 'EventScript_TryDoRematchBattle';
    case TRAINER_BATTLE_EARLY_RIVAL:
      TrainerBattleLoadArgs(runtime, 'earlyRival', data);
      return 'EventScript_DoNoIntroTrainerBattle';
    default:
      TrainerBattleLoadArgs(runtime, 'ordinary', data);
      SetMapVarsToTrainer(runtime);
      return 'EventScript_TryDoNormalTrainerBattle';
  }
}

export function ConfigureAndSetUpOneTrainerBattle(runtime: BattleSetupRuntime, trainerEventObjId: number, trainerScript: number[]): void {
  runtime.gSelectedObjectEvent = trainerEventObjId;
  runtime.gSpecialVar_LastTalked = runtime.objectEvents[trainerEventObjId]?.localId ?? 0;
  BattleSetup_ConfigureTrainerBattle(runtime, trainerScript.slice(1));
  runtime.currentScript = 'EventScript_DoTrainerBattleFromApproach';
  runtime.operations.push('ScriptContext_SetupScript:EventScript_DoTrainerBattleFromApproach');
  runtime.operations.push('LockPlayerFieldControls');
}

export function GetTrainerFlagFromScriptPointer(runtime: BattleSetupRuntime, data: number[]): boolean {
  const flag = TrainerBattleLoadArg16(data, 2);
  return runtime.flags.has(TRAINER_FLAGS_START + flag);
}

export function SetUpTrainerMovement(runtime: BattleSetupRuntime): void {
  const objectEvent = runtime.objectEvents[runtime.gSelectedObjectEvent];
  objectEvent.movementType = objectEvent.facingDirection;
  runtime.operations.push(`SetTrainerMovementType:${objectEvent.localId}:${objectEvent.facingDirection}`);
}

export function GetTrainerBattleMode(runtime: BattleSetupRuntime): number { return runtime.sTrainerBattleMode; }
export function GetRivalBattleFlags(runtime: BattleSetupRuntime): number { return runtime.sRivalBattleFlags; }
export function Script_HasTrainerBeenFought(runtime: BattleSetupRuntime): boolean { return runtime.flags.has(GetTrainerAFlag(runtime)); }
export function SetBattledTrainerFlag(runtime: BattleSetupRuntime): void { runtime.flags.add(GetTrainerAFlag(runtime)); }
export function SetBattledTrainerFlag2(runtime: BattleSetupRuntime): void { runtime.flags.add(GetTrainerAFlag(runtime)); }
export function HasTrainerBeenFought(runtime: BattleSetupRuntime, trainerId: number): boolean { return runtime.flags.has(TRAINER_FLAGS_START + trainerId); }
export function SetTrainerFlag(runtime: BattleSetupRuntime, trainerId: number): void { runtime.flags.add(TRAINER_FLAGS_START + trainerId); }
export function ClearTrainerFlag(runtime: BattleSetupRuntime, trainerId: number): void { runtime.flags.delete(TRAINER_FLAGS_START + trainerId); }

export function EndPokedudeBattle(runtime: BattleSetupRuntime): void {
  runtime.operations.push('LoadPlayerParty');
  CB2_EndWildBattle(runtime);
}

export function StartPokedudeBattle(runtime: BattleSetupRuntime): void {
  runtime.operations.push('LockPlayerFieldControls');
  runtime.operations.push('FreezeObjectEvents');
  runtime.operations.push('StopPlayerAvatar');
  runtime.savedCallback = 'EndPokedudeBattle';
  runtime.operations.push('SavePlayerParty');
  runtime.operations.push('InitPokedudePartyAndOpponent');
  CreateBattleStartTask(runtime, GetWildBattleTransition(runtime), 0);
}

export function StartTrainerBattle(runtime: BattleSetupRuntime): void {
  runtime.gBattleTypeFlags = BATTLE_TYPE_TRAINER;
  if (GetTrainerBattleMode(runtime) === TRAINER_BATTLE_EARLY_RIVAL && (GetRivalBattleFlags(runtime) & RIVAL_BATTLE_TUTORIAL)) runtime.gBattleTypeFlags |= BATTLE_TYPE_FIRST_BATTLE;
  runtime.savedCallback = 'CB2_EndTrainerBattle';
  DoTrainerBattle(runtime);
  runtime.operations.push('ScriptContext_Stop');
}

export function CB2_EndTrainerBattle(runtime: BattleSetupRuntime): void {
  if (runtime.sTrainerBattleMode === TRAINER_BATTLE_EARLY_RIVAL) {
    if (IsPlayerDefeated(runtime.gBattleOutcome)) {
      runtime.gSpecialVar_Result = true;
      if (runtime.sRivalBattleFlags & RIVAL_BATTLE_HEAL_AFTER) runtime.operations.push('HealPlayerParty');
      else {
        SetMainCallback2(runtime, 'CB2_WhiteOut');
        return;
      }
      SetMainCallback2(runtime, 'CB2_ReturnToFieldContinueScriptPlayMapMusic');
      SetBattledTrainerFlag(runtime);
      runtime.operations.push('QuestLogEvents_HandleEndTrainerBattle');
    } else {
      runtime.gSpecialVar_Result = false;
      SetMainCallback2(runtime, 'CB2_ReturnToFieldContinueScriptPlayMapMusic');
      SetBattledTrainerFlag(runtime);
      runtime.operations.push('QuestLogEvents_HandleEndTrainerBattle');
    }
  } else if (runtime.gTrainerBattleOpponent_A === TRAINER_SECRET_BASE) SetMainCallback2(runtime, 'CB2_ReturnToFieldContinueScriptPlayMapMusic');
  else if (IsPlayerDefeated(runtime.gBattleOutcome)) SetMainCallback2(runtime, 'CB2_WhiteOut');
  else {
    SetMainCallback2(runtime, 'CB2_ReturnToFieldContinueScriptPlayMapMusic');
    SetBattledTrainerFlag(runtime);
    runtime.operations.push('QuestLogEvents_HandleEndTrainerBattle');
  }
}

export function CB2_EndRematchBattle(runtime: BattleSetupRuntime): void {
  if (runtime.gTrainerBattleOpponent_A === TRAINER_SECRET_BASE) SetMainCallback2(runtime, 'CB2_ReturnToFieldContinueScriptPlayMapMusic');
  else if (IsPlayerDefeated(runtime.gBattleOutcome)) SetMainCallback2(runtime, 'CB2_WhiteOut');
  else {
    SetMainCallback2(runtime, 'CB2_ReturnToFieldContinueScriptPlayMapMusic');
    SetBattledTrainerFlag(runtime);
    runtime.operations.push('ClearRematchStateOfLastTalked');
    runtime.operations.push('ResetDeferredLinkEvent');
  }
}

export function StartRematchBattle(runtime: BattleSetupRuntime): void {
  runtime.gBattleTypeFlags = BATTLE_TYPE_TRAINER;
  runtime.savedCallback = 'CB2_EndRematchBattle';
  DoTrainerBattle(runtime);
  runtime.operations.push('ScriptContext_Stop');
}

export function ShowTrainerIntroSpeech(runtime: BattleSetupRuntime): void { runtime.shownFieldMessage = ReturnEmptyStringIfNull(runtime.sTrainerAIntroSpeech); }
export function BattleSetup_GetScriptAddrAfterBattle(runtime: BattleSetupRuntime): number | string { return runtime.sTrainerBattleEndScript ?? 'EventScript_TestSignpostMsg'; }
export function BattleSetup_GetTrainerPostBattleScript(runtime: BattleSetupRuntime): number | string { return runtime.sTrainerABattleScriptRetAddr ?? 'EventScript_TestSignpostMsg'; }
export function ShowTrainerCantBattleSpeech(runtime: BattleSetupRuntime): void { runtime.shownFieldMessage = ReturnEmptyStringIfNull(runtime.sTrainerCannotBattleSpeech); }

export function PlayTrainerEncounterMusic(runtime: BattleSetupRuntime): void {
  if (!runtime.qlPlaybackState && runtime.sTrainerBattleMode !== TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC && runtime.sTrainerBattleMode !== TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE_NO_MUSIC) {
    let music: number;
    switch (runtime.trainers[runtime.gTrainerBattleOpponent_A]?.encounterMusic ?? 0) {
      case TRAINER_ENCOUNTER_MUSIC_FEMALE:
      case TRAINER_ENCOUNTER_MUSIC_GIRL:
      case TRAINER_ENCOUNTER_MUSIC_TWINS:
        music = MUS_ENCOUNTER_GIRL;
        break;
      case TRAINER_ENCOUNTER_MUSIC_MALE:
      case TRAINER_ENCOUNTER_MUSIC_INTENSE:
      case TRAINER_ENCOUNTER_MUSIC_COOL:
      case TRAINER_ENCOUNTER_MUSIC_SWIMMER:
      case TRAINER_ENCOUNTER_MUSIC_ELITE_FOUR:
      case TRAINER_ENCOUNTER_MUSIC_HIKER:
      case TRAINER_ENCOUNTER_MUSIC_INTERVIEWER:
      case TRAINER_ENCOUNTER_MUSIC_RICH:
        music = MUS_ENCOUNTER_BOY;
        break;
      default:
        music = MUS_ENCOUNTER_ROCKET;
        break;
    }
    runtime.operations.push(`PlayNewMapMusic:${music}`);
  }
}

export function GetTrainerALoseText(runtime: BattleSetupRuntime): number | string { return ReturnEmptyStringIfNull(runtime.sTrainerADefeatSpeech); }
export function GetTrainerWonSpeech(runtime: BattleSetupRuntime): number | string { return ReturnEmptyStringIfNull(runtime.sTrainerVictorySpeech); }

export function tickBattleSetupTask(runtime: BattleSetupRuntime, taskId: number): void {
  if (runtime.tasks[taskId]?.func === 'Task_BattleStart' && !runtime.tasks[taskId].destroyed) Task_BattleStart(runtime, taskId);
}

export function SetU8(ptr: number[] | PointerBox<number>, value: number): void {
  if (Array.isArray(ptr)) ptr[0] = value & 0xff;
  else ptr.value = value & 0xff;
}

export function SetU16(ptr: number[] | PointerBox<number>, value: number): void {
  if (Array.isArray(ptr)) ptr[0] = value & 0xffff;
  else ptr.value = value & 0xffff;
}

export function SetU32(ptr: number[] | PointerBox<number>, value: number): void {
  const normalized = value >>> 0;
  if (Array.isArray(ptr)) ptr[0] = normalized;
  else ptr.value = normalized;
}

export function SetPtr(ptr: unknown[] | PointerBox<unknown>, value: unknown): void {
  if (Array.isArray(ptr)) ptr[0] = value;
  else ptr.value = value;
}

export function TrainerBattleLoadArgs(runtime: BattleSetupRuntime, kind: 'ordinary' | 'continueScript' | 'double' | 'ordinaryNoIntro' | 'earlyRival' | 'continueScriptDouble', data: number[]): void {
  let offset = 0;
  runtime.sTrainerBattleMode = TrainerBattleLoadArg8(data, offset); offset += 1;
  runtime.gTrainerBattleOpponent_A = TrainerBattleLoadArg16(data, offset); offset += 2;
  if (kind === 'earlyRival') {
    runtime.sRivalBattleFlags = TrainerBattleLoadArg16(data, offset); offset += 2;
  } else {
    runtime.sTrainerObjectEventLocalId = TrainerBattleLoadArg16(data, offset); offset += 2;
  }
  runtime.sTrainerAIntroSpeech = kind === 'ordinaryNoIntro' || kind === 'earlyRival' ? null : TrainerBattleLoadArg32(data, offset); if (kind !== 'ordinaryNoIntro' && kind !== 'earlyRival') offset += 4;
  runtime.sTrainerADefeatSpeech = TrainerBattleLoadArg32(data, offset); offset += 4;
  runtime.sTrainerVictorySpeech = kind === 'earlyRival' ? TrainerBattleLoadArg32(data, offset) : null; if (kind === 'earlyRival') offset += 4;
  runtime.sTrainerCannotBattleSpeech = kind === 'double' || kind === 'continueScriptDouble' ? TrainerBattleLoadArg32(data, offset) : null; if (kind === 'double' || kind === 'continueScriptDouble') offset += 4;
  runtime.sTrainerABattleScriptRetAddr = kind === 'continueScript' || kind === 'continueScriptDouble' ? TrainerBattleLoadArg32(data, offset) : null; if (kind === 'continueScript' || kind === 'continueScriptDouble') offset += 4;
  runtime.sTrainerBattleEndScript = offset;
}

export function SetMapVarsToTrainer(runtime: BattleSetupRuntime): void {
  if (runtime.sTrainerObjectEventLocalId !== LOCALID_NONE) {
    runtime.gSpecialVar_LastTalked = runtime.sTrainerObjectEventLocalId;
    runtime.gSelectedObjectEvent = runtime.objectEvents.findIndex((event) => event.localId === runtime.sTrainerObjectEventLocalId);
  }
}

function GetRematchTrainerId(runtime: BattleSetupRuntime, trainerId: number): number {
  return runtime.rematchTrainerId ?? trainerId;
}

export function ReturnEmptyStringIfNull(value: number | null): number | string {
  return value ?? 'gString_Dummy';
}

export function GetIntroSpeechOfApproachingTrainer(runtime: BattleSetupRuntime): number | string {
  return ReturnEmptyStringIfNull(runtime.sTrainerAIntroSpeech);
}

export function GetTrainerCantBattleSpeech(runtime: BattleSetupRuntime): number | string {
  return ReturnEmptyStringIfNull(runtime.sTrainerCannotBattleSpeech);
}

function CreateTask(runtime: BattleSetupRuntime, func: 'Task_BattleStart', priority: number): number {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.operations.push(`CreateTask:${id}:${func}:${priority}`);
  return id;
}

function DestroyTask(runtime: BattleSetupRuntime, taskId: number): void {
  runtime.tasks[taskId].destroyed = true;
  runtime.operations.push(`DestroyTask:${taskId}`);
}

function SetMainCallback2(runtime: BattleSetupRuntime, callback: string): void {
  runtime.mainCallback2 = callback;
  runtime.operations.push(`SetMainCallback2:${callback}`);
}

function lockFreezeStop(runtime: BattleSetupRuntime, freeze: boolean): void {
  runtime.operations.push('LockPlayerFieldControls');
  if (freeze) runtime.operations.push('FreezeObjectEvents');
  runtime.operations.push('StopPlayerAvatar');
}

function IncrementGameStat(runtime: BattleSetupRuntime, stat: string): void {
  runtime.gameStats[stat] = (runtime.gameStats[stat] ?? 0) + 1;
  runtime.operations.push(`IncrementGameStat:${stat}`);
}

function clearBattleGraphics(runtime: BattleSetupRuntime): void {
  runtime.operations.push('CpuFill16:BG_PLTT');
  runtime.operations.push('ResetOamRange:0:128');
}

function defineNumber(source: string, name: string): number {
  return Number.parseInt(source.match(new RegExp(`#define\\s+${name}\\s+(0x[0-9A-Fa-f]+|\\d+)`, 'u'))?.[1] ?? '0', 0);
}

function defineExpr(source: string, name: string): number {
  const expr = source.match(new RegExp(`#define\\s+${name}\\s+\\(([^)]+)\\)`, 'u'))?.[1] ?? source.match(new RegExp(`#define\\s+${name}\\s+(0x[0-9A-Fa-f]+|\\d+)`, 'u'))?.[1] ?? '0';
  const shift = expr.match(/1\s*<<\s*(\d+)/u);
  return shift ? 1 << Number.parseInt(shift[1], 10) : Number.parseInt(expr, 0);
}
