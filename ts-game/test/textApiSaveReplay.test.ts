import { describe, expect, it } from 'vitest';
import { ActionEnumerator } from '../src/api/actionEnumerator';
import { ActionExecutor } from '../src/api/actionExecutor';
import { SessionManager, type Session } from '../src/api/sessionManager';
import type { TextApiActionResult, TextApiJsonValue, TextApiSaveBlob } from '../src/api/textApiTypes';
import type { GameSession } from '../src/core/gameSession';

const createManager = (options: ConstructorParameters<typeof SessionManager>[0] = {}) => new SessionManager({
  createId: (() => {
    let index = 0;
    return () => `save-replay-${index += 1}`;
  })(),
  ...options
});

const envelopePayload = (blob: TextApiSaveBlob): Record<string, unknown> => {
  const data = blob.data as Record<string, unknown>;
  expect(data.format).toBe('pokefirered.ts.save');
  expect(data.payload).toEqual(expect.any(Object));
  return data.payload as Record<string, unknown>;
};

const publicRuntimeSummary = (session: Session) => {
  const state = session.gameSession.getRuntimeState();
  return {
    mapId: state.map.id,
    player: {
      x: state.player.position.x,
      y: state.player.position.y,
      facing: state.player.facing
    },
    flags: [...state.scriptRuntime.flags].sort(),
    consumedTriggerIds: [...state.scriptRuntime.consumedTriggerIds].sort()
  };
};

const executeFirstEnabledAction = (manager: SessionManager, session: Session): TextApiActionResult => {
  (session.gameSession as typeof session.gameSession & { version: number }).version = session.version;
  const action = new ActionEnumerator().enumerate(session.gameSession).find((option) => option.enabled);
  expect(action).toBeDefined();

  const requestVersion = session.version;
  const result = new ActionExecutor().execute(session.gameSession, action!.id, session.version);
  session.version = result.body.newVersion;
  manager.recordAction(session.id, requestVersion, action!.id, result.body.newVersion);

  expect(result.body.success).toBe(true);
  return result.body;
};

const replayTrace = (manager: SessionManager, session: Session, trace: readonly { readonly version: number; readonly actionId: string }[]): void => {
  for (const entry of trace) {
    (session.gameSession as typeof session.gameSession & { version: number }).version = session.version;
    const result = new ActionExecutor().execute(session.gameSession, entry.actionId, entry.version);
    session.version = result.body.newVersion;
    manager.recordAction(session.id, entry.version, entry.actionId, result.body.newVersion);
    expect(result.body.success).toBe(true);
  }
};

describe('Text API save blobs and replay traces', () => {
  it('exports portable save blob data', () => {
    const manager = createManager();
    const session = manager.createSession();

    const blob = manager.exportSaveBlob(session.id);
    const payload = envelopePayload(blob);

    expect(blob).toEqual(expect.objectContaining({
      schemaVersion: 1,
      exportedAt: expect.any(String),
      sessionId: session.id,
      checksum: expect.any(String)
    }));
    expect(Date.parse(blob.exportedAt)).not.toBeNaN();
    expect(payload.mapId).toEqual(expect.any(String));
    expect(payload.player).toEqual(expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }));
  });

  it('imports a save blob into a new session with equivalent state', () => {
    const manager = createManager();
    const source = manager.createSession();
    const target = manager.createSession();

    executeFirstEnabledAction(manager, source);
    const blob = manager.exportSaveBlob(source.id);

    manager.importSaveBlob(target.id, blob);

    expect(publicRuntimeSummary(target)).toEqual(publicRuntimeSummary(source));
    expect(target.version).toBe(2);
  });

  it('records deterministic per-session action logs', () => {
    const manager = createManager({ now: () => new Date('2026-05-05T00:00:00.000Z') });
    const session = manager.createSession();

    executeFirstEnabledAction(manager, session);

    expect(manager.getActionLog(session.id)).toEqual([
      {
        sessionId: session.id,
        version: 1,
        actionId: expect.any(String),
        resultingVersion: 2,
        timestamp: '2026-05-05T00:00:00.000Z'
      }
    ]);
  });

  it('keeps action logs isolated and capped per session', () => {
    const manager = createManager({ now: () => new Date('2026-05-05T00:00:00.000Z') });
    const first = manager.createSession();
    const second = manager.createSession();

    for (let index = 0; index < 1005; index += 1) {
      manager.recordAction(first.id, index + 1, `trace:${index}`, index + 2);
    }
    manager.recordAction(second.id, 1, 'trace:other', 2);

    expect(manager.getActionLog(first.id)).toHaveLength(1000);
    expect(manager.getActionLog(first.id)[0]).toEqual(expect.objectContaining({ version: 6, actionId: 'trace:5' }));
    expect(manager.getActionLog(second.id)).toEqual([expect.objectContaining({ sessionId: second.id, actionId: 'trace:other' })]);
  });

  it('enforces max sessions and cleanup frees inactive slots', () => {
    let currentTime = Date.parse('2026-05-05T00:00:00.000Z');
    const manager = createManager({
      maxSessions: 1,
      inactiveTimeoutMs: 1000,
      now: () => new Date(currentTime)
    });
    const first = manager.createSession();

    expect(() => manager.createSession()).toThrow('Session limit reached');

    currentTime += 1001;
    expect(manager.cleanupInactiveSessions()).toBe(1);
    expect(manager.getSession(first.id)).toBeNull();
    expect(manager.createSession().id).toBe('save-replay-2');
  });

  it('deletes sessions, clears logs, and frees resources', () => {
    let cleanupCount = 0;
    const manager = createManager({
      maxSessions: 1,
      createGameSession: () => ({
        step: () => undefined,
        stepFrames: () => undefined,
        getRuntimeState: () => { throw new Error('not needed'); },
        getRenderableState: () => { throw new Error('not needed'); },
        exportSaveBlob: () => ({ schemaVersion: 1, exportedAt: '2026-05-05T00:00:00.000Z', data: null as TextApiJsonValue }),
        importSaveBlob: () => undefined,
        cleanup: () => { cleanupCount += 1; }
      } as unknown as GameSession)
    });
    const session = manager.createSession();

    manager.recordAction(session.id, 1, 'trace:delete', 2);

    expect(manager.deleteSession(session.id)).toBe(true);
    expect(cleanupCount).toBe(1);
    expect(() => manager.getActionLog(session.id)).toThrow('Session not found');
    expect(manager.createSession().id).toBe('save-replay-2');
  });

  it('replays an action trace to the same resulting state', () => {
    const originalManager = createManager();
    const replayManager = createManager();
    const original = originalManager.createSession();
    const replayed = replayManager.createSession();

    executeFirstEnabledAction(originalManager, original);
    const trace = originalManager.getActionLog(original.id).map(({ version, actionId }) => ({ version, actionId }));

    replayTrace(replayManager, replayed, trace);

    expect(publicRuntimeSummary(replayed)).toEqual(publicRuntimeSummary(original));
    expect(replayManager.getActionLog(replayed.id).map(({ version, actionId, resultingVersion }) => ({ version, actionId, resultingVersion })))
      .toEqual(originalManager.getActionLog(original.id).map(({ version, actionId, resultingVersion }) => ({ version, actionId, resultingVersion })));
  });
});
