import { describe, expect, test } from 'vitest';
import {
  createStartMenuState,
  openStartMenu,
  stepStartMenu,
  type PartyPanelState
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
  active: false, speakerId: null, text: '', queue: [], queueIndex: 0, choice: null, shop: null, monPic: null, namingScreen: null, scriptSession: null, fieldMessageBox: createFieldMessageBoxState()
});

describe('party menu', () => {
  test('opens party panel from start menu', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokemon = true;
    openStartMenu(menu, runtime);
    expect(menu.active).toBe(true);

    const pokemonIndex = menu.options.findIndex((o) => o.id === 'POKEMON');
    expect(pokemonIndex).toBeGreaterThanOrEqual(0);
    menu.selectedIndex = pokemonIndex;

    stepStartMenu(menu, pressInteract, createDialogue(), runtime);
    expect(menu.panel).not.toBeNull();
    expect(menu.panel?.kind).toBe('party');
  });

  test('party panel shows members and allows navigation', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokemon = true;
    openStartMenu(menu, runtime);
    const pokemonIndex = menu.options.findIndex((o) => o.id === 'POKEMON');
    menu.selectedIndex = pokemonIndex;
    stepStartMenu(menu, pressInteract, createDialogue(), runtime);

    const panel = menu.panel as PartyPanelState;
    expect(panel.kind).toBe('party');
    expect(panel.members.length).toBeGreaterThanOrEqual(2);
    expect(panel.mode).toBe('list');

    stepStartMenu(menu, pressDown, createDialogue(), runtime);
    expect(panel.selectedIndex).toBe(1);
  });

  test('party panel opens actions on interact', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokemon = true;
    openStartMenu(menu, runtime);
    const pokemonIndex = menu.options.findIndex((o) => o.id === 'POKEMON');
    menu.selectedIndex = pokemonIndex;
    const dialogue = createDialogue();
    stepStartMenu(menu, pressInteract, dialogue, runtime);
    const panel = menu.panel as PartyPanelState;

    stepStartMenu(menu, pressInteract, dialogue, runtime);
    expect(panel.mode).toBe('actions');
    expect(panel.actionRows).toEqual(['SUMMARY', 'SWITCH', 'CANCEL']);
  });

  test('party panel switches Pokemon positions', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokemon = true;
    openStartMenu(menu, runtime);
    const pokemonIndex = menu.options.findIndex((o) => o.id === 'POKEMON');
    menu.selectedIndex = pokemonIndex;
    const dialogue = createDialogue();
    stepStartMenu(menu, pressInteract, dialogue, runtime);
    const panel = menu.panel as PartyPanelState;

    stepStartMenu(menu, pressInteract, dialogue, runtime);
    expect(panel.mode).toBe('actions');

    stepStartMenu(menu, pressDown, dialogue, runtime);
    stepStartMenu(menu, pressInteract, dialogue, runtime);
    expect(panel.mode).toBe('switch');
    expect(panel.switchingIndex).toBe(0);

    stepStartMenu(menu, pressDown, dialogue, runtime);
    stepStartMenu(menu, pressInteract, dialogue, runtime);
    expect(panel.mode).toBe('list');
    expect(panel.members[0].species).toBe('PIDGEY');
    expect(panel.members[1].species).toBe('CHARMANDER');
  });

  test('party panel cancel returns to list mode', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokemon = true;
    openStartMenu(menu, runtime);
    const pokemonIndex = menu.options.findIndex((o) => o.id === 'POKEMON');
    menu.selectedIndex = pokemonIndex;
    const dialogue = createDialogue();
    stepStartMenu(menu, pressInteract, dialogue, runtime);
    const panel = menu.panel as PartyPanelState;

    stepStartMenu(menu, pressInteract, dialogue, runtime);
    expect(panel.mode).toBe('actions');

    stepStartMenu(menu, pressCancel, dialogue, runtime);
    expect(panel.mode).toBe('list');
  });

  test('party panel closes on cancel from list mode', () => {
    const menu = createStartMenuState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.hasPokemon = true;
    openStartMenu(menu, runtime);
    const pokemonIndex = menu.options.findIndex((o) => o.id === 'POKEMON');
    menu.selectedIndex = pokemonIndex;
    const dialogue = createDialogue();
    stepStartMenu(menu, pressInteract, dialogue, runtime);

    stepStartMenu(menu, pressCancel, dialogue, runtime);
    expect(menu.panel).toBeNull();
  });
});