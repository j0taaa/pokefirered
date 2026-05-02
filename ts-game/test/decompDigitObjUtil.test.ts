import { describe, expect, test } from 'vitest';
import {
  CopyWorkToOam,
  DIGIT_OAM_START,
  DigitObjUtil_CreatePrinter,
  DigitObjUtil_DeletePrinter,
  DigitObjUtil_Free,
  DigitObjUtil_HideOrShow,
  DigitObjUtil_Init,
  DigitObjUtil_PrintNumOn,
  DrawNumObjsLeadingZeros,
  DrawNumObjsMinusInBack,
  DrawNumObjsMinusInFront,
  GetFirstOamId,
  GetTilesPerImage,
  INDEX_NONE,
  SharesPalWithAnyActive,
  SharesTileWithAnyActive,
  ST_OAM_AFFINE_ERASE,
  ST_OAM_AFFINE_OFF,
  ST_OAM_H_RECTANGLE,
  ST_OAM_SIZE_0,
  ST_OAM_SIZE_1,
  ST_OAM_SIZE_2,
  ST_OAM_SQUARE,
  ST_OAM_V_RECTANGLE,
  createDigitObjUtilRuntime,
  digitObjUtilCreatePrinter,
  digitObjUtilDeletePrinter,
  digitObjUtilFree,
  digitObjUtilHideOrShow,
  digitObjUtilInit,
  digitObjUtilPrintNumOn,
  getTilesPerImage
} from '../src/game/decompDigitObjUtil';

const template = (overrides: Partial<Parameters<typeof digitObjUtilCreatePrinter>[3]> = {}) => ({
  strConvMode: 0,
  shape: ST_OAM_SQUARE,
  size: ST_OAM_SIZE_1,
  priority: 2,
  oamCount: 3,
  xDelta: 8,
  x: 40,
  y: 50,
  spriteSheet: { uncompressed: { tag: 100, size: 64 } },
  spritePal: { tag: 200 },
  ...overrides
});

const tiles = (runtime: ReturnType<typeof createDigitObjUtilRuntime>, start: number, count: number) =>
  runtime.oamBuffer.slice(start, start + count).map((oam) => oam.tileNum);

const affineModes = (
  runtime: ReturnType<typeof createDigitObjUtilRuntime>,
  start: number,
  count: number
) => runtime.oamBuffer.slice(start, start + count).map((oam) => oam.affineMode);

describe('decomp digit_obj_util', () => {
  test('GetTilesPerImage uses the exact shape/size lookup table', () => {
    expect(getTilesPerImage(ST_OAM_SQUARE, ST_OAM_SIZE_0)).toBe(1);
    expect(getTilesPerImage(ST_OAM_SQUARE, ST_OAM_SIZE_2)).toBe(16);
    expect(getTilesPerImage(ST_OAM_H_RECTANGLE, ST_OAM_SIZE_0)).toBe(2);
    expect(getTilesPerImage(ST_OAM_H_RECTANGLE, ST_OAM_SIZE_2)).toBe(8);
    expect(getTilesPerImage(ST_OAM_V_RECTANGLE, ST_OAM_SIZE_0)).toBe(2);
    expect(getTilesPerImage(ST_OAM_V_RECTANGLE, ST_OAM_SIZE_2)).toBe(8);
  });

  test('CreatePrinter allocates OAM, loads resources, initializes minus sprite, and prints leading zeros', () => {
    const runtime = createDigitObjUtilRuntime();
    expect(digitObjUtilCreatePrinter(runtime, 0, 12, template())).toBe(false);
    expect(digitObjUtilInit(runtime, 2)).toBe(true);

    expect(digitObjUtilCreatePrinter(runtime, 0, 12, template())).toBe(true);
    expect(runtime.loadedSheets).toEqual([{ tag: 100, size: 64, compressed: false, tileStart: 0 }]);
    expect(runtime.loadedPalettes).toEqual([{ tag: 200, paletteIndex: 0 }]);
    expect(runtime.oamBuffer.slice(DIGIT_OAM_START, DIGIT_OAM_START + 4)).toMatchObject([
      { x: 40, y: 50, shape: ST_OAM_SQUARE, size: ST_OAM_SIZE_1, priority: 2, paletteNum: 0 },
      { x: 48, y: 50, shape: ST_OAM_SQUARE, size: ST_OAM_SIZE_1, priority: 2, paletteNum: 0 },
      { x: 56, y: 50, shape: ST_OAM_SQUARE, size: ST_OAM_SIZE_1, priority: 2, paletteNum: 0 },
      { x: 32, y: 50, shape: ST_OAM_SQUARE, size: ST_OAM_SIZE_1, priority: 2, paletteNum: 0 }
    ]);
    expect(tiles(runtime, DIGIT_OAM_START, 4)).toEqual([0, 4, 8, 40]);
    expect(affineModes(runtime, DIGIT_OAM_START, 4)).toEqual([
      ST_OAM_AFFINE_OFF,
      ST_OAM_AFFINE_OFF,
      ST_OAM_AFFINE_OFF,
      ST_OAM_AFFINE_ERASE
    ]);

    digitObjUtilPrintNumOn(runtime, 0, -987);
    expect(tiles(runtime, DIGIT_OAM_START, 4)).toEqual([36, 32, 28, 40]);
    expect(runtime.oamBuffer[DIGIT_OAM_START + 3].affineMode).toBe(ST_OAM_AFFINE_OFF);
  });

  test('minus-in-front mode erases leading zeroes and moves the minus before first printed digit', () => {
    const runtime = createDigitObjUtilRuntime();
    digitObjUtilInit(runtime, 1);
    digitObjUtilCreatePrinter(runtime, 0, -5, template({ strConvMode: 1 }));

    expect(tiles(runtime, DIGIT_OAM_START, 4)).toEqual([0, 0, 20, 40]);
    expect(affineModes(runtime, DIGIT_OAM_START, 4)).toEqual([
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_OFF,
      ST_OAM_AFFINE_OFF
    ]);
    expect(runtime.oamBuffer[DIGIT_OAM_START + 3].x).toBe(48);

    digitObjUtilPrintNumOn(runtime, 0, 0);
    expect(affineModes(runtime, DIGIT_OAM_START, 4)).toEqual([
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_OFF,
      ST_OAM_AFFINE_ERASE
    ]);
  });

  test('minus-in-back mode compacts digits at the front and erases remaining digit OAM', () => {
    const runtime = createDigitObjUtilRuntime();
    digitObjUtilInit(runtime, 1);
    digitObjUtilCreatePrinter(runtime, 0, -42, template({ strConvMode: 2 }));

    expect(tiles(runtime, DIGIT_OAM_START, 4)).toEqual([16, 8, 0, 40]);
    expect(affineModes(runtime, DIGIT_OAM_START, 4)).toEqual([
      ST_OAM_AFFINE_OFF,
      ST_OAM_AFFINE_OFF,
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_OFF
    ]);
  });

  test('HideOrShow erases all OAM then restores modes by reprinting the last value', () => {
    const runtime = createDigitObjUtilRuntime();
    digitObjUtilInit(runtime, 1);
    digitObjUtilCreatePrinter(runtime, 0, 7, template({ strConvMode: 1 }));

    digitObjUtilHideOrShow(runtime, 0, true);
    expect(affineModes(runtime, DIGIT_OAM_START, 4)).toEqual([
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_ERASE
    ]);

    digitObjUtilHideOrShow(runtime, 0, false);
    expect(affineModes(runtime, DIGIT_OAM_START, 4)).toEqual([
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_OFF,
      ST_OAM_AFFINE_ERASE
    ]);
  });

  test('DeletePrinter frees shared tiles and palettes only after the last active user', () => {
    const runtime = createDigitObjUtilRuntime();
    digitObjUtilInit(runtime, 2);
    expect(digitObjUtilCreatePrinter(runtime, 0, 1, template())).toBe(true);
    expect(digitObjUtilCreatePrinter(runtime, 1, 2, template())).toBe(true);
    expect(runtime.loadedSheets).toHaveLength(1);
    expect(runtime.loadedPalettes).toHaveLength(1);

    digitObjUtilDeletePrinter(runtime, 0);
    expect(runtime.freedTileTags).toEqual([]);
    expect(runtime.freedPaletteTags).toEqual([]);

    digitObjUtilDeletePrinter(runtime, 1);
    expect(runtime.freedTileTags).toEqual([100]);
    expect(runtime.freedPaletteTags).toEqual([200]);
  });

  test('inactive OAM ranges can be reused when they are large enough and OAM overflow fails', () => {
    const runtime = createDigitObjUtilRuntime();
    digitObjUtilInit(runtime, 2);
    digitObjUtilCreatePrinter(runtime, 0, 1, template({ oamCount: 3 }));
    digitObjUtilDeletePrinter(runtime, 0);

    expect(digitObjUtilCreatePrinter(runtime, 1, 2, template({ oamCount: 2 }))).toBe(true);
    expect(runtime.oamWork?.array[1].firstOamId).toBe(DIGIT_OAM_START);

    const fullRuntime = createDigitObjUtilRuntime();
    digitObjUtilInit(fullRuntime, 1);
    expect(digitObjUtilCreatePrinter(fullRuntime, 0, 1, template({ oamCount: 64 }))).toBe(false);
    expect(fullRuntime.oamWork?.array[0].firstOamId).toBe(INDEX_NONE);
  });

  test('compressed sheets use decompressed size when uncompressed template size is zero', () => {
    const runtime = createDigitObjUtilRuntime();
    digitObjUtilInit(runtime, 1);
    const made = digitObjUtilCreatePrinter(
      runtime,
      0,
      1,
      template({
        spriteSheet: {
          uncompressed: { tag: 300, size: 0 },
          compressed: { tag: 300, size: 12, decompressedSize: 128 }
        },
        spritePal: { tag: 400 }
      })
    );

    expect(made).toBe(true);
    expect(runtime.loadedSheets).toEqual([{ tag: 300, size: 128, compressed: true, tileStart: 0 }]);
  });

  test('Free deletes active printers and nulls the work allocation', () => {
    const runtime = createDigitObjUtilRuntime();
    digitObjUtilInit(runtime, 1);
    digitObjUtilCreatePrinter(runtime, 0, 1, template());
    digitObjUtilFree(runtime);

    expect(runtime.oamWork).toBeNull();
    expect(runtime.freedTileTags).toEqual([100]);
    expect(runtime.freedPaletteTags).toEqual([200]);
  });

  test('exact C-name digit obj exports preserve allocation, OAM copy, draw modes, sharing checks, hide/show, and free', () => {
    const runtime = createDigitObjUtilRuntime();
    expect(GetTilesPerImage(ST_OAM_SQUARE, ST_OAM_SIZE_1)).toBe(4);
    expect(DigitObjUtil_Init(runtime, 2)).toBe(true);
    expect(GetFirstOamId(runtime, 3)).toBe(DIGIT_OAM_START);

    expect(DigitObjUtil_CreatePrinter(runtime, 0, 123, template())).toBe(true);
    expect(tiles(runtime, DIGIT_OAM_START, 4)).toEqual([4, 8, 12, 40]);
    CopyWorkToOam(runtime, 0);
    expect(runtime.oamBuffer[DIGIT_OAM_START + 3]).toMatchObject({
      x: 32,
      affineMode: ST_OAM_AFFINE_ERASE,
      tileNum: 40
    });

    DrawNumObjsLeadingZeros(runtime, 0, 7, false);
    expect(tiles(runtime, DIGIT_OAM_START, 4)).toEqual([0, 0, 28, 40]);
    DrawNumObjsMinusInFront(runtime, 0, 5, true);
    expect(runtime.oamBuffer[DIGIT_OAM_START + 3]).toMatchObject({
      affineMode: ST_OAM_AFFINE_OFF,
      x: 48
    });
    DrawNumObjsMinusInBack(runtime, 0, 42, true);
    expect(tiles(runtime, DIGIT_OAM_START, 4)).toEqual([16, 8, 20, 40]);
    expect(runtime.oamBuffer[DIGIT_OAM_START + 2].affineMode).toBe(ST_OAM_AFFINE_ERASE);
    expect(runtime.oamBuffer[DIGIT_OAM_START + 3].affineMode).toBe(ST_OAM_AFFINE_OFF);

    DigitObjUtil_PrintNumOn(runtime, 0, -987);
    expect(tiles(runtime, DIGIT_OAM_START, 4)).toEqual([36, 32, 28, 40]);
    DigitObjUtil_HideOrShow(runtime, 0, true);
    expect(affineModes(runtime, DIGIT_OAM_START, 4)).toEqual([
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_ERASE,
      ST_OAM_AFFINE_ERASE
    ]);
    DigitObjUtil_HideOrShow(runtime, 0, false);
    expect(runtime.oamBuffer[DIGIT_OAM_START + 3].affineMode).toBe(ST_OAM_AFFINE_OFF);

    expect(DigitObjUtil_CreatePrinter(runtime, 1, 1, template())).toBe(true);
    expect(SharesTileWithAnyActive(runtime, 0)).toBe(true);
    expect(SharesPalWithAnyActive(runtime, 0)).toBe(true);
    DigitObjUtil_DeletePrinter(runtime, 1);
    expect(SharesTileWithAnyActive(runtime, 0)).toBe(false);
    expect(SharesPalWithAnyActive(runtime, 0)).toBe(false);

    DigitObjUtil_Free(runtime);
    expect(runtime.oamWork).toBeNull();
    expect(runtime.freedTileTags.at(-1)).toBe(100);
    expect(runtime.freedPaletteTags.at(-1)).toBe(200);
  });
});
