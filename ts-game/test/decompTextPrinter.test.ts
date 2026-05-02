import { describe, expect, test } from 'vitest';
import {
  AddTextPrinter,
  AddTextPrinterParameterized,
  ClearTextSpan,
  CopyGlyphToWindow,
  CopyGlyphToWindow_Parameterized,
  DeactivateAllTextPrinters,
  DecompressGlyphTile,
  GenerateFontHalfRowLookupTable,
  GetLastTextColor,
  IsTextPrinterActive,
  NUM_TEXT_PRINTERS,
  RENDER_FINISH,
  RENDER_PRINT,
  RENDER_REPEAT,
  RENDER_UPDATE,
  RenderFont,
  RestoreTextColors,
  RunTextPrinters,
  SaveTextColors,
  SetFontsPointer,
  TEXT_SKIP_DRAW,
  addTextPrinterParameterized,
  clearTextSpan,
  copyGlyphToWindow,
  copyGlyphToWindowParameterized,
  createTextPrinterRuntime,
  deactivateAllTextPrinters,
  decompressGlyphTile,
  generateFontHalfRowLookupTable,
  getLastTextColor,
  isTextPrinterActive,
  restoreTextColors,
  runTextPrinters,
  saveTextColors,
  setFontsPointer,
  type FontInfo
} from '../src/game/decompTextPrinter';

const font = (returns: number[]): FontInfo => ({
  letterSpacing: 1,
  lineSpacing: 2,
  unk: 3,
  fgColor: 4,
  bgColor: 5,
  shadowColor: 6,
  fontFunction: (printer) => {
    printer.subUnion[0] += 1;
    return returns.shift() ?? RENDER_FINISH;
  }
});

describe('decomp text_printer', () => {
  test('GenerateFontHalfRowLookupTable stores color permutations in C loop order', () => {
    const runtime = createTextPrinterRuntime();

    generateFontHalfRowLookupTable(runtime, 1, 2, 3);

    expect(runtime.fontHalfRowLookupTable[0]).toBe(0x2222);
    expect(runtime.fontHalfRowLookupTable[1]).toBe(0x1222);
    expect(runtime.fontHalfRowLookupTable[2]).toBe(0x3222);
    expect(runtime.fontHalfRowLookupTable[3]).toBe(0x2122);
    expect(runtime.fontHalfRowLookupTable[80]).toBe(0x3333);
    expect(getLastTextColor(runtime, 0)).toBe(1);
    expect(getLastTextColor(runtime, 1)).toBe(3);
    expect(getLastTextColor(runtime, 2)).toBe(2);
    expect(getLastTextColor(runtime, 99)).toBe(0);
  });

  test('SaveTextColors and RestoreTextColors preserve the last generated colors', () => {
    const runtime = createTextPrinterRuntime();
    const colors = { fgColor: 0, bgColor: 0, shadowColor: 0 };

    generateFontHalfRowLookupTable(runtime, 7, 8, 9);
    saveTextColors(runtime, colors);
    generateFontHalfRowLookupTable(runtime, 1, 2, 3);
    restoreTextColors(runtime, colors);

    expect(colors).toEqual({ fgColor: 7, bgColor: 8, shadowColor: 9 });
    expect(runtime.lastTextFgColor).toBe(7);
    expect(runtime.fontHalfRowLookupTable[0]).toBe(0x8888);
  });

  test('DeactivateAllTextPrinters clears every active printer slot', () => {
    const runtime = createTextPrinterRuntime();
    runtime.textPrinters[0].active = true;
    runtime.textPrinters[NUM_TEXT_PRINTERS - 1].active = true;

    deactivateAllTextPrinters(runtime);

    expect(runtime.textPrinters.every((p) => !p.active)).toBe(true);
  });

  test('AddTextPrinterParameterized queues nonzero speed printers and RunTextPrinters handles callbacks', () => {
    const runtime = createTextPrinterRuntime();
    const callbacks: number[] = [];
    setFontsPointer(runtime, [font([RENDER_REPEAT, RENDER_PRINT, RENDER_FINISH])]);

    expect(addTextPrinterParameterized(runtime, 2, 0, 'ABC', 5, 6, 3, (_template, cmd) => callbacks.push(cmd))).toBe(true);
    expect(isTextPrinterActive(runtime, 2)).toBe(true);
    expect(runtime.textPrinters[2].textSpeed).toBe(2);
    expect(runtime.textPrinters[2].printerTemplate).toMatchObject({
      windowId: 2,
      fontId: 0,
      currentX: 5,
      currentY: 6,
      letterSpacing: 1,
      lineSpacing: 2,
      fgColor: 4,
      bgColor: 5,
      shadowColor: 6
    });

    runTextPrinters(runtime);
    expect(runtime.copiedWindows).toEqual([{ windowId: 2, mode: 'COPYWIN_GFX' }]);
    expect(callbacks).toEqual([RENDER_PRINT]);

    runTextPrinters(runtime);
    expect(isTextPrinterActive(runtime, 2)).toBe(false);
  });

  test('AddTextPrinter renders immediate speed to completion and TEXT_SKIP_DRAW suppresses VRAM copy', () => {
    const runtime = createTextPrinterRuntime();
    setFontsPointer(runtime, [font([RENDER_UPDATE, RENDER_FINISH])]);

    expect(addTextPrinterParameterized(runtime, 1, 0, 'now', 0, 0, 0, null)).toBe(true);
    expect(runtime.copiedWindows).toEqual([{ windowId: 1, mode: 'COPYWIN_GFX' }]);
    expect(isTextPrinterActive(runtime, 1)).toBe(false);

    setFontsPointer(runtime, [font([RENDER_FINISH])]);
    expect(addTextPrinterParameterized(runtime, 1, 0, 'skip', 0, 0, TEXT_SKIP_DRAW, null)).toBe(true);
    expect(runtime.copiedWindows).toHaveLength(1);
  });

  test('AddTextPrinter returns FALSE when fonts are not configured', () => {
    const runtime = createTextPrinterRuntime();
    expect(addTextPrinterParameterized(runtime, 0, 0, '', 0, 0, 0, null)).toBe(false);
  });

  test('DecompressGlyphTile alternates high and low bytes from source words', () => {
    const runtime = createTextPrinterRuntime();
    generateFontHalfRowLookupTable(runtime, 1, 2, 3);
    const dest = new Uint16Array(16);

    decompressGlyphTile(runtime, Uint16Array.from([
      0x0001, 0x0203, 0x0405, 0x0607, 0x0809, 0x0a0b, 0x0c0d, 0x0e0f
    ]), dest);

    expect(dest[0]).toBe(runtime.fontHalfRowLookupTable[0]);
    expect(dest[1]).toBe(runtime.fontHalfRowLookupTable[1]);
    expect(dest[2]).toBe(runtime.fontHalfRowLookupTable[2]);
    expect(dest[3]).toBe(runtime.fontHalfRowLookupTable[0]);
    expect(dest[14]).toBe(0x3222);
    expect(dest[15]).toBe(runtime.fontHalfRowLookupTable[0]);
  });

  test('CopyGlyphToWindowParameterized writes nonzero glyph nibbles without clearing existing pixels', () => {
    const runtime = createTextPrinterRuntime();
    runtime.glyphInfo = {
      width: 4,
      height: 2,
      pixels: Uint8Array.from([0x21, 0x03, 0, 0, 0x04, 0, 0, 0])
    };
    const tileData = new Uint8Array(0x80).fill(0xf0);

    copyGlyphToWindowParameterized(runtime, tileData, 1, 1, 16, 16);

    expect(tileData[4]).toBe(1 << 4);
    expect(tileData[5]).toBe(2 | 0x30);
    expect(tileData[6]).toBe(0xf0);
    expect(tileData[8]).toBe(4 << 4);
    expect(tileData[9]).toBe(0xf0);
  });

  test('CopyGlyphToWindow clips to window dimensions and uses the TextPrinter current position', () => {
    const runtime = createTextPrinterRuntime();
    runtime.glyphInfo = {
      width: 12,
      height: 12,
      pixels: new Uint8Array(0x80).fill(0x11)
    };
    runtime.windows[0] = {
      window: { width: 1, height: 1 },
      tileData: new Uint8Array(0x40)
    };
    const printer = runtime.textPrinters[0];
    printer.printerTemplate.windowId = 0;
    printer.printerTemplate.currentX = 4;
    printer.printerTemplate.currentY = 4;

    copyGlyphToWindow(runtime, printer);

    expect(runtime.windows[0].tileData.some((v) => v !== 0)).toBe(true);
    expect(() => clearTextSpan(printer, 12)).not.toThrow();
  });

  test('exact C-name exports dispatch text printer setup, render, colors, glyph copy, and clear span logic', () => {
    const runtime = createTextPrinterRuntime();
    const callbacks: number[] = [];

    SetFontsPointer(runtime, [font([RENDER_REPEAT, RENDER_PRINT, RENDER_FINISH])]);
    expect(AddTextPrinterParameterized(runtime, 2, 0, 'ABC', 5, 6, 3, (_template, cmd) => callbacks.push(cmd))).toBe(true);
    expect(IsTextPrinterActive(runtime, 2)).toBe(true);
    RunTextPrinters(runtime);
    expect(runtime.copiedWindows.at(-1)).toEqual({ windowId: 2, mode: 'COPYWIN_GFX' });
    expect(callbacks).toEqual([RENDER_PRINT]);
    RunTextPrinters(runtime);
    expect(IsTextPrinterActive(runtime, 2)).toBe(false);

    runtime.textPrinters[1].active = true;
    DeactivateAllTextPrinters(runtime);
    expect(runtime.textPrinters.every((p) => !p.active)).toBe(true);

    const template = {
      currentChar: 'direct',
      windowId: 1,
      fontId: 0,
      x: 0,
      y: 0,
      currentX: 0,
      currentY: 0,
      letterSpacing: 1,
      lineSpacing: 2,
      unk: 3,
      fgColor: 7,
      bgColor: 8,
      shadowColor: 9
    };
    SetFontsPointer(runtime, [font([RENDER_FINISH])]);
    expect(AddTextPrinter(runtime, template, TEXT_SKIP_DRAW, null)).toBe(true);
    expect(runtime.copiedWindows.filter((copy) => copy.windowId === 1)).toHaveLength(0);

    SetFontsPointer(runtime, [font([RENDER_REPEAT, RENDER_UPDATE])]);
    expect(RenderFont(runtime, runtime.tempTextPrinter)).toBe(RENDER_UPDATE);

    GenerateFontHalfRowLookupTable(runtime, 1, 2, 3);
    expect(GetLastTextColor(runtime, 0)).toBe(1);
    expect(GetLastTextColor(runtime, 1)).toBe(3);
    expect(GetLastTextColor(runtime, 2)).toBe(2);
    const colors = { fgColor: 0, bgColor: 0, shadowColor: 0 };
    SaveTextColors(runtime, colors);
    GenerateFontHalfRowLookupTable(runtime, 4, 5, 6);
    RestoreTextColors(runtime, colors);
    expect(runtime.lastTextFgColor).toBe(1);

    const decompressed = new Uint16Array(16);
    DecompressGlyphTile(runtime, Uint16Array.from([
      0x0001, 0x0203, 0x0405, 0x0607, 0x0809, 0x0a0b, 0x0c0d, 0x0e0f
    ]), decompressed);
    expect(decompressed[0]).toBe(runtime.fontHalfRowLookupTable[0]);
    expect(decompressed[1]).toBe(runtime.fontHalfRowLookupTable[1]);

    runtime.glyphInfo = {
      width: 4,
      height: 2,
      pixels: Uint8Array.from([0x21, 0x03, 0, 0, 0x04, 0, 0, 0])
    };
    const tileData = new Uint8Array(0x80).fill(0xf0);
    CopyGlyphToWindow_Parameterized(runtime, tileData, 1, 1, 16, 16);
    expect(tileData[4]).toBe(1 << 4);

    runtime.windows[0] = {
      window: { width: 1, height: 1 },
      tileData: new Uint8Array(0x40)
    };
    runtime.textPrinters[0].printerTemplate.windowId = 0;
    runtime.textPrinters[0].printerTemplate.currentX = 1;
    runtime.textPrinters[0].printerTemplate.currentY = 1;
    CopyGlyphToWindow(runtime, runtime.textPrinters[0]);
    expect(runtime.windows[0].tileData.some((value) => value !== 0)).toBe(true);
    expect(() => ClearTextSpan(runtime.textPrinters[0], 8)).not.toThrow();
  });
});
