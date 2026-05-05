import type { GameRuntimeState, GameSession } from '../core/gameSession';
import { getBattleBagChoices, type BattleCommand } from '../game/battle';
import { getItemDefinition } from '../game/bag';
import { canFish } from '../game/decompFishing';
import { checkPartyMove, getPartySizeConstant } from '../game/decompFldEffStrength';
import { MetatileBehavior_IsSurfable, MetatileBehavior_IsWaterfall } from '../game/fieldCollision';
import { isNpcVisible, type NpcState } from '../game/npc';
import type { PlayerState } from '../game/player';
import type { ScriptRuntimeState } from '../game/scripts';
import type { TriggerZone } from '../world/mapSource';
import { getCollisionTilePosition, getTileIndex, MapGridGetMetatileBehaviorAt, type TileMap } from '../world/tileMap';
import { determineTextApiMode } from './stateObserver';
import type { TextApiAction, TextApiMode, TextApiOption } from './textApiTypes';

type Direction = 'north' | 'south' | 'west' | 'east';
type Facing = PlayerState['facing'];

type VersionedGameSession = GameSession & { readonly version?: number };

const RAW_CONTROL_PATTERN = /(^|[^a-z0-9])(a|b|start|select|up|down|left|right|button|key)(?=$|[^a-z0-9])/iu;

const DIRECTION_LABELS: Record<Direction, string> = {
  north: 'north',
  south: 'south',
  west: 'west',
  east: 'east'
};

const MB_COUNTER = 0x80;
const SIGN_BEHAVIORS = new Set([0x84, 0x87, 0x88, 0x91, 0x92]);
const OBJECT_BEHAVIORS = new Set([
  0x81, 0x82, 0x83, 0x85, 0x86, 0x89, 0x8a, 0x8b, 0x8c, 0x8d, 0x8e, 0x8f,
  0x90, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b, 0x9e, 0x9f,
  0xa0, 0xa1, 0xa2, 0xa3
]);
const ROD_ITEMS = ['ITEM_OLD_ROD', 'ITEM_GOOD_ROD', 'ITEM_SUPER_ROD'] as const;

const safePublicText = (value: string, fallback: string): string => {
  const normalized = value.replace(/\s+/gu, ' ').trim();
  if (!normalized || RAW_CONTROL_PATTERN.test(normalized)) {
    return fallback;
  }
  return normalized;
};

const lowerStable = (value: string): string =>
  value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '') || 'option';

const versionOf = (session: GameSession): number => (session as VersionedGameSession).version ?? 0;

const commandLabel = (command: BattleCommand): string => {
  switch (command) {
    case 'fight':
      return 'Fight';
    case 'bag':
      return 'Open Bag';
    case 'pokemon':
      return 'Open Pokémon party';
    case 'run':
      return 'Try to flee';
    case 'safariBall':
      return 'Throw Safari Ball';
    case 'safariBait':
      return 'Throw bait';
    case 'safariRock':
      return 'Throw rock';
  }
};

const commandDescription = (command: BattleCommand): string => {
  switch (command) {
    case 'fight':
      return 'Choose one of your Pokémon moves.';
    case 'bag':
      return 'Choose battle-usable inventory from the Bag.';
    case 'pokemon':
      return 'Review the party and choose Pokémon.';
    case 'run':
      return 'Attempt to leave this battle.';
    case 'safariBall':
      return 'Use one Safari Ball to try catching the wild Pokémon.';
    case 'safariBait':
      return 'Offer bait to affect the wild Pokémon.';
    case 'safariRock':
      return 'Throw one rock to affect the wild Pokémon.';
  }
};

const battleCommandActionType = (command: BattleCommand): string => {
  switch (command) {
    case 'run':
      return 'flee';
    case 'safariBall':
      return 'safariBall';
    case 'safariBait':
      return 'safariBait';
    case 'safariRock':
      return 'safariRock';
    default:
      return command;
  }
};

const optionId = (version: number, mode: TextApiMode, parts: readonly string[]): string =>
  [`v${version}`, mode, ...parts.map(lowerStable)].join(':');

const makeOption = ({
  version,
  mode,
  idParts,
  label,
  description,
  category,
  enabled = true,
  disabledReason,
  action
}: {
  readonly version: number;
  readonly mode: TextApiMode;
  readonly idParts: readonly string[];
  readonly label: string;
  readonly description: string;
  readonly category: string;
  readonly enabled?: boolean;
  readonly disabledReason?: string;
  readonly action: TextApiAction;
}): TextApiOption => ({
  id: optionId(version, mode, idParts),
  label,
  description,
  category,
  enabled,
  ...(enabled ? {} : { disabledReason: disabledReason ?? 'This option is not available right now.' }),
  action
});

const indexedRows = (rows: readonly string[] | undefined): readonly string[] => rows ?? [];

const facingVector = (facing: Facing): { readonly x: number; readonly y: number } => {
  switch (facing) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
  }
};

const tileAheadOfPlayer = (player: PlayerState, map: TileMap): { readonly x: number; readonly y: number } => {
  const playerTile = player.currentTile ?? getCollisionTilePosition(player.position, map.tileSize);
  const direction = facingVector(player.facing);
  return { x: playerTile.x + direction.x, y: playerTile.y + direction.y };
};

const playerTile = (player: PlayerState, map: TileMap): { readonly x: number; readonly y: number } =>
  player.currentTile ?? getCollisionTilePosition(player.position, map.tileSize);

const tileElevation = (map: TileMap, x: number, y: number): number | null => {
  const index = getTileIndex(map, x, y);
  if (!map.elevations || index === null) {
    return null;
  }
  return map.elevations[index] ?? null;
};

const interactionElevation = (state: GameRuntimeState): number => {
  const tile = playerTile(state.player, state.map);
  const currentTileElevation = tileElevation(state.map, tile.x, tile.y);
  if (currentTileElevation === null) {
    return state.player.currentElevation ?? 0;
  }
  return currentTileElevation !== 0 ? (state.player.currentElevation ?? 0) : 0;
};

const elevationMatches = (candidateElevation: number | undefined, elevation: number): boolean => {
  const normalized = candidateElevation ?? 0;
  return normalized === 0 || normalized === elevation;
};

const optionLabelFromId = (value: string): string =>
  value
    .replace(/^npc-/u, '')
    .replace(/^ITEM_/u, '')
    .replace(/[_-]+/gu, ' ')
    .replace(/\b\w/gu, (letter) => letter.toUpperCase());

const hasPartyMove = (runtime: ScriptRuntimeState, moveToken: string): boolean =>
  checkPartyMove(runtime, moveToken) !== getPartySizeConstant();

const bagHasItem = (runtime: ScriptRuntimeState, itemId: string): boolean =>
  Object.values(runtime.bag.pockets).some((slots) => slots.some((slot) => slot.itemId === itemId && slot.quantity > 0));

const bestRodItem = (runtime: ScriptRuntimeState): string | null => {
  for (const itemId of [...ROD_ITEMS].reverse()) {
    if (bagHasItem(runtime, itemId)) {
      return itemId;
    }
  }
  return null;
};

const conditionsMatch = (trigger: TriggerZone, runtime: ScriptRuntimeState): boolean => {
  if (trigger.conditionVar && (runtime.vars[trigger.conditionVar] ?? 0) !== trigger.conditionEquals) {
    return false;
  }
  if (trigger.once && runtime.consumedTriggerIds.has(trigger.id)) {
    return false;
  }
  return (trigger.conditions ?? []).every((condition) => {
    const varMatches = !condition.var || (() => {
      const current = runtime.vars[condition.var] ?? 0;
      const expected = condition.value ?? 0;
      switch (condition.op ?? 'eq') {
        case 'eq': return current === expected;
        case 'ne': return current !== expected;
        case 'gt': return current > expected;
        case 'gte': return current >= expected;
        case 'lt': return current < expected;
        case 'lte': return current <= expected;
      }
    })();
    const flagMatches = !condition.flag
      || runtime.flags.has(condition.flag) === (condition.flagState ?? true);
    return varMatches && flagMatches;
  });
};

const facingTrigger = (state: GameRuntimeState): TriggerZone | null => {
  const target = tileAheadOfPlayer(state.player, state.map);
  const elevation = interactionElevation(state);
  return state.map.triggers.find((trigger) =>
    trigger.activation === 'interact'
    && trigger.x === target.x
    && trigger.y === target.y
    && elevationMatches(trigger.elevation, elevation)
    && (trigger.facing === 'any' || trigger.facing === state.player.facing)
    && conditionsMatch(trigger, state.scriptRuntime)
  ) ?? null;
};

const npcTile = (npc: NpcState, map: TileMap): { readonly x: number; readonly y: number } =>
  npc.currentTile ?? getCollisionTilePosition(npc.position, map.tileSize);

const visibleNpcAtTile = (state: GameRuntimeState, x: number, y: number): NpcState | null =>
  state.npcs.find((npc) => {
    const tile = npcTile(npc, state.map);
    return tile.x === x && tile.y === y && isNpcVisible(npc, state.scriptRuntime.flags);
  }) ?? null;

const npcInFront = (state: GameRuntimeState): NpcState | null => {
  const target = tileAheadOfPlayer(state.player, state.map);
  const direct = visibleNpcAtTile(state, target.x, target.y);
  if (direct) {
    return direct;
  }
  if (MapGridGetMetatileBehaviorAt(state.map, target.x, target.y) !== MB_COUNTER) {
    return null;
  }
  const direction = facingVector(state.player.facing);
  return visibleNpcAtTile(state, target.x + direction.x, target.y + direction.y);
};

export class ActionEnumerator {
  enumerate(session: GameSession): TextApiOption[] {
    const state = session.getRuntimeState();
    const mode = determineTextApiMode(state);
    const version = versionOf(session);

    switch (mode) {
      case 'overworld':
        return this.enumerateOverworld(state, version, mode);
      case 'dialogue':
        return this.enumerateDialogue(state, version, mode);
      case 'menu':
        return this.enumerateMenu(state, version, mode);
      case 'battle':
        return this.enumerateBattle(state, version, mode);
      case 'transition':
        return [this.waitOption(version, mode, 'Transition animation is in progress.')];
      case 'fieldAction':
        return [
          this.waitOption(version, mode, 'Let the field action continue.'),
          makeOption({
            version,
            mode,
            idParts: ['cancel'],
            label: 'Cancel field action',
            description: 'Try to stop the current field action.',
            category: 'fieldAction',
            action: { type: 'cancel' }
          })
        ];
      case 'trainerSee':
        return [this.waitOption(version, mode, 'Trainer encounter is starting.')];
      case 'script':
        return [this.waitOption(version, mode, 'Game input is locked by running script logic.')];
      case 'saveLoad':
        return this.enumerateSaveLoad(state, version, mode);
      case 'resolvedBattle':
        return [
          makeOption({
            version,
            mode,
            idParts: ['continue'],
            label: 'Continue',
            description: 'Leave the completed battle result and return to the game.',
            category: 'battle',
            action: { type: 'continue' }
          })
        ];
    }
  }

  private enumerateOverworld(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const movement = (['north', 'south', 'west', 'east'] as const).map((direction) => makeOption({
      version,
      mode,
      idParts: ['move', direction],
      label: `Walk ${DIRECTION_LABELS[direction]}`,
      description: `Face ${DIRECTION_LABELS[direction]} and try to move one step.`,
      category: 'movement',
      action: { type: 'move', target: direction }
    }));

    return [
      ...movement,
      ...this.enumerateFieldInteractions(state, version, mode),
      makeOption({
        version,
        mode,
        idParts: ['interact'],
        label: 'Interact with what is ahead',
        description: 'Talk with someone or inspect the object in front of you.',
        category: 'interaction',
        action: { type: 'interact' }
      }),
      makeOption({
        version,
        mode,
        idParts: ['menu', 'open'],
        label: 'Open main menu',
        description: 'Open the game menu for party, Bag, save, and options.',
        category: 'menu',
        action: { type: 'openMenu' }
      })
    ];
  }

  private enumerateFieldInteractions(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const options: TextApiOption[] = [];
    const targetTile = tileAheadOfPlayer(state.player, state.map);
    const targetBehavior = MapGridGetMetatileBehaviorAt(state.map, targetTile.x, targetTile.y);
    const trigger = facingTrigger(state);
    const npc = npcInFront(state);

    if (npc) {
      const itemName = npc.itemId ? getItemDefinition(npc.itemId).name : null;
      if (npc.itemId) {
        options.push(makeOption({
          version,
          mode,
          idParts: ['pickup-item', npc.id, npc.itemId],
          label: `Pick up ${itemName ?? 'item'}`,
          description: `Collect the item ball in front of you${itemName ? ` containing ${itemName}` : ''}.`,
          category: 'interaction',
          action: { type: 'pick-up-item', target: npc.id, value: npc.itemId }
        }));
      } else {
        options.push(makeOption({
          version,
          mode,
          idParts: ['talk-to', npc.id],
          label: `Talk to ${safePublicText(optionLabelFromId(npc.id), 'person')}`,
          description: 'Face this nearby person and start their interaction.',
          category: 'interaction',
          action: { type: `talk-to-${npc.id}`, target: npc.id }
        }));
      }
    }

    const isSign = SIGN_BEHAVIORS.has(targetBehavior ?? -1)
      || (trigger !== null && /sign|indigo/iu.test(trigger.scriptId));
    if (isSign) {
      options.push(makeOption({
        version,
        mode,
        idParts: ['read-sign'],
        label: 'Read sign',
        description: 'Read the signpost or sign in front of you.',
        category: 'interaction',
        action: { type: 'read-sign' }
      }));
    }

    const isInspectableObject = !isSign && (OBJECT_BEHAVIORS.has(targetBehavior ?? -1) || trigger !== null);
    if (isInspectableObject) {
      options.push(makeOption({
        version,
        mode,
        idParts: ['inspect-object'],
        label: 'Inspect object',
        description: 'Inspect the object or fixture in front of you.',
        category: 'interaction',
        action: { type: 'inspect-object' }
      }));
    }

    const currentTile = playerTile(state.player, state.map);
    const hiddenItem = (state.map.hiddenItems ?? []).find((item) =>
      item.x === currentTile.x
      && item.y === currentTile.y
      && elevationMatches(item.elevation, state.player.currentElevation ?? 0)
      && !state.scriptRuntime.flags.has(item.flag)
    );
    if (hiddenItem) {
      options.push(makeOption({
        version,
        mode,
        idParts: ['hidden-item', hiddenItem.flag],
        label: 'Inspect hidden spot',
        description: 'Search this exact tile for a hidden item that has not been collected.',
        category: 'interaction',
        action: { type: 'inspect-object', target: 'hiddenItem', value: hiddenItem.flag }
      }));
    }

    options.push(...this.enumerateFieldMoves(state, version, mode, targetBehavior));
    return options;
  }

  private enumerateFieldMoves(
    state: GameRuntimeState,
    version: number,
    mode: TextApiMode,
    targetBehavior: number | null
  ): TextApiOption[] {
    const options: TextApiOption[] = [];
    const runtime = state.scriptRuntime;
    const facingSurfableWater = MetatileBehavior_IsSurfable(targetBehavior) && !MetatileBehavior_IsWaterfall(targetBehavior);
    if (facingSurfableWater) {
      const hasSurf = hasPartyMove(runtime, 'MOVE_SURF');
      const hasBadge = runtime.flags.has('FLAG_BADGE05_GET');
      options.push(makeOption({
        version,
        mode,
        idParts: ['use-surf'],
        label: 'Use Surf',
        description: 'Ask a Pokémon to carry you over the water ahead.',
        category: 'fieldMove',
        enabled: hasSurf && hasBadge,
        disabledReason: !hasSurf
          ? 'No Pokémon in your party knows Surf.'
          : !hasBadge
            ? 'Surf cannot be used until the Soul Badge is obtained.'
            : undefined,
        action: { type: 'use-surf' }
      }));
    }

    if (MetatileBehavior_IsWaterfall(targetBehavior)) {
      const hasWaterfall = hasPartyMove(runtime, 'MOVE_WATERFALL');
      const hasBadge = runtime.flags.has('FLAG_BADGE07_GET');
      const positioned = state.player.avatarMode === 'surfing' && state.player.facing === 'up';
      options.push(makeOption({
        version,
        mode,
        idParts: ['use-waterfall'],
        label: 'Use Waterfall',
        description: 'Ask a Pokémon to climb the waterfall ahead.',
        category: 'fieldMove',
        enabled: hasWaterfall && hasBadge && positioned,
        disabledReason: !hasWaterfall
          ? 'No Pokémon in your party knows Waterfall.'
          : !hasBadge
            ? 'Waterfall cannot be used until the Volcano Badge is obtained.'
            : !positioned
              ? 'Waterfall can only be used while surfing north into a waterfall.'
              : undefined,
        action: { type: 'use-waterfall' }
      }));
    }

    if (canFish(state.player, state.map)) {
      const rodItem = bestRodItem(runtime);
      const rodName = rodItem ? getItemDefinition(rodItem).name : 'Fishing rod';
      options.push(makeOption({
        version,
        mode,
        idParts: ['fish', rodItem ?? 'no-rod'],
        label: rodItem ? `Fish with ${rodName}` : 'Fish',
        description: 'Use a fishing rod on the water ahead.',
        category: 'fieldMove',
        enabled: rodItem !== null,
        disabledReason: rodItem === null ? 'No fishing rod is available in the Bag.' : undefined,
        action: { type: 'fish', value: rodItem ?? null }
      }));
    }

    return options;
  }

  private enumerateDialogue(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const choice = state.dialogue.choice;
    if (choice && choice.options.length > 0) {
      const options = choice.options.map((rawLabel, index) => {
        const safeLabel = safePublicText(rawLabel, `choice ${index + 1}`);
        return makeOption({
          version,
          mode,
          idParts: ['dialogue-choice', `${index}`, safeLabel],
          label: `Choose ${safeLabel}`,
          description: `Choose ${choice.kind} option ${index + 1}.`,
          category: 'dialogue',
          action: { type: `dialogue-choice-${index}`, target: 'dialogue', value: index }
        });
      });

      if (!choice.ignoreCancel) {
        options.push(makeOption({
          version,
          mode,
            idParts: ['dialogue-cancel'],
            label: 'Cancel dialogue choice',
            description: 'Leave this choice without choosing one listed answer.',
            category: 'dialogue',
            action: { type: 'dialogue-cancel', target: 'dialogue' }
          }));
      }

      return options;
    }

    return [
      makeOption({
        version,
        mode,
        idParts: ['continue'],
        label: 'Continue dialogue',
        description: 'Advance to the next line or close this message.',
        category: 'dialogue',
        action: { type: 'dialogue-continue', target: 'dialogue' }
      })
    ];
  }

  private enumerateMenu(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const panel = state.startMenu.panel;
    if (!panel) {
      return [
        ...state.startMenu.options.map((entry, index) => {
          const safeLabel = safePublicText(entry.label, `menu item ${index + 1}`);
          return makeOption({
            version,
            mode,
            idParts: ['menu', `${index}`, entry.id],
            label: `Choose ${safeLabel}`,
            description: `Open or activate ${safeLabel}.`,
            category: 'menu',
            action: { type: 'choose', target: 'menu', value: index }
          });
        }),
        makeOption({
          version,
          mode,
          idParts: ['menu', 'back'],
          label: 'Close menu',
          description: 'Return to the field.',
          category: 'menu',
          action: { type: 'back', target: 'menu' }
        })
      ];
    }

    if (panel.kind === 'save') {
      return this.enumerateSaveLoad(state, version, 'saveLoad');
    }

    const rows = 'rows' in panel ? indexedRows(panel.rows) : [];
    const rowOptions = rows.map((rawRow, index) => {
      const safeLabel = safePublicText(rawRow, `menu row ${index + 1}`);
      return makeOption({
        version,
        mode,
        idParts: ['panel', panel.kind, `${index}`],
        label: `Choose ${safeLabel}`,
        description: `Choose row ${index + 1} in ${safePublicText(panel.title, 'this panel')}.`,
        category: 'menu',
        action: { type: 'choose', target: 'panel', value: index }
      });
    });

    return [
      ...rowOptions,
      makeOption({
        version,
        mode,
        idParts: ['panel', panel.kind, 'back'],
        label: 'Go back',
        description: 'Return to the previous menu.',
        category: 'menu',
        action: { type: 'back', target: 'panel' }
      })
    ];
  }

  private enumerateBattle(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const battle = state.battle;
    const inCommandPhase = battle.phase === 'command';
    const commands = battle.commands.length > 0 ? battle.commands : (['fight', 'bag', 'pokemon', 'run'] as BattleCommand[]);

    return commands.map((command, index) => {
      let enabled = inCommandPhase;
      let disabledReason = inCommandPhase ? undefined : 'Battle commands are unavailable while the battle is resolving.';
      if (enabled && command === 'bag' && !getBattleBagChoices(battle, state.scriptRuntime.bag).some((choice) => !choice.isExit)) {
        enabled = false;
        disabledReason = 'No battle-usable items are available.';
      }
      const party = battle.party ?? battle.playerSide.party ?? [];
      if (enabled && command === 'pokemon' && party.filter((pokemon) => pokemon.hp > 0).length <= 1) {
        enabled = false;
        disabledReason = 'No other able Pokémon can switch in.';
      }
      if (enabled && command === 'run' && (battle.mode === 'trainer' || battle.battleTypeFlags.includes('trainer'))) {
        enabled = false;
        disabledReason = 'You cannot flee trainer battles.';
      }

      return makeOption({
        version,
        mode,
        idParts: ['battle', `${index}`, battleCommandActionType(command)],
        label: commandLabel(command),
        description: commandDescription(command),
        category: 'battle',
        enabled,
        disabledReason,
        action: { type: battleCommandActionType(command), target: 'battleCommand', value: index }
      });
    });
  }

  private enumerateSaveLoad(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const panel = state.startMenu.panel?.kind === 'save' ? state.startMenu.panel : null;
    const resultStage = panel?.stage === 'result';
    if (resultStage) {
      return [
        makeOption({
          version,
          mode,
          idParts: ['save', 'continue'],
          label: 'Continue',
          description: 'Close the save result message.',
          category: 'saveLoad',
          action: { type: 'continue', target: 'saveLoad' }
        })
      ];
    }

    return [
      makeOption({
        version,
        mode,
        idParts: ['save', 'confirm'],
        label: 'Confirm save',
        description: 'Confirm the current save prompt.',
        category: 'saveLoad',
        action: { type: 'confirm', target: 'saveLoad' }
      }),
      makeOption({
        version,
        mode,
        idParts: ['save', 'cancel'],
        label: 'Cancel save',
        description: 'Leave the save prompt without saving.',
        category: 'saveLoad',
        action: { type: 'cancel', target: 'saveLoad' }
      })
    ];
  }

  private waitOption(version: number, mode: TextApiMode, description: string): TextApiOption {
    return makeOption({
      version,
      mode,
      idParts: ['wait'],
      label: 'Wait',
      description,
      category: 'system',
      action: { type: 'wait' }
    });
  }
}
