import { describe, expect, test } from 'vitest';
import {
  GetRewardItem,
  GetRewardType,
  IncrementRewardCounter,
  IncrementSentRewardCounter,
  ITEM_CHERI_BERRY,
  ITEM_RAZZ_BERRY,
  MAX_REWARD,
  MAX_SENT_REWARD,
  NEWS_REWARD_AT_MAX,
  NEWS_REWARD_NONE,
  NEWS_REWARD_RECV_BIG,
  NEWS_REWARD_RECV_SMALL,
  NEWS_REWARD_SENT_BIG,
  NEWS_REWARD_SENT_SMALL,
  NEWS_REWARD_WAITING,
  ResetSentRewardCounter,
  WonderNews_GetRewardInfo,
  WonderNews_IncrementStepCounter,
  WonderNews_Reset,
  WonderNews_SetReward,
  WONDER_NEWS_NONE,
  WONDER_NEWS_RECV_FRIEND,
  WONDER_NEWS_RECV_WIRELESS,
  WONDER_NEWS_SENT,
  getWonderNewsRewardItem,
  getWonderNewsRewardType,
  incrementRewardCounter,
  incrementSentRewardCounter,
  itemToBerry,
  resetSentRewardCounter,
  wonderNewsGetRewardInfo,
  wonderNewsIncrementStepCounter,
  wonderNewsReset,
  wonderNewsSetReward,
  type WonderNewsRuntime
} from '../src/game/decompWonderNews';

const createRuntime = (): WonderNewsRuntime => ({
  vars: {},
  mysteryGiftEnabled: true,
  savedWonderNewsValid: true,
  wonderNews: {
    newsType: WONDER_NEWS_NONE,
    sentRewardCounter: 0,
    rewardCounter: 0,
    berry: 0
  }
});

describe('decompWonderNews', () => {
  test('WonderNews_SetReward chooses berries from the exact ranges', () => {
    const runtime = createRuntime();
    wonderNewsSetReward(runtime, WONDER_NEWS_RECV_FRIEND, () => 14);
    expect(runtime.wonderNews.berry).toBe(itemToBerry(ITEM_RAZZ_BERRY) + 14);
    wonderNewsSetReward(runtime, WONDER_NEWS_RECV_WIRELESS, () => 0);
    expect(runtime.wonderNews.berry).toBe(itemToBerry(ITEM_RAZZ_BERRY));
    wonderNewsSetReward(runtime, WONDER_NEWS_SENT, () => 14);
    expect(runtime.wonderNews.berry).toBe(itemToBerry(ITEM_CHERI_BERRY) + 14);
  });

  test('WonderNews_Reset clears metadata and step counter', () => {
    const runtime = createRuntime();
    runtime.wonderNews = { newsType: WONDER_NEWS_SENT, sentRewardCounter: 3, rewardCounter: 4, berry: 9 };
    runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER = 300;
    wonderNewsReset(runtime);
    expect(runtime.wonderNews).toEqual({ newsType: WONDER_NEWS_NONE, sentRewardCounter: 0, rewardCounter: 0, berry: 0 });
    expect(runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER).toBe(0);
  });

  test('WonderNews_IncrementStepCounter resets reward counter after 500 steps at max', () => {
    const runtime = createRuntime();
    runtime.wonderNews.rewardCounter = MAX_REWARD;
    runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER = 499;
    wonderNewsIncrementStepCounter(runtime);
    expect(runtime.wonderNews.rewardCounter).toBe(0);
    expect(runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER).toBe(0);
  });

  test('reward counters saturate exactly', () => {
    const runtime = createRuntime();
    for (let i = 0; i < 10; i += 1) {
      incrementSentRewardCounter(runtime.wonderNews);
      incrementRewardCounter(runtime.wonderNews);
    }
    expect(runtime.wonderNews.sentRewardCounter).toBe(MAX_SENT_REWARD);
    expect(runtime.wonderNews.rewardCounter).toBe(MAX_REWARD);
    resetSentRewardCounter(runtime.wonderNews);
    expect(runtime.wonderNews.sentRewardCounter).toBe(0);
  });

  test('GetRewardType follows the FireRed news type table', () => {
    const runtime = createRuntime();
    expect(getWonderNewsRewardType(runtime.wonderNews)).toBe(NEWS_REWARD_WAITING);
    runtime.wonderNews.newsType = WONDER_NEWS_RECV_FRIEND;
    expect(getWonderNewsRewardType(runtime.wonderNews)).toBe(NEWS_REWARD_RECV_SMALL);
    runtime.wonderNews.newsType = WONDER_NEWS_RECV_WIRELESS;
    expect(getWonderNewsRewardType(runtime.wonderNews)).toBe(NEWS_REWARD_RECV_BIG);
    runtime.wonderNews.newsType = WONDER_NEWS_SENT;
    runtime.wonderNews.sentRewardCounter = MAX_SENT_REWARD - 2;
    expect(getWonderNewsRewardType(runtime.wonderNews)).toBe(NEWS_REWARD_SENT_SMALL);
    runtime.wonderNews.sentRewardCounter = MAX_SENT_REWARD - 1;
    expect(getWonderNewsRewardType(runtime.wonderNews)).toBe(NEWS_REWARD_SENT_BIG);
    runtime.wonderNews.rewardCounter = MAX_REWARD;
    expect(getWonderNewsRewardType(runtime.wonderNews)).toBe(NEWS_REWARD_AT_MAX);
  });

  test('WonderNews_GetRewardInfo grants item, clears news type, and updates counters', () => {
    const runtime = createRuntime();
    runtime.wonderNews.newsType = WONDER_NEWS_SENT;
    runtime.wonderNews.sentRewardCounter = 2;
    runtime.wonderNews.berry = itemToBerry(ITEM_CHERI_BERRY) + 5;

    expect(wonderNewsGetRewardInfo(runtime)).toBe(NEWS_REWARD_SENT_SMALL);
    expect(runtime.vars.gSpecialVar_Result).toBe(ITEM_CHERI_BERRY + 5);
    expect(runtime.wonderNews.newsType).toBe(WONDER_NEWS_NONE);
    expect(runtime.wonderNews.berry).toBe(0);
    expect(runtime.wonderNews.rewardCounter).toBe(1);
    expect(runtime.wonderNews.sentRewardCounter).toBe(3);

    runtime.wonderNews.newsType = WONDER_NEWS_SENT;
    runtime.wonderNews.berry = itemToBerry(ITEM_CHERI_BERRY);
    expect(wonderNewsGetRewardInfo(runtime)).toBe(NEWS_REWARD_SENT_BIG);
    expect(runtime.wonderNews.sentRewardCounter).toBe(0);
  });

  test('WonderNews_GetRewardInfo returns none when Mystery Gift or saved news is invalid', () => {
    const runtime = createRuntime();
    runtime.mysteryGiftEnabled = false;
    expect(wonderNewsGetRewardInfo(runtime)).toBe(NEWS_REWARD_NONE);
    runtime.mysteryGiftEnabled = true;
    runtime.savedWonderNewsValid = false;
    expect(wonderNewsGetRewardInfo(runtime)).toBe(NEWS_REWARD_NONE);
  });

  test('GetRewardItem converts berry index to item id and increments reward counter', () => {
    const runtime = createRuntime();
    runtime.wonderNews.newsType = WONDER_NEWS_RECV_FRIEND;
    runtime.wonderNews.berry = itemToBerry(ITEM_RAZZ_BERRY);
    expect(getWonderNewsRewardItem(runtime.wonderNews)).toBe(ITEM_RAZZ_BERRY);
    expect(runtime.wonderNews.newsType).toBe(WONDER_NEWS_NONE);
    expect(runtime.wonderNews.rewardCounter).toBe(1);
  });

  test('exact C-name Wonder News functions preserve reward and counter behavior', () => {
    const runtime = createRuntime();

    WonderNews_SetReward(runtime, WONDER_NEWS_RECV_WIRELESS, () => 1);
    expect(runtime.wonderNews.newsType).toBe(WONDER_NEWS_RECV_WIRELESS);
    expect(runtime.wonderNews.berry).toBe(itemToBerry(ITEM_RAZZ_BERRY) + 1);
    expect(GetRewardType(runtime.wonderNews)).toBe(NEWS_REWARD_RECV_BIG);
    expect(WonderNews_GetRewardInfo(runtime)).toBe(NEWS_REWARD_RECV_BIG);
    expect(runtime.vars.gSpecialVar_Result).toBe(ITEM_RAZZ_BERRY + 1);
    expect(runtime.wonderNews.newsType).toBe(WONDER_NEWS_NONE);
    expect(runtime.wonderNews.berry).toBe(0);
    expect(runtime.wonderNews.rewardCounter).toBe(1);

    runtime.wonderNews.berry = itemToBerry(ITEM_RAZZ_BERRY) + 2;
    runtime.wonderNews.newsType = WONDER_NEWS_RECV_FRIEND;
    expect(GetRewardItem(runtime.wonderNews)).toBe(ITEM_RAZZ_BERRY + 2);
    expect(runtime.wonderNews.rewardCounter).toBe(2);

    for (let i = 0; i < MAX_SENT_REWARD + 2; i += 1) {
      IncrementSentRewardCounter(runtime.wonderNews);
    }
    expect(runtime.wonderNews.sentRewardCounter).toBe(MAX_SENT_REWARD);
    ResetSentRewardCounter(runtime.wonderNews);
    expect(runtime.wonderNews.sentRewardCounter).toBe(0);

    for (let i = 0; i < MAX_REWARD + 2; i += 1) {
      IncrementRewardCounter(runtime.wonderNews);
    }
    expect(runtime.wonderNews.rewardCounter).toBe(MAX_REWARD);
    runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER = 499;
    WonderNews_IncrementStepCounter(runtime);
    expect(runtime.wonderNews.rewardCounter).toBe(0);
    expect(runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER).toBe(0);

    runtime.wonderNews = { newsType: WONDER_NEWS_SENT, sentRewardCounter: 3, rewardCounter: 4, berry: 7 };
    runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER = 12;
    WonderNews_Reset(runtime);
    expect(runtime.wonderNews).toEqual({ newsType: WONDER_NEWS_NONE, sentRewardCounter: 0, rewardCounter: 0, berry: 0 });
    expect(runtime.vars.VAR_WONDER_NEWS_STEP_COUNTER).toBe(0);
  });
});
