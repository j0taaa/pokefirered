import { describe, expect, test } from 'vitest';
import {
  addWindow8Bit,
  blitBitmapRectToWindow4BitTo8Bit,
  copyWindowToVram8Bit,
  createWindow8BitState,
  fillWindowPixelBuffer8Bit,
  fillWindowPixelRect8Bit,
  getNumActiveWindowsOnBg8Bit,
  WINDOWS_MAX,
  WINDOW_NONE,
  COPYWIN_MAP,
  COPYWIN_GFX,
  COPYWIN_FULL
} from '../src/rendering/decompWindow8bpp';

describe('decompWindow8bpp parity', () => {
  test('addWindow8Bit allocates window slots and returns ids', () => {
    const state = createWindow8BitState([0x800, 0x800, 0x800, 0x800]);
    const template = { bg: 0, tilemapLeft: 2, tilemapTop: 3, width: 5, height: 4, paletteNum: 7, baseBlock: 0x20 };

    const id = addWindow8Bit(state, template);
    expect(id).toBe(0);
    expect(state.windows[0]).not.toBeNull();
    expect(state.windows[0]!.window).toEqual(template);
    expect(state.windows[0]!.tileData.length).toBe(0x40 * 5 * 4);
  });

  test('addWindow8Bit returns WINDOW_NONE when all slots are full', () => {
    const state = createWindow8BitState();
    for (let i = 0; i < WINDOWS_MAX; i++) {
      addWindow8Bit(state, { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 1, height: 1, paletteNum: 0, baseBlock: 0 });
    }
    const id = addWindow8Bit(state, { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 1, height: 1, paletteNum: 0, baseBlock: 0 });
    expect(id).toBe(WINDOW_NONE);
  });

  test('fillWindowPixelBuffer8Bit fills entire tile data', () => {
    const state = createWindow8BitState();
    const id = addWindow8Bit(state, { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 2, height: 2, paletteNum: 0, baseBlock: 0 });
    fillWindowPixelBuffer8Bit(state, id, 0x42);

    const window = state.windows[id]!;
    const allFilled = window.tileData.every((byte) => byte === 0x42);
    expect(allFilled).toBe(true);
  });

  test('fillWindowPixelRect8Bit fills a sub-rect within the window bitmap', () => {
    const state = createWindow8BitState();
    const id = addWindow8Bit(state, { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 4, height: 4, paletteNum: 0, baseBlock: 0 });
    fillWindowPixelBuffer8Bit(state, id, 0);
    fillWindowPixelRect8Bit(state, id, 0xab, 4, 2, 8, 4);

    const window = state.windows[id]!;
    const bitmapWidth = 8 * 4;
    expect(window.tileData[2 * bitmapWidth + 4]).toBe(0xab);
    expect(window.tileData[2 * bitmapWidth + 5]).toBe(0xab);
    expect(window.tileData[0]).toBe(0);
  });

  test('fillWindowPixelRect8Bit clips to window bounds', () => {
    const state = createWindow8BitState();
    const id = addWindow8Bit(state, { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 2, height: 2, paletteNum: 0, baseBlock: 0 });
    fillWindowPixelBuffer8Bit(state, id, 0);
    fillWindowPixelRect8Bit(state, id, 0xff, -1, -1, 20, 20);

    const window = state.windows[id]!;
    const bitmapWidth = 8 * 2;
    expect(window.tileData[0]).toBe(0xff);
    expect(window.tileData[bitmapWidth - 1]).toBe(0xff);
    expect(window.tileData[bitmapWidth * (8 * 2 - 1) + bitmapWidth - 1]).toBe(0xff);
  });

  test('blitBitmapRectToWindow4BitTo8Bit applies palette offset to 4bpp pixels', () => {
    const state = createWindow8BitState();
    const id = addWindow8Bit(state, { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 4, height: 4, paletteNum: 0, baseBlock: 0 });
    fillWindowPixelBuffer8Bit(state, id, 0);

    const srcPixels = new Uint8Array(8);
    srcPixels[0] = 0x12;
    srcPixels[1] = 0x34;
    const srcWidth = 4;

    blitBitmapRectToWindow4BitTo8Bit(state, id, srcPixels, 0, 0, srcWidth, 2, 0, 0, 2, 1, 2);

    const window = state.windows[id]!;
    const paletteOffset = (2 << 4) >>> 0;

    expect(window.tileData[0]).toBe(paletteOffset | 2);
    expect(window.tileData[1]).toBe(paletteOffset | 1);
  });

  test('copyWindowToVram8Bit records map and gfx copy operations', () => {
    const state = createWindow8BitState();
    const id = addWindow8Bit(state, { bg: 2, tilemapLeft: 5, tilemapTop: 6, width: 3, height: 2, paletteNum: 1, baseBlock: 0x10 });

    copyWindowToVram8Bit(state, id, COPYWIN_MAP);
    expect(state.vramCopies).toEqual([{ kind: 'map', bg: 2 }]);

    copyWindowToVram8Bit(state, id, COPYWIN_GFX);
    expect(state.vramCopies).toEqual([
      { kind: 'map', bg: 2 },
      { kind: 'gfx', bg: 2, size: 0x40 * 3 * 2, baseBlock: 0x10 }
    ]);

    copyWindowToVram8Bit(state, id, COPYWIN_FULL);
    expect(state.vramCopies).toEqual([
      { kind: 'map', bg: 2 },
      { kind: 'gfx', bg: 2, size: 0x40 * 3 * 2, baseBlock: 0x10 },
      { kind: 'map', bg: 2 },
      { kind: 'gfx', bg: 2, size: 0x40 * 3 * 2, baseBlock: 0x10 }
    ]);
  });

  test('getNumActiveWindowsOnBg8Bit counts windows per bg layer', () => {
    const state = createWindow8BitState();
    addWindow8Bit(state, { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 1, height: 1, paletteNum: 0, baseBlock: 0 });
    addWindow8Bit(state, { bg: 0, tilemapLeft: 2, tilemapTop: 2, width: 1, height: 1, paletteNum: 0, baseBlock: 1 });
    addWindow8Bit(state, { bg: 2, tilemapLeft: 4, tilemapTop: 4, width: 1, height: 1, paletteNum: 0, baseBlock: 2 });

    expect(getNumActiveWindowsOnBg8Bit(state, 0)).toBe(2);
    expect(getNumActiveWindowsOnBg8Bit(state, 2)).toBe(1);
    expect(getNumActiveWindowsOnBg8Bit(state, 1)).toBe(0);
  });
});