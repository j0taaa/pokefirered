import regionMapSectionsSource from '../../../src/data/region_map/region_map_sections.json';
import { getPokedexCounts, isNationalDexEnabled } from './decompPokedexUi';

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
  const hours = clampPlayTimePart(playTimeHours, 999).toString();
  const minutes = clampPlayTimePart(playTimeMinutes, 59).toString().padStart(2, '0');
  return `${rightAlignHours ? hours.padStart(3, ' ') : hours}:${minutes}`;
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
