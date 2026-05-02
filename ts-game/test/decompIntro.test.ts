import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  ANIM_NIDORINO_ATTACK,
  ANIM_NIDORINO_CROUCH,
  CB2_SetUpIntro,
  COLOSSEUM_GAME_CODE,
  CreateNidorinoRecoilDustSprites,
  GFScene_LoadGfxCreateStar,
  IntroCB_GF_OpenWindow,
  IntroCB_GF_Star,
  IntroCB_Scene1,
  Scene1_StartGrassScrolling,
  Scene1_Task_AnimateGrass,
  Scene3_CreateGengarSprite,
  Scene3_IsNidorinoEntering,
  Scene3_NidorinoAnimIsRunning,
  Scene3_SpriteCB_NidorinoEnter,
  Scene3_StartGengarAttack,
  Scene3_StartNidorinoAttack,
  Scene3_StartNidorinoCry,
  Scene3_StartNidorinoEntrance,
  Scene3_StartNidorinoHop,
  SetIntroCB,
  SetUpCopyrightScreen,
  SpriteCB_NidorinoAttack,
  SpriteCB_NidorinoCry,
  SpriteCB_NidorinoHop,
  SpriteCB_RecoilDust,
  SpriteCB_Star,
  StartIntroSequence,
  Task_CallIntroCallback,
  createIntroRuntime
} from '../src/game/decompIntro';
import { createTask } from '../src/game/decompTask';

describe('decompIntro', () => {
  test('copyright setup follows boot state transitions and multiboot branch', () => {
    const runtime = createIntroRuntime();
    expect(SetUpCopyrightScreen(runtime)).toBe(true);
    expect(runtime.vblankCallback).toBe('VBlankCB_Copyright');
    runtime.mainState = 141;
    runtime.paletteFadeActive = false;
    runtime.gcmbField2 = 2;
    runtime.ewramGameCode = COLOSSEUM_GAME_CODE;
    expect(SetUpCopyrightScreen(runtime)).toBe(false);
    expect(runtime.logs).toContain('GameCubeMultiBoot_ExecuteProgram');
  });

  test('setup intro allocates sequence and task callback dispatch can skip to title', () => {
    const runtime = createIntroRuntime();
    CB2_SetUpIntro(runtime);
    CB2_SetUpIntro(runtime);
    CB2_SetUpIntro(runtime);
    expect(runtime.mainCallback2).toBe('CB2_Intro');
    expect(runtime.introData?.callback).toBe('IntroCB_Init');

    runtime.newKeys = A_BUTTON;
    Task_CallIntroCallback(runtime.introData!.taskId, runtime);
    expect(runtime.introData?.callback).toBe('IntroCB_ExitToTitleScreen');
  });

  test('GF scene callbacks advance by timers and create star/sparkle tasks', () => {
    const runtime = createIntroRuntime();
    StartIntroSequence(runtime);
    const ptr = runtime.introData!;
    SetIntroCB(ptr, 'IntroCB_GF_OpenWindow');
    IntroCB_GF_OpenWindow(ptr, runtime);
    IntroCB_GF_OpenWindow(ptr, runtime);
    for (let i = 0; i < 6; i += 1) IntroCB_GF_OpenWindow(ptr, runtime);
    expect(ptr.callback).toBe('IntroCB_GF_Star');

    IntroCB_GF_Star(ptr, runtime);
    expect(runtime.sprites.some((s) => s.callback === 'SpriteCB_Star')).toBe(true);
    for (let i = 0; i < 30; i += 1) IntroCB_GF_Star(ptr, runtime);
    expect(runtime.taskRuntime.tasks.some((t) => t.func === 'GFScene_Task_NameSparklesSmall' && t.isActive)).toBe(true);
  });

  test('scene 1 grass task preserves frame timer and exiting scroll flag', () => {
    const runtime = createIntroRuntime();
    const taskId = createTask(runtime.taskRuntime, 'Scene1_Task_AnimateGrass', 0);
    for (let i = 0; i < 6; i += 1) Scene1_Task_AnimateGrass(taskId, runtime);
    expect(runtime.bgY[0]).toBe(1 << 15);
    Scene1_StartGrassScrolling(runtime);
    Scene1_Task_AnimateGrass(taskId, runtime);
    expect(runtime.taskRuntime.tasks[taskId].data[2]).toBe(1);

    StartIntroSequence(runtime);
    const ptr = runtime.introData!;
    SetIntroCB(ptr, 'IntroCB_Scene1');
    IntroCB_Scene1(ptr, runtime);
    expect(runtime.logs).toContain('LoadFightSceneSpriteGraphics');
  });

  test('scene 3 Gengar attack marks landing and creates swipe sprites', () => {
    const runtime = createIntroRuntime();
    StartIntroSequence(runtime);
    const ptr = runtime.introData!;
    Scene3_StartGengarAttack(ptr, runtime);
    const task = runtime.taskRuntime.tasks.findIndex((t) => t.func === 'Scene3_Task_GengarAttack' && t.isActive);
    for (let i = 0; i < 36; i += 1) runtime.taskRuntime.callbacks.Scene3_Task_GengarAttack(task);
    expect(ptr.gengarAttackLanded).toBe(true);
    for (let i = 0; i < 5; i += 1) runtime.taskRuntime.callbacks.Scene3_Task_GengarAttack(task);
    expect(runtime.sprites.some((s) => s.callback === 'SpriteCB_GengarSwipe')).toBe(true);
  });

  test('Nidorino entrance, cry, hop, attack, and dust callbacks mirror state transitions', () => {
    const runtime = createIntroRuntime();
    StartIntroSequence(runtime);
    const ptr = runtime.introData!;
    ptr.scene3NidorinoSprite = runtime.sprites[0] ?? null;
    if (!ptr.scene3NidorinoSprite) {
      Scene3_CreateGengarSprite(ptr, runtime);
      ptr.scene3NidorinoSprite = runtime.sprites[0];
    }
    const sprite = ptr.scene3NidorinoSprite;

    Scene3_StartNidorinoEntrance(sprite, 0, 10, 5);
    while (Scene3_IsNidorinoEntering(ptr)) Scene3_SpriteCB_NidorinoEnter(sprite);
    expect(sprite.x).toBe(10);

    Scene3_StartNidorinoCry(ptr);
    for (let i = 0; i < 60; i += 1) SpriteCB_NidorinoCry(sprite, runtime);
    expect(Scene3_NidorinoAnimIsRunning(ptr)).toBe(false);

    Scene3_StartNidorinoHop(sprite, 3, 12, 5);
    for (let i = 0; i < 8; i += 1) SpriteCB_NidorinoHop(sprite);
    expect(sprite.callback).toBe('SpriteCallbackDummy');

    Scene3_StartNidorinoAttack(ptr, runtime);
    expect(sprite.anim).toBe(ANIM_NIDORINO_CROUCH);
    for (let i = 0; i < 70; i += 1) SpriteCB_NidorinoAttack(sprite, runtime);
    expect(sprite.anim).toBe(ANIM_NIDORINO_ATTACK);

    CreateNidorinoRecoilDustSprites(30, 40, 0x4757, runtime);
    const dust = runtime.sprites.at(-1)!;
    SpriteCB_RecoilDust(dust);
    expect(dust.x).toBeLessThan(8);
  });

  test('star callback moves with fixed-point state and spawns trailing sparkles', () => {
    const runtime = createIntroRuntime();
    GFScene_LoadGfxCreateStar(runtime);
    const star = runtime.sprites.find((s) => s.callback === 'SpriteCB_Star')!;
    for (let i = 0; i < 3; i += 1) SpriteCB_Star(star, runtime);
    expect(star.x).toBeLessThan(248);
    expect(runtime.sprites.length).toBeGreaterThan(1);
  });
});
