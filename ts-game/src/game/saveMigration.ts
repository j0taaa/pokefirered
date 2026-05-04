import type { SaveSnapshot } from './saveData';

export const migrateSavePayload = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  const candidate = raw as Partial<SaveSnapshot>;
  if (candidate.schemaVersion === 6 && candidate.runtime && typeof candidate.runtime === 'object') {
    return candidate;
  }

  return raw;
};
