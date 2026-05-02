import { describe, expect, it } from 'vitest';
import {
  AddWindow,
  BlitBitmapRectToWindowWithColorKey,
  BG_ATTR_BASETILE,
  BG_TILE_ALLOC,
  BG_TILE_FIND_FREE_SPACE,
  BG_TILE_FREE,
  COPYWIN_FULL,
  COPYWIN_GFX,
  COPYWIN_MAP,
  CallWindowFunction,
  ClearWindowTilemap,
  CopyToWindowPixelBuffer,
  CopyWindowToVram,
  FillWindowPixelBuffer,
  FillWindowPixelRect,
  FreeAllWindowBuffers,
  GetNumActiveWindowsOnBg,
  GetWindowAttribute,
  InitWindows,
  NULLSUB_8_SENTINEL,
  PutWindowRectTilemap,
  PutWindowRectTilemapOverridePalette,
  PutWindowTilemap,
  RemoveWindow,
  ScrollWindow,
  SetWindowAttribute,
  WINDOW_BASE_BLOCK,
  WINDOW_BG,
  WINDOW_HEIGHT,
  WINDOW_NONE,
  WINDOW_PALETTE_NUM,
  WINDOW_TILEMAP_LEFT,
  WINDOW_TILEMAP_TOP,
  WINDOW_WIDTH,
  WINDOWS_MAX,
  WINDOW_C_TRANSLATION_UNIT,
  createWindowRuntime,
  nullsub_8,
  sDummyWindowTemplate,
  type WindowTemplate,
} from '../src/game/decompWindow';

const template = (overrides: Partial<WindowTemplate> = {}): WindowTemplate => ({
  bg: 0,
  tilemapLeft: 1,
  tilemapTop: 2,
  width: 2,
  height: 2,
  paletteNum: 3,
  baseBlock: 4,
  ...overrides,
});

const terminator: WindowTemplate = { bg: 0xff, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 };

describe('decompWindow', () => {
  it('exports window.c nullsub_8 as the same intentional no-op sentinel callback', () => {
    expect(WINDOW_C_TRANSLATION_UNIT).toBe('src/window.c');
    expect(nullsub_8()).toBeUndefined();
  });

  it('InitWindows initializes sentinels, allocates tile buffers, and resets clear tile', () => {
    const runtime = createWindowRuntime();
    runtime.bgTilemapBuffers[1] = new Uint8Array(8);
    runtime.bgMapSizes[0] = 16;

    expect(InitWindows(runtime, [template(), terminator])).toBe(true);

    expect(runtime.gWindowBgTilemapBuffers[1]).toBe(NULLSUB_8_SENTINEL);
    expect(runtime.gWindowBgTilemapBuffers[0]).toBeInstanceOf(Uint8Array);
    expect(runtime.bgTilemapBuffers[0]).toBe(runtime.gWindowBgTilemapBuffers[0]);
    expect(runtime.gWindows[0].window).toEqual(template());
    expect(runtime.gWindows[0].tileData).toHaveLength(0x20 * 4);
    expect(runtime.gWindows[1].window).toEqual(sDummyWindowTemplate);
    expect(runtime.gWindowClearTile).toBe(0);
    expect(runtime.calls[0]).toEqual({ fn: 'SetBgTilemapBuffer', args: [0, 16] });
  });

  it('InitWindows honors auto tile allocation and aborts when find-free-space fails', () => {
    const runtime = createWindowRuntime();
    runtime.gWindowTileAutoAllocEnabled = true;
    runtime.bgTileAllocNext[0] = 7;

    expect(InitWindows(runtime, [template(), terminator])).toBe(true);
    expect(runtime.gWindows[0].window.baseBlock).toBe(7);
    expect(runtime.calls).toContainEqual({ fn: 'BgTileAllocOp', args: [0, 0, 4, BG_TILE_FIND_FREE_SPACE] });
    expect(runtime.calls).toContainEqual({ fn: 'BgTileAllocOp', args: [0, 7, 4, BG_TILE_ALLOC] });

    const failed = createWindowRuntime();
    failed.gWindowTileAutoAllocEnabled = true;
    failed.bgTileAllocNext[0] = -1;
    expect(InitWindows(failed, [template(), terminator])).toBe(false);
    expect(failed.gWindows[0].window.bg).toBe(0xff);
  });

  it('AddWindow returns WINDOW_NONE when full and frees a newly allocated bg buffer when tile allocation fails', () => {
    const runtime = createWindowRuntime();
    for (let i = 0; i < WINDOWS_MAX; i += 1) {
      runtime.gWindows[i].window = template({ bg: 0 });
    }
    expect(AddWindow(runtime, template())).toBe(WINDOW_NONE);

    const failed = createWindowRuntime();
    failed.bgMapSizes[0] = 32;
    failed.allocationFailures.push(0x20 * 4);
    expect(AddWindow(failed, template())).toBe(WINDOW_NONE);
    expect(failed.gWindowBgTilemapBuffers[0]).toBeNull();
    expect(failed.freedObjects).toHaveLength(1);
  });

  it('RemoveWindow frees auto-allocated tiles and only frees the bg buffer after the last active window', () => {
    const runtime = createWindowRuntime();
    runtime.gWindowTileAutoAllocEnabled = true;
    InitWindows(runtime, [template(), template({ tilemapLeft: 5 }), terminator]);
    const bgBuffer = runtime.gWindowBgTilemapBuffers[0];
    const tileData0 = runtime.gWindows[0].tileData;

    RemoveWindow(runtime, 0);

    expect(runtime.calls).toContainEqual({ fn: 'BgTileAllocOp', args: [0, 0, 4, BG_TILE_FREE] });
    expect(runtime.gWindowBgTilemapBuffers[0]).toBe(bgBuffer);
    expect(runtime.freedObjects).toContain(tileData0);
    expect(runtime.gWindows[0].tileData).toBeNull();

    RemoveWindow(runtime, 1);
    expect(runtime.gWindowBgTilemapBuffers[0]).toBeNull();
    expect(runtime.freedObjects).toContain(bgBuffer);
  });

  it('FreeAllWindowBuffers skips nullsub_8 sentinel bg buffers and clears tileData', () => {
    const runtime = createWindowRuntime();
    runtime.bgTilemapBuffers[1] = new Uint8Array(8);
    InitWindows(runtime, [template(), template({ bg: 1 }), terminator]);
    const tileData0 = runtime.gWindows[0].tileData;
    const sentinelTileData = runtime.gWindows[1].tileData;

    FreeAllWindowBuffers(runtime);

    expect(runtime.gWindowBgTilemapBuffers[1]).toBe(NULLSUB_8_SENTINEL);
    expect(runtime.freedObjects).toContain(tileData0);
    expect(runtime.freedObjects).toContain(sentinelTileData);
    expect(runtime.freedObjects).not.toContain(NULLSUB_8_SENTINEL);
    expect(runtime.gWindows[0].tileData).toBeNull();
    expect(runtime.gWindows[1].tileData).toBeNull();
  });

  it('CopyWindowToVram mirrors COPYWIN_MAP, COPYWIN_GFX, and COPYWIN_FULL dispatch', () => {
    const runtime = createWindowRuntime();
    InitWindows(runtime, [template(), terminator]);

    CopyWindowToVram(runtime, 0, COPYWIN_MAP);
    CopyWindowToVram(runtime, 0, COPYWIN_GFX);
    CopyWindowToVram(runtime, 0, COPYWIN_FULL);

    expect(runtime.calls).toContainEqual({ fn: 'CopyBgTilemapBufferToVram', args: [0] });
    expect(runtime.calls).toContainEqual({ fn: 'LoadBgTiles', args: [0, 128, 128, 4] });
    expect(runtime.calls.slice(-2)).toEqual([
      { fn: 'LoadBgTiles', args: [0, 128, 128, 4] },
      { fn: 'CopyBgTilemapBufferToVram', args: [0] },
    ]);
  });

  it('tilemap helpers emit the same calculated tile sequences and fill rect calls', () => {
    const runtime = createWindowRuntime();
    runtime.bgBaseTiles[0] = 100;
    InitWindows(runtime, [template(), terminator]);

    PutWindowTilemap(runtime, 0);
    PutWindowRectTilemapOverridePalette(runtime, 0, 1, 1, 2, 2, 9);
    PutWindowRectTilemap(runtime, 0, 1, 1, 2, 2);
    runtime.gWindowClearTile = 12;
    ClearWindowTilemap(runtime, 0);

    expect(runtime.calls).toContainEqual({ fn: 'WriteSequenceToBgTilemapBuffer', args: [0, 104, 1, 2, 2, 2, 3, 1] });
    expect(runtime.calls).toContainEqual({ fn: 'WriteSequenceToBgTilemapBuffer', args: [0, 107, 2, 3, 2, 1, 9, 1] });
    expect(runtime.calls).toContainEqual({ fn: 'WriteSequenceToBgTilemapBuffer', args: [0, 109, 2, 4, 2, 1, 9, 1] });
    expect(runtime.calls).toContainEqual({ fn: 'WriteSequenceToBgTilemapBuffer', args: [0, 107, 2, 3, 2, 1, 3, 1] });
    expect(runtime.calls).toContainEqual({ fn: 'FillBgTilemapBufferRect', args: [0, 12, 1, 2, 2, 2, 3] });
    expect(BG_ATTR_BASETILE).toBe(10);
  });

  it('pixel helpers copy, fill, and blit 4bpp data with color-key behavior', () => {
    const runtime = createWindowRuntime();
    InitWindows(runtime, [template({ width: 1, height: 1 }), terminator]);
    FillWindowPixelBuffer(runtime, 0, 0xaa);
    expect([...runtime.gWindows[0].tileData!.slice(0, 4)]).toEqual([0xaa, 0xaa, 0xaa, 0xaa]);

    FillWindowPixelRect(runtime, 0, 0x5, 0, 0, 2, 1);
    expect(runtime.gWindows[0].tileData![0]).toBe(0x55);

    CopyToWindowPixelBuffer(runtime, 0, Uint8Array.from([1, 2, 3, 4]), 4, 0);
    expect([...runtime.gWindows[0].tileData!.slice(0, 4)]).toEqual([1, 2, 3, 4]);

    const src = Uint8Array.from([0x21, 0x43]);
    FillWindowPixelBuffer(runtime, 0, 0);
    FillWindowPixelRect(runtime, 0, 0x9, 1, 0, 1, 1);
    const before = runtime.gWindows[0].tileData![0];
    expect(before).toBe(0x90);
    // colorKey 1 skips the first source pixel and copies the second nibble.
    BlitBitmapRectToWindowWithColorKey(runtime, 0, src, 0, 0, 4, 1, 0, 0, 2, 1, 1);
    expect(runtime.gWindows[0].tileData![0]).toBe(0x20);
  });

  it('ScrollWindow implements the decompiled MOVE_TILES_DOWN and MOVE_TILES_UP chunk math', () => {
    const runtime = createWindowRuntime();
    InitWindows(runtime, [template({ width: 2, height: 2 }), terminator]);
    const tileData = runtime.gWindows[0].tileData!;
    for (let i = 0; i < tileData.length; i += 1) tileData[i] = i;

    ScrollWindow(runtime, 0, 0, 1, 0xee);
    expect([...tileData.slice(0, 8)]).toEqual([4, 5, 6, 7, 8, 9, 10, 11]);

    for (let i = 0; i < tileData.length; i += 1) tileData[i] = i;
    ScrollWindow(runtime, 0, 1, 1, 0xee);
    expect([...tileData.slice(-8)]).toEqual([116, 117, 118, 119, 120, 121, 122, 123]);

    for (let i = 0; i < tileData.length; i += 1) tileData[i] = i;
    ScrollWindow(runtime, 0, 2, 7, 0xee);
    expect([...tileData.slice(0, 8)]).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('SetWindowAttribute and GetWindowAttribute match mutable and read-only fields', () => {
    const runtime = createWindowRuntime();
    InitWindows(runtime, [template(), terminator]);

    expect(SetWindowAttribute(runtime, 0, WINDOW_TILEMAP_LEFT, 9)).toBe(false);
    expect(SetWindowAttribute(runtime, 0, WINDOW_TILEMAP_TOP, 10)).toBe(false);
    expect(SetWindowAttribute(runtime, 0, WINDOW_PALETTE_NUM, 11)).toBe(false);
    expect(SetWindowAttribute(runtime, 0, WINDOW_BASE_BLOCK, 12)).toBe(false);
    expect(SetWindowAttribute(runtime, 0, WINDOW_WIDTH, 13)).toBe(true);

    expect(GetWindowAttribute(runtime, 0, WINDOW_BG)).toBe(0);
    expect(GetWindowAttribute(runtime, 0, WINDOW_TILEMAP_LEFT)).toBe(9);
    expect(GetWindowAttribute(runtime, 0, WINDOW_TILEMAP_TOP)).toBe(10);
    expect(GetWindowAttribute(runtime, 0, WINDOW_WIDTH)).toBe(2);
    expect(GetWindowAttribute(runtime, 0, WINDOW_HEIGHT)).toBe(2);
    expect(GetWindowAttribute(runtime, 0, WINDOW_PALETTE_NUM)).toBe(11);
    expect(GetWindowAttribute(runtime, 0, WINDOW_BASE_BLOCK)).toBe(12);
    expect(GetWindowAttribute(runtime, 0, 99)).toBe(0);
  });

  it('CallWindowFunction and GetNumActiveWindowsOnBg use the window-local template', () => {
    const runtime = createWindowRuntime();
    InitWindows(runtime, [template(), template({ bg: 0, tilemapLeft: 7 }), template({ bg: 2 }), terminator]);
    const calls: unknown[][] = [];

    CallWindowFunction(runtime, 1, (...args) => calls.push(args));

    expect(calls).toEqual([[0, 7, 2, 2, 2, 3]]);
    expect(GetNumActiveWindowsOnBg(runtime, 0)).toBe(2);
    expect(GetNumActiveWindowsOnBg(runtime, 2)).toBe(1);
    expect(GetNumActiveWindowsOnBg(runtime, 3)).toBe(0);
  });
});
