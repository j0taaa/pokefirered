export const MAX_BERRY_POWDER = 99_999;

export interface BerryPowderRuntimeState {
  vars: Record<string, number>;
  newGame: {
    berryPowderAmount: number;
  };
}

export interface BerryPowderVendorWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface BerryPowderVendorWindowState {
  windowId: number;
  template: BerryPowderVendorWindowTemplate;
  baseBlock: number;
  palette: number;
  label: 'Powder';
  amount: number;
  amountText: string;
  amountX: number;
  amountY: number;
  visible: boolean;
}

const getEncryptionKey = (runtime: BerryPowderRuntimeState): number =>
  Math.trunc(runtime.vars.encryptionKey ?? 0) >>> 0;

const normalizePowder = (amount: number): number =>
  Math.trunc(amount) >>> 0;

export const decryptBerryPowder = (
  runtime: BerryPowderRuntimeState,
  powder = runtime.newGame.berryPowderAmount
): number => (normalizePowder(powder) ^ getEncryptionKey(runtime)) >>> 0;

export const setBerryPowder = (
  runtime: BerryPowderRuntimeState,
  amount: number
): void => {
  runtime.newGame.berryPowderAmount = (normalizePowder(amount) ^ getEncryptionKey(runtime)) >>> 0;
};

export const applyNewEncryptionKeyToBerryPowder = (
  runtime: BerryPowderRuntimeState,
  encryptionKey: number
): void => {
  runtime.newGame.berryPowderAmount = (
    normalizePowder(runtime.newGame.berryPowderAmount)
    ^ getEncryptionKey(runtime)
    ^ (Math.trunc(encryptionKey) >>> 0)
  ) >>> 0;
};

export const hasEnoughBerryPowder = (
  runtime: BerryPowderRuntimeState,
  cost: number
): boolean => decryptBerryPowder(runtime) >= normalizePowder(cost);

export const scriptHasEnoughBerryPowder = (runtime: BerryPowderRuntimeState): boolean =>
  hasEnoughBerryPowder(runtime, runtime.vars.gSpecialVar_0x8004 ?? runtime.vars.SPECIAL_VAR_0x8004 ?? 0);

export const giveBerryPowder = (
  runtime: BerryPowderRuntimeState,
  amountToAdd: number
): boolean => {
  const amount = (decryptBerryPowder(runtime) + normalizePowder(amountToAdd)) >>> 0;
  if (amount > MAX_BERRY_POWDER) {
    setBerryPowder(runtime, MAX_BERRY_POWDER);
    return false;
  }

  setBerryPowder(runtime, amount);
  return true;
};

export const takeBerryPowder = (
  runtime: BerryPowderRuntimeState,
  cost: number
): boolean => {
  const normalizedCost = normalizePowder(cost);
  if (!hasEnoughBerryPowder(runtime, normalizedCost)) {
    return false;
  }

  setBerryPowder(runtime, decryptBerryPowder(runtime) - normalizedCost);
  return true;
};

export const scriptTakeBerryPowder = (runtime: BerryPowderRuntimeState): boolean =>
  takeBerryPowder(runtime, runtime.vars.gSpecialVar_0x8004 ?? runtime.vars.SPECIAL_VAR_0x8004 ?? 0);

export const getBerryPowder = (runtime: BerryPowderRuntimeState): number =>
  decryptBerryPowder(runtime);

export const formatBerryPowderAmount = (amount: number): string =>
  String(Math.trunc(amount)).padStart(5, ' ');

export const createBerryPowderVendorWindow = (
  runtime: BerryPowderRuntimeState,
  windowId = 0
): BerryPowderVendorWindowState => {
  const amount = getBerryPowder(runtime);
  return {
    windowId,
    template: {
      bg: 0,
      tilemapLeft: 1,
      tilemapTop: 1,
      width: 8,
      height: 3,
      paletteNum: 15,
      baseBlock: 32
    },
    baseBlock: 0x21d,
    palette: 13,
    label: 'Powder',
    amount,
    amountText: formatBerryPowderAmount(amount),
    amountX: 39,
    amountY: 12,
    visible: true
  };
};

export const printPlayerBerryPowderAmount = (
  runtime: BerryPowderRuntimeState,
  window: BerryPowderVendorWindowState
): BerryPowderVendorWindowState => {
  const amount = getBerryPowder(runtime);
  window.amount = amount;
  window.amountText = formatBerryPowderAmount(amount);
  window.amountX = 39;
  window.amountY = 12;
  return window;
};

export const removeBerryPowderVendorMenu = (
  window: BerryPowderVendorWindowState
): void => {
  window.visible = false;
};

export function DecryptBerryPowder(
  runtime: BerryPowderRuntimeState,
  powder = runtime.newGame.berryPowderAmount
): number {
  return decryptBerryPowder(runtime, powder);
}

export function SetBerryPowder(runtime: BerryPowderRuntimeState, amount: number): void {
  setBerryPowder(runtime, amount);
}

export function ApplyNewEncryptionKeyToBerryPowder(
  runtime: BerryPowderRuntimeState,
  encryptionKey: number
): void {
  applyNewEncryptionKeyToBerryPowder(runtime, encryptionKey);
}

export function HasEnoughBerryPowder(
  runtime: BerryPowderRuntimeState,
  cost: number
): boolean {
  return hasEnoughBerryPowder(runtime, cost);
}

export function Script_HasEnoughBerryPowder(runtime: BerryPowderRuntimeState): boolean {
  return scriptHasEnoughBerryPowder(runtime);
}

export function GiveBerryPowder(
  runtime: BerryPowderRuntimeState,
  amountToAdd: number
): boolean {
  return giveBerryPowder(runtime, amountToAdd);
}

export function TakeBerryPowder(runtime: BerryPowderRuntimeState, cost: number): boolean {
  return takeBerryPowder(runtime, cost);
}

export function Script_TakeBerryPowder(runtime: BerryPowderRuntimeState): boolean {
  return scriptTakeBerryPowder(runtime);
}

export function GetBerryPowder(runtime: BerryPowderRuntimeState): number {
  return getBerryPowder(runtime);
}

export function PrintBerryPowderAmount(
  _runtime: BerryPowderRuntimeState,
  _windowId: number,
  amount: number,
  x: number,
  y: number,
  speed: number
): { amountText: string; x: number; y: number; speed: number } {
  return {
    amountText: formatBerryPowderAmount(amount),
    x,
    y,
    speed
  };
}

export function DrawPlayerPowderAmount(
  runtime: BerryPowderRuntimeState,
  windowId: number,
  baseBlock: number,
  palette: number,
  amount: number
): BerryPowderVendorWindowState {
  return {
    windowId,
    template: {
      bg: 0,
      tilemapLeft: 1,
      tilemapTop: 1,
      width: 8,
      height: 3,
      paletteNum: 15,
      baseBlock: 32
    },
    baseBlock,
    palette,
    label: 'Powder',
    amount,
    amountText: PrintBerryPowderAmount(runtime, windowId, amount, 39, 12, 0).amountText,
    amountX: 39,
    amountY: 12,
    visible: true
  };
}

export function PrintPlayerBerryPowderAmount(
  runtime: BerryPowderRuntimeState,
  window: BerryPowderVendorWindowState
): BerryPowderVendorWindowState {
  return printPlayerBerryPowderAmount(runtime, window);
}

export function DisplayBerryPowderVendorMenu(
  runtime: BerryPowderRuntimeState,
  windowId = 0
): BerryPowderVendorWindowState {
  return createBerryPowderVendorWindow(runtime, windowId);
}

export function RemoveBerryPowderVendorMenu(window: BerryPowderVendorWindowState): void {
  removeBerryPowderVendorMenu(window);
}
