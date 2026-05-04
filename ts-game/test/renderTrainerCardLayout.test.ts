import { describe, expect, test } from 'vitest';
import {
  TC_GBA_W,
  TC_GBA_H,
  TC_WIN1_OX,
  TC_WIN1_OY,
  TC_WIN1_INNER_W,
  TC_WIN2_OX,
  TC_WIN2_OY,
  TC_TRAINER_PIC_DX,
  TC_TRAINER_PIC_DY,
  TC_TRAINER_PIC_SIZE,
  TC_FOOTER_RECT,
  TC_STR,
  TC_FRONT_NAME,
  TC_ID,
  TC_MONEY_LABEL,
  TC_TIME_HOURS,
  TC_TIME_COLON,
  TC_TIME_MINUTES,
  TC_STAR_CHARSET_TILE,
  TC_STAR_TILE,
  TC_BADGE_FIRST_TILE,
  TC_BADGE_TILE_STRIDE,
  TC_BACK_NAME,
  TC_BACK_STAT_LEFT,
  TC_BACK_HOF_Y,
  TC_BACK_LINK_LABEL_Y,
  TC_BACK_TRADES_Y,
  TC_BACK_UNION_Y,
  TC_BACK_STAT_VALUE_X,
  tcWin1X,
  tcWin1Y,
  tcPitchWidth,
  tcMoneyValueLeftX,
  tcDexCountLeftX
} from '../src/rendering/trainerCardScreenLayout';

describe('trainer card screen layout parity', () => {
  test('GBA viewport dimensions match FireRed hardware', () => {
    expect(TC_GBA_W).toBe(240);
    expect(TC_GBA_H).toBe(160);
  });

  test('window 1 offset and inner width match sTrainerCardWindowTemplates', () => {
    expect(TC_WIN1_OX).toBe(8);
    expect(TC_WIN1_OY).toBe(8);
    expect(TC_WIN1_INNER_W).toBe(27 * 8);
  });

  test('window 2 offset matches CreateTrainerCardTrainerPicSprite', () => {
    expect(TC_WIN2_OX).toBe(19 * 8);
    expect(TC_WIN2_OY).toBe(5 * 8);
  });

  test('trainer pic position matches sprite placement', () => {
    expect(TC_TRAINER_PIC_DX).toBe(13);
    expect(TC_TRAINER_PIC_DY).toBe(4);
    expect(TC_TRAINER_PIC_SIZE).toBe(0x40);
  });

  test('footer rect is within viewport bounds', () => {
    expect(TC_FOOTER_RECT.x).toBeGreaterThanOrEqual(0);
    expect(TC_FOOTER_RECT.y).toBeGreaterThanOrEqual(0);
    expect(TC_FOOTER_RECT.x + TC_FOOTER_RECT.w).toBeLessThanOrEqual(TC_GBA_W);
    expect(TC_FOOTER_RECT.y + TC_FOOTER_RECT.h).toBeLessThanOrEqual(TC_GBA_H);
  });

  test('trainer card string constants match decomp gText_TrainerCard*', () => {
    expect(TC_STR.namePrefix).toBe('NAME: ');
    expect(TC_STR.idNo).toBe('IDNo.');
    expect(TC_STR.money).toBe('MONEY');
    expect(TC_STR.yen).toBe('\u00A5');
    expect(TC_STR.pokedex).toBe('POKéDEX');
    expect(TC_STR.time).toBe('TIME');
    expect(TC_STR.colon).toBe(':');
    expect(TC_STR.hallOfFameDebut).toBe('HALL OF FAME DEBUT  ');
    expect(TC_STR.winLoss).toBe('W:     L:');
    expect(TC_STR.pokemonTrades).toBe('POKéMON TRADES');
    expect(TC_STR.unionTradesBattles).toBe('UNION TRADES & BATTLES');
    expect(TC_STR.berryCrush).toBe('BERRY CRUSH');
    expect(TC_STR.linkBattles).toBe('LINK BATTLES');
  });

  test('front name position matches sTrainerCardFrontNameXPositions', () => {
    expect(TC_FRONT_NAME.x).toBe(0x14);
    expect(TC_FRONT_NAME.y).toBe(0x1d);
  });

  test('ID position matches sTrainerCardIdXPositions', () => {
    expect(TC_ID.x).toBe(0x8e);
    expect(TC_ID.y).toBe(0x0a);
  });

  test('money label position matches PrintMoneyOnCard', () => {
    expect(TC_MONEY_LABEL.x).toBe(20);
    expect(TC_MONEY_LABEL.y).toBe(56);
  });

  test('time positions match PrintTimeOnCard', () => {
    expect(TC_TIME_HOURS.x).toBe(0x65);
    expect(TC_TIME_HOURS.y).toBe(0x58);
    expect(TC_TIME_COLON.x).toBe(0x77);
    expect(TC_TIME_COLON.y).toBe(0x58);
    expect(TC_TIME_MINUTES.x).toBe(0x7c);
    expect(TC_TIME_MINUTES.y).toBe(0x58);
  });

  test('back name position matches PrintNameOnCardBack', () => {
    expect(TC_BACK_NAME.x).toBe(0x8a);
    expect(TC_BACK_NAME.y).toBe(0x0b);
  });

  test('back stat positions match sTrainerCardHofDebutXPositions', () => {
    expect(TC_BACK_STAT_LEFT).toBe(0x0a);
    expect(TC_BACK_HOF_Y).toBe(35);
    expect(TC_BACK_LINK_LABEL_Y).toBe(51);
    expect(TC_BACK_TRADES_Y).toBe(67);
    expect(TC_BACK_UNION_Y).toBe(83);
    expect(TC_BACK_STAT_VALUE_X).toBe(164);
  });

  test('badge tile positions match DrawStarsAndBadgesOnCard', () => {
    expect(TC_STAR_TILE.x).toBe(15);
    expect(TC_STAR_TILE.y).toBe(7);
    expect(TC_STAR_CHARSET_TILE).toBe(143);
    expect(TC_BADGE_FIRST_TILE.x).toBe(4);
    expect(TC_BADGE_FIRST_TILE.y).toBe(16);
    expect(TC_BADGE_TILE_STRIDE).toBe(3);
  });

  test('tcWin1X and tcWin1Y compute window-relative coordinates', () => {
    expect(tcWin1X(0)).toBe(TC_WIN1_OX);
    expect(tcWin1Y(0)).toBe(TC_WIN1_OY);
    expect(tcWin1X(10)).toBe(TC_WIN1_OX + 10);
    expect(tcWin1Y(10)).toBe(TC_WIN1_OY + 10);
  });

  test('tcPitchWidth computes 6px per character', () => {
    expect(tcPitchWidth('')).toBe(0);
    expect(tcPitchWidth('ABC')).toBe(18);
    expect(tcPitchWidth('12345')).toBe(30);
  });

  test('tcMoneyValueLeftX right-aligns money string in window', () => {
    const x = tcMoneyValueLeftX('12345');
    expect(x).toBeLessThan(tcWin1X(0) + TC_WIN1_INNER_W);
  });

  test('tcDexCountLeftX right-aligns dex count string in window', () => {
    const x = tcDexCountLeftX('151');
    expect(x).toBeLessThan(tcWin1X(0) + TC_WIN1_INNER_W);
  });
});