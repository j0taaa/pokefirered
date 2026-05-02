export const VERSION_FIRE_RED = 4;
export const LANGUAGE_ENGLISH = 2;
export const GAME_VERSION = VERSION_FIRE_RED;
export const GAME_LANGUAGE = LANGUAGE_ENGLISH;
export const GAME_NAME = 'pokemon red version';

export const VARS_START = 0x4000;
export const VAR_0X403C = 0x403c;
export const SYS_FLAGS = 0x800;
export const FLAG_0X838 = SYS_FLAGS + 0x38;
export const FLAG_SYS_MYSTERY_GIFT_ENABLED = SYS_FLAGS + 0x39;
export const FLAG_SYS_GAME_CLEAR = SYS_FLAGS + 0x2c;
export const FLAG_SYS_RIBBON_GET = SYS_FLAGS + 0x3b;

export const NATIONAL_DEX_COUNT = 386;
export const PLAYER_NAME_LENGTH = 7;
export const POKEMON_NAME_LENGTH = 10;
export const BAG_ITEMS_COUNT = 42;
export const BAG_KEYITEMS_COUNT = 30;
export const BAG_POKEBALLS_COUNT = 13;
export const BAG_TMHM_COUNT = 58;
export const BAG_BERRIES_COUNT = 43;
export const PC_ITEMS_COUNT = 30;
export const ENIGMA_BERRY_SIZE = 0x34;

export const SAVE_BLOCK_1_OFFSETS = {
  playerPartyCount: 0x0034,
  playerParty: 0x0038,
  pcItems: 0x0298,
  seen1: 0x05f8,
  flags: 0x0ee0,
  vars: 0x1000,
  giftRibbons: 0x309c,
  externalEventData: 0x30a7,
  externalEventFlags: 0x30bb,
  enigmaBerry: 0x30ec,
  seen2: 0x3a18
} as const;

export const SAVE_BLOCK_2_OFFSETS = {
  playerName: 0x000,
  playerGender: 0x008,
  specialSaveWarpFlags: 0x009,
  playerTrainerId: 0x00a,
  pokedex: 0x018,
  gcnLinkFlags: 0x0a8,
  unkFlag2: 0x0ad
} as const;

export interface GFRomHeader {
  version: number;
  language: number;
  gameName: string;
  monFrontPics: string;
  monBackPics: string;
  monNormalPalettes: string;
  monShinyPalettes: string;
  monIcons: string;
  monIconPaletteIds: string;
  monIconPalettes: string;
  monSpeciesNames: string;
  moveNames: string;
  decorations: string;
  flagsOffset: number;
  varsOffset: number;
  pokedexOffset: number;
  seen1Offset: number;
  seen2Offset: number;
  pokedexVar: number;
  pokedexFlag: number;
  mysteryGiftFlag: number;
  pokedexCount: number;
  playerNameLength: number;
  unk2: number;
  pokemonNameLength1: number;
  pokemonNameLength2: number;
  unk5: number;
  unk6: number;
  unk7: number;
  unk8: number;
  unk9: number;
  unk10: number;
  unk11: number;
  unk12: number;
  unk13: number;
  unk14: number;
  unk15: number;
  unk16: number;
  unk17: number;
  saveBlock2Size: number;
  saveBlock1Size: number;
  partyCountOffset: number;
  partyOffset: number;
  warpFlagsOffset: number;
  trainerIdOffset: number;
  playerNameOffset: number;
  playerGenderOffset: number;
  unkFlagOffset: number;
  unkFlagOffset2: number;
  externalEventFlagsOffset: number;
  externalEventDataOffset: number;
  unk18: number;
  speciesInfo: string;
  abilityNames: string;
  abilityDescriptions: string;
  items: string;
  moves: string;
  ballGfx: string;
  ballPalettes: string;
  gcnLinkFlagsOffset: number;
  gameClearFlag: number;
  ribbonFlag: number;
  bagCountItems: number;
  bagCountKeyItems: number;
  bagCountPokeballs: number;
  bagCountTMHMs: number;
  bagCountBerries: number;
  pcItemsCount: number;
  pcItemsOffset: number;
  giftRibbonsOffset: number;
  enigmaBerryOffset: number;
  enigmaBerrySize: number;
  moveDescriptions: string | null;
  unk20: number;
}

export const GF_ROM_HEADER: GFRomHeader = {
  version: GAME_VERSION,
  language: GAME_LANGUAGE,
  gameName: GAME_NAME,
  monFrontPics: 'gMonFrontPicTable',
  monBackPics: 'gMonBackPicTable',
  monNormalPalettes: 'gMonPaletteTable',
  monShinyPalettes: 'gMonShinyPaletteTable',
  monIcons: 'gMonIconTable',
  monIconPaletteIds: 'gMonIconPaletteIndices',
  monIconPalettes: 'gMonIconPaletteTable',
  monSpeciesNames: 'gSpeciesNames',
  moveNames: 'gMoveNames',
  decorations: 'gDecorations',
  flagsOffset: SAVE_BLOCK_1_OFFSETS.flags,
  varsOffset: SAVE_BLOCK_1_OFFSETS.vars,
  pokedexOffset: SAVE_BLOCK_2_OFFSETS.pokedex,
  seen1Offset: SAVE_BLOCK_1_OFFSETS.seen1,
  seen2Offset: SAVE_BLOCK_1_OFFSETS.seen2,
  pokedexVar: VAR_0X403C - VARS_START,
  pokedexFlag: FLAG_0X838,
  mysteryGiftFlag: FLAG_SYS_MYSTERY_GIFT_ENABLED,
  pokedexCount: NATIONAL_DEX_COUNT,
  playerNameLength: PLAYER_NAME_LENGTH,
  unk2: 10,
  pokemonNameLength1: POKEMON_NAME_LENGTH,
  pokemonNameLength2: POKEMON_NAME_LENGTH,
  unk5: 12,
  unk6: 12,
  unk7: 6,
  unk8: 12,
  unk9: 6,
  unk10: 16,
  unk11: 18,
  unk12: 12,
  unk13: 15,
  unk14: 11,
  unk15: 1,
  unk16: 8,
  unk17: 12,
  saveBlock2Size: 0x0f24,
  saveBlock1Size: 0x3d68,
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
  unk18: 0x00000000,
  speciesInfo: 'gSpeciesInfo',
  abilityNames: 'gAbilityNames',
  abilityDescriptions: 'gAbilityDescriptionPointers',
  items: 'gItems',
  moves: 'gBattleMoves',
  ballGfx: 'gBallSpriteSheets',
  ballPalettes: 'gBallSpritePalettes',
  gcnLinkFlagsOffset: SAVE_BLOCK_2_OFFSETS.gcnLinkFlags,
  gameClearFlag: FLAG_SYS_GAME_CLEAR,
  ribbonFlag: FLAG_SYS_RIBBON_GET,
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
  moveDescriptions: null,
  unk20: 0xffffffff
};
