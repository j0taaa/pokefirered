import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';
import {
  loadRockTunnelB1FMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import rockTunnelB1FMapJson from '../src/world/maps/rockTunnelB1F.json';

const toWalkable = (collisionRows: string[]): boolean[] =>
  collisionRows.flatMap((row) => [...row].map((tile) => tile === '.' || tile === '0'));

const toEncounterTiles = (encounterRows: string[]): string[] => encounterRows.flatMap((row) => [...row]);

describe('Rock Tunnel B1F compact map source', () => {
  test('matches the decomp exporter output exactly', () => {
    expect(rockTunnelB1FMapJson).toEqual(exportMap('RockTunnel_B1F'));
  });

  test('loads Rock Tunnel B1F into the runtime tile map shape', () => {
    const exported = exportMap('RockTunnel_B1F');
    const map = loadRockTunnelB1FMap();

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

  test('validates compact row dimensions and keeps basement warp parity', () => {
    const baseSource = rockTunnelB1FMapJson as CompactMapSource & { encounterRows: string[] };

    expect(() => parseCompactMapSource({
      ...baseSource,
      collisionRows: baseSource.collisionRows.slice(0, -1)
    })).toThrow(/collision rows/i);

    expect(() => parseCompactMapSource({
      ...baseSource,
      encounterRows: ['X'.repeat(baseSource.width), ...baseSource.encounterRows.slice(1)]
    })).toThrow(/encounterRows/i);

    const compactSource = parseCompactMapSource(rockTunnelB1FMapJson);
    const map = mapFromCompactSource(compactSource);

    expect(map.encounterTiles).toEqual(toEncounterTiles(compactSource.encounterRows ?? []));
    expect(map.triggers).toMatchObject([]);
    expect(map.warps).toEqual([
      { x: 38, y: 28, elevation: 3, destMap: 'MAP_ROCK_TUNNEL_1F', destWarpId: 1 },
      { x: 33, y: 3, elevation: 3, destMap: 'MAP_ROCK_TUNNEL_1F', destWarpId: 2 },
      { x: 27, y: 12, elevation: 3, destMap: 'MAP_ROCK_TUNNEL_1F', destWarpId: 3 },
      { x: 2, y: 3, elevation: 3, destMap: 'MAP_ROCK_TUNNEL_1F', destWarpId: 4 }
    ]);
    expect(map.hiddenItems).toEqual([]);
    expect(map.npcs).toHaveLength(26);
    expect(map.npcs.filter((npc) => npc.trainerType === 'TRAINER_TYPE_NORMAL')).toHaveLength(8);
    expect(map.npcs.filter((npc) => npc.graphicsId === 'OBJ_EVENT_GFX_ROCK_SMASH_ROCK')).toHaveLength(15);
    expect(map.npcs.find((npc) => npc.id === 'RockTunnel_B1F_ObjectEvent_RockSlideTutor')).toEqual({
      id: 'RockTunnel_B1F_ObjectEvent_RockSlideTutor',
      x: 2,
      y: 29,
      graphicsId: 'OBJ_EVENT_GFX_YOUNGSTER',
      movementType: 'MOVEMENT_TYPE_FACE_RIGHT',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'TRAINER_TYPE_NONE',
      trainerSightOrBerryTreeId: 0,
      scriptId: 'RockTunnel_B1F_EventScript_RockSlideTutor',
      flag: '0'
    });
  });
});
