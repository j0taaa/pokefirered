import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import {
  decodeGba4bppTilesToPackedRaster,
  decodeGba4bppTilesToRgbaBytes,
  encodeGba4bppPackedRasterToTiles,
  lz77Type10Decompress,
  parseJascPalette
} from '../src/rendering/gbaTileDecode';
import {
  loadHealthboxSinglesOpponentTileBytes,
  loadHealthboxSinglesPlayerTileBytes
} from '../src/rendering/healthboxSingles4bppB64';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const healthboxPalPath = join(root, 'graphics', 'battle_interface', 'healthbox.pal');

const sha256 = (buf: Uint8Array): string =>
  createHash('sha256').update(buf).digest('hex');

describe('gbaTileDecode', () => {
  test('round-trips packed 4bpp raster through tile bytes (16×8, two tiles)', () => {
    const widthPx = 16;
    const heightPx = 8;
    const pitch = (widthPx / 8) * 4;
    const packed = new Uint8Array(pitch * heightPx);
    for (let i = 0; i < packed.length; i += 1) {
      packed[i] = ((i + 3) & 0xf) << 4 | ((i * 2) & 0xf);
    }
    const tiles = encodeGba4bppPackedRasterToTiles(packed, widthPx, heightPx);
    const back = decodeGba4bppTilesToPackedRaster(tiles, widthPx, heightPx);
    expect(Array.from(back)).toEqual(Array.from(packed));
  });

  test('parseJascPalette forces index 0 alpha 0', () => {
    const pal = parseJascPalette(readFileSync(healthboxPalPath, 'utf8'));
    expect(pal).toHaveLength(16);
    expect(pal[0]!.a).toBe(0);
    expect(pal[1]!.a).toBe(255);
  });

  test('healthbox singles decode matches PNG+JASC RGBA (sha256 parity)', () => {
    const pal = parseJascPalette(readFileSync(healthboxPalPath, 'utf8'));
    const opp = loadHealthboxSinglesOpponentTileBytes();
    const plr = loadHealthboxSinglesPlayerTileBytes();
    const rgbaOpp = decodeGba4bppTilesToRgbaBytes(opp, 128, 32, pal);
    const rgbaPlr = decodeGba4bppTilesToRgbaBytes(plr, 128, 64, pal);
    expect(sha256(rgbaOpp)).toBe(
      '19186cd7812401a944df54ac30e0668051f17542f36b68974645ca4c3db1c596'
    );
    expect(sha256(rgbaPlr)).toBe(
      '3917d02d14d7ddef7eee5c3a0b6eb142cfdc051e9ae462f1c9e0f77a1cf38aa1'
    );
    // In-tree indexed PNGs match this tile layout; no gbagfx re-export needed.
  });

  test('lz77Type10Decompress matches gbagfx header + one flags block of literals', () => {
    const payload = new TextEncoder().encode('HelloLZ!');
    expect(payload.length).toBe(8);
    const compressed = new Uint8Array(4 + 1 + payload.length);
    compressed[0] = 0x10;
    compressed[1] = 8;
    compressed[2] = 0;
    compressed[3] = 0;
    compressed[4] = 0;
    compressed.set(payload, 5);
    const out = lz77Type10Decompress(compressed);
    expect(new TextDecoder().decode(out)).toBe('HelloLZ!');
  });
});
