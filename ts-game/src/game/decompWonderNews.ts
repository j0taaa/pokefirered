export const MAX_SENT_REWARD = 4;
export const MAX_REWARD = 5;
export const WONDER_NEWS_NONE = 0;
export const WONDER_NEWS_RECV_FRIEND = 1;
export const WONDER_NEWS_RECV_WIRELESS = 2;
export const WONDER_NEWS_SENT = 3;
export const NEWS_REWARD_NONE = 0;
export const NEWS_REWARD_RECV_SMALL = 1;
export const NEWS_REWARD_RECV_BIG = 2;
export const NEWS_REWARD_WAITING = 3;
export const NEWS_REWARD_SENT_SMALL = 4;
export const NEWS_REWARD_SENT_BIG = 5;
export const NEWS_REWARD_AT_MAX = 6;
export const ITEM_CHERI_BERRY = 133;
export const ITEM_IAPAPA_BERRY = 147;
export const ITEM_RAZZ_BERRY = 148;
export const ITEM_NOMEL_BERRY = 162;
export const FIRST_BERRY_INDEX = ITEM_CHERI_BERRY;

export interface WonderNewsMetadata {
  newsType: number;
  sentRewardCounter: number;
  rewardCounter: number;
  berry: number;
}

export interface WonderNewsRuntime {
  wonderNews: WonderNewsMetadata;
  vars: Record<string, number>;
  mysteryGiftEnabled: boolean;
  savedWonderNewsValid: boolean;
}

export const itemToBerry = (itemId: number): number =>
  (Math.trunc(itemId) - FIRST_BERRY_INDEX) + 1;

export const wonderNewsSetReward = (
  runtime: WonderNewsRuntime,
  newsType: number,
  random: () => number
): void => {
  const data = runtime.wonderNews;
  data.newsType = newsType;
  switch (newsType) {
    case WONDER_NEWS_RECV_FRIEND:
    case WONDER_NEWS_RECV_WIRELESS:
      data.berry = (random() % 15) + itemToBerry(ITEM_RAZZ_BERRY);
      break;
    case WONDER_NEWS_SENT:
      data.berry = (random() % 15) + itemToBerry(ITEM_CHERI_BERRY);
      break;
  }
};

export const wonderNewsReset = (runtime: WonderNewsRuntime): void => {
  const data = runtime.wonderNews;
  data.newsType = WONDER_NEWS_NONE;
  data.sentRewardCounter = 0;
  data.rewardCounter = 0;
  data.berry = 0;
  runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER = 0;
};

export const wonderNewsIncrementStepCounter = (runtime: WonderNewsRuntime): void => {
  const data = runtime.wonderNews;
  if (data.rewardCounter >= MAX_REWARD) {
    runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER = (runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER ?? 0) + 1;
    if (runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER >= 500) {
      data.rewardCounter = 0;
      runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER = 0;
    }
  }
};

export const incrementSentRewardCounter = (data: WonderNewsMetadata): void => {
  data.sentRewardCounter += 1;
  if (data.sentRewardCounter > MAX_SENT_REWARD) {
    data.sentRewardCounter = MAX_SENT_REWARD;
  }
};

export const resetSentRewardCounter = (data: WonderNewsMetadata): void => {
  data.sentRewardCounter = 0;
};

export const incrementRewardCounter = (data: WonderNewsMetadata): void => {
  data.rewardCounter += 1;
  if (data.rewardCounter > MAX_REWARD) {
    data.rewardCounter = MAX_REWARD;
  }
};

export const getWonderNewsRewardType = (data: WonderNewsMetadata): number => {
  if (data.rewardCounter === MAX_REWARD) {
    return NEWS_REWARD_AT_MAX;
  }

  switch (data.newsType) {
    case WONDER_NEWS_NONE:
      return NEWS_REWARD_WAITING;
    case WONDER_NEWS_RECV_FRIEND:
      return NEWS_REWARD_RECV_SMALL;
    case WONDER_NEWS_RECV_WIRELESS:
      return NEWS_REWARD_RECV_BIG;
    case WONDER_NEWS_SENT:
      return data.sentRewardCounter < MAX_SENT_REWARD - 1
        ? NEWS_REWARD_SENT_SMALL
        : NEWS_REWARD_SENT_BIG;
    default:
      return NEWS_REWARD_NONE;
  }
};

export const getWonderNewsRewardItem = (data: WonderNewsMetadata): number => {
  data.newsType = WONDER_NEWS_NONE;
  const itemId = data.berry + FIRST_BERRY_INDEX - 1;
  data.berry = 0;
  incrementRewardCounter(data);
  return itemId;
};

export const wonderNewsGetRewardInfo = (runtime: WonderNewsRuntime): number => {
  if (!runtime.mysteryGiftEnabled || !runtime.savedWonderNewsValid) {
    return NEWS_REWARD_NONE;
  }

  const data = runtime.wonderNews;
  const rewardType = getWonderNewsRewardType(data);
  switch (rewardType) {
    case NEWS_REWARD_RECV_SMALL:
    case NEWS_REWARD_RECV_BIG:
      runtime.vars.gSpecialVar_Result = getWonderNewsRewardItem(data);
      break;
    case NEWS_REWARD_SENT_SMALL:
      runtime.vars.gSpecialVar_Result = getWonderNewsRewardItem(data);
      incrementSentRewardCounter(data);
      break;
    case NEWS_REWARD_SENT_BIG:
      runtime.vars.gSpecialVar_Result = getWonderNewsRewardItem(data);
      resetSentRewardCounter(data);
      break;
  }
  return rewardType;
};

export function WonderNews_SetReward(
  runtime: WonderNewsRuntime,
  newsType: number,
  random: () => number
): void {
  wonderNewsSetReward(runtime, newsType, random);
}

export function WonderNews_Reset(runtime: WonderNewsRuntime): void {
  wonderNewsReset(runtime);
}

export function WonderNews_IncrementStepCounter(runtime: WonderNewsRuntime): void {
  wonderNewsIncrementStepCounter(runtime);
}

export function WonderNews_GetRewardInfo(runtime: WonderNewsRuntime): number {
  return wonderNewsGetRewardInfo(runtime);
}

export function GetRewardItem(data: WonderNewsMetadata): number {
  return getWonderNewsRewardItem(data);
}

export function ResetSentRewardCounter(data: WonderNewsMetadata): void {
  resetSentRewardCounter(data);
}

export function IncrementSentRewardCounter(data: WonderNewsMetadata): void {
  incrementSentRewardCounter(data);
}

export function IncrementRewardCounter(data: WonderNewsMetadata): void {
  incrementRewardCounter(data);
}

export function GetRewardType(data: WonderNewsMetadata): number {
  return getWonderNewsRewardType(data);
}
