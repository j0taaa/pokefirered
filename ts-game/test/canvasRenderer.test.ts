import { describe, expect, test } from 'vitest';
import { getFieldChoiceWindowRect } from '../src/rendering/canvasRenderer';

const measureFixedWidthText = (text: string): number => text.length * 6;

describe('field choice window layout', () => {
  test('clamps multichoice windows to the decomp 28-tile right edge', () => {
    const rect = getFieldChoiceWindowRect({
      kind: 'multichoice',
      options: ['TRADE CENTER', 'COLOSSEUM', 'CANCEL'],
      columns: 1,
      tilemapLeft: 26,
      tilemapTop: 4
    }, measureFixedWidthText);

    expect(rect).not.toBeNull();
    expect(rect!.x + rect!.w).toBeLessThanOrEqual(28 * 8);
  });

  test('clamps tall list menus inside the GBA viewport height', () => {
    const rect = getFieldChoiceWindowRect({
      kind: 'listmenu',
      options: ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'],
      columns: 1,
      tilemapLeft: 3,
      tilemapTop: 18,
      maxVisibleOptions: 8
    }, measureFixedWidthText);

    expect(rect).not.toBeNull();
    expect(rect!.y + rect!.h).toBeLessThanOrEqual(160);
  });
});
