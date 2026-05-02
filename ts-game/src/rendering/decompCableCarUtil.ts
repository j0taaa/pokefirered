import {
  BG_BYTES_PER_ROW,
  BG_MAP_ENTRY_SIZE,
  BG_SCREEN_TILE_HEIGHT,
  BG_SCREEN_TILE_WIDTH
} from './decompBgRegs';

const wrapBgTileX = (value: number): number => ((value % BG_SCREEN_TILE_WIDTH) + BG_SCREEN_TILE_WIDTH) % BG_SCREEN_TILE_WIDTH;
const wrapBgTileY = (value: number): number => ((value % BG_SCREEN_TILE_HEIGHT) + BG_SCREEN_TILE_HEIGHT) % BG_SCREEN_TILE_HEIGHT;

const readBgMapEntry = (tilemap: Uint8Array, tileX: number, tileY: number): number => {
  const wrappedX = wrapBgTileX(tileX);
  const wrappedY = wrapBgTileY(tileY);
  const offset = wrappedY * BG_BYTES_PER_ROW + wrappedX * BG_MAP_ENTRY_SIZE;
  const lo = tilemap[offset] ?? 0;
  const hi = tilemap[offset + 1] ?? 0;
  return lo | (hi << 8);
};

const writeBgMapEntry = (tilemap: Uint8Array, tileX: number, tileY: number, value: number): void => {
  const wrappedX = wrapBgTileX(tileX);
  const wrappedY = wrapBgTileY(tileY);
  const offset = wrappedY * BG_BYTES_PER_ROW + wrappedX * BG_MAP_ENTRY_SIZE;
  tilemap[offset] = value & 0xff;
  tilemap[offset + 1] = (value >> 8) & 0xff;
};

export const fillWrappedBgTilemapRect = (
  tilemap: Uint8Array,
  value: number,
  left: number,
  top: number,
  width: number,
  height: number
): Uint8Array => {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      writeBgMapEntry(tilemap, left + x, top + y, value);
    }
  }
  return tilemap;
};

export const copyWrappedBgTilemapRect = (
  tilemap: Uint8Array,
  sourceEntries: readonly number[],
  left: number,
  top: number,
  width: number,
  height: number
): Uint8Array => {
  let sourceIndex = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      writeBgMapEntry(tilemap, left + x, top + y, sourceEntries[sourceIndex] ?? 0);
      sourceIndex += 1;
    }
  }
  return tilemap;
};

export const copyWrappedBgTilemapRegion = (
  tilemap: Uint8Array,
  left: number,
  top: number,
  width: number,
  height: number
): Uint16Array => {
  const region = new Uint16Array(width * height);
  let index = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      region[index] = readBgMapEntry(tilemap, left + x, top + y);
      index += 1;
    }
  }
  return region;
};

export const decodeBgMapEntry = (entry: number): { id: number; hflip: boolean; vflip: boolean; pal: number } => ({
  id: entry & 0x03ff,
  hflip: (entry & 0x0400) !== 0,
  vflip: (entry & 0x0800) !== 0,
  pal: (entry >> 12) & 0x0f
});
