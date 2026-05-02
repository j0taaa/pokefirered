import graphicsSource from '../../../src/graphics.c?raw';
import interfacePokeballsSource from '../../../src/data/graphics/interface_pokeballs.h?raw';
import pokemonGraphicsSource from '../../../src/data/graphics/pokemon.h?raw';
import trainerGraphicsSource from '../../../src/data/graphics/trainers.h?raw';
import battleTerrainUnusedSource from '../../../src/data/graphics/battle_terrain_unused.h?raw';
import itemGraphicsSource from '../../../src/data/graphics/items.h?raw';
import mailGraphicsSource from '../../../src/data/graphics/mail.h?raw';

export type GraphicsWordSize = 8 | 16 | 32;

export interface GraphicsIncbinDeclaration {
  kind: 'incbin';
  cType: `u${GraphicsWordSize}`;
  symbol: string;
  dimensions: readonly string[];
  incbinType: `INCBIN_U${GraphicsWordSize}`;
  path: string;
}

export interface GraphicsIncbinArrayDeclaration {
  kind: 'incbin-array';
  cType: `u${GraphicsWordSize}`;
  symbol: string;
  dimensions: readonly string[];
  incbinType: `INCBIN_U${GraphicsWordSize}`;
  paths: readonly string[];
}

export interface GraphicsLiteralArrayDeclaration {
  kind: 'literal-array';
  cType: `u${GraphicsWordSize}`;
  symbol: string;
  dimensions: readonly string[];
  values: readonly number[];
}

export type GraphicsAssetDeclaration =
  | GraphicsIncbinDeclaration
  | GraphicsIncbinArrayDeclaration
  | GraphicsLiteralArrayDeclaration;

const includeSources: Record<string, string> = {
  'data/graphics/interface_pokeballs.h': interfacePokeballsSource,
  'data/graphics/pokemon.h': pokemonGraphicsSource,
  'data/graphics/trainers.h': trainerGraphicsSource,
  'data/graphics/battle_terrain_unused.h': battleTerrainUnusedSource,
  'data/graphics/items.h': itemGraphicsSource,
  'data/graphics/mail.h': mailGraphicsSource
};

export const expandGraphicsSource = (source = graphicsSource): string => {
  const expanded = source.replace(/^#include\s+"([^"]+)"\s*$/gmu, (line, includePath: string) => {
    return includeSources[includePath] ?? line;
  });
  return expanded.replace(/#ifdef FIRERED\n([\s\S]*?)#endif/gmu, '$1')
    .replace(/#ifdef LEAFGREEN\n[\s\S]*?#endif/gmu, '');
};

const rangeIsConsumed = (index: number, ranges: readonly (readonly [number, number])[]): boolean =>
  ranges.some(([start, end]) => index >= start && index < end);

export const parseGraphicsAssetDeclarations = (source = expandGraphicsSource()): GraphicsAssetDeclaration[] => {
  const declarations: Array<{ index: number; declaration: GraphicsAssetDeclaration }> = [];
  const consumedRanges: Array<[number, number]> = [];

  const multidimensionalRegex =
    /const\s+(u(?:8|16|32))\s+(\w+)((?:\[[^\]]*\]){2,})\s*=\s*\{([\s\S]*?)\n\};/gmu;
  for (const match of source.matchAll(multidimensionalRegex)) {
    const [full, cType, symbol, dimensionsRaw, body] = match;
    const paths = [...body.matchAll(/INCBIN_U(8|16|32)\(\s*"([^"]+)"\s*\)/gu)].map(([, , path]) => path);
    if (paths.length === 0) continue;
    declarations.push({
      index: match.index,
      declaration: {
      kind: 'incbin-array',
      cType: cType as `u${GraphicsWordSize}`,
      symbol,
      dimensions: [...dimensionsRaw.matchAll(/\[([^\]]*)\]/gu)].map(([, dimension]) => dimension),
      incbinType: `INCBIN_U${cType.slice(1)}` as `INCBIN_U${GraphicsWordSize}`,
      paths
      }
    });
    consumedRanges.push([match.index, match.index + full.length]);
  }

  const literalArrayRegex = /const\s+(u(?:8|16|32))\s+(\w+)((?:\[[^\]]+\])+)\s*=\s*\{([^{}]*)\};/gmu;
  for (const match of source.matchAll(literalArrayRegex)) {
    const [full, cType, symbol, dimensionsRaw, body] = match;
    if (rangeIsConsumed(match.index, consumedRanges)) continue;
    declarations.push({
      index: match.index,
      declaration: {
      kind: 'literal-array',
      cType: cType as `u${GraphicsWordSize}`,
      symbol,
      dimensions: [...dimensionsRaw.matchAll(/\[([^\]]*)\]/gu)].map(([, dimension]) => dimension),
      values: body.split(',').map((value) => value.trim()).filter(Boolean).map((value) => Number.parseInt(value, 0))
      }
    });
    consumedRanges.push([match.index, match.index + full.length]);
  }

  const incbinRegex = /const\s+(u(?:8|16|32))\s+(\w+)((?:\[[^\]]*\])+)\s*=\s*INCBIN_U(8|16|32)\(\s*"([^"]+)"\s*\);/gmu;
  for (const match of source.matchAll(incbinRegex)) {
    if (rangeIsConsumed(match.index, consumedRanges)) continue;
    const [full, cType, symbol, dimensionsRaw, incbinWidth, path] = match;
    declarations.push({
      index: match.index,
      declaration: {
      kind: 'incbin',
      cType: cType as `u${GraphicsWordSize}`,
      symbol,
      dimensions: [...dimensionsRaw.matchAll(/\[([^\]]*)\]/gu)].map(([, dimension]) => dimension),
      incbinType: `INCBIN_U${incbinWidth}` as `INCBIN_U${GraphicsWordSize}`,
      path
      }
    });
    consumedRanges.push([match.index, match.index + full.length]);
  }

  return declarations.sort((a, b) => a.index - b.index).map(({ declaration }) => declaration);
};

export const gGraphicsAssetDeclarations = parseGraphicsAssetDeclarations();

export const gGraphicsAssetDeclarationBySymbol: ReadonlyMap<string, GraphicsAssetDeclaration> = new Map(
  gGraphicsAssetDeclarations.map((declaration) => [declaration.symbol, declaration])
);

export const getGraphicsAssetDeclaration = (symbol: string): GraphicsAssetDeclaration | undefined =>
  gGraphicsAssetDeclarationBySymbol.get(symbol);

export const getGraphicsIncbinPath = (symbol: string): string | undefined => {
  const declaration = getGraphicsAssetDeclaration(symbol);
  return declaration?.kind === 'incbin' ? declaration.path : undefined;
};

export const listGraphicsAssetSymbols = (): string[] =>
  gGraphicsAssetDeclarations.map((declaration) => declaration.symbol);
