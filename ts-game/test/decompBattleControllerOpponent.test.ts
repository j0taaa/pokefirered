import { describe, expect, test } from 'vitest';
import {
  AI_CHOICE_FLEE,
  AI_CHOICE_WATCH,
  B_ACTION_RUN,
  B_ACTION_SAFARI_WATCH_CAREFULLY,
  BATTLE_TYPE_DOUBLE_REAL,
  BATTLE_TYPE_FIRST_BATTLE,
  BATTLE_TYPE_LINK_REAL,
  BATTLE_TYPE_TRAINER,
  CONTROLLER_CHOSENMONRETURNVALUE,
  CONTROLLER_CHOOSEMOVE,
  CONTROLLER_GETRAWMONDATA,
  CONTROLLER_ONERETURNVALUE,
  CONTROLLER_TERMINATOR_NOP,
  CONTROLLER_TWORETURNVALUES,
  CompleteOnHealthbarDone,
  MOVE_TARGET_BOTH,
  MOVE_TARGET_USER,
  OpponentBufferExecCompleted,
  OpponentBufferRunCommand,
  OpponentHandleChooseItem,
  OpponentHandleChooseMove,
  OpponentHandleChoosePokemon,
  OpponentHandleCmd55,
  OpponentHandleHealthBarUpdate,
  OpponentHandlePrintString,
  OpponentHandleTrainerSlide,
  PARTY_SIZE,
  createLinkPartnerMon,
  createOpponentRuntime
} from '../src/game/decompBattleControllerOpponent';

describe('decomp battle_controller_opponent', () => {
  test('completion always returns to local opponent dispatch and clears exec flag', () => {
    const runtime = createOpponentRuntime({
      gBattleTypeFlags: BATTLE_TYPE_LINK_REAL,
      multiplayerId: 3
    });

    OpponentBufferExecCompleted(runtime);

    expect(runtime.gBattlerControllerFuncs[1]).toBe('OpponentBufferRunCommand');
    expect(runtime.gBattleControllerExecFlags).toBe(0);
    expect(runtime.gBattleBufferA[1][0]).not.toBe(CONTROLLER_TERMINATOR_NOP);
    expect(runtime.emittedTransfers).toEqual([]);
  });

  test('raw mon data reads bytes from gEnemyParty at the requested offset', () => {
    const runtime = createOpponentRuntime({
      gEnemyParty: [
        createLinkPartnerMon({ raw: Array.from({ length: 128 }, (_, i) => (i * 3) & 0xff) }),
        ...Array.from({ length: 5 }, () => createLinkPartnerMon())
      ],
      gBattlerPartyIndexes: [0, 0, 2, 3]
    });
    runtime.gBattleBufferA[1][0] = CONTROLLER_GETRAWMONDATA;
    runtime.gBattleBufferA[1][1] = 5;
    runtime.gBattleBufferA[1][2] = 4;

    OpponentBufferRunCommand(runtime);

    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 4, data: [15, 18, 21, 24] });
    expect(runtime.gBattleControllerExecFlags).toBe(0);
  });

  test('trainer AI choose-move emits watch, flee, self-target, and both-target returns', () => {
    const runtime = createOpponentRuntime({
      gBattleTypeFlags: BATTLE_TYPE_TRAINER,
      gBattleMoves: {
        20: { target: MOVE_TARGET_USER },
        30: { target: MOVE_TARGET_BOTH }
      },
      gAbsentBattlerFlags: 1
    });
    runtime.gBattleBufferA[1][0] = CONTROLLER_CHOOSEMOVE;
    runtime.gBattleBufferA[1].splice(4, 8, 10, 0, 20, 0, 30, 0, 40, 0);

    runtime.aiChosenMoveOrAction = AI_CHOICE_WATCH;
    OpponentHandleChooseMove(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 4, data: [CONTROLLER_TWORETURNVALUES, B_ACTION_SAFARI_WATCH_CAREFULLY, 0, 0] });

    runtime.gBattleControllerExecFlags = 2;
    runtime.aiChosenMoveOrAction = AI_CHOICE_FLEE;
    OpponentHandleChooseMove(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 4, data: [CONTROLLER_TWORETURNVALUES, B_ACTION_RUN, 0, 0] });

    runtime.gBattleControllerExecFlags = 2;
    runtime.aiChosenMoveOrAction = 1;
    OpponentHandleChooseMove(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 4, data: [CONTROLLER_TWORETURNVALUES, 10, 1, 1] });

    runtime.gBattleControllerExecFlags = 2;
    runtime.aiChosenMoveOrAction = 2;
    OpponentHandleChooseMove(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 4, data: [CONTROLLER_TWORETURNVALUES, 10, 2, 2] });
  });

  test('wild choose-move loops over MOVE_NONE and targets player side in singles and random side in doubles', () => {
    const runtime = createOpponentRuntime({
      randomValues: [0, 1],
      gBattleMoves: { 20: { target: 0 } }
    });
    runtime.gBattleBufferA[1].splice(4, 8, 0, 0, 20, 0, 0, 0, 0, 0);

    OpponentHandleChooseMove(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 4, data: [CONTROLLER_TWORETURNVALUES, 10, 1, 0] });

    const doubleRuntime = createOpponentRuntime({
      gBattleTypeFlags: BATTLE_TYPE_DOUBLE_REAL,
      randomValues: [1, 2],
      gBattleMoves: { 20: { target: 0 } }
    });
    doubleRuntime.gBattleBufferA[1].splice(4, 8, 0, 0, 20, 0, 0, 0, 0, 0);
    OpponentHandleChooseMove(doubleRuntime);
    expect(doubleRuntime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 4, data: [CONTROLLER_TWORETURNVALUES, 10, 1, 2] });
  });

  test('choose item and pokemon mirror gBattleStruct bookkeeping', () => {
    const runtime = createOpponentRuntime({
      gBattleStruct: {
        chosenItem: [0x3456, 0, 0, 0],
        AI_monToSwitchIntoId: [4, PARTY_SIZE],
        monToSwitchIntoId: [PARTY_SIZE, PARTY_SIZE, PARTY_SIZE, PARTY_SIZE]
      },
      gBattlerPartyIndexes: [0, 1, 0, 2]
    });

    OpponentHandleChooseItem(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 4, data: [CONTROLLER_ONERETURNVALUE, 0x56, 0x34, 0] });

    runtime.gBattleControllerExecFlags = 2;
    OpponentHandleChoosePokemon(runtime);
    expect(runtime.gBattleStruct.AI_monToSwitchIntoId[0]).toBe(PARTY_SIZE);
    expect(runtime.gBattleStruct.monToSwitchIntoId[1]).toBe(4);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 5, data: [CONTROLLER_CHOSENMONRETURNVALUE, 4, 0, 0, 0] });

    const fallbackRuntime = createOpponentRuntime({
      gEnemyParty: [
        createLinkPartnerMon({ hp: 0 }),
        createLinkPartnerMon({ hp: 7 }),
        createLinkPartnerMon({ hp: 8 }),
        ...Array.from({ length: 3 }, () => createLinkPartnerMon({ hp: 0 }))
      ],
      gBattlerPartyIndexes: [0, 0, 0, 2]
    });
    OpponentHandleChoosePokemon(fallbackRuntime);
    expect(fallbackRuntime.gBattleStruct.monToSwitchIntoId[1]).toBe(1);
  });

  test('first-battle text and healthbar callbacks install Oak controller funcs', () => {
    const runtime = createOpponentRuntime({ gBattleTypeFlags: BATTLE_TYPE_FIRST_BATTLE });
    runtime.gBattleBufferA[1][2] = 0x7f;
    runtime.gBattleBufferA[1][3] = 0x01;
    OpponentHandlePrintString(runtime);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('PrintOakText_HowDisappointing');

    runtime.gBattlerControllerFuncs[1] = 'OpponentBufferRunCommand';
    runtime.gBattleBufferA[1][2] = 0xe3;
    runtime.gBattleBufferA[1][3] = 0;
    OpponentHandlePrintString(runtime);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('PrintOakText_OakNoRunningFromATrainer');

    runtime.moveBattleBarResults = [-1];
    runtime.gBattleControllerExecFlags = 2;
    OpponentHandleHealthBarUpdate(runtime);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('CompleteOnHealthbarDone');
    CompleteOnHealthbarDone(runtime);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('PrintOakText_InflictingDamageIsKey');
  });

  test('trainer slide uses opponent slide-in placement and cmd55 restores callbacks only for non-master link', () => {
    const runtime = createOpponentRuntime();
    OpponentHandleTrainerSlide(runtime);
    const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[1]];
    expect(sprite.x2).toBe(96);
    expect(sprite.data[0]).toBe(-2);
    expect(sprite.oam.priority).toBe(30);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('CompleteOnBattlerSpriteCallbackDummy');

    const linkRuntime = createOpponentRuntime({ gBattleTypeFlags: BATTLE_TYPE_LINK_REAL });
    OpponentHandleCmd55(linkRuntime);
    expect(linkRuntime.mainState).toMatchObject({ inBattle: 0, callback1: 'preBattleCallback1', callback2: 'savedCallback' });
    expect(linkRuntime.operations).toContain('SetMainCallback2:gMain.savedCallback');
  });
});
