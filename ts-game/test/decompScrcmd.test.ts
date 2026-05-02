import { describe, expect, test } from 'vitest';
import {
  Compare,
  RunPauseTimer,
  ScrCmd_additem,
  ScrCmd_addmoney,
  ScrCmd_applymovementat,
  ScrCmd_call,
  ScrCmd_call_if,
  ScrCmd_checkitem,
  ScrCmd_checkmoney,
  ScrCmd_clearflag,
  ScrCmd_compare_var_to_value,
  ScrCmd_delay,
  ScrCmd_dofieldeffect,
  ScrCmd_givemon,
  ScrCmd_goto_if,
  ScrCmd_removeitem,
  ScrCmd_return,
  ScrCmd_setdynamicwarp,
  ScrCmd_setfieldeffectargument,
  ScrCmd_setflag,
  ScrCmd_setmonmetlocation,
  ScrCmd_setmonmodernfatefulencounter,
  ScrCmd_setvar,
  ScrCmd_waitfieldeffect,
  ScrCmd_warp,
  createScrcmdRuntime
} from '../src/game/decompScrcmd';

describe('decompScrcmd', () => {
  test('control-flow commands use the FireRed comparison table and call stack', () => {
    const runtime = createScrcmdRuntime([3, 42]);
    const ctx = runtime.ctx;
    ctx.comparisonResult = Compare(7, 7);

    ScrCmd_goto_if(ctx, runtime);
    expect(ctx.pc).toBe(42);

    ctx.script = [1, 99];
    ctx.pc = 0;
    ctx.comparisonResult = Compare(2, 8);
    ScrCmd_call_if(ctx, runtime);
    expect(ctx.pc).toBe(2);
    expect(ctx.stack).toEqual([]);

    ctx.script = [55];
    ctx.pc = 0;
    ScrCmd_call(ctx, runtime);
    expect(ctx.pc).toBe(55);
    expect(ctx.stack).toEqual([1]);

    ScrCmd_return(ctx, runtime);
    expect(ctx.pc).toBe(1);
  });

  test('vars, flags, items, money, and party commands mutate runtime state 1:1', () => {
    const runtime = createScrcmdRuntime([0x4001, 25, 0x4001, 25]);
    const ctx = runtime.ctx;

    ScrCmd_setvar(ctx, runtime);
    ScrCmd_compare_var_to_value(ctx, runtime);
    expect(ctx.comparisonResult).toBe(1);

    ctx.script = [77];
    ctx.pc = 0;
    ScrCmd_setflag(ctx, runtime);
    expect(runtime.flags.has(77)).toBe(true);

    ctx.script = [77];
    ctx.pc = 0;
    ScrCmd_clearflag(ctx, runtime);
    expect(runtime.flags.has(77)).toBe(false);

    runtime.vars.set(0x4002, 13);
    runtime.vars.set(0x4003, 3);
    ctx.script = [0x4002, 0x4003, 0x4002, 0x4003];
    ctx.pc = 0;
    ScrCmd_additem(ctx, runtime);
    expect(runtime.inventory.get(13)).toBe(3);
    expect(runtime.specialResult).toBe(1);

    ScrCmd_checkitem(ctx, runtime);
    expect(runtime.specialResult).toBe(1);

    ctx.script = [0x4002, 0x4003];
    ctx.pc = 0;
    ScrCmd_removeitem(ctx, runtime);
    expect(runtime.inventory.get(13)).toBe(0);

    runtime.vars.set(0x4004, 500);
    ctx.script = [0x4004, 0x4004];
    ctx.pc = 0;
    ScrCmd_addmoney(ctx, runtime);
    expect(runtime.money).toBe(500);
    ScrCmd_checkmoney(ctx, runtime);
    expect(runtime.specialResult).toBe(1);

    runtime.vars.set(0x4005, 25);
    runtime.vars.set(0x4006, 7);
    ctx.script = [0x4005, 0x4006, 0, 0, 0, 0, 0];
    ctx.pc = 0;
    ScrCmd_givemon(ctx, runtime);
    expect(runtime.party[0]).toMatchObject({ species: 25, level: 7, isEgg: false });

    runtime.vars.set(0x4007, 9);
    ctx.script = [0, 0x4007, 0];
    ctx.pc = 0;
    ScrCmd_setmonmetlocation(ctx, runtime);
    ScrCmd_setmonmodernfatefulencounter(ctx, runtime);
    expect(runtime.party[0].metLocation).toBe(9);
    expect(runtime.party[0].modernFatefulEncounter).toBe(true);
  });

  test('warp, movement, field effect, and delay commands install observable waits', () => {
    const runtime = createScrcmdRuntime([4, 5, 6, 0x4001, 0x4002]);
    const ctx = runtime.ctx;
    runtime.vars.set(0x4001, 11);
    runtime.vars.set(0x4002, 12);

    expect(ScrCmd_warp(ctx, runtime)).toBe(true);
    expect(runtime.warp).toEqual({ mapGroup: 4, mapNum: 5, warpId: 6, x: 11, y: 12, type: 'DoWarp' });

    ctx.script = [7, 8, 9, 0x4001, 0x4002];
    ctx.pc = 0;
    ScrCmd_setdynamicwarp(ctx, runtime);
    expect(runtime.dynamicWarp).toMatchObject({ mapGroup: 7, mapNum: 8, warpId: 9, x: 11, y: 12 });

    runtime.vars.set(0x4003, 99);
    ctx.script = [0x4003, 1234, 2, 3];
    ctx.pc = 0;
    ScrCmd_applymovementat(ctx, runtime);
    expect(runtime.movingNpcId).toBe(99);
    expect(runtime.movingNpcMapGroup).toBe(2);
    expect(runtime.movingNpcMapNum).toBe(3);
    expect(runtime.operations).toContain('ScriptMovement_StartObjectMovementScript:99:3:2:1234');

    runtime.vars.set(0x4004, 44);
    ctx.script = [21, 2, 0x4004, 21];
    ctx.pc = 0;
    ScrCmd_dofieldeffect(ctx, runtime);
    ScrCmd_setfieldeffectargument(ctx, runtime);
    expect(runtime.fieldEffects.has(21)).toBe(true);
    expect(runtime.fieldEffectArgs[2]).toBe(44);

    expect(ScrCmd_waitfieldeffect(ctx, runtime)).toBe(true);
    expect(ctx.native?.()).toBe(false);
    runtime.fieldEffects.delete(21);
    expect(ctx.native?.()).toBe(true);

    ctx.script = [3];
    ctx.pc = 0;
    expect(ScrCmd_delay(ctx, runtime)).toBe(true);
    expect(RunPauseTimer(runtime)).toBe(false);
    expect(RunPauseTimer(runtime)).toBe(false);
    expect(RunPauseTimer(runtime)).toBe(true);
  });
});
