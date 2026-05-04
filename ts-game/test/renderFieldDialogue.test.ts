import { describe, expect, test } from 'vitest';
import {
  getFieldChoiceWindowRect
} from '../src/rendering/canvasRenderer';

describe('field dialogue rendering parity', () => {
  const measureText8px = (text: string): number => text.length * 8;

  test('getFieldChoiceWindowRect returns null for empty options', () => {
    const result = getFieldChoiceWindowRect(
      { kind: 'yesno', options: [], columns: 1, tilemapLeft: 2, tilemapTop: 4 },
      measureText8px
    );
    expect(result).toBeNull();
  });

  test('getFieldChoiceWindowRect computes yes/no window dimensions', () => {
    const result = getFieldChoiceWindowRect(
      { kind: 'yesno', options: ['YES', 'NO'], columns: 1, tilemapLeft: 20, tilemapTop: 8 },
      measureText8px
    );
    expect(result).not.toBeNull();
    expect(result!.x).toBeGreaterThanOrEqual(0);
    expect(result!.y).toBeGreaterThanOrEqual(0);
    expect(result!.w).toBeGreaterThan(0);
    expect(result!.h).toBeGreaterThan(0);
  });

  test('getFieldChoiceWindowRect clamps to GBA viewport bounds', () => {
    const result = getFieldChoiceWindowRect(
      { kind: 'multichoice', options: ['A', 'B', 'C'], columns: 1, tilemapLeft: 30, tilemapTop: 18 },
      measureText8px
    );
    expect(result).not.toBeNull();
    expect(result!.x + result!.w).toBeLessThanOrEqual(240);
    expect(result!.y + result!.h).toBeLessThanOrEqual(160);
  });

  test('getFieldChoiceWindowRect handles listmenu with scroll offset', () => {
    const options = Array.from({ length: 10 }, (_, i) => `Option ${i + 1}`);
    const result = getFieldChoiceWindowRect(
      { kind: 'listmenu', options, columns: 1, tilemapLeft: 2, tilemapTop: 2, maxVisibleOptions: 5, scrollOffset: 3 },
      measureText8px
    );
    expect(result).not.toBeNull();
    expect(result!.h).toBeLessThanOrEqual(160);
  });

  test('getFieldChoiceWindowRect handles multichoice with 2 columns', () => {
    const result = getFieldChoiceWindowRect(
      { kind: 'multichoice', options: ['A', 'B', 'C', 'D'], columns: 2, tilemapLeft: 2, tilemapTop: 2 },
      measureText8px
    );
    expect(result).not.toBeNull();
    expect(result!.w).toBeGreaterThan(0);
  });

  test('getFieldChoiceWindowRect uses widest option for column width', () => {
    const shortResult = getFieldChoiceWindowRect(
      { kind: 'yesno', options: ['YES', 'NO'], columns: 1, tilemapLeft: 2, tilemapTop: 2 },
      measureText8px
    );
    const longResult = getFieldChoiceWindowRect(
      { kind: 'yesno', options: ['YES, ABSOLUTELY', 'NO, NEVER'], columns: 1, tilemapLeft: 2, tilemapTop: 2 },
      measureText8px
    );
    expect(longResult!.w).toBeGreaterThan(shortResult!.w);
  });

  test('getFieldChoiceWindowRect clamps left position to 0', () => {
    const result = getFieldChoiceWindowRect(
      { kind: 'yesno', options: ['YES', 'NO'], columns: 1, tilemapLeft: 0, tilemapTop: 0 },
      measureText8px
    );
    expect(result).not.toBeNull();
    expect(result!.x).toBeGreaterThanOrEqual(0);
    expect(result!.y).toBeGreaterThanOrEqual(0);
  });
});