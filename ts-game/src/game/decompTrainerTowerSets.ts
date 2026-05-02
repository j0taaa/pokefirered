import trainerTowerSetsSource from '../../../src/trainer_tower_sets.c?raw';

export const CHALLENGE_TYPE_SINGLE = 0;
export const CHALLENGE_TYPE_DOUBLE = 1;
export const CHALLENGE_TYPE_KNOCKOUT = 2;
export const CHALLENGE_TYPE_MIXED = 3;
export const NUM_TOWER_CHALLENGE_TYPES = 4;
export const MAX_TRAINER_TOWER_FLOORS = 8;
export const MAX_TRAINERS_PER_FLOOR = 3;
export const TRAINER_TOWER_MONS_PER_TRAINER = 6;

const challengeTypeByToken: Record<string, number> = {
  CHALLENGE_TYPE_SINGLE,
  CHALLENGE_TYPE_DOUBLE,
  CHALLENGE_TYPE_KNOCKOUT,
  CHALLENGE_TYPE_MIXED
};

const challengeIndexByToken: Record<string, number> = {
  ...challengeTypeByToken,
  [String(CHALLENGE_TYPE_SINGLE)]: CHALLENGE_TYPE_SINGLE,
  [String(CHALLENGE_TYPE_DOUBLE)]: CHALLENGE_TYPE_DOUBLE,
  [String(CHALLENGE_TYPE_KNOCKOUT)]: CHALLENGE_TYPE_KNOCKOUT,
  [String(CHALLENGE_TYPE_MIXED)]: CHALLENGE_TYPE_MIXED
};

export interface TrainerTowerLocalHeader {
  numFloors: number;
  id: number;
}

export interface ParsedTrainerTowerMonSummary {
  species: string;
  heldItem: string;
  moves: readonly string[];
  nickname: string;
  hpIV: number;
  attackIV: number;
  defenseIV: number;
  speedIV: number;
  spAttackIV: number;
  spDefenseIV: number;
  friendship: number;
}

export interface ParsedTrainerTowerFloor {
  symbol: string;
  id: number;
  floorIdx: number;
  challengeTypeToken: string;
  challengeType: number;
  prize: string;
  checksum: number;
  rawInitializer: string;
  trainerNames: readonly string[];
  facilityClasses: readonly string[];
  textColors: readonly number[];
  species: readonly string[];
  dummyTeamCalls: readonly number[];
}

export const gTrainerTowerLocalHeader: TrainerTowerLocalHeader = parseLocalHeader(trainerTowerSetsSource);
export const sTrainerTowerFloors = parseTrainerTowerFloors(trainerTowerSetsSource);
export const sTrainerTowerFloorBySymbol: ReadonlyMap<string, ParsedTrainerTowerFloor> = new Map(
  sTrainerTowerFloors.map((floor) => [floor.symbol, floor])
);
export const gTrainerTowerFloors = parseTrainerTowerFloorTable(trainerTowerSetsSource);

export const getTrainerTowerFloor = (symbol: string): ParsedTrainerTowerFloor | undefined =>
  sTrainerTowerFloorBySymbol.get(symbol);

export const getTrainerTowerChallengeFloors = (challengeType: number): readonly ParsedTrainerTowerFloor[] =>
  (gTrainerTowerFloors[challengeType] ?? []).map((symbol) => {
    const floor = getTrainerTowerFloor(symbol);
    if (!floor) {
      throw new Error(`Missing trainer tower floor ${symbol}`);
    }
    return floor;
  });

export const parseFirstExplicitMon = (floor: ParsedTrainerTowerFloor): ParsedTrainerTowerMonSummary | null => {
  const monMatch = floor.rawInitializer.match(/\{\s*\.species = (SPECIES_[A-Z0-9_]+),([\s\S]*?)\.friendship = (\d+)\s*\}/u);
  if (!monMatch) return null;
  const [, species, body, friendship] = monMatch;
  const moves = body.match(/\.moves = \{([^}]+)\}/u)?.[1].split(',').map((move) => move.trim()) ?? [];
  return {
    species,
    heldItem: body.match(/\.heldItem = ([A-Z0-9_]+)/u)?.[1] ?? '',
    moves,
    nickname: body.match(/\.nickname = _\("([^"]*)"\)/u)?.[1] ?? '',
    hpIV: readNumberField(body, 'hpIV'),
    attackIV: readNumberField(body, 'attackIV'),
    defenseIV: readNumberField(body, 'defenseIV'),
    speedIV: readNumberField(body, 'speedIV'),
    spAttackIV: readNumberField(body, 'spAttackIV'),
    spDefenseIV: readNumberField(body, 'spDefenseIV'),
    friendship: Number.parseInt(friendship, 10)
  };
};

export const createDummyTowerMon = (iv: number): ParsedTrainerTowerMonSummary => ({
  species: '',
  heldItem: '',
  moves: [],
  nickname: '$$$$$$$$$$',
  hpIV: iv,
  attackIV: iv,
  defenseIV: iv,
  speedIV: iv,
  spAttackIV: iv,
  spDefenseIV: iv,
  friendship: 0
});

function parseLocalHeader(source: string): TrainerTowerLocalHeader {
  const block = source.match(/const struct EReaderTrainerTowerSetSubstruct gTrainerTowerLocalHeader = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return {
    numFloors: readConstantOrNumber(block.match(/\.numFloors = ([^,\n]+)/u)?.[1] ?? '0'),
    id: readConstantOrNumber(block.match(/\.id = ([^,\n]+)/u)?.[1] ?? '0')
  };
}

function parseTrainerTowerFloors(source: string): ParsedTrainerTowerFloor[] {
  const floors: ParsedTrainerTowerFloor[] = [];
  const declarationRegex = /static const struct TrainerTowerFloor (sTrainerTowerFloor_[A-Za-z0-9_]+) = \{/gu;
  for (const match of source.matchAll(declarationRegex)) {
    const openBraceIndex = match.index + match[0].lastIndexOf('{');
    const closeBraceIndex = findMatchingBrace(source, openBraceIndex);
    const rawInitializer = source.slice(openBraceIndex, closeBraceIndex + 1);
    const challengeTypeToken = rawInitializer.match(/\.challengeType = ([A-Z0-9_]+)/u)?.[1] ?? '0';
    floors.push({
      symbol: match[1],
      id: readNumberField(rawInitializer, 'id'),
      floorIdx: readConstantOrNumber(rawInitializer.match(/\.floorIdx = ([^,\n]+)/u)?.[1] ?? '0'),
      challengeTypeToken,
      challengeType: challengeTypeByToken[challengeTypeToken] ?? Number.parseInt(challengeTypeToken, 10),
      prize: rawInitializer.match(/\.prize = ([A-Z0-9_]+)/u)?.[1] ?? '',
      checksum: readNumberField(rawInitializer, 'checksum'),
      rawInitializer,
      trainerNames: [...rawInitializer.matchAll(/\.name = _\("([^"]*)"\)/gu)].map(([, name]) => name),
      facilityClasses: [...rawInitializer.matchAll(/\.facilityClass = ([A-Z0-9_]+)/gu)].map(([, facilityClass]) => facilityClass),
      textColors: [...rawInitializer.matchAll(/\.textColor = (\d+)/gu)].map(([, textColor]) => Number.parseInt(textColor, 10)),
      species: [...rawInitializer.matchAll(/\.species = (SPECIES_[A-Z0-9_]+)/gu)].map(([, species]) => species),
      dummyTeamCalls: [...rawInitializer.matchAll(/DUMMY_TOWER_TEAM\((\d+)\)/gu)].map(([, iv]) => Number.parseInt(iv, 10))
    });
  }
  return floors;
}

function parseTrainerTowerFloorTable(source: string): readonly (readonly string[])[] {
  const body = source.match(/const struct TrainerTowerFloor \*const gTrainerTowerFloors\[NUM_TOWER_CHALLENGE_TYPES\]\[MAX_TRAINER_TOWER_FLOORS\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  const table: string[][] = Array.from({ length: NUM_TOWER_CHALLENGE_TYPES }, () => []);
  const rowRegex = /\[(CHALLENGE_TYPE_[A-Z]+|\d+)\]\s*=\s*\{([\s\S]*?)\n\s*\}/gu;
  for (const [, challengeToken, rowBody] of body.matchAll(rowRegex)) {
    const challengeType = challengeIndexByToken[challengeToken];
    if (challengeType === undefined) continue;
    table[challengeType] = [...rowBody.matchAll(/&(sTrainerTowerFloor_[A-Za-z0-9_]+)/gu)].map(([, symbol]) => symbol);
  }
  return table;
}

function findMatchingBrace(source: string, openBraceIndex: number): number {
  let depth = 0;
  for (let i = openBraceIndex; i < source.length; i++) {
    const char = source[i];
    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error(`Could not find matching brace at ${openBraceIndex}`);
}

function readNumberField(source: string, field: string): number {
  return readConstantOrNumber(source.match(new RegExp(`\\.${field} = ([^,\\n]+)`, 'u'))?.[1] ?? '0');
}

function readConstantOrNumber(value: string): number {
  const normalized = value.trim();
  if (normalized === 'MAX_TRAINER_TOWER_FLOORS') return MAX_TRAINER_TOWER_FLOORS;
  if (normalized.startsWith('0x')) return Number.parseInt(normalized, 16);
  return Number.parseInt(normalized, 10);
}
