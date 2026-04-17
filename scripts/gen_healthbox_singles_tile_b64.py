#!/usr/bin/env python3
"""Emit `ts-game/src/rendering/healthboxSingles4bppB64.ts` from repo PNGs (gbagfx tile order)."""

from __future__ import annotations

import base64
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PNG_OPP = ROOT / "graphics/battle_interface/healthbox_singles_opponent.png"
PNG_PLR = ROOT / "graphics/battle_interface/healthbox_singles_player.png"
OUT = ROOT / "ts-game/src/rendering/healthboxSingles4bppB64.ts"


def read_png_indices(path: Path) -> tuple[int, int, bytes]:
    data = path.read_bytes()
    o = 8
    idat = b""
    w = h = bd = ct = 0
    while o < len(data):
        ln = int.from_bytes(data[o : o + 4], "big")
        o += 4
        tag = data[o : o + 4]
        o += 4
        chunk = data[o : o + ln]
        o += ln
        o += 4
        if tag == b"IHDR":
            w, h, bd, ct, _, _, _ = struct.unpack(">IIBBBBB", chunk)
        elif tag == b"IDAT":
            idat += chunk
        elif tag == b"IEND":
            break
    raw = zlib.decompress(idat)
    stride = (w * bd + 7) // 8
    out = bytearray(w * h)
    i = 0
    prev = bytearray(stride)

    def paeth(a: int, b: int, c: int) -> int:
        p = a + b - c
        pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
        if pa <= pb and pa <= pc:
            return a
        if pb <= pc:
            return b
        return c

    for y in range(h):
        f = raw[i]
        i += 1
        scan = bytearray(raw[i : i + stride])
        i += stride
        if f == 1:
            for x in range(stride):
                scan[x] = (scan[x] + (scan[x - 1] if x else 0)) & 255
        elif f == 2:
            for x in range(stride):
                scan[x] = (scan[x] + prev[x]) & 255
        elif f == 3:
            for x in range(stride):
                left = scan[x - 1] if x else 0
                scan[x] = (scan[x] + ((left + prev[x]) // 2)) & 255
        elif f == 4:
            for x in range(stride):
                left = scan[x - 1] if x else 0
                up = prev[x]
                ul = prev[x - 1] if x else 0
                scan[x] = (scan[x] + paeth(left, up, ul)) & 255
        prev = scan
        for x in range(w):
            b = x // 2
            out[y * w + x] = (scan[b] >> (4 if x % 2 == 0 else 0)) & 15
    return w, h, bytes(out)


def advance(stx: int, sty: int, mx: int, my: int, met_w: int, mw: int, mh: int) -> tuple[int, int, int, int]:
    stx += 1
    if stx == mw:
        stx = 0
        sty += 1
        if sty == mh:
            sty = 0
            mx += 1
            if mx == met_w:
                mx = 0
                my += 1
    return stx, sty, mx, my


def convert_to_tiles_4bpp(packed: bytes, w: int, h: int, met_w: int, mw: int, mh: int) -> bytes:
    pitch = (met_w * mw) * 4
    nt = (w // 8) * (h // 8)
    dest = bytearray(nt * 32)
    di = 0
    stx = sty = mx = my = 0
    for _ti in range(nt):
        for j in range(8):
            sy = (my * mh + sty) * 8 + j
            for k in range(4):
                sx = (mx * mw + stx) * 4 + k
                b = packed[sy * pitch + sx]
                left = b >> 4
                right = b & 0xF
                dest[di] = (right << 4) | left
                di += 1
        stx, sty, mx, my = advance(stx, sty, mx, my, met_w, mw, mh)
    return bytes(dest)


def png_to_tiles(path: Path) -> bytes:
    w, h, idx = read_png_indices(path)
    packed = bytearray((w // 2) * h)
    for y in range(h):
        for x in range(0, w, 2):
            packed[y * (w // 2) + x // 2] = (idx[y * w + x] << 4) | idx[y * w + x + 1]
    met_w = w // 8
    return convert_to_tiles_4bpp(bytes(packed), w, h, met_w, 1, 1)


def main() -> None:
    opp = png_to_tiles(PNG_OPP)
    plr = png_to_tiles(PNG_PLR)
    b64_opp = base64.b64encode(opp).decode("ascii")
    b64_plr = base64.b64encode(plr).decode("ascii")
    text = f"""/** Auto-generated from `graphics/battle_interface/healthbox_singles_*.png` (gbagfx `ConvertToTiles4Bpp` order). Re-run `scripts/gen_healthbox_singles_tile_b64.py`. */
import {{ decodeBase64ToUint8Array }} from './healthboxSingles4bppLoad';

export const HEALTHBOX_SINGLES_OPPONENT_4BPP_B64 = `{b64_opp}`;

export const HEALTHBOX_SINGLES_PLAYER_4BPP_B64 = `{b64_plr}`;

export const loadHealthboxSinglesOpponentTileBytes = (): Uint8Array =>
  decodeBase64ToUint8Array(HEALTHBOX_SINGLES_OPPONENT_4BPP_B64);

export const loadHealthboxSinglesPlayerTileBytes = (): Uint8Array =>
  decodeBase64ToUint8Array(HEALTHBOX_SINGLES_PLAYER_4BPP_B64);
"""
    OUT.write_text(text, encoding="utf-8")
    print(f"Wrote {OUT} ({len(opp)} + {len(plr)} tile bytes)")


if __name__ == "__main__":
    main()
