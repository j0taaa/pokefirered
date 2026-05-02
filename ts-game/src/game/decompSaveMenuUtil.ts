import regionMapSectionsSource from '../../../src/data/region_map/region_map_sections.json';
import { getPokedexCounts, isNationalDexEnabled } from './decompPokedexUi';
import { formatDecompDecimal, StringConvertMode } from './decompStringUtil';

interface RegionMapSectionEntry {
  id: string;
  name?: string;
}

interface RegionMapSectionsPayload {
  map_sections: RegionMapSectionEntry[];
}

export enum SaveStatId {
  NAME = 0,
  POKEDEX,
  TIME,
  LOCATION,
  BADGES,
  TIME_HR_RT_ALIGN
}

export const SAVE_MENU_UTIL_C_TRANSLATION_UNIT = 'src/save_menu_util.c';
export const EXT_CTRL_CODE_BEGIN = 0xfc;
export const EXT_CTRL_CODE_COLOR = 0x01;
export const EXT_CTRL_CODE_SHADOW = 0x03;
export const CHAR_0 = 0xa1;
export const CHAR_COLON = 0xf0;
export const EOS = 0xff;
export const SAVE_STAT_NAME = SaveStatId.NAME;
export const SAVE_STAT_POKEDEX = SaveStatId.POKEDEX;
export const SAVE_STAT_TIME = SaveStatId.TIME;
export const SAVE_STAT_LOCATION = SaveStatId.LOCATION;
export const SAVE_STAT_BADGES = SaveStatId.BADGES;
export const SAVE_STAT_TIME_HR_RT_ALIGN = SaveStatId.TIME_HR_RT_ALIGN;

export interface SaveStatContext {
  playerName: string;
  hasPokedex: boolean;
  seenSpecies: string[];
  caughtSpecies: string[];
  playTimeHours: number;
  playTimeMinutes: number;
  regionMapSection?: string;
  flags: Iterable<string>;
}

export const BADGE_FLAGS = [
  'FLAG_BADGE01_GET',
  'FLAG_BADGE02_GET',
  'FLAG_BADGE03_GET',
  'FLAG_BADGE04_GET',
  'FLAG_BADGE05_GET',
  'FLAG_BADGE06_GET',
  'FLAG_BADGE07_GET',
  'FLAG_BADGE08_GET'
] as const;

const formatMapSectionFallback = (sectionId: string): string =>
  sectionId.replace(/^MAPSEC_/u, '').replace(/_/gu, ' ');

const regionMapSectionNames = new Map<string, string>(
  (regionMapSectionsSource as RegionMapSectionsPayload).map_sections.map((section) => [
    section.id,
    section.name ?? formatMapSectionFallback(section.id)
  ])
);

const clampPlayTimePart = (value: number, max: number): number => Math.max(0, Math.min(max, Math.trunc(value)));

export const getMapSectionDisplayName = (regionMapSection?: string): string => {
  if (!regionMapSection) {
    return 'FIELD';
  }

  return regionMapSectionNames.get(regionMapSection) ?? formatMapSectionFallback(regionMapSection);
};

export const countEarnedBadges = (flags: Iterable<string>): number => {
  const activeFlags = flags instanceof Set ? flags : new Set(flags);
  return BADGE_FLAGS.reduce((count, flagId) => count + (activeFlags.has(flagId) ? 1 : 0), 0);
};

export const getSavePokedexCount = (
  hasPokedex: boolean,
  seenSpecies: string[],
  caughtSpecies: string[]
): number => {
  if (!hasPokedex) {
    return 0;
  }

  const counts = getPokedexCounts(seenSpecies, caughtSpecies);
  return isNationalDexEnabled(seenSpecies, caughtSpecies) ? counts.ownedNational : counts.ownedKanto;
};

export const formatSavePlayTime = (
  playTimeHours: number,
  playTimeMinutes: number,
  rightAlignHours = false
): string => {
  const hours = formatDecompDecimal(
    clampPlayTimePart(playTimeHours, 999),
    rightAlignHours ? StringConvertMode.RIGHT_ALIGN : StringConvertMode.LEFT_ALIGN,
    3
  );
  const minutes = formatDecompDecimal(
    clampPlayTimePart(playTimeMinutes, 59),
    StringConvertMode.LEADING_ZEROS,
    2
  );
  return `${hours}:${minutes}`;
};

export const saveStatToString = (statId: SaveStatId, context: SaveStatContext): string => {
  switch (statId) {
    case SaveStatId.NAME:
      return context.playerName;
    case SaveStatId.POKEDEX:
      return String(getSavePokedexCount(context.hasPokedex, context.seenSpecies, context.caughtSpecies));
    case SaveStatId.TIME:
      return formatSavePlayTime(context.playTimeHours, context.playTimeMinutes);
    case SaveStatId.TIME_HR_RT_ALIGN:
      return formatSavePlayTime(context.playTimeHours, context.playTimeMinutes, true);
    case SaveStatId.LOCATION:
      return getMapSectionDisplayName(context.regionMapSection);
    case SaveStatId.BADGES:
      return String(countEarnedBadges(context.flags));
    default:
      return '';
  }
};

const stringToGameBytes = (value: string): number[] => [...value].map((char) => char.charCodeAt(0));

const decimalToGameBytes = (
  value: number,
  mode: StringConvertMode,
  width: number
): number[] => stringToGameBytes(formatDecompDecimal(value, mode, width));

export function SaveStatToString(
  gameStatId: SaveStatId,
  context: SaveStatContext,
  color: number
): number[] {
  const dest: number[] = [
    EXT_CTRL_CODE_BEGIN,
    EXT_CTRL_CODE_COLOR,
    color & 0xff,
    EXT_CTRL_CODE_BEGIN,
    EXT_CTRL_CODE_SHADOW,
    (color + 1) & 0xff
  ];

  switch (gameStatId) {
    case SAVE_STAT_NAME:
      dest.push(...stringToGameBytes(context.playerName), EOS);
      break;
    case SAVE_STAT_POKEDEX:
      dest.push(
        ...decimalToGameBytes(
          getSavePokedexCount(context.hasPokedex, context.seenSpecies, context.caughtSpecies),
          StringConvertMode.LEFT_ALIGN,
          3
        ),
        EOS
      );
      break;
    case SAVE_STAT_TIME:
      dest.push(
        ...decimalToGameBytes(clampPlayTimePart(context.playTimeHours, 999), StringConvertMode.LEFT_ALIGN, 3),
        CHAR_COLON,
        ...decimalToGameBytes(clampPlayTimePart(context.playTimeMinutes, 59), StringConvertMode.LEADING_ZEROS, 2),
        EOS
      );
      break;
    case SAVE_STAT_TIME_HR_RT_ALIGN:
      dest.push(
        ...decimalToGameBytes(clampPlayTimePart(context.playTimeHours, 999), StringConvertMode.RIGHT_ALIGN, 3),
        CHAR_COLON,
        ...decimalToGameBytes(clampPlayTimePart(context.playTimeMinutes, 59), StringConvertMode.LEADING_ZEROS, 2),
        EOS
      );
      break;
    case SAVE_STAT_LOCATION:
      dest.push(...stringToGameBytes(getMapSectionDisplayName(context.regionMapSection)), EOS);
      break;
    case SAVE_STAT_BADGES:
      dest.push(CHAR_0 + countEarnedBadges(context.flags), 10, EOS);
      break;
  }

  return dest;
}
