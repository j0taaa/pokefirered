import fieldEffectObjectsSource from '../../../src/data/field_effects/field_effect_objects.h?raw';

export interface FieldEffectObjectRawDeclaration {
  storage: 'const' | 'static const';
  cKind: 'struct' | 'union';
  cType: string;
  pointerConst: boolean;
  name: string;
  source: string;
  initializer: string;
}

export interface FieldEffectSpritePalette {
  name: string;
  data: string;
  tag: string;
}

export interface FieldEffectSpriteTemplate {
  name: string;
  tileTag: string;
  paletteTag: string;
  oam: string;
  anims: string;
  images: string;
  affineAnims: string;
  callback: string;
}

export interface FieldEffectFrameImageTable {
  name: string;
  frames: string[];
}

export interface FieldEffectAnimCommandTable {
  name: string;
  commands: string[];
}

export interface FieldEffectAnimTable {
  name: string;
  entries: Array<{ index: string | null; value: string }>;
}

const COMMENT_REGEX = /\/\*[\s\S]*?\*\//g;
const DECLARATION_START_REGEX = /^(?:(static)\s+)?const\s+(struct|union)\s+/gmu;

const readDeclarationSource = (source: string, start: number): string => {
  let depth = 0;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
    } else if (char === ';' && depth === 0) {
      return source.slice(start, index + 1);
    }
  }

  throw new Error(`Unterminated field_effect_objects.h declaration at ${start}`);
};

const parseInitializer = (source: string): string => {
  const equalsIndex = source.indexOf('=');
  const openBraceIndex = source.indexOf('{', equalsIndex);
  const closeBraceIndex = source.lastIndexOf('}');
  if (equalsIndex < 0 || openBraceIndex < equalsIndex || closeBraceIndex < openBraceIndex) {
    throw new Error(`Invalid field_effect_objects.h declaration: ${source.slice(0, 80)}`);
  }

  return source.slice(openBraceIndex + 1, closeBraceIndex);
};

const parseRawDeclarations = (source: string): FieldEffectObjectRawDeclaration[] => {
  const declarations: FieldEffectObjectRawDeclaration[] = [];

  for (const match of source.matchAll(DECLARATION_START_REGEX)) {
    const declarationSource = readDeclarationSource(source, match.index ?? 0);
    const beforeInitializer = declarationSource.slice(0, declarationSource.indexOf('=')).trim();
    const signatureMatch = beforeInitializer.match(
      /^(?:(static)\s+)?const\s+(struct|union)\s+(.+?)\s+(\*const\s+)?(\w+)(?:\[[^\]]*\])?$/u
    );
    if (!signatureMatch) {
      throw new Error(`Unable to parse field_effect_objects.h declaration: ${beforeInitializer}`);
    }

    declarations.push({
      storage: signatureMatch[1] ? 'static const' : 'const',
      cKind: signatureMatch[2] as 'struct' | 'union',
      cType: signatureMatch[3].trim(),
      pointerConst: !!signatureMatch[4],
      name: signatureMatch[5],
      source: declarationSource,
      initializer: parseInitializer(declarationSource)
    });
  }

  return declarations;
};

const removeDeclarations = (
  source: string,
  declarations: FieldEffectObjectRawDeclaration[]
): string => {
  let remaining = source;
  for (const declaration of declarations) {
    remaining = remaining.replace(declaration.source, '');
  }

  return remaining.replace(COMMENT_REGEX, '').trim();
};

const parseFields = (source: string): Record<string, string> => {
  const fields: Record<string, string> = {};
  const fieldRegex = /\.(\w+)\s*=\s*([^,\n}]+),?/g;

  for (const match of source.matchAll(fieldRegex)) {
    fields[match[1]] = match[2].trim();
  }

  return fields;
};

const splitTopLevelRows = (source: string): string[] => {
  const rows: string[] = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '(' || char === '{') {
      depth += 1;
    } else if (char === ')' || char === '}') {
      depth -= 1;
    } else if (char === ',' && depth === 0) {
      const row = source.slice(start, index).trim();
      if (row.length > 0) {
        rows.push(row);
      }
      start = index + 1;
    }
  }

  const finalRow = source.slice(start).trim();
  if (finalRow.length > 0) {
    rows.push(finalRow);
  }

  return rows;
};

const parsePalette = (declaration: FieldEffectObjectRawDeclaration): FieldEffectSpritePalette => {
  const fields = parseFields(declaration.initializer);
  return {
    name: declaration.name,
    data: fields.data,
    tag: fields.tag
  };
};

const parseSpriteTemplate = (declaration: FieldEffectObjectRawDeclaration): FieldEffectSpriteTemplate => {
  const fields = parseFields(declaration.initializer);
  return {
    name: declaration.name,
    tileTag: fields.tileTag,
    paletteTag: fields.paletteTag,
    oam: fields.oam,
    anims: fields.anims,
    images: fields.images,
    affineAnims: fields.affineAnims,
    callback: fields.callback
  };
};

const parseFrameImageTable = (declaration: FieldEffectObjectRawDeclaration): FieldEffectFrameImageTable => ({
  name: declaration.name,
  frames: splitTopLevelRows(declaration.initializer)
});

const parseAnimCommandTable = (declaration: FieldEffectObjectRawDeclaration): FieldEffectAnimCommandTable => ({
  name: declaration.name,
  commands: splitTopLevelRows(declaration.initializer)
});

const parseAnimPointerTable = (declaration: FieldEffectObjectRawDeclaration): FieldEffectAnimTable => ({
  name: declaration.name,
  entries: splitTopLevelRows(declaration.initializer).map((row) => {
    const designated = row.match(/^\[([^\]]+)\]\s*=\s*(.+)$/u);
    return designated
      ? { index: designated[1].trim(), value: designated[2].trim() }
      : { index: null, value: row.trim() };
  })
});

const rawDeclarations = parseRawDeclarations(fieldEffectObjectsSource);
const unparsedRemainder = removeDeclarations(fieldEffectObjectsSource, rawDeclarations);

const spritePalettes = rawDeclarations
  .filter((declaration) => declaration.cKind === 'struct' && declaration.cType === 'SpritePalette')
  .map(parsePalette);
const spriteTemplates = rawDeclarations
  .filter((declaration) => declaration.cKind === 'struct' && declaration.cType === 'SpriteTemplate')
  .map(parseSpriteTemplate);
const frameImageTables = rawDeclarations
  .filter((declaration) => declaration.cKind === 'struct' && declaration.cType === 'SpriteFrameImage')
  .map(parseFrameImageTable);
const animCommandTables = rawDeclarations
  .filter((declaration) => declaration.cKind === 'union' && !declaration.pointerConst)
  .map(parseAnimCommandTable);
const animPointerTables = rawDeclarations
  .filter((declaration) => declaration.cKind === 'union' && declaration.pointerConst)
  .map(parseAnimPointerTable);

export const getFieldEffectObjectRawDeclarations = (): FieldEffectObjectRawDeclaration[] =>
  rawDeclarations.map((declaration) => ({ ...declaration }));

export const getFieldEffectObjectUnparsedRemainder = (): string => unparsedRemainder;

export const getFieldEffectSpritePalettes = (): FieldEffectSpritePalette[] =>
  spritePalettes.map((palette) => ({ ...palette }));

export const getFieldEffectSpriteTemplates = (): FieldEffectSpriteTemplate[] =>
  spriteTemplates.map((template) => ({ ...template }));

export const getFieldEffectFrameImageTables = (): FieldEffectFrameImageTable[] =>
  frameImageTables.map((table) => ({ name: table.name, frames: [...table.frames] }));

export const getFieldEffectAnimCommandTables = (): FieldEffectAnimCommandTable[] =>
  animCommandTables.map((table) => ({ name: table.name, commands: [...table.commands] }));

export const getFieldEffectAnimPointerTables = (): FieldEffectAnimTable[] =>
  animPointerTables.map((table) => ({
    name: table.name,
    entries: table.entries.map((entry) => ({ ...entry }))
  }));
