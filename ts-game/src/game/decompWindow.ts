export const WINDOWS_MAX = 32;
export const WINDOW_NONE = 0xff;
export const WINDOW_C_TRANSLATION_UNIT = 'src/window.c';

export const WINDOW_BG = 0;
export const WINDOW_TILEMAP_LEFT = 1;
export const WINDOW_TILEMAP_TOP = 2;
export const WINDOW_WIDTH = 3;
export const WINDOW_HEIGHT = 4;
export const WINDOW_PALETTE_NUM = 5;
export const WINDOW_BASE_BLOCK = 6;
export const WINDOW_TILE_DATA = 7;

export const COPYWIN_NONE = 0;
export const COPYWIN_MAP = 1;
export const COPYWIN_GFX = 2;
export const COPYWIN_FULL = 3;

export const BG_ATTR_MAPSIZE = 8;
export const BG_ATTR_BASETILE = 10;

export const BG_TILE_FIND_FREE_SPACE = 0;
export const BG_TILE_ALLOC = 1;
export const BG_TILE_FREE = 2;

export const sDummyWindowTemplate = {
  bg: 0xff,
  tilemapLeft: 0,
  tilemapTop: 0,
  width: 0,
  height: 0,
  paletteNum: 0,
  baseBlock: 0,
} as const;

export const NULLSUB_8_SENTINEL = 'nullsub_8';

export function nullsub_8(): void {}

export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface Window {
  window: WindowTemplate;
  tileData: Uint8Array | null;
}

export interface Bitmap {
  pixels: Uint8Array;
  width: number;
  height: number;
}

export interface WindowRuntime {
  gWindowClearTile: number;
  gWindowBgTilemapBuffers: Array<Uint8Array | null | typeof NULLSUB_8_SENTINEL>;
  gWindows: Window[];
  gWindowTileAutoAllocEnabled: boolean;
  bgTilemapBuffers: Array<Uint8Array | null>;
  bgMapSizes: number[];
  bgBaseTiles: number[];
  bgTileAllocNext: number[];
  allocationFailures: number[];
  freedObjects: unknown[];
  calls: Array<{ fn: string; args: unknown[] }>;
}

export type WindowFunc = (
  bg: number,
  tilemapLeft: number,
  tilemapTop: number,
  width: number,
  height: number,
  paletteNum: number,
) => void;

export const createWindowRuntime = (): WindowRuntime => ({
  gWindowClearTile: 0,
  gWindowBgTilemapBuffers: [null, null, null, null],
  gWindows: Array.from({ length: WINDOWS_MAX }, () => ({
    window: cloneTemplate(sDummyWindowTemplate),
    tileData: null,
  })),
  gWindowTileAutoAllocEnabled: false,
  bgTilemapBuffers: [null, null, null, null],
  bgMapSizes: [0x800, 0x800, 0x800, 0x800],
  bgBaseTiles: [0, 0, 0, 0],
  bgTileAllocNext: [0, 0, 0, 0],
  allocationFailures: [],
  freedObjects: [],
  calls: [],
});

export function InitWindows(runtime: WindowRuntime, templates: readonly WindowTemplate[]): boolean {
  let allocatedTilemapBuffer: Uint8Array | null;
  let allocatedBaseBlock = 0;

  for (let i = 0; i < 4; ++i) {
    const bgTilemapBuffer = GetBgTilemapBuffer(runtime, i);
    if (bgTilemapBuffer !== null) {
      runtime.gWindowBgTilemapBuffers[i] = NULLSUB_8_SENTINEL;
    } else {
      runtime.gWindowBgTilemapBuffers[i] = bgTilemapBuffer;
    }
  }

  for (let i = 0; i < WINDOWS_MAX; ++i) {
    runtime.gWindows[i].window = cloneTemplate(sDummyWindowTemplate);
    runtime.gWindows[i].tileData = null;
  }

  for (let i = 0, bgLayer = templates[i]?.bg; bgLayer !== 0xff && i < WINDOWS_MAX; ++i, bgLayer = templates[i]?.bg) {
    if (runtime.gWindowTileAutoAllocEnabled) {
      allocatedBaseBlock = BgTileAllocOp(runtime, bgLayer, 0, templates[i].width * templates[i].height, BG_TILE_FIND_FREE_SPACE);
      if (allocatedBaseBlock === -1) {
        return false;
      }
    }

    if (runtime.gWindowBgTilemapBuffers[bgLayer] === null) {
      const bgSize = GetBgAttribute(runtime, bgLayer, BG_ATTR_MAPSIZE);
      if (bgSize !== 0xffff) {
        allocatedTilemapBuffer = Alloc(runtime, bgSize);
        if (allocatedTilemapBuffer === null) {
          FreeAllWindowBuffers(runtime);
          return false;
        }
        for (let j = 0; j < bgSize; ++j) {
          allocatedTilemapBuffer[j] = 0;
        }
        runtime.gWindowBgTilemapBuffers[bgLayer] = allocatedTilemapBuffer;
        SetBgTilemapBuffer(runtime, bgLayer, allocatedTilemapBuffer);
      }
    }

    allocatedTilemapBuffer = Alloc(runtime, u16(0x20 * (templates[i].width * templates[i].height)));
    if (allocatedTilemapBuffer === null) {
      if (GetNumActiveWindowsOnBg(runtime, bgLayer) === 0 && runtime.gWindowBgTilemapBuffers[bgLayer] !== NULLSUB_8_SENTINEL) {
        Free(runtime, runtime.gWindowBgTilemapBuffers[bgLayer]);
        runtime.gWindowBgTilemapBuffers[bgLayer] = allocatedTilemapBuffer;
      }
      return false;
    }

    runtime.gWindows[i].tileData = allocatedTilemapBuffer;
    runtime.gWindows[i].window = cloneTemplate(templates[i]);

    if (runtime.gWindowTileAutoAllocEnabled) {
      runtime.gWindows[i].window.baseBlock = allocatedBaseBlock;
      BgTileAllocOp(runtime, bgLayer, allocatedBaseBlock, templates[i].width * templates[i].height, BG_TILE_ALLOC);
    }
  }

  runtime.gWindowClearTile = 0;
  return true;
}

export function AddWindow(runtime: WindowRuntime, template: WindowTemplate): number {
  let win = 0;
  let bgLayer = 0;
  let allocatedBaseBlock = 0;
  let allocatedTilemapBuffer: Uint8Array | null;

  for (; win < WINDOWS_MAX; ++win) {
    bgLayer = runtime.gWindows[win].window.bg;
    if (bgLayer === 0xff) {
      break;
    }
  }

  if (win === WINDOWS_MAX) {
    return WINDOW_NONE;
  }

  bgLayer = template.bg;

  if (runtime.gWindowTileAutoAllocEnabled) {
    allocatedBaseBlock = BgTileAllocOp(runtime, bgLayer, 0, template.width * template.height, BG_TILE_FIND_FREE_SPACE);
    if (allocatedBaseBlock === -1) {
      return WINDOW_NONE;
    }
  }

  if (runtime.gWindowBgTilemapBuffers[bgLayer] === null) {
    const bgSize = GetBgAttribute(runtime, bgLayer, BG_ATTR_MAPSIZE);
    if (bgSize !== 0xffff) {
      allocatedTilemapBuffer = Alloc(runtime, bgSize);
      if (allocatedTilemapBuffer === null) {
        return WINDOW_NONE;
      }
      for (let i = 0; i < bgSize; ++i) {
        allocatedTilemapBuffer[i] = 0;
      }
      runtime.gWindowBgTilemapBuffers[bgLayer] = allocatedTilemapBuffer;
      SetBgTilemapBuffer(runtime, bgLayer, allocatedTilemapBuffer);
    }
  }

  allocatedTilemapBuffer = Alloc(runtime, u16(0x20 * (template.width * template.height)));
  if (allocatedTilemapBuffer === null) {
    if (GetNumActiveWindowsOnBg(runtime, bgLayer) === 0 && runtime.gWindowBgTilemapBuffers[bgLayer] !== NULLSUB_8_SENTINEL) {
      Free(runtime, runtime.gWindowBgTilemapBuffers[bgLayer]);
      runtime.gWindowBgTilemapBuffers[bgLayer] = allocatedTilemapBuffer;
    }
    return WINDOW_NONE;
  }

  runtime.gWindows[win].tileData = allocatedTilemapBuffer;
  runtime.gWindows[win].window = cloneTemplate(template);

  if (runtime.gWindowTileAutoAllocEnabled) {
    runtime.gWindows[win].window.baseBlock = allocatedBaseBlock;
    BgTileAllocOp(runtime, bgLayer, allocatedBaseBlock, runtime.gWindows[win].window.width * runtime.gWindows[win].window.height, BG_TILE_ALLOC);
  }

  return win;
}

export function RemoveWindow(runtime: WindowRuntime, windowId: number): void {
  const bgLayer = runtime.gWindows[windowId].window.bg;

  if (runtime.gWindowTileAutoAllocEnabled) {
    const window = runtime.gWindows[windowId].window;
    BgTileAllocOp(runtime, bgLayer, window.baseBlock, window.width * window.height, BG_TILE_FREE);
  }

  runtime.gWindows[windowId].window = cloneTemplate(sDummyWindowTemplate);

  if (GetNumActiveWindowsOnBg(runtime, bgLayer) === 0) {
    if (runtime.gWindowBgTilemapBuffers[bgLayer] !== NULLSUB_8_SENTINEL) {
      Free(runtime, runtime.gWindowBgTilemapBuffers[bgLayer]);
      runtime.gWindowBgTilemapBuffers[bgLayer] = null;
    }
  }

  if (runtime.gWindows[windowId].tileData !== null) {
    Free(runtime, runtime.gWindows[windowId].tileData);
    runtime.gWindows[windowId].tileData = null;
  }
}

export function FreeAllWindowBuffers(runtime: WindowRuntime): void {
  for (let i = 0; i < 4; ++i) {
    if (runtime.gWindowBgTilemapBuffers[i] !== null && runtime.gWindowBgTilemapBuffers[i] !== NULLSUB_8_SENTINEL) {
      Free(runtime, runtime.gWindowBgTilemapBuffers[i]);
      runtime.gWindowBgTilemapBuffers[i] = null;
    }
  }

  for (let i = 0; i < WINDOWS_MAX; ++i) {
    if (runtime.gWindows[i].tileData !== null) {
      Free(runtime, runtime.gWindows[i].tileData);
      runtime.gWindows[i].tileData = null;
    }
  }
}

export function CopyWindowToVram(runtime: WindowRuntime, windowId: number, mode: number): void {
  const windowLocal = cloneWindow(runtime.gWindows[windowId]);
  const windowSize = u16(32 * (windowLocal.window.width * windowLocal.window.height));

  switch (mode) {
    case COPYWIN_MAP:
      CopyBgTilemapBufferToVram(runtime, windowLocal.window.bg);
      break;
    case COPYWIN_GFX:
      LoadBgTiles(runtime, windowLocal.window.bg, windowLocal.tileData, windowSize, windowLocal.window.baseBlock);
      break;
    case COPYWIN_FULL:
      LoadBgTiles(runtime, windowLocal.window.bg, windowLocal.tileData, windowSize, windowLocal.window.baseBlock);
      CopyBgTilemapBufferToVram(runtime, windowLocal.window.bg);
      break;
  }
}

export function PutWindowTilemap(runtime: WindowRuntime, windowId: number): void {
  const windowLocal = cloneWindow(runtime.gWindows[windowId]);
  WriteSequenceToBgTilemapBuffer(
    runtime,
    windowLocal.window.bg,
    GetBgAttribute(runtime, windowLocal.window.bg, BG_ATTR_BASETILE) + windowLocal.window.baseBlock,
    windowLocal.window.tilemapLeft,
    windowLocal.window.tilemapTop,
    windowLocal.window.width,
    windowLocal.window.height,
    windowLocal.window.paletteNum,
    1,
  );
}

export function PutWindowRectTilemapOverridePalette(
  runtime: WindowRuntime,
  windowId: number,
  x: number,
  y: number,
  width: number,
  height: number,
  palette: number,
): void {
  const windowLocal = cloneWindow(runtime.gWindows[windowId]);
  let currentRow = u16(windowLocal.window.baseBlock + (y * windowLocal.window.width) + x + GetBgAttribute(runtime, windowLocal.window.bg, BG_ATTR_BASETILE));
  for (let i = 0; i < height; ++i) {
    WriteSequenceToBgTilemapBuffer(runtime, windowLocal.window.bg, currentRow, windowLocal.window.tilemapLeft + x, windowLocal.window.tilemapTop + y + i, width, 1, palette, 1);
    currentRow = u16(currentRow + windowLocal.window.width);
  }
}

export function ClearWindowTilemap(runtime: WindowRuntime, windowId: number): void {
  const windowLocal = cloneWindow(runtime.gWindows[windowId]);
  FillBgTilemapBufferRect(runtime, windowLocal.window.bg, runtime.gWindowClearTile, windowLocal.window.tilemapLeft, windowLocal.window.tilemapTop, windowLocal.window.width, windowLocal.window.height, windowLocal.window.paletteNum);
}

export function PutWindowRectTilemap(runtime: WindowRuntime, windowId: number, x: number, y: number, width: number, height: number): void {
  const windowLocal = cloneWindow(runtime.gWindows[windowId]);
  let currentRow = u16(windowLocal.window.baseBlock + (y * windowLocal.window.width) + x + GetBgAttribute(runtime, windowLocal.window.bg, BG_ATTR_BASETILE));
  for (let i = 0; i < height; ++i) {
    WriteSequenceToBgTilemapBuffer(runtime, windowLocal.window.bg, currentRow, windowLocal.window.tilemapLeft + x, windowLocal.window.tilemapTop + y + i, width, 1, windowLocal.window.paletteNum, 1);
    currentRow = u16(currentRow + windowLocal.window.width);
  }
}

export function BlitBitmapToWindow(runtime: WindowRuntime, windowId: number, pixels: Uint8Array, x: number, y: number, width: number, height: number): void {
  BlitBitmapRectToWindow(runtime, windowId, pixels, 0, 0, width, height, x, y, width, height);
}

export function BlitBitmapRectToWindow(
  runtime: WindowRuntime,
  windowId: number,
  pixels: Uint8Array,
  srcX: number,
  srcY: number,
  srcWidth: number,
  srcHeight: number,
  destX: number,
  destY: number,
  rectWidth: number,
  rectHeight: number,
): void {
  const sourceRect = { pixels, width: srcWidth, height: srcHeight };
  const destRect = {
    pixels: assertTileData(runtime, windowId),
    width: 8 * runtime.gWindows[windowId].window.width,
    height: 8 * runtime.gWindows[windowId].window.height,
  };
  BlitBitmapRect4Bit(sourceRect, destRect, srcX, srcY, destX, destY, rectWidth, rectHeight, 0);
}

export function BlitBitmapRectToWindowWithColorKey(
  runtime: WindowRuntime,
  windowId: number,
  pixels: Uint8Array,
  srcX: number,
  srcY: number,
  srcWidth: number,
  srcHeight: number,
  destX: number,
  destY: number,
  rectWidth: number,
  rectHeight: number,
  colorKey: number,
): void {
  const sourceRect = { pixels, width: srcWidth, height: srcHeight };
  const destRect = {
    pixels: assertTileData(runtime, windowId),
    width: 8 * runtime.gWindows[windowId].window.width,
    height: 8 * runtime.gWindows[windowId].window.height,
  };
  BlitBitmapRect4Bit(sourceRect, destRect, srcX, srcY, destX, destY, rectWidth, rectHeight, colorKey);
}

export function FillWindowPixelRect(runtime: WindowRuntime, windowId: number, fillValue: number, x: number, y: number, width: number, height: number): void {
  const pixelRect = {
    pixels: assertTileData(runtime, windowId),
    width: 8 * runtime.gWindows[windowId].window.width,
    height: 8 * runtime.gWindows[windowId].window.height,
  };
  FillBitmapRect4Bit(pixelRect, x, y, width, height, fillValue);
}

export function CopyToWindowPixelBuffer(runtime: WindowRuntime, windowId: number, src: Uint8Array, size: number, tileOffset: number): void {
  const tileData = assertTileData(runtime, windowId);
  const destOffset = 0x20 * tileOffset;
  if (size !== 0) {
    tileData.set(src.slice(0, size), destOffset);
  } else {
    runtime.calls.push({ fn: 'LZ77UnCompWram', args: [src, windowId, destOffset] });
    tileData.set(src.slice(0, tileData.length - destOffset), destOffset);
  }
}

export function FillWindowPixelBuffer(runtime: WindowRuntime, windowId: number, fillValue: number): void {
  const fillSize = runtime.gWindows[windowId].window.width * runtime.gWindows[windowId].window.height;
  assertTileData(runtime, windowId).fill(fillValue & 0xff, 0, 0x20 * fillSize);
}

export function ScrollWindow(runtime: WindowRuntime, windowId: number, direction: number, distance: number, fillValue: number): void {
  const window = cloneTemplate(runtime.gWindows[windowId].window);
  const tileData = assertTileData(runtime, windowId);
  const fillValue32 = u32((fillValue << 24) | (fillValue << 16) | (fillValue << 8) | fillValue);
  const size = window.height * window.width * 32;
  const width = window.width;

  switch (direction) {
    case 0:
      for (let i = 0; i < size; i += 32) {
        let distanceLoop = distance;
        for (let a = 0; a < 32; a += 4) {
          const destOffset = i + a;
          const srcOffset = i + (((width * (distanceLoop & ~7)) | (distanceLoop & 7)) * 4);
          writeU32(tileData, destOffset, srcOffset < size ? readU32(tileData, srcOffset) : fillValue32);
          distanceLoop += 1;
        }
      }
      break;
    case 1:
      {
        const base = size - 4;
        for (let i = 0; i < size; i += 32) {
          let distanceLoop = distance;
          for (let a = 0; a < 32; a += 4) {
            const destOffset = i + a;
            const srcOffset = i + (((width * (distanceLoop & ~7)) | (distanceLoop & 7)) * 4);
            writeU32(tileData, base - destOffset, srcOffset < size ? readU32(tileData, base - srcOffset) : fillValue32);
            distanceLoop += 1;
          }
        }
      }
      break;
    case 2:
      break;
  }
}

export function CallWindowFunction(runtime: WindowRuntime, windowId: number, func: WindowFunc): void {
  const window = cloneTemplate(runtime.gWindows[windowId].window);
  func(window.bg, window.tilemapLeft, window.tilemapTop, window.width, window.height, window.paletteNum);
}

export function SetWindowAttribute(runtime: WindowRuntime, windowId: number, attributeId: number, value: number): boolean {
  switch (attributeId) {
    case WINDOW_TILEMAP_LEFT:
      runtime.gWindows[windowId].window.tilemapLeft = value;
      return false;
    case WINDOW_TILEMAP_TOP:
      runtime.gWindows[windowId].window.tilemapTop = value;
      return false;
    case WINDOW_PALETTE_NUM:
      runtime.gWindows[windowId].window.paletteNum = value;
      return false;
    case WINDOW_BASE_BLOCK:
      runtime.gWindows[windowId].window.baseBlock = value;
      return false;
    case WINDOW_TILE_DATA:
    case WINDOW_BG:
    case WINDOW_WIDTH:
    case WINDOW_HEIGHT:
    default:
      return true;
  }
}

export function GetWindowAttribute(runtime: WindowRuntime, windowId: number, attributeId: number): number | Uint8Array | null {
  switch (attributeId) {
    case WINDOW_BG:
      return runtime.gWindows[windowId].window.bg;
    case WINDOW_TILEMAP_LEFT:
      return runtime.gWindows[windowId].window.tilemapLeft;
    case WINDOW_TILEMAP_TOP:
      return runtime.gWindows[windowId].window.tilemapTop;
    case WINDOW_WIDTH:
      return runtime.gWindows[windowId].window.width;
    case WINDOW_HEIGHT:
      return runtime.gWindows[windowId].window.height;
    case WINDOW_PALETTE_NUM:
      return runtime.gWindows[windowId].window.paletteNum;
    case WINDOW_BASE_BLOCK:
      return runtime.gWindows[windowId].window.baseBlock;
    case WINDOW_TILE_DATA:
      return runtime.gWindows[windowId].tileData;
    default:
      return 0;
  }
}

export function GetNumActiveWindowsOnBg(runtime: WindowRuntime, bgId: number): number {
  let windowsNum = 0;
  for (let i = 0; i < WINDOWS_MAX; i += 1) {
    if (runtime.gWindows[i].window.bg === bgId) {
      windowsNum += 1;
    }
  }
  return windowsNum;
}

function GetBgTilemapBuffer(runtime: WindowRuntime, bg: number): Uint8Array | null {
  return runtime.bgTilemapBuffers[bg];
}

function SetBgTilemapBuffer(runtime: WindowRuntime, bg: number, buffer: Uint8Array): void {
  runtime.bgTilemapBuffers[bg] = buffer;
  runtime.calls.push({ fn: 'SetBgTilemapBuffer', args: [bg, buffer.length] });
}

function GetBgAttribute(runtime: WindowRuntime, bg: number, attribute: number): number {
  if (attribute === BG_ATTR_MAPSIZE) return runtime.bgMapSizes[bg] ?? 0xffff;
  if (attribute === BG_ATTR_BASETILE) return runtime.bgBaseTiles[bg] ?? 0;
  return 0;
}

function BgTileAllocOp(runtime: WindowRuntime, bg: number, offset: number, count: number, mode: number): number {
  runtime.calls.push({ fn: 'BgTileAllocOp', args: [bg, offset, count, mode] });
  if (mode === BG_TILE_FIND_FREE_SPACE) {
    const result = runtime.bgTileAllocNext[bg] ?? 0;
    if (result === -1) return -1;
    runtime.bgTileAllocNext[bg] = result + count;
    return result;
  }
  return 0;
}

function Alloc(runtime: WindowRuntime, size: number): Uint8Array | null {
  const failureIndex = runtime.allocationFailures.indexOf(size);
  if (failureIndex !== -1) {
    runtime.allocationFailures.splice(failureIndex, 1);
    return null;
  }
  return new Uint8Array(size);
}

function Free(runtime: WindowRuntime, value: unknown): void {
  runtime.freedObjects.push(value);
}

function CopyBgTilemapBufferToVram(runtime: WindowRuntime, bg: number): void {
  runtime.calls.push({ fn: 'CopyBgTilemapBufferToVram', args: [bg] });
}

function LoadBgTiles(runtime: WindowRuntime, bg: number, data: Uint8Array | null, size: number, baseBlock: number): void {
  runtime.calls.push({ fn: 'LoadBgTiles', args: [bg, data?.length ?? null, size, baseBlock] });
}

function WriteSequenceToBgTilemapBuffer(runtime: WindowRuntime, bg: number, startTile: number, x: number, y: number, width: number, height: number, palette: number, mode: number): void {
  runtime.calls.push({ fn: 'WriteSequenceToBgTilemapBuffer', args: [bg, startTile, x, y, width, height, palette, mode] });
}

function FillBgTilemapBufferRect(runtime: WindowRuntime, bg: number, tileNum: number, x: number, y: number, width: number, height: number, palette: number): void {
  runtime.calls.push({ fn: 'FillBgTilemapBufferRect', args: [bg, tileNum, x, y, width, height, palette] });
}

function BlitBitmapRect4Bit(source: Bitmap, dest: Bitmap, srcX: number, srcY: number, destX: number, destY: number, rectWidth: number, rectHeight: number, colorKey: number): void {
  for (let row = 0; row < rectHeight; row += 1) {
    for (let col = 0; col < rectWidth; col += 1) {
      const color = get4BitPixel(source.pixels, source.width, srcX + col, srcY + row);
      if (colorKey === 0 || color !== colorKey) {
        set4BitPixel(dest.pixels, dest.width, destX + col, destY + row, color);
      }
    }
  }
}

function FillBitmapRect4Bit(bitmap: Bitmap, x: number, y: number, width: number, height: number, fillValue: number): void {
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      set4BitPixel(bitmap.pixels, bitmap.width, x + col, y + row, fillValue);
    }
  }
}

function get4BitPixel(pixels: Uint8Array, width: number, x: number, y: number): number {
  const pixelIndex = y * width + x;
  const byte = pixels[pixelIndex >> 1] ?? 0;
  return (pixelIndex & 1) === 0 ? byte & 0x0f : byte >> 4;
}

function set4BitPixel(pixels: Uint8Array, width: number, x: number, y: number, color: number): void {
  const pixelIndex = y * width + x;
  const byteIndex = pixelIndex >> 1;
  const old = pixels[byteIndex] ?? 0;
  if ((pixelIndex & 1) === 0) {
    pixels[byteIndex] = (old & 0xf0) | (color & 0x0f);
  } else {
    pixels[byteIndex] = (old & 0x0f) | ((color & 0x0f) << 4);
  }
}

function assertTileData(runtime: WindowRuntime, windowId: number): Uint8Array {
  const tileData = runtime.gWindows[windowId].tileData;
  if (tileData === null) throw new Error(`window ${windowId} has no tileData`);
  return tileData;
}

function cloneTemplate(template: WindowTemplate): WindowTemplate {
  return { ...template };
}

function cloneWindow(window: Window): Window {
  return { window: cloneTemplate(window.window), tileData: window.tileData };
}

function readU32(data: Uint8Array, offset: number): number {
  return u32((data[offset] ?? 0) | ((data[offset + 1] ?? 0) << 8) | ((data[offset + 2] ?? 0) << 16) | ((data[offset + 3] ?? 0) << 24));
}

function writeU32(data: Uint8Array, offset: number, value: number): void {
  data[offset] = value & 0xff;
  data[offset + 1] = (value >>> 8) & 0xff;
  data[offset + 2] = (value >>> 16) & 0xff;
  data[offset + 3] = (value >>> 24) & 0xff;
}

const u16 = (value: number): number => value & 0xffff;
const u32 = (value: number): number => value >>> 0;
