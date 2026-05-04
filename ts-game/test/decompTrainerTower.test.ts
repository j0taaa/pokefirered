import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { GetBagItemQuantity, createItemRuntime } from '../src/game/decompItem';

const repoRoot = resolve(__dirname, '../..');
const trainerTowerPath = resolve(repoRoot, 'src/trainer_tower.c');
const trainerTowerHeaderPaths = [
  'include/constants/layouts.h',
  'include/constants/vars.h',
  'include/constants/items.h',
  'include/constants/songs.h',
  'include/constants/trainers.h',
  'include/constants/event_objects.h',
  'include/constants/trainer_tower.h'
].map((relativePath) => resolve(repoRoot, relativePath));
const hasTrainerTowerSource = existsSync(trainerTowerPath) && trainerTowerHeaderPaths.every((path) => existsSync(path));
const trainerTowerC = hasTrainerTowerSource ? readFileSync(trainerTowerPath, 'utf8') : '';
const testTrainerTower = hasTrainerTowerSource ? test : test.skip;

type TrainerTowerModule = typeof import('../src/game/decompTrainerTower');
const trainerTowerModule: TrainerTowerModule | null = hasTrainerTowerSource ? await import('../src/game/decompTrainerTower') : null;

const {
  BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_TRAINER,
  BATTLE_TYPE_TRAINER_TOWER,
  CB2_EndTrainerTowerBattle,
  CHALLENGE_STATUS_LOST,
  CHALLENGE_STATUS_NORMAL,
  CHALLENGE_TYPE_DOUBLE,
  CHALLENGE_TYPE_SINGLE,
  CallTrainerTowerFunc,
  CheckFinalTime,
  DoTrainerTowerBattle,
  FEMALE,
  GetCurrentTime,
  GetFloorAlreadyCleared,
  GetOwnerState,
  GetPartyMaxLevel,
  GetTrainerTowerChallengeStatus,
  GetTrainerTowerOpponentLoseText,
  GetTrainerTowerOpponentName,
  GetTrainerTowerOpponentWinText,
  GiveChallengePrize,
  InitTrainerTowerBattleStruct,
  InitTrainerTowerFloor,
  LAYOUT_TRAINER_TOWER_1F,
  LAYOUT_TRAINER_TOWER_ROOF,
  MALE,
  ResetTrainerTowerResults,
  SetTrainerTowerNPCGraphics,
  SetTrainerTowerRecordTime,
  SetUpTrainerTowerDataStruct,
  StartTrainerTowerChallenge,
  TRAINER_TOWER_MAX_TIME,
  Task_DoTrainerTowerBattle,
  TrainerTowerGetDoublesEligiblity,
  TrainerTowerGetNumFloors,
  TrainerTowerResumeTimer,
  TrainerTowerSetPlayerLost,
  createTrainerTowerRuntime,
  layoutConstants,
  sDoubleBattleChallengeMonIdxs,
  sDoubleBattleTrainerInfo,
  sFloorLayouts,
  sKnockoutChallengeMonIdxs,
  sPrizeList,
  sSingleBattleChallengeMonIdxs,
  sSingleBattleTrainerInfo,
  sTimeBoardWindowTemplate,
  sTrainerEncounterMusicLUT,
  sTrainerTowerFunctions,
  trainerTowerConstants
} = (trainerTowerModule ?? {}) as TrainerTowerModule;

describe('decomp trainer_tower', () => {
  testTrainerTower('parses static lookup tables and function dispatch table from trainer_tower.c', () => {
    const singleRows = [...trainerTowerC.matchAll(/\{OBJ_EVENT_GFX_[A-Z0-9_]+,\s*FACILITY_CLASS_[A-Z0-9_]+,\s*(?:MALE|FEMALE)\}/gu)].length;
    expect(sSingleBattleTrainerInfo).toHaveLength(singleRows);
    expect(sSingleBattleTrainerInfo[0]).toMatchObject({
      objGfx: 'OBJ_EVENT_GFX_WOMAN_2',
      facilityClass: 'FACILITY_CLASS_RS_AROMA_LADY',
      gender: FEMALE
    });
    expect(sDoubleBattleTrainerInfo).toHaveLength(10);
    expect(sTrainerEncounterMusicLUT).toHaveLength(105);
    expect(sFloorLayouts[0]).toEqual([
      layoutConstants.LAYOUT_TRAINER_TOWER_1F,
      layoutConstants.LAYOUT_TRAINER_TOWER_1F_DOUBLES,
      layoutConstants.LAYOUT_TRAINER_TOWER_1F_KNOCKOUT
    ]);
    expect(sPrizeList).toHaveLength(15);
    expect(sSingleBattleChallengeMonIdxs[0]).toEqual([0, 2]);
    expect(sDoubleBattleChallengeMonIdxs[0]).toEqual([0, 1]);
    expect(sKnockoutChallengeMonIdxs[0]).toEqual([0, 2, 4]);
    expect(sTimeBoardWindowTemplate).toMatchObject({ tilemapLeft: 3, tilemapTop: 1, width: 27, height: 18 });
    expect(sTrainerTowerFunctions[trainerTowerConstants.TRAINER_TOWER_FUNC_INIT_FLOOR]).toBe('InitTrainerTowerFloor');
    expect(sTrainerTowerFunctions[trainerTowerConstants.TRAINER_TOWER_FUNC_GET_BEAT_CHALLENGE]).toBe('HasSpokenToOwner');
  });

  testTrainerTower('sets up floor data, map layout, and NPC graphics for single/double/knockout floors', () => {
    const runtime = createTrainerTowerRuntime(createItemRuntime());
    runtime.towerChallengeId = CHALLENGE_TYPE_SINGLE;
    runtime.mapLayoutId = LAYOUT_TRAINER_TOWER_1F;
    SetUpTrainerTowerDataStruct(runtime);
    InitTrainerTowerFloor(runtime);
    expect(runtime.gSpecialVar_Result).toBe(CHALLENGE_TYPE_SINGLE);
    expect(runtime.currentMapLayout).toBe(layoutConstants.LAYOUT_TRAINER_TOWER_1F);
    const singleFacility = runtime.state!.data.floors[0].trainers[0].facilityClassId;
    expect(runtime.vars.VAR_OBJ_GFX_ID_1).toBe(sSingleBattleTrainerInfo.find((info) => info.facilityClassId === singleFacility)?.objGfxId);

    runtime.towerChallengeId = CHALLENGE_TYPE_DOUBLE;
    runtime.mapLayoutId = LAYOUT_TRAINER_TOWER_1F;
    SetUpTrainerTowerDataStruct(runtime);
    SetTrainerTowerNPCGraphics(runtime);
    expect(runtime.vars.VAR_OBJ_GFX_ID_0).toBeTypeOf('number');
    expect(runtime.vars.VAR_OBJ_GFX_ID_3).toBeTypeOf('number');

    runtime.mapLayoutId = LAYOUT_TRAINER_TOWER_ROOF + 1;
    SetUpTrainerTowerDataStruct(runtime);
    InitTrainerTowerFloor(runtime);
    expect(runtime.gSpecialVar_Result).toBe(3);
    expect(runtime.currentMapLayout).toBe(LAYOUT_TRAINER_TOWER_ROOF);
  });

  testTrainerTower('initializes battle opponent data and converts win/lose easy-chat text with color tracking', () => {
    const runtime = createTrainerTowerRuntime(createItemRuntime());
    runtime.vars.VAR_TEMP_1 = 0;
    SetUpTrainerTowerDataStruct(runtime);
    const firstTrainer = runtime.state!.data.floors[0].trainers[0];
    InitTrainerTowerBattleStruct(runtime);
    expect(GetTrainerTowerOpponentName(runtime)).toBe(firstTrainer.name.slice(0, 11));
    expect(runtime.opponent?.facilityClassId).toBe(firstTrainer.facilityClassId);

    const win = GetTrainerTowerOpponentWinText(runtime, 0);
    expect(win).toContain(firstTrainer.speechWin[0]);
    expect(runtime.vars.VAR_TEMP_3).toBe(0);
    expect([MALE, FEMALE]).toContain(runtime.gSpecialVar_TextColor);

    const lose = GetTrainerTowerOpponentLoseText(runtime, 0);
    expect(lose).toContain(firstTrainer.speechLose[0]);
  });

  testTrainerTower('builds battle flags and enemy party from the same floor-index mon tables', () => {
    const runtime = createTrainerTowerRuntime(createItemRuntime());
    runtime.playerParty = [
      { species: 1, speciesOrEgg: 1, level: 20 },
      { species: 2, speciesOrEgg: 2, level: 45 },
      { species: 412, speciesOrEgg: 412, level: 99 }
    ];
    runtime.vars.VAR_TEMP_1 = 0;
    SetUpTrainerTowerDataStruct(runtime);
    const floor = runtime.state!.data.floors[0];
    DoTrainerTowerBattle(runtime);
    expect(runtime.gBattleTypeFlags).toBe(BATTLE_TYPE_TRAINER | BATTLE_TYPE_TRAINER_TOWER);
    expect(runtime.tasks[0]).toMatchObject({ func: 'Task_DoTrainerTowerBattle', destroyed: false });
    expect(runtime.enemyParty.map((mon) => mon.species)).toEqual([
      floor.trainers[0].mons[sSingleBattleChallengeMonIdxs[0][0]].species,
      floor.trainers[0].mons[sSingleBattleChallengeMonIdxs[0][1]].species
    ]);
    expect(runtime.enemyParty.every((mon) => mon.level === 45)).toBe(true);
    expect(GetPartyMaxLevel(runtime)).toBe(45);
    Task_DoTrainerTowerBattle(runtime, 0);
    expect(runtime.tasks[0].destroyed).toBe(false);
    runtime.battleTransitionDone = true;
    Task_DoTrainerTowerBattle(runtime, 0);
    expect(runtime.savedCallback).toBe('CB2_EndTrainerTowerBattle');
    expect(runtime.mainCallback2).toBe('CB2_InitBattle');
    expect(runtime.tasks[0].destroyed).toBe(true);
    expect(runtime.operations).toContain('CleanupOverworldWindowsAndTilemaps');
    CB2_EndTrainerTowerBattle(runtime);
    expect(runtime.mainCallback2).toBe('CB2_ReturnToFieldContinueScriptPlayMapMusic');

    const doubleRuntime = createTrainerTowerRuntime(createItemRuntime());
    doubleRuntime.towerChallengeId = CHALLENGE_TYPE_DOUBLE;
    doubleRuntime.playerParty = runtime.playerParty;
    SetUpTrainerTowerDataStruct(doubleRuntime);
    DoTrainerTowerBattle(doubleRuntime);
    expect((doubleRuntime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0).toBe(true);
    expect(doubleRuntime.enemyParty).toHaveLength(2);
  });

  testTrainerTower('ports challenge state, owner state, final-time, status, and timer behavior', () => {
    const runtime = createTrainerTowerRuntime(createItemRuntime());
    runtime.gSpecialVar_0x8005 = 99;
    StartTrainerTowerChallenge(runtime);
    expect(runtime.towerChallengeId).toBe(CHALLENGE_TYPE_SINGLE);
    expect(runtime.trainerTower[0]).toMatchObject({ floorsCleared: 0, validated: true, timer: 0, spokeToOwner: false, checkedFinalTime: false });

    GetOwnerState(runtime);
    expect(runtime.gSpecialVar_Result).toBe(0);
    GetOwnerState(runtime);
    expect(runtime.gSpecialVar_Result).toBe(1);

    runtime.trainerTower[0].timer = 100;
    runtime.trainerTower[0].bestTime = SetTrainerTowerRecordTime(runtime, 200);
    CheckFinalTime(runtime);
    expect(runtime.gSpecialVar_Result).toBe(0);
    CheckFinalTime(runtime);
    expect(runtime.gSpecialVar_Result).toBe(2);

    TrainerTowerSetPlayerLost(runtime);
    GetTrainerTowerChallengeStatus(runtime);
    expect(runtime.gSpecialVar_Result).toBe(CHALLENGE_STATUS_LOST);
    GetTrainerTowerChallengeStatus(runtime);
    expect(runtime.gSpecialVar_Result).toBe(CHALLENGE_STATUS_NORMAL);

    runtime.trainerTower[0].spokeToOwner = false;
    runtime.trainerTower[0].timer = TRAINER_TOWER_MAX_TIME + 10;
    TrainerTowerResumeTimer(runtime);
    expect(runtime.trainerTower[0].timer).toBe(TRAINER_TOWER_MAX_TIME);
  });

  testTrainerTower('ports floor-clear, prize, num-floors, doubles, current-time, and dispatcher behavior', () => {
    const runtime = createTrainerTowerRuntime(createItemRuntime());
    SetUpTrainerTowerDataStruct(runtime);
    runtime.trainerTower[0].floorsCleared = 0;
    GetFloorAlreadyCleared(runtime);
    expect(runtime.gSpecialVar_Result).toBe(0);

    GiveChallengePrize(runtime);
    expect(runtime.gSpecialVar_Result).toBe(0);
    expect(runtime.trainerTower[0].receivedPrize).toBe(true);
    const prizeSlot = runtime.itemRuntime.gBagPockets.flatMap((pocket) => pocket.itemSlots).find((slot) => slot.itemId === sPrizeList[runtime.state!.data.floors[0].prizeIndex]);
    expect(prizeSlot ? GetBagItemQuantity(runtime.itemRuntime, prizeSlot) : 0).toBe(1);
    GiveChallengePrize(runtime);
    expect(runtime.gSpecialVar_Result).toBe(2);

    TrainerTowerGetNumFloors(runtime);
    expect(runtime.gSpecialVar_Result).toBe(0);
    runtime.doubleEligibility = 7;
    TrainerTowerGetDoublesEligiblity(runtime);
    expect(runtime.gSpecialVar_Result).toBe(7);

    runtime.trainerTower[0].timer = 3661;
    GetCurrentTime(runtime);
    expect(runtime.gStringVar1.trim()).toBe('1');
    expect(runtime.gStringVar2.trim()).toBe('1');

    runtime.gSpecialVar_0x8004 = trainerTowerConstants.TRAINER_TOWER_FUNC_GET_CHALLENGE_STATUS;
    CallTrainerTowerFunc(runtime);
    expect(runtime.gSpecialVar_Result).toBe(CHALLENGE_STATUS_NORMAL);
  });

  testTrainerTower('prints and resets encrypted record times', () => {
    const runtime = createTrainerTowerRuntime(createItemRuntime());
    runtime.encryptionKey = 0x55aa;
    ResetTrainerTowerResults(runtime);
    expect(runtime.trainerTower.every((record) => (record.bestTime ^ runtime.encryptionKey) === TRAINER_TOWER_MAX_TIME)).toBe(true);
    runtime.trainerTower[0].bestTime = SetTrainerTowerRecordTime(runtime, 1234);
    expect(runtime.trainerTower[0].bestTime ^ runtime.encryptionKey).toBe(1234);
  });
});
