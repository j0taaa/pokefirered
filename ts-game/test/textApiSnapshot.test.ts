import { describe, expect, it } from 'vitest';
import { SessionManager } from '../src/api/sessionManager';
import { StateObserver } from '../src/api/stateObserver';
import type { TextApiMode, TextApiSnapshot } from '../src/api/textApiTypes';
import type { GameRuntimeState, GameSession } from '../src/core/gameSession';

const observer = new StateObserver();

const createObservedSession = () => {
  const manager = new SessionManager({ createId: () => 'snapshot-test-session' });
  const session = manager.createSession();
  (session.gameSession as typeof session.gameSession & { version: number }).version = session.version;
  return { manager, session };
};

const snapshotForState = (state: GameRuntimeState, version = 7): TextApiSnapshot => {
  const fakeSession = {
    version,
    getRuntimeState: () => state
  } as unknown as GameSession;
  return observer.observe(fakeSession);
};

const withState = (
  base: GameRuntimeState,
  override: Partial<GameRuntimeState>
): GameRuntimeState => ({ ...base, ...override });

describe('Text API snapshots', () => {
  it('includes required public fields with semantic options', () => {
    const { manager, session } = createObservedSession();

    const snapshot = observer.observe(session.gameSession);

    expect(snapshot).toEqual(expect.objectContaining({
      mode: expect.any(String),
      version: 1,
      summary: expect.any(String),
      details: expect.any(String),
      options: expect.any(Array)
    }));
    expect(snapshot.options.length).toBeGreaterThan(0);
    expect(snapshot.options[0]).toEqual(expect.objectContaining({
      id: expect.any(String),
      label: expect.any(String),
      description: expect.any(String),
      category: expect.any(String),
      enabled: expect.any(Boolean),
      action: expect.objectContaining({ type: expect.any(String) })
    }));
    expect(snapshot.summary.length).toBeGreaterThan(0);
    expect(snapshot.details.length).toBeGreaterThan(snapshot.summary.length);

    manager.deleteSession(session.id);
  });

  it('omits debug metadata by default and includes it only when requested', () => {
    const { manager, session } = createObservedSession();

    const normalSnapshot = observer.observe(session.gameSession);
    const debugSnapshot = observer.observe(session.gameSession, { debug: true });

    expect(normalSnapshot.debug).toBeUndefined();
    expect(debugSnapshot.debug).toEqual(expect.objectContaining({
      mapId: expect.any(String),
      player: expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
        facing: expect.any(String)
      }),
      internal: expect.any(Object)
    }));

    manager.deleteSession(session.id);
  });

  it('keeps summary text concise and details expanded', () => {
    const { manager, session } = createObservedSession();

    const snapshot = observer.observe(session.gameSession);

    expect(snapshot.summary.length).toBeLessThanOrEqual(80);
    expect(snapshot.details.length).toBeGreaterThan(snapshot.summary.length);

    manager.deleteSession(session.id);
  });

  it('detects each supported game mode from runtime state', () => {
    const { manager, session } = createObservedSession();
    const base = session.gameSession.getRuntimeState();

    const modeStates: Record<TextApiMode, GameRuntimeState> = {
      overworld: base,
      dialogue: withState(base, {
        dialogue: { ...base.dialogue, active: true, speakerId: 'npc-1', text: 'Hello there!', queue: ['Hello there!'], queueIndex: 0 }
      }),
      menu: withState(base, {
        startMenu: { ...base.startMenu, active: true, options: [{ id: 'BAG', label: 'BAG' }], selectedIndex: 0 }
      }),
      battle: withState(base, {
        battle: { ...base.battle, active: true, phase: 'command' }
      }),
      transition: withState(base, {
        scriptRuntime: {
          ...base.scriptRuntime,
          pendingScriptWarp: { mapId: base.map.id, warpId: 0, x: 1, y: 1, kind: 'warp' }
        }
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
        activeTrainerSee: {
          trainerId: 'trainer-1',
          phase: 'exclamation',
          direction: 'down',
          approachDistance: 2,
          remainingExclamationFrames: 8
        }
      }),
      script: withState(base, {
        scriptRuntime: {
          ...base.scriptRuntime,
          eventObjectLock: { ...base.scriptRuntime.eventObjectLock, task: { kind: 'waitPlayer', playerFinished: false, selectedFinished: false } }
        }
      }),
      saveLoad: withState(base, {
        scriptRuntime: { ...base.scriptRuntime, lastScriptId: 'save.load.success.0' }
      }),
      resolvedBattle: withState(base, {
        battle: { ...base.battle, active: false, postResult: { ...base.battle.postResult, outcome: 'won' } }
      })
    };

    for (const [mode, state] of Object.entries(modeStates) as Array<[TextApiMode, GameRuntimeState]>) {
      expect(snapshotForState(state).mode).toBe(mode);
    }

    manager.deleteSession(session.id);
  });

  it('is deterministic for identical runtime state', () => {
    const { manager, session } = createObservedSession();

    const first = observer.observe(session.gameSession, { debug: true });
    const second = observer.observe(session.gameSession, { debug: true });

    expect(second).toEqual(first);

    manager.deleteSession(session.id);
  });
});
