import { describe, expect, test } from 'vitest';
import { createDialogueState, openDialogueSequence } from '../src/game/interaction';
import { createStartMenuState, stepStartMenu } from '../src/game/menu';
import { createScriptRuntimeState } from '../src/game/scripts';

const neutralInput = {
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

describe('start menu stepping', () => {
  test('opens from START and closes active dialogue first', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    openDialogueSequence(dialogue, 'npc', ['Hi']);

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);

    expect(menu.active).toBe(true);
    expect(dialogue.active).toBe(false);
    expect(runtime.lastScriptId).toBe('menu.open.start');
  });

  test('moves selection up/down with wraparound', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    expect(menu.selectedIndex).toBe(0);

    stepStartMenu(menu, { ...neutralInput, down: true, downPressed: true }, dialogue, runtime);
    expect(menu.selectedIndex).toBe(1);

    stepStartMenu(menu, { ...neutralInput, up: true, upPressed: true }, dialogue, runtime);
    expect(menu.selectedIndex).toBe(0);

    stepStartMenu(menu, { ...neutralInput, up: true, upPressed: true }, dialogue, runtime);
    expect(menu.selectedIndex).toBe(menu.options.length - 1);
  });

  test('non-exit opens placeholder panel and EXIT closes menu', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.playerName = 'RED';

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.active).toBe(false);
    expect(menu.panel?.id).toBe('POKEDEX');
    expect(runtime.lastScriptId).toBe('menu.open.pokedex');

    stepStartMenu(menu, { ...neutralInput, cancel: true, cancelPressed: true }, dialogue, runtime);
    expect(menu.panel).toBe(null);
    expect(runtime.lastScriptId).toBe('menu.panel.close.pokedex');

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    menu.selectedIndex = menu.options.findIndex((entry) => entry.id === 'EXIT');
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.active).toBe(false);
    expect(runtime.lastScriptId).toBe('menu.exit');
  });


  test('SAVE panel confirms save callback and reports result', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    menu.selectedIndex = menu.options.findIndex((entry) => entry.id === 'SAVE');
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.panel?.id).toBe('SAVE');

    stepStartMenu(
      menu,
      { ...neutralInput, interact: true, interactPressed: true },
      dialogue,
      runtime,
      {
        onSaveConfirmed: () => ({ ok: true, summary: 'Saved at now (slot #2).' })
      }
    );

    expect(menu.panel?.description).toBe('Saved at now (slot #2).');
    expect(runtime.lastScriptId).toBe('menu.save.success');

    stepStartMenu(menu, { ...neutralInput, cancel: true, cancelPressed: true }, dialogue, runtime);
    expect(menu.panel).toBe(null);
    expect(menu.active).toBe(true);
    expect(runtime.lastScriptId).toBe('menu.panel.close.save');
  });

  test('builds normal-field entries from runtime flags and player name', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.playerName = 'LEAF';
    runtime.startMenu.hasPokedex = false;
    runtime.startMenu.hasPokemon = true;

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    expect(menu.options.map((entry) => entry.id)).toEqual([
      'POKEMON',
      'BAG',
      'PLAYER',
      'SAVE',
      'OPTION',
      'EXIT'
    ]);
    expect(menu.options[2].label).toBe('LEAF');
  });

  test('supports safari menu ordering including retire option', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.mode = 'safari';

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    expect(menu.options.map((entry) => entry.id)).toEqual([
      'RETIRE',
      'POKEDEX',
      'POKEMON',
      'BAG',
      'PLAYER',
      'OPTION',
      'EXIT'
    ]);
  });
});
