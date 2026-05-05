import { describe, expect, it } from 'vitest';
import type { AudioAdapter, InputAdapter, RenderAdapter, StorageAdapter } from '../src/api/adapters';
import { GameSession, type RenderFrameState } from '../src/core/gameSession';
import type { InputSnapshot } from '../src/input/inputState';

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

const createHeadlessSession = (): GameSession => new GameSession({
  storage: new MemoryStorageAdapter(),
  audio: new NoopAudioAdapter(),
  input: new NoopInputAdapter(),
  render: new NoopRenderAdapter()
});

describe('GameSession', () => {
  it('constructs without DOM or canvas adapters', () => {
    const session = createHeadlessSession();
    const state = session.getRuntimeState();

    expect(state.map.id).toBeTruthy();
    expect(state.player.position.x).toEqual(expect.any(Number));
    expect(state.dialogue.active).toBe(false);

    session.cleanup();
  });

  it('steps with neutral input', () => {
    const session = createHeadlessSession();
    const before = session.getRuntimeState();

    session.step(neutralInput());

    const after = session.getRuntimeState();
    expect(after.map.id).toBe(before.map.id);
    expect(after.player.position).toEqual(before.player.position);
    expect(after.scriptRuntime.playTime.vblanks).toBeGreaterThanOrEqual(before.scriptRuntime.playTime.vblanks);

    session.cleanup();
  });

  it('returns stable runtime and renderable state views', () => {
    const session = createHeadlessSession();
    session.stepFrames([neutralInput()], 2);

    const runtime = session.getRuntimeState();
    const renderable = session.getRenderableState();

    expect(renderable.map).toBe(runtime.map);
    expect(renderable.player).toBe(runtime.player);
    expect(renderable.overlays.runtime).toBe(runtime.scriptRuntime);
    expect(renderable.overlays.startMenu).toBe(runtime.startMenu);
    expect(renderable.visibleNpcs.length).toBeLessThanOrEqual(runtime.npcs.length);

    session.cleanup();
  });
});
