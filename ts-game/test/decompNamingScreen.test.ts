import { describe, expect, test } from 'vitest';
import {
  getNamingScreenCharAtKeyboardPos,
  getNamingScreenCursorRenderState,
  getNamingScreenKeyRole,
  getNamingScreenNextGfxId,
  getNamingScreenNextKeyboardId,
  getNamingScreenPreviousTextCaretPosition,
  getNamingScreenTemplate,
  getNamingScreenTextEntryPosition,
  handleNamingScreenKeyboardEvent,
  INPUT_A_BUTTON,
  INPUT_B_BUTTON,
  INPUT_SELECT,
  INPUT_START,
  INPUT_STATE_DISABLED,
  isNamingScreenWideLetter,
  NAMING_SCREEN_MAX_MON_CHARS,
  BUTTON_BACK,
  BUTTON_COUNT,
  BUTTON_OK,
  BUTTON_PAGE,
  PAGE_SWAP_LOWER,
  POKEMON_NAME_LENGTH,
  moveNamingScreenCursorToOkButton,
  saveNamingScreenInputText,
  SE_BALL,
  SE_SELECT,
  STATE_MOVE_TO_OK_BUTTON,
  STATE_PRESSED_OK,
  STATE_START_PAGE_SWAP,
  AddTextCharacter,
  CurrentPageToKeyboardId,
  CurrentPageToNextKeyboardId,
  DoNamingScreen,
  GetCurrentPageColumnCount,
  GetCursorPos,
  GetKeyRoleAtCursorPos,
  KeyboardKeyHandler_OK,
  MainState_PressedOKButton,
  NamingScreen_Init,
  PageToNextGfxId,
  SaveInputText,
  SetCursorPos,
  StartPageSwapAnim,
  Task_HandlePageSwapAnim,
  createNamingScreenRuntime,
  stepNamingScreen,
  type NamingScreenState
} from '../src/game/decompNamingScreen';
import type { InputSnapshot } from '../src/input/inputState';

const neutralInput: InputSnapshot = {
  up: false,
  down: false,
  left: false,
  right: false,
  upPressed: false,
  downPressed: false,
  leftPressed: false,
  rightPressed: false,
  run: false,
  interact: false,
  interactPressed: false,
  start: false,
  startPressed: false,
  cancel: false,
  cancelPressed: false
};

const makeState = (): NamingScreenState => ({
  kind: 'nickname',
  slot: 0,
  species: 'SPECIES_CHARMANDER',
  textBuffer: '',
  destBuffer: 'CHARMANDER',
  cursorX: 0,
  cursorY: 0,
  buttonId: 0,
  maxLength: 10,
  currentPage: 'upper',
  initialPage: 'upper',
  copyExistingString: false,
  title: "'s nickname?"
});

describe('decomp naming screen', () => {
  test('uses FireRed cursor positions and button-column roles', () => {
    const state = makeState();
    expect(getNamingScreenCursorRenderState(state)).toMatchObject({
      role: 'char',
      screenX: 38,
      screenY: 88
    });

    stepNamingScreen(state, { ...neutralInput, left: true, leftPressed: true });
    expect(state).toMatchObject({ cursorX: 8, cursorY: 0 });
    expect(getNamingScreenKeyRole(state)).toBe('page');

    stepNamingScreen(state, { ...neutralInput, down: true, downPressed: true });
    expect(state).toMatchObject({ cursorX: 8, cursorY: 1 });
    expect(getNamingScreenKeyRole(state)).toBe('backspace');

    stepNamingScreen(state, { ...neutralInput, down: true, downPressed: true });
    expect(state).toMatchObject({ cursorX: 8, cursorY: 2 });
    expect(getNamingScreenKeyRole(state)).toBe('ok');
  });

  test('cycles upper to lower to symbols like sPageToKeyboardId and preserves empty OK text', () => {
    const state = makeState();
    stepNamingScreen(state, { ...neutralInput, select: true, selectPressed: true });
    expect(state.currentPage).toBe('lower');
    stepNamingScreen(state, { ...neutralInput, select: true, selectPressed: true });
    expect(state.currentPage).toBe('symbols');

    moveNamingScreenCursorToOkButton(state);
    expect(stepNamingScreen(state, { ...neutralInput, interact: true, interactPressed: true })).toBe('finished');
    expect(saveNamingScreenInputText(state)).toBe('CHARMANDER');
  });

  test('A inserts from the current page and B deletes instead of closing', () => {
    const state = makeState();
    stepNamingScreen(state, { ...neutralInput, interact: true, interactPressed: true });
    expect(state.textBuffer).toBe('A');

    stepNamingScreen(state, { ...neutralInput, cancel: true, cancelPressed: true });
    expect(state.textBuffer).toBe('');
    expect(saveNamingScreenInputText(state)).toBe('CHARMANDER');
  });

  test('exports the FireRed template and page-swap tables exactly', () => {
    const state = makeState();
    const template = getNamingScreenTemplate('nickname');

    expect(template).toMatchObject({
      copyExistingString: false,
      maxChars: POKEMON_NAME_LENGTH,
      iconFunction: 3,
      addGenderIcon: true,
      initialPage: 'upper',
      title: "'s nickname?"
    });
    expect(NAMING_SCREEN_MAX_MON_CHARS).toBe(POKEMON_NAME_LENGTH);
    expect(getNamingScreenNextGfxId(state)).toBe(PAGE_SWAP_LOWER);
    expect(getNamingScreenNextKeyboardId(state)).toBe('lower');
    expect(isNamingScreenWideLetter('A')).toBe(false);
  });

  test('uses C text caret helpers when the buffer is empty, partial, or full', () => {
    const state = makeState();
    expect(getNamingScreenTextEntryPosition(state)).toBe(0);
    expect(getNamingScreenPreviousTextCaretPosition(state)).toBe(0);

    state.textBuffer = 'AB';
    expect(getNamingScreenTextEntryPosition(state)).toBe(2);
    expect(getNamingScreenPreviousTextCaretPosition(state)).toBe(1);

    state.textBuffer = 'ABCDEFGHIJ';
    expect(getNamingScreenTextEntryPosition(state)).toBe(9);
    expect(getNamingScreenPreviousTextCaretPosition(state)).toBe(9);
  });

  test('overwrites the final slot and moves to OK when AddTextCharacter fills the C buffer', () => {
    const state = makeState();
    state.textBuffer = 'ABCDEFGHIJ';
    state.cursorX = 1;
    state.cursorY = 0;

    expect(stepNamingScreen(state, { ...neutralInput, interact: true, interactPressed: true })).toBe('continue');
    expect(state.textBuffer).toBe('ABCDEFGHIB');
    expect(state.cursorX).toBe(8);
    expect(state.cursorY).toBe(2);
  });

  test('symbol keyboard keeps the same static sparse character rows as sKeyboardChars', () => {
    const state = makeState();
    state.currentPage = 'symbols';

    expect(getNamingScreenCharAtKeyboardPos(state, 4, 0)).toBe('4');
    expect(getNamingScreenCharAtKeyboardPos(state, 5, 0)).toBe('');
    expect(getNamingScreenCharAtKeyboardPos(state, 5, 2)).toBe('-');
    expect(getNamingScreenCharAtKeyboardPos(state, 5, 3)).toBe('');
  });

  test('button-column movement preserves the task tButtonId row latch', () => {
    const state = makeState();
    state.cursorX = 7;
    state.cursorY = 3;

    stepNamingScreen(state, { ...neutralInput, right: true, rightPressed: true });
    expect(state).toMatchObject({ cursorX: 8, cursorY: 2, buttonId: 2 });

    stepNamingScreen(state, { ...neutralInput, left: true, leftPressed: true });
    expect(state).toMatchObject({ cursorX: 7, cursorY: 3, buttonId: 2 });
  });

  test('exact HandleKeyboardEvent side effects for char, page, backspace, ok, select, and start', () => {
    const state = makeState();

    expect(handleNamingScreenKeyboardEvent(state, INPUT_A_BUTTON)).toBe(false);
    expect(state.textBuffer).toBe('A');
    expect(state.buttonFlashes).toEqual([{ button: BUTTON_COUNT, keepFlashing: false, interruptCurFlash: false }]);
    expect(state.playedSoundEffects).toEqual([SE_SELECT]);
    expect(state.cursorSquished).toBe(1);

    state.cursorX = 8;
    state.cursorY = 0;
    expect(handleNamingScreenKeyboardEvent(state, INPUT_A_BUTTON)).toBe(true);
    expect(state.buttonFlashes?.at(-1)).toEqual({ button: BUTTON_PAGE, keepFlashing: true, interruptCurFlash: false });
    expect(state.cState).toBe(STATE_START_PAGE_SWAP);

    state.cState = undefined;
    state.cursorY = 1;
    expect(handleNamingScreenKeyboardEvent(state, INPUT_A_BUTTON)).toBe(false);
    expect(state.textBuffer).toBe('');
    expect(state.buttonFlashes?.slice(-2)).toEqual([
      { button: BUTTON_BACK, keepFlashing: true, interruptCurFlash: false },
      { button: BUTTON_BACK, keepFlashing: false, interruptCurFlash: true }
    ]);
    expect(state.playedSoundEffects?.at(-1)).toBe(SE_BALL);

    state.cursorY = 2;
    expect(handleNamingScreenKeyboardEvent(state, INPUT_A_BUTTON)).toBe(true);
    expect(state.buttonFlashes?.at(-1)).toEqual({ button: BUTTON_OK, keepFlashing: true, interruptCurFlash: false });
    expect(state.playedSoundEffects?.at(-1)).toBe(SE_SELECT);
    expect(state.cState).toBe(STATE_PRESSED_OK);

    state.cState = undefined;
    expect(handleNamingScreenKeyboardEvent(state, INPUT_SELECT)).toBe(true);
    expect(state.cState).toBe(STATE_START_PAGE_SWAP);

    state.cursorX = 0;
    state.cursorY = 3;
    handleNamingScreenKeyboardEvent(state, INPUT_START);
    expect(state.cursorX).toBe(8);
    expect(state.cursorY).toBe(2);

    state.textBuffer = 'ABCDEFGHIJ';
    state.cursorX = 1;
    state.cursorY = 0;
    state.cState = undefined;
    expect(handleNamingScreenKeyboardEvent(state, INPUT_A_BUTTON)).toBe(false);
    expect(state.textBuffer).toBe('ABCDEFGHIB');
    expect(state.inputState).toBe(INPUT_STATE_DISABLED);
    expect(state.cState).toBe(STATE_MOVE_TO_OK_BUTTON);

    state.cursorX = 0;
    state.cursorY = 0;
    handleNamingScreenKeyboardEvent(state, INPUT_B_BUTTON);
    expect(state.playedSoundEffects?.at(-1)).toBe(SE_BALL);
  });

  test('C-named runtime entrypoints expose the decomp naming-screen state machine', () => {
    const runtime = createNamingScreenRuntime({ destBuffer: 'OLDNAME', textBuffer: '' });

    DoNamingScreen(3, 'PIKACHU', 25, 0, 123, 'returnToField', runtime);
    expect(runtime.mainCallback2).toBe('CB2_LoadNamingScreen');
    expect(runtime.screen.maxLength).toBe(POKEMON_NAME_LENGTH);

    NamingScreen_Init(runtime);
    expect(runtime.screen.currentPage).toBe('upper');
    expect(CurrentPageToKeyboardId(runtime)).toBe(1);
    expect(CurrentPageToNextKeyboardId(runtime)).toBe(0);
    expect(PageToNextGfxId(1)).toBe(PAGE_SWAP_LOWER);

    SetCursorPos(0, 0, runtime);
    expect(GetCursorPos(runtime)).toEqual([0, 0]);
    expect(GetCurrentPageColumnCount(runtime)).toBe(8);
    expect(GetKeyRoleAtCursorPos(runtime)).toBe(0);

    expect(AddTextCharacter(runtime)).toBe(false);
    expect(runtime.screen.textBuffer).toBe('A');

    SetCursorPos(8, 2, runtime);
    expect(KeyboardKeyHandler_OK(INPUT_A_BUTTON, runtime)).toBe(true);
    expect(runtime.screen.cState).toBe(STATE_PRESSED_OK);

    expect(MainState_PressedOKButton(runtime)).toBe(true);
    expect(runtime.screen.destBuffer).toBe('A');

    runtime.screen.currentPage = 'upper';
    StartPageSwapAnim(runtime);
    expect(runtime.pageSwapAnimInProgress).toBe(true);
    while (runtime.pageSwapAnimInProgress) {
      Task_HandlePageSwapAnim(0, runtime);
    }
    expect(runtime.tasks[0].destroyed).toBe(true);

    runtime.screen.textBuffer = '';
    runtime.screen.destBuffer = 'FALLBACK';
    SaveInputText(runtime);
    expect(runtime.inputText).toBe('FALLBACK');
  });
});
