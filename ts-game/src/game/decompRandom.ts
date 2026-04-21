export const RAND_MULT = 1103515245;
export const ISO_RANDOMIZE1_ADD = 24691;

export interface DecompRngState {
  value: number;
}

const toUint32 = (value: number): number => value >>> 0;

export const seedDecompRng = (seed: number): number => (seed & 0xffff) >>> 0;

export const advanceDecompRng = (value: number): number =>
  (Math.imul(RAND_MULT, toUint32(value)) + ISO_RANDOMIZE1_ADD) >>> 0;

export const extractDecompRandomValue = (value: number): number => toUint32(value) >>> 16;

export const createDecompRng = (seed = 0): DecompRngState => ({
  value: seedDecompRng(seed)
});

export const nextDecompRandom = (state: DecompRngState): number => {
  state.value = advanceDecompRng(state.value);
  return extractDecompRandomValue(state.value);
};

export const nextDecompRandomFromSeed = (seed: number): { nextSeed: number; value: number } => {
  const nextSeed = advanceDecompRng(seed);
  return {
    nextSeed,
    value: extractDecompRandomValue(nextSeed)
  };
};

export const nextDecompRandom32 = (state: DecompRngState): number =>
  (nextDecompRandom(state) | (nextDecompRandom(state) << 16)) >>> 0;
