// @vitest-environment node

import { describe, expect, test } from 'vitest';
import type {
  AudioAdapter,
  InputAdapter,
  RenderAdapter,
  StorageAdapter
} from '../src/api/adapters';
import type { InputSnapshot } from '../src/input/inputState';

const emptySnapshot = (): InputSnapshot => ({
  up: false,
  down: false,
  left: false,
  right: false,
  upPressed: false,
  downPressed: false,
  leftPressed: false,
  rightPressed: false,
  run: false,
  interact: false,
  interactPressed: false,
  start: false,
  startPressed: false,
  cancel: false,
  cancelPressed: false,
  select: false,
  selectPressed: false
});

describe('text API headless compatibility audit', () => {
  test('imports headless-safe modules in a Vitest node environment', async () => {
    const [inputState, saveData, saveMigration, saveValidation] = await Promise.all([
      import('../src/input/inputState'),
      import('../src/game/saveData'),
      import('../src/game/saveMigration'),
      import('../src/game/saveValidation')
    ]);

    expect(typeof inputState.BrowserInputAdapter).toBe('function');
    expect(typeof saveData.loadGameFromStorage).toBe('function');
    expect(typeof saveData.saveGameToStorage).toBe('function');
    expect(typeof saveMigration.migrateSavePayload).toBe('function');
    expect(typeof saveValidation.createSaveEnvelope).toBe('function');
  }, 30_000);

  test('documents known browser-only runtime modules', () => {
    const browserOnlyModules = [
      {
        module: 'src/main.ts',
        globals: ['document', 'window', 'localStorage']
      },
      {
        module: 'src/core/gameLoop.ts',
        globals: ['performance', 'requestAnimationFrame', 'cancelAnimationFrame']
      },
      {
        module: 'src/input/inputState.ts BrowserInputAdapter',
        globals: ['window', 'KeyboardEvent']
      },
      {
        module: 'src/rendering/canvasRenderer.ts',
        globals: ['HTMLCanvasElement', 'CanvasRenderingContext2D', 'Image', 'ImageData', 'document', 'fetch']
      },
      {
        module: 'src/audio/webAudioAdapter.ts',
        globals: ['window', 'AudioContext', 'webkitAudioContext']
      }
    ];

    expect(browserOnlyModules).toContainEqual({
      module: 'src/main.ts',
      globals: ['document', 'window', 'localStorage']
    });
    expect(browserOnlyModules.flatMap((entry) => entry.globals)).toEqual(
      expect.arrayContaining(['requestAnimationFrame', 'HTMLCanvasElement', 'AudioContext', 'KeyboardEvent'])
    );
  });

  test('adapter interfaces can be implemented for headless use', () => {
    class MemoryStorageAdapter implements StorageAdapter {
      private readonly values = new Map<string, string>();

      load(key: string): string | null {
        return this.values.get(key) ?? null;
      }

      save(key: string, value: string): void {
        this.values.set(key, value);
      }

      remove(key: string): void {
        this.values.delete(key);
      }
    }

    const audio: AudioAdapter = {
      consume: () => undefined,
      reset: () => undefined
    };
    const input: InputAdapter = {
      readSnapshot: emptySnapshot
    };
    const render: RenderAdapter<{ text: string }> = {
      resize: () => undefined,
      render: (frameState) => {
        expect(frameState.text).toBe('ready');
      }
    };

    const storage = new MemoryStorageAdapter();
    storage.save('slot', '{"ok":true}');

    expect(storage.load('slot')).toBe('{"ok":true}');
    storage.remove('slot');
    expect(storage.load('slot')).toBeNull();
    expect(input.readSnapshot().interactPressed).toBe(false);
    audio.consume([{ id: 'SE_SELECT' }]);
    audio.reset();
    render.resize(0, 0);
    render.render({ text: 'ready' });
  });
});
