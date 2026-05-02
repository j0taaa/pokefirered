import { describe, expect, test } from 'vitest';
import {
  EGG_MOVES_H_TRANSLATION_UNIT,
  EGG_MOVES_SOURCE,
  gEggMoves
} from '../src/game/decompEggMoves';
import {
  TMHM_LEARNSETS_H_TRANSLATION_UNIT,
  TMHM_LEARNSETS_SOURCE,
  sTMHMLearnsets
} from '../src/game/decompTmhmLearnsets';
import {
  TUTOR_LEARNSETS_H_TRANSLATION_UNIT,
  TUTOR_LEARNSETS_SOURCE,
  sTutorLearnsets,
  sTutorMoves
} from '../src/game/decompTutorLearnsets';
import {
  EXPERIENCE_TABLES_H_TRANSLATION_UNIT,
  EXPERIENCE_TABLES_SOURCE,
  gExperienceTables
} from '../src/game/decompExperienceTables';
import {
  POKEDEX_ENTRIES_H_TRANSLATION_UNIT,
  POKEDEX_ENTRIES_SOURCE,
  gPokedexEntries
} from '../src/game/decompPokedexEntries';
import {
  POKEDEX_CATEGORIES_H_TRANSLATION_UNIT,
  POKEDEX_CATEGORIES_SOURCE,
  gDexCategories,
  sDexCategoryPages
} from '../src/game/decompPokedexCategories';
import {
  POKEDEX_ORDERS_H_TRANSLATION_UNIT,
  POKEDEX_ORDERS_SOURCE,
  gPokedexOrder_Alphabetical
} from '../src/game/decompPokedexOrders';
import {
  POKEDEX_TEXT_FR_H_TRANSLATION_UNIT,
  POKEDEX_TEXT_FR_SOURCE,
  POKEDEX_TEXTS_BY_VERSION as FR_TEXTS
} from '../src/game/decompPokedexTextFr';
import {
  POKEDEX_TEXT_LG_H_TRANSLATION_UNIT,
  POKEDEX_TEXT_LG_SOURCE,
  POKEDEX_TEXTS_BY_VERSION as LG_TEXTS
} from '../src/game/decompPokedexTextLg';

describe('decomp Pokemon metadata header facades', () => {
  test('anchors learnset and experience headers to exact parsed data', () => {
    expect(EGG_MOVES_H_TRANSLATION_UNIT).toBe('src/data/pokemon/egg_moves.h');
    expect(EGG_MOVES_SOURCE).toContain('#define EGG_MOVES_SPECIES_OFFSET 20000');
    expect(gEggMoves).toHaveLength(165);
    expect(gEggMoves[0]?.species).toBe('SPECIES_BULBASAUR');

    expect(TMHM_LEARNSETS_H_TRANSLATION_UNIT).toBe('src/data/pokemon/tmhm_learnsets.h');
    expect(TMHM_LEARNSETS_SOURCE).toContain('static const u32 sTMHMLearnsets[][2]');
    expect(sTMHMLearnsets).toHaveLength(412);
    expect(sTMHMLearnsets[1]?.species).toBe('SPECIES_BULBASAUR');

    expect(TUTOR_LEARNSETS_H_TRANSLATION_UNIT).toBe('src/data/pokemon/tutor_learnsets.h');
    expect(TUTOR_LEARNSETS_SOURCE).toContain('static const u16 sTutorMoves[TUTOR_MOVE_COUNT]');
    expect(sTutorMoves).toHaveLength(15);
    expect(sTutorLearnsets).toHaveLength(387);

    expect(EXPERIENCE_TABLES_H_TRANSLATION_UNIT).toBe('src/data/pokemon/experience_tables.h');
    expect(EXPERIENCE_TABLES_SOURCE).toContain('const u32 gExperienceTables[][MAX_LEVEL + 1]');
    expect(gExperienceTables).toHaveLength(8);
    expect(gExperienceTables[4]?.[100]).toBe(800000);
  });

  test('anchors Pokedex data, order, category, and versioned text headers', () => {
    expect(POKEDEX_ENTRIES_H_TRANSLATION_UNIT).toBe('src/data/pokemon/pokedex_entries.h');
    expect(POKEDEX_ENTRIES_SOURCE).toContain('const struct PokedexEntry gPokedexEntries[]');
    expect(gPokedexEntries).toHaveLength(387);
    expect(gPokedexEntries[1]?.nationalDex).toBe('NATIONAL_DEX_BULBASAUR');

    expect(POKEDEX_CATEGORIES_H_TRANSLATION_UNIT).toBe('src/data/pokemon/pokedex_categories.h');
    expect(POKEDEX_CATEGORIES_SOURCE).toContain('static const u16 sDexCategory_GrasslandPkmn_Page1[]');
    expect(sDexCategoryPages).toHaveLength(143);
    expect(gDexCategories).toHaveLength(9);

    expect(POKEDEX_ORDERS_H_TRANSLATION_UNIT).toBe('src/data/pokemon/pokedex_orders.h');
    expect(POKEDEX_ORDERS_SOURCE).toContain('const u16 gPokedexOrder_Alphabetical[]');
    expect(gPokedexOrder_Alphabetical).toHaveLength(411);
    expect(gPokedexOrder_Alphabetical[0]).toBe('NATIONAL_DEX_OLD_UNOWN_B');

    expect(POKEDEX_TEXT_FR_H_TRANSLATION_UNIT).toBe('src/data/pokemon/pokedex_text_fr.h');
    expect(POKEDEX_TEXT_FR_SOURCE).toContain('const u8 gBulbasaurPokedexText[]');
    expect(FR_TEXTS.FIRERED).toHaveLength(774);
    expect(FR_TEXTS.FIRERED[2]?.symbol).toBe('gBulbasaurPokedexText');

    expect(POKEDEX_TEXT_LG_H_TRANSLATION_UNIT).toBe('src/data/pokemon/pokedex_text_lg.h');
    expect(POKEDEX_TEXT_LG_SOURCE).toContain('const u8 gBulbasaurPokedexText[]');
    expect(LG_TEXTS.LEAFGREEN).toHaveLength(774);
    expect(LG_TEXTS.LEAFGREEN[2]?.symbol).toBe('gBulbasaurPokedexText');
  });
});
