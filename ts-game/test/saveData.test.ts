import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import { createPlayTimeCounterFromSeconds } from '../src/game/decompPlayTime';
import {
  POKECENTER_SAVEWARP,
  UNLOCKED_POKEDEX_GCN_LINK_FLAGS_MASK,
  trySetMapSaveWarpStatus
} from '../src/game/decompSaveLocation';
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

describe('save persistence', () => {
  const mapId = loadRoute2Map().id;

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
    runtime.options.sound = 'mono';
    runtime.options.buttonMode = 'lr';
    runtime.options.frameType = 4;
    runtime.playTime = createPlayTimeCounterFromSeconds(3723, 17);
    runtime.party[0]!.championRibbon = true;
    runtime.party[0]!.personality = 0x12345678;
    runtime.party[0]!.mailId = 4;
    runtime.newGame.differentSaveFile = true;
    runtime.newGame.pcItems = [{ itemId: 'ITEM_POTION', quantity: 1 }];
    runtime.newGame.mail[0] = {
      ...runtime.newGame.mail[0]!,
      playerName: 'PLAYER',
      trainerId: 0x1234,
      species: 30012,
      itemId: 'ITEM_ORANGE_MAIL'
    };
    runtime.consumedTriggerIds.add('route-warning');
    setScriptFlag(runtime, 'story.route-warning');
    trySetMapSaveWarpStatus(runtime, 'MAP_VIRIDIAN_CITY_POKEMON_CENTER_1F');

    const result = saveGameToStorage(storage, mapId, player, runtime, 'slot');
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
    const applied = applySaveSnapshot(loaded!, mapId, newPlayer, newRuntime);

    expect(applied).toBe(true);
    expect(newPlayer.position.x).toBe(88);
    expect(newPlayer.position.y).toBe(144);
    expect(newPlayer.facing).toBe('left');
    expect(newRuntime.vars.story).toBe(3);
    expect(newRuntime.flags.has('story.route-warning')).toBe(true);
    expect(newRuntime.consumedTriggerIds.has('route-warning')).toBe(true);
    expect(newRuntime.options.textSpeed).toBe('fast');
    expect(newRuntime.options.battleStyle).toBe('set');
    expect(newRuntime.options.sound).toBe('mono');
    expect(newRuntime.options.buttonMode).toBe('lr');
    expect(newRuntime.options.frameType).toBe(4);
    expect(newRuntime.specialSaveWarpFlags & POKECENTER_SAVEWARP).toBe(POKECENTER_SAVEWARP);
    expect(newRuntime.gcnLinkFlags & UNLOCKED_POKEDEX_GCN_LINK_FLAGS_MASK)
      .toBe(UNLOCKED_POKEDEX_GCN_LINK_FLAGS_MASK);
    expect(newRuntime.playTime).toMatchObject({ hours: 1, minutes: 2, seconds: 3, vblanks: 17 });
    expect(newRuntime.party[0]?.championRibbon).toBe(true);
    expect(newRuntime.party[0]?.personality).toBe(0x12345678);
    expect(newRuntime.party[0]?.mailId).toBe(4);
    expect(newRuntime.newGame.differentSaveFile).toBe(true);
    expect(newRuntime.newGame.pcItems).toEqual([{ itemId: 'ITEM_POTION', quantity: 1 }]);
    expect(newRuntime.newGame.mail[0]).toMatchObject({
      playerName: 'PLAYER',
      trainerId: 0x1234,
      species: 30012,
      itemId: 'ITEM_ORANGE_MAIL'
    });
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
    saveGameToStorage(storage, mapId, player, runtime, 'slot');
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

  test('loads older save payloads without an explicit playTime block', () => {
    const storage = new MemoryStorage();
    const legacyRuntime = createScriptRuntimeState();
    storage.setItem('slot', JSON.stringify({
      schemaVersion: 6,
      mapId,
      saveIndex: 3,
      savedAt: '2026-04-21T12:00:00.000Z',
      player: { x: 32, y: 32, facing: 'up' },
      runtime: {
        vars: { playTimeSeconds: 3665 },
        flags: [],
        consumedTriggerIds: [],
        startMenu: {
          mode: 'normal',
          playerName: 'PLAYER',
          hasPokedex: true,
          hasPokemon: true,
          seenPokemonCount: 0
        },
        options: {
          textSpeed: 'mid',
          battleScene: true,
          battleStyle: 'shift',
          sound: 'stereo',
          buttonMode: 'help',
          frameType: 0
        },
        party: legacyRuntime.party,
        pokedex: legacyRuntime.pokedex,
        bag: legacyRuntime.bag
      }
    }));

    const loaded = loadGameFromStorage(storage, 'slot');
    expect(loaded?.runtime.playTime).toEqual({
      hours: 1,
      minutes: 1,
      seconds: 5,
      vblanks: 0
    });
    expect(loaded?.runtime.specialSaveWarpFlags).toBe(0);
    expect(loaded?.runtime.gcnLinkFlags).toBe(UNLOCKED_POKEDEX_GCN_LINK_FLAGS_MASK);
  });

  test('clears stored saves through the shared saveData helper', () => {
    const storage = new MemoryStorage();
    const player: PlayerState = {
      position: vec2(32, 32),
      facing: 'up',
      moving: false,
      animationTime: 0
    };

    saveGameToStorage(storage, mapId, player, createScriptRuntimeState(), 'slot');
    expect(loadGameFromStorage(storage, 'slot')).not.toBeNull();

    clearSavedGameFromStorage(storage, 'slot');
    expect(loadGameFromStorage(storage, 'slot')).toBeNull();
  });
});
