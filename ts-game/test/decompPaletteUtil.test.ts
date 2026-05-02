import { describe, expect, test } from 'vitest';
import {
  FLASHUTIL_USE_EXISTING_COLOR,
  ClearPulseBlendPalettesSettings,
  FillTilemapRect,
  InitPulseBlend,
  InitPulseBlendPaletteSettings,
  MarkUsedPulseBlendPalettes,
  RouletteFlash_Add,
  RouletteFlash_Enable,
  RouletteFlash_FadePalette,
  RouletteFlash_FlashPalette,
  RouletteFlash_Remove,
  RouletteFlash_Reset,
  RouletteFlash_Run,
  RouletteFlash_Stop,
  SetTilemapRect,
  UnloadUsedPulseBlendPalettes,
  UnmarkUsedPulseBlendPalettes,
  UpdatePulseBlend,
  blendPalette,
  createPaletteUtilRuntime,
  createPulseBlend,
  createRouletteFlashUtil,
  fillTilemapRect,
  initPulseBlend,
  initPulseBlendPaletteSettings,
  markUsedPulseBlendPalettes,
  plttB,
  plttG,
  plttR,
  rgb,
  rouletteFlashAdd,
  rouletteFlashEnable,
  rouletteFlashRemove,
  rouletteFlashReset,
  rouletteFlashRun,
  rouletteFlashStop,
  setTilemapRect,
  unloadUsedPulseBlendPalettes,
  unmarkUsedPulseBlendPalettes,
  updatePulseBlend
} from '../src/game/decompPaletteUtil';

const pulseSettings = (overrides = {}) => ({
  blendColor: rgb(31, 0, 0),
  paletteOffset: 4,
  numColors: 2,
  delay: 0,
  numFadeCycles: 0xff,
  maxBlendCoeff: 3,
  fadeType: 0,
  restorePaletteOnUnload: 1,
  unk7_7: 0,
  ...overrides
});

describe('decomp palette_util', () => {
  test('RouletteFlash_Reset, Add, Remove, and Enable preserve palette slot state', () => {
    const flash = createRouletteFlashUtil();
    flash.enabled = 4;
    flash.flags = 0xffff;
    rouletteFlashReset(flash);
    expect(flash.enabled).toBe(0);
    expect(flash.flags).toBe(0);
    expect(flash.palettes.every((palette) => palette.available === 0)).toBe(true);

    const id = rouletteFlashAdd(flash, 2, {
      color: rgb(1, 2, 3),
      paletteOffset: 10,
      numColors: 2,
      delay: 3,
      unk6: 7,
      numFadeCycles: 1,
      unk7_5: 2,
      colorDeltaDir: -1
    });
    expect(id).toBe(2);
    expect(rouletteFlashAdd(flash, 2, flash.palettes[2].settings)).toBe(0xff);
    expect(flash.palettes[2]).toMatchObject({
      state: 0,
      available: 1,
      fadeCycleCounter: 0,
      delayCounter: 0,
      colorDelta: -1
    });

    rouletteFlashEnable(flash, 1 << 2);
    expect(flash.enabled).toBe(1);
    expect(flash.flags).toBe(1 << 2);
    expect(flash.palettes[2].state).toBe(1);

    expect(rouletteFlashRemove(flash, 2)).toBe(2);
    expect(rouletteFlashRemove(flash, 2)).toBe(0xff);
  });

  test('RouletteFlash_Run flashes direct colors on delay underflow and Stop restores palettes', () => {
    const runtime = createPaletteUtilRuntime();
    const flash = createRouletteFlashUtil();
    runtime.plttBufferUnfaded[5] = rgb(5, 6, 7);
    runtime.plttBufferUnfaded[6] = rgb(8, 9, 10);
    runtime.plttBufferFaded[5] = runtime.plttBufferUnfaded[5];
    runtime.plttBufferFaded[6] = runtime.plttBufferUnfaded[6];

    rouletteFlashAdd(flash, 0, {
      color: rgb(30, 1, 2),
      paletteOffset: 5,
      numColors: 2,
      delay: 1,
      unk6: 0,
      numFadeCycles: 0,
      unk7_5: 0,
      colorDeltaDir: 0
    });
    rouletteFlashEnable(flash, 1);

    rouletteFlashRun(runtime, flash);
    expect(runtime.plttBufferFaded.slice(5, 7)).toEqual([rgb(30, 1, 2), rgb(30, 1, 2)]);
    expect(flash.palettes[0].state).toBe(2);
    expect(flash.palettes[0].delayCounter).toBe(1);

    rouletteFlashRun(runtime, flash);
    expect(runtime.plttBufferFaded.slice(5, 7)).toEqual([rgb(30, 1, 2), rgb(30, 1, 2)]);
    rouletteFlashRun(runtime, flash);
    expect(runtime.plttBufferFaded.slice(5, 7)).toEqual([rgb(5, 6, 7), rgb(8, 9, 10)]);

    runtime.plttBufferFaded[5] = rgb(1, 1, 1);
    rouletteFlashStop(runtime, flash, 1);
    expect(runtime.plttBufferFaded[5]).toBe(rgb(5, 6, 7));
    expect(flash.flags).toBe(0);
    rouletteFlashStop(runtime, flash, 0xffff);
    expect(flash.enabled).toBe(0);
  });

  test('RouletteFlash_Run fades channels against existing colors and reverses after cycle count', () => {
    const runtime = createPaletteUtilRuntime();
    const flash = createRouletteFlashUtil();
    runtime.plttBufferUnfaded[0] = rgb(10, 10, 10);
    runtime.plttBufferFaded[0] = rgb(10, 10, 10);

    rouletteFlashAdd(flash, 0, {
      color: FLASHUTIL_USE_EXISTING_COLOR,
      paletteOffset: 0,
      numColors: 1,
      delay: 0,
      unk6: 0,
      numFadeCycles: 1,
      unk7_5: 0,
      colorDeltaDir: 0
    });
    rouletteFlashEnable(flash, 1);

    rouletteFlashRun(runtime, flash);
    expect(runtime.plttBufferFaded[0]).toBe(rgb(11, 11, 11));
    expect(flash.palettes[0].state).toBe(1);
    rouletteFlashRun(runtime, flash);
    expect(runtime.plttBufferFaded[0]).toBe(rgb(12, 12, 12));
    expect(flash.palettes[0].state).toBe(2);
    expect(flash.palettes[0].colorDelta).toBe(-1);
    rouletteFlashRun(runtime, flash);
    expect(runtime.plttBufferFaded[0]).toBe(rgb(11, 11, 11));
  });

  test('InitPulseBlend and InitPulseBlendPaletteSettings choose the first free slot', () => {
    const pulseBlend = createPulseBlend();
    pulseBlend.usedPulseBlendPalettes = 99;
    initPulseBlend(pulseBlend);

    expect(pulseBlend.usedPulseBlendPalettes).toBe(0);
    expect(pulseBlend.pulseBlendPalettes.map((palette) => palette.paletteSelector)).toEqual(
      Array.from({ length: 16 }, (_unused, i) => i)
    );

    expect(initPulseBlendPaletteSettings(pulseBlend, pulseSettings({ paletteOffset: 1 }))).toBe(0);
    expect(initPulseBlendPaletteSettings(pulseBlend, pulseSettings({ paletteOffset: 2 }))).toBe(1);
    expect(pulseBlend.pulseBlendPalettes[0]).toMatchObject({
      blendCoeff: 0,
      fadeDirection: 0,
      available: 1,
      inUse: 1,
      delayCounter: 0,
      fadeCycleCounter: 0
    });
  });

  test('PulseBlend mark, unmark, unload, and restore follow original selector behavior', () => {
    const runtime = createPaletteUtilRuntime();
    const pulseBlend = createPulseBlend();
    initPulseBlend(pulseBlend);
    initPulseBlendPaletteSettings(pulseBlend, pulseSettings({ paletteOffset: 4, numColors: 2 }));
    initPulseBlendPaletteSettings(pulseBlend, pulseSettings({ paletteOffset: 8, numColors: 1 }));
    runtime.plttBufferUnfaded[4] = rgb(1, 2, 3);
    runtime.plttBufferUnfaded[5] = rgb(4, 5, 6);
    runtime.plttBufferUnfaded[8] = rgb(7, 8, 9);
    runtime.plttBufferFaded[4] = rgb(30, 30, 30);
    runtime.plttBufferFaded[5] = rgb(29, 29, 29);
    runtime.plttBufferFaded[8] = rgb(28, 28, 28);

    markUsedPulseBlendPalettes(pulseBlend, 1, 0);
    expect(pulseBlend.pulseBlendPalettes[1].available).toBe(0);
    expect(pulseBlend.usedPulseBlendPalettes).toBe(1 << 1);

    unmarkUsedPulseBlendPalettes(runtime, pulseBlend, 1, 0);
    expect(pulseBlend.pulseBlendPalettes[1].available).toBe(1);
    expect(pulseBlend.usedPulseBlendPalettes).toBe(1 << 1);
    expect(runtime.plttBufferFaded[8]).toBe(rgb(7, 8, 9));

    markUsedPulseBlendPalettes(pulseBlend, 0b10, 1);
    expect(pulseBlend.usedPulseBlendPalettes).toBe(1 << 1);
    markUsedPulseBlendPalettes(pulseBlend, 0b1, 1);
    expect(pulseBlend.usedPulseBlendPalettes).toBe(0b11);

    unloadUsedPulseBlendPalettes(runtime, pulseBlend, 0b01, 1);
    expect(pulseBlend.pulseBlendPalettes[0].inUse).toBe(0);
    expect(pulseBlend.pulseBlendPalettes[1].inUse).toBe(1);
    expect(runtime.plttBufferFaded[4]).toBe(rgb(1, 2, 3));
    expect(runtime.plttBufferFaded[5]).toBe(rgb(4, 5, 6));
  });

  test('UpdatePulseBlend runs fade types, honors palette fade gate, and auto-unmarks at cycle limit', () => {
    const runtime = createPaletteUtilRuntime();
    const pulseBlend = createPulseBlend();
    initPulseBlend(pulseBlend);
    runtime.plttBufferUnfaded[4] = rgb(0, 0, 0);
    runtime.plttBufferUnfaded[5] = rgb(16, 16, 16);

    initPulseBlendPaletteSettings(
      pulseBlend,
      pulseSettings({ fadeType: 1, maxBlendCoeff: 3, numFadeCycles: 1, unk7_7: 1 })
    );
    markUsedPulseBlendPalettes(pulseBlend, 0, 0);
    runtime.paletteFadeActive = true;
    updatePulseBlend(runtime, pulseBlend);
    expect(runtime.blendPaletteLog).toEqual([]);

    runtime.paletteFadeActive = false;
    updatePulseBlend(runtime, pulseBlend);
    expect(runtime.blendPaletteLog.at(-1)).toMatchObject({
      paletteOffset: 4,
      numColors: 2,
      coeff: 0,
      blendColor: rgb(31, 0, 0)
    });
    expect(pulseBlend.pulseBlendPalettes[0].blendCoeff).toBe(1);

    updatePulseBlend(runtime, pulseBlend);
    updatePulseBlend(runtime, pulseBlend);
    expect(pulseBlend.pulseBlendPalettes[0].fadeDirection).toBe(1);
    expect(pulseBlend.pulseBlendPalettes[0].available).toBe(1);
  });

  test('UpdatePulseBlend fade type 2 flips directly between zero and max coefficient', () => {
    const runtime = createPaletteUtilRuntime();
    const pulseBlend = createPulseBlend();
    initPulseBlend(pulseBlend);
    initPulseBlendPaletteSettings(
      pulseBlend,
      pulseSettings({ fadeType: 2, maxBlendCoeff: 9, numFadeCycles: 0xff })
    );
    markUsedPulseBlendPalettes(pulseBlend, 0, 0);

    updatePulseBlend(runtime, pulseBlend);
    expect(pulseBlend.pulseBlendPalettes[0].blendCoeff).toBe(9);
    expect(pulseBlend.pulseBlendPalettes[0].fadeDirection).toBe(1);
    updatePulseBlend(runtime, pulseBlend);
    expect(pulseBlend.pulseBlendPalettes[0].blendCoeff).toBe(0);
    expect(pulseBlend.pulseBlendPalettes[0].fadeDirection).toBe(0);
  });

  test('BlendPalette uses unfaded colors and 4-bit coefficient interpolation', () => {
    const runtime = createPaletteUtilRuntime();
    runtime.plttBufferUnfaded[3] = rgb(0, 16, 31);

    blendPalette(runtime, 3, 1, 8, rgb(16, 0, 15));
    expect(plttR(runtime.plttBufferFaded[3])).toBe(8);
    expect(plttG(runtime.plttBufferFaded[3])).toBe(8);
    expect(plttB(runtime.plttBufferFaded[3])).toBe(23);
  });

  test('FillTilemapRect and SetTilemapRect write row-major rectangles with 32-wide stride', () => {
    const dest = Array.from({ length: 32 * 4 }, () => 0);
    fillTilemapRect(dest, 7, 2, 1, 3, 2);
    expect(dest.slice(32 + 2, 32 + 5)).toEqual([7, 7, 7]);
    expect(dest.slice(64 + 2, 64 + 5)).toEqual([7, 7, 7]);
    expect(dest[32 + 1]).toBe(0);
    expect(dest[64 + 5]).toBe(0);

    setTilemapRect(dest, [1, 2, 3, 4, 5, 6], 0, 2, 3, 2);
    expect(dest.slice(64, 67)).toEqual([1, 2, 3]);
    expect(dest.slice(96, 99)).toEqual([4, 5, 6]);
  });

  test('exact C-name exports dispatch roulette flash, pulse blend, and tilemap helpers', () => {
    const runtime = createPaletteUtilRuntime();
    const flash = createRouletteFlashUtil();

    RouletteFlash_Reset(flash);
    expect(flash.enabled).toBe(0);
    expect(RouletteFlash_Add(flash, 0, {
      color: rgb(30, 1, 2),
      paletteOffset: 5,
      numColors: 1,
      delay: 0,
      unk6: 0,
      numFadeCycles: 0,
      unk7_5: 0,
      colorDeltaDir: 1
    })).toBe(0);
    RouletteFlash_Enable(flash, 1);
    expect(flash.flags).toBe(1);
    RouletteFlash_FlashPalette(runtime, flash.palettes[0]);
    expect(runtime.plttBufferFaded[5]).toBe(rgb(30, 1, 2));
    runtime.plttBufferUnfaded[5] = rgb(5, 6, 7);
    RouletteFlash_FlashPalette(runtime, flash.palettes[0]);
    expect(runtime.plttBufferFaded[5]).toBe(rgb(5, 6, 7));

    flash.palettes[0].settings.color = FLASHUTIL_USE_EXISTING_COLOR;
    flash.palettes[0].state = 1;
    flash.palettes[0].delayCounter = 0;
    runtime.plttBufferFaded[5] = rgb(10, 10, 10);
    RouletteFlash_FadePalette(runtime, flash.palettes[0]);
    expect(runtime.plttBufferFaded[5]).toBe(rgb(11, 11, 11));
    RouletteFlash_Run(runtime, flash);
    RouletteFlash_Stop(runtime, flash, 0xffff);
    expect(flash.enabled).toBe(0);
    expect(RouletteFlash_Remove(flash, 0)).toBe(0);

    const pulseBlend = createPulseBlend();
    InitPulseBlend(pulseBlend);
    const pulseId = InitPulseBlendPaletteSettings(pulseBlend, pulseSettings({ paletteOffset: 4, numColors: 1, fadeType: 2 }));
    expect(pulseId).toBe(0);
    MarkUsedPulseBlendPalettes(pulseBlend, 0, 0);
    expect(pulseBlend.usedPulseBlendPalettes).toBe(1);
    UpdatePulseBlend(runtime, pulseBlend);
    expect(runtime.blendPaletteLog.at(-1)).toMatchObject({ paletteOffset: 4, numColors: 1 });
    runtime.plttBufferUnfaded[4] = rgb(1, 2, 3);
    runtime.plttBufferFaded[4] = rgb(31, 31, 31);
    UnmarkUsedPulseBlendPalettes(runtime, pulseBlend, 0, 0);
    expect(pulseBlend.pulseBlendPalettes[0].available).toBe(1);
    MarkUsedPulseBlendPalettes(pulseBlend, 0, 0);
    ClearPulseBlendPalettesSettings(runtime, pulseBlend.pulseBlendPalettes[0]);
    expect(pulseBlend.pulseBlendPalettes[0].inUse).toBe(0);

    InitPulseBlendPaletteSettings(pulseBlend, pulseSettings({ paletteOffset: 6, numColors: 1 }));
    MarkUsedPulseBlendPalettes(pulseBlend, 0, 0);
    UnloadUsedPulseBlendPalettes(runtime, pulseBlend, 0, 0);
    expect(pulseBlend.pulseBlendPalettes[0].inUse).toBe(0);

    const dest = Array.from({ length: 32 * 4 }, () => 0);
    FillTilemapRect(dest, 9, 1, 1, 2, 2);
    expect(dest.slice(33, 35)).toEqual([9, 9]);
    SetTilemapRect(dest, [1, 2, 3, 4], 0, 2, 2, 2);
    expect(dest.slice(64, 66)).toEqual([1, 2]);
    expect(dest.slice(96, 98)).toEqual([3, 4]);
  });
});
