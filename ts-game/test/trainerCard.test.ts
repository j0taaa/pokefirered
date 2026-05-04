import { describe, expect, test } from 'vitest';
import {
  createStartMenuState,
  openStartMenu,
  stepStartMenu,
  type SummaryPanelState
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

const createDialogue = () => ({
  active: false, speakerId: null, text: '', queue: [], queueIndex: 0, choice: null, shop: null,
  monPic: null, namingScreen: null, scriptSession: null, fieldMessageBox: createFieldMessageBoxState()
});

describe('trainer card', () => {
  test('opens player summary panel from start menu', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);

    const playerIndex = menu.options.findIndex((o) => o.id === 'PLAYER');
    expect(playerIndex).toBeGreaterThanOrEqual(0);
    menu.selectedIndex = playerIndex;

    stepStartMenu(menu, pressInteract, createDialogue(), runtime);
    expect(menu.panel).not.toBeNull();
    expect(menu.panel?.kind).toBe('summary');
  });

  test('trainer card shows player info on page 0', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);
    const playerIndex = menu.options.findIndex((o) => o.id === 'PLAYER');
    menu.selectedIndex = playerIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as SummaryPanelState;
    expect(panel.pageIndex).toBe(0);
    expect(panel.rows.some((row) => row.includes('MONEY'))).toBe(true);
    expect(panel.rows.some((row) => row.includes('BADGES'))).toBe(true);
    expect(panel.rows.some((row) => row.includes('TIME'))).toBe(true);
  });

  test('trainer card flips to profile page on interact', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);
    const playerIndex = menu.options.findIndex((o) => o.id === 'PLAYER');
    menu.selectedIndex = playerIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as SummaryPanelState;
    expect(panel.pageIndex).toBe(0);

    stepStartMenu(menu, pressInteract, createDialogue(), runtime);
    expect(panel.pageIndex).toBe(1);
    expect(panel.description).toContain('PROFILE');
  });

  test('trainer card flips back on cancel from page 1', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);
    const playerIndex = menu.options.findIndex((o) => o.id === 'PLAYER');
    menu.selectedIndex = playerIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as SummaryPanelState;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);
    expect(panel.pageIndex).toBe(1);

    stepStartMenu(menu, pressCancel, createDialogue(), runtime);
    expect(panel.pageIndex).toBe(0);
  });

  test('trainer card closes on cancel from page 0', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);
    const playerIndex = menu.options.findIndex((o) => o.id === 'PLAYER');
    menu.selectedIndex = playerIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    stepStartMenu(menu, pressCancel, createDialogue(), runtime);
    expect(menu.panel).toBeNull();
  });

  test('trainer card closes on interact from page 1', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    openStartMenu(menu, runtime);
    const playerIndex = menu.options.findIndex((o) => o.id === 'PLAYER');
    menu.selectedIndex = playerIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    stepStartMenu(menu, pressInteract, createDialogue(), runtime);
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);
    expect(menu.panel).toBeNull();
  });
});