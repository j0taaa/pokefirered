import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import { createPlayer, stepPlayer } from '../src/game/player';
import { createScriptRuntimeState } from '../src/game/scripts';
import { applyWarpTransitionEffect } from '../src/game/warpEffects';
import {
  findWarpAtTile,
  GetInFrontOfPlayerPosition,
  GetPlayerCurMetatileBehavior,
  getWarpEffectForBehavior,
  IsArrowWarpMetatileBehavior,
  IsDirectionalStairWarpMetatileBehavior,
  IsWarpMetatileBehavior,
  isArrowWarpMetatileBehavior,
  isWarpMetatileBehavior,
  MetatileBehavior_IsEscalator,
  MetatileBehavior_IsFallWarp,
  MetatileBehavior_IsLadder,
  MetatileBehavior_IsLavaridge1FWarp,
  MetatileBehavior_IsLavaridgeB1FWarp,
  MetatileBehavior_IsNonAnimDoor,
  MetatileBehavior_IsUnionRoomWarp,
  MetatileBehavior_IsWarpDoor,
  MetatileBehavior_IsWarpPad,
  resolveArrowWarpTransition,
  resolveFacingDoorWarpTransition,
  resolveWarpTransition
} from '../src/game/warps';
import {
  loadCeruleanCityMap,
  loadCeruleanCityPokemonCenter1FMap,
  loadCeruleanCityPokemonCenter2FMap,
  loadIndigoPlateauExteriorMap,
  loadIndigoPlateauPokemonCenter1FMap,
  loadMapById,
  loadPalletTownMap,
  loadPalletTownProfessorOaksLabMap,
  loadPalletTownPlayersHouse1FMap,
  loadPalletTownPlayersHouse2FMap,
  loadPalletTownRivalsHouseMap,
  loadPewterCityGymMap,
  loadPewterCityHouse1Map,
  loadPewterCityHouse2Map,
  loadPewterCityMap,
  loadPewterCityMartMap,
  loadPewterCityMuseum1FMap,
  loadPewterCityMuseum2FMap,
  loadPewterCityPokemonCenter1FMap,
  loadPewterCityPokemonCenter2FMap,
  loadVermilionCityGymMap,
  loadVermilionCityHouse1Map,
  loadVermilionCityHouse2Map,
  loadVermilionCityHouse3Map,
  loadVermilionCityMap,
  loadVermilionCityMartMap,
  loadVermilionCityPokemonCenter1FMap,
  loadVermilionCityPokemonCenter2FMap,
  loadVermilionCityPokemonFanClubMap,
  loadViridianCityGymMap,
  loadViridianCityHouseMap,
  loadViridianCityMap,
  loadViridianCityMartMap,
  loadViridianCityPokemonCenter1FMap,
  loadViridianForestMap,
  loadViridianCitySchoolMap,
  loadRoute2ViridianForestNorthEntranceMap,
  loadRoute2ViridianForestSouthEntranceMap,
  mapFromCompactSource,
  parseCompactMapSource,
  type CompactMapSource
} from '../src/world/mapSource';
import type { TileMap } from '../src/world/tileMap';
import { MapGridGetMetatileBehaviorAt } from '../src/world/tileMap';
import indigoPlateauExteriorMapJson from '../src/world/maps/indigoPlateauExterior.json';

const createTestMap = (overrides: Partial<TileMap> = {}): TileMap => ({
  id: 'MAP_TEST',
  width: 4,
  height: 4,
  tileSize: 16,
  walkable: new Array(16).fill(true),
  tileBehaviors: new Array(16).fill(0),
  connections: [],
  triggers: [],
  npcs: [],
  hiddenItems: [],
  warps: [],
  ...overrides
});

describe('warp runtime', () => {
  test('parses compact behavior rows into tile behaviors', () => {
    const map = mapFromCompactSource(parseCompactMapSource(indigoPlateauExteriorMapJson));

    expect(map.tileBehaviors).toBeDefined();
    expect(map.tileBehaviors).toHaveLength(map.width * map.height);
    expect(map.tileBehaviors?.[6 * map.width + 11]).toBe(0x69);
  });

  test('rejects malformed compact behavior rows', () => {
    const base = indigoPlateauExteriorMapJson as CompactMapSource;

    expect(() => parseCompactMapSource({
      ...base,
      behaviorRows: ['69'.repeat(base.width - 1), ...(base.behaviorRows ?? []).slice(1)]
    })).toThrow(/behaviorRows/i);
  });

  test('matches decomp warp metatile behavior predicates', () => {
    expect(MetatileBehavior_IsWarpDoor(0x69)).toBe(true);
    expect(MetatileBehavior_IsWarpDoor(0x68)).toBe(false);
    expect(MetatileBehavior_IsLadder(0x61)).toBe(true);
    expect(MetatileBehavior_IsEscalator(0x6a)).toBe(true);
    expect(MetatileBehavior_IsEscalator(0x6b)).toBe(true);
    expect(MetatileBehavior_IsEscalator(0x6c)).toBe(false);
    expect(MetatileBehavior_IsNonAnimDoor(0x60)).toBe(true);
    expect(MetatileBehavior_IsLavaridgeB1FWarp(0x68)).toBe(false);
    expect(MetatileBehavior_IsLavaridge1FWarp(0x68)).toBe(true);
    expect(MetatileBehavior_IsWarpPad(0x67)).toBe(true);
    expect(MetatileBehavior_IsFallWarp(0x66)).toBe(true);
    expect(MetatileBehavior_IsUnionRoomWarp(0x71)).toBe(true);

    for (const behavior of [0x69, 0x61, 0x6a, 0x6b, 0x60, 0x68, 0x67, 0x66, 0x71]) {
      expect(IsWarpMetatileBehavior(behavior)).toBe(true);
      expect(isWarpMetatileBehavior(behavior)).toBe(true);
    }

    for (const behavior of [0x00, 0x62, 0x63, 0x64, 0x65, 0x6c, 0x6d, 0x6e, 0x6f]) {
      expect(IsWarpMetatileBehavior(behavior)).toBe(false);
      expect(isWarpMetatileBehavior(behavior)).toBe(false);
    }
  });

  test('matches decomp directional and arrow-warp behavior checks', () => {
    expect(IsArrowWarpMetatileBehavior(0x64, 'up')).toBe(true);
    expect(isArrowWarpMetatileBehavior(0x64, 'up')).toBe(true);
    expect(IsArrowWarpMetatileBehavior(0x64, 'down')).toBe(false);
    expect(IsArrowWarpMetatileBehavior(0x65, 'down')).toBe(true);
    expect(IsArrowWarpMetatileBehavior(0x63, 'left')).toBe(true);
    expect(IsArrowWarpMetatileBehavior(0x62, 'right')).toBe(true);

    expect(IsDirectionalStairWarpMetatileBehavior(0x6d, 'left')).toBe(true);
    expect(IsDirectionalStairWarpMetatileBehavior(0x6f, 'left')).toBe(true);
    expect(IsDirectionalStairWarpMetatileBehavior(0x6c, 'right')).toBe(true);
    expect(IsDirectionalStairWarpMetatileBehavior(0x6e, 'right')).toBe(true);
    expect(IsDirectionalStairWarpMetatileBehavior(0x6d, 'right')).toBe(false);
    expect(IsDirectionalStairWarpMetatileBehavior(0x6c, 'up')).toBe(false);
  });

  test('classifies warp behaviors with the same effect branches as field_control_avatar', () => {
    expect(getWarpEffectForBehavior(0x69, 'up')).toEqual({ effect: 'warp', behavior: 0x69 });
    expect(getWarpEffectForBehavior(0x6a, 'up')).toEqual({ effect: 'escalator', behavior: 0x6a });
    expect(getWarpEffectForBehavior(0x6b, 'up')).toEqual({ effect: 'escalator', behavior: 0x6b });
    expect(getWarpEffectForBehavior(0x68, 'up')).toEqual({ effect: 'lavaridge1F', behavior: 0x68 });
    expect(getWarpEffectForBehavior(0x67, 'up')).toEqual({ effect: 'teleport', behavior: 0x67 });
    expect(getWarpEffectForBehavior(0x71, 'up')).toEqual({ effect: 'unionRoom', behavior: 0x71 });
    expect(getWarpEffectForBehavior(0x66, 'up')).toEqual({
      effect: 'fall',
      behavior: 0x66,
      resetInitialPlayerAvatarState: true
    });
    expect(getWarpEffectForBehavior(0x6c, 'right')).toEqual({
      effect: 'stair',
      behavior: 0x6c,
      delayFrames: 0
    });
    expect(getWarpEffectForBehavior(0x6c, 'right', 'machBike')).toEqual({
      effect: 'stair',
      behavior: 0x6c,
      delayFrames: 12
    });
  });

  test('preserves decomp warp effect metadata for current-tile special warps', () => {
    const destination = createTestMap({
      id: 'MAP_DEST',
      warps: [{ x: 2, y: 2, elevation: 0, destMap: 'MAP_TEST', destWarpId: 0 }]
    });
    const player = createPlayer();
    player.position = vec2(1 * destination.tileSize, 1 * destination.tileSize);

    for (const [behavior, expected] of [
      [0x6a, { effect: 'escalator', behavior: 0x6a }],
      [0x6b, { effect: 'escalator', behavior: 0x6b }],
      [0x68, { effect: 'lavaridge1F', behavior: 0x68 }],
      [0x67, { effect: 'teleport', behavior: 0x67 }],
      [0x71, { effect: 'unionRoom', behavior: 0x71 }],
      [0x66, { effect: 'fall', behavior: 0x66, resetInitialPlayerAvatarState: true }]
    ] as const) {
      const map = createTestMap({
        tileBehaviors: [
          0, 0, 0, 0,
          0, behavior, 0, 0,
          0, 0, 0, 0,
          0, 0, 0, 0
        ],
        warps: [{ x: 1, y: 1, elevation: 0, destMap: destination.id, destWarpId: 0 }]
      });

      expect(resolveWarpTransition(map, player, (mapId) => mapId === destination.id ? destination : null))
        .toEqual(expect.objectContaining({
          status: 'resolved',
          sourceWarp: map.warps[0],
          destinationMap: destination,
          destinationWarp: destination.warps[0],
          playerPosition: { x: 2 * destination.tileSize, y: 2 * destination.tileSize },
          ...expected
        }));
    }
  });

  test('applies resolved warp effects to runtime state like decomp warp tasks', () => {
    const runtime = createScriptRuntimeState();
    const player = createPlayer();

    applyWarpTransitionEffect(runtime, player, { status: 'resolved', effect: 'door' });
    applyWarpTransitionEffect(runtime, player, { status: 'resolved', effect: 'escalator' });
    applyWarpTransitionEffect(runtime, player, { status: 'resolved', effect: 'teleport' });
    applyWarpTransitionEffect(runtime, player, {
      status: 'resolved',
      effect: 'fall',
      resetInitialPlayerAvatarState: true
    });
    applyWarpTransitionEffect(runtime, player, { status: 'resolved', effect: 'unionRoom' });

    player.avatarMode = 'machBike';
    applyWarpTransitionEffect(runtime, player, {
      status: 'resolved',
      effect: 'stair',
      delayFrames: 12
    });

    expect(runtime.fieldEffects.triggeredSpecials.DoDoorWarp).toBe(1);
    expect(runtime.fieldEffects.triggeredSpecials.DoEscalatorWarp).toBe(1);
    expect(runtime.fieldEffects.triggeredSpecials.DoTeleportWarp).toBe(1);
    expect(runtime.fieldEffects.triggeredSpecials.DoFallWarp).toBe(1);
    expect(runtime.fieldEffects.triggeredSpecials.DoUnionRoomWarp).toBe(1);
    expect(runtime.fieldEffects.triggeredSpecials.DoStairWarp).toBe(1);
    expect(runtime.fieldEffects.fallWarpCount).toBe(1);
    expect(runtime.startMenu.mode).toBe('unionRoom');
    expect(player.avatarMode).toBe('normal');
    expect(player.runningState).toBe('notMoving');
    expect(player.bikeState).toBe('normal');
    expect(player.bikeFrameCounter).toBe(0);
  });

  test('records directional stair bike dismount delay like TryArrowWarp', () => {
    const map = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0x6c, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ],
      warps: [{ x: 1, y: 1, elevation: 0, destMap: 'MAP_DEST', destWarpId: 0 }]
    });
    const destination = createTestMap({
      id: 'MAP_DEST',
      warps: [{ x: 2, y: 2, elevation: 0, destMap: map.id, destWarpId: 0 }]
    });
    const player = createPlayer();
    player.position = vec2(1 * map.tileSize, 1 * map.tileSize);
    player.facing = 'right';

    expect(resolveWarpTransition(map, player, (mapId) => mapId === destination.id ? destination : null))
      .toEqual(expect.objectContaining({
        status: 'resolved',
        effect: 'stair',
        behavior: 0x6c,
        delayFrames: 0
      }));

    player.avatarMode = 'machBike';

    expect(resolveWarpTransition(map, player, (mapId) => mapId === destination.id ? destination : null))
      .toEqual(expect.objectContaining({
        status: 'resolved',
        effect: 'stair',
        behavior: 0x6c,
        delayFrames: 12
      }));
  });

  test('resolves arrow warps only when held direction matches player facing', () => {
    const map = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0x64, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ],
      warps: [{ x: 1, y: 1, elevation: 0, destMap: 'MAP_DEST', destWarpId: 0 }]
    });
    const destination = createTestMap({
      id: 'MAP_DEST',
      warps: [{ x: 2, y: 2, elevation: 0, destMap: 'MAP_TEST', destWarpId: 0 }]
    });
    const player = createPlayer();
    player.position = vec2(1 * map.tileSize, 1 * map.tileSize);
    player.facing = 'up';

    expect(resolveArrowWarpTransition(map, player, null, () => destination)).toEqual({ status: 'none' });
    expect(resolveArrowWarpTransition(map, player, 'down', () => destination)).toEqual({ status: 'none' });
    expect(resolveWarpTransition(map, player, () => destination, null, { allowArrowWarp: false })).toEqual({
      status: 'not_activatable',
      sourceWarp: map.warps[0]
    });
    expect(resolveArrowWarpTransition(map, player, 'up', () => destination)).toEqual({
      status: 'resolved',
      sourceWarp: map.warps[0],
      destinationMap: destination,
      destinationWarp: destination.warps[0],
      playerPosition: { x: 2 * destination.tileSize, y: 2 * destination.tileSize }
    });
  });

  test('does not let arrow-warp resolver activate regular warp metatiles', () => {
    const map = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0x67, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ],
      warps: [{ x: 1, y: 1, elevation: 0, destMap: 'MAP_DEST', destWarpId: 0 }]
    });
    const player = createPlayer();
    player.position = vec2(1 * map.tileSize, 1 * map.tileSize);
    player.facing = 'up';

    expect(resolveArrowWarpTransition(map, player, 'up', () => null)).toEqual({
      status: 'not_activatable',
      sourceWarp: map.warps[0]
    });
  });

  test('matches GetWarpEventAtPosition elevation wildcard semantics', () => {
    const map = createTestMap({
      warps: [
        { x: 1, y: 2, elevation: 0, destMap: 'MAP_DEST', destWarpId: 0 },
        { x: 2, y: 2, elevation: 3, destMap: 'MAP_DEST', destWarpId: 0 }
      ]
    });

    expect(findWarpAtTile(map, 1, 2, 3)).toEqual(map.warps[0]);
    expect(findWarpAtTile(map, 1, 2, 0)).toEqual(map.warps[0]);
    expect(findWarpAtTile(map, 2, 2, 3)).toEqual(map.warps[1]);
    expect(findWarpAtTile(map, 2, 2, 0)).toBeNull();
    expect(findWarpAtTile(map, 0, 2, 3)).toBeNull();
  });

  test('reads player current behavior and front elevation through MapGrid helpers', () => {
    const map = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0x69, 0, 0,
        0, 0x67, 0, 0,
        0, 0, 0, 0
      ],
      elevations: [
        0, 0, 0, 0,
        0, 3, 0, 0,
        0, 3, 0, 0,
        0, 0, 0, 0
      ]
    });
    const player = createPlayer();
    player.position = vec2(1 * map.tileSize, 2 * map.tileSize);
    player.facing = 'up';

    expect(GetPlayerCurMetatileBehavior(map, player)).toBe(0x67);
    expect(GetInFrontOfPlayerPosition(map, player)).toEqual({ x: 1, y: 1, elevation: 3 });

    player.position = vec2(0, 0);
    expect(GetInFrontOfPlayerPosition(map, player)).toEqual({ x: 0, y: -1, elevation: 0 });
  });

  test('resolves WARP_ID_DYNAMIC destinations from script runtime dynamic warp state', () => {
    const map = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0x67, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ],
      warps: [{ x: 1, y: 1, elevation: 0, destMap: 'MAP_DYNAMIC_PLACEHOLDER', destWarpId: 255 }]
    });
    const destination = createTestMap({
      id: 'MAP_DYNAMIC_DEST',
      width: 8,
      height: 8,
      walkable: new Array(64).fill(true),
      tileBehaviors: new Array(64).fill(0)
    });
    const player = createPlayer();
    player.position = vec2(1 * map.tileSize, 1 * map.tileSize);

    expect(resolveWarpTransition(
      map,
      player,
      (mapId) => mapId === destination.id ? destination : null,
      { mapId: destination.id, warpId: 255, x: 5, y: 6 }
    )).toEqual({
      status: 'resolved',
      effect: 'teleport',
      behavior: 0x67,
      sourceWarp: map.warps[0],
      destinationMap: destination,
      destinationWarp: {
        x: 5,
        y: 6,
        elevation: 0,
        destMap: map.id,
        destWarpId: 255
      },
      playerPosition: { x: 5 * destination.tileSize, y: 6 * destination.tileSize }
    });
  });

  test('resolves Indigo Plateau exterior door warp into the loaded Pokemon Center', () => {
    const map = loadIndigoPlateauExteriorMap();
    const player = createPlayer();
    player.position = vec2(11 * map.tileSize, 6 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 11, y: 6, elevation: 0, destMap: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F', destWarpId: 0 },
      destinationMap: loadIndigoPlateauPokemonCenter1FMap(),
      destinationWarp: { x: 11, y: 16, elevation: 3, destMap: 'MAP_INDIGO_PLATEAU_EXTERIOR', destWarpId: 0 },
      playerPosition: { x: 11 * 16, y: 16 * 16 }
    });
  });

  test('resolves Indigo Plateau center exit back to the loaded exterior map', () => {
    const map = loadIndigoPlateauPokemonCenter1FMap();
    const player = createPlayer();
    player.position = vec2(11 * map.tileSize, 16 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 11, y: 16, elevation: 3, destMap: 'MAP_INDIGO_PLATEAU_EXTERIOR', destWarpId: 0 },
      destinationMap: loadIndigoPlateauExteriorMap(),
      destinationWarp: { x: 11, y: 6, elevation: 0, destMap: 'MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F', destWarpId: 0 },
      playerPosition: { x: 11 * 16, y: 7 * 16 }
    });
  });

  test('resolves the Viridian City Pokemon Center door warp into the loaded center map', () => {
    const map = loadViridianCityMap();
    const player = createPlayer();
    player.position = vec2(26 * map.tileSize, 26 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 26, y: 26, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_POKEMON_CENTER_1F', destWarpId: 1 },
      destinationMap: loadViridianCityPokemonCenter1FMap(),
      destinationWarp: { x: 7, y: 8, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 0 },
      playerPosition: { x: 7 * 16, y: 8 * 16 }
    });
  });

  test('resolves the Viridian City Pokemon Center exit warp back to loaded Viridian City', () => {
    const map = loadViridianCityPokemonCenter1FMap();
    const player = createPlayer();
    player.position = vec2(7 * map.tileSize, 8 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 7, y: 8, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 0 },
      destinationMap: loadViridianCityMap(),
      destinationWarp: { x: 26, y: 26, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_POKEMON_CENTER_1F', destWarpId: 1 },
      playerPosition: { x: 25 * 16, y: 27 * 16 }
    });
  });

  test('requires an activatable metatile behavior for side Pokemon Center exit warps', () => {
    const map = loadViridianCityPokemonCenter1FMap();

    const leftPlayer = createPlayer();
    leftPlayer.position = vec2(6 * map.tileSize, 8 * map.tileSize);
    leftPlayer.facing = 'down';

    expect(resolveWarpTransition(map, leftPlayer, loadMapById)).toEqual({
      status: 'not_activatable',
      sourceWarp: { x: 6, y: 8, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 0 }
    });

    const rightPlayer = createPlayer();
    rightPlayer.position = vec2(8 * map.tileSize, 8 * map.tileSize);
    rightPlayer.facing = 'down';

    expect(resolveWarpTransition(map, rightPlayer, loadMapById)).toEqual({
      status: 'not_activatable',
      sourceWarp: { x: 8, y: 8, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 0 }
    });
  });

  test('resolves the Viridian City Mart door warp into the loaded mart map', () => {
    const map = loadViridianCityMap();
    const player = createPlayer();
    player.position = vec2(36 * map.tileSize, 19 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 36, y: 19, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_MART', destWarpId: 1 },
      destinationMap: loadViridianCityMartMap(),
      destinationWarp: { x: 4, y: 7, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 4 },
      playerPosition: { x: 4 * 16, y: 7 * 16 }
    });
  });

  test('resolves the Viridian City Mart exit warp back to loaded Viridian City', () => {
    const map = loadViridianCityMartMap();
    const player = createPlayer();
    player.position = vec2(4 * map.tileSize, 7 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 4, y: 7, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 4 },
      destinationMap: loadViridianCityMap(),
      destinationWarp: { x: 36, y: 19, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_MART', destWarpId: 1 },
      playerPosition: { x: 35 * 16, y: 20 * 16 }
    });
  });

  test('resolves the Viridian City School door warp into the loaded school map', () => {
    const map = loadViridianCityMap();
    const player = createPlayer();
    player.position = vec2(25 * map.tileSize, 18 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 25, y: 18, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_SCHOOL', destWarpId: 1 },
      destinationMap: loadViridianCitySchoolMap(),
      destinationWarp: { x: 4, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 3 },
      playerPosition: { x: 4 * 16, y: 7 * 16 }
    });
  });

  test('resolves the Viridian City School exit warp back to loaded Viridian City', () => {
    const map = loadViridianCitySchoolMap();
    const player = createPlayer();
    player.position = vec2(4 * map.tileSize, 7 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 4, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 3 },
      destinationMap: loadViridianCityMap(),
      destinationWarp: { x: 25, y: 18, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_SCHOOL', destWarpId: 1 },
      playerPosition: { x: 24 * 16, y: 19 * 16 }
    });
  });

  test('resolves the Viridian City House door warp into the loaded house map', () => {
    const map = loadViridianCityMap();
    const player = createPlayer();
    player.position = vec2(25 * map.tileSize, 12 * map.tileSize);
    player.facing = 'up';

    expect(resolveFacingDoorWarpTransition(map, player, 'up', loadMapById)).toEqual({
      status: 'resolved',
      effect: 'door',
      behavior: 0x69,
      sourceWarp: { x: 25, y: 11, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY_HOUSE', destWarpId: 1 },
      destinationMap: loadViridianCityHouseMap(),
      destinationWarp: { x: 4, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 1 },
      playerPosition: { x: 4 * 16, y: 7 * 16 }
    });
  });

  test('resolves the Viridian City House exit warp back to loaded Viridian City', () => {
    const map = loadViridianCityHouseMap();
    const player = createPlayer();
    player.position = vec2(4 * map.tileSize, 7 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 4, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 1 },
      destinationMap: loadViridianCityMap(),
      destinationWarp: { x: 25, y: 11, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY_HOUSE', destWarpId: 1 },
      playerPosition: { x: 24 * 16, y: 12 * 16 }
    });
  });

  test('requires an activatable metatile behavior for side Viridian City house exit warps', () => {
    const map = loadViridianCityHouseMap();

    const leftPlayer = createPlayer();
    leftPlayer.position = vec2(3 * map.tileSize, 7 * map.tileSize);
    leftPlayer.facing = 'down';

    expect(resolveWarpTransition(map, leftPlayer, loadMapById)).toEqual({
      status: 'not_activatable',
      sourceWarp: { x: 3, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 1 }
    });

    const rightPlayer = createPlayer();
    rightPlayer.position = vec2(5 * map.tileSize, 7 * map.tileSize);
    rightPlayer.facing = 'down';

    expect(resolveWarpTransition(map, rightPlayer, loadMapById)).toEqual({
      status: 'not_activatable',
      sourceWarp: { x: 5, y: 7, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 1 }
    });
  });

  test('matches decomp door-warp behavior for blocked outdoor entrances', () => {
    const map = loadViridianCityMap();
    const player = createPlayer();
    player.position = vec2(25 * map.tileSize, 12 * map.tileSize);
    player.facing = 'up';

    expect(resolveFacingDoorWarpTransition(map, player, 'up', loadMapById)).toEqual({
      status: 'resolved',
      effect: 'door',
      behavior: 0x69,
      sourceWarp: { x: 25, y: 11, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY_HOUSE', destWarpId: 1 },
      destinationMap: loadViridianCityHouseMap(),
      destinationWarp: { x: 4, y: 7, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 1 },
      playerPosition: { x: 4 * 16, y: 7 * 16 }
    });
  });

  test('does not door-warp unless the player is actively pressing up into the entrance', () => {
    const map = loadPalletTownMap();
    const player = createPlayer();
    player.position = vec2(6 * map.tileSize, 8 * map.tileSize);
    player.facing = 'up';

    expect(resolveFacingDoorWarpTransition(map, player, null, loadMapById)).toEqual({ status: 'none' });
    expect(resolveFacingDoorWarpTransition(map, player, 'left', loadMapById)).toEqual({ status: 'none' });
  });

  test('does not door-warp from a behavior-zero tile even when a warp event exists', () => {
    const map = createTestMap({
      walkable: [
        true, false, true, true,
        true, true, true, true,
        true, true, true, true,
        true, true, true, true
      ],
      tileBehaviors: new Array(16).fill(0),
      warps: [{ x: 1, y: 0, elevation: 0, destMap: 'MAP_DEST', destWarpId: 0 }]
    });
    const destination = createTestMap({ id: 'MAP_DEST' });
    const player = createPlayer();
    player.position = vec2(1 * map.tileSize, 1 * map.tileSize);
    player.facing = 'up';

    expect(resolveFacingDoorWarpTransition(map, player, 'up', (mapId) => mapId === destination.id ? destination : null))
      .toEqual({ status: 'not_activatable', sourceWarp: map.warps[0] });
  });

  test('resolves blocked Poke Center and mart entrances from the tile south of the door', () => {
    const outdoorCases = [
      {
        map: loadPewterCityMap(),
        standingTile: { x: 17, y: 26 },
        sourceWarp: { x: 17, y: 25, elevation: 0, destMap: 'MAP_PEWTER_CITY_POKEMON_CENTER_1F', destWarpId: 1 }
      },
      {
        map: loadVermilionCityMap(),
        standingTile: { x: 29, y: 18 },
        sourceWarp: { x: 29, y: 17, elevation: 0, destMap: 'MAP_VERMILION_CITY_MART', destWarpId: 1 }
      }
    ];

    for (const testCase of outdoorCases) {
      const player = createPlayer();
      player.position = vec2(
        testCase.standingTile.x * testCase.map.tileSize,
        testCase.standingTile.y * testCase.map.tileSize
      );
      player.facing = 'up';

      const result = resolveFacingDoorWarpTransition(testCase.map, player, 'up', loadMapById);
      expect(result.status).toBe('resolved');
      if (result.status !== 'resolved') continue;

      expect(result.sourceWarp).toEqual(testCase.sourceWarp);
      expect(result.destinationMap).toBeTruthy();
      expect(result.destinationWarp).toEqual(result.destinationMap!.warps[testCase.sourceWarp.destWarpId]);
    }
  });

  test('places outdoor exits on a walkable tile so the player can move immediately', () => {
    const map = loadPalletTownPlayersHouse1FMap();
    const player = createPlayer();
    player.position = vec2(4 * map.tileSize, 8 * map.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(map, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved' || !result.destinationMap || !result.playerPosition) return;

    const outdoorPlayer = createPlayer();
    outdoorPlayer.position = vec2(result.playerPosition.x, result.playerPosition.y);
    outdoorPlayer.facing = 'down';

    stepPlayer(
      outdoorPlayer,
      {
        up: false,
        down: true,
        left: false,
        right: false,
        upPressed: false,
        downPressed: true,
        leftPressed: false,
        rightPressed: false,
        run: false,
        interact: false,
        interactPressed: false,
        start: false,
        startPressed: false,
        cancel: false,
        cancelPressed: false
      },
      result.destinationMap,
      0.1
    );

    expect(outdoorPlayer.position.y).toBeGreaterThan(result.playerPosition.y);
  });

  test('resolves the Pallet Town front door warp into the loaded Players House 1F', () => {
    const map = loadPalletTownMap();
    const player = createPlayer();
    player.position = vec2(6 * map.tileSize, 7 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 6, y: 7, elevation: 0, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F', destWarpId: 1 },
      destinationMap: loadPalletTownPlayersHouse1FMap(),
      destinationWarp: { x: 4, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 0 },
      playerPosition: { x: 4 * 16, y: 8 * 16 }
    });
  });

  test('resolves the Pallet Town rival house front door warp into the loaded interior map', () => {
    const map = loadPalletTownMap();
    const player = createPlayer();
    player.position = vec2(15 * map.tileSize, 7 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 15, y: 7, elevation: 0, destMap: 'MAP_PALLET_TOWN_RIVALS_HOUSE', destWarpId: 0 },
      destinationMap: loadPalletTownRivalsHouseMap(),
      destinationWarp: { x: 4, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 1 },
      playerPosition: { x: 4 * 16, y: 8 * 16 }
    });
  });

  test("resolves the Pallet Town Oak's Lab front door warp into the loaded interior map", () => {
    const map = loadPalletTownMap();
    const player = createPlayer();
    player.position = vec2(16 * map.tileSize, 13 * map.tileSize);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 16, y: 13, elevation: 0, destMap: 'MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB', destWarpId: 0 },
      destinationMap: loadPalletTownProfessorOaksLabMap(),
      destinationWarp: { x: 6, y: 12, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 2 },
      playerPosition: { x: 6 * 16, y: 12 * 16 }
    });
  });

  test('resolves the Players House 1F stair warp into the loaded 2F map', () => {
    const map = loadPalletTownPlayersHouse1FMap();
    const player = createPlayer();
    player.position = vec2(10 * map.tileSize, 2 * map.tileSize);
    player.facing = 'right';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      effect: 'stair',
      behavior: 0x6c,
      delayFrames: 0,
      sourceWarp: { x: 10, y: 2, elevation: 3, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_2F', destWarpId: 0 },
      destinationMap: loadPalletTownPlayersHouse2FMap(),
      destinationWarp: { x: 10, y: 2, elevation: 3, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F', destWarpId: 2 },
      playerPosition: { x: 10 * 16, y: 2 * 16 }
    });
  });

  test('resolves the Players House 2F stair warp back to the loaded 1F map', () => {
    const map = loadPalletTownPlayersHouse2FMap();
    const player = createPlayer();
    player.position = vec2(10 * map.tileSize, 2 * map.tileSize);
    player.facing = 'left';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      effect: 'stair',
      behavior: 0x6f,
      delayFrames: 0,
      sourceWarp: { x: 10, y: 2, elevation: 3, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F', destWarpId: 2 },
      destinationMap: loadPalletTownPlayersHouse1FMap(),
      destinationWarp: { x: 10, y: 2, elevation: 3, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_2F', destWarpId: 0 },
      playerPosition: { x: 10 * 16, y: 2 * 16 }
    });
  });

  test('resolves the Players House 1F exit warp back to loaded Pallet Town', () => {
    const map = loadPalletTownPlayersHouse1FMap();
    const player = createPlayer();
    player.position = vec2(4 * map.tileSize, 8 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 4, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 0 },
      destinationMap: loadPalletTownMap(),
      destinationWarp: { x: 6, y: 7, elevation: 0, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F', destWarpId: 1 },
      playerPosition: { x: 5 * 16, y: 8 * 16 }
    });
  });

  test('requires an activatable metatile behavior for Players House 1F exit warps', () => {
    const map = loadPalletTownPlayersHouse1FMap();

    const leftPlayer = createPlayer();
    leftPlayer.position = vec2(4 * map.tileSize, 8 * map.tileSize);
    leftPlayer.facing = 'down';

    expect(resolveWarpTransition(map, leftPlayer, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 4, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 0 },
      destinationMap: loadPalletTownMap(),
      destinationWarp: { x: 6, y: 7, elevation: 0, destMap: 'MAP_PALLET_TOWN_PLAYERS_HOUSE_1F', destWarpId: 1 },
      playerPosition: { x: 5 * 16, y: 8 * 16 }
    });

    const rightPlayer = createPlayer();
    rightPlayer.position = vec2(5 * map.tileSize, 8 * map.tileSize);
    rightPlayer.facing = 'down';

    expect(resolveWarpTransition(map, rightPlayer, loadMapById)).toEqual({
      status: 'not_activatable',
      sourceWarp: { x: 5, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 0 }
    });
  });

  test('resolves Route 2 Viridian Forest entrance warps into the loaded forest map', () => {
    const southEntrance = loadRoute2ViridianForestSouthEntranceMap();
    const northEntrance = loadRoute2ViridianForestNorthEntranceMap();
    const viridianForest = loadViridianForestMap();

    const southPlayer = createPlayer();
    southPlayer.position = vec2(7 * southEntrance.tileSize, 1 * southEntrance.tileSize);
    southPlayer.facing = 'up';

    expect(resolveWarpTransition(southEntrance, southPlayer, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 7, y: 1, elevation: 3, destMap: 'MAP_VIRIDIAN_FOREST', destWarpId: 0 },
      destinationMap: viridianForest,
      destinationWarp: { x: 29, y: 62, elevation: 3, destMap: 'MAP_ROUTE2_VIRIDIAN_FOREST_SOUTH_ENTRANCE', destWarpId: 3 },
      playerPosition: { x: 29 * 16, y: 62 * 16 }
    });

    const northPlayer = createPlayer();
    northPlayer.position = vec2(7 * northEntrance.tileSize, 10 * northEntrance.tileSize);
    northPlayer.facing = 'down';

    expect(resolveWarpTransition(northEntrance, northPlayer, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 7, y: 10, elevation: 3, destMap: 'MAP_VIRIDIAN_FOREST', destWarpId: 2 },
      destinationMap: viridianForest,
      destinationWarp: { x: 5, y: 9, elevation: 3, destMap: 'MAP_ROUTE2_VIRIDIAN_FOREST_NORTH_ENTRANCE', destWarpId: 1 },
      playerPosition: { x: 4 * 16, y: 9 * 16 }
    });
  });

  test('resolves the rival house exit warp back to loaded Pallet Town', () => {
    const map = loadPalletTownRivalsHouseMap();
    const player = createPlayer();
    player.position = vec2(4 * map.tileSize, 8 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 4, y: 8, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 1 },
      destinationMap: loadPalletTownMap(),
      destinationWarp: { x: 15, y: 7, elevation: 0, destMap: 'MAP_PALLET_TOWN_RIVALS_HOUSE', destWarpId: 0 },
      playerPosition: { x: 14 * 16, y: 8 * 16 }
    });
  });

  test("resolves Oak's Lab exit warp back to loaded Pallet Town", () => {
    const map = loadPalletTownProfessorOaksLabMap();
    const player = createPlayer();
    player.position = vec2(6 * map.tileSize, 12 * map.tileSize);
    player.facing = 'down';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'resolved',
      sourceWarp: { x: 6, y: 12, elevation: 3, destMap: 'MAP_PALLET_TOWN', destWarpId: 2 },
      destinationMap: loadPalletTownMap(),
      destinationWarp: { x: 16, y: 13, elevation: 0, destMap: 'MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB', destWarpId: 0 },
      playerPosition: { x: 15 * 16, y: 14 * 16 }
    });
  });

  test('reports unloaded destination maps for activatable building warps', () => {
    const map = createTestMap({
      tileBehaviors: [
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x69, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00
      ],
      warps: [{ x: 1, y: 1, elevation: 0, destMap: 'MAP_UNLOADED', destWarpId: 0 }]
    });
    const player = createPlayer();
    player.position = vec2(16, 16);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'unloaded_map',
      sourceWarp: map.warps[0]
    });
  });

  test('reports invalid destination warp ids on loaded maps', () => {
    const map = createTestMap({
      tileBehaviors: [
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x69, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00
      ],
      warps: [{ x: 1, y: 1, elevation: 0, destMap: 'MAP_INDIGO_PLATEAU_EXTERIOR', destWarpId: 9 }]
    });
    const player = createPlayer();
    player.position = vec2(16, 16);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'invalid_warp_id',
      sourceWarp: map.warps[0],
      destinationMap: loadIndigoPlateauExteriorMap()
    });
  });

  test('does not activate warp events on non-warp metatile behaviors', () => {
    const map = createTestMap({
      tileBehaviors: [
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x84, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00
      ],
      warps: [{ x: 1, y: 1, elevation: 0, destMap: 'MAP_INDIGO_PLATEAU_EXTERIOR', destWarpId: 0 }]
    });
    const player = createPlayer();
    player.position = vec2(16, 16);
    player.facing = 'up';

    expect(resolveWarpTransition(map, player, loadMapById)).toEqual({
      status: 'not_activatable',
      sourceWarp: map.warps[0]
    });
  });

  test('resolves the Viridian City gym door warp into the loaded gym map', () => {
    const map = loadViridianCityMap();
    const player = createPlayer();
    player.position = vec2(36 * map.tileSize, 10 * map.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(map, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const gymMap = loadViridianCityGymMap();
    expect(result.sourceWarp).toEqual({ x: 36, y: 10, elevation: 0, destMap: 'MAP_VIRIDIAN_CITY_GYM', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(gymMap.id);
    expect(result.destinationWarp).toEqual(gymMap.warps[1]);
    expect(result.playerPosition).toEqual({ x: 17 * 16, y: 22 * 16 });
  });

  test('resolves the Viridian City Gym exit warp back to loaded Viridian City', () => {
    const map = loadViridianCityGymMap();
    const player = createPlayer();
    player.position = vec2(17 * map.tileSize, 22 * map.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(map, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const viridianMap = loadViridianCityMap();
    expect(result.sourceWarp).toEqual({ x: 17, y: 22, elevation: 3, destMap: 'MAP_VIRIDIAN_CITY', destWarpId: 2 });
    expect(result.destinationMap!.id).toBe(viridianMap.id);
    expect(result.destinationWarp).toEqual(viridianMap.warps[2]);
    expect(result.playerPosition).toEqual({ x: 35 * 16, y: 11 * 16 });
  });

  test('resolves Pewter City Gym door warp into the loaded gym map', () => {
    const pewterMap = loadPewterCityMap();
    const player = createPlayer();
    player.position = vec2(15 * pewterMap.tileSize, 16 * pewterMap.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(pewterMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const gymMap = loadPewterCityGymMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_GYM', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(gymMap.id);
    expect(result.destinationWarp).toEqual(gymMap.warps[1]);
  });

  test('resolves Pewter City Gym exit warp back to Pewter City', () => {
    const gymMap = loadPewterCityGymMap();
    const player = createPlayer();
    player.position = vec2(6 * gymMap.tileSize, 14 * gymMap.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(gymMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const pewterMap = loadPewterCityMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY', destWarpId: 2 });
    expect(result.destinationMap!.id).toBe(pewterMap.id);
    expect(result.destinationWarp).toEqual(pewterMap.warps[2]);
  });

  test('resolves Pewter City Mart door warp into the loaded mart map', () => {
    const pewterMap = loadPewterCityMap();
    const player = createPlayer();
    player.position = vec2(28 * pewterMap.tileSize, 18 * pewterMap.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(pewterMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const martMap = loadPewterCityMartMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_MART', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(martMap.id);
  });

  test('resolves Pewter City Pokemon Center door warp into the loaded center', () => {
    const pewterMap = loadPewterCityMap();
    const player = createPlayer();
    player.position = vec2(17 * pewterMap.tileSize, 25 * pewterMap.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(pewterMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const centerMap = loadPewterCityPokemonCenter1FMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_POKEMON_CENTER_1F', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(centerMap.id);
  });

  test('resolves Pewter City Museum 1F to 2F stair warp', () => {
    const museum1F = loadPewterCityMuseum1FMap();
    const player = createPlayer();
    player.position = vec2(8 * museum1F.tileSize, 8 * museum1F.tileSize);
    player.facing = 'right';

    const result = resolveWarpTransition(museum1F, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const museum2F = loadPewterCityMuseum2FMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_MUSEUM_2F', destWarpId: 0 });
    expect(result.destinationMap!.id).toBe(museum2F.id);
  });

  test('resolves Pewter City Museum 2F to 1F stair warp', () => {
    const museum2F = loadPewterCityMuseum2FMap();
    const player = createPlayer();
    player.position = vec2(11 * museum2F.tileSize, 8 * museum2F.tileSize);
    player.facing = 'left';

    const result = resolveWarpTransition(museum2F, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const museum1F = loadPewterCityMuseum1FMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_MUSEUM_1F', destWarpId: 5 });
    expect(result.destinationMap!.id).toBe(museum1F.id);
  });

  test('resolves Pewter City House1 door warp', () => {
    const pewterMap = loadPewterCityMap();
    const player = createPlayer();
    player.position = vec2(33 * pewterMap.tileSize, 11 * pewterMap.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(pewterMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const house1 = loadPewterCityHouse1Map();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_HOUSE1', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(house1.id);
  });

  test('resolves Pewter City House2 door warp', () => {
    const pewterMap = loadPewterCityMap();
    const player = createPlayer();
    player.position = vec2(9 * pewterMap.tileSize, 30 * pewterMap.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(pewterMap, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const house2 = loadPewterCityHouse2Map();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_HOUSE2', destWarpId: 1 });
    expect(result.destinationMap!.id).toBe(house2.id);
  });

  test('resolves Pewter Center 1F to 2F stair warp', () => {
    const center1F = loadPewterCityPokemonCenter1FMap();
    const player = createPlayer();
    player.position = vec2(1 * center1F.tileSize, 6 * center1F.tileSize);
    player.facing = 'up';

    const result = resolveWarpTransition(center1F, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const center2F = loadPewterCityPokemonCenter2FMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_POKEMON_CENTER_2F', destWarpId: 0 });
    expect(result.destinationMap!.id).toBe(center2F.id);
  });

  test('resolves Pewter Center 2F to 1F stair warp', () => {
    const center2F = loadPewterCityPokemonCenter2FMap();
    const player = createPlayer();
    player.position = vec2(1 * center2F.tileSize, 6 * center2F.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(center2F, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;

    const center1F = loadPewterCityPokemonCenter1FMap();
    expect(result.sourceWarp).toMatchObject({ destMap: 'MAP_PEWTER_CITY_POKEMON_CENTER_1F', destWarpId: 3 });
    expect(result.destinationMap!.id).toBe(center1F.id);
  });

  test('resolves Cerulean City door warps into the loaded interiors', () => {
    const cityMap = loadCeruleanCityMap();
    const destinations = [
      'MAP_CERULEAN_CITY_HOUSE1',
      'MAP_CERULEAN_CITY_HOUSE2',
      'MAP_CERULEAN_CITY_HOUSE3',
      'MAP_CERULEAN_CITY_POKEMON_CENTER_1F',
      'MAP_CERULEAN_CITY_GYM',
      'MAP_CERULEAN_CITY_BIKE_SHOP',
      'MAP_CERULEAN_CITY_MART',
      'MAP_CERULEAN_CITY_HOUSE4',
      'MAP_CERULEAN_CITY_HOUSE5'
    ];

    for (const destMap of destinations) {
      const warp = cityMap.warps.find((candidate) => candidate.destMap === destMap);
      expect(warp).toBeDefined();
      if (!warp) continue;

      const player = createPlayer();
      const behavior = MapGridGetMetatileBehaviorAt(cityMap, warp.x, warp.y);
      const isWarpDoor = behavior === 0x69;
      player.position = isWarpDoor
        ? vec2(warp.x * cityMap.tileSize, (warp.y + 1) * cityMap.tileSize)
        : vec2(warp.x * cityMap.tileSize, warp.y * cityMap.tileSize);
      player.facing = isWarpDoor ? 'up' : 'down';

      const result = isWarpDoor
        ? resolveFacingDoorWarpTransition(cityMap, player, 'up', loadMapById)
        : resolveWarpTransition(cityMap, player, loadMapById);
      expect(result.status).toBe('resolved');
      if (result.status !== 'resolved') continue;
      expect(result.sourceWarp).toEqual(warp);
      expect(result.destinationMap!.id).toBe(destMap);
      expect(result.destinationWarp).toEqual(result.destinationMap!.warps[warp.destWarpId]);
    }
  });

  test('resolves Cerulean Pokemon Center stairs between 1F and 2F', () => {
    const center1F = loadCeruleanCityPokemonCenter1FMap();
    const player = createPlayer();
    player.position = vec2(1 * center1F.tileSize, 6 * center1F.tileSize);
    player.facing = 'up';

    const upstairs = resolveWarpTransition(center1F, player, loadMapById);
    expect(upstairs.status).toBe('resolved');
    if (upstairs.status !== 'resolved') return;

    const center2F = loadCeruleanCityPokemonCenter2FMap();
    expect(upstairs.sourceWarp).toMatchObject({ destMap: 'MAP_CERULEAN_CITY_POKEMON_CENTER_2F', destWarpId: 0 });
    expect(upstairs.destinationMap!.id).toBe(center2F.id);

    player.position = vec2(1 * center2F.tileSize, 6 * center2F.tileSize);
    player.facing = 'down';

    const downstairs = resolveWarpTransition(center2F, player, loadMapById);
    expect(downstairs.status).toBe('resolved');
    if (downstairs.status !== 'resolved') return;
    expect(downstairs.sourceWarp).toMatchObject({ destMap: 'MAP_CERULEAN_CITY_POKEMON_CENTER_1F', destWarpId: 3 });
    expect(downstairs.destinationMap!.id).toBe(center1F.id);
  });

  test('resolves Vermilion City door warps into the loaded interiors', () => {
    const cityMap = loadVermilionCityMap();
    const destinations = [
      'MAP_VERMILION_CITY_HOUSE1',
      'MAP_VERMILION_CITY_POKEMON_CENTER_1F',
      'MAP_VERMILION_CITY_POKEMON_FAN_CLUB',
      'MAP_VERMILION_CITY_HOUSE2',
      'MAP_VERMILION_CITY_MART',
      'MAP_VERMILION_CITY_HOUSE3',
      'MAP_VERMILION_CITY_GYM'
    ];

    for (const destMap of destinations) {
      const warp = cityMap.warps.find((candidate) => candidate.destMap === destMap);
      expect(warp).toBeDefined();
      if (!warp) continue;

      const player = createPlayer();
      const behavior = MapGridGetMetatileBehaviorAt(cityMap, warp.x, warp.y);
      const isWarpDoor = behavior === 0x69;
      player.position = isWarpDoor
        ? vec2(warp.x * cityMap.tileSize, (warp.y + 1) * cityMap.tileSize)
        : vec2(warp.x * cityMap.tileSize, warp.y * cityMap.tileSize);
      player.facing = isWarpDoor ? 'up' : 'down';

      const result = isWarpDoor
        ? resolveFacingDoorWarpTransition(cityMap, player, 'up', loadMapById)
        : resolveWarpTransition(cityMap, player, loadMapById);
      expect(result.status).toBe('resolved');
      if (result.status !== 'resolved') continue;
      expect(result.sourceWarp).toEqual(warp);
      expect(result.destinationMap!.id).toBe(destMap);
      expect(result.destinationWarp).toEqual(result.destinationMap!.warps[warp.destWarpId]);
    }
  });

  test('resolves Vermilion Pokemon Center stairs between 1F and 2F', () => {
    const center1F = loadVermilionCityPokemonCenter1FMap();
    const player = createPlayer();
    player.position = vec2(1 * center1F.tileSize, 6 * center1F.tileSize);
    player.facing = 'up';

    const upstairs = resolveWarpTransition(center1F, player, loadMapById);
    expect(upstairs.status).toBe('resolved');
    if (upstairs.status !== 'resolved') return;

    const center2F = loadVermilionCityPokemonCenter2FMap();
    expect(upstairs.sourceWarp).toMatchObject({ destMap: 'MAP_VERMILION_CITY_POKEMON_CENTER_2F', destWarpId: 0 });
    expect(upstairs.destinationMap!.id).toBe(center2F.id);

    player.position = vec2(1 * center2F.tileSize, 6 * center2F.tileSize);
    player.facing = 'down';

    const downstairs = resolveWarpTransition(center2F, player, loadMapById);
    expect(downstairs.status).toBe('resolved');
    if (downstairs.status !== 'resolved') return;
    expect(downstairs.sourceWarp).toMatchObject({ destMap: 'MAP_VERMILION_CITY_POKEMON_CENTER_1F', destWarpId: 3 });
    expect(downstairs.destinationMap!.id).toBe(center1F.id);
  });

  test('resolves Vermilion Gym exit warps back to city', () => {
    const gym = loadVermilionCityGymMap();
    const player = createPlayer();
    const exitWarp = gym.warps[1];

    player.position = vec2(exitWarp.x * gym.tileSize, exitWarp.y * gym.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(gym, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;
    expect(result.destinationMap!.id).toBe('MAP_VERMILION_CITY');
  });

  test('resolves Vermilion Fan Club exit warps back to city', () => {
    const fanClub = loadVermilionCityPokemonFanClubMap();
    const player = createPlayer();
    const exitWarp = fanClub.warps[1];

    player.position = vec2(exitWarp.x * fanClub.tileSize, exitWarp.y * fanClub.tileSize);
    player.facing = 'down';

    const result = resolveWarpTransition(fanClub, player, loadMapById);
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;
    expect(result.destinationMap!.id).toBe('MAP_VERMILION_CITY');
  });

  test('resolves Vermilion House1/2/3 and Mart exit warps back to city', () => {
    const interiors = [
      loadVermilionCityHouse1Map,
      loadVermilionCityHouse2Map,
      loadVermilionCityHouse3Map,
      loadVermilionCityMartMap
    ];

    for (const load of interiors) {
      const map = load();
      const player = createPlayer();
      const exitWarp = map.warps[1];

      player.position = vec2(exitWarp.x * map.tileSize, exitWarp.y * map.tileSize);
      player.facing = 'down';

      const result = resolveWarpTransition(map, player, loadMapById);
      expect(result.status).toBe('resolved');
      if (result.status !== 'resolved') continue;
      expect(result.destinationMap!.id).toBe('MAP_VERMILION_CITY');
    }
  });
});
