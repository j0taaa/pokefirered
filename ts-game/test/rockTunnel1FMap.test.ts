import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRockTunnel1FMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import rockTunnel1FMapJson from '../src/world/maps/rockTunnel1F.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Rock Tunnel 1F compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(rockTunnel1FMapJson).toEqual(exportMap('RockTunnel_1F'));
  });

  test('loads Rock Tunnel 1F into the runtime tile map shape', () => {
    const exported = exportMap('RockTunnel_1F');
    const map = loadRockTunnel1FMap();

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

  test('validates compact row dimensions and keeps entrance parity', () => {
    const baseSource = rockTunnel1FMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(rockTunnel1FMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toEqual([
      {
        id: 'RockTunnel_1F_EventScript_RouteSign',
        x: 14,
        y: 33,
        activation: 'interact',
        scriptId: 'RockTunnel_1F_EventScript_RouteSign',
        facing: 'any',
        once: false
      }
    ]);
    expect(map.warps).toEqual([
      { x: 17, y: 2, elevation: 3, destMap: 'MAP_ROUTE10', destWarpId: 0 },
      { x: 45, y: 2, elevation: 3, destMap: 'MAP_ROCK_TUNNEL_B1F', destWarpId: 0 },
      { x: 4, y: 2, elevation: 3, destMap: 'MAP_ROCK_TUNNEL_B1F', destWarpId: 1 },
      { x: 20, y: 13, elevation: 3, destMap: 'MAP_ROCK_TUNNEL_B1F', destWarpId: 2 },
      { x: 45, y: 21, elevation: 3, destMap: 'MAP_ROCK_TUNNEL_B1F', destWarpId: 3 },
      { x: 18, y: 37, elevation: 3, destMap: 'MAP_ROUTE10', destWarpId: 1 }
    ]);
    expect(map.hiddenItems).toEqual([]);
    expect(map.npcs).toHaveLength(10);
    expect(map.npcs.filter((npc) => npc.trainerType === 'TRAINER_TYPE_NORMAL')).toHaveLength(7);
    expect(map.npcs.filter((npc) => npc.graphicsId === 'OBJ_EVENT_GFX_ITEM_BALL')).toHaveLength(3);
    expect(map.npcs.find((npc) => npc.id === 'RockTunnel_1F_ObjectEvent_ItemEscapeRope')).toEqual({
      id: 'RockTunnel_1F_ObjectEvent_ItemEscapeRope',
      x: 22,
      y: 22,
      graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
      movementType: 'MOVEMENT_TYPE_LOOK_AROUND',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'RockTunnel_1F_EventScript_ItemEscapeRope',
      flag: 'FLAG_HIDE_ROCK_TUNNEL_1F_ESCAPE_ROPE'
    });
  });
});
