import { describe, expect, test } from 'vitest';
import {
  getTilesetPaletteDeclaration,
  getTilesetTilesDeclaration,
  parseTilesetPaletteDeclarations,
  parseTilesetTilesDeclarations,
  TILESET_GRAPHICS_SOURCE,
  TILESET_PALETTE_DECLARATIONS,
  TILESET_TILES_DECLARATIONS
} from '../src/world/decompTilesetGraphics';

describe('decomp tileset graphics declarations', () => {
  test('parses every tileset tile blob and palette array in source order', () => {
    expect(TILESET_GRAPHICS_SOURCE).toContain('const u32 gTilesetTiles_PalletTown[]');
    expect(TILESET_GRAPHICS_SOURCE).toContain('// Shared by SilphCo');
    expect(parseTilesetTilesDeclarations(TILESET_GRAPHICS_SOURCE)).toEqual(TILESET_TILES_DECLARATIONS);
    expect(parseTilesetPaletteDeclarations(TILESET_GRAPHICS_SOURCE)).toEqual(TILESET_PALETTE_DECLARATIONS);
    expect(TILESET_TILES_DECLARATIONS).toHaveLength(64);
    expect(TILESET_PALETTE_DECLARATIONS).toHaveLength(64);
  });

  test('preserves representative tile and palette asset paths', () => {
    expect(TILESET_TILES_DECLARATIONS[0]).toEqual({
      symbol: 'gTilesetTiles_PalletTown',
      assetPath: 'data/tilesets/secondary/pallet_town/tiles.4bpp.lz',
      tilesetName: 'pallet_town',
      tilesetGroup: 'secondary'
    });
    expect(getTilesetTilesDeclaration('gTilesetTiles_HallOfFame')).toEqual({
      symbol: 'gTilesetTiles_HallOfFame',
      assetPath: 'data/tilesets/secondary/hall_of_fame/tiles.4bpp.lz',
      tilesetName: 'hall_of_fame',
      tilesetGroup: 'secondary'
    });
    expect(getTilesetPaletteDeclaration('gTilesetPalettes_PalletTown')?.palettePaths).toEqual(
      Array.from({ length: 16 }, (_, index) =>
        `data/tilesets/secondary/pallet_town/palettes/${index.toString().padStart(2, '0')}.gbapal`
      )
    );
  });

  test('keeps primary and secondary tileset groups from the original asset paths', () => {
    expect(TILESET_TILES_DECLARATIONS.filter((declaration) => declaration.tilesetGroup === 'primary')).toHaveLength(
      1
    );
    expect(TILESET_PALETTE_DECLARATIONS.filter((declaration) => declaration.tilesetGroup === 'primary')).toHaveLength(
      1
    );
    expect(getTilesetPaletteDeclaration('gTilesetPalettes_Building')).toMatchObject({
      symbol: 'gTilesetPalettes_Building',
      tilesetName: 'building',
      tilesetGroup: 'primary'
    });
  });
});
