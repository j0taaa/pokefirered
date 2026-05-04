import {
  getNamingScreenKeyboardChars,
  getNamingScreenCurrentPageColumnCount,
  getNamingScreenTextEntryPosition,
  CHAR_SPACE,
  EOS,
  KBROW_COUNT,
  type NamingScreenState
} from '../game/namingScreen';

const KEYBOARD_ROW_COUNT = KBROW_COUNT;

export interface NamingScreenViewBindings {
  root: HTMLElement;
  titleElement: HTMLElement;
  textEntry: HTMLElement;
  keyboardRoot: HTMLElement;
  keyboardRows: HTMLElement[];
  buttonRow: HTMLElement;
  pageButton: HTMLElement;
  backspaceButton: HTMLElement;
  okButton: HTMLElement;
  cursorElement: HTMLElement;
}

export const createNamingScreenView = (): NamingScreenViewBindings => {
  const root = document.createElement('section');
  root.className = 'naming-screen hidden';

  const titleElement = document.createElement('h3');
  titleElement.className = 'naming-screen-title';

  const textEntry = document.createElement('div');
  textEntry.className = 'naming-screen-entry';

  const keyboardRoot = document.createElement('div');
  keyboardRoot.className = 'naming-screen-keyboard';

  const keyboardRows: HTMLElement[] = [];
  for (let row = 0; row < KEYBOARD_ROW_COUNT; row += 1) {
    const rowEl = document.createElement('div');
    rowEl.className = 'naming-screen-keyboard-row';
    keyboardRoot.append(rowEl);
    keyboardRows.push(rowEl);
  }

  const buttonRow = document.createElement('div');
  buttonRow.className = 'naming-screen-button-row';

  const pageButton = document.createElement('button');
  pageButton.className = 'naming-screen-btn naming-screen-btn-page';
  pageButton.textContent = 'PAGE';

  const backspaceButton = document.createElement('button');
  backspaceButton.className = 'naming-screen-btn naming-screen-btn-back';
  backspaceButton.textContent = '←';

  const okButton = document.createElement('button');
  okButton.className = 'naming-screen-btn naming-screen-btn-ok';
  okButton.textContent = 'OK';

  buttonRow.append(pageButton, backspaceButton, okButton);

  const cursorElement = document.createElement('span');
  cursorElement.className = 'naming-screen-cursor';
  cursorElement.textContent = '▌';

  root.append(titleElement, textEntry, keyboardRoot, buttonRow);

  return {
    root,
    titleElement,
    textEntry,
    keyboardRoot,
    keyboardRows,
    buttonRow,
    pageButton,
    backspaceButton,
    okButton,
    cursorElement
  };
};

export const updateNamingScreenView = (
  bindings: NamingScreenViewBindings,
  state: NamingScreenState | null
): void => {
  if (!state) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');
  bindings.titleElement.textContent = state.title;

  const pos = getNamingScreenTextEntryPosition(state);
  let displayText = '';
  for (let i = 0; i < state.maxLength; i += 1) {
    const ch = state.textBuffer[i] ?? '';
    if (ch === EOS || ch === '') {
      if (i === pos) {
        displayText += '▌';
      } else {
        displayText += ' ';
      }
    } else if (ch === CHAR_SPACE) {
      displayText += ' ';
    } else {
      displayText += ch;
    }
  }
  bindings.textEntry.textContent = displayText;

  const chars = getNamingScreenKeyboardChars(state);
  const columns = getNamingScreenCurrentPageColumnCount(state);

  for (let row = 0; row < KEYBOARD_ROW_COUNT; row += 1) {
    const rowEl = bindings.keyboardRows[row];
    if (!rowEl) {
      continue;
    }
    rowEl.innerHTML = '';
    const rowChars = chars[row] ?? [];
    for (let col = 0; col < rowChars.length; col += 1) {
      const key = document.createElement('span');
      key.className = 'naming-screen-key';
      key.classList.toggle('naming-screen-key-selected', state.cursorX === col && state.cursorY === row);
      const ch = rowChars[col];
      key.textContent = ch === CHAR_SPACE ? '␣' : ch === EOS ? '' : ch;
      rowEl.append(key);
    }
  }

  bindings.pageButton.classList.toggle(
    'naming-screen-btn-selected',
    state.cursorX >= columns && state.cursorY === 0
  );
  bindings.backspaceButton.classList.toggle(
    'naming-screen-btn-selected',
    state.cursorX >= columns && state.cursorY === 1
  );
  bindings.okButton.classList.toggle(
    'naming-screen-btn-selected',
    state.cursorX >= columns && state.cursorY === 2
  );
};