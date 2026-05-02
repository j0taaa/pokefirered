import { describe, expect, test } from 'vitest';
import {
  BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_LINK,
  BATTLE_TYPE_MULTI,
  BATTLE_TYPE_OLD_MAN_TUTORIAL,
  BATTLE_TYPE_TRAINER,
  B_OUTCOME_CAUGHT,
  B_OUTCOME_WON,
  B_SIDE_PLAYER,
  QL_EVENT_DEFEATED_CHAMPION,
  QL_EVENT_DEFEATED_GYM_LEADER,
  QL_EVENT_DEFEATED_TRAINER,
  QL_EVENT_DEFEATED_WILD_MON,
  QL_EVENT_LINK_BATTLED_DOUBLE,
  QL_EVENT_LINK_BATTLED_MULTI,
  QL_EVENT_LINK_BATTLED_SINGLE,
  QL_EVENT_LINK_BATTLED_UNION,
  SPECIES_NONE,
  TRAINER_CLASS_CHAMPION,
  TRAINER_CLASS_LEADER,
  GetLinkMultiBattlePlayerIndexes,
  TrySetQuestLogBattleEvent,
  TrySetQuestLogLinkBattleEvent,
  getLinkMultiBattlePlayerIndexes,
  trySetQuestLogBattleEvent,
  trySetQuestLogLinkBattleEvent,
  type QuestLogBattleContext
} from '../src/game/decompQuestLogBattle';

const createContext = (): QuestLogBattleContext => ({
  battleTypeFlags: 0,
  battleOutcome: B_OUTCOME_WON,
  trainers: [{ trainerClass: TRAINER_CLASS_LEADER }, { trainerClass: TRAINER_CLASS_CHAMPION }, { trainerClass: 1 }],
  trainerBattleOpponentA: 0,
  battleMons: [
    { species: 25, hp: 20, maxHP: 60, side: B_SIDE_PLAYER },
    { species: 1, hp: 0, maxHP: 50, side: 1 },
    { species: 6, hp: 40, maxHP: 60, side: B_SIDE_PLAYER },
    { species: 2, hp: 0, maxHP: 50, side: 1 }
  ],
  lastOpponentSpecies: 150,
  lastAttackerToFaintOpponent: 0,
  enemySpecies: 16,
  mapSec: 77,
  multiplayerId: 0,
  linkPlayers: [
    { id: 0, name: 'PLAYER0' },
    { id: 1, name: 'PLAYER1' },
    { id: 2, name: 'PARTNER' },
    { id: 3, name: 'OPPONENT' }
  ],
  inUnionRoom: false
});

describe('decompQuestLogBattle', () => {
  test('TrySetQuestLogBattleEvent ignores link/tutorial/pokedude or losing outcomes', () => {
    expect(trySetQuestLogBattleEvent({ ...createContext(), battleTypeFlags: BATTLE_TYPE_LINK })).toBeNull();
    expect(TrySetQuestLogBattleEvent({ ...createContext(), battleTypeFlags: BATTLE_TYPE_LINK })).toBeNull();
    expect(trySetQuestLogBattleEvent({ ...createContext(), battleTypeFlags: BATTLE_TYPE_OLD_MAN_TUTORIAL })).toBeNull();
    expect(trySetQuestLogBattleEvent({ ...createContext(), battleOutcome: 2 })).toBeNull();
  });

  test('trainer wins choose event id by trainer class and compute HP fraction', () => {
    const result = trySetQuestLogBattleEvent({
      ...createContext(),
      battleTypeFlags: BATTLE_TYPE_TRAINER
    });

    expect(result).toEqual({
      eventId: QL_EVENT_DEFEATED_GYM_LEADER,
      data: {
        trainerId: 0,
        speciesOpponent: 150,
        speciesPlayer: 25,
        mapSec: 77,
        hpFractionId: 1
      }
    });

    expect(trySetQuestLogBattleEvent({
      ...createContext(),
      battleTypeFlags: BATTLE_TYPE_TRAINER,
      trainerBattleOpponentA: 1
    })?.eventId).toBe(QL_EVENT_DEFEATED_CHAMPION);
    expect(trySetQuestLogBattleEvent({
      ...createContext(),
      battleTypeFlags: BATTLE_TYPE_TRAINER,
      trainerBattleOpponentA: 2
    })?.eventId).toBe(QL_EVENT_DEFEATED_TRAINER);
  });

  test('double trainer battle chooses player species from last attacker or live left-side mon', () => {
    const result = trySetQuestLogBattleEvent({
      ...createContext(),
      battleTypeFlags: BATTLE_TYPE_TRAINER | BATTLE_TYPE_DOUBLE,
      lastAttackerToFaintOpponent: 1
    });

    expect(result?.data.speciesPlayer).toBe(25);
    expect(result?.data.hpFractionId).toBe(1);
  });

  test('wild battles record defeated or caught species', () => {
    expect(trySetQuestLogBattleEvent(createContext())).toEqual({
      eventId: QL_EVENT_DEFEATED_WILD_MON,
      data: { defeatedSpecies: 16, caughtSpecies: SPECIES_NONE, mapSec: 77 }
    });
    expect(trySetQuestLogBattleEvent({ ...createContext(), battleOutcome: B_OUTCOME_CAUGHT })).toEqual({
      eventId: QL_EVENT_DEFEATED_WILD_MON,
      data: { defeatedSpecies: SPECIES_NONE, caughtSpecies: 16, mapSec: 77 }
    });
  });

  test('link battle events choose single/double/union/multi ids and copied player names', () => {
    expect(trySetQuestLogLinkBattleEvent({ ...createContext(), battleTypeFlags: BATTLE_TYPE_LINK })?.eventId).toBe(QL_EVENT_LINK_BATTLED_SINGLE);
    expect(TrySetQuestLogLinkBattleEvent({ ...createContext(), battleTypeFlags: BATTLE_TYPE_LINK })?.eventId).toBe(QL_EVENT_LINK_BATTLED_SINGLE);
    expect(trySetQuestLogLinkBattleEvent({ ...createContext(), battleTypeFlags: BATTLE_TYPE_LINK | BATTLE_TYPE_DOUBLE })?.eventId).toBe(QL_EVENT_LINK_BATTLED_DOUBLE);
    expect(trySetQuestLogLinkBattleEvent({ ...createContext(), battleTypeFlags: BATTLE_TYPE_LINK, inUnionRoom: true })?.eventId).toBe(QL_EVENT_LINK_BATTLED_UNION);

    const multi = trySetQuestLogLinkBattleEvent({ ...createContext(), battleTypeFlags: BATTLE_TYPE_LINK | BATTLE_TYPE_MULTI });
    expect(multi).toEqual({
      eventId: QL_EVENT_LINK_BATTLED_MULTI,
      data: {
        outcome: 0,
        playerNames: ['PARTNER', 'PLAYER1', 'OPPONEN']
      }
    });
  });

  test('GetLinkMultiBattlePlayerIndexes finds partner by id xor 2 and remaining opponents', () => {
    expect(getLinkMultiBattlePlayerIndexes(0, createContext().linkPlayers)).toEqual({
      partnerIdx: 2,
      opponentIdxs: [1, 3]
    });
    expect(GetLinkMultiBattlePlayerIndexes(0, createContext().linkPlayers)).toEqual({
      partnerIdx: 2,
      opponentIdxs: [1, 3]
    });
  });
});
