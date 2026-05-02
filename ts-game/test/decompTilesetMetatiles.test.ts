import { describe, expect, test } from 'vitest';
import {
  getTilesetMetatileAssetDeclaration,
  parseTilesetMetatileAssetDeclarations,
  TILESET_METATILE_ASSET_DECLARATIONS,
  TILESET_METATILES_SOURCE
} from '../src/world/decompTilesetMetatiles';

describe('decomp tileset metatile declarations', () => {
  test('parses every metatile and metatile-attribute declaration in source order', () => {
    expect(TILESET_METATILES_SOURCE).toContain('gMetatiles_General[] = INCBIN_U16');
    expect(parseTilesetMetatileAssetDeclarations(TILESET_METATILES_SOURCE)).toEqual(
      TILESET_METATILE_ASSET_DECLARATIONS
    );
    expect(TILESET_METATILE_ASSET_DECLARATIONS).toHaveLength(136);
    expect(TILESET_METATILE_ASSET_DECLARATIONS[0]).toEqual({
      symbol: 'gMetatiles_General',
      assetPath: 'data/tilesets/primary/general/metatiles.bin',
      valueType: 'u16',
      incbinType: 'U16',
      kind: 'metatiles',
      tilesetName: 'general',
      tilesetGroup: 'primary'
    });
    expect(TILESET_METATILE_ASSET_DECLARATIONS.at(-1)).toEqual({
      symbol: 'gMetatileAttributes_HallOfFame',
      assetPath: 'data/tilesets/secondary/hall_of_fame/metatile_attributes.bin',
      valueType: 'u32',
      incbinType: 'U32',
      kind: 'attributes',
      tilesetName: 'hall_of_fame',
      tilesetGroup: 'secondary'
    });
  });

  test('preserves metatile/attribute pairs and primary/secondary grouping', () => {
    expect(TILESET_METATILE_ASSET_DECLARATIONS.filter((declaration) => declaration.kind === 'metatiles')).toHaveLength(
      68
    );
    expect(TILESET_METATILE_ASSET_DECLARATIONS.filter((declaration) => declaration.kind === 'attributes')).toHaveLength(
      68
    );
    expect(TILESET_METATILE_ASSET_DECLARATIONS.filter((declaration) => declaration.tilesetGroup === 'primary')).toHaveLength(
      4
    );
    expect(
      getTilesetMetatileAssetDeclaration('gMetatileAttributes_PokemonLeague')
    ).toEqual({
      symbol: 'gMetatileAttributes_PokemonLeague',
      assetPath: 'data/tilesets/secondary/pokemon_league/metatile_attributes.bin',
      valueType: 'u32',
      incbinType: 'U32',
      kind: 'attributes',
      tilesetName: 'pokemon_league',
      tilesetGroup: 'secondary'
    });
  });
});
