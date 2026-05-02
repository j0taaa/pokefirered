import { describe, expect, test } from 'vitest';
import {
  BATTLE_AI_SCRIPT_COMMANDS_C_TRANSLATION_UNIT,
  getAllDecompBattleAiCommands,
  getAllDecompBattleAiActionFlags,
  getAllDecompBattleAiSourceFunctions,
  getAllDecompBattleAiFlags,
  getDecompBattleAiCommand,
  getDecompBattleAiDiscouragedPowerfulMoveEffects,
  getDecompBattleAiFlag,
  getDecompBattleAiRootScripts,
  getDecompBattleAiScript,
  getDecompBattleAiScriptLabelForFlag,
  getDecompBattleAiSourceFunction,
  getDecompBattleAiStates,
  getDecompBattleAiSwitchHelper
} from '../src/game/decompBattleAiScriptCommands';

describe('decomp battle AI', () => {
  test('anchors the exact battle_ai_script_commands.c translation unit', () => {
    expect(BATTLE_AI_SCRIPT_COMMANDS_C_TRANSLATION_UNIT).toBe('src/battle_ai_script_commands.c');
  });

  test('parses AI flags and their root script mapping from decomp constants and script tables', () => {
    expect(getDecompBattleAiFlag('AI_SCRIPT_CHECK_BAD_MOVE')).toMatchObject({ bit: 1 });
    expect(getDecompBattleAiFlag('AI_SCRIPT_TRY_TO_FAINT')).toMatchObject({ bit: 4 });
    expect(getDecompBattleAiScriptLabelForFlag('AI_SCRIPT_CHECK_BAD_MOVE')).toBe('AI_CheckBadMove');
    expect(getDecompBattleAiScriptLabelForFlag('AI_SCRIPT_TRY_TO_FAINT')).toBe('AI_TryToFaint');
    expect(getDecompBattleAiScriptLabelForFlag('AI_SCRIPT_ROAMING')).toBe('AI_Roaming');
    expect(getDecompBattleAiScriptLabelForFlag('AI_SCRIPT_SAFARI')).toBe('AI_Safari');
    expect(getDecompBattleAiScriptLabelForFlag('AI_SCRIPT_FIRST_BATTLE')).toBe('AI_FirstBattle');
    expect(getDecompBattleAiRootScripts().slice(0, 4)).toEqual([
      'AI_CheckBadMove',
      'AI_CheckViability',
      'AI_TryToFaint',
      'AI_SetupFirstTurn'
    ]);
    expect(getAllDecompBattleAiFlags().length).toBeGreaterThanOrEqual(10);
  });

  test('parses AI command dispatch metadata from battle_ai_script_commands.c', () => {
    expect(getDecompBattleAiCommand(0x45)).toMatchObject({
      id: 0x45,
      handler: 'Cmd_flee',
      opcode: 'flee'
    });
    expect(getDecompBattleAiCommand(0x58)).toMatchObject({
      opcode: 'call',
      advancesScriptPtr: true
    });
    expect(getDecompBattleAiCommand(0x04)).toMatchObject({
      handler: 'Cmd_score',
      setsFuncResult: false
    });
    expect(getDecompBattleAiCommand(0x2f)).toMatchObject({
      handler: 'Cmd_get_ability',
      setsFuncResult: true,
      usesRandom: true
    });
    expect(getDecompBattleAiCommand(0x34)).toMatchObject({
      handler: 'Cmd_if_status_in_party',
      readsBattleHistory: false
    });
    expect(getAllDecompBattleAiCommands()).toHaveLength(0x5e);
    expect(getAllDecompBattleAiCommands().map((command) => command.id)).toEqual(
      Array.from({ length: 0x5e }, (_, id) => id)
    );
  });

  test('parses C-local constants, helper tables, and function bodies from battle_ai_script_commands.c', () => {
    expect(getAllDecompBattleAiActionFlags()).toEqual([
      { name: 'AI_ACTION_DONE', value: 0x0001 },
      { name: 'AI_ACTION_FLEE', value: 0x0002 },
      { name: 'AI_ACTION_WATCH', value: 0x0004 },
      { name: 'AI_ACTION_DO_NOT_ATTACK', value: 0x0008 },
      { name: 'AI_ACTION_UNK5', value: 0x0010 },
      { name: 'AI_ACTION_UNK6', value: 0x0020 },
      { name: 'AI_ACTION_UNK7', value: 0x0040 },
      { name: 'AI_ACTION_UNK8', value: 0x0080 }
    ]);
    expect(getDecompBattleAiStates()).toEqual([
      { name: 'AIState_SettingUp', value: 0 },
      { name: 'AIState_Processing', value: 1 },
      { name: 'AIState_FinishedProcessing', value: 2 },
      { name: 'AIState_DoNotProcess', value: 3 }
    ]);
    expect(getDecompBattleAiDiscouragedPowerfulMoveEffects()).toEqual([
      'EFFECT_EXPLOSION',
      'EFFECT_DREAM_EATER',
      'EFFECT_RAZOR_WIND',
      'EFFECT_SKY_ATTACK',
      'EFFECT_RECHARGE',
      'EFFECT_SKULL_BASH',
      'EFFECT_SOLAR_BEAM',
      'EFFECT_SPIT_UP',
      'EFFECT_FOCUS_PUNCH',
      'EFFECT_SUPERPOWER',
      'EFFECT_ERUPTION',
      'EFFECT_OVERHEAT'
    ]);
    expect(getDecompBattleAiSourceFunction('BattleAI_SetupAIData')).toMatchObject({
      name: 'BattleAI_SetupAIData',
      returnType: 'void',
      isStatic: false
    });
    expect(getDecompBattleAiSourceFunction('Cmd_if_status_not_in_party')?.body).toContain('sAIScriptPtr += 10;');
    expect(getAllDecompBattleAiSourceFunctions().length).toBeGreaterThanOrEqual(100);
  });

  test('parses AI script bodies and switch helper heuristics from the decomp', () => {
    const checkBadMove = getDecompBattleAiScript('AI_CheckBadMove');
    const checkBadMoveEffectBranch = getDecompBattleAiScript('AI_CheckBadMove_CheckEffect');
    expect(checkBadMove).toBeTruthy();
    expect(checkBadMove?.instructions.some((instruction) => instruction.opcode === 'get_how_powerful_move_is')).toBe(true);
    expect(checkBadMoveEffectBranch?.instructions.some((instruction) => instruction.opcode === 'if_effect')).toBe(true);

    expect(getDecompBattleAiSwitchHelper('ShouldSwitchIfWonderGuard')).toMatchObject({
      returnsSwitchAction: true,
      checksSuperEffective: true
    });
    expect(getDecompBattleAiSwitchHelper('FindMonThatAbsorbsOpponentsMove')).toMatchObject({
      returnsSwitchAction: true,
      referencesLastLandedMove: true,
      usesRandom: true
    });
    expect(getDecompBattleAiSwitchHelper('GetMostSuitableMonToSwitchInto')).toMatchObject({
      returnsSwitchAction: false
    });
  });
});
