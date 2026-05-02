import { describe, expect, test } from 'vitest';
import {
  CreateTask_DrawFieldMessageBox,
  DestroyTask_DrawFieldMessageBox,
  ExpandStringAndStartDrawFieldMessageBox,
  ForceShowFieldAutoScrollMessage,
  GetFieldMessageBoxType,
  HideFieldMessageBox,
  InitFieldMessageBox,
  IsFieldMessageBoxHidden,
  ReplaceFieldMessageWithFrame,
  ShowFieldAutoScrollMessage,
  ShowFieldMessage,
  ShowFieldMessageFromBuffer,
  StartDrawFieldMessageBox,
  Task_DrawFieldMessageBox,
  createFieldMessageBoxState,
  getFieldMessageBoxType,
  hideFieldMessageBox,
  initFieldMessageBox,
  isFieldMessageBoxHidden,
  startFieldTextPrinter,
  requestFieldTextPrinterSpeedUp,
  stepFieldTextPrinter,
  showFieldAutoScrollMessage,
  showFieldMessage
} from '../src/game/decompFieldMessageBox';

describe('decompFieldMessageBox', () => {
  test('tracks normal and auto-scroll field message state like the decomp helper', () => {
    const state = createFieldMessageBoxState();

    expect(isFieldMessageBoxHidden(state)).toBe(true);
    expect(showFieldMessage(state, 'signpost')).toBe(true);
    expect(getFieldMessageBoxType(state)).toBe('normal');
    expect(state.frame).toBe('signpost');
    expect(state.font).toBe('normal');
    expect(state.canABSpeedUpPrint).toBe(true);

    hideFieldMessageBox(state);
    expect(isFieldMessageBoxHidden(state)).toBe(true);

    expect(showFieldAutoScrollMessage(state)).toBe(true);
    expect(getFieldMessageBoxType(state)).toBe('autoScroll');
    expect(state.autoScroll).toBe(true);

    initFieldMessageBox(state);
    expect(isFieldMessageBoxHidden(state)).toBe(true);
    expect(state.autoScroll).toBe(false);
  });

  test('reveals field text with decomp option-speed frame delays', () => {
    const state = createFieldMessageBoxState();
    showFieldMessage(state);
    startFieldTextPrinter(state, 'ABC', 'mid');

    expect(state.printer.visibleChars).toBe(0);
    stepFieldTextPrinter(state);
    expect(state.printer.visibleChars).toBe(1);
    stepFieldTextPrinter(state, 3);
    expect(state.printer.visibleChars).toBe(1);
    stepFieldTextPrinter(state);
    expect(state.printer.visibleChars).toBe(2);
  });

  test('fast field text prints one character per rendered frame', () => {
    const state = createFieldMessageBoxState();
    showFieldMessage(state);
    startFieldTextPrinter(state, 'ABC', 'fast');

    stepFieldTextPrinter(state);
    expect(state.printer.visibleChars).toBe(1);
    stepFieldTextPrinter(state);
    expect(state.printer.visibleChars).toBe(2);
    stepFieldTextPrinter(state);
    expect(state.printer.visibleChars).toBe(3);
    expect(state.printer.active).toBe(false);
  });

  test('A/B speedup affects the active printer before page advancement', () => {
    const state = createFieldMessageBoxState();
    showFieldMessage(state);
    startFieldTextPrinter(state, 'ABCD', 'slow');

    expect(requestFieldTextPrinterSpeedUp(state)).toBe(false);
    stepFieldTextPrinter(state);
    expect(state.printer.visibleChars).toBe(1);
    expect(requestFieldTextPrinterSpeedUp(state)).toBe(true);
    stepFieldTextPrinter(state, 1, true);
    expect(state.printer.visibleChars).toBe(2);
  });

  test('exact C-name field message box exports preserve hidden/type, draw task, buffer, force auto-scroll, hide, and replace behavior', () => {
    const state = createFieldMessageBoxState();
    InitFieldMessageBox(state);
    expect(IsFieldMessageBoxHidden(state)).toBe(true);

    expect(ShowFieldMessage(state, 'ABC')).toBe(true);
    expect(GetFieldMessageBoxType(state)).toBe('normal');
    expect(state.printer.fullText).toBe('ABC');
    expect(ShowFieldMessage(state, 'busy')).toBe(false);
    Task_DrawFieldMessageBox(state);
    expect(state.printer.visibleChars).toBe(1);

    DestroyTask_DrawFieldMessageBox(state);
    expect(state.printer.active).toBe(false);
    HideFieldMessageBox(state);
    expect(IsFieldMessageBoxHidden(state)).toBe(true);

    expect(ShowFieldAutoScrollMessage(state, 'AUTO')).toBe(true);
    expect(GetFieldMessageBoxType(state)).toBe('autoScroll');
    expect(state.autoScroll).toBe(true);
    HideFieldMessageBox(state);

    expect(ForceShowFieldAutoScrollMessage(state, 'FORCED')).toBe(true);
    expect(GetFieldMessageBoxType(state)).toBe('autoScroll');
    expect(state.printer.fullText).toBe('FORCED');
    HideFieldMessageBox(state);

    state.printer.fullText = 'BUFFER';
    expect(ShowFieldMessageFromBuffer(state)).toBe(true);
    expect(GetFieldMessageBoxType(state)).toBe('normal');
    StartDrawFieldMessageBox(state);
    expect(state.printer.fullText).toBe('BUFFER');

    ExpandStringAndStartDrawFieldMessageBox(state, 'EXPANDED');
    expect(state.printer.fullText).toBe('EXPANDED');
    CreateTask_DrawFieldMessageBox(state);
    expect(state.printer.downArrowDelay).toBe(0);

    ReplaceFieldMessageWithFrame(state);
    expect(GetFieldMessageBoxType(state)).toBe('hidden');
  });
});
