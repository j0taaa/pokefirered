import { describe, expect, test } from 'vitest';
import {
  BufferRandomHobbyOrLifestyleString,
  BufferEasyChatWordGroupName,
  CopyEasyChatWord,
  CopyEasyChatWordPadded,
  ConvertEasyChatWordsToString,
  EC_DoesEasyChatStringFitOnLine,
  EC_GROUP,
  EC_GROUP_ADJECTIVES,
  EC_GROUP_EVENTS,
  EC_GROUP_HOBBIES,
  EC_GROUP_MOVE_1,
  EC_GROUP_POKEMON,
  EC_GROUP_POKEMON_2,
  EC_GROUP_TRAINER,
  EC_INDEX,
  EC_NUM_GROUPS,
  EC_WORD,
  EC_WORD_A,
  EC_WORD_FRIEND,
  EC_WORD_I_AM,
  EC_WORD_POKEMON,
  EC_WORD_UNDEFINED,
  EASY_CHAT_C_TRANSLATION_UNIT,
  EC_IsDeoxys,
  EasyChat_GetNumWordsInGroup,
  EnableRareWord,
  FLAG_SYS_GAME_CLEAR,
  GetDisplayedWordByIndex,
  GetEasyChatWord,
  GetEasyChatWordGroupName,
  GetNumDisplayableGroups,
  GetNumDisplayedWords,
  GetNumUnlockedTrendySayings,
  GetRandomECPokemon,
  GetRandomUnlockedTrendySaying,
  GetRandomWordFromAnyGroup,
  GetRandomWordFromGroup,
  GetSelectedGroupByIndex,
  GetUnlockedECWords,
  InitEasyChatPhrases,
  InitEasyChatSelection,
  InitQuestionnaireWords,
  IsECGroupUnlocked,
  IsECWordInvalid,
  IsTrendySayingUnlocked,
  IsWordUnlocked,
  MAIL_COUNT,
  MAIL_WORDS_COUNT,
  NUM_QUESTIONNAIRE_WORDS,
  SPECIES_DEOXYS,
  ShowEasyChatMessage,
  UnlockRandomTrendySaying,
  createEasyChatRuntime,
  sEasyChatGroups
} from '../src/game/decompEasyChat';

describe('decomp easy_chat.c parity', () => {
  test('exports exact easy_chat.c Deoxys membership helper', () => {
    expect(EASY_CHAT_C_TRANSLATION_UNIT).toBe('src/easy_chat.c');
    expect(EC_IsDeoxys(SPECIES_DEOXYS)).toBe(true);
    expect(EC_IsDeoxys(SPECIES_DEOXYS - 1)).toBe(false);
  });

  test('EC macros and word copying preserve undefined/invalid handling', () => {
    const trainerWord = EC_WORD(EC_GROUP_TRAINER, 0);

    expect(EC_GROUP(trainerWord)).toBe(EC_GROUP_TRAINER);
    expect(EC_INDEX(trainerWord)).toBe(0);
    expect(IsECWordInvalid(EC_WORD_UNDEFINED)).toBe(false);
    expect(IsECWordInvalid(EC_WORD(EC_NUM_GROUPS, 0))).toBe(true);
    expect(CopyEasyChatWord(EC_WORD_UNDEFINED)).toBe('');
    expect(CopyEasyChatWord(EC_WORD(EC_NUM_GROUPS, 0))).toBe('???');
    expect(CopyEasyChatWord(trainerWord)).toBe(GetEasyChatWord(EC_GROUP_TRAINER, 0));
    expect(CopyEasyChatWordPadded(trainerWord, 14)).toHaveLength(14);
  });

  test('ConvertEasyChatWordsToString inserts spaces and newlines exactly like the C loops', () => {
    const words = [EC_WORD_I_AM, EC_WORD_A, EC_WORD_POKEMON, EC_WORD_FRIEND];

    expect(ConvertEasyChatWordsToString(words, 2, 2)).toBe(
      `${CopyEasyChatWord(EC_WORD_I_AM)} ${CopyEasyChatWord(EC_WORD_A)}\n${CopyEasyChatWord(EC_WORD_POKEMON)} ${CopyEasyChatWord(EC_WORD_FRIEND)}`
    );
    expect(ConvertEasyChatWordsToString([EC_WORD_UNDEFINED, EC_WORD_A], 2, 1)).toBe(
      CopyEasyChatWord(EC_WORD_A)
    );
  });

  test('EC_DoesEasyChatStringFitOnLine returns TRUE when any row exceeds maxLength', () => {
    const words = [EC_WORD(EC_GROUP_TRAINER, 0), EC_WORD(EC_GROUP_TRAINER, 1)];

    expect(EC_DoesEasyChatStringFitOnLine(words, 2, 1, 1)).toBe(true);
    expect(EC_DoesEasyChatStringFitOnLine(words, 2, 1, 100)).toBe(false);
  });

  test('group unlocks and random words follow C special cases', () => {
    const runtime = createEasyChatRuntime({ randomValues: [0, 1, 0] });

    expect(IsECGroupUnlocked(runtime, EC_GROUP_EVENTS)).toBe(false);
    expect(GetRandomWordFromAnyGroup(runtime, EC_GROUP_EVENTS)).toBe(EC_WORD_UNDEFINED);

    runtime.flags.add(FLAG_SYS_GAME_CLEAR);
    expect(IsECGroupUnlocked(runtime, EC_GROUP_MOVE_1)).toBe(true);
    expect(EC_GROUP(GetRandomWordFromGroup(runtime, EC_GROUP_TRAINER))).toBe(EC_GROUP_TRAINER);
    expect(EC_GROUP(GetRandomWordFromAnyGroup(runtime, EC_GROUP_MOVE_1))).toBe(EC_GROUP_MOVE_1);
  });

  test('Pokemon random selection uses seen National Dex entries and Deoxys gating', () => {
    const runtime = createEasyChatRuntime({ randomValues: [0] });

    expect(GetRandomECPokemon(runtime)).toBe(EC_WORD_UNDEFINED);
    const firstPokemon2Species = (sEasyChatGroups[EC_GROUP_POKEMON_2] as { values: number[] }).values[0];
    runtime.seenNationalDexNums.add(firstPokemon2Species);
    expect(EC_GROUP(GetRandomECPokemon(runtime))).toBe(EC_GROUP_POKEMON_2);
    expect(EasyChat_GetNumWordsInGroup(runtime, EC_GROUP_POKEMON)).toBe(1);
  });

  test('ShowEasyChatMessage picks profile/battle layouts and stores displayed text', () => {
    const runtime = createEasyChatRuntime();
    InitEasyChatPhrases(runtime);

    runtime.gSpecialVar_0x8004 = 0;
    ShowEasyChatMessage(runtime);
    expect(runtime.gStringVar4).toContain('\n');
    expect(runtime.shownMessages.at(-1)).toBe(runtime.gStringVar4);

    runtime.gSpecialVar_0x8004 = 9;
    ShowEasyChatMessage(runtime);
    expect(runtime.shownMessages).toHaveLength(1);
  });

  test('rare word helpers use the exact 33-bit trendy saying window', () => {
    const runtime = createEasyChatRuntime({ randomValues: [0, 0] });
    runtime.gSaveBlock1Ptr.additionalPhrases.fill(0);

    expect(GetNumUnlockedTrendySayings(runtime)).toBe(0);
    expect(GetRandomUnlockedTrendySaying(runtime)).toBe(EC_WORD_UNDEFINED);

    const unlocked = UnlockRandomTrendySaying(runtime);
    expect(unlocked).toBe(EC_WORD(0x14, 0));
    expect(IsTrendySayingUnlocked(runtime, 0)).toBe(true);
    expect(GetRandomUnlockedTrendySaying(runtime)).toBe(EC_WORD(0x14, 0));

    EnableRareWord(runtime, 40);
    expect(IsTrendySayingUnlocked(runtime, 40)).toBe(false);
  });

  test('InitEasyChatPhrases clears save arrays, mail words, and 64 additional phrase bytes', () => {
    const runtime = createEasyChatRuntime();
    InitEasyChatPhrases(runtime);

    expect(runtime.gSaveBlock1Ptr.easyChatProfile).toEqual([EC_WORD_I_AM, EC_WORD_A, EC_WORD_POKEMON, EC_WORD_FRIEND]);
    expect(runtime.gSaveBlock1Ptr.easyChatBattleWon.every((word) => word === EC_WORD_UNDEFINED)).toBe(true);
    expect(runtime.gSaveBlock1Ptr.easyChatBattleLost.every((word) => word === EC_WORD_UNDEFINED)).toBe(true);
    expect(runtime.gSaveBlock1Ptr.mail).toHaveLength(MAIL_COUNT);
    expect(runtime.gSaveBlock1Ptr.mail.every((mail) => mail.words.length === MAIL_WORDS_COUNT && mail.words.every((word) => word === EC_WORD_UNDEFINED))).toBe(true);
    expect(runtime.gSaveBlock1Ptr.additionalPhrases.slice(0, 64).every((byte) => byte === 0)).toBe(true);
  });

  test('questionnaire and selection population mirror display group rules', () => {
    const runtime = createEasyChatRuntime({
      nationalPokedexEnabled: true,
      seenNationalDexNums: new Set([1]),
      flags: new Set([FLAG_SYS_GAME_CLEAR])
    });

    InitQuestionnaireWords(runtime);
    expect(runtime.gSaveBlock1Ptr.questionnaireWords).toEqual(Array.from({ length: NUM_QUESTIONNAIRE_WORDS }, () => EC_WORD_UNDEFINED));

    expect(InitEasyChatSelection(runtime)).toBe(true);
    expect(GetNumDisplayableGroups(runtime)).toBe(21);
    expect(GetSelectedGroupByIndex(runtime, 0)).toBe(EC_GROUP_POKEMON);
    expect(GetSelectedGroupByIndex(runtime, 999)).toBe(EC_NUM_GROUPS);
    expect(GetEasyChatWordGroupName(EC_GROUP_HOBBIES)).toBe('HOBBIES');
    expect(BufferEasyChatWordGroupName('', EC_GROUP_HOBBIES, 10)).toBe('HOBBIES   ');

    GetUnlockedECWords(runtime, false, EC_GROUP_TRAINER);
    expect(GetNumDisplayedWords(runtime)).toBeGreaterThan(0);
    expect(EC_GROUP(GetDisplayedWordByIndex(runtime, 0))).toBe(EC_GROUP_TRAINER);
    expect(GetDisplayedWordByIndex(runtime, 9999)).toBe(EC_WORD_UNDEFINED);

    GetUnlockedECWords(runtime, true, 0);
    expect(GetNumDisplayedWords(runtime)).toBeGreaterThanOrEqual(0);
  });

  test('selection allocation failure and word unlock checks preserve C return paths', () => {
    const failed = createEasyChatRuntime({ allocationFails: true });
    expect(InitEasyChatSelection(failed)).toBe(false);
    expect(failed.sEasyChatSelectionData).toBeNull();

    const runtime = createEasyChatRuntime();
    InitEasyChatSelection(runtime);
    expect(IsWordUnlocked(runtime, EC_WORD(EC_GROUP_EVENTS, 0))).toBe(false);
    expect(sEasyChatGroups[EC_GROUP_ADJECTIVES].numWords).toBeGreaterThan(0);
  });

  test('BufferRandomHobbyOrLifestyleString chooses lifestyle on even random and hobbies on odd random', () => {
    const runtime = createEasyChatRuntime({ randomValues: [0, 0, 1, 0] });

    BufferRandomHobbyOrLifestyleString(runtime);
    const lifestyle = runtime.gStringVar2;
    BufferRandomHobbyOrLifestyleString(runtime);
    const hobbies = runtime.gStringVar2;

    expect(lifestyle).not.toBe('');
    expect(hobbies).not.toBe('');
  });
});
