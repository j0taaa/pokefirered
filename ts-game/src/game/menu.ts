import type { InputSnapshot } from '../input/inputState';
import { closeDialogue, type DialogueState } from './interaction';
import type { ScriptRuntimeState } from './scripts';

export interface StartMenuState {
  active: boolean;
  options: string[];
  selectedIndex: number;
}

// Mirrors the default FireRed START menu ordering from start_menu.c.
const DEFAULT_START_MENU_OPTIONS = [
  'POKéDEX',
  'POKéMON',
  'BAG',
  'PLAYER',
  'SAVE',
  'OPTION',
  'EXIT'
];

export const createStartMenuState = (): StartMenuState => ({
  active: false,
  options: [...DEFAULT_START_MENU_OPTIONS],
  selectedIndex: 0
});

export const openStartMenu = (menu: StartMenuState): void => {
  menu.active = true;
  menu.selectedIndex = 0;
};

export const closeStartMenu = (menu: StartMenuState): void => {
  menu.active = false;
};

export const isStartMenuBlockingWorld = (menu: StartMenuState): boolean => menu.active;

const moveSelection = (menu: StartMenuState, direction: -1 | 1): void => {
  const optionCount = menu.options.length;
  if (optionCount === 0) {
    menu.selectedIndex = 0;
    return;
  }

  menu.selectedIndex = (menu.selectedIndex + direction + optionCount) % optionCount;
};

export const stepStartMenu = (
  menu: StartMenuState,
  input: InputSnapshot,
  dialogue: DialogueState,
  runtime: ScriptRuntimeState
): void => {
  if (!menu.active) {
    if (!input.startPressed) {
      return;
    }

    // In field_control_avatar.c, START during a text script first cancels message flow
    // before returning control. We mimic that by closing our dialogue stub first.
    if (dialogue.active) {
      closeDialogue(dialogue);
    }

    openStartMenu(menu);
    runtime.lastScriptId = 'menu.open.start';
    return;
  }

  if (input.startPressed || input.cancelPressed) {
    closeStartMenu(menu);
    runtime.lastScriptId = 'menu.close.start';
    return;
  }

  if (input.upPressed) {
    moveSelection(menu, -1);
  } else if (input.downPressed) {
    moveSelection(menu, 1);
  }

  if (!input.interactPressed) {
    return;
  }

  const selected = menu.options[menu.selectedIndex] ?? 'UNKNOWN';
  if (selected === 'EXIT') {
    closeStartMenu(menu);
    runtime.lastScriptId = 'menu.exit';
    return;
  }

  runtime.lastScriptId = `menu.select.${selected.toLowerCase()}`;
};
