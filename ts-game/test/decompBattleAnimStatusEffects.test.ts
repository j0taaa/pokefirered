import { describe, expect, test } from 'vitest';
import {
  ANIM_TAG_CIRCLE_IMPACT,
  ANIM_TAG_ICE_CUBE,
  AnimFlashingCircleImpact,
  AnimFlashingCircleImpact_Step,
  AnimTask_FrozenIceCube,
  AnimTask_FrozenIceCube_Step1,
  AnimTask_FrozenIceCube_Step2,
  AnimTask_FrozenIceCube_Step3,
  AnimTask_FrozenIceCube_Step4,
  AnimTask_StatsChange,
  BLDCNT_EFFECT_BLEND,
  BLDCNT_TGT2_ALL,
  LaunchStatusAnimation,
  RGB_BLUE,
  RGB_RED,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDCNT,
  STAT_ANIM_MINUS2,
  STAT_ANIM_MULTIPLE_MINUS1,
  STAT_ANIM_MULTIPLE_PLUS2,
  STAT_ANIM_PLUS2,
  STAT_ACC,
  STAT_ATK,
  STAT_SPATK,
  Task_DoStatusAnimation,
  Task_FlashingCircleImpacts,
  Task_UpdateFlashingCircleImpacts,
  animFlashingCircleImpact,
  animFlashingCircleImpactStep,
  animTaskFrozenIceCube,
  animTaskFrozenIceCubeStep1,
  animTaskFrozenIceCubeStep2,
  animTaskFrozenIceCubeStep3,
  animTaskFrozenIceCubeStep4,
  animTaskStatsChange,
  bldAlphaBlend,
  createStatusRuntime,
  createStatusSprite,
  gSpinningSparkleSpriteTemplate,
  gWeatherBallNormalDownSpriteTemplate,
  gWeatherBallUpSpriteTemplate,
  launchStatusAnimation,
  objPlttId,
  sFlashingCircleImpactSpriteTemplate,
  sFlickeringImpactSpriteTemplate,
  sFlickeringOrbFlippedSpriteTemplate,
  sFlickeringOrbSpriteTemplate,
  sFlickeringShrinkOrbSpriteTemplate,
  sFrozenIceCubeSpriteTemplate,
  sFrozenIceCubeSubspriteTable,
  sTextTaskOver,
  taskDoStatusAnimation,
  taskFlashingCircleImpacts,
  taskUpdateFlashingCircleImpacts
} from '../src/game/decompBattleAnimStatusEffects';

describe('decomp battle_anim_status_effects', () => {
  test('sprite templates preserve status-effect tags, OAM records, tables, and callbacks', () => {
    expect(sFlickeringOrbSpriteTemplate).toMatchObject({
      tileTag: 'ANIM_TAG_ORB',
      oam: 'gOamData_AffineOff_ObjNormal_16x16',
      callback: 'AnimTranslateLinearAndFlicker'
    });
    expect(sFlickeringOrbFlippedSpriteTemplate.callback).toBe('AnimTranslateLinearAndFlicker_Flipped');
    expect(gWeatherBallUpSpriteTemplate.callback).toBe('AnimWeatherBallUp');
    expect(gWeatherBallNormalDownSpriteTemplate.callback).toBe('AnimWeatherBallDown');
    expect(gSpinningSparkleSpriteTemplate.anims).toEqual([
      ['ANIMCMD_FRAME(0, 3)', 'ANIMCMD_FRAME(16, 3)', 'ANIMCMD_FRAME(32, 3)', 'ANIMCMD_FRAME(48, 3)', 'ANIMCMD_FRAME(64, 3)', 'ANIMCMD_END']
    ]);
    expect(sFlickeringImpactSpriteTemplate.anims).toHaveLength(3);
    expect(sFlickeringShrinkOrbSpriteTemplate.affineAnims).toEqual([
      ['AFFINEANIMCMD_FRAME(96, 96, 0, 0)', 'AFFINEANIMCMD_FRAME(2, 2, 0, 1)', 'AFFINEANIMCMD_JUMP(1)']
    ]);
    expect(sTextTaskOver).toContain('TASK OVER');
    expect(sFrozenIceCubeSpriteTemplate.oam).toBe('gOamData_AffineOff_ObjBlend_64x64');
    expect(sFrozenIceCubeSubspriteTable[0].subsprites[3]).toMatchObject({ x: 48, y: 48, tileOffset: 128, priority: 2 });
    expect(sFlashingCircleImpactSpriteTemplate.tileTag).toBe(ANIM_TAG_CIRCLE_IMPACT);
  });

  test('Task_FlashingCircleImpacts creates ten delayed red downward impacts and marks the last resource owner', () => {
    const runtime = createStatusRuntime();
    runtime.sprites[0].x = 41;
    runtime.sprites[0].y = 77;

    const taskId = taskFlashingCircleImpacts(runtime, 0, true);
    const created = runtime.sprites.slice(2);

    expect(runtime.loadedSheets).toEqual([ANIM_TAG_CIRCLE_IMPACT]);
    expect(runtime.loadedPalettes).toEqual([ANIM_TAG_CIRCLE_IMPACT]);
    expect(runtime.tasks[taskId].data[0]).toBe(0);
    expect(runtime.tasks[taskId].data[1]).toBe(RGB_RED);
    expect(created).toHaveLength(10);
    expect(created[0]).toMatchObject({ x: 41, y: 109, invisible: true });
    expect(created.map((sprite) => sprite.data[0])).toEqual([0, 51, 102, 153, 204, 255, 306, 357, 408, 459]);
    expect(created.map((sprite) => sprite.data[1])).toEqual(Array.from({ length: 10 }, () => -256));
    expect(created.slice(0, 5).every((sprite) => sprite.data[6] === 0)).toBe(true);
    expect(created.slice(5).every((sprite) => sprite.data[6] === 21)).toBe(true);
    expect(created[9].data[7]).toBe(1);
  });

  test('Task_FlashingCircleImpacts blue path spawns above the battler and blend task pulses twice before destruction', () => {
    const runtime = createStatusRuntime();
    runtime.sprites[1].x = 150;
    runtime.sprites[1].y = 62;

    const taskId = taskFlashingCircleImpacts(runtime, 1, false);
    expect(runtime.tasks[taskId].data[1]).toBe(RGB_BLUE);
    expect(runtime.sprites.slice(2).map((sprite) => sprite.y)).toEqual(Array.from({ length: 10 }, () => 30));
    expect(runtime.sprites.slice(2).map((sprite) => sprite.data[1])).toEqual(Array.from({ length: 10 }, () => 256));

    for (let i = 0; i < 130 && !runtime.tasks[taskId].destroyed; i += 1) {
      taskUpdateFlashingCircleImpacts(runtime, taskId);
    }

    expect(runtime.blendPaletteCalls[0]).toEqual({ start: objPlttId(1), count: 16, coeff: 0, color: RGB_BLUE });
    expect(runtime.blendPaletteCalls.some((call) => call.coeff === 8)).toBe(true);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('AnimFlashingCircleImpact waits out data6, then applies circular offsets and destroys with resources on frame 52', () => {
    const sprite = createStatusSprite();
    sprite.invisible = true;
    sprite.data[6] = 1;
    sprite.data[1] = -256;
    sprite.data[7] = 1;

    animFlashingCircleImpact(sprite);
    expect(sprite.invisible).toBe(true);
    expect(sprite.data[6]).toBe(0);

    animFlashingCircleImpact(sprite);
    expect(sprite.invisible).toBe(false);
    expect(sprite.callback).toBe('AnimFlashingCircleImpact_Step');
    expect(sprite.x2).toBe(32);
    expect(sprite.y2).toBe(-1);
    expect(sprite.subpriority).toBe(29);

    for (let i = sprite.data[2]; i < 52; i += 1) {
      animFlashingCircleImpactStep(sprite);
    }

    expect(sprite.destroyed).toBe(true);
    expect(sprite.resourcesFreed).toBe(true);
  });

  test('AnimTask_FrozenIceCube creates the blend sprite, fades in, rotates palette triples, fades out, then clears GPU blend regs', () => {
    const runtime = createStatusRuntime();
    const taskId = runtime.tasks.push({ id: 0, data: Array.from({ length: 16 }, () => 0), func: 'AnimTask_FrozenIceCube_Step1', priority: 10, destroyed: false }) - 1;
    runtime.battleAnimTarget = 1;
    runtime.spritePaletteIndexesByTag[ANIM_TAG_ICE_CUBE] = 2;
    runtime.plttBufferFaded[objPlttId(2) + 13] = 101;
    runtime.plttBufferFaded[objPlttId(2) + 14] = 102;
    runtime.plttBufferFaded[objPlttId(2) + 15] = 103;

    animTaskFrozenIceCube(runtime, taskId);
    const spriteId = runtime.tasks[taskId].data[15];
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(bldAlphaBlend(0, 16));
    expect(runtime.sprites[spriteId]).toMatchObject({ x: 128, y: 20, subpriority: 4, callback: 'SpriteCallbackDummy' });
    expect(runtime.sprites[spriteId].subspriteTable).toBe(sFrozenIceCubeSubspriteTable);

    for (let i = 0; i < 10; i += 1) {
      animTaskFrozenIceCubeStep1(runtime, taskId);
    }
    expect(runtime.tasks[taskId].func).toBe('AnimTask_FrozenIceCube_Step2');
    expect(runtime.tasks[taskId].data[1]).toBe(0);

    for (let i = 0; i < 17; i += 1) {
      animTaskFrozenIceCubeStep2(runtime, taskId);
    }
    expect(runtime.plttBufferFaded.slice(objPlttId(2) + 13, objPlttId(2) + 16)).toEqual([102, 103, 101]);

    for (let i = 17; i < 46; i += 1) {
      animTaskFrozenIceCubeStep2(runtime, taskId);
    }
    expect(runtime.tasks[taskId].func).toBe('AnimTask_FrozenIceCube_Step3');
    expect(runtime.tasks[taskId].data[1]).toBe(9);

    for (let i = 0; i < 10; i += 1) {
      animTaskFrozenIceCubeStep3(runtime, taskId);
    }
    expect(runtime.tasks[taskId].func).toBe('AnimTask_FrozenIceCube_Step4');

    for (let i = 0; i < 39; i += 1) {
      animTaskFrozenIceCubeStep4(runtime, taskId);
    }
    expect(runtime.sprites[spriteId].oamMatrixFreed).toBe(true);
    expect(runtime.sprites[spriteId].destroyed).toBe(true);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(0);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('AnimTask_FrozenIceCube hides sprite when the ice cube tile tag is not loaded and applies contest x offset', () => {
    const runtime = createStatusRuntime();
    const taskId = runtime.tasks.push({ id: 0, data: Array.from({ length: 16 }, () => 0), func: 'AnimTask_FrozenIceCube_Step1', priority: 10, destroyed: false }) - 1;
    runtime.contest = true;
    runtime.spriteTileStartsByTag[ANIM_TAG_ICE_CUBE] = 0xffff;

    animTaskFrozenIceCube(runtime, taskId);
    const sprite = runtime.sprites[runtime.tasks[taskId].data[15]];

    expect(sprite.x).toBe(122);
    expect(sprite.invisible).toBe(true);
  });

  test('AnimTask_StatsChange mirrors CASE macro mapping and calls InitStatsChangeAnimation', () => {
    const runtime = createStatusRuntime();
    const taskId = runtime.tasks.push({ id: 0, data: Array.from({ length: 16 }, () => 0), func: 'AnimTask_FrozenIceCube_Step1', priority: 10, destroyed: false }) - 1;
    runtime.battleSpritesData.animationData.animArg = STAT_ANIM_PLUS2 + STAT_SPATK - 1;

    animTaskStatsChange(runtime, taskId);

    expect(runtime.battleAnimArgs.slice(0, 5)).toEqual([0, 5, 0, 0, 1]);
    expect(runtime.tasks[taskId].func).toBe('InitStatsChangeAnimation');

    runtime.battleSpritesData.animationData.animArg = STAT_ANIM_MINUS2 + STAT_ACC - 1;
    animTaskStatsChange(runtime, taskId);
    expect(runtime.battleAnimArgs.slice(0, 5)).toEqual([1, 2, 0, 0, 1]);

    runtime.battleSpritesData.animationData.animArg = STAT_ANIM_MULTIPLE_PLUS2;
    animTaskStatsChange(runtime, taskId);
    expect(runtime.battleAnimArgs.slice(0, 5)).toEqual([0, 0xff, 0, 0, 1]);

    runtime.battleSpritesData.animationData.animArg = STAT_ANIM_MULTIPLE_MINUS1;
    animTaskStatsChange(runtime, taskId);
    expect(runtime.battleAnimArgs.slice(0, 5)).toEqual([1, 0xff, 0, 0, 0]);
  });

  test('AnimTask_StatsChange destroys invalid animation args before mutating the task into InitStatsChangeAnimation', () => {
    const runtime = createStatusRuntime();
    const taskId = runtime.tasks.push({ id: 0, data: Array.from({ length: 16 }, () => 0), func: 'AnimTask_FrozenIceCube_Step1', priority: 10, destroyed: false }) - 1;
    runtime.battleSpritesData.animationData.animArg = STAT_ANIM_PLUS2 + STAT_ATK + 99;

    animTaskStatsChange(runtime, taskId);

    expect(runtime.tasks[taskId].func).toBe('DestroyAnimVisualTask');
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('LaunchStatusAnimation points attacker and target at the same battler and Task_DoStatusAnimation clears the healthbox when script ends', () => {
    const runtime = createStatusRuntime();

    const taskId = launchStatusAnimation(runtime, 1, 6);

    expect(runtime.battleAnimAttacker).toBe(1);
    expect(runtime.battleAnimTarget).toBe(1);
    expect(runtime.launchedAnimations).toEqual([{ table: 'gBattleAnims_StatusConditions', statusAnimId: 6, arg: 0 }]);
    expect(runtime.tasks[taskId].data[0]).toBe(1);

    taskDoStatusAnimation(runtime, taskId);
    expect(runtime.animScriptCallbackCalls).toBe(1);
    expect(runtime.tasks[taskId].destroyed).toBe(false);

    runtime.animScriptActive = false;
    taskDoStatusAnimation(runtime, taskId);
    expect(runtime.animScriptCallbackCalls).toBe(2);
    expect(runtime.battleSpritesData.healthBoxesData[1].statusAnimActive).toBe(false);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('exact C-name exports invoke the same status animation logic', () => {
    const runtime = createStatusRuntime();
    const taskId = Task_FlashingCircleImpacts(runtime, 0, true);
    Task_UpdateFlashingCircleImpacts(runtime, taskId);
    expect(runtime.tasks[taskId].data[2]).toBe(1);

    const sprite = runtime.sprites[2];
    AnimFlashingCircleImpact(sprite);
    expect(sprite.callback).toBe('AnimFlashingCircleImpact_Step');
    AnimFlashingCircleImpact_Step(sprite);
    expect(sprite.data[2]).toBe(2);

    const iceTaskId = runtime.tasks.push({ id: 1, data: Array.from({ length: 16 }, () => 0), func: 'AnimTask_FrozenIceCube_Step1', priority: 10, destroyed: false }) - 1;
    AnimTask_FrozenIceCube(runtime, iceTaskId);
    AnimTask_FrozenIceCube_Step1(runtime, iceTaskId);
    expect(runtime.tasks[iceTaskId].data[1]).toBe(1);
    runtime.tasks[iceTaskId].data[1] = 14;
    runtime.tasks[iceTaskId].data[2] = 2;
    AnimTask_FrozenIceCube_Step2(runtime, iceTaskId);
    expect(runtime.tasks[iceTaskId].data[3]).toBe(1);
    runtime.tasks[iceTaskId].data[1] = 0;
    AnimTask_FrozenIceCube_Step3(runtime, iceTaskId);
    expect(runtime.tasks[iceTaskId].func).toBe('AnimTask_FrozenIceCube_Step4');
    runtime.tasks[iceTaskId].data[1] = 38;
    AnimTask_FrozenIceCube_Step4(runtime, iceTaskId);
    expect(runtime.tasks[iceTaskId].destroyed).toBe(true);

    runtime.battleSpritesData.animationData.animArg = STAT_ANIM_PLUS2 + STAT_SPATK - 1;
    AnimTask_StatsChange(runtime, taskId);
    expect(runtime.battleAnimArgs.slice(0, 5)).toEqual([0, 5, 0, 0, 1]);

    const statusTaskId = LaunchStatusAnimation(runtime, 1, 3);
    runtime.animScriptActive = false;
    Task_DoStatusAnimation(runtime, statusTaskId);
    expect(runtime.tasks[statusTaskId].destroyed).toBe(true);
  });
});
