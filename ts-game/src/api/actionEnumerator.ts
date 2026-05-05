import type { GameRuntimeState, GameSession } from '../core/gameSession';
import { evaluateFieldCollision, getDirectionVector } from '../game/fieldCollision';
import { getBattleBagChoices, type BattleBagChoice, type BattleCommand, type BattleMove, type BattlePokemonSnapshot } from '../game/battle';
import {
  getBagListEntries,
  getBagPocketLabel,
  getBagVisibleRows,
  getItemDefinition,
  type BagContextActionId,
  type BagPocketId
} from '../game/bag';
import { getMoney } from '../game/decompMoney';
import { OBJ_EVENT_GFX_CUT_TREE } from '../game/decompFldEffCut';
import { OBJ_EVENT_GFX_ROCK_SMASH_ROCK } from '../game/decompFldEffRockSmash';
import { canFish } from '../game/decompFishing';
import { checkPartyMove, getPartySizeConstant, OBJ_EVENT_GFX_PUSHABLE_BOULDER } from '../game/decompFldEffStrength';
import { MetatileBehavior_IsSurfable, MetatileBehavior_IsWaterfall } from '../game/fieldCollision';
import { isNpcVisible, type NpcState } from '../game/npc';
import { getPlayerRuntimeObject } from '../game/player';
import { findWarpAtTile, MetatileBehavior_IsWarpDoor } from '../game/warps';
import type { PlayerState } from '../game/player';
import type { ScriptRuntimeState } from '../game/scripts';
import { getPcActionLabel, PC_ACTION_ORDER } from '../game/pcStorage';
import { getSpeciesDisplayName, type FieldPokemon } from '../game/pokemonStorage';
import type { TriggerZone } from '../world/mapSource';
import { loadMapById } from '../world/mapSource';
import { getCollisionTilePosition, getTileIndex, MapGridGetMetatileBehaviorAt, type TileDirection, type TileMap } from '../world/tileMap';
import { determineTextApiMode } from './stateObserver';
import type { TextApiAction, TextApiJsonValue, TextApiMode, TextApiOption } from './textApiTypes';

type Direction = 'north' | 'south' | 'west' | 'east';
type Facing = PlayerState['facing'];
type NavigationTargetKind = 'tile' | 'door' | 'warp' | 'npc' | 'sign';

type VersionedGameSession = GameSession & { readonly version?: number };

const RAW_CONTROL_PATTERN = /(^|[^a-z0-9])(a|b|start|select|up|down|left|right|button|key)(?=$|[^a-z0-9])/iu;

const DIRECTION_LABELS: Record<Direction, string> = {
  north: 'north',
  south: 'south',
  west: 'west',
  east: 'east'
};

const API_TO_TILE_DIRECTION: Record<Direction, TileDirection> = {
  north: 'up',
  south: 'down',
  west: 'left',
  east: 'right'
};

const TILE_TO_API_DIRECTION: Record<TileDirection, Direction> = {
  up: 'north',
  down: 'south',
  left: 'west',
  right: 'east'
};

const CITY_MAP_TYPES = new Set(['town', 'city', 'MAP_TYPE_TOWN', 'MAP_TYPE_CITY']);
const ROUTE_MAP_TYPES = new Set(['route', 'MAP_TYPE_ROUTE']);

const MB_COUNTER = 0x80;
const SIGN_BEHAVIORS = new Set([0x84, 0x87, 0x88, 0x91, 0x92]);
const OBJECT_BEHAVIORS = new Set([
  0x81, 0x82, 0x83, 0x85, 0x86, 0x89, 0x8a, 0x8b, 0x8c, 0x8d, 0x8e, 0x8f,
  0x90, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b, 0x9e, 0x9f,
  0xa0, 0xa1, 0xa2, 0xa3
]);
const ROD_ITEMS = ['ITEM_OLD_ROD', 'ITEM_GOOD_ROD', 'ITEM_SUPER_ROD'] as const;
const BAG_POCKET_ORDER: readonly BagPocketId[] = ['items', 'keyItems', 'pokeBalls', 'tmCase', 'berryPouch'];
const OPTION_SETTING_LABELS: Record<string, string> = {
  textSpeed: 'Text Speed',
  battleScene: 'Battle Scene',
  battleStyle: 'Battle Style',
  sound: 'Sound',
  buttonMode: 'Button Mode',
  frameType: 'Frame Type',
  cancel: 'Cancel'
};
const WATER_BEHAVIORS = new Set([0x10, 0x11, 0x12, 0x13, 0x15, 0x1a, 0x1b, 0x50, 0x51, 0x52, 0x53]);

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


const isTrainerBattle = (battle: GameRuntimeState['battle']): boolean =>
  battle.mode === 'trainer' || battle.battleTypeFlags.includes('trainer');

const isSafariBattle = (battle: GameRuntimeState['battle']): boolean =>
  battle.mode === 'safari' || battle.battleTypeFlags.includes('safari');

const formatPokemonType = (type: string): string =>
  type
    .replace(/^TYPE_/u, '')
    .toLowerCase()
    .replace(/\b\w/gu, (letter) => letter.toUpperCase());

const activePartyIndexes = (battle: GameRuntimeState['battle']): ReadonlySet<number> =>
  new Set(battle.playerSide.activePartyIndexes.length > 0 ? battle.playerSide.activePartyIndexes : [battle.party.indexOf(battle.playerMon)]);

const moveDisabledReason = (
  battle: GameRuntimeState['battle'],
  move: BattleMove
): string | undefined => {
  if (move.ppRemaining <= 0) {
    return 'No PP remaining.';
  }
  if (battle.playerMon.volatile.disableTurns > 0 && battle.playerMon.volatile.disabledMoveId === move.id) {
    return `${move.name} is disabled by a move effect.`;
  }
  if (battle.playerMon.volatile.tormented && battle.playerMon.volatile.lastMoveUsedId === move.id) {
    return `${battle.playerMon.species} cannot use the same move twice because of Torment.`;
  }
  if (battle.playerMon.volatile.tauntTurns > 0 && move.power === 0) {
    return `${move.name} is blocked by Taunt.`;
  }
  if (battle.wildMon.volatile.imprisoning && battle.wildMon.moves.some((opponentMove) => opponentMove.id === move.id)) {
    return `${move.name} is sealed by Imprison.`;
  }
  const heldItemId = battle.playerMon.heldItemId;
  const choicedMoveId = battle.playerMon.volatile.choicedMoveId;
  if (heldItemId && getItemDefinition(heldItemId).holdEffect === 'HOLD_EFFECT_CHOICE_BAND' && choicedMoveId && choicedMoveId !== move.id) {
    return `${battle.playerMon.species} can only use its chosen move.`;
  }
  return undefined;
};

const partyDisabledReason = (
  battle: GameRuntimeState['battle'],
  pokemon: BattlePokemonSnapshot,
  partyIndex: number
): string | undefined => {
  if (pokemon.hp <= 0) {
    return 'Fainted Pokémon cannot switch in.';
  }
  if (activePartyIndexes(battle).has(partyIndex)) {
    return 'This Pokémon is already active; choose it only to review the active battler.';
  }
  return undefined;
};

const isBattleBallChoice = (choice: BattleBagChoice): boolean =>
  choice.itemId !== null && /_BALL$/u.test(choice.itemId);

const isBattleLegalChoice = (battle: GameRuntimeState['battle'], choice: BattleBagChoice): boolean => {
  if (choice.isExit || !choice.itemId) {
    return false;
  }
  if (isBattleBallChoice(choice)) {
    return !isTrainerBattle(battle) && !isSafariBattle(battle);
  }
  return true;
};

const battleItemDescription = (choice: BattleBagChoice): string => {
  const quantity = typeof choice.quantity === 'number' ? ` You have ${choice.quantity}.` : '';
  const definition = choice.itemId ? getItemDefinition(choice.itemId) : null;
  return `${definition?.description.replace(/\s+/gu, ' ').trim() || 'Use this battle item.'}${quantity}`;
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

const pokemonLabel = (pokemon: { species: string; nickname?: string }): string =>
  pokemon.nickname ?? getSpeciesDisplayName(pokemon.species);

const bagActionLabel = (action: BagContextActionId): string => {
  switch (action) {
    case 'USE': return 'Use';
    case 'GIVE': return 'Give';
    case 'TOSS': return 'Toss';
    case 'REGISTER': return 'Register';
    case 'DESELECT': return 'Deselect';
    case 'OPEN': return 'Open';
    case 'CANCEL': return 'Cancel';
  }
};

const blockedUseReason = (itemId: string): string | undefined => {
  const definition = getItemDefinition(itemId);
  if (itemId === 'ITEM_TM_CASE' || itemId === 'ITEM_BERRY_POUCH') {
    return undefined;
  }
  switch (definition.fieldUseFunc) {
    case 'FieldUseFunc_Bike':
    case 'FieldUseFunc_TownMap':
    case 'FieldUseFunc_FameChecker':
    case 'FieldUseFunc_TeachyTv':
    case 'FieldUseFunc_PokeFlute':
    case 'FieldUseFunc_CoinCase':
    case 'FieldUseFunc_PowderJar':
    case 'FieldUseFunc_Repel':
    case 'FieldUseFunc_Mail':
    case 'FieldUseFunc_Medicine':
    case 'FieldUseFunc_Ether':
    case 'FieldUseFunc_PpUp':
    case 'FieldUseFunc_RareCandy':
    case 'FieldUseFunc_EvoItem':
    case 'FieldUseFunc_SacredAsh':
      return undefined;
    default:
      return 'Cannot use here.';
  }
};

const formatPartyMember = (member: { species: string; nickname?: string; level: number; hp: number; maxHp: number; status: string }): string =>
  `${pokemonLabel(member)} Lv.${member.level} HP ${member.hp}/${member.maxHp} Status ${member.status}`;

const formatFieldPokemon = (member: FieldPokemon): string =>
  `${pokemonLabel(member)} Lv.${member.level} HP ${member.hp}/${member.maxHp} Status ${member.status}`;

const getMenuEntryDescription = (entryId: string, label: string): string => {
  switch (entryId) {
    case 'POKEDEX': return 'Open the Pokédex.';
    case 'POKEMON': return 'Open the party list.';
    case 'BAG': return 'Open the Bag pockets and items.';
    case 'PLAYER': return 'Open the Trainer Card with badge info, money, and play time.';
    case 'SAVE': return 'Open the save confirmation flow.';
    case 'OPTION': return 'Open text speed, battle scene, and battle style choices.';
    case 'EXIT': return 'Close the START menu.';
    case 'RETIRE': return 'Open the Safari Zone retire confirmation.';
    default: return `Open or activate ${label}.`;
  }
};

const mapName = (mapId: string): string => optionLabelFromId(mapId.replace(/^MAP_/u, '').toLowerCase());

const navigationActionType = (targetId: string): string => `navigate-to-${lowerStable(targetId)}`;

const navigationValue = (
  mapId: string,
  x: number,
  y: number,
  kind: NavigationTargetKind,
  finalFacing?: TileDirection
): TextApiJsonValue => ({
  mapId,
  x,
  y,
  kind,
  ...(finalFacing ? { finalFacing } : {})
});

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

const visibleNpcs = (state: GameRuntimeState): readonly NpcState[] =>
  state.npcs.filter((npc) => isNpcVisible(npc, state.scriptRuntime.flags));

const collisionObjects = (state: GameRuntimeState) => [
  ...visibleNpcs(state).map((npc) => ({
    id: npc.id,
    currentTile: npcTile(npc, state.map),
    previousTile: npc.previousTile ?? npcTile(npc, state.map),
    facing: npc.facing,
    initialTile: npc.initialTile ?? npcTile(npc, state.map),
    movementRangeX: npc.movementRangeX ?? 0,
    movementRangeY: npc.movementRangeY ?? 0,
    currentElevation: npc.currentElevation ?? 0,
    previousElevation: npc.previousElevation ?? 0,
    trackedByCamera: false,
    avatarMode: 'normal' as const,
    graphicsId: npc.graphicsId
  })),
  getPlayerRuntimeObject(state.player, state.map)
];

const movementBlockReason = (state: GameRuntimeState, direction: TileDirection): string | null => {
  const playerObject = getPlayerRuntimeObject(state.player, state.map);
  const collision = evaluateFieldCollision({
    map: state.map,
    object: playerObject,
    direction,
    objects: collisionObjects(state).filter((object) => object.id !== playerObject.id),
    loadMapById
  });
  switch (collision.result) {
    case 'none':
    case 'ledgeJump':
    case 'stopSurfing':
    case 'directionalStairWarp':
      return null;
    case 'objectEvent':
      return collision.blockingObject?.graphicsId === OBJ_EVENT_GFX_PUSHABLE_BOULDER
        ? 'A boulder blocks the way; Strength is required to push it.'
        : 'A person or object is blocking the way.';
    case 'outsideRange':
      return 'That direction is outside this object’s movement range.';
    case 'elevationMismatch':
      return 'The ledge or elevation ahead cannot be crossed from here.';
    case 'impassable':
      return 'Terrain or collision data blocks that tile.';
    default:
      return 'A field movement rule blocks that tile.';
  }
};

const adjacentStandTile = (
  state: GameRuntimeState,
  targetX: number,
  targetY: number
): { readonly x: number; readonly y: number; readonly finalFacing: TileDirection } | null => {
  const occupied = new Set(visibleNpcs(state).map((npc) => {
    const tile = npcTile(npc, state.map);
    return `${tile.x},${tile.y}`;
  }));
  for (const direction of ['up', 'down', 'left', 'right'] as const) {
    const vector = getDirectionVector(direction);
    const standX = targetX - vector.x;
    const standY = targetY - vector.y;
    if (getTileIndex(state.map, standX, standY) === null) {
      continue;
    }
    if ((state.map.collisionValues?.[standY * state.map.width + standX] ?? 0) === 0 && !occupied.has(`${standX},${standY}`)) {
      return { x: standX, y: standY, finalFacing: direction };
    }
  }
  return null;
};

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
    const movement = this.enumerateCardinalMovement(state, version, mode);

    return [
      ...movement,
      ...this.enumerateSemanticNavigation(state, version, mode),
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

  private enumerateCardinalMovement(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    return (['north', 'south', 'west', 'east'] as const).map((direction) => {
      const blockedReason = movementBlockReason(state, API_TO_TILE_DIRECTION[direction]);
      return makeOption({
        version,
        mode,
        idParts: ['move', direction],
        label: `Walk ${DIRECTION_LABELS[direction]}`,
        description: blockedReason
          ? `Cannot walk ${DIRECTION_LABELS[direction]}: ${blockedReason}`
          : `Face ${DIRECTION_LABELS[direction]} and try to move one step.`,
        category: 'movement',
        enabled: blockedReason === null,
        disabledReason: blockedReason ?? undefined,
        action: { type: 'move', target: direction }
      });
    });
  }

  private enumerateSemanticNavigation(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const options: TextApiOption[] = [];
    const mapType = state.map.mapType ?? '';
    const semanticScope = CITY_MAP_TYPES.has(mapType)
      ? 'city'
      : ROUTE_MAP_TYPES.has(mapType) || /^ROUTE/iu.test(state.map.id)
        ? 'route'
        : 'area';

    for (const connection of state.map.connections) {
      const targetDirection = TILE_TO_API_DIRECTION[connection.direction];
      const player = playerTile(state.player, state.map);
      const destinationX = connection.direction === 'left'
        ? 0
        : connection.direction === 'right'
          ? state.map.width - 1
          : Math.max(0, Math.min(state.map.width - 1, player.x));
      const destinationY = connection.direction === 'up'
        ? 0
        : connection.direction === 'down'
          ? state.map.height - 1
          : Math.max(0, Math.min(state.map.height - 1, player.y));
      const label = semanticScope === 'route'
        ? `Go ${DIRECTION_LABELS[targetDirection]} to ${mapName(connection.map)}`
        : `Exit ${DIRECTION_LABELS[targetDirection]} to ${mapName(connection.map)}`;
      options.push(makeOption({
        version,
        mode,
        idParts: ['navigate', 'connection', connection.direction, connection.map],
        label,
        description: `Navigate to the ${DIRECTION_LABELS[targetDirection]} map connection for ${mapName(connection.map)}.`,
        category: 'navigation',
        action: {
          type: navigationActionType(`connection-${connection.direction}-${connection.map}`),
          target: connection.map,
          value: navigationValue(state.map.id, destinationX, destinationY, 'tile')
        }
      }));
    }

    for (const warp of state.map.warps) {
      const behavior = MapGridGetMetatileBehaviorAt(state.map, warp.x, warp.y);
      const destination = mapName(warp.destMap);
      const isDoor = (behavior !== null && (behavior === 0x69 || MetatileBehavior_IsWarpDoor(behavior)))
        || /MART|HOUSE|CENTER|GYM|LAB|BUILDING|CAVE|FOREST|TOWER/iu.test(warp.destMap);
      if (isDoor) {
        const stand = adjacentStandTile(state, warp.x, warp.y) ?? { x: warp.x, y: warp.y + 1, finalFacing: 'up' as const };
        options.push(makeOption({
          version,
          mode,
          idParts: ['navigate', 'door', warp.destMap, `${warp.x}`, `${warp.y}`],
          label: `Enter ${destination}`,
          description: `Navigate to the doorway for ${destination} and enter it using normal movement.`,
          category: 'navigation',
          action: {
            type: navigationActionType(`door-${warp.destMap}-${warp.x}-${warp.y}`),
            target: warp.destMap,
            value: navigationValue(state.map.id, stand.x, stand.y, 'door', stand.finalFacing)
          }
        }));
      } else {
        options.push(makeOption({
          version,
          mode,
          idParts: ['navigate', 'warp', warp.destMap, `${warp.x}`, `${warp.y}`],
          label: `Exit to ${destination}`,
          description: `Navigate to the warp point for ${destination}.`,
          category: 'navigation',
          action: {
            type: navigationActionType(`warp-${warp.destMap}-${warp.x}-${warp.y}`),
            target: warp.destMap,
            value: navigationValue(state.map.id, warp.x, warp.y, 'warp')
          }
        }));
      }
    }

    for (const npc of visibleNpcs(state)) {
      if (npc.itemId) {
        continue;
      }
      const tile = npcTile(npc, state.map);
      const stand = adjacentStandTile(state, tile.x, tile.y);
      if (!stand) {
        continue;
      }
      const label = safePublicText(optionLabelFromId(npc.id), 'person');
      options.push(makeOption({
        version,
        mode,
        idParts: ['navigate', 'npc', npc.id],
        label: `Go to ${label}`,
          description: `Navigate to reachable ground beside ${label}.`,
        category: 'navigation',
        action: {
          type: navigationActionType(`npc-${npc.id}`),
          target: npc.id,
          value: navigationValue(state.map.id, stand.x, stand.y, 'npc', stand.finalFacing)
        }
      }));
    }

    for (const trigger of state.map.triggers) {
      if (trigger.activation !== 'interact' || !/sign/iu.test(trigger.scriptId) || !conditionsMatch(trigger, state.scriptRuntime)) {
        continue;
      }
      const stand = adjacentStandTile(state, trigger.x, trigger.y);
      if (!stand) {
        continue;
      }
      options.push(makeOption({
        version,
        mode,
        idParts: ['navigate', 'sign', trigger.id],
        label: 'Go to sign',
          description: 'Navigate to reachable ground beside this sign.',
        category: 'navigation',
        action: {
          type: navigationActionType(`sign-${trigger.id}`),
          target: trigger.id,
          value: navigationValue(state.map.id, stand.x, stand.y, 'sign', stand.finalFacing)
        }
      }));
    }

    const facingWarp = findWarpAtTile(state.map, tileAheadOfPlayer(state.player, state.map).x, tileAheadOfPlayer(state.player, state.map).y, state.player.currentElevation ?? 0);
    if (facingWarp) {
      options.push(makeOption({
        version,
        mode,
        idParts: ['navigate', 'facing-door', facingWarp.destMap],
        label: `Enter ${mapName(facingWarp.destMap)}`,
        description: `Enter the doorway ahead to ${mapName(facingWarp.destMap)}.`,
        category: 'navigation',
        action: {
          type: navigationActionType(`facing-door-${facingWarp.destMap}`),
          target: facingWarp.destMap,
          value: navigationValue(state.map.id, playerTile(state.player, state.map).x, playerTile(state.player, state.map).y, 'door', state.player.facing)
        }
      }));
    }

    return options;
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

    options.push(...this.enumerateFieldMoves(state, version, mode, targetBehavior, npc));
    return options;
  }

  private enumerateFieldMoves(
    state: GameRuntimeState,
    version: number,
    mode: TextApiMode,
    targetBehavior: number | null,
    npc: NpcState | null
  ): TextApiOption[] {
    const options: TextApiOption[] = [];
    const runtime = state.scriptRuntime;
    const facingCutTree = npc?.graphicsId === OBJ_EVENT_GFX_CUT_TREE;
    if (facingCutTree) {
      const hasCut = hasPartyMove(runtime, 'MOVE_CUT');
      const hasBadge = runtime.flags.has('FLAG_BADGE02_GET');
      options.push(makeOption({
        version,
        mode,
        idParts: ['use-cut'],
        label: 'Use Cut',
        description: 'Cut down the tree in front of you.',
        category: 'fieldMove',
        enabled: hasCut && hasBadge,
        disabledReason: !hasCut
          ? 'HM01 Cut is required: no Pokémon in your party knows Cut.'
          : !hasBadge
            ? 'HM01 Cut also requires the Cascade Badge.'
            : undefined,
        action: { type: 'use-cut' }
      }));
    }

    const facingBoulder = npc?.graphicsId === OBJ_EVENT_GFX_PUSHABLE_BOULDER;
    if (facingBoulder) {
      const hasStrength = hasPartyMove(runtime, 'MOVE_STRENGTH');
      const hasBadge = runtime.flags.has('FLAG_BADGE04_GET');
      options.push(makeOption({
        version,
        mode,
        idParts: ['use-strength'],
        label: 'Use Strength',
        description: 'Prepare to push the boulder in front of you.',
        category: 'fieldMove',
        enabled: hasStrength && hasBadge,
        disabledReason: !hasStrength
          ? 'HM04 Strength is required: no Pokémon in your party knows Strength.'
          : !hasBadge
            ? 'HM04 Strength also requires the Rainbow Badge.'
            : undefined,
        action: { type: 'use-strength' }
      }));
    }

    const facingBreakableRock = npc?.graphicsId === OBJ_EVENT_GFX_ROCK_SMASH_ROCK;
    if (facingBreakableRock) {
      const hasRockSmash = hasPartyMove(runtime, 'MOVE_ROCK_SMASH');
      const hasBadge = runtime.flags.has('FLAG_BADGE06_GET');
      options.push(makeOption({
        version,
        mode,
        idParts: ['use-rock-smash'],
        label: 'Use Rock Smash',
        description: 'Break the cracked rock in front of you.',
        category: 'fieldMove',
        enabled: hasRockSmash && hasBadge,
        disabledReason: !hasRockSmash
          ? 'HM06 Rock Smash is required: no Pokémon in your party knows Rock Smash.'
          : !hasBadge
            ? 'HM06 Rock Smash also requires the Marsh Badge.'
            : undefined,
        action: { type: 'use-rock-smash' }
      }));
    }

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
          ? 'HM03 Surf is required: no Pokémon in your party knows Surf.'
          : !hasBadge
            ? 'HM03 Surf also requires the Soul Badge.'
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
          ? 'HM07 Waterfall is required: no Pokémon in your party knows Waterfall.'
          : !hasBadge
            ? 'HM07 Waterfall also requires the Volcano Badge.'
            : !positioned
              ? 'Waterfall can only be used while surfing north into a waterfall.'
              : undefined,
        action: { type: 'use-waterfall' }
      }));
    }

    if (canFish(state.player, state.map) || WATER_BEHAVIORS.has(targetBehavior ?? -1)) {
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
        disabledReason: rodItem === null ? 'A fishing rod item is required: no Old Rod, Good Rod, or Super Rod is in the Bag.' : undefined,
        action: { type: 'fish', value: rodItem ?? null }
      }));
    }

    return options;
  }

  private enumerateDialogue(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    if (state.dialogue.shop) {
      return this.enumerateShop(state, version, mode);
    }

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
            idParts: ['main-menu', entry.id],
            label: safeLabel,
            description: getMenuEntryDescription(entry.id, safeLabel),
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

    if (panel.kind === 'bag') {
      return this.enumerateBag(state, version, mode);
    }

    if (panel.kind === 'party') {
      return this.enumerateParty(panel, version, mode);
    }

    if (panel.kind === 'options') {
      return this.enumerateOptions(panel, version, mode);
    }

    if (panel.kind === 'summary') {
      return [
        ...panel.rows.map((rawRow, index) => makeOption({
          version,
          mode,
          idParts: ['trainer-card', `${index}`],
          label: safePublicText(rawRow, `trainer card row ${index + 1}`),
          description: panel.pageIndex === 0
            ? 'Trainer Card front with money, badge count, play time, and save data.'
            : 'Trainer Card profile page.',
          category: 'trainerCard',
          action: { type: 'wait' }
        })),
        makeOption({
          version,
          mode,
          idParts: ['trainer-card', 'flip'],
          label: panel.pageIndex === 0 ? 'View Trainer Card back' : 'View Trainer Card front',
          description: 'Switch between Trainer Card badge/money/play-time information and the profile side.',
          category: 'trainerCard',
          action: { type: 'choose', target: 'panel', value: 0 }
        }),
        makeOption({
          version,
          mode,
          idParts: ['panel', panel.kind, 'back'],
          label: 'Go back',
          description: 'Return to the START menu.',
          category: 'menu',
          action: { type: 'back', target: 'panel' }
        })
      ];
    }

    if ('active' in state.scriptRuntime.pcStorage && state.scriptRuntime.pcStorage.active === true) {
      return this.enumeratePcStorage(state, version, mode);
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

  private enumerateBag(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const bag = state.scriptRuntime.bag;
    const panel = state.startMenu.panel?.kind === 'bag' ? state.startMenu.panel : null;
    if (!panel) return [];

    if (panel.message) {
      return [makeOption({
        version,
        mode,
        idParts: ['bag', 'message', 'continue'],
        label: 'Continue bag message',
        description: panel.message.text,
        category: 'bagMessage',
        action: { type: 'continue', target: 'bagMessage' }
      })];
    }

    if (panel.confirmationPrompt) {
      const item = getItemDefinition(panel.confirmationPrompt.itemId).name;
      return ['Yes', 'No'].map((label, index) => makeOption({
        version,
        mode,
        idParts: ['bag', 'toss', 'confirm', label],
        label: `${label}, ${index === 0 ? 'toss' : 'keep'} ${item}`,
        description: `Confirm whether to toss ${panel.confirmationPrompt?.quantity ?? 1} ${item}.`,
        category: 'bagConfirm',
        action: { type: 'choose', target: 'bagConfirm', value: index }
      }));
    }

    if (panel.quantityPrompt) {
      const item = getItemDefinition(panel.quantityPrompt.itemId).name;
      return [makeOption({
        version,
        mode,
        idParts: ['bag', 'toss', 'quantity', item],
        label: `Toss ${panel.quantityPrompt.quantity} ${item}`,
        description: `Confirm the selected toss quantity. Maximum available: ${panel.quantityPrompt.maxQuantity}.`,
        category: 'bagQuantity',
        action: { type: 'confirm', target: 'bagQuantity' }
      })];
    }

    if (panel.contextMenu) {
      return panel.contextMenu.actions.map((action, index) => {
        const item = getItemDefinition(panel.contextMenu?.itemId ?? '').name;
        const disabledReason = action === 'USE' ? blockedUseReason(panel.contextMenu?.itemId ?? '') : undefined;
        return makeOption({
          version,
          mode,
          idParts: ['bag', 'action', action, panel.contextMenu?.itemId ?? `${index}`],
          label: `${bagActionLabel(action)} ${item}`,
          description: `${bagActionLabel(action)} ${item} from the ${getBagPocketLabel(bag.selectedPocket)} pocket.`,
          category: 'bagAction',
          enabled: disabledReason === undefined,
          disabledReason,
          action: { type: 'choose', target: 'bagContext', value: index }
        });
      });
    }

    const pockets = BAG_POCKET_ORDER.map((pocket, index) => makeOption({
      version,
      mode,
      idParts: ['bag', 'pocket', pocket],
      label: `${getBagPocketLabel(pocket)} pocket`,
      description: `${getBagPocketLabel(pocket)} contains ${Math.max(0, getBagListEntries(bag, pocket).length - 1)} entries.${pocket === bag.selectedPocket ? ' This is the current pocket.' : ''}`,
      category: 'bagPocket',
      action: { type: 'bagPocket', target: 'bagPocket', value: index }
    }));

    const items = getBagVisibleRows(bag).map((entry) => makeOption({
      version,
      mode,
      idParts: ['bag', 'item', `${entry.absoluteIndex}`, entry.itemId ?? 'close'],
      label: entry.isExit ? 'Close Bag' : `${entry.label}${entry.quantity === null ? '' : ` x${entry.quantity}`}${entry.isRegistered ? ' (registered)' : ''}`,
      description: entry.isExit
        ? 'Close the Bag and return to the START menu.'
        : `${entry.label} in ${getBagPocketLabel(bag.selectedPocket)}. Quantity: ${entry.quantity ?? 1}. ${getItemDefinition(entry.itemId ?? '').description}`,
      category: entry.isExit ? 'menu' : 'bagItem',
      action: { type: 'choose', target: 'bagItem', value: entry.absoluteIndex }
    }));

    return [
      ...pockets,
      ...items,
      makeOption({
        version,
        mode,
        idParts: ['panel', 'bag', 'back'],
        label: 'Go back',
        description: 'Return to the START menu.',
        category: 'menu',
        action: { type: 'back', target: 'panel' }
      })
    ];
  }

  private enumerateParty(panel: Extract<GameRuntimeState['startMenu']['panel'], { kind: 'party' }>, version: number, mode: TextApiMode): TextApiOption[] {
    if (panel.mode === 'actions') {
      const member = panel.members[panel.selectedIndex];
      return panel.actionRows.map((action, index) => makeOption({
        version,
        mode,
        idParts: ['party', 'action', `${index}`, action],
        label: `${optionLabelFromId(action)}${member ? ` ${pokemonLabel(member)}` : ''}`,
        description: `${optionLabelFromId(action)} for ${member ? formatPartyMember(member) : 'the selected party slot'}.`,
        category: 'partyAction',
        action: { type: 'choose', target: 'partyAction', value: index }
      }));
    }

    if (panel.mode === 'summary') {
      return [
        ...panel.summaryLines.map((line, index) => makeOption({
          version,
          mode,
          idParts: ['party', 'summary', `${index}`],
          label: safePublicText(line, `summary line ${index + 1}`),
          description: `Party summary page ${panel.summaryPage + 1}.`,
          category: 'partySummary',
          action: { type: 'wait' }
        })),
        makeOption({
          version,
          mode,
          idParts: ['party', 'summary', 'back'],
          label: 'Close Pokémon summary',
          description: 'Return to party actions.',
          category: 'partySummary',
          action: { type: 'back', target: 'panel' }
        })
      ];
    }

    const category = panel.mode === 'switch' ? 'partySwitch' : 'party';
    return [
      ...panel.rows.map((row, index) => {
        const member = panel.members[index];
        return makeOption({
          version,
          mode,
          idParts: ['party', panel.mode, `${index}`, member?.species ?? 'empty'],
          label: member ? formatPartyMember(member) : safePublicText(row, `party slot ${index + 1}`),
          description: member
            ? `${formatPartyMember(member)}. Actions include Summary, Switch, Item, and Move when available.`
            : 'Empty party slot.',
          category,
          enabled: member !== undefined,
          disabledReason: member === undefined ? 'There is no Pokémon in this party slot.' : undefined,
          action: { type: 'choose', target: 'panel', value: index }
        });
      }),
      makeOption({
        version,
        mode,
        idParts: ['panel', 'party', 'back'],
        label: 'Go back',
        description: 'Return to the START menu.',
        category: 'menu',
        action: { type: 'back', target: 'panel' }
      })
    ];
  }

  private enumerateOptions(panel: Extract<GameRuntimeState['startMenu']['panel'], { kind: 'options' }>, version: number, mode: TextApiMode): TextApiOption[] {
    return [
      ...panel.rows.map((row, index) => {
        const setting = panel.settingOrder[index] ?? `${index}`;
        const label = OPTION_SETTING_LABELS[setting] ?? safePublicText(row, `option ${index + 1}`);
        return makeOption({
          version,
          mode,
          idParts: ['options', setting],
          label: `${label}: ${safePublicText(row, label)}`,
          description: `Adjust ${label}. Current value: ${safePublicText(row, label)}.`,
          category: 'options',
          action: { type: 'optionAdjust', target: 'panel', value: index }
        });
      }),
      makeOption({
        version,
        mode,
        idParts: ['options', 'back'],
        label: 'Close options',
        description: 'Save options and return to the START menu.',
        category: 'menu',
        action: { type: 'back', target: 'panel' }
      })
    ];
  }

  private enumeratePcStorage(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const pc = state.scriptRuntime.pcStorage;
    const currentBoxName = pc.boxNames[pc.currentBox] ?? `BOX ${pc.currentBox + 1}`;
    return [
      ...pc.boxNames.map((boxName, index) => makeOption({
        version,
        mode,
        idParts: ['pc', 'box', `${index}`],
        label: `${boxName}${index === pc.currentBox ? ' (current)' : ''}`,
        description: `${boxName} has ${pc.boxes[index]?.length ?? 0} stored Pokémon.`,
        category: 'pcBox',
        action: { type: 'choose', target: 'pcBox', value: index }
      })),
      ...(pc.boxes[pc.currentBox] ?? []).map((pokemon, index) => makeOption({
        version,
        mode,
        idParts: ['pc', 'pokemon', `${index}`, pokemon.species],
        label: formatFieldPokemon(pokemon),
        description: `${formatFieldPokemon(pokemon)} stored in ${currentBoxName}.`,
        category: 'pcPokemon',
        action: { type: 'choose', target: 'pcPokemon', value: index }
      })),
      ...PC_ACTION_ORDER.map((action, index) => makeOption({
        version,
        mode,
        idParts: ['pc', 'action', action],
        label: getPcActionLabel(action),
        description: `${getPcActionLabel(action)} using ${currentBoxName}.`,
        category: 'pcAction',
        action: { type: 'choose', target: 'pcAction', value: index }
      }))
    ];
  }

  private enumerateShop(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const shop = state.dialogue.shop;
    if (!shop) return [];
    const money = getMoney(state.scriptRuntime);
    if (shop.mode === 'mainMenu') {
      return ['BUY', 'SELL', 'SEE YA!'].map((label, index) => makeOption({
        version,
        mode,
        idParts: ['shop', 'main', label],
        label: label === 'SEE YA!' ? 'Leave shop' : `${label} items`,
        description: `${shop.prompt} Player money: ¥${money}.`,
        category: 'shop',
        action: { type: 'choose', target: 'shop', value: index }
      }));
    }
    if (shop.mode === 'buyList') {
      return [
        ...shop.items.map((itemId, index) => {
          const definition = getItemDefinition(itemId);
          const enabled = money >= definition.price;
          return makeOption({
            version,
            mode,
            idParts: ['shop', 'buy', `${index}`, itemId],
            label: `Buy ${definition.name} - ¥${definition.price}`,
            description: `${definition.description} Player money: ¥${money}.`,
            category: 'shopItem',
            enabled,
            disabledReason: enabled ? undefined : 'Not enough money.',
            action: { type: 'choose', target: 'shop', value: index }
          });
        }),
        makeOption({
          version,
          mode,
          idParts: ['shop', 'buy', 'cancel'],
          label: 'Stop buying',
          description: 'Return to the shop main menu.',
          category: 'shop',
          action: { type: 'cancel', target: 'shop' }
        })
      ];
    }
    if (shop.mode === 'buyQuantity') {
      const item = shop.currentItemId ? getItemDefinition(shop.currentItemId).name : 'item';
      return [makeOption({
        version,
        mode,
        idParts: ['shop', 'quantity', item],
        label: `Buy ${shop.quantity} ${item}`,
        description: `Confirm quantity ${shop.quantity} of maximum ${shop.maxQuantity}. Player money: ¥${money}.`,
        category: 'shopQuantity',
        action: { type: 'confirm', target: 'shop' }
      })];
    }
    if (shop.mode === 'buyConfirm' || shop.mode === 'sellConfirm') {
      return ['Yes', 'No'].map((label, index) => makeOption({
        version,
        mode,
        idParts: ['shop', 'confirm', label],
        label: `${label}, ${index === 0 ? 'confirm' : 'cancel'} transaction`,
        description: shop.prompt,
        category: 'shopConfirm',
        action: { type: 'choose', target: 'shop', value: index }
      }));
    }
    return [makeOption({
      version,
      mode,
      idParts: ['shop', 'message', 'continue'],
      label: 'Continue shop message',
      description: shop.prompt || 'Continue the shop flow.',
      category: 'shopMessage',
      action: { type: 'continue', target: 'shop' }
    })];
  }

  private enumerateBattle(state: GameRuntimeState, version: number, mode: TextApiMode): TextApiOption[] {
    const battle = state.battle;

    if (battle.phase === 'script') {
      const pending = battle.queuedMessages.length + battle.vm.pendingMessages.length;
      return [makeOption({
        version,
        mode,
        idParts: ['battle', 'message', 'continue'],
        label: pending > 0 ? 'Continue battle message' : 'Continue battle script',
        description: pending > 0
          ? 'Acknowledge the pending battle message and continue battle flow.'
          : 'Let the pending battle script advance to the next decision.',
        category: 'battleMessage',
        action: { type: 'battleContinue', target: 'battleMessage' }
      })];
    }

    if (battle.phase === 'resolved') {
      const result = battle.postResult;
      const resultParts = [
        result.outcome !== 'none' ? `Outcome: ${result.outcome}.` : 'Battle has ended.',
        result.levelUps.length > 0 ? `Level ups: ${result.levelUps.map((entry) => `${entry.species} to ${entry.level}`).join(', ')}.` : '',
        result.pendingMoveLearns.length > 0 ? `Moves to learn: ${result.pendingMoveLearns.map((entry) => `${entry.species} can learn ${entry.moveName}`).join(', ')}.` : '',
        result.caughtPokemon ? `Caught ${result.caughtPokemon.species}.` : '',
        result.payDayTotal > 0 ? `Pay Day total: ¥${result.payDayTotal}.` : ''
      ].filter(Boolean).join(' ');
      return [makeOption({
        version,
        mode,
        idParts: ['battle', 'aftermath', 'continue'],
        label: 'Continue after battle',
        description: resultParts,
        category: 'battleAftermath',
        action: { type: 'battleContinue', target: 'battleAftermath' }
      })];
    }

    if (battle.phase === 'shiftPrompt') {
      const opponent = battle.pendingOpponentPartyIndex !== null
        ? battle.opponentSide.party[battle.pendingOpponentPartyIndex]
        : null;
      return [
        makeOption({
          version,
          mode,
          idParts: ['battle', 'shift', 'yes'],
          label: 'Switch Pokémon before opponent sends out',
          description: opponent
            ? `Choose a replacement before the opponent sends out ${opponent.species}.`
            : 'Choose a replacement before the opponent sends out the next Pokémon.',
          category: 'battleShiftPrompt',
          action: { type: 'battleShift', target: 'shiftPrompt', value: 0 }
        }),
        makeOption({
          version,
          mode,
          idParts: ['battle', 'shift', 'no'],
          label: 'Keep current Pokémon in battle',
          description: opponent
            ? `Do not switch before the opponent sends out ${opponent.species}.`
            : 'Do not switch before the opponent sends out the next Pokémon.',
          category: 'battleShiftPrompt',
          action: { type: 'battleShift', target: 'shiftPrompt', value: 1 }
        })
      ];
    }

    if (battle.phase === 'moveSelect') {
      return battle.moves.map((move, index) => {
        const disabledReason = moveDisabledReason(battle, move);
        return makeOption({
          version,
          mode,
          idParts: ['battle', 'move', `${index}`, move.id],
          label: `Use ${move.name}`,
          description: `${move.name}. Type: ${formatPokemonType(move.type)}. PP: ${move.ppRemaining}/${move.pp}.`,
          category: 'battleMove',
          enabled: disabledReason === undefined,
          disabledReason,
          action: { type: 'battleMove', target: 'battleMove', value: index }
        });
      });
    }

    if (battle.phase === 'bagSelect') {
      return [
        ...getBattleBagChoices(battle, state.scriptRuntime.bag)
          .filter((choice) => isBattleLegalChoice(battle, choice))
          .map((choice, index) => makeOption({
            version,
            mode,
            idParts: ['battle', 'bag', `${index}`, choice.itemId ?? choice.label],
            label: `Use ${choice.label}`,
            description: battleItemDescription(choice),
            category: 'battleBag',
            action: { type: 'battleBagItem', target: 'battleBag', value: choice.itemId ?? index }
          })),
        makeOption({
          version,
          mode,
          idParts: ['battle', 'bag', 'cancel'],
          label: 'Close battle Bag',
          description: 'Return to the battle command choices without using an item.',
          category: 'battleBag',
          action: { type: 'battleCancel', target: 'battleBag' }
        })
      ];
    }

    if (battle.phase === 'partySelect') {
      const forcedReplacement = battle.playerMon.hp <= 0;
      return battle.party.map((pokemon, index) => {
        const disabledReason = partyDisabledReason(battle, pokemon, index);
        const active = activePartyIndexes(battle).has(index);
        return makeOption({
          version,
          mode,
          idParts: ['battle', 'party', `${index}`, pokemon.species],
          label: active ? `Review active ${pokemon.species}` : `Switch to ${pokemon.species}`,
          description: `${pokemon.species}, level ${pokemon.level}, HP ${pokemon.hp}/${pokemon.maxHp}.${forcedReplacement ? ' A replacement is required because the active Pokémon fainted.' : ''}`,
          category: forcedReplacement ? 'battleReplacement' : 'battleParty',
          enabled: disabledReason === undefined || active,
          disabledReason: active ? undefined : disabledReason,
          action: { type: active ? 'battleViewParty' : 'battlePartySwitch', target: 'battleParty', value: index }
        });
      });
    }

    const inCommandPhase = battle.phase === 'command';
    const commands = battle.commands.length > 0 ? battle.commands : (['fight', 'bag', 'pokemon', 'run'] as BattleCommand[]);
    return commands.map((command, index) => {
      let enabled = inCommandPhase;
      let disabledReason = inCommandPhase ? undefined : 'Battle commands are unavailable while the battle is resolving.';
      if (enabled && command === 'bag' && !getBattleBagChoices(battle, state.scriptRuntime.bag).some((choice) => isBattleLegalChoice(battle, choice))) {
        enabled = false;
        disabledReason = 'No battle-usable items are available.';
      }
      const party = battle.party ?? battle.playerSide.party ?? [];
      if (enabled && command === 'pokemon' && party.filter((pokemon) => pokemon.hp > 0).length <= 1) {
        enabled = false;
        disabledReason = 'No other able Pokémon can switch in.';
      }
      if (enabled && command === 'run' && isTrainerBattle(battle)) {
        enabled = false;
        disabledReason = 'Cannot run from trainer battles.';
      }
      if (enabled && command === 'safariBall' && battle.safariBalls <= 0) {
        enabled = false;
        disabledReason = 'No Safari Balls remain.';
      }

      return makeOption({
        version,
        mode,
        idParts: ['battle', `${index}`, battleCommandActionType(command)],
        label: commandLabel(command),
        description: commandDescription(command),
        category: isSafariBattle(battle) ? 'battleSafariCommand' : 'battleCommand',
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
