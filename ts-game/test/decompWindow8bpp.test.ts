import { describe, expect, test } from 'vitest';
import {
  COPYWIN_FULL,
  COPYWIN_GFX,
  COPYWIN_MAP,
  AddWindow8Bit,
  BlitBitmapRectToWindow4BitTo8Bit,
  CopyWindowToVram8Bit,
  FillWindowPixelBuffer8Bit,
  FillWindowPixelRect8Bit,
  GetNumActiveWindowsOnBg8Bit,
  WINDOW_NONE,
  WINDOWS_MAX,
  addWindow8Bit,
  blitBitmapRectToWindow4BitTo8Bit,
  copyWindowToVram8Bit,
  createWindow8BitState,
  fillWindowPixelBuffer8Bit,
  fillWindowPixelRect8Bit,
  getNumActiveWindowsOnBg8Bit,
  nullsub_9
} from '../src/rendering/decompWindow8bpp';

const template = {
  bg: 1,
  tilemapLeft: 0,
  tilemapTop: 0,
  width: 2,
  height: 2,
  paletteNum: 0,
  baseBlock: 7
};

describe('decompWindow8bpp', () => {
  test('AddWindow8Bit allocates the first free slot and bg tilemap buffer', () => {
    const state = createWindow8BitState([0xffff, 128]);
    const windowId = addWindow8Bit(state, template);
    expect(windowId).toBe(0);
    expect(state.bgTilemapBuffers[1]).toHaveLength(128);
    expect(state.windows[0]?.tileData).toHaveLength(0x40 * 4);

    for (let i = 1; i < WINDOWS_MAX; i += 1) {
      addWindow8Bit(state, template);
    }
    expect(addWindow8Bit(state, template)).toBe(WINDOW_NONE);
  });

  test('FillWindowPixelBuffer8Bit and FillWindowPixelRect8Bit mutate tile data', () => {
    const state = createWindow8BitState([0xffff, 128]);
    const windowId = addWindow8Bit(state, template);
    fillWindowPixelBuffer8Bit(state, windowId, 0x12);
    expect(state.windows[windowId]?.tileData.every((value) => value === 0x12)).toBe(true);

    fillWindowPixelRect8Bit(state, windowId, 0x34, 1, 1, 2, 2);
    const data = state.windows[windowId]!.tileData;
    const width = 16;
    expect(data[1 + width]).toBe(0x34);
    expect(data[2 + width]).toBe(0x34);
    expect(data[1 + width * 2]).toBe(0x34);
    expect(data[2 + width * 2]).toBe(0x34);
  });

  test('BlitBitmapRectToWindow4BitTo8Bit expands nibbles with palette high bits', () => {
    const state = createWindow8BitState([0xffff, 128]);
    const windowId = addWindow8Bit(state, template);
    const pixels = Uint8Array.from([0x21, 0x43, 0x65, 0x87]);

    blitBitmapRectToWindow4BitTo8Bit(state, windowId, pixels, 0, 0, 4, 2, 0, 0, 4, 2, 9);

    expect([...state.windows[windowId]!.tileData.slice(0, 4)]).toEqual([0x91, 0x92, 0x93, 0x94]);
    expect([...state.windows[windowId]!.tileData.slice(16, 20)]).toEqual([0x95, 0x96, 0x97, 0x98]);
  });

  test('CopyWindowToVram8Bit records map/gfx/full copy operations', () => {
    const state = createWindow8BitState([0xffff, 128]);
    const windowId = addWindow8Bit(state, template);
    copyWindowToVram8Bit(state, windowId, COPYWIN_MAP);
    copyWindowToVram8Bit(state, windowId, COPYWIN_GFX);
    copyWindowToVram8Bit(state, windowId, COPYWIN_FULL);
    expect(state.vramCopies).toEqual([
      { kind: 'map', bg: 1 },
      { kind: 'gfx', bg: 1, size: 256, baseBlock: 7 },
      { kind: 'map', bg: 1 },
      { kind: 'gfx', bg: 1, size: 256, baseBlock: 7 }
    ]);
  });

  test('GetNumActiveWindowsOnBg8Bit counts windows by bg id', () => {
    const state = createWindow8BitState([64, 128]);
    addWindow8Bit(state, { ...template, bg: 0 });
    addWindow8Bit(state, { ...template, bg: 1 });
    addWindow8Bit(state, { ...template, bg: 1 });
    expect(getNumActiveWindowsOnBg8Bit(state, 0)).toBe(1);
    expect(getNumActiveWindowsOnBg8Bit(state, 1)).toBe(2);
  });

  test('exports exact C symbol names as aliases for the 1:1 port surface', () => {
    const state = createWindow8BitState([0xffff, 128]);
    const windowId = AddWindow8Bit(state, template);
    FillWindowPixelBuffer8Bit(state, windowId, 0xaa);
    FillWindowPixelRect8Bit(state, windowId, 0xbb, 0, 0, 1, 1);
    BlitBitmapRectToWindow4BitTo8Bit(state, windowId, Uint8Array.from([0x21]), 0, 0, 2, 1, 1, 0, 1, 1, 4);
    CopyWindowToVram8Bit(state, windowId, COPYWIN_FULL);
    nullsub_9();

    expect(GetNumActiveWindowsOnBg8Bit(state, template.bg)).toBe(1);
    expect(state.windows[windowId]?.tileData[0]).toBe(0xbb);
    expect(state.windows[windowId]?.tileData[1]).toBe(0x41);
    expect(state.vramCopies.at(-1)).toEqual({ kind: 'gfx', bg: 1, size: 256, baseBlock: 7 });
  });
});
