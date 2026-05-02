import { describe, expect, test } from 'vitest';
import {
  BERRY_FIRMNESS_HARD,
  BERRY_FIRMNESS_SOFT,
  BERRY_FIRMNESS_SUPER_HARD,
  BERRY_FIRMNESS_UNKNOWN,
  BERRY_FIRMNESS_VERY_HARD,
  BERRY_FIRMNESS_VERY_SOFT,
  BERRY_ITEM_EFFECT_COUNT,
  BERRY_NAME_COUNT,
  BERRY_NAME_LENGTH,
  BERRY_SOURCE,
  BerryTypeToItemId,
  ClearEnigmaBerries,
  ENIGMA_BERRY_TYPE,
  FIRST_BERRY_INDEX,
  FLAVOR_BITTER,
  FLAVOR_COUNT,
  FLAVOR_DRY,
  FLAVOR_SOUR,
  FLAVOR_SPICY,
  FLAVOR_SWEET,
  GetBerryInfo,
  GetBerryNameByBerryType,
  GetEnigmaBerryChecksum,
  InitEnigmaBerry,
  IsEnigmaBerryValid,
  ITEM_CHERI_BERRY,
  ITEM_ENIGMA_BERRY,
  ItemIdToBerryType,
  LAST_BERRY_INDEX,
  NUM_BERRIES,
  SetEnigmaBerry,
  berryTypeToItemId,
  clearEnigmaBerries,
  copyEnigmaBerry,
  createBerryRuntime,
  gBerryCrush_BerryData,
  gBerries,
  gBlankBerryTree,
  getBerryInfo,
  getBerryNameByBerryType,
  getBerryNameBytesByBerryType,
  getEnigmaBerryChecksum,
  initEnigmaBerry,
  isEnigmaBerryValid,
  itemIdToBerryType,
  itemToBerry,
  parseBerries,
  parseBerryCrushStats,
  setEnigmaBerry
} from '../src/game/decompBerry';

describe('decomp berry', () => {
  test('constants mirror berry.h and item berry range', () => {
    expect([BERRY_FIRMNESS_UNKNOWN, BERRY_FIRMNESS_VERY_SOFT, BERRY_FIRMNESS_SOFT, BERRY_FIRMNESS_HARD, BERRY_FIRMNESS_VERY_HARD, BERRY_FIRMNESS_SUPER_HARD]).toEqual([0, 1, 2, 3, 4, 5]);
    expect([FLAVOR_SPICY, FLAVOR_DRY, FLAVOR_SWEET, FLAVOR_BITTER, FLAVOR_SOUR, FLAVOR_COUNT]).toEqual([0, 1, 2, 3, 4, 5]);
    expect([BERRY_NAME_LENGTH, BERRY_NAME_COUNT, BERRY_ITEM_EFFECT_COUNT, NUM_BERRIES]).toEqual([6, 7, 18, 44]);
    expect([ITEM_CHERI_BERRY, ITEM_ENIGMA_BERRY, FIRST_BERRY_INDEX, LAST_BERRY_INDEX, ENIGMA_BERRY_TYPE]).toEqual([133, 175, 133, 175, 43]);
  });

  test('gBerries is parsed 1:1 from src/berry.c table order', () => {
    const reparsed = parseBerries(BERRY_SOURCE);
    expect(gBerries).toEqual(reparsed);
    expect(gBerries).toHaveLength(43);
    expect(gBerries[0]).toMatchObject({
      itemId: 133,
      itemConstant: 'ITEM_CHERI_BERRY',
      name: 'CHERI',
      firmness: BERRY_FIRMNESS_SOFT,
      size: 20,
      maxYield: 3,
      minYield: 2,
      stageDuration: 3,
      spicy: 10,
      dry: 0,
      sweet: 0,
      bitter: 0,
      sour: 0,
      smoothness: 25
    });
    expect(gBerries[0].description1).toBe('とても かわいい はなが さく.');
    expect(gBerries[0].description2).toBe('まっかな みは とても からい.');
    expect(gBerries[8]).toMatchObject({ itemConstant: 'ITEM_LUM_BERRY', name: 'LUM', maxYield: 2, minYield: 1, stageDuration: 12 });
    expect(gBerries[30]).toMatchObject({ itemConstant: 'ITEM_SPELON_BERRY', name: 'SPELON', spicy: 40, smoothness: 70 });
    expect(gBerries[42]).toMatchObject({
      itemId: 175,
      itemConstant: 'ITEM_ENIGMA_BERRY',
      name: 'ENIGMA',
      firmness: BERRY_FIRMNESS_UNKNOWN,
      size: 0,
      maxYield: 2,
      minYield: 1,
      stageDuration: 24,
      spicy: 40,
      dry: 40,
      sweet: 40,
      bitter: 40,
      sour: 40,
      smoothness: 40
    });
  });

  test('Berry Crush data is parsed 1:1 and preserves group thresholds', () => {
    expect(gBerryCrush_BerryData).toEqual(parseBerryCrushStats(BERRY_SOURCE));
    expect(gBerryCrush_BerryData).toHaveLength(43);
    expect(gBerryCrush_BerryData[0]).toEqual({ difficulty: 50, powder: 20 });
    expect(gBerryCrush_BerryData[5]).toEqual({ difficulty: 50, powder: 30 });
    expect(gBerryCrush_BerryData[20]).toEqual({ difficulty: 100, powder: 100 });
    expect(gBerryCrush_BerryData[30]).toEqual({ difficulty: 160, powder: 250 });
    expect(gBerryCrush_BerryData[40]).toEqual({ difficulty: 200, powder: 750 });
    expect(gBerryCrush_BerryData[42]).toEqual({ difficulty: 150, powder: 200 });
  });

  test('gBlankBerryTree is the all-zero leftover R/S struct', () => {
    expect(gBlankBerryTree).toEqual({
      berry: 0,
      stage: 0,
      growthSparkle: 0,
      minutesUntilNextStage: 0,
      berryYield: 0,
      regrowthCount: 0,
      watered1: 0,
      watered2: 0,
      watered3: 0,
      watered4: 0
    });
  });

  test('item/berry conversion functions preserve C fallback boundaries', () => {
    expect(itemToBerry(ITEM_CHERI_BERRY)).toBe(1);
    expect(itemToBerry(ITEM_ENIGMA_BERRY)).toBe(43);
    expect(itemIdToBerryType(ITEM_CHERI_BERRY - 1)).toBe(1);
    expect(itemIdToBerryType(ITEM_CHERI_BERRY)).toBe(1);
    expect(itemIdToBerryType(ITEM_CHERI_BERRY + 9)).toBe(10);
    expect(itemIdToBerryType(ITEM_ENIGMA_BERRY)).toBe(43);
    expect(itemIdToBerryType(ITEM_ENIGMA_BERRY + 1)).toBe(1);
    expect(berryTypeToItemId(0)).toBe(FIRST_BERRY_INDEX);
    expect(berryTypeToItemId(1)).toBe(ITEM_CHERI_BERRY);
    expect(berryTypeToItemId(43)).toBe(ITEM_ENIGMA_BERRY);
    expect(berryTypeToItemId(44)).toBe(FIRST_BERRY_INDEX);
  });

  test('InitEnigmaBerry copies the Enigma table entry, zeros effects, and writes checksum', () => {
    const runtime = createBerryRuntime();
    runtime.gSaveBlock1Ptr.enigmaBerry.berry.name = 'BROKEN';
    runtime.gSaveBlock1Ptr.enigmaBerry.itemEffect[0] = 9;
    runtime.gSaveBlock1Ptr.enigmaBerry.holdEffect = 3;
    initEnigmaBerry(runtime);
    expect(runtime.gSaveBlock1Ptr.enigmaBerry.berry).toEqual(gBerries[ENIGMA_BERRY_TYPE - 1]);
    expect(runtime.gSaveBlock1Ptr.enigmaBerry.itemEffect).toEqual(Array.from({ length: BERRY_ITEM_EFFECT_COUNT }, () => 0));
    expect(runtime.gSaveBlock1Ptr.enigmaBerry.holdEffect).toBe(0);
    expect(runtime.gSaveBlock1Ptr.enigmaBerry.holdEffectParam).toBe(0);
    expect(runtime.gSaveBlock1Ptr.enigmaBerry.checksum).toBe(getEnigmaBerryChecksum(runtime.gSaveBlock1Ptr.enigmaBerry));
  });

  test('ClearEnigmaBerries zeroes then reinitializes like C CpuFill16 + InitEnigmaBerry', () => {
    const runtime = createBerryRuntime();
    const initial = copyEnigmaBerry(runtime);
    runtime.gSaveBlock1Ptr.enigmaBerry.berry.stageDuration = 0;
    runtime.gSaveBlock1Ptr.enigmaBerry.checksum = 123;
    clearEnigmaBerries(runtime);
    expect(runtime.gSaveBlock1Ptr.enigmaBerry).toEqual(initial);
  });

  test('SetEnigmaBerry copies received berry/effects/hold data and recomputes checksum', () => {
    const runtime = createBerryRuntime();
    const received = {
      berry: {
        ...gBerries[0],
        name: 'CUSTOM',
        nameBytes: [67, 85, 83, 84, 79, 77, 0],
        maxYield: 5,
        stageDuration: 9
      },
      itemEffect: Array.from({ length: BERRY_ITEM_EFFECT_COUNT }, (_, i) => i + 1),
      holdEffect: 77,
      holdEffectParam: 88
    };
    setEnigmaBerry(runtime, received);
    expect(runtime.gSaveBlock1Ptr.enigmaBerry).toMatchObject(received);
    expect(runtime.gSaveBlock1Ptr.enigmaBerry.checksum).toBe(getEnigmaBerryChecksum(runtime.gSaveBlock1Ptr.enigmaBerry));
  });

  test('IsEnigmaBerryValid fails for zero stage, zero yield, and checksum mismatch', () => {
    const runtime = createBerryRuntime();
    expect(isEnigmaBerryValid(runtime)).toBe(true);
    runtime.gSaveBlock1Ptr.enigmaBerry.berry.stageDuration = 0;
    runtime.gSaveBlock1Ptr.enigmaBerry.checksum = getEnigmaBerryChecksum(runtime.gSaveBlock1Ptr.enigmaBerry);
    expect(isEnigmaBerryValid(runtime)).toBe(false);
    initEnigmaBerry(runtime);
    runtime.gSaveBlock1Ptr.enigmaBerry.berry.maxYield = 0;
    runtime.gSaveBlock1Ptr.enigmaBerry.checksum = getEnigmaBerryChecksum(runtime.gSaveBlock1Ptr.enigmaBerry);
    expect(isEnigmaBerryValid(runtime)).toBe(false);
    initEnigmaBerry(runtime);
    runtime.gSaveBlock1Ptr.enigmaBerry.checksum ^= 1;
    expect(isEnigmaBerryValid(runtime)).toBe(false);
  });

  test('GetBerryInfo returns valid Enigma Berry, otherwise clamps 0 and out-of-range to Cheri', () => {
    const runtime = createBerryRuntime();
    expect(getBerryInfo(runtime, 0)).toBe(gBerries[0]);
    expect(getBerryInfo(runtime, 99)).toBe(gBerries[0]);
    expect(getBerryInfo(runtime, 2)).toBe(gBerries[1]);
    expect(getBerryInfo(runtime, ENIGMA_BERRY_TYPE)).toEqual(runtime.gSaveBlock1Ptr.enigmaBerry.berry);
    runtime.gSaveBlock1Ptr.enigmaBerry.checksum ^= 1;
    expect(getBerryInfo(runtime, ENIGMA_BERRY_TYPE)).toBe(gBerries[ENIGMA_BERRY_TYPE - 1]);
  });

  test('GetBerryNameByBerryType copies exactly six name bytes then EOS', () => {
    const runtime = createBerryRuntime();
    expect(getBerryNameBytesByBerryType(runtime, 1)).toEqual([67, 72, 69, 82, 73, 0, 0]);
    expect(getBerryNameByBerryType(runtime, 1)).toBe('CHERI');
    expect(getBerryNameBytesByBerryType(runtime, ENIGMA_BERRY_TYPE)).toEqual([69, 78, 73, 71, 77, 65, 0]);

    const received = {
      berry: {
        ...gBerries[0],
        name: 'ABCDEF',
        nameBytes: [65, 66, 67, 68, 69, 70, 0],
        maxYield: 1,
        stageDuration: 1
      },
      itemEffect: [],
      holdEffect: 0,
      holdEffectParam: 0
    };
    setEnigmaBerry(runtime, received);
    expect(getBerryNameBytesByBerryType(runtime, ENIGMA_BERRY_TYPE)).toEqual([65, 66, 67, 68, 69, 70, 0]);
    expect(getBerryNameByBerryType(runtime, ENIGMA_BERRY_TYPE)).toBe('ABCDEF');
  });

  test('exact C-name berry functions preserve enigma, conversion, and name-copy behavior', () => {
    const runtime = createBerryRuntime();
    runtime.gSaveBlock1Ptr.enigmaBerry.berry.name = 'BROKEN';
    runtime.gSaveBlock1Ptr.enigmaBerry.itemEffect[0] = 99;

    InitEnigmaBerry(runtime);
    expect(runtime.gSaveBlock1Ptr.enigmaBerry.berry).toEqual(gBerries[ENIGMA_BERRY_TYPE - 1]);
    expect(runtime.gSaveBlock1Ptr.enigmaBerry.itemEffect).toEqual(Array.from({ length: BERRY_ITEM_EFFECT_COUNT }, () => 0));
    expect(runtime.gSaveBlock1Ptr.enigmaBerry.checksum).toBe(GetEnigmaBerryChecksum(runtime.gSaveBlock1Ptr.enigmaBerry));
    expect(IsEnigmaBerryValid(runtime)).toBe(true);

    const initial = copyEnigmaBerry(runtime);
    runtime.gSaveBlock1Ptr.enigmaBerry.checksum = 1;
    ClearEnigmaBerries(runtime);
    expect(runtime.gSaveBlock1Ptr.enigmaBerry).toEqual(initial);

    const received = {
      berry: {
        ...gBerries[0],
        name: 'XYZ123',
        nameBytes: [88, 89, 90, 49, 50, 51, 0],
        maxYield: 4,
        stageDuration: 6
      },
      itemEffect: Array.from({ length: BERRY_ITEM_EFFECT_COUNT }, (_, i) => 18 - i),
      holdEffect: 5,
      holdEffectParam: 6
    };
    SetEnigmaBerry(runtime, received);
    expect(runtime.gSaveBlock1Ptr.enigmaBerry).toMatchObject(received);
    expect(IsEnigmaBerryValid(runtime)).toBe(true);
    expect(GetBerryInfo(runtime, ENIGMA_BERRY_TYPE)).toEqual(runtime.gSaveBlock1Ptr.enigmaBerry.berry);
    runtime.gSaveBlock1Ptr.enigmaBerry.checksum ^= 1;
    expect(IsEnigmaBerryValid(runtime)).toBe(false);
    expect(GetBerryInfo(runtime, ENIGMA_BERRY_TYPE)).toBe(gBerries[ENIGMA_BERRY_TYPE - 1]);

    expect(ItemIdToBerryType(ITEM_CHERI_BERRY - 1)).toBe(1);
    expect(ItemIdToBerryType(ITEM_ENIGMA_BERRY)).toBe(ENIGMA_BERRY_TYPE);
    expect(ItemIdToBerryType(ITEM_ENIGMA_BERRY + 1)).toBe(1);
    expect(BerryTypeToItemId(0)).toBe(FIRST_BERRY_INDEX);
    expect(BerryTypeToItemId(ENIGMA_BERRY_TYPE)).toBe(ITEM_ENIGMA_BERRY);
    expect(BerryTypeToItemId(ENIGMA_BERRY_TYPE + 1)).toBe(FIRST_BERRY_INDEX);

    const dest = [1, 1, 1, 1, 1, 1, 1, 77];
    GetBerryNameByBerryType(runtime, 1, dest);
    expect(dest).toEqual([67, 72, 69, 82, 73, 0, 0, 77]);
  });
});
