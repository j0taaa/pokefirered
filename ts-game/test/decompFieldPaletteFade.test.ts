import { describe, expect, test } from 'vitest';
import {
  beginFieldFadeScreen,
  FADE_FROM_BLACK,
  FADE_TO_BLACK,
  getFieldPaletteFadeAlpha,
  updateFieldPaletteFade
} from '../src/game/decompFieldPaletteFade';
import { createScriptRuntimeState } from '../src/game/scripts';

const runFadeToIdle = (runtime: ReturnType<typeof createScriptRuntimeState>, limit = 64): void => {
  for (let i = 0; i < limit && runtime.fieldPaletteFade.active; i += 1) {
    updateFieldPaletteFade(runtime);
  }
};

describe('decompiled field palette fades', () => {
  test('FadeScreen to black preserves the final black palette after the fade task ends', () => {
    const runtime = createScriptRuntimeState();

    expect(beginFieldFadeScreen(runtime, FADE_TO_BLACK, 0)).toBe(true);
    expect(runtime.fieldPaletteFade.active).toBe(true);
    expect(runtime.fieldPaletteFade.y).toBe(0);

    runFadeToIdle(runtime);

    expect(runtime.fieldPaletteFade.active).toBe(false);
    expect(runtime.fieldPaletteFade.y).toBe(16);
    expect(getFieldPaletteFadeAlpha(runtime)).toBe(1);
  });

  test('FadeScreen from black clears the black palette after the fade task ends', () => {
    const runtime = createScriptRuntimeState();

    beginFieldFadeScreen(runtime, FADE_TO_BLACK, 0);
    runFadeToIdle(runtime);
    expect(beginFieldFadeScreen(runtime, FADE_FROM_BLACK, 0)).toBe(true);

    runFadeToIdle(runtime);

    expect(runtime.fieldPaletteFade.active).toBe(false);
    expect(runtime.fieldPaletteFade.y).toBe(0);
    expect(getFieldPaletteFadeAlpha(runtime)).toBe(0);
  });
});
