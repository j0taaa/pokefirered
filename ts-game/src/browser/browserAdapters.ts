import type { AudioAdapter, RenderAdapter, StorageAdapter } from '../api/adapters';
import { WebAudioEventAdapter } from '../audio/webAudioAdapter';
import type { AudioEvent } from '../game/decompFieldSound';
import type { RenderFrameState } from '../core/gameSession';
import { CanvasRenderer } from '../rendering/canvasRenderer';

export class BrowserStorageAdapter implements StorageAdapter {
  constructor(private readonly storage: Storage = window.localStorage) {}

  load(key: string): string | null {
    return this.storage.getItem(key);
  }

  save(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }
}

export class BrowserAudioAdapter implements AudioAdapter {
  private readonly audio: WebAudioEventAdapter;

  constructor(audio: WebAudioEventAdapter = new WebAudioEventAdapter()) {
    this.audio = audio;
  }

  consume(events: readonly unknown[]): void {
    this.audio.consume(events as readonly AudioEvent[]);
  }

  reset(): void {
    this.audio.reset();
  }
}

export class BrowserRenderAdapter implements RenderAdapter<RenderFrameState> {
  private readonly renderer: CanvasRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new CanvasRenderer(canvas);
  }

  preload(): void {
    void this.renderer.preloadPartyMenuBackground().catch(() => undefined);
    void this.renderer.preloadBattleUiAssets().catch(() => undefined);
  }

  resize(width: number, height: number): void {
    this.renderer.resize(width, height);
  }

  render(frameState: RenderFrameState): void {
    this.renderer.render(
      frameState.map,
      frameState.player,
      [...frameState.visibleNpcs],
      frameState.camera,
      frameState.overlays
    );
  }
}
