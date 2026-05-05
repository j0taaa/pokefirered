import { describe, expect, it } from 'vitest';
import { ActionEnumerator } from '../src/api/actionEnumerator';
import { ActionExecutor } from '../src/api/actionExecutor';
import { SessionManager } from '../src/api/sessionManager';
import type { TextApiMode, TextApiOption } from '../src/api/textApiTypes';
import type { GameRuntimeState, GameSession } from '../src/core/gameSession';

const RAW_CONTROL_PATTERN = /(^|[^a-z0-9])(a|b|start|select|up|down|left|right|button|key)(?=$|[^a-z0-9])/iu;

const createSession = () => {
  const manager = new SessionManager({ createId: () => `action-test-${Math.random().toString(16).slice(2)}` });
  const session = manager.createSession();
  (session.gameSession as typeof session.gameSession & { version: number }).version = session.version;
  return { manager, session };
};

const withState = (base: GameRuntimeState, override: Partial<GameRuntimeState>): GameRuntimeState => ({ ...base, ...override });

const fakeSessionForState = (state: GameRuntimeState, version = 7): GameSession => ({
  version,
  step: () => undefined,
  stepFrames: () => undefined,
  getRuntimeState: () => state,
  getRenderableState: () => { throw new Error('not needed'); },
  exportSaveBlob: () => { throw new Error('not needed'); },
  importSaveBlob: () => undefined,
  cleanup: () => undefined
} as unknown as GameSession);

const optionStrings = (option: TextApiOption): string[] => {
  const strings: string[] = [option.id, option.label, option.description, option.category, option.action.type];
  if (option.disabledReason) {
    strings.push(option.disabledReason);
  }
  if (option.action.target) {
    strings.push(option.action.target);
  }
  if (typeof option.action.value === 'string') {
    strings.push(option.action.value);
  }
  return strings;
};

describe('Text API semantic actions', () => {
  it('executes a valid semantic action and advances the version', () => {
    const { manager, session } = createSession();
    const enumerator = new ActionEnumerator();
    const executor = new ActionExecutor();
    const action = enumerator.enumerate(session.gameSession).find((option) => option.enabled);

    expect(action).toBeDefined();
    const result = executor.execute(session.gameSession, action!.id, session.version);

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.newVersion).toBe(session.version + 1);
    expect(result.body.snapshot.version).toBe(session.version + 1);

    manager.deleteSession(session.id);
  });

  it('rejects stale actions without advancing the version', () => {
    const { manager, session } = createSession();
    const action = new ActionEnumerator().enumerate(session.gameSession)[0];

    const result = new ActionExecutor().execute(session.gameSession, action.id, session.version - 1);

    expect(result.status).toBe(409);
    expect(result.body.success).toBe(false);
    expect(result.body.newVersion).toBe(session.version);
    expect(result.body.error).toEqual(expect.objectContaining({ code: 'stale_action' }));

    manager.deleteSession(session.id);
  });

  it('rejects action identifiers that are not in the current snapshot', () => {
    const { manager, session } = createSession();

    const result = new ActionExecutor().execute(session.gameSession, 'v1:overworld:missing', session.version);

    expect(result.status).toBe(400);
    expect(result.body.success).toBe(false);
    expect(result.body.error).toEqual(expect.objectContaining({ code: 'invalid_action' }));

    manager.deleteSession(session.id);
  });

  it('rejects disabled actions with a clear semantic reason', () => {
    const { manager, session } = createSession();
    const base = session.gameSession.getRuntimeState();
    const battleState = withState(base, {
      battle: {
        ...base.battle,
        active: true,
        phase: 'command',
        mode: 'trainer',
        battleTypeFlags: ['trainer'],
        commands: ['fight', 'bag', 'pokemon', 'run']
      }
    });
    const fakeSession = fakeSessionForState(battleState, 9);
    const flee = new ActionEnumerator().enumerate(fakeSession).find((option) => option.action.type === 'flee');

    expect(flee).toEqual(expect.objectContaining({ enabled: false, disabledReason: expect.stringContaining('trainer battle') }));
    const result = new ActionExecutor().execute(fakeSession, flee!.id, 9);

    expect(result.status).toBe(400);
    expect(result.body.error).toEqual(expect.objectContaining({ code: 'disabled_action', message: expect.stringContaining('trainer battle') }));

    manager.deleteSession(session.id);
  });

  it('does not expose raw controls in semantic options', () => {
    const { manager, session } = createSession();
    const base = session.gameSession.getRuntimeState();
    const modes: Record<TextApiMode, GameRuntimeState> = {
      overworld: base,
      dialogue: withState(base, {
        dialogue: {
          ...base.dialogue,
          active: true,
          choice: {
            kind: 'multichoice',
            options: ['A', 'B', 'START'],
            selectedIndex: 0,
            columns: 1,
            tilemapLeft: 0,
            tilemapTop: 0,
            ignoreCancel: false,
            cancelValue: 127,
            wrapAround: false
          }
        }
      }),
      menu: withState(base, {
        startMenu: { ...base.startMenu, active: true, options: [{ id: 'BAG', label: 'BAG' }], selectedIndex: 0 }
      }),
      battle: withState(base, {
        battle: { ...base.battle, active: true, phase: 'command', commands: ['fight', 'bag', 'pokemon', 'run'] }
      }),
      transition: withState(base, {
        scriptRuntime: { ...base.scriptRuntime, pendingScriptWarp: { mapId: base.map.id, warpId: 0, x: 1, y: 1, kind: 'warp' } }
      }),
      fieldAction: withState(base, {
        activeFieldAction: {
          kind: 'ledgeJump',
          direction: 'down',
          collision: { result: 'ledgeJump' } as NonNullable<GameRuntimeState['activeFieldAction']>['collision'],
          elapsedSeconds: 0,
          durationSeconds: 1,
          playerStartPosition: { x: 0, y: 0 },
          playerEndPosition: { x: 0, y: 16 }
        }
      }),
      trainerSee: withState(base, {
        activeTrainerSee: { trainerId: 'trainer-1', phase: 'exclamation', direction: 'down', approachDistance: 2, remainingExclamationFrames: 8 }
      }),
      script: withState(base, {
        scriptRuntime: { ...base.scriptRuntime, eventObjectLock: { ...base.scriptRuntime.eventObjectLock, task: { kind: 'waitPlayer', playerFinished: false, selectedFinished: false } } }
      }),
      saveLoad: withState(base, {
        startMenu: {
          ...base.startMenu,
          panel: {
            kind: 'save',
            id: 'SAVE',
            title: 'SAVE',
            stage: 'ask',
            prompt: 'Would you like to save the game?',
            description: 'Would you like to save the game?',
            statsRows: [],
            selectedIndex: 0,
            returnToMenuOnClose: true
          }
        }
      }),
      resolvedBattle: withState(base, {
        battle: { ...base.battle, active: false, postResult: { ...base.battle.postResult, outcome: 'won' } }
      })
    };

    const enumerator = new ActionEnumerator();
    for (const state of Object.values(modes)) {
      const options = enumerator.enumerate(fakeSessionForState(state));
      expect(options.length).toBeGreaterThan(0);
      for (const text of options.flatMap(optionStrings)) {
        expect(text, `raw control leaked in ${text}`).not.toMatch(RAW_CONTROL_PATTERN);
      }
    }

    manager.deleteSession(session.id);
  });
});
