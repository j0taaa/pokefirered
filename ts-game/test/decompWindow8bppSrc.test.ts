import { describe, expect, test } from 'vitest';
import * as window8 from '../src/game/decompWindow8bpp';

describe('src/window_8bpp.c parity exports', () => {
  test('exact C names are available through the source-level game module', () => {
    expect(window8.nullsub_9).toBeTypeOf('function');
    expect(window8.AddWindow8Bit).toBe(window8.addWindow8Bit);
    expect(window8.FillWindowPixelBuffer8Bit).toBe(window8.fillWindowPixelBuffer8Bit);
    expect(window8.FillWindowPixelRect8Bit).toBe(window8.fillWindowPixelRect8Bit);
    expect(window8.BlitBitmapRectToWindow4BitTo8Bit).toBe(window8.blitBitmapRectToWindow4BitTo8Bit);
    expect(window8.CopyWindowToVram8Bit).toBe(window8.copyWindowToVram8Bit);
    expect(window8.GetNumActiveWindowsOnBg8Bit).toBe(window8.getNumActiveWindowsOnBg8Bit);
  });

  test('AddWindow8Bit allocates tile data and CopyWindowToVram8Bit follows COPYWIN_FULL order', () => {
    const state = window8.createWindow8BitState([0x800]);
    const windowId = window8.AddWindow8Bit(state, {
      bg: 0,
      tilemapLeft: 1,
      tilemapTop: 2,
      width: 2,
      height: 1,
      paletteNum: 15,
      baseBlock: 0x20
    });

    expect(windowId).toBe(0);
    expect(state.bgTilemapBuffers[0]).toHaveLength(0x800);
    expect(state.windows[windowId]?.tileData).toHaveLength(0x80);

    window8.CopyWindowToVram8Bit(state, windowId, window8.COPYWIN_FULL);
    expect(state.vramCopies).toEqual([
      { kind: 'map', bg: 0 },
      { kind: 'gfx', bg: 0, size: 0x80, baseBlock: 0x20 }
    ]);
  });
});
