import { describe, expect, test } from 'vitest';
import {
  createFieldPoisonEffectState,
  fldEffPoisonIsActive,
  fldEffPoisonStart,
  stepFieldPoisonEffect
} from '../src/game/decompFieldPoison';

describe('decomp fldeff_poison', () => {
  test('starts inactive and becomes active when started', () => {
    const effect = createFieldPoisonEffectState();
    expect(fldEffPoisonIsActive(effect)).toBe(false);

    fldEffPoisonStart(effect);
    expect(fldEffPoisonIsActive(effect)).toBe(true);
    expect(effect.mosaic).toBe(0);
  });

  test('follows the rev0 task mosaic sequence from the C state machine', () => {
    const effect = createFieldPoisonEffectState();
    fldEffPoisonStart(effect);

    const mosaicFrames: number[] = [];
    while (fldEffPoisonIsActive(effect)) {
      stepFieldPoisonEffect(effect);
      mosaicFrames.push(effect.mosaic);
    }

    expect(mosaicFrames).toEqual([1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 0]);
  });
});
