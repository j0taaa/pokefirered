import { describe, expect, test } from 'vitest';
import {
  CalcByteArraySum,
  CalcCRC16,
  CalcCRC16WithTable,
  CopySpriteTiles,
  CountTrailingZeroBits,
  CreateInvisibleSpriteWithCallback,
  DoBgAffineSet,
  LoadWordFromTwoHalfwords,
  SetBgAffineStruct,
  StoreWordInTwoHalfwords,
  calcByteArraySum,
  calcCRC16,
  calcCRC16WithTable,
  copySpriteTiles,
  countTrailingZeroBits,
  createInvisibleSpriteWithCallback,
  createUtilSpriteRuntime,
  doBgAffineSet,
  gBitTable,
  loadWordFromTwoHalfwords,
  setBgAffineStruct,
  storeWordInTwoHalfwords
} from '../src/game/decompUtil';

describe('decomp util', () => {
  test('bit table and halfword word helpers match C layout', () => {
    expect(gBitTable[0]).toBe(1);
    expect(gBitTable[31]).toBe(1 << 31);

    const halfwords = [0, 0];
    storeWordInTwoHalfwords(halfwords, 0x89abcdef);
    expect(halfwords).toEqual([0xcdef, 0x89ab]);
    expect(loadWordFromTwoHalfwords(halfwords)).toBe(0x89abcdef);
  });

  test('sprite and affine helpers write the same fields as the C wrappers', () => {
    const runtime = createUtilSpriteRuntime();
    const spriteId = createInvisibleSpriteWithCallback(runtime, 'callback');
    expect(spriteId).toBe(0);
    expect(runtime.sprites[0]).toMatchObject({
      x: 248,
      y: 168,
      subpriority: 14,
      invisible: true,
      callback: 'callback'
    });

    const src = { texX: 0, texY: 0, scrX: 0, scrY: 0, sx: 0, sy: 0, alpha: 0 };
    setBgAffineStruct(src, 1, 2, 0xfffe, 4, 5, 6, 7);
    expect(src).toEqual({ texX: 1, texY: 2, scrX: -2, scrY: 4, sx: 5, sy: 6, alpha: 7 });

    const dest = { texX: 0, texY: 0, scrX: 0, scrY: 0, sx: 0, sy: 0, alpha: 0 };
    doBgAffineSet(dest, 8, 9, 10, 11, 12, 13, 14);
    expect(dest).toEqual({ texX: 8, texY: 9, scrX: 10, scrY: 11, sx: 12, sy: 13, alpha: 14 });
  });

  test('CopySpriteTiles copies normal, y-flipped, x-flipped, and xy-flipped tiles', () => {
    const tiles = new Uint8Array(4 * 32);
    for (let i = 0; i < tiles.length; i += 1) {
      tiles[i] = i;
    }
    const tilemap = new Uint16Array(32);
    tilemap[0] = 0;
    tilemap[1] = 1 | 0x800;
    tilemap[2] = 2 | 0x400;
    tilemap[3] = 3 | 0xc00;
    const output = new Uint8Array(4 * 32);

    copySpriteTiles(1, 1, tiles, tilemap, output);

    expect([...output.slice(0, 32)]).toEqual([...tiles.slice(0, 32)]);
    expect([...output.slice(32, 36)]).toEqual([...tiles.slice(32 + 28, 32 + 32)]);
    expect(output[64]).toBe(((tiles[64 + 3] & 0xf) << 4) | (tiles[64 + 3] >> 4));
    expect(output[96]).toBe(((tiles[96 + 31] & 0xf) << 4) | (tiles[96 + 31] >> 4));
  });

  test('CRC, trailing-zero count, and byte sum use the decomp algorithms', () => {
    const data = new Uint8Array([1, 2, 3, 4, 0xff]);
    expect(countTrailingZeroBits(0)).toBe(0);
    expect(countTrailingZeroBits(0b1000)).toBe(3);
    expect(calcCRC16(data)).toBe(calcCRC16WithTable(data));
    expect(calcCRC16(data)).toBe(0xfe7e);
    expect(calcByteArraySum(data)).toBe(265);
  });

  test('exact C-name util functions preserve pointer-style outputs and algorithms', () => {
    const runtime = createUtilSpriteRuntime();
    const spriteId = CreateInvisibleSpriteWithCallback(runtime, 'SpriteCallback');
    expect(spriteId).toBe(0);
    expect(runtime.sprites[0]).toMatchObject({
      x: 248,
      y: 168,
      subpriority: 14,
      invisible: true,
      callback: 'SpriteCallback'
    });

    const halfwords = [0, 0];
    const word = [0];
    StoreWordInTwoHalfwords(halfwords, 0x89abcdef);
    LoadWordFromTwoHalfwords(halfwords, word);
    expect(halfwords).toEqual([0xcdef, 0x89ab]);
    expect(word[0]).toBe(0x89abcdef);

    const src = { texX: 0, texY: 0, scrX: 0, scrY: 0, sx: 0, sy: 0, alpha: 0 };
    SetBgAffineStruct(src, 1, 2, 0xfffe, 0xffff, 0x8000, 7, 8);
    expect(src).toEqual({ texX: 1, texY: 2, scrX: -2, scrY: -1, sx: -32768, sy: 7, alpha: 8 });
    const dest = { texX: 0, texY: 0, scrX: 0, scrY: 0, sx: 0, sy: 0, alpha: 0 };
    DoBgAffineSet(dest, 3, 4, 5, 6, 7, 8, 9);
    expect(dest).toEqual({ texX: 3, texY: 4, scrX: 5, scrY: 6, sx: 7, sy: 8, alpha: 9 });

    const tiles = new Uint8Array(4 * 32);
    for (let i = 0; i < tiles.length; i += 1) {
      tiles[i] = i;
    }
    const tilemap = new Uint16Array(32);
    tilemap[0] = 0;
    tilemap[1] = 1 | 0x800;
    tilemap[2] = 2 | 0x400;
    tilemap[3] = 3 | 0xc00;
    const output = new Uint8Array(4 * 32);
    CopySpriteTiles(1, 1, tiles, tilemap, output);
    expect([...output.slice(0, 32)]).toEqual([...tiles.slice(0, 32)]);
    expect([...output.slice(32, 36)]).toEqual([...tiles.slice(60, 64)]);
    expect(output[64]).toBe(((tiles[67] & 0xf) << 4) | (tiles[67] >> 4));
    expect(output[96]).toBe(((tiles[127] & 0xf) << 4) | (tiles[127] >> 4));

    const data = new Uint8Array([1, 2, 3, 4, 0xff]);
    expect(CountTrailingZeroBits(0)).toBe(0);
    expect(CountTrailingZeroBits(0b100000)).toBe(5);
    expect(CalcCRC16(data, data.length)).toBe(0xfe7e);
    expect(CalcCRC16WithTable(data, data.length)).toBe(0xfe7e);
    expect(CalcByteArraySum(data, data.length)).toBe(265);
  });
});
