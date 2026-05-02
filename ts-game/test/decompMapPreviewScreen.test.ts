import { describe, expect, it } from 'vitest';
import {
  BG_ATTR_PRIORITY,
  BLDALPHA_BLEND,
  BLDCNT_EFFECT_BLEND,
  BLDCNT_TGT1_BG0,
  BLDCNT_TGT2_BD,
  BLDCNT_TGT2_BG1,
  BLDCNT_TGT2_BG2,
  BLDCNT_TGT2_BG3,
  BLDCNT_TGT2_OBJ,
  COPYWIN_FULL,
  FLAG_WORLD_MAP_MT_MOON_1F,
  FLAG_WORLD_MAP_POWER_PLANT,
  FLAG_WORLD_MAP_VIRIDIAN_FOREST,
  ForestMapPreviewScreenIsRunning,
  GetDungeonMapPreviewScreenInfo,
  GetMapPreviewScreenIdx,
  MAPSEC_MT_MOON,
  MAPSEC_POWER_PLANT,
  MAPSEC_ROCKET_WAREHOUSE,
  MAPSEC_VIRIDIAN_FOREST,
  MPS_COUNT,
  MPS_TYPE_ANY,
  MPS_TYPE_CAVE,
  MPS_TYPE_FOREST,
  MapHasPreviewScreen,
  MapHasPreviewScreen_HandleQLState2,
  MapPreview_CreateMapNameWindow,
  MapPreview_GetDuration,
  MapPreview_InitBgs,
  MapPreview_IsGfxLoadFinished,
  MapPreview_LoadGfx,
  MapPreview_SetFlag,
  MapPreview_StartForestTransition,
  MapPreview_Unload,
  QL_STATE_PLAYBACK,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_WININ,
  REG_OFFSET_WINOUT,
  Task_RunMapPreviewScreenForest,
  WININ_WIN0_CLR,
  WININ_WIN1_CLR,
  WINOUT_WIN01_CLR,
  createMapPreviewRuntime,
  sMapPreviewScreenData,
} from '../src/game/decompMapPreviewScreen';

describe('decompMapPreviewScreen', () => {
  it('lookup helpers preserve MPS_COUNT fallback, type filtering, and quest-log gate', () => {
    const runtime = createMapPreviewRuntime();

    expect(sMapPreviewScreenData).toHaveLength(MPS_COUNT);
    expect(GetMapPreviewScreenIdx(MAPSEC_VIRIDIAN_FOREST)).toBe(0);
    expect(GetMapPreviewScreenIdx(255)).toBe(MPS_COUNT);
    expect(MapHasPreviewScreen(MAPSEC_MT_MOON, MPS_TYPE_CAVE)).toBe(true);
    expect(MapHasPreviewScreen(MAPSEC_MT_MOON, MPS_TYPE_FOREST)).toBe(false);
    expect(MapHasPreviewScreen(MAPSEC_MT_MOON, MPS_TYPE_ANY)).toBe(true);
    expect(MapHasPreviewScreen(255, MPS_TYPE_ANY)).toBe(false);

    expect(MapHasPreviewScreen_HandleQLState2(runtime, MAPSEC_MT_MOON, MPS_TYPE_ANY)).toBe(true);
    runtime.gQuestLogState = QL_STATE_PLAYBACK;
    expect(MapHasPreviewScreen_HandleQLState2(runtime, MAPSEC_MT_MOON, MPS_TYPE_ANY)).toBe(false);
  });

  it('MapPreview_InitBgs and LoadGfx match allocation and existing-buffer branches', () => {
    const runtime = createMapPreviewRuntime();

    MapPreview_InitBgs(runtime);
    expect(runtime.log.slice(-2)).toEqual(['InitBgsFromTemplates:0:1', 'ShowBg:0']);

    MapPreview_LoadGfx(runtime, MAPSEC_VIRIDIAN_FOREST);
    expect(runtime.sAllocedBg0TilemapBuffer).toBe(true);
    expect(runtime.bgTilemapBuffers[0]).toEqual({ size: 0x800 });
    expect(runtime.log).toContain('LoadPalette:graphics/map_preview/viridian_forest/tiles.gbapal:208:96');
    expect(runtime.log).toContain('DecompressAndCopyTileDataToVram:0:graphics/map_preview/viridian_forest/tiles.4bpp.lz:0:0:0');
    expect(runtime.log).toContain('CopyToBgTilemapBuffer:0:graphics/map_preview/viridian_forest/tilemap.bin.lz:0:0');

    MapPreview_LoadGfx(runtime, MAPSEC_MT_MOON);
    expect(runtime.sAllocedBg0TilemapBuffer).toBe(false);
    expect(runtime.log).toContain('CopyToBgTilemapBuffer:0:graphics/map_preview/mt_moon/tilemap.bin.lz:0:0');

    const logCount = runtime.log.length;
    MapPreview_LoadGfx(runtime, 255);
    expect(runtime.log).toHaveLength(logCount);
  });

  it('Unload frees only when this file allocated bg0 and gfx-finished helper returns temp-buffer status', () => {
    const runtime = createMapPreviewRuntime();
    runtime.windows.add(4);
    runtime.bgTilemapBuffers[0] = { size: 0x800 };
    runtime.sAllocedBg0TilemapBuffer = true;

    MapPreview_Unload(runtime, 4);
    expect(runtime.windows.has(4)).toBe(false);
    expect(runtime.bgTilemapBuffers[0]).toBeNull();
    expect(runtime.log.slice(-2)).toEqual(['RemoveWindow:4', 'Free:bg0TilemapBuffer']);

    runtime.sAllocedBg0TilemapBuffer = false;
    runtime.bgTilemapBuffers[0] = { external: true };
    runtime.windows.add(5);
    MapPreview_Unload(runtime, 5);
    expect(runtime.bgTilemapBuffers[0]).toEqual({ external: true });

    runtime.tempTileDataBusy = true;
    expect(MapPreview_IsGfxLoadFinished(runtime)).toBe(true);
  });

  it('CreateMapNameWindow reproduces text colors and centered x math', () => {
    const runtime = createMapPreviewRuntime();
    runtime.mapNames.set(MAPSEC_VIRIDIAN_FOREST, 'VIRIDIAN FOREST');
    runtime.stringWidths.set('VIRIDIAN FOREST', 84);

    const windowId = MapPreview_CreateMapNameWindow(runtime, MAPSEC_VIRIDIAN_FOREST);

    expect(windowId).toBe(0);
    expect(runtime.windows.has(0)).toBe(true);
    expect(runtime.log).toContain('FillWindowPixelBuffer:0:1');
    expect(runtime.log).toContain('PutWindowTilemap:0');
    expect(runtime.log).toContain('AddTextPrinterParameterized4:0:0:10:2:0:0:1,4,3:-1:VIRIDIAN FOREST');
  });

  it('duration and flag helper mirror cave flag checks and forest visited latch', () => {
    const runtime = createMapPreviewRuntime();

    expect(MapPreview_GetDuration(runtime, 255)).toBe(0);
    expect(MapPreview_GetDuration(runtime, MAPSEC_MT_MOON)).toBe(120);
    runtime.flags.add(FLAG_WORLD_MAP_MT_MOON_1F);
    expect(MapPreview_GetDuration(runtime, MAPSEC_MT_MOON)).toBe(40);

    expect(MapPreview_GetDuration(runtime, MAPSEC_POWER_PLANT)).toBe(40);
    MapPreview_SetFlag(runtime, FLAG_WORLD_MAP_POWER_PLANT);
    expect(runtime.sHasVisitedMapBefore).toBe(true);
    expect(runtime.flags.has(FLAG_WORLD_MAP_POWER_PLANT)).toBe(true);
    expect(MapPreview_GetDuration(runtime, MAPSEC_POWER_PLANT)).toBe(120);
    MapPreview_SetFlag(runtime, FLAG_WORLD_MAP_POWER_PLANT);
    expect(runtime.sHasVisitedMapBefore).toBe(false);
    expect(MapPreview_GetDuration(runtime, MAPSEC_POWER_PLANT)).toBe(40);
  });

  it('StartForestTransition snapshots registers, creates name window, sets blend/window bits, and locks controls', () => {
    const runtime = createMapPreviewRuntime();
    runtime.bgAttributes.set(`0:${BG_ATTR_PRIORITY}`, 3);
    runtime.gpuRegs.set(REG_OFFSET_DISPCNT, 0x1111);
    runtime.gpuRegs.set(REG_OFFSET_BLDCNT, 0x2222);
    runtime.gpuRegs.set(REG_OFFSET_BLDALPHA, 0x3333);
    runtime.gpuRegs.set(REG_OFFSET_WININ, 0x0001);
    runtime.gpuRegs.set(REG_OFFSET_WINOUT, 0x0002);
    runtime.mapNames.set(MAPSEC_VIRIDIAN_FOREST, 'FOREST');

    MapPreview_StartForestTransition(runtime, MAPSEC_VIRIDIAN_FOREST);

    expect(runtime.tasks).toHaveLength(1);
    const data = runtime.tasks[0].data;
    expect(data[2]).toBe(3);
    expect(data[3]).toBe(0x1111);
    expect(data[4]).toBe(0x2222);
    expect(data[5]).toBe(0x3333);
    expect(data[6]).toBe(0x0001);
    expect(data[7]).toBe(0x0002);
    expect(data[8]).toBe(16);
    expect(data[9]).toBe(0);
    expect(data[10]).toBe(40);
    expect(data[11]).toBe(0);
    expect(runtime.bgAttributes.get(`0:${BG_ATTR_PRIORITY}`)).toBe(0);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDCNT)).toBe(BLDCNT_TGT1_BG0 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_BG2 | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ | BLDCNT_TGT2_BD);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(16, 0));
    expect(runtime.gpuRegs.get(REG_OFFSET_WININ)).toBe(0x0001 | WININ_WIN0_CLR | WININ_WIN1_CLR);
    expect(runtime.gpuRegs.get(REG_OFFSET_WINOUT)).toBe(0x0002 | WINOUT_WIN01_CLR);
    expect(runtime.playerFieldControlsLocked).toBe(true);
    expect(ForestMapPreviewScreenIsRunning(runtime)).toBe(false);
  });

  it('forest task advances through blocking states, blend loop, cleanup, and restores saved registers', () => {
    const runtime = createMapPreviewRuntime();
    runtime.gpuRegs.set(REG_OFFSET_DISPCNT, 0x1111);
    runtime.gpuRegs.set(REG_OFFSET_BLDCNT, 0x2222);
    runtime.gpuRegs.set(REG_OFFSET_BLDALPHA, 0x3333);
    runtime.gpuRegs.set(REG_OFFSET_WININ, 0x4444);
    runtime.gpuRegs.set(REG_OFFSET_WINOUT, 0x5555);
    runtime.bgAttributes.set(`0:${BG_ATTR_PRIORITY}`, 6);
    runtime.sAllocedBg0TilemapBuffer = true;
    runtime.bgTilemapBuffers[0] = { size: 0x800 };
    MapPreview_StartForestTransition(runtime, MAPSEC_MT_MOON);
    const task = runtime.tasks[0];
    task.data[10] = 1;

    runtime.tempTileDataBusy = true;
    Task_RunMapPreviewScreenForest(runtime, 0);
    expect(task.data[0]).toBe(0);

    runtime.tempTileDataBusy = false;
    Task_RunMapPreviewScreenForest(runtime, 0);
    expect(task.data[0]).toBe(1);
    expect(runtime.log).toContain(`CopyWindowToVram:${task.data[11]}:${COPYWIN_FULL}`);

    runtime.dma3BusyWithBgCopy = true;
    Task_RunMapPreviewScreenForest(runtime, 0);
    expect(task.data[0]).toBe(1);

    runtime.dma3BusyWithBgCopy = false;
    Task_RunMapPreviewScreenForest(runtime, 0);
    expect(task.data[0]).toBe(2);
    expect(runtime.log).toContain('FadeInFromBlack');

    runtime.weatherNotFadingIn = false;
    Task_RunMapPreviewScreenForest(runtime, 0);
    expect(task.data[0]).toBe(2);

    runtime.weatherNotFadingIn = true;
    Task_RunMapPreviewScreenForest(runtime, 0);
    expect(task.data[0]).toBe(3);
    expect(runtime.log).toContain('Overworld_PlaySpecialMapMusic');

    Task_RunMapPreviewScreenForest(runtime, 0);
    expect(task.data[0]).toBe(3);
    Task_RunMapPreviewScreenForest(runtime, 0);
    expect(task.data[0]).toBe(4);
    expect(task.data[1]).toBe(0);

    for (let i = 0; i < 60 && task.data[0] !== 5; i += 1) {
      Task_RunMapPreviewScreenForest(runtime, 0);
    }
    expect(task.data[8]).toBe(0);
    expect(task.data[9]).toBe(16);
    expect(task.data[0]).toBe(5);
    expect(runtime.log).toContain('FillBgTilemapBufferRect_Palette0:0:0:0:0:32:32');

    runtime.dma3BusyWithBgCopy = true;
    Task_RunMapPreviewScreenForest(runtime, 0);
    expect(task.destroyed).toBe(false);

    runtime.dma3BusyWithBgCopy = false;
    Task_RunMapPreviewScreenForest(runtime, 0);
    expect(task.destroyed).toBe(true);
    expect(runtime.bgAttributes.get(`0:${BG_ATTR_PRIORITY}`)).toBe(6);
    expect(runtime.gpuRegs.get(REG_OFFSET_DISPCNT)).toBe(0x1111);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDCNT)).toBe(0x2222);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(0x3333);
    expect(runtime.gpuRegs.get(REG_OFFSET_WININ)).toBe(0x4444);
    expect(runtime.gpuRegs.get(REG_OFFSET_WINOUT)).toBe(0x5555);
    expect(runtime.bgTilemapBuffers[0]).toBeNull();
    expect(runtime.log.at(-1)).toBe('DestroyTask:0');
    expect(ForestMapPreviewScreenIsRunning(runtime)).toBe(true);
  });

  it('GetDungeonMapPreviewScreenInfo returns exact table entries and NULL fallback', () => {
    const rocketWarehouse = GetDungeonMapPreviewScreenInfo(MAPSEC_ROCKET_WAREHOUSE);

    expect(rocketWarehouse).toEqual(sMapPreviewScreenData[14]);
    expect(rocketWarehouse?.flagId).toBe(FLAG_WORLD_MAP_VIRIDIAN_FOREST + 0x13);
    expect(GetDungeonMapPreviewScreenInfo(250)).toBeNull();
  });
});
