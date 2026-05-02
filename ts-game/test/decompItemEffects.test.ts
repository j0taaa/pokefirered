import { describe, expect, test } from 'vitest';
import {
  gItemEffectTable,
  getDecompItemEffect,
  getDecompItemEffectField,
  getDecompTrainerAiItemType,
  itemEffectConstant,
  sItemEffectTableDefinitions
} from '../src/game/decompItemEffects';

describe('decomp item effect data', () => {
  test('parses every item effect table definition and table pointer entry', () => {
    expect(sItemEffectTableDefinitions).toHaveLength(63);
    expect(gItemEffectTable).toHaveLength(64);
    expect(gItemEffectTable.at(-1)).toEqual({
      itemId: 'LAST_BERRY_INDEX',
      symbol: null,
      effect: null
    });
  });

  test('parses gItemEffectTable entries and indexed effect bytes', () => {
    expect(getDecompItemEffect('ITEM_SUPER_POTION')).toMatchObject({
      itemId: 'ITEM_SUPER_POTION',
      symbol: 'sItemEffect_SuperPotion',
      length: 7
    });
    expect(getDecompItemEffectField('ITEM_SUPER_POTION', 4)).toBe(itemEffectConstant('ITEM4_HEAL_HP'));
    expect(getDecompItemEffectField('ITEM_SUPER_POTION', 6)).toBe(50);
  });

  test('expands C macros and stores table values as u8 bytes', () => {
    expect(getDecompItemEffect('ITEM_HP_UP')?.fields).toEqual([0, 0, 0, 0, 1, 224, 10, 5, 3, 2]);
    expect(getDecompItemEffect('ITEM_GUARD_SPEC')?.fields).toEqual([0, 0, 0, 128, 0, 96, 1, 1]);
    expect(getDecompItemEffectField('ITEM_REVIVE', 4)).toBe(
      itemEffectConstant('ITEM4_REVIVE') | itemEffectConstant('ITEM4_HEAL_HP')
    );
    expect(getDecompItemEffectField('ITEM_MAX_REVIVE', 6)).toBe(255);
    expect(getDecompItemEffectField('ITEM_REVIVE', 6)).toBe(254);
    expect(getDecompItemEffectField('ITEM_ENERGY_ROOT', 7)).toBe(246);
    expect(getDecompItemEffectField('ITEM_REVIVAL_HERB', 9)).toBe(236);
  });

  test('classifies trainer AI item types from decomp effect bytes', () => {
    expect(getDecompTrainerAiItemType('ITEM_FULL_RESTORE')).toBe('AI_ITEM_FULL_RESTORE');
    expect(getDecompTrainerAiItemType('ITEM_HYPER_POTION')).toBe('AI_ITEM_HEAL_HP');
    expect(getDecompTrainerAiItemType('ITEM_FULL_HEAL')).toBe('AI_ITEM_CURE_CONDITION');
    expect(getDecompTrainerAiItemType('ITEM_X_ATTACK')).toBe('AI_ITEM_X_STAT');
    expect(getDecompTrainerAiItemType('ITEM_GUARD_SPEC')).toBe('AI_ITEM_GUARD_SPECS');
  });
});
