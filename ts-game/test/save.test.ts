import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import {
  applySaveSnapshot,
  clearSavedGameFromStorage,
  loadGameFromStorage,
  saveGameToStorage,
  type StorageLike
} from '../src/game/saveData';
import type { PlayerState } from '../src/game/player';
import { createScriptRuntimeState, setScriptFlag } from '../src/game/scripts';
import { loadRoute2Map } from '../src/world/mapSource';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe('save system', () => {
  const mapId = loadRoute2Map().id;

  test('saves and loads game state', () => {
    const storage = new MemoryStorage();
    const player: PlayerState = {
      position: vec2(88, 144), facing: 'left', moving: false, animationTime: 0
    };
    const runtime = createScriptRuntimeState();
    runtime.vars.story = 3;
    runtime.options.textSpeed = 'fast';

    const result = saveGameToStorage(storage, mapId, player, runtime);
    expect(result.ok).toBe(true);
    expect(result.saveIndex).toBe(1);

    const loaded = loadGameFromStorage(storage);
    expect(loaded).not.toBeNull();
    expect(loaded!.player.x).toBe(88);
    expect(loaded!.player.y).toBe(144);
    expect(loaded!.player.facing).toBe('left');
    expect(loaded!.runtime.options.textSpeed).toBe('fast');
    expect(loaded!.runtime.vars.story).toBe(3);
  });

  test('returns null for missing save', () => {
    const storage = new MemoryStorage();
    const loaded = loadGameFromStorage(storage);
    expect(loaded).toBeNull();
  });

  test('returns null for corrupted save', () => {
    const storage = new MemoryStorage();
    storage.setItem('pokefirered.ts.save.v6', 'not json');
    const loaded = loadGameFromStorage(storage);
    expect(loaded).toBeNull();
  });

  test('returns null for wrong schema version', () => {
    const storage = new MemoryStorage();
    storage.setItem('pokefirered.ts.save.v6', JSON.stringify({ schemaVersion: 999 }));
    const loaded = loadGameFromStorage(storage);
    expect(loaded).toBeNull();
  });

  test('clears save data', () => {
    const storage = new MemoryStorage();
    const player: PlayerState = {
      position: vec2(0, 0), facing: 'down', moving: false, animationTime: 0
    };
    const runtime = createScriptRuntimeState();
    saveGameToStorage(storage, mapId, player, runtime);
    expect(storage.getItem('pokefirered.ts.save.v6')).not.toBeNull();

    clearSavedGameFromStorage(storage);
    expect(storage.getItem('pokefirered.ts.save.v6')).toBeNull();
  });

  test('save increments save counter', () => {
    const storage = new MemoryStorage();
    const player: PlayerState = {
      position: vec2(0, 0), facing: 'down', moving: false, animationTime: 0
    };
    const runtime = createScriptRuntimeState();

    const result1 = saveGameToStorage(storage, mapId, player, runtime);
    expect(result1.saveIndex).toBe(1);
    expect(runtime.saveCounter).toBe(1);

    const result2 = saveGameToStorage(storage, mapId, player, runtime);
    expect(result2.saveIndex).toBe(2);
    expect(runtime.saveCounter).toBe(2);
  });

  test('apply save snapshot restores runtime state', () => {
    const storage = new MemoryStorage();
    const player: PlayerState = {
      position: vec2(100, 200), facing: 'up', moving: false, animationTime: 0
    };
    const runtime = createScriptRuntimeState();
    runtime.options.textSpeed = 'fast';
    runtime.options.battleStyle = 'set';
    setScriptFlag(runtime, 'FLAG_GOT_POKEDEX');

    saveGameToStorage(storage, mapId, player, runtime);
    const snapshot = loadGameFromStorage(storage);
    expect(snapshot).not.toBeNull();

    const newPlayer: PlayerState = {
      position: vec2(0, 0), facing: 'down', moving: false, animationTime: 0
    };
    const newRuntime = createScriptRuntimeState();
    const applied = applySaveSnapshot(snapshot!, mapId, newPlayer, newRuntime);
    expect(applied).toBe(true);
    expect(newPlayer.position.x).toBe(100);
    expect(newPlayer.position.y).toBe(200);
    expect(newRuntime.options.textSpeed).toBe('fast');
    expect(newRuntime.options.battleStyle).toBe('set');
    expect(newRuntime.flags.has('FLAG_GOT_POKEDEX')).toBe(true);
  });

  test('save preserves party and pokedex state', () => {
    const storage = new MemoryStorage();
    const player: PlayerState = {
      position: vec2(0, 0), facing: 'down', moving: false, animationTime: 0
    };
    const runtime = createScriptRuntimeState();
    runtime.party[0]!.hp = 10;
    runtime.pokedex.seenSpecies.push('BULBASAUR');

    saveGameToStorage(storage, mapId, player, runtime);
    const snapshot = loadGameFromStorage(storage);
    expect(snapshot).not.toBeNull();
    expect(snapshot!.runtime.party[0]!.hp).toBe(10);
    expect(snapshot!.runtime.pokedex.seenSpecies).toContain('BULBASAUR');
  });
});