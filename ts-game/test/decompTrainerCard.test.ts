import { describe, expect, it } from 'vitest';
import {
  CARD_TYPE_FRLG,
  CARD_TYPE_RSE,
  BufferBerryCrushPoints,
  BufferHofDebutTime,
  BufferLinkBattleResults,
  BufferNameForCardBack,
  BufferNumTrades,
  BufferTextForCardBack,
  BufferUnionRoomStats,
  BLDCNT_EFFECT_DARKEN,
  BLDCNT_TGT1_BG0,
  CB2_InitTrainerCard,
  CB2_TrainerCard,
  CloseTrainerCard,
  DISPCNT_BG_ALL_ON,
  DISPCNT_OBJ_1D_MAP,
  DISPCNT_OBJ_ON,
  DISPCNT_WIN0_ON,
  DmaClearOam,
  DmaClearPltt,
  DrawCardFrontOrBack,
  DrawCardScreenBackground,
  DrawCardBackStats,
  DrawStarsAndBadgesOnCard,
  DrawTrainerCardWindow,
  FEMALE,
  FACILITY_CLASS_BATTLE_GIRL,
  FACILITY_CLASS_BEAUTY,
  FACILITY_CLASS_BLACK_BELT,
  FACILITY_CLASS_CHANNELER,
  FACILITY_CLASS_COOLTRAINER_M,
  FACILITY_CLASS_LASS,
  FACILITY_CLASS_PICNICKER,
  FlipTrainerCard,
  GetCappedGameStat,
  GetCaughtMonsCount,
  GetCardType,
  GetLinkTrainerPicFacilityClass,
  GetTrainerStarCount,
  GAME_STAT_BERRY_CRUSH_POINTS,
  GAME_STAT_ENTERED_HOF,
  GAME_STAT_FIRST_HOF_PLAY_TIME,
  GAME_STAT_LINK_BATTLE_LOSSES,
  GAME_STAT_LINK_BATTLE_WINS,
  GAME_STAT_NUM_UNION_ROOM_BATTLES,
  GAME_STAT_POKEMON_TRADES,
  FLAG_SYS_POKEDEX_GET,
  HandleGpuRegs,
  HELPCONTEXT_TRAINER_CARD_BACK,
  HELPCONTEXT_TRAINER_CARD_FRONT,
  InitBgsAndWindows,
  InitTrainerCardData,
  INTR_FLAG_HBLANK,
  INTR_FLAG_SERIAL,
  INTR_FLAG_TIMER3,
  INTR_FLAG_VBLANK,
  INTR_FLAG_VCOUNT,
  LoadCardGfx,
  LoadMonIconGfx,
  LoadStickerGfx,
  MALE,
  MON_ICON_TINT_BLACK,
  MON_ICON_TINT_NORMAL,
  MON_ICON_TINT_PINK,
  MON_ICON_TINT_SEPIA,
  NUM_LINK_TRAINER_CARD_CLASSES,
  PLTT_SIZE_4BPP,
  PrintAllOnCardBack,
  PrintAllOnCardFront,
  PrintMoneyOnCard,
  PrintPokemonIconsOnCard,
  PrintTimeOnCard,
  PrintStickersOnCard,
  GetTrainerCardStars,
  HBlankCB_TrainerCard,
  REG_OFFSET_BG0CNT,
  REG_OFFSET_BG0HOFS,
  REG_OFFSET_BG0VOFS,
  REG_OFFSET_BG1CNT,
  REG_OFFSET_BG1HOFS,
  REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2CNT,
  REG_OFFSET_BG2HOFS,
  REG_OFFSET_BG2VOFS,
  REG_OFFSET_BG3CNT,
  REG_OFFSET_BG3HOFS,
  REG_OFFSET_BG3VOFS,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_BLDY,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_WIN0H,
  REG_OFFSET_WININ,
  REG_OFFSET_WINOUT,
  REG_OFFSET_WIN0V,
  ResetBgRegs,
  ResetGpuRegs,
  SetDataFromTrainerCard,
  SetPlayerCardData,
  SetTrainerCardBgsAndPals,
  SetTrainerCardCB2,
  SetUpTrainerCardTask,
  STATE_CLOSE_CARD,
  STATE_CLOSE_CARD_LINK,
  STATE_HANDLE_INPUT_BACK,
  STATE_HANDLE_INPUT_FRONT,
  STATE_WAIT_FLIP_TO_BACK,
  STATE_WAIT_FLIP_TO_FRONT,
  STATE_WAIT_LINK_PARTNER,
  TRAINER_CARD_STRING_BERRY_CRUSH,
  TRAINER_CARD_STRING_BERRY_CRUSH_COUNT,
  TRAINER_CARD_STRING_HOF_TIME,
  TRAINER_CARD_STRING_LINK_LOSSES,
  TRAINER_CARD_STRING_LINK_RECORD,
  TRAINER_CARD_STRING_LINK_WINS,
  TRAINER_CARD_STRING_NAME,
  TRAINER_CARD_STRING_TRADE_COUNT,
  TRAINER_CARD_STRING_TRADES,
  TRAINER_CARD_STRING_UNION_ROOM,
  TRAINER_CARD_STRING_UNION_ROOM_NUM,
  Task_AnimateCardFlipDown,
  Task_AnimateCardFlipUp,
  Task_BeginCardFlip,
  Task_DoCardFlipTask,
  Task_DrawFlippedCardSide,
  Task_EndCardFlip,
  Task_SetCardFlipped,
  Task_TrainerCard,
  TrainerCard_GenerateCardForLinkPlayer,
  CreateTrainerCardTrainerPic,
  IsCardFlipTaskActive,
  ShowPlayerTrainerCard,
  ShowTrainerCardInLink,
  Unref_InitTrainerCard,
  Unref_InitTrainerCardLink,
  Unref_InitTrainerCardLink2,
  VBlankCB_TrainerCard,
  VAR_EGG_BRAG_STATE,
  VAR_HOF_BRAG_STATE,
  VAR_LINK_WIN_BRAG_STATE,
  VAR_TRAINER_CARD_MON_ICON_1,
  VAR_TRAINER_CARD_MON_ICON_2,
  VAR_TRAINER_CARD_MON_ICON_3,
  VAR_TRAINER_CARD_MON_ICON_4,
  VAR_TRAINER_CARD_MON_ICON_5,
  VAR_TRAINER_CARD_MON_ICON_6,
  VAR_TRAINER_CARD_MON_ICON_TINT_IDX,
  VERSION_FIRE_RED,
  VERSION_LEAF_GREEN,
  WININ_WIN0_BG_ALL,
  WININ_WIN0_CLR,
  WININ_WIN0_OBJ,
  WINOUT_WIN01_BG1,
  WINOUT_WIN01_BG2,
  WINOUT_WIN01_BG3,
  WINOUT_WIN01_OBJ,
  WIN_RANGE,
  BlinkTimeColon,
  UpdateCardFlipRegs,
  createTrainerCard,
  createTrainerCardData,
  sLinkTrainerPicFacilityClasses,
  sLinkPlayerTrainerCardTemplate1,
  sLinkPlayerTrainerCardTemplate2,
  sHoennTrainerCardPals,
  sKantoTrainerCardPals,
  sTrainerCardBgTemplates,
  sTrainerCardWindowTemplates,
  sTrainerCardTextColors,
  sTrainerCardStatColors,
  sTimeColonInvisibleTextColors,
  sTrainerCardFontIds,
  sTrainerPicOffsets,
  sTrainerPicFacilityClasses,
  sTrainerCardFlipTasks,
  sTrainerCardFrontNameXPositions,
  sTrainerCardFrontNameYPositions,
  sTrainerCardIdXPositions,
  sTrainerCardIdYPositions,
  sTimeColonTextColors,
  sTrainerCardTimeHoursXPositions,
  sTrainerCardTimeHoursYPositions,
  sTrainerCardTimeMinutesXPositions,
  sTrainerCardTimeMinutesYPositions,
  sTrainerCardProfilePhraseXPositions,
  sTrainerCardProfilePhraseYPositions,
  sTrainerCardBackNameXPositions,
  sTrainerCardBackNameYPositions,
  sTrainerCardHofDebutXPositions,
  sLinkTrainerCardRecordStrings,
  sTrainerCardStickers_Gfx,
  sKantoTrainerCardFront_Tilemap,
  sHoennTrainerCardBack_Tilemap,
  sKantoTrainerCardBadges_Gfx,
  sPokemonIconPalSlots,
  sPokemonIconXOffsets,
  sStarYOffsets,
  sStickerPalSlots
} from '../src/game/decompTrainerCard';

type Sources = Parameters<typeof SetPlayerCardData>[2];

const createSources = (overrides: Partial<Sources> = {}): Sources => {
  const stats = new Map<number, number>();
  const vars = new Map<string, number>();
  const flags = new Set<string>();
  return {
    saveBlock1: {
      money: 0,
      easyChatProfile: [0, 0, 0, 0]
    },
    saveBlock2: {
      playerGender: MALE,
      playTimeHours: 0,
      playTimeMinutes: 0,
      playerTrainerId: [0, 0],
      playerName: '',
      berryPick: { berriesPicked: 0 },
      pokeJump: { jumpsInRow: 0 }
    },
    gameVersion: VERSION_FIRE_RED,
    getGameStat: (statId) => stats.get(statId) ?? 0,
    flagGet: (flag) => flags.has(flag),
    hasAllHoennMons: () => false,
    hasAllKantoMons: () => false,
    hasAllMons: () => false,
    getCaughtMonsCount: () => 0,
    getMoney: (money) => money,
    varGet: (variable) => vars.get(variable) ?? 0,
    mailSpeciesToIconSpecies: (species) => species,
    getCardType: () => CARD_TYPE_FRLG,
    ...overrides
  };
};

describe('decompTrainerCard', () => {
  it('static trainer-card tables preserve C constants and ordering', () => {
    expect(sTrainerCardStickers_Gfx).toEqual({ incbin: 'graphics/trainer_card/stickers.4bpp.lz', type: 'u32' });
    expect(sKantoTrainerCardFront_Tilemap).toEqual({ incbin: 'graphics/trainer_card/front.bin.lz', type: 'u32' });
    expect(sHoennTrainerCardBack_Tilemap).toEqual({ incbin: 'graphics/trainer_card/rse/back.bin.lz', type: 'u32' });
    expect(sKantoTrainerCardBadges_Gfx).toEqual({ incbin: 'graphics/trainer_card/badges.4bpp.lz', type: 'u32' });
    expect(sTrainerCardBgTemplates).toEqual([
      { bg: 0, charBaseIndex: 0, mapBaseIndex: 27, screenSize: 2, paletteMode: 0, priority: 2, baseTile: 0 },
      { bg: 1, charBaseIndex: 2, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
      { bg: 2, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
      { bg: 3, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 192 }
    ]);
    expect(sTrainerCardWindowTemplates).toEqual([
      { bg: 1, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 15, baseBlock: 0x241 },
      { bg: 1, tilemapLeft: 1, tilemapTop: 1, width: 27, height: 18, paletteNum: 15, baseBlock: 0x1 },
      { bg: 3, tilemapLeft: 19, tilemapTop: 5, width: 9, height: 10, paletteNum: 8, baseBlock: 0x150 },
      'DUMMY_WIN_TEMPLATE'
    ]);
    expect(sHoennTrainerCardPals).toEqual([
      'gHoennTrainerCardGreen_Pal',
      'sHoennTrainerCardBronze_Pal',
      'sHoennTrainerCardCopper_Pal',
      'sHoennTrainerCardSilver_Pal',
      'sHoennTrainerCardGold_Pal'
    ]);
    expect(sKantoTrainerCardPals).toEqual([
      'gKantoTrainerCardBlue_Pal',
      'sKantoTrainerCardGreen_Pal',
      'sKantoTrainerCardBronze_Pal',
      'sKantoTrainerCardSilver_Pal',
      'sKantoTrainerCardGold_Pal'
    ]);
    expect(sTrainerCardTextColors).toEqual([0, 2, 3]);
    expect(sTrainerCardStatColors).toEqual([0, 4, 5]);
    expect(sTimeColonInvisibleTextColors).toEqual([0, 0, 0]);
    expect(sTrainerCardFontIds).toEqual([0, 2, 0]);
    expect(sTrainerPicOffsets).toEqual([[[13, 4], [13, 4]], [[1, 0], [1, 0]]]);
    expect(sTrainerPicFacilityClasses).toEqual([[134, 135], [132, 133]]);
    expect(sLinkTrainerPicFacilityClasses[MALE]).toEqual([
      FACILITY_CLASS_COOLTRAINER_M,
      FACILITY_CLASS_BLACK_BELT,
      92,
      88,
      106,
      89,
      109,
      108
    ]);
    expect(sLinkTrainerPicFacilityClasses[FEMALE]).toEqual([
      117,
      FACILITY_CLASS_CHANNELER,
      FACILITY_CLASS_PICNICKER,
      FACILITY_CLASS_LASS,
      22,
      FACILITY_CLASS_BATTLE_GIRL,
      65,
      104
    ]);
    expect(sPokemonIconPalSlots).toEqual([5, 6, 7, 8, 9, 10]);
    expect(sPokemonIconXOffsets).toEqual([0, 4, 8, 12, 16, 20]);
    expect(sStickerPalSlots).toEqual([11, 12, 13, 14]);
    expect(sStarYOffsets).toEqual([7, 6, 0, 0]);
    expect(sTrainerCardFlipTasks).toEqual([
      'Task_BeginCardFlip',
      'Task_AnimateCardFlipDown',
      'Task_DrawFlippedCardSide',
      'Task_SetCardFlipped',
      'Task_AnimateCardFlipUp',
      'Task_EndCardFlip'
    ]);
    expect(sTrainerCardFrontNameXPositions).toEqual([0x14, 0x10]);
    expect(sTrainerCardFrontNameYPositions).toEqual([0x1d, 0x21]);
    expect(sTrainerCardIdXPositions).toEqual([0x8e, 0x80]);
    expect(sTrainerCardIdYPositions).toEqual([0x0a, 0x09]);
    expect(sTimeColonTextColors).toEqual(['sTrainerCardTextColors', 'sTimeColonInvisibleTextColors']);
    expect(sTrainerCardTimeHoursXPositions).toEqual([0x65, 0x55]);
    expect(sTrainerCardTimeHoursYPositions).toEqual([0x77, 0x67]);
    expect(sTrainerCardTimeMinutesXPositions).toEqual([0x7c, 0x6c]);
    expect(sTrainerCardTimeMinutesYPositions).toEqual([0x58, 0x59]);
    expect(sTrainerCardProfilePhraseXPositions).toEqual([0x73, 0x69]);
    expect(sTrainerCardProfilePhraseYPositions).toEqual([0x82, 0x78]);
    expect(sTrainerCardBackNameXPositions).toEqual([0x8a, 0xd8]);
    expect(sTrainerCardBackNameYPositions).toEqual([0x0b, 0x0a]);
    expect(sTrainerCardHofDebutXPositions).toEqual([0x0a, 0x10, 0x00, 0x00]);
    expect(sLinkTrainerCardRecordStrings).toEqual(['LINK BATTLES', 'LINK CABLE BATTLES']);
    expect(sLinkPlayerTrainerCardTemplate1.rse).toMatchObject({
      gender: MALE,
      stars: 4,
      trainerId: 0x6072,
      playerName: 'あかみ どりお',
      battleTowerWins: 5535
    });
    expect(sLinkPlayerTrainerCardTemplate1).toMatchObject({
      version: VERSION_FIRE_RED,
      berryCrushPoints: 5555,
      unionRoomNum: 8500,
      stickers: [1, 2, 3],
      monSpecies: [6, 50, 30, 22, 46, 80]
    });
    expect(sLinkPlayerTrainerCardTemplate2.rse).toMatchObject({
      gender: FEMALE,
      stars: 2,
      playerName: 'るびさふぁこ！',
      battleTowerWins: 65535
    });
    expect(sLinkPlayerTrainerCardTemplate2).toMatchObject({
      version: 0,
      berryCrushPoints: 555,
      unionRoomNum: 500,
      monSpecies: [6, 50, 30, 22, 46, 80]
    });
  });

  it('GetCappedGameStat and GetTrainerStarCount keep exact threshold behavior', () => {
    expect(GetCappedGameStat(7, 9999, (id) => id * 2000)).toBe(9999);
    expect(GetCappedGameStat(3, 9999, (id) => id * 2000)).toBe(6000);

    const card = createTrainerCard();
    expect(GetTrainerStarCount(card)).toBe(0);

    card.rse.hofDebutSeconds = 1;
    card.rse.caughtAllHoenn = true;
    card.rse.battleTowerStraightWins = 49;
    card.rse.hasAllPaintings = true;
    expect(GetTrainerStarCount(card)).toBe(3);

    card.rse.battleTowerStraightWins = 50;
    expect(GetTrainerStarCount(card)).toBe(4);
  });

  it('SetPlayerCardData mirrors save/stat/flag reads, HOF play-time clamp, and FRLG star calculation', () => {
    const card = createTrainerCard({
      rse: {
        battleTowerWins: 99,
        battleTowerStraightWins: 99,
        contestsWithFriends: 9,
        pokeblocksWithFriends: 8,
        hasAllPaintings: true
      }
    });
    const stats = new Map([
      [GAME_STAT_FIRST_HOF_PLAY_TIME, (1000 << 16) | (1 << 8) | 2],
      [GAME_STAT_ENTERED_HOF, 1],
      [GAME_STAT_LINK_BATTLE_WINS, 12000],
      [GAME_STAT_LINK_BATTLE_LOSSES, 345],
      [GAME_STAT_POKEMON_TRADES, 0x1ffff]
    ]);
    const sources = createSources({
      saveBlock1: { money: 12345, easyChatProfile: [11, 22, 33, 44] },
      saveBlock2: {
        playerGender: FEMALE,
        playTimeHours: 55,
        playTimeMinutes: 6,
        playerTrainerId: [0x34, 0x12],
        playerName: 'LEAF',
        berryPick: { berriesPicked: 0 },
        pokeJump: { jumpsInRow: 0 }
      },
      getGameStat: (statId) => stats.get(statId) ?? 0,
      flagGet: (flag) => flag === FLAG_SYS_POKEDEX_GET,
      hasAllHoennMons: () => true,
      getCaughtMonsCount: () => 151,
      getMoney: (money) => money + 5
    });

    SetPlayerCardData(card, CARD_TYPE_FRLG, sources);

    expect(card.rse.gender).toBe(FEMALE);
    expect(card.rse.playTimeHours).toBe(55);
    expect(card.rse.playTimeMinutes).toBe(6);
    expect(card.rse.hofDebutHours).toBe(999);
    expect(card.rse.hofDebutMinutes).toBe(59);
    expect(card.rse.hofDebutSeconds).toBe(59);
    expect(card.rse.hasPokedex).toBe(true);
    expect(card.rse.caughtAllHoenn).toBe(true);
    expect(card.rse.caughtMonsCount).toBe(151);
    expect(card.rse.trainerId).toBe(0x1234);
    expect(card.rse.linkBattleWins).toBe(9999);
    expect(card.rse.linkBattleLosses).toBe(345);
    expect(card.rse.pokemonTrades).toBe(0xffff);
    expect(card.rse.battleTowerWins).toBe(0);
    expect(card.rse.battleTowerStraightWins).toBe(0);
    expect(card.rse.contestsWithFriends).toBe(0);
    expect(card.rse.pokeblocksWithFriends).toBe(0);
    expect(card.rse.hasAllPaintings).toBe(false);
    expect(card.rse.money).toBe(12350);
    expect(card.rse.easyChatProfile).toEqual([11, 22, 33, 44]);
    expect(card.rse.playerName).toBe('LEAF');
    expect(card.rse.stars).toBe(2);

    stats.set(GAME_STAT_ENTERED_HOF, 0);
    const noHof = createTrainerCard();
    SetPlayerCardData(noHof, CARD_TYPE_FRLG, sources);
    expect(noHof.rse.hofDebutHours).toBe(0);
    expect(noHof.rse.hofDebutMinutes).toBe(0);
    expect(noHof.rse.hofDebutSeconds).toBe(0);
  });

  it('SetPlayerCardData preserves RSE-specific star rules for HOF, Kanto, and all-mons completion', () => {
    const stats = new Map([
      [GAME_STAT_FIRST_HOF_PLAY_TIME, (4 << 16) | (5 << 8) | 6],
      [GAME_STAT_ENTERED_HOF, 1]
    ]);
    const card = createTrainerCard();

    SetPlayerCardData(card, CARD_TYPE_RSE, createSources({
      getGameStat: (statId) => stats.get(statId) ?? 0,
      hasAllKantoMons: () => true,
      hasAllMons: () => true
    }));

    expect(card.rse.hofDebutHours).toBe(4);
    expect(card.rse.hofDebutMinutes).toBe(5);
    expect(card.rse.hofDebutSeconds).toBe(6);
    expect(card.rse.stars).toBe(3);
  });

  it('GetCardType uses global game version only without data, otherwise card version', () => {
    expect(GetCardType(VERSION_FIRE_RED, null)).toBe(CARD_TYPE_FRLG);
    expect(GetCardType(VERSION_LEAF_GREEN, null)).toBe(CARD_TYPE_FRLG);
    expect(GetCardType(0, null)).toBe(CARD_TYPE_RSE);

    expect(GetCardType(0, createTrainerCardData({ trainerCard: createTrainerCard({ version: VERSION_FIRE_RED }) }))).toBe(
      CARD_TYPE_FRLG
    );
    expect(GetCardType(VERSION_FIRE_RED, createTrainerCardData({ trainerCard: createTrainerCard({ version: 0 }) }))).toBe(
      CARD_TYPE_RSE
    );
  });

  it('SetDataFromTrainerCard clears transient flags and rebuilds badges from FLAG_BADGE01..08 order', () => {
    const data = createTrainerCardData({
      hasPokedex: true,
      hasHofResult: true,
      hasLinkResults: true,
      hasBattleTowerWins: true,
      var_E: true,
      var_F: true,
      hasTrades: true,
      hasBadge: [true, true, true, true, true, true, true, true],
      trainerCard: createTrainerCard({
        rse: {
          hasPokedex: true,
          hofDebutHours: 0,
          hofDebutMinutes: 5,
          hofDebutSeconds: 0,
          linkBattleWins: 0,
          linkBattleLosses: 2,
          pokemonTrades: 7
        }
      })
    });

    SetDataFromTrainerCard(data, (flag) => flag === 1 || flag === 6);

    expect(data.hasPokedex).toBe(true);
    expect(data.hasHofResult).toBe(true);
    expect(data.hasLinkResults).toBe(true);
    expect(data.hasTrades).toBe(true);
    expect(data.hasBattleTowerWins).toBe(false);
    expect(data.var_E).toBe(false);
    expect(data.var_F).toBe(false);
    expect(data.hasBadge).toEqual([false, true, false, false, false, false, true, false]);
  });

  it('link trainer facility class uses low u16 trainer id modulo table length', () => {
    expect(NUM_LINK_TRAINER_CARD_CLASSES).toBe(8);
    expect(GetLinkTrainerPicFacilityClass(MALE, 0)).toBe(FACILITY_CLASS_COOLTRAINER_M);
    expect(GetLinkTrainerPicFacilityClass(MALE, 9)).toBe(FACILITY_CLASS_BLACK_BELT);
    expect(GetLinkTrainerPicFacilityClass(FEMALE, 0xffff)).toBe(FACILITY_CLASS_BEAUTY);
    expect(GetLinkTrainerPicFacilityClass(FEMALE, 0x1_0005)).toBe(FACILITY_CLASS_BATTLE_GIRL);
  });

  it('HandleGpuRegs shows all BGs, writes C register values, and selects link interrupt mask', () => {
    const local = createTrainerCardData();

    HandleGpuRegs(local);

    expect(local.shownBgs).toEqual([0, 1, 2, 3]);
    expect(local.gpuRegs[REG_OFFSET_DISPCNT]).toBe(DISPCNT_WIN0_ON | DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP | DISPCNT_BG_ALL_ON);
    expect(local.gpuRegs[REG_OFFSET_BLDCNT]).toBe(BLDCNT_TGT1_BG0 | BLDCNT_EFFECT_DARKEN);
    expect(local.gpuRegs[REG_OFFSET_BLDY]).toBe(0);
    expect(local.gpuRegs[REG_OFFSET_WININ]).toBe(WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);
    expect(local.gpuRegs[REG_OFFSET_WINOUT]).toBe(WINOUT_WIN01_BG1 | WINOUT_WIN01_BG2 | WINOUT_WIN01_BG3 | WINOUT_WIN01_OBJ);
    expect(local.gpuRegs[REG_OFFSET_WIN0V]).toBe(WININ_WIN0_CLR | WIN_RANGE(0, 0x80));
    expect(local.gpuRegs[REG_OFFSET_WIN0H]).toBe(WININ_WIN0_CLR | WININ_WIN0_OBJ | WIN_RANGE(0, 0xc0));
    expect(local.interruptMask).toBe(INTR_FLAG_VBLANK | INTR_FLAG_HBLANK);

    const link = createTrainerCardData();
    HandleGpuRegs(link, true);
    expect(link.interruptMask).toBe(
      INTR_FLAG_VBLANK | INTR_FLAG_HBLANK | INTR_FLAG_VCOUNT | INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL
    );
  });

  it('Reset/DMA/BG/window trainer-card setup helpers preserve C side effects and ordering', () => {
    const data = createTrainerCardData({
      callbacks: { main2: 'old', vblank: 'old-vblank', hblank: 'old-hblank' },
      gpuRegs: { [REG_OFFSET_DISPCNT]: 123 }
    });

    ResetGpuRegs(data);
    expect(data.callbacks).toEqual({ main2: 'old', vblank: null, hblank: null });
    expect(data.gpuRegs[REG_OFFSET_DISPCNT]).toBe(0);

    DmaClearOam(data);
    DmaClearPltt(data);
    expect(data.runtimeCalls.slice(0, 2)).toEqual([
      { fn: 'DmaClear32', args: [3, 'OAM', 'OAM_SIZE'] },
      { fn: 'DmaClear16', args: [3, 'PLTT', 'PLTT_SIZE'] }
    ]);

    ResetBgRegs(data);
    expect([
      REG_OFFSET_BG0CNT,
      REG_OFFSET_BG1CNT,
      REG_OFFSET_BG2CNT,
      REG_OFFSET_BG3CNT,
      REG_OFFSET_BG0HOFS,
      REG_OFFSET_BG0VOFS,
      REG_OFFSET_BG1HOFS,
      REG_OFFSET_BG1VOFS,
      REG_OFFSET_BG2HOFS,
      REG_OFFSET_BG2VOFS,
      REG_OFFSET_BG3HOFS,
      REG_OFFSET_BG3VOFS
    ].map((reg) => data.gpuRegs[reg])).toEqual(Array.from({ length: 12 }, () => 0));

    InitBgsAndWindows(data);
    expect(data.runtimeCalls.slice(2)).toEqual([
      { fn: 'ResetSpriteData', args: [] },
      { fn: 'ResetPaletteFade', args: [] },
      { fn: 'ResetBgsAndClearDma3BusyFlags', args: [0] },
      { fn: 'InitBgsFromTemplates', args: [0, sTrainerCardBgTemplates, sTrainerCardBgTemplates.length] },
      { fn: 'ChangeBgX', args: [0, 0, 0] },
      { fn: 'ChangeBgY', args: [0, 0, 0] },
      { fn: 'ChangeBgX', args: [1, 0, 0] },
      { fn: 'ChangeBgY', args: [1, 0, 0] },
      { fn: 'ChangeBgX', args: [2, 0, 0] },
      { fn: 'ChangeBgY', args: [2, 0, 0] },
      { fn: 'ChangeBgX', args: [3, 0, 0] },
      { fn: 'ChangeBgY', args: [3, 0, 0] },
      { fn: 'InitWindows', args: [sTrainerCardWindowTemplates] },
      { fn: 'DeactivateAllTextPrinters', args: [] }
    ]);
  });

  it('SetTrainerCardCB2 and SetUpTrainerCardTask mirror callback/help/task setup', () => {
    const data = createTrainerCardData({
      hasBadge: [true, true, true, true, true, true, true, true],
      trainerCard: createTrainerCard({ rse: { pokemonTrades: 1 } })
    });

    SetTrainerCardCB2(data);
    expect(data.callbacks.main2).toBe('CB2_TrainerCard');
    expect(data.helpContext).toBe(HELPCONTEXT_TRAINER_CARD_FRONT);

    SetUpTrainerCardTask(data, (flag) => flag === 0 || flag === 7);
    expect(data.runtimeCalls).toEqual([
      { fn: 'ResetTasks', args: [] },
      { fn: 'ScanlineEffect_Stop', args: [] }
    ]);
    expect(data.tasks).toEqual([{ fn: 'Task_TrainerCard', priority: 0 }]);
    expect(data.hasBadge).toEqual([true, false, false, false, false, false, false, true]);
    expect(data.hasTrades).toBe(true);
  });

  it('VBlank/HBlank/CB2/Close callbacks preserve trainer-card side effects', () => {
    const data = createTrainerCardData({
      allowDMACopy: true,
      timeColonBlinkTimer: 60,
      callback2: 'ReturnCallback',
      scanlineEffectRegBuffers: [
        Array.from({ length: 160 }, (_, i) => i + 30),
        Array.from({ length: 160 }, () => 0)
      ]
    });

    VBlankCB_TrainerCard(data);
    expect(data.runtimeCalls).toEqual([
      { fn: 'LoadOam', args: [] },
      { fn: 'ProcessSpriteCopyRequests', args: [] },
      { fn: 'TransferPlttBuffer', args: [] },
      { fn: 'DmaCopy16', args: [3, 'gScanlineEffectRegBuffers[0]', 'gScanlineEffectRegBuffers[1]', 0x140] }
    ]);
    expect(data.timeColonBlinkTimer).toBe(0);
    expect(data.timeColonInvisible).toBe(true);
    expect(data.timeColonNeedDraw).toBe(true);
    expect(data.scanlineEffectRegBuffers[1].slice(0, 4)).toEqual([30, 31, 32, 33]);

    HBlankCB_TrainerCard(data, 0x103);
    expect(data.hblankBg0Vofs).toBe(33);

    data.runtimeCalls = [];
    CB2_TrainerCard(data);
    expect(data.runtimeCalls).toEqual([
      { fn: 'RunTasks', args: [] },
      { fn: 'AnimateSprites', args: [] },
      { fn: 'BuildOamBuffer', args: [] },
      { fn: 'UpdatePaletteFade', args: [] }
    ]);

    data.runtimeCalls = [];
    CloseTrainerCard(data, 7);
    expect(data.callbacks.main2).toBe('ReturnCallback');
    expect(data.freed).toBe(true);
    expect(data.runtimeCalls).toEqual([
      { fn: 'FreeAllWindowBuffers', args: [] },
      { fn: 'DestroyTask', args: [7] }
    ]);
  });

  it('InitTrainerCardData mirrors main fields, card type, and easy chat copies', () => {
    const data = createTrainerCardData({
      mainState: 9,
      timeColonBlinkTimer: 99,
      timeColonInvisible: true,
      onBack: true,
      flipBlendY: 7,
      trainerCard: createTrainerCard({
        version: VERSION_LEAF_GREEN,
        rse: { easyChatProfile: [11, 22, 33, 44] }
      })
    });

    InitTrainerCardData(data, 123, VERSION_FIRE_RED);
    expect(data.mainState).toBe(0);
    expect(data.timeColonBlinkTimer).toBe(123);
    expect(data.timeColonInvisible).toBe(false);
    expect(data.onBack).toBe(false);
    expect(data.flipBlendY).toBe(0);
    expect(data.cardType).toBe(CARD_TYPE_FRLG);
    expect(data.easyChatProfile).toEqual([11, 22, 33, 44]);

    const rse = createTrainerCardData({ trainerCard: createTrainerCard({ version: 0 }) });
    InitTrainerCardData(rse, 5, VERSION_FIRE_RED);
    expect(rse.cardType).toBe(CARD_TYPE_RSE);
  });

  it('CB2_InitTrainerCard follows gMain.state sequence including DMA fallthrough and staged loaders', () => {
    const data = createTrainerCardData({
      trainerCard: createTrainerCard({
        version: VERSION_FIRE_RED,
        rse: {
          hasPokedex: true,
          easyChatProfile: [1, 2, 3, 4],
          playerName: 'RED',
          pokemonTrades: 1
        }
      })
    });

    CB2_InitTrainerCard(data, (flag) => flag === 0, { gameVersion: VERSION_FIRE_RED, playTimeVBlanks: 9 });
    expect(data.initState).toBe(1);
    expect(data.gpuRegs[REG_OFFSET_DISPCNT]).toBe(0);
    expect(data.tasks).toEqual([{ fn: 'Task_TrainerCard', priority: 0 }]);
    expect(data.cardType).toBe(CARD_TYPE_FRLG);
    expect(data.easyChatProfile).toEqual([1, 2, 3, 4]);

    CB2_InitTrainerCard(data);
    CB2_InitTrainerCard(data);
    expect(data.initState).toBe(3);
    expect(data.runtimeCalls).toContainEqual({ fn: 'DmaClear32', args: [3, 'OAM', 'OAM_SIZE'] });

    data.runtimeCalls = [];
    CB2_InitTrainerCard(data);
    expect(data.initState).toBe(5);
    expect(data.runtimeCalls).toEqual([
      { fn: 'DmaClear16', args: [3, 'PLTT', 'PLTT_SIZE'] }
    ]);
    expect([REG_OFFSET_BG0CNT, REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT, REG_OFFSET_BG3CNT].map((reg) => data.gpuRegs[reg])).toEqual([0, 0, 0, 0]);

    CB2_InitTrainerCard(data);
    CB2_InitTrainerCard(data);
    CB2_InitTrainerCard(data);
    expect(data.initState).toBe(8);
    expect(data.runtimeCalls).toContainEqual({ fn: 'LoadStdWindowFrameGfx', args: [] });
    expect(data.loadedPalettes).toContainEqual({ palette: 'monIconPals', offset: 5 * 16, size: 192 });

    while (data.initState === 8)
      CB2_InitTrainerCard(data);
    expect(data.initState).toBe(9);
    CB2_InitTrainerCard(data);
    CB2_InitTrainerCard(data, undefined, { receivedRemoteLinkPlayers: true });
    CB2_InitTrainerCard(data);
    expect(data.initState).toBe(12);
    expect(data.interruptMask).toBe(INTR_FLAG_VBLANK | INTR_FLAG_HBLANK | INTR_FLAG_VCOUNT | INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL);
    expect(data.strings[TRAINER_CARD_STRING_NAME]).toBe('RED');

    while (data.initState === 12)
      CB2_InitTrainerCard(data);
    CB2_InitTrainerCard(data);
    CB2_InitTrainerCard(data);
    expect(data.callbacks.main2).toBe('CB2_TrainerCard');
    expect(data.helpContext).toBe(HELPCONTEXT_TRAINER_CARD_FRONT);
  });

  it('Show trainer card entry points and unused wrappers preserve callback/link/language/card setup', () => {
    const card = ShowPlayerTrainerCard('Return', createSources({
      saveBlock2: {
        playerGender: FEMALE,
        playTimeHours: 1,
        playTimeMinutes: 2,
        playerTrainerId: [0x34, 0x12],
        playerName: 'LEAF',
        berryPick: { berriesPicked: 0 },
        pokeJump: { jumpsInRow: 0 }
      }
    }), true, 5);
    expect(card.callback2).toBe('Return');
    expect(card.isLink).toBe(true);
    expect(card.language).toBe(5);
    expect(card.trainerCard.rse.playerName).toBe('LEAF');
    expect(card.callbacks.main2).toBe('CB2_InitTrainerCard');

    const linkCard = createTrainerCard({ version: VERSION_LEAF_GREEN, rse: { playerName: 'LINK', stars: 3 } });
    const link = ShowTrainerCardInLink(0, 'Back', [linkCard], [{ language: 7 }]);
    expect(link.callback2).toBe('Back');
    expect(link.isLink).toBe(true);
    expect(link.language).toBe(7);
    expect(link.trainerCard.rse.playerName).toBe('LINK');
    expect(link.trainerCard.rse.stars).toBe(3);
    expect(link.callbacks.main2).toBe('CB2_InitTrainerCard');

    expect(Unref_InitTrainerCard('Cb', createSources()).callbacks.main2).toBe('CB2_InitTrainerCard');
    expect(Unref_InitTrainerCardLink('Cb').trainerCard.rse.playerName).toBe('あかみ どりお');
    expect(Unref_InitTrainerCardLink2('Cb').trainerCard.rse.gender).toBe(FEMALE);
  });

  it('Task_TrainerCard preserves initial draw and fade-in state sequence', () => {
    const data = createTrainerCardData({
      mainState: 0,
      trainerCard: createTrainerCard({
        rse: {
          playerName: 'RED',
          trainerId: 0x1234,
          money: 50,
          hasPokedex: true,
          caughtMonsCount: 12,
          playTimeHours: 1,
          playTimeMinutes: 2,
          stars: 2
        }
      }),
      frontTilemap: Array.from({ length: 600 }, (_, i) => i + 1),
      bgTilemap: Array.from({ length: 600 }, (_, i) => i + 1000)
    });

    Task_TrainerCard(data, 3, { isDma3ManagerBusyWithBgCopy: true });
    expect(data.mainState).toBe(0);

    Task_TrainerCard(data, 3);
    expect(data.mainState).toBe(1);
    expect(data.runtimeCalls).toEqual([{ fn: 'FillWindowPixelBuffer', args: [1, 'PIXEL_FILL(0)'] }]);

    while (data.mainState === 1)
      Task_TrainerCard(data, 3);
    expect(data.mainState).toBe(2);
    Task_TrainerCard(data, 3);
    expect(data.mainState).toBe(3);
    expect(data.runtimeCalls.at(-1)).toEqual({ fn: 'CopyWindowToVram', args: [1, 'COPYWIN_FULL'] });

    Task_TrainerCard(data, 3);
    expect(data.mainState).toBe(4);
    expect(data.runtimeCalls).toContainEqual({ fn: 'FillWindowPixelBuffer', args: [2, 'PIXEL_FILL(0)'] });
    expect(data.runtimeCalls).toContainEqual({ fn: 'CopyWindowToVram', args: [2, 'COPYWIN_FULL'] });

    Task_TrainerCard(data, 3);
    expect(data.mainState).toBe(5);
    expect(data.bgTilemapBuffer.slice(0, 2)).toEqual([1000, 1001]);

    Task_TrainerCard(data, 3);
    expect(data.mainState).toBe(6);
    expect(data.cardTilemapBuffer.slice(0, 2)).toEqual([1, 2]);

    Task_TrainerCard(data, 3);
    expect(data.mainState).toBe(7);
    expect(data.runtimeCalls.at(-1)).toEqual({ fn: 'CopyBgTilemapBufferToVram', args: [3] });

    data.runtimeCalls = [];
    Task_TrainerCard(data, 3, { wirelessCommType: 1, receivedRemoteLinkPlayers: true });
    expect(data.mainState).toBe(8);
    expect(data.callbacks.vblank).toBe('VBlankCB_TrainerCard');
    expect(data.runtimeCalls).toEqual([
      { fn: 'LoadWirelessStatusIndicatorSpriteGfx', args: [] },
      { fn: 'CreateWirelessStatusIndicatorSprite', args: [230, 150] },
      { fn: 'BeginNormalPaletteFade', args: ['PALETTES_ALL', 0, 16, 0, 'RGB_BLACK'] }
    ]);

    Task_TrainerCard(data, 3, { updatePaletteFade: true });
    expect(data.mainState).toBe(8);
    Task_TrainerCard(data, 3);
    expect(data.mainState).toBe(STATE_HANDLE_INPUT_FRONT);
    expect(data.runtimeCalls.at(-1)).toEqual({ fn: 'PlaySE', args: ['SE_CARD_OPEN'] });
  });

  it('Task_TrainerCard preserves input, flip wait, link partner, and close branches', () => {
    const front = createTrainerCardData({ mainState: STATE_HANDLE_INPUT_FRONT, timeColonNeedDraw: true });

    Task_TrainerCard(front, 4);
    expect(front.timeColonNeedDraw).toBe(false);
    expect(front.printedText.slice(-4).map((entry) => entry.fn)).toEqual([
      'PrintTimeOnCard:label',
      'PrintTimeOnCard:hours',
      'PrintTimeOnCard:colon:0',
      'PrintTimeOnCard:minutes'
    ]);
    expect(front.runtimeCalls.slice(-2)).toEqual([
      { fn: 'PutWindowTilemap', args: [1] },
      { fn: 'CopyWindowToVram', args: [1, 'COPYWIN_FULL'] }
    ]);

    Task_TrainerCard(front, 4, { joyNewA: true });
    expect(front.helpContext).toBe(HELPCONTEXT_TRAINER_CARD_BACK);
    expect(front.mainState).toBe(STATE_WAIT_FLIP_TO_BACK);
    expect(front.callbacks.hblank).toBe('HBlankCB_TrainerCard');
    expect(front.runtimeCalls.at(-1)).toEqual({ fn: 'PlaySE', args: ['SE_CARD_FLIP'] });

    const waitBack = createTrainerCardData({ mainState: STATE_WAIT_FLIP_TO_BACK });
    Task_TrainerCard(waitBack, 4, { overworldLinkRecvQueueLengthMoreThan2: true });
    expect(waitBack.mainState).toBe(STATE_WAIT_FLIP_TO_BACK);
    Task_TrainerCard(waitBack, 4);
    expect(waitBack.mainState).toBe(STATE_HANDLE_INPUT_BACK);
    expect(waitBack.runtimeCalls).toEqual([{ fn: 'PlaySE', args: ['SE_CARD_OPEN'] }]);

    const backLocal = createTrainerCardData({ mainState: STATE_HANDLE_INPUT_BACK });
    Task_TrainerCard(backLocal, 4, { joyNewB: true });
    expect(backLocal.helpContext).toBe(HELPCONTEXT_TRAINER_CARD_FRONT);
    expect(backLocal.mainState).toBe(STATE_WAIT_FLIP_TO_FRONT);
    expect(backLocal.runtimeCalls.at(-1)).toEqual({ fn: 'PlaySE', args: ['SE_CARD_FLIP'] });

    const backRemote = createTrainerCardData({ mainState: STATE_HANDLE_INPUT_BACK });
    Task_TrainerCard(backRemote, 4, { joyNewA: true, receivedRemoteLinkPlayers: true });
    expect(backRemote.mainState).toBe(STATE_CLOSE_CARD);
    expect(backRemote.runtimeCalls).toEqual([
      { fn: 'BeginNormalPaletteFade', args: ['PALETTES_ALL', 0, 0, 16, 'RGB_BLACK'] }
    ]);

    const linkFront = createTrainerCardData({ mainState: STATE_HANDLE_INPUT_FRONT, isLink: true });
    Task_TrainerCard(linkFront, 4, { joyNewB: true, receivedRemoteLinkPlayers: true, inUnionRoom: true });
    expect(linkFront.mainState).toBe(STATE_WAIT_LINK_PARTNER);

    Task_TrainerCard(linkFront, 4);
    expect(linkFront.mainState).toBe(STATE_CLOSE_CARD_LINK);
    expect(linkFront.runtimeCalls.slice(-4)).toEqual([
      { fn: 'SetCloseLinkCallback', args: [] },
      { fn: 'DrawDialogueFrame', args: [0, 1] },
      { fn: 'AddTextPrinterParameterized', args: [0, 2, 'gText_WaitingTrainerFinishReading', 0, 1, 'TEXT_SKIP_DRAW', 0] },
      { fn: 'CopyWindowToVram', args: [0, 'COPYWIN_FULL'] }
    ]);

    Task_TrainerCard(linkFront, 4, { receivedRemoteLinkPlayers: true });
    expect(linkFront.mainState).toBe(STATE_CLOSE_CARD_LINK);
    Task_TrainerCard(linkFront, 4);
    expect(linkFront.mainState).toBe(STATE_CLOSE_CARD);
    expect(linkFront.runtimeCalls.at(-1)).toEqual({ fn: 'BeginNormalPaletteFade', args: ['PALETTES_ALL', 0, 0, 16, 'RGB_BLACK'] });

    linkFront.callback2 = 'Return';
    Task_TrainerCard(linkFront, 9, { updatePaletteFade: true });
    expect(linkFront.freed).toBe(false);
    Task_TrainerCard(linkFront, 9);
    expect(linkFront.freed).toBe(true);
    expect(linkFront.callbacks.main2).toBe('Return');
    expect(linkFront.runtimeCalls.slice(-2)).toEqual([
      { fn: 'FreeAllWindowBuffers', args: [] },
      { fn: 'DestroyTask', args: [9] }
    ]);

    const waitFront = createTrainerCardData({ mainState: STATE_WAIT_FLIP_TO_FRONT });
    Task_TrainerCard(waitFront, 4);
    expect(waitFront.mainState).toBe(STATE_HANDLE_INPUT_FRONT);
    expect(waitFront.runtimeCalls).toEqual([{ fn: 'PlaySE', args: ['SE_CARD_OPEN'] }]);
  });

  it('TrainerCard_GenerateCardForLinkPlayer returns early for non-FRLG card type after base RSE data', () => {
    const card = createTrainerCard();
    const stats = new Map([
      [GAME_STAT_FIRST_HOF_PLAY_TIME, (1 << 16) | (2 << 8) | 3],
      [GAME_STAT_ENTERED_HOF, 1]
    ]);

    TrainerCard_GenerateCardForLinkPlayer(card, createSources({
      gameVersion: VERSION_LEAF_GREEN,
      saveBlock2: {
        playerGender: MALE,
        playTimeHours: 9,
        playTimeMinutes: 8,
        playerTrainerId: [7, 0],
        playerName: 'RED',
        berryPick: { berriesPicked: 250 },
        pokeJump: { jumpsInRow: 250 }
      },
      getGameStat: (statId) => stats.get(statId) ?? 0,
      getCardType: () => CARD_TYPE_RSE,
      hasAllKantoMons: () => true,
      hasAllMons: () => true
    }));

    expect(card.version).toBe(VERSION_LEAF_GREEN);
    expect(card.rse.playerName).toBe('RED');
    expect(card.rse.stars).toBe(3);
    expect(card.shouldDrawStickers).toBe(false);
    expect(card.berriesPicked).toBe(0);
    expect(card.hasAllMons).toBe(false);
  });

  it('TrainerCard_GenerateCardForLinkPlayer fills FRLG link-only stats, stars, class, stickers, tint, and icon species', () => {
    const card = createTrainerCard();
    const stats = new Map([
      [GAME_STAT_FIRST_HOF_PLAY_TIME, (1 << 16) | (2 << 8) | 3],
      [GAME_STAT_ENTERED_HOF, 1],
      [GAME_STAT_BERRY_CRUSH_POINTS, 0x1ffff],
      [GAME_STAT_NUM_UNION_ROOM_BATTLES, 123]
    ]);
    const vars = new Map<string, number>([
      [VAR_HOF_BRAG_STATE, 1],
      [VAR_EGG_BRAG_STATE, 2],
      [VAR_LINK_WIN_BRAG_STATE, 3],
      [VAR_TRAINER_CARD_MON_ICON_TINT_IDX, 4],
      [VAR_TRAINER_CARD_MON_ICON_1, 10],
      [VAR_TRAINER_CARD_MON_ICON_2, 20],
      [VAR_TRAINER_CARD_MON_ICON_3, 30],
      [VAR_TRAINER_CARD_MON_ICON_4, 40],
      [VAR_TRAINER_CARD_MON_ICON_5, 50],
      [VAR_TRAINER_CARD_MON_ICON_6, 60]
    ]);

    TrainerCard_GenerateCardForLinkPlayer(card, createSources({
      saveBlock2: {
        playerGender: FEMALE,
        playTimeHours: 0,
        playTimeMinutes: 0,
        playerTrainerId: [0xff, 0xff],
        playerName: 'LEAF',
        berryPick: { berriesPicked: 200 },
        pokeJump: { jumpsInRow: 200 }
      },
      getGameStat: (statId) => stats.get(statId) ?? 0,
      hasAllKantoMons: () => true,
      hasAllMons: () => true,
      varGet: (variable) => vars.get(variable) ?? 0,
      mailSpeciesToIconSpecies: (species) => species + 100
    }));

    expect(card.version).toBe(VERSION_FIRE_RED);
    expect(card.rse.stars).toBe(4);
    expect(card.rse.caughtAllHoenn).toBe(true);
    expect(card.hasAllMons).toBe(true);
    expect(card.berriesPicked).toBe(200);
    expect(card.jumpsInRow).toBe(200);
    expect(card.berryCrushPoints).toBe(0xffff);
    expect(card.unionRoomNum).toBe(123);
    expect(card.shouldDrawStickers).toBe(true);
    expect(card.facilityClass).toBe(FACILITY_CLASS_BEAUTY);
    expect(card.stickers).toEqual([1, 2, 3]);
    expect(card.monIconTint).toBe(4);
    expect(card.monSpecies).toEqual([110, 120, 130, 140, 150, 160]);
  });

  it('BlinkTimeColon toggles only after timer increments past 60', () => {
    const data = createTrainerCardData({ timeColonBlinkTimer: 59 });

    BlinkTimeColon(data);
    expect(data.timeColonBlinkTimer).toBe(60);
    expect(data.timeColonInvisible).toBe(false);
    expect(data.timeColonNeedDraw).toBe(false);

    BlinkTimeColon(data);
    expect(data.timeColonBlinkTimer).toBe(0);
    expect(data.timeColonInvisible).toBe(true);
    expect(data.timeColonNeedDraw).toBe(true);
  });

  it('LoadCardGfx follows the exact staged asset switch and reset behavior', () => {
    const frlg = createTrainerCardData({ cardType: CARD_TYPE_FRLG, isLink: false });
    expect([0, 1, 2, 3, 4, 5].map(() => LoadCardGfx(frlg))).toEqual([false, false, false, false, false, false]);
    expect(frlg.gfxLoadState).toBe(6);
    expect(frlg.decompressedAssets).toEqual([
      { asset: 'sKantoTrainerCardBg_Tilemap', dest: 'bgTilemap' },
      { asset: 'sKantoTrainerCardBack_Tilemap', dest: 'backTilemap' },
      { asset: 'sKantoTrainerCardFront_Tilemap', dest: 'frontTilemap' },
      { asset: 'sKantoTrainerCardBadges_Gfx', dest: 'badgeTiles' },
      { asset: 'gKantoTrainerCard_Gfx', dest: 'cardTiles' },
      { asset: 'sTrainerCardStickers_Gfx', dest: 'stickerTiles' }
    ]);
    expect(LoadCardGfx(frlg)).toBe(true);
    expect(frlg.gfxLoadState).toBe(0);

    const rseLink = createTrainerCardData({ cardType: CARD_TYPE_RSE, isLink: true });
    for (let i = 0; i < 6; i++)
      LoadCardGfx(rseLink);
    expect(rseLink.decompressedAssets).toEqual([
      { asset: 'sHoennTrainerCardBg_Tilemap', dest: 'bgTilemap' },
      { asset: 'sHoennTrainerCardBack_Tilemap', dest: 'backTilemap' },
      { asset: 'sHoennTrainerCardFrontLink_Tilemap', dest: 'frontTilemap' },
      { asset: 'sKantoTrainerCardBadges_Gfx', dest: 'badgeTiles' },
      { asset: 'gHoennTrainerCard_Gfx', dest: 'cardTiles' }
    ]);
  });

  it('SetTrainerCardBgsAndPals preserves staged tile/palette loads, female palettes, buffers, and final clear', () => {
    const frlgFemale = createTrainerCardData({
      cardType: CARD_TYPE_FRLG,
      trainerCard: createTrainerCard({ rse: { gender: FEMALE, stars: 3 } })
    });

    expect([0, 1, 2, 3, 4, 5, 6].map(() => SetTrainerCardBgsAndPals(frlgFemale))).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ]);
    expect(frlgFemale.bgPalLoadState).toBe(7);
    expect(frlgFemale.loadedBgTiles).toEqual([
      { bg: 3, source: 'badgeTiles', size: 0x80 * 8, destOffset: 0 },
      { bg: 0, source: 'cardTiles', size: 0x1800, destOffset: 0 }
    ]);
    expect(frlgFemale.loadedPalettes).toEqual([
      { palette: 'sKantoTrainerCardPals[3]', offset: 0, size: 3 * PLTT_SIZE_4BPP },
      { palette: 'sKantoTrainerCardBadges_Pal', offset: 3 * 16, size: PLTT_SIZE_4BPP },
      { palette: 'sKantoTrainerCardFemaleBg_Pal', offset: 16, size: PLTT_SIZE_4BPP },
      { palette: 'sTrainerCardStar_Pal', offset: 4 * 16, size: PLTT_SIZE_4BPP }
    ]);
    expect(frlgFemale.bgTilemapBuffers).toEqual([
      { bg: 0, buffer: 'cardTilemapBuffer' },
      { bg: 2, buffer: 'bgTilemapBuffer' }
    ]);
    expect(SetTrainerCardBgsAndPals(frlgFemale)).toBe(true);
    expect(frlgFemale.fillBgTilemapBufferRectPalette0Ops).toEqual([
      { bg: 0, value: 0, x: 0, y: 0, width: 32, height: 32 },
      { bg: 2, value: 0, x: 0, y: 0, width: 32, height: 32 },
      { bg: 3, value: 0, x: 0, y: 0, width: 32, height: 32 }
    ]);

    const rseMale = createTrainerCardData({
      cardType: CARD_TYPE_RSE,
      trainerCard: createTrainerCard({ rse: { gender: MALE, stars: 2 } })
    });
    for (let i = 0; i < 7; i++)
      SetTrainerCardBgsAndPals(rseMale);
    expect(rseMale.loadedPalettes).toEqual([
      { palette: 'sHoennTrainerCardPals[2]', offset: 0, size: 3 * PLTT_SIZE_4BPP },
      { palette: 'sHoennTrainerCardBadges_Pal', offset: 3 * 16, size: PLTT_SIZE_4BPP },
      { palette: 'sTrainerCardStar_Pal', offset: 4 * 16, size: PLTT_SIZE_4BPP }
    ]);
  });

  it('UpdateCardFlipRegs truncates blend and packs WIN0V from current cardTop', () => {
    const data = createTrainerCardData({ cardTop: 23 });

    UpdateCardFlipRegs(data, 4);
    expect(data.flipBlendY).toBe(0);
    expect(data.gpuRegs[REG_OFFSET_BLDY]).toBe(0);
    expect(data.gpuRegs[REG_OFFSET_WIN0V]).toBe(WIN_RANGE(23, 137));

    data.cardTop = 77;
    UpdateCardFlipRegs(data, 77);
    expect(data.flipBlendY).toBe(11);
    expect(data.gpuRegs[REG_OFFSET_BLDY]).toBe(11);
    expect(data.gpuRegs[REG_OFFSET_WIN0V]).toBe(WIN_RANGE(77, 83));
  });

  it('Task_AnimateCardFlipDown preserves C u32 scanline math and saturates at 77', () => {
    const data = createTrainerCardData();
    const task = { data: [0, 0], tFlipState: 1 };

    expect(Task_AnimateCardFlipDown(data, task)).toBe(false);
    expect(task.data[1]).toBe(7);
    expect(task.tFlipState).toBe(1);
    expect(data.cardTop).toBe(7);
    expect(data.allowDMACopy).toBe(true);
    expect(data.scanlineEffectRegBuffers[0].slice(0, 12)).toEqual([
      0, 65535, 65534, 65533, 65532, 65531, 65530, 65529, 65529, 65529, 65529, 65529
    ]);
    expect(data.scanlineEffectRegBuffers[0].slice(75, 84)).toEqual([4, 4, 4, 4, 5, 5, 5, 5, 5]);
    expect(data.scanlineEffectRegBuffers[0].slice(153, 160)).toEqual([6, 6, 6, 6, 6, 6, 6]);

    task.data[1] = 77;
    Task_AnimateCardFlipDown(data, task);
    expect(task.data[1]).toBe(77);
    expect(task.tFlipState).toBe(2);
  });

  it('Task_AnimateCardFlipUp preserves C u32 scanline math and finishes at zero', () => {
    const data = createTrainerCardData();
    const task = { data: [0, 77], tFlipState: 4 };

    expect(Task_AnimateCardFlipUp(data, task)).toBe(false);
    expect(task.data[1]).toBe(72);
    expect(task.tFlipState).toBe(4);
    expect(data.cardTop).toBe(72);
    expect(data.allowDMACopy).toBe(true);
    expect(data.scanlineEffectRegBuffers[0].slice(0, 8)).toEqual([0, 65535, 65534, 65533, 65532, 65531, 65530, 65529]);
    expect(data.scanlineEffectRegBuffers[0].slice(72, 81)).toEqual([65464, 65468, 65473, 65479, 65485, 65492, 65499, 65507, 65515]);
    expect(data.scanlineEffectRegBuffers[0].slice(153, 160)).toEqual([72, 72, 72, 72, 72, 72, 72]);

    task.data[1] = 5;
    Task_AnimateCardFlipUp(data, task);
    expect(task.data[1]).toBe(0);
    expect(task.tFlipState).toBe(5);
  });

  it('Task_BeginCardFlip and Task_EndCardFlip preserve BG, scanline, callback, and destroy side effects', () => {
    const data = createTrainerCardData({
      callbacks: { main2: null, vblank: null, hblank: 'HBlankCB_TrainerCard' },
      scanlineEffectRegBuffers: [
        Array.from({ length: 160 }, (_, i) => i + 1),
        Array.from({ length: 160 }, (_, i) => i + 200)
      ]
    });
    const task = { data: [0, 0], tFlipState: 0 };

    expect(Task_BeginCardFlip(data, task)).toBe(false);
    expect(data.hiddenBgs).toEqual([1, 3]);
    expect(data.runtimeCalls).toEqual([
      { fn: 'ScanlineEffect_Stop', args: [] },
      { fn: 'ScanlineEffect_Clear', args: [] }
    ]);
    expect(data.scanlineEffectRegBuffers[1]).toEqual(Array.from({ length: 160 }, () => 0));
    expect(task.tFlipState).toBe(1);

    data.runtimeCalls = [];
    expect(Task_EndCardFlip(data)).toBe(false);
    expect(data.shownBgs).toEqual([1, 3]);
    expect(data.callbacks.hblank).toBeNull();
    expect(data.runtimeCalls).toEqual([{ fn: 'DestroyTask', args: ['FindTaskIdByFunc(Task_DoCardFlipTask)'] }]);
  });

  it('GetTrainerCardStars, IsCardFlipTaskActive, Task_DoCardFlipTask, and FlipTrainerCard mirror task orchestration', () => {
    const cards = [
      createTrainerCard({ rse: { stars: 1 } }),
      createTrainerCard({ rse: { stars: 4 } })
    ];
    expect(GetTrainerCardStars(cards, 1)).toBe(4);

    const data = createTrainerCardData();
    expect(IsCardFlipTaskActive(data)).toBe(true);

    data.tasks.push({ fn: 'Task_DoCardFlipTask', priority: 0 });
    expect(IsCardFlipTaskActive(data)).toBe(false);

    const calls: number[] = [];
    const task = { data: [0, 0], tFlipState: 0 };
    Task_DoCardFlipTask(data, task, [
      (_data, currentTask) => {
        calls.push(0);
        currentTask.tFlipState++;
        return true;
      },
      () => {
        calls.push(1);
        return false;
      }
    ]);
    expect(calls).toEqual([0, 1]);
    expect(task.tFlipState).toBe(1);

    const flipData = createTrainerCardData();
    const flipTask = FlipTrainerCard(flipData);
    expect(flipData.tasks).toEqual([{ fn: 'Task_DoCardFlipTask', priority: 0, task: flipTask }]);
    expect(flipTask.tFlipState).toBe(1);
    expect(flipData.hiddenBgs).toEqual([1, 3]);
    expect(flipData.callbacks.hblank).toBe('HBlankCB_TrainerCard');
  });

  it('Task_DrawFlippedCardSide follows flipDrawState gates and pauses on print helpers', () => {
    const data = createTrainerCardData({
      hasTrades: true,
      trainerCard: createTrainerCard({ rse: { playerName: 'RED', pokemonTrades: 7 } }),
      backTilemap: Array.from({ length: 600 }, (_, i) => i + 1)
    });
    BufferTextForCardBack(data);
    const task = { data: [0, 0], tFlipState: 2 };

    expect(Task_DrawFlippedCardSide(data, task, true)).toBe(false);
    expect(data.allowDMACopy).toBe(false);
    expect(data.flipDrawState).toBe(1);
    expect(data.runtimeCalls).toEqual([{ fn: 'FillWindowPixelBuffer', args: [1, 'PIXEL_FILL(0)'] }]);
    expect(data.fillBgTilemapBufferRectPalette0Ops).toEqual([{ bg: 3, value: 0, x: 0, y: 0, width: 32, height: 32 }]);

    data.runtimeCalls = [];
    expect(Task_DrawFlippedCardSide(data, task, true)).toBe(false);
    expect(data.flipDrawState).toBe(1);
    expect(data.printState).toBe(1);
    expect(data.printedText).toEqual([{ fn: 'PrintNameOnCardBack', text: 'RED' }]);

    while (data.flipDrawState === 1)
      Task_DrawFlippedCardSide(data, task, true);
    expect(data.printState).toBe(0);
    expect(data.flipDrawState).toBe(2);

    Task_DrawFlippedCardSide(data, task, true);
    expect(data.flipDrawState).toBe(3);
    expect(data.cardTilemapBuffer.slice(0, 4)).toEqual([1, 2, 3, 4]);
    expect(data.runtimeCalls.at(-1)).toEqual({ fn: 'CopyBgTilemapBufferToVram', args: [0] });

    Task_DrawFlippedCardSide(data, task, true);
    expect(data.flipDrawState).toBe(4);
    expect(data.runtimeCalls.at(-1)).toEqual({ fn: 'CopyBgTilemapBufferToVram', args: [3] });

    Task_DrawFlippedCardSide(data, task, true);
    expect(data.flipDrawState).toBe(5);

    Task_DrawFlippedCardSide(data, task, true);
    expect(task.tFlipState).toBe(3);
    expect(data.allowDMACopy).toBe(true);
    expect(data.flipDrawState).toBe(0);

    const blocked = createTrainerCardData({ flipDrawState: 0 });
    const blockedTask = { data: [0, 0], tFlipState: 2 };
    Task_DrawFlippedCardSide(blocked, blockedTask, false, true);
    expect(blocked.flipDrawState).toBe(0);
    expect(blockedTask.tFlipState).toBe(2);
    expect(blocked.allowDMACopy).toBe(false);
  });

  it('Task_SetCardFlipped toggles side, redraws front when leaving back, and plays the flip sound', () => {
    const frontTilemap = Array.from({ length: 600 }, (_, i) => i + 1000);
    const bgTilemap = Array.from({ length: 600 }, (_, i) => i + 2000);
    const data = createTrainerCardData({
      onBack: true,
      frontTilemap,
      bgTilemap,
      trainerCard: createTrainerCard({ rse: { stars: 2 } })
    });
    const task = { data: [0, 0], tFlipState: 3 };

    expect(Task_SetCardFlipped(data, task)).toBe(false);
    expect(data.onBack).toBe(false);
    expect(task.tFlipState).toBe(4);
    expect(data.allowDMACopy).toBe(true);
    expect(data.bgTilemapBuffer.slice(0, 2)).toEqual([2000, 2001]);
    expect(data.cardTilemapBuffer.slice(0, 2)).toEqual([1000, 1001]);
    expect(data.runtimeCalls).toEqual([
      { fn: 'PutWindowTilemap', args: [2] },
      { fn: 'CopyWindowToVram', args: [2, 'COPYWIN_FULL'] },
      { fn: 'CopyBgTilemapBufferToVram', args: [2] },
      { fn: 'CopyBgTilemapBufferToVram', args: [0] },
      { fn: 'CopyBgTilemapBufferToVram', args: [3] },
      { fn: 'PutWindowTilemap', args: [1] },
      { fn: 'CopyWindowToVram', args: [1, 'COPYWIN_FULL'] },
      { fn: 'PlaySE', args: ['SE_CARD_FLIPPING'] }
    ]);

    const front = createTrainerCardData({ onBack: false });
    const frontTask = { data: [0, 0], tFlipState: 3 };
    Task_SetCardFlipped(front, frontTask);
    expect(front.onBack).toBe(true);
    expect(front.runtimeCalls).toEqual([
      { fn: 'PutWindowTilemap', args: [1] },
      { fn: 'CopyWindowToVram', args: [1, 'COPYWIN_FULL'] },
      { fn: 'PlaySE', args: ['SE_CARD_FLIPPING'] }
    ]);
  });

  it('CreateTrainerCardTrainerPic preserves FRLG/RSE/link trainer-pic branches and offsets', () => {
    const frlg = createTrainerCardData({
      cardType: CARD_TYPE_FRLG,
      trainerCard: createTrainerCard({ rse: { gender: FEMALE } })
    });
    CreateTrainerCardTrainerPic(frlg);
    expect(frlg.runtimeCalls).toEqual([
      { fn: 'CreateTrainerCardTrainerPicSprite', args: ['PlayerGenderToFrontTrainerPicId(1,TRUE)', true, 13, 4, 8, 2] }
    ]);

    const rse = createTrainerCardData({
      cardType: CARD_TYPE_RSE,
      trainerCard: createTrainerCard({ rse: { gender: MALE } })
    });
    CreateTrainerCardTrainerPic(rse);
    expect(rse.runtimeCalls).toEqual([
      { fn: 'CreateTrainerCardTrainerPicSprite', args: ['FacilityClassToPicIndex(132)', true, 1, 0, 8, 2] }
    ]);

    const link = createTrainerCardData({
      cardType: CARD_TYPE_RSE,
      trainerCard: createTrainerCard({ facilityClass: 125, rse: { gender: FEMALE } })
    });
    CreateTrainerCardTrainerPic(link, true, true);
    expect(link.runtimeCalls).toEqual([
      { fn: 'CreateTrainerCardTrainerPicSprite', args: ['FacilityClassToPicIndex(125)', true, 1, 0, 8, 2] }
    ]);
  });

  it('DrawCardScreenBackground and DrawCardFrontOrBack copy 30-wide source rows into 32-wide buffers with ptr[0] padding', () => {
    const data = createTrainerCardData();
    const source = Array.from({ length: 30 * 20 }, (_, i) => i + 10);

    DrawCardScreenBackground(data, source);
    expect(data.bgTilemapBuffer.slice(0, 34)).toEqual([
      ...Array.from({ length: 30 }, (_, i) => i + 10),
      10,
      10,
      40,
      41
    ]);
    expect(data.bgTilemapBuffer.slice(32 * 19 + 28, 32 * 20)).toEqual([608, 609, 10, 10]);
    expect(data.runtimeCalls).toEqual([{ fn: 'CopyBgTilemapBufferToVram', args: [2] }]);

    data.runtimeCalls = [];
    DrawCardFrontOrBack(data, source);
    expect(data.cardTilemapBuffer.slice(0, 34)).toEqual([
      ...Array.from({ length: 30 }, (_, i) => i + 10),
      10,
      10,
      40,
      41
    ]);
    expect(data.cardTilemapBuffer.slice(32 * 19 + 28, 32 * 20)).toEqual([608, 609, 10, 10]);
    expect(data.runtimeCalls).toEqual([{ fn: 'CopyBgTilemapBufferToVram', args: [0] }]);
  });

  it('DrawStarsAndBadgesOnCard emits the same tile rectangles and skips badges for link cards', () => {
    const data = createTrainerCardData({
      cardType: CARD_TYPE_FRLG,
      hasBadge: [true, false, true, false, false, false, false, true],
      trainerCard: createTrainerCard({ rse: { stars: 3 } })
    });

    DrawStarsAndBadgesOnCard(data);
    expect(data.bgOps[0]).toEqual({ bg: 3, tileNum: 143, x: 15, y: 7, width: 3, height: 1, palNum: 4 });
    expect(data.bgOps.slice(1, 5)).toEqual([
      { bg: 3, tileNum: 192, x: 4, y: 16, width: 1, height: 1, palNum: 3 },
      { bg: 3, tileNum: 193, x: 5, y: 16, width: 1, height: 1, palNum: 3 },
      { bg: 3, tileNum: 208, x: 4, y: 17, width: 1, height: 1, palNum: 3 },
      { bg: 3, tileNum: 209, x: 5, y: 17, width: 1, height: 1, palNum: 3 }
    ]);
    expect(data.bgOps.at(-1)).toEqual({ bg: 3, tileNum: 223, x: 26, y: 17, width: 1, height: 1, palNum: 3 });
    expect(data.runtimeCalls).toEqual([{ fn: 'CopyBgTilemapBufferToVram', args: [3] }]);

    const linkData = createTrainerCardData({ isLink: true, trainerCard: createTrainerCard({ rse: { stars: 1 } }) });
    DrawStarsAndBadgesOnCard(linkData);
    expect(linkData.bgOps).toEqual([{ bg: 3, tileNum: 143, x: 15, y: 7, width: 1, height: 1, palNum: 4 }]);
    expect(linkData.runtimeCalls).toEqual([{ fn: 'CopyBgTilemapBufferToVram', args: [3] }]);
  });

  it('DrawCardBackStats and PrintStickersOnCard honor FRLG/RSE gates and exact tile coordinates', () => {
    const frlg = createTrainerCardData({
      cardType: CARD_TYPE_FRLG,
      hasTrades: true,
      trainerCard: createTrainerCard({ berryCrushPoints: 1, unionRoomNum: 2, shouldDrawStickers: true, stickers: [1, 0, 4] })
    });

    DrawCardBackStats(frlg);
    expect(frlg.bgOps).toEqual([
      { bg: 3, tileNum: 141, x: 26, y: 9, width: 1, height: 1, palNum: 1 },
      { bg: 3, tileNum: 157, x: 26, y: 10, width: 1, height: 1, palNum: 1 },
      { bg: 3, tileNum: 141, x: 21, y: 13, width: 1, height: 1, palNum: 1 },
      { bg: 3, tileNum: 157, x: 21, y: 14, width: 1, height: 1, palNum: 1 },
      { bg: 3, tileNum: 141, x: 27, y: 11, width: 1, height: 1, palNum: 1 },
      { bg: 3, tileNum: 157, x: 27, y: 12, width: 1, height: 1, palNum: 1 }
    ]);
    expect(frlg.runtimeCalls).toEqual([{ fn: 'CopyBgTilemapBufferToVram', args: [3] }]);

    frlg.bgOps = [];
    frlg.runtimeCalls = [];
    PrintStickersOnCard(frlg);
    expect(frlg.bgOps).toEqual([
      { bg: 3, tileNum: 320, x: 2, y: 2, width: 2, height: 2, palNum: 11 },
      { bg: 3, tileNum: 328, x: 8, y: 2, width: 2, height: 2, palNum: 14 }
    ]);

    const rse = createTrainerCardData({ cardType: CARD_TYPE_RSE, hasTrades: true, trainerCard: createTrainerCard({ shouldDrawStickers: true, stickers: [1, 2, 3] }) });
    DrawCardBackStats(rse);
    PrintStickersOnCard(rse);
    expect(rse.bgOps).toEqual([
      { bg: 3, tileNum: 141, x: 26, y: 9, width: 1, height: 1, palNum: 0 },
      { bg: 3, tileNum: 157, x: 26, y: 10, width: 1, height: 1, palNum: 0 }
    ]);
    expect(rse.runtimeCalls).toEqual([{ fn: 'CopyBgTilemapBufferToVram', args: [3] }]);
  });

  it('front and back print sequencers advance state then reset on default exactly', () => {
    const data = createTrainerCardData({
      trainerCard: createTrainerCard({
        rse: { playerName: 'RED', trainerId: 0x1234, money: 500, hasPokedex: true, caughtMonsCount: 12, playTimeHours: 1, playTimeMinutes: 2 }
      })
    });

    expect([0, 1, 2, 3, 4, 5].map(() => PrintAllOnCardFront(data))).toEqual([false, false, false, false, false, false]);
    expect(data.printState).toBe(6);
    expect(PrintAllOnCardFront(data)).toBe(true);
    expect(data.printState).toBe(0);
    expect(data.printedText.map((entry) => entry.fn)).toEqual([
      'PrintNameOnCardFront',
      'PrintIdOnCard',
      'PrintMoneyOnCard:label',
      'PrintMoneyOnCard:value:110',
      'PrintPokedexOnCard:label',
      'PrintPokedexOnCard:value:124',
      'PrintPokedexOnCard:null',
      'PrintTimeOnCard:label',
      'PrintTimeOnCard:hours',
      'PrintTimeOnCard:colon:0',
      'PrintTimeOnCard:minutes'
    ]);

    data.printedText = [];
    data.printState = 0;
    BufferTextForCardBack(data);
    expect([0, 1, 2, 3, 4, 5, 6, 7].map(() => PrintAllOnCardBack(data))).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ]);
    expect(data.printState).toBe(8);
    expect(PrintAllOnCardBack(data)).toBe(true);
    expect(data.printState).toBe(0);
    expect(data.printedText.map((entry) => entry.fn)).toEqual(['PrintNameOnCardBack']);
  });

  it('back text buffers preserve C gates and right/zero/left decimal formatting', () => {
    const frlg = createTrainerCardData({
      cardType: CARD_TYPE_FRLG,
      hasHofResult: true,
      hasLinkResults: true,
      hasTrades: true,
      trainerCard: createTrainerCard({
        berryCrushPoints: 55,
        unionRoomNum: 7,
        rse: {
          playerName: 'LEAF',
          hofDebutHours: 9,
          hofDebutMinutes: 3,
          hofDebutSeconds: 4,
          linkBattleWins: 12,
          linkBattleLosses: 345,
          pokemonTrades: 678
        }
      })
    });

    BufferNameForCardBack(frlg);
    BufferHofDebutTime(frlg);
    BufferLinkBattleResults(frlg);
    BufferNumTrades(frlg);
    BufferBerryCrushPoints(frlg);
    BufferUnionRoomStats(frlg);

    expect(frlg.strings[TRAINER_CARD_STRING_NAME]).toBe('LEAF');
    expect(frlg.strings[TRAINER_CARD_STRING_HOF_TIME]).toBe('  9:03:04');
    expect(frlg.strings[TRAINER_CARD_STRING_LINK_RECORD]).toBe('LINK BATTLES');
    expect(frlg.strings[TRAINER_CARD_STRING_LINK_WINS]).toBe('  12');
    expect(frlg.strings[TRAINER_CARD_STRING_LINK_LOSSES]).toBe(' 345');
    expect(frlg.strings[TRAINER_CARD_STRING_TRADES]).toBe('POKéMON TRADES');
    expect(frlg.strings[TRAINER_CARD_STRING_TRADE_COUNT]).toBe('  678');
    expect(frlg.strings[TRAINER_CARD_STRING_BERRY_CRUSH]).toBe('BERRY CRUSH');
    expect(frlg.strings[TRAINER_CARD_STRING_BERRY_CRUSH_COUNT]).toBe('   55');
    expect(frlg.strings[TRAINER_CARD_STRING_UNION_ROOM]).toBe('UNION ROOM');
    expect(frlg.strings[TRAINER_CARD_STRING_UNION_ROOM_NUM]).toBe('    7');

    const rse = createTrainerCardData({
      cardType: CARD_TYPE_RSE,
      hasLinkResults: true,
      trainerCard: createTrainerCard({ rse: { playerName: 'MAY', linkBattleWins: 1, linkBattleLosses: 2 } })
    });
    BufferTextForCardBack(rse);
    expect(rse.strings[TRAINER_CARD_STRING_NAME]).toBe("MAY's TRAINER CARD");
    expect(rse.strings[TRAINER_CARD_STRING_LINK_RECORD]).toBe('LINK CABLE BATTLES');
    expect(rse.strings[TRAINER_CARD_STRING_BERRY_CRUSH]).toBe('');
    expect(rse.strings[TRAINER_CARD_STRING_UNION_ROOM]).toBe('');
  });

  it('money and time front helpers preserve unsigned x wrap and play-time caps', () => {
    const frlg = createTrainerCardData({ cardType: CARD_TYPE_FRLG, trainerCard: createTrainerCard({ rse: { money: 999999, playTimeHours: 2000, playTimeMinutes: 90 } }) });

    PrintMoneyOnCard(frlg);
    expect(frlg.printedText).toContainEqual({ fn: 'PrintMoneyOnCard:value:92', text: '¥999999' });

    PrintTimeOnCard(frlg, 2000, 90);
    expect(frlg.printedText.slice(-4)).toEqual([
      { fn: 'PrintTimeOnCard:label', text: 'TIME' },
      { fn: 'PrintTimeOnCard:hours', text: '999' },
      { fn: 'PrintTimeOnCard:colon:0', text: ':' },
      { fn: 'PrintTimeOnCard:minutes', text: '59' }
    ]);

    const rse = createTrainerCardData({ cardType: CARD_TYPE_RSE, isLink: true, timeColonInvisible: true, trainerCard: createTrainerCard({ rse: { money: 5, playTimeHours: 4, playTimeMinutes: 6 } }) });
    PrintMoneyOnCard(rse);
    PrintTimeOnCard(rse, 999, 59);
    expect(rse.printedText).toContainEqual({ fn: 'PrintMoneyOnCard:value:106', text: '¥5' });
    expect(rse.printedText.slice(-4)).toEqual([
      { fn: 'PrintTimeOnCard:label', text: 'TIME' },
      { fn: 'PrintTimeOnCard:hours', text: '  4' },
      { fn: 'PrintTimeOnCard:colon:1', text: ':' },
      { fn: 'PrintTimeOnCard:minutes', text: '06' }
    ]);
  });

  it('GetCaughtMonsCount uses national dex when enabled and Kanto dex otherwise', () => {
    expect(GetCaughtMonsCount({
      isNationalPokedexEnabled: () => true,
      getNationalPokedexCount: (flag) => flag === 'FLAG_GET_CAUGHT' ? 386 : 0,
      getKantoPokedexCount: () => 151
    })).toBe(386);

    expect(GetCaughtMonsCount({
      isNationalPokedexEnabled: () => false,
      getNationalPokedexCount: () => 386,
      getKantoPokedexCount: (flag) => flag === 'FLAG_GET_CAUGHT' ? 151 : 0
    })).toBe(151);
  });

  it('PrintPokemonIconsOnCard copies palette/x offset tables and skips RSE cards', () => {
    const frlg = createTrainerCardData({
      cardType: CARD_TYPE_FRLG,
      trainerCard: createTrainerCard({ monSpecies: [25, 0, 4, 7, 0, 150] })
    });

    PrintPokemonIconsOnCard(frlg, (species) => species % 6);
    expect(frlg.bgOps).toEqual([
      { bg: 3, tileNum: 224, x: 3, y: 15, width: 4, height: 4, palNum: 6 },
      { bg: 3, tileNum: 256, x: 11, y: 15, width: 4, height: 4, palNum: 9 },
      { bg: 3, tileNum: 272, x: 15, y: 15, width: 4, height: 4, palNum: 6 },
      { bg: 3, tileNum: 304, x: 23, y: 15, width: 4, height: 4, palNum: 5 }
    ]);

    const rse = createTrainerCardData({ cardType: CARD_TYPE_RSE, trainerCard: createTrainerCard({ monSpecies: [25, 4, 7, 1, 2, 3] }) });
    PrintPokemonIconsOnCard(rse);
    expect(rse.bgOps).toEqual([]);
  });

  it('LoadMonIconGfx copies palettes, applies exact tint branch, loads palette, and loads six icon tile slots', () => {
    const pink = createTrainerCardData({
      trainerCard: createTrainerCard({ monIconTint: MON_ICON_TINT_PINK, monSpecies: [1, 2, 3, 4, 5, 6] })
    });

    LoadMonIconGfx(pink);

    expect(pink.runtimeCalls).toEqual([
      { fn: 'CpuCopy16', args: ['gMonIconPalettes', 'monIconPals', 192] },
      { fn: 'TintPalette_CustomTone', args: ['monIconPals', 96, 500, 330, 310] }
    ]);
    expect(pink.loadedPalettes).toEqual([{ palette: 'monIconPals', offset: 5 * 16, size: 192 }]);
    expect(pink.loadedBgTiles).toEqual([
      { bg: 3, source: 'GetMonIconTiles(1,0)', size: 512, destOffset: 32 },
      { bg: 3, source: 'GetMonIconTiles(2,0)', size: 512, destOffset: 48 },
      { bg: 3, source: 'GetMonIconTiles(3,0)', size: 512, destOffset: 64 },
      { bg: 3, source: 'GetMonIconTiles(4,0)', size: 512, destOffset: 80 },
      { bg: 3, source: 'GetMonIconTiles(5,0)', size: 512, destOffset: 96 },
      { bg: 3, source: 'GetMonIconTiles(6,0)', size: 512, destOffset: 112 }
    ]);

    const normal = createTrainerCardData({ trainerCard: createTrainerCard({ monIconTint: MON_ICON_TINT_NORMAL }) });
    LoadMonIconGfx(normal);
    expect(normal.runtimeCalls).toEqual([{ fn: 'CpuCopy16', args: ['gMonIconPalettes', 'monIconPals', 192] }]);

    const black = createTrainerCardData({ trainerCard: createTrainerCard({ monIconTint: MON_ICON_TINT_BLACK }) });
    LoadMonIconGfx(black);
    expect(black.runtimeCalls[1]).toEqual({ fn: 'TintPalette_CustomTone', args: ['monIconPals', 96, 0, 0, 0] });

    const sepia = createTrainerCardData({ trainerCard: createTrainerCard({ monIconTint: MON_ICON_TINT_SEPIA }) });
    LoadMonIconGfx(sepia);
    expect(sepia.runtimeCalls[1]).toEqual({ fn: 'TintPalette_SepiaTone', args: ['monIconPals', 96] });
  });

  it('LoadStickerGfx and DrawTrainerCardWindow preserve palette/tile/window side effects', () => {
    const data = createTrainerCardData();

    LoadStickerGfx(data);
    expect(data.loadedPalettes).toEqual([
      { palette: 'sTrainerCardStickerPal1', offset: 11 * 16, size: PLTT_SIZE_4BPP },
      { palette: 'sTrainerCardStickerPal2', offset: 12 * 16, size: PLTT_SIZE_4BPP },
      { palette: 'sTrainerCardStickerPal3', offset: 13 * 16, size: PLTT_SIZE_4BPP },
      { palette: 'sTrainerCardStickerPal4', offset: 14 * 16, size: PLTT_SIZE_4BPP }
    ]);
    expect(data.loadedBgTiles).toEqual([{ bg: 3, source: 'stickerTiles', size: 1024, destOffset: 128 }]);

    DrawTrainerCardWindow(data, 1);
    expect(data.runtimeCalls).toEqual([
      { fn: 'PutWindowTilemap', args: [1] },
      { fn: 'CopyWindowToVram', args: [1, 'COPYWIN_FULL'] }
    ]);
  });
});
