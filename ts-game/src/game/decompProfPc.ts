import pokedexRatingTextSource from '../../../data/text/pokedex_rating.inc?raw';
import {
  FLAG_GET_CAUGHT,
  FLAG_GET_SEEN,
  getKantoPokedexCount,
  getNationalDexSpecies,
  getNationalPokedexCount
} from './decompPokedex';
import { isNationalDexEnabled } from './decompPokedexUi';

export interface ProfPcRuntimeState {
  pokedex: {
    seenSpecies: string[];
    caughtSpecies: string[];
  };
}

export interface ProfPcSpecialVars {
  gSpecialVar_0x8004: number;
  gSpecialVar_0x8005: number;
  gSpecialVar_0x8006: number;
  gSpecialVar_Result: boolean;
}

export interface ProfPcScriptRuntimeState extends ProfPcRuntimeState {
  specialVars: ProfPcSpecialVars;
  shownFieldMessages: ProfOaksRatingMessage[];
}

export interface ProfPcPokedexCountSummary {
  nationalDexEnabled: boolean;
  seenCount: number;
  ownedCount: number;
}

export interface ProfOaksRatingMessage {
  complete: boolean;
  symbol: string;
  pages: string[];
}

export interface ProfOaksRatingDialogue {
  pages: string[];
  kantoComplete: boolean;
  nationalComplete: boolean;
  nationalDexEnabled: boolean;
}

export const KANTO_DEX_COUNT = 151;

export const PROF_PC_C_TRANSLATION_UNIT = 'src/prof_pc.c';

const PAGE_BREAK = '\f';

const decodeIncText = (value: string): string =>
  value
    .replace(/\\n/gu, '\n')
    .replace(/\\l/gu, '\n')
    .replace(/\\p/gu, PAGE_BREAK);

const parseIncTextTable = (source: string): Map<string, string> => {
  const textTable = new Map<string, string>();
  const labelRegex = /^(\w+)::\n((?:\t\.string "[^"]*"\n?)*)/gmu;

  for (const match of source.matchAll(labelRegex)) {
    const symbol = match[1];
    const body = match[2];
    const fragments = [...body.matchAll(/\.string "([^"]*)"/gu)].map((part) => part[1]);
    textTable.set(symbol, decodeIncText(fragments.join('')));
  }

  return textTable;
};

const profPcTextTable = parseIncTextTable(pokedexRatingTextSource);

const getTextPages = (symbol: string, replacements: Record<string, string> = {}): string[] => {
  const raw = profPcTextTable.get(symbol) ?? '';
  const expanded = Object.entries(replacements).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    raw
  );
  return expanded
    .split(PAGE_BREAK)
    .map((page) => page.trim())
    .filter((page) => page.length > 0);
};

const getRatingSymbolByCount = (count: number, caughtSpecies: string[]): { symbol: string; complete: boolean } => {
  if (count < 10) {
    return { symbol: 'PokedexRating_Text_LessThan10', complete: false };
  }

  if (count < 20) {
    return { symbol: 'PokedexRating_Text_LessThan20', complete: false };
  }

  if (count < 30) {
    return { symbol: 'PokedexRating_Text_LessThan30', complete: false };
  }

  if (count < 40) {
    return { symbol: 'PokedexRating_Text_LessThan40', complete: false };
  }

  if (count < 50) {
    return { symbol: 'PokedexRating_Text_LessThan50', complete: false };
  }

  if (count < 60) {
    return { symbol: 'PokedexRating_Text_LessThan60', complete: false };
  }

  if (count < 70) {
    return { symbol: 'PokedexRating_Text_LessThan70', complete: false };
  }

  if (count < 80) {
    return { symbol: 'PokedexRating_Text_LessThan80', complete: false };
  }

  if (count < 90) {
    return { symbol: 'PokedexRating_Text_LessThan90', complete: false };
  }

  if (count < 100) {
    return { symbol: 'PokedexRating_Text_LessThan100', complete: false };
  }

  if (count < 110) {
    return { symbol: 'PokedexRating_Text_LessThan110', complete: false };
  }

  if (count < 120) {
    return { symbol: 'PokedexRating_Text_LessThan120', complete: false };
  }

  if (count < 130) {
    return { symbol: 'PokedexRating_Text_LessThan130', complete: false };
  }

  if (count < 140) {
    return { symbol: 'PokedexRating_Text_LessThan140', complete: false };
  }

  if (count < 150) {
    return { symbol: 'PokedexRating_Text_LessThan150', complete: false };
  }

  if (count === KANTO_DEX_COUNT - 1 && caughtSpecies.includes('MEW')) {
    return { symbol: 'PokedexRating_Text_LessThan150', complete: false };
  }

  if (count === KANTO_DEX_COUNT - 1 || count === KANTO_DEX_COUNT) {
    return { symbol: 'PokedexRating_Text_Complete', complete: true };
  }

  return { symbol: 'PokedexRating_Text_LessThan10', complete: false };
};

export const getProfPcPokedexCount = (
  runtime: ProfPcRuntimeState,
  useNationalDex = false
): ProfPcPokedexCountSummary => {
  const nationalDexEnabled = isNationalDexEnabled(runtime.pokedex.seenSpecies, runtime.pokedex.caughtSpecies);
  return {
    nationalDexEnabled,
    seenCount: useNationalDex
      ? getNationalPokedexCount(runtime, FLAG_GET_SEEN)
      : getKantoPokedexCount(runtime, FLAG_GET_SEEN),
    ownedCount: useNationalDex
      ? getNationalPokedexCount(runtime, FLAG_GET_CAUGHT)
      : getKantoPokedexCount(runtime, FLAG_GET_CAUGHT)
  };
};

export const createProfPcScriptRuntime = (
  runtime: ProfPcRuntimeState,
  specialVars: Partial<ProfPcSpecialVars> = {}
): ProfPcScriptRuntimeState => ({
  ...runtime,
  specialVars: {
    gSpecialVar_0x8004: 0,
    gSpecialVar_0x8005: 0,
    gSpecialVar_0x8006: 0,
    gSpecialVar_Result: false,
    ...specialVars
  },
  shownFieldMessages: []
});

export function GetPokedexCount(runtime: ProfPcScriptRuntimeState): number {
  if (runtime.specialVars.gSpecialVar_0x8004 === 0) {
    runtime.specialVars.gSpecialVar_0x8005 = getKantoPokedexCount(runtime, FLAG_GET_SEEN);
    runtime.specialVars.gSpecialVar_0x8006 = getKantoPokedexCount(runtime, FLAG_GET_CAUGHT);
  } else {
    runtime.specialVars.gSpecialVar_0x8005 = getNationalPokedexCount(runtime, FLAG_GET_SEEN);
    runtime.specialVars.gSpecialVar_0x8006 = getNationalPokedexCount(runtime, FLAG_GET_CAUGHT);
  }
  return isNationalDexEnabled(runtime.pokedex.seenSpecies, runtime.pokedex.caughtSpecies) ? 1 : 0;
}

export const getProfOaksRatingMessageByCount = (
  count: number,
  caughtSpecies: string[]
): ProfOaksRatingMessage => {
  const rating = getRatingSymbolByCount(count, caughtSpecies);
  return {
    complete: rating.complete,
    symbol: rating.symbol,
    pages: getTextPages(rating.symbol)
  };
};

export const GetProfOaksRatingMessageByCount = getProfOaksRatingMessageByCount;

export function GetProfOaksRatingMessage(runtime: ProfPcScriptRuntimeState): void {
  const message = getProfOaksRatingMessageByCount(
    runtime.specialVars.gSpecialVar_0x8004,
    runtime.pokedex.caughtSpecies
  );
  runtime.specialVars.gSpecialVar_Result = message.complete;
  runtime.shownFieldMessages.push(message);
}

export const getProfOaksRatingDialogue = (
  runtime: ProfPcRuntimeState,
  alreadySawDexCompletion = false
): ProfOaksRatingDialogue => {
  const kantoSummary = getProfPcPokedexCount(runtime, false);
  const kantoRating = getProfOaksRatingMessageByCount(kantoSummary.ownedCount, runtime.pokedex.caughtSpecies);
  const pages = [
    ...getTextPages(
      alreadySawDexCompletion
        ? 'PokedexRating_Text_LoveSeeingYourPokedex'
        : 'PokedexRating_Text_HowIsPokedexComingAlong'
    ),
    ...getTextPages('PokedexRating_Text_SeenXOwnedY', {
      STR_VAR_1: String(kantoSummary.seenCount),
      STR_VAR_2: String(kantoSummary.ownedCount)
    }),
    ...kantoRating.pages
  ];

  if (!kantoSummary.nationalDexEnabled) {
    return {
      pages,
      kantoComplete: kantoRating.complete,
      nationalComplete: false,
      nationalDexEnabled: false
    };
  }

  const nationalSummary = getProfPcPokedexCount(runtime, true);
  const nationalTotal = getNationalDexSpecies().length;
  const nationalComplete = nationalTotal > 0 && nationalSummary.ownedCount >= nationalTotal;

  pages.push(
    ...getTextPages('PokedexRating_Text_NationalDexSeenXOwnedY', {
      STR_VAR_1: String(nationalSummary.seenCount),
      STR_VAR_2: String(nationalSummary.ownedCount)
    }),
    ...getTextPages(
      nationalComplete
        ? 'PokedexRating_Text_YouveCompletedDex'
        : 'PokedexRating_Text_LookForwardToFilledNationalDex'
    )
  );

  return {
    pages,
    kantoComplete: kantoRating.complete,
    nationalComplete,
    nationalDexEnabled: true
  };
};
