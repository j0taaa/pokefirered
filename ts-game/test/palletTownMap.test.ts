import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import { loadPalletTownMap } from '../src/world/mapSource';
import palletTownMapJson from '../src/world/maps/palletTown.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Pallet Town compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(palletTownMapJson).toEqual(exportMap('PalletTown'));
  });

  test('loads Pallet Town into the runtime tile map shape', () => {
    const exportedPalletTown = exportMap('PalletTown');
    const map = loadPalletTownMap();

    expect(map.id).toBe(exportedPalletTown.id);
    expect(map.width).toBe(exportedPalletTown.width);
    expect(map.height).toBe(exportedPalletTown.height);
    expect(map.tileSize).toBe(exportedPalletTown.tileSize);
    expect(map.walkable).toEqual(toWalkable(exportedPalletTown.collisionRows));
    expect(map.connections).toEqual(exportedPalletTown.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exportedPalletTown.encounterRows));
    expect(map.wildEncounters).toEqual(exportedPalletTown.wildEncounters);
    expect(map.triggers).toEqual(exportedPalletTown.triggers);
    expect(map.visual).toEqual(exportedPalletTown.visual);
    expect(map.npcs).toEqual(exportedPalletTown.npcs);
  });
});
