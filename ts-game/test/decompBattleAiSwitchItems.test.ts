import { describe, expect, test } from 'vitest';
import {
  ABILITY_FLASH_FIRE,
  ABILITY_NATURAL_CURE,
  ABILITY_NONE,
  ABILITY_VOLT_ABSORB,
  ABILITY_WONDER_GUARD,
  AI_ITEM_CURE_CONDITION,
  AI_ITEM_HEAL_HP,
  AI_TrySwitchOrUseItem,
  B_ACTION_SWITCH,
  B_ACTION_USE_ITEM,
  B_ACTION_USE_MOVE,
  BATTLE_TYPE_DOUBLE,
  FindMonThatAbsorbsOpponentsMove,
  GetAI_ItemType,
  GetItemEffectParamOffset,
  GetMostSuitableMonToSwitchInto,
  HasSuperEffectiveMoveAgainstOpponents,
  ITEM3_SLEEP,
  ITEM4_HEAL_HP,
  ITEM_NONE,
  ITEM_POTION,
  MOVE_NONE,
  MOVE_RESULT_DOESNT_AFFECT_FOE,
  MOVE_RESULT_NOT_VERY_EFFECTIVE,
  MOVE_RESULT_SUPER_EFFECTIVE,
  ModulateByTypeEffectiveness,
  PARTY_SIZE,
  ShouldSwitch,
  ShouldSwitchIfNaturalCure,
  ShouldSwitchIfPerishSong,
  ShouldSwitchIfWonderGuard,
  STATUS1_SLEEP,
  STATUS2_WRAPPED,
  STATUS3_PERISH_SONG,
  TYPE_ELECTRIC,
  TYPE_ENDTABLE,
  TYPE_FIRE,
  TYPE_FLYING,
  TYPE_GROUND,
  TYPE_MUL_NO_EFFECT,
  TYPE_MUL_NOT_EFFECTIVE,
  TYPE_MUL_SUPER_EFFECTIVE,
  TYPE_NORMAL,
  TYPE_ROCK,
  TYPE_STEEL,
  TYPE_WATER,
  createBattleAiMon,
  createBattleAiSwitchItemsRuntime
} from '../src/game/decompBattleAiSwitchItems';

const viableParty = () => [
  createBattleAiMon({ hp: 10, species: 1, speciesOrEgg: 1 }),
  createBattleAiMon({ hp: 10, species: 2, speciesOrEgg: 2 }),
  createBattleAiMon({ hp: 10, species: 3, speciesOrEgg: 3 }),
  createBattleAiMon({ hp: 10, species: 4, speciesOrEgg: 4 }),
  createBattleAiMon({ hp: 10, species: 5, speciesOrEgg: 5 }),
  createBattleAiMon({ hp: 10, species: 6, speciesOrEgg: 6 })
];

const speciesInfoFor = (species: number[]) =>
  Object.fromEntries(
    species.map((id) => [
      id,
      { abilities: [ABILITY_NONE, ABILITY_NONE], types: [TYPE_NORMAL, TYPE_NORMAL] }
    ])
  );

describe('decomp battle AI switch/items parity', () => {
  test('ShouldSwitchIfPerishSong writes the party-size sentinel and emits switch action', () => {
    const runtime = createBattleAiSwitchItemsRuntime({
      gStatuses3: [0, STATUS3_PERISH_SONG, 0, 0],
      gDisableStructs: [
        { perishSongTimer: 1, isFirstTurn: false },
        { perishSongTimer: 0, isFirstTurn: false },
        { perishSongTimer: 1, isFirstTurn: false },
        { perishSongTimer: 1, isFirstTurn: false }
      ]
    });

    expect(ShouldSwitchIfPerishSong(runtime)).toBe(true);
    expect(runtime.gBattleStruct.AI_monToSwitchIntoId[0]).toBe(PARTY_SIZE);
    expect(runtime.controllerActions.at(-1)).toEqual({ bufferId: 1, action: B_ACTION_SWITCH, value: 0 });
  });

  test('ShouldSwitchIfWonderGuard refuses if active mon already has a super-effective move, otherwise picks party mon by RNG', () => {
    const runtime = createBattleAiSwitchItemsRuntime({
      gBattleMons: [
        createBattleAiMon({ species: 25, ability: ABILITY_WONDER_GUARD }),
        createBattleAiMon({ moves: [10, MOVE_NONE, MOVE_NONE, MOVE_NONE] }),
        createBattleAiMon(),
        createBattleAiMon()
      ],
      gEnemyParty: viableParty().map((mon, index) =>
        index === 2 ? { ...mon, moves: [22, MOVE_NONE, MOVE_NONE, MOVE_NONE] } : mon
      ),
      gBattlerPartyIndexes: [0, 0, 0, 0],
      randomValues: [1],
      aiTypeCalc: (move) => (move === 22 ? MOVE_RESULT_SUPER_EFFECTIVE : 0)
    });

    expect(ShouldSwitchIfWonderGuard(runtime)).toBe(true);
    expect(runtime.gBattleStruct.AI_monToSwitchIntoId[0]).toBe(2);
    expect(runtime.controllerActions.at(-1)?.action).toBe(B_ACTION_SWITCH);

    const alreadyCovered = createBattleAiSwitchItemsRuntime({
      gBattleMons: [
        createBattleAiMon({ species: 25, ability: ABILITY_WONDER_GUARD }),
        createBattleAiMon({ moves: [22, MOVE_NONE, MOVE_NONE, MOVE_NONE] }),
        createBattleAiMon(),
        createBattleAiMon()
      ],
      aiTypeCalc: () => MOVE_RESULT_SUPER_EFFECTIVE
    });
    expect(ShouldSwitchIfWonderGuard(alreadyCovered)).toBe(false);
  });

  test('FindMonThatAbsorbsOpponentsMove maps the last landed move type to the matching absorbing ability', () => {
    const runtime = createBattleAiSwitchItemsRuntime({
      gEnemyParty: viableParty().map((mon, index) =>
        index === 3 ? { ...mon, species: 30, abilityNum: 1 } : mon
      ),
      gSpeciesInfo: {
        ...speciesInfoFor([1, 2, 3, 4, 5, 6]),
        30: { abilities: [ABILITY_NONE, ABILITY_VOLT_ABSORB], types: [TYPE_NORMAL, TYPE_NORMAL] }
      },
      gLastLandedMoves: [MOVE_NONE, 50, MOVE_NONE, MOVE_NONE],
      gBattleMoves: { 50: { power: 40, type: TYPE_ELECTRIC } },
      randomValues: [1],
      aiTypeCalc: () => 0
    });

    expect(FindMonThatAbsorbsOpponentsMove(runtime)).toBe(true);
    expect(runtime.gBattleStruct.AI_monToSwitchIntoId[0]).toBe(3);
  });

  test('Natural Cure follows the C branch order before searching party matchups', () => {
    const runtime = createBattleAiSwitchItemsRuntime({
      gBattleMons: [
        createBattleAiMon(),
        createBattleAiMon({ hp: 60, maxHP: 100, status1: STATUS1_SLEEP, ability: ABILITY_NATURAL_CURE }),
        createBattleAiMon(),
        createBattleAiMon()
      ],
      gLastLandedMoves: [MOVE_NONE, MOVE_NONE, MOVE_NONE, MOVE_NONE],
      randomValues: [1]
    });

    expect(ShouldSwitchIfNaturalCure(runtime)).toBe(true);
    expect(runtime.gBattleStruct.AI_monToSwitchIntoId[0]).toBe(PARTY_SIZE);
    expect(runtime.controllerActions.at(-1)?.action).toBe(B_ACTION_SWITCH);
  });

  test('HasSuperEffectiveMoveAgainstOpponents consumes RNG only when noRng is false', () => {
    const runtime = createBattleAiSwitchItemsRuntime({
      gBattleMons: [
        createBattleAiMon({ species: 1 }),
        createBattleAiMon({ moves: [99, MOVE_NONE, MOVE_NONE, MOVE_NONE] }),
        createBattleAiMon(),
        createBattleAiMon()
      ],
      randomValues: [0, 2],
      aiTypeCalc: () => MOVE_RESULT_SUPER_EFFECTIVE
    });

    expect(HasSuperEffectiveMoveAgainstOpponents(runtime, false)).toBe(false);
    expect(HasSuperEffectiveMoveAgainstOpponents(runtime, false)).toBe(true);

    const noRng = createBattleAiSwitchItemsRuntime({
      gBattleMons: runtime.gBattleMons,
      randomValues: [0],
      aiTypeCalc: () => MOVE_RESULT_SUPER_EFFECTIVE
    });
    expect(HasSuperEffectiveMoveAgainstOpponents(noRng, true)).toBe(true);
    expect(noRng.randomValues).toEqual([0]);
  });

  test('ShouldSwitch respects trapping before considering available party members', () => {
    const runtime = createBattleAiSwitchItemsRuntime({
      gBattleMons: [
        createBattleAiMon(),
        createBattleAiMon({ status2: STATUS2_WRAPPED }),
        createBattleAiMon(),
        createBattleAiMon()
      ],
      gEnemyParty: viableParty()
    });

    expect(ShouldSwitch(runtime)).toBe(false);
    expect(runtime.controllerActions).toEqual([]);
  });

  test('ModulateByTypeEffectiveness applies type1/type2 multipliers in table order', () => {
    const runtime = createBattleAiSwitchItemsRuntime({
      gTypeEffectiveness: [
        [TYPE_FIRE, TYPE_STEEL, TYPE_MUL_SUPER_EFFECTIVE],
        [TYPE_FIRE, TYPE_ROCK, TYPE_MUL_NOT_EFFECTIVE],
        [TYPE_ELECTRIC, TYPE_GROUND, TYPE_MUL_NO_EFFECT],
        [TYPE_ENDTABLE, TYPE_ENDTABLE, TYPE_MUL_NO_EFFECT]
      ]
    });

    expect(ModulateByTypeEffectiveness(runtime, TYPE_FIRE, TYPE_STEEL, TYPE_ROCK, 10)).toBe(10);
    expect(ModulateByTypeEffectiveness(runtime, TYPE_ELECTRIC, TYPE_GROUND, TYPE_FLYING, 10)).toBe(0);
  });

  test('GetMostSuitableMonToSwitchInto prefers typing plus a super-effective move, then falls back to damage', () => {
    const runtime = createBattleAiSwitchItemsRuntime({
      gBattleMons: [
        createBattleAiMon({ type1: TYPE_FIRE, type2: TYPE_FIRE }),
        createBattleAiMon(),
        createBattleAiMon(),
        createBattleAiMon()
      ],
      gEnemyParty: viableParty().map((mon, index) => ({
        ...mon,
        species: index + 10,
        moves: index === 2 ? [200, MOVE_NONE, MOVE_NONE, MOVE_NONE] : [100 + index, MOVE_NONE, MOVE_NONE, MOVE_NONE]
      })),
      gSpeciesInfo: {
        10: { abilities: [ABILITY_NONE, ABILITY_NONE], types: [TYPE_NORMAL, TYPE_NORMAL] },
        11: { abilities: [ABILITY_NONE, ABILITY_NONE], types: [TYPE_STEEL, TYPE_STEEL] },
        12: { abilities: [ABILITY_NONE, ABILITY_NONE], types: [TYPE_WATER, TYPE_WATER] },
        13: { abilities: [ABILITY_NONE, ABILITY_NONE], types: [TYPE_ROCK, TYPE_ROCK] },
        14: { abilities: [ABILITY_NONE, ABILITY_NONE], types: [TYPE_NORMAL, TYPE_NORMAL] },
        15: { abilities: [ABILITY_NONE, ABILITY_NONE], types: [TYPE_NORMAL, TYPE_NORMAL] }
      },
      gTypeEffectiveness: [
        [TYPE_FIRE, TYPE_STEEL, TYPE_MUL_SUPER_EFFECTIVE],
        [TYPE_FIRE, TYPE_WATER, TYPE_MUL_NOT_EFFECTIVE],
        [TYPE_FIRE, TYPE_ROCK, TYPE_MUL_NOT_EFFECTIVE],
        [TYPE_ENDTABLE, TYPE_ENDTABLE, TYPE_MUL_NO_EFFECT]
      ],
      typeCalc: (move) => (move === 200 ? MOVE_RESULT_SUPER_EFFECTIVE : 0)
    });

    expect(GetMostSuitableMonToSwitchInto(runtime)).toBe(2);

    const fallback = createBattleAiSwitchItemsRuntime({
      gEnemyParty: viableParty().map((mon, index) => ({
        ...mon,
        species: index + 20,
        moves: [300 + index, MOVE_NONE, MOVE_NONE, MOVE_NONE]
      })),
      gSpeciesInfo: Object.fromEntries(
        Array.from({ length: 6 }, (_, index) => [
          index + 20,
          { abilities: [ABILITY_NONE, ABILITY_NONE], types: [TYPE_NORMAL, TYPE_NORMAL] }
        ])
      ),
      gBattleMoves: Object.fromEntries(Array.from({ length: 6 }, (_, index) => [300 + index, { power: 40, type: TYPE_NORMAL }])),
      aiCalcDmg: () => 0,
      typeCalc: () => 0
    });
    fallback.aiCalcDmg = () => {
      fallback.gBattleMoveDamage = 55;
      return 55;
    };
    fallback.gBattleStruct.monToSwitchIntoId[1] = PARTY_SIZE;
    expect(GetMostSuitableMonToSwitchInto(fallback)).toBe(1);
  });

  test('AI_TrySwitchOrUseItem uses trainer items with the exact item type, flag, and history mutations', () => {
    const potionEffect = [0, 0, 0, 0, ITEM4_HEAL_HP, 0, 20];
    const runtime = createBattleAiSwitchItemsRuntime({
      gBattleMons: [
        createBattleAiMon(),
        createBattleAiMon({ hp: 10, maxHP: 100 }),
        createBattleAiMon(),
        createBattleAiMon()
      ],
      gEnemyParty: viableParty(),
      gBattleResources: {
        battleHistory: {
          itemsNo: 1,
          trainerItems: [ITEM_POTION, ITEM_NONE, ITEM_NONE, ITEM_NONE]
        }
      },
      gItemEffectTable: {
        0: potionEffect
      }
    });

    AI_TrySwitchOrUseItem(runtime);

    expect(GetAI_ItemType(ITEM_POTION, potionEffect)).toBe(AI_ITEM_HEAL_HP);
    expect(GetItemEffectParamOffset(runtime, ITEM_POTION, 4, 4)).toBe(6);
    expect(runtime.controllerActions.at(-1)).toEqual({ bufferId: 1, action: B_ACTION_USE_ITEM, value: 0 });
    expect(runtime.gBattleStruct.chosenItem[0]).toBe(ITEM_POTION);
    expect(runtime.gBattleResources.battleHistory.trainerItems[0]).toBe(ITEM_NONE);
  });

  test('AI_TrySwitchOrUseItem records cure-condition flags and defaults to use move outside trainer battles', () => {
    const awakeningEffect = [0, 0, 0, ITEM3_SLEEP, 0, 0];
    const runtime = createBattleAiSwitchItemsRuntime({
      gBattleMons: [
        createBattleAiMon(),
        createBattleAiMon({ hp: 80, maxHP: 100, status1: STATUS1_SLEEP }),
        createBattleAiMon(),
        createBattleAiMon()
      ],
      gEnemyParty: viableParty(),
      gBattleResources: {
        battleHistory: {
          itemsNo: 1,
          trainerItems: [ITEM_POTION + 1, ITEM_NONE, ITEM_NONE, ITEM_NONE]
        }
      },
      gItemEffectTable: {
        1: awakeningEffect
      }
    });

    AI_TrySwitchOrUseItem(runtime);

    expect(runtime.gBattleStruct.AI_itemType[0]).toBe(AI_ITEM_CURE_CONDITION);
    expect(runtime.gBattleStruct.AI_itemFlags[0]).toBe(0x20);
    expect(runtime.controllerActions.at(-1)?.action).toBe(B_ACTION_USE_ITEM);

    const wildRuntime = createBattleAiSwitchItemsRuntime({ gBattleTypeFlags: BATTLE_TYPE_DOUBLE });
    AI_TrySwitchOrUseItem(wildRuntime);
    expect(wildRuntime.controllerActions.at(-1)).toEqual({
      bufferId: 1,
      action: B_ACTION_USE_MOVE,
      value: (wildRuntime.gActiveBattler ^ 1) << 8
    });
  });

  test('FindMonWithFlags path is reachable through ShouldSwitch when active moves are not already favored', () => {
    const runtime = createBattleAiSwitchItemsRuntime({
      gEnemyParty: viableParty().map((mon, index) =>
        index === 4 ? { ...mon, species: 40, moves: [444, MOVE_NONE, MOVE_NONE, MOVE_NONE] } : mon
      ),
      gSpeciesInfo: {
        ...speciesInfoFor([1, 2, 3, 4, 5, 6]),
        40: { abilities: [ABILITY_FLASH_FIRE, ABILITY_FLASH_FIRE], types: [TYPE_FIRE, TYPE_FIRE] }
      },
      gLastLandedMoves: [MOVE_NONE, 333, MOVE_NONE, MOVE_NONE],
      gLastHitBy: [0xff, 0, 0xff, 0xff],
      gBattleMoves: { 333: { power: 40, type: TYPE_NORMAL } },
      randomValues: [1],
      aiTypeCalc: (move) => {
        if (move === 333) {
          return MOVE_RESULT_NOT_VERY_EFFECTIVE | MOVE_RESULT_DOESNT_AFFECT_FOE;
        }
        if (move === 444) {
          return MOVE_RESULT_SUPER_EFFECTIVE;
        }
        return 0;
      }
    });

    expect(ShouldSwitch(runtime)).toBe(true);
    expect(runtime.gBattleStruct.AI_monToSwitchIntoId[0]).toBe(4);
  });
});
