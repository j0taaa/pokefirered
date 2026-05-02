export const BG_CHAR_SIZE = 0x4000;
export const REG_OFFSET_DISPCNT = 'DISPCNT';
export const REG_OFFSET_BG0CNT = 'BG0CNT';
export const REG_OFFSET_BG0HOFS = 'BG0HOFS';
export const REG_OFFSET_BG0VOFS = 'BG0VOFS';
export const REG_OFFSET_BLDCNT = 'BLDCNT';
export const OPTIONS_BUTTON_MODE_HELP = 2;
export const FONT_SMALL = 0;
export const FONT_NORMAL = 2;
export const FONT_FEMALE = 5;
export const FONTATTR_MAX_LETTER_HEIGHT = 0;
export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const L_BUTTON = 1 << 9;
export const R_BUTTON = 1 << 8;
export const DPAD_UP = 1 << 6;
export const DPAD_DOWN = 1 << 7;
export const DPAD_LEFT = 1 << 5;
export const DPAD_RIGHT = 1 << 4;
export const SE_SELECT = 'SE_SELECT';
export const SE_HELP_ERROR = 'SE_HELP_ERROR';
export const SE_HELP_OPEN = 'SE_HELP_OPEN';
export const SE_HELP_CLOSE = 'SE_HELP_CLOSE';

export const EOS = 0xff;
export const CHAR_NEWLINE = 0xfe;
export const PLACEHOLDER_BEGIN = 0xfd;
export const EXT_CTRL_CODE_BEGIN = 0xfc;
export const CHAR_PROMPT_SCROLL = 0xfa;
export const CHAR_PROMPT_CLEAR = 0xfb;
export const CHAR_KEYPAD_ICON = 0xf8;
export const CHAR_EXTRA_SYMBOL = 0xf9;
export const CHAR_SPACE = 0;
export const PLACEHOLDER_ID_PLAYER = 1;
export const PLACEHOLDER_ID_STRING_VAR_1 = 2;
export const EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW = 1;
export const EXT_CTRL_CODE_PLAY_BGM = 2;
export const EXT_CTRL_CODE_PLAY_SE = 3;
export const EXT_CTRL_CODE_COLOR = 4;
export const EXT_CTRL_CODE_HIGHLIGHT = 5;
export const EXT_CTRL_CODE_SHADOW = 6;
export const EXT_CTRL_CODE_PALETTE = 7;
export const EXT_CTRL_CODE_FONT = 8;
export const EXT_CTRL_CODE_PAUSE = 9;
export const EXT_CTRL_CODE_ESCAPE = 10;
export const EXT_CTRL_CODE_SHIFT_RIGHT = 11;
export const EXT_CTRL_CODE_SHIFT_DOWN = 12;
export const EXT_CTRL_CODE_RESET_FONT = 13;
export const EXT_CTRL_CODE_PAUSE_UNTIL_PRESS = 14;
export const EXT_CTRL_CODE_WAIT_SE = 15;
export const EXT_CTRL_CODE_FILL_WINDOW = 16;
export const EXT_CTRL_CODE_CLEAR = 17;
export const EXT_CTRL_CODE_SKIP = 18;
export const EXT_CTRL_CODE_CLEAR_TO = 19;
export const EXT_CTRL_CODE_MIN_LETTER_SPACING = 20;
export const EXT_CTRL_CODE_JPN = 21;
export const EXT_CTRL_CODE_ENG = 22;
export const FLAG_SYS_NOT_SOMEONES_PC = 0x844;

export interface ListMenuItem {
  label: string | number[];
  index: number;
}

export interface HelpSystemListMenuSub {
  items: ListMenuItem[];
  totalItems: number;
  maxShowed: number;
  left: number;
  top: number;
}

export interface HelpSystemListMenu {
  sub: HelpSystemListMenuSub;
  itemsAbove: number;
  cursorPos: number;
  state: number;
}

export interface HelpSystemVideoState {
  savedVblankCb: string | null;
  savedHblankCb: string | null;
  savedDispCnt: number;
  savedBg0Cnt: number;
  savedBg0Hofs: number;
  savedBg0Vofs: number;
  savedBldCnt: number;
  savedTextColor: [number, number, number];
  state: number;
}

export interface HelpSystemRuntime {
  gHelpSystemEnabled: boolean;
  gDisableHelpSystemVolumeReduce: boolean;
  gHelpSystemToggleWithRButtonDisabled: boolean;
  sDelayTimer: number;
  sInHelpSystem: boolean;
  sVideoState: HelpSystemVideoState;
  gHelpSystemListMenu: HelpSystemListMenu;
  gHelpSystemListMenuItems: ListMenuItem[];
  gDecompressionBuffer: Uint8Array;
  sMapTilesBackup: Uint8Array;
  palette: Uint16Array;
  bgCharBlock3: Uint8Array;
  gpuRegs: Map<string, number>;
  textColor: [number, number, number];
  main: { vblankCallback: string | null; hblankCallback: string | null };
  optionsButtonMode: number;
  newKeys: number;
  repeatedKeys: number;
  flags: Set<number>;
  playerName: number[];
  glyphInfo: { width: number; height: number };
  fontMaxLetterHeight: Map<number, number>;
  keypadIconWidth: Map<number, number>;
  keypadIconHeight: Map<number, number>;
  keypadIconTileOffset: Map<number, number>;
  operations: string[];
  printedText: Array<{ fontId: number; text: string | number[]; x: number; y: number; width: number; height: number }>;
  helpSystemIsSinglePlayerResult: boolean;
  helpSystemUpdateHasntSeenIntroResult: boolean;
  runHelpMenuSubroutineResult: boolean;
  getHelpSystemMenuLevelResult: number;
}

const emptyMenu = (): HelpSystemListMenu => ({
  sub: { items: [], totalItems: 0, maxShowed: 0, left: 0, top: 0 },
  itemsAbove: 0,
  cursorPos: 0,
  state: 0
});

export const createHelpSystemUtilRuntime = (): HelpSystemRuntime => ({
  gHelpSystemEnabled: false,
  gDisableHelpSystemVolumeReduce: false,
  gHelpSystemToggleWithRButtonDisabled: false,
  sDelayTimer: 0,
  sInHelpSystem: false,
  sVideoState: {
    savedVblankCb: null,
    savedHblankCb: null,
    savedDispCnt: 0,
    savedBg0Cnt: 0,
    savedBg0Hofs: 0,
    savedBg0Vofs: 0,
    savedBldCnt: 0,
    savedTextColor: [0, 0, 0],
    state: 0
  },
  gHelpSystemListMenu: emptyMenu(),
  gHelpSystemListMenuItems: Array.from({ length: 52 }, () => ({ label: '', index: 0 })),
  gDecompressionBuffer: new Uint8Array(BG_CHAR_SIZE),
  sMapTilesBackup: new Uint8Array(BG_CHAR_SIZE),
  palette: new Uint16Array(0x200),
  bgCharBlock3: new Uint8Array(BG_CHAR_SIZE),
  gpuRegs: new Map(),
  textColor: [0, 0, 0],
  main: { vblankCallback: null, hblankCallback: null },
  optionsButtonMode: OPTIONS_BUTTON_MODE_HELP,
  newKeys: 0,
  repeatedKeys: 0,
  flags: new Set(),
  playerName: [],
  glyphInfo: { width: 6, height: 8 },
  fontMaxLetterHeight: new Map([[FONT_SMALL, 7], [FONT_NORMAL, 12], [FONT_FEMALE, 12]]),
  keypadIconWidth: new Map(),
  keypadIconHeight: new Map(),
  keypadIconTileOffset: new Map(),
  operations: [],
  printedText: [],
  helpSystemIsSinglePlayerResult: true,
  helpSystemUpdateHasntSeenIntroResult: false,
  runHelpMenuSubroutineResult: false,
  getHelpSystemMenuLevelResult: 0
});

const u8 = (value: number): number => value & 0xff;
const u16 = (value: number): number => value & 0xffff;
const joyNew = (runtime: HelpSystemRuntime, mask: number): boolean => (runtime.newKeys & mask) !== 0;
const joyRept = (runtime: HelpSystemRuntime, mask: number): boolean => (runtime.repeatedKeys & mask) !== 0;
const record = (runtime: HelpSystemRuntime, op: string): void => {
  runtime.operations.push(op);
};

const writeHalfword = (buffer: Uint8Array, offset: number, value: number): void => {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
};

const readHalfword = (buffer: Uint8Array, offset: number): number => buffer[offset] | (buffer[offset + 1] << 8);

const cpuFill16 = (buffer: Uint8Array, offset: number, value: number, size: number): void => {
  for (let i = 0; i < size; i += 2) {
    writeHalfword(buffer, offset + i, value);
  }
};

const bytesOfText = (text: string | number[]): number[] => (
  typeof text === 'string' ? [...text].map((char) => char === '\n' ? CHAR_NEWLINE : char.charCodeAt(0)).concat(EOS) : text
);

export const getHelpSystemTile = (runtime: HelpSystemRuntime, x: number, y: number): number =>
  readHalfword(runtime.gDecompressionBuffer, 0x3800 + 64 * y + 2 * x);

export const PlaySE = (runtime: HelpSystemRuntime, se: string): void => record(runtime, `PlaySE:${se}`);
export const SetGpuReg = (runtime: HelpSystemRuntime, reg: string, value: number): void => {
  runtime.gpuRegs.set(reg, u16(value));
  record(runtime, `SetGpuReg:${reg}:${u16(value)}`);
};
export const GetGpuReg = (runtime: HelpSystemRuntime, reg: string): number => runtime.gpuRegs.get(reg) ?? 0;
export const HelpSystem_IsSinglePlayer = (runtime: HelpSystemRuntime): boolean => runtime.helpSystemIsSinglePlayerResult;
export const HelpSystem_UpdateHasntSeenIntro = (runtime: HelpSystemRuntime): boolean => runtime.helpSystemUpdateHasntSeenIntroResult;
export const RunHelpMenuSubroutine = (runtime: HelpSystemRuntime): boolean => runtime.runHelpMenuSubroutineResult;
export const GetHelpSystemMenuLevel = (runtime: HelpSystemRuntime): number => runtime.getHelpSystemMenuLevelResult;

export const SaveCallbacks = (runtime: HelpSystemRuntime): void => {
  runtime.sVideoState.savedVblankCb = runtime.main.vblankCallback;
  runtime.sVideoState.savedHblankCb = runtime.main.hblankCallback;
  runtime.main.vblankCallback = null;
  runtime.main.hblankCallback = null;
  record(runtime, 'DisableDma0');
};

export const SaveMapGPURegs = (runtime: HelpSystemRuntime): void => {
  runtime.sVideoState.savedDispCnt = GetGpuReg(runtime, REG_OFFSET_DISPCNT);
  runtime.sVideoState.savedBg0Cnt = GetGpuReg(runtime, REG_OFFSET_BG0CNT);
  runtime.sVideoState.savedBg0Hofs = GetGpuReg(runtime, REG_OFFSET_BG0HOFS);
  runtime.sVideoState.savedBg0Vofs = GetGpuReg(runtime, REG_OFFSET_BG0VOFS);
  runtime.sVideoState.savedBldCnt = GetGpuReg(runtime, REG_OFFSET_BLDCNT);
};

export const SaveMapTiles = (runtime: HelpSystemRuntime): void => {
  runtime.sMapTilesBackup.set(runtime.bgCharBlock3);
  record(runtime, 'RequestDma3Copy:BG_CHAR_ADDR(3):sMapTilesBackup:0x4000');
};

export const SaveMapTextColors = (runtime: HelpSystemRuntime): void => {
  runtime.sVideoState.savedTextColor = [...runtime.textColor] as [number, number, number];
};

export const RestoreCallbacks = (runtime: HelpSystemRuntime): void => {
  runtime.main.vblankCallback = runtime.sVideoState.savedVblankCb;
  runtime.main.hblankCallback = runtime.sVideoState.savedHblankCb;
};

export const RestoreGPURegs = (runtime: HelpSystemRuntime): void => {
  SetGpuReg(runtime, REG_OFFSET_BLDCNT, runtime.sVideoState.savedBldCnt);
  SetGpuReg(runtime, REG_OFFSET_BG0HOFS, runtime.sVideoState.savedBg0Hofs);
  SetGpuReg(runtime, REG_OFFSET_BG0VOFS, runtime.sVideoState.savedBg0Vofs);
  SetGpuReg(runtime, REG_OFFSET_BG0CNT, runtime.sVideoState.savedBg0Cnt);
  SetGpuReg(runtime, REG_OFFSET_DISPCNT, runtime.sVideoState.savedDispCnt);
};

export const RestoreMapTiles = (runtime: HelpSystemRuntime): void => {
  runtime.bgCharBlock3.set(runtime.sMapTilesBackup);
  record(runtime, 'RequestDma3Copy:sMapTilesBackup:BG_CHAR_ADDR(3):0x4000');
};

export const RestoreMapTextColors = (runtime: HelpSystemRuntime): void => {
  runtime.textColor = [...runtime.sVideoState.savedTextColor] as [number, number, number];
};

export const CommitTilemap = (runtime: HelpSystemRuntime): void => {
  runtime.bgCharBlock3.set(runtime.gDecompressionBuffer);
  record(runtime, 'RequestDma3Copy:gDecompressionBuffer:BG_CHAR_ADDR(3):0x4000');
};

export const HS_DrawBgTilemapRect = (
  runtime: HelpSystemRuntime,
  baseTile: number,
  left: number,
  top: number,
  width: number,
  height: number,
  increment: number
): void => {
  let tile = u16(baseTile);
  for (let i = top; i < top + height; i += 1) {
    for (let j = left; j < left + width; j += 1) {
      writeHalfword(runtime.gDecompressionBuffer, 0x3800 + 64 * i + 2 * j, tile);
      tile = u16(tile + increment);
    }
  }
  CommitTilemap(runtime);
};

export const HS_BufferFillMapWithTile1FF = (runtime: HelpSystemRuntime): void =>
  HS_DrawBgTilemapRect(runtime, 0x1ff, 0, 0, 30, 20, 0);

export const HS_ShowOrHideWordHELPinTopLeft = (runtime: HelpSystemRuntime, mode: number): void => {
  switch (mode) {
    case 0: HS_DrawBgTilemapRect(runtime, 0x1ff, 1, 0, 7, 2, 0); break;
    case 1: HS_DrawBgTilemapRect(runtime, 0x1e8, 1, 0, 7, 2, 1); break;
  }
};

export const HS_ShowOrHideControlsGuideInTopRight = (runtime: HelpSystemRuntime, mode: number): void => {
  switch (mode) {
    case 0: HS_DrawBgTilemapRect(runtime, 0x1ff, 13, 0, 16, 2, 0); break;
    case 1: HS_DrawBgTilemapRect(runtime, 0x1a0, 13, 0, 16, 2, 1); break;
  }
};

export const HS_ShowOrHideMainWindowText = (runtime: HelpSystemRuntime, mode: number): void => {
  switch (mode) {
    case 0: HS_DrawBgTilemapRect(runtime, 0x1ff, 2, 3, 26, 16, 0); break;
    case 1: HS_DrawBgTilemapRect(runtime, 0x000, 2, 3, 26, 16, 1); break;
  }
};

export const HS_SetMainWindowBgBrightness = (runtime: HelpSystemRuntime, mode: number): void => {
  switch (mode) {
    case 0: HS_DrawBgTilemapRect(runtime, 0x1ff, 1, 3, 28, 16, 0); break;
    case 1: HS_DrawBgTilemapRect(runtime, 0x1fa, 1, 3, 28, 17, 0); break;
  }
};

export const HS_ShowOrHideToplevelTooltipWindow = (runtime: HelpSystemRuntime, mode: number): void => {
  switch (mode) {
    case 0: HS_DrawBgTilemapRect(runtime, 0x1ff, 2, 14, 26, 5, 0); break;
    case 1: HS_DrawBgTilemapRect(runtime, 0x11e, 2, 14, 26, 5, 1); break;
  }
};

export const HS_ShowOrHideHeaderAndFooterLines_Lighter = (runtime: HelpSystemRuntime, mode: number): void => {
  switch (mode) {
    case 0:
      HS_DrawBgTilemapRect(runtime, 0x1ff, 1, 2, 28, 1, 0);
      HS_DrawBgTilemapRect(runtime, 0x1ff, 1, 19, 28, 1, 0);
      break;
    case 1:
      HS_DrawBgTilemapRect(runtime, 0x1f7, 1, 2, 28, 1, 0);
      HS_DrawBgTilemapRect(runtime, 0x1f8, 1, 19, 28, 1, 0);
      break;
  }
};

export const HS_ShowOrHideHeaderAndFooterLines_Darker = (runtime: HelpSystemRuntime, mode: number): void => {
  switch (mode) {
    case 0:
      HS_DrawBgTilemapRect(runtime, 0x1ff, 1, 2, 28, 1, 0);
      HS_DrawBgTilemapRect(runtime, 0x1ff, 1, 19, 28, 1, 0);
      break;
    case 1:
      HS_DrawBgTilemapRect(runtime, 0x1fb, 1, 2, 28, 1, 0);
      HS_DrawBgTilemapRect(runtime, 0x1fc, 1, 19, 28, 1, 0);
      break;
  }
};

export const HS_ShowOrHideVerticalBlackBarsAlongSides = (runtime: HelpSystemRuntime, mode: number): void => {
  switch (mode) {
    case 0:
      HS_DrawBgTilemapRect(runtime, 0x1ff, 0, 0, 1, 20, 0);
      HS_DrawBgTilemapRect(runtime, 0x1ff, 29, 0, 1, 20, 0);
      break;
    case 1:
      HS_DrawBgTilemapRect(runtime, 0x1f9, 0, 0, 1, 20, 0);
      HS_DrawBgTilemapRect(runtime, 0x1f9, 29, 0, 1, 20, 0);
      break;
  }
};

export const HS_ShowOrHideHeaderLine_Darker_FooterStyle = (runtime: HelpSystemRuntime, mode: number): void => {
  switch (mode) {
    case 0: HS_DrawBgTilemapRect(runtime, 0x1ff, 1, 5, 28, 1, 0); break;
    case 1: HS_DrawBgTilemapRect(runtime, 0x1fc, 1, 5, 28, 1, 0); break;
  }
};

export const HS_ShowOrHideScrollArrows = (runtime: HelpSystemRuntime, which: number, mode: number): void => {
  switch (mode) {
    case 0:
      HS_DrawBgTilemapRect(runtime, 0x1ff, 28, 3, 1, 1, 0);
      HS_DrawBgTilemapRect(runtime, 0x1ff, 28, 18, 1, 1, 0);
      break;
    case 1:
      if (which === 0) HS_DrawBgTilemapRect(runtime, 0x1fe, 28, 3, 1, 1, 0);
      else HS_DrawBgTilemapRect(runtime, 0x1fd, 28, 18, 1, 1, 0);
      break;
  }
};

export const GetFontAttribute = (runtime: HelpSystemRuntime, fontId: number, attribute: number): number =>
  attribute === FONTATTR_MAX_LETTER_HEIGHT ? runtime.fontMaxLetterHeight.get(fontId) ?? 12 : 0;

export const DecompressAndRenderGlyph = (
  runtime: HelpSystemRuntime,
  fontId: number,
  glyph: number,
  _destBufferOffset: number,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  if (fontId === FONT_SMALL) record(runtime, `DecompressGlyph_Small:${glyph}`);
  else if (fontId === FONT_FEMALE) record(runtime, `DecompressGlyph_Female:${glyph}`);
  else record(runtime, `DecompressGlyph_Normal:${glyph}`);
  record(runtime, `BlitGlyph:${glyph}:${x}:${y}:${width}:${height}`);
};

export const HelpSystemRenderText = (
  runtime: HelpSystemRuntime,
  fontId: number,
  destBufferOffset: number,
  src: string | number[],
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  const bytes = bytesOfText(src);
  const origX = x;
  let srcIndex = 0;
  while (true) {
    let curChar = bytes[srcIndex++];
    switch (curChar) {
      case EOS:
        return;
      case CHAR_NEWLINE:
        x = origX;
        y += runtime.glyphInfo.height + 1;
        break;
      case PLACEHOLDER_BEGIN:
        curChar = bytes[srcIndex++];
        if (curChar === PLACEHOLDER_ID_PLAYER) {
          for (let i = 0; i < 10; i += 1) {
            const glyph = runtime.playerName[i];
            if (glyph === undefined || glyph === EOS) break;
            DecompressAndRenderGlyph(runtime, fontId, glyph, destBufferOffset, x, y, width, height);
            x += runtime.glyphInfo.width;
          }
        } else if (curChar === PLACEHOLDER_ID_STRING_VAR_1) {
          const text = runtime.flags.has(FLAG_SYS_NOT_SOMEONES_PC) ? 'Bill' : 'Someone';
          for (const char of text) {
            DecompressAndRenderGlyph(runtime, fontId, char.charCodeAt(0), destBufferOffset, x, y, width, height);
            x += runtime.glyphInfo.width;
          }
        }
        break;
      case CHAR_PROMPT_SCROLL:
      case CHAR_PROMPT_CLEAR:
        x = origX;
        y += runtime.glyphInfo.height + 1;
        break;
      case EXT_CTRL_CODE_BEGIN:
        curChar = bytes[srcIndex++];
        switch (curChar) {
          case EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW:
            srcIndex += 1;
          // fallthrough
          case EXT_CTRL_CODE_PLAY_BGM:
          case EXT_CTRL_CODE_PLAY_SE:
            srcIndex += 1;
          // fallthrough
          case EXT_CTRL_CODE_COLOR:
          case EXT_CTRL_CODE_HIGHLIGHT:
          case EXT_CTRL_CODE_SHADOW:
          case EXT_CTRL_CODE_PALETTE:
          case EXT_CTRL_CODE_FONT:
          case EXT_CTRL_CODE_PAUSE:
          case EXT_CTRL_CODE_ESCAPE:
          case EXT_CTRL_CODE_SHIFT_RIGHT:
          case EXT_CTRL_CODE_SHIFT_DOWN:
            srcIndex += 1;
            break;
          case EXT_CTRL_CODE_RESET_FONT:
          case EXT_CTRL_CODE_PAUSE_UNTIL_PRESS:
          case EXT_CTRL_CODE_WAIT_SE:
          case EXT_CTRL_CODE_FILL_WINDOW:
            break;
          case EXT_CTRL_CODE_CLEAR:
          case EXT_CTRL_CODE_SKIP:
            srcIndex += 1;
            break;
          case EXT_CTRL_CODE_CLEAR_TO: {
            const clearPixels = bytes[srcIndex] + origX - x;
            if (clearPixels > 0) {
              record(runtime, `FillBitmapRect4Bit:${x}:${y}:${clearPixels}:${GetFontAttribute(runtime, fontId, FONTATTR_MAX_LETTER_HEIGHT)}`);
              x += clearPixels;
            }
            srcIndex += 1;
            break;
          }
          case EXT_CTRL_CODE_MIN_LETTER_SPACING:
            srcIndex += 1;
            break;
          case EXT_CTRL_CODE_JPN:
          case EXT_CTRL_CODE_ENG:
            break;
        }
        break;
      case CHAR_KEYPAD_ICON:
        curChar = bytes[srcIndex++];
        record(runtime, `BlitKeypadIcon:${runtime.keypadIconTileOffset.get(curChar) ?? 0}:${x}:${y}`);
        x += runtime.keypadIconWidth.get(curChar) ?? 0;
        break;
      case CHAR_EXTRA_SYMBOL:
        curChar = bytes[srcIndex++] + 0x100;
      // fallthrough
      default:
        if (curChar === CHAR_SPACE) x += fontId === FONT_SMALL ? 5 : 4;
        else {
          DecompressAndRenderGlyph(runtime, fontId, curChar, destBufferOffset, x, y, width, height);
          x += runtime.glyphInfo.width;
        }
        break;
    }
  }
};

export const HelpSystem_PrintTextInTopLeftCorner = (runtime: HelpSystemRuntime, str: string | number[]): void => {
  runtime.printedText.push({ fontId: 5, text: str, x: 6, y: 2, width: 7, height: 2 });
  HelpSystemRenderText(runtime, 5, 0x3d00, str, 6, 2, 7, 2);
};

const getStringWidth = (text: string | number[]): number => bytesOfText(text).filter((byte) => byte !== EOS).length * 6;

export const HelpSystem_PrintTextRightAlign_Row52 = (runtime: HelpSystemRuntime, str: string | number[]): void => {
  const left = 0x7c - getStringWidth(str);
  runtime.printedText.push({ fontId: 0, text: str, x: left, y: 2, width: 16, height: 2 });
  HelpSystemRenderText(runtime, 0, 0x3400, str, left, 2, 16, 2);
};

export const HelpSystem_PrintTextAt = (runtime: HelpSystemRuntime, str: string | number[], x: number, y: number): void => {
  runtime.printedText.push({ fontId: 2, text: str, x, y, width: 26, height: 16 });
  HelpSystemRenderText(runtime, 2, 0, str, x, y, 26, 16);
};

export const HelpSystem_PrintQuestionAndAnswerPair = (runtime: HelpSystemRuntime, question: string | number[], answer: string | number[]): void => {
  cpuFill16(runtime.gDecompressionBuffer, 0, 0xeeee, 0x3400);
  HelpSystemRenderText(runtime, 2, 0, question, 0, 0, 26, 16);
  HelpSystemRenderText(runtime, 2, 0x09c0, answer, 0, 0, 26, 13);
};

export const HelpSystem_PrintTopicMouseoverDescription = (runtime: HelpSystemRuntime, str: string | number[]): void => {
  cpuFill16(runtime.gDecompressionBuffer, 0x23c0, 0x1111, 0x1040);
  HelpSystemRenderText(runtime, 2, 0x23c0, str, 2, 6, 26, 5);
};

export const HelpSystem_FillPanel3 = (runtime: HelpSystemRuntime): void => cpuFill16(runtime.gDecompressionBuffer, 0x3d00, 0xffff, 0x1c0);
export const HelpSystem_FillPanel2 = (runtime: HelpSystemRuntime): void => cpuFill16(runtime.gDecompressionBuffer, 0x3400, 0xffff, 0x400);
export const HelpSystem_FillPanel1 = (runtime: HelpSystemRuntime): void => cpuFill16(runtime.gDecompressionBuffer, 0x0000, 0xffff, 0x3400);

export const HelpSystem_InitListMenuController = (
  runtime: HelpSystemRuntime,
  menu: HelpSystemListMenu,
  itemsAbove: number,
  cursorPos: number
): void => {
  runtime.gHelpSystemListMenu.sub = { ...menu.sub };
  runtime.gHelpSystemListMenu.itemsAbove = u8(itemsAbove);
  runtime.gHelpSystemListMenu.cursorPos = u8(cursorPos);
  runtime.gHelpSystemListMenu.state = 0;
  if (runtime.gHelpSystemListMenu.sub.totalItems < runtime.gHelpSystemListMenu.sub.maxShowed) {
    runtime.gHelpSystemListMenu.sub.maxShowed = runtime.gHelpSystemListMenu.sub.totalItems;
  }
  HS_ShowOrHideMainWindowText(runtime, 0);
  HelpSystem_FillPanel1(runtime);
  PrintListMenuItems(runtime);
  PlaceListMenuCursor(runtime);
};

export const HelpSystem_SetInputDelay = (runtime: HelpSystemRuntime, value: number): void => {
  runtime.sDelayTimer = u8(value);
};

export const HelpSystem_GetMenuInput = (runtime: HelpSystemRuntime): number => {
  if (runtime.sDelayTimer !== 0) {
    runtime.sDelayTimer = u8(runtime.sDelayTimer - 1);
    return -1;
  }
  if (joyNew(runtime, A_BUTTON)) {
    PlaySE(runtime, SE_SELECT);
    return runtime.gHelpSystemListMenu.sub.items[runtime.gHelpSystemListMenu.itemsAbove + runtime.gHelpSystemListMenu.cursorPos].index;
  }
  if (joyNew(runtime, B_BUTTON)) {
    PlaySE(runtime, SE_SELECT);
    return -2;
  }
  if (joyNew(runtime, L_BUTTON | R_BUTTON)) return -6;
  if (joyRept(runtime, DPAD_UP)) {
    if (!MoveCursor(runtime, 1, 0)) PlaySE(runtime, SE_SELECT);
    return -4;
  }
  if (joyRept(runtime, DPAD_DOWN)) {
    if (!MoveCursor(runtime, 1, 1)) PlaySE(runtime, SE_SELECT);
    return -5;
  }
  if (joyRept(runtime, DPAD_LEFT)) {
    if (!MoveCursor(runtime, 7, 0)) PlaySE(runtime, SE_SELECT);
    return -4;
  }
  if (joyRept(runtime, DPAD_RIGHT)) {
    if (!MoveCursor(runtime, 7, 1)) PlaySE(runtime, SE_SELECT);
    return -5;
  }
  return -1;
};

export const HS_UpdateMenuScrollArrows = (runtime: HelpSystemRuntime): void => {
  const topItemIdx = u8(runtime.gHelpSystemListMenu.sub.totalItems - 7);
  if (runtime.gHelpSystemListMenu.sub.totalItems > 7) {
    const cursorPos = runtime.gHelpSystemListMenu.itemsAbove + runtime.gHelpSystemListMenu.cursorPos;
    HS_ShowOrHideScrollArrows(runtime, 0, 0);
    if (cursorPos === 0) HS_ShowOrHideScrollArrows(runtime, 1, 1);
    else if (runtime.gHelpSystemListMenu.itemsAbove === 0 && runtime.gHelpSystemListMenu.cursorPos !== 0) HS_ShowOrHideScrollArrows(runtime, 1, 1);
    else if (runtime.gHelpSystemListMenu.itemsAbove === topItemIdx) HS_ShowOrHideScrollArrows(runtime, 0, 1);
    else if (runtime.gHelpSystemListMenu.itemsAbove !== 0) {
      HS_ShowOrHideScrollArrows(runtime, 0, 1);
      HS_ShowOrHideScrollArrows(runtime, 1, 1);
    }
  }
};

export const PrintListMenuItems = (runtime: HelpSystemRuntime): void => {
  const glyphHeight = GetFontAttribute(runtime, FONT_NORMAL, FONTATTR_MAX_LETTER_HEIGHT) + 1;
  let r5 = runtime.gHelpSystemListMenu.itemsAbove;
  for (let i = 0; i < runtime.gHelpSystemListMenu.sub.maxShowed; i += 1) {
    const x = u8(runtime.gHelpSystemListMenu.sub.left + 8);
    const y = u8(runtime.gHelpSystemListMenu.sub.top + glyphHeight * i);
    HelpSystem_PrintTextAt(runtime, runtime.gHelpSystemListMenu.sub.items[r5].label, x, y);
    r5 += 1;
  }
};

export const PlaceListMenuCursor = (runtime: HelpSystemRuntime): void => {
  const glyphHeight = GetFontAttribute(runtime, FONT_NORMAL, FONTATTR_MAX_LETTER_HEIGHT) + 1;
  HelpSystem_PrintTextAt(runtime, '>', runtime.gHelpSystemListMenu.sub.left, u8(runtime.gHelpSystemListMenu.sub.top + glyphHeight * runtime.gHelpSystemListMenu.cursorPos));
};

export const HS_RemoveSelectionCursorAt = (runtime: HelpSystemRuntime, i: number): void => {
  const glyphHeight = GetFontAttribute(runtime, FONT_NORMAL, FONTATTR_MAX_LETTER_HEIGHT) + 1;
  HelpSystem_PrintTextAt(runtime, '        ', runtime.gHelpSystemListMenu.sub.left, u8(runtime.gHelpSystemListMenu.sub.top + i * glyphHeight));
};

export const TryMoveCursor1 = (runtime: HelpSystemRuntime, dirn: number): number => {
  let midPoint: number;
  const menu = runtime.gHelpSystemListMenu;
  if (dirn === 0) {
    if (menu.sub.maxShowed === 1) midPoint = 0;
    else midPoint = menu.sub.maxShowed - (Math.trunc(menu.sub.maxShowed / 2) + (menu.sub.maxShowed & 1)) - 1;
    if (menu.itemsAbove === 0) {
      if (menu.cursorPos !== 0) {
        menu.cursorPos = u8(menu.cursorPos - 1);
        return 1;
      }
      return 0;
    }
    if (menu.cursorPos > midPoint) {
      menu.cursorPos = u8(menu.cursorPos - 1);
      return 1;
    }
    menu.itemsAbove = u8(menu.itemsAbove - 1);
    return 2;
  }
  if (menu.sub.maxShowed === 1) midPoint = 0;
  else midPoint = Math.trunc(menu.sub.maxShowed / 2) + (menu.sub.maxShowed & 1);
  if (menu.itemsAbove === menu.sub.totalItems - menu.sub.maxShowed) {
    if (menu.cursorPos < menu.sub.maxShowed - 1) {
      menu.cursorPos = u8(menu.cursorPos + 1);
      return 1;
    }
    return 0;
  }
  if (menu.cursorPos < midPoint) {
    menu.cursorPos = u8(menu.cursorPos + 1);
    return 1;
  }
  menu.itemsAbove = u8(menu.itemsAbove + 1);
  return 2;
};

export const HelpSystem_PrintTopicLabel = (runtime: HelpSystemRuntime): void => record(runtime, 'HelpSystem_PrintTopicLabel');

export const MoveCursor = (runtime: HelpSystemRuntime, by: number, dirn: number): boolean => {
  const r7 = runtime.gHelpSystemListMenu.cursorPos;
  let flags = 0;
  for (let i = 0; i < by; i += 1) flags |= TryMoveCursor1(runtime, dirn);
  switch (flags) {
    case 0:
    default:
      return true;
    case 1:
      HS_RemoveSelectionCursorAt(runtime, r7);
      PlaceListMenuCursor(runtime);
      CommitTilemap(runtime);
      break;
    case 2:
    case 3:
      if (GetHelpSystemMenuLevel(runtime) === 1) {
        HelpSystem_SetInputDelay(runtime, 2);
        HelpSystem_FillPanel1(runtime);
        PrintListMenuItems(runtime);
        PlaceListMenuCursor(runtime);
        HelpSystem_PrintTopicLabel(runtime);
        HS_UpdateMenuScrollArrows(runtime);
      } else {
        HS_ShowOrHideMainWindowText(runtime, 0);
        HelpSystem_FillPanel1(runtime);
        PrintListMenuItems(runtime);
        PlaceListMenuCursor(runtime);
        HS_ShowOrHideMainWindowText(runtime, 1);
      }
      CommitTilemap(runtime);
      break;
  }
  return false;
};

export const RunHelpSystemCallback = (runtime: HelpSystemRuntime): number => {
  switch (runtime.sVideoState.state) {
    case 0:
      runtime.sInHelpSystem = false;
      if (runtime.optionsButtonMode !== OPTIONS_BUTTON_MODE_HELP) return 0;
      if (joyNew(runtime, R_BUTTON) && runtime.gHelpSystemToggleWithRButtonDisabled === true) return 0;
      if (joyNew(runtime, L_BUTTON | R_BUTTON)) {
        if (!HelpSystem_IsSinglePlayer(runtime) || !runtime.gHelpSystemEnabled) {
          PlaySE(runtime, SE_HELP_ERROR);
          return 0;
        }
        record(runtime, 'm4aMPlayStop:SE1');
        record(runtime, 'm4aMPlayStop:SE2');
        PlaySE(runtime, SE_HELP_OPEN);
        if (!runtime.gDisableHelpSystemVolumeReduce) record(runtime, 'm4aMPlayVolumeControl:BGM:0x80');
        SaveCallbacks(runtime);
        runtime.sInHelpSystem = true;
        runtime.sVideoState.state = 1;
      }
      break;
    case 1:
      SaveMapTiles(runtime);
      SaveMapGPURegs(runtime);
      SaveMapTextColors(runtime);
      runtime.palette[0] = 0;
      SetGpuReg(runtime, REG_OFFSET_DISPCNT, 0);
      runtime.sVideoState.state = 2;
      break;
    case 2:
      runtime.bgCharBlock3.fill(0);
      record(runtime, 'RequestDma3Fill:BG_CHAR_ADDR(3):0x4000');
      record(runtime, 'RequestDma3Copy:sPals:PLTT');
      record(runtime, 'RequestDma3Copy:sTiles:gDecompressionBuffer+0x3EE0');
      runtime.sVideoState.state = 3;
      break;
    case 3:
      HS_BufferFillMapWithTile1FF(runtime);
      HelpSystem_FillPanel3(runtime);
      HelpSystem_FillPanel2(runtime);
      HelpSystem_PrintTextInTopLeftCorner(runtime, 'HELP');
      HS_ShowOrHideWordHELPinTopLeft(runtime, 1);
      if (HelpSystem_UpdateHasntSeenIntro(runtime) === true) record(runtime, 'HelpSystemSubroutine_PrintWelcomeMessage');
      else record(runtime, 'HelpSystemSubroutine_WelcomeEndGotoMenu');
      HS_ShowOrHideHeaderAndFooterLines_Lighter(runtime, 1);
      HS_ShowOrHideVerticalBlackBarsAlongSides(runtime, 1);
      CommitTilemap(runtime);
      runtime.sVideoState.state = 4;
      break;
    case 4:
      SetGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
      SetGpuReg(runtime, REG_OFFSET_BG0HOFS, 0);
      SetGpuReg(runtime, REG_OFFSET_BG0VOFS, 0);
      SetGpuReg(runtime, REG_OFFSET_BG0CNT, 0);
      SetGpuReg(runtime, REG_OFFSET_DISPCNT, 1);
      runtime.sVideoState.state = 5;
      break;
    case 5:
      if (!RunHelpMenuSubroutine(runtime)) {
        PlaySE(runtime, SE_HELP_CLOSE);
        runtime.sVideoState.state = 6;
      }
      break;
    case 6:
      SetGpuReg(runtime, REG_OFFSET_DISPCNT, 0);
      RestoreMapTiles(runtime);
      runtime.palette.fill(0);
      runtime.sVideoState.state = 7;
      break;
    case 7:
      if (!runtime.gDisableHelpSystemVolumeReduce) record(runtime, 'm4aMPlayVolumeControl:BGM:0x100');
      RestoreMapTextColors(runtime);
      RestoreGPURegs(runtime);
      runtime.sVideoState.state = 8;
      break;
    case 8:
      RestoreCallbacks(runtime);
      runtime.sInHelpSystem = false;
      runtime.sVideoState.state = 0;
      break;
  }
  return runtime.sVideoState.state;
};
