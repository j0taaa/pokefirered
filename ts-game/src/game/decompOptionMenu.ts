export const MENUITEM_TEXTSPEED = 0;
export const MENUITEM_BATTLESCENE = 1;
export const MENUITEM_BATTLESTYLE = 2;
export const MENUITEM_SOUND = 3;
export const MENUITEM_BUTTONMODE = 4;
export const MENUITEM_FRAMETYPE = 5;
export const MENUITEM_CANCEL = 6;
export const MENUITEM_COUNT = 7;

export const WIN_TEXT_OPTION = 0;
export const WIN_OPTIONS = 1;

export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const DPAD_RIGHT = 0x0010;
export const DPAD_LEFT = 0x0020;
export const DPAD_UP = 0x0040;
export const DPAD_DOWN = 0x0080;

export const FONT_NORMAL = 0;
export const FONT_SMALL = 1;
export const FONTATTR_MAX_LETTER_HEIGHT = 0;
export const TEXT_SKIP_DRAW = 0xff;
export const COPYWIN_FULL = 3;
export const HELPCONTEXT_OPTIONS = 1;
export const PALETTES_ALL = 0xffffffff;
export const RGB_BLACK = 0;

export const REG_OFFSET_DISPCNT = 0;
export const REG_OFFSET_BLDCNT = 0x50;
export const REG_OFFSET_BLDY = 0x54;
export const REG_OFFSET_WININ = 0x48;
export const REG_OFFSET_WINOUT = 0x4a;
export const REG_OFFSET_WIN0V = 0x44;
export const REG_OFFSET_WIN0H = 0x40;

export const DISPCNT_MODE_0 = 0;
export const DISPCNT_OBJ_1D_MAP = 1 << 6;
export const DISPCNT_OBJ_ON = 1 << 12;
export const DISPCNT_WIN0_ON = 1 << 13;
export const BLDCNT_TGT1_BG0 = 1;
export const BLDCNT_TGT1_BG1 = 2;
export const BLDCNT_EFFECT_BLEND = 1 << 6;
export const BLDCNT_EFFECT_LIGHTEN = 2 << 6;
export const WININ_WIN0_BG0 = 1;
export const WINOUT_WIN01_BG0 = 1;
export const WINOUT_WIN01_BG1 = 2;
export const WINOUT_WIN01_BG2 = 4;
export const WINOUT_WIN01_CLR = 32;

export const TEXT_DYNAMIC_COLOR_6 = 6;
export const TEXT_COLOR_WHITE = 1;
export const TEXT_COLOR_DARK_GRAY = 2;
export const TEXT_COLOR_TRANSPARENT = 0;
export const TEXT_COLOR_LIGHT_RED = 3;
export const TEXT_COLOR_RED = 4;

export type MainCallback = (runtime: OptionMenuRuntime) => void;
export type TaskFunc = (runtime: OptionMenuRuntime, taskId: number) => void;

export type OptionMenu = {
  option: number[];
  cursorPos: number;
  loadState: number;
  state: number;
  loadPaletteState: number;
};

export type SaveBlock2Options = {
  optionsTextSpeed: number;
  optionsBattleSceneOff: number;
  optionsBattleStyle: number;
  optionsSound: number;
  optionsButtonMode: number;
  optionsWindowFrameType: number;
};

export type WindowTemplate = {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
};

export type BgTemplate = {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  screenSize: number;
  paletteMode: number;
  priority: number;
  baseTile: number;
};

export type OptionMenuRuntime = {
  sOptionMenuPtr: OptionMenu | null;
  gMain: {
    savedCallback: MainCallback | null;
    callback2: MainCallback | null;
    newKeys: number;
    newAndRepeatedKeys: number;
  };
  gSaveBlock2Ptr: SaveBlock2Options;
  gPaletteFade: { active: boolean };
  gFieldCallback: string | null;
  gpuRegs: Map<number, number>;
  tasks: Array<{ func: TaskFunc; priority: number; destroyed: boolean }>;
  vblankCallback: MainCallback | null;
  hblankCallback: MainCallback | null;
  isActiveOverworldLinkBusy: boolean;
  fontAttributes: Map<string, number>;
  stringWidths: Map<string, number>;
  log: string[];
};

export const sOptionMenuWinTemplates: Array<WindowTemplate | null> = [
  { bg: 1, tilemapLeft: 2, tilemapTop: 3, width: 26, height: 2, paletteNum: 1, baseBlock: 2 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 7, width: 26, height: 12, paletteNum: 1, baseBlock: 0x36 },
  { bg: 2, tilemapLeft: 0, tilemapTop: 0, width: 30, height: 2, paletteNum: 15, baseBlock: 0x16e },
  null
];

export const sOptionMenuBgTemplates: BgTemplate[] = [
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 0, charBaseIndex: 1, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 1, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 }
];

export const sOptionMenuPalette = 'graphics/misc/option_menu.gbapal';
export const sOptionMenuItemCounts = [3, 2, 2, 2, 3, 10, 0];

export const sOptionMenuItemsNames = [
  'Text Speed',
  'Battle Scene',
  'Battle Style',
  'Sound',
  'Button Mode',
  'Frame',
  'Cancel'
];

export const sTextSpeedOptions = ['Slow', 'Mid', 'Fast'];
export const sBattleSceneOptions = ['On', 'Off'];
export const sBattleStyleOptions = ['Shift', 'Set'];
export const sSoundOptions = ['Mono', 'Stereo'];
export const sButtonTypeOptions = ['Help', 'LR', 'L=A'];
export const gText_PickSwitchCancel = 'Pick Switch Cancel';
export const gText_FrameType = 'Type ';
export const gText_Option = 'Option';

export const sOptionMenuPickSwitchCancelTextColor = [TEXT_DYNAMIC_COLOR_6, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY];
export const sOptionMenuTextColor = [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_LIGHT_RED, TEXT_COLOR_RED];

export const WIN_RANGE = (from: number, to: number): number => ((from & 0xff) | ((to & 0xff) << 8)) & 0xffff;
export const BG_PLTT_ID = (id: number): number => id * 16;
export const PIXEL_FILL = (value: number): number => value;

export const createOptionMenuRuntime = (): OptionMenuRuntime => ({
  sOptionMenuPtr: null,
  gMain: { savedCallback: null, callback2: null, newKeys: 0, newAndRepeatedKeys: 0 },
  gSaveBlock2Ptr: {
    optionsTextSpeed: 0,
    optionsBattleSceneOff: 0,
    optionsBattleStyle: 0,
    optionsSound: 0,
    optionsButtonMode: 0,
    optionsWindowFrameType: 0
  },
  gPaletteFade: { active: false },
  gFieldCallback: null,
  gpuRegs: new Map(),
  tasks: [],
  vblankCallback: null,
  hblankCallback: null,
  isActiveOverworldLinkBusy: false,
  fontAttributes: new Map([[`${FONT_NORMAL}:${FONTATTR_MAX_LETTER_HEIGHT}`, 12]]),
  stringWidths: new Map([[gText_PickSwitchCancel, 96]]),
  log: []
});

const requireMenu = (runtime: OptionMenuRuntime): OptionMenu => {
  if (runtime.sOptionMenuPtr === null) {
    throw new Error('sOptionMenuPtr is NULL');
  }
  return runtime.sOptionMenuPtr;
};

const joyNew = (runtime: OptionMenuRuntime, button: number): number => runtime.gMain.newKeys & button;
const joyRept = (runtime: OptionMenuRuntime, button: number): number => runtime.gMain.newAndRepeatedKeys & button;

export const CB2_ReturnToFieldWithOpenMenu: MainCallback = (runtime) => {
  runtime.log.push('CB2_ReturnToFieldWithOpenMenu');
};

export const FieldCB_DefaultWarpExit = 'FieldCB_DefaultWarpExit';

export const SetMainCallback2 = (runtime: OptionMenuRuntime, callback: MainCallback | null): void => {
  runtime.gMain.callback2 = callback;
  runtime.log.push(`SetMainCallback2:${callback?.name ?? 'NULL'}`);
};

export const SetHelpContext = (runtime: OptionMenuRuntime, context: number): void => {
  runtime.log.push(`SetHelpContext:${context}`);
};

export function CB2_OptionsMenuFromStartMenu(runtime: OptionMenuRuntime): void {
  if (runtime.gMain.savedCallback === null) {
    runtime.gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu;
  }
  runtime.sOptionMenuPtr = {
    option: Array(MENUITEM_COUNT).fill(0),
    loadState: 0,
    loadPaletteState: 0,
    state: 0,
    cursorPos: 0
  };
  const menu = runtime.sOptionMenuPtr;
  menu.option[MENUITEM_TEXTSPEED] = runtime.gSaveBlock2Ptr.optionsTextSpeed;
  menu.option[MENUITEM_BATTLESCENE] = runtime.gSaveBlock2Ptr.optionsBattleSceneOff;
  menu.option[MENUITEM_BATTLESTYLE] = runtime.gSaveBlock2Ptr.optionsBattleStyle;
  menu.option[MENUITEM_SOUND] = runtime.gSaveBlock2Ptr.optionsSound;
  menu.option[MENUITEM_BUTTONMODE] = runtime.gSaveBlock2Ptr.optionsButtonMode;
  menu.option[MENUITEM_FRAMETYPE] = runtime.gSaveBlock2Ptr.optionsWindowFrameType;

  for (let i = 0; i < MENUITEM_COUNT - 1; i += 1) {
    if (menu.option[i] > sOptionMenuItemCounts[i] - 1) {
      menu.option[i] = 0;
    }
  }
  SetHelpContext(runtime, HELPCONTEXT_OPTIONS);
  SetMainCallback2(runtime, CB2_OptionMenu);
}

export const SetVBlankCallback = (runtime: OptionMenuRuntime, callback: MainCallback | null): void => {
  runtime.vblankCallback = callback;
  runtime.log.push(`SetVBlankCallback:${callback?.name ?? 'NULL'}`);
};

export const SetHBlankCallback = (runtime: OptionMenuRuntime, callback: MainCallback | null): void => {
  runtime.hblankCallback = callback;
  runtime.log.push(`SetHBlankCallback:${callback?.name ?? 'NULL'}`);
};

export function OptionMenu_InitCallbacks(runtime: OptionMenuRuntime): void {
  SetVBlankCallback(runtime, null);
  SetHBlankCallback(runtime, null);
}

export function VBlankCB_OptionMenu(runtime: OptionMenuRuntime): void {
  runtime.log.push('LoadOam');
  runtime.log.push('ProcessSpriteCopyRequests');
  runtime.log.push('TransferPlttBuffer');
}

export function OptionMenu_SetVBlankCallback(runtime: OptionMenuRuntime): void {
  SetVBlankCallback(runtime, VBlankCB_OptionMenu);
}

export const RunTasks = (runtime: OptionMenuRuntime): void => {
  runtime.log.push('RunTasks');
};

export const AnimateSprites = (runtime: OptionMenuRuntime): void => {
  runtime.log.push('AnimateSprites');
};

export const BuildOamBuffer = (runtime: OptionMenuRuntime): void => {
  runtime.log.push('BuildOamBuffer');
};

export const UpdatePaletteFade = (runtime: OptionMenuRuntime): void => {
  runtime.log.push('UpdatePaletteFade');
};

export function CB2_InitOptionMenu(runtime: OptionMenuRuntime): void {
  RunTasks(runtime);
  AnimateSprites(runtime);
  BuildOamBuffer(runtime);
  UpdatePaletteFade(runtime);
}

export function CB2_OptionMenu(runtime: OptionMenuRuntime): void {
  const menu = requireMenu(runtime);
  const state = menu.state;
  switch (state) {
    case 0:
      OptionMenu_InitCallbacks(runtime);
      break;
    case 1:
      InitOptionMenuBg(runtime);
      break;
    case 2:
      OptionMenu_ResetSpriteData(runtime);
      break;
    case 3:
      if (LoadOptionMenuPalette(runtime) !== true) {
        return;
      }
      break;
    case 4:
      PrintOptionMenuHeader(runtime);
      break;
    case 5:
      DrawOptionMenuBg(runtime);
      break;
    case 6:
      LoadOptionMenuItemNames(runtime);
      break;
    case 7:
      for (let i = 0; i < MENUITEM_COUNT; i += 1) {
        BufferOptionMenuString(runtime, i);
      }
      break;
    case 8:
      UpdateSettingSelectionDisplay(runtime, menu.cursorPos);
      break;
    case 9:
      OptionMenu_PickSwitchCancel(runtime);
      break;
    default:
      SetOptionMenuTask(runtime);
      break;
  }
  menu.state += 1;
}

export const CreateTask = (runtime: OptionMenuRuntime, func: TaskFunc, priority: number): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ func, priority, destroyed: false });
  runtime.log.push(`CreateTask:${func.name}:${priority}`);
  return id;
};

export function SetOptionMenuTask(runtime: OptionMenuRuntime): void {
  CreateTask(runtime, Task_OptionMenu, 0);
  SetMainCallback2(runtime, CB2_InitOptionMenu);
}

export const SetGpuReg = (runtime: OptionMenuRuntime, reg: number, value: number): void => {
  runtime.gpuRegs.set(reg, value & 0xffff);
  runtime.log.push(`SetGpuReg:${reg}:${value & 0xffff}`);
};

export function InitOptionMenuBg(runtime: OptionMenuRuntime): void {
  runtime.log.push('DmaClearLarge16:3:VRAM:VRAM_SIZE:4096');
  runtime.log.push('DmaClear32:3:OAM:OAM_SIZE');
  runtime.log.push('DmaClear16:3:PLTT:PLTT_SIZE');
  SetGpuReg(runtime, REG_OFFSET_DISPCNT, DISPCNT_MODE_0);
  runtime.log.push('ResetBgsAndClearDma3BusyFlags:0');
  runtime.log.push(`InitBgsFromTemplates:0:${sOptionMenuBgTemplates.length}`);
  for (let bg = 0; bg < 4; bg += 1) {
    runtime.log.push(`ChangeBgX:${bg}:0:0`);
    runtime.log.push(`ChangeBgY:${bg}:0:0`);
  }
  runtime.log.push(`InitWindows:${sOptionMenuWinTemplates.length}`);
  runtime.log.push('DeactivateAllTextPrinters');
  SetGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG0 | BLDCNT_EFFECT_BLEND | BLDCNT_EFFECT_LIGHTEN);
  SetGpuReg(runtime, REG_OFFSET_BLDY, BLDCNT_TGT1_BG1);
  SetGpuReg(runtime, REG_OFFSET_WININ, WININ_WIN0_BG0);
  SetGpuReg(runtime, REG_OFFSET_WINOUT, WINOUT_WIN01_BG0 | WINOUT_WIN01_BG1 | WINOUT_WIN01_BG2 | WINOUT_WIN01_CLR);
  SetGpuReg(runtime, REG_OFFSET_DISPCNT, DISPCNT_OBJ_1D_MAP | DISPCNT_OBJ_ON | DISPCNT_WIN0_ON);
  runtime.log.push('ShowBg:0');
  runtime.log.push('ShowBg:1');
  runtime.log.push('ShowBg:2');
}

export const GetStringWidth = (runtime: OptionMenuRuntime, font: number, text: string, letterSpacing: number): number =>
  runtime.stringWidths.get(text) ?? text.length * 8 + font + letterSpacing;

export const FillWindowPixelBuffer = (runtime: OptionMenuRuntime, windowId: number, value: number): void => {
  runtime.log.push(`FillWindowPixelBuffer:${windowId}:${value}`);
};

export const AddTextPrinterParameterized3 = (
  runtime: OptionMenuRuntime,
  windowId: number,
  font: number,
  x: number,
  y: number,
  colors: readonly number[],
  speed: number,
  text: string
): void => {
  runtime.log.push(`AddTextPrinterParameterized3:${windowId}:${font}:${x}:${y}:${colors.join(',')}:${speed}:${text}`);
};

export const PutWindowTilemap = (runtime: OptionMenuRuntime, windowId: number): void => {
  runtime.log.push(`PutWindowTilemap:${windowId}`);
};

export const CopyWindowToVram = (runtime: OptionMenuRuntime, windowId: number, mode: number): void => {
  runtime.log.push(`CopyWindowToVram:${windowId}:${mode}`);
};

export function OptionMenu_PickSwitchCancel(runtime: OptionMenuRuntime): void {
  const x = 0xe4 - GetStringWidth(runtime, FONT_SMALL, gText_PickSwitchCancel, 0);
  FillWindowPixelBuffer(runtime, 2, PIXEL_FILL(15));
  AddTextPrinterParameterized3(runtime, 2, FONT_SMALL, x, 0, sOptionMenuPickSwitchCancelTextColor, 0, gText_PickSwitchCancel);
  PutWindowTilemap(runtime, 2);
  CopyWindowToVram(runtime, 2, COPYWIN_FULL);
}

export function OptionMenu_ResetSpriteData(runtime: OptionMenuRuntime): void {
  runtime.log.push('ResetSpriteData');
  runtime.log.push('ResetPaletteFade');
  runtime.log.push('FreeAllSpritePalettes');
  runtime.log.push('ResetTasks');
  runtime.log.push('ScanlineEffect_Stop');
}

export const GetUserWindowGraphics = (frameType: number): { tiles: string; palette: string } => ({
  tiles: `windowTiles:${frameType}`,
  palette: `windowPalette:${frameType}`
});

export const GetTextWindowPalette = (id: number): string => `textWindowPalette:${id}`;

export const LoadBgTiles = (
  runtime: OptionMenuRuntime,
  bg: number,
  tiles: string,
  size: number,
  offset: number
): void => {
  runtime.log.push(`LoadBgTiles:${bg}:${tiles}:${size}:${offset}`);
};

export const LoadPalette = (runtime: OptionMenuRuntime, palette: string, offset: number, size: number): void => {
  runtime.log.push(`LoadPalette:${palette}:${offset}:${size}`);
};

export const LoadStdWindowGfxOnBg = (runtime: OptionMenuRuntime, bg: number, tile: number, palette: number): void => {
  runtime.log.push(`LoadStdWindowGfxOnBg:${bg}:${tile}:${palette}`);
};

export function LoadOptionMenuPalette(runtime: OptionMenuRuntime): boolean {
  const menu = requireMenu(runtime);
  switch (menu.loadPaletteState) {
    case 0:
      LoadBgTiles(runtime, 1, GetUserWindowGraphics(menu.option[MENUITEM_FRAMETYPE]).tiles, 0x120, 0x1aa);
      break;
    case 1:
      LoadPalette(runtime, GetUserWindowGraphics(menu.option[MENUITEM_FRAMETYPE]).palette, BG_PLTT_ID(2), 0x20);
      break;
    case 2:
      LoadPalette(runtime, sOptionMenuPalette, BG_PLTT_ID(1), 0x20);
      LoadPalette(runtime, GetTextWindowPalette(2), BG_PLTT_ID(15), 0x20);
      break;
    case 3:
      LoadStdWindowGfxOnBg(runtime, 1, 0x1b3, BG_PLTT_ID(3));
      break;
    default:
      return true;
  }
  menu.loadPaletteState += 1;
  return false;
}

export const BeginNormalPaletteFade = (
  runtime: OptionMenuRuntime,
  palettes: number,
  delay: number,
  start: number,
  end: number,
  color: number
): void => {
  runtime.log.push(`BeginNormalPaletteFade:${palettes}:${delay}:${start}:${end}:${color}`);
};

export const IsActiveOverworldLinkBusy = (runtime: OptionMenuRuntime): boolean => runtime.isActiveOverworldLinkBusy;

export function Task_OptionMenu(runtime: OptionMenuRuntime, taskId: number): void {
  const menu = requireMenu(runtime);
  switch (menu.loadState) {
    case 0:
      BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
      OptionMenu_SetVBlankCallback(runtime);
      menu.loadState += 1;
      break;
    case 1:
      if (runtime.gPaletteFade.active) {
        return;
      }
      menu.loadState += 1;
      break;
    case 2:
      if (IsActiveOverworldLinkBusy(runtime) === true) {
        break;
      }
      switch (OptionMenu_ProcessInput(runtime)) {
        case 0:
          break;
        case 1:
          menu.loadState += 1;
          break;
        case 2:
          LoadBgTiles(runtime, 1, GetUserWindowGraphics(menu.option[MENUITEM_FRAMETYPE]).tiles, 0x120, 0x1aa);
          LoadPalette(runtime, GetUserWindowGraphics(menu.option[MENUITEM_FRAMETYPE]).palette, BG_PLTT_ID(2), 0x20);
          BufferOptionMenuString(runtime, menu.cursorPos);
          break;
        case 3:
          UpdateSettingSelectionDisplay(runtime, menu.cursorPos);
          break;
        case 4:
          BufferOptionMenuString(runtime, menu.cursorPos);
          break;
      }
      break;
    case 3:
      BeginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
      menu.loadState += 1;
      break;
    case 4:
      if (runtime.gPaletteFade.active) {
        return;
      }
      menu.loadState += 1;
      break;
    case 5:
      CloseAndSaveOptionMenu(runtime, taskId);
      break;
  }
}

export function OptionMenu_ProcessInput(runtime: OptionMenuRuntime): number {
  const menu = requireMenu(runtime);
  if (joyRept(runtime, DPAD_RIGHT)) {
    const current = menu.option[menu.cursorPos];
    if (current === sOptionMenuItemCounts[menu.cursorPos] - 1) {
      menu.option[menu.cursorPos] = 0;
    } else {
      menu.option[menu.cursorPos] = current + 1;
    }
    if (menu.cursorPos === MENUITEM_FRAMETYPE) {
      return 2;
    } else {
      return 4;
    }
  } else if (joyRept(runtime, DPAD_LEFT)) {
    if (menu.option[menu.cursorPos] === 0) {
      menu.option[menu.cursorPos] = sOptionMenuItemCounts[menu.cursorPos] - 1;
    } else {
      menu.option[menu.cursorPos] -= 1;
    }

    if (menu.cursorPos === MENUITEM_FRAMETYPE) {
      return 2;
    } else {
      return 4;
    }
  } else if (joyRept(runtime, DPAD_UP)) {
    if (menu.cursorPos === MENUITEM_TEXTSPEED) {
      menu.cursorPos = MENUITEM_CANCEL;
    } else {
      menu.cursorPos -= 1;
    }
    return 3;
  } else if (joyRept(runtime, DPAD_DOWN)) {
    if (menu.cursorPos === MENUITEM_CANCEL) {
      menu.cursorPos = MENUITEM_TEXTSPEED;
    } else {
      menu.cursorPos += 1;
    }
    return 3;
  } else if (joyNew(runtime, B_BUTTON) || joyNew(runtime, A_BUTTON)) {
    return 1;
  } else {
    return 0;
  }
}

export const GetFontAttribute = (runtime: OptionMenuRuntime, font: number, attr: number): number =>
  runtime.fontAttributes.get(`${font}:${attr}`) ?? 0;

export const ConvertIntToDecimalStringN = (value: number, mode: number, n: number): string => {
  const text = String(value);
  return mode === 1 ? text.padStart(n, '0') : text;
};

export function BufferOptionMenuString(runtime: OptionMenuRuntime, selection: number): void {
  const menu = requireMenu(runtime);
  const dst = [...sOptionMenuTextColor];
  const x = 0x82;
  const y = (GetFontAttribute(runtime, FONT_NORMAL, FONTATTR_MAX_LETTER_HEIGHT) - 1) * selection + 2;
  runtime.log.push(`FillWindowPixelRect:1:1:${x}:${y}:70:${GetFontAttribute(runtime, FONT_NORMAL, FONTATTR_MAX_LETTER_HEIGHT)}`);

  switch (selection) {
    case MENUITEM_TEXTSPEED:
      AddTextPrinterParameterized3(runtime, 1, FONT_NORMAL, x, y, dst, -1, sTextSpeedOptions[menu.option[selection]]);
      break;
    case MENUITEM_BATTLESCENE:
      AddTextPrinterParameterized3(runtime, 1, FONT_NORMAL, x, y, dst, -1, sBattleSceneOptions[menu.option[selection]]);
      break;
    case MENUITEM_BATTLESTYLE:
      AddTextPrinterParameterized3(runtime, 1, FONT_NORMAL, x, y, dst, -1, sBattleStyleOptions[menu.option[selection]]);
      break;
    case MENUITEM_SOUND:
      AddTextPrinterParameterized3(runtime, 1, FONT_NORMAL, x, y, dst, -1, sSoundOptions[menu.option[selection]]);
      break;
    case MENUITEM_BUTTONMODE:
      AddTextPrinterParameterized3(runtime, 1, FONT_NORMAL, x, y, dst, -1, sButtonTypeOptions[menu.option[selection]]);
      break;
    case MENUITEM_FRAMETYPE: {
      const str = `${gText_FrameType}${ConvertIntToDecimalStringN(menu.option[selection] + 1, 1, 2)}`;
      AddTextPrinterParameterized3(runtime, 1, FONT_NORMAL, x, y, dst, -1, str);
      break;
    }
    default:
      break;
  }
  PutWindowTilemap(runtime, 1);
  CopyWindowToVram(runtime, 1, COPYWIN_FULL);
}

export const FreeAllWindowBuffers = (runtime: OptionMenuRuntime): void => {
  runtime.log.push('FreeAllWindowBuffers');
};

export const SetPokemonCryStereo = (runtime: OptionMenuRuntime, sound: number): void => {
  runtime.log.push(`SetPokemonCryStereo:${sound}`);
};

export const DestroyTask = (runtime: OptionMenuRuntime, taskId: number): void => {
  if (runtime.tasks[taskId]) {
    runtime.tasks[taskId].destroyed = true;
  }
  runtime.log.push(`DestroyTask:${taskId}`);
};

export function CloseAndSaveOptionMenu(runtime: OptionMenuRuntime, taskId: number): void {
  const menu = requireMenu(runtime);
  runtime.gFieldCallback = FieldCB_DefaultWarpExit;
  SetMainCallback2(runtime, runtime.gMain.savedCallback);
  FreeAllWindowBuffers(runtime);
  runtime.gSaveBlock2Ptr.optionsTextSpeed = menu.option[MENUITEM_TEXTSPEED];
  runtime.gSaveBlock2Ptr.optionsBattleSceneOff = menu.option[MENUITEM_BATTLESCENE];
  runtime.gSaveBlock2Ptr.optionsBattleStyle = menu.option[MENUITEM_BATTLESTYLE];
  runtime.gSaveBlock2Ptr.optionsSound = menu.option[MENUITEM_SOUND];
  runtime.gSaveBlock2Ptr.optionsButtonMode = menu.option[MENUITEM_BUTTONMODE];
  runtime.gSaveBlock2Ptr.optionsWindowFrameType = menu.option[MENUITEM_FRAMETYPE];
  SetPokemonCryStereo(runtime, runtime.gSaveBlock2Ptr.optionsSound);
  runtime.sOptionMenuPtr = null;
  DestroyTask(runtime, taskId);
}

export const AddTextPrinterParameterized = (
  runtime: OptionMenuRuntime,
  windowId: number,
  font: number,
  text: string,
  x: number,
  y: number,
  speed: number,
  callback: null
): void => {
  runtime.log.push(`AddTextPrinterParameterized:${windowId}:${font}:${text}:${x}:${y}:${speed}:${callback}`);
};

export function PrintOptionMenuHeader(runtime: OptionMenuRuntime): void {
  FillWindowPixelBuffer(runtime, 0, PIXEL_FILL(1));
  AddTextPrinterParameterized(runtime, WIN_TEXT_OPTION, FONT_NORMAL, gText_Option, 8, 1, TEXT_SKIP_DRAW, null);
  PutWindowTilemap(runtime, 0);
  CopyWindowToVram(runtime, 0, COPYWIN_FULL);
}

export const FillBgTilemapBufferRect = (
  runtime: OptionMenuRuntime,
  bg: number,
  tile: number,
  x: number,
  y: number,
  width: number,
  height: number,
  palette: number
): void => {
  runtime.log.push(`FillBgTilemapBufferRect:${bg}:${tile}:${x}:${y}:${width}:${height}:${palette}`);
};

export const CopyBgTilemapBufferToVram = (runtime: OptionMenuRuntime, bg: number): void => {
  runtime.log.push(`CopyBgTilemapBufferToVram:${bg}`);
};

export function DrawOptionMenuBg(runtime: OptionMenuRuntime): void {
  const h = 2;
  FillBgTilemapBufferRect(runtime, 1, 0x1b3, 1, 2, 1, 1, 3);
  FillBgTilemapBufferRect(runtime, 1, 0x1b4, 2, 2, 0x1b, 1, 3);
  FillBgTilemapBufferRect(runtime, 1, 0x1b5, 0x1c, 2, 1, 1, 3);
  FillBgTilemapBufferRect(runtime, 1, 0x1b6, 1, 3, 1, h, 3);
  FillBgTilemapBufferRect(runtime, 1, 0x1b8, 0x1c, 3, 1, h, 3);
  FillBgTilemapBufferRect(runtime, 1, 0x1b9, 1, 5, 1, 1, 3);
  FillBgTilemapBufferRect(runtime, 1, 0x1ba, 2, 5, 0x1b, 1, 3);
  FillBgTilemapBufferRect(runtime, 1, 0x1bb, 0x1c, 5, 1, 1, 3);
  FillBgTilemapBufferRect(runtime, 1, 0x1aa, 1, 6, 1, 1, h);
  FillBgTilemapBufferRect(runtime, 1, 0x1ab, 2, 6, 0x1a, 1, h);
  FillBgTilemapBufferRect(runtime, 1, 0x1ac, 0x1c, 6, 1, 1, h);
  FillBgTilemapBufferRect(runtime, 1, 0x1ad, 1, 7, 1, 0x10, h);
  FillBgTilemapBufferRect(runtime, 1, 0x1af, 0x1c, 7, 1, 0x10, h);
  FillBgTilemapBufferRect(runtime, 1, 0x1b0, 1, 0x13, 1, 1, h);
  FillBgTilemapBufferRect(runtime, 1, 0x1b1, 2, 0x13, 0x1a, 1, h);
  FillBgTilemapBufferRect(runtime, 1, 0x1b2, 0x1c, 0x13, 1, 1, h);
  CopyBgTilemapBufferToVram(runtime, 1);
}

export function LoadOptionMenuItemNames(runtime: OptionMenuRuntime): void {
  FillWindowPixelBuffer(runtime, 1, PIXEL_FILL(1));
  for (let i = 0; i < MENUITEM_COUNT; i += 1) {
    AddTextPrinterParameterized(
      runtime,
      WIN_OPTIONS,
      FONT_NORMAL,
      sOptionMenuItemsNames[i],
      8,
      i * GetFontAttribute(runtime, FONT_NORMAL, FONTATTR_MAX_LETTER_HEIGHT) + 2 - i,
      TEXT_SKIP_DRAW,
      null
    );
  }
}

export function UpdateSettingSelectionDisplay(runtime: OptionMenuRuntime, selection: number): void {
  const maxLetterHeight = GetFontAttribute(runtime, FONT_NORMAL, FONTATTR_MAX_LETTER_HEIGHT);
  const y = selection * (maxLetterHeight - 1) + 0x3a;
  SetGpuReg(runtime, REG_OFFSET_WIN0V, WIN_RANGE(y, y + maxLetterHeight));
  SetGpuReg(runtime, REG_OFFSET_WIN0H, WIN_RANGE(0x10, 0xe0));
}
