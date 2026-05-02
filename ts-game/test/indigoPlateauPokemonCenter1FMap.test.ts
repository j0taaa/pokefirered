import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadIndigoPlateauPokemonCenter1FMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import indigoPlateauPokemonCenter1FMapJson from '../src/world/maps/indigoPlateauPokemonCenter1F.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Indigo Plateau Pokemon Center 1F compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(indigoPlateauPokemonCenter1FMapJson).toEqual(exportMap('IndigoPlateau_PokemonCenter_1F'));
  });

  test('loads Indigo Plateau Pokemon Center 1F into the runtime tile map shape', () => {
    const exported = exportMap('IndigoPlateau_PokemonCenter_1F');
    const map = loadIndigoPlateauPokemonCenter1FMap();

    expect(map.id).toBe(exported.id);
    expect(map.width).toBe(exported.width);
    expect(map.height).toBe(exported.height);
    expect(map.tileSize).toBe(exported.tileSize);
    expect(map.walkable).toEqual(toWalkable(exported.collisionRows));
    expect(map.connections).toEqual([]);
    expect(map.encounterTiles).toEqual(toEncounterTiles(exported.encounterRows));
    expect(map.wildEncounters).toEqual(exported.wildEncounters);
    expect(map.triggers).toEqual(exported.triggers);
    expect(map.visual).toEqual(exported.visual);
    expect(map.npcs).toEqual(exported.npcs);
    expect(map.hiddenItems).toEqual(exported.hiddenItems);
    expect(map.warps).toEqual(exported.warps);
  });

  test('validates compact row dimensions and keeps Indigo Plateau center parity', () => {
    const baseSource = indigoPlateauPokemonCenter1FMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(indigoPlateauPokemonCenter1FMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.connections).toEqual([]);
    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toMatchObject([]);
    expect(map.hiddenItems).toEqual([]);
    expect(map.npcs).toHaveLength(8);
    expect(map.npcs.find((npc) => npc.id === 'LOCALID_LEAGUE_NURSE')).toEqual({
      id: 'LOCALID_LEAGUE_NURSE',
      x: 13,
      y: 10,
      graphicsId: 'OBJ_EVENT_GFX_NURSE',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'IndigoPlateau_PokemonCenter_1F_EventScript_Nurse',
      flag: '0'
    });
    expect(map.npcs.find((npc) => npc.id === 'LOCALID_LEAGUE_DOOR_GUARD')).toEqual({
      id: 'LOCALID_LEAGUE_DOOR_GUARD',
      x: 5,
      y: 3,
      graphicsId: 'OBJ_EVENT_GFX_COOLTRAINER_F',
      movementType: 'MOVEMENT_TYPE_FACE_DOWN',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'IndigoPlateau_PokemonCenter_1F_EventScript_DoorGuard',
      flag: '0'
    });
    expect(map.warps).toEqual([
      { x: 11, y: 16, elevation: 3, destMap: 'MAP_INDIGO_PLATEAU_EXTERIOR', destWarpId: 0 },
      { x: 4, y: 1, elevation: 3, destMap: 'MAP_POKEMON_LEAGUE_LORELEIS_ROOM', destWarpId: 0 },
      { x: 1, y: 14, elevation: 4, destMap: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_2F', destWarpId: 0 }
    ]);
  });
});
