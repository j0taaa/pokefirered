import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_SPEECH_SOURCE,
  EASY_CHAT_SPEECH_WORDS,
  getEasyChatSpeechWord,
  sEasyChatGroup_Speech
} from '../src/game/decompEasyChatGroupSpeech';

describe('decomp easy chat group speech', () => {
  test('parses every speech word string in source order', () => {
    expect(EASY_CHAT_GROUP_SPEECH_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Speech[]');
    expect(EASY_CHAT_SPEECH_WORDS).toHaveLength(60);
    expect(EASY_CHAT_SPEECH_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Listen', text: 'LISTEN' },
      { symbol: 'sEasyChatWord_NotVery', text: 'NOT VERY' },
      { symbol: 'sEasyChatWord_Mean', text: 'MEAN' },
      { symbol: 'sEasyChatWord_Lie', text: 'LIE' },
      { symbol: 'sEasyChatWord_Lay', text: 'LAY' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_Speech).toHaveLength(60);
    expect(sEasyChatGroup_Speech.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatSpeechWord('sEasyChatWord_EvenSo')).toEqual({
      textSymbol: 'sEasyChatWord_EvenSo',
      text: 'EVEN SO,',
      alphabeticalOrder: 2,
      enabled: true
    });
    expect(getEasyChatSpeechWord('sEasyChatWord_Thats')).toEqual({
      textSymbol: 'sEasyChatWord_Thats',
      text: "THAT'S",
      alphabeticalOrder: 3,
      enabled: true
    });
    expect(sEasyChatGroup_Speech.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Fantastic',
      text: 'FANTASTIC',
      alphabeticalOrder: 28,
      enabled: true
    });
  });
});
