import { describe, expect, it } from 'vitest';
import { createBattleState } from '../src/game/battle';
import { getBattleScriptCommandPlan } from '../src/game/battleScriptVm';
import {
  ApplyRandomDmgMultiplier,
  Cmd_accuracycheck,
  Cmd_addbyte,
  Cmd_attackcanceler,
  Cmd_attackstring,
  Cmd_bicbyte,
  Cmd_call,
  Cmd_copyarray,
  Cmd_copyarraywithindex,
  Cmd_damagecalc,
  Cmd_decrementmultihit,
  Cmd_end,
  Cmd_getmoneyreward,
  Cmd_givepaydaymoney,
  Cmd_goto,
  Cmd_jumpifarrayequal,
  Cmd_jumpifbyte,
  Cmd_jumpifword,
  Cmd_orbyte,
  Cmd_ppreduce,
  Cmd_return,
  Cmd_setbyte,
  Cmd_setmultihit,
  JumpIfMoveAffectedByProtect,
  JumpIfMoveFailed,
  ModulateDmgByType,
  MoveValuesCleanUp,
  createBattleScriptCommandsRuntime,
  gBattleScriptingCommands
} from '../src/game/decompBattleScriptCommands';

describe('decompBattleScriptCommands', () => {
  it('matches C byte, word, array, and branch command pointer semantics', () => {
    const runtime = createBattleScriptCommandsRuntime();

    Cmd_setbyte(runtime, 'flag', 3);
    Cmd_addbyte(runtime, 'flag', 4);
    Cmd_orbyte(runtime, 'flag', 0b1000);
    Cmd_bicbyte(runtime, 'flag', 0b0010);

    expect(runtime.memory.flag).toBe(13);
    expect(runtime.scriptPtr).toBe(4);

    Cmd_jumpifbyte(runtime, 'CMP_EQUAL', 'flag', 13, 99);
    expect(runtime.scriptPtr).toBe(99);

    Cmd_jumpifword(runtime, 'CMP_GREATER_THAN', 'flag', 20, 55);
    expect(runtime.scriptPtr).toBe(100);

    runtime.arrays.source = [1, 2, 3];
    Cmd_copyarray(runtime, 'dest', 'source');
    Cmd_copyarraywithindex(runtime, 'picked', 'dest', 1);
    expect(runtime.arrays.dest).toEqual([1, 2, 3]);
    expect(runtime.memory.picked).toBe(2);

    Cmd_jumpifarrayequal(runtime, 'source', 'dest', 321);
    expect(runtime.scriptPtr).toBe(321);
  });

  it('preserves call, goto, return, end, and conditional move/protect branches', () => {
    const runtime = createBattleScriptCommandsRuntime({ scriptPtr: 10 });

    Cmd_call(runtime, 200);
    expect(runtime.stack).toEqual([10]);
    expect(runtime.scriptPtr).toBe(200);

    Cmd_return(runtime);
    expect(runtime.scriptPtr).toBe(10);

    Cmd_goto(runtime, 77);
    expect(runtime.scriptPtr).toBe(77);

    runtime.moveFailed = true;
    JumpIfMoveFailed(runtime, 88);
    expect(runtime.scriptPtr).toBe(88);

    runtime.protected = true;
    JumpIfMoveAffectedByProtect(runtime, 99);
    expect(runtime.scriptPtr).toBe(99);

    Cmd_end(runtime);
    expect(runtime.ended).toBe(true);
    expect(runtime.scriptPtr).toBe(99);
  });

  it('keeps damage, multihit, money, and move cleanup helpers mutable on the runtime', () => {
    const runtime = createBattleScriptCommandsRuntime({ randomSeed: 5 });

    Cmd_damagecalc(runtime, 100);
    ModulateDmgByType(runtime, 2);
    ApplyRandomDmgMultiplier(runtime);
    expect(runtime.damage).toBeGreaterThanOrEqual(85);
    expect(runtime.damage).toBeLessThanOrEqual(100);
    expect(runtime.typeModifier).toBe(2);

    Cmd_setmultihit(runtime, 3);
    Cmd_decrementmultihit(runtime);
    expect(runtime.multihit).toBe(2);

    Cmd_getmoneyreward(runtime, 500);
    Cmd_givepaydaymoney(runtime, 70);
    expect(runtime.memory.moneyReward).toBe(500);
    expect(runtime.memory.payDayMoney).toBe(70);

    MoveValuesCleanUp(runtime);
    expect(runtime.operations.at(-1)).toContain('movevaluescleanup');
  });

  it('delegates real command execution into the existing TypeScript battle script VM', () => {
    const battle = createBattleState();
    const move = battle.moves[0]!;
    const messages: string[] = [];
    battle.vm.currentLabel = 'BattleScript_EffectHit';
    battle.currentScriptLabel = 'BattleScript_EffectHit';
    battle.vm.locals.scriptCommandPlan = getBattleScriptCommandPlan('BattleScript_EffectHit').join(',');

    const runtime = createBattleScriptCommandsRuntime({
      battle,
      commandRuntime: {
        attackerSide: 'player',
        attacker: battle.playerMon,
        defender: battle.wildMon,
        move,
        options: { announce: true, consumePp: true },
        pushMessage: (message) => messages.push(message),
        getActorLabel: () => 'Charmander',
        attemptAccuracy: () => true
      }
    });

    Cmd_attackcanceler(runtime);
    Cmd_accuracycheck(runtime);
    Cmd_attackstring(runtime);
    Cmd_ppreduce(runtime);

    expect(messages[0]).toBe(`Charmander used ${move.name}!`);
    expect(move.ppRemaining).toBe(move.pp - 1);
    expect(String(battle.vm.locals.executedScriptCommands)).toContain('attackcanceler,accuracycheck,attackstring,ppreduce');
    expect(gBattleScriptingCommands.activeRuntime).toBe(runtime);
  });
});
