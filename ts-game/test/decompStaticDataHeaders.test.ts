import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { sHealLocations, sWhiteoutRespawnHealCenterMapIdxs, sWhiteoutRespawnHealerNpcIds } from '../src/data/decompHealLocations';
import { sMapNames, sMapSectionDimensions, sMapSectionTopLeftCorners } from '../src/data/decompRegionMapEntries';
import { sMapsecNames } from '../src/data/decompRegionMapEntryStrings';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

const readSource = (path: string): string => readFileSync(`${repoRoot}/${path}`, 'utf8');
const testWithSource = (path: string) => {
  const runner = existsSync(`${repoRoot}/${path}`) ? test : test.fails;
  return (name: string, fn: () => void) => runner(name, fn);
};

describe('decomp generated static data headers', () => {
  testWithSource('src/data/heal_locations.h')('ports src/data/heal_locations.h heal-location table exactly', () => {
    const source = readSource('src/data/heal_locations.h');
    const entries = [
      ...source.matchAll(
        /\[(HEAL_LOCATION_[A-Z0-9_]+) - 1\] = \{\s*\.mapGroup = MAP_GROUP\((MAP_[A-Z0-9_]+)\),\s*\.mapNum = MAP_NUM\((MAP_[A-Z0-9_]+)\),\s*\.x = (\d+),\s*\.y = (\d+),\s*\}/g
      )
    ].map(([, id, mapGroup, mapNum, x, y]) => ({ id, mapGroup, mapNum, x: Number(x), y: Number(y) }));

    expect(sHealLocations).toEqual(entries);
  });

  testWithSource('src/data/heal_locations.h')('ports src/data/heal_locations.h whiteout center and healer tables exactly', () => {
    const source = readSource('src/data/heal_locations.h');
    const centerBlock = source.match(/static const u16 sWhiteoutRespawnHealCenterMapIdxs[\s\S]*?};/)?.[0] ?? '';
    const centers = [
      ...centerBlock.matchAll(
        /\[(HEAL_LOCATION_[A-Z0-9_]+) - 1\] = \{ MAP_GROUP\((MAP_[A-Z0-9_]+)\), MAP_NUM\((MAP_[A-Z0-9_]+)\)\}/g
      )
    ].map(([, id, mapGroup, mapNum]) => ({ id, mapGroup, mapNum }));

    const healerBlock = source.match(/static const u8 sWhiteoutRespawnHealerNpcIds[\s\S]*?};/)?.[0] ?? '';
    const healers = [...healerBlock.matchAll(/\[(HEAL_LOCATION_[A-Z0-9_]+) - 1\] = (LOCALID_[A-Z0-9_]+)/g)].map(([, id, localId]) => ({
      id,
      localId
    }));

    expect(sWhiteoutRespawnHealCenterMapIdxs).toEqual(centers);
    expect(sWhiteoutRespawnHealerNpcIds).toEqual(healers);
  });

  testWithSource('src/data/region_map/region_map_entry_strings.h')('ports src/data/region_map/region_map_entry_strings.h strings exactly', () => {
    const source = readSource('src/data/region_map/region_map_entry_strings.h');
    const names = [...source.matchAll(/static const u8 (sMapsecName_[A-Za-z0-9_]+)\[\] = _\("([^"]*)"\);/g)].map(([, symbol, text]) => ({
      symbol,
      text
    }));

    expect(sMapsecNames).toEqual(names);
  });

  testWithSource('src/data/region_map/region_map_entries.h')('ports src/data/region_map/region_map_entries.h map-name references exactly', () => {
    const source = readSource('src/data/region_map/region_map_entries.h');
    const names = [...source.matchAll(/\[(MAPSEC_[A-Z0-9_]+) - KANTO_MAPSEC_START\] = (sMapsecName_[A-Za-z0-9_]+)/g)].map(
      ([, mapsec, nameSymbol]) => ({ mapsec, nameSymbol })
    );

    expect(sMapNames).toEqual(names);
  });

  testWithSource('src/data/region_map/region_map_entries.h')('ports src/data/region_map/region_map_entries.h coordinates and dimensions exactly', () => {
    const source = readSource('src/data/region_map/region_map_entries.h');
    const parsePairTable = (tableName: string): Array<{ mapsec: string; x: number; y: number }> => {
      const start = source.indexOf(`static const u16 ${tableName}[MAPSEC_COUNT][2] = {`);
      const end = source.indexOf('\n};', start);
      const block = start === -1 || end === -1 ? '' : source.slice(start, end);
      return [...block.matchAll(/\[(MAPSEC_[A-Z0-9_]+) - KANTO_MAPSEC_START\] = \{ (\d+), (\d+) \}/g)].map(([, mapsec, x, y]) => ({
        mapsec,
        x: Number(x),
        y: Number(y)
      }));
    };

    expect(sMapSectionTopLeftCorners).toEqual(parsePairTable('sMapSectionTopLeftCorners'));
    expect(sMapSectionDimensions).toEqual(parsePairTable('sMapSectionDimensions'));
  });
});
