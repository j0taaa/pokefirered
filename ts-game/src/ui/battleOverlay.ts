import { getBattleBagChoices, type BattleState } from '../game/battle';
import { getBagQuantity, type BagState } from '../game/bag';

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

export const updateBattleOverlay = (
  bindings: BattleOverlayBindings,
  battle: BattleState,
  bag?: BagState
): void => {
  if (!battle.active) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');
  bindings.title.textContent = `Wild ${battle.wildMon.species}`;
  bindings.status.textContent = `${battle.turnSummary}  HP ${battle.playerMon.hp}/${battle.playerMon.maxHp} · Foe ${battle.wildMon.hp}/${battle.wildMon.maxHp}`;

  bindings.moveList.innerHTML = '';
  if (battle.phase === 'command') {
    battle.commands.forEach((command, index) => {
      const entry = document.createElement('li');
      entry.textContent = `${index === battle.selectedCommandIndex ? '▶' : ' '} ${command.toUpperCase()}`;
      entry.className = index === battle.selectedCommandIndex ? 'battle-move-selected' : '';
      bindings.moveList.append(entry);
    });
  } else if (battle.phase === 'partySelect') {
    battle.party.forEach((member, index) => {
      const hpInfo = member.hp > 0 ? `HP ${member.hp}/${member.maxHp}` : 'FNT';
      const activeMarker = member === battle.playerMon ? ' (IN)' : '';
      const entry = document.createElement('li');
      entry.textContent = `${index === battle.selectedPartyIndex ? '▶' : ' '} ${member.species} ${hpInfo}${activeMarker}`;
      entry.className = index === battle.selectedPartyIndex ? 'battle-move-selected' : '';
      bindings.moveList.append(entry);
    });
  } else if (battle.phase === 'bagSelect') {
    getBattleBagChoices(battle, bag).forEach((choice, index) => {
      const suffix = choice.quantity === null ? '' : ` x${choice.quantity}`;
      const entry = document.createElement('li');
      entry.textContent = `${index === battle.selectedBagIndex ? '▶' : ' '} ${choice.label}${suffix}`;
      entry.className = index === battle.selectedBagIndex ? 'battle-move-selected' : '';
      bindings.moveList.append(entry);
    });
  } else {
    battle.moves.forEach((move, index) => {
      const entry = document.createElement('li');
      entry.textContent = `${index === battle.selectedMoveIndex ? '▶' : ' '} ${move.name} (PWR ${move.power})`;
      entry.className = index === battle.selectedMoveIndex ? 'battle-move-selected' : '';
      bindings.moveList.append(entry);
    });
  }

  if (battle.damagePreview) {
    bindings.preview.textContent = `Damage preview: ${battle.damagePreview.min}-${battle.damagePreview.max}`;
  } else {
    bindings.preview.textContent = '';
  }

  if (battle.phase === 'intro') {
    bindings.hint.textContent = 'Z/Enter: Continue';
  } else if (battle.phase === 'resolved') {
    bindings.hint.textContent = 'Z/Enter/X/Esc: Return to field';
  } else if (battle.phase === 'command') {
    const pokeBallCount = bag ? getBagQuantity(bag, 'ITEM_POKE_BALL') : battle.bag.pokeBalls;
    const greatBallCount = bag ? getBagQuantity(bag, 'ITEM_GREAT_BALL') : battle.bag.greatBalls;
    bindings.hint.textContent = `Z/Enter: Confirm · ↑/↓: Choose command · Balls ${pokeBallCount}/${greatBallCount}`;
  } else if (battle.phase === 'partySelect') {
    bindings.hint.textContent = 'Z/Enter: Switch · X/Esc: Back';
  } else if (battle.phase === 'bagSelect') {
    bindings.hint.textContent = 'Z/Enter: Throw ball · X/Esc: Back';
  } else {
    bindings.hint.textContent = 'Z/Enter: Use move · X/Esc: Back';
  }
};
