import type { StorageLike } from './saveData';

export const CLEAR_SAVE_DATA_TEXT = {
  confirm: 'Clear all save data areas?',
  clearing: 'Clearing data...\nPlease wait.'
} as const;

export interface ClearSaveDataOperationResult {
  ok: boolean;
  summary: string;
}

export const clearSaveDataInStorage = (
  storage: StorageLike,
  key: string
): ClearSaveDataOperationResult => {
  if (typeof storage.removeItem === 'function') {
    storage.removeItem(key);
  } else {
    storage.setItem(key, '');
  }

  return {
    ok: true,
    summary: CLEAR_SAVE_DATA_TEXT.clearing
  };
};
