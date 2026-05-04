import type { SavePanelState } from '../game/menu';

export interface SaveMenuViewBindings {
  root: HTMLElement;
  title: HTMLElement;
  prompt: HTMLElement;
  description: HTMLElement;
  statsRoot: HTMLElement;
  statsList: HTMLElement;
  choiceRoot: HTMLElement;
  choiceList: HTMLElement;
  resultRoot: HTMLElement;
  resultText: HTMLElement;
}

export const createSaveMenuView = (): SaveMenuViewBindings => {
  const root = document.createElement('section');
  root.className = 'save-menu hidden';

  const title = document.createElement('h3');
  title.className = 'save-menu-title';

  const prompt = document.createElement('p');
  prompt.className = 'save-menu-prompt';

  const description = document.createElement('p');
  description.className = 'save-menu-description';

  const statsRoot = document.createElement('section');
  statsRoot.className = 'save-menu-stats gba-window';

  const statsList = document.createElement('ul');
  statsList.className = 'save-menu-stats-list';
  statsRoot.append(statsList);

  const choiceRoot = document.createElement('section');
  choiceRoot.className = 'save-menu-choice gba-window hidden';

  const choiceList = document.createElement('ul');
  choiceList.className = 'save-menu-choice-list';
  choiceRoot.append(choiceList);

  const resultRoot = document.createElement('section');
  resultRoot.className = 'save-menu-result gba-window hidden';

  const resultText = document.createElement('p');
  resultText.className = 'save-menu-result-text';
  resultRoot.append(resultText);

  root.append(title, prompt, description, statsRoot, choiceRoot, resultRoot);

  return {
    root,
    title,
    prompt,
    description,
    statsRoot,
    statsList,
    choiceRoot,
    choiceList,
    resultRoot,
    resultText
  };
};

export const updateSaveMenuView = (
  bindings: SaveMenuViewBindings,
  panel: SavePanelState | null
): void => {
  if (!panel) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');
  bindings.title.textContent = panel.title;
  bindings.prompt.textContent = panel.prompt;
  bindings.description.textContent = panel.description;

  bindings.statsList.innerHTML = '';
  panel.statsRows.forEach((row) => {
    const item = document.createElement('li');
    item.className = 'save-menu-stat-row';
    item.textContent = row;
    bindings.statsList.append(item);
  });

  const hasChoice = panel.stage === 'ask' || panel.stage === 'overwrite';
  bindings.choiceRoot.classList.toggle('hidden', !hasChoice);
  bindings.choiceList.innerHTML = '';
  if (hasChoice) {
    const choices = panel.stage === 'ask'
      ? ['YES', 'NO']
      : ['YES', 'NO'];
    choices.forEach((choice, index) => {
      const item = document.createElement('li');
      item.className = 'save-menu-choice-row';
      item.textContent = `${index === panel.selectedIndex ? '▶ ' : '  '}${choice}`;
      bindings.choiceList.append(item);
    });
  }

  const hasResult = panel.stage === 'result';
  bindings.resultRoot.classList.toggle('hidden', !hasResult);
  bindings.resultText.textContent = panel.description;
};