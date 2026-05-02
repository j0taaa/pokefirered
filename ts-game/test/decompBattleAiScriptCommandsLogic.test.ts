import { describe, expect, test } from 'vitest';
import {
  AI_ACTION_DONE,
  AI_ACTION_DO_NOT_ATTACK,
  AI_ACTION_FLEE,
  AI_ACTION_WATCH,
  AI_EFFECTIVENESS_x2,
  ABILITY_ARENA_TRAP,
  ABILITY_MAGNET_PULL,
  ABILITY_SHADOW_TAG,
  AIStackPop,
  AIStackPushVar,
  AIStackPushVar_cursor,
  AI_TYPE1_TARGET,
  AI_TYPE1_USER,
  AI_TYPE2_TARGET,
  AI_TYPE2_USER,
  AI_TYPE_MOVE,
  AI_TARGET,
  AI_TARGET_PARTNER,
  AI_USER,
  AI_USER_PARTNER,
  BATTLE_TYPE_DOUBLE,
  B_WEATHER_HAIL_TEMPORARY,
  B_WEATHER_RAIN,
  B_WEATHER_SANDSTORM,
  B_WEATHER_SUN,
  Cmd_call,
  Cmd_end,
  Cmd_flee,
  Cmd_get_considered_move,
  Cmd_get_considered_move_effect,
  Cmd_get_considered_move_power,
  Cmd_get_ability,
  Cmd_get_highest_type_effectiveness,
  Cmd_get_how_powerful_move_is,
  Cmd_get_last_used_battler_move,
  Cmd_get_turn_count,
  Cmd_get_type,
  Cmd_get_used_held_item,
  Cmd_get_weather,
  Cmd_goto,
  Cmd_count_alive_pokemon,
  Cmd_get_gender,
  Cmd_get_hold_effect,
  Cmd_get_move_effect_from_result,
  Cmd_get_move_power_from_result,
  Cmd_get_move_type_from_result,
  Cmd_get_protect_count,
  Cmd_get_stockpile_count,
  Cmd_if_equal,
  Cmd_if_equal_,
  Cmd_if_equal_ptr,
  Cmd_if_effect,
  Cmd_if_doesnt_have_move,
  Cmd_if_doesnt_have_move_with_effect,
  Cmd_if_can_faint,
  Cmd_if_cant_faint,
  Cmd_if_has_move,
  Cmd_if_has_move_with_effect,
  Cmd_if_hp_equal,
  Cmd_if_hp_less_than,
  Cmd_if_hp_more_than,
  Cmd_if_hp_not_equal,
  Cmd_if_any_move_disabled_or_encored,
  Cmd_if_curr_move_disabled_or_encored,
  Cmd_if_in_bytes,
  Cmd_if_in_hwords,
  Cmd_if_less_than,
  Cmd_if_less_than_ptr,
  Cmd_if_more_than,
  Cmd_if_more_than_ptr,
  Cmd_if_move,
  Cmd_if_not_in_bytes,
  Cmd_if_not_in_hwords,
  Cmd_if_not_equal,
  Cmd_if_not_equal_,
  Cmd_if_not_equal_ptr,
  Cmd_if_not_effect,
  Cmd_if_not_move,
  Cmd_if_not_side_affecting,
  Cmd_if_not_status,
  Cmd_if_not_status2,
  Cmd_if_not_status3,
  Cmd_if_level_compare,
  Cmd_if_random_safari_flee,
  Cmd_if_status_in_party,
  Cmd_if_status_not_in_party,
  Cmd_if_random_equal,
  Cmd_if_random_greater_than,
  Cmd_if_random_less_than,
  Cmd_if_random_not_equal,
  Cmd_if_side_affecting,
  Cmd_if_stat_level_equal,
  Cmd_if_stat_level_less_than,
  Cmd_if_stat_level_more_than,
  Cmd_if_stat_level_not_equal,
  Cmd_if_status,
  Cmd_if_status2,
  Cmd_if_status3,
  Cmd_if_type_effectiveness,
  Cmd_if_user_has_attacking_move,
  Cmd_if_user_has_no_attacking_moves,
  Cmd_if_target_not_taunted,
  Cmd_if_target_taunted,
  Cmd_if_would_go_first,
  Cmd_if_would_not_go_first,
  Cmd_is_first_turn_for,
  Cmd_is_double_battle,
  Cmd_nullsub_2A,
  Cmd_score,
  Cmd_watch,
  MOVE_MOST_POWERFUL,
  MOVE_NOT_MOST_POWERFUL,
  MOVE_POWER_DISCOURAGED,
  MOVE_RESULT_DOESNT_AFFECT_FOE,
  WEATHER_TYPE_HAIL,
  WEATHER_TYPE_RAIN,
  WEATHER_TYPE_SANDSTORM,
  WEATHER_TYPE_SUNNY,
  createBattleAiScriptCommandsRuntime
} from '../src/game/decompBattleAiScriptCommands';

describe('decomp battle_ai_script_commands executable command slice', () => {
  test('random branch commands match C pointer advance behavior', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, 64, 0, 0, 0, 0],
      pointers: { 2: 42 },
      randomValues: [63]
    });
    Cmd_if_random_less_than(runtime);
    expect(runtime.sAIScriptPtr).toBe(42);

    runtime.sAIScriptPtr = 0;
    runtime.randomValues = [64];
    Cmd_if_random_less_than(runtime);
    expect(runtime.sAIScriptPtr).toBe(6);

    runtime.sAIScriptPtr = 0;
    runtime.randomValues = [65];
    Cmd_if_random_greater_than(runtime);
    expect(runtime.sAIScriptPtr).toBe(42);

    runtime.sAIScriptPtr = 0;
    runtime.randomValues = [64];
    Cmd_if_random_equal(runtime);
    expect(runtime.sAIScriptPtr).toBe(42);

    runtime.sAIScriptPtr = 0;
    runtime.randomValues = [63];
    Cmd_if_random_not_equal(runtime);
    expect(runtime.sAIScriptPtr).toBe(42);
  });

  test('score command updates the selected moveset score and advances by two bytes', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, 7],
      ai: { score: [3, 4, 5, 6], movesetIndex: 2, funcResult: 0, aiAction: 0 }
    });
    Cmd_score(runtime);
    expect(runtime.ai.score).toEqual([3, 4, 12, 6]);
    expect(runtime.sAIScriptPtr).toBe(2);
  });

  test('immediate funcResult comparisons branch or skip exactly like C', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, 10, 0, 0, 0, 0],
      pointers: { 2: 77 },
      ai: { score: [0, 0, 0, 0], movesetIndex: 0, funcResult: 9, aiAction: 0 }
    });
    Cmd_if_less_than(runtime);
    expect(runtime.sAIScriptPtr).toBe(77);

    runtime.sAIScriptPtr = 0;
    runtime.ai.funcResult = 11;
    Cmd_if_more_than(runtime);
    expect(runtime.sAIScriptPtr).toBe(77);

    runtime.sAIScriptPtr = 0;
    runtime.ai.funcResult = 10;
    Cmd_if_equal(runtime);
    expect(runtime.sAIScriptPtr).toBe(77);

    runtime.sAIScriptPtr = 0;
    runtime.ai.funcResult = 12;
    Cmd_if_not_equal(runtime);
    expect(runtime.sAIScriptPtr).toBe(77);

    runtime.sAIScriptPtr = 0;
    runtime.ai.funcResult = 10;
    Cmd_if_not_equal(runtime);
    expect(runtime.sAIScriptPtr).toBe(6);
  });

  test('pointer funcResult comparisons read the value pointer then branch pointer', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: Array.from({ length: 64 }, () => 0),
      pointers: { 1: 50, 5: 91 },
      ai: { score: [0, 0, 0, 0], movesetIndex: 0, funcResult: 8, aiAction: 0 }
    });
    runtime.script[50] = 9;
    Cmd_if_less_than_ptr(runtime);
    expect(runtime.sAIScriptPtr).toBe(91);

    runtime.sAIScriptPtr = 0;
    runtime.ai.funcResult = 10;
    Cmd_if_more_than_ptr(runtime);
    expect(runtime.sAIScriptPtr).toBe(91);

    runtime.sAIScriptPtr = 0;
    runtime.ai.funcResult = 9;
    Cmd_if_equal_ptr(runtime);
    expect(runtime.sAIScriptPtr).toBe(91);

    runtime.sAIScriptPtr = 0;
    runtime.ai.funcResult = 7;
    Cmd_if_not_equal_ptr(runtime);
    expect(runtime.sAIScriptPtr).toBe(91);

    runtime.sAIScriptPtr = 0;
    runtime.ai.funcResult = 9;
    Cmd_if_not_equal_ptr(runtime);
    expect(runtime.sAIScriptPtr).toBe(9);
  });

  test('call, goto, and end preserve the C stack semantics', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      pointers: { 5: 30 },
      sAIScriptPtr: 4
    });
    AIStackPushVar(runtime, 99);
    expect(runtime.AI_ScriptsStack).toMatchObject({ ptr: [99], size: 1 });
    expect(AIStackPop(runtime)).toBe(true);
    expect(runtime.sAIScriptPtr).toBe(99);

    runtime.sAIScriptPtr = 4;
    Cmd_call(runtime);
    expect(runtime.sAIScriptPtr).toBe(30);
    expect(runtime.AI_ScriptsStack.ptr[0]).toBe(9);
    expect(runtime.AI_ScriptsStack.size).toBe(1);

    Cmd_end(runtime);
    expect(runtime.sAIScriptPtr).toBe(9);
    expect(runtime.ai.aiAction & AI_ACTION_DONE).toBe(0);

    Cmd_end(runtime);
    expect(runtime.ai.aiAction & AI_ACTION_DONE).toBe(AI_ACTION_DONE);

    runtime.sAIScriptPtr = 0;
    runtime.pointers[1] = 123;
    Cmd_goto(runtime);
    expect(runtime.sAIScriptPtr).toBe(123);
  });

  test('simple action and getter commands mutate the same AI fields as C', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      sAIScriptPtr: 12,
      battleTurnCounter: 5,
      gBattleMoves: { 33: { effect: 44 } },
      ai: { score: [0, 0, 0, 0], movesetIndex: 0, funcResult: 0, aiAction: 0, moveConsidered: 33 }
    });

    Cmd_flee(runtime);
    expect(runtime.ai.aiAction & (AI_ACTION_DONE | AI_ACTION_FLEE | AI_ACTION_DO_NOT_ATTACK)).toBe(
      AI_ACTION_DONE | AI_ACTION_FLEE | AI_ACTION_DO_NOT_ATTACK
    );

    runtime.ai.aiAction = 0;
    Cmd_watch(runtime);
    expect(runtime.ai.aiAction & (AI_ACTION_DONE | AI_ACTION_WATCH | AI_ACTION_DO_NOT_ATTACK)).toBe(
      AI_ACTION_DONE | AI_ACTION_WATCH | AI_ACTION_DO_NOT_ATTACK
    );

    Cmd_get_turn_count(runtime);
    expect(runtime.ai.funcResult).toBe(5);
    expect(runtime.sAIScriptPtr).toBe(13);

    Cmd_get_considered_move(runtime);
    expect(runtime.ai.funcResult).toBe(33);
    expect(runtime.sAIScriptPtr).toBe(14);

    Cmd_get_considered_move_effect(runtime);
    expect(runtime.ai.funcResult).toBe(44);
    expect(runtime.sAIScriptPtr).toBe(15);

    runtime.gBattleTypeFlags = BATTLE_TYPE_DOUBLE;
    Cmd_is_double_battle(runtime);
    expect(runtime.ai.funcResult).toBe(BATTLE_TYPE_DOUBLE);
    expect(runtime.sAIScriptPtr).toBe(16);
  });

  test('weather command applies the C priority order and nullsub commands are true no-ops', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      sAIScriptPtr: 7,
      gBattleWeather: B_WEATHER_RAIN | B_WEATHER_SANDSTORM | B_WEATHER_SUN | B_WEATHER_HAIL_TEMPORARY
    });
    Cmd_get_weather(runtime);
    expect(runtime.ai.funcResult).toBe(WEATHER_TYPE_HAIL);
    expect(runtime.sAIScriptPtr).toBe(8);

    runtime.gBattleWeather = B_WEATHER_RAIN;
    Cmd_get_weather(runtime);
    expect(runtime.ai.funcResult).toBe(WEATHER_TYPE_RAIN);

    runtime.gBattleWeather = B_WEATHER_SANDSTORM;
    Cmd_get_weather(runtime);
    expect(runtime.ai.funcResult).toBe(WEATHER_TYPE_SANDSTORM);

    runtime.gBattleWeather = B_WEATHER_SUN;
    Cmd_get_weather(runtime);
    expect(runtime.ai.funcResult).toBe(WEATHER_TYPE_SUNNY);

    const before = { ptr: runtime.sAIScriptPtr, funcResult: runtime.ai.funcResult };
    Cmd_nullsub_2A(runtime);
    expect({ ptr: runtime.sAIScriptPtr, funcResult: runtime.ai.funcResult }).toEqual(before);
  });

  test('HP branch commands select user or target and advance by seven bytes', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_USER, 51, 0, 0, 0, 0],
      pointers: { 3: 120 },
      gBattlerAttacker: 2,
      gBattlerTarget: 1,
      gBattleMons: [
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [], statStages: [] },
        { hp: 20, maxHP: 100, type1: 0, type2: 0, moves: [], statStages: [] },
        { hp: 50, maxHP: 100, type1: 0, type2: 0, moves: [], statStages: [] }
      ]
    });
    Cmd_if_hp_less_than(runtime);
    expect(runtime.sAIScriptPtr).toBe(120);

    runtime.sAIScriptPtr = 0;
    runtime.script[2] = 49;
    Cmd_if_hp_more_than(runtime);
    expect(runtime.sAIScriptPtr).toBe(120);

    runtime.sAIScriptPtr = 0;
    runtime.script[2] = 50;
    Cmd_if_hp_equal(runtime);
    expect(runtime.sAIScriptPtr).toBe(120);

    runtime.sAIScriptPtr = 0;
    runtime.script[2] = 50;
    Cmd_if_hp_not_equal(runtime);
    expect(runtime.sAIScriptPtr).toBe(7);
  });

  test('status branch commands read 32-bit masks and advance by ten bytes', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_USER, 0x04, 0, 0, 0, 0, 0, 0, 0],
      pointers: { 6: 140 },
      gBattlerAttacker: 0,
      gBattlerTarget: 1,
      gBattleMons: [
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [], statStages: [], status1: 0x04, status2: 0x08 },
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [], statStages: [], status1: 0, status2: 0 }
      ],
      gStatuses3: [0x10, 0]
    });
    Cmd_if_status(runtime);
    expect(runtime.sAIScriptPtr).toBe(140);

    runtime.sAIScriptPtr = 0;
    Cmd_if_not_status(runtime);
    expect(runtime.sAIScriptPtr).toBe(10);

    runtime.sAIScriptPtr = 0;
    runtime.script[2] = 0x08;
    Cmd_if_status2(runtime);
    expect(runtime.sAIScriptPtr).toBe(140);

    runtime.sAIScriptPtr = 0;
    Cmd_if_not_status2(runtime);
    expect(runtime.sAIScriptPtr).toBe(10);

    runtime.sAIScriptPtr = 0;
    runtime.script[2] = 0x10;
    Cmd_if_status3(runtime);
    expect(runtime.sAIScriptPtr).toBe(140);

    runtime.sAIScriptPtr = 0;
    Cmd_if_not_status3(runtime);
    expect(runtime.sAIScriptPtr).toBe(10);
  });

  test('side-affecting branches use the selected battler side and C pointer layout', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_TARGET, 0x40, 0, 0, 0, 0, 0, 0, 0],
      pointers: { 6: 155 },
      gBattlerAttacker: 0,
      gBattlerTarget: 1,
      battlerSides: [0, 1],
      gSideStatuses: [0x20, 0x40]
    });
    Cmd_if_side_affecting(runtime);
    expect(runtime.sAIScriptPtr).toBe(155);

    runtime.sAIScriptPtr = 0;
    Cmd_if_not_side_affecting(runtime);
    expect(runtime.sAIScriptPtr).toBe(10);

    runtime.sAIScriptPtr = 0;
    runtime.script[2] = 0x80;
    Cmd_if_not_side_affecting(runtime);
    expect(runtime.sAIScriptPtr).toBe(155);
  });

  test('move and effect branch commands use C operand widths', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, 0x34, 0x12, 0, 0, 0, 0],
      pointers: { 3: 77, 2: 88 },
      ai: { moveConsidered: 0x1234 },
      gBattleMoves: { 0x1234: { effect: 9 } }
    });
    Cmd_if_move(runtime);
    expect(runtime.sAIScriptPtr).toBe(77);

    runtime.sAIScriptPtr = 0;
    Cmd_if_not_move(runtime);
    expect(runtime.sAIScriptPtr).toBe(7);

    runtime.sAIScriptPtr = 0;
    runtime.script = [0, 9, 0, 0, 0, 0];
    Cmd_if_effect(runtime);
    expect(runtime.sAIScriptPtr).toBe(88);

    runtime.sAIScriptPtr = 0;
    Cmd_if_not_effect(runtime);
    expect(runtime.sAIScriptPtr).toBe(6);
  });

  test('table membership branches scan byte and hword lists up to C sentinels', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: Array.from({ length: 80 }, () => 0),
      pointers: { 1: 40, 5: 170 },
      ai: { funcResult: 7 }
    });
    runtime.script[40] = 5;
    runtime.script[41] = 7;
    runtime.script[42] = 0xff;

    Cmd_if_in_bytes(runtime);
    expect(runtime.sAIScriptPtr).toBe(170);

    runtime.sAIScriptPtr = 0;
    Cmd_if_not_in_bytes(runtime);
    expect(runtime.sAIScriptPtr).toBe(9);

    runtime.sAIScriptPtr = 0;
    runtime.ai.funcResult = 9;
    Cmd_if_not_in_bytes(runtime);
    expect(runtime.sAIScriptPtr).toBe(170);

    runtime.sAIScriptPtr = 0;
    runtime.pointers[1] = 50;
    runtime.ai.funcResult = 0x1234;
    runtime.script[50] = 0x78;
    runtime.script[51] = 0x56;
    runtime.script[52] = 0x34;
    runtime.script[53] = 0x12;
    runtime.script[54] = 0xff;
    runtime.script[55] = 0xff;
    Cmd_if_in_hwords(runtime);
    expect(runtime.sAIScriptPtr).toBe(170);

    runtime.sAIScriptPtr = 0;
    Cmd_if_not_in_hwords(runtime);
    expect(runtime.sAIScriptPtr).toBe(9);

    runtime.sAIScriptPtr = 0;
    runtime.ai.funcResult = 0x9999;
    Cmd_if_not_in_hwords(runtime);
    expect(runtime.sAIScriptPtr).toBe(170);
  });

  test('attacking-move presence branches check nonzero move power over user moves', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, 0, 0, 0, 0],
      pointers: { 1: 174 },
      gBattlerAttacker: 0,
      gBattleMons: [{ hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [0, 10, 11, 0], statStages: [] }],
      gBattleMoves: { 10: { effect: 1, power: 0 }, 11: { effect: 2, power: 40 } }
    });
    Cmd_if_user_has_attacking_move(runtime);
    expect(runtime.sAIScriptPtr).toBe(174);

    runtime.sAIScriptPtr = 0;
    Cmd_if_user_has_no_attacking_moves(runtime);
    expect(runtime.sAIScriptPtr).toBe(5);

    runtime.sAIScriptPtr = 0;
    runtime.gBattleMons[0].moves = [0, 10, 0, 0];
    Cmd_if_user_has_no_attacking_moves(runtime);
    expect(runtime.sAIScriptPtr).toBe(174);
  });

  test('known move branches check user moves or target battle history exactly like C', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_USER, 0x34, 0x12, 0, 0, 0, 0],
      pointers: { 4: 181 },
      gBattlerAttacker: 0,
      gBattlerTarget: 3,
      gBattleMons: [{ hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [0x1111, 0x1234, 0, 0], statStages: [] }],
      battleHistory: { usedMoves: [[], [0x2222, 0x1234]] }
    });
    Cmd_if_has_move(runtime);
    expect(runtime.sAIScriptPtr).toBe(181);

    runtime.sAIScriptPtr = 0;
    Cmd_if_doesnt_have_move(runtime);
    expect(runtime.sAIScriptPtr).toBe(8);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = AI_TARGET_PARTNER;
    Cmd_if_has_move(runtime);
    expect(runtime.sAIScriptPtr).toBe(181);

    runtime.sAIScriptPtr = 0;
    runtime.script[2] = 0x99;
    runtime.script[3] = 0x99;
    Cmd_if_doesnt_have_move(runtime);
    expect(runtime.sAIScriptPtr).toBe(181);
  });

  test('move-effect possession branches preserve user logic and target selector quirks', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_USER_PARTNER, 6, 0, 0, 0, 0],
      pointers: { 3: 190 },
      gBattlerAttacker: 0,
      gBattlerTarget: 1,
      gBattleMons: [{ hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [10, 11, 0, 0], statStages: [] }],
      gBattleMoves: { 10: { effect: 5 }, 11: { effect: 6 }, 44: { effect: 9 } },
      battleHistory: { usedMoves: [[44]] }
    });
    Cmd_if_has_move_with_effect(runtime);
    expect(runtime.sAIScriptPtr).toBe(190);

    runtime.sAIScriptPtr = 0;
    Cmd_if_doesnt_have_move_with_effect(runtime);
    expect(runtime.sAIScriptPtr).toBe(7);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = AI_TARGET;
    runtime.script[2] = 123;
    Cmd_if_has_move_with_effect(runtime);
    expect(runtime.sAIScriptPtr).toBe(190);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = AI_TARGET_PARTNER;
    Cmd_if_doesnt_have_move_with_effect(runtime);
    expect(runtime.sAIScriptPtr).toBe(7);
  });

  test('last-used move and alias equality branches use the same script layout as C', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_USER, 0, 0, 0, 0],
      pointers: { 2: 196 },
      gBattlerAttacker: 0,
      gBattlerTarget: 1,
      gLastMoves: [22, 33],
      ai: { funcResult: 22 }
    });
    Cmd_get_last_used_battler_move(runtime);
    expect(runtime.ai.funcResult).toBe(22);
    expect(runtime.sAIScriptPtr).toBe(2);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = AI_TARGET;
    Cmd_get_last_used_battler_move(runtime);
    expect(runtime.ai.funcResult).toBe(33);
    expect(runtime.sAIScriptPtr).toBe(2);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = 33;
    Cmd_if_equal_(runtime);
    expect(runtime.sAIScriptPtr).toBe(196);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = 44;
    Cmd_if_not_equal_(runtime);
    expect(runtime.sAIScriptPtr).toBe(196);
  });

  test('strike-order branches compare the stored GetWhoStrikesFirst result', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, 1, 0, 0, 0, 0],
      pointers: { 2: 205 },
      whoStrikesFirstResult: 1
    });
    Cmd_if_would_go_first(runtime);
    expect(runtime.sAIScriptPtr).toBe(205);

    runtime.sAIScriptPtr = 0;
    Cmd_if_would_not_go_first(runtime);
    expect(runtime.sAIScriptPtr).toBe(6);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = 0;
    Cmd_if_would_not_go_first(runtime);
    expect(runtime.sAIScriptPtr).toBe(205);
  });

  test('party status branches preserve FireRed party selection and unused bug behavior', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, 1, 0x20, 0, 0, 0, 0, 0, 0, 0],
      pointers: { 6: 215, 16: 216 },
      gPlayerParty: [
        { species: 25, hp: 10, status: 0x20 },
        { species: 412, hp: 10, status: 0x20 }
      ],
      gEnemyParty: [
        { species: 1, hp: 10, status: 0 },
        { species: 4, hp: 10, status: 0x20 },
        { species: 7, hp: 0, status: 0x20 }
      ]
    });
    Cmd_if_status_in_party(runtime);
    expect(runtime.sAIScriptPtr).toBe(215);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = 0;
    Cmd_if_status_in_party(runtime);
    expect(runtime.sAIScriptPtr).toBe(215);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = 1;
    Cmd_if_status_not_in_party(runtime);
    expect(runtime.sAIScriptPtr).toBe(216);

    runtime.sAIScriptPtr = 0;
    runtime.script[2] = 0x40;
    Cmd_if_status_not_in_party(runtime);
    expect(runtime.sAIScriptPtr).toBe(215);
  });

  test('alive pokemon count excludes battlers currently on field like C', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_USER],
      gBattlerAttacker: 0,
      gBattlerTarget: 1,
      battlerSides: [0, 1, 0, 1],
      gBattlerPartyIndexes: [1, 0, 4, 0],
      battlerPositions: [0, 1, 2, 3],
      battlerAtPositions: [0, 1, 2, 3],
      gBattleTypeFlags: BATTLE_TYPE_DOUBLE,
      gPlayerParty: [
        { species: 25, hp: 10, status: 0 },
        { species: 4, hp: 10, status: 0 },
        { species: 7, hp: 0, status: 0 },
        { species: 412, hp: 10, status: 0 },
        { species: 9, hp: 10, status: 0 },
        { species: 0, hp: 10, status: 0 }
      ]
    });
    Cmd_count_alive_pokemon(runtime);
    expect(runtime.ai.funcResult).toBe(1);
    expect(runtime.sAIScriptPtr).toBe(2);
  });

  test('disabled and encored branches preserve selector modes and active battler checks', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_USER, 0, 0, 0, 0, 0],
      pointers: { 3: 230, 2: 231 },
      gBattlerAttacker: 0,
      gActiveBattler: 1,
      ai: { moveConsidered: 55 },
      gDisableStructs: [
        { disabledMove: 44, encoredMove: 0, isFirstTurn: 0, stockpileCounter: 0, protectUses: 0, tauntTimer: 0 },
        { disabledMove: 55, encoredMove: 66, isFirstTurn: 0, stockpileCounter: 0, protectUses: 0, tauntTimer: 0 }
      ]
    });
    Cmd_if_any_move_disabled_or_encored(runtime);
    expect(runtime.sAIScriptPtr).toBe(230);

    runtime.sAIScriptPtr = 0;
    runtime.script[2] = 1;
    Cmd_if_any_move_disabled_or_encored(runtime);
    expect(runtime.sAIScriptPtr).toBe(7);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = 0;
    Cmd_if_curr_move_disabled_or_encored(runtime);
    expect(runtime.sAIScriptPtr).toBe(231);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = 1;
    Cmd_if_curr_move_disabled_or_encored(runtime);
    expect(runtime.sAIScriptPtr).toBe(6);
  });

  test('safari flee branch applies rock and bait rate adjustments before random comparison', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, 0, 0, 0, 0],
      pointers: { 1: 240 },
      safariRockThrowCounter: 1,
      safariEscapeFactor: 12,
      randomValues: [99]
    });
    Cmd_if_random_safari_flee(runtime);
    expect(runtime.sAIScriptPtr).toBe(240);

    runtime.sAIScriptPtr = 0;
    runtime.safariRockThrowCounter = 0;
    runtime.safariBaitThrowCounter = 1;
    runtime.safariEscapeFactor = 3;
    runtime.randomValues = [5];
    Cmd_if_random_safari_flee(runtime);
    expect(runtime.sAIScriptPtr).toBe(5);
  });

  test('misc battler getters and move-result getters mirror C fields and increments', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_TARGET],
      gBattlerAttacker: 0,
      gBattlerTarget: 1,
      battlerSides: [0, 1],
      gBattleMons: [
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [], statStages: [], item: 10, gender: 1 },
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [], statStages: [], item: 20, gender: 2 }
      ],
      itemHoldEffects: { 20: 77 },
      battleHistory: { usedMoves: [], itemEffects: [55, 66] },
      usedHeldItems: [0, 0, 88],
      gDisableStructs: [
        { disabledMove: 0, encoredMove: 0, isFirstTurn: 3, stockpileCounter: 4, protectUses: 5, tauntTimer: 0 },
        { disabledMove: 0, encoredMove: 0, isFirstTurn: 6, stockpileCounter: 7, protectUses: 8, tauntTimer: 0 }
      ],
      gBattleMoves: { 99: { effect: 11, power: 70, type: 12 } },
      ai: { funcResult: 99 }
    });
    Cmd_get_hold_effect(runtime);
    expect(runtime.ai.funcResult).toBe(77);
    expect(runtime.sAIScriptPtr).toBe(2);

    runtime.sAIScriptPtr = 0;
    Cmd_get_gender(runtime);
    expect(runtime.ai.funcResult).toBe(2);

    runtime.sAIScriptPtr = 0;
    Cmd_is_first_turn_for(runtime);
    expect(runtime.ai.funcResult).toBe(6);

    runtime.sAIScriptPtr = 0;
    Cmd_get_stockpile_count(runtime);
    expect(runtime.ai.funcResult).toBe(7);

    runtime.sAIScriptPtr = 0;
    Cmd_get_protect_count(runtime);
    expect(runtime.ai.funcResult).toBe(8);

    runtime.sAIScriptPtr = 0;
    Cmd_get_used_held_item(runtime);
    expect(runtime.ai.funcResult).toBe(88);

    Cmd_get_move_type_from_result(runtime);
    expect(runtime.ai.funcResult).toBe(0);

    runtime.ai.funcResult = 99;
    Cmd_get_move_power_from_result(runtime);
    expect(runtime.ai.funcResult).toBe(70);

    runtime.ai.funcResult = 99;
    Cmd_get_move_effect_from_result(runtime);
    expect(runtime.ai.funcResult).toBe(11);
  });

  test('level, taunt, and cursor stack commands preserve C branch layouts', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, 0, 0, 0, 0, 0],
      pointers: { 2: 250, 1: 251 },
      gBattlerAttacker: 0,
      gBattlerTarget: 1,
      gBattleMons: [
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [], statStages: [], level: 50 },
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [], statStages: [], level: 40 }
      ],
      gDisableStructs: [
        { disabledMove: 0, encoredMove: 0, isFirstTurn: 0, stockpileCounter: 0, protectUses: 0, tauntTimer: 0 },
        { disabledMove: 0, encoredMove: 0, isFirstTurn: 0, stockpileCounter: 0, protectUses: 0, tauntTimer: 2 }
      ]
    });
    Cmd_if_level_compare(runtime);
    expect(runtime.sAIScriptPtr).toBe(250);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = 1;
    Cmd_if_level_compare(runtime);
    expect(runtime.sAIScriptPtr).toBe(6);

    runtime.sAIScriptPtr = 0;
    Cmd_if_target_taunted(runtime);
    expect(runtime.sAIScriptPtr).toBe(251);

    runtime.sAIScriptPtr = 0;
    Cmd_if_target_not_taunted(runtime);
    expect(runtime.sAIScriptPtr).toBe(5);

    runtime.sAIScriptPtr = 42;
    AIStackPushVar_cursor(runtime);
    expect(runtime.AI_ScriptsStack).toMatchObject({ ptr: [42], size: 1 });
  });

  test('ability getter preserves battle-history, trapping ability, species guess, and own-side paths', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_TARGET],
      battlerSides: [1, AI_TARGET],
      gBattlerAttacker: 0,
      gBattlerTarget: 1,
      gBattleMons: [
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [], statStages: [], ability: 12, species: 1 },
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [], statStages: [], ability: 0, species: 25 }
      ],
      battleHistory: { usedMoves: [], abilities: [ABILITY_SHADOW_TAG] },
      speciesInfoAbilities: { 25: [ABILITY_MAGNET_PULL, ABILITY_ARENA_TRAP] },
      randomValues: [1]
    });
    Cmd_get_ability(runtime);
    expect(runtime.ai.funcResult).toBe(ABILITY_SHADOW_TAG);
    expect(runtime.sAIScriptPtr).toBe(2);

    runtime.sAIScriptPtr = 0;
    runtime.battleHistory.abilities = [0];
    runtime.gBattleMons[1].ability = ABILITY_ARENA_TRAP;
    Cmd_get_ability(runtime);
    expect(runtime.ai.funcResult).toBe(ABILITY_ARENA_TRAP);

    runtime.sAIScriptPtr = 0;
    runtime.gBattleMons[1].ability = 0;
    Cmd_get_ability(runtime);
    expect(runtime.ai.funcResult).toBe(ABILITY_MAGNET_PULL);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = AI_USER;
    Cmd_get_ability(runtime);
    expect(runtime.ai.funcResult).toBe(12);
  });

  test('type effectiveness commands normalize TypeCalc damage values and no-effect flags', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_EFFECTIVENESS_x2, 0, 0, 0, 0],
      pointers: { 2: 260 },
      gBattlerAttacker: 0,
      gBattleMons: [{ hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [10, 11, 12, 0], statStages: [] }],
      typeCalcDamageByMove: { 10: 30, 11: 120, 12: 240, 13: 40 },
      moveResultFlagsByMove: { 13: MOVE_RESULT_DOESNT_AFFECT_FOE },
      ai: { moveConsidered: 11 }
    });
    Cmd_get_highest_type_effectiveness(runtime);
    expect(runtime.ai.funcResult).toBe(160);
    expect(runtime.sAIScriptPtr).toBe(1);

    runtime.sAIScriptPtr = 0;
    Cmd_if_type_effectiveness(runtime);
    expect(runtime.sAIScriptPtr).toBe(260);

    runtime.sAIScriptPtr = 0;
    runtime.ai.moveConsidered = 13;
    runtime.script[1] = 0;
    Cmd_if_type_effectiveness(runtime);
    expect(runtime.sAIScriptPtr).toBe(260);
  });

  test('powerful move ranking and faint checks preserve C damage/RNG control flow', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, 0, 0, 0, 0],
      pointers: { 1: 270 },
      gBattlerAttacker: 0,
      gBattlerTarget: 1,
      gBattleMons: [
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [20, 21, 22, 0], statStages: [] },
        { hp: 50, maxHP: 50, type1: 0, type2: 0, moves: [], statStages: [] }
      ],
      gBattleMoves: {
        20: { effect: 1, power: 50 },
        21: { effect: 1, power: 80 },
        22: { effect: 7, power: 200 }
      },
      damageByMove: { 20: 45, 21: 40, 22: 999 },
      ai: { moveConsidered: 20, movesetIndex: 0, simulatedRNG: [100, 100, 100, 100] }
    });
    Cmd_get_how_powerful_move_is(runtime);
    expect(runtime.ai.funcResult).toBe(MOVE_MOST_POWERFUL);

    runtime.sAIScriptPtr = 0;
    runtime.ai.moveConsidered = 21;
    runtime.ai.movesetIndex = 1;
    Cmd_get_how_powerful_move_is(runtime);
    expect(runtime.ai.funcResult).toBe(MOVE_NOT_MOST_POWERFUL);

    runtime.sAIScriptPtr = 0;
    runtime.ai.moveConsidered = 22;
    Cmd_get_how_powerful_move_is(runtime);
    expect(runtime.ai.funcResult).toBe(MOVE_POWER_DISCOURAGED);

    runtime.sAIScriptPtr = 0;
    runtime.ai.moveConsidered = 20;
    runtime.ai.movesetIndex = 0;
    runtime.damageByMove[20] = 50;
    Cmd_if_can_faint(runtime);
    expect(runtime.sAIScriptPtr).toBe(270);

    runtime.sAIScriptPtr = 0;
    runtime.damageByMove[20] = 0;
    Cmd_if_cant_faint(runtime);
    expect(runtime.sAIScriptPtr).toBe(270);
  });

  test('stat-stage branches select user or target and advance by eight bytes', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_USER, 2, 6, 0, 0, 0, 0],
      pointers: { 4: 200 },
      gBattlerAttacker: 0,
      gBattlerTarget: 1,
      gBattleMons: [
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [], statStages: [0, 0, 5] },
        { hp: 1, maxHP: 1, type1: 0, type2: 0, moves: [], statStages: [0, 0, 8] }
      ]
    });
    Cmd_if_stat_level_less_than(runtime);
    expect(runtime.sAIScriptPtr).toBe(200);

    runtime.sAIScriptPtr = 0;
    runtime.script[3] = 4;
    Cmd_if_stat_level_more_than(runtime);
    expect(runtime.sAIScriptPtr).toBe(200);

    runtime.sAIScriptPtr = 0;
    runtime.script[3] = 5;
    Cmd_if_stat_level_equal(runtime);
    expect(runtime.sAIScriptPtr).toBe(200);

    runtime.sAIScriptPtr = 0;
    Cmd_if_stat_level_not_equal(runtime);
    expect(runtime.sAIScriptPtr).toBe(8);
  });

  test('type and move power getters mirror C selectors and increments', () => {
    const runtime = createBattleAiScriptCommandsRuntime({
      script: [0, AI_TYPE1_USER],
      gBattlerAttacker: 0,
      gBattlerTarget: 1,
      gBattleMons: [
        { hp: 1, maxHP: 1, type1: 10, type2: 11, moves: [], statStages: [] },
        { hp: 1, maxHP: 1, type1: 20, type2: 21, moves: [], statStages: [] }
      ],
      gBattleMoves: { 77: { effect: 1, power: 80, type: 30 } },
      ai: { moveConsidered: 77 }
    });

    Cmd_get_type(runtime);
    expect(runtime.ai.funcResult).toBe(10);
    expect(runtime.sAIScriptPtr).toBe(2);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = AI_TYPE1_TARGET;
    Cmd_get_type(runtime);
    expect(runtime.ai.funcResult).toBe(20);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = AI_TYPE2_USER;
    Cmd_get_type(runtime);
    expect(runtime.ai.funcResult).toBe(11);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = AI_TYPE2_TARGET;
    Cmd_get_type(runtime);
    expect(runtime.ai.funcResult).toBe(21);

    runtime.sAIScriptPtr = 0;
    runtime.script[1] = AI_TYPE_MOVE;
    Cmd_get_type(runtime);
    expect(runtime.ai.funcResult).toBe(30);

    Cmd_get_considered_move_power(runtime);
    expect(runtime.ai.funcResult).toBe(80);
    expect(runtime.sAIScriptPtr).toBe(3);
  });
});
