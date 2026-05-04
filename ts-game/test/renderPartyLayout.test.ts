import { describe, expect, test } from 'vitest';
import {
  PARTY_GBA_WIDTH,
  PARTY_GBA_HEIGHT,
  PARTY_SINGLE_WINDOWS,
  PARTY_SINGLE_SPRITES,
  PARTY_TEXT_LEFT,
  PARTY_TEXT_RIGHT,
  PARTY_CANCEL_BUTTON_WINDOW,
  PARTY_CANCEL_BUTTON_BG_BLIT,
  partyActionsWindowTiles,
  tilesToPixels,
  getPartyMonWindowRect,
  getPartyMessageWindowRect
} from '../src/rendering/partyScreenLayout';

describe('party screen layout parity', () => {
  test('GBA viewport dimensions match FireRed hardware', () => {
    expect(PARTY_GBA_WIDTH).toBe(240);
    expect(PARTY_GBA_HEIGHT).toBe(160);
  });

  test('party single windows have 7 entries (6 mon slots + message)', () => {
    expect(PARTY_SINGLE_WINDOWS).toHaveLength(7);
    expect(PARTY_SINGLE_WINDOWS[0]!.slot).toBe(0);
    expect(PARTY_SINGLE_WINDOWS[5]!.slot).toBe(5);
    expect(PARTY_SINGLE_WINDOWS[6]!.slot).toBe('message');
  });

  test('party window columns match left/right/message layout', () => {
    expect(PARTY_SINGLE_WINDOWS[0]!.column).toBe('left');
    expect(PARTY_SINGLE_WINDOWS[1]!.column).toBe('right');
    expect(PARTY_SINGLE_WINDOWS[6]!.column).toBe('message');
  });

  test('party sprite coords have 6 entries with mon/item/status/pokeball positions', () => {
    expect(PARTY_SINGLE_SPRITES).toHaveLength(6);
    for (const sprite of PARTY_SINGLE_SPRITES) {
      expect(sprite).toHaveProperty('mon');
      expect(sprite).toHaveProperty('item');
      expect(sprite).toHaveProperty('status');
      expect(sprite).toHaveProperty('pokeball');
    }
  });

  test('party text left/right column offsets are structured objects', () => {
    expect(typeof PARTY_TEXT_LEFT).toBe('object');
    expect(typeof PARTY_TEXT_RIGHT).toBe('object');
    expect(PARTY_TEXT_LEFT).toHaveProperty('blitFunc');
    expect(PARTY_TEXT_RIGHT).toHaveProperty('blitFunc');
  });

  test('cancel button window and bg blit are within viewport bounds', () => {
    const cancelRect = tilesToPixels(
      PARTY_CANCEL_BUTTON_WINDOW.tileLeft,
      PARTY_CANCEL_BUTTON_WINDOW.tileTop,
      PARTY_CANCEL_BUTTON_WINDOW.tileW,
      PARTY_CANCEL_BUTTON_WINDOW.tileH
    );
    expect(cancelRect.x).toBeGreaterThanOrEqual(0);
    expect(cancelRect.y).toBeGreaterThanOrEqual(0);
    expect(cancelRect.x + cancelRect.w).toBeLessThanOrEqual(PARTY_GBA_WIDTH);
    expect(cancelRect.y + cancelRect.h).toBeLessThanOrEqual(PARTY_GBA_HEIGHT);

    const bgRect = tilesToPixels(
      PARTY_CANCEL_BUTTON_BG_BLIT.tileLeft,
      PARTY_CANCEL_BUTTON_BG_BLIT.tileTop,
      PARTY_CANCEL_BUTTON_BG_BLIT.tileW,
      PARTY_CANCEL_BUTTON_BG_BLIT.tileH
    );
    expect(bgRect.x).toBeGreaterThanOrEqual(0);
    expect(bgRect.y).toBeGreaterThanOrEqual(0);
  });

  test('party actions window tiles scale with action count', () => {
    const actions1 = partyActionsWindowTiles(1);
    expect(actions1.tileH).toBe(2);

    const actions4 = partyActionsWindowTiles(4);
    expect(actions4.tileH).toBe(8);

    const actions5 = partyActionsWindowTiles(5);
    expect(actions5.tileH).toBe(10);
  });

  test('getPartyMonWindowRect returns pixel rect with column info', () => {
    const rect0 = getPartyMonWindowRect(0);
    expect(rect0.column).toBe('left');
    expect(rect0.x).toBeGreaterThanOrEqual(0);
    expect(rect0.y).toBeGreaterThanOrEqual(0);
    expect(rect0.w).toBeGreaterThan(0);
    expect(rect0.h).toBeGreaterThan(0);

    const rect1 = getPartyMonWindowRect(1);
    expect(rect1.column).toBe('right');
  });

  test('getPartyMessageWindowRect returns pixel rect', () => {
    const rect = getPartyMessageWindowRect();
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.y).toBeGreaterThanOrEqual(0);
    expect(rect.w).toBeGreaterThan(0);
    expect(rect.h).toBeGreaterThan(0);
  });
});