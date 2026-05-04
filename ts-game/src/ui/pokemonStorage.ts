import type { PcStorageState } from '../game/pcStorage';
import { PC_ACTION_ORDER, getCurrentBoxSlots, getPartySlots, getPcActionLabel } from '../game/pcStorage';
import { getSpeciesDisplayName } from '../game/pokemonStorage';

export interface PokemonStorageViewBindings {
  root: HTMLElement;
  boxTitle: HTMLElement;
  boxGrid: HTMLElement;
  partyList: HTMLElement;
  actionRoot: HTMLElement;
  actionList: HTMLElement;
  messageRoot: HTMLElement;
  messageText: HTMLElement;
  boxNavLeft: HTMLElement;
  boxNavRight: HTMLElement;
}

const BOX_COLUMNS = 6;
const BOX_ROWS = 5;

export const createPokemonStorageView = (): PokemonStorageViewBindings => {
  const root = document.createElement('section');
  root.className = 'pc-storage hidden';

  const boxTitle = document.createElement('h3');
  boxTitle.className = 'pc-storage-box-title';

  const boxNavLeft = document.createElement('button');
  boxNavLeft.className = 'pc-storage-nav pc-storage-nav-left';
  boxNavLeft.textContent = '◀';

  const boxNavRight = document.createElement('button');
  boxNavRight.className = 'pc-storage-nav pc-storage-nav-right';
  boxNavRight.textContent = '▶';

  const boxGrid = document.createElement('div');
  boxGrid.className = 'pc-storage-box-grid';

  const partyList = document.createElement('ul');
  partyList.className = 'pc-storage-party-list';

  const actionRoot = document.createElement('section');
  actionRoot.className = 'pc-storage-actions gba-window hidden';

  const actionList = document.createElement('ul');
  actionList.className = 'pc-storage-action-list';
  actionRoot.append(actionList);

  const messageRoot = document.createElement('section');
  messageRoot.className = 'pc-storage-message gba-window hidden';

  const messageText = document.createElement('p');
  messageText.className = 'pc-storage-message-text';
  messageRoot.append(messageText);

  root.append(boxTitle, boxNavLeft, boxNavRight, boxGrid, partyList, actionRoot, messageRoot);

  return {
    root,
    boxTitle,
    boxGrid,
    partyList,
    actionRoot,
    actionList,
    messageRoot,
    messageText,
    boxNavLeft,
    boxNavRight
  };
};

export const updatePokemonStorageView = (
  bindings: PokemonStorageViewBindings,
  state: PcStorageState | null
): void => {
  if (!state) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');
  bindings.boxTitle.textContent = state.boxNames[state.currentBox] ?? `BOX ${state.currentBox + 1}`;

  bindings.boxGrid.innerHTML = '';
  const boxSlots = getCurrentBoxSlots(state);
  for (let row = 0; row < BOX_ROWS; row += 1) {
    for (let col = 0; col < BOX_COLUMNS; col += 1) {
      const idx = row * BOX_COLUMNS + col;
      const slot = boxSlots[idx];
      const cell = document.createElement('div');
      cell.className = 'pc-storage-box-cell';
      cell.classList.toggle('pc-storage-box-cell-occupied', slot !== null);
      cell.classList.toggle('pc-storage-box-cell-selected', state.cursorArea === 'box' && state.cursorPosition === idx);
      cell.textContent = slot ? getSpeciesDisplayName(slot.species) : '';
      bindings.boxGrid.append(cell);
    }
  }

  bindings.partyList.innerHTML = '';
  const partySlots = getPartySlots(state);
  for (let i = 0; i < partySlots.length; i += 1) {
    const slot = partySlots[i];
    const item = document.createElement('li');
    item.className = 'pc-storage-party-slot';
    item.classList.toggle('pc-storage-party-selected', state.cursorArea === 'party' && state.cursorPosition === i);
    item.classList.toggle('pc-storage-party-empty', slot === null);
    item.textContent = slot ? getSpeciesDisplayName(slot.species) : '---';
    bindings.partyList.append(item);
  }

  const hasActions = state.action !== null && state.action !== 'cancel';
  bindings.actionRoot.classList.toggle('hidden', !hasActions);
  bindings.actionList.innerHTML = '';
  if (hasActions) {
    PC_ACTION_ORDER.forEach((action) => {
      const item = document.createElement('li');
      item.className = 'pc-storage-action-row';
      item.textContent = getPcActionLabel(action);
      item.classList.toggle('pc-storage-action-selected', action === state.action);
      bindings.actionList.append(item);
    });
  }

  bindings.messageRoot.classList.toggle('hidden', !state.message);
  bindings.messageText.textContent = state.message;
};