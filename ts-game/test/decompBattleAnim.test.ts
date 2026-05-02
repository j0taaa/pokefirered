import { describe, expect, test } from 'vitest';
import * as battleAnim from '../src/game/decompBattleAnim';
import {
  ANIMSPRITE_IS_TARGET,
  ANIM_ATTACKER,
  ANIM_TARGET,
  B_POSITION_OPPONENT_LEFT,
  B_POSITION_PLAYER_LEFT,
  B_POSITION_PLAYER_RIGHT,
  B_SIDE_OPPONENT,
  B_SIDE_PLAYER,
  CMD_CALL,
  CMD_CHANGEBG,
  CMD_CHOOSETWOTURNANIM,
  CMD_CLEARMONBG,
  CMD_CREATESPRITE,
  CMD_CREATEVISUALTASK,
  CMD_DELAY,
  CMD_END,
  CMD_FADETOBG,
  CMD_FADETOBGFROMSET,
  CMD_GOTO,
  CMD_INVISIBLE,
  CMD_JUMPARGEQ,
  CMD_JUMPIFCONTEST,
  CMD_JUMPIFMOVETURN,
  CMD_LOADSPRITEGFX,
  CMD_LOOPSEWITHPAN,
  CMD_MONBG,
  CMD_PANSE,
  CMD_PANSE_ADJUSTALL,
  CMD_PANSE_ADJUSTNONE,
  CMD_PLAYSE,
  CMD_PLAYSEWITHPAN,
  CMD_RESTOREBG,
  CMD_RETURN,
  CMD_SETARG,
  CMD_SETPAN,
  CMD_SPLITBGPRIO,
  CMD_SPLITBGPRIO_ALL,
  CMD_SPLITBGPRIO_FOES,
  CMD_STOPSOUND,
  CMD_TEAMATTACK_MOVEBACK,
  CMD_TEAMATTACK_MOVEFWD,
  CMD_UNLOADSPRITEGFX,
  CMD_VISIBLE,
  CMD_WAITBGFADEIN,
  CMD_WAITBGFADEOUT,
  CMD_WAITFORVISUALFINISH,
  CMD_WAITPLAYSEWITHPAN,
  CMD_WAITSOUND,
  CalculatePanIncrement,
  ClearBattleAnimationVars,
  DoMoveAnim,
  IsBattlerSpriteVisible,
  KeepPanInRange,
  LaunchBattleAnimation,
  RelocateBattleBgPal,
  RunBattleAnimCommand,
  RunAnimScriptCommand,
  SOUND_PAN_ATTACKER,
  SOUND_PAN_TARGET,
  TASK_NONE,
  Task_ClearMonBg,
  Task_FadeToBg,
  Task_InitUpdateMonBg,
  Task_LoopAndPlaySE,
  Task_PanFromInitialToTarget,
  Task_WaitAndPlaySE,
  WaitAnimFrameCount,
  BattleAnimAdjustPanning,
  BattleAnimAdjustPanning2,
  createBattleAnimRuntime,
  ptrBytes,
  wordBytes
} from '../src/game/decompBattleAnim';

describe('decompBattleAnim', () => {
  test('exports exact C command and helper names used by battle_anim.c', () => {
    expect(battleAnim.Cmd_loadspritegfx).toBeTypeOf('function');
    expect(battleAnim.Cmd_unloadspritegfx).toBeTypeOf('function');
    expect(battleAnim.Cmd_createsprite).toBeTypeOf('function');
    expect(battleAnim.Cmd_createvisualtask).toBeTypeOf('function');
    expect(battleAnim.Cmd_delay).toBeTypeOf('function');
    expect(battleAnim.Cmd_waitforvisualfinish).toBeTypeOf('function');
    expect(battleAnim.Cmd_nop).toBeTypeOf('function');
    expect(battleAnim.Cmd_nop2).toBeTypeOf('function');
    expect(battleAnim.Cmd_end).toBeTypeOf('function');
    expect(battleAnim.Cmd_playse).toBeTypeOf('function');
    expect(battleAnim.Cmd_monbg).toBeTypeOf('function');
    expect(battleAnim.Cmd_clearmonbg).toBeTypeOf('function');
    expect(battleAnim.Cmd_monbg_static).toBeTypeOf('function');
    expect(battleAnim.Cmd_clearmonbg_static).toBeTypeOf('function');
    expect(battleAnim.Cmd_setalpha).toBeTypeOf('function');
    expect(battleAnim.Cmd_setbldcnt).toBeTypeOf('function');
    expect(battleAnim.Cmd_blendoff).toBeTypeOf('function');
    expect(battleAnim.Cmd_call).toBeTypeOf('function');
    expect(battleAnim.Cmd_return).toBeTypeOf('function');
    expect(battleAnim.Cmd_setarg).toBeTypeOf('function');
    expect(battleAnim.Cmd_choosetwoturnanim).toBeTypeOf('function');
    expect(battleAnim.Cmd_jumpifmoveturn).toBeTypeOf('function');
    expect(battleAnim.Cmd_goto).toBeTypeOf('function');
    expect(battleAnim.IsSpeciesNotUnown(battleAnim.SPECIES_UNOWN)).toBe(false);
    expect(battleAnim.IsSpeciesNotUnown(1)).toBe(true);
    expect(battleAnim.Cmd_fadetobg).toBeTypeOf('function');
    expect(battleAnim.Cmd_fadetobgfromset).toBeTypeOf('function');
    expect(battleAnim.LoadMoveBg).toBeTypeOf('function');
    expect(battleAnim.LoadDefaultBg).toBeTypeOf('function');
    expect(battleAnim.Cmd_restorebg).toBeTypeOf('function');
    expect(battleAnim.Cmd_waitbgfadeout).toBeTypeOf('function');
    expect(battleAnim.Cmd_waitbgfadein).toBeTypeOf('function');
    expect(battleAnim.Cmd_changebg).toBeTypeOf('function');
    expect(battleAnim.Cmd_playsewithpan).toBeTypeOf('function');
    expect(battleAnim.Cmd_setpan).toBeTypeOf('function');
    expect(battleAnim.Cmd_panse).toBeTypeOf('function');
    expect(battleAnim.Cmd_panse_adjustnone).toBeTypeOf('function');
    expect(battleAnim.Cmd_panse_adjustall).toBeTypeOf('function');
    expect(battleAnim.Cmd_loopsewithpan).toBeTypeOf('function');
    expect(battleAnim.Cmd_waitplaysewithpan).toBeTypeOf('function');
    expect(battleAnim.Cmd_createsoundtask).toBeTypeOf('function');
    expect(battleAnim.Cmd_waitsound).toBeTypeOf('function');
    expect(battleAnim.Cmd_jumpargeq).toBeTypeOf('function');
    expect(battleAnim.Cmd_jumpifcontest).toBeTypeOf('function');
    expect(battleAnim.Cmd_splitbgprio).toBeTypeOf('function');
    expect(battleAnim.Cmd_splitbgprio_all).toBeTypeOf('function');
    expect(battleAnim.Cmd_splitbgprio_foes).toBeTypeOf('function');
    expect(battleAnim.Cmd_invisible).toBeTypeOf('function');
    expect(battleAnim.Cmd_visible).toBeTypeOf('function');
    expect(battleAnim.Cmd_teamattack_moveback).toBeTypeOf('function');
    expect(battleAnim.Cmd_teamattack_movefwd).toBeTypeOf('function');
    expect(battleAnim.Cmd_stopsound).toBeTypeOf('function');
  });

  test('ClearBattleAnimationVars and LaunchBattleAnimation reset the same globals and script pointer', () => {
    const runtime = createBattleAnimRuntime({ gAnimVisualTaskCount: 2, gAnimSoundTaskCount: 3, gBattleAnimArgs: [1, 2, 3, 4, 5, 6, 7, 8] });
    ClearBattleAnimationVars(runtime);
    expect(runtime.gAnimVisualTaskCount).toBe(0);
    expect(runtime.gBattleAnimArgs).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(runtime.sAnimSpriteIndexArray).toEqual(Array(8).fill(0xffff));
    expect(runtime.sMonAnimTaskIdArray).toEqual([TASK_NONE, TASK_NONE]);

    LaunchBattleAnimation(runtime, [[CMD_END], [CMD_PLAYSE, ...wordBytes(7), CMD_END]], 1, true);
    expect(runtime.script).toEqual([CMD_PLAYSE, ...wordBytes(7), CMD_END]);
    expect(runtime.scriptPtr).toBe(0);
    expect(runtime.gAnimScriptActive).toBe(true);
    expect(runtime.gAnimScriptCallback).toBe('RunAnimScriptCommand');
    expect(runtime.sAnimMoveIndex).toBe(1);

    runtime.gBattlerAttacker = 2;
    runtime.gBattlerTarget = 3;
    DoMoveAnim(runtime, [[CMD_END], [CMD_END]], 1);
    expect(runtime.gBattleAnimAttacker).toBe(2);
    expect(runtime.gBattleAnimTarget).toBe(3);
  });

  test('load/unload sprite gfx, delay, visual wait, create sprite, and end follow C waits and counters', () => {
    const runtime = createBattleAnimRuntime({
      script: [
        CMD_LOADSPRITEGFX, ...wordBytes(5),
        CMD_UNLOADSPRITEGFX, ...wordBytes(5),
        CMD_CREATESPRITE, ...ptrBytes(0x1234), ANIMSPRITE_IS_TARGET | 2, 2, ...wordBytes(11), ...wordBytes(12),
        CMD_CREATEVISUALTASK, ...ptrBytes(0x7777), 1, 1, ...wordBytes(99),
        CMD_WAITFORVISUALFINISH,
        CMD_DELAY, 2,
        CMD_END
      ]
    });

    RunBattleAnimCommand(runtime);
    expect(runtime.sAnimSpriteIndexArray[0]).toBe(5);
    expect(runtime.sAnimFramesToWait).toBe(1);
    expect(runtime.gAnimScriptCallback).toBe('WaitAnimFrameCount');

    WaitAnimFrameCount(runtime);
    expect(runtime.sAnimFramesToWait).toBe(0);
    WaitAnimFrameCount(runtime);
    expect(runtime.gAnimScriptCallback).toBe('RunAnimScriptCommand');

    RunBattleAnimCommand(runtime);
    expect(runtime.sAnimSpriteIndexArray[0]).toBe(0xffff);
    RunBattleAnimCommand(runtime);
    expect(runtime.createdSprites[0]).toMatchObject({ template: 0x1234, x: 120, y: 50, subpriority: 18 });
    expect(runtime.gBattleAnimArgs.slice(0, 2)).toEqual([11, 12]);

    RunBattleAnimCommand(runtime);
    expect(runtime.tasks[0]).toMatchObject({ func: 'TaskFunc_30583' });
    expect(runtime.gAnimVisualTaskCount).toBe(2);
    RunBattleAnimCommand(runtime);
    expect(runtime.sAnimFramesToWait).toBe(1);
    runtime.gAnimVisualTaskCount = 0;
    RunBattleAnimCommand(runtime);
    expect(runtime.scriptPtr).toBe(27);
    RunBattleAnimCommand(runtime);
    expect(runtime.sAnimFramesToWait).toBe(2);
    runtime.sAnimFramesToWait = 0;
    RunBattleAnimCommand(runtime);
    expect(runtime.gAnimScriptActive).toBe(false);
  });

  test('branching commands use byte offsets exactly like pointer reads in C', () => {
    const runtime = createBattleAnimRuntime({
      gAnimMoveTurn: 1,
      gBattleAnimArgs: [7, 0, 0, 0, 0, 0, 0, 0],
      script: [
        CMD_CALL, ...ptrBytes(24),
        CMD_SETARG, 1, ...wordBytes(33),
        CMD_JUMPIFMOVETURN, 2, ...ptrBytes(30),
        CMD_CHOOSETWOTURNANIM, ...ptrBytes(40), ...ptrBytes(44),
        CMD_RETURN,
        CMD_GOTO, ...ptrBytes(50),
        CMD_JUMPARGEQ, 0, ...wordBytes(7), ...ptrBytes(60),
        CMD_JUMPIFCONTEST, ...ptrBytes(70)
      ]
    });

    RunBattleAnimCommand(runtime);
    expect(runtime.scriptPtr).toBe(24);
    RunBattleAnimCommand(runtime);
    expect(runtime.scriptPtr).toBe(5);
    RunBattleAnimCommand(runtime);
    expect(runtime.gBattleAnimArgs[1]).toBe(33);
    RunBattleAnimCommand(runtime);
    expect(runtime.scriptPtr).toBe(15);
    RunBattleAnimCommand(runtime);
    expect(runtime.scriptPtr).toBe(44);

    runtime.scriptPtr = 25;
    RunBattleAnimCommand(runtime);
    expect(runtime.scriptPtr).toBe(50);
    runtime.scriptPtr = 30;
    RunBattleAnimCommand(runtime);
    expect(runtime.scriptPtr).toBe(60);
    runtime.scriptPtr = 38;
    RunBattleAnimCommand(runtime);
    expect(runtime.scriptPtr).toBe(43);
  });

  test('mon background commands create/update/clear tasks and restore sprite visibility', () => {
    const runtime = createBattleAnimRuntime({ script: [CMD_MONBG, ANIM_ATTACKER, CMD_CLEARMONBG, ANIM_ATTACKER] });
    RunBattleAnimCommand(runtime);
    const monTask = runtime.tasks.find((task) => task.func === 'Task_InitUpdateMonBg' && task.data[0] === 0)!;
    expect(runtime.sMonAnimTaskIdArray[0]).toBe(monTask.id);
    expect(runtime.sprites[0]!.invisible).toBe(true);
    expect(runtime.gBattle_BG1_X).toBe(-38);

    runtime.sprites[0]!.x2 = 5;
    Task_InitUpdateMonBg(runtime, monTask.id);
    expect(runtime.gBattle_BG2_X).toBe(-13);

    RunBattleAnimCommand(runtime);
    expect(runtime.sprites[0]!.invisible).toBe(false);
    const clearTask = runtime.tasks.find((task) => task.func === 'Task_ClearMonBg')!;
    Task_ClearMonBg(runtime, clearTask.id);
    expect(runtime.sMonAnimTaskIdArray[0]).not.toBe(TASK_NONE);
    Task_ClearMonBg(runtime, clearTask.id);
    expect(runtime.sMonAnimTaskIdArray[0]).toBe(TASK_NONE);
    expect(runtime.gBattle_BG1_X).toBe(0);

    expect(IsBattlerSpriteVisible(createBattleAnimRuntime({ battlerSpritePresent: [false, true, true, true] }), 0)).toBe(false);
  });

  test('background fade/change/wait commands mirror fade state transitions', () => {
    const runtime = createBattleAnimRuntime({ script: [CMD_FADETOBG, 4, CMD_WAITBGFADEOUT, CMD_WAITBGFADEIN, CMD_CHANGEBG, 3, CMD_RESTOREBG, CMD_FADETOBGFROMSET, 1, 2, 3] });

    RunBattleAnimCommand(runtime);
    expect(runtime.sAnimBackgroundFadeState).toBe(1);
    const fadeTask = runtime.tasks.find((task) => task.func === 'Task_FadeToBg')!;
    Task_FadeToBg(runtime, fadeTask.id);
    Task_FadeToBg(runtime, fadeTask.id);
    expect(runtime.sAnimBackgroundFadeState).toBe(2);
    RunBattleAnimCommand(runtime);
    expect(runtime.scriptPtr).toBe(3);
    Task_FadeToBg(runtime, fadeTask.id);
    expect(runtime.operations).toContain('LoadMoveBg(4)');
    Task_FadeToBg(runtime, fadeTask.id);
    expect(runtime.sAnimBackgroundFadeState).toBe(0);
    RunBattleAnimCommand(runtime);
    expect(runtime.scriptPtr).toBe(4);
    RunBattleAnimCommand(runtime);
    expect(runtime.operations).toContain('LoadMoveBg(3)');
    RunBattleAnimCommand(runtime);
    expect(runtime.tasks.at(-1)?.data[0]).toBe(-1);
    runtime.battlerSides[1] = B_SIDE_PLAYER;
    RunBattleAnimCommand(runtime);
    expect(runtime.tasks.at(-1)?.data[0]).toBe(2);
  });

  test('panning helpers and sound tasks preserve exact clamping/increment behavior', () => {
    const runtime = createBattleAnimRuntime();
    expect(KeepPanInRange(80, 0)).toBe(SOUND_PAN_TARGET);
    expect(KeepPanInRange(-90, 0)).toBe(SOUND_PAN_ATTACKER);
    expect(CalculatePanIncrement(-10, 10, -3)).toBe(3);
    expect(CalculatePanIncrement(10, -10, 3)).toBe(-3);
    expect(BattleAnimAdjustPanning(runtime, 20)).toBe(20);
    runtime.gBattleAnimAttacker = 1;
    runtime.gBattleAnimTarget = 3;
    expect(BattleAnimAdjustPanning(runtime, SOUND_PAN_ATTACKER & 0xff)).toBe(SOUND_PAN_TARGET);
    expect(BattleAnimAdjustPanning2(runtime, 20)).toBe(-20);

    runtime.script = [CMD_PLAYSEWITHPAN, ...wordBytes(10), 20, CMD_SETPAN, 20, CMD_PANSE, ...wordBytes(11), 0, 30, 10, 1, CMD_PANSE_ADJUSTNONE, ...wordBytes(12), 0, 10, 5, 0, CMD_PANSE_ADJUSTALL, ...wordBytes(13), 1, 2, 3, 0];
    runtime.gBattleAnimAttacker = 0;
    runtime.gBattleAnimTarget = 1;
    RunBattleAnimCommand(runtime);
    RunBattleAnimCommand(runtime);
    RunBattleAnimCommand(runtime);
    expect(runtime.gAnimSoundTaskCount).toBe(1);
    const panTask = runtime.tasks.find((task) => task.func === 'Task_PanFromInitialToTarget')!;
    Task_PanFromInitialToTarget(runtime, panTask.id);
    Task_PanFromInitialToTarget(runtime, panTask.id);
    Task_PanFromInitialToTarget(runtime, panTask.id);
    Task_PanFromInitialToTarget(runtime, panTask.id);
    Task_PanFromInitialToTarget(runtime, panTask.id);
    Task_PanFromInitialToTarget(runtime, panTask.id);
    expect(runtime.operations.at(-1)).toBe('SE12PanpotControl(30)');

    RunBattleAnimCommand(runtime);
    expect(runtime.tasks.at(-1)?.data.slice(0, 5)).toEqual([0, 10, 5, 0, 0]);
    RunBattleAnimCommand(runtime);
    expect(runtime.tasks.at(-1)?.data[0]).toBe(1);
  });

  test('loop/wait sound commands, waitsound timeout, and end sound wait follow C counters', () => {
    const runtime = createBattleAnimRuntime({ script: [CMD_LOOPSEWITHPAN, ...wordBytes(20), 0, 2, 2, CMD_WAITPLAYSEWITHPAN, ...wordBytes(21), 0, 1, CMD_WAITSOUND, CMD_END] });
    RunBattleAnimCommand(runtime);
    const loopTask = runtime.tasks.find((task) => task.func === 'Task_LoopAndPlaySE')!;
    expect(runtime.gAnimSoundTaskCount).toBe(1);
    Task_LoopAndPlaySE(runtime, loopTask.id);
    Task_LoopAndPlaySE(runtime, loopTask.id);
    Task_LoopAndPlaySE(runtime, loopTask.id);
    expect(runtime.gAnimSoundTaskCount).toBe(0);

    RunBattleAnimCommand(runtime);
    const waitTask = runtime.tasks.find((task) => task.func === 'Task_WaitAndPlaySE')!;
    Task_WaitAndPlaySE(runtime, waitTask.id);
    Task_WaitAndPlaySE(runtime, waitTask.id);
    expect(runtime.gAnimSoundTaskCount).toBe(0);

    runtime.sePlaying = true;
    RunBattleAnimCommand(runtime);
    expect(runtime.sAnimFramesToWait).toBe(1);
    runtime.sSoundAnimFramesToWait = 90;
    RunBattleAnimCommand(runtime);
    expect(runtime.operations).toContain('m4aMPlayStop(SE1)');
    runtime.sePlaying = false;
    RunBattleAnimCommand(runtime);
    expect(runtime.scriptPtr).toBe(12);

    runtime.sAnimSpriteIndexArray[0] = 9;
    RunBattleAnimCommand(runtime);
    expect(runtime.gAnimScriptActive).toBe(false);
    expect(runtime.sAnimSpriteIndexArray[0]).toBe(0xffff);
  });

  test('visibility, split priority, team attack, relocate palette, and stop sound helpers match C branches', () => {
    const dest = Array(64 * 32).fill(0x0123);
    RelocateBattleBgPal(2, dest, 1, false);
    expect(dest[0]).toBe(0x2124);
    expect(dest[32 * 31]).toBe(0x2124);
    expect(dest[32 * 32]).toBe(0x0123);

    const runtime = createBattleAnimRuntime({
      gBattleAnimAttacker: 0,
      gBattleAnimTarget: 2,
      battlerBgPriorityRanks: [1, 2, 2, 2],
      battlerSides: [B_SIDE_PLAYER, B_SIDE_OPPONENT, B_SIDE_PLAYER, B_SIDE_OPPONENT],
      battlerPositions: [B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_RIGHT, B_POSITION_PLAYER_LEFT],
      script: [
        CMD_INVISIBLE, ANIM_ATTACKER,
        CMD_VISIBLE, ANIM_ATTACKER,
        CMD_SPLITBGPRIO, ANIM_ATTACKER,
        CMD_SPLITBGPRIO_ALL,
        CMD_SPLITBGPRIO_FOES, ANIM_TARGET,
        CMD_TEAMATTACK_MOVEBACK, ANIM_TARGET,
        CMD_TEAMATTACK_MOVEFWD, ANIM_TARGET,
        CMD_STOPSOUND
      ]
    });
    RunBattleAnimCommand(runtime);
    expect(runtime.sprites[0]!.invisible).toBe(true);
    RunBattleAnimCommand(runtime);
    expect(runtime.sprites[0]!.invisible).toBe(false);
    RunBattleAnimCommand(runtime);
    expect(runtime.operations).toContain('SetAnimBgAttribute(1,PRIORITY,1)');
    RunBattleAnimCommand(runtime);
    RunBattleAnimCommand(runtime);
    expect(runtime.operations.filter((op) => op.includes('SetAnimBgAttribute')).length).toBe(4);
    RunBattleAnimCommand(runtime);
    expect(runtime.sprites[2]!.oam.priority).toBe(3);
    RunBattleAnimCommand(runtime);
    expect(runtime.sprites[2]!.oam.priority).toBe(2);
    RunBattleAnimCommand(runtime);
    expect(runtime.operations.slice(-2)).toEqual(['m4aMPlayStop(SE1)', 'm4aMPlayStop(SE2)']);
  });

  test('RunAnimScriptCommand keeps executing until a wait or inactive animation stops it', () => {
    const runtime = createBattleAnimRuntime({ script: [CMD_PLAYSE, ...wordBytes(55), CMD_DELAY, 1, CMD_PLAYSE, ...wordBytes(66)] });
    runtime.gAnimScriptActive = true;
    RunAnimScriptCommand(runtime);
    expect(runtime.operations).toEqual(['PlaySE(55)']);
    expect(runtime.scriptPtr).toBe(5);
    expect(runtime.gAnimScriptCallback).toBe('WaitAnimFrameCount');
  });
});
