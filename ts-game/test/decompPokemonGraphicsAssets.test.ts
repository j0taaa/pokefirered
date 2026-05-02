import { describe, expect, test } from 'vitest';
import {
  getPokemonGraphicsAssetDeclarations,
  parsePokemonGraphicsAssetDeclarations,
  POKEMON_GRAPHICS_ASSET_DECLARATIONS,
  POKEMON_GRAPHICS_SOURCE
} from '../src/game/decompPokemonGraphicsAssets';

describe('decomp Pokemon graphics asset declarations', () => {
  test('parses every Pokemon graphics INCBIN declaration in source order', () => {
    expect(POKEMON_GRAPHICS_SOURCE).toContain('const u32 gMonFrontPic_Bulbasaur[]');
    expect(parsePokemonGraphicsAssetDeclarations(POKEMON_GRAPHICS_SOURCE)).toEqual(
      POKEMON_GRAPHICS_ASSET_DECLARATIONS
    );
    expect(POKEMON_GRAPHICS_ASSET_DECLARATIONS).toHaveLength(2411);
    expect(POKEMON_GRAPHICS_ASSET_DECLARATIONS[0]).toEqual({
      symbol: 'gMonFrontPic_Bulbasaur',
      valueType: 'u32',
      incbinType: 'U32',
      assetPaths: ['graphics/pokemon/bulbasaur/front.4bpp.lz'],
      condition: null,
      kind: 'frontPic'
    });
    expect(POKEMON_GRAPHICS_ASSET_DECLARATIONS.at(-1)).toEqual({
      symbol: 'gMonIcon_UnownQuestionMark',
      valueType: 'u8',
      incbinType: 'U8',
      assetPaths: ['graphics/pokemon/unown/question_mark/icon.4bpp'],
      condition: null,
      kind: 'icon'
    });
  });

  test('preserves asset kind and integer-width distribution', () => {
    const count = (field: 'kind' | 'valueType', value: string): number =>
      POKEMON_GRAPHICS_ASSET_DECLARATIONS.filter((declaration) => declaration[field] === value).length;

    expect(count('valueType', 'u32')).toBe(1609);
    expect(count('valueType', 'u8')).toBe(802);
    expect(count('kind', 'frontPic')).toBe(416);
    expect(count('kind', 'backPic')).toBe(415);
    expect(count('kind', 'palette')).toBe(389);
    expect(count('kind', 'shinyPalette')).toBe(388);
    expect(count('kind', 'icon')).toBe(414);
    expect(count('kind', 'footprint')).toBe(387);
  });

  test('keeps FireRed and LeafGreen Deoxys conditional declarations separate', () => {
    expect(getPokemonGraphicsAssetDeclarations('gMonIcon_Deoxys')).toEqual([
      {
        symbol: 'gMonIcon_Deoxys',
        valueType: 'u8',
        incbinType: 'U8',
        assetPaths: ['graphics/pokemon/deoxys/icon.4bpp', 'graphics/pokemon/deoxys/icon_attack.4bpp'],
        condition: 'FIRERED',
        kind: 'icon'
      },
      {
        symbol: 'gMonIcon_Deoxys',
        valueType: 'u8',
        incbinType: 'U8',
        assetPaths: ['graphics/pokemon/deoxys/icon.4bpp', 'graphics/pokemon/deoxys/icon_defense.4bpp'],
        condition: 'LEAFGREEN',
        kind: 'icon'
      }
    ]);
    expect(getPokemonGraphicsAssetDeclarations('gMonFrontPic_Deoxys').map((entry) => entry.assetPaths[0])).toEqual([
      'graphics/pokemon/deoxys/front.4bpp.lz',
      'graphics/pokemon/deoxys/front_def.4bpp.lz'
    ]);
  });

  test('preserves whitespace quirks and Unown form asset tails', () => {
    expect(getPokemonGraphicsAssetDeclarations('gMonIcon_Metapod')).toEqual([
      {
        symbol: 'gMonIcon_Metapod',
        valueType: 'u8',
        incbinType: 'U8',
        assetPaths: ['graphics/pokemon/metapod/icon.4bpp'],
        condition: null,
        kind: 'icon'
      }
    ]);
    expect(getPokemonGraphicsAssetDeclarations('gMonBackPic_UnownQuestionMark')).toEqual([
      {
        symbol: 'gMonBackPic_UnownQuestionMark',
        valueType: 'u32',
        incbinType: 'U32',
        assetPaths: ['graphics/pokemon/unown/question_mark/back.4bpp.lz'],
        condition: null,
        kind: 'backPic'
      }
    ]);
  });
});
