import { describe, expect, test } from 'vitest';
import {
  GetUserWindowGraphics,
  gQuestLogWindow_Gfx,
  gSignpostWindow_Gfx,
  gStdTextWindow_Gfx,
  gTextWindowPalettes,
  gUserFrames
} from '../src/game/decompTextWindowGraphics';

describe('src/text_window_graphics.c parity tables', () => {
  test('top-level graphics and palette INCBIN declarations are preserved as asset paths', () => {
    expect(gSignpostWindow_Gfx).toBe('graphics/text_window/signpost.4bpp');
    expect(gStdTextWindow_Gfx).toBe('graphics/text_window/std.4bpp');
    expect(gQuestLogWindow_Gfx).toBe('graphics/text_window/quest_log.4bpp');
    expect(gTextWindowPalettes).toEqual([
      'graphics/text_window/stdpal_0.gbapal',
      'graphics/text_window/stdpal_1.gbapal',
      'graphics/text_window/stdpal_2.gbapal',
      'graphics/text_window/stdpal_3.gbapal',
      'graphics/text_window/stdpal_4.gbapal'
    ]);
  });

  test('user frame table preserves type1-type10 tile and palette pairing', () => {
    expect(gUserFrames).toHaveLength(10);
    expect(gUserFrames[0]).toEqual({
      tiles: 'graphics/text_window/type1.4bpp',
      palette: 'graphics/text_window/type1.gbapal'
    });
    expect(gUserFrames[9]).toEqual({
      tiles: 'graphics/text_window/type10.4bpp',
      palette: 'graphics/text_window/type10.gbapal'
    });
  });

  test('GetUserWindowGraphics preserves the non-BUGFIX idx >= 20 guard', () => {
    expect(GetUserWindowGraphics(0)).toBe(gUserFrames[0]);
    expect(GetUserWindowGraphics(9)).toBe(gUserFrames[9]);
    expect(GetUserWindowGraphics(10)).toBeUndefined();
    expect(GetUserWindowGraphics(20)).toBe(gUserFrames[0]);
    expect(GetUserWindowGraphics(-1)).toBe(gUserFrames[0]);
  });
});
