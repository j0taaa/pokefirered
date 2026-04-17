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

  test('POKEDEX opens top menu, navigates numerical list, and closes back to START menu', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    runtime.startMenu.playerName = 'RED';

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.active).toBe(false);
    expect(menu.panel?.kind).toBe('pokedex');
    expect(menu.panel?.id).toBe('POKEDEX');
    if (!menu.panel || menu.panel.kind !== 'pokedex' || menu.panel.id !== 'POKEDEX') {
      throw new Error('expected pokedex panel');
    }
    expect(menu.panel.screen).toBe('topMenu');
    expect(menu.panel.topMenuRows[menu.panel.topMenuSelectedIndex]?.actionId).toBe('NUMERICAL_KANTO');
    expect(runtime.lastScriptId).toBe('menu.open.pokedex');

    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);
    if (!menu.panel || menu.panel.kind !== 'pokedex' || menu.panel.id !== 'POKEDEX') {
      throw new Error('expected pokedex panel');
    }
    expect(menu.panel.screen).toBe('orderedList');
    expect(menu.panel.orderId).toBe('NUMERICAL_KANTO');
    expect(runtime.lastScriptId).toBe('menu.pokedex.order.open');

    const charmanderIndex = menu.panel.orderEntries.findIndex((entry) => entry.species === 'CHARMANDER');
    expect(charmanderIndex).toBeGreaterThanOrEqual(0);
    for (let i = 0; i < charmanderIndex; i += 1) {
      stepStartMenu(menu, { ...neutralInput, down: true, downPressed: true }, dialogue, runtime);
    }

    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);
    if (!menu.panel || menu.panel.kind !== 'pokedex' || menu.panel.id !== 'POKEDEX') {
      throw new Error('expected pokedex panel');
    }
    expect(menu.panel.screen).toBe('entry');
    expect(menu.panel.entrySpecies).toBe('CHARMANDER');
    expect(runtime.lastScriptId).toBe('menu.pokedex.entry.open');

    stepStartMenu(menu, { ...neutralInput, right: true, rightPressed: true }, dialogue, runtime);
    if (!menu.panel || menu.panel.kind !== 'pokedex' || menu.panel.id !== 'POKEDEX') {
      throw new Error('expected pokedex panel');
    }
    expect(menu.panel.entryPageIndex).toBe(1);
    expect(runtime.lastScriptId).toBe('menu.pokedex.entry.page');

    stepStartMenu(menu, { ...neutralInput, cancel: true, cancelPressed: true }, dialogue, runtime);
    if (!menu.panel || menu.panel.kind !== 'pokedex' || menu.panel.id !== 'POKEDEX') {
      throw new Error('expected pokedex panel');
    }
    expect(menu.panel.screen).toBe('orderedList');
    expect(runtime.lastScriptId).toBe('menu.pokedex.entry.close');

    stepStartMenu(menu, { ...neutralInput, cancel: true, cancelPressed: true }, dialogue, runtime);
    if (!menu.panel || menu.panel.kind !== 'pokedex' || menu.panel.id !== 'POKEDEX') {
      throw new Error('expected pokedex panel');
    }
    expect(menu.panel.screen).toBe('topMenu');
    expect(runtime.lastScriptId).toBe('menu.pokedex.order.close');

    stepStartMenu(menu, { ...neutralInput, cancel: true, cancelPressed: true }, dialogue, runtime);
    expect(menu.panel).toBe(null);
    expect(menu.active).toBe(true);
    expect(menu.options[menu.selectedIndex]?.id).toBe('POKEDEX');
    expect(runtime.lastScriptId).toBe('menu.panel.close.pokedex');

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
    expect(menu.active).toBe(false);
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

  test('SAVE panel can be cancelled from the YES/NO prompt', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    menu.selectedIndex = menu.options.findIndex((entry) => entry.id === 'SAVE');
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, down: true, downPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.panel).toBe(null);
    expect(menu.active).toBe(true);
    expect(runtime.lastScriptId).toBe('menu.save.cancelled');
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

    stepStartMenu(menu, { ...neutralInput, down: true, downPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, down: true, downPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, right: true, rightPressed: true }, dialogue, runtime);
    expect(runtime.options.sound).toBe('mono');

    stepStartMenu(menu, { ...neutralInput, down: true, downPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, right: true, rightPressed: true }, dialogue, runtime);
    expect(runtime.options.buttonMode).toBe('lr');
  });

  test('opens BAG as the dedicated inventory panel instead of a text stub', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    menu.selectedIndex = menu.options.findIndex((entry) => entry.id === 'BAG');
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.panel?.kind).toBe('bag');
    expect(menu.panel?.id).toBe('BAG');
    expect(runtime.lastScriptId).toBe('menu.open.bag');

    stepStartMenu(menu, { ...neutralInput, cancel: true, cancelPressed: true }, dialogue, runtime);
    expect(menu.panel).toBe(null);
    expect(menu.active).toBe(true);
    expect(menu.options[menu.selectedIndex]?.id).toBe('BAG');
  });

  test('POKEMON opens a navigable party panel with actions and switching', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();
    const swaps: Array<[number, number]> = [];

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    menu.selectedIndex = menu.options.findIndex((entry) => entry.id === 'POKEMON');
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime, {
      onPartySwap: (fromIndex, toIndex) => {
        swaps.push([fromIndex, toIndex]);
      }
    });

    expect(menu.panel?.kind).toBe('party');
    if (!menu.panel || menu.panel.kind !== 'party') {
      throw new Error('expected party panel');
    }
    expect(menu.panel.rows[0]).toContain('CHARMANDER');

    stepStartMenu(menu, { ...neutralInput, down: true, downPressed: true }, dialogue, runtime);
    expect(menu.panel.selectedIndex).toBe(1);
    expect(runtime.lastScriptId).toBe('menu.party.move');

    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime, {
      onPartySwap: (fromIndex, toIndex) => {
        swaps.push([fromIndex, toIndex]);
      }
    });
    expect(menu.panel.mode).toBe('actions');

    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime, {
      onPartySwap: (fromIndex, toIndex) => {
        swaps.push([fromIndex, toIndex]);
      }
    });
    expect(menu.panel.mode).toBe('summary');
    expect(menu.panel.summaryPage).toBe(0);

    stepStartMenu(menu, { ...neutralInput, right: true, rightPressed: true }, dialogue, runtime);
    expect(menu.panel.summaryPage).toBe(1);
    expect(runtime.lastScriptId).toBe('menu.party.summary.page');

    stepStartMenu(menu, { ...neutralInput, cancel: true, cancelPressed: true }, dialogue, runtime);
    expect(menu.panel.mode).toBe('actions');

    stepStartMenu(menu, { ...neutralInput, down: true, downPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime, {
      onPartySwap: (fromIndex, toIndex) => {
        swaps.push([fromIndex, toIndex]);
      }
    });
    expect(menu.panel.mode).toBe('switch');

    stepStartMenu(menu, { ...neutralInput, up: true, upPressed: true }, dialogue, runtime, {
      onPartySwap: (fromIndex, toIndex) => {
        swaps.push([fromIndex, toIndex]);
      }
    });
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime, {
      onPartySwap: (fromIndex, toIndex) => {
        swaps.push([fromIndex, toIndex]);
      }
    });
    expect(menu.panel.mode).toBe('list');
    expect(swaps).toEqual([[1, 0]]);

    stepStartMenu(menu, { ...neutralInput, cancel: true, cancelPressed: true }, dialogue, runtime);
    expect(menu.panel).toBe(null);
    expect(menu.active).toBe(true);
    expect(menu.options[menu.selectedIndex]?.id).toBe('POKEMON');
  });

  test('PLAYER closes back into the start menu instead of the field', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    menu.selectedIndex = menu.options.findIndex((entry) => entry.id === 'PLAYER');
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.panel?.kind).toBe('summary');
    if (!menu.panel || menu.panel.kind !== 'summary' || menu.panel.id !== 'PLAYER') {
      throw new Error('expected player panel');
    }

    stepStartMenu(menu, { ...neutralInput, cancel: true, cancelPressed: true }, dialogue, runtime);
    expect(menu.panel).toBe(null);
    expect(menu.active).toBe(true);
    expect(menu.options[menu.selectedIndex]?.id).toBe('PLAYER');
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
