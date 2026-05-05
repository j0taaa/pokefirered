import { randomUUID } from 'node:crypto';
import { GameSession } from '../core/gameSession';
import type { AudioAdapter, InputAdapter, RenderAdapter, StorageAdapter } from './adapters';
import type { RenderFrameState } from '../core/gameSession';
import type { InputSnapshot } from '../input/inputState';

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

export interface SessionManagerOptions {
  readonly maxSessions?: number;
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
  private readonly maxSessions: number;
  private readonly now: () => Date;
  private readonly createId: () => string;
  private readonly createGameSession: () => GameSession;

  constructor(options: SessionManagerOptions = {}) {
    this.maxSessions = options.maxSessions ?? 100;
    this.now = options.now ?? (() => new Date());
    this.createId = options.createId ?? randomUUID;
    this.createGameSession = options.createGameSession ?? createHeadlessGameSession;
  }

  createSession(): Session {
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
    return session;
  }

  getSession(id: string): Session | null {
    return this.sessions.get(id) ?? null;
  }

  deleteSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) {
      return false;
    }
    session.gameSession.cleanup();
    return this.sessions.delete(id);
  }

  getAllSessions(): Session[] {
    return [...this.sessions.values()];
  }

  touch(session: Session): void {
    session.lastActivityAt = this.now();
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
