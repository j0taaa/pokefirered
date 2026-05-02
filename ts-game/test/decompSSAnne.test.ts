import { describe, expect, test } from 'vitest';
import {
  CreateSmokeSprite,
  CreateWakeBehindBoat,
  DoSSAnneDepartureCutscene,
  MAX_SPRITES,
  SE_SS_ANNE_HORN,
  SPRITE_TAG_SMOKE,
  SPRITE_TAG_WAKE,
  SmokeSpriteCallback,
  Task_SSAnneFinish,
  Task_SSAnneInit,
  Task_SSAnneRun,
  WakeSpriteCallback,
  createSSAnneRuntimeState,
  createSmokeSprite,
  doSSAnneDepartureCutscene,
  smokeSpriteCallback,
  taskSSAnneFinish,
  taskSSAnneInit,
  taskSSAnneRun,
  wakeSpriteCallback
} from '../src/game/decompSSAnne';

describe('decompSSAnne', () => {
  test('DoSSAnneDepartureCutscene plays horn and creates init task with 50-frame delay', () => {
    const runtime = createSSAnneRuntimeState();
    const taskId = doSSAnneDepartureCutscene(runtime);

    expect(runtime.playedSE).toEqual([SE_SS_ANNE_HORN]);
    expect(runtime.tasks[taskId]).toMatchObject({
      func: 'Task_SSAnneInit',
      priority: 8,
      data: expect.arrayContaining([50])
    });
  });

  test('init task loads wake/smoke sheets, creates wake sprite, and switches to run at zero', () => {
    const runtime = createSSAnneRuntimeState(10, -5);
    const taskId = doSSAnneDepartureCutscene(runtime);
    runtime.tasks[taskId].data[0] = 1;

    taskSSAnneInit(runtime, taskId);

    expect(runtime.loadedSpriteSheets).toEqual([SPRITE_TAG_WAKE, SPRITE_TAG_SMOKE]);
    expect(runtime.tasks[taskId].func).toBe('Task_SSAnneRun');
    expect(runtime.sprites[1]).toMatchObject({
      kind: 'wake',
      x: 85,
      y: 109,
      priority: 2,
      paletteNum: 10
    });
  });

  test('run task increments counters, spawns smoke every 70 frames, moves boat, then switches to finish offscreen', () => {
    const runtime = createSSAnneRuntimeState();
    const taskId = doSSAnneDepartureCutscene(runtime);
    runtime.tasks[taskId].func = 'Task_SSAnneRun';
    runtime.tasks[taskId].data[1] = 69;
    runtime.tasks[taskId].data[2] = 24;

    taskSSAnneRun(runtime, taskId);

    expect(runtime.tasks[taskId].data[1]).toBe(0);
    expect(runtime.sprites[1]).toMatchObject({
      kind: 'smoke',
      x: 49,
      y: 78,
      priority: 8,
      paletteNum: 10
    });
    expect(runtime.sprites[0].x2).toBe(-5);

    runtime.sprites[0].x = -121;
    taskSSAnneRun(runtime, taskId);
    expect(runtime.playedSE).toEqual([SE_SS_ANNE_HORN, SE_SS_ANNE_HORN]);
    expect(runtime.tasks[taskId].func).toBe('Task_SSAnneFinish');
  });

  test('finish and sprite callbacks mirror cleanup and animation movement', () => {
    const runtime = createSSAnneRuntimeState(-121, 0);
    const taskId = doSSAnneDepartureCutscene(runtime);
    runtime.tasks[taskId].func = 'Task_SSAnneFinish';
    runtime.tasks[taskId].data[3] = 39;

    taskSSAnneFinish(runtime, taskId);
    expect(runtime.freedSpriteTileTags).toEqual([SPRITE_TAG_WAKE, SPRITE_TAG_SMOKE]);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.scriptContextEnabled).toBe(true);

    const wakeId = 1;
    runtime.sprites.push({
      id: wakeId,
      kind: 'wake',
      x: 0,
      y: 109,
      x2: 0,
      y2: 0,
      priority: 2,
      paletteNum: 10,
      data: [132, 0, 0, 0, 0, 0, 0, 0],
      animEnded: false,
      destroyed: false
    });
    wakeSpriteCallback(runtime, wakeId);
    expect(runtime.sprites[wakeId].x2).toBe(22);
    expect(runtime.sprites[wakeId].data[0]).toBe(132);
    expect(runtime.sprites[wakeId].destroyed).toBe(true);

    const smokeId = 2;
    runtime.sprites.push({
      id: smokeId,
      kind: 'smoke',
      x: 0,
      y: 78,
      x2: 0,
      y2: 0,
      priority: 8,
      paletteNum: 10,
      data: [3, 0, 0, 0, 0, 0, 0, 0],
      animEnded: true,
      destroyed: false
    });
    smokeSpriteCallback(runtime, smokeId);
    expect(runtime.sprites[smokeId]).toMatchObject({ x2: 1, destroyed: true });
  });

  test('CreateSmokeSprite returns MAX_SPRITES when offscreen or sprite allocation fails', () => {
    const runtime = createSSAnneRuntimeState(-82, 0);
    expect(createSmokeSprite(runtime)).toBe(MAX_SPRITES);

    const allocationRuntime = createSSAnneRuntimeState(0, 0);
    allocationRuntime.nextCreateSpriteResult = MAX_SPRITES;
    expect(createSmokeSprite(allocationRuntime)).toBe(MAX_SPRITES);
    expect(allocationRuntime.sprites).toHaveLength(1);
  });

  test('exact C-name SS Anne helpers preserve cutscene task and sprite behavior', () => {
    const runtime = createSSAnneRuntimeState(12, -2);
    const taskId = DoSSAnneDepartureCutscene(runtime);
    expect(runtime.playedSE).toEqual([SE_SS_ANNE_HORN]);
    expect(runtime.tasks[taskId].data[0]).toBe(50);

    runtime.tasks[taskId].data[0] = 1;
    Task_SSAnneInit(runtime, taskId);
    expect(runtime.loadedSpriteSheets).toEqual([SPRITE_TAG_WAKE, SPRITE_TAG_SMOKE]);
    expect(runtime.tasks[taskId].func).toBe('Task_SSAnneRun');

    const wakeId = CreateWakeBehindBoat(runtime);
    expect(runtime.sprites[wakeId]).toMatchObject({ kind: 'wake', priority: 2, paletteNum: 10 });
    WakeSpriteCallback(runtime, wakeId);
    expect(runtime.sprites[wakeId].x).toBe(runtime.sprites[runtime.boatSpriteId].x + runtime.sprites[runtime.boatSpriteId].x2 + 80);

    runtime.tasks[taskId].data[1] = 69;
    Task_SSAnneRun(runtime, taskId);
    expect(runtime.sprites.at(-1)).toMatchObject({ kind: 'smoke', paletteNum: 10 });

    const smokeId = CreateSmokeSprite(runtime);
    runtime.sprites[smokeId].animEnded = true;
    SmokeSpriteCallback(runtime, smokeId);
    expect(runtime.sprites[smokeId].destroyed).toBe(true);

    runtime.tasks[taskId].func = 'Task_SSAnneFinish';
    runtime.tasks[taskId].data[3] = 39;
    Task_SSAnneFinish(runtime, taskId);
    expect(runtime.freedSpriteTileTags).toEqual([SPRITE_TAG_WAKE, SPRITE_TAG_SMOKE]);
    expect(runtime.scriptContextEnabled).toBe(true);
  });
});
