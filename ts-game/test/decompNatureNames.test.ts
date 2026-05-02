import { describe, expect, test } from 'vitest';
import {
  NUM_NATURES,
  NATURE_ADAMANT,
  NATURE_BASHFUL,
  NATURE_CALM,
  NATURE_CAREFUL,
  NATURE_QUIRKY,
  getNatureName,
  gNatureNamePointers
} from '../src/game/decompNatureNames';

describe('decomp nature names', () => {
  test('preserves gNatureNamePointers order and all static string contents', () => {
    expect(gNatureNamePointers).toEqual([
      'HARDY',
      'LONELY',
      'BRAVE',
      'ADAMANT',
      'NAUGHTY',
      'BOLD',
      'DOCILE',
      'RELAXED',
      'IMPISH',
      'LAX',
      'TIMID',
      'HASTY',
      'SERIOUS',
      'JOLLY',
      'NAIVE',
      'MODEST',
      'MILD',
      'QUIET',
      'BASHFUL',
      'RASH',
      'CALM',
      'GENTLE',
      'SASSY',
      'CAREFUL',
      'QUIRKY'
    ]);
    expect(gNatureNamePointers).toHaveLength(NUM_NATURES);
  });

  test('uses the decomp nature index constants for pointer lookup', () => {
    expect(getNatureName(NATURE_ADAMANT)).toBe('ADAMANT');
    expect(getNatureName(NATURE_BASHFUL)).toBe('BASHFUL');
    expect(getNatureName(NATURE_CALM)).toBe('CALM');
    expect(getNatureName(NATURE_CAREFUL)).toBe('CAREFUL');
    expect(getNatureName(NATURE_QUIRKY)).toBe('QUIRKY');
  });
});
