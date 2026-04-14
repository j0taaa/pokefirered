import type { BattleState } from '../game/battle';

export interface BattleOverlayBindings {
  root: HTMLElement;
  title: HTMLElement;
  status: HTMLElement;
  moveList: HTMLElement;
  preview: HTMLElement;
  hint: HTMLElement;
}

export const createBattleOverlay = (): BattleOverlayBindings => {
  const root = document.createElement('section');
  root.className = 'battle-overlay hidden';

  const title = document.createElement('h3');
  title.className = 'battle-title';

  const status = document.createElement('p');
  status.className = 'battle-status';

  const moveList = document.createElement('ul');
  moveList.className = 'battle-moves';

  const preview = document.createElement('p');
  preview.className = 'battle-preview';

  const hint = document.createElement('p');
  hint.className = 'battle-hint';
  hint.textContent = 'Z/Enter: Confirm · ↑/↓: Choose move';

  root.append(title, status, moveList, preview, hint);

  return { root, title, status, moveList, preview, hint };
};

export const updateBattleOverlay = (bindings: BattleOverlayBindings, battle: BattleState): void => {
  if (!battle.active) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');
  bindings.title.textContent = `Wild ${battle.wildMon.species}`;
  bindings.status.textContent = `${battle.turnSummary}  HP ${battle.playerMon.hp}/${battle.playerMon.maxHp} · Foe ${battle.wildMon.hp}/${battle.wildMon.maxHp}`;

  bindings.moveList.innerHTML = '';
  battle.moves.forEach((move, index) => {
    const entry = document.createElement('li');
    entry.textContent = `${index === battle.selectedMoveIndex ? '▶' : ' '} ${move.name} (PWR ${move.power})`;
    entry.className = index === battle.selectedMoveIndex ? 'battle-move-selected' : '';
    bindings.moveList.append(entry);
  });

  if (battle.damagePreview) {
    bindings.preview.textContent = `Damage preview: ${battle.damagePreview.min}-${battle.damagePreview.max}`;
  } else {
    bindings.preview.textContent = '';
  }

  if (battle.phase === 'intro') {
    bindings.hint.textContent = 'Z/Enter: Continue';
  } else if (battle.phase === 'resolved') {
    bindings.hint.textContent = 'Z/Enter/X/Esc: Return to field';
  } else {
    bindings.hint.textContent = 'Z/Enter: Confirm · ↑/↓: Choose move';
  }
};
