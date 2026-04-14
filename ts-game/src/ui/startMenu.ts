import type { StartMenuState } from '../game/menu';

export interface StartMenuViewBindings {
  root: HTMLElement;
  title: HTMLElement;
  optionsList: HTMLElement;
  panelRoot: HTMLElement;
  panelTitle: HTMLElement;
  panelDescription: HTMLElement;
  panelRows: HTMLElement;
}

export const createStartMenuView = (): StartMenuViewBindings => {
  const root = document.createElement('section');
  root.className = 'start-menu hidden';

  const title = document.createElement('header');
  title.className = 'start-menu-title';
  title.textContent = 'MENU';

  const optionsList = document.createElement('ul');
  optionsList.className = 'start-menu-options';

  const panelRoot = document.createElement('section');
  panelRoot.className = 'menu-panel hidden';

  const panelTitle = document.createElement('h3');
  panelTitle.className = 'menu-panel-title';

  const panelDescription = document.createElement('p');
  panelDescription.className = 'menu-panel-description';

  const panelRows = document.createElement('ul');
  panelRows.className = 'menu-panel-rows hidden';

  const panelHint = document.createElement('p');
  panelHint.className = 'menu-panel-hint';
  panelHint.textContent = 'Press X, Esc, or Z to return.';

  panelRoot.append(panelTitle, panelDescription, panelRows, panelHint);
  root.append(title, optionsList, panelRoot);

  return { root, title, optionsList, panelRoot, panelTitle, panelDescription, panelRows };
};

export const updateStartMenuView = (
  bindings: StartMenuViewBindings,
  menu: StartMenuState
): void => {
  const hasPanel = !!menu.panel;
  bindings.root.classList.toggle('hidden', !menu.active && !hasPanel);
  bindings.title.classList.toggle('hidden', !menu.active);
  bindings.optionsList.classList.toggle('hidden', !menu.active);
  bindings.panelRoot.classList.toggle('hidden', !menu.panel);

  bindings.optionsList.innerHTML = '';
  for (let i = 0; i < menu.options.length; i += 1) {
    const option = menu.options[i];
    const item = document.createElement('li');
    item.className = 'start-menu-option';
    item.textContent = `${i === menu.selectedIndex ? '▶' : ' '} ${option.label}`;
    bindings.optionsList.append(item);
  }

  bindings.panelTitle.textContent = menu.panel?.title ?? '';
  bindings.panelDescription.textContent = menu.panel?.description ?? '';
  bindings.panelRows.classList.toggle('hidden', menu.panel?.kind !== 'options');
  bindings.panelRows.innerHTML = '';
  const panel = menu.panel;
  if (panel?.kind === 'options') {
    panel.rows.forEach((row, index) => {
      const rowItem = document.createElement('li');
      rowItem.className = 'menu-panel-row';
      rowItem.textContent = `${index === panel.selectedIndex ? '▶' : ' '} ${row}`;
      bindings.panelRows.append(rowItem);
    });
  }
};
