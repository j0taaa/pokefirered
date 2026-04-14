import type { StartMenuState } from '../game/menu';

export interface StartMenuViewBindings {
  root: HTMLElement;
  optionsList: HTMLElement;
}

export const createStartMenuView = (): StartMenuViewBindings => {
  const root = document.createElement('section');
  root.className = 'start-menu hidden';

  const title = document.createElement('header');
  title.className = 'start-menu-title';
  title.textContent = 'MENU';

  const optionsList = document.createElement('ul');
  optionsList.className = 'start-menu-options';

  root.append(title, optionsList);

  return { root, optionsList };
};

export const updateStartMenuView = (
  bindings: StartMenuViewBindings,
  menu: StartMenuState
): void => {
  bindings.root.classList.toggle('hidden', !menu.active);

  bindings.optionsList.innerHTML = '';
  for (let i = 0; i < menu.options.length; i += 1) {
    const option = menu.options[i];
    const item = document.createElement('li');
    item.className = 'start-menu-option';
    item.textContent = `${i === menu.selectedIndex ? '▶' : ' '} ${option}`;
    bindings.optionsList.append(item);
  }
};
