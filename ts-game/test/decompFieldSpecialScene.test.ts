import { describe, expect, test } from 'vitest';
import {
  FieldCB_ShowPortholeView,
  FieldSpecialScene_Dummy0,
  FieldSpecialScene_Dummy1,
  FieldSpecialScene_Dummy2,
  FieldSpecialScene_Dummy3,
  LookThroughPorthole,
  fieldCbShowPortholeView,
  fieldSpecialSceneDummy0,
  lookThroughPorthole
} from '../src/game/decompFieldSpecialScene';

describe('decomp field_special_scene', () => {
  test('keeps the original dummy return value', () => {
    expect(fieldSpecialSceneDummy0()).toBe(0);
  });

  test('keeps the original porthole callbacks as no-ops', () => {
    expect(fieldCbShowPortholeView()).toBeUndefined();
    expect(lookThroughPorthole()).toBeUndefined();
  });

  test('exact C-name entry points preserve dummy and no-op behavior', () => {
    expect(FieldSpecialScene_Dummy0()).toBe(0);
    expect(FieldSpecialScene_Dummy1()).toBeUndefined();
    expect(FieldSpecialScene_Dummy2()).toBeUndefined();
    expect(FieldSpecialScene_Dummy3()).toBeUndefined();
    expect(FieldCB_ShowPortholeView()).toBeUndefined();
    expect(LookThroughPorthole()).toBeUndefined();
  });
});
