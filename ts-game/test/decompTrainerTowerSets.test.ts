import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  CHALLENGE_TYPE_DOUBLE,
  CHALLENGE_TYPE_KNOCKOUT,
  CHALLENGE_TYPE_MIXED,
  CHALLENGE_TYPE_SINGLE,
  MAX_TRAINER_TOWER_FLOORS,
  createDummyTowerMon,
  gTrainerTowerFloors,
  gTrainerTowerLocalHeader,
  getTrainerTowerChallengeFloors,
  getTrainerTowerFloor,
  parseFirstExplicitMon,
  sTrainerTowerFloors
} from '../src/game/decompTrainerTowerSets';

const repoRoot = resolve(__dirname, '../..');
const trainerTowerSetsC = readFileSync(resolve(repoRoot, 'src/trainer_tower_sets.c'), 'utf8');

describe('decomp trainer_tower_sets', () => {
  test('parses every TrainerTowerFloor declaration and preserves local header constants', () => {
    const sourceSymbols = [...trainerTowerSetsC.matchAll(/static const struct TrainerTowerFloor (sTrainerTowerFloor_[A-Za-z0-9_]+) = \{/gu)]
      .map(([, symbol]) => symbol);

    expect(sTrainerTowerFloors.map((floor) => floor.symbol)).toEqual(sourceSymbols);
    expect(sTrainerTowerFloors).toHaveLength(32);
    expect(gTrainerTowerLocalHeader).toEqual({ numFloors: MAX_TRAINER_TOWER_FLOORS, id: 1 });
  });

  test('preserves representative floor metadata, trainers, mon species, dummy teams, and checksums', () => {
    const single4 = getTrainerTowerFloor('sTrainerTowerFloor_Single_4');
    expect(single4).toMatchObject({
      id: 1,
      floorIdx: MAX_TRAINER_TOWER_FLOORS,
      challengeTypeToken: 'CHALLENGE_TYPE_SINGLE',
      challengeType: CHALLENGE_TYPE_SINGLE,
      prize: 'TTPRIZE_WHITE_HERB',
      checksum: 0x00016aab,
      trainerNames: ['COLE'],
      facilityClasses: ['FACILITY_CLASS_YOUNGSTER'],
      textColors: [1],
      dummyTeamCalls: [0, 0]
    });
    expect(single4?.species.slice(0, 6)).toEqual([
      'SPECIES_RATICATE',
      'SPECIES_MAGMAR',
      'SPECIES_MAGCARGO',
      'SPECIES_PRIMEAPE',
      'SPECIES_GOLBAT',
      'SPECIES_SLOWBRO'
    ]);

    const firstMon = parseFirstExplicitMon(single4!);
    expect(firstMon).toEqual({
      species: 'SPECIES_RATICATE',
      heldItem: 'ITEM_SITRUS_BERRY',
      moves: ['MOVE_SHOCK_WAVE', 'MOVE_HYPER_FANG', 'MOVE_SCARY_FACE', 'MOVE_ENDEAVOR'],
      nickname: 'RATICATE',
      hpIV: 20,
      attackIV: 20,
      defenseIV: 20,
      speedIV: 20,
      spAttackIV: 20,
      spDefenseIV: 20,
      friendship: 255
    });
  });

  test('preserves the gTrainerTowerFloors challenge table order, including mixed aliases', () => {
    expect(gTrainerTowerFloors).toEqual([
      [
        'sTrainerTowerFloor_Single_1',
        'sTrainerTowerFloor_Single_2',
        'sTrainerTowerFloor_Single_3',
        'sTrainerTowerFloor_Single_4',
        'sTrainerTowerFloor_Single_5',
        'sTrainerTowerFloor_Single_6',
        'sTrainerTowerFloor_Single_7',
        'sTrainerTowerFloor_Single_8'
      ],
      [
        'sTrainerTowerFloor_Double_1',
        'sTrainerTowerFloor_Double_2',
        'sTrainerTowerFloor_Double_3',
        'sTrainerTowerFloor_Double_4',
        'sTrainerTowerFloor_Double_5',
        'sTrainerTowerFloor_Double_6',
        'sTrainerTowerFloor_Double_7',
        'sTrainerTowerFloor_Double_8'
      ],
      [
        'sTrainerTowerFloor_Knockout_1',
        'sTrainerTowerFloor_Knockout_2',
        'sTrainerTowerFloor_Knockout_3',
        'sTrainerTowerFloor_Knockout_4',
        'sTrainerTowerFloor_Knockout_5',
        'sTrainerTowerFloor_Knockout_6',
        'sTrainerTowerFloor_Knockout_7',
        'sTrainerTowerFloor_Knockout_8'
      ],
      [
        'sTrainerTowerFloor_Mixed_1',
        'sTrainerTowerFloor_Mixed_2',
        'sTrainerTowerFloor_Mixed_3',
        'sTrainerTowerFloor_Double_8',
        'sTrainerTowerFloor_Mixed_5',
        'sTrainerTowerFloor_Knockout_8',
        'sTrainerTowerFloor_Double_3',
        'sTrainerTowerFloor_Knockout_2'
      ]
    ]);

    expect(getTrainerTowerChallengeFloors(CHALLENGE_TYPE_DOUBLE).map((floor) => floor.id)).toEqual([13, 6, 12, 14, 4, 5, 29, 21]);
    expect(getTrainerTowerChallengeFloors(CHALLENGE_TYPE_KNOCKOUT).map((floor) => floor.challengeType).every((type) => type === CHALLENGE_TYPE_KNOCKOUT)).toBe(true);
    expect(getTrainerTowerChallengeFloors(CHALLENGE_TYPE_MIXED).map((floor) => floor.symbol)).toContain('sTrainerTowerFloor_Double_8');
  });

  test('preserves unused floors as declarations but keeps them out of the public floor table', () => {
    const unusedSymbols = sTrainerTowerFloors
      .map((floor) => floor.symbol)
      .filter((symbol) => symbol.includes('Unused'));
    const tableSymbols = new Set(gTrainerTowerFloors.flat());

    expect(unusedSymbols).toEqual([
      'sTrainerTowerFloor_Single_Unused',
      'sTrainerTowerFloor_Double_Unused1',
      'sTrainerTowerFloor_Double_Unused2',
      'sTrainerTowerFloor_Double_Unused3'
    ]);
    expect(unusedSymbols.every((symbol) => !tableSymbols.has(symbol))).toBe(true);
  });

  test('preserves DUMMY_TOWER_MON and DUMMY_TOWER_TEAM macro semantics for generated placeholders', () => {
    expect(createDummyTowerMon(15)).toEqual({
      species: '',
      heldItem: '',
      moves: [],
      nickname: '$$$$$$$$$$',
      hpIV: 15,
      attackIV: 15,
      defenseIV: 15,
      speedIV: 15,
      spAttackIV: 15,
      spDefenseIV: 15,
      friendship: 0
    });

    const doubleUnused1 = getTrainerTowerFloor('sTrainerTowerFloor_Double_Unused1');
    expect(doubleUnused1?.dummyTeamCalls).toEqual([15]);
    expect(doubleUnused1?.checksum).toBe(0x000197d4);
  });
});
