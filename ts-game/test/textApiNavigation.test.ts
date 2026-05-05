import { describe, expect, it } from 'vitest';
import { ActionEnumerator } from '../src/api/actionEnumerator';
import { ActionExecutor } from '../src/api/actionExecutor';
import { SessionManager } from '../src/api/sessionManager';
import type { TextApiOption } from '../src/api/textApiTypes';
import type { GameRuntimeState, GameSession } from '../src/core/gameSession';
import { vec2 } from '../src/core/vec2';
import type { NpcState } from '../src/game/npc';
import type { InputSnapshot } from '../src/input/inputState';
import type { TileMap } from '../src/world/tileMap';

const createBaseState = (): GameRuntimeState => {
  const manager = new SessionManager({ createId: () => `navigation-api-${Math.random().toString(16).slice(2)}` });
  const session = manager.createSession();
  const state = session.gameSession.getRuntimeState();
  manager.deleteSession(session.id);
  return state;
};

const withState = (base: GameRuntimeState, override: Partial<GameRuntimeState>): GameRuntimeState => ({
  ...base,
  ...override
});

const makeMap = (base: TileMap, override: Partial<TileMap> = {}): TileMap => ({
  ...base,
  id: 'TEST_CITY',
  width: 6,
  height: 5,
  mapType: 'city',
  walkable: Array.from({ length: 30 }, () => true),
  collisionValues: Array.from({ length: 30 }, () => 0),
  elevations: Array.from({ length: 30 }, () => 0),
  terrainTypes: Array.from({ length: 30 }, () => 0),
  tileBehaviors: Array.from({ length: 30 }, () => 0),
  connections: [],
  triggers: [],
  hiddenItems: [],
  npcs: [],
  warps: [],
  ...override
});

const setBehavior = (map: TileMap, x: number, y: number, behavior: number): TileMap => {
  const tileBehaviors = [...(map.tileBehaviors ?? Array.from({ length: map.width * map.height }, () => 0))];
  tileBehaviors[y * map.width + x] = behavior;
  return { ...map, tileBehaviors };
};

const setCollision = (map: TileMap, x: number, y: number, value: number): TileMap => {
  const collisionValues = [...(map.collisionValues ?? Array.from({ length: map.width * map.height }, () => 0))];
  collisionValues[y * map.width + x] = value;
  return { ...map, collisionValues, walkable: collisionValues.map((entry) => entry === 0) };
};

const placePlayer = (
  state: GameRuntimeState,
  x: number,
  y: number,
  facing: GameRuntimeState['player']['facing'] = 'right'
): GameRuntimeState => withState(state, {
  player: {
    ...state.player,
    position: vec2(x * state.map.tileSize, y * state.map.tileSize),
    currentTile: vec2(x, y),
    previousTile: vec2(x, y),
    facing,
    currentElevation: 0,
    previousElevation: 0,
    moving: false
  }
});

const makeNpc = (override: Partial<NpcState>): NpcState => ({
  id: 'npc-guide',
  position: vec2(4 * 16, 2 * 16),
  path: [],
  pathIndex: 0,
  facing: 'down',
  moving: false,
  animationTime: 0,
  idleDurationSeconds: 0,
  idleTimeRemaining: 0,
  dialogueLines: ['Hello!'],
  dialogueIndex: 0,
  currentTile: vec2(4, 2),
  previousTile: vec2(4, 2),
  initialTile: vec2(4, 2),
  currentElevation: 0,
  previousElevation: 0,
  movementRangeX: 0,
  movementRangeY: 0,
  trainerType: 'TRAINER_TYPE_NONE',
  trainerSightOrBerryTreeId: 0,
  ...override
});

const fakeSessionForState = (
  state: GameRuntimeState,
  version = 4,
  onStep?: (input: InputSnapshot) => void
): GameSession => ({
  version,
  step: (input: InputSnapshot) => {
    if (onStep) {
      onStep(input);
      return;
    }
    const direction = input.up ? 'up' : input.down ? 'down' : input.left ? 'left' : input.right ? 'right' : null;
    if (!direction) {
      return;
    }
    if (state.player.facing !== direction) {
      state.player.facing = direction;
      return;
    }
    const dx = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
    const dy = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
    const tile = state.player.currentTile ?? vec2(0, 0);
    const next = vec2(tile.x + dx, tile.y + dy);
    state.player.previousTile = tile;
    state.player.currentTile = next;
    state.player.position = vec2(next.x * state.map.tileSize, next.y * state.map.tileSize);
    state.player.moving = false;
    delete state.player.stepTarget;
  },
  stepFrames: () => undefined,
  getRuntimeState: () => state,
  getRenderableState: () => { throw new Error('not needed'); },
  exportSaveBlob: () => { throw new Error('not needed'); },
  importSaveBlob: () => undefined,
  cleanup: () => undefined
} as unknown as GameSession);

const enumerate = (state: GameRuntimeState): TextApiOption[] => new ActionEnumerator().enumerate(fakeSessionForState(state));

describe('Text API semantic navigation', () => {
  it('lists city buildings, routes, NPCs, and signs', () => {
    const base = createBaseState();
    const map = setBehavior(makeMap(base.map, {
      connections: [{ direction: 'right', map: 'ROUTE_1', offset: 0 }],
      warps: [{ x: 3, y: 1, elevation: 0, destMap: 'VIRIDIAN_MART', destWarpId: 0 }],
      triggers: [{ id: 'city-sign', x: 1, y: 3, activation: 'interact', scriptId: 'CitySignScript', facing: 'any', once: false }]
    }), 3, 1, 0x69);
    const npc = makeNpc({ id: 'npc-guide', currentTile: vec2(4, 2), position: vec2(4 * 16, 2 * 16) });
    const state = placePlayer(withState(base, { map, npcs: [npc] }), 1, 2, 'right');

    const labels = enumerate(state).map((option) => option.label);

    expect(labels).toContain('Enter Viridian Mart');
    expect(labels).toContain('Exit east to Route 1');
    expect(labels).toContain('Go to Guide');
    expect(labels).toContain('Go to sign');
  });

  it('lists route cardinal movement with blocked reasons', () => {
    const base = createBaseState();
    const map = setCollision(makeMap(base.map, { id: 'ROUTE_TEST', mapType: 'route' }), 2, 1, 1);
    const state = placePlayer(withState(base, { map, npcs: [] }), 1, 1, 'right');

    const east = enumerate(state).find((option) => option.action.type === 'move' && option.action.target === 'east');
    const west = enumerate(state).find((option) => option.action.type === 'move' && option.action.target === 'west');

    expect(east).toMatchObject({ enabled: false, disabledReason: expect.stringContaining('blocks') });
    expect(west).toMatchObject({ enabled: true });
  });

  it('autopilots to a reachable door using stepped movement', () => {
    const base = createBaseState();
    const map = setBehavior(makeMap(base.map, {
      warps: [{ x: 3, y: 1, elevation: 0, destMap: 'VIRIDIAN_MART', destWarpId: 0 }]
    }), 3, 1, 0x69);
    const state = placePlayer(withState(base, { map, npcs: [] }), 1, 2, 'right');
    const session = fakeSessionForState(state);
    const option = new ActionEnumerator().enumerate(session).find((candidate) => candidate.label === 'Enter Viridian Mart');

    expect(option).toBeDefined();
    const result = new ActionExecutor().execute(session, option!.id, 4);

    expect(result.status).toBe(200);
    expect(state.player.currentTile).toEqual(vec2(3, 1));
    expect(state.player.facing).toBe('up');
  });

  it('autopilot stops when trainer sight begins', () => {
    const base = createBaseState();
    const map = makeMap(base.map, { warps: [{ x: 4, y: 2, elevation: 0, destMap: 'ROUTE_1', destWarpId: 0 }] });
    const state = placePlayer(withState(base, { map, npcs: [] }), 1, 2, 'right');
    const session = fakeSessionForState(state, 4, (input) => {
      fakeSessionForState(state).step(input);
      if (state.player.currentTile?.x === 2) {
        (state as { activeTrainerSee: GameRuntimeState['activeTrainerSee'] }).activeTrainerSee = {
          trainerId: 'trainer-test',
          phase: 'exclamation',
          direction: 'left',
          approachDistance: 2,
          remainingExclamationFrames: 32
        };
      }
    });
    const option = new ActionEnumerator().enumerate(session).find((candidate) => candidate.label === 'Exit to Route 1');

    const result = new ActionExecutor().execute(session, option!.id, 4);

    expect(result.body.snapshot.mode).toBe('trainerSee');
    expect(state.player.currentTile).toEqual(vec2(2, 2));
  });

  it('autopilot stops when a wild encounter starts', () => {
    const base = createBaseState();
    const map = makeMap(base.map, { warps: [{ x: 4, y: 2, elevation: 0, destMap: 'ROUTE_1', destWarpId: 0 }] });
    const state = placePlayer(withState(base, { map, npcs: [] }), 1, 2, 'right');
    const session = fakeSessionForState(state, 4, (input) => {
      fakeSessionForState(state).step(input);
      if (state.player.currentTile?.x === 2) {
        state.battle.active = true;
        state.battle.mode = 'wild';
      }
    });
    const option = new ActionEnumerator().enumerate(session).find((candidate) => candidate.label === 'Exit to Route 1');

    const result = new ActionExecutor().execute(session, option!.id, 4);

    expect(result.body.snapshot.mode).toBe('battle');
    expect(state.player.currentTile).toEqual(vec2(2, 2));
  });

  it('reports obstacle disabled reasons with required moves, badges, and items', () => {
    const base = createBaseState();
    const tree = makeNpc({ id: 'tree', graphicsId: 'OBJ_EVENT_GFX_CUT_TREE', currentTile: vec2(2, 1), position: vec2(2 * 16, 16) });
    const boulder = makeNpc({ id: 'boulder', graphicsId: 'OBJ_EVENT_GFX_PUSHABLE_BOULDER', currentTile: vec2(2, 1), position: vec2(2 * 16, 16) });
    const rock = makeNpc({ id: 'rock', graphicsId: 'OBJ_EVENT_GFX_ROCK_SMASH_ROCK', currentTile: vec2(2, 1), position: vec2(2 * 16, 16) });
    const waterMap = setBehavior(makeMap(base.map), 2, 1, 0x10);

    const cut = enumerate(placePlayer(withState(base, { map: makeMap(base.map), npcs: [tree] }), 1, 1, 'right')).find((option) => option.action.type === 'use-cut');
    const strength = enumerate(placePlayer(withState(base, { map: makeMap(base.map), npcs: [boulder] }), 1, 1, 'right')).find((option) => option.action.type === 'use-strength');
    const rockSmash = enumerate(placePlayer(withState(base, { map: makeMap(base.map), npcs: [rock] }), 1, 1, 'right')).find((option) => option.action.type === 'use-rock-smash');
    const surf = enumerate(placePlayer(withState(base, { map: waterMap, npcs: [] }), 1, 1, 'right')).find((option) => option.action.type === 'use-surf');
    const fish = enumerate(placePlayer(withState(base, { map: waterMap, npcs: [] }), 1, 1, 'right')).find((option) => option.action.type === 'fish');

    expect(cut?.disabledReason).toContain('HM01 Cut');
    expect(strength?.disabledReason).toContain('HM04 Strength');
    expect(rockSmash?.disabledReason).toContain('HM06 Rock Smash');
    expect(surf?.disabledReason).toContain('HM03 Surf');
    expect(fish?.disabledReason).toContain('fishing rod item');
  });
});
