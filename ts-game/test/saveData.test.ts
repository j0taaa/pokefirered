import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import {
  applySaveSnapshot,
  loadGameFromStorage,
  saveGameToStorage,
  type StorageLike
} from '../src/game/saveData';
import type { PlayerState } from '../src/game/player';
import { createScriptRuntimeState, setScriptFlag } from '../src/game/scripts';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('save persistence', () => {
  test('saves and loads runtime state + player state', () => {
    const storage = new MemoryStorage();
    const player: PlayerState = {
      position: vec2(88, 144),
      facing: 'left',
      moving: false,
      animationTime: 0
    };
    const runtime = createScriptRuntimeState();
    runtime.vars.story = 3;
    runtime.options.textSpeed = 'fast';
    runtime.options.battleStyle = 'set';
    runtime.consumedTriggerIds.add('route-warning');
    setScriptFlag(runtime, 'story.route-warning');

    const result = saveGameToStorage(storage, 'prototype-route', player, runtime, 'slot');
    expect(result.ok).toBe(true);
    expect(result.saveIndex).toBe(1);
    expect(runtime.saveCounter).toBe(1);

    const loaded = loadGameFromStorage(storage, 'slot');
    expect(loaded).not.toBeNull();

    const newPlayer: PlayerState = {
      position: vec2(0, 0),
      facing: 'down',
      moving: true,
      animationTime: 2
    };
    const newRuntime = createScriptRuntimeState();
    const applied = applySaveSnapshot(loaded!, 'prototype-route', newPlayer, newRuntime);

    expect(applied).toBe(true);
    expect(newPlayer.position.x).toBe(88);
    expect(newPlayer.position.y).toBe(144);
    expect(newPlayer.facing).toBe('left');
    expect(newRuntime.vars.story).toBe(3);
    expect(newRuntime.flags.has('story.route-warning')).toBe(true);
    expect(newRuntime.consumedTriggerIds.has('route-warning')).toBe(true);
    expect(newRuntime.options.textSpeed).toBe('fast');
    expect(newRuntime.options.battleStyle).toBe('set');
    expect(newRuntime.saveCounter).toBe(1);
  });

  test('rejects corrupted save payload', () => {
    const storage = new MemoryStorage();
    storage.setItem('slot', '{bad-json');

    expect(loadGameFromStorage(storage, 'slot')).toBeNull();

    storage.setItem('slot', JSON.stringify({ schemaVersion: 999 }));
    expect(loadGameFromStorage(storage, 'slot')).toBeNull();
  });

  test('does not apply a save for another map id', () => {
    const storage = new MemoryStorage();
    const player: PlayerState = {
      position: vec2(32, 32),
      facing: 'up',
      moving: false,
      animationTime: 0
    };
    const runtime = createScriptRuntimeState();
    saveGameToStorage(storage, 'prototype-route', player, runtime, 'slot');
    const loaded = loadGameFromStorage(storage, 'slot');

    const targetPlayer: PlayerState = {
      position: vec2(10, 10),
      facing: 'down',
      moving: false,
      animationTime: 0
    };
    const targetRuntime = createScriptRuntimeState();

    const applied = applySaveSnapshot(loaded!, 'different-map', targetPlayer, targetRuntime);
    expect(applied).toBe(false);
    expect(targetPlayer.position.x).toBe(10);
    expect(targetRuntime.saveCounter).toBe(0);
  });
});
