import { describe, expect, test } from 'vitest';
import {
  getUserWindowGraphicsIndex,
  USER_WINDOW_GRAPHICS_COUNT
} from '../src/rendering/decompTextWindowGraphics';

describe('decomp text_window_graphics', () => {
  test('returns valid user-frame indices unchanged', () => {
    expect(getUserWindowGraphicsIndex(0)).toBe(0);
    expect(getUserWindowGraphicsIndex(USER_WINDOW_GRAPHICS_COUNT - 1)).toBe(9);
  });

  test('falls back to frame 0 for invalid indices', () => {
    expect(getUserWindowGraphicsIndex(-1)).toBe(0);
    expect(getUserWindowGraphicsIndex(10)).toBe(0);
    expect(getUserWindowGraphicsIndex(99)).toBe(0);
  });
});
