import { describe, expect, test } from 'vitest';
import {
  BATTLE_GBA_WIDTH,
  BATTLE_GBA_HEIGHT,
  BATTLE_SINGLE_BATTLER_COORDS,
  BATTLE_HEALTHBOX_OAM_ANCHOR,
  BATTLE_SINGLE_HEALTHBOX_DIM,
  BATTLE_HEALTHBOX_TEXT,
  BATTLE_MESSAGE_TEXT,
  BATTLE_PAL5_TEXT,
  BATTLE_MESSAGE_WINDOW,
  BATTLE_ACTION_PROMPT_WINDOW,
  BATTLE_ACTION_MENU_WINDOW,
  BATTLE_MOVE_MENU_WINDOW,
  BATTLE_LIST_WINDOW,
  BATTLE_COMMAND_CHAR_ADVANCE,
  BATTLE_COMMAND_LABELS,
  BATTLE_MOVE_SLOTS,
  BATTLE_HEALTHBOX_OVERLAY,
  getBattlePpToMaxPpState,
  getBattlePpLineColors
} from '../src/rendering/battleScreenLayout';

describe('battle screen layout parity', () => {
  test('GBA viewport dimensions match FireRed hardware', () => {
    expect(BATTLE_GBA_WIDTH).toBe(240);
    expect(BATTLE_GBA_HEIGHT).toBe(160);
  });

  test('single battler sprite coordinates match InitBattlerHealthboxCoords', () => {
    expect(BATTLE_SINGLE_BATTLER_COORDS.player).toEqual({ x: 72, y: 80 });
    expect(BATTLE_SINGLE_BATTLER_COORDS.opponent).toEqual({ x: 176, y: 40 });
  });

  test('healthbox OAM anchors match CalcCenterToCornerVec offsets', () => {
    expect(BATTLE_HEALTHBOX_OAM_ANCHOR.opponent.oamX).toBe(44 - 32);
    expect(BATTLE_HEALTHBOX_OAM_ANCHOR.opponent.oamY).toBe(30 - 16);
    expect(BATTLE_HEALTHBOX_OAM_ANCHOR.player.oamX).toBe(158 - 32);
    expect(BATTLE_HEALTHBOX_OAM_ANCHOR.player.oamY).toBe(88 - 16);
  });

  test('healthbox dimensions match sprite sizes from battle_interface.c', () => {
    expect(BATTLE_SINGLE_HEALTHBOX_DIM.opponent).toEqual({ w: 128, h: 32 });
    expect(BATTLE_SINGLE_HEALTHBOX_DIM.player).toEqual({ w: 128, h: 64 });
  });

  test('healthbox text colors match healthbox.pal palette indices', () => {
    expect(BATTLE_HEALTHBOX_TEXT.fg).toBe('#414141');
    expect(BATTLE_HEALTHBOX_TEXT.shadow).toBe('#ded5b4');
  });

  test('battle message text colors match textbox1.pal palette indices', () => {
    expect(BATTLE_MESSAGE_TEXT.fg).toBe('#ffffff');
    expect(BATTLE_MESSAGE_TEXT.shadow).toBe('#6a5a73');
  });

  test('battle palette 5 text colors match LoadBattleMenuWindowGfx', () => {
    expect(BATTLE_PAL5_TEXT.fg).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    expect(BATTLE_PAL5_TEXT.shadow).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });

  test('battle window rects are within GBA viewport bounds', () => {
    const inBounds = (rect: { x: number; y: number; w: number; h: number }) =>
      rect.x >= 0 && rect.y >= 0 &&
      rect.x + rect.w <= BATTLE_GBA_WIDTH &&
      rect.y + rect.h <= BATTLE_GBA_HEIGHT;

    expect(inBounds(BATTLE_MESSAGE_WINDOW)).toBe(true);
    expect(inBounds(BATTLE_ACTION_PROMPT_WINDOW)).toBe(true);
    expect(inBounds(BATTLE_ACTION_MENU_WINDOW)).toBe(true);
    expect(inBounds(BATTLE_MOVE_MENU_WINDOW)).toBe(true);
    expect(inBounds(BATTLE_LIST_WINDOW)).toBe(true);
  });

  test('battle command labels match FIGHT/BAG/POKéMON/RUN with correct positions', () => {
    expect(BATTLE_COMMAND_LABELS).toHaveLength(4);
    expect(BATTLE_COMMAND_LABELS[0]!.label).toBe('FIGHT');
    expect(BATTLE_COMMAND_LABELS[1]!.label).toBe('BAG');
    expect(BATTLE_COMMAND_LABELS[2]!.label).toBe('POKéMON');
    expect(BATTLE_COMMAND_LABELS[3]!.label).toBe('RUN');
  });

  test('battle move slots have 4 positions in a 2x2 grid', () => {
    expect(BATTLE_MOVE_SLOTS).toHaveLength(4);
    expect(BATTLE_MOVE_SLOTS[0]!.index).toBe(0);
    expect(BATTLE_MOVE_SLOTS[3]!.index).toBe(3);
  });

  test('battle command char advance is monospace', () => {
    expect(BATTLE_COMMAND_CHAR_ADVANCE).toBe(7);
  });

  test('healthbox overlay offsets are within healthbox dimensions', () => {
    const oppOverlay = BATTLE_HEALTHBOX_OVERLAY.opponent;
    const oppDim = BATTLE_SINGLE_HEALTHBOX_DIM.opponent;
    expect(oppOverlay.species.dx + oppOverlay.speciesWidth).toBeLessThan(oppDim.w);
    expect(oppOverlay.hpBar.dx + oppOverlay.hpBar.w).toBeLessThan(oppDim.w);

    const playerOverlay = BATTLE_HEALTHBOX_OVERLAY.player;
    const playerDim = BATTLE_SINGLE_HEALTHBOX_DIM.player;
    expect(playerOverlay.species.dx + playerOverlay.speciesWidth).toBeLessThan(playerDim.w);
    expect(playerOverlay.hpBar.dx + playerOverlay.hpBar.w).toBeLessThan(playerDim.w);
    expect(playerOverlay.expBar.dx + playerOverlay.expBar.w).toBeLessThan(playerDim.w);
  });

  test('PP state colors match GetCurrentPpToMaxPpState logic', () => {
    expect(getBattlePpToMaxPpState(10, 10)).toBe(3);
    expect(getBattlePpToMaxPpState(0, 10)).toBe(2);
    expect(getBattlePpToMaxPpState(2, 10)).toBe(1);
    expect(getBattlePpToMaxPpState(6, 10)).toBe(3);
    expect(getBattlePpToMaxPpState(1, 2)).toBe(1);
    expect(getBattlePpToMaxPpState(0, 2)).toBe(2);
    expect(getBattlePpToMaxPpState(1, 7)).toBe(1);
    expect(getBattlePpToMaxPpState(0, 7)).toBe(2);
    expect(getBattlePpToMaxPpState(3, 10)).toBe(0);
  });

  test('PP line colors return valid CSS color strings', () => {
    const colors = getBattlePpLineColors(10, 10);
    expect(colors.fg).toMatch(/^#[0-9a-f]{6}$/);
    expect(colors.shadow).toMatch(/^#[0-9a-f]{6}$/);
  });
});