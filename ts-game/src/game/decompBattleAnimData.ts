import battleAnimSource from '../../../src/data/battle_anim.h?raw';

export interface BattleAnimRawDeclaration {
  structType: string;
  name: string;
  source: string;
  initializer: string;
}

export interface BattleAnimOamData {
  name: string;
  y: string;
  affineMode: string;
  objMode: string;
  bpp: string;
  shape: string;
  x: string;
  size: string;
  tileNum: string;
  priority: string;
  paletteNum: string;
}

export interface BattleAnimSpriteSheetEntry {
  data: string;
  size: string;
  tag: string;
}

export interface BattleAnimSpritePaletteEntry {
  data: string;
  tag: string;
}

export interface BattleAnimBackgroundEntry {
  index: string;
  image: string;
  palette: string;
  tilemap: string;
}

const DECLARATION_REGEX = /^const\s+struct\s+(\w+)\s+(\w+)(?:\[[^\]]*\])?\s*=\s*\{[\s\S]*?^\};/gm;

const parseInitializer = (source: string): string => {
  const openBraceIndex = source.indexOf('{');
  const closeBraceIndex = source.lastIndexOf('}');
  if (openBraceIndex < 0 || closeBraceIndex < openBraceIndex) {
    throw new Error(`Invalid battle_anim.h declaration: ${source.slice(0, 80)}`);
  }

  return source.slice(openBraceIndex + 1, closeBraceIndex);
};

const parseRawDeclarations = (source: string): BattleAnimRawDeclaration[] => {
  const declarations: BattleAnimRawDeclaration[] = [];

  for (const match of source.matchAll(DECLARATION_REGEX)) {
    declarations.push({
      structType: match[1],
      name: match[2],
      source: match[0],
      initializer: parseInitializer(match[0])
    });
  }

  return declarations;
};

const removeDeclarations = (source: string, declarations: BattleAnimRawDeclaration[]): string => {
  let remaining = source;
  for (const declaration of declarations) {
    remaining = remaining.replace(declaration.source, '');
  }

  return remaining.trim();
};

const parseFields = (source: string): Record<string, string> => {
  const fields: Record<string, string> = {};
  const fieldRegex = /^\s*\.(\w+)\s*=\s*([^,\n]+),?/gm;

  for (const match of source.matchAll(fieldRegex)) {
    fields[match[1]] = match[2].trim();
  }

  return fields;
};

const splitRowValues = (source: string): string[] =>
  source.split(',').map((value) => value.trim());

const getDeclaration = (name: string): BattleAnimRawDeclaration => {
  const declaration = declarationByName.get(name);
  if (!declaration) {
    throw new Error(`Missing battle_anim.h declaration: ${name}`);
  }

  return declaration;
};

const parseOamData = (declaration: BattleAnimRawDeclaration): BattleAnimOamData => {
  const fields = parseFields(declaration.initializer);
  return {
    name: declaration.name,
    y: fields.y,
    affineMode: fields.affineMode,
    objMode: fields.objMode,
    bpp: fields.bpp,
    shape: fields.shape,
    x: fields.x,
    size: fields.size,
    tileNum: fields.tileNum,
    priority: fields.priority,
    paletteNum: fields.paletteNum
  };
};

const parseSpriteSheetTable = (): BattleAnimSpriteSheetEntry[] => {
  const rows = getDeclaration('gBattleAnimPicTable').initializer;
  return [...rows.matchAll(/\{([^{}]+)\},/g)].map((match) => {
    const values = splitRowValues(match[1]);
    return {
      data: values[0],
      size: values[1],
      tag: values[2]
    };
  });
};

const parseSpritePaletteTable = (): BattleAnimSpritePaletteEntry[] => {
  const rows = getDeclaration('gBattleAnimPaletteTable').initializer;
  return [...rows.matchAll(/\{([^{}]+)\},/g)].map((match) => {
    const values = splitRowValues(match[1]);
    return {
      data: values[0],
      tag: values[1]
    };
  });
};

const parseBackgroundTable = (): BattleAnimBackgroundEntry[] => {
  const rows = getDeclaration('gBattleAnimBackgroundTable').initializer;
  const rowRegex = /\[([^\]]+)\]\s*=\s*\{([^{}]+)\},/g;

  return [...rows.matchAll(rowRegex)].map((match) => {
    const values = splitRowValues(match[2]);
    return {
      index: match[1].trim(),
      image: values[0],
      palette: values[1],
      tilemap: values[2]
    };
  });
};

const rawDeclarations = parseRawDeclarations(battleAnimSource);
const declarationByName = new Map(rawDeclarations.map((declaration) => [declaration.name, declaration]));
const unparsedRemainder = removeDeclarations(battleAnimSource, rawDeclarations);
const oamData = rawDeclarations
  .filter((declaration) => declaration.structType === 'OamData')
  .map(parseOamData);
const spriteSheetTable = parseSpriteSheetTable();
const spritePaletteTable = parseSpritePaletteTable();
const backgroundTable = parseBackgroundTable();

export const getBattleAnimRawDeclarations = (): BattleAnimRawDeclaration[] =>
  rawDeclarations.map((declaration) => ({ ...declaration }));

export const getBattleAnimUnparsedRemainder = (): string => unparsedRemainder;

export const getBattleAnimOamData = (): BattleAnimOamData[] =>
  oamData.map((entry) => ({ ...entry }));

export const getBattleAnimPicTable = (): BattleAnimSpriteSheetEntry[] =>
  spriteSheetTable.map((entry) => ({ ...entry }));

export const getBattleAnimPaletteTable = (): BattleAnimSpritePaletteEntry[] =>
  spritePaletteTable.map((entry) => ({ ...entry }));

export const getBattleAnimBackgroundTable = (): BattleAnimBackgroundEntry[] =>
  backgroundTable.map((entry) => ({ ...entry }));
