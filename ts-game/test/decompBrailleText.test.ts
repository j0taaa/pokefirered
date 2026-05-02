import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  CHAR_EXTRA_SYMBOL,
  CHAR_NEWLINE,
  CHAR_PROMPT_CLEAR,
  CHAR_PROMPT_SCROLL,
  COPYWIN_GFX,
  EOS,
  EXT_CTRL_CODE_BEGIN,
  EXT_CTRL_CODE_COLOR,
  EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW,
  EXT_CTRL_CODE_FILL_WINDOW,
  EXT_CTRL_CODE_PAUSE,
  EXT_CTRL_CODE_PAUSE_UNTIL_PRESS,
  EXT_CTRL_CODE_PLAY_SE,
  EXT_CTRL_CODE_SHIFT_DOWN,
  EXT_CTRL_CODE_SHIFT_RIGHT,
  EXT_CTRL_CODE_WAIT_SE,
  OPTIONS_TEXT_SPEED_FAST,
  PLACEHOLDER_BEGIN,
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
  createBrailleTextPrinter,
  createBrailleTextRuntime,
  decompressGlyphBraille,
  fontFuncBraille,
  getGlyphWidthBraille
} from '../src/rendering/decompBrailleText';

describe('decompBrailleText', () => {
  test('prints glyphs, newlines, placeholders, extra symbols, and EOS like FontFunc_Braille', () => {
    const runtime = createBrailleTextRuntime();
    const printer = createBrailleTextPrinter([0x12, CHAR_NEWLINE, PLACEHOLDER_BEGIN, 0x99, CHAR_EXTRA_SYMBOL, 0x23, EOS]);
    printer.printerTemplate.lineSpacing = 1;
    printer.printerTemplate.letterSpacing = 2;

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(runtime.glyphInfo).toMatchObject({ glyph: 0x12, width: 16, height: 16 });
    expect(printer.printerTemplate.currentX).toBe(18);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentY).toBe(17);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(runtime.glyphInfo.glyph).toBe(0x123);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_FINISH);
  });

  test('delay counter honors A/B speedup and held speedup paths', () => {
    const runtime = createBrailleTextRuntime();
    runtime.newKeys = A_BUTTON;
    const printer = createBrailleTextPrinter([0x10], { textSpeed: 2, delayCounter: 2 });

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.delayCounter).toBe(0);
    expect(printer.sub.hasPrintBeenSpedUp).toBe(true);

    printer.delayCounter = 3;
    runtime.newKeys = 0;
    runtime.heldKeys = A_BUTTON;
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_PRINT);
    expect(printer.delayCounter).toBe(2);
  });

  test('extended color, shift, fill, pause, wait, and sound codes mutate printer state', () => {
    const runtime = createBrailleTextRuntime();
    runtime.autoScroll = true;
    const printer = createBrailleTextPrinter([
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR, 4,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW, 5, 6, 7,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_SHIFT_RIGHT, 9,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_SHIFT_DOWN, 8,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_FILL_WINDOW,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PLAY_SE, 1, 2,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PAUSE, 12,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS,
      EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_WAIT_SE
    ]);

    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(runtime.generatedLookupTables.at(-1)).toEqual({ fg: 4, bg: 0, shadow: 2 });
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(runtime.generatedLookupTables.at(-1)).toEqual({ fg: 5, bg: 6, shadow: 7 });
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentX).toBe(9);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer.printerTemplate.currentY).toBe(8);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(runtime.filledWindows).toEqual([{ windowId: 0, fill: 6 }]);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_REPEAT);
    expect(printer).toMatchObject({ state: RENDER_STATE_PAUSE, delayCounter: 12 });
    printer.state = RENDER_STATE_HANDLE_CHAR;
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_WAIT);
    expect(printer.sub.autoScrollDelay).toBe(0);
    printer.state = RENDER_STATE_HANDLE_CHAR;
    expect(fontFuncBraille(runtime, printer)).toBe(RENDER_UPDATE);
    expect(printer.state).toBe(RENDER_STATE_WAIT_SE);
  });

  test('clear, scroll, wait-se, pause, and glyph helpers follow the C state machine', () => {
    const runtime = createBrailleTextRuntime();
    const clearPrinter = createBrailleTextPrinter([CHAR_PROMPT_CLEAR]);
    clearPrinter.printerTemplate.currentX = 5;
    clearPrinter.printerTemplate.currentY = 6;
    clearPrinter.printerTemplate.x = 1;
    clearPrinter.printerTemplate.y = 2;
    clearPrinter.printerTemplate.bgColor = 3;
    expect(fontFuncBraille(runtime, clearPrinter)).toBe(RENDER_UPDATE);
    expect(clearPrinter.state).toBe(RENDER_STATE_CLEAR);
    expect(runtime.downArrowInitCount).toBe(1);
    expect(fontFuncBraille(runtime, clearPrinter)).toBe(RENDER_UPDATE);
    expect(clearPrinter.state).toBe(RENDER_STATE_HANDLE_CHAR);
    expect(clearPrinter.printerTemplate).toMatchObject({ currentX: 1, currentY: 2 });

    const scrollPrinter = createBrailleTextPrinter([CHAR_PROMPT_SCROLL]);
    scrollPrinter.printerTemplate.lineSpacing = 1;
    expect(fontFuncBraille(runtime, scrollPrinter)).toBe(RENDER_UPDATE);
    expect(scrollPrinter.state).toBe(RENDER_STATE_SCROLL_START);
    expect(fontFuncBraille(runtime, scrollPrinter)).toBe(RENDER_UPDATE);
    expect(scrollPrinter).toMatchObject({ state: RENDER_STATE_SCROLL, scrollDistance: 17 });
    runtime.optionsTextSpeed = OPTIONS_TEXT_SPEED_FAST;
    expect(fontFuncBraille(runtime, scrollPrinter)).toBe(RENDER_UPDATE);
    expect(runtime.scrolledWindows.at(-1)).toEqual({ windowId: 0, mode: 0, distance: 4, fill: 0 });
    expect(runtime.copiedWindows.at(-1)).toEqual({ windowId: 0, mode: COPYWIN_GFX });

    const waitSePrinter = createBrailleTextPrinter([], { state: RENDER_STATE_WAIT_SE });
    runtime.sePlaying = false;
    expect(fontFuncBraille(runtime, waitSePrinter)).toBe(RENDER_UPDATE);
    expect(waitSePrinter.state).toBe(RENDER_STATE_HANDLE_CHAR);

    const pausePrinter = createBrailleTextPrinter([], { state: RENDER_STATE_PAUSE, delayCounter: 1 });
    expect(fontFuncBraille(runtime, pausePrinter)).toBe(RENDER_UPDATE);
    expect(pausePrinter.delayCounter).toBe(0);
    expect(fontFuncBraille(runtime, pausePrinter)).toBe(RENDER_UPDATE);
    expect(pausePrinter.state).toBe(RENDER_STATE_HANDLE_CHAR);

    decompressGlyphBraille(runtime, 9);
    expect(runtime.glyphInfo.sourceOffsets).toEqual([0x110, 0x118, 0x190, 0x198]);
    expect(getGlyphWidthBraille(0, false)).toBe(16);
  });
});
