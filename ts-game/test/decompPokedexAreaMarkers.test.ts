import { describe, expect, test } from 'vitest';
import {
  DEX_AREA_CINNABAR_ISLAND,
  DEX_AREA_NONE,
  DEX_AREA_ROUTE_12,
  DEX_AREA_ROUTE_20,
  DEX_AREA_ROUTE_25,
  DEX_AREA_TANOBY_CHAMBER,
  CreatePokedexAreaMarkers,
  DestroyPokedexAreaMarkers,
  GetAreaMarkerSubsprite,
  GetNumPokedexAreaMarkers,
  MARKER_CIRCULAR,
  TAG_NONE,
  Task_ShowAreaMarkers,
  createPokedexAreaMarkers,
  createPokedexAreaMarkersRuntime,
  destroyPokedexAreaMarkers,
  getAreaMarkerSubsprite,
  getNumPokedexAreaMarkers,
  getSpeciesPokedexAreaMarkers,
  sAreaMarkers,
  taskShowAreaMarkers
} from '../src/game/decompPokedexAreaMarkers';

describe('decomp pokedex_area_markers', () => {
  test('area marker table preserves marker type and signed coordinates from C', () => {
    expect(sAreaMarkers[DEX_AREA_NONE]).toEqual({ marker: MARKER_CIRCULAR, x: 0, y: 0 });
    expect(sAreaMarkers[DEX_AREA_CINNABAR_ISLAND]).toMatchObject({ x: 54, y: 62 });
    expect(sAreaMarkers[DEX_AREA_ROUTE_25]).toMatchObject({ x: 90, y: -2 });
    expect(sAreaMarkers[DEX_AREA_TANOBY_CHAMBER]).toMatchObject({ x: 96, y: 90 });
  });

  test('GetAreaMarkerSubsprite copies the correct subsprite template and position', () => {
    expect(getAreaMarkerSubsprite(DEX_AREA_ROUTE_12)).toEqual({
      size: '16x32',
      shape: '16x32',
      priority: 1,
      tileOffset: 13,
      x: 106,
      y: 25
    });
    expect(getAreaMarkerSubsprite(DEX_AREA_ROUTE_20)).toEqual({
      size: '32x16',
      shape: '32x16',
      priority: 1,
      tileOffset: 5,
      x: 55,
      y: 58
    });
  });

  test('species marker resolver filters DEX_AREA_NONE and converts areas to subsprites', () => {
    const runtime = createPokedexAreaMarkersRuntime();
    runtime.speciesMarkerAreas.set(25, [DEX_AREA_NONE, DEX_AREA_ROUTE_12, DEX_AREA_ROUTE_25]);

    const subsprites = getSpeciesPokedexAreaMarkers(runtime, 25);

    expect(subsprites).toHaveLength(2);
    expect(subsprites[0].x).toBe(106);
    expect(subsprites[1].y).toBe(-2);
  });

  test('CreatePokedexAreaMarkers records graphics loads, GPU state, sprite, and hidden marker task', () => {
    const runtime = createPokedexAreaMarkersRuntime();
    runtime.speciesMarkerAreas.set(150, [DEX_AREA_ROUTE_12, DEX_AREA_ROUTE_20]);

    const taskId = createPokedexAreaMarkers(runtime, 150, 0x1234, 7, 20);

    expect(taskId).toBe(0);
    expect(runtime.compressedSpriteSheets).toEqual([{ size: 0x4a0, tag: 0x1234 }]);
    expect(runtime.paletteLoads).toEqual([{ source: 'sMarkerPal', paletteId: 7, size: 16 }]);
    expect(runtime.tasks[taskId].data.tilesTag).toBe(0x1234);
    expect(runtime.tasks[taskId].data.paletteTag).toBe(TAG_NONE);
    expect(getNumPokedexAreaMarkers(runtime, taskId)).toBe(2);
    expect(runtime.sprites[0]).toMatchObject({
      x: 104,
      y: 52,
      tileTag: 0x1234,
      paletteNum: 7,
      objMode: 'window',
      invisible: true
    });
    expect(runtime.gpuRegs.BLDALPHA).toBe((12 << 8) | 8);
    expect(runtime.hiddenBgs).toEqual([1]);
    expect(runtime.shownBgs).toEqual([1]);
  });

  test('Task_ShowAreaMarkers reveals the sprite and DestroyPokedexAreaMarkers restores GPU/BG state', () => {
    const runtime = createPokedexAreaMarkersRuntime();
    runtime.speciesMarkerAreas.set(1, [DEX_AREA_ROUTE_12]);
    const taskId = createPokedexAreaMarkers(runtime, 1, 0xbeef, 3, 8);

    taskShowAreaMarkers(runtime, taskId);
    expect(runtime.sprites[0].invisible).toBe(false);

    destroyPokedexAreaMarkers(runtime, taskId);
    expect(runtime.freedSpriteTileTags).toEqual([0xbeef]);
    expect(runtime.sprites[0].invisible).toBe(true);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.tasks[taskId].data.buffer).toEqual([]);
    expect(runtime.gpuRegs.BLDCNT).toBe(0);
    expect(runtime.gpuRegs.BLDALPHA).toBe(0);
    expect(runtime.bgAttributes.at(-1)).toEqual({ bg: 1, attr: 'BG_ATTR_CHARBASEINDEX', value: 2 });
    expect(runtime.bgFills.at(-1)).toMatchObject({ bg: 1, value: 0x000, width: 30, height: 20 });
  });

  test('exact C-name entry points mirror create, reveal, subsprite, count, and destroy behavior', () => {
    const runtime = createPokedexAreaMarkersRuntime();
    runtime.speciesMarkerAreas.set(7, [DEX_AREA_ROUTE_12, DEX_AREA_ROUTE_20]);
    const taskId = CreatePokedexAreaMarkers(runtime, 7, 0x2222, 4, 10);
    const subsprites = [] as ReturnType<typeof getAreaMarkerSubsprite>[];

    GetAreaMarkerSubsprite(0, DEX_AREA_ROUTE_25, subsprites);
    expect(subsprites[0]).toEqual(getAreaMarkerSubsprite(DEX_AREA_ROUTE_25));
    expect(GetNumPokedexAreaMarkers(runtime, taskId)).toBe(2);

    Task_ShowAreaMarkers(runtime, taskId);
    expect(runtime.sprites[0].invisible).toBe(false);

    DestroyPokedexAreaMarkers(runtime, taskId);
    expect(runtime.freedSpriteTileTags).toEqual([0x2222]);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });
});
