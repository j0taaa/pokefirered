import scriptMenuSourceRaw from '../../../src/script_menu.c?raw';
import menuConstantsSource from '../../../include/constants/menu.h?raw';
import seagallopConstantsSource from '../../../include/constants/seagallop.h?raw';
import {
  AddWindow,
  ClearStdWindowAndFrameToTransparent,
  DPAD_DOWN,
  DPAD_UP,
  FONT_NORMAL,
  FONT_NORMAL_COPY_1,
  GetFontAttribute,
  GetMenuCursorDimensionByFont,
  Menu_GetCursorPos,
  Menu_InitCursor,
  Menu_ProcessInput,
  Menu_ProcessInputGridLayout,
  Menu_ProcessInputNoWrapAround,
  Menu_ProcessInputNoWrapClearOnChoose,
  MENU_B_PRESSED,
  MENU_NOTHING_CHOSEN,
  MultichoiceGrid_InitCursor,
  MultichoiceGrid_PrintItems,
  MultichoiceList_PrintItems,
  RemoveWindow,
  SE_SELECT,
  SetWindowTemplateFields,
  createMenuRuntime,
  type MenuAction,
  type MenuRuntime
} from './decompMenu';

export const SCR_MENU_CANCEL = 127;
export const SCR_MENU_UNSET = 255;
export const SCRIPT_MENU_C_TRANSLATION_UNIT = 'src/script_menu.c';
export const MULTICHOICE_NONE = 255;
export const GFXTAG_FOSSIL = 7000;
export const FOSSIL_PIC_PAL_NUM = 13;
export const SPECIES_KABUTOPS = 141;
export const SPECIES_AERODACTYL = 142;
export const FLAG_SYS_POKEDEX_GET = 'FLAG_SYS_POKEDEX_GET';
export const FLAG_SYS_GAME_CLEAR = 'FLAG_SYS_GAME_CLEAR';
export const FLAG_SYS_NOT_SOMEONES_PC = 'FLAG_SYS_NOT_SOMEONES_PC';

export const MULTICHOICE_CONSTANTS = parseDefineConstants(menuConstantsSource, /^MULTICHOICE_[A-Z0-9_]+$/u);
export const STDSTRING_CONSTANTS = parseDefineConstants(menuConstantsSource, /^STDSTRING_[A-Z0-9_]+$/u);
export const SEAGALLOP_CONSTANTS = parseDefineConstants(seagallopConstantsSource, /^SEAGALLOP_[A-Z0-9_]+$/u);

export const SEAGALLOP_VERMILION_CITY = SEAGALLOP_CONSTANTS.SEAGALLOP_VERMILION_CITY;
export const SEAGALLOP_ONE_ISLAND = SEAGALLOP_CONSTANTS.SEAGALLOP_ONE_ISLAND;
export const SEAGALLOP_TWO_ISLAND = SEAGALLOP_CONSTANTS.SEAGALLOP_TWO_ISLAND;
export const SEAGALLOP_THREE_ISLAND = SEAGALLOP_CONSTANTS.SEAGALLOP_THREE_ISLAND;
export const SEAGALLOP_FOUR_ISLAND = SEAGALLOP_CONSTANTS.SEAGALLOP_FOUR_ISLAND;
export const SEAGALLOP_FIVE_ISLAND = SEAGALLOP_CONSTANTS.SEAGALLOP_FIVE_ISLAND;
export const SEAGALLOP_SIX_ISLAND = SEAGALLOP_CONSTANTS.SEAGALLOP_SIX_ISLAND;
export const SEAGALLOP_SEVEN_ISLAND = SEAGALLOP_CONSTANTS.SEAGALLOP_SEVEN_ISLAND;
export const SEAGALLOP_MORE = SEAGALLOP_CONSTANTS.SEAGALLOP_MORE;

const scriptMenuSource = preprocessScriptMenuSource(scriptMenuSourceRaw);

export interface ParsedMultichoiceList {
  symbol: string;
  items: readonly MenuAction[];
}

export interface ParsedMultichoiceTableEntry {
  id: number;
  constant: string;
  listSymbol: string;
  count: number;
  items: readonly MenuAction[];
}

export interface ScriptMenuWindow {
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;
  removed: boolean;
}

export interface ScriptMenuTask {
  id: number;
  func: ScriptMenuTaskFunc;
  priority: number;
  data: number[];
  destroyed: boolean;
}

export type ScriptMenuTaskFunc =
  | 'Task_MultichoiceMenu_HandleInput'
  | 'Task_YesNoMenu_HandleInput'
  | 'Hask_MultichoiceGridMenu_HandleInput'
  | 'Task_ScriptShowMonPic'
  | 'Task_WaitMuseumFossilPic';

export interface ScriptMenuSprite {
  id: number;
  kind: 'mon' | 'fossil';
  species: number | string;
  x: number;
  y: number;
  priority: number;
  paletteNum: number;
  destroyed: boolean;
}

export interface ScriptMenuRuntime {
  menu: MenuRuntime;
  gSpecialVar_Result: number;
  gSpecialVar_0x8004: number;
  gSpecialVar_0x8005: number;
  gSpecialVar_0x8006: number;
  sDelay: number;
  paletteFadeActive: boolean;
  questLogAvoidDisplay: boolean;
  scriptContextEnabled: boolean;
  scriptContextScript: string | null;
  flags: Set<string>;
  playerName: string;
  tasks: ScriptMenuTask[];
  windows: ScriptMenuWindow[];
  sprites: ScriptMenuSprite[];
  loadedFossilSheet: 'kabutops' | 'aerodactyl' | null;
  operations: string[];
}

export const sMultichoiceListBySymbol: ReadonlyMap<string, ParsedMultichoiceList> = parseMenuActionLists(scriptMenuSource);
export const sMultichoiceLists: readonly ParsedMultichoiceTableEntry[] = parseMultichoiceLists(scriptMenuSource, sMultichoiceListBySymbol);
export const gStdStringPtrs: ReadonlyMap<number, string> = parseStdStringPtrs(scriptMenuSource);

const descriptionPtrsCableClub = [
  'CableClub_Text_TradeMonsUsingLinkCable',
  'CableClub_Text_BattleUsingLinkCable',
  'CableClub_Text_CancelSelectedItem'
] as const;
const descriptionPtrsWirelessCrush = [
  'CableClub_Text_YouMayTradeHere',
  'CableClub_Text_YouMayBattleHere',
  'CableClub_Text_CanMakeBerryPowder',
  'CableClub_Text_CancelSelectedItem'
] as const;
const descriptionPtrsWireless = [
  'CableClub_Text_YouMayTradeHere',
  'CableClub_Text_YouMayBattleHere',
  'CableClub_Text_CancelSelectedItem'
] as const;
const seagallopDestStrings = [
  'gText_Vermilion',
  'gText_OneIsland',
  'gText_TwoIsland',
  'gText_ThreeIsland',
  'gText_FourIsland',
  'gText_FiveIsland',
  'gText_SixIsland',
  'gText_SevenIsland'
] as const;

export const createScriptMenuRuntime = (): ScriptMenuRuntime => ({
  menu: createMenuRuntime(),
  gSpecialVar_Result: SCR_MENU_UNSET,
  gSpecialVar_0x8004: 0,
  gSpecialVar_0x8005: 0,
  gSpecialVar_0x8006: 0,
  sDelay: 0,
  paletteFadeActive: false,
  questLogAvoidDisplay: false,
  scriptContextEnabled: false,
  scriptContextScript: null,
  flags: new Set(),
  playerName: 'PLAYER',
  tasks: [],
  windows: [],
  sprites: [],
  loadedFossilSheet: null,
  operations: []
});

export const IsScriptActive = (runtime: ScriptMenuRuntime): boolean =>
  runtime.gSpecialVar_Result !== SCR_MENU_UNSET;

export function GetStringTilesWide(runtime: ScriptMenuRuntime, str: string): number {
  return Math.trunc((getStringWidth(runtime, str) + 7) / 8);
}

export function GetMenuWidthFromList(runtime: ScriptMenuRuntime, items: readonly MenuAction[], count: number): number {
  let width = GetStringTilesWide(runtime, items[0]?.text ?? '');
  for (let i = 1; i < count; i += 1) {
    const tmp = GetStringTilesWide(runtime, items[i].text);
    if (width < tmp) width = tmp;
  }
  return width;
}

export function ScriptMenu_Multichoice(runtime: ScriptMenuRuntime, left: number, top: number, mcId: number, ignoreBpress: number): boolean {
  if (FuncIsActiveTask(runtime, 'Task_MultichoiceMenu_HandleInput')) return false;
  runtime.gSpecialVar_Result = SCR_MENU_UNSET;
  DrawVerticalMultichoiceMenu(runtime, left, top, mcId, ignoreBpress, 0);
  return true;
}

export function ScriptMenu_MultichoiceWithDefault(runtime: ScriptMenuRuntime, left: number, top: number, mcId: number, ignoreBpress: number, cursorPos: number): boolean {
  if (FuncIsActiveTask(runtime, 'Task_MultichoiceMenu_HandleInput')) return false;
  runtime.gSpecialVar_Result = SCR_MENU_UNSET;
  DrawVerticalMultichoiceMenu(runtime, left, top, mcId, ignoreBpress, cursorPos);
  return true;
}

export function DrawVerticalMultichoiceMenu(runtime: ScriptMenuRuntime, left: number, top: number, mcId: number, ignoreBpress: number, initPos: number): void {
  if ((ignoreBpress & 2) || QL_AvoidDisplay(runtime) !== true) {
    ignoreBpress &= 1;
    const entry = getMultichoiceEntry(mcId);
    let strWidth = 0;
    for (let i = 0; i < entry.count; i += 1) {
      const tmp = getStringWidth(runtime, entry.items[i].text);
      if (tmp > strWidth) strWidth = tmp;
    }
    const width = Math.trunc((strWidth + 9) / 8) + 1;
    if (left + width > 28) left = 28 - width;
    const height = GetMCWindowHeight(entry.count);
    const windowId = CreateWindowFromRect(runtime, left, top, width, height);
    SetStdWindowBorderStyle(runtime, windowId, false);
    MultichoiceList_PrintItems(runtime.menu, windowId, FONT_NORMAL, 8, 2, 14, entry.count, [...entry.items], 0, 2);
    Menu_InitCursor(runtime.menu, windowId, FONT_NORMAL, 0, 2, 14, entry.count, initPos);
    CreateMCMenuInputHandlerTask(runtime, ignoreBpress, entry.count, windowId, mcId);
    ScheduleBgCopyTilemapToVram(runtime, 0);
  }
}

export function GetMCWindowHeight(count: number): number {
  switch (count) {
    case 0: return 1;
    case 1: return 2;
    case 2: return 4;
    case 3: return 6;
    case 4: return 7;
    case 5: return 9;
    case 6: return 11;
    case 7: return 13;
    case 8: return 14;
    default: return 1;
  }
}

export function CreateMCMenuInputHandlerTask(runtime: ScriptMenuRuntime, ignoreBpress: number, count: number, windowId: number, mcId: number): number {
  if (
    mcId === MULTICHOICE_CONSTANTS.MULTICHOICE_TRADE_CENTER_COLOSSEUM
    || mcId === MULTICHOICE_CONSTANTS.MULTICHOICE_TRADE_COLOSSEUM_CRUSH
    || mcId === MULTICHOICE_CONSTANTS.MULTICHOICE_TRADE_COLOSSEUM_2
  ) {
    runtime.sDelay = 12;
  } else {
    runtime.sDelay = 0;
  }
  const taskId = CreateTask(runtime, 'Task_MultichoiceMenu_HandleInput', 80);
  const task = getTask(runtime, taskId);
  task.data[4] = ignoreBpress;
  task.data[5] = count > 3 ? 1 : 0;
  task.data[6] = windowId;
  task.data[7] = mcId;
  MultiChoicePrintHelpDescription(runtime, mcId);
  return taskId;
}

export function Task_MultichoiceMenu_HandleInput(runtime: ScriptMenuRuntime, taskId: number): void {
  const task = getTask(runtime, taskId);
  if (!runtime.paletteFadeActive) {
    if (runtime.sDelay !== 0) {
      runtime.sDelay -= 1;
    } else {
      const input = task.data[5] === 0 ? Menu_ProcessInputNoWrapAround(runtime.menu) : Menu_ProcessInput(runtime.menu);
      if ((runtime.menu.newKeys & (DPAD_UP | DPAD_DOWN)) !== 0) MultiChoicePrintHelpDescription(runtime, task.data[7]);
      switch (input) {
        case MENU_NOTHING_CHOSEN:
          return;
        case MENU_B_PRESSED:
          if (task.data[4]) return;
          PlaySE(runtime, SE_SELECT);
          runtime.gSpecialVar_Result = SCR_MENU_CANCEL;
          break;
        default:
          runtime.gSpecialVar_Result = input;
          break;
      }
      DestroyScriptMenuWindow(runtime, task.data[6]);
      DestroyTask(runtime, taskId);
      ScriptContext_Enable(runtime);
    }
  }
}

export function MultiChoicePrintHelpDescription(runtime: ScriptMenuRuntime, mcId: number): void {
  const cursor = Menu_GetCursorPos(runtime.menu);
  switch (mcId) {
    case MULTICHOICE_CONSTANTS.MULTICHOICE_TRADE_CENTER_COLOSSEUM:
      runtime.operations.push(`FillWindowPixelBuffer:0:1`);
      runtime.operations.push(`AddTextPrinterParameterized2:0:${descriptionPtrsCableClub[cursor]}`);
      break;
    case MULTICHOICE_CONSTANTS.MULTICHOICE_TRADE_COLOSSEUM_CRUSH:
      runtime.operations.push(`FillWindowPixelBuffer:0:1`);
      runtime.operations.push(`AddTextPrinterParameterized2:0:${descriptionPtrsWirelessCrush[cursor]}`);
      break;
    case MULTICHOICE_CONSTANTS.MULTICHOICE_TRADE_COLOSSEUM_2:
      runtime.operations.push(`FillWindowPixelBuffer:0:1`);
      runtime.operations.push(`AddTextPrinterParameterized2:0:${descriptionPtrsWireless[cursor]}`);
      break;
  }
}

export function ScriptMenu_YesNo(runtime: ScriptMenuRuntime, _unused: number, _stuff: number): boolean {
  if (FuncIsActiveTask(runtime, 'Task_YesNoMenu_HandleInput')) return false;
  runtime.gSpecialVar_Result = SCR_MENU_UNSET;
  if (QL_AvoidDisplay(runtime)) return true;
  DisplayYesNoMenuDefaultYes(runtime);
  CreateTask(runtime, 'Task_YesNoMenu_HandleInput', 80);
  return true;
}

export function Task_YesNoMenu_HandleInput(runtime: ScriptMenuRuntime, taskId: number): void {
  const task = getTask(runtime, taskId);
  if (task.data[2] < 5) {
    task.data[2] += 1;
  } else {
    const input = Menu_ProcessInputNoWrapClearOnChoose(runtime.menu);
    switch (input) {
      case MENU_NOTHING_CHOSEN:
        return;
      case MENU_B_PRESSED:
      case 1:
        PlaySE(runtime, SE_SELECT);
        runtime.gSpecialVar_Result = 0;
        break;
      case 0:
        runtime.gSpecialVar_Result = 1;
        break;
    }
    DestroyTask(runtime, taskId);
    ScriptContext_Enable(runtime);
  }
}

export function ScriptMenu_MultichoiceGrid(runtime: ScriptMenuRuntime, left: number, top: number, multichoiceId: number, ignoreBpress: number, columnCount: number): boolean {
  if (FuncIsActiveTask(runtime, 'Hask_MultichoiceGridMenu_HandleInput')) return false;
  runtime.gSpecialVar_Result = SCR_MENU_UNSET;
  if (QL_AvoidDisplay(runtime) === true) return true;
  const entry = getMultichoiceEntry(multichoiceId);
  const width = GetMenuWidthFromList(runtime, entry.items, entry.count) + 1;
  const rowCount = Math.trunc(entry.count / columnCount);
  const taskId = CreateTask(runtime, 'Hask_MultichoiceGridMenu_HandleInput', 80);
  const task = getTask(runtime, taskId);
  task.data[4] = ignoreBpress;
  task.data[6] = CreateWindowFromRect(runtime, left, top, width * columnCount, rowCount * 2);
  SetStdWindowBorderStyle(runtime, task.data[6], false);
  MultichoiceGrid_PrintItems(runtime.menu, task.data[6], FONT_NORMAL_COPY_1, width * 8, 16, columnCount, rowCount, [...entry.items]);
  MultichoiceGrid_InitCursor(runtime.menu, task.data[6], FONT_NORMAL_COPY_1, 0, 1, width * 8, columnCount, rowCount, 0);
  ScheduleBgCopyTilemapToVram(runtime, 0);
  return true;
}

export function Hask_MultichoiceGridMenu_HandleInput(runtime: ScriptMenuRuntime, taskId: number): void {
  const task = getTask(runtime, taskId);
  const input = Menu_ProcessInputGridLayout(runtime.menu);
  switch (input) {
    case MENU_NOTHING_CHOSEN:
      return;
    case MENU_B_PRESSED:
      if (task.data[4]) return;
      PlaySE(runtime, SE_SELECT);
      runtime.gSpecialVar_Result = SCR_MENU_CANCEL;
      break;
    default:
      runtime.gSpecialVar_Result = input;
      break;
  }
  DestroyScriptMenuWindow(runtime, task.data[6]);
  DestroyTask(runtime, taskId);
  ScriptContext_Enable(runtime);
}

export function CreatePCMenu(runtime: ScriptMenuRuntime): boolean {
  if (FuncIsActiveTask(runtime, 'Task_MultichoiceMenu_HandleInput')) return false;
  runtime.gSpecialVar_Result = SCR_MENU_UNSET;
  CreatePCMenuWindow(runtime);
  return true;
}

export function CreatePCMenuWindow(runtime: ScriptMenuRuntime): void {
  const cursorWidth = GetMenuCursorDimensionByFont(runtime.menu, FONT_NORMAL, 0);
  let windowWidth: number;
  const spcTilesWide = GetStringTilesWide(runtime, 'gText_SPc');
  switch (spcTilesWide) {
    default:
      windowWidth = FlagGet(runtime, FLAG_SYS_POKEDEX_GET) ? 14 : 13;
      break;
    case 9:
    case 10:
      windowWidth = 14;
      break;
  }
  let numItems: number;
  let windowId: number;
  if (FlagGet(runtime, FLAG_SYS_GAME_CLEAR)) {
    numItems = 5;
    windowId = CreateWindowFromRect(runtime, 0, 0, windowWidth, 10);
    SetStdWindowBorderStyle(runtime, windowId, false);
    AddTextPrinterParameterized(runtime, windowId, 'gText_ProfOakSPc', cursorWidth, 34);
    AddTextPrinterParameterized(runtime, windowId, 'gText_HallOfFame_2', cursorWidth, 50);
    AddTextPrinterParameterized(runtime, windowId, 'gText_LogOff', cursorWidth, 66);
  } else {
    numItems = FlagGet(runtime, FLAG_SYS_POKEDEX_GET) ? 4 : 3;
    windowId = CreateWindowFromRect(runtime, 0, 0, windowWidth, numItems * 2);
    SetStdWindowBorderStyle(runtime, windowId, false);
    if (FlagGet(runtime, FLAG_SYS_POKEDEX_GET)) AddTextPrinterParameterized(runtime, windowId, 'gText_ProfOakSPc', cursorWidth, 34);
    AddTextPrinterParameterized(runtime, windowId, 'gText_LogOff', cursorWidth, 2 + 16 * (numItems - 1));
  }
  AddTextPrinterParameterized(runtime, windowId, FlagGet(runtime, FLAG_SYS_NOT_SOMEONES_PC) ? 'gText_BillSPc' : 'gText_SomeoneSPc', cursorWidth, 2);
  AddTextPrinterParameterized(runtime, windowId, `StringExpandPlaceholders:${runtime.playerName}:gText_SPc`, cursorWidth, 18);
  Menu_InitCursor(runtime.menu, windowId, FONT_NORMAL, 0, 2, 16, numItems, 0);
  CreateMCMenuInputHandlerTask(runtime, 0, numItems, windowId, MULTICHOICE_NONE);
  ScheduleBgCopyTilemapToVram(runtime, 0);
}

export function ScriptMenu_DisplayPCStartupPrompt(runtime: ScriptMenuRuntime): void {
  runtime.operations.push('LoadMessageBoxAndFrameGfx:0:true');
  runtime.operations.push('AddTextPrinterParameterized2:0:Text_AccessWhichPC');
}

export function Task_ScriptShowMonPic(runtime: ScriptMenuRuntime, taskId: number): void {
  const task = getTask(runtime, taskId);
  switch (task.data[0]) {
    case 0:
      task.data[0] += 1;
      break;
    case 1:
      break;
    case 2:
      FreeResourcesAndDestroySprite(runtime, task.data[2]);
      task.data[0] += 1;
      break;
    case 3:
      DestroyScriptMenuWindow(runtime, task.data[5]);
      DestroyTask(runtime, taskId);
      break;
  }
}

export function ScriptMenu_ShowPokemonPic(runtime: ScriptMenuRuntime, species: number, x: number, y: number): boolean {
  if (QL_AvoidDisplay(runtime) === true) return true;
  if (FindTaskIdByFunc(runtime, 'Task_ScriptShowMonPic') !== -1) return false;
  const spriteId = CreateMonSprite_PicBox(runtime, species, 8 * x + 40, 8 * y + 40);
  const taskId = CreateTask(runtime, 'Task_ScriptShowMonPic', 80);
  const task = getTask(runtime, taskId);
  task.data[5] = CreateWindowFromRect(runtime, x, y, 8, 8);
  task.data[0] = 0;
  task.data[1] = species;
  task.data[2] = spriteId;
  SetStdWindowBorderStyle(runtime, task.data[5], true);
  ScheduleBgCopyTilemapToVram(runtime, 0);
  return true;
}

export function ScriptMenu_HidePokemonPic(runtime: ScriptMenuRuntime): (() => boolean) | null {
  const taskId = FindTaskIdByFunc(runtime, 'Task_ScriptShowMonPic');
  if (taskId === -1) return null;
  getTask(runtime, taskId).data[0] += 1;
  return () => PicboxWait(runtime);
}

export function PicboxWait(runtime: ScriptMenuRuntime): boolean {
  return FindTaskIdByFunc(runtime, 'Task_ScriptShowMonPic') === -1;
}

export function PicboxCancel(runtime: ScriptMenuRuntime): void {
  const taskId = FindTaskIdByFunc(runtime, 'Task_ScriptShowMonPic');
  if (taskId !== -1) {
    const task = getTask(runtime, taskId);
    switch (task.data[0]) {
      case 0:
      case 1:
      case 2:
        FreeResourcesAndDestroySprite(runtime, task.data[2]);
        DestroyScriptMenuWindow(runtime, task.data[5]);
        DestroyTask(runtime, taskId);
        break;
      case 3:
        DestroyScriptMenuWindow(runtime, task.data[5]);
        DestroyTask(runtime, taskId);
        break;
    }
  }
}

export function Task_WaitMuseumFossilPic(runtime: ScriptMenuRuntime, taskId: number): void {
  const task = getTask(runtime, taskId);
  switch (task.data[0]) {
    case 0:
      task.data[0] += 1;
      break;
    case 1:
      break;
    case 2:
      DestroySprite(runtime, task.data[2]);
      FreeSpriteTilesByTag(runtime, GFXTAG_FOSSIL);
      task.data[0] += 1;
      break;
    case 3:
      DestroyScriptMenuWindow(runtime, task.data[5]);
      DestroyTask(runtime, taskId);
      break;
  }
}

export function OpenMuseumFossilPic(runtime: ScriptMenuRuntime): boolean {
  if (QL_AvoidDisplay(runtime) === true) return true;
  if (FindTaskIdByFunc(runtime, 'Task_WaitMuseumFossilPic') !== -1) return false;
  if (runtime.gSpecialVar_0x8004 === SPECIES_KABUTOPS) {
    runtime.loadedFossilSheet = 'kabutops';
    runtime.operations.push('LoadSpriteSheets:sMuseumKabutopsSprSheets');
    runtime.operations.push(`LoadPalette:sMuseumKabutopsSprPalette:${FOSSIL_PIC_PAL_NUM}`);
  } else if (runtime.gSpecialVar_0x8004 === SPECIES_AERODACTYL) {
    runtime.loadedFossilSheet = 'aerodactyl';
    runtime.operations.push('LoadSpriteSheets:sMuseumAerodactylSprSheets');
    runtime.operations.push(`LoadPalette:sMuseumAerodactylSprPalette:${FOSSIL_PIC_PAL_NUM}`);
  } else {
    return false;
  }
  const spriteId = CreateSprite(runtime, runtime.gSpecialVar_0x8005 * 8 + 40, runtime.gSpecialVar_0x8006 * 8 + 40);
  runtime.sprites[spriteId].paletteNum = FOSSIL_PIC_PAL_NUM;
  const taskId = CreateTask(runtime, 'Task_WaitMuseumFossilPic', 80);
  const task = getTask(runtime, taskId);
  task.data[5] = CreateWindowFromRect(runtime, runtime.gSpecialVar_0x8005, runtime.gSpecialVar_0x8006, 8, 8);
  task.data[0] = 0;
  task.data[2] = spriteId;
  SetStdWindowBorderStyle(runtime, task.data[5], true);
  ScheduleBgCopyTilemapToVram(runtime, 0);
  return true;
}

export function CloseMuseumFossilPic(runtime: ScriptMenuRuntime): boolean {
  const taskId = FindTaskIdByFunc(runtime, 'Task_WaitMuseumFossilPic');
  if (taskId === -1) return false;
  getTask(runtime, taskId).data[0] += 1;
  return true;
}

export function CreateWindowFromRect(runtime: ScriptMenuRuntime, left: number, top: number, width: number, height: number): number {
  const template = SetWindowTemplateFields(0, left + 1, top + 1, width, height, 15, 0x038);
  const windowId = AddWindow(runtime.menu, template);
  runtime.windows.push({ id: windowId, left, top, width, height, removed: false });
  runtime.operations.push(`PutWindowTilemap:${windowId}`);
  return windowId;
}

export function DestroyScriptMenuWindow(runtime: ScriptMenuRuntime, windowId: number): void {
  runtime.operations.push(`ClearWindowTilemap:${windowId}`);
  ClearStdWindowAndFrameToTransparent(runtime.menu, windowId, true);
  RemoveWindow(runtime.menu, windowId);
  const window = runtime.windows.find((candidate) => candidate.id === windowId);
  if (window) window.removed = true;
}

export function QL_DestroyAbortedDisplay(runtime: ScriptMenuRuntime): void {
  ScriptContext_SetupScript(runtime, 'EventScript_ReleaseEnd');
  let taskId = FindTaskIdByFunc(runtime, 'Task_ScriptShowMonPic');
  if (taskId !== -1) {
    const task = getTask(runtime, taskId);
    if (task.data[0] < 2) FreeResourcesAndDestroySprite(runtime, task.data[2]);
  }
  taskId = FindTaskIdByFunc(runtime, 'Task_WaitMuseumFossilPic');
  if (taskId !== -1) {
    const task = getTask(runtime, taskId);
    if (task.data[0] < 2) {
      DestroySprite(runtime, task.data[2]);
      FreeSpriteTilesByTag(runtime, GFXTAG_FOSSIL);
    }
  }
}

export function DrawSeagallopDestinationMenu(runtime: ScriptMenuRuntime): void {
  runtime.gSpecialVar_Result = SCR_MENU_UNSET;
  if (QL_AvoidDisplay(runtime) === true) return;
  let destinationId: number;
  let top: number;
  let numItems: number;
  if (runtime.gSpecialVar_0x8005 === 1) {
    destinationId = runtime.gSpecialVar_0x8004 < SEAGALLOP_FIVE_ISLAND ? SEAGALLOP_FIVE_ISLAND : SEAGALLOP_FOUR_ISLAND;
    numItems = 5;
    top = 2;
  } else {
    destinationId = SEAGALLOP_VERMILION_CITY;
    numItems = 6;
    top = 0;
  }
  const cursorWidth = GetMenuCursorDimensionByFont(runtime.menu, FONT_NORMAL, 0);
  const windowId = CreateWindowFromRect(runtime, 17, top, 11, numItems * 2);
  SetStdWindowBorderStyle(runtime, windowId, false);
  let i = 0;
  for (; i < numItems - 2; i += 1) {
    if (destinationId !== runtime.gSpecialVar_0x8004) {
      AddTextPrinterParameterized(runtime, windowId, seagallopDestStrings[destinationId], cursorWidth, i * 16 + 2);
    } else {
      i -= 1;
    }
    destinationId += 1;
    if (destinationId === SEAGALLOP_SEVEN_ISLAND + 1) destinationId = SEAGALLOP_VERMILION_CITY;
  }
  AddTextPrinterParameterized(runtime, windowId, 'gText_Other', cursorWidth, i * 16 + 2);
  i += 1;
  AddTextPrinterParameterized(runtime, windowId, 'gOtherText_Exit', cursorWidth, i * 16 + 2);
  Menu_InitCursor(runtime.menu, windowId, FONT_NORMAL, 0, 2, 16, numItems, 0);
  CreateMCMenuInputHandlerTask(runtime, 0, numItems, windowId, MULTICHOICE_NONE);
  ScheduleBgCopyTilemapToVram(runtime, 0);
}

export function GetSelectedSeagallopDestination(runtime: ScriptMenuRuntime): number {
  if (runtime.gSpecialVar_Result === SCR_MENU_CANCEL) return SCR_MENU_CANCEL;
  if (runtime.gSpecialVar_0x8005 === 1) {
    if (runtime.gSpecialVar_Result === 3) return SEAGALLOP_MORE;
    if (runtime.gSpecialVar_Result === 4) return SCR_MENU_CANCEL;
    if (runtime.gSpecialVar_Result === 0) return runtime.gSpecialVar_0x8004 > SEAGALLOP_FOUR_ISLAND ? SEAGALLOP_FOUR_ISLAND : SEAGALLOP_FIVE_ISLAND;
    if (runtime.gSpecialVar_Result === 1) return runtime.gSpecialVar_0x8004 > SEAGALLOP_FIVE_ISLAND ? SEAGALLOP_FIVE_ISLAND : SEAGALLOP_SIX_ISLAND;
    if (runtime.gSpecialVar_Result === 2) return runtime.gSpecialVar_0x8004 > SEAGALLOP_SIX_ISLAND ? SEAGALLOP_SIX_ISLAND : SEAGALLOP_SEVEN_ISLAND;
  } else {
    if (runtime.gSpecialVar_Result === 4) return SEAGALLOP_MORE;
    if (runtime.gSpecialVar_Result === 5) return SCR_MENU_CANCEL;
    if (runtime.gSpecialVar_Result >= runtime.gSpecialVar_0x8004) return runtime.gSpecialVar_Result + 1;
    return runtime.gSpecialVar_Result;
  }
  return SEAGALLOP_VERMILION_CITY;
}

export function tickScriptMenuTask(runtime: ScriptMenuRuntime, taskId: number): void {
  const task = getTask(runtime, taskId);
  if (task.destroyed) return;
  switch (task.func) {
    case 'Task_MultichoiceMenu_HandleInput':
      Task_MultichoiceMenu_HandleInput(runtime, taskId);
      break;
    case 'Task_YesNoMenu_HandleInput':
      Task_YesNoMenu_HandleInput(runtime, taskId);
      break;
    case 'Hask_MultichoiceGridMenu_HandleInput':
      Hask_MultichoiceGridMenu_HandleInput(runtime, taskId);
      break;
    case 'Task_ScriptShowMonPic':
      Task_ScriptShowMonPic(runtime, taskId);
      break;
    case 'Task_WaitMuseumFossilPic':
      Task_WaitMuseumFossilPic(runtime, taskId);
      break;
  }
}

function preprocessScriptMenuSource(source: string): string {
  return source
    .replace(/#if defined\(FIRERED\)([\s\S]*?)#elif defined\(LEAFGREEN\)[\s\S]*?#endif/gu, '$1')
    .replace(/#if REVISION >= 0xA[\s\S]*?#else([\s\S]*?)#endif/gu, '$1');
}

export function parseDefineConstants(source: string, namePattern: RegExp): Record<string, number> {
  const constants: Record<string, number> = {};
  for (const [, name, value] of source.matchAll(/^#define\s+([A-Z0-9_]+)\s+([()A-Z0-9_+\-\sx]+)$/gmu)) {
    if (!namePattern.test(name)) continue;
    const normalized = value.replace(/[()]/gu, '').trim();
    if (normalized.includes('+')) {
      const [left, right] = normalized.split('+').map((part) => part.trim());
      constants[name] = (constants[left] ?? 0) + readNumericLiteral(right);
    } else {
      constants[name] = readNumericLiteral(normalized);
    }
  }
  return constants;
}

function parseMenuActionLists(source: string): Map<string, ParsedMultichoiceList> {
  const lists = new Map<string, ParsedMultichoiceList>();
  const declarationRegex = /static const struct MenuAction (sMultichoiceList_[A-Za-z0-9_]+)\[\] = \{/gu;
  for (const match of source.matchAll(declarationRegex)) {
    const openBraceIndex = match.index + match[0].lastIndexOf('{');
    const closeBraceIndex = findMatchingBrace(source, openBraceIndex);
    const body = source.slice(openBraceIndex + 1, closeBraceIndex);
    const items = [...body.matchAll(/\{\s*([A-Za-z0-9_]+)\s*\}/gu)].map(([, text]) => ({ text }));
    lists.set(match[1], { symbol: match[1], items });
  }
  return lists;
}

function parseMultichoiceLists(source: string, listsBySymbol: ReadonlyMap<string, ParsedMultichoiceList>): ParsedMultichoiceTableEntry[] {
  const body = source.match(/static const struct MultichoiceListStruct sMultichoiceLists\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\[(MULTICHOICE_[A-Z0-9_]+)\]\s*=\s*MULTICHOICE\((sMultichoiceList_[A-Za-z0-9_]+)\)/gu)].map(([, constant, listSymbol]) => {
    const list = listsBySymbol.get(listSymbol);
    if (!list) throw new Error(`Missing multichoice list ${listSymbol}`);
    return {
      id: MULTICHOICE_CONSTANTS[constant],
      constant,
      listSymbol,
      count: list.items.length,
      items: list.items
    };
  }).sort((left, right) => left.id - right.id);
}

function parseStdStringPtrs(source: string): Map<number, string> {
  const body = source.match(/const u8 \*const gStdStringPtrs\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  const ptrs = new Map<number, string>();
  for (const [, constant, text] of body.matchAll(/\[(STDSTRING_[A-Z0-9_]+)\]\s*=\s*([A-Za-z0-9_]+)/gu)) {
    ptrs.set(STDSTRING_CONSTANTS[constant], text);
  }
  return ptrs;
}

function findMatchingBrace(source: string, openBraceIndex: number): number {
  let depth = 0;
  for (let i = openBraceIndex; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`Could not find matching brace at ${openBraceIndex}`);
}

function readNumericLiteral(value: string): number {
  if (value.startsWith('0x')) return Number.parseInt(value, 16);
  return Number.parseInt(value, 10);
}

function getMultichoiceEntry(mcId: number): ParsedMultichoiceTableEntry {
  const entry = sMultichoiceLists.find((candidate) => candidate.id === mcId);
  if (!entry) throw new Error(`Missing multichoice id ${mcId}`);
  return entry;
}

function getStringWidth(runtime: ScriptMenuRuntime, str: string): number {
  return str.length * GetFontAttribute(runtime.menu, FONT_NORMAL, 0);
}

function QL_AvoidDisplay(runtime: ScriptMenuRuntime): boolean {
  if (runtime.questLogAvoidDisplay) QL_DestroyAbortedDisplay(runtime);
  return runtime.questLogAvoidDisplay;
}

function CreateTask(runtime: ScriptMenuRuntime, func: ScriptMenuTaskFunc, priority: number): number {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, func, priority, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.operations.push(`CreateTask:${id}:${func}:${priority}`);
  return id;
}

function DestroyTask(runtime: ScriptMenuRuntime, taskId: number): void {
  getTask(runtime, taskId).destroyed = true;
  runtime.operations.push(`DestroyTask:${taskId}`);
}

function getTask(runtime: ScriptMenuRuntime, taskId: number): ScriptMenuTask {
  const task = runtime.tasks[taskId];
  if (!task) throw new Error(`Missing task ${taskId}`);
  return task;
}

function FuncIsActiveTask(runtime: ScriptMenuRuntime, func: ScriptMenuTaskFunc): boolean {
  return FindTaskIdByFunc(runtime, func) !== -1;
}

function FindTaskIdByFunc(runtime: ScriptMenuRuntime, func: ScriptMenuTaskFunc): number {
  return runtime.tasks.find((task) => task.func === func && !task.destroyed)?.id ?? -1;
}

function SetStdWindowBorderStyle(runtime: ScriptMenuRuntime, windowId: number, copyToVram: boolean): void {
  runtime.operations.push(`SetStdWindowBorderStyle:${windowId}:${copyToVram}`);
}

function ScheduleBgCopyTilemapToVram(runtime: ScriptMenuRuntime, bg: number): void {
  runtime.operations.push(`ScheduleBgCopyTilemapToVram:${bg}`);
}

function PlaySE(runtime: ScriptMenuRuntime, se: string): void {
  runtime.operations.push(`PlaySE:${se}`);
}

function ScriptContext_Enable(runtime: ScriptMenuRuntime): void {
  runtime.scriptContextEnabled = true;
  runtime.operations.push('ScriptContext_Enable');
}

function ScriptContext_SetupScript(runtime: ScriptMenuRuntime, script: string): void {
  runtime.scriptContextScript = script;
  runtime.operations.push(`ScriptContext_SetupScript:${script}`);
}

function DisplayYesNoMenuDefaultYes(runtime: ScriptMenuRuntime): void {
  runtime.operations.push('DisplayYesNoMenuDefaultYes');
  Menu_InitCursor(runtime.menu, 0, FONT_NORMAL, 0, 0, 16, 2, 0);
}

function FlagGet(runtime: ScriptMenuRuntime, flag: string): boolean {
  return runtime.flags.has(flag);
}

function AddTextPrinterParameterized(runtime: ScriptMenuRuntime, windowId: number, text: string, x: number, y: number): void {
  runtime.operations.push(`AddTextPrinterParameterized:${windowId}:${FONT_NORMAL}:${text}:${x}:${y}:255:NULL`);
}

function CreateMonSprite_PicBox(runtime: ScriptMenuRuntime, species: number, x: number, y: number): number {
  const id = runtime.sprites.length;
  runtime.sprites.push({ id, kind: 'mon', species, x, y, priority: 0, paletteNum: 0, destroyed: false });
  runtime.operations.push(`CreateMonSprite_PicBox:${species}:${x}:${y}:false`);
  return id;
}

function CreateSprite(runtime: ScriptMenuRuntime, x: number, y: number): number {
  const id = runtime.sprites.length;
  runtime.sprites.push({ id, kind: 'fossil', species: runtime.gSpecialVar_0x8004, x, y, priority: 0, paletteNum: 0, destroyed: false });
  runtime.operations.push(`CreateSprite:sMuseumFossilSprTemplate:${x}:${y}:0`);
  return id;
}

function FreeResourcesAndDestroySprite(runtime: ScriptMenuRuntime, spriteId: number): void {
  if (runtime.sprites[spriteId]) runtime.sprites[spriteId].destroyed = true;
  runtime.operations.push(`FreeResourcesAndDestroySprite:${spriteId}`);
}

function DestroySprite(runtime: ScriptMenuRuntime, spriteId: number): void {
  if (runtime.sprites[spriteId]) runtime.sprites[spriteId].destroyed = true;
  runtime.operations.push(`DestroySprite:${spriteId}`);
}

function FreeSpriteTilesByTag(runtime: ScriptMenuRuntime, tag: number): void {
  runtime.operations.push(`FreeSpriteTilesByTag:${tag}`);
}
