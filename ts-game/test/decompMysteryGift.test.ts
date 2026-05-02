import { describe, expect, it } from 'vitest';
import {
  CARD_STAT_BATTLES_LOST,
  CARD_STAT_BATTLES_WON,
  CARD_STAT_MAX_STAMPS,
  CARD_STAT_NUM_STAMPS,
  CARD_STAT_NUM_TRADES,
  CARD_TYPE_COUNT,
  CARD_TYPE_GIFT,
  CARD_TYPE_LINK_STAT,
  CARD_TYPE_STAMP,
  FLAG_RECEIVED_AURORA_TICKET,
  GAME_DATA_VALID_VAR,
  GetQuestionnaireWordsPtr,
  GetSavedWonderCard,
  GetSavedWonderCardMetadata,
  GetSavedWonderNews,
  GetSavedWonderNewsMetadata,
  GetWonderCardFlagId,
  IncrementCardStat,
  IsSavedWonderCardGiftNotReceived,
  IsSendingSavedWonderCardAllowed,
  IsSendingSavedWonderNewsAllowed,
  IsStampInMetadata,
  IsWonderCardFlagIDInValidRange,
  IsWonderNewsSameAsSaved,
  MAX_STAMP_CARD_STAMPS,
  MAX_WONDER_CARD_STAT,
  MysteryGift_CheckStamps,
  MysteryGift_CompareCardFlags,
  MysteryGift_DisableStats,
  MysteryGift_DoesQuestionnaireMatch,
  MysteryGift_GetCardStat,
  MysteryGift_GetCardStatFromLinkData,
  MysteryGift_LoadLinkGameData,
  MysteryGift_TryEnableStatsByFlagId,
  MysteryGift_TryIncrementStat,
  MysteryGift_TrySaveStamp,
  MysteryGift_ValidateLinkGameData,
  NUM_WONDER_BGS,
  RecordTrainerId,
  SEND_TYPE_ALLOWED,
  SEND_TYPE_ALLOWED_ALWAYS,
  SEND_TYPE_DISALLOWED,
  STAMP_ID,
  STAMP_SPECIES,
  VERSION_CODE,
  WONDER_CARD_FLAG_OFFSET,
  ClearMysteryGift,
  ClearSavedTrainerIds,
  ClearSavedWonderCardAndRelated,
  ClearSavedWonderNewsAndRelated,
  DisableWonderCardSending,
  SaveWonderCard,
  SaveWonderNews,
  ValidateSavedWonderCard,
  ValidateSavedWonderNews,
  ValidateStamp,
  ValidateWonderCard,
  ValidateWonderNews,
  createMysteryGiftLinkGameData,
  createMysteryGiftRuntime,
  createWonderCard,
  createWonderCardMetadata,
  createWonderNews,
  serializeWonderNews,
} from '../src/game/decompMysteryGift';

describe('decompMysteryGift', () => {
  it('clears Mystery Gift save data and exposes saved object pointers', () => {
    const runtime = createMysteryGiftRuntime();
    runtime.gSaveBlock1Ptr.mysteryGift.news = createWonderNews({ id: 77 });
    runtime.gSaveBlock1Ptr.mysteryGift.card = createWonderCard({ flagId: 1000 });

    ClearMysteryGift(runtime);

    expect(GetSavedWonderNews(runtime).id).toBe(0);
    expect(GetSavedWonderCard(runtime).flagId).toBe(0);
    expect(GetSavedWonderCardMetadata(runtime).iconSpecies).toBe(0);
    expect(GetSavedWonderNewsMetadata(runtime)).toEqual({ newsType: 0, sentRewardCounter: 0, rewardCounter: 0, berry: 0 });
    expect(GetQuestionnaireWordsPtr(runtime)).toEqual([0, 0, 0, 0]);
    expect(runtime.wonderNewsResetCount).toBe(1);
    expect(runtime.questionnaireInitialized).toBe(true);
  });

  it('saves, validates, compares, and clears Wonder News exactly by id and CRC', () => {
    const runtime = createMysteryGiftRuntime();
    const invalid = createWonderNews({ id: 0, sendType: SEND_TYPE_ALLOWED });
    const news = createWonderNews({ id: 3, sendType: SEND_TYPE_ALLOWED, titleText: [1, 2, 3] });

    expect(ValidateWonderNews(invalid)).toBe(false);
    expect(SaveWonderNews(runtime, invalid)).toBe(false);
    expect(SaveWonderNews(runtime, news)).toBe(true);
    expect(ValidateSavedWonderNews(runtime)).toBe(true);
    expect(IsSendingSavedWonderNewsAllowed(runtime)).toBe(true);
    expect(IsWonderNewsSameAsSaved(runtime, serializeWonderNews(news))).toBe(true);
    expect(IsWonderNewsSameAsSaved(runtime, [0])).toBe(false);

    runtime.gSaveBlock1Ptr.mysteryGift.news.id = 4;
    expect(ValidateSavedWonderNews(runtime)).toBe(false);
    runtime.gSaveBlock1Ptr.mysteryGift.news = createWonderNews({ id: 9, sendType: SEND_TYPE_DISALLOWED });
    expect(IsSendingSavedWonderNewsAllowed(runtime)).toBe(false);

    ClearSavedWonderNewsAndRelated(runtime);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.newsCrc).toBe(0);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.news.id).toBe(0);
  });

  it('validates Wonder Cards, saves metadata icon species, and clears related data', () => {
    const runtime = createMysteryGiftRuntime();
    expect(ValidateWonderCard(createWonderCard({ flagId: 0 }))).toBe(false);
    expect(ValidateWonderCard(createWonderCard({ flagId: 1, type: CARD_TYPE_COUNT }))).toBe(false);
    expect(ValidateWonderCard(createWonderCard({ flagId: 1, sendType: 3 }))).toBe(false);
    expect(ValidateWonderCard(createWonderCard({ flagId: 1, bgType: NUM_WONDER_BGS }))).toBe(false);
    expect(ValidateWonderCard(createWonderCard({ flagId: 1, maxStamps: MAX_STAMP_CARD_STAMPS + 1 }))).toBe(false);

    runtime.gSaveBlock1Ptr.mysteryGift.trainerIds[0] = [1, 2, 3, 4, 5];
    const card = createWonderCard({ flagId: WONDER_CARD_FLAG_OFFSET, iconSpecies: 25, type: CARD_TYPE_GIFT, sendType: SEND_TYPE_ALLOWED });
    expect(SaveWonderCard(runtime, card)).toBe(true);
    expect(ValidateSavedWonderCard(runtime)).toBe(true);
    expect(GetSavedWonderCardMetadata(runtime).iconSpecies).toBe(25);
    expect(runtime.ramScriptCleared).toBe(true);
    expect(runtime.mysteryGiftFlagsCleared).toBe(true);
    expect(runtime.mysteryGiftVarsCleared).toBe(true);
    expect(runtime.eReaderTrainerCleared).toBe(true);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.trainerIds[0]).toEqual([0, 0, 0, 0, 0]);

    runtime.ramScriptValid = false;
    expect(ValidateSavedWonderCard(runtime)).toBe(false);
    runtime.ramScriptValid = true;
    expect(GetWonderCardFlagId(runtime)).toBe(WONDER_CARD_FLAG_OFFSET);
    expect(IsSendingSavedWonderCardAllowed(runtime)).toBe(true);

    const sendCard = createWonderCard({ flagId: 1, sendType: SEND_TYPE_ALLOWED });
    DisableWonderCardSending(sendCard);
    expect(sendCard.sendType).toBe(SEND_TYPE_DISALLOWED);
    const alwaysCard = createWonderCard({ flagId: 1, sendType: SEND_TYPE_ALLOWED_ALWAYS });
    DisableWonderCardSending(alwaysCard);
    expect(alwaysCard.sendType).toBe(SEND_TYPE_ALLOWED_ALWAYS);

    ClearSavedWonderCardAndRelated(runtime);
    expect(GetSavedWonderCard(runtime).flagId).toBe(0);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.cardCrc).toBe(0);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadataCrc).toBe(0);
  });

  it('received-gift checks use the Wonder Card flag offset and received flag table', () => {
    const runtime = createMysteryGiftRuntime();
    expect(IsWonderCardFlagIDInValidRange(WONDER_CARD_FLAG_OFFSET - 1)).toBe(false);
    expect(IsWonderCardFlagIDInValidRange(WONDER_CARD_FLAG_OFFSET)).toBe(true);
    expect(IsWonderCardFlagIDInValidRange(WONDER_CARD_FLAG_OFFSET + 20)).toBe(false);

    SaveWonderCard(runtime, createWonderCard({ flagId: WONDER_CARD_FLAG_OFFSET, sendType: SEND_TYPE_ALLOWED }));
    expect(IsSavedWonderCardGiftNotReceived(runtime)).toBe(true);
    runtime.flags.add(FLAG_RECEIVED_AURORA_TICKET);
    expect(IsSavedWonderCardGiftNotReceived(runtime)).toBe(false);
  });

  it('stamp helpers reject invalid or duplicate stamps and fill the first empty slot', () => {
    const runtime = createMysteryGiftRuntime();
    SaveWonderCard(runtime, createWonderCard({ flagId: 1000, type: CARD_TYPE_STAMP, sendType: SEND_TYPE_ALLOWED, maxStamps: 2 }));

    expect(ValidateStamp([1, 0])).toBe(false);
    expect(ValidateStamp([412, 1])).toBe(false);
    expect(ValidateStamp([25, 0])).toBe(false);
    expect(ValidateStamp([25, 7])).toBe(true);

    expect(MysteryGift_TrySaveStamp(runtime, [25, 7])).toBe(true);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.stampData[STAMP_SPECIES][0]).toBe(25);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.stampData[STAMP_ID][0]).toBe(7);
    expect(IsStampInMetadata(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata, [30, 7], 2)).toBe(true);
    expect(IsStampInMetadata(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata, [25, 9], 2)).toBe(true);
    expect(MysteryGift_TrySaveStamp(runtime, [30, 7])).toBe(false);
    expect(MysteryGift_TrySaveStamp(runtime, [26, 8])).toBe(true);
    expect(MysteryGift_TrySaveStamp(runtime, [27, 9])).toBe(false);
    expect(MysteryGift_GetCardStat(runtime, CARD_STAT_NUM_STAMPS)).toBe(2);
    expect(MysteryGift_GetCardStat(runtime, CARD_STAT_MAX_STAMPS)).toBe(2);
  });

  it('link game data loading and validation mirrors magic fields and saved card branch', () => {
    const runtime = createMysteryGiftRuntime();
    const data = createMysteryGiftLinkGameData();
    runtime.gSaveBlock1Ptr.mysteryGift.questionnaireWords = [11, 22, 33, 44];
    runtime.gSaveBlock2Ptr.playerTrainerId = [1, 2, 3, 4];
    runtime.gSaveBlock2Ptr.playerName = [65, 66, 67, 0, 0, 0, 0, 0];
    runtime.gSaveBlock1Ptr.easyChatProfile = [9, 8, 7, 6, 5, 4];
    runtime.romHeaderSoftwareVersion = 3;

    MysteryGift_LoadLinkGameData(runtime, data);
    expect(data).toMatchObject({ unk_00: GAME_DATA_VALID_VAR, unk_04: 1, unk_08: 1, unk_0C: 1, unk_10: VERSION_CODE, flagId: 0 });
    expect(data.questionnaireWords).toEqual([11, 22, 33, 44]);
    expect(data.playerTrainerId).toEqual([1, 2, 3, 4]);
    expect(data.playerName).toEqual([65, 66, 67, 0, 0, 0, 0]);
    expect(data.easyChatProfile).toEqual([9, 8, 7, 6, 5, 4]);
    expect(data.gameCode).toEqual([0x42, 0x50, 0x52, 0x45]);
    expect(data.version).toBe(3);
    expect(MysteryGift_ValidateLinkGameData(data)).toBe(true);

    SaveWonderCard(runtime, createWonderCard({ flagId: 1234, type: CARD_TYPE_STAMP, sendType: SEND_TYPE_ALLOWED, maxStamps: 3 }));
    runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.stampData[STAMP_SPECIES][0] = 10;
    runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.stampData[STAMP_ID][0] = 20;
    MysteryGift_LoadLinkGameData(runtime, data);
    expect(data.flagId).toBe(1234);
    expect(data.maxStamps).toBe(3);
    expect(data.cardMetadata.stampData[STAMP_ID][0]).toBe(20);

    data.unk_00 = 0;
    expect(MysteryGift_ValidateLinkGameData(data)).toBe(false);
    data.unk_00 = GAME_DATA_VALID_VAR;
    data.unk_10 = 0;
    expect(MysteryGift_ValidateLinkGameData(data)).toBe(false);
  });

  it('server comparison helpers and link stat reads preserve return codes', () => {
    const runtime = createMysteryGiftRuntime();
    const data = createMysteryGiftLinkGameData();
    data.flagId = 0;
    expect(MysteryGift_CompareCardFlags(10, data)).toBe(0);
    data.flagId = 10;
    expect(MysteryGift_CompareCardFlags(10, data)).toBe(1);
    expect(MysteryGift_CompareCardFlags(11, data)).toBe(2);

    data.maxStamps = 3;
    expect(MysteryGift_CheckStamps([1, 1], data)).toBe(2);
    data.cardMetadata.stampData[STAMP_SPECIES][0] = 1;
    data.cardMetadata.stampData[STAMP_ID][0] = 1;
    expect(MysteryGift_CheckStamps([1, 2], data)).toBe(3);
    data.cardMetadata.stampData[STAMP_SPECIES][1] = 2;
    data.cardMetadata.stampData[STAMP_ID][1] = 2;
    expect(MysteryGift_CheckStamps([3, 3], data)).toBe(4);
    data.cardMetadata.stampData[STAMP_SPECIES][2] = 3;
    data.cardMetadata.stampData[STAMP_ID][2] = 3;
    expect(MysteryGift_CheckStamps([4, 4], data)).toBe(1);

    data.questionnaireWords = [1, 2, 3, 4];
    expect(MysteryGift_DoesQuestionnaireMatch(data, [1, 2, 3, 4])).toBe(true);
    expect(MysteryGift_DoesQuestionnaireMatch(data, [1, 2, 3, 5])).toBe(false);
    data.cardMetadata = createWonderCardMetadata({ battlesWon: 5, battlesLost: 6, numTrades: 7, stampData: [[1, 2, 0, 0, 0, 0, 0], [3, 4, 0, 0, 0, 0, 0]] });
    data.maxStamps = 4;
    expect(MysteryGift_GetCardStatFromLinkData(runtime, data, CARD_STAT_BATTLES_WON)).toBe(5);
    expect(MysteryGift_GetCardStatFromLinkData(runtime, data, CARD_STAT_BATTLES_LOST)).toBe(6);
    expect(MysteryGift_GetCardStatFromLinkData(runtime, data, CARD_STAT_NUM_TRADES)).toBe(7);
    expect(MysteryGift_GetCardStatFromLinkData(runtime, data, CARD_STAT_NUM_STAMPS)).toBe(2);
    expect(MysteryGift_GetCardStatFromLinkData(runtime, data, CARD_STAT_MAX_STAMPS)).toBe(4);
    expect(MysteryGift_GetCardStatFromLinkData(runtime, data, 99)).toBe(0);
    expect(runtime.assertions).toContain('MysteryGift_GetCardStatFromLinkData');
  });

  it('card stat getters and increment helpers only work for matching card types and cap at 999', () => {
    const runtime = createMysteryGiftRuntime();
    SaveWonderCard(runtime, createWonderCard({ flagId: 1000, type: CARD_TYPE_LINK_STAT, sendType: SEND_TYPE_ALLOWED }));
    runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.battlesWon = MAX_WONDER_CARD_STAT;
    IncrementCardStat(runtime, CARD_STAT_BATTLES_WON);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.battlesWon).toBe(MAX_WONDER_CARD_STAT);
    IncrementCardStat(runtime, CARD_STAT_BATTLES_LOST);
    IncrementCardStat(runtime, CARD_STAT_NUM_TRADES);
    expect(MysteryGift_GetCardStat(runtime, CARD_STAT_BATTLES_LOST)).toBe(1);
    expect(MysteryGift_GetCardStat(runtime, CARD_STAT_NUM_TRADES)).toBe(1);
    expect(MysteryGift_GetCardStat(runtime, CARD_STAT_NUM_STAMPS)).toBe(0);
    expect(runtime.assertions).toContain('MysteryGift_GetCardStat');
  });

  it('stat enable and trainer-id recording match the C recency array behavior', () => {
    const runtime = createMysteryGiftRuntime();
    SaveWonderCard(runtime, createWonderCard({ flagId: 2000, type: CARD_TYPE_LINK_STAT, sendType: SEND_TYPE_ALLOWED }));

    expect(MysteryGift_TryEnableStatsByFlagId(runtime, 0)).toBe(false);
    expect(MysteryGift_TryEnableStatsByFlagId(runtime, 1999)).toBe(false);
    expect(MysteryGift_TryEnableStatsByFlagId(runtime, 2000)).toBe(true);
    MysteryGift_TryIncrementStat(runtime, CARD_STAT_BATTLES_WON, 101);
    MysteryGift_TryIncrementStat(runtime, CARD_STAT_BATTLES_WON, 101);
    MysteryGift_TryIncrementStat(runtime, CARD_STAT_BATTLES_LOST, 102);
    MysteryGift_TryIncrementStat(runtime, CARD_STAT_NUM_TRADES, 201);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.battlesWon).toBe(1);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.battlesLost).toBe(1);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.numTrades).toBe(1);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.trainerIds[0].slice(0, 2)).toEqual([102, 101]);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.trainerIds[1][0]).toBe(201);

    MysteryGift_DisableStats(runtime);
    MysteryGift_TryIncrementStat(runtime, CARD_STAT_NUM_TRADES, 202);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.numTrades).toBe(1);

    const ids = [1, 2, 3, 4, 5];
    expect(RecordTrainerId(6, ids, ids.length)).toBe(true);
    expect(ids).toEqual([6, 1, 2, 3, 4]);
    expect(RecordTrainerId(3, ids, ids.length)).toBe(false);
    expect(ids).toEqual([3, 6, 1, 2, 4]);
    ClearSavedTrainerIds(runtime);
    expect(runtime.gSaveBlock1Ptr.mysteryGift.trainerIds[0]).toEqual([0, 0, 0, 0, 0]);
  });
});
