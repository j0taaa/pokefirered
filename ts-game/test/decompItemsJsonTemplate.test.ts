import { describe, expect, test } from 'vitest';
import {
  ITEMS_JSON_TEMPLATE_METADATA,
  ITEMS_JSON_TEMPLATE_SOURCE,
  parseItemsJsonTemplateMetadata
} from '../src/game/decompItemsJsonTemplate';

describe('decomp items.json template', () => {
  test('preserves the original generator template source', () => {
    expect(ITEMS_JSON_TEMPLATE_SOURCE.trimStart()).toMatch(/^\{\{ doNotModifyHeader \}\}/u);
    expect(ITEMS_JSON_TEMPLATE_SOURCE).toContain('const struct Item gItems[] = {');
    expect(ITEMS_JSON_TEMPLATE_SOURCE.trimEnd().split('\n')).toHaveLength(31);
  });

  test('parses template control flow and emitted item struct fields in source order', () => {
    expect(parseItemsJsonTemplateMetadata(ITEMS_JSON_TEMPLATE_SOURCE)).toEqual(ITEMS_JSON_TEMPLATE_METADATA);
    expect(ITEMS_JSON_TEMPLATE_METADATA.directives).toEqual([
      'for item in items',
      'if item.pocket == "POCKET_TM_CASE"',
      'endif',
      'endfor',
      'if item.pocket == "POCKET_TM_CASE"',
      'else',
      'endif'
    ]);
    expect(ITEMS_JSON_TEMPLATE_METADATA.itemStructFields).toEqual([
      'name',
      'itemId',
      'price',
      'holdEffect',
      'holdEffectParam',
      'description',
      'description',
      'importance',
      'registrability',
      'pocket',
      'type',
      'fieldUseFunc',
      'battleUsage',
      'battleUseFunc',
      'secondaryId'
    ]);
  });

  test('keeps the description declaration targets exactly named', () => {
    expect(ITEMS_JSON_TEMPLATE_METADATA.tmCaseMoveDescriptionExtern).toBe('gMoveDescription_{{ item.moveId }}[]');
    expect(ITEMS_JSON_TEMPLATE_METADATA.itemDescriptionDeclaration).toBe('gItemDescription_{{ item.itemId }}[]');
    expect(ITEMS_JSON_TEMPLATE_METADATA.itemNoneDescriptionDeclaration).toBe('gItemDescription_ITEM_NONE[]');
  });
});
