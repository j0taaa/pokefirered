import trainerGraphicsSource from '../../../src/data/graphics/trainers.h?raw';

export interface TrainerGraphicsAssetDeclaration {
  symbol: string;
  assetPath: string;
  valueType: 'u8' | 'u32';
  incbinType: 'U8' | 'U32';
  kind: 'frontPic' | 'backPic' | 'palette';
}

export const TRAINER_GRAPHICS_SOURCE = trainerGraphicsSource;

export const parseTrainerGraphicsAssetDeclarations = (source: string): TrainerGraphicsAssetDeclaration[] => {
  const declarations: TrainerGraphicsAssetDeclaration[] = [];

  for (const line of source.split('\n')) {
    const declaration = line.match(/^const\s+u(8|32)\s+(\w+)\[\]\s*=\s*INCBIN_(U8|U32)\("([^"]+)"\);$/u);
    if (!declaration) {
      if (line.trim() !== '') {
        throw new Error(`Unsupported trainer graphics declaration: ${line}`);
      }
      continue;
    }

    const symbol = declaration[2];
    declarations.push({
      symbol,
      assetPath: declaration[4],
      valueType: `u${declaration[1]}` as 'u8' | 'u32',
      incbinType: declaration[3] as 'U8' | 'U32',
      kind: symbol.startsWith('gTrainerPalette_')
        ? 'palette'
        : symbol.includes('BackPic')
          ? 'backPic'
          : 'frontPic'
    });
  }

  return declarations;
};

export const TRAINER_GRAPHICS_ASSET_DECLARATIONS = parseTrainerGraphicsAssetDeclarations(trainerGraphicsSource);

export const getTrainerGraphicsAssetDeclaration = (
  symbol: string
): TrainerGraphicsAssetDeclaration | undefined =>
  TRAINER_GRAPHICS_ASSET_DECLARATIONS.find((declaration) => declaration.symbol === symbol);
