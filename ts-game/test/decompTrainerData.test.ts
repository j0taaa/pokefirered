import { describe, expect, test } from 'vitest';
import {
  getAllDecompTrainerDefinitions,
  getDecompTrainerDefinition,
  getDecompTrainerFlag,
  hasDecompTrainerDefinition
} from '../src/game/decompTrainerData';

describe('decomp trainer data', () => {
  test('parses trainer definitions, party data, items, and AI flags from the decomp', () => {
    const brock = getDecompTrainerDefinition('TRAINER_LEADER_BROCK');
    expect(brock).toMatchObject({
      trainerName: 'BROCK',
      trainerClass: 'TRAINER_CLASS_LEADER',
      trainerItems: [],
      trainerAiFlags: ['AI_SCRIPT_CHECK_BAD_MOVE', 'AI_SCRIPT_TRY_TO_FAINT', 'AI_SCRIPT_CHECK_VIABILITY']
    });
    expect(brock?.party.map((entry) => entry.species)).toEqual(['GEODUDE', 'ONIX']);
    expect(brock?.party[1]?.moveIds).toEqual(['TACKLE', 'BIND', 'ROCK_TOMB']);

    const misty = getDecompTrainerDefinition('TRAINER_LEADER_MISTY');
    expect(misty?.trainerItems).toEqual(['ITEM_SUPER_POTION']);
    expect(misty?.party.map((entry) => entry.species)).toEqual(['STARYU', 'STARMIE']);
  });

  test('tracks double-battle trainer metadata and exposes basic lookup helpers', () => {
    expect(hasDecompTrainerDefinition('TRAINER_INTERVIEWER')).toBe(true);
    expect(getDecompTrainerDefinition('TRAINER_INTERVIEWER')).toMatchObject({
      doubleBattle: true
    });
    expect(getDecompTrainerFlag('TRAINER_BLACK_BELT_TAKASHI')).toBe('TRAINER_DEFEATED_TRAINER_BLACK_BELT_TAKASHI');
    expect(getAllDecompTrainerDefinitions().length).toBeGreaterThan(400);
  });
});
