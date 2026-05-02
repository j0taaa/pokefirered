import { describe, expect, test } from 'vitest';
import {
  getInGameTrade,
  INGAME_TRADES_SOURCE,
  sInGameTradeMailMessages,
  sInGameTradesFireRed,
  sInGameTradesLeafGreen
} from '../src/game/decompIngameTrades';

describe('decomp in-game trades', () => {
  test('parses every trade in source order for both versions', () => {
    expect(INGAME_TRADES_SOURCE).toContain('static const struct InGameTrade sInGameTrades[]');
    expect(sInGameTradesFireRed).toHaveLength(9);
    expect(sInGameTradesLeafGreen).toHaveLength(9);
    expect(sInGameTradesFireRed[0]).toMatchObject({
      id: 'INGAME_TRADE_MR_MIME',
      nickname: 'MIMIEN',
      species: 'SPECIES_MR_MIME',
      ivs: [20, 15, 17, 24, 23, 22],
      abilityNum: 0,
      otId: 1985,
      personality: 0x00009cae,
      otName: 'REYLEY',
      requestedSpecies: 'SPECIES_ABRA'
    });
  });

  test('preserves FireRed and LeafGreen conditional trade fields', () => {
    expect(getInGameTrade('INGAME_TRADE_NIDORAN', 'FIRERED')).toMatchObject({
      nickname: 'MS. NIDO',
      species: 'SPECIES_NIDORAN_F',
      requestedSpecies: 'SPECIES_NIDORAN_M'
    });
    expect(getInGameTrade('INGAME_TRADE_NIDORAN', 'LEAFGREEN')).toMatchObject({
      nickname: 'MR. NIDO',
      species: 'SPECIES_NIDORAN_M',
      requestedSpecies: 'SPECIES_NIDORAN_F'
    });
    expect(getInGameTrade('INGAME_TRADE_LICKITUNG', 'FIRERED')?.requestedSpecies).toBe('SPECIES_GOLDUCK');
    expect(getInGameTrade('INGAME_TRADE_LICKITUNG', 'LEAFGREEN')?.requestedSpecies).toBe('SPECIES_SLOWBRO');
  });

  test('parses mail message token rows exactly', () => {
    expect(sInGameTradeMailMessages).toEqual([
      [
        'EC_WORD_THAT_S',
        'EC_WORD_A',
        'EC_WORD_HEALTHY',
        'EC_POKEMON(JYNX)',
        'EC_WORD_EXCL',
        'EC_WORD_BE',
        'EC_WORD_KIND',
        'EC_WORD_TO',
        'EC_WORD_IT'
      ]
    ]);
  });
});
