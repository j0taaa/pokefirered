/**
 * GBA 4bpp OBJ tile layout matching `tools/gbagfx/gfx.c`:
 * `ConvertFromTiles4Bpp` / `ConvertToTiles4Bpp` with default metatile size 1×1.
 * Linear tile bytes (as after `LZ77UnCompWram` + `LoadSpriteSheet`) → packed 4bpp
 * raster (2 pixels per byte) → RGBA for canvas `ImageData`.
 */

export type GbaRgba = { r: number; g: number; b: number; a: number };

export type TileDecodeOptions = {
  /** Tile columns across the bitmap width; default `widthPx / 8`. */
  metatilesWide?: number;
  metatileWidth?: number;
  metatileHeight?: number;
  invertColors?: boolean;
};

export const advanceMetatilePosition = (
  subTileX: number,
  subTileY: number,
  metatileX: number,
  metatileY: number,
  metatilesWide: number,
  metatileWidth: number,
  metatileHeight: number
): [number, number, number, number] => {
  let sx = subTileX + 1;
  let sy = subTileY;
  let mx = metatileX;
  let my = metatileY;
  if (sx === metatileWidth) {
    sx = 0;
    sy += 1;
    if (sy === metatileHeight) {
      sy = 0;
      mx += 1;
      if (mx === metatilesWide) {
        mx = 0;
        my += 1;
      }
    }
  }
  return [sx, sy, mx, my];
};

/**
 * Port of `ConvertFromTiles4Bpp` in `tools/gbagfx/gfx.c`: tile stream → packed
 * raster (row-major, `pitch = metatilesWide * metatileWidth * 4` bytes per row).
 */
export const decodeGba4bppTilesToPackedRaster = (
  tileBytes: Uint8Array,
  widthPx: number,
  heightPx: number,
  options?: TileDecodeOptions
): Uint8Array => {
  const metatilesWide = options?.metatilesWide ?? widthPx / 8;
  const metatileWidth = options?.metatileWidth ?? 1;
  const metatileHeight = options?.metatileHeight ?? 1;
  const invertColors = options?.invertColors ?? false;

  const numTiles = (widthPx / 8) * (heightPx / 8);
  const need = numTiles * 32;
  if (tileBytes.length < need) {
    throw new Error(
      `decodeGba4bppTilesToPackedRaster: need ${need} tile bytes, got ${tileBytes.length}`
    );
  }

  const pitch = metatilesWide * metatileWidth * 4;
  const dest = new Uint8Array(pitch * heightPx);
  let srcPos = 0;
  let subTileX = 0;
  let subTileY = 0;
  let metatileX = 0;
  let metatileY = 0;

  for (let i = 0; i < numTiles; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      const destY = (metatileY * metatileHeight + subTileY) * 8 + j;
      for (let k = 0; k < 4; k += 1) {
        const destX = (metatileX * metatileWidth + subTileX) * 4 + k;
        let srcPixelPair = tileBytes[srcPos]!;
        srcPos += 1;
        let leftPixel = srcPixelPair & 0xf;
        let rightPixel = srcPixelPair >> 4;
        if (invertColors) {
          leftPixel = 15 - leftPixel;
          rightPixel = 15 - rightPixel;
        }
        dest[destY * pitch + destX] = (leftPixel << 4) | rightPixel;
      }
    }
    [subTileX, subTileY, metatileX, metatileY] = advanceMetatilePosition(
      subTileX,
      subTileY,
      metatileX,
      metatileY,
      metatilesWide,
      metatileWidth,
      metatileHeight
    );
  }

  return dest;
};

/** Expand packed 4bpp (high nibble = left pixel) to RGBA bytes (length `widthPx * heightPx * 4`). */
export const packed4bppRasterToRgbaBytes = (
  packed: Uint8Array,
  widthPx: number,
  heightPx: number,
  palette: ReadonlyArray<GbaRgba>
): Uint8Array => {
  const pitch = widthPx / 2;
  const px = new Uint8Array(widthPx * heightPx * 4);
  for (let y = 0; y < heightPx; y += 1) {
    for (let xPair = 0; xPair < pitch; xPair += 1) {
      const b = packed[y * pitch + xPair]!;
      const left = b >> 4;
      const right = b & 0xf;
      const xl = xPair * 2;
      const i0 = (y * widthPx + xl) * 4;
      const c0 = palette[left] ?? { r: 0, g: 0, b: 0, a: 0 };
      const c1 = palette[right] ?? { r: 0, g: 0, b: 0, a: 0 };
      px[i0] = c0.r;
      px[i0 + 1] = c0.g;
      px[i0 + 2] = c0.b;
      px[i0 + 3] = c0.a;
      const i1 = i0 + 4;
      px[i1] = c1.r;
      px[i1 + 1] = c1.g;
      px[i1 + 2] = c1.b;
      px[i1 + 3] = c1.a;
    }
  }
  return px;
};

export const decodeGba4bppTilesToRgbaBytes = (
  tileBytes: Uint8Array,
  widthPx: number,
  heightPx: number,
  palette: ReadonlyArray<GbaRgba>,
  options?: TileDecodeOptions
): Uint8Array => {
  const packed = decodeGba4bppTilesToPackedRaster(tileBytes, widthPx, heightPx, options);
  return packed4bppRasterToRgbaBytes(packed, widthPx, heightPx, palette);
};

export const decodeGba4bppTilesToImageData = (
  tileBytes: Uint8Array,
  widthPx: number,
  heightPx: number,
  palette: ReadonlyArray<GbaRgba>,
  options?: TileDecodeOptions
): ImageData => {
  const px = decodeGba4bppTilesToRgbaBytes(tileBytes, widthPx, heightPx, palette, options);
  return new ImageData(new Uint8ClampedArray(px), widthPx, heightPx);
};

/**
 * Inverse of `decodeGba4bppTilesToPackedRaster` — port of `ConvertToTiles4Bpp`
 * (for tests / tooling).
 */
export const encodeGba4bppPackedRasterToTiles = (
  packed: Uint8Array,
  widthPx: number,
  heightPx: number,
  options?: TileDecodeOptions
): Uint8Array => {
  const metatilesWide = options?.metatilesWide ?? widthPx / 8;
  const metatileWidth = options?.metatileWidth ?? 1;
  const metatileHeight = options?.metatileHeight ?? 1;
  const invertColors = options?.invertColors ?? false;

  const pitch = metatilesWide * metatileWidth * 4;
  const numTiles = (widthPx / 8) * (heightPx / 8);
  const dest = new Uint8Array(numTiles * 32);
  let destPos = 0;
  let subTileX = 0;
  let subTileY = 0;
  let metatileX = 0;
  let metatileY = 0;

  for (let i = 0; i < numTiles; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      const srcY = (metatileY * metatileHeight + subTileY) * 8 + j;
      for (let k = 0; k < 4; k += 1) {
        const srcX = (metatileX * metatileWidth + subTileX) * 4 + k;
        let srcPixelPair = packed[srcY * pitch + srcX]!;
        let leftPixel = srcPixelPair >> 4;
        let rightPixel = srcPixelPair & 0xf;
        if (invertColors) {
          leftPixel = 15 - leftPixel;
          rightPixel = 15 - rightPixel;
        }
        dest[destPos] = (rightPixel << 4) | leftPixel;
        destPos += 1;
      }
    }
    [subTileX, subTileY, metatileX, metatileY] = advanceMetatilePosition(
      subTileX,
      subTileY,
      metatileX,
      metatileY,
      metatilesWide,
      metatileWidth,
      metatileHeight
    );
  }

  return dest;
};

/** GBA LZ77 type `0x10` — same header as `tools/gbagfx/lz.c` `LZDecompress`. */
export const lz77Type10Decompress = (src: Uint8Array): Uint8Array => {
  if (src.length < 4) {
    throw new Error('lz77Type10Decompress: input too short');
  }
  const destSize = src[1]! | (src[2]! << 8) | (src[3]! << 16);
  const dest = new Uint8Array(destSize);
  let srcPos = 4;
  let destPos = 0;

  while (destPos < destSize) {
    if (srcPos >= src.length) {
      throw new Error('lz77Type10Decompress: unexpected end of compressed data');
    }
    let flags = src[srcPos]!;
    srcPos += 1;
    for (let i = 0; i < 8; i += 1) {
      if (destPos >= destSize) {
        break;
      }
      if (flags & 0x80) {
        if (srcPos + 1 >= src.length) {
          throw new Error('lz77Type10Decompress: truncated block');
        }
        const hi = src[srcPos]!;
        const lo = src[srcPos + 1]!;
        srcPos += 2;
        const blockSize = (hi >> 4) + 3;
        const blockDistance = (((hi & 0xf) << 8) | lo) + 1;
        let blockPos = destPos - blockDistance;
        if (blockPos < 0) {
          throw new Error('lz77Type10Decompress: invalid distance');
        }
        let n = blockSize;
        if (destPos + n > destSize) {
          n = destSize - destPos;
        }
        for (let j = 0; j < n; j += 1) {
          dest[destPos] = dest[blockPos + j]!;
          destPos += 1;
        }
      } else {
        if (srcPos >= src.length) {
          throw new Error('lz77Type10Decompress: truncated literal');
        }
        dest[destPos] = src[srcPos]!;
        srcPos += 1;
        destPos += 1;
      }
      flags <<= 1;
    }
  }

  return dest;
};

/**
 * Parse `JASC-PAL` text (e.g. `graphics/battle_interface/healthbox.pal`).
 * Index 0 is forced to alpha 0 for OBJ transparency; other entries alpha 255.
 */
export const parseJascPalette = (text: string): GbaRgba[] => {
  const lines = text.trim().split(/\r?\n/);
  if (lines[0] !== 'JASC-PAL') {
    throw new Error('parseJascPalette: expected JASC-PAL header');
  }
  const count = Number(lines[2]);
  if (!Number.isFinite(count) || count <= 0) {
    throw new Error('parseJascPalette: invalid color count');
  }
  const out: GbaRgba[] = [];
  for (let i = 0; i < count; i += 1) {
    const parts = lines[3 + i]?.trim().split(/\s+/).map(Number) ?? [];
    const [r, g, b] = parts;
    if (![r, g, b].every((n) => Number.isFinite(n))) {
      throw new Error(`parseJascPalette: bad RGB line ${3 + i}`);
    }
    const a = i === 0 ? 0 : 255;
    out.push({ r: r & 255, g: g & 255, b: b & 255, a });
  }
  return out;
};
