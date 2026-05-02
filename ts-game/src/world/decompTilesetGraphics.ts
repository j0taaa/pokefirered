import tilesetGraphicsSource from '../../../src/data/tilesets/graphics.h?raw';

export interface TilesetTilesDeclaration {
  symbol: string;
  assetPath: string;
  tilesetName: string;
  tilesetGroup: 'primary' | 'secondary';
}

export interface TilesetPaletteDeclaration {
  symbol: string;
  palettePaths: string[];
  tilesetName: string;
  tilesetGroup: 'primary' | 'secondary';
}

export const TILESET_GRAPHICS_SOURCE = tilesetGraphicsSource;

const parseTilesetPath = (assetPath: string): Pick<TilesetTilesDeclaration, 'tilesetGroup' | 'tilesetName'> => {
  const match = assetPath.match(/^data\/tilesets\/(primary|secondary)\/([^/]+)\//u);
  if (!match) {
    throw new Error(`Unsupported tileset graphics asset path: ${assetPath}`);
  }

  return {
    tilesetGroup: match[1] as 'primary' | 'secondary',
    tilesetName: match[2]
  };
};

export const parseTilesetTilesDeclarations = (source: string): TilesetTilesDeclaration[] =>
  [...source.matchAll(/^const\s+u32\s+(gTilesetTiles_\w+)\[\]\s*=\s*INCBIN_U32\("([^"]+)"\);/gmu)].map(
    (match) => ({
      symbol: match[1],
      assetPath: match[2],
      ...parseTilesetPath(match[2])
    })
  );

export const parseTilesetPaletteDeclarations = (source: string): TilesetPaletteDeclaration[] =>
  [...source.matchAll(/^const\s+u16\s+(gTilesetPalettes_\w+)\[\]\[16\]\s*=\s*\{([\s\S]*?)^\};/gmu)].map(
    (match) => {
      const palettePaths = [...match[2].matchAll(/INCBIN_U16\("([^"]+)"\)/gu)].map((palette) => palette[1]);
      if (palettePaths.length !== 16) {
        throw new Error(`Tileset palette ${match[1]} has ${palettePaths.length} palettes instead of 16`);
      }

      return {
        symbol: match[1],
        palettePaths,
        ...parseTilesetPath(palettePaths[0])
      };
    }
  );

export const TILESET_TILES_DECLARATIONS = parseTilesetTilesDeclarations(tilesetGraphicsSource);
export const TILESET_PALETTE_DECLARATIONS = parseTilesetPaletteDeclarations(tilesetGraphicsSource);

export const getTilesetTilesDeclaration = (symbol: string): TilesetTilesDeclaration | undefined =>
  TILESET_TILES_DECLARATIONS.find((declaration) => declaration.symbol === symbol);

export const getTilesetPaletteDeclaration = (symbol: string): TilesetPaletteDeclaration | undefined =>
  TILESET_PALETTE_DECLARATIONS.find((declaration) => declaration.symbol === symbol);
