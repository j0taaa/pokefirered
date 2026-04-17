import battleBgSource from '../../../src/battle_bg.c?raw';
import battleScriptsSource from '../../../data/battle_scripts_1.s?raw';
import battleMovesSource from '../../../src/data/battle_moves.h?raw';
import battleMoveEffectsSource from '../../../include/constants/battle_move_effects.h?raw';
import levelUpLearnsetsSource from '../../../src/data/pokemon/level_up_learnsets.h?raw';
import levelUpLearnsetPointersSource from '../../../src/data/pokemon/level_up_learnset_pointers.h?raw';
import type { DecompTypeId } from './decompSpecies';

export interface DecompBattleMove {
  id: string;
  effect: string;
  effectId: number;
  effectScriptLabel: string;
  power: number;
  type: DecompTypeId;
  accuracy: number;
  pp: number;
  priority: number;
  target: string;
  secondaryEffectChance: number;
  displayName: string;
}

export type DecompBattleTerrainId =
  | 'BATTLE_TERRAIN_GRASS'
  | 'BATTLE_TERRAIN_LONG_GRASS'
  | 'BATTLE_TERRAIN_SAND'
  | 'BATTLE_TERRAIN_UNDERWATER'
  | 'BATTLE_TERRAIN_WATER'
  | 'BATTLE_TERRAIN_POND'
  | 'BATTLE_TERRAIN_MOUNTAIN'
  | 'BATTLE_TERRAIN_CAVE'
  | 'BATTLE_TERRAIN_BUILDING'
  | 'BATTLE_TERRAIN_PLAIN'
  | 'BATTLE_TERRAIN_LINK'
  | 'BATTLE_TERRAIN_GYM'
  | 'BATTLE_TERRAIN_LEADER'
  | 'BATTLE_TERRAIN_INDOOR_2'
  | 'BATTLE_TERRAIN_INDOOR_1'
  | 'BATTLE_TERRAIN_LORELEI'
  | 'BATTLE_TERRAIN_BRUNO'
  | 'BATTLE_TERRAIN_AGATHA'
  | 'BATTLE_TERRAIN_LANCE'
  | 'BATTLE_TERRAIN_CHAMPION';

const typeMap: Record<string, DecompTypeId> = {
  TYPE_NORMAL: 'normal',
  TYPE_FIRE: 'fire',
  TYPE_WATER: 'water',
  TYPE_GRASS: 'grass',
  TYPE_ELECTRIC: 'electric',
  TYPE_ICE: 'ice',
  TYPE_FIGHTING: 'fighting',
  TYPE_POISON: 'poison',
  TYPE_GROUND: 'ground',
  TYPE_FLYING: 'flying',
  TYPE_PSYCHIC: 'psychic',
  TYPE_BUG: 'bug',
  TYPE_ROCK: 'rock',
  TYPE_GHOST: 'ghost',
  TYPE_DRAGON: 'dragon',
  TYPE_DARK: 'dark',
  TYPE_STEEL: 'steel'
};

const normalizeSpecies = (species: string): string => species.replace(/^SPECIES_/u, '').toUpperCase();
const normalizeMove = (move: string): string => move.replace(/^MOVE_/u, '').toUpperCase();

const formatDisplayName = (token: string): string => token.replace(/_/gu, ' ');

const parseMoveEffects = (source: string): Map<string, number> => {
  const effectIds = new Map<string, number>();
  const effectRegex = /^#define (EFFECT_\w+) (\d+)/gmu;

  for (const match of source.matchAll(effectRegex)) {
    effectIds.set(match[1], Number.parseInt(match[2], 10));
  }

  return effectIds;
};

const parseEffectScripts = (source: string): Map<string, string> => {
  const effectScripts = new Map<string, string>();
  const effectScriptRegex = /^\s*\.4byte\s+(\w+)\s+@ (EFFECT_\w+)/gmu;

  for (const match of source.matchAll(effectScriptRegex)) {
    effectScripts.set(match[2], match[1]);
  }

  return effectScripts;
};

const parseBattleMoves = (
  source: string,
  effectIds: Map<string, number>,
  effectScripts: Map<string, string>
): Map<string, DecompBattleMove> => {
  const moves = new Map<string, DecompBattleMove>();
  const moveRegex = /\[MOVE_(\w+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/gu;

  for (const match of source.matchAll(moveRegex)) {
    const id = normalizeMove(match[1]);
    const block = match[2];
    const effect = block.match(/\.effect = (EFFECT_\w+)/u)?.[1] ?? 'EFFECT_HIT';
    const typeToken = block.match(/\.type = (TYPE_\w+)/u)?.[1] ?? 'TYPE_NORMAL';

    moves.set(id, {
      id,
      effect,
      effectId: effectIds.get(effect) ?? 0,
      effectScriptLabel: effectScripts.get(effect) ?? 'BattleScript_EffectHit',
      power: Number.parseInt(block.match(/\.power = (\d+)/u)?.[1] ?? '0', 10),
      type: typeMap[typeToken] ?? 'normal',
      accuracy: Number.parseInt(block.match(/\.accuracy = (\d+)/u)?.[1] ?? '0', 10),
      pp: Number.parseInt(block.match(/\.pp = (\d+)/u)?.[1] ?? '0', 10),
      priority: Number.parseInt(block.match(/\.priority = (-?\d+)/u)?.[1] ?? '0', 10),
      target: block.match(/\.target = (MOVE_TARGET_\w+)/u)?.[1] ?? 'MOVE_TARGET_SELECTED',
      secondaryEffectChance: Number.parseInt(block.match(/\.secondaryEffectChance = (\d+)/u)?.[1] ?? '0', 10),
      displayName: formatDisplayName(id)
    });
  }

  return moves;
};

interface LearnsetMove {
  level: number;
  moveId: string;
}

const parseLearnsetBlocks = (source: string): Map<string, LearnsetMove[]> => {
  const blocks = new Map<string, LearnsetMove[]>();
  const learnsetRegex = /static const u16 (s\w+LevelUpLearnset)\[\] = \{([\s\S]*?)LEVEL_UP_END/gu;

  for (const match of source.matchAll(learnsetRegex)) {
    const label = match[1];
    const moves: LearnsetMove[] = [];
    const block = match[2];
    const moveRegex = /LEVEL_UP_MOVE\((\d+), MOVE_(\w+)\)/gu;

    for (const moveMatch of block.matchAll(moveRegex)) {
      moves.push({
        level: Number.parseInt(moveMatch[1], 10),
        moveId: normalizeMove(moveMatch[2])
      });
    }

    blocks.set(label, moves);
  }

  return blocks;
};

const parseLearnsetPointers = (source: string): Map<string, string> => {
  const pointers = new Map<string, string>();
  const pointerRegex = /\[SPECIES_(\w+)\]\s*=\s*(s\w+LevelUpLearnset)/gu;

  for (const match of source.matchAll(pointerRegex)) {
    pointers.set(normalizeSpecies(match[1]), match[2]);
  }

  return pointers;
};

const parseMapSceneTerrainMapping = (source: string): Map<string, DecompBattleTerrainId> => {
  const mapping = new Map<string, DecompBattleTerrainId>();
  const mappingRegex = /\{(MAP_BATTLE_SCENE_\w+),\s+(BATTLE_TERRAIN_\w+)\}/gu;

  for (const match of source.matchAll(mappingRegex)) {
    mapping.set(match[1], match[2] as DecompBattleTerrainId);
  }

  return mapping;
};

const moveEffects = parseMoveEffects(battleMoveEffectsSource);
const effectScripts = parseEffectScripts(battleScriptsSource);
const decompBattleMoves = parseBattleMoves(battleMovesSource, moveEffects, effectScripts);
const learnsetBlocks = parseLearnsetBlocks(levelUpLearnsetsSource);
const learnsetPointers = parseLearnsetPointers(levelUpLearnsetPointersSource);
const mapSceneTerrainMapping = parseMapSceneTerrainMapping(battleBgSource);

export const getDecompBattleMove = (moveId: string): DecompBattleMove | null =>
  decompBattleMoves.get(normalizeMove(moveId)) ?? null;

export const getDecompLevelUpMoves = (species: string, level: number): DecompBattleMove[] => {
  const pointer = learnsetPointers.get(normalizeSpecies(species));
  if (!pointer) {
    return [];
  }

  const learnset = learnsetBlocks.get(pointer) ?? [];
  const selected: DecompBattleMove[] = [];
  const seen = new Set<string>();

  for (let i = learnset.length - 1; i >= 0 && selected.length < 4; i -= 1) {
    const entry = learnset[i];
    if (entry.level > level || seen.has(entry.moveId)) {
      continue;
    }

    const move = getDecompBattleMove(entry.moveId);
    if (!move) {
      continue;
    }

    seen.add(entry.moveId);
    selected.push(move);
  }

  return selected.reverse();
};

export const getFallbackBattleMoves = (): DecompBattleMove[] => {
  const tackle = getDecompBattleMove('TACKLE');
  return tackle ? [tackle] : [];
};

export const getBattleTerrainForScene = (
  mapBattleScene = 'MAP_BATTLE_SCENE_NORMAL',
  context?: { mapId?: string; encounterKind?: 'land' | 'water' }
): DecompBattleTerrainId => {
  const mapped = mapSceneTerrainMapping.get(mapBattleScene);
  if (mapped) {
    return mapped;
  }

  if (context?.encounterKind === 'water') {
    return 'BATTLE_TERRAIN_WATER';
  }

  if (context?.mapId?.includes('ROCK_TUNNEL')) {
    return 'BATTLE_TERRAIN_CAVE';
  }

  return 'BATTLE_TERRAIN_GRASS';
};
