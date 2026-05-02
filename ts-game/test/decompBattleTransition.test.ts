import { describe, expect, test } from 'vitest';
import {
  BattleTransition_Start,
  BattleTransition_StartOnField,
  CreateIntroTask,
  DISPLAY_HEIGHT,
  FadeScreenBlack,
  FldEff_PokeballTrail,
  GetBg0TilesDst,
  GetBg0TilemapDst,
  InitBlackWipe,
  IsBattleTransitionDone,
  IsIntroTaskDone,
  Mugshots_CreateTrainerPics,
  SetCircularMask,
  SetSinWave,
  SpriteCB_FldEffPokeballTrail,
  SpriteCB_MugshotTrainerPic,
  Task_BattleTransition_Intro,
  Task_Blur,
  Task_GridSquares,
  Task_PokeballsTrail,
  Task_WhiteBarsFade,
  TransitionIntro_FadeFromGray,
  TransitionIntro_FadeToGray,
  UpdateBlackWipe,
  VBlankCB_Swirl,
  createBattleTransitionRuntime
} from '../src/game/decompBattleTransition';

describe('decompBattleTransition', () => {
  test('starts transitions through the field and main launch paths', () => {
    const runtime = createBattleTransitionRuntime();

    BattleTransition_StartOnField(2, runtime);
    expect(IsBattleTransitionDone(runtime)).toBe(false);
    expect(runtime.operations).toContain('Overworld_ChangeMusicToDefault');
    expect(runtime.activeTransitionTaskId).not.toBe(0xff);
    expect(runtime.tasks[runtime.activeTransitionTaskId].data[1]).toBe(2);

    const runtime2 = createBattleTransitionRuntime();
    BattleTransition_Start(0, runtime2);
    expect(runtime2.sTransitionData).not.toBeNull();
    expect(runtime2.vblankCallback).toBe('VBlankCB_BattleTransition');
  });

  test('intro fade task cycles gray in/out and reports completion', () => {
    const runtime = createBattleTransitionRuntime();
    CreateIntroTask(0, 0, 1, 8, 8, runtime);
    const id = runtime.activeIntroTaskId;
    expect(IsIntroTaskDone(runtime)).toBe(false);

    expect(TransitionIntro_FadeToGray(id, runtime)).toBe(false);
    expect(runtime.sTransitionData?.bldY).toBe(8);
    expect(TransitionIntro_FadeToGray(id, runtime)).toBe(true);
    expect(TransitionIntro_FadeFromGray(id, runtime)).toBe(false);
    expect(TransitionIntro_FadeFromGray(id, runtime)).toBe(true);
    expect(IsIntroTaskDone(runtime)).toBe(true);

    const runtime2 = createBattleTransitionRuntime();
    CreateIntroTask(0, 0, 1, 16, 16, runtime2);
    Task_BattleTransition_Intro(runtime2.activeIntroTaskId, runtime2);
    Task_BattleTransition_Intro(runtime2.activeIntroTaskId, runtime2);
    expect(runtime2.tasks[runtime2.activeIntroTaskId]?.destroyed ?? true).toBe(true);
  });

  test('black wipe, circular mask, and sine wave helpers update buffers and registers', () => {
    const runtime = createBattleTransitionRuntime();
    const data = Array.from({ length: 11 }, () => 0);
    InitBlackWipe(data, 0, 0, 16, 8, 4, 2);
    expect(data.slice(0, 10)).toEqual([0, 0, 0, 0, 16, 8, 4, 2, 16, 8]);
    expect(UpdateBlackWipe(data, false, false, runtime)).toBe(false);
    expect(data[2]).toBe(4);
    expect(data[3]).toBe(2);
    while (!UpdateBlackWipe(data, true, true, runtime)) {
      // finish the same incremental wipe C performs per frame
    }
    expect(data[2]).toBe(16);
    expect(data[3]).toBe(8);

    const wave = Array.from({ length: DISPLAY_HEIGHT }, () => 0);
    SetSinWave(wave, 3, 0, 4, 8, 8);
    expect(wave[0]).toBe(3);
    expect(wave.slice(0, 4).some((v) => v !== 3)).toBe(true);

    const mask = Array.from({ length: DISPLAY_HEIGHT * 2 }, () => 0);
    SetCircularMask(mask, 120, 80, 20);
    expect(mask[80 * 2]).toBe(100);
    expect(mask[80 * 2 + 1]).toBe(140);
  });

  test('task state machines mutate transition data and eventually destroy themselves', () => {
    const runtime = createBattleTransitionRuntime();
    runtime.tasks[0] = { func: 'Task_Blur', data: Array.from({ length: 16 }, () => 0), destroyed: false };
    for (let i = 0; i < 12; i += 1) Task_Blur(0, runtime);
    expect(runtime.tasks[0].destroyed).toBe(true);
    expect((runtime.sTransitionData?.bldY ?? 0) > 0).toBe(true);

    runtime.tasks[1] = { func: 'Task_GridSquares', data: Array.from({ length: 16 }, () => 0), destroyed: false };
    for (let i = 0; i < 70; i += 1) Task_GridSquares(1, runtime);
    expect(runtime.tasks[1].destroyed).toBe(true);
    expect(runtime.bg0Tilemap.some((tile) => tile !== 0)).toBe(true);

    runtime.tasks[2] = { func: 'Task_WhiteBarsFade', data: Array.from({ length: 16 }, () => 0), destroyed: false };
    for (let i = 0; i < 40; i += 1) Task_WhiteBarsFade(2, runtime);
    expect(runtime.tasks[2].destroyed).toBe(true);
    expect(runtime.sprites.length).toBeGreaterThan(0);

    runtime.tasks[3] = { func: 'Task_PokeballsTrail', data: Array.from({ length: 16 }, () => 0), destroyed: false };
    for (let i = 0; i < 30; i += 1) Task_PokeballsTrail(3, runtime);
    expect(runtime.tasks[3].destroyed).toBe(true);
  });

  test('pokeball and mugshot sprite callbacks preserve state progression', () => {
    const runtime = createBattleTransitionRuntime();

    FldEff_PokeballTrail(runtime);
    const pokeball = runtime.sprites.length - 1;
    for (let i = 0; i < 31; i += 1) SpriteCB_FldEffPokeballTrail(pokeball, runtime);
    expect(runtime.sprites[pokeball].destroyed).toBe(true);

    runtime.tasks[0] = { func: 'Task_Lorelei', data: Array.from({ length: 16 }, () => 0), destroyed: false };
    Mugshots_CreateTrainerPics(0, runtime);
    const opponent = runtime.tasks[0].data[8];
    const player = runtime.tasks[0].data[9];
    expect(runtime.sprites[opponent].data[2]).toBe(0);
    expect(runtime.sprites[player].data[2]).toBe(1);

    for (let i = 0; i < 20; i += 1) SpriteCB_MugshotTrainerPic(opponent, runtime);
    expect(runtime.trainerPicSlideDone[0]).toBe(true);
  });

  test('callbacks and buffer accessors expose transition backing memory', () => {
    const runtime = createBattleTransitionRuntime();
    VBlankCB_Swirl(runtime);
    expect(runtime.sTransitionData?.vblankDma).not.toBe(0);

    const tilemapPtr: { value?: number[] } = {};
    const tilesPtr: { value?: number[] } = {};
    expect(GetBg0TilemapDst(tilesPtr, runtime)).toBe(runtime.bg0Tilemap);
    expect(tilesPtr.value).toBe(runtime.bg0Tilemap);
    expect(GetBg0TilesDst(tilemapPtr, tilesPtr, runtime)).toBe(runtime.bg0Tiles);
    expect(tilemapPtr.value).toBe(runtime.bg0Tilemap);
    expect(tilesPtr.value).toBe(runtime.bg0Tiles);

    FadeScreenBlack(runtime);
    expect(runtime.paletteFadeActive).toBe(true);
    expect(runtime.sTransitionData?.bldY).toBe(16);
  });
});
