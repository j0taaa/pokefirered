import { describe, expect, test } from 'vitest';
import {
  BG_ANIM_AREA_OVERFLOW_MODE,
  BG_ANIM_CHAR_BASE_BLOCK,
  BG_ANIM_MOSAIC,
  BG_ANIM_PALETTES_MODE,
  BG_ANIM_PRIORITY,
  BG_ANIM_SCREEN_BASE_BLOCK,
  BG_ANIM_SCREEN_SIZE,
  BG_ATTR_CHARBASEINDEX,
  BG_SCREEN_SIZE,
  BATTLE_TERRAIN_BUILDING,
  BATTLE_TERRAIN_LONG_GRASS,
  BATTLE_TERRAIN_PLAIN,
  BATTLE_TERRAIN_SAND,
  BATTLE_TERRAIN_UNDERWATER,
  BATTLE_TERRAIN_WATER,
  BATTLE_TYPE_KYOGRE_GROUDON,
  BATTLE_TYPE_LINK,
  BLDCNT_EFFECT_BLEND,
  BLDCNT_TGT1_BG1,
  BLDCNT_TGT2_BG3,
  BLDCNT_TGT2_OBJ,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_BLDY,
  REG_OFFSET_BG1CNT,
  REG_OFFSET_BG2CNT,
  REG_OFFSET_WININ,
  REG_OFFSET_WINOUT,
  SPRITE_CB_VS_LETTER_INIT,
  ST_OAM_OBJ_WINDOW,
  VERSION_RUBY,
  WININ_WIN0_BG_ALL,
  WININ_WIN0_CLR,
  WININ_WIN0_OBJ,
  WININ_WIN1_BG_ALL,
  WININ_WIN1_CLR,
  WININ_WIN1_OBJ,
  WINOUT_WIN01_BG1,
  WINOUT_WIN01_BG2,
  WINOUT_WIN01_BG_ALL,
  WINOUT_WIN01_CLR,
  WINOUT_WIN01_OBJ,
  WINOUT_WINOBJ_BG_ALL,
  WINOUT_WINOBJ_CLR,
  WINOUT_WINOBJ_OBJ,
  BattleIntroSlide1,
  BattleIntroSlide2,
  BattleIntroSlide3,
  BattleIntroSlideEnd,
  BattleIntroSlideLink,
  CopyBattlerSpriteToBg,
  DrawBattlerOnBgDMA,
  GetAnimBgAttribute,
  HandleIntroSlide,
  SetAnimBgAttribute,
  battleIntroBg1Cnt,
  battleIntroBg2Cnt,
  battleIntroSlide1,
  battleIntroSlide2,
  battleIntroSlide3,
  battleIntroSlideEnd,
  battleIntroSlideLink,
  bldAlphaBlend,
  copyBattlerSpriteToBg,
  createBattleIntroRuntime,
  drawBattlerOnBgDMA,
  getAnimBgAttribute,
  handleIntroSlide,
  runBattleIntroTask,
  setAnimBgAttribute
} from '../src/game/decompBattleIntro';

describe('decomp battle_intro', () => {
  test('SetAnimBgAttribute and GetAnimBgAttribute preserve the C BgCnt bitfields', () => {
    const runtime = createBattleIntroRuntime();

    setAnimBgAttribute(runtime, 1, BG_ANIM_SCREEN_SIZE, 3);
    setAnimBgAttribute(runtime, 1, BG_ANIM_AREA_OVERFLOW_MODE, 1);
    setAnimBgAttribute(runtime, 1, BG_ANIM_MOSAIC, 1);
    setAnimBgAttribute(runtime, 1, BG_ANIM_CHAR_BASE_BLOCK, 2);
    setAnimBgAttribute(runtime, 1, BG_ANIM_PRIORITY, 1);
    setAnimBgAttribute(runtime, 1, BG_ANIM_PALETTES_MODE, 1);
    setAnimBgAttribute(runtime, 1, BG_ANIM_SCREEN_BASE_BLOCK, 27);

    expect(getAnimBgAttribute(runtime, 1, BG_ANIM_SCREEN_SIZE)).toBe(3);
    expect(getAnimBgAttribute(runtime, 1, BG_ANIM_AREA_OVERFLOW_MODE)).toBe(1);
    expect(getAnimBgAttribute(runtime, 1, BG_ANIM_MOSAIC)).toBe(1);
    expect(getAnimBgAttribute(runtime, 1, BG_ANIM_CHAR_BASE_BLOCK)).toBe(2);
    expect(getAnimBgAttribute(runtime, 1, BG_ANIM_PRIORITY)).toBe(1);
    expect(getAnimBgAttribute(runtime, 1, BG_ANIM_PALETTES_MODE)).toBe(1);
    expect(getAnimBgAttribute(runtime, 1, BG_ANIM_SCREEN_BASE_BLOCK)).toBe(27);
    expect(getAnimBgAttribute(runtime, 4, BG_ANIM_PRIORITY)).toBe(0);
    expect(getAnimBgAttribute(runtime, 1, 99)).toBe(0);

    const bg1Cnt = runtime.gpuRegs.REG_OFFSET_BG1CNT;
    setAnimBgAttribute(runtime, 4, BG_ANIM_PRIORITY, 3);
    expect(runtime.gpuRegs.REG_OFFSET_BG1CNT).toBe(bg1Cnt);
  });

  test('HandleIntroSlide chooses the same task function table and special-case terrain logic', () => {
    const runtime = createBattleIntroRuntime();
    const sandTaskId = handleIntroSlide(runtime, BATTLE_TERRAIN_SAND);
    const buildingTaskId = handleIntroSlide(runtime, BATTLE_TERRAIN_BUILDING);

    expect(runtime.tasks[sandTaskId]).toMatchObject({ func: 'BattleIntroSlide2', priority: 0 });
    expect(runtime.tasks[sandTaskId].data.slice(0, 7)).toEqual([0, BATTLE_TERRAIN_SAND, 0, 0, 0, 0, 0]);
    expect(runtime.tasks[buildingTaskId].func).toBe('BattleIntroSlide3');

    runtime.gBattleTypeFlags = BATTLE_TYPE_LINK;
    const linkTaskId = handleIntroSlide(runtime, BATTLE_TERRAIN_PLAIN);
    expect(runtime.tasks[linkTaskId].func).toBe('BattleIntroSlideLink');
    expect(runtime.tasks[linkTaskId].data[1]).toBe(BATTLE_TERRAIN_PLAIN);

    const kyogreRuntime = createBattleIntroRuntime();
    kyogreRuntime.gBattleTypeFlags = BATTLE_TYPE_KYOGRE_GROUDON;
    kyogreRuntime.gGameVersion = VERSION_RUBY + 1;
    const forcedTaskId = handleIntroSlide(kyogreRuntime, BATTLE_TERRAIN_PLAIN);
    expect(kyogreRuntime.tasks[forcedTaskId].func).toBe('BattleIntroSlide2');
    expect(kyogreRuntime.tasks[forcedTaskId].data[1]).toBe(BATTLE_TERRAIN_UNDERWATER);
  });

  test('BattleIntroSlideEnd destroys the task and restores battle/window blend globals', () => {
    const runtime = createBattleIntroRuntime();
    const taskId = handleIntroSlide(runtime, BATTLE_TERRAIN_SAND);
    runtime.gBattle_BG1_X = 11;
    runtime.gBattle_BG1_Y = 22;
    runtime.gBattle_BG2_X = 33;
    runtime.gBattle_BG2_Y = 44;
    runtime.gpuRegs[REG_OFFSET_BLDCNT] = 99;

    battleIntroSlideEnd(runtime, taskId);

    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect([runtime.gBattle_BG1_X, runtime.gBattle_BG1_Y, runtime.gBattle_BG2_X, runtime.gBattle_BG2_Y]).toEqual([0, 0, 0, 0]);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDY]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_WININ]).toBe(WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR | WININ_WIN1_BG_ALL | WININ_WIN1_OBJ | WININ_WIN1_CLR);
    expect(runtime.gpuRegs[REG_OFFSET_WINOUT]).toBe(WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR | WINOUT_WINOBJ_BG_ALL | WINOUT_WINOBJ_OBJ | WINOUT_WINOBJ_CLR);
  });

  test('BattleIntroSlide1 follows the delay, window open, scanline, and cleanup states', () => {
    const runtime = createBattleIntroRuntime();
    const taskId = handleIntroSlide(runtime, BATTLE_TERRAIN_LONG_GRASS);
    const task = runtime.tasks[taskId];

    battleIntroSlide1(runtime, taskId);
    expect(task.data.slice(0, 3)).toEqual([1, BATTLE_TERRAIN_LONG_GRASS, 1]);
    expect(runtime.gBattle_BG1_X).toBe(6);

    battleIntroSlide1(runtime, taskId);
    expect(task.data[0]).toBe(2);
    expect(runtime.gpuRegs[REG_OFFSET_WININ]).toBe(WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);

    runtime.gBattle_WIN0V = 0x30ff;
    runtime.gIntroSlideFlags = 1;
    battleIntroSlide1(runtime, taskId);
    expect(task.data.slice(0, 4)).toEqual([3, BATTLE_TERRAIN_LONG_GRASS, 240, 32]);
    expect(runtime.gIntroSlideFlags).toBe(0);

    task.data[2] = 2;
    task.data[3] = 0;
    runtime.gBattle_WIN0V = 0x0100;
    battleIntroSlide1(runtime, taskId);
    expect(task.data[0]).toBe(4);
    expect(runtime.gBattle_BG1_Y).toBe(0xfffe);
    expect(runtime.gScanlineEffect.state).toBe(3);
    expect(runtime.gScanlineEffectRegBuffers[0].slice(0, 80)).toEqual(Array.from({ length: 80 }, () => 0));
    expect(Object.is(runtime.gScanlineEffectRegBuffers[0][80], -0)).toBe(true);
    expect(runtime.cpuFill32Calls.at(-1)).toEqual({ value: 0, dest: 'BG_SCREEN_ADDR(28)', size: BG_SCREEN_SIZE });
    expect(runtime.bgAttributeCalls.slice(-2)).toEqual([
      { bg: 1, attr: BG_ATTR_CHARBASEINDEX, value: 0 },
      { bg: 2, attr: BG_ATTR_CHARBASEINDEX, value: 0 }
    ]);
    expect(runtime.gpuRegs[REG_OFFSET_BG1CNT]).toBe(battleIntroBg1Cnt);
    expect(runtime.gpuRegs[REG_OFFSET_BG2CNT]).toBe(battleIntroBg2Cnt);

    battleIntroSlide1(runtime, taskId);
    expect(task.destroyed).toBe(true);
  });

  test('BattleIntroSlide2 preserves terrain scrolling, water cosine bobbing, blend fade cadence, and cleanup', () => {
    const runtime = createBattleIntroRuntime();
    const taskId = handleIntroSlide(runtime, BATTLE_TERRAIN_WATER);
    const task = runtime.tasks[taskId];

    battleIntroSlide2(runtime, taskId);
    expect(runtime.gBattle_BG1_X).toBe(8);
    expect(runtime.gBattle_BG1_Y).toBe(56);
    expect(task.data[6]).toBe(4);
    expect(task.data[4]).toBe(16);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(bldAlphaBlend(16, 0));

    task.data[0] = 3;
    task.data[2] = 4;
    task.data[3] = 1;
    task.data[4] = 16;
    task.data[5] = 1;
    runtime.gBattle_WIN0V = 0x0100;
    battleIntroSlide2(runtime, taskId);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ);
    expect(runtime.gpuRegs[REG_OFFSET_BLDY]).toBe(0);

    battleIntroSlide2(runtime, taskId);
    expect(task.data[4]).toBe(0x10f);
    expect(task.data[5]).toBe(4);
    expect(task.data[0]).toBe(4);
    expect(runtime.gScanlineEffectRegBuffers[0][0]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(bldAlphaBlend(16, 0));
  });

  test('BattleIntroSlide3 sets initial blend and then fades through the state 3 path', () => {
    const runtime = createBattleIntroRuntime();
    const taskId = handleIntroSlide(runtime, BATTLE_TERRAIN_BUILDING);
    const task = runtime.tasks[taskId];

    battleIntroSlide3(runtime, taskId);
    expect(runtime.gBattle_BG1_X).toBe(8);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ);
    expect(task.data[4]).toBe(bldAlphaBlend(8, 8));

    task.data[0] = 3;
    task.data[2] = 2;
    task.data[3] = 0;
    task.data[5] = 1;
    runtime.gBattle_WIN0V = 0x0100;
    battleIntroSlide3(runtime, taskId);
    expect(task.data[4]).toBe(bldAlphaBlend(8, 8) + 0xff);
    expect(task.data[5]).toBe(6);
    expect(task.data[0]).toBe(4);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(bldAlphaBlend(8, 0));
  });

  test('BattleIntroSlideLink handles VS sprites, window regs, bg sweep, scanlines, and end state', () => {
    const runtime = createBattleIntroRuntime();
    const taskId = handleIntroSlide(runtime, BATTLE_TERRAIN_SAND);
    const task = runtime.tasks[taskId];

    battleIntroSlideLink(runtime, taskId);
    expect(task.data.slice(0, 3)).toEqual([1, BATTLE_TERRAIN_SAND, 32]);

    task.data[2] = 1;
    battleIntroSlideLink(runtime, taskId);
    expect(task.data[0]).toBe(2);
    expect(runtime.gSprites[0]).toMatchObject({ oam: { objMode: ST_OAM_OBJ_WINDOW }, callback: SPRITE_CB_VS_LETTER_INIT });
    expect(runtime.gSprites[1]).toMatchObject({ oam: { objMode: ST_OAM_OBJ_WINDOW }, callback: SPRITE_CB_VS_LETTER_INIT });
    expect(runtime.gpuRegs[REG_OFFSET_WINOUT]).toBe(WINOUT_WINOBJ_BG_ALL | WINOUT_WINOBJ_OBJ | WINOUT_WINOBJ_CLR | WINOUT_WIN01_BG1 | WINOUT_WIN01_BG2);

    runtime.gBattle_BG1_X = 79;
    battleIntroSlideLink(runtime, taskId);
    expect(runtime.gBattle_BG1_X).toBe(82);
    expect(runtime.gBattle_BG2_X).toBe(0xfffd);

    battleIntroSlideLink(runtime, taskId);
    expect(task.data[4]).toBe(1);
    expect(runtime.cpuFill32Calls.slice(-2)).toEqual([
      { value: 0, dest: 'BG_SCREEN_ADDR(28)', size: BG_SCREEN_SIZE },
      { value: 0, dest: 'BG_SCREEN_ADDR(30)', size: BG_SCREEN_SIZE }
    ]);

    task.data[0] = 2;
    task.data[4] = 1;
    runtime.gBattle_WIN0V = 0x30ff;
    runtime.gIntroSlideFlags = 1;
    battleIntroSlideLink(runtime, taskId);
    expect(task.data.slice(0, 4)).toEqual([3, BATTLE_TERRAIN_SAND, 240, 32]);
    expect(runtime.gIntroSlideFlags).toBe(0);

    task.data[2] = 2;
    runtime.gBattle_WIN0V = 0x0100;
    battleIntroSlideLink(runtime, taskId);
    expect(task.data[0]).toBe(4);
    expect(runtime.gScanlineEffect.state).toBe(3);
    expect(runtime.gpuRegs[REG_OFFSET_BG1CNT]).toBe(battleIntroBg1Cnt);

    battleIntroSlideLink(runtime, taskId);
    expect(task.destroyed).toBe(true);
  });

  test('runBattleIntroTask dispatches through the stored C task function pointer equivalent', () => {
    const runtime = createBattleIntroRuntime();
    const taskId = handleIntroSlide(runtime, BATTLE_TERRAIN_SAND);

    runBattleIntroTask(runtime, taskId);

    expect(runtime.tasks[taskId].func).toBe('BattleIntroSlide2');
    expect(runtime.tasks[taskId].data[0]).toBe(1);
    expect(runtime.gBattle_BG1_X).toBe(8);
  });

  test('CopyBattlerSpriteToBg copies the form sprite block and fills the 8x8 tilemap with palette bits', () => {
    const runtime = createBattleIntroRuntime();
    const form0 = Array.from({ length: BG_SCREEN_SIZE }, (_, index) => index);
    const form1 = Array.from({ length: BG_SCREEN_SIZE }, (_, index) => 9000 + index);
    runtime.gMonSpritesGfxPtr.sprites[2] = [...form0, ...form1];
    runtime.battlersByPosition[2] = 5;
    runtime.gBattleMonForms[5] = 1;
    const tilesDest: number[] = [];
    const tilemapDest = Array.from({ length: BG_SCREEN_SIZE }, () => 0);

    copyBattlerSpriteToBg(runtime, 1, 3, 4, 2, 7, tilesDest, tilemapDest, 0x120);

    expect(tilesDest.slice(0, 4)).toEqual([9000, 9001, 9002, 9003]);
    expect(runtime.loadBgTilesCalls.at(-1)).toMatchObject({ bgId: 1, size: 0x1000, offset: 0x120 });
    expect(tilemapDest[4 * 32 + 3]).toBe(0x120 | (7 << 12));
    expect(tilemapDest[4 * 32 + 10]).toBe(0x127 | (7 << 12));
    expect(tilemapDest[11 * 32 + 10]).toBe(0x15f | (7 << 12));
    expect(runtime.loadBgTilemapCalls.at(-1)).toMatchObject({ bgId: 1, size: BG_SCREEN_SIZE, offset: 0 });
  });

  test('DrawBattlerOnBgDMA logs the DMA copy and writes the same BG_VRAM tile indices', () => {
    const runtime = createBattleIntroRuntime();
    runtime.gMonSpritesGfxPtr.sprites[3] = Array.from({ length: BG_SCREEN_SIZE * 2 }, (_, index) => index + 1);

    drawBattlerOnBgDMA(runtime, 2, 1, 3, 1, 6, 0x140, 1, 2);

    expect(runtime.dmaCopy16Calls.at(-1)).toMatchObject({
      channel: 3,
      dest: 'BG_SCREEN_ADDR(0)+320',
      size: BG_SCREEN_SIZE
    });
    expect(runtime.dmaCopy16Calls.at(-1)?.source.slice(0, 3)).toEqual([BG_SCREEN_SIZE + 1, BG_SCREEN_SIZE + 2, BG_SCREEN_SIZE + 3]);
    expect(runtime.bgVram[1 * 32 + (2 + (1 << 10))]).toBe(((0x140 >> 5) - (2 << 9)) | (6 << 12));
    expect(runtime.bgVram[8 * 32 + (9 + (1 << 10))]).toBe(((0x140 >> 5) - (2 << 9) + 63) | (6 << 12));
  });

  test('exact C-name battle intro exports preserve helper, task, and battler blit behavior', () => {
    const runtime = createBattleIntroRuntime();

    SetAnimBgAttribute(runtime, 1, BG_ANIM_PRIORITY, 2);
    SetAnimBgAttribute(runtime, 1, BG_ANIM_SCREEN_BASE_BLOCK, 29);
    expect(GetAnimBgAttribute(runtime, 1, BG_ANIM_PRIORITY)).toBe(2);
    expect(GetAnimBgAttribute(runtime, 1, BG_ANIM_SCREEN_BASE_BLOCK)).toBe(29);

    const slide1 = HandleIntroSlide(runtime, BATTLE_TERRAIN_LONG_GRASS);
    expect(runtime.tasks[slide1].func).toBe('BattleIntroSlide1');
    BattleIntroSlide1(runtime, slide1);
    expect(runtime.tasks[slide1].data[0]).toBe(1);

    const slide2 = HandleIntroSlide(runtime, BATTLE_TERRAIN_WATER);
    BattleIntroSlide2(runtime, slide2);
    expect(runtime.gBattle_BG1_X).toBe(14);

    const slide3 = HandleIntroSlide(runtime, BATTLE_TERRAIN_BUILDING);
    BattleIntroSlide3(runtime, slide3);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ);

    runtime.gBattleTypeFlags = BATTLE_TYPE_LINK;
    const link = HandleIntroSlide(runtime, BATTLE_TERRAIN_PLAIN);
    BattleIntroSlideLink(runtime, link);
    expect(runtime.tasks[link].data[0]).toBe(1);

    BattleIntroSlideEnd(runtime, slide1);
    expect(runtime.tasks[slide1].destroyed).toBe(true);
    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(0);

    runtime.gMonSpritesGfxPtr.sprites[0] = Array.from({ length: BG_SCREEN_SIZE * 2 }, (_, index) => index & 0xffff);
    runtime.gBattleMonForms[0] = 1;
    runtime.battlersByPosition[0] = 0;
    const tilesDest = Array.from({ length: BG_SCREEN_SIZE }, () => 0);
    const tilemapDest = Array.from({ length: BG_SCREEN_SIZE }, () => 0);

    CopyBattlerSpriteToBg(runtime, 1, 2, 3, 0, 4, tilesDest, tilemapDest, 10);
    expect(tilesDest[0]).toBe(runtime.gMonSpritesGfxPtr.sprites[0][BG_SCREEN_SIZE]);
    expect(tilemapDest[3 * 32 + 2]).toBe(10 | (4 << 12));
    expect(runtime.loadBgTilesCalls.at(-1)).toMatchObject({ bgId: 1, size: 0x1000, offset: 10 });

    DrawBattlerOnBgDMA(runtime, 1, 2, 0, 1, 5, 0x40, 0, 0);
    expect(runtime.dmaCopy16Calls.at(-1)).toMatchObject({ channel: 3, dest: 'BG_SCREEN_ADDR(0)+64', size: BG_SCREEN_SIZE });
    expect(runtime.bgVram[2 * 32 + 1]).toBe((0x40 >> 5) | (5 << 12));
  });
});
