export * from '../rendering/decompBlit';
import {
  blitBitmapRect4Bit,
  blitBitmapRect4BitTo8Bit,
  blitBitmapRect4BitWithoutColorKey,
  fillBitmapRect4Bit,
  fillBitmapRect8Bit
} from '../rendering/decompBlit';

export const BlitBitmapRect4BitWithoutColorKey = blitBitmapRect4BitWithoutColorKey;

export const BlitBitmapRect4Bit = blitBitmapRect4Bit;

export const FillBitmapRect4Bit = fillBitmapRect4Bit;

export const BlitBitmapRect4BitTo8Bit = blitBitmapRect4BitTo8Bit;

export const FillBitmapRect8Bit = fillBitmapRect8Bit;
