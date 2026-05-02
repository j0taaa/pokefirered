import objectEventGraphicsInfoPointersSource from '../../../src/data/object_events/object_event_graphics_info_pointers.h?raw';
import objectEventGraphicsInfoSource from '../../../src/data/object_events/object_event_graphics_info.h?raw';
import objectEventGraphicsSource from '../../../src/data/object_events/object_event_graphics.h?raw';
import objectEventPicTablesSource from '../../../src/data/object_events/object_event_pic_tables.h?raw';

export interface DecompObjectEventGraphicsInfoPointer {
  index: string;
  symbol: string;
}

export interface DecompObjectEventPicFrame {
  picSymbol: string;
  widthTiles: number;
  heightTiles: number;
  frame: number;
}

export interface DecompObjectEventGraphicsInfo {
  symbol: string;
  tileTag: string;
  paletteTag: string;
  reflectionPaletteTag: string;
  size: number;
  width: number;
  height: number;
  paletteSlot: string;
  shadowSize: string;
  inanimate: boolean;
  disableReflectionPaletteLoad: boolean;
  tracks: string;
  oam: string;
  subspriteTables: string;
  anims: string;
  images: string;
  affineAnims: string;
}

export interface DecompObjectEventPicTable {
  symbol: string;
  frames: DecompObjectEventPicFrame[];
}

export interface DecompObjectEventGraphicDeclaration {
  symbol: string;
  kind: 'incbin' | 'empty';
  path: string | null;
  declaredLength: number | null;
}

export const OBJECT_EVENT_GRAPHICS_INFO_POINTERS_SOURCE = objectEventGraphicsInfoPointersSource;
export const OBJECT_EVENT_GRAPHICS_INFO_SOURCE = objectEventGraphicsInfoSource;
export const OBJECT_EVENT_GRAPHICS_SOURCE = objectEventGraphicsSource;
export const OBJECT_EVENT_PIC_TABLES_SOURCE = objectEventPicTablesSource;

const parseNumberLiteral = (value: string): number =>
  Number.parseInt(value, 0);

export const parseObjectEventGraphicDeclarations = (
  source = objectEventGraphicsSource
): DecompObjectEventGraphicDeclaration[] =>
  [...source.matchAll(/^const u16 (\w+)\[(0x[0-9A-Fa-f]+|\d+)?\]\s*=\s*(?:INCBIN_U16\("([^"]+)"\)|\{\});/gmu)]
    .map((match) => ({
      symbol: match[1]!,
      kind: match[3] ? 'incbin' : 'empty',
      path: match[3] ?? null,
      declaredLength: match[2] ? parseNumberLiteral(match[2]) : null
    }));

export const parseObjectEventGraphicsInfoDeclarations = (
  source = objectEventGraphicsInfoPointersSource
): string[] =>
  [...source.matchAll(/^const struct ObjectEventGraphicsInfo (gObjectEventGraphicsInfo_\w+);/gmu)]
    .map((match) => match[1]!);

export const parseObjectEventGraphicsInfoPointers = (
  source = objectEventGraphicsInfoPointersSource
): DecompObjectEventGraphicsInfoPointer[] =>
  [...source.matchAll(/\[(OBJ_EVENT_GFX_[A-Z0-9_]+)\]\s*=\s*&(gObjectEventGraphicsInfo_\w+),/gu)]
    .map((match) => ({
      index: match[1]!,
      symbol: match[2]!
    }));

const readStructField = (body: string, field: string): string => {
  const match = body.match(new RegExp(`\\.${field}\\s*=\\s*([^,\\n]+),`, 'u'));
  return match?.[1]?.trim() ?? '';
};

const readStructNumber = (body: string, field: string): number =>
  Number.parseInt(readStructField(body, field), 10);

const readStructBoolean = (body: string, field: string): boolean =>
  readStructField(body, field) === 'TRUE';

const readStructSymbol = (body: string, field: string): string =>
  readStructField(body, field).replace(/^&/u, '');

export const parseObjectEventGraphicsInfos = (
  source = objectEventGraphicsInfoSource
): DecompObjectEventGraphicsInfo[] =>
  [...source.matchAll(/const struct ObjectEventGraphicsInfo (gObjectEventGraphicsInfo_\w+)\s*=\s*\{([\s\S]*?)\n\};/gu)]
    .map((match) => {
      const body = match[2] ?? '';
      return {
        symbol: match[1]!,
        tileTag: readStructField(body, 'tileTag'),
        paletteTag: readStructField(body, 'paletteTag'),
        reflectionPaletteTag: readStructField(body, 'reflectionPaletteTag'),
        size: readStructNumber(body, 'size'),
        width: readStructNumber(body, 'width'),
        height: readStructNumber(body, 'height'),
        paletteSlot: readStructField(body, 'paletteSlot'),
        shadowSize: readStructField(body, 'shadowSize'),
        inanimate: readStructBoolean(body, 'inanimate'),
        disableReflectionPaletteLoad: readStructBoolean(body, 'disableReflectionPaletteLoad'),
        tracks: readStructField(body, 'tracks'),
        oam: readStructSymbol(body, 'oam'),
        subspriteTables: readStructField(body, 'subspriteTables'),
        anims: readStructField(body, 'anims'),
        images: readStructField(body, 'images'),
        affineAnims: readStructField(body, 'affineAnims')
      };
    });

export const parseObjectEventPicTables = (
  source = objectEventPicTablesSource
): DecompObjectEventPicTable[] =>
  [...source.matchAll(/static const struct SpriteFrameImage (sPicTable_\w+)\[\]\s*=\s*\{([\s\S]*?)\n\};/gu)]
    .map((match) => ({
      symbol: match[1]!,
      frames: [...(match[2] ?? '').matchAll(/overworld_frame\((gObjectEventPic_\w+),\s*(\d+),\s*(\d+),\s*(\d+)\)/gu)]
        .map((frameMatch) => ({
          picSymbol: frameMatch[1]!,
          widthTiles: Number.parseInt(frameMatch[2]!, 10),
          heightTiles: Number.parseInt(frameMatch[3]!, 10),
          frame: Number.parseInt(frameMatch[4]!, 10)
        }))
    }));

export const gObjectEventGraphicsInfoDeclarations = parseObjectEventGraphicsInfoDeclarations();
export const gObjectEventGraphicsInfoPointers = parseObjectEventGraphicsInfoPointers();
export const gObjectEventGraphicsInfos = parseObjectEventGraphicsInfos();
export const gObjectEventGraphicDeclarations = parseObjectEventGraphicDeclarations();
export const gObjectEventPicTables = parseObjectEventPicTables();

const graphicsInfoPointersByIndex = new Map(
  gObjectEventGraphicsInfoPointers.map((entry) => [entry.index, entry])
);
const graphicsInfosBySymbol = new Map(
  gObjectEventGraphicsInfos.map((info) => [info.symbol, info])
);
const objectEventPicTablesBySymbol = new Map(
  gObjectEventPicTables.map((table) => [table.symbol, table])
);
const objectEventGraphicDeclarationsBySymbol = new Map(
  gObjectEventGraphicDeclarations.map((declaration) => [declaration.symbol, declaration])
);

export const getDecompObjectEventGraphicsInfoPointer = (
  index: string
): DecompObjectEventGraphicsInfoPointer | null =>
  graphicsInfoPointersByIndex.get(index) ?? null;

export const getDecompObjectEventGraphicsInfo = (
  symbol: string
): DecompObjectEventGraphicsInfo | null =>
  graphicsInfosBySymbol.get(symbol) ?? null;

export const getDecompObjectEventGraphicsInfoForIndex = (
  index: string
): DecompObjectEventGraphicsInfo | null => {
  const pointer = getDecompObjectEventGraphicsInfoPointer(index);
  return pointer ? getDecompObjectEventGraphicsInfo(pointer.symbol) : null;
};

export const getDecompObjectEventPicTable = (
  symbol: string
): DecompObjectEventPicTable | null =>
  objectEventPicTablesBySymbol.get(symbol) ?? null;

export const getDecompObjectEventGraphicDeclaration = (
  symbol: string
): DecompObjectEventGraphicDeclaration | null =>
  objectEventGraphicDeclarationsBySymbol.get(symbol) ?? null;
