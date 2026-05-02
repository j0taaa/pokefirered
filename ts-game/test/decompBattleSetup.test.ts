import { describe, expect, test } from 'vitest';
import {
  BATTLE_TERRAIN_BUILDING,
  BATTLE_TERRAIN_CAVE,
  BATTLE_TERRAIN_GRASS,
  BATTLE_TERRAIN_PLAIN,
  BATTLE_TERRAIN_POND,
  BATTLE_TERRAIN_UNDERWATER,
  BATTLE_TERRAIN_WATER,
  BATTLE_TYPE_FIRST_BATTLE,
  BATTLE_TYPE_GHOST,
  BATTLE_TYPE_GHOST_UNVEILED,
  BATTLE_TYPE_LEGENDARY,
  BATTLE_TYPE_LEGENDARY_FRLG,
  BATTLE_TYPE_ROAMER,
  BATTLE_TYPE_SAFARI,
  BATTLE_TYPE_TRAINER,
  BATTLE_TYPE_WILD_SCRIPTED,
  B_OUTCOME_DREW,
  B_OUTCOME_LOST,
  B_OUTCOME_RAN,
  B_OUTCOME_WON,
  B_TRANSITION_ANGLED_WIPES,
  B_TRANSITION_BIG_POKEBALL,
  B_TRANSITION_BLUE,
  B_TRANSITION_BRUNO,
  B_TRANSITION_CLOCKWISE_WIPE,
  B_TRANSITION_GRID_SQUARES,
  B_TRANSITION_LORELEI,
  B_TRANSITION_POKEBALLS_TRAIL,
  B_TRANSITION_RIPPLE,
  B_TRANSITION_SHUFFLE,
  B_TRANSITION_SLICE,
  B_TRANSITION_SWIRL,
  B_TRANSITION_WAVE,
  B_TRANSITION_WHITE_BARS_FADE,
  BattleSetup_ConfigureTrainerBattle,
  BattleSetup_GetBattleTowerBattleTransition,
  BattleSetup_GetScriptAddrAfterBattle,
  BattleSetup_GetTerrainId,
  BattleSetup_GetTrainerPostBattleScript,
  CB2_EndMarowakBattle,
  CB2_EndRematchBattle,
  CB2_EndScriptedWildBattle,
  CB2_EndTrainerBattle,
  CB2_EndWildBattle,
  ConfigureAndSetUpOneTrainerBattle,
  CreateBattleStartTask,
  EndPokedudeBattle,
  GetIntroSpeechOfApproachingTrainer,
  GetSumOfEnemyPartyLevel,
  GetSumOfPlayerPartyLevel,
  GetTrainerALoseText,
  GetTrainerBattleTransition,
  GetTrainerCantBattleSpeech,
  GetTrainerFlagFromScriptPointer,
  GetTrainerWonSpeech,
  GetWildBattleTransition,
  HasTrainerBeenFought,
  ITEM_SILPH_SCOPE,
  IsPlayerDefeated,
  MAP_TYPE_INDOOR,
  MAP_TYPE_OCEAN_ROUTE,
  MAP_TYPE_ROUTE,
  MAP_TYPE_UNDERGROUND,
  MAP_TYPE_UNDERWATER,
  MUS_ENCOUNTER_BOY,
  MUS_ENCOUNTER_GIRL,
  MUS_ENCOUNTER_ROCKET,
  MUS_RS_VS_TRAINER,
  MUS_VS_DEOXYS,
  MUS_VS_LEGEND,
  MUS_VS_MEWTWO,
  PlayTrainerEncounterMusic,
  RIVAL_BATTLE_HEAL_AFTER,
  RIVAL_BATTLE_TUTORIAL,
  ReturnEmptyStringIfNull,
  SPECIES_DEOXYS,
  SPECIES_EGG,
  SPECIES_HO_OH,
  SPECIES_MEWTWO,
  SPECIES_NONE,
  SetBattledTrainerFlag2,
  SetMapVarsToTrainer,
  SetPtr,
  SetU16,
  SetU32,
  SetU8,
  StartLegendaryBattle,
  StartMarowakBattle,
  StartOldManTutorialBattle,
  StartPokedudeBattle,
  StartRematchBattle,
  StartRoamerBattle,
  StartScriptedWildBattle,
  StartSouthernIslandBattle,
  StartTrainerBattle,
  StartWildBattle,
  TRAINER_BATTLE_CONTINUE_SCRIPT,
  TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE,
  TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE_NO_MUSIC,
  TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC,
  TRAINER_BATTLE_DOUBLE,
  TRAINER_BATTLE_EARLY_RIVAL,
  TRAINER_BATTLE_REMATCH,
  TRAINER_BATTLE_REMATCH_DOUBLE,
  TRAINER_BATTLE_SINGLE,
  TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT,
  TRAINER_CLASS_CHAMPION,
  TRAINER_CLASS_ELITE_FOUR,
  TRAINER_ELITE_FOUR_BRUNO,
  TRAINER_ELITE_FOUR_LORELEI,
  TRAINER_ENCOUNTER_MUSIC_FEMALE,
  TRAINER_ENCOUNTER_MUSIC_INTENSE,
  TRAINER_SECRET_BASE,
  Task_BattleStart,
  TrainerBattleLoadArgs,
  createBattleSetupRuntime,
  tickBattleSetupTask
} from '../src/game/decompBattleSetup';

describe('decomp battle setup', () => {
  test('runs the battle-start task in the same two states as C', () => {
    const runtime = createBattleSetupRuntime();
    const taskId = CreateBattleStartTask(runtime, B_TRANSITION_SLICE, 0);
    runtime.poisonFieldEffectActive = true;
    Task_BattleStart(runtime, taskId);
    expect(runtime.tasks[taskId].data[0]).toBe(0);
    runtime.poisonFieldEffectActive = false;
    tickBattleSetupTask(runtime, taskId);
    expect(runtime.lastBattleTransition).toBe(B_TRANSITION_SLICE);
    expect(runtime.tasks[taskId].data[0]).toBe(1);
    runtime.battleTransitionDone = true;
    Task_BattleStart(runtime, taskId);
    expect(runtime.mainCallback2).toBe('CB2_InitBattle');
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('starts wild, safari, ghost, scripted, roamer, and legendary battles with exact flags/callbacks/music', () => {
    const standard = createBattleSetupRuntime();
    StartWildBattle(standard);
    expect(standard.savedCallback).toBe('CB2_EndWildBattle');
    expect(standard.gBattleTypeFlags).toBe(0);
    expect(standard.gameStats).toMatchObject({ GAME_STAT_TOTAL_BATTLES: 1, GAME_STAT_WILD_BATTLES: 1 });

    const safari = createBattleSetupRuntime();
    safari.safariZoneFlag = true;
    StartWildBattle(safari);
    expect(safari.savedCallback).toBe('CB2_EndSafariBattle');
    expect(safari.gBattleTypeFlags).toBe(BATTLE_TYPE_SAFARI);
    expect(safari.gameStats.GAME_STAT_TOTAL_BATTLES).toBeUndefined();

    const ghost = createBattleSetupRuntime();
    ghost.location = { mapGroup: 1, mapNum: 5 };
    StartWildBattle(ghost);
    expect(ghost.gBattleTypeFlags).toBe(BATTLE_TYPE_GHOST);
    expect(ghost.enemyParty[0].nickname).toBe('gText_Ghost');

    const roamer = createBattleSetupRuntime();
    StartRoamerBattle(roamer);
    expect(roamer.gBattleTypeFlags).toBe(BATTLE_TYPE_ROAMER);
    expect(roamer.lastBattleSong).toBe(MUS_VS_LEGEND);

    const scripted = createBattleSetupRuntime();
    StartScriptedWildBattle(scripted);
    expect(scripted.gBattleTypeFlags).toBe(BATTLE_TYPE_WILD_SCRIPTED);
    expect(scripted.savedCallback).toBe('CB2_EndScriptedWildBattle');

    const legendary = createBattleSetupRuntime();
    legendary.enemyParty[0].species = SPECIES_MEWTWO;
    StartLegendaryBattle(legendary);
    expect(legendary.gBattleTypeFlags).toBe(BATTLE_TYPE_LEGENDARY | BATTLE_TYPE_LEGENDARY_FRLG);
    expect(legendary.lastBattleSong).toBe(MUS_VS_MEWTWO);
    legendary.enemyParty[0].species = SPECIES_DEOXYS;
    StartLegendaryBattle(legendary);
    expect(legendary.lastBattleSong).toBe(MUS_VS_DEOXYS);
    legendary.enemyParty[0].species = SPECIES_HO_OH;
    StartLegendaryBattle(legendary);
    expect(legendary.lastBattleSong).toBe(MUS_VS_LEGEND);
    legendary.enemyParty[0].species = 1;
    StartLegendaryBattle(legendary);
    expect(legendary.lastBattleSong).toBe(MUS_RS_VS_TRAINER);
  });

  test('handles Marowak, old-man, and Southern Island setup branches', () => {
    const marowak = createBattleSetupRuntime();
    StartMarowakBattle(marowak);
    expect(marowak.gBattleTypeFlags).toBe(BATTLE_TYPE_GHOST);
    expect(marowak.enemyParty[0].nickname).toBe('gText_Ghost');
    marowak.bagItems.add(ITEM_SILPH_SCOPE);
    StartMarowakBattle(marowak);
    expect(marowak.gBattleTypeFlags).toBe(BATTLE_TYPE_GHOST | BATTLE_TYPE_GHOST_UNVEILED);
    expect(marowak.enemyParty[0].level).toBe(30);

    const oldMan = createBattleSetupRuntime();
    StartOldManTutorialBattle(oldMan);
    expect(oldMan.gBattleTypeFlags).toBe(1 << 9);
    expect(oldMan.lastBattleTransition).toBeNull();
    expect(oldMan.tasks[0].data[1]).toBe(B_TRANSITION_SLICE);

    const southern = createBattleSetupRuntime();
    StartSouthernIslandBattle(southern);
    expect(southern.gBattleTypeFlags).toBe(BATTLE_TYPE_LEGENDARY);
  });

  test('selects terrain and transitions from map type, metatile, flash, and party levels', () => {
    const runtime = createBattleSetupRuntime();
    runtime.tileBehavior = 'tall_grass';
    expect(BattleSetup_GetTerrainId(runtime)).toBe(BATTLE_TERRAIN_GRASS);
    runtime.tileBehavior = 'surfable';
    runtime.mapType = MAP_TYPE_UNDERGROUND;
    expect(BattleSetup_GetTerrainId(runtime)).toBe(BATTLE_TERRAIN_POND);
    runtime.tileBehavior = 'plain';
    expect(BattleSetup_GetTerrainId(runtime)).toBe(BATTLE_TERRAIN_CAVE);
    runtime.mapType = MAP_TYPE_INDOOR;
    expect(BattleSetup_GetTerrainId(runtime)).toBe(BATTLE_TERRAIN_BUILDING);
    runtime.mapType = MAP_TYPE_UNDERWATER;
    expect(BattleSetup_GetTerrainId(runtime)).toBe(BATTLE_TERRAIN_UNDERWATER);
    runtime.mapType = MAP_TYPE_OCEAN_ROUTE;
    runtime.tileBehavior = 'surfable';
    expect(BattleSetup_GetTerrainId(runtime)).toBe(BATTLE_TERRAIN_WATER);
    runtime.mapType = MAP_TYPE_ROUTE;
    runtime.tileBehavior = 'plain';
    expect(BattleSetup_GetTerrainId(runtime)).toBe(BATTLE_TERRAIN_PLAIN);

    runtime.playerParty = [{ species: 1, hp: 1, level: 10 }];
    runtime.enemyParty = [{ species: 1, hp: 1, level: 5 }];
    expect(GetWildBattleTransition(runtime)).toBe(B_TRANSITION_SLICE);
    runtime.enemyParty[0].level = 10;
    expect(GetWildBattleTransition(runtime)).toBe(B_TRANSITION_WHITE_BARS_FADE);
    runtime.flashLevel = 1;
    expect(GetWildBattleTransition(runtime)).toBe(B_TRANSITION_GRID_SQUARES);
    runtime.flashLevel = 0;
    runtime.tileBehavior = 'surfable';
    runtime.enemyParty[0].level = 1;
    expect(GetWildBattleTransition(runtime)).toBe(B_TRANSITION_WAVE);
    runtime.enemyParty[0].level = 99;
    expect(GetWildBattleTransition(runtime)).toBe(B_TRANSITION_RIPPLE);
    runtime.mapType = MAP_TYPE_UNDERGROUND;
    runtime.tileBehavior = 'plain';
    runtime.enemyParty[0].level = 1;
    expect(GetWildBattleTransition(runtime)).toBe(B_TRANSITION_CLOCKWISE_WIPE);
  });

  test('sums player and trainer party levels with the same count/egg/hp filters', () => {
    const runtime = createBattleSetupRuntime();
    runtime.playerParty = [
      { species: SPECIES_NONE, hp: 1, level: 99 },
      { species: SPECIES_EGG, hp: 1, level: 99 },
      { species: 1, hp: 0, level: 99 },
      { species: 1, hp: 1, level: 10 },
      { species: 2, hp: 1, level: 20 }
    ];
    expect(GetSumOfPlayerPartyLevel(runtime, 1)).toBe(10);
    expect(GetSumOfPlayerPartyLevel(runtime, 2)).toBe(30);
    runtime.trainers[7] = { partySize: 1, partyFlags: 0, partyLevels: [40, 50], trainerClass: 0, doubleBattle: false, encounterMusic: 0 };
    expect(GetSumOfEnemyPartyLevel(runtime, 7, 2)).toBe(40);
  });

  test('selects trainer transitions including elite four, champion, secret base, double, cave and water branches', () => {
    const runtime = createBattleSetupRuntime();
    runtime.gTrainerBattleOpponent_A = TRAINER_SECRET_BASE;
    expect(GetTrainerBattleTransition(runtime)).toBe(B_TRANSITION_BLUE);
    runtime.gTrainerBattleOpponent_A = TRAINER_ELITE_FOUR_LORELEI;
    runtime.trainers[TRAINER_ELITE_FOUR_LORELEI] = trainer({ trainerClass: TRAINER_CLASS_ELITE_FOUR });
    expect(GetTrainerBattleTransition(runtime)).toBe(B_TRANSITION_LORELEI);
    runtime.gTrainerBattleOpponent_A = TRAINER_ELITE_FOUR_BRUNO;
    runtime.trainers[TRAINER_ELITE_FOUR_BRUNO] = trainer({ trainerClass: TRAINER_CLASS_ELITE_FOUR });
    expect(GetTrainerBattleTransition(runtime)).toBe(B_TRANSITION_BRUNO);
    runtime.gTrainerBattleOpponent_A = 5000;
    runtime.trainers[5000] = trainer({ trainerClass: TRAINER_CLASS_CHAMPION });
    expect(GetTrainerBattleTransition(runtime)).toBe(B_TRANSITION_BLUE);

    runtime.gTrainerBattleOpponent_A = 10;
    runtime.trainers[10] = trainer({ partyLevels: [5], partySize: 1 });
    runtime.playerParty = [{ species: 1, hp: 1, level: 10 }];
    runtime.mapType = MAP_TYPE_ROUTE;
    runtime.tileBehavior = 'plain';
    expect(GetTrainerBattleTransition(runtime)).toBe(B_TRANSITION_POKEBALLS_TRAIL);
    runtime.trainers[10].partyLevels = [10];
    expect(GetTrainerBattleTransition(runtime)).toBe(B_TRANSITION_ANGLED_WIPES);
    runtime.mapType = MAP_TYPE_UNDERGROUND;
    runtime.trainers[10].partyLevels = [1];
    expect(GetTrainerBattleTransition(runtime)).toBe(B_TRANSITION_SHUFFLE);
    runtime.trainers[10].partyLevels = [99];
    expect(GetTrainerBattleTransition(runtime)).toBe(B_TRANSITION_BIG_POKEBALL);
    runtime.mapType = MAP_TYPE_ROUTE;
    runtime.tileBehavior = 'surfable';
    runtime.trainers[10].partyLevels = [1];
    expect(GetTrainerBattleTransition(runtime)).toBe(B_TRANSITION_SWIRL);
    runtime.trainers[10].partyLevels = [99];
    expect(GetTrainerBattleTransition(runtime)).toBe(B_TRANSITION_RIPPLE);
  });

  test('parses trainer battle scripts and returns the same event-script labels', () => {
    const runtime = createBattleSetupRuntime();
    runtime.objectEvents = [{ localId: 0, facingDirection: 1 }, { localId: 9, facingDirection: 2 }];
    expect(BattleSetup_ConfigureTrainerBattle(runtime, battleBytes(TRAINER_BATTLE_SINGLE, 100, 9, 0x11111111, 0x22222222))).toBe('EventScript_TryDoNormalTrainerBattle');
    expect(runtime.gTrainerBattleOpponent_A).toBe(100);
    expect(runtime.sTrainerAIntroSpeech).toBe(0x11111111);
    expect(runtime.sTrainerADefeatSpeech).toBe(0x22222222);
    expect(runtime.gSpecialVar_LastTalked).toBe(9);
    expect(runtime.gSelectedObjectEvent).toBe(1);

    expect(BattleSetup_ConfigureTrainerBattle(runtime, battleBytes(TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT, 101, 0, 0x33333333))).toBe('EventScript_DoNoIntroTrainerBattle');
    expect(runtime.sTrainerAIntroSpeech).toBeNull();
    expect(runtime.sTrainerADefeatSpeech).toBe(0x33333333);

    expect(BattleSetup_ConfigureTrainerBattle(runtime, battleBytes(TRAINER_BATTLE_DOUBLE, 102, 9, 0x11, 0x22, 0x33))).toBe('EventScript_TryDoDoubleTrainerBattle');
    expect(runtime.sTrainerCannotBattleSpeech).toBe(0x33);

    expect(BattleSetup_ConfigureTrainerBattle(runtime, battleBytes(TRAINER_BATTLE_CONTINUE_SCRIPT, 103, 9, 0x44, 0x55, 0x66))).toBe('EventScript_TryDoNormalTrainerBattle');
    expect(runtime.sTrainerABattleScriptRetAddr).toBe(0x66);

    expect(BattleSetup_ConfigureTrainerBattle(runtime, battleBytes(TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE, 104, 9, 0x77, 0x88, 0x99, 0xaa))).toBe('EventScript_TryDoDoubleTrainerBattle');
    expect(runtime.sTrainerCannotBattleSpeech).toBe(0x99);
    expect(runtime.sTrainerABattleScriptRetAddr).toBe(0xaa);

    runtime.rematchTrainerId = 777;
    expect(BattleSetup_ConfigureTrainerBattle(runtime, battleBytes(TRAINER_BATTLE_REMATCH, 105, 9, 0x12, 0x13))).toBe('EventScript_TryDoRematchBattle');
    expect(runtime.gTrainerBattleOpponent_A).toBe(777);
    expect(runtime.operations).toContain('QL_FinishRecordingScene');

    expect(BattleSetup_ConfigureTrainerBattle(runtime, earlyRivalBytes(106, RIVAL_BATTLE_HEAL_AFTER, 0x21, 0x22))).toBe('EventScript_DoNoIntroTrainerBattle');
    expect(runtime.sRivalBattleFlags).toBe(RIVAL_BATTLE_HEAL_AFTER);
    expect(runtime.sTrainerVictorySpeech).toBe(0x22);

    expect(BattleSetup_ConfigureTrainerBattle(runtime, battleBytes(TRAINER_BATTLE_REMATCH_DOUBLE, 107, 9, 0x31, 0x32, 0x33))).toBe('EventScript_TryDoDoubleRematchBattle');
    expect(BattleSetup_ConfigureTrainerBattle(runtime, battleBytes(TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC, 108, 9, 0x41, 0x42, 0x43))).toBe('EventScript_TryDoNormalTrainerBattle');
    expect(BattleSetup_ConfigureTrainerBattle(runtime, battleBytes(TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE_NO_MUSIC, 109, 9, 0x51, 0x52, 0x53, 0x54))).toBe('EventScript_TryDoDoubleTrainerBattle');
  });

  test('handles trainer flags, approach setup, battle starts, and battle-end callbacks', () => {
    const runtime = createBattleSetupRuntime();
    runtime.objectEvents = [{ localId: 7, facingDirection: 3 }];
    ConfigureAndSetUpOneTrainerBattle(runtime, 0, [0, ...battleBytes(TRAINER_BATTLE_SINGLE, 55, 7, 0x10, 0x20)]);
    expect(runtime.currentScript).toBe('EventScript_DoTrainerBattleFromApproach');
    expect(runtime.gSpecialVar_LastTalked).toBe(7);
    expect(GetTrainerFlagFromScriptPointer(runtime, [0, 0, 55, 0])).toBe(false);
    runtime.flags.add(0x500 + 55);
    expect(GetTrainerFlagFromScriptPointer(runtime, [0, 0, 55, 0])).toBe(true);
    expect(HasTrainerBeenFought(runtime, 55)).toBe(true);

    runtime.sTrainerBattleMode = TRAINER_BATTLE_EARLY_RIVAL;
    runtime.sRivalBattleFlags = RIVAL_BATTLE_TUTORIAL;
    runtime.gTrainerBattleOpponent_A = 55;
    runtime.trainers[55] = trainer();
    StartTrainerBattle(runtime);
    expect(runtime.gBattleTypeFlags).toBe(BATTLE_TYPE_TRAINER | BATTLE_TYPE_FIRST_BATTLE);
    expect(runtime.savedCallback).toBe('CB2_EndTrainerBattle');

    runtime.gBattleOutcome = B_OUTCOME_LOST;
    runtime.sRivalBattleFlags = RIVAL_BATTLE_HEAL_AFTER;
    CB2_EndTrainerBattle(runtime);
    expect(runtime.gSpecialVar_Result).toBe(true);
    expect(runtime.mainCallback2).toBe('CB2_ReturnToFieldContinueScriptPlayMapMusic');
    expect(runtime.operations).toContain('HealPlayerParty');

    const rematch = createBattleSetupRuntime();
    rematch.gTrainerBattleOpponent_A = 12;
    rematch.trainers[12] = trainer();
    StartRematchBattle(rematch);
    expect(rematch.savedCallback).toBe('CB2_EndRematchBattle');
    CB2_EndRematchBattle(rematch);
    expect(rematch.flags.has(0x500 + 12)).toBe(true);
    expect(rematch.operations).toContain('ClearRematchStateOfLastTalked');
  });

  test('handles wild/scripted/trainer end callback outcomes, texts, and encounter music', () => {
    const runtime = createBattleSetupRuntime();
    runtime.gBattleOutcome = B_OUTCOME_LOST;
    CB2_EndWildBattle(runtime);
    expect(runtime.mainCallback2).toBe('CB2_WhiteOut');
    runtime.gBattleOutcome = B_OUTCOME_RAN;
    CB2_EndWildBattle(runtime);
    expect(runtime.mainCallback2).toBe('CB2_ReturnToField');
    expect(runtime.fieldCallback).toBe('FieldCB_SafariZoneRanOutOfBalls');

    CB2_EndScriptedWildBattle(runtime);
    expect(runtime.mainCallback2).toBe('CB2_ReturnToFieldContinueScriptPlayMapMusic');
    runtime.gBattleOutcome = B_OUTCOME_WON;
    CB2_EndMarowakBattle(runtime);
    expect(runtime.gSpecialVar_Result).toBe(false);
    runtime.gBattleOutcome = B_OUTCOME_RAN;
    CB2_EndMarowakBattle(runtime);
    expect(runtime.gSpecialVar_Result).toBe(true);

    expect(IsPlayerDefeated(B_OUTCOME_LOST)).toBe(true);
    expect(IsPlayerDefeated(B_OUTCOME_DREW)).toBe(true);
    expect(IsPlayerDefeated(B_OUTCOME_WON)).toBe(false);

    runtime.sTrainerBattleEndScript = null;
    runtime.sTrainerABattleScriptRetAddr = null;
    expect(BattleSetup_GetScriptAddrAfterBattle(runtime)).toBe('EventScript_TestSignpostMsg');
    expect(BattleSetup_GetTrainerPostBattleScript(runtime)).toBe('EventScript_TestSignpostMsg');
    runtime.sTrainerADefeatSpeech = 123;
    runtime.sTrainerVictorySpeech = 456;
    runtime.sTrainerAIntroSpeech = 789;
    runtime.sTrainerCannotBattleSpeech = null;
    expect(ReturnEmptyStringIfNull(null)).toBe('gString_Dummy');
    expect(ReturnEmptyStringIfNull(321)).toBe(321);
    expect(GetIntroSpeechOfApproachingTrainer(runtime)).toBe(789);
    expect(GetTrainerCantBattleSpeech(runtime)).toBe('gString_Dummy');
    expect(GetTrainerALoseText(runtime)).toBe(123);
    expect(GetTrainerWonSpeech(runtime)).toBe(456);

    runtime.gTrainerBattleOpponent_A = 1;
    runtime.trainers[1] = trainer({ encounterMusic: TRAINER_ENCOUNTER_MUSIC_FEMALE });
    PlayTrainerEncounterMusic(runtime);
    expect(runtime.operations).toContain(`PlayNewMapMusic:${MUS_ENCOUNTER_GIRL}`);
    runtime.trainers[1].encounterMusic = TRAINER_ENCOUNTER_MUSIC_INTENSE;
    PlayTrainerEncounterMusic(runtime);
    expect(runtime.operations).toContain(`PlayNewMapMusic:${MUS_ENCOUNTER_BOY}`);
    runtime.trainers[1].encounterMusic = 99;
    PlayTrainerEncounterMusic(runtime);
    expect(runtime.operations).toContain(`PlayNewMapMusic:${MUS_ENCOUNTER_ROCKET}`);
    runtime.sTrainerBattleMode = TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC;
    const before = runtime.operations.length;
    PlayTrainerEncounterMusic(runtime);
    expect(runtime.operations).toHaveLength(before);
  });

  test('returns battle tower transitions by comparing enemy and player lead levels', () => {
    const runtime = createBattleSetupRuntime();
    runtime.playerParty = [{ species: 1, hp: 1, level: 50 }];
    runtime.enemyParty = [{ species: 1, hp: 1, level: 49 }];
    expect(BattleSetup_GetBattleTowerBattleTransition(runtime)).toBe(B_TRANSITION_POKEBALLS_TRAIL);
    runtime.enemyParty[0].level = 50;
    expect(BattleSetup_GetBattleTowerBattleTransition(runtime)).toBe(B_TRANSITION_BIG_POKEBALL);
  });

  test('exact C-name battle setup helpers preserve primitive stores, trainer args, map vars, flags, and Pokedude flow', () => {
    const u8 = [0];
    const u16 = [0];
    const u32box = [0];
    const ptr = [0];
    SetU8(u8, 0x123);
    SetU16(u16, 0x12345);
    SetU32(u32box, -1);
    SetPtr(ptr, 0xfeed);
    expect(u8[0]).toBe(0x23);
    expect(u16[0]).toBe(0x2345);
    expect(u32box[0]).toBe(0xffffffff);
    expect(ptr[0]).toBe(0xfeed);

    const runtime = createBattleSetupRuntime();
    TrainerBattleLoadArgs(runtime, 'continueScriptDouble', battleBytes(TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE, 123, 9, 0x11, 0x22, 0x33, 0x44));
    expect(runtime.sTrainerBattleMode).toBe(TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE);
    expect(runtime.gTrainerBattleOpponent_A).toBe(123);
    expect(runtime.sTrainerObjectEventLocalId).toBe(9);
    expect(runtime.sTrainerAIntroSpeech).toBe(0x11);
    expect(runtime.sTrainerADefeatSpeech).toBe(0x22);
    expect(runtime.sTrainerCannotBattleSpeech).toBe(0x33);
    expect(runtime.sTrainerABattleScriptRetAddr).toBe(0x44);

    runtime.objectEvents = [{ localId: 1, facingDirection: 0 }, { localId: 9, facingDirection: 2 }];
    SetMapVarsToTrainer(runtime);
    expect(runtime.gSpecialVar_LastTalked).toBe(9);
    expect(runtime.gSelectedObjectEvent).toBe(1);

    SetBattledTrainerFlag2(runtime);
    expect(runtime.flags.has(0x500 + 123)).toBe(true);

    const pokedude = createBattleSetupRuntime();
    StartPokedudeBattle(pokedude);
    expect(pokedude.savedCallback).toBe('EndPokedudeBattle');
    expect(pokedude.operations).toEqual(expect.arrayContaining([
      'LockPlayerFieldControls',
      'FreezeObjectEvents',
      'StopPlayerAvatar',
      'SavePlayerParty',
      'InitPokedudePartyAndOpponent'
    ]));
    expect(pokedude.tasks).toHaveLength(1);
    EndPokedudeBattle(pokedude);
    expect(pokedude.operations).toContain('LoadPlayerParty');
    expect(pokedude.mainCallback2).toBe('CB2_ReturnToField');
  });
});

interface TestTrainerData {
  partySize: number;
  partyFlags: number;
  partyLevels: number[];
  trainerClass: number;
  doubleBattle: boolean;
  encounterMusic: number;
}

function trainer(overrides: Partial<TestTrainerData> = {}): TestTrainerData {
  return { partySize: 1, partyFlags: 0, partyLevels: [1], trainerClass: 0, doubleBattle: false, encounterMusic: 0, ...overrides };
}

function battleBytes(mode: number, opponent: number, localId: number, ...words: number[]): number[] {
  return [mode, opponent & 0xff, opponent >> 8, localId & 0xff, localId >> 8, ...words.flatMap(u32)];
}

function earlyRivalBytes(opponent: number, flags: number, defeat: number, victory: number): number[] {
  return [TRAINER_BATTLE_EARLY_RIVAL, opponent & 0xff, opponent >> 8, flags & 0xff, flags >> 8, ...u32(defeat), ...u32(victory)];
}

function u32(value: number): number[] {
  return [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff];
}
