import { describe, expect, test } from 'vitest';
import { createBattleState } from '../src/game/battle';
import {
  beginBattleMoveVm,
  cloneBattlePostResult,
  createBattlePostResult,
  createBattleVmState,
  resetBattlePostResult,
  resetBattleVmState
} from '../src/game/battleScriptVm';

describe('battle script VM scaffolding', () => {
  test('creates default VM and post-battle state', () => {
    expect(createBattleVmState()).toEqual({
      currentLabel: null,
      pc: 0,
      callStack: [],
      locals: {},
      pendingCommands: [],
      pendingMessages: []
    });

    expect(createBattlePostResult()).toMatchObject({
      outcome: 'none',
      payouts: 0,
      losses: 0,
      payDayTotal: 0,
      levelUps: [],
      pendingMoveLearn: false,
      caughtSpecies: null
    });
  });

  test('move prelude mirrors script label and queues the attack announcement', () => {
    const battle = createBattleState();
    const move = { ...battle.moves[0]!, effectScriptLabel: 'BattleScript_EffectHit' };
    const result = beginBattleMoveVm(
      battle,
      'player',
      battle.playerMon,
      move,
      {},
      {
        canMoveThisTurn: () => true,
        emitCommand: (command) => {
          battle.vm.pendingCommands.push(command);
        },
        pushMessage: (text) => {
          battle.vm.pendingMessages.push(text);
        },
        getActorLabel: () => battle.playerMon.species
      }
    );

    expect(result).toMatchObject({
      shouldContinue: true,
      moveWasAttempted: true
    });
    expect(battle.currentScriptLabel).toBe('BattleScript_EffectHit');
    expect(battle.vm.currentLabel).toBe('BattleScript_EffectHit');
    expect(battle.vm.locals.moveId).toBe(move.id);
    expect(battle.vm.pendingCommands[0]).toMatchObject({ type: 'script', label: 'BattleScript_EffectHit' });
    expect(battle.vm.pendingMessages[0]).toContain(`used ${move.name}`);
  });

  test('can clone and reset VM and post-battle state in place', () => {
    const vm = createBattleVmState();
    vm.currentLabel = 'BattleScript_Test';
    vm.pc = 3;
    vm.callStack = [{ label: 'BattleScript_Parent', pc: 1 }];
    vm.locals.turn = 2;
    vm.pendingCommands.push({ type: 'script', label: 'BattleScript_Test' });
    vm.pendingMessages.push('message');

    const postResult = createBattlePostResult();
    postResult.outcome = 'won';
    postResult.payouts = 1400;
    postResult.levelUps.push({ side: 'player', species: 'PIDGEY', level: 19 });

    const cloned = cloneBattlePostResult(postResult);
    expect(cloned).toEqual(postResult);
    expect(cloned.levelUps).not.toBe(postResult.levelUps);

    resetBattleVmState(vm);
    resetBattlePostResult(postResult);

    expect(vm).toEqual(createBattleVmState());
    expect(postResult).toEqual(createBattlePostResult());
  });
});
