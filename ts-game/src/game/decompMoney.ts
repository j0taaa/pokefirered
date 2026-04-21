export interface DecompMoneyState {
  vars: Record<string, number>;
}

export const MAX_MONEY = 999_999;
export const DEFAULT_MONEY = 3_000;
export const DEFAULT_MONEY_ENCRYPTION_KEY = 0;

const clampMoney = (value: number): number =>
  Math.max(0, Math.min(MAX_MONEY, Math.trunc(value)));

const getMoneyEncryptionKey = (state: DecompMoneyState): number =>
  (Math.trunc(state.vars.moneyEncryptionKey ?? DEFAULT_MONEY_ENCRYPTION_KEY) >>> 0);

const getEncryptedMoney = (state: DecompMoneyState): number => {
  if (Number.isInteger(state.vars.moneyEncrypted)) {
    return Math.trunc(state.vars.moneyEncrypted) >>> 0;
  }

  const legacyMoney = clampMoney(state.vars.money ?? DEFAULT_MONEY);
  return (legacyMoney ^ getMoneyEncryptionKey(state)) >>> 0;
};

const syncLegacyMoneyShadow = (state: DecompMoneyState, value: number): void => {
  state.vars.money = value;
};

export const getMoney = (state: DecompMoneyState): number =>
  clampMoney(getEncryptedMoney(state) ^ getMoneyEncryptionKey(state));

export const setMoney = (state: DecompMoneyState, newValue: number): number => {
  const clampedValue = clampMoney(newValue);
  const encryptionKey = getMoneyEncryptionKey(state);
  state.vars.moneyEncrypted = (clampedValue ^ encryptionKey) >>> 0;
  syncLegacyMoneyShadow(state, clampedValue);
  return clampedValue;
};

export const isEnoughMoney = (state: DecompMoneyState, cost: number): boolean =>
  getMoney(state) >= Math.max(0, Math.trunc(cost));

export const addMoney = (state: DecompMoneyState, toAdd: number): number => {
  const currentMoney = getMoney(state);
  const increment = Math.max(0, Math.trunc(toAdd));
  let nextMoney = currentMoney;

  if (currentMoney + increment > MAX_MONEY) {
    nextMoney = MAX_MONEY;
  } else {
    nextMoney += increment;
    if (nextMoney < currentMoney) {
      nextMoney = MAX_MONEY;
    }
  }

  return setMoney(state, nextMoney);
};

export const removeMoney = (state: DecompMoneyState, toSub: number): number => {
  const currentMoney = getMoney(state);
  const decrement = Math.max(0, Math.trunc(toSub));
  return setMoney(state, currentMoney < decrement ? 0 : currentMoney - decrement);
};
