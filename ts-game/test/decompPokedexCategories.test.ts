import { describe, expect, test } from 'vitest';
import {
  gDexCategories,
  POKEDEX_CATEGORIES_SOURCE,
  sDexCategoryGroups,
  sDexCategoryPages
} from '../src/game/decompPokedexUi';

describe('decomp Pokedex categories', () => {
  test('parses every category page species list in source order', () => {
    expect(POKEDEX_CATEGORIES_SOURCE).toContain('static const u16 sDexCategory_GrasslandPkmn_Page1[]');
    expect(sDexCategoryPages).toHaveLength(143);
    expect(sDexCategoryPages.slice(0, 3)).toEqual([
      {
        symbol: 'sDexCategory_GrasslandPkmn_Page1',
        species: ['SPECIES_RATTATA', 'SPECIES_RATICATE', 'SPECIES_SENTRET', 'SPECIES_FURRET']
      },
      {
        symbol: 'sDexCategory_GrasslandPkmn_Page2',
        species: ['SPECIES_ZIGZAGOON', 'SPECIES_LINOONE', 'SPECIES_POOCHYENA', 'SPECIES_MIGHTYENA']
      },
      {
        symbol: 'sDexCategory_GrasslandPkmn_Page3',
        species: ['SPECIES_NIDORAN_F', 'SPECIES_NIDORINA', 'SPECIES_NIDOQUEEN']
      }
    ]);
  });

  test('preserves category groups and top-level category order', () => {
    expect(sDexCategoryGroups).toHaveLength(9);
    expect(sDexCategoryGroups.map((group) => [group.symbol, group.pages.length])).toEqual([
      ['sDexCategory_GrasslandPkmn', 27],
      ['sDexCategory_ForestPkmn', 26],
      ['sDexCategory_WatersEdgePkmn', 16],
      ['sDexCategory_SeaPkmn', 16],
      ['sDexCategory_CavePkmn', 10],
      ['sDexCategory_MountainPkmn', 17],
      ['sDexCategory_RoughTerrainPkmn', 11],
      ['sDexCategory_UrbanPkmn', 12],
      ['sDexCategory_RarePkmn', 8]
    ]);
    expect(gDexCategories).toEqual([
      'sDexCategory_GrasslandPkmn',
      'sDexCategory_ForestPkmn',
      'sDexCategory_WatersEdgePkmn',
      'sDexCategory_SeaPkmn',
      'sDexCategory_CavePkmn',
      'sDexCategory_MountainPkmn',
      'sDexCategory_RoughTerrainPkmn',
      'sDexCategory_UrbanPkmn',
      'sDexCategory_RarePkmn'
    ]);
    expect(sDexCategoryPages.at(-1)).toEqual({
      symbol: 'sDexCategory_RarePkmn_Page8',
      species: ['SPECIES_MEW']
    });
  });
});
