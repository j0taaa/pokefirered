export const WINDOWS_MAX = 32;
export const WINDOW_NONE = 0xff;
export const COPYWIN_NONE = 0;
export const COPYWIN_MAP = 1;
export const COPYWIN_GFX = 2;
export const COPYWIN_FULL = 3;

export interface Window8BitTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface Window8Bit {
  window: Window8BitTemplate;
  tileData: Uint8Array;
}

export interface Window8BitState {
  windows: Array<Window8Bit | null>;
  bgTilemapBuffers: Array<Uint8Array | null>;
  bgMapSizes: number[];
  vramCopies: Array<{ kind: 'map' | 'gfx'; bg: number; size?: number; baseBlock?: number }>;
}

export const createWindow8BitState = (bgMapSizes: number[] = []): Window8BitState => ({
  windows: Array.from({ length: WINDOWS_MAX }, () => null),
  bgTilemapBuffers: Array.from({ length: 4 }, () => null),
  bgMapSizes,
  vramCopies: []
});

const windowTileDataSize = (template: Window8BitTemplate): number =>
  0x40 * (template.width * template.height);

export const addWindow8Bit = (
  state: Window8BitState,
  template: Window8BitTemplate
): number => {
  const windowId = state.windows.findIndex((window) => window === null);
  if (windowId < 0) {
    return WINDOW_NONE;
  }

  const bgLayer = template.bg;
  if (!state.bgTilemapBuffers[bgLayer]) {
    const attribute = state.bgMapSizes[bgLayer] ?? 0xffff;
    if (attribute !== 0xffff) {
      state.bgTilemapBuffers[bgLayer] = new Uint8Array(attribute);
    }
  }

  state.windows[windowId] = {
    window: { ...template },
    tileData: new Uint8Array(windowTileDataSize(template))
  };
  return windowId;
};

export const fillWindowPixelBuffer8Bit = (
  state: Window8BitState,
  windowId: number,
  fillValue: number
): void => {
  state.windows[windowId]?.tileData.fill(fillValue & 0xff);
};

export const fillWindowPixelRect8Bit = (
  state: Window8BitState,
  windowId: number,
  fillValue: number,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  const window = state.windows[windowId];
  if (!window) {
    return;
  }

  const bitmapWidth = 8 * window.window.width;
  const bitmapHeight = 8 * window.window.height;
  for (let row = 0; row < height; row += 1) {
    const py = y + row;
    if (py < 0 || py >= bitmapHeight) {
      continue;
    }
    for (let col = 0; col < width; col += 1) {
      const px = x + col;
      if (px < 0 || px >= bitmapWidth) {
        continue;
      }
      window.tileData[py * bitmapWidth + px] = fillValue & 0xff;
    }
  }
};

const get4BitPixel = (pixels: Uint8Array, width: number, x: number, y: number): number => {
  const index = y * width + x;
  const byte = pixels[index >> 1] ?? 0;
  return (index & 1) === 0 ? byte & 0x0f : byte >>> 4;
};

export const blitBitmapRectToWindow4BitTo8Bit = (
  state: Window8BitState,
  windowId: number,
  pixels: Uint8Array,
  srcX: number,
  srcY: number,
  srcWidth: number,
  _srcHeight: number,
  destX: number,
  destY: number,
  rectWidth: number,
  rectHeight: number,
  paletteNum: number
): void => {
  const window = state.windows[windowId];
  if (!window) {
    return;
  }

  const destWidth = 8 * window.window.width;
  for (let y = 0; y < rectHeight; y += 1) {
    for (let x = 0; x < rectWidth; x += 1) {
      const value = get4BitPixel(pixels, srcWidth, srcX + x, srcY + y);
      window.tileData[(destY + y) * destWidth + destX + x] = ((paletteNum & 0x0f) << 4) | value;
    }
  }
};

export const copyWindowToVram8Bit = (
  state: Window8BitState,
  windowId: number,
  mode: number
): void => {
  const window = state.windows[windowId];
  if (!window) {
    return;
  }

  if (mode === COPYWIN_MAP || mode === COPYWIN_FULL) {
    state.vramCopies.push({ kind: 'map', bg: window.window.bg });
  }
  if (mode === COPYWIN_GFX || mode === COPYWIN_FULL) {
    state.vramCopies.push({
      kind: 'gfx',
      bg: window.window.bg,
      size: window.tileData.length,
      baseBlock: window.window.baseBlock
    });
  }
};

export const getNumActiveWindowsOnBg8Bit = (
  state: Window8BitState,
  bgId: number
): number => state.windows.filter((window) => window?.window.bg === bgId).length;

export const nullsub_9 = (): void => {};

export const AddWindow8Bit = addWindow8Bit;
export const FillWindowPixelBuffer8Bit = fillWindowPixelBuffer8Bit;
export const FillWindowPixelRect8Bit = fillWindowPixelRect8Bit;
export const BlitBitmapRectToWindow4BitTo8Bit = blitBitmapRectToWindow4BitTo8Bit;
export const CopyWindowToVram8Bit = copyWindowToVram8Bit;
export const GetNumActiveWindowsOnBg8Bit = getNumActiveWindowsOnBg8Bit;
