import { describe, expect, test } from 'vitest';
import {
  OBJECT_EVENT_BASE_OAM,
  getObjectEventBaseOam,
  gObjectEventBaseOam_64x64
} from '../src/game/decompObjectEventBaseOam';

describe('decomp object event base OAM', () => {
  test('preserves every base OAM struct in source order', () => {
    expect(OBJECT_EVENT_BASE_OAM).toEqual([
      { symbol: 'gObjectEventBaseOam_8x8', shape: 'SPRITE_SHAPE(8x8)', size: 'SPRITE_SIZE(8x8)', priority: 2 },
      { symbol: 'gObjectEventBaseOam_16x8', shape: 'SPRITE_SHAPE(16x8)', size: 'SPRITE_SIZE(16x8)', priority: 2 },
      { symbol: 'gObjectEventBaseOam_16x16', shape: 'SPRITE_SHAPE(16x16)', size: 'SPRITE_SIZE(16x16)', priority: 2 },
      { symbol: 'gObjectEventBaseOam_32x16', shape: 'SPRITE_SHAPE(32x16)', size: 'SPRITE_SIZE(32x16)', priority: 2 },
      { symbol: 'gObjectEventBaseOam_32x8', shape: 'SPRITE_SHAPE(32x8)', size: 'SPRITE_SIZE(32x8)', priority: 2 },
      { symbol: 'gObjectEventBaseOam_64x32', shape: 'SPRITE_SHAPE(64x32)', size: 'SPRITE_SIZE(64x32)', priority: 2 },
      { symbol: 'gObjectEventBaseOam_16x32', shape: 'SPRITE_SHAPE(16x32)', size: 'SPRITE_SIZE(16x32)', priority: 2 },
      { symbol: 'gObjectEventBaseOam_32x32', shape: 'SPRITE_SHAPE(32x32)', size: 'SPRITE_SIZE(32x32)', priority: 2 },
      { symbol: 'gObjectEventBaseOam_64x64', shape: 'SPRITE_SHAPE(64x64)', size: 'SPRITE_SIZE(64x64)', priority: 2 }
    ]);
  });

  test('exports named OAM declarations for direct lookups', () => {
    expect(gObjectEventBaseOam_64x64.priority).toBe(2);
    expect(getObjectEventBaseOam('gObjectEventBaseOam_32x16')).toMatchObject({
      shape: 'SPRITE_SHAPE(32x16)',
      size: 'SPRITE_SIZE(32x16)'
    });
  });
});
