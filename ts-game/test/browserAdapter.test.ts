import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserAudioAdapter, BrowserRenderAdapter, BrowserStorageAdapter } from '../src/browser/browserAdapters';
import { GameSession } from '../src/core/gameSession';
import { BrowserInputAdapter, type InputSnapshot } from '../src/input/inputState';

type Listener = (event: { code: string; preventDefault(): void }) => void;

class FakeElement {
  className = '';
  innerHTML = '';
  textContent = '';
  readonly children: FakeElement[] = [];
  private readonly dataRoleChildren = new Map<string, FakeElement>();

  constructor(readonly tagName: string) {}

  append(...children: FakeElement[]): void {
    this.children.push(...children);
  }

  querySelector(selector: string): FakeElement | null {
    const dataRole = selector.match(/^\[data-role="([^"]+)"\]$/u)?.[1];
    if (dataRole) {
      if (!this.dataRoleChildren.has(dataRole)) {
        this.dataRoleChildren.set(dataRole, new FakeElement('strong'));
      }
      return this.dataRoleChildren.get(dataRole)!;
    }
    return null;
  }
}

class FakeCanvasElement extends FakeElement {
  width = 0;
  height = 0;
  readonly operations: string[] = [];
  readonly context = new Proxy({ imageSmoothingEnabled: true }, {
    get: (target, property) => {
      if (property in target) {
        return target[property as keyof typeof target];
      }
      if (typeof property === 'string') {
        return (..._args: unknown[]) => {
          this.operations.push(property);
          return undefined;
        };
      }
      return undefined;
    },
    set: (target, property, value) => {
      if (property === 'imageSmoothingEnabled') {
        target.imageSmoothingEnabled = Boolean(value);
      }
      return true;
    }
  }) as unknown as CanvasRenderingContext2D;

  constructor() {
    super('canvas');
  }

  getContext(type: string): CanvasRenderingContext2D | null {
    return type === '2d' ? this.context : null;
  }
}

class FakeDocument {
  readonly app = new FakeElement('div');
  readonly canvases: FakeCanvasElement[] = [];

  querySelector(selector: string): FakeElement | null {
    return selector === '#app' ? this.app : null;
  }

  createElement(tagName: string): FakeElement {
    if (tagName === 'canvas') {
      const canvas = new FakeCanvasElement();
      this.canvases.push(canvas);
      return canvas;
    }
    return new FakeElement(tagName);
  }
}

class FakeStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class FakeKeyboardEvent {
  defaultPrevented = false;

  constructor(readonly type: string, readonly init: { code: string }) {}

  get code(): string {
    return this.init.code;
  }

  preventDefault(): void {
    this.defaultPrevented = true;
  }
}

const installBrowserHarness = () => {
  const document = new FakeDocument();
  const listeners = new Map<string, Set<Listener>>();
  const localStorage = new FakeStorage();
  const requestAnimationFrame = vi.fn((_callback: FrameRequestCallback) => 1);
  const cancelAnimationFrame = vi.fn();
  const windowLike = {
    localStorage,
    addEventListener: (type: string, listener: Listener) => {
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }
      listeners.get(type)!.add(listener);
    },
    removeEventListener: (type: string, listener: Listener) => {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent: (event: { type: string; code: string; preventDefault(): void }) => {
      for (const listener of listeners.get(event.type) ?? []) {
        listener(event);
      }
      return true;
    }
  };

  vi.stubGlobal('document', document);
  vi.stubGlobal('window', windowLike);
  vi.stubGlobal('localStorage', localStorage);
  vi.stubGlobal('KeyboardEvent', FakeKeyboardEvent);
  vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
  vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);
  vi.stubGlobal('performance', { now: () => 0 });
  vi.stubGlobal('Image', class {
    complete = true;
    naturalWidth = 1;
    src = '';
    addEventListener(_type: string, _listener: EventListener): void {
      return;
    }
  });
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(0),
    text: async () => ''
  })));

  return { document, localStorage, requestAnimationFrame, windowLike };
};

const keySnapshot = (adapter: BrowserInputAdapter, code: string): InputSnapshot => {
  window.dispatchEvent(new KeyboardEvent('keydown', { code }));
  const snapshot = adapter.readSnapshot();
  window.dispatchEvent(new KeyboardEvent('keyup', { code }));
  adapter.readSnapshot();
  return snapshot;
};

describe('browser adapters', () => {
  beforeEach(() => {
    vi.resetModules();
    installBrowserHarness();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('imports the browser entrypoint and starts the loop normally', async () => {
    const harness = installBrowserHarness();

    await import('../src/main');

    expect(harness.document.app.children).toHaveLength(1);
    expect(harness.document.canvases.length).toBeGreaterThanOrEqual(1);
    expect(harness.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(window.__pokemonFireRedAudioDebug).toBeDefined();
    expect(window.__pokemonFireRedLinkDebug).toBeDefined();
  });

  it('constructs GameSession with browser adapters', () => {
    const harness = installBrowserHarness();
    const canvas = harness.document.createElement('canvas') as FakeCanvasElement;
    const input = new BrowserInputAdapter();
    const audio = new BrowserAudioAdapter({ consume: vi.fn(), reset: vi.fn() } as never);
    const render = new BrowserRenderAdapter(canvas as unknown as HTMLCanvasElement);
    const session = new GameSession({
      storage: new BrowserStorageAdapter(harness.localStorage),
      audio,
      input,
      render
    }, 'browser-adapter-test-save');

    expect(session.getRuntimeState().map.id).toBeTruthy();
    expect(session.getRenderableState().camera.viewportWidth).toBeGreaterThan(0);

    session.cleanup();
  });

  it('keeps keyboard controls mapped to the existing browser keys', () => {
    const adapter = new BrowserInputAdapter();
    adapter.attach();

    expect(keySnapshot(adapter, 'ArrowUp')).toMatchObject({ up: true, upPressed: true });
    expect(keySnapshot(adapter, 'KeyW')).toMatchObject({ up: true, upPressed: true });
    expect(keySnapshot(adapter, 'ArrowDown')).toMatchObject({ down: true, downPressed: true });
    expect(keySnapshot(adapter, 'KeyS')).toMatchObject({ down: true, downPressed: true });
    expect(keySnapshot(adapter, 'ArrowLeft')).toMatchObject({ left: true, leftPressed: true });
    expect(keySnapshot(adapter, 'KeyA')).toMatchObject({ left: true, leftPressed: true });
    expect(keySnapshot(adapter, 'ArrowRight')).toMatchObject({ right: true, rightPressed: true });
    expect(keySnapshot(adapter, 'KeyD')).toMatchObject({ right: true, rightPressed: true });
    expect(keySnapshot(adapter, 'ShiftLeft')).toMatchObject({ run: true });
    expect(keySnapshot(adapter, 'ShiftRight')).toMatchObject({ run: true });
    expect(keySnapshot(adapter, 'KeyZ')).toMatchObject({ interact: true, interactPressed: true });
    expect(keySnapshot(adapter, 'Enter')).toMatchObject({ interact: true, interactPressed: true });
    expect(keySnapshot(adapter, 'Escape')).toMatchObject({ start: true, startPressed: true });
    expect(keySnapshot(adapter, 'KeyX')).toMatchObject({ cancel: true, cancelPressed: true });
    expect(keySnapshot(adapter, 'Backspace')).toMatchObject({ cancel: true, cancelPressed: true });
    expect(keySnapshot(adapter, 'Space')).toMatchObject({ select: true, selectPressed: true });

    adapter.detach();
  });

  it('renders a browser canvas frame through the render adapter', () => {
    const harness = installBrowserHarness();
    const canvas = harness.document.createElement('canvas') as FakeCanvasElement;
    const render = new BrowserRenderAdapter(canvas as unknown as HTMLCanvasElement);
    const session = new GameSession({
      storage: new BrowserStorageAdapter(harness.localStorage),
      audio: new BrowserAudioAdapter({ consume: vi.fn(), reset: vi.fn() } as never),
      input: new BrowserInputAdapter(),
      render
    }, 'browser-render-test-save');
    const frameState = session.getRenderableState();

    render.resize(frameState.camera.viewportWidth, frameState.camera.viewportHeight);
    render.render(frameState);

    expect(canvas.width).toBe(frameState.camera.viewportWidth);
    expect(canvas.height).toBe(frameState.camera.viewportHeight);
    expect(canvas.operations).toContain('clearRect');
    expect(canvas.operations).toContain('fillRect');

    session.cleanup();
  });
});
