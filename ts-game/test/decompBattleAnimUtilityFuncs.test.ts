import { describe, expect, test } from 'vitest';
import * as utility from '../src/game/decompBattleAnimUtilityFuncs';
import {
  ARG_RET_ID,
  B_SIDE_OPPONENT,
  DISPCNT_OBJWIN_ON,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_DISPCNT,
  SE_M_STAT_DECREASE,
  SE_M_STAT_INCREASE,
  animMonTrace,
  animTaskAllocBackupPalBuffer,
  animTaskBlendBattleAnimPal,
  animTaskBlendBattleAnimPalExclude,
  animTaskBlendNonAttackerPalettes,
  animTaskBlendParticle,
  animTaskBlendSpriteColorStep2,
  animTaskCopyPalFadedToUnfaded,
  animTaskCopyPalUnfadedFromBackup,
  animTaskCopyPalUnfadedToBackup,
  animTaskDrawFallingWhiteLinesOnAttacker,
  animTaskDrawFallingWhiteLinesOnAttackerStep,
  animTaskFlash,
  animTaskFlashStep,
  animTaskFreeBackupPalBuffer,
  animTaskGetAttackerSide,
  animTaskGetBattleTerrain,
  animTaskGetTargetIsAttackerPartner,
  animTaskGetTargetSide,
  animTaskHardwarePaletteFade,
  animTaskHardwarePaletteFadeStep,
  animTaskIsContest,
  animTaskIsTargetSameSide,
  animTaskSetAllNonAttackersInvisiblity,
  animTaskSetAnimAttackerAndTargetForEffectAtk,
  animTaskSetAnimAttackerAndTargetForEffectTgt,
  animTaskSetAnimTargetToBattlerTarget,
  animTaskSetAttackerInvisibleWaitForSignal,
  animTaskSetCamouflageBlend,
  animTaskStartSlidingBg,
  animTaskTraceMonBlended,
  animTaskTraceMonBlendedStep,
  animTaskUpdateSlidingBg,
  animTaskWaitAndRestoreVisibility,
  createUtilityRuntime,
  createUtilityTask,
  gBattleAnimRegOffsBgCnt,
  gBattleIntroRegOffsBgCnt,
  initStatsChangeAnimation,
  setPalettesToColor,
  startMonScrollingBgMask,
  statsChangeAnimationStep1,
  statsChangeAnimationStep2,
  statsChangeAnimationStep3,
  unpackSelectedBattlePalettes,
  updateMonScrollingBgMask
} from '../src/game/decompBattleAnimUtilityFuncs';

describe('decomp battle_anim_utility_funcs.c parity', () => {
  test('exports exact C task and callback names as aliases of the implemented logic', () => {
    expect(utility.AnimTask_BlendBattleAnimPal).toBe(utility.animTaskBlendBattleAnimPal);
    expect(utility.AnimTask_BlendBattleAnimPalExclude).toBe(utility.animTaskBlendBattleAnimPalExclude);
    expect(utility.AnimTask_SetCamouflageBlend).toBe(utility.animTaskSetCamouflageBlend);
    expect(utility.AnimTask_BlendParticle).toBe(utility.animTaskBlendParticle);
    expect(utility.StartBlendAnimSpriteColor).toBe(utility.startBlendAnimSpriteColor);
    expect(utility.AnimTask_BlendSpriteColor_Step2).toBe(utility.animTaskBlendSpriteColorStep2);
    expect(utility.AnimTask_HardwarePaletteFade).toBe(utility.animTaskHardwarePaletteFade);
    expect(utility.AnimTask_HardwarePaletteFade_Step).toBe(utility.animTaskHardwarePaletteFadeStep);
    expect(utility.AnimTask_TraceMonBlended).toBe(utility.animTaskTraceMonBlended);
    expect(utility.AnimTask_TraceMonBlended_Step).toBe(utility.animTaskTraceMonBlendedStep);
    expect(utility.AnimMonTrace).toBe(utility.animMonTrace);
    expect(utility.AnimTask_DrawFallingWhiteLinesOnAttacker).toBe(utility.animTaskDrawFallingWhiteLinesOnAttacker);
    expect(utility.AnimTask_DrawFallingWhiteLinesOnAttacker_Step).toBe(utility.animTaskDrawFallingWhiteLinesOnAttackerStep);
    expect(utility.InitStatsChangeAnimation).toBe(utility.initStatsChangeAnimation);
    expect(utility.StatsChangeAnimation_Step1).toBe(utility.statsChangeAnimationStep1);
    expect(utility.StatsChangeAnimation_Step2).toBe(utility.statsChangeAnimationStep2);
    expect(utility.StatsChangeAnimation_Step3).toBe(utility.statsChangeAnimationStep3);
    expect(utility.AnimTask_Flash).toBe(utility.animTaskFlash);
    expect(utility.AnimTask_Flash_Step).toBe(utility.animTaskFlashStep);
    expect(utility.SetPalettesToColor).toBe(utility.setPalettesToColor);
    expect(utility.AnimTask_BlendNonAttackerPalettes).toBe(utility.animTaskBlendNonAttackerPalettes);
    expect(utility.AnimTask_StartSlidingBg).toBe(utility.animTaskStartSlidingBg);
    expect(utility.AnimTask_UpdateSlidingBg).toBe(utility.animTaskUpdateSlidingBg);
    expect(utility.AnimTask_GetAttackerSide).toBe(utility.animTaskGetAttackerSide);
    expect(utility.AnimTask_GetTargetSide).toBe(utility.animTaskGetTargetSide);
    expect(utility.AnimTask_GetTargetIsAttackerPartner).toBe(utility.animTaskGetTargetIsAttackerPartner);
    expect(utility.AnimTask_SetAllNonAttackersInvisiblity).toBe(utility.animTaskSetAllNonAttackersInvisiblity);
    expect(utility.StartMonScrollingBgMask).toBe(utility.startMonScrollingBgMask);
    expect(utility.UpdateMonScrollingBgMask).toBe(utility.updateMonScrollingBgMask);
    expect(utility.AnimTask_GetBattleTerrain).toBe(utility.animTaskGetBattleTerrain);
    expect(utility.AnimTask_AllocBackupPalBuffer).toBe(utility.animTaskAllocBackupPalBuffer);
    expect(utility.AnimTask_FreeBackupPalBuffer).toBe(utility.animTaskFreeBackupPalBuffer);
    expect(utility.AnimTask_CopyPalUnfadedToBackup).toBe(utility.animTaskCopyPalUnfadedToBackup);
    expect(utility.AnimTask_CopyPalUnfadedFromBackup).toBe(utility.animTaskCopyPalUnfadedFromBackup);
    expect(utility.AnimTask_CopyPalFadedToUnfaded).toBe(utility.animTaskCopyPalFadedToUnfaded);
    expect(utility.AnimTask_IsContest).toBe(utility.animTaskIsContest);
    expect(utility.AnimTask_SetAnimAttackerAndTargetForEffectTgt).toBe(utility.animTaskSetAnimAttackerAndTargetForEffectTgt);
    expect(utility.AnimTask_IsTargetSameSide).toBe(utility.animTaskIsTargetSameSide);
    expect(utility.AnimTask_SetAnimTargetToBattlerTarget).toBe(utility.animTaskSetAnimTargetToBattlerTarget);
    expect(utility.AnimTask_SetAnimAttackerAndTargetForEffectAtk).toBe(utility.animTaskSetAnimAttackerAndTargetForEffectAtk);
    expect(utility.AnimTask_SetAttackerInvisibleWaitForSignal).toBe(utility.animTaskSetAttackerInvisibleWaitForSignal);
    expect(utility.AnimTask_WaitAndRestoreVisibility).toBe(utility.animTaskWaitAndRestoreVisibility);
  });

  test('BG register offset tables and palette unpacking preserve utility constants', () => {
    expect(gBattleAnimRegOffsBgCnt).toEqual([0x08, 0x0a, 0x0c, 0x0e]);
    expect(gBattleIntroRegOffsBgCnt).toEqual([0x08, 0x0a, 0x0c, 0x0e]);
    expect(unpackSelectedBattlePalettes(0x7f)).toBe(0x000e | (1 << 16) | (1 << 17) | (1 << 18) | (1 << 19) | (1 << 4) | (1 << 5));
  });

  test('blend tasks unpack masks, delay frames, step coeff toward target, and destroy at exact end', () => {
    const runtime = createUtilityRuntime({ battleAnimArgs: [0x183, 1, 2, 4, 0x1234] });
    const taskId = createUtilityTask(runtime);
    animTaskBlendBattleAnimPal(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.func).toBe('AnimTask_BlendSpriteColor_Step2');
    expect(task.data[10]).toBe(2);
    expect(runtime.blends).toHaveLength(0);
    animTaskBlendSpriteColorStep2(runtime, taskId);
    expect(runtime.blends).toContainEqual({ offset: 256, size: 16, coeff: 2, color: 0x1234 });
    expect(task.data[9]).toBe(0);
    animTaskBlendSpriteColorStep2(runtime, taskId);
    expect(task.data[10]).toBe(3);
    for (let i = 0; i < 6 && !runtime.tasks[taskId]?.destroyed; i++) animTaskBlendSpriteColorStep2(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);

    const exclude = createUtilityRuntime({ battleAnimArgs: [4, 0, 0, 0, 0] });
    const excludeTask = createUtilityTask(exclude);
    animTaskBlendBattleAnimPalExclude(exclude, excludeTask);
    expect(exclude.tasks[excludeTask]?.data[1]).toBe(((1 << 18) | (1 << 19)) >>> 16);

    const camo = createUtilityRuntime({ battleTerrain: 2, battleAnimArgs: [1, 0, 0, 0, 0] });
    const camoTask = createUtilityTask(camo);
    animTaskSetCamouflageBlend(camo, camoTask);
    expect(camo.battleAnimArgs[4]).toBe(30 | (24 << 5) | (11 << 10));

    const particle = createUtilityRuntime({ battleAnimArgs: [3, 0, 0, 0, 0] });
    const particleTask = createUtilityTask(particle);
    animTaskBlendParticle(particle, particleTask);
    expect(particle.tasks[particleTask]?.data[1]).toBe((1 << 19) >>> 16);
  });

  test('hardware fade and blended traces wait on engine state and active cloned sprites', () => {
    const fade = createUtilityRuntime({ battleAnimArgs: [1, 2, 3, 4, 5], paletteFadeActive: true });
    const fadeTask = createUtilityTask(fade);
    animTaskHardwarePaletteFade(fade, fadeTask);
    expect(fade.operations).toContain('BeginHardwarePaletteFade:1:2:3:4:5');
    animTaskHardwarePaletteFadeStep(fade, fadeTask);
    expect(fade.tasks[fadeTask]?.destroyed).toBe(false);
    fade.paletteFadeActive = false;
    animTaskHardwarePaletteFadeStep(fade, fadeTask);
    expect(fade.tasks[fadeTask]?.destroyed).toBe(true);

    const trace = createUtilityRuntime({ battleAnimArgs: [1, 2, 3, 1] });
    const traceTask = createUtilityTask(trace);
    animTaskTraceMonBlended(trace, traceTask);
    animTaskTraceMonBlendedStep(trace, traceTask);
    const cloneId = trace.tasks[traceTask]!.data[6];
    expect(trace.sprites[cloneId].callback).toBe('AnimMonTrace');
    expect(trace.tasks[traceTask]!.data[5]).toBe(1);
    trace.sprites[cloneId].data[0] = 0;
    animMonTrace(trace, trace.sprites[cloneId]);
    expect(trace.tasks[traceTask]!.data[5]).toBe(0);
    animTaskTraceMonBlendedStep(trace, traceTask);
    expect(trace.tasks[traceTask]?.destroyed).toBe(true);
  });

  test('falling white lines setup and teardown preserve window/blend registers, priority restore, and BG reset', () => {
    const runtime = createUtilityRuntime({ doubleBattle: true, battlerPositions: { 0: 0, 1: 1, 2: 2, 3: 3 } });
    const partnerSprite = runtime.sprites[2];
    const taskId = createUtilityTask(runtime);
    animTaskDrawFallingWhiteLinesOnAttacker(runtime, taskId);
    expect(runtime.gpuRegs[REG_OFFSET_DISPCNT] & DISPCNT_OBJWIN_ON).toBe(DISPCNT_OBJWIN_ON);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(0x0c08);
    expect(partnerSprite.oam.priority).toBe(1);
    expect(runtime.tasks[taskId]?.func).toBe('AnimTask_DrawFallingWhiteLinesOnAttacker_Step');
    for (let i = 0; i < 64; i++) animTaskDrawFallingWhiteLinesOnAttackerStep(runtime, taskId);
    expect(runtime.operations).toContain('ResetBattleAnimBg:0');
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(0);
    expect(partnerSprite.oam.priority).toBe(2);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
  });

  test('stats change animation copies args, selects battlers, loads assets, plays sound, blends, and frees state', () => {
    const runtime = createUtilityRuntime({ battleAnimArgs: [1, 2, 1, 1, 1, 0, 0, 0], doubleBattle: true });
    const taskId = createUtilityTask(runtime);
    initStatsChangeAnimation(runtime, taskId);
    statsChangeAnimationStep1(runtime, taskId);
    expect(runtime.statsChangeData?.battler1).toBe(1);
    expect(runtime.statsChangeData?.battler2).toBe(3);
    expect(runtime.tasks[taskId]?.func).toBe('StatsChangeAnimation_Step2');
    statsChangeAnimationStep2(runtime, taskId);
    expect(runtime.battleBg1X).toBe(64);
    expect(runtime.tasks[taskId]?.data[1]).toBe(-3);
    expect(runtime.sounds.at(-1)?.song).toBe(SE_M_STAT_DECREASE);
    runtime.tasks[taskId]!.data[15] = 0;
    runtime.tasks[taskId]!.data[12] = 12;
    runtime.tasks[taskId]!.data[4] = 13;
    statsChangeAnimationStep3(runtime, taskId);
    statsChangeAnimationStep3(runtime, taskId);
    expect(runtime.tasks[taskId]?.data[15]).toBe(1);
    runtime.tasks[taskId]!.data[15] = 3;
    statsChangeAnimationStep3(runtime, taskId);
    expect(runtime.statsChangeData).toBeNull();
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);

    const increase = createUtilityRuntime({ battleAnimArgs: [0, 0, 0, 0, 0, 0, 0, 0] });
    const incTask = createUtilityTask(increase);
    initStatsChangeAnimation(increase, incTask);
    statsChangeAnimationStep1(increase, incTask);
    statsChangeAnimationStep2(increase, incTask);
    expect(increase.sounds.at(-1)?.song).toBe(SE_M_STAT_INCREASE);
  });

  test('flash and palette copy helpers mutate palette buffers with exact mask/index rules', () => {
    const runtime = createUtilityRuntime();
    const taskId = createUtilityTask(runtime);
    animTaskFlash(runtime, taskId);
    expect(runtime.plttBufferFaded[16 * 16]).toBe(0);
    expect(runtime.plttBufferFaded[1 * 16]).toBe(0xffff);
    for (let i = 0; i < 7; i++) animTaskFlashStep(runtime, taskId);
    expect(runtime.tasks[taskId]?.data[0]).toBe(1);
    for (let i = 0; i < 32; i++) animTaskFlashStep(runtime, taskId);
    animTaskFlashStep(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);

    setPalettesToColor(runtime, 1 << 2, 0x2222);
    expect(runtime.plttBufferFaded.slice(32, 48).every((value) => value === 0x2222)).toBe(true);

    const pal = createUtilityRuntime({ battleAnimArgs: [1, 2] });
    const allocTask = createUtilityTask(pal);
    animTaskAllocBackupPalBuffer(pal, allocTask);
    expect(pal.backupPalBuffer).not.toBeNull();
    const copyTask = createUtilityTask(pal);
    animTaskCopyPalUnfadedToBackup(pal, copyTask);
    expect(pal.backupPalBuffer!.slice(32, 48)).toEqual(pal.plttBufferUnfaded.slice(256, 272));
    pal.backupPalBuffer![32] = 9999;
    const restoreTask = createUtilityTask(pal);
    animTaskCopyPalUnfadedFromBackup(pal, restoreTask);
    expect(pal.plttBufferUnfaded[256]).toBe(9999);
    pal.plttBufferFaded[256] = 7777;
    const fadedTask = createUtilityTask(pal);
    animTaskCopyPalFadedToUnfaded(pal, fadedTask);
    expect(pal.plttBufferUnfaded[256]).toBe(7777);
    const freeTask = createUtilityTask(pal);
    animTaskFreeBackupPalBuffer(pal, freeTask);
    expect(pal.backupPalBuffer).toBeNull();
  });

  test('non-attacker blend, sliding BG, side query, invisibility, and effect target helpers preserve globals', () => {
    const blend = createUtilityRuntime({ battleAnimAttacker: 1, battleAnimArgs: [3, 1, 2, 3, 4, 5] });
    const blendTask = createUtilityTask(blend);
    animTaskBlendNonAttackerPalettes(blend, blendTask);
    expect(blend.battleAnimArgs.slice(1, 6)).toEqual([3, 1, 2, 3, 4]);
    expect(blend.tasks[blendTask]?.data[1]).toBe(((1 << 16) | (1 << 18) | (1 << 19)) >>> 16);

    const slide = createUtilityRuntime({ battleAnimAttacker: 1, battlerSides: { 1: B_SIDE_OPPONENT }, battleAnimArgs: [0x180, 0x100, 1, 9, 0, 0, 0, 0] });
    const parent = createUtilityTask(slide);
    const slideTask = animTaskStartSlidingBg(slide, parent);
    expect(slide.battleAnimArgs[0]).toBe(-0x180);
    animTaskUpdateSlidingBg(slide, slideTask);
    expect(slide.battleBg3X).toBe(-2);
    slide.battleAnimArgs[7] = 9;
    animTaskUpdateSlidingBg(slide, slideTask);
    expect(slide.tasks[slideTask]?.destroyed).toBe(true);

    const helpers = createUtilityRuntime({ battleAnimAttacker: 0, battleAnimTarget: 2, battlerTarget: 3, battlerAttacker: 1, effectBattler: 2, contest: true, battleTerrain: 7 });
    let task = createUtilityTask(helpers);
    animTaskGetAttackerSide(helpers, task);
    expect(helpers.battleAnimArgs[7]).toBe(0);
    task = createUtilityTask(helpers);
    animTaskGetTargetSide(helpers, task);
    expect(helpers.battleAnimArgs[7]).toBe(0);
    task = createUtilityTask(helpers);
    animTaskGetTargetIsAttackerPartner(helpers, task);
    expect(helpers.battleAnimArgs[7]).toBe(1);
    task = createUtilityTask(helpers);
    animTaskGetBattleTerrain(helpers, task);
    expect(helpers.battleAnimArgs[0]).toBe(7);
    task = createUtilityTask(helpers);
    animTaskIsContest(helpers, task);
    expect(helpers.battleAnimArgs[ARG_RET_ID]).toBe(1);
    task = createUtilityTask(helpers);
    animTaskIsTargetSameSide(helpers, task);
    expect(helpers.battleAnimArgs[ARG_RET_ID]).toBe(1);
    task = createUtilityTask(helpers);
    animTaskSetAnimTargetToBattlerTarget(helpers, task);
    expect(helpers.battleAnimTarget).toBe(3);
    task = createUtilityTask(helpers);
    animTaskSetAnimAttackerAndTargetForEffectTgt(helpers, task);
    expect([helpers.battleAnimAttacker, helpers.battleAnimTarget]).toEqual([3, 2]);
    task = createUtilityTask(helpers);
    animTaskSetAnimAttackerAndTargetForEffectAtk(helpers, task);
    expect([helpers.battleAnimAttacker, helpers.battleAnimTarget]).toEqual([1, 2]);

    const invis = createUtilityRuntime({ battleAnimAttacker: 0, battleAnimArgs: [1] });
    task = createUtilityTask(invis);
    animTaskSetAllNonAttackersInvisiblity(invis, task);
    expect(invis.sprites[1].invisible).toBe(true);
    expect(invis.sprites[2].invisible).toBe(true);
  });

  test('scrolling BG mask and attacker invisible wait/restore follow duration and signal semantics', () => {
    const runtime = createUtilityRuntime();
    const taskId = createUtilityTask(runtime);
    startMonScrollingBgMask(runtime, taskId, 0, -0x180, 0, true, 2, 0, 2, 'gfx', 'tilemap', 'pal');
    expect(runtime.tasks[taskId]?.data.slice(0, 7)).toEqual([4, -0x180, 1, 5, 2, 2, 0]);
    updateMonScrollingBgMask(runtime, taskId);
    expect(runtime.battleBg1Y).toBe(-1);
    runtime.tasks[taskId]!.data[15] = 2;
    runtime.tasks[taskId]!.data[12] = 1;
    updateMonScrollingBgMask(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(0);

    const wait = createUtilityRuntime({ animVisualTaskCount: 3, battlerDataInvisible: { 0: 0 } });
    const waitTask = createUtilityTask(wait);
    animTaskSetAttackerInvisibleWaitForSignal(wait, waitTask);
    expect(wait.battlerDataInvisible[0]).toBe(1);
    expect(wait.animVisualTaskCount).toBe(2);
    expect(wait.tasks[waitTask]?.func).toBe('AnimTask_WaitAndRestoreVisibility');
    animTaskWaitAndRestoreVisibility(wait, waitTask);
    expect(wait.tasks[waitTask]?.destroyed).toBe(false);
    wait.battleAnimArgs[7] = 0x1000;
    animTaskWaitAndRestoreVisibility(wait, waitTask);
    expect(wait.battlerDataInvisible[0]).toBe(0);
    expect(wait.tasks[waitTask]?.destroyed).toBe(true);
  });
});
