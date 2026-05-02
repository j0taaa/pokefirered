import ingameTradesSource from '../../../src/data/ingame_trades.h?raw';
import levelUpLearnsetPointersSource from '../../../src/data/pokemon/level_up_learnset_pointers.h?raw';
import levelUpLearnsetsSource from '../../../src/data/pokemon/level_up_learnsets.h?raw';
import speciesInfoSource from '../../../src/data/pokemon/species_info.h?raw';
import tutorLearnsetsSource from '../../../src/data/pokemon/tutor_learnsets.h?raw';
import type { FieldPokemon } from './pokemonStorage';

export interface DecompInGameTradeDefinition {
  id: number;
  tradeId: string;
  nickname: string;
  species: string;
  requestedSpecies: string;
  heldItemId: string | null;
  otName: string;
  otId: number;
  otGender: 'male' | 'female';
  personality: number;
}

interface DecompSpeciesBreedingInfo {
  eggGroups: string[];
  genderRatioToken: string;
}

interface LevelUpMoveEntry {
  level: number;
  moveId: string;
}

const normalizeSpecies = (species: string): string => species.replace(/^SPECIES_/u, '').toUpperCase();

const normalizeFireRedConditionalSource = (source: string): string =>
  source.replace(
    /#if defined\(FIRERED\)\s*([\s\S]*?)#elif defined\(LEAFGREEN\)\s*[\s\S]*?#endif/gu,
    '$1'
  );

const decodeCText = (value: string): string =>
  value
    .replace(/\\n/gu, '\n')
    .replace(/\\p/gu, ' ')
    .replace(/\\l/gu, ' ')
    .replace(/\\e/gu, '')
    .replace(/\$/gu, '')
    .trim();

const parseTradeDefinitions = (source: string): DecompInGameTradeDefinition[] => {
  const definitions: DecompInGameTradeDefinition[] = [];
  const normalizedSource = normalizeFireRedConditionalSource(source);
  const entryRe = /\[(INGAME_TRADE_[A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/gu;

  for (const match of normalizedSource.matchAll(entryRe)) {
    const block = match[2];
    definitions.push({
      id: definitions.length,
      tradeId: match[1],
      nickname: decodeCText(block.match(/\.nickname = _\("((?:[^"\\]|\\.)*)"\)/u)?.[1] ?? match[1]),
      species: normalizeSpecies(block.match(/\.species = (SPECIES_[A-Z0-9_]+)/u)?.[1] ?? 'SPECIES_NONE'),
      requestedSpecies: normalizeSpecies(block.match(/\.requestedSpecies = (SPECIES_[A-Z0-9_]+)/u)?.[1] ?? 'SPECIES_NONE'),
      heldItemId: (() => {
        const itemToken = block.match(/\.heldItem = (ITEM_[A-Z0-9_]+)/u)?.[1] ?? 'ITEM_NONE';
        return itemToken === 'ITEM_NONE' ? null : itemToken;
      })(),
      otName: decodeCText(block.match(/\.otName = _\("((?:[^"\\]|\\.)*)"\)/u)?.[1] ?? 'TRAINER'),
      otId: Number.parseInt(block.match(/\.otId = (\d+)/u)?.[1] ?? '0', 10),
      otGender: (block.match(/\.otGender = (MALE|FEMALE)/u)?.[1] ?? 'MALE') === 'FEMALE' ? 'female' : 'male',
      personality: Number.parseInt(block.match(/\.personality = 0x([0-9a-f]+)/iu)?.[1] ?? '0', 16)
    });
  }

  return definitions;
};

const parseSpeciesBreedingInfo = (source: string): Map<string, DecompSpeciesBreedingInfo> => {
  const info = new Map<string, DecompSpeciesBreedingInfo>();
  const entryRe = /\[SPECIES_([A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/gu;

  for (const match of source.matchAll(entryRe)) {
    const block = match[2];
    const eggGroups = block.match(/\.eggGroups = \{(EGG_GROUP_[A-Z0-9_]+), (EGG_GROUP_[A-Z0-9_]+)\}/u);
    info.set(normalizeSpecies(match[1]), {
      eggGroups: eggGroups ? [eggGroups[1], eggGroups[2]] : ['EGG_GROUP_UNDISCOVERED', 'EGG_GROUP_UNDISCOVERED'],
      genderRatioToken: block.match(/\.genderRatio = ([^,]+)/u)?.[1]?.trim() ?? 'PERCENT_FEMALE(50)'
    });
  }

  return info;
};

const parseLearnsets = (
  learnsetsSource: string,
  pointersSource: string
): Map<string, LevelUpMoveEntry[]> => {
  const symbolToMoves = new Map<string, LevelUpMoveEntry[]>();
  const learnsetRe = /static const u16 ([A-Za-z0-9_]+)\[\] = \{([\s\S]*?)\n\s*\};/gu;
  const learnsetMoveRe = /LEVEL_UP_MOVE\((\d+),\s*(MOVE_[A-Z0-9_]+)\)/gu;

  for (const match of learnsetsSource.matchAll(learnsetRe)) {
    const moves = [...match[2].matchAll(learnsetMoveRe)].map((entry) => ({
      level: Number.parseInt(entry[1], 10),
      moveId: entry[2]
    }));
    symbolToMoves.set(match[1], moves);
  }

  const speciesToMoves = new Map<string, LevelUpMoveEntry[]>();
  const pointerRe = /\[SPECIES_([A-Z0-9_]+)\]\s*=\s*([A-Za-z0-9_]+)/gu;

  for (const match of pointersSource.matchAll(pointerRe)) {
    const moves = symbolToMoves.get(match[2]) ?? [];
    speciesToMoves.set(normalizeSpecies(match[1]), moves);
  }

  return speciesToMoves;
};

const parseTutorMoveIds = (source: string): Map<number, string> => {
  const tutorMoveIds = new Map<number, string>();
  const tutorMoveRe = /\[TUTOR_MOVE_[A-Z0-9_]+\]\s*=\s*(MOVE_[A-Z0-9_]+)/gu;
  let tutorId = 0;

  for (const match of source.matchAll(tutorMoveRe)) {
    tutorMoveIds.set(tutorId, match[1]);
    tutorId += 1;
  }

  tutorMoveIds.set(15, 'MOVE_FRENZY_PLANT');
  tutorMoveIds.set(16, 'MOVE_BLAST_BURN');
  tutorMoveIds.set(17, 'MOVE_HYDRO_CANNON');

  return tutorMoveIds;
};

const parseTutorLearnsets = (source: string): Map<string, Set<string>> => {
  const learnsets = new Map<string, Set<string>>();
  const entryRe = /\[SPECIES_([A-Z0-9_]+)\]\s*=\s*([\s\S]*?)(?=,\s*\n\s*\[SPECIES_|\n\};)/gu;

  for (const match of source.matchAll(entryRe)) {
    const moveIds = new Set<string>();
    for (const moveMatch of match[2].matchAll(/TUTOR\((MOVE_[A-Z0-9_]+)\)/gu)) {
      moveIds.add(moveMatch[1]);
    }
    learnsets.set(normalizeSpecies(match[1]), moveIds);
  }

  return learnsets;
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
};

const getPersonalitySeed = (pokemon: FieldPokemon): number =>
  Math.trunc(
    pokemon.personality
    ?? pokemon.otId
    ?? hashString(`${pokemon.species}:${pokemon.nickname ?? ''}:${pokemon.level}`)
  ) >>> 0;

const getPokemonGender = (
  pokemon: FieldPokemon,
  breedingInfo: Map<string, DecompSpeciesBreedingInfo>
): 'male' | 'female' | 'genderless' => {
  const info = breedingInfo.get(normalizeSpecies(pokemon.species));
  if (!info) {
    return 'genderless';
  }

  switch (info.genderRatioToken) {
    case 'MON_MALE':
      return 'male';
    case 'MON_FEMALE':
      return 'female';
    case 'MON_GENDERLESS':
      return 'genderless';
    default: {
      const femalePercent = Number.parseInt(info.genderRatioToken.match(/PERCENT_FEMALE\((\d+(?:\.\d+)?)\)/u)?.[1] ?? '50', 10);
      return getPersonalitySeed(pokemon) % 100 < femalePercent ? 'female' : 'male';
    }
  }
};

const overlapsEggGroups = (left: string[], right: string[]): boolean =>
  left.some((group) => right.includes(group));

const tradeDefinitions = parseTradeDefinitions(ingameTradesSource);
const speciesBreedingInfo = parseSpeciesBreedingInfo(speciesInfoSource);
const relearnableMovesBySpecies = parseLearnsets(levelUpLearnsetsSource, levelUpLearnsetPointersSource);
const tutorMoveIds = parseTutorMoveIds(tutorLearnsetsSource);
const tutorLearnsets = parseTutorLearnsets(tutorLearnsetsSource);

export const getDecompInGameTradeDefinition = (tradeId: number): DecompInGameTradeDefinition | null =>
  tradeDefinitions[tradeId] ?? null;

export const formatDecompMoveName = (moveId: string): string =>
  moveId.replace(/^MOVE_/u, '').replace(/_/gu, ' ');

export const getTutorMoveId = (tutorId: number): string | null =>
  tutorMoveIds.get(tutorId) ?? null;

export const canPokemonLearnTutorMove = (
  pokemon: FieldPokemon,
  tutorId: number
): boolean => {
  if (pokemon.isEgg) {
    return false;
  }

  const species = normalizeSpecies(pokemon.species);
  switch (tutorId) {
    case 15:
      return species === 'VENUSAUR';
    case 16:
      return species === 'CHARIZARD';
    case 17:
      return species === 'BLASTOISE';
    default: {
      const moveId = getTutorMoveId(tutorId);
      return !!moveId && (tutorLearnsets.get(species)?.has(moveId) ?? false);
    }
  }
};

export const canPokemonBeTaughtTutorMove = (
  pokemon: FieldPokemon,
  tutorId: number
): boolean => {
  if (!canPokemonLearnTutorMove(pokemon, tutorId)) {
    return false;
  }

  const moveId = getTutorMoveId(tutorId);
  const moveName = moveId ? formatDecompMoveName(moveId).toUpperCase() : null;
  return !moveName || !(pokemon.moves ?? []).map((move) => move.toUpperCase()).includes(moveName);
};

export const getRelearnableMovesForPokemon = (pokemon: FieldPokemon): string[] => {
  const learnset = relearnableMovesBySpecies.get(normalizeSpecies(pokemon.species)) ?? [];
  const knownMoves = new Set((pokemon.moves ?? []).map((move) => move.toUpperCase()));
  const seenMoves = new Set<string>();
  const relearnable: string[] = [];

  for (const moveId of learnset) {
    if (moveId.level > pokemon.level || seenMoves.has(moveId.moveId)) {
      continue;
    }
    seenMoves.add(moveId.moveId);
    const moveName = formatDecompMoveName(moveId.moveId).toUpperCase();
    if (!knownMoves.has(moveName)) {
      relearnable.push(moveId.moveId);
    }
  }

  return relearnable;
};

export const getDaycareCompatibilityText = (
  first: FieldPokemon,
  second: FieldPokemon
): string => {
  const firstInfo = speciesBreedingInfo.get(normalizeSpecies(first.species));
  const secondInfo = speciesBreedingInfo.get(normalizeSpecies(second.species));
  if (!firstInfo || !secondInfo) {
    return "The two prefer to play with other\nPOKeMON than each other.";
  }

  if (firstInfo.eggGroups[0] === 'EGG_GROUP_UNDISCOVERED' || secondInfo.eggGroups[0] === 'EGG_GROUP_UNDISCOVERED') {
    return "The two prefer to play with other\nPOKeMON than each other.";
  }

  const firstIsDitto = firstInfo.eggGroups[0] === 'EGG_GROUP_DITTO';
  const secondIsDitto = secondInfo.eggGroups[0] === 'EGG_GROUP_DITTO';
  if (firstIsDitto && secondIsDitto) {
    return "The two prefer to play with other\nPOKeMON than each other.";
  }

  if (firstIsDitto || secondIsDitto) {
    return first.otId === second.otId
      ? "The two don't seem to like\neach other much."
      : 'The two seem to get along.';
  }

  const firstGender = getPokemonGender(first, speciesBreedingInfo);
  const secondGender = getPokemonGender(second, speciesBreedingInfo);
  if (firstGender === secondGender || firstGender === 'genderless' || secondGender === 'genderless') {
    return "The two prefer to play with other\nPOKeMON than each other.";
  }

  if (!overlapsEggGroups(firstInfo.eggGroups, secondInfo.eggGroups)) {
    return "The two prefer to play with other\nPOKeMON than each other.";
  }

  if (normalizeSpecies(first.species) === normalizeSpecies(second.species)) {
    return first.otId === second.otId
      ? 'The two seem to get along.'
      : 'The two seem to get along\nvery well.';
  }

  return first.otId !== second.otId
    ? 'The two seem to get along.'
    : "The two don't seem to like\neach other much.";
};
