import { describe, expect, test } from 'vitest';
import {
  gPokedexOrder_Alphabetical,
  gPokedexOrder_Height,
  gPokedexOrder_Type,
  gPokedexOrder_Weight,
  POKEDEX_ORDERS_SOURCE
} from '../src/game/decompPokedexUi';

describe('decomp Pokedex orders', () => {
  test('parses every raw Pokedex order array with original token prefixes', () => {
    expect(POKEDEX_ORDERS_SOURCE).toContain('const u16 gPokedexOrder_Alphabetical[]');
    expect(gPokedexOrder_Alphabetical).toHaveLength(411);
    expect(gPokedexOrder_Weight).toHaveLength(386);
    expect(gPokedexOrder_Height).toHaveLength(386);
    expect(gPokedexOrder_Type).toHaveLength(411);
    expect(gPokedexOrder_Alphabetical.slice(0, 5)).toEqual([
      'NATIONAL_DEX_OLD_UNOWN_B',
      'NATIONAL_DEX_OLD_UNOWN_C',
      'NATIONAL_DEX_OLD_UNOWN_D',
      'NATIONAL_DEX_OLD_UNOWN_E',
      'NATIONAL_DEX_OLD_UNOWN_F'
    ]);
  });

  test('preserves tail ordering for all order modes', () => {
    expect(gPokedexOrder_Alphabetical.slice(-5)).toEqual([
      'NATIONAL_DEX_YANMA',
      'NATIONAL_DEX_ZANGOOSE',
      'NATIONAL_DEX_ZAPDOS',
      'NATIONAL_DEX_ZIGZAGOON',
      'NATIONAL_DEX_ZUBAT'
    ]);
    expect(gPokedexOrder_Weight.slice(-5)).toEqual([
      'NATIONAL_DEX_WAILORD',
      'NATIONAL_DEX_STEELIX',
      'NATIONAL_DEX_SNORLAX',
      'NATIONAL_DEX_METAGROSS',
      'NATIONAL_DEX_GROUDON'
    ]);
    expect(gPokedexOrder_Height.slice(-5)).toEqual([
      'NATIONAL_DEX_GYARADOS',
      'NATIONAL_DEX_RAYQUAZA',
      'NATIONAL_DEX_ONIX',
      'NATIONAL_DEX_STEELIX',
      'NATIONAL_DEX_WAILORD'
    ]);
    expect(gPokedexOrder_Type.slice(-5)).toEqual([
      'SPECIES_MURKROW',
      'SPECIES_SABLEYE',
      'SPECIES_HOUNDOUR',
      'SPECIES_HOUNDOOM',
      'SPECIES_SNEASEL'
    ]);
  });
});
