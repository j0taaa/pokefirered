import { describe, expect, test } from 'vitest';
import {
  getPokedexTextDeclaration,
  parsePokedexTextDeclarations,
  POKEDEX_TEXT_FR_SOURCE,
  POKEDEX_TEXT_LG_SOURCE,
  POKEDEX_TEXTS_BY_VERSION
} from '../src/game/decompPokedexVersionTexts';

describe('decomp versioned pokedex text declarations', () => {
  test('parses every FireRed and LeafGreen text declaration in source order', () => {
    expect(POKEDEX_TEXT_FR_SOURCE).toContain('const u8 gBulbasaurPokedexText[]');
    expect(POKEDEX_TEXT_LG_SOURCE).toContain('const u8 gBulbasaurPokedexText[]');
    expect(parsePokedexTextDeclarations(POKEDEX_TEXT_FR_SOURCE)).toEqual(POKEDEX_TEXTS_BY_VERSION.FIRERED);
    expect(parsePokedexTextDeclarations(POKEDEX_TEXT_LG_SOURCE)).toEqual(POKEDEX_TEXTS_BY_VERSION.LEAFGREEN);
    expect(POKEDEX_TEXTS_BY_VERSION.FIRERED).toHaveLength(774);
    expect(POKEDEX_TEXTS_BY_VERSION.LEAFGREEN).toHaveLength(774);
  });

  test('preserves matching dummy text and empty unused declarations', () => {
    expect(POKEDEX_TEXTS_BY_VERSION.FIRERED.slice(0, 2)).toEqual([
      {
        symbol: 'gDummyPokedexText',
        text: 'This is a newly discovered POKéMON. It is\\ncurrently under investigation. No detailed\\ninformation is available at this time.',
        unused: false
      },
      { symbol: 'gDummyPokedexTextUnused', text: '', unused: true }
    ]);
    expect(POKEDEX_TEXTS_BY_VERSION.LEAFGREEN[1]).toEqual({
      symbol: 'gDummyPokedexTextUnused',
      text: '',
      unused: true
    });
  });

  test('keeps FireRed and LeafGreen version differences under the same symbols', () => {
    expect(getPokedexTextDeclaration('FIRERED', 'gBulbasaurPokedexText')).toEqual({
      symbol: 'gBulbasaurPokedexText',
      text: 'There is a plant seed on its back right\\nfrom the day this POKéMON is born.\\nThe seed slowly grows larger.',
      unused: false
    });
    expect(getPokedexTextDeclaration('LEAFGREEN', 'gBulbasaurPokedexText')).toEqual({
      symbol: 'gBulbasaurPokedexText',
      text: 'A strange seed was planted on its back at\\nbirth. The plant sprouts and grows with\\nthis POKéMON.',
      unused: false
    });
    expect(getPokedexTextDeclaration('FIRERED', 'gDeoxysPokedexText')?.text).toBe(
      'This DEOXYS has transformed into its\\naggressive guise. It can fool enemies by\\naltering its appearance.'
    );
    expect(getPokedexTextDeclaration('LEAFGREEN', 'gDeoxysPokedexText')?.text).toBe(
      'When it changes form, an aurora appears.\\nIt absorbs attacks by altering its\\ncellular structure.'
    );
  });
});
