export const FLASHUTIL_USE_EXISTING_COLOR = 1 << 15;
export const PULSE_BLEND_PALETTE_COUNT = 16;
export const ROULETTE_FLASH_PALETTE_COUNT = 16;
export const PLTT_BUFFER_SIZE = 256;

export interface PulseBlendSettings {
  blendColor: number;
  paletteOffset: number;
  numColors: number;
  delay: number;
  numFadeCycles: number;
  maxBlendCoeff: number;
  fadeType: number;
  restorePaletteOnUnload: number;
  unk7_7: number;
}

export interface PulseBlendPalette {
  paletteSelector: number;
  blendCoeff: number;
  fadeDirection: number;
  unk1_5: number;
  available: number;
  inUse: number;
  delayCounter: number;
  fadeCycleCounter: number;
  pulseBlendSettings: PulseBlendSettings;
}

export interface PulseBlend {
  usedPulseBlendPalettes: number;
  pulseBlendPalettes: PulseBlendPalette[];
}

export interface RouletteFlashSettings {
  color: number;
  paletteOffset: number;
  numColors: number;
  delay: number;
  unk6: number;
  numFadeCycles: number;
  unk7_5: number;
  colorDeltaDir: number;
}

export interface RouletteFlashPalette {
  state: number;
  available: number;
  delayCounter: number;
  fadeCycleCounter: number;
  colorDelta: number;
  settings: RouletteFlashSettings;
}

export interface RouletteFlashUtil {
  enabled: number;
  unused: number;
  flags: number;
  palettes: RouletteFlashPalette[];
}

export interface PaletteUtilRuntime {
  plttBufferFaded: number[];
  plttBufferUnfaded: number[];
  paletteFadeActive: boolean;
  blendPaletteLog: Array<{ paletteOffset: number; numColors: number; coeff: number; blendColor: number }>;
}

const emptyRouletteFlashSettings = (): RouletteFlashSettings => ({
  color: 0,
  paletteOffset: 0,
  numColors: 0,
  delay: 0,
  unk6: 0,
  numFadeCycles: 0,
  unk7_5: 0,
  colorDeltaDir: 0
});

const emptyRouletteFlashPalette = (): RouletteFlashPalette => ({
  state: 0,
  available: 0,
  delayCounter: 0,
  fadeCycleCounter: 0,
  colorDelta: 0,
  settings: emptyRouletteFlashSettings()
});

const emptyPulseBlendSettings = (): PulseBlendSettings => ({
  blendColor: 0,
  paletteOffset: 0,
  numColors: 0,
  delay: 0,
  numFadeCycles: 0,
  maxBlendCoeff: 0,
  fadeType: 0,
  restorePaletteOnUnload: 0,
  unk7_7: 0
});

const emptyPulseBlendPalette = (paletteSelector = 0): PulseBlendPalette => ({
  paletteSelector,
  blendCoeff: 0,
  fadeDirection: 0,
  unk1_5: 0,
  available: 0,
  inUse: 0,
  delayCounter: 0,
  fadeCycleCounter: 0,
  pulseBlendSettings: emptyPulseBlendSettings()
});

export const rgb = (r: number, g: number, b: number): number =>
  (r & 0x1f) | ((g & 0x1f) << 5) | ((b & 0x1f) << 10);

export const plttR = (color: number): number => color & 0x1f;
export const plttG = (color: number): number => (color >> 5) & 0x1f;
export const plttB = (color: number): number => (color >> 10) & 0x1f;

const setChannel = (color: number, shift: number, value: number): number =>
  (color & ~(0x1f << shift)) | ((value & 0x1f) << shift);

const setR = (color: number, value: number): number => setChannel(color, 0, value);
const setG = (color: number, value: number): number => setChannel(color, 5, value);
const setB = (color: number, value: number): number => setChannel(color, 10, value);

const u8 = (value: number): number => value & 0xff;

export const createPaletteUtilRuntime = (): PaletteUtilRuntime => ({
  plttBufferFaded: Array.from({ length: PLTT_BUFFER_SIZE }, () => 0),
  plttBufferUnfaded: Array.from({ length: PLTT_BUFFER_SIZE }, () => 0),
  paletteFadeActive: false,
  blendPaletteLog: []
});

export const createRouletteFlashUtil = (): RouletteFlashUtil => ({
  enabled: 0,
  unused: 0,
  flags: 0,
  palettes: Array.from({ length: ROULETTE_FLASH_PALETTE_COUNT }, () =>
    emptyRouletteFlashPalette()
  )
});

export const createPulseBlend = (): PulseBlend => ({
  usedPulseBlendPalettes: 0,
  pulseBlendPalettes: Array.from({ length: PULSE_BLEND_PALETTE_COUNT }, (_unused, i) =>
    emptyPulseBlendPalette(i)
  )
});

export function RouletteFlash_Reset(flash: RouletteFlashUtil): void {
  flash.enabled = 0;
  flash.flags = 0;
  flash.palettes = Array.from({ length: ROULETTE_FLASH_PALETTE_COUNT }, () =>
    emptyRouletteFlashPalette()
  );
}

export function RouletteFlash_Add(
  flash: RouletteFlashUtil,
  id: number,
  settings: RouletteFlashSettings
): number {
  if (id >= flash.palettes.length || flash.palettes[id].available) {
    return 0xff;
  }

  flash.palettes[id].settings = { ...settings };
  flash.palettes[id].state = 0;
  flash.palettes[id].available = 1;
  flash.palettes[id].fadeCycleCounter = 0;
  flash.palettes[id].delayCounter = 0;
  if (flash.palettes[id].settings.colorDeltaDir < 0) {
    flash.palettes[id].colorDelta = -1;
  } else {
    flash.palettes[id].colorDelta = 1;
  }

  return id;
}

export function RouletteFlash_Remove(flash: RouletteFlashUtil, id: number): number {
  if (id >= flash.palettes.length) {
    return 0xff;
  }
  if (!flash.palettes[id].available) {
    return 0xff;
  }

  flash.palettes[id] = emptyRouletteFlashPalette();
  return id;
}

export function RouletteFlash_FadePalette(
  runtime: PaletteUtilRuntime,
  pal: RouletteFlashPalette
): number {
  for (let i = 0; i < pal.settings.numColors; i += 1) {
    const index = pal.settings.paletteOffset + i;
    let faded = runtime.plttBufferFaded[index];
    const unfaded = runtime.plttBufferUnfaded[index];

    switch (pal.state) {
      case 1: {
        const r = plttR(faded) + pal.colorDelta;
        const g = plttG(faded) + pal.colorDelta;
        const b = plttB(faded) + pal.colorDelta;
        if (r >= 0 && r < 32) {
          faded = setR(faded, r);
        }
        if (g >= 0 && g < 32) {
          faded = setG(faded, g);
        }
        if (b >= 0 && b < 32) {
          faded = setB(faded, b);
        }
        break;
      }
      case 2:
        if (pal.colorDelta < 0) {
          const r = plttR(faded) + pal.colorDelta;
          const g = plttG(faded) + pal.colorDelta;
          const b = plttB(faded) + pal.colorDelta;
          if (r >= plttR(unfaded)) {
            faded = setR(faded, r);
          }
          if (g >= plttG(unfaded)) {
            faded = setG(faded, g);
          }
          if (b >= plttB(unfaded)) {
            faded = setB(faded, b);
          }
        } else {
          const r = plttR(faded) + pal.colorDelta;
          const g = plttG(faded) + pal.colorDelta;
          const b = plttB(faded) + pal.colorDelta;
          if (r <= plttR(unfaded)) {
            faded = setR(faded, r);
          }
          if (g <= plttG(unfaded)) {
            faded = setG(faded, g);
          }
          if (b <= plttB(unfaded)) {
            faded = setB(faded, b);
          }
        }
        break;
    }
    runtime.plttBufferFaded[index] = faded;
  }

  const oldFadeCycleCounter = pal.fadeCycleCounter;
  pal.fadeCycleCounter += 1;
  if (oldFadeCycleCounter !== pal.settings.numFadeCycles) {
    return 0;
  }

  pal.fadeCycleCounter = 0;
  pal.colorDelta *= -1;
  if (pal.state === 1) {
    pal.state += 1;
  } else {
    pal.state -= 1;
  }
  return 1;
}

export function RouletteFlash_FlashPalette(
  runtime: PaletteUtilRuntime,
  pal: RouletteFlashPalette
): number {
  switch (pal.state) {
    case 1:
      for (let i = 0; i < pal.settings.numColors; i += 1) {
        runtime.plttBufferFaded[pal.settings.paletteOffset + i] = pal.settings.color;
      }
      pal.state += 1;
      break;
    case 2:
      for (let i = 0; i < pal.settings.numColors; i += 1) {
        runtime.plttBufferFaded[pal.settings.paletteOffset + i] =
          runtime.plttBufferUnfaded[pal.settings.paletteOffset + i];
      }
      pal.state -= 1;
      break;
  }
  return 1;
}

export function RouletteFlash_Run(
  runtime: PaletteUtilRuntime,
  flash: RouletteFlashUtil
): void {
  if (flash.enabled) {
    for (let i = 0; i < flash.palettes.length; i += 1) {
      if ((flash.flags >> i) & 1) {
        flash.palettes[i].delayCounter = u8(flash.palettes[i].delayCounter - 1);
        if (flash.palettes[i].delayCounter === 0xff) {
          if (flash.palettes[i].settings.color & FLASHUTIL_USE_EXISTING_COLOR) {
            RouletteFlash_FadePalette(runtime, flash.palettes[i]);
          } else {
            RouletteFlash_FlashPalette(runtime, flash.palettes[i]);
          }

          flash.palettes[i].delayCounter = flash.palettes[i].settings.delay;
        }
      }
    }
  }
}

export function RouletteFlash_Enable(flash: RouletteFlashUtil, flags: number): void {
  flash.enabled += 1;
  for (let i = 0; i < flash.palettes.length; i += 1) {
    if ((flags >> i) & 1) {
      if (flash.palettes[i].available) {
        flash.flags |= 1 << i;
        flash.palettes[i].state = 1;
      }
    }
  }
}

export function RouletteFlash_Stop(
  runtime: PaletteUtilRuntime,
  flash: RouletteFlashUtil,
  flags: number
): void {
  for (let i = 0; i < flash.palettes.length; i += 1) {
    if ((flash.flags >> i) & 1) {
      if (flash.palettes[i].available) {
        if ((flags >> i) & 1) {
          const offset = flash.palettes[i].settings.paletteOffset;
          for (let j = 0; j < flash.palettes[i].settings.numColors; j += 1) {
            runtime.plttBufferFaded[offset + j] = runtime.plttBufferUnfaded[offset + j];
          }
          flash.palettes[i].state = 0;
          flash.palettes[i].fadeCycleCounter = 0;
          flash.palettes[i].delayCounter = 0;
          if (flash.palettes[i].settings.colorDeltaDir < 0) {
            flash.palettes[i].colorDelta = -1;
          } else {
            flash.palettes[i].colorDelta = 1;
          }
        }
      }
    }
  }
  if (flags === 0xffff) {
    flash.enabled = 0;
    flash.flags = 0;
  } else {
    flash.flags &= ~flags;
  }
}

export function InitPulseBlend(pulseBlend: PulseBlend): void {
  pulseBlend.usedPulseBlendPalettes = 0;
  pulseBlend.pulseBlendPalettes = Array.from(
    { length: PULSE_BLEND_PALETTE_COUNT },
    (_unused, i) => emptyPulseBlendPalette(i)
  );
}

export function InitPulseBlendPaletteSettings(
  pulseBlend: PulseBlend,
  settings: PulseBlendSettings
): number {
  let i = 0;
  let pulseBlendPalette: PulseBlendPalette | null = null;

  if (!pulseBlend.pulseBlendPalettes[0].inUse) {
    pulseBlendPalette = pulseBlend.pulseBlendPalettes[0];
  } else {
    while (++i < PULSE_BLEND_PALETTE_COUNT) {
      if (!pulseBlend.pulseBlendPalettes[i].inUse) {
        pulseBlendPalette = pulseBlend.pulseBlendPalettes[i];
        break;
      }
    }
  }

  if (pulseBlendPalette === null) {
    return 0xff;
  }

  pulseBlendPalette.blendCoeff = 0;
  pulseBlendPalette.fadeDirection = 0;
  pulseBlendPalette.available = 1;
  pulseBlendPalette.inUse = 1;
  pulseBlendPalette.delayCounter = 0;
  pulseBlendPalette.fadeCycleCounter = 0;
  pulseBlendPalette.pulseBlendSettings = { ...settings };
  return i;
}

export function ClearPulseBlendPalettesSettings(
  runtime: PaletteUtilRuntime,
  pulseBlendPalette: PulseBlendPalette
): void {
  if (!pulseBlendPalette.available && pulseBlendPalette.pulseBlendSettings.restorePaletteOnUnload) {
    for (
      let i = pulseBlendPalette.pulseBlendSettings.paletteOffset;
      i <
      pulseBlendPalette.pulseBlendSettings.paletteOffset +
        pulseBlendPalette.pulseBlendSettings.numColors;
      i += 1
    ) {
      runtime.plttBufferFaded[i] = runtime.plttBufferUnfaded[i];
    }
  }

  pulseBlendPalette.pulseBlendSettings = emptyPulseBlendSettings();
  pulseBlendPalette.blendCoeff = 0;
  pulseBlendPalette.fadeDirection = 0;
  pulseBlendPalette.unk1_5 = 0;
  pulseBlendPalette.available = 1;
  pulseBlendPalette.inUse = 0;
  pulseBlendPalette.fadeCycleCounter = 0;
  pulseBlendPalette.delayCounter = 0;
}

export function UnloadUsedPulseBlendPalettes(
  runtime: PaletteUtilRuntime,
  pulseBlend: PulseBlend,
  pulseBlendPaletteSelector: number,
  multiSelection: number
): void {
  if (!multiSelection) {
    ClearPulseBlendPalettesSettings(
      runtime,
      pulseBlend.pulseBlendPalettes[pulseBlendPaletteSelector & 0xf]
    );
  } else {
    let selector = pulseBlendPaletteSelector;
    for (let i = 0; i < PULSE_BLEND_PALETTE_COUNT; i += 1) {
      if ((selector & 1) && pulseBlend.pulseBlendPalettes[i].inUse) {
        ClearPulseBlendPalettesSettings(runtime, pulseBlend.pulseBlendPalettes[i]);
      }

      selector >>= 1;
    }
  }
}

export function MarkUsedPulseBlendPalettes(
  pulseBlend: PulseBlend,
  pulseBlendPaletteSelector: number,
  multiSelection: number
): void {
  if (!multiSelection) {
    const i = pulseBlendPaletteSelector & 0xf;
    pulseBlend.pulseBlendPalettes[i].available = 0;
    pulseBlend.usedPulseBlendPalettes |= 1 << i;
  } else {
    let selector = pulseBlendPaletteSelector;
    for (let i = 0; i < PULSE_BLEND_PALETTE_COUNT; i += 1) {
      if (
        !(selector & 1) ||
        !pulseBlend.pulseBlendPalettes[i].inUse ||
        !pulseBlend.pulseBlendPalettes[i].available
      ) {
        selector <<= 1;
      } else {
        pulseBlend.pulseBlendPalettes[i].available = 0;
        pulseBlend.usedPulseBlendPalettes |= 1 << i;
      }
    }
  }
}

export function UnmarkUsedPulseBlendPalettes(
  runtime: PaletteUtilRuntime,
  pulseBlend: PulseBlend,
  pulseBlendPaletteSelector: number,
  multiSelection: number
): void {
  if (!multiSelection) {
    const pulseBlendPalette = pulseBlend.pulseBlendPalettes[pulseBlendPaletteSelector & 0xf];
    let j = 0;
    if (!pulseBlendPalette.available && pulseBlendPalette.inUse) {
      if (pulseBlendPalette.pulseBlendSettings.restorePaletteOnUnload) {
        for (
          let i = pulseBlendPalette.pulseBlendSettings.paletteOffset;
          i <
          pulseBlendPalette.pulseBlendSettings.paletteOffset +
            pulseBlendPalette.pulseBlendSettings.numColors;
          i += 1
        ) {
          runtime.plttBufferFaded[i] = runtime.plttBufferUnfaded[i];
        }
      }

      pulseBlendPalette.available = 1;
      pulseBlend.usedPulseBlendPalettes &= ~(1 << j);
    }
  } else {
    let selector = pulseBlendPaletteSelector;
    for (let j = 0; j < PULSE_BLEND_PALETTE_COUNT; j += 1) {
      const pulseBlendPalette = pulseBlend.pulseBlendPalettes[j];
      if (!(selector & 1) || pulseBlendPalette.available || !pulseBlendPalette.inUse) {
        selector <<= 1;
      } else {
        if (pulseBlendPalette.pulseBlendSettings.restorePaletteOnUnload) {
          for (
            let i = pulseBlendPalette.pulseBlendSettings.paletteOffset;
            i <
            pulseBlendPalette.pulseBlendSettings.paletteOffset +
              pulseBlendPalette.pulseBlendSettings.numColors;
            i += 1
          ) {
            runtime.plttBufferFaded[i] = runtime.plttBufferUnfaded[i];
          }
        }

        pulseBlendPalette.available = 1;
        pulseBlend.usedPulseBlendPalettes &= ~(1 << j);
      }
    }
  }
}

export const blendPalette = (
  runtime: PaletteUtilRuntime,
  paletteOffset: number,
  numColors: number,
  coeff: number,
  blendColor: number
): void => {
  runtime.blendPaletteLog.push({ paletteOffset, numColors, coeff, blendColor });
  for (let i = 0; i < numColors; i += 1) {
    const index = i + paletteOffset;
    const color = runtime.plttBufferUnfaded[index];
    const r = plttR(color);
    const g = plttG(color);
    const b = plttB(color);
    const r2 = plttR(blendColor);
    const g2 = plttG(blendColor);
    const b2 = plttB(blendColor);
    runtime.plttBufferFaded[index] = rgb(
      r + (((r2 - r) * coeff) >> 4),
      g + (((g2 - g) * coeff) >> 4),
      b + (((b2 - b) * coeff) >> 4)
    );
  }
};

export function UpdatePulseBlend(
  runtime: PaletteUtilRuntime,
  pulseBlend: PulseBlend
): void {
  if (pulseBlend.usedPulseBlendPalettes) {
    for (let i = 0; i < PULSE_BLEND_PALETTE_COUNT; i += 1) {
      const pulseBlendPalette = pulseBlend.pulseBlendPalettes[i];
      if (
        !pulseBlendPalette.available &&
        pulseBlendPalette.inUse &&
        (!runtime.paletteFadeActive || !pulseBlendPalette.pulseBlendSettings.unk7_7)
      ) {
        pulseBlendPalette.delayCounter = u8(pulseBlendPalette.delayCounter - 1);
        if (pulseBlendPalette.delayCounter === 0xff) {
          pulseBlendPalette.delayCounter = pulseBlendPalette.pulseBlendSettings.delay;
          blendPalette(
            runtime,
            pulseBlendPalette.pulseBlendSettings.paletteOffset,
            pulseBlendPalette.pulseBlendSettings.numColors,
            pulseBlendPalette.blendCoeff,
            pulseBlendPalette.pulseBlendSettings.blendColor
          );
          switch (pulseBlendPalette.pulseBlendSettings.fadeType) {
            case 0:
              if (
                pulseBlendPalette.blendCoeff++ ===
                pulseBlendPalette.pulseBlendSettings.maxBlendCoeff
              ) {
                pulseBlendPalette.fadeCycleCounter += 1;
                pulseBlendPalette.blendCoeff = 0;
              }
              pulseBlendPalette.blendCoeff &= 0xf;
              break;
            case 1:
              if (pulseBlendPalette.fadeDirection) {
                pulseBlendPalette.blendCoeff = (pulseBlendPalette.blendCoeff - 1) & 0xf;
                if (pulseBlendPalette.blendCoeff === 0) {
                  pulseBlendPalette.fadeCycleCounter += 1;
                  pulseBlendPalette.fadeDirection ^= 1;
                }
              } else {
                const max = (pulseBlendPalette.pulseBlendSettings.maxBlendCoeff - 1) & 0xf;
                const oldBlendCoeff = pulseBlendPalette.blendCoeff;
                pulseBlendPalette.blendCoeff = (pulseBlendPalette.blendCoeff + 1) & 0xf;
                if (oldBlendCoeff === max) {
                  pulseBlendPalette.fadeCycleCounter += 1;
                  pulseBlendPalette.fadeDirection ^= 1;
                }
              }
              break;
            case 2:
              if (pulseBlendPalette.fadeDirection) {
                pulseBlendPalette.blendCoeff = 0;
              } else {
                pulseBlendPalette.blendCoeff =
                  pulseBlendPalette.pulseBlendSettings.maxBlendCoeff & 0xf;
              }

              pulseBlendPalette.fadeDirection ^= 1;
              pulseBlendPalette.fadeCycleCounter += 1;
              break;
          }

          if (
            pulseBlendPalette.pulseBlendSettings.numFadeCycles !== 0xff &&
            pulseBlendPalette.fadeCycleCounter ===
              pulseBlendPalette.pulseBlendSettings.numFadeCycles
          ) {
            UnmarkUsedPulseBlendPalettes(runtime, pulseBlend, pulseBlendPalette.paletteSelector, 0);
          }
        }
      }
    }
  }
}

export function FillTilemapRect(
  dest: number[],
  src: number,
  left: number,
  top: number,
  width: number,
  height: number
): void {
  const start = top * 32 + left;
  for (let i = 0; i < height; i += 1) {
    let destIndex = start + i * 32;
    for (let j = 0; j < width; j += 1) {
      dest[destIndex++] = src;
    }
  }
}

export function SetTilemapRect(
  dest: number[],
  src: number[],
  left: number,
  top: number,
  width: number,
  height: number
): void {
  let srcIndex = 0;
  const start = top * 32 + left;
  for (let i = 0; i < height; i += 1) {
    let destIndex = start + i * 32;
    for (let j = 0; j < width; j += 1) {
      dest[destIndex++] = src[srcIndex++];
    }
  }
}

export const rouletteFlashReset = RouletteFlash_Reset;
export const rouletteFlashAdd = RouletteFlash_Add;
export const rouletteFlashRemove = RouletteFlash_Remove;
export const rouletteFlashFadePalette = RouletteFlash_FadePalette;
export const rouletteFlashFlashPalette = RouletteFlash_FlashPalette;
export const rouletteFlashRun = RouletteFlash_Run;
export const rouletteFlashEnable = RouletteFlash_Enable;
export const rouletteFlashStop = RouletteFlash_Stop;
export const initPulseBlend = InitPulseBlend;
export const initPulseBlendPaletteSettings = InitPulseBlendPaletteSettings;
export const clearPulseBlendPalettesSettings = ClearPulseBlendPalettesSettings;
export const unloadUsedPulseBlendPalettes = UnloadUsedPulseBlendPalettes;
export const markUsedPulseBlendPalettes = MarkUsedPulseBlendPalettes;
export const unmarkUsedPulseBlendPalettes = UnmarkUsedPulseBlendPalettes;
export const updatePulseBlend = UpdatePulseBlend;
export const fillTilemapRect = FillTilemapRect;
export const setTilemapRect = SetTilemapRect;
