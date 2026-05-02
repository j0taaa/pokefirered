import textSource from '../../../src/text.c?raw';

export const FONT_SMALL = 0;
export const FONT_NORMAL_COPY_1 = 1;
export const FONT_NORMAL = 2;
export const FONT_NORMAL_COPY_2 = 3;
export const FONT_MALE = 4;
export const FONT_FEMALE = 5;
export const FONT_BRAILLE = 6;
export const FONT_BOLD = 7;

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

export const FONTATTR_MAX_LETTER_WIDTH = 0;
export const FONTATTR_MAX_LETTER_HEIGHT = 1;
export const FONTATTR_LETTER_SPACING = 2;
export const FONTATTR_LINE_SPACING = 3;

export const CHAR_DYNAMIC = 0xf7;
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
export const EXT_CTRL_CODE_CLEAR = 0x11;
export const EXT_CTRL_CODE_SKIP = 0x12;
export const EXT_CTRL_CODE_CLEAR_TO = 0x13;
export const EXT_CTRL_CODE_MIN_LETTER_SPACING = 0x14;
export const EXT_CTRL_CODE_JPN = 0x15;
export const EXT_CTRL_CODE_ENG = 0x16;
export const EXT_CTRL_CODE_PAUSE_MUSIC = 0x17;
export const EXT_CTRL_CODE_RESUME_MUSIC = 0x18;

export const PLACEHOLDER_ID_STRING_VAR_1 = 0x02;
export const PLACEHOLDER_ID_STRING_VAR_2 = 0x03;
export const PLACEHOLDER_ID_STRING_VAR_3 = 0x04;

export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const OPTIONS_TEXT_SPEED_SLOW = 0;
export const OPTIONS_TEXT_SPEED_MID = 1;
export const OPTIONS_TEXT_SPEED_FAST = 2;
export const QL_STATE_PLAYBACK = 2;
export const TAG_CURSOR = 0x8000;
export const CURSOR_DELAY = 8;
export const DARK_DOWN_ARROW_OFFSET = 256;

export interface TextFlags {
  canABSpeedUpPrint: boolean;
  useAlternateDownArrow: boolean;
  autoScroll: boolean;
  forceMidTextSpeed: boolean;
}

export interface GlyphInfo {
  pixels: number[];
  width: number;
  height: number;
  glyphId: number;
  fontId: number;
  isJapanese: boolean;
}

export interface FontInfo {
  maxLetterWidth: number;
  maxLetterHeight: number;
  letterSpacing: number;
  lineSpacing: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

export interface TextPrinterTemplate {
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
  unk: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

export interface TextPrinterSubStruct {
  glyphId: number;
  hasPrintBeenSpedUp: boolean;
  font_type_5: number;
  downArrowDelay: number;
  downArrowYPosIdx: number;
  hasGlyphIdBeenSet: boolean;
  autoScrollDelay: number;
}

export interface TextPrinter {
  printerTemplate: TextPrinterTemplate;
  sub: TextPrinterSubStruct;
  active: boolean;
  state: number;
  textSpeed: number;
  delayCounter: number;
  scrollDistance: number;
  minLetterSpacing: number;
  japanese: boolean;
}

export interface TextCursorSprite {
  id: number;
  x: number;
  y: number;
  priority: number;
  subpriority: number;
  y2: number;
  data: number[];
  destroyed: boolean;
}

export interface TextRuntime {
  gTextFlags: TextFlags;
  gGlyphInfo: GlyphInfo;
  gFonts: FontInfo[];
  gStringVar1: number[];
  gStringVar2: number[];
  gStringVar3: number[];
  dynamicPlaceholders: Map<number, number[]>;
  pressedButtons: number;
  heldButtons: number;
  questLogState: number;
  optionsTextSpeed: number;
  sePlaying: boolean;
  qlPlaybackState: boolean;
  textColors: [number, number, number];
  nextSpriteId: number;
  sprites: TextCursorSprite[];
  operations: string[];
}

const parseNumberArray = (name: string): number[] => {
  const match = textSource.match(new RegExp(`static const u8 ${name}\\[\\][^{]*\\{([\\s\\S]*?)\\};`));
  if (match === null) throw new Error(`Could not find ${name}`);
  return [...match[1]!.matchAll(/\b\d+\b/g)].map((entry) => Number(entry[0]));
};

export const sFontSmallLatinGlyphWidths = parseNumberArray('sFontSmallLatinGlyphWidths');
export const sFontNormalCopy1LatinGlyphWidths = parseNumberArray('sFontNormalCopy1LatinGlyphWidths');
export const sFontNormalLatinGlyphWidths = parseNumberArray('sFontNormalLatinGlyphWidths');
export const sFontNormalJapaneseGlyphWidths = parseNumberArray('sFontNormalJapaneseGlyphWidths');
export const sFontMaleLatinGlyphWidths = parseNumberArray('sFontMaleLatinGlyphWidths');
export const sFontMaleJapaneseGlyphWidths = parseNumberArray('sFontMaleJapaneseGlyphWidths');
export const sFontFemaleLatinGlyphWidths = parseNumberArray('sFontFemaleLatinGlyphWidths');
export const sFontFemaleJapaneseGlyphWidths = parseNumberArray('sFontFemaleJapaneseGlyphWidths');

export const sDownArrowYCoords = [0, 16, 32, 16] as const;
export const sWindowVerticalScrollSpeeds = [1, 2, 4] as const;
export const sKeypadIcons = [
  { tileOffset: 0x0, width: 8, height: 12 },
  { tileOffset: 0x1, width: 8, height: 12 },
  { tileOffset: 0x2, width: 16, height: 12 },
  { tileOffset: 0x4, width: 16, height: 12 },
  { tileOffset: 0x6, width: 24, height: 12 },
  { tileOffset: 0x9, width: 24, height: 12 },
  { tileOffset: 0xc, width: 8, height: 12 },
  { tileOffset: 0xd, width: 8, height: 12 },
  { tileOffset: 0xe, width: 8, height: 12 },
  { tileOffset: 0xf, width: 8, height: 12 },
  { tileOffset: 0x20, width: 8, height: 12 },
  { tileOffset: 0x21, width: 8, height: 12 },
  { tileOffset: 0x22, width: 8, height: 12 }
] as const;

const defaultFonts = (): FontInfo[] => [
  { maxLetterWidth: 8, maxLetterHeight: 13, letterSpacing: 0, lineSpacing: 0, fgColor: 1, bgColor: 0, shadowColor: 3 },
  { maxLetterWidth: 10, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, fgColor: 1, bgColor: 0, shadowColor: 3 },
  { maxLetterWidth: 10, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, fgColor: 1, bgColor: 0, shadowColor: 3 },
  { maxLetterWidth: 10, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, fgColor: 1, bgColor: 0, shadowColor: 3 },
  { maxLetterWidth: 10, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, fgColor: 1, bgColor: 0, shadowColor: 3 },
  { maxLetterWidth: 10, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, fgColor: 1, bgColor: 0, shadowColor: 3 },
  { maxLetterWidth: 8, maxLetterHeight: 16, letterSpacing: 0, lineSpacing: 0, fgColor: 1, bgColor: 0, shadowColor: 3 },
  { maxLetterWidth: 8, maxLetterHeight: 12, letterSpacing: 0, lineSpacing: 0, fgColor: 1, bgColor: 0, shadowColor: 3 }
];

export const createTextRuntime = (overrides: Partial<TextRuntime> = {}): TextRuntime => {
  const runtime: TextRuntime = {
    gTextFlags: { canABSpeedUpPrint: false, useAlternateDownArrow: false, autoScroll: false, forceMidTextSpeed: false },
    gGlyphInfo: { pixels: Array.from({ length: 0x80 }, () => 0), width: 0, height: 0, glyphId: 0, fontId: 0, isJapanese: false },
    gFonts: defaultFonts(),
    gStringVar1: [EOS],
    gStringVar2: [EOS],
    gStringVar3: [EOS],
    dynamicPlaceholders: new Map(),
    pressedButtons: 0,
    heldButtons: 0,
    questLogState: 0,
    optionsTextSpeed: OPTIONS_TEXT_SPEED_MID,
    sePlaying: false,
    qlPlaybackState: false,
    textColors: [1, 0, 3],
    nextSpriteId: 0,
    sprites: [],
    operations: []
  };
  return Object.assign(runtime, overrides);
};

export const createTextPrinter = (text: number[], overrides: Partial<TextPrinter> = {}): TextPrinter => ({
  printerTemplate: {
    currentChar: text,
    currentCharIndex: 0,
    windowId: 0,
    fontId: FONT_NORMAL,
    x: 0,
    y: 0,
    currentX: 0,
    currentY: 0,
    letterSpacing: 0,
    lineSpacing: 0,
    unk: 0,
    fgColor: 1,
    bgColor: 0,
    shadowColor: 3
  },
  sub: { glyphId: FONT_NORMAL, hasPrintBeenSpedUp: false, font_type_5: 0, downArrowDelay: 0, downArrowYPosIdx: 0, hasGlyphIdBeenSet: false, autoScrollDelay: 0 },
  active: true,
  state: RENDER_STATE_HANDLE_CHAR,
  textSpeed: 0,
  delayCounter: 0,
  scrollDistance: 0,
  minLetterSpacing: 0,
  japanese: false,
  ...overrides
});

const readChar = (printer: TextPrinter): number => printer.printerTemplate.currentChar[printer.printerTemplate.currentCharIndex++] ?? EOS;
const peekChar = (printer: TextPrinter): number => printer.printerTemplate.currentChar[printer.printerTemplate.currentCharIndex] ?? EOS;
const joyNew = (runtime: TextRuntime, mask: number): boolean => (runtime.pressedButtons & mask) !== 0;
const joyHeld = (runtime: TextRuntime, mask: number): boolean => (runtime.heldButtons & mask) !== 0;

export const GetFontAttribute = (runtime: TextRuntime, fontId: number, attribute: number): number => {
  const font = runtime.gFonts[fontId] ?? runtime.gFonts[FONT_NORMAL]!;
  if (attribute === FONTATTR_MAX_LETTER_WIDTH) return font.maxLetterWidth;
  if (attribute === FONTATTR_MAX_LETTER_HEIGHT) return font.maxLetterHeight;
  if (attribute === FONTATTR_LETTER_SPACING) return font.letterSpacing;
  if (attribute === FONTATTR_LINE_SPACING) return font.lineSpacing;
  return 0;
};

export const GenerateFontHalfRowLookupTable = (runtime: TextRuntime, fgColor: number, bgColor: number, shadowColor: number): void => {
  runtime.textColors = [fgColor, bgColor, shadowColor];
  runtime.operations.push(`GenerateFontHalfRowLookupTable(${fgColor},${bgColor},${shadowColor})`);
};

export const SaveTextColors = (runtime: TextRuntime): [number, number, number] => [...runtime.textColors];
export const RestoreTextColors = (runtime: TextRuntime, colors: [number, number, number]): void => { runtime.textColors = [...colors]; };
export const GetLastTextColor = (runtime: TextRuntime, colorType: number): number => runtime.textColors[colorType] ?? 0;
export const CopyGlyphToWindow = (runtime: TextRuntime, printer: TextPrinter): void => {
  runtime.operations.push(`CopyGlyphToWindow(${printer.printerTemplate.windowId},${runtime.gGlyphInfo.fontId},${runtime.gGlyphInfo.glyphId})`);
};
export const ClearTextSpan = (runtime: TextRuntime, printer: TextPrinter, width: number): void => {
  runtime.operations.push(`ClearTextSpan(${printer.printerTemplate.windowId},${width})`);
};

const fillGlyphPixels = (runtime: TextRuntime, value: number): void => {
  runtime.gGlyphInfo.pixels.fill(value & 0xff);
};

const setGlyph = (runtime: TextRuntime, fontId: number, glyphId: number, isJapanese: boolean, width: number, height: number): void => {
  runtime.gGlyphInfo.fontId = fontId;
  runtime.gGlyphInfo.glyphId = glyphId;
  runtime.gGlyphInfo.isJapanese = isJapanese;
  runtime.gGlyphInfo.width = width;
  runtime.gGlyphInfo.height = height;
  fillGlyphPixels(runtime, glyphId);
};

export const DecompressGlyph_Small = (runtime: TextRuntime, glyphId: number, isJapanese: boolean): void =>
  setGlyph(runtime, FONT_SMALL, glyphId, isJapanese, isJapanese ? 8 : sFontSmallLatinGlyphWidths[glyphId] ?? 0, isJapanese ? 12 : 13);

export const DecompressGlyph_NormalCopy1 = (runtime: TextRuntime, glyphId: number, isJapanese: boolean): void =>
  setGlyph(runtime, FONT_NORMAL_COPY_1, glyphId, isJapanese, isJapanese ? 8 : sFontNormalCopy1LatinGlyphWidths[glyphId] ?? 0, isJapanese ? 16 : 14);

export const DecompressGlyph_Normal = (runtime: TextRuntime, glyphId: number, isJapanese: boolean): void => {
  if (glyphId === 0) {
    const lastColor = GetLastTextColor(runtime, 2);
    setGlyph(runtime, FONT_NORMAL, glyphId, isJapanese, isJapanese ? 10 : sFontNormalLatinGlyphWidths[0]!, isJapanese ? 12 : 14);
    runtime.gGlyphInfo.pixels.fill(lastColor | (lastColor << 4));
  } else {
    setGlyph(runtime, FONT_NORMAL, glyphId, isJapanese, isJapanese ? sFontNormalJapaneseGlyphWidths[glyphId] ?? 0 : sFontNormalLatinGlyphWidths[glyphId] ?? 0, isJapanese ? 12 : 14);
  }
};

export const DecompressGlyph_NormalCopy2 = (runtime: TextRuntime, glyphId: number, isJapanese: boolean): void => {
  if (isJapanese) setGlyph(runtime, FONT_NORMAL_COPY_2, glyphId, true, 10, 12);
  else DecompressGlyph_Normal(runtime, glyphId, false);
};

export const DecompressGlyph_Male = (runtime: TextRuntime, glyphId: number, isJapanese: boolean): void =>
  setGlyph(runtime, FONT_MALE, glyphId, isJapanese, isJapanese ? (glyphId === 0 ? 10 : sFontMaleJapaneseGlyphWidths[glyphId] ?? 0) : sFontMaleLatinGlyphWidths[glyphId] ?? 0, isJapanese ? 12 : 14);

export const DecompressGlyph_Female = (runtime: TextRuntime, glyphId: number, isJapanese: boolean): void =>
  setGlyph(runtime, FONT_FEMALE, glyphId, isJapanese, isJapanese ? (glyphId === 0 ? 10 : sFontFemaleJapaneseGlyphWidths[glyphId] ?? 0) : sFontFemaleLatinGlyphWidths[glyphId] ?? 0, isJapanese ? 12 : 14);

export const DecompressGlyph_Bold = (runtime: TextRuntime, glyphId: number): void =>
  setGlyph(runtime, FONT_BOLD, glyphId, true, 8, 12);

export const GetGlyphWidth_Small = (glyphId: number, isJapanese: boolean): number => isJapanese ? 8 : sFontSmallLatinGlyphWidths[glyphId] ?? 0;
export const GetGlyphWidth_NormalCopy1 = (glyphId: number, isJapanese: boolean): number => isJapanese ? 8 : sFontNormalCopy1LatinGlyphWidths[glyphId] ?? 0;
export const GetGlyphWidth_Normal = (glyphId: number, isJapanese: boolean): number => isJapanese ? (glyphId === 0 ? 10 : sFontNormalJapaneseGlyphWidths[glyphId] ?? 0) : sFontNormalLatinGlyphWidths[glyphId] ?? 0;
export const GetGlyphWidth_NormalCopy2 = (glyphId: number, isJapanese: boolean): number => isJapanese ? 10 : sFontNormalLatinGlyphWidths[glyphId] ?? 0;
export const GetGlyphWidth_Male = (glyphId: number, isJapanese: boolean): number => isJapanese ? (glyphId === 0 ? 10 : sFontMaleJapaneseGlyphWidths[glyphId] ?? 0) : sFontMaleLatinGlyphWidths[glyphId] ?? 0;
export const GetGlyphWidth_Female = (glyphId: number, isJapanese: boolean): number => isJapanese ? (glyphId === 0 ? 10 : sFontFemaleJapaneseGlyphWidths[glyphId] ?? 0) : sFontFemaleLatinGlyphWidths[glyphId] ?? 0;
export const GetGlyphWidth_Braille = (): number => 8;

export const GetFontWidthFunc = (glyphId: number): ((glyphId: number, isJapanese: boolean) => number) | null => {
  if (glyphId === FONT_SMALL) return GetGlyphWidth_Small;
  if (glyphId === FONT_NORMAL_COPY_1) return GetGlyphWidth_NormalCopy1;
  if (glyphId === FONT_NORMAL) return GetGlyphWidth_Normal;
  if (glyphId === FONT_NORMAL_COPY_2) return GetGlyphWidth_NormalCopy2;
  if (glyphId === FONT_MALE) return GetGlyphWidth_Male;
  if (glyphId === FONT_FEMALE) return GetGlyphWidth_Female;
  if (glyphId === FONT_BRAILLE) return GetGlyphWidth_Braille;
  return null;
};

export const FontFunc_Small = (runtime: TextRuntime, printer: TextPrinter): number => {
  if (!printer.sub.hasGlyphIdBeenSet) { printer.sub.glyphId = FONT_SMALL; printer.sub.hasGlyphIdBeenSet = true; }
  return RenderText(runtime, printer);
};
export const FontFunc_NormalCopy1 = (runtime: TextRuntime, printer: TextPrinter): number => {
  if (!printer.sub.hasGlyphIdBeenSet) { printer.sub.glyphId = FONT_NORMAL_COPY_1; printer.sub.hasGlyphIdBeenSet = true; }
  return RenderText(runtime, printer);
};
export const FontFunc_Normal = (runtime: TextRuntime, printer: TextPrinter): number => {
  if (!printer.sub.hasGlyphIdBeenSet) { printer.sub.glyphId = FONT_NORMAL; printer.sub.hasGlyphIdBeenSet = true; }
  return RenderText(runtime, printer);
};
export const FontFunc_NormalCopy2 = (runtime: TextRuntime, printer: TextPrinter): number => {
  if (!printer.sub.hasGlyphIdBeenSet) { printer.sub.glyphId = FONT_NORMAL_COPY_2; printer.sub.hasGlyphIdBeenSet = true; }
  return RenderText(runtime, printer);
};
export const FontFunc_Male = (runtime: TextRuntime, printer: TextPrinter): number => {
  if (!printer.sub.hasGlyphIdBeenSet) { printer.sub.glyphId = FONT_MALE; printer.sub.hasGlyphIdBeenSet = true; }
  return RenderText(runtime, printer);
};
export const FontFunc_Female = (runtime: TextRuntime, printer: TextPrinter): number => {
  if (!printer.sub.hasGlyphIdBeenSet) { printer.sub.glyphId = FONT_FEMALE; printer.sub.hasGlyphIdBeenSet = true; }
  return RenderText(runtime, printer);
};

export const TextPrinterInitDownArrowCounters = (runtime: TextRuntime, printer: TextPrinter): void => {
  if (runtime.gTextFlags.autoScroll) printer.sub.autoScrollDelay = 0;
  else { printer.sub.downArrowYPosIdx = 0; printer.sub.downArrowDelay = 0; }
};

export const TextPrinterDrawDownArrow = (runtime: TextRuntime, printer: TextPrinter): void => {
  if (runtime.gTextFlags.autoScroll) return;
  if (printer.sub.downArrowDelay !== 0) printer.sub.downArrowDelay--;
  else {
    runtime.operations.push(`FillWindowPixelRect(${printer.printerTemplate.windowId},${printer.printerTemplate.bgColor * 0x11},${printer.printerTemplate.currentX},${printer.printerTemplate.currentY},10,12)`);
    runtime.operations.push(`BlitDownArrow(${runtime.gTextFlags.useAlternateDownArrow ? DARK_DOWN_ARROW_OFFSET : 0},${sDownArrowYCoords[printer.sub.downArrowYPosIdx]})`);
    runtime.operations.push(`CopyWindowToVram(${printer.printerTemplate.windowId},2)`);
    printer.sub.downArrowDelay = CURSOR_DELAY;
    printer.sub.downArrowYPosIdx = (printer.sub.downArrowYPosIdx + 1) & 3;
  }
};

export const TextPrinterClearDownArrow = (runtime: TextRuntime, printer: TextPrinter): void => {
  runtime.operations.push(`FillWindowPixelRect(${printer.printerTemplate.windowId},${printer.printerTemplate.bgColor * 0x11},${printer.printerTemplate.currentX},${printer.printerTemplate.currentY},10,12)`);
  runtime.operations.push(`CopyWindowToVram(${printer.printerTemplate.windowId},2)`);
};

export const TextPrinterWaitAutoMode = (runtime: TextRuntime, printer: TextPrinter): boolean => {
  const delay = runtime.questLogState === QL_STATE_PLAYBACK ? 50 : 120;
  if (printer.sub.autoScrollDelay === delay) return true;
  printer.sub.autoScrollDelay++;
  return false;
};

export const TextPrinterWaitWithDownArrow = (runtime: TextRuntime, printer: TextPrinter): boolean => {
  if (runtime.gTextFlags.autoScroll) return TextPrinterWaitAutoMode(runtime, printer);
  TextPrinterDrawDownArrow(runtime, printer);
  if (joyNew(runtime, A_BUTTON | B_BUTTON)) {
    runtime.operations.push('PlaySE(SE_SELECT)');
    return true;
  }
  return false;
};

export const TextPrinterWait = (runtime: TextRuntime, printer: TextPrinter): boolean => {
  if (runtime.gTextFlags.autoScroll) return TextPrinterWaitAutoMode(runtime, printer);
  if (joyNew(runtime, A_BUTTON | B_BUTTON)) {
    runtime.operations.push('PlaySE(SE_SELECT)');
    return true;
  }
  return false;
};

export const DrawDownArrow = (runtime: TextRuntime, windowId: number, x: number, y: number, bgColor: number, drawArrow: boolean, state: { counter: number; yCoordIndex: number }): void => {
  if (state.counter !== 0) state.counter--;
  else {
    runtime.operations.push(`FillWindowPixelRect(${windowId},${bgColor * 0x11},${x},${y},10,12)`);
    if (!drawArrow) {
      runtime.operations.push(`BlitDownArrow(${runtime.gTextFlags.useAlternateDownArrow ? DARK_DOWN_ARROW_OFFSET : 0},${sDownArrowYCoords[state.yCoordIndex & 3]})`);
      runtime.operations.push(`CopyWindowToVram(${windowId},2)`);
      state.counter = CURSOR_DELAY;
      state.yCoordIndex++;
    }
  }
};

const decompressForGlyph = (runtime: TextRuntime, glyphId: number, currChar: number, japanese: boolean): void => {
  if (glyphId === FONT_SMALL) DecompressGlyph_Small(runtime, currChar, japanese);
  else if (glyphId === FONT_NORMAL_COPY_1) DecompressGlyph_NormalCopy1(runtime, currChar, japanese);
  else if (glyphId === FONT_NORMAL) DecompressGlyph_Normal(runtime, currChar, japanese);
  else if (glyphId === FONT_NORMAL_COPY_2) DecompressGlyph_NormalCopy2(runtime, currChar, japanese);
  else if (glyphId === FONT_MALE) DecompressGlyph_Male(runtime, currChar, japanese);
  else if (glyphId === FONT_FEMALE) DecompressGlyph_Female(runtime, currChar, japanese);
};

export const DrawKeypadIcon = (runtime: TextRuntime, windowId: number, keypadIconId: number, x: number, y: number): number => {
  const icon = sKeypadIcons[keypadIconId] ?? sKeypadIcons[0]!;
  runtime.operations.push(`BlitKeypadIcon(${windowId},${keypadIconId},${x},${y},${icon.width},${icon.height})`);
  return icon.width;
};
export const GetKeypadIconTileOffset = (keypadIconId: number): number => sKeypadIcons[keypadIconId]?.tileOffset ?? 0;
export const GetKeypadIconWidth = (keypadIconId: number): number => sKeypadIcons[keypadIconId]?.width ?? 0;
export const GetKeypadIconHeight = (keypadIconId: number): number => sKeypadIcons[keypadIconId]?.height ?? 0;

export const RenderText = (runtime: TextRuntime, printer: TextPrinter): number => {
  const sub = printer.sub;
  const tpl = printer.printerTemplate;
  let currChar: number;
  let width: number;
  let widthHelper: number;
  switch (printer.state) {
    case RENDER_STATE_HANDLE_CHAR:
      if (joyHeld(runtime, A_BUTTON | B_BUTTON) && sub.hasPrintBeenSpedUp) printer.delayCounter = 0;
      if (printer.delayCounter && printer.textSpeed) {
        printer.delayCounter--;
        if (runtime.gTextFlags.canABSpeedUpPrint && joyNew(runtime, A_BUTTON | B_BUTTON)) {
          sub.hasPrintBeenSpedUp = true;
          printer.delayCounter = 0;
        }
        return RENDER_UPDATE;
      }
      printer.delayCounter = runtime.gTextFlags.autoScroll ? 1 : printer.textSpeed;
      currChar = readChar(printer);
      switch (currChar) {
        case CHAR_NEWLINE:
          tpl.currentX = tpl.x;
          tpl.currentY += runtime.gFonts[tpl.fontId]!.maxLetterHeight + tpl.lineSpacing;
          return RENDER_REPEAT;
        case PLACEHOLDER_BEGIN:
          readChar(printer);
          return RENDER_REPEAT;
        case EXT_CTRL_CODE_BEGIN:
          currChar = readChar(printer);
          switch (currChar) {
            case EXT_CTRL_CODE_COLOR:
              tpl.fgColor = readChar(printer);
              GenerateFontHalfRowLookupTable(runtime, tpl.fgColor, tpl.bgColor, tpl.shadowColor);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_HIGHLIGHT:
              tpl.bgColor = readChar(printer);
              GenerateFontHalfRowLookupTable(runtime, tpl.fgColor, tpl.bgColor, tpl.shadowColor);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_SHADOW:
              tpl.shadowColor = readChar(printer);
              GenerateFontHalfRowLookupTable(runtime, tpl.fgColor, tpl.bgColor, tpl.shadowColor);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW:
              tpl.fgColor = readChar(printer); tpl.bgColor = readChar(printer); tpl.shadowColor = readChar(printer);
              GenerateFontHalfRowLookupTable(runtime, tpl.fgColor, tpl.bgColor, tpl.shadowColor);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_PALETTE:
              readChar(printer); return RENDER_REPEAT;
            case EXT_CTRL_CODE_FONT:
              sub.glyphId = readChar(printer); return RENDER_REPEAT;
            case EXT_CTRL_CODE_RESET_FONT:
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_PAUSE:
              printer.delayCounter = readChar(printer); printer.state = RENDER_STATE_PAUSE; return RENDER_REPEAT;
            case EXT_CTRL_CODE_PAUSE_UNTIL_PRESS:
              printer.state = RENDER_STATE_WAIT; if (runtime.gTextFlags.autoScroll) sub.autoScrollDelay = 0; return RENDER_UPDATE;
            case EXT_CTRL_CODE_WAIT_SE:
              printer.state = RENDER_STATE_WAIT_SE; return RENDER_UPDATE;
            case EXT_CTRL_CODE_PLAY_BGM:
              currChar = readChar(printer) | (readChar(printer) << 8);
              if (!runtime.qlPlaybackState) runtime.operations.push(`PlayBGM(${currChar})`);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_PLAY_SE:
              currChar = readChar(printer) | (readChar(printer) << 8);
              runtime.operations.push(`PlaySE(${currChar})`);
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_ESCAPE:
              readChar(printer);
              currChar = peekChar(printer);
              break;
            case EXT_CTRL_CODE_SHIFT_RIGHT:
              tpl.currentX = tpl.x + readChar(printer); return RENDER_REPEAT;
            case EXT_CTRL_CODE_SHIFT_DOWN:
              tpl.currentY = tpl.y + readChar(printer); return RENDER_REPEAT;
            case EXT_CTRL_CODE_FILL_WINDOW:
              runtime.operations.push(`FillWindowPixelBuffer(${tpl.windowId},${tpl.bgColor * 0x11})`); return RENDER_REPEAT;
            case EXT_CTRL_CODE_PAUSE_MUSIC:
              runtime.operations.push('m4aMPlayStop(BGM)'); return RENDER_REPEAT;
            case EXT_CTRL_CODE_RESUME_MUSIC:
              runtime.operations.push('m4aMPlayContinue(BGM)'); return RENDER_REPEAT;
            case EXT_CTRL_CODE_CLEAR:
              width = readChar(printer);
              if (width > 0) { ClearTextSpan(runtime, printer, width); tpl.currentX += width; return RENDER_PRINT; }
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_SKIP:
              tpl.currentX = tpl.x + readChar(printer); return RENDER_REPEAT;
            case EXT_CTRL_CODE_CLEAR_TO:
              widthHelper = readChar(printer) + tpl.x;
              width = widthHelper - tpl.currentX;
              if (width > 0) { ClearTextSpan(runtime, printer, width); tpl.currentX += width; return RENDER_PRINT; }
              return RENDER_REPEAT;
            case EXT_CTRL_CODE_MIN_LETTER_SPACING:
              printer.minLetterSpacing = readChar(printer); return RENDER_REPEAT;
            case EXT_CTRL_CODE_JPN:
              printer.japanese = true; return RENDER_REPEAT;
            case EXT_CTRL_CODE_ENG:
              printer.japanese = false; return RENDER_REPEAT;
          }
          break;
        case CHAR_PROMPT_CLEAR:
          printer.state = RENDER_STATE_CLEAR; TextPrinterInitDownArrowCounters(runtime, printer); return RENDER_UPDATE;
        case CHAR_PROMPT_SCROLL:
          printer.state = RENDER_STATE_SCROLL_START; TextPrinterInitDownArrowCounters(runtime, printer); return RENDER_UPDATE;
        case CHAR_EXTRA_SYMBOL:
          currChar = readChar(printer) | 0x100; break;
        case CHAR_KEYPAD_ICON:
          currChar = readChar(printer);
          runtime.gGlyphInfo.width = DrawKeypadIcon(runtime, tpl.windowId, currChar, tpl.currentX, tpl.currentY);
          tpl.currentX += runtime.gGlyphInfo.width + tpl.letterSpacing;
          return RENDER_PRINT;
        case EOS:
          return RENDER_FINISH;
      }
      decompressForGlyph(runtime, sub.glyphId, currChar, printer.japanese);
      CopyGlyphToWindow(runtime, printer);
      if (printer.minLetterSpacing) {
        tpl.currentX += runtime.gGlyphInfo.width;
        width = printer.minLetterSpacing - runtime.gGlyphInfo.width;
        if (width > 0) { ClearTextSpan(runtime, printer, width); tpl.currentX += width; }
      } else if (printer.japanese) tpl.currentX += runtime.gGlyphInfo.width + tpl.letterSpacing;
      else tpl.currentX += runtime.gGlyphInfo.width;
      return RENDER_PRINT;
    case RENDER_STATE_WAIT:
      if (TextPrinterWait(runtime, printer)) printer.state = RENDER_STATE_HANDLE_CHAR;
      return RENDER_UPDATE;
    case RENDER_STATE_CLEAR:
      if (TextPrinterWaitWithDownArrow(runtime, printer)) {
        runtime.operations.push(`FillWindowPixelBuffer(${tpl.windowId},${tpl.bgColor * 0x11})`);
        tpl.currentX = tpl.x; tpl.currentY = tpl.y; printer.state = RENDER_STATE_HANDLE_CHAR;
      }
      return RENDER_UPDATE;
    case RENDER_STATE_SCROLL_START:
      if (TextPrinterWaitWithDownArrow(runtime, printer)) {
        TextPrinterClearDownArrow(runtime, printer);
        printer.scrollDistance = runtime.gFonts[tpl.fontId]!.maxLetterHeight + tpl.lineSpacing;
        tpl.currentX = tpl.x;
        printer.state = RENDER_STATE_SCROLL;
      }
      return RENDER_UPDATE;
    case RENDER_STATE_SCROLL:
      if (printer.scrollDistance) {
        const speed = sWindowVerticalScrollSpeeds[runtime.optionsTextSpeed] ?? 2;
        const amount = printer.scrollDistance < speed ? printer.scrollDistance : speed;
        runtime.operations.push(`ScrollWindow(${tpl.windowId},0,${amount},${tpl.bgColor * 0x11})`);
        printer.scrollDistance -= amount;
        runtime.operations.push(`CopyWindowToVram(${tpl.windowId},COPYWIN_GFX)`);
      } else printer.state = RENDER_STATE_HANDLE_CHAR;
      return RENDER_UPDATE;
    case RENDER_STATE_WAIT_SE:
      if (!runtime.sePlaying) printer.state = RENDER_STATE_HANDLE_CHAR;
      return RENDER_UPDATE;
    case RENDER_STATE_PAUSE:
      if (printer.delayCounter !== 0) printer.delayCounter--;
      else printer.state = RENDER_STATE_HANDLE_CHAR;
      return RENDER_UPDATE;
  }
  return RENDER_FINISH;
};

export const GetStringWidth = (runtime: TextRuntime, fontId: number, str: number[], letterSpacing: number): number => {
  let isJapanese = false;
  let minGlyphWidth = 0;
  let func = GetFontWidthFunc(fontId);
  if (func === null) return 0;
  let localLetterSpacing = letterSpacing === -1 ? GetFontAttribute(runtime, fontId, FONTATTR_LETTER_SPACING) : letterSpacing;
  let width = 0;
  let lineWidth = 0;
  let bufferPointer: number[] | null = null;
  for (let i = 0; (str[i] ?? EOS) !== EOS; i++) {
    switch (str[i]) {
      case CHAR_NEWLINE:
        if (lineWidth > width) width = lineWidth;
        lineWidth = 0;
        break;
      case PLACEHOLDER_BEGIN:
        i++;
        if (str[i] === PLACEHOLDER_ID_STRING_VAR_1) bufferPointer = runtime.gStringVar1;
        else if (str[i] === PLACEHOLDER_ID_STRING_VAR_2) bufferPointer = runtime.gStringVar2;
        else if (str[i] === PLACEHOLDER_ID_STRING_VAR_3) bufferPointer = runtime.gStringVar3;
        else return 0;
      // fallthrough
      case CHAR_DYNAMIC: {
        if (bufferPointer === null) bufferPointer = runtime.dynamicPlaceholders.get(str[++i] ?? 0) ?? [EOS];
        for (let j = 0; (bufferPointer[j] ?? EOS) !== EOS; j++) {
          let glyphWidth = func(bufferPointer[j]!, isJapanese);
          if (minGlyphWidth > 0) lineWidth += minGlyphWidth > glyphWidth ? minGlyphWidth : glyphWidth;
          else lineWidth += isJapanese ? glyphWidth + localLetterSpacing : glyphWidth;
        }
        bufferPointer = null;
        break;
      }
      case CHAR_PROMPT_SCROLL:
      case CHAR_PROMPT_CLEAR:
        break;
      case EXT_CTRL_CODE_BEGIN:
        i++;
        switch (str[i]) {
          case EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW: i++;
          // fallthrough
          case EXT_CTRL_CODE_PLAY_BGM:
          case EXT_CTRL_CODE_PLAY_SE: i++;
          // fallthrough
          case EXT_CTRL_CODE_COLOR:
          case EXT_CTRL_CODE_HIGHLIGHT:
          case EXT_CTRL_CODE_SHADOW:
          case EXT_CTRL_CODE_PALETTE:
          case EXT_CTRL_CODE_PAUSE:
          case EXT_CTRL_CODE_ESCAPE:
          case EXT_CTRL_CODE_SHIFT_RIGHT:
          case EXT_CTRL_CODE_SHIFT_DOWN:
            i++;
            break;
          case EXT_CTRL_CODE_FONT:
            i++;
            func = GetFontWidthFunc(str[i] ?? 0);
            if (func === null) return 0;
            if (letterSpacing === -1) localLetterSpacing = GetFontAttribute(runtime, str[i] ?? 0, FONTATTR_LETTER_SPACING);
            break;
          case EXT_CTRL_CODE_CLEAR:
            lineWidth += str[++i] ?? 0;
            break;
          case EXT_CTRL_CODE_SKIP:
            lineWidth = str[++i] ?? 0;
            break;
          case EXT_CTRL_CODE_CLEAR_TO:
            i++;
            if ((str[i] ?? 0) > lineWidth) lineWidth = str[i] ?? 0;
            break;
          case EXT_CTRL_CODE_MIN_LETTER_SPACING:
            minGlyphWidth = str[++i] ?? 0;
            break;
          case EXT_CTRL_CODE_JPN:
            isJapanese = true;
            break;
          case EXT_CTRL_CODE_ENG:
            isJapanese = false;
            break;
        }
        break;
      case CHAR_KEYPAD_ICON:
      case CHAR_EXTRA_SYMBOL: {
        let glyphWidth = str[i] === CHAR_EXTRA_SYMBOL ? func((str[++i] ?? 0) | 0x100, isJapanese) : GetKeypadIconWidth(str[++i] ?? 0);
        if (minGlyphWidth > 0 && glyphWidth < minGlyphWidth) glyphWidth = minGlyphWidth;
        else if (minGlyphWidth === 0 && isJapanese) glyphWidth += localLetterSpacing;
        lineWidth += glyphWidth;
        break;
      }
      default: {
        let glyphWidth = func(str[i] ?? 0, isJapanese);
        if (minGlyphWidth > 0) {
          if (glyphWidth < minGlyphWidth) glyphWidth = minGlyphWidth;
          lineWidth += glyphWidth;
        } else {
          if (fontId !== FONT_BRAILLE && isJapanese) glyphWidth += localLetterSpacing;
          lineWidth += glyphWidth;
        }
        break;
      }
    }
  }
  return lineWidth > width ? lineWidth : width;
};

export const GetStringWidthFixedWidthFont = (runtime: TextRuntime, str: number[], fontId: number, letterSpacing: number): number => {
  const lineWidths = Array.from({ length: 8 }, () => 0);
  let width = 0;
  let line = 0;
  let strPos = 0;
  let temp = 0;

  do {
    temp = str[strPos++] ?? EOS;
    switch (temp) {
      case CHAR_NEWLINE:
      case EOS:
        lineWidths[line] = width & 0xff;
        width = 0;
        line = (line + 1) & 0xff;
        break;
      case EXT_CTRL_CODE_BEGIN: {
        const temp2 = str[strPos++] ?? EOS;
        switch (temp2) {
          case EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW:
            strPos++;
          // fallthrough
          case EXT_CTRL_CODE_PLAY_BGM:
          case EXT_CTRL_CODE_PLAY_SE:
            strPos++;
          // fallthrough
          case EXT_CTRL_CODE_COLOR:
          case EXT_CTRL_CODE_HIGHLIGHT:
          case EXT_CTRL_CODE_SHADOW:
          case EXT_CTRL_CODE_PALETTE:
          case EXT_CTRL_CODE_FONT:
          case EXT_CTRL_CODE_PAUSE:
          case EXT_CTRL_CODE_ESCAPE:
          case EXT_CTRL_CODE_SHIFT_RIGHT:
          case EXT_CTRL_CODE_SHIFT_DOWN:
          case EXT_CTRL_CODE_CLEAR:
          case EXT_CTRL_CODE_SKIP:
          case EXT_CTRL_CODE_CLEAR_TO:
          case EXT_CTRL_CODE_MIN_LETTER_SPACING:
            strPos++;
            break;
          default:
            break;
        }
        break;
      }
      case CHAR_DYNAMIC:
      case PLACEHOLDER_BEGIN:
        strPos++;
        break;
      case CHAR_PROMPT_SCROLL:
      case CHAR_PROMPT_CLEAR:
        break;
      case CHAR_KEYPAD_ICON:
      case CHAR_EXTRA_SYMBOL:
        strPos++;
      // fallthrough
      default:
        width = (width + 1) & 0xff;
        break;
    }
  } while (temp !== EOS);

  width = 0;
  for (strPos = 0; strPos < lineWidths.length; strPos++) {
    if (width < lineWidths[strPos]!) width = lineWidths[strPos]!;
  }

  return (((GetFontAttribute(runtime, fontId, FONTATTR_MAX_LETTER_WIDTH) + letterSpacing) & 0xff) * width) | 0;
};

export const RenderTextHandleBold = (runtime: TextRuntime, pixels: number[], fontId: number, str: number[]): number => {
  void fontId;
  const colorBackup = SaveTextColors(runtime);
  let fgColor = 1;
  let bgColor = 0;
  let shadowColor = 3;
  GenerateFontHalfRowLookupTable(runtime, 1, 0, 3);
  for (let pos = 0; ; ) {
    const temp = str[pos++] ?? EOS;
    if (temp === EXT_CTRL_CODE_BEGIN) {
      const temp2 = str[pos++] ?? EOS;
      if (temp2 === EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW) { fgColor = str[pos++] ?? 0; bgColor = str[pos++] ?? 0; shadowColor = str[pos++] ?? 0; GenerateFontHalfRowLookupTable(runtime, fgColor, bgColor, shadowColor); continue; }
      if (temp2 === EXT_CTRL_CODE_COLOR) { fgColor = str[pos++] ?? 0; GenerateFontHalfRowLookupTable(runtime, fgColor, bgColor, shadowColor); continue; }
      if (temp2 === EXT_CTRL_CODE_HIGHLIGHT) { bgColor = str[pos++] ?? 0; GenerateFontHalfRowLookupTable(runtime, fgColor, bgColor, shadowColor); continue; }
      if (temp2 === EXT_CTRL_CODE_SHADOW) { shadowColor = str[pos++] ?? 0; GenerateFontHalfRowLookupTable(runtime, fgColor, bgColor, shadowColor); continue; }
      if (temp2 === EXT_CTRL_CODE_FONT) pos++;
      else if ([EXT_CTRL_CODE_PLAY_BGM, EXT_CTRL_CODE_PLAY_SE].includes(temp2)) pos += 2;
      else if ([EXT_CTRL_CODE_PALETTE, EXT_CTRL_CODE_PAUSE, EXT_CTRL_CODE_ESCAPE, EXT_CTRL_CODE_SHIFT_RIGHT, EXT_CTRL_CODE_SHIFT_DOWN, EXT_CTRL_CODE_CLEAR, EXT_CTRL_CODE_SKIP, EXT_CTRL_CODE_CLEAR_TO, EXT_CTRL_CODE_MIN_LETTER_SPACING].includes(temp2)) pos++;
    } else if ([CHAR_DYNAMIC, CHAR_KEYPAD_ICON, CHAR_EXTRA_SYMBOL, PLACEHOLDER_BEGIN].includes(temp)) pos++;
    else if (![CHAR_PROMPT_SCROLL, CHAR_PROMPT_CLEAR, CHAR_NEWLINE, EOS].includes(temp)) {
      DecompressGlyph_Bold(runtime, temp);
      pixels.push(...runtime.gGlyphInfo.pixels.slice(0, 0x40));
    }
    if (temp === EOS) break;
  }
  RestoreTextColors(runtime, colorBackup);
  return 1;
};

export const SpriteCB_TextCursor = (_runtime: TextRuntime, sprite: TextCursorSprite): void => {
  if (sprite.data[0]) sprite.data[0]--;
  else {
    sprite.data[0] = CURSOR_DELAY;
    switch (sprite.data[1]) {
      case 0: sprite.y2 = 0; break;
      case 1: sprite.y2 = 1; break;
      case 2: sprite.y2 = 2; break;
      case 3:
        sprite.y2 = 1;
        sprite.data[1] = 0;
        return;
    }
    sprite.data[1]++;
  }
};

export const CreateTextCursorSprite = (runtime: TextRuntime, sheetId: number, x: number, y: number, priority: number, subpriority: number): number => {
  runtime.operations.push(`LoadSpriteSheet(${sheetId & 1})`, 'LoadSpritePalette(TAG_CURSOR)');
  const id = runtime.nextSpriteId++;
  runtime.sprites.push({ id, x: x + 3, y: y + 4, priority: priority & 3, subpriority, y2: 0, data: [CURSOR_DELAY, 0], destroyed: false });
  runtime.operations.push(`CreateSprite(TextCursor,${x + 3},${y + 4},${subpriority})`);
  return id;
};

export const DestroyTextCursorSprite = (runtime: TextRuntime, spriteId: number): void => {
  const spr = runtime.sprites.find((entry) => entry.id === spriteId);
  if (spr) spr.destroyed = true;
  runtime.operations.push(`DestroySprite(${spriteId})`, `FreeSpriteTilesByTag(${TAG_CURSOR})`, `FreeSpritePaletteByTag(${TAG_CURSOR})`);
};
