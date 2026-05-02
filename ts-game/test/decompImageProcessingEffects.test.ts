import { describe, expect, it } from 'vitest';
import {
  AddPointillismPoints,
  ApplyImageEffect_BlackOutline,
  ApplyImageEffect_Blur,
  ApplyImageEffect_BlurDown,
  ApplyImageEffect_BlurRight,
  ApplyImageEffect_Pointillism,
  ApplyImageEffect_RedChannelGrayscale,
  ApplyImageEffect_RedChannelGrayscaleHighlight,
  ApplyImageEffect_Shimmer,
  ApplyImageProcessingEffects,
  ApplyImageProcessingQuantization,
  ConvertImageProcessingToGBA,
  ConvertColorToGrayscale,
  GET_B,
  GET_G,
  GET_R,
  GetColorFromPersonality,
  IMAGE_EFFECT_BLUR,
  IMAGE_EFFECT_BLUR_DOWN,
  IMAGE_EFFECT_BLUR_RIGHT,
  IMAGE_EFFECT_CHARCOAL,
  IMAGE_EFFECT_GRAYSCALE_LIGHT,
  IMAGE_EFFECT_INVERT_BLACK_WHITE,
  IMAGE_EFFECT_OUTLINE,
  IMAGE_EFFECT_OUTLINE_COLORED,
  IMAGE_EFFECT_POINTILLISM,
  IMAGE_EFFECT_SHIMMER,
  IMAGE_EFFECT_THICK_BLACK_WHITE,
  IS_ALPHA,
  MAX_DIMENSION,
  POINTILLISM_POINT_COUNT,
  QuantizePixel_BlackAndWhite,
  QuantizePixel_BlackOutline,
  QuantizePixel_Blur,
  QuantizePixel_BlurHard,
  QuantizePixel_Grayscale,
  QuantizePixel_GrayscaleSmall,
  QuantizePixel_Invert,
  QuantizePixel_MotionBlur,
  QuantizePixel_PersonalityColor,
  QuantizePixel_PrimaryColors,
  QuantizePixel_Standard,
  QUANTIZE_EFFECT_BLACK_WHITE,
  QUANTIZE_EFFECT_GRAYSCALE,
  QUANTIZE_EFFECT_GRAYSCALE_SMALL,
  QUANTIZE_EFFECT_PRIMARY_COLORS,
  QUANTIZE_EFFECT_STANDARD,
  QUANTIZE_EFFECT_STANDARD_LIMITED_COLORS,
  RGB,
  RGB2,
  RGB_ALPHA,
  RGB_BLACK,
  RGB_WHITE,
  RGB_WHITEALPHA,
  SetPresetPalette_BlackAndWhite,
  SetPresetPalette_Grayscale,
  SetPresetPalette_GrayscaleSmall,
  SetPresetPalette_PrimaryColors,
  sPointillismPoints,
  type ImageProcessingContext
} from '../src/game/decompImageProcessingEffects';

describe('decompImageProcessingEffects', () => {
  const effectContext = (pixels: number[], width: number, height: number, extra: Partial<ImageProcessingContext> = {}): ImageProcessingContext => ({
    canvasPixels: pixels,
    canvasPalette: [],
    paletteStart: 0,
    columnStart: 0,
    rowStart: 0,
    columnEnd: width,
    rowEnd: height,
    canvasWidth: width,
    canvasHeight: height,
    quantizeEffect: QUANTIZE_EFFECT_STANDARD,
    ...extra
  });

  it('GBA RGB macros preserve channel packing, unpacking, and alpha tests', () => {
    const color = RGB(3, 17, 29);

    expect(color).toBe(3 | (17 << 5) | (29 << 10));
    expect(RGB2(3, 17, 29)).toBe(color);
    expect(GET_R(color)).toBe(3);
    expect(GET_G(color)).toBe(17);
    expect(GET_B(color)).toBe(29);
    expect(IS_ALPHA(color)).toBe(0);
    expect(IS_ALPHA(color | RGB_ALPHA)).toBe(RGB_ALPHA);
    expect(RGB_WHITEALPHA).toBe(RGB_WHITE | RGB_ALPHA);
  });

  it('grayscale and inversion use the same integer averages as C', () => {
    expect(ConvertColorToGrayscale(RGB(2, 5, 8))).toBe(RGB(5, 5, 5));
    expect(ConvertColorToGrayscale(RGB(2, 5, 9))).toBe(RGB(5, 5, 5));
    expect(QuantizePixel_Invert(RGB(0, 15, 31))).toBe(RGB(31, 16, 0));
    expect(QuantizePixel_Grayscale(RGB(2, 8, 9))).toBe(7);
    expect(QuantizePixel_GrayscaleSmall(RGB(0, 0, 1))).toBe(1);
    expect(QuantizePixel_GrayscaleSmall(RGB(12, 13, 14))).toBe(6);
  });

  it('personality colors and dark-edge quantization follow all six C color types', () => {
    expect(GetColorFromPersonality(0)).toBe(RGB(0, 21, 21));
    expect(GetColorFromPersonality(1)).toBe(RGB(21, 21, 0));
    expect(GetColorFromPersonality(2)).toBe(RGB(21, 0, 21));
    expect(GetColorFromPersonality(3)).toBe(RGB(23, 0, 0));
    expect(GetColorFromPersonality(4)).toBe(RGB(0, 0, 23));
    expect(GetColorFromPersonality(5)).toBe(RGB(0, 23, 0));
    expect(GetColorFromPersonality(12)).toBe(RGB(0, 19, 19));
    expect(QuantizePixel_PersonalityColor(RGB(16, 16, 16), 7)).toBe(GetColorFromPersonality(7));
    expect(QuantizePixel_PersonalityColor(RGB(17, 16, 16), 7)).toBe(RGB_WHITE);
  });

  it('black/white and outline quantizers preserve alpha and black-neighbor branches', () => {
    expect(QuantizePixel_BlackAndWhite(RGB(16, 16, 16))).toBe(RGB_BLACK);
    expect(QuantizePixel_BlackAndWhite(RGB(17, 16, 16))).toBe(RGB_WHITE);
    expect(QuantizePixel_BlackOutline(RGB_BLACK, RGB(3, 4, 5))).toBe(RGB_BLACK);
    expect(QuantizePixel_BlackOutline(RGB(3, 4, 5) | RGB_ALPHA, RGB(1, 1, 1))).toBe(RGB_ALPHA);
    expect(QuantizePixel_BlackOutline(RGB(3, 4, 5), RGB_ALPHA)).toBe(RGB_BLACK);
    expect(QuantizePixel_BlackOutline(RGB(3, 4, 5), RGB(1, 1, 1))).toBe(RGB(3, 4, 5));
  });

  it('motion blur returns early for identical and light colors, otherwise uses largest channel diff', () => {
    expect(QuantizePixel_MotionBlur(RGB(4, 5, 6), RGB(4, 5, 6))).toBe(RGB(4, 5, 6));
    expect(QuantizePixel_MotionBlur(RGB(26, 26, 26), RGB(4, 5, 6))).toBe(RGB(4, 5, 6));
    expect(QuantizePixel_MotionBlur(RGB(0, 0, 0), RGB(26, 26, 26))).toBe(RGB(26, 26, 26));
    expect(QuantizePixel_MotionBlur(RGB(4, 8, 20), RGB(10, 6, 5))).toBe(RGB(7, 4, 3));
  });

  it('blur and hard blur use average-diff factors with C truncation', () => {
    expect(QuantizePixel_Blur(RGB(1, 2, 3), RGB(1, 2, 3), RGB(1, 2, 3))).toBe(RGB(1, 2, 3));
    expect(QuantizePixel_Blur(RGB(0, 3, 6), RGB(2, 3, 4), RGB(1, 4, 4))).toBe(RGB(2, 3, 4));
    expect(QuantizePixel_Blur(RGB(0, 0, 0), RGB(20, 10, 5), RGB(31, 31, 31))).toBe(RGB(13, 6, 3));
    expect(QuantizePixel_BlurHard(RGB(0, 0, 0), RGB(20, 10, 5), RGB(31, 31, 31))).toBe(RGB(7, 3, 1));
  });

  it('standard quantization rounds channels up to multiples of four then clamps', () => {
    expect(QuantizePixel_Standard(RGB(0, 1, 2))).toBe(RGB(6, 6, 6));
    expect(QuantizePixel_Standard(RGB(5, 6, 7))).toBe(RGB(8, 8, 8));
    expect(QuantizePixel_Standard(RGB(29, 30, 31))).toBe(RGB(30, 30, 30));
  });

  it('primary color quantization preserves the exact decision tree indices', () => {
    expect(QuantizePixel_PrimaryColors(RGB(10, 10, 10))).toBe(1);
    expect(QuantizePixel_PrimaryColors(RGB(20, 20, 20))).toBe(2);
    expect(QuantizePixel_PrimaryColors(RGB(20, 20, 14))).toBe(7);
    expect(QuantizePixel_PrimaryColors(RGB(20, 14, 20))).toBe(8);
    expect(QuantizePixel_PrimaryColors(RGB(14, 20, 20))).toBe(9);
    expect(QuantizePixel_PrimaryColors(RGB(20, 12, 11))).toBe(10);
    expect(QuantizePixel_PrimaryColors(RGB(12, 20, 11))).toBe(11);
    expect(QuantizePixel_PrimaryColors(RGB(11, 12, 20))).toBe(12);
    expect(QuantizePixel_PrimaryColors(RGB(20, 11, 12))).toBe(13);
    expect(QuantizePixel_PrimaryColors(RGB(11, 20, 12))).toBe(14);
    expect(QuantizePixel_PrimaryColors(RGB(11, 11, 20))).toBe(15);
    expect(QuantizePixel_PrimaryColors(RGB(12, 12, 12))).toBe(3);
  });

  it('preset palettes write the exact C colors at paletteStart * 16 offsets', () => {
    const palette = Array.from({ length: 80 }, () => 0x1234);

    SetPresetPalette_PrimaryColors(palette, 16);
    expect(palette.slice(16, 32)).toEqual([
      RGB_BLACK,
      RGB(6, 6, 6),
      RGB(29, 29, 29),
      RGB(11, 11, 11),
      RGB(29, 6, 6),
      RGB(6, 29, 6),
      RGB(6, 6, 29),
      RGB(29, 29, 6),
      RGB(29, 6, 29),
      RGB(6, 29, 29),
      RGB(29, 11, 6),
      RGB(11, 29, 6),
      RGB(6, 11, 29),
      RGB(29, 6, 11),
      RGB(6, 29, 11),
      RGB(11, 6, 29)
    ]);

    SetPresetPalette_BlackAndWhite(palette, 32);
    expect(palette.slice(32, 35)).toEqual([RGB_BLACK, RGB_BLACK, RGB_WHITE]);

    SetPresetPalette_GrayscaleSmall(palette, 0);
    expect(palette.slice(0, 6)).toEqual([RGB_BLACK, RGB_BLACK, RGB(4, 4, 4), RGB(6, 6, 6), RGB(8, 8, 8), RGB(10, 10, 10)]);

    SetPresetPalette_Grayscale(palette, 48);
    expect(palette.slice(48, 53)).toEqual([RGB_BLACK, RGB(0, 0, 0), RGB(1, 1, 1), RGB(2, 2, 2), RGB(3, 3, 3)]);
  });

  it('standard palette quantization clears palette, reuses colors, handles alpha, and respects selected rectangle', () => {
    const context: ImageProcessingContext = {
      canvasPixels: [
        RGB(1, 1, 1), RGB(5, 6, 7), RGB(5, 6, 7), RGB(9, 10, 11),
        RGB(2, 3, 4), RGB(5, 6, 7) | RGB_ALPHA, RGB(5, 6, 7), RGB(15, 16, 17),
        RGB(20, 21, 22), RGB(23, 24, 25), RGB(26, 27, 28), RGB(29, 30, 31)
      ],
      canvasPalette: Array.from({ length: 320 }, () => 0x7777),
      paletteStart: 1,
      columnStart: 1,
      rowStart: 0,
      columnEnd: 2,
      rowEnd: 2,
      canvasWidth: 4,
      canvasHeight: 3,
      quantizeEffect: QUANTIZE_EFFECT_STANDARD
    };

    ApplyImageProcessingQuantization(context);
    expect(context.canvasPalette[16]).toBe(RGB_BLACK);
    expect(context.canvasPalette[17]).toBe(RGB(8, 8, 8));
    expect(context.canvasPalette[18]).toBe(RGB_BLACK);
    expect(context.canvasPalette[16 + 0xff]).toBe(RGB(15, 15, 15));
    expect(context.canvasPixels).toEqual([
      RGB(1, 1, 1), 17, 17, RGB(9, 10, 11),
      RGB(2, 3, 4), 16, 17, RGB(15, 16, 17),
      RGB(20, 21, 22), RGB(23, 24, 25), RGB(26, 27, 28), RGB(29, 30, 31)
    ]);
  });

  it('limited standard quantization uses max index 0xDF and preserves the C overflow assignment without paletteStart', () => {
    const pixels: number[] = [];
    for (let red = 6; red <= 30 && pixels.length < 0xe0; red += 4) {
      for (let green = 6; green <= 30 && pixels.length < 0xe0; green += 4) {
        for (let blue = 6; blue <= 30 && pixels.length < 0xe0; blue += 4) {
          pixels.push(RGB(red, green, blue));
        }
      }
    }
    const context: ImageProcessingContext = {
      canvasPixels: pixels,
      canvasPalette: Array.from({ length: 512 }, () => 0),
      paletteStart: 2,
      columnStart: 0,
      rowStart: 0,
      columnEnd: pixels.length,
      rowEnd: 1,
      canvasWidth: pixels.length,
      canvasHeight: 1,
      quantizeEffect: QUANTIZE_EFFECT_STANDARD_LIMITED_COLORS
    };

    ApplyImageProcessingQuantization(context);
    expect(context.canvasPalette[32 + 0xdf]).toBe(RGB(15, 15, 15));
    expect(context.canvasPixels[0]).toBe(33);
    expect(context.canvasPixels.at(-1)).toBe(0xdf);
  });

  it('preset quantization effects map pixels through exact paletteStart offsets and alpha branches', () => {
    const base = (): ImageProcessingContext => ({
      canvasPixels: [RGB(16, 16, 16), RGB(17, 16, 16), RGB(2, 8, 9), RGB(0, 0, 1) | RGB_ALPHA],
      canvasPalette: Array.from({ length: 128 }, () => 0x4444),
      paletteStart: 3,
      columnStart: 0,
      rowStart: 0,
      columnEnd: 4,
      rowEnd: 1,
      canvasWidth: 4,
      canvasHeight: 1,
      quantizeEffect: QUANTIZE_EFFECT_BLACK_WHITE
    });

    let context = base();
    ApplyImageProcessingQuantization(context);
    expect(context.canvasPalette.slice(48, 51)).toEqual([RGB_BLACK, RGB_BLACK, RGB_WHITE]);
    expect(context.canvasPixels).toEqual([49, 50, 49, 48]);

    context = { ...base(), quantizeEffect: QUANTIZE_EFFECT_GRAYSCALE };
    ApplyImageProcessingQuantization(context);
    expect(context.canvasPalette.slice(48, 53)).toEqual([RGB_BLACK, RGB(0, 0, 0), RGB(1, 1, 1), RGB(2, 2, 2), RGB(3, 3, 3)]);
    expect(context.canvasPixels).toEqual([65, 65, 55, 48]);

    context = { ...base(), quantizeEffect: QUANTIZE_EFFECT_GRAYSCALE_SMALL };
    ApplyImageProcessingQuantization(context);
    expect(context.canvasPalette.slice(48, 52)).toEqual([RGB_BLACK, RGB_BLACK, RGB(4, 4, 4), RGB(6, 6, 6)]);
    expect(context.canvasPixels).toEqual([56, 56, 51, 48]);

    context = { ...base(), quantizeEffect: QUANTIZE_EFFECT_PRIMARY_COLORS };
    ApplyImageProcessingQuantization(context);
    expect(context.canvasPalette.slice(48, 52)).toEqual([RGB_BLACK, RGB(6, 6, 6), RGB(29, 29, 29), RGB(11, 11, 11)]);
    expect(context.canvasPixels).toEqual([51, 51, 49, 48]);
  });

  it('red-channel grayscale effects mutate only selected non-alpha pixels with C clamp and highlight logic', () => {
    const context = effectContext([
      RGB(1, 9, 9), RGB(30, 1, 1), RGB(31, 2, 2) | RGB_ALPHA,
      RGB(28, 5, 5), RGB(29, 6, 6), RGB(2, 7, 7)
    ], 3, 2, { columnStart: 1, rowStart: 0, columnEnd: 2, rowEnd: 2 });

    ApplyImageEffect_RedChannelGrayscale(context, 3);
    expect(context.canvasPixels).toEqual([
      RGB(1, 9, 9), RGB(31, 31, 31), RGB(31, 2, 2) | RGB_ALPHA,
      RGB(28, 5, 5), RGB(31, 31, 31), RGB(5, 5, 5)
    ]);

    ApplyImageEffect_RedChannelGrayscaleHighlight(context, 4);
    expect(context.canvasPixels).toEqual([
      RGB(1, 9, 9), RGB(29, 29, 29), RGB(31, 2, 2) | RGB_ALPHA,
      RGB(28, 5, 5), RGB(29, 29, 29), RGB(5, 5, 5)
    ]);
  });

  it('pointillism decodes the full C point table and applies AddPointillismPoints exactly', () => {
    expect(POINTILLISM_POINT_COUNT).toBe(3200);
    expect(sPointillismPoints[0]).toEqual({ column: 0, row: 29, bits: (3 << 3) | (2 << 1) });
    expect(sPointillismPoints[7]).toEqual({ column: 26, row: 3, bits: (2 << 3) | 1 });
    expect(sPointillismPoints.at(-1)).toEqual({ column: 5, row: 56, bits: (5 << 3) | (2 << 1) | 1 });

    const pixels = Array.from({ length: MAX_DIMENSION * MAX_DIMENSION }, () => RGB_ALPHA);
    pixels[3 * MAX_DIMENSION + 26] = RGB(10, 10, 10);
    pixels[2 * MAX_DIMENSION + 27] = RGB(10, 10, 10);
    const context = effectContext(pixels, MAX_DIMENSION, MAX_DIMENSION);

    AddPointillismPoints(context, 7);

    expect(context.canvasPixels[3 * MAX_DIMENSION + 26]).toBe(RGB(10, 10, 8));
    expect(context.canvasPixels[2 * MAX_DIMENSION + 27]).toBe(RGB(10, 10, 9));
  });

  it('pointillism preserves C u8 boundary truncation and dispatcher routing', () => {
    const pixels = Array.from({ length: MAX_DIMENSION * MAX_DIMENSION }, () => RGB_ALPHA);
    pixels[29 * MAX_DIMENSION] = RGB(1, 2, 3);
    const context = effectContext(pixels.slice(), MAX_DIMENSION, MAX_DIMENSION);

    AddPointillismPoints(context, 0);
    expect(context.canvasPixels[29 * MAX_DIMENSION]).toBe(RGB(1, 2, 3));

    const viaDispatcher = effectContext(pixels.slice(), MAX_DIMENSION, MAX_DIMENSION, {
      effect: IMAGE_EFFECT_POINTILLISM
    });
    ApplyImageProcessingEffects(viaDispatcher);
    expect(viaDispatcher.canvasPixels).toHaveLength(MAX_DIMENSION * MAX_DIMENSION);

    const direct = effectContext(pixels.slice(), MAX_DIMENSION, MAX_DIMENSION);
    ApplyImageEffect_Pointillism(direct);
    expect(viaDispatcher.canvasPixels).toEqual(direct.canvasPixels);
  });

  it('blur, blur-right, and blur-down use in-place C traversal and skip border rows or columns', () => {
    const blur = effectContext([
      RGB(0, 0, 0), RGB(2, 2, 2), RGB(4, 4, 4),
      RGB(20, 10, 5), RGB(10, 5, 20), RGB(6, 18, 3),
      RGB(31, 31, 31), RGB(20, 20, 20), RGB(1, 1, 1)
    ], 3, 3);
    ApplyImageEffect_Blur(blur);
    expect(blur.canvasPixels).toEqual([
      RGB(0, 0, 0), RGB(2, 2, 2), RGB(4, 4, 4),
      RGB(13, 6, 3), RGB(8, 4, 17), RGB(5, 15, 2),
      RGB(31, 31, 31), RGB(20, 20, 20), RGB(1, 1, 1)
    ]);

    const right = effectContext([RGB(0, 0, 0), RGB(20, 10, 5), RGB(31, 31, 31), RGB(1, 1, 1)], 4, 1);
    ApplyImageEffect_BlurRight(right);
    expect(right.canvasPixels).toEqual([RGB(0, 0, 0), RGB(13, 6, 3), RGB(31, 31, 31), RGB(1, 1, 1)]);

    const down = effectContext([RGB(0, 0, 0), RGB(20, 10, 5), RGB(31, 31, 31), RGB(1, 1, 1)], 1, 4);
    ApplyImageEffect_BlurDown(down);
    expect(down.canvasPixels).toEqual([RGB(0, 0, 0), RGB(13, 6, 3), RGB(31, 31, 31), RGB(1, 1, 1)]);
  });

  it('black outline performs horizontal then vertical in-place passes over the selected rectangle', () => {
    const context = effectContext([
      RGB_ALPHA, RGB_ALPHA, RGB_ALPHA,
      RGB_ALPHA, RGB(5, 5, 5), RGB_ALPHA,
      RGB_ALPHA, RGB_ALPHA, RGB_ALPHA
    ], 3, 3);

    ApplyImageEffect_BlackOutline(context);
    expect(context.canvasPixels).toEqual([
      RGB_ALPHA, RGB_ALPHA, RGB_ALPHA,
      RGB_ALPHA, RGB_BLACK, RGB_ALPHA,
      RGB_ALPHA, RGB_ALPHA, RGB_ALPHA
    ]);
  });

  it('effect dispatcher preserves composed effect order including invert-black-white fallthrough', () => {
    const invertBlackWhite = effectContext([RGB(4, 4, 4), RGB(20, 20, 20), RGB_ALPHA, RGB(1, 1, 1)], 2, 2, {
      effect: IMAGE_EFFECT_INVERT_BLACK_WHITE
    });
    ApplyImageProcessingEffects(invertBlackWhite);
    expect(invertBlackWhite.canvasPixels).toEqual([RGB_BLACK, RGB_WHITE, RGB_ALPHA, RGB_BLACK]);

    const coloredOutline = effectContext([
      RGB_ALPHA, RGB_ALPHA, RGB_ALPHA,
      RGB_ALPHA, RGB(4, 4, 4), RGB_ALPHA,
      RGB_ALPHA, RGB_ALPHA, RGB_ALPHA
    ], 3, 3, { effect: IMAGE_EFFECT_OUTLINE_COLORED, personality: 5 });
    ApplyImageProcessingEffects(coloredOutline);
    expect(coloredOutline.canvasPixels[4]).toBe(GetColorFromPersonality(5));

    const grayscaleLight = effectContext([RGB(3, 6, 9), RGB(31, 31, 31) | RGB_ALPHA], 2, 1, {
      effect: IMAGE_EFFECT_GRAYSCALE_LIGHT
    });
    ApplyImageProcessingEffects(grayscaleLight);
    expect(grayscaleLight.canvasPixels).toEqual([RGB(9, 9, 9), RGB(31, 31, 31) | RGB_ALPHA]);
  });

  it('dispatcher routes blur, outline, directional blur, thick black-white, and charcoal cases', () => {
    const cases = [
      IMAGE_EFFECT_BLUR,
      IMAGE_EFFECT_OUTLINE,
      IMAGE_EFFECT_BLUR_RIGHT,
      IMAGE_EFFECT_BLUR_DOWN,
      IMAGE_EFFECT_THICK_BLACK_WHITE,
      IMAGE_EFFECT_CHARCOAL
    ];

    for (const effect of cases) {
      const context = effectContext([
        RGB_ALPHA, RGB(2, 2, 2), RGB_ALPHA,
        RGB(20, 10, 5), RGB(10, 5, 20), RGB(6, 18, 3),
        RGB_ALPHA, RGB(20, 20, 20), RGB_ALPHA
      ], 3, 3, { effect });
      ApplyImageProcessingEffects(context);
      expect(context.canvasPixels).toHaveLength(9);
    }
  });

  it('shimmer applies the full 64x64 invert, two vertical hard-blur passes, border alpha, and final invert', () => {
    const col = 5;
    const makePixels = (): number[] => {
      const pixels = Array.from({ length: MAX_DIMENSION * MAX_DIMENSION }, () => RGB_ALPHA);
      pixels[0 * MAX_DIMENSION + col] = RGB(0, 0, 0);
      pixels[1 * MAX_DIMENSION + col] = RGB(10, 10, 10);
      pixels[2 * MAX_DIMENSION + col] = RGB(20, 20, 20);
      pixels[63 * MAX_DIMENSION + col] = RGB(31, 31, 31);
      return pixels;
    };
    const pixels = makePixels();
    const context = effectContext(pixels, MAX_DIMENSION, MAX_DIMENSION, {
      columnStart: 3,
      rowStart: 3,
      columnEnd: 1,
      rowEnd: 1,
      effect: IMAGE_EFFECT_SHIMMER
    });

    ApplyImageEffect_Shimmer(context);
    expect(context.canvasPixels[0 * MAX_DIMENSION + col]).toBe(RGB_ALPHA);
    expect(context.canvasPixels[1 * MAX_DIMENSION + col]).toBe(RGB(24, 24, 24));
    expect(context.canvasPixels[2 * MAX_DIMENSION + col]).toBe(RGB(26, 26, 26));
    expect(context.canvasPixels[63 * MAX_DIMENSION + col]).toBe(RGB_ALPHA);

    const viaDispatcher = effectContext(makePixels(), MAX_DIMENSION, MAX_DIMENSION, {
      effect: IMAGE_EFFECT_SHIMMER
    });
    ApplyImageProcessingEffects(viaDispatcher);
    expect(viaDispatcher.canvasPixels[1 * MAX_DIMENSION + col]).toBe(RGB(24, 24, 24));
  });

  it('ConvertImageProcessingToGBA packs 4bpp tiles with the exact C source and destination offsets', () => {
    const pixels = Array.from({ length: 16 * 8 }, (_unused, i) => i & 0xf);
    const context = effectContext(pixels, 16, 8, {
      dest: Array.from({ length: 32 }, () => 0xffff),
      var_16: 0
    });

    ConvertImageProcessingToGBA(context);

    expect(context.dest!.slice(0, 4)).toEqual([
      0x3210,
      0x7654,
      0x3210,
      0x7654
    ]);
    expect(context.dest!.slice(16, 20)).toEqual([
      0xba98,
      0xfedc,
      0xba98,
      0xfedc
    ]);
  });

  it('ConvertImageProcessingToGBA packs var_16 == 2 as four byte-pair words per tile row', () => {
    const pixels = Array.from({ length: 16 * 8 }, (_unused, i) => i & 0xff);
    const context = effectContext(pixels, 16, 8, {
      dest: Array.from({ length: 64 }, () => 0xffff),
      var_16: 2
    });

    ConvertImageProcessingToGBA(context);

    expect(context.dest!.slice(0, 8)).toEqual([
      0x0100,
      0x0302,
      0x0504,
      0x0706,
      0x1110,
      0x1312,
      0x1514,
      0x1716
    ]);
    expect(context.dest!.slice(32, 40)).toEqual([
      0x0908,
      0x0b0a,
      0x0d0c,
      0x0f0e,
      0x1918,
      0x1b1a,
      0x1d1c,
      0x1f1e
    ]);
  });
});
