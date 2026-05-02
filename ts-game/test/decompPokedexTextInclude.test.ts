import { describe, expect, test } from 'vitest';
import {
  POKEDEX_TEXT_INCLUDE_SOURCE,
  POKEDEX_TEXT_VERSION_INCLUDES,
  getPokedexTextIncludeForVersion
} from '../src/game/decompPokedexTextInclude';

describe('decomp pokedex_text.h include selector', () => {
  test('preserves the exact FireRed/LeafGreen conditional include surface', () => {
    expect(POKEDEX_TEXT_INCLUDE_SOURCE.trim()).toBe([
      '#if defined(FIRERED)',
      '#include "pokedex_text_fr.h"',
      '#elif defined(LEAFGREEN)',
      '#include "pokedex_text_lg.h"',
      '#endif'
    ].join('\n'));
  });

  test('maps version defines to the same include files', () => {
    expect(POKEDEX_TEXT_VERSION_INCLUDES).toEqual({
      FIRERED: 'pokedex_text_fr.h',
      LEAFGREEN: 'pokedex_text_lg.h'
    });
    expect(getPokedexTextIncludeForVersion('FIRERED')).toBe('pokedex_text_fr.h');
    expect(getPokedexTextIncludeForVersion('LEAFGREEN')).toBe('pokedex_text_lg.h');
  });
});
