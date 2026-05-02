import { describe, expect, test } from 'vitest';
import {
  ANIM_TARGET,
  ARG_RET_ID,
  AnimBite,
  AnimBite_Step1,
  AnimBite_Step2,
  AnimClawSlash,
  AnimTask_AttackerFadeFromInvisible,
  AnimTask_AttackerFadeFromInvisible_Step,
  AnimTask_AttackerFadeToInvisible,
  AnimTask_AttackerFadeToInvisible_Step,
  AnimTask_InitAttackerFadeFromInvisible,
  AnimTask_InitMementoShadow,
  AnimTask_MementoHandleBg,
  AnimTask_MetallicShine,
  AnimTask_MetallicShine_Step,
  AnimTask_MoveAttackerMementoShadow,
  AnimTask_MoveAttackerMementoShadow_Step,
  AnimTask_MoveTargetMementoShadow,
  AnimTask_MoveTargetMementoShadow_Step,
  AnimTask_SetGrayscaleOrOriginalPal,
  AnimTearDrop,
  AnimTearDrop_Step,
  AnimUnusedBagSteal,
  AnimUnusedBagSteal_Step,
  B_POSITION_PLAYER_LEFT,
  B_POSITION_PLAYER_RIGHT,
  DISPCNT_OBJWIN_ON,
  DoMementoShadowEffect,
  GetIsDoomDesireHitTurn,
  SetAllBattlersSpritePriority,
  animBite,
  animBiteStep1,
  animBiteStep2,
  animClawSlash,
  animTaskAttackerFadeFromInvisible,
  animTaskAttackerFadeFromInvisibleStep,
  animTaskAttackerFadeToInvisible,
  animTaskAttackerFadeToInvisibleStep,
  animTaskInitAttackerFadeFromInvisible,
  animTaskInitMementoShadow,
  animTaskMementoHandleBg,
  animTaskMetallicShine,
  animTaskMetallicShineStep,
  animTaskMoveAttackerMementoShadow,
  animTaskMoveAttackerMementoShadowStep,
  animTaskMoveTargetMementoShadow,
  animTaskMoveTargetMementoShadowStep,
  animTaskSetGrayscaleOrOriginalPal,
  animTearDrop,
  animTearDropStep,
  animUnusedBagSteal,
  animUnusedBagStealStep,
  createDarkRuntime,
  createDarkSprite,
  createDarkTask,
  doMementoShadowEffect,
  gClampJawSpriteTemplate,
  gClawSlashSpriteTemplate,
  gSharpTeethSpriteTemplate,
  gTearDropSpriteTemplate,
  getIsDoomDesireHitTurn,
  sUnusedBagStealSpriteTemplate,
  setAllBattlersSpritePriority
} from '../src/game/decompBattleAnimDark';

describe('decomp battle_anim_dark.c parity', () => {
  test('exports exact C callback and task names as aliases of the implemented logic', () => {
    expect(AnimTask_AttackerFadeToInvisible).toBe(animTaskAttackerFadeToInvisible);
    expect(AnimTask_AttackerFadeToInvisible_Step).toBe(animTaskAttackerFadeToInvisibleStep);
    expect(AnimTask_AttackerFadeFromInvisible).toBe(animTaskAttackerFadeFromInvisible);
    expect(AnimTask_AttackerFadeFromInvisible_Step).toBe(animTaskAttackerFadeFromInvisibleStep);
    expect(AnimTask_InitAttackerFadeFromInvisible).toBe(animTaskInitAttackerFadeFromInvisible);
    expect(AnimUnusedBagSteal).toBe(animUnusedBagSteal);
    expect(AnimUnusedBagSteal_Step).toBe(animUnusedBagStealStep);
    expect(AnimBite).toBe(animBite);
    expect(AnimBite_Step1).toBe(animBiteStep1);
    expect(AnimBite_Step2).toBe(animBiteStep2);
    expect(AnimTearDrop).toBe(animTearDrop);
    expect(AnimTearDrop_Step).toBe(animTearDropStep);
    expect(AnimTask_MoveAttackerMementoShadow).toBe(animTaskMoveAttackerMementoShadow);
    expect(AnimTask_MoveAttackerMementoShadow_Step).toBe(animTaskMoveAttackerMementoShadowStep);
    expect(AnimTask_MoveTargetMementoShadow).toBe(animTaskMoveTargetMementoShadow);
    expect(AnimTask_MoveTargetMementoShadow_Step).toBe(animTaskMoveTargetMementoShadowStep);
    expect(DoMementoShadowEffect).toBe(doMementoShadowEffect);
    expect(SetAllBattlersSpritePriority).toBe(setAllBattlersSpritePriority);
    expect(AnimTask_InitMementoShadow).toBe(animTaskInitMementoShadow);
    expect(AnimTask_MementoHandleBg).toBe(animTaskMementoHandleBg);
    expect(AnimClawSlash).toBe(animClawSlash);
    expect(AnimTask_MetallicShine).toBe(animTaskMetallicShine);
    expect(AnimTask_MetallicShine_Step).toBe(animTaskMetallicShineStep);
    expect(AnimTask_SetGrayscaleOrOriginalPal).toBe(animTaskSetGrayscaleOrOriginalPal);
    expect(GetIsDoomDesireHitTurn).toBe(getIsDoomDesireHitTurn);
  });

  test('sprite templates preserve dark animation tags, affine tables, and callback identities', () => {
    expect(sUnusedBagStealSpriteTemplate).toMatchObject({ tileTag: 'ANIM_TAG_TIED_BAG', callback: 'AnimUnusedBagSteal' });
    expect(gSharpTeethSpriteTemplate.affineAnims).toHaveLength(8);
    expect(gSharpTeethSpriteTemplate.callback).toBe('AnimBite');
    expect(gClampJawSpriteTemplate.tileTag).toBe('ANIM_TAG_CLAMP');
    expect(gTearDropSpriteTemplate.affineAnims).toHaveLength(2);
    expect(gClawSlashSpriteTemplate.anims).toHaveLength(2);
  });

  test('attacker fade tasks initialize blend registers, count delay frames, hide sprite, and restore blend state', () => {
    const runtime = createDarkRuntime({ battleAnimArgs: [0], battleAnimAttacker: 0 });
    const taskId = createDarkTask(runtime);
    animTaskAttackerFadeToInvisible(runtime, taskId);
    expect(runtime.gpuRegs.REG_OFFSET_BLDALPHA).toBe(0x0010);
    expect(runtime.tasks[taskId]?.func).toBe('AnimTask_AttackerFadeToInvisible_Step');

    for (let i = 0; i < 16; i++) animTaskAttackerFadeToInvisibleStep(runtime, taskId);
    expect(runtime.sprites[0].invisible).toBe(true);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);

    const from = createDarkRuntime({ battleAnimArgs: [0] });
    const fromTask = createDarkTask(from);
    animTaskAttackerFadeFromInvisible(from, fromTask);
    expect(from.gpuRegs.REG_OFFSET_BLDALPHA).toBe(0x1000);
    for (let i = 0; i < 16; i++) animTaskAttackerFadeFromInvisibleStep(from, fromTask);
    expect(from.gpuRegs.REG_OFFSET_BLDCNT).toBe(0);
    expect(from.gpuRegs.REG_OFFSET_BLDALPHA).toBe(0);
    expect(from.tasks[fromTask]?.destroyed).toBe(true);

    const init = createDarkRuntime();
    const initTask = createDarkTask(init);
    animTaskInitAttackerFadeFromInvisible(init, initTask);
    expect(init.gpuRegs.REG_OFFSET_BLDALPHA).toBe(0x1000);
    expect(init.tasks[initTask]?.destroyed).toBe(true);
  });

  test('unused bag steal, bite, tear drop, and claw slash keep callback/data transitions', () => {
    const bagRuntime = createDarkRuntime();
    const bag = createDarkSprite();
    animUnusedBagSteal(bagRuntime, bag);
    expect(bag.callback).toBe('AnimUnusedBagSteal_Step');
    expect(bag.data[6]).toBe(-40);
    const oldTimer = bag.data[0];
    animUnusedBagStealStep(bag);
    expect(bag.data[0]).toBeLessThan(oldTimer);

    const biteRuntime = createDarkRuntime({ battleAnimArgs: [5, -3, 2, 0x180, -0x100, 2] });
    const bite = createDarkSprite();
    animBite(biteRuntime, bite);
    expect(bite.x).toBe(5);
    expect(bite.y).toBe(-3);
    expect(bite.affineAnimIndex).toBe(2);
    animBiteStep1(bite);
    expect(bite.x2).toBe(1);
    expect(bite.y2).toBe(-1);
    animBiteStep1(bite);
    expect(bite.callback).toBe('AnimBite_Step2');
    animBiteStep2(bite);
    animBiteStep2(bite);
    expect(bite.destroyed).toBe(true);
    expect(bite.callback).toBe('DestroySpriteAndMatrix');

    const tearRuntime = createDarkRuntime({ battleAnimArgs: [ANIM_TARGET, 2] });
    const tear = createDarkSprite();
    animTearDrop(tearRuntime, tear);
    expect(tear.x).toBe(132);
    expect(tear.y).toBe(56);
    expect(tear.affineAnimIndex).toBe(1);
    expect(tear.data.slice(0, 6)).toEqual([32, 0, 112, 0, 68, -12]);
    tear.data[0] = 1;
    animTearDropStep(tear);
    expect(tear.destroyed).toBe(true);

    const clawRuntime = createDarkRuntime({ battleAnimArgs: [4, 6, 1] });
    const claw = createDarkSprite();
    animClawSlash(clawRuntime, claw);
    expect(claw.x).toBe(4);
    expect(claw.y).toBe(6);
    expect(claw.animIndex).toBe(1);
    expect(claw.callback).toBe('RunStoredCallbackWhenAnimEnds');
  });

  test('memento attacker shadow initializes scanline/window state and advances through blend, shadow, close, scanline stop, destroy', () => {
    const runtime = createDarkRuntime();
    const taskId = createDarkTask(runtime);
    animTaskMoveAttackerMementoShadow(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.func).toBe('AnimTask_MoveAttackerMementoShadow_Step');
    expect(task.data[14]).toBe(0);
    expect(task.data[15]).toBe(64);
    expect(runtime.battleWin0H).toBe(64);
    expect(runtime.scanlineEffectRegBuffers[0][0]).toBe(runtime.battleBg1Y);
    expect(runtime.sprites[0].oam.priority).toBe(3);

    for (let i = 0; i < 48 && task.data[0] === 0; i++) animTaskMoveAttackerMementoShadowStep(runtime, taskId);
    expect(task.data[0]).toBe(1);
    animTaskMoveAttackerMementoShadowStep(runtime, taskId);
    expect(runtime.scanlineEffectRegBuffers[0].some((value) => value !== 0)).toBe(true);
    task.data[0] = 2;
    task.data[14] = 28;
    task.data[15] = 32;
    animTaskMoveAttackerMementoShadowStep(runtime, taskId);
    expect(task.data[0]).toBe(3);
    animTaskMoveAttackerMementoShadowStep(runtime, taskId);
    expect(runtime.scanlineEffect.state).toBe(3);
    animTaskMoveAttackerMementoShadowStep(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
  });

  test('target memento handles contest early exit, setup states, step expansion/fadeout, and final window cleanup', () => {
    const contest = createDarkRuntime({ contest: true });
    const contestTask = createDarkTask(contest, 'AnimTask_MoveTargetMementoShadow');
    animTaskMoveTargetMementoShadow(contest, contestTask);
    expect(contest.tasks[contestTask]?.destroyed).toBe(true);

    const runtime = createDarkRuntime({ battleAnimTarget: 1 });
    const taskId = createDarkTask(runtime, 'AnimTask_MoveTargetMementoShadow');
    for (let i = 0; i < 5; i++) animTaskMoveTargetMementoShadow(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.func).toBe('AnimTask_MoveTargetMementoShadow_Step');
    expect(runtime.battleWin0V).toBe(160);
    expect(runtime.gpuRegs.REG_OFFSET_BLDALPHA).toBe(0x080c);

    task.data[5] = task.data[7] - 8;
    animTaskMoveTargetMementoShadowStep(runtime, taskId);
    expect(task.data[0]).toBe(1);
    task.data[14] = 128;
    task.data[15] = 192;
    task.data[4] = task.data[6] - 8;
    animTaskMoveTargetMementoShadowStep(runtime, taskId);
    expect(task.data[0]).toBe(2);
    task.data[11] = 1;
    task.data[12] = 16;
    for (let i = 0; i < 4 && task.data[0] === 2; i++) animTaskMoveTargetMementoShadowStep(runtime, taskId);
    expect(task.data[0]).toBe(3);
    animTaskMoveTargetMementoShadowStep(runtime, taskId);
    animTaskMoveTargetMementoShadowStep(runtime, taskId);
    expect(runtime.battleWin0H).toBe(0);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
  });

  test('memento helpers, metallic shine, grayscale selector, and doom desire task preserve side effects', () => {
    const shadow = createDarkRuntime();
    const shadowTask = createDarkTask(shadow);
    animTaskInitMementoShadow(shadow, shadowTask);
    expect(shadow.operations).toContain('MoveBattlerSpriteToBG:0:0');
    expect(shadow.operations).toContain('MoveBattlerSpriteToBG:2:1');

    const reset = createDarkRuntime();
    const resetTask = createDarkTask(reset);
    animTaskMementoHandleBg(reset, resetTask);
    expect(reset.operations).toContain('ResetBattleAnimBg:0');
    expect(reset.operations).toContain('ResetBattleAnimBg:1');

    const effect = createDarkRuntime();
    const effectTask = { data: Array.from({ length: 16 }, () => 0), func: 'DestroyAnimVisualTask' as const, destroyed: false };
    effectTask.data[4] = 10;
    effectTask.data[5] = 10;
    effectTask.data[10] = 3;
    doMementoShadowEffect(effect, effectTask);
    expect(effect.scanlineEffectRegBuffers[0][0]).toBe(162);

    const metallic = createDarkRuntime({
      doubleBattle: true,
      battleAnimAttacker: 0,
      battleAnimArgs: [0, 0, 0],
      battlerPositions: { 0: B_POSITION_PLAYER_LEFT, 1: 1, 2: B_POSITION_PLAYER_RIGHT, 3: 3 }
    });
    metallic.sprites[0].x = 44;
    metallic.sprites[0].y = 70;
    const metallicTask = createDarkTask(metallic);
    animTaskMetallicShine(metallic, metallicTask);
    expect(metallic.gpuRegs.REG_OFFSET_DISPCNT & DISPCNT_OBJWIN_ON).toBe(DISPCNT_OBJWIN_ON);
    expect(metallic.operations.some((op) => op.startsWith('CreateInvisibleSpriteCopy:0:0:1'))).toBe(true);
    expect(metallic.operations).toContain('SetGreyscaleOrOriginalPalette:16:0');
    expect(metallic.sprites[2].oam.priority).toBe(-1);
    const task = metallic.tasks[metallicTask]!;
    task.data[10] = 124;
    task.data[11] = 1;
    animTaskMetallicShineStep(metallic, metallicTask);
    expect(metallic.operations).toContain('SetGreyscaleOrOriginalPalette:16:1');
    expect(metallic.sprites[task.data[0]].destroyed).toBe(true);
    expect(metallic.sprites[2].oam.priority).toBe(0);
    task.data[10] = 124;
    task.data[11] = 2;
    animTaskMetallicShineStep(metallic, metallicTask);
    expect(metallic.gpuRegs.REG_OFFSET_BLDCNT).toBe(0);
    expect(metallic.tasks[metallicTask]?.destroyed).toBe(true);

    const gray = createDarkRuntime({ battleAnimArgs: [5, 1] });
    gray.battlerAtPosition[B_POSITION_PLAYER_RIGHT] = 2;
    gray.sprites[2].oam.paletteNum = 7;
    const grayTask = createDarkTask(gray);
    animTaskSetGrayscaleOrOriginalPal(gray, grayTask);
    expect(gray.operations).toContain('SetGreyscaleOrOriginalPalette:23:1');
    expect(gray.tasks[grayTask]?.destroyed).toBe(true);

    const doom = createDarkRuntime({ animMoveTurn: 1 });
    const doomTask = createDarkTask(doom);
    getIsDoomDesireHitTurn(doom, doomTask);
    expect(doom.battleAnimArgs[ARG_RET_ID]).toBe(0);
    const doomHit = createDarkRuntime({ animMoveTurn: 2 });
    const doomHitTask = createDarkTask(doomHit);
    getIsDoomDesireHitTurn(doomHit, doomHitTask);
    expect(doomHit.battleAnimArgs[ARG_RET_ID]).toBe(1);

    setAllBattlersSpritePriority(gray, 2);
    expect(gray.sprites[0].oam.priority).toBe(2);
  });
});
