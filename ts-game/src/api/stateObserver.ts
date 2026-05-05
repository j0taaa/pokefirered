import type { GameRuntimeState, GameSession } from '../core/gameSession';
import { getCollisionTilePosition } from '../world/tileMap';
import type { TextApiJsonValue, TextApiMode, TextApiSnapshot } from './textApiTypes';
import { DescriptionBuilder } from './descriptionBuilder';
import { ActionEnumerator } from './actionEnumerator';

export interface StateObserverOptions {
  readonly debug?: boolean;
}

type VersionedGameSession = GameSession & { readonly version?: number };

const hasResolvedBattleResult = (state: GameRuntimeState): boolean =>
  !state.battle.active && state.battle.postResult.outcome !== 'none';

const hasTransitionState = (state: GameRuntimeState): boolean =>
  state.scriptRuntime.pendingScriptWarp !== null
  || state.scriptRuntime.dynamicWarp !== null
  || state.scriptRuntime.doorAnimationTask.active
  || state.scriptRuntime.fieldPaletteFade.active
  || state.scriptRuntime.fieldEffects.fallWarpCount > 0;

const hasSaveLoadState = (state: GameRuntimeState): boolean =>
  state.startMenu.panel?.kind === 'save'
  || (state.scriptRuntime.lastScriptId?.startsWith('save.') ?? false)
  || (state.scriptRuntime.lastScriptId?.startsWith('menu.save.') ?? false);

const hasScriptLock = (state: GameRuntimeState): boolean =>
  state.dialogue.scriptSession !== null
  || state.scriptRuntime.eventObjectLock.task !== null
  || state.scriptRuntime.scriptMovement.tasks.some((task) => !task.destroyed)
  || state.scriptRuntime.fieldCamera !== null
  || state.scriptRuntime.fieldEffects.fishing !== null;

export const determineTextApiMode = (state: GameRuntimeState): TextApiMode => {
  if (hasResolvedBattleResult(state)) {
    return 'resolvedBattle';
  }
  if (state.battle.active) {
    return 'battle';
  }
  if (state.activeTrainerSee) {
    return 'trainerSee';
  }
  if (state.activeFieldAction) {
    return 'fieldAction';
  }
  if (hasTransitionState(state)) {
    return 'transition';
  }
  if (hasSaveLoadState(state)) {
    return 'saveLoad';
  }
  if (state.startMenu.active || state.startMenu.panel) {
    return 'menu';
  }
  if (state.dialogue.active) {
    return 'dialogue';
  }
  if (hasScriptLock(state)) {
    return 'script';
  }
  return 'overworld';
};

const buildDebugMetadata = (state: GameRuntimeState, mode: TextApiMode): TextApiJsonValue => {
  const playerTile = getCollisionTilePosition(state.player.position, state.map.tileSize);
  return {
    mapId: state.map.id,
    player: {
      x: playerTile.x,
      y: playerTile.y,
      facing: state.player.facing
    },
    internal: {
      mode,
      dialogueActive: state.dialogue.active,
      dialogueSpeakerId: state.dialogue.speakerId,
      scriptSessionActive: state.dialogue.scriptSession !== null,
      startMenuActive: state.startMenu.active,
      startMenuPanel: state.startMenu.panel?.kind ?? null,
      battleActive: state.battle.active,
      battlePhase: state.battle.phase,
      battleMode: state.battle.mode,
      activeFieldAction: state.activeFieldAction?.kind ?? null,
      activeTrainerSee: state.activeTrainerSee?.phase ?? null,
      lastScriptId: state.scriptRuntime.lastScriptId,
      pendingScriptWarp: state.scriptRuntime.pendingScriptWarp?.kind ?? null
    }
  };
};

export class StateObserver {
  constructor(
    private readonly descriptionBuilder = new DescriptionBuilder(),
    private readonly actionEnumerator = new ActionEnumerator()
  ) {}

  observe(session: GameSession, options: StateObserverOptions = {}): TextApiSnapshot {
    const state = session.getRuntimeState();
    const mode = determineTextApiMode(state);
    const snapshot: TextApiSnapshot = {
      mode,
      version: (session as VersionedGameSession).version ?? 0,
      summary: this.descriptionBuilder.buildSummary(session),
      details: this.descriptionBuilder.buildDetails(session),
      options: this.actionEnumerator.enumerate(session)
    };

    if (options.debug === true) {
      return {
        ...snapshot,
        debug: buildDebugMetadata(state, mode)
      };
    }

    return snapshot;
  }
}
