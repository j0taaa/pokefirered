import { describe, expect, test } from 'vitest';
import { BG_PLTT_ID, createDecompPaletteRuntime, RGB } from '../src/game/decompPalette';
import {
  ApplyGlobalTintToPaletteSlot,
  CONNECTION_EAST,
  CONNECTION_NONE,
  CONNECTION_NORTH,
  CONNECTION_SOUTH,
  CONNECTION_WEST,
  CopyMapTilesetsToVram,
  CopyPrimaryTilesetToVram,
  CopySecondaryTilesetToVram,
  CopySecondaryTilesetToVramUsingHeap,
  ExtractMetatileAttribute,
  GetCameraCoords,
  GetCameraFocusCoords,
  GetIncomingConnection,
  GetAttributeByMetatileIdAndMapLayout,
  GetMapBorderIdAt,
  GetMapConnectionAtPos,
  InitMap,
  InitMapFromSavedGame,
  IsCoordInIncomingConnectingMap,
  LoadMapTilesetPalettes,
  MAPGRID_COLLISION_MASK,
  MAPGRID_ELEVATION_MASK,
  MAPGRID_UNDEFINED,
  MAP_OFFSET,
  MAP_OFFSET_H,
  MAP_OFFSET_W,
  METATILE_ATTRIBUTE_BEHAVIOR,
  METATILE_ATTRIBUTE_ENCOUNTER_TYPE,
  METATILE_ATTRIBUTE_LAYER_TYPE,
  METATILE_ATTRIBUTES_ALL,
  MapGridGetCollisionAt,
  MapGridGetElevationAt,
  MapGridGetMetatileAttributeAt,
  MapGridGetMetatileBehaviorAt,
  MapGridGetMetatileIdAt,
  MapGridGetMetatileLayerTypeAt,
  MapGridSetMetatileEntryAt,
  MapGridSetMetatileIdAt,
  MapGridSetMetatileImpassabilityAt,
  MoveMapViewToBackup,
  NUM_PALS_IN_PRIMARY,
  QL_TINT_BACKUP_GRAYSCALE,
  QL_TINT_GRAYSCALE,
  SaveMapView,
  SetCameraCoords,
  SetCameraFocusCoords,
  CameraMove,
  CanCameraMoveInDirection,
  createFieldmapRuntime,
  type MapHeader,
  type MapLayout,
  type Tileset
} from '../src/game/decompFieldmap';

const makeTileset = (attrs: number[], overrides: Partial<Tileset> = {}): Tileset => ({
  isCompressed: false,
  isSecondary: false,
  tiles: 'tiles',
  palettes: Array.from({ length: 13 }, (_, pal) => Array.from({ length: 16 }, (_, i) => RGB(pal, i & 31, 0))),
  metatileAttributes: attrs,
  ...overrides
});

const makeLayout = (
  width: number,
  height: number,
  base = 1,
  overrides: Partial<MapLayout> = {}
): MapLayout => ({
  width,
  height,
  border: [0x55, 0x66, 0x77, 0x88],
  map: Array.from({ length: width * height }, (_, i) => base + i),
  primaryTileset: makeTileset([
    0,
    0x0000002a,
    (3 << 29) | (2 << 24) | 0x1aa
  ]),
  secondaryTileset: makeTileset([0x1bb, (1 << 29) | 0x1cc], { isSecondary: true, tiles: 'secondaryTiles' }),
  borderWidth: 2,
  borderHeight: 2,
  ...overrides
});

const makeHeader = (layout: MapLayout): MapHeader => ({ mapLayout: layout });

describe('decomp fieldmap.c parity', () => {
  test('InitMap fills undefined backup, copies layout at the MAP_OFFSET origin, and runs load script', () => {
    const layout = makeLayout(3, 2, 10);
    const runtime = createFieldmapRuntime({ gMapHeader: makeHeader(layout) });

    InitMap(runtime);

    expect(runtime.VMap.Xsize).toBe(3 + MAP_OFFSET_W);
    expect(runtime.VMap.Ysize).toBe(2 + MAP_OFFSET_H);
    expect(runtime.gBackupMapData[0]).toBe(MAPGRID_UNDEFINED);
    expect(runtime.gBackupMapData[runtime.VMap.Xsize * 7 + MAP_OFFSET]).toBe(10);
    expect(runtime.gBackupMapData[runtime.VMap.Xsize * 8 + MAP_OFFSET + 2]).toBe(15);
    expect(runtime.operations).toContain('RunOnLoadMapScript');
  });

  test('connection fills clip south, north, west, and east maps with the same asymmetric widths as C', () => {
    const main = makeLayout(4, 4, 100);
    const south = makeHeader(makeLayout(5, 10, 200));
    const north = makeHeader(makeLayout(5, 10, 300));
    const west = makeHeader(makeLayout(10, 5, 400));
    const east = makeHeader(makeLayout(10, 5, 500));
    const runtime = createFieldmapRuntime({
      gMapHeader: {
        mapLayout: main,
        connections: {
          count: 4,
          connections: [
            { direction: CONNECTION_SOUTH, offset: -3, mapGroup: 1, mapNum: 1, mapHeader: south },
            { direction: CONNECTION_NORTH, offset: -3, mapGroup: 1, mapNum: 2, mapHeader: north },
            { direction: CONNECTION_WEST, offset: -2, mapGroup: 1, mapNum: 3, mapHeader: west },
            { direction: CONNECTION_EAST, offset: -2, mapGroup: 1, mapNum: 4, mapHeader: east }
          ]
        }
      }
    });

    InitMap(runtime);

    expect(runtime.gMapConnectionFlags).toEqual({ south: true, north: true, west: true, east: true });
    expect(runtime.VMap.map[(4 + MAP_OFFSET) * runtime.VMap.Xsize + 4]).toBe(200);
    expect(runtime.VMap.map[4]).toBe(315);
    expect(runtime.VMap.map[5 * runtime.VMap.Xsize + 0]).toBe(403);
    expect(runtime.VMap.map[5 * runtime.VMap.Xsize + (4 + MAP_OFFSET)]).toBe(500);
  });

  test('grid getters distinguish undefined cells, wrapped border blocks, collision, elevation, and metatile id', () => {
    const runtime = createFieldmapRuntime({ gMapHeader: makeHeader(makeLayout(2, 2, 1)) });
    InitMap(runtime);
    const x = MAP_OFFSET;
    const y = MAP_OFFSET;
    MapGridSetMetatileEntryAt(runtime, x, y, 0xa000 | 0x0800 | 0x0123);

    expect(MapGridGetElevationAt(runtime, x, y)).toBe(10);
    expect(MapGridGetCollisionAt(runtime, x, y)).toBe(2);
    expect(MapGridGetMetatileIdAt(runtime, x, y)).toBe(0x123);
    expect(MapGridGetCollisionAt(runtime, 0, 0)).toBe(1);
    expect(MapGridGetMetatileIdAt(runtime, -1, -1)).toBe(0x55);
    expect(MapGridGetCollisionAt(runtime, -1, -1)).toBe(3);
  });

  test('metatile attributes use exact masks and primary/secondary tileset routing', () => {
    const runtime = createFieldmapRuntime({ gMapHeader: makeHeader(makeLayout(2, 2, 1)) });
    InitMap(runtime);
    expect(ExtractMetatileAttribute((3 << 29) | (2 << 24) | 0x1aa, METATILE_ATTRIBUTE_BEHAVIOR)).toBe(0x1aa);
    expect(ExtractMetatileAttribute((3 << 29) | (2 << 24) | 0x1aa, METATILE_ATTRIBUTE_ENCOUNTER_TYPE)).toBe(2);
    expect(ExtractMetatileAttribute(0x87654321, METATILE_ATTRIBUTES_ALL)).toBe(0x87654321);
    expect(MapGridGetMetatileBehaviorAt(runtime, MAP_OFFSET, MAP_OFFSET)).toBe(0x2a);

    MapGridSetMetatileEntryAt(runtime, MAP_OFFSET, MAP_OFFSET, 640);
    expect(MapGridGetMetatileAttributeAt(runtime, MAP_OFFSET, MAP_OFFSET, METATILE_ATTRIBUTE_BEHAVIOR)).toBe(0x1bb);
    MapGridSetMetatileEntryAt(runtime, MAP_OFFSET, MAP_OFFSET, 641);
    expect(MapGridGetMetatileLayerTypeAt(runtime, MAP_OFFSET, MAP_OFFSET)).toBe(1);
    expect(MapGridGetMetatileAttributeAt(runtime, MAP_OFFSET, MAP_OFFSET, METATILE_ATTRIBUTE_LAYER_TYPE)).toBe(1);
    expect(GetAttributeByMetatileIdAndMapLayout(runtime.gMapHeader.mapLayout, 1024, METATILE_ATTRIBUTE_BEHAVIOR)).toBe(0xff);
  });

  test('grid setters preserve elevation for id writes and toggle impassability bits only in bounds', () => {
    const runtime = createFieldmapRuntime({ gMapHeader: makeHeader(makeLayout(2, 2, 1)) });
    InitMap(runtime);
    const x = MAP_OFFSET;
    const y = MAP_OFFSET;
    MapGridSetMetatileEntryAt(runtime, x, y, MAPGRID_ELEVATION_MASK | 0x0123);
    MapGridSetMetatileIdAt(runtime, x, y, 0x0456);
    expect(runtime.VMap.map[x + y * runtime.VMap.Xsize]).toBe(MAPGRID_ELEVATION_MASK | 0x0456);

    MapGridSetMetatileImpassabilityAt(runtime, x, y, true);
    expect(runtime.VMap.map[x + y * runtime.VMap.Xsize] & MAPGRID_COLLISION_MASK).toBe(MAPGRID_COLLISION_MASK);
    MapGridSetMetatileImpassabilityAt(runtime, x, y, false);
    expect(runtime.VMap.map[x + y * runtime.VMap.Xsize] & MAPGRID_COLLISION_MASK).toBe(0);

    MapGridSetMetatileEntryAt(runtime, -1, -1, 999);
    expect(runtime.gBackupMapData[0]).toBe(MAPGRID_UNDEFINED);
  });

  test('saved map view copies the exact 15x14 camera rectangle and restores then clears it', () => {
    const runtime = createFieldmapRuntime({ gMapHeader: makeHeader(makeLayout(20, 20, 1)) });
    InitMap(runtime);
    runtime.gSaveBlock1Ptr.pos = { x: 2, y: 3 };
    for (let i = 0; i < runtime.gBackupMapData.length; i++) runtime.gBackupMapData[i] = i & 0xffff;

    SaveMapView(runtime);
    expect(runtime.gSaveBlock2Ptr.mapView[0]).toBe(3 * runtime.VMap.Xsize + 2);
    expect(runtime.gSaveBlock2Ptr.mapView[MAP_OFFSET_W]).toBe(4 * runtime.VMap.Xsize + 2);

    runtime.gBackupMapData.fill(0);
    InitMapFromSavedGame(runtime);
    expect(runtime.gBackupMapData[3 * runtime.VMap.Xsize + 2]).toBe(3 * runtime.VMap.Xsize + 2);
    expect(runtime.gSaveBlock2Ptr.mapView[0]).toBe(0);
  });

  test('MoveMapViewToBackup mirrors the C directional source offsets before clearing saved view', () => {
    const runtime = createFieldmapRuntime({ gMapHeader: makeHeader(makeLayout(20, 20, 1)) });
    InitMap(runtime);
    runtime.gSaveBlock1Ptr.pos = { x: 4, y: 5 };
    for (let i = 0; i < runtime.gSaveBlock2Ptr.mapView.length; i++) runtime.gSaveBlock2Ptr.mapView[i] = 1000 + i;

    MoveMapViewToBackup(runtime, CONNECTION_EAST);
    expect(runtime.gBackupMapData[5 * runtime.VMap.Xsize + 4]).toBe(1001);
    expect(runtime.gBackupMapData[5 * runtime.VMap.Xsize + 4 + MAP_OFFSET_W - 2]).toBe(1014);
    expect(runtime.gSaveBlock2Ptr.mapView[1]).toBe(0);
  });

  test('border ids and camera movement use connection flags and transition position math', () => {
    const main = makeLayout(3, 3, 100);
    const eastHeader = makeHeader(makeLayout(4, 3, 200));
    const connection = { direction: CONNECTION_EAST, offset: 0, mapGroup: 9, mapNum: 8, mapHeader: eastHeader };
    const runtime = createFieldmapRuntime({
      gMapHeader: { mapLayout: main, connections: { count: 1, connections: [connection] } },
      gSaveBlock1Ptr: { pos: { x: 2, y: 1 } }
    });
    InitMap(runtime);
    runtime.gSaveBlock2Ptr.mapView.fill(7);

    expect(GetMapBorderIdAt(runtime, MAP_OFFSET, MAP_OFFSET)).toBe(CONNECTION_NONE);
    expect(GetMapBorderIdAt(runtime, runtime.VMap.Xsize - MAP_OFFSET - 1, MAP_OFFSET + 1)).toBe(CONNECTION_EAST);
    expect(CanCameraMoveInDirection(runtime, 4)).toBe(true);
    expect(CameraMove(runtime, 1, 0)).toBe(true);
    expect(runtime.operations).toContain('LoadMapFromCameraTransition:9:8');
    expect(runtime.gCamera).toEqual({ active: true, x: 3, y: 0 });
    expect(runtime.gSaveBlock1Ptr.pos).toEqual({ x: 0, y: 1 });
  });

  test('incoming and position connection helpers match inclusive bounds and skip invalid directions', () => {
    const main = makeLayout(10, 10, 1);
    const north = makeHeader(makeLayout(4, 4, 20));
    const south = makeHeader(makeLayout(5, 5, 40));
    const dive = makeHeader(makeLayout(5, 5, 60));
    const runtime = createFieldmapRuntime({
      gMapHeader: {
        mapLayout: main,
        connections: {
          count: 3,
          connections: [
            { direction: CONNECTION_NORTH, offset: 2, mapGroup: 1, mapNum: 1, mapHeader: north },
            { direction: CONNECTION_SOUTH, offset: -1, mapGroup: 1, mapNum: 2, mapHeader: south },
            { direction: 5, offset: 0, mapGroup: 1, mapNum: 3, mapHeader: dive }
          ]
        }
      }
    });

    expect(IsCoordInIncomingConnectingMap(2, 10, 4, 2)).toBe(true);
    expect(IsCoordInIncomingConnectingMap(7, 10, 4, 2)).toBe(false);
    expect(GetIncomingConnection(runtime, CONNECTION_NORTH, 3, 0)?.mapNum).toBe(1);
    expect(GetMapConnectionAtPos(runtime, 9, 6)?.direction).toBe(CONNECTION_NORTH);
    expect(GetMapConnectionAtPos(runtime, 7, 20)?.direction).toBe(CONNECTION_SOUTH);
    expect(GetMapConnectionAtPos(runtime, 0, 0)?.direction).not.toBe(5);
  });

  test('camera coordinate helpers apply and remove MAP_OFFSET exactly', () => {
    const runtime = createFieldmapRuntime();
    SetCameraFocusCoords(runtime, 20, 30);
    expect(runtime.gSaveBlock1Ptr.pos).toEqual({ x: 13, y: 23 });
    expect(GetCameraFocusCoords(runtime)).toEqual({ x: 20, y: 30 });
    SetCameraCoords(runtime, 3, 4);
    expect(GetCameraCoords(runtime)).toEqual({ x: 3, y: 4 });
  });

  test('tileset copy and palette loading preserve primary/secondary/compressed branches and tint side effects', () => {
    const paletteRuntime = createDecompPaletteRuntime();
    const primary = makeTileset([], { tiles: 'primaryTiles' });
    const secondary = makeTileset([], { isCompressed: true, isSecondary: true, tiles: 'secondaryTiles' });
    const layout = makeLayout(1, 1, 1, { primaryTileset: primary, secondaryTileset: secondary });
    const runtime = createFieldmapRuntime({
      gMapHeader: makeHeader(layout),
      paletteRuntime,
      gGlobalFieldTintMode: QL_TINT_GRAYSCALE
    });

    CopyPrimaryTilesetToVram(runtime, layout);
    CopySecondaryTilesetToVram(runtime, layout);
    CopySecondaryTilesetToVramUsingHeap(runtime, layout);
    CopyMapTilesetsToVram(runtime, layout);
    expect(runtime.operations).toContain('LoadBgTiles:2:primaryTiles:20480:0');
    expect(runtime.operations).toContain('DecompressAndCopyTileDataToVram2:2:secondaryTiles:12288:640:0');
    expect(runtime.operations).toContain('DecompressAndLoadBgGfxUsingHeap2:2:secondaryTiles:12288:640:0');

    LoadMapTilesetPalettes(runtime, layout);
    expect(paletteRuntime.gPlttBufferUnfaded[0]).toBe(0);
    expect(paletteRuntime.gPlttBufferUnfaded[1]).toBe(paletteRuntime.gPlttBufferFaded[1]);
    expect(paletteRuntime.gPlttBufferUnfaded[BG_PLTT_ID(NUM_PALS_IN_PRIMARY)]).toBe(
      paletteRuntime.gPlttBufferFaded[BG_PLTT_ID(NUM_PALS_IN_PRIMARY)]
    );

    runtime.gGlobalFieldTintMode = QL_TINT_BACKUP_GRAYSCALE;
    paletteRuntime.gPlttBufferUnfaded[16] = RGB(31, 0, 0);
    ApplyGlobalTintToPaletteSlot(runtime, 1, 1);
    expect(runtime.operations).toContain('QuestLog_BackUpPalette:16:16');
    expect(paletteRuntime.gPlttBufferUnfaded[16]).toBe(RGB(9, 9, 9));
  });
});
