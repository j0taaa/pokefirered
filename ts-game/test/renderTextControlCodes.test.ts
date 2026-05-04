import { describe, expect, test } from 'vitest';
import {
  CHAR_NEWLINE,
  CHAR_PROMPT_CLEAR,
  CHAR_PROMPT_SCROLL,
  CHAR_KEYPAD_ICON,
  COPYWIN_GFX,
  EOS,
  EXT_CTRL_CODE_BEGIN,
  EXT_CTRL_CODE_COLOR,
  EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW,
  EXT_CTRL_CODE_ESCAPE,
  EXT_CTRL_CODE_FILL_WINDOW,
  EXT_CTRL_CODE_FONT,
  EXT_CTRL_CODE_HIGHLIGHT,
  EXT_CTRL_CODE_PAUSE,
  EXT_CTRL_CODE_PAUSE_UNTIL_PRESS,
  EXT_CTRL_CODE_PLAY_BGM,
  EXT_CTRL_CODE_PLAY_SE,
  EXT_CTRL_CODE_RESET_FONT,
  EXT_CTRL_CODE_SHADOW,
  EXT_CTRL_CODE_SHIFT_DOWN,
  EXT_CTRL_CODE_SHIFT_RIGHT,
  EXT_CTRL_CODE_WAIT_SE,
  OPTIONS_TEXT_SPEED_FAST,
  OPTIONS_TEXT_SPEED_MID,
  OPTIONS_TEXT_SPEED_SLOW,
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
  SCROLL_DISTANCES,
  createBrailleTextPrinter,
  createBrailleTextRuntime,
  decompressGlyphBraille,
  fontFuncBraille,
  getGlyphWidthBraille
} from '../src/rendering/decompBrailleText';

describe('text control code rendering parity', () => {
  /** Hidden-item text flow: "put the PEARL" sequence uses EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW
   *  to switch text color mid-string, then CHAR_PROMPT_CLEAR to advance the page. */
  test('hidden-item text flow: color/highlight/shadow control codes advance cursor and emit lookup tables', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW, 1, 2, 3,
      0x41, 0x42,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR, 4,
      0x43,
      CHAR_PROMPT_CLEAR,
      0x44,
      EOS
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(runtime.generatedLookupTables).toHaveLength(1);
    expect(runtime.generatedLookupTables[0]).toEqual({ fg: 1, bg: 2, shadow: 3 });

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(runtime.glyphInfo.glyph).toBe(0x41);
    expect(runtime.copiedGlyphs).toBe(1);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(runtime.copiedGlyphs).toBe(2);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(runtime.generatedLookupTables).toHaveLength(2);
    expect(runtime.generatedLookupTables[1]).toEqual({ fg: 4, bg: 2, shadow: 3 });

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_CLEAR);
    expect(runtime.downArrowInitCount).toBe(1);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_HANDLE_CHAR);
    expect(runtime.filledWindows).toEqual([{ windowId: 0, fill: 2 }]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_FINISH);
  });

  test('highlight and shadow control codes individually update template colors', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_HIGHLIGHT, 5,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_SHADOW, 6,
      EOS
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(runtime.generatedLookupTables[0]).toEqual({ fg: 1, bg: 5, shadow: 2 });

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(runtime.generatedLookupTables[1]).toEqual({ fg: 1, bg: 5, shadow: 6 });
  });

  test('font switch and reset font control codes', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_FONT, 2,
      0x10,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_RESET_FONT,
      0x11,
      EOS
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.sub.glyphId).toBe(2);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_FINISH);
  });

  test('escape control code skips one byte and reads the following char', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_ESCAPE, 0x80, 0x42,
      EOS
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(runtime.glyphInfo.glyph).toBe(0x42);
  });

  test('shift right and shift down move cursor position', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_SHIFT_RIGHT, 15,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_SHIFT_DOWN, 7,
      0x20,
      EOS
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentX).toBe(15);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentY).toBe(7);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_FINISH);
  });

  test('fill window clears the window pixel buffer with bgColor', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW, 1, 9, 3,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_FILL_WINDOW,
      EOS
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(runtime.filledWindows).toEqual([{ windowId: 0, fill: 9 }]);
  });

  test('play BGM and play SE skip 2 bytes each', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PLAY_BGM, 0x01, 0x02,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PLAY_SE, 0x03, 0x04,
      EOS
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentCharIndex).toBe(4);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentCharIndex).toBe(8);
  });

test('pause sets delay counter and enters PAUSE state', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PAUSE, 42,
      EOS
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.state).toBe(RENDER_STATE_PAUSE);
    expect(printer.delayCounter).toBe(42);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.delayCounter).toBe(41);
    expect(printer.state).toBe(RENDER_STATE_PAUSE);

    printer.delayCounter = 1;
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.delayCounter).toBe(0);
    expect(printer.state).toBe(RENDER_STATE_PAUSE);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_HANDLE_CHAR);
  });

  test('pause until press enters WAIT state; auto-scroll sets delay to 0', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS,
      EOS
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_WAIT);

    runtime.autoScroll = true;
    const printer2 = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS,
      EOS
    ]);
    expect(fontFuncBraille(runtime, printer2)).toBe(RENDER_UPDATE);
    expect(printer2.state).toBe(RENDER_STATE_WAIT);
    expect(printer2.sub.autoScrollDelay).toBe(0);
  });

  test('wait SE enters WAIT_SE state and exits when sePlaying clears', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_WAIT_SE,
      EOS
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_WAIT_SE);

    runtime.sePlaying = true;
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_WAIT_SE);

    runtime.sePlaying = false;
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_HANDLE_CHAR);
  });

  test('keypad icon skips one byte and returns RENDER_PRINT', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([
      CHAR_KEYPAD_ICON, 0x05,
      EOS
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(printer.printerTemplate.currentCharIndex).toBe(2);
  });

  test('CHAR_PROMPT_SCROLL enters SCROLL_START state and scrolls by maxLetterHeight + lineSpacing', () => {
    const runtime = createBrailleTextRuntime();
    runtime.optionsTextSpeed = OPTIONS_TEXT_SPEED_FAST;
    const printer = createBrailleTextPrinter([CHAR_PROMPT_SCROLL]);
    printer.printerTemplate.lineSpacing = 1;

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_SCROLL_START);
    expect(runtime.downArrowInitCount).toBe(1);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_SCROLL);
    expect(printer.scrollDistance).toBe(17);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(runtime.scrolledWindows.at(-1)).toEqual({ windowId: 0, mode: 0, distance: 4, fill: 0 });
    expect(runtime.copiedWindows.at(-1)).toEqual({ windowId: 0, mode: COPYWIN_GFX });
  });

  test('scroll distances match C SCROLL_DISTANCES array', () => {
    expect(SCROLL_DISTANCES).toEqual([1, 2, 4]);
  });

  test('text speed options match C constants', () => {
    expect(OPTIONS_TEXT_SPEED_SLOW).toBe(0);
    expect(OPTIONS_TEXT_SPEED_MID).toBe(1);
    expect(OPTIONS_TEXT_SPEED_FAST).toBe(2);
  });
});

describe('glyph metrics parity', () => {
  test('braille glyph decompression produces correct source offsets', () => {
    const runtime = createBrailleTextRuntime();

    decompressGlyphBraille(runtime, 0);
    expect(runtime.glyphInfo).toMatchObject({
      glyph: 0,
      width: 16,
      height: 16,
      sourceOffsets: [0x00, 0x08, 0x80, 0x88]
    });

    decompressGlyphBraille(runtime, 1);
    expect(runtime.glyphInfo).toMatchObject({
      glyph: 1,
      width: 16,
      height: 16,
      sourceOffsets: [0x10, 0x18, 0x90, 0x98]
    });

    decompressGlyphBraille(runtime, 0x100);
    expect(runtime.glyphInfo).toMatchObject({
      glyph: 0x100,
      width: 16,
      height: 16,
      sourceOffsets: [0x2000, 0x2008, 0x2080, 0x2088]
    });
  });

  test('braille glyph width is always 16 pixels', () => {
    expect(getGlyphWidthBraille(0, false)).toBe(16);
    expect(getGlyphWidthBraille(1, false)).toBe(16);
    expect(getGlyphWidthBraille(0, true)).toBe(16);
  });

  test('glyph decompression normalizes 16-bit glyph index', () => {
    const runtime = createBrailleTextRuntime();
    decompressGlyphBraille(runtime, 0x100ff);
    expect(runtime.glyphInfo.glyph).toBe(0x00ff);
  });

  test('printer template letterSpacing and lineSpacing advance cursor correctly', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([0x20, 0x21]);
    printer.printerTemplate.letterSpacing = 2;
    printer.printerTemplate.lineSpacing = 3;

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(printer.printerTemplate.currentX).toBe(16 + 2); // width + letterSpacing

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(printer.printerTemplate.currentX).toBe(2 * (16 + 2)); // 2 glyphs
  });

  test('newline advances currentY by maxLetterHeight + lineSpacing and resets currentX', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([0x20, CHAR_NEWLINE, 0x21]);
    printer.printerTemplate.letterSpacing = 2;
    printer.printerTemplate.lineSpacing = 3;
    printer.printerTemplate.x = 10;
    printer.printerTemplate.y = 20;
    printer.printerTemplate.currentX = 10;
    printer.printerTemplate.currentY = 20;

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(printer.printerTemplate.currentX).toBe(10 + 16 + 2);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentX).toBe(10);
    expect(printer.printerTemplate.currentY).toBe(20 + 16 + 3);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_FINISH);
  });
});