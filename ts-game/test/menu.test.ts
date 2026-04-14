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

  test('non-exit opens start-menu text panel using FireRed descriptions and EXIT closes menu', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.playerName = 'RED';

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.active).toBe(false);
    expect(menu.panel?.id).toBe('POKEDEX');
    expect(menu.panel?.description).toContain('records POKéMON secrets');
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

  test('POKEDEX selection is blocked when no species have been seen yet', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.seenPokemonCount = 0;

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    menu.selectedIndex = menu.options.findIndex((entry) => entry.id === 'POKEDEX');
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.active).toBe(true);
    expect(menu.panel).toBe(null);
    expect(runtime.lastScriptId).toBe('menu.pokedex.locked.empty');
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

  test('SAVE panel asks overwrite when a prior save exists', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    runtime.saveCounter = 1;

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    menu.selectedIndex = menu.options.findIndex((entry) => entry.id === 'SAVE');
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.panel?.kind).toBe('save');
    expect(menu.panel?.description).toContain('Overwrite');
  });

  test('OPTION panel updates runtime options with directional input', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    menu.selectedIndex = menu.options.findIndex((entry) => entry.id === 'OPTION');
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);
    expect(menu.panel?.kind).toBe('options');

    stepStartMenu(menu, { ...neutralInput, right: true, rightPressed: true }, dialogue, runtime);
    expect(runtime.options.textSpeed).toBe('fast');

    stepStartMenu(menu, { ...neutralInput, down: true, downPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, right: true, rightPressed: true }, dialogue, runtime);
    expect(runtime.options.battleScene).toBe(false);
  });

  test('supports safari retire prompt with YES/NO choices', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.mode = 'safari';

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);
    expect(menu.panel?.kind).toBe('retire');
    if (!menu.panel || menu.panel.kind !== 'retire') {
      throw new Error('expected retire panel');
    }
    expect(menu.panel.rows).toEqual(['YES', 'NO']);

    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);
    expect(menu.panel).toBe(null);
    expect(menu.active).toBe(true);
    expect(runtime.lastScriptId).toBe('menu.retire.cancelled');

    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);
    if (!menu.panel || menu.panel.kind !== 'retire') {
      throw new Error('expected retire panel');
    }
    stepStartMenu(menu, { ...neutralInput, up: true, upPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime, {
      onSafariRetireConfirmed: () => ({ ok: true, summary: 'Safari run ended.' })
    });

    expect(menu.panel).toBe(null);
    expect(menu.active).toBe(false);
    expect(runtime.lastScriptId).toBe('menu.retire.success');
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
