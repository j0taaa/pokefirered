import bagSpriteUrl from '../../../graphics/interface/bag_male.png';
import {
  getBagDescription,
  getBagListEntries,
  getBagPocketLabel,
  getBagVisibleRows,
  getItemDefinition,
  type BagContextActionId,
  type BagPanelState,
  type BagState
} from '../game/bag';

const itemIconModules = import.meta.glob('../../../graphics/items/icons/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const itemIconUrls = new Map<string, string>();
for (const [modulePath, url] of Object.entries(itemIconModules)) {
  const key = modulePath.split('/').at(-1)?.replace(/\.png$/u, '');
  if (key) {
    itemIconUrls.set(key, url);
  }
}

export interface BagMenuViewBindings {
  root: HTMLElement;
  pocketLabel: HTMLElement;
  bagSprite: HTMLImageElement;
  selectedIcon: HTMLImageElement;
  listRoot: HTMLElement;
  description: HTMLElement;
  submenuRoot: HTMLElement;
  submenuTitle: HTMLElement;
  submenuList: HTMLElement;
  messageRoot: HTMLElement;
  messageText: HTMLElement;
}

const actionLabel = (action: BagContextActionId): string => action;

export const createBagMenuView = (): BagMenuViewBindings => {
  const root = document.createElement('section');
  root.className = 'bag-menu hidden';

  const layout = document.createElement('div');
  layout.className = 'bag-menu-layout';

  const bagArt = document.createElement('section');
  bagArt.className = 'bag-menu-art';

  const pocketLabel = document.createElement('header');
  pocketLabel.className = 'bag-pocket-label';

  const bagSprite = document.createElement('img');
  bagSprite.className = 'bag-sprite';
  bagSprite.alt = 'Bag';
  bagSprite.src = bagSpriteUrl;

  const selectedIcon = document.createElement('img');
  selectedIcon.className = 'bag-selected-icon hidden';
  selectedIcon.alt = '';

  bagArt.append(pocketLabel, bagSprite, selectedIcon);

  const listPanel = document.createElement('section');
  listPanel.className = 'bag-list-panel bag-window';

  const listRoot = document.createElement('ul');
  listRoot.className = 'bag-list';
  listPanel.append(listRoot);

  const descriptionPanel = document.createElement('section');
  descriptionPanel.className = 'bag-description-panel bag-window';

  const description = document.createElement('p');
  description.className = 'bag-description';
  descriptionPanel.append(description);

  const submenuRoot = document.createElement('section');
  submenuRoot.className = 'bag-submenu bag-window hidden';

  const submenuTitle = document.createElement('h3');
  submenuTitle.className = 'bag-submenu-title';

  const submenuList = document.createElement('ul');
  submenuList.className = 'bag-submenu-list';

  submenuRoot.append(submenuTitle, submenuList);

  const messageRoot = document.createElement('section');
  messageRoot.className = 'bag-message bag-window hidden';

  const messageText = document.createElement('p');
  messageText.className = 'bag-message-text';
  messageRoot.append(messageText);

  layout.append(bagArt, listPanel, descriptionPanel, submenuRoot, messageRoot);
  root.append(layout);

  return {
    root,
    pocketLabel,
    bagSprite,
    selectedIcon,
    listRoot,
    description,
    submenuRoot,
    submenuTitle,
    submenuList,
    messageRoot,
    messageText
  };
};

export const updateBagMenuView = (
  bindings: BagMenuViewBindings,
  panel: BagPanelState | null,
  bag: BagState
): void => {
  if (!panel) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');
  bindings.root.dataset.pocket = bag.selectedPocket;
  bindings.pocketLabel.textContent = getBagPocketLabel(bag.selectedPocket);

  const selectedEntry = getBagListEntries(bag, bag.selectedPocket)[bag.selectedIndexByPocket[bag.selectedPocket]];
  const iconKey = selectedEntry?.iconKey ?? null;
  const iconUrl = iconKey ? itemIconUrls.get(iconKey) ?? '' : '';
  bindings.selectedIcon.classList.toggle('hidden', !iconUrl);
  if (iconUrl) {
    bindings.selectedIcon.src = iconUrl;
  } else {
    bindings.selectedIcon.removeAttribute('src');
  }

  bindings.listRoot.innerHTML = '';
  const visibleRows = getBagVisibleRows(bag);
  for (const row of visibleRows) {
    const item = document.createElement('li');
    item.className = 'bag-row';
    item.classList.toggle('bag-row-selected', row.isSelected);
    item.classList.toggle('bag-row-exit', row.isExit);

    const cursor = document.createElement('span');
    cursor.className = 'bag-row-cursor';
    cursor.textContent = row.isSelected ? '▶' : '';

    const icon = document.createElement('img');
    icon.className = 'bag-row-icon';
    if (row.iconKey) {
      icon.src = itemIconUrls.get(row.iconKey) ?? '';
      icon.alt = '';
    } else {
      icon.classList.add('bag-row-icon-empty');
      icon.alt = '';
    }

    const label = document.createElement('span');
    label.className = 'bag-row-label';
    label.textContent = row.label;

    const quantity = document.createElement('span');
    quantity.className = 'bag-row-quantity';
    if (row.isRegistered) {
      quantity.textContent = 'SELECT';
      quantity.classList.add('bag-row-registered');
    } else {
      quantity.textContent = row.quantity === null ? '' : `x${row.quantity}`;
    }

    item.append(cursor, icon, label, quantity);
    bindings.listRoot.append(item);
  }

  bindings.description.textContent = panel.message?.text ?? getBagDescription(bag);

  const hasSubmenu = !!panel.contextMenu || !!panel.quantityPrompt || !!panel.confirmationPrompt;
  bindings.submenuRoot.classList.toggle('hidden', !hasSubmenu);
  bindings.submenuList.innerHTML = '';

  if (panel.contextMenu) {
    bindings.submenuTitle.textContent = getItemDefinition(panel.contextMenu.itemId).name;
    panel.contextMenu.actions.forEach((action, index) => {
      const row = document.createElement('li');
      row.className = 'bag-submenu-row';
      row.textContent = `${index === panel.contextMenu?.selectedIndex ? '▶ ' : ''}${actionLabel(action)}`;
      bindings.submenuList.append(row);
    });
  } else if (panel.quantityPrompt) {
    bindings.submenuTitle.textContent = 'TOSS HOW MANY?';
    const row = document.createElement('li');
    row.className = 'bag-submenu-row';
    row.textContent = `▶ x${panel.quantityPrompt.quantity.toString().padStart(3, '0')}`;
    bindings.submenuList.append(row);
  } else if (panel.confirmationPrompt) {
    bindings.submenuTitle.textContent = `TOSS ${panel.confirmationPrompt.quantity}?`;
    ['YES', 'NO'].forEach((choice, index) => {
      const row = document.createElement('li');
      row.className = 'bag-submenu-row';
      row.textContent = `${index === panel.confirmationPrompt?.selectedIndex ? '▶ ' : ''}${choice}`;
      bindings.submenuList.append(row);
    });
  }

  bindings.messageRoot.classList.toggle('hidden', !panel.message);
  bindings.messageText.textContent = panel.message?.text ?? '';
};
