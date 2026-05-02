import { describe, expect, test } from 'vitest';
import {
  BeginFastPaletteFade,
  BeginHardwarePaletteFade,
  BeginNormalPaletteFade,
  BlendPalette,
  BlendPalettes,
  BlendPalettesGradually,
  CopyPaletteInvertedTint,
  FAST_FADE_IN_FROM_BLACK,
  FAST_FADE_OUT_TO_WHITE,
  FillPalette,
  IsBlendPalettesGraduallyTaskActive,
  LoadCompressedPalette,
  LoadPalette,
  OBJ_PLTT_OFFSET,
  PALETTE_FADE_STATUS_ACTIVE,
  PALETTE_FADE_STATUS_DONE,
  PALETTE_FADE_STATUS_LOADING,
  PALETTES_ALL,
  PALETTES_BG,
  PLTT_BUFFER_SIZE,
  PLTT_SIZE,
  PaletteStruct_Run,
  PaletteStruct_SetUnusedFlag,
  RGB,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_BLDY,
  RunTasks,
  TintPalette_GrayScale,
  TintPalette_GrayScale2,
  TintPalette_SepiaTone,
  TintPlttBuffer,
  TransferPlttBuffer,
  UnfadePlttBuffer,
  UpdatePaletteFade,
  createDecompPaletteRuntime
} from '../src/game/decompPalette';

const fillRamp = (runtime: ReturnType<typeof createDecompPaletteRuntime>): void => {
  for (let i = 0; i < PLTT_BUFFER_SIZE; i++) {
    runtime.gPlttBufferUnfaded[i] = RGB(i & 31, (i + 3) & 31, (i + 7) & 31);
    runtime.gPlttBufferFaded[i] = runtime.gPlttBufferUnfaded[i];
  }
};

describe('decomp palette.c parity', () => {
  test('loads, fills, decompresses, and transfers palette buffers in halfword counts', () => {
    const runtime = createDecompPaletteRuntime();
    LoadPalette(runtime, [0x1111, 0x2222, 0x3333], 4, 6);
    expect([...runtime.gPlttBufferUnfaded.slice(4, 7)]).toEqual([0x1111, 0x2222, 0x3333]);
    expect([...runtime.gPlttBufferFaded.slice(4, 7)]).toEqual([0x1111, 0x2222, 0x3333]);

    FillPalette(runtime, 0x7c1f, 8, 4);
    expect([...runtime.gPlttBufferUnfaded.slice(8, 10)]).toEqual([0x7c1f, 0x7c1f]);
    expect([...runtime.gPlttBufferFaded.slice(8, 10)]).toEqual([0x7c1f, 0x7c1f]);

    runtime.decompressPalette = (_src, dest) => {
      dest[0] = 0x0001;
      dest[1] = 0x0002;
    };
    LoadCompressedPalette(runtime, [0xbeef], 12, 4);
    expect([...runtime.gPlttBufferFaded.slice(12, 14)]).toEqual([1, 2]);

    TransferPlttBuffer(runtime);
    expect([...runtime.pltt.slice(0, 14)]).toEqual([...runtime.gPlttBufferFaded.slice(0, 14)]);
  });

  test('normal fade splits BG and OBJ palettes and obeys pending-transfer loading', () => {
    const runtime = createDecompPaletteRuntime();
    fillRamp(runtime);
    expect(BeginNormalPaletteFade(runtime, (1 << 0) | (1 << 16), -2, 0, 8, RGB(31, 0, 0))).toBe(true);
    expect(runtime.gPaletteFade.deltaY).toBe(4);
    expect(runtime.gPaletteFade.objPaletteToggle).toBe(1);
    expect(runtime.gPlttBufferFaded[0]).toBe(runtime.gPlttBufferUnfaded[0]);

    expect(UpdatePaletteFade(runtime)).toBe(PALETTE_FADE_STATUS_ACTIVE);
    expect(runtime.gPaletteFade.objPaletteToggle).toBe(0);
    expect(runtime.gPaletteFade.y).toBe(4);
    expect(runtime.sPlttBufferTransferPending).toBe(((1 << 0) | (1 << 16)) >>> 0);

    expect(UpdatePaletteFade(runtime)).toBe(PALETTE_FADE_STATUS_LOADING);
    TransferPlttBuffer(runtime);
    expect(UpdatePaletteFade(runtime)).toBe(PALETTE_FADE_STATUS_ACTIVE);
    expect(runtime.gPlttBufferFaded[0]).toBe(RGB(7, 2, 5));
    TransferPlttBuffer(runtime);
    expect(UpdatePaletteFade(runtime)).toBe(PALETTE_FADE_STATUS_ACTIVE);
    expect(runtime.gPlttBufferFaded[OBJ_PLTT_OFFSET]).toBe(RGB(7, 2, 5));
    expect(runtime.gPaletteFade.y).toBe(8);
  });

  test('normal fade holds active for the same four software-finish ticks as C', () => {
    const runtime = createDecompPaletteRuntime();
    FillPalette(runtime, RGB(2, 4, 6), 0, PLTT_SIZE);
    expect(BeginNormalPaletteFade(runtime, 1, 0, 0, 0, RGB(31, 31, 31))).toBe(true);

    TransferPlttBuffer(runtime);
    expect(UpdatePaletteFade(runtime)).toBe(PALETTE_FADE_STATUS_ACTIVE);
    expect(runtime.gPaletteFade.softwareFadeFinishing).toBe(true);

    for (let i = 0; i < 4; i++) {
      TransferPlttBuffer(runtime);
      expect(UpdatePaletteFade(runtime)).toBe(PALETTE_FADE_STATUS_ACTIVE);
    }
    TransferPlttBuffer(runtime);
    expect(UpdatePaletteFade(runtime)).toBe(PALETTE_FADE_STATUS_DONE);
    expect(runtime.gPaletteFade.active).toBe(false);
  });

  test('buffer tint helpers preserve palette-selection and 5-bit bitfield wrapping', () => {
    const runtime = createDecompPaletteRuntime();
    FillPalette(runtime, RGB(1, 30, 15), 0, PLTT_SIZE);
    TintPlttBuffer(runtime, 1, -3, 4, 20);
    expect(runtime.gPlttBufferFaded[0]).toBe(RGB(30, 2, 3));
    expect(runtime.gPlttBufferFaded[16]).toBe(RGB(1, 30, 15));

    runtime.gPlttBufferFaded[0] = 0x1234;
    UnfadePlttBuffer(runtime, 1);
    expect(runtime.gPlttBufferFaded[0]).toBe(RGB(1, 30, 15));
  });

  test('fast fade starts with an immediate BG half update and finalizes through software finish', () => {
    const runtime = createDecompPaletteRuntime();
    FillPalette(runtime, RGB(5, 10, 20), 0, PLTT_SIZE);
    BeginFastPaletteFade(runtime, FAST_FADE_IN_FROM_BLACK);
    expect(runtime.gPlttBufferFaded[0]).toBe(RGB(2, 2, 2));
    expect(runtime.gPlttBufferFaded[OBJ_PLTT_OFFSET]).toBe(RGB(0, 0, 0));
    expect(runtime.gPaletteFade.objPaletteToggle).toBe(1);

    let guard = 0;
    while (!runtime.gPaletteFade.softwareFadeFinishing && guard++ < 40) {
      TransferPlttBuffer(runtime);
      UpdatePaletteFade(runtime);
    }

    expect(runtime.gPlttBufferFaded[0]).toBe(RGB(5, 10, 20));
    expect(runtime.gPlttBufferFaded[OBJ_PLTT_OFFSET]).toBe(RGB(5, 10, 20));
    expect(runtime.gPaletteFade.mode).toBe(0);

    const out = createDecompPaletteRuntime();
    FillPalette(out, RGB(1, 2, 3), 0, PLTT_SIZE);
    BeginFastPaletteFade(out, FAST_FADE_OUT_TO_WHITE);
    while (!out.gPaletteFade.softwareFadeFinishing) {
      TransferPlttBuffer(out);
      UpdatePaletteFade(out);
    }
    expect(out.gPlttBufferFaded[0]).toBe(0xffff);
  });

  test('hardware fade delays, writes blend registers on transfer, then clears on finish', () => {
    const runtime = createDecompPaletteRuntime();
    BeginHardwarePaletteFade(runtime, 0x3f41, 1, 0, 2, 1);

    expect(UpdatePaletteFade(runtime)).toBe(PALETTE_FADE_STATUS_ACTIVE);
    TransferPlttBuffer(runtime);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDCNT)).toBe(0x41);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDY)).toBe(1);

    let guard = 0;
    while (runtime.gPaletteFade.active && guard++ < 10) {
      UpdatePaletteFade(runtime);
      TransferPlttBuffer(runtime);
    }
    expect(runtime.gPaletteFade.active).toBe(false);
    expect(runtime.gPaletteFade.y).toBe(0);
  });

  test('blend and tint routines use the exact fixed-point channel math', () => {
    const runtime = createDecompPaletteRuntime();
    runtime.gPlttBufferUnfaded[0] = RGB(31, 0, 0);
    BlendPalette(runtime, 0, 1, 8, RGB(0, 0, 31));
    expect(runtime.gPlttBufferFaded[0]).toBe(RGB(15, 0, 15));

    runtime.gPlttBufferUnfaded[16] = RGB(8, 8, 8);
    BlendPalettes(runtime, 1 << 1, 16, RGB(1, 2, 3));
    expect(runtime.gPlttBufferFaded[16]).toBe(RGB(1, 2, 3));

    const palette = new Uint16Array([RGB(31, 0, 0), RGB(0, 31, 0), RGB(0, 0, 31)]);
    TintPalette_GrayScale(palette, 1);
    TintPalette_GrayScale2(palette, 1, 1);
    TintPalette_SepiaTone(palette, 1, 2);
    expect([...palette]).toEqual([RGB(9, 9, 9), RGB(16, 16, 16), RGB(3, 3, 2)]);

    const dst = new Uint16Array(1);
    CopyPaletteInvertedTint([RGB(31, 0, 0)], dst, 1, 8);
    expect(dst[0]).toBe(RGB(20, 4, 4));
  });

  test('unused palette struct runner copies frames and flags destination palettes', () => {
    const runtime = createDecompPaletteRuntime();
    runtime.sPaletteStructs[0] = {
      template: {
        id: 7,
        src: [0x1111, 0x2222, 0x3333, 0x4444],
        pst_field_8_0: false,
        unused: 0,
        size: 2,
        time1: 0,
        srcCount: 2,
        state: 1,
        time2: 0
      },
      active: true,
      flag: false,
      baseDestOffset: 16,
      destOffset: 16,
      srcIndex: 0,
      countdown1: 0,
      countdown2: 0
    };

    const flags = { value: 0 };
    PaletteStruct_Run(runtime, false, flags);
    expect([...runtime.gPlttBufferUnfaded.slice(16, 18)]).toEqual([0x1111, 0x2222]);
    expect(flags.value).toBe(1 << 1);
    PaletteStruct_SetUnusedFlag(runtime, 7);
    expect(runtime.sPaletteStructs[0].flag).toBe(true);
  });

  test('gradual blend task runs immediately, respects signed delay delta, and destroys itself at target', () => {
    const runtime = createDecompPaletteRuntime();
    FillPalette(runtime, RGB(0, 0, 0), 0, PLTT_SIZE);
    BlendPalettesGradually(runtime, PALETTES_BG, -1, 0, 4, RGB(16, 0, 0), 5, 9);
    expect(IsBlendPalettesGraduallyTaskActive(runtime, 9)).toBe(true);
    expect(runtime.gPlttBufferFaded[0]).toBe(RGB(0, 0, 0));

    RunTasks(runtime);
    expect(runtime.gPlttBufferFaded[0]).toBe(RGB(2, 0, 0));
    RunTasks(runtime);
    expect(runtime.gPlttBufferFaded[0]).toBe(RGB(4, 0, 0));
    RunTasks(runtime);
    expect(IsBlendPalettesGraduallyTaskActive(runtime, 9)).toBe(false);
  });

  test('BeginNormalPaletteFade refuses to start when a fade is already active', () => {
    const runtime = createDecompPaletteRuntime();
    expect(BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB(0, 0, 0))).toBe(true);
    expect(BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB(0, 0, 0))).toBe(false);
  });
});
