import { describe, expect, test } from 'vitest';
import {
  CableCarUtil_CopyWrapped,
  CableCarUtil_FillWrapped,
  cableCarUtilReadTile,
  CABLE_CAR_TILEMAP_BYTES_PER_ROW,
  CABLE_CAR_TILEMAP_HEIGHT,
  CABLE_CAR_TILEMAP_WIDTH
} from '../src/game/decompCableCarUtil';
import {
  copyWrappedBgTilemapRect,
  copyWrappedBgTilemapRegion,
  decodeBgMapEntry,
  fillWrappedBgTilemapRect
} from '../src/rendering/decompCableCarUtil';

const makeBgBuffer = (): Uint8Array => new Uint8Array(32 * 32 * 2);

describe('decomp cable car util parity', () => {
  test('game-side C helpers fill and copy wrapped u16 tilemap memory exactly', () => {
    const tilemap = new Uint8Array(CABLE_CAR_TILEMAP_WIDTH * CABLE_CAR_TILEMAP_HEIGHT * 2);
    expect(CABLE_CAR_TILEMAP_BYTES_PER_ROW).toBe(64);

    CableCarUtil_FillWrapped(tilemap, 0x1234, 31, 31, 2, 2);
    expect(cableCarUtilReadTile(tilemap, 31, 31)).toBe(0x1234);
    expect(cableCarUtilReadTile(tilemap, 0, 31)).toBe(0x1234);
    expect(cableCarUtilReadTile(tilemap, 31, 0)).toBe(0x1234);
    expect(cableCarUtilReadTile(tilemap, 0, 0)).toBe(0x1234);

    CableCarUtil_CopyWrapped(tilemap, [1, 2, 3, 4], 31, 31, 2, 2);
    expect(cableCarUtilReadTile(tilemap, 31, 31)).toBe(1);
    expect(cableCarUtilReadTile(tilemap, 0, 31)).toBe(2);
    expect(cableCarUtilReadTile(tilemap, 31, 0)).toBe(3);
    expect(cableCarUtilReadTile(tilemap, 0, 0)).toBe(4);
  });

  test('fills wrapped bg rectangles across the 32x32 edge', () => {
    const tilemap = makeBgBuffer();

    fillWrappedBgTilemapRect(tilemap, 0x1234, 31, 31, 2, 2);
    const region = copyWrappedBgTilemapRegion(tilemap, 31, 31, 2, 2);

    expect([...region]).toEqual([0x1234, 0x1234, 0x1234, 0x1234]);
  });

  test('copies wrapped source entries into bg tilemap memory', () => {
    const tilemap = makeBgBuffer();

    copyWrappedBgTilemapRect(tilemap, [1, 2, 3, 4], 31, 31, 2, 2);
    const region = copyWrappedBgTilemapRegion(tilemap, 31, 31, 2, 2);

    expect([...region]).toEqual([1, 2, 3, 4]);
  });

  test('decodes tile id, flips, and palette from GBA map entries', () => {
    expect(decodeBgMapEntry(0xa7ff)).toEqual({
      id: 0x03ff,
      hflip: true,
      vflip: false,
      pal: 0x0a
    });
  });
});
