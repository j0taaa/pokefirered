import stdWindowFrameUrl from '../../../graphics/text_window/std.png';
import type { ScriptRuntimeState } from '../game/scripts';
import {
  getSafariZoneStats,
  getSelectedStartMenuDescription,
  type StartMenuState
} from '../game/menu';

export interface StartMenuViewBindings {
  root: HTMLElement;
  menuWindow: HTMLElement;
  optionsList: HTMLElement;
  helpWindow: HTMLElement;
  helpText: HTMLElement;
  safariWindow: HTMLElement;
  safariSteps: HTMLElement;
  safariBalls: HTMLElement;
  panelRoot: HTMLElement;
  panelTitle: HTMLElement;
  panelDescription: HTMLElement;
  panelRows: HTMLElement;
}

const applyWindowFrame = (element: HTMLElement): void => {
  element.style.setProperty('--window-frame-url', `url("${stdWindowFrameUrl}")`);
};

export const createStartMenuView = (): StartMenuViewBindings => {
  const root = document.createElement('section');
  root.className = 'start-menu-layer hidden';

  const menuWindow = document.createElement('section');
  menuWindow.className = 'start-menu gba-window hidden';

  const optionsList = document.createElement('ul');
  optionsList.className = 'start-menu-options';
  menuWindow.append(optionsList);

  const helpWindow = document.createElement('section');
  helpWindow.className = 'start-menu-help gba-window hidden';

  const helpText = document.createElement('p');
  helpText.className = 'start-menu-help-text';
  helpWindow.append(helpText);

  const safariWindow = document.createElement('section');
  safariWindow.className = 'start-menu-safari gba-window hidden';

  const safariSteps = document.createElement('p');
  safariSteps.className = 'start-menu-safari-text';

  const safariBalls = document.createElement('p');
  safariBalls.className = 'start-menu-safari-text';

  safariWindow.append(safariSteps, safariBalls);

  const panelRoot = document.createElement('section');
  panelRoot.className = 'menu-panel gba-window hidden';

  const panelTitle = document.createElement('h3');
  panelTitle.className = 'menu-panel-title';

  const panelDescription = document.createElement('p');
  panelDescription.className = 'menu-panel-description';

  const panelRows = document.createElement('ul');
  panelRows.className = 'menu-panel-rows hidden';

  panelRoot.append(panelTitle, panelDescription, panelRows);

  [menuWindow, helpWindow, safariWindow, panelRoot].forEach(applyWindowFrame);
  root.append(menuWindow, helpWindow, safariWindow, panelRoot);

  return {
    root,
    menuWindow,
    optionsList,
    helpWindow,
    helpText,
    safariWindow,
    safariSteps,
    safariBalls,
    panelRoot,
    panelTitle,
    panelDescription,
    panelRows
  };
};

export const updateStartMenuView = (
  bindings: StartMenuViewBindings,
  menu: StartMenuState,
  runtime: ScriptRuntimeState
): void => {
  const hasPanel = !!menu.panel;
  const showGenericPanel =
    menu.panel?.kind !== 'bag'
    && menu.panel?.kind !== 'party'
    && !(menu.panel?.kind === 'summary' && menu.panel.id === 'PLAYER');
  const showMenu = menu.active;
  const showHelp = menu.active && !hasPanel;
  const showSafariStats = showMenu && runtime.startMenu.mode === 'safari';

  bindings.root.classList.toggle('hidden', !showMenu && !showGenericPanel);
  bindings.menuWindow.classList.toggle('hidden', !showMenu);
  bindings.helpWindow.classList.toggle('hidden', !showHelp);
  bindings.safariWindow.classList.toggle('hidden', !showSafariStats);
  bindings.panelRoot.classList.toggle('hidden', !menu.panel || !showGenericPanel);

  bindings.optionsList.innerHTML = '';
  menu.options.forEach((option, index) => {
    const item = document.createElement('li');
    item.className = 'start-menu-option';

    const cursor = document.createElement('span');
    cursor.className = 'start-menu-cursor';
    cursor.textContent = '▶';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.classList.toggle('hidden', index !== menu.selectedIndex);

    const label = document.createElement('span');
    label.className = 'start-menu-label';
    label.textContent = option.label;

    item.append(cursor, label);
    bindings.optionsList.append(item);
  });

  bindings.helpText.textContent = getSelectedStartMenuDescription(menu) ?? '';

  const safariStats = getSafariZoneStats(runtime);
  bindings.safariSteps.textContent =
    `${safariStats.currentSteps.toString().padStart(3, ' ')}/${safariStats.totalSteps}`;
  bindings.safariBalls.textContent = `BALLS  ${safariStats.balls.toString().padStart(2, ' ')}`;

  bindings.panelTitle.textContent = menu.panel?.title ?? '';
  bindings.panelDescription.textContent = menu.panel?.description ?? '';

  const panel = menu.panel;
  const hasRows = !!panel && 'rows' in panel && panel.rows.length > 0;
  const showsCursor = panel?.kind === 'options' || panel?.kind === 'retire' || panel?.kind === 'party';
  bindings.panelRows.classList.toggle('hidden', !hasRows);
  bindings.panelRows.innerHTML = '';
  if (hasRows && panel) {
    panel.rows.forEach((row, index) => {
      const rowItem = document.createElement('li');
      rowItem.className = 'menu-panel-row';

      const cursor = document.createElement('span');
      cursor.className = 'menu-panel-cursor';
      cursor.textContent = '▶';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.classList.toggle('hidden', !showsCursor || !('selectedIndex' in panel) || index !== panel.selectedIndex);

      const label = document.createElement('span');
      label.className = 'menu-panel-row-label';
      label.textContent = row;

      rowItem.append(cursor, label);
      bindings.panelRows.append(rowItem);
    });
  }
};
