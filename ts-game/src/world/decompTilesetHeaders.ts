import tilesetHeadersSource from '../../../src/data/tilesets/headers.h?raw';

export interface TilesetHeaderDeclaration {
  symbol: string;
  isCompressed: boolean;
  isSecondary: boolean;
  tiles: string;
  palettes: string;
  metatiles: string;
  metatileAttributes: string;
  callback: string | null;
}

export const TILESET_HEADERS_SOURCE = tilesetHeadersSource;

export const parseTilesetHeaderDeclarations = (source: string): TilesetHeaderDeclaration[] =>
  [...source.matchAll(/^const struct Tileset (gTileset_\w+)\s*=\s*\{([\s\S]*?)^\};/gmu)].map((match) => {
    const fields = Object.fromEntries(
      [...match[2].matchAll(/^\s*\.(\w+)\s*=\s*([^,]+),$/gmu)].map((field) => [field[1], field[2]])
    );

    return {
      symbol: match[1],
      isCompressed: fields.isCompressed === 'TRUE',
      isSecondary: fields.isSecondary === 'TRUE',
      tiles: fields.tiles,
      palettes: fields.palettes,
      metatiles: fields.metatiles,
      metatileAttributes: fields.metatileAttributes,
      callback: fields.callback === 'NULL' ? null : fields.callback
    };
  });

export const TILESET_HEADER_DECLARATIONS = parseTilesetHeaderDeclarations(tilesetHeadersSource);

export const getTilesetHeaderDeclaration = (symbol: string): TilesetHeaderDeclaration | undefined =>
  TILESET_HEADER_DECLARATIONS.find((declaration) => declaration.symbol === symbol);
