import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadIndigoPlateauExteriorMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import indigoPlateauExteriorMapJson from '../src/world/maps/indigoPlateauExterior.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Indigo Plateau exterior compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(indigoPlateauExteriorMapJson).toEqual(exportMap('IndigoPlateau_Exterior'));
  });

  test('loads Indigo Plateau exterior into the runtime tile map shape', () => {
    const exported = exportMap('IndigoPlateau_Exterior');
    const map = loadIndigoPlateauExteriorMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.tileSize).toBe(exported.tileSize);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.connections).toEqual(exported.metadata.connections);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exported.encounterRows));
    expect(map.wildEncounters).toEqual(exported.wildEncounters);
    expect(map.triggers).toEqual(exported.triggers);
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.hiddenItems).toEqual(exported.hiddenItems);
    expect(map.warps).toEqual(exported.warps);
  });

  test('validates compact row dimensions and keeps Indigo Plateau exterior parity', () => {
    const baseSource = indigoPlateauExteriorMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(indigoPlateauExteriorMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual([
      { map: 'MAP_ROUTE23', offset: 0, direction: 'down' }
    ]);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toEqual([]);
    expect(map.hiddenItems).toEqual([]);
    expect(map.npcs).toEqual([
      {
        id: 'LOCALID_CREDITS_RIVAL',
        x: 11,
        y: 6,
        graphicsId: 'OBJ_EVENT_GFX_BLUE',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: '0x0',
        flag: 'FLAG_HIDE_CREDITS_RIVAL'
      },
      {
        id: 'LOCALID_CREDITS_PROF_OAK',
        x: 11,
        y: 6,
        graphicsId: 'OBJ_EVENT_GFX_PROF_OAK',
        movementType: 'MOVEMENT_TYPE_FACE_DOWN',
        movementRangeX: 1,
        movementRangeY: 1,
        trainerType: 'TRAINER_TYPE_NONE',
        trainerSightOrBerryTreeId: 0,
        scriptId: '0x0',
        flag: 'FLAG_HIDE_CREDITS_OAK'
      }
    ]);
    expect(map.warps).toEqual([
      { x: 11, y: 6, elevation: 0, destMap: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F', destWarpId: 0 }
    ]);
  });
});
