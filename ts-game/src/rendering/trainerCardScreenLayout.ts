/**
 * Trainer card UI in **GBA pixels** (240×160), derived from `src/trainer_card.c`
 * (`sTrainerCardWindowTemplates`, `Print*OnCard*`, `DrawStarsAndBadgesOnCard`)
 * and `src/strings.c` (`gText_TrainerCard*`).
 *
 * Covers **FRLG** (`CARD_TYPE_FRLG`, index 0) single-player (`!isLink`) layout.
 */

export const TC_GBA_W = 240;
export const TC_GBA_H = 160;

/** Window 1: `tilemapLeft` 1, `tilemapTop` 1 — text layer for card face/back. */
export const TC_WIN1_OX = 8;
export const TC_WIN1_OY = 8;
export const TC_WIN1_INNER_W = 27 * 8;

/** Window 2: trainer portrait (`CreateTrainerCardTrainerPicSprite`, BG3). */
export const TC_WIN2_OX = 19 * 8;
export const TC_WIN2_OY = 5 * 8;
export const TC_TRAINER_PIC_DX = 13;
export const TC_TRAINER_PIC_DY = 4;
export const TC_TRAINER_PIC_SIZE = 0x40;

/** Footer window (`tilemapLeft` 2, `tilemapTop` 15, 26×4 tiles). */
export const TC_FOOTER_RECT = { x: 16, y: 120, w: 208, h: 32 } as const;

/** `gText_TrainerCard*` + colon (`strings.c`). */
export const TC_STR = {
  namePrefix: 'NAME: ',
  idNo: 'IDNo.',
  money: 'MONEY',
  yen: '\u00A5',
  pokedex: 'POKéDEX',
  time: 'TIME',
  colon: ':',
  hallOfFameDebut: 'HALL OF FAME DEBUT  ',
  winLoss: 'W:     L:',
  pokemonTrades: 'POKéMON TRADES',
  unionTradesBattles: 'UNION TRADES & BATTLES',
  berryCrush: 'BERRY CRUSH',
  linkBattles: 'LINK BATTLES',
  /** Browser-friendly control strip (decomp uses help system tiles, not one string). */
  footerFront: 'A: TURN OVER    B: CANCEL',
  footerBack: 'B: TURN OVER    A: CLOSE'
} as const;

/** `sTrainerCardFrontNameXPositions` / `sTrainerCardFrontNameYPositions` — FRLG index 0. */
export const TC_FRONT_NAME = { x: 0x14, y: 0x1d } as const;

/** `PrintIdOnCard` — `sTrainerCardIdXPositions` / `sTrainerCardIdYPositions` FRLG. */
export const TC_ID = { x: 0x8e, y: 0x0a } as const;

/** `PrintMoneyOnCard` — FRLG branch. */
export const TC_MONEY_LABEL = { x: 20, y: 56 } as const;
export const TC_MONEY_VALUE_X_BASE = -122;
export const TC_CHAR_PITCH = 6;

/** `PrintPokedexOnCard` — FRLG branch. */
export const TC_DEX_LABEL = { x: 20, y: 72 } as const;
export const TC_DEX_VALUE_X_BASE = -120;

/** `PrintTimeOnCard` — FRLG branch; hours use `sTrainerCardTimeHoursXPositions[0]` etc. */
export const TC_TIME_LABEL = { x: 20, y: 88 } as const;
export const TC_TIME_HOURS = { x: 0x65, y: 0x58 } as const;
export const TC_TIME_COLON = { x: 0x77, y: 0x58 } as const;
export const TC_TIME_MINUTES = { x: 0x7c, y: 0x58 } as const;

/** `PrintNameOnCardBack` — FRLG. */
export const TC_BACK_NAME = { x: 0x8a, y: 0x0b } as const;

/** `PrintHofDebutTimeOnCard` / link / trades / union / berry rows — FRLG x from `sTrainerCardHofDebutXPositions[0]`. */
export const TC_BACK_STAT_LEFT = 0x0a;
export const TC_BACK_HOF_Y = 35;
export const TC_BACK_LINK_LABEL_Y = 51;
export const TC_BACK_TRADES_Y = 67;
export const TC_BACK_UNION_Y = 83;
export const TC_BACK_BERRY_Y = 99;
export const TC_BACK_STAT_VALUE_X = 164;
export const TC_BACK_LINK_WINLOSS_X = 130;
export const TC_BACK_LINK_WINS_X = 144;
export const TC_BACK_LINK_LOSSES_X = 192;
export const TC_BACK_TRADE_COUNT_X = 186;
export const TC_BACK_UNION_COUNT_X = 186;
export const TC_BACK_BERRY_COUNT_X = 186;

/** `DrawStarsAndBadgesOnCard` — tile coords on BG3 (FRLG). */
export const TC_STAR_TILE = { x: 15, y: 7 } as const;

/** `FillBgTilemapBufferRect(..., 143, ...)` in `DrawStarsAndBadgesOnCard`. */
export const TC_STAR_CHARSET_TILE = 143;
export const TC_BADGE_FIRST_TILE = { x: 4, y: 16 } as const;
export const TC_BADGE_TILE_STRIDE = 3;

export const tcWin1X = (x: number): number => TC_WIN1_OX + (x < 0 ? TC_WIN1_INNER_W + x : x);
export const tcWin1Y = (y: number): number => TC_WIN1_OY + y;

/** Money / dex count string width in hardware pixels (`6 * StringLength` in decomp). */
export const tcPitchWidth = (s: string): number => TC_CHAR_PITCH * [...s].length;

export const tcMoneyValueLeftX = (buffer: string): number =>
  tcWin1X(TC_MONEY_VALUE_X_BASE - tcPitchWidth(buffer));

export const tcDexCountLeftX = (buffer: string): number =>
  tcWin1X(TC_DEX_VALUE_X_BASE - tcPitchWidth(buffer));
