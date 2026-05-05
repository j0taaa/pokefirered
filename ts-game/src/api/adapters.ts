import type { InputSnapshot } from '../input/inputState';

export interface StorageAdapter {
  load(key: string): string | null;
  save(key: string, value: string): void;
  remove(key: string): void;
}

export interface AudioAdapter {
  consume(events: readonly unknown[]): void;
  reset(): void;
}

export interface InputAdapter {
  readSnapshot(): InputSnapshot;
}

export interface RenderAdapter<FrameState = unknown> {
  resize(width: number, height: number): void;
  render(frameState: FrameState): void;
}
