import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_EVENTS_WORDS,
  EASY_CHAT_GROUP_EVENTS_SOURCE,
  getEasyChatEventsWord,
  sEasyChatGroup_Events
} from '../src/game/decompEasyChatGroupEvents';

describe('decomp easy chat group events', () => {
  test('parses every event word string in source order', () => {
    expect(EASY_CHAT_GROUP_EVENTS_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Events[]');
    expect(EASY_CHAT_EVENTS_WORDS).toHaveLength(28);
    expect(EASY_CHAT_EVENTS_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Appeal', text: 'APPEAL' },
      { symbol: 'sEasyChatWord_Events', text: 'EVENTS' },
      { symbol: 'sEasyChatWord_StayAtHome', text: 'STAY-AT-HOME' },
      { symbol: 'sEasyChatWord_Berry', text: 'BERRY' },
      { symbol: 'sEasyChatWord_Contest', text: 'CONTEST' }
    ]);
  });

  test('preserves enabled flags, special text, and tail ordering', () => {
    expect(sEasyChatGroup_Events).toHaveLength(28);
    expect(sEasyChatGroup_Events[0]).toEqual({
      textSymbol: 'sEasyChatWord_Appeal',
      text: 'APPEAL',
      alphabeticalOrder: 0,
      enabled: false
    });
    expect(getEasyChatEventsWord('sEasyChatWord_POKEBLOCK')).toEqual({
      textSymbol: 'sEasyChatWord_POKEBLOCK',
      text: '{POKEBLOCK}',
      alphabeticalOrder: 20,
      enabled: false
    });
    expect(sEasyChatGroup_Events.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Wireless',
      text: 'WIRELESS',
      alphabeticalOrder: 27,
      enabled: true
    });
  });
});
