import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  CreateTextCursorSprite,
  CHAR_EXTRA_SYMBOL,
  CHAR_KEYPAD_ICON,
  CHAR_NEWLINE,
  CHAR_PROMPT_CLEAR,
  CURSOR_DELAY,
  DecompressGlyph_Female,
  DecompressGlyph_Normal,
  DestroyTextCursorSprite,
  DrawDownArrow,
  EOS,
  EXT_CTRL_CODE_BEGIN,
  EXT_CTRL_CODE_CLEAR,
  EXT_CTRL_CODE_CLEAR_TO,
  EXT_CTRL_CODE_COLOR,
  EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW,
  EXT_CTRL_CODE_ENG,
  EXT_CTRL_CODE_FILL_WINDOW,
  EXT_CTRL_CODE_FONT,
  EXT_CTRL_CODE_JPN,
  EXT_CTRL_CODE_MIN_LETTER_SPACING,
  EXT_CTRL_CODE_PAUSE,
  EXT_CTRL_CODE_PAUSE_UNTIL_PRESS,
  EXT_CTRL_CODE_PLAY_BGM,
  EXT_CTRL_CODE_PLAY_SE,
  EXT_CTRL_CODE_SHIFT_DOWN,
  EXT_CTRL_CODE_SHIFT_RIGHT,
  EXT_CTRL_CODE_SKIP,
  EXT_CTRL_CODE_WAIT_SE,
  FONT_FEMALE,
  FONT_MALE,
  FONT_NORMAL,
  FONT_SMALL,
  FontFunc_Small,
  GetFontWidthFunc,
  GetGlyphWidth_Female,
  GetGlyphWidth_Normal,
  GetKeypadIconHeight,
  GetKeypadIconTileOffset,
  GetKeypadIconWidth,
  GetStringWidth,
  GetStringWidthFixedWidthFont,
  PLACEHOLDER_BEGIN,
  PLACEHOLDER_ID_STRING_VAR_1,
  RENDER_FINISH,
  RENDER_PRINT,
  RENDER_REPEAT,
  RENDER_STATE_CLEAR,
  RENDER_STATE_HANDLE_CHAR,
  RENDER_STATE_PAUSE,
  RENDER_STATE_SCROLL,
  RENDER_STATE_SCROLL_START,
  RENDER_STATE_WAIT,
  RENDER_STATE_WAIT_SE,
  RENDER_UPDATE,
  RenderText,
  RenderTextHandleBold,
  SpriteCB_TextCursor,
  TextPrinterDrawDownArrow,
  TextPrinterInitDownArrowCounters,
  TextPrinterWait,
  TextPrinterWaitAutoMode,
  TextPrinterWaitWithDownArrow,
  createTextPrinter,
  createTextRuntime,
  sDownArrowYCoords,
  sFontFemaleJapaneseGlyphWidths,
  sFontNormalLatinGlyphWidths,
  sFontSmallLatinGlyphWidths
} from '../src/game/decompText';

describe('decompText', () => {
  test('parses original C width/icon tables and exposes glyph width functions', () => {
    expect(sFontSmallLatinGlyphWidths.slice(0, 12)).toEqual([5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 4]);
    expect(sFontNormalLatinGlyphWidths[0x10]).toBe(8);
    expect(sFontFemaleJapaneseGlyphWidths[0xbc]).toBe(6);
    expect(GetKeypadIconTileOffset(4)).toBe(0x6);
    expect(GetKeypadIconWidth(4)).toBe(24);
    expect(GetKeypadIconHeight(4)).toBe(12);
    expect(GetFontWidthFunc(FONT_NORMAL)?.(0x10, false)).toBe(8);
    expect(GetFontWidthFunc(99)).toBeNull();
  });

  test('FontFunc initializers set glyph IDs once before RenderText', () => {
    const runtime = createTextRuntime();
    const printer = createTextPrinter([0x10, EOS]);

    expect(FontFunc_Small(runtime, printer)).toBe(RENDER_PRINT);
    expect(printer.sub.glyphId).toBe(FONT_SMALL);
    expect(printer.sub.hasGlyphIdBeenSet).toBe(true);

    printer.sub.glyphId = FONT_MALE;
    printer.printerTemplate.currentCharIndex = 0;
    FontFunc_Small(runtime, printer);
    expect(printer.sub.glyphId).toBe(FONT_MALE);
  });

  test('GetStringWidthFixedWidthFont counts fixed-width glyph slots and skips C control payloads', () => {
    const runtime = createTextRuntime();
    const str = [
      0x10,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW, 1, 2, 3,
      CHAR_KEYPAD_ICON, 4,
      CHAR_NEWLINE,
      0x20,
      PLACEHOLDER_BEGIN, PLACEHOLDER_ID_STRING_VAR_1,
      CHAR_PROMPT_CLEAR,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PLAY_SE, 0x78, 0x56,
      CHAR_EXTRA_SYMBOL, 7,
      EOS
    ];

    expect(GetStringWidthFixedWidthFont(runtime, str, FONT_SMALL, 1)).toBe(18);
  });

  test('down arrow counters, wait paths, and standalone DrawDownArrow match C timing', () => {
    const runtime = createTextRuntime();
    const printer = createTextPrinter([EOS]);
    printer.sub.downArrowDelay = 2;

    TextPrinterDrawDownArrow(runtime, printer);
    expect(printer.sub.downArrowDelay).toBe(1);
    TextPrinterDrawDownArrow(runtime, printer);
    TextPrinterDrawDownArrow(runtime, printer);
    expect(printer.sub.downArrowDelay).toBe(CURSOR_DELAY);
    expect(printer.sub.downArrowYPosIdx).toBe(1);
    expect(sDownArrowYCoords).toEqual([0, 16, 32, 16]);

    runtime.pressedButtons = A_BUTTON;
    expect(TextPrinterWait(runtime, printer)).toBe(true);
    expect(runtime.operations).toContain('PlaySE(SE_SELECT)');

    runtime.gTextFlags.autoScroll = true;
    printer.sub.autoScrollDelay = 120;
    expect(TextPrinterWaitAutoMode(runtime, printer)).toBe(true);
    printer.sub.autoScrollDelay = 0;
    TextPrinterInitDownArrowCounters(runtime, printer);
    expect(printer.sub.autoScrollDelay).toBe(0);
    expect(TextPrinterWaitWithDownArrow(runtime, printer)).toBe(false);

    const arrow = { counter: 0, yCoordIndex: 0 };
    DrawDownArrow(runtime, 1, 2, 3, 4, false, arrow);
    expect(arrow.counter).toBe(CURSOR_DELAY);
    expect(arrow.yCoordIndex).toBe(1);
    DrawDownArrow(runtime, 1, 2, 3, 4, true, { counter: 0, yCoordIndex: 0 });
    expect(runtime.operations.at(-1)).toContain('FillWindowPixelRect');
  });

  test('RenderText handles regular glyphs, spacing, keypad icons, newlines, prompts, and EOS', () => {
    const runtime = createTextRuntime();
    const printer = createTextPrinter([0x10, CHAR_NEWLINE, CHAR_KEYPAD_ICON, 4, CHAR_PROMPT_CLEAR, EOS], {
      printerTemplate: {
        ...createTextPrinter([]).printerTemplate,
        currentChar: [0x10, CHAR_NEWLINE, CHAR_KEYPAD_ICON, 4, CHAR_PROMPT_CLEAR, EOS],
        fontId: FONT_NORMAL,
        letterSpacing: 1,
        lineSpacing: 2
      }
    });

    expect(RenderText(runtime, printer)).toBe(RENDER_PRINT);
    expect(printer.printerTemplate.currentX).toBe(GetGlyphWidth_Normal(0x10, false));
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentX).toBe(0);
    expect(printer.printerTemplate.currentY).toBe(16);
    expect(RenderText(runtime, printer)).toBe(RENDER_PRINT);
    expect(printer.printerTemplate.currentX).toBe(25);
    expect(RenderText(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_CLEAR);
    runtime.pressedButtons = A_BUTTON;
    expect(RenderText(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_HANDLE_CHAR);
    expect(RenderText(runtime, printer)).toBe(RENDER_FINISH);
  });

  test('RenderText exact extended-control branches mutate state and coordinates', () => {
    const runtime = createTextRuntime();
    const bytes = [
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR, 4,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW, 5, 6, 7,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_FONT, FONT_FEMALE,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_SHIFT_RIGHT, 9,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_SHIFT_DOWN, 8,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_CLEAR, 3,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_SKIP, 11,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_CLEAR_TO, 15,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_MIN_LETTER_SPACING, 12,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_JPN,
      0,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_ENG,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PLAY_BGM, 0x34, 0x12,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PLAY_SE, 0x78, 0x56,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_FILL_WINDOW,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PAUSE, 2,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_WAIT_SE,
      EOS
    ];
    const printer = createTextPrinter(bytes);

    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.fgColor).toBe(4);
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect([printer.printerTemplate.fgColor, printer.printerTemplate.bgColor, printer.printerTemplate.shadowColor]).toEqual([5, 6, 7]);
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.sub.glyphId).toBe(FONT_FEMALE);
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentX).toBe(9);
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentY).toBe(8);
    expect(RenderText(runtime, printer)).toBe(RENDER_PRINT);
    expect(printer.printerTemplate.currentX).toBe(12);
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentX).toBe(11);
    expect(RenderText(runtime, printer)).toBe(RENDER_PRINT);
    expect(printer.printerTemplate.currentX).toBe(15);
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.minLetterSpacing).toBe(12);
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.japanese).toBe(true);
    expect(RenderText(runtime, printer)).toBe(RENDER_PRINT);
    expect(printer.printerTemplate.currentX).toBe(27);
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.japanese).toBe(false);
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(runtime.operations).toContain('PlayBGM(4660)');
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(runtime.operations).toContain('PlaySE(22136)');
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(RenderText(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.state).toBe(RENDER_STATE_PAUSE);
    expect(RenderText(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.delayCounter).toBe(1);
  });

  test('RenderText wait, scroll, wait-se, pause, delay, and speedup states match the C code', () => {
    const runtime = createTextRuntime({ optionsTextSpeed: 2 });
    const waitPrinter = createTextPrinter([EOS], { state: RENDER_STATE_WAIT });
    expect(RenderText(runtime, waitPrinter)).toBe(RENDER_UPDATE);
    runtime.pressedButtons = B_BUTTON;
    RenderText(runtime, waitPrinter);
    expect(waitPrinter.state).toBe(RENDER_STATE_HANDLE_CHAR);

    const scrollPrinter = createTextPrinter([EOS], { state: RENDER_STATE_SCROLL_START });
    runtime.pressedButtons = A_BUTTON;
    RenderText(runtime, scrollPrinter);
    expect(scrollPrinter.state).toBe(RENDER_STATE_SCROLL);
    expect(scrollPrinter.scrollDistance).toBe(14);
    RenderText(runtime, scrollPrinter);
    expect(scrollPrinter.scrollDistance).toBe(10);

    const sePrinter = createTextPrinter([EOS], { state: RENDER_STATE_WAIT_SE });
    runtime.sePlaying = true;
    RenderText(runtime, sePrinter);
    expect(sePrinter.state).toBe(RENDER_STATE_WAIT_SE);
    runtime.sePlaying = false;
    RenderText(runtime, sePrinter);
    expect(sePrinter.state).toBe(RENDER_STATE_HANDLE_CHAR);

    const delayed = createTextPrinter([0x10, EOS], { textSpeed: 3, delayCounter: 2 });
    runtime.gTextFlags.canABSpeedUpPrint = true;
    runtime.pressedButtons = A_BUTTON;
    expect(RenderText(runtime, delayed)).toBe(RENDER_UPDATE);
    expect(delayed.sub.hasPrintBeenSpedUp).toBe(true);
    runtime.heldButtons = A_BUTTON;
    expect(RenderText(runtime, delayed)).toBe(RENDER_PRINT);
  });

  test('GetStringWidth follows placeholders, dynamic text, font changes, min spacing, Japanese spacing, and line max', () => {
    const runtime = createTextRuntime({
      gStringVar1: [0x10, 0x11, EOS],
      dynamicPlaceholders: new Map([[7, [0x12, 0x13, EOS]]])
    });
    const width = GetStringWidth(runtime, FONT_NORMAL, [
      0x10,
      PLACEHOLDER_BEGIN,  PLACEHOLDER_ID_STRING_VAR_1,
      CHAR_NEWLINE,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_FONT, FONT_SMALL,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_MIN_LETTER_SPACING, 8,
      0x09,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_CLEAR, 5,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_SKIP, 40,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_CLEAR_TO, 45,
      CHAR_KEYPAD_ICON, 4,
      CHAR_EXTRA_SYMBOL, 0x10,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_JPN,
      0x01,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_ENG,
      EOS
    ], -1);

    expect(width).toBe(85);
    expect(GetStringWidth(runtime, 99, [0x10, EOS], 0)).toBe(0);
    expect(GetStringWidth(runtime, FONT_NORMAL, [PLACEHOLDER_BEGIN, 0x99, EOS], 0)).toBe(0);
  });

  test('glyph decompressors, bold renderer, and text cursor sprite mirror metadata/timing', () => {
    const runtime = createTextRuntime();
    DecompressGlyph_Normal(runtime, 0, false);
    expect(runtime.gGlyphInfo).toMatchObject({ fontId: FONT_NORMAL, glyphId: 0, width: sFontNormalLatinGlyphWidths[0], height: 14 });
    expect(runtime.gGlyphInfo.pixels.every((value) => value === 0x33)).toBe(true);

    DecompressGlyph_Female(runtime, 0xbc, true);
    expect(runtime.gGlyphInfo).toMatchObject({ fontId: FONT_FEMALE, glyphId: 0xbc, width: GetGlyphWidth_Female(0xbc, true), height: 12 });

    const pixels: number[] = [];
    expect(RenderTextHandleBold(runtime, pixels, FONT_NORMAL, [
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR, 4,
      0x22,
      CHAR_KEYPAD_ICON, 1,
      EOS
    ])).toBe(1);
    expect(pixels).toHaveLength(0x40);

    const spriteId = CreateTextCursorSprite(runtime, 3, 10, 20, 7, 2);
    const sprite = runtime.sprites.find((entry) => entry.id === spriteId)!;
    expect(sprite).toMatchObject({ x: 13, y: 24, priority: 3, subpriority: 2 });
    sprite.data[0] = 0;
    SpriteCB_TextCursor(runtime, sprite);
    expect(sprite.y2).toBe(0);
    expect(sprite.data[1]).toBe(1);
    sprite.data[0] = 0;
    sprite.data[1] = 3;
    SpriteCB_TextCursor(runtime, sprite);
    expect(sprite.y2).toBe(1);
    expect(sprite.data[1]).toBe(0);
    DestroyTextCursorSprite(runtime, spriteId);
    expect(sprite.destroyed).toBe(true);
  });
});
