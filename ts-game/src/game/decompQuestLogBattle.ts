export const BATTLE_TYPE_DOUBLE = 1 << 0;
export const BATTLE_TYPE_LINK = 1 << 1;
export const BATTLE_TYPE_TRAINER = 1 << 3;
export const BATTLE_TYPE_MULTI = 1 << 6;
export const BATTLE_TYPE_OLD_MAN_TUTORIAL = 1 << 9;
export const BATTLE_TYPE_POKEDUDE = 1 << 16;
export const B_OUTCOME_WON = 1;
export const B_OUTCOME_CAUGHT = 7;
export const QL_EVENT_LINK_BATTLED_SINGLE = 13;
export const QL_EVENT_LINK_BATTLED_DOUBLE = 14;
export const QL_EVENT_LINK_BATTLED_MULTI = 15;
export const QL_EVENT_LINK_BATTLED_UNION = 19;
export const QL_EVENT_DEFEATED_GYM_LEADER = 30;
export const QL_EVENT_DEFEATED_WILD_MON = 31;
export const QL_EVENT_DEFEATED_E4_MEMBER = 32;
export const QL_EVENT_DEFEATED_CHAMPION = 33;
export const QL_EVENT_DEFEATED_TRAINER = 34;
export const TRAINER_CLASS_LEADER = 84;
export const TRAINER_CLASS_ELITE_FOUR = 87;
export const TRAINER_CLASS_CHAMPION = 90;
export const B_SIDE_PLAYER = 0;
export const SPECIES_NONE = 0;
export const PLAYER_NAME_LENGTH = 7;

export interface QuestLogBattleMon {
  species: number;
  hp: number;
  maxHP: number;
  side: number;
}

export interface QuestLogTrainerDefinition {
  trainerClass: number;
}

export interface QuestLogBattleContext {
  battleTypeFlags: number;
  battleOutcome: number;
  trainers: QuestLogTrainerDefinition[];
  trainerBattleOpponentA: number;
  battleMons: QuestLogBattleMon[];
  lastOpponentSpecies: number;
  lastAttackerToFaintOpponent: number;
  enemySpecies: number;
  mapSec: number;
  multiplayerId: number;
  linkPlayers: Array<{ id: number; name: string }>;
  inUnionRoom: boolean;
}

export interface QuestLogBattleEvent {
  eventId: number;
  data: Record<string, unknown>;
}

const getBattlerAtPosition = (position: number): number => position;

const trainerEventIdForClass = (trainerClass: number): number => {
  switch (trainerClass) {
    case TRAINER_CLASS_LEADER:
      return QL_EVENT_DEFEATED_GYM_LEADER;
    case TRAINER_CLASS_CHAMPION:
      return QL_EVENT_DEFEATED_CHAMPION;
    case TRAINER_CLASS_ELITE_FOUR:
      return QL_EVENT_DEFEATED_E4_MEMBER;
    default:
      return QL_EVENT_DEFEATED_TRAINER;
  }
};

const hpFractionId = (endingHp: number, maxHp: number): number => {
  let result = 0;
  if (endingHp < Math.trunc(maxHp / 3) * 2) {
    result += 1;
  }
  if (endingHp < Math.trunc(maxHp / 3)) {
    result += 1;
  }
  return result;
};

export const trySetQuestLogBattleEvent = (context: QuestLogBattleContext): QuestLogBattleEvent | null => {
  if (
    (context.battleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_OLD_MAN_TUTORIAL | BATTLE_TYPE_POKEDUDE)) !== 0
    || (context.battleOutcome !== B_OUTCOME_WON && context.battleOutcome !== B_OUTCOME_CAUGHT)
  ) {
    return null;
  }

  if ((context.battleTypeFlags & BATTLE_TYPE_TRAINER) !== 0) {
    const trainer = context.trainers[context.trainerBattleOpponentA] ?? { trainerClass: 0 };
    const data: Record<string, unknown> = {
      trainerId: context.trainerBattleOpponentA,
      speciesOpponent: context.lastOpponentSpecies,
      mapSec: context.mapSec
    };
    let playerEndingHP = 0;
    let playerMaxHP = 0;

    if ((context.battleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0) {
      const attacker = context.battleMons[context.lastAttackerToFaintOpponent];
      data.speciesPlayer = attacker?.side === B_SIDE_PLAYER
        ? attacker.species
        : (context.battleMons[getBattlerAtPosition(0)]?.hp ?? 0) !== 0
          ? context.battleMons[getBattlerAtPosition(0)]?.species
          : context.battleMons[getBattlerAtPosition(2)]?.species;
      playerEndingHP = (context.battleMons[0]?.hp ?? 0) + (context.battleMons[2]?.hp ?? 0);
      playerMaxHP = (context.battleMons[0]?.maxHP ?? 0) + (context.battleMons[2]?.maxHP ?? 0);
    } else {
      data.speciesPlayer = context.battleMons[getBattlerAtPosition(0)]?.species ?? SPECIES_NONE;
      playerEndingHP = context.battleMons[0]?.hp ?? 0;
      playerMaxHP = context.battleMons[0]?.maxHP ?? 0;
    }

    data.hpFractionId = hpFractionId(playerEndingHP, playerMaxHP);
    return {
      eventId: trainerEventIdForClass(trainer.trainerClass),
      data
    };
  }

  return {
    eventId: QL_EVENT_DEFEATED_WILD_MON,
    data: {
      defeatedSpecies: context.battleOutcome === B_OUTCOME_WON ? context.enemySpecies : SPECIES_NONE,
      caughtSpecies: context.battleOutcome === B_OUTCOME_CAUGHT ? context.enemySpecies : SPECIES_NONE,
      mapSec: context.mapSec
    }
  };
};

export function TrySetQuestLogBattleEvent(context: QuestLogBattleContext): QuestLogBattleEvent | null { return trySetQuestLogBattleEvent(context); }

export const getLinkMultiBattlePlayerIndexes = (
  multiplayerId: number,
  linkPlayers: Array<{ id: number }>
): { partnerIdx: number; opponentIdxs: number[] } => {
  const partnerId = (linkPlayers[multiplayerId]?.id ?? 0) ^ 2;
  let partnerIdx = 0;
  const opponentIdxs: number[] = [];
  for (let i = 0; i < 4; i += 1) {
    if (partnerId === linkPlayers[i]?.id) {
      partnerIdx = i;
    } else if (i !== multiplayerId) {
      opponentIdxs.push(i);
    }
  }
  return { partnerIdx, opponentIdxs };
};

export function GetLinkMultiBattlePlayerIndexes(
  multiplayerId: number,
  linkPlayers: Array<{ id: number }>
): { partnerIdx: number; opponentIdxs: number[] } {
  return getLinkMultiBattlePlayerIndexes(multiplayerId, linkPlayers);
}

const copyPlayerName = (name: string): string => name.slice(0, PLAYER_NAME_LENGTH);

export const trySetQuestLogLinkBattleEvent = (context: QuestLogBattleContext): QuestLogBattleEvent | null => {
  if ((context.battleTypeFlags & BATTLE_TYPE_LINK) === 0) {
    return null;
  }

  const data: Record<string, unknown> = {
    outcome: context.battleOutcome - 1
  };
  let eventId: number;

  if ((context.battleTypeFlags & BATTLE_TYPE_MULTI) !== 0) {
    eventId = QL_EVENT_LINK_BATTLED_MULTI;
    const { partnerIdx, opponentIdxs } = getLinkMultiBattlePlayerIndexes(context.multiplayerId, context.linkPlayers);
    data.playerNames = [
      copyPlayerName(context.linkPlayers[partnerIdx]?.name ?? ''),
      copyPlayerName(context.linkPlayers[opponentIdxs[0]]?.name ?? ''),
      copyPlayerName(context.linkPlayers[opponentIdxs[1]]?.name ?? '')
    ];
  } else {
    eventId = (context.battleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0
      ? QL_EVENT_LINK_BATTLED_DOUBLE
      : context.inUnionRoom
        ? QL_EVENT_LINK_BATTLED_UNION
        : QL_EVENT_LINK_BATTLED_SINGLE;
    data.playerNames = [copyPlayerName(context.linkPlayers[context.multiplayerId ^ 1]?.name ?? '')];
  }

  return { eventId, data };
};

export function TrySetQuestLogLinkBattleEvent(context: QuestLogBattleContext): QuestLogBattleEvent | null { return trySetQuestLogLinkBattleEvent(context); }
