import { describe, expect, test } from 'vitest';
import {
  getAllDecompBattleAiCommands,
  getAllDecompBattleAiFlags,
  getDecompBattleAiCommand,
  getDecompBattleAiFlag,
  getDecompBattleAiRootScripts,
  getDecompBattleAiScript,
  getDecompBattleAiScriptLabelForFlag,
  getDecompBattleAiSwitchHelper
} from '../src/game/decompBattleAi';

describe('decomp battle AI', () => {
  test('parses AI flags and their root script mapping from decomp constants and script tables', () => {
    expect(getDecompBattleAiFlag('AI_SCRIPT_CHECK_BAD_MOVE')).toMatchObject({ bit: 1 });
    expect(getDecompBattleAiFlag('AI_SCRIPT_TRY_TO_FAINT')).toMatchObject({ bit: 4 });
    expect(getDecompBattleAiScriptLabelForFlag('AI_SCRIPT_CHECK_BAD_MOVE')).toBe('AI_CheckBadMove');
    expect(getDecompBattleAiScriptLabelForFlag('AI_SCRIPT_TRY_TO_FAINT')).toBe('AI_TryToFaint');
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
      opcode: 'call'
    });
    expect(getAllDecompBattleAiCommands().length).toBeGreaterThan(80);
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
  });
});
