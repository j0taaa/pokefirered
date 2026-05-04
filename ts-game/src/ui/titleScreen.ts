import type { TitleScreenState } from '../game/titleScreen';
import { getTitleMenuOptions } from '../game/titleScreen';

export interface TitleScreenViewBindings {
  root: HTMLElement;
  menuRoot: HTMLElement;
  menuList: HTMLElement;
  introOverlay: HTMLElement;
  creditsOverlay: HTMLElement;
  creditsContent: HTMLElement;
}

const CREDITS_LINES = [
  'PROGRAM DIRECTOR',
  'Satoshi Tajiri',
  '',
  'ART DIRECTOR',
  'Ken Sugimori',
  '',
  'GAME DESIGN',
  'Satoshi Tajiri',
  '',
  'MUSIC',
  'Junichi Masuda',
  '',
  'PROGRAMMING',
  'Takenori Ohta',
  '',
  'GRAPHIC DESIGN',
  'Ken Sugimori',
  '',
  'MAP DESIGN',
  'Satoshi Tajiri',
  '',
  'POKéMON FIRE RED',
  'and LEAF GREEN',
  '',
  'Thank you for playing!'
];

export const createTitleScreenView = (): TitleScreenViewBindings => {
  const root = document.createElement('section');
  root.className = 'title-screen hidden';

  const menuRoot = document.createElement('section');
  menuRoot.className = 'title-menu gba-window hidden';

  const menuList = document.createElement('ul');
  menuList.className = 'title-menu-list';
  menuRoot.append(menuList);

  const introOverlay = document.createElement('div');
  introOverlay.className = 'title-intro-overlay hidden';

  const creditsOverlay = document.createElement('div');
  creditsOverlay.className = 'title-credits-overlay hidden';

  const creditsContent = document.createElement('div');
  creditsContent.className = 'title-credits-content';
  CREDITS_LINES.forEach((line) => {
    const el = document.createElement('p');
    el.className = line === '' ? 'title-credits-spacer' : 'title-credits-line';
    el.textContent = line;
    creditsContent.append(el);
  });
  creditsOverlay.append(creditsContent);

  root.append(menuRoot, introOverlay, creditsOverlay);

  return {
    root,
    menuRoot,
    menuList,
    introOverlay,
    creditsOverlay,
    creditsContent
  };
};

export const updateTitleScreenView = (
  bindings: TitleScreenViewBindings,
  state: TitleScreenState | null
): void => {
  if (!state) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');

  const isMenu = state.stage === 'title';
  bindings.menuRoot.classList.toggle('hidden', !isMenu);
  bindings.introOverlay.classList.toggle('hidden', state.stage !== 'intro');
  bindings.creditsOverlay.classList.toggle('hidden', state.stage !== 'credits');

  if (isMenu) {
    bindings.menuList.innerHTML = '';
    const options = getTitleMenuOptions(state);
    options.forEach((option, index) => {
      const item = document.createElement('li');
      item.className = 'title-menu-option';
      item.classList.toggle('title-menu-selected', index === state.selectedIndex);

      const cursor = document.createElement('span');
      cursor.className = 'title-menu-cursor';
      cursor.textContent = index === state.selectedIndex ? '▶' : '';

      const label = document.createElement('span');
      label.className = 'title-menu-label';
      label.textContent = option;

      item.append(cursor, label);
      bindings.menuList.append(item);
    });
  }

  if (state.stage === 'credits') {
    bindings.creditsContent.style.transform = `translateY(-${state.creditsScrollY}px)`;
  }
};