import levelUpLearnsetPointersSource from '../../../src/data/pokemon/level_up_learnset_pointers.h?raw';
import levelUpLearnsetsSource from '../../../src/data/pokemon/level_up_learnsets.h?raw';
import eggMovesSource from '../../../src/data/pokemon/egg_moves.h?raw';
import tutorLearnsetsSource from '../../../src/data/pokemon/tutor_learnsets.h?raw';
import tmhmLearnsetsSource from '../../../src/data/pokemon/tmhm_learnsets.h?raw';

export interface LevelUpLearnsetPointer {
  species: string;
  learnsetSymbol: string;
}

export interface EggMoveEntry {
  species: string;
  moves: string[];
}

export interface LevelUpLearnset {
  symbol: string;
  moves: Array<{
    level: number;
    move: string;
  }>;
  hasTerminator: boolean;
}

export interface TutorMoveDefinition {
  tutorMove: string;
  move: string;
}

export interface TutorLearnset {
  species: string;
  moves: string[];
}

export interface TmhmLearnset {
  species: string;
  moves: string[];
  rawExpression: string;
}

export const LEVEL_UP_LEARNSET_POINTERS_SOURCE = levelUpLearnsetPointersSource;
export const LEVEL_UP_LEARNSETS_SOURCE = levelUpLearnsetsSource;
export const EGG_MOVES_SOURCE = eggMovesSource;
export const TUTOR_LEARNSETS_SOURCE = tutorLearnsetsSource;
export const TMHM_LEARNSETS_SOURCE = tmhmLearnsetsSource;

export const parseLevelUpLearnsetPointers = (source: string): LevelUpLearnsetPointer[] =>
  [...source.matchAll(/\[(SPECIES_\w+)\]\s*=\s*(s\w+LevelUpLearnset)/gu)].map((match) => ({
    species: match[1],
    learnsetSymbol: match[2]
  }));

export const parseEggMoves = (source: string): EggMoveEntry[] =>
  [...source.matchAll(/^\s*egg_moves\((\w+),([\s\S]*?)\),/gmu)].map((match) => ({
    species: `SPECIES_${match[1]}`,
    moves: [...match[2].matchAll(/\b(MOVE_\w+)\b/gu)].map((moveMatch) => moveMatch[1])
  }));

export const parseLevelUpLearnsets = (source: string): LevelUpLearnset[] =>
  [...source.matchAll(/static const u16 (s\w+LevelUpLearnset)\[\]\s*=\s*\{([\s\S]*?)\n\};/gu)].map((match) => ({
    symbol: match[1],
    moves: [...match[2].matchAll(/LEVEL_UP_MOVE\((\d+),\s*(MOVE_\w+)\)/gu)].map((moveMatch) => ({
      level: Number.parseInt(moveMatch[1], 10),
      move: moveMatch[2]
    })),
    hasTerminator: /\bLEVEL_UP_END\b/u.test(match[2])
  }));

export const parseTutorMoveDefinitions = (source: string): TutorMoveDefinition[] =>
  [...source.matchAll(/\[(TUTOR_MOVE_\w+)\]\s*=\s*(MOVE_\w+)/gu)].map((match) => ({
    tutorMove: match[1],
    move: match[2]
  }));

export const parseTutorLearnsets = (source: string): TutorLearnset[] =>
  [...source.matchAll(/\[(SPECIES_\w+)\]\s*=\s*([\s\S]*?)(?=,\n\n\s*\[SPECIES_|\n\};)/gu)].map((match) => ({
    species: match[1],
    moves: [...match[2].matchAll(/TUTOR\((MOVE_\w+)\)/gu)].map((moveMatch) => moveMatch[1])
  }));

export const parseTmhmLearnsets = (source: string): TmhmLearnset[] =>
  [...source.matchAll(/^\s*\[(SPECIES_\w+)\]\s*=\s*TMHM_LEARNSET\(([\s\S]*?)\),/gmu)].map((match) => ({
    species: match[1],
    moves: [...match[2].matchAll(/TMHM\(([^)]+)\)/gu)].map((moveMatch) => moveMatch[1]),
    rawExpression: match[2].trim()
  }));

export const gLevelUpLearnsets = parseLevelUpLearnsetPointers(levelUpLearnsetPointersSource);
export const sLevelUpLearnsets = parseLevelUpLearnsets(levelUpLearnsetsSource);
export const gEggMoves = parseEggMoves(eggMovesSource);
export const sTutorMoves = parseTutorMoveDefinitions(tutorLearnsetsSource);
export const sTutorLearnsets = parseTutorLearnsets(tutorLearnsetsSource);
export const sTMHMLearnsets = parseTmhmLearnsets(tmhmLearnsetsSource);

export const EGG_MOVES_SPECIES_OFFSET = 20000;
export const EGG_MOVES_TERMINATOR = 0xffff;

export const getLevelUpLearnsetSymbol = (species: string): string | undefined =>
  gLevelUpLearnsets.find((entry) => entry.species === species)?.learnsetSymbol;

export const getEggMoves = (species: string): string[] =>
  gEggMoves.find((entry) => entry.species === species)?.moves.slice() ?? [];

export const getLevelUpLearnset = (symbol: string): LevelUpLearnset | undefined =>
  sLevelUpLearnsets.find((entry) => entry.symbol === symbol);

export const getTutorMoves = (species: string): string[] =>
  sTutorLearnsets.find((entry) => entry.species === species)?.moves.slice() ?? [];

export const getTmhmMoves = (species: string): string[] =>
  sTMHMLearnsets.find((entry) => entry.species === species)?.moves.slice() ?? [];
