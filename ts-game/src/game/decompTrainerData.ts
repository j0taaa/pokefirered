const rawTrainerDataFiles = import.meta.glob('../../../src/data/trainers.h', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const rawTrainerPartyFiles = import.meta.glob('../../../src/data/trainer_parties.h', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

export interface DecompTrainerPartyEntry {
  species: string;
  level: number;
  moveIds?: string[];
  heldItemId?: string | null;
}

export interface DecompTrainerDefinition {
  trainerId: string;
  trainerClass: string;
  trainerName: string;
  trainerItems: string[];
  trainerAiFlags: string[];
  doubleBattle: boolean;
  party: DecompTrainerPartyEntry[];
}

export interface RawTrainerPartyMon {
  initializer: string;
  iv: string | null;
  lvl: string | null;
  species: string | null;
  heldItem: string | null;
  moves: string[];
}

export interface RawTrainerPartyDefinition {
  monType: string;
  partyName: string;
  initializer: string;
  mons: RawTrainerPartyMon[];
}

export interface RawTrainerDefinition {
  trainerId: string;
  initializer: string;
  trainerClass: string | null;
  encounterMusicGender: string | null;
  trainerPic: string | null;
  trainerName: string | null;
  items: string[];
  doubleBattle: string | null;
  aiFlags: string | null;
  party: {
    macro: string;
    partyName: string;
  } | null;
}

const PARTY_DEFINITION_RE = /static const struct (TrainerMonNoItemDefaultMoves|TrainerMonItemDefaultMoves|TrainerMonNoItemCustomMoves|TrainerMonItemCustomMoves) ([A-Za-z0-9_]+)\[\] = \{/gu;
const TRAINER_ENTRY_RE = /\[(TRAINER_[A-Z0-9_]+)\]\s*=\s*\{/gu;

const stripIdentifierPrefix = (value: string, prefix: string): string =>
  value.startsWith(prefix) ? value.slice(prefix.length) : value;

const decodeCString = (value: string): string =>
  value
    .replace(/\\n/gu, '\n')
    .replace(/\\l/gu, '\n')
    .replace(/\\p/gu, ' ')
    .replace(/\\e/gu, '')
    .replace(/\$/gu, '');

const readBraceBody = (source: string, openBraceIndex: number): { body: string; closeIndex: number } | null => {
  let depth = 0;
  for (let index = openBraceIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char !== '}') {
      continue;
    }

    depth -= 1;
    if (depth === 0) {
      return {
        body: source.slice(openBraceIndex + 1, index),
        closeIndex: index
      };
    }
  }

  return null;
};

const splitTopLevelBlocks = (body: string): string[] => {
  const blocks: string[] = [];
  let startIndex = -1;
  let depth = 0;

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char === '{') {
      if (depth === 0) {
        startIndex = index;
      }
      depth += 1;
      continue;
    }

    if (char !== '}') {
      continue;
    }

    depth -= 1;
    if (depth === 0 && startIndex >= 0) {
      blocks.push(body.slice(startIndex + 1, index));
      startIndex = -1;
    }
  }

  return blocks;
};

const splitTopLevelInitializers = (body: string): string[] => {
  const entries: string[] = [];
  let start = 0;
  let depth = 0;

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
    } else if (char === ',' && depth === 0) {
      const entry = body.slice(start, index).trim();
      if (entry.length > 0) {
        entries.push(entry);
      }
      start = index + 1;
    }
  }

  const finalEntry = body.slice(start).trim();
  if (finalEntry.length > 0) {
    entries.push(finalEntry);
  }

  return entries;
};

const parseMoveList = (value: string): string[] =>
  value
    .split(',')
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && token !== 'MOVE_NONE' && token !== '0')
    .map((token) => stripIdentifierPrefix(token, 'MOVE_'));

const parseTrainerPartyMacros = (source: string): Map<string, string> => {
  const macros = new Map<string, string>();
  const macroRegex = /^#define\s+(\w+)\s+\\\n([\s\S]*?)(?=\n\n|\nstatic const)/gmu;

  for (const match of source.matchAll(macroRegex)) {
    macros.set(match[1], match[2].replace(/\\$/gmu, '').trim());
  }

  return macros;
};

const parseRawTrainerPartyMon = (initializer: string, macros: Map<string, string>): RawTrainerPartyMon => {
  const expandedInitializer = macros.get(initializer) ?? initializer;
  const field = (name: string): string | null =>
    expandedInitializer.match(new RegExp(`\\.${name}\\s*=\\s*([^,\\n}]+)`, 'u'))?.[1]?.trim() ?? null;
  const moves = expandedInitializer
    .match(/\.moves\s*=\s*\{([^}]+)\}/u)?.[1]
    .split(',')
    .map((move) => move.trim())
    .filter((move) => move.length > 0) ?? [];

  return {
    initializer,
    iv: field('iv'),
    lvl: field('lvl'),
    species: field('species'),
    heldItem: field('heldItem'),
    moves
  };
};

const parseRawTrainerPartyData = (): { definitions: RawTrainerPartyDefinition[]; unparsedRemainder: string } => {
  const definitions: RawTrainerPartyDefinition[] = [];
  const sources = Object.values(rawTrainerPartyFiles);
  let unparsedRemainder = '';

  for (const source of sources) {
    const macros = parseTrainerPartyMacros(source);
    let remaining = source;

    for (const match of source.matchAll(PARTY_DEFINITION_RE)) {
      const openBraceIndex = (match.index ?? 0) + match[0].length - 1;
      const block = readBraceBody(source, openBraceIndex);
      if (!block) {
        continue;
      }

      const sourceSlice = source.slice(match.index ?? 0, block.closeIndex + 2);
      const initializer = block.body.trim();
      definitions.push({
        monType: match[1],
        partyName: match[2],
        initializer,
        mons: splitTopLevelInitializers(initializer).map((entry) => parseRawTrainerPartyMon(entry, macros))
      });
      remaining = remaining.replace(sourceSlice, '');
    }

    remaining = remaining
      .replace(/^#define\s+\w+\s+\\\n[\s\S]*?(?=\n\n|\nstatic const)/gmu, '')
      .replace(/\/\/.*$/gmu, '')
      .trim();
    unparsedRemainder += remaining;
  }

  return { definitions, unparsedRemainder };
};

const parseTrainerTableBody = (source: string): string => {
  const tableMatch = source.match(/^const struct Trainer gTrainers\[\] = \{/mu);
  if (!tableMatch) {
    throw new Error('Missing gTrainers table in trainers.h');
  }

  const block = readBraceBody(source, (tableMatch.index ?? 0) + tableMatch[0].length - 1);
  if (!block) {
    throw new Error('Unterminated gTrainers table in trainers.h');
  }

  return block.body;
};

const parseRawTrainerDefinition = (trainerId: string, initializer: string): RawTrainerDefinition => {
  const field = (name: string): string | null =>
    initializer.match(new RegExp(`\\.${name}\\s*=\\s*([^,\\n}]+)`, 'u'))?.[1]?.trim() ?? null;
  const items = initializer
    .match(/\.items\s*=\s*\{([^}]*)\}/u)?.[1]
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0) ?? [];
  const partyMatch = initializer.match(/\.party\s*=\s*(\w+)\((\w+)\)/u);

  return {
    trainerId,
    initializer,
    trainerClass: field('trainerClass'),
    encounterMusicGender: field('encounterMusic_gender'),
    trainerPic: field('trainerPic'),
    trainerName: initializer.match(/\.trainerName\s*=\s*_\("((?:[^"\\]|\\.)*)"\)/u)?.[1] ?? null,
    items,
    doubleBattle: field('doubleBattle'),
    aiFlags: field('aiFlags'),
    party: partyMatch
      ? {
        macro: partyMatch[1],
        partyName: partyMatch[2]
      }
      : null
  };
};

const parseRawTrainerData = (): { definitions: RawTrainerDefinition[]; unparsedRemainder: string } => {
  const definitions: RawTrainerDefinition[] = [];
  let unparsedRemainder = '';

  for (const source of Object.values(rawTrainerDataFiles)) {
    const tableBody = parseTrainerTableBody(source);
    let remaining = tableBody;

    for (const match of tableBody.matchAll(TRAINER_ENTRY_RE)) {
      const openBraceIndex = (match.index ?? 0) + match[0].length - 1;
      const block = readBraceBody(tableBody, openBraceIndex);
      if (!block) {
        continue;
      }

      const sourceSlice = tableBody.slice(match.index ?? 0, block.closeIndex + 2);
      definitions.push(parseRawTrainerDefinition(match[1], block.body.trim()));
      remaining = remaining.replace(sourceSlice, '');
    }

    unparsedRemainder += remaining.replace(/\/\/.*$/gmu, '').trim();
  }

  return { definitions, unparsedRemainder };
};

const parseTrainerPartyData = (): Map<string, DecompTrainerPartyEntry[]> => {
  const parties = new Map<string, DecompTrainerPartyEntry[]>();

  for (const source of Object.values(rawTrainerPartyFiles)) {
    for (const match of source.matchAll(PARTY_DEFINITION_RE)) {
      const openBraceIndex = (match.index ?? 0) + match[0].length - 1;
      const block = readBraceBody(source, openBraceIndex);
      if (!block) {
        continue;
      }

      const partyName = match[2];
      const entryBlocks = splitTopLevelBlocks(block.body);
      const entries = entryBlocks.map((entryBlock) => {
        const levelMatch = entryBlock.match(/\.lvl = (\d+)/u);
        const speciesMatch = entryBlock.match(/\.species = (SPECIES_[A-Z0-9_]+)/u);
        const heldItemMatch = entryBlock.match(/\.heldItem = (ITEM_[A-Z0-9_]+)/u);
        const movesMatch = entryBlock.match(/\.moves = \{([^}]+)\}/u);

        return {
          level: Number.parseInt(levelMatch?.[1] ?? '1', 10),
          species: stripIdentifierPrefix(speciesMatch?.[1] ?? 'SPECIES_NONE', 'SPECIES_'),
          heldItemId: heldItemMatch?.[1] ?? null,
          moveIds: movesMatch ? parseMoveList(movesMatch[1]) : undefined
        } satisfies DecompTrainerPartyEntry;
      }).filter((entry) => entry.species !== 'NONE');

      parties.set(partyName, entries);
    }
  }

  return parties;
};

const parseTrainerDefinitions = (): Map<string, DecompTrainerDefinition> => {
  const partyMap = parseTrainerPartyData();
  const trainers = new Map<string, DecompTrainerDefinition>();

  for (const source of Object.values(rawTrainerDataFiles)) {
    for (const match of source.matchAll(TRAINER_ENTRY_RE)) {
      const openBraceIndex = (match.index ?? 0) + match[0].length - 1;
      const block = readBraceBody(source, openBraceIndex);
      if (!block) {
        continue;
      }

      const trainerId = match[1];
      const entryBody = block.body;
      const trainerClassMatch = entryBody.match(/\.trainerClass = (TRAINER_CLASS_[A-Z0-9_]+)/u);
      const trainerNameMatch = entryBody.match(/\.trainerName = _\("((?:[^"\\]|\\.)*)"\)/u);
      const itemsMatch = entryBody.match(/\.items = \{([^}]*)\}/u);
      const aiFlagsMatch = entryBody.match(/\.aiFlags = ([^\n,]+)/u);
      const partyMatch = entryBody.match(/\.party = (?:NO_ITEM_DEFAULT_MOVES|NO_ITEM_CUSTOM_MOVES|ITEM_DEFAULT_MOVES|ITEM_CUSTOM_MOVES)\(([A-Za-z0-9_]+)\)/u);

      const trainerItems = (itemsMatch?.[1] ?? '')
        .split(',')
        .map((token) => token.trim())
        .filter((token) => token.startsWith('ITEM_') && token !== 'ITEM_NONE')
        .map((token) => token);

      const trainerAiFlags = (aiFlagsMatch?.[1] ?? '')
        .split('|')
        .map((token) => token.trim())
        .filter((token) => token.length > 0 && token !== '0');

      trainers.set(trainerId, {
        trainerId,
        trainerClass: trainerClassMatch?.[1] ?? 'TRAINER_CLASS_NONE',
        trainerName: decodeCString(trainerNameMatch?.[1] ?? ''),
        trainerItems,
        trainerAiFlags,
        doubleBattle: /\.doubleBattle = TRUE/u.test(entryBody),
        party: partyMap.get(partyMatch?.[1] ?? '') ?? []
      });
    }
  }

  return trainers;
};

const rawTrainerPartyData = parseRawTrainerPartyData();
const rawTrainerData = parseRawTrainerData();
const trainerDefinitionMap = parseTrainerDefinitions();

export const getRawTrainerPartyDefinitions = (): RawTrainerPartyDefinition[] =>
  rawTrainerPartyData.definitions.map((definition) => ({
    ...definition,
    mons: definition.mons.map((mon) => ({ ...mon, moves: [...mon.moves] }))
  }));

export const getRawTrainerPartyUnparsedRemainder = (): string =>
  rawTrainerPartyData.unparsedRemainder;

export const getRawTrainerDefinitions = (): RawTrainerDefinition[] =>
  rawTrainerData.definitions.map((definition) => ({
    ...definition,
    items: [...definition.items],
    party: definition.party ? { ...definition.party } : null
  }));

export const getRawTrainerUnparsedRemainder = (): string =>
  rawTrainerData.unparsedRemainder;

export const getDecompTrainerDefinition = (trainerId: string): DecompTrainerDefinition | null =>
  trainerDefinitionMap.get(trainerId) ?? null;

export const hasDecompTrainerDefinition = (trainerId: string): boolean =>
  trainerDefinitionMap.has(trainerId);

export const getAllDecompTrainerDefinitions = (): DecompTrainerDefinition[] =>
  [...trainerDefinitionMap.values()];

export const getDecompTrainerFlag = (trainerId: string): string =>
  `TRAINER_DEFEATED_${trainerId}`;
