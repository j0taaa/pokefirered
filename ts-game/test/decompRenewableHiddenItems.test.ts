import { describe, expect, test } from 'vitest';
import {
  FLAG_HIDDEN_ITEMS_START,
  MAP_ROUTE20,
  MAP_ROUTE21_NORTH,
  MAX_HIDDEN_ITEMS_PER_GROUP,
  NO_ITEM,
  RENEWABLE_ITEM_STEP_COUNTER_CAP,
  IncrementRenewableHiddenItemStepCounter,
  SampleRenewableItemFlags,
  SetAllRenewableItemFlags,
  TryRegenerateRenewableHiddenItems,
  VAR_RENEWABLE_ITEM_STEP_COUNTER,
  createRenewableHiddenItemsRuntime,
  getHiddenItemFlag,
  renewableHiddenItems,
  setAllRenewableItemFlags,
  setRenewableHiddenItemsLocation,
  varGet,
  varSet
} from '../src/game/decompRenewableHiddenItems';

const route20Stardust = getHiddenItemFlag(153);
const route21Pearl = getHiddenItemFlag(154);
const undergroundNorthSouthEther = getHiddenItemFlag(76);
const undergroundNorthSouthPotion = getHiddenItemFlag(70);
const berryForestRazzBerry = getHiddenItemFlag(90);
const berryForestBlukBerry = getHiddenItemFlag(91);

describe('decomp renewable hidden items', () => {
  test('renewable hidden item table preserves fixed 8-slot C groups', () => {
    expect(renewableHiddenItems).toHaveLength(15);
    for (const entry of renewableHiddenItems) {
      expect(entry.rare).toHaveLength(MAX_HIDDEN_ITEMS_PER_GROUP);
      expect(entry.uncommon).toHaveLength(MAX_HIDDEN_ITEMS_PER_GROUP);
      expect(entry.common).toHaveLength(MAX_HIDDEN_ITEMS_PER_GROUP);
    }

    expect(renewableHiddenItems[0]).toMatchObject({
      mapGroup: 3,
      mapNum: 38,
      rare: [NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM],
      uncommon: [153, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM],
      common: [NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM]
    });
    expect(renewableHiddenItems[6].rare).toEqual([91, 93, 94, 95, 99, 100, 101, 102]);
    expect(renewableHiddenItems[14].rare).toEqual([185, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM, NO_ITEM]);
  });

  test('SetAllRenewableItemFlags sets every non-NO_ITEM hidden item flag', () => {
    const runtime = createRenewableHiddenItemsRuntime();

    SetAllRenewableItemFlags(runtime);

    expect(runtime.flags.has(route20Stardust)).toBe(true);
    expect(runtime.flags.has(route21Pearl)).toBe(true);
    expect(runtime.flags.has(undergroundNorthSouthEther)).toBe(true);
    expect(runtime.flags.has(berryForestRazzBerry)).toBe(true);
    expect(runtime.flags.has(berryForestBlukBerry)).toBe(true);
    expect(runtime.flags.has(FLAG_HIDDEN_ITEMS_START + NO_ITEM)).toBe(false);
  });

  test('IncrementRenewableHiddenItemStepCounter increments until the 1500-step cap', () => {
    const runtime = createRenewableHiddenItemsRuntime();

    IncrementRenewableHiddenItemStepCounter(runtime);
    expect(varGet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER)).toBe(1);

    varSet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER, RENEWABLE_ITEM_STEP_COUNTER_CAP - 1);
    IncrementRenewableHiddenItemStepCounter(runtime);
    expect(varGet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER)).toBe(RENEWABLE_ITEM_STEP_COUNTER_CAP);

    IncrementRenewableHiddenItemStepCounter(runtime);
    expect(varGet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER)).toBe(RENEWABLE_ITEM_STEP_COUNTER_CAP);
  });

  test('TryRegenerateRenewableHiddenItems returns early outside renewable maps', () => {
    let randomCalls = 0;
    const runtime = createRenewableHiddenItemsRuntime(0, 0);
    runtime.randomOverride = () => {
      randomCalls += 1;
      return 90;
    };
    varSet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER, RENEWABLE_ITEM_STEP_COUNTER_CAP);

    TryRegenerateRenewableHiddenItems(runtime);

    expect(varGet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER)).toBe(RENEWABLE_ITEM_STEP_COUNTER_CAP);
    expect(runtime.flags.size).toBe(0);
    expect(randomCalls).toBe(0);
  });

  test('TryRegenerateRenewableHiddenItems waits for the capped counter on renewable maps', () => {
    let randomCalls = 0;
    const runtime = createRenewableHiddenItemsRuntime(0, MAP_ROUTE20);
    runtime.randomOverride = () => {
      randomCalls += 1;
      return 60;
    };
    varSet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER, RENEWABLE_ITEM_STEP_COUNTER_CAP - 1);

    TryRegenerateRenewableHiddenItems(runtime);

    expect(varGet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER)).toBe(RENEWABLE_ITEM_STEP_COUNTER_CAP - 1);
    expect(runtime.flags.size).toBe(0);
    expect(randomCalls).toBe(0);
  });

  test('TryRegenerateRenewableHiddenItems resets the counter and samples every renewable group', () => {
    const randomValues = [0, 60, 90, 59, 89, 99, 0, 60, 90, 59, 89, 99, 0, 60, 90];
    const runtime = createRenewableHiddenItemsRuntime(0, MAP_ROUTE20);
    runtime.randomOverride = () => randomValues.shift() ?? 0;
    varSet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER, RENEWABLE_ITEM_STEP_COUNTER_CAP);

    TryRegenerateRenewableHiddenItems(runtime);

    expect(varGet(runtime, VAR_RENEWABLE_ITEM_STEP_COUNTER)).toBe(0);
    expect(randomValues).toHaveLength(0);
    expect(runtime.flags.has(route20Stardust)).toBe(true);
    expect(runtime.flags.has(route21Pearl)).toBe(false);
    expect(runtime.flags.has(undergroundNorthSouthEther)).toBe(false);
    expect(runtime.flags.has(undergroundNorthSouthPotion)).toBe(true);
    expect(runtime.flags.has(berryForestRazzBerry)).toBe(false);
    expect(runtime.flags.has(berryForestBlukBerry)).toBe(true);
  });

  test('SampleRenewableItemFlags uses common below 60, uncommon from 60, and rare from 90', () => {
    const runtime = createRenewableHiddenItemsRuntime();
    setAllRenewableItemFlags(runtime);

    runtime.randomOverride = () => 59;
    SampleRenewableItemFlags(runtime);
    expect(runtime.flags.has(route20Stardust)).toBe(true);

    setAllRenewableItemFlags(runtime);
    runtime.randomOverride = () => 60;
    SampleRenewableItemFlags(runtime);
    expect(runtime.flags.has(route20Stardust)).toBe(false);
    expect(runtime.flags.has(route21Pearl)).toBe(false);

    setAllRenewableItemFlags(runtime);
    setRenewableHiddenItemsLocation(runtime, MAP_ROUTE21_NORTH);
    runtime.randomOverride = () => 90;
    SampleRenewableItemFlags(runtime);
    expect(runtime.flags.has(route20Stardust)).toBe(true);
    expect(runtime.flags.has(route21Pearl)).toBe(true);
  });
});
