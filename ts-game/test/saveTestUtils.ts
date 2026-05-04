import { vec2 } from '../src/core/vec2';
import type { PlayerState } from '../src/game/player';
import { type StorageLike } from '../src/game/saveData';

export class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

export class ThrowingStorage extends MemoryStorage {
  setItem(_key: string, _value: string): void {
    throw new DOMException('Quota exceeded', 'QuotaExceededError');
  }
}

export const createTestPlayer = (x = 0, y = 0, facing: PlayerState['facing'] = 'down'): PlayerState => ({
  position: vec2(x, y),
  facing,
  moving: false,
  animationTime: 0
});
