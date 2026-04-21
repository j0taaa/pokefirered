import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import { loadViridianForestMap } from '../src/world/mapSource';
import viridianForestMapJson from '../src/world/maps/viridianForest.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Viridian Forest compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(viridianForestMapJson).toEqual(exportMap('ViridianForest'));
  });

  test('loads Viridian Forest into the runtime tile map shape', () => {
    const exportedViridianForest = exportMap('ViridianForest');
    const map = loadViridianForestMap();

    expect(map.id).toBe(exportedViridianForest.id);
    expect(map.width).toBe(exportedViridianForest.width);
    expect(map.height).toBe(exportedViridianForest.height);
    expect(map.tileSize).toBe(exportedViridianForest.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedViridianForest.collisionRows));
    expect(map.connections).toEqual([]);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedViridianForest.encounterRows));
    expect(map.wildEncounters).toEqual(exportedViridianForest.wildEncounters);
    expect(map.triggers).toEqual(exportedViridianForest.triggers);
    expect(map.visual).toEqual(exportedViridianForest.visual);
    expect(map.npcs).toEqual(exportedViridianForest.npcs);
    expect(map.warps).toEqual(exportedViridianForest.warps);
  });
});
