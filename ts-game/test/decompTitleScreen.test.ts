import { describe, expect, test } from 'vitest';
import { A_BUTTON, B_BUTTON, DPAD_UP } from '../src/game/decompMenu';
import {
  CB2_FadeOutTransitionToBerryFix,
  CB2_FadeOutTransitionToSaveClearScreen,
  CreateLeafSprite,
  CB2_InitTitleScreen,
  CreateFlameSprite,
  CreateSlashSprite,
  CreateStreakSprites,
  DeactivateSlashSprite,
  DISPLAY_WIDTH,
  IsSlashSpriteDeactivated,
  KEYSTROKE_BERRY_FIX,
  KEYSTROKE_DELSAVE,
  MAX_SPRITES,
  MUS_TITLE,
  SELECT_BUTTON,
  START_BUTTON,
  SetTitleScreenScene_Cry,
  SetTitleScreenScene_FadeIn,
  SetTitleScreenScene_FlashSprite,
  SetTitleScreenScene_Restart,
  SetTitleScreenScene_Run,
  SpriteCallback_Streak,
  SpriteCallback_Slash,
  SpriteCallback_TitleScreenFlame,
  SpriteCallback_TitleScreenLeaf,
  TASK_NONE,
  TITLESCREENSCENE_CRY,
  TITLESCREENSCENE_FADEIN,
  TITLESCREENSCENE_FLASHSPRITE,
  TITLESCREENSCENE_RESTART,
  TITLESCREENSCENE_RUN,
  TITLE_SPECIES,
  Task_FlameSpawner,
  Task_LeafSpawner,
  Task_TitleScreenMain,
  Task_TitleScreenTimer,
  Task_TitleScreen_BlinkPressStart,
  Task_TitleScreen_SlideWin0,
  TitleScreen_rand,
  TitleScreen_srand,
  UpdateScanlineEffectRegBuffer,
  VBlankCB,
  createTitleScreenRuntime,
  sBgTemplates,
  sFlameXPositions,
  sSceneFuncs,
  sStreakYPositions,
  sSpriteAnimFlameFrames,
  sSpritePals,
  sSpriteSheets,
  tickTitleScreenSprite,
  tickTitleScreenTask,
  type TitleScreenRuntime,
  type TitleScreenTaskFunc
} from '../src/game/decompTitleScreen';

describe('decomp title screen', () => {
  test('parses FireRed title-screen static data from title_screen.c', () => {
    expect(sBgTemplates).toEqual([
      { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 1, priority: 0, baseTile: 0 },
      { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
      { bg: 2, charBaseIndex: 2, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
      { bg: 3, charBaseIndex: 3, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 }
    ]);
    expect(sSceneFuncs).toEqual([
      'SetTitleScreenScene_Init',
      'SetTitleScreenScene_FlashSprite',
      'SetTitleScreenScene_FadeIn',
      'SetTitleScreenScene_Run',
      'SetTitleScreenScene_Restart',
      'SetTitleScreenScene_Cry'
    ]);
    expect(sSpriteSheets.map(({ size, tileTag }) => ({ size, tileTag }))).toEqual([
      { size: 0x500, tileTag: 'TILE_TAG_FLAME_OR_LEAF' },
      { size: 0x500, tileTag: 'TILE_TAG_BLANK_OR_STREAK' },
      { size: 0x400, tileTag: 'TILE_TAG_BLANK' },
      { size: 0x800, tileTag: 'TILE_TAG_SLASH' }
    ]);
    expect(sSpritePals.map(({ tag }) => tag)).toEqual(['PAL_TAG_DEFAULT', 'PAL_TAG_SLASH']);
    expect(sFlameXPositions).toEqual([4, 16, 26, 32, 48, 200, 216, 224, 232, 60, 76, 92, 108, 128, 144, 0]);
    expect(sSpriteAnimFlameFrames).toHaveLength(10);
    expect(sSpriteAnimFlameFrames[0]).toEqual({ frame: 0, duration: 3 });
    expect(sSpriteAnimFlameFrames.at(-1)).toEqual({ frame: 36, duration: 6 });
  });

  test('initializes the title screen in the same callback phases', () => {
    const runtime = createTitleScreenRuntime();
    CB2_InitTitleScreen(runtime);
    expect(runtime.gMainState).toBe(1);
    expect(runtime.sTitleScreenTimerTaskId).toBe(TASK_NONE);
    expect(runtime.vblankCallback).toBeNull();
    expect(runtime.operations).toContain(`InitBgsFromTemplates:0:sBgTemplates:${sBgTemplates.length}`);

    CB2_InitTitleScreen(runtime);
    expect(runtime.gMainState).toBe(2);
    expect(runtime.operations).toContain('LoadCompressedSpriteSheet:TILE_TAG_FLAME_OR_LEAF:1280');
    expect(runtime.operations).toContain('LoadSpritePalettes:PAL_TAG_DEFAULT,PAL_TAG_SLASH');

    CB2_InitTitleScreen(runtime);
    expect(runtime.gMainState).toBe(2);
    expect(runtime.tasks.map((task) => task.func)).toEqual(['Task_TitleScreenMain', 'Task_TitleScreenTimer']);
    expect(runtime.sTitleScreenTimerTaskId).toBe(1);
    expect(runtime.vblankCallback).toBe('VBlankCB');
    expect(runtime.mainCallback2).toBe('CB2_TitleScreenRun');
    expect(runtime.operations).toContain(`m4aSongNumStart:${MUS_TITLE}`);
  });

  test('updates the timer task from vblank and destroys it at 2700 frames', () => {
    const runtime = createTitleScreenRuntime();
    const taskId = pushTask(runtime, 'Task_TitleScreenTimer');
    runtime.sTitleScreenTimerTaskId = taskId;

    VBlankCB(runtime);
    expect(runtime.tasks[taskId].data[0]).toBe(1);

    runtime.tasks[taskId].data[0] = 2700;
    Task_TitleScreenTimer(runtime, taskId);
    expect(runtime.sTitleScreenTimerTaskId).toBe(TASK_NONE);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('runs init, flash, fade, and input skip scene branches like the C task', () => {
    const runtime = createTitleScreenRuntime();
    const taskId = pushTask(runtime, 'Task_TitleScreenMain');

    Task_TitleScreenMain(runtime, taskId);
    expect(runtime.tasks[taskId].data[0]).toBe(TITLESCREENSCENE_FLASHSPRITE);
    expect(runtime.operations).toContain('ScanlineEffect_SetParams:REG_ADDR_BLDY');

    SetTitleScreenScene_FlashSprite(runtime, runtime.tasks[taskId].data);
    expect(runtime.tasks[taskId].data[1]).toBe(1);
    expect(runtime.tasks[taskId].data[2]).toBe(128);
    for (let i = 0; i < 33; i += 1) SetTitleScreenScene_FlashSprite(runtime, runtime.tasks[taskId].data);
    expect(runtime.scanlineEffect.state).toBe(3);
    SetTitleScreenScene_FlashSprite(runtime, runtime.tasks[taskId].data);
    expect(runtime.tasks[taskId].data[0]).toBe(TITLESCREENSCENE_FADEIN);

    runtime.tasks[taskId].data[0] = TITLESCREENSCENE_FADEIN;
    runtime.tasks[taskId].data[1] = 1;
    runtime.tasks[taskId].data[2] = 0;
    for (let i = 0; i < 11; i += 1) SetTitleScreenScene_FadeIn(runtime, runtime.tasks[taskId].data);
    expect(runtime.paletteFadeActive).toBe(true);
    expect(runtime.operations).toContain('TintPalette_GrayScale2:BG_PLTT_ID(13)');

    const skip = createTitleScreenRuntime();
    const skipTaskId = pushTask(skip, 'Task_TitleScreenMain');
    skip.scanlineEffect.state = 1;
    skip.newKeys = A_BUTTON;
    Task_TitleScreenMain(skip, skipTaskId);
    expect(skip.tasks[skipTaskId].data[0]).toBe(TITLESCREENSCENE_RUN);
    expect(skip.scanlineEffect.state).toBe(3);
    expect(skip.sprites[0].template).toBe('sSpriteTemplate_BlankSprite');
  });

  test('handles run-scene input branches, restart, and cry transitions', () => {
    const runtime = createTitleScreenRuntime();
    const mainTaskId = pushTask(runtime, 'Task_TitleScreenMain');
    const timerTaskId = pushTask(runtime, 'Task_TitleScreenTimer');
    runtime.sTitleScreenTimerTaskId = timerTaskId;
    const data = runtime.tasks[mainTaskId].data;
    data[0] = TITLESCREENSCENE_RUN;

    SetTitleScreenScene_Run(runtime, data);
    expect(runtime.helpSystemEnabled).toBe(true);
    expect(runtime.tasks.some((task) => task.func === 'Task_TitleScreen_BlinkPressStart' && !task.destroyed)).toBe(true);
    expect(runtime.tasks.some((task) => task.func === 'Task_FlameSpawner' && !task.destroyed)).toBe(true);
    expect(runtime.sprites[data[6]].template).toBe('sSlashSpriteTemplate');

    const saveClear = createRunRuntime(KEYSTROKE_DELSAVE, 0);
    SetTitleScreenScene_Run(saveClear, saveClear.tasks[0].data);
    expect(saveClear.mainCallback2).toBe('CB2_FadeOutTransitionToSaveClearScreen');
    expect(saveClear.tasks[0].destroyed).toBe(true);

    const berryFix = createRunRuntime(KEYSTROKE_BERRY_FIX, 0);
    SetTitleScreenScene_Run(berryFix, berryFix.tasks[0].data);
    expect(berryFix.mainCallback2).toBe('CB2_FadeOutTransitionToBerryFix');

    const cry = createRunRuntime(0, START_BUTTON);
    SetTitleScreenScene_Run(cry, cry.tasks[0].data);
    expect(cry.tasks[0].data[0]).toBe(TITLESCREENSCENE_CRY);

    const restart = createRunRuntime(0, 0);
    restart.tasks[1].destroyed = true;
    SetTitleScreenScene_Run(restart, restart.tasks[0].data);
    expect(restart.tasks[0].data[0]).toBe(TITLESCREENSCENE_RESTART);
  });

  test('mirrors restart and cry scene waits around the slash sprite state', () => {
    const restart = createRunRuntime(0, 0);
    const restartData = restart.tasks[0].data;
    restartData[0] = TITLESCREENSCENE_RESTART;
    restartData[1] = 0;
    SetTitleScreenScene_Restart(restart, restartData);
    expect(restart.sprites[restartData[6]].data[2]).toBe(1);
    expect(restartData[1]).toBe(1);
    SetTitleScreenScene_Restart(restart, restartData);
    expect(restartData[1]).toBe(1);
    restart.sprites[restartData[6]].data[0] = 2;
    SetTitleScreenScene_Restart(restart, restartData);
    expect(restart.operations).toContain('FadeOutMapMusic:10');
    expect(restartData[1]).toBe(2);

    const cry = createRunRuntime(0, 0);
    const cryData = cry.tasks[0].data;
    cryData[0] = TITLESCREENSCENE_CRY;
    cryData[1] = 0;
    SetTitleScreenScene_Cry(cry, cryData);
    expect(cry.operations).toContain(`PlayCry_Normal:${TITLE_SPECIES}:0`);
    expect(cryData[1]).toBe(1);
    cryData[2] = 90;
    SetTitleScreenScene_Cry(cry, cryData);
    expect(cryData[1]).toBe(1);
    cry.sprites[cryData[6]].data[0] = 2;
    SetTitleScreenScene_Cry(cry, cryData);
    expect(cry.paletteFadeActive).toBe(true);
    expect(cry.operations).toContain('FadeOutBGM:4');
    cry.paletteFadeActive = false;
    SetTitleScreenScene_Cry(cry, cryData);
    expect(cry.mainCallback2).toBe('CB2_InitMainMenu');
  });

  test('slides the title window and blinks press-start palettes with matching counters', () => {
    const runtime = createTitleScreenRuntime();
    const slideTaskId = pushTask(runtime, 'Task_TitleScreen_SlideWin0');

    Task_TitleScreen_SlideWin0(runtime, slideTaskId);
    expect(runtime.tasks[slideTaskId].data[0]).toBe(1);
    for (let i = 0; i < 10; i += 1) Task_TitleScreen_SlideWin0(runtime, slideTaskId);
    expect(runtime.tasks[slideTaskId].data[2]).toBe(DISPLAY_WIDTH);
    expect(runtime.tasks[slideTaskId].data[0]).toBe(2);
    for (let i = 0; i < 10; i += 1) Task_TitleScreen_SlideWin0(runtime, slideTaskId);
    expect(runtime.tasks[slideTaskId].data[0]).toBe(3);
    Task_TitleScreen_SlideWin0(runtime, slideTaskId);
    expect(runtime.tasks[slideTaskId].data[0]).toBe(4);

    const blinkTaskId = pushTask(runtime, 'Task_TitleScreen_BlinkPressStart');
    for (let i = 0; i < 60; i += 1) Task_TitleScreen_BlinkPressStart(runtime, blinkTaskId);
    expect(runtime.tasks[blinkTaskId].data[1]).toBe(1);
    expect(runtime.operations).toContain('BlinkPressStart:hide');
    for (let i = 0; i < 30; i += 1) Task_TitleScreen_BlinkPressStart(runtime, blinkTaskId);
    expect(runtime.tasks[blinkTaskId].data[1]).toBe(0);
    expect(runtime.operations).toContain('BlinkPressStart:show');
    runtime.paletteFadeActive = true;
    runtime.tasks[blinkTaskId].data[15] = 1;
    Task_TitleScreen_BlinkPressStart(runtime, blinkTaskId);
    expect(runtime.tasks[blinkTaskId].data[14]).toBe(1);
    runtime.paletteFadeActive = false;
    Task_TitleScreen_BlinkPressStart(runtime, blinkTaskId);
    expect(runtime.tasks[blinkTaskId].destroyed).toBe(true);
  });

  test('updates scanline buffers, RNG, flames, and slash sprites with C-equivalent state', () => {
    const runtime = createTitleScreenRuntime();
    UpdateScanlineEffectRegBuffer(runtime, 20);
    expect(runtime.scanlineEffectRegBuffers[0][20]).toBe(15);
    expect(runtime.scanlineEffectRegBuffers[0][19]).toBe(14);
    expect(runtime.scanlineEffectRegBuffers[0][36]).toBe(0);

    const rngTaskId = pushTask(runtime, 'Task_FlameSpawner');
    TitleScreen_srand(runtime, rngTaskId, 3, 30840);
    expect(TitleScreen_rand(runtime, rngTaskId, 3)).toBe(51640);
    expect(TitleScreen_rand(runtime, rngTaskId, 3)).toBe(24088);

    const flameTaskId = pushTask(runtime, 'Task_FlameSpawner');
    Task_FlameSpawner(runtime, flameTaskId);
    expect(runtime.tasks[flameTaskId].data[0]).toBe(1);
    Task_FlameSpawner(runtime, flameTaskId);
    expect(runtime.sprites.filter((sprite) => !sprite.destroyed)).toHaveLength(16);
    expect(runtime.tasks[flameTaskId].data[2]).toBe(18);
    expect(runtime.tasks[flameTaskId].data[5]).toBe(1);

    const flameId = runtime.sprites.find((sprite) => sprite.callback === 'SpriteCallback_TitleScreenFlame')?.id ?? MAX_SPRITES;
    expect(flameId).not.toBe(MAX_SPRITES);
    runtime.sprites[flameId].data[7] = 1;
    runtime.sprites[flameId].invisible = true;
    SpriteCallback_TitleScreenFlame(runtime, flameId);
    expect(runtime.sprites[flameId].invisible).toBe(false);
    expect(runtime.operations).toContain(`StartSpriteAnim:${flameId}:0`);

    const slashId = CreateSlashSprite(runtime);
    expect(IsSlashSpriteDeactivated(runtime, slashId)).toBe(true);
    DeactivateSlashSprite(runtime, slashId);
    SpriteCallback_Slash(runtime, slashId);
    expect(runtime.sprites[slashId].data[0]).toBe(2);
    expect(IsSlashSpriteDeactivated(runtime, slashId)).toBe(false);

    const movingSlash = CreateSlashSprite(runtime);
    runtime.sprites[movingSlash].data[1] = 1;
    tickTitleScreenSprite(runtime, movingSlash);
    expect(runtime.sprites[movingSlash].data[0]).toBe(1);
    runtime.sprites[movingSlash].x = DISPLAY_WIDTH + 33;
    tickTitleScreenSprite(runtime, movingSlash);
    expect(runtime.sprites[movingSlash].x).toBe(-32);
    expect(runtime.sprites[movingSlash].data[1]).toBe(540);

    expect(CreateFlameSprite(runtime, 1, 10, 1, -1, true)).toBe(true);
    const lowFlameId = runtime.sprites.at(-1)?.id ?? MAX_SPRITES;
    SpriteCallback_TitleScreenFlame(runtime, lowFlameId);
    expect(runtime.sprites[lowFlameId].destroyed).toBe(true);
  });

  test('mirrors LeafGreen leaf and streak sprite callbacks exactly', () => {
    const runtime = createTitleScreenRuntime();
    expect(sStreakYPositions).toEqual([40, 80, 110, 60, 90, 70, 100, 50]);

    CreateLeafSprite(runtime, 32, 16, -2);
    const leafId = runtime.sprites.at(-1)?.id ?? MAX_SPRITES;
    expect(runtime.sprites[leafId]).toMatchObject({
      template: 'sSpriteTemplate_FlameOrLeaf',
      x: DISPLAY_WIDTH,
      y: 32,
      priority: 0,
      callback: 'SpriteCallback_TitleScreenLeaf'
    });
    SpriteCallback_TitleScreenLeaf(runtime, leafId);
    expect(runtime.sprites[leafId].x).toBe(239);
    expect(runtime.sprites[leafId].y).toBe(31);
    expect(runtime.sprites[leafId].data[6]).toBe(1);
    expect(runtime.sprites[leafId].data[5]).toBe(0);
    for (let i = 0; i < 10; i += 1) SpriteCallback_TitleScreenLeaf(runtime, leafId);
    expect(runtime.sprites[leafId].data[5]).toBe(1);

    CreateLeafSprite(runtime, 16, 4096, -16);
    const offscreenLeafId = runtime.sprites.at(-1)?.id ?? MAX_SPRITES;
    SpriteCallback_TitleScreenLeaf(runtime, offscreenLeafId);
    expect(runtime.sprites[offscreenLeafId].destroyed).toBe(true);

    CreateStreakSprites(runtime);
    const streakIds = runtime.sprites.filter((sprite) => sprite.callback === 'SpriteCallback_Streak').map((sprite) => sprite.id);
    expect(streakIds).toHaveLength(4);
    expect(streakIds.map((id) => runtime.sprites[id].x)).toEqual([DISPLAY_WIDTH + 16, DISPLAY_WIDTH + 56, DISPLAY_WIDTH + 96, DISPLAY_WIDTH + 136]);
    expect(streakIds.map((id) => runtime.sprites[id].y)).toEqual(sStreakYPositions.slice(0, 4));

    const streak = runtime.sprites[streakIds[0]];
    streak.x = -17;
    SpriteCallback_Streak(runtime, streak.id);
    expect(streak.x).toBe(DISPLAY_WIDTH + 16);
    expect(streak.data[7]).toBe(1);
    expect(streak.y).toBe(sStreakYPositions[1]);
  });

  test('mirrors LeafGreen leaf spawner state machine and RNG fields', () => {
    const runtime = createTitleScreenRuntime();
    const taskId = pushTask(runtime, 'Task_LeafSpawner');

    Task_LeafSpawner(runtime, taskId);
    expect(runtime.tasks[taskId].data[0]).toBe(1);
    expect(runtime.sprites.filter((sprite) => sprite.callback === 'SpriteCallback_Streak')).toHaveLength(4);

    Task_LeafSpawner(runtime, taskId);
    const leaves = runtime.sprites.filter((sprite) => sprite.callback === 'SpriteCallback_TitleScreenLeaf');
    expect(leaves).toHaveLength(1);
    expect(runtime.tasks[taskId].data[1]).toBe(0);
    expect(runtime.tasks[taskId].data[2]).toBeGreaterThanOrEqual(6);
    expect(runtime.tasks[taskId].data[2]).toBeLessThanOrEqual(11);
    expect(leaves[0].data[0]).toBe(DISPLAY_WIDTH * 16);
    expect([16, 24, 48]).toContain(leaves[0].data[1]);
    expect(leaves[0].data[3]).toBeGreaterThanOrEqual(-2);
    expect(leaves[0].data[3]).toBeLessThanOrEqual(1);
    expect(leaves[0].y).toBeGreaterThanOrEqual(32);
    expect(leaves[0].y).toBeLessThanOrEqual(119);
  });

  test('ticks task dispatchers and fade-out callbacks through their current functions', () => {
    const runtime = createTitleScreenRuntime();
    const timerTaskId = pushTask(runtime, 'Task_TitleScreenTimer');
    runtime.sTitleScreenTimerTaskId = timerTaskId;
    runtime.tasks[timerTaskId].data[0] = 2700;
    tickTitleScreenTask(runtime, timerTaskId);
    expect(runtime.tasks[timerTaskId].destroyed).toBe(true);

    runtime.paletteFadeActive = true;
    CB2_FadeOutTransitionToSaveClearScreen(runtime);
    expect(runtime.mainCallback2).not.toBe('CB2_SaveClearScreen_Init');
    runtime.paletteFadeActive = false;
    CB2_FadeOutTransitionToSaveClearScreen(runtime);
    expect(runtime.mainCallback2).toBe('CB2_SaveClearScreen_Init');

    CB2_FadeOutTransitionToBerryFix(runtime);
    expect(runtime.mainCallback2).toBe('CB2_InitBerryFixProgram');
    expect(runtime.operations).toContain('m4aMPlayAllStop');
    expect(KEYSTROKE_DELSAVE).toBe(B_BUTTON | SELECT_BUTTON | DPAD_UP);
    expect(KEYSTROKE_BERRY_FIX).toBe(B_BUTTON | SELECT_BUTTON);
  });
});

function pushTask(runtime: TitleScreenRuntime, func: TitleScreenTaskFunc): number {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  return id;
}

function createRunRuntime(heldKeys: number, newKeys: number): TitleScreenRuntime {
  const runtime = createTitleScreenRuntime();
  const mainTaskId = pushTask(runtime, 'Task_TitleScreenMain');
  const timerTaskId = pushTask(runtime, 'Task_TitleScreenTimer');
  const slashId = CreateSlashSprite(runtime);
  runtime.sTitleScreenTimerTaskId = timerTaskId;
  runtime.heldKeys = heldKeys;
  runtime.newKeys = newKeys;
  runtime.tasks[mainTaskId].data[0] = TITLESCREENSCENE_RUN;
  runtime.tasks[mainTaskId].data[1] = 1;
  runtime.tasks[mainTaskId].data[6] = slashId;
  return runtime;
}
