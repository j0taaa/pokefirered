import type { PokemonCenterState } from '../game/pokemonCenter';
import { isHealingAnimationActive, getHealingProgress } from '../game/pokemonCenter';

export interface PokemonCenterViewBindings {
  root: HTMLElement;
  nurseDialogue: HTMLElement;
  nurseText: HTMLElement;
  healingOverlay: HTMLElement;
  healingBar: HTMLElement;
  pcAccess: HTMLElement;
  pcText: HTMLElement;
}

export const createPokemonCenterView = (): PokemonCenterViewBindings => {
  const root = document.createElement('section');
  root.className = 'pokemon-center hidden';

  const nurseDialogue = document.createElement('section');
  nurseDialogue.className = 'pc-nurse-dialogue gba-window hidden';

  const nurseText = document.createElement('p');
  nurseText.className = 'pc-nurse-text';
  nurseDialogue.append(nurseText);

  const healingOverlay = document.createElement('div');
  healingOverlay.className = 'pc-healing-overlay hidden';

  const healingBar = document.createElement('div');
  healingBar.className = 'pc-healing-bar';
  healingOverlay.append(healingBar);

  const pcAccess = document.createElement('section');
  pcAccess.className = 'pc-access gba-window hidden';

  const pcText = document.createElement('p');
  pcText.className = 'pc-access-text';
  pcAccess.append(pcText);

  root.append(nurseDialogue, healingOverlay, pcAccess);

  return {
    root,
    nurseDialogue,
    nurseText,
    healingOverlay,
    healingBar,
    pcAccess,
    pcText
  };
};

export const updatePokemonCenterView = (
  bindings: PokemonCenterViewBindings,
  state: PokemonCenterState | null,
  dialogueText: string = ''
): void => {
  if (!state) {
    bindings.root.classList.add('hidden');
    return;
  }

  bindings.root.classList.remove('hidden');

  const isNurseActive = state.stage !== 'idle' && state.stage !== 'pcAccess';
  bindings.nurseDialogue.classList.toggle('hidden', !isNurseActive);
  bindings.nurseText.textContent = dialogueText;

  const isHealing = isHealingAnimationActive(state);
  bindings.healingOverlay.classList.toggle('hidden', !isHealing);
  if (isHealing) {
    const progress = getHealingProgress(state);
    bindings.healingBar.style.width = `${progress * 100}%`;
  }

  const isPcActive = state.pcActive;
  bindings.pcAccess.classList.toggle('hidden', !isPcActive);
  bindings.pcText.textContent = isPcActive ? 'Accessing the PC...' : '';
};