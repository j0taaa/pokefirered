import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import { loadViridianCityMap } from '../src/world/mapSource';
import viridianCityMapJson from '../src/world/maps/viridianCity.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Viridian City compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(viridianCityMapJson).toEqual(exportMap('ViridianCity'));
  });

  test('loads Viridian City into the runtime tile map shape', () => {
    const exportedViridianCity = exportMap('ViridianCity');
    const map = loadViridianCityMap();

    expect(map.id).toBe(exportedViridianCity.id);
    expect(map.width).toBe(exportedViridianCity.width);
    expect(map.height).toBe(exportedViridianCity.height);
    expect(map.tileSize).toBe(exportedViridianCity.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedViridianCity.collisionRows));
    expect(map.connections).toEqual(exportedViridianCity.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedViridianCity.encounterRows));
    expect(map.wildEncounters).toEqual(exportedViridianCity.wildEncounters);
    expect(map.triggers).toEqual(exportedViridianCity.triggers);
    expect(map.visual).toEqual(exportedViridianCity.visual);
    expect(map.npcs).toEqual(exportedViridianCity.npcs);
  });
});
