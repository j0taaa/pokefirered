import { describe, expect, test } from 'vitest';
import * as fieldWeather from '../src/game/decompFieldWeather';
import {
  BLDALPHA_BLEND,
  COORD_EVENT_WEATHER_FOG_DIAGONAL,
  COORD_EVENT_WEATHER_RAIN,
  COORD_EVENT_WEATHER_SHADE,
  FADE_FROM_BLACK,
  FADE_TO_BLACK,
  GAMMA_NONE,
  REG_OFFSET_BLDALPHA,
  RGB,
  RGB_BLACK,
  SE_DOWNPOUR,
  SE_DOWNPOUR_STOP,
  SE_RAIN,
  SE_RAIN_STOP,
  SE_THUNDERSTORM,
  SE_THUNDERSTORM_STOP,
  WEATHER_DROUGHT,
  WEATHER_FOG_DIAGONAL,
  WEATHER_FOG_HORIZONTAL,
  WEATHER_NONE,
  WEATHER_PAL_STATE_CHANGING_WEATHER,
  WEATHER_PAL_STATE_IDLE,
  WEATHER_PAL_STATE_SCREEN_FADING_IN,
  WEATHER_PAL_STATE_SCREEN_FADING_OUT,
  WEATHER_RAIN,
  WEATHER_SHADE,
  applyDroughtGammaShiftWithBlend,
  applyFogBlend,
  applyGammaShift,
  buildGammaShiftTables,
  createFieldWeatherRuntime,
  droughtStateInit,
  droughtStateRun,
  fadeInScreenFogHorizontal,
  fadeInScreenRainShowShade,
  fadeScreen,
  getCurrentWeather,
  isWeatherChangeComplete,
  isWeatherFadingIn,
  isWeatherNotFadingIn,
  lightenSpritePaletteInFog,
  loadCustomWeatherSpritePalette,
  loadDroughtWeatherPalettes,
  markFogSpritePalToLighten,
  playRainStoppingSoundEffect,
  preservePaletteInWeather,
  resetDroughtWeatherPaletteLoading,
  resetPreservedPalettesInWeather,
  setCurrentAndNextWeather,
  setCurrentAndNextWeatherNoDelay,
  setFieldWeather,
  setNextWeather,
  setRainStrengthFromSoundEffect,
  setWeatherScreenFadeOut,
  slightlyDarkenPalsInWeather,
  startWeather,
  taskWeatherInit,
  taskWeatherMain,
  updateSpritePaletteWithWeather,
  updateWeatherGammaShift,
  weatherBeginGammaFade,
  weatherProcessingIdle,
  weatherSetBlendCoeffs,
  weatherSetTargetBlendCoeffs,
  weatherShiftGammaIfPalStateIdle,
  weatherUpdateBlend
} from '../src/game/decompFieldWeather';

const fillPalettes = (runtime: ReturnType<typeof createFieldWeatherRuntime>): void => {
  for (let i = 0; i < runtime.gPlttBufferUnfaded.length; i++) {
    runtime.gPlttBufferUnfaded[i] = RGB(i & 31, (i + 7) & 31, (i + 13) & 31);
    runtime.gPlttBufferFaded[i] = RGB(31 - (i & 31), 0, 0);
  }
};

describe('decomp field_weather', () => {
  test('exports exact C field-weather names as aliases of the implemented logic', () => {
    expect(fieldWeather.StartWeather).toBe(fieldWeather.startWeather);
    expect(fieldWeather.SetNextWeather).toBe(fieldWeather.setNextWeather);
    expect(fieldWeather.SetCurrentAndNextWeather).toBe(fieldWeather.setCurrentAndNextWeather);
    expect(fieldWeather.SetCurrentAndNextWeatherNoDelay).toBe(fieldWeather.setCurrentAndNextWeatherNoDelay);
    expect(fieldWeather.Task_WeatherInit).toBe(fieldWeather.taskWeatherInit);
    expect(fieldWeather.Task_WeatherMain).toBe(fieldWeather.taskWeatherMain);
    expect(fieldWeather.None_Init).toBe(fieldWeather.noneInit);
    expect(fieldWeather.None_Main).toBe(fieldWeather.noneMain);
    expect(fieldWeather.None_Finish).toBe(fieldWeather.noneFinish);
    expect(fieldWeather.BuildGammaShiftTables).toBe(fieldWeather.buildGammaShiftTables);
    expect(fieldWeather.UpdateWeatherGammaShift).toBe(fieldWeather.updateWeatherGammaShift);
    expect(fieldWeather.FadeInScreenWithWeather).toBe(fieldWeather.fadeInScreenWithWeather);
    expect(fieldWeather.FadeInScreen_RainShowShade).toBe(fieldWeather.fadeInScreenRainShowShade);
    expect(fieldWeather.FadeInScreen_Drought).toBe(fieldWeather.fadeInScreenDrought);
    expect(fieldWeather.FadeInScreen_FogHorizontal).toBe(fieldWeather.fadeInScreenFogHorizontal);
    expect(fieldWeather.ApplyGammaShift).toBe(fieldWeather.applyGammaShift);
    expect(fieldWeather.ApplyGammaShiftWithBlend).toBe(fieldWeather.applyGammaShiftWithBlend);
    expect(fieldWeather.ApplyDroughtGammaShiftWithBlend).toBe(fieldWeather.applyDroughtGammaShiftWithBlend);
    expect(fieldWeather.ApplyFogBlend).toBe(fieldWeather.applyFogBlend);
    expect(fieldWeather.MarkFogSpritePalToLighten).toBe(fieldWeather.markFogSpritePalToLighten);
    expect(fieldWeather.LightenSpritePaletteInFog).toBe(fieldWeather.lightenSpritePaletteInFog);
    expect(fieldWeather.WeatherShiftGammaIfPalStateIdle).toBe(fieldWeather.weatherShiftGammaIfPalStateIdle);
    expect(fieldWeather.WeatherBeginGammaFade).toBe(fieldWeather.weatherBeginGammaFade);
    expect(fieldWeather.FadeScreen).toBe(fieldWeather.fadeScreen);
    expect(fieldWeather.FadeSelectedPals).toBe(fieldWeather.fadeSelectedPals);
    expect(fieldWeather.IsWeatherNotFadingIn).toBe(fieldWeather.isWeatherNotFadingIn);
    expect(fieldWeather.UpdateSpritePaletteWithWeather).toBe(fieldWeather.updateSpritePaletteWithWeather);
    expect(fieldWeather.ApplyWeatherGammaShiftToPal).toBe(fieldWeather.applyWeatherGammaShiftToPal);
    expect(fieldWeather.IsWeatherFadingIn).toBe(fieldWeather.isWeatherFadingIn);
    expect(fieldWeather.LoadCustomWeatherSpritePalette).toBe(fieldWeather.loadCustomWeatherSpritePalette);
    expect(fieldWeather.LoadDroughtWeatherPalette).toBe(fieldWeather.loadDroughtWeatherPalette);
    expect(fieldWeather.ResetDroughtWeatherPaletteLoading).toBe(fieldWeather.resetDroughtWeatherPaletteLoading);
    expect(fieldWeather.LoadDroughtWeatherPalettes).toBe(fieldWeather.loadDroughtWeatherPalettes);
    expect(fieldWeather.SetDroughtGamma).toBe(fieldWeather.setDroughtGamma);
    expect(fieldWeather.DroughtStateInit).toBe(fieldWeather.droughtStateInit);
    expect(fieldWeather.DroughtStateRun).toBe(fieldWeather.droughtStateRun);
    expect(fieldWeather.Weather_SetBlendCoeffs).toBe(fieldWeather.weatherSetBlendCoeffs);
    expect(fieldWeather.Weather_SetTargetBlendCoeffs).toBe(fieldWeather.weatherSetTargetBlendCoeffs);
    expect(fieldWeather.Weather_UpdateBlend).toBe(fieldWeather.weatherUpdateBlend);
    expect(fieldWeather.SetFieldWeather).toBe(fieldWeather.setFieldWeather);
    expect(fieldWeather.GetCurrentWeather).toBe(fieldWeather.getCurrentWeather);
    expect(fieldWeather.SetRainStrengthFromSoundEffect).toBe(fieldWeather.setRainStrengthFromSoundEffect);
    expect(fieldWeather.PlayRainStoppingSoundEffect).toBe(fieldWeather.playRainStoppingSoundEffect);
    expect(fieldWeather.IsWeatherChangeComplete).toBe(fieldWeather.isWeatherChangeComplete);
    expect(fieldWeather.SetWeatherScreenFadeOut).toBe(fieldWeather.setWeatherScreenFadeOut);
    expect(fieldWeather.WeatherProcessingIdle).toBe(fieldWeather.weatherProcessingIdle);
    expect(fieldWeather.PreservePaletteInWeather).toBe(fieldWeather.preservePaletteInWeather);
    expect(fieldWeather.ResetPreservedPalettesInWeather).toBe(fieldWeather.resetPreservedPalettesInWeather);
    expect(fieldWeather.SlightlyDarkenPalsInWeather).toBe(fieldWeather.slightlyDarkenPalsInWeather);
  });

  test('none weather and dummied drought palette helpers preserve exact C side effects', () => {
    const runtime = createFieldWeatherRuntime();
    runtime.weather.gammaTargetIndex = 4;
    runtime.weather.gammaStepDelay = 7;
    fieldWeather.None_Init(runtime);
    expect(runtime.weather.gammaTargetIndex).toBe(0);
    expect(runtime.weather.gammaStepDelay).toBe(0);
    expect(fieldWeather.None_Finish(runtime)).toBe(0);
    fieldWeather.LoadDroughtWeatherPalette(runtime);
    expect(runtime.weather.loadDroughtPalsIndex).toBe(0);
    fieldWeather.SetDroughtGamma(runtime, 2);
    expect(runtime.weather.gammaIndex).toBe(-3);
  });

  test('StartWeather initializes the C global fields, gamma tables, blend register, and task once main is inactive', () => {
    const runtime = createFieldWeatherRuntime();
    startWeather(runtime);

    expect(runtime.weather.altGammaSpritePalIndex).toBe(0);
    expect(runtime.weather.weatherPicSpritePalIndex).toBe(0);
    expect(runtime.weather.currWeather).toBe(WEATHER_NONE);
    expect(runtime.weather.palProcessingState).toBe(WEATHER_PAL_STATE_IDLE);
    expect(runtime.weather.weatherChangeComplete).toBe(true);
    expect(runtime.tasks).toEqual([{ func: 'Task_WeatherInit', priority: 80 }]);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(16, 0));
    expect(runtime.weather.gammaShifts[0].slice(0, 6)).toEqual([0, 0, 1, 2, 3, 4]);
    expect(runtime.weather.gammaShifts[3].slice(0, 6)).toEqual([0, 1, 2, 3, 4, 4]);
    expect(runtime.weather.altGammaShifts[0].slice(0, 6)).toEqual([0, 1, 2, 3, 4, 5]);

    runtime.tasks[0].func = 'Task_WeatherMain';
    startWeather(runtime);
    expect(runtime.tasks).toHaveLength(1);
  });

  test('SetNextWeather and weather tasks preserve finish/init/main ordering and completion flags', () => {
    const runtime = createFieldWeatherRuntime();
    startWeather(runtime);
    runtime.specialSEPlaying = true;
    setNextWeather(runtime, WEATHER_SHADE);
    expect(runtime.playedSoundEffects).toEqual([SE_RAIN_STOP]);
    expect(runtime.weather.weatherChangeComplete).toBe(false);
    expect(runtime.weather.finishStep).toBe(0);

    taskWeatherMain(runtime, runtime.weather.taskId);
    expect(runtime.operations.slice(-1)).toEqual(['Shade_InitVars']);
    expect(runtime.weather.currWeather).toBe(WEATHER_SHADE);
    expect(runtime.weather.weatherChangeComplete).toBe(true);

    runtime.operations = [];
    taskWeatherMain(runtime, runtime.weather.taskId);
    expect(runtime.operations).toEqual(['Shade_Main']);

    runtime.weather.readyForInit = true;
    taskWeatherInit(runtime, runtime.weather.taskId);
    expect(runtime.operations.at(-1)).toBe('Shade_InitAll');
    expect(runtime.tasks[runtime.weather.taskId].func).toBe('Task_WeatherMain');
  });

  test('gamma application, preservation, and fade stepping match the palette state machine', () => {
    const runtime = createFieldWeatherRuntime();
    fillPalettes(runtime);
    buildGammaShiftTables(runtime);

    applyGammaShift(runtime, 0, 1, 0);
    expect(Array.from(runtime.gPlttBufferFaded.slice(0, 16))).toEqual(Array.from(runtime.gPlttBufferUnfaded.slice(0, 16)));

    applyGammaShift(runtime, 0, 1, 3);
    expect(runtime.gPlttBufferFaded[5]).not.toBe(runtime.gPlttBufferUnfaded[5]);

    preservePaletteInWeather(runtime, 0);
    expect(runtime.sPaletteGammaTypes[0]).toBe(GAMMA_NONE);
    applyGammaShift(runtime, 0, 1, 3);
    expect(Array.from(runtime.gPlttBufferFaded.slice(0, 16))).toEqual(Array.from(runtime.gPlttBufferUnfaded.slice(0, 16)));
    resetPreservedPalettesInWeather(runtime);

    runtime.weather.palProcessingState = WEATHER_PAL_STATE_IDLE;
    weatherShiftGammaIfPalStateIdle(runtime, 2);
    expect(runtime.weather.gammaIndex).toBe(2);
    weatherBeginGammaFade(runtime, 2, 4, 0);
    expect(runtime.weather.palProcessingState).toBe(WEATHER_PAL_STATE_CHANGING_WEATHER);
    expect(runtime.weather.gammaIndex).toBe(2);
    updateWeatherGammaShift(runtime);
    expect(runtime.weather.gammaIndex).toBe(3);
    updateWeatherGammaShift(runtime);
    expect(runtime.weather.gammaIndex).toBe(4);
    updateWeatherGammaShift(runtime);
    expect(runtime.weather.palProcessingState).toBe(WEATHER_PAL_STATE_IDLE);
  });

  test('screen fades branch between normal palette fade and weather-managed fade exactly', () => {
    const runtime = createFieldWeatherRuntime();
    fillPalettes(runtime);

    runtime.weather.currWeather = WEATHER_FOG_DIAGONAL;
    fadeScreen(runtime, FADE_FROM_BLACK, 3);
    expect(runtime.operations).toEqual([`BeginNormalPaletteFade(${0xffffffff}, 3, 16, 0, ${RGB_BLACK})`]);
    expect(runtime.weather.palProcessingState).toBe(WEATHER_PAL_STATE_SCREEN_FADING_IN);
    expect(runtime.weather.readyForInit).toBe(true);
    expect(isWeatherNotFadingIn(runtime)).toBe(false);
    expect(isWeatherFadingIn(runtime)).toBe(1);

    runtime.operations = [];
    runtime.weather.currWeather = WEATHER_RAIN;
    fadeScreen(runtime, FADE_FROM_BLACK, 0);
    expect(runtime.operations).toEqual([]);
    expect(runtime.weather.fadeScreenCounter).toBe(0);
    expect(runtime.weather.fadeInActive).toBe(1);

    runtime.gPlttBufferFaded[0] = RGB(9, 8, 7);
    fadeScreen(runtime, FADE_TO_BLACK, 2);
    expect(runtime.gPlttBufferUnfaded[0]).toBe(RGB(9, 8, 7));
    expect(runtime.operations).toEqual([`BeginNormalPaletteFade(${0xffffffff}, 2, 0, 16, ${RGB_BLACK})`]);
    expect(runtime.weather.palProcessingState).toBe(WEATHER_PAL_STATE_SCREEN_FADING_OUT);
  });

  test('rain/shade, fog, and drought fade helpers keep their C edge cases', () => {
    const runtime = createFieldWeatherRuntime();
    fillPalettes(runtime);
    buildGammaShiftTables(runtime);
    runtime.weather.fadeDestColor = RGB_BLACK;

    for (let i = 0; i < 15; i++) {
      expect(fadeInScreenRainShowShade(runtime)).toBe(true);
    }
    expect(fadeInScreenRainShowShade(runtime)).toBe(false);
    expect(runtime.weather.fadeScreenCounter).toBe(16);

    runtime.weather.fadeScreenCounter = 15;
    expect(fadeInScreenFogHorizontal(runtime)).toBe(true);
    expect(runtime.weather.fadeScreenCounter).toBe(16);
    expect(fadeInScreenFogHorizontal(runtime)).toBe(false);

    runtime.weather.fadeScreenCounter = 0;
    const before = runtime.gPlttBufferFaded[0];
    applyDroughtGammaShiftWithBlend(runtime, -6, 8, RGB(31, 31, 31));
    expect(runtime.gPlttBufferFaded[0]).not.toBe(before);
    applyGammaShift(runtime, 0, 32, -6);
    expect(runtime.gPlttBufferFaded[0]).not.toBe(0xffff);
  });

  test('fog sprite palette tracking and custom palette updates follow the active fade state', () => {
    const runtime = createFieldWeatherRuntime();
    fillPalettes(runtime);
    buildGammaShiftTables(runtime);

    markFogSpritePalToLighten(runtime, 17);
    markFogSpritePalToLighten(runtime, 18);
    expect(lightenSpritePaletteInFog(runtime, 17)).toBe(true);
    applyFogBlend(runtime, 0, RGB_BLACK);
    expect(runtime.gPlttBufferFaded[17 * 16]).toBe(RGB(25, 29, 28));

    runtime.weather.currWeather = WEATHER_FOG_HORIZONTAL;
    runtime.weather.palProcessingState = WEATHER_PAL_STATE_SCREEN_FADING_IN;
    runtime.weather.fadeInActive = 1;
    runtime.weather.fadeDestColor = RGB(1, 2, 3);
    updateSpritePaletteWithWeather(runtime, 2);
    expect(lightenSpritePaletteInFog(runtime, 18)).toBe(true);
    expect(Array.from(runtime.gPlttBufferFaded.slice(18 * 16, 18 * 16 + 16))).toEqual(Array(16).fill(RGB(1, 2, 3)));

    runtime.weather.weatherPicSpritePalIndex = 1;
    loadCustomWeatherSpritePalette(runtime, Array(16).fill(RGB(5, 6, 7)));
    expect(runtime.gPlttBufferUnfaded[0x100 + 16]).toBe(RGB(5, 6, 7));
  });

  test('drought loader, drought state, and blend coeff routines preserve C timing', () => {
    const runtime = createFieldWeatherRuntime();
    resetDroughtWeatherPaletteLoading(runtime);
    expect(runtime.weather.loadDroughtPalsIndex).toBe(1);
    expect(loadDroughtWeatherPalettes(runtime)).toBe(true);
    expect(runtime.weather.loadDroughtPalsIndex).toBe(1);

    droughtStateInit(runtime);
    expect(runtime.sDroughtFrameDelay).toBe(5);
    for (let i = 0; i < 36; i++) {
      droughtStateRun(runtime);
    }
    expect(runtime.weather.droughtState).toBe(1);
    expect(runtime.weather.droughtTimer).toBe(60);

    weatherSetBlendCoeffs(runtime, 16, 0);
    weatherSetTargetBlendCoeffs(runtime, 14, 2, 0);
    expect(weatherUpdateBlend(runtime)).toBe(false);
    expect(runtime.weather.currBlendEVA).toBe(15);
    expect(runtime.weather.currBlendEVB).toBe(0);
    expect(weatherUpdateBlend(runtime)).toBe(false);
    expect(runtime.weather.currBlendEVB).toBe(1);
    while (!weatherUpdateBlend(runtime)) {
      expect(runtime.weather.currBlendEVA).toBeGreaterThanOrEqual(14);
    }
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDALPHA)).toBe(BLDALPHA_BLEND(14, 2));
  });

  test('weather mapping, rain sounds, flags, and darkening helpers match exported C routines', () => {
    const runtime = createFieldWeatherRuntime();
    setFieldWeather(runtime, COORD_EVENT_WEATHER_RAIN);
    setFieldWeather(runtime, COORD_EVENT_WEATHER_FOG_DIAGONAL);
    setFieldWeather(runtime, COORD_EVENT_WEATHER_SHADE);
    expect(runtime.savedWeatherCalls).toEqual([WEATHER_RAIN, WEATHER_FOG_DIAGONAL, WEATHER_SHADE]);

    setCurrentAndNextWeather(runtime, WEATHER_RAIN);
    expect(getCurrentWeather(runtime)).toBe(WEATHER_RAIN);
    setCurrentAndNextWeatherNoDelay(runtime, WEATHER_FOG_HORIZONTAL);
    expect(runtime.weather.readyForInit).toBe(true);

    setRainStrengthFromSoundEffect(runtime, SE_DOWNPOUR);
    expect(runtime.weather.rainStrength).toBe(1);
    expect(runtime.playedSoundEffects).toEqual([SE_DOWNPOUR]);
    runtime.weather.palProcessingState = WEATHER_PAL_STATE_SCREEN_FADING_OUT;
    setRainStrengthFromSoundEffect(runtime, SE_THUNDERSTORM);
    expect(runtime.weather.rainStrength).toBe(1);

    runtime.specialSEPlaying = true;
    playRainStoppingSoundEffect(runtime);
    runtime.weather.rainStrength = 0;
    playRainStoppingSoundEffect(runtime);
    runtime.weather.rainStrength = 2;
    playRainStoppingSoundEffect(runtime);
    expect(runtime.playedSoundEffects.slice(-3)).toEqual([SE_DOWNPOUR_STOP, SE_RAIN_STOP, SE_THUNDERSTORM_STOP]);

    setNextWeather(runtime, WEATHER_DROUGHT);
    expect(isWeatherChangeComplete(runtime)).toBe(false);
    setWeatherScreenFadeOut(runtime);
    expect(runtime.weather.palProcessingState).toBe(WEATHER_PAL_STATE_SCREEN_FADING_OUT);
    weatherProcessingIdle(runtime);
    expect(runtime.weather.palProcessingState).toBe(WEATHER_PAL_STATE_IDLE);

    const palbuf = new Uint16Array([RGB(16, 16, 16), RGB(4, 8, 12)]);
    runtime.weather.currWeather = WEATHER_SHADE;
    slightlyDarkenPalsInWeather(runtime, palbuf, undefined, 2);
    expect(Array.from(palbuf)).toEqual([RGB(13, 13, 13), RGB(3, 6, 9)]);

    runtime.weather.currWeather = WEATHER_DROUGHT;
    const unchanged = palbuf[0];
    slightlyDarkenPalsInWeather(runtime, palbuf, undefined, 2);
    expect(palbuf[0]).toBe(unchanged);

    setRainStrengthFromSoundEffect(runtime, SE_RAIN);
    expect(runtime.weather.rainStrength).toBe(0);
  });
});
