export type FieldMessageBoxType = 'hidden' | 'normal' | 'autoScroll';
export type FieldMessageBoxFrame = 'std' | 'signpost';
export type FieldMessageBoxFont = 'normal' | 'braille';
export type FieldTextSpeed = 'slow' | 'mid' | 'fast';

export interface FieldTextPrinterState {
  fullText: string;
  visibleChars: number;
  delayCounter: number;
  textSpeedFrames: number;
  active: boolean;
  hasPrintBeenSpedUp: boolean;
  downArrowDelay: number;
  downArrowYPosIndex: number;
  autoScrollDelay: number;
}

export interface FieldMessageBoxState {
  type: FieldMessageBoxType;
  frame: FieldMessageBoxFrame;
  font: FieldMessageBoxFont;
  canABSpeedUpPrint: boolean;
  useAlternateDownArrow: boolean;
  autoScroll: boolean;
  printer: FieldTextPrinterState;
}

const TEXT_SPEED_FRAME_DELAYS: Record<FieldTextSpeed, number> = {
  slow: 8,
  mid: 4,
  fast: 1
};

const createFieldTextPrinterState = (): FieldTextPrinterState => ({
  fullText: '',
  visibleChars: 0,
  delayCounter: 0,
  textSpeedFrames: TEXT_SPEED_FRAME_DELAYS.mid - 1,
  active: false,
  hasPrintBeenSpedUp: false,
  downArrowDelay: 0,
  downArrowYPosIndex: 0,
  autoScrollDelay: 0
});

export const createFieldMessageBoxState = (): FieldMessageBoxState => ({
  type: 'hidden',
  frame: 'std',
  font: 'normal',
  canABSpeedUpPrint: false,
  useAlternateDownArrow: false,
  autoScroll: false,
  printer: createFieldTextPrinterState()
});

export const initFieldMessageBox = (state: FieldMessageBoxState): void => {
  state.type = 'hidden';
  state.frame = 'std';
  state.font = 'normal';
  state.canABSpeedUpPrint = false;
  state.useAlternateDownArrow = false;
  state.autoScroll = false;
  state.printer = createFieldTextPrinterState();
};

export const showFieldMessage = (
  state: FieldMessageBoxState,
  frame: FieldMessageBoxFrame = 'std'
): boolean => {
  if (state.type !== 'hidden') {
    return false;
  }

  state.type = 'normal';
  state.frame = frame;
  state.font = 'normal';
  state.canABSpeedUpPrint = true;
  state.useAlternateDownArrow = false;
  state.autoScroll = false;
  return true;
};

export const showFieldAutoScrollMessage = (
  state: FieldMessageBoxState,
  frame: FieldMessageBoxFrame = 'std'
): boolean => {
  if (state.type !== 'hidden') {
    return false;
  }

  state.type = 'autoScroll';
  state.frame = frame;
  state.font = 'normal';
  state.canABSpeedUpPrint = true;
  state.useAlternateDownArrow = false;
  state.autoScroll = true;
  return true;
};

export const hideFieldMessageBox = (state: FieldMessageBoxState): void => {
  state.type = 'hidden';
  state.autoScroll = false;
  state.printer.active = false;
};

export const getFieldMessageBoxType = (state: FieldMessageBoxState): FieldMessageBoxType =>
  state.type;

export const isFieldMessageBoxHidden = (state: FieldMessageBoxState): boolean =>
  state.type === 'hidden';

export const getTextSpeedFrameDelay = (speed: FieldTextSpeed): number =>
  TEXT_SPEED_FRAME_DELAYS[speed];

export const startFieldTextPrinter = (
  state: FieldMessageBoxState,
  text: string,
  speed: FieldTextSpeed = 'mid'
): void => {
  state.printer.fullText = text;
  state.printer.visibleChars = 0;
  state.printer.delayCounter = 0;
  state.printer.textSpeedFrames = Math.max(0, getTextSpeedFrameDelay(speed) - 1);
  state.printer.active = text.length > 0;
  state.printer.hasPrintBeenSpedUp = false;
  state.printer.downArrowDelay = 0;
  state.printer.downArrowYPosIndex = 0;
  state.printer.autoScrollDelay = 0;
};

export const setFieldTextPrinterText = (
  state: FieldMessageBoxState,
  text: string,
  speed: FieldTextSpeed = 'mid'
): void => {
  if (state.printer.fullText !== text) {
    startFieldTextPrinter(state, text, speed);
  }
};

export const completeFieldTextPrinter = (state: FieldMessageBoxState): void => {
  state.printer.visibleChars = state.printer.fullText.length;
  state.printer.active = false;
};

export const requestFieldTextPrinterSpeedUp = (state: FieldMessageBoxState): boolean => {
  if (!state.printer.active || state.printer.visibleChars === 0 || !state.canABSpeedUpPrint) {
    return false;
  }

  state.printer.hasPrintBeenSpedUp = true;
  state.printer.delayCounter = 0;
  return true;
};

export const stepFieldTextPrinter = (
  state: FieldMessageBoxState,
  frameCount = 1,
  speedUpHeld = false
): void => {
  for (let frame = 0; frame < frameCount; frame += 1) {
    if (state.printer.active) {
      if (speedUpHeld && state.printer.hasPrintBeenSpedUp) {
        state.printer.delayCounter = 0;
      }

      if (state.printer.delayCounter > 0 && state.printer.textSpeedFrames > 0) {
        state.printer.delayCounter -= 1;
      } else {
        state.printer.visibleChars += 1;
        state.printer.delayCounter = state.autoScroll ? 1 : state.printer.textSpeedFrames;
        if (state.printer.visibleChars >= state.printer.fullText.length) {
          completeFieldTextPrinter(state);
        }
      }
    } else if (!state.autoScroll) {
      if (state.printer.downArrowDelay > 0) {
        state.printer.downArrowDelay -= 1;
      } else {
        state.printer.downArrowDelay = 8;
        state.printer.downArrowYPosIndex = (state.printer.downArrowYPosIndex + 1) % 4;
      }
    } else if (state.type === 'autoScroll') {
      state.printer.autoScrollDelay += 1;
    }
  }
};

export const getVisibleFieldText = (state: FieldMessageBoxState, fallbackText: string): string =>
  state.printer.fullText === fallbackText
    ? state.printer.fullText.slice(0, state.printer.visibleChars)
    : fallbackText;

export function InitFieldMessageBox(state: FieldMessageBoxState): void {
  initFieldMessageBox(state);
}

export function Task_DrawFieldMessageBox(state: FieldMessageBoxState): void {
  stepFieldTextPrinter(state);
  if (!state.printer.active && state.printer.fullText.length > 0) {
    state.type = 'hidden';
  }
}

export function CreateTask_DrawFieldMessageBox(state: FieldMessageBoxState): void {
  state.printer.downArrowDelay = 0;
}

export function DestroyTask_DrawFieldMessageBox(state: FieldMessageBoxState): void {
  state.printer.active = false;
}

export function ShowFieldMessage(state: FieldMessageBoxState, str: string): boolean {
  const shown = showFieldMessage(state);
  if (shown) {
    ExpandStringAndStartDrawFieldMessageBox(state, str);
  }
  return shown;
}

export function ShowFieldAutoScrollMessage(state: FieldMessageBoxState, str: string): boolean {
  const shown = showFieldAutoScrollMessage(state);
  if (shown) {
    ExpandStringAndStartDrawFieldMessageBox(state, str);
  }
  return shown;
}

export function ForceShowFieldAutoScrollMessage(state: FieldMessageBoxState, str: string): boolean {
  state.type = 'autoScroll';
  state.frame = 'std';
  state.font = 'normal';
  state.canABSpeedUpPrint = true;
  state.useAlternateDownArrow = false;
  state.autoScroll = true;
  ExpandStringAndStartDrawFieldMessageBox(state, str);
  return true;
}

export function ShowFieldMessageFromBuffer(state: FieldMessageBoxState): boolean {
  if (state.type !== 'hidden') {
    return false;
  }
  state.type = 'normal';
  state.frame = 'std';
  state.font = 'normal';
  state.canABSpeedUpPrint = true;
  state.useAlternateDownArrow = false;
  state.autoScroll = false;
  StartDrawFieldMessageBox(state);
  return true;
}

export function ExpandStringAndStartDrawFieldMessageBox(
  state: FieldMessageBoxState,
  str: string
): void {
  startFieldTextPrinter(state, str);
  CreateTask_DrawFieldMessageBox(state);
}

export function StartDrawFieldMessageBox(state: FieldMessageBoxState): void {
  startFieldTextPrinter(state, state.printer.fullText);
  CreateTask_DrawFieldMessageBox(state);
}

export function HideFieldMessageBox(state: FieldMessageBoxState): void {
  hideFieldMessageBox(state);
}

export function GetFieldMessageBoxType(state: FieldMessageBoxState): FieldMessageBoxType {
  return getFieldMessageBoxType(state);
}

export function IsFieldMessageBoxHidden(state: FieldMessageBoxState): boolean {
  return isFieldMessageBoxHidden(state);
}

export function ReplaceFieldMessageWithFrame(state: FieldMessageBoxState): void {
  DestroyTask_DrawFieldMessageBox(state);
  state.frame = 'std';
  state.type = 'hidden';
}
