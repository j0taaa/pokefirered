import { describe, expect, test } from 'vitest';
import {
  QUEST_LOG_TEXTS,
  QUEST_LOG_TEXT_SOURCE,
  getQuestLogText
} from '../src/game/decompQuestLogText';

describe('decomp quest log text', () => {
  test('parses every gText_QuestLog string from source order', () => {
    expect(QUEST_LOG_TEXT_SOURCE).toContain('gText_QuestLog_PreviouslyOnYourQuest');
    expect(QUEST_LOG_TEXTS).toHaveLength(125);
    expect(QUEST_LOG_TEXTS.slice(0, 4)).toEqual([
      { symbol: 'gText_QuestLog_PreviouslyOnYourQuest', text: 'Previously on your quest…' },
      { symbol: 'gText_QuestLog_SwitchMon1WithMon2', text: '{PLAYER} switched the POKéMON\\n{STR_VAR_1} with {STR_VAR_2}.' },
      { symbol: 'gText_QuestLog_SwappedHeldItemsOnMon', text: 'Took the item {STR_VAR_2} from\\n{STR_VAR_1} and gave it the item\\n{STR_VAR_3} to hold.' },
      { symbol: 'gText_QuestLog_TookHeldItemFromMon', text: 'Took the item {STR_VAR_2} from\\n{STR_VAR_1}.' }
    ]);
  });

  test('preserves special/unused strings and tail location labels', () => {
    expect(getQuestLogText('gText_QuestLog_UsedWaterfall')).toBe('{STR_VAR_1} used the Hidden Move\\nWATERFALL to scale a raging torrent.');
    expect(getQuestLogText('gText_QuestLog_UsedDive')).toContain('ダイビング');
    expect(getQuestLogText('gText_QuestLog_CeruleanCave')).toBe('CERULEAN CAVE');
    expect(QUEST_LOG_TEXTS.at(-1)).toEqual({
      symbol: 'gText_QuestLog_CeruleanCave',
      text: 'CERULEAN CAVE'
    });
  });
});
