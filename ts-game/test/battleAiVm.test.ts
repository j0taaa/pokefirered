import { describe, expect, test } from 'vitest';
import { createBattleState, type BattleMove, type BattlePokemonSnapshot } from '../src/game/battle';
import {
  chooseTrainerAiItemDecision,
  chooseTrainerMoveIndex,
  getUnhandledTrainerAiScriptOpcodes,
  type TrainerAiContext
} from '../src/game/battleAiVm';

const makeMove = (id: string, effect: string, power: number, type: BattleMove['type'] = 'water'): BattleMove => ({
  id,
  name: id.replace(/_/gu, ' '),
  power,
  type,
  accuracy: 100,
  pp: 20,
  ppRemaining: 20,
  priority: 0,
  effect,
  effectScriptLabel: `BattleScript_${effect}`,
  target: 'MOVE_TARGET_SELECTED',
  secondaryEffectChance: 0,
  flags: []
});

const makeContext = (
  user: BattlePokemonSnapshot,
  target: BattlePokemonSnapshot,
  userMoves: BattleMove[],
  targetMoves: BattleMove[] = []
): TrainerAiContext => ({
  user,
  target,
  userMoves,
  targetMoves,
  userSideState: {
    reflectTurns: 0,
    lightScreenTurns: 0,
    safeguardTurns: 0,
    mistTurns: 0,
    wishTurns: 0,
    wishHp: 0,
    spikesLayers: 0,
    futureAttack: null
  },
  targetSideState: {
    reflectTurns: 0,
    lightScreenTurns: 0,
    safeguardTurns: 0,
    mistTurns: 0,
    wishTurns: 0,
    wishHp: 0,
    spikesLayers: 0,
    futureAttack: null
  },
  weather: 'none',
  mudSport: false,
  waterSport: false,
  turnCount: 0,
  format: 'singles',
  userPartyAliveCount: 2,
  targetPartyAliveCount: 2,
  userParty: [user],
  targetParty: [target],
  safariEscapeFactor: 0,
  safariRockThrowCounter: 0,
  safariBaitThrowCounter: 0
});

describe('battle AI VM', () => {
  test('has handlers for every opcode currently used by decomp AI scripts', () => {
    expect(getUnhandledTrainerAiScriptOpcodes()).toEqual([]);
  });

  test('scores trainer move candidates by executing parsed decomp AI roots in bit order', () => {
    const battle = createBattleState();
    const tackle = makeMove('TACKLE', 'EFFECT_HIT', 35, 'normal');
    const waterGun = makeMove('WATER_GUN', 'EFFECT_HIT', 40, 'water');
    const context = makeContext(battle.wildMon, battle.playerMon, [tackle, waterGun], [battle.moves[0]!]);

    const decision = chooseTrainerMoveIndex(
      [
        {
          index: 0,
          move: tackle,
          effectiveness: 1,
          maxDamage: 12,
          targetStatus: 'none',
          context
        },
        {
          index: 1,
          move: waterGun,
          effectiveness: 2,
          maxDamage: 18,
          targetStatus: 'none',
          context
        }
      ],
      ['AI_SCRIPT_CHECK_BAD_MOVE', 'AI_SCRIPT_TRY_TO_FAINT', 'AI_SCRIPT_CHECK_VIABILITY'],
      () => 0
    );

    expect(decision?.selectedIndex).toBe(1);
    expect(decision?.scoredMoves[0]?.rootScripts).toEqual([
      'AI_CheckBadMove',
      'AI_CheckViability',
      'AI_TryToFaint'
    ]);
    expect(decision?.scoredMoves.find((entry) => entry.index === 1)?.score).toBeGreaterThan(
      decision?.scoredMoves.find((entry) => entry.index === 0)?.score ?? Number.NEGATIVE_INFINITY
    );
    expect(decision?.scoredMoves.every((entry) => entry.unsupportedOpcodes.length === 0)).toBe(true);
  });

  test('bad-move script discourages status moves that cannot affect the current target', () => {
    const battle = createBattleState();
    const target = {
      ...battle.playerMon,
      status: 'paralysis' as const
    };
    const thunderWave = makeMove('THUNDER_WAVE', 'EFFECT_PARALYZE', 0, 'electric');
    const tackle = makeMove('TACKLE', 'EFFECT_HIT', 35, 'normal');
    const context = makeContext(battle.wildMon, target, [thunderWave, tackle]);

    const decision = chooseTrainerMoveIndex(
      [
        {
          index: 0,
          move: thunderWave,
          effectiveness: 1,
          maxDamage: 0,
          targetStatus: target.status,
          context
        },
        {
          index: 1,
          move: tackle,
          effectiveness: 1,
          maxDamage: 12,
          targetStatus: target.status,
          context
        }
      ],
      ['AI_SCRIPT_CHECK_BAD_MOVE'],
      () => 0
    );

    expect(decision?.selectedIndex).toBe(1);
    expect(decision?.scoredMoves.find((entry) => entry.index === 0)?.score).toBeLessThan(
      decision?.scoredMoves.find((entry) => entry.index === 1)?.score ?? Number.POSITIVE_INFINITY
    );
  });

  test('viability script discourages setup moves at low HP more than straightforward attacks', () => {
    const battle = createBattleState();
    const user = {
      ...battle.wildMon,
      hp: 8,
      maxHp: 40
    };
    const howl = makeMove('HOWL', 'EFFECT_ATTACK_UP', 0, 'normal');
    const tackle = makeMove('TACKLE', 'EFFECT_HIT', 35, 'normal');
    const context = makeContext(user, battle.playerMon, [howl, tackle]);

    const decision = chooseTrainerMoveIndex(
      [
        {
          index: 0,
          move: howl,
          effectiveness: 1,
          maxDamage: 0,
          targetStatus: 'none',
          context
        },
        {
          index: 1,
          move: tackle,
          effectiveness: 1,
          maxDamage: 12,
          targetStatus: 'none',
          context
        }
      ],
      ['AI_SCRIPT_CHECK_VIABILITY'],
      () => 0
    );

    expect(decision?.selectedIndex).toBe(1);
    expect(decision?.scoredMoves.every((entry) => entry.unsupportedOpcodes.length === 0)).toBe(true);
  });

  test('bad-move script uses decomp gender checks for Attract', () => {
    const battle = createBattleState();
    const user = {
      ...battle.wildMon,
      gender: 'male' as const
    };
    const target = {
      ...battle.playerMon,
      gender: 'male' as const
    };
    const attract = makeMove('ATTRACT', 'EFFECT_ATTRACT', 0, 'normal');
    const tackle = makeMove('TACKLE', 'EFFECT_HIT', 35, 'normal');
    const context = makeContext(user, target, [attract, tackle]);

    const decision = chooseTrainerMoveIndex(
      [
        {
          index: 0,
          move: attract,
          effectiveness: 1,
          maxDamage: 0,
          targetStatus: 'none',
          context
        },
        {
          index: 1,
          move: tackle,
          effectiveness: 1,
          maxDamage: 12,
          targetStatus: 'none',
          context
        }
      ],
      ['AI_SCRIPT_CHECK_BAD_MOVE'],
      () => 0
    );

    expect(decision?.selectedIndex).toBe(1);
    expect(decision?.scoredMoves.find((entry) => entry.index === 0)?.unsupportedOpcodes).toEqual([]);
  });

  test('viability script uses party status checks for Heal Bell', () => {
    const battle = createBattleState();
    const healBell = makeMove('HEAL_BELL', 'EFFECT_HEAL_BELL', 0, 'normal');
    const contextWithoutPartyStatus = makeContext(battle.wildMon, battle.playerMon, [healBell]);
    const contextWithPartyStatus = {
      ...contextWithoutPartyStatus,
      targetParty: [
        battle.playerMon,
        {
          ...battle.playerMon,
          species: 'PIDGEY',
          status: 'paralysis' as const
        }
      ],
      targetPartyAliveCount: 2
    };

    const withoutPartyStatus = chooseTrainerMoveIndex(
      [{
        index: 0,
        move: healBell,
        effectiveness: 1,
        maxDamage: 0,
        targetStatus: 'none',
        context: contextWithoutPartyStatus
      }],
      ['AI_SCRIPT_CHECK_VIABILITY'],
      () => 0
    );
    const withPartyStatus = chooseTrainerMoveIndex(
      [{
        index: 0,
        move: healBell,
        effectiveness: 1,
        maxDamage: 0,
        targetStatus: 'none',
        context: contextWithPartyStatus
      }],
      ['AI_SCRIPT_CHECK_VIABILITY'],
      () => 0
    );

    expect(withPartyStatus?.scoredMoves[0]?.score).toBeGreaterThan(withoutPartyStatus?.scoredMoves[0]?.score ?? 0);
    expect(withPartyStatus?.scoredMoves[0]?.unsupportedOpcodes).toEqual([]);
  });

  test('bad-move script sees battle-wide sport status flags', () => {
    const battle = createBattleState();
    const mudSport = makeMove('MUD_SPORT', 'EFFECT_MUD_SPORT', 0, 'ground');
    const context = makeContext(battle.wildMon, battle.playerMon, [mudSport]);
    const alreadyActiveContext = {
      ...context,
      mudSport: true
    };

    const beforeSport = chooseTrainerMoveIndex(
      [{
        index: 0,
        move: mudSport,
        effectiveness: 1,
        maxDamage: 0,
        targetStatus: 'none',
        context
      }],
      ['AI_SCRIPT_CHECK_BAD_MOVE'],
      () => 0
    );
    const afterSport = chooseTrainerMoveIndex(
      [{
        index: 0,
        move: mudSport,
        effectiveness: 1,
        maxDamage: 0,
        targetStatus: 'none',
        context: alreadyActiveContext
      }],
      ['AI_SCRIPT_CHECK_BAD_MOVE'],
      () => 0
    );

    expect(afterSport?.scoredMoves[0]?.score).toBeLessThan(beforeSport?.scoredMoves[0]?.score ?? 0);
    expect(afterSport?.scoredMoves[0]?.unsupportedOpcodes).toEqual([]);
  });

  test('safari AI executes flee/watch commands without unsupported opcodes', () => {
    const battle = createBattleState();
    const tackle = makeMove('TACKLE', 'EFFECT_HIT', 35, 'normal');
    const context = {
      ...makeContext(battle.wildMon, battle.playerMon, [tackle]),
      safariEscapeFactor: 20
    };

    const decision = chooseTrainerMoveIndex(
      [{
        index: 0,
        move: tackle,
        effectiveness: 1,
        maxDamage: 12,
        targetStatus: 'none',
        context
      }],
      ['AI_SCRIPT_SAFARI'],
      () => 0
    );

    expect(decision?.scoredMoves[0]?.visitedLabels).toContain('AI_Safari');
    expect(decision?.scoredMoves[0]?.unsupportedOpcodes).toEqual([]);
  });

  test('trainer item AI uses parsed decomp item effects and conserves later items by party count', () => {
    const battle = createBattleState();
    const active = {
      ...battle.wildMon,
      hp: 5,
      maxHp: 60
    };
    const party = [
      active,
      { ...battle.wildMon, species: 'STARYU', hp: 20 },
      { ...battle.wildMon, species: 'STARMIE', hp: 40 }
    ];

    expect(chooseTrainerAiItemDecision({
      active,
      party,
      sideState: battle.sideState.opponent,
      trainerItems: ['ITEM_FULL_HEAL', 'ITEM_SUPER_POTION']
    })).toBeNull();

    const decision = chooseTrainerAiItemDecision({
      active,
      party,
      sideState: battle.sideState.opponent,
      trainerItems: ['ITEM_SUPER_POTION', 'ITEM_FULL_HEAL']
    });

    expect(decision).toMatchObject({
      itemId: 'ITEM_SUPER_POTION',
      itemIndex: 0,
      kind: 'healHp',
      healAmount: 50,
      aiItemType: 'AI_ITEM_HEAL_HP',
      aiItemFlags: ['healHp']
    });
  });

  test('trainer item AI exposes decomp item flags for X items and status cures', () => {
    const battle = createBattleState();
    const active = {
      ...battle.wildMon,
      status: 'burn' as const,
      volatile: {
        ...battle.wildMon.volatile,
        activeTurns: 0
      }
    };

    expect(chooseTrainerAiItemDecision({
      active,
      party: [active],
      sideState: battle.sideState.opponent,
      trainerItems: ['ITEM_FULL_HEAL']
    })).toMatchObject({
      kind: 'cureCondition',
      aiItemType: 'AI_ITEM_CURE_CONDITION',
      aiItemFlags: ['burn']
    });

    expect(chooseTrainerAiItemDecision({
      active: { ...active, status: 'none' as const },
      party: [active],
      sideState: battle.sideState.opponent,
      trainerItems: ['ITEM_X_ATTACK']
    })).toMatchObject({
      kind: 'xAttack',
      aiItemType: 'AI_ITEM_X_STAT',
      aiItemFlags: ['attack']
    });
  });
});
