export const NATURE_HARDY = 0;
export const NATURE_LONELY = 1;
export const NATURE_BRAVE = 2;
export const NATURE_ADAMANT = 3;
export const NATURE_NAUGHTY = 4;
export const NATURE_BOLD = 5;
export const NATURE_DOCILE = 6;
export const NATURE_RELAXED = 7;
export const NATURE_IMPISH = 8;
export const NATURE_LAX = 9;
export const NATURE_TIMID = 10;
export const NATURE_HASTY = 11;
export const NATURE_SERIOUS = 12;
export const NATURE_JOLLY = 13;
export const NATURE_NAIVE = 14;
export const NATURE_MODEST = 15;
export const NATURE_MILD = 16;
export const NATURE_QUIET = 17;
export const NATURE_BASHFUL = 18;
export const NATURE_RASH = 19;
export const NATURE_CALM = 20;
export const NATURE_GENTLE = 21;
export const NATURE_SASSY = 22;
export const NATURE_CAREFUL = 23;
export const NATURE_QUIRKY = 24;
export const NUM_NATURES = 25;

export type NatureId =
  | typeof NATURE_HARDY
  | typeof NATURE_LONELY
  | typeof NATURE_BRAVE
  | typeof NATURE_ADAMANT
  | typeof NATURE_NAUGHTY
  | typeof NATURE_BOLD
  | typeof NATURE_DOCILE
  | typeof NATURE_RELAXED
  | typeof NATURE_IMPISH
  | typeof NATURE_LAX
  | typeof NATURE_TIMID
  | typeof NATURE_HASTY
  | typeof NATURE_SERIOUS
  | typeof NATURE_JOLLY
  | typeof NATURE_NAIVE
  | typeof NATURE_MODEST
  | typeof NATURE_MILD
  | typeof NATURE_QUIET
  | typeof NATURE_BASHFUL
  | typeof NATURE_RASH
  | typeof NATURE_CALM
  | typeof NATURE_GENTLE
  | typeof NATURE_SASSY
  | typeof NATURE_CAREFUL
  | typeof NATURE_QUIRKY;

export const sHardyNatureName = 'HARDY';
export const sLonelyNatureName = 'LONELY';
export const sBraveNatureName = 'BRAVE';
export const sAdamantNatureName = 'ADAMANT';
export const sNaughtyNatureName = 'NAUGHTY';
export const sBoldNatureName = 'BOLD';
export const sDocileNatureName = 'DOCILE';
export const sRelaxedNatureName = 'RELAXED';
export const sImpishNatureName = 'IMPISH';
export const sLaxNatureName = 'LAX';
export const sTimidNatureName = 'TIMID';
export const sHastyNatureName = 'HASTY';
export const sSeriousNatureName = 'SERIOUS';
export const sJollyNatureName = 'JOLLY';
export const sNaiveNatureName = 'NAIVE';
export const sModestNatureName = 'MODEST';
export const sMildNatureName = 'MILD';
export const sQuietNatureName = 'QUIET';
export const sBashfulNatureName = 'BASHFUL';
export const sRashNatureName = 'RASH';
export const sCalmNatureName = 'CALM';
export const sGentleNatureName = 'GENTLE';
export const sSassyNatureName = 'SASSY';
export const sCarefulNatureName = 'CAREFUL';
export const sQuirkyNatureName = 'QUIRKY';

export const gNatureNamePointers: readonly string[] = [
  sHardyNatureName,
  sLonelyNatureName,
  sBraveNatureName,
  sAdamantNatureName,
  sNaughtyNatureName,
  sBoldNatureName,
  sDocileNatureName,
  sRelaxedNatureName,
  sImpishNatureName,
  sLaxNatureName,
  sTimidNatureName,
  sHastyNatureName,
  sSeriousNatureName,
  sJollyNatureName,
  sNaiveNatureName,
  sModestNatureName,
  sMildNatureName,
  sQuietNatureName,
  sBashfulNatureName,
  sRashNatureName,
  sCalmNatureName,
  sGentleNatureName,
  sSassyNatureName,
  sCarefulNatureName,
  sQuirkyNatureName
];

export const getNatureName = (nature: NatureId): string => gNatureNamePointers[nature];
