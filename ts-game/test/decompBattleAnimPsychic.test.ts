import { describe, expect, test } from 'vitest';
import {
  ANIM_ATTACKER,
  AnimBentSpoon,
  AnimDefensiveWall,
  AnimDefensiveWall_Step2,
  AnimDefensiveWall_Step3,
  AnimDefensiveWall_Step4,
  AnimDefensiveWall_Step5,
  AnimPsychoBoost,
  AnimQuestionMark,
  AnimQuestionMark_Step1,
  AnimQuestionMark_Step2,
  AnimRedX,
  AnimRedX_Step,
  AnimSkillSwapOrb,
  AnimTask_ExtrasensoryDistortion,
  AnimTask_ExtrasensoryDistortion_Step,
  AnimTask_ImprisonOrbs,
  AnimTask_ImprisonOrbs_Step,
  AnimTask_MeditateStretchAttacker,
  AnimTask_MeditateStretchAttacker_Step,
  AnimTask_SkillSwap,
  AnimTask_SkillSwap_Step,
  AnimTask_Teleport,
  AnimTask_Teleport_Step,
  AnimTask_TransparentCloneGrowAndShrink,
  AnimTask_TransparentCloneGrowAndShrink_Step,
  AnimWallSparkle,
  B_SIDE_OPPONENT,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDCNT,
  SE_M_TELEPORT,
  animBentSpoon,
  animDefensiveWall,
  animDefensiveWallStep2,
  animDefensiveWallStep3,
  animDefensiveWallStep4,
  animDefensiveWallStep5,
  animPsychoBoost,
  animQuestionMark,
  animQuestionMarkStep1,
  animQuestionMarkStep2,
  animRedX,
  animRedXStep,
  animSkillSwapOrb,
  animTaskExtrasensoryDistortion,
  animTaskExtrasensoryDistortionStep,
  animTaskImprisonOrbs,
  animTaskImprisonOrbsStep,
  animTaskMeditateStretchAttacker,
  animTaskMeditateStretchAttackerStep,
  animTaskSkillSwap,
  animTaskSkillSwapStep,
  animTaskTeleport,
  animTaskTeleportStep,
  animTaskTransparentCloneGrowAndShrink,
  animTaskTransparentCloneGrowAndShrinkStep,
  animWallSparkle,
  createPsychicRuntime,
  createPsychicSprite,
  createPsychicTask,
  gBarrierWallSpriteTemplate,
  gBentSpoonSpriteTemplate,
  gGoldRingSpriteTemplate,
  gLightScreenWallSpriteTemplate,
  gLusterPurgeCircleSpriteTemplate,
  gMagicCoatWallSpriteTemplate,
  gMirrorCoatWallSpriteTemplate,
  gPsychoBoostOrbSpriteTemplate,
  gPsychUpSpiralSpriteTemplate,
  gQuestionMarkSpriteTemplate,
  gRedXSpriteTemplate,
  gReflectSparkleSpriteTemplate,
  gReflectWallSpriteTemplate,
  gSpecialScreenSparkleSpriteTemplate,
  sImprisonOrbSpriteTemplate,
  sSkillSwapOrbSpriteTemplate
} from '../src/game/decompBattleAnimPsychic';

describe('decomp battle_anim_psychic.c parity', () => {
  test('exports exact C callback and task names as aliases of the implemented logic', () => {
    expect(AnimDefensiveWall).toBe(animDefensiveWall);
    expect(AnimDefensiveWall_Step2).toBe(animDefensiveWallStep2);
    expect(AnimDefensiveWall_Step3).toBe(animDefensiveWallStep3);
    expect(AnimDefensiveWall_Step4).toBe(animDefensiveWallStep4);
    expect(AnimDefensiveWall_Step5).toBe(animDefensiveWallStep5);
    expect(AnimWallSparkle).toBe(animWallSparkle);
    expect(AnimBentSpoon).toBe(animBentSpoon);
    expect(AnimQuestionMark).toBe(animQuestionMark);
    expect(AnimQuestionMark_Step1).toBe(animQuestionMarkStep1);
    expect(AnimQuestionMark_Step2).toBe(animQuestionMarkStep2);
    expect(AnimTask_MeditateStretchAttacker).toBe(animTaskMeditateStretchAttacker);
    expect(AnimTask_MeditateStretchAttacker_Step).toBe(animTaskMeditateStretchAttackerStep);
    expect(AnimTask_Teleport).toBe(animTaskTeleport);
    expect(AnimTask_Teleport_Step).toBe(animTaskTeleportStep);
    expect(AnimTask_ImprisonOrbs).toBe(animTaskImprisonOrbs);
    expect(AnimTask_ImprisonOrbs_Step).toBe(animTaskImprisonOrbsStep);
    expect(AnimRedX_Step).toBe(animRedXStep);
    expect(AnimRedX).toBe(animRedX);
    expect(AnimTask_SkillSwap).toBe(animTaskSkillSwap);
    expect(AnimTask_SkillSwap_Step).toBe(animTaskSkillSwapStep);
    expect(AnimSkillSwapOrb).toBe(animSkillSwapOrb);
    expect(AnimTask_ExtrasensoryDistortion).toBe(animTaskExtrasensoryDistortion);
    expect(AnimTask_ExtrasensoryDistortion_Step).toBe(animTaskExtrasensoryDistortionStep);
    expect(AnimTask_TransparentCloneGrowAndShrink).toBe(animTaskTransparentCloneGrowAndShrink);
    expect(AnimTask_TransparentCloneGrowAndShrink_Step).toBe(animTaskTransparentCloneGrowAndShrinkStep);
    expect(AnimPsychoBoost).toBe(animPsychoBoost);
  });

  test('sprite templates preserve psychic tags, tables, and callback identities', () => {
    expect(gPsychUpSpiralSpriteTemplate.callback).toBe('AnimSpriteOnMonPos');
    expect(gLightScreenWallSpriteTemplate.tileTag).toBe('ANIM_TAG_GREEN_LIGHT_WALL');
    expect(gReflectWallSpriteTemplate.callback).toBe('AnimDefensiveWall');
    expect(gMirrorCoatWallSpriteTemplate.tileTag).toBe('ANIM_TAG_RED_LIGHT_WALL');
    expect(gBarrierWallSpriteTemplate.tileTag).toBe('ANIM_TAG_GRAY_LIGHT_WALL');
    expect(gMagicCoatWallSpriteTemplate.tileTag).toBe('ANIM_TAG_ORANGE_LIGHT_WALL');
    expect(gReflectSparkleSpriteTemplate.anims).toHaveLength(1);
    expect(gSpecialScreenSparkleSpriteTemplate.callback).toBe('AnimWallSparkle');
    expect(gGoldRingSpriteTemplate.callback).toBe('TranslateAnimSpriteToTargetMonLocation');
    expect(gBentSpoonSpriteTemplate.anims).toHaveLength(2);
    expect(gQuestionMarkSpriteTemplate.tileTag).toBe('ANIM_TAG_AMNESIA');
    expect(sImprisonOrbSpriteTemplate.callback).toBe('SpriteCallbackDummy');
    expect(gRedXSpriteTemplate.callback).toBe('AnimRedX');
    expect(sSkillSwapOrbSpriteTemplate.callback).toBe('AnimSkillSwapOrb');
    expect(gLusterPurgeCircleSpriteTemplate.tileTag).toBe('ANIM_TAG_WHITE_CIRCLE_OF_LIGHT');
    expect(gPsychoBoostOrbSpriteTemplate.callback).toBe('AnimPsychoBoost');
  });

  test('defensive wall positions by battle mode, blends in, rotates palette entries, fades out, and resets BGs', () => {
    const runtime = createPsychicRuntime({ battleAnimArgs: [6, -4, 'wallPal' as unknown as number], paletteTagIndexes: { wallPal: 3 } });
    const sprite = createPsychicSprite();
    animDefensiveWall(runtime, sprite);
    expect(sprite.x).toBe(54);
    expect(sprite.y).toBe(68);
    expect(sprite.oam.priority).toBe(2);
    expect(sprite.subpriority).toBe(200);
    expect(sprite.data[0]).toBe(48);
    expect(sprite.data[3]).toBe(1);
    expect(sprite.callback).toBe('AnimDefensiveWall_Step2');
    expect(runtime.operations).toContain('MoveBattlerSpriteToBG:1:0');
    expect(runtime.operations).toContain('MoveBattlerSpriteToBG:3:1');

    for (let i = 0; i < 13; i++) animDefensiveWallStep2(runtime, sprite);
    expect(sprite.callback).toBe('AnimDefensiveWall_Step3');
    const color = runtime.fadedPalettes[56];
    animDefensiveWallStep3(runtime, sprite);
    expect(sprite.callback).toBe('AnimDefensiveWall_Step3');
    animDefensiveWallStep3(runtime, sprite);
    expect(runtime.fadedPalettes[49]).toBe(color);
    sprite.data[2] = 15;
    sprite.data[1] = 1;
    animDefensiveWallStep3(runtime, sprite);
    expect(sprite.callback).toBe('AnimDefensiveWall_Step4');

    sprite.data[3] = 0;
    animDefensiveWallStep4(runtime, sprite);
    expect(sprite.invisible).toBe(true);
    expect(sprite.callback).toBe('AnimDefensiveWall_Step5');
    animDefensiveWallStep5(runtime, sprite);
    expect(runtime.operations).toContain('ResetBattleAnimBg:0');
    expect(runtime.operations).toContain('ResetBattleAnimBg:1');
    expect(sprite.callback).toBe('DestroyAnimSprite');

    const doubleRuntime = createPsychicRuntime({ doubleBattle: true, battleAnimAttacker: 1, battlerSides: { 0: 0, 1: B_SIDE_OPPONENT, 2: 0, 3: B_SIDE_OPPONENT } });
    const doubleSprite = createPsychicSprite();
    animDefensiveWall(doubleRuntime, doubleSprite);
    expect(doubleSprite.x).toBe(176);
    expect(doubleSprite.y).toBe(40);
  });

  test('wall sparkle, bent spoon, question mark, and red X callbacks keep C positioning and destroy transitions', () => {
    const sparkleRuntime = createPsychicRuntime({ battleAnimArgs: [5, -3, 1, 0], doubleBattle: true });
    const sparkle = createPsychicSprite();
    animWallSparkle(sparkleRuntime, sparkle);
    expect(sparkle.x).toBe(67);
    expect(sparkle.y).toBe(77);
    sparkle.animEnded = true;
    animWallSparkle(sparkleRuntime, sparkle);
    expect(sparkle.destroyed).toBe(true);

    const spoonRuntime = createPsychicRuntime({ battleAnimAttacker: 1, battlerSides: { 0: 0, 1: B_SIDE_OPPONENT } });
    const spoon = createPsychicSprite();
    animBentSpoon(spoonRuntime, spoon);
    expect(spoon.x).toBe(136);
    expect(spoon.y).toBe(58);
    expect(spoon.animIndex).toBe(1);
    expect(spoon.data[1]).toBe(-1);
    expect(spoon.callback).toBe('RunStoredCallbackWhenAnimEnds');
    expect(spoon.storedCallback).toBe('DestroyAnimSprite');

    const questionRuntime = createPsychicRuntime();
    const question = createPsychicSprite();
    animQuestionMark(questionRuntime, question);
    expect(question.x).toBe(68);
    expect(question.y).toBe(40);
    expect(question.storedCallback).toBe('AnimQuestionMark_Step1');
    animQuestionMarkStep1(question);
    expect(question.oam.affineMode).toBe(1);
    question.affineAnimEnded = true;
    animQuestionMarkStep2(question);
    expect(question.data[0]).toBe(1);
    question.data[1] = 0;
    animQuestionMarkStep2(question);
    expect(question.destroyed).toBe(true);

    const redRuntime = createPsychicRuntime({ battleAnimArgs: [0, 3] });
    const red = createPsychicSprite();
    animRedX(redRuntime, red);
    expect(red.x).toBe(48);
    expect(red.y).toBe(64);
    animRedXStep(red);
    animRedXStep(red);
    expect(red.invisible).toBe(true);
    animRedXStep(red);
    animRedXStep(red);
    expect(red.destroyed).toBe(true);
  });

  test('meditate and teleport tasks preserve affine timers, side-specific ascent count, invisibility, and cleanup', () => {
    const meditate = createPsychicRuntime();
    const meditateTask = createPsychicTask(meditate);
    animTaskMeditateStretchAttacker(meditate, meditateTask);
    expect(meditate.tasks[meditateTask]?.data[0]).toBe(0);
    for (let i = 0; i < 41; i++) animTaskMeditateStretchAttackerStep(meditate, meditateTask);
    expect(meditate.tasks[meditateTask]?.destroyed).toBe(true);

    const teleport = createPsychicRuntime({ battleAnimAttacker: 1, battlerSides: { 0: 0, 1: B_SIDE_OPPONENT } });
    const teleportTask = createPsychicTask(teleport);
    animTaskTeleport(teleport, teleportTask);
    expect(teleport.tasks[teleportTask]?.data[3]).toBe(4);
    for (let i = 0; i < 20; i++) animTaskTeleportStep(teleport, teleportTask);
    expect(teleport.tasks[teleportTask]?.data[1]).toBe(1);
    for (let i = 0; i < 5; i++) animTaskTeleportStep(teleport, teleportTask);
    expect(teleport.sprites[1].y2).toBe(-32);
    expect(teleport.sprites[1].invisible).toBe(true);
    expect(teleport.sprites[1].x).toBe(272);
    expect(teleport.tasks[teleportTask]?.destroyed).toBe(true);
  });

  test('imprison orbs create five orbs, apply quadrant offsets, blend out, destroy sprites, and clear registers', () => {
    const runtime = createPsychicRuntime();
    const taskId = createPsychicTask(runtime);
    animTaskImprisonOrbs(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.data[12]).toBe(16);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).not.toBe(0);

    for (let i = 0; i < 45; i++) animTaskImprisonOrbsStep(runtime, taskId);
    expect(task.data[0]).toBe(1);
    const firstOrb = task.data[8];
    expect(runtime.sprites[firstOrb].x2).toBe(16);
    expect(runtime.sprites[firstOrb].y2).toBe(-16);
    const secondOrb = task.data[9];
    expect(runtime.sprites[secondOrb].x2).toBe(-16);
    expect(runtime.sprites[secondOrb].y2).toBe(16);

    for (let i = 0; i < 32; i++) animTaskImprisonOrbsStep(runtime, taskId);
    expect(runtime.sprites[firstOrb].destroyed).toBe(true);
    animTaskImprisonOrbsStep(runtime, taskId);
    animTaskImprisonOrbsStep(runtime, taskId);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(0);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
  });

  test('skill swap task chooses exact endpoints, creates twelve affine orbs, and orb callback destroys at arc end', () => {
    const runtime = createPsychicRuntime({ battleAnimArgs: [1] });
    const taskId = createPsychicTask(runtime);
    animTaskSkillSwap(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.data.slice(10, 15)).toEqual([-10, 162, 28, 36, 48]);
    animTaskSkillSwapStep(runtime, taskId);
    const firstOrb = runtime.sprites.findIndex((sprite) => sprite.callback === 'AnimSkillSwapOrb');
    expect(firstOrb).toBeGreaterThanOrEqual(4);
    expect(runtime.sprites[firstOrb].data[0]).toBe(16);
    expect(runtime.sprites[firstOrb].data[2]).toBe(36);
    expect(runtime.sprites[firstOrb].data[4]).toBe(48);
    expect(runtime.sprites[firstOrb].data[5]).toBe(-10);
    expect(runtime.sprites[firstOrb].affineAnimIndex).toBe(0);

    for (let i = 0; i < 11; i++) {
      for (let delay = 0; delay < 7; delay++) animTaskSkillSwapStep(runtime, taskId);
    }
    expect(task.data[0]).toBe(1);
    for (let i = 0; i < 18; i++) animTaskSkillSwapStep(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);

    const orb = runtime.sprites[firstOrb];
    for (let i = 0; i < 16; i++) animSkillSwapOrb(orb);
    expect(orb.destroyed).toBe(true);
  });

  test('extrasensory distortion initializes scanline buffers, applies sine offsets, stops DMA, and destroys', () => {
    const runtime = createPsychicRuntime({ battleAnimArgs: [2], battleBg2X: 7, battlerBgPriorityRanks: { 1: 0 } });
    const taskId = createPsychicTask(runtime);
    animTaskExtrasensoryDistortion(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    expect(task.data[11]).toBe(4);
    expect(task.data[12]).toBe(4);
    expect(task.data[13]).toBe(0);
    expect(task.data[14]).toBe(16);
    expect(task.data[15]).toBe(80);
    expect(runtime.scanlineEffectRegBuffers[0][16]).toBe(7);
    expect(runtime.scanlineEffect.params).toMatchObject({ dmaDest: 'REG_BG2HOFS', initState: 1 });

    animTaskExtrasensoryDistortionStep(runtime, taskId);
    expect(runtime.scanlineEffectRegBuffers[0][32]).not.toBe(7);
    for (let i = 0; i < 23; i++) animTaskExtrasensoryDistortionStep(runtime, taskId);
    expect(task.data[0]).toBe(1);
    animTaskExtrasensoryDistortionStep(runtime, taskId);
    expect(runtime.scanlineEffect.state).toBe(3);
    animTaskExtrasensoryDistortionStep(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
  });

  test('transparent clone handles allocation failures and exact grow-shrink-destroy-free sequence', () => {
    const failMatrix = createPsychicRuntime({ allocMatrixFails: true });
    const failMatrixTask = createPsychicTask(failMatrix);
    animTaskTransparentCloneGrowAndShrink(failMatrix, failMatrixTask);
    expect(failMatrix.tasks[failMatrixTask]?.destroyed).toBe(true);

    const failClone = createPsychicRuntime({ cloneFails: true });
    const failCloneTask = createPsychicTask(failClone);
    animTaskTransparentCloneGrowAndShrink(failClone, failCloneTask);
    expect(failClone.tasks[failCloneTask]?.destroyed).toBe(true);

    const runtime = createPsychicRuntime({ battleAnimArgs: [ANIM_ATTACKER] });
    runtime.sprites[0].x = 12;
    runtime.sprites[0].y = 34;
    const taskId = createPsychicTask(runtime);
    animTaskTransparentCloneGrowAndShrink(runtime, taskId);
    const task = runtime.tasks[taskId]!;
    const cloneId = task.data[15];
    expect(task.data[13]).toBe(0);
    expect(task.data[14]).toBe(1);
    expect(runtime.sprites[cloneId].oam.affineMode).toBe(2);
    expect(runtime.sprites[cloneId].affineAnimPaused).toBe(true);
    expect(runtime.sprites[cloneId].rotScale).toEqual({ xScale: 256, yScale: 256, rotation: 0 });
    for (let i = 0; i < 12; i++) animTaskTransparentCloneGrowAndShrinkStep(runtime, taskId);
    expect(task.data[0]).toBe(1);
    for (let i = 0; i < 12; i++) animTaskTransparentCloneGrowAndShrinkStep(runtime, taskId);
    expect(task.data[0]).toBe(2);
    animTaskTransparentCloneGrowAndShrinkStep(runtime, taskId);
    expect(runtime.sprites[cloneId].destroyed).toBe(true);
    animTaskTransparentCloneGrowAndShrinkStep(runtime, taskId);
    expect(runtime.tasks[taskId]?.destroyed).toBe(true);
  });

  test('psycho boost blends in, waits for affine end, plays teleport SE, rises with fixed-point carry, fades out, and clears blend regs', () => {
    const runtime = createPsychicRuntime();
    const sprite = createPsychicSprite();
    animPsychoBoost(runtime, sprite);
    expect(sprite.x).toBe(48);
    expect(sprite.y).toBe(72);
    expect(sprite.data[1]).toBe(8);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(0x0808);
    sprite.affineAnimEnded = true;
    animPsychoBoost(runtime, sprite);
    expect(runtime.sounds).toEqual([{ song: SE_M_TELEPORT, pan: -64 }]);
    expect(sprite.affineAnimIndex).toBe(1);
    for (let i = 0; i < 24; i++) animPsychoBoost(runtime, sprite);
    expect(sprite.invisible).toBe(true);
    expect(sprite.y2).toBeLessThan(0);
    animPsychoBoost(runtime, sprite);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(0);
    expect(sprite.destroyed).toBe(true);
  });
});
