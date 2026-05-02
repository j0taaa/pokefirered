import { calcCRC16WithTable } from './decompUtil';

export const CARD_STAT_BATTLES_WON = 0;
export const CARD_STAT_BATTLES_LOST = 1;
export const CARD_STAT_NUM_TRADES = 2;
export const CARD_STAT_NUM_STAMPS = 3;
export const CARD_STAT_MAX_STAMPS = 4;

export const CARD_TYPE_GIFT = 0;
export const CARD_TYPE_STAMP = 1;
export const CARD_TYPE_LINK_STAT = 2;
export const CARD_TYPE_COUNT = 3;

export const SEND_TYPE_DISALLOWED = 0;
export const SEND_TYPE_ALLOWED = 1;
export const SEND_TYPE_ALLOWED_ALWAYS = 2;

export const STAMP_SPECIES = 0;
export const STAMP_ID = 1;
export const NUM_WONDER_BGS = 8;
export const MAX_WONDER_CARD_STAT = 999;
export const WONDER_CARD_FLAG_OFFSET = 1000;
export const NUM_WONDER_CARD_FLAGS = 20;

export const PLAYER_NAME_LENGTH = 7;
export const TRAINER_ID_LENGTH = 4;
export const GAME_CODE_LENGTH = 4;
export const EASY_CHAT_BATTLE_WORDS_COUNT = 6;
export const NUM_QUESTIONNAIRE_WORDS = 4;
export const WONDER_CARD_TEXT_LENGTH = 40;
export const WONDER_NEWS_TEXT_LENGTH = 40;
export const WONDER_CARD_BODY_TEXT_LINES = 4;
export const WONDER_NEWS_BODY_TEXT_LINES = 10;
export const MAX_STAMP_CARD_STAMPS = 7;
export const SPECIES_NONE = 0;
export const NUM_SPECIES = 412;
export const GAME_DATA_VALID_VAR = 0x101;
export const VERSION_CODE = 1;

export const FLAG_RECEIVED_AURORA_TICKET = 0x1f4;
export const FLAG_RECEIVED_MYSTIC_TICKET = 0x1f5;
export const FLAG_RECEIVED_OLD_SEA_MAP = 0x1f6;
export const FLAG_WONDER_CARD_UNUSED_1 = 0x1f7;

export const sReceivedGiftFlags = Array.from({ length: NUM_WONDER_CARD_FLAGS }, (_unused, i) => {
  if (i === 0) return FLAG_RECEIVED_AURORA_TICKET;
  if (i === 1) return FLAG_RECEIVED_MYSTIC_TICKET;
  if (i === 2) return FLAG_RECEIVED_OLD_SEA_MAP;
  return FLAG_WONDER_CARD_UNUSED_1 + (i - 3);
});

export type WonderNewsMetadata = {
  newsType: number;
  sentRewardCounter: number;
  rewardCounter: number;
  berry: number;
};

export type WonderNews = {
  id: number;
  sendType: number;
  bgType: number;
  titleText: number[];
  bodyText: number[][];
};

export type WonderCard = {
  flagId: number;
  iconSpecies: number;
  idNumber: number;
  type: number;
  bgType: number;
  sendType: number;
  maxStamps: number;
  titleText: number[];
  subtitleText: number[];
  bodyText: number[][];
  footerLine1Text: number[];
  footerLine2Text: number[];
};

export type WonderCardMetadata = {
  battlesWon: number;
  battlesLost: number;
  numTrades: number;
  iconSpecies: number;
  stampData: number[][];
};

export type MysteryGiftSave = {
  newsCrc: number;
  news: WonderNews;
  cardCrc: number;
  card: WonderCard;
  cardMetadataCrc: number;
  cardMetadata: WonderCardMetadata;
  questionnaireWords: number[];
  newsMetadata: WonderNewsMetadata;
  trainerIds: number[][];
};

export type MysteryGiftLinkGameData = {
  unk_00: number;
  unk_04: number;
  unk_08: number;
  unk_0C: number;
  unk_10: number;
  flagId: number;
  questionnaireWords: number[];
  cardMetadata: WonderCardMetadata;
  maxStamps: number;
  playerName: number[];
  playerTrainerId: number[];
  easyChatProfile: number[];
  gameCode: number[];
  version: number;
};

export type MysteryGiftRuntime = {
  gSaveBlock1Ptr: {
    mysteryGift: MysteryGiftSave;
    easyChatProfile: number[];
  };
  gSaveBlock2Ptr: {
    playerTrainerId: number[];
    playerName: number[];
    battleTower: { ereaderTrainer: Record<string, never> };
  };
  flags: Set<number>;
  sStatsEnabled: boolean;
  ramScriptValid: boolean;
  ramScriptCleared: boolean;
  mysteryGiftFlagsCleared: boolean;
  mysteryGiftVarsCleared: boolean;
  eReaderTrainerCleared: boolean;
  wonderNewsResetCount: number;
  questionnaireInitialized: boolean;
  romHeaderGameCode: number[];
  romHeaderSoftwareVersion: number;
  assertions: string[];
};

const zeros = (length: number): number[] => Array(length).fill(0);
const matrix = (rows: number, cols: number): number[][] => Array.from({ length: rows }, () => zeros(cols));

export const createWonderNews = (partial: Partial<WonderNews> = {}): WonderNews => ({
  id: 0,
  sendType: SEND_TYPE_DISALLOWED,
  bgType: 0,
  titleText: zeros(WONDER_NEWS_TEXT_LENGTH),
  bodyText: matrix(WONDER_NEWS_BODY_TEXT_LINES, WONDER_NEWS_TEXT_LENGTH),
  ...partial
});

export const createWonderCard = (partial: Partial<WonderCard> = {}): WonderCard => ({
  flagId: 0,
  iconSpecies: 0,
  idNumber: 0,
  type: CARD_TYPE_GIFT,
  bgType: 0,
  sendType: SEND_TYPE_DISALLOWED,
  maxStamps: 0,
  titleText: zeros(WONDER_CARD_TEXT_LENGTH),
  subtitleText: zeros(WONDER_CARD_TEXT_LENGTH),
  bodyText: matrix(WONDER_CARD_BODY_TEXT_LINES, WONDER_CARD_TEXT_LENGTH),
  footerLine1Text: zeros(WONDER_CARD_TEXT_LENGTH),
  footerLine2Text: zeros(WONDER_CARD_TEXT_LENGTH),
  ...partial
});

export const createWonderCardMetadata = (partial: Partial<WonderCardMetadata> = {}): WonderCardMetadata => ({
  battlesWon: 0,
  battlesLost: 0,
  numTrades: 0,
  iconSpecies: 0,
  stampData: matrix(2, MAX_STAMP_CARD_STAMPS),
  ...partial
});

export const createMysteryGiftSave = (): MysteryGiftSave => ({
  newsCrc: 0,
  news: createWonderNews(),
  cardCrc: 0,
  card: createWonderCard(),
  cardMetadataCrc: 0,
  cardMetadata: createWonderCardMetadata(),
  questionnaireWords: zeros(NUM_QUESTIONNAIRE_WORDS),
  newsMetadata: { newsType: 0, sentRewardCounter: 0, rewardCounter: 0, berry: 0 },
  trainerIds: matrix(2, 5)
});

export const createMysteryGiftLinkGameData = (): MysteryGiftLinkGameData => ({
  unk_00: 0,
  unk_04: 0,
  unk_08: 0,
  unk_0C: 0,
  unk_10: 0,
  flagId: 0,
  questionnaireWords: zeros(NUM_QUESTIONNAIRE_WORDS),
  cardMetadata: createWonderCardMetadata(),
  maxStamps: 0,
  playerName: zeros(PLAYER_NAME_LENGTH),
  playerTrainerId: zeros(TRAINER_ID_LENGTH),
  easyChatProfile: zeros(EASY_CHAT_BATTLE_WORDS_COUNT),
  gameCode: zeros(GAME_CODE_LENGTH),
  version: 0
});

export const createMysteryGiftRuntime = (): MysteryGiftRuntime => ({
  gSaveBlock1Ptr: {
    mysteryGift: createMysteryGiftSave(),
    easyChatProfile: zeros(EASY_CHAT_BATTLE_WORDS_COUNT)
  },
  gSaveBlock2Ptr: {
    playerTrainerId: zeros(TRAINER_ID_LENGTH),
    playerName: zeros(PLAYER_NAME_LENGTH + 1),
    battleTower: { ereaderTrainer: {} }
  },
  flags: new Set(),
  sStatsEnabled: false,
  ramScriptValid: true,
  ramScriptCleared: false,
  mysteryGiftFlagsCleared: false,
  mysteryGiftVarsCleared: false,
  eReaderTrainerCleared: false,
  wonderNewsResetCount: 0,
  questionnaireInitialized: false,
  romHeaderGameCode: [0x42, 0x50, 0x52, 0x45],
  romHeaderSoftwareVersion: 0,
  assertions: []
});

const pushU16 = (out: number[], value: number): void => { out.push(value & 0xff, (value >> 8) & 0xff); };
const pushU32 = (out: number[], value: number): void => { out.push(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff); };
const fixed = (src: readonly number[], length: number): number[] => Array.from({ length }, (_unused, i) => src[i] ?? 0);

export const serializeWonderNews = (news: WonderNews): number[] => {
  const out: number[] = [];
  pushU16(out, news.id);
  out.push(news.sendType & 0xff, news.bgType & 0xff);
  out.push(...fixed(news.titleText, WONDER_NEWS_TEXT_LENGTH));
  for (const line of news.bodyText) out.push(...fixed(line, WONDER_NEWS_TEXT_LENGTH));
  return out;
};

export const serializeWonderCard = (card: WonderCard): number[] => {
  const out: number[] = [];
  pushU16(out, card.flagId);
  pushU16(out, card.iconSpecies);
  pushU32(out, card.idNumber);
  out.push(((card.type & 3) | ((card.bgType & 0xf) << 2) | ((card.sendType & 3) << 6)) & 0xff);
  out.push(card.maxStamps & 0xff);
  out.push(...fixed(card.titleText, WONDER_CARD_TEXT_LENGTH));
  out.push(...fixed(card.subtitleText, WONDER_CARD_TEXT_LENGTH));
  for (const line of card.bodyText) out.push(...fixed(line, WONDER_CARD_TEXT_LENGTH));
  out.push(...fixed(card.footerLine1Text, WONDER_CARD_TEXT_LENGTH));
  out.push(...fixed(card.footerLine2Text, WONDER_CARD_TEXT_LENGTH));
  return out;
};

export const serializeWonderCardMetadata = (metadata: WonderCardMetadata): number[] => {
  const out: number[] = [];
  pushU16(out, metadata.battlesWon);
  pushU16(out, metadata.battlesLost);
  pushU16(out, metadata.numTrades);
  pushU16(out, metadata.iconSpecies);
  for (let row = 0; row < 2; row += 1) {
    for (let i = 0; i < MAX_STAMP_CARD_STAMPS; i += 1) pushU16(out, metadata.stampData[row]?.[i] ?? 0);
  }
  return out;
};

export const CalcCRC = (data: readonly number[]): number => calcCRC16WithTable(data);

export const ClearMysteryGift = (runtime: MysteryGiftRuntime): void => {
  runtime.gSaveBlock1Ptr.mysteryGift = createMysteryGiftSave();
  ClearSavedWonderNewsMetadata(runtime);
  InitQuestionnaireWords(runtime);
};

export const GetSavedWonderNews = (runtime: MysteryGiftRuntime): WonderNews => runtime.gSaveBlock1Ptr.mysteryGift.news;
export const GetSavedWonderCard = (runtime: MysteryGiftRuntime): WonderCard => runtime.gSaveBlock1Ptr.mysteryGift.card;
export const GetSavedWonderCardMetadata = (runtime: MysteryGiftRuntime): WonderCardMetadata => runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata;
export const GetSavedWonderNewsMetadata = (runtime: MysteryGiftRuntime): WonderNewsMetadata => runtime.gSaveBlock1Ptr.mysteryGift.newsMetadata;
export const GetQuestionnaireWordsPtr = (runtime: MysteryGiftRuntime): number[] => runtime.gSaveBlock1Ptr.mysteryGift.questionnaireWords;

export const WonderNews_Reset = (runtime: MysteryGiftRuntime): void => { runtime.wonderNewsResetCount += 1; };
export const InitQuestionnaireWords = (runtime: MysteryGiftRuntime): void => { runtime.questionnaireInitialized = true; };
export const ClearSavedWonderNewsAndRelated = (runtime: MysteryGiftRuntime): void => { ClearSavedWonderNews(runtime); };

export const ValidateWonderNews = (news: WonderNews): boolean => news.id !== 0;
export const ClearSavedWonderNews = (runtime: MysteryGiftRuntime): void => {
  runtime.gSaveBlock1Ptr.mysteryGift.news = createWonderNews();
  runtime.gSaveBlock1Ptr.mysteryGift.newsCrc = 0;
};
export const ClearSavedWonderNewsMetadata = (runtime: MysteryGiftRuntime): void => {
  runtime.gSaveBlock1Ptr.mysteryGift.newsMetadata = { newsType: 0, sentRewardCounter: 0, rewardCounter: 0, berry: 0 };
  WonderNews_Reset(runtime);
};
export const SaveWonderNews = (runtime: MysteryGiftRuntime, news: WonderNews): boolean => {
  if (!ValidateWonderNews(news)) return false;
  ClearSavedWonderNews(runtime);
  runtime.gSaveBlock1Ptr.mysteryGift.news = structuredClone(news);
  runtime.gSaveBlock1Ptr.mysteryGift.newsCrc = CalcCRC(serializeWonderNews(runtime.gSaveBlock1Ptr.mysteryGift.news));
  return true;
};
export const ValidateSavedWonderNews = (runtime: MysteryGiftRuntime): boolean => {
  if (CalcCRC(serializeWonderNews(runtime.gSaveBlock1Ptr.mysteryGift.news)) !== runtime.gSaveBlock1Ptr.mysteryGift.newsCrc) return false;
  if (!ValidateWonderNews(runtime.gSaveBlock1Ptr.mysteryGift.news)) return false;
  return true;
};
export const IsSendingSavedWonderNewsAllowed = (runtime: MysteryGiftRuntime): boolean =>
  runtime.gSaveBlock1Ptr.mysteryGift.news.sendType !== SEND_TYPE_DISALLOWED;
export const IsWonderNewsSameAsSaved = (runtime: MysteryGiftRuntime, newsBytes: readonly number[]): boolean => {
  if (!ValidateSavedWonderNews(runtime)) return false;
  const saved = serializeWonderNews(runtime.gSaveBlock1Ptr.mysteryGift.news);
  for (let i = 0; i < saved.length; i += 1) {
    if (saved[i] !== (newsBytes[i] ?? 0)) return false;
  }
  return true;
};

export const ClearRamScript = (runtime: MysteryGiftRuntime): void => { runtime.ramScriptCleared = true; runtime.ramScriptValid = false; };
export const ValidateRamScript = (runtime: MysteryGiftRuntime): boolean => runtime.ramScriptValid;
export const ClearMysteryGiftFlags = (runtime: MysteryGiftRuntime): void => { runtime.mysteryGiftFlagsCleared = true; };
export const ClearMysteryGiftVars = (runtime: MysteryGiftRuntime): void => { runtime.mysteryGiftVarsCleared = true; };
export const ClearEReaderTrainer = (runtime: MysteryGiftRuntime): void => { runtime.eReaderTrainerCleared = true; };
export const ClearSavedTrainerIds = (runtime: MysteryGiftRuntime): void => { runtime.gSaveBlock1Ptr.mysteryGift.trainerIds = matrix(2, 5); };
export const ClearSavedWonderCard = (runtime: MysteryGiftRuntime): void => {
  runtime.gSaveBlock1Ptr.mysteryGift.card = createWonderCard();
  runtime.gSaveBlock1Ptr.mysteryGift.cardCrc = 0;
};
export const ClearSavedWonderCardMetadata = (runtime: MysteryGiftRuntime): void => {
  runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata = createWonderCardMetadata();
  runtime.gSaveBlock1Ptr.mysteryGift.cardMetadataCrc = 0;
};
export const ClearSavedWonderCardAndRelated = (runtime: MysteryGiftRuntime): void => {
  ClearSavedWonderCard(runtime);
  ClearSavedWonderCardMetadata(runtime);
  ClearSavedTrainerIds(runtime);
  ClearRamScript(runtime);
  ClearMysteryGiftFlags(runtime);
  ClearMysteryGiftVars(runtime);
  ClearEReaderTrainer(runtime);
};

export const ValidateWonderCard = (card: WonderCard): boolean => {
  if (card.flagId === 0) return false;
  if (card.type >= CARD_TYPE_COUNT) return false;
  if (!(card.sendType === SEND_TYPE_DISALLOWED || card.sendType === SEND_TYPE_ALLOWED || card.sendType === SEND_TYPE_ALLOWED_ALWAYS)) return false;
  if (card.bgType >= NUM_WONDER_BGS) return false;
  if (card.maxStamps > MAX_STAMP_CARD_STAMPS) return false;
  return true;
};
export const SaveWonderCard = (runtime: MysteryGiftRuntime, card: WonderCard): boolean => {
  if (!ValidateWonderCard(card)) return false;
  ClearSavedWonderCardAndRelated(runtime);
  runtime.ramScriptValid = true;
  runtime.gSaveBlock1Ptr.mysteryGift.card = structuredClone(card);
  runtime.gSaveBlock1Ptr.mysteryGift.cardCrc = CalcCRC(serializeWonderCard(runtime.gSaveBlock1Ptr.mysteryGift.card));
  runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.iconSpecies = runtime.gSaveBlock1Ptr.mysteryGift.card.iconSpecies;
  return true;
};
export const ValidateSavedWonderCard = (runtime: MysteryGiftRuntime): boolean => {
  if (runtime.gSaveBlock1Ptr.mysteryGift.cardCrc !== CalcCRC(serializeWonderCard(runtime.gSaveBlock1Ptr.mysteryGift.card))) return false;
  if (!ValidateWonderCard(runtime.gSaveBlock1Ptr.mysteryGift.card)) return false;
  if (!ValidateRamScript(runtime)) return false;
  return true;
};
export const IsSendingSavedWonderCardAllowed = (runtime: MysteryGiftRuntime): boolean =>
  runtime.gSaveBlock1Ptr.mysteryGift.card.sendType !== SEND_TYPE_DISALLOWED;
export const GetWonderCardFlagId = (runtime: MysteryGiftRuntime): number => ValidateSavedWonderCard(runtime) ? runtime.gSaveBlock1Ptr.mysteryGift.card.flagId : 0;
export const DisableWonderCardSending = (card: WonderCard): void => {
  if (card.sendType === SEND_TYPE_ALLOWED) card.sendType = SEND_TYPE_DISALLOWED;
};
export const IsWonderCardFlagIDInValidRange = (flagId: number): boolean =>
  flagId >= WONDER_CARD_FLAG_OFFSET && flagId < WONDER_CARD_FLAG_OFFSET + NUM_WONDER_CARD_FLAGS;
export const FlagGet = (runtime: MysteryGiftRuntime, flagId: number): boolean => runtime.flags.has(flagId);
export const IsSavedWonderCardGiftNotReceived = (runtime: MysteryGiftRuntime): boolean => {
  const value = GetWonderCardFlagId(runtime);
  if (!IsWonderCardFlagIDInValidRange(value)) return false;
  if (FlagGet(runtime, sReceivedGiftFlags[value - WONDER_CARD_FLAG_OFFSET]) === true) return false;
  return true;
};

export const GetNumStampsInMetadata = (data: WonderCardMetadata, size: number): number => {
  let numStamps = 0;
  for (let i = 0; i < size; i += 1) {
    if (data.stampData[STAMP_ID][i] && data.stampData[STAMP_SPECIES][i]) numStamps += 1;
  }
  return numStamps;
};
export const IsStampInMetadata = (metadata: WonderCardMetadata, stamp: readonly number[], maxStamps: number): boolean => {
  for (let i = 0; i < maxStamps; i += 1) {
    if (metadata.stampData[STAMP_ID][i] === stamp[STAMP_ID]) return true;
    if (metadata.stampData[STAMP_SPECIES][i] === stamp[STAMP_SPECIES]) return true;
  }
  return false;
};
export const ValidateStamp = (stamp: readonly number[]): boolean => {
  if (stamp[STAMP_ID] === 0) return false;
  if (stamp[STAMP_SPECIES] === SPECIES_NONE) return false;
  if ((stamp[STAMP_SPECIES] ?? 0) >= NUM_SPECIES) return false;
  return true;
};
export const GetNumStampsInSavedCard = (runtime: MysteryGiftRuntime): number => {
  if (!ValidateSavedWonderCard(runtime)) return 0;
  if (runtime.gSaveBlock1Ptr.mysteryGift.card.type !== CARD_TYPE_STAMP) return 0;
  return GetNumStampsInMetadata(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata, runtime.gSaveBlock1Ptr.mysteryGift.card.maxStamps);
};
export const MysteryGift_TrySaveStamp = (runtime: MysteryGiftRuntime, stamp: readonly number[]): boolean => {
  const card = runtime.gSaveBlock1Ptr.mysteryGift.card;
  const maxStamps = card.maxStamps;
  if (!ValidateStamp(stamp)) return false;
  if (IsStampInMetadata(runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata, stamp, maxStamps)) return false;
  for (let i = 0; i < maxStamps; i += 1) {
    if (runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.stampData[STAMP_ID][i] === 0
      && runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.stampData[STAMP_SPECIES][i] === SPECIES_NONE) {
      runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.stampData[STAMP_ID][i] = stamp[STAMP_ID];
      runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.stampData[STAMP_SPECIES][i] = stamp[STAMP_SPECIES];
      return true;
    }
  }
  return false;
};

export const CopyTrainerId = (dst: number[], src: readonly number[]): void => {
  for (let i = 0; i < TRAINER_ID_LENGTH; i += 1) dst[i] = src[i] ?? 0;
};
export const StringCopy = (dst: number[], src: readonly number[]): void => {
  for (let i = 0; i < dst.length; i += 1) dst[i] = src[i] ?? 0;
};
export const MysteryGift_LoadLinkGameData = (runtime: MysteryGiftRuntime, data: MysteryGiftLinkGameData): void => {
  Object.assign(data, createMysteryGiftLinkGameData());
  data.unk_00 = GAME_DATA_VALID_VAR;
  data.unk_04 = 1;
  data.unk_08 = 1;
  data.unk_0C = 1;
  data.unk_10 = VERSION_CODE;
  if (ValidateSavedWonderCard(runtime)) {
    data.flagId = GetSavedWonderCard(runtime).flagId;
    data.cardMetadata = structuredClone(GetSavedWonderCardMetadata(runtime));
    data.maxStamps = GetSavedWonderCard(runtime).maxStamps;
  } else {
    data.flagId = 0;
  }
  for (let i = 0; i < NUM_QUESTIONNAIRE_WORDS; i += 1) data.questionnaireWords[i] = runtime.gSaveBlock1Ptr.mysteryGift.questionnaireWords[i];
  CopyTrainerId(data.playerTrainerId, runtime.gSaveBlock2Ptr.playerTrainerId);
  StringCopy(data.playerName, runtime.gSaveBlock2Ptr.playerName);
  for (let i = 0; i < EASY_CHAT_BATTLE_WORDS_COUNT; i += 1) data.easyChatProfile[i] = runtime.gSaveBlock1Ptr.easyChatProfile[i];
  data.gameCode = fixed(runtime.romHeaderGameCode, GAME_CODE_LENGTH);
  data.version = runtime.romHeaderSoftwareVersion;
};
export const MysteryGift_ValidateLinkGameData = (data: MysteryGiftLinkGameData): boolean => {
  if (data.unk_00 !== GAME_DATA_VALID_VAR) return false;
  if (!(data.unk_04 & 1)) return false;
  if (!(data.unk_08 & 1)) return false;
  if (!(data.unk_0C & 1)) return false;
  if (!(data.unk_10 & 0x0f)) return false;
  return true;
};
export const MysteryGift_CompareCardFlags = (flagId: number, data: MysteryGiftLinkGameData): number => {
  if (data.flagId === 0) return 0;
  if (flagId === data.flagId) return 1;
  return 2;
};
export const MysteryGift_CheckStamps = (stamp: readonly number[], data: MysteryGiftLinkGameData): number => {
  const stampsMissing = data.maxStamps - GetNumStampsInMetadata(data.cardMetadata, data.maxStamps);
  if (stampsMissing === 0) return 1;
  if (IsStampInMetadata(data.cardMetadata, stamp, data.maxStamps)) return 3;
  if (stampsMissing === 1) return 4;
  return 2;
};
export const MysteryGift_DoesQuestionnaireMatch = (data: MysteryGiftLinkGameData, words: readonly number[]): boolean => {
  for (let i = 0; i < NUM_QUESTIONNAIRE_WORDS; i += 1) if (data.questionnaireWords[i] !== words[i]) return false;
  return true;
};
export const GetNumStampsInLinkData = (data: MysteryGiftLinkGameData): number => GetNumStampsInMetadata(data.cardMetadata, data.maxStamps);
export const MysteryGift_GetCardStatFromLinkData = (runtime: MysteryGiftRuntime, data: MysteryGiftLinkGameData, stat: number): number => {
  switch (stat) {
    case CARD_STAT_BATTLES_WON: return data.cardMetadata.battlesWon;
    case CARD_STAT_BATTLES_LOST: return data.cardMetadata.battlesLost;
    case CARD_STAT_NUM_TRADES: return data.cardMetadata.numTrades;
    case CARD_STAT_NUM_STAMPS: return GetNumStampsInLinkData(data);
    case CARD_STAT_MAX_STAMPS: return data.maxStamps;
    default:
      runtime.assertions.push('MysteryGift_GetCardStatFromLinkData');
      return 0;
  }
};

export const IncrementCardStat = (runtime: MysteryGiftRuntime, statType: number): void => {
  const card = runtime.gSaveBlock1Ptr.mysteryGift.card;
  if (card.type === CARD_TYPE_LINK_STAT) {
    let stat: 'battlesWon' | 'battlesLost' | 'numTrades' | null = null;
    switch (statType) {
      case CARD_STAT_BATTLES_WON: stat = 'battlesWon'; break;
      case CARD_STAT_BATTLES_LOST: stat = 'battlesLost'; break;
      case CARD_STAT_NUM_TRADES: stat = 'numTrades'; break;
      case CARD_STAT_NUM_STAMPS:
      case CARD_STAT_MAX_STAMPS:
        break;
    }
    if (stat === null) runtime.assertions.push('IncrementCardStat');
    else if ((runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata[stat] += 1) > MAX_WONDER_CARD_STAT) {
      runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata[stat] = MAX_WONDER_CARD_STAT;
    }
  }
};
export const MysteryGift_GetCardStat = (runtime: MysteryGiftRuntime, stat: number): number => {
  const card = runtime.gSaveBlock1Ptr.mysteryGift.card;
  switch (stat) {
    case CARD_STAT_BATTLES_WON:
      if (card.type === CARD_TYPE_LINK_STAT) return runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.battlesWon;
      break;
    case CARD_STAT_BATTLES_LOST:
      if (card.type === CARD_TYPE_LINK_STAT) return runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.battlesLost;
      break;
    case CARD_STAT_NUM_TRADES:
      if (card.type === CARD_TYPE_LINK_STAT) return runtime.gSaveBlock1Ptr.mysteryGift.cardMetadata.numTrades;
      break;
    case CARD_STAT_NUM_STAMPS:
      if (card.type === CARD_TYPE_STAMP) return GetNumStampsInSavedCard(runtime);
      break;
    case CARD_STAT_MAX_STAMPS:
      if (card.type === CARD_TYPE_STAMP) return card.maxStamps;
      break;
  }
  runtime.assertions.push('MysteryGift_GetCardStat');
  return 0;
};
export const MysteryGift_DisableStats = (runtime: MysteryGiftRuntime): void => { runtime.sStatsEnabled = false; };
export const MysteryGift_TryEnableStatsByFlagId = (runtime: MysteryGiftRuntime, flagId: number): boolean => {
  runtime.sStatsEnabled = false;
  if (flagId === 0) return false;
  if (!ValidateSavedWonderCard(runtime)) return false;
  if (runtime.gSaveBlock1Ptr.mysteryGift.card.flagId !== flagId) return false;
  runtime.sStatsEnabled = true;
  return true;
};
export const RecordTrainerId = (trainerId: number, trainerIds: number[], size: number): boolean => {
  let i = 0;
  let j = 0;
  for (i = 0; i < size; i += 1) {
    if (trainerIds[i] === trainerId) break;
  }
  if (i === size) {
    for (j = size - 1; j > 0; j -= 1) trainerIds[j] = trainerIds[j - 1];
    trainerIds[0] = trainerId;
    return true;
  } else {
    for (j = i; j > 0; j -= 1) trainerIds[j] = trainerIds[j - 1];
    trainerIds[0] = trainerId;
    return false;
  }
};
export const IncrementCardStatForNewTrainer = (runtime: MysteryGiftRuntime, stat: number, trainerId: number, trainerIds: number[], size: number): void => {
  if (RecordTrainerId(trainerId, trainerIds, size)) IncrementCardStat(runtime, stat);
};
export const MysteryGift_TryIncrementStat = (runtime: MysteryGiftRuntime, stat: number, trainerId: number): void => {
  if (runtime.sStatsEnabled) {
    switch (stat) {
      case CARD_STAT_NUM_TRADES:
        IncrementCardStatForNewTrainer(runtime, CARD_STAT_NUM_TRADES, trainerId, runtime.gSaveBlock1Ptr.mysteryGift.trainerIds[1], runtime.gSaveBlock1Ptr.mysteryGift.trainerIds[1].length);
        break;
      case CARD_STAT_BATTLES_WON:
        IncrementCardStatForNewTrainer(runtime, CARD_STAT_BATTLES_WON, trainerId, runtime.gSaveBlock1Ptr.mysteryGift.trainerIds[0], runtime.gSaveBlock1Ptr.mysteryGift.trainerIds[0].length);
        break;
      case CARD_STAT_BATTLES_LOST:
        IncrementCardStatForNewTrainer(runtime, CARD_STAT_BATTLES_LOST, trainerId, runtime.gSaveBlock1Ptr.mysteryGift.trainerIds[0], runtime.gSaveBlock1Ptr.mysteryGift.trainerIds[0].length);
        break;
      default:
        runtime.assertions.push('MysteryGift_TryIncrementStat');
        break;
    }
  }
};
