export const WIN_TITLE = 0;
export const WIN_BODY = 1;
export const WIN_COUNT = 2;
export const TAG_ARROWS = 0x1000;
export const NUM_WONDER_BGS = 8;
export const WONDER_NEWS_TEXT_LENGTH = 40;
export const WONDER_NEWS_BODY_TEXT_LINES = 10;
export const TASK_NONE = 0xff;
export const EOS = '';

export const NEWS_INPUT_A = 0;
export const NEWS_INPUT_B = 1;
export const NEWS_INPUT_SCROLL_UP = 2;
export const NEWS_INPUT_SCROLL_DOWN = 3;
export const NEWS_INPUT_NONE = 0xff;

export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const DPAD_UP = 0x0040;
export const DPAD_DOWN = 0x0080;

export const PALETTES_ALL = 0xffffffff;
export const RGB_BLACK = 0;
export const BG_PLTT_ID_1 = 16;
export const PLTT_SIZE_4BPP = 32;
export const COPYWIN_FULL = 3;
export const SCROLL_ARROW_UP = 0;
export const SCROLL_ARROW_DOWN = 1;
export const FONT_NORMAL_COPY_2 = 'FONT_NORMAL_COPY_2';
export const FONTATTR_LETTER_SPACING = 'FONTATTR_LETTER_SPACING';
export const BG_COORD_SET = 'BG_COORD_SET';
export const BG_COORD_ADD = 'BG_COORD_ADD';
export const BG_COORD_SUB = 'BG_COORD_SUB';
export const DISPLAY_WIDTH = 240;
export const DISPCNT_WIN0_ON = 0x2000;
export const WININ_WIN0_BG_ALL = 0x0f;
export const WININ_WIN0_OBJ = 0x10;
export const WINOUT_WIN01_BG0 = 0x0100;
export const WINOUT_WIN01_BG1 = 0x0200;
export const WINOUT_WIN01_BG3 = 0x0800;
export const WINOUT_WIN01_OBJ = 0x1000;

export interface WonderNews {
  id: number;
  sendType: number;
  bgType: number;
  titleText: string;
  bodyText: string[];
}

export interface WonderGraphics {
  titleTextPal: number;
  bodyTextPal: number;
  tiles: string;
  map: string;
  pal: string;
}

export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface ScrollArrowsTemplate {
  firstArrowType: number;
  firstX: number;
  firstY: number;
  secondArrowType: number;
  secondX: number;
  secondY: number;
  fullyUpThreshold: number;
  fullyDownThreshold: number;
  tileTag: number;
  palTag: number;
  palNum: number;
}

export interface WonderNewsData {
  news: WonderNews;
  gfx: WonderGraphics;
  verticalScrollDisabled: boolean;
  enterExitState: number;
  arrowTaskId: number;
  scrolling: boolean;
  scrollIncrement: number;
  scrollingDown: boolean;
  scrollTotal: number;
  scrollEnd: number;
  scrollOffset: number;
  windowIds: number[];
  unused: number[];
  titleText: string;
  bodyText: string[];
  arrowsTemplate: ScrollArrowsTemplate;
  bgTilemapBuffer: number[];
}

export interface WonderNewsRuntime {
  data: WonderNewsData | null;
  allocFails: boolean;
  paletteFadeBusyQueue: boolean[];
  tempTileDataBusyQueue: boolean[];
  paletteFade: { bufferTransferDisabled: boolean };
  gpuRegs: Record<string, number>;
  bgY: Record<number, number>;
  shownBgs: Set<number>;
  hiddenBgs: Set<number>;
  windows: Map<number, WindowTemplate>;
  nextWindowId: number;
  nextArrowTaskId: number;
  operations: Array<{ op: string; args: unknown[] }>;
  textPrinters: Array<{ windowId: number; font: string; x: number; y: number; colors: readonly number[]; speed: number; text: string }>;
  copiedWindows: Array<{ windowId: number; mode: number }>;
  removedWindows: number[];
  removedArrowTaskIds: number[];
  giftIsFromEReader: boolean;
}

export const sTextColorTable = [
  [0, 2, 3],
  [0, 1, 2]
] as const;

export const sWindowTemplates = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 0, width: 28, height: 3, paletteNum: 15, baseBlock: 0x000 },
  { bg: 2, tilemapLeft: 1, tilemapTop: 3, width: 28, height: 20, paletteNum: 15, baseBlock: 0x000 }
] as const satisfies readonly WindowTemplate[];

export const sArrowsTemplate: ScrollArrowsTemplate = {
  firstArrowType: SCROLL_ARROW_UP,
  firstX: 232,
  firstY: 24,
  secondArrowType: SCROLL_ARROW_DOWN,
  secondX: 232,
  secondY: 152,
  fullyUpThreshold: 0,
  fullyDownThreshold: 2,
  tileTag: TAG_ARROWS,
  palTag: TAG_ARROWS,
  palNum: 0
};

export const sNewsGraphics = [
  { titleTextPal: 1, bodyTextPal: 0, tiles: 'sNews0Gfx', map: 'sNews0Map', pal: 'sNews0Pal' },
  { titleTextPal: 1, bodyTextPal: 0, tiles: 'sNews1Gfx', map: 'sNews1Map', pal: 'gCard1Pal' },
  { titleTextPal: 1, bodyTextPal: 0, tiles: 'sNews2Gfx', map: 'sNews2Map', pal: 'gCard2Pal' },
  { titleTextPal: 1, bodyTextPal: 0, tiles: 'sNews2Gfx', map: 'sNews2Map', pal: 'gCard3Pal' },
  { titleTextPal: 1, bodyTextPal: 0, tiles: 'sNews2Gfx', map: 'sNews2Map', pal: 'gCard4Pal' },
  { titleTextPal: 1, bodyTextPal: 0, tiles: 'sNews2Gfx', map: 'sNews2Map', pal: 'gCard5Pal' },
  { titleTextPal: 1, bodyTextPal: 0, tiles: 'sNews6Gfx', map: 'sNews6Map', pal: 'sNews6Pal' },
  { titleTextPal: 1, bodyTextPal: 0, tiles: 'sNews7Gfx', map: 'sNews7Map', pal: 'sNews7Pal' }
] as const satisfies readonly WonderGraphics[];

export const createWonderNewsRuntime = (): WonderNewsRuntime => ({
  data: null,
  allocFails: false,
  paletteFadeBusyQueue: [],
  tempTileDataBusyQueue: [],
  paletteFade: { bufferTransferDisabled: false },
  gpuRegs: {},
  bgY: {},
  shownBgs: new Set(),
  hiddenBgs: new Set(),
  windows: new Map(),
  nextWindowId: 0,
  nextArrowTaskId: 1,
  operations: [],
  textPrinters: [],
  copiedWindows: [],
  removedWindows: [],
  removedArrowTaskIds: [],
  giftIsFromEReader: false
});

const emptyNews = (): WonderNews => ({
  id: 0,
  sendType: 0,
  bgType: 0,
  titleText: '',
  bodyText: Array.from({ length: WONDER_NEWS_BODY_TEXT_LINES }, () => '')
});

const cloneNews = (news: WonderNews): WonderNews => ({
  id: news.id,
  sendType: news.sendType,
  bgType: news.bgType,
  titleText: news.titleText,
  bodyText: Array.from({ length: WONDER_NEWS_BODY_TEXT_LINES }, (_, i) => news.bodyText[i] ?? '')
});

const truncateWonderText = (text: string): string => text.slice(0, WONDER_NEWS_TEXT_LENGTH);

const requireData = (runtime: WonderNewsRuntime): WonderNewsData => {
  if (runtime.data === null) {
    throw new Error('sWonderNewsData is NULL');
  }
  return runtime.data;
};

const record = (runtime: WonderNewsRuntime, op: string, ...args: unknown[]): void => {
  runtime.operations.push({ op, args });
};

const winRange = (left: number, right: number): number => left | (right << 8);

const beginNormalPaletteFade = (
  runtime: WonderNewsRuntime,
  palettes: number,
  delay: number,
  startY: number,
  targetY: number,
  color: number
): void => {
  record(runtime, 'BeginNormalPaletteFade', palettes, delay, startY, targetY, color);
};

const updatePaletteFade = (runtime: WonderNewsRuntime): boolean => {
  record(runtime, 'UpdatePaletteFade');
  return runtime.paletteFadeBusyQueue.shift() ?? false;
};

const freeTempTileDataBuffersIfPossible = (runtime: WonderNewsRuntime): boolean => {
  record(runtime, 'FreeTempTileDataBuffersIfPossible');
  return runtime.tempTileDataBusyQueue.shift() ?? false;
};

const changeBgY = (runtime: WonderNewsRuntime, bg: number, value: number, mode: string): void => {
  if (mode === BG_COORD_SET) {
    runtime.bgY[bg] = value;
  } else if (mode === BG_COORD_ADD) {
    runtime.bgY[bg] = (runtime.bgY[bg] ?? 0) + value;
  } else {
    runtime.bgY[bg] = (runtime.bgY[bg] ?? 0) - value;
  }
  record(runtime, 'ChangeBgY', bg, value, mode);
};

const setGpuReg = (runtime: WonderNewsRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value >>> 0;
  record(runtime, 'SetGpuReg', reg, value);
};

const setGpuRegBits = (runtime: WonderNewsRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = ((runtime.gpuRegs[reg] ?? 0) | value) >>> 0;
  record(runtime, 'SetGpuRegBits', reg, value);
};

const clearGpuRegBits = (runtime: WonderNewsRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = ((runtime.gpuRegs[reg] ?? 0) & ~value) >>> 0;
  record(runtime, 'ClearGpuRegBits', reg, value);
};

const fillBgTilemapBufferRectPalette0 = (
  runtime: WonderNewsRuntime,
  bg: number,
  tile: number,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  record(runtime, 'FillBgTilemapBufferRect_Palette0', bg, tile, x, y, width, height);
};

const copyBgTilemapBufferToVram = (runtime: WonderNewsRuntime, bg: number): void => {
  record(runtime, 'CopyBgTilemapBufferToVram', bg);
};

const decompressAndCopyTileDataToVram = (
  runtime: WonderNewsRuntime,
  bg: number,
  tiles: string,
  size: number,
  offset: number,
  mode: number
): void => {
  record(runtime, 'DecompressAndCopyTileDataToVram', bg, tiles, size, offset, mode);
};

const addWindow = (runtime: WonderNewsRuntime, template: WindowTemplate): number => {
  const windowId = runtime.nextWindowId;
  runtime.nextWindowId += 1;
  runtime.windows.set(windowId, { ...template });
  record(runtime, 'AddWindow', template, windowId);
  return windowId;
};

const removeWindow = (runtime: WonderNewsRuntime, windowId: number): void => {
  runtime.windows.delete(windowId);
  runtime.removedWindows.push(windowId);
  record(runtime, 'RemoveWindow', windowId);
};

const loadPalette = (runtime: WonderNewsRuntime, palette: string, offset: number, size: number): void => {
  record(runtime, 'LoadPalette', palette, offset, size);
};

const lz77UnCompWram = (runtime: WonderNewsRuntime, map: string, buffer: number[]): void => {
  buffer.fill(0);
  record(runtime, 'LZ77UnCompWram', map);
};

const copyRectToBgTilemapBufferRect = (
  runtime: WonderNewsRuntime,
  bg: number,
  src: number[],
  srcX: number,
  srcY: number,
  srcWidth: number,
  srcHeight: number,
  destX: number,
  destY: number,
  destWidth: number,
  destHeight: number,
  pal: number,
  baseTile: number,
  mode: number
): void => {
  record(runtime, 'CopyRectToBgTilemapBufferRect', bg, src.length, srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight, pal, baseTile, mode);
};

const showBg = (runtime: WonderNewsRuntime, bg: number): void => {
  runtime.shownBgs.add(bg);
  runtime.hiddenBgs.delete(bg);
  record(runtime, 'ShowBg', bg);
};

const hideBg = (runtime: WonderNewsRuntime, bg: number): void => {
  runtime.hiddenBgs.add(bg);
  runtime.shownBgs.delete(bg);
  record(runtime, 'HideBg', bg);
};

const addScrollIndicatorArrowPair = (runtime: WonderNewsRuntime, template: ScrollArrowsTemplate, scrollOffset: number): number => {
  const taskId = runtime.nextArrowTaskId;
  runtime.nextArrowTaskId += 1;
  record(runtime, 'AddScrollIndicatorArrowPair', { ...template }, scrollOffset, taskId);
  return taskId;
};

const removeScrollIndicatorArrowPair = (runtime: WonderNewsRuntime, taskId: number): void => {
  runtime.removedArrowTaskIds.push(taskId);
  record(runtime, 'RemoveScrollIndicatorArrowPair', taskId);
};

const printMysteryGiftOrEReaderTopMenu = (runtime: WonderNewsRuntime, fromEReader: boolean, useCancel: boolean): void => {
  record(runtime, 'PrintMysteryGiftOrEReaderTopMenu', fromEReader, useCancel);
};

const mgDrawCheckerboardPattern = (runtime: WonderNewsRuntime): void => {
  record(runtime, 'MG_DrawCheckerboardPattern');
};

const putWindowTilemap = (runtime: WonderNewsRuntime, windowId: number): void => {
  record(runtime, 'PutWindowTilemap', windowId);
};

const fillWindowPixelBuffer = (runtime: WonderNewsRuntime, windowId: number, fillValue: number): void => {
  record(runtime, 'FillWindowPixelBuffer', windowId, fillValue);
};

const getFontAttribute = (_font: string, _attribute: string): number => 0;

const getStringWidth = (_font: string, text: string, letterSpacing: number): number =>
  Math.max(0, text.length * 8 + Math.max(0, text.length - 1) * letterSpacing);

const addTextPrinterParameterized3 = (
  runtime: WonderNewsRuntime,
  windowId: number,
  font: string,
  x: number,
  y: number,
  colors: readonly number[],
  speed: number,
  text: string
): void => {
  runtime.textPrinters.push({ windowId, font, x, y, colors, speed, text });
  record(runtime, 'AddTextPrinterParameterized3', windowId, font, x, y, colors, speed, text);
};

const copyWindowToVram = (runtime: WonderNewsRuntime, windowId: number, mode: number): void => {
  runtime.copiedWindows.push({ windowId, mode });
  record(runtime, 'CopyWindowToVram', windowId, mode);
};

export const wonderNewsInit = (runtime: WonderNewsRuntime, news: WonderNews | null): boolean => {
  if (news === null) {
    return false;
  }
  if (runtime.allocFails) {
    return false;
  }

  const copiedNews = cloneNews(news);
  if (copiedNews.bgType >= NUM_WONDER_BGS) {
    copiedNews.bgType = 0;
  }

  runtime.data = {
    news: copiedNews,
    gfx: sNewsGraphics[copiedNews.bgType],
    verticalScrollDisabled: false,
    enterExitState: 0,
    arrowTaskId: TASK_NONE,
    scrolling: false,
    scrollIncrement: 0,
    scrollingDown: false,
    scrollTotal: 0,
    scrollEnd: 0,
    scrollOffset: 0,
    windowIds: Array.from({ length: WIN_COUNT }, () => 0),
    unused: [0, 0],
    titleText: '',
    bodyText: Array.from({ length: WONDER_NEWS_BODY_TEXT_LINES }, () => ''),
    arrowsTemplate: { ...sArrowsTemplate },
    bgTilemapBuffer: Array.from({ length: 0x1000 }, () => 0)
  };
  return true;
};

export const wonderNewsDestroy = (runtime: WonderNewsRuntime): void => {
  if (runtime.data !== null) {
    runtime.data = null;
  }
};

export const wonderNewsEnter = (runtime: WonderNewsRuntime): number => {
  const data = runtime.data;
  if (data === null) {
    return -1;
  }

  switch (data.enterExitState) {
    case 0:
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      break;
    case 1:
      if (updatePaletteFade(runtime)) {
        return 0;
      }
      changeBgY(runtime, 0, 0, BG_COORD_SET);
      changeBgY(runtime, 1, 0, BG_COORD_SET);
      changeBgY(runtime, 2, 0, BG_COORD_SET);
      changeBgY(runtime, 3, 0, BG_COORD_SET);
      setGpuReg(runtime, 'REG_OFFSET_WIN0H', winRange(0, DISPLAY_WIDTH));
      setGpuReg(runtime, 'REG_OFFSET_WIN0V', winRange(26, 152));
      setGpuReg(runtime, 'REG_OFFSET_WININ', WININ_WIN0_BG_ALL | WININ_WIN0_OBJ);
      setGpuReg(runtime, 'REG_OFFSET_WINOUT', WINOUT_WIN01_BG0 | WINOUT_WIN01_BG1 | WINOUT_WIN01_BG3 | WINOUT_WIN01_OBJ);
      setGpuRegBits(runtime, 'REG_OFFSET_DISPCNT', DISPCNT_WIN0_ON);
      break;
    case 2:
      fillBgTilemapBufferRectPalette0(runtime, 0, 0x000, 0, 0, 30, 20);
      fillBgTilemapBufferRectPalette0(runtime, 1, 0x000, 0, 0, 30, 20);
      fillBgTilemapBufferRectPalette0(runtime, 2, 0x000, 0, 0, 30, 20);
      fillBgTilemapBufferRectPalette0(runtime, 3, 0x000, 0, 0, 30, 20);
      copyBgTilemapBufferToVram(runtime, 0);
      copyBgTilemapBufferToVram(runtime, 1);
      copyBgTilemapBufferToVram(runtime, 2);
      copyBgTilemapBufferToVram(runtime, 3);
      decompressAndCopyTileDataToVram(runtime, 3, data.gfx.tiles, 0, 8, 0);
      data.windowIds[WIN_TITLE] = addWindow(runtime, sWindowTemplates[WIN_TITLE]);
      data.windowIds[WIN_BODY] = addWindow(runtime, sWindowTemplates[WIN_BODY]);
      break;
    case 3:
      if (freeTempTileDataBuffersIfPossible(runtime)) {
        return 0;
      }
      runtime.paletteFade.bufferTransferDisabled = true;
      loadPalette(runtime, data.gfx.pal, BG_PLTT_ID_1, PLTT_SIZE_4BPP);
      lz77UnCompWram(runtime, data.gfx.map, data.bgTilemapBuffer);
      copyRectToBgTilemapBufferRect(runtime, 1, data.bgTilemapBuffer, 0, 0, 30, 3, 0, 0, 30, 3, 1, 8, 0);
      copyRectToBgTilemapBufferRect(runtime, 3, data.bgTilemapBuffer, 0, 3, 30, 23, 0, 3, 30, 23, 1, 8, 0);
      copyBgTilemapBufferToVram(runtime, 1);
      copyBgTilemapBufferToVram(runtime, 3);
      break;
    case 4:
      bufferNewsText(runtime);
      break;
    case 5:
      drawNewsWindows(runtime);
      copyBgTilemapBufferToVram(runtime, 0);
      copyBgTilemapBufferToVram(runtime, 2);
      break;
    case 6:
      showBg(runtime, 1);
      showBg(runtime, 2);
      showBg(runtime, 3);
      runtime.paletteFade.bufferTransferDisabled = false;
      data.arrowTaskId = addScrollIndicatorArrowPair(runtime, data.arrowsTemplate, data.scrollOffset);
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      updatePaletteFade(runtime);
      break;
    default:
      if (updatePaletteFade(runtime)) {
        return 0;
      }
      data.enterExitState = 0;
      return 1;
  }

  data.enterExitState += 1;
  return 0;
};

export const wonderNewsExit = (runtime: WonderNewsRuntime, useCancel: boolean): number => {
  const data = runtime.data;
  if (data === null) {
    return -1;
  }

  switch (data.enterExitState) {
    case 0:
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      break;
    case 1:
      if (updatePaletteFade(runtime)) {
        return 0;
      }
      changeBgY(runtime, 2, 0, BG_COORD_SET);
      setGpuReg(runtime, 'REG_OFFSET_WIN0H', 0);
      setGpuReg(runtime, 'REG_OFFSET_WIN0V', 0);
      setGpuReg(runtime, 'REG_OFFSET_WININ', 0);
      setGpuReg(runtime, 'REG_OFFSET_WINOUT', 0);
      clearGpuRegBits(runtime, 'REG_OFFSET_DISPCNT', DISPCNT_WIN0_ON);
      break;
    case 2:
      fillBgTilemapBufferRectPalette0(runtime, 0, 0x000, 0, 0, 30, 20);
      fillBgTilemapBufferRectPalette0(runtime, 1, 0x000, 0, 0, 30, 20);
      fillBgTilemapBufferRectPalette0(runtime, 2, 0x000, 0, 0, 30, 24);
      fillBgTilemapBufferRectPalette0(runtime, 3, 0x000, 0, 0, 30, 24);
      copyBgTilemapBufferToVram(runtime, 0);
      copyBgTilemapBufferToVram(runtime, 1);
      copyBgTilemapBufferToVram(runtime, 2);
      copyBgTilemapBufferToVram(runtime, 3);
      break;
    case 3:
      hideBg(runtime, 1);
      hideBg(runtime, 2);
      removeWindow(runtime, data.windowIds[WIN_BODY]);
      removeWindow(runtime, data.windowIds[WIN_TITLE]);
      break;
    case 4:
      changeBgY(runtime, 2, 0, BG_COORD_SET);
      changeBgY(runtime, 3, 0, BG_COORD_SET);
      if (data.arrowTaskId !== TASK_NONE) {
        removeScrollIndicatorArrowPair(runtime, data.arrowTaskId);
        data.arrowTaskId = TASK_NONE;
      }
      break;
    case 5:
      printMysteryGiftOrEReaderTopMenu(runtime, runtime.giftIsFromEReader, useCancel);
      break;
    case 6:
      mgDrawCheckerboardPattern(runtime);
      copyBgTilemapBufferToVram(runtime, 0);
      copyBgTilemapBufferToVram(runtime, 3);
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      break;
    default:
      if (updatePaletteFade(runtime)) {
        return 0;
      }
      data.enterExitState = 0;
      return 1;
  }

  data.enterExitState += 1;
  return 0;
};

export const wonderNewsRemoveScrollIndicatorArrowPair = (runtime: WonderNewsRuntime): void => {
  const data = requireData(runtime);
  if (!data.verticalScrollDisabled && data.arrowTaskId !== TASK_NONE) {
    removeScrollIndicatorArrowPair(runtime, data.arrowTaskId);
    data.arrowTaskId = TASK_NONE;
    data.verticalScrollDisabled = true;
  }
};

export const wonderNewsAddScrollIndicatorArrowPair = (runtime: WonderNewsRuntime): void => {
  const data = requireData(runtime);
  if (data.verticalScrollDisabled) {
    data.arrowTaskId = addScrollIndicatorArrowPair(runtime, data.arrowsTemplate, data.scrollOffset);
    data.verticalScrollDisabled = false;
  }
};

export const wonderNewsGetInput = (runtime: WonderNewsRuntime, input: number): number => {
  const data = requireData(runtime);
  if (data.scrolling) {
    updateNewsScroll(runtime);
    return NEWS_INPUT_NONE;
  }

  switch (input) {
    case A_BUTTON:
      return NEWS_INPUT_A;
    case B_BUTTON:
      return NEWS_INPUT_B;
    case DPAD_UP:
      if (data.scrollOffset === 0) {
        return NEWS_INPUT_NONE;
      }
      if (data.verticalScrollDisabled) {
        return NEWS_INPUT_NONE;
      }
      data.scrollingDown = false;
      break;
    case DPAD_DOWN:
      if (data.scrollOffset === data.scrollEnd) {
        return NEWS_INPUT_NONE;
      }
      if (data.verticalScrollDisabled) {
        return NEWS_INPUT_NONE;
      }
      data.scrollingDown = true;
      break;
    default:
      return NEWS_INPUT_NONE;
  }

  data.scrolling = true;
  data.scrollIncrement = 2;
  data.scrollTotal = 0;
  if (!data.scrollingDown) {
    return NEWS_INPUT_SCROLL_UP;
  }
  return NEWS_INPUT_SCROLL_DOWN;
};

export const bufferNewsText = (runtime: WonderNewsRuntime): void => {
  const data = requireData(runtime);

  data.titleText = truncateWonderText(data.news.titleText) + EOS;
  data.scrollEnd = 0;
  for (let i = 0; i < WONDER_NEWS_BODY_TEXT_LINES; i += 1) {
    data.bodyText[i] = truncateWonderText(data.news.bodyText[i] ?? '') + EOS;
    if (i > 7 && data.bodyText[i][0] !== EOS) {
      data.scrollEnd += 1;
    }
  }
  data.arrowsTemplate = { ...sArrowsTemplate };
  data.arrowsTemplate.fullyDownThreshold = data.scrollEnd;
};

export const drawNewsWindows = (runtime: WonderNewsRuntime): void => {
  const data = requireData(runtime);
  putWindowTilemap(runtime, data.windowIds[WIN_TITLE]);
  putWindowTilemap(runtime, data.windowIds[WIN_BODY]);
  fillWindowPixelBuffer(runtime, data.windowIds[WIN_TITLE], 0);
  fillWindowPixelBuffer(runtime, data.windowIds[WIN_BODY], 0);

  let x = Math.trunc((224 - getStringWidth(FONT_NORMAL_COPY_2, data.titleText, getFontAttribute(FONT_NORMAL_COPY_2, FONTATTR_LETTER_SPACING))) / 2);
  if (x < 0) {
    x = 0;
  }
  addTextPrinterParameterized3(runtime, data.windowIds[WIN_TITLE], FONT_NORMAL_COPY_2, x, 6, sTextColorTable[data.gfx.titleTextPal], 0, data.titleText);

  for (let i = 0; i < WONDER_NEWS_BODY_TEXT_LINES; i += 1) {
    addTextPrinterParameterized3(runtime, data.windowIds[WIN_BODY], FONT_NORMAL_COPY_2, 0, 16 * i + 2, sTextColorTable[data.gfx.bodyTextPal], 0, data.bodyText[i]);
  }
  copyWindowToVram(runtime, data.windowIds[WIN_TITLE], COPYWIN_FULL);
  copyWindowToVram(runtime, data.windowIds[WIN_BODY], COPYWIN_FULL);
};

export const updateNewsScroll = (runtime: WonderNewsRuntime): void => {
  const data = requireData(runtime);
  let bgMove = data.scrollIncrement;
  bgMove *= 256;
  if (data.scrollingDown) {
    changeBgY(runtime, 2, bgMove, BG_COORD_ADD);
    changeBgY(runtime, 3, bgMove, BG_COORD_ADD);
  } else {
    changeBgY(runtime, 2, bgMove, BG_COORD_SUB);
    changeBgY(runtime, 3, bgMove, BG_COORD_SUB);
  }
  data.scrollTotal += data.scrollIncrement;
  if (data.scrollTotal > 15) {
    if (data.scrollingDown) {
      data.scrollOffset += 1;
    } else {
      data.scrollOffset -= 1;
    }
    data.scrolling = false;
    data.scrollTotal = 0;
  }
};

export const createWonderNews = (partial: Partial<WonderNews> = {}): WonderNews => ({
  ...emptyNews(),
  ...partial,
  bodyText: Array.from({ length: WONDER_NEWS_BODY_TEXT_LINES }, (_, i) => partial.bodyText?.[i] ?? '')
});

export function WonderNews_Init(runtime: WonderNewsRuntime, news: WonderNews | null): boolean {
  return wonderNewsInit(runtime, news);
}

export function WonderNews_Destroy(runtime: WonderNewsRuntime): void {
  wonderNewsDestroy(runtime);
}

export function WonderNews_Enter(runtime: WonderNewsRuntime): number {
  return wonderNewsEnter(runtime);
}

export function WonderNews_Exit(runtime: WonderNewsRuntime, useCancel: boolean): number {
  return wonderNewsExit(runtime, useCancel);
}

export function WonderNews_RemoveScrollIndicatorArrowPair(runtime: WonderNewsRuntime): void {
  wonderNewsRemoveScrollIndicatorArrowPair(runtime);
}

export function WonderNews_AddScrollIndicatorArrowPair(runtime: WonderNewsRuntime): void {
  wonderNewsAddScrollIndicatorArrowPair(runtime);
}

export function WonderNews_GetInput(runtime: WonderNewsRuntime, input: number): number {
  return wonderNewsGetInput(runtime, input);
}

export function BufferNewsText(runtime: WonderNewsRuntime): void {
  bufferNewsText(runtime);
}

export function DrawNewsWindows(runtime: WonderNewsRuntime): void {
  drawNewsWindows(runtime);
}

export function UpdateNewsScroll(runtime: WonderNewsRuntime): void {
  updateNewsScroll(runtime);
}
