import { describe, expect, test } from 'vitest';
import {
  createStartMenuState,
  openStartMenu,
  stepStartMenu,
  type PokedexPanelState
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
const pressDown: InputSnapshot = { ...noInput, downPressed: true, down: true };

const createDialogue = () => ({
  active: false, speakerId: null, text: '', queue: [], queueIndex: 0, choice: null, shop: null,
  monPic: null, namingScreen: null, scriptSession: null, fieldMessageBox: createFieldMessageBoxState()
});

describe('pokedex', () => {
  test('opens pokedex panel from start menu', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokedex = true;
    openStartMenu(menu, runtime);

    const pokedexIndex = menu.options.findIndex((o) => o.id === 'POKEDEX');
    expect(pokedexIndex).toBeGreaterThanOrEqual(0);
    menu.selectedIndex = pokedexIndex;

    stepStartMenu(menu, pressInteract, createDialogue(), runtime);
    expect(menu.panel).not.toBeNull();
    expect(menu.panel?.kind).toBe('pokedex');
  });

  test('pokedex panel shows seen and owned counts', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokedex = true;
    openStartMenu(menu, runtime);
    const pokedexIndex = menu.options.findIndex((o) => o.id === 'POKEDEX');
    menu.selectedIndex = pokedexIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as PokedexPanelState;
    expect(panel.seen).toBeGreaterThanOrEqual(0);
    expect(panel.owned).toBeGreaterThanOrEqual(0);
    expect(panel.screen).toBe('topMenu');
  });

  test('pokedex panel navigates top menu with up/down', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokedex = true;
    openStartMenu(menu, runtime);
    const pokedexIndex = menu.options.findIndex((o) => o.id === 'POKEDEX');
    menu.selectedIndex = pokedexIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as PokedexPanelState;
    const initialIndex = panel.topMenuSelectedIndex;
    stepStartMenu(menu, pressDown, createDialogue(), runtime);
    expect(panel.topMenuSelectedIndex).not.toBe(initialIndex);
  });

  test('pokedex panel enters ordered list on interact', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokedex = true;
    openStartMenu(menu, runtime);
    const pokedexIndex = menu.options.findIndex((o) => o.id === 'POKEDEX');
    menu.selectedIndex = pokedexIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as PokedexPanelState;
    const selectableRow = panel.topMenuRows.find((r) => r.kind === 'item' && r.enabled && (r.actionId === 'NUMERICAL_KANTO' || r.actionId === 'NUMERICAL_NATIONAL'));
    if (selectableRow) {
      const rowIndex = panel.topMenuRows.indexOf(selectableRow);
      while (panel.topMenuSelectedIndex < rowIndex) {
        stepStartMenu(menu, pressDown, createDialogue(), runtime);
      }
      stepStartMenu(menu, pressInteract, createDialogue(), runtime);
      expect(panel.screen).toBe('orderedList');
    }
  });

  test('pokedex panel cancels back to top menu from ordered list', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokedex = true;
    openStartMenu(menu, runtime);
    const pokedexIndex = menu.options.findIndex((o) => o.id === 'POKEDEX');
    menu.selectedIndex = pokedexIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as PokedexPanelState;
    const selectableRow = panel.topMenuRows.find((r) => r.kind === 'item' && r.enabled && (r.actionId === 'NUMERICAL_KANTO' || r.actionId === 'NUMERICAL_NATIONAL'));
    if (selectableRow) {
      const rowIndex = panel.topMenuRows.indexOf(selectableRow);
      while (panel.topMenuSelectedIndex < rowIndex) {
        stepStartMenu(menu, pressDown, createDialogue(), runtime);
      }
      stepStartMenu(menu, pressInteract, createDialogue(), runtime);
      expect(panel.screen).toBe('orderedList');

      stepStartMenu(menu, pressCancel, createDialogue(), runtime);
      expect(panel.screen).toBe('topMenu');
    }
  });

  test('pokedex panel closes on cancel from top menu', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokedex = true;
    openStartMenu(menu, runtime);
    const pokedexIndex = menu.options.findIndex((o) => o.id === 'POKEDEX');
    menu.selectedIndex = pokedexIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    stepStartMenu(menu, pressCancel, createDialogue(), runtime);
    expect(menu.panel).toBeNull();
  });
});