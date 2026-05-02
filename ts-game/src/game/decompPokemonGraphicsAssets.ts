import pokemonGraphicsSource from '../../../src/data/graphics/pokemon.h?raw';

export type PokemonGraphicsCondition = 'FIRERED' | 'LEAFGREEN' | null;
export type PokemonGraphicsAssetKind =
  | 'frontPic'
  | 'backPic'
  | 'palette'
  | 'shinyPalette'
  | 'icon'
  | 'footprint'
  | 'other';

export interface PokemonGraphicsAssetDeclaration {
  symbol: string;
  valueType: 'u8' | 'u32';
  incbinType: 'U8' | 'U32';
  assetPaths: string[];
  condition: PokemonGraphicsCondition;
  kind: PokemonGraphicsAssetKind;
}

export const POKEMON_GRAPHICS_SOURCE = pokemonGraphicsSource;

const classifyPokemonGraphicsAsset = (symbol: string): PokemonGraphicsAssetKind => {
  if (symbol.includes('FrontPic')) return 'frontPic';
  if (symbol.includes('BackPic')) return 'backPic';
  if (symbol.includes('ShinyPalette')) return 'shinyPalette';
  if (symbol.includes('Palette')) return 'palette';
  if (symbol.includes('Icon')) return 'icon';
  if (symbol.includes('Footprint')) return 'footprint';
  return 'other';
};

export const parsePokemonGraphicsAssetDeclarations = (source: string): PokemonGraphicsAssetDeclaration[] => {
  const declarations: PokemonGraphicsAssetDeclaration[] = [];
  let condition: PokemonGraphicsCondition = null;

  for (const line of source.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '#ifdef FIRERED' || trimmed === '#ifdef LEAFGREEN') {
      condition = trimmed.replace('#ifdef ', '') as Exclude<PokemonGraphicsCondition, null>;
      continue;
    }
    if (trimmed === '#endif') {
      condition = null;
      continue;
    }
    if (trimmed === '' || trimmed.startsWith('//')) {
      continue;
    }

    const declaration = trimmed.match(
      /^const\s+u(8|32)\s+(\w+)\[\]\s*=\s*INCBIN_(U8|U32)\(\s*(.+)\s*\);$/u
    );
    if (!declaration) {
      throw new Error(`Unsupported Pokemon graphics declaration: ${line}`);
    }

    const symbol = declaration[2];
    declarations.push({
      symbol,
      valueType: `u${declaration[1]}` as 'u8' | 'u32',
      incbinType: declaration[3] as 'U8' | 'U32',
      assetPaths: [...declaration[4].matchAll(/"([^"]+)"/gu)].map((path) => path[1]),
      condition,
      kind: classifyPokemonGraphicsAsset(symbol)
    });
  }

  return declarations;
};

export const POKEMON_GRAPHICS_ASSET_DECLARATIONS =
  parsePokemonGraphicsAssetDeclarations(pokemonGraphicsSource);

export const getPokemonGraphicsAssetDeclarations = (
  symbol: string
): PokemonGraphicsAssetDeclaration[] =>
  POKEMON_GRAPHICS_ASSET_DECLARATIONS.filter((declaration) => declaration.symbol === symbol);
