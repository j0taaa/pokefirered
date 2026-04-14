import type { PlayerState } from '../game/player';

export interface HudBindings {
  root: HTMLElement;
  fpsValue: HTMLElement;
  positionValue: HTMLElement;
  facingValue: HTMLElement;
}

export const createHud = (): HudBindings => {
  const root = document.createElement('section');
  root.className = 'hud';

  const perfCard = document.createElement('div');
  perfCard.className = 'card';
  perfCard.innerHTML = 'FPS: <strong data-role="fps">0</strong>';

  const stateCard = document.createElement('div');
  stateCard.className = 'card';
  stateCard.innerHTML = [
    'Pos: <strong data-role="pos">0,0</strong><br/>',
    'Facing: <strong data-role="facing">down</strong>'
  ].join('');

  root.append(perfCard, stateCard);

  return {
    root,
    fpsValue: perfCard.querySelector('[data-role="fps"]') as HTMLElement,
    positionValue: stateCard.querySelector('[data-role="pos"]') as HTMLElement,
    facingValue: stateCard.querySelector('[data-role="facing"]') as HTMLElement
  };
};

export const updateHud = (
  bindings: HudBindings,
  player: PlayerState,
  fps: number
): void => {
  bindings.fpsValue.textContent = fps.toFixed(0);
  bindings.positionValue.textContent = `${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}`;
  bindings.facingValue.textContent = player.facing;
};
