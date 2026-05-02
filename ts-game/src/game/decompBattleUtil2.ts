import type { BattleBattlerId, BattlePokemonSnapshot, BattleState } from './battle';

export const BATTLE_UTIL2_C_TRANSLATION_UNIT = 'src/battle_util2.c';

const allocatedBattles = new WeakSet<BattleState>();
const friendshipAdjustedPartyIndexes = new WeakMap<BattleState, Set<number>>();

const FRIENDSHIP_EVENT_FAINT_SMALL = [-1, -1, -1] as const;
const FRIENDSHIP_EVENT_FAINT_LARGE = [-5, -5, -10] as const;

const getFriendshipLevel = (friendship: number): 0 | 1 | 2 => {
  if (friendship >= 200) {
    return 2;
  }
  if (friendship >= 100) {
    return 1;
  }
  return 0;
};

const clampFriendship = (friendship: number): number => Math.max(0, Math.min(255, Math.trunc(friendship)));

const getPlayerPartyIndexForBattler = (battle: BattleState, battlerId: BattleBattlerId): number | null => {
  const battler = battle.battlers.find((entry) => entry.battlerId === battlerId) ?? null;
  if (!battler || battler.side !== 'player' || battler.partyIndex === null) {
    return null;
  }
  return battler.partyIndex;
};

const getHighestOpponentLevel = (battle: BattleState): number => {
  const activeOpponentLevels = battle.battlers
    .filter(
      (entry): entry is typeof entry & { partyIndex: number } =>
        entry.side === 'opponent' && entry.active && entry.partyIndex !== null
    )
    .map((entry) => battle.opponentSide.party[entry.partyIndex]?.level ?? 0);

  if (activeOpponentLevels.length === 0) {
    return battle.wildMon.level;
  }

  return Math.max(...activeOpponentLevels);
};

export const allocateBattleResources = (battle: BattleState): void => {
  allocatedBattles.add(battle);
  friendshipAdjustedPartyIndexes.set(battle, new Set());
};

export function AllocateBattleResources(battle: BattleState): void {
  allocateBattleResources(battle);
}

export const freeBattleResources = (battle: BattleState): void => {
  allocatedBattles.delete(battle);
  friendshipAdjustedPartyIndexes.delete(battle);
};

export function FreeBattleResources(battle: BattleState): void {
  freeBattleResources(battle);
}

export const areBattleResourcesAllocated = (battle: BattleState): boolean =>
  allocatedBattles.has(battle);

export const adjustFriendshipOnBattleFaint = (
  battle: BattleState,
  battlerId: BattleBattlerId
): void => {
  const partyIndex = getPlayerPartyIndexForBattler(battle, battlerId);
  if (partyIndex === null) {
    return;
  }

  const partyMon = battle.playerSide.party[partyIndex];
  if (!partyMon) {
    return;
  }

  const adjustedIndexes = friendshipAdjustedPartyIndexes.get(battle);
  if (!adjustedIndexes || adjustedIndexes.has(partyIndex)) {
    return;
  }

  const highestOpponentLevel = getHighestOpponentLevel(battle);
  const friendship = clampFriendship(partyMon.friendship);
  const friendshipLevel = getFriendshipLevel(friendship);
  const delta = highestOpponentLevel > partyMon.level
    ? highestOpponentLevel - partyMon.level > 29
      ? FRIENDSHIP_EVENT_FAINT_LARGE[friendshipLevel]
      : FRIENDSHIP_EVENT_FAINT_SMALL[friendshipLevel]
    : FRIENDSHIP_EVENT_FAINT_SMALL[friendshipLevel];

  partyMon.friendship = clampFriendship(friendship + delta);
  adjustedIndexes.add(partyIndex);
};

export function AdjustFriendshipOnBattleFaint(
  battle: BattleState,
  battlerId: BattleBattlerId
): void {
  adjustFriendshipOnBattleFaint(battle, battlerId);
}

export const findBattlerIdForPokemon = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot
): BattleBattlerId | null => {
  const participant = side === 'player' ? battle.playerSide : battle.opponentSide;
  for (const battler of battle.battlers) {
    if (battler.side !== side || battler.partyIndex === null) {
      continue;
    }

    if (participant.party[battler.partyIndex] === pokemon) {
      return battler.battlerId;
    }
  }

  return null;
};
