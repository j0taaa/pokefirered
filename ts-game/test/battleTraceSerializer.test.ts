import { describe, expect, test } from 'vitest';
import { createBattleEncounterState, createBattleState, getBattlerMoveMemory, startConfiguredBattle, stepBattle } from '../src/game/battle';
import { serializeBattleTrace } from '../src/game/battleTraceSerializer';

const neutralInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  upPressed: false,
  downPressed: false,
  leftPressed: false,
  rightPressed: false,
  run: false,
  interact: false,
  interactPressed: false,
  start: false,
  startPressed: false,
  cancel: false,
  cancelPressed: false
};

const confirmInput = { ...neutralInput, interact: true, interactPressed: true };

describe('battle trace serializer', () => {
  test('serializes VM, battler state, and post-battle result deterministically', () => {
    const battle = createBattleState();

    startConfiguredBattle(battle, {
      mode: 'trainer',
      opponentName: 'BROCK',
      trainerId: 'TRAINER_BROCK'
    });
    battle.phase = 'moveSelect';
    battle.playerMon.speed = 99;
    battle.wildMon.speed = 1;

    stepBattle(battle, confirmInput, createBattleEncounterState());

    const trace = serializeBattleTrace(battle);
    expect(trace).toMatchObject({
      mode: 'trainer',
      format: 'singles',
      controlMode: 'singlePlayer',
      vm: {
        currentLabel: expect.any(String),
        pendingMessages: expect.arrayContaining([expect.stringContaining('used')])
      },
      postResult: {
        outcome: 'none'
      }
    });
    expect(trace.battlers[0]).toMatchObject({
      battlerId: 0,
      side: 'player',
      species: battle.playerMon.species,
      moveMemory: {
        chosenMoveId: getBattlerMoveMemory(battle, 0).chosenMoveId,
        printedMoveId: getBattlerMoveMemory(battle, 0).printedMoveId,
        resultingMoveId: getBattlerMoveMemory(battle, 0).resultingMoveId
      }
    });
    expect(trace.trace.some((event) => event.type === 'script')).toBe(true);
  });
});
