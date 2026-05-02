export interface DecompCoinsState {
  vars: Record<string, number>;
  operations?: string[];
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

export function GetCoins(state: DecompCoinsState): number { return getCoins(state); }

export const setCoins = (state: DecompCoinsState, coinAmount: number): number => {
  const clampedValue = clampCoins(coinAmount);
  const encryptionKey = getCoinsEncryptionKey(state);
  state.vars.coinsEncrypted = (clampedValue ^ encryptionKey) >>> 0;
  syncLegacyCoinsShadow(state, clampedValue);
  return clampedValue;
};

export function SetCoins(state: DecompCoinsState, coinAmount: number): number { return setCoins(state, coinAmount); }

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

export function AddCoins(state: DecompCoinsState, toAdd: number): boolean { return addCoins(state, toAdd); }

export const removeCoins = (state: DecompCoinsState, toSub: number): boolean => {
  const coins = getCoins(state);
  const decrement = Math.max(0, Math.trunc(toSub));

  if (coins < decrement) {
    return false;
  }

  setCoins(state, coins - decrement);
  return true;
};

export function RemoveCoins(state: DecompCoinsState, toSub: number): boolean { return removeCoins(state, toSub); }

const op = (state: DecompCoinsState, value: string): void => {
  state.operations?.push(value);
};

const formatCoins = (coinAmount: number): string =>
  String(Math.trunc(coinAmount)).padStart(4, ' ').slice(-4);

export function PrintCoinsString_Parameterized(
  state: DecompCoinsState,
  windowId: number,
  coinAmount: number,
  x: number,
  y: number,
  speed: number
): void {
  const formatted = formatCoins(coinAmount);
  state.vars.gStringVar1Coins = Math.trunc(coinAmount);
  op(state, `ConvertIntToDecimalStringN:gStringVar1:${Math.trunc(coinAmount)}:RIGHT_ALIGN:4:${formatted}`);
  op(state, 'StringExpandPlaceholders:gStringVar4:gText_Coins');
  op(state, `AddTextPrinterParameterized:${windowId}:FONT_SMALL:gStringVar4:${x}:${y}:${speed}:NULL`);
}

export function ShowCoinsWindow_Parameterized(
  state: DecompCoinsState,
  windowId: number,
  tileStart: number,
  palette: number,
  coinAmount: number
): void {
  op(state, `DrawStdFrameWithCustomTileAndPalette:${windowId}:FALSE:${tileStart}:${palette}`);
  op(state, `AddTextPrinterParameterized:${windowId}:FONT_NORMAL:gText_Coins_2:0:0:0xFF:0`);
  PrintCoinsString_Parameterized(state, windowId, coinAmount, 0x10, 0x0c, 0);
}

export function PrintCoinsString(state: DecompCoinsState, coinAmount: number): void {
  const formatted = formatCoins(coinAmount);
  const width = formatted.length * 6;
  const windowId = state.vars.coinsWindowId ?? 0;
  state.vars.gStringVar1Coins = Math.trunc(coinAmount);
  op(state, `ConvertIntToDecimalStringN:gStringVar1:${Math.trunc(coinAmount)}:RIGHT_ALIGN:4:${formatted}`);
  op(state, 'StringExpandPlaceholders:gStringVar4:gText_Coins');
  op(state, `GetStringWidth:FONT_SMALL:gStringVar4:0:${width}`);
  op(state, `AddTextPrinterParameterized:${windowId}:FONT_SMALL:gStringVar4:${64 - width}:12:0:NULL`);
}

export function ShowCoinsWindow(
  state: DecompCoinsState,
  coinAmount: number,
  x: number,
  y: number
): void {
  const windowId = state.vars.nextWindowId ?? 0;
  state.vars.nextWindowId = windowId + 1;
  state.vars.coinsWindowId = windowId;
  op(state, `SetWindowTemplateFields:0:${x + 1}:${y + 1}:8:3:15:32`);
  op(state, `AddWindow:${windowId}`);
  op(state, `FillWindowPixelBuffer:${windowId}:0`);
  op(state, `PutWindowTilemap:${windowId}`);
  op(state, `LoadStdWindowGfx:${windowId}:0x21D:BG_PLTT_ID(13)`);
  op(state, `DrawStdFrameWithCustomTileAndPalette:${windowId}:FALSE:0x21D:13`);
  op(state, `AddTextPrinterParameterized:${windowId}:FONT_NORMAL:gText_Coins_2:0:0:0xFF:0`);
  PrintCoinsString(state, coinAmount);
}

export function HideCoinsWindow(state: DecompCoinsState): void {
  const windowId = state.vars.coinsWindowId ?? 0;
  op(state, `ClearWindowTilemap:${windowId}`);
  op(state, `ClearStdWindowAndFrameToTransparent:${windowId}:TRUE`);
  op(state, `RemoveWindow:${windowId}`);
}
