import { describe, expect, test } from 'vitest';
import {
  DrawTextBorderInner,
  DrawTextBorderOuter,
  GetTextWindowPalette,
  LoadHelpMessageWindowGfxOnBg,
  LoadQuestLogWindowTilesOnBg,
  LoadStdWindowGfx,
  LoadUserWindowGfx,
  LoadUserWindowGfx2,
  createTextWindowRuntime,
  rbox_fill_rectangle
} from '../src/game/decompTextWindow';

describe('src/text_window.c parity', () => {
  test('on-bg loaders emit the exact C gfx, size, and palette selections', () => {
    const runtime = createTextWindowRuntime();

    LoadHelpMessageWindowGfxOnBg(runtime, 2, 0x10, 0x20);
    LoadQuestLogWindowTilesOnBg(runtime, 1, 0x30);

    expect(runtime.operations).toEqual([
      { kind: 'tiles', bg: 2, gfx: 'gHelpMessageWindow_Gfx', size: 0x280, destOffset: 0x10 },
      { kind: 'palette', palette: 'textWindowPalette:32', palOffset: 0x20, size: 32 },
      { kind: 'tiles', bg: 1, gfx: 'gQuestLogWindow_Gfx', size: 0x280, destOffset: 0x30 }
    ]);
  });

  test('window-id loaders use window bg and options frame type like C', () => {
    const runtime = createTextWindowRuntime({
      optionsWindowFrameType: 3,
      windows: {
        4: { bg: 1, tilemapLeft: 5, tilemapTop: 6, width: 7, height: 4 }
      }
    });

    LoadStdWindowGfx(runtime, 4, 0x21, 0x31);
    LoadUserWindowGfx(runtime, 4, 0x22, 0x32);
    LoadUserWindowGfx2(runtime, 4, 0x23, 0x33);

    expect(runtime.operations).toEqual([
      { kind: 'tiles', bg: 1, gfx: 'gStdTextWindow_Gfx', size: 0x120, destOffset: 0x21 },
      { kind: 'palette', palette: 'textWindowPalette:48', palOffset: 0x31, size: 32 },
      { kind: 'tiles', bg: 1, gfx: 'gUserFrames[3].tiles', size: 0x120, destOffset: 0x22 },
      { kind: 'palette', palette: 'gUserFrames[3].palette', palOffset: 0x32, size: 32 },
      { kind: 'tiles', bg: 1, gfx: 'gUserFrames[3].tiles', size: 0x120, destOffset: 0x23 },
      { kind: 'palette', palette: 'gUserFrames[3].palette', palOffset: 0x33, size: 32 }
    ]);
  });

  test('border and fill helpers preserve exact C geometry', () => {
    const runtime = createTextWindowRuntime({
      windows: {
        2: { bg: 3, tilemapLeft: 5, tilemapTop: 6, width: 7, height: 4 }
      }
    });

    DrawTextBorderOuter(runtime, 2, 100, 4);
    DrawTextBorderInner(runtime, 2, 200, 5);
    rbox_fill_rectangle(runtime, 2);

    expect(runtime.operations[0]).toEqual({ kind: 'rect', bg: 3, tileNum: 100, x: 4, y: 5, width: 1, height: 1, palNum: 4 });
    expect(runtime.operations[7]).toEqual({ kind: 'rect', bg: 3, tileNum: 108, x: 12, y: 10, width: 1, height: 1, palNum: 4 });
    expect(runtime.operations[9]).toEqual({ kind: 'rect', bg: 3, tileNum: 201, x: 6, y: 6, width: 5, height: 1, palNum: 5 });
    expect(runtime.operations.at(-1)).toEqual({ kind: 'rect', bg: 3, tileNum: 0, x: 4, y: 5, width: 9, height: 6, palNum: 17 });
    expect(GetTextWindowPalette(99)).toBe('gTextWindowPalettes+64');
  });
});
