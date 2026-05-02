import { describe, expect, test } from 'vitest';
import {
  BG_ATTR_BGTYPE,
  BG_ATTR_MAPSIZE,
  BG_COORD_ADD,
  BG_COORD_SET,
  BG_COORD_SUB,
  BG_CTRL_ATTR_CHARBASEINDEX,
  BG_CTRL_ATTR_MAPBASEINDEX,
  BG_CTRL_ATTR_PRIORITY,
  BG_CTRL_ATTR_VISIBLE,
  BG_MOSAIC_DEC_H,
  BG_MOSAIC_INC_V,
  BG_MOSAIC_SET,
  BG_TILE_ALLOC,
  BG_TILE_FIND_FREE_SPACE,
  BG_TILE_FREE,
  BG_VRAM,
  AdjustBgMosaic,
  ChangeBgX,
  ChangeBgY,
  CopyBgTilemapBufferToVram,
  CopyRectToBgTilemapBufferRect,
  CopyTileMapEntry,
  CopyToBgTilemapBuffer,
  CopyToBgTilemapBufferRect,
  FillBgTilemapBufferRect,
  FillBgTilemapBufferRect_Palette0,
  GetBgAttribute,
  GetBgControlAttribute,
  GetBgMetricAffineMode,
  GetBgMetricTextMode,
  GetBgMode,
  GetBgTilemapBuffer,
  GetBgType,
  GetBgX,
  GetBgY,
  GetGpuReg,
  GetTileMapIndexFromCoords,
  HideBg,
  HideBgInternal,
  InitBgsFromTemplates,
  IsDma3ManagerBusyWithBgCopy,
  IsInvalidBg,
  IsInvalidBg32,
  IsTileMapOutsideWram,
  LoadBgTilemap,
  LoadBgTiles,
  REG_OFFSET_BG0CNT,
  REG_OFFSET_BG0HOFS,
  REG_OFFSET_BG0VOFS,
  REG_OFFSET_BG2PA,
  REG_OFFSET_BG2X_H,
  REG_OFFSET_BG2X_L,
  REG_OFFSET_BG2Y_H,
  REG_OFFSET_BG2Y_L,
  REG_OFFSET_BG3X_H,
  REG_OFFSET_BG3X_L,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_MOSAIC,
  ResetBgs,
  ResetBgsAndClearDma3BusyFlags,
  SetBgAffine,
  SetBgAffineInternal,
  SetBgAttribute,
  SetBgControlAttributes,
  SetBgModeInternal,
  SetBgTilemapBuffer,
  SetGpuReg,
  ShowBg,
  SyncBgVisibilityAndMode,
  UnsetBgTilemapBuffer,
  WriteSequenceToBgTilemapBuffer,
  createBgRuntime,
  BgTileAllocOp
} from '../src/game/decompBg';

describe('decomp bg', () => {
  test('ResetBgs, InitBgsFromTemplates, ShowBg, HideBg, and attributes preserve DISPCNT masking and CNT packing', () => {
    const runtime = createBgRuntime();
    SetGpuReg(runtime, REG_OFFSET_DISPCNT, 0xf0f7);

    ResetBgs(runtime);

    expect(GetGpuReg(runtime, REG_OFFSET_DISPCNT)).toBe(0xf0f0);
    expect(GetBgControlAttribute(runtime, 0, BG_CTRL_ATTR_VISIBLE)).toBe(0xff);

    InitBgsFromTemplates(
      runtime,
      2,
      [{ bg: 0, charBaseIndex: 3, mapBaseIndex: 31, screenSize: 2, paletteMode: 1, priority: 2, baseTile: 7 }],
      1
    );
    expect(GetBgMode(runtime)).toBe(2);
    expect(GetBgControlAttribute(runtime, 0, BG_CTRL_ATTR_CHARBASEINDEX)).toBe(3);
    expect(GetBgControlAttribute(runtime, 0, BG_CTRL_ATTR_MAPBASEINDEX)).toBe(31);

    SetBgControlAttributes(runtime, 0, 0xff, 0xff, 0xff, 0xff, 3, 1, 1);
    ShowBg(runtime, 0);

    const expectedCnt = 3 | (3 << 2) | (1 << 6) | (1 << 7) | (31 << 8) | (1 << 13) | (2 << 14);
    expect(GetGpuReg(runtime, REG_OFFSET_BG0CNT)).toBe(expectedCnt);
    expect(GetGpuReg(runtime, REG_OFFSET_DISPCNT)).toBe(0xf1f2);

    HideBg(runtime, 0);
    expect(GetGpuReg(runtime, REG_OFFSET_DISPCNT)).toBe(0xf0f2);
    ShowBg(runtime, 0);
    HideBgInternal(runtime, 0);
    SyncBgVisibilityAndMode(runtime);
    expect(GetGpuReg(runtime, REG_OFFSET_DISPCNT)).toBe(0xf0f2);
    expect(runtime.gpu_tile_allocation_map_bg[(3 * 512) / 8]).toBe(1);
  });

  test('SetBgAttribute and GetBgAttribute follow the decomp switch order and map-size logic', () => {
    const runtime = createBgRuntime();
    InitBgsFromTemplates(runtime, 0, [{ bg: 2, charBaseIndex: 1, mapBaseIndex: 2, screenSize: 3, paletteMode: 0, priority: 1, baseTile: 44 }], 1);

    SetBgAttribute(runtime, 2, 7, 3);
    SetBgAttribute(runtime, 2, 5, 1);
    SetBgAttribute(runtime, 2, 6, 1);

    expect(GetBgControlAttribute(runtime, 2, BG_CTRL_ATTR_PRIORITY)).toBe(3);
    expect(GetBgAttribute(runtime, 2, BG_ATTR_BGTYPE)).toBe(0);
    expect(GetBgAttribute(runtime, 2, BG_ATTR_MAPSIZE)).toBe(0x2000);

    SetBgModeInternal(runtime, 2);
    expect(GetBgType(runtime, 2)).toBe(1);
    expect(GetBgAttribute(runtime, 2, BG_ATTR_MAPSIZE)).toBe(0x4000);
    expect(GetBgAttribute(runtime, 2, 99)).toBe(0xffffffff);
  });

  test('LoadBgTiles, LoadBgTilemap, DMA busy flags, and tile allocation match C bookkeeping', () => {
    const runtime = createBgRuntime();
    ResetBgsAndClearDma3BusyFlags(runtime, 1);
    InitBgsFromTemplates(runtime, 0, [{ bg: 1, charBaseIndex: 1, mapBaseIndex: 4, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 8 }], 1);

    const tiles = new Uint8Array([1, 2, 3, 4]);
    const tileCursor = LoadBgTiles(runtime, 1, tiles, 0x40, 2);
    const mapCursor = LoadBgTilemap(runtime, 1, tiles, 0x80, 3);

    expect(tileCursor).toBe(0);
    expect(mapCursor).toBe(1);
    expect(runtime.dmaRequests[0]).toMatchObject({ cursor: 0, src: tiles, dest: BG_VRAM + 0x4000 + 0x140, size: 0x40 });
    expect(runtime.dmaRequests[1]).toMatchObject({ cursor: 1, dest: BG_VRAM + 4 * 0x800 + 3 * 32, size: 0x80 });
    expect(runtime.sDmaBusyBitfield[0] & 0b11).toBe(0b11);
    expect(BgTileAllocOp(runtime, 1, 0, 1, BG_TILE_FIND_FREE_SPACE)).toBe(-1);
    expect(BgTileAllocOp(runtime, 1, 0, 2, BG_TILE_FIND_FREE_SPACE)).toBe(1);

    runtime.busyDmaCursors.add(1);
    expect(IsDma3ManagerBusyWithBgCopy(runtime)).toBe(1);
    expect(runtime.sDmaBusyBitfield[0] & 0b10).toBe(0b10);
    runtime.busyDmaCursors.clear();
    expect(IsDma3ManagerBusyWithBgCopy(runtime)).toBe(0);
    expect(runtime.sDmaBusyBitfield[0]).toBe(0);
  });

  test('BgTileAllocOp finds, allocates, and frees relative to the bg character block', () => {
    const runtime = createBgRuntime();
    InitBgsFromTemplates(runtime, 0, [{ bg: 0, charBaseIndex: 2, mapBaseIndex: 0, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 }], 1);

    BgTileAllocOp(runtime, 0, 4, 3, BG_TILE_ALLOC);
    expect(BgTileAllocOp(runtime, 0, 0, 4, BG_TILE_FIND_FREE_SPACE)).toBe(7);

    BgTileAllocOp(runtime, 0, 4, 3, BG_TILE_FREE);
    expect(BgTileAllocOp(runtime, 0, 0, 4, BG_TILE_FIND_FREE_SPACE)).toBe(1);
  });

  test('ChangeBgX and ChangeBgY write text and affine scroll registers exactly by bg/mode', () => {
    const runtime = createBgRuntime();
    InitBgsFromTemplates(
      runtime,
      0,
      [
        { bg: 0, charBaseIndex: 0, mapBaseIndex: 0, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
        { bg: 3, charBaseIndex: 1, mapBaseIndex: 1, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 }
      ],
      2
    );

    expect(GetBgX(runtime, 0)).toBe(0);
    expect(GetBgY(runtime, 0)).toBe(0);
    expect(GetBgX(runtime, 4)).toBe(0xffffffff);

    expect(ChangeBgX(runtime, 0, 0x12345, BG_COORD_SET)).toBe(0x12345);
    expect(GetGpuReg(runtime, REG_OFFSET_BG0HOFS)).toBe(0x123);
    expect(ChangeBgY(runtime, 0, 0x200, BG_COORD_SET)).toBe(0x200);
    expect(GetGpuReg(runtime, REG_OFFSET_BG0VOFS)).toBe(2);

    SetBgModeInternal(runtime, 2);
    ChangeBgX(runtime, 3, 0x12345678, BG_COORD_SET);
    ChangeBgX(runtime, 3, 0x100, BG_COORD_SUB);
    ChangeBgY(runtime, 3, 0x01020304, BG_COORD_SET);
    ChangeBgY(runtime, 3, 0x10, BG_COORD_ADD);

    expect(GetGpuReg(runtime, REG_OFFSET_BG3X_H)).toBe(0x1234);
    expect(GetGpuReg(runtime, REG_OFFSET_BG3X_L)).toBe(0x5578);
    expect(GetGpuReg(runtime, REG_OFFSET_BG2X_H)).toBe(0);
    expect(GetGpuReg(runtime, REG_OFFSET_BG2Y_H)).toBe(0);
    expect(GetGpuReg(runtime, REG_OFFSET_BG2Y_L)).toBe(0);
  });

  test('SetBgAffine accepts only mode 1 bg2 or mode 2 bg2/bg3 and still writes BG2 affine registers for bg3', () => {
    const runtime = createBgRuntime();
    runtime.affineSet = () => ({ pa: 1, pb: 2, pc: 3, pd: 4, dx: 0x12345678, dy: 0x87654321 });

    InitBgsFromTemplates(runtime, 1, [{ bg: 3, charBaseIndex: 0, mapBaseIndex: 0, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 }], 1);
    SetBgAffine(runtime, 3, 0, 0, 0, 0, 0, 0, 0);
    expect(GetGpuReg(runtime, REG_OFFSET_BG2PA)).toBe(0);

    SetBgModeInternal(runtime, 2);
    SetBgAffineInternal(runtime, 3, 0, 0, 0, 0, 0, 0, 0);
    expect(GetGpuReg(runtime, REG_OFFSET_BG2PA)).toBe(1);
    expect(GetGpuReg(runtime, REG_OFFSET_BG2X_L)).toBe(0x5678);
    expect(GetGpuReg(runtime, REG_OFFSET_BG2X_H)).toBe(0x1234);
    expect(GetGpuReg(runtime, REG_OFFSET_BG2Y_L)).toBe(0x4321);
    expect(GetGpuReg(runtime, REG_OFFSET_BG2Y_H)).toBe(0x8765);
    SetBgAffine(runtime, 3, 0, 0, 0, 0, 0, 0, 0);
    expect(GetGpuReg(runtime, REG_OFFSET_BG2PA)).toBe(1);
  });

  test('AdjustBgMosaic preserves the upper byte and saturates nibble changes', () => {
    const runtime = createBgRuntime();
    SetGpuReg(runtime, REG_OFFSET_MOSAIC, 0xab00);

    expect(AdjustBgMosaic(runtime, 0x25, BG_MOSAIC_SET)).toBe(0x25);
    expect(GetGpuReg(runtime, REG_OFFSET_MOSAIC)).toBe(0xab25);
    expect(AdjustBgMosaic(runtime, 0x20, BG_MOSAIC_INC_V)).toBe(0xf5);
    expect(AdjustBgMosaic(runtime, 0x09, BG_MOSAIC_DEC_H)).toBe(0xf0);
  });

  test('tilemap buffer setters, flat copies, and VRAM copy preserve text-mode offsets', () => {
    const runtime = createBgRuntime();
    InitBgsFromTemplates(runtime, 0, [{ bg: 0, charBaseIndex: 0, mapBaseIndex: 5, screenSize: 1, paletteMode: 0, priority: 0, baseTile: 0 }], 1);
    const tilemap = new Uint16Array(0x800);

    expect(GetBgTilemapBuffer(runtime, 0)).toBe(null);
    SetBgTilemapBuffer(runtime, 0, tilemap);
    expect(GetBgTilemapBuffer(runtime, 0)).toBe(tilemap);
    expect(IsTileMapOutsideWram(runtime, 0)).toBe(0);

    CopyToBgTilemapBuffer(runtime, 0, new Uint16Array([1, 2, 3]), 4, 1);
    expect(Array.from(tilemap.slice(16, 18))).toEqual([1, 2]);

    CopyToBgTilemapBufferRect(runtime, 0, new Uint16Array([7, 8, 9, 10]), 2, 3, 2, 2);
    expect(tilemap[3 * 32 + 2]).toBe(7);
    expect(tilemap[4 * 32 + 3]).toBe(10);

    CopyBgTilemapBufferToVram(runtime, 0);
    expect(runtime.dmaRequests.at(-1)).toMatchObject({ src: tilemap, dest: BG_VRAM + 5 * 0x800, size: 0x1000 });

    UnsetBgTilemapBuffer(runtime, 0);
    expect(IsTileMapOutsideWram(runtime, 0)).toBe(1);
  });

  test('rect, fill, sequence, metrics, and tile entry helpers match text and affine rules', () => {
    const runtime = createBgRuntime();
    InitBgsFromTemplates(runtime, 0, [{ bg: 1, charBaseIndex: 0, mapBaseIndex: 0, screenSize: 3, paletteMode: 0, priority: 0, baseTile: 0 }], 1);
    const textMap = new Uint16Array(0x1000);
    SetBgTilemapBuffer(runtime, 1, textMap);

    CopyRectToBgTilemapBufferRect(runtime, 1, new Uint16Array([1, 2, 3, 4, 5, 6]), 1, 0, 3, 2, 31, 33, 2, 2, 4, 1, 2);
    expect(textMap[GetTileMapIndexFromCoords(31, 33, 3, 64, 64)]).toBe(0x6003);
    expect(textMap[GetTileMapIndexFromCoords(32, 34, 3, 64, 64)]).toBe(0x6007);

    FillBgTilemapBufferRect_Palette0(runtime, 1, 0x123, 1, 1, 2, 1);
    expect(Array.from(textMap.slice(33, 35))).toEqual([0x123, 0x123]);

    FillBgTilemapBufferRect(runtime, 1, 0x22, 2, 2, 2, 1, 3);
    expect(Array.from(textMap.slice(66, 68))).toEqual([0x3022, 0x3022]);

    WriteSequenceToBgTilemapBuffer(runtime, 1, 0x3ff, 4, 2, 3, 1, 1, 2);
    expect(Array.from(textMap.slice(68, 71))).toEqual([0x13ff, 0x1001, 0x1003]);
    expect(GetBgMetricTextMode(runtime, 1, 0)).toBe(4);

    const src = new Uint16Array([0x111, 0x222]);
    const dst = new Uint16Array([0xfc00, 0]);
    CopyTileMapEntry(src, 0, dst, 0, 16, 5, 0);
    CopyTileMapEntry(src, 1, dst, 1, 17, 1, 2);
    expect(Array.from(dst)).toEqual([0xfd16, 0x2223]);

    SetBgModeInternal(runtime, 2);
    InitBgsFromTemplates(runtime, 2, [{ bg: 2, charBaseIndex: 0, mapBaseIndex: 0, screenSize: 1, paletteMode: 0, priority: 0, baseTile: 0 }], 1);
    const affineMap = new Uint8Array(0x400);
    SetBgTilemapBuffer(runtime, 2, affineMap);
    CopyToBgTilemapBufferRect(runtime, 2, new Uint8Array([1, 2, 3, 4]), 1, 2, 2, 2);
    CopyRectToBgTilemapBufferRect(runtime, 2, new Uint8Array([9, 8, 7, 6]), 0, 0, 2, 2, 3, 4, 2, 2, 0, 5, 0);

    expect(GetBgMetricAffineMode(runtime, 2, 1)).toBe(0x20);
    expect(affineMap[2 * 0x20 + 1]).toBe(1);
    expect(affineMap[4 * 0x20 + 3]).toBe(14);
  });

  test('invalid bg helpers preserve C return values', () => {
    expect(IsInvalidBg(3)).toBe(0);
    expect(IsInvalidBg(4)).toBe(1);
    expect(IsInvalidBg32(255)).toBe(1);
  });
});
