import { describe, expect, test } from 'vitest';
import {
  BATTLE_MOVES_H_TRANSLATION_UNIT,
  BATTLE_MOVES_SOURCE,
  getRawBattleMoveDefinitions
} from '../src/game/decompBattleMoves';
import {
  LEVEL_UP_LEARNSETS_H_TRANSLATION_UNIT,
  LEVEL_UP_LEARNSETS_SOURCE,
  getRawLevelUpLearnsets
} from '../src/game/decompLevelUpLearnsets';
import {
  LEVEL_UP_LEARNSET_POINTERS_H_TRANSLATION_UNIT,
  LEVEL_UP_LEARNSET_POINTERS_SOURCE,
  getRawLevelUpLearnsetPointers
} from '../src/game/decompLevelUpLearnsetPointers';
import {
  ABILITIES_H_TRANSLATION_UNIT,
  gAbilityDescriptionPointers,
  gAbilityNames
} from '../src/game/decompAbilities';
import {
  TRAINERS_H_TRANSLATION_UNIT,
  getRawTrainerDefinitions
} from '../src/game/decompTrainers';
import {
  TRAINER_PARTIES_H_TRANSLATION_UNIT,
  getRawTrainerPartyDefinitions
} from '../src/game/decompTrainerParties';
import {
  BATTLE_TOWER_LEVEL_50_MONS_H_TRANSLATION_UNIT,
  gBattleTowerLevel50Mons
} from '../src/game/decompBattleTowerLevel50Mons';
import {
  BATTLE_TOWER_LEVEL_100_MONS_H_TRANSLATION_UNIT,
  gBattleTowerLevel100Mons
} from '../src/game/decompBattleTowerLevel100Mons';

describe('decomp data header facades', () => {
  test('anchors battle move and level-up data headers to exact parsed decomp tables', () => {
    expect(BATTLE_MOVES_H_TRANSLATION_UNIT).toBe('src/data/battle_moves.h');
    expect(BATTLE_MOVES_SOURCE).toContain('const struct BattleMove gBattleMoves[MOVES_COUNT]');
    expect(getRawBattleMoveDefinitions()).toHaveLength(355);
    expect(getRawBattleMoveDefinitions()[52]?.move).toBe('MOVE_EMBER');

    expect(LEVEL_UP_LEARNSETS_H_TRANSLATION_UNIT).toBe('src/data/pokemon/level_up_learnsets.h');
    expect(LEVEL_UP_LEARNSETS_SOURCE).toContain('sBulbasaurLevelUpLearnset');
    expect(getRawLevelUpLearnsets().find((entry) => entry.label === 'sBulbasaurLevelUpLearnset')?.moves[0]).toEqual({
      level: 1,
      moveId: 'TACKLE'
    });

    expect(LEVEL_UP_LEARNSET_POINTERS_H_TRANSLATION_UNIT).toBe('src/data/pokemon/level_up_learnset_pointers.h');
    expect(LEVEL_UP_LEARNSET_POINTERS_SOURCE).toContain('[SPECIES_BULBASAUR] = sBulbasaurLevelUpLearnset');
    expect(getRawLevelUpLearnsetPointers().find((entry) => entry.species === 'BULBASAUR')).toEqual({
      species: 'BULBASAUR',
      label: 'sBulbasaurLevelUpLearnset'
    });
  });

  test('anchors text, trainer, and battle tower data headers to exact parsed decomp rows', () => {
    expect(ABILITIES_H_TRANSLATION_UNIT).toBe('src/data/text/abilities.h');
    expect(gAbilityDescriptionPointers).toHaveLength(78);
    expect(gAbilityNames.at(-1)).toEqual({ ability: 'ABILITY_AIR_LOCK', name: 'AIR LOCK' });

    expect(TRAINERS_H_TRANSLATION_UNIT).toBe('src/data/trainers.h');
    expect(getRawTrainerDefinitions()).toHaveLength(743);
    expect(getRawTrainerDefinitions().find((trainer) => trainer.trainerId === 'TRAINER_LEADER_BROCK')?.trainerName).toBe('BROCK');

    expect(TRAINER_PARTIES_H_TRANSLATION_UNIT).toBe('src/data/trainer_parties.h');
    expect(getRawTrainerPartyDefinitions()).toHaveLength(742);
    expect(getRawTrainerPartyDefinitions().find((party) => party.partyName === 'sParty_LeaderBrock')?.mons.at(-1)?.species).toBe('SPECIES_ONIX');

    expect(BATTLE_TOWER_LEVEL_50_MONS_H_TRANSLATION_UNIT).toBe('src/data/battle_tower/level_50_mons.h');
    expect(gBattleTowerLevel50Mons).toHaveLength(300);
    expect(gBattleTowerLevel50Mons[0]?.species).toBe('SPECIES_PIKACHU');

    expect(BATTLE_TOWER_LEVEL_100_MONS_H_TRANSLATION_UNIT).toBe('src/data/battle_tower/level_100_mons.h');
    expect(gBattleTowerLevel100Mons).toHaveLength(300);
    expect(gBattleTowerLevel100Mons[0]?.species).toBe('SPECIES_LINOONE');
  });
});
