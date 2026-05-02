import type { CoordEventWeatherId } from '../world/decompCoordEventWeather';

export interface FieldWeatherRuntimeState {
  vars: Record<string, number>;
  currentMapWeather?: CoordEventWeatherId | number;
}

export const GAME_STAT_GOT_RAINED_ON = 'gameStatGotRainedOn';

export const WEATHER_NONE = 0;
export const WEATHER_SUNNY_CLOUDS = 1;
export const WEATHER_SUNNY = 2;
export const WEATHER_RAIN = 3;
export const WEATHER_SNOW = 4;
export const WEATHER_RAIN_THUNDERSTORM = 5;
export const WEATHER_FOG_HORIZONTAL = 6;
export const WEATHER_VOLCANIC_ASH = 7;
export const WEATHER_SANDSTORM = 8;
export const WEATHER_FOG_DIAGONAL = 9;
export const WEATHER_UNDERWATER = 10;
export const WEATHER_SHADE = 11;
export const WEATHER_DROUGHT = 12;
export const WEATHER_DOWNPOUR = 13;
export const WEATHER_UNDERWATER_BUBBLES = 14;
export const WEATHER_ROUTE119_CYCLE = 20;
export const WEATHER_ROUTE123_CYCLE = 21;

const WEATHER_ID_TO_NUM = {
  WEATHER_NONE,
  WEATHER_SUNNY_CLOUDS,
  WEATHER_SUNNY,
  WEATHER_RAIN,
  WEATHER_SNOW,
  WEATHER_RAIN_THUNDERSTORM,
  WEATHER_FOG_HORIZONTAL,
  WEATHER_VOLCANIC_ASH,
  WEATHER_SANDSTORM,
  WEATHER_FOG_DIAGONAL,
  WEATHER_UNDERWATER,
  WEATHER_SHADE,
  WEATHER_DROUGHT,
  WEATHER_DOWNPOUR,
  WEATHER_UNDERWATER_BUBBLES,
  WEATHER_ROUTE119_CYCLE,
  WEATHER_ROUTE123_CYCLE
} as const satisfies Record<string, number>;

const WEATHER_NUM_TO_ID = new Map<number, keyof typeof WEATHER_ID_TO_NUM>(
  Object.entries(WEATHER_ID_TO_NUM).map(([weatherId, weatherNum]) => [weatherNum, weatherId as keyof typeof WEATHER_ID_TO_NUM])
);

const WEATHER_CYCLE_ROUTE119 = [
  WEATHER_SUNNY,
  WEATHER_RAIN,
  WEATHER_RAIN_THUNDERSTORM,
  WEATHER_RAIN
] as const;

const WEATHER_CYCLE_ROUTE123 = [
  WEATHER_SUNNY,
  WEATHER_SUNNY,
  WEATHER_RAIN,
  WEATHER_SUNNY
] as const;

const clampWeatherCycleStage = (value: number): number =>
  ((Math.trunc(value) % 4) + 4) % 4;

const normalizeWeatherValue = (weather: CoordEventWeatherId | number): number =>
  typeof weather === 'number'
    ? Math.trunc(weather)
    : WEATHER_ID_TO_NUM[weather] ?? WEATHER_NONE;

const updateRainCounter = (
  runtime: FieldWeatherRuntimeState,
  newWeather: number,
  oldWeather: number
): void => {
  if (
    newWeather !== oldWeather
    && (newWeather === WEATHER_RAIN || newWeather === WEATHER_RAIN_THUNDERSTORM)
  ) {
    runtime.vars[GAME_STAT_GOT_RAINED_ON] = Math.max(
      0,
      Math.trunc(runtime.vars[GAME_STAT_GOT_RAINED_ON] ?? 0)
    ) + 1;
  }
};

const translateWeatherNum = (
  runtime: FieldWeatherRuntimeState,
  weather: CoordEventWeatherId | number
): number => {
  switch (normalizeWeatherValue(weather)) {
    case WEATHER_NONE:
      return WEATHER_NONE;
    case WEATHER_SUNNY_CLOUDS:
      return WEATHER_SUNNY_CLOUDS;
    case WEATHER_SUNNY:
      return WEATHER_SUNNY;
    case WEATHER_RAIN:
      return WEATHER_RAIN;
    case WEATHER_SNOW:
      return WEATHER_SNOW;
    case WEATHER_RAIN_THUNDERSTORM:
      return WEATHER_RAIN_THUNDERSTORM;
    case WEATHER_FOG_HORIZONTAL:
      return WEATHER_FOG_HORIZONTAL;
    case WEATHER_VOLCANIC_ASH:
      return WEATHER_VOLCANIC_ASH;
    case WEATHER_SANDSTORM:
      return WEATHER_SANDSTORM;
    case WEATHER_FOG_DIAGONAL:
      return WEATHER_FOG_DIAGONAL;
    case WEATHER_UNDERWATER:
      return WEATHER_UNDERWATER;
    case WEATHER_SHADE:
      return WEATHER_SHADE;
    case WEATHER_DROUGHT:
      return WEATHER_DROUGHT;
    case WEATHER_DOWNPOUR:
      return WEATHER_DOWNPOUR;
    case WEATHER_UNDERWATER_BUBBLES:
      return WEATHER_UNDERWATER_BUBBLES;
    case WEATHER_ROUTE119_CYCLE:
      return WEATHER_CYCLE_ROUTE119[clampWeatherCycleStage(runtime.vars.weatherCycleStage ?? 0)];
    case WEATHER_ROUTE123_CYCLE:
      return WEATHER_CYCLE_ROUTE123[clampWeatherCycleStage(runtime.vars.weatherCycleStage ?? 0)];
    default:
      return WEATHER_NONE;
  }
};

export const getWeatherId = (weather: number): keyof typeof WEATHER_ID_TO_NUM =>
  WEATHER_NUM_TO_ID.get(Math.trunc(weather)) ?? 'WEATHER_NONE';

export const getSavedWeather = (runtime: FieldWeatherRuntimeState): number =>
  Math.trunc(runtime.vars.savedWeather ?? WEATHER_NONE);

export const getCurrentWeather = (runtime: FieldWeatherRuntimeState): number =>
  Math.trunc(runtime.vars.currentWeather ?? WEATHER_NONE);

export const getNextWeather = (runtime: FieldWeatherRuntimeState): number =>
  Math.trunc(runtime.vars.nextWeather ?? WEATHER_NONE);

export const setNextWeather = (
  runtime: FieldWeatherRuntimeState,
  weather: number
): void => {
  runtime.vars.nextWeather = Math.trunc(weather);
};

export const setCurrentAndNextWeather = (
  runtime: FieldWeatherRuntimeState,
  weather: number
): void => {
  const normalized = Math.trunc(weather);
  runtime.vars.currentWeather = normalized;
  runtime.vars.nextWeather = normalized;
};

export const setSavedWeather = (
  runtime: FieldWeatherRuntimeState,
  weather: CoordEventWeatherId | number
): void => {
  const oldWeather = getSavedWeather(runtime);
  const translatedWeather = translateWeatherNum(runtime, weather);
  runtime.vars.savedWeather = translatedWeather;
  updateRainCounter(runtime, translatedWeather, oldWeather);
};

export const setSavedWeatherFromCurrMapHeader = (
  runtime: FieldWeatherRuntimeState,
  weather: CoordEventWeatherId | undefined
): void => {
  setSavedWeather(runtime, weather ?? WEATHER_NONE);
};

export const setWeather = (
  runtime: FieldWeatherRuntimeState,
  weather: CoordEventWeatherId | number
): void => {
  setSavedWeather(runtime, weather);
  setNextWeather(runtime, getSavedWeather(runtime));
};

export const setWeatherUnused = (
  runtime: FieldWeatherRuntimeState,
  weather: CoordEventWeatherId | number
): void => {
  setSavedWeather(runtime, weather);
  setCurrentAndNextWeather(runtime, getSavedWeather(runtime));
};

export const doCurrentWeather = (runtime: FieldWeatherRuntimeState): void => {
  setNextWeather(runtime, getSavedWeather(runtime));
};

export const resumePausedWeather = (runtime: FieldWeatherRuntimeState): void => {
  setCurrentAndNextWeather(runtime, getSavedWeather(runtime));
};

export const updateWeatherPerDay = (
  runtime: FieldWeatherRuntimeState,
  increment: number
): void => {
  runtime.vars.weatherCycleStage = clampWeatherCycleStage(
    (runtime.vars.weatherCycleStage ?? 0) + Math.trunc(increment)
  );
};

export function SetSavedWeather(
  runtime: FieldWeatherRuntimeState,
  weather: CoordEventWeatherId | number
): void {
  setSavedWeather(runtime, weather);
}

export function GetSav1Weather(runtime: FieldWeatherRuntimeState): number {
  return getSavedWeather(runtime);
}

export function SetSavedWeatherFromCurrMapHeader(runtime: FieldWeatherRuntimeState): void {
  setSavedWeatherFromCurrMapHeader(runtime, runtime.currentMapWeather as CoordEventWeatherId | undefined);
}

export function SetWeather(
  runtime: FieldWeatherRuntimeState,
  weather: CoordEventWeatherId | number
): void {
  setWeather(runtime, weather);
}

export function SetWeather_Unused(
  runtime: FieldWeatherRuntimeState,
  weather: CoordEventWeatherId | number
): void {
  setWeatherUnused(runtime, weather);
}

export function DoCurrentWeather(runtime: FieldWeatherRuntimeState): void {
  doCurrentWeather(runtime);
}

export function ResumePausedWeather(runtime: FieldWeatherRuntimeState): void {
  resumePausedWeather(runtime);
}

export function TranslateWeatherNum(
  runtime: FieldWeatherRuntimeState,
  weather: CoordEventWeatherId | number
): number {
  return translateWeatherNum(runtime, weather);
}

export function UpdateWeatherPerDay(runtime: FieldWeatherRuntimeState, increment: number): void {
  updateWeatherPerDay(runtime, increment);
}

export function UpdateRainCounter(
  runtime: FieldWeatherRuntimeState,
  newWeather: number,
  oldWeather: number
): void {
  updateRainCounter(runtime, newWeather, oldWeather);
}
