import { describe, expect, test } from 'vitest';
import {
  CABLE_CAR_TILEMAP_BYTES_PER_ROW,
  CableCarUtil_CopyWrapped,
  CableCarUtil_FillWrapped,
  cableCarUtilReadTile
} from '../src/game/decompCableCarUtil';

const makeTilemap = (): Uint8Array => new Uint8Array(32 * CABLE_CAR_TILEMAP_BYTES_PER_ROW);

describe('src/cable_car_util.c parity', () => {
  test('CableCarUtil_FillWrapped writes u16 entries and wraps x/y at 32 tiles', () => {
    const dest = makeTilemap();

    CableCarUtil_FillWrapped(dest, 0x1234, 31, 31, 3, 2);

    expect(cableCarUtilReadTile(dest, 31, 31)).toBe(0x1234);
    expect(cableCarUtilReadTile(dest, 0, 31)).toBe(0x1234);
    expect(cableCarUtilReadTile(dest, 1, 31)).toBe(0x1234);
    expect(cableCarUtilReadTile(dest, 31, 0)).toBe(0x1234);
    expect(cableCarUtilReadTile(dest, 0, 0)).toBe(0x1234);
    expect(cableCarUtilReadTile(dest, 1, 0)).toBe(0x1234);
    expect(dest[31 * CABLE_CAR_TILEMAP_BYTES_PER_ROW + 31 * 2]).toBe(0x34);
    expect(dest[31 * CABLE_CAR_TILEMAP_BYTES_PER_ROW + 31 * 2 + 1]).toBe(0x12);
  });

  test('CableCarUtil_CopyWrapped consumes source sequentially across wrapped rows', () => {
    const dest = makeTilemap();

    CableCarUtil_CopyWrapped(dest, [1, 2, 3, 4, 5, 6], 31, 31, 3, 2);

    expect([
      cableCarUtilReadTile(dest, 31, 31),
      cableCarUtilReadTile(dest, 0, 31),
      cableCarUtilReadTile(dest, 1, 31),
      cableCarUtilReadTile(dest, 31, 0),
      cableCarUtilReadTile(dest, 0, 0),
      cableCarUtilReadTile(dest, 1, 0)
    ]).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
