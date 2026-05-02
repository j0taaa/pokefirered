import { describe, expect, test } from 'vitest';
import * as fieldCamera from '../src/game/decompFieldCamera';
import {
  DIR_NORTH,
  DIR_SOUTH,
  METATILE_LAYER_TYPE_COVERED,
  METATILE_LAYER_TYPE_NORMAL,
  METATILE_LAYER_TYPE_SPLIT,
  NUM_METATILES_IN_PRIMARY,
  REG_OFFSET_BG1HOFS,
  REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2HOFS,
  REG_OFFSET_BG2VOFS,
  REG_OFFSET_BG3HOFS,
  REG_OFFSET_BG3VOFS,
  cameraPanningCBPanAhead,
  cameraUpdate,
  cameraUpdateNoObjectRefresh,
  coords8Add,
  createFieldCameraRuntime,
  currentMapDrawMetatileAt,
  drawDoorMetatileAt,
  drawMetatile,
  drawMetatileAt,
  drawWholeMapView,
  fieldCameraGetPixelOffsetAtGround,
  fieldUpdateBgTilemapScroll,
  initCameraUpdateCallback,
  installCameraPanAheadCallback,
  mapPosToBgTilemapOffset,
  moveCameraAndRedrawMap,
  moveTilemapCameraToUpperLeftCorner,
  redrawMapSlicesForCameraUpdate,
  resetCameraUpdateInfo,
  setCameraPanning,
  setCameraPanningCallback,
  tilemapMoveSomething,
  updateCameraPanning
} from '../src/game/decompFieldCamera';

describe('decomp field_camera', () => {
  test('exports exact C camera names as aliases of the implemented logic', () => {
    expect(fieldCamera.move_tilemap_camera_to_upper_left_corner_).toBe(fieldCamera.moveTilemapCameraToUpperLeftCornerInternal);
    expect(fieldCamera.tilemap_move_something).toBe(fieldCamera.tilemapMoveSomething);
    expect(fieldCamera.coords8_add).toBe(fieldCamera.coords8Add);
    expect(fieldCamera.move_tilemap_camera_to_upper_left_corner).toBe(fieldCamera.moveTilemapCameraToUpperLeftCorner);
    expect(fieldCamera.FieldUpdateBgTilemapScroll).toBe(fieldCamera.fieldUpdateBgTilemapScroll);
    expect(fieldCamera.FieldCameraGetPixelOffsetAtGround).toBe(fieldCamera.fieldCameraGetPixelOffsetAtGround);
    expect(fieldCamera.DrawWholeMapView).toBe(fieldCamera.drawWholeMapView);
    expect(fieldCamera.DrawWholeMapViewInternal).toBe(fieldCamera.drawWholeMapViewInternal);
    expect(fieldCamera.RedrawMapSlicesForCameraUpdate).toBe(fieldCamera.redrawMapSlicesForCameraUpdate);
    expect(fieldCamera.RedrawMapSliceNorth).toBe(fieldCamera.redrawMapSliceNorth);
    expect(fieldCamera.RedrawMapSliceSouth).toBe(fieldCamera.redrawMapSliceSouth);
    expect(fieldCamera.RedrawMapSliceEast).toBe(fieldCamera.redrawMapSliceEast);
    expect(fieldCamera.RedrawMapSliceWest).toBe(fieldCamera.redrawMapSliceWest);
    expect(fieldCamera.CurrentMapDrawMetatileAt).toBe(fieldCamera.currentMapDrawMetatileAt);
    expect(fieldCamera.DrawDoorMetatileAt).toBe(fieldCamera.drawDoorMetatileAt);
    expect(fieldCamera.DrawMetatileAt).toBe(fieldCamera.drawMetatileAt);
    expect(fieldCamera.DrawMetatile).toBe(fieldCamera.drawMetatile);
    expect(fieldCamera.MapPosToBgTilemapOffset).toBe(fieldCamera.mapPosToBgTilemapOffset);
    expect(fieldCamera.CameraUpdateCallback).toBe(fieldCamera.cameraUpdateCallback);
    expect(fieldCamera.ResetCameraUpdateInfo).toBe(fieldCamera.resetCameraUpdateInfo);
    expect(fieldCamera.InitCameraUpdateCallback).toBe(fieldCamera.initCameraUpdateCallback);
    expect(fieldCamera.CameraUpdate).toBe(fieldCamera.cameraUpdate);
    expect(fieldCamera.MoveCameraAndRedrawMap).toBe(fieldCamera.moveCameraAndRedrawMap);
    expect(fieldCamera.CameraUpdateNoObjectRefresh).toBe(fieldCamera.cameraUpdateNoObjectRefresh);
    expect(fieldCamera.SetCameraPanningCallback).toBe(fieldCamera.setCameraPanningCallback);
    expect(fieldCamera.SetCameraPanning).toBe(fieldCamera.setCameraPanning);
    expect(fieldCamera.InstallCameraPanAheadCallback).toBe(fieldCamera.installCameraPanAheadCallback);
    expect(fieldCamera.UpdateCameraPanning).toBe(fieldCamera.updateCameraPanning);
    expect(fieldCamera.CameraPanningCB_PanAhead).toBe(fieldCamera.cameraPanningCBPanAhead);
  });

  test('tilemap offset reset, movement, pixel add, GPU scroll, and ground pixel offset mirror globals', () => {
    const runtime = createFieldCameraRuntime();
    runtime.sFieldCameraOffset = { xPixelOffset: 250, yPixelOffset: 3, xTileOffset: 31, yTileOffset: 1, copyBGToVRAM: false };

    tilemapMoveSomething(runtime.sFieldCameraOffset, 2, -2);
    expect(runtime.sFieldCameraOffset.xTileOffset).toBe(1);
    expect(runtime.sFieldCameraOffset.yTileOffset).toBe(31);

    coords8Add(runtime.sFieldCameraOffset, 10, -5);
    expect(runtime.sFieldCameraOffset.xPixelOffset).toBe(4);
    expect(runtime.sFieldCameraOffset.yPixelOffset).toBe(254);

    setCameraPanning(runtime, 7, -4);
    expect(runtime.sHorizontalCameraPan).toBe(7);
    expect(runtime.sVerticalCameraPan).toBe(28);
    expect(fieldCameraGetPixelOffsetAtGround(runtime)).toEqual({ hofs: 11, vofs: 290 });

    fieldUpdateBgTilemapScroll(runtime);
    expect(runtime.gpuRegs[REG_OFFSET_BG1HOFS]).toBe(11);
    expect(runtime.gpuRegs[REG_OFFSET_BG1VOFS]).toBe(290);
    expect(runtime.gpuRegs[REG_OFFSET_BG2HOFS]).toBe(11);
    expect(runtime.gpuRegs[REG_OFFSET_BG2VOFS]).toBe(290);
    expect(runtime.gpuRegs[REG_OFFSET_BG3HOFS]).toBe(11);
    expect(runtime.gpuRegs[REG_OFFSET_BG3VOFS]).toBe(290);

    moveTilemapCameraToUpperLeftCorner(runtime);
    expect(runtime.sFieldCameraOffset).toEqual({ xPixelOffset: 0, yPixelOffset: 0, xTileOffset: 0, yTileOffset: 0, copyBGToVRAM: true });
  });

  test('DrawMetatile writes split, covered, and normal layer arrangements and schedules all BG copies', () => {
    const runtime = createFieldCameraRuntime();
    const tiles = [1, 2, 3, 4, 5, 6, 7, 8];

    drawMetatile(runtime, METATILE_LAYER_TYPE_SPLIT, tiles, 10);
    expect([runtime.gBGTilemapBuffers3[10], runtime.gBGTilemapBuffers3[11], runtime.gBGTilemapBuffers3[42], runtime.gBGTilemapBuffers3[43]]).toEqual([1, 2, 3, 4]);
    expect([runtime.gBGTilemapBuffers1[10], runtime.gBGTilemapBuffers1[11], runtime.gBGTilemapBuffers1[42], runtime.gBGTilemapBuffers1[43]]).toEqual([0, 0, 0, 0]);
    expect([runtime.gBGTilemapBuffers2[10], runtime.gBGTilemapBuffers2[11], runtime.gBGTilemapBuffers2[42], runtime.gBGTilemapBuffers2[43]]).toEqual([5, 6, 7, 8]);

    drawMetatile(runtime, METATILE_LAYER_TYPE_COVERED, tiles, 20);
    expect([runtime.gBGTilemapBuffers3[20], runtime.gBGTilemapBuffers3[21], runtime.gBGTilemapBuffers3[52], runtime.gBGTilemapBuffers3[53]]).toEqual([1, 2, 3, 4]);
    expect([runtime.gBGTilemapBuffers1[20], runtime.gBGTilemapBuffers1[21], runtime.gBGTilemapBuffers1[52], runtime.gBGTilemapBuffers1[53]]).toEqual([5, 6, 7, 8]);
    expect([runtime.gBGTilemapBuffers2[20], runtime.gBGTilemapBuffers2[21], runtime.gBGTilemapBuffers2[52], runtime.gBGTilemapBuffers2[53]]).toEqual([0, 0, 0, 0]);

    drawMetatile(runtime, METATILE_LAYER_TYPE_NORMAL, tiles, 30);
    expect([runtime.gBGTilemapBuffers3[30], runtime.gBGTilemapBuffers3[31], runtime.gBGTilemapBuffers3[62], runtime.gBGTilemapBuffers3[63]]).toEqual([0x3014, 0x3014, 0x3014, 0x3014]);
    expect([runtime.gBGTilemapBuffers1[30], runtime.gBGTilemapBuffers1[31], runtime.gBGTilemapBuffers1[62], runtime.gBGTilemapBuffers1[63]]).toEqual([1, 2, 3, 4]);
    expect([runtime.gBGTilemapBuffers2[30], runtime.gBGTilemapBuffers2[31], runtime.gBGTilemapBuffers2[62], runtime.gBGTilemapBuffers2[63]]).toEqual([5, 6, 7, 8]);
    expect(runtime.calls.slice(-3).map((call) => call.args[0])).toEqual([1, 2, 3]);
  });

  test('DrawMetatileAt picks primary, secondary, and overflow metatile sources exactly', () => {
    const runtime = createFieldCameraRuntime();
    runtime.metatileIds['2,3'] = 5;
    runtime.metatileLayerTypes['2,3'] = METATILE_LAYER_TYPE_NORMAL;
    drawMetatileAt(runtime, runtime.gMapHeader.mapLayout, 100, 2, 3);
    expect(runtime.gBGTilemapBuffers1[100]).toBe(5 * 8);

    runtime.metatileIds['4,5'] = NUM_METATILES_IN_PRIMARY + 2;
    runtime.metatileLayerTypes['4,5'] = METATILE_LAYER_TYPE_COVERED;
    drawMetatileAt(runtime, runtime.gMapHeader.mapLayout, 200, 4, 5);
    expect(runtime.gBGTilemapBuffers3[200]).toBe(10000 + 2 * 8);

    runtime.metatileIds['6,7'] = 5000;
    runtime.metatileLayerTypes['6,7'] = METATILE_LAYER_TYPE_SPLIT;
    drawMetatileAt(runtime, runtime.gMapHeader.mapLayout, 300, 6, 7);
    expect(runtime.gBGTilemapBuffers3[300]).toBe(0);
  });

  test('map position conversion and direct draw helpers ignore out-of-view coordinates', () => {
    const runtime = createFieldCameraRuntime();
    runtime.gSaveBlock1Ptr.pos = { x: 10, y: 20 };
    runtime.sFieldCameraOffset.xTileOffset = 30;
    runtime.sFieldCameraOffset.yTileOffset = 28;
    runtime.metatileIds['11,21'] = 1;

    expect(mapPosToBgTilemapOffset(runtime, runtime.sFieldCameraOffset, 11, 21)).toBe(960);
    expect(mapPosToBgTilemapOffset(runtime, runtime.sFieldCameraOffset, 9, 21)).toBe(-1);
    expect(mapPosToBgTilemapOffset(runtime, runtime.sFieldCameraOffset, 26, 21)).toBe(-1);

    currentMapDrawMetatileAt(runtime, 9, 21);
    expect(runtime.calls).toHaveLength(0);
    currentMapDrawMetatileAt(runtime, 11, 21);
    expect(runtime.calls.slice(-3).map((call) => call.args[0])).toEqual([1, 2, 3]);

    drawDoorMetatileAt(runtime, 11, 21, [90, 91, 92, 93, 94, 95, 96, 97]);
    expect(runtime.gBGTilemapBuffers1[960]).toBe(94);
  });

  test('whole map and directional slice redraws use wrapped tile offsets and save-block positions', () => {
    const runtime = createFieldCameraRuntime();
    runtime.sFieldCameraOffset.xTileOffset = 30;
    runtime.sFieldCameraOffset.yTileOffset = 30;
    runtime.gSaveBlock1Ptr.pos = { x: 100, y: 200 };
    runtime.metatileIds['100,200'] = 2;

    drawWholeMapView(runtime);
    expect(runtime.gBGTilemapBuffers1[990]).toBe(2 * 8);

    runtime.calls = [];
    redrawMapSlicesForCameraUpdate(runtime, runtime.sFieldCameraOffset, 2, -2);
    expect(runtime.sFieldCameraOffset.copyBGToVRAM).toBe(true);
    expect(runtime.calls.filter((call) => call.fn === 'ScheduleBgCopyTilemapToVram')).toHaveLength(96);
    expect(runtime.gBGTilemapBuffers1[26]).toBeDefined();
  });

  test('camera update callback setup destroys an old sprite and tracks sprite data movement speeds', () => {
    const runtime = createFieldCameraRuntime();
    runtime.gFieldCamera.spriteId = 4;
    runtime.gSprites[4].data[2] = 99;

    expect(initCameraUpdateCallback(runtime, 6)).toBe(0);
    expect(runtime.gSprites[4].destroyed).toBe(true);
    expect(runtime.gFieldCamera).toMatchObject({ spriteId: 7, callback: 'CameraUpdateCallback' });

    runtime.gSprites[7].data[2] = 3;
    runtime.gSprites[7].data[3] = -2;
    cameraUpdate(runtime);
    expect(runtime.gFieldCamera.movementSpeedX).toBe(3);
    expect(runtime.gFieldCamera.movementSpeedY).toBe(-2);

    resetCameraUpdateInfo(runtime);
    expect(runtime.gFieldCamera).toEqual({ callback: null, spriteId: 0, movementSpeedX: 0, movementSpeedY: 0, x: 0, y: 0 });
  });

  test('CameraUpdate preserves tile redraw, object refresh, totals, u8 pixel offsets, and the decompiled Y-boundary deltaX bug', () => {
    const runtime = createFieldCameraRuntime();
    runtime.gFieldCamera.movementSpeedY = 2;
    runtime.gFieldCamera.y = -2;
    runtime.gTotalCameraPixelOffsetX = 5;
    runtime.gTotalCameraPixelOffsetY = 5;

    cameraUpdate(runtime);

    expect(runtime.calls.find((call) => call.fn === 'CameraMove')).toEqual({ fn: 'CameraMove', args: [1, 0] });
    expect(runtime.calls.find((call) => call.fn === 'UpdateObjectEventsForCameraUpdate')).toEqual({ fn: 'UpdateObjectEventsForCameraUpdate', args: [1, 0] });
    expect(runtime.sFieldCameraOffset.xTileOffset).toBe(2);
    expect(runtime.sFieldCameraOffset.yTileOffset).toBe(0);
    expect(runtime.sFieldCameraOffset.yPixelOffset).toBe(2);
    expect(runtime.gTotalCameraPixelOffsetX).toBe(5);
    expect(runtime.gTotalCameraPixelOffsetY).toBe(3);
  });

  test('CameraUpdateNoObjectRefresh omits object refresh and total offset updates while still moving/redrawing', () => {
    const runtime = createFieldCameraRuntime();
    runtime.gFieldCamera.movementSpeedX = -1;
    runtime.gFieldCamera.x = 0;
    runtime.gTotalCameraPixelOffsetX = 10;
    runtime.gTotalCameraPixelOffsetY = 10;

    cameraUpdateNoObjectRefresh(runtime);

    expect(runtime.calls.find((call) => call.fn === 'CameraMove')).toEqual({ fn: 'CameraMove', args: [-1, 0] });
    expect(runtime.calls.some((call) => call.fn === 'UpdateObjectEventsForCameraUpdate')).toBe(false);
    expect(runtime.gTotalCameraPixelOffsetX).toBe(10);
    expect(runtime.gTotalCameraPixelOffsetY).toBe(10);
    expect(runtime.sFieldCameraOffset.xPixelOffset).toBe(255);
  });

  test('MoveCameraAndRedrawMap calls camera/object update, redraws view, and adjusts totals by 16 pixels per tile', () => {
    const runtime = createFieldCameraRuntime();
    runtime.gTotalCameraPixelOffsetX = 100;
    runtime.gTotalCameraPixelOffsetY = 100;

    moveCameraAndRedrawMap(runtime, 2, -1);

    expect(runtime.calls[0]).toEqual({ fn: 'CameraMove', args: [2, -1] });
    expect(runtime.calls[1]).toEqual({ fn: 'UpdateObjectEventsForCameraUpdate', args: [2, -1] });
    expect(runtime.gTotalCameraPixelOffsetX).toBe(68);
    expect(runtime.gTotalCameraPixelOffsetY).toBe(116);
    expect(runtime.calls.some((call) => call.fn === 'ScheduleBgCopyTilemapToVram')).toBe(true);
  });

  test('camera panning callbacks match install, manual callback, pan ahead, recenter, and sprite coord offset logic', () => {
    const runtime = createFieldCameraRuntime();

    setCameraPanningCallback(runtime, 'Custom');
    updateCameraPanning(runtime);
    expect(runtime.calls.at(-1)).toEqual({ fn: 'CustomCameraPanningCallback', args: [] });

    installCameraPanAheadCallback(runtime);
    expect(runtime.sFieldCameraPanningCallback).toBe('CameraPanningCB_PanAhead');
    expect(runtime.sVerticalCameraPan).toBe(32);

    runtime.gBikeCameraAheadPanback = false;
    runtime.sVerticalCameraPan = 99;
    cameraPanningCBPanAhead(runtime);
    expect(runtime.sVerticalCameraPan).toBe(32);

    runtime.gBikeCameraAheadPanback = true;
    runtime.gPlayerAvatar.tileTransitionState = 1;
    runtime.playerMovementDirection = DIR_NORTH;
    cameraPanningCBPanAhead(runtime);
    expect(runtime.sBikeCameraPanFlag).toBe(1);
    expect(runtime.sVerticalCameraPan).toBe(30);
    cameraPanningCBPanAhead(runtime);
    expect(runtime.sBikeCameraPanFlag).toBe(0);
    expect(runtime.sVerticalCameraPan).toBe(30);

    runtime.gPlayerAvatar.tileTransitionState = 0;
    runtime.playerMovementDirection = DIR_SOUTH;
    cameraPanningCBPanAhead(runtime);
    expect(runtime.sBikeCameraPanFlag).toBe(0);
    expect(runtime.sVerticalCameraPan).toBe(32);

    runtime.sVerticalCameraPan = 28;
    runtime.playerMovementDirection = 0;
    cameraPanningCBPanAhead(runtime);
    expect(runtime.sVerticalCameraPan).toBe(30);

    runtime.gTotalCameraPixelOffsetX = 12;
    runtime.gTotalCameraPixelOffsetY = 80;
    updateCameraPanning(runtime);
    expect(runtime.gSpriteCoordOffsetX).toBe(12);
    expect(runtime.gSpriteCoordOffsetY).toBe(40);
  });
});
