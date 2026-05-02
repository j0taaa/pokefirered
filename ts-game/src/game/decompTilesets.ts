import tilesetsSource from '../../../src/tilesets.c?raw';

export {
  TILESETS_C_INCLUDES,
  getTilesetsCompilationIncludes
} from '../world/decompTilesetsData';
export {
  TILESET_HEADERS_SOURCE,
  TILESET_HEADER_DECLARATIONS,
  getTilesetHeaderDeclaration,
  parseTilesetHeaderDeclarations,
  type TilesetHeaderDeclaration
} from '../world/decompTilesetHeaders';
export {
  TILESET_GRAPHICS_SOURCE,
  TILESET_PALETTE_DECLARATIONS,
  TILESET_TILES_DECLARATIONS,
  getTilesetPaletteDeclaration,
  getTilesetTilesDeclaration,
  parseTilesetPaletteDeclarations,
  parseTilesetTilesDeclarations,
  type TilesetPaletteDeclaration,
  type TilesetTilesDeclaration
} from '../world/decompTilesetGraphics';
export {
  TILESET_METATILES_SOURCE,
  TILESET_METATILE_ASSET_DECLARATIONS,
  getTilesetMetatileAssetDeclaration,
  parseTilesetMetatileAssetDeclarations,
  type TilesetMetatileAssetDeclaration
} from '../world/decompTilesetMetatiles';

export const TILESETS_C_SOURCE = tilesetsSource;
export const TILESETS_C_TRANSLATION_UNIT = 'src/tilesets.c';
