export interface DecompMoneyState {
  vars: Record<string, number>;
  stringVar1?: string;
  stringVar4?: string;
  moneyBoxWindowId?: number;
  nextWindowId?: number;
  windows?: Record<number, MoneyWindow>;
  textPrinterLog?: MoneyTextPrinterCall[];
  frameLog?: MoneyFrameCall[];
  windowOpsLog?: MoneyWindowOp[];
}

export const MAX_MONEY = 999_999;
export const DEFAULT_MONEY = 3_000;
export const DEFAULT_MONEY_ENCRYPTION_KEY = 0;
export const FONT_SMALL = 0;
export const FONT_NORMAL = 1;
export const STR_CONV_MODE_LEFT_ALIGN = 0;
export const COPYWIN_GFX = 2;
export const TRAINER_CARD_MONEY_TEXT = 'MONEY';

export interface MoneyWindow {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
  pixelFill?: number;
  tilemapPut?: boolean;
  gfx?: { tileStart: number; palette: number };
  removed?: boolean;
}

export interface MoneyTextPrinterCall {
  windowId: number;
  fontId: number;
  text: string;
  x: number;
  y: number;
  speed: number;
}

export interface MoneyFrameCall {
  windowId: number;
  copyToVram: boolean;
  tileStart: number;
  paletteNum: number;
  clear?: boolean;
}

export interface MoneyWindowOp {
  op: string;
  windowId: number;
  value?: number;
}

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

const ensureWindows = (state: DecompMoneyState): Record<number, MoneyWindow> => {
  state.windows ??= {};
  return state.windows;
};

const ensureTextPrinterLog = (state: DecompMoneyState): MoneyTextPrinterCall[] => {
  state.textPrinterLog ??= [];
  return state.textPrinterLog;
};

const ensureFrameLog = (state: DecompMoneyState): MoneyFrameCall[] => {
  state.frameLog ??= [];
  return state.frameLog;
};

const ensureWindowOpsLog = (state: DecompMoneyState): MoneyWindowOp[] => {
  state.windowOpsLog ??= [];
  return state.windowOpsLog;
};

const convertIntToDecimalStringN = (amount: number, _mode: number, n: number): string =>
  Math.trunc(amount).toString().slice(0, n);

const stringLength = (text: string): number => text.length;

const stringExpandPlaceholders = (prefix: string, value: string, stringVar1: string): string =>
  `${prefix}${value.replace('{STR_VAR_1}', stringVar1)}`;

const getStringWidth = (_fontId: number, text: string, _letterSpacing: number): number =>
  text.length * 6;

const addTextPrinterParameterized = (
  state: DecompMoneyState,
  windowId: number,
  fontId: number,
  text: string,
  x: number,
  y: number,
  speed: number
): void => {
  ensureTextPrinterLog(state).push({ windowId, fontId, text, x, y, speed });
};

const drawStdFrameWithCustomTileAndPalette = (
  state: DecompMoneyState,
  windowId: number,
  copyToVram: boolean,
  tileStart: number,
  paletteNum: number
): void => {
  ensureFrameLog(state).push({ windowId, copyToVram, tileStart, paletteNum });
};

const clearStdWindowAndFrameToTransparent = (
  state: DecompMoneyState,
  windowId: number,
  copyToVram: boolean
): void => {
  ensureFrameLog(state).push({ windowId, copyToVram, tileStart: 0, paletteNum: 0, clear: true });
};

const addWindow = (state: DecompMoneyState, template: MoneyWindow): number => {
  const windowId = state.nextWindowId ?? 0;
  state.nextWindowId = windowId + 1;
  ensureWindows(state)[windowId] = { ...template };
  return windowId;
};

const fillWindowPixelBuffer = (state: DecompMoneyState, windowId: number, value: number): void => {
  ensureWindows(state)[windowId].pixelFill = value;
  ensureWindowOpsLog(state).push({ op: 'FillWindowPixelBuffer', windowId, value });
};

const putWindowTilemap = (state: DecompMoneyState, windowId: number): void => {
  ensureWindows(state)[windowId].tilemapPut = true;
  ensureWindowOpsLog(state).push({ op: 'PutWindowTilemap', windowId });
};

const loadStdWindowGfx = (
  state: DecompMoneyState,
  windowId: number,
  tileStart: number,
  palette: number
): void => {
  ensureWindows(state)[windowId].gfx = { tileStart, palette };
  ensureWindowOpsLog(state).push({ op: 'LoadStdWindowGfx', windowId, value: tileStart });
};

const copyWindowToVram = (state: DecompMoneyState, windowId: number, mode: number): void => {
  ensureWindowOpsLog(state).push({ op: 'CopyWindowToVram', windowId, value: mode });
};

const removeWindow = (state: DecompMoneyState, windowId: number): void => {
  ensureWindows(state)[windowId].removed = true;
  ensureWindowOpsLog(state).push({ op: 'RemoveWindow', windowId });
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

export const isEnoughForCostInVar0x8005 = (state: DecompMoneyState): boolean =>
  isEnoughMoney(state, state.vars.specialVar0x8005 ?? 0);

export const subtractMoneyFromVar0x8005 = (state: DecompMoneyState): void => {
  removeMoney(state, state.vars.specialVar0x8005 ?? 0);
};

export const printMoneyAmountInMoneyBox = (
  state: DecompMoneyState,
  windowId: number,
  amount: number,
  speed: number
): void => {
  state.stringVar1 = convertIntToDecimalStringN(amount, STR_CONV_MODE_LEFT_ALIGN, 6);
  let strLength = 6 - stringLength(state.stringVar1);
  let prefix = '';

  while (strLength-- !== 0) {
    prefix += '\0';
  }

  state.stringVar4 = stringExpandPlaceholders(prefix, '¥{STR_VAR_1}', state.stringVar1);
  addTextPrinterParameterized(
    state,
    windowId,
    FONT_SMALL,
    state.stringVar4,
    64 - getStringWidth(FONT_SMALL, state.stringVar4, 0),
    0x0c,
    speed
  );
};

export const printMoneyAmount = (
  state: DecompMoneyState,
  windowId: number,
  x: number,
  y: number,
  amount: number,
  speed: number
): void => {
  state.stringVar1 = convertIntToDecimalStringN(amount, STR_CONV_MODE_LEFT_ALIGN, 6);
  let strLength = 6 - stringLength(state.stringVar1);
  let prefix = '';

  while (strLength-- !== 0) {
    prefix += '\0';
  }

  state.stringVar4 = stringExpandPlaceholders(prefix, '¥{STR_VAR_1}', state.stringVar1);
  addTextPrinterParameterized(state, windowId, FONT_SMALL, state.stringVar4, x, y, speed);
};

export const printMoneyAmountInMoneyBoxWithBorder = (
  state: DecompMoneyState,
  windowId: number,
  tileStart: number,
  paletteNum: number,
  amount: number
): void => {
  drawStdFrameWithCustomTileAndPalette(state, windowId, false, tileStart, paletteNum);
  addTextPrinterParameterized(state, windowId, FONT_NORMAL, TRAINER_CARD_MONEY_TEXT, 0, 0, 0xff);
  printMoneyAmountInMoneyBox(state, windowId, amount, 0);
};

export const changeAmountInMoneyBox = (state: DecompMoneyState, amount: number): void => {
  printMoneyAmountInMoneyBox(state, state.moneyBoxWindowId ?? 0, amount, 0);
};

export const drawMoneyBox = (
  state: DecompMoneyState,
  amount: number,
  x: number,
  y: number
): void => {
  const template: MoneyWindow = {
    bg: 0,
    tilemapLeft: x + 1,
    tilemapTop: y + 1,
    width: 8,
    height: 3,
    paletteNum: 15,
    baseBlock: 8
  };
  state.moneyBoxWindowId = addWindow(state, template);
  fillWindowPixelBuffer(state, state.moneyBoxWindowId, 0);
  putWindowTilemap(state, state.moneyBoxWindowId);
  loadStdWindowGfx(state, state.moneyBoxWindowId, 0x21d, 13 << 4);
  printMoneyAmountInMoneyBoxWithBorder(state, state.moneyBoxWindowId, 0x21d, 13, amount);
};

export const hideMoneyBox = (state: DecompMoneyState): void => {
  const windowId = state.moneyBoxWindowId ?? 0;
  clearStdWindowAndFrameToTransparent(state, windowId, false);
  copyWindowToVram(state, windowId, COPYWIN_GFX);
  removeWindow(state, windowId);
};

export function GetMoney(state: DecompMoneyState): number {
  return getMoney(state);
}

export function SetMoney(state: DecompMoneyState, newValue: number): number {
  return setMoney(state, newValue);
}

export function IsEnoughMoney(state: DecompMoneyState, cost: number): boolean {
  return isEnoughMoney(state, cost);
}

export function AddMoney(state: DecompMoneyState, toAdd: number): number {
  return addMoney(state, toAdd);
}

export function RemoveMoney(state: DecompMoneyState, toSub: number): number {
  return removeMoney(state, toSub);
}

export function IsEnoughForCostInVar0x8005(state: DecompMoneyState): boolean {
  return isEnoughForCostInVar0x8005(state);
}

export function SubtractMoneyFromVar0x8005(state: DecompMoneyState): void {
  subtractMoneyFromVar0x8005(state);
}

export function PrintMoneyAmountInMoneyBox(
  state: DecompMoneyState,
  windowId: number,
  amount: number,
  speed: number
): void {
  printMoneyAmountInMoneyBox(state, windowId, amount, speed);
}

export function PrintMoneyAmount(
  state: DecompMoneyState,
  windowId: number,
  x: number,
  y: number,
  amount: number,
  speed: number
): void {
  printMoneyAmount(state, windowId, x, y, amount, speed);
}

export function PrintMoneyAmountInMoneyBoxWithBorder(
  state: DecompMoneyState,
  windowId: number,
  tileStart: number,
  paletteNum: number,
  amount: number
): void {
  printMoneyAmountInMoneyBoxWithBorder(state, windowId, tileStart, paletteNum, amount);
}

export function ChangeAmountInMoneyBox(state: DecompMoneyState, amount: number): void {
  changeAmountInMoneyBox(state, amount);
}

export function DrawMoneyBox(
  state: DecompMoneyState,
  amount: number,
  x: number,
  y: number
): void {
  drawMoneyBox(state, amount, x, y);
}

export function HideMoneyBox(state: DecompMoneyState): void {
  hideMoneyBox(state);
}
