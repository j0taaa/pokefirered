import { describe, expect, test } from 'vitest';
import {
  CB2_RunClearSaveDataScreen,
  CB2_SaveClearScreen_Init,
  MENU_B_PRESSED,
  Task_CleanUpAndSoftReset,
  Task_HandleYesNoMenu,
  VBlankCB_WaitYesNo,
  CLEAR_SAVE_DATA_TEXT,
  clearSaveDataInStorage,
  createClearSaveDataScreenRuntime
} from '../src/game/decompClearSaveDataScreen';
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

  test('exact C-name clear-save screen callbacks follow draw, menu, cleanup, and reset flow', () => {
    let cleared = 0;
    let reset = 0;
    const runtime = createClearSaveDataScreenRuntime({
      menuInputs: [MENU_B_PRESSED],
      clearSaveData: () => {
        cleared += 1;
      },
      softReset: () => {
        reset += 1;
      }
    });

    CB2_SaveClearScreen_Init(runtime);
    expect(runtime.sClearSaveDataState).toEqual({ unk0: 0, unk1: 0, unk2: 0 });
    expect(runtime.mainCallback2).toBe(CB2_RunClearSaveDataScreen);
    expect(runtime.tasks.size).toBe(1);
    expect(runtime.log.slice(0, 4)).toEqual([
      'ResetSpriteData',
      'ResetPaletteFade',
      'ResetTasks',
      'SetMainCallback2:CB2_RunClearSaveDataScreen'
    ]);

    const taskId = [...runtime.tasks.keys()][0];
    for (let i = 0; i < 7; i += 1) {
      runtime.paletteFade.active = false;
      CB2_RunClearSaveDataScreen(runtime);
    }

    expect(runtime.sClearSaveDataState?.unk1).toBe(7);
    expect(runtime.vBlankCallback).toBe(VBlankCB_WaitYesNo);
    expect(runtime.tasks.get(taskId)?.func).toBe(Task_HandleYesNoMenu);
    expect(runtime.log).toContain(`AddTextPrinterParameterized4:1:${CLEAR_SAVE_DATA_TEXT.confirm}`);
    expect(runtime.log).toContain('CreateYesNoMenu');

    CB2_RunClearSaveDataScreen(runtime);
    expect(cleared).toBe(0);
    expect(runtime.sClearSaveDataState?.unk0).toBe(1);
    expect(runtime.log.filter((entry) => entry === 'PlaySE:SE_SELECT')).toHaveLength(1);

    runtime.paletteFade.active = false;
    CB2_RunClearSaveDataScreen(runtime);
    expect(runtime.sClearSaveDataState?.unk2).toBe(1);

    runtime.paletteFade.active = false;
    Task_CleanUpAndSoftReset(runtime, taskId);
    expect(runtime.sClearSaveDataState).toBeNull();
    expect(runtime.tasks.has(taskId)).toBe(false);
    expect(reset).toBe(1);
  });

  test('exact C-name yes path clears data before soft reset', () => {
    let cleared = 0;
    const runtime = createClearSaveDataScreenRuntime({
      menuInputs: [0],
      clearSaveData: () => {
        cleared += 1;
      }
    });

    CB2_SaveClearScreen_Init(runtime);
    const taskId = [...runtime.tasks.keys()][0];
    runtime.sClearSaveDataState = { unk0: 0, unk1: 7, unk2: 0 };
    runtime.tasks.set(taskId, { func: Task_HandleYesNoMenu });

    Task_HandleYesNoMenu(runtime, taskId);
    expect(cleared).toBe(1);
    expect(runtime.sClearSaveDataState.unk0).toBe(1);
    expect(runtime.log).toContain(`AddTextPrinterParameterized4:1:${CLEAR_SAVE_DATA_TEXT.clearing}`);
  });
});
