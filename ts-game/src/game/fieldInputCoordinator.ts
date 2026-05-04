import type { BattleState } from './battle';
import { isBattleBlockingWorld } from './battle';
import type { DialogueState } from './interaction';
import { isStartMenuBlockingWorld, type StartMenuState } from './menu';
import {
  canProcessFieldInteractionInput,
  canProcessPlayerMovementInput,
  canProcessStartMenuInput,
  hasPendingForcedMovement,
  type PlayerState
} from './player';
import type { TileMap } from '../world/tileMap';

export interface FieldInputCoordinatorState {
  fieldControlsLocked: boolean;
  pendingForcedMovement: boolean;
  canProcessStartMenu: boolean;
  canProcessInteraction: boolean;
  canProcessMovement: boolean;
  canContinuePlayerMovement: boolean;
  canStepActiveFieldAction: boolean;
}

export const resolveFieldInputState = (
  player: PlayerState,
  map: TileMap,
  dialogue: DialogueState,
  startMenu: StartMenuState,
  battle: BattleState,
  fieldControlsLocked: boolean,
  hasActiveFieldAction: boolean
): FieldInputCoordinatorState => {
  const pendingForcedMovement = hasPendingForcedMovement(player, map);
  const inputGateContext = {
    fieldControlsLocked,
    pendingForcedMovement,
    dialogueActive: dialogue.active,
    scriptSessionActive: dialogue.scriptSession !== null,
    startMenuBlocking: isStartMenuBlockingWorld(startMenu),
    battleBlocking: isBattleBlockingWorld(battle)
  };

  return {
    fieldControlsLocked,
    pendingForcedMovement,
    canProcessStartMenu: canProcessStartMenuInput(player, inputGateContext),
    canProcessInteraction: canProcessFieldInteractionInput(player, inputGateContext),
    canProcessMovement: canProcessPlayerMovementInput(player, inputGateContext),
    canContinuePlayerMovement: player.stepTarget !== undefined,
    canStepActiveFieldAction: hasActiveFieldAction
      && !dialogue.scriptSession
      && !dialogue.active
      && !isStartMenuBlockingWorld(startMenu)
      && !isBattleBlockingWorld(battle)
  };
};
