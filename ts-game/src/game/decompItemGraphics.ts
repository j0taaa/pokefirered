import itemGraphicsSource from '../../../src/data/graphics/items.h?raw';

export interface ItemGraphicsAssetDeclaration {
  symbol: string;
  assetPath: string;
  kind: 'icon' | 'palette';
  section: string | null;
}

export const ITEM_GRAPHICS_SOURCE = itemGraphicsSource;

export const parseItemGraphicsAssetDeclarations = (source: string): ItemGraphicsAssetDeclaration[] => {
  const declarations: ItemGraphicsAssetDeclaration[] = [];
  let section: string | null = null;

  for (const line of source.split('\n')) {
    const comment = line.match(/^\/\/\s*(.+)$/u);
    if (comment) {
      section = comment[1];
      continue;
    }

    const declaration = line.match(/^const\s+u32\s+(\w+)\[\]\s*=\s*INCBIN_U32\("([^"]+)"\);$/u);
    if (!declaration) {
      if (line.trim() !== '') {
        throw new Error(`Unsupported item graphics declaration: ${line}`);
      }
      continue;
    }

    declarations.push({
      symbol: declaration[1],
      assetPath: declaration[2],
      kind: declaration[1].startsWith('gItemIconPalette_') ? 'palette' : 'icon',
      section
    });
  }

  return declarations;
};

export const ITEM_GRAPHICS_ASSET_DECLARATIONS = parseItemGraphicsAssetDeclarations(itemGraphicsSource);

export const getItemGraphicsAssetDeclaration = (symbol: string): ItemGraphicsAssetDeclaration | undefined =>
  ITEM_GRAPHICS_ASSET_DECLARATIONS.find((declaration) => declaration.symbol === symbol);
