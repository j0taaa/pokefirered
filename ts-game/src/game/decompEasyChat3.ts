export const RECTCURSOR_ANIM_ON_GROUP = 0;
export const RECTCURSOR_ANIM_ON_BUTTON = 1;
export const RECTCURSOR_ANIM_ON_OTHERS = 2;
export const RECTCURSOR_ANIM_ON_LETTER = 3;

export const MODEWINDOW_ANIM_HIDDEN = 0;
export const MODEWINDOW_ANIM_TO_GROUP = 1;
export const MODEWINDOW_ANIM_TO_ALPHABET = 2;
export const MODEWINDOW_ANIM_TO_HIDDEN = 3;
export const MODEWINDOW_ANIM_TRANSITION = 4;

export const NUM_ALPHABET_COLUMNS = 7;
export const EC_NUM_GROUPS = 0x16;
export const EC_WORD_UNDEFINED = 0xffff;
export const COPYWIN_FULL = 3;
export const COPYWIN_GFX = 2;
export const FONT_NORMAL_COPY_1 = 1;
export const TEXT_SKIP_DRAW = 0xff;
export const sAlphabetKeyboardColumnOffsets = [0, 12, 24, 56, 68, 80, 92] as const;
export const sEasyChatKeyboardAlphabet = [
  'ABCDEFothers',
  'GHIJKL',
  'MNOPQRS',
  'TUVWXYZ'
] as const;

export const sPhraseFrameDimensions = [
  { left: 3, top: 4, width: 24, height: 4 },
  { left: 1, top: 4, width: 27, height: 4 },
  { left: 3, top: 0, width: 24, height: 10 },
  { left: 6, top: 6, width: 18, height: 4 },
  { left: 16, top: 4, width: 9, height: 2 },
  { left: 14, top: 4, width: 18, height: 4 }
] as const;

export interface EasyChatSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  animNum: number;
  animEnded: boolean;
  invisible: boolean;
  hFlip: boolean;
  vFlip: boolean;
  destroyed: boolean;
}

export interface EasyChat3Runtime {
  state: number;
  windowId: number;
  id: number;
  frameAnimIdx: number;
  frameAnimTarget: number;
  frameAnimDelta: number;
  modeIconState: number;
  ecPrintBuffer: string;
  ecPaddedWordBuffer: string;
  bg1TilemapBuffer: Uint16Array;
  bg3TilemapBuffer: Uint16Array;
  bg2Y: number;
  bg2ScrollRow: number;
  tgtBgY: number;
  deltaBgY: number;
  win0H: number;
  win0V: number;
  dmaBusy: boolean;
  bgVisibility: boolean[];
  operations: string[];
  printedTexts: Array<{ windowId: number; fontId: number; text: string; x: number; y: number; speed: number }>;
  copiedWindows: Array<{ windowId: number; mode: number }>;
  copiedBgIds: number[];
  filledRects: Array<{ bg: number; tile: number; left: number; top: number; width: number; height: number }>;
  pixelRects: Array<{ windowId: number; fill: number; x: number; y: number; width: number; height: number }>;
  selectDestFieldCursorSprite: EasyChatSprite | null;
  rectCursorSpriteRight: EasyChatSprite | null;
  rectCursorSpriteLeft: EasyChatSprite | null;
  selectWordCursorSprite: EasyChatSprite | null;
  selectGroupHelpSprite: EasyChatSprite | null;
  modeIconsSprite: EasyChatSprite | null;
  upTriangleCursorSprite: EasyChatSprite | null;
  downTriangleCursorSprite: EasyChatSprite | null;
  startPgUpButtonSprite: EasyChatSprite | null;
  selectPgDnButtonSprite: EasyChatSprite | null;
  isAlphaMode: boolean;
  shouldDrawUpArrow: boolean;
  shouldDrawDownArrow: boolean;
  selectWordCursorX: number;
  selectWordCursorY: number;
  mainCursorColumn: number;
  mainCursorRow: number;
  groupCursorX: number;
  groupCursorY: number;
  numColumns: number;
  numRows: number;
  screenFrameId: number;
  titleText: string | null;
  instructionsText1: string | null;
  instructionsText2: string | null;
  confirmCancelText1: string | null;
  confirmCancelText2: string | null;
  confirmText1: string | null;
  confirmText2: string | null;
  confirmDeletionText1: string | null;
  confirmDeletionText2: string | null;
  easyChatWordBuffer: number[];
  easyChatWords: Map<number, string>;
  selectedGroups: number[];
  groupRowsAbove: number;
  wordRowsAbove: number;
  wordNumRows: number;
  displayedWords: number[];
  yesNoInitialCursorPos: number | null;
}

export const createEasyChatSprite = (overrides: Partial<EasyChatSprite> = {}): EasyChatSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: [0, 0, 0, 0],
  animNum: 0,
  animEnded: false,
  invisible: false,
  hFlip: false,
  vFlip: false,
  destroyed: false,
  ...overrides
});

export const createEasyChat3Runtime = (overrides: Partial<EasyChat3Runtime> = {}): EasyChat3Runtime => ({
  state: 0,
  windowId: 0,
  id: 0,
  frameAnimIdx: 0,
  frameAnimTarget: 0,
  frameAnimDelta: 0,
  modeIconState: 0,
  ecPrintBuffer: '',
  ecPaddedWordBuffer: '',
  bg1TilemapBuffer: new Uint16Array(32 * 32),
  bg3TilemapBuffer: new Uint16Array(32 * 32),
  bg2Y: 0,
  bg2ScrollRow: 0,
  tgtBgY: 0,
  deltaBgY: 0,
  win0H: 0,
  win0V: 0,
  dmaBusy: false,
  bgVisibility: [false, false, false, false],
  operations: [],
  printedTexts: [],
  copiedWindows: [],
  copiedBgIds: [],
  filledRects: [],
  pixelRects: [],
  selectDestFieldCursorSprite: null,
  rectCursorSpriteRight: null,
  rectCursorSpriteLeft: null,
  selectWordCursorSprite: null,
  selectGroupHelpSprite: null,
  modeIconsSprite: null,
  upTriangleCursorSprite: null,
  downTriangleCursorSprite: null,
  startPgUpButtonSprite: null,
  selectPgDnButtonSprite: null,
  isAlphaMode: false,
  shouldDrawUpArrow: false,
  shouldDrawDownArrow: false,
  selectWordCursorX: 0,
  selectWordCursorY: 0,
  mainCursorColumn: 0,
  mainCursorRow: 0,
  groupCursorX: 0,
  groupCursorY: 0,
  numColumns: 2,
  numRows: 2,
  screenFrameId: 0,
  titleText: null,
  instructionsText1: null,
  instructionsText2: null,
  confirmCancelText1: null,
  confirmCancelText2: null,
  confirmText1: null,
  confirmText2: null,
  confirmDeletionText1: null,
  confirmDeletionText2: null,
  easyChatWordBuffer: [],
  easyChatWords: new Map(),
  selectedGroups: [],
  groupRowsAbove: 0,
  wordRowsAbove: 0,
  wordNumRows: 0,
  displayedWords: [],
  yesNoInitialCursorPos: null,
  ...overrides
});

export const WIN_RANGE = (a: number, b: number): number => ((a << 8) | b) & 0xffff;

export const SetRegWin0Coords = (
  runtime: EasyChat3Runtime,
  left: number,
  top: number,
  width: number,
  height: number
): void => {
  runtime.win0H = WIN_RANGE(left, left + width);
  runtime.win0V = WIN_RANGE(top, top + height);
};

const FillBgTilemapBufferRect_Palette0 = (
  runtime: EasyChat3Runtime,
  bg: number,
  tile: number,
  left: number,
  top: number,
  width: number,
  height: number
): void => {
  runtime.filledRects.push({ bg, tile, left, top, width, height });
};

const FillBgTilemapBufferRect = FillBgTilemapBufferRect_Palette0;

const FillWindowPixelRect = (
  runtime: EasyChat3Runtime,
  windowId: number,
  fill: number,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  runtime.pixelRects.push({ windowId, fill, x, y, width, height });
};

const FillWindowPixelBuffer = (runtime: EasyChat3Runtime, windowId: number, fill: number): void => {
  runtime.operations.push(`FillWindowPixelBuffer:${windowId}:${fill}`);
};

const CopyBgTilemapBufferToVram = (runtime: EasyChat3Runtime, bg: number): void => {
  runtime.copiedBgIds.push(bg);
};

const CopyWindowToVram = (runtime: EasyChat3Runtime, windowId: number, mode: number): void => {
  runtime.copiedWindows.push({ windowId, mode });
};

const PutWindowTilemap = (runtime: EasyChat3Runtime, windowId: number): void => {
  runtime.operations.push(`PutWindowTilemap:${windowId}`);
};

const ShowBg = (runtime: EasyChat3Runtime, bg: number): void => {
  runtime.bgVisibility[bg] = true;
  runtime.operations.push(`ShowBg:${bg}`);
};

const HideBg = (runtime: EasyChat3Runtime, bg: number): void => {
  runtime.bgVisibility[bg] = false;
  runtime.operations.push(`HideBg:${bg}`);
};

const IsDma3ManagerBusyWithBgCopy = (runtime: EasyChat3Runtime): boolean => runtime.dmaBusy;

const GetStringWidth = (text: string): number => text.length * 8;

const CopyEasyChatWord = (runtime: EasyChat3Runtime, word: number): string =>
  runtime.easyChatWords.get(word) ?? `WORD_${word}`;

const CopyEasyChatWordPadded = (runtime: EasyChat3Runtime, word: number): string =>
  CopyEasyChatWord(runtime, word).padEnd(12, ' ');

const GetEasyChatWordGroupName = (_runtime: EasyChat3Runtime, groupId: number): string => `GROUP_${groupId}`;

const GetDisplayedWordByIndex = (runtime: EasyChat3Runtime, index: number): number =>
  runtime.displayedWords[index] ?? EC_WORD_UNDEFINED;

const GetSelectedGroupByIndex = (runtime: EasyChat3Runtime, index: number): number =>
  runtime.selectedGroups[index] ?? EC_NUM_GROUPS;

const GetECSelectGroupRowsAbove = (runtime: EasyChat3Runtime): number => runtime.groupRowsAbove;

const GetECSelectWordRowsAbove = (runtime: EasyChat3Runtime): number => runtime.wordRowsAbove;

const GetECSelectWordNumRows = (runtime: EasyChat3Runtime): number => runtime.wordNumRows;

export const IsEasyChatAlphaMode = (runtime: EasyChat3Runtime): boolean => runtime.isAlphaMode;

export const ShouldDrawECUpArrow = (runtime: EasyChat3Runtime): boolean => runtime.shouldDrawUpArrow;

export const ShouldDrawECDownArrow = (runtime: EasyChat3Runtime): boolean => runtime.shouldDrawDownArrow;

export const GetEasyChatScreenFrameId = (runtime: EasyChat3Runtime): number => runtime.screenFrameId;

export const GetNumColumns = (runtime: EasyChat3Runtime): number => runtime.numColumns;

export const GetNumRows = (runtime: EasyChat3Runtime): number => runtime.numRows;

export const GetMainCursorColumn = (runtime: EasyChat3Runtime): number => runtime.mainCursorColumn;

export const GetMainCursorRow = (runtime: EasyChat3Runtime): number => runtime.mainCursorRow;

export const StartSpriteAnim = (sprite: EasyChatSprite, animNum: number): void => {
  sprite.animNum = animNum;
  sprite.animEnded = false;
};

export const EC_AddTextPrinterParameterized = (
  runtime: EasyChat3Runtime,
  windowId: number,
  fontId: number,
  text: string,
  x: number,
  y: number,
  speed: number
): void => {
  runtime.printedTexts.push({
    windowId,
    fontId,
    text,
    x,
    y: fontId === FONT_NORMAL_COPY_1 ? y + 2 : y,
    speed
  });
};

export const EC_AddTextPrinterParameterized2 = (
  runtime: EasyChat3Runtime,
  windowId: number,
  fontId: number,
  text: string,
  x: number,
  y: number,
  speed: number,
  bg: number,
  fg: number,
  shadow: number
): void => {
  runtime.operations.push(`AddTextPrinterColors:${windowId}:${bg}:${fg}:${shadow}`);
  EC_AddTextPrinterParameterized(runtime, windowId, fontId, text, x, y, speed);
};

export const SetGpuRegsForEasyChatInit = (runtime: EasyChat3Runtime): void => {
  runtime.operations.push('ChangeBgX:3:0:0');
  runtime.operations.push('ChangeBgY:3:0:0');
  runtime.operations.push('ChangeBgX:1:0:0');
  runtime.operations.push('ChangeBgY:1:0:0');
  runtime.operations.push('ChangeBgX:2:0:0');
  runtime.operations.push('ChangeBgY:2:0:0');
  runtime.operations.push('ChangeBgX:0:0:0');
  runtime.operations.push('ChangeBgY:0:0:0');
  runtime.operations.push('SetGpuReg:DISPCNT:MODE_0|OBJ_1D_MAP|OBJ_ON|WIN0_ON');
};

export const LoadEasyChatPals = (runtime: EasyChat3Runtime): void => {
  runtime.operations.push('ResetPaletteFade');
  runtime.operations.push('LoadEasyChatPals');
};

export const PrintTitleText = (runtime: EasyChat3Runtime): void => {
  const titleText = runtime.titleText;
  if (titleText === null)
    return;

  const xOffset = Math.trunc((128 - GetStringWidth(titleText)) / 2) >>> 0;
  FillWindowPixelBuffer(runtime, 0, 0);
  EC_AddTextPrinterParameterized2(runtime, 0, FONT_NORMAL_COPY_1, titleText, xOffset, 0, TEXT_SKIP_DRAW, 0, 1, 2);
  PutWindowTilemap(runtime, 0);
  CopyWindowToVram(runtime, 0, COPYWIN_FULL);
};

export const PrintECInterfaceTextById = (runtime: EasyChat3Runtime, direction: number): void => {
  let text1: string | null = null;
  let text2: string | null = null;

  switch (direction) {
    case 0:
      text1 = runtime.instructionsText1;
      text2 = runtime.instructionsText2;
      break;
    case 2:
      text1 = runtime.confirmCancelText1;
      text2 = runtime.confirmCancelText2;
      break;
    case 3:
      text1 = runtime.confirmText1;
      text2 = runtime.confirmText2;
      break;
    case 1:
      text1 = runtime.confirmDeletionText1;
      text2 = runtime.confirmDeletionText2;
      break;
  }

  FillWindowPixelBuffer(runtime, 1, 1);
  if (text1)
    EC_AddTextPrinterParameterized(runtime, 1, FONT_NORMAL_COPY_1, text1, 0, 0, TEXT_SKIP_DRAW);
  if (text2)
    EC_AddTextPrinterParameterized(runtime, 1, FONT_NORMAL_COPY_1, text2, 0, 16, TEXT_SKIP_DRAW);
  CopyWindowToVram(runtime, 1, COPYWIN_FULL);
};

export const PrintECInstructionsText = (runtime: EasyChat3Runtime): void => {
  FillBgTilemapBufferRect(runtime, 0, 0, 0, 0, 32, 20);
  runtime.operations.push('LoadUserWindowGfx:1:1:14');
  runtime.operations.push('DrawTextBorderOuter:1:1:14');
  PrintECInterfaceTextById(runtime, 0);
  PutWindowTilemap(runtime, 1);
  CopyBgTilemapBufferToVram(runtime, 0);
};

export const EC_CreateYesNoMenuWithInitialCursorPos = (
  runtime: EasyChat3Runtime,
  initialCursorPos: number
): void => {
  runtime.yesNoInitialCursorPos = initialCursorPos;
  runtime.operations.push(`CreateYesNoMenu:${initialCursorPos}`);
};

export const CreatePhraseFrameWindow = (runtime: EasyChat3Runtime): void => {
  const frame = sPhraseFrameDimensions[GetEasyChatScreenFrameId(runtime)] ?? sPhraseFrameDimensions[0];
  runtime.windowId = 3;
  runtime.operations.push(`AddPhraseFrameWindow:${frame.left}:${frame.top}:${frame.width}:${frame.height}:11:96`);
  PutWindowTilemap(runtime, runtime.windowId);
};

export const PrintECFields = (runtime: EasyChat3Runtime): void => {
  const ecWordBuffer = runtime.easyChatWordBuffer;
  const numColumns = GetNumColumns(runtime);
  const numRows = GetNumRows(runtime);
  const frameId = GetEasyChatScreenFrameId(runtime);
  let wordIndex = 0;

  FillWindowPixelBuffer(runtime, runtime.windowId, 1);
  for (let i = 0; i < numRows; i += 1) {
    let str = '<CLEAR 17>';
    for (let j = 0; j < numColumns; j += 1) {
      const word = ecWordBuffer[wordIndex++] ?? EC_WORD_UNDEFINED;
      if (word !== EC_WORD_UNDEFINED)
        str += CopyEasyChatWord(runtime, word);
      else
        str += '<RED>_______<DARK_GRAY>';

      str += '<CLEAR 17>';
      if (frameId === 2 && j === 0 && i === 4)
        break;
    }

    runtime.ecPrintBuffer = str;
    EC_AddTextPrinterParameterized(runtime, runtime.windowId, FONT_NORMAL_COPY_1, str, 0, i * 16, TEXT_SKIP_DRAW);
  }

  CopyWindowToVram(runtime, runtime.windowId, COPYWIN_FULL);
};

export const DrawECFrameInTilemapBuffer = (runtime: EasyChat3Runtime, tilemap = runtime.bg1TilemapBuffer): void => {
  const frameId = GetEasyChatScreenFrameId(runtime);
  const frame = sPhraseFrameDimensions[frameId] ?? sPhraseFrameDimensions[0];
  tilemap.fill(0);

  let right = frame.left + frame.width;
  let bottom = frame.top + frame.height;
  if (frameId === 2) {
    for (let y = frame.top; y < bottom; y += 1) {
      let x = frame.left - 1;
      tilemap[y * 32 + x] = 0x1005;
      x += 1;
      for (; x < right; x += 1)
        tilemap[y * 32 + x] = 0x1000;
      tilemap[y * 32 + x] = 0x1007;
    }
    return;
  }

  let y = frame.top - 1;
  let x = frame.left - 1;
  tilemap[y * 32 + x] = 0x1001;
  x += 1;
  for (; x < right; x += 1)
    tilemap[y * 32 + x] = 0x1002;
  tilemap[y * 32 + x] = 0x1003;
  y += 1;
  for (; y < bottom; y += 1) {
    x = frame.left - 1;
    tilemap[y * 32 + x] = 0x1005;
    x += 1;
    for (; x < right; x += 1)
      tilemap[y * 32 + x] = 0x1000;
    tilemap[y * 32 + x] = 0x1007;
  }

  x = frame.left - 1;
  tilemap[y * 32 + x] = 0x1009;
  x += 1;
  for (; x < right; x += 1)
    tilemap[y * 32 + x] = 0x100a;
  tilemap[y * 32 + x] = 0x100b;
};

export const PutWin2TilemapAndCopyToVram = (runtime: EasyChat3Runtime): void => {
  PutWindowTilemap(runtime, 2);
  CopyBgTilemapBufferToVram(runtime, 2);
};

export const StartWin2FrameAnim = (runtime: EasyChat3Runtime, animNo: number): void => {
  switch (animNo) {
    case 0:
      runtime.frameAnimIdx = 0;
      runtime.frameAnimTarget = 10;
      break;
    case 1:
      runtime.frameAnimIdx = 9;
      runtime.frameAnimTarget = 0;
      break;
    case 2:
      runtime.frameAnimIdx = 11;
      runtime.frameAnimTarget = 17;
      break;
    case 3:
      runtime.frameAnimIdx = 17;
      runtime.frameAnimTarget = 0;
      break;
    case 4:
      runtime.frameAnimIdx = 17;
      runtime.frameAnimTarget = 10;
      break;
    case 5:
      runtime.frameAnimIdx = 18;
      runtime.frameAnimTarget = 22;
      break;
    case 6:
      runtime.frameAnimIdx = 22;
      runtime.frameAnimTarget = 18;
      break;
  }

  runtime.frameAnimDelta = runtime.frameAnimIdx < runtime.frameAnimTarget ? 1 : -1;
};

export const AnimateFrameResize = (runtime: EasyChat3Runtime): boolean => {
  if (runtime.frameAnimIdx === runtime.frameAnimTarget) {
    return false;
  }

  runtime.frameAnimIdx += runtime.frameAnimDelta;
  RedrawFrameByIndex(runtime, runtime.frameAnimIdx);
  return runtime.frameAnimIdx !== runtime.frameAnimTarget;
};

export const RedrawFrameByIndex = (runtime: EasyChat3Runtime, direction: number): void => {
  FillBgTilemapBufferRect_Palette0(runtime, 1, 0, 0, 10, 30, 10);
  switch (direction) {
    case 0:
      break;
    case 1:
      RedrawFrameByRect(runtime, 11, 14, 3, 2);
      break;
    case 2:
      RedrawFrameByRect(runtime, 9, 14, 7, 2);
      break;
    case 3:
      RedrawFrameByRect(runtime, 7, 14, 11, 2);
      break;
    case 4:
      RedrawFrameByRect(runtime, 5, 14, 15, 2);
      break;
    case 5:
      RedrawFrameByRect(runtime, 3, 14, 19, 2);
      break;
    case 6:
      RedrawFrameByRect(runtime, 1, 14, 23, 2);
      break;
    case 7:
      RedrawFrameByRect(runtime, 1, 13, 23, 4);
      break;
    case 8:
      RedrawFrameByRect(runtime, 1, 12, 23, 6);
      break;
    case 9:
      RedrawFrameByRect(runtime, 1, 11, 23, 8);
      break;
    case 10:
      RedrawFrameByRect(runtime, 1, 10, 23, 10);
      break;
    case 11:
      RedrawFrameByRect(runtime, 1, 10, 24, 10);
      break;
    case 12:
      RedrawFrameByRect(runtime, 1, 10, 25, 10);
      break;
    case 13:
      RedrawFrameByRect(runtime, 1, 10, 26, 10);
      break;
    case 14:
      RedrawFrameByRect(runtime, 1, 10, 27, 10);
      break;
    case 15:
      RedrawFrameByRect(runtime, 1, 10, 28, 10);
      break;
    case 16:
      RedrawFrameByRect(runtime, 1, 10, 29, 10);
      break;
    case 17:
      RedrawFrameByRect(runtime, 0, 10, 30, 10);
      break;
    case 18:
      RedrawFrameByRect(runtime, 1, 10, 23, 10);
      break;
    case 19:
      RedrawFrameByRect(runtime, 1, 11, 23, 8);
      break;
    case 20:
      RedrawFrameByRect(runtime, 1, 12, 23, 6);
      break;
    case 21:
      RedrawFrameByRect(runtime, 1, 13, 23, 4);
      break;
    case 22:
      RedrawFrameByRect(runtime, 1, 14, 23, 2);
      break;
  }

  CopyBgTilemapBufferToVram(runtime, 1);
};

export const PrintECMenuById = (runtime: EasyChat3Runtime, id: number): void => {
  InitBg2Scroll(runtime);
  FillWindowPixelBuffer(runtime, 2, 1);
  switch (id) {
    case 0:
      PrintECGroupsMenu(runtime);
      break;
    case 1:
      PrintEasyChatKeyboardText(runtime);
      break;
    case 2:
      PrintECWordsMenu(runtime);
      break;
  }
  CopyWindowToVram(runtime, 2, COPYWIN_GFX);
};

export const PrintECGroupOrAlphaMenu = (runtime: EasyChat3Runtime): void => {
  if (!IsEasyChatAlphaMode(runtime))
    PrintECMenuById(runtime, 0);
  else
    PrintECMenuById(runtime, 1);
};

export const PrintECGroupsMenu = (runtime: EasyChat3Runtime): void => {
  let i = 0;
  let y = 96;
  while (true) {
    for (let x = 0; x < 2; x += 1) {
      const groupId = GetSelectedGroupByIndex(runtime, i);
      i += 1;
      if (groupId === EC_NUM_GROUPS) {
        ScheduleBg2VerticalScroll(runtime, GetECSelectGroupRowsAbove(runtime), 0);
        return;
      }
      EC_AddTextPrinterParameterized(runtime, 2, FONT_NORMAL_COPY_1, GetEasyChatWordGroupName(runtime, groupId), x * 84 + 10, y, TEXT_SKIP_DRAW);
    }
    y += 16;
  }
};

export const PrintEasyChatKeyboardText = (runtime: EasyChat3Runtime): void => {
  for (let i = 0; i < sEasyChatKeyboardAlphabet.length; i += 1)
    EC_AddTextPrinterParameterized(runtime, 2, FONT_NORMAL_COPY_1, sEasyChatKeyboardAlphabet[i], 10, 96 + i * 16, TEXT_SKIP_DRAW);
};

export const PrintECWordsMenu = (runtime: EasyChat3Runtime): void => {
  PrintECRowsWin2(runtime, 0, 4);
};

export const UpdateWin2PrintWordsScrollDown = (runtime: EasyChat3Runtime): void => {
  const rowsAbove = GetECSelectWordRowsAbove(runtime) + 3;
  ClearECRowsWin2(runtime, rowsAbove, 1);
  PrintECRowsWin2(runtime, rowsAbove, 1);
};

export const UpdateWin2PrintWordsScrollUp = (runtime: EasyChat3Runtime): void => {
  const rowsAbove = GetECSelectWordRowsAbove(runtime);
  ClearECRowsWin2(runtime, rowsAbove, 1);
  PrintECRowsWin2(runtime, rowsAbove, 1);
};

export const UpdateWin2PrintWordsScrollPageDown = (runtime: EasyChat3Runtime): void => {
  const row = GetECSelectWordRowsAbove(runtime);
  let maxrow = row + 4;
  const numrowsplus1 = GetECSelectWordNumRows(runtime) + 1;
  if (maxrow > numrowsplus1)
    maxrow = numrowsplus1;
  if (row < maxrow) {
    const remrow = maxrow - row;
    ClearECRowsWin2(runtime, row, remrow);
    PrintECRowsWin2(runtime, row, remrow);
  }
};

export const UpdateWin2PrintWordsScrollPageUp = (runtime: EasyChat3Runtime): void => {
  const row = GetECSelectWordRowsAbove(runtime);
  const maxrow = GetBg2ScrollRow(runtime);
  if (row < maxrow) {
    const remrow = maxrow - row;
    ClearECRowsWin2(runtime, row, remrow);
    PrintECRowsWin2(runtime, row, remrow);
  }
};

export const PrintECRowsWin2 = (runtime: EasyChat3Runtime, row: number, remrow: number): void => {
  let ecWordIdx = row * 2;
  let y = (row * 16 + 96) & 0xff;

  for (let i = 0; i < remrow; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      const y_ = (y << 18) >> 18;
      const easyChatWord = GetDisplayedWordByIndex(runtime, ecWordIdx);
      ecWordIdx += 1;
      if (easyChatWord !== EC_WORD_UNDEFINED) {
        runtime.ecPaddedWordBuffer = CopyEasyChatWordPadded(runtime, easyChatWord);
        EC_AddTextPrinterParameterized(runtime, 2, FONT_NORMAL_COPY_1, runtime.ecPaddedWordBuffer, (j * 13 + 3) * 8, y_, TEXT_SKIP_DRAW);
      }
    }
    y += 16;
  }

  CopyWindowToVram(runtime, 2, COPYWIN_GFX);
};

export const ClearECRowsWin2 = (runtime: EasyChat3Runtime, row: number, remrow: number): void => {
  const y = (row * 16 + 96) & 0xff;
  let heightToBottom = remrow * 16;
  const totalHeight = y + heightToBottom;
  let heightWrappedAround: number;
  if (totalHeight > 255) {
    heightWrappedAround = totalHeight - 256;
    heightToBottom = 256 - y;
  } else {
    heightWrappedAround = 0;
  }

  FillWindowPixelRect(runtime, 2, 1, 0, y, 224, heightToBottom);
  if (heightWrappedAround)
    FillWindowPixelRect(runtime, 2, 1, 0, 0, 224, heightWrappedAround);
};

export const ClearWin2AndCopyToVram = (runtime: EasyChat3Runtime): void => {
  FillWindowPixelBuffer(runtime, 2, 1);
  CopyWindowToVram(runtime, 2, COPYWIN_GFX);
};

export const RedrawFrameByRect = (
  runtime: EasyChat3Runtime,
  left: number,
  top: number,
  width: number,
  height: number
): void => {
  const tilemap = runtime.bg1TilemapBuffer;
  const right = left + width - 1;
  const bottom = top + height - 1;
  let x = left;
  let y = top;

  tilemap[y * 32 + x] = 0x4001;
  x += 1;
  for (; x < right; x += 1) {
    tilemap[y * 32 + x] = 0x4002;
  }

  tilemap[y * 32 + x] = 0x4003;
  y += 1;
  for (; y < bottom; y += 1) {
    tilemap[y * 32 + left] = 0x4005;
    x = left + 1;
    for (; x < right; x += 1) {
      tilemap[y * 32 + x] = 0x4000;
    }

    tilemap[y * 32 + x] = 0x4007;
  }

  tilemap[y * 32 + left] = 0x4009;
  x = left + 1;
  for (; x < right; x += 1) {
    tilemap[y * 32 + x] = 0x400a;
  }

  tilemap[y * 32 + x] = 0x400b;
  SetRegWin0Coords(runtime, (left + 1) * 8, (top + 1) * 8, (width - 2) * 8, (height - 2) * 8);
};

export const InitBg2Scroll = (runtime: EasyChat3Runtime): void => {
  runtime.bg2Y = 0x800;
  runtime.bg2ScrollRow = 0;
};

export const ScheduleBg2VerticalScroll = (
  runtime: EasyChat3Runtime,
  direction: number,
  speed: number
): void => {
  let bgY = runtime.bg2Y;
  const totalDelta = direction * 16;
  runtime.bg2ScrollRow += direction;
  bgY += totalDelta << 8;
  if (speed) {
    runtime.tgtBgY = bgY;
    runtime.deltaBgY = speed * 256;
    if (totalDelta < 0) {
      runtime.deltaBgY = -runtime.deltaBgY;
    }
  } else {
    runtime.bg2Y = bgY;
  }
};

export const AnimateBg2VerticalScroll = (runtime: EasyChat3Runtime): boolean => {
  const bgY = runtime.bg2Y;
  if (bgY === runtime.tgtBgY) {
    return false;
  }

  runtime.bg2Y += runtime.deltaBgY;
  return true;
};

export const GetBg2ScrollRow = (runtime: EasyChat3Runtime): number => runtime.bg2ScrollRow;

export const MoveCursor_Group = (runtime: EasyChat3Runtime, x: number, y: number): void => {
  if (!runtime.rectCursorSpriteRight || !runtime.rectCursorSpriteLeft) {
    return;
  }

  if (x !== -1) {
    StartSpriteAnim(runtime.rectCursorSpriteRight, RECTCURSOR_ANIM_ON_GROUP);
    runtime.rectCursorSpriteRight.x = x * 84 + 58;
    runtime.rectCursorSpriteRight.y = y * 16 + 96;

    StartSpriteAnim(runtime.rectCursorSpriteLeft, RECTCURSOR_ANIM_ON_GROUP);
    runtime.rectCursorSpriteLeft.x = x * 84 + 58;
    runtime.rectCursorSpriteLeft.y = y * 16 + 96;
  } else {
    StartSpriteAnim(runtime.rectCursorSpriteRight, RECTCURSOR_ANIM_ON_BUTTON);
    runtime.rectCursorSpriteRight.x = 216;
    runtime.rectCursorSpriteRight.y = y * 16 + 112;

    StartSpriteAnim(runtime.rectCursorSpriteLeft, RECTCURSOR_ANIM_ON_BUTTON);
    runtime.rectCursorSpriteLeft.x = 216;
    runtime.rectCursorSpriteLeft.y = y * 16 + 112;
  }
};

export const MoveCursor_Alpha = (runtime: EasyChat3Runtime, cursorX: number, cursorY: number): void => {
  if (!runtime.rectCursorSpriteRight || !runtime.rectCursorSpriteLeft) {
    return;
  }

  if (cursorX !== -1) {
    const y = cursorY * 16 + 96;
    let x = 32;
    let anim: number;
    if (cursorX === 6 && cursorY === 0) {
      x = 157;
      anim = RECTCURSOR_ANIM_ON_OTHERS;
    } else {
      x += sAlphabetKeyboardColumnOffsets[cursorX < sAlphabetKeyboardColumnOffsets.length ? cursorX : 0];
      anim = RECTCURSOR_ANIM_ON_LETTER;
    }

    StartSpriteAnim(runtime.rectCursorSpriteRight, anim);
    runtime.rectCursorSpriteRight.x = x;
    runtime.rectCursorSpriteRight.y = y;

    StartSpriteAnim(runtime.rectCursorSpriteLeft, anim);
    runtime.rectCursorSpriteLeft.x = x;
    runtime.rectCursorSpriteLeft.y = y;
  } else {
    StartSpriteAnim(runtime.rectCursorSpriteRight, RECTCURSOR_ANIM_ON_BUTTON);
    runtime.rectCursorSpriteRight.x = 216;
    runtime.rectCursorSpriteRight.y = cursorY * 16 + 112;

    StartSpriteAnim(runtime.rectCursorSpriteLeft, RECTCURSOR_ANIM_ON_BUTTON);
    runtime.rectCursorSpriteLeft.x = 216;
    runtime.rectCursorSpriteLeft.y = cursorY * 16 + 112;
  }
};

export const EC_MoveCursor = (runtime: EasyChat3Runtime): void => {
  if (runtime.rectCursorSpriteRight && runtime.rectCursorSpriteLeft) {
    if (!IsEasyChatAlphaMode(runtime))
      MoveCursor_Group(runtime, runtime.groupCursorX, runtime.groupCursorY);
    else
      MoveCursor_Alpha(runtime, runtime.groupCursorX, runtime.groupCursorY);
  }
};

export const SpriteCB_BounceCursor = (sprite: EasyChatSprite): void => {
  if (sprite.data[1]) {
    sprite.data[0] += 1;
    if (sprite.data[0] > 2) {
      sprite.data[0] = 0;
      sprite.x2 += 1;
      if (sprite.x2 > 0) {
        sprite.x2 = -6;
      }
    }
  }
};

export const SetSelectDestFieldCursorSpritePosAndResetAnim = (
  runtime: EasyChat3Runtime,
  x: number,
  y: number
): void => {
  if (!runtime.selectDestFieldCursorSprite) {
    return;
  }

  runtime.selectDestFieldCursorSprite.x = x;
  runtime.selectDestFieldCursorSprite.y = y;
  runtime.selectDestFieldCursorSprite.x2 = 0;
  runtime.selectDestFieldCursorSprite.data[0] = 0;
};

export const FreezeSelectDestFieldCursorSprite = (runtime: EasyChat3Runtime): void => {
  if (!runtime.selectDestFieldCursorSprite) {
    return;
  }

  runtime.selectDestFieldCursorSprite.data[0] = 0;
  runtime.selectDestFieldCursorSprite.data[1] = 0;
  runtime.selectDestFieldCursorSprite.x2 = 0;
};

export const UnfreezeSelectDestFieldCursorSprite = (runtime: EasyChat3Runtime): void => {
  if (runtime.selectDestFieldCursorSprite) {
    runtime.selectDestFieldCursorSprite.data[1] = 1;
  }
};

export const CreateRedRectangularCursorSpritePair = (runtime: EasyChat3Runtime): void => {
  runtime.rectCursorSpriteRight = createEasyChatSprite({ x2: 32, hFlip: true });
  runtime.rectCursorSpriteLeft = createEasyChatSprite({ x2: -32 });
};

export const DestroyRedRectangularCursor = (runtime: EasyChat3Runtime): void => {
  if (runtime.rectCursorSpriteRight) {
    runtime.rectCursorSpriteRight.destroyed = true;
  }
  if (runtime.rectCursorSpriteLeft) {
    runtime.rectCursorSpriteLeft.destroyed = true;
  }
  runtime.rectCursorSpriteRight = null;
  runtime.rectCursorSpriteLeft = null;
};

export const CreateSelectWordCursorSprite = (runtime: EasyChat3Runtime): void => {
  runtime.selectWordCursorSprite = createEasyChatSprite();
  SetSelectWordCursorSpritePos(runtime);
};

export const SpriteCB_SelectWordCursorSprite = (sprite: EasyChatSprite): void => {
  sprite.data[0] += 1;
  if (sprite.data[0] > 2) {
    sprite.data[0] = 0;
    sprite.x2 += 1;
    if (sprite.x2 > 0) {
      sprite.x2 = -6;
    }
  }
};

export const SetSelectWordCursorSpritePos = (runtime: EasyChat3Runtime): void => {
  SetSelectWordCursorSpritePosExplicit(
    runtime,
    runtime.selectWordCursorX * 13 + 3,
    runtime.selectWordCursorY * 2 + 11
  );
};

export const SetSelectWordCursorSpritePosExplicit = (
  runtime: EasyChat3Runtime,
  x: number,
  y: number
): void => {
  if (runtime.selectWordCursorSprite) {
    runtime.selectWordCursorSprite.x = x * 8 + 4;
    runtime.selectWordCursorSprite.y = (y + 1) * 8 + 1;
    runtime.selectWordCursorSprite.x2 = 0;
    runtime.selectWordCursorSprite.data[0] = 0;
  }
};

export const DestroySelectWordCursorSprite = (runtime: EasyChat3Runtime): void => {
  if (runtime.selectWordCursorSprite) {
    runtime.selectWordCursorSprite.destroyed = true;
    runtime.selectWordCursorSprite = null;
  }
};

export const CreateSelectGroupHelpSprite = (runtime: EasyChat3Runtime): void => {
  runtime.selectGroupHelpSprite = createEasyChatSprite({ x: 208, y: 128, x2: -64 });
  runtime.modeIconsSprite = createEasyChatSprite({ x: 208, y: 80 });
  runtime.modeIconState = 0;
};

export const AnimateSeletGroupModeAndHelpSpriteEnter = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.modeIconState) {
    default:
      return false;
    case 0:
      if (!runtime.selectGroupHelpSprite || !runtime.modeIconsSprite) {
        return false;
      }
      runtime.selectGroupHelpSprite.x2 += 8;
      if (runtime.selectGroupHelpSprite.x2 >= 0) {
        runtime.selectGroupHelpSprite.x2 = 0;
        StartSpriteAnim(
          runtime.modeIconsSprite,
          !runtime.isAlphaMode ? MODEWINDOW_ANIM_TO_GROUP : MODEWINDOW_ANIM_TO_ALPHABET
        );
        runtime.modeIconState += 1;
      }
      break;
    case 1:
      if (runtime.modeIconsSprite?.animEnded) {
        runtime.modeIconState = 2;
        return false;
      }
      break;
  }

  return true;
};

export const StartModeIconHidingAnimation = (runtime: EasyChat3Runtime): void => {
  runtime.modeIconState = 0;
  if (runtime.modeIconsSprite) {
    StartSpriteAnim(runtime.modeIconsSprite, MODEWINDOW_ANIM_TO_HIDDEN);
  }
};

export const RunModeIconHidingAnimation = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.modeIconState) {
    default:
      return false;
    case 0:
      if (runtime.modeIconsSprite?.animEnded) {
        runtime.modeIconState = 1;
      }
      break;
    case 1:
      if (!runtime.selectGroupHelpSprite || !runtime.modeIconsSprite) {
        return false;
      }
      runtime.selectGroupHelpSprite.x2 -= 8;
      if (runtime.selectGroupHelpSprite.x2 <= -64) {
        runtime.modeIconsSprite.destroyed = true;
        runtime.selectGroupHelpSprite.destroyed = true;
        runtime.modeIconsSprite = null;
        runtime.selectGroupHelpSprite = null;
        runtime.modeIconState += 1;
        return false;
      }
      break;
  }

  return true;
};

export const ShrinkModeIconsSprite = (runtime: EasyChat3Runtime): void => {
  if (runtime.modeIconsSprite) {
    StartSpriteAnim(runtime.modeIconsSprite, MODEWINDOW_ANIM_TRANSITION);
  }
};

export const ShowModeIconsSprite = (runtime: EasyChat3Runtime): void => {
  if (runtime.modeIconsSprite) {
    StartSpriteAnim(runtime.modeIconsSprite, !runtime.isAlphaMode ? MODEWINDOW_ANIM_TO_GROUP : MODEWINDOW_ANIM_TO_ALPHABET);
  }
};

export const ModeIconsSpriteAnimIsEnded = (runtime: EasyChat3Runtime): boolean =>
  !Boolean(runtime.modeIconsSprite?.animEnded);

export const CreateVerticalScrollArrowSprites = (runtime: EasyChat3Runtime): void => {
  runtime.upTriangleCursorSprite = createEasyChatSprite({ x: 96, y: 80 });
  runtime.downTriangleCursorSprite = createEasyChatSprite({ x: 96, y: 156, vFlip: true });
  HideVerticalScrollArrowSprites(runtime);
};

export const UpdateVerticalScrollArrowVisibility = (runtime: EasyChat3Runtime): void => {
  if (runtime.upTriangleCursorSprite) {
    runtime.upTriangleCursorSprite.invisible = !runtime.shouldDrawUpArrow;
  }
  if (runtime.downTriangleCursorSprite) {
    runtime.downTriangleCursorSprite.invisible = !runtime.shouldDrawDownArrow;
  }
};

export const HideVerticalScrollArrowSprites = (runtime: EasyChat3Runtime): void => {
  if (runtime.upTriangleCursorSprite) {
    runtime.upTriangleCursorSprite.invisible = true;
  }
  if (runtime.downTriangleCursorSprite) {
    runtime.downTriangleCursorSprite.invisible = true;
  }
};

export const UpdateVerticalScrollArrowSpriteXPos = (runtime: EasyChat3Runtime, direction: number): void => {
  const x = !direction ? 96 : 120;
  if (runtime.upTriangleCursorSprite) {
    runtime.upTriangleCursorSprite.x = x;
  }
  if (runtime.downTriangleCursorSprite) {
    runtime.downTriangleCursorSprite.x = x;
  }
};

export const CreateStartSelectButtonsSprites = (runtime: EasyChat3Runtime): void => {
  runtime.startPgUpButtonSprite = createEasyChatSprite({ x: 220, y: 84 });
  runtime.selectPgDnButtonSprite = createEasyChatSprite({ x: 220, y: 156 });
  StartSpriteAnim(runtime.selectPgDnButtonSprite, 1);
  HideStartSelectButtonSprites(runtime);
};

export const UpdateStartSelectButtonSpriteVisibility = (runtime: EasyChat3Runtime): void => {
  if (runtime.startPgUpButtonSprite) {
    runtime.startPgUpButtonSprite.invisible = !runtime.shouldDrawUpArrow;
  }
  if (runtime.selectPgDnButtonSprite) {
    runtime.selectPgDnButtonSprite.invisible = !runtime.shouldDrawDownArrow;
  }
};

export const HideStartSelectButtonSprites = (runtime: EasyChat3Runtime): void => {
  if (runtime.startPgUpButtonSprite) {
    runtime.startPgUpButtonSprite.invisible = true;
  }
  if (runtime.selectPgDnButtonSprite) {
    runtime.selectPgDnButtonSprite.invisible = true;
  }
};

export const CreateFooterWindow = (runtime: EasyChat3Runtime): void => {
  const windowId = 4;
  runtime.operations.push('AddFooterWindow:4:11:24:2:11:48');
  FillWindowPixelBuffer(runtime, windowId, 1);
  EC_AddTextPrinterParameterized(runtime, windowId, FONT_NORMAL_COPY_1, 'DEL ALL/CANCEL/OK', 0, 0, 0);
  PutWindowTilemap(runtime, windowId);
};

export const InitEasyChatGraphicsWork_Internal = (runtime: EasyChat3Runtime): boolean => {
  runtime.state = 0;
  runtime.selectDestFieldCursorSprite = null;
  runtime.rectCursorSpriteRight = null;
  runtime.rectCursorSpriteLeft = null;
  runtime.selectWordCursorSprite = null;
  runtime.selectGroupHelpSprite = null;
  runtime.modeIconsSprite = null;
  runtime.upTriangleCursorSprite = null;
  runtime.downTriangleCursorSprite = null;
  runtime.startPgUpButtonSprite = null;
  runtime.selectPgDnButtonSprite = null;
  return true;
};

export const InitEasyChatGraphicsWork = (runtime: EasyChat3Runtime): boolean =>
  InitEasyChatGraphicsWork_Internal(runtime);

export const LoadSpriteGfx = (runtime: EasyChat3Runtime): void => {
  runtime.operations.push('LoadSpriteSheets:sEasyChatSpriteSheets');
  runtime.operations.push('LoadSpritePalettes:sEasyChatSpritePalettes');
  runtime.operations.push('LoadCompressedSpriteSheets:sEasyChatCompressedSpriteSheets');
};

export const CreateSelectDestFieldCursorSprite = (runtime: EasyChat3Runtime): void => {
  runtime.selectDestFieldCursorSprite = createEasyChatSprite({ x: 0, y: 0, data: [0, 1, 0, 0] });
};

export const DestroyEasyChatGraphicsResources = (runtime: EasyChat3Runtime): void => {
  runtime.operations.push('FreeEasyChatGraphicsResources');
};

export const LoadEasyChatGraphics = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      runtime.operations.push('ResetBgsAndClearDma3BusyFlags:0');
      runtime.operations.push('InitBgsFromTemplates:sEasyChatBgTemplates');
      runtime.operations.push('SetBgTilemapBuffer:3:bg3TilemapBuffer');
      runtime.operations.push('SetBgTilemapBuffer:1:bg1TilemapBuffer');
      runtime.operations.push('InitWindows:sEasyChatWindowTemplates');
      runtime.operations.push('DeactivateAllTextPrinters');
      LoadEasyChatPals(runtime);
      SetGpuRegsForEasyChatInit(runtime);
      runtime.operations.push('CpuFastFill:VRAM_OBJ:0x400');
      break;
    case 1:
      runtime.operations.push('DecompressAndLoadBgGfxUsingHeap:3:gEasyChatWindow_Gfx');
      runtime.operations.push('CopyToBgTilemapBuffer:3:gEasyChatWindow_Tilemap');
      CreatePhraseFrameWindow(runtime);
      CreateFooterWindow(runtime);
      CopyBgTilemapBufferToVram(runtime, 3);
      break;
    case 2:
      DrawECFrameInTilemapBuffer(runtime, runtime.bg1TilemapBuffer);
      runtime.operations.push('DecompressAndLoadBgGfxUsingHeap:1:sTextInputFrame_Gfx');
      CopyBgTilemapBufferToVram(runtime, 1);
      break;
    case 3:
      PrintTitleText(runtime);
      PrintECInstructionsText(runtime);
      PrintECFields(runtime);
      PutWin2TilemapAndCopyToVram(runtime);
      break;
    case 4:
      LoadSpriteGfx(runtime);
      CreateSelectDestFieldCursorSprite(runtime);
      break;
    case 5:
      if (IsDma3ManagerBusyWithBgCopy(runtime))
        return true;
      SetRegWin0Coords(runtime, 0, 0, 0, 0);
      runtime.operations.push(`SetGpuReg:WININ:${WIN_RANGE(0, 63)}`);
      runtime.operations.push(`SetGpuReg:WINOUT:${WIN_RANGE(0, 59)}`);
      ShowBg(runtime, 3);
      ShowBg(runtime, 1);
      ShowBg(runtime, 2);
      ShowBg(runtime, 0);
      CreateVerticalScrollArrowSprites(runtime);
      CreateStartSelectButtonsSprites(runtime);
      break;
    default:
      return false;
  }

  runtime.state += 1;
  return true;
};

export const EasyChatInterfaceCommand_Setup = (runtime: EasyChat3Runtime, id: number): void => {
  runtime.id = id;
  runtime.state = 0;
  EasyChatInterfaceCommand_Run(runtime);
};

export const EasyChatInterfaceCommand_Run = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.id) {
    case 0: return false;
    case 1: return ECInterfaceCmd_01(runtime);
    case 2: return ECInterfaceCmd_02(runtime);
    case 3: return ECInterfaceCmd_03(runtime);
    case 4: return ECInterfaceCmd_04(runtime);
    case 5: return ECInterfaceCmd_05(runtime);
    case 6: return ECInterfaceCmd_06(runtime);
    case 7: return ECInterfaceCmd_07(runtime);
    case 8: return ECInterfaceCmd_08(runtime);
    case 9: return ECInterfaceCmd_09(runtime);
    case 10: return ECInterfaceCmd_10(runtime);
    case 11: return ECInterfaceCmd_11(runtime);
    case 12: return ECInterfaceCmd_12(runtime);
    case 13: return ECInterfaceCmd_13(runtime);
    case 14: return ECInterfaceCmd_14(runtime);
    case 15: return ECInterfaceCmd_15(runtime);
    case 16: return ECInterfaceCmd_16(runtime);
    case 17: return ECInterfaceCmd_17(runtime);
    case 18: return ECInterfaceCmd_18(runtime);
    case 19: return ECInterfaceCmd_19(runtime);
    case 20: return ECInterfaceCmd_20(runtime);
    case 21: return ECInterfaceCmd_21(runtime);
    case 22: return ECInterfaceCmd_22(runtime);
    default: return false;
  }
};

export const ECInterfaceCmd_01 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      PrintECFields(runtime);
      runtime.state += 1;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy(runtime);
  }
  return true;
};

export const ECInterfaceCmd_02 = (runtime: EasyChat3Runtime): boolean => {
  const ecWordBuffer = runtime.easyChatWordBuffer;
  const frameId = GetEasyChatScreenFrameId(runtime);
  const frame = sPhraseFrameDimensions[frameId] ?? sPhraseFrameDimensions[0];
  const cursorColumn = GetMainCursorColumn(runtime);
  const cursorRow = GetMainCursorRow(runtime);
  const numColumns = GetNumColumns(runtime);
  let ecWordIndex = cursorRow * numColumns;
  let x = 8 * frame.left + 13;

  for (let i = 0; i < cursorColumn; i += 1) {
    const word = ecWordBuffer[ecWordIndex] ?? EC_WORD_UNDEFINED;
    const stringWidth = word === EC_WORD_UNDEFINED
      ? GetStringWidth('_') * 7
      : GetStringWidth(CopyEasyChatWord(runtime, word));
    x += stringWidth + 17;
    ecWordIndex += 1;
  }

  const y = 8 * (frame.top + cursorRow * 2 + 1) + 1;
  SetSelectDestFieldCursorSpritePosAndResetAnim(runtime, x, y);
  return false;
};

export const ECInterfaceCmd_03 = (runtime: EasyChat3Runtime): boolean => {
  let xOffset: number;
  switch (GetMainCursorColumn(runtime)) {
    case 0:
      xOffset = 28;
      break;
    case 1:
      xOffset = 115;
      break;
    case 2:
      xOffset = 191;
      break;
    default:
      return false;
  }
  SetSelectDestFieldCursorSpritePosAndResetAnim(runtime, xOffset, 97);
  return false;
};

const ECInterfaceCmd_ConfirmCommon = (
  runtime: EasyChat3Runtime,
  textId: number,
  initialCursorPos: number
): boolean => {
  switch (runtime.state) {
    case 0:
      FreezeSelectDestFieldCursorSprite(runtime);
      PrintECInterfaceTextById(runtime, textId);
      EC_CreateYesNoMenuWithInitialCursorPos(runtime, initialCursorPos);
      runtime.state += 1;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy(runtime);
  }
  return true;
};

export const ECInterfaceCmd_04 = (runtime: EasyChat3Runtime): boolean => ECInterfaceCmd_ConfirmCommon(runtime, 1, 1);
export const ECInterfaceCmd_05 = (runtime: EasyChat3Runtime): boolean => ECInterfaceCmd_ConfirmCommon(runtime, 2, 1);
export const ECInterfaceCmd_06 = (runtime: EasyChat3Runtime): boolean => ECInterfaceCmd_ConfirmCommon(runtime, 3, 0);

export const ECInterfaceCmd_07 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      UnfreezeSelectDestFieldCursorSprite(runtime);
      PrintECInterfaceTextById(runtime, 0);
      ShowBg(runtime, 0);
      runtime.state += 1;
      break;
    case 1:
      return IsDma3ManagerBusyWithBgCopy(runtime);
  }
  return true;
};

export const ECInterfaceCmd_08 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      UnfreezeSelectDestFieldCursorSprite(runtime);
      PrintECInterfaceTextById(runtime, 0);
      PrintECFields(runtime);
      runtime.state += 1;
    // fall through
    case 1:
      return IsDma3ManagerBusyWithBgCopy(runtime);
  }
  return true;
};

export const ECInterfaceCmd_09 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      FreezeSelectDestFieldCursorSprite(runtime);
      HideBg(runtime, 0);
      SetRegWin0Coords(runtime, 0, 0, 0, 0);
      PrintECGroupOrAlphaMenu(runtime);
      runtime.state += 1;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        StartWin2FrameAnim(runtime, 0);
        runtime.state += 1;
      }
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy(runtime) && !AnimateFrameResize(runtime))
        runtime.state += 1;
      break;
    case 3:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        CreateSelectGroupHelpSprite(runtime);
        runtime.state += 1;
      }
      break;
    case 4:
      if (!AnimateSeletGroupModeAndHelpSpriteEnter(runtime)) {
        CreateRedRectangularCursorSpritePair(runtime);
        UpdateVerticalScrollArrowSpriteXPos(runtime, 0);
        UpdateVerticalScrollArrowVisibility(runtime);
        runtime.state += 1;
        return false;
      }
      break;
    default:
      return false;
  }
  return true;
};

export const ECInterfaceCmd_10 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      DestroyRedRectangularCursor(runtime);
      StartModeIconHidingAnimation(runtime);
      HideVerticalScrollArrowSprites(runtime);
      runtime.state += 1;
      break;
    case 1:
      if (RunModeIconHidingAnimation(runtime))
        break;
      StartWin2FrameAnim(runtime, 1);
      runtime.state += 1;
    // fall through
    case 2:
      if (!AnimateFrameResize(runtime))
        runtime.state += 1;
      break;
    case 3:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        UnfreezeSelectDestFieldCursorSprite(runtime);
        ShowBg(runtime, 0);
        runtime.state += 1;
      }
      break;
    case 4:
      return false;
  }
  return true;
};

export const ECInterfaceCmd_22 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      DestroyRedRectangularCursor(runtime);
      HideVerticalScrollArrowSprites(runtime);
      ShrinkModeIconsSprite(runtime);
      StartWin2FrameAnim(runtime, 5);
      runtime.state += 1;
      break;
    case 1:
      if (!AnimateFrameResize(runtime) && !ModeIconsSpriteAnimIsEnded(runtime)) {
        PrintECGroupOrAlphaMenu(runtime);
        runtime.state += 1;
      }
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        StartWin2FrameAnim(runtime, 6);
        ShowModeIconsSprite(runtime);
        runtime.state += 1;
      }
      break;
    case 3:
      if (!AnimateFrameResize(runtime) && !ModeIconsSpriteAnimIsEnded(runtime)) {
        UpdateVerticalScrollArrowVisibility(runtime);
        CreateRedRectangularCursorSpritePair(runtime);
        runtime.state += 1;
        return false;
      }
      break;
    case 4:
      return false;
  }
  return true;
};

export const ECInterfaceCmd_14 = (runtime: EasyChat3Runtime): boolean => {
  EC_MoveCursor(runtime);
  return false;
};

export const ECInterfaceCmd_15 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      ScheduleBg2VerticalScroll(runtime, 1, 2);
      runtime.state += 1;
    // fall through
    case 1:
      if (!AnimateBg2VerticalScroll(runtime)) {
        EC_MoveCursor(runtime);
        UpdateVerticalScrollArrowVisibility(runtime);
        return false;
      }
      break;
  }
  return true;
};

export const ECInterfaceCmd_16 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      ScheduleBg2VerticalScroll(runtime, -1, 2);
      runtime.state += 1;
    // fall through
    case 1:
      if (!AnimateBg2VerticalScroll(runtime)) {
        UpdateVerticalScrollArrowVisibility(runtime);
        runtime.state += 1;
        return false;
      }
      break;
    case 2:
      return false;
  }
  return true;
};

export const ECInterfaceCmd_11 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      DestroyRedRectangularCursor(runtime);
      StartModeIconHidingAnimation(runtime);
      HideVerticalScrollArrowSprites(runtime);
      runtime.state += 1;
      break;
    case 1:
      if (!RunModeIconHidingAnimation(runtime)) {
        ClearWin2AndCopyToVram(runtime);
        runtime.state += 1;
      }
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        StartWin2FrameAnim(runtime, 2);
        runtime.state += 1;
      }
      break;
    case 3:
      if (!AnimateFrameResize(runtime)) {
        PrintECMenuById(runtime, 2);
        runtime.state += 1;
      }
      break;
    case 4:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        CreateSelectWordCursorSprite(runtime);
        UpdateVerticalScrollArrowSpriteXPos(runtime, 1);
        UpdateVerticalScrollArrowVisibility(runtime);
        UpdateStartSelectButtonSpriteVisibility(runtime);
        runtime.state += 1;
        return false;
      }
      break;
    case 5:
      return false;
  }
  return true;
};

export const ECInterfaceCmd_12 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      PrintECFields(runtime);
      runtime.state += 1;
      break;
    case 1:
      DestroySelectWordCursorSprite(runtime);
      HideVerticalScrollArrowSprites(runtime);
      HideStartSelectButtonSprites(runtime);
      ClearWin2AndCopyToVram(runtime);
      runtime.state += 1;
      break;
    case 2:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        StartWin2FrameAnim(runtime, 3);
        runtime.state += 1;
      }
      break;
    case 3:
      if (!AnimateFrameResize(runtime)) {
        ShowBg(runtime, 0);
        runtime.state += 1;
      }
      break;
    case 4:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        UnfreezeSelectDestFieldCursorSprite(runtime);
        runtime.state += 1;
        return false;
      }
      break;
    case 5:
      return false;
  }
  return true;
};

export const ECInterfaceCmd_13 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      DestroySelectWordCursorSprite(runtime);
      HideVerticalScrollArrowSprites(runtime);
      HideStartSelectButtonSprites(runtime);
      ClearWin2AndCopyToVram(runtime);
      runtime.state += 1;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        StartWin2FrameAnim(runtime, 4);
        runtime.state += 1;
      }
      break;
    case 2:
      if (!AnimateFrameResize(runtime)) {
        PrintECGroupOrAlphaMenu(runtime);
        runtime.state += 1;
      }
      break;
    case 3:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        CreateSelectGroupHelpSprite(runtime);
        runtime.state += 1;
      }
      break;
    case 4:
      if (!AnimateSeletGroupModeAndHelpSpriteEnter(runtime)) {
        CreateRedRectangularCursorSpritePair(runtime);
        UpdateVerticalScrollArrowSpriteXPos(runtime, 0);
        UpdateVerticalScrollArrowVisibility(runtime);
        runtime.state += 1;
        return false;
      }
      break;
  }
  return true;
};

export const ECInterfaceCmd_17 = (runtime: EasyChat3Runtime): boolean => {
  SetSelectWordCursorSpritePos(runtime);
  return false;
};

export const ECInterfaceCmd_19 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      UpdateWin2PrintWordsScrollDown(runtime);
      runtime.state += 1;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        ScheduleBg2VerticalScroll(runtime, 1, 2);
        runtime.state += 1;
      }
      break;
    case 2:
      if (!AnimateBg2VerticalScroll(runtime)) {
        SetSelectWordCursorSpritePos(runtime);
        UpdateVerticalScrollArrowVisibility(runtime);
        UpdateStartSelectButtonSpriteVisibility(runtime);
        runtime.state += 1;
        return false;
      }
      break;
    case 3:
      return false;
  }
  return true;
};

export const ECInterfaceCmd_18 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      UpdateWin2PrintWordsScrollUp(runtime);
      runtime.state += 1;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        ScheduleBg2VerticalScroll(runtime, -1, 2);
        runtime.state += 1;
      }
      break;
    case 2:
      if (!AnimateBg2VerticalScroll(runtime)) {
        UpdateVerticalScrollArrowVisibility(runtime);
        UpdateStartSelectButtonSpriteVisibility(runtime);
        runtime.state += 1;
        return false;
      }
      break;
    case 3:
      return false;
  }
  return true;
};

export const ECInterfaceCmd_21 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      UpdateWin2PrintWordsScrollPageDown(runtime);
      runtime.state += 1;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        const direction = GetECSelectWordRowsAbove(runtime) - GetBg2ScrollRow(runtime);
        ScheduleBg2VerticalScroll(runtime, direction, 4);
        runtime.state += 1;
      }
      break;
    case 2:
      if (!AnimateBg2VerticalScroll(runtime)) {
        SetSelectWordCursorSpritePos(runtime);
        UpdateVerticalScrollArrowVisibility(runtime);
        UpdateStartSelectButtonSpriteVisibility(runtime);
        runtime.state += 1;
        return false;
      }
      break;
    case 3:
      return false;
  }
  return true;
};

export const ECInterfaceCmd_20 = (runtime: EasyChat3Runtime): boolean => {
  switch (runtime.state) {
    case 0:
      UpdateWin2PrintWordsScrollPageUp(runtime);
      runtime.state += 1;
      break;
    case 1:
      if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
        const direction = GetECSelectWordRowsAbove(runtime) - GetBg2ScrollRow(runtime);
        ScheduleBg2VerticalScroll(runtime, direction, 4);
        runtime.state += 1;
      }
      break;
    case 2:
      if (!AnimateBg2VerticalScroll(runtime)) {
        UpdateVerticalScrollArrowVisibility(runtime);
        UpdateStartSelectButtonSpriteVisibility(runtime);
        runtime.state += 1;
        return false;
      }
      break;
    case 3:
      return false;
  }
  return true;
};
