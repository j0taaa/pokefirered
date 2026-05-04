import { describe, expect, test } from 'vitest';
import {
  createNamingScreenState,
  stepNamingScreen,
  PLAYER_NAME_MAX_LENGTH,
  RIVAL_NAME_MAX_LENGTH,
  POKEMON_NICKNAME_MAX_LENGTH
} from '../src/game/namingScreen';
import type { InputSnapshot } from '../src/input/inputState';

const noInput: InputSnapshot = {
  up: false, down: false, left: false, right: false,
  run: false, interact: false, cancel: false, start: false,
  upPressed: false, downPressed: false, leftPressed: false, rightPressed: false,
  interactPressed: false, cancelPressed: false, startPressed: false
};

const pressInteract: InputSnapshot = { ...noInput, interactPressed: true, interact: true };
const pressCancel: InputSnapshot = { ...noInput, cancelPressed: true, cancel: true };
const pressUp: InputSnapshot = { ...noInput, upPressed: true, up: true };
const pressDown: InputSnapshot = { ...noInput, downPressed: true, down: true };
const pressLeft: InputSnapshot = { ...noInput, leftPressed: true, left: true };
const pressRight: InputSnapshot = { ...noInput, rightPressed: true, right: true };

describe('naming screen', () => {
  test('creates naming screen state with correct max length for player', () => {
    const state = createNamingScreenState('player');
    expect(state.maxLength).toBe(PLAYER_NAME_MAX_LENGTH);
    expect(state.title).toBe('Your name?');
  });

  test('creates naming screen state with correct max length for rival', () => {
    const state = createNamingScreenState('rival');
    expect(state.maxLength).toBe(RIVAL_NAME_MAX_LENGTH);
    expect(state.title).toBe("Rival's name?");
  });

  test('creates naming screen state with correct max length for nickname', () => {
    const state = createNamingScreenState('nickname');
    expect(state.maxLength).toBe(POKEMON_NICKNAME_MAX_LENGTH);
  });

  test('naming screen starts in fade-in state and transitions to handle input', () => {
    const state = createNamingScreenState('player');
    expect(state.cState).toBe(0);

    const result = stepNamingScreen(state, noInput);
    expect(result).toBeNull();
    expect(state.cState).toBe(1);

    const result2 = stepNamingScreen(state, noInput);
    expect(result2).toBeNull();
    expect(state.cState).toBe(2);
  });

  test('naming screen confirms on OK button', () => {
    const state = createNamingScreenState('player');
    state.cState = 2;
    state.cursorX = 8;
    state.cursorY = 2;

    const result = stepNamingScreen(state, pressInteract);
    expect(result).not.toBeNull();
    expect(result?.confirmed).toBe(true);
  });

  test('naming screen cancels on B button', () => {
    const state = createNamingScreenState('player');
    state.cState = 2;

    const result = stepNamingScreen(state, pressCancel);
    expect(result).not.toBeNull();
    expect(result?.confirmed).toBe(false);
  });

  test('naming screen cursor moves with d-pad', () => {
    const state = createNamingScreenState('player');
    state.cState = 2;
    state.cursorX = 1;
    state.cursorY = 0;

    stepNamingScreen(state, pressRight);
    expect(state.cursorX).toBe(2);

    stepNamingScreen(state, pressLeft);
    expect(state.cursorX).toBe(1);

    stepNamingScreen(state, pressDown);
    expect(state.cursorY).toBe(1);

    stepNamingScreen(state, pressUp);
    expect(state.cursorY).toBe(0);
  });

  test('naming screen default text is set correctly', () => {
    const state = createNamingScreenState('player', 0, '', 'ASH');
    expect(state.textBuffer.startsWith('ASH')).toBe(true);
  });
});