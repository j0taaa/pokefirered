import tilesetMetatilesSource from '../../../src/data/tilesets/metatiles.h?raw';

export interface TilesetMetatileAssetDeclaration {
  symbol: string;
  assetPath: string;
  valueType: 'u16' | 'u32';
  incbinType: 'U16' | 'U32';
  kind: 'metatiles' | 'attributes';
  tilesetName: string;
  tilesetGroup: 'primary' | 'secondary';
}

export const TILESET_METATILES_SOURCE = tilesetMetatilesSource;

export const parseTilesetMetatileAssetDeclarations = (source: string): TilesetMetatileAssetDeclaration[] => {
  const declarations: TilesetMetatileAssetDeclaration[] = [];

  for (const line of source.split('\n')) {
    const declaration = line.match(/^const\s+u(16|32)\s+(\w+)\[\]\s*=\s*INCBIN_(U16|U32)\("([^"]+)"\);$/u);
    if (!declaration) {
      if (line.trim() !== '') {
        throw new Error(`Unsupported tileset metatile declaration: ${line}`);
      }
      continue;
    }

    const assetPath = declaration[4];
    const pathMatch = assetPath.match(/^data\/tilesets\/(primary|secondary)\/([^/]+)\//u);
    if (!pathMatch) {
      throw new Error(`Unsupported tileset metatile asset path: ${assetPath}`);
    }

    declarations.push({
      symbol: declaration[2],
      assetPath,
      valueType: `u${declaration[1]}` as 'u16' | 'u32',
      incbinType: declaration[3] as 'U16' | 'U32',
      kind: declaration[2].startsWith('gMetatileAttributes_') ? 'attributes' : 'metatiles',
      tilesetName: pathMatch[2],
      tilesetGroup: pathMatch[1] as 'primary' | 'secondary'
    });
  }

  return declarations;
};

export const TILESET_METATILE_ASSET_DECLARATIONS =
  parseTilesetMetatileAssetDeclarations(tilesetMetatilesSource);

export const getTilesetMetatileAssetDeclaration = (
  symbol: string
): TilesetMetatileAssetDeclaration | undefined =>
  TILESET_METATILE_ASSET_DECLARATIONS.find((declaration) => declaration.symbol === symbol);
