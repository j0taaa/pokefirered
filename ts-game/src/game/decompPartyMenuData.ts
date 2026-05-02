import partyMenuSource from '../../../src/data/party_menu.h?raw';

export interface PartyMenuRawDeclaration {
  name: string;
  kind: 'const' | 'anonymous-struct-const';
  source: string;
  initializer: string;
}

export interface PartyMenuRawEnum {
  source: string;
  values: string[];
}

export interface PartyMenuBgTemplate {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  screenSize: number;
  paletteMode: number;
  priority: number;
  baseTile: number;
}

export interface PartyMenuWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface PartyMenuSpriteCoords {
  mon: { x: number; y: number };
  item: { x: number; y: number };
  status: { x: number; y: number };
  pokeball: { x: number; y: number };
}

export interface PartyMenuBoxInfoRects {
  blitFunc: string;
  nickname: { x: number; y: number; w: number; h: number };
  level: { x: number; y: number; w: number; h: number };
  gender: { x: number; y: number; w: number; h: number };
  hp: { x: number; y: number; w: number; h: number };
  maxHp: { x: number; y: number; w: number; h: number };
  hpBar: { x: number; y: number; w: number; h: number };
  description: { x: number; y: number; w: number; h: number };
}

export interface PartyMenuCursorOption {
  index: string;
  text: string;
  func: string;
}

const COMMENT_REGEX = /\/\/.*$/gmu;
const BLOCK_COMMENT_REGEX = /\/\*[\s\S]*?\*\//gu;

const stripComments = (source: string): string =>
  source.replace(COMMENT_REGEX, '').replace(BLOCK_COMMENT_REGEX, '');

const getBraceContent = (source: string, openBraceIndex: number): { content: string; endIndex: number } => {
  let depth = 0;

  for (let index = openBraceIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          content: source.slice(openBraceIndex + 1, index),
          endIndex: index
        };
      }
    }
  }

  throw new Error('Unterminated party_menu.h initializer');
};

const parseInitializer = (source: string): string => {
  const equalsIndex = source.indexOf('=');
  if (equalsIndex < 0) {
    throw new Error(`Missing initializer in ${source.slice(0, 80)}`);
  }

  const incbin = source.slice(equalsIndex + 1).trim().match(/^(INCBIN_[A-Z0-9_]+\(.*\));$/u);
  if (incbin) {
    return incbin[1];
  }

  const openBraceIndex = source.indexOf('{', equalsIndex);
  if (openBraceIndex < 0) {
    throw new Error(`Missing braced initializer in ${source.slice(0, 80)}`);
  }

  return `{${getBraceContent(source, openBraceIndex).content}}`;
};

const parseTopLevelDeclarations = (source: string): PartyMenuRawDeclaration[] => {
  const declarations: PartyMenuRawDeclaration[] = [];
  const declarationStartRegex = /^(?:static\s+)?(?:const\b|struct\b)/gmu;

  for (const match of source.matchAll(declarationStartRegex)) {
    const start = match.index ?? 0;
    let depth = 0;
    let end = -1;

    for (let index = start; index < source.length; index += 1) {
      const char = source[index];
      if (char === '{') {
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
      } else if (char === ';' && depth === 0) {
        end = index + 1;
        break;
      }
    }

    if (end < 0) {
      throw new Error(`Unterminated party_menu.h declaration at ${start}`);
    }

    const declarationSource = source.slice(start, end);
    const beforeInitializer = declarationSource.slice(0, declarationSource.indexOf('=')).trim();
    const kind = beforeInitializer.startsWith('static struct') ? 'anonymous-struct-const' : 'const';
    const nameMatch = beforeInitializer.replace(/(?:\[[^\]]*\])+$/u, '').match(/(\w+)$/u);
    if (!nameMatch) {
      throw new Error(`Unable to read party_menu.h declaration name: ${beforeInitializer}`);
    }

    declarations.push({
      name: nameMatch[1],
      kind,
      source: declarationSource,
      initializer: parseInitializer(declarationSource)
    });
  }

  return declarations;
};

const parseEnums = (source: string): PartyMenuRawEnum[] => {
  const enums: PartyMenuRawEnum[] = [];
  const enumRegex = /^enum\s*\{([\s\S]*?)^\};/gm;

  for (const match of source.matchAll(enumRegex)) {
    enums.push({
      source: match[0],
      values: stripComments(match[1])
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    });
  }

  return enums;
};

const removeMatchedSource = (source: string, matches: string[]): string => {
  let remaining = source;
  for (const match of matches) {
    remaining = remaining.replace(match, '');
  }

  return stripComments(remaining).trim();
};

const rawDeclarations = parseTopLevelDeclarations(partyMenuSource);
const rawEnums = parseEnums(partyMenuSource);

const declarationByName = new Map(rawDeclarations.map((declaration) => [declaration.name, declaration]));

const getDeclaration = (name: string): PartyMenuRawDeclaration => {
  const declaration = declarationByName.get(name);
  if (!declaration) {
    throw new Error(`Missing party_menu.h declaration: ${name}`);
  }

  return declaration;
};

const getOuterInitializerContent = (name: string): string => {
  const initializer = getDeclaration(name).initializer;
  if (!initializer.startsWith('{')) {
    throw new Error(`party_menu.h declaration is not braced: ${name}`);
  }

  return getBraceContent(initializer, 0).content;
};

const parseCNumber = (value: string): number => Number.parseInt(value.trim(), 0);

const parseIntegerList = (source: string): number[] =>
  [...source.matchAll(/-?(?:0x[\dA-Fa-f]+|\d+)/gu)].map((match) => parseCNumber(match[0]));

const parseStructFields = (source: string): Record<string, string> => {
  const fields: Record<string, string> = {};
  const fieldRegex = /^\s*\.(\w+)\s*=\s*([^,\n]+),?/gmu;

  for (const match of source.matchAll(fieldRegex)) {
    fields[match[1]] = match[2].trim();
  }

  return fields;
};

const splitTopLevelEntries = (source: string): string[] => {
  const entries: string[] = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
    } else if (char === ',' && depth === 0) {
      const entry = source.slice(start, index).trim();
      if (entry.length > 0) {
        entries.push(entry);
      }
      start = index + 1;
    }
  }

  const finalEntry = source.slice(start).trim();
  if (finalEntry.length > 0) {
    entries.push(finalEntry);
  }

  return entries;
};

const findDesignatedBlocks = (source: string): Map<string, string> => {
  const blocks = new Map<string, string>();
  const labelRegex = /\[([^\]]+)\]\s*=/gu;

  for (const match of source.matchAll(labelRegex)) {
    const openBraceIndex = source.indexOf('{', match.index + match[0].length);
    if (openBraceIndex < 0) {
      continue;
    }

    const block = getBraceContent(source, openBraceIndex);
    blocks.set(match[1].trim(), block.content);
  }

  return blocks;
};

const parseWindowTemplate = (source: string): PartyMenuWindowTemplate => {
  const fields = parseStructFields(source);
  return {
    bg: parseCNumber(fields.bg),
    tilemapLeft: parseCNumber(fields.tilemapLeft),
    tilemapTop: parseCNumber(fields.tilemapTop),
    width: parseCNumber(fields.width),
    height: parseCNumber(fields.height),
    paletteNum: parseCNumber(fields.paletteNum),
    baseBlock: parseCNumber(fields.baseBlock)
  };
};

const parseBgTemplate = (source: string): PartyMenuBgTemplate => {
  const fields = parseStructFields(source);
  return {
    bg: parseCNumber(fields.bg),
    charBaseIndex: parseCNumber(fields.charBaseIndex),
    mapBaseIndex: parseCNumber(fields.mapBaseIndex),
    screenSize: parseCNumber(fields.screenSize),
    paletteMode: parseCNumber(fields.paletteMode),
    priority: parseCNumber(fields.priority),
    baseTile: parseCNumber(fields.baseTile)
  };
};

const parseWindowTemplateArray = (name: string): Array<PartyMenuWindowTemplate | 'DUMMY_WIN_TEMPLATE'> =>
  splitTopLevelEntries(getOuterInitializerContent(name)).map((entry) =>
    entry === 'DUMMY_WIN_TEMPLATE' ? entry : parseWindowTemplate(entry)
  );

const toRect = (values: number[], offset: number): { x: number; y: number; w: number; h: number } => ({
  x: values[offset],
  y: values[offset + 1],
  w: values[offset + 2],
  h: values[offset + 3]
});

const parseBoxInfoRects = (): Record<string, PartyMenuBoxInfoRects> => {
  const blocks = findDesignatedBlocks(getOuterInitializerContent('sPartyBoxInfoRects'));
  const parsed: Record<string, PartyMenuBoxInfoRects> = {};

  for (const [label, block] of blocks) {
    const callback = block.match(/^\s*(\w+),/u)?.[1] ?? '';
    const values = parseIntegerList(block);
    parsed[label] = {
      blitFunc: callback,
      nickname: toRect(values, 0),
      level: toRect(values, 4),
      gender: toRect(values, 8),
      hp: toRect(values, 12),
      maxHp: toRect(values, 16),
      hpBar: toRect(values, 20),
      description: toRect(values, 24)
    };
  }

  return parsed;
};

const parseSpriteCoords = (): Record<string, PartyMenuSpriteCoords[]> => {
  const blocks = findDesignatedBlocks(getOuterInitializerContent('sPartyMenuSpriteCoords'));
  const parsed: Record<string, PartyMenuSpriteCoords[]> = {};

  for (const [label, block] of blocks) {
    parsed[label] = [...block.matchAll(/\{([^{}]+)\}/gu)].map((match) => {
      const values = parseIntegerList(match[1]);
      return {
        mon: { x: values[0], y: values[1] },
        item: { x: values[2], y: values[3] },
        status: { x: values[4], y: values[5] },
        pokeball: { x: values[6], y: values[7] }
      };
    });
  }

  return parsed;
};

const parseCursorOptions = (): PartyMenuCursorOption[] => {
  const rows = getOuterInitializerContent('sCursorOptions');
  const rowRegex = /\[([^\]]+)\]\s*=\s*\{\s*([^,\s]+),\s*([^}\s]+)\s*\}/gu;
  const options: PartyMenuCursorOption[] = [];

  for (const match of rows.matchAll(rowRegex)) {
    options.push({
      index: match[1].trim(),
      text: match[2].trim(),
      func: match[3].trim()
    });
  }

  return options;
};

const parseTokenArray = (name: string): string[] =>
  splitTopLevelEntries(stripComments(getOuterInitializerContent(name))).map((entry) => entry.trim());

const partyMenuUnparsedRemainder = removeMatchedSource(partyMenuSource, [
  ...rawDeclarations.map((declaration) => declaration.source),
  ...rawEnums.map((rawEnum) => rawEnum.source)
]);

export const getPartyMenuRawDeclarations = (): PartyMenuRawDeclaration[] =>
  rawDeclarations.map((declaration) => ({ ...declaration }));

export const getPartyMenuRawEnums = (): PartyMenuRawEnum[] =>
  rawEnums.map((rawEnum) => ({
    source: rawEnum.source,
    values: [...rawEnum.values]
  }));

export const getPartyMenuUnparsedRemainder = (): string => partyMenuUnparsedRemainder;

export const getPartyMenuBgTemplates = (): PartyMenuBgTemplate[] =>
  splitTopLevelEntries(getOuterInitializerContent('sPartyMenuBgTemplates')).map(parseBgTemplate);

export const getPartyMenuSingleWindowTemplates = (): Array<PartyMenuWindowTemplate | 'DUMMY_WIN_TEMPLATE'> =>
  parseWindowTemplateArray('sSinglePartyMenuWindowTemplate');

export const getPartyMenuCancelButtonWindowTemplate = (): PartyMenuWindowTemplate =>
  parseWindowTemplate(getOuterInitializerContent('sCancelButtonWindowTemplate'));

export const getPartyMenuBoxInfoRects = (): Record<string, PartyMenuBoxInfoRects> =>
  parseBoxInfoRects();

export const getPartyMenuSpriteCoords = (): Record<string, PartyMenuSpriteCoords[]> =>
  parseSpriteCoords();

export const getPartyMenuCursorOptions = (): PartyMenuCursorOption[] =>
  parseCursorOptions();

export const getPartyMenuActionList = (name: string): string[] =>
  parseTokenArray(name);

export const getPartyMenuFieldMoves = (): string[] =>
  parseTokenArray('sFieldMoves');
