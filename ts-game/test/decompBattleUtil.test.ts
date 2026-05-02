import { describe, expect, test } from 'vitest';
import {
  ABILITY_FORECAST,
  ABILITY_PRESSURE,
  BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_LINK,
  B_POSITION_OPPONENT_LEFT,
  B_POSITION_PLAYER_LEFT,
  B_SIDE_OPPONENT,
  BS_ATTACKER,
  BS_OPPONENT1,
  BS_TARGET,
  B_WEATHER_RAIN,
  B_WEATHER_SUN,
  CASTFORM_TO_FIRE,
  CASTFORM_TO_NORMAL,
  CASTFORM_TO_WATER,
  CheckMoveLimitations,
  ClearFuryCutterDestinyBondGrudge,
  GetBattlerForBattleScript,
  GetMoveTarget,
  HandleAction_RunBattleScript,
  HOLD_EFFECT_CHOICE_BAND,
  ITEM_ENIGMA_BERRY,
  IsMonDisobedient,
  MOVE_IMPRISON,
  MOVE_LIMITATIONS_ALL,
  MOVE_NONE,
  MOVE_PERISH_SONG,
  MOVE_TARGET_SELECTED,
  MOVE_TARGET_USER,
  MOVE_UNAVAILABLE,
  MarkAllBattlersForControllerExec,
  MarkBattlerForControllerExec,
  MarkBattlerReceivedLinkData,
  PressurePPLose,
  PressurePPLoseOnUsingImprison,
  PressurePPLoseOnUsingPerishSong,
  ResetSentPokesToOpponentValue,
  SPECIES_CASTFORM,
  STATUS2_DESTINY_BOND,
  STATUS2_MULTIPLETURNS,
  STATUS2_TORMENT,
  STATUS3_GRUDGE,
  STATUS3_IMPRISONED_OTHERS,
  STATUS3_SEMI_INVULNERABLE,
  TYPE_FIRE,
  TYPE_NORMAL,
  TYPE_WATER,
  AreAllMovesUnusable,
  BattleScriptPop,
  BattleScriptPush,
  BattleScriptPushCursor,
  CancelMultiTurnMoves,
  CastformDataTypeChange,
  OpponentSwitchInResetSentPokesToOpponentValue,
  TrySetCantSelectMoveBattleScript,
  UpdateSentPokesToOpponentValue,
  WasUnableToUseMove,
  createBattleUtilRuntime
} from '../src/game/decompBattleUtil';

describe('decompBattleUtil', () => {
  test('battler lookup and controller exec flags preserve link/non-link bit placement', () => {
    const runtime = createBattleUtilRuntime({ battlerTarget: 2, battlerAttacker: 1, battlerPositions: [0, 1, 2, 3] });
    expect(GetBattlerForBattleScript(runtime, BS_TARGET)).toBe(2);
    expect(GetBattlerForBattleScript(runtime, BS_ATTACKER)).toBe(1);
    expect(GetBattlerForBattleScript(runtime, BS_OPPONENT1)).toBe(1);

    MarkBattlerForControllerExec(runtime, 2);
    expect(runtime.battleControllerExecFlags).toBe(4);

    runtime.battleControllerExecFlags = 0;
    runtime.battleTypeFlags = BATTLE_TYPE_LINK;
    MarkBattlerForControllerExec(runtime, 1);
    expect(runtime.battleControllerExecFlags).toBe(2 << 28);

    runtime.battleControllerExecFlags = 0;
    MarkAllBattlersForControllerExec(runtime);
    expect(runtime.battleControllerExecFlags).toBe((1 | 2 | 4 | 8) << 28);

    runtime.battleControllerExecFlags = 1 << 29;
    MarkBattlerReceivedLinkData(runtime, 1, 2);
    expect(runtime.battleControllerExecFlags & (1 << 29)).toBe(0);
    expect(runtime.battleControllerExecFlags & (2 | (2 << 4))).toBe(2 | (2 << 4));
  });

  test('HandleAction_RunBattleScript dispatches the current opcode only when controllers are idle', () => {
    const runtime = createBattleUtilRuntime();
    const calls: number[] = [];
    runtime.battlescriptCurrInstr = 2;
    runtime.battleScriptingCommandsTable[2] = () => calls.push(2);

    runtime.battleControllerExecFlags = 1;
    HandleAction_RunBattleScript(runtime);
    expect(calls).toEqual([]);

    runtime.battleControllerExecFlags = 0;
    HandleAction_RunBattleScript(runtime);
    expect(calls).toEqual([2]);
  });

  test('Pressure PP loss variants decrement only matching permanent moves and emit controller updates', () => {
    const runtime = createBattleUtilRuntime();
    runtime.battleMons[1].ability = ABILITY_PRESSURE;
    runtime.battleMons[0].moves = [10, MOVE_IMPRISON, MOVE_PERISH_SONG, 40];
    runtime.battleMons[0].pp = [5, 6, 7, 8];

    PressurePPLose(runtime, 1, 0, 10);
    expect(runtime.battleMons[0].pp[0]).toBe(4);
    expect(runtime.operations.at(-1)).toContain('BtlController_EmitSetMonData:0:0:4');

    PressurePPLoseOnUsingImprison(runtime, 0);
    expect(runtime.battleMons[0].pp[1]).toBe(5);

    PressurePPLoseOnUsingPerishSong(runtime, 0);
    expect(runtime.battleMons[0].pp[2]).toBe(6);
  });

  test('multi-turn cancellation, protect flags, sent-pokes bitfields, and script stack match C state changes', () => {
    const runtime = createBattleUtilRuntime({ battlerPartyIndexes: [0, 2, 1, 3], battlersCount: 4 });
    runtime.battleMons[0].status2 = STATUS2_MULTIPLETURNS | STATUS2_DESTINY_BOND;
    runtime.statuses3[0] = STATUS3_SEMI_INVULNERABLE | STATUS3_GRUDGE;
    runtime.disableStructs[0].rolloutTimer = 3;
    runtime.disableStructs[0].furyCutterCounter = 4;
    CancelMultiTurnMoves(runtime, 0);
    expect(runtime.battleMons[0].status2 & STATUS2_MULTIPLETURNS).toBe(0);
    expect(runtime.statuses3[0] & STATUS3_SEMI_INVULNERABLE).toBe(0);
    expect(runtime.disableStructs[0]).toMatchObject({ rolloutTimer: 0, furyCutterCounter: 0 });

    runtime.protectStructs[0].flinchImmobility = true;
    expect(WasUnableToUseMove(runtime, 0)).toBe(true);

    ResetSentPokesToOpponentValue(runtime);
    expect(runtime.sentPokesToOpponent).toEqual([3, 3]);
    runtime.absentBattlerFlags = 1;
    OpponentSwitchInResetSentPokesToOpponentValue(runtime, 1);
    expect(runtime.sentPokesToOpponent[0]).toBe(2);
    UpdateSentPokesToOpponentValue(runtime, 0);
    expect(runtime.sentPokesToOpponent[0] & 1).toBe(1);

    BattleScriptPush(runtime, 'A');
    runtime.battlescriptCurrInstr = 'CURSOR';
    BattleScriptPushCursor(runtime);
    BattleScriptPop(runtime);
    expect(runtime.battlescriptCurrInstr).toBe('CURSOR');
  });

  test('move limitation and selection script checks preserve disabled, torment, taunt, imprison, choice, and PP masks', () => {
    const runtime = createBattleUtilRuntime({ activeBattler: 0 });
    runtime.battleMons[0].moves = [10, 20, 30, MOVE_NONE];
    runtime.battleMons[0].pp = [1, 0, 1, 0];
    runtime.battleMons[0].status2 = STATUS2_TORMENT;
    runtime.disableStructs[0].disabledMove = 10;
    runtime.disableStructs[0].tauntTimer = 1;
    runtime.lastMoves[0] = 20;
    runtime.battleMoves = { 10: { power: 40, target: MOVE_TARGET_SELECTED, type: 0 }, 20: { power: 0, target: MOVE_TARGET_SELECTED, type: 0 }, 30: { power: 0, target: MOVE_TARGET_SELECTED, type: 0 } };
    runtime.statuses3[1] = STATUS3_IMPRISONED_OTHERS;
    runtime.battleMons[1].moves = [30, 0, 0, 0];
    runtime.itemHoldEffects[99] = HOLD_EFFECT_CHOICE_BAND;
    runtime.battleMons[0].item = 99;
    runtime.battleStruct.choicedMove[0] = 10;

    expect(CheckMoveLimitations(runtime, 0, 0, MOVE_LIMITATIONS_ALL)).toBe(0b1111);
    expect(AreAllMovesUnusable(runtime)).toBe(true);
    expect(runtime.selectionBattleScripts[0]).toBe('BattleScript_NoMovesLeft');

    runtime.battleBufferB[0][2] = 1;
    expect(TrySetCantSelectMoveBattleScript(runtime)).toBeGreaterThan(0);
    expect(runtime.selectionBattleScripts[0]).toBe('BattleScript_SelectingMoveWithNoPP');

    runtime.battleStruct.choicedMove[0] = MOVE_UNAVAILABLE;
    runtime.battleMons[0].item = ITEM_ENIGMA_BERRY;
    runtime.enigmaBerries[0].holdEffect = HOLD_EFFECT_CHOICE_BAND;
    expect(CheckMoveLimitations(runtime, 0, 0, MOVE_LIMITATIONS_ALL) & 0b1111).toBe(0b1111);
  });

  test('Castform weather, clear flags, target selection, and disobedience reproduce deterministic branches', () => {
    const runtime = createBattleUtilRuntime({
      battleTypeFlags: BATTLE_TYPE_DOUBLE,
      battlerAttacker: 0,
      battlerPositions: [B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT, 2, 3],
      randomValues: [1],
      battleMoves: {
        1: { power: 40, target: MOVE_TARGET_SELECTED, type: 0 },
        2: { power: 0, target: MOVE_TARGET_USER, type: 0 }
      }
    });
    runtime.battleMons[0].species = SPECIES_CASTFORM;
    runtime.battleMons[0].ability = ABILITY_FORECAST;
    runtime.battleMons[0].type1 = TYPE_WATER;
    runtime.battleMons[0].type2 = TYPE_WATER;
    runtime.weatherHasEffect = false;
    expect(CastformDataTypeChange(runtime, 0)).toBe(CASTFORM_TO_NORMAL);
    expect(runtime.battleMons[0].type1).toBe(TYPE_NORMAL);
    runtime.weatherHasEffect = true;
    runtime.battleWeather = B_WEATHER_SUN;
    expect(CastformDataTypeChange(runtime, 0)).toBe(CASTFORM_TO_FIRE);
    expect(runtime.battleMons[0].type1).toBe(TYPE_FIRE);
    runtime.battleWeather = B_WEATHER_RAIN;
    expect(CastformDataTypeChange(runtime, 0)).toBe(CASTFORM_TO_WATER);

    runtime.disableStructs[0].furyCutterCounter = 2;
    runtime.battleMons[0].status2 |= STATUS2_DESTINY_BOND;
    runtime.statuses3[0] |= STATUS3_GRUDGE;
    ClearFuryCutterDestinyBondGrudge(runtime, 0);
    expect(runtime.disableStructs[0].furyCutterCounter).toBe(0);
    expect(runtime.battleMons[0].status2 & STATUS2_DESTINY_BOND).toBe(0);
    expect(runtime.statuses3[0] & STATUS3_GRUDGE).toBe(0);

    expect(GetMoveTarget(runtime, 1, 0)).toBe(1);
    expect(runtime.battleStruct.moveTarget[0]).toBe(1);
    expect(GetMoveTarget(runtime, 2, 0)).toBe(0);

    runtime.battleMons[0].level = 80;
    runtime.battleMons[0].otId = 123;
    runtime.battleMons[0].otName = 'OTHER';
    runtime.flags.ownTrainer = false;
    runtime.randomValues = [255];
    expect(IsMonDisobedient(runtime)).toBe(1);
    expect(runtime.operations).toContain('IsMonDisobedient:notObedient');

    expect(B_SIDE_OPPONENT).toBe(1);
  });
});
