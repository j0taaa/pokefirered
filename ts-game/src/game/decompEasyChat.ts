import easyChatConstantsSource from '../../../include/constants/easy_chat.h?raw';
import speciesConstantsSource from '../../../include/constants/species.h?raw';
import movesConstantsSource from '../../../include/constants/moves.h?raw';
import { gMoveNames } from './decompMoveNames';
import { gSpeciesNames } from './decompSpeciesNames';
import { sEasyChatGroup_Actions } from './decompEasyChatGroupActions';
import { sEasyChatGroup_Adjectives } from './decompEasyChatGroupAdjectives';
import { sEasyChatGroup_Battle } from './decompEasyChatGroupBattle';
import { sEasyChatGroup_Conditions } from './decompEasyChatGroupConditions';
import { sEasyChatGroup_Endings } from './decompEasyChatGroupEndings';
import { sEasyChatGroup_Events } from './decompEasyChatGroupEvents';
import { sEasyChatGroup_Feelings } from './decompEasyChatGroupFeelings';
import { sEasyChatGroup_Greetings } from './decompEasyChatGroupGreetings';
import { sEasyChatGroup_Hobbies } from './decompEasyChatGroupHobbies';
import { sEasyChatGroup_Lifestyle } from './decompEasyChatGroupLifestyle';
import { sEasyChatGroup_Misc } from './decompEasyChatGroupMisc';
import { sEasyChatGroup_Move1 } from './decompEasyChatGroupMove1';
import { sEasyChatGroup_Move2 } from './decompEasyChatGroupMove2';
import { sEasyChatGroup_People } from './decompEasyChatGroupPeople';
import { sEasyChatGroup_Pokemon } from './decompEasyChatGroupPokemon';
import { sEasyChatGroup_Pokemon2 } from './decompEasyChatGroupPokemon2';
import { sEasyChatGroup_Speech } from './decompEasyChatGroupSpeech';
import { sEasyChatGroup_Status } from './decompEasyChatGroupStatus';
import { sEasyChatGroup_Time } from './decompEasyChatGroupTime';
import { sEasyChatGroup_Trainer } from './decompEasyChatGroupTrainer';
import { sEasyChatGroup_TrendySaying } from './decompEasyChatGroupTrendySaying';
import { sEasyChatGroup_Voices } from './decompEasyChatGroupVoices';
import {
  EASY_CHAT_WORDS_BY_LETTER_BUCKETS,
  sEasyChatWordsByLetterPointers
} from './decompEasyChatWordsByLetter';

export const EC_GROUP_POKEMON_2 = 0x0;
export const EC_GROUP_TRAINER = 0x1;
export const EC_GROUP_STATUS = 0x2;
export const EC_GROUP_BATTLE = 0x3;
export const EC_GROUP_GREETINGS = 0x4;
export const EC_GROUP_PEOPLE = 0x5;
export const EC_GROUP_VOICES = 0x6;
export const EC_GROUP_SPEECH = 0x7;
export const EC_GROUP_ENDINGS = 0x8;
export const EC_GROUP_FEELINGS = 0x9;
export const EC_GROUP_CONDITIONS = 0xa;
export const EC_GROUP_ACTIONS = 0xb;
export const EC_GROUP_LIFESTYLE = 0xc;
export const EC_GROUP_HOBBIES = 0xd;
export const EC_GROUP_TIME = 0xe;
export const EC_GROUP_MISC = 0xf;
export const EC_GROUP_ADJECTIVES = 0x10;
export const EC_GROUP_EVENTS = 0x11;
export const EC_GROUP_MOVE_1 = 0x12;
export const EC_GROUP_MOVE_2 = 0x13;
export const EC_GROUP_TRENDY_SAYING = 0x14;
export const EC_GROUP_POKEMON = 0x15;
export const EC_NUM_GROUPS = 0x16;
export const EC_WORD_UNDEFINED = 0xffff;
export const MAIL_COUNT = 16;
export const MAIL_WORDS_COUNT = 9;
export const NUM_QUESTIONNAIRE_WORDS = 4;
export const SPECIES_DEOXYS = 410;
export const FLAG_SYS_GAME_CLEAR = 0x82c;
export const FLAG_GET_SEEN = 0;
export const EASY_CHAT_C_TRANSLATION_UNIT = 'src/easy_chat.c';

export const sDeoxysValue = [SPECIES_DEOXYS] as const;

type NormalEasyChatEntry = { text: string; alphabeticalOrder: number; enabled: boolean };
type EasyChatGroup =
  | { wordDataKind: 'valueList'; values: number[]; numWords: number; numEnabledWords: number }
  | { wordDataKind: 'words'; words: NormalEasyChatEntry[]; numWords: number; numEnabledWords: number };

export interface EasyChatSelectionData {
  numGroups: number;
  groups: number[];
  alphabeticalGroups: number[];
  alphabeticalWordsByGroup: number[][];
  allWords: number[];
  totalWords: number;
}

export interface EasyChatRuntime {
  sEasyChatSelectionData: EasyChatSelectionData | null;
  gSpecialVar_0x8004: number;
  gStringVar2: string;
  gStringVar4: string;
  shownMessages: string[];
  randomValues: number[];
  flags: Set<number>;
  nationalPokedexEnabled: boolean;
  seenNationalDexNums: Set<number>;
  gSaveBlock1Ptr: {
    easyChatProfile: number[];
    easyChatBattleStart: number[];
    easyChatBattleWon: number[];
    easyChatBattleLost: number[];
    mail: Array<{ words: number[] }>;
    additionalPhrases: number[];
    questionnaireWords: number[];
  };
  allocationFails: boolean;
}

const parseDefineValues = (source: string): Map<string, number> => {
  const values = new Map<string, number>();
  for (const match of source.matchAll(/^#define\s+(\w+)\s+(.+)$/gmu)) {
    const name = match[1];
    let expr = match[2].replace(/\/\/.*$/u, '').trim();
    if (expr.includes('<<')) {
      expr = expr.replace(/\((EC_GROUP_\w+)\s*<<\s*9\)/gu, (_, group: string) => String(values.get(group) ?? 0 << 9));
      expr = expr.replace(/\((\d+)\s*<<\s*(\d+)\)/gu, (_, left: string, right: string) => String(Number(left) << Number(right)));
      const parts = expr.split('|').map((part) => Number(part.trim().replace(/[()]/gu, '')));
      if (parts.every(Number.isFinite)) {
        values.set(name, parts.reduce((acc, part) => acc | part, 0));
      }
      continue;
    }
    const hex = expr.match(/^0x([0-9a-fA-F]+)/u);
    const dec = expr.match(/^(\d+)/u);
    if (hex) {
      values.set(name, Number.parseInt(hex[1], 16));
    } else if (dec) {
      values.set(name, Number.parseInt(dec[1], 10));
    }
  }
  return values;
};

const ecConstants = parseDefineValues(easyChatConstantsSource);
const speciesConstants = parseDefineValues(speciesConstantsSource);
const moveConstants = parseDefineValues(movesConstantsSource);

export const EC_GROUP = (easyChatWord: number): number => (easyChatWord >> 9) & 0x7f;
export const EC_INDEX = (easyChatWord: number): number => easyChatWord & 0x1ff;
export const EC_WORD = (groupId: number, index: number): number => ((groupId << 9) | index) & 0xffff;

export const EC_WORD_I_AM = ecConstants.get('EC_WORD_I_AM') ?? EC_WORD(EC_GROUP_SPEECH, 0);
export const EC_WORD_A = ecConstants.get('EC_WORD_A') ?? EC_WORD(EC_GROUP_SPEECH, 2);
export const EC_WORD_POKEMON = ecConstants.get('EC_WORD_POKEMON') ?? EC_WORD(EC_GROUP_TRAINER, 0xe);
export const EC_WORD_FRIEND = ecConstants.get('EC_WORD_FRIEND') ?? EC_WORD(EC_GROUP_PEOPLE, 0);
export const EC_WORD_ARE = ecConstants.get('EC_WORD_ARE') ?? EC_WORD(EC_GROUP_SPEECH, 0);
export const EC_WORD_YOU = ecConstants.get('EC_WORD_YOU') ?? EC_WORD(EC_GROUP_SPEECH, 1);
export const EC_WORD_READY = ecConstants.get('EC_WORD_READY') ?? EC_WORD(EC_GROUP_STATUS, 0);
export const EC_WORD_QUES = ecConstants.get('EC_WORD_QUES') ?? EC_WORD(EC_GROUP_ENDINGS, 0);
export const EC_WORD_HERE_I_COME = ecConstants.get('EC_WORD_HERE_I_COME') ?? EC_WORD(EC_GROUP_BATTLE, 0);
export const EC_WORD_EXCL = ecConstants.get('EC_WORD_EXCL') ?? EC_WORD(EC_GROUP_ENDINGS, 1);

const tokenValues = (tokens: string[], constants: Map<string, number>): number[] =>
  tokens.map((token) => constants.get(token) ?? 0);

const speciesNameByValue = new Map(gSpeciesNames.map((entry) => [speciesConstants.get(entry.species) ?? -1, entry.name]));
const moveNameByValue = new Map(gMoveNames.map((entry) => [moveConstants.get(entry.move) ?? -1, entry.name]));

const normal = (words: NormalEasyChatEntry[]): EasyChatGroup => ({
  wordDataKind: 'words',
  words,
  numWords: words.length,
  numEnabledWords: words.filter((word) => word.enabled).length
});
const values = (wordTokens: string[], constants: Map<string, number>): EasyChatGroup => {
  const valueList = tokenValues(wordTokens, constants);
  return {
    wordDataKind: 'valueList',
    values: valueList,
    numWords: valueList.length,
    numEnabledWords: valueList.length
  };
};

export const sEasyChatGroups: EasyChatGroup[] = [
  values(sEasyChatGroup_Pokemon, speciesConstants),
  normal(sEasyChatGroup_Trainer),
  normal(sEasyChatGroup_Status),
  normal(sEasyChatGroup_Battle),
  normal(sEasyChatGroup_Greetings),
  normal(sEasyChatGroup_People),
  normal(sEasyChatGroup_Voices),
  normal(sEasyChatGroup_Speech),
  normal(sEasyChatGroup_Endings),
  normal(sEasyChatGroup_Feelings),
  normal(sEasyChatGroup_Conditions),
  normal(sEasyChatGroup_Actions),
  normal(sEasyChatGroup_Lifestyle),
  normal(sEasyChatGroup_Hobbies),
  normal(sEasyChatGroup_Time),
  normal(sEasyChatGroup_Misc),
  normal(sEasyChatGroup_Adjectives),
  normal(sEasyChatGroup_Events),
  values(sEasyChatGroup_Move1, moveConstants),
  values(sEasyChatGroup_Move2, moveConstants),
  normal(sEasyChatGroup_TrendySaying),
  values(sEasyChatGroup_Pokemon2, speciesConstants)
];

export const createEasyChatRuntime = (overrides: Partial<EasyChatRuntime> = {}): EasyChatRuntime => ({
  sEasyChatSelectionData: null,
  gSpecialVar_0x8004: 0,
  gStringVar2: '',
  gStringVar4: '',
  shownMessages: [],
  randomValues: [],
  flags: new Set<number>(),
  nationalPokedexEnabled: false,
  seenNationalDexNums: new Set<number>(),
  gSaveBlock1Ptr: {
    easyChatProfile: Array.from({ length: 4 }, () => EC_WORD_UNDEFINED),
    easyChatBattleStart: Array.from({ length: 6 }, () => EC_WORD_UNDEFINED),
    easyChatBattleWon: Array.from({ length: 6 }, () => EC_WORD_UNDEFINED),
    easyChatBattleLost: Array.from({ length: 6 }, () => EC_WORD_UNDEFINED),
    mail: Array.from({ length: MAIL_COUNT }, () => ({ words: Array.from({ length: MAIL_WORDS_COUNT }, () => EC_WORD_UNDEFINED) })),
    additionalPhrases: Array.from({ length: 64 }, () => 0xff),
    questionnaireWords: Array.from({ length: NUM_QUESTIONNAIRE_WORDS }, () => 0),
    ...overrides.gSaveBlock1Ptr
  },
  allocationFails: false,
  ...overrides
});

const random = (runtime: EasyChatRuntime): number =>
  runtime.randomValues.length > 0 ? (runtime.randomValues.shift() ?? 0) >>> 0 : 0;

const flagGet = (runtime: EasyChatRuntime, flag: number): boolean => runtime.flags.has(flag);
const speciesToNationalPokedexNum = (species: number): number => species;
const getSetPokedexFlag = (runtime: EasyChatRuntime, dexNum: number): boolean => runtime.seenNationalDexNums.has(dexNum);
const getNationalPokedexCount = (runtime: EasyChatRuntime): number => runtime.seenNationalDexNums.size;

export const EC_IsNationalPokedexEnabled = (runtime: EasyChatRuntime): boolean => runtime.nationalPokedexEnabled;

export const IsECGroupUnlocked = (runtime: EasyChatRuntime, groupId: number): boolean => {
  switch (groupId) {
    case EC_GROUP_TRENDY_SAYING:
      return false;
    case EC_GROUP_EVENTS:
    case EC_GROUP_MOVE_1:
    case EC_GROUP_MOVE_2:
      return flagGet(runtime, FLAG_SYS_GAME_CLEAR);
    case EC_GROUP_POKEMON:
      return EC_IsNationalPokedexEnabled(runtime);
    default:
      return true;
  }
};

export const EasyChat_GetNumWordsInGroup = (runtime: EasyChatRuntime, groupId: number): number => {
  if (groupId === EC_GROUP_POKEMON) {
    return getNationalPokedexCount(runtime);
  }
  return IsECGroupUnlocked(runtime, groupId) ? sEasyChatGroups[groupId].numEnabledWords : 0;
};

export const IsECWordInvalid = (easyChatWord: number): boolean => {
  if (easyChatWord === EC_WORD_UNDEFINED) {
    return false;
  }
  const groupId = EC_GROUP(easyChatWord);
  const index = EC_INDEX(easyChatWord);
  if (groupId >= EC_NUM_GROUPS) {
    return true;
  }
  const group = sEasyChatGroups[groupId];
  if (group.wordDataKind === 'valueList') {
    return !group.values.includes(index);
  }
  return index >= group.numWords;
};

export const GetEasyChatWord = (groupId: number, index: number): string => {
  switch (groupId) {
    case EC_GROUP_POKEMON:
    case EC_GROUP_POKEMON_2:
      return speciesNameByValue.get(index) ?? '??????????';
    case EC_GROUP_MOVE_1:
    case EC_GROUP_MOVE_2:
      return moveNameByValue.get(index) ?? '????????';
    default:
      return sEasyChatGroups[groupId].wordDataKind === 'words'
        ? sEasyChatGroups[groupId].words[index]?.text ?? ''
        : '';
  }
};

export const CopyEasyChatWord = (easyChatWord: number): string => {
  if (IsECWordInvalid(easyChatWord)) {
    return '???';
  }
  if (easyChatWord !== EC_WORD_UNDEFINED) {
    return GetEasyChatWord(EC_GROUP(easyChatWord), EC_INDEX(easyChatWord));
  }
  return '';
};

export const ConvertEasyChatWordsToString = (
  src: number[],
  columns: number,
  rows: number
): string => {
  let dest = '';
  let offset = 0;
  const numColumns = columns - 1;
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < numColumns; j += 1) {
      dest += CopyEasyChatWord(src[offset]);
      if (src[offset] !== EC_WORD_UNDEFINED) {
        dest += ' ';
      }
      offset += 1;
    }
    dest += CopyEasyChatWord(src[offset]);
    offset += 1;
    dest += '\n';
  }
  return dest.slice(0, -1);
};

export const GetEasyChatWordStringLength = (easyChatWord: number): number =>
  easyChatWord === EC_WORD_UNDEFINED ? 0 : CopyEasyChatWord(easyChatWord).length;

export const EC_DoesEasyChatStringFitOnLine = (
  easyChatWords: number[],
  columns: number,
  rows: number,
  maxLength: number
): boolean => {
  let offset = 0;
  for (let i = 0; i < rows; i += 1) {
    let totalLength = columns - 1;
    for (let j = 0; j < columns; j += 1) {
      totalLength += GetEasyChatWordStringLength(easyChatWords[offset++]);
    }
    if (totalLength > maxLength) {
      return true;
    }
  }
  return false;
};

export const GetRandomWordFromGroup = (runtime: EasyChatRuntime, groupId: number): number => {
  const group = sEasyChatGroups[groupId];
  let index = random(runtime) % group.numWords;
  if (group.wordDataKind === 'valueList') {
    index = group.values[index];
  }
  return EC_WORD(groupId, index);
};

export const GetRandomECPokemon = (runtime: EasyChatRuntime): number => {
  let index = EasyChat_GetNumWordsInGroup(runtime, EC_GROUP_POKEMON_2);
  if (index === 0) {
    return EC_WORD_UNDEFINED;
  }
  index = random(runtime) % index;
  const group = sEasyChatGroups[EC_GROUP_POKEMON_2];
  if (group.wordDataKind !== 'valueList') {
    return EC_WORD_UNDEFINED;
  }
  for (const species of group.values) {
    if (getSetPokedexFlag(runtime, speciesToNationalPokedexNum(species))) {
      if (index) {
        index -= 1;
      } else {
        return EC_WORD(EC_GROUP_POKEMON_2, species);
      }
    }
  }
  return EC_WORD_UNDEFINED;
};

export const GetRandomWordFromAnyGroup = (runtime: EasyChatRuntime, groupId: number): number => {
  if (!IsECGroupUnlocked(runtime, groupId)) {
    return EC_WORD_UNDEFINED;
  }
  if (groupId === EC_GROUP_POKEMON) {
    return GetRandomECPokemon(runtime);
  }
  return GetRandomWordFromGroup(runtime, groupId);
};

export const ShowEasyChatMessage = (runtime: EasyChatRuntime): void => {
  let words: number[];
  let columns: number;
  let rows: number;
  switch (runtime.gSpecialVar_0x8004) {
    case 0:
      words = runtime.gSaveBlock1Ptr.easyChatProfile;
      columns = 2;
      rows = 2;
      break;
    case 1:
      words = runtime.gSaveBlock1Ptr.easyChatBattleStart;
      if (EC_DoesEasyChatStringFitOnLine(words, 3, 2, 18)) {
        columns = 2;
        rows = 3;
      } else {
        columns = 3;
        rows = 2;
      }
      break;
    case 2:
      words = runtime.gSaveBlock1Ptr.easyChatBattleWon;
      columns = 3;
      rows = 2;
      break;
    case 3:
      words = runtime.gSaveBlock1Ptr.easyChatBattleLost;
      columns = 3;
      rows = 2;
      break;
    default:
      return;
  }
  runtime.gStringVar4 = ConvertEasyChatWordsToString(words, columns, rows);
  runtime.shownMessages.push(runtime.gStringVar4);
};

export const BufferRandomHobbyOrLifestyleString = (runtime: EasyChatRuntime): void => {
  const groupId = (random(runtime) & 1) !== 0 ? EC_GROUP_HOBBIES : EC_GROUP_LIFESTYLE;
  runtime.gStringVar2 = CopyEasyChatWord(GetRandomWordFromAnyGroup(runtime, groupId));
};

export const IsTrendySayingUnlocked = (runtime: EasyChatRuntime, additionalPhraseId: number): boolean => {
  const byteOffset = Math.trunc(additionalPhraseId / 8);
  const shift = additionalPhraseId % 8;
  return ((runtime.gSaveBlock1Ptr.additionalPhrases[byteOffset] >> shift) & 1) !== 0;
};

export const EnableRareWord = (runtime: EasyChatRuntime, additionalPhraseId: number): void => {
  if (additionalPhraseId < 33) {
    runtime.gSaveBlock1Ptr.additionalPhrases[Math.trunc(additionalPhraseId / 8)] |= 1 << (additionalPhraseId % 8);
  }
};

export const GetNumUnlockedTrendySayings = (runtime: EasyChatRuntime): number => {
  let count = 0;
  for (let i = 0; i < 33; i += 1) {
    if (IsTrendySayingUnlocked(runtime, i)) {
      count += 1;
    }
  }
  return count;
};

export const UnlockRandomTrendySaying = (runtime: EasyChatRuntime): number => {
  const numUnlocked = GetNumUnlockedTrendySayings(runtime);
  if (numUnlocked === 33) {
    return EC_WORD_UNDEFINED;
  }
  let additionalPhraseId = random(runtime) % (33 - numUnlocked);
  for (let i = 0; i < 33; i += 1) {
    if (!IsTrendySayingUnlocked(runtime, i)) {
      if (additionalPhraseId) {
        additionalPhraseId -= 1;
      } else {
        EnableRareWord(runtime, i);
        return EC_WORD(EC_GROUP_TRENDY_SAYING, i);
      }
    }
  }
  return EC_WORD_UNDEFINED;
};

export const GetRandomUnlockedTrendySaying = (runtime: EasyChatRuntime): number => {
  let additionalPhraseId = GetNumUnlockedTrendySayings(runtime);
  if (additionalPhraseId === 0) {
    return EC_WORD_UNDEFINED;
  }
  additionalPhraseId = random(runtime) % additionalPhraseId;
  for (let i = 0; i < 33; i += 1) {
    if (IsTrendySayingUnlocked(runtime, i)) {
      if (additionalPhraseId) {
        additionalPhraseId -= 1;
      } else {
        return EC_WORD(EC_GROUP_TRENDY_SAYING, i);
      }
    }
  }
  return EC_WORD_UNDEFINED;
};

export const InitEasyChatPhrases = (runtime: EasyChatRuntime): void => {
  runtime.gSaveBlock1Ptr.easyChatProfile.splice(0, 4, EC_WORD_I_AM, EC_WORD_A, EC_WORD_POKEMON, EC_WORD_FRIEND);
  runtime.gSaveBlock1Ptr.easyChatBattleStart.splice(0, 6, EC_WORD_ARE, EC_WORD_YOU, EC_WORD_READY, EC_WORD_QUES, EC_WORD_HERE_I_COME, EC_WORD_EXCL);
  for (let i = 0; i < 6; i += 1) {
    runtime.gSaveBlock1Ptr.easyChatBattleWon[i] = EC_WORD_UNDEFINED;
    runtime.gSaveBlock1Ptr.easyChatBattleLost[i] = EC_WORD_UNDEFINED;
  }
  for (let i = 0; i < MAIL_COUNT; i += 1) {
    for (let j = 0; j < MAIL_WORDS_COUNT; j += 1) {
      runtime.gSaveBlock1Ptr.mail[i].words[j] = EC_WORD_UNDEFINED;
    }
  }
  for (let i = 0; i < 64; i += 1) {
    runtime.gSaveBlock1Ptr.additionalPhrases[i] = 0;
  }
};

export const InitQuestionnaireWords = (runtime: EasyChatRuntime): void => {
  for (let i = 0; i < NUM_QUESTIONNAIRE_WORDS; i += 1) {
    runtime.gSaveBlock1Ptr.questionnaireWords[i] = EC_WORD_UNDEFINED;
  }
};

const createSelectionData = (): EasyChatSelectionData => ({
  numGroups: 0,
  groups: [],
  alphabeticalGroups: Array.from({ length: 27 }, () => 0),
  alphabeticalWordsByGroup: Array.from({ length: 27 }, () => []),
  allWords: [],
  totalWords: 0
});

export const InitEasyChatSelection = (runtime: EasyChatRuntime): boolean => {
  if (runtime.allocationFails) {
    return false;
  }
  runtime.sEasyChatSelectionData = createSelectionData();
  PopulateECGroups(runtime);
  PopulateAlphabeticalGroups(runtime);
  return true;
};

export const DestroyEasyChatSelectionData = (runtime: EasyChatRuntime): void => {
  runtime.sEasyChatSelectionData = null;
};

export const PopulateECGroups = (runtime: EasyChatRuntime): void => {
  const data = runtime.sEasyChatSelectionData;
  if (!data) {
    return;
  }
  data.numGroups = 0;
  data.groups = [];
  if (getNationalPokedexCount(runtime)) {
    data.groups[data.numGroups++] = EC_GROUP_POKEMON;
  }
  for (let i = EC_GROUP_TRAINER; i <= EC_GROUP_ADJECTIVES; i += 1) {
    data.groups[data.numGroups++] = i;
  }
  if (flagGet(runtime, FLAG_SYS_GAME_CLEAR)) {
    data.groups[data.numGroups++] = EC_GROUP_EVENTS;
    data.groups[data.numGroups++] = EC_GROUP_MOVE_1;
    data.groups[data.numGroups++] = EC_GROUP_MOVE_2;
  }
  if (EC_IsNationalPokedexEnabled(runtime)) {
    data.groups[data.numGroups++] = EC_GROUP_POKEMON_2;
  }
};

export const GetNumDisplayableGroups = (runtime: EasyChatRuntime): number =>
  runtime.sEasyChatSelectionData?.numGroups ?? 0;

export const GetSelectedGroupByIndex = (runtime: EasyChatRuntime, index: number): number => {
  const data = runtime.sEasyChatSelectionData;
  if (!data || index >= data.numGroups) {
    return EC_NUM_GROUPS;
  }
  return data.groups[index];
};

export const GetEasyChatWordGroupName = (groupId: number): string => [
  'POKEMON',
  'TRAINER',
  'STATUS',
  'BATTLE',
  'GREETINGS',
  'PEOPLE',
  'VOICES',
  'SPEECH',
  'ENDINGS',
  'FEELINGS',
  'CONDITIONS',
  'ACTIONS',
  'LIFESTYLE',
  'HOBBIES',
  'TIME',
  'MISC.',
  'ADJECTIVES',
  'EVENTS',
  'MOVE 1',
  'MOVE 2',
  'TRENDY SAYING',
  'POKEMON'
][groupId] ?? '';

export const CopyEasyChatWordPadded = (easyChatWord: number, totalChars: number): string =>
  CopyEasyChatWord(easyChatWord).padEnd(totalChars, ' ');

export const BufferEasyChatWordGroupName = (_dest: string, groupId: number, totalChars: number): string =>
  GetEasyChatWordGroupName(groupId).padEnd(totalChars, ' ');

const tokenToWord = (token: string): number => {
  if (token === 'EC_WORD_UNDEFINED') {
    return EC_WORD_UNDEFINED;
  }
  const call = token.match(/^EC_WORD\(([^,]+),\s*([^)]+)\)$/u);
  if (call) {
    return EC_WORD(ecConstants.get(call[1]) ?? 0, ecConstants.get(call[2]) ?? Number(call[2]));
  }
  return ecConstants.get(token) ?? Number(token);
};

export const UnlockedECMonOrMove = (runtime: EasyChatRuntime, wordIndex: number, groupId: number): boolean => {
  const group = sEasyChatGroups[groupId];
  switch (groupId) {
    case EC_GROUP_POKEMON:
      return getSetPokedexFlag(runtime, speciesToNationalPokedexNum(wordIndex));
    case EC_GROUP_POKEMON_2:
      if (wordIndex === SPECIES_DEOXYS) {
        return getSetPokedexFlag(runtime, speciesToNationalPokedexNum(wordIndex));
      }
      return true;
    case EC_GROUP_MOVE_1:
    case EC_GROUP_MOVE_2:
      return true;
    default:
      return group.wordDataKind === 'words' ? group.words[wordIndex]?.enabled === true : false;
  }
};

export const IsGroupSelectable = (runtime: EasyChatRuntime, groupIdx: number): boolean =>
  runtime.sEasyChatSelectionData?.groups.includes(groupIdx) ?? false;

export const IsWordUnlocked = (runtime: EasyChatRuntime, easyChatWord: number): boolean => {
  const groupId = EC_GROUP(easyChatWord);
  const index = EC_INDEX(easyChatWord);
  return IsGroupSelectable(runtime, groupId) && UnlockedECMonOrMove(runtime, index, groupId);
};

export const PopulateAlphabeticalGroups = (runtime: EasyChatRuntime): void => {
  const data = runtime.sEasyChatSelectionData;
  if (!data) {
    return;
  }
  for (let i = 0; i < 27; i += 1) {
    const pointer = sEasyChatWordsByLetterPointers[i];
    const bucket = EASY_CHAT_WORDS_BY_LETTER_BUCKETS.find((entry) => entry.symbol === pointer.words);
    const tokens = bucket?.tokens ?? [];
    data.alphabeticalGroups[i] = 0;
    data.alphabeticalWordsByGroup[i] = [];
    for (let j = 0; j < tokens.length;) {
      if (tokens[j] === 'EC_WORD_UNDEFINED') {
        const numToProcess = Number(tokens[j + 1]);
        j += 2;
        for (let k = 0; k < numToProcess; k += 1) {
          const word = tokenToWord(tokens[j + k]);
          if (IsWordUnlocked(runtime, word)) {
            data.alphabeticalWordsByGroup[i].push(word);
            data.alphabeticalGroups[i] += 1;
            break;
          }
        }
        j += numToProcess;
      } else {
        const word = tokenToWord(tokens[j]);
        if (IsWordUnlocked(runtime, word)) {
          data.alphabeticalWordsByGroup[i].push(word);
          data.alphabeticalGroups[i] += 1;
        }
        j += 1;
      }
    }
  }
};

export const GetUnlockedWordsInECGroup = (runtime: EasyChatRuntime, groupId: number): number => {
  const data = runtime.sEasyChatSelectionData;
  if (!data) {
    return 0;
  }
  data.allWords = [];
  const group = sEasyChatGroups[groupId];
  if (group.wordDataKind === 'valueList') {
    for (const wordIndex of group.values) {
      if (UnlockedECMonOrMove(runtime, wordIndex, groupId)) {
        data.allWords.push(EC_WORD(groupId, wordIndex));
      }
    }
  } else {
    for (let i = 0; i < group.numWords; i += 1) {
      const alphabeticalOrder = group.words[i].alphabeticalOrder;
      if (UnlockedECMonOrMove(runtime, alphabeticalOrder, groupId)) {
        data.allWords.push(EC_WORD(groupId, alphabeticalOrder));
      }
    }
  }
  return data.allWords.length;
};

export const GetUnlockedWordsInAlphabeticalGroup = (runtime: EasyChatRuntime, alphabeticalGroup: number): number => {
  const data = runtime.sEasyChatSelectionData;
  if (!data) {
    return 0;
  }
  data.allWords = [...data.alphabeticalWordsByGroup[alphabeticalGroup]];
  return data.allWords.length;
};

export const GetUnlockedECWords = (runtime: EasyChatRuntime, isAlphabetical: boolean, groupId: number): void => {
  if (!runtime.sEasyChatSelectionData) {
    return;
  }
  runtime.sEasyChatSelectionData.totalWords = !isAlphabetical
    ? GetUnlockedWordsInECGroup(runtime, groupId)
    : GetUnlockedWordsInAlphabeticalGroup(runtime, groupId);
};

export const GetDisplayedWordByIndex = (runtime: EasyChatRuntime, index: number): number => {
  const data = runtime.sEasyChatSelectionData;
  if (!data || index >= data.totalWords) {
    return EC_WORD_UNDEFINED;
  }
  return data.allWords[index];
};

export const GetNumDisplayedWords = (runtime: EasyChatRuntime): number =>
  runtime.sEasyChatSelectionData?.totalWords ?? 0;

export const EC_IsDeoxys = (species: number): boolean => {
  for (let i = 0; i < sDeoxysValue.length; i++) {
    if (sDeoxysValue[i] === species) return true;
  }
  return false;
};
