import { describe, expect, test } from 'vitest';
import {
  CreateNumberSprite,
  CreateStartSprite,
  IsMinigameCountdownRunning,
  IsStartGraphicAnimRunning,
  Load321StartGfx,
  RunMinigameCountdownDigitsAnim,
  SE_BALL_BOUNCE_2,
  SpriteCB_Start,
  StartMinigameCountdown,
  StartStartGraphic,
  Task_MinigameCountdown,
  createMinigameCountdownRuntime,
  createStartSprite,
  isMinigameCountdownRunning,
  runMinigameCountdownDigitsAnim,
  spriteCBStart,
  startMinigameCountdown,
  startStartGraphic,
  taskMinigameCountdown
} from '../src/game/decompMinigameCountdown';

describe('decomp minigame_countdown', () => {
  test('StartMinigameCountdown creates a priority 80 task with arguments in the same data slots', () => {
    const runtime = createMinigameCountdownRuntime();
    startMinigameCountdown(runtime, 11, 22, 33, 44, 5);
    expect(isMinigameCountdownRunning(runtime)).toBe(true);
    expect(runtime.tasks[0]).toMatchObject({ func: 'Task_MinigameCountdown', priority: 80, active: true });
    expect(runtime.tasks[0].data.slice(2, 7)).toEqual([11, 22, 33, 44, 5]);
  });

  test('Task_MinigameCountdown initializes graphics and sprites in state 0', () => {
    const runtime = createMinigameCountdownRuntime();
    startMinigameCountdown(runtime, 1, 2, 100, 80, 3);
    taskMinigameCountdown(runtime, 0);

    expect(runtime.loadedSheets).toEqual([{ tilesTag: 1, size: 0xe00 }]);
    expect(runtime.loadedPalettes).toEqual([2]);
    expect(runtime.sprites).toHaveLength(3);
    expect(runtime.sprites[0]).toMatchObject({ x: 100, y: 80 });
    expect(runtime.sprites[1]).toMatchObject({ x: 68, y: 80, invisible: true });
    expect(runtime.sprites[2]).toMatchObject({ x: 132, y: 80, invisible: true, anim: 1 });
    expect(runtime.tasks[0].data[0]).toBe(1);
    expect(runtime.tasks[0].data.slice(7, 10)).toEqual([0, 1, 2]);
  });

  test('digit animation follows bounce, affine, wait, rise, fall, and frame progression states', () => {
    const runtime = createMinigameCountdownRuntime();
    createStartSprite(runtime, 1, 2, 0, 0, 0, { left: 0, right: 0 });
    const sprite = runtime.sprites[0];

    expect(runMinigameCountdownDigitsAnim(runtime, 0)).toBe(true);
    expect(sprite.data[0]).toBe(1);
    expect(sprite.data[2]).toBe(1);
    expect(runtime.sounds).toEqual([SE_BALL_BOUNCE_2]);

    sprite.data[2] = 19;
    runMinigameCountdownDigitsAnim(runtime, 0);
    expect(sprite.data[0]).toBe(2);
    expect(sprite.affineAnim).toBe(1);

    sprite.affineAnimEnded = true;
    runMinigameCountdownDigitsAnim(runtime, 0);
    expect(sprite.data[0]).toBe(3);

    sprite.data[2] = 3;
    runMinigameCountdownDigitsAnim(runtime, 0);
    expect(sprite.data[0]).toBe(4);
    expect(sprite.affineAnim).toBe(2);

    sprite.data[2] = 7;
    sprite.data[4] = 0;
    const yBefore = sprite.y;
    runMinigameCountdownDigitsAnim(runtime, 0);
    expect(sprite.y).toBe(yBefore - 4);
    expect(sprite.data[0]).toBe(5);
    expect(sprite.anim).toBe(1);

    sprite.data[2] = 7;
    runMinigameCountdownDigitsAnim(runtime, 0);
    expect(sprite.data[0]).toBe(6);
    expect(sprite.affineAnim).toBe(3);

    sprite.affineAnimEnded = true;
    runMinigameCountdownDigitsAnim(runtime, 0);
    expect(sprite.data[4]).toBe(1);
    expect(sprite.data[0]).toBe(1);

    sprite.data[0] = 4;
    sprite.data[2] = 7;
    sprite.data[4] = 2;
    expect(runMinigameCountdownDigitsAnim(runtime, 0)).toBe(false);
    expect(sprite.data[0]).toBe(7);
  });

  test('start graphic setup and callback run through bounce states to dummy callback', () => {
    const runtime = createMinigameCountdownRuntime();
    const ids = { left: 0, right: 0 };
    createStartSprite(runtime, 1, 2, 50, 60, 0, ids);
    startStartGraphic(runtime, 99, ids.left, ids.right);

    const sprite = runtime.sprites[ids.left];
    expect(sprite).toMatchObject({ y2: -40, invisible: false, callback: 'SpriteCB_Start' });

    spriteCBStart(runtime, sprite);
    expect(sprite.data[0]).toBe(1);
    for (let i = 0; i < 20 && sprite.data[0] === 1; i += 1) {
      spriteCBStart(runtime, sprite);
    }
    expect(sprite.y2).toBe(0);
    expect(sprite.data[0]).toBe(2);
    expect(runtime.sounds).toContain(SE_BALL_BOUNCE_2);

    sprite.data[1] = 120;
    spriteCBStart(runtime, sprite);
    expect(sprite.data[0]).toBe(3);

    sprite.data[1] = 120;
    spriteCBStart(runtime, sprite);
    expect(sprite.data[0]).toBe(4);

    sprite.data[1] = 40;
    spriteCBStart(runtime, sprite);
    expect(sprite.callback).toBe('SpriteCallbackDummy');
  });

  test('task state 1 starts START graphic and state 2 frees resources when animation ends', () => {
    const runtime = createMinigameCountdownRuntime();
    startMinigameCountdown(runtime, 7, 8, 10, 20, 0);
    taskMinigameCountdown(runtime, 0);
    runtime.sprites[0].data[0] = 7;

    taskMinigameCountdown(runtime, 0);
    expect(runtime.sprites[0].callback).toBe('destroyed');
    expect(runtime.sprites[1].callback).toBe('SpriteCB_Start');
    expect(runtime.freedOamMatrices).toEqual([0]);
    expect(runtime.tasks[0].data[0]).toBe(2);

    runtime.sprites[1].callback = 'SpriteCallbackDummy';
    taskMinigameCountdown(runtime, 0);
    expect(runtime.sprites[1].callback).toBe('destroyed');
    expect(runtime.sprites[2].callback).toBe('destroyed');
    expect(runtime.freedTileTags).toEqual([7]);
    expect(runtime.freedPaletteTags).toEqual([8]);
    expect(runtime.tasks[0].active).toBe(false);
  });

  test('exact C-name minigame countdown helpers preserve task, sprite, gfx, and callback behavior', () => {
    const runtime = createMinigameCountdownRuntime();
    StartMinigameCountdown(runtime, 11, 22, 33, 44, 5);
    expect(IsMinigameCountdownRunning(runtime)).toBe(true);
    expect(runtime.tasks[0].data.slice(2, 7)).toEqual([11, 22, 33, 44, 5]);

    Load321StartGfx(runtime, 1, 2);
    expect(runtime.loadedSheets.at(-1)).toEqual({ tilesTag: 1, size: 0xe00 });
    expect(runtime.loadedPalettes.at(-1)).toBe(2);

    const numberId = CreateNumberSprite(runtime, 1, 2, 10, 20, 3);
    expect(runtime.sprites[numberId]).toMatchObject({ x: 10, y: 20 });
    const ids = { left: 0, right: 0 };
    CreateStartSprite(runtime, 1, 2, 50, 60, 0, ids);
    expect(runtime.sprites[ids.left]).toMatchObject({ x: 18, y: 60, invisible: true });
    expect(runtime.sprites[ids.right]).toMatchObject({ x: 82, y: 60, invisible: true, anim: 1 });

    expect(RunMinigameCountdownDigitsAnim(runtime, numberId)).toBe(true);
    expect(runtime.sounds).toContain(SE_BALL_BOUNCE_2);

    StartStartGraphic(runtime, numberId, ids.left, ids.right);
    expect(IsStartGraphicAnimRunning(runtime, ids.left)).toBe(true);
    const sprite = runtime.sprites[ids.left];
    SpriteCB_Start(runtime, sprite);
    expect(sprite.data[0]).toBe(1);

    Task_MinigameCountdown(runtime, 0);
    expect(runtime.tasks[0].data[0]).toBe(1);
  });
});
