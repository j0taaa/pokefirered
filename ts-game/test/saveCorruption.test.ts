import { describe, expect, test } from 'vitest';
import { createScriptRuntimeState } from '../src/game/scripts';
import { DEFAULT_SAVE_SLOT_KEY, loadGameFromStorage, saveGameToStorage } from '../src/game/saveData';
import { createTestPlayer, MemoryStorage, ThrowingStorage } from './saveTestUtils';

describe('save corruption and storage failures', () => {
  test('rejects checksum-tampered save data gracefully', () => {
    const storage = new MemoryStorage();
    const runtime = createScriptRuntimeState();
    const result = saveGameToStorage(storage, 'MAP_ROUTE2', createTestPlayer(), runtime);
    expect(result.ok).toBe(true);

    const raw = storage.getItem(DEFAULT_SAVE_SLOT_KEY);
    expect(raw).not.toBeNull();
    const envelope = JSON.parse(raw!) as { payload: { runtime: { vars: Record<string, number> } } };
    envelope.payload.runtime.vars.story = 99;
    storage.setItem(DEFAULT_SAVE_SLOT_KEY, JSON.stringify(envelope));

    expect(loadGameFromStorage(storage)).toBeNull();
  });

  test('reports localStorage quota failure without mutating save counter', () => {
    const runtime = createScriptRuntimeState();
    const result = saveGameToStorage(new ThrowingStorage(), 'MAP_ROUTE2', createTestPlayer(), runtime);

    expect(result.ok).toBe(false);
    expect(result.summary).toMatch(/quota|storage|failed/i);
    expect(result.saveIndex).toBe(0);
    expect(runtime.saveCounter).toBe(0);
  });

  test('rejects invalid saved state shape gracefully', () => {
    const storage = new MemoryStorage();
    storage.setItem(DEFAULT_SAVE_SLOT_KEY, JSON.stringify({ schemaVersion: 7, payload: { runtime: { party: [{}] } }, checksum: 'bad' }));

    expect(loadGameFromStorage(storage)).toBeNull();
  });
});
