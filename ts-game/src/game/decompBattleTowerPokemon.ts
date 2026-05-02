import battleTowerLevel50Source from '../../../src/data/battle_tower/level_50_mons.h?raw';
import battleTowerLevel100Source from '../../../src/data/battle_tower/level_100_mons.h?raw';

export interface BattleTowerPokemonTemplate {
  species: string;
  heldItem: string;
  teamFlags: string;
  moves: string[];
  evSpread: string;
  nature: string;
}

export const BATTLE_TOWER_LEVEL_50_SOURCE = battleTowerLevel50Source;
export const BATTLE_TOWER_LEVEL_100_SOURCE = battleTowerLevel100Source;

export const parseBattleTowerPokemonTemplates = (source: string): BattleTowerPokemonTemplate[] =>
  [
    ...source.matchAll(
      /\{\s*\.species = (SPECIES_\w+),\s*\.heldItem = (BATTLE_TOWER_ITEM_\w+),\s*\.teamFlags = (0x[0-9A-Fa-f]+|\d+),\s*\.moves = \{([\s\S]*?)\},\s*\.evSpread = ([^,]+),\s*\.nature = (NATURE_\w+),\s*\},/gu
    )
  ].map((match) => ({
    species: match[1],
    heldItem: match[2],
    teamFlags: match[3],
    moves: [...match[4].matchAll(/MOVE_\w+/gu)].map((move) => move[0]),
    evSpread: match[5].trim(),
    nature: match[6]
  }));

export const gBattleTowerLevel50Mons = parseBattleTowerPokemonTemplates(battleTowerLevel50Source);
export const gBattleTowerLevel100Mons = parseBattleTowerPokemonTemplates(battleTowerLevel100Source);
