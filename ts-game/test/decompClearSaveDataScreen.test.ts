import { describe, expect, test } from 'vitest';
import { CLEAR_SAVE_DATA_TEXT, clearSaveDataInStorage } from '../src/game/decompClearSaveDataScreen';
import { loadGameFromStorage, saveGameToStorage, type StorageLike } from '../src/game/saveData';
import { vec2 } from '../src/core/vec2';
import { createScriptRuntimeState } from '../src/game/scripts';
import { loadRoute2Map } from '../src/world/mapSource';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

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

describe('decomp clear_save_data_screen', () => {
  test('exposes the decomp clear-save prompts and clears persisted saves', () => {
    const storage = new MemoryStorage();
    const mapId = loadRoute2Map().id;
    saveGameToStorage(storage, mapId, {
      position: vec2(0, 0),
      facing: 'down',
      moving: false,
      animationTime: 0
    }, createScriptRuntimeState(), 'slot');

    expect(loadGameFromStorage(storage, 'slot')).not.toBeNull();
    expect(clearSaveDataInStorage(storage, 'slot')).toEqual({
      ok: true,
      summary: CLEAR_SAVE_DATA_TEXT.clearing
    });
    expect(loadGameFromStorage(storage, 'slot')).toBeNull();
  });
});
