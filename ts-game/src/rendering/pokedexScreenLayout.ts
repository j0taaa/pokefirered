/**
 * Pokédex UI layout in **GBA pixels** (240×160), derived from `src/pokedex_screen.c`
 * (`sWindowTemplate_*`, `sListMenuTemplate_*`, `gText_*`).
 */

export const DEX_GBA_WIDTH = 240;
export const DEX_GBA_HEIGHT = 160;

/** `gText_PokedexTableOfContents` — centered in header window 0. */
export const DEX_STRING_TABLE_OF_CONTENTS = 'POKéDEX   TABLE OF CONTENTS';

/** `gText_PokemonListNoColor` — ordered list header. */
export const DEX_STRING_POKEMON_LIST = 'POKeMON LIST';

/** `gText_SearchNoColor` — characteristic search list header. */
export const DEX_STRING_SEARCH = 'SEARCH';

/** `gText_PickOK` / `gText_PickOKExit` — browser-friendly (no control glyphs). */
export const DEX_STRING_PICK_OK = 'PICK    A: OK';
export const DEX_STRING_PICK_OK_EXIT = 'PICK    A: OK    B: BACK';

/** `sWindowTemplate_ModeSelect` — tile (1,2) size 20×16. */
export const DEX_RECT_MODE_SELECT = { x: 8, y: 16, w: 160, h: 128 } as const;

/** `sWindowTemplate_SelectionIcon` — tile (21,11) size 8×6. */
export const DEX_RECT_SELECTION_ICON = { x: 168, y: 88, w: 64, h: 48 } as const;

/** `sWindowTemplate_DexCounts` — tile (21,2) size 9×9. */
export const DEX_RECT_DEX_COUNTS = { x: 168, y: 16, w: 72, h: 72 } as const;

/** `sWindowTemplates[0]` — full-width header, 30×2 tiles. */
export const DEX_RECT_HEADER = { x: 0, y: 0, w: 240, h: 16 } as const;

/** `sWindowTemplates[1]` — full-width footer, tile (0,18) 30×2. */
export const DEX_RECT_FOOTER = { x: 0, y: 144, w: 240, h: 16 } as const;

/** `sWindowTemplate_OrderedListMenu` — tile (2,2) size 23×16. */
export const DEX_RECT_ORDERED_LIST = { x: 16, y: 16, w: 184, h: 128 } as const;

/** `sListMenuTemplate_KantoDexModeSelect` / Nat — `GetFontAttribute(FONT_NORMAL, FONTATTR_MAX_LETTER_HEIGHT)` + padding = 14. */
export const DEX_MODE_LIST_MAX_SHOWED = 9;
export const DEX_MODE_LIST_ROW_STRIDE = 14;
export const DEX_MODE_LIST_ITEM_X = 12;
export const DEX_MODE_LIST_HEADER_X = 0;
export const DEX_MODE_LIST_CURSOR_X = 4;
export const DEX_MODE_LIST_UP_TEXT_Y = 2;

/** `sListMenuTemplate_OrderedListMenu` — `maxShowed` is 9 in `pokedex_screen.c`. */
export const DEX_ORDERED_LIST_MAX_SHOWED = 9;
export const DEX_ORDERED_LIST_ITEM_X = 56;
export const DEX_ORDERED_LIST_CURSOR_X = 4;
export const DEX_ORDERED_LIST_UP_TEXT_Y = 2;
export const DEX_ORDERED_LIST_ROW_STRIDE = 14;

/** BG column reserved left of mode-select (tilemap starts at tile 1). */
export const DEX_LEFT_DECOR_WIDTH = 8;

/** Kanto dex counts text — offsets inside dex counts window (`DexScreen_InitGfxForTopMenu` else-branch). */
export const DEX_COUNTS_KANTO = {
  seenLabel: { x: 0, y: 9 },
  seenNumRight: 32,
  seenNumY: 21,
  ownedLabel: { x: 0, y: 37 },
  ownedNumRight: 32,
  ownedNumY: 49
} as const;

/** National dex counts — `FONT_SMALL` layout in `DexScreen_InitGfxForTopMenu` if-branch. */
export const DEX_COUNTS_NATIONAL = {
  seen: { x: 0, y: 2 },
  seenKantoLabel: { x: 8, y: 13 },
  seenKantoNumRight: 52,
  seenKantoNumY: 13,
  seenNatLabel: { x: 8, y: 24 },
  seenNatNumRight: 52,
  seenNatNumY: 24,
  owned: { x: 0, y: 37 },
  ownKantoLabel: { x: 8, y: 48 },
  ownKantoNumRight: 52,
  ownKantoNumY: 48,
  ownNatLabel: { x: 8, y: 59 },
  ownNatNumRight: 52,
  ownNatNumY: 59
} as const;

/** Category page — tile coords from `sPageIconCoords_*` ×8. */
export const DEX_CATEGORY_1_SLOT = [{ icon: { x: 88, y: 24 }, info: { x: 88, y: 88 } }] as const;

export const DEX_CATEGORY_2_SLOTS = [
  { icon: { x: 24, y: 24 }, info: { x: 88, y: 24 } },
  { icon: { x: 144, y: 72 }, info: { x: 80, y: 88 } }
] as const;

export const DEX_CATEGORY_3_SLOTS = [
  { icon: { x: 8, y: 16 }, info: { x: 72, y: 16 } },
  { icon: { x: 88, y: 72 }, info: { x: 24, y: 88 } },
  { icon: { x: 168, y: 24 }, info: { x: 168, y: 88 } }
] as const;

export const DEX_CATEGORY_4_SLOTS = [
  { icon: { x: 0, y: 16 }, info: { x: 48, y: 24 } },
  { icon: { x: 56, y: 80 }, info: { x: 0, y: 96 } },
  { icon: { x: 120, y: 80 }, info: { x: 176, y: 88 } },
  { icon: { x: 176, y: 16 }, info: { x: 120, y: 32 } }
] as const;

export const DEX_CATEGORY_ICON_SIZE = 64;
export const DEX_CATEGORY_INFO_W = 64;
export const DEX_CATEGORY_INFO_H = 40;

/** `sWindowTemplate_DexEntry_*` in pixels */
export const DEX_ENTRY_MON_PIC = { x: 152, y: 24, w: 64, h: 64 } as const;
export const DEX_ENTRY_SPECIES_STATS = { x: 16, y: 24, w: 104, h: 64 } as const;
export const DEX_ENTRY_FLAVOR = { x: 0, y: 88, w: 240, h: 56 } as const;

export type DexCategorySlot = { icon: { x: number; y: number }; info: { x: number; y: number } };

export const getPokedexCategorySlots = (count: number): ReadonlyArray<DexCategorySlot> => {
  switch (Math.max(1, Math.min(4, count))) {
    case 1:
      return DEX_CATEGORY_1_SLOT;
    case 2:
      return DEX_CATEGORY_2_SLOTS;
    case 3:
      return DEX_CATEGORY_3_SLOTS;
    default:
      return DEX_CATEGORY_4_SLOTS;
  }
};
