import type { InputSnapshot } from '../input/inputState';
import { closeDialogue, type DialogueState } from './interaction';
import type { ScriptRuntimeState } from './scripts';

type StartMenuOptionId =
  | 'POKEDEX'
  | 'POKEMON'
  | 'BAG'
  | 'PLAYER'
  | 'SAVE'
  | 'OPTION'
  | 'EXIT'
  | 'RETIRE';

interface StartMenuEntry {
  id: StartMenuOptionId;
  label: string;
}

interface MenuPanelState {
  id: Exclude<StartMenuOptionId, 'EXIT'>;
  title: string;
  description: string;
}

export interface StartMenuState {
  active: boolean;
  options: StartMenuEntry[];
  selectedIndex: number;
  panel: MenuPanelState | null;
}

const optionLabel = (id: StartMenuOptionId, playerName: string): string => {
  switch (id) {
    case 'POKEDEX':
      return 'POKéDEX';
    case 'POKEMON':
      return 'POKéMON';
    case 'PLAYER':
      return playerName;
    default:
      return id;
  }
};

const panelTitle = (id: Exclude<StartMenuOptionId, 'EXIT'>): string =>
  optionLabel(id, 'PLAYER');

const panelDescription = (id: Exclude<StartMenuOptionId, 'EXIT'>): string => {
  switch (id) {
    case 'POKEDEX':
      return 'Pokédex panel placeholder. In FireRed this opens the Pokédex screen task.';
    case 'POKEMON':
      return 'Party panel placeholder. In FireRed this opens the party screen.';
    case 'BAG':
      return 'Bag panel placeholder. In FireRed this opens bag pockets UI.';
    case 'PLAYER':
      return 'Trainer card placeholder. In FireRed this opens the trainer card.';
    case 'SAVE':
      return 'Save panel placeholder. In FireRed this starts save preparation callbacks.';
    case 'OPTION':
      return 'Option panel placeholder. In FireRed this opens options and returns to field.';
    case 'RETIRE':
      return 'Safari retire placeholder. In FireRed this asks to retire from Safari Zone.';
  }
};

const buildOptions = (runtime: ScriptRuntimeState): StartMenuEntry[] => {
  const { mode, hasPokedex, hasPokemon, playerName } = runtime.startMenu;
  const append = (ids: StartMenuOptionId[]): StartMenuEntry[] =>
    ids.map((id) => ({ id, label: optionLabel(id, playerName) }));

  switch (mode) {
    case 'link':
      return append(['POKEMON', 'BAG', 'PLAYER', 'OPTION', 'EXIT']);
    case 'unionRoom':
      return append(['POKEMON', 'BAG', 'PLAYER', 'OPTION', 'EXIT']);
    case 'safari':
      return append([
        'RETIRE',
        'POKEDEX',
        'POKEMON',
        'BAG',
        'PLAYER',
        'OPTION',
        'EXIT'
      ]);
    case 'normal':
      return append([
        ...(hasPokedex ? ['POKEDEX'] as const : []),
        ...(hasPokemon ? ['POKEMON'] as const : []),
        'BAG',
        'PLAYER',
        'SAVE',
        'OPTION',
        'EXIT'
      ]);
  }
};

export const createStartMenuState = (): StartMenuState => ({
  active: false,
  options: [],
  selectedIndex: 0,
  panel: null
});

export const openStartMenu = (menu: StartMenuState, runtime: ScriptRuntimeState): void => {
  menu.options = buildOptions(runtime);
  menu.active = true;
  menu.selectedIndex = 0;
};

export const closeStartMenu = (menu: StartMenuState): void => {
  menu.active = false;
};

export const closeMenuPanel = (menu: StartMenuState): void => {
  menu.panel = null;
};

export const isStartMenuBlockingWorld = (menu: StartMenuState): boolean => menu.active || !!menu.panel;

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
  if (menu.panel) {
    if (input.cancelPressed || input.startPressed || input.interactPressed) {
      runtime.lastScriptId = `menu.panel.close.${menu.panel.id.toLowerCase()}`;
      closeMenuPanel(menu);
    }
    return;
  }

  if (!menu.active) {
    if (!input.startPressed) {
      return;
    }

    // In field_control_avatar.c, START during a text script first cancels message flow
    // before returning control. We mimic that by closing our dialogue stub first.
    if (dialogue.active) {
      closeDialogue(dialogue);
    }

    openStartMenu(menu, runtime);
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

  const selected = menu.options[menu.selectedIndex];
  if (!selected) {
    return;
  }

  if (selected.id === 'EXIT') {
    closeStartMenu(menu);
    runtime.lastScriptId = 'menu.exit';
    return;
  }

  closeStartMenu(menu);
  menu.panel = {
    id: selected.id,
    title: panelTitle(selected.id),
    description: panelDescription(selected.id)
  };
  runtime.lastScriptId = `menu.open.${selected.id.toLowerCase()}`;
};
