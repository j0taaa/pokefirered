import { describe, expect, it } from 'vitest';
import {
  BG_PLTT_ID_2,
  CreatePostEvoSparkleSet1,
  CreatePostEvoSparkleSet2,
  CreatePreEvoSparkleSet1,
  CreatePreEvoSparkleSet2,
  CreateSprite,
  CycleEvolutionMonSprite,
  EvoTask_ChooseNextEvoSpriteAnim,
  EvoTask_CreatePostEvoSparklesSet1,
  EvoTask_CreatePostEvoSparklesSet2,
  EvoTask_CreatePostEvoSparklesSet2Trade,
  EvoTask_CreatePreEvoSparkleSet1,
  EvoTask_CreatePreEvoSparklesSet2,
  EvoTask_PostEvoSparklesSet1Init,
  EvoTask_PostEvoSparklesSet1Teardown,
  EvoTask_PostEvoSparklesSet2Init,
  EvoTask_PostEvoSparklesSet2Teardown,
  EvoTask_PostEvoSparklesSet2TradeInit,
  EvoTask_PreEvoSparkleSet1Init,
  EvoTask_PreEvoSparkleSet2Init,
  EvoTask_PreEvoSparkleSet2Teardown,
  EvoTask_PrePostEvoMonSpritesInit,
  EvoTask_ShrinkOrExpandEvoSprites,
  EvoTask_WaitForPre1SparklesToGoUp,
  EvolutionSparkles_ArcDown,
  EvolutionSparkles_CircleInward,
  EvolutionSparkles_SpiralUpward,
  EvolutionSparkles_SprayAndFlash,
  EvolutionSparkles_SprayAndFlash_Trade,
  LoadEvoSparkleSpriteAndPal,
  OBJ_PLTT_ID,
  PLTT_SIZE_4BPP,
  RGB_WHITE,
  SE_M_BUBBLE_BEAM2,
  SE_M_MEGA_KICK,
  SE_M_PETAL_DANCE,
  SE_SHINY,
  ST_OAM_AFFINE_NORMAL,
  SetEvoSparklesMatrices,
  SpriteCallbackDummy_EvoSparkles,
  SpriteCallbackDummy_MonSprites,
  SpriteCB_PostEvoSparkleSet1,
  SpriteCB_PostEvoSparkleSet2,
  SpriteCB_PreEvoSparkleSet1,
  SpriteCB_PreEvoSparkleSet2,
  createEvolutionGraphicsRuntime,
  runEvolutionTask,
  sEvolutionSparkleMatrixScales,
} from '../src/game/decompEvolutionGraphics';

const runTaskFrames = (runtime: ReturnType<typeof createEvolutionGraphicsRuntime>, taskId: number, frames: number) => {
  for (let i = 0; i < frames; i += 1) runEvolutionTask(runtime, taskId);
};

describe('decompEvolutionGraphics', () => {
  it('exports exact C callbacks and task routines with callable task behavior', () => {
    const runtime = createEvolutionGraphicsRuntime();
    const taskId = EvolutionSparkles_SpiralUpward(runtime, 1);
    const spriteId = CreateSprite(runtime, 0, 0, 0);

    SpriteCallbackDummy_EvoSparkles(runtime.sprites[spriteId]);
    SpriteCallbackDummy_MonSprites(runtime.sprites[spriteId]);
    expect(runtime.sprites[spriteId].destroyed).toBe(false);

    EvoTask_PreEvoSparkleSet1Init(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('EvoTask_CreatePreEvoSparkleSet1');
    expect(runtime.operations).toContain(`PlaySE:${SE_M_MEGA_KICK}`);

    EvoTask_CreatePreEvoSparkleSet1(runtime, taskId);
    expect(runtime.sprites.length).toBeGreaterThan(1);
    runtime.tasks[taskId].data[15] = 0;
    EvoTask_WaitForPre1SparklesToGoUp(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);

    const names = [
      EvoTask_PreEvoSparkleSet2Init,
      EvoTask_CreatePreEvoSparklesSet2,
      EvoTask_PreEvoSparkleSet2Teardown,
      EvoTask_PostEvoSparklesSet1Init,
      EvoTask_CreatePostEvoSparklesSet1,
      EvoTask_PostEvoSparklesSet1Teardown,
      EvoTask_PostEvoSparklesSet2Init,
      EvoTask_CreatePostEvoSparklesSet2,
      EvoTask_PostEvoSparklesSet2Teardown,
      EvoTask_PostEvoSparklesSet2TradeInit,
      EvoTask_CreatePostEvoSparklesSet2Trade,
      EvoTask_PrePostEvoMonSpritesInit,
      EvoTask_ChooseNextEvoSpriteAnim,
      EvoTask_ShrinkOrExpandEvoSprites,
    ];
    expect(names.every((fn) => typeof fn === 'function')).toBe(true);
  });

  it('loads sparkle resources and assigns the exact 12 affine sparkle matrices', () => {
    const runtime = createEvolutionGraphicsRuntime();

    LoadEvoSparkleSpriteAndPal(runtime);
    SetEvoSparklesMatrices(runtime);

    expect(runtime.operations).toEqual([
      'LoadCompressedSpriteSheetUsingHeap:sSpriteSheet_EvolutionSparkles',
      'LoadSpritePalettes:sSpritePalette_EvolutionSparkles',
    ]);
    expect(runtime.oamMatrices.get(20)).toEqual([sEvolutionSparkleMatrixScales[0], 0, 0, sEvolutionSparkleMatrixScales[0]]);
    expect(runtime.oamMatrices.get(31)).toEqual([sEvolutionSparkleMatrixScales[11], 0, 0, sEvolutionSparkleMatrixScales[11]]);
  });

  it('runs pre-evolution upward sparkle callbacks with C counter, scale, and destroy behavior', () => {
    const runtime = createEvolutionGraphicsRuntime();
    const spriteId = CreatePreEvoSparkleSet1(runtime, 64);
    const sprite = runtime.sprites[spriteId];

    expect(sprite.x).toBe(120);
    expect(sprite.y).toBe(88);
    expect(sprite.data.slice(5, 8)).toEqual([48, 64, 0]);
    expect(sprite.oam).toMatchObject({ affineMode: ST_OAM_AFFINE_NORMAL, matrixNum: 31 });
    expect(sprite.callback).toBe('SpriteCB_PreEvoSparkleSet1');

    SpriteCB_PreEvoSparkleSet1(sprite);
    expect(sprite.y).toBe(88);
    expect(sprite.x2).toBe(0);
    expect(sprite.y2).toBe(12);
    expect(sprite.subpriority).toBe(1);
    expect(sprite.data.slice(5, 8)).toEqual([48, 68, 1]);
    expect(sprite.oam.matrixNum).toBe(31);

    SpriteCB_PreEvoSparkleSet1(sprite);
    expect(sprite.data.slice(5, 8)).toEqual([47, 72, 2]);
    expect(sprite.oam.matrixNum).toBe(31);

    sprite.y = 8;
    SpriteCB_PreEvoSparkleSet1(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  it('runs downward arc sparkle and post-evolution inward sparkle callbacks 1:1', () => {
    const runtime = createEvolutionGraphicsRuntime();

    const arcId = CreatePreEvoSparkleSet2(runtime, 128);
    const arc = runtime.sprites[arcId];
    SpriteCB_PreEvoSparkleSet2(arc);
    expect(arc.y).toBe(8);
    expect(arc.x2).toBe(-8);
    expect(arc.y2).toBe(0);
    expect(arc.data.slice(5, 8)).toEqual([8, 128, 1]);
    arc.y = 88;
    SpriteCB_PreEvoSparkleSet2(arc);
    expect(arc.destroyed).toBe(true);

    const inwardId = CreatePostEvoSparkleSet1(runtime, 0, 4);
    const inward = runtime.sprites[inwardId];
    SpriteCB_PostEvoSparkleSet1(inward);
    expect(inward.x2).toBe(120);
    expect(inward.y2).toBe(0);
    expect(inward.data.slice(3, 7)).toEqual([4, 0, 116, 4]);
    inward.data[5] = 8;
    SpriteCB_PostEvoSparkleSet1(inward);
    expect(inward.destroyed).toBe(true);
  });

  it('runs spray sparkle callbacks with random-derived drift, flicker, matrix shrink, and teardown', () => {
    const runtime = createEvolutionGraphicsRuntime();
    runtime.randomValues.push(5, 63);

    const spriteId = CreatePostEvoSparkleSet2(runtime, 0);
    const sprite = runtime.sprites[spriteId];
    expect(sprite.data[3]).toBe(-2);
    expect(sprite.data[5]).toBe(111);
    expect(sprite.oam).toMatchObject({ affineMode: ST_OAM_AFFINE_NORMAL, matrixNum: 31 });

    SpriteCB_PostEvoSparkleSet2(sprite);
    expect(sprite.y).toBe(57);
    expect(sprite.x).toBe(120);
    expect(sprite.y2).toBe(0);
    expect(sprite.data[6]).toBe(1);
    expect(sprite.data[7]).toBe(1);
    expect(sprite.subpriority).toBe(20);
    expect(sprite.oam.matrixNum).toBe(31);

    sprite.data[6] = 112;
    sprite.data[7] = 4;
    SpriteCB_PostEvoSparkleSet2(sprite);
    expect(sprite.invisible).toBe(false);
    expect(sprite.subpriority).toBe(1);
    expect(sprite.oam.matrixNum).toBe(21);

    sprite.data[6] = 128;
    SpriteCB_PostEvoSparkleSet2(sprite);
    expect(sprite.destroyed).toBe(true);
  });

  it('creates spiral-upward sparkles on the same frames and waits before destroying the task', () => {
    const runtime = createEvolutionGraphicsRuntime();
    const taskId = EvolutionSparkles_SpiralUpward(runtime, 2);

    runEvolutionTask(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('EvoTask_CreatePreEvoSparkleSet1');
    expect(runtime.operations).toContain(`BeginNormalPaletteFade:${3 << 2}:10:0:16:${RGB_WHITE}`);
    expect(runtime.operations).toContain(`PlaySE:${SE_M_MEGA_KICK}`);

    runEvolutionTask(runtime, taskId);
    expect(runtime.sprites).toHaveLength(4);
    expect(runtime.sprites.map((sprite) => sprite.data[6])).toEqual([0, 64, 128, 192]);

    runTaskFrames(runtime, taskId, 63);
    expect(runtime.tasks[taskId].data[15]).toBe(64);
    expect(runtime.sprites).toHaveLength(32);

    runEvolutionTask(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('EvoTask_WaitForPre1SparklesToGoUp');
    expect(runtime.tasks[taskId].data[15]).toBe(96);

    runtime.tasks[taskId].data[15] = 0;
    runEvolutionTask(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  it('creates arc-down and circle-inward sparkle bursts on the C frame gates', () => {
    const arcRuntime = createEvolutionGraphicsRuntime();
    const arcTaskId = EvolutionSparkles_ArcDown(arcRuntime);
    runEvolutionTask(arcRuntime, arcTaskId);
    expect(arcRuntime.operations).toContain(`PlaySE:${SE_M_BUBBLE_BEAM2}`);
    runTaskFrames(arcRuntime, arcTaskId, 6);
    expect(arcRuntime.sprites).toHaveLength(54);
    runTaskFrames(arcRuntime, arcTaskId, 90);
    runEvolutionTask(arcRuntime, arcTaskId);
    expect(arcRuntime.tasks[arcTaskId].func).toBe('EvoTask_PreEvoSparkleSet2Teardown');
    runEvolutionTask(arcRuntime, arcTaskId);
    expect(arcRuntime.tasks[arcTaskId].destroyed).toBe(true);

    const circleRuntime = createEvolutionGraphicsRuntime();
    const circleTaskId = EvolutionSparkles_CircleInward(circleRuntime);
    runEvolutionTask(circleRuntime, circleTaskId);
    expect(circleRuntime.operations).toContain(`PlaySE:${SE_SHINY}`);
    runEvolutionTask(circleRuntime, circleTaskId);
    expect(circleRuntime.sprites).toHaveLength(16);
    runTaskFrames(circleRuntime, circleTaskId, 31);
    runEvolutionTask(circleRuntime, circleTaskId);
    expect(circleRuntime.sprites).toHaveLength(32);
    runTaskFrames(circleRuntime, circleTaskId, 15);
    runEvolutionTask(circleRuntime, circleTaskId);
    expect(circleRuntime.tasks[circleTaskId].func).toBe('EvoTask_PostEvoSparklesSet1Teardown');
  });

  it('runs spray-and-flash normal and trade palette masks with palette-fade-gated teardown', () => {
    const runtime = createEvolutionGraphicsRuntime();
    for (let i = 0; i < 96; i += 1) runtime.gPlttBufferFaded[BG_PLTT_ID_2 + i] = i + 1;
    runtime.randomValues.push(...Array(130).fill(0));

    const taskId = EvolutionSparkles_SprayAndFlash(runtime, 25);
    runEvolutionTask(runtime, taskId);
    expect(runtime.operations).toContain('IsMovingBackgroundTaskRunning');
    expect(runtime.operations).toContain(`BeginNormalPaletteFade:${0xfff90f1c}:0:0:16:${RGB_WHITE}`);
    expect(runtime.operations).toContain(`PlaySE:${SE_M_PETAL_DANCE}`);
    expect(runtime.gPlttBufferUnfaded.slice(BG_PLTT_ID_2, BG_PLTT_ID_2 + (3 * PLTT_SIZE_4BPP) / 2)).toEqual(
      runtime.gPlttBufferFaded.slice(BG_PLTT_ID_2, BG_PLTT_ID_2 + (3 * PLTT_SIZE_4BPP) / 2),
    );

    runEvolutionTask(runtime, taskId);
    expect(runtime.sprites).toHaveLength(8);
    runTaskFrames(runtime, taskId, 31);
    runEvolutionTask(runtime, taskId);
    expect(runtime.operations).toContain(`BeginNormalPaletteFade:${0xffff0f1c}:16:16:0:${RGB_WHITE}`);
    runtime.tasks[taskId].data[15] = 128;
    runEvolutionTask(runtime, taskId);
    runtime.gPaletteFade.active = true;
    runEvolutionTask(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(false);
    runtime.gPaletteFade.active = false;
    runEvolutionTask(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);

    const tradeRuntime = createEvolutionGraphicsRuntime();
    const tradeTaskId = EvolutionSparkles_SprayAndFlash_Trade(tradeRuntime, 133);
    runEvolutionTask(tradeRuntime, tradeTaskId);
    expect(tradeRuntime.operations).toContain(`BeginNormalPaletteFade:${0xfff90f00}:0:0:16:${RGB_WHITE}`);
    tradeRuntime.randomValues.push(...Array(70).fill(0));
    runTaskFrames(tradeRuntime, tradeTaskId, 33);
    expect(tradeRuntime.operations).toContain(`BeginNormalPaletteFade:${0xffff0f00}:16:16:0:${RGB_WHITE}`);
  });

  it('cycles pre/post evolution mon sprites with exact scale state and kill branches', () => {
    const runtime = createEvolutionGraphicsRuntime();
    const preId = CreateSprite(runtime, 10, 20, 0);
    const postId = CreateSprite(runtime, 30, 40, 0);
    runtime.sprites[preId].oam.paletteNum = 1;
    runtime.sprites[postId].oam.paletteNum = 2;

    const taskId = CycleEvolutionMonSprite(runtime, preId, postId);
    expect(runtime.tasks[taskId].data.slice(1, 5)).toEqual([preId, postId, 0x100, 0x10]);
    expect(runtime.oamMatrices.get(30)).toEqual([0x100, 0, 0, 0x100]);
    expect(runtime.oamMatrices.get(31)).toEqual([0x1000, 0, 0, 0x1000]);
    expect(runtime.sprites[preId].oam).toMatchObject({ affineMode: ST_OAM_AFFINE_NORMAL, matrixNum: 30 });
    expect(runtime.sprites[postId].oam).toMatchObject({ affineMode: ST_OAM_AFFINE_NORMAL, matrixNum: 31 });
    expect(runtime.gPlttBufferFaded.slice(OBJ_PLTT_ID(1), OBJ_PLTT_ID(1) + 16)).toEqual(Array(16).fill(RGB_WHITE));
    expect(runtime.gPlttBufferFaded.slice(OBJ_PLTT_ID(2), OBJ_PLTT_ID(2) + 16)).toEqual(Array(16).fill(RGB_WHITE));

    runEvolutionTask(runtime, taskId);
    expect(runtime.tasks[taskId].data[5]).toBe(0);
    expect(runtime.tasks[taskId].data[6]).toBe(8);
    expect(runtime.tasks[taskId].func).toBe('EvoTask_ChooseNextEvoSpriteAnim');

    runEvolutionTask(runtime, taskId);
    expect(runtime.tasks[taskId].data[5]).toBe(1);
    expect(runtime.tasks[taskId].data[6]).toBe(10);
    expect(runtime.tasks[taskId].func).toBe('EvoTask_ShrinkOrExpandEvoSprites');

    runEvolutionTask(runtime, taskId);
    expect(runtime.tasks[taskId].data[3]).toBe(0xf6);
    expect(runtime.tasks[taskId].data[4]).toBe(0x1a);
    expect(runtime.oamMatrices.get(30)).toEqual([Math.trunc(0x10000 / 0xf6), 0, 0, Math.trunc(0x10000 / 0xf6)]);
    expect(runtime.oamMatrices.get(31)).toEqual([Math.trunc(0x10000 / 0x1a), 0, 0, Math.trunc(0x10000 / 0x1a)]);

    runtime.tasks[taskId].EvoGraphicsTaskEvoStop = true;
    runEvolutionTask(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('PreEvoVisible_PostEvoInvisible_KillTask');
    runEvolutionTask(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.sprites[preId].invisible).toBe(false);
    expect(runtime.sprites[postId].invisible).toBe(true);

    const finishRuntime = createEvolutionGraphicsRuntime();
    const finishPreId = CreateSprite(finishRuntime, 0, 0, 0);
    const finishPostId = CreateSprite(finishRuntime, 0, 0, 0);
    const finishTaskId = CycleEvolutionMonSprite(finishRuntime, finishPreId, finishPostId);
    finishRuntime.tasks[finishTaskId].func = 'EvoTask_ChooseNextEvoSpriteAnim';
    finishRuntime.tasks[finishTaskId].data[6] = 128;
    runEvolutionTask(finishRuntime, finishTaskId);
    expect(finishRuntime.tasks[finishTaskId].destroyed).toBe(true);
    expect(finishRuntime.sprites[finishPreId].invisible).toBe(true);
    expect(finishRuntime.sprites[finishPostId].invisible).toBe(false);
  });
});
