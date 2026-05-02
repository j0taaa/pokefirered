import { describe, expect, test } from 'vitest';
import {
  DoWateringBerryTreeAnim,
  FLDEFF_BERRYTREE_C_TRANSLATION_UNIT,
  doWateringBerryTreeAnim
} from '../src/game/decompFldEffBerryTree';

describe('decompFldEffBerryTree', () => {
  test('DoWateringBerryTreeAnim remains the removed Ruby/Sapphire no-op', () => {
    const sentinel = { untouched: true };

    expect(FLDEFF_BERRYTREE_C_TRANSLATION_UNIT).toBe('src/fldeff_berrytree.c');
    expect(doWateringBerryTreeAnim()).toBeUndefined();
    expect(DoWateringBerryTreeAnim()).toBeUndefined();
    expect(sentinel).toEqual({ untouched: true });
  });
});
