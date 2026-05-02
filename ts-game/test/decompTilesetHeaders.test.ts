import { describe, expect, test } from 'vitest';
import {
  getTilesetHeaderDeclaration,
  parseTilesetHeaderDeclarations,
  TILESET_HEADER_DECLARATIONS,
  TILESET_HEADERS_SOURCE
} from '../src/world/decompTilesetHeaders';

describe('decomp tileset header declarations', () => {
  test('parses every tileset descriptor in source order', () => {
    expect(TILESET_HEADERS_SOURCE).toContain('const struct Tileset gTileset_General');
    expect(parseTilesetHeaderDeclarations(TILESET_HEADERS_SOURCE)).toEqual(TILESET_HEADER_DECLARATIONS);
    expect(TILESET_HEADER_DECLARATIONS).toHaveLength(68);
    expect(TILESET_HEADER_DECLARATIONS[0]).toEqual({
      symbol: 'gTileset_General',
      isCompressed: true,
      isSecondary: false,
      tiles: 'gTilesetTiles_General',
      palettes: 'gTilesetPalettes_General',
      metatiles: 'gMetatiles_General',
      metatileAttributes: 'gMetatileAttributes_General',
      callback: 'InitTilesetAnim_General'
    });
    expect(TILESET_HEADER_DECLARATIONS.at(-1)).toEqual({
      symbol: 'gTileset_HallOfFame',
      isCompressed: true,
      isSecondary: true,
      tiles: 'gTilesetTiles_HallOfFame',
      palettes: 'gTilesetPalettes_HallOfFame',
      metatiles: 'gMetatiles_HallOfFame',
      metatileAttributes: 'gMetatileAttributes_HallOfFame',
      callback: null
    });
  });

  test('preserves compression flags, primary/secondary flags, and animation callbacks', () => {
    expect(TILESET_HEADER_DECLARATIONS.filter((declaration) => !declaration.isSecondary)).toHaveLength(2);
    expect(TILESET_HEADER_DECLARATIONS.filter((declaration) => !declaration.isCompressed)).toHaveLength(1);
    expect(getTilesetHeaderDeclaration('gTileset_CableClub')).toMatchObject({
      isCompressed: false,
      isSecondary: true,
      callback: null
    });
    expect(getTilesetHeaderDeclaration('gTileset_CeladonCity')?.callback).toBe('InitTilesetAnim_CeladonCity');
    expect(getTilesetHeaderDeclaration('gTileset_MtEmber')?.callback).toBe('InitTilesetAnim_MtEmber');
  });
});
