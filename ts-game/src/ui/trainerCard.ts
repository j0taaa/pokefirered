import type { PlayerMenuSummary } from '../game/menu';

export interface TrainerCardViewBindings {
  root: HTMLElement;
  nameElement: HTMLElement;
  moneyElement: HTMLElement;
  badgesElement: HTMLElement;
  timeElement: HTMLElement;
  savesElement: HTMLElement;
  locationElement: HTMLElement;
  profileRoot: HTMLElement;
  profileLines: HTMLElement;
  pageIndicator: HTMLElement;
}

const BADGE_NAMES = [
  'Boulder', 'Cascade', 'Thunder', 'Rainbow',
  'Soul', 'Marsh', 'Volcano', 'Earth'
];

const formatPlayTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

export const createTrainerCardView = (): TrainerCardViewBindings => {
  const root = document.createElement('section');
  root.className = 'trainer-card hidden';

  const nameElement = document.createElement('p');
  nameElement.className = 'trainer-card-name';

  const moneyElement = document.createElement('p');
  moneyElement.className = 'trainer-card-money';

  const badgesElement = document.createElement('p');
  badgesElement.className = 'trainer-card-badges';

  const timeElement = document.createElement('p');
  timeElement.className = 'trainer-card-time';

  const savesElement = document.createElement('p');
  savesElement.className = 'trainer-card-saves';

  const locationElement = document.createElement('p');
  locationElement.className = 'trainer-card-location';

  const profileRoot = document.createElement('section');
  profileRoot.className = 'trainer-card-profile hidden';

  const profileLines = document.createElement('div');
  profileLines.className = 'trainer-card-profile-lines';
  profileRoot.append(profileLines);

  const pageIndicator = document.createElement('p');
  pageIndicator.className = 'trainer-card-page-indicator';

  root.append(
    nameElement,
    moneyElement,
    badgesElement,
    timeElement,
    savesElement,
    locationElement,
    profileRoot,
    pageIndicator
  );

  return {
    root,
    nameElement,
    moneyElement,
    badgesElement,
    timeElement,
    savesElement,
    locationElement,
    profileRoot,
    profileLines,
    pageIndicator
  };
};

export const updateTrainerCardView = (
  bindings: TrainerCardViewBindings,
  summary: PlayerMenuSummary | null,
  pageIndex: 0 | 1 = 0
): void => {
  if (!summary) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');

  if (pageIndex === 0) {
    bindings.nameElement.textContent = `NAME     ${summary.name}`;
    bindings.moneyElement.textContent = `MONEY    $${summary.money}`;
    bindings.badgesElement.textContent = `BADGES   ${summary.badges}/${BADGE_NAMES.length}`;
    bindings.timeElement.textContent = `TIME     ${formatPlayTime(summary.playTimeMinutes)}`;
    bindings.savesElement.textContent = `SAVES    ${summary.saveCount}`;
    bindings.locationElement.textContent = `LOCATION ${summary.location}`;
    bindings.profileRoot.classList.add('hidden');
    bindings.pageIndicator.textContent = '1/2  A=FLIP';
  } else {
    bindings.nameElement.textContent = '';
    bindings.moneyElement.textContent = '';
    bindings.badgesElement.textContent = '';
    bindings.timeElement.textContent = '';
    bindings.savesElement.textContent = '';
    bindings.locationElement.textContent = '';
    bindings.profileRoot.classList.remove('hidden');
    bindings.profileLines.innerHTML = '';
    (summary.profileLines ?? []).forEach((line) => {
      const lineEl = document.createElement('p');
      lineEl.className = 'trainer-card-profile-line';
      lineEl.textContent = line;
      bindings.profileLines.append(lineEl);
    });
    bindings.pageIndicator.textContent = '2/2  B=BACK';
  }
};