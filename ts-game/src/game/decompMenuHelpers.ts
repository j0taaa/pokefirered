import type { InputSnapshot } from '../input/inputState';
import type { ScriptRuntimeState } from './scripts';

export const OPTIONS_BUTTON_MODE_LR = 'lr';
export const MENU_L_PRESSED = 'MENU_L_PRESSED';
export const MENU_R_PRESSED = 'MENU_R_PRESSED';
export const MENU_B_PRESSED = 'MENU_B_PRESSED';
export const SE_SELECT = 5;
export const ITEM_ENIGMA_BERRY = 175;
export const MAP_TRADE_CENTER = 'MAP_TRADE_CENTER';
export const NPC_TEXT_COLOR_MALE = 'male';
export const FONT_MALE = 'FONT_MALE';
export const FONT_FEMALE = 'FONT_FEMALE';

export interface QuantityAdjustResult {
  quantity: number;
  changed: boolean;
}

export interface MenuHelperTask {
  func: string | null;
}

export interface MenuHelpersRuntime {
  messageWindowId: number;
  messageNextTask: ((taskId: number) => void) | null;
  yesNo: { yesFunc: string; noFunc: string } | null;
  tasks: MenuHelperTask[];
  textPrinterActive: Record<number, boolean>;
  menuInput: number | typeof MENU_B_PRESSED | null;
  optionsButtonMode: string;
  inputNew: { l?: boolean; r?: boolean };
  inputRepeat: { l?: boolean; r?: boolean; up?: boolean; down?: boolean; left?: boolean; right?: boolean };
  location: { mapGroup: string | number; mapNum: string | number };
  unionRoom: boolean;
  updateLinkStateActive: boolean;
  receivedRemoteLinkPlayers: number;
  overworldQueueMoreThan2: boolean;
  linkRecvQueueAtOverworldMax: boolean;
  mailItems: Set<number>;
  contextNpcTextColor: 'male' | 'female';
  gStringVar4: string;
  textFlags: { canABSpeedUpPrint: number };
  logs: {
    dialogFrames: Array<{ windowId: number; copy: boolean; tileNum: number; paletteNum: number }>;
    textPrinters: Array<{ windowId: number; fontId: number; text: string; textSpeed: number }>;
    yesNoMenus: Array<{ taskId: number; template: unknown; fontId: number; left: number; top: number; tileStart: number; palette: number }>;
    se: number[];
    vblank: Array<null>;
    hblank: Array<null>;
    gpuRegs: Array<{ reg: string; value: number }>;
    bgChanges: Array<{ bg: number; axis: 'x' | 'y'; value: number; op: number }>;
    memoryClears: string[];
    runTextPrinters: number;
  };
}

export const createMenuHelpersRuntime = (): MenuHelpersRuntime => ({
  messageWindowId: 0,
  messageNextTask: null,
  yesNo: null,
  tasks: Array.from({ length: 16 }, () => ({ func: null })),
  textPrinterActive: {},
  menuInput: null,
  optionsButtonMode: 'normal',
  inputNew: {},
  inputRepeat: {},
  location: { mapGroup: 0, mapNum: 0 },
  unionRoom: false,
  updateLinkStateActive: false,
  receivedRemoteLinkPlayers: 0,
  overworldQueueMoreThan2: false,
  linkRecvQueueAtOverworldMax: false,
  mailItems: new Set(),
  contextNpcTextColor: 'female',
  gStringVar4: '',
  textFlags: { canABSpeedUpPrint: 0 },
  logs: {
    dialogFrames: [],
    textPrinters: [],
    yesNoMenus: [],
    se: [],
    vblank: [],
    hblank: [],
    gpuRegs: [],
    bgChanges: [],
    memoryClears: [],
    runTextPrinters: 0
  }
});

export const adjustQuantityAccordingToDPadInput = (
  quantity: number,
  maxQuantity: number,
  input: Pick<InputSnapshot, 'upPressed' | 'downPressed' | 'leftPressed' | 'rightPressed'>
): QuantityAdjustResult => {
  const before = quantity;
  let next = quantity;

  if (input.upPressed) {
    next += 1;
    if (next > maxQuantity) {
      next = 1;
    }
  } else if (input.downPressed) {
    next -= 1;
    if (next <= 0) {
      next = maxQuantity;
    }
  } else if (input.rightPressed) {
    next += 10;
    if (next > maxQuantity) {
      next = maxQuantity;
    }
  } else if (input.leftPressed) {
    next -= 10;
    if (next <= 0) {
      next = 1;
    }
  }

  return {
    quantity: next,
    changed: next !== before
  };
};

export const getDialogBoxFontId = (speakerTextColor: 'male' | 'female'): 'FONT_MALE' | 'FONT_FEMALE' =>
  speakerTextColor === 'male' ? 'FONT_MALE' : 'FONT_FEMALE';

export const getLrKeysPressed = (
  runtime: Pick<ScriptRuntimeState, 'options'>,
  input: { lPressed?: boolean; rPressed?: boolean }
): 'MENU_L_PRESSED' | 'MENU_R_PRESSED' | null => {
  if (runtime.options.buttonMode !== 'lr') {
    return null;
  }

  if (input.lPressed) {
    return 'MENU_L_PRESSED';
  }
  if (input.rPressed) {
    return 'MENU_R_PRESSED';
  }
  return null;
};

export function DisplayMessageAndContinueTask(
  runtime: MenuHelpersRuntime,
  taskId: number,
  windowId: number,
  tileNum: number,
  paletteNum: number,
  fontId: number,
  textSpeed: number,
  string: string,
  taskFunc: (taskId: number) => void
): void {
  runtime.messageWindowId = windowId;
  runtime.logs.dialogFrames.push({ windowId, copy: true, tileNum, paletteNum });
  runtime.gStringVar4 = string === runtime.gStringVar4 ? runtime.gStringVar4 : string;
  runtime.textFlags.canABSpeedUpPrint = 1;
  runtime.logs.textPrinters.push({ windowId, fontId, text: runtime.gStringVar4, textSpeed });
  runtime.messageNextTask = taskFunc;
  runtime.tasks[taskId].func = 'Task_ContinueTaskAfterMessagePrints';
}

export function RunTextPrinters_CheckActive(runtime: MenuHelpersRuntime, textPrinterId: number): boolean {
  runtime.logs.runTextPrinters += 1;
  return Boolean(runtime.textPrinterActive[textPrinterId]);
}

export function Task_ContinueTaskAfterMessagePrints(runtime: MenuHelpersRuntime, taskId: number): void {
  if (!RunTextPrinters_CheckActive(runtime, runtime.messageWindowId)) {
    runtime.messageNextTask?.(taskId);
  }
}

export function Task_CallYesOrNoCallback(runtime: MenuHelpersRuntime, taskId: number): void {
  switch (runtime.menuInput) {
    case 0:
      runtime.logs.se.push(SE_SELECT);
      runtime.tasks[taskId].func = runtime.yesNo?.yesFunc ?? null;
      break;
    case 1:
    case MENU_B_PRESSED:
      runtime.logs.se.push(SE_SELECT);
      runtime.tasks[taskId].func = runtime.yesNo?.noFunc ?? null;
      break;
  }
}

export function CreateYesNoMenuWithCallbacks(
  runtime: MenuHelpersRuntime,
  taskId: number,
  template: unknown,
  fontId: number,
  left: number,
  top: number,
  tileStart: number,
  palette: number,
  yesNo: { yesFunc: string; noFunc: string }
): void {
  runtime.logs.yesNoMenus.push({ taskId, template, fontId, left, top, tileStart, palette });
  runtime.yesNo = yesNo;
  runtime.tasks[taskId].func = 'Task_CallYesOrNoCallback';
}

export function GetLRKeysPressed(runtime: MenuHelpersRuntime): typeof MENU_L_PRESSED | typeof MENU_R_PRESSED | 0 {
  if (runtime.optionsButtonMode === OPTIONS_BUTTON_MODE_LR) {
    if (runtime.inputNew.l) return MENU_L_PRESSED;
    if (runtime.inputNew.r) return MENU_R_PRESSED;
  }
  return 0;
}

export function GetLRKeysPressedAndHeld(runtime: MenuHelpersRuntime): typeof MENU_L_PRESSED | typeof MENU_R_PRESSED | 0 {
  if (runtime.optionsButtonMode === OPTIONS_BUTTON_MODE_LR) {
    if (runtime.inputRepeat.l) return MENU_L_PRESSED;
    if (runtime.inputRepeat.r) return MENU_R_PRESSED;
  }
  return 0;
}

export function IsHoldingItemAllowed(runtime: MenuHelpersRuntime, itemId: number): boolean {
  if (
    itemId === ITEM_ENIGMA_BERRY &&
    ((runtime.location.mapGroup === MAP_TRADE_CENTER && runtime.location.mapNum === MAP_TRADE_CENTER) || runtime.unionRoom)
  ) {
    return false;
  }
  return true;
}

export function IsWritingMailAllowed(runtime: MenuHelpersRuntime, itemId: number): boolean {
  if ((runtime.updateLinkStateActive || runtime.unionRoom) && runtime.mailItems.has(itemId)) {
    return false;
  }
  return true;
}

export function MenuHelpers_IsLinkActive(runtime: MenuHelpersRuntime): boolean {
  return runtime.updateLinkStateActive || runtime.receivedRemoteLinkPlayers === 1;
}

export function IsActiveOverworldLinkBusy(runtime: MenuHelpersRuntime): boolean {
  return MenuHelpers_IsLinkActive(runtime) ? runtime.overworldQueueMoreThan2 : false;
}

export function MenuHelpers_ShouldWaitForLinkRecv(runtime: MenuHelpersRuntime): boolean {
  return IsActiveOverworldLinkBusy(runtime) || runtime.linkRecvQueueAtOverworldMax;
}

export function SetVBlankHBlankCallbacksToNull(runtime: MenuHelpersRuntime): void {
  runtime.logs.vblank.push(null);
  runtime.logs.hblank.push(null);
}

export function ResetAllBgsCoordinatesAndBgCntRegs(runtime: MenuHelpersRuntime): void {
  for (const reg of ['REG_OFFSET_DISPCNT', 'REG_OFFSET_BG3CNT', 'REG_OFFSET_BG2CNT', 'REG_OFFSET_BG1CNT', 'REG_OFFSET_BG0CNT']) {
    runtime.logs.gpuRegs.push({ reg, value: 0 });
  }
  for (let bg = 0; bg < 4; bg += 1) {
    runtime.logs.bgChanges.push({ bg, axis: 'x', value: 0, op: 0 });
    runtime.logs.bgChanges.push({ bg, axis: 'y', value: 0, op: 0 });
  }
}

export function ResetVramOamAndBgCntRegs(runtime: MenuHelpersRuntime): void {
  ResetAllBgsCoordinatesAndBgCntRegs(runtime);
  runtime.logs.memoryClears.push('VRAM:u16');
  runtime.logs.memoryClears.push('OAM:u32');
  runtime.logs.memoryClears.push('PLTT:u16');
}

export function AdjustQuantityAccordingToDPadInput(
  runtime: MenuHelpersRuntime,
  quantity: { value: number },
  qmax: number
): boolean {
  const before = quantity.value;
  if (runtime.inputRepeat.up) {
    quantity.value += 1;
    if (quantity.value > qmax) quantity.value = 1;
  } else if (runtime.inputRepeat.down) {
    quantity.value -= 1;
    if (quantity.value <= 0) quantity.value = qmax;
  } else if (runtime.inputRepeat.right) {
    quantity.value += 10;
    if (quantity.value > qmax) quantity.value = qmax;
  } else if (runtime.inputRepeat.left) {
    quantity.value -= 10;
    if (quantity.value <= 0) quantity.value = 1;
  } else {
    return false;
  }
  if (quantity.value === before) return false;
  runtime.logs.se.push(SE_SELECT);
  return true;
}

export function GetDialogBoxFontId(runtime: MenuHelpersRuntime): typeof FONT_MALE | typeof FONT_FEMALE {
  return runtime.contextNpcTextColor === NPC_TEXT_COLOR_MALE ? FONT_MALE : FONT_FEMALE;
}

export const displayMessageAndContinueTask = DisplayMessageAndContinueTask;
export const runTextPrintersCheckActive = RunTextPrinters_CheckActive;
export const taskContinueTaskAfterMessagePrints = Task_ContinueTaskAfterMessagePrints;
export const taskCallYesOrNoCallback = Task_CallYesOrNoCallback;
export const createYesNoMenuWithCallbacks = CreateYesNoMenuWithCallbacks;
export const getLRKeysPressedC = GetLRKeysPressed;
export const getLRKeysPressedAndHeld = GetLRKeysPressedAndHeld;
export const isHoldingItemAllowed = IsHoldingItemAllowed;
export const isWritingMailAllowed = IsWritingMailAllowed;
export const menuHelpersIsLinkActive = MenuHelpers_IsLinkActive;
export const isActiveOverworldLinkBusy = IsActiveOverworldLinkBusy;
export const menuHelpersShouldWaitForLinkRecv = MenuHelpers_ShouldWaitForLinkRecv;
export const setVBlankHBlankCallbacksToNull = SetVBlankHBlankCallbacksToNull;
export const resetVramOamAndBgCntRegs = ResetVramOamAndBgCntRegs;
export const resetAllBgsCoordinatesAndBgCntRegs = ResetAllBgsCoordinatesAndBgCntRegs;
export const adjustQuantityAccordingToDPadInputC = AdjustQuantityAccordingToDPadInput;
export const getDialogBoxFontIdC = GetDialogBoxFontId;
