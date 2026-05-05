import type { GameRuntimeState, GameSession } from '../core/gameSession';
import { getCollisionTilePosition } from '../world/tileMap';
import { getMapSectionDisplayName } from '../game/decompSaveMenuUtil';
import type { StartMenuState } from '../game/menu';
import type { BattleState } from '../game/battle';

const SUMMARY_MAX_LENGTH = 80;

const sentence = (value: string): string => {
  const trimmed = value.replace(/\s+/gu, ' ').trim();
  return trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?') ? trimmed : `${trimmed}.`;
};

const truncateSummary = (value: string): string => {
  const normalized = sentence(value);
  if (normalized.length <= SUMMARY_MAX_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, SUMMARY_MAX_LENGTH - 1).trimEnd()}…`;
};

const locationName = (state: GameRuntimeState): string =>
  getMapSectionDisplayName(state.map.regionMapSection) || state.map.id;

const playerTile = (state: GameRuntimeState): { x: number; y: number } =>
  getCollisionTilePosition(state.player.position, state.map.tileSize);

const visibleNpcs = (state: GameRuntimeState) =>
  state.npcs
    .filter((npc) => npc.active !== false && npc.invisible !== true)
    .sort((left, right) => left.id.localeCompare(right.id));

const nearbyNpcs = (state: GameRuntimeState) => {
  const tile = playerTile(state);
  return visibleNpcs(state)
    .map((npc) => ({
      npc,
      tile: npc.currentTile ?? getCollisionTilePosition(npc.position, state.map.tileSize)
    }))
    .filter(({ tile: npcTile }) => Math.abs(npcTile.x - tile.x) + Math.abs(npcTile.y - tile.y) <= 4)
    .sort((left, right) => {
      const leftDistance = Math.abs(left.tile.x - tile.x) + Math.abs(left.tile.y - tile.y);
      const rightDistance = Math.abs(right.tile.x - tile.x) + Math.abs(right.tile.y - tile.y);
      return leftDistance - rightDistance || left.npc.id.localeCompare(right.npc.id);
    });
};

const nearbyObjects = (state: GameRuntimeState): string[] => {
  const tile = playerTile(state);
  const hiddenItems = (state.map.hiddenItems ?? [])
    .filter((item) => Math.abs(item.x - tile.x) + Math.abs(item.y - tile.y) <= 3)
    .map((item) => item.item);
  const warps = state.map.warps
    .filter((warp) => Math.abs(warp.x - tile.x) + Math.abs(warp.y - tile.y) <= 2)
    .map((warp) => `warp to ${warp.destMap}`);
  const triggers = state.map.triggers
    .filter((trigger) => Math.abs(trigger.x - tile.x) + Math.abs(trigger.y - tile.y) <= 2)
    .map((trigger) => trigger.activation === 'interact' ? 'interactive spot' : 'step trigger');
  return [...hiddenItems, ...warps, ...triggers].sort((left, right) => left.localeCompare(right));
};

const menuTitle = (menu: StartMenuState): string => {
  if (menu.panel) {
    return menu.panel.title;
  }
  return 'MENU';
};

const menuOptionCount = (menu: StartMenuState): number => {
  if (!menu.panel) {
    return menu.options.length;
  }
  const panel = menu.panel;
  if ('rows' in panel) {
    return panel.rows.length;
  }
  return 0;
};

const battleType = (battle: BattleState): string => {
  if (battle.battleTypeFlags.includes('trainer') || battle.mode === 'trainer') {
    return 'trainer battle';
  }
  if (battle.mode === 'safari') {
    return 'Safari battle';
  }
  return 'wild battle';
};

const activeBattlePokemon = (battle: BattleState) => ({
  player: battle.playerSide.party[battle.playerSide.activePartyIndexes[0] ?? 0] ?? battle.playerMon,
  opponent: battle.opponentSide.party[battle.opponentSide.activePartyIndexes[0] ?? 0] ?? battle.wildMon
});

export class DescriptionBuilder {
  buildSummary(session: GameSession): string {
    const state = session.getRuntimeState();

    if (state.battle.active) {
      const { player, opponent } = activeBattlePokemon(state.battle);
      return truncateSummary(`${battleType(state.battle)}: ${player.species} faces ${opponent.species}`);
    }

    if (state.startMenu.active || state.startMenu.panel) {
      return truncateSummary(`${menuTitle(state.startMenu)} open with ${menuOptionCount(state.startMenu)} options`);
    }

    if (state.dialogue.active) {
      const speaker = state.dialogue.speakerId ?? 'Someone';
      return truncateSummary(`${speaker}: ${state.dialogue.text}`);
    }

    if (state.activeTrainerSee) {
      return truncateSummary(`Trainer ${state.activeTrainerSee.trainerId} spotted you`);
    }

    if (state.activeFieldAction) {
      return truncateSummary(`Field action in progress: ${state.activeFieldAction.kind}`);
    }

    const tile = playerTile(state);
    return truncateSummary(`${locationName(state)}, facing ${state.player.facing} at ${tile.x}, ${tile.y}`);
  }

  buildDetails(session: GameSession): string {
    const state = session.getRuntimeState();

    if (state.battle.active) {
      const { player, opponent } = activeBattlePokemon(state.battle);
      return sentence([
        `In a ${battleType(state.battle)} against ${state.battle.opponentSide.name}`,
        `${player.species} has ${player.hp}/${player.maxHp} HP and ${player.status === 'none' ? 'no status condition' : player.status}`,
        `${opponent.species} has ${opponent.hp}/${opponent.maxHp} HP`,
        `battle phase is ${state.battle.phase}`
      ].join('; '));
    }

    if (state.startMenu.active || state.startMenu.panel) {
      const title = menuTitle(state.startMenu);
      const count = menuOptionCount(state.startMenu);
      const selected = state.startMenu.panel
        ? state.startMenu.panel.description
        : state.startMenu.options[state.startMenu.selectedIndex]?.label ?? 'no selection';
      return sentence(`${title} is open with ${count} available options. Current selection/context: ${selected}`);
    }

    if (state.dialogue.active) {
      const speaker = state.dialogue.speakerId ?? 'Unknown speaker';
      const remaining = Math.max(0, state.dialogue.queue.length - state.dialogue.queueIndex - 1);
      return sentence(`${speaker} is speaking. Text: ${state.dialogue.text}. ${remaining} queued messages remain`);
    }

    if (state.activeTrainerSee) {
      return sentence(`Trainer ${state.activeTrainerSee.trainerId} noticed the player and is ${state.activeTrainerSee.phase} from the ${state.activeTrainerSee.direction}`);
    }

    if (state.activeFieldAction) {
      return sentence(`A ${state.activeFieldAction.kind} field action is animating toward ${state.activeFieldAction.direction}`);
    }

    const tile = playerTile(state);
    const npcs = nearbyNpcs(state).slice(0, 5).map(({ npc, tile: npcTile }) => `${npc.id} at ${npcTile.x},${npcTile.y}`);
    const objects = nearbyObjects(state).slice(0, 5);
    const npcText = npcs.length > 0 ? `Nearby people or Pokémon: ${npcs.join(', ')}` : 'No nearby NPCs are visible';
    const objectText = objects.length > 0 ? `Nearby objects: ${objects.join(', ')}` : 'No nearby objects are detected';

    return sentence(`You are in ${locationName(state)} on map ${state.map.id} at tile ${tile.x},${tile.y}, facing ${state.player.facing}. ${npcText}. ${objectText}`);
  }
}
