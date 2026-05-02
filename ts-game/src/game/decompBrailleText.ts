export * from '../rendering/decompBrailleText';
import {
  decompressGlyphBraille,
  fontFuncBraille,
  getGlyphWidthBraille,
  type BrailleTextPrinter,
  type BrailleTextRuntime
} from '../rendering/decompBrailleText';

export function FontFunc_Braille(
  runtime: BrailleTextRuntime,
  textPrinter: BrailleTextPrinter
): number {
  return fontFuncBraille(runtime, textPrinter);
}

export function DecompressGlyph_Braille(
  runtime: BrailleTextRuntime,
  glyph: number
): void {
  decompressGlyphBraille(runtime, glyph);
}

export function GetGlyphWidth_Braille(fontType: number, isJapanese: boolean): number {
  return getGlyphWidthBraille(fontType, isJapanese);
}
