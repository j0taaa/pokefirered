import { describe, expect, test } from 'vitest';
import {
  gItems,
  getDecompItem,
  getDecompItemsByPocket
} from '../src/game/decompItems';

describe('decomp item json data', () => {
  test('exposes every item entry in source order', () => {
    expect(gItems).toHaveLength(375);
    expect(gItems[0]).toMatchObject({
      english: '????????',
      itemId: 'ITEM_NONE',
      fieldUseFunc: 'FieldUseFunc_OakStopsYou',
      secondaryId: 0
    });
    expect(gItems.at(-1)).toMatchObject({
      english: 'SAPPHIRE',
      itemId: 'ITEM_SAPPHIRE',
      pocket: 'POCKET_KEY_ITEMS',
      battleUseFunc: 'NULL'
    });
  });

  test('preserves item fields used by the converted game', () => {
    expect(getDecompItem('ITEM_MASTER_BALL')).toMatchObject({
      price: 0,
      pocket: 'POCKET_POKE_BALLS',
      type: 0,
      battleUsage: 2,
      battleUseFunc: 'BattleUseFunc_PokeBallEtc',
      secondaryId: 0
    });
    expect(getDecompItem('ITEM_TM01')).toMatchObject({
      pocket: 'POCKET_TM_CASE',
      moveId: 'FocusPunch'
    });
  });

  test('keeps decomp pocket groupings intact', () => {
    expect(getDecompItemsByPocket('POCKET_TM_CASE')).toHaveLength(58);
    expect(getDecompItemsByPocket('POCKET_BERRY_POUCH')).toHaveLength(43);
    expect(getDecompItemsByPocket('POCKET_KEY_ITEMS')).toHaveLength(55);
    expect(gItems.filter((item) => item.moveId !== undefined)).toHaveLength(58);
  });
});
