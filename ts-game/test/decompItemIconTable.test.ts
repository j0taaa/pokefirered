import { describe, expect, test } from 'vitest';
import {
  getItemIconTableEntry,
  ITEM_ICON_TABLE_SOURCE,
  sItemIconTable
} from '../src/game/decompItemIconTable';

describe('decomp item icon table', () => {
  test('parses every item icon mapping in source order', () => {
    expect(ITEM_ICON_TABLE_SOURCE).toContain('static const u32 *const sItemIconTable[ITEMS_COUNT + 1][2]');
    expect(sItemIconTable).toHaveLength(376);
    expect(sItemIconTable.slice(0, 8)).toEqual([
      { item: 'ITEM_NONE', iconSymbol: 'gItemIcon_QuestionMark', paletteSymbol: 'gItemIconPalette_QuestionMark' },
      { item: 'ITEM_MASTER_BALL', iconSymbol: 'gItemIcon_MasterBall', paletteSymbol: 'gItemIconPalette_MasterBall' },
      { item: 'ITEM_ULTRA_BALL', iconSymbol: 'gItemIcon_UltraBall', paletteSymbol: 'gItemIconPalette_UltraBall' },
      { item: 'ITEM_GREAT_BALL', iconSymbol: 'gItemIcon_GreatBall', paletteSymbol: 'gItemIconPalette_GreatBall' },
      { item: 'ITEM_POKE_BALL', iconSymbol: 'gItemIcon_PokeBall', paletteSymbol: 'gItemIconPalette_PokeBall' },
      { item: 'ITEM_SAFARI_BALL', iconSymbol: 'gItemIcon_SafariBall', paletteSymbol: 'gItemIconPalette_SafariBall' },
      { item: 'ITEM_NET_BALL', iconSymbol: 'gItemIcon_NetBall', paletteSymbol: 'gItemIconPalette_NetBall' },
      { item: 'ITEM_DIVE_BALL', iconSymbol: 'gItemIcon_DiveBall', paletteSymbol: 'gItemIconPalette_DiveBall' }
    ]);
  });

  test('preserves shared palettes and return-to-field sentinel', () => {
    expect(getItemIconTableEntry('ITEM_TIMER_BALL')).toEqual({
      item: 'ITEM_TIMER_BALL',
      iconSymbol: 'gItemIcon_TimerBall',
      paletteSymbol: 'gItemIconPalette_RepeatBall'
    });
    expect(getItemIconTableEntry('ITEM_PREMIER_BALL')).toEqual({
      item: 'ITEM_PREMIER_BALL',
      iconSymbol: 'gItemIcon_PremierBall',
      paletteSymbol: 'gItemIconPalette_LuxuryBall'
    });
    expect(sItemIconTable.at(-1)).toEqual({
      item: 'ITEMS_COUNT',
      iconSymbol: 'gItemIcon_ReturnToFieldArrow',
      paletteSymbol: 'gItemIconPalette_ReturnToFieldArrow'
    });
  });
});
