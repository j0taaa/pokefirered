import type { ScriptRuntimeState } from './scripts';

export const FADE_FROM_BLACK = 0;
export const FADE_TO_BLACK = 1;
export const FADE_FROM_WHITE = 2;
export const FADE_TO_WHITE = 3;

export type FieldFadeMode =
  | typeof FADE_FROM_BLACK
  | typeof FADE_TO_BLACK
  | typeof FADE_FROM_WHITE
  | typeof FADE_TO_WHITE;

export interface FieldPaletteFadeState {
  active: boolean;
  softwareFadeFinishing: boolean;
  softwareFadeFinishingCounter: number;
  objPaletteToggle: 0 | 1;
  delay: number;
  delayCounter: number;
  y: number;
  targetY: number;
  deltaY: number;
  yDec: boolean;
  blendColor: 'black' | 'white';
}

export const createFieldPaletteFadeState = (): FieldPaletteFadeState => ({
  active: false,
  softwareFadeFinishing: false,
  softwareFadeFinishingCounter: 0,
  objPaletteToggle: 0,
  delay: 0,
  delayCounter: 0,
  y: 0,
  targetY: 0,
  deltaY: 2,
  yDec: false,
  blendColor: 'black'
});

const clampBlendY = (value: number): number => Math.max(0, Math.min(16, value));

const updateSoftwarePaletteFadeFinishing = (fade: FieldPaletteFadeState): boolean => {
  if (!fade.softwareFadeFinishing) {
    return false;
  }

  if (fade.softwareFadeFinishingCounter === 4) {
    fade.active = false;
    fade.softwareFadeFinishing = false;
    fade.softwareFadeFinishingCounter = 0;
  } else {
    fade.softwareFadeFinishingCounter += 1;
  }
  return true;
};

export const updateFieldPaletteFade = (runtime: ScriptRuntimeState): boolean => {
  const fade = runtime.fieldPaletteFade;
  if (!fade.active) {
    return false;
  }
  if (updateSoftwarePaletteFadeFinishing(fade)) {
    return fade.active;
  }

  if (!fade.objPaletteToggle) {
    if (fade.delayCounter < fade.delay) {
      fade.delayCounter += 1;
      return true;
    }
    fade.delayCounter = 0;
  }

  fade.objPaletteToggle = fade.objPaletteToggle ? 0 : 1;
  if (!fade.objPaletteToggle) {
    if (fade.y === fade.targetY) {
      fade.softwareFadeFinishing = true;
    } else if (!fade.yDec) {
      fade.y = Math.min(fade.targetY, fade.y + fade.deltaY);
    } else {
      fade.y = Math.max(fade.targetY, fade.y - fade.deltaY);
    }
  }

  return fade.active;
};

export const beginFieldFadeScreen = (
  runtime: ScriptRuntimeState,
  mode: FieldFadeMode,
  delay: number
): boolean => {
  const fade = runtime.fieldPaletteFade;
  if (fade.active) {
    return false;
  }

  let startY: number;
  let targetY: number;
  let blendColor: FieldPaletteFadeState['blendColor'];
  switch (mode) {
    case FADE_FROM_BLACK:
      startY = 16;
      targetY = 0;
      blendColor = 'black';
      break;
    case FADE_TO_BLACK:
      startY = 0;
      targetY = 16;
      blendColor = 'black';
      break;
    case FADE_FROM_WHITE:
      startY = 16;
      targetY = 0;
      blendColor = 'white';
      break;
    case FADE_TO_WHITE:
      startY = 0;
      targetY = 16;
      blendColor = 'white';
      break;
    default:
      return false;
  }

  let normalizedDelay = Math.trunc(delay);
  let deltaY = 2;
  if (normalizedDelay < 0) {
    deltaY += normalizedDelay * -1;
    normalizedDelay = 0;
  }

  fade.deltaY = deltaY;
  fade.delayCounter = normalizedDelay;
  fade.delay = normalizedDelay;
  fade.y = clampBlendY(startY);
  fade.targetY = clampBlendY(targetY);
  fade.blendColor = blendColor;
  fade.active = true;
  fade.softwareFadeFinishing = false;
  fade.softwareFadeFinishingCounter = 0;
  fade.objPaletteToggle = 0;
  fade.yDec = startY >= targetY;
  updateFieldPaletteFade(runtime);
  return true;
};

export const getFieldPaletteFadeAlpha = (runtime: ScriptRuntimeState): number =>
  clampBlendY(runtime.fieldPaletteFade.y) / 16;
