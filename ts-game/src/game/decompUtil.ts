export const gBitTable: number[] = Array.from({ length: 32 }, (_unused, i) => 1 << i);

export interface InvisibleSprite {
  x: number;
  y: number;
  subpriority: number;
  invisible: boolean;
  callback: string;
}

export interface UtilSpriteRuntime {
  sprites: InvisibleSprite[];
}

export const createUtilSpriteRuntime = (): UtilSpriteRuntime => ({
  sprites: []
});

export const createInvisibleSpriteWithCallback = (
  runtime: UtilSpriteRuntime,
  callback: string
): number => {
  const sprite = runtime.sprites.length & 0xff;
  runtime.sprites.push({
    x: 248,
    y: 168,
    subpriority: 14,
    invisible: true,
    callback
  });
  return sprite;
};

export const storeWordInTwoHalfwords = (h: number[], w: number): void => {
  h[0] = w & 0xffff;
  h[1] = (w >>> 16) & 0xffff;
};

const s16 = (value: number): number => {
  const v = value & 0xffff;
  return v & 0x8000 ? v - 0x10000 : v;
};

export const loadWordFromTwoHalfwords = (h: readonly number[]): number =>
  ((h[0] & 0xffff) | (s16(h[1]) << 16)) >>> 0;

export interface BgAffineSrcData {
  texX: number;
  texY: number;
  scrX: number;
  scrY: number;
  sx: number;
  sy: number;
  alpha: number;
}

export type BgAffineDstData = BgAffineSrcData;

export const setBgAffineStruct = (
  src: BgAffineSrcData,
  texX: number,
  texY: number,
  scrX: number,
  scrY: number,
  sx: number,
  sy: number,
  alpha: number
): void => {
  src.texX = texX >>> 0;
  src.texY = texY >>> 0;
  src.scrX = s16(scrX);
  src.scrY = s16(scrY);
  src.sx = s16(sx);
  src.sy = s16(sy);
  src.alpha = alpha & 0xffff;
};

export const doBgAffineSet = (
  dest: BgAffineDstData,
  texX: number,
  texY: number,
  scrX: number,
  scrY: number,
  sx: number,
  sy: number,
  alpha: number
): void => {
  const src: BgAffineSrcData = { texX: 0, texY: 0, scrX: 0, scrY: 0, sx: 0, sy: 0, alpha: 0 };
  setBgAffineStruct(src, texX, texY, scrX, scrY, sx, sy, alpha);
  Object.assign(dest, src);
};

const spriteDimensions = [
  [
    [1, 1],
    [2, 2],
    [4, 4],
    [8, 8]
  ],
  [
    [2, 1],
    [4, 1],
    [4, 2],
    [8, 4]
  ],
  [
    [1, 2],
    [1, 4],
    [2, 4],
    [4, 8]
  ]
] as const;

export const copySpriteTiles = (
  shape: number,
  size: number,
  tiles: Uint8Array,
  tilemap: Uint16Array,
  output: Uint8Array
): void => {
  const h = spriteDimensions[shape][size][1];
  const w = spriteDimensions[shape][size][0];
  const xflip = new Uint8Array(32);
  let tilemapOffset = 0;
  let outputOffset = 0;

  for (let y = 0; y < h; y += 1) {
    const filler = 32 - w;
    for (let x = 0; x < w; x += 1) {
      let tile = (tilemap[tilemapOffset] & 0x3ff) * 32;
      const attr = tilemap[tilemapOffset] & 0xc00;

      if (attr === 0) {
        output.set(tiles.subarray(tile, tile + 32), outputOffset);
      } else if (attr === 0x800) {
        for (let i = 0; i < 8; i += 1) {
          output.set(tiles.subarray(tile + (7 - i) * 4, tile + (7 - i) * 4 + 4), outputOffset + i * 4);
        }
      } else {
        for (let i = 0; i < 8; i += 1) {
          for (let j = 0; j < 4; j += 1) {
            const i2 = i * 4;
            xflip[i2 + (3 - j)] = ((tiles[tile + i2 + j] & 0xf) << 4) | (tiles[tile + i2 + j] >> 4);
          }
        }
        if (tilemap[tilemapOffset] & 0x800) {
          for (let i = 0; i < 8; i += 1) {
            tile += 1;
            tile -= 1;
            output.set(xflip.subarray((7 - i) * 4, (7 - i) * 4 + 4), outputOffset + i * 4);
          }
        } else {
          output.set(xflip, outputOffset);
        }
      }
      tilemapOffset += 1;
      outputOffset += 32;
    }
    tilemapOffset += filler;
  }
};

export const countTrailingZeroBits = (value: number): number => {
  let v = value >>> 0;
  for (let i = 0; i < 32; i += 1) {
    if ((v & 1) === 0) {
      v >>>= 1;
    } else {
      return i;
    }
  }
  return 0;
};

const calcCrc16TableEntry = (index: number): number => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? (crc >>> 1) ^ 0x8408 : crc >>> 1;
  }
  return crc & 0xffff;
};

export const gCrc16Table: number[] = Array.from({ length: 256 }, (_unused, i) => calcCrc16TableEntry(i));

export const calcCRC16 = (data: Uint8Array | readonly number[], length: number = data.length): number => {
  let crc = 0x1121;
  for (let i = 0; i < length; i += 1) {
    crc ^= data[i] & 0xff;
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0x8408 : crc >>> 1;
    }
    crc &= 0xffff;
  }
  return (~crc) & 0xffff;
};

export const calcCRC16WithTable = (
  data: Uint8Array | readonly number[],
  length: number = data.length
): number => {
  let crc = 0x1121;
  for (let i = 0; i < length; i += 1) {
    const byte = crc >>> 8;
    crc ^= data[i] & 0xff;
    crc = (byte ^ gCrc16Table[crc & 0xff]) & 0xffff;
  }
  return (~crc) & 0xffff;
};

export const calcByteArraySum = (
  array: Uint8Array | readonly number[],
  size: number = array.length
): number => {
  let result = 0;
  for (let i = 0; i < size; i += 1) {
    result = (result + (array[i] & 0xff)) >>> 0;
  }
  return result >>> 0;
};

export function CreateInvisibleSpriteWithCallback(
  runtime: UtilSpriteRuntime,
  callback: string
): number {
  return createInvisibleSpriteWithCallback(runtime, callback);
}

export function StoreWordInTwoHalfwords(h: number[], w: number): void {
  storeWordInTwoHalfwords(h, w);
}

export function LoadWordFromTwoHalfwords(h: readonly number[], w: number[]): void {
  w[0] = loadWordFromTwoHalfwords(h);
}

export function SetBgAffineStruct(
  src: BgAffineSrcData,
  texX: number,
  texY: number,
  scrX: number,
  scrY: number,
  sx: number,
  sy: number,
  alpha: number
): void {
  setBgAffineStruct(src, texX, texY, scrX, scrY, sx, sy, alpha);
}

export function DoBgAffineSet(
  dest: BgAffineDstData,
  texX: number,
  texY: number,
  scrX: number,
  scrY: number,
  sx: number,
  sy: number,
  alpha: number
): void {
  doBgAffineSet(dest, texX, texY, scrX, scrY, sx, sy, alpha);
}

export function CopySpriteTiles(
  shape: number,
  size: number,
  tiles: Uint8Array,
  tilemap: Uint16Array,
  output: Uint8Array
): void {
  copySpriteTiles(shape, size, tiles, tilemap, output);
}

export function CountTrailingZeroBits(value: number): number {
  return countTrailingZeroBits(value);
}

export function CalcCRC16(data: Uint8Array | readonly number[], length: number): number {
  return calcCRC16(data, length);
}

export function CalcCRC16WithTable(data: Uint8Array | readonly number[], length: number): number {
  return calcCRC16WithTable(data, length);
}

export function CalcByteArraySum(array: Uint8Array | readonly number[], size: number): number {
  return calcByteArraySum(array, size);
}
