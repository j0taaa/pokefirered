export interface BattleTerrainPalette {
  sky: string;
  horizon: string;
  floor: string;
  accent: string;
}

type BattleWeather = 'none' | 'rain' | 'sun' | 'sandstorm' | 'hail';

interface GbaRgb5 {
  r: number;
  g: number;
  b: number;
}

const clamp5 = (value: number): number => Math.max(0, Math.min(31, value));
const clampCoeff = (value: number): number => Math.max(0, Math.min(16, Math.trunc(value)));

const rgb8To5 = (value: number): number => clamp5(Math.round((Math.max(0, Math.min(255, value)) * 31) / 255));
const rgb5To8 = (value: number): number => Math.min(255, Math.round((clamp5(value) * 255) / 31));

const parseHexChannel = (hex: string, start: number): number => Number.parseInt(hex.slice(start, start + 2), 16);

const parseHexColor = (hex: string): GbaRgb5 => {
  const normalized = hex.trim();
  if (!/^#[\da-fA-F]{6}$/u.test(normalized)) {
    throw new Error(`Unsupported hex color: ${hex}`);
  }

  return {
    r: rgb8To5(parseHexChannel(normalized, 1)),
    g: rgb8To5(parseHexChannel(normalized, 3)),
    b: rgb8To5(parseHexChannel(normalized, 5))
  };
};

const formatHexColor = ({ r, g, b }: GbaRgb5): string => {
  const toHex = (value: number): string => rgb5To8(value).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const encodeGbaRgb5 = ({ r, g, b }: GbaRgb5): number =>
  (clamp5(r) << 0) | (clamp5(g) << 5) | (clamp5(b) << 10);

export const decodeGbaRgb5 = (color: number): GbaRgb5 => ({
  r: color & 0x1f,
  g: (color >> 5) & 0x1f,
  b: (color >> 10) & 0x1f
});

export const blendGbaPaletteColor = (baseColor: number, blendColor: number, coefficient: number): number => {
  const coeff = clampCoeff(coefficient);
  if (coeff === 16) {
    return blendColor & 0x7fff;
  }

  const base = decodeGbaRgb5(baseColor);
  const blend = decodeGbaRgb5(blendColor);
  const mix = (from: number, to: number): number => clamp5(from + (((to - from) * coeff) >> 4));

  return encodeGbaRgb5({
    r: mix(base.r, blend.r),
    g: mix(base.g, blend.g),
    b: mix(base.b, blend.b)
  });
};

export const blendHexColor = (baseHex: string, blendHex: string, coefficient: number): string =>
  formatHexColor(
    decodeGbaRgb5(
      blendGbaPaletteColor(
        encodeGbaRgb5(parseHexColor(baseHex)),
        encodeGbaRgb5(parseHexColor(blendHex)),
        coefficient
      )
    )
  );

const WEATHER_TINTS: Record<Exclude<BattleWeather, 'none'>, { color: string; coeff: number }> = {
  rain: { color: '#5b74b5', coeff: 5 },
  sun: { color: '#ffd26b', coeff: 4 },
  sandstorm: { color: '#b08f52', coeff: 6 },
  hail: { color: '#eef7ff', coeff: 3 }
};

export const tintBattleTerrainPalette = (
  palette: BattleTerrainPalette,
  weather: BattleWeather
): BattleTerrainPalette => {
  if (weather === 'none') {
    return palette;
  }

  const tint = WEATHER_TINTS[weather];
  return {
    sky: blendHexColor(palette.sky, tint.color, tint.coeff),
    horizon: blendHexColor(palette.horizon, tint.color, Math.max(1, tint.coeff - 1)),
    floor: blendHexColor(palette.floor, tint.color, tint.coeff),
    accent: blendHexColor(palette.accent, tint.color, Math.max(1, tint.coeff - 2))
  };
};
