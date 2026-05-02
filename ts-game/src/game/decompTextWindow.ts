import {
  PLTT_SIZE_4BPP,
  TextWindowOp,
  TextWindowTemplateLike,
  drawTextBorderInner,
  drawTextBorderOuter,
  getTextWindowPaletteOffset,
  loadQuestLogWindowTiles,
  loadStdWindowGfxOnBg,
  loadStdWindowTiles,
  loadUserWindowGfxByFrame,
  loadWindowGfxOnBg,
  rboxFillRectangle
} from '../rendering/decompTextWindow';

export interface TextWindowRuntime {
  windows: Record<number, TextWindowTemplateLike>;
  optionsWindowFrameType: number;
  operations: TextWindowOp[];
}

export const createTextWindowRuntime = (overrides: Partial<TextWindowRuntime> = {}): TextWindowRuntime => ({
  windows: {},
  optionsWindowFrameType: 0,
  operations: [],
  ...overrides
});

const getWindow = (runtime: TextWindowRuntime, windowId: number): TextWindowTemplateLike => runtime.windows[windowId] ?? {
  bg: 0,
  tilemapLeft: 0,
  tilemapTop: 0,
  width: 0,
  height: 0
};

const push = (runtime: TextWindowRuntime, ops: TextWindowOp[] | TextWindowOp): void => {
  if (Array.isArray(ops)) runtime.operations.push(...ops);
  else runtime.operations.push(ops);
};

export function LoadHelpMessageWindowGfxOnBg(
  runtime: TextWindowRuntime,
  bgId: number,
  destOffset: number,
  palOffset: number
): void {
  push(runtime, loadWindowGfxOnBg(bgId, 'gHelpMessageWindow_Gfx', 0x280, destOffset, 2, palOffset));
}

export function LoadMenuMessageWindowGfxOnBg(
  runtime: TextWindowRuntime,
  bgId: number,
  destOffset: number,
  palOffset: number
): void {
  push(runtime, loadWindowGfxOnBg(bgId, 'gMenuMessageWindow_Gfx', 0x280, destOffset, 0, palOffset));
}

export function LoadSignpostWindowGfxOnBg(
  runtime: TextWindowRuntime,
  bgId: number,
  destOffset: number,
  palOffset: number
): void {
  push(runtime, loadWindowGfxOnBg(bgId, 'gSignpostWindow_Gfx', 0x260, destOffset, 1, palOffset));
}

export function LoadStdWindowGfxOnBg(
  runtime: TextWindowRuntime,
  bgId: number,
  destOffset: number,
  palOffset: number
): void {
  push(runtime, loadStdWindowGfxOnBg(bgId, destOffset, palOffset));
}

export function LoadQuestLogWindowTilesOnBg(
  runtime: TextWindowRuntime,
  bgId: number,
  destOffset: number
): void {
  push(runtime, { kind: 'tiles', bg: bgId, gfx: 'gQuestLogWindow_Gfx', size: 0x280, destOffset });
}

export function LoadUserWindowGfxByFrameOnBg(
  runtime: TextWindowRuntime,
  bgId: number,
  frameType: number,
  destOffset: number,
  palOffset: number
): void {
  push(runtime, [
    { kind: 'tiles', bg: bgId, gfx: `gUserFrames[${frameType}].tiles`, size: 0x120, destOffset },
    { kind: 'palette', palette: `gUserFrames[${frameType}].palette`, palOffset, size: PLTT_SIZE_4BPP }
  ]);
}

export function LoadUserWindowGfx2(
  runtime: TextWindowRuntime,
  windowId: number,
  destOffset: number,
  palOffset: number
): void {
  LoadUserWindowGfxByFrame(runtime, windowId, runtime.optionsWindowFrameType, destOffset, palOffset);
}

export function LoadHelpMessageWindowGfx(
  runtime: TextWindowRuntime,
  windowId: number,
  destOffset: number,
  palOffset: number
): void {
  LoadHelpMessageWindowGfxOnBg(runtime, getWindow(runtime, windowId).bg, destOffset, palOffset);
}

export function LoadMenuMessageWindowGfx(
  runtime: TextWindowRuntime,
  windowId: number,
  destOffset: number,
  palOffset: number
): void {
  LoadMenuMessageWindowGfxOnBg(runtime, getWindow(runtime, windowId).bg, destOffset, palOffset);
}

export function LoadSignpostWindowGfx(
  runtime: TextWindowRuntime,
  windowId: number,
  destOffset: number,
  palOffset: number
): void {
  LoadSignpostWindowGfxOnBg(runtime, getWindow(runtime, windowId).bg, destOffset, palOffset);
}

export function LoadStdWindowGfx(
  runtime: TextWindowRuntime,
  windowId: number,
  destOffset: number,
  palOffset: number
): void {
  LoadStdWindowGfxOnBg(runtime, getWindow(runtime, windowId).bg, destOffset, palOffset);
}

export function LoadStdWindowTiles(
  runtime: TextWindowRuntime,
  windowId: number,
  destOffset: number
): void {
  push(runtime, loadStdWindowTiles(getWindow(runtime, windowId), destOffset));
}

export function LoadQuestLogWindowTiles(
  runtime: TextWindowRuntime,
  windowId: number,
  destOffset: number
): void {
  push(runtime, loadQuestLogWindowTiles(getWindow(runtime, windowId), destOffset));
}

export function LoadUserWindowGfxByFrame(
  runtime: TextWindowRuntime,
  windowId: number,
  frameType: number,
  destOffset: number,
  palOffset: number
): void {
  push(runtime, loadUserWindowGfxByFrame(getWindow(runtime, windowId), frameType, destOffset, palOffset));
}

export function LoadUserWindowGfx(
  runtime: TextWindowRuntime,
  windowId: number,
  destOffset: number,
  palOffset: number
): void {
  LoadUserWindowGfxByFrame(runtime, windowId, runtime.optionsWindowFrameType, destOffset, palOffset);
}

export function DrawTextBorderOuter(
  runtime: TextWindowRuntime,
  windowId: number,
  tileNum: number,
  palNum: number
): void {
  push(runtime, drawTextBorderOuter(getWindow(runtime, windowId), tileNum, palNum));
}

export function DrawTextBorderInner(
  runtime: TextWindowRuntime,
  windowId: number,
  tileNum: number,
  palNum: number
): void {
  push(runtime, drawTextBorderInner(getWindow(runtime, windowId), tileNum, palNum));
}

export function rbox_fill_rectangle(runtime: TextWindowRuntime, windowId: number): void {
  push(runtime, rboxFillRectangle(getWindow(runtime, windowId)));
}

export const GetTextWindowPalette = (id: number): string => `gTextWindowPalettes+${getTextWindowPaletteOffset(id)}`;
