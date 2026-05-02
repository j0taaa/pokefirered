import { describe, expect, test } from 'vitest';
import * as braille from '../src/game/decompBrailleText';

describe('src/braille_text.c parity exports', () => {
  test('exact C names point at the implemented braille renderer', () => {
    expect(braille.FontFunc_Braille).toBe(braille.fontFuncBraille);
    expect(braille.DecompressGlyph_Braille).toBe(braille.decompressGlyphBraille);
    expect(braille.GetGlyphWidth_Braille).toBe(braille.getGlyphWidthBraille);
  });

  test('DecompressGlyph_Braille and GetGlyphWidth_Braille preserve C glyph geometry', () => {
    const runtime = braille.createBrailleTextRuntime();

    braille.DecompressGlyph_Braille(runtime, 9);

    expect(runtime.glyphInfo).toMatchObject({
      glyph: 9,
      width: 16,
      height: 16,
      sourceOffsets: [0x110, 0x118, 0x190, 0x198]
    });
    expect(braille.GetGlyphWidth_Braille(0, false)).toBe(16);
  });
});
