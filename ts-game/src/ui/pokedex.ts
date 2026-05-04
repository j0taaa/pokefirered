import type { PokedexPanelState } from '../game/menu';

export interface PokedexViewBindings {
  root: HTMLElement;
  title: HTMLElement;
  description: HTMLElement;
  seenOwned: HTMLElement;
  topMenuRoot: HTMLElement;
  topMenuList: HTMLElement;
  orderedListRoot: HTMLElement;
  orderedListList: HTMLElement;
  entryRoot: HTMLElement;
  entrySpecies: HTMLElement;
  entryPage: HTMLElement;
  categoryRoot: HTMLElement;
  categoryGrid: HTMLElement;
  areaRoot: HTMLElement;
  areaMap: HTMLElement;
}

const formatPokedexNumber = (num: number): string => num.toString().padStart(3, '0');

export const createPokedexView = (): PokedexViewBindings => {
  const root = document.createElement('section');
  root.className = 'pokedex-menu hidden';

  const title = document.createElement('h3');
  title.className = 'pokedex-title';

  const description = document.createElement('p');
  description.className = 'pokedex-description';

  const seenOwned = document.createElement('p');
  seenOwned.className = 'pokedex-seen-owned';

  const topMenuRoot = document.createElement('section');
  topMenuRoot.className = 'pokedex-top-menu gba-window hidden';
  const topMenuList = document.createElement('ul');
  topMenuList.className = 'pokedex-top-menu-list';
  topMenuRoot.append(topMenuList);

  const orderedListRoot = document.createElement('section');
  orderedListRoot.className = 'pokedex-ordered-list gba-window hidden';
  const orderedListList = document.createElement('ul');
  orderedListList.className = 'pokedex-ordered-list-items';
  orderedListRoot.append(orderedListList);

  const entryRoot = document.createElement('section');
  entryRoot.className = 'pokedex-entry gba-window hidden';
  const entrySpecies = document.createElement('h4');
  entrySpecies.className = 'pokedex-entry-species';
  const entryPage = document.createElement('div');
  entryPage.className = 'pokedex-entry-page';
  entryRoot.append(entrySpecies, entryPage);

  const categoryRoot = document.createElement('section');
  categoryRoot.className = 'pokedex-category gba-window hidden';
  const categoryGrid = document.createElement('div');
  categoryGrid.className = 'pokedex-category-grid';
  categoryRoot.append(categoryGrid);

  const areaRoot = document.createElement('section');
  areaRoot.className = 'pokedex-area gba-window hidden';
  const areaMap = document.createElement('div');
  areaMap.className = 'pokedex-area-map';
  areaRoot.append(areaMap);

  root.append(title, description, seenOwned, topMenuRoot, orderedListRoot, entryRoot, categoryRoot, areaRoot);

  return {
    root,
    title,
    description,
    seenOwned,
    topMenuRoot,
    topMenuList,
    orderedListRoot,
    orderedListList,
    entryRoot,
    entrySpecies,
    entryPage,
    categoryRoot,
    categoryGrid,
    areaRoot,
    areaMap
  };
};

export const updatePokedexView = (
  bindings: PokedexViewBindings,
  panel: PokedexPanelState | null
): void => {
  if (!panel) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');
  bindings.title.textContent = panel.title;
  bindings.description.textContent = panel.description;
  bindings.seenOwned.textContent = `SEEN: ${panel.seen}  OWNED: ${panel.owned}`;

  bindings.topMenuRoot.classList.toggle('hidden', panel.screen !== 'topMenu');
  bindings.orderedListRoot.classList.toggle('hidden', panel.screen !== 'orderedList');
  bindings.entryRoot.classList.toggle('hidden', panel.screen !== 'entry');
  bindings.categoryRoot.classList.toggle('hidden', panel.screen !== 'categoryPage');
  bindings.areaRoot.classList.toggle('hidden', panel.screen !== 'area');

  if (panel.screen === 'topMenu') {
    bindings.topMenuList.innerHTML = '';
    panel.topMenuRows.forEach((row, index) => {
      const item = document.createElement('li');
      item.className = 'pokedex-top-menu-row';
      item.classList.toggle('pokedex-top-menu-header', row.kind === 'header');
      item.classList.toggle('pokedex-top-menu-selected', index === panel.topMenuSelectedIndex);
      item.classList.toggle('pokedex-top-menu-disabled', row.kind === 'item' && !row.enabled);

      const cursor = document.createElement('span');
      cursor.className = 'pokedex-row-cursor';
      cursor.textContent = index === panel.topMenuSelectedIndex && row.kind === 'item' ? '▶' : '';

      const label = document.createElement('span');
      label.className = 'pokedex-row-label';
      label.textContent = row.label;

      item.append(cursor, label);
      bindings.topMenuList.append(item);
    });
  }

  if (panel.screen === 'orderedList') {
    bindings.orderedListList.innerHTML = '';
    const maxVisible = 9;
    const startIdx = Math.max(0, panel.orderSelectedIndex - Math.min(panel.orderListItemsAbove, maxVisible - 1));
    const endIdx = Math.min(panel.orderEntries.length, startIdx + maxVisible);

    for (let i = startIdx; i < endIdx; i += 1) {
      const entry = panel.orderEntries[i];
      const item = document.createElement('li');
      item.className = 'pokedex-ordered-entry';
      item.classList.toggle('pokedex-ordered-selected', i === panel.orderSelectedIndex);

      const cursor = document.createElement('span');
      cursor.className = 'pokedex-row-cursor';
      cursor.textContent = i === panel.orderSelectedIndex ? '▶' : '';

      const num = document.createElement('span');
      num.className = 'pokedex-entry-number';
      num.textContent = formatPokedexNumber(entry.nationalDexNumber);

      const name = document.createElement('span');
      name.className = 'pokedex-entry-name';
      name.textContent = entry.seen ? entry.label : '----------';
      name.classList.toggle('pokedex-entry-unseen', !entry.seen);

      const caughtMark = document.createElement('span');
      caughtMark.className = 'pokedex-entry-caught';
      caughtMark.textContent = entry.caught ? '●' : '';

      item.append(cursor, num, name, caughtMark);
      bindings.orderedListList.append(item);
    }
  }

  if (panel.screen === 'entry') {
    bindings.entrySpecies.textContent = panel.entrySpecies
      ? panel.entrySpecies.replace(/_/gu, ' ')
      : '';
    bindings.entryPage.textContent = `Page ${panel.entryPageIndex + 1}/2`;
  }

  if (panel.screen === 'categoryPage') {
    bindings.categoryGrid.innerHTML = '';
    panel.categorySpecies.forEach((species, index) => {
      const cell = document.createElement('div');
      cell.className = 'pokedex-category-cell';
      cell.classList.toggle('pokedex-category-selected', index === panel.categoryCursorIndex);
      cell.textContent = species.replace(/_/gu, ' ');
      bindings.categoryGrid.append(cell);
    });
  }

  if (panel.screen === 'area') {
    bindings.areaMap.innerHTML = '';
    panel.areaMarkers.forEach((marker) => {
      const dot = document.createElement('div');
      dot.className = `pokedex-area-marker pokedex-area-${marker.type}`;
      dot.style.left = `${marker.x}px`;
      dot.style.top = `${marker.y}px`;
      bindings.areaMap.append(dot);
    });
  }
};