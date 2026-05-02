import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_TRAINER_SOURCE,
  EASY_CHAT_TRAINER_WORDS,
  getEasyChatTrainerWord,
  sEasyChatGroup_Trainer
} from '../src/game/decompEasyChatGroupTrainer';

describe('decomp easy chat group trainer', () => {
  test('parses every trainer word string in source order', () => {
    expect(EASY_CHAT_GROUP_TRAINER_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Trainer[]');
    expect(EASY_CHAT_TRAINER_WORDS).toHaveLength(26);
    expect(EASY_CHAT_TRAINER_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_IChooseYou', text: 'I CHOOSE YOU' },
      { symbol: 'sEasyChatWord_Gotcha', text: 'GOTCHA' },
      { symbol: 'sEasyChatWord_Trade', text: 'TRADE' },
      { symbol: 'sEasyChatWord_Sapphire', text: 'SAPPHIRE' },
      { symbol: 'sEasyChatWord_Evolve', text: 'EVOLVE' }
    ]);
  });

  test('preserves every trainer group row including disabled POKENAV', () => {
    expect(sEasyChatGroup_Trainer).toHaveLength(26);
    expect(sEasyChatGroup_Trainer[0]).toEqual({
      textSymbol: 'sEasyChatWord_IChooseYou',
      text: 'I CHOOSE YOU',
      alphabeticalOrder: 21,
      enabled: true
    });
    expect(getEasyChatTrainerWord('sEasyChatWord_Pokenav')).toEqual({
      textSymbol: 'sEasyChatWord_Pokenav',
      text: 'POKéNAV',
      alphabeticalOrder: 9,
      enabled: false
    });
    expect(sEasyChatGroup_Trainer.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Silver',
      text: 'SILVER',
      alphabeticalOrder: 12,
      enabled: true
    });
  });
});
