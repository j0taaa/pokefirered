import type { PartyPanelState } from '../game/menu';

export interface PartyMenuViewBindings {
  root: HTMLElement;
  title: HTMLElement;
  listRoot: HTMLElement;
  description: HTMLElement;
  actionRoot: HTMLElement;
  actionList: HTMLElement;
  summaryRoot: HTMLElement;
  summaryLines: HTMLElement;
  messageRoot: HTMLElement;
  messageText: HTMLElement;
}

const statusLabel = (status: string): string => {
  switch (status) {
    case 'OK':
    case 'none':
    case 'ok':
      return '';
    case 'poison':
    case 'PSN':
      return 'PSN';
    case 'paralysis':
    case 'PAR':
      return 'PAR';
    case 'sleep':
    case 'SLP':
      return 'SLP';
    case 'burn':
    case 'BRN':
      return 'BRN';
    case 'freeze':
    case 'FRZ':
      return 'FRZ';
    default:
      return status;
  }
};

const hpBar = (current: number, max: number): string => {
  if (max <= 0) {
    return '----------';
  }
  const filled = Math.round((current / max) * 10);
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, 10 - filled));
};

export const createPartyMenuView = (): PartyMenuViewBindings => {
  const root = document.createElement('section');
  root.className = 'party-menu hidden';

  const title = document.createElement('h3');
  title.className = 'party-menu-title';

  const listRoot = document.createElement('ul');
  listRoot.className = 'party-list';

  const description = document.createElement('p');
  description.className = 'party-description';

  const actionRoot = document.createElement('section');
  actionRoot.className = 'party-actions gba-window hidden';

  const actionList = document.createElement('ul');
  actionList.className = 'party-action-list';
  actionRoot.append(actionList);

  const summaryRoot = document.createElement('section');
  summaryRoot.className = 'party-summary gba-window hidden';

  const summaryLines = document.createElement('div');
  summaryLines.className = 'party-summary-lines';
  summaryRoot.append(summaryLines);

  const messageRoot = document.createElement('section');
  messageRoot.className = 'party-message gba-window hidden';

  const messageText = document.createElement('p');
  messageText.className = 'party-message-text';
  messageRoot.append(messageText);

  root.append(title, listRoot, description, actionRoot, summaryRoot, messageRoot);

  return {
    root,
    title,
    listRoot,
    description,
    actionRoot,
    actionList,
    summaryRoot,
    summaryLines,
    messageRoot,
    messageText
  };
};

export const updatePartyMenuView = (
  bindings: PartyMenuViewBindings,
  panel: PartyPanelState | null
): void => {
  if (!panel) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');
  bindings.title.textContent = panel.title;
  bindings.description.textContent = panel.description;

  bindings.listRoot.innerHTML = '';
  for (let slot = 0; slot < panel.rows.length; slot += 1) {
    const row = panel.rows[slot];
    const member = panel.members[slot];
    const item = document.createElement('li');
    item.className = 'party-row';
    item.classList.toggle('party-row-selected', slot === panel.selectedIndex);
    item.classList.toggle('party-row-empty', !member);

    const cursor = document.createElement('span');
    cursor.className = 'party-row-cursor';
    cursor.textContent = slot === panel.selectedIndex ? '▶' : '';

    const label = document.createElement('span');
    label.className = 'party-row-label';
    label.textContent = row;

    if (member) {
      const hpInfo = document.createElement('span');
      hpInfo.className = 'party-row-hp';
      hpInfo.textContent = `${hpBar(member.hp, member.maxHp)} ${member.hp}/${member.maxHp}`;

      const statusBadge = document.createElement('span');
      statusBadge.className = 'party-row-status';
      const sl = statusLabel(member.status);
      statusBadge.textContent = sl;
      statusBadge.classList.toggle('party-row-status-afflicted', sl !== '');

      item.append(cursor, label, hpInfo, statusBadge);
    } else {
      item.append(cursor, label);
    }

    bindings.listRoot.append(item);
  }

  const hasActions = panel.mode === 'actions';
  bindings.actionRoot.classList.toggle('hidden', !hasActions);
  bindings.actionList.innerHTML = '';
  if (hasActions) {
    panel.actionRows.forEach((action, index) => {
      const row = document.createElement('li');
      row.className = 'party-action-row';
      row.textContent = `${index === panel.actionIndex ? '▶ ' : '  '}${action}`;
      bindings.actionList.append(row);
    });
  }

  const hasSummary = panel.mode === 'summary';
  bindings.summaryRoot.classList.toggle('hidden', !hasSummary);
  bindings.summaryLines.innerHTML = '';
  if (hasSummary) {
    panel.summaryLines.forEach((line) => {
      const lineEl = document.createElement('p');
      lineEl.className = 'party-summary-line';
      lineEl.textContent = line;
      bindings.summaryLines.append(lineEl);
    });
  }

  bindings.messageRoot.classList.toggle('hidden', !panel.description);
  bindings.messageText.textContent = panel.description;
};