export const MENU_NOTHING_CHOSEN = -2;
export const MENU_B_PRESSED = -1;
export const MENU_L_PRESSED = 1;
export const MENU_R_PRESSED = 2;
export const COPYWIN_GFX = 2;
export const COPYWIN_FULL = 3;
export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const DPAD_RIGHT = 1 << 4;
export const DPAD_LEFT = 1 << 5;
export const DPAD_UP = 1 << 6;
export const DPAD_DOWN = 1 << 7;
export const DPAD_ANY = DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT;
export const SE_SELECT = 'SE_SELECT';
export const FONTATTR_MAX_LETTER_WIDTH = 0;
export const FONTATTR_MAX_LETTER_HEIGHT = 1;
export const FONTATTR_LETTER_SPACING = 2;
export const FONTATTR_LINE_SPACING = 3;
export const FONTATTR_COLOR_FOREGROUND = 4;
export const FONTATTR_COLOR_BACKGROUND = 5;
export const FONTATTR_COLOR_SHADOW = 6;
export const FONTATTR_UNKNOWN = 7;
export const FONT_SMALL = 0;
export const FONT_NORMAL = 2;
export const FONT_NORMAL_COPY_1 = 3;

export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface MenuAction {
  text: string;
}

export interface MenuState {
  left: number;
  top: number;
  cursorPos: number;
  minCursorPos: number;
  maxCursorPos: number;
  windowId: number;
  fontId: number;
  optionWidth: number;
  optionHeight: number;
  columns: number;
  rows: number;
  APressMuted: boolean;
}

export interface TextPrinterTemplate {
  currentChar: string;
  windowId: number;
  fontId: number;
  x: number;
  y: number;
  currentX: number;
  currentY: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
  unk: number;
  letterSpacing: number;
  lineSpacing: number;
}

export interface MenuRuntime {
  sMenu: MenuState;
  sTileNum: number;
  sPaletteNum: number;
  sYesNoWindowId: number;
  sTopBarWindowId: number;
  windows: Map<number, WindowTemplate>;
  nextWindowId: number;
  newKeys: number;
  repeatedKeys: number;
  lrKeysPressed: number;
  lrKeysPressedAndHeld: number;
  fontAttributes: Map<string, number>;
  windowPaletteNums: Map<number, number>;
  operations: string[];
}

export const createMenuRuntime = (): MenuRuntime => ({
  sMenu: {
    left: 0,
    top: 0,
    cursorPos: 0,
    minCursorPos: 0,
    maxCursorPos: 0,
    windowId: 0,
    fontId: FONT_NORMAL,
    optionWidth: 0,
    optionHeight: 0,
    columns: 0,
    rows: 0,
    APressMuted: false
  },
  sTileNum: 0,
  sPaletteNum: 0,
  sYesNoWindowId: 0,
  sTopBarWindowId: 0,
  windows: new Map(),
  nextWindowId: 0,
  newKeys: 0,
  repeatedKeys: 0,
  lrKeysPressed: 0,
  lrKeysPressedAndHeld: 0,
  fontAttributes: new Map([
    [`${FONT_SMALL}:${FONTATTR_MAX_LETTER_WIDTH}`, 5],
    [`${FONT_SMALL}:${FONTATTR_MAX_LETTER_HEIGHT}`, 7],
    [`${FONT_SMALL}:${FONTATTR_LETTER_SPACING}`, 0],
    [`${FONT_SMALL}:${FONTATTR_LINE_SPACING}`, 1],
    [`${FONT_NORMAL}:${FONTATTR_MAX_LETTER_WIDTH}`, 8],
    [`${FONT_NORMAL}:${FONTATTR_MAX_LETTER_HEIGHT}`, 12],
    [`${FONT_NORMAL}:${FONTATTR_LETTER_SPACING}`, 0],
    [`${FONT_NORMAL}:${FONTATTR_LINE_SPACING}`, 4],
    [`${FONT_NORMAL_COPY_1}:${FONTATTR_MAX_LETTER_WIDTH}`, 8],
    [`${FONT_NORMAL_COPY_1}:${FONTATTR_MAX_LETTER_HEIGHT}`, 12],
    [`${FONT_NORMAL_COPY_1}:${FONTATTR_LETTER_SPACING}`, 0],
    [`${FONT_NORMAL_COPY_1}:${FONTATTR_LINE_SPACING}`, 4]
  ]),
  windowPaletteNums: new Map(),
  operations: []
});

const sTopBarWindowTextColors = [15, 1, 2] as const;
const record = (runtime: MenuRuntime, op: string): void => {
  runtime.operations.push(op);
};
const s8 = (value: number): number => {
  const byte = value & 0xff;
  return byte & 0x80 ? byte - 0x100 : byte;
};
const bgTileVFlip = (tile: number): number => tile | 0x800;
const joyNew = (runtime: MenuRuntime, mask: number): boolean => (runtime.newKeys & mask) !== 0;
const joyReptEq = (runtime: MenuRuntime, key: number): boolean => (runtime.repeatedKeys & DPAD_ANY) === key;
const stringWidth = (runtime: MenuRuntime, fontId: number, text: string): number =>
  text.length * GetFontAttribute(runtime, fontId, FONTATTR_MAX_LETTER_WIDTH);

export const SetWindowTemplateFields = (
  bg: number,
  left: number,
  top: number,
  width: number,
  height: number,
  paletteNum: number,
  baseBlock: number
): WindowTemplate => ({ bg, tilemapLeft: left, tilemapTop: top, width, height, paletteNum, baseBlock });

export const AddWindow = (runtime: MenuRuntime, template: WindowTemplate): number => {
  const id = runtime.nextWindowId++;
  runtime.windows.set(id, { ...template });
  runtime.windowPaletteNums.set(id, template.paletteNum);
  record(runtime, `AddWindow:${id}:${template.bg}:${template.tilemapLeft}:${template.tilemapTop}:${template.width}:${template.height}:${template.paletteNum}:${template.baseBlock}`);
  return id;
};

export const RemoveWindow = (runtime: MenuRuntime, windowId: number): void => {
  runtime.windows.delete(windowId);
  record(runtime, `RemoveWindow:${windowId}`);
};

export const GetWindowAttribute = (runtime: MenuRuntime, windowId: number, attr: string): number =>
  attr === 'WINDOW_PALETTE_NUM' ? runtime.windowPaletteNums.get(windowId) ?? 0 : 0;

export const GetFontAttribute = (runtime: MenuRuntime, fontId: number, attr: number): number =>
  runtime.fontAttributes.get(`${fontId}:${attr}`) ?? 0;

export const GetMenuCursorDimensionByFont = (runtime: MenuRuntime, fontId: number, which: 0 | 1): number =>
  GetFontAttribute(runtime, fontId, which === 0 ? FONTATTR_MAX_LETTER_WIDTH : FONTATTR_MAX_LETTER_HEIGHT);

const CallWindowFunction = (
  runtime: MenuRuntime,
  windowId: number,
  fn: (runtime: MenuRuntime, bg: number, left: number, top: number, width: number, height: number, palette: number) => void
): void => {
  const win = runtime.windows.get(windowId) ?? SetWindowTemplateFields(0, 0, 0, 0, 0, 0, 0);
  fn(runtime, win.bg, win.tilemapLeft, win.tilemapTop, win.width, win.height, win.paletteNum);
};

const FillBgTilemapBufferRect = (runtime: MenuRuntime, bg: number, tile: number, left: number, top: number, width: number, height: number, palette: number): void =>
  record(runtime, `FillBgTilemapBufferRect:${bg}:${tile}:${left}:${top}:${width}:${height}:${palette}`);
const FillWindowPixelBuffer = (runtime: MenuRuntime, windowId: number, fill: number): void => record(runtime, `FillWindowPixelBuffer:${windowId}:${fill}`);
const PutWindowTilemap = (runtime: MenuRuntime, windowId: number): void => record(runtime, `PutWindowTilemap:${windowId}`);
const ClearWindowTilemap = (runtime: MenuRuntime, windowId: number): void => record(runtime, `ClearWindowTilemap:${windowId}`);
const CopyWindowToVram = (runtime: MenuRuntime, windowId: number, mode: number): void => record(runtime, `CopyWindowToVram:${windowId}:${mode}`);
const FillWindowPixelRect = (runtime: MenuRuntime, windowId: number, fill: number, x: number, y: number, width: number, height: number): void =>
  record(runtime, `FillWindowPixelRect:${windowId}:${fill}:${x}:${y}:${width}:${height}`);
const AddTextPrinterParameterized = (runtime: MenuRuntime, windowId: number, fontId: number, text: string, x: number, y: number, speed: number, callback: unknown): void =>
  record(runtime, `AddTextPrinterParameterized:${windowId}:${fontId}:${text}:${x}:${y}:${speed}:${callback === null ? 'NULL' : callback ?? 0}`);
const AddTextPrinterParameterized3 = (runtime: MenuRuntime, windowId: number, fontId: number, x: number, y: number, color: readonly number[], speed: number, text: string): void =>
  record(runtime, `AddTextPrinterParameterized3:${windowId}:${fontId}:${x}:${y}:${color.join(',')}:${speed}:${text}`);
const AddTextPrinterParameterized4 = (runtime: MenuRuntime, windowId: number, fontId: number, x: number, y: number, letterSpacing: number, lineSpacing: number, color: readonly number[], speed: number, text: string): void =>
  record(runtime, `AddTextPrinterParameterized4:${windowId}:${fontId}:${x}:${y}:${letterSpacing}:${lineSpacing}:${color.join(',')}:${speed}:${text}`);
const AddTextPrinterParameterized5 = (runtime: MenuRuntime, windowId: number, fontId: number, text: string, x: number, y: number, speed: number, callback: unknown, letterSpacing: number, lineSpacing: number): void =>
  record(runtime, `AddTextPrinterParameterized5:${windowId}:${fontId}:${text}:${x}:${y}:${speed}:${callback === null ? 'NULL' : callback ?? 0}:${letterSpacing}:${lineSpacing}`);
const AddTextPrinter = (runtime: MenuRuntime, printer: TextPrinterTemplate, speed: number, callback: unknown): void =>
  record(runtime, `AddTextPrinter:${printer.windowId}:${printer.fontId}:${printer.currentChar}:${printer.x}:${printer.y}:${printer.fgColor}:${printer.bgColor}:${printer.shadowColor}:${printer.unk}:${printer.letterSpacing}:${printer.lineSpacing}:${speed}:${callback === null ? 'NULL' : callback ?? 0}`);
const PlaySE = (runtime: MenuRuntime, se: string): void => record(runtime, `PlaySE:${se}`);

export const DrawDialogFrameWithCustomTileAndPalette = (runtime: MenuRuntime, windowId: number, copyToVram: boolean, tileNum: number, paletteNum: number): void => {
  runtime.sTileNum = tileNum;
  runtime.sPaletteNum = paletteNum;
  CallWindowFunction(runtime, windowId, WindowFunc_DrawDialogFrameWithCustomTileAndPalette);
  FillWindowPixelBuffer(runtime, windowId, 1);
  PutWindowTilemap(runtime, windowId);
  if (copyToVram === true) CopyWindowToVram(runtime, windowId, COPYWIN_FULL);
};

export const DrawDialogFrameWithCustomTile = (
  runtime: MenuRuntime,
  windowId: number,
  copyToVram: boolean,
  tileNum: number
): void => {
  runtime.sTileNum = tileNum;
  runtime.sPaletteNum = GetWindowAttribute(runtime, windowId, 'WINDOW_PALETTE_NUM');
  CallWindowFunction(runtime, windowId, WindowFunc_DrawDialogFrameWithCustomTileAndPalette);
  FillWindowPixelBuffer(runtime, windowId, 1);
  PutWindowTilemap(runtime, windowId);
  if (copyToVram === true) CopyWindowToVram(runtime, windowId, COPYWIN_FULL);
};

export const WindowFunc_DrawDialogFrameWithCustomTileAndPalette = (runtime: MenuRuntime, bg: number, tilemapLeft: number, tilemapTop: number, width: number, _height: number, _paletteNum: number): void => {
  const t = runtime.sTileNum;
  const p = runtime.sPaletteNum;
  [
    [t, tilemapLeft - 2, tilemapTop - 1, 1, 1],
    [t + 1, tilemapLeft - 1, tilemapTop - 1, 1, 1],
    [t + 2, tilemapLeft, tilemapTop - 1, width, 1],
    [t + 3, tilemapLeft + width, tilemapTop - 1, 1, 1],
    [t + 4, tilemapLeft + width + 1, tilemapTop - 1, 1, 1],
    [t + 5, tilemapLeft - 2, tilemapTop, 1, 1],
    [t + 6, tilemapLeft - 1, tilemapTop, 1, 1],
    [t + 8, tilemapLeft + width, tilemapTop, 1, 1],
    [t + 9, tilemapLeft + width + 1, tilemapTop, 1, 1],
    [t + 10, tilemapLeft - 2, tilemapTop + 1, 1, 1],
    [t + 11, tilemapLeft - 1, tilemapTop + 1, 1, 1],
    [t + 12, tilemapLeft + width, tilemapTop + 1, 1, 1],
    [t + 13, tilemapLeft + width + 1, tilemapTop + 1, 1, 1],
    [bgTileVFlip(t + 10), tilemapLeft - 2, tilemapTop + 2, 1, 1],
    [bgTileVFlip(t + 11), tilemapLeft - 1, tilemapTop + 2, 1, 1],
    [bgTileVFlip(t + 12), tilemapLeft + width, tilemapTop + 2, 1, 1],
    [bgTileVFlip(t + 13), tilemapLeft + width + 1, tilemapTop + 2, 1, 1],
    [bgTileVFlip(t + 5), tilemapLeft - 2, tilemapTop + 3, 1, 1],
    [bgTileVFlip(t + 6), tilemapLeft - 1, tilemapTop + 3, 1, 1],
    [bgTileVFlip(t + 8), tilemapLeft + width, tilemapTop + 3, 1, 1],
    [bgTileVFlip(t + 9), tilemapLeft + width + 1, tilemapTop + 3, 1, 1],
    [bgTileVFlip(t), tilemapLeft - 2, tilemapTop + 4, 1, 1],
    [bgTileVFlip(t + 1), tilemapLeft - 1, tilemapTop + 4, 1, 1],
    [bgTileVFlip(t + 2), tilemapLeft, tilemapTop + 4, width, 1],
    [bgTileVFlip(t + 3), tilemapLeft + width, tilemapTop + 4, 1, 1],
    [bgTileVFlip(t + 4), tilemapLeft + width + 1, tilemapTop + 4, 1, 1]
  ].forEach(([tile, left, top, w, h]) => FillBgTilemapBufferRect(runtime, bg, tile, left, top, w, h, p));
};

export const ClearDialogWindowAndFrameToTransparent = (runtime: MenuRuntime, windowId: number, copyToVram: boolean): void => {
  CallWindowFunction(runtime, windowId, WindowFunc_ClearDialogWindowAndFrameNullPalette);
  FillWindowPixelBuffer(runtime, windowId, 0);
  ClearWindowTilemap(runtime, windowId);
  if (copyToVram === true) CopyWindowToVram(runtime, windowId, COPYWIN_FULL);
};

export const WindowFunc_ClearDialogWindowAndFrameNullPalette = (runtime: MenuRuntime, bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, _paletteNum: number): void => {
  FillBgTilemapBufferRect(runtime, bg, 0, tilemapLeft - 2, tilemapTop - 1, width + 4, height + 2, 0);
};

export const DrawStdFrameWithCustomTileAndPalette = (runtime: MenuRuntime, windowId: number, copyToVram: boolean, baseTileNum: number, paletteNum: number): void => {
  runtime.sTileNum = baseTileNum;
  runtime.sPaletteNum = paletteNum;
  CallWindowFunction(runtime, windowId, WindowFunc_DrawStdFrameWithCustomTileAndPalette);
  FillWindowPixelBuffer(runtime, windowId, 1);
  PutWindowTilemap(runtime, windowId);
  if (copyToVram === true) CopyWindowToVram(runtime, windowId, COPYWIN_FULL);
};

export const DrawStdFrameWithCustomTile = (
  runtime: MenuRuntime,
  windowId: number,
  copyToVram: boolean,
  baseTileNum: number
): void => {
  runtime.sTileNum = baseTileNum;
  runtime.sPaletteNum = GetWindowAttribute(runtime, windowId, 'WINDOW_PALETTE_NUM');
  CallWindowFunction(runtime, windowId, WindowFunc_DrawStdFrameWithCustomTileAndPalette);
  FillWindowPixelBuffer(runtime, windowId, 1);
  PutWindowTilemap(runtime, windowId);
  if (copyToVram === true) CopyWindowToVram(runtime, windowId, COPYWIN_FULL);
};

export const WindowFunc_DrawStdFrameWithCustomTileAndPalette = (runtime: MenuRuntime, bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, _paletteNum: number): void => {
  const t = runtime.sTileNum;
  const p = runtime.sPaletteNum;
  [
    [t, tilemapLeft - 1, tilemapTop - 1, 1, 1],
    [t + 1, tilemapLeft, tilemapTop - 1, width, 1],
    [t + 2, tilemapLeft + width, tilemapTop - 1, 1, 1],
    [t + 3, tilemapLeft - 1, tilemapTop, 1, height],
    [t + 5, tilemapLeft + width, tilemapTop, 1, height],
    [t + 6, tilemapLeft - 1, tilemapTop + height, 1, 1],
    [t + 7, tilemapLeft, tilemapTop + height, width, 1],
    [t + 8, tilemapLeft + width, tilemapTop + height, 1, 1]
  ].forEach(([tile, left, top, w, h]) => FillBgTilemapBufferRect(runtime, bg, tile, left, top, w, h, p));
};

export const ClearStdWindowAndFrameToTransparent = (runtime: MenuRuntime, windowId: number, copyToVram: boolean): void => {
  CallWindowFunction(runtime, windowId, WindowFunc_ClearStdWindowAndFrameToTransparent);
  FillWindowPixelBuffer(runtime, windowId, 0);
  ClearWindowTilemap(runtime, windowId);
  if (copyToVram === true) CopyWindowToVram(runtime, windowId, COPYWIN_FULL);
};

export const WindowFunc_ClearStdWindowAndFrameToTransparent = (runtime: MenuRuntime, bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, _paletteNum: number): void => {
  FillBgTilemapBufferRect(runtime, bg, 0, tilemapLeft - 1, tilemapTop - 1, width + 2, height + 2, 0);
};

export const CreateTopBarWindowLoadPalette = (runtime: MenuRuntime, bg: number, width: number, yPos: number, palette: number, baseTile: number): number => {
  const window = SetWindowTemplateFields(bg > 3 ? 0 : bg, 0x1e - width, yPos, width, 2, palette, baseTile);
  runtime.sTopBarWindowId = AddWindow(runtime, window);
  const palSlot = palette > 15 ? 15 : palette;
  record(runtime, `LoadPalette:GetTextWindowPalette(2):${palSlot}`);
  return runtime.sTopBarWindowId;
};

export const TopBarWindowPrintString = (runtime: MenuRuntime, string: string, _unused: number, copyToVram: boolean): void => {
  if (runtime.sTopBarWindowId !== 0xff) {
    PutWindowTilemap(runtime, runtime.sTopBarWindowId);
    FillWindowPixelBuffer(runtime, runtime.sTopBarWindowId, 15);
    const width = stringWidth(runtime, FONT_SMALL, string);
    AddTextPrinterParameterized3(runtime, runtime.sTopBarWindowId, FONT_SMALL, -20 - width, 1, sTopBarWindowTextColors, 0, string);
    if (copyToVram) CopyWindowToVram(runtime, runtime.sTopBarWindowId, COPYWIN_FULL);
  }
};

export const TopBarWindowPrintTwoStrings = (runtime: MenuRuntime, string: string, string2: string | null, fgColorChooser: boolean, _unused: number, copyToVram: boolean): void => {
  if (runtime.sTopBarWindowId !== 0xff) {
    const color = fgColorChooser ? [0, 1, 2] : [15, 1, 2];
    PutWindowTilemap(runtime, runtime.sTopBarWindowId);
    FillWindowPixelBuffer(runtime, runtime.sTopBarWindowId, 15);
    if (string2) {
      const width = stringWidth(runtime, FONT_SMALL, string2);
      AddTextPrinterParameterized3(runtime, runtime.sTopBarWindowId, FONT_SMALL, -20 - width, 1, color, 0, string2);
    }
    AddTextPrinterParameterized4(runtime, runtime.sTopBarWindowId, FONT_NORMAL_COPY_1, 4, 1, 0, 0, color, 0, string);
    if (copyToVram) CopyWindowToVram(runtime, runtime.sTopBarWindowId, COPYWIN_FULL);
  }
};

export const CopyTopBarWindowToVram = (runtime: MenuRuntime): void => {
  if (runtime.sTopBarWindowId !== 0xff) {
    CopyWindowToVram(runtime, runtime.sTopBarWindowId, COPYWIN_FULL);
  }
};

export const ClearTopBarWindow = (runtime: MenuRuntime): void => {
  if (runtime.sTopBarWindowId !== 0xff) {
    FillWindowPixelBuffer(runtime, runtime.sTopBarWindowId, 15);
    CopyWindowToVram(runtime, runtime.sTopBarWindowId, COPYWIN_FULL);
  }
};

export const DestroyTopBarWindow = (runtime: MenuRuntime): void => {
  if (runtime.sTopBarWindowId !== 0xff) {
    FillWindowPixelBuffer(runtime, runtime.sTopBarWindowId, 0);
    ClearWindowTilemap(runtime, runtime.sTopBarWindowId);
    CopyWindowToVram(runtime, runtime.sTopBarWindowId, COPYWIN_FULL);
    RemoveWindow(runtime, runtime.sTopBarWindowId);
    runtime.sTopBarWindowId = 0xff;
  }
};

export const Menu_InitCursorInternal = (runtime: MenuRuntime, windowId: number, fontId: number, left: number, top: number, cursorHeight: number, numChoices: number, initialCursorPos: number, APressMuted: boolean): number => {
  runtime.sMenu.left = left;
  runtime.sMenu.top = top;
  runtime.sMenu.minCursorPos = 0;
  runtime.sMenu.maxCursorPos = numChoices - 1;
  runtime.sMenu.windowId = windowId;
  runtime.sMenu.fontId = fontId;
  runtime.sMenu.optionHeight = cursorHeight;
  runtime.sMenu.APressMuted = APressMuted;
  const pos = initialCursorPos;
  runtime.sMenu.cursorPos = pos < 0 || pos > runtime.sMenu.maxCursorPos ? 0 : pos;
  Menu_MoveCursor(runtime, 0);
  return runtime.sMenu.cursorPos;
};

export const Menu_InitCursor = (runtime: MenuRuntime, windowId: number, fontId: number, left: number, top: number, cursorHeight: number, numChoices: number, initialCursorPos: number): number =>
  Menu_InitCursorInternal(runtime, windowId, fontId, left, top, cursorHeight, numChoices, initialCursorPos, false);

export const InitMenuDefaultCursorHeight = (
  runtime: MenuRuntime,
  windowId: number,
  fontId: number,
  left: number,
  top: number,
  numChoices: number,
  initialCursorPos: number
): number =>
  Menu_InitCursor(
    runtime,
    windowId,
    fontId,
    left,
    top,
    GetMenuCursorDimensionByFont(runtime, fontId, 1),
    numChoices,
    initialCursorPos
  );

export const Menu_RedrawCursor = (runtime: MenuRuntime, oldPos: number, newPos: number): void => {
  const width = GetMenuCursorDimensionByFont(runtime, runtime.sMenu.fontId, 0);
  const height = GetMenuCursorDimensionByFont(runtime, runtime.sMenu.fontId, 1);
  FillWindowPixelRect(runtime, runtime.sMenu.windowId, 1, runtime.sMenu.left, runtime.sMenu.optionHeight * oldPos + runtime.sMenu.top, width, height);
  AddTextPrinterParameterized(runtime, runtime.sMenu.windowId, runtime.sMenu.fontId, '>', runtime.sMenu.left, runtime.sMenu.optionHeight * newPos + runtime.sMenu.top, 0, 0);
};

export const Menu_MoveCursor = (runtime: MenuRuntime, cursorDelta: number): number => {
  const oldPos = runtime.sMenu.cursorPos;
  const newPos = runtime.sMenu.cursorPos + s8(cursorDelta);
  if (newPos < runtime.sMenu.minCursorPos) runtime.sMenu.cursorPos = runtime.sMenu.maxCursorPos;
  else if (newPos > runtime.sMenu.maxCursorPos) runtime.sMenu.cursorPos = runtime.sMenu.minCursorPos;
  else runtime.sMenu.cursorPos += s8(cursorDelta);
  Menu_RedrawCursor(runtime, oldPos, runtime.sMenu.cursorPos);
  return runtime.sMenu.cursorPos;
};

export const Menu_MoveCursorNoWrapAround = (runtime: MenuRuntime, cursorDelta: number): number => {
  const oldPos = runtime.sMenu.cursorPos;
  const newPos = runtime.sMenu.cursorPos + s8(cursorDelta);
  if (newPos < runtime.sMenu.minCursorPos) runtime.sMenu.cursorPos = runtime.sMenu.minCursorPos;
  else if (newPos > runtime.sMenu.maxCursorPos) runtime.sMenu.cursorPos = runtime.sMenu.maxCursorPos;
  else runtime.sMenu.cursorPos += s8(cursorDelta);
  Menu_RedrawCursor(runtime, oldPos, runtime.sMenu.cursorPos);
  return runtime.sMenu.cursorPos;
};

export const Menu_GetCursorPos = (runtime: MenuRuntime): number => runtime.sMenu.cursorPos;

export const Menu_ProcessInput = (runtime: MenuRuntime): number => {
  if (joyNew(runtime, A_BUTTON)) {
    if (!runtime.sMenu.APressMuted) PlaySE(runtime, SE_SELECT);
    return runtime.sMenu.cursorPos;
  }
  if (joyNew(runtime, B_BUTTON)) return MENU_B_PRESSED;
  if (joyNew(runtime, DPAD_UP)) {
    PlaySE(runtime, SE_SELECT);
    Menu_MoveCursor(runtime, -1);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyNew(runtime, DPAD_DOWN)) {
    PlaySE(runtime, SE_SELECT);
    Menu_MoveCursor(runtime, 1);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
};

export const Menu_ProcessInputNoWrapAround = (runtime: MenuRuntime): number => {
  const oldPos = runtime.sMenu.cursorPos;
  if (joyNew(runtime, A_BUTTON)) {
    if (!runtime.sMenu.APressMuted) PlaySE(runtime, SE_SELECT);
    return runtime.sMenu.cursorPos;
  }
  if (joyNew(runtime, B_BUTTON)) return MENU_B_PRESSED;
  if (joyNew(runtime, DPAD_UP)) {
    if (oldPos !== Menu_MoveCursorNoWrapAround(runtime, -1)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyNew(runtime, DPAD_DOWN)) {
    if (oldPos !== Menu_MoveCursorNoWrapAround(runtime, 1)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
};

export const Menu_ProcessInput_other = (runtime: MenuRuntime): number => {
  if (joyNew(runtime, A_BUTTON)) {
    if (!runtime.sMenu.APressMuted) PlaySE(runtime, SE_SELECT);
    return runtime.sMenu.cursorPos;
  }
  if (joyNew(runtime, B_BUTTON)) return MENU_B_PRESSED;
  if (joyReptEq(runtime, DPAD_UP)) {
    PlaySE(runtime, SE_SELECT);
    Menu_MoveCursor(runtime, -1);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyReptEq(runtime, DPAD_DOWN)) {
    PlaySE(runtime, SE_SELECT);
    Menu_MoveCursor(runtime, 1);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
};

export const Menu_ProcessInputNoWrapAround_other = (runtime: MenuRuntime): number => {
  const oldPos = runtime.sMenu.cursorPos;
  if (joyNew(runtime, A_BUTTON)) {
    if (!runtime.sMenu.APressMuted) PlaySE(runtime, SE_SELECT);
    return runtime.sMenu.cursorPos;
  }
  if (joyNew(runtime, B_BUTTON)) return MENU_B_PRESSED;
  if (joyReptEq(runtime, DPAD_UP)) {
    if (oldPos !== Menu_MoveCursorNoWrapAround(runtime, -1)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyReptEq(runtime, DPAD_DOWN)) {
    if (oldPos !== Menu_MoveCursorNoWrapAround(runtime, 1)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
};

export const PrintTextArray = (runtime: MenuRuntime, windowId: number, fontId: number, left: number, top: number, lineHeight: number, itemCount: number, strs: MenuAction[]): void => {
  for (let i = 0; i < itemCount; i += 1) AddTextPrinterParameterized(runtime, windowId, fontId, strs[i].text, left, (lineHeight * i) + top, 0xff, null);
  CopyWindowToVram(runtime, windowId, COPYWIN_GFX);
};

export const MultichoiceList_PrintItems = (runtime: MenuRuntime, windowId: number, fontId: number, left: number, top: number, lineHeight: number, itemCount: number, strs: MenuAction[], letterSpacing: number, lineSpacing: number): void => {
  for (let i = 0; i < itemCount; i += 1) AddTextPrinterParameterized5(runtime, windowId, fontId, strs[i].text, left, (lineHeight * i) + top, 0xff, null, letterSpacing, lineSpacing);
  CopyWindowToVram(runtime, windowId, COPYWIN_GFX);
};

export const PrintMenuTable = (runtime: MenuRuntime, windowId: number, fontId: number, lineHeight: number, itemCount: number, strs: MenuAction[]): void => {
  const left = GetMenuCursorDimensionByFont(runtime, fontId, 0);
  PrintTextArray(runtime, windowId, fontId, left, 0, lineHeight, itemCount, strs);
};

export const AddItemMenuActionTextPrinters = (runtime: MenuRuntime, windowId: number, fontId: number, left: number, top: number, letterSpacing: number, lineHeight: number, itemCount: number, strs: MenuAction[], orderArray: number[]): void => {
  const printerBase = {
    windowId,
    fontId,
    fgColor: GetFontAttribute(runtime, fontId, FONTATTR_COLOR_FOREGROUND),
    bgColor: GetFontAttribute(runtime, fontId, FONTATTR_COLOR_BACKGROUND),
    shadowColor: GetFontAttribute(runtime, fontId, FONTATTR_COLOR_SHADOW),
    unk: GetFontAttribute(runtime, fontId, FONTATTR_UNKNOWN),
    letterSpacing,
    lineSpacing: GetFontAttribute(runtime, fontId, FONTATTR_LINE_SPACING),
    x: left,
    currentX: left
  };
  for (let i = 0; i < itemCount; i += 1) {
    const y = (lineHeight * i) + top;
    AddTextPrinter(runtime, { ...printerBase, currentChar: strs[orderArray[i]].text, y, currentY: y }, 0xff, null);
  }
  CopyWindowToVram(runtime, windowId, COPYWIN_GFX);
};

export const PrintMenuActionTextsAtTopById = (
  runtime: MenuRuntime,
  windowId: number,
  fontId: number,
  lineHeight: number,
  itemCount: number,
  strs: MenuAction[],
  orderArray: number[]
): void => {
  AddItemMenuActionTextPrinters(
    runtime,
    windowId,
    fontId,
    GetFontAttribute(runtime, fontId, FONTATTR_MAX_LETTER_WIDTH),
    0,
    GetFontAttribute(runtime, fontId, FONTATTR_LETTER_SPACING),
    lineHeight,
    itemCount,
    strs,
    orderArray
  );
};

export const CreateWindowTemplate = (
  runtime: MenuRuntime,
  bg: number,
  left: number,
  top: number,
  width: number,
  height: number,
  paletteNum: number,
  baseBlock: number
): number => AddWindow(runtime, SetWindowTemplateFields(bg, left, top, width, height, paletteNum, baseBlock));

export const CreateYesNoMenu = (runtime: MenuRuntime, window: WindowTemplate, fontId: number, left: number, top: number, baseTileNum: number, paletteNum: number, initialCursorPos: number): void => {
  runtime.sYesNoWindowId = AddWindow(runtime, window);
  DrawStdFrameWithCustomTileAndPalette(runtime, runtime.sYesNoWindowId, true, baseTileNum, paletteNum);
  const printer: TextPrinterTemplate = {
    currentChar: 'Yes\nNo',
    windowId: runtime.sYesNoWindowId,
    fontId,
    x: GetMenuCursorDimensionByFont(runtime, fontId, 0) + left,
    y: top,
    currentX: GetMenuCursorDimensionByFont(runtime, fontId, 0) + left,
    currentY: top,
    fgColor: GetFontAttribute(runtime, fontId, FONTATTR_COLOR_FOREGROUND),
    bgColor: GetFontAttribute(runtime, fontId, FONTATTR_COLOR_BACKGROUND),
    shadowColor: GetFontAttribute(runtime, fontId, FONTATTR_COLOR_SHADOW),
    unk: GetFontAttribute(runtime, fontId, FONTATTR_UNKNOWN),
    letterSpacing: GetFontAttribute(runtime, fontId, FONTATTR_LETTER_SPACING),
    lineSpacing: GetFontAttribute(runtime, fontId, FONTATTR_LINE_SPACING)
  };
  AddTextPrinter(runtime, printer, 0xff, null);
  Menu_InitCursor(runtime, runtime.sYesNoWindowId, fontId, left, top, GetFontAttribute(runtime, fontId, FONTATTR_MAX_LETTER_HEIGHT) + printer.lineSpacing, 2, initialCursorPos);
};

export const CreateYesNoMenu2 = (
  runtime: MenuRuntime,
  window: WindowTemplate,
  fontId: number,
  baseTileNum: number,
  initialCursorPos: number
): void => {
  CreateYesNoMenu(runtime, window, fontId, 0, 0, baseTileNum, initialCursorPos, 0);
};

export const DestroyYesNoMenu = (runtime: MenuRuntime): void => {
  ClearStdWindowAndFrameToTransparent(runtime, runtime.sYesNoWindowId, true);
  RemoveWindow(runtime, runtime.sYesNoWindowId);
  runtime.sYesNoWindowId = 0xff;
};

export const Menu_ProcessInputNoWrapClearOnChoose = (runtime: MenuRuntime): number => {
  const result = Menu_ProcessInputNoWrapAround(runtime);
  if (result !== MENU_NOTHING_CHOSEN) DestroyYesNoMenu(runtime);
  return result;
};

export const MultichoiceGrid_PrintItems = (runtime: MenuRuntime, windowId: number, fontId: number, itemWidth: number, itemHeight: number, cols: number, rows: number, strs: MenuAction[]): void => {
  const width = GetFontAttribute(runtime, fontId, FONTATTR_MAX_LETTER_WIDTH);
  const yOffset = Math.trunc((16 - GetFontAttribute(runtime, fontId, FONTATTR_MAX_LETTER_HEIGHT)) / 2);
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      AddTextPrinterParameterized(runtime, windowId, fontId, strs[i * cols + j].text, itemWidth * j + width, yOffset + itemHeight * i, 0xff, 0);
    }
  }
  CopyWindowToVram(runtime, windowId, COPYWIN_GFX);
};

export const MultichoiceGrid_PrintItemsCustomOrder = (
  runtime: MenuRuntime,
  windowId: number,
  fontId: number,
  itemWidth: number,
  itemHeight: number,
  cols: number,
  rows: number,
  strs: MenuAction[],
  orderArray: number[]
): void => {
  const width = GetFontAttribute(runtime, fontId, FONTATTR_MAX_LETTER_WIDTH);
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      AddTextPrinterParameterized(
        runtime,
        windowId,
        fontId,
        strs[orderArray[i * cols + j]].text,
        itemWidth * j + width,
        itemHeight * i,
        0xff,
        0
      );
    }
  }
  CopyWindowToVram(runtime, windowId, COPYWIN_GFX);
};

export const MultichoiceGrid_InitCursor = (runtime: MenuRuntime, windowId: number, fontId: number, left: number, top: number, optionWidth: number, cols: number, rows: number, cursorPos: number): number => {
  const cursorHeight = 16;
  const numChoices = cols * rows;
  return MultichoiceGrid_InitCursorInternal(runtime, windowId, fontId, left, top, optionWidth, cursorHeight, cols, rows, numChoices, cursorPos);
};

export const MultichoiceGrid_InitCursorInternal = (runtime: MenuRuntime, windowId: number, fontId: number, left: number, top: number, optionWidth: number, cursorHeight: number, cols: number, rows: number, numChoices: number, cursorPos: number): number => {
  runtime.sMenu.left = left;
  runtime.sMenu.top = top;
  runtime.sMenu.minCursorPos = 0;
  runtime.sMenu.maxCursorPos = numChoices - 1;
  runtime.sMenu.windowId = windowId;
  runtime.sMenu.fontId = fontId;
  runtime.sMenu.optionWidth = optionWidth;
  runtime.sMenu.optionHeight = cursorHeight;
  runtime.sMenu.columns = cols;
  runtime.sMenu.rows = rows;
  runtime.sMenu.cursorPos = cursorPos < 0 || cursorPos > runtime.sMenu.maxCursorPos ? 0 : cursorPos;
  MultichoiceGrid_MoveCursor(runtime, 0, 0);
  return runtime.sMenu.cursorPos;
};

export const MultichoiceGrid_RedrawCursor = (runtime: MenuRuntime, oldCursorPos: number, newCursorPos: number): void => {
  const cursorWidth = GetMenuCursorDimensionByFont(runtime, runtime.sMenu.fontId, 0);
  const cursorHeight = GetMenuCursorDimensionByFont(runtime, runtime.sMenu.fontId, 1);
  let xPos = (oldCursorPos % runtime.sMenu.columns) * runtime.sMenu.optionWidth + runtime.sMenu.left;
  let yPos = Math.trunc(oldCursorPos / runtime.sMenu.columns) * runtime.sMenu.optionHeight + runtime.sMenu.top;
  FillWindowPixelRect(runtime, runtime.sMenu.windowId, 1, xPos, yPos, cursorWidth, cursorHeight);
  xPos = (newCursorPos % runtime.sMenu.columns) * runtime.sMenu.optionWidth + runtime.sMenu.left;
  yPos = Math.trunc(newCursorPos / runtime.sMenu.columns) * runtime.sMenu.optionHeight + runtime.sMenu.top;
  AddTextPrinterParameterized(runtime, runtime.sMenu.windowId, runtime.sMenu.fontId, '>', xPos, yPos, 0, 0);
};

export const MultichoiceGrid_MoveCursor = (runtime: MenuRuntime, deltaX: number, deltaY: number): number => {
  const oldPos = runtime.sMenu.cursorPos;
  if (deltaX) {
    if ((runtime.sMenu.cursorPos % runtime.sMenu.columns) + s8(deltaX) < 0) runtime.sMenu.cursorPos += runtime.sMenu.columns - 1;
    else if ((runtime.sMenu.cursorPos % runtime.sMenu.columns) + s8(deltaX) >= runtime.sMenu.columns) runtime.sMenu.cursorPos = Math.trunc(runtime.sMenu.cursorPos / runtime.sMenu.columns) * runtime.sMenu.columns;
    else runtime.sMenu.cursorPos += s8(deltaX);
  }
  if (deltaY) {
    if (Math.trunc(runtime.sMenu.cursorPos / runtime.sMenu.columns) + s8(deltaY) < 0) runtime.sMenu.cursorPos += runtime.sMenu.columns * (runtime.sMenu.rows - 1);
    else if (Math.trunc(runtime.sMenu.cursorPos / runtime.sMenu.columns) + s8(deltaY) >= runtime.sMenu.rows) runtime.sMenu.cursorPos -= runtime.sMenu.columns * (runtime.sMenu.rows - 1);
    else runtime.sMenu.cursorPos += runtime.sMenu.columns * s8(deltaY);
  }
  if (runtime.sMenu.cursorPos > runtime.sMenu.maxCursorPos) {
    runtime.sMenu.cursorPos = oldPos;
    return runtime.sMenu.cursorPos;
  }
  MultichoiceGrid_RedrawCursor(runtime, oldPos, runtime.sMenu.cursorPos);
  return runtime.sMenu.cursorPos;
};

export const MultichoiceGrid_MoveCursorIfValid = (runtime: MenuRuntime, deltaX: number, deltaY: number): number => {
  const oldPos = runtime.sMenu.cursorPos;
  if (deltaX) {
    if ((runtime.sMenu.cursorPos % runtime.sMenu.columns) + s8(deltaX) >= 0 && (runtime.sMenu.cursorPos % runtime.sMenu.columns) + s8(deltaX) < runtime.sMenu.columns) runtime.sMenu.cursorPos += s8(deltaX);
  }
  if (deltaY) {
    if (Math.trunc(runtime.sMenu.cursorPos / runtime.sMenu.columns) + s8(deltaY) >= 0 && Math.trunc(runtime.sMenu.cursorPos / runtime.sMenu.columns) + s8(deltaY) < runtime.sMenu.rows) runtime.sMenu.cursorPos += runtime.sMenu.columns * s8(deltaY);
  }
  if (runtime.sMenu.cursorPos > runtime.sMenu.maxCursorPos) {
    runtime.sMenu.cursorPos = oldPos;
    return runtime.sMenu.cursorPos;
  }
  MultichoiceGrid_RedrawCursor(runtime, oldPos, runtime.sMenu.cursorPos);
  return runtime.sMenu.cursorPos;
};

export const Menu_ProcessInputGridLayout = (runtime: MenuRuntime): number => {
  const oldPos = runtime.sMenu.cursorPos;
  if (joyNew(runtime, A_BUTTON)) {
    PlaySE(runtime, SE_SELECT);
    return runtime.sMenu.cursorPos;
  }
  if (joyNew(runtime, B_BUTTON)) return MENU_B_PRESSED;
  if (joyNew(runtime, DPAD_UP)) {
    if (oldPos !== MultichoiceGrid_MoveCursorIfValid(runtime, 0, -1)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyNew(runtime, DPAD_DOWN)) {
    if (oldPos !== MultichoiceGrid_MoveCursorIfValid(runtime, 0, 1)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyNew(runtime, DPAD_LEFT) || runtime.lrKeysPressed === MENU_L_PRESSED) {
    if (oldPos !== MultichoiceGrid_MoveCursorIfValid(runtime, -1, 0)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyNew(runtime, DPAD_RIGHT) || runtime.lrKeysPressed === MENU_R_PRESSED) {
    if (oldPos !== MultichoiceGrid_MoveCursorIfValid(runtime, 1, 0)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
};

export const Menu_ProcessGridInput_NoSoundLimit = (runtime: MenuRuntime): number => {
  if (joyNew(runtime, A_BUTTON)) {
    PlaySE(runtime, SE_SELECT);
    return runtime.sMenu.cursorPos;
  }
  if (joyNew(runtime, B_BUTTON)) return MENU_B_PRESSED;
  if (joyNew(runtime, DPAD_UP)) {
    PlaySE(runtime, SE_SELECT);
    MultichoiceGrid_MoveCursor(runtime, 0, -1);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyNew(runtime, DPAD_DOWN)) {
    PlaySE(runtime, SE_SELECT);
    MultichoiceGrid_MoveCursor(runtime, 0, 1);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyNew(runtime, DPAD_LEFT) || runtime.lrKeysPressed === MENU_L_PRESSED) {
    PlaySE(runtime, SE_SELECT);
    MultichoiceGrid_MoveCursor(runtime, -1, 0);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyNew(runtime, DPAD_RIGHT) || runtime.lrKeysPressed === MENU_R_PRESSED) {
    PlaySE(runtime, SE_SELECT);
    MultichoiceGrid_MoveCursor(runtime, 1, 0);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
};

export const Menu_ProcessGridInputRepeat_NoSoundLimit = (
  runtime: MenuRuntime
): number => {
  if (joyNew(runtime, A_BUTTON)) {
    PlaySE(runtime, SE_SELECT);
    return runtime.sMenu.cursorPos;
  }
  if (joyNew(runtime, B_BUTTON)) return MENU_B_PRESSED;
  if (joyReptEq(runtime, DPAD_UP)) {
    PlaySE(runtime, SE_SELECT);
    MultichoiceGrid_MoveCursor(runtime, 0, -1);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyReptEq(runtime, DPAD_DOWN)) {
    PlaySE(runtime, SE_SELECT);
    MultichoiceGrid_MoveCursor(runtime, 0, 1);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyReptEq(runtime, DPAD_LEFT) || runtime.lrKeysPressedAndHeld === MENU_L_PRESSED) {
    PlaySE(runtime, SE_SELECT);
    MultichoiceGrid_MoveCursor(runtime, -1, 0);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyReptEq(runtime, DPAD_RIGHT) || runtime.lrKeysPressedAndHeld === MENU_R_PRESSED) {
    PlaySE(runtime, SE_SELECT);
    MultichoiceGrid_MoveCursor(runtime, 1, 0);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
};

export const Menu_ProcessGridInputRepeat = (runtime: MenuRuntime): number => {
  const oldPos = runtime.sMenu.cursorPos;
  if (joyNew(runtime, A_BUTTON)) {
    PlaySE(runtime, SE_SELECT);
    return runtime.sMenu.cursorPos;
  }
  if (joyNew(runtime, B_BUTTON)) return MENU_B_PRESSED;
  if (joyReptEq(runtime, DPAD_UP)) {
    if (oldPos !== MultichoiceGrid_MoveCursorIfValid(runtime, 0, -1)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyReptEq(runtime, DPAD_DOWN)) {
    if (oldPos !== MultichoiceGrid_MoveCursorIfValid(runtime, 0, 1)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyReptEq(runtime, DPAD_LEFT) || runtime.lrKeysPressedAndHeld === MENU_L_PRESSED) {
    if (oldPos !== MultichoiceGrid_MoveCursorIfValid(runtime, -1, 0)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  if (joyReptEq(runtime, DPAD_RIGHT) || runtime.lrKeysPressedAndHeld === MENU_R_PRESSED) {
    if (oldPos !== MultichoiceGrid_MoveCursorIfValid(runtime, 1, 0)) PlaySE(runtime, SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
};
