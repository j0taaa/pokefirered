import { describe, expect, test } from 'vitest';
import { createScriptRuntimeState } from '../src/game/scripts';
import { playFieldFanfare, updateFieldFanfare } from '../src/game/decompFieldSound';

const MUS_LEVEL_UP = 257;
const MUS_OBTAIN_KEY_ITEM = 318;

const runFanfareToIdle = (runtime: ReturnType<typeof createScriptRuntimeState>, limit = 256): void => {
  for (let i = 0; i < limit && runtime.fieldAudio.fanfareTaskActive; i += 1) {
    updateFieldFanfare(runtime);
  }
};

describe('decompiled field fanfare task', () => {
  test('PlayFanfare uses the decompiled key-item duration and wait task clears it', () => {
    const runtime = createScriptRuntimeState();

    playFieldFanfare(runtime, MUS_OBTAIN_KEY_ITEM);

    expect(runtime.fieldAudio.fanfareTaskActive).toBe(true);
    expect(runtime.fieldAudio.fanfareCounter).toBe(170);
    expect(runtime.fieldAudio.bgmPausedForFanfare).toBe(true);

    runFanfareToIdle(runtime);

    expect(runtime.fieldAudio.fanfareTaskActive).toBe(false);
    expect(runtime.fieldAudio.bgmPausedForFanfare).toBe(false);
    expect(runtime.fieldAudio.playedFanfares).toEqual([MUS_OBTAIN_KEY_ITEM]);
  });

  test('unknown fanfare songs fall back to the first decompiled fanfare entry', () => {
    const runtime = createScriptRuntimeState();

    playFieldFanfare(runtime, 9999);

    expect(runtime.fieldAudio.fanfareSong).toBe(MUS_LEVEL_UP);
    expect(runtime.fieldAudio.fanfareCounter).toBe(80);
  });
});
