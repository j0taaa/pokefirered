import decorationDescriptionsSource from '../../../src/data/decoration/description.h?raw';
import decorationHeaderSource from '../../../src/data/decoration/header.h?raw';
import decorationTilesSource from '../../../src/data/decoration/tiles.h?raw';

export const DECORATION_C_INCLUDES = [
  'global.h',
  'decoration.h',
  'constants/decorations.h',
  'data/decoration/tiles.h',
  'data/decoration/description.h',
  'data/decoration/header.h'
] as const;

export const getDecorationCompilationIncludes = (): readonly string[] =>
  DECORATION_C_INCLUDES;

export interface DecorationDescription {
  symbol: string;
  text: string;
}

export interface DecorationHeader {
  id: string;
  name: string;
  permission: string;
  shape: string;
  category: string;
  price: number;
  descriptionSymbol: string;
  gfxSymbol: string;
}

export interface DecorationTiles {
  symbol: string;
  tiles: number[];
}

export const DECORATION_DESCRIPTIONS_SOURCE = decorationDescriptionsSource;
export const DECORATION_HEADER_SOURCE = decorationHeaderSource;
export const DECORATION_TILES_SOURCE = decorationTilesSource;

export const parseDecorationDescriptions = (source: string): DecorationDescription[] =>
  [...source.matchAll(/const u8 (DecorDesc_\w+)\[\]\s*=\s*_\(([\s\S]*?)\);/gu)].map((match) => ({
    symbol: match[1],
    text: [...match[2].matchAll(/"([\s\S]*?)"/gu)].map((part) => part[1]).join('')
  }));

export const parseDecorationHeaders = (source: string): DecorationHeader[] =>
  [
    ...source.matchAll(
      /\{\s*(DECOR_\w+),\s*_\("([\s\S]*?)"\),\s*(DECORPERM_\w+),\s*(DECORSHAPE_\w+x\w+),\s*(DECORCAT_\w+),\s*(\d+),\s*(DecorDesc_\w+),\s*(DecorGfx_\w+)\s*\}/gu
    )
  ].map((match) => ({
    id: match[1],
    name: match[2],
    permission: match[3],
    shape: match[4],
    category: match[5],
    price: Number.parseInt(match[6], 10),
    descriptionSymbol: match[7],
    gfxSymbol: match[8]
  }));

export const parseDecorationTiles = (source: string): DecorationTiles[] =>
  [...source.matchAll(/^const\s+u16\s+(DecorGfx_\w+)\[\]\s*=\s*\{([\s\S]*?)^\};/gmu)].map((match) => ({
    symbol: match[1],
    tiles: [...match[2].matchAll(/0x[0-9A-Fa-f]+|\d+/gu)].map((tile) => Number.parseInt(tile[0], 0))
  }));

export const gDecorationDescriptions = parseDecorationDescriptions(decorationDescriptionsSource);
export const gDecorations = parseDecorationHeaders(decorationHeaderSource);
export const gDecorationTiles = parseDecorationTiles(decorationTilesSource);

export const getDecorationDescription = (symbol: string): string | undefined =>
  gDecorationDescriptions.find((description) => description.symbol === symbol)?.text;

export const getDecoration = (id: string): DecorationHeader | undefined =>
  gDecorations.find((decoration) => decoration.id === id);

export const getDecorationTiles = (symbol: string): DecorationTiles | undefined =>
  gDecorationTiles.find((decoration) => decoration.symbol === symbol);
