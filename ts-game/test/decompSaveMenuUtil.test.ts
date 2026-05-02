import { describe, expect, test } from 'vitest';
import {
  CHAR_0,
  CHAR_COLON,
  EOS,
  EXT_CTRL_CODE_BEGIN,
  EXT_CTRL_CODE_COLOR,
  EXT_CTRL_CODE_SHADOW,
  SAVE_MENU_UTIL_C_TRANSLATION_UNIT,
  SAVE_STAT_BADGES,
  SAVE_STAT_NAME,
  SAVE_STAT_TIME_HR_RT_ALIGN,
  SaveStatToString,
  countEarnedBadges,
  formatSavePlayTime,
  getMapSectionDisplayName,
  getSavePokedexCount,
  saveStatToString,
  SaveStatId
} from '../src/game/decompSaveMenuUtil';

describe('decomp save_menu_util', () => {
  test('exports exact save_menu_util.c byte writer entry point', () => {
    expect(SAVE_MENU_UTIL_C_TRANSLATION_UNIT).toBe('src/save_menu_util.c');
  });

  test('formats map section names from decomp region map data', () => {
    expect(getMapSectionDisplayName('MAPSEC_VIRIDIAN_CITY')).toBe('VIRIDIAN CITY');
    expect(getMapSectionDisplayName('MAPSEC_MT_EMBER')).toBe('MT. EMBER');
    expect(getMapSectionDisplayName()).toBe('FIELD');
  });

  test('counts badges using the badge flags instead of ad-hoc vars', () => {
    expect(countEarnedBadges(['FLAG_BADGE01_GET', 'FLAG_BADGE03_GET'])).toBe(2);
  });

  test('formats play time like SaveStatToString', () => {
    expect(formatSavePlayTime(12, 5)).toBe('12:05');
    expect(formatSavePlayTime(12, 5, true)).toBe(' 12:05');
  });

  test('uses caught dex counts and switches to national when needed', () => {
    expect(getSavePokedexCount(true, ['BULBASAUR'], ['BULBASAUR'])).toBe(1);
    expect(getSavePokedexCount(true, ['CHIKORITA'], ['CHIKORITA'])).toBe(1);
    expect(getSavePokedexCount(false, ['BULBASAUR'], ['BULBASAUR'])).toBe(0);
  });

  test('formats each save stat from a runtime-like context', () => {
    const context = {
      playerName: 'RED',
      hasPokedex: true,
      seenSpecies: ['BULBASAUR', 'CHIKORITA'],
      caughtSpecies: ['BULBASAUR'],
      playTimeHours: 1,
      playTimeMinutes: 2,
      regionMapSection: 'MAPSEC_PALLET_TOWN',
      flags: ['FLAG_BADGE01_GET', 'FLAG_BADGE02_GET']
    };

    expect(saveStatToString(SaveStatId.NAME, context)).toBe('RED');
    expect(saveStatToString(SaveStatId.POKEDEX, context)).toBe('1');
    expect(saveStatToString(SaveStatId.TIME, context)).toBe('1:02');
    expect(saveStatToString(SaveStatId.LOCATION, context)).toBe('PALLET TOWN');
    expect(saveStatToString(SaveStatId.BADGES, context)).toBe('2');
    expect(saveStatToString(SaveStatId.TIME_HR_RT_ALIGN, context)).toBe('  1:02');

    expect(SaveStatToString(SAVE_STAT_NAME, context, 4)).toEqual([
      EXT_CTRL_CODE_BEGIN,
      EXT_CTRL_CODE_COLOR,
      4,
      EXT_CTRL_CODE_BEGIN,
      EXT_CTRL_CODE_SHADOW,
      5,
      'R'.charCodeAt(0),
      'E'.charCodeAt(0),
      'D'.charCodeAt(0),
      EOS
    ]);
    expect(SaveStatToString(SAVE_STAT_TIME_HR_RT_ALIGN, context, 1).slice(6)).toEqual([
      ' '.charCodeAt(0),
      ' '.charCodeAt(0),
      '1'.charCodeAt(0),
      CHAR_COLON,
      '0'.charCodeAt(0),
      '2'.charCodeAt(0),
      EOS
    ]);
    expect(SaveStatToString(SAVE_STAT_BADGES, context, 1).slice(6)).toEqual([CHAR_0 + 2, 10, EOS]);
  });
});
