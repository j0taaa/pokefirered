export * from '../rendering/decompWindow8bpp';
import {
  addWindow8Bit,
  blitBitmapRectToWindow4BitTo8Bit,
  copyWindowToVram8Bit,
  fillWindowPixelBuffer8Bit,
  fillWindowPixelRect8Bit,
  getNumActiveWindowsOnBg8Bit
} from '../rendering/decompWindow8bpp';

export function nullsub_9(): void {}

export const AddWindow8Bit = addWindow8Bit;

export const FillWindowPixelBuffer8Bit = fillWindowPixelBuffer8Bit;

export const FillWindowPixelRect8Bit = fillWindowPixelRect8Bit;

export const BlitBitmapRectToWindow4BitTo8Bit = blitBitmapRectToWindow4BitTo8Bit;

export const CopyWindowToVram8Bit = copyWindowToVram8Bit;

export const GetNumActiveWindowsOnBg8Bit = getNumActiveWindowsOnBg8Bit;
