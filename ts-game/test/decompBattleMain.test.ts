import { describe, expect, test } from 'vitest';
import {
  BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_LINK,
  BATTLE_TYPE_MULTI,
  BATTLE_TYPE_TRAINER,
  B_ACTION_RUN,
  B_ACTION_SWITCH,
  B_ACTION_USE_MOVE,
  BufferPartyVsScreenHealth_AtStart,
  CB2_HandleStartBattle,
  CB2_InitBattle,
  CreateNPCTrainerParty,
  DoBounceEffect,
  EndBounceEffect,
  FreeResetData_ReturnToOvOrDoEvolutions,
  GetWhoStrikesFirst,
  HandleAction_Run,
  HandleTurnActionSelectionState,
  LinkBattleComputeBattleTypeFlags,
  RunTurnActionsFunctions,
  SetActionsAndBattlersTurnOrder,
  SpriteCB_Flicker,
  SpriteCB_InitFlicker,
  SpriteCB_PlayerThrowInit,
  SpriteCB_PlayerThrowUpdate,
  TryCorrectShedinjaLanguage,
  TryRunFromBattle,
  createBattleMainRuntime,
  type BattleMainMon,
  SPECIES_EGG,
  SPECIES_NONE,
  SPECIES_SHEDINJA
} from '../src/game/decompBattleMain';

describe('decompBattleMain', () => {
  test('battle init chooses multi or internal setup paths and link flags', () => {
    const runtime = createBattleMainRuntime();
    const flags = LinkBattleComputeBattleTypeFlags(4, 1, runtime);
    expect(flags & BATTLE_TYPE_LINK).toBeTruthy();
    expect(flags & BATTLE_TYPE_MULTI).toBeTruthy();
    expect(flags & BATTLE_TYPE_DOUBLE).toBeTruthy();
    expect(flags & BATTLE_TYPE_TRAINER).toBeTruthy();

    CB2_InitBattle(runtime);
    expect(runtime.mainCallback2).toBe('CB2_PreInitMultiBattle');

    const single = createBattleMainRuntime();
    single.battleTypeFlags = BATTLE_TYPE_TRAINER;
    CB2_InitBattle(single);
    expect(single.mainCallback2).toBe('CB2_HandleStartBattle');
    expect(single.operations).toContain('Help:TrainerSingle');
    expect(single.scanline0[0]).toBe(0xf0);
    expect(single.scanline0[100]).toBe(0xff10);
  });

  test('party vs screen health flags match healthy/status/fainted encoding', () => {
    const runtime = createBattleMainRuntime();
    runtime.playerParty[0] = { species: 1, hp: 10, maxHp: 10, status: 0, speed: 1, level: 5 };
    runtime.playerParty[1] = { species: 2, hp: 5, maxHp: 10, status: 1, speed: 1, level: 5 };
    runtime.playerParty[2] = { species: 3, hp: 0, maxHp: 10, status: 0, speed: 1, level: 5 };
    runtime.playerParty[3] = { species: SPECIES_EGG, hp: 1, maxHp: 1, status: 0, speed: 1, level: 5 };
    runtime.playerParty[4] = { species: SPECIES_NONE, hp: 0, maxHp: 0, status: 0, speed: 1, level: 5 };

    BufferPartyVsScreenHealth_AtStart(runtime);
    const flags = runtime.battleStruct.multiBuffer.vsScreenHealthFlagsLo | (runtime.battleStruct.multiBuffer.vsScreenHealthFlagsHi << 8);
    expect(flags & 0b11).toBe(1);
    expect((flags >> 2) & 0b11).toBe(2);
    expect((flags >> 4) & 0b11).toBe(3);
    expect((flags >> 6) & 0b11).toBe(2);
  });

  test('turn ordering uses speed and actions execute through battle main state', () => {
    const runtime = createBattleMainRuntime();
    runtime.battleMons[0].speed = 5;
    runtime.battleMons[1].speed = 20;
    runtime.chosenActionByBattler[0] = B_ACTION_USE_MOVE;
    runtime.chosenActionByBattler[1] = B_ACTION_SWITCH;

    expect(GetWhoStrikesFirst(0, 1, true, runtime)).toBe(1);
    SetActionsAndBattlersTurnOrder(runtime);
    expect(runtime.battlerByTurnOrder.slice(0, 2)).toEqual([1, 0]);

    HandleTurnActionSelectionState(runtime);
    expect(runtime.battleMainFunc).toBe('RunTurnActionsFunctions');
    RunTurnActionsFunctions(runtime);
    expect(runtime.currentTurnActionNumber).toBe(1);
    RunTurnActionsFunctions(runtime);
    expect(runtime.currentTurnActionNumber).toBe(0);
    expect(runtime.battleMainFunc).toBe('HandleTurnActionSelectionState');
  });

  test('run action respects trainer/link impossibility and wild speed check', () => {
    const runtime = createBattleMainRuntime();
    runtime.battleTypeFlags = BATTLE_TYPE_TRAINER;
    expect(TryRunFromBattle(0, runtime)).toBe(false);

    runtime.battleTypeFlags = 0;
    runtime.battleMons[0].speed = 50;
    runtime.battleMons[1].speed = 10;
    expect(TryRunFromBattle(0, runtime)).toBe(true);

    runtime.chosenActionByBattler[0] = B_ACTION_RUN;
    runtime.currentTurnActionNumber = 0;
    runtime.activeBattler = 0;
    HandleAction_Run(runtime);
    expect(runtime.battleOutcome).toBe(4);
  });

  test('sprite callbacks mutate sprite state like battle animation helpers', () => {
    const runtime = createBattleMainRuntime();
    SpriteCB_InitFlicker(0, runtime);
    expect(runtime.sprites[0].callback).toBe('SpriteCB_Flicker');
    SpriteCB_Flicker(0, runtime);
    expect(runtime.sprites[0].invisible).toBe(true);

    DoBounceEffect(0, 1, 2, 8, runtime);
    expect(runtime.sprites[0].callback).toBe('SpriteCB_BounceEffect');
    EndBounceEffect(0, 1, runtime);
    expect(runtime.sprites[0].callback).toBe('SpriteCB_Idle');

    SpriteCB_PlayerThrowInit(0, runtime);
    SpriteCB_PlayerThrowUpdate(0, runtime);
    expect(runtime.sprites[0].x2).toBe(-16);
  });

  test('misc helpers handle trainer parties, Shedinja language, and evolution cleanup routing', () => {
    const runtime = createBattleMainRuntime();
    const party: BattleMainMon[] = [];
    expect(CreateNPCTrainerParty(party, 7, runtime)).toBe(6);
    expect(party[0].species).toBe(71);

    const shedinja = { species: SPECIES_SHEDINJA, hp: 1, maxHp: 1, status: 0, speed: 1, level: 1, language: 'ENG', nickname: 'OLD' };
    TryCorrectShedinjaLanguage(shedinja, runtime);
    expect(shedinja.nickname).toBe('SHEDINJA');

    runtime.leveledUpInBattle = 1;
    FreeResetData_ReturnToOvOrDoEvolutions(runtime);
    expect(runtime.battleMainFunc).toBe('WaitForEvoSceneToFinish');

    const start = createBattleMainRuntime();
    CB2_HandleStartBattle(start);
    expect(start.mainCallback2).toBe('BattleMainCB2');
    expect(start.battleMainFunc).toBe('BeginBattleIntro');
  });
});
