export const DLG_WINDOW_PALETTE_NUM = 15;
export const DLG_WINDOW_BASE_TILE_NUM = 0x200;
export const STD_WINDOW_PALETTE_NUM = 14;
export const STD_WINDOW_BASE_TILE_NUM = 0x214;
export const COPYWIN_FULL = 3;
export const PLTT_SIZE_4BPP = 32;
export const OPTIONS_TEXT_SPEED_SLOW = 0;
export const OPTIONS_TEXT_SPEED_MID = 1;
export const OPTIONS_TEXT_SPEED_FAST = 2;
export const QL_STATE_PLAYBACK = 2;
export const NPC_TEXT_COLOR_MALE = 1;
export const NPC_TEXT_COLOR_FEMALE = 2;
export const NPC_TEXT_COLOR_MON = 3;
export const NPC_TEXT_COLOR_NEUTRAL = 4;
export const FONT_SMALL = 0;
export const FONT_NORMAL_COPY_1 = 1;
export const FONT_NORMAL = 2;
export const FONT_NORMAL_COPY_2 = 3;
export const FONT_MALE = 4;
export const FONT_FEMALE = 5;
export const FONT_BRAILLE = 6;
export const FONT_BOLD = 7;
export const FONTATTR_MAX_LETTER_WIDTH = 0;
export const FONTATTR_MAX_LETTER_HEIGHT = 1;
export const FONTATTR_LETTER_SPACING = 2;
export const FONTATTR_LINE_SPACING = 3;
export const FONTATTR_UNKNOWN = 4;
export const FONTATTR_COLOR_FOREGROUND = 5;
export const FONTATTR_COLOR_BACKGROUND = 6;
export const FONTATTR_COLOR_SHADOW = 7;
export const TEXT_COLOR_BLUE = 4;
export const TEXT_COLOR_RED = 5;
export const TEXT_COLOR_DARK_GRAY = 2;
export const TEXT_COLOR_WHITE = 1;
export const TEXT_COLOR_LIGHT_GRAY = 3;

export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface FontInfo {
  maxLetterWidth: number;
  maxLetterHeight: number;
  letterSpacing: number;
  lineSpacing: number;
  unk: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

export interface TextPrinterTemplate {
  currentChar: string;
  windowId: number;
  fontId: number;
  x: number;
  y: number;
  currentX: number;
  currentY: number;
  letterSpacing: number;
  lineSpacing: number;
  unk: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

export interface NewMenuTask {
  func: 'TaskFreeBufAfterCopyingTileDataToVram' | 'DestroyTask';
  data: number[];
  wordArgs: Record<number, TempBuffer>;
  destroyed: boolean;
}

export interface TempBuffer {
  id: string;
  source: number[];
  sizeOut: number;
  freed: boolean;
}

export interface NewMenuRuntime {
  scheduledBgCopiesToVram: boolean[];
  tempTileDataBufferCursor: number;
  tempTileDataBuffers: Array<TempBuffer | null>;
  startMenuWindowId: number;
  tasks: Array<NewMenuTask | null>;
  windows: Map<number, WindowTemplate & { removed?: boolean }>;
  nextWindowId: number;
  bgTilemapBuffers: number[][];
  dma3Busy: boolean;
  waitDmaBusyRequests: Set<number>;
  saveBlock2: { optionsTextSpeed: number };
  questLogState: number;
  textFlags: { autoScroll: number; useAlternateDownArrow: number; canABSpeedUpPrint: boolean };
  stringVar4: string;
  npcTextColor: number;
  signpost: boolean;
  textPrinterActive0: boolean;
  operations: string[];
  tileCopies: Array<{ kind: 'tiles' | 'tilemap'; bgId: number; src: string; size: number; offset: number; requestId: number }>;
  printers: Array<{ template: TextPrinterTemplate; speed: number; callback: string | null }>;
  palettes: Array<{ source: string; offset: number; size: number }>;
  bgPositions: Record<string, number>;
}

export const sTextSpeedFrameDelays = [8, 4, 1] as const;

export const sStandardTextBoxWindowTemplates: WindowTemplate[] = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: DLG_WINDOW_PALETTE_NUM, baseBlock: 0x198 }
];

export const sYesNoWindowTemplate: WindowTemplate = {
  bg: 0,
  tilemapLeft: 21,
  tilemapTop: 9,
  width: 6,
  height: 4,
  paletteNum: DLG_WINDOW_PALETTE_NUM,
  baseBlock: 0x125
};

export const gFontInfos: FontInfo[] = [
  { maxLetterWidth: 8, maxLetterHeight: 13, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  { maxLetterWidth: 8, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  { maxLetterWidth: 10, maxLetterHeight: 14, letterSpacing: 1, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  { maxLetterWidth: 10, maxLetterHeight: 14, letterSpacing: 1, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  { maxLetterWidth: 10, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  { maxLetterWidth: 10, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  { maxLetterWidth: 8, maxLetterHeight: 16, letterSpacing: 0, lineSpacing: 2, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  { maxLetterWidth: 8, maxLetterHeight: 8, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 1, bgColor: 2, shadowColor: 15 }
];

export const gMenuCursorDimensions = [
  [8, 13], [8, 14], [8, 14], [8, 14], [8, 14], [8, 14], [8, 16], [0, 0]
] as const;

export const createNewMenuRuntime = (): NewMenuRuntime => ({
  scheduledBgCopiesToVram: [false, false, false, false],
  tempTileDataBufferCursor: 0,
  tempTileDataBuffers: Array.from({ length: 0x20 }, () => null),
  startMenuWindowId: 0,
  tasks: [],
  windows: new Map(),
  nextWindowId: 0,
  bgTilemapBuffers: Array.from({ length: 4 }, () => Array.from({ length: 32 * 32 }, () => 0)),
  dma3Busy: false,
  waitDmaBusyRequests: new Set(),
  saveBlock2: { optionsTextSpeed: OPTIONS_TEXT_SPEED_MID },
  questLogState: 0,
  textFlags: { autoScroll: 0, useAlternateDownArrow: 0, canABSpeedUpPrint: false },
  stringVar4: '',
  npcTextColor: NPC_TEXT_COLOR_NEUTRAL,
  signpost: false,
  textPrinterActive0: false,
  operations: [],
  tileCopies: [],
  printers: [],
  palettes: [],
  bgPositions: {}
});

export function ClearScheduledBgCopiesToVram(runtime: NewMenuRuntime): void {
  runtime.scheduledBgCopiesToVram.fill(false);
}

export function ScheduleBgCopyTilemapToVram(runtime: NewMenuRuntime, bgId: number): void {
  runtime.scheduledBgCopiesToVram[bgId] = true;
}

export function DoScheduledBgTilemapCopiesToVram(runtime: NewMenuRuntime): void {
  for (let bg = 0; bg < 4; bg++) {
    if (runtime.scheduledBgCopiesToVram[bg] === true) {
      CopyBgTilemapBufferToVram(runtime, bg);
      runtime.scheduledBgCopiesToVram[bg] = false;
    }
  }
}

export function ResetTempTileDataBuffers(runtime: NewMenuRuntime): void {
  runtime.tempTileDataBuffers.fill(null);
  runtime.tempTileDataBufferCursor = 0;
}

export function FreeTempTileDataBuffersIfPossible(runtime: NewMenuRuntime): boolean {
  if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
    if (runtime.tempTileDataBufferCursor) {
      for (let i = 0; i < runtime.tempTileDataBufferCursor; i++) {
        if (runtime.tempTileDataBuffers[i]) runtime.tempTileDataBuffers[i]!.freed = true;
        runtime.tempTileDataBuffers[i] = null;
      }
      runtime.tempTileDataBufferCursor = 0;
    }
    return false;
  }
  return true;
}

export function MallocAndDecompress(_runtime: NewMenuRuntime, src: number[]): TempBuffer | null {
  const sizeOut = (src[1] ?? 0) | ((src[2] ?? 0) << 8) | ((src[3] ?? 0) << 16);
  return { id: `buf:${src.join(',')}:${sizeOut}`, source: [...src], sizeOut, freed: false };
}

export function DecompressAndCopyTileDataToVram(runtime: NewMenuRuntime, bgId: number, src: number[], size: number, offset: number, mode: number): TempBuffer | null {
  if (runtime.tempTileDataBufferCursor < runtime.tempTileDataBuffers.length) {
    const ptr = MallocAndDecompress(runtime, src);
    if (!size && ptr) size = ptr.sizeOut;
    if (ptr) {
      CopyDecompressedTileDataToVram(runtime, bgId, ptr, size, offset, mode);
      runtime.tempTileDataBuffers[runtime.tempTileDataBufferCursor++] = ptr;
    }
    return ptr;
  }
  return null;
}

export function DecompressAndCopyTileDataToVram2(runtime: NewMenuRuntime, bgId: number, src: number[], size: number, offset: number, mode: number): TempBuffer | null {
  if (runtime.tempTileDataBufferCursor < runtime.tempTileDataBuffers.length) {
    const ptr = MallocAndDecompress(runtime, src);
    let sizeOut = ptr?.sizeOut ?? 0;
    if (sizeOut > size) sizeOut = size;
    if (ptr) {
      CopyDecompressedTileDataToVram(runtime, bgId, ptr, sizeOut, offset, mode);
      runtime.tempTileDataBuffers[runtime.tempTileDataBufferCursor++] = ptr;
    }
    return ptr;
  }
  return null;
}

export function DecompressAndLoadBgGfxUsingHeap(runtime: NewMenuRuntime, bgId: number, src: number[], size: number, offset: number, mode: number): number | null {
  const ptr = MallocAndDecompress(runtime, src);
  if (!size && ptr) size = ptr.sizeOut;
  if (ptr) {
    const taskId = CreateTask(runtime, 'TaskFreeBufAfterCopyingTileDataToVram');
    runtime.tasks[taskId]!.data[0] = CopyDecompressedTileDataToVram(runtime, bgId, ptr, size, offset, mode);
    runtime.tasks[taskId]!.wordArgs[1] = ptr;
    return taskId;
  }
  return null;
}

export function DecompressAndLoadBgGfxUsingHeap2(runtime: NewMenuRuntime, bgId: number, src: number[], size: number, offset: number, mode: number): number | null {
  const ptr = MallocAndDecompress(runtime, src);
  let sizeOut = ptr?.sizeOut ?? 0;
  if (sizeOut > size) sizeOut = size;
  if (ptr) {
    const taskId = CreateTask(runtime, 'TaskFreeBufAfterCopyingTileDataToVram');
    runtime.tasks[taskId]!.data[0] = CopyDecompressedTileDataToVram(runtime, bgId, ptr, sizeOut, offset, mode);
    runtime.tasks[taskId]!.wordArgs[1] = ptr;
    return taskId;
  }
  return null;
}

export function TaskFreeBufAfterCopyingTileDataToVram(runtime: NewMenuRuntime, taskId: number): void {
  const task = runtime.tasks[taskId]!;
  if (!WaitDma3Request(runtime, task.data[0])) {
    task.wordArgs[1]!.freed = true;
    DestroyTask(runtime, taskId);
  }
}

export function CopyDecompressedTileDataToVram(runtime: NewMenuRuntime, bgId: number, src: TempBuffer, size: number, offset: number, mode: number): number {
  if (mode === 1) return LoadBgTilemap(runtime, bgId, src, size, offset);
  return LoadBgTiles(runtime, bgId, src, size, offset);
}

export function SetBgTilemapPalette(runtime: NewMenuRuntime, bgId: number, left: number, top: number, width: number, height: number, palette: number): void {
  const ptr = runtime.bgTilemapBuffers[bgId]!;
  for (let i = top; i < top + height; i++) {
    for (let j = left; j < left + width; j++) {
      ptr[i * 32 + j] = (ptr[i * 32 + j]! & 0xfff) | (palette << 12);
    }
  }
}

export function CopyToBufferFromBgTilemap(runtime: NewMenuRuntime, bgId: number, left: number, top: number, width: number, height: number): number[] {
  const dest = Array.from({ length: width * height }, () => 0);
  const src = runtime.bgTilemapBuffers[bgId]!;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      dest[i * width + j] = src[(i + top) * 32 + j + left]!;
    }
  }
  return dest;
}

export function ResetBgPositions(runtime: NewMenuRuntime): void {
  for (let bg = 0; bg < 4; bg++) {
    ChangeBgX(runtime, bg, 0, 0);
  }
  for (let bg = 0; bg < 4; bg++) {
    ChangeBgY(runtime, bg, 0, 0);
  }
}

export function InitStandardTextBoxWindows(runtime: NewMenuRuntime): void {
  InitWindows(runtime, sStandardTextBoxWindowTemplates);
  runtime.startMenuWindowId = 0xff;
  runtime.operations.push('MapNamePopupWindowIdSetDummy');
}

export function FreeAllOverworldWindowBuffers(runtime: NewMenuRuntime): void {
  runtime.windows.clear();
  runtime.operations.push('FreeAllWindowBuffers');
}

export function InitTextBoxGfxAndPrinters(runtime: NewMenuRuntime): void {
  ChangeBgX(runtime, 0, 0, 0);
  ChangeBgY(runtime, 0, 0, 0);
  DeactivateAllTextPrinters(runtime);
  LoadStdWindowFrameGfx(runtime);
}

export function RunTextPrinters_CheckPrinter0Active(runtime: NewMenuRuntime): number {
  runtime.operations.push('RunTextPrinters');
  return runtime.textPrinterActive0 ? 1 : 0;
}

export function AddTextPrinterParameterized2(
  runtime: NewMenuRuntime,
  windowId: number,
  fontId: number,
  str: string,
  speed: number,
  callback: string | null,
  fgColor: number,
  bgColor: number,
  shadowColor: number
): number {
  const printer: TextPrinterTemplate = {
    currentChar: str,
    windowId,
    fontId,
    x: 0,
    y: 1,
    currentX: 0,
    currentY: 1,
    letterSpacing: 1,
    lineSpacing: 1,
    unk: 0,
    fgColor,
    bgColor,
    shadowColor
  };
  runtime.textFlags.useAlternateDownArrow = 0;
  return AddTextPrinter(runtime, printer, speed, callback);
}

export function AddTextPrinterDiffStyle(runtime: NewMenuRuntime, allowSkippingDelayWithButtonPress: boolean): void {
  runtime.textFlags.canABSpeedUpPrint = allowSkippingDelayWithButtonPress;
  const color = runtime.npcTextColor;
  if (color === NPC_TEXT_COLOR_MALE) {
    AddTextPrinterParameterized2(runtime, 0, FONT_MALE, runtime.stringVar4, GetTextSpeedSetting(runtime), null, TEXT_COLOR_BLUE, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
  } else if (color === NPC_TEXT_COLOR_FEMALE) {
    AddTextPrinterParameterized2(runtime, 0, FONT_FEMALE, runtime.stringVar4, GetTextSpeedSetting(runtime), null, TEXT_COLOR_RED, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
  } else {
    AddTextPrinterParameterized2(runtime, 0, FONT_NORMAL, runtime.stringVar4, GetTextSpeedSetting(runtime), null, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
  }
}

export function AddTextPrinterForMessage(runtime: NewMenuRuntime, allowSkippingDelayWithButtonPress: boolean): void {
  runtime.textFlags.canABSpeedUpPrint = allowSkippingDelayWithButtonPress;
  AddTextPrinterParameterized2(runtime, 0, FONT_NORMAL, runtime.stringVar4, GetTextSpeedSetting(runtime), null, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
}

export function AddTextPrinterWithCustomSpeedForMessage(runtime: NewMenuRuntime, allowSkippingDelayWithButtonPress: boolean, speed: number): void {
  runtime.textFlags.canABSpeedUpPrint = allowSkippingDelayWithButtonPress;
  AddTextPrinterParameterized2(runtime, 0, FONT_NORMAL, runtime.stringVar4, speed, null, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
}

export function LoadStdWindowFrameGfx(runtime: NewMenuRuntime): void {
  if (runtime.questLogState === QL_STATE_PLAYBACK) {
    runtime.textFlags.autoScroll = 1;
    runtime.operations.push(`LoadQuestLogWindowTiles:0:${DLG_WINDOW_BASE_TILE_NUM}`);
  } else {
    Menu_LoadStdPal(runtime);
    runtime.operations.push(`LoadMenuMessageWindowGfx:0:${DLG_WINDOW_BASE_TILE_NUM}:${BG_PLTT_ID(DLG_WINDOW_PALETTE_NUM)}`);
  }
  runtime.operations.push(`LoadUserWindowGfx:0:${STD_WINDOW_BASE_TILE_NUM}:${BG_PLTT_ID(STD_WINDOW_PALETTE_NUM)}`);
}

export function DrawDialogueFrame(runtime: NewMenuRuntime, windowId: number, copyToVram: boolean): void {
  CallWindowFunction(runtime, windowId, WindowFunc_DrawDialogueFrame);
  FillWindowPixelBuffer(runtime, windowId, 1);
  PutWindowTilemap(runtime, windowId);
  if (copyToVram) CopyWindowToVram(runtime, windowId, COPYWIN_FULL);
}

export function DrawStdWindowFrame(runtime: NewMenuRuntime, windowId: number, copyToVram: boolean): void {
  CallWindowFunction(runtime, windowId, WindowFunc_DrawStandardFrame);
  FillWindowPixelBuffer(runtime, windowId, 1);
  PutWindowTilemap(runtime, windowId);
  if (copyToVram) CopyWindowToVram(runtime, windowId, COPYWIN_FULL);
}

export function ClearDialogWindowAndFrame(runtime: NewMenuRuntime, windowId: number, copyToVram: boolean): void {
  CallWindowFunction(runtime, windowId, WindowFunc_ClearDialogWindowAndFrame);
  FillWindowPixelBuffer(runtime, windowId, 1);
  ClearWindowTilemap(runtime, windowId);
  if (copyToVram) CopyWindowToVram(runtime, windowId, COPYWIN_FULL);
  if (runtime.questLogState === QL_STATE_PLAYBACK) runtime.operations.push('CommitQuestLogWindow1');
}

export function ClearStdWindowAndFrame(runtime: NewMenuRuntime, windowId: number, copyToVram: boolean): void {
  CallWindowFunction(runtime, windowId, WindowFunc_ClearStdWindowAndFrame);
  FillWindowPixelBuffer(runtime, windowId, 1);
  ClearWindowTilemap(runtime, windowId);
  if (copyToVram) CopyWindowToVram(runtime, windowId, COPYWIN_FULL);
}

export function WindowFunc_DrawStandardFrame(runtime: NewMenuRuntime, bg: number, left: number, top: number, width: number, height: number): void {
  FillBgTilemapBufferRect(runtime, bg, STD_WINDOW_BASE_TILE_NUM + 0, left - 1, top - 1, 1, 1, STD_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(runtime, bg, STD_WINDOW_BASE_TILE_NUM + 1, left, top - 1, width, 1, STD_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(runtime, bg, STD_WINDOW_BASE_TILE_NUM + 2, left + width, top - 1, 1, 1, STD_WINDOW_PALETTE_NUM);
  for (let i = top; i < top + height; i++) {
    FillBgTilemapBufferRect(runtime, bg, STD_WINDOW_BASE_TILE_NUM + 3, left - 1, i, 1, 1, STD_WINDOW_PALETTE_NUM);
    FillBgTilemapBufferRect(runtime, bg, STD_WINDOW_BASE_TILE_NUM + 5, left + width, i, 1, 1, STD_WINDOW_PALETTE_NUM);
  }
  FillBgTilemapBufferRect(runtime, bg, STD_WINDOW_BASE_TILE_NUM + 6, left - 1, top + height, 1, 1, STD_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(runtime, bg, STD_WINDOW_BASE_TILE_NUM + 7, left, top + height, width, 1, STD_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(runtime, bg, STD_WINDOW_BASE_TILE_NUM + 8, left + width, top + height, 1, 1, STD_WINDOW_PALETTE_NUM);
}

export function WindowFunc_DrawDialogueFrame(runtime: NewMenuRuntime, bg: number, left: number, top: number, width: number, _height: number): void {
  const signpost = runtime.signpost && runtime.questLogState !== QL_STATE_PLAYBACK;
  const sequence = signpost
    ? [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, v(5), v(6), v(8), v(9), v(10), v(11), v(12), v(13), v(0), v(1), v(2), v(3), v(4)]
    : [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, v(10), v(11), v(12), v(13), v(5), v(6), v(8), v(9), v(0), v(1), v(2), v(3), v(4)];
  const coords = [
    [left - 2, top - 1, 1], [left - 1, top - 1, 1], [left, top - 1, width], [left + width, top - 1, 1], [left + width + 1, top - 1, 1],
    [left - 2, top, 1], [left - 1, top, 1], [left + width, top, 1], [left + width + 1, top, 1],
    [left - 2, top + 1, 1], [left - 1, top + 1, 1], [left + width, top + 1, 1], [left + width + 1, top + 1, 1],
    [left - 2, top + 2, 1], [left - 1, top + 2, 1], [left + width, top + 2, 1], [left + width + 1, top + 2, 1],
    [left - 2, top + 3, 1], [left - 1, top + 3, 1], [left + width, top + 3, 1], [left + width + 1, top + 3, 1],
    [left - 2, top + 4, 1], [left - 1, top + 4, 1], [left, top + 4, width], [left + width, top + 4, 1], [left + width + 1, top + 4, 1]
  ];
  sequence.forEach((tile, i) => FillBgTilemapBufferRect(runtime, bg, DLG_WINDOW_BASE_TILE_NUM + tile, coords[i]![0], coords[i]![1], coords[i]![2], 1, DLG_WINDOW_PALETTE_NUM));
}

export function WindowFunc_ClearStdWindowAndFrame(runtime: NewMenuRuntime, bg: number, left: number, top: number, width: number, height: number): void {
  FillBgTilemapBufferRect(runtime, bg, 0, left - 1, top - 1, width + 2, height + 2, STD_WINDOW_PALETTE_NUM);
}

export function WindowFunc_ClearDialogWindowAndFrame(runtime: NewMenuRuntime, bg: number, left: number, top: number, width: number, height: number): void {
  FillBgTilemapBufferRect(runtime, bg, 0, left - 2, top - 1, width + 4, height + 2, STD_WINDOW_PALETTE_NUM);
}

export function EraseFieldMessageBox(runtime: NewMenuRuntime, copyToVram: boolean): void {
  FillBgTilemapBufferRect(runtime, 0, 0, 0, 0, 0x20, 0x20, 17);
  if (copyToVram) CopyBgTilemapBufferToVram(runtime, 0);
}

export function SetStdWindowBorderStyle(runtime: NewMenuRuntime, windowId: number, copyToVram: boolean): void {
  runtime.operations.push(`DrawStdFrameWithCustomTileAndPalette:${windowId}:${copyToVram}:${STD_WINDOW_BASE_TILE_NUM}:${STD_WINDOW_PALETTE_NUM}`);
}

export function LoadMessageBoxAndFrameGfx(runtime: NewMenuRuntime, windowId: number, copyToVram: boolean): void {
  if (runtime.questLogState === QL_STATE_PLAYBACK) {
    runtime.textFlags.autoScroll = 1;
    runtime.operations.push(`LoadQuestLogWindowTiles:0:${DLG_WINDOW_BASE_TILE_NUM}`);
  } else {
    runtime.operations.push(`LoadMenuMessageWindowGfx:${windowId}:${DLG_WINDOW_BASE_TILE_NUM}:${BG_PLTT_ID(DLG_WINDOW_PALETTE_NUM)}`);
  }
  runtime.operations.push(`DrawDialogFrameWithCustomTileAndPalette:${windowId}:${copyToVram}:${DLG_WINDOW_BASE_TILE_NUM}:${DLG_WINDOW_PALETTE_NUM}`);
}

export function Menu_LoadStdPal(runtime: NewMenuRuntime): void {
  LoadPalette(runtime, 'gStandardMenuPalette', BG_PLTT_ID(STD_WINDOW_PALETTE_NUM), 10 * 2);
}

export function Menu_LoadStdPalAt(runtime: NewMenuRuntime, offset: number): void {
  LoadPalette(runtime, 'gStandardMenuPalette', offset, 10 * 2);
}

export const GetStdMenuPalette = (): string => 'gStandardMenuPalette';

export function GetStdPalColor(colorNum: number): number {
  if (colorNum > 15) colorNum = 0;
  return colorNum;
}

export function DisplayItemMessageOnField(runtime: NewMenuRuntime, taskId: number, fontId: number, string: string, callback: string): void {
  LoadStdWindowFrameGfx(runtime);
  runtime.operations.push(`DisplayMessageAndContinueTask:${taskId}:0:${DLG_WINDOW_BASE_TILE_NUM}:${DLG_WINDOW_PALETTE_NUM}:${fontId}:${GetTextSpeedSetting(runtime)}:${string}:${callback}`);
  CopyWindowToVram(runtime, 0, COPYWIN_FULL);
}

export function DisplayYesNoMenuDefaultYes(runtime: NewMenuRuntime): void {
  runtime.operations.push(`CreateYesNoMenu:${JSON.stringify(sYesNoWindowTemplate)}:${FONT_NORMAL}:0:2:${STD_WINDOW_BASE_TILE_NUM}:${STD_WINDOW_PALETTE_NUM}:0`);
}

export function DisplayYesNoMenuDefaultNo(runtime: NewMenuRuntime): void {
  runtime.operations.push(`CreateYesNoMenu:${JSON.stringify(sYesNoWindowTemplate)}:${FONT_NORMAL}:0:2:${STD_WINDOW_BASE_TILE_NUM}:${STD_WINDOW_PALETTE_NUM}:1`);
}

export function GetTextSpeedSetting(runtime: NewMenuRuntime): number {
  if (runtime.saveBlock2.optionsTextSpeed > OPTIONS_TEXT_SPEED_FAST) runtime.saveBlock2.optionsTextSpeed = OPTIONS_TEXT_SPEED_MID;
  return sTextSpeedFrameDelays[runtime.saveBlock2.optionsTextSpeed]!;
}

export function CreateStartMenuWindow(runtime: NewMenuRuntime, height: number): number {
  if (runtime.startMenuWindowId === 0xff) {
    const template = SetWindowTemplateFields(0, 0x16, 1, 7, height * 2 - 1, DLG_WINDOW_PALETTE_NUM, 0x13d);
    runtime.startMenuWindowId = AddWindow(runtime, template);
    PutWindowTilemap(runtime, runtime.startMenuWindowId);
  }
  return runtime.startMenuWindowId;
}

export function GetStartMenuWindowId(runtime: NewMenuRuntime): number { return runtime.startMenuWindowId; }

export function RemoveStartMenuWindow(runtime: NewMenuRuntime): void {
  if (runtime.startMenuWindowId !== 0xff) {
    RemoveWindow(runtime, runtime.startMenuWindowId);
    runtime.startMenuWindowId = 0xff;
  }
}

export function GetDlgWindowBaseTileNum(): number { return DLG_WINDOW_BASE_TILE_NUM; }
export function GetStdWindowBaseTileNum(): number { return STD_WINDOW_BASE_TILE_NUM; }

export function DrawHelpMessageWindowWithText(runtime: NewMenuRuntime, text: string): void {
  runtime.operations.push(`LoadHelpMessageWindowGfx:CreateHelpMessageWindow:${DLG_WINDOW_BASE_TILE_NUM}:${BG_PLTT_ID(DLG_WINDOW_PALETTE_NUM)}`);
  runtime.operations.push(`PrintTextOnHelpMessageWindow:${text}:2`);
}

export function DestroyHelpMessageWindow_(runtime: NewMenuRuntime): void {
  runtime.operations.push('DestroyHelpMessageWindow:2');
}

export function LoadSignpostWindowFrameGfx(runtime: NewMenuRuntime): void {
  Menu_LoadStdPal(runtime);
  runtime.operations.push(`LoadSignpostWindowGfx:0:${DLG_WINDOW_BASE_TILE_NUM}:${BG_PLTT_ID(DLG_WINDOW_PALETTE_NUM)}`);
  runtime.operations.push(`LoadUserWindowGfx:0:${STD_WINDOW_BASE_TILE_NUM}:${BG_PLTT_ID(STD_WINDOW_PALETTE_NUM)}`);
}

export function SetDefaultFontsPointer(runtime: NewMenuRuntime): void {
  runtime.operations.push('SetFontsPointer:gFontInfos');
}

export function GetFontAttribute(fontId: number, attributeId: number): number {
  const info = gFontInfos[fontId] ?? gFontInfos[0]!;
  switch (attributeId) {
    case FONTATTR_MAX_LETTER_WIDTH: return info.maxLetterWidth;
    case FONTATTR_MAX_LETTER_HEIGHT: return info.maxLetterHeight;
    case FONTATTR_LETTER_SPACING: return info.letterSpacing;
    case FONTATTR_LINE_SPACING: return info.lineSpacing;
    case FONTATTR_UNKNOWN: return info.unk;
    case FONTATTR_COLOR_FOREGROUND: return info.fgColor;
    case FONTATTR_COLOR_BACKGROUND: return info.bgColor;
    case FONTATTR_COLOR_SHADOW: return info.shadowColor;
    default: return 0;
  }
}

export function GetMenuCursorDimensionByFont(fontId: number, whichDimension: number): number {
  return gMenuCursorDimensions[fontId]?.[whichDimension] ?? 0;
}

const BG_PLTT_ID = (pal: number): number => pal * 16;
const v = (tile: number): number => 0x400 + tile;

const CreateTask = (runtime: NewMenuRuntime, func: NewMenuTask['func']): number => {
  const task: NewMenuTask = { func, data: Array.from({ length: 16 }, () => 0), wordArgs: {}, destroyed: false };
  const slot = runtime.tasks.findIndex((candidate) => candidate === null);
  if (slot >= 0) {
    runtime.tasks[slot] = task;
    return slot;
  }
  runtime.tasks.push(task);
  return runtime.tasks.length - 1;
};
const DestroyTask = (runtime: NewMenuRuntime, taskId: number): void => {
  if (runtime.tasks[taskId]) runtime.tasks[taskId]!.destroyed = true;
  runtime.tasks[taskId] = null;
};
const LoadBgTiles = (runtime: NewMenuRuntime, bgId: number, src: TempBuffer, size: number, offset: number): number => {
  const requestId = runtime.tileCopies.length + 1;
  runtime.tileCopies.push({ kind: 'tiles', bgId, src: src.id, size, offset, requestId });
  return requestId;
};
const LoadBgTilemap = (runtime: NewMenuRuntime, bgId: number, src: TempBuffer, size: number, offset: number): number => {
  const requestId = runtime.tileCopies.length + 1;
  runtime.tileCopies.push({ kind: 'tilemap', bgId, src: src.id, size, offset, requestId });
  return requestId;
};
const WaitDma3Request = (runtime: NewMenuRuntime, requestId: number): boolean => runtime.waitDmaBusyRequests.has(requestId);
const IsDma3ManagerBusyWithBgCopy = (runtime: NewMenuRuntime): boolean => runtime.dma3Busy;
const CopyBgTilemapBufferToVram = (runtime: NewMenuRuntime, bgId: number): void => { runtime.operations.push(`CopyBgTilemapBufferToVram:${bgId}`); };
const ChangeBgX = (runtime: NewMenuRuntime, bg: number, value: number, op: number): void => { runtime.bgPositions[`x${bg}`] = value; runtime.operations.push(`ChangeBgX:${bg}:${value}:${op}`); };
const ChangeBgY = (runtime: NewMenuRuntime, bg: number, value: number, op: number): void => { runtime.bgPositions[`y${bg}`] = value; runtime.operations.push(`ChangeBgY:${bg}:${value}:${op}`); };
const InitWindows = (runtime: NewMenuRuntime, templates: WindowTemplate[]): void => { templates.forEach((template, i) => runtime.windows.set(i, template)); runtime.operations.push(`InitWindows:${templates.length}`); };
const DeactivateAllTextPrinters = (runtime: NewMenuRuntime): void => { runtime.textPrinterActive0 = false; runtime.operations.push('DeactivateAllTextPrinters'); };
const AddTextPrinter = (runtime: NewMenuRuntime, template: TextPrinterTemplate, speed: number, callback: string | null): number => {
  runtime.printers.push({ template, speed, callback });
  return runtime.printers.length - 1;
};
const LoadPalette = (runtime: NewMenuRuntime, source: string, offset: number, size: number): void => { runtime.palettes.push({ source, offset, size }); };
const CallWindowFunction = (runtime: NewMenuRuntime, windowId: number, fn: (runtime: NewMenuRuntime, bg: number, left: number, top: number, width: number, height: number, palette: number) => void): void => {
  const win = runtime.windows.get(windowId)!;
  fn(runtime, win.bg, win.tilemapLeft, win.tilemapTop, win.width, win.height, win.paletteNum);
};
const FillWindowPixelBuffer = (runtime: NewMenuRuntime, windowId: number, fill: number): void => { runtime.operations.push(`FillWindowPixelBuffer:${windowId}:${fill}`); };
const PutWindowTilemap = (runtime: NewMenuRuntime, windowId: number): void => { runtime.operations.push(`PutWindowTilemap:${windowId}`); };
const CopyWindowToVram = (runtime: NewMenuRuntime, windowId: number, mode: number): void => { runtime.operations.push(`CopyWindowToVram:${windowId}:${mode}`); };
const ClearWindowTilemap = (runtime: NewMenuRuntime, windowId: number): void => { runtime.operations.push(`ClearWindowTilemap:${windowId}`); };
const FillBgTilemapBufferRect = (runtime: NewMenuRuntime, bg: number, tile: number, left: number, top: number, width: number, height: number, palette: number): void => {
  runtime.operations.push(`FillBgTilemapBufferRect:${bg}:${tile}:${left}:${top}:${width}:${height}:${palette}`);
};
const SetWindowTemplateFields = (bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, paletteNum: number, baseBlock: number): WindowTemplate =>
  ({ bg, tilemapLeft, tilemapTop, width, height, paletteNum, baseBlock });
const AddWindow = (runtime: NewMenuRuntime, template: WindowTemplate): number => {
  const id = runtime.nextWindowId++;
  runtime.windows.set(id, template);
  runtime.operations.push(`AddWindow:${id}`);
  return id;
};
const RemoveWindow = (runtime: NewMenuRuntime, windowId: number): void => {
  const win = runtime.windows.get(windowId);
  if (win) win.removed = true;
  runtime.operations.push(`RemoveWindow:${windowId}`);
};
