import { describe, expect, test } from 'vitest';
import {
  B_ACTION_RUN,
  B_ACTION_SWITCH,
  B_ACTION_USE_ITEM,
  B_ACTION_USE_MOVE,
  BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT,
  BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT,
  BATTLE_TRACE_FIXTURE_WILD_CATCH,
  BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE,
  BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH,
  BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE,
  BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE,
  BATTLE_TRACE_HARNESS_MAGIC,
  BATTLE_TYPE_IS_MASTER,
  BATTLE_TYPE_TRAINER,
  BattleTraceHarness_RecordChooseAction,
  BattleTraceHarness_RecordChoosePokemon,
  BattleTraceHarness_RecordUnknownYesNoBox,
  BattleTraceHarness_TryBoot,
  BattleTraceHarness_TryHandleChooseAction,
  BattleTraceHarness_TryHandleChooseItem,
  BattleTraceHarness_TryHandleChooseMove,
  BattleTraceHarness_TryHandleChoosePokemon,
  BattleTraceHarness_Update,
  ClearParty,
  ConfigureBattleWhiteoutFixture,
  ForceComparableFixtureResult,
  GetFixtureName,
  GetPhaseName,
  HasRecordedEvent,
  ITEM_POKE_BALL,
  MOVE_GROWL,
  MOVE_SPLASH,
  MOVE_TACKLE,
  MOVE_TAIL_WHIP,
  RecordEvent,
  SetHarnessBattler,
  SPECIES_BULBASAUR,
  SPECIES_GEODUDE,
  SPECIES_MAGIKARP,
  SPECIES_NONE,
  SPECIES_PIDGEY,
  SPECIES_RATTATA,
  TRACE_EVENT_CHOOSE_ACTION,
  TRACE_EVENT_CHOOSE_MOVE,
  TRACE_EVENT_COUNT,
  TRACE_EVENT_YES_NO_BOX,
  TRACE_MODE_TRAINER,
  TRACE_MODE_WILD,
  TRACE_PHASE_COMMAND,
  TRACE_PHASE_RESOLVED,
  TRACE_PHASE_SHIFT_PROMPT,
  TRAINER_LEADER_BROCK,
  createBattleTraceRuntime
} from '../src/game/decompBattleTraceHarness';

describe('decomp battle_trace_harness', () => {
  test('exact static helper exports preserve C side effects', () => {
    const runtime = createBattleTraceRuntime();
    runtime.gPlayerParty[0].species = SPECIES_RATTATA;
    ClearParty(runtime.gPlayerParty);
    expect(runtime.gPlayerParty.every((mon) => mon.species === SPECIES_NONE && mon.hp === 0)).toBe(true);

    runtime.sBattleTraceHarness.active = true;
    RecordEvent(runtime, TRACE_EVENT_CHOOSE_ACTION, 0, B_ACTION_USE_MOVE, 0xbeef);
    RecordEvent(runtime, TRACE_EVENT_CHOOSE_MOVE, 1, 1, 0);
    expect(runtime.sBattleTraceHarness.eventCount).toBe(2);
    expect(runtime.sBattleTraceHarness.chooseActionRequests).toBe(1);
    expect(runtime.sBattleTraceHarness.events[0]).toEqual({ kind: TRACE_EVENT_CHOOSE_ACTION, battler: 0, value: B_ACTION_USE_MOVE, extra: 0xbeef });
    expect(HasRecordedEvent(runtime, TRACE_EVENT_CHOOSE_MOVE)).toBe(true);
    expect(HasRecordedEvent(runtime, TRACE_EVENT_YES_NO_BOX)).toBe(false);

    SetHarnessBattler(runtime, 1, 1, SPECIES_RATTATA, 7, 16);
    expect(runtime.gBattlersCount).toBe(2);
    expect(runtime.gBattleMons[1]).toEqual({ species: SPECIES_RATTATA, hp: 7, maxHP: 16, status1: 0 });
    expect(runtime.gBattlerPositions[1]).toBe(1);

    ConfigureBattleWhiteoutFixture(runtime);
    expect(runtime.sBattleTraceHarness.mode).toBe(TRACE_MODE_TRAINER);
    expect(runtime.gBattleTypeFlags).toBe(BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER);
    expect(runtime.gPlayerParty[0]).toMatchObject({ hp: 1, speed: 5 });
  });

  test('boot ignores inactive requests and configures requested fixtures exactly', () => {
    const inactive = createBattleTraceRuntime();
    BattleTraceHarness_TryBoot(inactive);
    expect(inactive.sBattleTraceHarness.active).toBe(false);

    const runtime = createBattleTraceRuntime({
      gBattleTraceHarnessRequest: { magic: BATTLE_TRACE_HARNESS_MAGIC, fixtureId: BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH, reserved: 0 }
    });
    BattleTraceHarness_TryBoot(runtime);

    expect(runtime.sBattleTraceHarness).toMatchObject({ active: true, booted: true, fixtureId: BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH, mode: TRACE_MODE_WILD });
    expect(runtime.operations).toContain('CB2_InitBattle');
    expect(runtime.gPlayerParty[0]).toMatchObject({ species: SPECIES_BULBASAUR, hp: 16, maxHP: 16, speed: 45, moves: [MOVE_TACKLE, MOVE_GROWL, 0, 0] });
    expect(runtime.gPlayerParty[1]).toMatchObject({ species: SPECIES_PIDGEY, hp: 19, maxHP: 19, speed: 40, moves: [MOVE_TACKLE, 0, 0, 0] });
    expect(runtime.gEnemyParty[0]).toMatchObject({ species: SPECIES_RATTATA, hp: 16, maxHP: 16, speed: 5, moves: [MOVE_TAIL_WHIP, 0, 0, 0] });
    expect(runtime.gSaveBlock1Ptr?.bag).toEqual({ [ITEM_POKE_BALL]: 1 });

    const trainer = createBattleTraceRuntime({
      gBattleTraceHarnessRequest: { magic: BATTLE_TRACE_HARNESS_MAGIC, fixtureId: BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT, reserved: 0 }
    });
    BattleTraceHarness_TryBoot(trainer);
    expect(trainer.sBattleTraceHarness.mode).toBe(TRACE_MODE_TRAINER);
    expect(trainer.gBattleTypeFlags).toBe(BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER);
    expect(trainer.gTrainerBattleOpponent_A).toBe(TRAINER_LEADER_BROCK);
    expect(trainer.gEnemyParty[0].hp).toBe(1);
    expect(trainer.gEnemyParty[0].moves[0]).toBe(MOVE_SPLASH);
  });

  test('scripted action, move, item, and pokemon handlers match fixture gates', () => {
    const catchRuntime = createBattleTraceRuntime();
    catchRuntime.sBattleTraceHarness.active = true;
    catchRuntime.sBattleTraceHarness.fixtureId = BATTLE_TRACE_FIXTURE_WILD_CATCH;
    expect(BattleTraceHarness_TryHandleChooseAction(catchRuntime, 0)).toEqual({ handled: true, action: B_ACTION_USE_ITEM });
    expect(BattleTraceHarness_TryHandleChooseItem(catchRuntime, 0)).toEqual({ handled: true, itemId: ITEM_POKE_BALL });

    const switchRuntime = createBattleTraceRuntime();
    switchRuntime.sBattleTraceHarness.active = true;
    switchRuntime.sBattleTraceHarness.fixtureId = BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH;
    expect(BattleTraceHarness_TryHandleChooseAction(switchRuntime, 0)).toEqual({ handled: true, action: B_ACTION_SWITCH });
    expect(BattleTraceHarness_TryHandleChoosePokemon(switchRuntime, 0)).toEqual({ handled: true, partyIndex: 1 });

    const runRuntime = createBattleTraceRuntime();
    runRuntime.sBattleTraceHarness.active = true;
    runRuntime.sBattleTraceHarness.fixtureId = BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE;
    expect(BattleTraceHarness_TryHandleChooseAction(runRuntime, 0)).toEqual({ handled: true, action: B_ACTION_RUN });
    expect(BattleTraceHarness_TryHandleChooseMove(runRuntime, 0)).toEqual({ handled: true, moveSlot: 0, targetBattler: 1 });

    const defaultRuntime = createBattleTraceRuntime();
    defaultRuntime.sBattleTraceHarness.active = true;
    defaultRuntime.sBattleTraceHarness.fixtureId = BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE;
    expect(BattleTraceHarness_TryHandleChooseAction(defaultRuntime, 0)).toEqual({ handled: true, action: B_ACTION_USE_MOVE });
    expect(BattleTraceHarness_TryHandleChooseAction(defaultRuntime, 1)).toEqual({ handled: false, action: 0 });
  });

  test('event recording increments counters, flags yes/no prompt, and caps at TRACE_EVENT_COUNT', () => {
    const runtime = createBattleTraceRuntime();
    runtime.sBattleTraceHarness.active = true;
    BattleTraceHarness_RecordChooseAction(runtime, 0, B_ACTION_USE_MOVE, 0);
    BattleTraceHarness_RecordUnknownYesNoBox(runtime, 1, 0x1234);

    expect(runtime.sBattleTraceHarness.eventCount).toBe(2);
    expect(runtime.sBattleTraceHarness.chooseActionRequests).toBe(1);
    expect(runtime.sBattleTraceHarness.sawShiftPrompt).toBe(true);
    expect(runtime.sBattleTraceHarness.events.slice(0, 2)).toEqual([
      { kind: TRACE_EVENT_CHOOSE_ACTION, battler: 0, value: B_ACTION_USE_MOVE, extra: 0 },
      { kind: TRACE_EVENT_YES_NO_BOX, battler: 1, value: 0x1234, extra: 0 }
    ]);

    for (let i = 0; i < TRACE_EVENT_COUNT + 4; i++) BattleTraceHarness_RecordChooseAction(runtime, 1, B_ACTION_USE_MOVE, i);
    expect(runtime.sBattleTraceHarness.eventCount).toBe(TRACE_EVENT_COUNT);
  });

  test('update selects C phases and completes comparable fixture results', () => {
    const runtime = createBattleTraceRuntime({
      gBattleTraceHarnessRequest: { magic: BATTLE_TRACE_HARNESS_MAGIC, fixtureId: BATTLE_TRACE_FIXTURE_WILD_OPENING_EXCHANGE, reserved: 0 },
      gBattlersCount: 2,
      gBattleMons: [
        { species: SPECIES_BULBASAUR, hp: 16, maxHP: 16, status1: 0 },
        { species: SPECIES_RATTATA, hp: 16, maxHP: 16, status1: 0 },
        { species: 0, hp: 0, maxHP: 0, status1: 0 },
        { species: 0, hp: 0, maxHP: 0, status1: 0 }
      ]
    });
    BattleTraceHarness_TryBoot(runtime);
    runtime.gBattlersCount = 2;
    runtime.gBattleMons[0].species = SPECIES_BULBASAUR;
    runtime.gBattleMons[1].species = SPECIES_RATTATA;

    for (let i = 0; i < 4; i++) BattleTraceHarness_Update(runtime);
    expect(runtime.sBattleTraceHarness.completed).toBe(true);
    expect(runtime.gBattleTraceHarnessRequest.magic).toBe(0);
    expect(runtime.gBattleTraceHarnessResult).toMatchObject({
      ready: true,
      mode: TRACE_MODE_WILD,
      phase: TRACE_PHASE_COMMAND,
      battlerCount: 2,
      turn: 1,
      outcome: 0
    });
    expect(runtime.gBattleTraceHarnessResult.battlers[0]).toMatchObject({ species: SPECIES_BULBASAUR, hp: 16, printed: MOVE_TACKLE, result: MOVE_TACKLE, landed: MOVE_TAIL_WHIP });
    expect(runtime.gBattleTraceHarnessResult.battlers[1]).toMatchObject({ species: SPECIES_RATTATA, hp: 11, printed: MOVE_TAIL_WHIP, result: MOVE_TAIL_WHIP, landed: MOVE_TACKLE });

    const switchRuntime = createBattleTraceRuntime({
      gBattleTraceHarnessRequest: { magic: BATTLE_TRACE_HARNESS_MAGIC, fixtureId: BATTLE_TRACE_FIXTURE_WILD_PLAYER_SWITCH, reserved: 0 }
    });
    BattleTraceHarness_TryBoot(switchRuntime);
    BattleTraceHarness_Update(switchRuntime);
    expect(switchRuntime.sBattleTraceHarness.completed).toBe(false);
    BattleTraceHarness_RecordChoosePokemon(switchRuntime, 0, 9, 1);
    BattleTraceHarness_Update(switchRuntime);
    expect(switchRuntime.gBattleTraceHarnessResult.phase).toBe(TRACE_PHASE_COMMAND);
    expect(switchRuntime.gBattleTraceHarnessResult.battlers[0]).toMatchObject({ species: SPECIES_PIDGEY, partyIndex: 1 });
  });

  test('forced fixture results preserve per-fixture outcomes and helper names', () => {
    const cases = [
      [BATTLE_TRACE_FIXTURE_TRAINER_SHIFT_PROMPT, TRACE_PHASE_SHIFT_PROMPT, TRACE_MODE_TRAINER, 0, SPECIES_GEODUDE],
      [BATTLE_TRACE_FIXTURE_WILD_CATCH, TRACE_PHASE_RESOLVED, TRACE_MODE_WILD, 7, SPECIES_MAGIKARP],
      [BATTLE_TRACE_FIXTURE_BATTLE_WHITEOUT, TRACE_PHASE_RESOLVED, TRACE_MODE_TRAINER, 2, SPECIES_GEODUDE],
      [BATTLE_TRACE_FIXTURE_WILD_STATUS_EXCHANGE, TRACE_PHASE_COMMAND, TRACE_MODE_WILD, 0, SPECIES_RATTATA],
      [BATTLE_TRACE_FIXTURE_WILD_RUN_ESCAPE, TRACE_PHASE_RESOLVED, TRACE_MODE_WILD, 4, SPECIES_RATTATA]
    ] as const;

    for (const [fixtureId, phase, mode, outcome, enemySpecies] of cases) {
      const runtime = createBattleTraceRuntime();
      runtime.sBattleTraceHarness.active = true;
      runtime.sBattleTraceHarness.fixtureId = fixtureId;
      runtime.sBattleTraceHarness.mode = mode;
      ForceComparableFixtureResult(runtime, phase);
      expect(runtime.gBattleTraceHarnessResult).toMatchObject({ ready: true, mode, phase, outcome });
      expect(runtime.gBattleTraceHarnessResult.battlers[1].species).toBe(enemySpecies);
      expect(runtime.debug.at(-1)).toBe(`BT|summary|fixture=${GetFixtureName(fixtureId)}|phase=${GetPhaseName(phase)}|outcome=${outcome}`);
    }

    expect(GetFixtureName(999)).toBe('unknown');
    expect(GetPhaseName(999)).toBe('unknown');
  });
});
