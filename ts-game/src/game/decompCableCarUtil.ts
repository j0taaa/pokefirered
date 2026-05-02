export const CABLE_CAR_TILEMAP_WIDTH = 32;
export const CABLE_CAR_TILEMAP_HEIGHT = 32;
export const CABLE_CAR_TILEMAP_BYTES_PER_ROW = 64;

const toU8 = (value: number): number => value & 0xff;
const toU16 = (value: number): number => value & 0xffff;

const writeU16 = (dest: Uint8Array, byteOffset: number, value: number): void => {
  const word = toU16(value);
  dest[byteOffset] = word & 0xff;
  dest[byteOffset + 1] = word >> 8;
};

const readU16 = (dest: Uint8Array, byteOffset: number): number =>
  (dest[byteOffset] ?? 0) | ((dest[byteOffset + 1] ?? 0) << 8);

export function CableCarUtil_FillWrapped(
  dest: Uint8Array,
  value: number,
  left: number,
  top: number,
  width: number,
  height: number
): void {
  const w = toU8(width);
  const h = toU8(height);
  let y = toU8(top);

  for (let i = 0; i < h; i += 1) {
    let x = toU8(left);
    for (let j = 0; j < w; j += 1) {
      writeU16(dest, y * CABLE_CAR_TILEMAP_BYTES_PER_ROW + x * 2, value);
      x = (x + 1) % CABLE_CAR_TILEMAP_WIDTH;
    }
    y = (y + 1) % CABLE_CAR_TILEMAP_HEIGHT;
  }
}

export function CableCarUtil_CopyWrapped(
  dest: Uint8Array,
  src: readonly number[],
  left: number,
  top: number,
  width: number,
  height: number
): void {
  const w = toU8(width);
  const h = toU8(height);
  let srcIndex = 0;
  let y = toU8(top);

  for (let i = 0; i < h; i += 1) {
    let x = toU8(left);
    for (let j = 0; j < w; j += 1) {
      writeU16(dest, y * CABLE_CAR_TILEMAP_BYTES_PER_ROW + x * 2, src[srcIndex++] ?? 0);
      x = (x + 1) % CABLE_CAR_TILEMAP_WIDTH;
    }
    y = (y + 1) % CABLE_CAR_TILEMAP_HEIGHT;
  }
}

export const cableCarUtilReadTile = (dest: Uint8Array, x: number, y: number): number =>
  readU16(
    dest,
    (toU8(y) % CABLE_CAR_TILEMAP_HEIGHT) * CABLE_CAR_TILEMAP_BYTES_PER_ROW
      + (toU8(x) % CABLE_CAR_TILEMAP_WIDTH) * 2
  );
