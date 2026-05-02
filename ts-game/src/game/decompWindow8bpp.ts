export * from '../rendering/decompWindow8bpp';
import {
  addWindow8Bit,
  blitBitmapRectToWindow4BitTo8Bit,
  copyWindowToVram8Bit,
  fillWindowPixelBuffer8Bit,
  fillWindowPixelRect8Bit,
  getNumActiveWindowsOnBg8Bit,
  type Window8BitState,
  type Window8BitTemplate
} from '../rendering/decompWindow8bpp';

export function nullsub_9(): void {}

export function AddWindow8Bit(
  state: Window8BitState,
  template: Window8BitTemplate
): number {
  return addWindow8Bit(state, template);
}

export function FillWindowPixelBuffer8Bit(
  state: Window8BitState,
  windowId: number,
  fillValue: number
): void {
  fillWindowPixelBuffer8Bit(state, windowId, fillValue);
}

export function FillWindowPixelRect8Bit(
  state: Window8BitState,
  windowId: number,
  fillValue: number,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  fillWindowPixelRect8Bit(state, windowId, fillValue, x, y, width, height);
}

export function BlitBitmapRectToWindow4BitTo8Bit(
  state: Window8BitState,
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
  paletteNum: number
): void {
  blitBitmapRectToWindow4BitTo8Bit(
    state,
    windowId,
    pixels,
    srcX,
    srcY,
    srcWidth,
    srcHeight,
    destX,
    destY,
    rectWidth,
    rectHeight,
    paletteNum
  );
}

export function CopyWindowToVram8Bit(
  state: Window8BitState,
  windowId: number,
  mode: number
): void {
  copyWindowToVram8Bit(state, windowId, mode);
}

export function GetNumActiveWindowsOnBg8Bit(
  state: Window8BitState,
  bgId: number
): number {
  return getNumActiveWindowsOnBg8Bit(state, bgId);
}
