import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import {
  CONTINUE_SAVED_GAME_CALLBACK,
  DISPCNT_FORCED_BLANK,
  HEAP_SIZE,
  REG_OFFSET_DISPCNT,
  RESET_EWRAM,
  RESET_SAVE_HEAP_C_TRANSLATION_UNIT,
  ReloadSave,
  createReloadSaveCState,
  getSaveFileStatusFromStorage,
  reloadSave,
  SAVE_STATUS_EMPTY,
  SAVE_STATUS_INVALID,
  SAVE_STATUS_OK
} from '../src/game/decompResetSaveHeap';
import { saveGameToStorage, type StorageLike } from '../src/game/saveData';
import type { PlayerState } from '../src/game/player';
import { createScriptRuntimeState } from '../src/game/scripts';
import { loadMapById, loadRoute2Map } from '../src/world/mapSource';

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

describe('decomp reset_save_heap', () => {
  test('exports the reset_save_heap.c translation unit marker', () => {
    expect(RESET_SAVE_HEAP_C_TRANSLATION_UNIT).toBe('src/reset_save_heap.c');
  });

  test('distinguishes empty, invalid, and valid save payloads', () => {
    const storage = new MemoryStorage();

    expect(getSaveFileStatusFromStorage(storage, 'slot')).toBe(SAVE_STATUS_EMPTY);

    storage.setItem('slot', '{bad-json');
    expect(getSaveFileStatusFromStorage(storage, 'slot')).toBe(SAVE_STATUS_INVALID);

    const player: PlayerState = {
      position: vec2(32, 32),
      facing: 'up',
      moving: false,
      animationTime: 0
    };
    saveGameToStorage(storage, loadRoute2Map().id, player, createScriptRuntimeState(), 'slot');
    expect(getSaveFileStatusFromStorage(storage, 'slot')).toBe(SAVE_STATUS_OK);
  });

  test('reloads a valid save into runtime state and returns the continue callback', () => {
    const storage = new MemoryStorage();
    const sourcePlayer: PlayerState = {
      position: vec2(88, 144),
      facing: 'left',
      moving: false,
      animationTime: 0
    };
    const sourceRuntime = createScriptRuntimeState();
    sourceRuntime.vars.story = 7;
    sourceRuntime.options.sound = 'mono';
    saveGameToStorage(storage, loadRoute2Map().id, sourcePlayer, sourceRuntime, 'slot');

    const targetPlayer: PlayerState = {
      position: vec2(0, 0),
      facing: 'down',
      moving: false,
      animationTime: 0
    };
    const targetRuntime = createScriptRuntimeState();

    const result = reloadSave({
      storage,
      key: 'slot',
      defaultMap: loadRoute2Map(),
      loadMapById,
      player: targetPlayer,
      runtime: targetRuntime
    });

    expect(result.callback).toBe(CONTINUE_SAVED_GAME_CALLBACK);
    expect(result.saveFileStatus).toBe(SAVE_STATUS_OK);
    expect(result.loaded).toBe(true);
    expect(result.snapshot?.saveIndex).toBe(1);
    expect(result.map.id).toBe(loadRoute2Map().id);
    expect(targetPlayer.position.x).toBe(88);
    expect(targetPlayer.position.y).toBe(144);
    expect(targetPlayer.facing).toBe('left');
    expect(targetRuntime.vars.story).toBe(7);
    expect(targetRuntime.options.sound).toBe('mono');
  });

  test('ReloadSave preserves the C side-effect order around the browser save loader', () => {
    const storage = new MemoryStorage();
    const sourcePlayer: PlayerState = {
      position: vec2(88, 144),
      facing: 'left',
      moving: false,
      animationTime: 0
    };
    const sourceRuntime = createScriptRuntimeState();
    sourceRuntime.options.sound = 'mono';
    saveGameToStorage(storage, loadRoute2Map().id, sourcePlayer, sourceRuntime, 'slot');

    const targetPlayer: PlayerState = {
      position: vec2(0, 0),
      facing: 'down',
      moving: false,
      animationTime: 0
    };
    const targetRuntime = createScriptRuntimeState();
    const cState = createReloadSaveCState();
    cState.REG_IME = 7;

    const result = ReloadSave({
      storage,
      key: 'slot',
      defaultMap: loadRoute2Map(),
      loadMapById,
      player: targetPlayer,
      runtime: targetRuntime,
      cState
    });

    expect(result.loaded).toBe(true);
    expect(cState.REG_IME).toBe(7);
    expect(cState.resetRamFlags).toEqual([RESET_EWRAM]);
    expect(cState.clearedGpuRegBits).toEqual([{ reg: REG_OFFSET_DISPCNT, bits: DISPCNT_FORCED_BLANK }]);
    expect(cState.gMainInBattle).toBe(false);
    expect(cState.saveBlocksPointersSet).toBe(true);
    expect(cState.menuAndMonGlobalsReset).toBe(true);
    expect(cState.saveCountersReset).toBe(true);
    expect(cState.defaultSaveCleared).toBe(false);
    expect(cState.cryStereoSound).toBe('mono');
    expect(cState.heapInitializedSize).toBe(HEAP_SIZE);
    expect(cState.callback2).toBe(CONTINUE_SAVED_GAME_CALLBACK);
    expect(cState.steps).toEqual([
      'REG_IME=0',
      'RegisterRamReset',
      'ClearGpuRegBits',
      'REG_IME=imeBackup',
      'gMain.inBattle=FALSE',
      'SetSaveBlocksPointers',
      'ResetMenuAndMonGlobals',
      'Save_ResetSaveCounters',
      'LoadGameSave',
      'SetPokemonCryStereo',
      'InitHeap',
      'SetMainCallback2'
    ]);
  });

  test('falls back to the default map when the save is empty or invalid', () => {
    const storage = new MemoryStorage();
    storage.setItem('slot', JSON.stringify({ schemaVersion: 999 }));

    const player: PlayerState = {
      position: vec2(0, 0),
      facing: 'down',
      moving: false,
      animationTime: 0
    };
    const runtime = createScriptRuntimeState();
    const defaultMap = loadRoute2Map();

    const result = reloadSave({
      storage,
      key: 'slot',
      defaultMap,
      loadMapById,
      player,
      runtime
    });

    expect(result.callback).toBe(CONTINUE_SAVED_GAME_CALLBACK);
    expect(result.saveFileStatus).toBe(SAVE_STATUS_INVALID);
    expect(result.loaded).toBe(false);
    expect(result.snapshot).toBeNull();
    expect(result.map).toBe(defaultMap);

    const cState = createReloadSaveCState();
    ReloadSave({
      storage,
      key: 'slot',
      defaultMap,
      loadMapById,
      player,
      runtime,
      cState
    });
    expect(cState.defaultSaveCleared).toBe(true);
  });
});
