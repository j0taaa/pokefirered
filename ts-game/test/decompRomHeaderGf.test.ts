import { describe, expect, test } from 'vitest';
import {
  BAG_BERRIES_COUNT,
  BAG_ITEMS_COUNT,
  BAG_KEYITEMS_COUNT,
  BAG_POKEBALLS_COUNT,
  BAG_TMHM_COUNT,
  ENIGMA_BERRY_SIZE,
  FLAG_SYS_GAME_CLEAR,
  FLAG_SYS_MYSTERY_GIFT_ENABLED,
  FLAG_SYS_RIBBON_GET,
  GF_ROM_HEADER,
  GAME_LANGUAGE,
  GAME_VERSION,
  NATIONAL_DEX_COUNT,
  PC_ITEMS_COUNT,
  PLAYER_NAME_LENGTH,
  POKEMON_NAME_LENGTH,
  SAVE_BLOCK_1_OFFSETS,
  SAVE_BLOCK_2_OFFSETS
} from '../src/game/decompRomHeaderGf';

describe('decompRomHeaderGf', () => {
  test('GF ROM header keeps FireRed identity, public counts, and flag constants', () => {
    expect(GF_ROM_HEADER).toMatchObject({
      version: GAME_VERSION,
      language: GAME_LANGUAGE,
      gameName: 'pokemon red version',
      pokedexCount: NATIONAL_DEX_COUNT,
      playerNameLength: PLAYER_NAME_LENGTH,
      pokemonNameLength1: POKEMON_NAME_LENGTH,
      pokemonNameLength2: POKEMON_NAME_LENGTH,
      mysteryGiftFlag: FLAG_SYS_MYSTERY_GIFT_ENABLED,
      gameClearFlag: FLAG_SYS_GAME_CLEAR,
      ribbonFlag: FLAG_SYS_RIBBON_GET
    });
    expect(GF_ROM_HEADER.pokedexVar).toBe(0x3c);
  });

  test('GF ROM header preserves SaveBlock offsets and save sizes from global.h comments', () => {
    expect(GF_ROM_HEADER).toMatchObject({
      flagsOffset: SAVE_BLOCK_1_OFFSETS.flags,
      varsOffset: SAVE_BLOCK_1_OFFSETS.vars,
      pokedexOffset: SAVE_BLOCK_2_OFFSETS.pokedex,
      seen1Offset: SAVE_BLOCK_1_OFFSETS.seen1,
      seen2Offset: SAVE_BLOCK_1_OFFSETS.seen2,
      partyCountOffset: SAVE_BLOCK_1_OFFSETS.playerPartyCount,
      partyOffset: SAVE_BLOCK_1_OFFSETS.playerParty,
      warpFlagsOffset: SAVE_BLOCK_2_OFFSETS.specialSaveWarpFlags,
      trainerIdOffset: SAVE_BLOCK_2_OFFSETS.playerTrainerId,
      playerNameOffset: SAVE_BLOCK_2_OFFSETS.playerName,
      playerGenderOffset: SAVE_BLOCK_2_OFFSETS.playerGender,
      unkFlagOffset: SAVE_BLOCK_2_OFFSETS.unkFlag2,
      unkFlagOffset2: SAVE_BLOCK_2_OFFSETS.unkFlag2,
      externalEventFlagsOffset: SAVE_BLOCK_1_OFFSETS.externalEventFlags,
      externalEventDataOffset: SAVE_BLOCK_1_OFFSETS.externalEventData,
      saveBlock2Size: 0x0f24,
      saveBlock1Size: 0x3d68
    });
  });

  test('GF ROM header preserves bag, PC, Enigma Berry, and data pointer fields', () => {
    expect(GF_ROM_HEADER).toMatchObject({
      bagCountItems: BAG_ITEMS_COUNT,
      bagCountKeyItems: BAG_KEYITEMS_COUNT,
      bagCountPokeballs: BAG_POKEBALLS_COUNT,
      bagCountTMHMs: BAG_TMHM_COUNT,
      bagCountBerries: BAG_BERRIES_COUNT,
      pcItemsCount: PC_ITEMS_COUNT,
      pcItemsOffset: SAVE_BLOCK_1_OFFSETS.pcItems,
      giftRibbonsOffset: SAVE_BLOCK_1_OFFSETS.giftRibbons,
      enigmaBerryOffset: SAVE_BLOCK_1_OFFSETS.enigmaBerry,
      enigmaBerrySize: ENIGMA_BERRY_SIZE,
      speciesInfo: 'gSpeciesInfo',
      abilityDescriptions: 'gAbilityDescriptionPointers',
      moveDescriptions: null,
      unk20: 0xffffffff
    });
  });
});
