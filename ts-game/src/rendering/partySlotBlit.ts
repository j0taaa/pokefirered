/**
 * FireRed party slot panels (`BlitBitmapToPartyWindow` in `party_menu.c`).
 * Each byte in `slot_*.bin` is a tile index into the same tileset as `graphics/party_menu/bg.png` / `GetPartyMenuBgTile`.
 */

import slotMainUrl from '../../../graphics/party_menu/slot_main.bin?url';
import slotWideUrl from '../../../graphics/party_menu/slot_wide.bin?url';
import slotWideEmptyUrl from '../../../graphics/party_menu/slot_wide_empty.bin?url';

export type PartySlotTilemaps = {
  main: Uint8Array;
  wide: Uint8Array;
  wideEmpty: Uint8Array;
};

let cachedSlots: PartySlotTilemaps | null = null;

export const loadPartySlotTilemaps = async (): Promise<PartySlotTilemaps> => {
  if (cachedSlots) {
    return cachedSlots;
  }
  const [mainBuf, wideBuf, emptyBuf] = await Promise.all([
    fetch(slotMainUrl).then((r) => {
      if (!r.ok) {
        throw new Error(`slot_main fetch ${r.status}`);
      }
      return r.arrayBuffer();
    }),
    fetch(slotWideUrl).then((r) => {
      if (!r.ok) {
        throw new Error(`slot_wide fetch ${r.status}`);
      }
      return r.arrayBuffer();
    }),
    fetch(slotWideEmptyUrl).then((r) => {
      if (!r.ok) {
        throw new Error(`slot_wide_empty fetch ${r.status}`);
      }
      return r.arrayBuffer();
    })
  ]);
  cachedSlots = {
    main: new Uint8Array(mainBuf),
    wide: new Uint8Array(wideBuf),
    wideEmpty: new Uint8Array(emptyBuf)
  };
  return cachedSlots;
};

const TILE = 8;

/** Blit one party slot rectangle (tile indices, stride in bytes = menuBoxWidth from C). */
export const blitPartySlotTilemap = (
  dest: CanvasRenderingContext2D,
  destX: number,
  destY: number,
  tilemap: Uint8Array,
  menuBoxWidthTiles: number,
  widthTiles: number,
  heightTiles: number,
  tileset: CanvasImageSource,
  tilesetTilesPerRow: number
): void => {
  for (let row = 0; row < heightTiles; row += 1) {
    for (let col = 0; col < widthTiles; col += 1) {
      const flat = col + row * menuBoxWidthTiles;
      const tileId = tilemap[flat] ?? 0;
      const sx = (tileId % tilesetTilesPerRow) * TILE;
      const sy = Math.floor(tileId / tilesetTilesPerRow) * TILE;
      dest.drawImage(tileset, sx, sy, TILE, TILE, destX + col * TILE, destY + row * TILE, TILE, TILE);
    }
  }
};

export const partyBgTilesPerRow = (tileset: HTMLImageElement): number =>
  Math.max(1, Math.floor(tileset.naturalWidth / TILE));
