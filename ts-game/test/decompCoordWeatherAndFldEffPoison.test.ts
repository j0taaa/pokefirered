import { describe, expect, it } from 'vitest';
import {
  DoCoordEventWeather,
  WEATHER_FOG_DIAGONAL,
  WEATHER_RAIN_THUNDERSTORM,
  WEATHER_ROUTE123_CYCLE,
  WEATHER_SANDSTORM,
  WEATHER_SHADE,
  WEATHER_SNOW,
  WEATHER_SUNNY,
  WEATHER_SUNNY_CLOUDS,
  WeatherCoordEvent_Rain,
  createCoordEventWeatherRuntime
} from '../src/game/decompCoordEventWeather';
import {
  BG_MOSAIC_SET,
  FldEffPoison_IsActive,
  FldEffPoison_Start,
  SE_FIELD_POISON,
  Task_FieldPoisonEffect,
  createFldEffPoisonRuntime
} from '../src/game/decompFldEffPoison';

describe('coord_event_weather and fldeff_poison ports', () => {
  it('dispatches weather coordinate events through the exact C table and ignores unknown ids', () => {
    const runtime = createCoordEventWeatherRuntime();

    DoCoordEventWeather(WEATHER_SUNNY_CLOUDS, runtime);
    DoCoordEventWeather(WEATHER_SUNNY, runtime);
    DoCoordEventWeather(WEATHER_SNOW, runtime);
    DoCoordEventWeather(WEATHER_RAIN_THUNDERSTORM, runtime);
    DoCoordEventWeather(WEATHER_SANDSTORM, runtime);
    DoCoordEventWeather(WEATHER_FOG_DIAGONAL, runtime);
    DoCoordEventWeather(WEATHER_SHADE, runtime);
    DoCoordEventWeather(WEATHER_ROUTE123_CYCLE, runtime);
    DoCoordEventWeather(0xff, runtime);
    WeatherCoordEvent_Rain(runtime);

    expect(runtime.callbacks).toEqual([
      'WeatherCoordEvent_SunnyClouds',
      'WeatherCoordEvent_Sunny',
      'WeatherCoordEvent_Snow',
      'WeatherCoordEvent_RainThunderstorm',
      'WeatherCoordEvent_Sandstorm',
      'WeatherCoordEvent_FogDiagonal',
      'WeatherCoordEvent_Shade',
      'WeatherCoordEvent_Route123Cycle',
      'WeatherCoordEvent_Rain'
    ]);
  });

  it('runs fldeff_poison task phases and mosaic writes like the C state machine', () => {
    const runtime = createFldEffPoisonRuntime();

    FldEffPoison_Start(runtime);
    expect(runtime.operations).toEqual([`PlaySE:${SE_FIELD_POISON}`, 'CreateTask:Task_FieldPoisonEffect:80']);
    expect(FldEffPoison_IsActive(runtime)).toBe(true);

    Task_FieldPoisonEffect(runtime, 0);
    expect(runtime.tasks[0].data).toEqual([0, 1]);
    expect(runtime.bgMosaic).toBe(0x11);
    expect(runtime.operations.at(-1)).toBe(`AdjustBgMosaic:17:${BG_MOSAIC_SET}`);

    Task_FieldPoisonEffect(runtime, 0);
    Task_FieldPoisonEffect(runtime, 0);
    Task_FieldPoisonEffect(runtime, 0);
    Task_FieldPoisonEffect(runtime, 0);
    expect(runtime.tasks[0].data).toEqual([1, 5]);

    for (let i = 0; i < 5; i += 1) Task_FieldPoisonEffect(runtime, 0);
    expect(runtime.tasks[0].data).toEqual([2, 0]);
    Task_FieldPoisonEffect(runtime, 0);
    expect(runtime.tasks[0].destroyed).toBe(true);
    expect(FldEffPoison_IsActive(runtime)).toBe(false);
  });

  it('uses the FRLG revision A faster poison mosaic ramp', () => {
    const runtime = createFldEffPoisonRuntime({ revision: 0xa });

    FldEffPoison_Start(runtime);
    Task_FieldPoisonEffect(runtime, 0);
    expect(runtime.tasks[0].data).toEqual([0, 2]);
    expect(runtime.bgMosaic).toBe(0x22);

    Task_FieldPoisonEffect(runtime, 0);
    Task_FieldPoisonEffect(runtime, 0);
    expect(runtime.tasks[0].data).toEqual([1, 6]);
  });
});
