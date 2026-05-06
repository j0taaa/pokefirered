import type { GameSession } from '../core/gameSession';
import { getBattleBagChoices } from '../game/battle';
import { evaluateFieldCollision, getDirectionVector } from '../game/fieldCollision';
import { fieldUseFuncRod, getFishingRodSecondaryId } from '../game/decompFishing';
import { getNpcRuntimeObject, isNpcVisible } from '../game/npc';
import { getPlayerRuntimeObject } from '../game/player';
import type { InputSnapshot } from '../input/inputState';
import { loadMapById } from '../world/mapSource';
import { getCollisionTilePosition, type TileDirection } from '../world/tileMap';
import { ActionEnumerator } from './actionEnumerator';
import { determineTextApiMode, StateObserver } from './stateObserver';
import type { TextApiAction, TextApiActionResult, TextApiError, TextApiOption } from './textApiTypes';

export interface ActionResult {
  readonly status: 200 | 400 | 409;
  readonly body: TextApiActionResult;
}

type VersionedGameSession = GameSession & { version?: number };
type NavigationTargetKind = 'tile' | 'connection' | 'door' | 'warp' | 'npc' | 'sign';
type ApiDirection = 'north' | 'south' | 'west' | 'east';

interface NavigationTargetValue {
  readonly mapId: string;
  readonly x: number;
  readonly y: number;
  readonly kind: NavigationTargetKind;
  readonly finalFacing?: ApiDirection;
}

interface PathStep {
  readonly direction: TileDirection;
  readonly x: number;
  readonly y: number;
}

const neutralInput = (): InputSnapshot => ({
  up: false,
  down: false,
  left: false,
  right: false,
  upPressed: false,
  downPressed: false,
  leftPressed: false,
  rightPressed: false,
  run: false,
  interact: false,
  interactPressed: false,
  start: false,
  startPressed: false,
  cancel: false,
  cancelPressed: false,
  select: false,
  selectPressed: false
});

const withInput = (partial: Partial<InputSnapshot>): InputSnapshot => ({ ...neutralInput(), ...partial });

const DIRECTION_INPUT: Record<TileDirection, Partial<InputSnapshot>> = {
  up: { up: true, upPressed: true },
  down: { down: true, downPressed: true },
  left: { left: true, leftPressed: true },
  right: { right: true, rightPressed: true }
};

const API_TO_TILE_DIRECTION: Record<ApiDirection, TileDirection> = {
  north: 'up',
  south: 'down',
  west: 'left',
  east: 'right'
};

const versionOf = (session: GameSession): number => (session as VersionedGameSession).version ?? 0;

const setVersion = (session: GameSession, version: number): void => {
  (session as VersionedGameSession).version = version;
};

const numericValue = (action: TextApiAction): number | null =>
  typeof action.value === 'number' && Number.isInteger(action.value) ? action.value : null;

const textApiError = (code: string, message: string, details?: TextApiError['details']): TextApiError =>
  details === undefined ? { code, message } : { code, message, details };

const isNavigationTargetValue = (value: unknown): value is NavigationTargetValue => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<NavigationTargetValue>;
  return typeof candidate.mapId === 'string'
    && typeof candidate.x === 'number'
    && Number.isInteger(candidate.x)
    && typeof candidate.y === 'number'
    && Number.isInteger(candidate.y)
    && (candidate.kind === 'tile' || candidate.kind === 'connection' || candidate.kind === 'door' || candidate.kind === 'warp' || candidate.kind === 'npc' || candidate.kind === 'sign')
    && (candidate.finalFacing === undefined || candidate.finalFacing === 'north' || candidate.finalFacing === 'south' || candidate.finalFacing === 'west' || candidate.finalFacing === 'east');
};

export class ActionExecutor {
  constructor(
    private readonly actionEnumerator = new ActionEnumerator(),
    private readonly stateObserver = new StateObserver()
  ) {}

  execute(session: GameSession, actionId: string, clientVersion: number): ActionResult {
    const currentVersion = versionOf(session);
    if (clientVersion !== currentVersion) {
      return this.error(session, 409, 'stale_action', 'Action version does not match the current session version.');
    }

    const option = this.actionEnumerator.enumerate(session).find((candidate) => candidate.id === actionId);
    if (!option) {
      return this.error(session, 400, 'invalid_action', 'Action is not available for the current snapshot.');
    }

    if (!option.enabled) {
      return this.error(
        session,
        400,
        'disabled_action',
        option.disabledReason ?? 'This option is not available right now.',
        { actionId, label: option.label }
      );
    }

    this.dispatch(session, option);
    const newVersion = currentVersion + 1;
    setVersion(session, newVersion);

    return {
      status: 200,
      body: {
        success: true,
        newVersion,
        snapshot: this.stateObserver.observe(session)
      }
    };
  }

  private error(
    session: GameSession,
    status: 400 | 409,
    code: string,
    message: string,
    details?: TextApiError['details']
  ): ActionResult {
    return {
      status,
      body: {
        success: false,
        newVersion: versionOf(session),
        snapshot: this.stateObserver.observe(session),
        error: textApiError(code, message, details)
      }
    };
  }

  private dispatch(session: GameSession, option: TextApiOption): void {
    const { action } = option;
    switch (action.type) {
      case 'wait':
        session.stepFrames([], 30);
        return;
      case 'move':
        this.stepMove(session, action.target);
        return;
      case 'use-cut':
      case 'use-strength':
      case 'use-rock-smash':
      case 'interact':
      case 'continue':
      case 'read-sign':
      case 'inspect-object':
      case 'pick-up-item':
      case 'choose-starter':
        this.stepInteract(session);
        return;
      case 'dialogue-continue':
        this.stepDialogueContinue(session);
        return;
      case 'use-surf':
      case 'use-waterfall':
        this.stepFieldMovePrompt(session);
        return;
      case 'fish':
        this.stepFishing(session, action.value);
        return;
      case 'openMenu':
        session.step(withInput({ start: true, startPressed: true }));
        return;
      case 'bagPocket': {
        const targetIndex = numericValue(action);
        this.choosePocket(session, targetIndex ?? 0);
        return;
      }
      case 'optionAdjust': {
        const targetIndex = numericValue(action);
        this.chooseIndexThenAdjust(session, targetIndex ?? 0, this.currentSelectionIndex(session, action.target));
        return;
      }
      case 'back':
      case 'cancel':
      case 'dialogue-cancel':
        this.stepCancel(session);
        return;
      case 'confirm':
        this.chooseIndexThenConfirm(session, 0, this.currentSelectionIndex(session, action.target));
        return;
      case 'choose': {
        const targetIndex = numericValue(action);
        if (targetIndex === null) {
          this.stepInteract(session);
          return;
        }
        this.chooseIndexThenConfirm(session, targetIndex, this.currentSelectionIndex(session, action.target));
        return;
      }
      case 'fight':
      case 'bag':
      case 'pokemon':
      case 'flee':
      case 'safariBall':
      case 'safariBait':
      case 'safariRock': {
        const targetIndex = numericValue(action);
        this.chooseIndexThenConfirm(session, targetIndex ?? 0, session.getRuntimeState().battle.selectedCommandIndex);
        return;
      }
      case 'battleMove': {
        const targetIndex = numericValue(action);
        this.chooseIndexThenConfirm(session, targetIndex ?? 0, session.getRuntimeState().battle.selectedMoveIndex);
        return;
      }
      case 'battleBagItem': {
        const targetIndex = this.battleBagTargetIndex(session, action.value);
        this.chooseIndexThenConfirm(session, targetIndex, session.getRuntimeState().battle.selectedBagIndex);
        return;
      }
      case 'battlePartySwitch':
      case 'battleViewParty': {
        const targetIndex = numericValue(action);
        this.chooseIndexThenConfirm(session, targetIndex ?? 0, session.getRuntimeState().battle.selectedPartyIndex);
        return;
      }
      case 'battleShift': {
        const targetIndex = numericValue(action);
        this.chooseIndexThenConfirm(session, targetIndex ?? 0, session.getRuntimeState().battle.selectedShiftPromptIndex);
        return;
      }
      case 'battleCancel':
        this.stepCancel(session);
        return;
      case 'battleContinue':
        this.stepInteract(session);
        return;
      default:
        if (action.type.startsWith('navigate-to-')) {
          this.autopilot(session, action.value, action.target);
          return;
        }
        if (action.type.startsWith('dialogue-choice-')) {
          const targetIndex = numericValue(action);
          this.chooseIndexThenConfirm(session, targetIndex ?? 0, this.currentSelectionIndex(session, 'dialogue'));
          return;
        }
        if (action.type.startsWith('talk-to-')) {
          this.stepInteract(session);
          return;
        }
        this.stepInteract(session);
    }
  }

  private battleBagTargetIndex(session: GameSession, value: unknown): number {
    const state = session.getRuntimeState();
    const choices = getBattleBagChoices(state.battle, state.scriptRuntime.bag);
    if (typeof value === 'string') {
      const index = choices.findIndex((choice) => choice.itemId === value);
      return index >= 0 ? index : state.battle.selectedBagIndex;
    }
    if (typeof value === 'number' && Number.isInteger(value)) {
      return value;
    }
    return state.battle.selectedBagIndex;
  }

  private currentSelectionIndex(session: GameSession, target: string | undefined): number {
    const state = session.getRuntimeState();
    if (target === 'dialogue') {
      return state.dialogue.choice?.selectedIndex ?? 0;
    }
    if (target === 'menu') {
      return state.startMenu.selectedIndex;
    }
    if (target === 'panel') {
      const panel = state.startMenu.panel;
      if (panel && 'selectedIndex' in panel && typeof panel.selectedIndex === 'number') {
        return panel.selectedIndex;
      }
      if (panel?.kind === 'pokedex') {
        return panel.screen === 'topMenu' ? panel.topMenuSelectedIndex : panel.orderSelectedIndex;
      }
    }
    if (target === 'bagItem') {
      const bag = state.scriptRuntime.bag;
      return bag.selectedIndexByPocket[bag.selectedPocket] ?? 0;
    }
    if (target === 'bagContext') {
      const panel = state.startMenu.panel;
      return panel?.kind === 'bag' ? panel.contextMenu?.selectedIndex ?? 0 : 0;
    }
    if (target === 'bagConfirm') {
      const panel = state.startMenu.panel;
      return panel?.kind === 'bag' ? panel.confirmationPrompt?.selectedIndex ?? 0 : 0;
    }
    if (target === 'partyAction') {
      const panel = state.startMenu.panel;
      return panel?.kind === 'party' ? panel.actionIndex : 0;
    }
    if (target === 'shop') {
      return state.dialogue.shop?.selectedIndex ?? 0;
    }
    if (target === 'saveLoad') {
      const panel = state.startMenu.panel;
      return panel?.kind === 'save' ? panel.selectedIndex : 0;
    }
    return 0;
  }

  private chooseIndexThenConfirm(session: GameSession, targetIndex: number, currentIndex: number): void {
    const distance = Math.max(0, targetIndex - currentIndex);
    for (let index = 0; index < distance; index += 1) {
      session.step(withInput({ down: true, downPressed: true }));
    }

    const reverseDistance = Math.max(0, currentIndex - targetIndex);
    for (let index = 0; index < reverseDistance; index += 1) {
      session.step(withInput({ up: true, upPressed: true }));
    }

    this.stepInteract(session);
  }

  private chooseIndexThenAdjust(session: GameSession, targetIndex: number, currentIndex: number): void {
    const distance = Math.max(0, targetIndex - currentIndex);
    for (let index = 0; index < distance; index += 1) {
      session.step(withInput({ down: true, downPressed: true }));
    }

    const reverseDistance = Math.max(0, currentIndex - targetIndex);
    for (let index = 0; index < reverseDistance; index += 1) {
      session.step(withInput({ up: true, upPressed: true }));
    }

    session.step(withInput({ right: true, rightPressed: true }));
  }

  private choosePocket(session: GameSession, targetIndex: number): void {
    const order = ['items', 'keyItems', 'pokeBalls', 'tmCase', 'berryPouch'];
    const currentPocket = session.getRuntimeState().scriptRuntime.bag.selectedPocket;
    const currentIndex = Math.max(0, order.indexOf(currentPocket));
    const clampedTarget = Math.max(0, Math.min(order.length - 1, targetIndex));
    const distance = clampedTarget - currentIndex;
    const input = distance > 0
      ? { right: true, rightPressed: true }
      : { left: true, leftPressed: true };
    for (let index = 0; index < Math.abs(distance); index += 1) {
      session.step(withInput(input));
    }
  }

  private stepMove(session: GameSession, direction: string | undefined): void {
    switch (direction) {
      case 'north':
        session.step(withInput({ up: true, upPressed: true }));
        return;
      case 'south':
        session.step(withInput({ down: true, downPressed: true }));
        return;
      case 'west':
        session.step(withInput({ left: true, leftPressed: true }));
        return;
      case 'east':
        session.step(withInput({ right: true, rightPressed: true }));
        return;
      default:
        session.stepFrames([], 1);
    }
  }

  private autopilot(session: GameSession, rawTarget: unknown, destinationMapId?: string): void {
    if (!isNavigationTargetValue(rawTarget)) {
      this.stepInteract(session);
      return;
    }

    const connectionDirection = rawTarget.kind === 'connection'
      ? API_TO_TILE_DIRECTION[rawTarget.finalFacing ?? this.apiDirectionForConnectionTarget(session, rawTarget.x, rawTarget.y) ?? 'north']
      : null;
    const path = connectionDirection
      ? this.findPathToConnection(session, connectionDirection, destinationMapId) ?? this.findPath(session, rawTarget)
      : this.findPath(session, rawTarget);
    if (!path) {
      session.stepFrames([], 1);
      return;
    }

    for (const step of path) {
      if (!this.stepOneTile(session, step.direction, step.x, step.y)) {
        return;
      }
      if (determineTextApiMode(session.getRuntimeState()) !== 'overworld') {
        return;
      }
    }

    const finalFacing = rawTarget.finalFacing ? API_TO_TILE_DIRECTION[rawTarget.finalFacing] : undefined;
    if (finalFacing && session.getRuntimeState().player.facing !== finalFacing) {
      session.step(withInput(DIRECTION_INPUT[finalFacing]));
      if (determineTextApiMode(session.getRuntimeState()) !== 'overworld') {
        return;
      }
    }

    if (rawTarget.kind === 'door') {
      const direction = finalFacing ?? session.getRuntimeState().player.facing;
      const vector = getDirectionVector(direction);
      const doorX = rawTarget.x + vector.x;
      const doorY = rawTarget.y + vector.y;
      this.stepOneTile(session, direction, doorX, doorY);
      session.stepFrames([], 8);
      const warpSession = session as GameSession & {
        applyTextApiWarpTransition?: () => boolean;
        applyTextApiWarpTransitionAt?: (tileX: number, tileY: number) => boolean;
      };
      const appliedCurrentTileWarp = warpSession.applyTextApiWarpTransition?.() === true;
      if (!appliedCurrentTileWarp || session.getRuntimeState().map.id !== destinationMapId) {
        warpSession.applyTextApiWarpTransitionAt?.(doorX, doorY);
      }
    } else if (rawTarget.kind === 'warp') {
      const warpSession = session as GameSession & { applyTextApiWarpTransition?: () => boolean };
      warpSession.applyTextApiWarpTransition?.();
    } else if (rawTarget.kind === 'connection') {
      if (connectionDirection) {
        const connectionSession = session as GameSession & { applyTextApiConnectionTransition?: (direction: TileDirection) => boolean };
        connectionSession.applyTextApiConnectionTransition?.(connectionDirection);
      }
    }
  }

  private apiDirectionForConnectionTarget(session: GameSession, targetX: number, targetY: number): ApiDirection | null {
    const { map } = session.getRuntimeState();
    if (targetY === 0) return 'north';
    if (targetY === map.height - 1) return 'south';
    if (targetX === 0) return 'west';
    if (targetX === map.width - 1) return 'east';
    return null;
  }

  private findPathToConnection(session: GameSession, direction: TileDirection, destinationMapId: string | undefined): PathStep[] | null {
    const state = session.getRuntimeState();
    const start = state.player.currentTile ?? getCollisionTilePosition(state.player.position, state.map.tileSize);
    const queue: { readonly x: number; readonly y: number; readonly path: PathStep[] }[] = [{ x: start.x, y: start.y, path: [] }];
    const seen = new Set<string>([`${start.x},${start.y}`]);
    const maxVisited = Math.max(1, state.map.width * state.map.height);

    const reachesConnection = (x: number, y: number): boolean => {
      const collision = evaluateFieldCollision({
        map: state.map,
        object: {
          ...getPlayerRuntimeObject(state.player, state.map),
          currentTile: { x, y },
          previousTile: { x, y },
          initialTile: { x, y },
          currentElevation: state.player.currentElevation ?? 0,
          previousElevation: state.player.currentElevation ?? 0
        },
        direction,
        objects: state.npcs
          .filter((npc) => isNpcVisible(npc, state.scriptRuntime.flags))
          .map((npc) => getNpcRuntimeObject(npc, state.map)),
        loadMapById
      });
      return collision.result === 'none'
        && collision.target?.viaConnection === true
        && (!destinationMapId || collision.target.map.id === destinationMapId);
    };

    for (let index = 0; index < queue.length && seen.size <= maxVisited; index += 1) {
      const current = queue[index];
      if (reachesConnection(current.x, current.y)) {
        return current.path;
      }
      for (const nextDirection of ['up', 'down', 'left', 'right'] as const) {
        const vector = getDirectionVector(nextDirection);
        const nextX = current.x + vector.x;
        const nextY = current.y + vector.y;
        const key = `${nextX},${nextY}`;
        if (seen.has(key)) {
          continue;
        }
        const collision = evaluateFieldCollision({
          map: state.map,
          object: {
            ...getPlayerRuntimeObject(state.player, state.map),
            currentTile: { x: current.x, y: current.y },
            previousTile: { x: current.x, y: current.y },
            initialTile: { x: current.x, y: current.y },
            currentElevation: state.player.currentElevation ?? 0,
            previousElevation: state.player.currentElevation ?? 0
          },
          direction: nextDirection,
          objects: state.npcs
            .filter((npc) => isNpcVisible(npc, state.scriptRuntime.flags))
            .map((npc) => getNpcRuntimeObject(npc, state.map)),
          loadMapById
        });
        if (collision.result !== 'none' || !collision.movementTarget || collision.movementTarget.map.id !== state.map.id) {
          continue;
        }

        const nextStep = { direction: nextDirection, x: collision.movementTarget.tile.x, y: collision.movementTarget.tile.y };
        seen.add(key);
        queue.push({ x: nextStep.x, y: nextStep.y, path: [...current.path, nextStep] });
      }
    }

    return null;
  }

  private findPath(session: GameSession, target: NavigationTargetValue): PathStep[] | null {
    const state = session.getRuntimeState();
    if (state.map.id !== target.mapId) {
      return null;
    }

    const start = state.player.currentTile ?? getCollisionTilePosition(state.player.position, state.map.tileSize);
    if (start.x === target.x && start.y === target.y) {
      return [];
    }

    const queue: { readonly x: number; readonly y: number; readonly path: PathStep[] }[] = [{ x: start.x, y: start.y, path: [] }];
    const seen = new Set<string>([`${start.x},${start.y}`]);
    const maxVisited = Math.max(1, state.map.width * state.map.height);

    for (let index = 0; index < queue.length && seen.size <= maxVisited; index += 1) {
      const current = queue[index];
      for (const direction of ['up', 'down', 'left', 'right'] as const) {
        const vector = getDirectionVector(direction);
        const nextX = current.x + vector.x;
        const nextY = current.y + vector.y;
        const key = `${nextX},${nextY}`;
        if (seen.has(key)) {
          continue;
        }
        const collision = evaluateFieldCollision({
          map: state.map,
          object: {
            ...getPlayerRuntimeObject(state.player, state.map),
            currentTile: { x: current.x, y: current.y },
            previousTile: { x: current.x, y: current.y },
            initialTile: { x: current.x, y: current.y },
            currentElevation: state.player.currentElevation ?? 0,
            previousElevation: state.player.currentElevation ?? 0
          },
          direction,
          objects: state.npcs
            .filter((npc) => isNpcVisible(npc, state.scriptRuntime.flags))
            .map((npc) => getNpcRuntimeObject(npc, state.map)),
          loadMapById
        });
        if (collision.result !== 'none' || !collision.movementTarget || collision.movementTarget.map.id !== state.map.id) {
          continue;
        }

        const nextStep = { direction, x: collision.movementTarget.tile.x, y: collision.movementTarget.tile.y };
        const nextPath = [...current.path, nextStep];
        if (nextStep.x === target.x && nextStep.y === target.y) {
          return nextPath;
        }
        seen.add(key);
        queue.push({ x: nextStep.x, y: nextStep.y, path: nextPath });
      }
    }

    return null;
  }

  private stepOneTile(session: GameSession, direction: TileDirection, expectedX: number, expectedY: number): boolean {
    const before = session.getRuntimeState();
    const startMapId = before.map.id;
    const startTile = before.player.currentTile ?? getCollisionTilePosition(before.player.position, before.map.tileSize);

    for (let frame = 0; frame < 48; frame += 1) {
      const state = session.getRuntimeState();
      if (state.map.id !== startMapId) {
        return false;
      }
      if (determineTextApiMode(state) !== 'overworld') {
        return false;
      }
      session.step(withInput(frame === 0 ? DIRECTION_INPUT[direction] : { ...DIRECTION_INPUT[direction], upPressed: false, downPressed: false, leftPressed: false, rightPressed: false }));
      const next = session.getRuntimeState();
      if (next.map.id !== startMapId || determineTextApiMode(next) !== 'overworld') {
        return false;
      }
      const tile = next.player.currentTile ?? getCollisionTilePosition(next.player.position, next.map.tileSize);
      if (tile.x === expectedX && tile.y === expectedY && !next.player.moving && !next.player.stepTarget) {
        return true;
      }
      if (!next.player.moving && !next.player.stepTarget && tile.x === startTile.x && tile.y === startTile.y && frame > 1) {
        return false;
      }
    }
    return false;
  }

  private stepInteract(session: GameSession): void {
    session.step(withInput({ interact: true, interactPressed: true }));
  }

  private stepDialogueContinue(session: GameSession): void {
    session.stepFrames([withInput({ interact: true, interactPressed: true })], 30);
  }

  private stepFieldMovePrompt(session: GameSession): void {
    this.stepInteract(session);
    for (let frame = 0; frame < 12; frame += 1) {
      const choice = session.getRuntimeState().dialogue.choice;
      if (choice && choice.options.length > 0) {
        this.chooseIndexThenConfirm(session, 0, choice.selectedIndex);
        return;
      }
      session.step(neutralInput());
    }
  }

  private stepFishing(session: GameSession, value: unknown): void {
    const rod = typeof value === 'string' ? getFishingRodSecondaryId(value) : null;
    if (rod === null) {
      this.stepInteract(session);
      return;
    }

    const state = session.getRuntimeState();
    fieldUseFuncRod(state.scriptRuntime, state.player, state.map, rod, state.dialogue);
  }

  private stepCancel(session: GameSession): void {
    session.step(withInput({ cancel: true, cancelPressed: true }));
  }
}
