export * from '../rendering/decompBrailleText';
import {
  decompressGlyphBraille,
  fontFuncBraille,
  getGlyphWidthBraille
} from '../rendering/decompBrailleText';

export const FontFunc_Braille = fontFuncBraille;

export const DecompressGlyph_Braille = decompressGlyphBraille;

export const GetGlyphWidth_Braille = getGlyphWidthBraille;
