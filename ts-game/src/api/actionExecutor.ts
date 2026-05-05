import type { GameSession } from '../core/gameSession';
import type { InputSnapshot } from '../input/inputState';
import { ActionEnumerator } from './actionEnumerator';
import { StateObserver } from './stateObserver';
import type { TextApiAction, TextApiActionResult, TextApiError, TextApiOption } from './textApiTypes';

export interface ActionResult {
  readonly status: 200 | 400 | 409;
  readonly body: TextApiActionResult;
}

type VersionedGameSession = GameSession & { version?: number };

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

const versionOf = (session: GameSession): number => (session as VersionedGameSession).version ?? 0;

const setVersion = (session: GameSession, version: number): void => {
  (session as VersionedGameSession).version = version;
};

const numericValue = (action: TextApiAction): number | null =>
  typeof action.value === 'number' && Number.isInteger(action.value) ? action.value : null;

const textApiError = (code: string, message: string, details?: TextApiError['details']): TextApiError =>
  details === undefined ? { code, message } : { code, message, details };

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
        session.stepFrames([], 1);
        return;
      case 'move':
        this.stepMove(session, action.target);
        return;
      case 'interact':
      case 'continue':
        this.stepInteract(session);
        return;
      case 'openMenu':
        session.step(withInput({ start: true, startPressed: true }));
        return;
      case 'back':
      case 'cancel':
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
      default:
        this.stepInteract(session);
    }
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

  private stepInteract(session: GameSession): void {
    session.step(withInput({ interact: true, interactPressed: true }));
  }

  private stepCancel(session: GameSession): void {
    session.step(withInput({ cancel: true, cancelPressed: true }));
  }
}
