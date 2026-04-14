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

interface TextPanelState {
  kind: 'text';
  id: Exclude<StartMenuOptionId, 'EXIT' | 'SAVE' | 'OPTION'>;
  title: string;
  description: string;
  returnToMenuOnClose: boolean;
}

interface SavePanelState {
  kind: 'save';
  id: 'SAVE';
  title: string;
  stage: 'ask' | 'overwrite' | 'result';
  description: string;
  returnToMenuOnClose: boolean;
}

const textSpeedValues = ['slow', 'mid', 'fast'] as const;
const battleStyleValues = ['shift', 'set'] as const;

type OptionSettingId = 'textSpeed' | 'battleScene' | 'battleStyle' | 'cancel';

interface OptionPanelState {
  kind: 'options';
  id: 'OPTION';
  title: string;
  description: string;
  rows: string[];
  selectedIndex: number;
  settingOrder: OptionSettingId[];
  returnToMenuOnClose: boolean;
}

type MenuPanelState = TextPanelState | SavePanelState | OptionPanelState;

export interface StartMenuCallbacks {
  onSaveConfirmed?: () => {
    ok: boolean;
    summary: string;
  };
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

const panelDescription = (id: Exclude<StartMenuOptionId, 'EXIT' | 'SAVE' | 'OPTION'>): string => {
  switch (id) {
    case 'POKEDEX':
      return 'Pokédex panel placeholder. In FireRed this opens the Pokédex screen task.';
    case 'POKEMON':
      return 'Party panel placeholder. In FireRed this opens the party screen.';
    case 'BAG':
      return 'Bag panel placeholder. In FireRed this opens bag pockets UI.';
    case 'PLAYER':
      return 'Trainer card placeholder. In FireRed this opens the trainer card.';
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

const getTextSpeedLabel = (value: ScriptRuntimeState['options']['textSpeed']): string => {
  switch (value) {
    case 'slow':
      return 'SLOW';
    case 'mid':
      return 'MID';
    case 'fast':
      return 'FAST';
  }
};

const getBattleStyleLabel = (value: ScriptRuntimeState['options']['battleStyle']): string => {
  switch (value) {
    case 'shift':
      return 'SHIFT';
    case 'set':
      return 'SET';
  }
};

const cycleIndex = (current: number, count: number, direction: -1 | 1): number =>
  (current + direction + count) % count;

const stepOptionPanel = (
  panel: OptionPanelState,
  input: InputSnapshot,
  runtime: ScriptRuntimeState
): { close: boolean; consumed: boolean } => {
  if (input.upPressed) {
    panel.selectedIndex = cycleIndex(panel.selectedIndex, panel.settingOrder.length, -1);
    return { close: false, consumed: true };
  }

  if (input.downPressed) {
    panel.selectedIndex = cycleIndex(panel.selectedIndex, panel.settingOrder.length, 1);
    return { close: false, consumed: true };
  }

  const selected = panel.settingOrder[panel.selectedIndex];
  const adjustDirection: -1 | 1 | null = input.leftPressed ? -1 : input.rightPressed ? 1 : null;
  if (adjustDirection) {
    if (selected === 'textSpeed') {
      const currentIndex = textSpeedValues.indexOf(runtime.options.textSpeed);
      runtime.options.textSpeed = textSpeedValues[cycleIndex(currentIndex, textSpeedValues.length, adjustDirection)];
      panel.description = `TEXT SPEED: ${getTextSpeedLabel(runtime.options.textSpeed)}`;
      updateOptionPanelRows(panel, runtime);
      return { close: false, consumed: true };
    }

    if (selected === 'battleScene') {
      runtime.options.battleScene = !runtime.options.battleScene;
      panel.description = `BATTLE SCENE: ${runtime.options.battleScene ? 'ON' : 'OFF'}`;
      updateOptionPanelRows(panel, runtime);
      return { close: false, consumed: true };
    }

    if (selected === 'battleStyle') {
      const currentIndex = battleStyleValues.indexOf(runtime.options.battleStyle);
      runtime.options.battleStyle = battleStyleValues[cycleIndex(currentIndex, battleStyleValues.length, adjustDirection)];
      panel.description = `BATTLE STYLE: ${getBattleStyleLabel(runtime.options.battleStyle)}`;
      updateOptionPanelRows(panel, runtime);
      return { close: false, consumed: true };
    }
  }

  if (input.interactPressed && selected === 'cancel') {
    panel.description = 'Closed OPTIONS.';
    return { close: true, consumed: true };
  }

  return { close: false, consumed: false };
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

export const getOptionPanelRows = (runtime: ScriptRuntimeState): string[] => [
  `TEXT SPEED   ${getTextSpeedLabel(runtime.options.textSpeed)}`,
  `BATTLE SCENE ${runtime.options.battleScene ? 'ON' : 'OFF'}`,
  `BATTLE STYLE ${getBattleStyleLabel(runtime.options.battleStyle)}`,
  'CANCEL'
];

const updateOptionPanelRows = (panel: OptionPanelState, runtime: ScriptRuntimeState): void => {
  panel.rows = getOptionPanelRows(runtime);
};

export const stepStartMenu = (
  menu: StartMenuState,
  input: InputSnapshot,
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  callbacks: StartMenuCallbacks = {}
): void => {
  if (menu.panel) {
    if (menu.panel.kind === 'save') {
      if (input.interactPressed) {
        if (menu.panel.stage === 'ask') {
          if (runtime.saveCounter > 0) {
            menu.panel.stage = 'overwrite';
            menu.panel.description = 'There is already a save file. Overwrite it?';
          } else {
            const result = callbacks.onSaveConfirmed?.();
            if (result) {
              menu.panel.stage = 'result';
              menu.panel.description = result.summary;
              runtime.lastScriptId = result.ok ? 'menu.save.success' : 'menu.save.failed';
            }
          }
          return;
        }

        if (menu.panel.stage === 'overwrite') {
          const result = callbacks.onSaveConfirmed?.();
          if (result) {
            menu.panel.stage = 'result';
            menu.panel.description = result.summary;
            runtime.lastScriptId = result.ok ? 'menu.save.success' : 'menu.save.failed';
          }
          return;
        }
      }

      if (input.cancelPressed || input.startPressed || (input.interactPressed && menu.panel.stage === 'result')) {
        const shouldReturnToMenu = menu.panel.returnToMenuOnClose;
        runtime.lastScriptId = `menu.panel.close.${menu.panel.id.toLowerCase()}`;
        closeMenuPanel(menu);
        if (shouldReturnToMenu) {
          menu.active = true;
        }
      }
      return;
    }

    if (menu.panel.kind === 'options') {
      const optionStep = stepOptionPanel(menu.panel, input, runtime);
      if (optionStep.close || input.cancelPressed || input.startPressed) {
        const shouldReturnToMenu = menu.panel.returnToMenuOnClose;
        runtime.lastScriptId = `menu.panel.close.${menu.panel.id.toLowerCase()}`;
        closeMenuPanel(menu);
        if (shouldReturnToMenu) {
          menu.active = true;
        }
        return;
      }

      if (optionStep.consumed) {
        return;
      }
    }

    if (menu.panel.kind === 'text' && (input.cancelPressed || input.startPressed || input.interactPressed)) {
      const shouldReturnToMenu = menu.panel.returnToMenuOnClose;
      runtime.lastScriptId = `menu.panel.close.${menu.panel.id.toLowerCase()}`;
      closeMenuPanel(menu);
      if (shouldReturnToMenu) {
        menu.active = true;
      }
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

  if (selected.id === 'SAVE') {
    menu.panel = {
      kind: 'save',
      id: 'SAVE',
      title: panelTitle('SAVE'),
      stage: 'ask',
      description: 'Would you like to save the game?',
      returnToMenuOnClose: true
    };
    runtime.lastScriptId = 'menu.open.save';
    return;
  }

  if (selected.id === 'OPTION') {
    menu.panel = {
      kind: 'options',
      id: 'OPTION',
      title: panelTitle('OPTION'),
      description: `TEXT SPEED: ${getTextSpeedLabel(runtime.options.textSpeed)}`,
      rows: getOptionPanelRows(runtime),
      selectedIndex: 0,
      settingOrder: ['textSpeed', 'battleScene', 'battleStyle', 'cancel'],
      returnToMenuOnClose: true
    };
    runtime.lastScriptId = 'menu.open.option';
    return;
  }

  menu.panel = {
    kind: 'text',
    id: selected.id,
    title: panelTitle(selected.id),
    description: panelDescription(selected.id),
    returnToMenuOnClose: false
  };
  runtime.lastScriptId = `menu.open.${selected.id.toLowerCase()}`;
};
