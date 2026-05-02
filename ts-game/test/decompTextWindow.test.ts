import { describe, expect, test } from 'vitest';
import {
  drawTextBorderInner,
  drawTextBorderOuter,
  getTextWindowPaletteOffset,
  loadHelpMessageWindowGfx,
  loadMenuMessageWindowGfx,
  loadQuestLogWindowTiles,
  loadSignpostWindowGfx,
  loadStdWindowGfx,
  loadStdWindowGfxOnBg,
  loadStdWindowTiles,
  loadUserWindowGfxByFrame,
  rboxFillRectangle
} from '../src/rendering/decompTextWindow';

const window = {
  bg: 2,
  tilemapLeft: 5,
  tilemapTop: 6,
  width: 7,
  height: 4
};

describe('decompTextWindow', () => {
  test('GetTextWindowPalette maps ids to 0x10 palette blocks with default 0x40', () => {
    expect([0, 1, 2, 3, 4, 99].map(getTextWindowPaletteOffset)).toEqual([0, 0x10, 0x20, 0x30, 0x40, 0x40]);
  });

  test('load window gfx helpers emit exact gfx sizes and palette ids', () => {
    expect(loadStdWindowGfxOnBg(1, 0x20, 0x30)).toEqual([
      { kind: 'tiles', bg: 1, gfx: 'gStdTextWindow_Gfx', size: 0x120, destOffset: 0x20 },
      { kind: 'palette', palette: 'textWindowPalette:48', palOffset: 0x30, size: 32 }
    ]);
    expect(loadHelpMessageWindowGfx(window, 1, 2)[0]).toMatchObject({ gfx: 'gHelpMessageWindow_Gfx', size: 0x280 });
    expect(loadMenuMessageWindowGfx(window, 1, 2)[1]).toMatchObject({ palette: 'textWindowPalette:0' });
    expect(loadSignpostWindowGfx(window, 1, 2)[0]).toMatchObject({ gfx: 'gSignpostWindow_Gfx', size: 0x260 });
    expect(loadStdWindowGfx(window, 1, 2)[0]).toMatchObject({ gfx: 'gStdTextWindow_Gfx', size: 0x120 });
    expect(loadStdWindowTiles(window, 1)).toEqual([{ kind: 'tiles', bg: 2, gfx: 'gStdTextWindow_Gfx', size: 0x120, destOffset: 1 }]);
    expect(loadQuestLogWindowTiles(window, 1)).toEqual([{ kind: 'tiles', bg: 2, gfx: 'gQuestLogWindow_Gfx', size: 0x280, destOffset: 1 }]);
    expect(loadUserWindowGfxByFrame(window, 3, 4, 5)).toEqual([
      { kind: 'tiles', bg: 2, gfx: 'gUserFrames[3].tiles', size: 0x120, destOffset: 4 },
      { kind: 'palette', palette: 'gUserFrames[3].palette', palOffset: 5, size: 32 }
    ]);
  });

  test('DrawTextBorderOuter emits the eight exact outer border tile rects', () => {
    expect(drawTextBorderOuter(window, 100, 3)).toEqual([
      { kind: 'rect', bg: 2, tileNum: 100, x: 4, y: 5, width: 1, height: 1, palNum: 3 },
      { kind: 'rect', bg: 2, tileNum: 101, x: 5, y: 5, width: 7, height: 1, palNum: 3 },
      { kind: 'rect', bg: 2, tileNum: 102, x: 12, y: 5, width: 1, height: 1, palNum: 3 },
      { kind: 'rect', bg: 2, tileNum: 103, x: 4, y: 6, width: 1, height: 4, palNum: 3 },
      { kind: 'rect', bg: 2, tileNum: 105, x: 12, y: 6, width: 1, height: 4, palNum: 3 },
      { kind: 'rect', bg: 2, tileNum: 106, x: 4, y: 10, width: 1, height: 1, palNum: 3 },
      { kind: 'rect', bg: 2, tileNum: 107, x: 5, y: 10, width: 7, height: 1, palNum: 3 },
      { kind: 'rect', bg: 2, tileNum: 108, x: 12, y: 10, width: 1, height: 1, palNum: 3 }
    ]);
  });

  test('DrawTextBorderInner and rbox_fill_rectangle preserve C geometry', () => {
    expect(drawTextBorderInner(window, 200, 4)[1]).toEqual({
      kind: 'rect',
      bg: 2,
      tileNum: 201,
      x: 6,
      y: 6,
      width: 5,
      height: 1,
      palNum: 4
    });
    expect(drawTextBorderInner(window, 200, 4)[6]).toMatchObject({ tileNum: 207, x: 6, y: 9, width: 5, height: 1 });
    expect(rboxFillRectangle(window)).toEqual({
      kind: 'rect',
      bg: 2,
      tileNum: 0,
      x: 4,
      y: 5,
      width: 9,
      height: 6,
      palNum: 17
    });
  });
});
