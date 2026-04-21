export interface DecompCoinsState {
  vars: Record<string, number>;
}

export const MAX_COINS = 9_999;
export const DEFAULT_COINS = 0;
export const DEFAULT_COINS_ENCRYPTION_KEY = 0;

const clampCoins = (value: number): number =>
  Math.max(0, Math.min(MAX_COINS, Math.trunc(value)));

const getCoinsEncryptionKey = (state: DecompCoinsState): number =>
  (Math.trunc(state.vars.coinsEncryptionKey ?? DEFAULT_COINS_ENCRYPTION_KEY) >>> 0);

const getEncryptedCoins = (state: DecompCoinsState): number => {
  if (Number.isInteger(state.vars.coinsEncrypted)) {
    return Math.trunc(state.vars.coinsEncrypted) >>> 0;
  }

  const legacyCoins = clampCoins(state.vars.coins ?? DEFAULT_COINS);
  return (legacyCoins ^ getCoinsEncryptionKey(state)) >>> 0;
};

const syncLegacyCoinsShadow = (state: DecompCoinsState, value: number): void => {
  state.vars.coins = value;
};

export const getCoins = (state: DecompCoinsState): number =>
  clampCoins(getEncryptedCoins(state) ^ getCoinsEncryptionKey(state));

export const setCoins = (state: DecompCoinsState, coinAmount: number): number => {
  const clampedValue = clampCoins(coinAmount);
  const encryptionKey = getCoinsEncryptionKey(state);
  state.vars.coinsEncrypted = (clampedValue ^ encryptionKey) >>> 0;
  syncLegacyCoinsShadow(state, clampedValue);
  return clampedValue;
};

export const addCoins = (state: DecompCoinsState, toAdd: number): boolean => {
  const coins = getCoins(state);
  const increment = Math.max(0, Math.trunc(toAdd));

  if (coins >= MAX_COINS) {
    return false;
  }

  let nextCoins = coins;
  if (coins <= coins + increment) {
    nextCoins += increment;
    if (nextCoins > MAX_COINS) {
      nextCoins = MAX_COINS;
    }
  } else {
    nextCoins = MAX_COINS;
  }

  setCoins(state, nextCoins);
  return true;
};

export const removeCoins = (state: DecompCoinsState, toSub: number): boolean => {
  const coins = getCoins(state);
  const decrement = Math.max(0, Math.trunc(toSub));

  if (coins < decrement) {
    return false;
  }

  setCoins(state, coins - decrement);
  return true;
};
