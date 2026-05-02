export interface BlendPaletteRuntime {
  gPlttBufferUnfaded: number[];
  gPlttBufferFaded: number[];
}

export const createBlendPaletteRuntime = (size = 0x200): BlendPaletteRuntime => ({
  gPlttBufferUnfaded: Array.from({ length: size }, () => 0),
  gPlttBufferFaded: Array.from({ length: size }, () => 0)
});

const toU16 = (value: number): number => value & 0xffff;

export const gbaRgb = (r: number, g: number, b: number): number =>
  toU16(((r & 0x1f) << 0) | ((g & 0x1f) << 5) | ((b & 0x1f) << 10));

export const gbaR = (color: number): number => color & 0x1f;
export const gbaG = (color: number): number => (color >> 5) & 0x1f;
export const gbaB = (color: number): number => (color >> 10) & 0x1f;

const blendChannel = (from: number, to: number, coeff: number): number =>
  from + (((to - from) * coeff) >> 4);

export function BlendPalette(
  runtime: BlendPaletteRuntime,
  palOffset: number,
  numEntries: number,
  coeff: number,
  blendColor: number
): void {
  for (let i = 0; i < (numEntries & 0xffff); i += 1) {
    const index = (i + palOffset) & 0xffff;
    const source = runtime.gPlttBufferUnfaded[index] ?? 0;
    const r = gbaR(source);
    const g = gbaG(source);
    const b = gbaB(source);
    runtime.gPlttBufferFaded[index] = toU16(
      (blendChannel(r, gbaR(blendColor), coeff & 0xff) << 0)
        | (blendChannel(g, gbaG(blendColor), coeff & 0xff) << 5)
        | (blendChannel(b, gbaB(blendColor), coeff & 0xff) << 10)
    );
  }
}

export function BlendPalettesAt(
  palbuff: number[],
  blendPal: number,
  coefficient: number,
  size: number
): void {
  let remaining = size | 0;
  let offset = 0;
  if ((coefficient >>> 0) === 16) {
    while (--remaining !== -1) {
      palbuff[offset++] = toU16(blendPal);
    }
  } else {
    const r = gbaR(blendPal);
    const g = gbaG(blendPal);
    const b = gbaB(blendPal);
    while (--remaining !== -1) {
      const color = palbuff[offset] ?? 0;
      const r2 = gbaR(color);
      const g2 = gbaG(color);
      const b2 = gbaB(color);
      palbuff[offset++] = toU16(
        (blendChannel(r2, r, coefficient | 0) << 0)
          | (blendChannel(g2, g, coefficient | 0) << 5)
          | (blendChannel(b2, b, coefficient | 0) << 10)
      );
    }
  }
}
