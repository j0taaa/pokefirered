import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  CB2_MoveRelearner,
  CB2_MoveRelearner_Init,
  CB2_MoveRelearner_Resume,
  DrawTextBorderOnWindows6and7,
  InitMoveRelearnerStateVariables,
  LIST_CANCEL,
  LoadMoveInfoUI,
  MENU_B_PRESSED,
  MENU_NOTHING_CHOSEN,
  MENU_STATE_CHOOSE_SETUP_STATE,
  MENU_STATE_DOUBLE_FANFARE_FORGOT_MOVE,
  MENU_STATE_FADE_AND_RETURN,
  MENU_STATE_FADE_FROM_SUMMARY_SCREEN,
  MENU_STATE_FADE_TO_BLACK,
  MENU_STATE_GIVE_UP_CONFIRM,
  MENU_STATE_IDLE_BATTLE_MODE,
  MENU_STATE_PRINT_GIVE_UP_PROMPT,
  MENU_STATE_PRINT_STOP_TEACHING,
  MENU_STATE_PRINT_TEACH_MOVE_PROMPT,
  MENU_STATE_PRINT_TEXT_THEN_FANFARE,
  MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT,
  MENU_STATE_PRINT_WHICH_MOVE_PROMPT,
  MENU_STATE_RETURN_TO_FIELD,
  MENU_STATE_SETUP_BATTLE_MODE,
  MENU_STATE_SHOW_MOVE_SUMMARY_SCREEN,
  MENU_STATE_TEACH_MOVE_CONFIRM,
  MENU_STATE_TRY_OVERWRITE_MOVE,
  MENU_STATE_WAIT_FOR_A_BUTTON,
  MENU_STATE_WAIT_FOR_FADE,
  MENU_STATE_WAIT_FOR_FANFARE,
  MOVE_NONE,
  MoveLearnerInitListMenu,
  MoveRelearnerInitListMenuBuffersEtc,
  MoveRelearnerLoadBgGfx,
  MoveRelearnerMenuHandleInput,
  MoveRelearnerMenu_MoveCursorFunc,
  MoveRelearnerStateMachine,
  PrintMoveInfo,
  PrintMoveInfoHandleCancel_CopyToVram,
  PrintTeachWhichMoveToStrVar1,
  PrintTextOnWindow,
  SpawnListMenuScrollIndicatorSprites,
  SpriteCB_ListMenuScrollIndicators,
  StringExpandPlaceholdersAndPrintTextOnWindow7Color2,
  Task_InitMoveRelearnerMenu,
  TeachMoveRelearnerMove,
  VBlankCB_MoveRelearner,
  YesNoMenuProcessInput,
  allocLearnMoveResources,
  cb2MoveRelearner,
  cb2MoveRelearnerInit,
  cb2MoveRelearnerResume,
  createLearnMoveRuntime,
  drawTextBorderOnWindows6and7,
  initMoveRelearnerStateVariables,
  loadMoveInfoUI,
  moveRelearnerInitListMenuBuffersEtc,
  moveRelearnerLoadBgGfx,
  moveRelearnerMenuHandleInput,
  moveRelearnerMenuMoveCursorFunc,
  moveRelearnerStateMachine,
  moveLearnerInitListMenu,
  printMoveInfo,
  printMoveInfoHandleCancelCopyToVram,
  printTeachWhichMoveToStrVar1,
  printTextOnWindow,
  sBgTemplates,
  sMoveRelearnerListMenuTemplate,
  sMoveRelearnerYesNoMenuTemplate,
  sMoveTutorMenuWindowFrameDimensions,
  sMoveTutorMoveInfoHeaders,
  sWindowTemplates,
  spawnListMenuScrollIndicatorSprites,
  spriteCBListMenuScrollIndicators,
  stringExpandPlaceholdersAndPrintTextOnWindow7Color2,
  taskInitMoveRelearnerMenu,
  teachMoveRelearnerMove,
  vBlankCBMoveRelearner,
  yesNoMenuProcessInput
} from '../src/game/decompLearnMove';
import {
  gText_1_2_and_Poof,
  gText_GiveUpTryingToTeachNewMove,
  gText_MonForgotOldMoveAndMonLearnedNewMove,
  gText_MonIsTryingToLearnMove,
  gText_MonLearnedMove,
  gText_StopLearningMove,
  gText_TeachMoveQues,
  gText_TeachWhichMoveToMon,
  gText_ThreeHyphens,
  gText_WhichMoveShouldBeForgotten
} from '../src/game/decompStrings';

const makeRuntime = () => createLearnMoveRuntime({
  gSpecialVar_0x8004: 0,
  gPlayerParty: [
    { nickname: 'PIKA', moves: [1, 2, 3, 4], ppBonuses: [1, 1, 1, 1], relearnMoves: [10, 20, 30] }
  ],
  gPlayerPartyCount: 1,
  moveNames: { 1: 'POUND', 2: 'KICK', 3: 'SLAP', 4: 'TACKLE', 10: 'THUNDER', 20: 'SURF', 30: 'CUT' },
  battleMoves: {
    10: { type: 3, power: 0, accuracy: 0, pp: 10, description: 'No damage.' },
    20: { type: 2, power: 95, accuracy: 100, pp: 15, description: 'A big wave.' }
  }
});

describe('decomp learn_move', () => {
  test('exact C function names are exported as the implemented move relearner routines', () => {
    expect(VBlankCB_MoveRelearner).toBe(vBlankCBMoveRelearner);
    expect(TeachMoveRelearnerMove).toBe(teachMoveRelearnerMove);
    expect(Task_InitMoveRelearnerMenu).toBe(taskInitMoveRelearnerMenu);
    expect(MoveRelearnerLoadBgGfx).toBe(moveRelearnerLoadBgGfx);
    expect(CB2_MoveRelearner_Init).toBe(cb2MoveRelearnerInit);
    expect(CB2_MoveRelearner_Resume).toBe(cb2MoveRelearnerResume);
    expect(CB2_MoveRelearner).toBe(cb2MoveRelearner);
    expect(StringExpandPlaceholdersAndPrintTextOnWindow7Color2).toBe(stringExpandPlaceholdersAndPrintTextOnWindow7Color2);
    expect(MoveRelearnerStateMachine).toBe(moveRelearnerStateMachine);
    expect(DrawTextBorderOnWindows6and7).toBe(drawTextBorderOnWindows6and7);
    expect(PrintTeachWhichMoveToStrVar1).toBe(printTeachWhichMoveToStrVar1);
    expect(InitMoveRelearnerStateVariables).toBe(initMoveRelearnerStateVariables);
    expect(SpriteCB_ListMenuScrollIndicators).toBe(spriteCBListMenuScrollIndicators);
    expect(SpawnListMenuScrollIndicatorSprites).toBe(spawnListMenuScrollIndicatorSprites);
    expect(MoveRelearnerInitListMenuBuffersEtc).toBe(moveRelearnerInitListMenuBuffersEtc);
    expect(MoveRelearnerMenuHandleInput).toBe(moveRelearnerMenuHandleInput);
    expect(MoveLearnerInitListMenu).toBe(moveLearnerInitListMenu);
    expect(PrintMoveInfo).toBe(printMoveInfo);
    expect(LoadMoveInfoUI).toBe(loadMoveInfoUI);
    expect(PrintMoveInfoHandleCancel_CopyToVram).toBe(printMoveInfoHandleCancelCopyToVram);
    expect(MoveRelearnerMenu_MoveCursorFunc).toBe(moveRelearnerMenuMoveCursorFunc);
    expect(YesNoMenuProcessInput).toBe(yesNoMenuProcessInput);
    expect(PrintTextOnWindow).toBe(printTextOnWindow);
  });

  test('static templates preserve C dimensions and sentinel entries', () => {
    expect(sMoveTutorMenuWindowFrameDimensions).toEqual([[0, 0, 19, 13], [20, 0, 29, 13], [2, 14, 27, 19]]);
    expect(sMoveTutorMoveInfoHeaders[0][0]).toEqual({ text: 'たたかうわざ', left: 7, right: 1, index: 0 });
    expect(sMoveTutorMoveInfoHeaders[1]).toEqual([
      { text: null, left: 0, right: 0, index: 0 },
      { text: null, left: 0, right: 0, index: 0 },
      { text: null, left: 0, right: 0, index: 0 },
      { text: null, left: 0, right: 0, index: 0 },
      { text: null, left: 0, right: 0, index: 0 }
    ]);
    expect(sBgTemplates).toEqual([
      { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, priority: 0 },
      { bg: 1, charBaseIndex: 0, mapBaseIndex: 8, priority: 1 }
    ]);
    expect(sWindowTemplates.at(-1)).toBeNull();
    expect(sMoveRelearnerYesNoMenuTemplate).toMatchObject({ tilemapLeft: 21, tilemapTop: 8, width: 6, height: 4, baseBlock: 0x1d1 });
    expect(sMoveRelearnerListMenuTemplate).toMatchObject({ maxShowed: 7, windowId: 6, item_X: 8, cursorPal: 2 });
  });

  test('TeachMoveRelearnerMove and init task lock, fade, callback, and destroy exactly', () => {
    const runtime = makeRuntime();
    teachMoveRelearnerMove(runtime);
    expect(runtime.operations).toEqual(['LockPlayerFieldControls', 'BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK)']);
    expect(runtime.tasks[0]).toEqual({ func: 'Task_InitMoveRelearnerMenu', priority: 10, destroyed: false });

    runtime.gPaletteFade.active = true;
    taskInitMoveRelearnerMenu(runtime, 0);
    expect(runtime.gMainCallback2).toBeNull();
    runtime.gPaletteFade.active = false;
    taskInitMoveRelearnerMenu(runtime, 0);
    expect(runtime.gMainCallback2).toBe('CB2_MoveRelearner_Init');
    expect(runtime.gFieldCallback).toBe('FieldCB_ContinueScriptHandleMusic');
    expect(runtime.tasks[0].destroyed).toBe(true);
  });

  test('CB2 init allocates resources, copies selected party member, builds list, and installs callbacks', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_FADE_TO_BLACK);
    expect(runtime.sMoveRelearner?.selectedPartyMember).toBe(0);
    expect(runtime.sMoveRelearner?.learnableMoves.slice(0, 4)).toEqual([10, 20, 30, 0]);
    expect(runtime.sMoveRelearner?.listMenuItems).toEqual([
      { label: 'THUNDER', index: 0 },
      { label: 'SURF', index: 1 },
      { label: 'CUT', index: 2 },
      { label: 'CANCEL', index: LIST_CANCEL }
    ]);
    expect(runtime.gStringVar1).toBe('PIKA');
    expect(runtime.gVBlankCallback).toBe('VBlankCB_MoveRelearner');
    expect(runtime.gMainCallback2).toBe('CB2_MoveRelearner');
  });

  test('resume preserves existing resources and copies selectedMoveSlot from VAR_0x8005', () => {
    const runtime = makeRuntime();
    runtime.sMoveRelearner = allocLearnMoveResources();
    runtime.gSpecialVar_0x8005 = 3;
    cb2MoveRelearnerResume(runtime);
    expect(runtime.sMoveRelearner.selectedMoveSlot).toBe(3);
    expect(runtime.operations).toContain('SetBackdropFromColor(RGB_BLACK)');
    expect(runtime.gMainCallback2).toBe('CB2_MoveRelearner');
  });

  test('state 0 setup performs fade, UI load, prompt, list init, and schedules move info update', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    runtime.operations = [];
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_WAIT_FOR_FADE);
    expect(runtime.sMoveRelearner?.scheduleMoveInfoUpdate).toBe(true);
    expect(runtime.printedText.at(-1)?.str).toBe(gText_TeachWhichMoveToMon.replace('{STR_VAR_1}', 'PIKA'));
    expect(runtime.operations).toContain('ListMenuInit(scroll=0, row=0)');
  });

  test('wait/setup/idle state transitions mirror skipped C state values', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    runtime.sMoveRelearner!.state = MENU_STATE_WAIT_FOR_FADE;
    runtime.gPaletteFade.active = true;
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_WAIT_FOR_FADE);
    runtime.gPaletteFade.active = false;
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_IDLE_BATTLE_MODE);

    runtime.sMoveRelearner!.state = MENU_STATE_SETUP_BATTLE_MODE;
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_IDLE_BATTLE_MODE);
    expect(runtime.sMoveRelearner?.scheduleMoveInfoUpdate).toBe(true);
  });

  test('idle input chooses selected move, cancel item, or B button give-up prompt', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    runtime.sMoveRelearner!.state = MENU_STATE_IDLE_BATTLE_MODE;
    runtime.sMoveRelearner!.selectedIndex = 1;
    runtime.joyNew = A_BUTTON;
    moveRelearnerMenuHandleInput(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_PRINT_TEACH_MOVE_PROMPT);
    expect(runtime.gStringVar2).toBe('SURF');
    expect(runtime.printedText.at(-1)?.str).toBe(gText_TeachMoveQues.replace('{STR_VAR_2}', 'SURF'));

    const cancel = makeRuntime();
    cb2MoveRelearnerInit(cancel);
    cancel.sMoveRelearner!.selectedIndex = LIST_CANCEL;
    cancel.joyNew = A_BUTTON;
    moveRelearnerMenuHandleInput(cancel);
    expect(cancel.sMoveRelearner?.state).toBe(MENU_STATE_PRINT_GIVE_UP_PROMPT);
    expect(cancel.printedText.at(-1)?.str).toBe(gText_GiveUpTryingToTeachNewMove.replace('{STR_VAR_1}', 'PIKA'));

    const b = makeRuntime();
    cb2MoveRelearnerInit(b);
    b.joyNew = B_BUTTON;
    moveRelearnerMenuHandleInput(b);
    expect(b.sMoveRelearner?.state).toBe(MENU_STATE_PRINT_GIVE_UP_PROMPT);
  });

  test('teach confirmation learns into an empty slot or routes to trying-to-learn prompt', () => {
    const emptySlot = createLearnMoveRuntime({
      gPlayerParty: [{ nickname: 'ODD', moves: [1, MOVE_NONE, 3, 4], relearnMoves: [20] }],
      gPlayerPartyCount: 1,
      moveNames: { 20: 'SURF' },
      yesNoInputs: [0]
    });
    emptySlot.sMoveRelearner = allocLearnMoveResources();
    moveRelearnerInitListMenuBuffersEtc(emptySlot);
    emptySlot.sMoveRelearner.state = MENU_STATE_TEACH_MOVE_CONFIRM;
    moveRelearnerStateMachine(emptySlot);
    expect(emptySlot.gPlayerParty[0].moves[1]).toBe(20);
    expect(emptySlot.gSpecialVar_0x8004).toBe(1);
    expect(emptySlot.sMoveRelearner.state).toBe(MENU_STATE_PRINT_TEXT_THEN_FANFARE);
    expect(emptySlot.printedText.at(-1)?.str).toBe(gText_MonLearnedMove.replace('{STR_VAR_1}', 'ODD').replace('{STR_VAR_2}', 'SURF'));

    const full = makeRuntime();
    cb2MoveRelearnerInit(full);
    full.yesNoInputs = [0];
    full.sMoveRelearner!.state = MENU_STATE_TEACH_MOVE_CONFIRM;
    moveRelearnerStateMachine(full);
    expect(full.sMoveRelearner?.state).toBe(MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT);

    full.sMoveRelearner!.state = MENU_STATE_TEACH_MOVE_CONFIRM;
    full.yesNoInputs = [MENU_B_PRESSED];
    moveRelearnerStateMachine(full);
    expect(full.sMoveRelearner?.state).toBe(MENU_STATE_SETUP_BATTLE_MODE);
  });

  test('give-up and delete/stop confirmations preserve yes/no and B behavior', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    runtime.sMoveRelearner!.state = MENU_STATE_GIVE_UP_CONFIRM;
    runtime.yesNoInputs = [0];
    moveRelearnerStateMachine(runtime);
    expect(runtime.gSpecialVar_0x8004).toBe(0);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_FADE_AND_RETURN);

    runtime.sMoveRelearner!.state = MENU_STATE_GIVE_UP_CONFIRM;
    runtime.yesNoInputs = [1];
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_SETUP_BATTLE_MODE);

    runtime.sMoveRelearner!.state = 17;
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(18);
    runtime.yesNoInputs = [0];
    moveRelearnerStateMachine(runtime);
    expect(runtime.printedText.at(-1)?.str).toBe(gText_WhichMoveShouldBeForgotten);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_PRINT_WHICH_MOVE_PROMPT);

    runtime.sMoveRelearner!.state = 26;
    runtime.yesNoInputs = [1];
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT);
  });

  test('summary screen saves list scroll, resumes through fade state, and overwrite updates move slot', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    runtime.sMoveRelearner!.state = MENU_STATE_PRINT_WHICH_MOVE_PROMPT;
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_SHOW_MOVE_SUMMARY_SCREEN);

    runtime.listMenuScrollResult = { pos: 2, row: 1 };
    runtime.gPaletteFade.active = false;
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.listMenuScrollPos).toBe(2);
    expect(runtime.sMoveRelearner?.listMenuScrollRow).toBe(1);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_FADE_FROM_SUMMARY_SCREEN);

    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_TRY_OVERWRITE_MOVE);

    runtime.sMoveRelearner!.selectedMoveSlot = 2;
    runtime.sMoveRelearner!.selectedIndex = 1;
    moveRelearnerStateMachine(runtime);
    expect(runtime.gStringVar3).toBe('SLAP');
    expect(runtime.gStringVar2).toBe('SURF');
    expect(runtime.gPlayerParty[0].moves[2]).toBe(20);
    expect(runtime.gPlayerParty[0].ppBonuses?.[2]).toBe(0);
    expect(runtime.printedText.at(-1)?.str).toBe(gText_1_2_and_Poof);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_DOUBLE_FANFARE_FORGOT_MOVE);

    moveRelearnerStateMachine(runtime);
    expect(runtime.printedText.at(-1)?.str).toBe(gText_MonForgotOldMoveAndMonLearnedNewMove.replaceAll('{STR_VAR_1}', 'PIKA').replace('{STR_VAR_2}', 'SURF').replace('{STR_VAR_3}', 'SLAP'));
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_PRINT_TEXT_THEN_FANFARE);
  });

  test('overwrite cancel slot returns to stop-teaching state', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    runtime.sMoveRelearner!.state = MENU_STATE_TRY_OVERWRITE_MOVE;
    runtime.sMoveRelearner!.selectedMoveSlot = 4;
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_PRINT_STOP_TEACHING);
  });

  test('fanfare wait, A button, fade return, and return-to-field cleanup follow C order', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    runtime.sMoveRelearner!.state = MENU_STATE_PRINT_TEXT_THEN_FANFARE;
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_WAIT_FOR_FANFARE);
    runtime.fanfareInactive = true;
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_WAIT_FOR_A_BUTTON);
    runtime.joyNew = A_BUTTON;
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_FADE_AND_RETURN);
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_RETURN_TO_FIELD);
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner).toBeNull();
    expect(runtime.gMainCallback2).toBe('CB2_ReturnToField');
  });

  test('CB2 wrapper skips state machine while text is active and consumes scheduled move-info updates', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    runtime.textPrinterActive7 = true;
    runtime.sMoveRelearner!.scheduleMoveInfoUpdate = true;
    runtime.sMoveRelearner!.selectedIndex = 1;
    cb2MoveRelearner(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_FADE_TO_BLACK);
    expect(runtime.sMoveRelearner?.scheduleMoveInfoUpdate).toBe(false);
    expect(runtime.printedText.some((entry) => entry.str === 'A big wave.')).toBe(true);
    expect(runtime.operations.slice(-5)).toEqual(['CopyWindowToVram(7, COPYWIN_FULL)', 'RunTasks', 'RunTextPrinters', 'AnimateSprites', 'BuildOamBuffer', 'UpdatePaletteFade'].slice(-5));
  });

  test('cursor callback, yes/no wrapper, text colors, vblank, and sprite callback match small helpers', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    moveRelearnerMenuMoveCursorFunc(runtime, 2, false);
    expect(runtime.sMoveRelearner?.selectedIndex).toBe(2);
    expect(runtime.sMoveRelearner?.scheduleMoveInfoUpdate).toBe(true);
    moveRelearnerMenuMoveCursorFunc(runtime, 1, true);
    expect(runtime.sMoveRelearner?.selectedIndex).toBe(2);

    runtime.yesNoInputs = [MENU_NOTHING_CHOSEN, 1];
    expect(yesNoMenuProcessInput(runtime)).toBe(MENU_NOTHING_CHOSEN);
    expect(runtime.operations.at(-1)).not.toBe('CopyWindowToVram(6, COPYWIN_MAP)');
    expect(yesNoMenuProcessInput(runtime)).toBe(1);
    expect(runtime.operations.at(-1)).toBe('CopyWindowToVram(6, COPYWIN_MAP)');

    printTextOnWindow(runtime, 3, 'abc', 1, 2, 0, 0);
    expect(runtime.printedText.at(-1)?.textColor).toEqual([0, 2, 3]);
    printTextOnWindow(runtime, 3, 'abc', 1, 2, 0, 2);
    expect(runtime.printedText.at(-1)?.textColor).toEqual([1, 2, 3]);

    vBlankCBMoveRelearner(runtime);
    expect(runtime.operations.slice(-3)).toEqual(['LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer']);

    const sprite = { x: 0, y: 0, x2: 0, y2: 0, data: [2, 0, 1, 0], invisible: false, anim: null };
    spriteCBListMenuScrollIndicators(sprite);
    expect(sprite.data[1]).toBe(1);
    expect(sprite.y2).toBe(0);
  });

  test('scroll indicator spawn preserves the original spriteIds[0] overwrite bug', () => {
    const runtime = makeRuntime();
    runtime.sMoveRelearner = allocLearnMoveResources();
    spawnListMenuScrollIndicatorSprites(runtime);
    expect(runtime.sMoveRelearner.spriteIds).toEqual([1, 0]);
    expect(runtime.sprites[0].invisible).toBe(true);
    expect(runtime.sprites[1].invisible).toBe(true);
    expect(runtime.sprites[0].data[2]).toBe(-1);
    expect(runtime.sprites[1].data[2]).toBe(1);
  });

  test('move info prints hyphens for low power and zero accuracy, otherwise right-aligned numbers', () => {
    const runtime = makeRuntime();
    runtime.sMoveRelearner = allocLearnMoveResources();
    printMoveInfo(runtime, 10);
    expect(runtime.printedText.map((entry) => entry.str)).toContain(gText_ThreeHyphens);
    expect(runtime.printedText.at(-1)?.str).toBe('No damage.');

    runtime.printedText = [];
    printMoveInfo(runtime, 20);
    expect(runtime.printedText.map((entry) => entry.str)).toContain(' 95');
    expect(runtime.printedText.map((entry) => entry.str)).toContain('100');
    expect(runtime.printedText.at(-1)?.str).toBe('A big wave.');
  });

  test('cancel move info clears windows 2 through 5 and copies window 2 twice', () => {
    const runtime = makeRuntime();
    runtime.sMoveRelearner = allocLearnMoveResources();
    runtime.sMoveRelearner.selectedIndex = LIST_CANCEL;
    printMoveInfoHandleCancelCopyToVram(runtime);
    expect(runtime.operations).toContain('FillWindowPixelBuffer(2, PIXEL_FILL(0))');
    expect(runtime.operations.filter((op) => op === 'CopyWindowToVram(2, COPYWIN_GFX)')).toHaveLength(3);
  });

  test('init variables only clears first 20 learnable move entries like the C loop', () => {
    const runtime = makeRuntime();
    runtime.sMoveRelearner = allocLearnMoveResources();
    runtime.sMoveRelearner.learnableMoves[20] = 123;
    initMoveRelearnerStateVariables(runtime);
    expect(runtime.sMoveRelearner.learnableMoves.slice(0, 20).every((move) => move === MOVE_NONE)).toBe(true);
    expect(runtime.sMoveRelearner.learnableMoves[20]).toBe(123);
  });

  test('PrintTeachWhichMoveToStrVar1 intentionally does nothing on init resume', () => {
    const runtime = makeRuntime();
    runtime.sMoveRelearner = allocLearnMoveResources();
    runtime.gStringVar1 = 'PIKA';
    printTeachWhichMoveToStrVar1(runtime, true);
    expect(runtime.printedText).toEqual([]);
    printTeachWhichMoveToStrVar1(runtime, false);
    expect(runtime.printedText[0].str).toBe(gText_TeachWhichMoveToMon.replace('{STR_VAR_1}', 'PIKA'));
  });

  test('stop teaching prompt and choose setup state match their one-step transitions', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    runtime.gStringVar2 = 'SURF';
    runtime.sMoveRelearner!.state = MENU_STATE_PRINT_STOP_TEACHING;
    moveRelearnerStateMachine(runtime);
    expect(runtime.printedText.at(-1)?.str).toBe(gText_StopLearningMove.replace('{STR_VAR_2}', 'SURF'));
    expect(runtime.sMoveRelearner?.state).toBe(25);
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(26);
    runtime.yesNoInputs = [0];
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_CHOOSE_SETUP_STATE);
    moveRelearnerStateMachine(runtime);
    expect(runtime.sMoveRelearner?.state).toBe(MENU_STATE_SETUP_BATTLE_MODE);
  });

  test('trying-to-learn prompt prints exact expanded string before delete confirmation', () => {
    const runtime = makeRuntime();
    cb2MoveRelearnerInit(runtime);
    runtime.gStringVar2 = 'SURF';
    runtime.sMoveRelearner!.state = MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT;
    moveRelearnerStateMachine(runtime);
    expect(runtime.printedText.at(-1)?.str).toBe(gText_MonIsTryingToLearnMove.replaceAll('{STR_VAR_1}', 'PIKA').replaceAll('{STR_VAR_2}', 'SURF'));
    expect(runtime.sMoveRelearner?.state).toBe(17);
  });
});
