import { describe, expect, test } from 'vitest';
import {
  getAllDecompTrainerDefinitions,
  getDecompTrainerDefinition,
  getDecompTrainerFlag,
  getRawTrainerDefinitions,
  getRawTrainerPartyDefinitions,
  getRawTrainerPartyUnparsedRemainder,
  getRawTrainerUnparsedRemainder,
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

  test('ports every trainer party declaration with exact raw C values', () => {
    const parties = getRawTrainerPartyDefinitions();
    expect(parties).toHaveLength(742);
    expect(getRawTrainerPartyUnparsedRemainder()).toBe('');

    expect(parties[0]).toEqual({
      monType: 'TrainerMonNoItemDefaultMoves',
      partyName: 'sParty_AquaLeader',
      initializer: 'DUMMY_TRAINER_MON',
      mons: [
        {
          initializer: 'DUMMY_TRAINER_MON',
          iv: null,
          lvl: '5',
          species: 'SPECIES_EKANS',
          heldItem: null,
          moves: []
        }
      ]
    });

    expect(parties.find((party) => party.partyName === 'sParty_YoungsterBen')?.mons).toEqual([
      {
        initializer: `{
        .iv = 0,
        .lvl = 11,
        .species = SPECIES_RATTATA,
    }`,
        iv: '0',
        lvl: '11',
        species: 'SPECIES_RATTATA',
        heldItem: null,
        moves: []
      },
      {
        initializer: `{
        .iv = 0,
        .lvl = 11,
        .species = SPECIES_EKANS,
    }`,
        iv: '0',
        lvl: '11',
        species: 'SPECIES_EKANS',
        heldItem: null,
        moves: []
      }
    ]);

    const brock = parties.find((party) => party.partyName === 'sParty_LeaderBrock');
    expect(brock?.monType).toBe('TrainerMonNoItemCustomMoves');
    expect(brock?.mons.at(-1)).toMatchObject({
      iv: '0',
      lvl: '14',
      species: 'SPECIES_ONIX',
      moves: ['MOVE_TACKLE', 'MOVE_BIND', 'MOVE_ROCK_TOMB', 'MOVE_NONE']
    });
  });

  test('ports every gTrainers entry with exact raw C tokens', () => {
    const trainers = getRawTrainerDefinitions();
    expect(trainers).toHaveLength(743);
    expect(getRawTrainerUnparsedRemainder()).toBe('');

    expect(trainers[0]).toMatchObject({
      trainerId: 'TRAINER_NONE',
      trainerClass: null,
      encounterMusicGender: null,
      trainerPic: null,
      trainerName: '',
      items: [],
      doubleBattle: null,
      aiFlags: null,
      party: null
    });

    expect(trainers.find((trainer) => trainer.trainerId === 'TRAINER_LEADER_BROCK')).toMatchObject({
      trainerClass: 'TRAINER_CLASS_LEADER',
      encounterMusicGender: 'TRAINER_ENCOUNTER_MUSIC_MALE',
      trainerPic: 'TRAINER_PIC_LEADER_BROCK',
      trainerName: 'BROCK',
      items: [],
      doubleBattle: 'FALSE',
      aiFlags: 'AI_SCRIPT_CHECK_BAD_MOVE | AI_SCRIPT_TRY_TO_FAINT | AI_SCRIPT_CHECK_VIABILITY',
      party: {
        macro: 'NO_ITEM_CUSTOM_MOVES',
        partyName: 'sParty_LeaderBrock'
      }
    });

    expect(trainers.find((trainer) => trainer.trainerId === 'TRAINER_COOL_COUPLE_LEX_NYA_2')).toMatchObject({
      trainerName: 'LEX & NYA',
      items: ['ITEM_FULL_RESTORE', 'ITEM_FULL_RESTORE'],
      doubleBattle: 'TRUE',
      party: {
        macro: 'NO_ITEM_CUSTOM_MOVES',
        partyName: 'sParty_CoolCoupleLexNya2'
      }
    });

    expect(trainers.at(-1)).toMatchObject({
      trainerId: 'TRAINER_CUE_BALL_PAXTON',
      trainerClass: 'TRAINER_CLASS_CUE_BALL',
      trainerName: 'PAXTON',
      party: {
        macro: 'NO_ITEM_DEFAULT_MOVES',
        partyName: 'sParty_CueBallPaxton'
      }
    });
  });
});
