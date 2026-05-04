import { describe, expect, test } from 'vitest';
import {
  decodeGba4bppTilesToPackedRaster,
  encodeGba4bppPackedRasterToTiles,
  lz77Type10Decompress,
  parseJascPalette,
  packed4bppRasterToRgbaBytes
} from '../src/rendering/gbaTileDecode';

describe('GBA tile decode rendering parity', () => {
  test('decodeGba4bppTilesToPackedRaster round-trips with encodeGba4bppPackedRasterToTiles', () => {
    const widthPx = 16;
    const heightPx = 16;
    const numTiles = (widthPx / 8) * (heightPx / 8);
    const tileBytes = new Uint8Array(numTiles * 32);
    for (let i = 0; i < tileBytes.length; i++) {
      tileBytes[i] = i & 0xff;
    }

    const packed = decodeGba4bppTilesToPackedRaster(tileBytes, widthPx, heightPx);
    const reencoded = encodeGba4bppPackedRasterToTiles(packed, widthPx, heightPx);

    expect(reencoded).toEqual(tileBytes);
  });

  test('decodeGba4bppTilesToPackedRaster with metatile layout round-trips', () => {
    const widthPx = 32;
    const heightPx = 32;
    const numTiles = (widthPx / 8) * (heightPx / 8);
    const tileBytes = new Uint8Array(numTiles * 32);
    for (let i = 0; i < tileBytes.length; i++) {
      tileBytes[i] = (i * 7 + 3) & 0xff;
    }

    const options = { metatilesWide: 2, metatileWidth: 2, metatileHeight: 2 };
    const packed = decodeGba4bppTilesToPackedRaster(tileBytes, widthPx, heightPx, options);
    const reencoded = encodeGba4bppPackedRasterToTiles(packed, widthPx, heightPx, options);

    expect(reencoded).toEqual(tileBytes);
  });

  test('decodeGba4bppTilesToPackedRaster throws on insufficient tile bytes', () => {
    const shortBytes = new Uint8Array(10);
    expect(() => decodeGba4bppTilesToPackedRaster(shortBytes, 16, 16)).toThrow();
  });

  test('packed4bppRasterToRgbaBytes maps palette indices to RGBA', () => {
    const widthPx = 8;
    const heightPx = 8;
    const packed = new Uint8Array(widthPx / 2 * heightPx);
    packed[0] = 0x10;
    packed[1] = 0x23;

    const palette = [
      { r: 0, g: 0, b: 0, a: 0 },
      { r: 255, g: 0, b: 0, a: 255 },
      { r: 0, g: 255, b: 0, a: 255 },
      { r: 0, g: 0, b: 255, a: 255 }
    ];

    const rgba = packed4bppRasterToRgbaBytes(packed, widthPx, heightPx, palette);
    expect(rgba.length).toBe(widthPx * heightPx * 4);

    expect(rgba[0]).toBe(255);
    expect(rgba[1]).toBe(0);
    expect(rgba[2]).toBe(0);
    expect(rgba[3]).toBe(255);

    expect(rgba[4]).toBe(0);
    expect(rgba[5]).toBe(0);
    expect(rgba[6]).toBe(0);
    expect(rgba[7]).toBe(0);
  });

  test('lz77Type10Decompress decompresses valid LZ77 data', () => {
    const compressed = new Uint8Array([
      0x10, 0x08, 0x00, 0x00,
      0x00,
      0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08
    ]);
    const result = lz77Type10Decompress(compressed);
    expect(result.length).toBe(8);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(2);
    expect(result[7]).toBe(8);
  });

  test('parseJascPalette parses valid JASC-PAL format', () => {
    const palText = 'JASC-PAL\n0100\n4\n0 0 0\n255 0 0\n0 255 0\n0 0 255';
    const palette = parseJascPalette(palText);
    expect(palette).toHaveLength(4);
    expect(palette[0]).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(palette[1]).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    expect(palette[2]).toEqual({ r: 0, g: 255, b: 0, a: 255 });
    expect(palette[3]).toEqual({ r: 0, g: 0, b: 255, a: 255 });
  });

  test('parseJascPalette forces alpha 0 on index 0', () => {
    const palText = 'JASC-PAL\n0100\n2\n255 255 255\n0 0 0';
    const palette = parseJascPalette(palText);
    expect(palette[0]!.a).toBe(0);
    expect(palette[1]!.a).toBe(255);
  });

  test('parseJascPalette throws on invalid header', () => {
    expect(() => parseJascPalette('INVALID')).toThrow();
  });
});