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

const parseMoveList = (value: string): string[] =>
  value
    .split(',')
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && token !== 'MOVE_NONE' && token !== '0')
    .map((token) => stripIdentifierPrefix(token, 'MOVE_'));

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

const trainerDefinitionMap = parseTrainerDefinitions();

export const getDecompTrainerDefinition = (trainerId: string): DecompTrainerDefinition | null =>
  trainerDefinitionMap.get(trainerId) ?? null;

export const hasDecompTrainerDefinition = (trainerId: string): boolean =>
  trainerDefinitionMap.has(trainerId);

export const getAllDecompTrainerDefinitions = (): DecompTrainerDefinition[] =>
  [...trainerDefinitionMap.values()];

export const getDecompTrainerFlag = (trainerId: string): string =>
  `TRAINER_DEFEATED_${trainerId}`;
