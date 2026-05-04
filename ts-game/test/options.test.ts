import { describe, expect, test } from 'vitest';
import {
  createStartMenuState,
  openStartMenu,
  stepStartMenu,
  type OptionPanelState
} from '../src/game/menu';
import { createScriptRuntimeState } from '../src/game/scripts';
import { createFieldMessageBoxState } from '../src/game/decompFieldMessageBox';
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

const createDialogue = () => ({
  active: false, speakerId: null, text: '', queue: [], queueIndex: 0, choice: null, shop: null,
  monPic: null, namingScreen: null, scriptSession: null, fieldMessageBox: createFieldMessageBoxState()
});

describe('options menu', () => {
  test('opens options panel from start menu', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);

    const optionIndex = menu.options.findIndex((o) => o.id === 'OPTION');
    expect(optionIndex).toBeGreaterThanOrEqual(0);
    menu.selectedIndex = optionIndex;

    stepStartMenu(menu, pressInteract, createDialogue(), runtime);
    expect(menu.panel).not.toBeNull();
    expect(menu.panel?.kind).toBe('options');
  });

  test('options panel shows all settings', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);
    const optionIndex = menu.options.findIndex((o) => o.id === 'OPTION');
    menu.selectedIndex = optionIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as OptionPanelState;
    expect(panel.rows.length).toBe(7);
    expect(panel.rows[0]).toContain('TEXT SPEED');
    expect(panel.rows[1]).toContain('BATTLE SCENE');
    expect(panel.rows[2]).toContain('BATTLE STYLE');
    expect(panel.rows[3]).toContain('SOUND');
    expect(panel.rows[4]).toContain('BUTTON MODE');
    expect(panel.rows[5]).toContain('FRAME');
    expect(panel.rows[6]).toContain('CANCEL');
  });

  test('options panel cycles text speed with left/right', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);
    const optionIndex = menu.options.findIndex((o) => o.id === 'OPTION');
    menu.selectedIndex = optionIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const initialSpeed = runtime.options.textSpeed;

    stepStartMenu(menu, pressRight, createDialogue(), runtime);
    expect(runtime.options.textSpeed).not.toBe(initialSpeed);

    stepStartMenu(menu, pressLeft, createDialogue(), runtime);
    expect(runtime.options.textSpeed).toBe(initialSpeed);
  });

  test('options panel cycles battle scene with left/right', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);
    const optionIndex = menu.options.findIndex((o) => o.id === 'OPTION');
    menu.selectedIndex = optionIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as OptionPanelState;
    panel.selectedIndex = 1;

    const initialScene = runtime.options.battleScene;
    stepStartMenu(menu, pressRight, createDialogue(), runtime);
    expect(runtime.options.battleScene).toBe(!initialScene);
  });

  test('options panel navigates with up/down', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);
    const optionIndex = menu.options.findIndex((o) => o.id === 'OPTION');
    menu.selectedIndex = optionIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as OptionPanelState;
    expect(panel.selectedIndex).toBe(0);

    stepStartMenu(menu, pressDown, createDialogue(), runtime);
    expect(panel.selectedIndex).toBe(1);

    stepStartMenu(menu, pressUp, createDialogue(), runtime);
    expect(panel.selectedIndex).toBe(0);
  });

  test('options panel closes on interact or cancel', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);
    const optionIndex = menu.options.findIndex((o) => o.id === 'OPTION');
    menu.selectedIndex = optionIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    stepStartMenu(menu, pressCancel, createDialogue(), runtime);
    expect(menu.panel).toBeNull();
  });

  test('options panel cycles frame type', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);
    const optionIndex = menu.options.findIndex((o) => o.id === 'OPTION');
    menu.selectedIndex = optionIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as OptionPanelState;
    panel.selectedIndex = 5;
    const initialFrame = runtime.options.frameType;

    stepStartMenu(menu, pressRight, createDialogue(), runtime);
    expect(runtime.options.frameType).toBe((initialFrame + 1) % 10);
  });
});