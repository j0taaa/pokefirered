import type { PlayerState } from './player';
import type { ScriptRuntimeState } from './scripts';
import {
  applySaveSnapshot,
  loadGameFromStorage,
  type SaveSnapshot,
  type StorageLike
} from './saveData';

export const SAVE_STATUS_EMPTY = 0;
export const SAVE_STATUS_OK = 1;
export const SAVE_STATUS_INVALID = 2;

export const CONTINUE_SAVED_GAME_CALLBACK = 'CB2_ContinueSavedGame' as const;
export const RESET_SAVE_HEAP_C_TRANSLATION_UNIT = 'src/reset_save_heap.c';
export const RESET_EWRAM = 1 << 0;
export const REG_OFFSET_DISPCNT = 'REG_OFFSET_DISPCNT' as const;
export const DISPCNT_FORCED_BLANK = 1 << 7;
export const HEAP_SIZE = 0x1c000;

export interface ReloadSaveCState {
  REG_IME: number;
  resetRamFlags: number[];
  clearedGpuRegBits: Array<{ reg: typeof REG_OFFSET_DISPCNT; bits: number }>;
  gMainInBattle: boolean;
  saveBlocksPointersSet: boolean;
  menuAndMonGlobalsReset: boolean;
  saveCountersReset: boolean;
  defaultSaveCleared: boolean;
  cryStereoSound: ScriptRuntimeState['options']['sound'];
  heapInitializedSize: number;
  callback2: typeof CONTINUE_SAVED_GAME_CALLBACK | null;
  steps: string[];
}

export interface ReloadSaveContext<MapT extends { id: string }> {
  storage: StorageLike;
  key: string;
  defaultMap: MapT;
  loadMapById: (mapId: string) => MapT | null;
  player: PlayerState;
  runtime: ScriptRuntimeState;
  cState?: ReloadSaveCState;
}

export interface ReloadSaveResult<MapT extends { id: string }> {
  callback: typeof CONTINUE_SAVED_GAME_CALLBACK;
  loaded: boolean;
  map: MapT;
  saveFileStatus: number;
  snapshot: SaveSnapshot | null;
}

export const getSaveFileStatusFromStorage = (
  storage: StorageLike,
  key: string
): number => {
  const raw = storage.getItem(key);
  if (!raw) {
    return SAVE_STATUS_EMPTY;
  }

  try {
    JSON.parse(raw);
  } catch {
    return SAVE_STATUS_INVALID;
  }

  return loadGameFromStorage(storage, key) ? SAVE_STATUS_OK : SAVE_STATUS_INVALID;
};

export const createReloadSaveCState = (): ReloadSaveCState => ({
  REG_IME: 1,
  resetRamFlags: [],
  clearedGpuRegBits: [],
  gMainInBattle: true,
  saveBlocksPointersSet: false,
  menuAndMonGlobalsReset: false,
  saveCountersReset: false,
  defaultSaveCleared: false,
  cryStereoSound: 'stereo',
  heapInitializedSize: 0,
  callback2: null,
  steps: []
});

export const reloadSave = <MapT extends { id: string }>({
  storage,
  key,
  defaultMap,
  loadMapById,
  player,
  runtime
}: ReloadSaveContext<MapT>): ReloadSaveResult<MapT> => {
  const saveFileStatus = getSaveFileStatusFromStorage(storage, key);
  const snapshot = saveFileStatus === SAVE_STATUS_OK ? loadGameFromStorage(storage, key) : null;

  if (!snapshot) {
    return {
      callback: CONTINUE_SAVED_GAME_CALLBACK,
      loaded: false,
      map: defaultMap,
      saveFileStatus,
      snapshot: null
    };
  }

  const map = loadMapById(snapshot.mapId) ?? defaultMap;
  const loaded = applySaveSnapshot(snapshot, map.id, player, runtime);

  return {
    callback: CONTINUE_SAVED_GAME_CALLBACK,
    loaded,
    map,
    saveFileStatus,
    snapshot: loaded ? snapshot : null
  };
};

export function ReloadSave(
  context: ReloadSaveContext<{ id: string }>
): ReloadSaveResult<{ id: string }> {
  const cState = context.cState ?? createReloadSaveCState();
  const imeBackup = cState.REG_IME;

  cState.REG_IME = 0;
  cState.steps.push('REG_IME=0');
  cState.resetRamFlags.push(RESET_EWRAM);
  cState.steps.push('RegisterRamReset');
  cState.clearedGpuRegBits.push({ reg: REG_OFFSET_DISPCNT, bits: DISPCNT_FORCED_BLANK });
  cState.steps.push('ClearGpuRegBits');
  cState.REG_IME = imeBackup;
  cState.steps.push('REG_IME=imeBackup');
  cState.gMainInBattle = false;
  cState.steps.push('gMain.inBattle=FALSE');
  cState.saveBlocksPointersSet = true;
  cState.steps.push('SetSaveBlocksPointers');
  cState.menuAndMonGlobalsReset = true;
  cState.steps.push('ResetMenuAndMonGlobals');
  cState.saveCountersReset = true;
  cState.steps.push('Save_ResetSaveCounters');

  const result = reloadSave(context);
  cState.steps.push('LoadGameSave');

  if (result.saveFileStatus === SAVE_STATUS_EMPTY || result.saveFileStatus === SAVE_STATUS_INVALID) {
    cState.defaultSaveCleared = true;
    cState.steps.push('Sav2_ClearSetDefault');
  }

  cState.cryStereoSound = context.runtime.options.sound;
  cState.steps.push('SetPokemonCryStereo');
  cState.heapInitializedSize = HEAP_SIZE;
  cState.steps.push('InitHeap');
  cState.callback2 = CONTINUE_SAVED_GAME_CALLBACK;
  cState.steps.push('SetMainCallback2');

  return result;
}
