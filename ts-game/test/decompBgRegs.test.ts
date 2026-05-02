import { describe, expect, test } from 'vitest';
import {
  BG_BYTES_PER_ROW,
  BG_CONTROL_REG_OFFSETS,
  BG_HOFFSET_REG_OFFSETS,
  BG_LAYER_COUNT,
  BG_SCREEN_TILE_HEIGHT,
  BG_SCREEN_TILE_WIDTH,
  BG_VOFFSET_REG_OFFSETS,
  BLDCNT_TARGET1_BG_FLAGS,
  DISPCNT_BG_FLAGS,
  OVERWORLD_BACKGROUND_LAYER_FLAGS
} from '../src/rendering/decompBgRegs';

describe('decomp bg regs parity', () => {
  test('matches the FireRed BG register offset tables', () => {
    expect(BG_LAYER_COUNT).toBe(4);
    expect(BG_CONTROL_REG_OFFSETS).toEqual([0x08, 0x0a, 0x0c, 0x0e]);
    expect(BG_HOFFSET_REG_OFFSETS).toEqual([0x10, 0x14, 0x18, 0x1c]);
    expect(BG_VOFFSET_REG_OFFSETS).toEqual([0x12, 0x16, 0x1a, 0x1e]);
  });

  test('matches the FireRed BG display and blend flags', () => {
    expect(DISPCNT_BG_FLAGS).toEqual([0x0100, 0x0200, 0x0400, 0x0800]);
    expect(OVERWORLD_BACKGROUND_LAYER_FLAGS).toEqual([0x0100, 0x0200, 0x0400, 0x0800]);
    expect(BLDCNT_TARGET1_BG_FLAGS).toEqual([0x0001, 0x0002, 0x0004, 0x0008]);
  });

  test('exports 32x32 text background dimensions', () => {
    expect(BG_SCREEN_TILE_WIDTH).toBe(32);
    expect(BG_SCREEN_TILE_HEIGHT).toBe(32);
    expect(BG_BYTES_PER_ROW).toBe(64);
  });
});
