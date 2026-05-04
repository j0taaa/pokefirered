import type { OptionPanelState } from '../game/menu';

export interface OptionMenuViewBindings {
  root: HTMLElement;
  title: HTMLElement;
  description: HTMLElement;
  listRoot: HTMLElement;
}

export const createOptionMenuView = (): OptionMenuViewBindings => {
  const root = document.createElement('section');
  root.className = 'option-menu hidden';

  const title = document.createElement('h3');
  title.className = 'option-menu-title';

  const description = document.createElement('p');
  description.className = 'option-menu-description';

  const listRoot = document.createElement('ul');
  listRoot.className = 'option-menu-list';

  root.append(title, description, listRoot);

  return { root, title, description, listRoot };
};

export const updateOptionMenuView = (
  bindings: OptionMenuViewBindings,
  panel: OptionPanelState | null
): void => {
  if (!panel) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');
  bindings.title.textContent = panel.title;
  bindings.description.textContent = panel.description;

  bindings.listRoot.innerHTML = '';
  panel.rows.forEach((row, index) => {
    const item = document.createElement('li');
    item.className = 'option-row';
    item.classList.toggle('option-row-selected', index === panel.selectedIndex);

    const cursor = document.createElement('span');
    cursor.className = 'option-row-cursor';
    cursor.textContent = index === panel.selectedIndex ? '▶' : '';

    const label = document.createElement('span');
    label.className = 'option-row-label';
    label.textContent = row;

    item.append(cursor, label);
    bindings.listRoot.append(item);
  });
};