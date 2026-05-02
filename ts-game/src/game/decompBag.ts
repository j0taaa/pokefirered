export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export const sTextColors = [
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 2],
  [0, 8, 9]
] as const;

export const sDefaultBagWindowsStd: WindowTemplate[] = [
  { bg: 0, tilemapLeft: 11, tilemapTop: 1, width: 18, height: 12, paletteNum: 15, baseBlock: 0x008a },
  { bg: 0, tilemapLeft: 5, tilemapTop: 14, width: 25, height: 6, paletteNum: 15, baseBlock: 0x0162 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 9, height: 2, paletteNum: 15, baseBlock: 0x01f8 }
];

export const sDefaultBagWindowsDeposit: WindowTemplate[] = [
  { bg: 0, tilemapLeft: 11, tilemapTop: 1, width: 18, height: 12, paletteNum: 15, baseBlock: 0x008a },
  { bg: 0, tilemapLeft: 5, tilemapTop: 14, width: 25, height: 6, paletteNum: 15, baseBlock: 0x0162 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 8, height: 2, paletteNum: 12, baseBlock: 0x01f8 }
];

export const sWindowTemplates: WindowTemplate[] = [
  { bg: 0, tilemapLeft: 24, tilemapTop: 15, width: 5, height: 4, paletteNum: 15, baseBlock: 0x242 },
  { bg: 0, tilemapLeft: 17, tilemapTop: 9, width: 12, height: 4, paletteNum: 15, baseBlock: 0x242 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 8, height: 3, paletteNum: 12, baseBlock: 0x272 },
  { bg: 0, tilemapLeft: 23, tilemapTop: 15, width: 6, height: 4, paletteNum: 15, baseBlock: 0x28a },
  { bg: 0, tilemapLeft: 21, tilemapTop: 9, width: 6, height: 4, paletteNum: 15, baseBlock: 0x28a },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 15, baseBlock: 0x2a2 },
  { bg: 0, tilemapLeft: 6, tilemapTop: 15, width: 14, height: 4, paletteNum: 12, baseBlock: 0x2a2 },
  { bg: 0, tilemapLeft: 6, tilemapTop: 15, width: 15, height: 4, paletteNum: 12, baseBlock: 0x2da },
  { bg: 0, tilemapLeft: 6, tilemapTop: 15, width: 16, height: 4, paletteNum: 12, baseBlock: 0x316 },
  { bg: 0, tilemapLeft: 6, tilemapTop: 15, width: 23, height: 4, paletteNum: 12, baseBlock: 0x356 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 17, width: 7, height: 2, paletteNum: 15, baseBlock: 0x20a },
  { bg: 0, tilemapLeft: 22, tilemapTop: 15, width: 7, height: 4, paletteNum: 15, baseBlock: 0x20a },
  { bg: 0, tilemapLeft: 22, tilemapTop: 13, width: 7, height: 6, paletteNum: 15, baseBlock: 0x20a },
  { bg: 0, tilemapLeft: 22, tilemapTop: 11, width: 7, height: 8, paletteNum: 15, baseBlock: 0x20a }
];

export interface BagRuntime {
  bagMenuLocation: number;
  openWindows: number[];
  nextWindowId: number;
  initializedTemplates: WindowTemplate[] | null;
  textPrintersDeactivated: number;
  loadedWindowGfx: { kind: string; bg: number; tileStart: number; palette: number }[];
  loadedPalettes: { palette: number; size: number }[];
  fills: { windowId: number; fill: number }[];
  tilemapPuts: number[];
  bgCopies: number[];
  textPrinters: {
    windowId: number;
    fontId: number;
    x: number;
    y: number;
    letterSpacing?: number;
    lineSpacing?: number;
    speed: number;
    colors: readonly number[];
    text: string;
  }[];
  frames: { windowId: number; tile: number; palette: number; dialog?: boolean }[];
  clearedStdWindows: number[];
  clearedDialogWindows: number[];
  clearedTilemaps: number[];
  removedWindows: number[];
  yesNoMenus: { taskId: number; template: WindowTemplate; font: number; x: number; y: number; tile: number; palette: number; callbacks: string }[];
  money: number;
  moneyPrints: { windowId: number; tile: number; palette: number; amount: number }[];
}

export const createBagRuntime = (): BagRuntime => ({
  bagMenuLocation: 0,
  openWindows: Array.from({ length: 11 }, () => 0xff),
  nextWindowId: 3,
  initializedTemplates: null,
  textPrintersDeactivated: 0,
  loadedWindowGfx: [],
  loadedPalettes: [],
  fills: [],
  tilemapPuts: [],
  bgCopies: [],
  textPrinters: [],
  frames: [],
  clearedStdWindows: [],
  clearedDialogWindows: [],
  clearedTilemaps: [],
  removedWindows: [],
  yesNoMenus: [],
  money: 0,
  moneyPrints: []
});

const addWindow = (runtime: BagRuntime, _template: WindowTemplate): number => runtime.nextWindowId++;

export const initBagWindows = (runtime: BagRuntime): void => {
  runtime.initializedTemplates = runtime.bagMenuLocation !== 3
    ? sDefaultBagWindowsStd.map((template) => ({ ...template }))
    : sDefaultBagWindowsDeposit.map((template) => ({ ...template }));
  runtime.textPrintersDeactivated += 1;
  runtime.loadedWindowGfx.push({ kind: 'user', bg: 0, tileStart: 0x64, palette: 14 });
  runtime.loadedWindowGfx.push({ kind: 'menuMessage', bg: 0, tileStart: 0x6d, palette: 13 });
  runtime.loadedWindowGfx.push({ kind: 'std', bg: 0, tileStart: 0x81, palette: 12 });
  runtime.loadedPalettes.push({ palette: 15, size: 32 });
  for (let i = 0; i < 3; i += 1) {
    runtime.fills.push({ windowId: i, fill: 0 });
    runtime.tilemapPuts.push(i);
  }
  runtime.bgCopies.push(0);
  runtime.openWindows.fill(0xff);
};

export const bagPrintTextOnWindow = (
  runtime: BagRuntime,
  windowId: number,
  fontId: number,
  str: string,
  x: number,
  y: number,
  letterSpacing: number,
  lineSpacing: number,
  speed: number,
  colorIdx: number
): void => {
  runtime.textPrinters.push({
    windowId,
    fontId,
    x,
    y,
    letterSpacing,
    lineSpacing,
    speed,
    colors: sTextColors[colorIdx],
    text: str
  });
};

const getStringWidth = (text: string): number => text.length * 8;

export const bagPrintTextOnWin1CenteredColor0 = (
  runtime: BagRuntime,
  str: string,
  _unused: number
): void => {
  const x = 0x48 - getStringWidth(str);
  runtime.textPrinters.push({ windowId: 2, fontId: 1, x: Math.trunc(x / 2), y: 1, colors: sTextColors[0], speed: 0, text: str });
};

export const bagDrawDepositItemTextBox = (runtime: BagRuntime): void => {
  runtime.frames.push({ windowId: 2, tile: 0x081, palette: 12 });
  const x = 0x40 - getStringWidth('Deposit Item');
  runtime.textPrinters.push({ windowId: 2, fontId: 0, x: Math.trunc(x / 2), y: 1, colors: sTextColors[0], speed: 0, text: 'Deposit Item' });
};

export const showBagWindow = (
  runtime: BagRuntime,
  whichWindow: number,
  nItems: number
): number => {
  if (runtime.openWindows[whichWindow] === 0xff) {
    runtime.openWindows[whichWindow] = addWindow(runtime, sWindowTemplates[whichWindow + nItems]);
    if (whichWindow !== 6) {
      runtime.frames.push({ windowId: runtime.openWindows[whichWindow], tile: 0x064, palette: 14 });
    } else {
      runtime.frames.push({ windowId: runtime.openWindows[whichWindow], tile: 0x081, palette: 12 });
    }
    runtime.bgCopies.push(0);
  }
  return runtime.openWindows[whichWindow];
};

export const hideBagWindow = (runtime: BagRuntime, whichWindow: number): void => {
  const windowId = runtime.openWindows[whichWindow];
  runtime.clearedStdWindows.push(windowId);
  runtime.clearedTilemaps.push(windowId);
  runtime.removedWindows.push(windowId);
  runtime.bgCopies.push(0);
  runtime.openWindows[whichWindow] = 0xff;
};

export const openBagWindow = (runtime: BagRuntime, whichWindow: number): number => {
  if (runtime.openWindows[whichWindow] === 0xff) {
    runtime.openWindows[whichWindow] = addWindow(runtime, sWindowTemplates[whichWindow]);
  }
  return runtime.openWindows[whichWindow];
};

export const closeBagWindow = (runtime: BagRuntime, whichWindow: number): void => {
  if (runtime.openWindows[whichWindow] !== 0xff) {
    const windowId = runtime.openWindows[whichWindow];
    runtime.clearedDialogWindows.push(windowId);
    runtime.clearedTilemaps.push(windowId);
    runtime.removedWindows.push(windowId);
    runtime.tilemapPuts.push(1);
    runtime.bgCopies.push(0);
    runtime.openWindows[whichWindow] = 0xff;
  }
};

export const getBagWindow = (runtime: BagRuntime, whichWindow: number): number =>
  runtime.openWindows[whichWindow];

export const bagCreateYesNoMenuBottomRight = (
  runtime: BagRuntime,
  taskId: number,
  callbacks: string
): void => {
  runtime.yesNoMenus.push({ taskId, template: sWindowTemplates[3], font: 0, x: 0, y: 2, tile: 0x064, palette: 14, callbacks });
};

export const bagCreateYesNoMenuTopRight = (
  runtime: BagRuntime,
  taskId: number,
  callbacks: string
): void => {
  runtime.yesNoMenus.push({ taskId, template: sWindowTemplates[4], font: 0, x: 0, y: 2, tile: 0x064, palette: 14, callbacks });
};

export const bagPrintMoneyAmount = (runtime: BagRuntime): void => {
  const windowId = showBagWindow(runtime, 2, 0);
  runtime.moneyPrints.push({ windowId, tile: 0x081, palette: 0x0c, amount: runtime.money });
};

export const bagDrawTextBoxOnWindow = (runtime: BagRuntime, windowId: number): void => {
  runtime.frames.push({ windowId, tile: 0x064, palette: 14 });
};

export function InitBagWindows(runtime: BagRuntime): void {
  initBagWindows(runtime);
}

export function BagPrintTextOnWindow(
  runtime: BagRuntime,
  windowId: number,
  fontId: number,
  str: string,
  x: number,
  y: number,
  letterSpacing: number,
  lineSpacing: number,
  speed: number,
  colorIdx: number
): void {
  bagPrintTextOnWindow(runtime, windowId, fontId, str, x, y, letterSpacing, lineSpacing, speed, colorIdx);
}

export function BagPrintTextOnWin1CenteredColor0(
  runtime: BagRuntime,
  str: string,
  unused: number
): void {
  bagPrintTextOnWin1CenteredColor0(runtime, str, unused);
}

export function BagDrawDepositItemTextBox(runtime: BagRuntime): void {
  bagDrawDepositItemTextBox(runtime);
}

export function ShowBagWindow(runtime: BagRuntime, whichWindow: number, nItems: number): number {
  return showBagWindow(runtime, whichWindow, nItems);
}

export function HideBagWindow(runtime: BagRuntime, whichWindow: number): void {
  hideBagWindow(runtime, whichWindow);
}

export function OpenBagWindow(runtime: BagRuntime, whichWindow: number): number {
  return openBagWindow(runtime, whichWindow);
}

export function CloseBagWindow(runtime: BagRuntime, whichWindow: number): void {
  closeBagWindow(runtime, whichWindow);
}

export function GetBagWindow(runtime: BagRuntime, whichWindow: number): number {
  return getBagWindow(runtime, whichWindow);
}

export function BagCreateYesNoMenuBottomRight(
  runtime: BagRuntime,
  taskId: number,
  callbacks: string
): void {
  bagCreateYesNoMenuBottomRight(runtime, taskId, callbacks);
}

export function BagCreateYesNoMenuTopRight(
  runtime: BagRuntime,
  taskId: number,
  callbacks: string
): void {
  bagCreateYesNoMenuTopRight(runtime, taskId, callbacks);
}

export function BagPrintMoneyAmount(runtime: BagRuntime): void {
  bagPrintMoneyAmount(runtime);
}

export function BagDrawTextBoxOnWindow(runtime: BagRuntime, windowId: number): void {
  bagDrawTextBoxOnWindow(runtime, windowId);
}
