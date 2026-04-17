/**
 * FireRed bag menu layout (`src/bag.c` `sDefaultBagWindowsStd`, `sWindowTemplates`;
 * `src/item_menu.c` `Bag_BuildListMenuTemplate`, `OpenContextMenu`, `InitQuantityToTossOrDeposit`).
 * Coordinates are GBA screen pixels (240×160), matching window tilemap × 8.
 */

export const BAG_GBA_WIDTH = 240;
export const BAG_GBA_HEIGHT = 160;

/** `sDefaultBagWindowsStd` — windows 0 (list), 1 (message), 2 (pocket name). */
export const BAG_LIST_WINDOW = { x: 88, y: 8, w: 144, h: 96 } as const;
export const BAG_MESSAGE_WINDOW = { x: 40, y: 112, w: 200, h: 48 } as const;
export const BAG_POCKET_NAME_WINDOW = { x: 8, y: 8, w: 72, h: 16 } as const;

/** `Bag_BuildListMenuTemplate` + `GetFontAttribute(FONT_NORMAL, FONTATTR_MAX_LETTER_HEIGHT)` + `itemVerticalPadding`. */
export const BAG_LIST_ITEM_X = 9;
export const BAG_LIST_CURSOR_X = 1;
export const BAG_LIST_UP_TEXT_Y = 2;
export const BAG_LIST_ROW_PITCH = 14 + 2;

/** `BagListMenuItemPrintFunc` — quantity / SELECT blit X inside list window (pixels). */
export const BAG_LIST_QTY_X = 0x6e;
export const BAG_LIST_SELECT_BLIT_X = 0x70;

/** `CreateBagSprite` + `SetBagVisualPocketId` initial `y2` offset. */
export const BAG_SPRITE_X = 40;
export const BAG_SPRITE_Y = 68;
export const BAG_SPRITE_Y2_INITIAL = -5;
export const BAG_SPRITE_SRC_W = 64;
export const BAG_SPRITE_SRC_H = 64;

/** `CreateItemMenuIcon` — `gSprites[spriteId].x2` / `y2` with `CreateSprite(..., 0, 0, 0)`. */
export const BAG_ITEM_ICON_X = 24;
export const BAG_ITEM_ICON_Y = 140;
export const BAG_ITEM_ICON_DRAW_SIZE = 32;

/** `PrintItemDescriptionOnMessageWindow` → `BagPrintTextOnWindow(1, FONT_NORMAL, …, 0, 3, 2, …)`. */
export const BAG_MESSAGE_TEXT_X = 0;
export const BAG_MESSAGE_TEXT_Y = 3;
export const BAG_MESSAGE_LETTER_SPACING = 2;

/** `BagPrintTextOnWin1CenteredColor0` uses width 0x48 (72) for pocket name centering. */
export const BAG_POCKET_NAME_CENTER_WIDTH = 0x48;
export const BAG_POCKET_NAME_TEXT_Y = 1;

/** `sPocketSwitchArrowPairTemplate` (screen pixels). */
export const BAG_POCKET_ARROW_LEFT = { x: 8, y: 72 } as const;
export const BAG_POCKET_ARROW_RIGHT = { x: 72, y: 72 } as const;

/** `sWindowTemplates[10 + (numActions - 1)]` — context action list (right column, grows upward). */
export const bagContextActionsRect = (numActions: number): { x: number; y: number; w: number; h: number } => {
  const n = Math.min(Math.max(numActions, 1), 4);
  const tileH = 2 + (n - 1) * 2;
  const tileTop = 19 - tileH;
  return { x: 22 * 8, y: tileTop * 8, w: 7 * 8, h: tileH * 8 };
};

/** `ShowBagWindow(6, 0)` — “{ITEM} is selected.” bar (`sWindowTemplates[6]`). */
export const BAG_CONTEXT_TITLE_RECT = { x: 48, y: 120, w: 14 * 8, h: 4 * 8 } as const;

/** `InitQuantityToTossOrDeposit` — `ShowBagWindow(6, 2)` prompt + `ShowBagWindow(0, 0)` quantity box. */
export const BAG_TOSS_PROMPT_RECT = { x: 48, y: 120, w: 16 * 8, h: 4 * 8 } as const;
export const BAG_TOSS_QTY_RECT = { x: 24 * 8, y: 15 * 8, w: 5 * 8, h: 4 * 8 } as const;

/** `BagCreateYesNoMenuBottomRight` → `sWindowTemplates[3]`. */
export const BAG_YESNO_BOTTOM_RIGHT_RECT = { x: 23 * 8, y: 15 * 8, w: 6 * 8, h: 4 * 8 } as const;

/** `AddItemMenuActionTextPrinters` / `Menu_InitCursor` — first option row inside context actions window. */
export const BAG_CONTEXT_MENU_CURSOR_X = 8;
export const BAG_CONTEXT_MENU_TEXT_X = 8;
export const BAG_CONTEXT_MENU_FIRST_ROW_Y = 2;
export const BAG_CONTEXT_MENU_ROW_PITCH = 14 + 2;
