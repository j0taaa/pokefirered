import { describe, expect, it } from 'vitest';
import { ActionEnumerator } from '../src/api/actionEnumerator';
import { ActionExecutor } from '../src/api/actionExecutor';
import { SessionManager } from '../src/api/sessionManager';
import type { TextApiOption } from '../src/api/textApiTypes';
import type { GameRuntimeState, GameSession } from '../src/core/gameSession';
import { vec2 } from '../src/core/vec2';
import type { InputSnapshot } from '../src/input/inputState';
import type { NpcState } from '../src/game/npc';
import type { TileMap } from '../src/world/tileMap';

const createBaseState = (): GameRuntimeState => {
  const manager = new SessionManager({ createId: () => `field-api-${Math.random().toString(16).slice(2)}` });
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
  width: 5,
  height: 5,
  walkable: Array.from({ length: 25 }, () => true),
  collisionValues: Array.from({ length: 25 }, () => 0),
  elevations: Array.from({ length: 25 }, () => 0),
  terrainTypes: Array.from({ length: 25 }, () => 0),
  tileBehaviors: Array.from({ length: 25 }, () => 0),
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
  id: 'npc-test',
  position: vec2(2 * 16, 1 * 16),
  path: [],
  pathIndex: 0,
  facing: 'down',
  moving: false,
  animationTime: 0,
  idleDurationSeconds: 0,
  idleTimeRemaining: 0,
  dialogueLines: ['Hello!'],
  dialogueIndex: 0,
  currentTile: vec2(2, 1),
  previousTile: vec2(2, 1),
  initialTile: vec2(2, 1),
  currentElevation: 0,
  previousElevation: 0,
  movementRangeX: 0,
  movementRangeY: 0,
  ...override
});

const fakeSessionForState = (
  state: GameRuntimeState,
  version = 4,
  onStep: (input: InputSnapshot) => void = () => undefined
): GameSession => ({
  version,
  step: (input: InputSnapshot) => onStep(input),
  stepFrames: () => undefined,
  getRuntimeState: () => state,
  getRenderableState: () => { throw new Error('not needed'); },
  exportSaveBlob: () => { throw new Error('not needed'); },
  importSaveBlob: () => undefined,
  cleanup: () => undefined
} as unknown as GameSession);

const findOption = (state: GameRuntimeState, predicate: (option: TextApiOption) => boolean): TextApiOption => {
  const option = new ActionEnumerator().enumerate(fakeSessionForState(state)).find(predicate);
  expect(option).toBeDefined();
  return option!;
};

describe('Text API field interactions', () => {
  it('talks to an NPC via a semantic API action', () => {
    const base = createBaseState();
    const map = makeMap(base.map);
    const npc = makeNpc({ id: 'npc-oak-aide', currentTile: vec2(2, 1), position: vec2(2 * 16, 1 * 16) });
    const state = placePlayer(withState(base, { map, npcs: [npc] }), 1, 1, 'right');
    const option = findOption(state, (candidate) => candidate.action.type === 'talk-to-npc-oak-aide');

    let pressedInteract = false;
    const result = new ActionExecutor().execute(fakeSessionForState(state, 4, (input) => {
      pressedInteract ||= input.interactPressed;
      if (input.interactPressed) {
        npc.facing = 'left';
        state.dialogue.active = true;
        state.dialogue.speakerId = npc.id;
      }
    }), option.id, 4);

    expect(result.status).toBe(200);
    expect(pressedInteract).toBe(true);
    expect(npc.facing).toBe('left');
    expect(state.dialogue.speakerId).toBe('npc-oak-aide');
  });

  it('reads signs through a semantic option', () => {
    const base = createBaseState();
    const map = setBehavior(makeMap(base.map), 2, 1, 0x84);
    const state = placePlayer(withState(base, { map, npcs: [] }), 1, 1, 'right');
    const option = findOption(state, (candidate) => candidate.action.type === 'read-sign');

    let pressedInteract = false;
    const result = new ActionExecutor().execute(fakeSessionForState(state, 4, (input) => {
      pressedInteract ||= input.interactPressed;
    }), option.id, 4);

    expect(result.status).toBe(200);
    expect(option.label).toBe('Read sign');
    expect(pressedInteract).toBe(true);
  });

  it('picks up visible item balls through a semantic option', () => {
    const base = createBaseState();
    const map = makeMap(base.map);
    const itemBall = makeNpc({
      id: 'item-potion',
      graphicsId: 'OBJ_EVENT_GFX_ITEM_BALL',
      itemId: 'ITEM_POTION',
      flag: 'FLAG_ITEM_POTION',
      currentTile: vec2(2, 1),
      position: vec2(2 * 16, 1 * 16)
    });
    const state = placePlayer(withState(base, { map, npcs: [itemBall] }), 1, 1, 'right');
    const option = findOption(state, (candidate) => candidate.action.type === 'pick-up-item');

    new ActionExecutor().execute(fakeSessionForState(state, 4, (input) => {
      if (input.interactPressed && itemBall.flag) {
        state.scriptRuntime.flags.add(itemBall.flag);
      }
    }), option.id, 4);

    expect(option.label).toContain('POTION');
    expect(state.scriptRuntime.flags.has('FLAG_ITEM_POTION')).toBe(true);
  });

  it('only exposes hidden item discovery on the exact uncollected tile', () => {
    const base = createBaseState();
    const map = makeMap(base.map, {
      hiddenItems: [{ x: 2, y: 2, item: 'ITEM_POTION', quantity: 1, flag: 'FLAG_HIDDEN_POTION', underfoot: true }]
    });
    const away = placePlayer(withState(base, { map, npcs: [] }), 1, 2, 'right');
    expect(new ActionEnumerator().enumerate(fakeSessionForState(away)).some((option) => option.action.value === 'FLAG_HIDDEN_POTION')).toBe(false);

    const onTile = placePlayer(withState(base, { map, npcs: [] }), 2, 2, 'right');
    const hiddenOption = findOption(onTile, (candidate) => candidate.action.target === 'hiddenItem');
    expect(hiddenOption.label).toBe('Inspect hidden spot');
    expect(hiddenOption.description).not.toContain('Potion');

    onTile.scriptRuntime.flags.add('FLAG_HIDDEN_POTION');
    expect(new ActionEnumerator().enumerate(fakeSessionForState(onTile)).some((option) => option.action.target === 'hiddenItem')).toBe(false);
  });

  it('reports field move badge and move prerequisites', () => {
    const base = createBaseState();
    const map = setBehavior(makeMap(base.map), 2, 1, 0x10);
    const noMove = placePlayer(withState(base, { map, npcs: [] }), 1, 1, 'right');
    const surfWithoutMove = findOption(noMove, (candidate) => candidate.action.type === 'use-surf');
    expect(surfWithoutMove.enabled).toBe(false);
    expect(surfWithoutMove.disabledReason).toContain('knows Surf');

    const missingBadge = placePlayer(withState(base, {
      map,
      npcs: [],
      scriptRuntime: {
        ...base.scriptRuntime,
        party: [{ ...base.scriptRuntime.party[0], moves: ['SURF'] }],
        flags: new Set<string>()
      }
    }), 1, 1, 'right');
    const surfWithoutBadge = findOption(missingBadge, (candidate) => candidate.action.type === 'use-surf');
    expect(surfWithoutBadge.enabled).toBe(false);
    expect(surfWithoutBadge.disabledReason).toContain('Soul Badge');

    missingBadge.scriptRuntime.flags.add('FLAG_BADGE05_GET');
    const surfReady = findOption(missingBadge, (candidate) => candidate.action.type === 'use-surf');
    expect(surfReady.enabled).toBe(true);
  });

  it('round-trips dialogue choices through semantic API actions', () => {
    const base = createBaseState();
    const state = withState(base, {
      dialogue: {
        ...base.dialogue,
        active: true,
        choice: {
          kind: 'yesno',
          options: ['YES', 'NO'],
          selectedIndex: 0,
          columns: 1,
          tilemapLeft: 0,
          tilemapTop: 0,
          ignoreCancel: false,
          cancelValue: 127,
          wrapAround: false
        }
      }
    });
    const noOption = findOption(state, (candidate) => candidate.action.type === 'dialogue-choice-1');

    const result = new ActionExecutor().execute(fakeSessionForState(state, 4, (input) => {
      const choice = state.dialogue.choice!;
      if (input.downPressed) {
        choice.selectedIndex = 1;
      }
      if (input.interactPressed) {
        state.scriptRuntime.vars.VAR_RESULT = choice.selectedIndex === 0 ? 1 : 0;
        state.dialogue.active = false;
        state.dialogue.choice = null;
      }
    }), noOption.id, 4);

    expect(result.status).toBe(200);
    expect(state.scriptRuntime.vars.VAR_RESULT).toBe(0);
  });
});
