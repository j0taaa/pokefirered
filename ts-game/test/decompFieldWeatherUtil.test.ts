import { describe, expect, test } from 'vitest';
import {
  DoCurrentWeather,
  doCurrentWeather,
  GAME_STAT_GOT_RAINED_ON,
  GetSav1Weather,
  getCurrentWeather,
  getNextWeather,
  getSavedWeather,
  getWeatherId,
  ResumePausedWeather,
  resumePausedWeather,
  SetSavedWeather,
  SetSavedWeatherFromCurrMapHeader,
  SetWeather,
  SetWeather_Unused,
  setSavedWeather,
  setSavedWeatherFromCurrMapHeader,
  setWeather,
  setWeatherUnused,
  TranslateWeatherNum,
  UpdateRainCounter,
  UpdateWeatherPerDay,
  updateWeatherPerDay,
  WEATHER_FOG_HORIZONTAL,
  WEATHER_NONE,
  WEATHER_RAIN,
  WEATHER_RAIN_THUNDERSTORM,
  WEATHER_ROUTE119_CYCLE,
  WEATHER_ROUTE123_CYCLE,
  WEATHER_SUNNY,
  type FieldWeatherRuntimeState
} from '../src/game/decompFieldWeatherUtil';

const createRuntime = (): FieldWeatherRuntimeState => ({
  vars: {} as Record<string, number>
});

describe('decomp field_weather_util', () => {
  test('stores translated saved weather and increments the rain stat on transitions into rain', () => {
    const runtime = createRuntime();

    setSavedWeather(runtime, 'WEATHER_SUNNY');
    expect(getSavedWeather(runtime)).toBe(WEATHER_SUNNY);
    expect(runtime.vars[GAME_STAT_GOT_RAINED_ON] ?? 0).toBe(0);

    setSavedWeather(runtime, 'WEATHER_RAIN');
    expect(getSavedWeather(runtime)).toBe(WEATHER_RAIN);
    expect(runtime.vars[GAME_STAT_GOT_RAINED_ON]).toBe(1);

    setSavedWeather(runtime, 'WEATHER_RAIN');
    expect(runtime.vars[GAME_STAT_GOT_RAINED_ON]).toBe(1);

    setSavedWeather(runtime, 'WEATHER_RAIN_THUNDERSTORM');
    expect(getSavedWeather(runtime)).toBe(WEATHER_RAIN_THUNDERSTORM);
    expect(runtime.vars[GAME_STAT_GOT_RAINED_ON]).toBe(2);
  });

  test('translates route weather cycles using weatherCycleStage', () => {
    const runtime = createRuntime();

    runtime.vars.weatherCycleStage = 2;
    setSavedWeather(runtime, WEATHER_ROUTE119_CYCLE);
    expect(getSavedWeather(runtime)).toBe(WEATHER_RAIN_THUNDERSTORM);

    runtime.vars.weatherCycleStage = 1;
    setSavedWeather(runtime, WEATHER_ROUTE123_CYCLE);
    expect(getSavedWeather(runtime)).toBe(WEATHER_SUNNY);

    updateWeatherPerDay(runtime, 3);
    expect(runtime.vars.weatherCycleStage).toBe(0);
  });

  test('matches current/next weather helper behavior', () => {
    const runtime = createRuntime();

    setSavedWeatherFromCurrMapHeader(runtime, 'WEATHER_FOG_HORIZONTAL');
    expect(getSavedWeather(runtime)).toBe(WEATHER_FOG_HORIZONTAL);

    doCurrentWeather(runtime);
    expect(getNextWeather(runtime)).toBe(WEATHER_FOG_HORIZONTAL);
    expect(getCurrentWeather(runtime)).toBe(0);

    resumePausedWeather(runtime);
    expect(getCurrentWeather(runtime)).toBe(WEATHER_FOG_HORIZONTAL);
    expect(getNextWeather(runtime)).toBe(WEATHER_FOG_HORIZONTAL);

    setWeather(runtime, 'WEATHER_SUNNY');
    expect(getSavedWeather(runtime)).toBe(WEATHER_SUNNY);
    expect(getNextWeather(runtime)).toBe(WEATHER_SUNNY);

    setWeatherUnused(runtime, 'WEATHER_RAIN');
    expect(getCurrentWeather(runtime)).toBe(WEATHER_RAIN);
    expect(getNextWeather(runtime)).toBe(WEATHER_RAIN);
  });

  test('round-trips saved weather ids for integration code', () => {
    expect(getWeatherId(WEATHER_SUNNY)).toBe('WEATHER_SUNNY');
    expect(getWeatherId(WEATHER_FOG_HORIZONTAL)).toBe('WEATHER_FOG_HORIZONTAL');
    expect(getWeatherId(255)).toBe('WEATHER_NONE');
  });

  test('exact C-name weather helpers preserve map-header, rain-stat, and current/next effects', () => {
    const runtime = createRuntime();

    expect(TranslateWeatherNum(runtime, 255)).toBe(WEATHER_NONE);
    runtime.vars.weatherCycleStage = 2;
    expect(TranslateWeatherNum(runtime, WEATHER_ROUTE119_CYCLE)).toBe(WEATHER_RAIN_THUNDERSTORM);

    SetSavedWeather(runtime, WEATHER_SUNNY);
    expect(GetSav1Weather(runtime)).toBe(WEATHER_SUNNY);
    UpdateRainCounter(runtime, WEATHER_RAIN, WEATHER_SUNNY);
    expect(runtime.vars[GAME_STAT_GOT_RAINED_ON]).toBe(1);
    UpdateRainCounter(runtime, WEATHER_RAIN, WEATHER_RAIN);
    expect(runtime.vars[GAME_STAT_GOT_RAINED_ON]).toBe(1);

    runtime.currentMapWeather = 'WEATHER_FOG_HORIZONTAL';
    SetSavedWeatherFromCurrMapHeader(runtime);
    expect(GetSav1Weather(runtime)).toBe(WEATHER_FOG_HORIZONTAL);

    DoCurrentWeather(runtime);
    expect(getNextWeather(runtime)).toBe(WEATHER_FOG_HORIZONTAL);
    expect(getCurrentWeather(runtime)).toBe(0);
    ResumePausedWeather(runtime);
    expect(getCurrentWeather(runtime)).toBe(WEATHER_FOG_HORIZONTAL);
    expect(getNextWeather(runtime)).toBe(WEATHER_FOG_HORIZONTAL);

    SetWeather(runtime, WEATHER_SUNNY);
    expect(GetSav1Weather(runtime)).toBe(WEATHER_SUNNY);
    expect(getNextWeather(runtime)).toBe(WEATHER_SUNNY);

    SetWeather_Unused(runtime, WEATHER_RAIN);
    expect(GetSav1Weather(runtime)).toBe(WEATHER_RAIN);
    expect(getCurrentWeather(runtime)).toBe(WEATHER_RAIN);
    expect(getNextWeather(runtime)).toBe(WEATHER_RAIN);

    runtime.vars.weatherCycleStage = 3;
    UpdateWeatherPerDay(runtime, 2);
    expect(runtime.vars.weatherCycleStage).toBe(1);
  });
});
