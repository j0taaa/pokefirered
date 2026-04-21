import { describe, expect, test } from 'vitest';
import {
  advanceDecompRng,
  createDecompRng,
  nextDecompRandom,
  nextDecompRandom32,
  nextDecompRandomFromSeed,
  seedDecompRng
} from '../src/game/decompRandom';
import { createBattleEncounterState, shouldStartWildEncounter } from '../src/game/battle';

describe('decomp random parity', () => {
  test('mirrors src/random.c Random() progression for the default encounter seed', () => {
    const rng = createDecompRng(0x4a3b);

    expect(nextDecompRandom(rng)).toBe(31583);
    expect(rng.value).toBe(2069886354);
    expect(nextDecompRandom(rng)).toBe(50586);
    expect(rng.value).toBe(3315231645);
    expect(nextDecompRandom(rng)).toBe(18424);
    expect(rng.value).toBe(1207437388);
  });

  test('SeedRng behavior truncates incoming seeds to u16 before storing them', () => {
    expect(seedDecompRng(0x12345678)).toBe(0x5678);
    expect(seedDecompRng(-1)).toBe(0xffff);
  });

  test('Random32 composition consumes two decomp Random() calls', () => {
    const rng = createDecompRng(0);

    expect(nextDecompRandom32(rng)).toBe(3917348864);
    expect(rng.value).toBe(3917380458);
  });

  test('battle encounter state uses the shared decomp RNG sequence', () => {
    const encounter = createBattleEncounterState(0x4a3b);

    expect(shouldStartWildEncounter(encounter)).toBe(false);
    expect(encounter.rngState).toBe(2069886354);
  });

  test('seed-based stepping stays in 32-bit space without float drift', () => {
    const first = nextDecompRandomFromSeed(0xffffffff);
    expect(first.nextSeed).toBe(3191476742);
    expect(first.value).toBe(48698);
    expect(advanceDecompRng(0xffffffff)).toBe(first.nextSeed);
  });
});
