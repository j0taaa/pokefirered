import { describe, expect, test } from 'vitest';
import {
  getTeachyTvText,
  gTeachyTvText,
  TEACHY_TV_SOURCE
} from '../src/game/decompTeachyTvText';

describe('decomp Teachy TV text', () => {
  test('parses every Teachy TV string in source order', () => {
    expect(TEACHY_TV_SOURCE).toContain('const u8 gTeachyTvString_TeachBattle[]');
    expect(gTeachyTvText).toHaveLength(22);
    expect(gTeachyTvText.slice(0, 7)).toEqual([
      { symbol: 'gTeachyTvString_TeachBattle', text: 'Teach me how to battle.' },
      { symbol: 'gTeachyTvString_StatusProblems', text: 'What are status problems?' },
      { symbol: 'gTeachyTvString_TypeMatchups', text: 'What are type matchups?' },
      { symbol: 'gTeachyTvString_CatchPkmn', text: 'I want to catch POKéMON.' },
      { symbol: 'gTeachyTvString_AboutTMs', text: 'Teach me about TMs.' },
      { symbol: 'gTeachyTvString_RegisterItem', text: 'How do I register an item?' },
      { symbol: 'gTeachyTvString_Cancel', text: 'CANCEL' }
    ]);
  });

  test('preserves concatenated control codes and tail text', () => {
    expect(getTeachyTvText('gTeachyTvText_PokedudeSaysHello')).toContain(
      'HELLO, TRAINERS!\\p……… ……… ………\\p'
    );
    expect(getTeachyTvText('gTeachyTvText_StatusScript1')).toContain('paralysis, sleep, burn…\\p');
    expect(gTeachyTvText.at(-1)).toEqual({
      symbol: 'gTeachyTvText_RegisterScript2',
      text:
        "And now, your TEACHY TV is\\nregistered.\\pHow do you use it?\\nWell, here's how it works.\\pOnce an item in the KEY ITEMS\\nPOKCET is registered, you can use\\lit by pressing SELECT.\\pSo, you've given yourself\\none-touch access to TEACHY TV.\\pAll it takes for you to see me is\\npressing one button!\\pThat kind of attention is a little\\nembarrassing!\\pAll righty, be seeing you!\\pRemember, TRAINERS, a good deed\\na day brings happiness to stay!"
    });
  });
});
