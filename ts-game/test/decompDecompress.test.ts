import { describe, expect, test } from 'vitest';
import {
  DecompressPicFromTable,
  DecompressPicFromTable_DontHandleDeoxys,
  DuplicateDeoxysTiles,
  GetDecompressedDataSize,
  HandleLoadSpecialPokePic,
  HandleLoadSpecialPokePic_DontHandleDeoxys,
  LZDecompressVram,
  LZDecompressWram,
  LoadCompressedSpritePalette,
  LoadCompressedSpritePaletteOverrideBuffer,
  LoadCompressedSpritePaletteUsingHeap,
  LoadCompressedSpriteSheet,
  LoadCompressedSpriteSheetOverrideBuffer,
  LoadCompressedSpriteSheetUsingHeap,
  LoadSpecialPokePic,
  LoadSpecialPokePic_DontHandleDeoxys,
  NUM_SPECIES,
  SPECIES_DEOXYS,
  SPECIES_UNOWN,
  SPECIES_UNOWN_B,
  StitchObjectsOn8x8Canvas,
  Unused_LZDecompressWramIndirect,
  createDecompressRuntime,
  decompressPicFromTable,
  decompressPicFromTableDontHandleDeoxys,
  duplicateDeoxysTiles,
  getDecompressedDataSize,
  getUnownPicSpecies,
  handleLoadSpecialPokePic,
  handleLoadSpecialPokePicDontHandleDeoxys,
  loadCompressedSpritePalette,
  loadCompressedSpritePaletteOverrideBuffer,
  loadCompressedSpritePaletteUsingHeap,
  loadCompressedSpriteSheet,
  loadCompressedSpriteSheetOverrideBuffer,
  loadCompressedSpriteSheetUsingHeap,
  loadSpecialPokePic,
  loadSpecialPokePicDontHandleDeoxys,
  lzDecompressVram,
  lzDecompressWram,
  stitchObjectsOn8x8Canvas,
  unusedLzDecompressWramIndirect,
  type CompressedSpriteSheet
} from '../src/game/decompDecompress';

const rawLz = (bytes: readonly number[]): Uint8Array => {
  const out = [0x10, bytes.length & 0xff, (bytes.length >> 8) & 0xff, (bytes.length >> 16) & 0xff];
  for (let i = 0; i < bytes.length; i += 8) {
    out.push(0);
    out.push(...bytes.slice(i, i + 8));
  }
  return Uint8Array.from(out);
};

const sheet = (value: number, tag = value): CompressedSpriteSheet => ({
  data: rawLz([value, value + 1, value + 2, value + 3]),
  size: 4,
  tag
});

const makePicTable = (): CompressedSpriteSheet[] => {
  const table = Array.from({ length: SPECIES_UNOWN_B + 28 }, (_, i) => sheet(i & 0xff, i));
  table[0] = sheet(0xee, 0);
  table[SPECIES_UNOWN] = sheet(0xa0, SPECIES_UNOWN);
  table[SPECIES_UNOWN_B] = sheet(0xb0, SPECIES_UNOWN_B);
  table[SPECIES_DEOXYS] = {
    data: rawLz(Array.from({ length: 0x1000 }, (_, i) => i & 0xff)),
    size: 0x1000,
    tag: SPECIES_DEOXYS
  };
  return table;
};

describe('decomp decompress', () => {
  test('exact C function names are exported as the implemented decompress routines', () => {
    expect(LZDecompressWram).toBe(lzDecompressWram);
    expect(LZDecompressVram).toBe(lzDecompressVram);
    expect(LoadCompressedSpriteSheet).toBe(loadCompressedSpriteSheet);
    expect(LoadCompressedSpriteSheetOverrideBuffer).toBe(loadCompressedSpriteSheetOverrideBuffer);
    expect(LoadCompressedSpritePalette).toBe(loadCompressedSpritePalette);
    expect(LoadCompressedSpritePaletteOverrideBuffer).toBe(loadCompressedSpritePaletteOverrideBuffer);
    expect(DecompressPicFromTable).toBe(decompressPicFromTable);
    expect(HandleLoadSpecialPokePic).toBe(handleLoadSpecialPokePic);
    expect(LoadSpecialPokePic).toBe(loadSpecialPokePic);
    expect(DuplicateDeoxysTiles).toBe(duplicateDeoxysTiles);
    expect(Unused_LZDecompressWramIndirect).toBe(unusedLzDecompressWramIndirect);
    expect(StitchObjectsOn8x8Canvas).toBe(stitchObjectsOn8x8Canvas);
    expect(LoadCompressedSpriteSheetUsingHeap).toBe(loadCompressedSpriteSheetUsingHeap);
    expect(LoadCompressedSpritePaletteUsingHeap).toBe(loadCompressedSpritePaletteUsingHeap);
    expect(GetDecompressedDataSize).toBe(getDecompressedDataSize);
    expect(DecompressPicFromTable_DontHandleDeoxys).toBe(decompressPicFromTableDontHandleDeoxys);
    expect(HandleLoadSpecialPokePic_DontHandleDeoxys).toBe(handleLoadSpecialPokePicDontHandleDeoxys);
    expect(LoadSpecialPokePic_DontHandleDeoxys).toBe(loadSpecialPokePicDontHandleDeoxys);
  });

  test('GetDecompressedDataSize and LZ wrappers decode GBA LZ77 streams', () => {
    const compressed = Uint8Array.from([
      0x10, 9, 0, 0,
      0x10, 65, 66, 67, 0x30, 0x02
    ]);

    expect(getDecompressedDataSize(compressed)).toBe(9);
    expect([...lzDecompressWram(compressed)]).toEqual([65, 66, 67, 65, 66, 67, 65, 66, 67]);
    expect([...lzDecompressVram(compressed)]).toEqual([65, 66, 67, 65, 66, 67, 65, 66, 67]);

    const dest = new Uint8Array(9);
    unusedLzDecompressWramIndirect({ value: compressed }, dest);
    expect([...dest]).toEqual([65, 66, 67, 65, 66, 67, 65, 66, 67]);
  });

  test('compressed sprite sheet and palette loaders use the shared decompression buffer or override buffers', () => {
    const runtime = createDecompressRuntime();
    const source = sheet(10, 77);
    const override = new Uint8Array(4);

    expect(loadCompressedSpriteSheet(runtime, source)).toBe(77);
    expect(runtime.loadedSpriteSheets[0]).toMatchObject({ size: 4, tag: 77 });
    expect([...runtime.loadedSpriteSheets[0].data.slice(0, 4)]).toEqual([10, 11, 12, 13]);

    loadCompressedSpriteSheetOverrideBuffer(runtime, sheet(20, 88), override);
    expect(runtime.loadedSpriteSheets[1]).toMatchObject({ size: 4, tag: 88 });
    expect(runtime.loadedSpriteSheets[1].data).toBe(override);
    expect([...override]).toEqual([20, 21, 22, 23]);

    loadCompressedSpritePalette(runtime, { data: rawLz([30, 31, 32, 33]), tag: 99 });
    expect(runtime.loadedSpritePalettes[0].tag).toBe(99);
    expect([...runtime.loadedSpritePalettes[0].data.slice(0, 4)]).toEqual([30, 31, 32, 33]);
  });

  test('heap loaders return TRUE on allocation failure and FALSE after loading', () => {
    const runtime = createDecompressRuntime();

    runtime.allocationsFail = true;
    expect(loadCompressedSpriteSheetUsingHeap(runtime, sheet(40, 40))).toBe(true);
    expect(loadCompressedSpritePaletteUsingHeap(runtime, { data: rawLz([50]), tag: 50 })).toBe(true);
    expect(runtime.loadedSpriteSheets).toHaveLength(0);

    runtime.allocationsFail = false;
    expect(loadCompressedSpriteSheetUsingHeap(runtime, sheet(60, 60))).toBe(false);
    expect(loadCompressedSpritePaletteUsingHeap(runtime, { data: rawLz([70, 71]), tag: 70 })).toBe(false);
    expect([...runtime.loadedSpriteSheets[0].data]).toEqual([60, 61, 62, 63]);
    expect([...runtime.loadedSpritePalettes[0].data]).toEqual([70, 71]);
  });

  test('special Pokemon picture loading handles unknown species, Unown forms, Deoxys, and Spinda spots', () => {
    const frontTable = makePicTable();
    const backTable = makePicTable().map((entry, i) => sheet((i + 3) & 0xff, entry.tag));
    const runtime = createDecompressRuntime(frontTable, backTable);

    const unknown = new Uint8Array(4);
    decompressPicFromTable(runtime, sheet(1), unknown, NUM_SPECIES + 1);
    expect([...unknown]).toEqual([0xee, 0xef, 0xf0, 0xf1]);

    const selected = new Uint8Array(4);
    const personality = 1;
    expect(getUnownPicSpecies(personality)).toBe(SPECIES_UNOWN_B);
    loadSpecialPokePic(runtime, frontTable[SPECIES_UNOWN], selected, SPECIES_UNOWN, personality, true);
    expect([...selected]).toEqual([0xb0, 0xb1, 0xb2, 0xb3]);

    const handled = new Uint8Array(4);
    handleLoadSpecialPokePic(runtime, backTable[25], handled, 25, 123);
    expect([...handled]).toEqual([28, 29, 30, 31]);
    expect(runtime.spindaSpotCalls.at(-1)).toMatchObject({ species: 25, personality: 123, isFrontPic: false });

    const deoxys = new Uint8Array(0x1000);
    decompressPicFromTable(runtime, frontTable[SPECIES_DEOXYS], deoxys, SPECIES_DEOXYS);
    expect([...deoxys.slice(0, 0x20)]).toEqual([...deoxys.slice(0x800, 0x820)]);

    const deoxysNoDuplicate = new Uint8Array(0x1000);
    decompressPicFromTableDontHandleDeoxys(runtime, frontTable[SPECIES_DEOXYS], deoxysNoDuplicate, SPECIES_DEOXYS);
    expect(deoxysNoDuplicate[0]).toBe(0);
    expect(deoxysNoDuplicate[1]).toBe(1);

    const specialNoDuplicate = new Uint8Array(0x1000);
    loadSpecialPokePicDontHandleDeoxys(runtime, frontTable[SPECIES_DEOXYS], specialNoDuplicate, SPECIES_DEOXYS, 456, true);
    expect(specialNoDuplicate[0]).toBe(0);
    expect(specialNoDuplicate[1]).toBe(1);
    expect(runtime.spindaSpotCalls.at(-1)).toMatchObject({ species: SPECIES_DEOXYS, personality: 456, isFrontPic: true });
  });

  test('DuplicateDeoxysTiles copies the second 0x800-byte tile half over the first only for Deoxys', () => {
    const data = new Uint8Array(0x1000);
    data.fill(1, 0, 0x800);
    data.fill(2, 0x800);

    duplicateDeoxysTiles(data, 1);
    expect(data[0]).toBe(1);

    duplicateDeoxysTiles(data, SPECIES_DEOXYS);
    expect(data[0]).toBe(2);
    expect(data[0x7ff]).toBe(2);
  });

  test('StitchObjectsOn8x8Canvas copies even-sized objects and pads size-6 objects', () => {
    const src4 = Uint8Array.from(Array.from({ length: 4 * 4 * 32 }, (_, i) => i & 0xff));
    const dest4 = new Uint8Array(src4.length);
    stitchObjectsOn8x8Canvas(4, 1, src4, dest4);
    expect([...dest4]).toEqual([...src4]);

    const src6 = Uint8Array.from(Array.from({ length: 6 * 6 * 32 }, (_, i) => (i + 1) & 0xff));
    const dest6 = new Uint8Array(8 * 8 * 32).fill(0xaa);
    stitchObjectsOn8x8Canvas(6, 1, src6, dest6);
    expect([...dest6.slice(0, 256)]).toEqual(Array(256).fill(0));
    expect([...dest6.slice(288, 288 + 6 * 32)]).toEqual([...src6.slice(0, 6 * 32)]);
    expect([...dest6.slice(256, 288)]).toEqual(Array(32).fill(0));
    expect([...dest6.slice(288 + 6 * 32, 288 + 7 * 32)]).toEqual(Array(32).fill(0));
    expect([...dest6.slice(0x700, 0x800)]).toEqual(Array(256).fill(0));
  });

  test('StitchObjectsOn8x8Canvas centers odd-sized objects with 4px tile offsets', () => {
    const src = Uint8Array.from(Array.from({ length: 5 * 5 * 32 }, (_, i) => (i + 1) & 0xff));
    const dest = new Uint8Array(8 * 8 * 32).fill(0xaa);
    stitchObjectsOn8x8Canvas(5, 1, src, dest);

    expect(dest[0]).toBe(0);
    expect(dest[192]).toBe(0);
    expect(dest[0x120 + 18]).toBe(src[0]);
    expect(dest[0x120 + 19]).toBe(src[1]);
    expect(dest[0x120 + 48]).toBe(src[2]);
    expect(dest[0x120 + 49]).toBe(src[3]);
    expect(dest[0x120 + 258]).toBe(src[16]);
    expect(dest[0x120 + 259]).toBe(src[17]);
    expect(dest[0x120 + 288]).toBe(src[18]);
    expect(dest[0x120 + 289]).toBe(src[19]);
  });
});
