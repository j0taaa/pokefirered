export interface DecompWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface BuyMenuInitWindowsResult {
  isSellingTM: boolean;
  windows: DecompWindowTemplate[];
  tilemapWindows: number[];
  loadedWindowGfx: Array<{
    kind: 'user' | 'menuMessage' | 'std';
    windowId: number;
    tileStart: number;
    paletteId: number;
  }>;
}

export interface BuyMenuTextPrint {
  windowId: number;
  font: number;
  text: string;
  x: number;
  y: number;
  letterSpacing: number;
  lineSpacing: number;
  speed: number;
  colors: readonly [number, number, number];
}

export interface BuyMenuMessage {
  taskId: number;
  text: string;
  windowId: number;
  tileStart: number;
  paletteId: number;
  font: number;
  textSpeed: number;
  callback?: string | null;
  scheduledBg: number;
}

export interface BuyMenuFrameDescriptor {
  windowId: number;
  copyToVram: boolean;
  tileStart: number;
  palette: number;
}

export interface BuyMenuConfirmPurchaseDescriptor {
  taskId: number;
  window: DecompWindowTemplate;
  font: number;
  x: number;
  y: number;
  baseTile: number;
  palette: number;
  yesNo?: string | null;
}

export interface BuyMenuMoneyBoxDescriptor {
  windowId: number;
  tileStart: number;
  palette: number;
  money: number;
}

const bgPlttId = (index: number): number => index * 16;

export const SHOP_BUY_MENU_WINDOW_TEMPLATES_NORMAL: readonly DecompWindowTemplate[] = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 8, height: 3, paletteNum: 15, baseBlock: 0x27 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 11, width: 13, height: 2, paletteNum: 15, baseBlock: 0x3f },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 14, baseBlock: 0x59 },
  { bg: 0, tilemapLeft: 17, tilemapTop: 9, width: 12, height: 4, paletteNum: 14, baseBlock: 0xc1 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 1, width: 17, height: 12, paletteNum: 14, baseBlock: 0xf1 },
  { bg: 0, tilemapLeft: 5, tilemapTop: 14, width: 25, height: 6, paletteNum: 15, baseBlock: 0x1bd }
];

export const SHOP_BUY_MENU_WINDOW_TEMPLATES_TM: readonly DecompWindowTemplate[] = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 8, height: 3, paletteNum: 15, baseBlock: 0x27 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 11, width: 13, height: 2, paletteNum: 15, baseBlock: 0x3f },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 14, baseBlock: 0x59 },
  { bg: 0, tilemapLeft: 17, tilemapTop: 9, width: 12, height: 4, paletteNum: 14, baseBlock: 0xc1 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 1, width: 17, height: 10, paletteNum: 14, baseBlock: 0xf1 },
  { bg: 0, tilemapLeft: 12, tilemapTop: 12, width: 18, height: 8, paletteNum: 14, baseBlock: 0x19b },
  { bg: 0, tilemapLeft: 1, tilemapTop: 14, width: 10, height: 4, paletteNum: 14, baseBlock: 0x22b }
];

export const SHOP_BUY_MENU_YES_NO_WINDOW_TEMPLATE: DecompWindowTemplate = {
  bg: 0,
  tilemapLeft: 21,
  tilemapTop: 9,
  width: 6,
  height: 4,
  paletteNum: 14,
  baseBlock: 0xc1
};

export const SHOP_BUY_MENU_TEXT_COLORS: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 2]
];

export const buyMenuInitWindows = (isSellingTM: boolean): BuyMenuInitWindowsResult => ({
  isSellingTM,
  windows: (isSellingTM ? SHOP_BUY_MENU_WINDOW_TEMPLATES_TM : SHOP_BUY_MENU_WINDOW_TEMPLATES_NORMAL)
    .map((template) => ({ ...template })),
  loadedWindowGfx: [
    { kind: 'user', windowId: 0, tileStart: 0x1, paletteId: bgPlttId(13) },
    { kind: 'menuMessage', windowId: 0, tileStart: 0x13, paletteId: bgPlttId(14) },
    { kind: 'std', windowId: 0, tileStart: 0xa, paletteId: bgPlttId(15) }
  ],
  tilemapWindows: isSellingTM ? [0, 4, 5, 6] : [0, 4, 5]
});

export const buyMenuDrawMoneyBox = (money: number): BuyMenuMoneyBoxDescriptor => ({
  windowId: 0,
  tileStart: 0xa,
  palette: 0xf,
  money: Math.trunc(money) >>> 0
});

export const buyMenuPrint = (
  windowId: number,
  font: number,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
  lineSpacing: number,
  speed: number,
  color: number
): BuyMenuTextPrint => ({
  windowId,
  font,
  text,
  x,
  y,
  letterSpacing,
  lineSpacing,
  speed,
  colors: SHOP_BUY_MENU_TEXT_COLORS[color] ?? SHOP_BUY_MENU_TEXT_COLORS[0]!
});

export const buyMenuDisplayMessage = (
  taskId: number,
  text: string,
  font: number,
  textSpeed: number,
  callback: string | null = null
): BuyMenuMessage => ({
  taskId,
  text,
  windowId: 2,
  tileStart: 0x13,
  paletteId: 0xe,
  font,
  textSpeed,
  callback,
  scheduledBg: 0
});

export const buyMenuQuantityBoxNormalBorder = (
  windowId: number,
  copyToVram: boolean
): BuyMenuFrameDescriptor => ({
  windowId,
  copyToVram,
  tileStart: 0x1,
  palette: 13
});

export const buyMenuQuantityBoxThinBorder = (
  windowId: number,
  copyToVram: boolean
): BuyMenuFrameDescriptor => ({
  windowId,
  copyToVram,
  tileStart: 0xa,
  palette: 15
});

export const buyMenuConfirmPurchase = (taskId: number, yesNo: string | null = null): BuyMenuConfirmPurchaseDescriptor => ({
  taskId,
  window: { ...SHOP_BUY_MENU_YES_NO_WINDOW_TEMPLATE },
  font: 1,
  x: 0,
  y: 2,
  baseTile: 1,
  palette: 13,
  yesNo
});

export function BuyMenuInitWindows(isSellingTM: boolean | number): BuyMenuInitWindowsResult {
  return buyMenuInitWindows(isSellingTM === true || isSellingTM === 1);
}

export function BuyMenuDrawMoneyBox(money: number): BuyMenuMoneyBoxDescriptor {
  return buyMenuDrawMoneyBox(money);
}

export function BuyMenuPrint(
  windowId: number,
  font: number,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
  lineSpacing: number,
  speed: number,
  color: number
): BuyMenuTextPrint {
  return buyMenuPrint(windowId, font, text, x, y, letterSpacing, lineSpacing, speed, color);
}

export function BuyMenuDisplayMessage(taskId: number, text: string, callback: string | null = null, font = 1, textSpeed = 0): BuyMenuMessage {
  return buyMenuDisplayMessage(taskId, text, font, textSpeed, callback);
}

export function BuyMenuQuantityBoxNormalBorder(windowId: number, copyToVram: boolean | number): BuyMenuFrameDescriptor {
  return buyMenuQuantityBoxNormalBorder(windowId, copyToVram === true || copyToVram !== 0);
}

export function BuyMenuQuantityBoxThinBorder(windowId: number, copyToVram: boolean | number): BuyMenuFrameDescriptor {
  return buyMenuQuantityBoxThinBorder(windowId, copyToVram === true || copyToVram !== 0);
}

export function BuyMenuConfirmPurchase(taskId: number, yesNo: string | null = null): BuyMenuConfirmPurchaseDescriptor {
  return buyMenuConfirmPurchase(taskId, yesNo);
}

export const itemListIsSellingTm = (
  itemIds: readonly string[],
  getPocket: (itemId: string) => string
): boolean => itemIds.some((itemId) => getPocket(itemId) === 'POCKET_TM_CASE');
