import { describe, expect, test } from 'vitest';
import {
  EGG_MOVES_SOURCE,
  EGG_MOVES_SPECIES_OFFSET,
  EGG_MOVES_TERMINATOR,
  getEggMoves,
  getLevelUpLearnset,
  getLevelUpLearnsetSymbol,
  getTmhmMoves,
  getTutorMoves,
  gEggMoves,
  gLevelUpLearnsets,
  LEVEL_UP_LEARNSET_POINTERS_SOURCE,
  LEVEL_UP_LEARNSETS_SOURCE,
  sLevelUpLearnsets,
  sTMHMLearnsets,
  sTutorLearnsets,
  sTutorMoves,
  TMHM_LEARNSETS_SOURCE,
  TUTOR_LEARNSETS_SOURCE
} from '../src/game/decompPokemonLearnsets';

describe('decomp Pokemon learnset tables', () => {
  test('parses every level-up learnset pointer in source order', () => {
    expect(LEVEL_UP_LEARNSET_POINTERS_SOURCE).toContain('const u16 *const gLevelUpLearnsets[NUM_SPECIES]');
    expect(gLevelUpLearnsets).toHaveLength(412);
    expect(gLevelUpLearnsets.slice(0, 8)).toEqual([
      { species: 'SPECIES_NONE', learnsetSymbol: 'sBulbasaurLevelUpLearnset' },
      { species: 'SPECIES_BULBASAUR', learnsetSymbol: 'sBulbasaurLevelUpLearnset' },
      { species: 'SPECIES_IVYSAUR', learnsetSymbol: 'sIvysaurLevelUpLearnset' },
      { species: 'SPECIES_VENUSAUR', learnsetSymbol: 'sVenusaurLevelUpLearnset' },
      { species: 'SPECIES_CHARMANDER', learnsetSymbol: 'sCharmanderLevelUpLearnset' },
      { species: 'SPECIES_CHARMELEON', learnsetSymbol: 'sCharmeleonLevelUpLearnset' },
      { species: 'SPECIES_CHARIZARD', learnsetSymbol: 'sCharizardLevelUpLearnset' },
      { species: 'SPECIES_SQUIRTLE', learnsetSymbol: 'sSquirtleLevelUpLearnset' }
    ]);
    expect(getLevelUpLearnsetSymbol('SPECIES_DEOXYS')).toBe('sDeoxysLevelUpLearnset');
  });

  test('preserves tail learnset pointer ordering', () => {
    expect(gLevelUpLearnsets.slice(-8)).toEqual([
      { species: 'SPECIES_KYOGRE', learnsetSymbol: 'sKyogreLevelUpLearnset' },
      { species: 'SPECIES_GROUDON', learnsetSymbol: 'sGroudonLevelUpLearnset' },
      { species: 'SPECIES_RAYQUAZA', learnsetSymbol: 'sRayquazaLevelUpLearnset' },
      { species: 'SPECIES_LATIAS', learnsetSymbol: 'sLatiasLevelUpLearnset' },
      { species: 'SPECIES_LATIOS', learnsetSymbol: 'sLatiosLevelUpLearnset' },
      { species: 'SPECIES_JIRACHI', learnsetSymbol: 'sJirachiLevelUpLearnset' },
      { species: 'SPECIES_DEOXYS', learnsetSymbol: 'sDeoxysLevelUpLearnset' },
      { species: 'SPECIES_CHIMECHO', learnsetSymbol: 'sChimechoLevelUpLearnset' }
    ]);
  });

  test('parses every egg-move species block and constants', () => {
    expect(EGG_MOVES_SOURCE).toContain('#define EGG_MOVES_SPECIES_OFFSET 20000');
    expect(EGG_MOVES_SOURCE).toContain('EGG_MOVES_TERMINATOR');
    expect(EGG_MOVES_SPECIES_OFFSET).toBe(20000);
    expect(EGG_MOVES_TERMINATOR).toBe(0xffff);
    expect(gEggMoves).toHaveLength(165);
    expect(gEggMoves.reduce((count, entry) => count + entry.moves.length, 0)).toBe(973);
    expect(gEggMoves[0]).toEqual({
      species: 'SPECIES_BULBASAUR',
      moves: [
        'MOVE_LIGHT_SCREEN',
        'MOVE_SKULL_BASH',
        'MOVE_SAFEGUARD',
        'MOVE_CHARM',
        'MOVE_PETAL_DANCE',
        'MOVE_MAGICAL_LEAF',
        'MOVE_GRASS_WHISTLE',
        'MOVE_CURSE'
      ]
    });
  });

  test('preserves egg-move lookup and tail ordering', () => {
    expect(getEggMoves('SPECIES_CHARMANDER')).toEqual([
      'MOVE_BELLY_DRUM',
      'MOVE_ANCIENT_POWER',
      'MOVE_ROCK_SLIDE',
      'MOVE_BITE',
      'MOVE_OUTRAGE',
      'MOVE_BEAT_UP',
      'MOVE_SWORDS_DANCE',
      'MOVE_DRAGON_DANCE'
    ]);
    expect(gEggMoves.slice(-3)).toEqual([
      {
        species: 'SPECIES_RALTS',
        moves: ['MOVE_DISABLE', 'MOVE_WILL_O_WISP', 'MOVE_MEAN_LOOK', 'MOVE_MEMENTO', 'MOVE_DESTINY_BOND']
      },
      {
        species: 'SPECIES_BAGON',
        moves: ['MOVE_HYDRO_PUMP', 'MOVE_THRASH', 'MOVE_DRAGON_RAGE', 'MOVE_TWISTER', 'MOVE_DRAGON_DANCE']
      },
      {
        species: 'SPECIES_CHIMECHO',
        moves: ['MOVE_DISABLE', 'MOVE_CURSE', 'MOVE_HYPNOSIS', 'MOVE_DREAM_EATER']
      }
    ]);
  });

  test('parses every level-up learnset array exactly', () => {
    expect(LEVEL_UP_LEARNSETS_SOURCE).toContain('static const u16 sBulbasaurLevelUpLearnset[]');
    expect(sLevelUpLearnsets).toHaveLength(412);
    expect(sLevelUpLearnsets.every((entry) => entry.hasTerminator)).toBe(true);
    expect(sLevelUpLearnsets.reduce((count, entry) => count + entry.moves.length, 0)).toBe(4052);
    expect(getLevelUpLearnset('sBulbasaurLevelUpLearnset')).toEqual({
      symbol: 'sBulbasaurLevelUpLearnset',
      moves: [
        { level: 1, move: 'MOVE_TACKLE' },
        { level: 4, move: 'MOVE_GROWL' },
        { level: 7, move: 'MOVE_LEECH_SEED' },
        { level: 10, move: 'MOVE_VINE_WHIP' },
        { level: 15, move: 'MOVE_POISON_POWDER' },
        { level: 15, move: 'MOVE_SLEEP_POWDER' },
        { level: 20, move: 'MOVE_RAZOR_LEAF' },
        { level: 25, move: 'MOVE_SWEET_SCENT' },
        { level: 32, move: 'MOVE_GROWTH' },
        { level: 39, move: 'MOVE_SYNTHESIS' },
        { level: 46, move: 'MOVE_SOLAR_BEAM' }
      ],
      hasTerminator: true
    });
  });

  test('preserves duplicate Deoxys learnsets and tail level-up ordering', () => {
    expect(sLevelUpLearnsets.slice(-3).map((entry) => entry.symbol)).toEqual([
      'sDeoxysLevelUpLearnset',
      'sDeoxysLevelUpLearnset',
      'sChimechoLevelUpLearnset'
    ]);
    expect(sLevelUpLearnsets.at(-1)).toEqual({
      symbol: 'sChimechoLevelUpLearnset',
      moves: [
        { level: 1, move: 'MOVE_WRAP' },
        { level: 6, move: 'MOVE_GROWL' },
        { level: 9, move: 'MOVE_ASTONISH' },
        { level: 14, move: 'MOVE_CONFUSION' },
        { level: 17, move: 'MOVE_TAKE_DOWN' },
        { level: 22, move: 'MOVE_UPROAR' },
        { level: 25, move: 'MOVE_YAWN' },
        { level: 30, move: 'MOVE_PSYWAVE' },
        { level: 33, move: 'MOVE_DOUBLE_EDGE' },
        { level: 38, move: 'MOVE_HEAL_BELL' },
        { level: 41, move: 'MOVE_SAFEGUARD' },
        { level: 46, move: 'MOVE_PSYCHIC' }
      ],
      hasTerminator: true
    });
  });

  test('parses tutor move definitions and tutor learnsets exactly', () => {
    expect(TUTOR_LEARNSETS_SOURCE).toContain('static const u16 sTutorMoves[TUTOR_MOVE_COUNT]');
    expect(sTutorMoves).toHaveLength(15);
    expect(sTutorMoves.slice(0, 5)).toEqual([
      { tutorMove: 'TUTOR_MOVE_MEGA_PUNCH', move: 'MOVE_MEGA_PUNCH' },
      { tutorMove: 'TUTOR_MOVE_SWORDS_DANCE', move: 'MOVE_SWORDS_DANCE' },
      { tutorMove: 'TUTOR_MOVE_MEGA_KICK', move: 'MOVE_MEGA_KICK' },
      { tutorMove: 'TUTOR_MOVE_BODY_SLAM', move: 'MOVE_BODY_SLAM' },
      { tutorMove: 'TUTOR_MOVE_DOUBLE_EDGE', move: 'MOVE_DOUBLE_EDGE' }
    ]);
    expect(sTutorLearnsets).toHaveLength(387);
    expect(sTutorLearnsets.reduce((count, entry) => count + entry.moves.length, 0)).toBe(2388);
    expect(getTutorMoves('SPECIES_CHARMANDER')).toEqual([
      'MOVE_MEGA_PUNCH',
      'MOVE_SWORDS_DANCE',
      'MOVE_MEGA_KICK',
      'MOVE_BODY_SLAM',
      'MOVE_DOUBLE_EDGE',
      'MOVE_COUNTER',
      'MOVE_SEISMIC_TOSS',
      'MOVE_MIMIC',
      'MOVE_ROCK_SLIDE',
      'MOVE_SUBSTITUTE'
    ]);
  });

  test('preserves tutor zero rows and tail ordering', () => {
    expect(getTutorMoves('SPECIES_NONE')).toEqual([]);
    expect(getTutorMoves('SPECIES_CATERPIE')).toEqual([]);
    expect(sTutorLearnsets.slice(-3)).toEqual([
      {
        species: 'SPECIES_JIRACHI',
        moves: [
          'MOVE_BODY_SLAM',
          'MOVE_DOUBLE_EDGE',
          'MOVE_MIMIC',
          'MOVE_METRONOME',
          'MOVE_DREAM_EATER',
          'MOVE_THUNDER_WAVE',
          'MOVE_SUBSTITUTE'
        ]
      },
      {
        species: 'SPECIES_DEOXYS',
        moves: [
          'MOVE_MEGA_PUNCH',
          'MOVE_MEGA_KICK',
          'MOVE_BODY_SLAM',
          'MOVE_DOUBLE_EDGE',
          'MOVE_COUNTER',
          'MOVE_SEISMIC_TOSS',
          'MOVE_MIMIC',
          'MOVE_DREAM_EATER',
          'MOVE_THUNDER_WAVE',
          'MOVE_ROCK_SLIDE',
          'MOVE_SUBSTITUTE'
        ]
      },
      {
        species: 'SPECIES_CHIMECHO',
        moves: ['MOVE_DOUBLE_EDGE', 'MOVE_MIMIC', 'MOVE_DREAM_EATER', 'MOVE_SUBSTITUTE']
      }
    ]);
  });

  test('parses every TM/HM learnset species row exactly', () => {
    expect(TMHM_LEARNSETS_SOURCE).toContain('#define TMHM_LEARNSET(moves)');
    expect(TMHM_LEARNSETS_SOURCE).toContain('static const u32 sTMHMLearnsets[][2]');
    expect(sTMHMLearnsets).toHaveLength(412);
    expect(sTMHMLearnsets.filter((entry) => entry.moves.length === 0)).toHaveLength(40);
    expect(sTMHMLearnsets.reduce((count, entry) => count + entry.moves.length, 0)).toBe(8927);
    expect(getTmhmMoves('SPECIES_NONE')).toEqual([]);
    expect(getTmhmMoves('SPECIES_BULBASAUR')).toEqual([
      'TM06_TOXIC',
      'TM09_BULLET_SEED',
      'TM10_HIDDEN_POWER',
      'TM11_SUNNY_DAY',
      'TM17_PROTECT',
      'TM19_GIGA_DRAIN',
      'TM21_FRUSTRATION',
      'TM22_SOLAR_BEAM',
      'TM27_RETURN',
      'TM32_DOUBLE_TEAM',
      'TM36_SLUDGE_BOMB',
      'TM42_FACADE',
      'TM43_SECRET_POWER',
      'TM44_REST',
      'TM45_ATTRACT',
      'HM01_CUT',
      'HM04_STRENGTH',
      'HM05_FLASH',
      'HM06_ROCK_SMASH'
    ]);
  });

  test('preserves TM/HM universal and tail species learnsets', () => {
    expect(getTmhmMoves('SPECIES_MEW')).toHaveLength(58);
    expect(getTmhmMoves('SPECIES_MEW').slice(0, 5)).toEqual([
      'TM01_FOCUS_PUNCH',
      'TM02_DRAGON_CLAW',
      'TM03_WATER_PULSE',
      'TM04_CALM_MIND',
      'TM05_ROAR'
    ]);
    expect(sTMHMLearnsets.at(-1)).toEqual({
      species: 'SPECIES_CHIMECHO',
      moves: [
        'TM04_CALM_MIND',
        'TM06_TOXIC',
        'TM10_HIDDEN_POWER',
        'TM11_SUNNY_DAY',
        'TM12_TAUNT',
        'TM16_LIGHT_SCREEN',
        'TM17_PROTECT',
        'TM18_RAIN_DANCE',
        'TM20_SAFEGUARD',
        'TM21_FRUSTRATION',
        'TM27_RETURN',
        'TM29_PSYCHIC',
        'TM30_SHADOW_BALL',
        'TM32_DOUBLE_TEAM',
        'TM33_REFLECT',
        'TM34_SHOCK_WAVE',
        'TM41_TORMENT',
        'TM42_FACADE',
        'TM43_SECRET_POWER',
        'TM44_REST',
        'TM45_ATTRACT',
        'TM48_SKILL_SWAP',
        'TM49_SNATCH',
        'HM05_FLASH'
      ],
      rawExpression: expect.stringContaining('TMHM(TM04_CALM_MIND)')
    });
  });
});
