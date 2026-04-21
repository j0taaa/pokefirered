import { describe, expect, test } from 'vitest';
import {
  getAllDecompBattleScripts,
  getDecompBattleScript,
  hasDecompBattleScript
} from '../src/game/decompBattleScripts';

describe('decomp battle scripts', () => {
  test('parses decomp move-effect scripts into labeled instruction blocks', () => {
    const burnHit = getDecompBattleScript('BattleScript_EffectBurnHit');
    expect(burnHit).toBeTruthy();
    expect(burnHit?.sourceFile).toBe('battle_scripts_1.s');
    expect(burnHit?.instructions.slice(0, 2)).toEqual([
      expect.objectContaining({ opcode: 'setmoveeffect', args: ['MOVE_EFFECT_BURN'] }),
      expect.objectContaining({ opcode: 'goto', args: ['BattleScript_EffectHit'] })
    ]);
  });

  test('keeps multi-step progression scripts available for future VM execution', () => {
    const levelUp = getDecompBattleScript('BattleScript_LevelUp');
    const askToLearnMove = getDecompBattleScript('BattleScript_AskToLearnMove');
    expect(levelUp).toBeTruthy();
    expect(levelUp?.instructions.some((instruction) => instruction.opcode === 'handlelearnnewmove')).toBe(true);
    expect(levelUp?.instructions.some((instruction) => instruction.opcode === 'goto' && instruction.args[0] === 'BattleScript_AskToLearnMove')).toBe(true);
    expect(askToLearnMove?.instructions.some((instruction) => instruction.opcode === 'yesnoboxlearnmove')).toBe(true);
  });

  test('loads battle scripts from the second script bank too', () => {
    const trainerBallBlock = getDecompBattleScript('BattleScript_TrainerBallBlock');
    expect(trainerBallBlock).toBeTruthy();
    expect(trainerBallBlock?.sourceFile).toBe('battle_scripts_2.s');
    expect(trainerBallBlock?.instructions.map((instruction) => instruction.raw)).toContain('printstring STRINGID_TRAINERBLOCKEDBALL');
    expect(hasDecompBattleScript('BattleScript_TrainerBallBlock')).toBe(true);
    expect(getAllDecompBattleScripts().length).toBeGreaterThan(200);
  });
});
