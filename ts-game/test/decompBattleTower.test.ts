import { describe, expect, test } from 'vitest';
import {
  BATTLE_TOWER_EREADER_TRAINER_ID,
  BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID,
  BATTLE_TYPE_BATTLE_TOWER,
  BATTLE_TYPE_EREADER_TRAINER,
  BATTLE_TYPE_TRAINER,
  B_OUTCOME_WON,
  GAME_STAT_BATTLE_TOWER_BEST_STREAK,
  GAME_STAT_RECEIVED_RIBBONS,
  ITEM_NONE,
  MON_DATA_WINNING_RIBBON,
  MOVE_FRUSTRATION,
  VAR_OBJ_GFX_ID_0,
  VAR_TEMP_0,
  AwardBattleTowerRibbons,
  BattleTowerMapScript2,
  BattleTowerUtil,
  CB2_FinishEReaderBattle,
  CheckMonBattleTowerBanlist,
  CheckPartyBattleTowerBanlist,
  ChooseNextBattleTowerTrainer,
  ChooseSpecialBattleTowerTrainer,
  ClearBattleTowerRecord,
  CopyEReaderTrainerName5,
  Debug_FillEReaderTrainerWithPlayerData,
  DetermineBattleTowerPrize,
  Dummy_TryEnableBravoTrainerBattleTower,
  FillBattleTowerTrainerParty,
  GetBattleTowerTrainerClassNameId,
  GetBattleTowerTrainerFrontSpriteId,
  GetBattleTowerTrainerName,
  GetCurrentBattleTowerWinStreak,
  GiveBattleTowerPrize,
  PrintBattleTowerTrainerGreeting,
  PrintEReaderTrainerFarewellMessage,
  SaveBattleTowerProgress,
  SetBattleTowerProperty,
  SetBattleTowerRecordChecksum,
  SetBattleTowerTrainerGfxId,
  SetEReaderTrainerChecksum,
  ShouldBattleEReaderTrainer,
  StartSpecialBattle,
  Task_WaitBT,
  UpdateOrInsertReceivedBattleTowerRecord,
  ValidateBattleTowerRecordChecksums,
  ValidateEReaderTrainer,
  createBattleTowerRecord,
  createBattleTowerRuntime,
  createEReaderTrainer,
  createTowerMon,
  sLongStreakPrizes,
  sShortStreakPrizes,
  sBattleTowerHeldItems
} from '../src/game/decompBattleTower';

describe('decomp battle_tower', () => {
  test('map script reset/results, trainer selection, names/classes, and special records follow decomp branches', () => {
    const runtime = createBattleTowerRuntime();
    runtime.battleTower.var_4AE = [1, 4];
    BattleTowerMapScript2(runtime);
    expect(runtime.battleTower.curChallengeBattleNum).toEqual([1, 1]);
    expect(runtime.vars[VAR_TEMP_0]).toBe(2);

    runtime.battleTower.battleTowerLevelType = 0;
    runtime.battleTower.curStreakChallengesNum[0] = 2;
    runtime.battleTower.curChallengeBattleNum[0] = 3;
    expect(GetCurrentBattleTowerWinStreak(runtime, 0)).toBe(9);

    runtime.battleTower.ereaderTrainer = createEReaderTrainer({
      winStreak: 9,
      trainerClass: 4,
      name: [69, 82, 0],
      party: [
        createTowerMon({ species: 1, heldItem: 10, hp: 1, level: 50 }),
        createTowerMon({ species: 2, heldItem: 11, hp: 1, level: 50 }),
        createTowerMon({ species: 3, heldItem: 12, hp: 1, level: 50 })
      ]
    });
    SetEReaderTrainerChecksum(runtime.battleTower.ereaderTrainer);
    expect(ShouldBattleEReaderTrainer(runtime, 0, 9)).toBe(true);
    expect(ChooseSpecialBattleTowerTrainer(runtime)).toBe(true);
    expect(runtime.battleTower.battleTowerTrainerId).toBe(BATTLE_TOWER_EREADER_TRAINER_ID);
    expect(GetBattleTowerTrainerFrontSpriteId(runtime)).toBe(104);
    expect(GetBattleTowerTrainerClassNameId(runtime)).toBe(204);
    expect(GetBattleTowerTrainerName(runtime).slice(0, 3)).toEqual([69, 82, 0]);

    runtime.battleTower.ereaderTrainer.winStreak = 99;
    const record = createBattleTowerRecord({ battleTowerLevelType: 0, winStreak: 9, trainerClass: 6, name: [82, 69, 67, 0], greeting: [9, 8, 7] });
    SetBattleTowerRecordChecksum(record);
    runtime.battleTower.records[2] = record;
    runtime.randomValues = [0];
    expect(ChooseSpecialBattleTowerTrainer(runtime)).toBe(true);
    expect(runtime.battleTower.battleTowerTrainerId).toBe(BATTLE_TOWER_RECORD_MIXING_TRAINER_BASE_ID + 2);

    runtime.battleTower.curChallengeBattleNum[0] = 2;
    runtime.battleTower.curStreakChallengesNum[0] = 1;
    runtime.battleTower.battledTrainerIds[0] = 0;
    runtime.battleTower.ereaderTrainer = createEReaderTrainer();
    runtime.battleTower.records = Array.from({ length: 5 }, () => createBattleTowerRecord());
    runtime.randomValues = [0, 64];
    ChooseNextBattleTowerTrainer(runtime);
    expect(runtime.battleTower.battleTowerTrainerId).toBe(5);
    expect(runtime.battleTower.battledTrainerIds[1]).toBe(5);
    expect(runtime.vars[VAR_OBJ_GFX_ID_0]).toBe(1);

    SetBattleTowerTrainerGfxId(runtime, 123);
    expect(runtime.vars[VAR_OBJ_GFX_ID_0]).toBe(1);
  });

  test('party generation, banlist checks, trainer messages, and battle start callbacks preserve state', () => {
    const runtime = createBattleTowerRuntime();
    runtime.level50Mons[0] = { species: 10, heldItem: 1, moves: [1, 2, 3, 4], evSpread: 5, teamFlags: 1 };
    runtime.level50Mons[1] = { species: 11, heldItem: 2, moves: [MOVE_FRUSTRATION, 2, 3, 4], evSpread: 6, teamFlags: 1 };
    runtime.level50Mons[2] = { species: 12, heldItem: 3, moves: [1, 2, 3, 4], evSpread: 7, teamFlags: 1 };
    runtime.battleTowerTrainers[0].teamFlags = 1;
    runtime.randomValues = [0, 5, 9];
    FillBattleTowerTrainerParty(runtime);
    expect(runtime.enemyParty.map((mon) => mon.species)).toEqual([10, 11, 12]);
    expect(runtime.enemyParty[1].friendship).toBe(0);
    expect(runtime.enemyParty[0].heldItem).toBe(sBattleTowerHeldItems[1]);

    const validSpecies: number[] = [];
    const validItems: number[] = [];
    CheckMonBattleTowerBanlist(151, 1, 1, 0, 50, validSpecies, validItems);
    CheckMonBattleTowerBanlist(20, 1, 1, 0, 51, validSpecies, validItems);
    CheckMonBattleTowerBanlist(20, 1, 1, 0, 50, validSpecies, validItems);
    CheckMonBattleTowerBanlist(21, 1, 1, 0, 50, validSpecies, validItems);
    CheckMonBattleTowerBanlist(22, 2, 1, 0, 50, validSpecies, validItems);
    expect(validSpecies).toEqual([20, 22]);

    runtime.playerParty = [
      createTowerMon({ species: 20, heldItem: 1, hp: 1, level: 50 }),
      createTowerMon({ species: 21, heldItem: 2, hp: 1, level: 50 }),
      createTowerMon({ species: 22, heldItem: 3, hp: 1, level: 50 }),
      createTowerMon(), createTowerMon(), createTowerMon()
    ];
    runtime.gSpecialVar_Result = 0;
    CheckPartyBattleTowerBanlist(runtime);
    expect(runtime.gSpecialVar_0x8004).toBe(0);
    expect(runtime.battleTower.battleTowerLevelType).toBe(0);

    runtime.battleTower.battleTowerTrainerId = 0;
    PrintBattleTowerTrainerGreeting(runtime);
    expect(runtime.gStringVar4).toContain('PROMPT_SCROLL');

    StartSpecialBattle(runtime);
    expect(runtime.gBattleTypeFlags).toBe(BATTLE_TYPE_BATTLE_TOWER | BATTLE_TYPE_TRAINER);
    expect(runtime.operations).toContain('CreateTask:Task_WaitBT:1');
    runtime.battleTransitionDone = true;
    Task_WaitBT(runtime, 4);
    expect(runtime.operations).toContain('DestroyTask:4');

    runtime.gSpecialVar_0x8004 = 2;
    StartSpecialBattle(runtime);
    expect(runtime.gBattleTypeFlags).toBe(BATTLE_TYPE_EREADER_TRAINER | BATTLE_TYPE_TRAINER);
    runtime.sSpecialVar_0x8004_Copy = 2;
    runtime.gBattleOutcome = B_OUTCOME_WON;
    runtime.battleTower.ereaderTrainer.farewellPlayerWon = [7, 7, 7];
    CB2_FinishEReaderBattle(runtime);
    expect(runtime.gStringVar4).toContain('7,7,7');
  });

  test('property/util/save/checksum/prize/ribbon/e-reader helpers mirror C side effects', () => {
    const runtime = createBattleTowerRuntime();
    runtime.battleTower.battleTowerLevelType = 0;
    runtime.gSpecialVar_0x8004 = 0;
    runtime.gSpecialVar_0x8005 = 4;
    SetBattleTowerProperty(runtime);
    expect(runtime.ewram160FB).toBe(0);
    expect(runtime.battleTower.var_4AE[0]).toBe(4);

    runtime.gSpecialVar_0x8004 = 6;
    runtime.battleTower.curChallengeBattleNum[0] = 7;
    runtime.battleTower.curStreakChallengesNum[0] = 8;
    SetBattleTowerProperty(runtime);
    expect(runtime.battleTower.totalBattleTowerWins).toBe(1);
    expect(runtime.battleTower.bestBattleTowerWinStreak).toBe(56);

    runtime.gSpecialVar_0x8004 = 9;
    BattleTowerUtil(runtime);
    expect(runtime.gSpecialVar_Result).toBe(56);

    runtime.battleTower.selectedPartyMons = [1, 2, 3];
    AwardBattleTowerRibbons(runtime);
    expect(runtime.playerParty[0].ribbons?.[MON_DATA_WINNING_RIBBON]).toBe(1);
    expect(runtime.gameStats[GAME_STAT_RECEIVED_RIBBONS]).toBe(1);

    runtime.randomValues = [1];
    runtime.battleTower.curStreakChallengesNum[0] = 2;
    DetermineBattleTowerPrize(runtime);
    expect(runtime.battleTower.prizeItem).toBe(sShortStreakPrizes[1]);
    runtime.randomValues = [2];
    runtime.battleTower.curStreakChallengesNum[0] = 8;
    DetermineBattleTowerPrize(runtime);
    expect(runtime.battleTower.prizeItem).toBe(sLongStreakPrizes[2]);
    GiveBattleTowerPrize(runtime);
    expect(runtime.gSpecialVar_Result).toBe(1);
    runtime.bagAcceptsItem = false;
    GiveBattleTowerPrize(runtime);
    expect(runtime.battleTower.var_4AE[0]).toBe(6);

    const record = createBattleTowerRecord({ winStreak: 10, name: [1, 2, 0] });
    SetBattleTowerRecordChecksum(record);
    expect(record.checksum).toBeGreaterThan(0);
    record.winStreak = 11;
    runtime.battleTower.playerRecord = record;
    ValidateBattleTowerRecordChecksums(runtime);
    expect(runtime.battleTower.playerRecord.winStreak).toBe(0);
    ClearBattleTowerRecord(record);
    expect(record.checksum).toBe(0);

    runtime.battleTower.ereaderTrainer = createEReaderTrainer({ name: [1, 2, 3, 4, 5, 6, 7], trainerClass: 3, winStreak: 1 });
    SetEReaderTrainerChecksum(runtime.battleTower.ereaderTrainer);
    ValidateEReaderTrainer(runtime);
    expect(runtime.gSpecialVar_Result).toBe(0);
    expect(CopyEReaderTrainerName5(runtime)).toEqual([1, 2, 3, 4, 5, 0]);
    PrintEReaderTrainerFarewellMessage(runtime);

    SaveBattleTowerProgress(runtime);
    expect(runtime.vars[VAR_TEMP_0]).toBe(6);
    expect(runtime.operations).toContain('TrySavingData:SAVE_EREADER');

    runtime.battleTower.var_4AE = [1, 0];
    Dummy_TryEnableBravoTrainerBattleTower(runtime);
    expect(runtime.operations).toContain('TakeBravoTrainerBattleTowerOffTheAir');
    expect(runtime.gameStats[GAME_STAT_BATTLE_TOWER_BEST_STREAK]).toBeDefined();
    expect(ITEM_NONE).toBe(0);
  });

  test('record mixing insert/update and debug e-reader population follow leftover C helpers', () => {
    const runtime = createBattleTowerRuntime();
    const incoming = createBattleTowerRecord({
      trainerId: [1, 2, 3, 4],
      name: [65, 66, 67, 68, 0, 70, 71],
      winStreak: 44
    });

    runtime.battleTower.records[0] = createBattleTowerRecord({
      trainerId: [1, 2, 3, 4],
      name: [90, 90, 90, 90, 0, 90, 90],
      winStreak: 3
    });
    UpdateOrInsertReceivedBattleTowerRecord(runtime, incoming);
    expect(runtime.battleTower.records[0]).toMatchObject({ trainerId: [1, 2, 3, 4], winStreak: 44 });
    expect(runtime.battleTower.records[0]).not.toBe(incoming);

    const emptyRuntime = createBattleTowerRuntime();
    emptyRuntime.battleTower.records[2].winStreak = 0;
    UpdateOrInsertReceivedBattleTowerRecord(emptyRuntime, incoming);
    expect(emptyRuntime.battleTower.records[0].winStreak).toBe(44);

    const fullRuntime = createBattleTowerRuntime();
    fullRuntime.battleTower.records = [9, 4, 4, 7, 8].map((winStreak, index) =>
      createBattleTowerRecord({ trainerId: [index, 0, 0, 0], name: [index, index, index, index, index + 1, 0, 0], winStreak })
    );
    fullRuntime.randomValues = [1];
    UpdateOrInsertReceivedBattleTowerRecord(fullRuntime, incoming);
    expect(fullRuntime.battleTower.records.map((record) => record.winStreak)).toEqual([9, 4, 44, 7, 8]);

    runtime.playerTrainerId = [1, 2, 3, 4];
    runtime.playerName = [80, 79, 82, 84, 69, 82, 0];
    runtime.easyChatBattleStart = [10, 11, 12, 13, 14, 15];
    runtime.playerParty = [
      createTowerMon({ species: 25, heldItem: 1, moves: [1, 2, 3, 4], nickname: [80, 0] }),
      createTowerMon({ species: 26, heldItem: 2, moves: [5, 6, 7, 8] }),
      createTowerMon({ species: 27, heldItem: 3, moves: [9, 10, 11, 12] }),
      createTowerMon(), createTowerMon(), createTowerMon()
    ];
    Debug_FillEReaderTrainerWithPlayerData(runtime);
    expect(runtime.battleTower.ereaderTrainer).toMatchObject({
      trainerClass: 0,
      trainerId: [1, 2, 3, 4],
      name: [80, 79, 82, 84, 69, 82, 0],
      winStreak: 1,
      greeting: [10, 11, 12, 13, 14, 15],
      farewellPlayerLost: [7, 8, 9, 10, 11, 12],
      farewellPlayerWon: [13, 14, 15, 16, 17, 18]
    });
    expect(runtime.battleTower.ereaderTrainer.party.map((mon) => mon.species)).toEqual([25, 26, 27]);
    expect(runtime.battleTower.ereaderTrainer.checksum).toBeGreaterThan(0);
  });
});
