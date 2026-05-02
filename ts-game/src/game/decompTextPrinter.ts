export const NUM_TEXT_PRINTERS = 32;
export const TEXT_SKIP_DRAW = 0xff;

export const RENDER_PRINT = 0;
export const RENDER_UPDATE = 1;
export const RENDER_REPEAT = 2;
export const RENDER_FINISH = 3;

export interface TextPrinterTemplate {
  currentChar: readonly number[] | string;
  windowId: number;
  fontId: number;
  x: number;
  y: number;
  currentX: number;
  currentY: number;
  letterSpacing: number;
  lineSpacing: number;
  unk: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

export interface TextPrinter {
  active: boolean;
  state: number;
  textSpeed: number;
  delayCounter: number;
  scrollDistance: number;
  subUnion: number[];
  printerTemplate: TextPrinterTemplate;
  callback: ((printerTemplate: TextPrinterTemplate, renderCmd: number) => void) | null;
  minLetterSpacing: number;
  japanese: number;
}

export interface FontInfo {
  letterSpacing: number;
  lineSpacing: number;
  unk: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
  fontFunction: (printer: TextPrinter) => number;
}

export interface GlyphInfo {
  width: number;
  height: number;
  pixels: Uint8Array;
}

export interface TextWindow {
  window: {
    width: number;
    height: number;
  };
  tileData: Uint8Array;
}

export interface TextPrinterRuntime {
  fonts: readonly FontInfo[] | null;
  glyphInfo: GlyphInfo;
  textPrinters: TextPrinter[];
  tempTextPrinter: TextPrinter;
  fontHalfRowLookupTable: number[];
  lastTextBgColor: number;
  lastTextFgColor: number;
  lastTextShadowColor: number;
  windows: TextWindow[];
  copiedWindows: Array<{ windowId: number; mode: string }>;
}

export const sFontHalfRowOffsets = [
  0x00, 0x01, 0x02, 0x00, 0x03, 0x04, 0x05, 0x03, 0x06, 0x07, 0x08, 0x06, 0x00, 0x01, 0x02, 0x00,
  0x09, 0x0a, 0x0b, 0x09, 0x0c, 0x0d, 0x0e, 0x0c, 0x0f, 0x10, 0x11, 0x0f, 0x09, 0x0a, 0x0b, 0x09,
  0x12, 0x13, 0x14, 0x12, 0x15, 0x16, 0x17, 0x15, 0x18, 0x19, 0x1a, 0x18, 0x12, 0x13, 0x14, 0x12,
  0x00, 0x01, 0x02, 0x00, 0x03, 0x04, 0x05, 0x03, 0x06, 0x07, 0x08, 0x06, 0x00, 0x01, 0x02, 0x00,
  0x1b, 0x1c, 0x1d, 0x1b, 0x1e, 0x1f, 0x20, 0x1e, 0x21, 0x22, 0x23, 0x21, 0x1b, 0x1c, 0x1d, 0x1b,
  0x24, 0x25, 0x26, 0x24, 0x27, 0x28, 0x29, 0x27, 0x2a, 0x2b, 0x2c, 0x2a, 0x24, 0x25, 0x26, 0x24,
  0x2d, 0x2e, 0x2f, 0x2d, 0x30, 0x31, 0x32, 0x30, 0x33, 0x34, 0x35, 0x33, 0x2d, 0x2e, 0x2f, 0x2d,
  0x1b, 0x1c, 0x1d, 0x1b, 0x1e, 0x1f, 0x20, 0x1e, 0x21, 0x22, 0x23, 0x21, 0x1b, 0x1c, 0x1d, 0x1b,
  0x36, 0x37, 0x38, 0x36, 0x39, 0x3a, 0x3b, 0x39, 0x3c, 0x3d, 0x3e, 0x3c, 0x36, 0x37, 0x38, 0x36,
  0x3f, 0x40, 0x41, 0x3f, 0x42, 0x43, 0x44, 0x42, 0x45, 0x46, 0x47, 0x45, 0x3f, 0x40, 0x41, 0x3f,
  0x48, 0x49, 0x4a, 0x48, 0x4b, 0x4c, 0x4d, 0x4b, 0x4e, 0x4f, 0x50, 0x4e, 0x48, 0x49, 0x4a, 0x48,
  0x36, 0x37, 0x38, 0x36, 0x39, 0x3a, 0x3b, 0x39, 0x3c, 0x3d, 0x3e, 0x3c, 0x36, 0x37, 0x38, 0x36,
  0x00, 0x01, 0x02, 0x00, 0x03, 0x04, 0x05, 0x03, 0x06, 0x07, 0x08, 0x06, 0x00, 0x01, 0x02, 0x00,
  0x09, 0x0a, 0x0b, 0x09, 0x0c, 0x0d, 0x0e, 0x0c, 0x0f, 0x10, 0x11, 0x0f, 0x09, 0x0a, 0x0b, 0x09,
  0x12, 0x13, 0x14, 0x12, 0x15, 0x16, 0x17, 0x15, 0x18, 0x19, 0x1a, 0x18, 0x12, 0x13, 0x14, 0x12,
  0x00, 0x01, 0x02, 0x00, 0x03, 0x04, 0x05, 0x03, 0x06, 0x07, 0x08, 0x06, 0x00, 0x01, 0x02, 0x00
];

const emptyTemplate = (): TextPrinterTemplate => ({
  currentChar: [],
  windowId: 0,
  fontId: 0,
  x: 0,
  y: 0,
  currentX: 0,
  currentY: 0,
  letterSpacing: 0,
  lineSpacing: 0,
  unk: 0,
  fgColor: 0,
  bgColor: 0,
  shadowColor: 0
});

const emptyPrinter = (): TextPrinter => ({
  active: false,
  state: 0,
  textSpeed: 0,
  delayCounter: 0,
  scrollDistance: 0,
  subUnion: Array.from({ length: 8 }, () => 0),
  printerTemplate: emptyTemplate(),
  callback: null,
  minLetterSpacing: 0,
  japanese: 0
});

export const createTextPrinterRuntime = (): TextPrinterRuntime => ({
  fonts: null,
  glyphInfo: { width: 0, height: 0, pixels: new Uint8Array(0x80) },
  textPrinters: Array.from({ length: NUM_TEXT_PRINTERS }, () => emptyPrinter()),
  tempTextPrinter: emptyPrinter(),
  fontHalfRowLookupTable: Array.from({ length: 0x51 }, () => 0),
  lastTextBgColor: 0,
  lastTextFgColor: 0,
  lastTextShadowColor: 0,
  windows: [],
  copiedWindows: []
});

export const setFontsPointer = (runtime: TextPrinterRuntime, fonts: readonly FontInfo[]): void => {
  runtime.fonts = fonts;
};

export const deactivateAllTextPrinters = (runtime: TextPrinterRuntime): void => {
  for (let printer = 0; printer < NUM_TEXT_PRINTERS; printer += 1) {
    runtime.textPrinters[printer].active = false;
  }
};

export const generateFontHalfRowLookupTable = (
  runtime: TextPrinterRuntime,
  fgColor: number,
  bgColor: number,
  shadowColor: number
): void => {
  const colors = [bgColor, fgColor, shadowColor];
  runtime.lastTextBgColor = bgColor;
  runtime.lastTextFgColor = fgColor;
  runtime.lastTextShadowColor = shadowColor;
  let lutIndex = 0;
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      for (let k = 0; k < 3; k += 1) {
        for (let l = 0; l < 3; l += 1) {
          runtime.fontHalfRowLookupTable[lutIndex] =
            (colors[l] << 12) | (colors[k] << 8) | (colors[j] << 4) | colors[i];
          lutIndex += 1;
        }
      }
    }
  }
};

export const addTextPrinterParameterized = (
  runtime: TextPrinterRuntime,
  windowId: number,
  fontId: number,
  str: readonly number[] | string,
  x: number,
  y: number,
  speed: number,
  callback: ((printerTemplate: TextPrinterTemplate, renderCmd: number) => void) | null
): boolean => {
  if (runtime.fonts === null) {
    return false;
  }
  const font = runtime.fonts[fontId];
  return addTextPrinter(runtime, {
    currentChar: str,
    windowId,
    fontId,
    x,
    y,
    currentX: x,
    currentY: y,
    letterSpacing: font.letterSpacing,
    lineSpacing: font.lineSpacing,
    unk: font.unk,
    fgColor: font.fgColor,
    bgColor: font.bgColor,
    shadowColor: font.shadowColor
  }, speed, callback);
};

export const copyWindowToVram = (
  runtime: TextPrinterRuntime,
  windowId: number,
  mode = 'COPYWIN_GFX'
): void => {
  runtime.copiedWindows.push({ windowId, mode });
};

export const addTextPrinter = (
  runtime: TextPrinterRuntime,
  textSubPrinter: TextPrinterTemplate,
  speed: number,
  callback: ((printerTemplate: TextPrinterTemplate, renderCmd: number) => void) | null
): boolean => {
  if (runtime.fonts === null) {
    return false;
  }

  const temp = emptyPrinter();
  temp.active = true;
  temp.state = 0;
  temp.textSpeed = speed;
  temp.delayCounter = 0;
  temp.scrollDistance = 0;
  temp.printerTemplate = { ...textSubPrinter };
  temp.callback = callback;
  temp.minLetterSpacing = 0;
  temp.japanese = 0;
  runtime.tempTextPrinter = temp;

  generateFontHalfRowLookupTable(runtime, textSubPrinter.fgColor, textSubPrinter.bgColor, textSubPrinter.shadowColor);
  if (speed !== TEXT_SKIP_DRAW && speed !== 0) {
    temp.textSpeed -= 1;
    runtime.textPrinters[textSubPrinter.windowId] = { ...temp, subUnion: temp.subUnion.slice(), printerTemplate: { ...temp.printerTemplate } };
  } else {
    temp.textSpeed = 0;
    for (let j = 0; j < 0x400; j += 1) {
      if (renderFont(runtime, temp) === RENDER_FINISH) {
        break;
      }
    }
    if (speed !== TEXT_SKIP_DRAW) {
      copyWindowToVram(runtime, temp.printerTemplate.windowId);
    }
    runtime.textPrinters[textSubPrinter.windowId].active = false;
  }
  return true;
};

export const runTextPrinters = (runtime: TextPrinterRuntime): void => {
  for (let i = 0; i < NUM_TEXT_PRINTERS; i += 1) {
    if (runtime.textPrinters[i].active) {
      const renderCmd = renderFont(runtime, runtime.textPrinters[i]);
      switch (renderCmd) {
        case RENDER_PRINT:
          copyWindowToVram(runtime, runtime.textPrinters[i].printerTemplate.windowId);
        // fallthrough
        case RENDER_UPDATE:
          runtime.textPrinters[i].callback?.(runtime.textPrinters[i].printerTemplate, renderCmd);
          break;
        case RENDER_FINISH:
          runtime.textPrinters[i].active = false;
          break;
      }
    }
  }
};

export const isTextPrinterActive = (runtime: TextPrinterRuntime, id: number): boolean =>
  runtime.textPrinters[id].active;

export const renderFont = (runtime: TextPrinterRuntime, textPrinter: TextPrinter): number => {
  if (runtime.fonts === null) {
    return RENDER_FINISH;
  }
  while (true) {
    const ret = runtime.fonts[textPrinter.printerTemplate.fontId].fontFunction(textPrinter);
    if (ret !== RENDER_REPEAT) {
      return ret;
    }
  }
};

export const saveTextColors = (
  runtime: TextPrinterRuntime,
  colors: { fgColor: number; bgColor: number; shadowColor: number }
): void => {
  colors.bgColor = runtime.lastTextBgColor;
  colors.fgColor = runtime.lastTextFgColor;
  colors.shadowColor = runtime.lastTextShadowColor;
};

export const restoreTextColors = (
  runtime: TextPrinterRuntime,
  colors: { fgColor: number; bgColor: number; shadowColor: number }
): void => {
  generateFontHalfRowLookupTable(runtime, colors.fgColor, colors.bgColor, colors.shadowColor);
};

export const decompressGlyphTile = (
  runtime: TextPrinterRuntime,
  src: Uint16Array,
  dest: Uint16Array
): void => {
  let srcIndex = 0;
  for (let i = 0; i < 16; i += 1) {
    let offsetIndex: number;
    if ((i & 1) !== 0) {
      offsetIndex = src[srcIndex] & 0xff;
      srcIndex += 1;
    } else {
      offsetIndex = src[srcIndex] >> 8;
    }
    dest[i] = runtime.fontHalfRowLookupTable[sFontHalfRowOffsets[offsetIndex]];
  }
};

export const getLastTextColor = (runtime: TextPrinterRuntime, colorType: number): number => {
  switch (colorType) {
    case 0:
      return runtime.lastTextFgColor;
    case 2:
      return runtime.lastTextBgColor;
    case 1:
      return runtime.lastTextShadowColor;
    default:
      return 0;
  }
};

const glyphCopy = (
  glyphInfo: GlyphInfo,
  widthOffset: number,
  heightOffset: number,
  width: number,
  height: number,
  tilesDest: Uint8Array,
  left: number,
  top: number,
  sizeX: number
): void => {
  let src = Math.trunc(heightOffset / 8) * 0x40 + Math.trunc(widthOffset / 8) * 0x20;
  for (let yAdd = 0, ypos = top + heightOffset; yAdd < height; yAdd += 1, ypos += 1) {
    const pixbuf = (
      (glyphInfo.pixels[src] ?? 0)
      | ((glyphInfo.pixels[src + 1] ?? 0) << 8)
      | ((glyphInfo.pixels[src + 2] ?? 0) << 16)
      | ((glyphInfo.pixels[src + 3] ?? 0) << 24)
    ) >>> 0;
    for (let xAdd = 0, xpos = left + widthOffset; xAdd < width; xAdd += 1, xpos += 1) {
      const dstOffset = ((xpos >> 1) & 3)
        + ((xpos >> 3) << 5)
        + (((ypos >> 3) * sizeX) << 5)
        + ((ypos & 7) << 2);
      const toOrr = (pixbuf >>> (xAdd * 4)) & 0xf;
      if (toOrr !== 0) {
        const bits = (xpos & 1) * 4;
        tilesDest[dstOffset] = (toOrr << bits) | (tilesDest[dstOffset] & (0xf0 >> bits));
      }
    }
    src += 4;
  }
};

export const copyGlyphToWindow = (
  runtime: TextPrinterRuntime,
  textPrinter: TextPrinter
): void => {
  const win = runtime.windows[textPrinter.printerTemplate.windowId];
  const widthPx = win.window.width * 8;
  const heightPx = win.window.height * 8;
  copyGlyphToWindowParameterized(
    runtime,
    win.tileData,
    textPrinter.printerTemplate.currentX,
    textPrinter.printerTemplate.currentY,
    widthPx,
    heightPx
  );
};

export const copyGlyphToWindowParameterized = (
  runtime: TextPrinterRuntime,
  tileData: Uint8Array,
  currentX: number,
  currentY: number,
  width: number,
  height: number
): void => {
  const glyphWidth = width - currentX < runtime.glyphInfo.width
    ? width - currentX
    : runtime.glyphInfo.width;
  const glyphHeight = height - currentY < runtime.glyphInfo.height
    ? height - currentY
    : runtime.glyphInfo.height;
  let sizeType = 0;
  const sizeX = (width + (width & 7)) >> 3;
  if (glyphWidth > 8) {
    sizeType |= 1;
  }
  if (glyphHeight > 8) {
    sizeType |= 2;
  }

  switch (sizeType) {
    case 0:
      glyphCopy(runtime.glyphInfo, 0, 0, glyphWidth, glyphHeight, tileData, currentX, currentY, sizeX);
      return;
    case 1:
      glyphCopy(runtime.glyphInfo, 0, 0, 8, glyphHeight, tileData, currentX, currentY, sizeX);
      glyphCopy(runtime.glyphInfo, 8, 0, glyphWidth - 8, glyphHeight, tileData, currentX, currentY, sizeX);
      return;
    case 2:
      glyphCopy(runtime.glyphInfo, 0, 0, glyphWidth, 8, tileData, currentX, currentY, sizeX);
      glyphCopy(runtime.glyphInfo, 0, 8, glyphWidth, glyphHeight - 8, tileData, currentX, currentY, sizeX);
      return;
    case 3:
      glyphCopy(runtime.glyphInfo, 0, 0, 8, 8, tileData, currentX, currentY, sizeX);
      glyphCopy(runtime.glyphInfo, 8, 0, glyphWidth - 8, 8, tileData, currentX, currentY, sizeX);
      glyphCopy(runtime.glyphInfo, 0, 8, 8, glyphHeight - 8, tileData, currentX, currentY, sizeX);
      glyphCopy(runtime.glyphInfo, 8, 8, glyphWidth - 8, glyphHeight - 8, tileData, currentX, currentY, sizeX);
      return;
  }
};

export const clearTextSpan = (_textPrinter: TextPrinter, _width: number): void => {};

export function SetFontsPointer(runtime: TextPrinterRuntime, fonts: readonly FontInfo[]): void {
  setFontsPointer(runtime, fonts);
}

export function DeactivateAllTextPrinters(runtime: TextPrinterRuntime): void {
  deactivateAllTextPrinters(runtime);
}

export function AddTextPrinterParameterized(
  runtime: TextPrinterRuntime,
  windowId: number,
  fontId: number,
  str: readonly number[] | string,
  x: number,
  y: number,
  speed: number,
  callback: ((printerTemplate: TextPrinterTemplate, renderCmd: number) => void) | null
): boolean {
  return addTextPrinterParameterized(runtime, windowId, fontId, str, x, y, speed, callback);
}

export function AddTextPrinter(
  runtime: TextPrinterRuntime,
  textSubPrinter: TextPrinterTemplate,
  speed: number,
  callback: ((printerTemplate: TextPrinterTemplate, renderCmd: number) => void) | null
): boolean {
  return addTextPrinter(runtime, textSubPrinter, speed, callback);
}

export function RunTextPrinters(runtime: TextPrinterRuntime): void {
  runTextPrinters(runtime);
}

export function IsTextPrinterActive(runtime: TextPrinterRuntime, id: number): boolean {
  return isTextPrinterActive(runtime, id);
}

export function RenderFont(runtime: TextPrinterRuntime, textPrinter: TextPrinter): number {
  return renderFont(runtime, textPrinter);
}

export function GenerateFontHalfRowLookupTable(
  runtime: TextPrinterRuntime,
  fgColor: number,
  bgColor: number,
  shadowColor: number
): void {
  generateFontHalfRowLookupTable(runtime, fgColor, bgColor, shadowColor);
}

export function SaveTextColors(
  runtime: TextPrinterRuntime,
  colors: { fgColor: number; bgColor: number; shadowColor: number }
): void {
  saveTextColors(runtime, colors);
}

export function RestoreTextColors(
  runtime: TextPrinterRuntime,
  colors: { fgColor: number; bgColor: number; shadowColor: number }
): void {
  restoreTextColors(runtime, colors);
}

export function DecompressGlyphTile(
  runtime: TextPrinterRuntime,
  src: Uint16Array,
  dest: Uint16Array
): void {
  decompressGlyphTile(runtime, src, dest);
}

export function GetLastTextColor(runtime: TextPrinterRuntime, colorType: number): number {
  return getLastTextColor(runtime, colorType);
}

export function CopyGlyphToWindow(runtime: TextPrinterRuntime, textPrinter: TextPrinter): void {
  copyGlyphToWindow(runtime, textPrinter);
}

export function CopyGlyphToWindow_Parameterized(
  runtime: TextPrinterRuntime,
  tileData: Uint8Array,
  currentX: number,
  currentY: number,
  width: number,
  height: number
): void {
  copyGlyphToWindowParameterized(runtime, tileData, currentX, currentY, width, height);
}

export function ClearTextSpan(textPrinter: TextPrinter, width: number): void {
  clearTextSpan(textPrinter, width);
}
