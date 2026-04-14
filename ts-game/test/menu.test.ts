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

  test('EXIT closes menu and non-exit sets selection script id', () => {
    const menu = createStartMenuState();
    const dialogue = createDialogueState();
    const runtime = createScriptRuntimeState();

    stepStartMenu(menu, { ...neutralInput, start: true, startPressed: true }, dialogue, runtime);
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.active).toBe(true);
    expect(runtime.lastScriptId).toBe('menu.select.pokédex');

    menu.selectedIndex = menu.options.indexOf('EXIT');
    stepStartMenu(menu, { ...neutralInput, interact: true, interactPressed: true }, dialogue, runtime);

    expect(menu.active).toBe(false);
    expect(runtime.lastScriptId).toBe('menu.exit');
  });
});
