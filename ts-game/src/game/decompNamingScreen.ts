import type { InputSnapshot } from '../input/inputState';
import { gText_AlphabetUpperLower } from './decompStrings';

export type NamingKeyboardPage = 'symbols' | 'upper' | 'lower';
export type NamingKeyRole = 'char' | 'page' | 'backspace' | 'ok';
export type NamingKeyboardId = 'lower' | 'upper' | 'symbols';

export type NamingScreenTemplateId = 'player' | 'box' | 'caughtMon' | 'nickname' | 'rival';

export interface NamingScreenTemplate {
  copyExistingString: boolean;
  maxChars: number;
  iconFunction: number;
  addGenderIcon: boolean;
  initialPage: NamingKeyboardPage;
  title: string;
}

export interface NamingScreenState {
  kind: 'nickname';
  slot: number;
  species: string;
  textBuffer: string;
  destBuffer: string;
  cursorX: number;
  cursorY: number;
  buttonId: number;
  maxLength: number;
  currentPage: NamingKeyboardPage;
  initialPage: NamingKeyboardPage;
  copyExistingString: boolean;
  title: string;
  cState?: number;
  inputState?: number;
  cursorSquished?: number;
  buttonFlashes?: Array<{ button: number; keepFlashing: boolean; interruptCurFlash: boolean }>;
  playedSoundEffects?: number[];
}

export interface NamingCursorRenderState {
  x: number;
  y: number;
  role: NamingKeyRole;
  screenX: number;
  screenY: number;
}

export const NAMING_SCREEN_MAX_MON_CHARS = 10;
export const NAMING_SCREEN_INITIAL_MON_PAGE: NamingKeyboardPage = 'upper';
export const NAMING_SCREEN_MON_TITLE = "'s nickname?";
export const PLAYER_NAME_LENGTH = 7;
export const BOX_NAME_LENGTH = 8;
export const POKEMON_NAME_LENGTH = 10;
export const CHAR_SPACE = ' ';
export const EOS = '';

export const INPUT_NONE = 0;
export const INPUT_DPAD_UP = 1;
export const INPUT_DPAD_DOWN = 2;
export const INPUT_DPAD_LEFT = 3;
export const INPUT_DPAD_RIGHT = 4;
export const INPUT_A_BUTTON = 5;
export const INPUT_B_BUTTON = 6;
export const INPUT_LR_BUTTON = 7;
export const INPUT_SELECT = 8;
export const INPUT_START = 9;

export const STATE_FADE_IN = 0;
export const STATE_WAIT_FADE_IN = 1;
export const STATE_HANDLE_INPUT = 2;
export const STATE_MOVE_TO_OK_BUTTON = 3;
export const STATE_START_PAGE_SWAP = 4;
export const STATE_WAIT_PAGE_SWAP = 5;
export const STATE_PRESSED_OK = 6;
export const STATE_WAIT_SENT_TO_PC_MESSAGE = 7;
export const STATE_FADE_OUT = 8;
export const STATE_EXIT = 9;

export const INPUT_STATE_DISABLED = 0;
export const INPUT_STATE_ENABLED = 1;

export const KBPAGE_SYMBOLS = 0;
export const KBPAGE_LETTERS_UPPER = 1;
export const KBPAGE_LETTERS_LOWER = 2;
export const KBPAGE_COUNT = 3;

export const KEYBOARD_LETTERS_LOWER = 0;
export const KEYBOARD_LETTERS_UPPER = 1;
export const KEYBOARD_SYMBOLS = 2;

export const PAGE_SWAP_UPPER = 0;
export const PAGE_SWAP_OTHERS = 1;
export const PAGE_SWAP_LOWER = 2;

export const KEY_ROLE_CHAR = 0;
export const KEY_ROLE_PAGE = 1;
export const KEY_ROLE_BACKSPACE = 2;
export const KEY_ROLE_OK = 3;

export const NAMING_SCREEN_PLAYER = 0;
export const NAMING_SCREEN_BOX = 1;
export const NAMING_SCREEN_CAUGHT_MON = 2;
export const NAMING_SCREEN_NICKNAME = 3;
export const NAMING_SCREEN_RIVAL = 4;

const KBROW_COUNT = 4;
const KBCOL_COUNT = 8;
export const BUTTON_COUNT = 3;
export const BUTTON_PAGE = 0;
export const BUTTON_BACK = 1;
export const BUTTON_OK = 2;

export const SE_SELECT = 5;
export const SE_BALL = 23;

const pageCycle: NamingKeyboardPage[] = ['symbols', 'upper', 'lower'];
const pageToKeyboardId: Record<NamingKeyboardPage, NamingKeyboardId> = {
  symbols: 'symbols',
  upper: 'upper',
  lower: 'lower'
};

const pageToNextGfxId: Record<NamingKeyboardPage, number> = {
  symbols: PAGE_SWAP_UPPER,
  upper: PAGE_SWAP_LOWER,
  lower: PAGE_SWAP_OTHERS
};

const pageToNextKeyboardId: Record<NamingKeyboardPage, NamingKeyboardId> = {
  symbols: 'upper',
  upper: 'lower',
  lower: 'symbols'
};

const pageColumnCounts: Record<NamingKeyboardId, number> = {
  lower: KBCOL_COUNT,
  upper: KBCOL_COUNT,
  symbols: 6
};

const pageColumnXPos: Record<NamingKeyboardId, number[]> = {
  lower: [0, 12, 24, 56, 68, 80, 92, 123],
  upper: [0, 12, 24, 56, 68, 80, 92, 123],
  symbols: [0, 22, 44, 66, 88, 110]
};

const keyboardChars: Record<NamingKeyboardId, string[][]> = {
  lower: [
    ['a', 'b', 'c', 'd', 'e', 'f', CHAR_SPACE, '.'],
    ['g', 'h', 'i', 'j', 'k', 'l', CHAR_SPACE, ','],
    ['m', 'n', 'o', 'p', 'q', 'r', 's'],
    ['t', 'u', 'v', 'w', 'x', 'y', 'z']
  ],
  upper: [
    ['A', 'B', 'C', 'D', 'E', 'F', CHAR_SPACE, '.'],
    ['G', 'H', 'I', 'J', 'K', 'L', CHAR_SPACE, ','],
    ['M', 'N', 'O', 'P', 'Q', 'R', 'S'],
    ['T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  ],
  symbols: [
    ['0', '1', '2', '3', '4'],
    ['5', '6', '7', '8', '9'],
    ['!', '?', '♂', '♀', '/', '-'],
    ['…', '“', '”', '‘', "'"]
  ]
};

const buttonKeyRoles: NamingKeyRole[] = ['page', 'backspace', 'ok'];

export const namingScreenTemplates: Record<NamingScreenTemplateId, NamingScreenTemplate> = {
  player: {
    copyExistingString: false,
    maxChars: PLAYER_NAME_LENGTH,
    iconFunction: 1,
    addGenderIcon: false,
    initialPage: 'upper',
    title: 'Your name?'
  },
  box: {
    copyExistingString: false,
    maxChars: BOX_NAME_LENGTH,
    iconFunction: 2,
    addGenderIcon: false,
    initialPage: 'upper',
    title: 'Box name?'
  },
  caughtMon: {
    copyExistingString: false,
    maxChars: POKEMON_NAME_LENGTH,
    iconFunction: 3,
    addGenderIcon: true,
    initialPage: 'upper',
    title: NAMING_SCREEN_MON_TITLE
  },
  nickname: {
    copyExistingString: false,
    maxChars: POKEMON_NAME_LENGTH,
    iconFunction: 3,
    addGenderIcon: true,
    initialPage: 'upper',
    title: NAMING_SCREEN_MON_TITLE
  },
  rival: {
    copyExistingString: false,
    maxChars: PLAYER_NAME_LENGTH,
    iconFunction: 4,
    addGenderIcon: false,
    initialPage: 'upper',
    title: "Rival's name?"
  }
};

export const getNamingScreenTemplate = (templateId: NamingScreenTemplateId): NamingScreenTemplate =>
  namingScreenTemplates[templateId];

export const getNamingScreenKeyboardId = (state: NamingScreenState): NamingKeyboardId =>
  pageToKeyboardId[state.currentPage];

export const getNamingScreenCurrentPageColumnCount = (state: NamingScreenState): number =>
  pageColumnCounts[getNamingScreenKeyboardId(state)];

export const getNamingScreenNextGfxId = (state: NamingScreenState): number =>
  pageToNextGfxId[state.currentPage];

export const getNamingScreenNextKeyboardId = (state: NamingScreenState): NamingKeyboardId =>
  pageToNextKeyboardId[state.currentPage];

export const getNamingScreenKeyRole = (state: NamingScreenState): NamingKeyRole =>
  state.cursorX < getNamingScreenCurrentPageColumnCount(state)
    ? 'char'
    : buttonKeyRoles[state.cursorY] ?? 'ok';

export const getNamingScreenCursorRenderState = (state: NamingScreenState): NamingCursorRenderState => {
  const keyboardId = getNamingScreenKeyboardId(state);
  const columns = getNamingScreenCurrentPageColumnCount(state);
  const screenX = state.cursorX < columns
    ? (pageColumnXPos[keyboardId][state.cursorX] ?? 0) + 38
    : 0;
  return {
    x: state.cursorX,
    y: state.cursorY,
    role: getNamingScreenKeyRole(state),
    screenX,
    screenY: state.cursorY * 16 + 88
  };
};

export const getNamingScreenKeyboardChars = (state: NamingScreenState): string[][] =>
  keyboardChars[getNamingScreenKeyboardId(state)];

export const getNamingScreenCharAtKeyboardPos = (state: NamingScreenState, x: number, y: number): string =>
  keyboardChars[getNamingScreenKeyboardId(state)][y]?.[x] ?? EOS;

export const getNamingScreenTextEntryPosition = (state: NamingScreenState): number => {
  const limit = Math.max(0, state.maxLength);
  for (let i = 0; i < limit; i += 1) {
    if ((state.textBuffer[i] ?? EOS) === EOS) {
      return i;
    }
  }
  return Math.max(0, limit - 1);
};

export const getNamingScreenPreviousTextCaretPosition = (state: NamingScreenState): number => {
  for (let i = Math.max(0, state.maxLength - 1); i > 0; i -= 1) {
    if ((state.textBuffer[i] ?? EOS) !== EOS) {
      return i;
    }
  }
  return 0;
};

export const isNamingScreenWideLetter = (character: string): boolean => {
  for (const alphabetChar of gText_AlphabetUpperLower) {
    if (character === alphabetChar) {
      return true;
    }
  }
  return false;
};

export const swapNamingScreenKeyboardPage = (state: NamingScreenState): void => {
  const index = pageCycle.indexOf(state.currentPage);
  state.currentPage = pageCycle[(index + 1) % pageCycle.length] ?? NAMING_SCREEN_INITIAL_MON_PAGE;
  state.cursorX = Math.min(state.cursorX, getNamingScreenCurrentPageColumnCount(state));
};

export const moveNamingScreenCursorToOkButton = (state: NamingScreenState): void => {
  state.cursorX = getNamingScreenCurrentPageColumnCount(state);
  state.cursorY = BUTTON_OK;
};

const ensureButtonFlashes = (state: NamingScreenState): Array<{ button: number; keepFlashing: boolean; interruptCurFlash: boolean }> => {
  state.buttonFlashes ??= [];
  return state.buttonFlashes;
};

const ensurePlayedSoundEffects = (state: NamingScreenState): number[] => {
  state.playedSoundEffects ??= [];
  return state.playedSoundEffects;
};

const tryStartButtonFlash = (
  state: NamingScreenState,
  button: number,
  keepFlashing: boolean,
  interruptCurFlash: boolean
): void => {
  ensureButtonFlashes(state).push({ button, keepFlashing, interruptCurFlash });
};

const playSE = (state: NamingScreenState, soundEffect: number): void => {
  ensurePlayedSoundEffects(state).push(soundEffect);
};

const setInputState = (state: NamingScreenState, inputState: number): void => {
  state.inputState = inputState;
};

const squishCursor = (state: NamingScreenState): void => {
  state.cursorSquished = (state.cursorSquished ?? 0) + 1;
};

export const deleteNamingScreenTextCharacter = (state: NamingScreenState): void => {
  const index = getNamingScreenPreviousTextCaretPosition(state);
  state.textBuffer = state.textBuffer.slice(0, index);
  const keyRole = getNamingScreenKeyRole(state);
  if (keyRole === 'char' || keyRole === 'backspace')
    tryStartButtonFlash(state, BUTTON_BACK, false, true);
  playSE(state, SE_BALL);
};

export const addNamingScreenTextCharacter = (state: NamingScreenState): boolean => {
  const char = getNamingScreenCharAtKeyboardPos(state, state.cursorX, state.cursorY);
  if (char === EOS) {
    return state.textBuffer.length >= state.maxLength - 1;
  }
  const index = getNamingScreenTextEntryPosition(state);
  state.textBuffer = `${state.textBuffer.slice(0, index)}${char}`;
  return getNamingScreenPreviousTextCaretPosition(state) === state.maxLength - 1;
};

export const swapNamingScreenKeyboardPageState = (state: NamingScreenState): boolean => {
  state.cState = STATE_START_PAGE_SWAP;
  return true;
};

export const handleNamingScreenKeyboardEvent = (state: NamingScreenState, inputEvent: number): boolean => {
  const keyRole = getNamingScreenKeyRole(state);

  if (inputEvent === INPUT_SELECT)
    return swapNamingScreenKeyboardPageState(state);
  if (inputEvent === INPUT_B_BUTTON) {
    deleteNamingScreenTextCharacter(state);
    return false;
  }
  if (inputEvent === INPUT_START) {
    moveNamingScreenCursorToOkButton(state);
    return false;
  }

  switch (keyRole) {
    case 'char':
      tryStartButtonFlash(state, BUTTON_COUNT, false, false);
      if (inputEvent === INPUT_A_BUTTON) {
        const textFull = addNamingScreenTextCharacter(state);
        playSE(state, SE_SELECT);
        squishCursor(state);
        if (textFull) {
          setInputState(state, INPUT_STATE_DISABLED);
          state.cState = STATE_MOVE_TO_OK_BUTTON;
        }
      }
      return false;
    case 'page':
      tryStartButtonFlash(state, BUTTON_PAGE, true, false);
      if (inputEvent === INPUT_A_BUTTON)
        return swapNamingScreenKeyboardPageState(state);
      return false;
    case 'backspace':
      tryStartButtonFlash(state, BUTTON_BACK, true, false);
      if (inputEvent === INPUT_A_BUTTON)
        deleteNamingScreenTextCharacter(state);
      return false;
    case 'ok':
      tryStartButtonFlash(state, BUTTON_OK, true, false);
      if (inputEvent === INPUT_A_BUTTON) {
        playSE(state, SE_SELECT);
        state.cState = STATE_PRESSED_OK;
        return true;
      }
      return false;
  }
};

const moveNamingScreenCursor = (state: NamingScreenState, dx: number, dy: number): void => {
  const keyRowToButtonRow = [0, 1, 1, 2];
  const buttonRowToKeyRow = [0, 0, 3];
  let cursorX = state.cursorX + dx;
  let cursorY = state.cursorY + dy;
  const prevCursorX = state.cursorX;
  const columnCount = getNamingScreenCurrentPageColumnCount(state);

  if (cursorX < 0) {
    cursorX = columnCount;
  }
  if (cursorX > columnCount) {
    cursorX = 0;
  }

  if (dx !== 0) {
    if (cursorX === columnCount) {
      state.buttonId = cursorY;
      cursorY = keyRowToButtonRow[cursorY] ?? 0;
    } else if (prevCursorX === columnCount) {
      cursorY = cursorY === Math.floor(BUTTON_COUNT / 2)
        ? state.buttonId
        : buttonRowToKeyRow[cursorY] ?? 0;
    }
  }

  if (cursorX === columnCount) {
    if (cursorY < 0) {
      cursorY = BUTTON_COUNT - 1;
    }
    if (cursorY >= BUTTON_COUNT) {
      cursorY = 0;
    }
    if (cursorY === 0) {
      state.buttonId = BUTTON_BACK;
    } else if (cursorY === BUTTON_COUNT - 1) {
      state.buttonId = BUTTON_OK;
    }
  } else {
    if (cursorY < 0) {
      cursorY = KBROW_COUNT - 1;
    }
    if (cursorY >= KBROW_COUNT) {
      cursorY = 0;
    }
  }

  state.cursorX = cursorX;
  state.cursorY = cursorY;
};

export const saveNamingScreenInputText = (state: NamingScreenState): string => {
  for (let i = 0; i < state.maxLength; i += 1) {
    const char = state.textBuffer[i] ?? EOS;
    if (char !== CHAR_SPACE && char !== EOS) {
      return state.textBuffer.slice(0, state.maxLength);
    }
  }
  return state.destBuffer;
};

export const stepNamingScreen = (
  state: NamingScreenState,
  input: InputSnapshot
): 'continue' | 'finished' => {
  if (input.upPressed) {
    moveNamingScreenCursor(state, 0, -1);
  } else if (input.downPressed) {
    moveNamingScreenCursor(state, 0, 1);
  } else if (input.leftPressed) {
    moveNamingScreenCursor(state, -1, 0);
  } else if (input.rightPressed) {
    moveNamingScreenCursor(state, 1, 0);
  } else if (input.selectPressed) {
    swapNamingScreenKeyboardPage(state);
  } else if (input.cancelPressed) {
    deleteNamingScreenTextCharacter(state);
  } else if (input.startPressed) {
    moveNamingScreenCursorToOkButton(state);
  } else if (input.interactPressed) {
    switch (getNamingScreenKeyRole(state)) {
      case 'char':
        if (addNamingScreenTextCharacter(state)) {
          moveNamingScreenCursorToOkButton(state);
        }
        break;
      case 'page':
        swapNamingScreenKeyboardPage(state);
        break;
      case 'backspace':
        deleteNamingScreenTextCharacter(state);
        break;
      case 'ok':
        return 'finished';
    }
  }

  return 'continue';
};

export interface NamingScreenSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  animEnded: boolean;
  callback: string;
  palette: number;
  tileStart: number;
  subspriteTableNum: number;
}

export interface NamingScreenTask {
  data: number[];
  destroyed: boolean;
}

export interface NamingScreenRuntime {
  screen: NamingScreenState;
  operations: string[];
  sprites: NamingScreenSprite[];
  tasks: NamingScreenTask[];
  mainCallback2: string;
  returnCallback: string;
  mainState: number;
  paletteFadeActive: boolean;
  pageSwapAnimInProgress: boolean;
  inputEvent: number;
  textPrinterActive: boolean;
  aButtonPressed: boolean;
  destinationBoxFull: boolean;
  partyCount: number;
  inputText: string;
  sentToPcMessage: string;
  bg1vOffset: number;
  bg2vOffset: number;
  bg1Priority: number;
  bg2Priority: number;
  bgToReveal: number;
  bgToHide: number;
  cursorSpriteId: number;
  swapBtnFrameSpriteId: number;
  keyRepeatStartDelayCopy: number;
  visibleSprites: boolean;
  bgsShown: boolean;
  vblankSet: boolean;
  stopped: boolean;
}

const makeNamingSprite = (): NamingScreenSprite => ({
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  invisible: true,
  animEnded: true,
  callback: '',
  palette: 0,
  tileStart: 0,
  subspriteTableNum: 0
});

const makeNamingTask = (): NamingScreenTask => ({
  data: Array.from({ length: 8 }, () => 0),
  destroyed: false
});

let activeNamingScreenRuntime: NamingScreenRuntime | null = null;

export function createNamingScreenRuntime(screen?: Partial<NamingScreenState>): NamingScreenRuntime {
  const runtime: NamingScreenRuntime = {
    screen: {
      kind: 'nickname',
      slot: 0,
      species: 'SPECIES_NONE',
      textBuffer: '',
      destBuffer: '',
      cursorX: 0,
      cursorY: 0,
      buttonId: 0,
      maxLength: POKEMON_NAME_LENGTH,
      currentPage: 'upper',
      initialPage: 'upper',
      copyExistingString: false,
      title: NAMING_SCREEN_MON_TITLE,
      ...screen
    },
    operations: [],
    sprites: [],
    tasks: [],
    mainCallback2: '',
    returnCallback: 'returnCallback',
    mainState: 0,
    paletteFadeActive: false,
    pageSwapAnimInProgress: false,
    inputEvent: INPUT_NONE,
    textPrinterActive: false,
    aButtonPressed: false,
    destinationBoxFull: false,
    partyCount: 0,
    inputText: '',
    sentToPcMessage: '',
    bg1vOffset: 0,
    bg2vOffset: 0,
    bg1Priority: 1,
    bg2Priority: 2,
    bgToReveal: 0,
    bgToHide: 1,
    cursorSpriteId: 0,
    swapBtnFrameSpriteId: 0,
    keyRepeatStartDelayCopy: 0,
    visibleSprites: false,
    bgsShown: false,
    vblankSet: false,
    stopped: false
  };
  activeNamingScreenRuntime = runtime;
  return runtime;
}

const namingReq = (runtime?: NamingScreenRuntime): NamingScreenRuntime => {
  const r = runtime ?? activeNamingScreenRuntime;
  if (!r) throw new Error('naming screen runtime is not active');
  return r;
};
const namingOp = (r: NamingScreenRuntime, name: string, ...args: Array<string | number | boolean>): void => {
  r.operations.push([name, ...args].join(':'));
};
const namingTask = (r: NamingScreenRuntime, id: number): NamingScreenTask => r.tasks[id] ?? (r.tasks[id] = makeNamingTask());
const namingSprite = (r: NamingScreenRuntime, id: number): NamingScreenSprite => r.sprites[id] ?? (r.sprites[id] = makeNamingSprite());
const createNamingSprite = (r: NamingScreenRuntime, callback: string, x: number, y: number): number => {
  const id = r.sprites.length;
  r.sprites.push({ ...makeNamingSprite(), callback, x, y });
  return id;
};
const pageFromId = (page: number): NamingKeyboardPage => (['symbols', 'upper', 'lower'][page] ?? 'upper') as NamingKeyboardPage;
const pageId = (page: NamingKeyboardPage): number => ({ symbols: KBPAGE_SYMBOLS, upper: KBPAGE_LETTERS_UPPER, lower: KBPAGE_LETTERS_LOWER })[page];
const keyboardIdNumber = (id: NamingKeyboardId): number => ({ lower: KEYBOARD_LETTERS_LOWER, upper: KEYBOARD_LETTERS_UPPER, symbols: KEYBOARD_SYMBOLS })[id];

export function DoNamingScreen(templateNum: number, destBuffer = '', monSpecies = 0, monGender = 0, monPersonality = 0, returnCallback = 'returnCallback', runtime = createNamingScreenRuntime()): void {
  const templateKey = (['player', 'box', 'caughtMon', 'nickname', 'rival'][templateNum] ?? 'nickname') as NamingScreenTemplateId;
  const template = getNamingScreenTemplate(templateKey);
  runtime.screen = {
    ...runtime.screen,
    destBuffer,
    species: String(monSpecies),
    maxLength: template.maxChars,
    currentPage: template.initialPage,
    initialPage: template.initialPage,
    copyExistingString: template.copyExistingString,
    title: template.title
  };
  runtime.returnCallback = returnCallback;
  namingOp(runtime, 'DoNamingScreen', templateNum, monGender, monPersonality);
  runtime.mainCallback2 = 'CB2_LoadNamingScreen';
}
export function CB2_LoadNamingScreen(runtime = namingReq()): void {
  const steps = [ResetVHBlank, NamingScreen_Init, NamingScreen_InitBGs, LoadPalettes, LoadGfx, CreateSprites, NamingScreen_ShowBgs, CreateHelperTasks, CreateNamingScreenTask];
  const step = steps[Math.min(runtime.mainState, steps.length - 1)];
  step(runtime);
  runtime.mainState++;
}
export function NamingScreen_Init(runtime = namingReq()): void {
  runtime.screen.cState = STATE_FADE_IN;
  runtime.bg1vOffset = 0;
  runtime.bg2vOffset = 0;
  runtime.bg1Priority = 1;
  runtime.bg2Priority = 2;
  runtime.bgToReveal = 0;
  runtime.bgToHide = 1;
  runtime.screen.currentPage = runtime.screen.initialPage;
  if (runtime.screen.copyExistingString) runtime.screen.textBuffer = runtime.screen.destBuffer;
  namingOp(runtime, 'NamingScreen_Init');
}
export function SetSpritesVisible(runtime = namingReq()): void { runtime.visibleSprites = true; SetCursorInvisibility(0, runtime); }
export function NamingScreen_InitBGs(runtime = namingReq()): void { namingOp(runtime, 'NamingScreen_InitBGs'); }
export function CreateNamingScreenTask(runtime = namingReq()): void { runtime.mainCallback2 = 'CB2_NamingScreen'; namingOp(runtime, 'CreateTask:Task_NamingScreen'); }
export function Task_NamingScreen(taskId = 0, runtime = namingReq()): void {
  namingOp(runtime, 'Task_NamingScreen', taskId);
  const state = runtime.screen.cState ?? STATE_FADE_IN;
  [MainState_FadeIn, MainState_WaitFadeIn, MainState_HandleInput, MainState_MoveToOKButton, MainState_StartPageSwap, MainState_WaitPageSwap, MainState_PressedOKButton, MainState_WaitSentToPCMessage, MainState_FadeOut, MainState_Exit][state]?.(runtime);
}
export function PageToNextGfxId(page: number): number { return pageToNextGfxId[pageFromId(page)]; }
export function CurrentPageToNextKeyboardId(runtime = namingReq()): number { return keyboardIdNumber(pageToNextKeyboardId[runtime.screen.currentPage]); }
export function CurrentPageToKeyboardId(runtime = namingReq()): number { return keyboardIdNumber(pageToKeyboardId[runtime.screen.currentPage]); }
export function MainState_FadeIn(runtime = namingReq()): boolean { runtime.screen.currentPage = 'upper'; namingOp(runtime, 'BeginNormalPaletteFade'); runtime.screen.cState = STATE_WAIT_FADE_IN; return false; }
export function MainState_WaitFadeIn(runtime = namingReq()): boolean { if (!runtime.paletteFadeActive) { SetInputState(INPUT_STATE_ENABLED, runtime); SetCursorFlashing(1, runtime); runtime.screen.cState = STATE_HANDLE_INPUT; } return false; }
export function MainState_HandleInput(runtime = namingReq()): boolean { return HandleKeyboardEvent(runtime); }
export function MainState_MoveToOKButton(runtime = namingReq()): boolean { if (IsCursorAnimFinished(runtime)) { SetInputState(INPUT_STATE_ENABLED, runtime); MoveCursorToOKButton(runtime); runtime.screen.cState = STATE_HANDLE_INPUT; } return false; }
export function MainState_PressedOKButton(runtime = namingReq()): boolean { SaveInputText(runtime); SetInputState(INPUT_STATE_DISABLED, runtime); SetCursorFlashing(0, runtime); TryStartButtonFlash(BUTTON_COUNT, 0, 1, runtime); runtime.screen.cState = runtime.partyCount >= 6 && runtime.screen.title === NAMING_SCREEN_MON_TITLE ? STATE_WAIT_SENT_TO_PC_MESSAGE : STATE_FADE_OUT; return runtime.screen.cState === STATE_FADE_OUT; }
export function MainState_FadeOut(runtime = namingReq()): boolean { namingOp(runtime, 'BeginNormalPaletteFadeOut'); runtime.screen.cState = STATE_EXIT; return false; }
export function MainState_Exit(runtime = namingReq()): boolean { if (!runtime.paletteFadeActive) { runtime.mainCallback2 = runtime.returnCallback; runtime.stopped = true; namingOp(runtime, 'RestoreHelpContext'); } return false; }
export function DisplaySentToPCMessage(runtime = namingReq()): void { runtime.sentToPcMessage = runtime.destinationBoxFull ? 'Text_MonSentToBoxSomeonesBoxFull' : 'Text_MonSentToBoxInSomeonesPC'; namingOp(runtime, 'DisplaySentToPCMessage', runtime.sentToPcMessage); }
export function MainState_WaitSentToPCMessage(runtime = namingReq()): boolean { if (!runtime.textPrinterActive && runtime.aButtonPressed) runtime.screen.cState = STATE_FADE_OUT; return false; }
export function MainState_StartPageSwap(runtime = namingReq()): boolean { SetInputState(INPUT_STATE_DISABLED, runtime); StartPageSwapButtonAnim(runtime); StartPageSwapAnim(runtime); SetCursorInvisibility(1, runtime); TryStartButtonFlash(BUTTON_PAGE, 0, 1, runtime); runtime.screen.cState = STATE_WAIT_PAGE_SWAP; return false; }
export function MainState_WaitPageSwap(runtime = namingReq()): boolean { if (IsPageSwapAnimNotInProgress(runtime)) { swapNamingScreenKeyboardPage(runtime.screen); DrawKeyboardPageOnDeck(runtime); SetInputState(INPUT_STATE_ENABLED, runtime); SetCursorInvisibility(0, runtime); runtime.screen.cState = STATE_HANDLE_INPUT; } return false; }
export function StartPageSwapAnim(runtime = namingReq()): void { runtime.pageSwapAnimInProgress = true; const id = runtime.tasks.length; runtime.tasks.push(makeNamingTask()); Task_HandlePageSwapAnim(id, runtime); }
export function Task_HandlePageSwapAnim(taskId = 0, runtime = namingReq()): void { const task = namingTask(runtime, taskId); while ([PageSwapAnimState_Init, PageSwapAnimState_1, PageSwapAnimState_2, PageSwapAnimState_Done][task.data[0]]?.(task, runtime)) undefined; }
export function IsPageSwapAnimNotInProgress(runtime = namingReq()): boolean { return !runtime.pageSwapAnimInProgress; }
export function PageSwapAnimState_Init(task = makeNamingTask(), runtime = namingReq()): boolean { runtime.bg1vOffset = 0; runtime.bg2vOffset = 0; task.data[0]++; return false; }
export function PageSwapAnimState_1(task = makeNamingTask(), runtime = namingReq()): boolean { task.data[1] += 4; runtime.bg2vOffset = Math.trunc(Math.sin(task.data[1] / 128 * Math.PI) * 40); if (task.data[1] >= 64) task.data[0]++; return false; }
export function PageSwapAnimState_2(task = makeNamingTask(), runtime = namingReq()): boolean { task.data[1] += 4; runtime.bg1vOffset = Math.trunc(Math.sin(task.data[1] / 128 * Math.PI) * 40); if (task.data[1] >= 128) { [runtime.bgToReveal, runtime.bgToHide] = [runtime.bgToHide, runtime.bgToReveal]; task.data[0]++; } return false; }
export function PageSwapAnimState_Done(task = makeNamingTask(), runtime = namingReq()): boolean { task.destroyed = true; runtime.pageSwapAnimInProgress = false; return false; }
export function CreateButtonFlashTask(runtime = namingReq()): void { const id = runtime.tasks.length; runtime.tasks.push(makeNamingTask()); runtime.tasks[id].data[0] = BUTTON_COUNT; namingOp(runtime, 'CreateButtonFlashTask', id); }
export function TryStartButtonFlash(button: number, keepFlashing: number | boolean, interruptCurFlash: number | boolean, runtime = namingReq()): void { tryStartButtonFlash(runtime.screen, button, !!keepFlashing, !!interruptCurFlash); }
export function Task_UpdateButtonFlash(taskId = 0, runtime = namingReq()): void { const task = namingTask(runtime, taskId); if (task.data[0] !== BUTTON_COUNT) task.data[3] += task.data[4] || 2; }
export function GetButtonPalOffset(button: number): number { return [14, 30, 46, 33][button] ?? 33; }
export function RestoreButtonColor(button: number, runtime = namingReq()): void { namingOp(runtime, 'RestoreButtonColor', GetButtonPalOffset(button)); }
export function StartButtonFlash(task = makeNamingTask(), button = BUTTON_COUNT, keepFlashing = 0): void { task.data[0] = button; task.data[1] = keepFlashing ? 1 : 0; task.data[2] = 1; task.data[3] = 4; task.data[4] = 2; task.data[5] = 0; task.data[6] = 4; }
export function SpriteCB_Cursor(sprite = makeNamingSprite(), runtime = namingReq()): void { sprite.invisible = !!sprite.data[4] || sprite.data[0] === GetCurrentPageColumnCount(runtime); if (!sprite.invisible) sprite.data[5] = (sprite.data[5] + (sprite.data[6] || 2)) & 0x1f; }
export function SpriteCB_InputArrow(sprite = makeNamingSprite()): void { const x = [0, -4, -2, -1]; if (sprite.data[0] === 0 || --sprite.data[0] === 0) { sprite.data[0] = 8; sprite.data[1] = (sprite.data[1] + 1) & 3; } sprite.x2 = x[sprite.data[1]] ?? 0; }
export function SpriteCB_Underscore(sprite = makeNamingSprite(), runtime = namingReq()): void { const y = [2, 3, 2, 1]; const pos = GetTextEntryPosition(runtime); if (pos !== sprite.data[0]) sprite.y2 = 0; else { sprite.y2 = y[sprite.data[1]] ?? 0; if (++sprite.data[2] > 8) { sprite.data[1] = (sprite.data[1] + 1) & 3; sprite.data[2] = 0; } } }
export function CreateSprites(runtime = namingReq()): void { CreateCursorSprite(runtime); CreatePageSwapButtonSprites(runtime); CreateBackOkSprites(runtime); CreateTextEntrySprites(runtime); CreateInputTargetIcon(runtime); }
export function CreateCursorSprite(runtime = namingReq()): void { runtime.cursorSpriteId = createNamingSprite(runtime, 'SpriteCB_Cursor', 38, 88); SetCursorInvisibility(1, runtime); SetCursorPos(0, 0, runtime); }
export function SetCursorPos(x: number, y: number, runtime = namingReq()): void { runtime.screen.cursorX = x; runtime.screen.cursorY = y; const sprite = namingSprite(runtime, runtime.cursorSpriteId); const render = getNamingScreenCursorRenderState(runtime.screen); sprite.x = render.screenX; sprite.y = render.screenY; sprite.data[0] = x; sprite.data[1] = y; }
export function GetCursorPos(runtime = namingReq()): [number, number] { return [runtime.screen.cursorX, runtime.screen.cursorY]; }
export function MoveCursorToOKButton(runtime = namingReq()): void { moveNamingScreenCursorToOkButton(runtime.screen); SetCursorPos(runtime.screen.cursorX, runtime.screen.cursorY, runtime); }
export function SetCursorInvisibility(invisible: number | boolean, runtime = namingReq()): void { namingSprite(runtime, runtime.cursorSpriteId).data[4] = (namingSprite(runtime, runtime.cursorSpriteId).data[4] & 0xff00) | (invisible ? 1 : 0); }
export function SetCursorFlashing(flashing: number | boolean, runtime = namingReq()): void { namingSprite(runtime, runtime.cursorSpriteId).data[4] = (namingSprite(runtime, runtime.cursorSpriteId).data[4] & 0xff) | (flashing ? 0x100 : 0); }
export function SquishCursor(runtime = namingReq()): void { squishCursor(runtime.screen); }
export function IsCursorAnimFinished(runtime = namingReq()): boolean { return namingSprite(runtime, runtime.cursorSpriteId).animEnded; }
export function GetKeyRoleAtCursorPos(runtime = namingReq()): number { return ({ char: KEY_ROLE_CHAR, page: KEY_ROLE_PAGE, backspace: KEY_ROLE_BACKSPACE, ok: KEY_ROLE_OK })[getNamingScreenKeyRole(runtime.screen)]; }
export function GetCurrentPageColumnCount(runtime = namingReq()): number { return getNamingScreenCurrentPageColumnCount(runtime.screen); }
export function CreatePageSwapButtonSprites(runtime = namingReq()): void { runtime.swapBtnFrameSpriteId = createNamingSprite(runtime, 'SpriteCB_PageSwap', 204, 88); const frame = namingSprite(runtime, runtime.swapBtnFrameSpriteId); frame.data[6] = createNamingSprite(runtime, 'PageSwapText', 204, 84); frame.data[7] = createNamingSprite(runtime, 'PageSwapButton', 204, 83); }
export function StartPageSwapButtonAnim(runtime = namingReq()): void { const sprite = namingSprite(runtime, runtime.swapBtnFrameSpriteId); sprite.data[0] = 2; sprite.data[1] = pageId(runtime.screen.currentPage); }
export function SpriteCB_PageSwap(sprite = makeNamingSprite(), runtime = namingReq()): void { while ([PageSwapSprite_Init, PageSwapSprite_Idle, PageSwapSprite_SlideOff, PageSwapSprite_SlideOn][sprite.data[0]]?.(sprite, runtime)) undefined; }
export function PageSwapSprite_Init(sprite = makeNamingSprite(), runtime = namingReq()): boolean { SetPageSwapButtonGfx(PageToNextGfxId(pageId(runtime.screen.currentPage)), namingSprite(runtime, sprite.data[6]), namingSprite(runtime, sprite.data[7])); sprite.data[0]++; return false; }
export function PageSwapSprite_Idle(_sprite = makeNamingSprite(), _runtime = namingReq()): boolean { return false; }
export function PageSwapSprite_SlideOff(sprite = makeNamingSprite(), runtime = namingReq()): boolean { const text = namingSprite(runtime, sprite.data[6]); if (++text.y2 > 7) { sprite.data[0]++; text.y2 = -4; text.invisible = true; } return false; }
export function PageSwapSprite_SlideOn(sprite = makeNamingSprite(), runtime = namingReq()): boolean { const text = namingSprite(runtime, sprite.data[6]); text.invisible = false; if (++text.y2 >= 0) { text.y2 = 0; sprite.data[0] = 1; } return false; }
export function SetPageSwapButtonGfx(page: number, text = makeNamingSprite(), button = makeNamingSprite()): void { button.palette = page; text.tileStart = page; text.subspriteTableNum = page; }
export function CreateBackOkSprites(runtime = namingReq()): void { createNamingSprite(runtime, 'BackButton', 204, 116); createNamingSprite(runtime, 'OkButton', 204, 140); }
export function CreateTextEntrySprites(runtime = namingReq()): void { createNamingSprite(runtime, 'SpriteCB_InputArrow', 0, 56); for (let i = 0; i < runtime.screen.maxLength; i++) { const id = createNamingSprite(runtime, 'SpriteCB_Underscore', i * 8, 60); runtime.sprites[id].data[0] = i; } }
export function CreateInputTargetIcon(runtime = namingReq()): void { [NamingScreen_NoIcon, NamingScreen_CreatePlayerIcon, NamingScreen_CreatePCIcon, NamingScreen_CreateMonIcon, NamingScreen_CreateRivalIcon][getNamingScreenTemplate('nickname').iconFunction]?.(runtime); namingOp(runtime, 'CreateInputTargetIcon'); }
export function NamingScreen_NoIcon(runtime = namingReq()): void { namingOp(runtime, 'NamingScreen_NoIcon'); }
export function NamingScreen_CreatePlayerIcon(runtime = namingReq()): void { createNamingSprite(runtime, 'PlayerIcon', 56, 37); }
export function NamingScreen_CreatePCIcon(runtime = namingReq()): void { createNamingSprite(runtime, 'PCIcon', 56, 41); }
export function NamingScreen_CreateMonIcon(runtime = namingReq()): void { createNamingSprite(runtime, 'MonIcon', 56, 40); }
export function NamingScreen_CreateRivalIcon(runtime = namingReq()): void { createNamingSprite(runtime, 'RivalIcon', 56, 37); }
export function HandleKeyboardEvent(runtime = namingReq()): boolean { return handleNamingScreenKeyboardEvent(runtime.screen, runtime.inputEvent); }
export function KeyboardKeyHandler_Character(input: number, runtime = namingReq()): boolean { return getNamingScreenKeyRole(runtime.screen) === 'char' ? handleNamingScreenKeyboardEvent(runtime.screen, input) : false; }
export function KeyboardKeyHandler_Page(input: number, runtime = namingReq()): boolean { runtime.screen.cursorX = GetCurrentPageColumnCount(runtime); runtime.screen.cursorY = BUTTON_PAGE; return handleNamingScreenKeyboardEvent(runtime.screen, input); }
export function KeyboardKeyHandler_Backspace(input: number, runtime = namingReq()): boolean { runtime.screen.cursorX = GetCurrentPageColumnCount(runtime); runtime.screen.cursorY = BUTTON_BACK; return handleNamingScreenKeyboardEvent(runtime.screen, input); }
export function KeyboardKeyHandler_OK(input: number, runtime = namingReq()): boolean { runtime.screen.cursorX = GetCurrentPageColumnCount(runtime); runtime.screen.cursorY = BUTTON_OK; return handleNamingScreenKeyboardEvent(runtime.screen, input); }
export function SwapKeyboardPage(runtime = namingReq()): boolean { return swapNamingScreenKeyboardPageState(runtime.screen); }
export function CreateInputHandlerTask(runtime = namingReq()): void { const id = runtime.tasks.length; runtime.tasks.push(makeNamingTask()); namingOp(runtime, 'CreateInputHandlerTask', id); }
export function GetInputEvent(runtime = namingReq()): number { return runtime.inputEvent; }
export function SetInputState(state: number, runtime = namingReq()): void { runtime.screen.inputState = state; }
export function Task_HandleInput(taskId = 0, runtime = namingReq()): void { const task = namingTask(runtime, taskId); [Input_Disabled, Input_Enabled][task.data[0]]?.(task, runtime); }
export function Input_Disabled(task = makeNamingTask(), runtime = namingReq()): void { runtime.inputEvent = INPUT_NONE; task.data[1] = INPUT_NONE; }
export function Input_Enabled(task = makeNamingTask(), runtime = namingReq()): void { task.data[1] = runtime.inputEvent; if (runtime.inputEvent >= INPUT_DPAD_UP && runtime.inputEvent <= INPUT_DPAD_RIGHT) HandleDpadMovement(task, runtime); }
export function HandleDpadMovement(task = makeNamingTask(), runtime = namingReq()): void {
  const dx = runtime.inputEvent === INPUT_DPAD_LEFT ? -1 : runtime.inputEvent === INPUT_DPAD_RIGHT ? 1 : 0;
  const dy = runtime.inputEvent === INPUT_DPAD_UP ? -1 : runtime.inputEvent === INPUT_DPAD_DOWN ? 1 : 0;
  runtime.screen.buttonId = task.data[2] || runtime.screen.buttonId;
  stepNamingScreen(runtime.screen, { up: dy < 0, down: dy > 0, left: dx < 0, right: dx > 0, upPressed: dy < 0, downPressed: dy > 0, leftPressed: dx < 0, rightPressed: dx > 0, run: false, interact: false, interactPressed: false, start: false, startPressed: false, cancel: false, cancelPressed: false });
  task.data[2] = runtime.screen.buttonId;
}
export function DrawNormalTextEntryBox(runtime = namingReq()): void { namingOp(runtime, 'DrawNormalTextEntryBox'); }
export function DrawMonTextEntryBox(runtime = namingReq()): void { namingOp(runtime, 'DrawMonTextEntryBox'); }
export function DrawTextEntryBox(runtime = namingReq()): void { runtime.screen.title === NAMING_SCREEN_MON_TITLE ? DrawMonTextEntryBox(runtime) : DrawNormalTextEntryBox(runtime); }
export function TryDrawGenderIcon(runtime = namingReq()): void { namingOp(runtime, 'TryDrawGenderIcon'); }
export function DummyGenderIcon(runtime = namingReq()): void { namingOp(runtime, 'DummyGenderIcon'); }
export function DrawGenderIcon(runtime = namingReq()): void { namingOp(runtime, 'DrawGenderIcon'); }
export function GetCharAtKeyboardPos(x: number, y: number, runtime = namingReq()): string { return getNamingScreenCharAtKeyboardPos(runtime.screen, x, y); }
export function GetTextEntryPosition(runtime = namingReq()): number { return getNamingScreenTextEntryPosition(runtime.screen); }
export function GetPreviousTextCaretPosition(runtime = namingReq()): number { return getNamingScreenPreviousTextCaretPosition(runtime.screen); }
export function DeleteTextCharacter(runtime = namingReq()): void { deleteNamingScreenTextCharacter(runtime.screen); }
export function AddTextCharacter(runtime = namingReq()): boolean { return addNamingScreenTextCharacter(runtime.screen); }
export function BufferCharacter(character: string | number, runtime = namingReq()): void { runtime.screen.textBuffer += typeof character === 'number' ? String.fromCharCode(character) : character; }
export function SaveInputText(runtime = namingReq()): void { runtime.inputText = saveNamingScreenInputText(runtime.screen); runtime.screen.destBuffer = runtime.inputText; }
export function LoadGfx(runtime = namingReq()): void { namingOp(runtime, 'LoadGfx'); }
export function CreateHelperTasks(runtime = namingReq()): void { CreateButtonFlashTask(runtime); CreateInputHandlerTask(runtime); }
export function LoadPalettes(runtime = namingReq()): void { namingOp(runtime, 'LoadPalettes'); }
export function DecompressToBgTilemapBuffer(bg: number, tilemap: string | number, runtime = namingReq()): void { namingOp(runtime, 'DecompressToBgTilemapBuffer', bg, tilemap); }
export function DrawTextEntry(runtime = namingReq()): void { namingOp(runtime, 'DrawTextEntry', runtime.screen.textBuffer); }
export function PrintKeyboardKeys(windowId: number, keyboard: number, runtime = namingReq()): void { namingOp(runtime, 'PrintKeyboardKeys', windowId, keyboard); }
export function DrawKeyboardPageOnDeck(runtime = namingReq()): void { namingOp(runtime, 'DrawKeyboardPageOnDeck', CurrentPageToNextKeyboardId(runtime)); }
export function PrintControls(runtime = namingReq()): void { namingOp(runtime, 'PrintControls'); }
export function CB2_NamingScreen(runtime = namingReq()): void { namingOp(runtime, 'RunTasks'); namingOp(runtime, 'AnimateSprites'); }
export function ResetVHBlank(runtime = namingReq()): void { runtime.vblankSet = false; }
export function SetVBlank(runtime = namingReq()): void { runtime.vblankSet = true; }
export function VBlankCB_NamingScreen(runtime = namingReq()): void { namingOp(runtime, 'VBlankCB_NamingScreen'); }
export function NamingScreen_ShowBgs(runtime = namingReq()): void { runtime.bgsShown = true; }
export function IsWideLetter(character: string): boolean { return isNamingScreenWideLetter(character); }
export function Debug_NamingScreenPlayer(runtime = createNamingScreenRuntime()): void { DoNamingScreen(NAMING_SCREEN_PLAYER, '', 0, 0, 0, 'debugPlayer', runtime); }
export function Debug_NamingScreenBox(runtime = createNamingScreenRuntime()): void { DoNamingScreen(NAMING_SCREEN_BOX, '', 0, 0, 0, 'debugBox', runtime); }
export function Debug_NamingScreenCaughtMon(runtime = createNamingScreenRuntime()): void { DoNamingScreen(NAMING_SCREEN_CAUGHT_MON, '', 1, 0, 0, 'debugCaughtMon', runtime); }
export function Debug_NamingScreenNickname(runtime = createNamingScreenRuntime()): void { DoNamingScreen(NAMING_SCREEN_NICKNAME, '', 1, 0, 0, 'debugNickname', runtime); }
export function Debug_NamingScreenRival(runtime = createNamingScreenRuntime()): void { DoNamingScreen(NAMING_SCREEN_RIVAL, '', 0, 0, 0, 'debugRival', runtime); }
