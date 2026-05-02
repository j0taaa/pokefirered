export const OPTIONS_TEXT_SPEED_SLOW = 0;
export const OPTIONS_TEXT_SPEED_MID = 1;
export const OPTIONS_TEXT_SPEED_FAST = 2;
export const SCROLL_DISTANCES = [1, 2, 4] as const;

export const RENDER_PRINT = 0;
export const RENDER_FINISH = 1;
export const RENDER_REPEAT = 2;
export const RENDER_UPDATE = 3;

export const RENDER_STATE_HANDLE_CHAR = 0;
export const RENDER_STATE_WAIT = 1;
export const RENDER_STATE_CLEAR = 2;
export const RENDER_STATE_SCROLL_START = 3;
export const RENDER_STATE_SCROLL = 4;
export const RENDER_STATE_WAIT_SE = 5;
export const RENDER_STATE_PAUSE = 6;

export const CHAR_KEYPAD_ICON = 0xf8;
export const CHAR_EXTRA_SYMBOL = 0xf9;
export const CHAR_PROMPT_SCROLL = 0xfa;
export const CHAR_PROMPT_CLEAR = 0xfb;
export const EXT_CTRL_CODE_BEGIN = 0xfc;
export const PLACEHOLDER_BEGIN = 0xfd;
export const CHAR_NEWLINE = 0xfe;
export const EOS = 0xff;

export const EXT_CTRL_CODE_COLOR = 0x01;
export const EXT_CTRL_CODE_HIGHLIGHT = 0x02;
export const EXT_CTRL_CODE_SHADOW = 0x03;
export const EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW = 0x04;
export const EXT_CTRL_CODE_PALETTE = 0x05;
export const EXT_CTRL_CODE_FONT = 0x06;
export const EXT_CTRL_CODE_RESET_FONT = 0x07;
export const EXT_CTRL_CODE_PAUSE = 0x08;
export const EXT_CTRL_CODE_PAUSE_UNTIL_PRESS = 0x09;
export const EXT_CTRL_CODE_WAIT_SE = 0x0a;
export const EXT_CTRL_CODE_PLAY_BGM = 0x0b;
export const EXT_CTRL_CODE_ESCAPE = 0x0c;
export const EXT_CTRL_CODE_SHIFT_RIGHT = 0x0d;
export const EXT_CTRL_CODE_SHIFT_DOWN = 0x0e;
export const EXT_CTRL_CODE_FILL_WINDOW = 0x0f;
export const EXT_CTRL_CODE_PLAY_SE = 0x10;

export const A_BUTTON = 1;
export const B_BUTTON = 2;
export const COPYWIN_GFX = 2;

export interface BrailleFontInfo {
  maxLetterHeight: number;
}

export interface BraillePrinterTemplate {
  currentChar: number[];
  currentCharIndex: number;
  windowId: number;
  fontId: number;
  x: number;
  y: number;
  currentX: number;
  currentY: number;
  letterSpacing: number;
  lineSpacing: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

export interface BraillePrinterSubStruct {
  glyphId: number;
  hasPrintBeenSpedUp: boolean;
  autoScrollDelay: number;
}

export interface BrailleTextPrinter {
  printerTemplate: BraillePrinterTemplate;
  sub: BraillePrinterSubStruct;
  state: number;
  textSpeed: number;
  delayCounter: number;
  scrollDistance: number;
}

export interface BrailleTextRuntime {
  canABSpeedUpPrint: boolean;
  autoScroll: boolean;
  heldKeys: number;
  newKeys: number;
  optionsTextSpeed: number;
  sePlaying: boolean;
  fonts: BrailleFontInfo[];
  glyphInfo: {
    glyph: number | null;
    width: number;
    height: number;
    sourceOffsets: number[];
  };
  generatedLookupTables: Array<{ fg: number; bg: number; shadow: number }>;
  copiedGlyphs: number;
  filledWindows: Array<{ windowId: number; fill: number }>;
  scrolledWindows: Array<{ windowId: number; mode: number; distance: number; fill: number }>;
  copiedWindows: Array<{ windowId: number; mode: number }>;
  downArrowInitCount: number;
  downArrowClearCount: number;
  waitResult: boolean;
  waitWithDownArrowResult: boolean;
}

export const createBrailleTextRuntime = (): BrailleTextRuntime => ({
  canABSpeedUpPrint: true,
  autoScroll: false,
  heldKeys: 0,
  newKeys: 0,
  optionsTextSpeed: OPTIONS_TEXT_SPEED_MID,
  sePlaying: false,
  fonts: [{ maxLetterHeight: 16 }],
  glyphInfo: {
    glyph: null,
    width: 0,
    height: 0,
    sourceOffsets: []
  },
  generatedLookupTables: [],
  copiedGlyphs: 0,
  filledWindows: [],
  scrolledWindows: [],
  copiedWindows: [],
  downArrowInitCount: 0,
  downArrowClearCount: 0,
  waitResult: true,
  waitWithDownArrowResult: true
});

export const createBrailleTextPrinter = (
  text: number[],
  overrides: Partial<BrailleTextPrinter> = {}
): BrailleTextPrinter => ({
  printerTemplate: {
    currentChar: text,
    currentCharIndex: 0,
    windowId: 0,
    fontId: 0,
    x: 0,
    y: 0,
    currentX: 0,
    currentY: 0,
    letterSpacing: 0,
    lineSpacing: 0,
    fgColor: 1,
    bgColor: 0,
    shadowColor: 2
  },
  sub: {
    glyphId: 0,
    hasPrintBeenSpedUp: false,
    autoScrollDelay: 0
  },
  state: RENDER_STATE_HANDLE_CHAR,
  textSpeed: 0,
  delayCounter: 0,
  scrollDistance: 0,
  ...overrides
});

const readChar = (printer: BrailleTextPrinter): number =>
  printer.printerTemplate.currentChar[printer.printerTemplate.currentCharIndex++] ?? EOS;

const peekCurrentChar = (printer: BrailleTextPrinter): number =>
  printer.printerTemplate.currentChar[printer.printerTemplate.currentCharIndex] ?? EOS;

const generateFontHalfRowLookupTable = (
  runtime: BrailleTextRuntime,
  fg: number,
  bg: number,
  shadow: number
): void => {
  runtime.generatedLookupTables.push({ fg, bg, shadow });
};

const fillWindowPixelBuffer = (
  runtime: BrailleTextRuntime,
  windowId: number,
  fill: number
): void => {
  runtime.filledWindows.push({ windowId, fill });
};

const copyWindowToVram = (
  runtime: BrailleTextRuntime,
  windowId: number,
  mode: number
): void => {
  runtime.copiedWindows.push({ windowId, mode });
};

const scrollWindow = (
  runtime: BrailleTextRuntime,
  windowId: number,
  mode: number,
  distance: number,
  fill: number
): void => {
  runtime.scrolledWindows.push({ windowId, mode, distance, fill });
};

const textPrinterInitDownArrowCounters = (runtime: BrailleTextRuntime): void => {
  runtime.downArrowInitCount += 1;
};

const textPrinterClearDownArrow = (runtime: BrailleTextRuntime): void => {
  runtime.downArrowClearCount += 1;
};

export const decompressGlyphBraille = (
  runtime: BrailleTextRuntime,
  glyph: number
): void => {
  const normalizedGlyph = glyph & 0xffff;
  const base = 0x100 * Math.trunc(normalizedGlyph / 8) + 0x10 * (normalizedGlyph % 8);
  runtime.glyphInfo = {
    glyph: normalizedGlyph,
    width: 16,
    height: 16,
    sourceOffsets: [base, base + 0x8, base + 0x80, base + 0x88]
  };
};

export const fontFuncBraille = (
  runtime: BrailleTextRuntime,
  textPrinter: BrailleTextPrinter
): number => {
  const sub = textPrinter.sub;
  const template = textPrinter.printerTemplate;

  switch (textPrinter.state) {
    case RENDER_STATE_HANDLE_CHAR: {
      if (((runtime.heldKeys & (A_BUTTON | B_BUTTON)) !== 0) && sub.hasPrintBeenSpedUp) {
        textPrinter.delayCounter = 0;
      }
      if (textPrinter.delayCounter && textPrinter.textSpeed) {
        textPrinter.delayCounter -= 1;
        if (runtime.canABSpeedUpPrint && (runtime.newKeys & (A_BUTTON | B_BUTTON)) !== 0) {
          sub.hasPrintBeenSpedUp = true;
          textPrinter.delayCounter = 0;
        }
        return RENDER_UPDATE;
      }
      textPrinter.delayCounter = runtime.autoScroll ? 1 : textPrinter.textSpeed;

      let char = readChar(textPrinter);
      switch (char) {
        case EOS:
          return RENDER_FINISH;
        case CHAR_NEWLINE:
          template.currentX = template.x;
          template.currentY += runtime.fonts[template.fontId].maxLetterHeight + template.lineSpacing;
          return RENDER_REPEAT;
        case PLACEHOLDER_BEGIN:
          template.currentCharIndex += 1;
          return RENDER_REPEAT;
        case EXT_CTRL_CODE_BEGIN:
          char = readChar(textPrinter);
          switch (char) {
            case EXT_CTRL_CODE_COLOR:
              template.fgColor = readChar(textPrinter);
              generateFontHalfRowLookupTable(runtime, template.fgColor, template.bgColor, template.shadowColor);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_HIGHLIGHT:
              template.bgColor = readChar(textPrinter);
              generateFontHalfRowLookupTable(runtime, template.fgColor, template.bgColor, template.shadowColor);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_SHADOW:
              template.shadowColor = readChar(textPrinter);
              generateFontHalfRowLookupTable(runtime, template.fgColor, template.bgColor, template.shadowColor);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW:
              template.fgColor = peekCurrentChar(textPrinter);
              template.currentCharIndex += 1;
              template.bgColor = peekCurrentChar(textPrinter);
              template.currentCharIndex += 1;
              template.shadowColor = peekCurrentChar(textPrinter);
              template.currentCharIndex += 1;
              generateFontHalfRowLookupTable(runtime, template.fgColor, template.bgColor, template.shadowColor);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_PALETTE:
              template.currentCharIndex += 1;
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_FONT:
              sub.glyphId = peekCurrentChar(textPrinter);
              template.currentCharIndex += 1;
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_RESET_FONT:
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_PAUSE:
              textPrinter.delayCounter = readChar(textPrinter);
              textPrinter.state = RENDER_STATE_PAUSE;
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_PAUSE_UNTIL_PRESS:
              textPrinter.state = RENDER_STATE_WAIT;
              if (runtime.autoScroll) {
                sub.autoScrollDelay = 0;
              }
              return RENDER_UPDATE;
            case EXT_CTRL_CODE_WAIT_SE:
              textPrinter.state = RENDER_STATE_WAIT_SE;
              return RENDER_UPDATE;
            case EXT_CTRL_CODE_PLAY_BGM:
            case EXT_CTRL_CODE_PLAY_SE:
              template.currentCharIndex += 2;
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_ESCAPE:
              template.currentCharIndex += 1;
              char = peekCurrentChar(textPrinter);
              break;
            case EXT_CTRL_CODE_SHIFT_RIGHT:
              template.currentX = template.x + readChar(textPrinter);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_SHIFT_DOWN:
              template.currentY = template.y + readChar(textPrinter);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_FILL_WINDOW:
              fillWindowPixelBuffer(runtime, template.windowId, template.bgColor);
              return RENDER_REPEAT;
          }
          break;
        case CHAR_PROMPT_CLEAR:
          textPrinter.state = RENDER_STATE_CLEAR;
          textPrinterInitDownArrowCounters(runtime);
          return RENDER_UPDATE;
        case CHAR_PROMPT_SCROLL:
          textPrinter.state = RENDER_STATE_SCROLL_START;
          textPrinterInitDownArrowCounters(runtime);
          return RENDER_UPDATE;
        case CHAR_EXTRA_SYMBOL:
          char = readChar(textPrinter) | 0x100;
          break;
        case CHAR_KEYPAD_ICON:
          template.currentCharIndex += 1;
          return RENDER_PRINT;
      }

      decompressGlyphBraille(runtime, char);
      runtime.copiedGlyphs += 1;
      template.currentX += runtime.glyphInfo.width + template.letterSpacing;
      return RENDER_PRINT;
    }
    case RENDER_STATE_WAIT:
      if (runtime.waitResult) {
        textPrinter.state = RENDER_STATE_HANDLE_CHAR;
      }
      return RENDER_UPDATE;
    case RENDER_STATE_CLEAR:
      if (runtime.waitWithDownArrowResult) {
        fillWindowPixelBuffer(runtime, template.windowId, template.bgColor);
        template.currentX = template.x;
        template.currentY = template.y;
        textPrinter.state = RENDER_STATE_HANDLE_CHAR;
      }
      return RENDER_UPDATE;
    case RENDER_STATE_SCROLL_START:
      if (runtime.waitWithDownArrowResult) {
        textPrinterClearDownArrow(runtime);
        textPrinter.scrollDistance = runtime.fonts[template.fontId].maxLetterHeight + template.lineSpacing;
        template.currentX = template.x;
        textPrinter.state = RENDER_STATE_SCROLL;
      }
      return RENDER_UPDATE;
    case RENDER_STATE_SCROLL:
      if (textPrinter.scrollDistance) {
        const scrollDistance = SCROLL_DISTANCES[runtime.optionsTextSpeed] ?? 2;
        if (textPrinter.scrollDistance < scrollDistance) {
          scrollWindow(runtime, template.windowId, 0, textPrinter.scrollDistance, template.bgColor);
          textPrinter.scrollDistance = 0;
        } else {
          scrollWindow(runtime, template.windowId, 0, scrollDistance, template.bgColor);
          textPrinter.scrollDistance -= scrollDistance;
        }
        copyWindowToVram(runtime, template.windowId, COPYWIN_GFX);
      } else {
        textPrinter.state = RENDER_STATE_HANDLE_CHAR;
      }
      return RENDER_UPDATE;
    case RENDER_STATE_WAIT_SE:
      if (!runtime.sePlaying) {
        textPrinter.state = RENDER_STATE_HANDLE_CHAR;
      }
      return RENDER_UPDATE;
    case RENDER_STATE_PAUSE:
      if (textPrinter.delayCounter) {
        textPrinter.delayCounter -= 1;
      } else {
        textPrinter.state = RENDER_STATE_HANDLE_CHAR;
      }
      return RENDER_UPDATE;
  }

  return RENDER_FINISH;
};

export const getGlyphWidthBraille = (
  _fontType: number,
  _isJapanese: boolean
): number => 16;

export const FontFunc_Braille = fontFuncBraille;
export const DecompressGlyph_Braille = decompressGlyphBraille;
export const GetGlyphWidth_Braille = getGlyphWidthBraille;
