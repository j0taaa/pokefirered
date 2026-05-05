import { randomUUID } from 'node:crypto';
import { GameSession } from '../core/gameSession';
import type { AudioAdapter, InputAdapter, RenderAdapter, StorageAdapter } from './adapters';
import type { RenderFrameState } from '../core/gameSession';
import type { InputSnapshot } from '../input/inputState';
import type { TextApiSaveBlob } from './textApiTypes';

const DEFAULT_MAX_INACTIVE_MS = 60 * 60 * 1000;
const MAX_ACTION_LOG_ENTRIES = 1000;

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

class MemoryStorageAdapter implements StorageAdapter {
  private readonly values = new Map<string, string>();

  load(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  save(key: string, value: string): void {
    this.values.set(key, value);
  }

  remove(key: string): void {
    this.values.delete(key);
  }
}

class NoopAudioAdapter implements AudioAdapter {
  consume(_events: readonly unknown[]): void {
    return;
  }

  reset(): void {
    return;
  }
}

class NoopInputAdapter implements InputAdapter {
  readSnapshot(): InputSnapshot {
    return neutralInput();
  }
}

class NoopRenderAdapter implements RenderAdapter<RenderFrameState> {
  resize(_width: number, _height: number): void {
    return;
  }

  render(_frameState: RenderFrameState): void {
    return;
  }
}

export interface Session {
  readonly id: string;
  readonly gameSession: GameSession;
  readonly createdAt: Date;
  lastActivityAt: Date;
  version: number;
}

export interface ActionLogEntry {
  readonly sessionId: string;
  readonly version: number;
  readonly actionId: string;
  readonly resultingVersion: number;
  readonly timestamp: string;
}

export interface SessionManagerOptions {
  readonly maxSessions?: number;
  readonly inactiveTimeoutMs?: number;
  readonly now?: () => Date;
  readonly createId?: () => string;
  readonly createGameSession?: () => GameSession;
}

const createHeadlessGameSession = (): GameSession => new GameSession({
  storage: new MemoryStorageAdapter(),
  audio: new NoopAudioAdapter(),
  input: new NoopInputAdapter(),
  render: new NoopRenderAdapter()
});

export class SessionManager {
  private readonly sessions = new Map<string, Session>();
  private readonly actionLogs = new Map<string, ActionLogEntry[]>();
  private readonly maxSessions: number;
  private readonly inactiveTimeoutMs: number;
  private readonly now: () => Date;
  private readonly createId: () => string;
  private readonly createGameSession: () => GameSession;

  constructor(options: SessionManagerOptions = {}) {
    this.maxSessions = options.maxSessions ?? 100;
    this.inactiveTimeoutMs = options.inactiveTimeoutMs ?? DEFAULT_MAX_INACTIVE_MS;
    this.now = options.now ?? (() => new Date());
    this.createId = options.createId ?? randomUUID;
    this.createGameSession = options.createGameSession ?? createHeadlessGameSession;
  }

  createSession(): Session {
    this.cleanupInactiveSessions(this.inactiveTimeoutMs);
    if (this.sessions.size >= this.maxSessions) {
      throw new Error(`Session limit reached (${this.maxSessions}).`);
    }

    const id = this.nextUniqueId();
    const createdAt = this.now();
    const session: Session = {
      id,
      gameSession: this.createGameSession(),
      createdAt,
      lastActivityAt: createdAt,
      version: 1
    };
    this.sessions.set(id, session);
    this.actionLogs.set(id, []);
    return session;
  }

  getSession(id: string): Session | null {
    const session = this.sessions.get(id) ?? null;
    if (!session) {
      return null;
    }
    if (this.isInactive(session, this.inactiveTimeoutMs)) {
      this.deleteSession(id);
      return null;
    }
    return session;
  }

  deleteSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) {
      return false;
    }
    session.gameSession.cleanup();
    this.actionLogs.delete(id);
    return this.sessions.delete(id);
  }

  getAllSessions(): Session[] {
    return [...this.sessions.values()];
  }

  touch(session: Session): void {
    session.lastActivityAt = this.now();
  }

  exportSaveBlob(sessionId: string): TextApiSaveBlob {
    const session = this.requireSession(sessionId);
    this.touch(session);
    return { ...session.gameSession.exportSaveBlob(), sessionId: session.id };
  }

  importSaveBlob(sessionId: string, blob: TextApiSaveBlob): void {
    const session = this.requireSession(sessionId);
    session.gameSession.importSaveBlob(blob);
    session.version += 1;
    this.touch(session);
  }

  recordAction(sessionId: string, version: number, actionId: string, resultingVersion: number): void {
    const session = this.requireSession(sessionId);
    const entries = this.actionLogs.get(sessionId) ?? [];
    const timestamp = this.now();
    entries.push({
      sessionId,
      version,
      actionId,
      resultingVersion,
      timestamp: timestamp.toISOString()
    });
    if (entries.length > MAX_ACTION_LOG_ENTRIES) {
      entries.splice(0, entries.length - MAX_ACTION_LOG_ENTRIES);
    }
    this.actionLogs.set(sessionId, entries);
    session.lastActivityAt = timestamp;
  }

  getActionLog(sessionId: string): ActionLogEntry[] {
    this.requireSession(sessionId);
    return [...(this.actionLogs.get(sessionId) ?? [])];
  }

  cleanupInactiveSessions(maxInactiveMs = this.inactiveTimeoutMs): number {
    const inactiveSessionIds = [...this.sessions.values()]
      .filter((session) => this.isInactive(session, maxInactiveMs))
      .map((session) => session.id);

    for (const id of inactiveSessionIds) {
      this.deleteSession(id);
    }

    return inactiveSessionIds.length;
  }

  private requireSession(id: string): Session {
    const session = this.getSession(id);
    if (!session) {
      throw new Error(`Session not found: ${id}`);
    }
    return session;
  }

  private isInactive(session: Session, maxInactiveMs: number): boolean {
    return this.now().getTime() - session.lastActivityAt.getTime() > maxInactiveMs;
  }

  private nextUniqueId(): string {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const id = this.createId();
      if (!this.sessions.has(id)) {
        return id;
      }
    }
    throw new Error('Unable to create a unique session id.');
  }
}
