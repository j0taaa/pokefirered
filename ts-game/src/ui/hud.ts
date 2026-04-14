import type { CameraState } from '../core/camera';
import type { DialogueState } from '../game/interaction';
import type { NpcState } from '../game/npc';
import type { PlayerState } from '../game/player';
import type { StartMenuState } from '../game/menu';
import type { BattleState } from '../game/battle';

export interface HudBindings {
  root: HTMLElement;
  fpsValue: HTMLElement;
  positionValue: HTMLElement;
  facingValue: HTMLElement;
  cameraValue: HTMLElement;
  npcValue: HTMLElement;
  dialogueValue: HTMLElement;
  scriptValue: HTMLElement;
  menuValue: HTMLElement;
  battleValue: HTMLElement;
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
    'Facing: <strong data-role="facing">down</strong><br/>',
    'Camera: <strong data-role="camera">0,0</strong><br/>',
    'NPCs: <strong data-role="npc">0</strong><br/>',
    'Dialog: <strong data-role="dialogue">(none)</strong><br/>',
    'Script: <strong data-role="script">(none)</strong><br/>',
    'Menu: <strong data-role="menu">closed</strong><br/>',
    'Battle: <strong data-role="battle">idle</strong>'
  ].join('');

  root.append(perfCard, stateCard);

  return {
    root,
    fpsValue: perfCard.querySelector('[data-role="fps"]') as HTMLElement,
    positionValue: stateCard.querySelector('[data-role="pos"]') as HTMLElement,
    facingValue: stateCard.querySelector('[data-role="facing"]') as HTMLElement,
    cameraValue: stateCard.querySelector('[data-role="camera"]') as HTMLElement,
    npcValue: stateCard.querySelector('[data-role="npc"]') as HTMLElement,
    dialogueValue: stateCard.querySelector('[data-role="dialogue"]') as HTMLElement,
    scriptValue: stateCard.querySelector('[data-role="script"]') as HTMLElement,
    menuValue: stateCard.querySelector('[data-role="menu"]') as HTMLElement,
    battleValue: stateCard.querySelector('[data-role="battle"]') as HTMLElement
  };
};

export const updateHud = (
  bindings: HudBindings,
  player: PlayerState,
  npcs: NpcState[],
  fps: number,
  camera: CameraState,
  dialogue: DialogueState,
  lastScriptId: string | null,
  startMenu: StartMenuState,
  battle: BattleState
): void => {
  bindings.fpsValue.textContent = fps.toFixed(0);
  bindings.positionValue.textContent = `${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}`;
  bindings.facingValue.textContent = player.facing;
  bindings.cameraValue.textContent = `${camera.x.toFixed(1)}, ${camera.y.toFixed(1)}`;
  bindings.npcValue.textContent = npcs.length.toString();
  bindings.dialogueValue.textContent = dialogue.active
    ? `${dialogue.speakerId ?? 'npc'}: ${dialogue.text}`
    : '(none)';
  bindings.scriptValue.textContent = lastScriptId ?? '(none)';
  bindings.menuValue.textContent = startMenu.active
    ? `${startMenu.options[startMenu.selectedIndex]?.label ?? 'UNKNOWN'} (${startMenu.selectedIndex + 1}/${startMenu.options.length})`
    : startMenu.panel
      ? `${startMenu.panel.title} panel`
      : 'closed';
  bindings.battleValue.textContent = battle.active
    ? `${battle.phase} (${battle.playerMon.hp}/${battle.playerMon.maxHp} vs ${battle.wildMon.hp}/${battle.wildMon.maxHp})`
    : 'idle';
};

