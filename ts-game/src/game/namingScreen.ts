import type { InputSnapshot } from '../input/inputState';
import {
  CHAR_SPACE,
  EOS,
  BUTTON_COUNT as DECOMP_BUTTON_COUNT,
  getNamingScreenCharAtKeyboardPos,
  getNamingScreenCurrentPageColumnCount,
  getNamingScreenKeyRole,
  getNamingScreenKeyboardChars,
  getNamingScreenTemplate,
  getNamingScreenTextEntryPosition,
  STATE_EXIT,
  STATE_FADE_IN,
  STATE_HANDLE_INPUT,
  STATE_PRESSED_OK,
  STATE_WAIT_FADE_IN,
  swapNamingScreenKeyboardPage,
  type NamingKeyRole,
  type NamingKeyboardPage,
  type NamingScreenTemplateId,
  type NamingScreenState
} from './decompNamingScreen';

const KBROW_COUNT = 4;
const BUTTON_COUNT = DECOMP_BUTTON_COUNT;

export type { NamingScreenTemplateId, NamingScreenState, NamingKeyboardPage, NamingKeyRole };

export const PLAYER_NAME_MAX_LENGTH = 7;
export const RIVAL_NAME_MAX_LENGTH = 7;
export const POKEMON_NICKNAME_MAX_LENGTH = 10;
export const BOX_NAME_MAX_LENGTH = 8;

export interface NamingResult {
  confirmed: boolean;
  text: string;
}

export const createNamingScreenState = (
  templateId: NamingScreenTemplateId,
  slot: number = 0,
  species: string = '',
  defaultText: string = ''
): NamingScreenState => {
  const template = getNamingScreenTemplate(templateId);
  const textBuffer = defaultText.padEnd(template.maxChars, EOS).slice(0, template.maxChars);
  return {
    kind: 'nickname',
    slot,
    species,
    textBuffer,
    destBuffer: '',
    cursorX: 0,
    cursorY: 0,
    buttonId: 0,
    maxLength: template.maxChars,
    currentPage: template.initialPage,
    initialPage: template.initialPage,
    copyExistingString: template.copyExistingString,
    title: template.title,
    cState: STATE_FADE_IN,
    inputState: 1
  };
};

export const stepNamingScreen = (
  state: NamingScreenState,
  input: InputSnapshot
): NamingResult | null => {
  if (state.cState === STATE_FADE_IN) {
    state.cState = STATE_WAIT_FADE_IN;
    return null;
  }

  if (state.cState === STATE_WAIT_FADE_IN) {
    state.cState = STATE_HANDLE_INPUT;
    return null;
  }

  if (state.cState === STATE_PRESSED_OK || state.cState === STATE_EXIT) {
    const text = state.textBuffer.replace(new RegExp(`${EOS}$`), '').trimEnd();
    state.cState = STATE_EXIT;
    return { confirmed: true, text };
  }

  if (state.cState !== STATE_HANDLE_INPUT) {
    return null;
  }

  const columns = getNamingScreenCurrentPageColumnCount(state);
  const keyRole = getNamingScreenKeyRole(state);

  if (input.upPressed) {
    if (state.cursorY > 0) {
      state.cursorY -= 1;
    }
    return null;
  }

  if (input.downPressed) {
    if (state.cursorY < KBROW_COUNT - 1 && state.cursorY < (keyRole === 'char' ? KBROW_COUNT - 1 : BUTTON_COUNT - 1)) {
      state.cursorY += 1;
    }
    return null;
  }

  if (input.leftPressed) {
    if (state.cursorX > 0) {
      state.cursorX -= 1;
    }
    return null;
  }

  if (input.rightPressed) {
    const maxX = keyRole === 'char' ? columns - 1 : columns + BUTTON_COUNT - 1;
    if (state.cursorX < maxX) {
      state.cursorX += 1;
    }
    return null;
  }

  if (input.cancelPressed || input.startPressed) {
    const text = state.textBuffer.replace(new RegExp(`${EOS}$`), '').trimEnd();
    return { confirmed: false, text };
  }

  if (input.interactPressed) {
    if (keyRole === 'char') {
      const char = getNamingScreenCharAtKeyboardPos(state, state.cursorX, state.cursorY);
      if (char === EOS || char === CHAR_SPACE) {
        const pos = getNamingScreenTextEntryPosition(state);
        if (pos < state.maxLength - 1) {
          state.textBuffer = state.textBuffer.slice(0, pos) + (char === CHAR_SPACE ? ' ' : char) + state.textBuffer.slice(pos + 1);
        }
      } else {
        const pos = getNamingScreenTextEntryPosition(state);
        if (pos < state.maxLength) {
          state.textBuffer = state.textBuffer.slice(0, pos) + char + state.textBuffer.slice(pos + 1);
        }
      }
      return null;
    }

    if (keyRole === 'page') {
      swapNamingScreenKeyboardPage(state);
      return null;
    }

    if (keyRole === 'backspace') {
      const pos = getNamingScreenTextEntryPosition(state);
      if (pos > 0) {
        state.textBuffer = state.textBuffer.slice(0, pos - 1) + CHAR_SPACE + state.textBuffer.slice(pos);
      }
      return null;
    }

    if (keyRole === 'ok') {
      state.cState = STATE_PRESSED_OK;
      const text = state.textBuffer.replace(new RegExp(`${EOS}$`), '').trimEnd();
      return { confirmed: true, text };
    }
  }

  return null;
};

export const getNamingScreenTitle = (templateId: NamingScreenTemplateId): string =>
  getNamingScreenTemplate(templateId).title;

export const getNamingScreenMaxLength = (templateId: NamingScreenTemplateId): number =>
  getNamingScreenTemplate(templateId).maxChars;

export {
  getNamingScreenKeyboardChars,
  getNamingScreenCurrentPageColumnCount,
  getNamingScreenKeyRole,
  getNamingScreenTextEntryPosition,
  CHAR_SPACE,
  EOS,
  KBROW_COUNT,
  BUTTON_COUNT
};