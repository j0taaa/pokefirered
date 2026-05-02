import {
  BG_PLTT_ID,
  createDecompPaletteRuntime,
  LoadCompressedPalette,
  LoadPalette,
  TintPalette_GrayScale,
  TintPalette_SepiaTone,
  type DecompPaletteRuntime
} from './decompPalette';

export const NUM_TILES_IN_PRIMARY = 640;
export const NUM_TILES_TOTAL = 1024;
export const NUM_METATILES_IN_PRIMARY = 640;
export const NUM_METATILES_TOTAL = 1024;
export const NUM_PALS_IN_PRIMARY = 7;
export const NUM_PALS_TOTAL = 13;
export const PLTT_SIZE_4BPP = 32;
export const MAX_MAP_DATA_SIZE = 0x2800;
export const VIRTUAL_MAP_SIZE = MAX_MAP_DATA_SIZE;
export const NUM_TILES_PER_METATILE = 8;

export const MAP_OFFSET = 7;
export const MAP_OFFSET_W = MAP_OFFSET * 2 + 1;
export const MAP_OFFSET_H = MAP_OFFSET * 2;

export const MAPGRID_METATILE_ID_MASK = 0x03ff;
export const MAPGRID_COLLISION_MASK = 0x0c00;
export const MAPGRID_ELEVATION_MASK = 0xf000;
export const MAPGRID_COLLISION_SHIFT = 10;
export const MAPGRID_ELEVATION_SHIFT = 12;
export const MAPGRID_UNDEFINED = MAPGRID_METATILE_ID_MASK;

export const METATILE_ATTRIBUTE_BEHAVIOR = 0;
export const METATILE_ATTRIBUTE_TERRAIN = 1;
export const METATILE_ATTRIBUTE_2 = 2;
export const METATILE_ATTRIBUTE_3 = 3;
export const METATILE_ATTRIBUTE_ENCOUNTER_TYPE = 4;
export const METATILE_ATTRIBUTE_5 = 5;
export const METATILE_ATTRIBUTE_LAYER_TYPE = 6;
export const METATILE_ATTRIBUTE_7 = 7;
export const METATILE_ATTRIBUTE_COUNT = 8;
export const METATILE_ATTRIBUTES_ALL = 255;

export const CONNECTION_INVALID = -1;
export const CONNECTION_NONE = 0;
export const CONNECTION_SOUTH = 1;
export const CONNECTION_NORTH = 2;
export const CONNECTION_WEST = 3;
export const CONNECTION_EAST = 4;
export const CONNECTION_DIVE = 5;
export const CONNECTION_EMERGE = 6;

export const DIR_NONE = 0;
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;

export const QL_TINT_NONE = 0;
export const QL_TINT_GRAYSCALE = 1;
export const QL_TINT_SEPIA = 2;
export const QL_TINT_BACKUP_GRAYSCALE = 3;

const sMetatileAttrMasks = [
  0x000001ff,
  0x00003e00,
  0x0003c000,
  0x00fc0000,
  0x07000000,
  0x18000000,
  0x60000000,
  0x80000000
] as const;

const sMetatileAttrShifts = [0, 9, 14, 18, 24, 27, 29, 31] as const;

const directionToVectors: Record<number, { x: number; y: number }> = {
  [DIR_NONE]: { x: 0, y: 0 },
  [DIR_SOUTH]: { x: 0, y: 1 },
  [DIR_NORTH]: { x: 0, y: -1 },
  [DIR_WEST]: { x: -1, y: 0 },
  [DIR_EAST]: { x: 1, y: 0 }
};

export interface Tileset {
  isCompressed: boolean | number;
  isSecondary: boolean | number;
  tiles: unknown;
  palettes: ArrayLike<ArrayLike<number>> | ArrayLike<number>;
  metatiles?: ArrayLike<number>;
  metatileAttributes: ArrayLike<number>;
}

export interface MapLayout {
  width: number;
  height: number;
  border: ArrayLike<number>;
  map: ArrayLike<number>;
  primaryTileset: Tileset | null;
  secondaryTileset: Tileset | null;
  borderWidth: number;
  borderHeight: number;
}

export interface MapHeader {
  mapLayout: MapLayout;
  connections?: MapConnections | null;
  regionMapSectionId?: number;
}

export interface MapConnection {
  direction: number;
  offset: number;
  mapGroup: number;
  mapNum: number;
  mapHeader?: MapHeader | null;
}

export interface MapConnections {
  count: number;
  connections: MapConnection[];
}

export interface BackupMapLayout {
  Xsize: number;
  Ysize: number;
  map: Uint16Array;
}

export interface SaveBlock1 {
  pos: { x: number; y: number };
}

export interface SaveBlock2 {
  mapView: Uint16Array;
}

export interface FieldmapRuntime {
  VMap: BackupMapLayout;
  gBackupMapData: Uint16Array;
  gMapHeader: MapHeader;
  gCamera: { active: boolean; x: number; y: number };
  gMapConnectionFlags: { south: boolean; north: boolean; west: boolean; east: boolean };
  gGlobalFieldTintMode: number;
  gSaveBlock1Ptr: SaveBlock1;
  gSaveBlock2Ptr: SaveBlock2;
  mapHeaders: Map<string, MapHeader>;
  operations: string[];
  paletteRuntime: DecompPaletteRuntime;
}

const u16 = (value: number): number => value & 0xffff;

const blankTileset = (): Tileset => ({
  isCompressed: false,
  isSecondary: false,
  tiles: 'tiles',
  palettes: Array.from({ length: NUM_PALS_TOTAL }, () => Array(16).fill(0)),
  metatileAttributes: []
});

const blankLayout = (): MapLayout => ({
  width: 1,
  height: 1,
  border: [0],
  map: [0],
  primaryTileset: blankTileset(),
  secondaryTileset: blankTileset(),
  borderWidth: 1,
  borderHeight: 1
});

export const createFieldmapRuntime = (overrides: Partial<FieldmapRuntime> = {}): FieldmapRuntime => {
  const gBackupMapData = overrides.gBackupMapData ?? new Uint16Array(VIRTUAL_MAP_SIZE);
  const mapLayout = overrides.gMapHeader?.mapLayout ?? blankLayout();
  const runtime: FieldmapRuntime = {
    VMap: overrides.VMap ?? { Xsize: 0, Ysize: 0, map: gBackupMapData },
    gBackupMapData,
    gMapHeader: overrides.gMapHeader ?? { mapLayout },
    gCamera: overrides.gCamera ?? { active: false, x: 0, y: 0 },
    gMapConnectionFlags: overrides.gMapConnectionFlags ?? { south: false, north: false, west: false, east: false },
    gGlobalFieldTintMode: overrides.gGlobalFieldTintMode ?? QL_TINT_NONE,
    gSaveBlock1Ptr: overrides.gSaveBlock1Ptr ?? { pos: { x: 0, y: 0 } },
    gSaveBlock2Ptr: overrides.gSaveBlock2Ptr ?? { mapView: new Uint16Array(0x200) },
    mapHeaders: overrides.mapHeaders ?? new Map<string, MapHeader>(),
    operations: overrides.operations ?? [],
    paletteRuntime: overrides.paletteRuntime ?? createDecompPaletteRuntime()
  };
  runtime.VMap.map = runtime.gBackupMapData;
  return runtime;
};

const log = (runtime: FieldmapRuntime, op: string): void => {
  runtime.operations.push(op);
};

export const GetMapHeaderFromConnection = (runtime: FieldmapRuntime, connection: MapConnection): MapHeader | null =>
  connection.mapHeader ?? runtime.mapHeaders.get(`${connection.mapGroup}:${connection.mapNum}`) ?? null;

export const InitMap = (runtime: FieldmapRuntime): void => {
  InitMapLayoutData(runtime, runtime.gMapHeader);
  RunOnLoadMapScript(runtime);
};

export const InitMapFromSavedGame = (runtime: FieldmapRuntime): void => {
  InitMapLayoutData(runtime, runtime.gMapHeader);
  LoadSavedMapView(runtime);
  RunOnLoadMapScript(runtime);
};

export const RunOnLoadMapScript = (runtime: FieldmapRuntime): void => log(runtime, 'RunOnLoadMapScript');

export const InitMapLayoutData = (runtime: FieldmapRuntime, mapHeader: MapHeader): void => {
  const mapLayout = mapHeader.mapLayout;
  runtime.gBackupMapData.fill(MAPGRID_UNDEFINED);
  runtime.VMap.map = runtime.gBackupMapData;
  runtime.VMap.Xsize = mapLayout.width + MAP_OFFSET_W;
  runtime.VMap.Ysize = mapLayout.height + MAP_OFFSET_H;
  if (runtime.VMap.Xsize * runtime.VMap.Ysize > VIRTUAL_MAP_SIZE) {
    throw new Error('AGB_ASSERT_EX: VMap.Xsize * VMap.Ysize <= VIRTUAL_MAP_SIZE');
  }
  InitBackupMapLayoutData(runtime, mapLayout.map, mapLayout.width, mapLayout.height);
  InitBackupMapLayoutConnections(runtime, mapHeader);
};

export const InitBackupMapLayoutData = (
  runtime: FieldmapRuntime,
  map: ArrayLike<number>,
  width: number,
  height: number
): void => {
  let dest = runtime.VMap.Xsize * 7 + MAP_OFFSET;
  let src = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      runtime.VMap.map[dest + x] = u16(map[src + x] ?? 0);
    }
    dest += width + MAP_OFFSET_W;
    src += width;
  }
};

export const InitBackupMapLayoutConnections = (runtime: FieldmapRuntime, mapHeader: MapHeader): void => {
  runtime.gMapConnectionFlags = { south: false, north: false, west: false, east: false };
  if (mapHeader.connections) {
    let i = 0;
    let connection = mapHeader.connections.connections[i];
    while (i < mapHeader.connections.count && connection) {
      const cMap = GetMapHeaderFromConnection(runtime, connection);
      const offset = connection.offset;
      switch (connection.direction) {
        case CONNECTION_SOUTH:
          FillSouthConnection(runtime, mapHeader, cMap, offset);
          runtime.gMapConnectionFlags.south = true;
          break;
        case CONNECTION_NORTH:
          FillNorthConnection(runtime, mapHeader, cMap, offset);
          runtime.gMapConnectionFlags.north = true;
          break;
        case CONNECTION_WEST:
          FillWestConnection(runtime, mapHeader, cMap, offset);
          runtime.gMapConnectionFlags.west = true;
          break;
        case CONNECTION_EAST:
          FillEastConnection(runtime, mapHeader, cMap, offset);
          runtime.gMapConnectionFlags.east = true;
          break;
      }
      i++;
      connection = mapHeader.connections.connections[i];
    }
  }
};

export const FillConnection = (
  runtime: FieldmapRuntime,
  x: number,
  y: number,
  connectedMapHeader: MapHeader,
  x2: number,
  y2: number,
  width: number,
  height: number
): void => {
  const mapWidth = connectedMapHeader.mapLayout.width;
  let src = mapWidth * y2 + x2;
  let dest = runtime.VMap.Xsize * y + x;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      runtime.VMap.map[dest + j] = u16(connectedMapHeader.mapLayout.map[src + j] ?? 0);
    }
    dest += runtime.VMap.Xsize;
    src += mapWidth;
  }
};

export const FillSouthConnection = (
  runtime: FieldmapRuntime,
  mapHeader: MapHeader,
  connectedMapHeader: MapHeader | null,
  offset: number
): void => {
  if (connectedMapHeader) {
    const cWidth = connectedMapHeader.mapLayout.width;
    let x = offset + MAP_OFFSET;
    const y = mapHeader.mapLayout.height + MAP_OFFSET;
    let x2: number;
    let width: number;
    if (x < 0) {
      x2 = -x;
      x += cWidth;
      width = x < runtime.VMap.Xsize ? x : runtime.VMap.Xsize;
      x = 0;
    } else {
      x2 = 0;
      width = x + cWidth < runtime.VMap.Xsize ? cWidth : runtime.VMap.Xsize - x;
    }
    FillConnection(runtime, x, y, connectedMapHeader, x2, 0, width, MAP_OFFSET);
  }
};

export const FillNorthConnection = (
  runtime: FieldmapRuntime,
  _mapHeader: MapHeader,
  connectedMapHeader: MapHeader | null,
  offset: number
): void => {
  if (connectedMapHeader) {
    const cWidth = connectedMapHeader.mapLayout.width;
    const cHeight = connectedMapHeader.mapLayout.height;
    let x = offset + MAP_OFFSET;
    const y2 = cHeight - MAP_OFFSET;
    let x2: number;
    let width: number;
    if (x < 0) {
      x2 = -x;
      x += cWidth;
      width = x < runtime.VMap.Xsize ? x : runtime.VMap.Xsize;
      x = 0;
    } else {
      x2 = 0;
      width = x + cWidth < runtime.VMap.Xsize ? cWidth : runtime.VMap.Xsize - x;
    }
    FillConnection(runtime, x, 0, connectedMapHeader, x2, y2, width, MAP_OFFSET);
  }
};

export const FillWestConnection = (
  runtime: FieldmapRuntime,
  _mapHeader: MapHeader,
  connectedMapHeader: MapHeader | null,
  offset: number
): void => {
  if (connectedMapHeader) {
    const cWidth = connectedMapHeader.mapLayout.width;
    const cHeight = connectedMapHeader.mapLayout.height;
    let y = offset + MAP_OFFSET;
    const x2 = cWidth - MAP_OFFSET;
    let y2: number;
    let height: number;
    if (y < 0) {
      y2 = -y;
      height = y + cHeight < runtime.VMap.Ysize ? y + cHeight : runtime.VMap.Ysize;
      y = 0;
    } else {
      y2 = 0;
      height = y + cHeight < runtime.VMap.Ysize ? cHeight : runtime.VMap.Ysize - y;
    }
    FillConnection(runtime, 0, y, connectedMapHeader, x2, y2, MAP_OFFSET, height);
  }
};

export const FillEastConnection = (
  runtime: FieldmapRuntime,
  mapHeader: MapHeader,
  connectedMapHeader: MapHeader | null,
  offset: number
): void => {
  if (connectedMapHeader) {
    const cHeight = connectedMapHeader.mapLayout.height;
    const x = mapHeader.mapLayout.width + MAP_OFFSET;
    let y = offset + MAP_OFFSET;
    let y2: number;
    let height: number;
    if (y < 0) {
      y2 = -y;
      height = y + cHeight < runtime.VMap.Ysize ? y + cHeight : runtime.VMap.Ysize;
      y = 0;
    } else {
      y2 = 0;
      height = y + cHeight < runtime.VMap.Ysize ? cHeight : runtime.VMap.Ysize - y;
    }
    FillConnection(runtime, x, y, connectedMapHeader, 0, y2, MAP_OFFSET + 1, height);
  }
};

export const AreCoordsWithinMapGridBounds = (runtime: FieldmapRuntime, x: number, y: number): boolean =>
  x >= 0 && x < runtime.VMap.Xsize && y >= 0 && y < runtime.VMap.Ysize;

export const GetBorderBlockAt = (runtime: FieldmapRuntime, x: number, y: number): number => {
  const mapLayout = runtime.gMapHeader.mapLayout;
  let xprime = x - MAP_OFFSET;
  xprime += 8 * mapLayout.borderWidth;
  xprime %= mapLayout.borderWidth;
  let yprime = y - MAP_OFFSET;
  yprime += 8 * mapLayout.borderHeight;
  yprime %= mapLayout.borderHeight;
  return u16((mapLayout.border[xprime + yprime * mapLayout.borderWidth] ?? 0) | MAPGRID_COLLISION_MASK);
};

export const GetMapGridBlockAt = (runtime: FieldmapRuntime, x: number, y: number): number =>
  AreCoordsWithinMapGridBounds(runtime, x, y)
    ? runtime.VMap.map[x + runtime.VMap.Xsize * y]
    : GetBorderBlockAt(runtime, x, y);

export const MapGridGetElevationAt = (runtime: FieldmapRuntime, x: number, y: number): number => {
  const block = GetMapGridBlockAt(runtime, x, y);
  if (block === MAPGRID_UNDEFINED) return 0;
  return block >> MAPGRID_ELEVATION_SHIFT;
};

export const MapGridGetCollisionAt = (runtime: FieldmapRuntime, x: number, y: number): number => {
  const block = GetMapGridBlockAt(runtime, x, y);
  if (block === MAPGRID_UNDEFINED) return 1;
  return (block & MAPGRID_COLLISION_MASK) >> MAPGRID_COLLISION_SHIFT;
};

export const MapGridGetMetatileIdAt = (runtime: FieldmapRuntime, x: number, y: number): number => {
  const block = GetMapGridBlockAt(runtime, x, y);
  if (block === MAPGRID_UNDEFINED) return GetBorderBlockAt(runtime, x, y) & MAPGRID_METATILE_ID_MASK;
  return block & MAPGRID_METATILE_ID_MASK;
};

export const ExtractMetatileAttribute = (attributes: number, attributeType: number): number => {
  if (attributeType >= METATILE_ATTRIBUTE_COUNT) return attributes >>> 0;
  return ((attributes >>> 0) & sMetatileAttrMasks[attributeType]) >>> sMetatileAttrShifts[attributeType];
};

export const GetAttributeByMetatileIdAndMapLayout = (
  mapLayout: MapLayout,
  metatile: number,
  attributeType: number
): number => {
  if (metatile < NUM_METATILES_IN_PRIMARY) {
    const attributes = mapLayout.primaryTileset?.metatileAttributes;
    return ExtractMetatileAttribute(attributes?.[metatile] ?? 0, attributeType);
  }
  if (metatile < NUM_METATILES_TOTAL) {
    const attributes = mapLayout.secondaryTileset?.metatileAttributes;
    return ExtractMetatileAttribute(attributes?.[metatile - NUM_METATILES_IN_PRIMARY] ?? 0, attributeType);
  }
  return 0xff;
};

export const MapGridGetMetatileAttributeAt = (
  runtime: FieldmapRuntime,
  x: number,
  y: number,
  attributeType: number
): number => {
  const metatileId = MapGridGetMetatileIdAt(runtime, x, y);
  return GetAttributeByMetatileIdAndMapLayout(runtime.gMapHeader.mapLayout, metatileId, attributeType);
};

export const MapGridGetMetatileBehaviorAt = (runtime: FieldmapRuntime, x: number, y: number): number =>
  MapGridGetMetatileAttributeAt(runtime, x, y, METATILE_ATTRIBUTE_BEHAVIOR);

export const MapGridGetMetatileLayerTypeAt = (runtime: FieldmapRuntime, x: number, y: number): number =>
  MapGridGetMetatileAttributeAt(runtime, x, y, METATILE_ATTRIBUTE_LAYER_TYPE);

export const MapGridSetMetatileIdAt = (
  runtime: FieldmapRuntime,
  x: number,
  y: number,
  metatile: number
): void => {
  if (AreCoordsWithinMapGridBounds(runtime, x, y)) {
    const i = x + y * runtime.VMap.Xsize;
    runtime.VMap.map[i] = u16((runtime.VMap.map[i] & MAPGRID_ELEVATION_MASK) | (metatile & ~MAPGRID_ELEVATION_MASK));
  }
};

export const MapGridSetMetatileEntryAt = (
  runtime: FieldmapRuntime,
  x: number,
  y: number,
  metatile: number
): void => {
  if (AreCoordsWithinMapGridBounds(runtime, x, y)) {
    runtime.VMap.map[x + runtime.VMap.Xsize * y] = u16(metatile);
  }
};

export const MapGridSetMetatileImpassabilityAt = (
  runtime: FieldmapRuntime,
  x: number,
  y: number,
  impassable: boolean | number
): void => {
  if (AreCoordsWithinMapGridBounds(runtime, x, y)) {
    const idx = x + runtime.VMap.Xsize * y;
    if (impassable) runtime.VMap.map[idx] = u16(runtime.VMap.map[idx] | MAPGRID_COLLISION_MASK);
    else runtime.VMap.map[idx] = u16(runtime.VMap.map[idx] & ~MAPGRID_COLLISION_MASK);
  }
};

export const SaveMapView = (runtime: FieldmapRuntime): void => {
  let mapView = 0;
  const width = runtime.VMap.Xsize;
  const x = runtime.gSaveBlock1Ptr.pos.x;
  const y = runtime.gSaveBlock1Ptr.pos.y;
  for (let i = y; i < y + MAP_OFFSET_H; i++) {
    for (let j = x; j < x + MAP_OFFSET_W; j++) {
      runtime.gSaveBlock2Ptr.mapView[mapView++] = runtime.gBackupMapData[width * i + j];
    }
  }
};

export const SavedMapViewIsEmpty = (runtime: FieldmapRuntime): boolean => {
  let marker = 0;
  for (let i = 0; i < 0x200; i++) {
    marker |= runtime.gSaveBlock2Ptr.mapView[i] ?? 0;
  }
  return marker === 0;
};

export const ClearSavedMapView = (runtime: FieldmapRuntime): void => {
  runtime.gSaveBlock2Ptr.mapView.fill(0);
};

export const LoadSavedMapView = (runtime: FieldmapRuntime): void => {
  let mapView = 0;
  if (!SavedMapViewIsEmpty(runtime)) {
    const width = runtime.VMap.Xsize;
    const x = runtime.gSaveBlock1Ptr.pos.x;
    const y = runtime.gSaveBlock1Ptr.pos.y;
    for (let i = y; i < y + MAP_OFFSET_H; i++) {
      for (let j = x; j < x + MAP_OFFSET_W; j++) {
        runtime.gBackupMapData[j + width * i] = runtime.gSaveBlock2Ptr.mapView[mapView++];
      }
    }
    ClearSavedMapView(runtime);
  }
};

export const MoveMapViewToBackup = (runtime: FieldmapRuntime, direction: number): void => {
  const mapView = runtime.gSaveBlock2Ptr.mapView;
  const width = runtime.VMap.Xsize;
  let r9 = 0;
  let r8 = 0;
  let x0 = runtime.gSaveBlock1Ptr.pos.x;
  let y0 = runtime.gSaveBlock1Ptr.pos.y;
  let x2 = 15;
  let y2 = 14;
  switch (direction) {
    case CONNECTION_NORTH:
      y0 += 1;
      y2 = MAP_OFFSET_H - 1;
      break;
    case CONNECTION_SOUTH:
      r8 = 1;
      y2 = MAP_OFFSET_H - 1;
      break;
    case CONNECTION_WEST:
      x0 += 1;
      x2 = MAP_OFFSET_W - 1;
      break;
    case CONNECTION_EAST:
      r9 = 1;
      x2 = MAP_OFFSET_W - 1;
      break;
  }
  for (let y = 0; y < y2; y++) {
    let i = 0;
    let j = 0;
    for (let x = 0; x < x2; x++) {
      const desti = width * (y + y0);
      const srci = (y + r8) * MAP_OFFSET_W + r9;
      runtime.gBackupMapData[x0 + desti + j] = mapView[srci + i];
      i++;
      j++;
    }
  }
  ClearSavedMapView(runtime);
};

export const GetMapBorderIdAt = (runtime: FieldmapRuntime, x: number, y: number): number => {
  if (GetMapGridBlockAt(runtime, x, y) === MAPGRID_UNDEFINED) return CONNECTION_INVALID;
  if (x >= runtime.VMap.Xsize - (MAP_OFFSET + 1)) return runtime.gMapConnectionFlags.east ? CONNECTION_EAST : CONNECTION_INVALID;
  if (x < MAP_OFFSET) return runtime.gMapConnectionFlags.west ? CONNECTION_WEST : CONNECTION_INVALID;
  if (y >= runtime.VMap.Ysize - MAP_OFFSET) return runtime.gMapConnectionFlags.south ? CONNECTION_SOUTH : CONNECTION_INVALID;
  if (y < MAP_OFFSET) return runtime.gMapConnectionFlags.north ? CONNECTION_NORTH : CONNECTION_INVALID;
  return CONNECTION_NONE;
};

export const GetPostCameraMoveMapBorderId = (runtime: FieldmapRuntime, x: number, y: number): number =>
  GetMapBorderIdAt(runtime, runtime.gSaveBlock1Ptr.pos.x + MAP_OFFSET + x, runtime.gSaveBlock1Ptr.pos.y + MAP_OFFSET + y);

export const CanCameraMoveInDirection = (runtime: FieldmapRuntime, direction: number): boolean => {
  const vector = directionToVectors[direction] ?? directionToVectors[DIR_NONE];
  const x = runtime.gSaveBlock1Ptr.pos.x + MAP_OFFSET + vector.x;
  const y = runtime.gSaveBlock1Ptr.pos.y + MAP_OFFSET + vector.y;
  if (GetMapBorderIdAt(runtime, x, y) === CONNECTION_INVALID) return false;
  return true;
};

export const SetPositionFromConnection = (
  runtime: FieldmapRuntime,
  connection: MapConnection,
  direction: number,
  x: number,
  y: number
): void => {
  const mapHeader = GetMapHeaderFromConnection(runtime, connection);
  if (!mapHeader) return;
  switch (direction) {
    case CONNECTION_EAST:
      runtime.gSaveBlock1Ptr.pos.x = -x;
      runtime.gSaveBlock1Ptr.pos.y -= connection.offset;
      break;
    case CONNECTION_WEST:
      runtime.gSaveBlock1Ptr.pos.x = mapHeader.mapLayout.width;
      runtime.gSaveBlock1Ptr.pos.y -= connection.offset;
      break;
    case CONNECTION_SOUTH:
      runtime.gSaveBlock1Ptr.pos.x -= connection.offset;
      runtime.gSaveBlock1Ptr.pos.y = -y;
      break;
    case CONNECTION_NORTH:
      runtime.gSaveBlock1Ptr.pos.x -= connection.offset;
      runtime.gSaveBlock1Ptr.pos.y = mapHeader.mapLayout.height;
      break;
  }
};

export const LoadMapFromCameraTransition = (
  runtime: FieldmapRuntime,
  mapGroup: number,
  mapNum: number
): void => log(runtime, `LoadMapFromCameraTransition:${mapGroup}:${mapNum}`);

export const CameraMove = (runtime: FieldmapRuntime, x: number, y: number): boolean => {
  runtime.gCamera.active = false;
  const direction = GetPostCameraMoveMapBorderId(runtime, x, y);
  if (direction === CONNECTION_NONE || direction === CONNECTION_INVALID) {
    runtime.gSaveBlock1Ptr.pos.x += x;
    runtime.gSaveBlock1Ptr.pos.y += y;
  } else {
    SaveMapView(runtime);
    const oldX = runtime.gSaveBlock1Ptr.pos.x;
    const oldY = runtime.gSaveBlock1Ptr.pos.y;
    const connection = GetIncomingConnection(runtime, direction, runtime.gSaveBlock1Ptr.pos.x, runtime.gSaveBlock1Ptr.pos.y);
    if (!connection) return false;
    SetPositionFromConnection(runtime, connection, direction, x, y);
    LoadMapFromCameraTransition(runtime, connection.mapGroup, connection.mapNum);
    runtime.gCamera.active = true;
    runtime.gCamera.x = oldX - runtime.gSaveBlock1Ptr.pos.x;
    runtime.gCamera.y = oldY - runtime.gSaveBlock1Ptr.pos.y;
    runtime.gSaveBlock1Ptr.pos.x += x;
    runtime.gSaveBlock1Ptr.pos.y += y;
    MoveMapViewToBackup(runtime, direction);
  }
  return runtime.gCamera.active;
};

export const GetIncomingConnection = (
  runtime: FieldmapRuntime,
  direction: number,
  x: number,
  y: number
): MapConnection | null => {
  const connections = runtime.gMapHeader.connections;
  if (!connections) return null;
  for (let i = 0; i < connections.count; i++) {
    const connection = connections.connections[i];
    if (connection.direction === direction && IsPosInIncomingConnectingMap(runtime, direction, x, y, connection) === true) {
      return connection;
    }
  }
  return null;
};

export const IsPosInIncomingConnectingMap = (
  runtime: FieldmapRuntime,
  direction: number,
  x: number,
  y: number,
  connection: MapConnection
): boolean => {
  const mapHeader = GetMapHeaderFromConnection(runtime, connection);
  if (!mapHeader) return false;
  switch (direction) {
    case CONNECTION_SOUTH:
    case CONNECTION_NORTH:
      return IsCoordInIncomingConnectingMap(x, runtime.gMapHeader.mapLayout.width, mapHeader.mapLayout.width, connection.offset);
    case CONNECTION_WEST:
    case CONNECTION_EAST:
      return IsCoordInIncomingConnectingMap(y, runtime.gMapHeader.mapLayout.height, mapHeader.mapLayout.height, connection.offset);
  }
  return false;
};

export const IsCoordInIncomingConnectingMap = (coord: number, srcMax: number, destMax: number, offset: number): boolean => {
  const offset2 = Math.max(offset, 0);
  let localSrcMax = srcMax;
  if (destMax + offset < localSrcMax) localSrcMax = destMax + offset;
  return offset2 <= coord && coord <= localSrcMax;
};

export const IsCoordInConnectingMap = (coord: number, max: number): boolean => coord >= 0 && coord < max;

export const IsPosInConnectingMap = (runtime: FieldmapRuntime, connection: MapConnection, x: number, y: number): boolean => {
  const mapHeader = GetMapHeaderFromConnection(runtime, connection);
  if (!mapHeader) return false;
  switch (connection.direction) {
    case CONNECTION_SOUTH:
    case CONNECTION_NORTH:
      return IsCoordInConnectingMap(x - connection.offset, mapHeader.mapLayout.width);
    case CONNECTION_WEST:
    case CONNECTION_EAST:
      return IsCoordInConnectingMap(y - connection.offset, mapHeader.mapLayout.height);
  }
  return false;
};

export const GetMapConnectionAtPos = (runtime: FieldmapRuntime, x: number, y: number): MapConnection | null => {
  if (!runtime.gMapHeader.connections) return null;
  const connections = runtime.gMapHeader.connections;
  for (let i = 0; i < connections.count; i++) {
    const connection = connections.connections[i];
    const direction = connection.direction;
    if (
      direction === CONNECTION_DIVE ||
      direction === CONNECTION_EMERGE ||
      (direction === CONNECTION_NORTH && y > MAP_OFFSET - 1) ||
      (direction === CONNECTION_SOUTH && y < runtime.gMapHeader.mapLayout.height + MAP_OFFSET) ||
      (direction === CONNECTION_WEST && x > MAP_OFFSET - 1) ||
      (direction === CONNECTION_EAST && x < runtime.gMapHeader.mapLayout.width + MAP_OFFSET)
    ) {
      continue;
    }
    if (IsPosInConnectingMap(runtime, connection, x - MAP_OFFSET, y - MAP_OFFSET) === true) return connection;
  }
  return null;
};

export const SetCameraFocusCoords = (runtime: FieldmapRuntime, x: number, y: number): void => {
  runtime.gSaveBlock1Ptr.pos.x = x - MAP_OFFSET;
  runtime.gSaveBlock1Ptr.pos.y = y - MAP_OFFSET;
};

export const GetCameraFocusCoords = (runtime: FieldmapRuntime): { x: number; y: number } => ({
  x: runtime.gSaveBlock1Ptr.pos.x + MAP_OFFSET,
  y: runtime.gSaveBlock1Ptr.pos.y + MAP_OFFSET
});

export const SetCameraCoords = (runtime: FieldmapRuntime, x: number, y: number): void => {
  runtime.gSaveBlock1Ptr.pos.x = x;
  runtime.gSaveBlock1Ptr.pos.y = y;
};

export const GetCameraCoords = (runtime: FieldmapRuntime): { x: number; y: number } => ({
  x: runtime.gSaveBlock1Ptr.pos.x,
  y: runtime.gSaveBlock1Ptr.pos.y
});

export const CopyTilesetToVram = (
  runtime: FieldmapRuntime,
  tileset: Tileset | null,
  numTiles: number,
  offset: number
): void => {
  if (tileset) {
    if (!tileset.isCompressed) log(runtime, `LoadBgTiles:2:${String(tileset.tiles)}:${numTiles * 32}:${offset}`);
    else log(runtime, `DecompressAndCopyTileDataToVram2:2:${String(tileset.tiles)}:${numTiles * 32}:${offset}:0`);
  }
};

export const CopyTilesetToVramUsingHeap = (
  runtime: FieldmapRuntime,
  tileset: Tileset | null,
  numTiles: number,
  offset: number
): void => {
  if (tileset) {
    if (!tileset.isCompressed) log(runtime, `LoadBgTiles:2:${String(tileset.tiles)}:${numTiles * 32}:${offset}`);
    else log(runtime, `DecompressAndLoadBgGfxUsingHeap2:2:${String(tileset.tiles)}:${numTiles * 32}:${offset}:0`);
  }
};

export const QuestLog_BackUpPalette = (runtime: FieldmapRuntime, offset: number, size: number): void =>
  log(runtime, `QuestLog_BackUpPalette:${offset}:${size}`);

export const ApplyGlobalTintToPaletteEntries = (
  runtime: FieldmapRuntime,
  offset: number,
  size: number
): void => {
  switch (runtime.gGlobalFieldTintMode) {
    case QL_TINT_NONE:
      return;
    case QL_TINT_GRAYSCALE:
      TintPalette_GrayScale(runtime.paletteRuntime.gPlttBufferUnfaded, size, offset);
      break;
    case QL_TINT_SEPIA:
      TintPalette_SepiaTone(runtime.paletteRuntime.gPlttBufferUnfaded, size, offset);
      break;
    case QL_TINT_BACKUP_GRAYSCALE:
      QuestLog_BackUpPalette(runtime, offset, size);
      TintPalette_GrayScale(runtime.paletteRuntime.gPlttBufferUnfaded, size, offset);
      break;
    default:
      return;
  }
  runtime.paletteRuntime.gPlttBufferFaded.set(
    runtime.paletteRuntime.gPlttBufferUnfaded.slice(offset, offset + size),
    offset
  );
};

export const ApplyGlobalTintToPaletteSlot = (
  runtime: FieldmapRuntime,
  slot: number,
  count: number
): void => {
  switch (runtime.gGlobalFieldTintMode) {
    case QL_TINT_NONE:
      return;
    case QL_TINT_GRAYSCALE:
      TintPalette_GrayScale(runtime.paletteRuntime.gPlttBufferUnfaded, count * 16, BG_PLTT_ID(slot));
      break;
    case QL_TINT_SEPIA:
      TintPalette_SepiaTone(runtime.paletteRuntime.gPlttBufferUnfaded, count * 16, BG_PLTT_ID(slot));
      break;
    case QL_TINT_BACKUP_GRAYSCALE:
      QuestLog_BackUpPalette(runtime, BG_PLTT_ID(slot), count * 16);
      TintPalette_GrayScale(runtime.paletteRuntime.gPlttBufferUnfaded, count * 16, BG_PLTT_ID(slot));
      break;
    default:
      return;
  }
  const offset = BG_PLTT_ID(slot);
  const countHalfwords = count * 16;
  runtime.paletteRuntime.gPlttBufferFaded.set(
    runtime.paletteRuntime.gPlttBufferUnfaded.slice(offset, offset + countHalfwords),
    offset
  );
};

const paletteAt = (palettes: Tileset['palettes'], index: number): ArrayLike<number> => {
  const row = palettes[index as keyof typeof palettes] as ArrayLike<number> | number | undefined;
  return typeof row === 'number' ? palettes as ArrayLike<number> : row ?? [];
};

export const LoadTilesetPalette = (
  runtime: FieldmapRuntime,
  tileset: Tileset | null,
  destOffset: number,
  size: number
): void => {
  if (tileset) {
    if (tileset.isSecondary === false || tileset.isSecondary === 0) {
      LoadPalette(runtime.paletteRuntime, [0], destOffset, 2);
      LoadPalette(runtime.paletteRuntime, Array.from(paletteAt(tileset.palettes, 0)).slice(1), destOffset + 1, size - 2);
      ApplyGlobalTintToPaletteEntries(runtime, destOffset + 1, (size - 2) >> 1);
    } else if (tileset.isSecondary === true || tileset.isSecondary === 1) {
      LoadPalette(runtime.paletteRuntime, paletteAt(tileset.palettes, NUM_PALS_IN_PRIMARY), destOffset, size);
      ApplyGlobalTintToPaletteEntries(runtime, destOffset, size >> 1);
    } else {
      LoadCompressedPalette(runtime.paletteRuntime, tileset.palettes as ArrayLike<number>, destOffset, size);
      ApplyGlobalTintToPaletteEntries(runtime, destOffset, size >> 1);
    }
  }
};

export const CopyPrimaryTilesetToVram = (runtime: FieldmapRuntime, mapLayout: MapLayout): void => {
  CopyTilesetToVram(runtime, mapLayout.primaryTileset, NUM_TILES_IN_PRIMARY, 0);
};

export const CopySecondaryTilesetToVram = (runtime: FieldmapRuntime, mapLayout: MapLayout): void => {
  CopyTilesetToVram(runtime, mapLayout.secondaryTileset, NUM_TILES_TOTAL - NUM_TILES_IN_PRIMARY, NUM_TILES_IN_PRIMARY);
};

export const CopySecondaryTilesetToVramUsingHeap = (runtime: FieldmapRuntime, mapLayout: MapLayout): void => {
  CopyTilesetToVramUsingHeap(runtime, mapLayout.secondaryTileset, NUM_TILES_TOTAL - NUM_TILES_IN_PRIMARY, NUM_TILES_IN_PRIMARY);
};

export const LoadPrimaryTilesetPalette = (runtime: FieldmapRuntime, mapLayout: MapLayout): void => {
  LoadTilesetPalette(runtime, mapLayout.primaryTileset, BG_PLTT_ID(0), NUM_PALS_IN_PRIMARY * PLTT_SIZE_4BPP);
};

export const LoadSecondaryTilesetPalette = (runtime: FieldmapRuntime, mapLayout: MapLayout): void => {
  LoadTilesetPalette(
    runtime,
    mapLayout.secondaryTileset,
    BG_PLTT_ID(NUM_PALS_IN_PRIMARY),
    (NUM_PALS_TOTAL - NUM_PALS_IN_PRIMARY) * PLTT_SIZE_4BPP
  );
};

export const CopyMapTilesetsToVram = (runtime: FieldmapRuntime, mapLayout: MapLayout | null): void => {
  if (mapLayout) {
    CopyTilesetToVramUsingHeap(runtime, mapLayout.primaryTileset, NUM_TILES_IN_PRIMARY, 0);
    CopyTilesetToVramUsingHeap(runtime, mapLayout.secondaryTileset, NUM_TILES_TOTAL - NUM_TILES_IN_PRIMARY, NUM_TILES_IN_PRIMARY);
  }
};

export const LoadMapTilesetPalettes = (runtime: FieldmapRuntime, mapLayout: MapLayout | null): void => {
  if (mapLayout) {
    LoadPrimaryTilesetPalette(runtime, mapLayout);
    LoadSecondaryTilesetPalette(runtime, mapLayout);
  }
};
