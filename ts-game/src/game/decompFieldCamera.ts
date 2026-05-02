export const NUM_METATILES_IN_PRIMARY = 640;
export const NUM_METATILES_TOTAL = 1024;
export const NUM_TILES_PER_METATILE = 8;

export const METATILE_LAYER_TYPE_NORMAL = 0;
export const METATILE_LAYER_TYPE_COVERED = 1;
export const METATILE_LAYER_TYPE_SPLIT = 2;

export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;

export const REG_OFFSET_BG1HOFS = 'REG_OFFSET_BG1HOFS';
export const REG_OFFSET_BG1VOFS = 'REG_OFFSET_BG1VOFS';
export const REG_OFFSET_BG2HOFS = 'REG_OFFSET_BG2HOFS';
export const REG_OFFSET_BG2VOFS = 'REG_OFFSET_BG2VOFS';
export const REG_OFFSET_BG3HOFS = 'REG_OFFSET_BG3HOFS';
export const REG_OFFSET_BG3VOFS = 'REG_OFFSET_BG3VOFS';

export interface FieldCameraOffset {
  xPixelOffset: number;
  yPixelOffset: number;
  xTileOffset: number;
  yTileOffset: number;
  copyBGToVRAM: boolean;
}

export interface CameraObject {
  callback: 'CameraUpdateCallback' | null;
  spriteId: number;
  movementSpeedX: number;
  movementSpeedY: number;
  x: number;
  y: number;
}

export interface FieldCameraTileset {
  metatiles: number[];
}

export interface FieldCameraMapLayout {
  primaryTileset: FieldCameraTileset;
  secondaryTileset: FieldCameraTileset;
}

export interface FieldCameraRuntime {
  gBikeCameraAheadPanback: boolean;
  sFieldCameraOffset: FieldCameraOffset;
  sHorizontalCameraPan: number;
  sVerticalCameraPan: number;
  sBikeCameraPanFlag: number;
  sFieldCameraPanningCallback: 'CameraPanningCB_PanAhead' | 'Custom' | null;
  gFieldCamera: CameraObject;
  gTotalCameraPixelOffsetY: number;
  gTotalCameraPixelOffsetX: number;
  gSpriteCoordOffsetX: number;
  gSpriteCoordOffsetY: number;
  gPlayerAvatar: { tileTransitionState: number };
  playerMovementDirection: number;
  gSaveBlock1Ptr: { pos: { x: number; y: number } };
  gMapHeader: { mapLayout: FieldCameraMapLayout };
  gSprites: Array<{ data: number[]; destroyed: boolean }>;
  gBGTilemapBuffers1: number[];
  gBGTilemapBuffers2: number[];
  gBGTilemapBuffers3: number[];
  metatileIds: Record<string, number>;
  metatileLayerTypes: Record<string, number>;
  gpuRegs: Record<string, number>;
  calls: Array<{ fn: string; args: unknown[] }>;
}

const u8 = (value: number): number => value & 0xff;
const u16 = (value: number): number => value & 0xffff;
const cDiv = (left: number, right: number): number => Math.trunc(left / right);
const mod32 = (value: number): number => ((value % 32) + 32) % 32;
const coordKey = (x: number, y: number): string => `${x},${y}`;

export const createFieldCameraRuntime = (): FieldCameraRuntime => ({
  gBikeCameraAheadPanback: false,
  sFieldCameraOffset: { xPixelOffset: 0, yPixelOffset: 0, xTileOffset: 0, yTileOffset: 0, copyBGToVRAM: false },
  sHorizontalCameraPan: 0,
  sVerticalCameraPan: 0,
  sBikeCameraPanFlag: 0,
  sFieldCameraPanningCallback: null,
  gFieldCamera: { callback: null, spriteId: 0, movementSpeedX: 0, movementSpeedY: 0, x: 0, y: 0 },
  gTotalCameraPixelOffsetY: 0,
  gTotalCameraPixelOffsetX: 0,
  gSpriteCoordOffsetX: 0,
  gSpriteCoordOffsetY: 0,
  gPlayerAvatar: { tileTransitionState: 0 },
  playerMovementDirection: DIR_SOUTH,
  gSaveBlock1Ptr: { pos: { x: 0, y: 0 } },
  gMapHeader: {
    mapLayout: {
      primaryTileset: { metatiles: Array.from({ length: NUM_METATILES_IN_PRIMARY * NUM_TILES_PER_METATILE }, (_, i) => i) },
      secondaryTileset: { metatiles: Array.from({ length: (NUM_METATILES_TOTAL - NUM_METATILES_IN_PRIMARY) * NUM_TILES_PER_METATILE }, (_, i) => 10000 + i) }
    }
  },
  gSprites: Array.from({ length: 64 }, () => ({ data: [0, 0, 0, 0], destroyed: false })),
  gBGTilemapBuffers1: Array.from({ length: 32 * 32 }, () => 0),
  gBGTilemapBuffers2: Array.from({ length: 32 * 32 }, () => 0),
  gBGTilemapBuffers3: Array.from({ length: 32 * 32 }, () => 0),
  metatileIds: {},
  metatileLayerTypes: {},
  gpuRegs: {},
  calls: []
});

const call = (runtime: FieldCameraRuntime, fn: string, ...args: unknown[]): void => {
  runtime.calls.push({ fn, args });
};

const setGpuReg = (runtime: FieldCameraRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = u16(value);
  call(runtime, 'SetGpuReg', reg, u16(value));
};

const mapGridGetMetatileIdAt = (runtime: FieldCameraRuntime, x: number, y: number): number =>
  runtime.metatileIds[coordKey(x, y)] ?? 0;

const mapGridGetMetatileLayerTypeAt = (runtime: FieldCameraRuntime, x: number, y: number): number =>
  runtime.metatileLayerTypes[coordKey(x, y)] ?? METATILE_LAYER_TYPE_NORMAL;

const scheduleBgCopyTilemapToVram = (runtime: FieldCameraRuntime, bg: number): void => {
  call(runtime, 'ScheduleBgCopyTilemapToVram', bg);
};

const cameraMove = (runtime: FieldCameraRuntime, x: number, y: number): void => {
  call(runtime, 'CameraMove', x, y);
};

const updateObjectEventsForCameraUpdate = (runtime: FieldCameraRuntime, x: number, y: number): void => {
  call(runtime, 'UpdateObjectEventsForCameraUpdate', x, y);
};

const addCameraObject = (runtime: FieldCameraRuntime, trackedSpriteId: number): number => {
  call(runtime, 'AddCameraObject', trackedSpriteId);
  return trackedSpriteId + 1;
};

const destroySprite = (runtime: FieldCameraRuntime, spriteId: number): void => {
  runtime.gSprites[spriteId].destroyed = true;
  call(runtime, 'DestroySprite', spriteId);
};

export const moveTilemapCameraToUpperLeftCornerInternal = (cameraOffset: FieldCameraOffset): void => {
  cameraOffset.xTileOffset = 0;
  cameraOffset.yTileOffset = 0;
  cameraOffset.xPixelOffset = 0;
  cameraOffset.yPixelOffset = 0;
  cameraOffset.copyBGToVRAM = true;
};

export const tilemapMoveSomething = (cameraOffset: FieldCameraOffset, b: number, c: number): void => {
  cameraOffset.xTileOffset = mod32(cameraOffset.xTileOffset + b);
  cameraOffset.yTileOffset = mod32(cameraOffset.yTileOffset + c);
};

export const coords8Add = (cameraOffset: FieldCameraOffset, b: number, c: number): void => {
  cameraOffset.xPixelOffset = u8(cameraOffset.xPixelOffset + b);
  cameraOffset.yPixelOffset = u8(cameraOffset.yPixelOffset + c);
};

export const moveTilemapCameraToUpperLeftCorner = (runtime: FieldCameraRuntime): void => {
  moveTilemapCameraToUpperLeftCornerInternal(runtime.sFieldCameraOffset);
};

export const fieldUpdateBgTilemapScroll = (runtime: FieldCameraRuntime): void => {
  const r5 = runtime.sFieldCameraOffset.xPixelOffset + runtime.sHorizontalCameraPan;
  const r4 = runtime.sVerticalCameraPan + runtime.sFieldCameraOffset.yPixelOffset + 8;

  setGpuReg(runtime, REG_OFFSET_BG1HOFS, r5);
  setGpuReg(runtime, REG_OFFSET_BG1VOFS, r4);
  setGpuReg(runtime, REG_OFFSET_BG2HOFS, r5);
  setGpuReg(runtime, REG_OFFSET_BG2VOFS, r4);
  setGpuReg(runtime, REG_OFFSET_BG3HOFS, r5);
  setGpuReg(runtime, REG_OFFSET_BG3VOFS, r4);
};

export const fieldCameraGetPixelOffsetAtGround = (runtime: FieldCameraRuntime): { hofs: number; vofs: number } => ({
  hofs: runtime.sFieldCameraOffset.xPixelOffset + runtime.sHorizontalCameraPan,
  vofs: runtime.sFieldCameraOffset.yPixelOffset + runtime.sVerticalCameraPan + 8
});

export const drawWholeMapView = (runtime: FieldCameraRuntime): void => {
  drawWholeMapViewInternal(runtime, runtime.gSaveBlock1Ptr.pos.x, runtime.gSaveBlock1Ptr.pos.y, runtime.gMapHeader.mapLayout);
};

export const drawWholeMapViewInternal = (
  runtime: FieldCameraRuntime,
  x: number,
  y: number,
  mapLayout: FieldCameraMapLayout
): void => {
  for (let i = 0; i < 32; i += 2) {
    let temp = runtime.sFieldCameraOffset.yTileOffset + i;
    if (temp >= 32) {
      temp -= 32;
    }
    const r6 = temp * 32;
    for (let j = 0; j < 32; j += 2) {
      temp = runtime.sFieldCameraOffset.xTileOffset + j;
      if (temp >= 32) {
        temp -= 32;
      }
      drawMetatileAt(runtime, mapLayout, r6 + temp, x + j / 2, y + i / 2);
    }
  }
};

export const redrawMapSlicesForCameraUpdate = (
  runtime: FieldCameraRuntime,
  cameraOffset: FieldCameraOffset,
  x: number,
  y: number
): void => {
  const mapLayout = runtime.gMapHeader.mapLayout;
  if (x > 0) {
    redrawMapSliceWest(runtime, cameraOffset, mapLayout);
  }
  if (x < 0) {
    redrawMapSliceEast(runtime, cameraOffset, mapLayout);
  }
  if (y > 0) {
    redrawMapSliceNorth(runtime, cameraOffset, mapLayout);
  }
  if (y < 0) {
    redrawMapSliceSouth(runtime, cameraOffset, mapLayout);
  }
  cameraOffset.copyBGToVRAM = true;
};

export const redrawMapSliceNorth = (
  runtime: FieldCameraRuntime,
  cameraOffset: FieldCameraOffset,
  mapLayout: FieldCameraMapLayout
): void => {
  let temp = cameraOffset.yTileOffset + 28;
  if (temp >= 32) {
    temp -= 32;
  }
  const r7 = temp * 32;
  for (let i = 0; i < 32; i += 2) {
    temp = cameraOffset.xTileOffset + i;
    if (temp >= 32) {
      temp -= 32;
    }
    drawMetatileAt(runtime, mapLayout, r7 + temp, runtime.gSaveBlock1Ptr.pos.x + i / 2, runtime.gSaveBlock1Ptr.pos.y + 14);
  }
};

export const redrawMapSliceSouth = (
  runtime: FieldCameraRuntime,
  cameraOffset: FieldCameraOffset,
  mapLayout: FieldCameraMapLayout
): void => {
  const r7 = cameraOffset.yTileOffset * 32;
  for (let i = 0; i < 32; i += 2) {
    let temp = cameraOffset.xTileOffset + i;
    if (temp >= 32) {
      temp -= 32;
    }
    drawMetatileAt(runtime, mapLayout, r7 + temp, runtime.gSaveBlock1Ptr.pos.x + i / 2, runtime.gSaveBlock1Ptr.pos.y);
  }
};

export const redrawMapSliceEast = (
  runtime: FieldCameraRuntime,
  cameraOffset: FieldCameraOffset,
  mapLayout: FieldCameraMapLayout
): void => {
  const r6 = cameraOffset.xTileOffset;
  for (let i = 0; i < 32; i += 2) {
    let temp = cameraOffset.yTileOffset + i;
    if (temp >= 32) {
      temp -= 32;
    }
    drawMetatileAt(runtime, mapLayout, temp * 32 + r6, runtime.gSaveBlock1Ptr.pos.x, runtime.gSaveBlock1Ptr.pos.y + i / 2);
  }
};

export const redrawMapSliceWest = (
  runtime: FieldCameraRuntime,
  cameraOffset: FieldCameraOffset,
  mapLayout: FieldCameraMapLayout
): void => {
  let r5 = cameraOffset.xTileOffset + 28;
  if (r5 >= 32) {
    r5 -= 32;
  }
  for (let i = 0; i < 32; i += 2) {
    let temp = cameraOffset.yTileOffset + i;
    if (temp >= 32) {
      temp -= 32;
    }
    drawMetatileAt(runtime, mapLayout, temp * 32 + r5, runtime.gSaveBlock1Ptr.pos.x + 14, runtime.gSaveBlock1Ptr.pos.y + i / 2);
  }
};

export const currentMapDrawMetatileAt = (runtime: FieldCameraRuntime, x: number, y: number): void => {
  const offset = mapPosToBgTilemapOffset(runtime, runtime.sFieldCameraOffset, x, y);
  if (offset >= 0) {
    drawMetatileAt(runtime, runtime.gMapHeader.mapLayout, offset, x, y);
  }
};

export const drawDoorMetatileAt = (runtime: FieldCameraRuntime, x: number, y: number, tiles: readonly number[]): void => {
  const offset = mapPosToBgTilemapOffset(runtime, runtime.sFieldCameraOffset, x, y);
  if (offset >= 0) {
    drawMetatile(runtime, METATILE_LAYER_TYPE_COVERED, tiles, offset);
  }
};

export const drawMetatileAt = (
  runtime: FieldCameraRuntime,
  mapLayout: FieldCameraMapLayout,
  offset: number,
  x: number,
  y: number
): void => {
  let metatileId = mapGridGetMetatileIdAt(runtime, x, y);
  let metatiles: number[];

  if (metatileId > NUM_METATILES_TOTAL) {
    metatileId = 0;
  }
  if (metatileId < NUM_METATILES_IN_PRIMARY) {
    metatiles = mapLayout.primaryTileset.metatiles;
  } else {
    metatiles = mapLayout.secondaryTileset.metatiles;
    metatileId -= NUM_METATILES_IN_PRIMARY;
  }
  drawMetatile(
    runtime,
    mapGridGetMetatileLayerTypeAt(runtime, x, y),
    metatiles.slice(metatileId * NUM_TILES_PER_METATILE, metatileId * NUM_TILES_PER_METATILE + NUM_TILES_PER_METATILE),
    offset
  );
};

export const drawMetatile = (
  runtime: FieldCameraRuntime,
  metatileLayerType: number,
  tiles: readonly number[],
  offset: number
): void => {
  switch (metatileLayerType) {
    case METATILE_LAYER_TYPE_SPLIT:
      runtime.gBGTilemapBuffers3[offset] = tiles[0];
      runtime.gBGTilemapBuffers3[offset + 1] = tiles[1];
      runtime.gBGTilemapBuffers3[offset + 0x20] = tiles[2];
      runtime.gBGTilemapBuffers3[offset + 0x21] = tiles[3];
      runtime.gBGTilemapBuffers1[offset] = 0;
      runtime.gBGTilemapBuffers1[offset + 1] = 0;
      runtime.gBGTilemapBuffers1[offset + 0x20] = 0;
      runtime.gBGTilemapBuffers1[offset + 0x21] = 0;
      runtime.gBGTilemapBuffers2[offset] = tiles[4];
      runtime.gBGTilemapBuffers2[offset + 1] = tiles[5];
      runtime.gBGTilemapBuffers2[offset + 0x20] = tiles[6];
      runtime.gBGTilemapBuffers2[offset + 0x21] = tiles[7];
      break;
    case METATILE_LAYER_TYPE_COVERED:
      runtime.gBGTilemapBuffers3[offset] = tiles[0];
      runtime.gBGTilemapBuffers3[offset + 1] = tiles[1];
      runtime.gBGTilemapBuffers3[offset + 0x20] = tiles[2];
      runtime.gBGTilemapBuffers3[offset + 0x21] = tiles[3];
      runtime.gBGTilemapBuffers1[offset] = tiles[4];
      runtime.gBGTilemapBuffers1[offset + 1] = tiles[5];
      runtime.gBGTilemapBuffers1[offset + 0x20] = tiles[6];
      runtime.gBGTilemapBuffers1[offset + 0x21] = tiles[7];
      runtime.gBGTilemapBuffers2[offset] = 0;
      runtime.gBGTilemapBuffers2[offset + 1] = 0;
      runtime.gBGTilemapBuffers2[offset + 0x20] = 0;
      runtime.gBGTilemapBuffers2[offset + 0x21] = 0;
      break;
    case METATILE_LAYER_TYPE_NORMAL:
      runtime.gBGTilemapBuffers3[offset] = 0x3014;
      runtime.gBGTilemapBuffers3[offset + 1] = 0x3014;
      runtime.gBGTilemapBuffers3[offset + 0x20] = 0x3014;
      runtime.gBGTilemapBuffers3[offset + 0x21] = 0x3014;
      runtime.gBGTilemapBuffers1[offset] = tiles[0];
      runtime.gBGTilemapBuffers1[offset + 1] = tiles[1];
      runtime.gBGTilemapBuffers1[offset + 0x20] = tiles[2];
      runtime.gBGTilemapBuffers1[offset + 0x21] = tiles[3];
      runtime.gBGTilemapBuffers2[offset] = tiles[4];
      runtime.gBGTilemapBuffers2[offset + 1] = tiles[5];
      runtime.gBGTilemapBuffers2[offset + 0x20] = tiles[6];
      runtime.gBGTilemapBuffers2[offset + 0x21] = tiles[7];
      break;
  }
  scheduleBgCopyTilemapToVram(runtime, 1);
  scheduleBgCopyTilemapToVram(runtime, 2);
  scheduleBgCopyTilemapToVram(runtime, 3);
};

export const mapPosToBgTilemapOffset = (
  runtime: FieldCameraRuntime,
  cameraOffset: FieldCameraOffset,
  x: number,
  y: number
): number => {
  x -= runtime.gSaveBlock1Ptr.pos.x;
  x *= 2;
  if (x >= 32 || x < 0) {
    return -1;
  }
  x += cameraOffset.xTileOffset;
  if (x >= 32) {
    x -= 32;
  }
  y = (y - runtime.gSaveBlock1Ptr.pos.y) * 2;
  if (y >= 32 || y < 0) {
    return -1;
  }
  y += cameraOffset.yTileOffset;
  if (y >= 32) {
    y -= 32;
  }
  return y * 32 + x;
};

export const cameraUpdateCallback = (runtime: FieldCameraRuntime, fieldCamera: CameraObject): void => {
  if (fieldCamera.spriteId !== 0) {
    fieldCamera.movementSpeedX = runtime.gSprites[fieldCamera.spriteId].data[2];
    fieldCamera.movementSpeedY = runtime.gSprites[fieldCamera.spriteId].data[3];
  }
};

export const resetCameraUpdateInfo = (runtime: FieldCameraRuntime): void => {
  runtime.gFieldCamera.movementSpeedX = 0;
  runtime.gFieldCamera.movementSpeedY = 0;
  runtime.gFieldCamera.x = 0;
  runtime.gFieldCamera.y = 0;
  runtime.gFieldCamera.spriteId = 0;
  runtime.gFieldCamera.callback = null;
};

export const initCameraUpdateCallback = (runtime: FieldCameraRuntime, trackedSpriteId: number): number => {
  if (runtime.gFieldCamera.spriteId !== 0) {
    destroySprite(runtime, runtime.gFieldCamera.spriteId);
  }
  runtime.gFieldCamera.spriteId = addCameraObject(runtime, trackedSpriteId);
  runtime.gFieldCamera.callback = 'CameraUpdateCallback';
  return 0;
};

const maybeRunCameraCallback = (runtime: FieldCameraRuntime): void => {
  if (runtime.gFieldCamera.callback !== null) {
    cameraUpdateCallback(runtime, runtime.gFieldCamera);
  }
};

const updateCameraOffsets = (runtime: FieldCameraRuntime, refreshObjects: boolean, updateTotals: boolean): void => {
  let deltaX: number;
  let deltaY: number;
  let curMovementOffsetY: number;
  let curMovementOffsetX: number;
  let movementSpeedX: number;
  let movementSpeedY: number;

  maybeRunCameraCallback(runtime);
  movementSpeedX = runtime.gFieldCamera.movementSpeedX;
  movementSpeedY = runtime.gFieldCamera.movementSpeedY;
  deltaX = 0;
  deltaY = 0;
  curMovementOffsetX = runtime.gFieldCamera.x;
  curMovementOffsetY = runtime.gFieldCamera.y;

  if (curMovementOffsetX === 0 && movementSpeedX !== 0) {
    if (movementSpeedX > 0) {
      deltaX = 1;
    } else {
      deltaX = -1;
    }
  }
  if (curMovementOffsetY === 0 && movementSpeedY !== 0) {
    if (movementSpeedY > 0) {
      deltaY = 1;
    } else {
      deltaY = -1;
    }
  }
  if (curMovementOffsetX !== 0 && curMovementOffsetX === -movementSpeedX) {
    if (movementSpeedX > 0) {
      deltaX = 1;
    } else {
      deltaX = -1;
    }
  }
  if (curMovementOffsetY !== 0 && curMovementOffsetY === -movementSpeedY) {
    if (movementSpeedY > 0) {
      deltaX = 1;
    } else {
      deltaX = -1;
    }
  }

  runtime.gFieldCamera.x += movementSpeedX;
  runtime.gFieldCamera.x = runtime.gFieldCamera.x - 16 * cDiv(runtime.gFieldCamera.x, 16);
  runtime.gFieldCamera.y += movementSpeedY;
  runtime.gFieldCamera.y = runtime.gFieldCamera.y - 16 * cDiv(runtime.gFieldCamera.y, 16);

  if (deltaX !== 0 || deltaY !== 0) {
    cameraMove(runtime, deltaX, deltaY);
    if (refreshObjects) {
      updateObjectEventsForCameraUpdate(runtime, deltaX, deltaY);
    }
    tilemapMoveSomething(runtime.sFieldCameraOffset, deltaX * 2, deltaY * 2);
    redrawMapSlicesForCameraUpdate(runtime, runtime.sFieldCameraOffset, deltaX * 2, deltaY * 2);
  }
  coords8Add(runtime.sFieldCameraOffset, movementSpeedX, movementSpeedY);
  if (updateTotals) {
    runtime.gTotalCameraPixelOffsetX = u16(runtime.gTotalCameraPixelOffsetX - movementSpeedX);
    runtime.gTotalCameraPixelOffsetY = u16(runtime.gTotalCameraPixelOffsetY - movementSpeedY);
  }
};

export const cameraUpdate = (runtime: FieldCameraRuntime): void => {
  updateCameraOffsets(runtime, true, true);
};

export const moveCameraAndRedrawMap = (runtime: FieldCameraRuntime, deltaX: number, deltaY: number): void => {
  cameraMove(runtime, deltaX, deltaY);
  updateObjectEventsForCameraUpdate(runtime, deltaX, deltaY);
  drawWholeMapView(runtime);
  runtime.gTotalCameraPixelOffsetX = u16(runtime.gTotalCameraPixelOffsetX - deltaX * 16);
  runtime.gTotalCameraPixelOffsetY = u16(runtime.gTotalCameraPixelOffsetY - deltaY * 16);
};

export const cameraUpdateNoObjectRefresh = (runtime: FieldCameraRuntime): void => {
  updateCameraOffsets(runtime, false, false);
};

export const setCameraPanningCallback = (runtime: FieldCameraRuntime, callback: 'CameraPanningCB_PanAhead' | 'Custom' | null): void => {
  runtime.sFieldCameraPanningCallback = callback;
};

export const setCameraPanning = (runtime: FieldCameraRuntime, a: number, b: number): void => {
  runtime.sHorizontalCameraPan = a;
  runtime.sVerticalCameraPan = b + 32;
};

export const installCameraPanAheadCallback = (runtime: FieldCameraRuntime): void => {
  runtime.sFieldCameraPanningCallback = 'CameraPanningCB_PanAhead';
  runtime.sBikeCameraPanFlag = 0;
  runtime.sHorizontalCameraPan = 0;
  runtime.sVerticalCameraPan = 32;
};

export const updateCameraPanning = (runtime: FieldCameraRuntime): void => {
  if (runtime.sFieldCameraPanningCallback !== null) {
    if (runtime.sFieldCameraPanningCallback === 'CameraPanningCB_PanAhead') {
      cameraPanningCBPanAhead(runtime);
    } else {
      call(runtime, 'CustomCameraPanningCallback');
    }
  }
  runtime.gSpriteCoordOffsetX = u16(runtime.gTotalCameraPixelOffsetX - runtime.sHorizontalCameraPan);
  runtime.gSpriteCoordOffsetY = u16(runtime.gTotalCameraPixelOffsetY - runtime.sVerticalCameraPan - 8);
};

export const cameraPanningCBPanAhead = (runtime: FieldCameraRuntime): void => {
  if (runtime.gBikeCameraAheadPanback === false) {
    installCameraPanAheadCallback(runtime);
  } else {
    if (runtime.gPlayerAvatar.tileTransitionState === 1) {
      runtime.sBikeCameraPanFlag ^= 1;
      if (runtime.sBikeCameraPanFlag === 0) {
        return;
      }
    } else {
      runtime.sBikeCameraPanFlag = 0;
    }

    const movementDirection = runtime.playerMovementDirection;
    if (movementDirection === DIR_NORTH) {
      if (runtime.sVerticalCameraPan > -8) {
        runtime.sVerticalCameraPan -= 2;
      }
    } else if (movementDirection === DIR_SOUTH) {
      if (runtime.sVerticalCameraPan < 72) {
        runtime.sVerticalCameraPan += 2;
      }
    } else if (runtime.sVerticalCameraPan < 32) {
      runtime.sVerticalCameraPan += 2;
    } else if (runtime.sVerticalCameraPan > 32) {
      runtime.sVerticalCameraPan -= 2;
    }
  }
};

export const move_tilemap_camera_to_upper_left_corner_ = moveTilemapCameraToUpperLeftCornerInternal;
export const tilemap_move_something = tilemapMoveSomething;
export const coords8_add = coords8Add;
export const move_tilemap_camera_to_upper_left_corner = moveTilemapCameraToUpperLeftCorner;
export const FieldUpdateBgTilemapScroll = fieldUpdateBgTilemapScroll;
export const FieldCameraGetPixelOffsetAtGround = fieldCameraGetPixelOffsetAtGround;
export const DrawWholeMapView = drawWholeMapView;
export const DrawWholeMapViewInternal = drawWholeMapViewInternal;
export const RedrawMapSlicesForCameraUpdate = redrawMapSlicesForCameraUpdate;
export const RedrawMapSliceNorth = redrawMapSliceNorth;
export const RedrawMapSliceSouth = redrawMapSliceSouth;
export const RedrawMapSliceEast = redrawMapSliceEast;
export const RedrawMapSliceWest = redrawMapSliceWest;
export const CurrentMapDrawMetatileAt = currentMapDrawMetatileAt;
export const DrawDoorMetatileAt = drawDoorMetatileAt;
export const DrawMetatileAt = drawMetatileAt;
export const DrawMetatile = drawMetatile;
export const MapPosToBgTilemapOffset = mapPosToBgTilemapOffset;
export const CameraUpdateCallback = cameraUpdateCallback;
export const ResetCameraUpdateInfo = resetCameraUpdateInfo;
export const InitCameraUpdateCallback = initCameraUpdateCallback;
export const CameraUpdate = cameraUpdate;
export const MoveCameraAndRedrawMap = moveCameraAndRedrawMap;
export const CameraUpdateNoObjectRefresh = cameraUpdateNoObjectRefresh;
export const SetCameraPanningCallback = setCameraPanningCallback;
export const SetCameraPanning = setCameraPanning;
export const InstallCameraPanAheadCallback = installCameraPanAheadCallback;
export const UpdateCameraPanning = updateCameraPanning;
export const CameraPanningCB_PanAhead = cameraPanningCBPanAhead;
