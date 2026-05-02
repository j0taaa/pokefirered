export const RGB_ALPHA = 1 << 15;
export const RGB_BLACK = 0;
export const RGB_WHITE = 0x7fff;
export const RGB_WHITEALPHA = RGB_WHITE | RGB_ALPHA;

export const MAX_DIMENSION = 64;

export const IMAGE_EFFECT_POINTILLISM = 2;
export const IMAGE_EFFECT_GRAYSCALE_LIGHT = 6;
export const IMAGE_EFFECT_BLUR = 8;
export const IMAGE_EFFECT_OUTLINE_COLORED = 9;
export const IMAGE_EFFECT_INVERT_BLACK_WHITE = 10;
export const IMAGE_EFFECT_THICK_BLACK_WHITE = 11;
export const IMAGE_EFFECT_SHIMMER = 13;
export const IMAGE_EFFECT_OUTLINE = 30;
export const IMAGE_EFFECT_INVERT = 31;
export const IMAGE_EFFECT_BLUR_RIGHT = 32;
export const IMAGE_EFFECT_BLUR_DOWN = 33;
export const IMAGE_EFFECT_CHARCOAL = 36;

export const QUANTIZE_EFFECT_STANDARD = 0;
export const QUANTIZE_EFFECT_STANDARD_LIMITED_COLORS = 1;
export const QUANTIZE_EFFECT_PRIMARY_COLORS = 2;
export const QUANTIZE_EFFECT_GRAYSCALE = 3;
export const QUANTIZE_EFFECT_GRAYSCALE_SMALL = 4;
export const QUANTIZE_EFFECT_BLACK_WHITE = 5;

export const GET_R = (color: number): number => color & 0x1f;
export const GET_G = (color: number): number => (color >> 5) & 0x1f;
export const GET_B = (color: number): number => (color >> 10) & 0x1f;
export const RGB = (red: number, green: number, blue: number): number =>
  ((red & 0x1f) | ((green & 0x1f) << 5) | ((blue & 0x1f) << 10)) & 0xffff;
export const RGB2 = (red: number, green: number, blue: number): number => RGB(red, green, blue);
export const IS_ALPHA = (color: number): number => color & RGB_ALPHA;

const div = (left: number, right: number): number => Math.trunc(left / right);

const POINT_OFFSET_DOWN_LEFT = (bits: number): number => (bits >> 0) & 1;
const POINT_COLOR_TYPE = (bits: number): number => (bits >> 1) & 3;
const POINT_DELTA = (bits: number): number => (bits >> 3) & 7;

const sPointillismPointsBase64 = [
  'AB0cDh4bAAEyLh43CiIfBSYuEhceGgMRBREYBScvGj8SIj8WKy8uEQItIw0oFwwZLw4TMBggLSgiAQMZDiorIhUlIgomOQYjFgcv',
  'IjobOzY1CiskNgkSHC8jLjgsBSogBxQyMQgXGiQtIgoWGyYrKRYRNQgUHggUBTEUODEXNDMSEQkfKD0yNQMePCsuEAEXAz4iFxg0',
  'CCkZAyQoPTMvMSQZGxgmBw0lLT8SLxUlKQ8SBywSLAsmEhoWAAsvFjUkHxwiKTMnOzAXEQY1PjEvETolKgIZMxg1KiAhLjIbOx8j',
  'OSkqLjEpKg4tLQAfOCgbFDsrLgQmNjAROyEtKz8bIBMxMwwwIisrFgIeHBIcDzw2OBAtGC8tNTsRNzETEz0vHiwzLjcSPB8zMion',
  'DTscNSonCT0nEgsYDBUdIAEcCDscEjczFQMsKjsxDwQ1CBczOD0qLzUWEDUWIxMsLwYgJzokABwqAzkdKAcaIAo3BzUtFS8sECwj',
  'PykUKiE2NBosHD0zOCsiNSgfPQ8cHj4bDD4fKzEsMjkRBQkRBDgqMgAWEwsxNCoTLCIhOS8VNygeBzstEQMoLTAeMRERIwEePTE0',
  'HAI0IQ4lPQcXMxUQKTIyGB8wLTswJz4WMRUSMCUXMwY0ACkYPAMSLAwRCTAwEA4RJxYbDDsuKzMeEy0tESQpND4rJB4hJxotBDkW',
  'PjMmGy4lDAYZJRkYHTMzHSgtHBAqHzUeNAIQKzoUDQsVDCwQNzoZBhMXJBAlJAQeADU0OgA3PAcaKyg2NDkvKAkfODEwFiUxGCgx',
  'GAwiBjktPSAkLichPhgYFTwkBhsmFQ4iCg0fGBY0ECghIBERNjIVOy4kHy0SNi4gCxczJgMfCBkxKhglNS0tMDgYHCUUHCIoCCMh',
  'Jh4wGQ8VEC8iEgIlPAEdDhQYDRgXIgsxEzQhDy02OR8lGBAfLSAgGQsxMxMULhEhLQo3BxUbMgQyBhgbEyQSNiIWHSkcNRchNhcr',
  'NTIZKg8uEAA0Ag4oMTIyOwUgNiYSNAY0HjEyNQU0HhMVFRQsKRwYJCQSIikYNDYwHgEjDDwkCj0WJx4jFQISERkqHTEVAzsqIRks',
  'CiMRJREaGgo0OwszIQs3ATEoNR0nLDAxLjktMAUsEiorOSIgFTQcHAEVIBYiEwQYHhMQJTMVOQMxPzYYFCMQLx4fHxcsAhYxIBgw',
  'Lhg3Ow4wEDkkJjkeMCYuEgEUNyouIQYdKhYyCTgcByIXOy0VBx4uGy4dBAkwMC03LTQkGCQlDi0mIwoWEi0RISguDwEhATESPxse',
  'ISUrJhgTFS00IyE2Di4cFCIcLAsoGhghIQcaJCYpKwo0PiczEjQbHwEqLgYjLx8UGAYmMR8rIiYuHhUWICIoFTcSJQQsHwQuDBMY',
  'Bws2HRwqMCIcLhIvKyEeFjgwBAIWBRQgODwzIRsvFConOBQbKx8rKSslJzYhESIbKQMbGCQoIS02PCwkMxcfKjohCiM3AAshETgZ',
  'Dw4cHw83PBA3ODE1BxUoHi4ZJhAzPTUvOgQ0DRgaAS0VPRoXFz8yCyERHiYrDRkkLgQbGzMgFSEdHwQhDxIfLSoyAzcfNQcnJB8x',
  'LzAVBgAkCyIaDDspFBoXNyAlPyY3Oj4QIgQRKBIcAy4uDjgoASkiHjMZBiEnMxkaAgUXEREsHyYeOR8oLi8SIjQTOyYvNAAUEDER',
  'HS0qCAg3FRg0BCskLx4nIiokBxQlAScZKQopPRwvDR8cJD0yNh0kFCEWGg0pPysqGj41ESgYMgUVIS40LRQqPAg3PzQeJyQcFhYz',
  'KTsZNi8cAyUsCxY2HB0bLCcbCx8rCBAnPyUvMxMfBDE3Di8SCCMgOhoeLwsfHiAZIzsUJQAnFAQlNhorJyEVKBMsDjw1DC0rNxYV',
  'KRUdFzQ2CQoxNyIoFys1FCsSCBMfMRMoBgc1IzopDyQuBzUmDhIVIzMsDiEmHBIlIx0vBDUzFgEkPSwuNQolERMlGxsVFTkQCzUk',
  'OicwLi8VEB81Gyg1JjA3NDcrDzApLj8rODQrKy8lDSgqMxgQIRIRHyI0ESUjIT8RJiclKDYSFSYyERgkMiU3JzozNQccGg4qHi8f',
  'AC4hGzwULzovPjgVGhMvKQ0vNxcYMBw1FTQUKBEsLCUqID8oDDQbMC4lNxwkHyUmDBk0GBA1ChMRJRMgExkRICgdPjAbIyQhDSMj',
  'HSguLRIfDi4rCzEyJDwsEzwSKBYqBQwyOQsyIQQUEDEyEh8jOS4uIj0nDB4YJQAXBjEUEyEaFCA1CjslMwgoPQIzIwATIiEoMBQu',
  'FDI2OSMeHBEwNxYwFTEfNCgsNQUpNzMqHBcuEAYWMh8vACkeBAEWOyMeGzQqMBErAwAfHTcaOhglHBYsBD8zJiMtFSwnAjUnBzUz',
  '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',
] as const;

const decodeBase64Bytes = (value: string): number[] =>
  Array.from(globalThis.atob(value), (char) => char.charCodeAt(0));

export interface PointillismPointDef {
  column: number;
  row: number;
  bits: number;
}

export const sPointillismPoints: PointillismPointDef[] = (() => {
  const bytes = decodeBase64Bytes(sPointillismPointsBase64.join(''));
  const points: PointillismPointDef[] = [];
  for (let i = 0; i < bytes.length; i += 3) {
    points.push({ column: bytes[i], row: bytes[i + 1], bits: bytes[i + 2] });
  }
  return points;
})();

export const POINTILLISM_POINT_COUNT = sPointillismPoints.length;

export interface ImageProcessingContext {
  canvasPixels: number[];
  canvasPalette: number[];
  paletteStart: number;
  columnStart: number;
  rowStart: number;
  columnEnd: number;
  rowEnd: number;
  canvasWidth: number;
  canvasHeight: number;
  dest?: number[];
  var_16?: number;
  personality?: number;
  effect?: number;
  quantizeEffect: number;
}

export const ConvertColorToGrayscale = (color: number): number => {
  const red = color & 0x1f;
  const green = (color >> 5) & 0x1f;
  const blue = (color >> 10) & 0x1f;
  const gray = div(red + green + blue, 3);
  return RGB2(gray, gray, gray);
};

export const GetColorFromPersonality = (personality: number): number => {
  let red = 0;
  let green = 0;
  let blue = 0;
  const strength = div(personality, 6) % 3;
  const colorType = personality % 6;

  switch (colorType) {
    case 0:
      green = 21 - strength;
      blue = green;
      red = 0;
      break;
    case 1:
      blue = 0;
      red = 21 - strength;
      green = red;
      break;
    case 2:
      blue = 21 - strength;
      green = 0;
      red = blue;
      break;
    case 3:
      blue = 0;
      green = 0;
      red = 23 - strength;
      break;
    case 4:
      blue = 23 - strength;
      green = 0;
      red = 0;
      break;
    case 5:
      blue = 0;
      green = 23 - strength;
      red = 0;
      break;
  }

  return RGB2(red, green, blue);
};

export const QuantizePixel_PersonalityColor = (color: number, personality: number): number => {
  const red = GET_R(color);
  const green = GET_G(color);
  const blue = GET_B(color);

  if (red < 17 && green < 17 && blue < 17) {
    return GetColorFromPersonality(personality);
  }
  return RGB_WHITE;
};

export const QuantizePixel_BlackAndWhite = (color: number): number => {
  const red = GET_R(color);
  const green = GET_G(color);
  const blue = GET_B(color);

  if (red < 17 && green < 17 && blue < 17) {
    return RGB_BLACK;
  }
  return RGB_WHITE;
};

export const QuantizePixel_BlackOutline = (pixelA: number, pixelB: number): number => {
  if (pixelA !== RGB_BLACK) {
    if (IS_ALPHA(pixelA)) {
      return RGB_ALPHA;
    }
    if (IS_ALPHA(pixelB)) {
      return RGB_BLACK;
    }

    return pixelA;
  }

  return RGB_BLACK;
};

export const QuantizePixel_Invert = (color: number): number => {
  let red = GET_R(color);
  let green = GET_G(color);
  let blue = GET_B(color);

  red = 31 - red;
  green = 31 - green;
  blue = 31 - blue;

  return RGB2(red, green, blue);
};

export const QuantizePixel_MotionBlur = (prevPixel: number, curPixel: number): number => {
  const pixelChannels = [
    [GET_R(prevPixel), GET_G(prevPixel), GET_B(prevPixel)],
    [GET_R(curPixel), GET_G(curPixel), GET_B(curPixel)]
  ];
  const diffs = [0, 0, 0];

  if (prevPixel === curPixel) {
    return curPixel;
  }

  if (pixelChannels[0][0] > 25 && pixelChannels[0][1] > 25 && pixelChannels[0][2] > 25) {
    return curPixel;
  }
  if (pixelChannels[1][0] > 25 && pixelChannels[1][1] > 25 && pixelChannels[1][2] > 25) {
    return curPixel;
  }

  for (let i = 0; i < 3; i += 1) {
    if (pixelChannels[0][i] > pixelChannels[1][i]) {
      diffs[i] = pixelChannels[0][i] - pixelChannels[1][i];
    } else {
      diffs[i] = pixelChannels[1][i] - pixelChannels[0][i];
    }
  }

  let largestDiff: number;
  if (diffs[0] >= diffs[1]) {
    if (diffs[0] >= diffs[2]) {
      largestDiff = diffs[0];
    } else if (diffs[1] >= diffs[2]) {
      largestDiff = diffs[1];
    } else {
      largestDiff = diffs[2];
    }
  } else if (diffs[1] >= diffs[2]) {
    largestDiff = diffs[1];
  } else if (diffs[2] >= diffs[0]) {
    largestDiff = diffs[2];
  } else {
    largestDiff = diffs[0];
  }

  const factor = 31 - div(largestDiff, 2);
  const red = div(pixelChannels[1][0] * factor, 31);
  const green = div(pixelChannels[1][1] * factor, 31);
  const blue = div(pixelChannels[1][2] * factor, 31);
  return RGB2(red, green, blue);
};

export const QuantizePixel_Blur = (prevPixel: number, curPixel: number, nextPixel: number): number => {
  if (prevPixel === curPixel && nextPixel === curPixel) {
    return curPixel;
  }

  let red = GET_R(curPixel);
  let green = GET_G(curPixel);
  let blue = GET_B(curPixel);

  const prevAvg = div(GET_R(prevPixel) + GET_G(prevPixel) + GET_B(prevPixel), 3);
  const curAvg = div(GET_R(curPixel) + GET_G(curPixel) + GET_B(curPixel), 3);
  const nextAvg = div(GET_R(nextPixel) + GET_G(nextPixel) + GET_B(nextPixel), 3);

  if (prevAvg === curAvg && nextAvg === curAvg) {
    return curPixel;
  }

  const prevDiff = prevAvg > curAvg ? prevAvg - curAvg : curAvg - prevAvg;
  const nextDiff = nextAvg > curAvg ? nextAvg - curAvg : curAvg - nextAvg;
  const diff = prevDiff >= nextDiff ? prevDiff : nextDiff;
  const factor = 31 - div(diff, 2);
  red = div(red * factor, 31);
  green = div(green * factor, 31);
  blue = div(blue * factor, 31);
  return RGB2(red, green, blue);
};

export const QuantizePixel_BlurHard = (prevPixel: number, curPixel: number, nextPixel: number): number => {
  if (prevPixel === curPixel && nextPixel === curPixel) {
    return curPixel;
  }

  let red = GET_R(curPixel);
  let green = GET_G(curPixel);
  let blue = GET_B(curPixel);

  const prevAvg = div(GET_R(prevPixel) + GET_G(prevPixel) + GET_B(prevPixel), 3);
  const curAvg = div(GET_R(curPixel) + GET_G(curPixel) + GET_B(curPixel), 3);
  const nextAvg = div(GET_R(nextPixel) + GET_G(nextPixel) + GET_B(nextPixel), 3);

  if (prevAvg === curAvg && nextAvg === curAvg) {
    return curPixel;
  }

  const prevDiff = prevAvg > curAvg ? prevAvg - curAvg : curAvg - prevAvg;
  const nextDiff = nextAvg > curAvg ? nextAvg - curAvg : curAvg - nextAvg;
  const diff = prevDiff >= nextDiff ? prevDiff : nextDiff;
  const factor = 31 - diff;
  red = div(red * factor, 31);
  green = div(green * factor, 31);
  blue = div(blue * factor, 31);
  return RGB2(red, green, blue);
};

export const QuantizePixel_Standard = (pixel: number): number => {
  let red = GET_R(pixel);
  let green = GET_G(pixel);
  let blue = GET_B(pixel);

  if (red & 3) {
    red = (red & 0x1c) + 4;
  }
  if (green & 3) {
    green = (green & 0x1c) + 4;
  }
  if (blue & 3) {
    blue = (blue & 0x1c) + 4;
  }

  if (red < 6) {
    red = 6;
  }
  if (red > 30) {
    red = 30;
  }
  if (green < 6) {
    green = 6;
  }
  if (green > 30) {
    green = 30;
  }
  if (blue < 6) {
    blue = 6;
  }
  if (blue > 30) {
    blue = 30;
  }

  return RGB2(red, green, blue);
};

export const QuantizePixel_PrimaryColors = (color: number): number => {
  const red = GET_R(color);
  const green = GET_G(color);
  const blue = GET_B(color);

  if (red < 12 && green < 11 && blue < 11) {
    return 1;
  }

  if (red > 19 && green > 19 && blue > 19) {
    return 2;
  }

  if (red > 19) {
    if (green > 19) {
      if (blue > 14) {
        return 2;
      }
      return 7;
    }
    if (blue > 19) {
      if (green > 14) {
        return 2;
      }
      return 8;
    }
  }

  if (green > 19 && blue > 19) {
    if (red > 14) {
      return 2;
    }
    return 9;
  }

  if (red > 19) {
    if (green > 11) {
      if (blue > 11) {
        if (green < blue) {
          return 8;
        }
        return 7;
      }
      return 10;
    }
    if (blue > 11) {
      return 13;
    }
    return 4;
  }

  if (green > 19) {
    if (red > 11) {
      if (blue > 11) {
        if (red < blue) {
          return 9;
        }
        return 7;
      }
      return 11;
    }
    if (blue > 11) {
      return 14;
    }
    return 5;
  }

  if (blue > 19) {
    if (red > 11) {
      if (green > 11) {
        if (red < green) {
          return 9;
        }
        return 8;
      }
    } else if (green > 11) {
      return 12;
    }

    if (blue > 11) {
      return 15;
    }
    return 6;
  }

  return 3;
};

export const QuantizePixel_GrayscaleSmall = (color: number): number => {
  const red = GET_R(color);
  const green = GET_G(color);
  const blue = GET_B(color);
  const average = div(red + green + blue, 3) & 0x1e;
  if (average === 0) {
    return 1;
  }
  return div(average, 2);
};

export const QuantizePixel_Grayscale = (color: number): number => {
  const red = GET_R(color);
  const green = GET_G(color);
  const blue = GET_B(color);
  const average = div(red + green + blue, 3);
  return average + 1;
};

export const SetPresetPalette_PrimaryColors = (palette: number[], paletteStart = 0): void => {
  palette[paletteStart + 0] = RGB_BLACK;
  palette[paletteStart + 1] = RGB(6, 6, 6);
  palette[paletteStart + 2] = RGB(29, 29, 29);
  palette[paletteStart + 3] = RGB(11, 11, 11);
  palette[paletteStart + 4] = RGB(29, 6, 6);
  palette[paletteStart + 5] = RGB(6, 29, 6);
  palette[paletteStart + 6] = RGB(6, 6, 29);
  palette[paletteStart + 7] = RGB(29, 29, 6);
  palette[paletteStart + 8] = RGB(29, 6, 29);
  palette[paletteStart + 9] = RGB(6, 29, 29);
  palette[paletteStart + 10] = RGB(29, 11, 6);
  palette[paletteStart + 11] = RGB(11, 29, 6);
  palette[paletteStart + 12] = RGB(6, 11, 29);
  palette[paletteStart + 13] = RGB(29, 6, 11);
  palette[paletteStart + 14] = RGB(6, 29, 11);
  palette[paletteStart + 15] = RGB(11, 6, 29);
};

export const SetPresetPalette_BlackAndWhite = (palette: number[], paletteStart = 0): void => {
  palette[paletteStart + 0] = RGB_BLACK;
  palette[paletteStart + 1] = RGB_BLACK;
  palette[paletteStart + 2] = RGB_WHITE;
};

export const SetPresetPalette_GrayscaleSmall = (palette: number[], paletteStart = 0): void => {
  palette[paletteStart + 0] = RGB_BLACK;
  palette[paletteStart + 1] = RGB_BLACK;
  for (let i = 0; i < 14; i += 1) {
    palette[paletteStart + i + 2] = RGB2(2 * (i + 2), 2 * (i + 2), 2 * (i + 2));
  }
};

export const SetPresetPalette_Grayscale = (palette: number[], paletteStart = 0): void => {
  palette[paletteStart + 0] = RGB_BLACK;
  for (let i = 0; i < 32; i += 1) {
    palette[paletteStart + i + 1] = RGB2(i, i, i);
  }
};

const forEachCanvasPixel = (
  context: ImageProcessingContext,
  callback: (index: number, color: number) => number
): void => {
  for (let j = 0; j < context.rowEnd; j += 1) {
    const pixelRowStart = (context.rowStart + j) * context.canvasWidth;
    let pixelIndex = pixelRowStart + context.columnStart;
    for (let i = 0; i < context.columnEnd; i += 1, pixelIndex += 1) {
      context.canvasPixels[pixelIndex] = callback(pixelIndex, context.canvasPixels[pixelIndex]);
    }
  }
};

export const ApplyImageEffect_RedChannelGrayscale = (context: ImageProcessingContext, delta: number): void => {
  forEachCanvasPixel(context, (_index, color) => {
    if (!IS_ALPHA(color)) {
      let grayValue = color & 0x1f;
      grayValue += delta;
      if (grayValue > 31)
        grayValue = 31;

      return RGB2(grayValue, grayValue, grayValue);
    }

    return color;
  });
};

export const ApplyImageEffect_RedChannelGrayscaleHighlight = (context: ImageProcessingContext, highlight: number): void => {
  forEachCanvasPixel(context, (_index, color) => {
    if (!IS_ALPHA(color)) {
      let grayValue = color & 0x1f;
      if (grayValue > 31 - highlight)
        grayValue = 31 - (highlight >> 1);

      return RGB2(grayValue, grayValue, grayValue);
    }

    return color;
  });
};

export const AddPointillismPoints = (context: ImageProcessingContext, point: number): void => {
  const def = sPointillismPoints[point];
  const points = [{ column: def.column, row: def.row, delta: POINT_DELTA(def.bits) }];
  const colorType = POINT_COLOR_TYPE(def.bits);
  const offsetDownLeft = POINT_OFFSET_DOWN_LEFT(def.bits) !== 0;

  for (let i = 1; i < points[0].delta; i += 1) {
    if (!offsetDownLeft) {
      points[i] = {
        column: (points[0].column - i) & 0xff,
        row: (points[0].row + i) & 0xff,
        delta: points[0].delta - i
      };
    } else {
      points[i] = {
        column: (points[0].column + 1) & 0xff,
        row: (points[0].row - 1) & 0xff,
        delta: points[0].delta - i
      };
    }

    if (points[i].column >= MAX_DIMENSION || points[i].row >= MAX_DIMENSION) {
      points[0].delta = i - 1;
      break;
    }
  }

  for (let i = 0; i < points[0].delta; i += 1) {
    const pixelIndex = points[i].row * MAX_DIMENSION + points[i].column;
    const pixel = context.canvasPixels[pixelIndex];
    if (!IS_ALPHA(pixel)) {
      let red = GET_R(pixel);
      let green = GET_G(pixel);
      let blue = GET_B(pixel);

      switch (colorType) {
        case 0:
        case 1:
          switch (POINT_DELTA(def.bits) % 3) {
            case 0:
              red = red >= points[i].delta ? red - points[i].delta : 0;
              break;
            case 1:
              green = green >= points[i].delta ? green - points[i].delta : 0;
              break;
            case 2:
              blue = blue >= points[i].delta ? blue - points[i].delta : 0;
              break;
          }
          break;
        case 2:
        case 3:
          red += points[i].delta;
          green += points[i].delta;
          blue += points[i].delta;
          if (red > 31)
            red = 31;
          if (green > 31)
            green = 31;
          if (blue > 31)
            blue = 31;
          break;
      }

      context.canvasPixels[pixelIndex] = RGB2(red, green, blue);
    }
  }
};

export const ApplyImageEffect_Pointillism = (context: ImageProcessingContext): void => {
  for (let i = 0; i < sPointillismPoints.length; i += 1) {
    AddPointillismPoints(context, i);
  }
};

export const ApplyImageEffect_Grayscale = (context: ImageProcessingContext): void => {
  forEachCanvasPixel(context, (_index, color) =>
    IS_ALPHA(color) ? color : ConvertColorToGrayscale(color)
  );
};

export const ApplyImageEffect_Blur = (context: ImageProcessingContext): void => {
  for (let i = 0; i < context.columnEnd; i += 1) {
    let pixelIndex = context.rowStart * context.canvasWidth + context.columnStart + i;
    let prevPixel = context.canvasPixels[pixelIndex];

    let j = 1;
    pixelIndex += context.canvasWidth;
    while (j < context.rowEnd - 1) {
      if (!IS_ALPHA(context.canvasPixels[pixelIndex])) {
        context.canvasPixels[pixelIndex] = QuantizePixel_Blur(
          prevPixel,
          context.canvasPixels[pixelIndex],
          context.canvasPixels[pixelIndex + context.canvasWidth]
        );
        prevPixel = context.canvasPixels[pixelIndex];
      }

      j++;
      pixelIndex += context.canvasWidth;
    }
  }
};

export const ApplyImageEffect_PersonalityColor = (context: ImageProcessingContext, personality: number): void => {
  forEachCanvasPixel(context, (_index, color) =>
    IS_ALPHA(color) ? color : QuantizePixel_PersonalityColor(color, personality)
  );
};

export const ApplyImageEffect_BlackAndWhite = (context: ImageProcessingContext): void => {
  forEachCanvasPixel(context, (_index, color) =>
    IS_ALPHA(color) ? color : QuantizePixel_BlackAndWhite(color)
  );
};

export const ApplyImageEffect_BlackOutline = (context: ImageProcessingContext): void => {
  for (let j = 0; j < context.rowEnd; j += 1) {
    const pixelRowStart = (context.rowStart + j) * context.canvasWidth;
    let pixelIndex = pixelRowStart + context.columnStart;
    context.canvasPixels[pixelIndex] = QuantizePixel_BlackOutline(
      context.canvasPixels[pixelIndex],
      context.canvasPixels[pixelIndex + 1]
    );
    pixelIndex++;
    for (let i = 1; i < context.columnEnd - 1; i += 1, pixelIndex += 1) {
      context.canvasPixels[pixelIndex] = QuantizePixel_BlackOutline(
        context.canvasPixels[pixelIndex],
        context.canvasPixels[pixelIndex + 1]
      );
      context.canvasPixels[pixelIndex] = QuantizePixel_BlackOutline(
        context.canvasPixels[pixelIndex],
        context.canvasPixels[pixelIndex - 1]
      );
    }

    context.canvasPixels[pixelIndex] = QuantizePixel_BlackOutline(
      context.canvasPixels[pixelIndex],
      context.canvasPixels[pixelIndex - 1]
    );
  }

  for (let i = 0; i < context.columnEnd; i += 1) {
    let pixelIndex = context.rowStart * context.canvasWidth + context.columnStart + i;
    context.canvasPixels[pixelIndex] = QuantizePixel_BlackOutline(
      context.canvasPixels[pixelIndex],
      context.canvasPixels[pixelIndex + context.canvasWidth]
    );
    pixelIndex += context.canvasWidth;
    for (let j = 1; j < context.rowEnd - 1; j += 1, pixelIndex += context.canvasWidth) {
      context.canvasPixels[pixelIndex] = QuantizePixel_BlackOutline(
        context.canvasPixels[pixelIndex],
        context.canvasPixels[pixelIndex + context.canvasWidth]
      );
      context.canvasPixels[pixelIndex] = QuantizePixel_BlackOutline(
        context.canvasPixels[pixelIndex],
        context.canvasPixels[pixelIndex - context.canvasWidth]
      );
    }

    context.canvasPixels[pixelIndex] = QuantizePixel_BlackOutline(
      context.canvasPixels[pixelIndex],
      context.canvasPixels[pixelIndex - context.canvasWidth]
    );
  }
};

export const ApplyImageEffect_Invert = (context: ImageProcessingContext): void => {
  forEachCanvasPixel(context, (_index, color) =>
    IS_ALPHA(color) ? color : QuantizePixel_Invert(color)
  );
};

export const ApplyImageEffect_BlurRight = (context: ImageProcessingContext): void => {
  for (let j = 0; j < context.rowEnd; j += 1) {
    const pixelRowStart = (context.rowStart + j) * context.canvasWidth;
    let pixelIndex = pixelRowStart + context.columnStart;
    let prevPixel = context.canvasPixels[pixelIndex];
    pixelIndex++;
    for (let i = 1; i < context.columnEnd - 1; i += 1, pixelIndex += 1) {
      if (!IS_ALPHA(context.canvasPixels[pixelIndex])) {
        context.canvasPixels[pixelIndex] = QuantizePixel_MotionBlur(prevPixel, context.canvasPixels[pixelIndex]);
        prevPixel = context.canvasPixels[pixelIndex];
      }
    }
  }
};

export const ApplyImageEffect_BlurDown = (context: ImageProcessingContext): void => {
  for (let i = 0; i < context.columnEnd; i += 1) {
    let pixelIndex = context.rowStart * context.canvasWidth + context.columnStart + i;
    let prevPixel = context.canvasPixels[pixelIndex];
    pixelIndex += context.canvasWidth;
    for (let j = 1; j < context.rowEnd - 1; j += 1, pixelIndex += context.canvasWidth) {
      if (!IS_ALPHA(context.canvasPixels[pixelIndex])) {
        context.canvasPixels[pixelIndex] = QuantizePixel_MotionBlur(prevPixel, context.canvasPixels[pixelIndex]);
        prevPixel = context.canvasPixels[pixelIndex];
      }
    }
  }
};

export const ApplyImageEffect_Shimmer = (context: ImageProcessingContext): void => {
  let pixelIndex = 0;
  for (let i = 0; i < MAX_DIMENSION; i += 1) {
    for (let j = 0; j < MAX_DIMENSION; j += 1, pixelIndex += 1) {
      if (!IS_ALPHA(context.canvasPixels[pixelIndex]))
        context.canvasPixels[pixelIndex] = QuantizePixel_Invert(context.canvasPixels[pixelIndex]);
    }
  }

  for (let j = 0; j < MAX_DIMENSION; j += 1) {
    pixelIndex = j;
    let prevPixel = context.canvasPixels[pixelIndex];
    context.canvasPixels[pixelIndex] = RGB_ALPHA;
    pixelIndex += MAX_DIMENSION;
    for (let i = 1; i < MAX_DIMENSION - 1; i += 1, pixelIndex += MAX_DIMENSION) {
      if (!IS_ALPHA(context.canvasPixels[pixelIndex])) {
        context.canvasPixels[pixelIndex] = QuantizePixel_BlurHard(
          prevPixel,
          context.canvasPixels[pixelIndex],
          context.canvasPixels[pixelIndex + MAX_DIMENSION]
        );
        prevPixel = context.canvasPixels[pixelIndex];
      }
    }

    context.canvasPixels[pixelIndex] = RGB_ALPHA;
    pixelIndex = j;
    prevPixel = context.canvasPixels[pixelIndex];
    context.canvasPixels[pixelIndex] = RGB_ALPHA;
    pixelIndex += MAX_DIMENSION;
    for (let i = 1; i < MAX_DIMENSION - 1; i += 1, pixelIndex += MAX_DIMENSION) {
      if (!IS_ALPHA(context.canvasPixels[pixelIndex])) {
        context.canvasPixels[pixelIndex] = QuantizePixel_BlurHard(
          prevPixel,
          context.canvasPixels[pixelIndex],
          context.canvasPixels[pixelIndex + MAX_DIMENSION]
        );
        prevPixel = context.canvasPixels[pixelIndex];
      }
    }

    context.canvasPixels[pixelIndex] = RGB_ALPHA;
  }

  pixelIndex = 0;
  for (let i = 0; i < MAX_DIMENSION; i += 1) {
    for (let j = 0; j < MAX_DIMENSION; j += 1, pixelIndex += 1) {
      if (!IS_ALPHA(context.canvasPixels[pixelIndex]))
        context.canvasPixels[pixelIndex] = QuantizePixel_Invert(context.canvasPixels[pixelIndex]);
    }
  }
};

export const ApplyImageProcessingEffects = (context: ImageProcessingContext): void => {
  switch (context.effect) {
    case IMAGE_EFFECT_POINTILLISM:
      ApplyImageEffect_Pointillism(context);
      break;
    case IMAGE_EFFECT_BLUR:
      ApplyImageEffect_Blur(context);
      break;
    case IMAGE_EFFECT_OUTLINE_COLORED:
      ApplyImageEffect_BlackOutline(context);
      ApplyImageEffect_PersonalityColor(context, context.personality ?? 0);
      break;
    case IMAGE_EFFECT_INVERT_BLACK_WHITE:
      ApplyImageEffect_BlackOutline(context);
      ApplyImageEffect_Invert(context);
      ApplyImageEffect_BlackAndWhite(context);
      // fall through
    case IMAGE_EFFECT_INVERT:
      ApplyImageEffect_Invert(context);
      break;
    case IMAGE_EFFECT_THICK_BLACK_WHITE:
      ApplyImageEffect_BlackOutline(context);
      ApplyImageEffect_BlurRight(context);
      ApplyImageEffect_BlurRight(context);
      ApplyImageEffect_BlurDown(context);
      ApplyImageEffect_BlackAndWhite(context);
      break;
    case IMAGE_EFFECT_SHIMMER:
      ApplyImageEffect_Shimmer(context);
      break;
    case IMAGE_EFFECT_OUTLINE:
      ApplyImageEffect_BlackOutline(context);
      break;
    case IMAGE_EFFECT_BLUR_RIGHT:
      ApplyImageEffect_BlurRight(context);
      break;
    case IMAGE_EFFECT_BLUR_DOWN:
      ApplyImageEffect_BlurDown(context);
      break;
    case IMAGE_EFFECT_GRAYSCALE_LIGHT:
      ApplyImageEffect_Grayscale(context);
      ApplyImageEffect_RedChannelGrayscale(context, 3);
      break;
    case IMAGE_EFFECT_CHARCOAL:
      ApplyImageEffect_BlackOutline(context);
      ApplyImageEffect_BlurRight(context);
      ApplyImageEffect_BlurDown(context);
      ApplyImageEffect_BlackAndWhite(context);
      ApplyImageEffect_Blur(context);
      ApplyImageEffect_Blur(context);
      ApplyImageEffect_RedChannelGrayscale(context, 2);
      ApplyImageEffect_RedChannelGrayscaleHighlight(context, 4);
      break;
  }
};

export const ConvertImageProcessingToGBA = (context: ImageProcessingContext): void => {
  const width = context.canvasWidth >> 3;
  const height = context.canvasHeight >> 3;
  const src_ = context.canvasPixels;
  const dest_ = context.dest ?? [];
  context.dest = dest_;

  if (context.var_16 === 2) {
    for (let i = 0; i < height; i += 1) {
      for (let j = 0; j < width; j += 1) {
        for (let k = 0; k < 8; k += 1) {
          const dest = ((i * width + j) << 5) + (k << 2);
          const src = ((((i << 3) + k) << 3) * width) + (j << 3);

          dest_[dest + 0] = (src_[src + 0] | (src_[src + 1] << 8)) & 0xffff;
          dest_[dest + 1] = (src_[src + 2] | (src_[src + 3] << 8)) & 0xffff;
          dest_[dest + 2] = (src_[src + 4] | (src_[src + 5] << 8)) & 0xffff;
          dest_[dest + 3] = (src_[src + 6] | (src_[src + 7] << 8)) & 0xffff;
        }
      }
    }
  } else {
    for (let i = 0; i < height; i += 1) {
      for (let j = 0; j < width; j += 1) {
        for (let k = 0; k < 8; k += 1) {
          const dest = ((i * width + j) << 4) + (k << 1);
          const src = ((((i << 3) + k) << 3) * width) + (j << 3);

          dest_[dest + 0] = (src_[src + 0] | (src_[src + 1] << 4) | (src_[src + 2] << 8) | (src_[src + 3] << 12)) & 0xffff;
          dest_[dest + 1] = (src_[src + 4] | (src_[src + 5] << 4) | (src_[src + 6] << 8) | (src_[src + 7] << 12)) & 0xffff;
        }
      }
    }
  }
};

export const QuantizePalette_Standard = (context: ImageProcessingContext, useLimitedPalette: boolean): void => {
  const paletteStart = context.paletteStart * 16;
  const maxIndex = useLimitedPalette ? 0xdf : 0xff;

  for (let i = 0; i < maxIndex; i += 1) {
    context.canvasPalette[paletteStart + i] = RGB_BLACK;
  }
  context.canvasPalette[paletteStart + maxIndex] = RGB2(15, 15, 15);

  forEachCanvasPixel(context, (_index, color) => {
    if (IS_ALPHA(color)) {
      return paletteStart;
    }

    const quantizedColor = QuantizePixel_Standard(color);
    let curIndex = 1;
    if (curIndex < maxIndex) {
      if (context.canvasPalette[paletteStart + curIndex] === RGB_BLACK) {
        context.canvasPalette[paletteStart + curIndex] = quantizedColor;
        return paletteStart + curIndex;
      }

      while (curIndex < maxIndex) {
        if (context.canvasPalette[paletteStart + curIndex] === RGB_BLACK) {
          context.canvasPalette[paletteStart + curIndex] = quantizedColor;
          return paletteStart + curIndex;
        }

        if (context.canvasPalette[paletteStart + curIndex] === quantizedColor) {
          return paletteStart + curIndex;
        }

        curIndex += 1;
      }
    }

    if (curIndex === maxIndex) {
      return curIndex;
    }

    return color;
  });
};

export const QuantizePalette_BlackAndWhite = (context: ImageProcessingContext): void => {
  const paletteStart = context.paletteStart * 16;
  forEachCanvasPixel(context, (_index, color) => {
    if (IS_ALPHA(color)) {
      return paletteStart;
    }
    if (QuantizePixel_BlackAndWhite(color) === RGB_BLACK) {
      return paletteStart + 1;
    }
    return paletteStart + 2;
  });
};

export const QuantizePalette_GrayscaleSmall = (context: ImageProcessingContext): void => {
  const paletteStart = context.paletteStart * 16;
  forEachCanvasPixel(context, (_index, color) =>
    IS_ALPHA(color) ? paletteStart : QuantizePixel_GrayscaleSmall(color) + paletteStart
  );
};

export const QuantizePalette_Grayscale = (context: ImageProcessingContext): void => {
  const paletteStart = context.paletteStart * 16;
  forEachCanvasPixel(context, (_index, color) =>
    IS_ALPHA(color) ? paletteStart : QuantizePixel_Grayscale(color) + paletteStart
  );
};

export const QuantizePalette_PrimaryColors = (context: ImageProcessingContext): void => {
  const paletteStart = context.paletteStart * 16;
  forEachCanvasPixel(context, (_index, color) =>
    IS_ALPHA(color) ? paletteStart : QuantizePixel_PrimaryColors(color) + paletteStart
  );
};

export const ApplyImageProcessingQuantization = (context: ImageProcessingContext): void => {
  const paletteStart = context.paletteStart * 16;
  switch (context.quantizeEffect) {
    case QUANTIZE_EFFECT_STANDARD:
      QuantizePalette_Standard(context, false);
      break;
    case QUANTIZE_EFFECT_STANDARD_LIMITED_COLORS:
      QuantizePalette_Standard(context, true);
      break;
    case QUANTIZE_EFFECT_PRIMARY_COLORS:
      SetPresetPalette_PrimaryColors(context.canvasPalette, paletteStart);
      QuantizePalette_PrimaryColors(context);
      break;
    case QUANTIZE_EFFECT_GRAYSCALE:
      SetPresetPalette_Grayscale(context.canvasPalette, paletteStart);
      QuantizePalette_Grayscale(context);
      break;
    case QUANTIZE_EFFECT_GRAYSCALE_SMALL:
      SetPresetPalette_GrayscaleSmall(context.canvasPalette, paletteStart);
      QuantizePalette_GrayscaleSmall(context);
      break;
    case QUANTIZE_EFFECT_BLACK_WHITE:
      SetPresetPalette_BlackAndWhite(context.canvasPalette, paletteStart);
      QuantizePalette_BlackAndWhite(context);
      break;
  }
};
